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
// Framebuffer capture (`--shoot`) drives Bevy's `Screenshot` + `save_to_disk`, both
// native-only; the whole module is excluded on web.
#[cfg(not(target_arch = "wasm32"))]
mod screenshot;

use std::path::PathBuf;

use bevy::prelude::*;
use bevy_react::ReactUiPlugin;

use camera::CameraPlugin;
use scene::Scene;
use scenes::bouncing_ball::BouncingBallScenePlugin;
use scenes::crowded_cubes::CrowdedCubesScenePlugin;
use scenes::cubes::CubesScenePlugin;
use scenes::monitor::MonitorScenePlugin;

/// Web entry. `wasm-bindgen --target web` wires this as the module's start, so the
/// loader's `await init()` builds and starts the Bevy app — installing
/// `globalThis.__bevyHost` (in `ReactUiPlugin::build`) before the page then loads
/// `vendor.js` + `app.js` (see `examples/demos/ui/index.html`).
#[cfg(target_arch = "wasm32")]
fn main() {
    run();
}

#[cfg(not(target_arch = "wasm32"))]
fn main() {
    use bevy::window::WindowResolution;
    use bevy_react::ReactAppExt;
    use screenshot::ShootConfig;

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

    let Some(cfg) = shoot else {
        run();
        return;
    };

    let mut window = window();
    window.resolution = WindowResolution::new(1280, 832);
    let mut app = build_app(window, /* hot_reload */ false);
    screenshot::add_screenshot_mode(&mut app, cfg);
    app.run();
}

/// The primary window descriptor, shared by every entry point.
fn window() -> Window {
    Window {
        title: "bevy-react · demos".to_string(),
        ..default()
    }
}

/// Build the demos `App`: DefaultPlugins (+ the React UI layer), the scene state,
/// the shared 3D camera, and every demo scene plugin. Shared by the native run,
/// the `--shoot` path, and the web entry — only the asset source differs by target.
fn build_app(window: Window, hot_reload: bool) -> App {
    // CARGO_MANIFEST_DIR is the `bevy-react` crate (crates/core); the example and its
    // bundle live at the repo root, two levels up. The path is unused on web (the page
    // loads the bundle itself) but `ReactUiPlugin` still takes one.
    let bundle =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/demos/ui/dist/app.js");

    // Our `CameraPlugin` (added below) provides the 3D camera that also renders the
    // UI. NotoSans is the app-wide default font; DancingScript / Noto Sans Mono are
    // named families the UI selects per element via `style={{ fontFamily: … }}`.
    let react_plugin = ReactUiPlugin::new(bundle)
        .hot_reload(hot_reload)
        .default_font("fonts/NotoSans-VariableFont_wdth,wght.ttf")
        .font("DancingScript", "fonts/DancingScript-VariableFont_wght.ttf")
        .font(
            "Noto Sans Mono",
            "fonts/NotoSansMono-VariableFont_wdth,wght.ttf",
        );

    // On web, make the canvas track its parent (`<body>`, full-height via index.html)
    // so the view fills and follows the browser window. No-op on native.
    #[cfg(target_arch = "wasm32")]
    let window = Window {
        fit_canvas_to_parent: true,
        ..window
    };

    let window_plugin = WindowPlugin {
        primary_window: Some(window),
        ..default()
    };

    // Native loads the example assets from disk (two levels up from the crate). On
    // web the dev server serves them under `assets/` (Bevy's default), so the default
    // AssetPlugin is kept there.
    #[cfg(not(target_arch = "wasm32"))]
    let default_plugins = DefaultPlugins
        .set(window_plugin)
        .set(bevy::asset::AssetPlugin {
            file_path: "../../examples/assets".into(),
            ..default()
        });
    #[cfg(target_arch = "wasm32")]
    let default_plugins = DefaultPlugins.set(window_plugin);

    let mut app = App::new();
    app.add_plugins(default_plugins)
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
    // Screenshot navigation rides a `#[react_event]`; native-only (the module is too).
    #[cfg(not(target_arch = "wasm32"))]
    screenshot::register_bindings(&mut app);
    app
}

/// Build and run the app with the default window and hot reload enabled. The
/// shared normal-run path for both the native CLI and the web entry.
fn run() {
    build_app(window(), /* hot_reload */ true).run();
}

/// Register every React binding across all demos. Used **only** by the
/// `--export-bindings` exporter, which doesn't add the demo plugins (so they
/// can't register their own bindings). The live app registers bindings via each
/// plugin's `build` instead. This must list the exact same set the plugins do,
/// so the generated TypeScript can never drift from the runtime.
#[cfg(not(target_arch = "wasm32"))]
fn register_react_bindings(app: &mut App) {
    scene::register_bindings(app);
    screenshot::register_bindings(app);
    scenes::cubes::register_bindings(app);
    scenes::bouncing_ball::register_bindings(app);
    scenes::crowded_cubes::register_bindings(app);
    scenes::monitor::register_bindings(app);
}
