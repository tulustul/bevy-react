//! `--shoot <out.png> [settle-secs] [--size WxH] [--do "<secs> <action>"]…`
//! renders the app into an offscreen image (independent of window focus or
//! occlusion), plays the scripted actions, captures one PNG and exits.
//!
//! `--size` is the capture's size in physical pixels (default 1920×1080);
//! the UI is laid out at 1080p logical whatever it is, like the window.
//!
//! Actions are strings the React app interprets (`debug.act` — see
//! `useDebug` in `ui/src/hooks.ts`): `go <screen>` jumps straight to a
//! screen, `tab <name>`, `pick <value>`… (the verbs are listed in `App.tsx`).
//! The clock starts when React's first commit lands, so a slow isolate boot
//! never swallows an early step.

use std::path::PathBuf;

use bevy::camera::{ImageRenderTarget, RenderTarget};
use bevy::prelude::*;
use bevy::render::render_resource::TextureFormat;
use bevy::render::view::screenshot::{Screenshot, ScreenshotCaptured, save_to_disk};
use bevy_react::{ReactAppExt, ReactEvents, ReactNode, react_event};

use crate::UI_HEIGHT;
use crate::datascape::MainCamera;

/// Bevy → React: perform a scripted step (see the module docs).
#[react_event(name = "debug.act")]
pub struct Act {
    pub action: String,
}

pub fn register_bindings(app: &mut App) {
    app.add_react_event::<Act>();
}

pub struct ShootConfig {
    pub out: PathBuf,
    pub settle_secs: f32,
    pub size: (u32, u32),
    /// `(seconds after React's first commit, action)`, sorted.
    pub steps: Vec<(f32, String)>,
}

/// `None` unless the first argument is `--shoot`. Malformed input panics: a
/// silently ignored flag would produce a misleading capture.
pub fn parse(args: &[String]) -> Option<ShootConfig> {
    let mut it = args.iter();
    if it.next().map(String::as_str) != Some("--shoot") {
        return None;
    }
    let mut cfg = ShootConfig {
        out: PathBuf::new(),
        settle_secs: 4.0,
        size: (1920, 1080),
        steps: Vec::new(),
    };
    let mut positional = Vec::new();
    while let Some(arg) = it.next() {
        let mut value = |flag: &str| it.next().unwrap_or_else(|| panic!("{flag} needs a value"));
        match arg.as_str() {
            "--size" => {
                let v = value("--size");
                let (w, h) = v
                    .split_once('x')
                    .unwrap_or_else(|| panic!("--size WxH, got {v}"));
                cfg.size = (w.parse().unwrap(), h.parse().unwrap());
            }
            "--do" => {
                let v = value("--do");
                let (at, action) = v
                    .split_once(' ')
                    .unwrap_or_else(|| panic!("--do \"<secs> <action>\", got {v:?}"));
                cfg.steps
                    .push((at.parse().expect("--do secs"), action.to_string()));
            }
            flag if flag.starts_with("--") => panic!("unknown --shoot option {flag}"),
            _ => positional.push(arg.clone()),
        }
    }
    cfg.out = positional.first().expect("--shoot <out.png>").into();
    if let Some(secs) = positional.get(1) {
        cfg.settle_secs = secs.parse().expect("settle-secs");
    }
    cfg.steps.sort_by(|a, b| a.0.total_cmp(&b.0));
    Some(cfg)
}

#[derive(Resource)]
struct Shoot {
    cfg: ShootConfig,
    target: Option<ImageRenderTarget>,
    /// When React's first commit landed (the script clock's zero).
    start: Option<f32>,
    /// Frames and seconds since the first second, for the frame-time report.
    frames: (u32, f32),
    next_step: usize,
    shot: bool,
    captured: bool,
}

pub fn install(app: &mut App, cfg: ShootConfig) {
    app.insert_resource(Shoot {
        cfg,
        target: None,
        start: None,
        frames: (0, 0.0),
        next_step: 0,
        shot: false,
        captured: false,
    })
    .add_systems(PostStartup, redirect_camera)
    .add_systems(Update, drive);
}

/// Point the main camera (datascape + UI) at an offscreen image, scaled so
/// its logical height is the UI's 1080.
fn redirect_camera(
    mut commands: Commands,
    mut images: ResMut<Assets<Image>>,
    mut shoot: ResMut<Shoot>,
    camera: Single<Entity, With<MainCamera>>,
) {
    let (w, h) = shoot.cfg.size;
    let handle = images.add(Image::new_target_texture(
        w,
        h,
        TextureFormat::Rgba8UnormSrgb,
        None,
    ));
    let target = ImageRenderTarget {
        handle,
        scale_factor: h as f32 / UI_HEIGHT,
    };
    commands
        .entity(*camera)
        .insert(RenderTarget::Image(target.clone()));
    shoot.target = Some(target);
}

fn drive(
    time: Res<Time>,
    mut shoot: ResMut<Shoot>,
    mounted: Query<(), With<ReactNode>>,
    events: ReactEvents,
    mut commands: Commands,
    mut exit: MessageWriter<AppExit>,
) {
    if shoot.captured {
        exit.write(AppExit::Success);
        return;
    }
    if shoot.shot {
        return;
    }
    let now = time.elapsed_secs();
    let start = match shoot.start {
        Some(start) => start,
        None if !mounted.is_empty() => *shoot.start.insert(now),
        None => return,
    };
    let t = now - start;
    // Past the first second (the isolate and pipeline warm-up).
    if t > 1.0 {
        shoot.frames.0 += 1;
        shoot.frames.1 += time.delta_secs();
    }
    while let Some((at, action)) = shoot.cfg.steps.get(shoot.next_step).cloned() {
        if at > t {
            break;
        }
        info!("shoot: {action} at {t:.2}s");
        events.send(&Act { action });
        shoot.next_step += 1;
    }
    if t < shoot.cfg.settle_secs {
        return;
    }
    let target = shoot.target.clone().expect("redirected in PostStartup");
    let (frames, secs) = shoot.frames;
    info!(
        "shoot: capturing → {} ({:.1} ms/frame over {frames} frames)",
        shoot.cfg.out.display(),
        secs * 1000.0 / frames.max(1) as f32
    );
    commands
        .spawn(Screenshot(RenderTarget::Image(target)))
        .observe(save_to_disk(shoot.cfg.out.clone()))
        .observe(|_: On<ScreenshotCaptured>, mut shoot: ResMut<Shoot>| {
            shoot.captured = true;
        });
    shoot.shot = true;
}
