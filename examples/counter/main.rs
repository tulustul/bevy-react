//! Example consumer of the `bevy_react` library: a Bevy app whose UI is a React
//! app (see `app/`), overlaid on a live 3D scene. The React counter drives how
//! many spinning cubes are in the scene — proof that React state flows into the
//! Bevy ECS, not just the UI. Run with:
//!
//!   npm install && npm run build -w counter-app   # build the React bundle
//!   cargo run --example counter
//!
//! For hot reload, run `npm run watch -w counter-app` in another terminal and
//! edit `app/src/App.tsx`.

use std::path::PathBuf;

use bevy::asset::AssetPlugin;
use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;
use bevy_react::{
    ReactAppExt, ReactEvents, ReactUiPlugin, Request, react_event, react_message, react_request,
};
use serde::Serialize;
use ts_rs::TS;

/// Upper bound on the cube count (the React UI clamps to the same range).
const MAX_CUBES: usize = 8;
const CUBE_SPACING: f32 = 2.25;

fn main() {
    // `cargo run --example counter -- --export-bindings <path>` writes the TypeScript
    // message types instead of running the app, keeping `ui/src/messages.ts` in sync
    // with the Rust `#[react_message]` structs. It needs only the handler registrations,
    // so it skips DefaultPlugins/ReactUiPlugin (no window, no JS runtime).
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
    let bundle =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("examples/counter/ui/dist/bundle.js");

    let mut app = App::new();
    app.add_plugins(
        DefaultPlugins
            .set(WindowPlugin {
                primary_window: Some(Window {
                    title: "bevy-react · counter".to_string(),
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
    .insert_resource(DesiredCubes(3))
    .add_systems(Startup, setup_scene)
    .add_systems(Update, (sync_cubes, spin, notify_cube_changes));
    register_react_bindings(&mut app);
    app.run();
}

/// Register every React binding the app uses — messages, requests, and events.
/// Shared by `main` (the live app) and the `--export-bindings` exporter so the
/// generated TypeScript can never list a binding Bevy doesn't have, or miss one.
fn register_react_bindings(app: &mut App) {
    // React -> Bevy notify: `emit("count", n)` → typed `Count`, handled by `apply_count`.
    app.add_react_handler(apply_count);
    // React -> Bevy request: `await bevy.cubes.get()` → typed `CubeReport`.
    app.add_react_request_handler(report_cubes);
    // Bevy -> React event: `bevy.on("cubes.changed", …)`.
    app.add_react_event::<CubesChanged>();
}

/// The React counter value, emitted as `emit("count", n)`. A newtype because the
/// payload is a bare JSON number, not an object; `#[react_message]` defaults the
/// emit name to `"count"`.
#[react_message]
struct Count(usize);

/// React asks how many cubes there are: `await bevy.cubes.get()`. A unit payload,
/// so the generated proxy method takes no argument.
#[react_request(name = "cubes.get", response = CubeReport)]
struct CubesGet;

/// The reply to [`CubesGet`].
#[derive(Serialize, TS)]
struct CubeReport {
    count: usize,
}

/// Bevy tells React the cube count changed: `bevy.on("cubes.changed", …)`.
#[react_event(name = "cubes.changed")]
struct CubesChanged {
    count: usize,
}

/// How many cubes should currently exist, driven by the React count.
#[derive(Resource)]
struct DesiredCubes(usize);

/// Shared cube mesh + a color palette, created once.
#[derive(Resource)]
struct CubeAssets {
    mesh: Handle<Mesh>,
    materials: Vec<Handle<StandardMaterial>>,
}

/// A cube that rotates every frame (also the marker we count/rebuild).
#[derive(Component)]
struct Spinner {
    x_speed: f32,
    y_speed: f32,
}

/// Spawn the camera + light and create the cube assets. Cubes themselves are
/// spawned by `sync_cubes` to match `DesiredCubes`.
fn setup_scene(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    // Single camera → bevy_ui targets it automatically; `IsDefaultUiCamera`
    // makes that explicit.
    commands.spawn((
        Camera3d::default(),
        Transform::from_xyz(0.0, 2.0, 11.0).looking_at(Vec3::ZERO, Vec3::Y),
        IsDefaultUiCamera,
    ));

    commands.spawn((
        DirectionalLight {
            illuminance: 6_000.0,
            shadow_maps_enabled: true,
            ..default()
        },
        Transform::from_xyz(4.0, 8.0, 6.0).looking_at(Vec3::ZERO, Vec3::Y),
    ));

    let palette = [
        Color::srgb(0.48, 0.64, 0.97),
        Color::srgb(0.97, 0.46, 0.56),
        Color::srgb(0.62, 0.80, 0.42),
        Color::srgb(0.97, 0.79, 0.36),
        Color::srgb(0.73, 0.55, 0.93),
        Color::srgb(0.40, 0.85, 0.84),
        Color::srgb(0.95, 0.60, 0.40),
        Color::srgb(0.80, 0.80, 0.85),
    ];
    commands.insert_resource(CubeAssets {
        mesh: meshes.add(Cuboid::new(1.5, 1.5, 1.5)),
        materials: palette
            .into_iter()
            .map(|c| {
                materials.add(StandardMaterial {
                    base_color: c,
                    ..default()
                })
            })
            .collect(),
    });
}

/// Update the desired cube count when a typed `Count` is triggered.
fn apply_count(count: On<Count>, mut desired: ResMut<DesiredCubes>) {
    desired.0 = count.event().0.min(MAX_CUBES);
    debug!("react count -> desired cubes {}", desired.0);
}

/// Answer a React `bevy.cubes.get()` request with the current desired count.
fn report_cubes(req: On<Request<CubesGet>>, desired: Res<DesiredCubes>) {
    req.respond(CubeReport { count: desired.0 });
}

/// Push a `cubes.changed` event to React whenever the desired count changes.
fn notify_cube_changes(desired: Res<DesiredCubes>, events: ReactEvents) {
    if desired.is_changed() {
        events.send(&CubesChanged { count: desired.0 });
    }
}

/// Rebuild the row of cubes whenever the live count differs from the desired
/// count, spreading them evenly along X and centered on the origin.
fn sync_cubes(
    mut commands: Commands,
    desired: Res<DesiredCubes>,
    assets: Res<CubeAssets>,
    cubes: Query<Entity, With<Spinner>>,
) {
    let current = cubes.iter().count();
    if current == desired.0 {
        return;
    }
    debug!("syncing cubes {} -> {}", current, desired.0);
    for entity in &cubes {
        commands.entity(entity).despawn();
    }
    let n = desired.0;
    for i in 0..n {
        let x = (i as f32 - (n as f32 - 1.0) / 2.0) * CUBE_SPACING;
        commands.spawn((
            Mesh3d(assets.mesh.clone()),
            MeshMaterial3d(assets.materials[i % assets.materials.len()].clone()),
            Transform::from_xyz(x, 0.0, 0.0),
            Spinner {
                x_speed: 0.4 + i as f32 * 0.15,
                y_speed: 0.9 - i as f32 * 0.08,
            },
        ));
    }
}

fn spin(time: Res<Time>, mut query: Query<(&mut Transform, &Spinner)>) {
    let dt = time.delta_secs();
    for (mut transform, spinner) in &mut query {
        transform.rotate_x(spinner.x_speed * dt);
        transform.rotate_y(spinner.y_speed * dt);
    }
}
