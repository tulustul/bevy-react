//! The land: one terrain heightfield around the lake, the pines on it (one
//! merged mesh), and the pier you stand on. Everything shades through
//! `land.wgsl` with the world palette — no lights, no textures.

use bevy::asset::RenderAssetUsages;
use bevy::light::NotShadowCaster;
use bevy::mesh::{Indices, PrimitiveTopology};
use bevy::prelude::*;

use super::{Atmos, WorldMaterial};

/// The terrain grid: `CELLS`² quads of `CELL` meters, centered ahead of you.
const CELLS: usize = 260;
const CELL: f32 = 10.0;
const CENTER: Vec2 = Vec2::new(0.0, -600.0);

/// The lake: an ellipse centered ahead (−Z), its near shore just behind the
/// pier.
const LAKE_AT: Vec2 = Vec2::new(0.0, -330.0);
const LAKE_HALF: Vec2 = Vec2::new(185.0, 380.0);

/// The pier: a deck you stand at the end of, running back to the shore.
const DECK_Y: f32 = 0.35;
const DECK_WIDTH: f32 = 2.4;
const DECK_LENGTH: f32 = 52.0;

const TREES: usize = 1600;

pub fn spawn(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<WorldMaterial>>,
) {
    let terrain = materials.add(WorldMaterial {
        atmos: Atmos::default(),
        kind: Vec4::ZERO,
    });
    let props = materials.add(WorldMaterial {
        atmos: Atmos::default(),
        kind: Vec4::X,
    });
    commands.spawn((
        Mesh3d(meshes.add(terrain_mesh())),
        MeshMaterial3d(terrain),
        NotShadowCaster,
    ));
    let mut builder = MeshBuilder::default();
    trees(&mut builder);
    pier(&mut builder);
    commands.spawn((
        Mesh3d(meshes.add(builder.build())),
        MeshMaterial3d(props),
        NotShadowCaster,
    ));
}

/// Signed distance outside the lake's shore, meters (negative in the water).
pub fn lake_distance(x: f32, z: f32) -> f32 {
    let p = (Vec2::new(x, z) - LAKE_AT) / LAKE_HALF;
    let wobble = fbm(x * 0.006, z * 0.006) * 70.0 - 35.0;
    (p.length() - 1.0) * LAKE_HALF.x + wobble
}

/// Terrain height at a point, meters above the lake.
pub fn height(x: f32, z: f32) -> f32 {
    let d = lake_distance(x, z);
    if d < 0.0 {
        return -8.0 * smoothstep(0.0, -25.0, d) - 0.5;
    }
    let shore = (d * 0.06).min(4.0);
    let rise = smoothstep(10.0, 650.0, d);
    let ridges = ridged(x * 0.0021 + 3.1, z * 0.0021 - 1.7);
    let detail = fbm(x * 0.012, z * 0.012);
    // A gap in the far range where the evening sun goes down.
    let toward_sunset = Vec2::new(x - 120.0, z + 900.0).normalize_or_zero().y;
    let gap = 1.0 - 0.35 * smoothstep(0.88, 1.0, -toward_sunset) * smoothstep(500.0, 900.0, -z);
    shore + rise.powf(1.25) * (180.0 + 520.0 * ridges) * gap + detail * 28.0 * rise
}

fn terrain_mesh() -> Mesh {
    let n = CELLS + 1;
    let half = CELLS as f32 * CELL * 0.5;
    let mut positions = Vec::with_capacity(n * n);
    for j in 0..n {
        for i in 0..n {
            let x = CENTER.x - half + i as f32 * CELL;
            let z = CENTER.y - half + j as f32 * CELL;
            positions.push([x, height(x, z), z]);
        }
    }
    let mut indices = Vec::with_capacity(CELLS * CELLS * 6);
    for j in 0..CELLS {
        for i in 0..CELLS {
            let a = (j * n + i) as u32;
            let b = a + 1;
            let c = a + n as u32;
            let d = c + 1;
            indices.extend_from_slice(&[a, c, b, b, c, d]);
        }
    }
    // The shader derives faceted normals; these only satisfy the pipeline.
    let normals = vec![[0.0, 1.0, 0.0]; positions.len()];
    Mesh::new(
        PrimitiveTopology::TriangleList,
        RenderAssetUsages::RENDER_WORLD,
    )
    .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, positions)
    .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, normals)
    .with_inserted_indices(Indices::U32(indices))
}

/// Pines on the lower slopes: a trunk and three stacked cones each.
fn trees(b: &mut MeshBuilder) {
    let mut rng = 0x9e37_79b9_u32;
    let mut planted = 0;
    let mut tries = 0;
    while planted < TREES && tries < TREES * 40 {
        tries += 1;
        let x = (rand(&mut rng) - 0.5) * 1600.0;
        let z = rand(&mut rng) * -1500.0 + 420.0;
        let d = lake_distance(x, z);
        if d < 6.0 || Vec2::new(x, z).length() < 25.0 {
            continue;
        }
        let h = height(x, z);
        let slope = (height(x + 4.0, z) - h)
            .abs()
            .max((height(x, z + 4.0) - h).abs())
            / 4.0;
        let density = 1.0 - smoothstep(120.0, 190.0, h);
        if slope > 0.9 || rand(&mut rng) > density * (1.0 - smoothstep(0.4, 0.9, slope)) {
            continue;
        }
        let tall = 9.0 + rand(&mut rng) * 11.0;
        let shade = 0.75 + rand(&mut rng) * 0.5;
        pine(b, Vec3::new(x, h - 0.5, z), tall, shade);
        planted += 1;
    }
}

fn pine(b: &mut MeshBuilder, base: Vec3, tall: f32, shade: f32) {
    let bark = [0.09, 0.06, 0.045];
    b.cone(base, tall * 0.035, tall * 0.25, 5, bark);
    let green = [0.04 * shade, 0.085 * shade, 0.06 * shade];
    for (k, (from, size)) in [(0.18, 0.62), (0.42, 0.48), (0.64, 0.36)]
        .iter()
        .enumerate()
    {
        let darker = 1.0 - k as f32 * 0.08;
        let color = [green[0] * darker, green[1] * darker, green[2] * darker];
        b.cone(
            base + Vec3::Y * tall * from,
            tall * size * 0.42,
            tall * size,
            7,
            color,
        );
    }
}

/// The deck: planks across a pair of stringers, on posts.
fn pier(b: &mut MeshBuilder) {
    let mut rng = 0x1234_5678_u32;
    let plank = 0.24;
    let gap = 0.025;
    let mut z = -0.6;
    while z < DECK_LENGTH {
        let tone = 0.85 + rand(&mut rng) * 0.3;
        let wood = [0.33 * tone, 0.24 * tone, 0.17 * tone];
        let jitter = (rand(&mut rng) - 0.5) * 0.06;
        b.cuboid(
            Vec3::new(jitter, DECK_Y - 0.03, z + plank * 0.5),
            Vec3::new(DECK_WIDTH * 0.5, 0.03, plank * 0.5),
            wood,
        );
        z += plank + gap;
    }
    let dark = [0.16, 0.12, 0.09];
    for x in [-0.9, 0.9] {
        b.cuboid(
            Vec3::new(x, DECK_Y - 0.13, DECK_LENGTH * 0.5),
            Vec3::new(0.08, 0.07, DECK_LENGTH * 0.5),
            dark,
        );
    }
    let mut z = 0.2;
    while z < DECK_LENGTH {
        for x in [-1.1, 1.1] {
            b.cuboid(Vec3::new(x, -0.4, z), Vec3::new(0.1, 0.75, 0.1), dark);
        }
        z += 4.5;
    }
}

/// Accumulates flat-colored primitives into one mesh.
#[derive(Default)]
struct MeshBuilder {
    positions: Vec<[f32; 3]>,
    colors: Vec<[f32; 4]>,
    indices: Vec<u32>,
}

impl MeshBuilder {
    fn vertex(&mut self, p: Vec3, c: [f32; 3]) -> u32 {
        self.positions.push(p.to_array());
        self.colors.push([c[0], c[1], c[2], 1.0]);
        self.positions.len() as u32 - 1
    }

    fn cone(&mut self, base: Vec3, radius: f32, height: f32, sides: u32, color: [f32; 3]) {
        let tip = self.vertex(base + Vec3::Y * height, color);
        let first = self.positions.len() as u32;
        for s in 0..sides {
            let a = s as f32 / sides as f32 * std::f32::consts::TAU;
            self.vertex(
                base + Vec3::new(a.cos() * radius, 0.0, a.sin() * radius),
                color,
            );
        }
        for s in 0..sides {
            let a = first + s;
            let b = first + (s + 1) % sides;
            self.indices.extend_from_slice(&[tip, b, a]);
        }
    }

    fn cuboid(&mut self, center: Vec3, half: Vec3, color: [f32; 3]) {
        let first = self.positions.len() as u32;
        for i in 0..8 {
            let s = Vec3::new(
                if i & 1 == 0 { -1.0 } else { 1.0 },
                if i & 2 == 0 { -1.0 } else { 1.0 },
                if i & 4 == 0 { -1.0 } else { 1.0 },
            );
            self.vertex(center + s * half, color);
        }
        #[rustfmt::skip]
        const FACES: [u32; 36] = [
            0, 2, 3, 0, 3, 1, // -z
            4, 5, 7, 4, 7, 6, // +z
            0, 4, 6, 0, 6, 2, // -x
            1, 3, 7, 1, 7, 5, // +x
            2, 6, 7, 2, 7, 3, // +y
            0, 1, 5, 0, 5, 4, // -y
        ];
        self.indices.extend(FACES.iter().map(|i| first + i));
    }

    fn build(self) -> Mesh {
        let normals = vec![[0.0, 1.0, 0.0]; self.positions.len()];
        Mesh::new(
            PrimitiveTopology::TriangleList,
            RenderAssetUsages::RENDER_WORLD,
        )
        .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, self.positions)
        .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, normals)
        .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, self.colors)
        .with_inserted_indices(Indices::U32(self.indices))
    }
}

fn rand(state: &mut u32) -> f32 {
    *state ^= *state << 13;
    *state ^= *state >> 17;
    *state ^= *state << 5;
    (*state >> 8) as f32 / (1u32 << 24) as f32
}

fn smoothstep(e0: f32, e1: f32, x: f32) -> f32 {
    let t = ((x - e0) / (e1 - e0)).clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

fn hash(x: i32, y: i32) -> f32 {
    let mut h = (x as u32).wrapping_mul(374_761_393) ^ (y as u32).wrapping_mul(668_265_263);
    h = (h ^ (h >> 13)).wrapping_mul(1_274_126_177);
    (h ^ (h >> 16)) as f32 / u32::MAX as f32
}

fn noise(x: f32, y: f32) -> f32 {
    let (ix, iy) = (x.floor() as i32, y.floor() as i32);
    let (fx, fy) = (x - x.floor(), y - y.floor());
    let (ux, uy) = (fx * fx * (3.0 - 2.0 * fx), fy * fy * (3.0 - 2.0 * fy));
    let a = hash(ix, iy);
    let b = hash(ix + 1, iy);
    let c = hash(ix, iy + 1);
    let d = hash(ix + 1, iy + 1);
    (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy
}

fn fbm(x: f32, y: f32) -> f32 {
    let (mut v, mut a, mut x, mut y) = (0.0, 0.5, x, y);
    for _ in 0..5 {
        v += a * noise(x, y);
        (x, y) = (x * 2.03 + 17.1, y * 2.03 + 9.2);
        a *= 0.5;
    }
    v
}

/// Ridged multifractal: sharp crests, soft valleys.
fn ridged(x: f32, y: f32) -> f32 {
    let (mut v, mut a, mut x, mut y, mut prev) = (0.0, 0.55, x, y, 1.0);
    for _ in 0..5 {
        let r = 1.0 - (noise(x, y) * 2.0 - 1.0).abs();
        let r = r * r;
        v += r * a * prev;
        prev = r;
        (x, y) = (x * 2.1 + 5.3, y * 2.1 - 2.9);
        a *= 0.5;
    }
    v
}
