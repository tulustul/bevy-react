//! The showcase's own WGSL effects: three filters and a morph, each a params
//! struct + a shader under `examples/assets/arcana/`, typed into `bevy.ts` by
//! the same codegen as every other binding. They run over React-rendered
//! pixels — something no web stack lets a component do.
//!
//!   * `holo` — foil: an iridescent rainbow that slides with the card's
//!     tilt, glitter that twinkles, a specular sweep. Time-driven: the pass
//!     re-runs every frame over the card's capture.
//!   * `liquidGlass` — a backdrop filter: refracts the live 3D world behind
//!     the node through a rounded glass bezel, with chromatic dispersion and
//!     a lit rim.
//!   * `burn` — the pack burning open from the cut, an ember front eating
//!     the wrapper (`progress` 0 → 1).
//!   * `veil` (morph) — the screen change between the table and the
//!     grimoire: a smoky golden-edged wipe out of the middle.
//!
//! Each shader's header documents its `params[i]` packing.

use bevy::prelude::*;
use bevy_react::filters::FilterColor;
use bevy_react::protocol::units::Length;
use bevy_react::{ReactAppExt, react_filter, react_morph_filter};

/// Packing: `params[0]` = (angle, strength, saturation, glitter),
/// `params[1].x` = drift.
#[react_filter(shader = "arcana/holo.wgsl", time = true)]
struct Holo {
    /// Slides the rainbow, degrees — bind it to the card's tilt.
    #[serde(default)]
    angle: f32,
    /// How much foil, 0..1.
    #[serde(default = "one")]
    strength: f32,
    /// 1 = full spectrum, 0 = a white-gold sheen.
    #[serde(default = "one")]
    saturation: f32,
    /// Glitter amount, 0..1.
    #[serde(default = "half")]
    glitter: f32,
    /// Rainbow scroll on its own, bands per second (the prismatic shimmer).
    #[serde(default)]
    drift: f32,
}

/// Packing: `params[0]` = (radius, bezel, refraction, dispersion),
/// `params[1]` = (frost, highlight, -, -), `params[2]` = tint.
///
/// The bezel samples up to `refraction` px beyond the node's edge, so the
/// capture is inflated by `outset` (sized for the showcase's strongest glass).
#[react_filter(shader = "arcana/glass.wgsl", outset = 28.0)]
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

/// Packing: `params[0].x` = progress.
#[react_filter(shader = "arcana/burn.wgsl")]
struct Burn {
    /// 0 = intact, 1 = burnt away.
    #[serde(default)]
    progress: f32,
}

/// Packing: `params[0]` = edge color (straight linear RGBA).
#[react_morph_filter(shader = "arcana/veil.wgsl")]
struct Veil {
    #[serde(default = "gold")]
    color: FilterColor,
}

fn one() -> f32 {
    1.0
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

fn gold() -> FilterColor {
    FilterColor([1.0, 0.6, 0.18, 1.0])
}

/// Register the filters — in the running app and the exporter alike, so the
/// generated typing matches what resolves at runtime.
pub fn register_bindings(app: &mut App) {
    app.add_react_filter::<Holo>()
        .add_react_filter::<LiquidGlass>()
        .add_react_filter::<Burn>()
        .add_react_morph_filter::<Veil>();
}
