//! Props more than one world uses: blocks of building, people, cables,
//! neon signs and street lamps, built from primitives.

use bevy::prelude::*;

use super::Ctx;
use super::materials::PaintMaterial;

/// Meshes merged into one, each placed by its transform.
pub fn merged(parts: impl IntoIterator<Item = (Mesh, Transform)>) -> Mesh {
    let mut parts = parts.into_iter();
    let (first, at) = parts.next().expect("at least one part");
    let mut mesh = first.transformed_by(at);
    for (part, at) in parts {
        mesh.merge(&part.transformed_by(at))
            .expect("parts share their attributes");
    }
    mesh
}

/// A block standing on the ground: `x`, `z` its middle, `size` (w, h, d).
pub fn block(
    ctx: &mut Ctx,
    material: &Handle<PaintMaterial>,
    x: f32,
    z: f32,
    size: Vec3,
) -> Entity {
    ctx.shape(
        Cuboid::from_size(size),
        material,
        Transform::from_xyz(x, size.y / 2.0, z),
    )
}

/// A person, 1.8 m, standing at `at` and facing `yaw` (0 = away, down -z).
pub fn figure(ctx: &mut Ctx, material: &Handle<StandardMaterial>, at: Vec3, yaw: f32) -> Entity {
    let limb = |r: f32, len: f32| {
        Capsule3d::new(r, len)
            .mesh()
            .longitudes(10)
            .latitudes(6)
            .build()
    };
    let lean = |x: f32, y: f32, roll: f32| {
        Transform::from_xyz(x, y, 0.0).with_rotation(Quat::from_rotation_z(roll))
    };
    let body = merged([
        (limb(0.075, 0.72), lean(-0.1, 0.46, 0.04)),
        (limb(0.075, 0.72), lean(0.1, 0.46, -0.04)),
        (
            limb(0.16, 0.36),
            Transform::from_xyz(0.0, 1.18, 0.0).with_scale(Vec3::new(1.25, 1.0, 0.75)),
        ),
        (limb(0.058, 0.5), lean(-0.29, 1.1, -0.12)),
        (limb(0.058, 0.5), lean(0.29, 1.1, 0.12)),
        (
            Sphere::new(0.105).mesh().uv(12, 8),
            Transform::from_xyz(0.0, 1.62, 0.0).with_scale(Vec3::new(1.0, 1.12, 1.0)),
        ),
    ]);
    ctx.shape(
        body,
        material,
        Transform::from_translation(at).with_rotation(Quat::from_rotation_y(yaw)),
    )
}

/// A cable hung from `a` to `b`, sagging `sag` meters at its middle.
pub fn cable(
    ctx: &mut Ctx,
    material: &Handle<StandardMaterial>,
    a: Vec3,
    b: Vec3,
    sag: f32,
) -> Entity {
    const SEGMENTS: usize = 10;
    let at = |s: f32| a.lerp(b, s) - Vec3::Y * sag * 4.0 * s * (1.0 - s);
    let parts = (0..SEGMENTS).map(|i| {
        let (p, q) = (
            at(i as f32 / SEGMENTS as f32),
            at((i + 1) as f32 / SEGMENTS as f32),
        );
        let t = Transform::from_translation((p + q) / 2.0)
            .with_rotation(Quat::from_rotation_arc(Vec3::Y, (q - p).normalize()))
            .with_scale(Vec3::new(1.0, p.distance(q), 1.0));
        (Cylinder::new(0.018, 1.0).mesh().resolution(5).build(), t)
    });
    ctx.shape(merged(parts), material, Transform::default())
}

/// A neon sign on a dark box: `size` (w, h) meters, centered at `at`,
/// facing `facing` (a horizontal direction).
pub fn sign_board(
    ctx: &mut Ctx,
    sign: &Handle<PaintMaterial>,
    case: &Handle<StandardMaterial>,
    at: Vec3,
    size: Vec2,
    facing: Vec3,
) -> Entity {
    let turn = Transform::from_translation(at).looking_to(-facing, Vec3::Y);
    let board = ctx.pivot(turn);
    let front = ctx.shape(
        Rectangle::from_size(size),
        sign,
        Transform::from_xyz(0.0, 0.0, 0.051),
    );
    let back = ctx.shape(
        Cuboid::new(size.x + 0.08, size.y + 0.08, 0.1),
        case,
        Transform::default(),
    );
    ctx.parent(board, front);
    ctx.parent(board, back);
    board
}

/// A street lamp at `at`, its arm reaching `reach` (x, z) out to a head
/// `height` up; the light itself is the caller's.
pub fn lamp(
    ctx: &mut Ctx,
    pole: &Handle<StandardMaterial>,
    head: &Handle<StandardMaterial>,
    at: Vec3,
    reach: Vec2,
    height: f32,
) -> Vec3 {
    ctx.shape(
        Cylinder::new(0.07, height).mesh().resolution(8).build(),
        pole,
        Transform::from_translation(at + Vec3::Y * height / 2.0),
    );
    let tip = at + Vec3::new(reach.x, height, reach.y);
    let arm = tip - (at + Vec3::Y * height);
    ctx.shape(
        Cuboid::new(0.08, 0.08, arm.length()),
        pole,
        Transform::from_translation(at + Vec3::Y * height + arm / 2.0).looking_to(arm, Vec3::Y),
    );
    ctx.shape(
        Cuboid::new(0.22, 0.08, 0.6),
        head,
        Transform::from_translation(tip - Vec3::Y * 0.06).looking_to(arm.with_y(0.0), Vec3::Y),
    );
    tip
}
