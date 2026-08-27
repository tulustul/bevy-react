//! The render half of `ReactUiPlugin::precompile_filters`: compile the layer
//! pipelines for every camera target format ahead of their first use.
//!
//! Every layer pipeline is specialized per target format (the filter one per
//! `(shader, format)` — `LayerFilterPipelineKey`), and the format is a
//! render-world fact (`CameraMainPassTextureFormats`, filled by bevy's
//! `extract_cameras`: `Rgba16Float` for an HDR camera, else the target's),
//! so "at startup" means "the first frame a format is seen" — in practice the
//! first frame. For each unseen format this queues every shader of the
//! [`WarmShaderList`] plus the three format-only pipelines every layer needs
//! (composite quad, mip blit, backdrop blit); bevy's `PipelineCache` compiles
//! them on its background workers (no frame stall) and waits for any shader
//! asset still loading. Specialization is memoized, so the steady state is a
//! hash lookup per format per frame. Without this a first use gates its layer
//! for the compile's duration (the subtree draws nothing — see
//! `prepare_layer_composites` / `morph_gate`).
//!
//! No headless render harness exists in the crate, so only the format
//! bookkeeping ([`pending_formats`]) is unit-tested; the specialize calls
//! stay thin.

use bevy::platform::collections::HashSet;
use bevy::prelude::*;
use bevy::render::Extract;
use bevy::render::camera::CameraMainPassTextureFormats;
use bevy::render::render_resource::{PipelineCache, SpecializedRenderPipelines, TextureFormat};
use bevy::shader::Shader;

use super::backdrop::{BackdropBlitPipeline, BackdropBlitPipelineKey};
use super::mips::{LayerBlitPipeline, LayerBlitPipelineKey};
use super::{
    LayerCompositePipeline, LayerCompositePipelineKey, LayerFilterPipeline, LayerFilterPipelineKey,
};
use crate::filters::WarmShaderList;

/// The render-world copy of [`WarmShaderList`] plus the formats already
/// warmed with it.
#[derive(Resource, Default)]
pub struct WarmShaders {
    pub handles: Vec<Handle<Shader>>,
    pub version: u32,
    pub warmed: HashSet<TextureFormat>,
}

/// Mirror the main world's list; a new list (by `version`) forgets every
/// warmed format so they are re-warmed with the new shaders.
pub fn extract_warm_shaders(list: Extract<Res<WarmShaderList>>, mut warm: ResMut<WarmShaders>) {
    if warm.version == list.version && warm.handles.len() == list.handles.len() {
        return;
    }
    warm.handles = list.handles.clone();
    warm.version = list.version;
    warm.warmed.clear();
}

/// The formats in `seen` not yet in `warmed` (first sight wins, each once),
/// marking them warmed.
pub fn pending_formats(
    seen: impl IntoIterator<Item = TextureFormat>,
    warmed: &mut HashSet<TextureFormat>,
) -> Vec<TextureFormat> {
    let mut out = Vec::new();
    for format in seen {
        if warmed.insert(format) {
            out.push(format);
        }
    }
    out
}

/// Queue the pipelines for every newly seen camera format. Idle once every
/// format is warmed; a no-op while the list is empty (every partition
/// `Off`) or the pipeline resources are not initialized yet (retried next
/// frame).
#[allow(clippy::too_many_arguments)]
pub fn warm_layer_pipelines(
    formats: Res<CameraMainPassTextureFormats>,
    mut warm: ResMut<WarmShaders>,
    pipeline_cache: Res<PipelineCache>,
    filter: Option<Res<LayerFilterPipeline>>,
    composite: Option<Res<LayerCompositePipeline>>,
    blit: Option<Res<LayerBlitPipeline>>,
    backdrop: Option<Res<BackdropBlitPipeline>>,
    mut filter_pipelines: ResMut<SpecializedRenderPipelines<LayerFilterPipeline>>,
    mut composite_pipelines: ResMut<SpecializedRenderPipelines<LayerCompositePipeline>>,
    mut blit_pipelines: ResMut<SpecializedRenderPipelines<LayerBlitPipeline>>,
    mut backdrop_pipelines: ResMut<SpecializedRenderPipelines<BackdropBlitPipeline>>,
) {
    if warm.handles.is_empty() {
        return;
    }
    let (Some(filter), Some(composite), Some(blit), Some(backdrop)) =
        (filter, composite, blit, backdrop)
    else {
        return;
    };
    let WarmShaders {
        handles, warmed, ..
    } = &mut *warm;
    for target_format in pending_formats(formats.values().copied(), warmed) {
        for shader in handles.iter() {
            filter_pipelines.specialize(
                &pipeline_cache,
                &filter,
                LayerFilterPipelineKey {
                    shader: shader.clone(),
                    target_format,
                },
            );
        }
        composite_pipelines.specialize(
            &pipeline_cache,
            &composite,
            LayerCompositePipelineKey { target_format },
        );
        blit_pipelines.specialize(
            &pipeline_cache,
            &blit,
            LayerBlitPipelineKey { target_format },
        );
        backdrop_pipelines.specialize(
            &pipeline_cache,
            &backdrop,
            BackdropBlitPipelineKey { target_format },
        );
        debug!(
            target: "bevy_react",
            "precompiling {} layer pipelines for {target_format:?}",
            handles.len() + 3
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Each format is reported once, on first sight, whatever the order or
    /// repetition of the cameras reporting it.
    #[test]
    fn pending_formats_reports_each_format_once() {
        let mut warmed = HashSet::default();
        let a = TextureFormat::Rgba8UnormSrgb;
        let b = TextureFormat::Rgba16Float;
        assert_eq!(pending_formats([a, a, b], &mut warmed), vec![a, b]);
        assert!(pending_formats([b, a], &mut warmed).is_empty());
        assert_eq!(
            pending_formats([TextureFormat::Bgra8UnormSrgb], &mut warmed),
            vec![TextureFormat::Bgra8UnormSrgb]
        );
        // A new list clears the memory: everything is pending again.
        warmed.clear();
        assert_eq!(pending_formats([a], &mut warmed), vec![a]);
    }
}
