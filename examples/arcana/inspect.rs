//! The held card leaves the UI. React renders the same `<CardFront>`
//! component into `<surface target="inspect">` — front and back side by
//! side — and this module drapes that texture over a real 3D card hanging in
//! front of the camera. Drag to turn it; let go and it settles on whichever
//! face is toward you. It is still React: the surface's in-world pointer
//! carries hover and clicks onto the card's own UI.
//!
//! The card lands exactly where React drew its flat twin (`height` is the
//! twin's on-screen height), and it has its own camera — riding the main one,
//! same projection, render layer [`CARD_LAYER`], no HDR or tonemapping —
//! composited over the finished frame. So at rest its pixels are the UI's
//! and the swap is invisible, until you drag.
//!
//! Foil on the 3D card is not the UI's `holo` filter but a material
//! extension (`shaders/foil.wgsl`): the rainbow comes from the real view
//! angle, so it runs across the card as it turns, and a specular glint
//! (aimed to miss the card at rest) sweeps over it.

use std::f32::consts::PI;

use bevy::asset::RenderAssetUsages;
use bevy::camera::CameraOutputMode;
use bevy::camera::visibility::RenderLayers;
use bevy::core_pipeline::tonemapping::Tonemapping;
use bevy::input::mouse::AccumulatedMouseMotion;
use bevy::mesh::{Indices, PrimitiveTopology};
use bevy::pbr::{ExtendedMaterial, MaterialExtension};
use bevy::prelude::*;
use bevy::render::render_resource::{AsBindGroup, BlendState};
use bevy::shader::ShaderRef;
use bevy::ui::IsDefaultUiCamera;
use bevy::window::PrimaryWindow;
use bevy_react::surface::{SurfacePointer, SurfaceSpec, Surfaces};
use bevy_react::{PointerCapture, PointerCaptureSet, ReactAppExt, react_message};

/// The card and its camera live on this layer alone.
const CARD_LAYER: usize = 1;
/// The surface React renders the inspected card into.
const SURFACE: &str = "inspect";
/// One face of the surface: the 240×336 card at 2×. The texture holds two.
const FACE_PX: UVec2 = UVec2::new(480, 672);
const ASPECT: f32 = 240.0 / 336.0;
/// How far in front of the camera the card hangs.
const DISTANCE: f32 = 6.0;
/// Drag → radians per logical px.
const SENSITIVITY: f32 = 0.009;
const CLOSE_SECS: f32 = 0.45;

/// React → Bevy: show the 3D card where its 2D twin is (`height` = its
/// on-screen height, logical px), or put it away (`height: null`). `foil`
/// is the edition's foil strength (0 = none), `drift` its shimmer speed.
#[react_message(name = "arcana.inspect")]
pub struct Inspect {
    pub height: Option<f32>,
    pub foil: f32,
    pub drift: f32,
}

type FoilMaterial = ExtendedMaterial<StandardMaterial, FoilExtension>;

/// `foil = (strength, drift, 0, 0)` — see `foil.wgsl`.
#[derive(Asset, AsBindGroup, Reflect, Clone, Default)]
struct FoilExtension {
    #[uniform(100)]
    foil: Vec4,
}

impl MaterialExtension for FoilExtension {
    fn fragment_shader() -> ShaderRef {
        "shaders/foil.wgsl".into()
    }
}

pub struct InspectPlugin;

impl Plugin for InspectPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_plugins(MaterialPlugin::<FoilMaterial>::default())
            .init_resource::<Held>()
            // After the stage's camera exists.
            .add_systems(PostStartup, spawn_card.in_set(CardSpawn))
            // After the UI refreshes `PointerCapture`: a press on interactive
            // UI (a button on the card itself included) never grabs.
            .add_systems(Update, drive_card.after(PointerCaptureSet));
    }
}

pub fn register_bindings(app: &mut App) {
    app.add_react_handler(on_inspect);
}

#[derive(Component)]
struct Card;

/// Where the card and its camera are spawned (`PostStartup`).
#[derive(SystemSet, Debug, Clone, PartialEq, Eq, Hash)]
pub struct CardSpawn;

/// The card's own camera — `--shoot` points it at its image too.
#[derive(Component)]
pub struct CardCamera;

/// The card's state between frames.
#[derive(Resource)]
pub struct Held {
    /// The 2D twin's height while open; `None` = closing / hidden.
    height: Option<f32>,
    /// The last open height, so a closing card keeps its size.
    last_height: f32,
    yaw: f32,
    pitch: f32,
    /// Angular velocity, radians per second (inertia after a fling).
    velocity: Vec2,
    grabbed: bool,
    /// 1 = shown, falling to 0 while it spins away.
    presence: f32,
    /// A scripted pose (`--shoot … --do "<secs> turn <yaw> <pitch>"`):
    /// input and settling are off.
    pub pinned: Option<Vec2>,
}

impl Default for Held {
    fn default() -> Self {
        Self {
            height: None,
            last_height: 500.0,
            yaw: 0.0,
            pitch: 0.0,
            velocity: Vec2::ZERO,
            grabbed: false,
            presence: 0.0,
            pinned: None,
        }
    }
}

fn spawn_card(
    mut commands: Commands,
    mut surfaces: ResMut<Surfaces>,
    mut images: ResMut<Assets<Image>>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<FoilMaterial>>,
    camera: Single<Entity, With<IsDefaultUiCamera>>,
) {
    // Transparent clear: the card's rounded corners cut out of the mesh.
    let texture = surfaces.create(
        &mut images,
        SURFACE,
        SurfaceSpec {
            size: UVec2::new(FACE_PX.x * 2, FACE_PX.y),
            clear_color: Color::NONE,
            ..default()
        },
    );
    let material = materials.add(ExtendedMaterial {
        base: StandardMaterial {
            // Unlit: the face is exactly the UI's pixels. The extension adds
            // the foil and the glint itself (`foil.wgsl`).
            base_color: Color::WHITE,
            base_color_texture: Some(texture),
            unlit: true,
            alpha_mode: AlphaMode::Blend,
            ..default()
        },
        extension: FoilExtension::default(),
    });
    let card = commands
        .spawn((
            Card,
            Mesh3d(meshes.add(card_mesh())),
            MeshMaterial3d(material),
            SurfacePointer::new(SURFACE),
            Transform::from_xyz(0.0, 0.0, -DISTANCE),
            Visibility::Hidden,
            RenderLayers::layer(CARD_LAYER),
        ))
        .id();
    let lens = commands
        .spawn((
            Camera3d::default(),
            Camera {
                order: 1,
                is_active: false,
                clear_color: ClearColorConfig::Custom(Color::NONE),
                // Blend the card (premultiplied by the transparent clear)
                // over everything already drawn — world and UI.
                output_mode: CameraOutputMode::Write {
                    blend_state: Some(BlendState::PREMULTIPLIED_ALPHA_BLENDING),
                    clear_color: ClearColorConfig::None,
                },
                ..default()
            },
            Tonemapping::None,
            RenderLayers::layer(CARD_LAYER),
            CardCamera,
        ))
        .id();
    commands.entity(*camera).add_children(&[card, lens]);
}

/// A unit-high card: the front quad faces the camera (+Z) and shows the left
/// half of the surface; the back quad faces away and shows the right half,
/// mirrored so it reads correctly from behind. Back-face culling shows one
/// at a time.
fn card_mesh() -> Mesh {
    let (w, h, z) = (ASPECT * 0.5, 0.5, 0.004);
    let positions = vec![
        [-w, h, z],
        [w, h, z],
        [w, -h, z],
        [-w, -h, z],
        [w, h, -z],
        [-w, h, -z],
        [-w, -h, -z],
        [w, -h, -z],
    ];
    let normals = vec![[0.0, 0.0, 1.0]; 4]
        .into_iter()
        .chain(vec![[0.0, 0.0, -1.0]; 4])
        .collect::<Vec<_>>();
    let uvs = vec![
        [0.0, 0.0],
        [0.5, 0.0],
        [0.5, 1.0],
        [0.0, 1.0],
        [0.5, 0.0],
        [1.0, 0.0],
        [1.0, 1.0],
        [0.5, 1.0],
    ];
    Mesh::new(
        PrimitiveTopology::TriangleList,
        RenderAssetUsages::default(),
    )
    .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, positions)
    .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, normals)
    .with_inserted_attribute(Mesh::ATTRIBUTE_UV_0, uvs)
    .with_inserted_indices(Indices::U16(vec![0, 3, 2, 0, 2, 1, 4, 7, 6, 4, 6, 5]))
}

fn on_inspect(
    on: On<Inspect>,
    mut held: ResMut<Held>,
    card: Single<&MeshMaterial3d<FoilMaterial>, With<Card>>,
    mut materials: ResMut<Assets<FoilMaterial>>,
) {
    let msg = on.event();
    if let Some(height) = msg.height {
        // Open at rest, exactly over the 2D twin.
        *held = Held {
            height: Some(height),
            last_height: height,
            presence: 1.0,
            ..default()
        };
        if let Some(mut m) = materials.get_mut(&card.0) {
            m.extension.foil = Vec4::new(msg.foil, msg.drift, 0.0, 0.0);
        }
    } else {
        held.height = None;
        held.grabbed = false;
    }
}

#[allow(clippy::too_many_arguments)]
fn drive_card(
    time: Res<Time>,
    mut held: ResMut<Held>,
    buttons: Res<ButtonInput<MouseButton>>,
    motion: Res<AccumulatedMouseMotion>,
    capture: Res<PointerCapture>,
    window: Single<&Window, With<PrimaryWindow>>,
    camera: Single<&Projection, (With<IsDefaultUiCamera>, Without<CardCamera>)>,
    mut card: Single<(&mut Transform, &mut Visibility), With<Card>>,
    mut lens: Single<&mut Camera, With<CardCamera>>,
) {
    let dt = time.delta_secs().max(1e-4);
    let held = &mut *held;
    let open = held.height.is_some();

    if open && buttons.just_pressed(MouseButton::Left) && !capture.over_ui {
        held.grabbed = true;
    }
    if !buttons.pressed(MouseButton::Left) {
        held.grabbed = false;
    }
    if let Some(pose) = held.pinned {
        (held.yaw, held.pitch) = (pose.x, pose.y);
    } else if held.grabbed {
        let turn = Vec2::new(motion.delta.x, motion.delta.y) * SENSITIVITY;
        held.yaw += turn.x;
        held.pitch = (held.pitch + turn.y).clamp(-1.2, 1.2);
        held.velocity = held.velocity.lerp(turn / dt, 0.5);
    } else {
        // Coast, then settle on the nearest face.
        held.yaw += held.velocity.x * dt;
        held.pitch = (held.pitch + held.velocity.y * dt).clamp(-1.2, 1.2);
        held.velocity *= (-3.5 * dt).exp();
        let k = 1.0 - (-6.0 * dt).exp();
        let settle = (1.0 - held.velocity.length() / 2.0).clamp(0.0, 1.0) * k;
        let face = (held.yaw / PI).round() * PI;
        held.yaw += (face - held.yaw) * settle;
        held.pitch -= held.pitch * settle;
    }

    if !open {
        held.presence = (held.presence - dt / CLOSE_SECS).max(0.0);
    }
    let (transform, visibility) = &mut *card;
    visibility.set_if_neq(if held.presence > 0.0 {
        Visibility::Inherited
    } else {
        Visibility::Hidden
    });
    let active = held.presence > 0.0;
    if lens.is_active != active {
        lens.is_active = active;
    }
    if held.presence <= 0.0 {
        return;
    }

    // World height that projects to the 2D twin's on-screen height.
    let fov = match *camera {
        Projection::Perspective(p) => p.fov,
        _ => PI / 4.0,
    };
    let visible = 2.0 * DISTANCE * (fov / 2.0).tan();
    let height = visible * held.last_height / window.height().max(1.0);
    let away = 1.0 - held.presence;
    let ease = away * away;
    transform.translation = Vec3::new(0.0, -ease * 1.5, -DISTANCE - ease * 4.0);
    transform.rotation =
        Quat::from_euler(EulerRot::YXZ, held.yaw + ease * PI * 1.5, held.pitch, 0.0);
    transform.scale = Vec3::splat(height * (1.0 - ease * 0.6));
}
