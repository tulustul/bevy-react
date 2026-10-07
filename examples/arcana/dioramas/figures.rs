//! The figures of the Major Arcana — fool, magician, priestess, empress,
//! emperor, chariot, wheel, tower — as little worlds of primitives and light.

use std::f32::consts::{FRAC_PI_2, PI, TAU};

use bevy::math::primitives::Tetrahedron;
use bevy::mesh::{ConeAnchor, ConeMeshBuilder};
use bevy::prelude::*;

use super::scenes::{faceted, rgb, ring};
use super::{Bob, Ctx, Flicker, Orbit, Pulse, Spin};

/// 0 · The Fool — two playful lights, one chasing the other's trail.
pub(super) fn fool(ctx: &mut Ctx) {
    let orb = ctx.mesh(Sphere::new(1.0));
    let warm = ctx.glow(rgb(255, 214, 150), 6.0);
    let pale = ctx.glow(rgb(190, 220, 255), 5.0);
    let trails = [
        (
            &warm,
            1.15,
            1.3,
            Quat::from_euler(EulerRot::XYZ, 1.1, 0.0, 0.35),
            0.14,
        ),
        (
            &pale,
            0.7,
            -1.9,
            Quat::from_euler(EulerRot::XYZ, -0.9, 0.4, -0.5),
            0.08,
        ),
    ];
    for (material, radius, speed, tilt, size) in trails {
        let speed: f32 = speed;
        for k in 0..10 {
            let s = size * (1.0 - k as f32 * 0.085);
            let e = ctx.object(&orb, material, Transform::from_scale(Vec3::splat(s)));
            let phase = -(k as f32) * 0.2 * speed.signum();
            ctx.insert(
                e,
                Orbit {
                    center: Vec3::ZERO,
                    radius,
                    speed,
                    phase,
                    tilt,
                },
            );
        }
    }
}

/// I · The Magician — the four elements circling the will at the center.
pub(super) fn magician(ctx: &mut Ctx) {
    let core_mat = ctx.glow(rgb(255, 120, 80), 6.0);
    let core = ctx.shape(Sphere::new(0.3), &core_mat, Transform::default());
    ctx.insert(
        core,
        Pulse {
            material: core_mat,
            base: LinearRgba::from(rgb(255, 120, 80)) * 6.0,
            low: 0.7,
            high: 1.3,
            speed: 2.0,
        },
    );
    let halo_mat = ctx.glow(rgb(255, 200, 110), 4.0);
    let halo = ctx.shape(
        ring(0.42, 0.018),
        &halo_mat,
        Transform::from_xyz(0.0, 1.05, 0.0).with_rotation(Quat::from_rotation_x(0.35)),
    );
    ctx.insert(halo, Spin(Vec3::Y, 1.0));
    let solids = [
        (faceted(Cuboid::from_length(0.42)), rgb(240, 90, 60)),
        (
            faceted(
                Tetrahedron::default()
                    .mesh()
                    .build()
                    .scaled_by(Vec3::splat(0.6)),
            ),
            rgb(80, 170, 255),
        ),
        (faceted(Sphere::new(0.3).mesh().uv(4, 2)), rgb(255, 220, 90)),
        (
            faceted(Sphere::new(0.27).mesh().ico(0).unwrap()),
            rgb(110, 230, 140),
        ),
    ];
    let tilt = Quat::from_rotation_x(0.45);
    for (i, (mesh, color)) in solids.into_iter().enumerate() {
        let mesh = ctx.mesh(mesh);
        let material = ctx.glow(color, 1.6);
        let e = ctx.object(&mesh, &material, Transform::default());
        ctx.insert(
            e,
            (
                Orbit {
                    center: Vec3::ZERO,
                    radius: 1.25,
                    speed: 0.6,
                    phase: i as f32 * FRAC_PI_2,
                    tilt,
                },
                Spin(Vec3::new(1.0, 0.7, 0.3), 1.2 + 0.3 * i as f32),
            ),
        );
    }
}

/// II · The High Priestess — the moon held between the two pillars.
pub(super) fn priestess(ctx: &mut Ctx) {
    let pillar = ctx.mesh(Cylinder::new(0.2, 2.8));
    let cap = ctx.mesh(Cuboid::new(0.55, 0.14, 0.55));
    let dark = ctx.solid(rgb(24, 22, 30), 0.25, 0.0);
    let light = ctx.solid(rgb(235, 228, 214), 0.5, 0.0);
    for (x, material) in [(-1.1, &dark), (1.1, &light)] {
        ctx.object(&pillar, material, Transform::from_xyz(x, -0.25, -0.3));
        ctx.object(&cap, material, Transform::from_xyz(x, 1.18, -0.3));
    }
    let moon = ctx.pivot(Transform::from_xyz(0.0, 0.3, 0.0));
    ctx.insert(
        moon,
        Bob {
            base: Vec3::new(0.0, 0.3, 0.0),
            amp: 0.08,
            speed: 1.1,
            phase: 0.0,
        },
    );
    let glow = ctx.glow(rgb(190, 215, 255), 3.5);
    let lit = ctx.shape(Sphere::new(0.55), &glow, Transform::default());
    let void = ctx.void();
    let shadow = ctx.shape(
        Sphere::new(0.5),
        &void,
        Transform::from_xyz(0.24, 0.12, 0.2),
    );
    ctx.parent(moon, lit);
    ctx.parent(moon, shadow);
}

/// III · The Empress — a flower opening, slowly turning.
pub(super) fn empress(ctx: &mut Ctx) {
    let flower = ctx.pivot(Transform::from_rotation(Quat::from_rotation_x(0.75)));
    ctx.insert(flower, Spin(Vec3::Y, 0.35));
    let petal = ctx.mesh(Sphere::new(1.0));
    let heart_mat = ctx.glow(rgb(255, 205, 90), 5.0);
    let heart = ctx.shape(Sphere::new(0.2), &heart_mat, Transform::default());
    ctx.parent(flower, heart);
    let layers = [
        (
            6,
            0.36,
            Vec3::new(0.17, 0.06, 0.4),
            rgb(255, 120, 170),
            1.4,
            0.35,
            0.0,
        ),
        (
            8,
            0.7,
            Vec3::new(0.24, 0.07, 0.58),
            rgb(220, 60, 140),
            0.9,
            0.15,
            0.39,
        ),
        (
            10,
            1.08,
            Vec3::new(0.2, 0.05, 0.55),
            rgb(70, 170, 110),
            0.6,
            -0.1,
            0.0,
        ),
    ];
    for (count, radius, scale, color, strength, lift, offset) in layers {
        let material = ctx.glow(color, strength);
        for k in 0..count {
            let a = offset + k as f32 * TAU / count as f32;
            let dir = Vec3::new(a.cos(), 0.0, a.sin());
            let t = Transform::from_translation(dir * radius)
                .looking_to(dir, Vec3::Y)
                .with_scale(scale);
            let t = t.with_rotation(t.rotation * Quat::from_rotation_x(lift));
            let e = ctx.object(&petal, &material, t);
            ctx.parent(flower, e);
        }
    }
}

/// IV · The Emperor — a ziggurat of order, a burning capstone.
pub(super) fn emperor(ctx: &mut Ctx) {
    let temple =
        ctx.pivot(Transform::from_xyz(0.0, -0.7, 0.0).with_rotation(Quat::from_rotation_x(0.3)));
    ctx.insert(temple, Spin(Vec3::Y, 0.3));
    let stone = ctx.solid(rgb(150, 120, 100), 0.9, 0.0);
    for (i, w) in [2.2, 1.7, 1.2, 0.75].into_iter().enumerate() {
        let tier = ctx.shape(
            Cuboid::new(w, 0.32, w),
            &stone,
            Transform::from_xyz(0.0, i as f32 * 0.32, 0.0),
        );
        ctx.parent(temple, tier);
    }
    let gold = LinearRgba::from(rgb(255, 170, 60)) * 5.0;
    let cap_mat = ctx.glow(rgb(255, 170, 60), 5.0);
    let cone = ConeMeshBuilder::new(0.5, 0.6, 4)
        .anchor(ConeAnchor::Base)
        .build();
    let cap = ctx.shape(faceted(cone), &cap_mat, Transform::from_xyz(0.0, 1.12, 0.0));
    ctx.insert(
        cap,
        Pulse {
            material: cap_mat,
            base: gold,
            low: 0.6,
            high: 1.4,
            speed: 1.6,
        },
    );
    ctx.parent(temple, cap);
    ctx.point_light(rgb(255, 140, 60), 60_000.0, Vec3::new(0.0, 1.0, 1.0));
}

/// VII · The Chariot — two wheels at full tilt.
pub(super) fn chariot(ctx: &mut Ctx) {
    let rim = ctx.mesh(ring(0.6, 0.05));
    let spoke = ctx.mesh(Cuboid::new(1.15, 0.035, 0.035));
    let hub = ctx.mesh(Sphere::new(0.09));
    let blue = ctx.glow(rgb(110, 190, 255), 3.0);
    let steel = ctx.solid(rgb(170, 180, 200), 0.35, 0.6);
    let rig = ctx.pivot(Transform::from_rotation(Quat::from_euler(
        EulerRot::YXZ,
        0.8,
        0.25,
        0.0,
    )));
    let axle = ctx.shape(
        Cylinder::new(0.035, 1.7),
        &steel,
        Transform::from_rotation(Quat::from_rotation_z(FRAC_PI_2)),
    );
    ctx.parent(rig, axle);
    for x in [-0.8, 0.8] {
        // A wheel's own Y is its axle; laid along the rig's X.
        let wheel = ctx.pivot(
            Transform::from_xyz(x, 0.0, 0.0).with_rotation(Quat::from_rotation_z(FRAC_PI_2)),
        );
        ctx.insert(wheel, Spin(Vec3::Y, 4.0));
        let r = ctx.object(&rim, &blue, Transform::default());
        let h = ctx.object(&hub, &steel, Transform::default());
        ctx.parent(wheel, r);
        ctx.parent(wheel, h);
        for k in 0..3 {
            let s = ctx.object(
                &spoke,
                &steel,
                Transform::from_rotation(Quat::from_rotation_y(k as f32 * PI / 3.0)),
            );
            ctx.parent(wheel, s);
        }
        ctx.parent(rig, wheel);
    }
}

/// X · Wheel of Fortune — a gyroscope of fate around a turning gem.
pub(super) fn wheel(ctx: &mut Ctx) {
    let gold = ctx.glow(rgb(255, 200, 110), 2.6);
    let mut parent: Option<Entity> = None;
    for (radius, axis, speed) in [
        (1.4, Vec3::Y, 0.5),
        (1.13, Vec3::X, 0.8),
        (0.86, Vec3::Z, 1.1),
    ] {
        let ring_e = ctx.shape(
            ring(radius, 0.035),
            &gold,
            Transform::from_rotation(Quat::from_rotation_x(FRAC_PI_2)),
        );
        let gimbal = ctx.pivot(Transform::default());
        ctx.insert(gimbal, Spin(axis, speed));
        ctx.parent(gimbal, ring_e);
        if let Some(p) = parent {
            ctx.parent(p, gimbal);
        }
        parent = Some(gimbal);
    }
    let bead = ctx.mesh(Sphere::new(0.05));
    let rune = ctx.glow(rgb(220, 160, 255), 5.0);
    for k in 0..8 {
        let a = k as f32 * TAU / 8.0;
        ctx.object(
            &bead,
            &rune,
            Transform::from_xyz(a.cos() * 1.62, a.sin() * 1.62, -0.2),
        );
    }
    let gem_mat = ctx.glow(rgb(170, 90, 255), 2.2);
    let gem = ctx.shape(
        faceted(Sphere::new(0.36).mesh().ico(0).unwrap()),
        &gem_mat,
        Transform::default(),
    );
    ctx.insert(gem, Spin(Vec3::new(0.3, 1.0, 0.2), 0.9));
}

/// XVI · The Tower — the crown struck loose by lightning.
pub(super) fn tower(ctx: &mut Ctx) {
    let stone = ctx.solid(rgb(60, 50, 64), 0.8, 0.0);
    ctx.shape(
        Cuboid::new(0.55, 2.4, 0.55),
        &stone,
        Transform::from_xyz(0.0, -0.55, 0.0).with_rotation(Quat::from_rotation_z(0.04)),
    );
    let crown = ctx.shape(
        faceted(ConeMeshBuilder::new(0.5, 0.7, 4).build()),
        &stone,
        Transform::from_rotation(Quat::from_rotation_z(-0.5)),
    );
    ctx.insert(
        crown,
        (
            Bob {
                base: Vec3::new(0.35, 1.2, 0.0),
                amp: 0.06,
                speed: 1.4,
                phase: 0.0,
            },
            Spin(Vec3::new(0.2, 1.0, 0.0), 0.3),
        ),
    );
    let bolt = ctx.glow(rgb(220, 200, 255), 9.0);
    let segment = ctx.mesh(Cylinder::new(0.022, 1.0));
    let path = [
        Vec3::new(1.6, 1.9, 0.0),
        Vec3::new(1.05, 1.35, 0.1),
        Vec3::new(1.25, 1.05, 0.1),
        Vec3::new(0.6, 0.55, 0.2),
        Vec3::new(0.75, 0.4, 0.2),
        Vec3::new(0.25, 0.05, 0.3),
    ];
    let flash = ctx.pivot(Transform::default());
    ctx.insert(flash, Flicker(2.6));
    for w in path.windows(2) {
        let (a, b) = (w[0], w[1]);
        let t = Transform::from_translation((a + b) / 2.0)
            .with_rotation(Quat::from_rotation_arc(Vec3::Y, (b - a).normalize()))
            .with_scale(Vec3::new(1.0, a.distance(b), 1.0));
        let s = ctx.object(&segment, &bolt, t);
        ctx.parent(flash, s);
    }
    let lamp = ctx.point_light(rgb(200, 170, 255), 80_000.0, Vec3::new(0.9, 0.9, 1.2));
    ctx.insert(lamp, Flicker(2.6));
}
