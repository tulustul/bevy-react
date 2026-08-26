//! The `imageRendering` style: how a node's raster source (`<image src>`,
//! `backgroundImage`) is resampled when drawn at a size other than its own.
//!
//! bevy_ui samples image textures with the **asset's** sampler (the bind group
//! is cached per `AssetId`), and a loaded PNG has a single mip level — so a
//! large image drawn small aliases (level-0 bilinear picks ~1 texel per pixel).
//! The keyword is per node, but the sampler is per asset, so an explicit mode
//! is honored through a **derived variant asset** per `(source, mode)`
//! (ADR-0003): the source is never mutated (an app `Sprite` sharing the file is
//! untouched), one variant is shared by every node asking for the same pair,
//! a variant is only made when the source doesn't already satisfy the mode,
//! and it is dropped with its last user. `trilinear` builds the variant's mip
//! pyramid on the CPU ([`pyramid`]) off-thread; the node stays on its source
//! until the pyramid lands (no interim upload). Live textures (render targets,
//! canvas, svg, `{ texture }`/portal bindings) are never copied or written:
//! every explicit mode is refused there with one warning.
//!
//! This module owns the wire type ([`ImageRendering`]); `protocol::style`
//! references it by path, like `canvas`/`svg`.

pub mod pyramid;
#[cfg(test)]
mod tests;

use std::collections::{HashMap, HashSet};

use bevy::asset::{AssetEvent, AssetId};
use bevy::ecs::system::ParamSet;
use bevy::image::{
    ImageFilterMode, ImageSampler, ImageSamplerDescriptor, TRANSPARENT_IMAGE_HANDLE,
};
use bevy::prelude::*;
use bevy::render::render_resource::TextureUsages;
use bevy::tasks::{AsyncComputeTaskPool, Task, futures_lite::future::block_on, poll_once};
use bevy::ui::widget::ImageNode;

use crate::background_image::RBackgroundTexture;
use crate::bridge::ReactNode;
use crate::canvas::CanvasSurface;
use crate::layer::LayerContentDirt;
use crate::portal::RPortal;
use crate::svg::SvgSurface;

/// The `imageRendering` keyword. `Auto` is **passive** — it never touches an
/// asset and renders as the engine default (level-0 bilinear today).
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub enum ImageRendering {
    #[default]
    Auto,
    /// Linear mag/min, level 0 only (`lod_max_clamp = 0`), even on an asset
    /// that carries mips.
    Bilinear,
    /// A mip pyramid (generated when absent) sampled linear across levels.
    Trilinear,
    /// Nearest mag/min, level 0 only — "show me the texels".
    Nearest,
}

/// The node's explicit `imageRendering` mode (never `Auto` — an `auto`/absent
/// style removes the component; see `apply_style_masked`). The binding
/// systems pair it with the entity's `ImageNode`.
#[derive(Component, Clone, Copy, Debug, PartialEq, Eq)]
pub struct ImageRenderingMode(pub ImageRendering);

/// The `diag` kind every `imageRendering` fall-back reports under (a refused
/// mode: live texture, no CPU data, unsupported format for `trilinear`).
pub const WARN_KIND: &str = "imageRendering";

/// A derived variant: `(source, mode)`.
type VariantKey = (AssetId<Image>, ImageRendering);

struct Variant {
    handle: Handle<Image>,
    /// Strong, so the source outlives its variants (hot-reload `Modified`
    /// events keep flowing while any variant is in use).
    source: Handle<Image>,
    users: usize,
    /// The asset has been inserted under `handle` (a `trilinear` variant is
    /// reserved until its first pyramid lands; its users stay on the source).
    ready: bool,
    /// The in-flight pyramid build; lands via `Assets::insert` over `handle`.
    pyramid: Option<Task<Image>>,
    /// The source changed while a pyramid was in flight — derive again when
    /// it lands (never cancel a build, or a continuously-updated source
    /// would never get its pyramid).
    rebuild: bool,
}

/// What an entity is bound to: its source handle (strong, for the same reason
/// as [`Variant::source`]), the mode it was bound under, and the variant key
/// it uses — `None` when the source is used as-is.
struct Bound {
    source: Handle<Image>,
    mode: ImageRendering,
    key: Option<VariantKey>,
}

/// The variant-asset cache (ADR-0003): one variant per `(source, mode)` in
/// use, refcounted by bound entities, rebuilt on source reload.
#[derive(Resource)]
pub struct ImageVariants {
    /// What `ImageSampler::Default` means — the host's
    /// `ImagePlugin::default_sampler` (read at plugin build).
    pub default_sampler: ImageSamplerDescriptor,
    variants: HashMap<VariantKey, Variant>,
    /// Variant asset id → its key, so a node already pointed at a variant is
    /// recognized (and never derives a variant of a variant).
    by_variant: HashMap<AssetId<Image>, VariantKey>,
    bound: HashMap<Entity, Bound>,
    /// Entities whose source hasn't loaded yet — retried every frame.
    pending: HashSet<Entity>,
}

impl Default for ImageVariants {
    fn default() -> Self {
        Self {
            default_sampler: ImageSamplerDescriptor::linear(),
            variants: HashMap::new(),
            by_variant: HashMap::new(),
            bound: HashMap::new(),
            pending: HashSet::new(),
        }
    }
}

impl ImageVariants {
    /// Live variant assets (one per `(source, mode)` in use).
    pub fn variant_count(&self) -> usize {
        self.variants.len()
    }

    /// Forget the entity's binding, dropping its variant with the last user.
    /// Returns the binding and the variant asset id it pointed at (if any).
    fn release(&mut self, entity: Entity) -> Option<(Bound, Option<AssetId<Image>>)> {
        self.pending.remove(&entity);
        let bound = self.bound.remove(&entity)?;
        let mut variant_id = None;
        if let Some(key) = bound.key
            && let Some(v) = self.variants.get_mut(&key)
        {
            variant_id = Some(v.handle.id());
            v.users = v.users.saturating_sub(1);
            if v.users == 0 {
                let v = self.variants.remove(&key).expect("present");
                self.by_variant.remove(&v.handle.id());
            }
        }
        Some((bound, variant_id))
    }

    /// The default sampler read from the host's `ImagePlugin` (the plugin's
    /// build step; absent in headless tests → bevy's stock linear).
    pub(crate) fn from_app(app: &App) -> Self {
        let default_sampler = app
            .get_added_plugins::<bevy::image::ImagePlugin>()
            .first()
            .map(|p| p.default_sampler.clone())
            .unwrap_or_else(ImageSamplerDescriptor::linear);
        Self {
            default_sampler,
            ..Default::default()
        }
    }
}

/// Register the resources + system unordered (the headless tests' entry).
/// The plugin adds [`bind_image_rendering`] itself, ordered after the op
/// drain, the interaction restyle, and `bind_background_textures` (all of
/// which write `ImageNode` handles).
#[cfg(test)]
pub(crate) fn register(app: &mut App) {
    app.init_resource::<ImageVariants>();
    app.init_resource::<LayerContentDirt>();
    app.add_systems(Update, bind_image_rendering);
}

/// The sampler an explicit mode asks for.
fn sampler_for(mode: ImageRendering) -> ImageSampler {
    match mode {
        ImageRendering::Auto => ImageSampler::Default,
        ImageRendering::Bilinear => ImageSampler::Descriptor(ImageSamplerDescriptor {
            lod_max_clamp: 0.0,
            ..ImageSamplerDescriptor::linear()
        }),
        ImageRendering::Trilinear => ImageSampler::Descriptor(ImageSamplerDescriptor::linear()),
        ImageRendering::Nearest => ImageSampler::Descriptor(ImageSamplerDescriptor {
            lod_max_clamp: 0.0,
            ..ImageSamplerDescriptor::nearest()
        }),
    }
}

/// Whether `image` already renders the way `mode` asks (no variant needed).
fn satisfies(image: &Image, mode: ImageRendering, default: &ImageSamplerDescriptor) -> bool {
    use ImageFilterMode::{Linear, Nearest};
    let levels = image.texture_descriptor.mip_level_count;
    let d = match &image.sampler {
        ImageSampler::Default => default,
        ImageSampler::Descriptor(d) => d,
    };
    let (mag, min, mip, lod_max) = (d.mag_filter, d.min_filter, d.mipmap_filter, d.lod_max_clamp);
    match mode {
        ImageRendering::Auto => true,
        ImageRendering::Bilinear => {
            mag == Linear && min == Linear && (levels == 1 || lod_max == 0.0)
        }
        ImageRendering::Trilinear => {
            levels > 1
                && mag == Linear
                && min == Linear
                && mip == Linear
                && lod_max >= (levels - 1) as f32
        }
        ImageRendering::Nearest => {
            mag == Nearest && min == Nearest && (levels == 1 || lod_max == 0.0)
        }
    }
}

fn mode_name(mode: ImageRendering) -> &'static str {
    match mode {
        ImageRendering::Auto => "auto",
        ImageRendering::Bilinear => "bilinear",
        ImageRendering::Trilinear => "trilinear",
        ImageRendering::Nearest => "nearest",
    }
}

fn warn(node: Option<&ReactNode>, mode: ImageRendering, message: &str) {
    let _scope = node.map(|n| crate::diag::node_scope(n.0));
    crate::diag::report(WARN_KIND, mode_name(mode), message);
}

/// Spawn the off-thread pyramid build for a `trilinear` variant of `source`.
fn spawn_pyramid(source: &Image) -> Task<Image> {
    let mut work = source.clone();
    work.sampler = sampler_for(ImageRendering::Trilinear);
    AsyncComputeTaskPool::get().spawn(async move {
        // `check` passed on the main thread; a failure here is unreachable
        // but harmless (the copy stays at level 0).
        let _ = pyramid::build_pyramid(&mut work);
        work
    })
}

/// Whether the entity's own element makes its texture live: element-owned
/// rasters (`canvas`, svg) and registry bindings (`<portal>`,
/// `backgroundImage: { texture }`), which are rebound by their own systems.
type LiveMarkers = (
    Has<CanvasSurface>,
    Has<SvgSurface>,
    Has<RPortal>,
    Has<RBackgroundTexture>,
);

/// Decide what a node with `mode` binds to, from its source asset alone.
/// `Err` carries the warning to report; the node keeps its source.
fn plan(
    source: &Image,
    mode: ImageRendering,
    live_element: bool,
    default: &ImageSamplerDescriptor,
) -> Result<Option<ImageRendering>, String> {
    let live = live_element
        || source
            .texture_descriptor
            .usage
            .contains(TextureUsages::RENDER_ATTACHMENT);
    if live {
        return Err(format!(
            "imageRendering \"{}\" is ignored on a live texture (render target, canvas, svg, \
             `{{ texture }}`): it can't be copied and is sampled as-is",
            mode_name(mode)
        ));
    }
    if satisfies(source, mode, default) {
        return Ok(None);
    }
    if source.data.is_none() {
        return Err(format!(
            "imageRendering \"{}\": the image has no CPU-side pixel data to derive from \
             (RENDER_WORLD-only asset usage); sampled as-is",
            mode_name(mode)
        ));
    }
    if mode == ImageRendering::Trilinear
        && let Err(err) = pyramid::check(source)
    {
        return Err(format!(
            "imageRendering \"trilinear\": can't build a mip pyramid — {err}; sampled as-is"
        ));
    }
    Ok(Some(mode))
}

/// Entities whose mode or image handle changed this frame (rebind work).
type ChangedQuery<'w, 's> = Query<
    'w,
    's,
    Entity,
    (
        With<ImageRenderingMode>,
        Or<(Changed<ImageRenderingMode>, Changed<ImageNode>)>,
    ),
>;

type NodeQuery<'w, 's> = Query<
    'w,
    's,
    (
        Option<&'static ImageRenderingMode>,
        &'static mut ImageNode,
        Option<&'static ReactNode>,
        LiveMarkers,
    ),
>;

/// Bind every changed/pending `(mode, ImageNode)` pair to the asset that
/// renders it as asked, release bindings whose mode or image went away,
/// rebuild variants of reloaded sources, and land finished pyramids. Every
/// handle write pushes layer content dirt (the node repaints).
pub fn bind_image_rendering(
    mut variants: ResMut<ImageVariants>,
    mut images: ResMut<Assets<Image>>,
    mut dirt: ResMut<LayerContentDirt>,
    mut events: MessageReader<AssetEvent<Image>>,
    mut removed_modes: RemovedComponents<ImageRenderingMode>,
    mut removed_images: RemovedComponents<ImageNode>,
    mut queries: ParamSet<(ChangedQuery, NodeQuery)>,
) {
    let mut reloaded: Vec<AssetId<Image>> = events
        .read()
        .filter_map(|e| match e {
            AssetEvent::Modified { id } => Some(*id),
            _ => None,
        })
        .filter(|id| variants.variants.values().any(|v| v.source.id() == *id))
        .collect();
    reloaded.sort_unstable();
    reloaded.dedup();

    // Releases: a mode or image gone (incl. despawn). A node that kept its
    // `ImageNode` but lost the mode goes back to its source — only if it is
    // still on the variant (a same-frame src swap already moved it on).
    let released: Vec<Entity> = removed_modes.read().chain(removed_images.read()).collect();
    for entity in released {
        let Some((bound, variant_id)) = variants.release(entity) else {
            continue;
        };
        if let Some(variant_id) = variant_id
            && let Ok((None, mut node, ..)) = queries.p1().get_mut(entity)
            && node.image.id() == variant_id
        {
            node.image = bound.source.clone();
            dirt.nodes.push(entity);
        }
    }

    let mut work: Vec<Entity> = queries.p0().iter().collect();
    work.extend(variants.pending.iter().copied());
    work.sort_unstable();
    work.dedup();
    let mut nodes = queries.p1();
    for entity in work {
        let Ok((Some(mode), mut node, react, live)) = nodes.get_mut(entity) else {
            variants.pending.remove(&entity);
            continue;
        };
        let live_element = live.0 || live.1 || live.2 || live.3;
        bind(
            entity,
            mode.0,
            &mut node,
            react,
            live_element,
            &mut variants,
            &mut images,
            &mut dirt,
        );
    }

    for id in reloaded {
        let Some(source) = images.get(id).cloned() else {
            continue;
        };
        let keys: Vec<VariantKey> = variants
            .variants
            .iter()
            .filter(|(_, v)| v.source.id() == id)
            .map(|(k, _)| *k)
            .collect();
        for key in keys {
            let v = variants.variants.get_mut(&key).expect("listed");
            if key.1 == ImageRendering::Trilinear {
                if v.pyramid.is_some() {
                    v.rebuild = true;
                } else {
                    v.pyramid = Some(spawn_pyramid(&source));
                }
            } else {
                let mut image = source.clone();
                image.sampler = sampler_for(key.1);
                images
                    .insert(v.handle.id(), image)
                    .expect("the variant handle is held strong");
            }
        }
    }

    // Land finished pyramids; a variant landing for the first time takes its
    // waiting users off the source.
    let mut landed: Vec<VariantKey> = Vec::new();
    for (key, v) in variants.variants.iter_mut() {
        let Some(task) = v.pyramid.as_mut() else {
            continue;
        };
        let Some(image) = block_on(poll_once(task)) else {
            continue;
        };
        images
            .insert(v.handle.id(), image)
            .expect("the variant handle is held strong");
        v.pyramid = None;
        if !v.ready {
            v.ready = true;
            landed.push(*key);
        }
        if std::mem::take(&mut v.rebuild)
            && let Some(source) = images.get(v.source.id())
        {
            v.pyramid = Some(spawn_pyramid(source));
        }
    }
    for key in landed {
        let handle = variants.variants[&key].handle.clone();
        let users: Vec<Entity> = variants
            .bound
            .iter()
            .filter(|(_, b)| b.key == Some(key))
            .map(|(e, _)| *e)
            .collect();
        for entity in users {
            if let Ok((_, mut node, ..)) = nodes.get_mut(entity)
                && node.image.id() != handle.id()
            {
                node.image = handle.clone();
                dirt.nodes.push(entity);
            }
        }
    }
}

#[allow(clippy::too_many_arguments)]
fn bind(
    entity: Entity,
    mode: ImageRendering,
    node: &mut Mut<ImageNode>,
    react: Option<&ReactNode>,
    live_element: bool,
    variants: &mut ImageVariants,
    images: &mut Assets<Image>,
    dirt: &mut LayerContentDirt,
) {
    let current = node.image.id();
    // A registry binding's placeholder: nothing to bind yet, and the rebind
    // fires when the real texture lands (`Changed<ImageNode>`).
    if current == TRANSPARENT_IMAGE_HANDLE.id() {
        variants.pending.remove(&entity);
        return;
    }
    // Already pointed at a variant (our own repoint echoing back as a change,
    // or a mode flip on a bound node): derive from *its* source.
    let source: Handle<Image> = match variants.by_variant.get(&current) {
        Some(key) => variants.variants[key].source.clone(),
        None => node.image.clone(),
    };
    // Same source, same mode → nothing changed for us (a tint write, our own
    // repoint echo, a rebuild that wrote the source handle back): no plan, no
    // repeated warning — just make sure the node is on the handle it was
    // bound to.
    if let Some(b) = variants.bound.get(&entity)
        && b.source.id() == source.id()
        && b.mode == mode
    {
        let expected = match b.key.and_then(|k| variants.variants.get(&k)) {
            Some(v) if v.ready => v.handle.clone(),
            _ => source.clone(),
        };
        variants.pending.remove(&entity);
        if node.image.id() != expected.id() {
            node.image = expected;
            dirt.nodes.push(entity);
        }
        return;
    }
    // Anything else is a rebind: let go of the old binding first, so a swap
    // to a slow/failed source doesn't pin the previous variant.
    variants.release(entity);
    let Some(src_img) = images.get(source.id()) else {
        variants.pending.insert(entity);
        return;
    };
    let key = match plan(src_img, mode, live_element, &variants.default_sampler) {
        Ok(Some(mode)) => Some((source.id(), mode)),
        Ok(None) => None,
        Err(message) => {
            warn(react, mode, &message);
            None
        }
    };
    let handle = match key {
        None => source.clone(),
        Some(key) => {
            if !variants.variants.contains_key(&key) {
                let (handle, ready, pyramid) = if mode == ImageRendering::Trilinear {
                    (images.reserve_handle(), false, Some(spawn_pyramid(src_img)))
                } else {
                    let mut image = src_img.clone();
                    image.sampler = sampler_for(mode);
                    (images.add(image), true, None)
                };
                variants.by_variant.insert(handle.id(), key);
                variants.variants.insert(
                    key,
                    Variant {
                        handle,
                        source: source.clone(),
                        users: 0,
                        ready,
                        pyramid,
                        rebuild: false,
                    },
                );
            }
            let v = variants.variants.get_mut(&key).expect("just ensured");
            v.users += 1;
            if v.ready {
                v.handle.clone()
            } else {
                source.clone()
            }
        }
    };
    variants.bound.insert(entity, Bound { source, mode, key });
    if node.image.id() != handle.id() {
        node.image = handle;
        dirt.nodes.push(entity);
    }
}
