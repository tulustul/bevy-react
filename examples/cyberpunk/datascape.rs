//! The datascape: the 3D world behind every menu. Tilted panels of
//! scrolling dot-matrix data (`shaders/datascape.wgsl`), neon bars in red
//! and cyan, dust drifting through it all — filmed by a slowly wandering
//! camera through bloom, depth of field, chromatic aberration and a vignette.
//! It is also the default UI camera, so the menus draw over it; the graphics
//! settings (`settings.rs`) reach into this camera.

use bevy::camera::Hdr;
use bevy::post_process::bloom::Bloom;
use bevy::post_process::dof::{DepthOfField, DepthOfFieldMode};
use bevy::post_process::effect_stack::{ChromaticAberration, Vignette};
use bevy::prelude::*;
use bevy::render::render_resource::AsBindGroup;
use bevy::shader::ShaderRef;
use bevy::ui::IsDefaultUiCamera;

use crate::dioramas::SetWorld;

/// The camera that films the datascape and draws the UI (the `--shoot`
/// redirect and the settings find it by this).
#[derive(Component)]
pub struct MainCamera;

/// Where the camera wanders around, and what it looks at.
const CAMERA_AT: Vec3 = Vec3::new(0.0, 0.4, 6.5);
const LOOK_AT: Vec3 = Vec3::new(1.6, -0.3, 0.0);
/// The focal plane: the big panel on the right.
pub const FOCUS: f32 = 7.5;
/// Everything fades into this by `FOG_DISTANCE`.
const FOG: Srgba = Srgba::rgb(0.012, 0.022, 0.035);
const FOG_DISTANCE: f32 = 32.0;

pub struct DatascapePlugin;

impl Plugin for DatascapePlugin {
    fn build(&self, app: &mut App) {
        app.add_plugins(MaterialPlugin::<DataPanel>::default())
            .add_systems(Startup, spawn_datascape)
            .add_systems(Update, (wander, drift_dust))
            .add_observer(hide_while_playing);
    }
}

/// A panel of dot-matrix data (see the shader's header).
#[derive(Asset, AsBindGroup, Reflect, Clone)]
struct DataPanel {
    #[uniform(0)]
    ink: LinearRgba,
    #[uniform(1)]
    paper: LinearRgba,
    /// Characters across, lines down, scroll (lines/s), seed.
    #[uniform(2)]
    grid: Vec4,
    /// Fog color, fog distance.
    #[uniform(3)]
    fog: Vec4,
}

impl Material for DataPanel {
    fn fragment_shader() -> ShaderRef {
        "shaders/datascape.wgsl".into()
    }
}

/// Everything the camera films; hidden while the game world fills the
/// screen (nobody would see it).
#[derive(Component)]
struct Datascape;

#[derive(Component)]
struct Dust {
    base: Vec3,
    speed: f32,
    phase: f32,
}

/// A panel: where it hangs, how it turns, its size and its text.
struct Slab {
    at: Vec3,
    /// Yaw, pitch, roll in degrees.
    turn: Vec3,
    size: Vec2,
    ink: LinearRgba,
    /// Characters across, lines down, scroll speed.
    grid: Vec3,
}

/// Magenta-red glyphs, like the real thing's data walls.
const MAGENTA: LinearRgba = LinearRgba::rgb(2.2, 0.1, 0.6);
const RED: LinearRgba = LinearRgba::rgb(1.4, 0.1, 0.1);

fn slabs() -> [Slab; 3] {
    [
        // The big wall receding to the right: the focal plane.
        Slab {
            at: Vec3::new(4.6, -0.2, -1.6),
            turn: Vec3::new(-58.0, 4.0, 0.0),
            size: Vec2::new(16.0, 8.5),
            ink: MAGENTA,
            grid: Vec3::new(260.0, 110.0, 0.6),
        },
        // A second wall further back on the right.
        Slab {
            at: Vec3::new(9.0, 0.6, -9.0),
            turn: Vec3::new(-40.0, 0.0, 0.0),
            size: Vec2::new(12.0, 9.0),
            ink: RED,
            grid: Vec3::new(200.0, 110.0, 0.3),
        },
        // A panel high on the left, half hidden by the menu.
        Slab {
            at: Vec3::new(-5.5, 2.6, -5.0),
            turn: Vec3::new(40.0, -6.0, 0.0),
            size: Vec2::new(9.0, 6.0),
            ink: MAGENTA * 0.8,
            grid: Vec3::new(150.0, 70.0, 0.4),
        },
    ]
}

fn spawn_datascape(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
    mut panels: ResMut<Assets<DataPanel>>,
) {
    commands.spawn((
        Camera3d::default(),
        Camera {
            clear_color: ClearColorConfig::Custom(FOG.into()),
            ..default()
        },
        Hdr,
        Msaa::Off,
        Projection::from(PerspectiveProjection {
            fov: 60f32.to_radians(),
            ..default()
        }),
        Bloom {
            intensity: 0.28,
            ..Bloom::NATURAL
        },
        // A big sensor: at this wide angle the default one keeps everything
        // sharp; the menus want a shallow, filmic focus.
        DepthOfField {
            mode: DepthOfFieldMode::Gaussian,
            focal_distance: FOCUS,
            aperture_f_stops: 0.12,
            sensor_height: 0.06,
            max_depth: 40.0,
            ..default()
        },
        ChromaticAberration {
            intensity: 0.012,
            ..default()
        },
        Vignette {
            intensity: 0.55,
            ..default()
        },
        DistanceFog {
            color: FOG.into(),
            falloff: FogFalloff::Linear {
                start: 4.0,
                end: FOG_DISTANCE,
            },
            ..default()
        },
        Transform::from_translation(CAMERA_AT).looking_at(LOOK_AT, Vec3::Y),
        IsDefaultUiCamera,
        MainCamera,
    ));

    let root = commands
        .spawn((Datascape, Transform::default(), Visibility::default()))
        .id();
    let fog = Vec4::new(
        LinearRgba::from(FOG).red,
        LinearRgba::from(FOG).green,
        LinearRgba::from(FOG).blue,
        FOG_DISTANCE,
    );
    for (i, slab) in slabs().into_iter().enumerate() {
        let turn = slab.turn * std::f32::consts::PI / 180.0;
        commands.spawn((
            Mesh3d(meshes.add(Rectangle::from_size(slab.size))),
            MeshMaterial3d(panels.add(DataPanel {
                ink: slab.ink,
                paper: LinearRgba::rgb(0.006, 0.008, 0.014),
                grid: slab.grid.extend(17.0 + 31.0 * i as f32),
                fog,
            })),
            Transform::from_translation(slab.at).with_rotation(Quat::from_euler(
                EulerRot::YXZ,
                turn.x,
                turn.y,
                turn.z,
            )),
            ChildOf(root),
        ));
    }

    // Neon bars: long thin glowing rods, mostly out of focus.
    let rod = meshes.add(Cuboid::new(1.0, 1.0, 1.0));
    let glow = |materials: &mut Assets<StandardMaterial>, color: LinearRgba| {
        materials.add(StandardMaterial {
            base_color: Color::BLACK,
            emissive: color,
            ..default()
        })
    };
    let cyan = glow(&mut materials, LinearRgba::rgb(0.25, 3.2, 3.6));
    let red = glow(&mut materials, LinearRgba::rgb(4.2, 0.25, 0.3));
    let bars: [(Vec3, Vec3, f32, &Handle<StandardMaterial>); 7] = [
        // (center, size, yaw degrees, material)
        (
            Vec3::new(1.6, -1.55, 2.6),
            Vec3::new(5.0, 0.07, 0.07),
            -32.0,
            &cyan,
        ),
        (
            Vec3::new(2.4, -1.35, 1.6),
            Vec3::new(3.2, 0.05, 0.05),
            -32.0,
            &cyan,
        ),
        (
            Vec3::new(5.0, 1.9, -3.5),
            Vec3::new(9.0, 0.06, 0.06),
            -58.0,
            &red,
        ),
        (
            Vec3::new(5.2, 1.6, -3.4),
            Vec3::new(6.0, 0.03, 0.03),
            -58.0,
            &red,
        ),
        (
            Vec3::new(4.4, -2.0, -2.2),
            Vec3::new(8.0, 0.05, 0.05),
            -58.0,
            &red,
        ),
        (
            Vec3::new(-2.0, -0.9, -6.0),
            Vec3::new(7.0, 0.05, 0.05),
            8.0,
            &cyan,
        ),
        (
            Vec3::new(-1.0, 3.6, -9.0),
            Vec3::new(12.0, 0.08, 0.08),
            -4.0,
            &red,
        ),
    ];
    for (at, size, yaw, material) in bars {
        commands.spawn((
            Mesh3d(rod.clone()),
            MeshMaterial3d(material.clone()),
            Transform::from_translation(at)
                .with_rotation(Quat::from_rotation_y(yaw.to_radians()))
                .with_scale(size),
            ChildOf(root),
        ));
    }

    // Dust: specks of light drifting through the beams.
    let speck = meshes.add(Sphere::new(1.0).mesh().ico(1).unwrap());
    let white = glow(&mut materials, LinearRgba::rgb(2.2, 2.4, 2.6));
    let mut rng = 0x2077_u32;
    let mut next = || {
        rng ^= rng << 13;
        rng ^= rng >> 17;
        rng ^= rng << 5;
        rng as f32 / u32::MAX as f32
    };
    for _ in 0..140 {
        let base = Vec3::new(
            -4.0 + next() * 12.0,
            -2.5 + next() * 5.5,
            -6.0 + next() * 11.0,
        );
        commands.spawn((
            Mesh3d(speck.clone()),
            MeshMaterial3d(white.clone()),
            Transform::from_translation(base).with_scale(Vec3::splat(0.008 + next() * 0.014)),
            Dust {
                base,
                speed: 0.05 + next() * 0.15,
                phase: next() * 100.0,
            },
            ChildOf(root),
        ));
    }
}

/// While a game runs its world covers the screen: stop drawing ours.
fn hide_while_playing(on: On<SetWorld>, mut root: Single<&mut Visibility, With<Datascape>>) {
    **root = if on.event().lifepath.is_some() {
        Visibility::Hidden
    } else {
        Visibility::Inherited
    };
}

/// The camera wanders slowly around its post, never quite still.
fn wander(time: Res<Time>, mut camera: Query<&mut Transform, With<MainCamera>>) {
    let t = time.elapsed_secs();
    let drift = Vec3::new(
        (t * 0.071).sin() * 0.55,
        (t * 0.053).sin() * 0.22,
        (t * 0.061).cos() * 0.35,
    );
    let look = Vec3::new((t * 0.047).sin() * 0.4, (t * 0.039).cos() * 0.15, 0.0);
    for mut transform in &mut camera {
        *transform =
            Transform::from_translation(CAMERA_AT + drift).looking_at(LOOK_AT + look, Vec3::Y);
    }
}

fn drift_dust(time: Res<Time>, mut dust: Query<(&Dust, &mut Transform)>) {
    let t = time.elapsed_secs();
    for (d, mut transform) in &mut dust {
        let a = d.phase + t * d.speed;
        transform.translation = d.base
            + Vec3::new(
                (a * 0.7).sin() * 0.6,
                (a * 0.4).sin() * 0.8,
                (a * 0.5).cos() * 0.4,
            );
    }
}
