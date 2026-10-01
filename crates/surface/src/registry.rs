//! The surface registry ([`Surfaces`]) and the offscreen UI cameras it
//! drives: [`bind_surfaces`] spawns a camera per registered surface and binds
//! each `<surface>` root to it, [`drive_surfaces`] gates camera activity per
//! render mode, [`retire_surface_cameras`] despawns the cameras of removed
//! surfaces before bevy's shadow-cascade build.

use bevy::camera::visibility::ViewVisibility;
use bevy::camera::{ImageRenderTarget, RenderTarget as BevyRenderTarget};
use bevy::platform::collections::{HashMap, HashSet};
use bevy::prelude::*;
use bevy::render::render_resource::TextureFormat;

use crate::element::RSurface;
use crate::pointer::SurfacePointer;

/// Largest surface dimension we allocate, in pixels — a guard against a typo
/// asking for an enormous texture.
const MAX_DIM: u32 = 4096;

/// How often a surface's UI camera renders into its texture.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RenderMode {
    /// The camera renders every frame a [`SurfacePointer`] mesh displaying the
    /// surface is visible (animated or interactive UI — the default); with no
    /// tagged mesh it renders every frame. See [`drive_surfaces`].
    Live,
    /// The camera renders once when the surface is registered or
    /// [`invalidate`](Surfaces::invalidate)d, then freezes (static panels).
    Snapshot,
}

/// Parameters for [`Surfaces::create`].
#[derive(Clone, Copy, Debug)]
pub struct SurfaceSpec {
    /// The texture resolution in pixels. The UI subtree lays out in this space.
    pub size: UVec2,
    /// The color the UI camera clears the texture to before drawing the subtree.
    /// Opaque (`Color::BLACK`) by default — a screen; use a translucent/`NONE`
    /// color for a decal that should show the surface behind transparent UI.
    pub clear_color: Color,
    /// Render model (default [`RenderMode::Live`]).
    pub mode: RenderMode,
}

impl Default for SurfaceSpec {
    fn default() -> Self {
        Self {
            size: UVec2::new(512, 512),
            clear_color: Color::BLACK,
            mode: RenderMode::Live,
        }
    }
}

/// One registered surface.
pub(crate) struct Entry {
    handle: Handle<Image>,
    pub(crate) size: UVec2,
    clear_color: Color,
    mode: RenderMode,
    /// The UI camera drawing this surface, spawned lazily by [`bind_surfaces`].
    camera: Option<Entity>,
    /// Set when the texture should (re)render: on create, on
    /// [`invalidate`](Surfaces::invalidate), or on a `Live → Snapshot` switch.
    dirty: bool,
}

/// The registry of named UI surfaces. Insert it (the plugin does) and have app
/// systems [`create`](Self::create) surfaces, then use the returned handle as a
/// material texture.
#[derive(Resource, Default)]
pub struct Surfaces {
    pub(crate) entries: HashMap<String, Entry>,
}

impl Surfaces {
    /// Allocate an offscreen texture and register it under `name`, returning the
    /// [`Handle<Image>`] to use as a material texture. React's `<surface
    /// name={name}>` renders its subtree into it. Re-creating an existing name
    /// replaces the texture (the old camera is dropped on the next bind).
    pub fn create(
        &mut self,
        images: &mut Assets<Image>,
        name: impl Into<String>,
        spec: SurfaceSpec,
    ) -> Handle<Image> {
        let size = spec.size.max(UVec2::ONE).min(UVec2::splat(MAX_DIM));
        let image = Image::new_target_texture(size.x, size.y, TextureFormat::Rgba8UnormSrgb, None);
        let handle = images.add(image);
        self.entries.insert(
            name.into(),
            Entry {
                handle: handle.clone(),
                size,
                clear_color: spec.clear_color,
                mode: spec.mode,
                camera: None,
                dirty: true,
            },
        );
        handle
    }

    /// The backing texture handle for `name`, if registered.
    pub fn get(&self, name: &str) -> Option<Handle<Image>> {
        self.entries.get(name).map(|e| e.handle.clone())
    }

    /// Mark a surface for one more render (a [`RenderMode::Snapshot`] re-captures;
    /// a [`RenderMode::Live`] surface renders every frame anyway).
    pub fn invalidate(&mut self, name: &str) {
        if let Some(e) = self.entries.get_mut(name) {
            e.dirty = true;
        }
    }

    /// Switch a surface's render model at runtime.
    pub fn set_mode(&mut self, name: &str, mode: RenderMode) {
        if let Some(e) = self.entries.get_mut(name) {
            if e.mode != mode {
                e.dirty = true;
            }
            e.mode = mode;
        }
    }

    /// Drop a surface. Its UI camera is despawned by [`retire_surface_cameras`]
    /// (before this frame's shadow-cascade build, if called before `PostUpdate`;
    /// else next frame's); React `<surface>` roots bound to the name hide until it
    /// is re-registered.
    pub fn remove(&mut self, name: &str) {
        self.entries.remove(name);
    }
}

/// Marks the offscreen 2D UI camera [`bind_surfaces`] spawns for a named surface,
/// so [`drive_surfaces`] can control its activity for [`RenderMode::Snapshot`].
#[derive(Component, Clone, Debug)]
pub struct SurfaceCamera(pub String);

/// Schedule the surface camera gates from THIS frame's visibility (the
/// plugin calls this; public for a harness that runs the ordering alone).
/// `retire_surface_cameras` despawns cameras BEFORE `CheckVisibility` and
/// bevy's directional shadow cascade build (`UpdateDirectionalLightCascades`,
/// which keys its map by every active camera): a camera despawned after the
/// build leaves a stale key, and `extract_lights` (bevy 0.19.0) `break`s on
/// the first key it cannot map — silently dropping every view after it, a
/// `prepare_lights` panic for an unrelated camera. `drive_surfaces` (the
/// activity gate) is the exception: a surface camera is a 2D UI view with
/// nothing to cull, and its gate reads the `ViewVisibility` of the meshes that
/// display it — so it runs after culling + newly-hidden marking; it never
/// despawns.
pub fn add_surface_camera_systems(app: &mut App) {
    use bevy::camera::visibility::VisibilitySystems;
    app.add_systems(
        PostUpdate,
        (
            retire_surface_cameras
                .before(VisibilitySystems::CheckVisibility)
                .before(bevy::light::SimulationLightSystems::UpdateDirectionalLightCascades),
            drive_surfaces
                .after(bevy::ui::UiSystems::PostLayout)
                .after(VisibilitySystems::VisibilityPropagate)
                .after(VisibilitySystems::MarkNewlyHiddenEntitiesInvisible),
        ),
    );
}

/// Spawn a UI camera for each registered surface, then bind every `<surface>` root
/// to its camera (and hide roots whose name isn't registered, so they never spill
/// onto the main screen). Runs after the reconciler op drain so a freshly-mounted
/// surface binds the same frame.
pub fn bind_surfaces(
    mut commands: Commands,
    mut surfaces: ResMut<Surfaces>,
    mut roots: Query<(Entity, &RSurface, Option<&UiTargetCamera>, &mut Visibility)>,
) {
    // 1. Ensure each registered surface has a UI camera rendering into its image.
    for (name, entry) in surfaces.entries.iter_mut() {
        if entry.camera.is_some() {
            continue;
        }
        let camera = commands
            .spawn((
                Camera2d,
                Camera {
                    clear_color: ClearColorConfig::Custom(entry.clear_color),
                    // Render the surface into its texture before the main camera
                    // (order 0) samples it, so the screen is never a frame stale.
                    order: -1,
                    ..default()
                },
                BevyRenderTarget::Image(ImageRenderTarget {
                    handle: entry.handle.clone(),
                    scale_factor: 1.0,
                }),
                SurfaceCamera(name.clone()),
            ))
            .id();
        entry.camera = Some(camera);
        entry.dirty = true;
    }

    // 2. Bind each root to its surface camera; hide unregistered ones.
    for (entity, surface, target_cam, mut visibility) in &mut roots {
        match surfaces.entries.get(&surface.0).and_then(|e| e.camera) {
            Some(camera) => {
                if target_cam.map(|t| t.0) != Some(camera) {
                    commands.entity(entity).insert(UiTargetCamera(camera));
                }
                visibility.set_if_neq(Visibility::Inherited);
            }
            None => {
                if target_cam.is_some() {
                    commands.entity(entity).remove::<UiTargetCamera>();
                }
                visibility.set_if_neq(Visibility::Hidden);
            }
        }
    }
}

/// Despawn the camera of every surface that has been [`remove`](Surfaces::remove)d
/// (or re-created — a fresh camera replaced it in the registry), so a torn-down
/// surface (e.g. on a scene switch) leaves no orphan camera rendering into a freed
/// texture.
///
/// Scheduled in `PostUpdate` **before** `bevy_light`'s shadow-cascade build (and
/// view culling): the build keys every light's `Cascades` map by every active
/// camera with a `Projection` — this 2D camera included — and a key whose entity
/// is gone by extraction makes bevy 0.19.0's `extract_lights` drop the cascades of
/// every view after it (`prepare_lights` then panics on an unrelated 3D camera).
/// Despawning here means the build never sees the camera at all. Split out of
/// [`drive_surfaces`], which must run *after* culling and so cannot despawn.
pub fn retire_surface_cameras(
    mut commands: Commands,
    surfaces: Res<Surfaces>,
    cameras: Query<(Entity, &SurfaceCamera)>,
) {
    for (entity, cam) in &cameras {
        let current = surfaces.entries.get(&cam.0).and_then(|e| e.camera);
        if current != Some(entity) {
            commands.entity(entity).despawn();
        }
    }
}

/// Set each surface camera's `is_active` for this frame's render:
/// - [`RenderMode::Live`]: on while some [`SurfacePointer`] mesh naming the surface
///   is [`ViewVisibility`]-visible in any view this frame (the tagged meshes are the
///   only consumers the crate can see — a material sampling the texture is opaque
///   to it). A surface with **no** tagged mesh is assumed displayed and renders
///   every frame, so untagged/decal consumers never go dark; tag every mesh that
///   displays a surface to get the idle saving.
/// - [`RenderMode::Snapshot`]: on for one frame after it is dirtied, then off.
///
/// Scheduled in `PostUpdate` after bevy's visibility culling (`ViewVisibility` is
/// this frame's) and before extraction reads `is_active`, so a screen that scrolls
/// back into a frustum renders the same frame. Mirrors the portal module's
/// `drive_target_cameras`, which (unlike this 2D UI camera) must run before
/// culling and the shadow cascade build. Runs after the cascade build, so it
/// never despawns — retiring stale cameras is [`retire_surface_cameras`]'s job
/// (a camera it retired this frame is already gone from the query).
pub fn drive_surfaces(
    mut surfaces: ResMut<Surfaces>,
    displays: Query<(&SurfacePointer, Option<&ViewVisibility>)>,
    mut cameras: Query<(Entity, &SurfaceCamera, &mut Camera)>,
) {
    // Surfaces with a tagged display mesh, and those with one visible this frame.
    // A tagged entity without `ViewVisibility` (not a renderable) counts as visible.
    let mut tagged: HashSet<&str> = HashSet::default();
    let mut seen: HashSet<&str> = HashSet::default();
    for (pointer, visibility) in &displays {
        tagged.insert(pointer.surface.as_str());
        if visibility.is_none_or(|v| v.get()) {
            seen.insert(pointer.surface.as_str());
        }
    }

    for (entity, cam, mut camera) in &mut cameras {
        // A camera whose registry entry is gone or replaced is being retired.
        let Some(entry) = surfaces
            .entries
            .get_mut(&cam.0)
            .filter(|e| e.camera == Some(entity))
        else {
            continue;
        };
        let name = cam.0.as_str();
        let active = match entry.mode {
            RenderMode::Live => !tagged.contains(name) || seen.contains(name),
            RenderMode::Snapshot => {
                let dirty = entry.dirty;
                entry.dirty = false;
                dirty
            }
        };
        if camera.is_active != active {
            camera.is_active = active;
        }
    }
}

#[cfg(test)]
mod tests;
