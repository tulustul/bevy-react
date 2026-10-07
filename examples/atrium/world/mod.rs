//! The world around the windows: an alpine lake at the end of a pier. All of
//! it is stylized and lit by one palette uniform ([`Atmos`], `palette.rs`),
//! so the whole world re-lights — sunset, aurora night, snowy morning — by
//! easing a handful of colors:
//!
//!   * `sky.rs` — the dome: gradient, sun, moon, stars, clouds, aurora;
//!   * `land.rs` — terrain, pines and the pier, faceted and fogged;
//!   * `water.rs` — the lake, a real mirror (a second camera below the
//!     surface) with ripples, a sun path and rain rings;
//!   * `weather.rs` — rain, snow, fireflies and sky lanterns.

mod land;
mod palette;
mod sky;
mod water;
mod weather;

use bevy::prelude::*;
use bevy::render::render_resource::AsBindGroup;
use bevy::shader::ShaderRef;
use bevy_react::{ReactAppExt, ReactEvents, react_event};

pub use palette::{Atmos, Moment, Sky, atmos, sun_direction};

/// The eye camera sees the world plus the lake that mirrors it.
pub const EYE_LAYERS: [usize; 2] = [0, water::MIRROR_WATER_LAYER];
/// Other cameras (the lenses) see the world plus a lake that reflects only
/// the sky — the mirror is filmed for the eye's point of view.
pub const LENS_LAYERS: [usize; 2] = [0, water::SKY_WATER_LAYER];

pub struct WorldPlugin;

impl Plugin for WorldPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        weather::plugin(app);
        app.add_plugins((
            MaterialPlugin::<sky::SkyMaterial>::default(),
            MaterialPlugin::<WorldMaterial>::default(),
            MaterialPlugin::<water::WaterMaterial>::default(),
        ))
        .add_systems(
            Startup,
            (load_library, sky::spawn, land::spawn, water::spawn),
        )
        .add_systems(
            Update,
            (
                advance_sky,
                sky::follow_eye,
                water::mirror_eye,
                water::fit_mirror,
            ),
        );
    }
}

/// Bevy → React: the hour the sky is showing, while it moves — a picked
/// place's time-lapse sweeps the Skies clock and scrubber along with it.
#[react_event(name = "skies.now")]
pub struct SkyNow {
    pub hour: f32,
}

pub fn register_bindings(app: &mut App) {
    weather::register_bindings(app);
    app.add_react_event::<SkyNow>();
}

/// `common.wgsl` is imported by the world shaders as `atrium::common`; an
/// import resolves only while its asset is loaded.
#[derive(Resource)]
struct ShaderLibrary(#[allow(dead_code)] Handle<Shader>);

fn load_library(mut commands: Commands, assets: Res<AssetServer>) {
    commands.insert_resource(ShaderLibrary(assets.load("atrium/common.wgsl")));
}

/// The land and its props: `land.wgsl`, lit by the palette. `kind.x` picks
/// terrain (procedural forest/rock/snow) or props (vertex colors).
#[derive(Asset, AsBindGroup, TypePath, Clone)]
pub struct WorldMaterial {
    #[uniform(0)]
    pub atmos: Atmos,
    #[uniform(1)]
    pub kind: Vec4,
}

impl Material for WorldMaterial {
    fn fragment_shader() -> ShaderRef {
        "atrium/land.wgsl".into()
    }
}

/// Ease the sky and push the palette into every world material — only while
/// it moves (and once at startup), so a still sky uploads nothing.
fn advance_sky(
    time: Res<Time>,
    mut sky: ResMut<Sky>,
    mut first: Local<bool>,
    mut skies: ResMut<Assets<sky::SkyMaterial>>,
    mut lands: ResMut<Assets<WorldMaterial>>,
    mut waters: ResMut<Assets<water::WaterMaterial>>,
    events: ReactEvents,
) {
    let moved = sky.tick(time.delta_secs());
    if !moved && *first {
        return;
    }
    // A scrub is already where the pointer put it; only a time-lapse's
    // hours stream back.
    if moved && sky.timelapse {
        events.send(&SkyNow { hour: sky.now.hour });
    }
    *first = true;
    let atmos = palette::atmos(&sky.now);
    for (_, m) in skies.iter_mut() {
        m.atmos = atmos;
    }
    for (_, m) in lands.iter_mut() {
        m.atmos = atmos;
    }
    for (_, m) in waters.iter_mut() {
        m.atmos = atmos;
    }
}
