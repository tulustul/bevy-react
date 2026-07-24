//! Cubes running around in space: a swarm of glowing cubes looping on tilted
//! orbits around the origin while tumbling, over the dark clear color. Built
//! for the backdrop-filter demo — the moving bright shapes give the frost
//! something with real depth and motion to blur — but selectable by any demo
//! via `scene: "SpaceCubes"`.

use bevy::prelude::*;

use crate::scene::Scene;

pub struct SpaceCubesScenePlugin;

impl Plugin for SpaceCubesScenePlugin {
    fn build(&self, app: &mut App) {
        // No `register_bindings`: this scene has no React messages of its own.
        // `init_resource` keeps a config the app inserted before this plugin.
        app.init_resource::<SpaceCubesConfig>()
            .add_systems(OnEnter(Scene::SpaceCubes), spawn_cubes)
            .add_systems(Update, (orbit, tumble).run_if(in_state(Scene::SpaceCubes)));
    }
}

/// Tunables for the swarm. Override by inserting the resource (any time before
/// the scene is entered — the swarm is built in `OnEnter`):
///
/// ```ignore
/// app.insert_resource(SpaceCubesConfig { radius: 20.0, ..default() });
/// ```
#[derive(Resource, Clone)]
pub struct SpaceCubesConfig {
    /// How many cubes to spawn.
    pub count: usize,
    /// Horizontal reach of the swarm: the largest orbit radius, world units.
    pub radius: f32,
    /// Vertical half-extent of the swarm (orbit tilt + bob stay within it).
    pub half_height: f32,
    /// Cube edge length range `(min, max)`, world units.
    pub size: (f32, f32),
    /// Motion speed multiplier applied to orbits, bob, and tumble alike:
    /// `1.0` is the stock pace, `2.0` twice as fast, `0.5` half.
    pub speed: f32,
}

impl Default for SpaceCubesConfig {
    fn default() -> Self {
        Self {
            count: 150,
            radius: 14.0,
            half_height: 7.0,
            size: (0.35, 0.8),
            speed: 0.2,
        }
    }
}

/// The cube color palette (same hues as the basic cubes scene, so the gallery
/// reads as one family).
const PALETTE: [Color; 7] = [
    Color::srgb(0.48, 0.64, 0.97),
    Color::srgb(0.97, 0.46, 0.56),
    Color::srgb(0.62, 0.80, 0.42),
    Color::srgb(0.97, 0.79, 0.36),
    Color::srgb(0.73, 0.55, 0.93),
    Color::srgb(0.40, 0.85, 0.84),
    Color::srgb(0.95, 0.60, 0.40),
];

/// A cube looping on a tilted circular orbit around the origin. The orbit
/// plane is the XZ plane rotated by `tilt`; position is fully parametric in
/// absolute time, so paths are frame-rate independent and re-entry safe.
#[derive(Component)]
struct Orbiter {
    radius: f32,
    /// Angular speed along the orbit (rad/s); sign sets direction.
    speed: f32,
    phase: f32,
    /// Rotation carrying the flat orbit into its tilted plane.
    tilt: Quat,
    /// Slow vertical bob decorrelating cubes sharing an orbit plane.
    bob_amp: f32,
    bob_rate: f32,
}

/// Per-cube tumble rates around its own axes (rad/s).
#[derive(Component)]
struct Tumbler {
    x_speed: f32,
    y_speed: f32,
}

/// Spawn the swarm. All parameters derive deterministically from the cube
/// index — spread with golden-ratio-ish multipliers so orbits interleave
/// without any two cubes moving in lockstep.
fn spawn_cubes(
    mut commands: Commands,
    config: Res<SpaceCubesConfig>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    let mesh = meshes.add(Cuboid::new(1.0, 1.0, 1.0));
    let materials: Vec<_> = PALETTE
        .into_iter()
        .map(|c| {
            materials.add(StandardMaterial {
                base_color: c,
                // HDR emissive feeds the camera's bloom, like the cubes scene.
                emissive: LinearRgba::from(c) * 4.0,
                ..default()
            })
        })
        .collect();

    for i in 0..config.count {
        let f = i as f32;
        // Orbit radii fill ~18%..100% of the configured reach, denser outward
        // (sqrt keeps the area density roughly uniform instead of clumping at
        // the center).
        let radius = config.radius * (0.18 + 0.82 * (f * 0.6180).fract().sqrt());
        let speed = (0.25 + 0.35 * ((f * 0.7548).fract()))
            * config.speed
            * if i % 3 == 0 { -1.0 } else { 1.0 };
        // Vertical spread comes from the orbit-plane tilt plus the bob; cap
        // the tilt so this orbit's peak stays inside the configured half
        // height regardless of its radius.
        let bob_amp = (0.05 + 0.05 * (f * 0.91).sin().abs()) * config.half_height;
        let max_tilt = ((config.half_height - bob_amp) / radius)
            .clamp(0.0, 0.9)
            .asin();
        let tilt = Quat::from_euler(
            EulerRot::ZYX,
            (f * 1.9) % std::f32::consts::TAU,
            0.0,
            max_tilt * (f * 1.3).sin(),
        );
        let (size_min, size_max) = config.size;
        let scale = size_min + (size_max - size_min) * (f * 0.3819).fract();
        commands.spawn((
            Mesh3d(mesh.clone()),
            MeshMaterial3d(materials[i % materials.len()].clone()),
            Transform::from_scale(Vec3::splat(scale)),
            Orbiter {
                radius,
                speed,
                phase: f * 2.399, // golden angle, spreads cubes along their orbits
                tilt,
                bob_amp,
                bob_rate: (0.5 + 0.3 * ((f * 1.7).cos().abs())) * config.speed,
            },
            Tumbler {
                x_speed: (0.6 + 0.25 * (f * 0.77).sin()) * config.speed,
                y_speed: (1.1 - 0.35 * (f * 0.53).cos()) * config.speed,
            },
            DespawnOnExit(Scene::SpaceCubes),
        ));
    }
}

/// Advance each cube along its tilted orbit (writes translation only, so the
/// spawn-time scale and the tumble-driven rotation survive).
fn orbit(time: Res<Time>, mut cubes: Query<(&Orbiter, &mut Transform)>) {
    let t = time.elapsed_secs();
    for (orbiter, mut transform) in &mut cubes {
        let angle = t * orbiter.speed + orbiter.phase;
        let flat = Vec3::new(
            angle.cos() * orbiter.radius,
            (t * orbiter.bob_rate + orbiter.phase).sin() * orbiter.bob_amp,
            angle.sin() * orbiter.radius,
        );
        transform.translation = orbiter.tilt * flat;
    }
}

/// Tumble each cube around its own axes.
fn tumble(time: Res<Time>, mut cubes: Query<(&Tumbler, &mut Transform)>) {
    let dt = time.delta_secs();
    for (tumbler, mut transform) in &mut cubes {
        transform.rotate_x(tumbler.x_speed * dt);
        transform.rotate_y(tumbler.y_speed * dt);
    }
}
