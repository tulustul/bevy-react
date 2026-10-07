//! The Skies app's world side: six places, each a moment — a local hour and
//! its weather — and the typed bindings React drives them with.
//!
//!   * `bevy.skies.places()` lists them (with each one's globe pin entity,
//!     for the `<anchor>` label, and its sky colors for the card);
//!   * `bevy.skies.set({ place, hour, scrub })` borrows a place's sky: the
//!     world plays the hours between as a time-lapse (a scrub eases fast),
//!     and the globe turns to the place.

use bevy::prelude::*;
use bevy_react::{ReactAppExt, Request, react_message, react_request};
use serde::Serialize;
use ts_rs::TS;

use crate::globe::{Globe, Pins};
use crate::world::{Moment, Sky, atmos};

pub struct Place {
    pub id: &'static str,
    pub name: &'static str,
    pub region: &'static str,
    pub lat: f32,
    pub lon: f32,
    /// The UTC offset of its clock, hours.
    pub utc_offset: f32,
    pub condition: &'static str,
    pub temp: i32,
    pub moment: Moment,
}

const fn moment(hour: f32, cover: f32, rain: f32, snow: f32, aurora: f32) -> Moment {
    Moment {
        hour,
        cover,
        rain,
        snow,
        aurora,
    }
}

pub const PLACES: [Place; 6] = [
    Place {
        id: "moraine",
        name: "Moraine Lake",
        region: "Canada",
        lat: 51.32,
        lon: -116.18,
        utc_offset: -6.0,
        condition: "Golden hour",
        temp: 14,
        moment: moment(18.7, 0.12, 0.0, 0.0, 0.0),
    },
    Place {
        id: "kyoto",
        name: "Kyoto",
        region: "Japan",
        lat: 35.01,
        lon: 135.77,
        utc_offset: 9.0,
        condition: "Rain at dusk",
        temp: 17,
        moment: moment(19.4, 0.95, 1.0, 0.0, 0.0),
    },
    Place {
        id: "reykjavik",
        name: "Reykjavík",
        region: "Iceland",
        lat: 64.15,
        lon: -21.94,
        utc_offset: 0.0,
        condition: "Northern lights",
        temp: -3,
        moment: moment(23.2, 0.05, 0.0, 0.0, 1.0),
    },
    Place {
        id: "zermatt",
        name: "Zermatt",
        region: "Switzerland",
        lat: 46.02,
        lon: 7.75,
        utc_offset: 1.0,
        condition: "Snowfall",
        temp: -6,
        moment: moment(10.2, 0.9, 0.0, 1.0, 0.0),
    },
    Place {
        id: "chalten",
        name: "El Chaltén",
        region: "Argentina",
        lat: -49.33,
        lon: -72.89,
        utc_offset: -3.0,
        condition: "Bright and breezy",
        temp: 9,
        moment: moment(13.0, 0.4, 0.0, 0.0, 0.0),
    },
    Place {
        id: "atacama",
        name: "Atacama",
        region: "Chile",
        lat: -24.5,
        lon: -68.2,
        utc_offset: -4.0,
        condition: "Clearest sky on Earth",
        temp: 4,
        moment: moment(2.0, 0.0, 0.0, 0.0, 0.0),
    },
];

pub fn place(id: &str) -> Option<&'static Place> {
    PLACES.iter().find(|p| p.id == id)
}

/// One place, as the Skies app shows it.
#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct PlaceInfo {
    pub id: String,
    pub name: String,
    pub region: String,
    pub condition: String,
    pub temp: i32,
    /// Its moment's local hour, 0..24.
    pub hour: f32,
    /// The globe pin to anchor its label to (`Entity::to_bits`).
    pub pin: f64,
    /// Its sky, top to bottom, for the card (`#rrggbb`).
    pub sky_top: String,
    pub sky_bottom: String,
}

/// React → Bevy (request): the places, in order.
#[react_request(name = "skies.places", response = Vec<PlaceInfo>)]
pub struct Places;

/// React → Bevy: borrow `place`'s sky at `hour` (its own moment's hour when
/// you pick it; whatever the scrubber says while you drag — `scrub` eases
/// fast instead of playing a time-lapse).
#[react_message(name = "skies.set")]
pub struct SetSky {
    pub place: String,
    pub hour: f32,
    pub scrub: bool,
}

pub struct SkiesPlugin;

impl Plugin for SkiesPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        // The sky starts at home.
        app.insert_resource(Sky::new(PLACES[0].moment));
    }
}

pub fn register_bindings(app: &mut App) {
    app.add_react_request_handler(on_places)
        .add_react_handler(on_set);
}

fn hex(c: Vec4) -> String {
    let c = Srgba::from(LinearRgba::rgb(c.x, c.y, c.z));
    c.to_hex()[..7].to_string()
}

fn on_places(req: On<Request<Places>>, pins: Option<Res<Pins>>) {
    let places = PLACES
        .iter()
        .enumerate()
        .map(|(i, p)| {
            let sky = atmos(&p.moment);
            PlaceInfo {
                id: p.id.into(),
                name: p.name.into(),
                region: p.region.into(),
                condition: p.condition.into(),
                temp: p.temp,
                hour: p.moment.hour,
                pin: pins
                    .as_ref()
                    .and_then(|pins| pins.0.get(i))
                    .map_or(0.0, |e| e.to_bits() as f64),
                sky_top: hex(sky.zenith),
                sky_bottom: hex(sky.horizon + sky.glow * 0.35),
            }
        })
        .collect();
    req.respond(places);
}

fn on_set(on: On<SetSky>, mut sky: ResMut<Sky>, mut globe: ResMut<Globe>) {
    let msg = on.event();
    let Some(place) = place(&msg.place) else {
        return;
    };
    let to = Moment {
        hour: msg.hour.rem_euclid(24.0),
        ..place.moment
    };
    if msg.scrub {
        sky.scrub(to);
    } else {
        sky.go(to);
    }
    globe.focus(place, to.hour);
}
