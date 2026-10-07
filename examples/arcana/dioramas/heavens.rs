//! The heavenly cards — death, star, moon, sun, world: bodies of light.

use std::f32::consts::{FRAC_PI_2, PI, TAU};

use bevy::mesh::{ConeAnchor, ConeMeshBuilder};
use bevy::prelude::*;

use super::scenes::{rgb, ring};
use super::{Ctx, Orbit, Pulse, Spin};

/// XIII · Death — a black hole: every ending is a door.
pub(super) fn death(ctx: &mut Ctx) {
    let system = ctx.pivot(Transform::from_rotation(Quat::from_euler(
        EulerRot::XYZ,
        0.3,
        0.0,
        0.22,
    )));
    let disk = ctx.mesh(ring(1.2, 0.36));
    let hot = ctx.glow(rgb(255, 150, 60), 2.4);
    let ember = ctx.glow(rgb(200, 50, 30), 1.4);
    let inner = ctx.object(
        &disk,
        &hot,
        Transform::from_scale(Vec3::new(1.0, 0.05, 1.0)),
    );
    ctx.insert(inner, Spin(Vec3::Y, 0.9));
    let outer = ctx.object(
        &disk,
        &ember,
        Transform::from_scale(Vec3::new(1.45, 0.03, 1.45)),
    );
    ctx.insert(outer, Spin(Vec3::Y, 0.4));
    ctx.parent(system, inner);
    ctx.parent(system, outer);
    let void = ctx.void();
    ctx.shape(Sphere::new(0.46), &void, Transform::default());
    let photon = ctx.glow(rgb(255, 225, 180), 7.0);
    ctx.shape(
        ring(0.5, 0.022),
        &photon,
        Transform::from_rotation(Quat::from_rotation_x(FRAC_PI_2)),
    );
}

/// XVII · The Star — hope, rekindled.
pub(super) fn star(ctx: &mut Ctx) {
    let body = ctx.pivot(Transform::default());
    ctx.insert(body, Spin(Vec3::new(0.2, 1.0, 0.1), 0.45));
    let ice = ctx.glow(rgb(150, 230, 255), 4.0);
    let long = ctx.mesh(
        ConeMeshBuilder::new(0.16, 1.05, 24)
            .anchor(ConeAnchor::Base)
            .build(),
    );
    let short = ctx.mesh(
        ConeMeshBuilder::new(0.1, 0.6, 24)
            .anchor(ConeAnchor::Base)
            .build(),
    );
    let axes = [
        Vec3::X,
        Vec3::NEG_X,
        Vec3::Y,
        Vec3::NEG_Y,
        Vec3::Z,
        Vec3::NEG_Z,
    ];
    for dir in axes {
        let e = ctx.object(
            &long,
            &ice,
            Transform::from_rotation(Quat::from_rotation_arc(Vec3::Y, dir)),
        );
        ctx.parent(body, e);
    }
    for x in [-1.0, 1.0] {
        for y in [-1.0, 1.0] {
            for z in [-1.0, 1.0] {
                let dir = Vec3::new(x, y, z).normalize();
                let e = ctx.object(
                    &short,
                    &ice,
                    Transform::from_rotation(Quat::from_rotation_arc(Vec3::Y, dir)),
                );
                ctx.parent(body, e);
            }
        }
    }
    let heart = ctx.glow(rgb(255, 255, 255), 8.0);
    ctx.shape(Sphere::new(0.22), &heart, Transform::default());
    let speck = ctx.mesh(Sphere::new(0.04));
    for k in 0..7 {
        let color = rgb(200, 240, 255);
        let material = ctx.glow(color, 5.0);
        let a = k as f32 * 2.4;
        let e = ctx.object(
            &speck,
            &material,
            Transform::from_xyz(a.cos() * 1.55, (a * 1.7).sin() * 1.1, -0.6),
        );
        ctx.insert(
            e,
            Pulse {
                material,
                base: LinearRgba::from(color) * 5.0,
                low: 0.1,
                high: 1.6,
                speed: 1.3 + k as f32 * 0.4,
            },
        );
    }
}

/// XVIII · The Moon — a pale world turning in the light, craters and all.
pub(super) fn moon(ctx: &mut Ctx) {
    // A faint glow of its own, so the night side reads as grey, not a hole.
    let surface = ctx.glow(rgb(205, 212, 230), 0.05);
    let pit = ctx.glow(rgb(120, 126, 142), 0.02);
    let body = ctx.shape(
        Sphere::new(1.05).mesh().uv(64, 32),
        &surface,
        Transform::default(),
    );
    ctx.insert(body, Spin(Vec3::new(0.1, 1.0, 0.0), 0.12));
    let crater = ctx.mesh(Sphere::new(1.0));
    for (lat, lon, r) in [
        (0.4f32, 0.3f32, 0.2),
        (-0.2, 1.1, 0.14),
        (0.9, 2.0, 0.17),
        (-0.6, -0.7, 0.24),
        (0.1, -1.8, 0.12),
        (-1.0, 2.8, 0.16),
        (0.6, -2.6, 0.13),
    ] {
        let dir = Vec3::new(lat.cos() * lon.cos(), lat.sin(), lat.cos() * lon.sin());
        let t = Transform::from_translation(dir * 1.045)
            .looking_to(dir, Vec3::Y)
            .with_scale(Vec3::new(r, r, r * 0.25));
        let c = ctx.object(&crater, &pit, t);
        ctx.parent(body, c);
    }
    let halo = ctx.glow(rgb(160, 190, 255), 1.6);
    ctx.shape(
        ring(1.32, 0.01),
        &halo,
        Transform::from_rotation(Quat::from_rotation_x(FRAC_PI_2)),
    );
}

/// XIX · The Sun — radiance, unclouded.
pub(super) fn sun(ctx: &mut Ctx) {
    let color = rgb(255, 190, 70);
    let core_mat = ctx.glow(color, 10.0);
    let core = ctx.shape(Sphere::new(0.6), &core_mat, Transform::default());
    ctx.insert(
        core,
        Pulse {
            material: core_mat,
            base: LinearRgba::from(color) * 10.0,
            low: 0.8,
            high: 1.25,
            speed: 1.2,
        },
    );
    let flame = ctx.glow(rgb(255, 150, 40), 5.0);
    for (count, length, width, speed, offset) in
        [(12, 0.8, 0.12, 0.25, 0.0), (12, 0.5, 0.09, -0.4, PI / 12.0)]
    {
        let corona = ctx.pivot(Transform::default());
        ctx.insert(corona, Spin(Vec3::Z, speed));
        let spike = ctx.mesh(
            ConeMeshBuilder::new(width, length, 16)
                .anchor(ConeAnchor::Base)
                .build(),
        );
        for k in 0..count {
            let a = offset + k as f32 * TAU / count as f32;
            let dir = Vec3::new(a.cos(), a.sin(), 0.0);
            let e = ctx.object(
                &spike,
                &flame,
                Transform::from_translation(dir * 0.5)
                    .with_rotation(Quat::from_rotation_arc(Vec3::Y, dir)),
            );
            ctx.parent(corona, e);
        }
    }
    let gold = ctx.glow(rgb(255, 210, 120), 3.0);
    ctx.shape(
        ring(1.6, 0.015),
        &gold,
        Transform::from_rotation(Quat::from_rotation_x(FRAC_PI_2)),
    );
}

/// XXI · The World — the circle complete: a ringed world, its moon, a wreath.
pub(super) fn world(ctx: &mut Ctx) {
    let ocean = ctx.solid(rgb(40, 150, 160), 0.6, 0.0);
    let planet = ctx.shape(
        Sphere::new(0.68).mesh().uv(48, 24),
        &ocean,
        Transform::default(),
    );
    ctx.insert(planet, Spin(Vec3::Y, 0.3));
    let band = ctx.glow(rgb(255, 205, 120), 1.8);
    let rings = ctx.shape(
        ring(1.1, 0.2),
        &band,
        Transform::from_rotation(Quat::from_euler(EulerRot::XYZ, 0.35, 0.0, -0.3))
            .with_scale(Vec3::new(1.0, 0.04, 1.0)),
    );
    ctx.insert(rings, Spin(Vec3::Y, 0.2));
    let moon_mat = ctx.glow(rgb(230, 240, 255), 3.0);
    let moon = ctx.shape(Sphere::new(0.11), &moon_mat, Transform::default());
    ctx.insert(
        moon,
        Orbit {
            center: Vec3::ZERO,
            radius: 1.45,
            speed: 0.7,
            phase: 0.0,
            tilt: Quat::from_euler(EulerRot::XYZ, 0.5, 0.0, 0.2),
        },
    );
    let wreath = ctx.pivot(Transform::default());
    ctx.insert(wreath, Spin(Vec3::Z, -0.15));
    let leaf = ctx.mesh(Sphere::new(1.0));
    let green = ctx.glow(rgb(120, 230, 150), 1.6);
    for k in 0..28 {
        let a = k as f32 * TAU / 28.0;
        let dir = Vec3::new(a.cos(), a.sin(), 0.0);
        let t = Transform::from_translation(dir * 1.68 + Vec3::Z * -0.4)
            .with_rotation(Quat::from_rotation_z(a + 0.6))
            .with_scale(Vec3::new(0.09, 0.035, 0.03));
        let e = ctx.object(&leaf, &green, t);
        ctx.parent(wreath, e);
    }
}
