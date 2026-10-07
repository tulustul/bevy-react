//! Pointy-top hexes in "odd-r" offset rows — every odd row shoved half a hex
//! east, the classic 4X layout. A tile is `IVec2(col, row)`; the ground is
//! the XZ plane with rows running toward +Z (south, toward the camera).

use bevy::math::{IVec2, Vec2};

/// Center to corner.
pub const RADIUS: f32 = 1.0;
/// Flat side to flat side (√3 · R): the column pitch.
pub const WIDTH: f32 = 1.732_050_8 * RADIUS;
/// The row pitch.
pub const ROW: f32 = 1.5 * RADIUS;

/// The center of `tile` on the ground plane, as (x, z).
pub fn center(tile: IVec2) -> Vec2 {
    Vec2::new(
        WIDTH * (tile.x as f32 + 0.5 * (tile.y & 1) as f32),
        ROW * tile.y as f32,
    )
}

/// Corner `i` (0..6) relative to the center, at angle `60·i − 30` degrees
/// in the XZ plane: corners 2 and 5 are the south and north points.
pub fn corner(i: usize) -> Vec2 {
    let a = (60.0 * i as f32 - 30.0).to_radians();
    Vec2::new(a.cos(), a.sin()) * RADIUS
}

/// The tile across edge `i` — the edge from corner `i` to corner `i + 1`,
/// facing `60·i` degrees: east, south-east, south-west, west, north-west,
/// north-east.
pub fn neighbor(tile: IVec2, edge: usize) -> IVec2 {
    let odd = tile.y & 1;
    tile + match edge % 6 {
        0 => IVec2::new(1, 0),
        1 => IVec2::new(odd, 1),
        2 => IVec2::new(odd - 1, 1),
        3 => IVec2::new(-1, 0),
        4 => IVec2::new(odd - 1, -1),
        _ => IVec2::new(odd, -1),
    }
}

/// Offset → axial (q, r).
fn axial(tile: IVec2) -> IVec2 {
    IVec2::new(tile.x - (tile.y - (tile.y & 1)) / 2, tile.y)
}

/// Steps between two tiles.
pub fn distance(a: IVec2, b: IVec2) -> i32 {
    let d = axial(a) - axial(b);
    (d.x.abs() + d.y.abs() + (d.x + d.y).abs()) / 2
}

/// The tile containing ground point (x, z).
pub fn tile_at(p: Vec2) -> IVec2 {
    let q = (3f32.sqrt() / 3.0 * p.x - p.y / 3.0) / RADIUS;
    let r = (2.0 / 3.0 * p.y) / RADIUS;
    // Cube rounding: round all three, fix the one that rounded furthest.
    let (s, mut rq, mut rr) = (-q - r, q.round(), r.round());
    let rs = s.round();
    let (dq, dr, ds) = ((rq - q).abs(), (rr - r).abs(), (rs - s).abs());
    if dq > dr && dq > ds {
        rq = -rr - rs;
    } else if dr > ds {
        rr = -rq - rs;
    }
    let (q, r) = (rq as i32, rr as i32);
    IVec2::new(q + (r - (r & 1)) / 2, r)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn neighbors_sit_one_pitch_away_in_their_edge_direction() {
        for tile in [IVec2::new(4, 4), IVec2::new(4, 5)] {
            for edge in 0..6 {
                let n = neighbor(tile, edge);
                let d = center(n) - center(tile);
                assert!((d.length() - WIDTH).abs() < 1e-4, "{tile} edge {edge}");
                let angle = d.y.atan2(d.x).to_degrees().rem_euclid(360.0);
                assert!((angle - 60.0 * edge as f32).abs() < 1e-3);
                assert_eq!(distance(tile, n), 1);
            }
        }
    }

    #[test]
    fn points_round_to_their_tile() {
        for tile in [IVec2::new(0, 0), IVec2::new(7, 3), IVec2::new(12, 8)] {
            let c = center(tile);
            assert_eq!(tile_at(c), tile);
            for i in 0..6 {
                assert_eq!(tile_at(c + corner(i) * 0.9), tile, "{tile} corner {i}");
            }
        }
        assert_eq!(distance(IVec2::new(0, 0), IVec2::new(3, 4)), 5);
    }
}
