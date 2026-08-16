//! App-authored custom filters — the full `#[react_filter]` /
//! `#[react_morph_filter]` pipeline exercised from an app crate: macro →
//! registration → codegen (`bevy.ts` types the names + params) → app WGSL
//! that `#import bevy_react::filter` for the binding contract.
//!
//! Two families (separate registries in the generated typing, enforced at
//! resolve time — a morph name in a `filter` chain warns and is skipped,
//! and vice versa):
//!
//!   * The "Custom filters" demo trio (`#[react_filter]` +
//!     `add_react_filter`), one per interesting shape: `ripple` —
//!     time-driven UV distortion (`time = true`: the layer re-renders every
//!     frame with **zero re-captures**); `glitch` — time-driven slice
//!     offsets + RGB split, procedurally seeded; `dissolve` — params-only
//!     alpha threshold; repaints only when `progress` changes.
//!   * The gl-transitions morph pack (`#[react_morph_filter]` +
//!     `add_react_morph_filter`; the "Morph filter" demo's card grid):
//!     single-pass ports of <https://gl-transitions.com/gallery>
//!     transitions, `morphFilter`-only.
//!
//! Shaders live in `examples/assets/shaders/` (plain asset paths — the demos
//! app points `AssetPlugin` at `examples/assets`; the morph pack under
//! `morphs/`). Each shader's header comments its `params[i]` index
//! map (declaration-order packing) and its premultiplied-alpha reasoning.

use bevy::prelude::*;
use bevy_react::filters::FilterColor;
use bevy_react::protocol::units::{Angle, Length};
use bevy_react::{ReactAppExt, react_filter, react_morph_filter};

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

// ---------------------------------------------------------------------------
// gl-transitions morph pack: ports of https://gl-transitions.com/gallery
// transitions, all single-pass (= morph-capable) with user params within the
// 6-vec4 morph cap. Shaders live in
// `examples/assets/shaders/morphs/*.wgsl`; each header carries the
// upstream URL, author, license, packing map, and premultiplied-alpha notes.
// Every shader opens with the endpoint guards from the prelude's identity
// contract (progress <= 0 → exact "from", >= 1 → exact "to").
// ---------------------------------------------------------------------------

fn srgb(r: f32, g: f32, b: f32) -> FilterColor {
    let lin = bevy::color::LinearRgba::from(bevy::color::Srgba::new(r, g, b, 1.0));
    FilterColor([lin.red, lin.green, lin.blue, lin.alpha])
}

fn black() -> FilterColor {
    FilterColor([0.0, 0.0, 0.0, 1.0])
}

/// Vertical blinds: a soft left-to-right sweep sliced into repeating blinds.
#[react_morph_filter(shader = "shaders/morphs/windowslice.wgsl")]
struct Windowslice {
    /// Number of blinds.
    #[serde(default = "default_ten")]
    count: f32,
    /// Soft lead of the sweep, as a fraction of the width.
    #[serde(default = "default_half")]
    smoothness: f32,
}

/// Radial sweep wipe: the edge sweeps a full turn around the center.
#[react_morph_filter(shader = "shaders/morphs/radial.wgsl")]
struct Radial {
    /// Angular width of the soft edge (upstream: 1 radian).
    #[serde(default = "default_radial_smoothness")]
    smoothness: Angle,
}

/// Growing polka dots radiating from `center`.
#[react_morph_filter(shader = "shaders/morphs/polka_dots_curtain.wgsl")]
struct PolkaDotsCurtain {
    /// Dot-grid frequency (cells across the box).
    #[serde(default = "default_twenty")]
    dots: f32,
    /// Radiation origin, in uv space (0..1 per axis).
    #[serde(default)]
    center: Vec2,
}

/// A screen-circular crop shrinks the old image away, then grows the new one
/// back, passing through a full-`color` frame at the midpoint.
#[react_morph_filter(shader = "shaders/morphs/circle_crop.wgsl")]
struct CircleCrop {
    /// Backdrop color outside the circle (upstream `bgcolor`, opaque black
    /// there). Defaults to TRANSPARENT — correct for UI over arbitrary
    /// backdrops; pass "black" for the upstream look.
    #[serde(default)]
    color: FilterColor,
}

/// A soft band opens from the centerline outward (or closes inward with
/// `close`), splitting horizontally or vertically. Merges the upstream
/// HorizontalOpen / HorizontalClose / VerticalOpen family into one filter.
#[react_morph_filter(shader = "shaders/morphs/curtain_open.wgsl")]
struct CurtainOpen {
    /// 0 = horizontal split (band grows along y), 1 = vertical.
    #[serde(default)]
    vertical: f32,
    /// 0 = open (reveal outward), 1 = close (cover inward).
    #[serde(default)]
    close: f32,
}

/// fbm-noise burn wipe with a glowing rim at the front.
#[react_morph_filter(shader = "shaders/morphs/burn.wgsl", name = "burn0")]
struct Burn {
    /// Rim glow color (upstream `burnColor`), as a CSS color.
    #[serde(default = "default_burn_color")]
    color: FilterColor,
}

fn default_ten() -> f32 {
    10.0
}

fn default_twenty() -> f32 {
    20.0
}

fn default_half() -> f32 {
    0.5
}

fn default_radial_smoothness() -> Angle {
    Angle::from_radians(1.0)
}

fn default_burn_color() -> FilterColor {
    srgb(1.0, 0.5, 0.0)
}

/// Tile grid card-flip on a staggered diagonal wave.
#[react_morph_filter(shader = "shaders/morphs/tiles_wave.wgsl")]
struct TilesWave {
    /// Tile count per axis (upstream ivec2 `tileCount`).
    #[serde(default = "default_eight_by_eight")]
    tiles: Vec2,
    /// 1 = fold along x (upstream bool `flipX`).
    #[serde(default = "default_one")]
    flipx: f32,
    /// 1 = fold along y (upstream bool `flipY`).
    #[serde(default)]
    flipy: f32,
}

/// Per-cell randomized card flips behind fading grid dividers.
#[react_morph_filter(shader = "shaders/morphs/grid_flip.wgsl")]
struct GridFlip {
    /// Cells per axis (upstream ivec2).
    #[serde(default = "default_four_by_four")]
    size: Vec2,
    /// Divider fade-in/out fraction of the timeline.
    #[serde(default = "default_pause")]
    pause: f32,
    /// Divider half-width in px (upstream: a fraction of the cell size).
    #[serde(default = "default_divider")]
    divider: Length,
    /// Divider/backdrop color (upstream `bgcolor`), as a CSS color.
    #[serde(default = "black")]
    color: FilterColor,
    /// Per-cell flip-time jitter.
    #[serde(default = "default_randomness")]
    randomness: f32,
}

/// Door halves slide outward with perspective; the new image zooms up from
/// the depths over a faint floor reflection.
#[react_morph_filter(shader = "shaders/morphs/doorway.wgsl")]
struct Doorway {
    /// Floor-reflection strength.
    #[serde(default = "default_two_fifths")]
    reflection: f32,
    /// Door foreshortening.
    #[serde(default = "default_two_fifths")]
    perspective: f32,
    /// Zoom start of the incoming image.
    #[serde(default = "default_three")]
    depth: f32,
}

/// Page flip around the vertical center spine.
#[react_morph_filter(shader = "shaders/morphs/book_flip.wgsl")]
struct BookFlip {}

/// Rotating kaleidoscope folding through wedge reflections, undistorted at
/// both ends.
#[react_morph_filter(shader = "shaders/morphs/power_kaleido.wgsl")]
struct PowerKaleido {
    /// Wedge offset scale (upstream `dist = scale / 10`).
    #[serde(default = "default_two")]
    scale: f32,
    /// Zoom into the kaleido plane.
    #[serde(default = "default_kaleido_z")]
    z: f32,
    /// Rotation speed (radians of spin per unit progress).
    #[serde(default = "default_five")]
    speed: f32,
}

fn default_one() -> f32 {
    1.0
}

fn default_two() -> f32 {
    2.0
}

fn default_three() -> f32 {
    3.0
}

fn default_five() -> f32 {
    5.0
}

fn default_two_fifths() -> f32 {
    0.4
}

fn default_kaleido_z() -> f32 {
    1.5
}

fn default_pause() -> f32 {
    0.1
}

fn default_randomness() -> f32 {
    0.1
}

fn default_divider() -> Length {
    Length::Px(2.0)
}

fn default_eight_by_eight() -> Vec2 {
    Vec2::splat(8.0)
}

fn default_four_by_four() -> Vec2 {
    Vec2::splat(4.0)
}

/// VHS/datamosh glitch: hash-driven bar/slit tears, RGB splits, scanlines,
/// and strobes peaking mid-transition. The pattern re-rolls 30 times over
/// the morph (frame-quantized progress — no wall-clock time).
#[react_morph_filter(shader = "shaders/morphs/strip_datamosh_glitch.wgsl")]
struct StripDatamoshGlitch {
    /// Overall glitch intensity.
    #[serde(default = "default_one")]
    strength: f32,
    /// Horizontal bar density (upstream `horizontalBars`).
    #[serde(default = "default_bars")]
    bars: f32,
    /// Vertical slit density (upstream `verticalSlits`).
    #[serde(default = "default_slits")]
    slits: f32,
    /// Per-row x-tear amplitude, as a fraction of the width.
    #[serde(default = "default_tear")]
    tear: f32,
    /// RGB split offset in px (upstream: a uv fraction).
    #[serde(default = "default_chroma")]
    chroma: Length,
    /// Smear-layer strength.
    #[serde(default = "default_residue")]
    residue: f32,
    /// Cell-noise amount (upstream `noiseAmount`).
    #[serde(default = "default_noise")]
    noise: f32,
    /// Scanline dimming (upstream `scanAmount`).
    #[serde(default = "default_scan")]
    scan: f32,
    /// Strobe strength (upstream `flashAmount`).
    #[serde(default = "default_flash")]
    flash: f32,
}

/// Analog film burn: light flares + a soft radial ring blur over the
/// crossfade, peaking mid-transition. COST: the blur loop takes ~100 texture
/// samples per pixel on every in-flight frame (the upstream's faithful
/// 50-iteration ring) — fine for brief morphs, not a filter to idle on.
#[react_morph_filter(shader = "shaders/morphs/film_burn.wgsl")]
struct FilmBurn {
    /// Flare pattern seed (upstream `Seed`).
    #[serde(default = "default_seed")]
    seed: f32,
}

/// Page curl around a moving diagonal cylinder, with a grayscale backside
/// and cast shadows (the classic HP/webvfx page-curl, BSD-3 — the shader
/// header retains the license block).
#[react_morph_filter(shader = "shaders/morphs/inverted_page_curl.wgsl")]
struct InvertedPageCurl {}

fn default_bars() -> f32 {
    42.0
}

fn default_slits() -> f32 {
    18.0
}

fn default_tear() -> f32 {
    0.18
}

fn default_chroma() -> Length {
    Length::Px(6.0)
}

fn default_residue() -> f32 {
    0.62
}

fn default_noise() -> f32 {
    0.16
}

fn default_scan() -> f32 {
    0.13
}

fn default_flash() -> f32 {
    0.2
}

fn default_seed() -> f32 {
    2.31
}

/// Dust transition: a ragged dissolve front sweeps across the content; at
/// the front the old image shatters into wind-borne dust grains that swirl
/// away and fade, while the new image condenses out of incoming dust and
/// settles into place.
#[react_morph_filter(shader = "shaders/morphs/dustify.wgsl")]
struct Dustify {
    /// Sweep direction of the dissolve front, clockwise from +X in screen
    /// space (y down): 0 = left-to-right, 90 = top-to-bottom. Wire numbers
    /// are degrees (same convention as the built-in `linearWipe`).
    #[serde(default)]
    direction: Angle,
    /// Width of the transition band, in px — how long a stretch of content
    /// is airborne at once. 0 degrades to a hard granular edge (no flight).
    #[serde(default = "default_dustify_softness")]
    softness: Length,
    /// 0..=1: turbulent swirl of the dust in flight (perpendicular sway +
    /// speed wobble). 0 flies every grain straight downwind.
    #[serde(default = "default_dustify_turbulence")]
    turbulence: f32,
    /// Direction the dust flies, RELATIVE to `direction` (degrees on the
    /// wire; 0 = downwind with the sweep — the default; 90 blows sideways).
    #[serde(default)]
    wind: Angle,
    /// How far a grain travels before it has fully faded, in px.
    #[serde(default = "default_dustify_drift")]
    drift: Length,
    /// Dust particle size in px — the cell size the content shatters into.
    /// Small = fine sand, large = chunky flakes.
    #[serde(default = "default_dustify_grain")]
    grain: Length,
    /// Strength of the fbm noise warping the dissolve front: 0 keeps the
    /// front a clean straight sweep line, ~1 a gently ragged contour, and
    /// larger values tear it into deep noise islands.
    #[serde(default = "default_dustify_raggedness")]
    raggedness: f32,
    /// How much the front's noise pattern churns as the transition
    /// progresses: 0 = a static ragged contour that just sweeps with
    /// `direction`; ~1 scrolls the noise by one feature length over the
    /// whole morph, boiling the front as it advances.
    #[serde(default)]
    evolution: f32,
}

fn default_dustify_softness() -> Length {
    Length::Px(90.0)
}

fn default_dustify_turbulence() -> f32 {
    0.6
}

fn default_dustify_drift() -> Length {
    Length::Px(120.0)
}

fn default_dustify_grain() -> Length {
    Length::Px(7.0)
}

fn default_dustify_raggedness() -> f32 {
    0.6
}

/// Register the custom filters. Called from **both** paths — the live app
/// (`build_app`, after `ReactUiPlugin` so a custom name could never be
/// clobbered by the plugin's built-in registration) and the
/// `--export-bindings` exporter (`register_react_bindings`), so the generated
/// TypeScript always matches what the runtime resolves.
pub fn register_bindings(app: &mut App) {
    app.add_react_filter::<Ripple>()
        .add_react_filter::<Glitch>()
        .add_react_filter::<Dissolve>()
        .add_react_morph_filter::<Windowslice>()
        .add_react_morph_filter::<Radial>()
        .add_react_morph_filter::<PolkaDotsCurtain>()
        .add_react_morph_filter::<CircleCrop>()
        .add_react_morph_filter::<CurtainOpen>()
        .add_react_morph_filter::<Burn>()
        .add_react_morph_filter::<TilesWave>()
        .add_react_morph_filter::<GridFlip>()
        .add_react_morph_filter::<Doorway>()
        .add_react_morph_filter::<BookFlip>()
        .add_react_morph_filter::<PowerKaleido>()
        .add_react_morph_filter::<StripDatamoshGlitch>()
        .add_react_morph_filter::<FilmBurn>()
        .add_react_morph_filter::<InvertedPageCurl>()
        .add_react_morph_filter::<Dustify>();
}
