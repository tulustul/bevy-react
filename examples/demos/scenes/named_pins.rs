//! The "Named nodes" demo scene: a 3D **pin** hanging off every React node
//! named `"pin"`. React declares `<node name="pin">` cards; nothing else
//! crosses the wire. Bevy finds the cards through the [`ReactNodes`] index,
//! reads their layout (`ComputedNode` + `UiGlobalTransform`), projects each
//! card's screen center onto the (invisible) ground plane and fixes one end of
//! a tube there; the tube's other end is a glowing ball on an elastic rod — a
//! damped spring pendulum under gravity (pointing down the screen), so
//! dragging or relayout makes it swing and bounce, and it always ends up
//! hanging straight below. The camera is fixed for this scene (see
//! `camera.rs`), so the view reads as 2D: pins never swing because the camera
//! moved. Hovering a card makes its ball glow (read straight off the node's
//! `Interaction`). No messages, no events, no entity ids handed around.

use bevy::light::NotShadowCaster;
use bevy::prelude::*;
use bevy::transform::TransformSystems;
use bevy::ui::{CalculatedClip, ComputedNode, IsDefaultUiCamera, UiGlobalTransform, UiSystems};
use bevy_react::{ReactApplySet, ReactNodes};

use crate::scene::Scene;

/// The `name` the demo's cards carry — group semantics: every card shares it.
const PIN_NAME: &str = "pin";

/// Ball + tube geometry (world units). The tube is a unit-height cylinder
/// scaled to the anchor→ball distance each frame.
const BALL_RADIUS: f32 = 0.32;
const TUBE_RADIUS: f32 = 0.05;
/// Height of the tube's fixed end above the ground (so it reads as pinned to
/// the card, not buried).
const ANCHOR_LIFT: f32 = 0.2;
/// How far below the card's center (screen px) the ball hangs at rest. The
/// hang direction and rod length are derived per pin by projecting this
/// screen offset onto the ground, so under perspective every ball still hangs
/// straight down on screen, at the same on-screen length.
const HANG_PX: f32 = 150.0;
/// Gravity (world units/s²) pulling the ball down the screen, so it always
/// settles hanging straight below its card. Sized for a ~1s swing.
const GRAVITY: f32 = 100.0;
/// Rod spring stiffness (units/s² per unit of stretch): the rod is elastic,
/// so a yanked ball also bounces along the rod, not just swings.
const SPRING: f32 = 100.0;
/// Per-substep velocity loss (Verlet drag): a few swings, then it rests.
const DRAG: f32 = 0.05;
/// Fixed physics substep so the Verlet integration is frame-rate independent.
const SUBSTEP: f32 = 1.0 / 120.0;
/// Ball glow: emissive = palette color × intensity. Hover ramps the intensity
/// (eased) instead of touching the geometry.
const GLOW: f32 = 1.0;
const HOVER_GLOW: f32 = 30.0;
const EASE_RATE: f32 = 14.0;

pub struct NamedPinsScenePlugin;

impl Plugin for NamedPinsScenePlugin {
    fn build(&self, app: &mut App) {
        // No `register_bindings`: this scene has no React messages of its own —
        // that is the point of the demo.
        app.add_systems(Startup, setup_pin_assets)
            .add_systems(OnEnter(Scene::NamedNodes), reset_counter)
            .add_systems(
                Update,
                // See this frame's mounts/unmounts (`ReactNodes` is updated in
                // `ReactApplySet`), not last frame's.
                sync_pins
                    .after(ReactApplySet)
                    .run_if(in_state(Scene::NamedNodes)),
            )
            .add_systems(
                PostUpdate,
                // Rigid attachment: read the card's `UiGlobalTransform` AFTER
                // bevy_ui laid out this frame (`UiSystems::Layout` writes it,
                // `PostLayout` the clip), and write the pin transforms BEFORE
                // transform propagation — so a dragged card and its tube move
                // in the same frame, never a frame apart.
                place_pins
                    .after(UiSystems::PostLayout)
                    .before(TransformSystems::Propagate)
                    .run_if(in_state(Scene::NamedNodes)),
            );
    }
}

#[derive(Resource)]
struct PinAssets {
    ball: Handle<Mesh>,
    tube: Handle<Mesh>,
    tube_material: Handle<StandardMaterial>,
    /// Ball palette; a pin picks a color by its spawn counter and gets its
    /// own material so its glow can be driven independently.
    palette: Vec<Color>,
}

/// A pin following one React entity (the card named `"pin"` it was spawned
/// for). The entity itself sits at the identity transform; its two children
/// (ball, tube) are positioned in world space every frame.
#[derive(Component)]
struct Pin {
    node: Entity,
    ball: Entity,
    tube: Entity,
    /// The ball's simulated position on the ground plane, current and
    /// previous substep (Verlet integration: velocity is their difference).
    pos: Vec3,
    prev: Vec3,
    /// The ball's own material + base color, for the hover glow.
    material: Handle<StandardMaterial>,
    color: LinearRgba,
    /// Current emissive intensity, eased toward `GLOW`/`HOVER_GLOW`.
    glow: f32,
    /// Whether the pin is currently placed (card visible, ray hits ground).
    visible: bool,
}

/// Marks a pin's ball/tube child so their transforms can be written directly.
#[derive(Component)]
struct PinPart;

/// Counts pins spawned in this scene run, to rotate through the ball palette.
#[derive(Resource, Default)]
struct PinCounter(usize);

fn setup_pin_assets(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    let palette = [
        Color::srgb_u8(0x7a, 0xa2, 0xf7),
        Color::srgb_u8(0xf7, 0x76, 0x8e),
        Color::srgb_u8(0x9e, 0xce, 0x6a),
        Color::srgb_u8(0xe0, 0xaf, 0x68),
        Color::srgb_u8(0xbb, 0x9a, 0xf7),
        Color::srgb_u8(0x7d, 0xcf, 0xff),
    ];
    commands.insert_resource(PinAssets {
        ball: meshes.add(Sphere::new(BALL_RADIUS)),
        tube: meshes.add(Cylinder::new(TUBE_RADIUS, 1.0)),
        tube_material: materials.add(StandardMaterial {
            base_color: Color::srgb(0.85, 0.87, 0.95),
            ..default()
        }),
        palette: palette.to_vec(),
    });
    commands.init_resource::<PinCounter>();
}

/// Fresh scene run, fresh palette rotation. (There is no ground mesh: pins
/// stand on the invisible `y = 0` plane over the ambient backdrop.)
fn reset_counter(mut counter: ResMut<PinCounter>) {
    counter.0 = 0;
}

/// Keep exactly one pin per live React node named `"pin"`: spawn for new
/// cards, despawn for unmounted ones. `ReactNodes::all` lists the cards in
/// mount order — no React-side bookkeeping, no ids over the wire.
fn sync_pins(
    mut commands: Commands,
    nodes: ReactNodes,
    assets: Res<PinAssets>,
    mut materials: ResMut<Assets<StandardMaterial>>,
    mut counter: ResMut<PinCounter>,
    pins: Query<(Entity, &Pin)>,
) {
    let wanted = nodes.all(PIN_NAME);
    for (entity, pin) in &pins {
        if !wanted.contains(&pin.node) {
            commands.entity(entity).despawn();
        }
    }
    for &node in wanted {
        if pins.iter().any(|(_, p)| p.node == node) {
            continue;
        }
        let color = assets.palette[counter.0 % assets.palette.len()].to_linear();
        counter.0 += 1;
        let material = materials.add(StandardMaterial {
            base_color: color.into(),
            emissive: color * GLOW,
            ..default()
        });
        // No shadows: a tube's shadow on the backdrop reads as a second pin.
        let ball = commands
            .spawn((
                Mesh3d(assets.ball.clone()),
                MeshMaterial3d(material.clone()),
                Transform::IDENTITY,
                NotShadowCaster,
                PinPart,
            ))
            .id();
        let tube = commands
            .spawn((
                Mesh3d(assets.tube.clone()),
                MeshMaterial3d(assets.tube_material.clone()),
                Transform::IDENTITY,
                NotShadowCaster,
                PinPart,
            ))
            .id();
        commands
            .spawn((
                Pin {
                    node,
                    ball,
                    tube,
                    pos: Vec3::ZERO,
                    prev: Vec3::ZERO,
                    material,
                    color,
                    glow: GLOW,
                    visible: false,
                },
                Transform::IDENTITY,
                Visibility::Hidden,
                DespawnOnExit(Scene::NamedNodes),
            ))
            .add_children(&[ball, tube]);
    }
}

/// Project each card's screen center through the camera onto the ground; that
/// is the rod's pivot. The ball is a damped spring pendulum on the ground
/// plane: gravity points down the screen (the ground direction under a point
/// `HANG_PX` below the card — exact under perspective, not merely "toward the
/// camera"), the elastic rod pulls it toward that rest length, so a moving
/// card swings and bounces it and it settles hanging straight below. A card
/// scrolled out of its container (its `CalculatedClip` no longer contains the
/// center) or off screen hides its pin; a hovered card (the node's own
/// `Interaction`) ramps its ball's glow.
fn place_pins(
    time: Res<Time>,
    mut materials: ResMut<Assets<StandardMaterial>>,
    camera: Single<(&Camera, &GlobalTransform), With<IsDefaultUiCamera>>,
    cards: Query<(
        &ComputedNode,
        &UiGlobalTransform,
        Option<&CalculatedClip>,
        Option<&Interaction>,
    )>,
    mut pins: Query<(&mut Pin, &mut Visibility)>,
    mut parts: Query<&mut Transform, With<PinPart>>,
) {
    let (cam, cam_tf) = *camera;
    // Clamp so a hitch (or the first frame) can't launch the pendulum.
    let dt = time.delta_secs().min(1.0 / 30.0);
    let ease = 1.0 - (-EASE_RATE * dt).exp();
    let substeps = (dt / SUBSTEP).ceil().max(1.0);
    let h = dt / substeps;
    for (mut pin, mut visibility) in &mut pins {
        let Ok((computed, ui_tf, clip, interaction)) = cards.get(pin.node) else {
            continue;
        };
        // `UiGlobalTransform` is the node's center in physical px; the camera
        // wants logical viewport px.
        let center_physical = ui_tf.translation;
        let center = center_physical * computed.inverse_scale_factor();
        let clipped = clip.is_some_and(|c| !c.clip.contains(center_physical));
        let ground = |screen: Vec2| {
            cam.viewport_to_world(cam_tf, screen).ok().and_then(|ray| {
                ray.intersect_plane(Vec3::ZERO, InfinitePlane3d::new(Vec3::Y))
                    .map(|d| ray.get_point(d))
            })
        };
        let anchor = (!clipped && computed.size().x > 0.0)
            .then(|| ground(center))
            .flatten();
        let Some(anchor) = anchor else {
            pin.visible = false;
            if *visibility != Visibility::Hidden {
                *visibility = Visibility::Hidden;
            }
            continue;
        };

        // "Down" and the rod's rest length come from the ground point under
        // the screen point `HANG_PX` below the card: screen-down exactly, and
        // a uniform on-screen hang wherever the card sits in the perspective.
        let hang = ground(center + Vec2::Y * HANG_PX)
            .map(|p| (p - anchor).with_y(0.0))
            .filter(|v| v.length_squared() > 1e-6)
            .unwrap_or(Vec3::Z);
        let down = hang.normalize();
        // Rest length minus the static stretch gravity adds, so it hangs at
        // exactly `HANG_PX` when settled.
        let rest_len = (hang.length() - GRAVITY / SPRING).max(0.1);
        if !pin.visible {
            // First placement (or back on screen): start at rest, don't fly in.
            pin.pos = anchor + hang;
            pin.prev = pin.pos;
            pin.visible = true;
            if *visibility != Visibility::Inherited {
                *visibility = Visibility::Inherited;
            }
        }
        // Verlet spring pendulum: gravity down the screen, an elastic rod
        // pulling toward its rest length, drag. Moving the pivot (dragging the
        // card) stretches the rod, which yanks the ball after it.
        for _ in 0..substeps as u32 {
            let velocity = (pin.pos - pin.prev) * (1.0 - DRAG);
            let rod = (pin.pos - anchor).with_y(0.0);
            let len = rod.length().max(1e-3);
            let accel = down * GRAVITY - rod / len * (len - rest_len) * SPRING;
            pin.prev = pin.pos;
            pin.pos = (pin.pos + velocity + accel * h * h).with_y(0.0);
        }

        // Hover: ease the glow and write the emissive only when it moved, so
        // an idle pin never dirties its material.
        let hovered = matches!(
            interaction,
            Some(Interaction::Hovered | Interaction::Pressed)
        );
        let target_glow = if hovered { HOVER_GLOW } else { GLOW };
        let next_glow = pin.glow + (target_glow - pin.glow) * ease;
        if (next_glow - pin.glow).abs() > 1e-3 {
            pin.glow = next_glow;
            if let Some(mut material) = materials.get_mut(&pin.material) {
                material.emissive = pin.color * pin.glow;
            }
        }

        // Ball: resting on the ground at its simulated position.
        let ball_center = pin.pos + Vec3::Y * BALL_RADIUS;
        if let Ok(mut tf) = parts.get_mut(pin.ball) {
            tf.translation = ball_center;
        }
        // Tube: from the lifted anchor to the ball's center, a unit cylinder
        // rotated onto that segment and scaled to its length.
        let start = anchor + Vec3::Y * ANCHOR_LIFT;
        let segment = ball_center - start;
        let len = segment.length().max(1e-3);
        if let Ok(mut tf) = parts.get_mut(pin.tube) {
            tf.translation = start + segment / 2.0;
            tf.rotation = Quat::from_rotation_arc(Vec3::Y, segment / len);
            tf.scale = Vec3::new(1.0, len, 1.0);
        }
    }
}
