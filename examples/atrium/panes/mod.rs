//! The window manager. Every app is a React `<surface>` (see
//! `ui/src/shell/Window.tsx`) shown on a pane of glass floating around you:
//! this module owns where the panes are and how they come and go; React owns
//! what is on them and which are open.
//!
//!   * A pane sits on a cylinder around your eye — a yaw, a height and a
//!     distance — and always turns to face you.
//!   * React opens and closes it (`bevy.panes.show`); it condenses out of
//!     noise and dissolves back (`pane.wgsl`).
//!   * Pressing a window's grab bar (React, `bevy.panes.grab`) hands the pane
//!     to the mouse until release; the wheel pushes it away or pulls it in.
//!   * `bevy.panes.summon` brings a window to wherever you are looking.

mod material;

use bevy::input::mouse::{MouseScrollUnit, MouseWheel};
use bevy::mesh::VertexAttributeValues;
use bevy::picking::mesh_picking::ray_cast::{MeshRayCast, MeshRayCastSettings};
use bevy::prelude::*;
use bevy::window::PrimaryWindow;
use bevy_react::surface::{SurfacePointer, SurfaceSpec, Surfaces};
use bevy_react::{ReactAppExt, ReactEvents, react_event, react_message};

pub use material::PaneMaterial;

use crate::look::{EYE, Eye, Look};

/// Logical UI pixels per meter of glass: at the default distance a window
/// shows about one UI pixel per screen pixel in a 1280-wide window.
pub const PX_PER_M: f32 = 400.0;
/// The strip under each window for its grab bar and close button.
pub const CHROME_PX: f32 = 54.0;
const RADIUS_PX: f32 = 30.0;
const OPEN_SECS: f32 = 0.95;
const CLOSE_SECS: f32 = 0.45;
const MIN_DISTANCE: f32 = 1.7;
const MAX_DISTANCE: f32 = 4.5;

/// An app's window: its surface's name and size, and where it first opens.
pub struct AppWindow {
    pub app: &'static str,
    /// The window's own area, logical px (the chrome strip is extra).
    pub size: Vec2,
    /// Where it opens: yaw (radians, + is to your left), height relative to
    /// your eye (m), horizontal distance (m).
    pub home: Vec3,
}

pub const WINDOWS: [AppWindow; 3] = [
    AppWindow {
        app: "skies",
        size: Vec2::new(620.0, 430.0),
        home: Vec3::new(0.0, -0.14, 2.5),
    },
    AppWindow {
        app: "notes",
        size: Vec2::new(420.0, 470.0),
        home: Vec3::new(0.6, -0.1, 3.0),
    },
    AppWindow {
        app: "lenses",
        size: Vec2::new(500.0, 430.0),
        home: Vec3::new(-0.62, -0.1, 3.0),
    },
];

/// React → Bevy: open or close an app's window.
#[react_message(name = "panes.show")]
pub struct ShowPane {
    pub app: String,
    pub open: bool,
}

/// React → Bevy: the app's grab bar was pressed — follow the mouse.
#[react_message(name = "panes.grab")]
pub struct GrabPane {
    pub app: String,
}

/// React → Bevy: bring the app's window to where you are looking.
#[react_message(name = "panes.summon")]
pub struct SummonPane {
    pub app: String,
}

/// Bevy → React: a window was dragged somewhere new (the tour counts it).
#[react_event(name = "tour.moved")]
pub struct MovedWindow;

/// Texture pixels per UI pixel for every window. Picked at startup from the
/// window's resolution (`--shoot` sets its own).
#[derive(Resource, Clone, Copy)]
pub struct PaneScale(pub f32);

/// Whether the cursor is over a window (world input leaves it alone).
#[derive(Resource, Default)]
pub struct PointerOverPane(pub bool);

#[derive(Component)]
pub struct Pane {
    pub app: &'static str,
    /// Where the pane is (yaw, height, distance) — eased toward `target`.
    pub place: Vec3,
    pub target: Vec3,
    pub open: bool,
    /// 0 = gone, 1 = fully formed.
    pub presence: f32,
    hover: f32,
}

/// The pane following the mouse, and its grab offset.
#[derive(Resource, Default)]
struct Dragging(Option<Drag>);

struct Drag {
    pane: Entity,
    offset: Option<Vec2>,
    moved: f32,
}

pub struct PanesPlugin;

impl Plugin for PanesPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_plugins(MaterialPlugin::<PaneMaterial>::default())
            .init_resource::<PointerOverPane>()
            .init_resource::<Dragging>()
            .add_systems(Startup, spawn_panes)
            .add_systems(
                Update,
                (hover_panes, drag_pane, place_panes, shade_panes).chain(),
            );
    }
}

pub fn register_bindings(app: &mut App) {
    app.add_react_handler(on_show)
        .add_react_handler(on_grab)
        .add_react_handler(on_summon)
        .add_react_event::<MovedWindow>();
}

pub fn surface_name(app: &str) -> String {
    format!("pane-{app}")
}

/// Where a pane at (yaw, height, distance) sits, turned to face you.
pub fn pane_transform(place: Vec3) -> Transform {
    let (yaw, lift, dist) = (place.x, place.y, place.z);
    let pos = EYE + Vec3::new(-yaw.sin() * dist, lift, -yaw.cos() * dist);
    Transform::from_translation(pos).looking_to(pos - EYE, Vec3::Y)
}

fn spawn_panes(
    mut commands: Commands,
    mut surfaces: ResMut<Surfaces>,
    mut images: ResMut<Assets<Image>>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<PaneMaterial>>,
    scale: Option<Res<PaneScale>>,
    window: Single<&Window, With<PrimaryWindow>>,
) {
    // Match the windows' texture density to the screen's: about one texel
    // per screen pixel at the default distance.
    let scale = scale.map(|s| s.0).unwrap_or_else(|| {
        ((window.physical_width() as f32 / 1280.0 * 4.0).round() / 4.0).clamp(1.0, 2.5)
    });
    commands.insert_resource(PaneScale(scale));
    for (i, w) in WINDOWS.iter().enumerate() {
        let logical = Vec2::new(w.size.x, w.size.y + CHROME_PX);
        let texture = surfaces.create(
            &mut images,
            surface_name(w.app),
            SurfaceSpec {
                size: (logical * scale).round().as_uvec2(),
                clear_color: Color::NONE,
                scale_factor: scale,
                ..default()
            },
        );
        let quad = logical / PX_PER_M;
        let material = materials.add(PaneMaterial {
            shape: Vec4::new(quad.x, quad.y, w.size.y / PX_PER_M, RADIUS_PX / PX_PER_M),
            look: Vec4::new(0.0, 0.0, 18.0, i as f32 * 17.3),
            ui: texture,
        });
        commands.spawn((
            Pane {
                app: w.app,
                place: w.home,
                target: w.home,
                open: false,
                presence: 0.0,
                hover: 0.0,
            },
            Mesh3d(meshes.add(quad_mesh(quad))),
            MeshMaterial3d(material),
            SurfacePointer::new(surface_name(w.app)),
            pane_transform(w.home),
            Visibility::Hidden,
            bevy::light::NotShadowCaster,
        ));
    }
}

/// A quad `size` meters (the surface texture, UV 0..1), facing +Z, grown by
/// a thin margin whose UVs run past the texture: `pane.wgsl` antialiases the
/// glass's own edge, which must lie inside the geometry to be smoothed.
fn quad_mesh(size: Vec2) -> Mesh {
    let margin = 0.01;
    let uv_margin = Vec2::splat(margin) / size;
    let mut mesh: Mesh = Rectangle::from_size(size + Vec2::splat(margin * 2.0)).into();
    if let Some(VertexAttributeValues::Float32x2(uvs)) = mesh.attribute_mut(Mesh::ATTRIBUTE_UV_0) {
        for uv in uvs {
            let stretched = Vec2::from(*uv) * (Vec2::ONE + uv_margin * 2.0) - uv_margin;
            *uv = stretched.into();
        }
    }
    mesh
}

fn on_show(on: On<ShowPane>, mut panes: Query<&mut Pane>) {
    let msg = on.event();
    if let Some(mut pane) = panes.iter_mut().find(|p| p.app == msg.app) {
        pane.open = msg.open;
    }
}

fn on_grab(on: On<GrabPane>, panes: Query<(Entity, &Pane)>, mut dragging: ResMut<Dragging>) {
    if let Some((entity, _)) = panes.iter().find(|(_, p)| p.app == on.event().app) {
        dragging.0 = Some(Drag {
            pane: entity,
            offset: None,
            moved: 0.0,
        });
    }
}

fn on_summon(on: On<SummonPane>, look: Res<Look>, mut panes: Query<&mut Pane>) {
    if let Some(mut pane) = panes.iter_mut().find(|p| p.app == on.event().app) {
        pane.open = true;
        pane.target.x = look.target.x;
        pane.target.y = (look.target.y.tan() * pane.target.z).clamp(-1.2, 1.4) - 0.08;
    }
}

/// Is the cursor over a window? (One ray against the panes' quads.)
fn hover_panes(
    window: Single<&Window, With<PrimaryWindow>>,
    eye: Single<(&Camera, &GlobalTransform), With<Eye>>,
    panes: Query<(), With<Pane>>,
    mut over: ResMut<PointerOverPane>,
    mut ray_cast: MeshRayCast,
    mut hovered: Local<Option<Entity>>,
    mut states: Query<&mut Pane>,
) {
    let (camera, transform) = *eye;
    let hit = window
        .cursor_position()
        .and_then(|cursor| camera.viewport_to_world(transform, cursor).ok())
        .and_then(|ray| {
            let filter = |e: Entity| panes.contains(e);
            let settings = MeshRayCastSettings::default().with_filter(&filter);
            ray_cast.cast_ray(ray, &settings).first().map(|(e, _)| *e)
        });
    over.0 = hit.is_some();
    if *hovered != hit {
        for (entity, hover) in [(*hovered, 0.0), (hit, 1.0)] {
            if let Some(mut pane) = entity.and_then(|e| states.get_mut(e).ok()) {
                pane.hover = hover;
            }
        }
        *hovered = hit;
    }
}

/// While a grab bar is held, the pane follows the cursor around the
/// cylinder you stand in (the wheel moves it nearer or farther).
fn drag_pane(
    buttons: Res<ButtonInput<MouseButton>>,
    mut wheel: MessageReader<MouseWheel>,
    window: Single<&Window, With<PrimaryWindow>>,
    eye: Single<(&Camera, &GlobalTransform), With<Eye>>,
    mut dragging: ResMut<Dragging>,
    mut panes: Query<&mut Pane>,
    events: ReactEvents,
) {
    let Some(drag) = dragging.0.as_mut() else {
        wheel.clear();
        return;
    };
    let Ok(mut pane) = panes.get_mut(drag.pane) else {
        dragging.0 = None;
        return;
    };
    if !buttons.pressed(MouseButton::Left) {
        if drag.moved > 0.08 {
            events.send(&MovedWindow);
        }
        dragging.0 = None;
        return;
    }
    for ev in wheel.read() {
        let lines = match ev.unit {
            MouseScrollUnit::Line => ev.y,
            MouseScrollUnit::Pixel => ev.y / 40.0,
        };
        pane.target.z = (pane.target.z - lines * 0.15).clamp(MIN_DISTANCE, MAX_DISTANCE);
    }
    let (camera, transform) = *eye;
    let Some(ray) = window
        .cursor_position()
        .and_then(|c| camera.viewport_to_world(transform, c).ok())
    else {
        return;
    };
    let r = ray.direction.as_vec3();
    let flat = Vec2::new(r.x, r.z).length().max(1e-3);
    let hit = Vec2::new((-r.x).atan2(-r.z), r.y / flat * pane.target.z);
    let offset = *drag
        .offset
        .get_or_insert(Vec2::new(pane.target.x, pane.target.y) - hit);
    let next = (hit + offset).clamp(Vec2::new(-2.6, -1.3), Vec2::new(2.6, 1.6));
    drag.moved += (next - Vec2::new(pane.target.x, pane.target.y)).length();
    pane.target.x = next.x;
    pane.target.y = next.y;
}

/// Ease every pane toward its place and its presence toward open/closed.
fn place_panes(time: Res<Time>, mut panes: Query<(&mut Pane, &mut Transform, &mut Visibility)>) {
    let dt = time.delta_secs();
    let k = 1.0 - (-11.0 * dt).exp();
    for (mut pane, mut transform, mut visibility) in &mut panes {
        let pane = &mut *pane;
        pane.place = pane.place.lerp(pane.target, k);
        pane.presence = if pane.open {
            (pane.presence + dt / OPEN_SECS).min(1.0)
        } else {
            (pane.presence - dt / CLOSE_SECS).max(0.0)
        };
        visibility.set_if_neq(if pane.presence > 0.0 {
            Visibility::Inherited
        } else {
            Visibility::Hidden
        });
        // A forming window drifts in from slightly farther and smaller.
        let ease = 1.0 - (1.0 - pane.presence).powi(3);
        let mut place = pane.place;
        place.z += (1.0 - ease) * 0.6;
        // A dragged pane leans into its motion.
        let lean = (pane.target.x - pane.place.x).clamp(-0.4, 0.4);
        let mut t = pane_transform(place);
        t.rotate_local_y(-lean * 0.6);
        t.scale = Vec3::splat(0.9 + 0.1 * ease);
        *transform = t;
    }
}

/// Feed presence and hover to each pane's shader (only when they change).
fn shade_panes(
    time: Res<Time>,
    panes: Query<(&Pane, &MeshMaterial3d<PaneMaterial>)>,
    mut materials: ResMut<Assets<PaneMaterial>>,
) {
    let k = 1.0 - (-10.0 * time.delta_secs()).exp();
    for (pane, handle) in &panes {
        let Some(m) = materials.get(&handle.0) else {
            continue;
        };
        let hover = m.look.y + (pane.hover - m.look.y) * k;
        let presence = pane.presence;
        if ((m.look.x - presence).abs() > 1e-4 || (m.look.y - hover).abs() > 1e-3)
            && let Some(mut m) = materials.get_mut(&handle.0)
        {
            m.look.x = presence;
            m.look.y = hover;
        }
    }
}
