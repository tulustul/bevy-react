//! The globe beside the Skies window: a real 3D object leaning out of the
//! glass (a child of the Skies pane, so it comes, goes and moves with it).
//! It turns to the place you pick, its day/night line set by that moment's
//! UTC time; every place has a pin — a bare transform React anchors its
//! glass label to with `<anchor entity={pin}>`.

use std::f32::consts::{PI, TAU};

use bevy::prelude::*;
use bevy::render::render_resource::{AsBindGroup, ShaderType};
use bevy::shader::ShaderRef;

use crate::panes::{CHROME_PX, PX_PER_M, Pane, WINDOWS};
use crate::skies::{PLACES, Place};

const RADIUS: f32 = 0.25;
/// The sun's declination (matches the world's).
const DECLINATION: f32 = 14.0;

#[derive(Clone, Copy, Default, ShaderType)]
struct GlobeUniform {
    to_local: Mat4,
    sun: Vec4,
    focus: Vec4,
}

#[derive(Asset, AsBindGroup, TypePath, Clone)]
pub struct GlobeMaterial {
    #[uniform(0)]
    globe: GlobeUniform,
    #[texture(1)]
    #[sampler(2)]
    land: Handle<Image>,
}

impl Material for GlobeMaterial {
    fn fragment_shader() -> ShaderRef {
        "shaders/globe.wgsl".into()
    }

    // Drawn with the windows (the transmissive pass): the glass behind it
    // must not frost a copy of the globe in front of it.
    fn reads_view_transmission_texture(&self) -> bool {
        true
    }

    fn enable_prepass() -> bool {
        false
    }

    fn enable_shadows() -> bool {
        false
    }
}

/// Where the globe is turning, and the moment it shows.
#[derive(Resource)]
pub struct Globe {
    /// Target (lat, lon) facing you, radians.
    target: Vec2,
    view: Vec2,
    /// The sun in globe-local space.
    sun: Vec3,
    focus: Vec3,
    picked: f32,
}

impl Globe {
    /// Turn to `place` and light it as at local `hour`.
    pub fn focus(&mut self, place: &Place, hour: f32) {
        self.target = Vec2::new(place.lat.to_radians(), place.lon.to_radians());
        // Shortest way round in longitude.
        let d = (self.target.y - self.view.y + PI).rem_euclid(TAU) - PI;
        self.target.y = self.view.y + d;
        let utc = hour - place.utc_offset;
        let subsolar = Vec2::new(DECLINATION, -15.0 * (utc - 12.0));
        self.sun = local(subsolar.x.to_radians(), subsolar.y.to_radians());
        self.focus = local(place.lat.to_radians(), place.lon.to_radians());
        self.picked = 1.0;
    }
}

/// The unit vector to (lat, lon) in globe-local space (lon 0 faces +Z).
fn local(lat: f32, lon: f32) -> Vec3 {
    Vec3::new(lat.cos() * lon.sin(), lat.sin(), lat.cos() * lon.cos())
}

/// The pins, in `PLACES` order.
#[derive(Resource)]
pub struct Pins(pub Vec<Entity>);

#[derive(Component)]
struct Body;

pub struct GlobePlugin;

impl Plugin for GlobePlugin {
    fn build(&self, app: &mut App) {
        let mut globe = Globe {
            target: Vec2::ZERO,
            view: Vec2::ZERO,
            sun: Vec3::Z,
            focus: Vec3::Z,
            picked: 0.0,
        };
        globe.focus(&PLACES[0], PLACES[0].moment.hour);
        globe.view = globe.target;
        app.add_plugins(MaterialPlugin::<GlobeMaterial>::default())
            .insert_resource(globe)
            .add_systems(PostStartup, spawn_globe)
            .add_systems(Update, turn_globe)
            .add_systems(
                PostUpdate,
                shade_globe.after(bevy::transform::TransformSystems::Propagate),
            );
    }
}

fn spawn_globe(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<GlobeMaterial>>,
    assets: Res<AssetServer>,
    panes: Query<(Entity, &Pane)>,
) {
    let Some((skies, _)) = panes.iter().find(|(_, p)| p.app == "skies") else {
        return;
    };
    let Some(w) = WINDOWS.iter().find(|w| w.app == "skies") else {
        return;
    };
    let quad = Vec2::new(w.size.x, w.size.y + CHROME_PX) / PX_PER_M;
    // Leaning out of the window's top-right corner, toward you.
    let at = Vec3::new(quad.x * 0.5 + 0.02, quad.y * 0.5 + 0.08, 0.3);
    let body = commands
        .spawn((
            Body,
            Mesh3d(meshes.add(Sphere::new(RADIUS).mesh().uv(96, 48))),
            MeshMaterial3d(materials.add(GlobeMaterial {
                globe: GlobeUniform::default(),
                land: assets.load("images/land.png"),
            })),
            Transform::from_translation(at),
            bevy::light::NotShadowCaster,
        ))
        .id();
    commands.entity(skies).add_child(body);
    let pins = PLACES
        .iter()
        .map(|p| {
            let pin = commands
                .spawn((
                    Transform::from_translation(
                        local(p.lat.to_radians(), p.lon.to_radians()) * RADIUS * 1.02,
                    ),
                    Visibility::default(),
                ))
                .id();
            commands.entity(body).add_child(pin);
            pin
        })
        .collect();
    commands.insert_resource(Pins(pins));
}

fn turn_globe(
    time: Res<Time>,
    mut globe: ResMut<Globe>,
    mut body: Query<(&mut Transform, &ChildOf), With<Body>>,
    panes: Query<&Pane>,
) {
    let Ok((mut transform, child_of)) = body.single_mut() else {
        return;
    };
    // It grows out of its window as the window forms (and back into it).
    let presence = panes.get(child_of.parent()).map_or(1.0, |p| p.presence);
    let grow = (presence - 0.35).max(0.0) / 0.65;
    transform.scale = Vec3::splat(1.0 - (1.0 - grow).powi(3));
    let dt = time.delta_secs();
    let t = time.elapsed_secs();
    let k = 1.0 - (-3.0 * dt).exp();
    let target = globe.target;
    globe.view = globe.view.lerp(target, k);
    globe.picked = (globe.picked - dt * 0.7).max(0.0);
    // Turned so the place faces you, tipped back a little, breathing.
    let drift = (t * 0.17).sin() * 0.12;
    let (lat, lon) = (globe.view.x, globe.view.y + drift);
    transform.rotation =
        Quat::from_rotation_x(lat.clamp(-1.0, 1.0) * 0.8 + 0.18) * Quat::from_rotation_y(-lon);
}

/// After transforms propagate: the shader needs this frame's world → globe
/// rotation, or the dots would trail the spin by a frame.
fn shade_globe(
    time: Res<Time>,
    globe: Res<Globe>,
    body: Query<(&GlobalTransform, &MeshMaterial3d<GlobeMaterial>), With<Body>>,
    mut materials: ResMut<Assets<GlobeMaterial>>,
) {
    let Ok((global, handle)) = body.single() else {
        return;
    };
    let to_local = Mat4::from_quat(global.compute_transform().rotation.inverse());
    if let Some(mut m) = materials.get_mut(&handle.0) {
        m.globe = GlobeUniform {
            to_local,
            sun: globe.sun.extend(time.elapsed_secs()),
            focus: globe.focus.extend(globe.picked),
        };
    }
}
