//! Headless-friendly screenshot automation for the demos app.
//!
//! `cargo run -p bevy-react --example demos -- --shoot "<portal>" out.png [secs]`
//! navigates the React gallery to a demo by its nav label, lets it settle, then
//! captures the rendered frame to a PNG and exits.
//!
//! Capture renders the whole app (3D scene + React UI) into an **offscreen image**
//! and screenshots that image — not the OS screen or the window swapchain. That
//! makes it independent of window focus, occlusion, compositor, or even a usable
//! window surface (an occluded/offscreen X11 window yields a degenerate 1×1
//! swapchain — the reason the old screen-grabs and window captures failed). The
//! main UI camera is simply re-pointed at the image for the run.
//!
//! Navigation reuses the typed event bridge: a `debug.selectDemo` event the React
//! `App` subscribes to and applies (see `ui/src/App.tsx`).

use std::path::PathBuf;

use bevy::camera::RenderTarget;
use bevy::image::Image;
use bevy::prelude::*;
use bevy::render::render_resource::TextureFormat;
use bevy::render::view::screenshot::{Screenshot, ScreenshotCaptured, save_to_disk};
use bevy::ui::IsDefaultUiCamera;
use bevy_react::{ReactAppExt, ReactEvents, react_event};

/// Offscreen capture resolution (physical pixels).
const SHOT_W: u32 = 1280;
const SHOT_H: u32 = 832;

/// Bevy → React: navigate the gallery to the demo whose nav label is `label`
/// (e.g. `"<portal>"`). The `App` looks it up in its demo tree and selects it.
/// (`#[react_event]` derives `Serialize`/`TS` itself.)
#[react_event(name = "debug.selectDemo")]
pub struct SelectDemo {
    pub label: String,
}

/// Register the debug navigation event (shared with the `--export-bindings` path so
/// it lands in the generated `bevy.ts` and `App.tsx` can subscribe with types).
pub fn register_bindings(app: &mut App) {
    app.add_react_event::<SelectDemo>();
}

/// Parsed `--shoot` arguments.
pub struct ShootConfig {
    /// The target demo's nav label (e.g. `"<portal>"`).
    pub label: String,
    /// Where to write the PNG.
    pub out: PathBuf,
    /// Seconds to let the demo (and its 3D scene) settle before capturing.
    pub settle_secs: f32,
}

/// Drives one screenshot run: nav → settle → capture → exit.
#[derive(Resource)]
struct Shoot {
    label: String,
    out: PathBuf,
    settle: Timer,
    /// The offscreen target the app renders into (set in `PostStartup`).
    image: Option<Handle<Image>>,
    /// The capture has been requested (waiting on the async readback).
    shot: bool,
    /// The image has been written to disk (set by the capture observer).
    captured: bool,
}

/// Install screenshot mode: the [`Shoot`] state, the camera-redirect, and the
/// system that runs the nav → settle → capture → exit sequence.
pub fn add_screenshot_mode(app: &mut App, config: ShootConfig) {
    app.insert_resource(Shoot {
        label: config.label,
        out: config.out,
        settle: Timer::from_seconds(config.settle_secs, TimerMode::Once),
        image: None,
        shot: false,
        captured: false,
    })
    .add_systems(PostStartup, redirect_ui_camera_to_image)
    .add_systems(Update, drive_shoot);
}

/// Re-point the app's default UI camera (spawned by `CameraPlugin` in `Startup`) at
/// an offscreen image, so everything it renders — the 3D scene and the React UI it
/// carries — lands in a texture we can screenshot regardless of the window surface.
fn redirect_ui_camera_to_image(
    mut commands: Commands,
    mut images: ResMut<Assets<Image>>,
    mut shoot: ResMut<Shoot>,
    camera: Single<Entity, With<IsDefaultUiCamera>>,
) {
    let handle = images.add(Image::new_target_texture(
        SHOT_W,
        SHOT_H,
        TextureFormat::Rgba8UnormSrgb,
        None,
    ));
    commands
        .entity(*camera)
        .insert(RenderTarget::Image(handle.clone().into()));
    shoot.image = Some(handle);
}

fn drive_shoot(
    time: Res<Time>,
    mut shoot: ResMut<Shoot>,
    events: ReactEvents,
    mut commands: Commands,
    mut exit: MessageWriter<AppExit>,
) {
    // Capture finished and the file is on disk → we're done.
    if shoot.captured {
        exit.write(AppExit::Success);
        return;
    }
    // Capture requested; wait for the async readback → the observer sets `captured`.
    if shoot.shot {
        return;
    }

    // Keep (idempotently) asking React to show the target demo every frame until we
    // capture, so it lands even if the JS isolate mounts a few frames late on a cold
    // start — selecting the already-selected demo is a no-op on the React side.
    events.send(&SelectDemo {
        label: shoot.label.clone(),
    });

    if shoot.settle.tick(time.delta()).just_finished() {
        let Some(image) = shoot.image.clone() else {
            return; // redirect hasn't run yet; try again next frame
        };
        let out = shoot.out.clone();
        info!(
            "capturing screenshot of {:?} → {}",
            shoot.label,
            out.display()
        );
        commands
            .spawn(Screenshot::image(image))
            .observe(save_to_disk(out))
            .observe(|_: On<ScreenshotCaptured>, mut shoot: ResMut<Shoot>| {
                // `save_to_disk` (the sibling observer) writes synchronously, so by
                // the next frame the file is on disk and we can exit.
                shoot.captured = true;
            });
        shoot.shot = true;
    }
}
