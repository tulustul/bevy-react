//! The card art: one little 3D world per card, each filmed by its own camera
//! into a named render target (`card-<id>`) that React shows with
//! `<portal target="card-sun" />`. Every diorama lives at the origin on its
//! own render layer (lights included — Bevy filters them per view), so they
//! never see each other.
//!
//! A target renders only while a portal showing it is on screen (the core's
//! camera gate), so the thirteen worlds cost nothing until their cards are
//! dealt, and each one is sized to the portal showing it
//! (`Resolution::Auto`): a grimoire thumbnail renders a fraction of the
//! pixels of the held card. (Auto sizing follows the last portal bound, so
//! the UI shows each world in one place at a time.)
//!
//! The worlds themselves are in `scenes.rs`; this module is the plumbing: the
//! cameras, a shared sky shader, and a few tiny animation components.

mod figures;
mod heavens;
mod scenes;

use std::f32::consts::PI;

use bevy::camera::Hdr;
use bevy::camera::visibility::RenderLayers;
use bevy::post_process::bloom::Bloom;
use bevy::prelude::*;
use bevy::render::render_resource::AsBindGroup;
use bevy::shader::ShaderRef;
use bevy_react::{PortalCamera, RenderMode, RenderTargetSpec, RenderTargets, Resolution};

/// Layer 0 is the stage; the dioramas take one layer each from here.
const FIRST_LAYER: usize = 10;
/// HDR + bloom only while this few worlds are live (the fan, a held card): a
/// full grimoire of thirteen HDR targets and bloom chains costs an
/// integrated GPU more than the glow is worth at thumbnail size. (An LDR
/// camera still tonemaps, in the shader, so the worlds keep their look.)
const BLOOM_MAX_LIVE: usize = 6;
/// How brightly each world's key light falls on its origin, lux.
const KEY_LUX: f32 = 2_500.0;

pub struct DioramaPlugin;

impl Plugin for DioramaPlugin {
    fn build(&self, app: &mut App) {
        app.add_plugins(MaterialPlugin::<SkyMaterial>::default())
            .add_systems(Startup, spawn_dioramas)
            .add_systems(Update, (spin, orbit, bob, pulse, flicker, budget_bloom));
    }
}

/// One card's world: its id (the `card-<id>` target React names), its sky
/// (deep edge, glow at the heart), where its key light comes from, and its
/// builder.
pub struct Diorama {
    pub id: &'static str,
    pub sky: [Srgba; 2],
    pub light: Vec3,
    pub build: fn(&mut Ctx),
}

/// The sky behind a diorama: a radial glow with drifting haze and stars.
#[derive(Asset, AsBindGroup, Reflect, Clone)]
struct SkyMaterial {
    #[uniform(0)]
    deep: LinearRgba,
    #[uniform(1)]
    glow: LinearRgba,
}

impl Material for SkyMaterial {
    fn fragment_shader() -> ShaderRef {
        "shaders/sky.wgsl".into()
    }
}

/// What a builder gets: spawn helpers that put everything on the diorama's
/// layer.
pub struct Ctx<'a, 'w, 's> {
    commands: &'a mut Commands<'w, 's>,
    meshes: &'a mut Assets<Mesh>,
    materials: &'a mut Assets<StandardMaterial>,
    layer: RenderLayers,
}

impl Ctx<'_, '_, '_> {
    pub fn mesh(&mut self, mesh: impl Into<Mesh>) -> Handle<Mesh> {
        self.meshes.add(mesh)
    }

    /// An emissive material: `strength` above 1 blooms.
    pub fn glow(&mut self, color: Srgba, strength: f32) -> Handle<StandardMaterial> {
        self.materials.add(StandardMaterial {
            base_color: color.into(),
            emissive: LinearRgba::from(color) * strength,
            ..default()
        })
    }

    /// A lit surface.
    pub fn solid(
        &mut self,
        color: Srgba,
        roughness: f32,
        metallic: f32,
    ) -> Handle<StandardMaterial> {
        self.materials.add(StandardMaterial {
            base_color: color.into(),
            perceptual_roughness: roughness,
            metallic,
            ..default()
        })
    }

    /// Pure black that ignores light (an event horizon, a moon's shadow).
    pub fn void(&mut self) -> Handle<StandardMaterial> {
        self.materials.add(StandardMaterial {
            base_color: Color::BLACK,
            unlit: true,
            ..default()
        })
    }

    /// A mesh on this diorama's layer.
    pub fn object(
        &mut self,
        mesh: &Handle<Mesh>,
        material: &Handle<StandardMaterial>,
        transform: Transform,
    ) -> Entity {
        self.commands
            .spawn((
                Mesh3d(mesh.clone()),
                MeshMaterial3d(material.clone()),
                transform,
                self.layer.clone(),
            ))
            .id()
    }

    /// A new mesh on this diorama's layer.
    pub fn shape(
        &mut self,
        mesh: impl Into<Mesh>,
        material: &Handle<StandardMaterial>,
        transform: Transform,
    ) -> Entity {
        let mesh = self.meshes.add(mesh);
        self.object(&mesh, material, transform)
    }

    /// An empty transform node on this layer (a pivot to spin a group by).
    pub fn pivot(&mut self, transform: Transform) -> Entity {
        self.commands
            .spawn((transform, Visibility::default(), self.layer.clone()))
            .id()
    }

    pub fn point_light(&mut self, color: Srgba, intensity: f32, at: Vec3) -> Entity {
        self.commands
            .spawn((
                PointLight {
                    color: color.into(),
                    intensity,
                    range: 30.0,
                    ..default()
                },
                Transform::from_translation(at),
                self.layer.clone(),
            ))
            .id()
    }

    pub fn insert(&mut self, entity: Entity, bundle: impl Bundle) {
        self.commands.entity(entity).insert(bundle);
    }

    pub fn parent(&mut self, parent: Entity, child: Entity) {
        self.commands.entity(parent).add_child(child);
    }
}

/// Rotate about a local axis, radians per second.
#[derive(Component)]
pub struct Spin(pub Vec3, pub f32);

/// Circle `center` at `radius` in the plane tilted by `tilt`.
#[derive(Component)]
pub struct Orbit {
    pub center: Vec3,
    pub radius: f32,
    pub speed: f32,
    pub phase: f32,
    pub tilt: Quat,
}

/// Float up and down around `base`.
#[derive(Component)]
pub struct Bob {
    pub base: Vec3,
    pub amp: f32,
    pub speed: f32,
    pub phase: f32,
}

/// Strike like lightning: two quick flashes per period (seconds).
#[derive(Component)]
pub struct Flicker(pub f32);

/// Breathe a material's emissive between `low`× and `high`× of `base`.
#[derive(Component)]
pub struct Pulse {
    pub material: Handle<StandardMaterial>,
    pub base: LinearRgba,
    pub low: f32,
    pub high: f32,
    pub speed: f32,
}

fn spawn_dioramas(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
    mut skies: ResMut<Assets<SkyMaterial>>,
    mut targets: ResMut<RenderTargets>,
    mut images: ResMut<Assets<Image>>,
) {
    let quad = meshes.add(Rectangle::new(60.0, 60.0));
    for (i, diorama) in scenes::DIORAMAS.iter().enumerate() {
        let layer = RenderLayers::layer(FIRST_LAYER + i);
        let name = format!("card-{}", diorama.id);
        let target = targets.create(
            &mut images,
            name.clone(),
            RenderTargetSpec {
                size: Resolution::Auto,
                mode: RenderMode::Live,
                ..default()
            },
        );
        let sky = commands
            .spawn((
                Mesh3d(quad.clone()),
                MeshMaterial3d(skies.add(SkyMaterial {
                    deep: diorama.sky[0].into(),
                    glow: diorama.sky[1].into(),
                })),
                Transform::from_xyz(0.0, 0.0, -20.0),
                layer.clone(),
            ))
            .id();
        commands
            .spawn((
                Camera3d::default(),
                Camera {
                    clear_color: ClearColorConfig::Custom(diorama.sky[0].into()),
                    ..default()
                },
                Projection::from(PerspectiveProjection {
                    fov: 34f32.to_radians(),
                    ..default()
                }),
                AmbientLight {
                    color: Color::WHITE,
                    brightness: 120.0,
                    ..default()
                },
                target.camera_target(),
                PortalCamera(name),
                Transform::from_xyz(0.0, 0.0, 6.0).looking_at(Vec3::ZERO, Vec3::Y),
                layer.clone(),
            ))
            .add_child(sky);
        // A point light, not a directional one: Bevy caps directional
        // lights at 10 per frame, and the grimoire shows all 13 worlds. Its
        // power scales with distance², so every key lights the origin alike.
        commands.spawn((
            PointLight {
                intensity: KEY_LUX * 4.0 * PI * diorama.light.length_squared(),
                range: 30.0,
                ..default()
            },
            Transform::from_translation(diorama.light),
            layer.clone(),
        ));
        (diorama.build)(&mut Ctx {
            commands: &mut commands,
            meshes: &mut meshes,
            materials: &mut materials,
            layer,
        });
    }
}

fn spin(time: Res<Time>, mut q: Query<(&Spin, &mut Transform)>) {
    for (Spin(axis, speed), mut t) in &mut q {
        t.rotate_local_axis(
            Dir3::new(*axis).unwrap_or(Dir3::Y),
            speed * time.delta_secs(),
        );
    }
}

fn orbit(time: Res<Time>, mut q: Query<(&Orbit, &mut Transform)>) {
    let t = time.elapsed_secs();
    for (o, mut transform) in &mut q {
        let a = o.phase + o.speed * t;
        transform.translation = o.center + o.tilt * Vec3::new(a.cos(), 0.0, a.sin()) * o.radius;
    }
}

fn bob(time: Res<Time>, mut q: Query<(&Bob, &mut Transform)>) {
    let t = time.elapsed_secs();
    for (b, mut transform) in &mut q {
        transform.translation = b.base + Vec3::Y * (b.phase + b.speed * t).sin() * b.amp;
    }
}

fn pulse(time: Res<Time>, q: Query<&Pulse>, mut materials: ResMut<Assets<StandardMaterial>>) {
    let t = time.elapsed_secs();
    for p in &q {
        if let Some(mut m) = materials.get_mut(&p.material) {
            let k = p.low + (p.high - p.low) * (0.5 + 0.5 * (t * p.speed).sin());
            m.emissive = p.base * k;
        }
    }
}

fn flicker(time: Res<Time>, mut q: Query<(&Flicker, &mut Visibility)>) {
    let t = time.elapsed_secs();
    for (Flicker(period), mut visibility) in &mut q {
        let phase = (t / period).fract();
        let lit = phase < 0.05 || (0.09..0.13).contains(&phase);
        visibility.set_if_neq(if lit {
            Visibility::Inherited
        } else {
            Visibility::Hidden
        });
    }
}

/// Glow when few worlds are live, none when the whole grimoire is (reads
/// last frame's camera gate — a frame late is fine). `Bloom` requires `Hdr`,
/// so inserting it brings HDR back.
fn budget_bloom(
    mut commands: Commands,
    cameras: Query<(Entity, &Camera, Has<Bloom>), With<PortalCamera>>,
) {
    let live = cameras
        .iter()
        .filter(|(_, camera, _)| camera.is_active)
        .count();
    let glow = live <= BLOOM_MAX_LIVE;
    for (entity, _, has) in &cameras {
        if has && !glow {
            commands.entity(entity).remove::<(Bloom, Hdr)>();
        } else if !has && glow {
            commands.entity(entity).insert(Bloom::NATURAL);
        }
    }
}
