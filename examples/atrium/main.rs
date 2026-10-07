//! **Atrium** — a spatial desktop, built with bevy-react.
//!
//! You stand at the end of a pier on an alpine lake. Around you float
//! windows of frosted glass, and every one of them is a React app:
//!
//!   * each window is a `<surface>` — React rendered into a texture — on a
//!     pane whose shader frosts the live world behind it (`panes/`);
//!   * the world is one palette eased through a day (`world/`), and the
//!     Skies app borrows any place's sky: pick Reykjavík and the aurora
//!     comes out over your lake;
//!   * the Lenses app shows live cameras around the lake (`<portal>`) —
//!     look closely and you will find yourself on the pier;
//!   * the globe beside Skies is a real 3D object with React labels pinned
//!     to it (`<anchor>`).
//!
//! Run (from the repo root):
//!
//!   npm install && npm run build -w atrium
//!   cargo run -p atrium

mod filters;
mod globe;
mod lenses;
mod look;
mod panes;
mod shoot;
mod skies;
mod world;

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
        title: "Atrium · bevy-react".into(),
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
        .default_font("fonts/Inter-VariableFont_opsz,wght.ttf");

    let mut app = App::new();
    app.add_plugins(DefaultPlugins.set(WindowPlugin {
        primary_window: Some(window),
        ..default()
    }))
    .add_plugins(ReactPlugins.set(react))
    .add_plugins((
        look::LookPlugin,
        world::WorldPlugin,
        panes::PanesPlugin,
        skies::SkiesPlugin,
        globe::GlobePlugin,
        lenses::LensesPlugin,
    ));
    filters::register_bindings(&mut app);
    app
}

/// Every React binding the app registers — the exporter's single source, so
/// the generated `bevy.ts` can't drift from the running app (each plugin
/// calls its own `register_bindings` in `build`).
fn register_bindings(app: &mut App) {
    ReactPlugins::register_bindings(app);
    filters::register_bindings(app);
    look::register_bindings(app);
    panes::register_bindings(app);
    skies::register_bindings(app);
    lenses::register_bindings(app);
    shoot::register_bindings(app);
    world::register_bindings(app);
}
