#![cfg_attr(docsrs, feature(doc_auto_cfg))]
//! The `surface` host element: the **inverse** of `bevy-react-portal`. Where a
//! portal draws an offscreen Bevy camera *into* the React UI, a surface renders a
//! React UI subtree *out* into an offscreen [`Image`] the app can drape over any
//! 3D mesh/material (a diegetic monitor, a control panel, a curved hologram — with
//! the app's own shader on top).
//!
//! ## Ownership split
//!
//! The consuming app owns the **surface registry** ([`Surfaces`]): it
//! [`create`](Surfaces::create)s a named surface at a fixed pixel resolution and
//! gets back a [`Handle<Image>`] to use as a material texture. React references the
//! same name with `<surface name={…}>…</surface>`; the bevy-react reconciler spawns
//! that subtree as a **detached UI root** carrying [`RSurface`], and
//! [`bind_surfaces`] spawns a dedicated 2D UI camera that draws the subtree into the
//! registered image (via [`UiTargetCamera`]). An unregistered name renders nowhere
//! until the app registers it.
//!
//! ## Render model
//!
//! Each surface is [`RenderMode::Live`] (the UI camera renders every frame — the
//! default, correct for animated/interactive UI) or [`RenderMode::Snapshot`]
//! (renders once on register/[`invalidate`](Surfaces::invalidate), then freezes —
//! cheap for static panels). [`drive_surfaces`] toggles `Camera::is_active`.
//!
//! ## Interaction
//!
//! A surface is **clickable in-world**: tag the mesh that displays the texture with
//! [`SurfacePointer`] (the mesh needs UVs). [`drive_surface_pointer`] ray-casts the
//! main camera through the cursor, reads the hit **UV**, and drives a single virtual
//! [`PointerId::Custom`] pointer parked on the surface's image render target. Bevy's
//! UI picking backend then hit-tests the offscreen subtree and fires the usual
//! `Pointer<…>` events on the React nodes — which bevy-react's core turns back into
//! `onClick`/`onPointer*` calls. The virtual pointer's id is published in
//! [`SurfaceVirtualPointer`] so the core crate can scope its event collection to it.

use bevy::camera::{ImageRenderTarget, NormalizedRenderTarget, RenderTarget as BevyRenderTarget};
use bevy::mesh::{Indices, VertexAttributeValues};
use bevy::picking::mesh_picking::ray_cast::{MeshRayCast, MeshRayCastSettings, RayMeshHit};
use bevy::picking::pointer::{Location, PointerAction, PointerButton, PointerId, PointerInput};
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::render::render_resource::TextureFormat;

/// Which of a mesh's UV sets a surface texture is mapped to. Re-exported from
/// `bevy_mesh` so apps pass the same value to the material's `*_channel` fields and
/// to [`SurfacePointer`].
pub use bevy::mesh::UvChannel;

/// Largest surface dimension we allocate, in pixels — a guard against a typo
/// asking for an enormous texture.
const MAX_DIM: u32 = 4096;

/// The fixed id of the single virtual pointer that drives in-world surface clicks.
/// Stable so the core crate (and tests) can recognize surface-originated picking
/// events without sharing state.
const SURFACE_POINTER_UUID: uuid::Uuid =
    uuid::Uuid::from_u128(0xB5_2E_5F_AC_E0_00_00_00_00_00_00_00_00_00_01);

/// How often a surface's UI camera renders into its texture.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RenderMode {
    /// The camera renders every frame (animated or interactive UI — the default).
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
struct Entry {
    handle: Handle<Image>,
    size: UVec2,
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
    entries: HashMap<String, Entry>,
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

    /// Drop a surface. Its UI camera is despawned on the next [`bind_surfaces`];
    /// React `<surface>` roots bound to the name hide until it is re-registered.
    pub fn remove(&mut self, name: &str) {
        self.entries.remove(name);
    }
}

/// Marks a reconciler node as a `<surface name=…>` detached UI root. The
/// bevy-react reconciler inserts it (and keeps the node out of the on-screen
/// layout); [`bind_surfaces`] points its [`UiTargetCamera`] at the surface's
/// offscreen UI camera.
#[derive(Component, Clone, Debug)]
pub struct RSurface(pub String);

/// Marks the offscreen 2D UI camera [`bind_surfaces`] spawns for a named surface,
/// so [`drive_surfaces`] can control its activity for [`RenderMode::Snapshot`].
#[derive(Component, Clone, Debug)]
pub struct SurfaceCamera(pub String);

/// App-facing marker: put this on the 3D entity (mesh) that displays a surface's
/// texture, naming the surface it shows. [`drive_surface_pointer`] ray-casts these
/// meshes so clicking them drives the surface's React UI. The mesh must have UVs.
///
/// [`uv_channel`](Self::uv_channel) selects which of the mesh's UV sets the surface
/// texture is mapped to — picking reads the in-world hit's UV from the **same**
/// channel so clicks land on the right pixel. Set it to match the `*_channel` you
/// bound the surface texture to on the material (e.g. a dedicated [`UvChannel::Uv1`]
/// for the UI, leaving [`UvChannel::Uv0`] for the model's own maps). Defaults to
/// [`UvChannel::Uv0`].
#[derive(Component, Clone, Debug)]
pub struct SurfacePointer {
    /// The surface (registry key) whose texture this mesh displays.
    pub surface: String,
    /// Which mesh UV set the surface texture (and picking) uses.
    pub uv_channel: UvChannel,
}

impl SurfacePointer {
    /// Mark a mesh as displaying `surface`, with the UI on [`UvChannel::Uv0`].
    pub fn new(surface: impl Into<String>) -> Self {
        Self {
            surface: surface.into(),
            uv_channel: UvChannel::Uv0,
        }
    }

    /// Map the surface texture (and picking) to a specific UV set.
    pub fn with_uv_channel(mut self, channel: UvChannel) -> Self {
        self.uv_channel = channel;
        self
    }
}

/// Holds the id of the single virtual pointer driving in-world surface clicks, plus
/// the small bit of frame-to-frame state the driver needs. Published so the core
/// crate can recognize (and scope to) surface-originated picking events.
#[derive(Resource)]
pub struct SurfaceVirtualPointer {
    /// The custom pointer id. Picking events carrying this id originated from a
    /// surface mesh hit.
    pub id: PointerId,
    /// Last UV-derived position (texture pixels) we drove the pointer to.
    last_pos: Vec2,
    /// The image render target the pointer currently sits on (the surface under the
    /// cursor), so we can move it off-bounds to generate `Out`/release when the
    /// cursor leaves every surface mesh.
    over_target: Option<Handle<Image>>,
    /// Per-button "we have emitted a press the matching release is still owed
    /// for", indexed by [`button_index`].
    pressed: [bool; FORWARDED_BUTTONS.len()],
}

/// The mouse buttons forwarded to the virtual pointer, with their picking
/// analogues — the same left/middle/right set bevy_picking itself forwards for
/// the window pointer (Back/Forward/Other are ignored there too).
const FORWARDED_BUTTONS: [(MouseButton, PointerButton); 3] = [
    (MouseButton::Left, PointerButton::Primary),
    (MouseButton::Right, PointerButton::Secondary),
    (MouseButton::Middle, PointerButton::Middle),
];

/// Index of a forwarded button in [`SurfaceVirtualPointer::pressed`].
fn button_index(button: PointerButton) -> usize {
    match button {
        PointerButton::Primary => 0,
        PointerButton::Secondary => 1,
        PointerButton::Middle => 2,
    }
}

/// Spawn the virtual surface pointer at startup and publish its id.
pub fn init_surface_pointer(mut commands: Commands) {
    let id = PointerId::Custom(SURFACE_POINTER_UUID);
    // `PointerId` requires `PointerLocation`/`PointerPress`/`PointerInteraction`,
    // which are added automatically.
    commands.spawn(id);
    commands.insert_resource(SurfaceVirtualPointer {
        id,
        last_pos: Vec2::ZERO,
        over_target: None,
        pressed: [false; FORWARDED_BUTTONS.len()],
    });
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
                if *visibility != Visibility::Inherited {
                    *visibility = Visibility::Inherited;
                }
            }
            None => {
                if target_cam.is_some() {
                    commands.entity(entity).remove::<UiTargetCamera>();
                }
                if *visibility != Visibility::Hidden {
                    *visibility = Visibility::Hidden;
                }
            }
        }
    }
}

/// Toggle each surface camera's activity: always on for [`RenderMode::Live`]; on
/// for one frame after a dirty [`RenderMode::Snapshot`], then off. Mirrors the
/// portal crate's `drive_render_targets`. Also despawns the camera of a surface
/// that has been [`remove`](Surfaces::remove)d, so a torn-down surface (e.g. on a
/// scene switch) leaves no orphan camera rendering into a freed texture.
pub fn drive_surfaces(
    mut commands: Commands,
    mut surfaces: ResMut<Surfaces>,
    mut cameras: Query<(Entity, &SurfaceCamera, &mut Camera)>,
) {
    for (entity, cam, mut camera) in &mut cameras {
        let Some(entry) = surfaces.entries.get_mut(&cam.0) else {
            commands.entity(entity).despawn();
            continue;
        };
        // A re-created surface allocates a fresh camera; retire the stale one whose
        // image no longer matches the registry entry.
        if entry.camera != Some(entity) {
            commands.entity(entity).despawn();
            continue;
        }
        match entry.mode {
            RenderMode::Live => {
                if !camera.is_active {
                    camera.is_active = true;
                }
            }
            RenderMode::Snapshot => {
                let active = entry.dirty;
                if camera.is_active != active {
                    camera.is_active = active;
                }
                entry.dirty = false;
            }
        }
    }
}

/// Ray-cast the main camera through the cursor at the [`SurfacePointer`] meshes and
/// drive the virtual pointer to the hit UV (mapped into the surface's texture
/// pixels), so Bevy's UI picking backend hit-tests the offscreen subtree. Emits
/// `PointerInput` move/press/release events for the [`SurfaceVirtualPointer`].
///
/// Scheduled before `bevy_picking`'s input processing so the pointer's new location
/// is consumed the same frame.
#[allow(clippy::too_many_arguments)]
pub fn drive_surface_pointer(
    surfaces: Res<Surfaces>,
    mut state: ResMut<SurfaceVirtualPointer>,
    windows: Query<&Window>,
    cameras: Query<(&Camera, &BevyRenderTarget, &GlobalTransform)>,
    pointer_meshes: Query<&SurfacePointer>,
    mesh3ds: Query<&Mesh3d>,
    meshes: Res<Assets<Mesh>>,
    buttons: Res<ButtonInput<MouseButton>>,
    mut ray_cast: MeshRayCast,
    mut input: MessageWriter<PointerInput>,
) {
    let pointer_id = state.id;

    // Nearest `SurfacePointer` mesh under the cursor (cloned out of the cast borrow).
    let hit = cursor_ray(&windows, &cameras).and_then(|ray| {
        let filter = |entity: Entity| pointer_meshes.contains(entity);
        let settings = MeshRayCastSettings::default().with_filter(&filter);
        ray_cast
            .cast_ray(ray, &settings)
            .first()
            .map(|(entity, hit)| (*entity, hit.clone()))
    });

    if let Some((entity, hit)) = hit
        && let Ok(pointer) = pointer_meshes.get(entity)
        && let Some(handle) = surfaces.get(&pointer.surface)
        && let Some(size) = surfaces.entries.get(&pointer.surface).map(|e| e.size)
        && let Some(uv) = hit_uv(&pointer.uv_channel, &hit, entity, &mesh3ds, &meshes)
    {
        // UV (0,0)=top-left of the texture, matching the UI's pixel origin.
        let position = Vec2::new(uv.x * size.x as f32, uv.y * size.y as f32);
        let location = image_location(&handle, position);
        let delta = position - state.last_pos;
        input.write(PointerInput::new(
            pointer_id,
            location.clone(),
            PointerAction::Move { delta },
        ));
        state.last_pos = position;
        state.over_target = Some(handle);

        for (mb, pb) in FORWARDED_BUTTONS {
            if buttons.just_pressed(mb) {
                input.write(PointerInput::new(
                    pointer_id,
                    location.clone(),
                    PointerAction::Press(pb),
                ));
                state.pressed[button_index(pb)] = true;
            }
            if buttons.just_released(mb) && state.pressed[button_index(pb)] {
                input.write(PointerInput::new(
                    pointer_id,
                    location.clone(),
                    PointerAction::Release(pb),
                ));
                state.pressed[button_index(pb)] = false;
            }
        }
        return;
    }

    // No surface under the cursor: move the pointer off-bounds so picking fires an
    // `Out`, and release every press we still owe so a control never sticks.
    if let Some(handle) = state.over_target.clone() {
        let location = image_location(&handle, Vec2::splat(-1.0));
        for (_, pb) in FORWARDED_BUTTONS {
            if state.pressed[button_index(pb)] {
                input.write(PointerInput::new(
                    pointer_id,
                    location.clone(),
                    PointerAction::Release(pb),
                ));
                state.pressed[button_index(pb)] = false;
            }
        }
        input.write(PointerInput::new(
            pointer_id,
            location,
            PointerAction::Move { delta: Vec2::ZERO },
        ));
        state.over_target = None;
    }
}

/// The surface-texture UV at a ray hit, read from the pointer's chosen UV channel.
/// [`UvChannel::Uv0`] uses Bevy's precomputed [`RayMeshHit::uv`]; [`UvChannel::Uv1`]
/// interpolates the mesh's `ATTRIBUTE_UV_1` at the hit triangle — mirroring Bevy's own
/// `UV0` interpolation (`barycentric_coords` is already `(w,u,v)`; the triangle's three
/// vertices are `indices[3*triangle_index + k]`).
fn hit_uv(
    channel: &UvChannel,
    hit: &RayMeshHit,
    entity: Entity,
    mesh3ds: &Query<&Mesh3d>,
    meshes: &Assets<Mesh>,
) -> Option<Vec2> {
    match channel {
        UvChannel::Uv0 => hit.uv,
        UvChannel::Uv1 => {
            let mesh = meshes.get(&mesh3ds.get(entity).ok()?.0)?;
            let VertexAttributeValues::Float32x2(uvs) = mesh.attribute(Mesh::ATTRIBUTE_UV_1)?
            else {
                return None;
            };
            let base = hit.triangle_index? * 3;
            let vertex = |k: usize| -> Option<usize> {
                Some(match mesh.indices() {
                    Some(Indices::U16(v)) => *v.get(base + k)? as usize,
                    Some(Indices::U32(v)) => *v.get(base + k)? as usize,
                    None => base + k,
                })
            };
            let uv = |k: usize| -> Option<Vec2> { uvs.get(vertex(k)?).map(|&p| Vec2::from(p)) };
            let bc = hit.barycentric_coords;
            Some(bc.x * uv(0)? + bc.y * uv(1)? + bc.z * uv(2)?)
        }
    }
}

/// A pointer [`Location`] on a surface's image render target at `position` pixels.
fn image_location(handle: &Handle<Image>, position: Vec2) -> Location {
    Location {
        target: NormalizedRenderTarget::Image(ImageRenderTarget {
            handle: handle.clone(),
            scale_factor: 1.0,
        }),
        position,
    }
}

/// A world-space ray from the active window camera through the cursor, if any.
fn cursor_ray(
    windows: &Query<&Window>,
    cameras: &Query<(&Camera, &BevyRenderTarget, &GlobalTransform)>,
) -> Option<Ray3d> {
    let cursor = windows.iter().find_map(|w| w.cursor_position())?;
    let (camera, _, transform) = cameras
        .iter()
        .find(|(c, target, _)| c.is_active && matches!(target, BevyRenderTarget::Window(_)))?;
    camera.viewport_to_world(transform, cursor).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_app() -> App {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_resource::<Surfaces>();
        app
    }

    /// `create` registers a surface and `get` returns its handle; `remove` drops it.
    #[test]
    fn create_get_remove() {
        let mut app = test_app();
        let handle = app
            .world_mut()
            .resource_scope(|world, mut surfaces: Mut<Surfaces>| {
                let mut images = world.resource_mut::<Assets<Image>>();
                surfaces.create(&mut images, "monitor", SurfaceSpec::default())
            });
        assert_eq!(
            app.world().resource::<Surfaces>().get("monitor"),
            Some(handle)
        );
        assert_eq!(app.world().resource::<Surfaces>().get("nope"), None);

        app.world_mut().resource_mut::<Surfaces>().remove("monitor");
        assert_eq!(app.world().resource::<Surfaces>().get("monitor"), None);
    }

    /// `set_mode`/`invalidate` mark dirty only when they should.
    #[test]
    fn set_mode_and_invalidate_mark_dirty() {
        let mut app = test_app();
        app.world_mut()
            .resource_scope(|world, mut surfaces: Mut<Surfaces>| {
                let mut images = world.resource_mut::<Assets<Image>>();
                surfaces.create(
                    &mut images,
                    "monitor",
                    SurfaceSpec {
                        mode: RenderMode::Live,
                        ..default()
                    },
                );
            });

        let mut surfaces = app.world_mut().resource_mut::<Surfaces>();
        surfaces.entries.get_mut("monitor").unwrap().dirty = false;
        surfaces.set_mode("monitor", RenderMode::Live); // no change
        assert!(!surfaces.entries["monitor"].dirty);
        surfaces.set_mode("monitor", RenderMode::Snapshot); // change → dirty
        assert!(surfaces.entries["monitor"].dirty);
        surfaces.entries.get_mut("monitor").unwrap().dirty = false;
        surfaces.invalidate("monitor");
        assert!(surfaces.entries["monitor"].dirty);
    }

    /// `bind_surfaces` spawns a camera for a registered surface and binds the root
    /// to it (and shows it); an unregistered root is hidden with no camera.
    #[test]
    fn bind_surfaces_binds_registered_and_hides_unregistered() {
        let mut app = test_app();
        app.add_systems(Update, bind_surfaces);

        // A root for a surface that isn't registered yet.
        let root = app
            .world_mut()
            .spawn((RSurface("monitor".into()), Visibility::Inherited))
            .id();
        app.update();
        assert!(app.world().entity(root).get::<UiTargetCamera>().is_none());
        assert_eq!(
            app.world().entity(root).get::<Visibility>().copied(),
            Some(Visibility::Hidden),
            "an unregistered surface root is hidden"
        );

        // Register it → next bind spawns a camera and binds + shows the root.
        app.world_mut()
            .resource_scope(|world, mut surfaces: Mut<Surfaces>| {
                let mut images = world.resource_mut::<Assets<Image>>();
                surfaces.create(&mut images, "monitor", SurfaceSpec::default());
            });
        app.update();
        let cam = app
            .world()
            .entity(root)
            .get::<UiTargetCamera>()
            .map(|t| t.0)
            .expect("root binds to its surface camera");
        assert!(
            app.world().entity(cam).get::<SurfaceCamera>().is_some(),
            "the bound camera is a surface camera"
        );
        assert_eq!(
            app.world().entity(root).get::<Visibility>().copied(),
            Some(Visibility::Inherited),
            "a bound surface root is shown"
        );
    }
}
