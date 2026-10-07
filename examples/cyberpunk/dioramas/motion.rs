//! The few things that move: the street's fires following the heat (and
//! their lights flickering), turbine blades turning, beacons blinking.

use bevy::prelude::*;

use super::materials::ParticleMaterial;

/// How hot the difficulty card's street burns: eased toward the level
/// React picked (0 = EASY … 3 = VERY HARD).
#[derive(Resource, Default)]
pub(super) struct Heat {
    pub(super) target: f32,
    pub(super) now: f32,
}

/// Part of a fire — an emitter or a light — that wakes as the heat climbs
/// from `from` to `full`, and grows by `grow` per level of heat. `base` is
/// the emitter's size or the light's intensity at heat 0.
#[derive(Component, Clone, Copy)]
pub struct Burn {
    pub from: f32,
    pub full: f32,
    pub grow: f32,
    pub base: f32,
}

impl Burn {
    pub(super) fn strength(&self, heat: f32) -> f32 {
        ((heat - self.from) / (self.full - self.from).max(0.01)).clamp(0.0, 1.0)
    }

    fn scale(&self, heat: f32) -> f32 {
        self.base * (1.0 + self.grow * heat)
    }
}

/// Ease the heat (~0.5 s), feed it to the fires, and flicker their lights.
pub(super) fn stoke(
    time: Res<Time>,
    mut heat: ResMut<Heat>,
    emitters: Query<(&Burn, &MeshMaterial3d<ParticleMaterial>)>,
    mut lights: Query<(Entity, &Burn, &mut PointLight, &mut Visibility)>,
    mut materials: ResMut<Assets<ParticleMaterial>>,
) {
    let gap = heat.target - heat.now;
    if gap.abs() > 1e-3 {
        heat.now += gap * (1.0 - (-7.0 * time.delta_secs()).exp());
        for (burn, material) in &emitters {
            if let Some(mut m) = materials.get_mut(&material.0) {
                m.params.y = burn.strength(heat.now);
                m.params.z = burn.scale(heat.now);
            }
        }
    }
    let t = time.elapsed_secs();
    for (entity, burn, mut light, mut visibility) in &mut lights {
        let s = burn.strength(heat.now);
        let phase = entity.index_u32() as f32 * 1.7;
        let flicker = 0.82
            + 0.1 * (t * 11.0 + phase).sin()
            + 0.08 * (t * 27.0 + phase * 2.3).sin() * (t * 3.1 + phase).sin();
        light.intensity = burn.scale(heat.now) * s * flicker;
        visibility.set_if_neq(if s > 0.0 {
            Visibility::Inherited
        } else {
            Visibility::Hidden
        });
    }
}

/// Rotate about a local axis, radians per second.
#[derive(Component)]
pub struct Spin(pub Vec3, pub f32);

pub(super) fn spin(time: Res<Time>, mut q: Query<(&Spin, &mut Transform)>) {
    for (Spin(axis, speed), mut t) in &mut q {
        t.rotate_local_axis(
            Dir3::new(*axis).unwrap_or(Dir3::Y),
            speed * time.delta_secs(),
        );
    }
}

/// On for the first `duty` of every `period` seconds (aviation lights).
#[derive(Component)]
pub struct Blink {
    pub period: f32,
    pub duty: f32,
    pub phase: f32,
}

pub(super) fn blink(time: Res<Time>, mut q: Query<(&Blink, &mut Visibility)>) {
    let t = time.elapsed_secs();
    for (b, mut visibility) in &mut q {
        let on = ((t + b.phase) / b.period).fract() < b.duty;
        visibility.set_if_neq(if on {
            Visibility::Inherited
        } else {
            Visibility::Hidden
        });
    }
}
