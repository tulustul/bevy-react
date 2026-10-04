use bevy::prelude::*;
use bevy_react::{ReactAppExt, react_message};

use crate::scene::Scene;

/// Upper bound on the cube count (the React UI clamps to the same range).
const MAX_CUBES: usize = 8;
const CUBE_SPACING: f32 = 2.25;

/// The cube hues every cube scene shares, so the gallery reads as one family:
/// the UI's demo-subject palette (`Colors` in `ui/src/theme.ts` — cyan, rose,
/// mint, amber, violet, sky, ember) plus a neutral.
pub(crate) const PALETTE: [Color; 8] = [
    Color::srgb_u8(0x5c, 0xd9, 0xff),
    Color::srgb_u8(0xff, 0x6b, 0x8b),
    Color::srgb_u8(0x5e, 0xe6, 0xa8),
    Color::srgb_u8(0xff, 0xc8, 0x57),
    Color::srgb_u8(0xa8, 0x8b, 0xff),
    Color::srgb_u8(0x6e, 0xa8, 0xff),
    Color::srgb_u8(0xff, 0x8a, 0x4c),
    Color::srgb_u8(0xcc, 0xd1, 0xdb),
];

pub struct CubesScenePlugin;

impl Plugin for CubesScenePlugin {
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

/// A cube tumbling around its own X and Y axes, rad/s (also the marker the
/// cubes scene counts/rebuilds).
#[derive(Component)]
pub(crate) struct Spinner {
    pub(crate) x_speed: f32,
    pub(crate) y_speed: f32,
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
    commands.insert_resource(CubeAssets {
        mesh: meshes.add(Cuboid::new(1.5, 1.5, 1.5)),
        materials: PALETTE
            .into_iter()
            .map(|c| {
                materials.add(StandardMaterial {
                    base_color: c,
                    // Push each cube's color into HDR (>1.0) so the camera's bloom
                    // pulls a soft glow off its edges. The multiplier sets glow
                    // strength; tune alongside the camera's `Bloom` intensity.
                    emissive: LinearRgba::from(c) * 4.0,
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

pub(crate) fn spin(time: Res<Time>, mut query: Query<(&mut Transform, &Spinner)>) {
    let dt = time.delta_secs();
    for (mut transform, spinner) in &mut query {
        transform.rotate_x(spinner.x_speed * dt);
        transform.rotate_y(spinner.y_speed * dt);
    }
}
