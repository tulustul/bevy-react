//! The difficulty card: a city street burning at night. Wet asphalt between
//! walls of windows, shopfronts and neon, a low sports car with its tail
//! lights smeared across the puddles, a lone figure — and fire, smoke and
//! embers that grow with the level React picks (`dioramas.difficulty`): EASY
//! is a quiet street with one trash fire, VERY HARD an inferno under a
//! burning sky (the fire is `blaze.rs`).

use bevy::prelude::*;

use super::materials::rand;
use super::props::{block, figure, lamp, merged, sign_board};
use super::{Ctx, Diorama, Framing, Look, blaze, rgb};

const VIEW: Framing = Framing {
    eye: Vec3::new(0.6, 1.45, 11.0),
    at: Vec3::new(-0.6, 2.0, -14.0),
    fov: 32.0,
};

pub const STREET: Diorama = Diorama {
    id: "difficulty",
    lifepath: false,
    look: Look {
        fog: blaze::FOG[0],
        haze: 0.03,
        ambient: rgb(130, 90, 150),
        ambient_brightness: 35.0,
        bloom: 0.22,
    },
    card: VIEW,
    wide: VIEW,
    build,
};

/// The building fronts' distance from the street's middle.
pub(super) const FACADE: f32 = 9.0;

fn build(ctx: &mut Ctx) {
    blaze::sky(ctx);

    ground(ctx);
    buildings(ctx);
    neon(ctx);
    car(ctx, Vec3::new(-1.9, 0.0, 3.6));
    props(ctx);
    blaze::fires(ctx);

    // A lone figure facing the fire, rifle raised.
    let silhouette = ctx.solid(rgb(8, 8, 10), 0.6, 0.0);
    figure(ctx, &silhouette, Vec3::new(0.8, 0.0, 2.6), 0.3);
    ctx.shape(
        Cuboid::new(0.05, 0.95, 0.07),
        &silhouette,
        Transform::from_xyz(1.12, 1.5, 2.5).with_rotation(Quat::from_rotation_z(0.4)),
    );
}

fn ground(ctx: &mut Ctx) {
    let asphalt = ctx.wet(rgb(20, 20, 24), 0.3, 0.6, true);
    ctx.shape(
        Plane3d::default().mesh().size(120.0, 220.0),
        &asphalt,
        Transform::from_xyz(0.0, 0.0, -80.0),
    );
    let pavement = ctx.wet(rgb(46, 44, 50), 0.5, 0.35, false);
    for side in [-1.0, 1.0] {
        ctx.shape(
            Cuboid::new(2.5, 0.15, 220.0),
            &pavement,
            Transform::from_xyz(side * (FACADE - 1.25), 0.075, -80.0),
        );
    }
}

/// Two rows of blocks with shopfronts down the street, towers at its end.
fn buildings(ctx: &mut Ctx) {
    let walls = [
        ctx.windows(
            rgb(28, 26, 32),
            LinearRgba::rgb(0.7, 0.36, 0.13),
            Vec2::new(1.6, 3.0),
            Vec2::new(0.8, 1.4),
            0.2,
            1.0,
        ),
        ctx.windows(
            rgb(22, 24, 30),
            LinearRgba::rgb(0.55, 0.42, 0.3),
            Vec2::new(1.4, 3.2),
            Vec2::new(0.9, 1.7),
            0.16,
            2.0,
        ),
        ctx.windows(
            rgb(34, 28, 30),
            LinearRgba::rgb(0.3, 0.45, 0.7),
            Vec2::new(1.8, 3.2),
            Vec2::new(1.2, 2.0),
            0.22,
            3.0,
        ),
    ];
    // Shopfronts: a dim lit interior under a bright neon trim.
    let tints = [
        rgb(255, 150, 70),
        rgb(70, 210, 255),
        rgb(255, 60, 170),
        rgb(220, 225, 255),
    ];
    let shops = tints.map(|c| {
        let light = LinearRgba::from(c) * 0.12;
        let inside = ctx.windows(
            rgb(12, 12, 14),
            light,
            Vec2::new(2.6, 2.4),
            Vec2::new(2.3, 1.9),
            0.8,
            c.red,
        );
        (inside, ctx.glow(c, 4.0), LinearRgba::from(c) * 0.15)
    });
    let awning = ctx.solid(rgb(16, 16, 20), 0.6, 0.3);
    let mut rng = 0x5eed_u32;
    for side in [-1.0f32, 1.0] {
        let mut z = 10.0;
        let mut k = if side < 0.0 { 0 } else { 1 };
        while z > -95.0 {
            let width = 7.0 + rand(&mut rng) * 8.0;
            let height = 12.0 + rand(&mut rng) * 30.0;
            let depth = 14.0;
            let mid = z - width / 2.0;
            block(
                ctx,
                &walls[k % 3],
                side * (FACADE + depth / 2.0),
                mid,
                Vec3::new(depth, height, width - 0.6),
            );
            // A shopfront along the foot, an awning over it.
            let front = Transform::from_xyz(side * (FACADE - 0.01), 1.6, mid)
                .looking_to(Vec3::X * side, Vec3::Y);
            let (inside, trim, wet) = &shops[(rand(&mut rng) * 4.0) as usize % 4];
            ctx.shape(Rectangle::new(width * 0.7, 2.0), inside, front);
            ctx.shape(
                Cuboid::new(1.2, 0.12, width * 0.75),
                &awning,
                Transform::from_xyz(side * (FACADE - 0.6), 2.95, mid),
            );
            ctx.shape(
                Cuboid::new(0.04, 0.04, width * 0.75),
                trim,
                Transform::from_xyz(side * (FACADE - 1.2), 2.9, mid),
            );
            if mid > -40.0 {
                ctx.reflection(
                    *wet,
                    Vec3::new(side * (FACADE - 1.5), 0.0, mid),
                    6.0,
                    width * 0.4,
                );
            }
            z -= width + 0.5 + rand(&mut rng) * 1.5;
            k += 1;
        }
    }
    let towers = ctx.windows(
        rgb(14, 16, 22),
        LinearRgba::rgb(0.9, 1.2, 1.8),
        Vec2::new(1.3, 3.4),
        Vec2::new(1.1, 2.8),
        0.35,
        4.0,
    );
    for (x, z, w, h) in [
        (-26.0, -120.0, 22.0, 95.0),
        (-2.0, -150.0, 26.0, 165.0),
        (22.0, -125.0, 18.0, 110.0),
        (44.0, -160.0, 24.0, 130.0),
        (-48.0, -150.0, 24.0, 120.0),
        (12.0, -104.0, 10.0, 58.0),
    ] {
        block(ctx, &towers, x, z, Vec3::new(w, h, w));
    }
}

fn neon(ctx: &mut Ctx) {
    let case = ctx.solid(rgb(12, 12, 14), 0.5, 0.3);
    let magenta = LinearRgba::rgb(4.0, 0.3, 2.2);
    let cyan = LinearRgba::rgb(0.3, 3.2, 4.0);
    let amber = LinearRgba::rgb(4.0, 2.2, 0.3);
    let red = LinearRgba::rgb(4.5, 0.4, 0.3);
    let teal = LinearRgba::rgb(0.3, 4.0, 2.2);
    let (l, r) = (-FACADE + 1.0, FACADE - 1.0);
    // (color, columns, rows, center, size, facing, stutter)
    let signs = [
        (
            magenta,
            1.0,
            4.0,
            Vec3::new(l, 4.6, -7.0),
            Vec2::new(0.9, 3.6),
            Vec3::Z,
            0.0,
        ),
        (
            cyan,
            1.0,
            4.0,
            Vec3::new(l, 6.6, -16.0),
            Vec2::new(1.1, 4.4),
            Vec3::Z,
            0.06,
        ),
        (
            amber,
            4.0,
            1.0,
            Vec3::new(FACADE - 0.06, 4.6, -9.0),
            Vec2::new(4.6, 1.2),
            Vec3::NEG_X,
            0.0,
        ),
        (
            red,
            1.0,
            4.0,
            Vec3::new(r, 6.0, -19.0),
            Vec2::new(0.9, 3.4),
            Vec3::Z,
            0.0,
        ),
        (
            amber,
            1.0,
            4.0,
            Vec3::new(r, 9.5, -31.0),
            Vec2::new(1.0, 4.0),
            Vec3::Z,
            0.0,
        ),
        (
            teal,
            4.0,
            1.0,
            Vec3::new(-FACADE + 0.06, 3.8, -25.0),
            Vec2::new(4.0, 1.0),
            Vec3::X,
            0.1,
        ),
        (
            cyan,
            5.0,
            2.0,
            Vec3::new(-2.0, 70.0, -136.9),
            Vec2::new(18.0, 7.0),
            Vec3::Z,
            0.0,
        ),
        (
            magenta,
            3.0,
            1.0,
            Vec3::new(22.0, 42.0, -115.9),
            Vec2::new(10.0, 3.6),
            Vec3::Z,
            0.0,
        ),
    ];
    for (i, (color, columns, rows, at, size, facing, stutter)) in signs.into_iter().enumerate() {
        let sign = ctx.sign(
            color,
            columns,
            rows,
            size.x / size.y,
            stutter,
            i as f32 * 3.7,
        );
        sign_board(ctx, &sign, &case, at, size, facing);
    }
    // Their light on the walls and the wet street.
    ctx.light(
        rgb(255, 60, 170),
        30_000.0,
        12.0,
        Vec3::new(-7.4, 4.2, -6.0),
    );
    ctx.light(
        rgb(60, 220, 255),
        25_000.0,
        14.0,
        Vec3::new(-7.4, 6.4, -15.0),
    );
    ctx.light(rgb(255, 170, 50), 20_000.0, 12.0, Vec3::new(7.6, 4.6, -9.0));
    ctx.reflection(
        LinearRgba::rgb(0.6, 0.04, 0.32),
        Vec3::new(l, 0.0, -7.0),
        8.0,
        0.9,
    );
    ctx.reflection(
        LinearRgba::rgb(0.5, 0.28, 0.04),
        Vec3::new(7.4, 0.0, -9.0),
        7.0,
        1.2,
    );
}

/// A low sports car facing away down -z, its tail lights three red lines.
fn car(ctx: &mut Ctx, at: Vec3) {
    let paint = ctx.sheen(rgb(26, 26, 32), LinearRgba::rgb(0.12, 0.07, 0.09));
    let glass = ctx.solid(rgb(6, 7, 10), 0.06, 0.3);
    let rubber = ctx.solid(rgb(6, 6, 6), 0.8, 0.0);
    let tail = ctx.glow(rgb(255, 30, 24), 7.0);
    let accent = ctx.glow(rgb(255, 60, 40), 2.5);
    let body = merged([
        (
            Cuboid::new(2.0, 0.42, 4.5).into(),
            Transform::from_xyz(0.0, 0.45, 0.0),
        ),
        (
            Cuboid::new(1.9, 0.14, 1.2).into(),
            Transform::from_xyz(0.0, 0.7, 1.55).with_rotation(Quat::from_rotation_x(-0.12)),
        ),
        // The rear wing.
        (
            Cuboid::new(1.95, 0.05, 0.35).into(),
            Transform::from_xyz(0.0, 0.92, 2.05),
        ),
        (
            Cuboid::new(0.08, 0.2, 0.25).into(),
            Transform::from_xyz(-0.7, 0.8, 2.05),
        ),
        (
            Cuboid::new(0.08, 0.2, 0.25).into(),
            Transform::from_xyz(0.7, 0.8, 2.05),
        ),
    ]);
    let car = ctx.pivot(Transform::from_translation(at));
    let parts = [
        ctx.shape(body, &paint, Transform::default()),
        // The canopy: a long low dome, raked back.
        ctx.shape(
            Sphere::new(1.0).mesh().uv(24, 12),
            &glass,
            Transform::from_xyz(0.0, 0.66, -0.2).with_scale(Vec3::new(0.82, 0.42, 1.75)),
        ),
    ];
    for part in parts {
        ctx.parent(car, part);
    }
    let wheel = ctx.mesh(Cylinder::new(0.36, 0.3).mesh().resolution(20));
    for (x, z) in [(-0.95, 1.45), (0.95, 1.45), (-0.95, -1.4), (0.95, -1.4)] {
        let w = ctx.object(
            &wheel,
            &rubber,
            Transform::from_xyz(x, 0.36, z)
                .with_rotation(Quat::from_rotation_z(std::f32::consts::FRAC_PI_2)),
        );
        ctx.parent(car, w);
    }
    // Light strips along the skirts and the shoulders draw its outline.
    for x in [-1.01, 1.01] {
        for (y, length) in [(0.26, 3.6), (0.67, 2.2)] {
            let strip = ctx.shape(
                Cuboid::new(0.02, 0.02, length),
                &accent,
                Transform::from_xyz(x, y, 0.4),
            );
            ctx.parent(car, strip);
        }
    }
    for y in [0.5, 0.58, 0.66] {
        let strip = ctx.shape(
            Cuboid::new(1.8, 0.025, 0.02),
            &tail,
            Transform::from_xyz(0.0, y, 2.26),
        );
        ctx.parent(car, strip);
    }
    ctx.light(
        rgb(255, 40, 30),
        5_000.0,
        6.0,
        at + Vec3::new(0.0, 0.6, 2.8),
    );
    ctx.reflection(
        LinearRgba::rgb(0.7, 0.04, 0.03),
        at + Vec3::new(0.0, 0.0, 2.3),
        4.0,
        1.8,
    );
}

fn props(ctx: &mut Ctx) {
    let pole = ctx.solid(rgb(20, 20, 24), 0.5, 0.6);
    let head = ctx.glow(rgb(200, 225, 255), 6.0);
    for (at, reach) in [
        (Vec3::new(-7.4, 0.15, 2.0), Vec2::new(1.8, 0.0)),
        (Vec3::new(7.4, 0.15, -11.0), Vec2::new(-1.8, 0.0)),
    ] {
        let tip = lamp(ctx, &pole, &head, at, reach, 6.8);
        ctx.light(rgb(190, 215, 255), 110_000.0, 20.0, tip - Vec3::Y * 0.4);
        ctx.reflection(LinearRgba::rgb(0.07, 0.09, 0.12), tip.with_y(0.0), 6.0, 0.8);
    }
    let concrete = ctx.solid(rgb(60, 58, 62), 0.85, 0.0);
    for (x, z, yaw) in [(3.8, -15.0, 0.2), (-4.6, -13.0, -0.4)] {
        ctx.shape(
            Cuboid::new(2.8, 0.85, 0.55),
            &concrete,
            Transform::from_xyz(x, 0.42, z).with_rotation(Quat::from_rotation_y(yaw)),
        );
    }
    let rust = ctx.solid(rgb(40, 22, 14), 0.7, 0.4);
    ctx.shape(
        Cylinder::new(0.3, 0.85).mesh().resolution(16),
        &rust,
        Transform::from_xyz(3.6, 0.425, -2.5),
    );
    // The burnt-out wreck.
    let char = ctx.solid(rgb(10, 9, 9), 0.9, 0.2);
    let wreck = merged([
        (
            Cuboid::new(1.9, 0.5, 4.3).into(),
            Transform::from_xyz(0.0, 0.45, 0.0),
        ),
        (
            Cuboid::new(1.6, 0.45, 1.9).into(),
            Transform::from_xyz(0.0, 0.9, -0.2),
        ),
    ]);
    ctx.shape(
        wreck,
        &char,
        Transform::from_xyz(-2.8, 0.0, -10.0).with_rotation(Quat::from_rotation_y(0.6)),
    );
}
