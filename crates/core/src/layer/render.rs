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
//! 4. …the composite quad ([`DrawLayerComposite`], drawn inside the stock
//!    `ui_pass` at the subtree's stacking position) samples the capture with
//!    premultiplied blending (`One`/`OneMinusSrcAlpha`) and multiplies rgb
//!    *and* alpha by the group alpha.
//!
//! Re-verify on Bevy upgrades (spike checklist): `TransparentUi` field set,
//! `SortedRenderPhase::{items, transient_items}` visibility, `prepare_uinodes`
//! iterating all phases, `ViewSortedRenderPhases::prepare_for_new_frame`
//! draining transients, straight `ALPHA_BLENDING` in `UiPipeline`, and the
//! `Queue → PhaseSort → PrepareBindGroups` schedule shape.

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
use bevy::render::texture::CachedTexture;
use bevy::render::view::{ExtractedView, RetainedViewEntity, ViewUniform};
use bevy::shader::Shader;
use bevy::ui::ComputedUiTargetCamera;
use bevy::ui_render::{SetUiViewBindGroup, TransparentUi, stack_z_offsets};

use super::{LayerCaptureRect, LayerGroupAlpha, LayerMembership, PromotedLayer};

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

/// The per-layer offscreen capture textures (spike: one texture per layer;
/// the planned per-depth shared atlas swaps in behind the same indices).
/// Index-aligned with [`ExtractedUiLayers::layers`]; entries are clones of the
/// persistent [`LayerTextureStore`] slots.
#[derive(Resource, Default)]
pub struct LayerAtlases {
    pub textures: Vec<CachedTexture>,
}

/// One layer's persistent capture texture. Unlike Bevy's `TextureCache`
/// (descriptor-keyed pool — same-size layers can swap textures between frames,
/// and nothing pins content), a slot is keyed by the layer root's `MainEntity`,
/// so a clean layer's texture reliably still holds last frame's capture.
pub struct LayerSlot {
    pub texture: CachedTexture,
    pub size: UVec2,
    pub format: TextureFormat,
    /// Composite bind group, built lazily and kept until realloc (per-frame
    /// bind-group creation is real cost at hundreds of layers).
    pub bind_group: Option<BindGroup>,
    /// Whether the texture holds a *complete* capture. A capture that runs
    /// while any of its items' pipelines are still compiling renders those
    /// items as nothing (`phase.render` skips them silently) — serving that
    /// from cache would freeze a blank/partial layer on screen. Only a
    /// capture whose pipelines were all ready marks the content valid;
    /// until then extraction keeps re-capturing.
    pub content_valid: bool,
    pub last_seen: u64,
}

/// Persistent (cross-frame) capture textures, keyed by layer root — the
/// resource that makes capture caching possible. Slots are allocated /
/// reallocated by [`prepare_layer_textures`] and evicted a few frames after
/// their layer disappears (demote, despawn).
#[derive(Resource, Default)]
pub struct LayerTextureStore {
    pub slots: HashMap<MainEntity, LayerSlot>,
    pub frame: u64,
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
        Query<
            (
                Entity,
                &LayerCaptureRect,
                &LayerGroupAlpha,
                &ComputedUiTargetCamera,
            ),
            With<PromotedLayer>,
        >,
    >,
    membership: Extract<Res<LayerMembership>>,
    repaints: Extract<Res<super::LayerRepaintState>>,
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
    for (root, rect, alpha, target_camera) in layers.iter() {
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

        // Cache decision: re-capture on main-world dirt, or when the persistent
        // slot can't serve (first frame, resize realloc, format flip).
        let cached_ok = store
            .slots
            .get(&MainEntity::from(root))
            .is_some_and(|slot| {
                slot.content_valid && slot.size == size && slot.format == target_format
            });
        let needs_capture = !cached_ok || repaints.dirty.contains(&root);

        layer_index.insert(root, extracted.layers.len());
        extracted.layers.push(ExtractedLayer {
            main_entity: MainEntity::from(root),
            view_entity,
            retained,
            quad_entity,
            min,
            size,
            alpha: alpha.0.clamp(0.0, 1.0),
            target_format,
            needs_capture,
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
    for i in 0..extracted.layers.len() {
        if extracted.layers[i].needs_capture {
            let mut idx = i;
            while let Some(outer) = extracted.enclosing[idx] {
                if extracted.layers[outer].needs_capture {
                    break;
                }
                extracted.layers[outer].needs_capture = true;
                idx = outer;
            }
        }
    }
    // Capture order: innermost first (an outer capture samples its inner
    // quads). depth = length of the enclosing chain.
    let enclosing = extracted.enclosing.clone();
    let depth_of = |mut idx: usize| {
        let mut depth = 0u32;
        while let Some(outer) = enclosing[idx] {
            depth += 1;
            idx = outer;
            if depth > 64 {
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

/// Maintains the persistent per-layer capture textures (camera target format —
/// stolen pipelines were specialized against it; sample count 1 — `ui_pass`
/// renders unsampled): get-or-(re)allocate each live layer's
/// [`LayerTextureStore`] slot, mirror it into the index-aligned
/// [`LayerAtlases`], and evict slots whose layer is gone. Deliberately not
/// Bevy's `TextureCache` — capture caching needs each layer to keep *its own*
/// texture (and its pixels) across frames.
pub fn prepare_layer_textures(
    extracted: Res<ExtractedUiLayers>,
    render_device: Res<RenderDevice>,
    pipeline_cache: Res<PipelineCache>,
    phases: Res<ViewSortedRenderPhases<TransparentUi>>,
    mut store: ResMut<LayerTextureStore>,
    mut atlases: ResMut<LayerAtlases>,
) {
    atlases.textures.clear();
    let store = &mut *store;
    store.frame += 1;
    let frame = store.frame;
    for layer in &extracted.layers {
        let wanted = layer.size.max(UVec2::ONE);
        let slot = store
            .slots
            .entry(layer.main_entity)
            .or_insert_with(|| alloc_layer_slot(&render_device, wanted, layer.target_format));
        if slot.size != wanted || slot.format != layer.target_format {
            // Resize / format flip: fresh texture, and the stale bind group
            // dies with the slot. Extraction already flagged `needs_capture`.
            *slot = alloc_layer_slot(&render_device, wanted, layer.target_format);
        }
        if layer.needs_capture {
            // This frame's capture is only servable from cache later if every
            // item actually renders — a still-compiling pipeline makes
            // `phase.render` skip its item silently, and freezing that
            // blank/partial capture would blank the layer on screen for good
            // (the exact failure mode of capturing during app startup).
            // Conservative by construction: a pipeline that compiles between
            // here and the capture pass costs one redundant re-capture.
            slot.content_valid = phases.get(&layer.retained).is_some_and(|phase| {
                !phase.items.is_empty()
                    && phase
                        .items
                        .values()
                        .all(|i| pipeline_cache.get_render_pipeline(i.pipeline).is_some())
            });
        }
        slot.last_seen = frame;
        atlases.textures.push(slot.texture.clone());
    }
    // Demoted/despawned layers: keep the slot for a short grace (cheap
    // re-promotion churn), then free the texture memory.
    store.slots.retain(|_, slot| slot.last_seen + 3 >= frame);
}

fn alloc_layer_slot(render_device: &RenderDevice, size: UVec2, format: TextureFormat) -> LayerSlot {
    let texture = render_device.create_texture(&TextureDescriptor {
        label: Some("ui_layer_capture"),
        size: Extent3d {
            width: size.x,
            height: size.y,
            depth_or_array_layers: 1,
        },
        mip_level_count: 1,
        sample_count: 1,
        dimension: TextureDimension::D2,
        format,
        usage: TextureUsages::RENDER_ATTACHMENT | TextureUsages::TEXTURE_BINDING,
        view_formats: &[],
    });
    let default_view = texture.create_view(&TextureViewDescriptor::default());
    LayerSlot {
        texture: CachedTexture {
            texture,
            default_view,
        },
        size,
        format,
        bind_group: None,
        content_valid: false,
        last_seen: 0,
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
    mut phases: ResMut<ViewSortedRenderPhases<TransparentUi>>,
) {
    meta.vertices.clear();
    meta.atlas_bind_groups.clear();
    let Some(pipeline) = pipeline else {
        return;
    };
    if extracted.layers.is_empty() {
        return;
    }

    // The quads were injected with `index = layer index`; find each again in
    // its (post-sort) phase to write the batch range.
    let mut ranges: Vec<Option<Range<u32>>> = vec![None; extracted.layers.len()];
    for (idx, layer) in extracted.layers.iter().enumerate() {
        let Some(slot) = store.slots.get_mut(&layer.main_entity) else {
            continue;
        };
        let start = meta.vertices.len() as u32;
        // Fractional quad position (bilinear sampling smooths subpixel motion
        // of a cached capture — the browser tradeoff).
        let (min, max) = (layer.min, layer.min + layer.size.as_vec2());
        // Full-texture UVs (spike: texture == rect; slot-relative UVs arrive
        // with the shared atlas).
        let corners = [
            ([min.x, min.y, 0.0], [0.0, 0.0]),
            ([max.x, min.y, 0.0], [1.0, 0.0]),
            ([max.x, max.y, 0.0], [1.0, 1.0]),
            ([min.x, min.y, 0.0], [0.0, 0.0]),
            ([max.x, max.y, 0.0], [1.0, 1.0]),
            ([min.x, max.y, 0.0], [0.0, 1.0]),
        ];
        for (position, uv) in corners {
            meta.vertices.push(LayerCompositeVertex {
                position,
                uv,
                alpha: layer.alpha,
            });
        }
        ranges[idx] = Some(start..start + 6);
        // Reuse the slot's bind group across frames; it dies on realloc.
        if slot.bind_group.is_none() {
            slot.bind_group = Some(render_device.create_bind_group(
                "ui_layer_composite_atlas",
                &pipeline_cache.get_bind_group_layout(&pipeline.atlas_layout),
                &BindGroupEntries::sequential((&slot.texture.default_view, &pipeline.sampler)),
            ));
        }
        let bind_group = slot.bind_group.clone().expect("just set");
        let atlas_index = meta.atlas_bind_groups.len();
        meta.atlas_bind_groups.push(bind_group);
        commands
            .entity(layer.quad_entity)
            .insert(LayerCompositeBatch {
                range: ranges[idx].clone().unwrap(),
                atlas: atlas_index,
            });
    }
    meta.vertices.write_buffer(&render_device, &render_queue);

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
    pub sampler: Sampler,
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
    commands.insert_resource(LayerCompositePipeline {
        view_layout,
        atlas_layout,
        sampler: render_device.create_sampler(&SamplerDescriptor {
            label: Some("ui_layer_composite_sampler"),
            mag_filter: FilterMode::Linear,
            min_filter: FilterMode::Linear,
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
            layout: vec![self.view_layout.clone(), self.atlas_layout.clone()],
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
    DrawLayerQuad,
);

/// Renders each layer's synthetic phase into its capture texture. Runs in the
/// camera's schedule right before the stock `ui_pass` consumes the composite
/// quads.
pub fn ui_layer_capture_pass(
    world: &World,
    view: ViewQuery<Entity>,
    extracted: Res<ExtractedUiLayers>,
    atlases: Res<LayerAtlases>,
    phases: Res<ViewSortedRenderPhases<TransparentUi>>,
    mut ctx: RenderContext,
) {
    if extracted.camera_render_entity != Some(view.into_inner()) {
        return;
    }
    // Innermost first ([`ExtractedUiLayers::capture_order`]): a quad sampling
    // layer B's capture must draw — inside some outer capture or the screen —
    // only after B's capture pass ran; passes execute in encoder order.
    for &idx in &extracted.capture_order {
        let layer = &extracted.layers[idx];
        if !layer.needs_capture {
            // Cached: the persistent texture already holds the pixels — and
            // skipping keeps the `LoadOp::Clear` below from wiping them.
            continue;
        }
        let Some(texture) = atlases.textures.get(idx) else {
            continue;
        };
        let Some(phase) = phases.get(&layer.retained) else {
            continue;
        };
        if phase.items.is_empty() {
            continue;
        }
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
}
