//! Backdrop capture for `<layer>` effects (Task 3.1 spike).
//!
//! A backdrop-sampling effect (`LayerEffect::backdrop(true)`) needs to see
//! *what renders behind the UI*: the 3D world after post-processing
//! (tonemapping, bloom) but **before** the UI pass draws over it. This module
//! captures exactly that image into a shared, material-sampleable texture.
//!
//! **How it slots into Bevy 0.19 rendering.** 0.19 replaced the render graph
//! with camera-driven render *schedules*: each camera runs its
//! [`Core3d`]/[`Core2d`] schedule (system sets `Prepass → MainPass →
//! EarlyPostProcess → PostProcess`, chained), and `bevy_ui_render` adds its
//! `ui_pass` system `after(PostProcess).before(upscaling)`. Pass "nodes" are
//! ordinary systems reading the current view via [`ViewQuery`] and encoding
//! commands via [`RenderContext`]. [`backdrop_blit`] is one of those systems,
//! ordered `after(PostProcess).before(ui_pass)` — the exact seam the design
//! doc calls "between post-processing and the UI pass".
//!
//! **Blit, not `copy_texture_to_texture`.** The view target's main texture
//! format varies (`Rgba16Float` under HDR, `Rgba8Unorm`/`Rgba8UnormSrgb`
//! otherwise), and `copy_texture_to_texture` requires source and destination
//! formats to be identical — a raw copy into the fixed-format backdrop image
//! can't work across that variance (the default `CameraMainTextureUsages`
//! *does* include `COPY_SRC`, so usages are not the obstacle; the format
//! mismatch is). Instead the capture is a fullscreen-triangle blit
//! through `bevy_core_pipeline`'s [`BlitPipeline`] (the same pipeline
//! `upscaling` uses): the main texture is sampled (its default usages include
//! `TEXTURE_BINDING` — post-processing itself needs that) into the backdrop
//! image, which has one fixed format ([`BACKDROP_FORMAT`], `Rgba16Float` —
//! filterable, renderable, lossless for every source). `source_space: None`
//! keeps texel *values* untouched, so the backdrop holds exactly what the
//! main texture holds — the space UI compositing happens in, which is what a
//! backdrop effect must re-emit for identity compositing.
//!
//! **Main world ↔ render world.** The backdrop lives as an ordinary
//! [`Image`] asset ([`BackdropCapture::image`], `RENDER_WORLD`-only, no CPU
//! data) so Task 3.2 can bind it in `LayerMaterial` like any texture.
//! [`drive_backdrop`] (main world, `Update`) derives `enabled` from live
//! [`RLayer`]s whose effect `wants_backdrop` and sizes the image to the UI
//! camera's physical target (lazy: it stays 1×1 until first enabled).
//! [`extract_backdrop`] mirrors `{render-world camera entity, image id}` into
//! the render world each frame; [`backdrop_blit`] early-outs unless the
//! current view *is* that camera.
//!
//! **Sizing note.** The image tracks `Camera::physical_target_size` (the main
//! texture's size), not the viewport: the blit samples the *whole* main
//! texture, so matching its size keeps the copy 1:1. A camera with a custom
//! `viewport` still captures the full target — the contract's `backdrop_uv`
//! helper is specified against the fullscreen default UI camera (see
//! `layer.wgsl`).
//!
//! **The blur chain.** After the capture, [`backdrop_blur`] runs a
//! FIXED-STRENGTH dual-Kawase chain over it in the same seam: three
//! downsample passes (`full → 1/2 → 1/4 → 1/8`) and one upsample pass
//! (`1/8 → 1/4`), landing in [`BackdropCapture::blurred`] at QUARTER
//! resolution. Dual Kawase over separable Gaussian because it needs no
//! uniforms at all (each pass derives its half-pixel offsets from
//! `textureDimensions`), gets a wide, stable kernel from bilinear taps at
//! descending resolutions — frosted glass wants a STRONG blur — and costs
//! four tiny fullscreen passes at ≤ 1/4 area. Quarter-res output (not half)
//! because the material samples it with a linear sampler anyway: the extra
//! softness IS the product, and it halves the chain's bandwidth again. How
//! much blur *shows* is the effect's business — frost mixes sharp vs blurred
//! by its `blur` uniform ("frostiness", not a pixel radius); the chain itself
//! has no strength knob. V1 runs the chain whenever the capture is enabled
//! (frost, the only backdrop builtin, needs it; a future sharp-only backdrop
//! effect can grow a skip flag later).

use bevy::asset::{AssetId, RenderAssetUsages, embedded_asset, load_embedded_asset};
use bevy::core_pipeline::FullscreenShader;
use bevy::core_pipeline::blit::{BlitPipeline, BlitPipelineKey};
use bevy::core_pipeline::schedule::{Core2d, Core2dSystems, Core3d, Core3dSystems};
use bevy::prelude::{
    App, AssetServer, Assets, Camera, Commands, Entity, Handle, Image, IntoScheduleConfigs as _,
    Local, Plugin, Query, Res, ResMut, Resource, UVec2, Update, With,
};
use bevy::render::render_asset::RenderAssets;
use bevy::render::render_resource::{
    BindGroup, BindGroupEntries, BindGroupLayoutDescriptor, BindGroupLayoutEntries,
    CachedRenderPipelineId, ColorTargetState, ColorWrites, Extent3d, FilterMode, FragmentState,
    LoadOp, Operations, PipelineCache, RenderPassColorAttachment, RenderPassDescriptor,
    RenderPipelineDescriptor, Sampler, SamplerBindingType, SamplerDescriptor, ShaderStages,
    SpecializedRenderPipelines, StoreOp, TextureDimension, TextureFormat, TextureSampleType,
    TextureUsages, TextureViewId, binding_types,
};
use bevy::render::renderer::{RenderContext, RenderDevice, ViewQuery};
use bevy::render::sync_world::RenderEntity;
use bevy::render::texture::GpuImage;
use bevy::render::view::ViewTarget;
use bevy::render::{Extract, ExtractSchedule, Render, RenderApp, RenderStartup, RenderSystems};
use bevy::shader::Shader;
use bevy::ui::IsDefaultUiCamera;
use bevy::ui_render::ui_pass;

use crate::layer::{LayerEffects, LayerMaterial, RLayer};

/// The backdrop image's fixed texture format. `Rgba16Float` is filterable,
/// color-renderable (a valid blit target), and wide enough to hold any main
/// texture's values losslessly — HDR (`Rgba16Float`) bit-for-bit, LDR 8-bit
/// exactly representable. One fixed format means the blit pipeline
/// specializes exactly once, whatever the camera's HDR state.
pub const BACKDROP_FORMAT: TextureFormat = TextureFormat::Rgba16Float;

/// The shared backdrop capture (main world): the images backdrop-sampling
/// `<layer>` effects bind, and whether anything currently wants them. When
/// `enabled` is false the render-world blit + blur don't run and every image
/// keeps its last size (1×1 until the first enable — allocation is lazy; a
/// later disable keeps the allocations to avoid realloc churn on toggles).
///
/// HANDLE STABILITY: all handles are minted once at plugin build and never
/// replaced — a material bound to them (the reconciler's create/effect-swap
/// arms) stays bound across every resize and enable/disable toggle.
#[derive(Resource, Debug, Clone)]
pub struct BackdropCapture {
    /// The sharp capture target, at the camera target's full size.
    /// `RENDER_WORLD`-only (no CPU-side data); always a live asset — 1×1
    /// until the first frame a backdrop effect is live.
    pub image: Handle<Image>,
    /// The blur chain's output, at QUARTER resolution (see the module doc's
    /// blur-chain note) — the image `sample_backdrop_blurred` reads.
    pub blurred: Handle<Image>,
    /// The chain's intermediates: 1/2, 1/4 and 1/8 resolution (the 1/4 slot
    /// is the *down* leg's — [`blurred`](Self::blurred) is the up leg's own
    /// 1/4 target; a pass can't read and write one texture).
    pub(crate) chain: [Handle<Image>; 3],
    /// Whether any live [`RLayer`]'s effect `wants_backdrop` (derived each
    /// frame by [`drive_backdrop`]).
    pub enabled: bool,
}

impl BackdropCapture {
    /// Mint every capture image at the lazy 1×1 (see the type docs).
    pub(crate) fn new(images: &mut Assets<Image>) -> Self {
        let mut mint = || images.add(backdrop_image(UVec2::ONE));
        BackdropCapture {
            image: mint(),
            blurred: mint(),
            chain: [mint(), mint(), mint()],
            enabled: false,
        }
    }
}

/// The size of blur-chain level `level` (1 = half, 2 = quarter, 3 = eighth)
/// for a full-resolution capture of `size`: a floor shift, clamped to 1 so a
/// tiny target still yields valid textures.
fn chain_size(size: UVec2, level: u32) -> UVec2 {
    UVec2::new((size.x >> level).max(1), (size.y >> level).max(1))
}

/// Build the backdrop [`Image`]: `BACKDROP_FORMAT`, no CPU data, render-world
/// only, usable as both a blit target (`RENDER_ATTACHMENT`) and a material
/// binding (`TEXTURE_BINDING`).
fn backdrop_image(size: UVec2) -> Image {
    let mut image = Image::new_uninit(
        Extent3d {
            width: size.x.max(1),
            height: size.y.max(1),
            depth_or_array_layers: 1,
        },
        TextureDimension::D2,
        BACKDROP_FORMAT,
        RenderAssetUsages::RENDER_WORLD,
    );
    image.texture_descriptor.usage =
        TextureUsages::TEXTURE_BINDING | TextureUsages::RENDER_ATTACHMENT | TextureUsages::COPY_DST;
    image
}

/// Per-frame main-world driver: derive `enabled` from the live layers (any
/// [`RLayer`] whose resolved effect is registered with `wants_backdrop`), and
/// while enabled keep the backdrop image sized to the UI camera's physical
/// target so the render-world blit is a 1:1 copy of the main texture.
///
/// Lazy allocation: while never enabled the image stays 1×1. Compare-before-
/// write on both the flag and the image so idle frames don't dirty the asset
/// (a `get_mut` alone re-uploads it).
pub fn drive_backdrop(
    mut capture: ResMut<BackdropCapture>,
    effects: Res<LayerEffects>,
    layers: Query<&RLayer>,
    cameras: Query<&Camera, With<IsDefaultUiCamera>>,
    mut images: ResMut<Assets<Image>>,
    mut materials: ResMut<Assets<LayerMaterial>>,
) {
    let enabled = layers
        .iter()
        .any(|layer| effects.get(&layer.effect).is_some_and(|e| e.wants_backdrop));
    if capture.enabled != enabled {
        capture.enabled = enabled;
    }
    if !enabled {
        return;
    }
    // Size to the full physical target (= the main texture the blit samples;
    // see the module doc's sizing note). No target info yet (e.g. first
    // frame, or headless) → keep the current size.
    let Some(size) = cameras
        .iter()
        .find(|camera| camera.is_active)
        .and_then(Camera::physical_target_size)
    else {
        return;
    };
    if size.x == 0 || size.y == 0 {
        return;
    }
    // Size the whole set: the sharp capture at full target size, the chain
    // at 1/2 / 1/4 / 1/8, the blurred output at 1/4 (see the module doc's
    // blur-chain note). Read each current size immutably first: `get_mut`
    // flags the asset modified (re-uploading it) even without a change.
    let wanted = [
        (capture.image.clone(), size),
        (capture.chain[0].clone(), chain_size(size, 1)),
        (capture.chain[1].clone(), chain_size(size, 2)),
        (capture.chain[2].clone(), chain_size(size, 3)),
        (capture.blurred.clone(), chain_size(size, 2)),
    ];
    let mut resized = false;
    for (handle, want) in wanted {
        if images
            .get(&handle)
            .is_some_and(|image| image.size() != want)
            && let Some(mut image) = images.get_mut(&handle)
        {
            image.resize(Extent3d {
                width: want.x,
                height: want.y,
                depth_or_array_layers: 1,
            });
            resized = true;
        }
    }
    // Re-touch every material bound to the LIVE capture pair: the resize
    // recreated the GPU textures, but `bevy_ui_render` re-prepares a
    // material's bind group only on an `AssetEvent` for the MATERIAL asset —
    // without this a frost panel keeps sampling a view of the pre-resize
    // texture forever (the same trap `drive_layers` handles for the subtree
    // texture). Dummy-bound materials (non-backdrop effects) are skipped.
    if resized {
        let bound: Vec<_> = materials
            .iter()
            .filter(|(_, m)| m.backdrop == capture.image || m.backdrop_blurred == capture.blurred)
            .map(|(id, _)| id)
            .collect();
        for id in bound {
            if let Some(mut material) = materials.get_mut(id) {
                // The Modified event fires on the first mutable deref.
                let _: &mut LayerMaterial = &mut material;
            }
        }
    }
}

/// The render-world mirror of [`BackdropCapture`]: which render-world camera
/// entity to capture from and which images the blit + blur chain write —
/// `None` whenever the capture is disabled, so every render-side system
/// early-outs on one read.
#[derive(Resource, Debug, Default)]
pub struct ExtractedBackdrop {
    target: Option<ExtractedBackdropTarget>,
}

/// One frame's extracted capture targets (see [`ExtractedBackdrop`]).
#[derive(Debug, Clone, Copy)]
struct ExtractedBackdropTarget {
    /// The render-world entity of the main-world UI camera (the entity
    /// [`ViewQuery`] sees in the camera's render schedule).
    camera: Entity,
    /// The sharp capture image ([`BackdropCapture::image`]).
    capture: AssetId<Image>,
    /// The chain intermediates, 1/2 → 1/4 → 1/8.
    chain: [AssetId<Image>; 3],
    /// The quarter-res blurred output ([`BackdropCapture::blurred`]).
    blurred: AssetId<Image>,
}

/// Extract the capture state: when enabled, map the main-world UI camera to
/// its render-world entity and record the images to blit + blur into.
fn extract_backdrop(
    mut extracted: ResMut<ExtractedBackdrop>,
    capture: Extract<Option<Res<BackdropCapture>>>,
    cameras: Extract<Query<(RenderEntity, &Camera), With<IsDefaultUiCamera>>>,
) {
    extracted.target = None;
    let Some(capture) = capture.as_ref() else {
        return;
    };
    if !capture.enabled {
        return;
    }
    if let Some((render_entity, _)) = cameras.iter().find(|(_, camera)| camera.is_active) {
        extracted.target = Some(ExtractedBackdropTarget {
            camera: render_entity,
            capture: capture.image.id(),
            chain: [
                capture.chain[0].id(),
                capture.chain[1].id(),
                capture.chain[2].id(),
            ],
            blurred: capture.blurred.id(),
        });
    }
}

/// The specialized blit pipeline for the backdrop copy. One fixed key
/// (`BACKDROP_FORMAT`, no blend, single-sampled, no color-space conversion —
/// texel values pass through untouched), so this specializes exactly once,
/// lazily on the first enabled frame.
#[derive(Resource, Default)]
pub struct BackdropBlitPipeline(Option<CachedRenderPipelineId>);

/// Queue the backdrop blit pipeline the first frame the capture is live. The
/// `PipelineCache` compiles it asynchronously; [`backdrop_blit`] skips frames
/// until `get_render_pipeline` returns it (typically a frame later).
fn prepare_backdrop_blit_pipeline(
    extracted: Res<ExtractedBackdrop>,
    mut pipeline: ResMut<BackdropBlitPipeline>,
    blit: Option<Res<BlitPipeline>>,
    pipelines: Option<ResMut<SpecializedRenderPipelines<BlitPipeline>>>,
    cache: Res<PipelineCache>,
) {
    if extracted.target.is_none() || pipeline.0.is_some() {
        return;
    }
    let (Some(blit), Some(mut pipelines)) = (blit, pipelines) else {
        return;
    };
    pipeline.0 = Some(pipelines.specialize(
        &cache,
        &blit,
        BlitPipelineKey {
            target_format: BACKDROP_FORMAT,
            blend_state: None,
            samples: 1,
            // No color-space conversion: the backdrop must hold the main
            // texture's raw values (the space the UI pass composites in).
            source_space: None,
        },
    ));
}

/// The capture pass itself: a fullscreen-triangle blit of the view target's
/// main texture (post-processed world, pre-UI) into the backdrop image. Runs
/// in the camera render schedules (`Core3d`/`Core2d`) between
/// `PostProcess` and `ui_pass`; skips in one comparison for every view that
/// isn't the extracted UI camera, and skips cheaply while disabled
/// (`extracted.target == None`).
#[allow(clippy::too_many_arguments)]
pub fn backdrop_blit(
    extracted: Res<ExtractedBackdrop>,
    pipeline: Res<BackdropBlitPipeline>,
    pipeline_cache: Res<PipelineCache>,
    blit: Option<Res<BlitPipeline>>,
    gpu_images: Res<RenderAssets<GpuImage>>,
    view: ViewQuery<&ViewTarget>,
    // Source bind group, cached by the main texture view's id (the a/b swap
    // means the id can alternate frame to frame — same pattern as upscaling).
    mut cached_bind_group: Local<Option<(TextureViewId, BindGroup)>>,
    mut ctx: RenderContext,
) {
    let Some(target) = extracted.target else {
        return;
    };
    if view.entity() != target.camera {
        return;
    }
    let image_id = target.capture;
    let Some(pipeline_id) = pipeline.0 else {
        return;
    };
    let Some(pipeline) = pipeline_cache.get_render_pipeline(pipeline_id) else {
        // Still compiling; the capture starts a frame or two after enable.
        return;
    };
    let Some(blit) = blit else {
        return;
    };
    let Some(gpu_image) = gpu_images.get(image_id) else {
        return;
    };

    let view_target = view.into_inner();
    let source = view_target.main_texture_view();

    let bind_group = match &mut *cached_bind_group {
        Some((id, bind_group)) if source.id() == *id => bind_group,
        cached => {
            let bind_group = blit.create_bind_group(ctx.render_device(), source, &pipeline_cache);
            let (_, bind_group) = cached.insert((source.id(), bind_group));
            bind_group
        }
    };

    let pass_descriptor = RenderPassDescriptor {
        label: Some("backdrop_capture"),
        color_attachments: &[Some(RenderPassColorAttachment {
            view: &gpu_image.texture_view,
            depth_slice: None,
            resolve_target: None,
            ops: Operations {
                // The fullscreen triangle covers every texel; Clear just
                // avoids depending on previous contents when sizes mismatch
                // for a frame during a resize.
                load: LoadOp::Clear(Default::default()),
                store: StoreOp::Store,
            },
        })],
        depth_stencil_attachment: None,
        timestamp_writes: None,
        occlusion_query_set: None,
        multiview_mask: None,
    };

    let mut render_pass = ctx.command_encoder().begin_render_pass(&pass_descriptor);
    render_pass.set_pipeline(pipeline);
    render_pass.set_bind_group(0, bind_group, &[]);
    render_pass.draw(0..3, 0..1);
}

/// The dual-Kawase blur pipelines (render world): the shared bind-group
/// layout + linear sampler, the embedded `backdrop_blur.wgsl`, and the two
/// lazily-queued pipelines (`down_sample` / `up_sample` entry points, both
/// targeting [`BACKDROP_FORMAT`]). Built in `RenderStartup` (it needs the
/// `RenderDevice` and [`FullscreenShader`]); the pipelines themselves queue on
/// the first enabled frame, like the blit's.
#[derive(Resource)]
pub struct BackdropBlurPipeline {
    layout: BindGroupLayoutDescriptor,
    sampler: Sampler,
    fullscreen_shader: FullscreenShader,
    shader: Handle<Shader>,
    down: Option<CachedRenderPipelineId>,
    up: Option<CachedRenderPipelineId>,
}

/// Build [`BackdropBlurPipeline`]'s static half: layout, LINEAR clamp sampler
/// (the bilinear taps between texel centers are what widen the Kawase
/// kernels), fullscreen vertex state, and the embedded shader handle.
fn init_backdrop_blur_pipeline(
    mut commands: Commands,
    render_device: Res<RenderDevice>,
    fullscreen_shader: Res<FullscreenShader>,
    asset_server: Res<AssetServer>,
) {
    let layout = BindGroupLayoutDescriptor::new(
        "backdrop_blur_bind_group_layout",
        &BindGroupLayoutEntries::sequential(
            ShaderStages::FRAGMENT,
            (
                binding_types::texture_2d(TextureSampleType::Float { filterable: true }),
                binding_types::sampler(SamplerBindingType::Filtering),
            ),
        ),
    );
    let sampler = render_device.create_sampler(&SamplerDescriptor {
        label: Some("backdrop_blur_sampler"),
        mag_filter: FilterMode::Linear,
        min_filter: FilterMode::Linear,
        // Address modes default to clamp-to-edge — off-target taps at the
        // borders repeat the edge texel instead of wrapping in scene content
        // from the opposite side.
        ..Default::default()
    });
    commands.insert_resource(BackdropBlurPipeline {
        layout,
        sampler,
        fullscreen_shader: fullscreen_shader.clone(),
        shader: load_embedded_asset!(asset_server.as_ref(), "backdrop_blur.wgsl"),
        down: None,
        up: None,
    });
}

/// Queue the down/up blur pipelines the first frame the capture is live (the
/// same lazy pattern as [`prepare_backdrop_blit_pipeline`]).
fn prepare_backdrop_blur_pipelines(
    extracted: Res<ExtractedBackdrop>,
    pipeline: Option<ResMut<BackdropBlurPipeline>>,
    cache: Res<PipelineCache>,
) {
    if extracted.target.is_none() {
        return;
    }
    let Some(mut pipeline) = pipeline else {
        return;
    };
    if pipeline.down.is_some() {
        return;
    }
    let descriptor = |entry: &'static str| RenderPipelineDescriptor {
        label: Some(format!("backdrop_blur_{entry}").into()),
        layout: vec![pipeline.layout.clone()],
        vertex: pipeline.fullscreen_shader.to_vertex_state(),
        fragment: Some(FragmentState {
            shader: pipeline.shader.clone(),
            entry_point: Some(entry.into()),
            targets: vec![Some(ColorTargetState {
                format: BACKDROP_FORMAT,
                blend: None,
                write_mask: ColorWrites::ALL,
            })],
            ..Default::default()
        }),
        ..Default::default()
    };
    let (down, up) = (descriptor("down_sample"), descriptor("up_sample"));
    pipeline.down = Some(cache.queue_render_pipeline(down));
    pipeline.up = Some(cache.queue_render_pipeline(up));
}

/// The blur chain itself: three Kawase downsample passes
/// (capture → 1/2 → 1/4 → 1/8) and one upsample pass (1/8 → blurred 1/4),
/// each a fullscreen triangle sampling the previous level. Runs right after
/// [`backdrop_blit`] in the same seam (still before `ui_pass`), with the same
/// early-outs; v1 runs whenever the capture is enabled (see the module doc).
pub fn backdrop_blur(
    extracted: Res<ExtractedBackdrop>,
    pipeline: Option<Res<BackdropBlurPipeline>>,
    pipeline_cache: Res<PipelineCache>,
    gpu_images: Res<RenderAssets<GpuImage>>,
    view: ViewQuery<()>,
    // Per-pass source bind groups, cached by source texture-view id (a
    // resize recreates the GPU textures — and thus the view ids).
    mut cached_bind_groups: Local<Vec<(TextureViewId, BindGroup)>>,
    mut ctx: RenderContext,
) {
    let Some(target) = extracted.target else {
        return;
    };
    if view.entity() != target.camera {
        return;
    }
    let Some(pipeline) = pipeline else {
        return;
    };
    let (Some(down_id), Some(up_id)) = (pipeline.down, pipeline.up) else {
        return;
    };
    let (Some(down), Some(up)) = (
        pipeline_cache.get_render_pipeline(down_id),
        pipeline_cache.get_render_pipeline(up_id),
    ) else {
        // Still compiling; the blurred output starts a frame or two after
        // enable (zero-initialized — transparent black — until then).
        return;
    };

    // The ladder, in encode order: (source, destination, pipeline).
    let steps = [
        (target.capture, target.chain[0], down),
        (target.chain[0], target.chain[1], down),
        (target.chain[1], target.chain[2], down),
        (target.chain[2], target.blurred, up),
    ];
    let mut passes = Vec::with_capacity(steps.len());
    for (src, dst, pipe) in steps {
        let (Some(src), Some(dst)) = (gpu_images.get(src), gpu_images.get(dst)) else {
            return;
        };
        passes.push((src, dst, pipe));
    }

    // Rebuild the bind-group cache when any source view changed.
    let stale = cached_bind_groups.len() != passes.len()
        || cached_bind_groups
            .iter()
            .zip(&passes)
            .any(|((id, _), (src, ..))| *id != src.texture_view.id());
    if stale {
        cached_bind_groups.clear();
        for (src, ..) in &passes {
            let bind_group = ctx.render_device().create_bind_group(
                None,
                &pipeline_cache.get_bind_group_layout(&pipeline.layout),
                &BindGroupEntries::sequential((&src.texture_view, &pipeline.sampler)),
            );
            cached_bind_groups.push((src.texture_view.id(), bind_group));
        }
    }

    for ((_, bind_group), (_, dst, pipe)) in cached_bind_groups.iter().zip(&passes) {
        let pass_descriptor = RenderPassDescriptor {
            label: Some("backdrop_blur"),
            color_attachments: &[Some(RenderPassColorAttachment {
                view: &dst.texture_view,
                depth_slice: None,
                resolve_target: None,
                ops: Operations {
                    // The triangle covers every texel; Clear just avoids
                    // depending on stale contents around a resize frame.
                    load: LoadOp::Clear(Default::default()),
                    store: StoreOp::Store,
                },
            })],
            depth_stencil_attachment: None,
            timestamp_writes: None,
            occlusion_query_set: None,
            multiview_mask: None,
        };
        let mut render_pass = ctx.command_encoder().begin_render_pass(&pass_descriptor);
        render_pass.set_pipeline(pipe);
        render_pass.set_bind_group(0, bind_group, &[]);
        render_pass.draw(0..3, 0..1);
    }
}

/// Wires the backdrop capture into an app. Added by `ReactUiPlugin` under its
/// asset/render gates: the main-world half needs `Assets<Image>` (present in
/// headless-with-assets test apps too), the render-world half registers only
/// when a `RenderApp` exists — a windowless app gets the resource + driver
/// system and nothing else.
pub(crate) struct BackdropPlugin;

impl Plugin for BackdropPlugin {
    fn build(&self, app: &mut App) {
        let capture = BackdropCapture::new(&mut app.world_mut().resource_mut::<Assets<Image>>());
        app.insert_resource(capture);
        // After the op drain so a `<layer>` mounted this frame enables the
        // capture the same frame (the blit still needs a pipeline-compile
        // frame — see `prepare_backdrop_blit_pipeline`).
        app.add_systems(Update, drive_backdrop.after(crate::reconcile::apply_js_ops));

        if app.get_sub_app(RenderApp).is_none() {
            return;
        }
        // The blur chain's shader, embedded like `layer.wgsl` (guarded on the
        // render app: only its `RenderStartup` init ever loads it, and a
        // render app implies the full asset infrastructure is present).
        embedded_asset!(app, "backdrop_blur.wgsl");
        let render_app = app
            .get_sub_app_mut(RenderApp)
            .expect("just checked the render app exists");
        render_app
            .init_resource::<ExtractedBackdrop>()
            .init_resource::<BackdropBlitPipeline>()
            .add_systems(RenderStartup, init_backdrop_blur_pipeline)
            .add_systems(ExtractSchedule, extract_backdrop)
            .add_systems(
                Render,
                (
                    prepare_backdrop_blit_pipeline,
                    prepare_backdrop_blur_pipelines,
                )
                    .in_set(RenderSystems::Prepare)
                    // `SpecializedRenderPipelines<BlitPipeline>` is declared
                    // ambiguity-exempt by `BlitPlugin` itself (upscaling does
                    // the same); mirror that stance.
                    .ambiguous_with_all(),
            )
            // The seam: after post-processing, before the UI draws over it —
            // capture first, then the blur ladder over the capture.
            // Registered for both camera flavors, like `ui_pass` itself; the
            // one extracted UI camera is the only view that does any work.
            .add_systems(
                Core3d,
                (backdrop_blit, backdrop_blur)
                    .chain()
                    .after(Core3dSystems::PostProcess)
                    .before(ui_pass),
            )
            .add_systems(
                Core2d,
                (backdrop_blit, backdrop_blur)
                    .chain()
                    .after(Core2dSystems::PostProcess)
                    .before(ui_pass),
            );
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::layer::LayerEffect;
    use bevy::camera::RenderTargetInfo;
    use bevy::prelude::{AssetApp as _, Entity};

    /// A minimal main-world app: `Assets<Image>` + a registry with one
    /// backdrop-wanting effect (`"blurish"`) and one that doesn't
    /// (`"plain"`), the capture resource, and the driver system.
    fn test_app() -> App {
        const FRAGMENT: &str = "@fragment\nfn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> { return vec4<f32>(1.0); }\n";
        let mut app = App::new();
        // Real asset plumbing (not a bare `Assets<Image>` resource): the
        // resize re-touch test observes `AssetEvent<LayerMaterial>`, which
        // only flows when the asset-events schedule runs.
        app.add_plugins((bevy::MinimalPlugins, bevy::asset::AssetPlugin::default()));
        app.init_asset::<Image>();
        // `drive_backdrop` writes the layer-material store (the resize
        // re-touch); register it like the plugin does.
        app.init_asset::<LayerMaterial>();
        let mut effects = LayerEffects::default();
        effects.register(
            LayerEffect::new("blurish")
                .backdrop(true)
                .fragment_wgsl(FRAGMENT),
        );
        effects.register(LayerEffect::new("plain").fragment_wgsl(FRAGMENT));
        app.insert_resource(effects);
        let capture = BackdropCapture::new(&mut app.world_mut().resource_mut::<Assets<Image>>());
        app.insert_resource(capture);
        app.add_systems(Update, drive_backdrop);
        app
    }

    fn spawn_ui_camera(app: &mut App, physical_size: UVec2) -> Entity {
        let mut camera = Camera::default();
        camera.computed.target_info = Some(RenderTargetInfo {
            physical_size,
            scale_factor: 1.0,
        });
        app.world_mut().spawn((camera, IsDefaultUiCamera)).id()
    }

    fn size_of(app: &App, handle: &Handle<Image>) -> UVec2 {
        app.world()
            .resource::<Assets<Image>>()
            .get(handle)
            .expect("backdrop image asset")
            .size()
    }

    fn image_size(app: &App) -> UVec2 {
        let capture = app.world().resource::<BackdropCapture>().clone();
        size_of(app, &capture.image)
    }

    fn enabled(app: &App) -> bool {
        app.world().resource::<BackdropCapture>().enabled
    }

    #[test]
    fn enabled_follows_live_backdrop_layers() {
        let mut app = test_app();
        spawn_ui_camera(&mut app, UVec2::new(640, 480));

        // No layers at all → disabled.
        app.update();
        assert!(!enabled(&app));

        // A layer on a non-backdrop effect → still disabled.
        let plain = app
            .world_mut()
            .spawn(RLayer {
                companion: Entity::PLACEHOLDER,
                effect: "plain".into(),
            })
            .id();
        app.update();
        assert!(!enabled(&app));

        // A layer on a backdrop-wanting effect → enabled.
        let blurish = app
            .world_mut()
            .spawn(RLayer {
                companion: Entity::PLACEHOLDER,
                effect: "blurish".into(),
            })
            .id();
        app.update();
        assert!(enabled(&app));

        // The backdrop layer unmounts → disabled again.
        app.world_mut().despawn(blurish);
        app.update();
        assert!(!enabled(&app));
        app.world_mut().despawn(plain);
    }

    #[test]
    fn image_stays_1x1_until_first_enabled() {
        let mut app = test_app();
        spawn_ui_camera(&mut app, UVec2::new(800, 600));

        // Disabled (no backdrop layer): the image must stay the lazy 1×1
        // even though the camera has a real target size.
        app.update();
        assert_eq!(image_size(&app), UVec2::ONE);

        // First enabled frame → allocated to the camera's physical target.
        app.world_mut().spawn(RLayer {
            companion: Entity::PLACEHOLDER,
            effect: "blurish".into(),
        });
        app.update();
        assert_eq!(image_size(&app), UVec2::new(800, 600));
    }

    /// The blur ladder tracks the capture: chain levels at 1/2, 1/4 and 1/8
    /// of the full target, the blurred output at 1/4 — all lazy 1×1 while
    /// disabled, all resized on the first enabled frame, all clamped to a
    /// minimum of 1 per axis for degenerate targets.
    #[test]
    fn blur_chain_sizes_track_the_capture() {
        let mut app = test_app();
        spawn_ui_camera(&mut app, UVec2::new(800, 600));
        let capture = app.world().resource::<BackdropCapture>().clone();

        // Disabled: everything stays at the lazy 1×1.
        app.update();
        for handle in capture.chain.iter().chain([&capture.blurred]) {
            assert_eq!(size_of(&app, handle), UVec2::ONE);
        }

        // Enabled: the whole ladder allocates in one frame.
        app.world_mut().spawn(RLayer {
            companion: Entity::PLACEHOLDER,
            effect: "blurish".into(),
        });
        app.update();
        assert_eq!(size_of(&app, &capture.chain[0]), UVec2::new(400, 300));
        assert_eq!(size_of(&app, &capture.chain[1]), UVec2::new(200, 150));
        assert_eq!(size_of(&app, &capture.chain[2]), UVec2::new(100, 75));
        assert_eq!(
            size_of(&app, &capture.blurred),
            UVec2::new(200, 150),
            "the blurred output is quarter resolution"
        );

        // A degenerate target never shifts an axis to zero.
        assert_eq!(chain_size(UVec2::new(5, 2), 3), UVec2::ONE);
        // Odd sizes floor at every level (801×601 → 400/200/100 × 300/150/75).
        assert_eq!(chain_size(UVec2::new(801, 601), 1), UVec2::new(400, 300));
        assert_eq!(chain_size(UVec2::new(801, 601), 2), UVec2::new(200, 150));
        assert_eq!(chain_size(UVec2::new(801, 601), 3), UVec2::new(100, 75));
    }

    #[test]
    fn image_resizes_on_target_size_change_and_keeps_allocation_on_disable() {
        let mut app = test_app();
        let camera = spawn_ui_camera(&mut app, UVec2::new(640, 480));
        let layer = app
            .world_mut()
            .spawn(RLayer {
                companion: Entity::PLACEHOLDER,
                effect: "blurish".into(),
            })
            .id();
        app.update();
        assert_eq!(image_size(&app), UVec2::new(640, 480));

        // Window resize → the image follows the new physical target size.
        app.world_mut()
            .get_mut::<Camera>(camera)
            .unwrap()
            .computed
            .target_info = Some(RenderTargetInfo {
            physical_size: UVec2::new(1280, 832),
            scale_factor: 1.0,
        });
        app.update();
        assert_eq!(image_size(&app), UVec2::new(1280, 832));

        // Disable: the flag drops but the allocation is kept (no realloc
        // churn on enable/disable toggles).
        app.world_mut().despawn(layer);
        app.update();
        assert!(!enabled(&app));
        assert_eq!(image_size(&app), UVec2::new(1280, 832));
    }

    /// Resizing the backdrop images must ALSO force a `Modified` on every
    /// [`LayerMaterial`] bound to the live capture pair: `bevy_ui_render`
    /// re-prepares a material's bind group only on `AssetEvent` for the
    /// MATERIAL asset, so without the touch a frost panel keeps sampling a
    /// view of the pre-resize GPU texture forever (the same trap
    /// `drive_layers` handles for the subtree texture). Dummy-bound
    /// materials (non-backdrop effects) must stay untouched, and a
    /// no-resize frame must not re-touch anything.
    #[test]
    fn backdrop_resize_retouches_bound_layer_materials() {
        use crate::layer::LayerPacked;
        use bevy::asset::AssetEvent;
        use bevy::prelude::{MessageReader, ResMut, Resource, Update};
        use std::collections::HashMap;

        /// Per-asset count of `Modified` events (Added/other events ignored).
        #[derive(Resource, Default)]
        struct Modified(HashMap<AssetId<LayerMaterial>, usize>);
        fn count_modified(
            mut reader: MessageReader<AssetEvent<LayerMaterial>>,
            mut count: ResMut<Modified>,
        ) {
            for ev in reader.read() {
                if let AssetEvent::Modified { id } = ev {
                    *count.0.entry(*id).or_default() += 1;
                }
            }
        }

        let mut app = test_app();
        app.init_resource::<Modified>();
        app.add_systems(Update, count_modified.after(drive_backdrop));
        let camera = spawn_ui_camera(&mut app, UVec2::new(640, 480));

        // One material bound to the LIVE capture pair (a frost layer's), one
        // bound elsewhere (a non-backdrop layer's dummy).
        let capture = app.world().resource::<BackdropCapture>().clone();
        let dummy = app
            .world_mut()
            .resource_mut::<Assets<Image>>()
            .add(backdrop_image(UVec2::ONE));
        let material = |backdrop: &Handle<Image>, blurred: &Handle<Image>| LayerMaterial {
            packed: LayerPacked::default(),
            layer: Handle::default(),
            backdrop: backdrop.clone(),
            backdrop_blurred: blurred.clone(),
            shader: Handle::default(),
        };
        let mut materials = app.world_mut().resource_mut::<Assets<LayerMaterial>>();
        let bound = materials.add(material(&capture.image, &capture.blurred));
        let unbound = materials.add(material(&dummy, &dummy));

        // Enable the capture: the first-enable allocation (1×1 → target
        // size) is a resize, so the bound material must be touched.
        app.world_mut().spawn(RLayer {
            companion: Entity::PLACEHOLDER,
            effect: "blurish".into(),
        });
        app.update();
        app.update(); // flush the AssetEvents into the counter
        let modified = |app: &App, handle: &Handle<LayerMaterial>| {
            *app.world()
                .resource::<Modified>()
                .0
                .get(&handle.id())
                .unwrap_or(&0)
        };
        let after_alloc = modified(&app, &bound);
        assert!(
            after_alloc >= 1,
            "the first-enable allocation must re-touch capture-bound materials"
        );

        // No-resize frames: nothing re-touches the material.
        app.update();
        app.update();
        assert_eq!(
            modified(&app, &bound),
            after_alloc,
            "an unchanged frame must not re-touch the material"
        );

        // A window resize → the bound material is touched again; the
        // dummy-bound one never is.
        app.world_mut()
            .get_mut::<Camera>(camera)
            .unwrap()
            .computed
            .target_info = Some(RenderTargetInfo {
            physical_size: UVec2::new(1280, 832),
            scale_factor: 1.0,
        });
        app.update();
        app.update(); // flush
        assert!(
            modified(&app, &bound) > after_alloc,
            "a backdrop resize must re-touch capture-bound materials"
        );
        assert_eq!(
            modified(&app, &unbound),
            0,
            "dummy-bound materials must stay untouched"
        );
    }

    #[test]
    fn unknown_effect_name_never_enables() {
        let mut app = test_app();
        spawn_ui_camera(&mut app, UVec2::new(64, 64));
        // An RLayer whose effect isn't registered (shouldn't happen — the
        // reconciler resolves to "none" — but the derivation must not panic
        // or enable on it).
        app.world_mut().spawn(RLayer {
            companion: Entity::PLACEHOLDER,
            effect: "ghost".into(),
        });
        app.update();
        assert!(!enabled(&app));
        assert_eq!(image_size(&app), UVec2::ONE);
    }
}
