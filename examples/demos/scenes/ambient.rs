//! The permanent full-screen backdrop: a gentle aurora — soft light curtains
//! waving over a starry night sky (see `examples/assets/shaders/ambient.wgsl`,
//! which owns all the motion/color logic). It sits behind **every** scene
//! (including the empty viewport `selectScene(null)` lands on), so each demo
//! gets living, colorful pixels behind it — which is what makes
//! `backdropFilter` frost (and layer demos in general) worth looking at.
//!
//! The Rust side is just plumbing: a camera-locked quad big enough to cover
//! the frustum, shaded by a binding-less material. The shader reads time and
//! the camera orientation from the view uniforms, so there is zero per-frame
//! CPU work; dragging the (otherwise unused) orbit camera still slides the
//! field via a fake-parallax term.

use bevy::camera::visibility::RenderLayers;
use bevy::prelude::*;
use bevy::render::render_resource::AsBindGroup;
use bevy::shader::ShaderRef;
use bevy::ui::IsDefaultUiCamera;

/// How far in front of the camera the backdrop quad sits, and its size. At
/// distance 30 the default 45° vertical fov needs ~25 world units of height;
/// 200 covers any reasonable aspect with a wide margin.
const QUAD_DISTANCE: f32 = 30.0;
const QUAD_SIZE: f32 = 200.0;

/// The aurora quad's dedicated render layer: only the main camera renders it.
/// Extra world cameras (the CrowdedCubes `FollowCam` portal camera on layer 0)
/// must not see a 200×200 quad floating at the main camera's position. Layer 1
/// is the CrowdedCubes minimap.
pub const AURORA_LAYER: usize = 2;

pub struct AmbientScenePlugin;

impl Plugin for AmbientScenePlugin {
    fn build(&self, app: &mut App) {
        // No `register_bindings`: this scene has no React messages of its own.
        // PostStartup: the main camera spawns in `Startup` (`CameraPlugin`), and
        // `spawn_backdrop`'s `Single` camera param would silently skip the
        // system if it ran first.
        app.add_plugins(MaterialPlugin::<AmbientMaterial>::default())
            .add_systems(PostStartup, spawn_backdrop);
    }
}

/// A binding-less material: the fragment shader needs only the view uniforms
/// (time, viewport, camera orientation) that every mesh pass already has.
#[derive(Asset, AsBindGroup, Reflect, Clone, Default)]
struct AmbientMaterial {}

impl Material for AmbientMaterial {
    fn fragment_shader() -> ShaderRef {
        "shaders/ambient.wgsl".into()
    }
}

/// Spawn the backdrop quad as a child of the main camera so it always fills
/// the frame regardless of orbit/drag/zoom. The shader shades by screen
/// position, so the quad's world placement only needs to cover the frustum.
fn spawn_backdrop(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<AmbientMaterial>>,
    camera: Single<Entity, With<IsDefaultUiCamera>>,
) {
    let quad = commands
        .spawn((
            Mesh3d(meshes.add(Rectangle::new(QUAD_SIZE, QUAD_SIZE))),
            MeshMaterial3d(materials.add(AmbientMaterial::default())),
            Transform::from_xyz(0.0, 0.0, -QUAD_DISTANCE),
            RenderLayers::layer(AURORA_LAYER),
        ))
        .id();
    commands.entity(*camera).add_child(quad);
}
