//! **Cyberpunk** — a homage to the front end of a certain open-world RPG,
//! built with bevy-react: the title screen, the main menu, the six-step new
//! game, saves, eight tabs of settings, the credits and the pause menu.
//!
//! Every screen is React. Everything behind and inside it is Bevy:
//!
//!   * the menus float over a 3D datascape — glowing data panels and bars
//!     filmed through bloom, depth of field and chromatic aberration
//!     (`datascape.rs`);
//!   * the difficulty and lifepath cards, the save thumbnails and the game
//!     world itself are little 3D dioramas, each filmed into a `<portal>`
//!     (`dioramas/`);
//!   * the graphics, video, gamma and sound settings really change the
//!     camera, the window and the (synthesized) audio (`settings.rs`,
//!     `sound.rs`);
//!   * the glitches are WGSL over React's pixels: a time-driven `glitch`
//!     filter and the `glitchSwap` morph every screen change runs through
//!     (`filters.rs`).
//!
//! Run (from the repo root):
//!
//!   npm install && npm run build -w cyberpunk
//!   cargo run -p cyberpunk

mod datascape;
mod dioramas;
mod filters;
mod settings;
mod shoot;
mod sound;

use std::path::PathBuf;

use bevy::prelude::*;
use bevy::window::{PresentMode, PrimaryWindow, WindowResolution};
use bevy_react::prelude::*;

/// The UI is laid out in 1080p logical pixels whatever the window size, like
/// the game's own: the window's scale factor follows its height
/// (`fit_ui_to_1080p`).
pub const UI_HEIGHT: f32 = 1080.0;

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
        title: "Cyberpunk · bevy-react".into(),
        // Starts at the scale `fit_ui_to_1080p` keeps (no first-frame jump).
        resolution: WindowResolution::new(1600, 900).with_scale_factor_override(900.0 / UI_HEIGHT),
        // The web build's canvas fills the page (`ui/index.html`).
        fit_canvas_to_parent: true,
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
    // Rajdhani ships as static weights, so each one is its own family.
    let react = ReactUiPlugin::new(bundle)
        .hot_reload(hot_reload)
        .default_font("fonts/Rajdhani-Medium.ttf")
        .font("Rajdhani SemiBold", "fonts/Rajdhani-SemiBold.ttf")
        .font("Rajdhani Bold", "fonts/Rajdhani-Bold.ttf")
        .font("Mono", "fonts/JetBrainsMonoNL-VariableFont_wght.ttf")
        .cursor("default", "cursor.png", (24, 24));

    let mut app = App::new();
    app.add_plugins(DefaultPlugins.set(WindowPlugin {
        primary_window: Some(window),
        ..default()
    }))
    .add_plugins(ReactPlugins.set(react))
    .add_plugins((
        datascape::DatascapePlugin,
        dioramas::DioramaPlugin,
        settings::SettingsPlugin,
        sound::SoundPlugin,
    ))
    .add_systems(Update, fit_ui_to_1080p);
    filters::register_bindings(&mut app);
    register_app_bindings(&mut app);
    app
}

/// Every React binding the app registers — the exporter's single source, so
/// the generated `bevy.ts` can't drift from the running app (each plugin
/// calls its own `register_bindings` in `build`).
fn register_bindings(app: &mut App) {
    ReactPlugins::register_bindings(app);
    filters::register_bindings(app);
    register_app_bindings(app);
    dioramas::register_bindings(app);
    settings::register_bindings(app);
    sound::register_bindings(app);
    shoot::register_bindings(app);
}

/// React → Bevy: QUIT GAME, confirmed.
#[react_message(name = "app.quit")]
pub struct Quit;

fn register_app_bindings(app: &mut App) {
    app.add_react_handler(quit);
}

fn quit(_: On<Quit>, mut exit: MessageWriter<AppExit>) {
    exit.write(AppExit::Success);
}

/// Keep the window's logical height at [`UI_HEIGHT`]: the scale factor
/// follows the physical height, so the menus keep their proportions (and
/// stay crisp) at any resolution. Compare-before-write, so a settled window
/// is never touched.
///
/// bevy_winit answers an override change by resizing the window to keep its
/// logical size. On the web that resize would fix the canvas at a px size,
/// so `ui/index.html` pins the canvas to the page with `!important`.
fn fit_ui_to_1080p(mut windows: Query<&mut Window, With<PrimaryWindow>>) {
    for mut window in &mut windows {
        let height = window.resolution.physical_height();
        if height == 0 {
            continue;
        }
        let scale = height as f32 / UI_HEIGHT;
        if window
            .resolution
            .scale_factor_override()
            .is_none_or(|s| (s - scale).abs() > 1e-4)
        {
            window.resolution.set_scale_factor_override(Some(scale));
        }
    }
}
