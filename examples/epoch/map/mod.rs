//! The map: a generated hex world (`world`), its meshes (`mesh`), and the
//! pointer on it (`pick`). React learns the world through one request —
//! civs, cities and units, each with the entity its `<anchor>` follows.

pub mod hex;
pub mod mesh;
pub mod pick;
pub mod world;

use bevy::light::NotShadowCaster;
use bevy::prelude::*;
use bevy_react::{ReactAppExt, Request, react_message, react_request};
use serde::Serialize;
use ts_rs::TS;

use mesh::{LAND, civ_color};
use world::{CIVS, UnitKind, World, Yields};

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct CivInfo {
    pub id: String,
    pub name: String,
    pub leader: String,
    /// `#rrggbb`.
    pub color: String,
    pub player: bool,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct CityInfo {
    pub id: String,
    pub name: String,
    pub civ: String,
    pub col: i32,
    pub row: i32,
    /// The point above the town its banner is pinned to (`Entity::to_bits`).
    pub entity: f64,
    pub capital: bool,
    pub population: u32,
    pub yields: Yields,
    /// Tiles inside its borders.
    pub tiles: u32,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct UnitInfo {
    pub id: String,
    pub kind: String,
    pub civ: String,
    pub col: i32,
    pub row: i32,
    /// The figure its flag is pinned to (`Entity::to_bits`).
    pub entity: f64,
    /// Out in the parchment, unseen.
    pub hidden: bool,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct WorldInfo {
    pub cols: i32,
    pub rows: i32,
    /// The ring over the hovered tile, for the tooltip's `<anchor>`.
    pub cursor: f64,
    pub civs: Vec<CivInfo>,
    pub cities: Vec<CityInfo>,
    pub units: Vec<UnitInfo>,
}

/// React → Bevy (request): the world, once.
#[react_request(name = "map.world", response = WorldInfo)]
pub struct GetWorld;

/// React → Bevy: the political lens on or off (territory in civ colors).
#[react_message(name = "map.lens")]
pub struct Lens {
    pub political: bool,
}

/// The entities React pins things to, in `World` order.
#[derive(Resource)]
pub struct Pins {
    pub cities: Vec<Entity>,
    pub units: Vec<Entity>,
    pub cursor: Entity,
}

#[derive(Resource)]
struct LandMesh(Handle<Mesh>);

pub fn city_id(world: &World, i: usize) -> String {
    world.cities[i].name.to_lowercase().replace(' ', "-")
}

pub fn unit_id(world: &World, i: usize) -> String {
    format!("{}-{i}", world.units[i].kind.id())
}

pub struct MapPlugin;

impl Plugin for MapPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.insert_resource(World::generate())
            .init_resource::<pick::Pointer>()
            .add_systems(Startup, spawn_map)
            .add_systems(
                Update,
                pick::track_pointer.after(bevy_react::PointerCaptureSet),
            );
    }
}

pub fn register_bindings(app: &mut App) {
    app.add_react_request_handler(on_world)
        .add_react_handler(on_lens)
        .add_react_handler(pick::on_select)
        .add_react_event::<pick::HoverTile>()
        .add_react_event::<pick::ClickTile>();
}

fn spawn_map(
    mut commands: Commands,
    world: Res<World>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    let land = meshes.add(mesh::land(&world, false));
    commands.insert_resource(LandMesh(land.clone()));
    commands.spawn((
        Mesh3d(land),
        MeshMaterial3d(materials.add(StandardMaterial {
            perceptual_roughness: 0.92,
            ..default()
        })),
    ));
    commands.spawn((
        Mesh3d(meshes.add(mesh::water(&world))),
        MeshMaterial3d(materials.add(StandardMaterial {
            perceptual_roughness: 0.22,
            reflectance: 0.6,
            ..default()
        })),
        NotShadowCaster,
    ));
    commands.spawn((
        Mesh3d(meshes.add(mesh::borders(&world))),
        MeshMaterial3d(materials.add(StandardMaterial {
            unlit: true,
            alpha_mode: AlphaMode::Blend,
            ..default()
        })),
        NotShadowCaster,
    ));

    let mut ring = |commands: &mut Commands, width: f32, color: Color, marker| {
        commands
            .spawn((
                Mesh3d(meshes.add(mesh::hex_ring(width))),
                MeshMaterial3d(materials.add(StandardMaterial {
                    base_color: color,
                    unlit: true,
                    alpha_mode: AlphaMode::Blend,
                    ..default()
                })),
                NotShadowCaster,
                Visibility::Hidden,
                marker,
            ))
            .id()
    };
    let cursor = ring(
        &mut commands,
        0.09,
        Color::srgba(1.0, 1.0, 1.0, 0.85),
        pick::Ring::Hover,
    );
    ring(
        &mut commands,
        0.14,
        Color::srgb(1.0, 0.84, 0.42),
        pick::Ring::Select,
    );

    let cities = world
        .cities
        .iter()
        .map(|c| {
            let at = hex::center(c.tile);
            commands
                .spawn(Transform::from_xyz(at.x, LAND + 0.75, at.y))
                .id()
        })
        .collect();

    let base = meshes.add(Cylinder::new(0.26, 0.05));
    let body = meshes.add(Capsule3d::new(0.09, 0.26));
    let head = meshes.add(Sphere::new(0.075));
    let cloth = materials.add(StandardMaterial {
        base_color: Color::srgb(0.88, 0.84, 0.74),
        perceptual_roughness: 0.8,
        ..default()
    });
    let colors: Vec<_> = (0..CIVS.len())
        .map(|civ| materials.add(civ_color(civ)))
        .collect();
    let units = world
        .units
        .iter()
        .map(|u| {
            let at = hex::center(u.tile);
            let tile = world.tile(u.tile).unwrap();
            let shown = if tile.revealed {
                Visibility::Inherited
            } else {
                Visibility::Hidden
            };
            let scale = if u.kind == UnitKind::Settler {
                0.85
            } else {
                1.0
            };
            commands
                .spawn((
                    Transform::from_xyz(at.x, mesh::rim(tile) + 0.12, at.y)
                        .with_scale(Vec3::splat(scale)),
                    shown,
                ))
                .with_children(|figure| {
                    figure.spawn((Mesh3d(base.clone()), MeshMaterial3d(colors[u.civ].clone())));
                    figure.spawn((
                        Mesh3d(body.clone()),
                        MeshMaterial3d(cloth.clone()),
                        Transform::from_xyz(0.0, 0.24, 0.0),
                    ));
                    figure.spawn((
                        Mesh3d(head.clone()),
                        MeshMaterial3d(colors[u.civ].clone()),
                        Transform::from_xyz(0.0, 0.5, 0.0),
                    ));
                })
                .id()
        })
        .collect();
    commands.insert_resource(Pins {
        cities,
        units,
        cursor,
    });
}

fn on_world(req: On<Request<GetWorld>>, world: Res<World>, pins: Option<Res<Pins>>) {
    let Some(pins) = pins else {
        req.respond_err("the map hasn't spawned yet");
        return;
    };
    let bits = |e: Entity| e.to_bits() as f64;
    let civs = CIVS
        .iter()
        .enumerate()
        .map(|(i, c)| CivInfo {
            id: c.id.into(),
            name: c.name.into(),
            leader: c.leader.into(),
            color: Srgba::from(civ_color(i)).to_hex()[..7].to_string(),
            player: i == 0,
        })
        .collect();
    let cities = world
        .cities
        .iter()
        .enumerate()
        .map(|(i, c)| CityInfo {
            id: city_id(&world, i),
            name: c.name.into(),
            civ: CIVS[c.civ].id.into(),
            col: c.tile.x,
            row: c.tile.y,
            entity: bits(pins.cities[i]),
            capital: c.capital,
            population: c.population,
            yields: world.city_yields(i),
            tiles: world.tiles.iter().filter(|t| t.city == Some(i)).count() as u32,
        })
        .collect();
    let units = world
        .units
        .iter()
        .enumerate()
        .map(|(i, u)| UnitInfo {
            id: unit_id(&world, i),
            kind: u.kind.id().into(),
            civ: CIVS[u.civ].id.into(),
            col: u.tile.x,
            row: u.tile.y,
            entity: bits(pins.units[i]),
            hidden: !world.tile(u.tile).unwrap().revealed,
        })
        .collect();
    req.respond(WorldInfo {
        cols: world::COLS,
        rows: world::ROWS,
        cursor: bits(pins.cursor),
        civs,
        cities,
        units,
    });
}

fn on_lens(
    lens: On<Lens>,
    world: Res<World>,
    land: Res<LandMesh>,
    mut meshes: ResMut<Assets<Mesh>>,
) {
    let _ = meshes.insert(&land.0, mesh::land(&world, lens.political));
}
