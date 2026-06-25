//! Example consumer of the `bevy_react` library: one Bevy app whose UI is a React
//! app (see `ui/`), overlaid on a live 3D scene. A left-nav switches between the
//! demos; React drives the active 3D scene with `bevy.selectScene(id)` (or
//! `null` for an empty viewport). There are three scenes, each its own plugin:
//!
//!   * Cubes         — React `bevy.basicDemo.setCount(n)` → that many spinning cubes.
//!   * Bouncing ball — a ball pushes `bevyEventsDemo.ballBounced` toasts and answers
//!     `bevy.pollingDemo.getBall()` polls (one scene, both bridge directions).
//!   * Crowded cubes — UI badges anchored to ~100 wandering 3D cubes on a plane.
//!
//! Pure-UI demos (Animations, Interactions, …) declare no scene and select `null`.
//!
//! Run with:
//!
//!   npm install && npm run build -w demos-app   # build the React bundle
//!   cargo run -p bevy-react --example demos
//!
//! For hot reload, run `npm run watch -w demos-app` in another terminal and edit
//! the files under `ui/src/`.

mod camera;
mod scene;
mod scenes;
mod screenshot;

use std::path::PathBuf;

use bevy::asset::AssetPlugin;
use bevy::prelude::*;
use bevy::window::WindowResolution;
use bevy_react::{ReactAppExt, ReactUiPlugin};

use camera::CameraPlugin;
use scene::Scene;
use scenes::bouncing_ball::BouncingBallScenePlugin;
use scenes::crowded_cubes::CrowdedCubesScenePlugin;
use scenes::cubes::CubesScenePlugin;
use scenes::monitor::MonitorScenePlugin;
use screenshot::ShootConfig;

fn main() {
    // `cargo run -p bevy-react --example demos -- --export-bindings <path>` writes the TypeScript
    // message types instead of running the app, keeping `ui/src/generated.ts` in sync
    // with the Rust `#[react_*]` structs. It needs only the handler registrations, so
    // it skips DefaultPlugins/ReactUiPlugin (no window, no JS runtime).
    let mut args = std::env::args().skip(1);
    if args.next().as_deref() == Some("--export-bindings") {
        let path = args
            .next()
            .expect("--export-bindings requires an output path");
        let mut app = App::new();
        register_react_bindings(&mut app);
        app.export_react_typescript(&path)
            .expect("failed to write TypeScript bindings");
        println!("wrote React bindings to {path}");
        return;
    }

    // `--shoot <demo-label> <out.png> [settle-secs]` navigates the gallery to a
    // demo, lets it settle, captures the Bevy framebuffer to a PNG, and exits (see
    // `screenshot`). A fixed window size + no hot reload keep the shot deterministic.
    let shoot_args: Vec<String> = std::env::args().skip(1).collect();
    let shoot = (shoot_args.first().map(String::as_str) == Some("--shoot")).then(|| ShootConfig {
        label: shoot_args
            .get(1)
            .expect("--shoot requires a <demo-label>")
            .clone(),
        out: shoot_args
            .get(2)
            .expect("--shoot requires an <out.png> path")
            .into(),
        settle_secs: shoot_args
            .get(3)
            .and_then(|s| s.parse().ok())
            .unwrap_or(3.0),
    });

    // CARGO_MANIFEST_DIR is the `bevy-react` crate (crates/core); the example and
    // its bundle live at the repo root, two levels up.
    let bundle =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/demos/ui/dist/app.js");

    let mut window = Window {
        title: "bevy-react · demos".to_string(),
        ..default()
    };
    // The plugin no longer spawns a camera; our `CameraPlugin` (added below)
    // provides the 3D camera that also renders the UI. Roboto is the app-wide
    // default font; DancingScript is a named family the UI can select per element
    // via `style={{ fontFamily: "DancingScript" }}`.
    let mut react_plugin = ReactUiPlugin::new(bundle)
        .default_font("fonts/NotoSans-VariableFont_wdth,wght.ttf")
        .font("DancingScript", "fonts/DancingScript-VariableFont_wght.ttf")
        .font(
            "Noto Sans Mono",
            "fonts/NotoSansMono-VariableFont_wdth,wght.ttf",
        );
    if shoot.is_some() {
        window.resolution = WindowResolution::new(1280, 832);
        react_plugin = react_plugin.hot_reload(false);
    }

    let mut app = App::new();
    app.add_plugins(
        DefaultPlugins
            .set(WindowPlugin {
                primary_window: Some(window),
                ..default()
            })
            // The example's assets (e.g. the logo) live alongside it.
            .set(AssetPlugin {
                file_path: "../../examples/assets".into(),
                ..default()
            }),
    )
    .add_plugins(react_plugin)
    // State must be registered after DefaultPlugins (which brings StatesPlugin).
    .init_state::<Scene>()
    // The shared 3D camera (auto-orbit + mouse-drag + wheel-zoom + per-scene reframe).
    .add_plugins(CameraPlugin)
    .add_plugins((
        CubesScenePlugin,
        BouncingBallScenePlugin,
        CrowdedCubesScenePlugin,
        MonitorScenePlugin,
    ));
    // Each scene's plugin registers its own bindings in `build`; only the global
    // scene-selection + debug-navigation handlers are left to register here.
    scene::register_bindings(&mut app);
    screenshot::register_bindings(&mut app);
    if let Some(cfg) = shoot {
        screenshot::add_screenshot_mode(&mut app, cfg);
    }
    app.run();
}

/// Register every React binding across all demos. Used **only** by the
/// `--export-bindings` exporter, which doesn't add the demo plugins (so they
/// can't register their own bindings). The live app registers bindings via each
/// plugin's `build` instead. This must list the exact same set the plugins do,
/// so the generated TypeScript can never drift from the runtime.
fn register_react_bindings(app: &mut App) {
    scene::register_bindings(app);
    screenshot::register_bindings(app);
    scenes::cubes::register_bindings(app);
    scenes::bouncing_ball::register_bindings(app);
    scenes::crowded_cubes::register_bindings(app);
    scenes::monitor::register_bindings(app);
}
