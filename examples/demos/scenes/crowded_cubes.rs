use std::f32::consts::{PI, TAU};

use bevy::camera::ScalingMode;
use bevy::camera::visibility::RenderLayers;
use bevy::image::Image;
use bevy::prelude::*;
use bevy_react::{
    PortalCamera, ReactAppExt, ReactEvents, RenderMode, RenderTargetSpec, RenderTargets,
    Resolution, react_event, react_message,
};
use serde::Serialize;
use ts_rs::TS;

use crate::scene::Scene;

/// The two render-target names this scene drives. React displays them with
/// `<portal target="follow" />` / `<portal target="minimap" />`.
const FOLLOW: &str = "follow";
const MINIMAP: &str = "minimap";

/// Render layer the minimap's 2D camera and its sprite markers live on, so they
/// are isolated from the 3D world (the main + follow cameras stay on layer 0).
const MINIMAP_LAYER: usize = 1;

/// How many cubes wander the plane (each gets its own anchored badge).
const CUBE_COUNT: usize = 100;
/// Half-extent of the square the cubes roam, in world units.
const PLANE_HALF: f32 = 12.0;
const CUBE_SIZE: f32 = 0.6;
/// Total spread of per-cube random size (centered on 1.0), so scales land in
/// `[1 - SIZE_VARIATION/2, 1 + SIZE_VARIATION/2]` — a 30% spread.
const SIZE_VARIATION: f32 = 0.30;

pub struct CrowdedCubesScenePlugin;

impl Plugin for CrowdedCubesScenePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.init_resource::<FollowTarget>()
            .init_resource::<Cubes>()
            .add_systems(Startup, setup_cube_assets)
            .add_systems(OnEnter(Scene::CrowdedCubes), spawn_cubes)
            .add_systems(
                Update,
                (wander, follow_camera, sync_minimap_markers).run_if(in_state(Scene::CrowdedCubes)),
            );
    }
}

/// Register this demo's React bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    // Bevy -> React event: hands React every cube's entity so it can anchor a badge.
    app.add_react_event::<CubesSpawned>();
    // React -> Bevy controls for the follow portal.
    app.add_react_handler(on_follow_random);
    app.add_react_handler(on_set_follow_mode);
}

/// React asks the follow portal to track a different (pseudo-random) cube.
#[react_message(name = "crowdedCubes.followRandom")]
struct FollowRandom;

/// React toggles the follow portal between continuous (`true` → [`RenderMode::Live`])
/// and static (`false` → [`RenderMode::Snapshot`]) rendering.
#[react_message(name = "crowdedCubes.setFollowMode")]
struct SetFollowMode(bool);

/// The cube the follow portal currently tracks.
#[derive(Resource, Default)]
struct FollowTarget(Option<Entity>);

/// Every wandering cube, in spawn order — the pool `followRandom` picks from.
#[derive(Resource, Default)]
struct Cubes(Vec<Entity>);

/// Marks the follow portal's camera so [`follow_camera`] moves only it (not the
/// minimap camera or the shared main camera).
#[derive(Component)]
struct FollowCam;

/// Point the follow portal at a different cube and re-snapshot it. Picks a
/// pseudo-random index via the same cheap [`hash01`] the cubes are seeded with,
/// advancing a counter so repeated clicks keep moving.
fn on_follow_random(
    _: On<FollowRandom>,
    cubes: Res<Cubes>,
    mut follow: ResMut<FollowTarget>,
    mut targets: ResMut<RenderTargets>,
    mut nth: Local<u32>,
) {
    if cubes.0.is_empty() {
        return;
    }
    *nth = nth.wrapping_add(1);
    let idx = (hash01(*nth) * cubes.0.len() as f32) as usize % cubes.0.len();
    follow.0 = Some(cubes.0[idx]);
    targets.invalidate(FOLLOW); // re-render the (possibly frozen) snapshot
}

/// Switch the follow portal between live and snapshot rendering.
fn on_set_follow_mode(ev: On<SetFollowMode>, mut targets: ResMut<RenderTargets>) {
    let mode = if ev.event().0 {
        RenderMode::Live
    } else {
        RenderMode::Snapshot
    };
    targets.set_mode(FOLLOW, mode);
}

#[react_event(name = "crowdedCubes.spawned")]
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
    /// The raw palette colors (parallel to `materials`), reused for the flat 2D
    /// minimap sprite markers so a marker matches its cube.
    colors: Vec<Color>,
    ground: Handle<Mesh>,
    ground_material: Handle<StandardMaterial>,
}

/// A flat square on the 2D minimap, tracking the world position of `0` (a cube).
#[derive(Component)]
struct MinimapMarker(Entity);

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
            .iter()
            .map(|&c| {
                materials.add(StandardMaterial {
                    base_color: c,
                    ..default()
                })
            })
            .collect(),
        colors: palette.to_vec(),
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

#[allow(clippy::too_many_arguments)]
fn spawn_cubes(
    mut commands: Commands,
    assets: Res<CubeAssets>,
    mut render_targets: ResMut<RenderTargets>,
    mut images: ResMut<Assets<Image>>,
    mut follow: ResMut<FollowTarget>,
    mut cube_pool: ResMut<Cubes>,
    events: ReactEvents,
) {
    commands.spawn((
        Mesh3d(assets.ground.clone()),
        MeshMaterial3d(assets.ground_material.clone()),
        Transform::from_xyz(0.0, 0.0, 0.0),
        DespawnOnExit(Scene::CrowdedCubes),
    ));

    let mut cubes = Vec::with_capacity(CUBE_COUNT);
    let mut entities = Vec::with_capacity(CUBE_COUNT);
    for i in 0..CUBE_COUNT {
        let seed = i as u32;
        let x = (hash01(seed.wrapping_mul(2).wrapping_add(1)) * 2.0 - 1.0) * PLANE_HALF;
        let z = (hash01(seed.wrapping_mul(2).wrapping_add(7)) * 2.0 - 1.0) * PLANE_HALF;
        // A uniform per-cube scale in `[0.85, 1.15]`; the cube's half-height scales
        // with it, so raise its center to keep it resting on the ground.
        let scale = 1.0 + (hash01(seed.wrapping_mul(13).wrapping_add(23)) - 0.5) * SIZE_VARIATION;
        let entity = commands
            .spawn((
                Mesh3d(assets.mesh.clone()),
                MeshMaterial3d(assets.materials[i % assets.materials.len()].clone()),
                Transform::from_xyz(x, CUBE_SIZE * scale / 2.0, z).with_scale(Vec3::splat(scale)),
                Wander {
                    heading: hash01(seed.wrapping_mul(3).wrapping_add(11)) * TAU,
                    speed: 1.0 + hash01(seed.wrapping_mul(5).wrapping_add(13)) * 1.5,
                    wobble_freq: 0.5 + hash01(seed.wrapping_mul(11).wrapping_add(19)),
                    phase: hash01(seed.wrapping_mul(7).wrapping_add(17)) * TAU,
                },
                DespawnOnExit(Scene::CrowdedCubes),
            ))
            .id();
        entities.push(entity);
        cubes.push(CubeInfo {
            entity: entity.to_bits(),
            label: format!("#{i}"),
        });

        // A flat square on the 2D minimap, on its own render layer so only the
        // minimap's 2D camera sees it. `sync_minimap_markers` keeps it on top of
        // the cube each frame.
        commands.spawn((
            Sprite {
                color: assets.colors[i % assets.colors.len()],
                custom_size: Some(Vec2::splat(CUBE_SIZE * 1.4 * scale)),
                ..default()
            },
            Transform::from_xyz(x, -z, 0.0),
            RenderLayers::layer(MINIMAP_LAYER),
            MinimapMarker(entity),
            DespawnOnExit(Scene::CrowdedCubes),
        ));
    }
    follow.0 = entities.first().copied();
    cube_pool.0 = entities;

    spawn_portal_cameras(&mut commands, &mut render_targets, &mut images);

    events.send(&CubesSpawned { cubes });
}

/// Create the two render targets and the cameras that draw into them. Both
/// cameras see the same cube field (no render layers); only their target image,
/// projection, and viewpoint differ. The follow camera is a [`RenderMode::Snapshot`]
/// chase cam (React drives its target + mode); the minimap is a [`RenderMode::Live`]
/// orthographic top-down view.
fn spawn_portal_cameras(
    commands: &mut Commands,
    render_targets: &mut RenderTargets,
    images: &mut Assets<Image>,
) {
    let follow = render_targets.create(
        images,
        FOLLOW,
        RenderTargetSpec {
            mode: RenderMode::Snapshot,
            ..default()
        },
    );
    commands.spawn((
        Camera3d::default(),
        Camera {
            clear_color: ClearColorConfig::Custom(Color::srgb(0.10, 0.11, 0.16)),
            ..default()
        },
        follow.camera_target(),
        PortalCamera(FOLLOW.into()),
        FollowCam,
        // Positioned by `follow_camera` each frame; a sensible initial pose.
        Transform::from_xyz(0.0, 3.0, 6.0).looking_at(Vec3::ZERO, Vec3::Y),
        DespawnOnExit(Scene::CrowdedCubes),
    ));

    // The minimap is a flat 2D view: a `Camera2d` rendering only the sprite
    // markers (on `MINIMAP_LAYER`), so the cubes read as plain squares with no
    // lighting or shadows. The world XZ plane maps to the 2D XY plane in
    // `sync_minimap_markers`.
    let minimap = render_targets.create(
        images,
        MINIMAP,
        RenderTargetSpec {
            size: Resolution::Auto,
            mode: RenderMode::Live,
            ..default()
        },
    );
    let span = 2.0 * PLANE_HALF + 4.0;
    commands.spawn((
        Camera2d,
        Camera {
            clear_color: ClearColorConfig::Custom(Color::srgb(0.08, 0.08, 0.11)),
            ..default()
        },
        minimap.camera_target(),
        Projection::Orthographic(OrthographicProjection {
            scaling_mode: ScalingMode::FixedVertical {
                viewport_height: span,
            },
            ..OrthographicProjection::default_2d()
        }),
        RenderLayers::layer(MINIMAP_LAYER),
        PortalCamera(MINIMAP.into()),
        DespawnOnExit(Scene::CrowdedCubes),
    ));
}

/// Keep each minimap marker over its cube: project the cube's world XZ onto the
/// 2D minimap plane (`x → x`, `z → -y`, so +Z world reads as "up").
fn sync_minimap_markers(
    cubes: Query<&Transform, (With<Wander>, Without<MinimapMarker>)>,
    mut markers: Query<(&MinimapMarker, &mut Transform)>,
) {
    for (marker, mut t) in &mut markers {
        if let Ok(cube) = cubes.get(marker.0) {
            t.translation.x = cube.translation.x;
            t.translation.y = -cube.translation.z;
        }
    }
}

/// Keep the follow camera behind the cube it tracks, along the cube's own facing
/// direction (a chase cam), slightly raised and looking the way the cube looks.
/// Runs every frame; whether that view is *rendered* is gated by the target's mode
/// (live follows continuously; snapshot freezes the last render).
fn follow_camera(
    follow: Res<FollowTarget>,
    cubes: Query<&Transform, (With<Wander>, Without<FollowCam>)>,
    mut cam: Query<&mut Transform, With<FollowCam>>,
) {
    let Some(target) = follow.0 else { return };
    let Ok(cube) = cubes.get(target) else { return };
    // Sit behind the cube along its forward direction (and a bit above), so the
    // camera swings around to face wherever the cube is heading.
    let behind = cube.translation - cube.forward() * 4.0 + Vec3::Y * 2.0;
    for mut t in &mut cam {
        t.translation = behind;
        t.look_at(cube.translation, Vec3::Y);
    }
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

        // Face the (now finalized) travel direction; `look_to` sets only the
        // rotation, so the per-cube spawn scale is preserved.
        transform.look_to(Vec3::new(w.heading.cos(), 0.0, w.heading.sin()), Vec3::Y);
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
