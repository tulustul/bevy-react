//! Render-world half of `backdropFilter`: the snapshot blit, the backdrop
//! filter run, and the backdrop composite quad.
//!
//! Per frame, for each layer with an extracted backdrop chain:
//!
//! 1. [`prepare_layer_backdrops`] (PrepareBindGroups, after
//!    `prepare_layer_textures`) stages a snapshot **blit** (crop-sample the
//!    camera main texture over the layer's capture rect —
//!    `backdrop_blit.wgsl`) and a **filter run** over the snapshot, reusing
//!    the content-filter pipeline wholesale: the snapshot is bound as the
//!    pass-0 source AND as the binding-3 `capture_texture`, so every filter
//!    shader works unchanged (the snapshot is opaque, which satisfies the
//!    premultiplied contract trivially). Backdrop chains are forced
//!    `always_dirty` at resolve, so this stages every frame.
//! 2. [`run_backdrop_passes`] (called from `ui_layer_capture_pass`, before
//!    stock `ui_pass`) executes blit → chain. The blit bind group is created
//!    HERE, in the pass system: `ViewTarget`'s a/b main texture flips during
//!    PostProcess, so a prepare-time binding would race (Bevy's tonemapping
//!    node is the precedent). At this point in the camera schedule the main
//!    texture holds the tonemapped 3D frame with no UI — exactly the v1
//!    backdrop.
//! 3. [`stage_backdrop_composite`] (called from `prepare_layer_composites`)
//!    stamps a [`LayerCompositeBatch`] onto the layer's backdrop quad
//!    (injected by `redistribute_ui_layers` one epsilon *below* the content
//!    quad): the un-inflated border box (frost never paints in the outset
//!    ring) sampling the chain's output, multiplied by the group alpha.
//!    Gating is graceful by construction — a withheld backdrop quad draws
//!    nothing and the region shows the real (unfiltered) frame already in
//!    the target, never an invisible subtree.

use bevy::math::{Rect, UVec2, Vec2};
use bevy::prelude::*;
use bevy::render::camera::ExtractedCamera;
use bevy::render::render_resource::binding_types::{sampler, texture_2d, uniform_buffer};
use bevy::render::render_resource::*;
use bevy::render::renderer::{RenderContext, RenderDevice, RenderQueue};
use bevy::render::texture::CachedTexture;
use bevy::render::view::ViewTarget;
use bevy::shader::Shader;

use super::clip::ClippedQuad;
use super::store::alloc_capture_texture;
use super::{
    ExtractedUiLayers, FilterUniforms, LayerFilterPass, LayerFilterPipeline,
    LayerFilterPipelineKey, LayerFilterRun, LayerTextureStore, STUCK_GATE_HANG_FRAMES,
    filter_output_index, filter_source_index, filter_target_index,
};

/// A layer's persistent backdrop resources: the snapshot texture (blit
/// target + chain source) and the chain's ping-pong pair, with the same
/// `output_valid` discipline as
/// [`FilterSlot`](super::FilterSlot). Allocated at the capture's size +
/// format whenever the layer has a backdrop chain; dies with the
/// [`LayerSlot`](super::LayerSlot) on realloc. No mip state: the backdrop
/// quad is never 3D-transformed in v1.
pub struct BackdropSlot {
    /// The snapshot (RENDER_ATTACHMENT | TEXTURE_BINDING): the frame region
    /// under the layer's (outset-inflated) capture rect, re-blitted every
    /// frame.
    pub snapshot: CachedTexture,
    /// The chain's ping-pong targets (pass 0 samples the snapshot and writes
    /// `textures[0]`, and so on).
    pub textures: [CachedTexture; 2],
    /// The staged chain version (`0` = never staged; versions start at 1).
    /// Backdrop runs restage every frame regardless — this only re-arms the
    /// stuck-gate warn on chain edits.
    pub params_version: u32,
    /// Whether `textures[output_index]` holds a complete filtered backdrop.
    /// Predicted at prepare (blit pipeline AND every chain pipeline
    /// compiled); while false the backdrop quad is withheld — the region
    /// shows the unfiltered frame.
    pub output_valid: bool,
    /// Consecutive withheld frames; drives the stuck-gate warn.
    pub gated_frames: u32,
    /// Once-per-episode warn latch (see [`super::FilterSlot::gate_warned`]).
    pub gate_warned: bool,
    /// Which ping-pong texture the final pass writes.
    pub output_index: usize,
    /// Composite bind group over `textures[.0]`, index-invalidated on
    /// `output_index` parity flips.
    pub composite_bind_group: Option<(usize, BindGroup)>,
}

/// Allocate a layer's backdrop slot at the capture's size and format.
pub fn alloc_backdrop_slot(
    render_device: &RenderDevice,
    size: UVec2,
    format: TextureFormat,
) -> BackdropSlot {
    let alloc =
        |label: &'static str| alloc_capture_texture(render_device, label, size, format, false).0;
    BackdropSlot {
        snapshot: alloc("ui_layer_backdrop_snapshot"),
        textures: [
            alloc("ui_layer_backdrop_ping"),
            alloc("ui_layer_backdrop_pong"),
        ],
        params_version: 0,
        output_valid: false,
        gated_frames: 0,
        gate_warned: false,
        output_index: 0,
        composite_bind_group: None,
    }
}

/// The blit's per-layer uniforms: the snapshot rect mapped into the main
/// texture's UV space. Mirrors `BlitUniforms` in `backdrop_blit.wgsl`.
#[derive(Clone, Copy, ShaderType)]
pub struct BackdropBlitUniforms {
    pub src_uv_min: Vec2,
    pub src_uv_scale: Vec2,
}

/// The snapshot-blit pipeline: main texture + clamp-to-edge sampler + one
/// dynamically-offset [`BackdropBlitUniforms`]. Deliberately not the filter
/// layout (that mandates the 160-byte `FilterUniforms` via
/// `min_binding_size`), same reasoning as the mip blit.
#[derive(Resource)]
pub struct BackdropBlitPipeline {
    pub layout: BindGroupLayoutDescriptor,
    pub sampler: Sampler,
    pub shader: Handle<Shader>,
}

pub fn init_backdrop_blit_pipeline(
    mut commands: Commands,
    render_device: Res<RenderDevice>,
    asset_server: Res<AssetServer>,
) {
    let layout = BindGroupLayoutDescriptor::new(
        "ui_layer_backdrop_blit_layout",
        &BindGroupLayoutEntries::sequential(
            ShaderStages::FRAGMENT,
            (
                texture_2d(TextureSampleType::Float { filterable: true }),
                sampler(SamplerBindingType::Filtering),
                uniform_buffer::<BackdropBlitUniforms>(true),
            ),
        ),
    );
    commands.insert_resource(BackdropBlitPipeline {
        layout,
        sampler: render_device.create_sampler(&SamplerDescriptor {
            label: Some("ui_layer_backdrop_blit_sampler"),
            address_mode_u: AddressMode::ClampToEdge,
            address_mode_v: AddressMode::ClampToEdge,
            mag_filter: FilterMode::Linear,
            min_filter: FilterMode::Linear,
            ..Default::default()
        }),
        shader: bevy::asset::load_embedded_asset!(asset_server.as_ref(), "backdrop_blit.wgsl"),
    });
}

#[derive(Clone, Copy, Hash, PartialEq, Eq)]
pub struct BackdropBlitPipelineKey {
    pub target_format: TextureFormat,
}

impl SpecializedRenderPipeline for BackdropBlitPipeline {
    type Key = BackdropBlitPipelineKey;

    fn specialize(&self, key: Self::Key) -> RenderPipelineDescriptor {
        RenderPipelineDescriptor {
            vertex: VertexState {
                shader: self.shader.clone(),
                entry_point: Some("vertex".into()),
                ..Default::default()
            },
            fragment: Some(FragmentState {
                shader: self.shader.clone(),
                entry_point: Some("fragment".into()),
                targets: vec![Some(ColorTargetState {
                    format: key.target_format,
                    // Replace-write: the triangle covers every texel.
                    blend: None,
                    write_mask: ColorWrites::ALL,
                })],
                ..Default::default()
            }),
            layout: vec![self.layout.clone()],
            label: Some("ui_layer_backdrop_blit_pipeline".into()),
            ..Default::default()
        }
    }
}

/// One staged snapshot blit: pipeline + this layer's uniform entry. The bind
/// group is created in the pass ([`run_backdrop_passes`]) — the main-texture
/// view is not stable at prepare time.
pub struct BackdropBlit {
    pub pipeline: CachedRenderPipelineId,
    pub uniform_offset: u32,
    pub target: TextureView,
}

/// Per-frame backdrop staging, index-aligned with
/// [`ExtractedUiLayers::layers`]. Owns its own uniform buffers — the content
/// filter's [`LayerFilterMeta`](super::LayerFilterMeta) buffer is written by
/// its own system, and a shared buffer across systems would order-couple the
/// writes.
#[derive(Resource)]
pub struct BackdropMeta {
    pub blit_uniforms: DynamicUniformBuffer<BackdropBlitUniforms>,
    pub filter_uniforms: DynamicUniformBuffer<FilterUniforms>,
    pub blits: Vec<Option<BackdropBlit>>,
    pub runs: Vec<Option<LayerFilterRun>>,
}

impl Default for BackdropMeta {
    fn default() -> Self {
        let mut blit_uniforms = DynamicUniformBuffer::default();
        blit_uniforms.set_label(Some("ui_layer_backdrop_blit_uniforms"));
        let mut filter_uniforms = DynamicUniformBuffer::default();
        filter_uniforms.set_label(Some("ui_layer_backdrop_filter_uniforms"));
        Self {
            blit_uniforms,
            filter_uniforms,
            blits: Vec::new(),
            runs: Vec::new(),
        }
    }
}

/// Stage every backdrop's blit + filter run for this frame. Mirrors
/// `prepare_layer_filters`' three phases (stage → write buffers + bind
/// groups → predict validity), with two deliberate differences: staging is
/// unconditional per frame (the source frame is live), and the validity
/// prediction requires the BLIT pipeline compiled too — the chain would
/// otherwise filter a garbage snapshot.
#[allow(clippy::too_many_arguments)]
pub fn prepare_layer_backdrops(
    extracted: Res<ExtractedUiLayers>,
    mut store: ResMut<LayerTextureStore>,
    filter_pipeline: Option<Res<LayerFilterPipeline>>,
    blit_pipeline: Option<Res<BackdropBlitPipeline>>,
    mut specialized_filters: ResMut<SpecializedRenderPipelines<LayerFilterPipeline>>,
    mut specialized_blits: ResMut<SpecializedRenderPipelines<BackdropBlitPipeline>>,
    pipeline_cache: Res<PipelineCache>,
    render_device: Res<RenderDevice>,
    render_queue: Res<RenderQueue>,
    cameras: Query<&ExtractedCamera>,
    time: Res<Time>,
    mut meta: ResMut<BackdropMeta>,
) {
    let BackdropMeta {
        blit_uniforms,
        filter_uniforms,
        blits,
        runs,
    } = &mut *meta;
    blit_uniforms.clear();
    filter_uniforms.clear();
    blits.clear();
    runs.clear();
    blits.resize_with(extracted.layers.len(), || None);
    runs.resize_with(extracted.layers.len(), || None);
    let (Some(filter_pipeline), Some(blit_pipeline)) = (filter_pipeline, blit_pipeline) else {
        return;
    };
    // The snapshot rect maps into the main texture through the camera's
    // physical viewport: layer coordinates are viewport-relative, the main
    // texture covers the whole target.
    let Some(camera) = extracted
        .camera_render_entity
        .and_then(|e| cameras.get(e).ok())
    else {
        return;
    };
    let Some(target_size) = camera.physical_target_size else {
        return;
    };
    let viewport_offset = camera
        .viewport
        .as_ref()
        .map_or(Vec2::ZERO, |v| v.physical_position.as_vec2());
    let target_size = target_size.as_vec2().max(Vec2::ONE);

    // Phase 1: stage uniforms + specialize pipelines.
    struct StagedBackdrop {
        blit_pipeline: CachedRenderPipelineId,
        blit_offset: u32,
        passes: Vec<(CachedRenderPipelineId, u32)>,
    }
    let mut staged: Vec<(usize, StagedBackdrop)> = Vec::new();
    for (idx, layer) in extracted.layers.iter().enumerate() {
        let Some(chain) = &layer.backdrop_chain else {
            continue;
        };
        let Some(slot) = store.slots.get_mut(&layer.main_entity) else {
            continue;
        };
        let size = slot.size;
        let Some(backdrop) = slot.backdrop.as_mut() else {
            continue;
        };
        // A chain edit may swap in different shaders — re-arm the warn so a
        // new failure gets its own report (same rule as the content filter).
        if backdrop.params_version != chain.version {
            backdrop.gated_frames = 0;
            backdrop.gate_warned = false;
        }
        backdrop.params_version = chain.version;
        // The run supersedes whatever the outputs hold; phase 3 re-marks
        // valid iff blit + passes will all execute.
        backdrop.output_valid = false;
        backdrop.output_index = filter_output_index(chain.passes.len());

        let blit_id = specialized_blits.specialize(
            &pipeline_cache,
            &blit_pipeline,
            BackdropBlitPipelineKey {
                target_format: layer.target_format,
            },
        );
        let blit_offset = blit_uniforms.push(&BackdropBlitUniforms {
            src_uv_min: (viewport_offset + layer.min) / target_size,
            src_uv_scale: size.as_vec2() / target_size,
        });

        let resolution = size.as_vec2();
        let texel_size = Vec2::ONE / resolution;
        let passes = chain
            .passes
            .iter()
            .map(|pass| {
                let id = specialized_filters.specialize(
                    &pipeline_cache,
                    &filter_pipeline,
                    LayerFilterPipelineKey {
                        shader: pass.shader.clone(),
                        target_format: layer.target_format,
                    },
                );
                let offset = filter_uniforms.push(&FilterUniforms {
                    time: time.elapsed_secs(),
                    pad_a: 0.0,
                    resolution,
                    texel_size,
                    // The backdrop snapshot covers the layer's inflated
                    // capture rect, so the node rect sits `outset` px in —
                    // same as the content chain.
                    content_inset: Vec2::splat(layer.outset as f32),
                    params: pass.params,
                });
                (id, offset)
            })
            .collect();
        staged.push((
            idx,
            StagedBackdrop {
                blit_pipeline: blit_id,
                blit_offset,
                passes,
            },
        ));
    }
    if staged.is_empty() {
        return;
    }

    // Phase 2: write the uniforms, then build the chain's per-pass bind
    // groups against the (possibly fresh) buffer. The BLIT bind group is
    // deliberately NOT built here — see the module doc.
    blit_uniforms.write_buffer(&render_device, &render_queue);
    filter_uniforms.write_buffer(&render_device, &render_queue);
    let Some(uniform_binding) = filter_uniforms.binding() else {
        return;
    };
    let layout = pipeline_cache.get_bind_group_layout(&filter_pipeline.layout);
    for (idx, staged) in staged {
        let layer = &extracted.layers[idx];
        let Some(slot) = store.slots.get(&layer.main_entity) else {
            continue;
        };
        let Some(backdrop) = slot.backdrop.as_ref() else {
            continue;
        };
        let passes = staged
            .passes
            .iter()
            .enumerate()
            .map(|(i, &(pipeline, uniform_offset))| {
                let source = match filter_source_index(i) {
                    // Pass 0 samples the snapshot — the backdrop's "capture".
                    None => &backdrop.snapshot.default_view,
                    Some(ping) => &backdrop.textures[ping].default_view,
                };
                let bind_group = render_device.create_bind_group(
                    "ui_layer_backdrop_filter",
                    &layout,
                    &BindGroupEntries::sequential((
                        source,
                        &filter_pipeline.sampler,
                        uniform_binding.clone(),
                        // Binding 3 (`capture_texture`) = the unfiltered
                        // snapshot, so combine-style passes (bloom) composite
                        // over the real backdrop.
                        &backdrop.snapshot.default_view,
                    )),
                );
                LayerFilterPass {
                    pipeline,
                    bind_group,
                    uniform_offset,
                    target: backdrop.textures[filter_target_index(i)]
                        .default_view
                        .clone(),
                }
            })
            .collect();
        blits[idx] = Some(BackdropBlit {
            pipeline: staged.blit_pipeline,
            uniform_offset: staged.blit_offset,
            target: backdrop.snapshot.default_view.clone(),
        });
        runs[idx] = Some(LayerFilterRun { passes });
    }

    // Phase 3: predict execution. Valid iff the blit AND every chain pass
    // resolve now (compiled pipelines never regress within a frame). No
    // source-content requirement: the main texture always holds a complete
    // frame at blit time.
    for idx in 0..extracted.layers.len() {
        let (Some(blit), Some(run)) = (
            blits.get(idx).and_then(Option::as_ref),
            runs.get(idx).and_then(Option::as_ref),
        ) else {
            continue;
        };
        let Some(slot) = store.slots.get_mut(&extracted.layers[idx].main_entity) else {
            continue;
        };
        let ready = pipeline_cache.get_render_pipeline(blit.pipeline).is_some()
            && run
                .passes
                .iter()
                .all(|pass| pipeline_cache.get_render_pipeline(pass.pipeline).is_some());
        if ready && let Some(backdrop) = slot.backdrop.as_mut() {
            backdrop.output_valid = true;
            backdrop.gated_frames = 0;
            backdrop.gate_warned = false;
        }
    }
}

/// Execute one layer's staged backdrop work inside the capture-pass
/// encoder: blit the frame region into the snapshot, then replay the chain
/// snapshot → ping-pong. Called per layer from `ui_layer_capture_pass`,
/// before stock `ui_pass` consumes the quads.
pub fn run_backdrop_passes(
    idx: usize,
    meta: &BackdropMeta,
    blit_pipeline: Option<&BackdropBlitPipeline>,
    main_texture: &TextureView,
    pipeline_cache: &PipelineCache,
    ctx: &mut RenderContext,
) {
    let (Some(blit), Some(run)) = (
        meta.blits.get(idx).and_then(Option::as_ref),
        meta.runs.get(idx).and_then(Option::as_ref),
    ) else {
        return;
    };
    let Some(blit_pipeline_res) = blit_pipeline else {
        return;
    };
    // All-or-nothing across blit + chain: a partial run would leave the
    // outputs inconsistent, and `output_valid` was only set if everything
    // resolved at prepare.
    let Some(blit_compiled) = pipeline_cache.get_render_pipeline(blit.pipeline) else {
        return;
    };
    let chain_compiled: Option<Vec<_>> = run
        .passes
        .iter()
        .map(|pass| pipeline_cache.get_render_pipeline(pass.pipeline))
        .collect();
    let Some(chain_compiled) = chain_compiled else {
        return;
    };
    let Some(blit_binding) = meta.blit_uniforms.binding() else {
        return;
    };
    // The blit bind group is created here, against THIS moment's main
    // texture view (see the module doc's a/b-flip rationale). One group per
    // layer is fine: backdrop layers are rare relative to UI nodes, and the
    // view can differ between invocations.
    let blit_bind_group = ctx.render_device().create_bind_group(
        "ui_layer_backdrop_blit",
        &pipeline_cache.get_bind_group_layout(&blit_pipeline_res.layout),
        &BindGroupEntries::sequential((main_texture, &blit_pipeline_res.sampler, blit_binding)),
    );
    {
        let mut pass = ctx.begin_tracked_render_pass(RenderPassDescriptor {
            label: Some("ui_layer_backdrop_blit"),
            color_attachments: &[Some(RenderPassColorAttachment {
                view: &blit.target,
                depth_slice: None,
                resolve_target: None,
                ops: Operations {
                    // Replace-write of every texel; Clear skips loading stale
                    // contents on tiled GPUs.
                    load: LoadOp::Clear(LinearRgba::NONE.into()),
                    store: StoreOp::Store,
                },
            })],
            depth_stencil_attachment: None,
            timestamp_writes: None,
            occlusion_query_set: None,
            multiview_mask: None,
        });
        pass.set_render_pipeline(blit_compiled);
        pass.set_bind_group(0, &blit_bind_group, &[blit.uniform_offset]);
        pass.draw(0..3, 0..1);
    }
    for (pass_data, pipeline) in run.passes.iter().zip(chain_compiled) {
        let mut pass = ctx.begin_tracked_render_pass(RenderPassDescriptor {
            label: Some("ui_layer_backdrop_filter"),
            color_attachments: &[Some(RenderPassColorAttachment {
                view: &pass_data.target,
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
        pass.set_bind_group(0, &pass_data.bind_group, &[pass_data.uniform_offset]);
        pass.draw(0..3, 0..1);
    }
}

/// Fetch the camera's current main-texture view for [`run_backdrop_passes`].
/// `None` (no `ViewTarget` on the camera) skips every backdrop this frame.
pub fn camera_main_texture(world: &World, camera: Option<Entity>) -> Option<TextureView> {
    let target = world.get::<ViewTarget>(camera?)?;
    Some(target.main_texture_view().clone())
}

/// The backdrop quad's clipped geometry: the UN-inflated border box
/// (`min + outset .. min + size − outset`) with UVs relative to the
/// INFLATED snapshot — frost never paints in the outset ring, but its blur
/// was computed with real neighborhood. `None` = fully clipped away (or a
/// degenerate box), draw nothing.
pub fn backdrop_quad(
    min: Vec2,
    size: UVec2,
    outset: u32,
    clip: Option<Rect>,
) -> Option<ClippedQuad> {
    let size = size.as_vec2();
    let inset = Vec2::splat(outset as f32);
    let box_min = min + inset;
    let box_max = min + size - inset;
    let (pos_min, pos_max) = match clip {
        None => (box_min, box_max),
        Some(c) => (box_min.max(c.min), box_max.min(c.max)),
    };
    if pos_min.x >= pos_max.x || pos_min.y >= pos_max.y {
        return None;
    }
    Some(ClippedQuad {
        pos_min,
        pos_max,
        uv_min: (pos_min - min) / size,
        uv_max: (pos_max - min) / size,
    })
}

/// Whether this layer's backdrop composite may draw this frame, maintaining
/// the gate-warn bookkeeping. Returns the bind group to sample when ready.
/// Mirrors the content-filter gate in `prepare_layer_composites`, with a
/// milder warning: a withheld BACKDROP quad shows the unfiltered frame (the
/// pixels are already in the target), never an invisible subtree.
#[allow(clippy::too_many_arguments)]
pub fn backdrop_gate(
    idx: usize,
    main_entity: bevy::render::sync_world::MainEntity,
    backdrop: &mut BackdropSlot,
    meta: &BackdropMeta,
    pipeline_cache: &PipelineCache,
    render_device: &RenderDevice,
    atlas_layout: &BindGroupLayoutDescriptor,
    sampler: &Sampler,
) -> Option<BindGroup> {
    if !backdrop.output_valid {
        backdrop.gated_frames = backdrop.gated_frames.saturating_add(1);
        if !backdrop.gate_warned {
            let compile_error = meta
                .runs
                .get(idx)
                .and_then(|run| run.as_ref())
                .into_iter()
                .flat_map(|run| run.passes.iter().map(|p| p.pipeline))
                .chain(
                    meta.blits
                        .get(idx)
                        .and_then(|b| b.as_ref())
                        .map(|b| b.pipeline),
                )
                .find_map(
                    |pipeline| match pipeline_cache.get_render_pipeline_state(pipeline) {
                        CachedPipelineState::Err(
                            e @ (bevy::shader::ShaderCacheError::ProcessShaderError(_)
                            | bevy::shader::ShaderCacheError::CreateShaderModule(_)),
                        ) => Some(e.to_string()),
                        _ => None,
                    },
                );
            if let Some(err) = compile_error {
                warn!(
                    "UI layer {main_entity:?}: a backdropFilter pass shader failed to \
                     compile — the region shows the UNFILTERED frame until fixed (the \
                     backdrop gate is graceful; the node's own content still draws). \
                     Error: {err}",
                );
                backdrop.gate_warned = true;
            } else if backdrop.gated_frames == STUCK_GATE_HANG_FRAMES {
                warn!(
                    "UI layer {main_entity:?}: backdrop quad withheld for {} consecutive \
                     frames and its pipeline is still not ready (no compile error \
                     reported). The region shows the unfiltered frame until it resolves.",
                    STUCK_GATE_HANG_FRAMES,
                );
                backdrop.gate_warned = true;
            }
        }
        return None;
    }
    let output = backdrop.output_index;
    if !matches!(&backdrop.composite_bind_group, Some((built, _)) if *built == output) {
        backdrop.composite_bind_group = Some((
            output,
            render_device.create_bind_group(
                "ui_layer_composite_backdrop",
                &pipeline_cache.get_bind_group_layout(atlas_layout),
                &BindGroupEntries::sequential((&backdrop.textures[output].default_view, sampler)),
            ),
        ));
    }
    backdrop
        .composite_bind_group
        .as_ref()
        .map(|(_, bind_group)| bind_group.clone())
}

/// The backdrop quad's stacking offset below its layer's first stolen item.
/// `stack_z_offsets::BACKGROUND_COLOR` is `0.0`, so an explicit negative
/// epsilon is required to sort strictly under the content composite quad
/// (which sits AT the first stolen key). Per-node z offsets span −0.1..0.08
/// and adjacent stack indices differ by 1.0, so 0.005 can never sink the
/// quad under a preceding sibling.
pub const BACKDROP_UNDERLAY_EPSILON: f32 = 0.005;

/// Sanity math for [`ExtractedUiLayers`]-driven vertex staging lives with
/// the pure helpers; see the tests below.
#[cfg(test)]
mod tests {
    use super::*;

    /// `backdrop_quad` shrink+UV table: the quad covers the un-inflated
    /// border box with UVs mapping the box's position inside the inflated
    /// snapshot; clips clamp position and UVs together; degenerate boxes
    /// (outset ≥ half the rect) draw nothing.
    #[test]
    fn backdrop_quad_shrinks_to_border_box_with_inflated_uvs() {
        let min = Vec2::new(100.0, 200.0);
        let size = UVec2::new(132, 96); // border box 100×64 + outset 16
        let q = backdrop_quad(min, size, 16, None).expect("quad");
        assert_eq!(q.pos_min, Vec2::new(116.0, 216.0));
        assert_eq!(q.pos_max, Vec2::new(216.0, 280.0));
        assert_eq!(q.uv_min, Vec2::new(16.0 / 132.0, 16.0 / 96.0));
        assert_eq!(q.uv_max, Vec2::new(116.0 / 132.0, 80.0 / 96.0));

        // Zero outset: the border box IS the rect, full UV window.
        let q = backdrop_quad(min, size, 0, None).expect("quad");
        assert_eq!(q.pos_min, min);
        assert_eq!(q.uv_min, Vec2::ZERO);
        assert_eq!(q.uv_max, Vec2::ONE);

        // An ancestor clip clamps position and UVs proportionally.
        let clip = Rect::new(150.0, 216.0, 400.0, 400.0);
        let q = backdrop_quad(min, size, 16, Some(clip)).expect("quad");
        assert_eq!(q.pos_min, Vec2::new(150.0, 216.0));
        assert_eq!(q.pos_max, Vec2::new(216.0, 280.0));
        assert_eq!(q.uv_min, Vec2::new(50.0 / 132.0, 16.0 / 96.0));

        // Fully clipped away → None.
        let far = Rect::new(1000.0, 1000.0, 2000.0, 2000.0);
        assert!(backdrop_quad(min, size, 16, Some(far)).is_none());

        // Degenerate: outset eats the whole box.
        assert!(backdrop_quad(min, UVec2::new(20, 20), 16, None).is_none());
    }

    /// The underlay epsilon sorts strictly under the content quad for
    /// representative first-stolen keys, including a negative
    /// (box-shadow-like) offset, without crossing a whole stack index.
    #[test]
    fn underlay_epsilon_sorts_under_content_quad() {
        for first_key in [0.0f32, -0.1, 0.08, 41.0, -3.05] {
            let content = first_key; // + stack_z_offsets::BACKGROUND_COLOR == 0.0
            let backdrop = first_key - BACKDROP_UNDERLAY_EPSILON;
            assert!(backdrop < content, "key {first_key}");
            assert!(content - backdrop < 1.0, "must stay within the stack slot");
        }
    }
}
