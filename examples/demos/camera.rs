//! The single 3D camera shared by every demo: an auto-orbiting turntable the user
//! can grab with the mouse and zoom with the wheel, plus a directional light. All
//! of it is bundled into [`CameraPlugin`].

use bevy::input::mouse::{AccumulatedMouseMotion, AccumulatedMouseScroll};
use bevy::post_process::bloom::Bloom;
use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;

use crate::scene::Scene;

/// Owns the shared camera: spawns it (+ light) at startup and runs the orbit/zoom
/// controller and the per-scene reframe.
pub struct CameraPlugin;

impl Plugin for CameraPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<CameraRig>()
            .add_systems(Startup, setup_camera_and_light)
            // One shared camera controller (auto-orbit + mouse-drag + wheel-zoom) for
            // every scene; reframe the orbit distance to suit each scene as it
            // becomes active.
            .add_systems(
                Update,
                (
                    // After the React UI refreshes `PointerCapture` so the camera sees
                    // this frame's state and ignores the mouse while the UI owns it.
                    orbit_camera.after(bevy_react::PointerCaptureSet),
                    reframe_camera.run_if(state_changed::<Scene>),
                ),
            );
    }
}

/// The single 3D camera (`IsDefaultUiCamera` so `bevy_ui` targets it) plus a
/// directional light. Shared by every demo; spawned once at startup.
fn setup_camera_and_light(mut commands: Commands) {
    commands.spawn((
        Camera3d::default(),
        // Bloom glows bright/emissive pixels. It `#[require(Hdr)]`s, so adding it
        // also flips the camera into HDR rendering (the prerequisite for bloom);
        // tonemapping still writes the final LDR image to the target.
        Bloom::NATURAL,
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
const MIN_RADIUS: f32 = 4.0;
const MAX_RADIUS: f32 = 40.0;
/// Default orbit distance — close enough for the small scenes; the cube-field
/// scene reframes wider (see [`reframe_camera`]).
const DEFAULT_RADIUS: f32 = 14.0;

/// Orbit angles + distance for the shared camera. Driven automatically and by the
/// mouse; one rig is shared by every demo.
#[derive(Resource)]
struct CameraRig {
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
#[allow(clippy::too_many_arguments)]
fn orbit_camera(
    time: Res<Time>,
    motion: Res<AccumulatedMouseMotion>,
    scroll: Res<AccumulatedMouseScroll>,
    buttons: Res<ButtonInput<MouseButton>>,
    capture: Res<bevy_react::PointerCapture>,
    state: Res<State<Scene>>,
    mut rig: ResMut<CameraRig>,
    // Exclude the offscreen portal cameras (the follow/minimap render-target cams)
    // so only the shared main camera orbits.
    mut cam: Query<&mut Transform, (With<Camera3d>, Without<bevy_react::PortalCamera>)>,
) {
    // When the React UI owns the pointer (a drag, or hovering/pressing UI), don't
    // let the same mouse input drive the camera too.
    let captured = capture.is_captured();

    if buttons.pressed(MouseButton::Left) && !captured {
        rig.yaw += motion.delta.x * MOUSE_SENS;
        rig.pitch = (rig.pitch + motion.delta.y * MOUSE_SENS).clamp(-1.4, 1.4);
    } else if *state.get() != Scene::Surface {
        // Auto-orbit resumes from wherever the user left it — except the `<surface>`
        // monitor scene, which holds still unless the user drags (auto-orbit off,
        // mouse rotation kept), so the in-world screen stays readable.
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
    // Most scenes pivot on the world origin. The monitor sits at the origin too, but
    // we aim a little above it so the (centered) screen clears the demo panel and
    // shows in the viewport's lower area; mouse-rotation still orbits the monitor.
    let target = if *state.get() == Scene::Surface {
        Vec3::new(0.0, 0.85, 0.0)
    } else {
        Vec3::ZERO
    };
    for mut transform in &mut cam {
        transform.translation = target + pos;
        transform.look_at(target, Vec3::Y);
    }
}

/// Reset the orbit distance to suit the active scene whenever it changes (and on
/// startup): the cube-field scene needs a wider frame than the small
/// origin-centered scenes. The user can zoom from there.
fn reframe_camera(state: Res<State<Scene>>, mut rig: ResMut<CameraRig>) {
    match state.get() {
        Scene::CrowdedCubes => rig.radius = 24.0,
        // The monitor sits at the origin (its screen centered there); frame it
        // head-on (`yaw = π/2` looks down +Z at the screen face), a touch above,
        // and close. Auto-orbit is off for this scene but the user can mouse-rotate.
        Scene::Surface => {
            rig.yaw = std::f32::consts::FRAC_PI_2;
            rig.pitch = 0.15;
            rig.radius = 7.5;
        }
        _ => rig.radius = DEFAULT_RADIUS,
    }
}
