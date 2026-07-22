//! App-authored custom filters for the "Custom filters" demo — the full
//! `#[react_filter]` pipeline exercised from an app crate: macro → registration
//! → codegen (`bevy.ts` types the names + params) → app WGSL that
//! `#import bevy_react::filter` for the binding contract.
//!
//! Three filters, one per interesting shape:
//!
//!   * `ripple`   — time-driven UV distortion (`time = true`: the layer
//!     re-renders every frame with **zero re-captures**).
//!   * `glitch`   — time-driven slice offsets + RGB split, procedurally seeded.
//!   * `dissolve` — params-only alpha threshold; repaints only when `progress`
//!     changes.
//!
//! Shaders live in `examples/assets/shaders/{ripple,glitch,dissolve}.wgsl`
//! (plain asset paths — the demos app points `AssetPlugin` at
//! `examples/assets`). Each shader's header comments its `params[i]` index map
//! (declaration-order packing) and its premultiplied-alpha reasoning.

use bevy::prelude::*;
use bevy_react::{ReactAppExt, react_filter};

/// Radial ripple emanating from the layer's center, driven by `uniforms.time`.
///
/// Packing (declaration order): `params[0].x` amplitude, `params[0].y`
/// frequency, `params[0].z` speed.
///
/// The ripple displaces sampling by up to `amplitude` px, so content can bleed
/// outside the node's rect. `outset` is a macro-literal constant (it cannot
/// derive from params — that would take a hand-written `ReactFilter` impl), so
/// it is sized to cover the demo slider's max (12 px); cranking `amplitude`
/// past it would clip the ripple at the layer edge.
#[react_filter(shader = "shaders/ripple.wgsl", outset = 12.0, time = true)]
struct Ripple {
    /// Peak displacement, in px.
    #[serde(default = "default_ripple_amplitude")]
    amplitude: f32,
    /// Wave phase across the layer's half-diagonal, in radians (~2 rings at 12).
    #[serde(default = "default_ripple_frequency")]
    frequency: f32,
    /// Wave cycles per second.
    #[serde(default = "default_ripple_speed")]
    speed: f32,
}

fn default_ripple_amplitude() -> f32 {
    4.0
}

fn default_ripple_frequency() -> f32 {
    12.0
}

fn default_ripple_speed() -> f32 {
    1.0
}

/// Broken-signal look: time-seeded horizontal slice offsets + RGB channel
/// split. Fully procedural (hash of slice row × time) — no noise textures.
///
/// Packing: `params[0].x` intensity.
#[react_filter(shader = "shaders/glitch.wgsl", time = true)]
struct Glitch {
    /// Overall strength, 0 (clean) ..= 1 (heavily corrupted).
    #[serde(default = "default_glitch_intensity")]
    intensity: f32,
}

fn default_glitch_intensity() -> f32 {
    0.5
}

/// Burn-away dissolve: texels whose procedural value noise falls below
/// `progress` become fully transparent, with a thin ember edge at the
/// threshold. Not time-driven — the layer repaints only on a params change.
///
/// Packing: `params[0].x` progress.
#[react_filter(shader = "shaders/dissolve.wgsl")]
struct Dissolve {
    /// 0 = intact, 1 = fully dissolved.
    #[serde(default)]
    progress: f32,
}

/// Register the three custom filters. Called from **both** paths — the live
/// app (`build_app`, after `ReactUiPlugin` so a custom name could never be
/// clobbered by the plugin's built-in registration) and the
/// `--export-bindings` exporter (`register_react_bindings`), so the generated
/// TypeScript always matches what the runtime resolves.
pub fn register_bindings(app: &mut App) {
    app.add_react_filter::<Ripple>()
        .add_react_filter::<Glitch>()
        .add_react_filter::<Dissolve>();
}
