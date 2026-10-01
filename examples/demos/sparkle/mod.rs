//! `sparkle` — an app-registered style property: any styled node with
//! `style={{ sparkle: { rate } }}` emits glowing diamond glints that drift
//! up, twinkle and fade. The "Custom styles" demo.
//!
//! The smallest extension there is: a `static` [`StyleProperty`]
//! registered with `add_react_style`, and **no writer**. A property no
//! writer reads is auto-stamped by the core as a [`StyleValue<Sparkle>`]
//! component — present exactly while the merged style sets it, hover and
//! press variants included — so the app's own systems just query it:
//!
//! - [`emit_sparkles`] spawns particles at random points of each emitter's
//!   box (read from its `ComputedNode` + `UiGlobalTransform`, so a moving or
//!   transformed node carries its emission along), keeping its per-node
//!   state (fractional carry, RNG) in an [`Emitter`] component of its own.
//! - [`animate_sparkles`] ages them: drift, twinkle, shrink, fade, despawn.
//!
//! A second property, `sparkleBurst: number`, is a trigger key (the
//! `morphFilter.key` pattern): every new value bursts a ring of particles
//! outward in every direction ([`burst_sparkles`]); the first value is only
//! recorded. It is its own property, not a `sparkle` field, because a
//! hover/press variant replaces a property's whole value — a key inside
//! `sparkle` would vanish while hovered, exactly when a click lands.
//!
//! Particles are plain `Node`s in one app-owned overlay root React never
//! sees ([`SparkleLayer`]), drawn above the UI and ignored by picking — so
//! they escape the emitter's clipping, like particles on the web. When the
//! style goes away (a hover ends) emission stops; live particles finish.
//!
//! A property that needs its own component shape (a writer's
//! compare-before-write, a component the app must own) registers a
//! `Writer` with `add_react_style_writer` instead.

use bevy::picking::Pickable;
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform, UiTransform, Val2};
use bevy_react::style::{StyleProperty, StyleValue};
use bevy_react::{ReactAppExt, ReactApplySet, ReactNode};
use serde::Deserialize;
use ts_rs::TS;

#[cfg(test)]
mod tests;

/// The `sparkle` style value: how many particles a node emits, and how
/// they look.
#[derive(Debug, Clone, PartialEq, Deserialize, TS)]
pub struct Sparkle {
    /// Particles per second.
    pub rate: f32,
    /// Particle color, any CSS color (default gold).
    #[serde(default)]
    #[ts(optional)]
    pub color: Option<String>,
    /// Particle size in logical px (default `6`).
    #[serde(default)]
    #[ts(optional)]
    pub size: Option<f32>,
}

/// The property declaration — the static is also its typed key.
pub static SPARKLE: StyleProperty<Sparkle> = StyleProperty::new("sparkle");

/// The `sparkleBurst` style value: a trigger key — change it (a click
/// counter) to burst particles outward. A newtype: stamped value types must
/// be unique.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, TS)]
pub struct SparkleBurst(pub f32);

pub static SPARKLE_BURST: StyleProperty<SparkleBurst> = StyleProperty::new("sparkleBurst");

const DEFAULT_COLOR: Srgba = Srgba::new(1.0, 0.82, 0.35, 1.0);
const DEFAULT_SIZE: f32 = 6.0;
/// Particle lifetime range, seconds.
const LIFE: (f32, f32) = (0.6, 1.0);
/// Upward drift range, logical px per second.
const RISE: (f32, f32) = (18.0, 48.0);
/// Horizontal drift, ± logical px per second.
const SWAY: f32 = 16.0;
/// Emission is capped per frame, so a hitch never dumps a burst.
const MAX_PER_FRAME: u32 = 8;
/// Particles in one burst.
const BURST_COUNT: u32 = 48;
/// Burst launch speed range, logical px per second.
const BURST_SPEED: (f32, f32) = (160.0, 360.0);
/// Burst deceleration rate, 1/s: a particle travels at most `speed / drag`.
const BURST_DRAG: f32 = 3.2;
/// Burst particle lifetime range, seconds.
const BURST_LIFE: (f32, f32) = (0.7, 1.2);

/// Adds the `sparkle` style property and its particle systems.
pub struct SparklePlugin;

impl Plugin for SparklePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        // Emit and burst after the op drain (this frame's stamps), then age
        // every particle.
        app.add_systems(Startup, spawn_sparkle_layer).add_systems(
            Update,
            (
                (emit_sparkles, burst_sparkles).after(ReactApplySet),
                animate_sparkles,
            )
                .chain(),
        );
    }
}

/// The properties alone — what the TypeScript exporter needs to type
/// `BevyStyle.sparkle`/`sparkleBurst` (the generated `bevy.ts`
/// augmentation).
pub fn register_bindings(app: &mut App) {
    app.add_react_style(&SPARKLE);
    app.add_react_style(&SPARKLE_BURST);
}

/// The overlay root every particle lives under.
#[derive(Component)]
pub struct SparkleLayer;

/// One emitter's own state, next to the core-stamped `StyleValue<Sparkle>`.
#[derive(Component)]
pub struct Emitter {
    /// The fractional particle carried to the next frame.
    carry: f32,
    rng: u32,
    /// The parsed `color`, refreshed when the style value changes.
    color: Srgba,
}

/// The last `sparkleBurst` key a node showed, next to its stamp.
#[derive(Component)]
pub struct BurstSeen {
    key: f32,
    rng: u32,
}

/// One live particle.
#[derive(Component)]
pub struct Particle {
    age: f32,
    life: f32,
    /// Launch velocity, logical px per second.
    velocity: Vec2,
    /// Deceleration rate, 1/s (`0` = constant drift).
    drag: f32,
    color: Srgba,
    /// Twinkle phase, radians.
    phase: f32,
}

fn spawn_sparkle_layer(mut commands: Commands) {
    commands.spawn((
        SparkleLayer,
        Node {
            position_type: PositionType::Absolute,
            width: Val::Percent(100.0),
            height: Val::Percent(100.0),
            ..default()
        },
        // Above the React UI.
        GlobalZIndex(1_000),
        Pickable::IGNORE,
    ));
}

/// Spawn this frame's particles for every sparkling node, and drop the
/// state of nodes that stopped.
#[allow(clippy::type_complexity)]
pub fn emit_sparkles(
    time: Res<Time>,
    mut commands: Commands,
    layer: Query<Entity, With<SparkleLayer>>,
    mut emitters: Query<(
        Entity,
        Ref<StyleValue<Sparkle>>,
        &ComputedNode,
        &UiGlobalTransform,
        &InheritedVisibility,
        Option<&mut Emitter>,
        Option<&ReactNode>,
    )>,
    stopped: Query<Entity, (With<Emitter>, Without<StyleValue<Sparkle>>)>,
) {
    for entity in &stopped {
        commands.entity(entity).remove::<Emitter>();
    }
    let Ok(layer) = layer.single() else {
        return;
    };
    let dt = time.delta_secs();
    for (entity, sparkle, node, global, visible, emitter, rnode) in &mut emitters {
        let Some(mut emitter) = emitter else {
            commands.entity(entity).insert(Emitter {
                carry: 0.0,
                rng: (entity.to_bits() as u32).wrapping_mul(0x9E37_79B9) | 1,
                color: particle_color(&sparkle.0, rnode),
            });
            continue;
        };
        if sparkle.is_changed() {
            emitter.color = particle_color(&sparkle.0, rnode);
        }
        if !visible.get() || node.size == Vec2::ZERO {
            continue;
        }
        let due = emitter.carry + sparkle.0.rate.max(0.0) * dt;
        let count = (due.floor() as u32).min(MAX_PER_FRAME);
        emitter.carry = due.fract();

        let color = emitter.color;
        let size = sparkle.0.size.unwrap_or(DEFAULT_SIZE).max(0.5);
        for _ in 0..count {
            let rng = &mut emitter.rng;
            // A random point of the border box, in the node's local
            // (centered, physical px) space, through its global transform
            // (a shake or a press scale moves the emission with the node).
            let local = (Vec2::new(next(rng), next(rng)) - 0.5) * node.size;
            let at = global.transform_point2(local) * node.inverse_scale_factor;
            let particle = Particle {
                age: 0.0,
                life: lerp(LIFE, next(rng)),
                velocity: Vec2::new((next(rng) * 2.0 - 1.0) * SWAY, -lerp(RISE, next(rng))),
                drag: 0.0,
                color,
                phase: next(rng) * std::f32::consts::TAU,
            };
            spawn_particle(&mut commands, layer, at, size, particle);
        }
    }
}

/// Burst a ring of particles outward from every node whose `sparkleBurst`
/// key changed — the first key a node shows is only recorded. Color and size
/// follow the node's `sparkle`, when it has one.
#[allow(clippy::type_complexity)]
pub fn burst_sparkles(
    mut commands: Commands,
    layer: Query<Entity, With<SparkleLayer>>,
    mut nodes: Query<
        (
            Entity,
            &StyleValue<SparkleBurst>,
            Option<&mut BurstSeen>,
            &ComputedNode,
            &UiGlobalTransform,
            &InheritedVisibility,
            Option<&Emitter>,
            Option<&StyleValue<Sparkle>>,
        ),
        Changed<StyleValue<SparkleBurst>>,
    >,
    stopped: Query<Entity, (With<BurstSeen>, Without<StyleValue<SparkleBurst>>)>,
) {
    for entity in &stopped {
        commands.entity(entity).remove::<BurstSeen>();
    }
    let Ok(layer) = layer.single() else {
        return;
    };
    for (entity, burst, seen, node, global, visible, emitter, sparkle) in &mut nodes {
        let key = burst.0.0;
        let Some(mut seen) = seen else {
            commands.entity(entity).insert(BurstSeen {
                key,
                rng: (entity.to_bits() as u32).wrapping_mul(0x85EB_CA6B) | 1,
            });
            continue;
        };
        if seen.key == key {
            continue;
        }
        seen.key = key;
        if !visible.get() || node.size == Vec2::ZERO {
            continue;
        }
        let color = emitter.map_or(DEFAULT_COLOR, |e| e.color);
        let size = sparkle
            .and_then(|s| s.0.size)
            .unwrap_or(DEFAULT_SIZE)
            .max(0.5)
            * 1.3;
        let rng = &mut seen.rng;
        for i in 0..BURST_COUNT {
            // Evenly around the circle, jittered, launched from the ellipse
            // inscribed in the border box so the ring leaves the node's
            // outline rather than its center.
            let angle = (i as f32 + next(rng)) / BURST_COUNT as f32 * std::f32::consts::TAU;
            let dir = Vec2::from_angle(angle);
            let local = dir * node.size * 0.5 * lerp((0.6, 1.0), next(rng));
            let at = global.transform_point2(local) * node.inverse_scale_factor;
            let particle = Particle {
                age: 0.0,
                life: lerp(BURST_LIFE, next(rng)),
                velocity: dir * lerp(BURST_SPEED, next(rng)),
                drag: BURST_DRAG,
                color,
                phase: next(rng) * std::f32::consts::TAU,
            };
            spawn_particle(&mut commands, layer, at, size, particle);
        }
    }
}

/// Spawn one particle centered at `at` (logical px) under the layer.
fn spawn_particle(commands: &mut Commands, layer: Entity, at: Vec2, size: f32, particle: Particle) {
    let color = particle.color;
    commands.spawn((
        particle,
        ChildOf(layer),
        Node {
            position_type: PositionType::Absolute,
            left: Val::Px(at.x - size / 2.0),
            top: Val::Px(at.y - size / 2.0),
            width: Val::Px(size),
            height: Val::Px(size),
            border_radius: BorderRadius::all(Val::Px(size * 0.2)),
            ..default()
        },
        BackgroundColor(color.into()),
        BoxShadow::new(
            color.with_alpha(0.8).into(),
            Val::ZERO,
            Val::ZERO,
            Val::ZERO,
            Val::Px(size * 1.5),
        ),
        UiTransform::default(),
        Pickable::IGNORE,
    ));
}

/// The sparkle's particle color: its `color` parsed, or gold. An
/// unparsable color warns once per change, attributed to the node.
fn particle_color(sparkle: &Sparkle, rnode: Option<&ReactNode>) -> Srgba {
    let Some(input) = sparkle.color.as_deref() else {
        return DEFAULT_COLOR;
    };
    bevy_react::raster::parse_css_color(input).unwrap_or_else(|| {
        let _diag = rnode.map(|r| bevy_react::diag::node_scope(r.0));
        let msg = format!("sparkle: unrecognized color {input:?}");
        bevy_react::diag::report("color", input, &msg);
        DEFAULT_COLOR
    })
}

/// Age every particle: it drifts, twinkles, shrinks and fades, and is
/// despawned at the end of its life.
pub fn animate_sparkles(
    time: Res<Time>,
    mut commands: Commands,
    mut particles: Query<(
        Entity,
        &mut Particle,
        &mut UiTransform,
        &mut BackgroundColor,
        &mut BoxShadow,
    )>,
) {
    let dt = time.delta_secs();
    for (entity, mut p, mut transform, mut background, mut shadow) in &mut particles {
        p.age += dt;
        if p.age >= p.life {
            commands.entity(entity).despawn();
            continue;
        }
        let t = p.age / p.life;
        // Constant drift, or a launch decelerating under drag.
        let travel = if p.drag > 0.0 {
            (1.0 - (-p.drag * p.age).exp()) / p.drag
        } else {
            p.age
        };
        let offset = p.velocity * travel;
        transform.translation = Val2::px(offset.x, offset.y);
        transform.scale = Vec2::splat(1.0 - t * t);
        // A diamond glint, slowly turning.
        transform.rotation = Rot2::radians(std::f32::consts::FRAC_PI_4 + p.age * 3.0);
        let twinkle = 0.65 + 0.35 * (p.age * 18.0 + p.phase).sin();
        let alpha = (1.0 - t) * twinkle;
        background.0 = p.color.with_alpha(alpha).into();
        if let Some(glow) = shadow.0.first_mut() {
            glow.color = p.color.with_alpha(alpha * 0.8).into();
        }
    }
}

/// A uniform float in `0..1` from a xorshift32 state.
fn next(state: &mut u32) -> f32 {
    let mut x = *state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    *state = x;
    (x >> 8) as f32 / (1u32 << 24) as f32
}

fn lerp((a, b): (f32, f32), t: f32) -> f32 {
    a + (b - a) * t
}
