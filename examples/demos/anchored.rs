//! Demo 5 — **World-anchored UI**. A field of ~100 cubes wanders on a plane, and
//! React renders a badge floating above each one via `<Anchored.node entity={…}/>`.
//! When the cubes spawn, Bevy pushes their entity ids to React in one
//! `anchoredDemo.cubesSpawned` event; the anchor positioning system then projects
//! each entity's world position to the screen every frame. Left-drag orbits the
//! camera; a checkbox toggles distance-based scaling of the badges.

use std::f32::consts::{PI, TAU};

use bevy::prelude::*;
use bevy_react::{ReactAppExt, ReactEvents, react_event};
use serde::Serialize;
use ts_rs::TS;

use crate::shared::Demo;

/// How many cubes wander the plane (each gets its own anchored badge).
const CUBE_COUNT: usize = 100;
/// Half-extent of the square the cubes roam, in world units.
const PLANE_HALF: f32 = 12.0;
const CUBE_SIZE: f32 = 0.6;

pub struct AnchoredPlugin;

impl Plugin for AnchoredPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_systems(Startup, setup_cube_assets)
            .add_systems(OnEnter(Demo::WorldAnchors), spawn_cubes)
            .add_systems(Update, wander.run_if(in_state(Demo::WorldAnchors)));
    }
}

/// Register this demo's React bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    // Bevy -> React event: hands React every cube's entity so it can anchor a badge.
    app.add_react_event::<CubesSpawned>();
}

/// Bevy tells React the cubes are ready: `bevy.on("anchoredDemo.cubesSpawned", …)`.
/// Carries the whole list so React can render the badges in one go, with no poll.
#[react_event(name = "anchoredDemo.cubesSpawned")]
struct CubesSpawned {
    cubes: Vec<CubeInfo>,
}

/// One cube in [`CubesSpawned`]: its `Entity` (as bits, for `Anchored.node`) and a
/// short label to show in the badge.
#[derive(Serialize, TS)]
struct CubeInfo {
    entity: u64,
    label: String,
}

/// Per-cube random-walk state: a heading that gently wobbles over time.
#[derive(Component)]
struct Wander {
    heading: f32,
    speed: f32,
    wobble_freq: f32,
    phase: f32,
}

/// Shared cube mesh + color palette and the ground plane, created once.
#[derive(Resource)]
struct CubeAssets {
    mesh: Handle<Mesh>,
    materials: Vec<Handle<StandardMaterial>>,
    ground: Handle<Mesh>,
    ground_material: Handle<StandardMaterial>,
}

/// Create the shared cube mesh, color palette, and ground plane once at startup.
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
        mesh: meshes.add(Cuboid::new(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)),
        materials: palette
            .into_iter()
            .map(|c| {
                materials.add(StandardMaterial {
                    base_color: c,
                    ..default()
                })
            })
            .collect(),
        ground: meshes.add(
            Plane3d::default()
                .mesh()
                .size(2.0 * PLANE_HALF + 4.0, 2.0 * PLANE_HALF + 4.0),
        ),
        ground_material: materials.add(StandardMaterial {
            base_color: Color::srgb(0.14, 0.14, 0.19),
            ..default()
        }),
    });
}

/// Spawn the ground plane and `CUBE_COUNT` cubes at pseudo-random positions and
/// headings (seeded by index, so no `rand` dependency), then push their entity ids
/// to React in one `anchoredDemo.cubesSpawned` event. All cubes are scoped to the
/// demo. React subscribed on mount (before it emitted `selectDemo`, which drove this
/// `OnEnter`), so the event always lands.
fn spawn_cubes(mut commands: Commands, assets: Res<CubeAssets>, events: ReactEvents) {
    commands.spawn((
        Mesh3d(assets.ground.clone()),
        MeshMaterial3d(assets.ground_material.clone()),
        Transform::from_xyz(0.0, 0.0, 0.0),
        DespawnOnExit(Demo::WorldAnchors),
    ));

    let mut cubes = Vec::with_capacity(CUBE_COUNT);
    for i in 0..CUBE_COUNT {
        let seed = i as u32;
        let x = (hash01(seed.wrapping_mul(2).wrapping_add(1)) * 2.0 - 1.0) * PLANE_HALF;
        let z = (hash01(seed.wrapping_mul(2).wrapping_add(7)) * 2.0 - 1.0) * PLANE_HALF;
        let entity = commands
            .spawn((
                Mesh3d(assets.mesh.clone()),
                MeshMaterial3d(assets.materials[i % assets.materials.len()].clone()),
                Transform::from_xyz(x, CUBE_SIZE / 2.0, z),
                Wander {
                    heading: hash01(seed.wrapping_mul(3).wrapping_add(11)) * TAU,
                    speed: 1.0 + hash01(seed.wrapping_mul(5).wrapping_add(13)) * 1.5,
                    wobble_freq: 0.5 + hash01(seed.wrapping_mul(11).wrapping_add(19)),
                    phase: hash01(seed.wrapping_mul(7).wrapping_add(17)) * TAU,
                },
                DespawnOnExit(Demo::WorldAnchors),
            ))
            .id();
        cubes.push(CubeInfo {
            entity: entity.to_bits(),
            label: format!("#{i}"),
        });
    }

    events.send(&CubesSpawned { cubes });
}

/// Advance each cube along its heading, wobbling the heading over time so the path
/// meanders, and reflecting off the plane edges to stay in bounds.
fn wander(time: Res<Time>, mut cubes: Query<(&mut Transform, &mut Wander)>) {
    let dt = time.delta_secs();
    let t = time.elapsed_secs();
    for (mut transform, mut w) in &mut cubes {
        w.heading += (t * w.wobble_freq + w.phase).sin() * dt * 1.5;
        let dir = Vec3::new(w.heading.cos(), 0.0, w.heading.sin());
        transform.translation += dir * w.speed * dt;

        if transform.translation.x.abs() > PLANE_HALF {
            transform.translation.x = transform.translation.x.clamp(-PLANE_HALF, PLANE_HALF);
            w.heading = PI - w.heading; // reflect the X component of the heading
        }
        if transform.translation.z.abs() > PLANE_HALF {
            transform.translation.z = transform.translation.z.clamp(-PLANE_HALF, PLANE_HALF);
            w.heading = -w.heading; // reflect the Z component of the heading
        }
    }
}

/// A cheap integer hash → `[0, 1)`, for seeding cube positions/motion by index.
fn hash01(n: u32) -> f32 {
    let mut x = n.wrapping_mul(2_654_435_761);
    x ^= x >> 15;
    x = x.wrapping_mul(2_246_822_519);
    x ^= x >> 13;
    x = x.wrapping_mul(3_266_489_917);
    x ^= x >> 16;
    (x as f32) / (u32::MAX as f32 + 1.0)
}
