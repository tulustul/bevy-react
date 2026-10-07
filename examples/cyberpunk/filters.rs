//! The front end's own WGSL effects, each a params struct + a shader under
//! `examples/assets/cyberpunk/`, typed into `bevy.ts` by the same codegen as
//! every other binding. They run over React-rendered pixels.
//!
//!   * `glitch` — the signal breaking up: torn slices, split channels,
//!     dropped bands. Time-driven; with `frequency` it strikes only in random
//!     bursts (the idle wordmark, a hovered menu item).
//!   * `grain` — film grain over the 3D world: an empty full-screen node
//!     whose pass writes fresh noise every frame.
//!   * `glitchSwap` (morph) — every screen change: bands of the old screen
//!     flip to the new one at staggered moments, splitting and tearing most
//!     at the midpoint.
//!
//! Each shader's header documents its `params[i]` packing.

use bevy::prelude::*;
use bevy_react::filters::FilterColor;
use bevy_react::protocol::units::Length;
use bevy_react::{ReactAppExt, react_filter, react_morph_filter};

/// Packing: `params[0]` = (intensity, frequency, split, tear),
/// `params[1].x` = seed.
///
/// Tears move slices up to `tear` px sideways, so the capture is inflated by
/// `outset` (keep `tear` within it).
#[react_filter(shader = "cyberpunk/glitch.wgsl", time = true, outset = 32.0)]
struct Glitch {
    /// How broken the signal is, 0..1.
    #[serde(default = "one")]
    intensity: f32,
    /// 0 = glitching all the time; above 0, the chance a quarter second
    /// glitches (bursts).
    #[serde(default)]
    frequency: f32,
    /// How far the channels split at full intensity, px.
    #[serde(default = "default_split")]
    split: Length,
    /// How far a torn slice moves at full intensity, px (≤ 32).
    #[serde(default = "default_tear")]
    tear: Length,
    /// Decorrelates glitches that run side by side.
    #[serde(default)]
    seed: f32,
}

/// Packing: `params[0].x` = amount.
///
/// Sits on an empty full-screen node under the menus: the pass writes noise
/// over the 3D world (the graphics settings' Film Grain).
#[react_filter(shader = "cyberpunk/grain.wgsl", time = true)]
struct Grain {
    /// How strong the strongest grains are, 0..1.
    #[serde(default = "default_grain")]
    amount: f32,
}

/// Packing: `params[0].x` = split, `params[1]` = tint (straight linear RGBA).
#[react_morph_filter(shader = "cyberpunk/glitch_swap.wgsl")]
struct GlitchSwap {
    /// How far the channels split at the midpoint, px.
    #[serde(default = "default_swap_split")]
    split: Length,
    /// The color of the flashing bands (alpha = how strong).
    #[serde(default = "cyan")]
    tint: FilterColor,
}

fn one() -> f32 {
    1.0
}

fn default_split() -> Length {
    Length::Px(4.0)
}

fn default_tear() -> Length {
    Length::Px(24.0)
}

fn default_grain() -> f32 {
    0.12
}

fn default_swap_split() -> Length {
    Length::Px(10.0)
}

fn cyan() -> FilterColor {
    FilterColor([0.37, 0.96, 1.0, 0.5])
}

/// Register the filters — in the running app and the exporter alike, so the
/// generated typing matches what resolves at runtime.
pub fn register_bindings(app: &mut App) {
    app.add_react_filter::<Glitch>()
        .add_react_filter::<Grain>()
        .add_react_morph_filter::<GlitchSwap>();
}
