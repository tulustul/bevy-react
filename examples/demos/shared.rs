//! Pieces shared across the three demos: the active-demo state machine that
//! React drives, the shared 3D camera/light, and the bouncing-ball physics the
//! Events and Request/Response demos both reuse.

use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;
use bevy_react::{ReactAppExt, react_message};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Which demo's scene is live. Only one runs at a time so cubes and balls never
/// share the screen; each demo plugin gates its systems on this state and tags
/// its entities with `DespawnOnExit(Demo::…)` so they vanish on switch.
#[derive(States, Default, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Demo {
    #[default]
    BasicUi,
    Events,
    RequestResponse,
    Animations,
    Anchored,
}

/// The wire form of [`Demo`] — what React sends with `emit("selectDemo", id)`.
/// A fieldless enum serializes as a plain string, so the generated TS is a
/// `"BasicUi" | "Events" | "RequestResponse"` union.
#[derive(Deserialize, TS)]
pub enum DemoId {
    BasicUi,
    Events,
    RequestResponse,
    Animations,
    Anchored,
}

/// React picks the active demo from the left-nav: `emit("selectDemo", id)`.
#[react_message(name = "selectDemo")]
pub struct SelectDemo(DemoId);

/// Register the global demo-selection handler (shared by the live app and the
/// `--export-bindings` exporter).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(apply_select_demo);
}

/// Switch the active demo when React emits a selection.
fn apply_select_demo(on: On<SelectDemo>, mut next: ResMut<NextState<Demo>>) {
    next.set(match on.event().0 {
        DemoId::BasicUi => Demo::BasicUi,
        DemoId::Events => Demo::Events,
        DemoId::RequestResponse => Demo::RequestResponse,
        DemoId::Animations => Demo::Animations,
        DemoId::Anchored => Demo::Anchored,
    });
}

/// The single 3D camera (`IsDefaultUiCamera` so `bevy_ui` targets it) plus a
/// directional light. Shared by every demo; spawned once at startup.
pub fn setup_camera_and_light(mut commands: Commands) {
    commands.spawn((
        Camera3d::default(),
        Transform::from_xyz(0.0, ORBIT_HEIGHT, ORBIT_RADIUS).looking_at(Vec3::ZERO, Vec3::Y),
        IsDefaultUiCamera,
    ));

    commands.spawn((
        DirectionalLight {
            illuminance: 6_000.0,
            shadow_maps_enabled: true,
            ..default()
        },
        Transform::from_xyz(4.0, 8.0, 6.0).looking_at(Vec3::ZERO, Vec3::Y),
    ));
}

/// Camera orbit parameters: a slow turntable around the origin.
const ORBIT_SPEED: f32 = 0.3; // radians/sec
const ORBIT_RADIUS: f32 = 14.0;
const ORBIT_HEIGHT: f32 = 4.0;

/// Slowly orbit the camera around the scene, always looking at the origin, so the
/// translucent cube reads as a 3D volume. Runs in every demo.
pub fn orbit_camera(time: Res<Time>, mut cam: Query<&mut Transform, With<Camera3d>>) {
    let a = time.elapsed_secs() * ORBIT_SPEED;
    for mut transform in &mut cam {
        transform.translation =
            Vec3::new(a.sin() * ORBIT_RADIUS, ORBIT_HEIGHT, a.cos() * ORBIT_RADIUS);
        transform.look_at(Vec3::ZERO, Vec3::Y);
    }
}

// --- Bouncing ball (Events + Request/Response demos) ---

/// Half-extent of the cubic play area, in world units. The ball bounces inside a
/// cube of side `2 * PLAY_HALF` centered on the origin, in all three dimensions,
/// so it can hit any of the six faces.
pub const PLAY_HALF: f32 = 3.0;
/// Ball radius, used both for the mesh and to keep it inside the walls.
pub const BALL_RADIUS: f32 = 0.5;

/// A ball's velocity in world units per second (3D — it bounces off every face).
#[derive(Component)]
pub struct Velocity(pub Vec3);

/// Which wall a ball just bounced off. Lives here (not in the Events demo) so the
/// shared [`step_ball`] integrator can report it; the Events demo forwards it to
/// React as part of `ball.bounced`.
#[derive(Serialize, TS, Clone, Copy, Debug)]
pub enum Wall {
    Left,
    Right,
    Top,
    Bottom,
    Front,
    Back,
}

/// Spawn a ball moving diagonally inside a translucent cube that shows the walls
/// it bounces off. Both are scoped to `scope` so they despawn when that demo is
/// left. Returns the ball entity so the caller can add markers.
pub fn spawn_ball(
    commands: &mut Commands,
    meshes: &mut Assets<Mesh>,
    materials: &mut Assets<StandardMaterial>,
    scope: Demo,
) -> Entity {
    // The translucent enclosure: a glass cube around the play area. All faces are
    // drawn (no culling) so the box reads as a 3D volume from any angle.
    let side = 2.0 * PLAY_HALF;
    commands.spawn((
        Mesh3d(meshes.add(Cuboid::new(side, side, side))),
        MeshMaterial3d(materials.add(StandardMaterial {
            base_color: Color::srgba(0.48, 0.64, 0.97, 0.12),
            alpha_mode: AlphaMode::Blend,
            cull_mode: None,
            double_sided: true,
            ..default()
        })),
        Transform::from_xyz(0.0, 0.0, 0.0),
        DespawnOnExit(scope),
    ));

    commands
        .spawn((
            Mesh3d(meshes.add(Sphere::new(BALL_RADIUS))),
            MeshMaterial3d(materials.add(StandardMaterial {
                base_color: Color::srgb(0.97, 0.79, 0.36),
                ..default()
            })),
            Transform::from_xyz(0.0, 0.0, 0.0),
            Velocity(Vec3::new(3.7, 2.9, 4.3)),
            DespawnOnExit(scope),
        ))
        .id()
}

/// Advance a ball by `dt`, reflecting it off the walls. Returns the wall it hit
/// this frame, if any (so a demo can react to the bounce).
pub fn step_ball(transform: &mut Transform, velocity: &mut Velocity, dt: f32) -> Option<Wall> {
    transform.translation += velocity.0 * dt;

    let max = PLAY_HALF - BALL_RADIUS;
    let mut wall = None;

    if transform.translation.x > max {
        transform.translation.x = max;
        velocity.0.x = -velocity.0.x.abs();
        wall = Some(Wall::Right);
    } else if transform.translation.x < -max {
        transform.translation.x = -max;
        velocity.0.x = velocity.0.x.abs();
        wall = Some(Wall::Left);
    }

    if transform.translation.y > max {
        transform.translation.y = max;
        velocity.0.y = -velocity.0.y.abs();
        wall = Some(Wall::Top);
    } else if transform.translation.y < -max {
        transform.translation.y = -max;
        velocity.0.y = velocity.0.y.abs();
        wall = Some(Wall::Bottom);
    }

    if transform.translation.z > max {
        transform.translation.z = max;
        velocity.0.z = -velocity.0.z.abs();
        wall = Some(Wall::Front);
    } else if transform.translation.z < -max {
        transform.translation.z = -max;
        velocity.0.z = velocity.0.z.abs();
        wall = Some(Wall::Back);
    }

    wall
}
