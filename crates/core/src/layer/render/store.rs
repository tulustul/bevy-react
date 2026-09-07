//! The persistent capture-texture store — the resource that makes layer
//! capture caching possible. Split from `render.rs` (which stays the pass /
//! composite half): slot structs, allocation, and the per-frame
//! [`prepare_layer_textures`] maintenance. Everything is re-exported through
//! `super` so consumers keep their `render::…` paths.

use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::render::render_phase::ViewSortedRenderPhases;
use bevy::render::render_resource::{
    BindGroup, BufferId, Extent3d, PipelineCache, TextureDescriptor, TextureDimension,
    TextureFormat, TextureUsages, TextureViewDescriptor, TextureViewId,
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
    /// Index-aligned with `textures`: the viewport the capture pass must set
    /// for a bucket-allocated texture ([`LayerSlot::image_viewport`]).
    pub viewports: Vec<Option<UVec2>>,
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
    /// The IMAGE size: the layer's capture rect in texels, refreshed every
    /// frame. The pixels occupy the top-left `size` of every texture in the
    /// slot; the composite and the filter prelude sample only that sub-rect.
    pub size: UVec2,
    /// The textures' real extent, `>= size`. Equal to `size` for a layer
    /// that isn't [`bucketable`](super::ExtractedLayer::bucketable); a
    /// bucketable layer allocates in [`BUCKET_PX`] steps with shrink slack
    /// ([`alloc_fits`]), so a size-animating layer keeps its textures — and
    /// every bind group built over their views — across 1 px changes instead
    /// of reallocating capture + ping-pongs each frame.
    pub alloc: UVec2,
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
    /// Backdrop state (snapshot + its ping-pong pair), present iff the layer
    /// had a `backdropFilter` chain last frame. Same clear-on-absence rule
    /// as [`Self::filter`], for the same version-restart reason.
    pub backdrop: Option<super::backdrop::BackdropSlot>,
    /// Morph state (the frozen snapshot + the blend target), present iff a
    /// morph is in flight. Unlike [`Self::filter`]/[`Self::backdrop`] it is
    /// PRESERVED across slot reallocs — the frozen pixels must survive the
    /// union-rect resize of the freeze frame (see
    /// [`super::morph::freeze_morph_snapshot`]); cleared when the extracted
    /// morph disappears.
    pub morph: Option<super::morph::MorphSlot>,
    pub last_seen: u64,
}

impl LayerSlot {
    /// Whether this slot's textures must be re-created for a layer that now
    /// wants `wanted` texels in `format` (mipped or not, bucketable or not).
    /// Shared by extraction (its `cached_ok` must mirror the realloc key —
    /// a fresh texture needs a capture) and [`prepare_layer_textures`].
    pub fn needs_realloc(
        &self,
        wanted: UVec2,
        format: TextureFormat,
        mipped: bool,
        bucketable: bool,
    ) -> bool {
        self.format != format
            || self.mips.is_some() != mipped
            || !alloc_fits(self.alloc, wanted, bucketable)
    }

    /// The viewport a pass writing this slot's image must set: `Some(image
    /// size)` when the textures are larger than the image (top-left
    /// anchored), `None` when they are exactly image-sized (full target).
    pub fn image_viewport(&self) -> Option<UVec2> {
        (self.alloc != self.size).then_some(self.size)
    }
}

/// Texture allocation granularity (px per side) for bucketable layers.
pub const BUCKET_PX: u32 = 32;
/// How far above `bucket_size(wanted)` a bucketed allocation may stay before
/// a *shrinking* layer reallocates: two buckets, so a size oscillation
/// spanning up to 64 px (crossing at most two bucket boundaries) settles on
/// one allocation after its first growth.
const SHRINK_SLACK_PX: u32 = 2 * BUCKET_PX;

/// `wanted` rounded up to whole buckets (at least one).
pub fn bucket_size(wanted: UVec2) -> UVec2 {
    let round_up = |v: u32| v.max(1).div_ceil(BUCKET_PX) * BUCKET_PX;
    UVec2::new(round_up(wanted.x), round_up(wanted.y))
}

/// Whether an existing allocation of `alloc` texels can keep serving a layer
/// that wants `wanted`: exact match for non-bucketable layers; for bucketable
/// ones, large enough and not more than [`SHRINK_SLACK_PX`] over the bucket.
pub fn alloc_fits(alloc: UVec2, wanted: UVec2, bucketable: bool) -> bool {
    if bucketable {
        alloc.cmpge(wanted).all() && alloc.cmple(bucket_size(wanted) + SHRINK_SLACK_PX).all()
    } else {
        alloc == wanted
    }
}

/// The extent to allocate for a layer wanting `wanted` texels.
pub fn alloc_for(wanted: UVec2, bucketable: bool) -> UVec2 {
    if bucketable {
        bucket_size(wanted)
    } else {
        wanted
    }
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
    /// The chain's per-pass bind groups, kept across staged frames (see
    /// [`PassBindGroups`]).
    pub pass_bind_groups: PassBindGroups,
}

/// Identity of everything a filter-style pass bind group references: the
/// views bound at binding 0 (the pass source) and binding 3 (the capture —
/// or the morph snapshot), and the dynamic-offset uniform **buffer**. The
/// per-frame variation is the dynamic *offset*, which lives on the pass, not
/// in the bind group; the buffer itself only changes when
/// `DynamicUniformBuffer::write_buffer` reallocates it (growth). The sampler
/// and the bind-group layout are pipeline-lifetime constants
/// (`LayerFilterPipeline` is built once and every pass shader shares its one
/// layout), so they need no slot here. All three ids are process-unique
/// atomics — never reused — so a stale key can't alias a fresh resource.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct PassBindKey {
    pub source: TextureViewId,
    pub capture: TextureViewId,
    pub uniforms: BufferId,
}

/// Per-pass bind groups cached across staged frames, indexed by pass. A
/// chain that restages every frame (animated params, `always_dirty`, an
/// in-flight morph) used to rebuild every pass's bind group per frame —
/// hundreds of layers × passes of `create_bind_group` for inputs that had
/// not changed. Entries are reused while their [`PassBindKey`] matches, so
/// a texture-slot realloc (new view ids) or a uniform-buffer realloc (new
/// buffer id) rebuilds exactly the affected passes.
#[derive(Default)]
pub struct PassBindGroups {
    entries: Vec<(PassBindKey, BindGroup)>,
}

impl PassBindGroups {
    /// Drop cached entries past `len` (the chain shrank).
    pub fn truncate(&mut self, len: usize) {
        self.entries.truncate(len);
    }

    /// The bind group for pass `index`, reused when its key matches and
    /// (re)built via `build` otherwise. Passes are staged in order, so
    /// `index` is at most `entries.len()`; a caller skipping ahead gets an
    /// uncached bind group (never a wrong one).
    pub fn get_or_create(
        &mut self,
        index: usize,
        key: PassBindKey,
        build: impl FnOnce() -> BindGroup,
    ) -> BindGroup {
        match self.entries.get_mut(index) {
            Some((cached_key, bind_group)) => {
                if *cached_key != key {
                    *cached_key = key;
                    *bind_group = build();
                }
                bind_group.clone()
            }
            None => {
                let bind_group = build();
                if index == self.entries.len() {
                    self.entries.push((key, bind_group.clone()));
                }
                bind_group
            }
        }
    }
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
    atlases.viewports.clear();
    let store = &mut *store;
    store.frame += 1;
    let frame = store.frame;
    for layer in &extracted.layers {
        let wanted = layer.size.max(UVec2::ONE);
        let slot = store.slots.entry(layer.main_entity).or_insert_with(|| {
            alloc_layer_slot(
                &render_device,
                wanted,
                alloc_for(wanted, layer.bucketable),
                layer.target_format,
                layer.wants_mips,
            )
        });
        // Decide this frame's allocation up front: the morph freeze below
        // allocates its blend target at the final extent.
        let realloc = slot.needs_realloc(
            wanted,
            layer.target_format,
            layer.wants_mips,
            layer.bucketable,
        );
        let alloc = if realloc {
            alloc_for(wanted, layer.bucketable)
        } else {
            slot.alloc
        };
        // Morph freeze first: a new `freeze_seq` steals the pixels currently
        // on screen (the capture, or an interrupted morph's blend) BEFORE
        // the realloc below would drop them — and before the image size
        // update, so the stolen texture's image geometry is last frame's.
        super::morph::freeze_morph_snapshot(slot, layer, wanted, alloc, &render_device);
        if realloc {
            // Outgrown allocation / format / mip-state flip: fresh texture,
            // and the stale bind group dies with the slot — as does the
            // filter state (`filter: None`), which re-allocates at the new
            // extent just below. Extraction already flagged `needs_capture`
            // (its `cached_ok` mirrors this key via `needs_realloc`). The
            // morph state is the one survivor: its frozen snapshot must
            // outlive the resize (the blend re-allocates below).
            let morph = slot.morph.take();
            *slot = alloc_layer_slot(
                &render_device,
                wanted,
                alloc,
                layer.target_format,
                layer.wants_mips,
            );
            slot.morph = morph;
        }
        // The image size tracks the layer every frame; the allocation only
        // when it stops fitting. A bucketable layer whose size moves within
        // its allocation keeps textures, bind groups and filter state — the
        // capture re-renders (extraction saw the size change) but nothing is
        // re-created.
        slot.size = wanted;
        // Post-realloc morph maintenance: clear an ended morph, track the
        // capture allocation with the blend target.
        super::morph::maintain_morph_blend(slot, layer, &render_device);
        if layer.chain.is_some() {
            // Ping-pong textures ride the capture's extent + format; a
            // realloc above reset `filter` to `None`, so this re-allocates
            // them too (with `output_valid: false` / `params_version: 0` —
            // the staged run restarts from scratch).
            if slot.filter.is_none() {
                slot.filter = Some(alloc_filter_slot(
                    &render_device,
                    slot.alloc,
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
        // Backdrop slot: same lifecycle as the filter slot (allocated while
        // a chain exists, cleared — with its version bookkeeping — when it
        // doesn't; a realloc above dropped it implicitly).
        if layer.backdrop_chain.is_some() {
            if slot.backdrop.is_none() {
                slot.backdrop = Some(super::backdrop::alloc_backdrop_slot(
                    &render_device,
                    slot.alloc,
                    layer.target_format,
                ));
            }
        } else {
            slot.backdrop = None;
        }
        if layer.needs_capture {
            // This frame's capture is only servable from cache later if every
            // item actually renders — a still-compiling pipeline makes
            // `phase.render` skip its item silently, and freezing that
            // blank/partial capture would blank the layer on screen for good
            // (the exact failure mode of capturing during app startup).
            // Conservative by construction: a pipeline that compiles between
            // here and the capture pass costs one redundant re-capture.
            // An EMPTY phase is vacuously complete — the capture pass still
            // runs its clear, so the texture faithfully holds the subtree's
            // content: nothing, i.e. transparent. "Valid" therefore means
            // "capture reflects the subtree", NOT "capture has pixels" — an
            // empty morph carrier's transparent capture is stealable (freeze)
            // and blendable (morph-to-empty) like any other.
            slot.content_valid = phases.get(&layer.retained).is_some_and(|phase| {
                phase
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
        atlases.viewports.push(slot.image_viewport());
    }
    // Demoted/despawned layers: keep the slot for a short grace (cheap
    // re-promotion churn), then free the texture memory.
    store.slots.retain(|_, slot| slot.last_seen + 3 >= frame);
}

/// Create a capture-format texture, optionally with a full mip chain. When
/// mipped, the returned `default_view` is **base-mip-only** (see
/// [`LayerSlot::texture`] for why that keeps every consumer valid) and the
/// per-level + full views come back as a [`mips::MipChain`].
pub(super) fn alloc_capture_texture(
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

/// A fresh slot holding a `size` image in textures of `alloc` texels
/// (`alloc >= size`; see [`alloc_for`]).
fn alloc_layer_slot(
    render_device: &RenderDevice,
    size: UVec2,
    alloc: UVec2,
    format: TextureFormat,
    mipped: bool,
) -> LayerSlot {
    let (texture, mips) =
        alloc_capture_texture(render_device, "ui_layer_capture", alloc, format, mipped);
    LayerSlot {
        texture,
        size,
        alloc,
        format,
        bind_group: None,
        mips,
        mips_valid: false,
        bind_group_mips: None,
        content_valid: false,
        filter: None,
        backdrop: None,
        morph: None,
        last_seen: 0,
    }
}

/// Allocate a layer's two filter ping-pong textures at the capture's extent
/// and format (same-extent passes — the prelude's `uv` is a 1:1 lookup over
/// the shared image rect; the capture format keeps every pass target
/// compatible with the composite).
fn alloc_filter_slot(
    render_device: &RenderDevice,
    alloc: UVec2,
    format: TextureFormat,
    mipped: bool,
) -> FilterSlot {
    // Both ping-pongs get the chain when mipped: either can be the final
    // output on a pass-count parity flip, and that output is what the
    // transformed composite samples trilinearly.
    let alloc_one =
        |label: &'static str| alloc_capture_texture(render_device, label, alloc, format, mipped);
    let (ping, ping_mips) = alloc_one("ui_layer_filter_ping");
    let (pong, pong_mips) = alloc_one("ui_layer_filter_pong");
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
        pass_bind_groups: PassBindGroups::default(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Bucket rounding: whole buckets, at least one, exact multiples kept.
    #[test]
    fn bucket_size_rounds_up_to_whole_buckets() {
        assert_eq!(bucket_size(UVec2::new(1, 1)), UVec2::splat(BUCKET_PX));
        assert_eq!(bucket_size(UVec2::ZERO), UVec2::splat(BUCKET_PX));
        assert_eq!(bucket_size(UVec2::new(32, 33)), UVec2::new(32, 64));
        assert_eq!(bucket_size(UVec2::new(213, 150)), UVec2::new(224, 160));
    }

    /// The fit rule: non-bucketable layers need the exact extent; bucketable
    /// ones keep an allocation that is large enough and at most two buckets
    /// over the wanted bucket — so a ±20 px oscillation, after growing once,
    /// never reallocates again, while a real shrink eventually frees memory.
    #[test]
    fn alloc_fits_table() {
        let exact = |a: (u32, u32), w: (u32, u32)| {
            alloc_fits(UVec2::new(a.0, a.1), UVec2::new(w.0, w.1), false)
        };
        assert!(exact((200, 150), (200, 150)));
        assert!(!exact((201, 150), (200, 150)), "larger is not exact");
        assert!(!exact((199, 150), (200, 150)));

        let bucketed = |a: (u32, u32), w: (u32, u32)| {
            alloc_fits(UVec2::new(a.0, a.1), UVec2::new(w.0, w.1), true)
        };
        // Grows only when outgrown…
        assert!(bucketed((224, 160), (213, 150)));
        assert!(bucketed((224, 160), (224, 160)));
        assert!(!bucketed((224, 160), (225, 160)), "one px over the extent");
        // …and shrinks only past the slack: alloc 256 serves wanted down to
        // the bucket 192 (192 + 64 = 256), not below.
        assert!(bucketed((256, 160), (193, 150)));
        assert!(bucketed((256, 160), (192, 150)));
        assert!(!bucketed((256, 160), (160, 150)), "bucket 160 + 64 < 256");
        // The ±20 px stress scenario: 180..220 wide crosses one boundary
        // (192); alloc 224 (from the top) serves the whole range.
        for w in 180..=220 {
            assert!(bucketed((224, 192), (w, 170)), "width {w}");
        }
        // A degenerate wanted still fits any allocation ≤ one bucket + slack.
        assert!(bucketed((32, 32), (1, 1)));
        assert!(!bucketed((128, 32), (1, 1)));
    }

    /// `alloc_for` picks the bucket for bucketable layers and the exact
    /// extent otherwise; the two agree with `alloc_fits` right after.
    #[test]
    fn alloc_for_is_a_fit() {
        for (w, h) in [(1, 1), (31, 33), (200, 150), (1280, 832)] {
            let wanted = UVec2::new(w, h);
            for bucketable in [false, true] {
                let alloc = alloc_for(wanted, bucketable);
                assert!(alloc.cmpge(wanted).all());
                assert!(
                    alloc_fits(alloc, wanted, bucketable),
                    "{wanted} {bucketable}"
                );
            }
            assert_eq!(alloc_for(wanted, false), wanted);
            assert_eq!(alloc_for(wanted, true), bucket_size(wanted));
        }
    }
}
