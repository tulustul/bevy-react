//! The Streetkid lifepath: a neon alley in the rain. Tall narrow walls of
//! windows and fire escapes, signs stacked up both sides in made-up glyphs,
//! cables sagging overhead, steam off a grate, puddles full of neon — and at
//! the alley's end the bright street, a billboard, and a tower lost in the
//! haze above it all.

use bevy::prelude::*;

use super::materials::{Emitter, SkyMaterial, rand};
use super::props::{block, cable, figure, merged, sign_board};
use super::{Ctx, Diorama, Framing, Look, rgb};

pub const ALLEY: Diorama = Diorama {
    id: "streetkid",
    lifepath: true,
    look: Look {
        fog: rgb(30, 18, 40),
        haze: 0.028,
        ambient: rgb(110, 90, 170),
        ambient_brightness: 30.0,
        bloom: 0.25,
    },
    card: Framing {
        eye: Vec3::new(0.2, 1.7, 7.5),
        at: Vec3::new(-0.2, 5.2, -20.0),
        fov: 52.0,
    },
    wide: Framing {
        eye: Vec3::new(0.4, 1.8, 9.0),
        at: Vec3::new(-0.2, 4.0, -20.0),
        fov: 40.0,
    },
    build,
};

/// The alley's walls stand this far from its middle.
const WALL: f32 = 3.2;

fn build(ctx: &mut Ctx) {
    ctx.sky(SkyMaterial {
        zenith: LinearRgba::new(0.008, 0.004, 0.02, 0.0),
        horizon: LinearRgba::new(0.16, 0.04, 0.14, 0.4),
        sun: LinearRgba::new(0.5, 0.1, 0.4, 0.0),
        sun_dir: Vec4::new(0.0, 0.1, -1.0, 0.5),
    });
    let ground = ctx.wet(rgb(22, 20, 26), 0.45, 0.8, false);
    ctx.shape(
        Plane3d::default().mesh().size(80.0, 200.0),
        &ground,
        Transform::from_xyz(0.0, 0.0, -60.0),
    );
    walls(ctx);
    signs(ctx);
    beyond(ctx);
    clutter(ctx);

    // Overhead, the city's wiring.
    let wire = ctx.solid(rgb(10, 10, 12), 0.6, 0.2);
    let mut rng = 0xca61_u32;
    for i in 0..9 {
        let z = 4.0 - i as f32 * 4.2 - rand(&mut rng) * 2.0;
        let y = 6.0 + rand(&mut rng) * 9.0;
        let skew = (rand(&mut rng) - 0.5) * 3.0;
        let a = Vec3::new(-WALL, y, z + skew);
        let b = Vec3::new(WALL, y + (rand(&mut rng) - 0.5) * 2.0, z - skew);
        cable(ctx, &wire, a, b, 0.4 + rand(&mut rng) * 0.9);
    }

    // Rain, and steam off a grate and a manhole.
    // (Its box starts past the lens: a streak an arm's length away is a bar.)
    let rain = Emitter::rain(
        Vec3::new(9.0, 18.0, 30.0),
        Vec3::new(0.7, -13.0, 0.3),
        0.45,
        LinearRgba::new(0.7, 0.75, 0.95, 0.13),
    )
    .count(2400);
    ctx.emit(rain, Vec3::new(0.0, 8.0, -13.0), 1.0);
    for (at, size) in [
        (Vec3::new(2.3, 0.1, -4.5), 1.0),
        (Vec3::new(-0.5, 0.0, -15.0), 1.4),
    ] {
        let steam = Emitter::plume(0.3, 5.0, size, LinearRgba::new(0.14, 0.13, 0.2, 0.3))
            .count(30)
            .speed(0.3)
            .wind(Vec3::new(0.8, 0.0, 0.4))
            .under(LinearRgba::new(0.35, 0.1, 0.3, 0.3));
        ctx.emit(steam, at, 1.0);
    }

    // The neon's light, and the bright street beyond rimming everything.
    ctx.light(
        rgb(255, 60, 200),
        22_000.0,
        12.0,
        Vec3::new(-1.6, 5.5, -5.0),
    );
    ctx.light(
        rgb(60, 220, 255),
        22_000.0,
        12.0,
        Vec3::new(1.6, 4.5, -11.0),
    );
    ctx.light(
        rgb(255, 200, 60),
        16_000.0,
        12.0,
        Vec3::new(1.5, 9.0, -19.0),
    );
    ctx.light(
        rgb(170, 190, 255),
        120_000.0,
        30.0,
        Vec3::new(0.0, 6.0, -34.0),
    );

    let silhouette = ctx.solid(rgb(8, 8, 12), 0.5, 0.0);
    figure(ctx, &silhouette, Vec3::new(0.5, 0.0, -7.5), 0.15);
}

/// Both walls: narrow blocks of windows at uneven depths, fire escapes.
fn walls(ctx: &mut Ctx) {
    let faces = [
        ctx.windows(
            rgb(30, 26, 34),
            LinearRgba::rgb(0.5, 0.28, 0.12),
            Vec2::new(1.3, 2.8),
            Vec2::new(0.6, 1.2),
            0.2,
            11.0,
        ),
        ctx.windows(
            rgb(24, 26, 34),
            LinearRgba::rgb(0.25, 0.36, 0.6),
            Vec2::new(1.1, 2.6),
            Vec2::new(0.7, 1.4),
            0.18,
            12.0,
        ),
    ];
    let iron = ctx.solid(rgb(16, 16, 18), 0.6, 0.6);
    let mut rng = 0xa11e_u32;
    for side in [-1.0f32, 1.0] {
        let mut z = 9.0;
        let mut k = if side < 0.0 { 0 } else { 1 };
        while z > -34.0 {
            let width = 5.0 + rand(&mut rng) * 6.0;
            let height = 18.0 + rand(&mut rng) * 24.0;
            let depth = 10.0;
            let set = rand(&mut rng) * 0.6;
            block(
                ctx,
                &faces[k % 2],
                side * (WALL + set + depth / 2.0),
                z - width / 2.0,
                Vec3::new(depth, height, width),
            );
            if rand(&mut rng) < 0.5 && z < 4.0 {
                fire_escape(ctx, &iron, side * (WALL + set), z - width / 2.0, side);
            }
            z -= width;
            k += 1;
        }
    }
}

/// Landings every floor and the ladders between, clinging to a wall.
fn fire_escape(ctx: &mut Ctx, iron: &Handle<StandardMaterial>, x: f32, z: f32, side: f32) {
    let out = x - side * 0.55;
    let parts = (0..4).flat_map(|i| {
        let y = 3.4 + i as f32 * 2.8;
        [
            (
                Mesh::from(Cuboid::new(1.1, 0.05, 2.6)),
                Transform::from_xyz(out, y, z),
            ),
            (
                Cuboid::new(0.04, 0.9, 2.6).into(),
                Transform::from_xyz(out - side * 0.55, y + 0.45, z),
            ),
            (
                Cuboid::new(0.05, 2.9, 0.05).into(),
                Transform::from_xyz(out, y + 1.4, z + 1.0)
                    .with_rotation(Quat::from_rotation_x(0.35)),
            ),
        ]
    });
    ctx.shape(merged(parts), iron, Transform::default());
}

fn signs(ctx: &mut Ctx) {
    let case = ctx.solid(rgb(12, 12, 16), 0.5, 0.3);
    let colors = [
        LinearRgba::rgb(4.0, 0.3, 2.4),
        LinearRgba::rgb(0.3, 3.2, 4.2),
        LinearRgba::rgb(4.2, 2.6, 0.3),
        LinearRgba::rgb(4.5, 0.4, 0.3),
        LinearRgba::rgb(0.4, 4.0, 2.0),
        LinearRgba::rgb(2.2, 0.6, 4.5),
    ];
    let mut rng = 0x5197_u32;
    let mut k = 0;
    // Vertical signs jutting from both walls, stacked up into the rain.
    for (side, z, y, rows) in [
        (-1.0, -1.5, 4.2, 4.0),
        (1.0, -3.5, 5.0, 5.0),
        (-1.0, -6.5, 8.5, 4.0),
        (1.0, -8.0, 3.6, 3.0),
        (-1.0, -11.0, 4.0, 3.0),
        (1.0, -12.5, 9.5, 5.0),
        (-1.0, -16.0, 11.0, 4.0),
        (1.0, -18.0, 5.0, 4.0),
        (-1.0, -21.0, 6.0, 3.0),
        (1.0, -24.0, 12.0, 4.0),
        (-1.0, -26.0, 14.5, 5.0),
    ] {
        let color = colors[k % colors.len()];
        let size = Vec2::new(0.9 + rand(&mut rng) * 0.3, rows * 0.95);
        let stutter = if rand(&mut rng) < 0.25 { 0.08 } else { 0.0 };
        let sign = ctx.sign(color, 1.0, rows, size.x / size.y, stutter, k as f32 * 5.3);
        let at = Vec3::new(side * (WALL - 0.75), y, z);
        sign_board(ctx, &sign, &case, at, size, Vec3::Z);
        if y < 9.0 {
            ctx.reflection(color * 0.12, at.with_y(0.0), 7.0, 0.7);
        }
        k += 1;
    }
    // Wide ones flat on the walls.
    for (side, z, y, columns) in [
        (-1.0, -9.0, 2.8, 4.0),
        (1.0, -15.0, 3.2, 3.0),
        (-1.0, -22.0, 9.0, 5.0),
    ] {
        let color = colors[k % colors.len()];
        let size = Vec2::new(columns * 0.8, 0.9);
        let sign = ctx.sign(color, columns, 1.0, size.x / size.y, 0.0, k as f32 * 5.3);
        sign_board(
            ctx,
            &sign,
            &case,
            Vec3::new(side * (WALL - 0.06), y, z),
            size,
            Vec3::X * -side,
        );
        k += 1;
    }
}

/// Past the alley's mouth: a lit street front, a billboard, and a tower.
fn beyond(ctx: &mut Ctx) {
    let front = ctx.windows(
        rgb(30, 30, 40),
        LinearRgba::rgb(0.9, 0.75, 0.6),
        Vec2::new(2.2, 3.2),
        Vec2::new(1.8, 2.4),
        0.5,
        13.0,
    );
    block(ctx, &front, 0.0, -56.0, Vec3::new(60.0, 32.0, 12.0));
    let case = ctx.solid(rgb(12, 12, 16), 0.5, 0.3);
    let board = ctx.sign(
        LinearRgba::rgb(0.4, 3.6, 4.5),
        4.0,
        2.0,
        12.0 / 6.0,
        0.0,
        77.0,
    );
    sign_board(
        ctx,
        &board,
        &case,
        Vec3::new(-2.0, 13.0, -49.8),
        Vec2::new(12.0, 6.0),
        Vec3::Z,
    );
    let shop = ctx.glow(rgb(255, 210, 160), 0.8);
    ctx.shape(
        Rectangle::new(24.0, 3.0),
        &shop,
        Transform::from_xyz(0.0, 1.8, -49.95),
    );
    let tower = ctx.windows(
        rgb(16, 18, 26),
        LinearRgba::rgb(0.4, 0.6, 1.0),
        Vec2::new(1.4, 3.6),
        Vec2::new(1.2, 3.0),
        0.35,
        14.0,
    );
    block(ctx, &tower, 8.0, -130.0, Vec3::new(22.0, 150.0, 22.0));
    let crown = ctx.glow(rgb(120, 220, 255), 3.0);
    ctx.shape(
        Cuboid::new(22.4, 0.4, 22.4),
        &crown,
        Transform::from_xyz(8.0, 146.0, -130.0),
    );
}

/// A dumpster, bags, a lit door, pipes and boxes humming on the walls.
fn clutter(ctx: &mut Ctx) {
    let green = ctx.solid(rgb(20, 40, 32), 0.6, 0.3);
    let bags = ctx.solid(rgb(8, 8, 10), 0.3, 0.0);
    let metal = ctx.solid(rgb(40, 40, 46), 0.5, 0.7);
    ctx.shape(
        Cuboid::new(1.4, 1.2, 2.2),
        &green,
        Transform::from_xyz(-WALL + 0.8, 0.6, -3.5),
    );
    let mut rng = 0xba65_u32;
    let lumps = (0..6).map(|_| {
        let s = 0.35 + rand(&mut rng) * 0.25;
        (
            Sphere::new(1.0).mesh().uv(10, 6),
            Transform::from_xyz(
                -WALL + 0.5 + rand(&mut rng) * 1.2,
                s * 0.6,
                -5.2 - rand(&mut rng) * 1.5,
            )
            .with_scale(Vec3::new(s, s * 0.8, s)),
        )
    });
    ctx.shape(merged(lumps), &bags, Transform::default());
    // Air conditioners and pipes.
    let boxes = (0..10).map(|i| {
        let side = if i % 2 == 0 { -1.0 } else { 1.0 };
        (
            Mesh::from(Cuboid::new(0.6, 0.6, 0.9)),
            Transform::from_xyz(
                side * (WALL - 0.3),
                3.0 + rand(&mut rng) * 10.0,
                1.0 - rand(&mut rng) * 26.0,
            ),
        )
    });
    ctx.shape(merged(boxes), &metal, Transform::default());
    for (x, z) in [
        (-WALL + 0.12, -0.5),
        (WALL - 0.12, -6.5),
        (WALL - 0.12, -17.0),
    ] {
        ctx.shape(
            Cylinder::new(0.09, 20.0).mesh().resolution(8),
            &metal,
            Transform::from_xyz(x, 10.0, z),
        );
    }
    // A back door under a warm lamp.
    let lamp = ctx.glow(rgb(255, 190, 120), 6.0);
    ctx.shape(
        Cuboid::new(0.3, 0.12, 0.3),
        &lamp,
        Transform::from_xyz(-WALL + 0.15, 2.7, -9.5),
    );
    ctx.light(
        rgb(255, 180, 110),
        9_000.0,
        8.0,
        Vec3::new(-WALL + 0.5, 2.5, -9.5),
    );
}
