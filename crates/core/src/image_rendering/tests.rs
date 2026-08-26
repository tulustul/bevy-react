//! Headless tests for the `imageRendering` binder: synthetic `Image` assets,
//! the real systems, observed through the entity's `ImageNode` handle and the
//! variant assets themselves.

use super::*;
use bevy::asset::{AssetPlugin, RenderAssetUsages};
use bevy::image::ImageFilterMode;
use bevy::render::render_resource::{Extent3d, TextureDimension, TextureFormat, TextureUsages};
use bevy::ui::widget::ImageNode;

fn test_app() -> App {
    let mut app = App::new();
    app.add_plugins((MinimalPlugins, AssetPlugin::default()));
    app.init_asset::<Image>();
    register(&mut app);
    app
}

/// A 4×4 opaque sRGB image with a distinct top-left texel.
fn source_image() -> Image {
    let mut data = vec![255u8; 4 * 4 * 4];
    data[0..4].copy_from_slice(&[255, 0, 0, 255]);
    Image::new(
        Extent3d {
            width: 4,
            height: 4,
            depth_or_array_layers: 1,
        },
        TextureDimension::D2,
        data,
        TextureFormat::Rgba8UnormSrgb,
        RenderAssetUsages::default(),
    )
}

fn add_source(app: &mut App, image: Image) -> Handle<Image> {
    app.world_mut().resource_mut::<Assets<Image>>().add(image)
}

fn spawn(app: &mut App, mode: Option<ImageRendering>, src: &Handle<Image>) -> Entity {
    let mut e = app.world_mut().spawn(ImageNode::new(src.clone()));
    if let Some(mode) = mode {
        e.insert(ImageRenderingMode(mode));
    }
    e.id()
}

fn handle_of(app: &App, e: Entity) -> Handle<Image> {
    app.world()
        .entity(e)
        .get::<ImageNode>()
        .unwrap()
        .image
        .clone()
}

fn asset<'a>(app: &'a App, h: &Handle<Image>) -> &'a Image {
    app.world()
        .resource::<Assets<Image>>()
        .get(h)
        .expect("asset exists")
}

fn sampler(img: &Image) -> ImageSamplerDescriptor {
    match &img.sampler {
        ImageSampler::Descriptor(d) => d.clone(),
        ImageSampler::Default => panic!("expected an explicit sampler"),
    }
}

fn mips(app: &App, e: Entity) -> u32 {
    asset(app, &handle_of(app, e))
        .texture_descriptor
        .mip_level_count
}

/// Run frames until `done` holds (the pyramid lands asynchronously).
fn settle(app: &mut App, done: impl Fn(&App) -> bool) {
    for _ in 0..200 {
        app.update();
        if done(app) {
            return;
        }
        std::thread::sleep(std::time::Duration::from_millis(2));
    }
    panic!("did not settle");
}

fn variant_count(app: &App) -> usize {
    app.world().resource::<ImageVariants>().variant_count()
}

fn dirty_nodes(app: &App) -> Vec<Entity> {
    app.world().resource::<LayerContentDirt>().nodes.clone()
}

/// Two nodes on one file with different modes each get their own variant
/// asset; a third `auto` node and the source itself are untouched. A
/// `trilinear` node stays on the source until its pyramid lands.
#[test]
fn two_modes_on_one_source_get_their_own_variants() {
    let mut app = test_app();
    let src = add_source(&mut app, source_image());
    let tri = spawn(&mut app, Some(ImageRendering::Trilinear), &src);
    let near = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    let auto = spawn(&mut app, None, &src);
    app.update();
    assert_eq!(
        handle_of(&app, tri),
        src,
        "no interim upload: the source shows until the pyramid lands"
    );
    settle(&mut app, |app| handle_of(app, tri) != src);

    let (h_tri, h_near) = (handle_of(&app, tri), handle_of(&app, near));
    assert_ne!(h_near, src, "nearest repoints to a variant");
    assert_ne!(h_tri, h_near, "different modes, different variants");
    assert_eq!(handle_of(&app, auto), src, "auto keeps the source");
    assert_eq!(variant_count(&app), 2);

    let source = asset(&app, &src);
    assert_eq!(
        source.texture_descriptor.mip_level_count, 1,
        "source never mutated"
    );
    assert!(matches!(source.sampler, ImageSampler::Default));

    let t = asset(&app, &h_tri);
    assert_eq!(t.texture_descriptor.mip_level_count, 3, "4×4 → 3 levels");
    assert_eq!(t.data.as_ref().unwrap().len(), 64 + 16 + 4);
    assert_eq!(
        &t.data.as_ref().unwrap()[0..4],
        &[255, 0, 0, 255],
        "level 0 is the source"
    );
    let s = sampler(t);
    assert_eq!(
        (s.mag_filter, s.min_filter, s.mipmap_filter),
        (
            ImageFilterMode::Linear,
            ImageFilterMode::Linear,
            ImageFilterMode::Linear
        )
    );

    let n = asset(&app, &h_near);
    assert_eq!(n.texture_descriptor.mip_level_count, 1);
    let s = sampler(n);
    assert_eq!(
        (s.mag_filter, s.min_filter),
        (ImageFilterMode::Nearest, ImageFilterMode::Nearest)
    );
    assert_eq!(s.lod_max_clamp, 0.0, "nearest is level 0 only");
}

/// The same `(source, mode)` pair is one shared variant, however many nodes
/// ask for it; a re-render that re-inserts the source handle re-binds to it
/// without a second copy.
#[test]
fn same_pair_shares_one_variant() {
    let mut app = test_app();
    let src = add_source(&mut app, source_image());
    let a = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    let b = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    app.update();
    assert_eq!(handle_of(&app, a), handle_of(&app, b));
    assert_eq!(variant_count(&app), 1);

    // A rebuild (hover swap / prop delta) writes the source handle back.
    app.world_mut()
        .entity_mut(a)
        .insert(ImageNode::new(src.clone()));
    app.update();
    assert_eq!(handle_of(&app, a), handle_of(&app, b));
    assert_eq!(variant_count(&app), 1);
    app.update();
    assert_eq!(variant_count(&app), 1, "the repoint echo is a no-op");
}

/// `bilinear` on a plain (un-mipped, default-sampled) source is already what
/// the source renders as — no copy is made.
#[test]
fn bilinear_on_a_plain_source_needs_no_copy() {
    let mut app = test_app();
    let src = add_source(&mut app, source_image());
    let e = spawn(&mut app, Some(ImageRendering::Bilinear), &src);
    app.update();
    assert_eq!(handle_of(&app, e), src);
    assert_eq!(variant_count(&app), 0);

    // …but on a pre-mipped source it needs the lod clamp, so it does copy.
    let mut mipped = source_image();
    pyramid::build_pyramid(&mut mipped).unwrap();
    let src2 = add_source(&mut app, mipped);
    let e2 = spawn(&mut app, Some(ImageRendering::Bilinear), &src2);
    app.update();
    let h2 = handle_of(&app, e2);
    assert_ne!(h2, src2);
    assert_eq!(sampler(asset(&app, &h2)).lod_max_clamp, 0.0);
    // A trilinear node on the pre-mipped source is satisfied by it as-is.
    let e3 = spawn(&mut app, Some(ImageRendering::Trilinear), &src2);
    app.update();
    assert_eq!(handle_of(&app, e3), src2);
    assert_eq!(variant_count(&app), 1);
}

/// "Satisfies" reads the host's real default sampler: under a nearest
/// default (`ImagePlugin::default_nearest`) `bilinear` must copy and
/// `nearest` must not.
#[test]
fn satisfies_uses_the_hosts_default_sampler() {
    let mut app = test_app();
    app.world_mut()
        .resource_mut::<ImageVariants>()
        .default_sampler = ImageSamplerDescriptor::nearest();
    let src = add_source(&mut app, source_image());
    let bi = spawn(&mut app, Some(ImageRendering::Bilinear), &src);
    let near = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    app.update();
    assert_ne!(handle_of(&app, bi), src, "bilinear needs a linear copy");
    assert_eq!(handle_of(&app, near), src, "nearest is the default here");
    assert_eq!(variant_count(&app), 1);
}

/// Removing the mode (`styleUnset` / `auto`) points the node back at the
/// source; the variant goes with its last user, and a mode change swaps it.
#[test]
fn removing_or_changing_the_mode_rebinds_and_drops_the_orphan() {
    let mut app = test_app();
    let src = add_source(&mut app, source_image());
    let e = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    app.update();
    assert_ne!(handle_of(&app, e), src);

    app.world_mut()
        .entity_mut(e)
        .insert(ImageRenderingMode(ImageRendering::Trilinear));
    app.update();
    assert_eq!(variant_count(&app), 1, "the nearest variant was dropped");
    settle(&mut app, |app| handle_of(app, e) != src);
    let h = handle_of(&app, e);
    assert_eq!(sampler(asset(&app, &h)).mag_filter, ImageFilterMode::Linear);
    assert_eq!(mips(&app, e), 3);

    app.world_mut().entity_mut(e).remove::<ImageRenderingMode>();
    app.update();
    assert_eq!(handle_of(&app, e), src, "back on the source");
    assert_eq!(variant_count(&app), 0);
}

/// A commit that swaps the `src` AND unsets the mode keeps the new source:
/// the release restore only fires while the node is still on the variant.
#[test]
fn same_frame_src_swap_with_mode_unset_keeps_the_new_source() {
    let mut app = test_app();
    let a = add_source(&mut app, source_image());
    let b = add_source(&mut app, source_image());
    let e = spawn(&mut app, Some(ImageRendering::Nearest), &a);
    app.update();
    assert_ne!(handle_of(&app, e), a);

    app.world_mut()
        .entity_mut(e)
        .insert(ImageNode::new(b.clone()))
        .remove::<ImageRenderingMode>();
    app.update();
    assert_eq!(handle_of(&app, e), b, "the new source, not the old one");
    assert_eq!(variant_count(&app), 0);
}

/// Despawning users releases the variant only with the last one.
#[test]
fn variant_is_dropped_with_its_last_user() {
    let mut app = test_app();
    let src = add_source(&mut app, source_image());
    let a = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    let b = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    app.update();
    assert_eq!(variant_count(&app), 1);
    app.world_mut().entity_mut(a).despawn();
    app.update();
    assert_eq!(variant_count(&app), 1);
    app.world_mut().entity_mut(b).despawn();
    app.update();
    assert_eq!(variant_count(&app), 0);
}

/// A source that hasn't loaded yet binds as soon as it does, and swapping
/// a bound node to a not-yet-loaded source releases its old variant
/// immediately (a slow or failed load never pins the previous one).
#[test]
fn binds_once_the_source_loads_and_releases_while_waiting() {
    let mut app = test_app();
    let a = add_source(&mut app, source_image());
    let e = spawn(&mut app, Some(ImageRendering::Nearest), &a);
    app.update();
    assert_eq!(variant_count(&app), 1);

    let late = app
        .world_mut()
        .resource_mut::<Assets<Image>>()
        .reserve_handle();
    app.world_mut()
        .entity_mut(e)
        .insert(ImageNode::new(late.clone()));
    app.update();
    app.update();
    assert_eq!(handle_of(&app, e), late, "nothing to derive yet");
    assert_eq!(variant_count(&app), 0, "the old variant was released");

    app.world_mut()
        .resource_mut::<Assets<Image>>()
        .insert(late.id(), source_image())
        .unwrap();
    app.update();
    assert_ne!(handle_of(&app, e), late, "bound once loaded");
    assert_eq!(variant_count(&app), 1);
}

/// Reloading the source (hot reload → `Modified`) rebuilds its variants in
/// place: same variant handle, new pixels, pyramid regenerated — and a source
/// modified every frame still gets its pyramid (builds are never cancelled,
/// the newest source is re-derived when the in-flight one lands).
#[test]
fn source_reload_rebuilds_the_variant_in_place() {
    let mut app = test_app();
    let src = add_source(&mut app, source_image());
    let e = spawn(&mut app, Some(ImageRendering::Trilinear), &src);
    settle(&mut app, |app| handle_of(app, e) != src);
    let h = handle_of(&app, e);

    let paint = |app: &mut App, px: [u8; 4]| {
        app.world_mut()
            .resource_mut::<Assets<Image>>()
            .get_mut(&src)
            .unwrap()
            .data
            .as_mut()
            .unwrap()[0..4]
            .copy_from_slice(&px);
    };
    for i in 0..30u8 {
        paint(&mut app, [i, 0, 0, 255]);
        app.update();
    }
    paint(&mut app, [0, 0, 255, 255]);
    settle(&mut app, |app| {
        let v = asset(app, &h);
        v.data.as_ref().unwrap()[0..4] == [0, 0, 255, 255]
            && v.texture_descriptor.mip_level_count > 1
    });
    assert_eq!(
        handle_of(&app, e),
        h,
        "the node keeps the same variant handle"
    );
    assert_eq!(variant_count(&app), 1);
}

/// Every handle write the binder makes is layer content dirt.
#[test]
fn handle_writes_push_layer_dirt() {
    let mut app = test_app();
    let src = add_source(&mut app, source_image());
    let e = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    app.update();
    assert!(
        dirty_nodes(&app).contains(&e),
        "the repoint dirties the node"
    );
    app.world_mut()
        .resource_mut::<LayerContentDirt>()
        .nodes
        .clear();
    app.update();
    assert!(
        dirty_nodes(&app).is_empty(),
        "the echo frame writes nothing"
    );

    app.world_mut().entity_mut(e).remove::<ImageRenderingMode>();
    app.update();
    assert!(
        dirty_nodes(&app).contains(&e),
        "the restore dirties the node"
    );
}

fn live_target() -> Image {
    let mut img = source_image();
    img.texture_descriptor.usage |= TextureUsages::RENDER_ATTACHMENT;
    img
}

fn take_warnings() -> Vec<crate::diag::RuntimeWarning> {
    crate::diag::take_runtime_warnings()
        .into_iter()
        .filter(|w| w.kind == WARN_KIND)
        .collect()
}

/// A live texture (render target, registry-bound element) is never copied
/// or written: every explicit mode is refused with ONE warning, the node
/// keeps its source untouched, and a tint-only rewrite doesn't re-warn. A
/// placeholder handle binds nothing.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn live_textures_refuse_every_mode_once() {
    let _lock = crate::diag::test_lock();
    crate::diag::arm_runtime();
    let _ = crate::diag::take_runtime_warnings();

    let mut app = test_app();
    let src = add_source(&mut app, live_target());
    let near = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    app.update();
    assert_eq!(handle_of(&app, near), src, "no variant for a live target");
    assert_eq!(variant_count(&app), 0);
    assert!(
        matches!(asset(&app, &src).sampler, ImageSampler::Default),
        "never written in place (a Modified would re-upload over the target)"
    );
    let warnings = take_warnings();
    assert_eq!(warnings.len(), 1);
    assert_eq!(warnings[0].value, "nearest");

    // A per-frame tint write is `Changed<ImageNode>` too — no re-plan.
    for _ in 0..3 {
        app.world_mut()
            .entity_mut(near)
            .get_mut::<ImageNode>()
            .unwrap()
            .color = Color::srgb(0.5, 0.5, 0.5);
        app.update();
    }
    assert!(take_warnings().is_empty(), "a tint write must not re-warn");

    // A plain image reached through a registry binding is live by element.
    let plain = add_source(&mut app, source_image());
    let bg = app
        .world_mut()
        .spawn((
            ImageNode::new(plain.clone()),
            RBackgroundTexture("tex".into()),
            ImageRenderingMode(ImageRendering::Trilinear),
        ))
        .id();
    app.update();
    assert_eq!(handle_of(&app, bg), plain);
    assert_eq!(variant_count(&app), 0);
    let warnings = take_warnings();
    assert_eq!(warnings.len(), 1);
    assert_eq!(warnings[0].value, "trilinear");

    // The transparent placeholder (unbound `{ texture }`) binds nothing.
    let ph = app
        .world_mut()
        .spawn((
            ImageNode::new(TRANSPARENT_IMAGE_HANDLE),
            ImageRenderingMode(ImageRendering::Nearest),
        ))
        .id();
    app.update();
    assert_eq!(handle_of(&app, ph), TRANSPARENT_IMAGE_HANDLE);
    assert_eq!(variant_count(&app), 0);
    assert!(take_warnings().is_empty());
}

/// A source without CPU pixels (RENDER_WORLD-only usage) can't be copied:
/// refused with a warning, the node keeps the source.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn data_less_sources_are_refused() {
    let _lock = crate::diag::test_lock();
    crate::diag::arm_runtime();
    let _ = crate::diag::take_runtime_warnings();

    let mut app = test_app();
    let mut img = source_image();
    img.data = None;
    let src = add_source(&mut app, img);
    let e = spawn(&mut app, Some(ImageRendering::Nearest), &src);
    app.update();
    assert_eq!(handle_of(&app, e), src);
    assert_eq!(variant_count(&app), 0);
    let warnings = take_warnings();
    assert_eq!(warnings.len(), 1);
    assert_eq!(warnings[0].value, "nearest");
}
