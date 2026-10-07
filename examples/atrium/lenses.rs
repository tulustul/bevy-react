//! The Lenses app's world side: four cameras around the lake, each filming
//! into a named render target the app shows with `<portal target=…>`. A
//! target renders only while a portal shows it.
//!
//! They see what the eye can't: you. A figure stands where you stand — on a
//! layer only the lenses film — so the boathouse camera and the far-shore
//! telephoto find a small person among glowing windows.

use std::f32::consts::TAU;

use bevy::camera::visibility::RenderLayers;
use bevy::core_pipeline::tonemapping::Tonemapping;
use bevy::prelude::*;
use bevy_react::{
    PortalCamera, ReactAppExt, RenderMode, RenderTargetSpec, RenderTargets, Request, Resolution,
    react_request,
};
use serde::Serialize;
use ts_rs::TS;

use crate::look::EYE;
use crate::panes::PaneScale;
use crate::world::{LENS_LAYERS, WorldMaterial};

/// The figure is filmed by the lenses only.
const FIGURE_LAYER: usize = 3;
/// A lens's picture, logical px: the expanded view's size. The grid's tiles
/// share its aspect, so a tile flying open just scales the same texture.
const PICTURE: Vec2 = Vec2::new(456.0, 316.0);

enum Shot {
    /// Fixed position, looking at a point.
    Still { at: Vec3, look: Vec3 },
    /// Circling `center` at `radius`, `height` above it.
    Orbit {
        center: Vec3,
        radius: f32,
        height: f32,
        speed: f32,
    },
}

struct Lens {
    id: &'static str,
    name: &'static str,
    detail: &'static str,
    /// Whether you can spot yourself in it.
    sees_you: bool,
    fov: f32,
    shot: Shot,
}

const LENSES: [Lens; 4] = [
    Lens {
        id: "boathouse",
        name: "Boathouse",
        detail: "Low on the water, by the shore",
        sees_you: true,
        fov: 17.0,
        shot: Shot::Still {
            at: Vec3::new(14.0, 0.6, 22.0),
            look: Vec3::new(0.0, 1.9, -1.5),
        },
    },
    Lens {
        id: "drone",
        name: "Drone",
        detail: "Circling the pier",
        sees_you: true,
        fov: 48.0,
        shot: Shot::Orbit {
            center: Vec3::new(0.0, 1.4, -0.8),
            radius: 8.5,
            height: 4.5,
            speed: 0.09,
        },
    },
    Lens {
        id: "shore",
        name: "Far shore",
        detail: "Telephoto, 260 m across the water",
        sees_you: true,
        fov: 5.5,
        shot: Shot::Still {
            at: Vec3::new(-70.0, 3.0, -250.0),
            look: Vec3::new(0.0, 1.6, -0.6),
        },
    },
    Lens {
        id: "summit",
        name: "Summit",
        detail: "2,140 m, looking down the valley",
        sees_you: false,
        fov: 52.0,
        shot: Shot::Still {
            at: Vec3::new(230.0, 270.0, -470.0),
            look: Vec3::new(-30.0, 0.0, -200.0),
        },
    },
];

/// One lens, as the Lenses app shows it.
#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct LensInfo {
    /// Its render target is `lens-<id>`.
    pub id: String,
    pub name: String,
    pub detail: String,
    /// Whether you can spot yourself in it.
    pub sees_you: bool,
}

/// React → Bevy (request): the lenses, in order.
#[react_request(name = "lenses.list", response = Vec<LensInfo>)]
pub struct ListLenses;

#[derive(Component)]
struct LensCamera(usize);

pub struct LensesPlugin;

impl Plugin for LensesPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        // After the windows pick their texture scale.
        app.add_systems(PostStartup, (spawn_lenses, spawn_figure))
            .add_systems(Update, fly_lenses);
    }
}

pub fn register_bindings(app: &mut App) {
    app.add_react_request_handler(on_list);
}

fn on_list(req: On<Request<ListLenses>>) {
    req.respond(
        LENSES
            .iter()
            .map(|l| LensInfo {
                id: l.id.into(),
                name: l.name.into(),
                detail: l.detail.into(),
                sees_you: l.sees_you,
            })
            .collect(),
    );
}

fn spawn_lenses(
    mut commands: Commands,
    mut targets: ResMut<RenderTargets>,
    mut images: ResMut<Assets<Image>>,
    scale: Res<PaneScale>,
) {
    let layers = RenderLayers::from_layers(&LENS_LAYERS).with(FIGURE_LAYER);
    for (i, lens) in LENSES.iter().enumerate() {
        let name = format!("lens-{}", lens.id);
        let target = targets.create(
            &mut images,
            name.clone(),
            RenderTargetSpec {
                size: Resolution::Fixed((PICTURE * scale.0).round().as_uvec2()),
                mode: RenderMode::Live,
                ..default()
            },
        );
        commands.spawn((
            Camera3d::default(),
            Camera {
                order: -2,
                clear_color: ClearColorConfig::Custom(Color::BLACK),
                ..default()
            },
            Projection::Perspective(PerspectiveProjection {
                fov: lens.fov.to_radians(),
                near: 0.1,
                far: 10_000.0,
                ..default()
            }),
            Tonemapping::None,
            Msaa::Off,
            target.camera_target(),
            PortalCamera(name),
            layers.clone(),
            Transform::default(),
            LensCamera(i),
        ));
    }
}

fn fly_lenses(time: Res<Time>, mut cameras: Query<(&LensCamera, &mut Transform)>) {
    let t = time.elapsed_secs();
    for (lens, mut transform) in &mut cameras {
        *transform = match LENSES[lens.0].shot {
            Shot::Still { at, look } => {
                // A slow handheld drift, so a still lens still looks live.
                let drift = Vec3::new((t * 0.13).sin(), (t * 0.17).cos(), 0.0) * 0.05;
                Transform::from_translation(at)
                    .looking_at(look + drift * at.distance(look) * 0.02, Vec3::Y)
            }
            Shot::Orbit {
                center,
                radius,
                height,
                speed,
            } => {
                let a = t * speed * TAU;
                let at = center + Vec3::new(a.cos() * radius, height, a.sin() * radius);
                Transform::from_translation(at).looking_at(center, Vec3::Y)
            }
        };
    }
}

/// You, as the lenses see you: a dark figure at the end of the pier.
fn spawn_figure(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<WorldMaterial>>,
) {
    let material = materials.add(WorldMaterial {
        atmos: default(),
        kind: Vec4::X,
    });
    let feet = EYE - Vec3::Y * 1.65;
    let parts = [
        (
            tinted(Capsule3d::new(0.2, 0.95).into(), [0.08, 0.09, 0.12]),
            Transform::from_translation(feet + Vec3::Y * 0.78)
                .with_scale(Vec3::new(1.0, 1.0, 0.75)),
        ),
        (
            tinted(Sphere::new(0.12).mesh().uv(16, 10), [0.1, 0.1, 0.13]),
            Transform::from_translation(feet + Vec3::Y * 1.58),
        ),
    ];
    for (mesh, transform) in parts {
        commands.spawn((
            Mesh3d(meshes.add(mesh)),
            MeshMaterial3d(material.clone()),
            transform,
            RenderLayers::layer(FIGURE_LAYER),
        ));
    }
}

/// `land.wgsl` reads a prop's albedo from its vertex colors.
fn tinted(mut mesh: Mesh, color: [f32; 3]) -> Mesh {
    let n = mesh.count_vertices();
    mesh.insert_attribute(
        Mesh::ATTRIBUTE_COLOR,
        vec![[color[0], color[1], color[2], 1.0]; n],
    );
    mesh
}
