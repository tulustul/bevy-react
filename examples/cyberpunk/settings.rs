//! The settings that really change Bevy: graphics (the datascape camera),
//! video (the window) and gamma (the camera's color grading, and the `gamma`
//! filter over the gamma screen's test image). React owns every value (the
//! settings store) and pushes these three groups whenever they change.

use bevy::core_pipeline::prepass::MotionVectorPrepass;
use bevy::post_process::bloom::Bloom;
use bevy::post_process::dof::DepthOfField;
use bevy::post_process::effect_stack::ChromaticAberration;
use bevy::post_process::motion_blur::MotionBlur;
use bevy::prelude::*;
use bevy::render::view::ColorGrading;
use bevy::window::{MonitorSelection, PresentMode, PrimaryWindow, VideoModeSelection, WindowMode};
use bevy_react::{ReactAppExt, react_filter, react_message};

use crate::datascape::MainCamera;

pub struct SettingsPlugin;

impl Plugin for SettingsPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<Stash>();
        register_bindings(app);
    }
}

/// React → Bevy: GRAPHICS, as the datascape camera films it.
#[react_message(name = "settings.graphics")]
pub struct GraphicsSettings {
    /// Vertical field of view, degrees.
    pub fov: f32,
    pub aberration: bool,
    /// Depth of field.
    pub focus: bool,
    /// Lens flare: the bloom.
    pub flare: bool,
    /// Motion blur: 0 = off, 1 = low, 2 = high.
    pub blur: u32,
}

/// React → Bevy: VIDEO, applied to the window.
#[react_message(name = "settings.video")]
pub struct VideoSettings {
    /// 0 = windowed, 1 = borderless, 2 = fullscreen.
    pub mode: u32,
    /// The windowed size, physical px.
    pub width: u32,
    pub height: u32,
    pub vsync: bool,
}

/// React → Bevy: GAMMA CORRECTION, applied to the camera's color grading.
#[react_message(name = "settings.gamma")]
pub struct GammaSettings {
    /// 1 = unchanged; above 1 lifts the darks, below sinks them.
    pub value: f32,
}

/// Packing: `params[0].x` = value.
///
/// The gamma screen's test image, through the same curve the setting puts
/// on the world (`rgb^(1/value)`, the curve `ColorGrading` applies).
#[react_filter(shader = "cyberpunk/gamma.wgsl")]
struct Gamma {
    /// 1 = unchanged; above 1 brighter.
    #[serde(default = "one")]
    value: f32,
}

fn one() -> f32 {
    1.0
}

/// The settings' bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    app.add_react_filter::<Gamma>()
        .add_react_handler(graphics)
        .add_react_handler(video)
        .add_react_handler(gamma);
}

/// The camera effects a setting switched off, as datascape.rs tuned them,
/// so switching them back on restores the exact look.
#[derive(Resource, Default)]
struct Stash {
    bloom: Option<Bloom>,
    focus: Option<DepthOfField>,
    chroma: Option<ChromaticAberration>,
}

type Effects<'a> = (
    Entity,
    &'a mut Projection,
    Option<&'a Bloom>,
    Option<&'a DepthOfField>,
    Option<&'a ChromaticAberration>,
);

fn graphics(
    ev: On<GraphicsSettings>,
    mut camera: Query<Effects, With<MainCamera>>,
    mut stash: ResMut<Stash>,
    mut commands: Commands,
) {
    let Ok((entity, mut projection, bloom, focus, chroma)) = camera.single_mut() else {
        return;
    };
    if let Projection::Perspective(p) = projection.as_mut() {
        p.fov = ev.fov.clamp(30.0, 120.0).to_radians();
    }
    let mut camera = commands.entity(entity);
    toggle(&mut camera, ev.flare, bloom, &mut stash.bloom);
    toggle(&mut camera, ev.focus, focus, &mut stash.focus);
    toggle(&mut camera, ev.aberration, chroma, &mut stash.chroma);
    match ev.blur {
        0 => {
            camera.remove::<(MotionBlur, MotionVectorPrepass)>();
        }
        level => {
            camera.insert(MotionBlur {
                shutter_angle: if level == 1 { 0.5 } else { 1.0 },
                samples: 3,
            });
        }
    }
}

/// Take an effect off the camera into the stash, or put it back.
fn toggle<C: Component + Clone>(
    camera: &mut EntityCommands,
    on: bool,
    current: Option<&C>,
    stash: &mut Option<C>,
) {
    match (on, current) {
        (false, Some(effect)) => {
            *stash = Some(effect.clone());
            camera.remove::<C>();
        }
        (true, None) => {
            if let Some(effect) = stash.take() {
                camera.insert(effect);
            }
        }
        _ => {}
    }
}

/// Mode, size and vsync, each written only when it differs, so the window
/// main.rs made (and `fit_ui_to_1080p`'s scale factor) is left alone.
fn video(ev: On<VideoSettings>, mut window: Query<&mut Window, With<PrimaryWindow>>) {
    let Ok(mut window) = window.single_mut() else {
        return;
    };
    let mode = match ev.mode {
        1 => WindowMode::BorderlessFullscreen(MonitorSelection::Current),
        2 => WindowMode::Fullscreen(MonitorSelection::Current, VideoModeSelection::Current),
        _ => WindowMode::Windowed,
    };
    info!(
        "video: {mode:?}, {}x{}, vsync {}",
        ev.width, ev.height, ev.vsync
    );
    if window.mode != mode {
        window.mode = mode;
    }
    let size = (ev.width, ev.height);
    let current = (window.physical_width(), window.physical_height());
    if mode == WindowMode::Windowed && size.0 > 0 && size.1 > 0 && size != current {
        window.resolution.set_physical_resolution(size.0, size.1);
    }
    let present = if ev.vsync {
        PresentMode::AutoVsync
    } else {
        PresentMode::AutoNoVsync
    };
    if window.present_mode != present {
        window.present_mode = present;
    }
}

fn gamma(ev: On<GammaSettings>, mut camera: Query<&mut ColorGrading, With<MainCamera>>) {
    let value = ev.value.clamp(0.25, 4.0);
    for mut grading in &mut camera {
        for section in grading.all_sections_mut() {
            section.gamma = value;
        }
    }
}
