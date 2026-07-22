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
//! `--measure <secs>` to log FPS once per second and exit.
//!
//! Vsync is always off (`PresentMode::AutoNoVsync`) so FPS reflects actual
//! throughput instead of pinning at the refresh rate.
//!
//! Build the bundle first: `npm run build -w layers-stress-app`, then
//! `cargo run -p bevy-react --example layers-stress`.

mod fps;

use std::path::PathBuf;

use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;
use bevy::window::PresentMode;
use bevy_react::ReactUiPlugin;

use fps::FpsPlugin;

fn main() {
    use bevy_react::ReactAppExt;

    let args: Vec<String> = std::env::args().skip(1).collect();

    // `--export-bindings <path>` writes the TypeScript message types instead of
    // running the app, keeping `ui/src/bevy.ts` in sync with the Rust `#[react_*]`
    // structs. It needs only the handler registrations, so it skips
    // DefaultPlugins/ReactUiPlugin (no window, no JS runtime).
    if args.first().map(String::as_str) == Some("--export-bindings") {
        let path = args
            .get(1)
            .expect("--export-bindings requires an output path");
        let mut app = App::new();
        register_react_bindings(&mut app);
        app.export_react_typescript(path)
            .expect("failed to write TypeScript bindings");
        println!("wrote React bindings to {path}");
        return;
    }

    // `--measure <secs>` runs unattended: log the smoothed FPS to stdout once
    // per second and exit after <secs>. Preset the scenario by baking a
    // `STRESS_PRESET` into the bundle first (see `ui/build.mjs`). Hot reload is
    // off so the file watcher can't perturb the numbers.
    let measure = args.iter().position(|a| a == "--measure").map(|i| {
        args.get(i + 1)
            .and_then(|s| s.parse::<f64>().ok())
            .expect("--measure requires a duration in seconds")
    });

    let mut app = build_app(/* hot_reload */ measure.is_none());
    if let Some(secs) = measure {
        app.insert_resource(MeasureFor(secs))
            .add_systems(Update, measure_fps);
    }
    app.run();
}

/// `--measure` duration in seconds.
#[derive(Resource)]
struct MeasureFor(f64);

/// Print the smoothed FPS once per second; request exit once the measurement
/// window has elapsed. The first samples are warm-up (pipeline compilation,
/// initial captures) — read the steady state off the tail.
fn measure_fps(
    time: Res<Time>,
    diagnostics: Res<bevy::diagnostic::DiagnosticsStore>,
    cfg: Res<MeasureFor>,
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
            println!("[measure] t={t:.0}s fps={fps:.1}");
        }
    }
    if t >= cfg.0 {
        exit.write(AppExit::Success);
    }
}

/// Build the stress `App`: DefaultPlugins + the React UI layer + a 2D UI camera +
/// the FPS reporter. Pure UI — no 3D scene or orbit camera.
fn build_app(hot_reload: bool) -> App {
    // CARGO_MANIFEST_DIR is the `bevy-react` crate (crates/core); the example and
    // its bundle live at the repo root, two levels up.
    let bundle = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../examples/layers-stress/ui/dist/app.js");

    let react_plugin = ReactUiPlugin::new(bundle)
        .hot_reload(hot_reload)
        .default_font("fonts/NotoSans-VariableFont_wdth,wght.ttf")
        .font(
            "Noto Sans Mono",
            "fonts/NotoSansMono-VariableFont_wdth,wght.ttf",
        );

    let mut app = App::new();
    app.add_plugins(
        DefaultPlugins
            .set(WindowPlugin {
                primary_window: Some(Window {
                    title: "bevy-react · layers-stress".to_string(),
                    // Uncapped FPS: with vsync the readout pins at the refresh
                    // rate and layer-count differences disappear.
                    present_mode: PresentMode::AutoNoVsync,
                    ..default()
                }),
                ..default()
            })
            .set(bevy::asset::AssetPlugin {
                file_path: "../../examples/assets".into(),
                ..default()
            }),
    )
    .add_plugins(react_plugin)
    .add_systems(Startup, spawn_ui_camera)
    .add_plugins(FpsPlugin);
    app
}

/// `bevy_ui` needs a camera to render; the stress app has no 3D scene, so a plain
/// 2D camera marked as the default UI camera suffices.
fn spawn_ui_camera(mut commands: Commands) {
    commands.spawn((Camera2d, IsDefaultUiCamera));
}

/// Register every React binding. Used **only** by the `--export-bindings`
/// exporter (which doesn't add the plugins that would register them live), so it
/// must list the exact same set the plugins do — keeping the generated TypeScript
/// from drifting from the runtime.
fn register_react_bindings(app: &mut App) {
    fps::register_bindings(app);
}
