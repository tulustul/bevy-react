//! Render-world half of `morphFilter`: the freeze (stealing the layer's
//! on-screen pixels as the "from" snapshot), the per-frame blend pass, and
//! the morph composite gate.
//!
//! Per frame, for each layer with an extracted morph
//! ([`ExtractedMorph`] — an active [`crate::filters::MorphState`] plus a
//! resolved single-pass chain):
//!
//! 1. [`freeze_morph_snapshot`] + [`maintain_morph_blend`] (called from
//!    `prepare_layer_textures`, bracketing its realloc) maintain the
//!    [`MorphSlot`]. A new `freeze_seq` **steals** the pixels currently on
//!    screen — the previous blend (an interrupted morph's in-flight mix) or
//!    the capture texture itself — as `snapshot`, *before* the realloc that
//!    a same-frame content/size change would trigger drops them. No
//!    blit/copy: taking over the texture is free and survives reallocs by
//!    construction. Nothing valid to freeze (startup) degrades to no
//!    snapshot — the blend becomes a self-blend of the live capture (a
//!    visual snap while progress runs, never garbage).
//! 2. [`prepare_layer_morphs`] (PrepareBindGroups, after
//!    `prepare_layer_textures`, before `prepare_layer_filters`) stages the
//!    single blend pass every frame while the morph is in flight (progress
//!    moves — the uniforms change even when nothing else does), reusing the
//!    content-filter pipeline wholesale: binding 0 = the live capture (the
//!    "to"), binding 3 = the snapshot (the "from" — layout-anchored, plain
//!    0..1 UV stretches it onto the current capture rect), target = the
//!    dedicated `blend` texture. The engine writes the reserved
//!    `params[7].x` = progress (see the MORPH CONTRACT in
//!    `filter_prelude.wgsl`).
//! 3. [`run_morph_passes`] (called from `ui_layer_capture_pass`, after the
//!    layer's capture, before its regular filter run) executes the pass.
//! 4. The regular `filter` chain (if any) sources the blend instead of the
//!    capture — morph first, then filters; a morph-ONLY layer's composite
//!    quad samples `blend` directly, gated by [`morph_gate`] with the same
//!    never-show-partial-content discipline as the content-filter gate.
//!
//! The blend target is deliberately NOT a prepended ping-pong pass: with a
//! ≥2-pass regular chain, pass 2 would overwrite the blend's ping-pong slot,
//! and the interrupt freeze (which steals the *blended* output) would freeze
//! a re-filtered image instead. A dedicated texture keeps the regular
//! chain's indices untouched and the freeze source well-defined.

use bevy::math::{UVec2, Vec2, Vec4};
use bevy::prelude::*;
use bevy::render::render_resource::*;
use bevy::render::renderer::{RenderContext, RenderDevice, RenderQueue};
use bevy::render::texture::CachedTexture;
use bevy::shader::ShaderCacheError;

use super::store::alloc_capture_texture;
use super::{
    ExtractedFilterPass, ExtractedLayer, ExtractedUiLayers, FilterUniforms, LayerFilterPass,
    LayerFilterPipeline, LayerFilterPipelineKey, LayerFilterRun, LayerSlot, LayerTextureStore,
    STUCK_GATE_HANG_FRAMES,
};

/// A layer's morph, as seen by the render world this frame. Present iff the
/// main-world [`crate::filters::MorphState`] is active AND the resolved
/// morph chain has exactly one pass (the resolver's cap).
pub struct ExtractedMorph {
    /// Mirrors [`crate::filters::MorphState::freeze_seq`]; a value the slot
    /// hasn't consumed yet triggers the steal in [`freeze_morph_snapshot`].
    pub freeze_seq: u64,
    /// The eased blend progress, `0..=1`.
    pub progress: f32,
    /// Mirrors the resolved chain's version — re-arms the stuck-gate warn on
    /// param/shader edits (the run itself restages every frame regardless).
    pub version: u32,
    /// The single blend pass (shader + packed user params; the engine
    /// overwrites the reserved tail at staging).
    pub pass: ExtractedFilterPass,
}

/// A layer's persistent morph resources: the frozen `snapshot` (the "from"
/// texture, stolen at freeze) and the dedicated `blend` target the morph
/// pass writes (what the regular chain — or the composite — samples).
/// Preserved across [`LayerSlot`] reallocs (the snapshot must survive a
/// same-frame capture resize on the freeze frame); cleared when the
/// extracted morph disappears (settle, unset, demote).
pub struct MorphSlot {
    /// The frozen "from" pixels, layout-anchored: the blend stretches them
    /// onto the current capture rect (0..1 UV over both textures). `None` =
    /// nothing valid to freeze existed (startup) — the pass degrades to a
    /// self-blend of the live capture.
    pub snapshot: Option<CachedTexture>,
    /// The blend target (`RENDER_ATTACHMENT | TEXTURE_BINDING`), allocated
    /// at the capture's size + format and re-allocated when they change
    /// (its content is rewritten every in-flight frame anyway).
    pub blend: CachedTexture,
    /// The blend's allocation key.
    pub blend_size: UVec2,
    /// The last consumed [`ExtractedMorph::freeze_seq`].
    pub seen_seq: u64,
    /// The staged chain version (warn re-arm only; see
    /// [`ExtractedMorph::version`]).
    pub params_version: u32,
    /// Whether `blend` holds a complete morph output. Predicted at prepare
    /// (pipeline compiled AND the live capture valid); while false a
    /// morph-only composite is withheld ([`morph_gate`]) and a downstream
    /// regular chain keeps its own output invalid.
    pub output_valid: bool,
    /// Consecutive withheld frames; drives the stuck-gate warn.
    pub gated_frames: u32,
    /// Once-per-episode warn latch (see `FilterSlot::gate_warned`).
    pub gate_warned: bool,
    /// Composite bind group over `blend` (morph-only layers); dies with the
    /// blend realloc.
    pub composite_bind_group: Option<BindGroup>,
}

/// Consume a new `freeze_seq`: steal the pixels currently on screen as the
/// snapshot and reset the slot's morph state around it. MUST run before the
/// caller's realloc branch — the steal reads the pre-realloc textures — and
/// the caller must preserve `slot.morph` across that realloc.
pub fn freeze_morph_snapshot(
    slot: &mut LayerSlot,
    layer: &ExtractedLayer,
    wanted: UVec2,
    render_device: &RenderDevice,
) {
    let Some(morph) = &layer.morph else {
        return;
    };
    if slot
        .morph
        .as_ref()
        .is_some_and(|m| m.seen_seq == morph.freeze_seq)
    {
        return;
    }
    let snapshot = match slot.morph.take() {
        // Interrupt: the previous blend holds the in-flight mix that is on
        // screen right now — exactly what the restarted morph eases FROM.
        Some(prev) if prev.output_valid => Some(prev.blend),
        _ => {
            if slot.content_valid {
                // Plain freeze: the capture holds last frame's appearance.
                // Steal it and give the slot a fresh texture — the freeze
                // frame re-captures anyway (the channel pushed capture dirt),
                // and every capture-derived state resets with it.
                let (fresh, fresh_mips) = alloc_capture_texture(
                    render_device,
                    "ui_layer_capture",
                    slot.size,
                    slot.format,
                    slot.mips.is_some(),
                );
                let stolen = std::mem::replace(&mut slot.texture, fresh);
                slot.mips = fresh_mips;
                slot.mips_valid = false;
                slot.bind_group = None;
                slot.bind_group_mips = None;
                slot.content_valid = false;
                Some(stolen)
            } else {
                // Nothing valid on screen (startup): degrade to a self-blend.
                None
            }
        }
    };
    let (blend, _) = alloc_capture_texture(
        render_device,
        "ui_layer_morph_blend",
        wanted,
        layer.target_format,
        false,
    );
    slot.morph = Some(MorphSlot {
        snapshot,
        blend,
        blend_size: wanted,
        seen_seq: morph.freeze_seq,
        params_version: 0,
        output_valid: false,
        gated_frames: 0,
        gate_warned: false,
        composite_bind_group: None,
    });
}

/// Post-realloc maintenance: clear the slot when the morph ended, and track
/// the capture size with the blend target (a mid-flight resize re-allocates
/// the blend only — the snapshot survives untouched).
pub fn maintain_morph_blend(
    slot: &mut LayerSlot,
    layer: &ExtractedLayer,
    wanted: UVec2,
    render_device: &RenderDevice,
) {
    if layer.morph.is_none() {
        slot.morph = None;
        return;
    }
    if let Some(morph) = slot.morph.as_mut()
        && morph.blend_size != wanted
    {
        let (blend, _) = alloc_capture_texture(
            render_device,
            "ui_layer_morph_blend",
            wanted,
            layer.target_format,
            false,
        );
        morph.blend = blend;
        morph.blend_size = wanted;
        morph.output_valid = false;
        morph.composite_bind_group = None;
    }
}

/// Per-frame morph staging, index-aligned with
/// [`ExtractedUiLayers::layers`]. Owns its own uniform buffer (the shared-
/// buffer order-coupling rule — see `BackdropMeta`).
#[derive(Resource)]
pub struct MorphMeta {
    pub uniforms: DynamicUniformBuffer<FilterUniforms>,
    pub runs: Vec<Option<LayerFilterRun>>,
}

impl Default for MorphMeta {
    fn default() -> Self {
        let mut uniforms = DynamicUniformBuffer::default();
        uniforms.set_label(Some("ui_layer_morph_uniforms"));
        Self {
            uniforms,
            runs: Vec::new(),
        }
    }
}

/// The engine-reserved param tail of a morph pass (see the MORPH CONTRACT in
/// `filter_prelude.wgsl`): `params[7].x` = progress (`params[6]` is a
/// reserved-unused spare). The snapshot needs no transform: it is
/// layout-anchored, stretched onto the current capture rect by the plain
/// 0..1 UV lookup. Returns the padded params with the tail written.
fn morph_engine_params(
    user: &[Vec4; crate::filters::MAX_FILTER_PARAM_VECS],
    progress: f32,
) -> [Vec4; crate::filters::MAX_FILTER_PARAM_VECS] {
    let mut params = *user;
    params[7].x = progress.clamp(0.0, 1.0);
    params
}

/// Stage every morphing layer's blend pass for this frame. Mirrors
/// `prepare_layer_filters`' three phases; staging is unconditional per
/// in-flight frame (progress moves every frame). Ordered after
/// `prepare_layer_textures` (the slot/blend exist) and before
/// `prepare_layer_filters` (the regular chain's validity prediction reads
/// [`MorphSlot::output_valid`]).
#[allow(clippy::too_many_arguments)]
pub fn prepare_layer_morphs(
    extracted: Res<ExtractedUiLayers>,
    mut store: ResMut<LayerTextureStore>,
    pipeline: Option<Res<LayerFilterPipeline>>,
    mut specialized: ResMut<SpecializedRenderPipelines<LayerFilterPipeline>>,
    pipeline_cache: Res<PipelineCache>,
    render_device: Res<RenderDevice>,
    render_queue: Res<RenderQueue>,
    time: Res<Time>,
    mut meta: ResMut<MorphMeta>,
) {
    let MorphMeta { uniforms, runs } = &mut *meta;
    uniforms.clear();
    runs.clear();
    runs.resize_with(extracted.layers.len(), || None);
    let Some(pipeline) = pipeline else {
        return;
    };

    // Phase 1: stage uniforms + specialize.
    let mut staged: Vec<(usize, CachedRenderPipelineId, u32)> = Vec::new();
    for (idx, layer) in extracted.layers.iter().enumerate() {
        // Idle morph: pre-specialize the blend pipeline so the async compile
        // runs while nothing is on screen — the first key change then finds
        // it cached instead of gating the composite (a visible blink of the
        // subtree). Specialization is memoized per (shader, format), so the
        // steady-state cost is a hash lookup.
        if let Some(shader) = &layer.morph_warm {
            specialized.specialize(
                &pipeline_cache,
                &pipeline,
                LayerFilterPipelineKey {
                    shader: shader.clone(),
                    target_format: layer.target_format,
                },
            );
        }
        let Some(extracted_morph) = &layer.morph else {
            continue;
        };
        let Some(slot) = store.slots.get_mut(&layer.main_entity) else {
            continue;
        };
        let size = slot.size;
        let Some(morph) = slot.morph.as_mut() else {
            continue;
        };
        // A param/shader edit gets its own once-per-episode gate warn.
        if morph.params_version != extracted_morph.version {
            morph.gated_frames = 0;
            morph.gate_warned = false;
        }
        morph.params_version = extracted_morph.version;
        // The run supersedes whatever the blend holds; phase 3 re-marks
        // valid iff the pass will execute over a valid capture.
        morph.output_valid = false;

        let id = specialized.specialize(
            &pipeline_cache,
            &pipeline,
            LayerFilterPipelineKey {
                shader: extracted_morph.pass.shader.clone(),
                target_format: layer.target_format,
            },
        );
        let resolution = size.as_vec2();
        let offset = uniforms.push(&FilterUniforms {
            time: time.elapsed_secs(),
            pad_a: 0.0,
            resolution,
            texel_size: Vec2::ONE / resolution,
            pad_b: Vec2::ZERO,
            params: morph_engine_params(&extracted_morph.pass.params, extracted_morph.progress),
        });
        staged.push((idx, id, offset));
    }
    if staged.is_empty() {
        return;
    }

    // Phase 2: write the uniforms, then build the bind groups against the
    // (possibly fresh) buffer.
    uniforms.write_buffer(&render_device, &render_queue);
    let Some(uniform_binding) = uniforms.binding() else {
        return;
    };
    let layout = pipeline_cache.get_bind_group_layout(&pipeline.layout);
    for (idx, pipeline_id, uniform_offset) in staged {
        let layer = &extracted.layers[idx];
        let Some(slot) = store.slots.get(&layer.main_entity) else {
            continue;
        };
        let Some(morph) = slot.morph.as_ref() else {
            continue;
        };
        // Binding 0 = the live capture (the "to"); binding 3 = the frozen
        // snapshot (the "from" — or the live capture again on degrade, the
        // self-blend). Target = the dedicated blend texture.
        let from_view = morph
            .snapshot
            .as_ref()
            .map_or(&slot.texture.default_view, |s| &s.default_view);
        let bind_group = render_device.create_bind_group(
            "ui_layer_morph",
            &layout,
            &BindGroupEntries::sequential((
                &slot.texture.default_view,
                &pipeline.sampler,
                uniform_binding.clone(),
                from_view,
            )),
        );
        runs[idx] = Some(LayerFilterRun {
            passes: vec![LayerFilterPass {
                pipeline: pipeline_id,
                bind_group,
                uniform_offset,
                target: morph.blend.default_view.clone(),
            }],
        });
    }

    // Phase 3: predict execution (compiled pipelines never regress within a
    // frame). The live capture must be valid too — blending a blank/partial
    // capture would put garbage on screen.
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
            && let Some(morph) = slot.morph.as_mut()
        {
            morph.output_valid = true;
            morph.gated_frames = 0;
            morph.gate_warned = false;
        }
    }
}

/// Execute one layer's staged morph pass inside the capture-pass encoder:
/// capture (already rendered) + snapshot → blend. Called per layer from
/// `ui_layer_capture_pass`, after the capture, before the regular filter
/// replay (which sources the blend).
pub fn run_morph_passes(
    idx: usize,
    meta: &MorphMeta,
    pipeline_cache: &PipelineCache,
    ctx: &mut RenderContext,
) {
    let Some(run) = meta.runs.get(idx).and_then(Option::as_ref) else {
        return;
    };
    for pass_data in &run.passes {
        let Some(pipeline) = pipeline_cache.get_render_pipeline(pass_data.pipeline) else {
            // Still compiling: `output_valid` stayed false at prepare, the
            // composite is gated, and the layer restages next frame.
            return;
        };
        let mut pass = ctx.begin_tracked_render_pass(RenderPassDescriptor {
            label: Some("ui_layer_morph"),
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

/// Whether a morph-ONLY layer's composite may draw this frame, maintaining
/// the gate-warn bookkeeping. Returns the bind group over `blend` when
/// ready. Same discipline as the content-filter gate: never fall back to
/// the raw capture (the mid-blend flash this gate exists to prevent).
#[allow(clippy::too_many_arguments)]
pub fn morph_gate(
    idx: usize,
    main_entity: bevy::render::sync_world::MainEntity,
    morph: &mut MorphSlot,
    meta: &MorphMeta,
    pipeline_cache: &PipelineCache,
    render_device: &RenderDevice,
    atlas_layout: &BindGroupLayoutDescriptor,
    sampler: &Sampler,
) -> Option<BindGroup> {
    if !morph.output_valid {
        morph.gated_frames = morph.gated_frames.saturating_add(1);
        if !morph.gate_warned {
            let compile_error = meta
                .runs
                .get(idx)
                .and_then(|run| run.as_ref())
                .and_then(|run| {
                    run.passes.iter().find_map(|pass| {
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
                    "UI layer {main_entity:?}: the morphFilter pass shader failed to \
                     compile — the layer's subtree is invisible while the morph is in \
                     flight (the composite gate never falls back to unblended content). \
                     Error: {err}",
                );
                morph.gate_warned = true;
            } else if morph.gated_frames == STUCK_GATE_HANG_FRAMES {
                warn!(
                    "UI layer {main_entity:?}: morph composite withheld for {} consecutive \
                     frames and its pipeline is still not ready (no compile error \
                     reported). The layer's subtree is invisible until it resolves.",
                    STUCK_GATE_HANG_FRAMES,
                );
                morph.gate_warned = true;
            }
        }
        return None;
    }
    if morph.composite_bind_group.is_none() {
        morph.composite_bind_group = Some(render_device.create_bind_group(
            "ui_layer_composite_morph",
            &pipeline_cache.get_bind_group_layout(atlas_layout),
            &BindGroupEntries::sequential((&morph.blend.default_view, sampler)),
        ));
    }
    morph.composite_bind_group.clone()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::filters::MAX_FILTER_PARAM_VECS;

    /// The reserved tail: progress lands in `params[7].x` (clamped), user
    /// params — including the now-spare `params[6]` slot — survive
    /// untouched.
    #[test]
    fn morph_engine_params_writes_clamped_progress() {
        let mut user = [Vec4::ZERO; MAX_FILTER_PARAM_VECS];
        user[0] = Vec4::new(1.0, 2.0, 3.0, 4.0);

        let p = morph_engine_params(&user, 0.25);
        assert_eq!(p[0], user[0], "user params untouched");
        assert_eq!(p[6], Vec4::ZERO, "spare slot untouched");
        assert_eq!(p[7].x, 0.25);

        let p = morph_engine_params(&user, 2.0);
        assert_eq!(p[7].x, 1.0, "progress clamps");
    }
}
