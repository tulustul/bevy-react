//! Stress test for the auto layer-promotion system.
//!
//! A pure-UI Bevy app that scatters N opacity-bearing card subtrees across the
//! window — each one auto-promotes to its own composited layer (opacity present
//! on a node with children, see `crates/core/src/layer.rs`). The React UI
//! switches N (20 / 100 / 500), toggles Rust-driven position/opacity
//! animations, toggles `groupAlpha` (off de-promotes every subtree — the
//! un-layered baseline), and applies layer-based `filter` chains to a share of
//! items (grayscale/blur, optionally with a JS-driven animated blur radius).
//! An FPS readout ships from Bevy ~4x/sec over a `#[react_event]`.
//!
//! Unattended measurement: bake a scenario into the bundle with
//! `STRESS_PRESET` (see `ui/build.mjs` and the README), then run with
//! `--measure <secs>` to log FPS once per second and exit. Measure mode renders
//! into an **offscreen image** (the UI camera is re-pointed at it, the `--shoot`
//! mechanism of the demos example): an occluded/unmapped X11 window reports a
//! 0×0 surface, under which bevy records no camera target format, layout is
//! empty, and the whole layer path (captures, filters, composites) never runs —
//! the FPS would measure an empty frame.
//!
//! Vsync is always off (`PresentMode::AutoNoVsync`) so FPS reflects actual
//! throughput instead of pinning at the refresh rate.
//!
//! Build the bundle first: `npm run build -w layers-stress-app`, then
//! `cargo run -p layers-stress`.

#[path = "../bench_app.rs"]
mod bench_app;
mod fps;

use bevy::camera::RenderTarget;
use bevy::prelude::*;
use bevy::render::render_resource::TextureFormat;
use bevy::ui::IsDefaultUiCamera;
use bevy::window::PresentMode;

use fps::FpsPlugin;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if bench_app::export_bindings(&args, fps::register_bindings) {
        return;
    }

    // `--measure <secs>` runs unattended: log the smoothed FPS to stdout once
    // per second and exit after <secs>. Preset the scenario by baking a
    // `STRESS_PRESET` into the bundle first (see `ui/build.mjs`). Hot reload is
    // off so the file watcher can't perturb the numbers, and the app renders
    // offscreen (see the module doc).
    let measure = args.iter().position(|a| a == "--measure").map(|i| {
        args.get(i + 1)
            .and_then(|s| s.parse::<f64>().ok())
            .expect("--measure requires a duration in seconds")
    });

    let mut app = build_app(/* hot_reload */ measure.is_none());
    if let Some(secs) = measure {
        app.insert_resource(MeasureFor(secs))
            .add_systems(PostStartup, redirect_ui_camera_to_image)
            .add_systems(Update, measure_fps);
    }
    app.run();
}

/// `--measure` duration in seconds.
#[derive(Resource)]
struct MeasureFor(f64);

/// The offscreen target `--measure` renders into (logical = physical px; the
/// demos example's `--shoot` default).
const MEASURE_SIZE: (u32, u32) = (1280, 832);

/// Re-point the UI camera (spawned by the bench shell in `Startup`) at an
/// offscreen image of [`MEASURE_SIZE`], so layout and the render-side layer
/// path run for real whatever the window surface is (see the module doc). The
/// `RenderTarget` component holds the image handle, keeping the asset alive.
fn redirect_ui_camera_to_image(
    mut commands: Commands,
    mut images: ResMut<Assets<Image>>,
    camera: Single<Entity, With<IsDefaultUiCamera>>,
) {
    let (width, height) = MEASURE_SIZE;
    let handle = images.add(Image::new_target_texture(
        width,
        height,
        TextureFormat::Rgba8UnormSrgb,
        None,
    ));
    commands
        .entity(*camera)
        .insert(RenderTarget::Image(handle.into()));
}

/// Print the smoothed FPS once per second; request exit once the measurement
/// window has elapsed. The first samples are warm-up (pipeline compilation,
/// initial captures) — read the steady state off the tail. The camera's
/// viewport size rides along so a log proves the frame was a real one.
fn measure_fps(
    time: Res<Time>,
    diagnostics: Res<bevy::diagnostic::DiagnosticsStore>,
    cfg: Res<MeasureFor>,
    camera: Single<&Camera, With<IsDefaultUiCamera>>,
    mut last_print: Local<f64>,
    mut exit: MessageWriter<AppExit>,
) {
    let t = time.elapsed_secs_f64();
    if t - *last_print >= 1.0 {
        *last_print = t;
        if let Some(fps) = diagnostics
            .get(&bevy::diagnostic::FrameTimeDiagnosticsPlugin::FPS)
            .and_then(|d| d.smoothed())
        {
            let viewport = camera.physical_viewport_size();
            println!("[measure] t={t:.0}s fps={fps:.1} viewport={viewport:?}");
        }
    }
    if t >= cfg.0 {
        exit.write(AppExit::Success);
    }
}

/// The layers-stress `App`: the bench shell plus the FPS reporter. Vsync
/// off: with it the readout pins at the refresh rate and layer-count
/// differences disappear.
fn build_app(hot_reload: bool) -> App {
    let mut app = bench_app::build_app(
        "bevy-react · layers-stress",
        hot_reload,
        PresentMode::AutoNoVsync,
    );
    app.add_plugins(FpsPlugin);
    app
}
