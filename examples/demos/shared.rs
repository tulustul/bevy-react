//! Pieces shared across the demos: the active-demo state machine that React
//! drives, the shared 3D camera/light, and the bouncing-ball physics the Bevy
//! Events and Polling demos both reuse.

use bevy::input::mouse::{AccumulatedMouseMotion, AccumulatedMouseScroll};
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
    BevyEvents,
    Polling,
    Animations,
    WorldAnchors,
    /// Pure-UI demo (a draggable node showcasing pointer events); no 3D scene.
    Interactions,
    /// Pure-UI demo (a `<canvas>` line chart drawn with vector commands); no 3D scene.
    Canvas,
    /// Pure-UI demo (a wheel-scrollable list); no 3D scene.
    Scroll,
}

/// The wire form of [`Demo`] — what React sends with `emit("selectDemo", id)`.
/// A fieldless enum serializes as a plain string, so the generated TS is a
/// `"BasicUi" | "BevyEvents" | "Polling"` union.
#[derive(Deserialize, TS)]
pub enum DemoId {
    BasicUi,
    BevyEvents,
    Polling,
    Animations,
    WorldAnchors,
    Interactions,
    Canvas,
    Scroll,
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
        DemoId::BevyEvents => Demo::BevyEvents,
        DemoId::Polling => Demo::Polling,
        DemoId::Animations => Demo::Animations,
        DemoId::WorldAnchors => Demo::WorldAnchors,
        DemoId::Interactions => Demo::Interactions,
        DemoId::Canvas => Demo::Canvas,
        DemoId::Scroll => Demo::Scroll,
    });
}

/// The single 3D camera (`IsDefaultUiCamera` so `bevy_ui` targets it) plus a
/// directional light. Shared by every demo; spawned once at startup.
pub fn setup_camera_and_light(mut commands: Commands) {
    commands.spawn((
        Camera3d::default(),
        Transform::from_xyz(0.0, 4.0, DEFAULT_RADIUS).looking_at(Vec3::ZERO, Vec3::Y),
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

/// Camera orbit parameters: a slow turntable around the origin that the user can
/// grab with the mouse.
const ORBIT_SPEED: f32 = 0.3; // radians/sec of automatic orbit
const MOUSE_SENS: f32 = 0.005; // mouse drag → radians
const ZOOM_SENS: f32 = 1.5; // scroll notch → world units of distance
const MIN_RADIUS: f32 = 6.0;
const MAX_RADIUS: f32 = 40.0;
/// Default orbit distance — close enough for the small demos; the World Anchors
/// demo reframes wider (see [`reframe_camera`]).
const DEFAULT_RADIUS: f32 = 14.0;

/// Orbit angles + distance for the shared camera. Driven automatically and by the
/// mouse; one rig is shared by every demo.
#[derive(Resource)]
pub struct CameraRig {
    yaw: f32,
    pitch: f32,
    radius: f32,
}

impl Default for CameraRig {
    fn default() -> Self {
        Self {
            yaw: 0.6,
            pitch: 0.3,
            radius: DEFAULT_RADIUS,
        }
    }
}

/// The shared camera controller, run in every demo: the camera orbits the origin
/// automatically, the user can grab the orbit with left-drag (auto-orbit resumes
/// from the current angle on release), and the mouse wheel zooms within
/// `[MIN_RADIUS, MAX_RADIUS]`. Always looks at the origin so the scene reads as a
/// 3D volume from any angle.
pub fn orbit_camera(
    time: Res<Time>,
    motion: Res<AccumulatedMouseMotion>,
    scroll: Res<AccumulatedMouseScroll>,
    buttons: Res<ButtonInput<MouseButton>>,
    capture: Res<bevy_react::PointerCapture>,
    mut rig: ResMut<CameraRig>,
    mut cam: Query<&mut Transform, With<Camera3d>>,
) {
    // When the React UI owns the pointer (a drag, or hovering/pressing UI), don't
    // let the same mouse input drive the camera too.
    let captured = capture.is_captured();

    if buttons.pressed(MouseButton::Left) && !captured {
        rig.yaw += motion.delta.x * MOUSE_SENS;
        rig.pitch = (rig.pitch + motion.delta.y * MOUSE_SENS).clamp(-1.4, 1.4);
    } else {
        // Auto-orbit resumes from wherever the user left it.
        rig.yaw += ORBIT_SPEED * time.delta_secs();
    }

    if scroll.delta.y != 0.0 && !captured {
        rig.radius = (rig.radius - scroll.delta.y * ZOOM_SENS).clamp(MIN_RADIUS, MAX_RADIUS);
    }

    let pos = Vec3::new(
        rig.radius * rig.yaw.cos() * rig.pitch.cos(),
        rig.radius * rig.pitch.sin(),
        rig.radius * rig.yaw.sin() * rig.pitch.cos(),
    );
    for mut transform in &mut cam {
        transform.translation = pos;
        transform.look_at(Vec3::ZERO, Vec3::Y);
    }
}

/// Reset the orbit distance to suit the active demo whenever it changes (and on
/// startup): the World Anchors demo's cube field needs a wider frame than the small
/// origin-centered scenes. The user can zoom from there.
pub fn reframe_camera(state: Res<State<Demo>>, mut rig: ResMut<CameraRig>) {
    rig.radius = match state.get() {
        Demo::WorldAnchors => 24.0,
        _ => DEFAULT_RADIUS,
    };
}

// --- Bouncing ball (Bevy Events + Polling demos) ---

/// Half-extent of the cubic play area, in world units. The ball bounces inside a
/// cube of side `2 * PLAY_HALF` centered on the origin, in all three dimensions,
/// so it can hit any of the six faces.
pub const PLAY_HALF: f32 = 3.0;
/// Ball radius, used both for the mesh and to keep it inside the walls.
pub const BALL_RADIUS: f32 = 0.5;

/// A ball's velocity in world units per second (3D — it bounces off every face).
#[derive(Component)]
pub struct Velocity(pub Vec3);

/// Which wall a ball just bounced off. Lives here (not in the Bevy Events demo) so
/// the shared [`step_ball`] integrator can report it; the Bevy Events demo forwards it to
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
