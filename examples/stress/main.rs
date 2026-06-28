//! Benchmark / stress-test runner for `bevy_react`.
//!
//! A minimal, pure-UI Bevy app (no 3D scene, no camera orbit) that hosts
//! benchmark scenarios. The first scenario is **table-ops** — the standard
//! table operation set (create 1k/10k rows, append 1k, update every 10th, swap,
//! select, remove, clear) borrowed from the js-framework-benchmark, measured as
//! a *library* benchmark: bevy-react's own per-operation timings (no react-dom
//! comparison).
//!
//! Two entry modes:
//!
//!   * **Interactive** (no flags) — opens the table with control buttons
//!     and a live timing readout, for manual exploration / profiling.
//!     `cargo run -p bevy-react --example stress`
//!
//!   * **Capture** — drives the operation set automatically, one op at a time,
//!     records per-op timing (p50/p99 over N iterations), writes JSON, and exits:
//!     `cargo run -p bevy-react --example stress -- --run table-ops --out results.json [--iterations N]`
//!
//! Like `--shoot` in the demos app, capture still needs an X11 display present.
//!
//! Build the bundle first: `npm run build -w stress-app`.

mod table_ops;

use std::path::PathBuf;

use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;
use bevy_react::ReactUiPlugin;

use table_ops::TableOpsPlugin;

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

    // `--run <scenario> [--out <path>] [--iterations N]` runs a scenario in
    // capture mode: drive → time → record → exit. Without it, run interactively.
    if args.first().map(String::as_str) == Some("--run") {
        let scenario = args.get(1).map(String::as_str).unwrap_or("table-ops");
        assert_eq!(scenario, "table-ops", "unknown scenario {scenario:?}");
        let out = flag_value(&args, "--out").map(PathBuf::from);
        let iterations = flag_value(&args, "--iterations")
            .and_then(|s| s.parse().ok())
            .unwrap_or(10);

        // Benchmark numbers are only meaningful from an optimized build: a debug
        // Rust build (and a dev JS bundle) run ~10x slower. Warn loudly rather
        // than silently emit misleading results.
        if cfg!(debug_assertions) {
            eprintln!(
                "warning: capturing benchmarks in a DEBUG build — numbers are NOT \
                 representative. Rebuild with `cargo run --release` and the JS bundle \
                 with `npm run build:prod -w stress-app` for meaningful results."
            );
        }

        let mut app = build_app(/* hot_reload */ false);
        table_ops::add_capture_mode(&mut app, table_ops::CaptureConfig { out, iterations });
        app.run();
        return;
    }

    build_app(/* hot_reload */ true).run();
}

/// Pull the value following `--flag` from the arg list, if present.
fn flag_value<'a>(args: &'a [String], flag: &str) -> Option<&'a str> {
    args.iter()
        .position(|a| a == flag)
        .and_then(|i| args.get(i + 1))
        .map(String::as_str)
}

/// Build the stress `App`: DefaultPlugins + the React UI layer + a 2D UI camera +
/// the benchmark plugin. Pure UI — no 3D scene or orbit camera.
fn build_app(hot_reload: bool) -> App {
    // CARGO_MANIFEST_DIR is the `bevy-react` crate (crates/core); the example and
    // its bundle live at the repo root, two levels up.
    let bundle =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/stress/ui/dist/app.js");

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
                    title: "bevy-react · stress".to_string(),
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
    .add_plugins(TableOpsPlugin);
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
    table_ops::register_bindings(app);
}
