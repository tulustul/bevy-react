//! The pointer on the map: the tile under it (a ring marks it, and React
//! pins its tooltip to that ring), what a click lands on, and the ring
//! marking whatever React selected.

use bevy::prelude::*;
use bevy::window::PrimaryWindow;
use bevy_react::{PointerCapture, ReactEvents, react_event, react_message};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::hex;
use super::mesh::{LAND, rim};
use super::world::{CIVS, Feature, Relief, World, Yields};
use super::{city_id, unit_id};
use crate::camera::MainCamera;

/// A click that moves the pointer further than this is a drag (it pans).
const CLICK_SLOP: f32 = 6.0;

#[derive(Component)]
pub enum Ring {
    Hover,
    Select,
}

#[derive(Serialize, Deserialize, TS, Clone, Copy, PartialEq, Debug)]
pub struct TilePos {
    pub col: i32,
    pub row: i32,
}

/// One tile, as the tooltip and the panels show it.
#[derive(Serialize, TS, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TileInfo {
    pub col: i32,
    pub row: i32,
    /// Still parchment: nothing else is known.
    pub revealed: bool,
    pub terrain: String,
    pub hills: bool,
    pub mountains: bool,
    /// `"woods"`, `"rainforest"`.
    pub feature: Option<String>,
    pub yields: Yields,
    pub farm: bool,
    /// The civ whose borders it lies in.
    pub owner: Option<String>,
    /// The city whose territory it is.
    pub city: Option<String>,
    /// The city standing on it.
    pub settlement: Option<String>,
    pub unit: Option<String>,
}

/// Bevy → React: the pointer moved onto another tile (`null`: off the map,
/// or over the UI).
#[react_event(name = "map.hover")]
pub struct HoverTile(pub Option<TileInfo>);

/// Bevy → React: a click on the map (not a drag).
#[react_event(name = "map.click")]
pub struct ClickTile(pub TileInfo);

/// React → Bevy: ring the selected city or unit's tile (`null` clears it).
#[react_message(name = "map.select")]
pub struct Select(pub Option<TilePos>);

#[derive(Resource, Default)]
pub struct Pointer {
    tile: Option<IVec2>,
    /// Where a press on the map began, and how far it has moved since.
    press: Option<(Vec2, f32)>,
    /// `--shoot`: the hovered tile, whatever the cursor does.
    pub pinned: Option<Option<IVec2>>,
}

pub fn info(world: &World, t: IVec2) -> TileInfo {
    let tile = world.tile(t).unwrap();
    let known = tile.revealed;
    TileInfo {
        col: t.x,
        row: t.y,
        revealed: known,
        terrain: tile.terrain.name().into(),
        hills: tile.relief == Relief::Hills,
        mountains: tile.relief == Relief::Mountains,
        feature: match tile.feature {
            Feature::Woods => Some("woods".into()),
            Feature::Rainforest => Some("rainforest".into()),
            Feature::None => None,
        },
        yields: world.yields(t),
        farm: known && world.farm(t),
        owner: world.owner(t).map(|civ| CIVS[civ].id.into()),
        city: tile.city.map(|c| city_id(world, c)),
        settlement: world.city_at(t).map(|c| city_id(world, c)),
        unit: world
            .unit_at(t)
            .filter(|_| known)
            .map(|u| unit_id(world, u)),
    }
}

/// Put a ring on `t`, or hide it.
fn place(
    world: &World,
    t: Option<IVec2>,
    (transform, visibility): (&mut Transform, &mut Visibility),
) {
    if let Some(tile) = t.and_then(|t| world.tile(t)) {
        let at = hex::center(t.unwrap());
        // A hill's slope rises inward: lift the ring clear of it.
        let lift = if tile.relief == Relief::Hills {
            0.07
        } else {
            0.03
        };
        transform.translation = Vec3::new(at.x, rim(tile) + lift, at.y);
        *visibility = Visibility::Inherited;
    } else {
        *visibility = Visibility::Hidden;
    }
}

#[allow(clippy::too_many_arguments)]
pub fn track_pointer(
    world: Res<World>,
    mut pointer: ResMut<Pointer>,
    capture: Res<PointerCapture>,
    buttons: Res<ButtonInput<MouseButton>>,
    window: Single<&Window, With<PrimaryWindow>>,
    camera: Single<(&Camera, &GlobalTransform), With<MainCamera>>,
    mut rings: Query<(&Ring, &mut Transform, &mut Visibility)>,
    events: ReactEvents,
) {
    let cursor = window.cursor_position();
    let (camera, eye) = *camera;
    let over_map = cursor
        .filter(|_| !capture.is_captured())
        .and_then(|p| camera.viewport_to_world(eye, p).ok())
        .and_then(|ray| {
            let d = ray.intersect_plane(Vec3::Y * LAND, InfinitePlane3d::new(Vec3::Y))?;
            let p = ray.get_point(d);
            Some(hex::tile_at(Vec2::new(p.x, p.z)))
        })
        .filter(|&t| World::in_bounds(t));
    let tile = pointer.pinned.unwrap_or(over_map);

    if tile != pointer.tile {
        pointer.tile = tile;
        for (ring, mut transform, mut visibility) in &mut rings {
            if matches!(ring, Ring::Hover) {
                place(&world, tile, (&mut transform, &mut visibility));
            }
        }
        events.send(&HoverTile(tile.map(|t| info(&world, t))));
    }

    // A click is a press and release on the map that didn't drag.
    if buttons.just_pressed(MouseButton::Left) {
        pointer.press = cursor.filter(|_| over_map.is_some()).map(|p| (p, 0.0));
    }
    if let (Some((last, travel)), Some(now)) = (pointer.press, cursor) {
        pointer.press = Some((now, travel + now.distance(last)));
    }
    let press = pointer
        .press
        .filter(|_| buttons.just_released(MouseButton::Left));
    if let (Some((_, travel)), Some(t)) = (press, over_map)
        && travel < CLICK_SLOP
    {
        events.send(&ClickTile(info(&world, t)));
    }
    if !buttons.pressed(MouseButton::Left) {
        pointer.press = None;
    }
}

pub fn on_select(
    select: On<Select>,
    world: Res<World>,
    mut rings: Query<(&Ring, &mut Transform, &mut Visibility)>,
) {
    let t = select.event().0.map(|p| IVec2::new(p.col, p.row));
    for (ring, mut transform, mut visibility) in &mut rings {
        if matches!(ring, Ring::Select) {
            place(&world, t, (&mut transform, &mut visibility));
        }
    }
}
