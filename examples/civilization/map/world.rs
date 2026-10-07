//! The world: one deterministic map from a fixed seed — terrain from
//! value-noise elevation, moisture and latitude — settled by five
//! civilizations, each with its cities, territory and a few units.

use bevy::prelude::*;
use serde::Serialize;
use ts_rs::TS;

use super::hex::{center, distance, neighbor};

pub const COLS: i32 = 44;
pub const ROWS: i32 = 28;
const SEED: u32 = 1170;
const SEA_LEVEL: f32 = 0.4;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Terrain {
    Ocean,
    Coast,
    Grassland,
    Plains,
    Desert,
    Tundra,
    Snow,
}

impl Terrain {
    pub fn is_water(self) -> bool {
        matches!(self, Terrain::Ocean | Terrain::Coast)
    }

    pub fn name(self) -> &'static str {
        match self {
            Terrain::Ocean => "Ocean",
            Terrain::Coast => "Coast",
            Terrain::Grassland => "Grassland",
            Terrain::Plains => "Plains",
            Terrain::Desert => "Desert",
            Terrain::Tundra => "Tundra",
            Terrain::Snow => "Snow",
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Relief {
    Flat,
    Hills,
    Mountains,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Feature {
    None,
    Woods,
    Rainforest,
}

#[derive(Clone, Copy, Debug)]
pub struct Tile {
    pub terrain: Terrain,
    pub relief: Relief,
    pub feature: Feature,
    /// The city whose territory this is.
    pub city: Option<usize>,
    /// Explored by the player; the rest of the world is still parchment.
    pub revealed: bool,
}

pub struct Civ {
    pub id: &'static str,
    pub name: &'static str,
    pub leader: &'static str,
    /// sRGB.
    pub color: [u8; 3],
    pub cities: [&'static str; 5],
}

/// The player is the first.
pub const CIVS: [Civ; 5] = [
    Civ {
        id: "vesperia",
        name: "Vesperia",
        leader: "Queen Ilsa",
        color: [52, 118, 222],
        cities: ["Aurelia", "Lumen", "Highwater", "Saltmere", "Corvane"],
    },
    Civ {
        id: "kharjan",
        name: "Kharjan",
        leader: "Khan Toghul",
        color: [204, 56, 50],
        cities: ["Kharsa", "Ulgar", "Tem Rok", "Bastu", "Orhai"],
    },
    Civ {
        id: "sunmarch",
        name: "Sunmarch",
        leader: "Amaret the Radiant",
        color: [189, 133, 22],
        cities: ["Solenne", "Dawnreach", "Ambergate", "Halcyra", "Meridia"],
    },
    Civ {
        id: "nordhavn",
        name: "Nordhavn",
        leader: "Jarl Eskil",
        color: [40, 166, 122],
        cities: ["Skarholm", "Fjellby", "Ravnsund", "Isvik", "Tordal"],
    },
    Civ {
        id: "tzalan",
        name: "Tzalan",
        leader: "Lord Ixcatl",
        color: [150, 74, 190],
        cities: ["Tzalcoa", "Ixmatl", "Quenta", "Ochtli", "Atzcan"],
    },
];

pub struct City {
    pub name: &'static str,
    pub civ: usize,
    pub tile: IVec2,
    pub capital: bool,
    pub population: u32,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum UnitKind {
    Warrior,
    Archer,
    Scout,
    Settler,
    Builder,
}

impl UnitKind {
    pub fn id(self) -> &'static str {
        match self {
            UnitKind::Warrior => "warrior",
            UnitKind::Archer => "archer",
            UnitKind::Scout => "scout",
            UnitKind::Settler => "settler",
            UnitKind::Builder => "builder",
        }
    }
}

pub struct Unit {
    pub kind: UnitKind,
    pub civ: usize,
    pub tile: IVec2,
}

#[derive(Serialize, TS, Clone, Copy, Default, Debug, PartialEq)]
pub struct Yields {
    pub food: f32,
    pub production: f32,
    pub gold: f32,
    pub science: f32,
    pub culture: f32,
    pub faith: f32,
}

#[derive(Resource)]
pub struct World {
    pub tiles: Vec<Tile>,
    pub cities: Vec<City>,
    pub units: Vec<Unit>,
}

impl World {
    pub fn in_bounds(t: IVec2) -> bool {
        t.x >= 0 && t.y >= 0 && t.x < COLS && t.y < ROWS
    }

    pub fn tile(&self, t: IVec2) -> Option<&Tile> {
        Self::in_bounds(t).then(|| &self.tiles[(t.y * COLS + t.x) as usize])
    }

    pub fn coords() -> impl Iterator<Item = IVec2> {
        (0..ROWS).flat_map(|row| (0..COLS).map(move |col| IVec2::new(col, row)))
    }

    pub fn city_at(&self, t: IVec2) -> Option<usize> {
        self.cities.iter().position(|c| c.tile == t)
    }

    pub fn unit_at(&self, t: IVec2) -> Option<usize> {
        self.units.iter().position(|u| u.tile == t)
    }

    /// The owner of a tile, if it lies inside a civilization's borders.
    pub fn owner(&self, t: IVec2) -> Option<usize> {
        self.tile(t)?.city.map(|c| self.cities[c].civ)
    }

    /// Open grassland and plains inside the borders are farmed.
    pub fn farm(&self, t: IVec2) -> bool {
        let Some(tile) = self.tile(t) else {
            return false;
        };
        tile.city.is_some()
            && tile.relief == Relief::Flat
            && tile.feature == Feature::None
            && matches!(tile.terrain, Terrain::Grassland | Terrain::Plains)
            && self.city_at(t).is_none()
    }

    /// What working `t` yields.
    pub fn yields(&self, t: IVec2) -> Yields {
        let Some(tile) = self.tile(t) else {
            return Yields::default();
        };
        let (mut food, mut production, mut gold) = match tile.terrain {
            Terrain::Grassland => (2.0, 0.0, 0.0),
            Terrain::Plains => (1.0, 1.0, 0.0),
            Terrain::Tundra | Terrain::Ocean => (1.0, 0.0, 0.0),
            Terrain::Coast => (1.0, 0.0, 1.0),
            Terrain::Desert | Terrain::Snow => (0.0, 0.0, 0.0),
        };
        match tile.relief {
            Relief::Hills => production += 1.0,
            Relief::Mountains => (food, production, gold) = (0.0, 0.0, 0.0),
            Relief::Flat => {}
        }
        match tile.feature {
            Feature::Woods => production += 1.0,
            Feature::Rainforest => food += 1.0,
            Feature::None => {}
        }
        if self.farm(t) {
            food += 1.0;
        }
        Yields {
            food,
            production,
            gold,
            ..default()
        }
    }

    /// A city's yields per turn: its center, the best tiles its citizens
    /// work, and what its population and palace bring.
    pub fn city_yields(&self, i: usize) -> Yields {
        self.yields_with(i, self.cities[i].population)
    }

    fn yields_with(&self, i: usize, population: u32) -> Yields {
        let city = &self.cities[i];
        let mut worked: Vec<Yields> = Self::coords()
            .filter(|&t| self.tile(t).unwrap().city == Some(i) && self.city_at(t).is_none())
            .map(|t| self.yields(t))
            .collect();
        let score = |y: &Yields| y.food * 2.0 + y.production + y.gold * 0.6;
        worked.sort_by(|a, b| score(b).total_cmp(&score(a)));
        let center = self.yields(city.tile);
        let pop = population as f32;
        let palace = if city.capital { 1.0 } else { 0.0 };
        let mut y = Yields {
            food: center.food.max(2.0),
            production: center.production.max(1.0) + 1.0 + palace * 2.0,
            gold: center.gold + 2.0 + palace * 5.0,
            science: 1.0 + pop * 0.8 + palace * 3.0,
            culture: 1.0 + pop * 0.5 + palace * 3.0,
            faith: (rand(city.tile, 7) * 4.0).floor(),
        };
        for w in worked.iter().take(population as usize) {
            y.food += w.food;
            y.production += w.production;
            y.gold += w.gold;
        }
        y
    }

    pub fn generate() -> World {
        let mut tiles: Vec<Tile> = Self::coords().map(terrain).collect();
        // Water next to land is shallow.
        for t in Self::coords() {
            let i = (t.y * COLS + t.x) as usize;
            let shore = (0..6).any(|e| {
                let n = neighbor(t, e);
                Self::in_bounds(n) && !tiles[(n.y * COLS + n.x) as usize].terrain.is_water()
            });
            if tiles[i].terrain == Terrain::Ocean && shore {
                tiles[i].terrain = Terrain::Coast;
            }
        }
        let mut world = World {
            tiles,
            cities: Vec::new(),
            units: Vec::new(),
        };
        world.settle();
        world.claim();
        world.grow();
        world.explore();
        world.muster();
        world
    }

    fn settleable(&self, t: IVec2) -> bool {
        let tile = self.tile(t).unwrap();
        !tile.terrain.is_water()
            && tile.relief != Relief::Mountains
            && !matches!(tile.terrain, Terrain::Snow | Terrain::Desert)
            && t.x >= 2
            && t.y >= 2
            && t.x < COLS - 2
            && t.y < ROWS - 2
    }

    /// How good a city site is: the food and production around it.
    fn fertility(&self, t: IVec2) -> f32 {
        Self::coords()
            .filter(|&n| distance(n, t) <= 2)
            .map(|n| {
                let y = self.yields(n);
                y.food * 1.5 + y.production * 0.6 + y.gold * 0.3
            })
            .sum()
    }

    /// Capitals spread as far apart as the land allows, then each civ grows
    /// a few cities around its own.
    fn settle(&mut self) {
        let sites: Vec<(IVec2, f32)> = Self::coords()
            .filter(|&t| self.settleable(t))
            .map(|t| (t, self.fertility(t)))
            .collect();
        let best = |score: &dyn Fn(IVec2, f32) -> f32| {
            sites
                .iter()
                .max_by(|a, b| score(a.0, a.1).total_cmp(&score(b.0, b.1)))
                .map(|s| s.0)
                .expect("the map has land")
        };
        let mut capitals = vec![best(&|_, f| f)];
        while capitals.len() < CIVS.len() {
            let spread = |t: IVec2| capitals.iter().map(|&c| distance(t, c)).min().unwrap();
            capitals.push(best(&|t, f| spread(t) as f32 + f * 0.4));
        }
        // The player sits nearest the middle of the map.
        let mid = IVec2::new(COLS / 2, ROWS / 2);
        let player = (0..capitals.len())
            .min_by_key(|&i| distance(capitals[i], mid))
            .unwrap();
        capitals.swap(0, player);
        for (civ, &tile) in capitals.iter().enumerate() {
            self.found(civ, tile);
        }

        let extra = [3, 2, 2, 2, 2];
        for round in 0..3 {
            for (civ, &wanted) in extra.iter().enumerate() {
                if round >= wanted {
                    continue;
                }
                let own = |t: IVec2| {
                    self.cities
                        .iter()
                        .filter(|c| c.civ == civ)
                        .map(|c| distance(t, c.tile))
                        .min()
                        .unwrap()
                };
                let site = sites
                    .iter()
                    .filter(|(t, _)| {
                        self.cities.iter().all(|c| distance(*t, c.tile) >= 4)
                            && own(*t) <= 6
                            && self
                                .cities
                                .iter()
                                .filter(|c| c.civ != civ)
                                .all(|c| distance(*t, c.tile) > own(*t))
                    })
                    .max_by(|a, b| {
                        let score = |s: &(IVec2, f32)| s.1 - own(s.0) as f32 * 2.0;
                        score(a).total_cmp(&score(b))
                    })
                    .map(|s| s.0);
                if let Some(tile) = site {
                    self.found(civ, tile);
                }
            }
        }
    }

    fn found(&mut self, civ: usize, tile: IVec2) {
        let nth = self.cities.iter().filter(|c| c.civ == civ).count();
        let capital = nth == 0;
        self.cities.push(City {
            name: CIVS[civ].cities[nth],
            civ,
            tile,
            capital,
            population: 0,
        });
    }

    /// Each city as big as its land feeds with food to spare (up to a cap:
    /// capitals are older).
    fn grow(&mut self) {
        for i in 0..self.cities.len() {
            let city = &self.cities[i];
            let r = rand(city.tile, 3);
            let cap = if city.capital {
                9 + (r * 3.0) as u32
            } else {
                3 + (r * 5.0) as u32
            };
            self.cities[i].population = (1..=cap)
                .rev()
                .find(|&n| self.yields_with(i, n).food >= 2.0 * n as f32 + 2.0)
                .unwrap_or(1);
        }
    }

    /// Every tile within reach of a city is its territory (a capital
    /// reaches further); the nearest city wins.
    fn claim(&mut self) {
        for t in Self::coords() {
            let owner = (0..self.cities.len())
                .filter(|&i| {
                    let c = &self.cities[i];
                    distance(t, c.tile) <= if c.capital { 3 } else { 2 }
                })
                .min_by_key(|&i| distance(t, self.cities[i].tile));
            self.tiles[(t.y * COLS + t.x) as usize].city = owner;
        }
    }

    /// The player has explored around their cities, and met everyone.
    fn explore(&mut self) {
        for t in Self::coords() {
            let seen = self.cities.iter().any(|c| {
                let d = distance(t, c.tile);
                if c.civ == 0 { d <= 8 } else { d <= 3 }
            });
            self.tiles[(t.y * COLS + t.x) as usize].revealed = seen;
        }
    }

    /// A few units: the player's around their cities, a guard by every
    /// other capital.
    fn muster(&mut self) {
        let free = |w: &World, t: IVec2| {
            World::in_bounds(t)
                && w.settleable(t)
                && w.city_at(t).is_none()
                && w.unit_at(t).is_none()
        };
        let near = |w: &World, from: IVec2, d: i32| {
            Self::coords()
                .filter(|&t| distance(t, from) == d && free(w, t))
                .min_by_key(|t| (rand(*t, 11) * 1000.0) as i32)
        };
        let player: Vec<IVec2> = self
            .cities
            .iter()
            .filter(|c| c.civ == 0)
            .map(|c| c.tile)
            .collect();
        let orders = [
            (UnitKind::Warrior, player[0], 1),
            (UnitKind::Settler, player[0], 2),
            (UnitKind::Archer, player[1 % player.len()], 1),
            (UnitKind::Builder, player[2 % player.len()], 1),
        ];
        for (kind, from, d) in orders {
            if let Some(tile) = near(self, from, d) {
                self.units.push(Unit { kind, civ: 0, tile });
            }
        }
        // The scout is out at the edge of the known world.
        let scout = Self::coords()
            .filter(|&t| self.tile(t).unwrap().revealed && free(self, t))
            .max_by_key(|&t| distance(t, player[0]));
        if let Some(tile) = scout {
            self.units.push(Unit {
                kind: UnitKind::Scout,
                civ: 0,
                tile,
            });
        }
        for civ in 1..CIVS.len() {
            let capital = self.cities.iter().find(|c| c.civ == civ).unwrap().tile;
            if let Some(tile) = near(self, capital, 1) {
                self.units.push(Unit {
                    kind: UnitKind::Warrior,
                    civ,
                    tile,
                });
            }
        }
    }
}

/// A tile's terrain before coasts, cities and borders.
fn terrain(t: IVec2) -> Tile {
    let p = center(t);
    let u = t.x as f32 / (COLS - 1) as f32;
    let v = t.y as f32 / (ROWS - 1) as f32;
    // Land fades into ocean toward the map's edges.
    let edge = u.min(1.0 - u).min(v.min(1.0 - v) * 1.3);
    let falloff = smoothstep(0.0, 0.2, edge);
    let elevation = fbm(p * 0.075, SEED) * (0.35 + 0.65 * falloff);
    let moisture = fbm(p * 0.11 + 31.7, SEED ^ 0x9e37);
    let latitude = (v - 0.5).abs() * 2.0;
    let warmth = 1.0 - latitude + (fbm(p * 0.2, SEED ^ 0x51ed) - 0.5) * 0.3;

    let mut tile = Tile {
        terrain: Terrain::Ocean,
        relief: Relief::Flat,
        feature: Feature::None,
        city: None,
        revealed: false,
    };
    if elevation < SEA_LEVEL {
        return tile;
    }
    tile.terrain = if warmth < 0.14 {
        Terrain::Snow
    } else if warmth < 0.3 {
        Terrain::Tundra
    } else if warmth > 0.66 && moisture < 0.4 {
        Terrain::Desert
    } else if moisture > 0.46 {
        Terrain::Grassland
    } else {
        Terrain::Plains
    };
    // Mountains run in ranges along the ridges of another noise.
    let ridge = 1.0 - (fbm(p * 0.1 + 7.3, SEED ^ 0x7f4a) * 2.0 - 1.0).abs();
    let height = elevation - SEA_LEVEL;
    tile.relief = if ridge > 0.95 && height > 0.03 {
        Relief::Mountains
    } else if ridge > 0.915 || height > 0.26 || rand(t, 1) < 0.07 {
        Relief::Hills
    } else {
        Relief::Flat
    };
    let r = rand(t, 2);
    tile.feature = match tile.terrain {
        _ if tile.relief == Relief::Mountains => Feature::None,
        Terrain::Grassland | Terrain::Plains if warmth > 0.72 && moisture > 0.56 && r < 0.7 => {
            Feature::Rainforest
        }
        Terrain::Grassland | Terrain::Plains | Terrain::Tundra if moisture > 0.44 && r < 0.55 => {
            Feature::Woods
        }
        _ => Feature::None,
    };
    tile
}

/// A stable pseudo-random number in `0..1` per tile and salt.
pub fn rand(t: IVec2, salt: u32) -> f32 {
    hash(t.x, t.y, SEED ^ salt.wrapping_mul(0x9e37_79b9))
}

fn hash(x: i32, y: i32, seed: u32) -> f32 {
    let mut h = seed ^ (x as u32).wrapping_mul(0x27d4_eb2d) ^ (y as u32).wrapping_mul(0x1656_67b1);
    h = (h ^ (h >> 15)).wrapping_mul(0x85eb_ca6b);
    h = (h ^ (h >> 13)).wrapping_mul(0xc2b2_ae35);
    (h ^ (h >> 16)) as f32 / u32::MAX as f32
}

fn mix(a: f32, b: f32, t: f32) -> f32 {
    a + (b - a) * t
}

fn smoothstep(e0: f32, e1: f32, x: f32) -> f32 {
    let t = ((x - e0) / (e1 - e0)).clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

/// Value noise: smoothly interpolated random values on an integer lattice.
fn noise(p: Vec2, seed: u32) -> f32 {
    let i = p.floor();
    let f = p - i;
    let s = f * f * (3.0 - 2.0 * f);
    let (x, y) = (i.x as i32, i.y as i32);
    let top = mix(hash(x, y, seed), hash(x + 1, y, seed), s.x);
    let bottom = mix(hash(x, y + 1, seed), hash(x + 1, y + 1, seed), s.x);
    mix(top, bottom, s.y)
}

fn fbm(mut p: Vec2, seed: u32) -> f32 {
    let (mut sum, mut amp, mut norm) = (0.0, 0.5, 0.0);
    for octave in 0..4 {
        sum += noise(p, seed.wrapping_add(octave)) * amp;
        norm += amp;
        amp *= 0.5;
        p *= 2.03;
    }
    sum / norm
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `cargo test -p civilization -- --nocapture` prints the map.
    #[test]
    fn the_world_is_settled() {
        let world = World::generate();
        let land = world.tiles.iter().filter(|t| !t.terrain.is_water()).count();
        let share = land as f32 / world.tiles.len() as f32;
        for row in 0..ROWS {
            let line: String = (0..COLS)
                .map(|col| {
                    let t = IVec2::new(col, row);
                    let tile = world.tile(t).unwrap();
                    if let Some(c) = world.city_at(t) {
                        return char::from(b'A' + world.cities[c].civ as u8);
                    }
                    match (tile.terrain, tile.relief) {
                        (_, Relief::Mountains) => '^',
                        (Terrain::Ocean, _) => ' ',
                        (Terrain::Coast, _) => '~',
                        (_, Relief::Hills) => 'n',
                        (Terrain::Desert, _) => ':',
                        (Terrain::Snow | Terrain::Tundra, _) => '*',
                        _ if tile.feature != Feature::None => 'T',
                        _ => '.',
                    }
                })
                .collect();
            let pad = if row % 2 == 1 { " " } else { "" };
            println!(
                "{pad}{}",
                line.chars().flat_map(|c| [c, ' ']).collect::<String>()
            );
        }
        println!("land {:.0}%", share * 100.0);
        assert!((0.3..0.6).contains(&share), "land share {share}");
        assert!(world.cities.len() >= 12, "{} cities", world.cities.len());
        for (civ, _) in CIVS.iter().enumerate() {
            assert!(world.cities.iter().filter(|c| c.civ == civ).count() >= 2);
        }
        for city in &world.cities {
            assert_eq!(world.owner(city.tile), Some(city.civ), "{}", city.name);
        }
        assert!(world.units.len() >= 7);
        for (i, city) in world.cities.iter().enumerate() {
            let food = world.city_yields(i).food;
            assert!(
                food >= city.population as f32 * 2.0,
                "{} starves",
                city.name
            );
        }
    }
}
