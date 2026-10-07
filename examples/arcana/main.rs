//! **Arcana** — the bevy-react showcase: open packs of living tarot cards.
//!
//! Everything you click is React; everything it does is Bevy:
//!
//!   * every card is a React component — and its foil is a WGSL shader
//!     running over that component's pixels (`filters.rs`, `holo`);
//!   * every card's art is a live 3D diorama rendered by its own camera
//!     into a `<portal>` (`dioramas/`);
//!   * the glass buttons refract the 3D world behind them (`liquidGlass`,
//!     a backdrop filter), and packs burn open with a morph shader (`ember`);
//!   * an inspected card leaves the UI: the same component renders onto a
//!     real 3D card via `<surface>` — spin it, it is still interactive
//!     (`inspect.rs`);
//!   * a legendary pull rings through the whole world (`stage.rs`).
//!
//! Run (from the repo root):
//!
//!   npm install && npm run build -w arcana
//!   cargo run -p arcana

mod dioramas;
mod filters;
mod inspect;
mod shoot;
mod stage;

use std::path::PathBuf;

use bevy::prelude::*;
use bevy::window::WindowResolution;
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
        title: "Arcana · bevy-react".into(),
        ..default()
    };
    if let Some(cfg) = &shoot {
        window.resolution = WindowResolution::new(cfg.size.0, cfg.size.1);
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
        .font("Space Grotesk", "fonts/SpaceGrotesk-VariableFont_wght.ttf")
        .font(
            "Dancing Script",
            "fonts/DancingScript-VariableFont_wght.ttf",
        );

    let mut app = App::new();
    app.add_plugins(DefaultPlugins.set(WindowPlugin {
        primary_window: Some(window),
        ..default()
    }))
    .add_plugins(ReactPlugins.set(react))
    .add_plugins((
        stage::StagePlugin,
        dioramas::DioramaPlugin,
        inspect::InspectPlugin,
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
    stage::register_bindings(app);
    inspect::register_bindings(app);
    shoot::register_bindings(app);
}
