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
//!   cargo run --example demos
//!
//! For hot reload, run `npm run watch -w demos-app` in another terminal and edit
//! the files under `ui/src/`.

mod anchored;
mod basic_ui;
mod bouncing_ball;
mod shared;

use std::path::PathBuf;

use bevy::asset::AssetPlugin;
use bevy::prelude::*;
use bevy_react::{ReactAppExt, ReactUiPlugin};

use anchored::AnchoredPlugin;
use basic_ui::BasicUiPlugin;
use bouncing_ball::BouncingBallPlugin;
use shared::Scene;

fn main() {
    // `cargo run --example demos -- --export-bindings <path>` writes the TypeScript
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

    // CARGO_MANIFEST_DIR is the package root, so the example's bundle lives here.
    let bundle = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("examples/demos/ui/dist/bundle.js");

    let mut app = App::new();
    app.add_plugins(
        DefaultPlugins
            .set(WindowPlugin {
                primary_window: Some(Window {
                    title: "bevy-react · demos".to_string(),
                    ..default()
                }),
                ..default()
            })
            // The example's assets (e.g. the logo) live alongside it.
            .set(AssetPlugin {
                file_path: "examples/assets".into(),
                ..default()
            }),
    )
    // We provide our own (3D) camera, so tell the plugin not to spawn a 2D one.
    .add_plugins(ReactUiPlugin::new(bundle).spawn_camera(false))
    // State must be registered after DefaultPlugins (which brings StatesPlugin).
    .init_state::<Scene>()
    .init_resource::<shared::CameraRig>()
    .add_systems(Startup, shared::setup_camera_and_light)
    // One shared camera controller (auto-orbit + mouse-drag + wheel-zoom) for every
    // scene; reframe the orbit distance to suit each scene as it becomes active.
    .add_systems(
        Update,
        (
            // After the React UI refreshes `PointerCapture` so the camera sees this
            // frame's state and ignores the mouse while the UI owns it.
            shared::orbit_camera.after(bevy_react::PointerCaptureSet),
            shared::reframe_camera.run_if(state_changed::<Scene>),
        ),
    )
    .add_plugins((BasicUiPlugin, BouncingBallPlugin, AnchoredPlugin));
    // Each scene's plugin registers its own bindings in `build`; only the global
    // scene-selection handler is left to register here.
    shared::register_bindings(&mut app);
    app.run();
}

/// Register every React binding across all demos. Used **only** by the
/// `--export-bindings` exporter, which doesn't add the demo plugins (so they
/// can't register their own bindings). The live app registers bindings via each
/// plugin's `build` instead. This must list the exact same set the plugins do,
/// so the generated TypeScript can never drift from the runtime.
fn register_react_bindings(app: &mut App) {
    shared::register_bindings(app);
    basic_ui::register_bindings(app);
    bouncing_ball::register_bindings(app);
    anchored::register_bindings(app);
}
