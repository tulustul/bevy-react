//! The benchmark apps' shared shell (`stress`, `layers-stress` — each
//! includes this file with `#[path]`): the `--export-bindings` exit and the
//! pure-UI `App` (no 3D scene, a plain 2D UI camera).

use std::path::PathBuf;

use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;
use bevy::window::PresentMode;
use bevy_react::{ReactAppExt, ReactUiPlugin};

/// `--export-bindings <path>` (the first arg) writes the TypeScript bindings
/// `register` declares, keeping `ui/src/bevy.ts` in sync with the Rust
/// `#[react_*]` structs, and returns `true` — the caller exits instead of
/// running the app. Needs only the registrations, so no
/// DefaultPlugins/ReactUiPlugin (no window, no JS runtime).
pub fn export_bindings(args: &[String], register: fn(&mut App)) -> bool {
    if args.first().map(String::as_str) != Some("--export-bindings") {
        return false;
    }
    let path = args
        .get(1)
        .expect("--export-bindings requires an output path");
    let mut app = App::new();
    register(&mut app);
    app.export_react_typescript(path)
        .expect("failed to write TypeScript bindings");
    println!("wrote React bindings to {path}");
    true
}

/// DefaultPlugins with a `title`d window, the React UI layer over this
/// package's `ui/dist/app.js`, and a 2D camera marked as the default UI
/// camera (`bevy_ui` needs one to render).
pub fn build_app(title: &str, hot_reload: bool, present_mode: PresentMode) -> App {
    let bundle = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("ui/dist/app.js");
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
                    title: title.to_string(),
                    present_mode,
                    ..default()
                }),
                ..default()
            })
            .set(bevy::asset::AssetPlugin {
                file_path: "../assets".into(),
                ..default()
            }),
    )
    .add_plugins(react_plugin)
    .add_systems(Startup, |mut commands: Commands| {
        commands.spawn((Camera2d, IsDefaultUiCamera));
    });
    app
}
