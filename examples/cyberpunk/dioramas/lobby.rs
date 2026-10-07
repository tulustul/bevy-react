//! The Corpo lifepath: the Tenkai lobby. Polished black marble under long
//! ceiling light strips, slits of light down the walls, stone columns, a
//! reception desk lit from beneath with a holo screen over it and a lone
//! receptionist behind — and on the back wall, huge and glowing, the Tenkai
//! mark: a ring open at the foot, a halo, a pillar and a star.

use bevy::prelude::*;

use super::props::figure;
use super::{Ctx, Diorama, Framing, Look, rgb};

pub const LOBBY: Diorama = Diorama {
    id: "corpo",
    lifepath: true,
    look: Look {
        fog: rgb(8, 16, 20),
        haze: 0.022,
        ambient: rgb(90, 140, 160),
        ambient_brightness: 35.0,
        bloom: 0.2,
    },
    card: Framing {
        eye: Vec3::new(0.0, 1.65, 8.0),
        at: Vec3::new(0.0, 3.4, -10.0),
        fov: 50.0,
    },
    wide: Framing {
        eye: Vec3::new(0.0, 1.8, 10.0),
        at: Vec3::new(0.0, 3.3, -10.0),
        fov: 38.0,
    },
    build,
};

/// The back wall, the side walls, the ceiling.
const BACK: f32 = -10.0;
const SIDE: f32 = 9.0;
const CEILING: f32 = 9.0;
/// The mark's own light: white, a breath of ice.
const MARK: LinearRgba = LinearRgba::rgb(3.0, 4.2, 4.8);
/// The dark slate of the walls (the mark is painted on it).
const WALL: Srgba = rgb(16, 20, 24);

fn build(ctx: &mut Ctx) {
    let floor = ctx.marble(rgb(30, 36, 42), rgb(96, 106, 116), 2.0);
    ctx.shape(
        Plane3d::default().mesh().size(SIDE * 2.0, 30.0),
        &floor,
        Transform::from_xyz(0.0, 0.0, BACK + 15.0),
    );
    let slate = ctx.solid(WALL, 0.55, 0.1);
    let shell = [
        (
            Vec3::new(SIDE * 2.0, CEILING, 0.4),
            Vec3::new(0.0, CEILING / 2.0, BACK - 0.2),
        ),
        (
            Vec3::new(0.4, CEILING, 30.0),
            Vec3::new(-SIDE - 0.2, CEILING / 2.0, BACK + 15.0),
        ),
        (
            Vec3::new(0.4, CEILING, 30.0),
            Vec3::new(SIDE + 0.2, CEILING / 2.0, BACK + 15.0),
        ),
        (
            Vec3::new(SIDE * 2.0, 0.4, 30.0),
            Vec3::new(0.0, CEILING + 0.2, BACK + 15.0),
        ),
    ];
    for (size, at) in shell {
        ctx.shape(
            Cuboid::from_size(size),
            &slate,
            Transform::from_translation(at),
        );
    }

    // The mark, on a dark stone panel, and its light on the wall and floor.
    let mark = ctx.emblem(MARK, WALL, 1.0);
    ctx.shape(
        Rectangle::new(6.4, 6.4),
        &mark,
        Transform::from_xyz(0.0, 5.0, BACK + 0.01),
    );
    ctx.light(
        rgb(190, 235, 255),
        30_000.0,
        14.0,
        Vec3::new(0.0, 5.2, BACK + 3.5),
    );
    ctx.reflection(
        LinearRgba::rgb(0.18, 0.28, 0.32),
        Vec3::new(0.0, 0.0, BACK),
        12.0,
        2.6,
    );

    // Light: strips down the ceiling, slits down the walls.
    let strip = ctx.glow(rgb(210, 240, 255), 3.5);
    for x in [-4.5, 0.0, 4.5] {
        ctx.shape(
            Cuboid::new(0.22, 0.05, 26.0),
            &strip,
            Transform::from_xyz(x, CEILING - 0.03, BACK + 14.0),
        );
    }
    ctx.shape(
        Cuboid::new(SIDE * 2.0 - 1.0, 0.05, 0.22),
        &strip,
        Transform::from_xyz(0.0, CEILING - 0.03, BACK + 1.2),
    );
    for (x, z) in [(-4.5, -3.0), (4.5, -3.0), (0.0, 4.0)] {
        ctx.light(
            rgb(200, 235, 255),
            300_000.0,
            16.0,
            Vec3::new(x, CEILING - 0.6, z),
        );
    }
    let slit = ctx.glow(rgb(120, 220, 255), 2.4);
    for side in [-1.0, 1.0] {
        for k in 0..6 {
            ctx.shape(
                Cuboid::new(0.06, 7.0, 0.1),
                &slit,
                Transform::from_xyz(side * (SIDE - 0.02), 4.0, BACK + 2.0 + k as f32 * 3.4),
            );
        }
    }
    for x in [-3.6, -4.4, -5.2, -6.0, -6.8, 3.6, 4.4, 5.2, 6.0, 6.8] {
        ctx.shape(
            Cuboid::new(0.05, 6.0, 0.05),
            &slit,
            Transform::from_xyz(x, 4.4, BACK + 0.03),
        );
    }

    // Columns, a ring of light at each foot.
    let stone = ctx.marble(rgb(30, 34, 38), rgb(90, 100, 108), 30.0);
    let ring = ctx.glow(rgb(120, 220, 255), 3.0);
    for (x, z) in [(-6.0, -3.0), (6.0, -3.0), (-6.0, 3.5), (6.0, 3.5)] {
        ctx.shape(
            Cylinder::new(0.5, CEILING).mesh().resolution(24),
            &stone,
            Transform::from_xyz(x, CEILING / 2.0, z),
        );
        ctx.shape(
            Torus::new(0.5, 0.56)
                .mesh()
                .minor_resolution(6)
                .major_resolution(32),
            &ring,
            Transform::from_xyz(x, 0.05, z),
        );
    }

    desk(ctx, Vec3::new(0.0, 0.0, -4.5));
}

/// The reception desk: dark stone, a pale top, light beneath, a holo screen
/// and the receptionist.
fn desk(ctx: &mut Ctx, at: Vec3) {
    let stone = ctx.solid(rgb(12, 14, 16), 0.3, 0.2);
    let top = ctx.marble(rgb(170, 175, 180), rgb(110, 115, 120), 40.0);
    let edge = ctx.glow(rgb(120, 220, 255), 5.0);
    ctx.shape(
        Cuboid::new(7.0, 1.1, 1.3),
        &stone,
        Transform::from_translation(at + Vec3::new(0.0, 0.6, 0.0)),
    );
    ctx.shape(
        Cuboid::new(7.4, 0.08, 1.6),
        &top,
        Transform::from_translation(at + Vec3::new(0.0, 1.19, 0.0)),
    );
    for y in [0.07, 1.12] {
        ctx.shape(
            Cuboid::new(7.0, 0.035, 0.035),
            &edge,
            Transform::from_translation(at + Vec3::new(0.0, y, 0.67)),
        );
    }
    ctx.light(
        rgb(120, 220, 255),
        6_000.0,
        5.0,
        at + Vec3::new(0.0, 0.3, 1.4),
    );
    // A screen standing on the desk, its glow on the receptionist; a
    // downlight from the ceiling picks them both out.
    let screen = ctx.sign(LinearRgba::rgb(0.3, 2.0, 2.6), 3.0, 2.0, 1.6, 0.0, 42.0);
    ctx.shape(
        Rectangle::new(1.12, 0.7),
        &screen,
        Transform::from_translation(at + Vec3::new(1.0, 1.65, 0.1))
            .with_rotation(Quat::from_rotation_y(0.25)),
    );
    ctx.light(
        rgb(110, 220, 255),
        5_000.0,
        4.0,
        at + Vec3::new(1.0, 1.7, -0.3),
    );
    ctx.spawn((
        SpotLight {
            color: rgb(215, 240, 255).into(),
            intensity: 1_400_000.0,
            range: 14.0,
            radius: 0.3,
            outer_angle: 0.5,
            inner_angle: 0.25,
            ..default()
        },
        Transform::from_translation(at + Vec3::new(0.0, CEILING - 0.5, 0.6))
            .looking_at(at + Vec3::new(0.0, 0.0, 0.2), Vec3::Z),
    ));
    let suit = ctx.solid(rgb(60, 64, 72), 0.45, 0.0);
    figure(
        ctx,
        &suit,
        at + Vec3::new(-0.7, 0.0, -1.1),
        std::f32::consts::PI,
    );
}
