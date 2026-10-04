//! Headless-friendly screenshot automation for the demos app.
//!
//! `cargo run -p bevy-react --example demos -- --shoot "<portal>" out.png [secs] [--size WxH] [--from <label>]`
//! navigates the React gallery to a demo by its nav label, lets it settle, then
//! captures the rendered frame to a PNG and exits. `--size` (default 1280x832) sets
//! the logical resolution of both the window and the capture — phone-sized shots
//! (`--size 390x844`) are how the responsive shell is verified without a device.
//! `--from <label>` first shows *that* demo for [`HOP_SECS`], then navigates to the
//! target — the way a page **transition** (scene switch, camera teardown/spawn) is
//! reproduced headlessly; the settle timer starts at the hop. `--scale F` renders
//! the same logical layout at `F`× the pixels (crisper doc images).
//!
//! `--record SECS` writes a frame sequence instead: `out` is a directory that
//! receives `0000.png`, `0001.png`, … at [`RECORD_FPS`] of wall-clock time after the
//! settle (a slow frame repeats the last image, so the timeline stays true —
//! React's timers run on wall time too). `--input "<secs> move X Y [glide]|press|release"`
//! (repeatable, seconds from the recording start, logical px) scripts a virtual
//! pointer through the core's [`VirtualPointers`] path, drawn as an arrow sprite —
//! how the docs' interaction captures (clicks, presses) are made.
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

use bevy::camera::{ImageRenderTarget, NormalizedRenderTarget, RenderTarget};
use bevy::image::Image;
use bevy::picking::pointer::{Location, PointerAction, PointerButton, PointerId, PointerInput};
use bevy::prelude::*;
use bevy::render::render_resource::TextureFormat;
use bevy::render::view::screenshot::{Screenshot, ScreenshotCaptured, save_to_disk};
use bevy::tasks::{IoTaskPool, Task, block_on};
use bevy::ui::IsDefaultUiCamera;
use bevy_react::ext::VirtualPointers;
use bevy_react::{ReactAppExt, ReactEvents, react_event};

use crate::spotlight::{DARK, SpotlightPointer};

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

/// The `--size` default: the desktop shell at the size every existing shot used.
pub const DEFAULT_SIZE: (u32, u32) = (1280, 832);

/// How long `--from <label>` shows the starting demo before hopping to the target.
pub const HOP_SECS: f32 = 2.0;

/// Frame rate of a `--record` run (25 → whole-centisecond GIF delays).
pub const RECORD_FPS: f32 = 25.0;

/// How long a scripted `move` glides the pointer to its target by default.
const GLIDE_SECS: f32 = 0.225;

/// The scripted pointer (`--input`), registered as a [`VirtualPointers`] entry.
const SCRIPT_POINTER: PointerId = PointerId::Custom(bevy::asset::uuid::Uuid::from_u128(
    0x6a1e_5c0f_3d2b_4e8a_9b7c_1f0e_2d4c_8a61,
));

/// One `--input` step: at `at` seconds into the recording, do `action`.
pub struct PointerStep {
    pub at: f32,
    pub action: StepAction,
}

pub enum StepAction {
    /// Glide to this logical position over `secs` (the first move jumps).
    Move {
        to: Vec2,
        secs: f32,
    },
    Press,
    Release,
}

impl PointerStep {
    /// `"1.5 move 640 400 [glide-secs]"` | `"2 press"` | `"2.3 release"`; `None`
    /// if malformed. A move glides over [`GLIDE_SECS`] unless given its own.
    pub fn parse(spec: &str) -> Option<Self> {
        let mut it = spec.split_whitespace();
        let at = it.next()?.parse().ok()?;
        let action = match it.next()? {
            "move" => StepAction::Move {
                to: Vec2::new(it.next()?.parse().ok()?, it.next()?.parse().ok()?),
                secs: match it.next() {
                    Some(secs) => secs.parse().ok()?,
                    None => GLIDE_SECS,
                },
            },
            "press" => StepAction::Press,
            "release" => StepAction::Release,
            _ => return None,
        };
        it.next().is_none().then_some(Self { at, action })
    }
}

/// Parsed `--shoot` arguments.
pub struct ShootConfig {
    /// The target demo's nav label (e.g. `"<portal>"`).
    pub label: String,
    /// Where to write the PNG.
    pub out: PathBuf,
    /// Seconds to let the demo (and its 3D scene) settle before capturing.
    pub settle_secs: f32,
    /// Logical resolution of the window and the offscreen capture (`--size WxH`).
    pub size: (u32, u32),
    /// A demo to show first (`--from <label>`), hopping to `label` after [`HOP_SECS`].
    pub from: Option<String>,
    /// Pixels per logical pixel of the capture (`--scale`).
    pub scale: f32,
    /// Record this many seconds of frames into the `out` directory (`--record`).
    pub record: Option<f32>,
    /// The scripted pointer's steps (`--input`), in any order.
    pub steps: Vec<PointerStep>,
}

/// Drives one screenshot run: [nav to `from` → hop →] nav → settle → capture → exit.
#[derive(Resource)]
struct Shoot {
    /// The run's arguments; `config.from` is cleared once we've hopped.
    config: ShootConfig,
    settle: Timer,
    hop: Timer,
    /// The offscreen target the app renders into (set in `PostStartup`). The
    /// screenshot must name it with the same `scale_factor`, or it reads nothing.
    target: Option<ImageRenderTarget>,
    /// The capture has been requested (waiting on the async readback).
    shot: bool,
    /// The image has been written to disk (set by the capture observer).
    captured: bool,
    /// The running `--record` (set when the settle finishes).
    recording: Option<Recording>,
}

/// State of a `--record` run.
struct Recording {
    /// `Time::elapsed_secs` at the recording start.
    start: f32,
    /// Frames the run writes.
    total: u32,
    /// Frame indices requested / received so far.
    requested: u32,
    received: u32,
    /// Pending PNG encodes (off the main thread, so capture keeps up).
    writes: Vec<Task<()>>,
    /// Index of the next unapplied `--input` step.
    next_step: usize,
    /// Where the pointer is, and the glide in flight `(from, to, start, secs)`.
    pointer: Option<Vec2>,
    glide: Option<(Vec2, Vec2, f32, f32)>,
}

/// The arrow sprite drawn at the scripted pointer.
#[derive(Component)]
struct ScriptCursor;

/// Install screenshot mode: the [`Shoot`] state, the camera-redirect, and the
/// system that runs the nav → settle → capture → exit sequence.
pub fn add_screenshot_mode(app: &mut App, mut config: ShootConfig) {
    config.steps.sort_by(|a, b| a.at.total_cmp(&b.at));
    app.insert_resource(Shoot {
        settle: Timer::from_seconds(config.settle_secs, TimerMode::Once),
        config,
        hop: Timer::from_seconds(HOP_SECS, TimerMode::Once),
        target: None,
        shot: false,
        captured: false,
        recording: None,
    })
    // The UI renders to an image, so the window cursor would light the wrong
    // spot — the spotlight stays dark unless the scripted pointer moves.
    .insert_resource(SpotlightPointer(Some(DARK)))
    .add_systems(
        PostStartup,
        (redirect_ui_camera_to_image, spawn_script_cursor),
    )
    .add_systems(Update, (drive_shoot, drive_recording).chain());
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
    let (width, height) = shoot.config.size;
    let scale = shoot.config.scale;
    let handle = images.add(Image::new_target_texture(
        (width as f32 * scale).round() as u32,
        (height as f32 * scale).round() as u32,
        TextureFormat::Rgba8UnormSrgb,
        None,
    ));
    let target = ImageRenderTarget {
        handle,
        scale_factor: scale,
    };
    commands
        .entity(*camera)
        .insert(RenderTarget::Image(target.clone()));
    shoot.target = Some(target);
}

/// Register the scripted pointer and its (hidden until the first move) sprite.
fn spawn_script_cursor(
    mut commands: Commands,
    shoot: Res<Shoot>,
    mut pointers: ResMut<VirtualPointers>,
    assets: Res<AssetServer>,
) {
    if shoot.config.steps.is_empty() {
        return;
    }
    pointers.register(SCRIPT_POINTER);
    commands.spawn(SCRIPT_POINTER);
    commands.spawn((
        ScriptCursor,
        Node {
            position_type: PositionType::Absolute,
            width: Val::Px(16.0),
            height: Val::Px(24.0),
            ..default()
        },
        ImageNode::new(assets.load("cursor-arrow.png")),
        GlobalZIndex(i32::MAX),
        Pickable::IGNORE,
        Visibility::Hidden,
    ));
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

    // `--from`: show the starting demo until the hop timer fires, then fall through
    // to the target (the settle timer only starts ticking after the hop).
    if let Some(from) = shoot.config.from.clone() {
        if shoot.hop.tick(time.delta()).is_finished() {
            info!("hopping from {from:?} to {:?}", shoot.config.label);
            shoot.config.from = None;
        } else {
            events.send(&SelectDemo { label: from });
            return;
        }
    }

    // Keep (idempotently) asking React to show the target demo every frame until we
    // capture, so it lands even if the JS isolate mounts a few frames late on a cold
    // start — selecting the already-selected demo is a no-op on the React side.
    events.send(&SelectDemo {
        label: shoot.config.label.clone(),
    });

    if !shoot.settle.tick(time.delta()).just_finished() {
        return;
    }
    if let Some(secs) = shoot.config.record {
        info!("recording {:?} for {secs}s", shoot.config.label);
        shoot.recording = Some(Recording {
            start: time.elapsed_secs(),
            total: (secs * RECORD_FPS).ceil() as u32,
            requested: 0,
            received: 0,
            writes: Vec::new(),
            next_step: 0,
            pointer: None,
            glide: None,
        });
        // `shot` parks the single-capture path; `drive_recording` takes over.
        shoot.shot = true;
        return;
    }
    let target = shoot
        .target
        .clone()
        .expect("the camera redirect runs in PostStartup");
    let out = shoot.config.out.clone();
    info!(
        "capturing screenshot of {:?} → {}",
        shoot.config.label,
        out.display()
    );
    commands
        .spawn(Screenshot(RenderTarget::Image(target)))
        .observe(save_to_disk(out))
        .observe(|_: On<ScreenshotCaptured>, mut shoot: ResMut<Shoot>| {
            // `save_to_disk` (the sibling observer) writes synchronously, so by
            // the next frame the file is on disk and we can exit.
            shoot.captured = true;
        });
    shoot.shot = true;
}

/// One `--record` frame: advance the pointer script, request the frames due by
/// now, and exit once every frame is on disk.
fn drive_recording(
    time: Res<Time>,
    mut shoot: ResMut<Shoot>,
    mut commands: Commands,
    mut input: MessageWriter<PointerInput>,
    mut cursor: Query<(&mut Node, &mut Visibility), With<ScriptCursor>>,
    mut spotlight: ResMut<SpotlightPointer>,
    mut exit: MessageWriter<AppExit>,
) {
    let shoot = &mut *shoot;
    let Some(rec) = shoot.recording.as_mut() else {
        return;
    };
    let render_target = shoot.target.clone().expect("set in PostStartup");
    let t = time.elapsed_secs() - rec.start;
    let location = |position: Vec2| Location {
        target: NormalizedRenderTarget::Image(render_target.clone()),
        position,
    };

    // The pointer script: glides first, so a press lands where the move ended.
    let mut target = None;
    while let Some(step) = shoot.config.steps.get(rec.next_step).filter(|s| s.at <= t) {
        rec.next_step += 1;
        match step.action {
            StepAction::Move { to, secs } => match rec.pointer {
                Some(from) => rec.glide = Some((from, to, step.at, secs)),
                None => target = Some(to),
            },
            StepAction::Press | StepAction::Release => {
                if let Some((_, to, _, _)) = rec.glide.take() {
                    target = Some(to);
                }
                let button = PointerButton::Primary;
                let action = match step.action {
                    StepAction::Press => PointerAction::Press(button),
                    _ => PointerAction::Release(button),
                };
                let at = target.or(rec.pointer).unwrap_or_default();
                input.write(PointerInput::new(SCRIPT_POINTER, location(at), action));
            }
        }
    }
    if let Some((from, to, start, secs)) = rec.glide {
        let k = ((t - start) / secs).clamp(0.0, 1.0);
        target = Some(from.lerp(to, k * k * (3.0 - 2.0 * k)));
        if k >= 1.0 {
            rec.glide = None;
        }
    }
    if let Some(to) = target.filter(|to| rec.pointer != Some(*to)) {
        let delta = to - rec.pointer.unwrap_or(to);
        input.write(PointerInput::new(
            SCRIPT_POINTER,
            location(to),
            PointerAction::Move { delta },
        ));
        rec.pointer = Some(to);
        spotlight.0 = Some(to * shoot.config.scale);
        for (mut node, mut visibility) in &mut cursor {
            // The arrow's tip sits ~(1.3, 1.2) px into the sprite.
            node.left = Val::Px(to.x - 1.3);
            node.top = Val::Px(to.y - 1.2);
            *visibility = Visibility::Inherited;
        }
    }

    // Request every frame index due by now (a slow frame covers several).
    let due = ((t * RECORD_FPS) as u32 + 1).min(rec.total);
    if due > rec.requested {
        let dir = shoot.config.out.clone();
        let paths: Vec<PathBuf> = (rec.requested..due)
            .map(|i| dir.join(format!("{i:04}.png")))
            .collect();
        rec.requested = due;
        commands
            .spawn(Screenshot(RenderTarget::Image(render_target)))
            .observe(
                move |captured: On<ScreenshotCaptured>, mut shoot: ResMut<Shoot>| {
                    let rec = shoot.recording.as_mut().expect("recording");
                    rec.received += paths.len() as u32;
                    let (image, paths) = (captured.image.clone(), paths.clone());
                    rec.writes.push(IoTaskPool::get().spawn(async move {
                        let rgb = image.try_into_dynamic().expect("capture").to_rgb8();
                        for path in paths {
                            rgb.save(&path).expect("write frame");
                        }
                    }));
                },
            );
    }
    if rec.received == rec.total {
        for write in rec.writes.drain(..) {
            block_on(write);
        }
        info!(
            "wrote {} frames to {}",
            rec.total,
            shoot.config.out.display()
        );
        exit.write(AppExit::Success);
    }
}
