//! Mip-chain generation for 3D-transformed layers' capture textures.
//!
//! A transformed composite quad minifies its capture (tilt compresses many
//! texels per pixel); bilinear-only sampling shimmers. Layers with the
//! `TRANSFORM3D` promotion reason therefore allocate their sampled texture
//! with a full mip chain ([`super::alloc_layer_slot`] /
//! [`super::alloc_filter_slot`], keyed on the *reason* so identity↔non-identity
//! value changes never realloc), and this module rebuilds the chain exactly
//! when level 0 is rewritten — a cached capture keeps its mips for free.
//!
//! The lifecycle mirrors the filter machinery: [`prepare_layer_mips`] stages
//! one [`MipRun`] per dirty chain (pipeline + per-level bind groups/targets —
//! the capture pass can create no GPU resources), `ui_layer_capture_pass`
//! replays it right after the layer's capture/filter passes, and the
//! composite samples through the trilinear/anisotropic sampler only while the
//! slot's `mips_valid` holds (the fallback is plain bilinear over level 0 —
//! never a gate, never a stale mip). For filtered layers the chain builds on
//! the **filter output ping-pong** (what the quad actually samples), not the
//! raw capture.
//!
//! Each downsample level is one fullscreen-triangle pass (`mip_blit.wgsl`)
//! sampling level `i` into level `i + 1`: linear filtering into a half-size
//! target is a standard 2×2 box downsample, correct on premultiplied content.

use bevy::asset::{AssetServer, Handle};
use bevy::prelude::*;
use bevy::render::render_resource::binding_types::{sampler, texture_2d};
use bevy::render::render_resource::{
    BindGroup, BindGroupEntries, BindGroupLayoutDescriptor, BindGroupLayoutEntries,
    CachedRenderPipelineId, ColorTargetState, ColorWrites, FilterMode, FragmentState,
    PipelineCache, RenderPipelineDescriptor, Sampler, SamplerBindingType, SamplerDescriptor,
    ShaderStages, SpecializedRenderPipeline, SpecializedRenderPipelines, Texture, TextureFormat,
    TextureSampleType, TextureView, TextureViewDescriptor, VertexState,
};
use bevy::render::renderer::RenderDevice;
use bevy::shader::Shader;

use super::{ExtractedUiLayers, FilterSlot, LayerTextureStore};

/// The per-texture mip-chain views a mipped slot carries. Built at alloc time
/// (the capture pass creates no views); the blit source bind groups are
/// filled lazily at first staging (they need the pipeline's layout) and die
/// with the slot on realloc.
pub struct MipChain {
    /// All-mips view — the trilinear composite sample source.
    pub full_view: TextureView,
    /// One single-mip view per level (`[0]` = base). Level `i + 1` is the
    /// render target of the pass that samples level `i`.
    pub level_views: Vec<TextureView>,
    /// Blit source bind groups: entry `i` samples `level_views[i]`.
    pub bind_groups: Vec<BindGroup>,
}

/// Mip levels for a texture of `size` — the full chain down to 1×1.
pub fn mip_level_count(size: UVec2) -> u32 {
    size.max(UVec2::ONE).max_element().ilog2() + 1
}

/// Build the per-level + full views for a texture allocated with
/// [`mip_level_count`] levels.
pub fn build_mip_chain(texture: &Texture, levels: u32) -> MipChain {
    let full_view = texture.create_view(&TextureViewDescriptor {
        label: Some("ui_layer_mips_full"),
        ..Default::default()
    });
    let level_views = (0..levels)
        .map(|level| {
            texture.create_view(&TextureViewDescriptor {
                label: Some("ui_layer_mip_level"),
                base_mip_level: level,
                mip_level_count: Some(1),
                ..Default::default()
            })
        })
        .collect();
    MipChain {
        full_view,
        level_views,
        bind_groups: Vec::new(),
    }
}

/// The downsample-blit pipeline: one texture + sampler bind group, no
/// uniforms (deliberately not the filter layout — that mandates the 160-byte
/// `FilterUniforms` via `min_binding_size`).
#[derive(Resource)]
pub struct LayerBlitPipeline {
    pub layout: BindGroupLayoutDescriptor,
    /// Linear clamp-to-edge, non-mipping — each pass samples exactly one
    /// level through a single-mip view.
    pub sampler: Sampler,
    pub shader: Handle<Shader>,
}

pub fn init_layer_blit_pipeline(
    mut commands: Commands,
    render_device: Res<RenderDevice>,
    asset_server: Res<AssetServer>,
) {
    let layout = BindGroupLayoutDescriptor::new(
        "ui_layer_blit_layout",
        &BindGroupLayoutEntries::sequential(
            ShaderStages::FRAGMENT,
            (
                texture_2d(TextureSampleType::Float { filterable: true }),
                sampler(SamplerBindingType::Filtering),
            ),
        ),
    );
    commands.insert_resource(LayerBlitPipeline {
        layout,
        sampler: render_device.create_sampler(&SamplerDescriptor {
            label: Some("ui_layer_blit_sampler"),
            mag_filter: FilterMode::Linear,
            min_filter: FilterMode::Linear,
            ..Default::default()
        }),
        shader: bevy::asset::load_embedded_asset!(asset_server.as_ref(), "mip_blit.wgsl"),
    });
}

#[derive(Clone, Copy, Hash, PartialEq, Eq)]
pub struct LayerBlitPipelineKey {
    pub target_format: TextureFormat,
}

impl SpecializedRenderPipeline for LayerBlitPipeline {
    type Key = LayerBlitPipelineKey;

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
                    // Replace-write: each level is fully overwritten.
                    blend: None,
                    write_mask: ColorWrites::ALL,
                })],
                ..Default::default()
            }),
            layout: vec![self.layout.clone()],
            label: Some("ui_layer_blit_pipeline".into()),
            ..Default::default()
        }
    }
}

/// One staged downsample pass: bind `bind_group` (source level), render 3
/// vertices into `target` (the next level).
pub struct MipLevel {
    pub bind_group: BindGroup,
    pub target: TextureView,
}

/// A layer's staged downsample chain this frame.
pub struct MipRun {
    pub pipeline: CachedRenderPipelineId,
    pub levels: Vec<MipLevel>,
}

/// Per-frame mip staging, index-aligned with [`ExtractedUiLayers::layers`].
/// `runs[idx] = None` = no downsample work (unmipped layer, cache hit, source
/// not ready, or pipeline still compiling — the composite then falls back to
/// bilinear over level 0 via the slot's `mips_valid`).
#[derive(Resource, Default)]
pub struct LayerMipMeta {
    pub runs: Vec<Option<MipRun>>,
}

/// Stage the downsample chain for every `wants_mips` layer whose sampled
/// texture's mips are stale. Predictive like the filter staging: `mips_valid`
/// flips true only when the staged run is certain to execute this frame
/// (source complete + blit pipeline compiled); until then the composite's
/// bilinear fallback covers.
///
/// Runs after `prepare_layer_textures` (slots/views exist) and
/// `prepare_layer_filters` (`output_valid`/`output_index` decided), before
/// `prepare_layer_composites` (its bind-group choice reads `mips_valid`).
pub fn prepare_layer_mips(
    extracted: Res<ExtractedUiLayers>,
    mut store: ResMut<LayerTextureStore>,
    pipeline: Option<Res<LayerBlitPipeline>>,
    mut specialized: ResMut<SpecializedRenderPipelines<LayerBlitPipeline>>,
    pipeline_cache: Res<PipelineCache>,
    render_device: Res<RenderDevice>,
    mut meta: ResMut<LayerMipMeta>,
) {
    meta.runs.clear();
    meta.runs.resize_with(extracted.layers.len(), || None);
    let Some(pipeline) = pipeline else {
        return;
    };
    for (idx, layer) in extracted.layers.iter().enumerate() {
        if !layer.wants_mips {
            continue;
        }
        let Some(slot) = store.slots.get_mut(&layer.main_entity) else {
            continue;
        };
        let pipeline_id = specialized.specialize(
            &pipeline_cache,
            &pipeline,
            LayerBlitPipelineKey {
                target_format: layer.target_format,
            },
        );
        // Pick the sampled texture: the filter output ping-pong when a chain
        // is present (that is what the composite quad samples), else the raw
        // capture. Each carries its own chain + validity flag.
        let (chain, mips_valid, source_valid) = if layer.chain.is_some() {
            let Some(filter) = slot.filter.as_mut() else {
                continue;
            };
            let FilterSlot {
                mips,
                mips_valid,
                output_index,
                output_valid,
                ..
            } = filter;
            let Some(chain) = mips[*output_index].as_mut() else {
                continue;
            };
            (chain, mips_valid, *output_valid)
        } else {
            let Some(chain) = slot.mips.as_mut() else {
                continue;
            };
            (chain, &mut slot.mips_valid, slot.content_valid)
        };
        if *mips_valid {
            continue; // Cache hit: last generation still matches level 0.
        }
        // Never downsample a blank/partial level 0, and never mark valid with
        // an uncompiled pipeline (the replay would silently skip the run).
        if !source_valid || pipeline_cache.get_render_pipeline(pipeline_id).is_none() {
            continue;
        }
        if chain.bind_groups.is_empty() {
            let layout = pipeline_cache.get_bind_group_layout(&pipeline.layout);
            chain.bind_groups = chain
                .level_views
                .iter()
                .map(|view| {
                    render_device.create_bind_group(
                        "ui_layer_mip_source",
                        &layout,
                        &BindGroupEntries::sequential((view, &pipeline.sampler)),
                    )
                })
                .collect();
        }
        let levels = (0..chain.level_views.len().saturating_sub(1))
            .map(|level| MipLevel {
                bind_group: chain.bind_groups[level].clone(),
                target: chain.level_views[level + 1].clone(),
            })
            .collect();
        meta.runs[idx] = Some(MipRun {
            pipeline: pipeline_id,
            levels,
        });
        *mips_valid = true;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mip_level_count_covers_full_chain() {
        assert_eq!(mip_level_count(UVec2::new(1, 1)), 1);
        assert_eq!(mip_level_count(UVec2::new(2, 2)), 2);
        assert_eq!(mip_level_count(UVec2::new(256, 64)), 9);
        // Non-power-of-two rounds down (300 → 8 halvings to reach 1: 300,
        // 150, 75, 37, 18, 9, 4, 2, 1 = 9 levels via ilog2(300)=8).
        assert_eq!(mip_level_count(UVec2::new(300, 20)), 9);
        // Degenerate zero clamps to one level.
        assert_eq!(mip_level_count(UVec2::ZERO), 1);
    }
}
