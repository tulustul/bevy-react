//! **Epoch** — a 4X strategy game's interface, built with bevy-react.
//!
//! No game is played: the world is a generated hex map, the empire's
//! numbers are made up, and every screen of the interface is React:
//!
//!   * the HUD — yields, research, rivals, notifications, the minimap (a
//!     `<portal>` of a top-down camera) and the end-turn button;
//!   * city banners, unit flags and the tile tooltip, pinned to the 3D map
//!     with `<anchor>`;
//!   * the city panel, the tech tree, the reports with their graphs (`<svg>`)
//!     and the world rankings.
//!
//! Run (from the repo root):
//!
//!   npm install && npm run build -w epoch
//!   cargo run -p epoch

mod camera;
mod map;
mod shoot;

use std::path::PathBuf;

use bevy::prelude::*;
use bevy::window::{PresentMode, WindowResolution};
use bevy_react::prelude::*;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();

    // `--export-bindings <path>` writes the typed TypeScript client
    // (`ui/src/bevy.ts`) from a bare App — no window, no JS runtime.
    if args.first().map(String::as_str) == Some("--export-bindings") {
        let path = args
            .get(1)
            .expect("--export-bindings requires an output path");
        let mut app = App::new();
        register_bindings(&mut app);
        app.export_react_typescript(path)
            .expect("failed to write TypeScript bindings");
        println!("wrote React bindings to {path}");
        return;
    }

    let shoot = shoot::parse(&args);
    let mut window = Window {
        title: "Epoch · bevy-react".into(),
        resolution: WindowResolution::new(1440, 900),
        ..default()
    };
    if let Some(cfg) = &shoot {
        window.resolution = WindowResolution::new(cfg.size.0, cfg.size.1);
        // Uncapped, so the frame-time report measures the work, not vsync.
        window.present_mode = PresentMode::AutoNoVsync;
    }
    let mut app = build_app(window, shoot.is_none());
    if let Some(cfg) = shoot {
        shoot::install(&mut app, cfg);
    }
    app.run();
}

fn build_app(window: Window, hot_reload: bool) -> App {
    let bundle = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("ui/dist/app.js");
    let react = ReactUiPlugin::new(bundle)
        .hot_reload(hot_reload)
        .default_font("fonts/Inter-VariableFont_opsz,wght.ttf")
        .font("Cinzel", "fonts/Cinzel-VariableFont_wght.ttf");

    let mut app = App::new();
    app.add_plugins(DefaultPlugins.set(WindowPlugin {
        primary_window: Some(window),
        ..default()
    }))
    .add_plugins(ReactPlugins.set(react))
    .add_plugins((map::MapPlugin, camera::CameraPlugin));
    app
}

/// Every React binding the app registers — the exporter's single source, so
/// the generated `bevy.ts` can't drift from the running app (each plugin
/// calls its own `register_bindings` in `build`).
fn register_bindings(app: &mut App) {
    ReactPlugins::register_bindings(app);
    map::register_bindings(app);
    camera::register_bindings(app);
    shoot::register_bindings(app);
}
