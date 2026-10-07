//! The Nomad lifepath: the badlands at dusk. Dunes rolling out to mesas in
//! the haze, a huge low sun, wind turbines turning on the ridge with their
//! red lights blinking, a water tower and a line of power poles — and a
//! rugged 4×4 with its light bar on, dust drifting through its beams.

use bevy::mesh::VertexAttributeValues;
use bevy::prelude::*;

use super::materials::{Emitter, SkyMaterial, rand};
use super::props::{cable, merged};
use super::{Blink, Ctx, Diorama, Framing, Look, Spin, rgb};

pub const NOMAD: Diorama = Diorama {
    id: "nomad",
    lifepath: true,
    look: Look {
        fog: rgb(118, 58, 72),
        haze: 0.007,
        ambient: rgb(120, 100, 170),
        ambient_brightness: 30.0,
        bloom: 0.2,
    },
    card: Framing {
        eye: Vec3::new(-0.5, 2.0, 9.0),
        at: Vec3::new(0.6, 5.0, -30.0),
        fov: 44.0,
    },
    wide: Framing {
        eye: Vec3::new(-3.5, 2.3, 14.5),
        at: Vec3::new(2.5, 3.4, -30.0),
        fov: 34.0,
    },
    build,
};

/// Toward the sun, low over the horizon just right of the view.
const SUN: Vec3 = Vec3::new(0.12, 0.1, -1.0);

fn build(ctx: &mut Ctx) {
    ctx.sky(SkyMaterial {
        zenith: LinearRgba::new(0.01, 0.01, 0.04, 0.6),
        horizon: LinearRgba::new(0.2, 0.05, 0.07, 0.75),
        sun: LinearRgba::new(12.0, 4.5, 1.2, 0.045),
        sun_dir: SUN.extend(0.12),
    });
    // The sun itself, far down its ray: a grazing light from behind
    // everything, so the land facing us falls into the sky's purple.
    let sun = SUN.normalize() * 400.0;
    ctx.light(
        rgb(255, 150, 90),
        600.0 * 4.0 * std::f32::consts::PI * sun.length_squared(),
        700.0,
        sun,
    );

    let sand = ctx.solid(rgb(150, 92, 60), 0.92, 0.0);
    ctx.shape(dunes(), &sand, Transform::default());
    mesas(ctx);
    turbines(ctx);
    water_tower(ctx, Vec3::new(-6.5, 0.0, -26.0));
    power_line(ctx);
    truck(ctx, Vec3::new(0.4, 0.0, -9.0), 1.9);
    rocks(ctx);

    // Dust: specks glinting against the sun, and veils of it blowing low.
    let specks = Emitter::motes(
        Vec3::new(40.0, 6.0, 40.0),
        Vec3::new(1.2, 0.15, 0.2),
        0.018,
        LinearRgba::rgb(2.4, 1.2, 0.5),
    )
    .count(260);
    ctx.emit(specks, Vec3::new(0.0, 2.6, -10.0), 1.0);
    let veil = Emitter::plume(6.0, 1.2, 3.5, LinearRgba::new(0.42, 0.2, 0.11, 0.22))
        .count(26)
        .speed(0.08)
        .wind(Vec3::new(40.0, 1.0, -6.0));
    ctx.emit(veil, Vec3::new(-20.0, 0.4, -8.0), 1.0);
}

/// The height of the land: a flat-ish patch where we stand, dunes
/// swelling with distance, the track to the horizon kept smooth.
fn height(x: f32, z: f32) -> f32 {
    let d = (x * x + z * z).sqrt();
    let swell = 0.25 + (d / 40.0).min(1.0) * 1.6;
    let dunes = (x * 0.13 + z * 0.05).sin() * (z * 0.07 - x * 0.03).cos() * 0.7
        + (x * 0.31 - z * 0.17 + 1.3).sin() * 0.3
        + (x * 0.023 + 2.0).sin() * (z * 0.019).cos() * 1.4;
    let track = ((x - 2.0 - z * -0.02).abs() / 6.0).clamp(0.25, 1.0);
    dunes * swell * track - 0.3
}

fn dunes() -> Mesh {
    let mut mesh = Plane3d::default()
        .mesh()
        .size(420.0, 420.0)
        .subdivisions(140)
        .build();
    if let Some(VertexAttributeValues::Float32x3(positions)) =
        mesh.attribute_mut(Mesh::ATTRIBUTE_POSITION)
    {
        for p in positions.iter_mut() {
            p[1] = height(p[0], p[2]);
        }
    }
    mesh.compute_smooth_normals();
    mesh
}

/// Stones and scrub strewn over the near ground, for scale.
fn rocks(ctx: &mut Ctx) {
    let stone = ctx.solid(rgb(70, 46, 36), 0.95, 0.0);
    let mut rng = 0x7a11_u32;
    let parts = (0..90).filter_map(|_| {
        let x = (rand(&mut rng) - 0.5) * 50.0;
        let z = 6.0 - rand(&mut rng) * 40.0;
        // Not under the cameras' noses.
        if z > -6.0 && x.abs() < 10.0 {
            return None;
        }
        let s = 0.12 + rand(&mut rng).powi(3) * 0.9;
        let mesh = Sphere::new(1.0).mesh().ico(0).unwrap();
        let at = Transform::from_xyz(x, height(x, z), z)
            .with_rotation(Quat::from_rotation_y(rand(&mut rng) * 6.0))
            .with_scale(Vec3::new(s * 1.4, s * 0.7, s));
        Some((mesh, at))
    });
    let mesh = merged(parts)
        .with_duplicated_vertices()
        .with_computed_flat_normals();
    ctx.shape(mesh, &stone, Transform::default());
}

/// Flat-topped buttes in the haze, faceted.
fn mesas(ctx: &mut Ctx) {
    let rock = ctx.solid(rgb(110, 52, 34), 0.95, 0.0);
    let mut rng = 0x6e6f_u32;
    // The sun sets just behind the small one, in the gap the others leave.
    for (x, z, r, h) in [
        (-40.0, -75.0, 14.0, 14.0),
        (-75.0, -125.0, 26.0, 24.0),
        (-24.0, -150.0, 18.0, 18.0),
        (85.0, -140.0, 24.0, 22.0),
        (-120.0, -150.0, 30.0, 20.0),
        (22.0, -165.0, 14.0, 13.0),
        (110.0, -100.0, 22.0, 16.0),
    ] {
        let mesh = ConicalFrustum {
            radius_top: r * (0.55 + 0.2 * rand(&mut rng)),
            radius_bottom: r,
            height: h,
        }
        .mesh()
        .resolution(7)
        .build()
        .with_duplicated_vertices()
        .with_computed_flat_normals();
        ctx.shape(
            mesh,
            &rock,
            Transform::from_xyz(x, h / 2.0 - 1.0, z)
                .with_rotation(Quat::from_rotation_y(rand(&mut rng) * 3.0)),
        );
    }
}

/// Three turbines on the ridge, turning, their tips blinking red.
fn turbines(ctx: &mut Ctx) {
    let steel = ctx.solid(rgb(200, 190, 185), 0.6, 0.2);
    let beacon = ctx.glow(rgb(255, 30, 20), 12.0);
    let blade = ctx.mesh(Cuboid::new(0.35, 13.0, 0.12));
    for (i, (x, z, h)) in [
        (14.0, -80.0, 26.0),
        (27.0, -95.0, 28.0),
        (41.0, -112.0, 27.0),
    ]
    .into_iter()
    .enumerate()
    {
        let ground = height(x, z);
        ctx.shape(
            ConicalFrustum {
                radius_top: 0.45,
                radius_bottom: 1.0,
                height: h,
            }
            .mesh()
            .resolution(10),
            &steel,
            Transform::from_xyz(x, ground + h / 2.0, z),
        );
        let top = Vec3::new(x, ground + h, z);
        ctx.shape(
            Cuboid::new(1.2, 1.2, 3.2),
            &steel,
            Transform::from_translation(top + Vec3::new(0.0, 0.5, -0.4)),
        );
        let hub = ctx.pivot(Transform::from_translation(top + Vec3::new(0.0, 0.5, 1.4)));
        ctx.insert(hub, Spin(Vec3::Z, 0.5 + 0.1 * i as f32));
        for k in 0..3 {
            let a = k as f32 * std::f32::consts::TAU / 3.0 + i as f32;
            let b = ctx.object(
                &blade,
                &steel,
                Transform::from_rotation(Quat::from_rotation_z(a))
                    * Transform::from_xyz(0.0, 6.5, 0.0),
            );
            ctx.parent(hub, b);
        }
        let light = ctx.shape(
            Sphere::new(0.35).mesh().ico(1).unwrap(),
            &beacon,
            Transform::from_translation(top + Vec3::Y * 1.3),
        );
        ctx.insert(
            light,
            Blink {
                period: 2.0,
                duty: 0.25,
                phase: i as f32 * 0.6,
            },
        );
    }
}

fn water_tower(ctx: &mut Ctx, at: Vec3) {
    let rust = ctx.solid(rgb(92, 54, 38), 0.8, 0.3);
    let ground = height(at.x, at.z);
    let base = at.with_y(ground);
    for (x, z) in [(-1.6, -1.6), (1.6, -1.6), (-1.6, 1.6), (1.6, 1.6)] {
        ctx.shape(
            Cylinder::new(0.12, 9.0).mesh().resolution(6),
            &rust,
            Transform::from_translation(base + Vec3::new(x * 0.9, 4.5, z * 0.9)).with_rotation(
                Quat::from_rotation_arc(Vec3::Y, Vec3::new(-x * 0.03, 1.0, -z * 0.03).normalize()),
            ),
        );
    }
    ctx.shape(
        Cylinder::new(2.4, 3.4).mesh().resolution(20),
        &rust,
        Transform::from_translation(base + Vec3::Y * 10.6),
    );
    ctx.shape(
        Cone {
            radius: 2.6,
            height: 1.4,
        }
        .mesh()
        .resolution(20),
        &rust,
        Transform::from_translation(base + Vec3::Y * 13.0),
    );
}

/// Wooden poles marching off to the horizon, wires sagging between them.
fn power_line(ctx: &mut Ctx) {
    let wood = ctx.solid(rgb(40, 28, 22), 0.9, 0.0);
    let wire = ctx.solid(rgb(20, 18, 18), 0.6, 0.0);
    let pole = ctx.mesh(merged([
        (
            Cylinder::new(0.14, 9.0).mesh().resolution(6).build(),
            Transform::from_xyz(0.0, 4.5, 0.0),
        ),
        (
            Cuboid::new(2.4, 0.16, 0.16).into(),
            Transform::from_xyz(0.0, 8.4, 0.0),
        ),
    ]));
    let mut tops: Option<[Vec3; 2]> = None;
    for i in 0..7 {
        let z = 2.0 - i as f32 * 22.0;
        let x = -9.0 - i as f32 * 2.5;
        let at = Vec3::new(x, height(x, z), z);
        ctx.object(&pole, &wood, Transform::from_translation(at));
        let ends = [
            at + Vec3::new(-1.1, 8.5, 0.0),
            at + Vec3::new(1.1, 8.5, 0.0),
        ];
        if let Some(prev) = tops {
            for (a, b) in prev.into_iter().zip(ends) {
                cable(ctx, &wire, a, b, 1.1);
            }
        }
        tops = Some(ends);
    }
}

/// A rugged 4×4 at `at`, turned `yaw`: big wheels, a roof rack with a light
/// bar, headlights on.
fn truck(ctx: &mut Ctx, at: Vec3, yaw: f32) {
    // Dusty paint, the sunset glancing off it.
    let paint = ctx.sheen(rgb(70, 64, 46), LinearRgba::rgb(0.2, 0.08, 0.03));
    let dark = ctx.solid(rgb(16, 16, 16), 0.7, 0.4);
    let rubber = ctx.solid(rgb(10, 10, 10), 0.9, 0.0);
    let lamp = ctx.glow(rgb(255, 236, 200), 16.0);
    let tail = ctx.glow(rgb(255, 30, 20), 6.0);
    let body = merged([
        (
            Cuboid::new(2.0, 0.6, 5.0).into(),
            Transform::from_xyz(0.0, 1.05, 0.0),
        ),
        (
            Cuboid::new(1.9, 0.85, 2.2).into(),
            Transform::from_xyz(0.0, 1.78, -0.7),
        ),
        // The bed's sides.
        (
            Cuboid::new(0.08, 0.45, 2.1).into(),
            Transform::from_xyz(-0.96, 1.55, 1.4),
        ),
        (
            Cuboid::new(0.08, 0.45, 2.1).into(),
            Transform::from_xyz(0.96, 1.55, 1.4),
        ),
    ]);
    let rig = merged([
        // Bull bar, roof rack, a spare wheel's cradle.
        (
            Cuboid::new(1.9, 0.5, 0.1).into(),
            Transform::from_xyz(0.0, 1.0, -2.6),
        ),
        (
            Cuboid::new(1.8, 0.08, 1.8).into(),
            Transform::from_xyz(0.0, 2.3, -0.7),
        ),
        (
            Cuboid::new(0.9, 0.3, 0.6).into(),
            Transform::from_xyz(0.2, 2.5, -0.4),
        ),
        (
            Cuboid::new(0.12, 0.12, 5.2).into(),
            Transform::from_xyz(0.0, 0.62, 0.0),
        ),
    ]);
    let at = at.with_y(height(at.x, at.z));
    let truck =
        ctx.pivot(Transform::from_translation(at).with_rotation(Quat::from_rotation_y(yaw)));
    let parts = [
        ctx.shape(body, &paint, Transform::default()),
        ctx.shape(rig, &dark, Transform::default()),
        ctx.shape(
            Cuboid::new(1.5, 0.12, 0.12),
            &lamp,
            Transform::from_xyz(0.0, 2.38, -1.55),
        ),
        ctx.shape(
            Cylinder::new(0.42, 0.3).mesh().resolution(16),
            &rubber,
            Transform::from_xyz(0.0, 1.8, 2.55)
                .with_rotation(Quat::from_rotation_x(std::f32::consts::FRAC_PI_2)),
        ),
    ];
    for part in parts {
        ctx.parent(truck, part);
    }
    let wheel = ctx.mesh(Cylinder::new(0.55, 0.42).mesh().resolution(18));
    for (x, z) in [(-1.0, -1.6), (1.0, -1.6), (-1.0, 1.7), (1.0, 1.7)] {
        let w = ctx.object(
            &wheel,
            &rubber,
            Transform::from_xyz(x, 0.55, z)
                .with_rotation(Quat::from_rotation_z(std::f32::consts::FRAC_PI_2)),
        );
        ctx.parent(truck, w);
    }
    for x in [-0.7, 0.7] {
        let head = ctx.shape(
            Cuboid::new(0.36, 0.2, 0.05),
            &lamp,
            Transform::from_xyz(x, 1.15, -2.52),
        );
        let back = ctx.shape(
            Cuboid::new(0.12, 0.3, 0.05),
            &tail,
            Transform::from_xyz(x * 1.3, 1.2, 2.52),
        );
        ctx.parent(truck, head);
        ctx.parent(truck, back);
    }
    // The beams, on the sand ahead.
    let beams = ctx.spawn((
        SpotLight {
            color: rgb(255, 236, 205).into(),
            intensity: 400_000.0,
            range: 40.0,
            outer_angle: 0.55,
            inner_angle: 0.3,
            ..default()
        },
        Transform::from_xyz(0.0, 1.2, -2.6).looking_to(Vec3::new(0.0, -0.18, -1.0), Vec3::Y),
    ));
    ctx.parent(truck, beams);
    let bar = ctx.spawn((
        PointLight {
            color: rgb(255, 236, 200).into(),
            intensity: 30_000.0,
            range: 12.0,
            ..default()
        },
        Transform::from_xyz(0.0, 2.6, -2.0),
    ));
    ctx.parent(truck, bar);
}
