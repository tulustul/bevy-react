//! The `portal` host element: a UI rectangle that displays an **offscreen render
//! target** — the live (or snapshot) output of a Bevy camera drawing into a GPU
//! texture.
//!
//! It is the GPU sibling of `bevy-react-canvas`: both are a styled [`ImageNode`]
//! whose backing [`Image`] this crate manages. Where the canvas CPU-rasterizes a
//! display list, a portal's image is a **render target** a secondary camera draws
//! into (render-to-texture), so a portal can embed a minimap, a picture-in-picture,
//! or a per-item 3D preview directly inside the React UI.
//!
//! ## Ownership split
//!
//! This crate owns only the **texture registry** ([`RenderTargets`]) and the
//! portal↔texture **binding**. The consuming app owns the cameras, meshes, and
//! render layers: it [`create`](RenderTargets::create)s a named target, spawns a
//! camera pointed at [`RenderTarget::camera_target`], tags that camera with
//! [`PortalCamera`], and (for snapshots) [`invalidate`](RenderTargets::invalidate)s
//! or [`set_mode`](RenderTargets::set_mode)s it. React never invents target names —
//! it receives them from the app over the typed event channel and echoes them back
//! as `<portal target={name} />`.
//!
//! ## Render model
//!
//! Each target is [`RenderMode::Live`] (its camera renders every frame — minimaps,
//! rotating previews) or [`RenderMode::Snapshot`] (renders once when registered or
//! invalidated, then its camera is deactivated and the texture reused — cheap for
//! static thumbnails). [`drive_render_targets`] toggles `Camera::is_active`.
//!
//! ## Resolution
//!
//! Each target's [`Resolution`] is [`Auto`](Resolution::Auto) (the texture is sized
//! to the binding portal's laid-out box, like the canvas — crisp output and correct
//! camera aspect for free) or [`Fixed`](Resolution::Fixed) (a fixed cost, for a
//! target shared by several portals).

use bevy::image::Image;
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::camera::{ImageRenderTarget, RenderTarget as BevyRenderTarget};
use bevy::render::render_resource::{Extent3d, TextureFormat};
use bevy::ui::ComputedNode;
use bevy::ui::widget::ImageNode;

/// Largest render-target dimension we allocate, in physical pixels — a guard
/// against a degenerate layout asking for an enormous texture.
const MAX_DIM: u32 = 2048;

/// Quantization step for [`Resolution::Auto`] sizing, in physical pixels. The
/// texture is sized to the next multiple of this, so small sub-pixel layout
/// jitter during a resize doesn't reallocate the GPU texture every frame.
const SIZE_STEP: u32 = 16;

/// How often a target's camera renders into its texture.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RenderMode {
    /// The camera renders every frame (minimaps, rotating/animated previews).
    Live,
    /// The camera renders once when the target is registered or
    /// [`invalidate`](RenderTargets::invalidate)d, then deactivates and the
    /// texture is reused (static thumbnails — cheap for many slots).
    Snapshot,
}

/// How a target's texture resolution is chosen.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Resolution {
    /// Track the binding portal's laid-out physical size (crisp + correct aspect).
    /// Assumes one portal per target; with several, the last to bind wins.
    Auto,
    /// A fixed texture size, regardless of how the portal is laid out.
    Fixed(UVec2),
}

/// Parameters for [`RenderTargets::create`].
#[derive(Clone, Copy, Debug)]
pub struct RenderTargetSpec {
    /// Resolution policy (default [`Resolution::Auto`]).
    pub size: Resolution,
    /// Render model (default [`RenderMode::Live`]).
    pub mode: RenderMode,
    /// Texture format. Default [`TextureFormat::Rgba8UnormSrgb`] — display-ready
    /// for a UI thumbnail. Use an HDR format (e.g. `Rgba16Float`) if the camera
    /// needs bloom/HDR before tonemapping.
    pub format: TextureFormat,
}

impl Default for RenderTargetSpec {
    fn default() -> Self {
        Self {
            size: Resolution::Auto,
            mode: RenderMode::Live,
            format: TextureFormat::Rgba8UnormSrgb,
        }
    }
}

/// A handle to a freshly [`create`](RenderTargets::create)d target. Use
/// [`camera_target`](Self::camera_target) to point a camera at it.
#[derive(Clone, Debug)]
pub struct RenderTarget {
    /// The backing render-target image (also stored in the registry).
    pub handle: Handle<Image>,
}

impl RenderTarget {
    /// The [`bevy::render::camera::RenderTarget`] to set on a camera's `target`
    /// so it renders into this texture.
    pub fn camera_target(&self) -> BevyRenderTarget {
        BevyRenderTarget::Image(ImageRenderTarget {
            handle: self.handle.clone(),
            scale_factor: 1.0,
        })
    }
}

/// One registered render target.
struct Entry {
    handle: Handle<Image>,
    mode: RenderMode,
    resolution: Resolution,
    /// The portal node currently displaying this target (for [`Resolution::Auto`]).
    binder: Option<Entity>,
    /// Set when the texture should (re)render: on create, on resize, on
    /// [`invalidate`](RenderTargets::invalidate), or on a `Live → Snapshot` switch.
    dirty: bool,
    /// Last physical size we sized an [`Resolution::Auto`] texture to.
    last_size: UVec2,
}

/// The registry of named offscreen render targets. Insert it (the plugin does)
/// and have app systems [`create`](Self::create) targets as game state demands.
#[derive(Resource, Default)]
pub struct RenderTargets {
    entries: HashMap<String, Entry>,
}

impl RenderTargets {
    /// Allocate a render-target texture and register it under `name`, returning a
    /// [`RenderTarget`] whose [`camera_target`](RenderTarget::camera_target) a
    /// camera should point at. Re-creating an existing name replaces it.
    pub fn create(
        &mut self,
        images: &mut Assets<Image>,
        name: impl Into<String>,
        spec: RenderTargetSpec,
    ) -> RenderTarget {
        // An Auto target starts tiny; `drive_render_targets` resizes it to the
        // portal once laid out. A Fixed target is allocated at its final size.
        let size = match spec.size {
            Resolution::Fixed(s) => s.max(UVec2::ONE).min(UVec2::splat(MAX_DIM)),
            Resolution::Auto => UVec2::splat(SIZE_STEP),
        };
        let image = Image::new_target_texture(size.x, size.y, spec.format, None);
        let handle = images.add(image);
        self.entries.insert(
            name.into(),
            Entry {
                handle: handle.clone(),
                mode: spec.mode,
                resolution: spec.size,
                binder: None,
                dirty: true,
                last_size: size,
            },
        );
        RenderTarget { handle }
    }

    /// The backing texture handle for `name`, if registered.
    pub fn get(&self, name: &str) -> Option<Handle<Image>> {
        self.entries.get(name).map(|e| e.handle.clone())
    }

    /// Mark a target for one more render (a [`RenderMode::Snapshot`] re-captures;
    /// a [`RenderMode::Live`] target is unaffected — it renders every frame anyway).
    pub fn invalidate(&mut self, name: &str) {
        if let Some(e) = self.entries.get_mut(name) {
            e.dirty = true;
        }
    }

    /// Switch a target's render model at runtime. `Snapshot → Live` reactivates
    /// the camera; `Live → Snapshot` renders one last frame, then freezes.
    pub fn set_mode(&mut self, name: &str, mode: RenderMode) {
        if let Some(e) = self.entries.get_mut(name) {
            if e.mode != mode {
                e.dirty = true; // render once at the moment of the switch
            }
            e.mode = mode;
        }
    }

    /// Drop a target. The app is responsible for despawning the camera/scene it
    /// spawned for it; portals bound to the name revert to a blank placeholder.
    pub fn remove(&mut self, name: &str) {
        self.entries.remove(name);
    }
}

/// Marks a camera as the renderer for a named target, so [`drive_render_targets`]
/// can control its activity for [`RenderMode::Snapshot`]. The app inserts it on
/// the camera it spawns for a target.
#[derive(Component, Clone, Debug)]
pub struct PortalCamera(pub String);

/// Marks a reconciler node as a `<portal>` displaying the named target. The
/// bevy-react reconciler inserts it; [`bind_portals`] keeps the node's
/// [`ImageNode`] pointed at the registry's texture for this name.
#[derive(Component, Clone, Debug)]
pub struct RPortal(pub String);

/// A shared 1×1 transparent texture a portal shows until (and after) it is bound
/// to a live target. Held in a resource so every unbound portal shares one image.
#[derive(Resource)]
pub struct PortalPlaceholder(pub Handle<Image>);

/// A 1×1 transparent image, mirroring `bevy_react_canvas::blank_canvas_image`.
pub fn blank_portal_image() -> Image {
    Image::new_fill(
        Extent3d {
            width: 1,
            height: 1,
            depth_or_array_layers: 1,
        },
        bevy::render::render_resource::TextureDimension::D2,
        &[0, 0, 0, 0],
        TextureFormat::Rgba8UnormSrgb,
        bevy::asset::RenderAssetUsages::MAIN_WORLD | bevy::asset::RenderAssetUsages::RENDER_WORLD,
    )
}

/// Create the shared [`PortalPlaceholder`] image at startup.
pub fn init_portal_placeholder(mut commands: Commands, mut images: ResMut<Assets<Image>>) {
    let handle = images.add(blank_portal_image());
    commands.insert_resource(PortalPlaceholder(handle));
}

/// Point every `<portal>`'s [`ImageNode`] at the texture for its target name (or
/// the placeholder when the name isn't registered), and record the portal as the
/// target's binder for [`Resolution::Auto`] sizing. Only writes `image` when it
/// actually changes, so it doesn't needlessly re-extract the node every frame.
///
/// This is what decouples ordering: a portal may mount before its target exists
/// and rebinds the instant it appears (and reverts to the placeholder on
/// [`remove`](RenderTargets::remove)).
pub fn bind_portals(
    mut targets: ResMut<RenderTargets>,
    placeholder: Res<PortalPlaceholder>,
    mut portals: Query<(Entity, &RPortal, &mut ImageNode)>,
) {
    for (entity, portal, mut node) in &mut portals {
        let desired = targets
            .entries
            .get(&portal.0)
            .map(|e| e.handle.clone())
            .unwrap_or_else(|| placeholder.0.clone());
        if node.image != desired {
            node.image = desired;
        }
        if let Some(entry) = targets.entries.get_mut(&portal.0) {
            entry.binder = Some(entity);
        }
    }
}

/// Drive resolution and the snapshot lifecycle each frame:
/// - For [`Resolution::Auto`] targets, size the texture to the binding portal's
///   laid-out physical size (quantized to [`SIZE_STEP`]) and mark dirty on change.
/// - For each [`PortalCamera`], set `is_active`: always on for [`RenderMode::Live`];
///   on for one frame for a dirty [`RenderMode::Snapshot`], then off.
pub fn drive_render_targets(
    mut targets: ResMut<RenderTargets>,
    mut images: ResMut<Assets<Image>>,
    nodes: Query<&ComputedNode>,
    mut cameras: Query<(&PortalCamera, &mut Camera)>,
) {
    // 1. Resolution: resize Auto textures to their binding portal.
    for entry in targets.entries.values_mut() {
        if entry.resolution != Resolution::Auto {
            continue;
        }
        let Some(binder) = entry.binder else { continue };
        let Ok(node) = nodes.get(binder) else { continue };
        let want = quantize_size(node.size());
        if want.x == 0 || want.y == 0 || want == entry.last_size {
            continue;
        }
        if let Some(mut image) = images.get_mut(&entry.handle) {
            image.resize(Extent3d {
                width: want.x,
                height: want.y,
                depth_or_array_layers: 1,
            });
            entry.last_size = want;
            entry.dirty = true;
        }
    }

    // 2. Snapshot lifecycle: toggle each portal camera's activity.
    for (cam, mut camera) in &mut cameras {
        let Some(entry) = targets.entries.get_mut(&cam.0) else {
            continue;
        };
        match entry.mode {
            RenderMode::Live => {
                if !camera.is_active {
                    camera.is_active = true;
                }
            }
            RenderMode::Snapshot => {
                // Active for exactly the frame we clear `dirty`, so the camera
                // renders once; off until the next invalidate/resize.
                let active = entry.dirty;
                if camera.is_active != active {
                    camera.is_active = active;
                }
                entry.dirty = false;
            }
        }
    }
}

/// Round a laid-out physical size up to the next [`SIZE_STEP`] multiple, clamped
/// to `[SIZE_STEP, MAX_DIM]` on each axis.
fn quantize_size(size: Vec2) -> UVec2 {
    let q = |v: f32| {
        let px = v.round().max(0.0) as u32;
        let stepped = px.div_ceil(SIZE_STEP) * SIZE_STEP;
        stepped.clamp(SIZE_STEP, MAX_DIM)
    };
    UVec2::new(q(size.x), q(size.y))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_app() -> App {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_resource::<RenderTargets>();
        app
    }

    /// `create` registers a target and `get` returns its handle; `remove` drops it.
    #[test]
    fn create_get_remove() {
        let mut app = test_app();
        let handle = app.world_mut().resource_scope(
            |world, mut targets: Mut<RenderTargets>| {
                let mut images = world.resource_mut::<Assets<Image>>();
                targets
                    .create(&mut images, "follow", RenderTargetSpec::default())
                    .handle
            },
        );
        let targets = app.world().resource::<RenderTargets>();
        assert_eq!(targets.get("follow"), Some(handle));
        assert_eq!(targets.get("nope"), None);

        app.world_mut().resource_mut::<RenderTargets>().remove("follow");
        assert_eq!(app.world().resource::<RenderTargets>().get("follow"), None);
    }

    /// `set_mode` flips the mode and marks dirty only when it actually changes;
    /// `invalidate` always marks dirty.
    #[test]
    fn set_mode_and_invalidate_mark_dirty() {
        let mut app = test_app();
        app.world_mut()
            .resource_scope(|world, mut targets: Mut<RenderTargets>| {
                let mut images = world.resource_mut::<Assets<Image>>();
                targets.create(
                    &mut images,
                    "follow",
                    RenderTargetSpec {
                        mode: RenderMode::Live,
                        ..default()
                    },
                );
            });

        let mut targets = app.world_mut().resource_mut::<RenderTargets>();
        // A fresh target is dirty; clear it by pretending a render happened.
        targets.entries.get_mut("follow").unwrap().dirty = false;
        targets.set_mode("follow", RenderMode::Live); // no change → still clean
        assert!(!targets.entries["follow"].dirty);
        targets.set_mode("follow", RenderMode::Snapshot); // change → dirty
        assert!(targets.entries["follow"].dirty);
        assert_eq!(targets.entries["follow"].mode, RenderMode::Snapshot);

        targets.entries.get_mut("follow").unwrap().dirty = false;
        targets.invalidate("follow");
        assert!(targets.entries["follow"].dirty);
    }

    /// `bind_portals` points an `RPortal`'s `ImageNode` at the registered texture,
    /// records the binder, and reverts to the placeholder after the target is gone.
    #[test]
    fn bind_portals_binds_and_reverts() {
        let mut app = test_app();
        app.add_systems(Startup, init_portal_placeholder);
        app.add_systems(Update, bind_portals);
        app.update(); // run startup → placeholder exists

        let target_handle = app.world_mut().resource_scope(
            |world, mut targets: Mut<RenderTargets>| {
                let mut images = world.resource_mut::<Assets<Image>>();
                targets
                    .create(&mut images, "follow", RenderTargetSpec::default())
                    .handle
            },
        );
        let placeholder = app.world().resource::<PortalPlaceholder>().0.clone();
        let portal = app
            .world_mut()
            .spawn((RPortal("follow".into()), ImageNode::new(placeholder.clone())))
            .id();

        app.update(); // bind_portals runs
        assert_eq!(
            app.world().entity(portal).get::<ImageNode>().unwrap().image,
            target_handle,
            "portal binds to the registered target texture"
        );
        assert_eq!(
            app.world().resource::<RenderTargets>().entries["follow"].binder,
            Some(portal),
            "the portal is recorded as the target's binder"
        );

        app.world_mut().resource_mut::<RenderTargets>().remove("follow");
        app.update();
        assert_eq!(
            app.world().entity(portal).get::<ImageNode>().unwrap().image,
            placeholder,
            "a removed target reverts the portal to the placeholder"
        );
    }

    /// `drive_render_targets` renders a snapshot camera for exactly one frame after
    /// it is created/invalidated, and keeps a live camera always active.
    #[test]
    fn snapshot_camera_renders_once_then_deactivates() {
        let mut app = test_app();
        app.add_systems(Update, drive_render_targets);
        app.world_mut()
            .resource_scope(|world, mut targets: Mut<RenderTargets>| {
                let mut images = world.resource_mut::<Assets<Image>>();
                targets.create(
                    &mut images,
                    "shot",
                    RenderTargetSpec {
                        mode: RenderMode::Snapshot,
                        ..default()
                    },
                );
            });
        let cam = app
            .world_mut()
            .spawn((PortalCamera("shot".into()), Camera::default()))
            .id();

        // Frame 1: the fresh (dirty) target activates its camera for one render.
        app.update();
        assert!(
            app.world().entity(cam).get::<Camera>().unwrap().is_active,
            "a dirty snapshot renders this frame"
        );
        // Frame 2: no longer dirty → camera deactivates.
        app.update();
        assert!(
            !app.world().entity(cam).get::<Camera>().unwrap().is_active,
            "a clean snapshot stops rendering"
        );

        // Invalidate → renders one more frame.
        app.world_mut()
            .resource_mut::<RenderTargets>()
            .invalidate("shot");
        app.update();
        assert!(
            app.world().entity(cam).get::<Camera>().unwrap().is_active,
            "invalidate re-renders the snapshot once"
        );
    }

    #[test]
    fn quantize_rounds_up_to_step_and_clamps() {
        assert_eq!(quantize_size(Vec2::new(1.0, 1.0)), UVec2::splat(SIZE_STEP));
        assert_eq!(quantize_size(Vec2::new(17.0, 31.0)), UVec2::new(32, 32));
        assert_eq!(quantize_size(Vec2::new(0.0, 0.0)), UVec2::splat(SIZE_STEP));
        assert_eq!(
            quantize_size(Vec2::new(99999.0, 10.0)),
            UVec2::new(MAX_DIM, SIZE_STEP)
        );
    }
}
