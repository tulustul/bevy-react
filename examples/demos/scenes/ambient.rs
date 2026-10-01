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
use bevy_react::{ReactAppExt, react_message};

/// How far in front of the camera the backdrop quad sits, and its size. At
/// distance 30 the default 45° vertical fov needs ~25 world units of height;
/// 200 covers any reasonable aspect with a wide margin. The distance only
/// governs pixel coverage, not occlusion: the fragment shader pins its depth
/// to the far plane, so scene geometry beyond 30 units still draws in front.
const QUAD_DISTANCE: f32 = 30.0;
const QUAD_SIZE: f32 = 200.0;

/// The aurora quad's dedicated render layer: only the main camera renders it.
/// Extra world cameras (the CrowdedCubes `FollowCam` portal camera on layer 0)
/// must not see a 200×200 quad floating at the main camera's position. Layer 1
/// is the CrowdedCubes minimap.
pub const AURORA_LAYER: usize = 2;

/// How long one burst takes to play out, in seconds. The burst decays on its
/// own, so nothing has to cancel it: the home page fires and forgets, and a
/// burst you trigger just before navigating finishes over the next page.
const BURST_SECS: f32 = 2.0;

/// React → Bevy: set the aurora alight (`bevy.nebula.burst({ hue })`). The
/// home page's "Typed messages" tile fires this on click — the sky changing
/// **is** the message arriving. Fire-and-forget: there is no reply.
#[react_message(name = "nebula.burst")]
pub struct NebulaBurst {
    /// Where on the color wheel the shockwave lands, 0..1.
    pub hue: f32,
}

/// Register the burst handler (shared by the live app and the
/// `--export-bindings` exporter).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(start_burst);
}

/// The live burst, if any. `progress` runs 0→1 over [`BURST_SECS`] and then
/// parks at 1.0, which the shader reads as "no burst" — so the decay needs no
/// cancel path and no lifecycle beyond this one float.
#[derive(Resource)]
struct Burst {
    hue: f32,
    progress: f32,
}

/// Idle, not mid-burst. A derived `Default` would give `progress: 0.0`, which
/// reads as "a burst is playing" — and the app would fire a full shockwave at
/// hue 0 on every launch before anyone had clicked anything.
impl Default for Burst {
    fn default() -> Self {
        Self {
            hue: 0.0,
            progress: Self::IDLE,
        }
    }
}

impl Burst {
    /// Progress parked at (or past) 1.0 — the shader contributes nothing.
    const IDLE: f32 = 1.0;

    fn is_active(&self) -> bool {
        self.progress < Self::IDLE
    }
}

pub struct AmbientScenePlugin;

impl Plugin for AmbientScenePlugin {
    fn build(&self, app: &mut App) {
        // The live app registers its own bindings here; the `--export-bindings`
        // path builds a bare `App` without this plugin and goes through the
        // aggregator in `main` instead — both call the same function, which is
        // what keeps the generated typing and the runtime in step.
        register_bindings(app);
        // PostStartup: the main camera spawns in `Startup` (`CameraPlugin`),
        // and `spawn_backdrop`'s `Single` camera param would silently skip the
        // system if it ran first.
        app.add_plugins(MaterialPlugin::<AmbientMaterial>::default())
            .init_resource::<Burst>()
            .add_systems(PostStartup, spawn_backdrop)
            .add_systems(Update, drive_burst);
    }
}

/// The aurora itself needs no bindings — the fragment shader gets time,
/// viewport and camera orientation from the view uniforms every mesh pass
/// already has. The one uniform is the burst: `(hue, progress, 0, 0)`, written
/// only while a burst is playing.
#[derive(Asset, AsBindGroup, Reflect, Clone)]
struct AmbientMaterial {
    #[uniform(0)]
    burst: Vec4,
}

impl Default for AmbientMaterial {
    fn default() -> Self {
        Self {
            burst: Vec4::new(0.0, Burst::IDLE, 0.0, 0.0),
        }
    }
}

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

/// A click on the home page's "Typed messages" tile: restart the shockwave at
/// the requested hue. Re-firing mid-burst restarts rather than stacking — one
/// burst at a time keeps the backdrop a backdrop.
fn start_burst(on: On<NebulaBurst>, mut burst: ResMut<Burst>) {
    burst.hue = on.event().hue;
    burst.progress = 0.0;
}

/// Advance the live burst and push it into the material. Writes nothing once
/// the burst has parked, so an idle backdrop is back to zero per-frame work.
fn drive_burst(
    time: Res<Time>,
    mut burst: ResMut<Burst>,
    materials_q: Query<&MeshMaterial3d<AmbientMaterial>>,
    mut materials: ResMut<Assets<AmbientMaterial>>,
) {
    if !burst.is_active() {
        return;
    }
    burst.progress = (burst.progress + time.delta_secs() / BURST_SECS).min(Burst::IDLE);
    let value = Vec4::new(burst.hue, burst.progress, 0.0, 0.0);
    for handle in &materials_q {
        if let Some(mut material) = materials.get_mut(&handle.0) {
            material.burst = value;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A fresh burst runs 0→1 and then parks: the shader's "no burst" state is
    /// reachable without anything cancelling it.
    #[test]
    fn burst_decays_to_idle_and_parks() {
        let mut burst = Burst {
            hue: 0.25,
            progress: 0.0,
        };
        assert!(burst.is_active());

        // Half the burst's lifetime.
        burst.progress = (burst.progress + 1.0 / BURST_SECS).min(Burst::IDLE);
        assert!(burst.is_active(), "still mid-flight at 1s of {BURST_SECS}s");

        // Overshooting the end clamps instead of running past it.
        burst.progress = (burst.progress + 10.0 / BURST_SECS).min(Burst::IDLE);
        assert_eq!(burst.progress, Burst::IDLE);
        assert!(!burst.is_active());
    }

    /// Nothing bursts until something asks for it: both the resource and the
    /// material start parked, so the app never flashes on launch.
    #[test]
    fn nothing_bursts_until_asked() {
        assert!(!Burst::default().is_active());
        assert_eq!(AmbientMaterial::default().burst.y, Burst::IDLE);
    }
}
