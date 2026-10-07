//! The map's geometry, built on the CPU as flat-shaded triangle soup with
//! vertex colors: one mesh for the land (tiles, woods, mountains, towns),
//! one for the water, one for the borders, and the hex rings that mark
//! the hovered and the selected tile.

use std::f32::consts::{FRAC_PI_2, FRAC_PI_4, TAU};

use bevy::asset::RenderAssetUsages;
use bevy::mesh::PrimitiveTopology;
use bevy::prelude::*;

use super::hex::{RADIUS, center, corner, neighbor};
use super::world::{CIVS, Feature, Relief, Terrain, Tile, World, rand};

/// Where the tiles' walls end.
const BASE: f32 = -0.6;
/// Land tiles meet at this height; a hill rises to `HILL` in its middle.
pub const LAND: f32 = 0.1;
const HILL: f32 = 0.42;
const COAST: f32 = -0.08;
const OCEAN: f32 = -0.18;
const PARCHMENT: f32 = 0.02;
/// How much of its hex a tile's top covers: the sliver left shows the
/// walls, a faint grid.
const INSET: f32 = 0.97;

/// The height of a tile's rim, where it meets its neighbors.
pub fn rim(tile: &Tile) -> f32 {
    match tile.terrain {
        _ if !tile.revealed => PARCHMENT,
        Terrain::Coast => COAST,
        Terrain::Ocean => OCEAN,
        _ => LAND,
    }
}

pub fn civ_color(civ: usize) -> Color {
    let [r, g, b] = CIVS[civ].color;
    Color::srgb_u8(r, g, b)
}

fn srgb(hex: u32) -> LinearRgba {
    Color::srgb_u8((hex >> 16) as u8, (hex >> 8) as u8, hex as u8).to_linear()
}

/// `c` with its brightness scaled by `k`.
fn shade(c: LinearRgba, k: f32) -> LinearRgba {
    LinearRgba::rgb(c.red * k, c.green * k, c.blue * k)
}

/// A brightness factor within `1 ± spread`, stable per tile and salt.
fn jitter(t: IVec2, salt: u32, spread: f32) -> f32 {
    1.0 + (rand(t, salt) - 0.5) * 2.0 * spread
}

#[derive(Default)]
struct Soup {
    positions: Vec<[f32; 3]>,
    normals: Vec<[f32; 3]>,
    colors: Vec<[f32; 4]>,
}

impl Soup {
    /// One triangle, counter-clockwise seen from its front.
    fn tri3(&mut self, [a, b, c]: [Vec3; 3], colors: [LinearRgba; 3]) {
        let n = (b - a).cross(c - a).normalize_or_zero();
        for (p, color) in [a, b, c].into_iter().zip(colors) {
            self.positions.push(p.into());
            self.normals.push(n.into());
            self.colors.push(color.to_f32_array());
        }
    }

    fn tri(&mut self, a: Vec3, b: Vec3, c: Vec3, color: LinearRgba) {
        self.tri3([a, b, c], [color; 3]);
    }

    fn quad(&mut self, [a, b, c, d]: [Vec3; 4], color: LinearRgba) {
        self.tri(a, b, c, color);
        self.tri(a, c, d, color);
    }

    fn ring(at: Vec2, radius: f32, n: usize, angle: f32, y: f32) -> Vec<Vec3> {
        (0..n)
            .map(|i| {
                let a = angle + TAU * i as f32 / n as f32;
                Vec3::new(at.x + a.cos() * radius, y, at.y + a.sin() * radius)
            })
            .collect()
    }

    /// An `n`-sided prism from `y0` up to `y1`, its first corner at `angle`.
    #[allow(clippy::too_many_arguments)]
    fn prism(
        &mut self,
        at: Vec2,
        radius: f32,
        n: usize,
        angle: f32,
        (y0, y1): (f32, f32),
        top: LinearRgba,
        side: LinearRgba,
    ) {
        let (lo, hi) = (
            Self::ring(at, radius, n, angle, y0),
            Self::ring(at, radius, n, angle, y1),
        );
        let apex = Vec3::new(at.x, y1, at.y);
        for i in 0..n {
            let j = (i + 1) % n;
            self.tri(apex, hi[j], hi[i], top);
            self.quad([hi[i], hi[j], lo[j], lo[i]], side);
        }
    }

    /// An `n`-sided cone from a ring at `y0` to its tip at `y1` (pointing
    /// down when `y1 < y0`).
    fn cone(
        &mut self,
        at: Vec2,
        radius: f32,
        n: usize,
        angle: f32,
        (y0, y1): (f32, f32),
        color: LinearRgba,
    ) {
        let base = Self::ring(at, radius, n, angle, y0);
        let tip = Vec3::new(at.x, y1, at.y);
        for i in 0..n {
            let j = (i + 1) % n;
            if y1 > y0 {
                self.tri(tip, base[j], base[i], color);
            } else {
                self.tri(tip, base[i], base[j], color);
            }
        }
    }

    fn into_mesh(self) -> Mesh {
        Mesh::new(
            PrimitiveTopology::TriangleList,
            RenderAssetUsages::default(),
        )
        .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, self.positions)
        .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, self.normals)
        .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, self.colors)
    }
}

/// A tile's top color; under the political lens, its owner's color shows.
fn top_color(world: &World, t: IVec2, tile: &Tile, lens: bool) -> LinearRgba {
    let base = match (tile.terrain, tile.relief) {
        _ if !tile.revealed => srgb(0xd9c8a0),
        (_, Relief::Mountains) => srgb(0x7f766a),
        (Terrain::Grassland, _) => srgb(0x679837),
        (Terrain::Plains, _) => srgb(0x9a9a44),
        (Terrain::Desert, _) => srgb(0xdcc27c),
        (Terrain::Tundra, _) => srgb(0x8d9174),
        (Terrain::Snow, _) => srgb(0xe6ecef),
        (Terrain::Coast, _) => srgb(0x39a6b2),
        (Terrain::Ocean, _) => srgb(0x1f5b8c),
    };
    let mut color = shade(base, jitter(t, 21, 0.06));
    if world.city_at(t).is_some() {
        color = srgb(0xc2b08c);
    }
    match world.owner(t) {
        Some(civ) if lens && tile.revealed => {
            let tint = civ_color(civ).to_linear();
            color.mix(&tint, 0.6)
        }
        _ if lens => shade(color, 0.45),
        _ => color,
    }
}

/// The ground at `p` on tile `t` (a hill's slope, or the flat top).
fn ground(world: &World, t: IVec2, p: Vec2) -> f32 {
    let tile = world.tile(t).unwrap();
    let peak = peak(world, t, tile);
    let d = (p - center(t)).length() / (RADIUS * 0.87);
    peak + (LAND - peak) * d.min(1.0)
}

fn peak(world: &World, t: IVec2, tile: &Tile) -> f32 {
    if tile.relief == Relief::Hills && world.city_at(t).is_none() {
        HILL + rand(t, 5) * 0.08
    } else {
        LAND + rand(t, 5) * 0.03
    }
}

/// Every land and parchment tile, with the woods, mountains and towns on
/// them; the political `lens` paints territory in its owner's color.
pub fn land(world: &World, lens: bool) -> Mesh {
    let mut soup = Soup::default();
    for t in World::coords() {
        let tile = world.tile(t).unwrap();
        if tile.revealed && tile.terrain.is_water() {
            continue;
        }
        let c = center(t);
        let top = top_color(world, t, tile, lens);
        let wall = if tile.revealed {
            shade(top, 0.5)
        } else {
            srgb(0x8a7550)
        };
        if !tile.revealed {
            soup.prism(
                c,
                RADIUS * INSET,
                6,
                -30f32.to_radians(),
                (BASE, PARCHMENT),
                top,
                wall,
            );
            continue;
        }
        // A low hexagonal pyramid: flat tiles barely rise, hills bulge.
        let apex = Vec3::new(c.x, peak(world, t, tile), c.y);
        let corners: Vec<Vec3> = (0..6)
            .map(|i| (c + corner(i) * INSET).extend(LAND).xzy())
            .collect();
        for i in 0..6 {
            let j = (i + 1) % 6;
            soup.tri(apex, corners[j], corners[i], top);
            let low = |v: Vec3| v.with_y(BASE);
            soup.quad(
                [corners[i], corners[j], low(corners[j]), low(corners[i])],
                wall,
            );
        }
        match (tile.relief, tile.feature) {
            (Relief::Mountains, _) => mountains(&mut soup, t, c),
            (_, Feature::Woods) => woods(&mut soup, world, t),
            (_, Feature::Rainforest) => rainforest(&mut soup, world, t),
            _ if world.farm(t) && !lens => fields(&mut soup, world, t),
            _ => {}
        }
    }
    for city in &world.cities {
        town(
            &mut soup,
            world,
            city.tile,
            city.civ,
            city.capital,
            city.population,
        );
    }
    soup.into_mesh()
}

/// Scattered spots inside a tile, stable per tile.
fn spots(t: IVec2, n: usize, reach: f32) -> impl Iterator<Item = (usize, Vec2)> {
    let c = center(t);
    let turn = rand(t, 30) * TAU;
    (0..n).map(move |i| {
        let a = turn + TAU * i as f32 / n as f32 + (rand(t, 31 + i as u32) - 0.5) * 0.8;
        let r = reach * (0.45 + 0.55 * rand(t, 41 + i as u32));
        (i, c + Vec2::new(a.cos(), a.sin()) * r)
    })
}

/// A farm's patchwork of fields.
fn fields(soup: &mut Soup, world: &World, t: IVec2) {
    let c = center(t);
    let turn = rand(t, 150) * TAU;
    let (u, v) = (Vec2::from_angle(turn), Vec2::from_angle(turn + FRAC_PI_2));
    let crops = [0xcdb456, 0x8eaa45, 0xb9a24a, 0x7c9a3e, 0xd6c06a];
    let mut n = (rand(t, 151) * 5.0) as usize;
    for du in [-0.33, 0.0, 0.33] {
        for dv in [-0.18, 0.18] {
            let mid = c + u * du + v * dv;
            let at = |a: f32, b: f32| {
                let p = mid + u * a + v * b;
                Vec3::new(p.x, ground(world, t, p) + 0.012, p.y)
            };
            let (a, b) = (0.15, 0.16);
            soup.quad(
                [at(-a, -b), at(-a, b), at(a, b), at(a, -b)],
                srgb(crops[n % crops.len()]),
            );
            n += 2;
        }
    }
}

fn woods(soup: &mut Soup, world: &World, t: IVec2) {
    let trunk = srgb(0x5a4430);
    for (i, p) in spots(t, 6, 0.6) {
        let y = ground(world, t, p);
        let s = 0.85 + rand(t, 50 + i as u32) * 0.35;
        let leaf = shade(srgb(0x2f6a2c), jitter(t, 60 + i as u32, 0.12));
        soup.prism(p, 0.035, 5, 0.0, (y - 0.02, y + 0.08), trunk, trunk);
        soup.cone(
            p,
            0.17 * s,
            6,
            rand(t, 70) * TAU,
            (y + 0.06, y + 0.5 * s),
            leaf,
        );
    }
}

fn rainforest(soup: &mut Soup, world: &World, t: IVec2) {
    let trunk = srgb(0x6a5236);
    for (i, p) in spots(t, 5, 0.58) {
        let y = ground(world, t, p);
        let s = 0.85 + rand(t, 80 + i as u32) * 0.4;
        let leaf = shade(srgb(0x3f8f2c), jitter(t, 90 + i as u32, 0.14));
        let mid = y + 0.26 * s;
        soup.prism(p, 0.035, 5, 0.0, (y - 0.02, y + 0.14), trunk, trunk);
        soup.cone(p, 0.2 * s, 7, 0.0, (mid, mid + 0.2 * s), leaf);
        soup.cone(p, 0.2 * s, 7, 0.0, (mid, mid - 0.14 * s), shade(leaf, 0.8));
    }
}

fn mountains(soup: &mut Soup, t: IVec2, c: Vec2) {
    let rock = srgb(0x8b8277);
    let snow = srgb(0xf2f4f5);
    let peaks = [(-0.32, 0.14, 0.55), (0.3, 0.2, 0.65), (0.0, -0.2, 0.9)];
    for (i, (x, z, h)) in peaks.into_iter().enumerate() {
        let salt = 100 + i as u32 * 3;
        let at = c + Vec2::new(x, z) + (Vec2::new(rand(t, salt), rand(t, salt + 1)) - 0.5) * 0.15;
        let h = h * (0.85 + rand(t, salt + 2) * 0.3);
        let r = 0.4 * h.sqrt();
        let turn = rand(t, salt + 2) * TAU;
        soup.cone(
            at,
            r,
            5,
            turn,
            (LAND - 0.02, LAND + h),
            shade(rock, jitter(t, salt, 0.08)),
        );
        // The snow cap shares the tip, a hair wider so it sits on the rock.
        soup.cone(
            at,
            r * 0.4,
            5,
            turn,
            (LAND + h * 0.6, LAND + h + 0.004),
            snow,
        );
    }
}

/// A palace or town hall roofed in its civ's color, houses around it, and
/// a suburb or two for the big cities.
fn town(soup: &mut Soup, world: &World, t: IVec2, civ: usize, capital: bool, pop: u32) {
    let c = center(t);
    let wall = srgb(0xe8dfcf);
    let roof = srgb(0xa4523a);
    let banner = civ_color(civ).to_linear();
    let (r, h) = if capital { (0.2, 0.36) } else { (0.15, 0.26) };
    soup.prism(c, r, 4, FRAC_PI_4, (LAND, LAND + h), wall, shade(wall, 0.8));
    soup.cone(
        c,
        r * 1.25,
        4,
        FRAC_PI_4,
        (LAND + h, LAND + h + 0.22),
        banner,
    );
    let houses = |soup: &mut Soup, t: IVec2, n: usize, reach: f32| {
        for (i, p) in spots(t, n, reach) {
            let y = ground(world, t, p);
            let s = 0.8 + rand(t, 120 + i as u32) * 0.5;
            let turn = FRAC_PI_4 + rand(t, 130 + i as u32);
            let hh = 0.1 + 0.08 * s;
            soup.prism(
                p,
                0.1 * s,
                4,
                turn,
                (y - 0.02, y + hh),
                wall,
                shade(wall, 0.78),
            );
            soup.cone(
                p,
                0.13 * s,
                4,
                turn,
                (y + hh, y + hh + 0.09 * s),
                shade(roof, jitter(t, 140 + i as u32, 0.1)),
            );
        }
    };
    houses(soup, t, 7, 0.68);
    let suburbs = (0..6)
        .map(|e| neighbor(t, e))
        .filter(|&n| {
            !world.farm(n)
                && world.tile(n).is_some_and(|tile| {
                    !tile.terrain.is_water()
                        && tile.relief != Relief::Mountains
                        && tile.feature == Feature::None
                })
        })
        .take(pop as usize / 4);
    for n in suburbs {
        houses(soup, n, 3, 0.45);
    }
}

/// The lakes and seas: one glossy mesh, coasts above the deep.
pub fn water(world: &World) -> Mesh {
    let mut soup = Soup::default();
    for t in World::coords() {
        let tile = world.tile(t).unwrap();
        if !tile.revealed || !tile.terrain.is_water() {
            continue;
        }
        let top = top_color(world, t, tile, false);
        let level = rim(tile);
        soup.prism(
            center(t),
            RADIUS * 0.995,
            6,
            -30f32.to_radians(),
            (BASE, level),
            top,
            shade(top, 0.6),
        );
    }
    soup.into_mesh()
}

/// Every civ's border: a solid line along the edge and a wash of its color
/// fading inward, drawn unlit and blended.
pub fn borders(world: &World) -> Mesh {
    let mut soup = Soup::default();
    for t in World::coords() {
        let tile = world.tile(t).unwrap();
        let Some(civ) = world.owner(t).filter(|_| tile.revealed) else {
            continue;
        };
        let color = civ_color(civ).to_linear();
        let c = center(t);
        let water = tile.terrain.is_water();
        let at = |p: Vec2, s: f32| {
            let q = c + p * s;
            let y = if water {
                rim(tile)
            } else {
                ground(world, t, q)
            };
            Vec3::new(q.x, y + 0.025, q.y)
        };
        for e in 0..6 {
            if world.owner(neighbor(t, e)) == Some(civ) {
                continue;
            }
            let (a, b) = (corner(e), corner(e + 1));
            soup.quad([at(a, 0.97), at(a, 0.9), at(b, 0.9), at(b, 0.97)], color);
            let clear = color.with_alpha(0.0);
            let wash = color.with_alpha(0.42);
            let (a0, a1, b0, b1) = (at(a, 0.9), at(a, 0.62), at(b, 0.9), at(b, 0.62));
            soup.tri3([a0, a1, b1], [wash, clear, clear]);
            soup.tri3([a0, b1, b0], [wash, clear, wash]);
        }
    }
    soup.into_mesh()
}

/// A flat hexagonal ring, `width` of the radius thick, centered on the
/// origin.
pub fn hex_ring(width: f32) -> Mesh {
    let mut soup = Soup::default();
    let white = LinearRgba::WHITE;
    let at = |p: Vec2, s: f32| Vec3::new(p.x * s, 0.0, p.y * s);
    for e in 0..6 {
        let (a, b) = (corner(e) * INSET, corner(e + 1) * INSET);
        soup.quad(
            [
                at(a, 1.0),
                at(a, 1.0 - width),
                at(b, 1.0 - width),
                at(b, 1.0),
            ],
            white,
        );
    }
    soup.into_mesh()
}
