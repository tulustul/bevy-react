//! You: a camera at eye height on the end of the pier. Drag with the right
//! button (or the left, on open sky) to look around; the view eases after
//! the mouse and sways a breath's worth when you hold still.

use bevy::anti_alias::smaa::Smaa;
use bevy::camera::Hdr;
use bevy::camera::visibility::RenderLayers;
use bevy::core_pipeline::tonemapping::Tonemapping;
use bevy::input::mouse::AccumulatedMouseMotion;
use bevy::post_process::bloom::{Bloom, BloomCompositeMode, BloomPrefilter};
use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;
use bevy_react::{PointerCapture, PointerCaptureSet, ReactAppExt, ReactEvents, react_event};

use crate::world::EYE_LAYERS;

/// Where your eyes are: 1.65 m above the deck at the end of the pier.
pub const EYE: Vec3 = Vec3::new(0.0, 2.0, 0.0);
const FOV_DEGREES: f32 = 58.0;
/// Radians per logical pixel of drag.
const SENSITIVITY: f32 = 0.0032;
const MAX_YAW: f32 = 1.45;
const MIN_PITCH: f32 = -0.55;
const MAX_PITCH: f32 = 0.6;
/// How far you have to look around before the tour counts it, radians.
const LOOKED_AROUND: f32 = 0.5;

#[derive(Component)]
pub struct Eye;

/// Bevy → React: you looked around (the tour's first step).
#[react_event(name = "tour.looked")]
pub struct LookedAround;

/// Where you're looking: `target` follows the mouse, the view eases after.
#[derive(Resource, Default)]
pub struct Look {
    pub target: Vec2,
    view: Vec2,
    dragging: bool,
    travelled: f32,
    reported: bool,
    /// Set by `--shoot … --do "<secs> look <yaw> <pitch>"`: no sway.
    pub pinned: bool,
}

impl Look {
    /// Snap the view to `target` (yaw, pitch radians) and hold it there.
    pub fn pin(&mut self, target: Vec2) {
        self.target = target;
        self.view = target;
        self.pinned = true;
    }
}

pub struct LookPlugin;

impl Plugin for LookPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.init_resource::<Look>()
            .add_systems(PreStartup, spawn_eye)
            .add_systems(Update, look_around.after(PointerCaptureSet));
    }
}

pub fn register_bindings(app: &mut App) {
    app.add_react_event::<LookedAround>();
}

fn spawn_eye(mut commands: Commands) {
    commands.spawn((
        Camera3d::default(),
        Camera {
            clear_color: ClearColorConfig::Custom(Color::BLACK),
            ..default()
        },
        Hdr,
        // The world is graded in its own palette and the windows' pixels
        // must arrive untouched: no tonemapping. Only true highlights (the
        // sun, the aurora, a forming window's edge) go past 1.0 and bloom.
        Tonemapping::None,
        Bloom {
            intensity: 0.2,
            low_frequency_boost: 0.6,
            prefilter: BloomPrefilter {
                threshold: 1.0,
                threshold_softness: 0.35,
            },
            composite_mode: BloomCompositeMode::Additive,
            ..Bloom::NATURAL
        },
        Projection::Perspective(PerspectiveProjection {
            fov: FOV_DEGREES.to_radians(),
            near: 0.05,
            far: 10_000.0,
            ..default()
        }),
        Transform::from_translation(EYE).looking_to(-Vec3::Z, Vec3::Y),
        RenderLayers::from_layers(&EYE_LAYERS),
        // SMAA instead of MSAA: on an integrated GPU 4× MSAA over an HDR
        // target costs more than the whole lake. The windows' own edges are
        // antialiased in their shader.
        Msaa::Off,
        Smaa::default(),
        IsDefaultUiCamera,
        Eye,
    ));
}

#[allow(clippy::too_many_arguments)]
fn look_around(
    time: Res<Time>,
    mut look: ResMut<Look>,
    buttons: Res<ButtonInput<MouseButton>>,
    motion: Res<AccumulatedMouseMotion>,
    capture: Res<PointerCapture>,
    over_window: Res<crate::panes::PointerOverPane>,
    events: ReactEvents,
    mut eye: Single<&mut Transform, With<Eye>>,
) {
    let free = !capture.is_captured() && !over_window.0;
    if buttons.just_pressed(MouseButton::Right) || (buttons.just_pressed(MouseButton::Left) && free)
    {
        look.dragging = true;
    }
    if !buttons.pressed(MouseButton::Right) && !buttons.pressed(MouseButton::Left) {
        look.dragging = false;
    }
    if look.dragging && !look.pinned {
        let turn = -motion.delta * SENSITIVITY;
        look.travelled += turn.length();
        look.target.x = (look.target.x + turn.x).clamp(-MAX_YAW, MAX_YAW);
        look.target.y = (look.target.y + turn.y).clamp(MIN_PITCH, MAX_PITCH);
    }
    if !look.reported && look.travelled > LOOKED_AROUND {
        look.reported = true;
        events.send(&LookedAround);
    }

    let dt = time.delta_secs();
    let k = 1.0 - (-8.0 * dt).exp();
    let target = look.target;
    look.view = look.view.lerp(target, k);
    let t = time.elapsed_secs();
    let sway = if look.pinned {
        Vec2::ZERO
    } else {
        Vec2::new((t * 0.21).sin() * 0.006, (t * 0.33).sin() * 0.004)
    };
    let view = look.view + sway;
    eye.rotation = Quat::from_euler(EulerRot::YXZ, view.x, view.y, 0.0);
}
