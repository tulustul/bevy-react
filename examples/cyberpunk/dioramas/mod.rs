//! The dioramas: the little 3D worlds on the difficulty and lifepath cards,
//! the save thumbnails, and the game world itself.
//!
//! Render targets (the names React's `<portal>`s use):
//!   * `card-difficulty`, `card-nomad`, `card-streetkid`, `card-corpo` —
//!     the cards (Auto-sized, live while shown);
//!   * `shot-nomad`, `shot-streetkid`, `shot-corpo` — the save thumbnails
//!     (fixed size, rendered once: snapshots);
//!   * `world` — the game world, full screen, filmed in the chosen
//!     lifepath's diorama (`dioramas.world`).
//!
//! The worlds: the burning street (`street.rs`, its fire — `blaze.rs` —
//! following `dioramas.difficulty`), the badlands (`nomad.rs`), the neon
//! alley (`alley.rs`) and the Tenkai lobby (`lobby.rs`), each filmed through
//! HDR, bloom and its own fog. Every world has its own render layer, so no
//! camera sees another's meshes — and stands far from the others
//! (`SPACING`), since Bevy's GPU light clustering (the desktop default)
//! ignores render layers: a light reaches every view in its range.
//!
//! This module is the plumbing: the table of worlds, their cameras and
//! targets, and the two messages. The spawn helpers are `ctx.rs`, the few
//! things that move `motion.rs`.

mod alley;
mod blaze;
mod ctx;
mod lobby;
mod materials;
mod motion;
mod nomad;
mod props;
mod street;

use bevy::anti_alias::fxaa::Fxaa;
use bevy::camera::Hdr;
use bevy::camera::visibility::RenderLayers;
use bevy::post_process::bloom::Bloom;
use bevy::prelude::*;
use bevy_react::{
    PortalCamera, ReactAppExt, RenderMode, RenderTarget, RenderTargetSpec, RenderTargets,
    Resolution, react_message,
};

use ctx::Ctx;
use materials::{PaintMaterial, ParticleMaterial, SkyMaterial};
use motion::{Blink, Burn, Heat, Spin, blink, spin, stoke};

/// Layer 0 is the datascape; the worlds take one layer each from here.
const FIRST_LAYER: usize = 10;
/// How far apart the worlds stand (along x): beyond every light's range.
const SPACING: f32 = 2000.0;
/// The game world's target.
const WORLD: &str = "world";
/// The save thumbnails' size.
const SHOT: UVec2 = UVec2::new(384, 216);

/// The worlds, in layer order. `lifepath` worlds also have a save
/// thumbnail and can be played.
const WORLDS: [&Diorama; 4] = [&street::STREET, &nomad::NOMAD, &alley::ALLEY, &lobby::LOBBY];

pub struct DioramaPlugin;

impl Plugin for DioramaPlugin {
    fn build(&self, app: &mut App) {
        materials::plugin(app);
        app.init_resource::<Heat>()
            .add_systems(Startup, spawn_dioramas)
            .add_systems(
                Update,
                (
                    stoke,
                    blaze::glare.after(stoke),
                    spin,
                    blink,
                    drift,
                    retake_shots,
                ),
            );
        register_bindings(app);
    }
}

/// React → Bevy: the difficulty card's street burns hotter as the level
/// rises (0 = EASY … 3 = VERY HARD).
#[react_message(name = "dioramas.difficulty")]
pub struct SetDifficulty {
    pub level: u32,
}

/// React → Bevy: which lifepath's world the `world` camera films (`None`
/// when no game is running).
#[react_message(name = "dioramas.world")]
pub struct SetWorld {
    pub lifepath: Option<String>,
}

/// The dioramas' bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(set_difficulty)
        .add_react_handler(set_world);
}

/// One world: its id (the `card-<id>` / `shot-<id>` targets, the lifepath
/// React names), how the cameras see it, and its builder.
pub struct Diorama {
    pub id: &'static str,
    pub lifepath: bool,
    pub look: Look,
    /// The card (portrait for the lifepaths, landscape for the difficulty).
    pub card: Framing,
    /// Landscape: the save thumbnail and the game.
    pub wide: Framing,
    pub build: fn(&mut Ctx),
}

/// Where a camera stands, what it looks at, its vertical fov (degrees).
#[derive(Clone, Copy)]
pub struct Framing {
    pub eye: Vec3,
    pub at: Vec3,
    pub fov: f32,
}

impl Framing {
    /// The same view of a world standing at `origin`.
    fn moved(self, origin: Vec3) -> Self {
        Self {
            eye: self.eye + origin,
            at: self.at + origin,
            ..self
        }
    }

    /// Where the camera is at `t`, wandering `sway` (0 = still) around its post.
    fn transform(&self, t: f32, sway: f32) -> Transform {
        let eye = self.eye
            + Vec3::new(
                (t * 0.071).sin() * 0.5,
                (t * 0.053).sin() * 0.12,
                (t * 0.061).cos() * 0.3,
            ) * sway;
        let at = self.at + Vec3::new((t * 0.043).sin() * 0.7, (t * 0.037).cos() * 0.2, 0.0) * sway;
        Transform::from_translation(eye).looking_at(at, Vec3::Y)
    }

    fn projection(&self) -> Projection {
        Projection::from(PerspectiveProjection {
            fov: self.fov.to_radians(),
            ..default()
        })
    }
}

/// A world's air: the fog (also the clear color) and its density
/// (exponential), and the ambient light filling the shadows.
#[derive(Clone, Copy)]
pub struct Look {
    pub fog: Srgba,
    pub haze: f32,
    pub ambient: Srgba,
    pub ambient_brightness: f32,
    /// Bloom intensity.
    pub bloom: f32,
}

impl Look {
    fn fog(&self) -> DistanceFog {
        DistanceFog {
            color: self.fog.into(),
            falloff: FogFalloff::Exponential { density: self.haze },
            ..default()
        }
    }

    fn ambient(&self) -> AmbientLight {
        AmbientLight {
            color: self.ambient.into(),
            brightness: self.ambient_brightness,
            ..default()
        }
    }
}

/// A camera filming `diorama` from `framing` into `target`, on `layer` —
/// off until the portal gate (`PortalCamera`) switches it on. FXAA, not
/// MSAA: the game world fills the screen, and multisampled HDR is the
/// costly part of that on an integrated GPU; and a half-size bloom pyramid,
/// which looks the same at card size for a quarter of the fill. (Every
/// diorama camera is set up alike, so they share their pipelines: the
/// thumbnails, shot at startup, compile what the world needs.)
fn camera(
    diorama: &Diorama,
    framing: &Framing,
    layer: usize,
    target: &RenderTarget,
) -> impl Bundle {
    (
        Camera3d::default(),
        Camera {
            clear_color: ClearColorConfig::Custom(diorama.look.fog.into()),
            is_active: false,
            ..default()
        },
        Hdr,
        Msaa::Off,
        Fxaa::default(),
        Bloom {
            intensity: diorama.look.bloom,
            max_mip_dimension: 256,
            ..Bloom::NATURAL
        },
        diorama.look.fog(),
        diorama.look.ambient(),
        framing.projection(),
        framing.transform(0.0, 0.0),
        target.camera_target(),
        RenderLayers::layer(layer),
    )
}

/// Wander around `framing` (see [`Framing::transform`]).
#[derive(Component)]
struct Drift {
    framing: Framing,
    sway: f32,
}

/// The one camera filming the game world.
#[derive(Component)]
struct WorldCamera;

#[allow(clippy::too_many_arguments)]
fn spawn_dioramas(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
    mut paints: ResMut<Assets<PaintMaterial>>,
    mut particles: ResMut<Assets<ParticleMaterial>>,
    mut skies: ResMut<Assets<SkyMaterial>>,
    mut targets: ResMut<RenderTargets>,
    mut images: ResMut<Assets<Image>>,
) {
    let soft = images.add(ctx::soft_spot());
    for (i, diorama) in WORLDS.into_iter().enumerate() {
        let layer = FIRST_LAYER + i;
        let origin = Vec3::X * SPACING * i as f32;
        let name = format!("card-{}", diorama.id);
        let target = targets.create(&mut images, &name, RenderTargetSpec::default());
        let card = diorama.card.moved(origin);
        commands.spawn((
            camera(diorama, &card, layer, &target),
            PortalCamera(name),
            Drift {
                framing: card,
                sway: 0.2,
            },
        ));
        if diorama.lifepath {
            let name = format!("shot-{}", diorama.id);
            let spec = RenderTargetSpec {
                size: Resolution::Fixed(SHOT),
                mode: RenderMode::Snapshot,
                ..default()
            };
            let target = targets.create(&mut images, &name, spec);
            commands.spawn((
                camera(diorama, &diorama.wide.moved(origin), layer, &target),
                PortalCamera(name),
            ));
        }
        let layer = RenderLayers::layer(layer);
        let root = commands
            .spawn((
                Transform::from_translation(origin),
                Visibility::default(),
                layer.clone(),
            ))
            .id();
        (diorama.build)(&mut Ctx {
            commands: &mut commands,
            meshes: &mut meshes,
            materials: &mut materials,
            paints: &mut paints,
            particles: &mut particles,
            skies: &mut skies,
            soft: soft.clone(),
            layer,
            root,
            eye: diorama.card.eye,
            salt: i as u32 * 1000,
        });
    }
    // The game world: parked (no `PortalCamera`, so off) until a game
    // starts; `set_world` moves it to the lifepath's world.
    let target = targets.create(&mut images, WORLD, RenderTargetSpec::default());
    let first = WORLDS[1].wide.moved(Vec3::X * SPACING);
    commands.spawn((
        camera(WORLDS[1], &first, FIRST_LAYER + 1, &target),
        Drift {
            framing: first,
            sway: 1.0,
        },
        WorldCamera,
    ));
}

fn set_world(
    ev: On<SetWorld>,
    mut commands: Commands,
    camera: Single<(Entity, &mut Camera, &mut Drift), With<WorldCamera>>,
) {
    let (entity, mut camera, mut drift) = camera.into_inner();
    let lifepath = ev.event().lifepath.as_deref();
    let found = lifepath.and_then(|id| WORLDS.iter().position(|d| d.lifepath && d.id == id));
    let Some(i) = found else {
        if let Some(id) = lifepath {
            warn!("dioramas.world: no world for the lifepath {id:?}");
        }
        commands.entity(entity).remove::<PortalCamera>();
        camera.is_active = false;
        return;
    };
    let diorama = WORLDS[i];
    camera.clear_color = ClearColorConfig::Custom(diorama.look.fog.into());
    drift.framing = diorama.wide.moved(Vec3::X * SPACING * i as f32);
    commands.entity(entity).insert((
        PortalCamera(WORLD.into()),
        RenderLayers::layer(FIRST_LAYER + i),
        diorama.look.fog(),
        diorama.look.ambient(),
        diorama.wide.projection(),
    ));
}

fn set_difficulty(ev: On<SetDifficulty>, mut heat: ResMut<Heat>) {
    heat.target = ev.event().level.min(3) as f32;
}

fn drift(time: Res<Time>, mut cameras: Query<(&Drift, &Camera, &mut Transform)>) {
    let t = time.elapsed_secs();
    for (drift, camera, mut transform) in &mut cameras {
        if camera.is_active {
            *transform = drift.framing.transform(t, drift.sway);
        }
    }
}

/// A snapshot renders once, and its one frame would come out wrong: with
/// meshes missing at startup (their pipelines still compiling) and unlit
/// (Bevy's GPU light clustering only lights a view from its second
/// consecutive frame). So the thumbnails are retaken as the app settles,
/// each over a few consecutive frames; the last one sticks.
// ponytail: fixed retake times; a GPU still compiling at 45 s keeps a
// partial thumbnail — key the retakes to pipeline readiness if that shows.
fn retake_shots(
    time: Res<Time>,
    mut targets: ResMut<RenderTargets>,
    mut taken: Local<usize>,
    mut frames: Local<u32>,
) {
    const AT: [f32; 5] = [1.0, 3.0, 8.0, 20.0, 45.0];
    if AT.get(*taken).is_none_or(|&at| time.elapsed_secs() < at) {
        return;
    }
    for diorama in WORLDS.iter().filter(|d| d.lifepath) {
        targets.invalidate(&format!("shot-{}", diorama.id));
    }
    *frames += 1;
    if *frames == 6 {
        *frames = 0;
        *taken += 1;
    }
}

/// `color` from 0..255 sRGB channels.
pub const fn rgb(r: u8, g: u8, b: u8) -> Srgba {
    Srgba::new(r as f32 / 255.0, g as f32 / 255.0, b as f32 / 255.0, 1.0)
}

#[cfg(test)]
mod tests {
    use super::WORLDS;

    /// React names the targets after its lifepath ids (`card-<id>`,
    /// `shot-<id>`): every lifepath in `store.ts` needs a playable world.
    #[test]
    fn every_lifepath_has_a_world() {
        let store = include_str!("../ui/src/store.ts");
        let lifepaths = store
            .split("LIFEPATHS")
            .nth(1)
            .and_then(|rest| rest.split("];").next())
            .expect("LIFEPATHS in store.ts");
        let mut ids: Vec<&str> = lifepaths
            .split("id: \"")
            .skip(1)
            .filter_map(|rest| rest.split('"').next())
            .collect();
        let mut worlds: Vec<&str> = WORLDS.iter().filter(|w| w.lifepath).map(|w| w.id).collect();
        ids.sort_unstable();
        worlds.sort_unstable();
        assert_eq!(ids, worlds);
    }
}
