//! The persistent capture-texture store — the resource that makes layer
//! capture caching possible. Split from `render.rs` (which stays the pass /
//! composite half): slot structs, allocation, and the per-frame
//! [`prepare_layer_textures`] maintenance. Everything is re-exported through
//! `super` so consumers keep their `render::…` paths.

use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::render::render_phase::ViewSortedRenderPhases;
use bevy::render::render_resource::{
    BindGroup, Extent3d, PipelineCache, TextureDescriptor, TextureDimension, TextureFormat,
    TextureUsages, TextureViewDescriptor,
};
use bevy::render::renderer::RenderDevice;
use bevy::render::sync_world::MainEntity;
use bevy::render::texture::CachedTexture;
use bevy::ui_render::TransparentUi;

use super::{ExtractedUiLayers, mips};

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
    /// The capture texture. For a mipped slot ([`Self::mips`] present) the
    /// `default_view` is a **base-mip-only** view, so every pre-mips consumer
    /// stays valid unchanged: the capture attachment (single-mip rule), the
    /// filter-pass sources (level-0, 1:1 contract), and the bilinear
    /// composite bind group (can never accidentally sample a stale mip).
    pub texture: CachedTexture,
    pub size: UVec2,
    pub format: TextureFormat,
    /// Composite bind group, built lazily and kept until realloc (per-frame
    /// bind-group creation is real cost at hundreds of layers).
    pub bind_group: Option<BindGroup>,
    /// Mip-chain views, present iff the layer wants mips (`TRANSFORM3D`
    /// promotion reason — see [`mips`]); presence joins the realloc key.
    pub mips: Option<mips::MipChain>,
    /// Whether the mip chain matches the texture's current level 0. Reset
    /// whenever a capture is staged; set by [`mips::prepare_layer_mips`] when
    /// the downsample run is certain to execute. While false the composite
    /// samples bilinear level 0 (correct, just unmipped).
    pub mips_valid: bool,
    /// Trilinear composite bind group (full-mip view + `sampler_mips`), for
    /// non-identity transformed quads; lazy like [`Self::bind_group`].
    pub bind_group_mips: Option<BindGroup>,
    /// Whether the texture holds a *complete* capture. A capture that runs
    /// while any of its items' pipelines are still compiling renders those
    /// items as nothing (`phase.render` skips them silently) — serving that
    /// from cache would freeze a blank/partial layer on screen. Only a
    /// capture whose pipelines were all ready marks the content valid;
    /// until then extraction keeps re-capturing.
    pub content_valid: bool,
    /// Filter-pass state, present iff the layer had a chain last frame.
    /// **Cleared whenever the chain disappears** ([`prepare_layer_textures`]):
    /// [`ResolvedFilterChain::version`](crate::filters::ResolvedFilterChain)
    /// restarts at 1 per chain lifetime (demote/re-promote), so a stale
    /// `params_version` surviving the chain's absence could collide with a
    /// restarted version and skip a needed re-run with old params.
    pub filter: Option<FilterSlot>,
    pub last_seen: u64,
}

/// A layer's persistent filter-pass resources: two same-size ping-pong
/// textures (pass 0 samples the capture and writes `textures[0]`, pass 1
/// samples `textures[0]` and writes `textures[1]`, and so on) plus the
/// bookkeeping that lets a clean chain skip re-running its passes. Allocated
/// at the capture's size + format; dies with the [`LayerSlot`] on realloc.
pub struct FilterSlot {
    /// The ping-pong targets (`RENDER_ATTACHMENT | TEXTURE_BINDING`).
    pub textures: [CachedTexture; 2],
    /// The [`ExtractedChain::version`](super::ExtractedChain::version) the
    /// last staged run used; `0` = never staged (versions start at 1).
    pub params_version: u32,
    /// Whether `textures[output_index]` holds a *complete* filter output.
    /// Staging a run resets it; [`prepare_layer_filters`](super::prepare_layer_filters)
    /// sets it back only when the whole staged chain is certain to execute
    /// this frame (every pass pipeline already compiled AND the source
    /// capture valid — the same conservative discipline as
    /// [`LayerSlot::content_valid`]). While false,
    /// [`prepare_layer_composites`](super::prepare_layer_composites) withholds
    /// the quad's batch (draws nothing — never a flash of unfiltered content)
    /// and the layer restages every frame until the run goes through.
    pub output_valid: bool,
    /// Consecutive frames the composite gate has withheld this layer's quad
    /// (no complete filtered output to sample); reset to 0 when
    /// [`Self::output_valid`] flips true. Drives the stuck-gate warning (see
    /// [`Self::gate_warned`]) — a pipeline that never compiles (user WGSL
    /// error) would otherwise leave the subtree invisible forever with no
    /// log from this module.
    pub gated_frames: u32,
    /// Whether this stuck episode already warned (once per episode; reset
    /// with [`Self::gated_frames`]). An errored pass pipeline warns
    /// immediately with the compile error; a still-compiling one only after
    /// [`STUCK_GATE_HANG_FRAMES`](super::STUCK_GATE_HANG_FRAMES).
    pub gate_warned: bool,
    /// Which ping-pong texture the final pass writes: `(len - 1) % 2`.
    pub output_index: usize,
    /// Composite bind group sampling `textures[.0]` — built by
    /// `prepare_layer_composites`' filter retarget, kept until realloc like
    /// [`LayerSlot::bind_group`]; the stored index invalidates it when
    /// `output_index` flips (pass-count parity change).
    pub composite_bind_group: Option<(usize, BindGroup)>,
    /// Mip-chain views per ping-pong (either can be the output on pass-count
    /// parity flips), present iff the layer wants mips. The composite samples
    /// the *filter output*, so for a filtered layer the mips live here, not
    /// on the capture.
    pub mips: [Option<mips::MipChain>; 2],
    /// Mirrors [`LayerSlot::mips_valid`] for the current output texture;
    /// reset whenever a filter run is staged.
    pub mips_valid: bool,
    /// Trilinear composite bind group over `textures[.0]`'s full-mip view,
    /// with the same `output_index` invalidation as
    /// [`Self::composite_bind_group`].
    pub composite_bind_group_mips: Option<(usize, BindGroup)>,
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

/// Maintains the persistent per-layer capture textures (camera target format —
/// stolen pipelines were specialized against it; sample count 1 — `ui_pass`
/// renders unsampled): get-or-(re)allocate each live layer's
/// [`LayerTextureStore`] slot, mirror it into the index-aligned
/// [`LayerAtlases`], and evict slots whose layer is gone. Also owns the
/// [`FilterSlot`] lifecycle: ping-pong textures allocated while the layer has
/// a chain, cleared (with their version bookkeeping — load-bearing, see the
/// in-body comment) when it doesn't. Deliberately not Bevy's `TextureCache` —
/// capture caching needs each layer to keep *its own* texture (and its
/// pixels) across frames.
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
        let slot = store.slots.entry(layer.main_entity).or_insert_with(|| {
            alloc_layer_slot(
                &render_device,
                wanted,
                layer.target_format,
                layer.wants_mips,
            )
        });
        if slot.size != wanted
            || slot.format != layer.target_format
            || slot.mips.is_some() != layer.wants_mips
        {
            // Resize / format / mip-state flip: fresh texture, and the stale
            // bind group dies with the slot — as does the filter state
            // (`filter: None`), which re-allocates at the new size just
            // below. Extraction already flagged `needs_capture` (its
            // `cached_ok` mirrors this key).
            *slot = alloc_layer_slot(
                &render_device,
                wanted,
                layer.target_format,
                layer.wants_mips,
            );
        }
        if layer.chain.is_some() {
            // Ping-pong textures ride the capture's size + format; a realloc
            // above reset `filter` to `None`, so this re-allocates them too
            // (with `output_valid: false` / `params_version: 0` — the staged
            // run restarts from scratch).
            if slot.filter.is_none() {
                slot.filter = Some(alloc_filter_slot(
                    &render_device,
                    wanted,
                    layer.target_format,
                    layer.wants_mips,
                ));
            }
        } else {
            // No chain this frame: drop the filter state entirely.
            // Load-bearing, not just cleanup — `ResolvedFilterChain.version`
            // restarts at 1 per chain lifetime (demote/re-promote, filter
            // unset/re-set), so a surviving `params_version` could collide
            // with a restarted version and skip a needed re-run with stale
            // params.
            slot.filter = None;
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
            // The capture rewrites level 0 this frame — its mip chain (if
            // any) goes stale until `prepare_layer_mips` restages it.
            slot.mips_valid = false;
        }
        slot.last_seen = frame;
        atlases.textures.push(slot.texture.clone());
    }
    // Demoted/despawned layers: keep the slot for a short grace (cheap
    // re-promotion churn), then free the texture memory.
    store.slots.retain(|_, slot| slot.last_seen + 3 >= frame);
}

/// Create a capture-format texture, optionally with a full mip chain. When
/// mipped, the returned `default_view` is **base-mip-only** (see
/// [`LayerSlot::texture`] for why that keeps every consumer valid) and the
/// per-level + full views come back as a [`mips::MipChain`].
fn alloc_capture_texture(
    render_device: &RenderDevice,
    label: &'static str,
    size: UVec2,
    format: TextureFormat,
    mipped: bool,
) -> (CachedTexture, Option<mips::MipChain>) {
    let levels = if mipped {
        mips::mip_level_count(size)
    } else {
        1
    };
    let texture = render_device.create_texture(&TextureDescriptor {
        label: Some(label),
        size: Extent3d {
            width: size.x,
            height: size.y,
            depth_or_array_layers: 1,
        },
        mip_level_count: levels,
        sample_count: 1,
        dimension: TextureDimension::D2,
        format,
        usage: TextureUsages::RENDER_ATTACHMENT | TextureUsages::TEXTURE_BINDING,
        view_formats: &[],
    });
    let default_view = texture.create_view(&TextureViewDescriptor {
        mip_level_count: Some(1),
        ..Default::default()
    });
    let chain = mipped.then(|| mips::build_mip_chain(&texture, levels));
    (
        CachedTexture {
            texture,
            default_view,
        },
        chain,
    )
}

fn alloc_layer_slot(
    render_device: &RenderDevice,
    size: UVec2,
    format: TextureFormat,
    mipped: bool,
) -> LayerSlot {
    let (texture, mips) =
        alloc_capture_texture(render_device, "ui_layer_capture", size, format, mipped);
    LayerSlot {
        texture,
        size,
        format,
        bind_group: None,
        mips,
        mips_valid: false,
        bind_group_mips: None,
        content_valid: false,
        filter: None,
        last_seen: 0,
    }
}

/// Allocate a layer's two filter ping-pong textures at the capture's size and
/// format (same-size passes — the prelude documents `uv` as a 1:1 lookup; the
/// capture format keeps every pass target compatible with the composite).
fn alloc_filter_slot(
    render_device: &RenderDevice,
    size: UVec2,
    format: TextureFormat,
    mipped: bool,
) -> FilterSlot {
    // Both ping-pongs get the chain when mipped: either can be the final
    // output on a pass-count parity flip, and that output is what the
    // transformed composite samples trilinearly.
    let alloc =
        |label: &'static str| alloc_capture_texture(render_device, label, size, format, mipped);
    let (ping, ping_mips) = alloc("ui_layer_filter_ping");
    let (pong, pong_mips) = alloc("ui_layer_filter_pong");
    FilterSlot {
        textures: [ping, pong],
        params_version: 0,
        output_valid: false,
        gated_frames: 0,
        gate_warned: false,
        output_index: 0,
        composite_bind_group: None,
        mips: [ping_mips, pong_mips],
        mips_valid: false,
        composite_bind_group_mips: None,
    }
}
