//! Atrium's own effects on the screen-space UI (the HUD, the dock, the
//! globe's labels) — params structs + shaders under `examples/assets/atrium/`,
//! typed into `bevy.ts` like every other binding:
//!
//!   * `liquidGlass` — a backdrop filter: the live 3D world behind the dock,
//!     refracted through a rounded glass bezel (Arcana's shader);
//!   * `condense` (morph) — the HUD's text changes the way the windows form:
//!     out of noise, a cool light along the front.

use bevy::prelude::*;
use bevy_react::filters::FilterColor;
use bevy_react::protocol::units::Length;
use bevy_react::{ReactAppExt, react_filter, react_morph_filter};

/// Packing: `params[0]` = (radius, bezel, refraction, dispersion),
/// `params[1]` = (frost, highlight, -, -), `params[2]` = tint.
///
/// The bezel samples up to `refraction` px beyond the node's edge, so the
/// capture is inflated by `outset`.
#[react_filter(shader = "atrium/glass.wgsl", outset = 28.0)]
struct LiquidGlass {
    /// The node's corner radius, px — keep it equal to `borderRadius`.
    #[serde(default = "default_radius")]
    radius: Length,
    /// Width of the refracting rim, px.
    #[serde(default = "default_bezel")]
    bezel: Length,
    /// How far the rim bends the world, px.
    #[serde(default = "default_refraction")]
    refraction: Length,
    /// Chromatic split of the bend, 0..1.
    #[serde(default = "half")]
    dispersion: f32,
    /// Softens the world seen through the glass, 0..1.
    #[serde(default)]
    frost: f32,
    /// Strength of the lit rim, 0..1.
    #[serde(default = "half")]
    highlight: f32,
    /// Glass tint (alpha = how much).
    #[serde(default = "clear")]
    tint: FilterColor,
}

/// Packing: `params[0]` = edge light (straight linear RGBA).
#[react_morph_filter(shader = "atrium/condense.wgsl")]
struct Condense {
    #[serde(default = "ice")]
    color: FilterColor,
}

fn half() -> f32 {
    0.5
}

fn default_radius() -> Length {
    Length::Px(24.0)
}

fn default_bezel() -> Length {
    Length::Px(18.0)
}

fn default_refraction() -> Length {
    Length::Px(16.0)
}

fn clear() -> FilterColor {
    FilterColor([1.0, 1.0, 1.0, 0.0])
}

fn ice() -> FilterColor {
    FilterColor([0.55, 0.85, 1.0, 1.0])
}

/// Register the filters — in the running app and the exporter alike, so the
/// generated typing matches what resolves at runtime.
pub fn register_bindings(app: &mut App) {
    app.add_react_filter::<LiquidGlass>()
        .add_react_morph_filter::<Condense>();
}
