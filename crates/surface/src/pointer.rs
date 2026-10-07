//! In-world interaction: a mesh tagged [`SurfacePointer`] is clickable.
//! [`drive_surface_pointer`] ray-casts the main camera through the cursor,
//! reads the hit **UV**, and drives a single virtual [`PointerId::Custom`]
//! pointer parked on the surface's image render target. Bevy's UI picking
//! backend then hit-tests the offscreen subtree, and — because
//! [`init_surface_pointer`] registers the pointer with the core's
//! [`VirtualPointers`] — the core turns its `Pointer<…>` events into the
//! common UI events (`onClick`/`onPointer*`, hover/press styling) and its
//! hover into the OS cursor.

use bevy::camera::{ImageRenderTarget, NormalizedRenderTarget, RenderTarget as BevyRenderTarget};
use bevy::mesh::{Indices, VertexAttributeValues};
use bevy::picking::mesh_picking::ray_cast::{MeshRayCast, MeshRayCastSettings, RayMeshHit};
use bevy::picking::pointer::{Location, PointerAction, PointerId, PointerInput};
use bevy::prelude::*;
use bevy_react_core::PointerCapture;
use bevy_react_core::ext::{VirtualButtons, VirtualPointers};

use crate::registry::Surfaces;

/// Which of a mesh's UV sets a surface texture is mapped to. Re-exported from
/// `bevy_mesh` so apps pass the same value to the material's `*_channel` fields and
/// to [`SurfacePointer`].
pub use bevy::mesh::UvChannel;

/// The fixed id of the single virtual pointer that drives in-world surface
/// clicks. Stable so tests can recognize surface-originated picking events.
const SURFACE_POINTER_UUID: bevy::asset::uuid::Uuid =
    bevy::asset::uuid::Uuid::from_u128(0xB5_2E_5F_AC_E0_00_00_00_00_00_00_00_00_00_01);

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

/// Holds the id of the single virtual pointer driving in-world surface clicks,
/// plus the small bit of frame-to-frame state the driver needs. (The core
/// recognizes the pointer through [`VirtualPointers`], where
/// [`init_surface_pointer`] registers it.)
#[derive(Resource)]
pub struct SurfaceVirtualPointer {
    /// The custom pointer id. Picking events carrying this id originated from a
    /// surface mesh hit.
    pub id: PointerId,
    /// Last UV-derived position (logical px) we drove the pointer to.
    last_pos: Vec2,
    /// The image render target the pointer currently sits on (the surface under the
    /// cursor) and its scale factor, so we can move it off-bounds to generate
    /// `Out`/release when the cursor leaves every surface mesh.
    over_target: Option<(Handle<Image>, f32)>,
    /// Press bookkeeping (owed releases).
    buttons: VirtualButtons,
}

/// Spawn the virtual surface pointer at startup and register it with the
/// core's [`VirtualPointers`].
pub fn init_surface_pointer(mut commands: Commands, mut pointers: ResMut<VirtualPointers>) {
    let id = PointerId::Custom(SURFACE_POINTER_UUID);
    // The core turns its picking events into the common UI events.
    pointers.register(id);
    // `PointerId` requires `PointerLocation`/`PointerPress`/`PointerInteraction`,
    // which are added automatically.
    commands.spawn(id);
    commands.insert_resource(SurfaceVirtualPointer {
        id,
        last_pos: Vec2::ZERO,
        over_target: None,
        buttons: VirtualButtons::default(),
    });
}

/// Ray-cast the main camera through the cursor at the [`SurfacePointer`] meshes and
/// drive the virtual pointer to the hit UV (mapped into the surface's texture
/// pixels), so Bevy's UI picking backend hit-tests the offscreen subtree. Emits
/// `PointerInput` move/press/release events for the [`SurfaceVirtualPointer`].
/// Interactive screen UI under the cursor ([`PointerCapture::over_ui`]) covers
/// the surfaces behind it, except during a press already held on one.
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
    capture: Option<Res<PointerCapture>>,
    mut ray_cast: MeshRayCast,
    mut input: MessageWriter<PointerInput>,
) {
    let pointer_id = state.id;

    // Screen-space UI draws over the world: a cursor on an interactive
    // on-screen control is not on the surface behind it — unless a press on
    // a surface is already held, which keeps its target (a drag crossing a
    // button). Last frame's capture: this runs before `PointerCaptureSet`.
    let covered = capture.is_some_and(|c| c.over_ui) && !state.buttons.any_pressed();

    // Nearest `SurfacePointer` mesh under the cursor (cloned out of the cast borrow).
    let hit = cursor_ray(&windows, &cameras)
        .filter(|_| !covered)
        .and_then(|ray| {
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
        && let Some((size, scale)) = surfaces
            .entries
            .get(&pointer.surface)
            .map(|e| (e.size, e.scale_factor))
        && let Some(uv) = hit_uv(&pointer.uv_channel, &hit, entity, &mesh3ds, &meshes)
    {
        // UV (0,0)=top-left of the texture, matching the UI's pixel origin.
        // Picking reads pointer positions in logical px (it multiplies by the
        // target's scale factor), so texture px divide by it.
        let position = uv * size.as_vec2() / scale;
        let location = image_location(&handle, scale, position);
        let delta = position - state.last_pos;
        // A zero-delta move carries no information (picking drops it before any
        // `Pointer<Move>`/`Drag` dispatch) — unless the target image changed,
        // where the move is what retargets `PointerLocation` to the new surface.
        if delta != Vec2::ZERO || state.over_target.as_ref().map(|(h, _)| h) != Some(&handle) {
            input.write(PointerInput::new(
                pointer_id,
                location.clone(),
                PointerAction::Move { delta },
            ));
        }
        state.last_pos = position;
        state.over_target = Some((handle, scale));

        state
            .buttons
            .forward(pointer_id, &location, &buttons, &mut input);
        return;
    }

    // No surface under the cursor: move the pointer off-bounds so picking fires an
    // `Out`, and release every press we still owe so a control never sticks.
    if let Some((handle, scale)) = state.over_target.clone() {
        let location = image_location(&handle, scale, Vec2::splat(-1.0));
        state.buttons.leave(pointer_id, location, &mut input);
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

/// A pointer [`Location`] on a surface's image render target at `position`
/// logical px. The target must equal the surface camera's (scale factor
/// included) for picking to match the pointer to it.
fn image_location(handle: &Handle<Image>, scale_factor: f32, position: Vec2) -> Location {
    Location {
        target: NormalizedRenderTarget::Image(ImageRenderTarget {
            handle: handle.clone(),
            scale_factor,
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
