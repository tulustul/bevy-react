use bevy::prelude::*;
use bevy_react::{ReactAppExt, ReactUiPlugin};

fn main() {
    // Bindings export: `cargo run -- --export-bindings ui/src/bevy.ts` builds a
    // bare App (no window or JS runtime), registers the React channels, writes the
    // typed client, and returns. The `ui/` package's `bevy:generate` script runs
    // this for you.
    let mut args = std::env::args().skip(1);
    if args.next().as_deref() == Some("--export-bindings") {
        let path = args.next().expect("--export-bindings requires an output path");
        let app = App::new();
        app.export_react_typescript(&path)
            .expect("failed to write TypeScript bindings");
        println!("wrote React bindings to {path}");
        return;
    }

    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(ReactUiPlugin::new("examples/minimal/ui/dist/app.js"))
        // `bevy_ui` needs a camera to render — the plugin doesn't spawn one.
        .add_systems(Startup, |mut commands: Commands| {
            commands.spawn(Camera2d);
        })
        .run();
}
