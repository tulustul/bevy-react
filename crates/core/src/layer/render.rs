//! Render-world half of layer compositing — a custom pass over stock
//! `bevy_ui_render`, public API only (no fork). Mechanism per frame:
//!
//! 1. [`extract_ui_layers`] (`ExtractSchedule`, after
//!    `extract_ui_camera_view`): per promoted layer, spawn a **synthetic view**
//!    whose `clip_from_view` is an orthographic projection over the layer's
//!    capture rect — the same physical screen space stock UI vertices live in —
//!    and register an empty `TransparentUi` phase for it. Stock extraction /
//!    queue never know it exists.
//! 2. [`redistribute_ui_layers`] (`PhaseSort`, before the stock sort): move
//!    the already-queued phase items whose `main_entity` lies in a promoted
//!    subtree, **verbatim**, from the camera's UI phase into their layer's
//!    synthetic phase — stock `prepare_uinodes` (and sibling prepares) iterate
//!    *all* phases, so the moved items are batched by stock code against the
//!    synthetic view's `ViewUniformOffset`. Then inject one composite-quad
//!    item per layer at the position of its first stolen item.
//! 3. [`ui_layer_capture_pass`] (`Core2d`/`Core3d`, before `ui_pass`): render
//!    each synthetic phase into the layer's offscreen texture (cleared
//!    transparent). Straight-alpha blending onto transparent black accumulates
//!    **premultiplied** color, so…
//! 4. …a layer with a `filter` chain then replays its staged filter run
//!    (same graph node, right after that layer's capture): fullscreen passes
//!    capture → ping-pong textures ([`LayerFilterMeta::runs`], staged by
//!    [`prepare_layer_filters`]), all of them or none — an uncompiled pass
//!    pipeline aborts the whole run and [`FilterSlot::output_valid`] stays
//!    false, so the layer restages and retries next frame. And…
//! 5. …a layer with the `TRANSFORM3D` promotion reason replays its staged
//!    mip-downsample chain last in the iteration ([`mips`]) — its sampled
//!    texture (capture, or filter output) carries a full mip chain, rebuilt
//!    only when level 0 was rewritten. Finally…
//! 6. …the composite quad ([`DrawLayerComposite`], drawn inside the stock
//!    `ui_pass` at the subtree's stacking position) samples the capture — or,
//!    for a filtered layer, the final filter pass's output — with
//!    premultiplied blending (`One`/`OneMinusSrcAlpha`) and multiplies rgb
//!    *and* alpha by the group alpha. 3D-transformed quads sample trilinear +
//!    anisotropic over the mip chain (minification shimmer) and feather ~1px
//!    of coverage at their silhouette (`composite.wgsl`'s edge AA — diagonal
//!    edges rasterize without MSAA).
//!
//! Re-verify on Bevy upgrades (spike checklist): `TransparentUi` field set,
//! `SortedRenderPhase::{items, transient_items}` visibility, `prepare_uinodes`
//! iterating all phases, `ViewSortedRenderPhases::prepare_for_new_frame`
//! draining transients, straight `ALPHA_BLENDING` in `UiPipeline`, the
//! `Queue → PhaseSort → PrepareBindGroups` schedule shape, naga_oil NOT
//! re-exporting an import's entry points (the split-stage filter pipelines
//! rely on pass shaders having no vertex entry of their own), naga's namer
//! renaming digit-suffixed identifiers (the `pad_a`/`pad_b` constraint in
//! composable WGSL modules), and wgpu accepting per-stage shader modules in
//! `RenderPipelineDescriptor` (filter vertex stage = prelude module, fragment
//! stage = pass module).

pub mod clip;
pub mod mips;
pub mod store;
pub mod transform3d;

pub use store::*;

use std::ops::Range;

use bevy::asset::{AssetServer, Handle};
use bevy::camera::{Camera, Camera2d, Camera3d};
use bevy::ecs::system::SystemParamItem;
use bevy::ecs::system::lifetimeless::SRes;
use bevy::math::{FloatOrd, Mat4, UVec4};
use bevy::mesh::VertexBufferLayout;
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::render::Extract;
use bevy::render::camera::CameraMainPassTextureFormats;
use bevy::render::render_phase::{
    DrawFunctions, PhaseItem, PhaseItemExtraIndex, RenderCommand, RenderCommandResult,
    SetItemPipeline, TrackedRenderPass, ViewSortedRenderPhases,
};
use bevy::render::render_resource::binding_types::{sampler, texture_2d, uniform_buffer};
use bevy::render::render_resource::*;
use bevy::render::renderer::{RenderContext, RenderDevice, RenderQueue, ViewQuery};
use bevy::render::sync_world::{MainEntity, RenderEntity, TemporaryRenderEntity};
use bevy::render::view::{ExtractedView, RetainedViewEntity, ViewUniform};
use bevy::shader::Shader;
use bevy::shader::ShaderCacheError;
use bevy::ui::ComputedUiTargetCamera;
use bevy::ui_render::{SetUiViewBindGroup, TransparentUi, stack_z_offsets};

use super::{LayerCaptureRect, LayerGroupAlpha, LayerMembership, PromotedLayer};
use crate::filters::{MAX_FILTER_PARAM_VECS, ResolvedFilterChain};

/// Matches the private `bevy_ui_render::UI_CAMERA_FAR` (the stock UI ortho
/// far plane / view z) so synthetic views project identically to the stock
/// UI view.
const UI_CAMERA_FAR: f32 = 1000.0;
/// Matches the private `bevy_ui_render::UI_CAMERA_TRANSFORM_OFFSET`.
const UI_CAMERA_TRANSFORM_OFFSET: f32 = -0.1;
/// Stock UI views use subview 1 on the *camera's* main entity; layer capture
/// views key off the *layer root's* main entity, so any constant would be
/// collision-free — a distinct one keeps `RetainedViewEntity` debugging sane.
const UI_LAYER_CAPTURE_SUBVIEW: u32 = 2;
/// Cycle/depth guard for enclosing-chain walks ([`walk_enclosing`] and the
/// capture-order depth computation): `enclosing` is acyclic by construction,
/// so a chain longer than this is a bug, not a real hierarchy — walks stop
/// rather than spin.
const MAX_LAYER_DEPTH: usize = 64;
/// Consecutive gated frames ([`FilterSlot::gated_frames`]) before the stuck
/// composite gate warns about a pipeline that is *still compiling*. A shader
/// that outright FAILED warns immediately (the gate inspects
/// [`CachedPipelineState`] each gated frame), so this threshold only covers
/// the never-completes case; it is deliberately generous because frame count
/// is FPS-relative — at an uncapped 300 fps, startup compiles legitimately
/// take hundreds of gated frames (~2 s here; ~10 s at 60 fps).
const STUCK_GATE_HANG_FRAMES: u32 = 600;

/// One filter pass of an extracted chain: the pass shader plus its packed
/// uniform params.
pub struct ExtractedFilterPass {
    /// The pass's fragment shader (the vertex stage is always the prelude's —
    /// see [`LayerFilterPipeline`]).
    pub shader: Handle<Shader>,
    /// The packed params, zero-padded to the full uniform array. A fixed
    /// array rather than the main world's `Vec`: `FilterUniforms.params` is
    /// fixed-size anyway, so padding at extract time makes uniform staging a
    /// plain copy (unused slots are never read by the pass shader).
    pub params: [Vec4; MAX_FILTER_PARAM_VECS],
}

/// A layer's filter chain, extracted from [`ResolvedFilterChain`]. Only the
/// render-side fields cross: `wire_index`/`layout`/`outset_px`/`scale` are
/// main-world concerns (animation metadata, capture sizing) and stay there.
pub struct ExtractedChain {
    pub passes: Vec<ExtractedFilterPass>,
    /// Mirrors [`ResolvedFilterChain::version`] — compared against
    /// [`FilterSlot::params_version`] to detect param changes.
    pub version: u32,
    /// Mirrors [`ResolvedFilterChain::always_dirty`] (time-driven filters
    /// re-run every frame).
    pub always_dirty: bool,
}

/// One promoted layer, as seen by the render world this frame.
pub struct ExtractedLayer {
    /// The layer root's main-world entity (subtree identity).
    pub main_entity: MainEntity,
    /// The synthetic capture view (render-world entity, lives one frame).
    pub view_entity: Entity,
    /// The synthetic view's phase key.
    pub retained: RetainedViewEntity,
    /// Render-world entity of the composite quad (carries
    /// [`LayerCompositeBatch`] after prepare).
    pub quad_entity: Entity,
    /// Capture anchor: fractional physical px, stock UI view space (top-left
    /// of the node's border box — translation moves it without re-capturing).
    pub min: Vec2,
    /// Capture texture size in whole texels.
    pub size: UVec2,
    /// The screen-space rect the composite quad clamps to (the layer root's
    /// ancestor clipping, applied at composite time instead of capture time —
    /// see [`clip`]). `None` = unclipped.
    pub quad_clip: Option<bevy::math::Rect>,
    /// Composite-time group alpha.
    pub alpha: f32,
    /// Color format of the camera target — capture textures must match, or
    /// the stolen items' pipelines (specialized against the camera's format)
    /// would be invalid for the capture pass.
    pub target_format: TextureFormat,
    /// Whether this layer's capture must re-render this frame. `false` = the
    /// persistent texture in [`LayerTextureStore`] already holds the correct
    /// pixels: the capture pass skips it, and its stolen phase items are
    /// dropped instead of re-drawn. Decided at extract time (main-world dirt ∪
    /// missing/mismatched slot), then propagated up the enclosing chain — a
    /// re-capturing layer's quad re-draws inside every enclosing capture.
    pub needs_capture: bool,
    /// The layer root's resolved filter chain, if any (always non-empty when
    /// present). Drives [`prepare_layer_filters`]; `None` clears the slot's
    /// filter state (see [`FilterSlot`]).
    pub chain: Option<ExtractedChain>,
    /// The layer's composite-time 3D model matrix (screen-space homography,
    /// from `LayerTransform3dMatrix`). `None` = untransformed (absent style
    /// or identity params) — the quad takes the CPU clip path unchanged.
    pub transform3d: Option<Mat4>,
    /// Whether the layer carries the `TRANSFORM3D` promotion reason — its
    /// sampled texture allocates a mip chain (see [`mips`]). Keyed on the
    /// *reason*, not the matrix value: identity↔non-identity changes must
    /// never realloc/re-capture, and the chain stays warm for the first
    /// animated frame. Trilinear sampling itself engages only when
    /// [`Self::transform3d`] is `Some` AND the chain is valid.
    pub wants_mips: bool,
}

/// Per-frame extraction output. `layers` is index-aligned with
/// [`LayerAtlases::textures`] and [`LayerCompositeMeta::atlas_bind_groups`].
#[derive(Resource, Default)]
pub struct ExtractedUiLayers {
    pub layers: Vec<ExtractedLayer>,
    /// node main entity → index into `layers` (steal routing).
    pub membership: HashMap<MainEntity, usize>,
    /// layer index → index of its enclosing layer (quad routing); `None` =
    /// composite into the stock camera phase.
    pub enclosing: Vec<Option<usize>>,
    /// The stock UI view's phase key for the target camera.
    pub stock_view: Option<RetainedViewEntity>,
    /// The camera's render-world entity ([`ui_layer_capture_pass`] gates on
    /// the current view being this camera).
    pub camera_render_entity: Option<Entity>,
    /// Layer indices in capture order: deepest (innermost) first, so an outer
    /// capture's pass samples already-rendered inner captures.
    pub capture_order: Vec<usize>,
}

/// Extracts promoted layers into the render world and spawns their synthetic
/// capture views. Must run after `extract_ui_camera_view`: that system ends
/// with a `retain` that would drop any phase it didn't create.
#[allow(clippy::type_complexity, clippy::too_many_arguments)]
pub fn extract_ui_layers(
    mut commands: Commands,
    mut phases: ResMut<ViewSortedRenderPhases<TransparentUi>>,
    mut extracted: ResMut<ExtractedUiLayers>,
    layers: Extract<
        Query<(
            Entity,
            &LayerCaptureRect,
            &LayerGroupAlpha,
            &ComputedUiTargetCamera,
            Option<&ResolvedFilterChain>,
            Option<&crate::layer::transform3d::LayerTransform3dMatrix>,
            &PromotedLayer,
        )>,
    >,
    membership: Extract<Res<LayerMembership>>,
    repaints: Extract<Res<super::LayerRepaintState>>,
    clips: Extract<Res<crate::layer::clip::LayerClips>>,
    cameras: Extract<Query<(RenderEntity, &Camera), Or<(With<Camera2d>, With<Camera3d>)>>>,
    main_pass_formats: Res<CameraMainPassTextureFormats>,
    store: Res<LayerTextureStore>,
) {
    extracted.layers.clear();
    extracted.membership.clear();
    extracted.enclosing.clear();
    extracted.capture_order.clear();
    extracted.stock_view = None;
    extracted.camera_render_entity = None;

    if layers.is_empty() {
        return;
    }

    // v1: all layers composite on one camera — the first layer root's UI
    // target camera. (Multi-camera roots are a documented non-goal for now.)
    let mut layer_index: HashMap<Entity, usize> = HashMap::default();
    for (root, rect, alpha, target_camera, filter_chain, transform3d, promoted) in layers.iter() {
        let Some(camera_main) = target_camera.get() else {
            continue;
        };
        let Ok((camera_render, camera)) = cameras.get(camera_main) else {
            continue;
        };
        if !camera.is_active {
            continue;
        }
        let Some(target_format) = main_pass_formats.get(&camera_render).copied() else {
            continue;
        };
        if extracted.stock_view.is_none() {
            extracted.stock_view = Some(RetainedViewEntity::new(
                camera_main.into(),
                None,
                // Stock `UI_CAMERA_SUBVIEW`.
                1,
            ));
            extracted.camera_render_entity = Some(camera_render);
        }

        let (min, size) = (rect.min, rect.size);
        // Ortho over the capture rect in stock UI view space: vertices keep
        // their physical screen coordinates; the projection alone remaps the
        // rect to the capture target's clip space. Top-left origin like stock.
        // The bounds are fractional — the window tracks the node exactly, so
        // capture content is translation-invariant even subpixel.
        let projection = Mat4::orthographic_rh(
            min.x,
            min.x + size.x as f32,
            min.y + size.y as f32,
            min.y,
            0.0,
            UI_CAMERA_FAR,
        );
        let retained =
            RetainedViewEntity::new(MainEntity::from(root), None, UI_LAYER_CAPTURE_SUBVIEW);
        let view_entity = commands
            .spawn((
                ExtractedView {
                    retained_view_entity: retained,
                    clip_from_view: projection,
                    world_from_view: GlobalTransform::from_xyz(
                        0.0,
                        0.0,
                        UI_CAMERA_FAR + UI_CAMERA_TRANSFORM_OFFSET,
                    ),
                    clip_from_world: None,
                    target_format,
                    viewport: UVec4::new(0, 0, size.x, size.y),
                    color_grading: Default::default(),
                    invert_culling: false,
                },
                TemporaryRenderEntity,
            ))
            .id();
        let quad_entity = commands.spawn(TemporaryRenderEntity).id();
        phases.prepare_for_new_frame(retained);

        let wants_mips = promoted.reasons.0 & crate::layer::PromotionReasons::TRANSFORM3D != 0;
        // Cache decision: re-capture on main-world dirt, or when the persistent
        // slot can't serve (first frame, resize realloc, format flip, or a
        // mip-state flip — the fresh mipped/unmipped texture needs content).
        let cached_ok = store
            .slots
            .get(&MainEntity::from(root))
            .is_some_and(|slot| {
                slot.content_valid
                    && slot.size == size
                    && slot.format == target_format
                    && slot.mips.is_some() == wants_mips
            });
        let needs_capture = !cached_ok || repaints.dirty.contains(&root);

        // The resolver never attaches an empty chain, but guard anyway — an
        // empty `chain` must read as "no filter machinery" downstream.
        let chain = filter_chain
            .filter(|chain| !chain.passes.is_empty())
            .map(|chain| ExtractedChain {
                passes: chain
                    .passes
                    .iter()
                    .map(|pass| {
                        // The registry rejects over-cap packs at resolve; a
                        // custom `resolve` override that bypassed it would
                        // otherwise be silently truncated here.
                        debug_assert!(
                            pass.params.len() <= MAX_FILTER_PARAM_VECS,
                            "filter pass packs {} vec4s, over MAX_FILTER_PARAM_VECS",
                            pass.params.len()
                        );
                        let mut params = [Vec4::ZERO; MAX_FILTER_PARAM_VECS];
                        for (slot, value) in params.iter_mut().zip(&pass.params) {
                            *slot = *value;
                        }
                        ExtractedFilterPass {
                            shader: pass.shader.clone(),
                            params,
                        }
                    })
                    .collect(),
                version: chain.version,
                always_dirty: chain.always_dirty,
            });

        layer_index.insert(root, extracted.layers.len());
        extracted.layers.push(ExtractedLayer {
            main_entity: MainEntity::from(root),
            view_entity,
            retained,
            quad_entity,
            min,
            size,
            quad_clip: clips.quads.get(&root).copied().flatten(),
            alpha: alpha.0.clamp(0.0, 1.0),
            target_format,
            needs_capture,
            chain,
            // Identity matrices stay `None`: the quad renders exactly like an
            // untransformed layer (CPU clip path), and picking stays inert.
            transform3d: transform3d.filter(|m| !m.identity).map(|m| m.model),
            wants_mips,
        });
    }

    // Prune phases of layers that died since last frame: stock `retain` only
    // keeps its own views alive, and ours re-register just above, so any
    // subview-2 phase without a live layer this frame is stale.
    let live: Vec<RetainedViewEntity> = extracted.layers.iter().map(|l| l.retained).collect();
    phases.retain(|retained, _| {
        retained.subview_index != UI_LAYER_CAPTURE_SUBVIEW || live.contains(retained)
    });

    for (node, layer_root) in membership.node_to_layer.iter() {
        if let Some(&idx) = layer_index.get(layer_root) {
            extracted.membership.insert(MainEntity::from(*node), idx);
        }
    }
    extracted.enclosing = extracted
        .layers
        .iter()
        .map(|layer| {
            membership
                .enclosing
                .get(&layer.main_entity.id())
                .copied()
                .flatten()
                .and_then(|e| layer_index.get(&e).copied())
        })
        .collect();
    // Propagate `needs_capture` outward: a re-capturing inner layer's quad
    // re-draws inside its enclosing captures, so those must re-capture too.
    // (The main-world resolver already propagates its dirt the same way; this
    // pass additionally covers render-side reasons — a missing/realloc'd
    // slot — so redistribute can rely on "outer cached ⇒ inner cached".)
    let extracted = &mut *extracted;
    for i in 0..extracted.layers.len() {
        if extracted.layers[i].needs_capture {
            let layers = &mut extracted.layers;
            walk_enclosing(i, &extracted.enclosing, |outer| {
                if layers[outer].needs_capture {
                    return false; // its own chain is already propagated
                }
                layers[outer].needs_capture = true;
                true
            });
        }
    }
    // Capture order: innermost first (an outer capture samples its inner
    // quads). depth = length of the enclosing chain.
    let enclosing = extracted.enclosing.clone();
    let depth_of = |mut idx: usize| {
        let mut depth = 0usize;
        while let Some(outer) = enclosing[idx] {
            depth += 1;
            idx = outer;
            if depth > MAX_LAYER_DEPTH {
                break; // cycle guard (impossible by construction)
            }
        }
        depth
    };
    let mut order: Vec<usize> = (0..extracted.layers.len()).collect();
    order.sort_by_key(|&i| std::cmp::Reverse(depth_of(i)));
    extracted.capture_order = order;
}

/// Moves promoted subtrees' phase items from the camera's UI phase into their
/// layer's synthetic phase, then injects one composite quad per layer. Runs
/// after queueing, before the stock sort (which then sorts every phase,
/// stolen items keeping their global stack-index sort keys).
pub fn redistribute_ui_layers(
    extracted: Res<ExtractedUiLayers>,
    mut phases: ResMut<ViewSortedRenderPhases<TransparentUi>>,
    draw_functions: Res<DrawFunctions<TransparentUi>>,
    composite_pipeline: Option<Res<LayerCompositePipeline>>,
    mut specialized: ResMut<SpecializedRenderPipelines<LayerCompositePipeline>>,
    pipeline_cache: Res<PipelineCache>,
) {
    if extracted.layers.is_empty() {
        return;
    }
    let Some(stock_view) = extracted.stock_view else {
        return;
    };
    let Some(composite_pipeline) = composite_pipeline else {
        return;
    };

    // Steal: drain matching items out of the stock phase in one pass…
    let mut stolen: Vec<(usize, (Entity, MainEntity), TransparentUi)> = Vec::new();
    // …tracking each layer's first (lowest-sort-key) stolen item: the
    // composite quad draws exactly where the subtree would have started.
    let mut quad_sort_keys: Vec<Option<FloatOrd>> = vec![None; extracted.layers.len()];
    {
        let Some(stock_phase) = phases.get_mut(&stock_view) else {
            return;
        };
        // One O(n) partition pass (order-preserving): a `shift_remove` per
        // stolen key shifts the IndexMap tail each time — O(n²), ~14ms/frame
        // at 500 stress layers with most of the phase promoted.
        let taken = std::mem::take(&mut stock_phase.items);
        for (key, item) in taken {
            let Some(&idx) = extracted.membership.get(&item.main_entity()) else {
                stock_phase.items.insert(key, item);
                continue;
            };
            let best = &mut quad_sort_keys[idx];
            if best.is_none() || item.sort_key < best.unwrap() {
                *best = Some(item.sort_key);
            }
            stolen.push((idx, key, item));
        }
    }
    for (idx, _key, item) in stolen {
        // A cached layer's items are simply dropped: the persistent texture
        // already holds their pixels, so nothing re-draws them (and stock
        // `prepare_uinodes` builds no vertices for them either). The steal
        // itself is still load-bearing — it keeps the items out of the stock
        // phase AND recorded each layer's quad sort key above.
        if !extracted.layers[idx].needs_capture {
            continue;
        }
        if let Some(phase) = phases.get_mut(&extracted.layers[idx].retained) {
            phase.add_transient(item);
        }
    }

    // SPIKE diagnostics: `BEVY_REACT_LAYER_SPIKE_MODE=steal` skips quad
    // injection to isolate steal-side from composite-side effects.
    if std::env::var("BEVY_REACT_LAYER_SPIKE_MODE").as_deref() == Ok("steal") {
        return;
    }
    // Inject composite quads — inner layers' quads land in their enclosing
    // layer's phase (they are content of the outer capture); top-level quads
    // land in the camera phase at the subtree's stacking position.
    let draw_function = draw_functions.read().id::<DrawLayerComposite>();
    for (idx, layer) in extracted.layers.iter().enumerate() {
        let Some(sort_key) = quad_sort_keys[idx] else {
            // Nothing of this subtree was queued (hidden/empty): no quad.
            continue;
        };
        let pipeline = specialized.specialize(
            &pipeline_cache,
            &composite_pipeline,
            LayerCompositePipelineKey {
                target_format: layer.target_format,
            },
        );
        let target = match extracted.enclosing[idx] {
            Some(outer) => {
                if !extracted.layers[outer].needs_capture {
                    // The enclosing capture is cached and already contains this
                    // quad's pixels — nothing to draw it into. Propagation
                    // guarantees a re-capturing inner never meets a cached
                    // outer.
                    debug_assert!(
                        !layer.needs_capture,
                        "inner layer re-captures but its enclosing layer is cached"
                    );
                    continue;
                }
                extracted.layers[outer].retained
            }
            None => stock_view,
        };
        if let Some(phase) = phases.get_mut(&target) {
            phase.add_transient(TransparentUi {
                sort_key: FloatOrd(sort_key.0 + stack_z_offsets::BACKGROUND_COLOR),
                entity: (layer.quad_entity, layer.main_entity),
                pipeline,
                draw_function,
                batch_range: 0..0,
                extra_index: PhaseItemExtraIndex::None,
                index: idx,
                indexed: false,
            });
        }
    }
}

/// One composite-quad vertex: physical screen position (the stock UI view
/// projects it), capture UV, and the group alpha. Future composite params
/// (per-rule) extend this struct — the pass stays rule-agnostic.
#[repr(C)]
#[derive(Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
pub struct LayerCompositeVertex {
    pub position: [f32; 3],
    pub uv: [f32; 2],
    pub alpha: f32,
}

/// Vertex buffer + per-layer capture bind groups for the composite draws.
#[derive(Resource)]
pub struct LayerCompositeMeta {
    pub vertices: RawBufferVec<LayerCompositeVertex>,
    pub atlas_bind_groups: Vec<BindGroup>,
}

impl Default for LayerCompositeMeta {
    fn default() -> Self {
        Self {
            vertices: RawBufferVec::new(BufferUsages::VERTEX),
            atlas_bind_groups: Vec::new(),
        }
    }
}

/// The composite quad's draw data on its render entity (mirrors `UiBatch`).
#[derive(Component)]
pub struct LayerCompositeBatch {
    pub range: Range<u32>,
    /// Index into [`LayerCompositeMeta::atlas_bind_groups`].
    pub atlas: usize,
    /// Dynamic offset of this quad's [`transform3d::CompositeUniforms`] entry.
    pub uniform_offset: u32,
}

/// Edge-AA inflation for 3D-transformed composite quads, in pre-transform
/// local px: the quad grows this much on every side (UVs extended
/// proportionally past `[0, 1]`, clamped by the sampler) so the fragment
/// stage can center a feather of the same width on the true rect edge — the
/// outside half lands on the inflated ring, the inside half on real content.
const EDGE_AA_INFLATE_PX: f32 = 1.0;

/// The transformed quad's geometry, inflated by `inset` local px on every
/// side with UVs extended proportionally — `uv ∈ [0, 1]` still maps exactly
/// the true rect, which is what the shader's coverage term measures against.
fn inflated_transform_quad(min: Vec2, size: UVec2, inset: f32) -> clip::ClippedQuad {
    let size = size.as_vec2().max(Vec2::ONE);
    let uv_inset = inset / size;
    clip::ClippedQuad {
        pos_min: min - inset,
        pos_max: min + size + inset,
        uv_min: -uv_inset,
        uv_max: Vec2::ONE + uv_inset,
    }
}

/// Builds composite-quad vertices + bind groups and stamps
/// [`LayerCompositeBatch`] onto the quad entities, writing each quad's vertex
/// range back into its phase item.
#[allow(clippy::too_many_arguments)]
pub fn prepare_layer_composites(
    mut commands: Commands,
    extracted: Res<ExtractedUiLayers>,
    mut store: ResMut<LayerTextureStore>,
    pipeline: Option<Res<LayerCompositePipeline>>,
    pipeline_cache: Res<PipelineCache>,
    render_device: Res<RenderDevice>,
    render_queue: Res<RenderQueue>,
    mut meta: ResMut<LayerCompositeMeta>,
    mut uniforms_meta: ResMut<transform3d::CompositeUniformsMeta>,
    filter_meta: Res<LayerFilterMeta>,
    mut phases: ResMut<ViewSortedRenderPhases<TransparentUi>>,
) {
    meta.vertices.clear();
    meta.atlas_bind_groups.clear();
    uniforms_meta.uniforms.clear();
    uniforms_meta.bind_group = None;
    let Some(pipeline) = pipeline else {
        return;
    };
    if extracted.layers.is_empty() {
        return;
    }

    // The quads were injected with `index = layer index`; find each again in
    // its (post-sort) phase to write the batch range.
    let mut ranges: Vec<Option<Range<u32>>> = vec![None; extracted.layers.len()];
    // Filtered layers whose output isn't ready this frame: their quads stay
    // batch-less, so any enclosing capture rendered without them must not be
    // served from cache — see the invalidation loop after this one.
    let mut gated: Vec<usize> = Vec::new();
    for (idx, layer) in extracted.layers.iter().enumerate() {
        let Some(slot) = store.slots.get_mut(&layer.main_entity) else {
            continue;
        };
        // Pick the quad's source: the raw capture, or — for a filtered
        // layer — the final filter pass's ping-pong output.
        let bind_group = if layer.chain.is_some() {
            let Some(filter) = slot.filter.as_mut() else {
                // Allocated by `prepare_layer_textures` whenever a chain is
                // present; a miss means nothing to sample — gate the quad.
                gated.push(idx);
                continue;
            };
            // Readiness gate: chain present but no complete filtered output
            // yet (startup compile, realloc). Skip the batch — the injected
            // item keeps `batch_range 0..0` and draws nothing. Never fall
            // back to the raw capture: a frame of unfiltered content is
            // exactly the flash this gate exists to prevent.
            if !filter.output_valid {
                filter.gated_frames = filter.gated_frames.saturating_add(1);
                // Once per stuck episode: an errored pass pipeline (user WGSL
                // that failed to compile) warns immediately with the error;
                // a still-compiling one is normal startup latency and only
                // warns after the FPS-generous hang threshold.
                if !filter.gate_warned {
                    let compile_error = filter_meta
                        .runs
                        .get(idx)
                        .and_then(|run| run.as_ref())
                        .and_then(|run| {
                            run.passes.iter().find_map(|pass| {
                                // Only PERMANENT failures warn immediately.
                                // `ShaderNotLoaded` / `ShaderImportNotYetAvailable`
                                // are transient (the cache re-queues them while
                                // an asset-path shader streams in at startup)
                                // and fall through to the hang threshold.
                                match pipeline_cache.get_render_pipeline_state(pass.pipeline) {
                                    CachedPipelineState::Err(
                                        e @ (ShaderCacheError::ProcessShaderError(_)
                                        | ShaderCacheError::CreateShaderModule(_)),
                                    ) => Some(e.to_string()),
                                    _ => None,
                                }
                            })
                        });
                    if let Some(err) = compile_error {
                        warn!(
                            "UI layer {:?}: a filter pass shader failed to compile — the \
                             layer's subtree is invisible (the composite gate never falls \
                             back to unfiltered content) and its filter run restages every \
                             frame. Error: {err}",
                            layer.main_entity,
                        );
                        filter.gate_warned = true;
                    } else if filter.gated_frames == STUCK_GATE_HANG_FRAMES {
                        warn!(
                            "UI layer {:?}: composite quad withheld for {} consecutive \
                             frames and its filter pipeline is still not ready (no compile \
                             error reported — a hung/queued compile?). Until it resolves, \
                             the layer's subtree is invisible and its filter run restages \
                             every frame.",
                            layer.main_entity, STUCK_GATE_HANG_FRAMES,
                        );
                        filter.gate_warned = true;
                    }
                }
                gated.push(idx);
                continue;
            }
            // Cached until realloc; invalidated when `output_index` flips
            // (pass-count parity change).
            let output = filter.output_index;
            // Trilinear only for a non-identity quad over a valid mip chain;
            // otherwise the bilinear level-0 view (correct, just unmipped —
            // never a gate, never a stale mip).
            if layer.transform3d.is_some() && filter.mips_valid {
                let Some(chain) = &filter.mips[output] else {
                    unreachable!("mips_valid implies a staged chain");
                };
                if !matches!(&filter.composite_bind_group_mips, Some((built, _)) if *built == output)
                {
                    filter.composite_bind_group_mips = Some((
                        output,
                        render_device.create_bind_group(
                            "ui_layer_composite_filtered_mips",
                            &pipeline_cache.get_bind_group_layout(&pipeline.atlas_layout),
                            &BindGroupEntries::sequential((
                                &chain.full_view,
                                &pipeline.sampler_mips,
                            )),
                        ),
                    ));
                }
                let (_, bind_group) = filter.composite_bind_group_mips.as_ref().expect("just set");
                bind_group.clone()
            } else {
                if !matches!(&filter.composite_bind_group, Some((built, _)) if *built == output) {
                    filter.composite_bind_group = Some((
                        output,
                        render_device.create_bind_group(
                            "ui_layer_composite_filtered",
                            &pipeline_cache.get_bind_group_layout(&pipeline.atlas_layout),
                            &BindGroupEntries::sequential((
                                &filter.textures[output].default_view,
                                &pipeline.sampler,
                            )),
                        ),
                    ));
                }
                let (_, bind_group) = filter.composite_bind_group.as_ref().expect("just set");
                bind_group.clone()
            }
        } else if layer.transform3d.is_some()
            && slot.mips_valid
            && let Some(chain) = &slot.mips
        {
            // Trilinear variant over the capture's full-mip view (same layout
            // slot — any Filtering sampler fits). Lazy like `bind_group`.
            if slot.bind_group_mips.is_none() {
                slot.bind_group_mips = Some(render_device.create_bind_group(
                    "ui_layer_composite_atlas_mips",
                    &pipeline_cache.get_bind_group_layout(&pipeline.atlas_layout),
                    &BindGroupEntries::sequential((&chain.full_view, &pipeline.sampler_mips)),
                ));
            }
            slot.bind_group_mips.clone().expect("just set")
        } else {
            // Reuse the slot's bind group across frames; it dies on realloc.
            if slot.bind_group.is_none() {
                slot.bind_group = Some(render_device.create_bind_group(
                    "ui_layer_composite_atlas",
                    &pipeline_cache.get_bind_group_layout(&pipeline.atlas_layout),
                    &BindGroupEntries::sequential((&slot.texture.default_view, &pipeline.sampler)),
                ));
            }
            slot.bind_group.clone().expect("just set")
        };
        let start = meta.vertices.len() as u32;
        // Fractional quad position (bilinear sampling smooths subpixel motion
        // of a cached capture — the browser tradeoff), clamped to the layer's
        // ancestor clip: the CAPTURE is clip-independent (interior clips
        // only — see `clip::swap_interior_clips_in`), so the quad is where
        // scroll/viewport clipping applies, with UVs shifted proportionally
        // on clamped sides. A fully clipped-away layer draws no quad at all
        // (`ranges[idx]` stays `None`, the item's batch_range stays `0..0`).
        //
        // A 3D-transformed quad can't be CPU-clamped (the clip rect is
        // axis-aligned in screen space; the transformed quad isn't): it keeps
        // its full geometry/UVs — inflated for the edge-AA feather — and the
        // ancestor clip moves into the fragment stage via the per-quad
        // uniform. A "fully clipped away" verdict is likewise unknowable
        // pre-transform, so the transformed path always draws. Untransformed
        // quads keep the CPU path, an open clip sentinel, and a zero feather —
        // the shader stays single-path and pixel-identical for them.
        let (q, model, clip_rect, feather) = match layer.transform3d {
            Some(model) => (
                inflated_transform_quad(layer.min, layer.size, EDGE_AA_INFLATE_PX),
                model,
                layer.quad_clip,
                EDGE_AA_INFLATE_PX,
            ),
            None => {
                let Some(q) = clip::clip_quad(layer.min, layer.size, layer.quad_clip) else {
                    continue;
                };
                (q, Mat4::IDENTITY, None, 0.0)
            }
        };
        let (min, max) = (q.pos_min, q.pos_max);
        let (uv_min, uv_max) = (q.uv_min, q.uv_max);
        // UVs are quad-relative (spike: texture == rect; slot-relative UVs
        // arrive with the shared atlas).
        let corners = [
            ([min.x, min.y, 0.0], [uv_min.x, uv_min.y]),
            ([max.x, min.y, 0.0], [uv_max.x, uv_min.y]),
            ([max.x, max.y, 0.0], [uv_max.x, uv_max.y]),
            ([min.x, min.y, 0.0], [uv_min.x, uv_min.y]),
            ([max.x, max.y, 0.0], [uv_max.x, uv_max.y]),
            ([min.x, max.y, 0.0], [uv_min.x, uv_max.y]),
        ];
        for (position, uv) in corners {
            meta.vertices.push(LayerCompositeVertex {
                position,
                uv,
                alpha: layer.alpha,
            });
        }
        ranges[idx] = Some(start..start + 6);
        let atlas_index = meta.atlas_bind_groups.len();
        meta.atlas_bind_groups.push(bind_group);
        let (open_min, open_max) = transform3d::open_clip();
        let uniform_offset = uniforms_meta
            .uniforms
            .push(&transform3d::CompositeUniforms {
                model,
                clip_min: clip_rect.map_or(open_min, |r| r.min),
                clip_max: clip_rect.map_or(open_max, |r| r.max),
                edge_feather: feather,
                pad_a: 0.0,
                pad_b: Vec2::ZERO,
            });
        commands
            .entity(layer.quad_entity)
            .insert(LayerCompositeBatch {
                range: ranges[idx].clone().unwrap(),
                atlas: atlas_index,
                uniform_offset,
            });
    }
    // A gated quad drew nothing into its enclosing captures this frame, yet
    // those captures' `content_valid` was predicted from pipeline readiness
    // alone — an outer capture with a hole where the filtered subtree belongs
    // could otherwise be frozen as "valid". Force the enclosing chain to
    // re-capture until the filtered output exists.
    for idx in gated {
        walk_enclosing(idx, &extracted.enclosing, |outer| {
            if let Some(slot) = store.slots.get_mut(&extracted.layers[outer].main_entity) {
                slot.content_valid = false;
            }
            true
        });
    }
    meta.vertices.write_buffer(&render_device, &render_queue);
    // Composite uniforms: write, then bind the (possibly fresh) buffer — one
    // whole-buffer bind group, per-quad entries selected by dynamic offset.
    uniforms_meta
        .uniforms
        .write_buffer(&render_device, &render_queue);
    uniforms_meta.bind_group = uniforms_meta.uniforms.binding().map(|binding| {
        render_device.create_bind_group(
            "ui_layer_composite_uniforms",
            &pipeline_cache.get_bind_group_layout(&pipeline.uniform_layout),
            &BindGroupEntries::single(binding),
        )
    });

    // Mark the injected quads drawable (post-sort, pre-draw). A phase item's
    // `batch_range` is an *item-skip count* — `SortedRenderPhase::render`
    // advances by `len()` and skips empty ranges entirely — so a standalone
    // quad is exactly `0..1`; its vertex range rides `LayerCompositeBatch`.
    for phase in phases.values_mut() {
        for item in phase.items.values_mut() {
            if extracted
                .layers
                .iter()
                .position(|l| l.quad_entity == item.entity())
                .is_some_and(|idx| ranges[idx].is_some())
            {
                item.batch_range = 0..1;
            }
        }
    }
}

/// The composite pipeline: group 0 is the stock UI view uniform (so
/// [`SetUiViewBindGroup`] is reused verbatim), group 1 the capture texture.
/// Blending is **premultiplied** (`One`/`OneMinusSrcAlpha`): capture content
/// is premultiplied by construction (straight-alpha blending onto transparent
/// black), and the shader multiplies rgb *and* alpha by the group alpha.
#[derive(Resource)]
pub struct LayerCompositePipeline {
    pub view_layout: BindGroupLayoutDescriptor,
    pub atlas_layout: BindGroupLayoutDescriptor,
    /// Group 2: the per-quad [`transform3d::CompositeUniforms`] (dynamic
    /// offset) — 3D model matrix + fragment clip rect.
    pub uniform_layout: BindGroupLayoutDescriptor,
    pub sampler: Sampler,
    /// Trilinear + anisotropic sampler for non-identity 3D-transformed quads
    /// over a valid mip chain (see [`mips`]) — tilting minifies the capture,
    /// where bilinear-over-level-0 shimmers. Same layout slot as
    /// [`Self::sampler`] (any Filtering sampler fits), selected per quad via
    /// the variant bind groups.
    pub sampler_mips: Sampler,
    pub shader: Handle<Shader>,
}

pub fn init_layer_composite_pipeline(
    mut commands: Commands,
    render_device: Res<RenderDevice>,
    asset_server: Res<AssetServer>,
) {
    let view_layout = BindGroupLayoutDescriptor::new(
        "ui_layer_composite_view_layout",
        &BindGroupLayoutEntries::single(
            ShaderStages::VERTEX_FRAGMENT,
            uniform_buffer::<ViewUniform>(true),
        ),
    );
    let atlas_layout = BindGroupLayoutDescriptor::new(
        "ui_layer_composite_atlas_layout",
        &BindGroupLayoutEntries::sequential(
            ShaderStages::FRAGMENT,
            (
                texture_2d(TextureSampleType::Float { filterable: true }),
                sampler(SamplerBindingType::Filtering),
            ),
        ),
    );
    let uniform_layout = BindGroupLayoutDescriptor::new(
        "ui_layer_composite_uniform_layout",
        &BindGroupLayoutEntries::single(
            ShaderStages::VERTEX_FRAGMENT,
            uniform_buffer::<transform3d::CompositeUniforms>(true),
        ),
    );
    commands.insert_resource(LayerCompositePipeline {
        view_layout,
        atlas_layout,
        uniform_layout,
        sampler: render_device.create_sampler(&SamplerDescriptor {
            label: Some("ui_layer_composite_sampler"),
            mag_filter: FilterMode::Linear,
            min_filter: FilterMode::Linear,
            ..Default::default()
        }),
        // Anisotropy needs no wgpu feature; it requires all three filters
        // Linear (which trilinear wants anyway) and a texture that actually
        // has a mip chain — the bind-group selection guarantees that.
        sampler_mips: render_device.create_sampler(&SamplerDescriptor {
            label: Some("ui_layer_composite_sampler_mips"),
            mag_filter: FilterMode::Linear,
            min_filter: FilterMode::Linear,
            mipmap_filter: bevy::render::render_resource::MipmapFilterMode::Linear,
            anisotropy_clamp: 8,
            ..Default::default()
        }),
        shader: bevy::asset::load_embedded_asset!(asset_server.as_ref(), "composite.wgsl"),
    });
}

#[derive(Clone, Copy, Hash, PartialEq, Eq)]
pub struct LayerCompositePipelineKey {
    pub target_format: TextureFormat,
}

impl SpecializedRenderPipeline for LayerCompositePipeline {
    type Key = LayerCompositePipelineKey;

    fn specialize(&self, key: Self::Key) -> RenderPipelineDescriptor {
        let vertex_layout = VertexBufferLayout::from_vertex_formats(
            VertexStepMode::Vertex,
            vec![
                // position
                VertexFormat::Float32x3,
                // uv
                VertexFormat::Float32x2,
                // alpha
                VertexFormat::Float32,
            ],
        );
        RenderPipelineDescriptor {
            vertex: VertexState {
                shader: self.shader.clone(),
                buffers: vec![vertex_layout],
                ..Default::default()
            },
            fragment: Some(FragmentState {
                shader: self.shader.clone(),
                targets: vec![Some(ColorTargetState {
                    format: key.target_format,
                    blend: Some(BlendState {
                        color: BlendComponent {
                            src_factor: BlendFactor::One,
                            dst_factor: BlendFactor::OneMinusSrcAlpha,
                            operation: BlendOperation::Add,
                        },
                        alpha: BlendComponent {
                            src_factor: BlendFactor::One,
                            dst_factor: BlendFactor::OneMinusSrcAlpha,
                            operation: BlendOperation::Add,
                        },
                    }),
                    write_mask: ColorWrites::ALL,
                })],
                ..Default::default()
            }),
            layout: vec![
                self.view_layout.clone(),
                self.atlas_layout.clone(),
                self.uniform_layout.clone(),
            ],
            label: Some("ui_layer_composite_pipeline".into()),
            ..Default::default()
        }
    }
}

pub struct SetLayerAtlasBindGroup<const I: usize>;
impl<P: PhaseItem, const I: usize> RenderCommand<P> for SetLayerAtlasBindGroup<I> {
    type Param = SRes<LayerCompositeMeta>;
    type ViewQuery = ();
    type ItemQuery = bevy::ecs::system::lifetimeless::Read<LayerCompositeBatch>;

    #[inline]
    fn render<'w>(
        _item: &P,
        _view: (),
        batch: Option<&'w LayerCompositeBatch>,
        meta: SystemParamItem<'w, '_, Self::Param>,
        pass: &mut TrackedRenderPass<'w>,
    ) -> RenderCommandResult {
        let Some(batch) = batch else {
            return RenderCommandResult::Skip;
        };
        let Some(bind_group) = meta.into_inner().atlas_bind_groups.get(batch.atlas) else {
            return RenderCommandResult::Failure("layer atlas bind group missing");
        };
        pass.set_bind_group(I, bind_group, &[]);
        RenderCommandResult::Success
    }
}

pub struct DrawLayerQuad;
impl<P: PhaseItem> RenderCommand<P> for DrawLayerQuad {
    type Param = SRes<LayerCompositeMeta>;
    type ViewQuery = ();
    type ItemQuery = bevy::ecs::system::lifetimeless::Read<LayerCompositeBatch>;

    #[inline]
    fn render<'w>(
        _item: &P,
        _view: (),
        batch: Option<&'w LayerCompositeBatch>,
        meta: SystemParamItem<'w, '_, Self::Param>,
        pass: &mut TrackedRenderPass<'w>,
    ) -> RenderCommandResult {
        let Some(batch) = batch else {
            return RenderCommandResult::Skip;
        };
        let Some(vertices) = meta.into_inner().vertices.buffer() else {
            return RenderCommandResult::Failure("layer composite vertices missing");
        };
        pass.set_vertex_buffer(0, vertices.slice(..));
        pass.draw(batch.range.clone(), 0..1);
        RenderCommandResult::Success
    }
}

/// The composite quad's draw stack — view uniform reuse means the quad rides
/// whatever view its phase belongs to (screen, or an outer layer's capture).
pub type DrawLayerComposite = (
    SetItemPipeline,
    SetUiViewBindGroup<0>,
    SetLayerAtlasBindGroup<1>,
    transform3d::SetCompositeUniforms<2>,
    DrawLayerQuad,
);

/// The Rust mirror of the prelude's `FilterUniforms`
/// (`layer/filter_prelude.wgsl`) — one entry per staged filter pass in
/// [`LayerFilterMeta::uniforms`]. The explicit `pad` fields reproduce the
/// WGSL uniform-address-space layout byte for byte (160 bytes total; asserted
/// by `filter_uniforms_match_the_documented_wgsl_layout`). The digit-free
/// `pad_a`/`pad_b` names are load-bearing on the WGSL side: naga's namer
/// appends `_` to identifiers ending in a digit, which naga_oil rejects in
/// composable modules — and the mirror matches field for field.
#[derive(Clone, Copy, ShaderType)]
pub struct FilterUniforms {
    /// Seconds since startup (render-world `Time`), for `USES_TIME` filters.
    pub time: f32,
    pub pad_a: f32,
    /// The pass target's size in physical px.
    pub resolution: Vec2,
    /// `1.0 / resolution`: one texel step in UV.
    pub texel_size: Vec2,
    pub pad_b: Vec2,
    /// The packed filter params ([`ExtractedFilterPass::params`]).
    pub params: [Vec4; MAX_FILTER_PARAM_VECS],
}

/// The filter-pass pipeline: ONE bind group layout for every filter — group 0
/// is the source texture (the capture, or the previous pass's ping-pong
/// output), a linear clamp-to-edge sampler, and one dynamically-offset
/// [`FilterUniforms`] — plus the prelude shader, which is the **vertex stage
/// of every filter pipeline**.
///
/// Split-stage design: the vertex entry (`vertex`, a fullscreen triangle)
/// lives in the prelude module, the fragment entry (`fragment`) in each pass
/// shader that `#import`s the prelude for bindings/helpers. naga_oil does not
/// re-export an import's entry points into the composed module, so the pass
/// shaders genuinely have no vertex entry — the pipeline descriptor names two
/// different shader handles, which wgpu supports (per-stage modules; the
/// cross-stage interface is the prelude's `FullscreenVertexOutput`).
/// Validated at runtime by the executing filter passes (module-doc spike
/// checklist); the documented fallback if a Bevy upgrade breaks it is a tiny
/// per-shader `@vertex` delegating to a prelude helper.
#[derive(Resource)]
pub struct LayerFilterPipeline {
    pub layout: BindGroupLayoutDescriptor,
    pub sampler: Sampler,
    /// `layer/filter_prelude.wgsl` — registered with `load_shader_library!`,
    /// which also embeds it as a loadable asset, so a plain handle to it
    /// works as a pipeline stage.
    pub prelude: Handle<Shader>,
}

pub fn init_layer_filter_pipeline(
    mut commands: Commands,
    render_device: Res<RenderDevice>,
    asset_server: Res<AssetServer>,
) {
    let layout = BindGroupLayoutDescriptor::new(
        "ui_layer_filter_layout",
        &BindGroupLayoutEntries::sequential(
            ShaderStages::FRAGMENT,
            (
                texture_2d(TextureSampleType::Float { filterable: true }),
                sampler(SamplerBindingType::Filtering),
                // `uniform_buffer::<T>` sets `min_binding_size` from
                // `T::min_size()` — the 160-byte contract.
                uniform_buffer::<FilterUniforms>(true),
            ),
        ),
    );
    commands.insert_resource(LayerFilterPipeline {
        layout,
        sampler: render_device.create_sampler(&SamplerDescriptor {
            label: Some("ui_layer_filter_sampler"),
            address_mode_u: AddressMode::ClampToEdge,
            address_mode_v: AddressMode::ClampToEdge,
            mag_filter: FilterMode::Linear,
            min_filter: FilterMode::Linear,
            ..Default::default()
        }),
        prelude: bevy::asset::load_embedded_asset!(asset_server.as_ref(), "filter_prelude.wgsl"),
    });
}

/// Specialization key: the pass's fragment shader plus the target format
/// (filter targets ride the capture's format). `Handle<Shader>` hashes by
/// asset id, so it works as a key directly.
#[derive(Clone, Hash, PartialEq, Eq)]
pub struct LayerFilterPipelineKey {
    pub shader: Handle<Shader>,
    pub target_format: TextureFormat,
}

impl SpecializedRenderPipeline for LayerFilterPipeline {
    type Key = LayerFilterPipelineKey;

    fn specialize(&self, key: Self::Key) -> RenderPipelineDescriptor {
        RenderPipelineDescriptor {
            // No vertex buffers: the prelude's fullscreen triangle is
            // generated from `vertex_index` alone.
            vertex: VertexState {
                shader: self.prelude.clone(),
                entry_point: Some("vertex".into()),
                ..Default::default()
            },
            fragment: Some(FragmentState {
                shader: key.shader,
                // `filter` is a WGSL reserved word — the prelude's contract
                // names the entry `fragment`.
                entry_point: Some("fragment".into()),
                targets: vec![Some(ColorTargetState {
                    format: key.target_format,
                    // Replace-write, no blending: the prelude documents that
                    // previous target contents are irrelevant and the
                    // fragment's (premultiplied) output lands verbatim.
                    blend: None,
                    write_mask: ColorWrites::ALL,
                })],
                ..Default::default()
            }),
            layout: vec![self.layout.clone()],
            label: Some("ui_layer_filter_pipeline".into()),
            ..Default::default()
        }
    }
}

/// Whether a layer's filter passes must (re-)run this frame: fresh capture
/// content, changed params, a time-driven chain, or an output that was never
/// completed (startup, realloc, or a run whose execution was skipped).
pub const fn needs_filter_run(
    needs_capture: bool,
    chain_version: u32,
    stored_version: u32,
    always_dirty: bool,
    output_valid: bool,
) -> bool {
    needs_capture || chain_version != stored_version || always_dirty || !output_valid
}

/// Walks the enclosing-layer chain upward from `start` (exclusive), calling
/// `visit` with each enclosing ancestor's index. Stops when the chain ends
/// (`enclosing[cur]` is `None`), when `visit` returns `false`, or after
/// [`MAX_LAYER_DEPTH`] ancestors — the shared bounded guard for every
/// enclosing-chain traversal (`enclosing` is acyclic by construction, so the
/// cap only matters for impossible cycles).
fn walk_enclosing(start: usize, enclosing: &[Option<usize>], mut visit: impl FnMut(usize) -> bool) {
    let mut cur = start;
    for _ in 0..MAX_LAYER_DEPTH {
        let Some(outer) = enclosing[cur] else {
            break;
        };
        if !visit(outer) {
            break;
        }
        cur = outer;
    }
}

/// Ping-pong source for pass `i`: `None` = the layer's capture texture
/// (pass 0), otherwise the index of the previous pass's target.
pub const fn filter_source_index(pass: usize) -> Option<usize> {
    if pass == 0 {
        None
    } else {
        Some((pass - 1) % 2)
    }
}

/// Ping-pong target for pass `i`.
pub const fn filter_target_index(pass: usize) -> usize {
    pass % 2
}

/// Which ping-pong texture holds the final output of a `len`-pass chain
/// (the last pass's target; `len` is at least 1 for any staged run).
pub const fn filter_output_index(len: usize) -> usize {
    (len.saturating_sub(1)) % 2
}

/// One staged filter pass, replayed by [`ui_layer_capture_pass`]: set the
/// pipeline, bind group 0 at the dynamic offset, render 3 vertices into
/// `target`.
pub struct LayerFilterPass {
    pub pipeline: CachedRenderPipelineId,
    pub bind_group: BindGroup,
    pub uniform_offset: u32,
    pub target: TextureView,
}

/// A layer's staged filter run this frame.
pub struct LayerFilterRun {
    pub passes: Vec<LayerFilterPass>,
}

/// Per-frame filter staging: the uniform buffer (one entry per staged pass)
/// and the replay list, index-aligned with [`ExtractedUiLayers::layers`].
/// `runs[idx] = None` means "no filter work this frame" — either the layer
/// has no chain, or its cached output is still valid (the composite samples
/// `FilterSlot.textures[output_index]` either way).
#[derive(Resource)]
pub struct LayerFilterMeta {
    pub uniforms: DynamicUniformBuffer<FilterUniforms>,
    pub runs: Vec<Option<LayerFilterRun>>,
}

impl Default for LayerFilterMeta {
    fn default() -> Self {
        let mut uniforms = DynamicUniformBuffer::default();
        uniforms.set_label(Some("ui_layer_filter_uniforms"));
        Self {
            uniforms,
            runs: Vec::new(),
        }
    }
}

/// Stages every resource a layer's filter passes need this frame: pipeline
/// specialization, one uniform entry per pass, and per-pass bind groups over
/// the capture/ping-pong textures. Execution happens in
/// [`ui_layer_capture_pass`], which replays [`LayerFilterMeta::runs`] right
/// after each layer's capture; this system also *predicts* that execution
/// (phase 3) and writes [`FilterSlot::output_valid`] accordingly, so the
/// downstream [`prepare_layer_composites`] gate is same-frame accurate.
#[allow(clippy::too_many_arguments)]
pub fn prepare_layer_filters(
    extracted: Res<ExtractedUiLayers>,
    mut store: ResMut<LayerTextureStore>,
    pipeline: Option<Res<LayerFilterPipeline>>,
    mut specialized: ResMut<SpecializedRenderPipelines<LayerFilterPipeline>>,
    pipeline_cache: Res<PipelineCache>,
    render_device: Res<RenderDevice>,
    render_queue: Res<RenderQueue>,
    time: Res<Time>,
    mut meta: ResMut<LayerFilterMeta>,
) {
    let LayerFilterMeta { uniforms, runs } = &mut *meta;
    uniforms.clear();
    runs.clear();
    runs.resize_with(extracted.layers.len(), || None);
    let Some(pipeline) = pipeline else {
        return;
    };

    // Phase 1: decide, specialize, and stage uniforms. Bind groups wait for
    // phase 2 — they must reference the uniform buffer *after* `write_buffer`
    // (which may reallocate it).
    struct StagedPass {
        pipeline: CachedRenderPipelineId,
        uniform_offset: u32,
    }
    let mut staged: Vec<(usize, Vec<StagedPass>)> = Vec::new();
    for (idx, layer) in extracted.layers.iter().enumerate() {
        let Some(chain) = &layer.chain else {
            continue;
        };
        let Some(slot) = store.slots.get_mut(&layer.main_entity) else {
            continue;
        };
        // Uniforms describe the pass targets, which share the capture's
        // (clamped) size.
        let size = slot.size;
        let Some(filter) = slot.filter.as_mut() else {
            continue;
        };
        if !needs_filter_run(
            layer.needs_capture,
            chain.version,
            filter.params_version,
            chain.always_dirty,
            filter.output_valid,
        ) {
            continue;
        }
        // The staged run supersedes whatever the output textures hold; phase 3
        // below marks the output valid again iff the passes will execute.
        // A CHAIN CHANGE (vs a plain retry) also re-arms the stuck-gate warn:
        // the edit may swap in different shaders, and their failure deserves
        // its own once-per-episode report.
        if filter.params_version != chain.version {
            filter.gated_frames = 0;
            filter.gate_warned = false;
        }
        filter.params_version = chain.version;
        filter.output_valid = false;
        // The run rewrites the output's level 0 — its mip chain goes stale
        // until `prepare_layer_mips` (ordered after this system) restages it.
        filter.mips_valid = false;
        filter.output_index = filter_output_index(chain.passes.len());

        let resolution = size.as_vec2();
        let texel_size = Vec2::ONE / resolution;
        let mut passes = Vec::with_capacity(chain.passes.len());
        for pass in &chain.passes {
            let id = specialized.specialize(
                &pipeline_cache,
                &pipeline,
                LayerFilterPipelineKey {
                    shader: pass.shader.clone(),
                    target_format: layer.target_format,
                },
            );
            let uniform_offset = uniforms.push(&FilterUniforms {
                time: time.elapsed_secs(),
                pad_a: 0.0,
                resolution,
                texel_size,
                pad_b: Vec2::ZERO,
                params: pass.params,
            });
            passes.push(StagedPass {
                pipeline: id,
                uniform_offset,
            });
        }
        staged.push((idx, passes));
    }
    if staged.is_empty() {
        return;
    }

    // Phase 2: write the uniforms, then build the per-pass bind groups
    // against the (possibly fresh) buffer.
    uniforms.write_buffer(&render_device, &render_queue);
    let Some(uniform_binding) = uniforms.binding() else {
        return;
    };
    let layout = pipeline_cache.get_bind_group_layout(&pipeline.layout);
    for (idx, staged_passes) in staged {
        let layer = &extracted.layers[idx];
        let Some(slot) = store.slots.get(&layer.main_entity) else {
            continue;
        };
        let Some(filter) = slot.filter.as_ref() else {
            continue;
        };
        let passes = staged_passes
            .into_iter()
            .enumerate()
            .map(|(i, pass)| {
                let source = match filter_source_index(i) {
                    None => &slot.texture.default_view,
                    Some(ping) => &filter.textures[ping].default_view,
                };
                let bind_group = render_device.create_bind_group(
                    "ui_layer_filter",
                    &layout,
                    &BindGroupEntries::sequential((
                        source,
                        &pipeline.sampler,
                        uniform_binding.clone(),
                    )),
                );
                LayerFilterPass {
                    pipeline: pass.pipeline,
                    bind_group,
                    uniform_offset: pass.uniform_offset,
                    target: filter.textures[filter_target_index(i)].default_view.clone(),
                }
            })
            .collect();
        runs[idx] = Some(LayerFilterRun { passes });
    }

    // Phase 3: predict execution and mark outputs valid. Mirrors the
    // `content_valid` discipline in `prepare_layer_textures`: a pipeline that
    // `get_render_pipeline` resolves *now* is guaranteed to resolve in the
    // graph node too (compiled pipelines never regress within a frame), so
    // marking valid here is safe — and a still-compiling pipeline (prediction
    // false) leaves `output_valid` false, which both gates the composite quad
    // (no partial/unfiltered flash) and forces a restage + retry next frame.
    // The source capture must be valid too ([`LayerSlot::content_valid`]):
    // filtering a blank/partial capture would freeze garbage on screen.
    for (idx, run) in runs.iter().enumerate() {
        let Some(run) = run else {
            continue;
        };
        let Some(slot) = store.slots.get_mut(&extracted.layers[idx].main_entity) else {
            continue;
        };
        let ready = run
            .passes
            .iter()
            .all(|pass| pipeline_cache.get_render_pipeline(pass.pipeline).is_some());
        if ready
            && slot.content_valid
            && let Some(filter) = slot.filter.as_mut()
        {
            filter.output_valid = true;
            filter.gated_frames = 0;
            filter.gate_warned = false;
        }
    }
}

/// Renders each layer's synthetic phase into its capture texture, then
/// replays the layer's staged filter run (if any) capture → ping-pong
/// textures. Runs in the camera's schedule right before the stock `ui_pass`
/// consumes the composite quads.
#[allow(clippy::too_many_arguments)]
pub fn ui_layer_capture_pass(
    world: &World,
    view: ViewQuery<Entity>,
    extracted: Res<ExtractedUiLayers>,
    atlases: Res<LayerAtlases>,
    phases: Res<ViewSortedRenderPhases<TransparentUi>>,
    filter_meta: Res<LayerFilterMeta>,
    mip_meta: Res<mips::LayerMipMeta>,
    pipeline_cache: Res<PipelineCache>,
    mut ctx: RenderContext,
) {
    if extracted.camera_render_entity != Some(view.into_inner()) {
        return;
    }
    // Innermost first ([`ExtractedUiLayers::capture_order`]): a quad sampling
    // layer B's capture (or B's filtered output) must draw — inside some
    // outer capture or the screen — only after B's capture *and filter*
    // passes ran; passes execute in encoder order, and B's filter replay sits
    // in B's loop iteration, before any enclosing layer's capture.
    for &idx in &extracted.capture_order {
        let layer = &extracted.layers[idx];
        // Capture. Skipped when cached (`!needs_capture`): the persistent
        // texture already holds the pixels — and skipping keeps the
        // `LoadOp::Clear` from wiping them.
        if layer.needs_capture
            && let Some(texture) = atlases.textures.get(idx)
            && let Some(phase) = phases.get(&layer.retained)
            && !phase.items.is_empty()
        {
            let mut pass = ctx.begin_tracked_render_pass(RenderPassDescriptor {
                label: Some("ui_layer_capture"),
                color_attachments: &[Some(RenderPassColorAttachment {
                    view: &texture.default_view,
                    depth_slice: None,
                    resolve_target: None,
                    ops: Operations {
                        load: LoadOp::Clear(LinearRgba::NONE.into()),
                        store: StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });
            if let Err(err) = phase.render(&mut pass, world, layer.view_entity) {
                bevy::log::error!("layer capture pass failed: {err:?}");
            }
        }

        // Filter replay — also when the capture above was skipped as cached:
        // a staged run over a clean capture is a params-only change (slider
        // move, time tick) re-filtering last frame's pixels.
        if let Some(run) = filter_meta.runs.get(idx).and_then(Option::as_ref) {
            // Resolve every pass pipeline up front: a `None` is a
            // still-compiling pipeline — abort the whole run, never execute a
            // partial chain. `output_valid` was only set by
            // `prepare_layer_filters` if all of these resolved back in
            // prepare (compiled pipelines don't regress), so an abort here
            // means it stayed false: the quad is gated this frame and the
            // layer restages + retries next frame.
            let pipelines: Option<Vec<_>> = run
                .passes
                .iter()
                .map(|pass| pipeline_cache.get_render_pipeline(pass.pipeline))
                .collect();
            if let Some(pipelines) = pipelines {
                for (pass_data, pipeline) in run.passes.iter().zip(pipelines) {
                    let mut pass = ctx.begin_tracked_render_pass(RenderPassDescriptor {
                        label: Some("ui_layer_filter"),
                        color_attachments: &[Some(RenderPassColorAttachment {
                            view: &pass_data.target,
                            depth_slice: None,
                            resolve_target: None,
                            ops: Operations {
                                // The fullscreen triangle replace-writes every
                                // texel, so `Clear` vs `Load` is
                                // content-equivalent; `Clear` skips loading
                                // stale contents on tiled GPUs.
                                load: LoadOp::Clear(LinearRgba::NONE.into()),
                                store: StoreOp::Store,
                            },
                        })],
                        depth_stencil_attachment: None,
                        timestamp_writes: None,
                        occlusion_query_set: None,
                        multiview_mask: None,
                    });
                    pass.set_render_pipeline(pipeline);
                    pass.set_bind_group(0, &pass_data.bind_group, &[pass_data.uniform_offset]);
                    pass.draw(0..3, 0..1);
                }
            }
        }

        // Mip downsample replay — after capture AND filter, so the chain
        // reads this frame's level 0 (of whichever texture the composite
        // samples). Staged only when stale (`mips_valid` — a cached capture
        // keeps last frame's mips and stages nothing); the pipeline was
        // verified compiled at staging, so a `None` here is unreachable-in-
        // practice and simply skips.
        if let Some(run) = mip_meta.runs.get(idx).and_then(Option::as_ref)
            && let Some(pipeline) = pipeline_cache.get_render_pipeline(run.pipeline)
        {
            for level in &run.levels {
                let mut pass = ctx.begin_tracked_render_pass(RenderPassDescriptor {
                    label: Some("ui_layer_mip_blit"),
                    color_attachments: &[Some(RenderPassColorAttachment {
                        view: &level.target,
                        depth_slice: None,
                        resolve_target: None,
                        ops: Operations {
                            load: LoadOp::Clear(LinearRgba::NONE.into()),
                            store: StoreOp::Store,
                        },
                    })],
                    depth_stencil_attachment: None,
                    timestamp_writes: None,
                    occlusion_query_set: None,
                    multiview_mask: None,
                });
                pass.set_render_pipeline(pipeline);
                pass.set_bind_group(0, &level.bind_group, &[]);
                pass.draw(0..3, 0..1);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bevy::render::render_resource::encase::UniformBuffer;

    fn f32_at(bytes: &[u8], offset: usize) -> f32 {
        f32::from_le_bytes(bytes[offset..offset + 4].try_into().unwrap())
    }

    /// The Rust mirror must reproduce the prelude's documented 160-byte
    /// uniform layout exactly (`layer/filter_prelude.wgsl`): time@0,
    /// resolution@8, texel_size@16, params@32 (stride 16), total 160.
    #[test]
    fn filter_uniforms_match_the_documented_wgsl_layout() {
        assert_eq!(FilterUniforms::min_size().get(), 160);

        let mut params = [Vec4::ZERO; MAX_FILTER_PARAM_VECS];
        params[0] = Vec4::new(1.0, 2.0, 3.0, 4.0);
        params[7] = Vec4::new(5.0, 6.0, 7.0, 8.0);
        let value = FilterUniforms {
            time: 1.5,
            pad_a: 0.0,
            resolution: Vec2::new(320.0, 240.0),
            texel_size: Vec2::new(0.5, 0.25),
            pad_b: Vec2::ZERO,
            params,
        };
        let mut buffer = UniformBuffer::new(Vec::<u8>::new());
        buffer.write(&value).expect("uniform write");
        let bytes = buffer.into_inner();
        assert_eq!(bytes.len(), 160);
        // Per-field offsets, per the prelude's comment block.
        assert_eq!(f32_at(&bytes, 0), 1.5); // time
        assert_eq!(f32_at(&bytes, 8), 320.0); // resolution.x
        assert_eq!(f32_at(&bytes, 12), 240.0); // resolution.y
        assert_eq!(f32_at(&bytes, 16), 0.5); // texel_size.x
        assert_eq!(f32_at(&bytes, 20), 0.25); // texel_size.y
        assert_eq!(f32_at(&bytes, 32), 1.0); // params[0].x
        assert_eq!(f32_at(&bytes, 44), 4.0); // params[0].w
        assert_eq!(f32_at(&bytes, 32 + 7 * 16), 5.0); // params[7].x
        assert_eq!(f32_at(&bytes, 32 + 7 * 16 + 12), 8.0); // params[7].w
    }

    /// The re-run decision, exhaustively: any of "capture re-rendered",
    /// "params changed", "time-driven", or "output never completed" forces a
    /// run; only a fully clean layer skips.
    #[test]
    fn needs_filter_run_decision_table() {
        // (needs_capture, chain_version, stored_version, always_dirty,
        //  output_valid) -> expected
        let cases = [
            // Fully clean: same version, valid output, static chain.
            (false, 3, 3, false, true, false),
            // Fresh capture content must re-filter.
            (true, 3, 3, false, true, true),
            // Param change (version bump).
            (false, 4, 3, false, true, true),
            // Version restart collision guard: a *lower* version differs too.
            (false, 1, 3, false, true, true),
            // Time-driven chains never settle.
            (false, 3, 3, true, true, true),
            // Output never completed (startup, realloc, skipped execution).
            (false, 3, 3, false, false, true),
            // Never staged (params_version 0 vs first real version 1).
            (false, 1, 0, false, false, true),
        ];
        for (capture, chain_v, stored_v, dirty, valid, expected) in cases {
            assert_eq!(
                needs_filter_run(capture, chain_v, stored_v, dirty, valid),
                expected,
                "needs_capture={capture} chain={chain_v} stored={stored_v} \
                 always_dirty={dirty} output_valid={valid}"
            );
        }
    }

    /// Ping-pong plumbing: pass 0 reads the capture and writes texture 0;
    /// each later pass reads the previous target and writes the other
    /// texture; the final output is the last pass's target.
    #[test]
    fn filter_ping_pong_indices() {
        assert_eq!(filter_source_index(0), None);
        assert_eq!(filter_target_index(0), 0);
        assert_eq!(filter_source_index(1), Some(0));
        assert_eq!(filter_target_index(1), 1);
        assert_eq!(filter_source_index(2), Some(1));
        assert_eq!(filter_target_index(2), 0);
        assert_eq!(filter_source_index(3), Some(0));
        assert_eq!(filter_target_index(3), 1);
        // Every pass reads what the previous one wrote…
        for pass in 1..8 {
            assert_eq!(
                filter_source_index(pass),
                Some(filter_target_index(pass - 1)),
                "pass {pass} must read pass {}'s target",
                pass - 1
            );
            // …and never its own target.
            assert_ne!(filter_source_index(pass), Some(filter_target_index(pass)));
        }
        // The chain's output is the last pass's target.
        for len in 1..8 {
            assert_eq!(filter_output_index(len), filter_target_index(len - 1));
        }
        assert_eq!(filter_output_index(1), 0);
        assert_eq!(filter_output_index(2), 1);
        assert_eq!(filter_output_index(3), 0);
    }

    /// The shared enclosing-chain walk: visits ancestors bottom-up
    /// (exclusive of the start), stops at the chain end or the `visit`
    /// veto, and never exceeds [`MAX_LAYER_DEPTH`] steps even on a
    /// (construction-impossible) cycle.
    #[test]
    fn walk_enclosing_table() {
        let visited = |start: usize, enclosing: &[Option<usize>]| {
            let mut seen = Vec::new();
            walk_enclosing(start, enclosing, |outer| {
                seen.push(outer);
                true
            });
            seen
        };

        // Simple chain: 2 → 1 → 0 → (root).
        let chain = [None, Some(0), Some(1)];
        assert_eq!(visited(2, &chain), vec![1, 0]);
        assert_eq!(visited(1, &chain), vec![0]);

        // `None` stops immediately: a root layer visits nothing.
        assert_eq!(visited(0, &chain), Vec::<usize>::new());

        // A chain longer than MAX_LAYER_DEPTH truncates at the cap.
        let long: Vec<Option<usize>> = (0..MAX_LAYER_DEPTH + 10)
            .map(|i| i.checked_sub(1))
            .collect();
        let seen = visited(long.len() - 1, &long);
        assert_eq!(seen.len(), MAX_LAYER_DEPTH);
        assert_eq!(seen[0], long.len() - 2);
        assert_eq!(seen[MAX_LAYER_DEPTH - 1], long.len() - 1 - MAX_LAYER_DEPTH);

        // A self-cycle terminates (bounded), visiting the cycle node
        // MAX_LAYER_DEPTH times.
        let cycle = [Some(0)];
        assert_eq!(visited(0, &cycle), vec![0; MAX_LAYER_DEPTH]);

        // A two-node cycle terminates too.
        let cycle2 = [Some(1), Some(0)];
        assert_eq!(visited(0, &cycle2).len(), MAX_LAYER_DEPTH);

        // `visit` returning false stops the walk (the needs_capture
        // propagation's "already propagated" early-out).
        let mut seen = Vec::new();
        walk_enclosing(2, &chain, |outer| {
            seen.push(outer);
            false
        });
        assert_eq!(seen, vec![1]);
    }

    /// The edge-AA inflation grows the quad symmetrically and extends UVs so
    /// `uv ∈ [0, 1]` still maps exactly the true rect; a degenerate size
    /// doesn't divide by zero.
    #[test]
    fn inflated_transform_quad_extends_uvs_proportionally() {
        let q = inflated_transform_quad(Vec2::new(100.0, 50.0), UVec2::new(200, 100), 1.0);
        assert_eq!(q.pos_min, Vec2::new(99.0, 49.0));
        assert_eq!(q.pos_max, Vec2::new(301.0, 151.0));
        assert_eq!(q.uv_min, Vec2::new(-1.0 / 200.0, -1.0 / 100.0));
        assert_eq!(q.uv_max, Vec2::new(1.0 + 1.0 / 200.0, 1.0 + 1.0 / 100.0));
        // uv=0 must still land on the true rect min: interpolating position
        // by the uv fraction of the true edge recovers `min`.
        let span = q.pos_max - q.pos_min;
        let uv_span = q.uv_max - q.uv_min;
        let at_uv_zero = q.pos_min + span * (Vec2::ZERO - q.uv_min) / uv_span;
        assert!(at_uv_zero.abs_diff_eq(Vec2::new(100.0, 50.0), 1e-4));

        let degenerate = inflated_transform_quad(Vec2::ZERO, UVec2::ZERO, 1.0);
        assert!(degenerate.uv_min.is_finite());
    }
}
