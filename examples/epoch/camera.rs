//! The strategy camera: looks down on the map from the south, pans with
//! WASD/arrows or a left-drag, zooms with the wheel, and flies wherever
//! React asks. A second, top-down camera films the whole map into the
//! minimap's `<portal>`, with your view outlined on it.

use bevy::camera::ScalingMode;
use bevy::camera::visibility::RenderLayers;
use bevy::input::mouse::{AccumulatedMouseMotion, AccumulatedMouseScroll, MouseScrollUnit};
use bevy::light::CascadeShadowConfigBuilder;
use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;
use bevy_react::{
    PointerCapture, PointerCaptureSet, PortalCamera, ReactAppExt, RenderTargetSpec, RenderTargets,
    react_message,
};

use crate::map::hex;
use crate::map::pick::TilePos;
use crate::map::world::{COLS, ROWS, World};

pub const MINIMAP: &str = "minimap";
/// What only the minimap camera sees: your view's outline.
const MINIMAP_LAYER: usize = 1;
const MIN_HEIGHT: f32 = 9.0;
const MAX_HEIGHT: f32 = 42.0;
/// Deep sea, beyond the map's edge.
const SEA: Color = Color::srgb(0.05, 0.13, 0.21);

#[derive(Component)]
pub struct MainCamera;

/// Where the camera looks (ground x, z) and how far out it is (0..1);
/// the view eases toward the targets.
#[derive(Resource)]
pub struct Rig {
    focus: Vec2,
    target: Vec2,
    zoom: f32,
    target_zoom: f32,
    grabbed: bool,
}

impl Rig {
    pub fn fly_to(&mut self, tile: IVec2, zoom: Option<f32>) {
        self.target = hex::center(tile);
        if let Some(z) = zoom {
            self.target_zoom = z.clamp(0.0, 1.0);
        }
    }
}

/// React → Bevy: fly to a tile (and optionally a zoom, 0 close … 1 far).
#[react_message(name = "map.focus")]
pub struct Focus {
    pub tile: TilePos,
    pub zoom: Option<f32>,
}

/// React → Bevy: look at a point of the minimap (`0..1` across and down).
#[react_message(name = "map.jump")]
pub struct Jump {
    pub u: f32,
    pub v: f32,
}

#[derive(Default, Reflect, GizmoConfigGroup)]
struct MinimapGizmos;

pub struct CameraPlugin;

impl Plugin for CameraPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.insert_resource(GlobalAmbientLight {
            color: Color::srgb(0.82, 0.88, 1.0),
            brightness: 420.0,
            ..default()
        })
        .init_gizmo_group::<MinimapGizmos>()
        .add_systems(Startup, spawn_cameras)
        .add_systems(
            Update,
            (drive.after(PointerCaptureSet), outline_view).chain(),
        );
    }
}

pub fn register_bindings(app: &mut App) {
    app.add_react_handler(on_focus).add_react_handler(on_jump);
}

fn bounds() -> Rect {
    let far = hex::center(IVec2::new(COLS - 1, ROWS - 1));
    Rect::new(0.0, 0.0, far.x + hex::WIDTH * 0.5, far.y)
}

fn spawn_cameras(
    mut commands: Commands,
    world: Res<World>,
    mut targets: ResMut<RenderTargets>,
    mut images: ResMut<Assets<Image>>,
    mut gizmos: ResMut<GizmoConfigStore>,
) {
    let home = hex::center(world.cities[0].tile);
    commands.insert_resource(Rig {
        focus: home,
        target: home,
        zoom: 0.35,
        target_zoom: 0.35,
        grabbed: false,
    });
    commands.spawn((
        Camera3d::default(),
        Camera {
            clear_color: ClearColorConfig::Custom(SEA),
            ..default()
        },
        Projection::Perspective(PerspectiveProjection {
            fov: 40f32.to_radians(),
            ..default()
        }),
        Transform::default(),
        IsDefaultUiCamera,
        MainCamera,
    ));
    commands.spawn((
        DirectionalLight {
            illuminance: 9_000.0,
            shadow_maps_enabled: true,
            ..default()
        },
        Transform::from_xyz(-5.0, 10.0, 7.0).looking_at(Vec3::ZERO, Vec3::Y),
        CascadeShadowConfigBuilder {
            first_cascade_far_bound: 14.0,
            maximum_distance: 70.0,
            ..default()
        }
        .build(),
    ));

    let area = bounds();
    let minimap = targets.create(&mut images, MINIMAP, RenderTargetSpec::default());
    commands.spawn((
        Camera3d::default(),
        Camera {
            clear_color: ClearColorConfig::Custom(SEA),
            ..default()
        },
        Projection::Orthographic(OrthographicProjection {
            scaling_mode: ScalingMode::AutoMin {
                min_width: area.width() + 1.5,
                min_height: area.height() + 1.5,
            },
            ..OrthographicProjection::default_3d()
        }),
        Transform::from_xyz(area.center().x, 40.0, area.center().y)
            .looking_at(area.center().extend(0.0).xzy(), Vec3::NEG_Z),
        minimap.camera_target(),
        PortalCamera(MINIMAP.into()),
        RenderLayers::from_layers(&[0, MINIMAP_LAYER]),
    ));
    let (config, _) = gizmos.config_mut::<MinimapGizmos>();
    config.render_layers = RenderLayers::layer(MINIMAP_LAYER);
    config.line.width = 2.5;
}

#[allow(clippy::too_many_arguments)]
fn drive(
    time: Res<Time>,
    keys: Res<ButtonInput<KeyCode>>,
    buttons: Res<ButtonInput<MouseButton>>,
    motion: Res<AccumulatedMouseMotion>,
    scroll: Res<AccumulatedMouseScroll>,
    capture: Res<PointerCapture>,
    mut rig: ResMut<Rig>,
    mut camera: Single<&mut Transform, With<MainCamera>>,
) {
    let dt = time.delta_secs();
    let height = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * rig.zoom.powf(1.3);

    let mut pan = Vec2::ZERO;
    for (key, dir) in [
        (KeyCode::KeyW, Vec2::NEG_Y),
        (KeyCode::ArrowUp, Vec2::NEG_Y),
        (KeyCode::KeyS, Vec2::Y),
        (KeyCode::ArrowDown, Vec2::Y),
        (KeyCode::KeyA, Vec2::NEG_X),
        (KeyCode::ArrowLeft, Vec2::NEG_X),
        (KeyCode::KeyD, Vec2::X),
        (KeyCode::ArrowRight, Vec2::X),
    ] {
        if keys.pressed(key) {
            pan += dir;
        }
    }
    rig.target += pan.normalize_or_zero() * height * 1.1 * dt;

    // A left-drag that starts on the map grabs it.
    if buttons.just_pressed(MouseButton::Left) {
        rig.grabbed = !capture.is_captured();
    }
    if !buttons.pressed(MouseButton::Left) {
        rig.grabbed = false;
    }
    if rig.grabbed {
        let delta = -motion.delta * height * 0.0021;
        rig.target += delta;
        rig.focus += delta;
    }

    if !capture.is_captured() {
        let notches = match scroll.unit {
            MouseScrollUnit::Line => scroll.delta.y,
            MouseScrollUnit::Pixel => scroll.delta.y / 100.0,
        };
        rig.target_zoom = (rig.target_zoom - notches * 0.07).clamp(0.0, 1.0);
    }

    let area = bounds();
    rig.target = rig.target.clamp(area.min, area.max);
    let k = 1.0 - (-7.0 * dt).exp();
    let (target, target_zoom) = (rig.target, rig.target_zoom);
    rig.focus = rig.focus.lerp(target, k);
    rig.zoom += (target_zoom - rig.zoom) * k;

    // Further out, the view tips toward straight down.
    let pitch = (50.0 + 14.0 * rig.zoom).to_radians();
    let height = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * rig.zoom.powf(1.3);
    let ground = Vec3::new(rig.focus.x, 0.0, rig.focus.y);
    camera.translation = ground + Vec3::new(0.0, height, height / pitch.tan());
    camera.look_at(ground, Vec3::Y);
}

/// Outline the main camera's view of the ground on the minimap.
fn outline_view(
    camera: Single<(&Camera, &GlobalTransform), With<MainCamera>>,
    mut gizmos: Gizmos<MinimapGizmos>,
) {
    let (camera, eye) = *camera;
    let Some(size) = camera.logical_viewport_size() else {
        return;
    };
    let corners = [
        Vec2::ZERO,
        Vec2::new(size.x, 0.0),
        size,
        Vec2::new(0.0, size.y),
    ];
    let ground: Vec<Vec3> = corners
        .iter()
        .filter_map(|&p| {
            let ray = camera.viewport_to_world(eye, p).ok()?;
            let d = ray.intersect_plane(Vec3::ZERO, InfinitePlane3d::new(Vec3::Y))?;
            Some(ray.get_point(d).with_y(3.0))
        })
        .collect();
    if ground.len() == 4 {
        gizmos.linestrip(ground.iter().chain(&ground[..1]).copied(), Color::WHITE);
    }
}

fn on_focus(focus: On<Focus>, mut rig: ResMut<Rig>) {
    let f = focus.event();
    rig.fly_to(IVec2::new(f.tile.col, f.tile.row), f.zoom);
}

fn on_jump(jump: On<Jump>, mut rig: ResMut<Rig>, minimap: Single<&Projection, With<PortalCamera>>) {
    // The minimap camera looks straight down, north up, at the map's
    // center; its projection knows how much ground the portal spans.
    if let Projection::Orthographic(view) = *minimap {
        rig.target = bounds().center() + (Vec2::new(jump.u, jump.v) - 0.5) * view.area.size();
    }
}
