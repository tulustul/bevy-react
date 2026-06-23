//! **Cubes** scene (Basic UI). The React counter emits a number
//! (`bevy.basicDemo.setCount(n)`) and Bevy shows that many spinning cubes. Pure
//! one-way `emit`; no requests or events. This is the original counter example,
//! now a state-scoped plugin.

use bevy::prelude::*;
use bevy_react::{ReactAppExt, react_message};

use crate::shared::Scene;

/// Upper bound on the cube count (the React UI clamps to the same range).
const MAX_CUBES: usize = 8;
const CUBE_SPACING: f32 = 2.25;

pub struct BasicUiPlugin;

impl Plugin for BasicUiPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.insert_resource(DesiredCubes(3))
            .add_systems(Startup, setup_cube_assets)
            .add_systems(Update, (sync_cubes, spin).run_if(in_state(Scene::Cubes)));
    }
}

/// Register this demo's React bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    // React -> Bevy notify: `bevy.basicDemo.setCount(n)` → typed `SetCount`,
    // handled by `apply_set_count`.
    app.add_react_handler(apply_set_count);
}

/// The React counter value, sent as `bevy.basicDemo.setCount(n)`. A newtype
/// because the payload is a bare JSON number; the dotted name nests the method
/// under `bevy.basicDemo` in the generated proxy.
#[react_message(name = "basicDemo.setCount")]
struct SetCount(usize);

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

/// Update the desired cube count when a typed `SetCount` is triggered.
fn apply_set_count(count: On<SetCount>, mut desired: ResMut<DesiredCubes>) {
    desired.0 = count.event().0.min(MAX_CUBES);
    debug!("react count -> desired cubes {}", desired.0);
}

/// Create the shared cube mesh + color palette once at startup.
fn setup_cube_assets(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
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

/// Rebuild the row of cubes whenever the live count differs from the desired
/// count, spreading them evenly along X and centered on the origin. Cubes are
/// scoped to `Scene::Cubes` so they despawn when another scene is selected.
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
            DespawnOnExit(Scene::Cubes),
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
