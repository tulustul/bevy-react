//! The stage: the one 3D world behind the whole UI. A camera-locked sky
//! quad (`arcana/cosmos.wgsl` — nebula, stars, the radiance under the
//! table), a giant golden astrolabe turning behind the cards, and motes of
//! light drifting up through it. The camera sways a little, so the world
//! has depth against the flat UI in front of it.
//!
//! React reaches into it with one typed message: `bevy.arcana.flare({ hue })`
//! when a legendary card turns over — the sky rings out in the card's hue
//! and the astrolabe flashes.

use bevy::post_process::bloom::Bloom;
use bevy::prelude::*;
use bevy::render::render_resource::AsBindGroup;
use bevy::shader::ShaderRef;
use bevy::ui::IsDefaultUiCamera;
use bevy_react::{ReactAppExt, react_message};

/// Where the camera looks; the inspected card hangs on the same axis.
pub const LOOK_AT: Vec3 = Vec3::new(0.0, 0.0, -2.0);
const CAMERA_AT: Vec3 = Vec3::new(0.0, 0.0, 10.0);
/// How far the camera sways around `CAMERA_AT`, world units.
const SWAY: Vec2 = Vec2::new(0.35, 0.2);

/// The sky quad: far enough to sit behind everything, big enough to cover
/// the frustum (its depth is pinned to the far plane in the shader anyway).
const SKY_DISTANCE: f32 = 60.0;
const SKY_SIZE: f32 = 400.0;

/// The astrolabe's center and its rings: (radius, tilt axis, turn speed).
const ASTROLABE_AT: Vec3 = Vec3::new(0.0, 0.3, -9.0);
const RINGS: [(f32, Vec3, f32); 4] = [
    (6.4, Vec3::X, 0.05),
    (5.5, Vec3::new(1.0, 1.0, 0.0), -0.07),
    (4.7, Vec3::new(-1.0, 0.6, 0.0), 0.09),
    (3.6, Vec3::Y, -0.12),
];
/// Emissive strength of the gold (HDR — bloom turns it into light).
const GOLD_GLOW: f32 = 3.2;

const MOTES: usize = 140;
/// The box the motes drift through (they wrap from top back to bottom).
const MOTE_BOX: Vec3 = Vec3::new(11.0, 7.0, 5.0);

/// How long a flare rings, seconds.
const FLARE_SECS: f32 = 2.4;

/// React → Bevy: a legendary card turned over. The sky fires a shockwave in
/// `hue` (0..1 around the color wheel) and the astrolabe flashes.
#[react_message(name = "arcana.flare")]
pub struct Flare {
    pub hue: f32,
}

pub struct StagePlugin;

impl Plugin for StagePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_plugins(MaterialPlugin::<CosmosMaterial>::default())
            .init_resource::<FlareState>()
            .add_systems(Startup, spawn_stage)
            .add_systems(Update, (sway_camera, turn_rings, drift_motes, drive_flare));
    }
}

/// The stage's bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(start_flare);
}

/// The sky. Everything but the flare is computed in the shader from time and
/// the view, so an idle sky costs the CPU nothing.
#[derive(Asset, AsBindGroup, Reflect, Clone)]
struct CosmosMaterial {
    /// `(hue, progress, 0, 0)`; progress parks at 1 (no flare).
    #[uniform(0)]
    flare: Vec4,
}

impl Material for CosmosMaterial {
    fn fragment_shader() -> ShaderRef {
        "arcana/cosmos.wgsl".into()
    }
}

/// The flare in flight: 0 → 1, parked at 1.
#[derive(Resource)]
struct FlareState {
    hue: f32,
    progress: f32,
}

impl Default for FlareState {
    fn default() -> Self {
        Self {
            hue: 0.0,
            progress: 1.0,
        }
    }
}

#[derive(Component)]
struct Ring {
    axis: Vec3,
    speed: f32,
}

/// The astrolabe's shared gold, flashed by a flare.
#[derive(Resource)]
struct Gold(Handle<StandardMaterial>);

#[derive(Component)]
struct Mote {
    speed: f32,
    phase: f32,
}

fn spawn_stage(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
    mut cosmos: ResMut<Assets<CosmosMaterial>>,
) {
    let sky = commands
        .spawn((
            Mesh3d(meshes.add(Rectangle::new(SKY_SIZE, SKY_SIZE))),
            MeshMaterial3d(cosmos.add(CosmosMaterial {
                flare: Vec4::new(0.0, 1.0, 0.0, 0.0),
            })),
            Transform::from_xyz(0.0, 0.0, -SKY_DISTANCE),
        ))
        .id();
    commands
        .spawn((
            Camera3d::default(),
            Camera {
                clear_color: ClearColorConfig::Custom(Color::srgb_u8(6, 4, 14)),
                ..default()
            },
            // Bloom requires HDR, so this also makes the camera HDR: the gold
            // and the motes are emissive above 1.0 and bloom into light.
            Bloom {
                intensity: 0.22,
                ..Bloom::NATURAL
            },
            Transform::from_translation(CAMERA_AT).looking_at(LOOK_AT, Vec3::Y),
            IsDefaultUiCamera,
        ))
        .add_child(sky);

    let gold = materials.add(StandardMaterial {
        base_color: Color::srgb(0.9, 0.7, 0.35),
        emissive: LinearRgba::rgb(1.0, 0.62, 0.24) * GOLD_GLOW,
        ..default()
    });
    commands.insert_resource(Gold(gold.clone()));
    let astrolabe = commands
        .spawn((
            Transform::from_translation(ASTROLABE_AT),
            Visibility::default(),
        ))
        .id();
    for (i, &(radius, axis, speed)) in RINGS.iter().enumerate() {
        let ring = commands
            .spawn((
                Mesh3d(
                    meshes.add(
                        Torus::new(radius - 0.02, radius + 0.02)
                            .mesh()
                            .minor_resolution(8)
                            .major_resolution(160),
                    ),
                ),
                MeshMaterial3d(gold.clone()),
                Transform::from_rotation(Quat::from_axis_angle(axis.normalize(), 1.1 + i as f32)),
                Ring {
                    axis: axis.normalize(),
                    speed,
                },
            ))
            .id();
        // A bead on every ring: a little planet riding the meridian.
        let bead = commands
            .spawn((
                Mesh3d(meshes.add(Sphere::new(0.09 + 0.03 * i as f32))),
                MeshMaterial3d(gold.clone()),
                Transform::from_xyz(radius, 0.0, 0.0),
            ))
            .id();
        commands.entity(ring).add_child(bead);
        commands.entity(astrolabe).add_child(ring);
    }

    let mote_mesh = meshes.add(Sphere::new(1.0).mesh().ico(1).unwrap());
    let mote_glow = [
        LinearRgba::rgb(1.0, 0.7, 0.35) * 5.0,
        LinearRgba::rgb(0.55, 0.45, 1.0) * 5.0,
        LinearRgba::rgb(0.4, 0.9, 1.0) * 4.0,
    ]
    .map(|emissive| {
        materials.add(StandardMaterial {
            base_color: Color::BLACK,
            emissive,
            ..default()
        })
    });
    for i in 0..MOTES {
        let f = i as f32;
        let r = |k: f32| (f * k).fract();
        let at = Vec3::new(
            (r(0.618_034) - 0.5) * 2.0 * MOTE_BOX.x,
            (r(0.754_878) - 0.5) * 2.0 * MOTE_BOX.y,
            -2.0 - r(0.569_840) * 2.0 * MOTE_BOX.z,
        );
        commands.spawn((
            Mesh3d(mote_mesh.clone()),
            MeshMaterial3d(mote_glow[i % mote_glow.len()].clone()),
            Transform::from_translation(at).with_scale(Vec3::splat(0.015 + 0.03 * r(0.324_718))),
            Mote {
                speed: 0.12 + 0.25 * r(0.915_773),
                phase: r(0.413_793) * std::f32::consts::TAU,
            },
        ));
    }
}

/// A slow Lissajous sway — just enough parallax to read the world as deep.
fn sway_camera(time: Res<Time>, mut camera: Single<&mut Transform, With<IsDefaultUiCamera>>) {
    let t = time.elapsed_secs();
    let at = CAMERA_AT + Vec3::new((t * 0.11).sin() * SWAY.x, (t * 0.083).sin() * SWAY.y, 0.0);
    **camera = Transform::from_translation(at).looking_at(LOOK_AT, Vec3::Y);
}

fn turn_rings(time: Res<Time>, mut rings: Query<(&Ring, &mut Transform)>) {
    for (ring, mut transform) in &mut rings {
        transform.rotate_axis(
            Dir3::new_unchecked(ring.axis),
            ring.speed * time.delta_secs(),
        );
    }
}

/// Motes rise and sway, wrapping from the top of the box back to the bottom.
fn drift_motes(time: Res<Time>, mut motes: Query<(&Mote, &mut Transform)>) {
    let (t, dt) = (time.elapsed_secs(), time.delta_secs());
    for (mote, mut transform) in &mut motes {
        let at = &mut transform.translation;
        at.y += mote.speed * dt;
        at.x += (t * 0.4 + mote.phase).sin() * 0.08 * dt;
        if at.y > MOTE_BOX.y {
            at.y -= 2.0 * MOTE_BOX.y;
        }
    }
}

fn start_flare(on: On<Flare>, mut flare: ResMut<FlareState>) {
    *flare = FlareState {
        hue: on.event().hue,
        progress: 0.0,
    };
}

/// Advance a live flare: the sky's shockwave uniform and the gold's flash.
/// A parked flare writes nothing.
fn drive_flare(
    time: Res<Time>,
    mut flare: ResMut<FlareState>,
    gold: Res<Gold>,
    sky: Query<&MeshMaterial3d<CosmosMaterial>>,
    mut cosmos: ResMut<Assets<CosmosMaterial>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    if flare.progress >= 1.0 {
        return;
    }
    flare.progress = (flare.progress + time.delta_secs() / FLARE_SECS).min(1.0);
    for handle in &sky {
        if let Some(mut m) = cosmos.get_mut(&handle.0) {
            m.flare = Vec4::new(flare.hue, flare.progress, 0.0, 0.0);
        }
    }
    if let Some(mut m) = materials.get_mut(&gold.0) {
        let flash = (1.0 - flare.progress).powi(3) * 5.0;
        m.emissive = LinearRgba::rgb(1.0, 0.62, 0.24) * GOLD_GLOW * (1.0 + flash);
    }
}
