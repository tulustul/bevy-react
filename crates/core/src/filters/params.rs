//! Param packing and interpolation: where a filter's named params land in the
//! packed `Vec4` uniform array ([`ParamSlot`]), the caps guarding the packing
//! and the chain outset, the param value types with wire-level decode rules
//! ([`FilterColor`], [`length_logical_px`]), and the layout-aware
//! interpolation primitives ([`lerp_packed_params`], [`lerp_angle`]) the
//! easing paths blend packed arrays with.

use bevy::math::Vec4;
use serde::{Deserialize, Deserializer};

use crate::animations::ValueKind;
use crate::protocol::Length;

/// Cap on the packed `Vec4` array per pass — the fixed-size uniform array the
/// filter shaders declare.
pub const MAX_FILTER_PARAM_VECS: usize = 8;

/// Defensive cap on a chain's summed outset, physical px per side. Far beyond
/// any sane blur (quality is bounded well before this — see `blur.wgsl`'s
/// MAX_HALF note), it bounds the inflation math: `2 * outset` adds at most
/// 2048 texels to the capture, leaving real headroom under wgpu's default
/// 8192 `max_texture_dimension_2d` for the content itself. (Texture-limit
/// safety proper is the allocator's concern, not this cap's.)
pub const MAX_FILTER_OUTSET_PX: u32 = 1024;

/// Where one named parameter lands in a pass's packed `Vec4` array: `vec` is
/// the `Vec4` index, `comp` the starting component within it, `len` how many
/// consecutive components the param spans.
///
/// Multi-component params reuse [`ValueKind::Scalar`] with `len > 1` (one
/// slot spanning `len` components) — there is no dedicated vector kind, since
/// no param needs per-component semantics and interpolation is component-wise
/// anyway.
///
/// **No-straddle rule:** a slot never crosses a `Vec4` boundary —
/// `comp + len <= 4`, always. Packers (the built-ins' hand layouts and
/// `#[react_filter]`'s generated contiguous fill) pad a multi-component param
/// that would straddle up to component 0 of the *next* `Vec4`, leaving the
/// skipped components zero. The chain resolver's physical-px rewrite relies
/// on this when it clamps a slot's component range at 4.
///
/// **Length contract:** a slot with `kind == ValueKind::Length` holds the
/// param's *logical*-px value as produced by
/// [`ReactFilter::pack`](crate::filters::ReactFilter::pack); the chain
/// resolve system ([`resolve_filter_chains`](crate::filters::resolve_filter_chains))
/// rewrites those components to physical px using this layout metadata before
/// upload. Every other kind packs in its final unit (scalars as-is, angles in
/// radians).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ParamSlot {
    pub name: &'static str,
    pub kind: ValueKind,
    pub vec: usize,
    pub comp: usize,
    pub len: usize,
}

/// The shared, lazily-built `Arc<[ParamSlot]>` layout of a hand-written
/// built-in's `pack`: one static per call site, cloned on use (the
/// `#[react_filter]` macro generates the equivalent for custom filters).
macro_rules! static_layout {
    ($($slot:expr),+ $(,)?) => {{
        static LAYOUT: ::std::sync::LazyLock<
            ::std::sync::Arc<[crate::filters::ParamSlot]>,
        > = ::std::sync::LazyLock::new(|| ::std::sync::Arc::from(vec![$($slot),+]));
        ::std::sync::Arc::clone(&LAYOUT)
    }};
}
pub(crate) use static_layout;

pub(super) fn check_param_cap(name: &str, vecs: usize) -> Result<(), String> {
    if vecs > MAX_FILTER_PARAM_VECS {
        return Err(format!(
            "filter {name:?} packs {vecs} param vec4s, over the cap of {MAX_FILTER_PARAM_VECS}"
        ));
    }
    Ok(())
}

/// A [`Length`] filter param's logical-px value. Only `Px` has a fixed
/// logical size here — percent/viewport units have no basis for a filter
/// param — so any other unit is rejected with a message naming it, instead of
/// silently resolving to `0.0`. Bare wire numbers decode as `Px` and stay
/// accepted.
///
/// `pub` because `#[react_filter]`-generated `pack`/`outset`/`resolve` code
/// calls it from consumer crates (blur shares it in-crate).
pub fn length_logical_px(filter: &str, param: &str, len: Length) -> Result<f32, String> {
    let unit = match len {
        Length::Px(px) => return Ok(px),
        Length::Auto => "auto",
        Length::Percent(_) => "%",
        Length::Vw(_) => "vw",
        Length::Vh(_) => "vh",
        Length::VMin(_) => "vmin",
        Length::VMax(_) => "vmax",
    };
    Err(format!(
        "filter {filter:?} {param} must be in px (a bare number or \"px\"), got a {unit:?} length"
    ))
}

/// A color filter parameter: **linear** (shader-ready) straight-alpha RGBA.
///
/// Deserializes from a CSS color string — any form
/// [`crate::canvas::parse_css_color`] accepts (hex, named colors,
/// `rgb()`/`hsl()`/`oklch()`/…) — converted sRGB → linear on decode, so
/// [`ReactFilter::pack`](crate::filters::ReactFilter::pack) copies the four
/// components into a `Vec4` slot untouched. `Default` is transparent black
/// (`[0.0; 4]`).
///
/// Unlike the style layer's warn-and-magenta fallback (a whole `Style` must
/// never fail to decode), filter params are strict — `deny_unknown_fields`
/// already hard-errors — so an unparsable color is a hard `Err`: the
/// registry's resolve path skips the filter entry with a `filterParams`
/// warning, exactly like blur's non-px radius.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct FilterColor(pub [f32; 4]);

impl<'de> Deserialize<'de> for FilterColor {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        let s = String::deserialize(d)?;
        let srgba = crate::canvas::parse_css_color(&s)
            .ok_or_else(|| serde::de::Error::custom(format!("invalid color {s:?}")))?;
        let lin = bevy::color::LinearRgba::from(srgba);
        Ok(Self([lin.red, lin.green, lin.blue, lin.alpha]))
    }
}

/// ts-rs surface: a `FilterColor` is a CSS color **string** on the wire
/// (mirroring the primitive impls — it inlines, it does not declare).
impl ::ts_rs::TS for FilterColor {
    type WithoutGenerics = Self;
    fn name() -> String {
        "string".to_owned()
    }
    fn inline() -> String {
        Self::name()
    }
    fn inline_flattened() -> String {
        panic!("FilterColor cannot be flattened")
    }
    fn decl() -> String {
        panic!("FilterColor cannot be declared")
    }
    fn decl_concrete() -> String {
        panic!("FilterColor cannot be declared")
    }
}

/// Shortest-arc interpolation between two angles in **radians**, for packed
/// [`ValueKind::Angle`] filter params.
///
/// Filter-owned on purpose (not a [`crate::animations::Lerp`] impl): the
/// style `rotate` transition deliberately animates its angle as a bare scalar
/// (720° → 0° unwinds through two full turns), so shortest-arc must not leak
/// into the general lerp primitives. Packed angle params feed periodic shader
/// math (hue rotation), where only the angle mod 2π matters and the short way
/// around the circle is the right path.
///
/// `t == 0.0` returns `a` and `t == 1.0` returns `b` **bit-exactly** (the
/// `t == 1.0` branch is load-bearing: the wrapped formula would land on `b`'s
/// angle only mod 2π). In between the result is `a + wrap(b - a) * t`, with
/// `wrap` folding the difference into `(-π, π]` — so for `t ∈ (0, 1)` the
/// result lands within π of `a`, is NOT normalized to any canonical range,
/// and is consumed directly as radians. Exactly-opposite angles take the
/// positive (counter-clockwise) arc. `t` outside `0..=1` extrapolates along
/// the same arc.
pub fn lerp_angle(a: f32, b: f32, t: f32) -> f32 {
    use std::f32::consts::{PI, TAU};
    if t == 0.0 {
        return a;
    }
    if t == 1.0 {
        return b;
    }
    // `rem_euclid` puts the difference in `[0, TAU)`; folding the upper half
    // down yields the signed shortest arc in `(-PI, PI]`.
    let mut delta = (b - a).rem_euclid(TAU);
    if delta > PI {
        delta -= TAU;
    }
    a + delta * t
}

/// Interpolate two packed param arrays of the **same layout**, slot-by-slot:
/// the layout (not the raw components) decides how each param blends.
///
/// - [`ValueKind::Scalar`] / [`ValueKind::Length`] / [`ValueKind::Color`]
///   slots lerp component-wise in the packed space. For colors that is
///   **linear-space** interpolation — filter color params are packed linear
///   RGBA (see [`FilterColor`]), shader-ready; converting to sRGB to
///   interpolate would both diverge from what the shader sees and hand the
///   GPU values it doesn't consume. (The style layer's `[f32; 4]`
///   [`crate::animations::Lerp`] doc says sRGB component-wise — that applies
///   to *style* colors, which live in sRGB; do not conflate the two spaces.)
/// - [`ValueKind::Angle`] slots take the shortest arc via [`lerp_angle`].
///
/// Components no slot covers (no-straddle padding — zero by the packing
/// contract) copy from `b`, so padding is stable rather than blended; the
/// choice is unobservable for contract-abiding packers. `t == 0.0` / `t == 1.0`
/// return `a` / `b` bit-exactly (whole array, padding included); other `t`
/// use the plain `a + (b - a) * t` form, so out-of-range `t` extrapolates.
///
/// The caller guarantees `a`/`b` came from the same layout; a length mismatch
/// is a bug upstream (`debug_assert`ed) and defensively returns `b.to_vec()`
/// in release. Slot indices out of the arrays' bounds are skipped, like the
/// resolver's physical-px rewrite.
pub fn lerp_packed_params(a: &[Vec4], b: &[Vec4], t: f32, layout: &[ParamSlot]) -> Vec<Vec4> {
    debug_assert_eq!(
        a.len(),
        b.len(),
        "lerp_packed_params: a/b length mismatch (the caller guarantees one shared layout)"
    );
    if a.len() != b.len() {
        return b.to_vec();
    }
    if t == 0.0 {
        return a.to_vec();
    }
    if t == 1.0 {
        return b.to_vec();
    }
    // Padding policy: start from `b`, overwrite the slot-covered components.
    let mut out = b.to_vec();
    for slot in layout {
        let Some((av, bv)) = a.get(slot.vec).zip(b.get(slot.vec)) else {
            continue;
        };
        for comp in slot.comp..(slot.comp + slot.len).min(4) {
            out[slot.vec][comp] = match slot.kind {
                ValueKind::Angle => lerp_angle(av[comp], bv[comp], t),
                _ => av[comp] + (bv[comp] - av[comp]) * t,
            };
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use std::f32::consts::PI;

    use serde_json::json;

    use super::*;

    /// When the endpoints are within half a circle of each other, the
    /// shortest arc IS the straight line — plain lerp, ascending or
    /// descending.
    #[test]
    fn lerp_angle_within_half_circle_matches_plain_lerp() {
        let (a, b) = (0.2f32, 1.7f32); // 1.5 rad apart, well under PI
        for t in [0.25f32, 0.5, 0.75] {
            let plain = a + (b - a) * t;
            assert!(
                (lerp_angle(a, b, t) - plain).abs() < 1e-6,
                "t={t}: {} vs {plain}",
                lerp_angle(a, b, t)
            );
        }
        // Descending across zero (not the seam): still plain.
        assert!((lerp_angle(1.0, -1.0, 0.5)).abs() < 1e-6);
    }

    /// 170° to -170° is 20° of travel through the ±π seam — the midpoint is
    /// ±180°, NOT 0° (the long way's midpoint).
    #[test]
    fn lerp_angle_crosses_seam_the_short_way() {
        let a = 170f32.to_radians();
        let b = (-170f32).to_radians();
        let mid = lerp_angle(a, b, 0.5);
        assert!((mid.abs() - PI).abs() < 1e-5, "mid = {mid}");
        // A quarter of the way is 175°, still on `a`'s side of the seam.
        assert!((lerp_angle(a, b, 0.25) - 175f32.to_radians()).abs() < 1e-5);
        // And the seam-free direction check: it never goes near 0.
        assert!(mid.abs() > 3.0);
    }

    /// `t == 0` / `t == 1` return the endpoints bit-exactly, including
    /// across the seam where the wrapped formula alone would only land on
    /// `b`'s angle mod 2π.
    #[test]
    fn lerp_angle_endpoints_exact() {
        let a = 0.1f32 + 0.7f32; // awkward: not exactly 0.8
        let b = -3.041_7f32;
        assert_eq!(lerp_angle(a, b, 0.0), a);
        assert_eq!(lerp_angle(a, b, 1.0), b);
        let (sa, sb) = (170f32.to_radians(), (-170f32).to_radians());
        assert_eq!(lerp_angle(sa, sb, 0.0), sa);
        assert_eq!(lerp_angle(sa, sb, 1.0), sb);
    }

    /// Reversing the endpoints mirrors the path: `lerp_angle(a, b, t)` and
    /// `lerp_angle(b, a, 1 - t)` are the same angle mod 2π (the raw values
    /// may differ by a turn — the seam midpoint lands on +π one way and -π
    /// the other).
    #[test]
    fn lerp_angle_symmetric_in_its_arguments() {
        use std::f32::consts::TAU;
        let cases = [
            (0.4f32, 2.9f32),
            (170f32.to_radians(), (-170f32).to_radians()),
            (-0.3f32, 0.9f32),
        ];
        for (a, b) in cases {
            for t in [0.25f32, 0.5, 0.75] {
                let fwd = lerp_angle(a, b, t);
                let rev = lerp_angle(b, a, 1.0 - t);
                let diff = (fwd - rev).rem_euclid(TAU);
                let dist = diff.min(TAU - diff);
                assert!(dist < 1e-5, "a={a} b={b} t={t}: {fwd} vs {rev}");
            }
        }
    }

    /// A two-slot layout (scalar + angle in one vec4) blends each slot per
    /// its kind: the scalar takes the straight line, the angle the shortest
    /// arc through the seam.
    #[test]
    fn lerp_packed_params_lerps_each_slot_by_kind() {
        let layout = [
            ParamSlot {
                name: "amount",
                kind: ValueKind::Scalar,
                vec: 0,
                comp: 0,
                len: 1,
            },
            ParamSlot {
                name: "angle",
                kind: ValueKind::Angle,
                vec: 0,
                comp: 1,
                len: 1,
            },
        ];
        let a = [Vec4::new(0.0, 170f32.to_radians(), 0.0, 0.0)];
        let b = [Vec4::new(10.0, (-170f32).to_radians(), 0.0, 0.0)];
        let out = lerp_packed_params(&a, &b, 0.5, &layout);
        assert_eq!(out.len(), 1);
        assert_eq!(out[0].x, 5.0);
        // Through the seam (±π), not through 0 as a raw component lerp
        // would give.
        assert!((out[0].y.abs() - PI).abs() < 1e-5, "angle = {}", out[0].y);
    }

    /// A color slot interpolates in the packed — LINEAR — space: the
    /// midpoint of linear 0.0 and linear 1.0 is 0.5. An sRGB-space
    /// interpolation converted back to linear would give ≈0.214; asserting
    /// 0.5 pins the linear-space contract (packed colors are shader-ready
    /// linear RGBA, per `FilterColor`).
    #[test]
    fn lerp_packed_params_color_slot_interpolates_linearly() {
        let layout = [ParamSlot {
            name: "color",
            kind: ValueKind::Color,
            vec: 0,
            comp: 0,
            len: 4,
        }];
        let a = [Vec4::new(0.0, 0.0, 0.0, 1.0)];
        let b = [Vec4::new(1.0, 1.0, 1.0, 1.0)];
        let mid = lerp_packed_params(&a, &b, 0.5, &layout)[0];
        assert_eq!(mid, Vec4::new(0.5, 0.5, 0.5, 1.0));
        assert!((mid.x - 0.214).abs() > 0.2, "must not be the sRGB midpoint");
    }

    /// A `Length` slot lerps its (logical-px) component like a scalar.
    #[test]
    fn lerp_packed_params_length_slot_lerps() {
        let layout = [ParamSlot {
            name: "radius",
            kind: ValueKind::Length,
            vec: 0,
            comp: 0,
            len: 1,
        }];
        // Blur-shaped packing: radius in comp 0, direction in comps 1-2.
        let a = [Vec4::new(4.0, 1.0, 0.0, 0.0)];
        let b = [Vec4::new(8.0, 1.0, 0.0, 0.0)];
        assert_eq!(lerp_packed_params(&a, &b, 0.25, &layout)[0].x, 5.0);
    }

    /// Components no slot covers copy from `b` untouched — stable, never
    /// blended (they are zero by the packing contract; the test plants
    /// nonzero values to observe the copy).
    #[test]
    fn lerp_packed_params_padding_copies_from_b() {
        let layout = [ParamSlot {
            name: "amount",
            kind: ValueKind::Scalar,
            vec: 0,
            comp: 0,
            len: 1,
        }];
        let a = [Vec4::new(0.0, 111.0, 0.0, 0.0), Vec4::splat(5.0)];
        let b = [Vec4::new(2.0, 222.0, 0.0, 0.0), Vec4::splat(7.0)];
        let out = lerp_packed_params(&a, &b, 0.5, &layout);
        assert_eq!(out[0], Vec4::new(1.0, 222.0, 0.0, 0.0));
        assert_eq!(out[1], Vec4::splat(7.0));
    }

    /// `t == 0` / `t == 1` return `a` / `b` bit-exactly — awkward values
    /// where `a + (b - a) * t` would NOT reproduce `b` at `t = 1`.
    #[test]
    fn lerp_packed_params_endpoints_exact() {
        let layout = [ParamSlot {
            name: "stuff",
            kind: ValueKind::Scalar,
            vec: 0,
            comp: 0,
            len: 4,
        }];
        let a = [Vec4::new(0.1f32 + 0.7f32, 1e-7, -3.333_333_3, 0.3)];
        let b = [Vec4::new(0.2f32 + 0.1f32, 123_456.79, 2.718_281_7, -0.1)];
        assert_eq!(lerp_packed_params(&a, &b, 0.0, &layout), a.to_vec());
        assert_eq!(lerp_packed_params(&a, &b, 1.0, &layout), b.to_vec());
    }

    /// Debug builds assert the shared-layout contract on mismatched lengths.
    #[cfg(debug_assertions)]
    #[test]
    #[should_panic(expected = "length mismatch")]
    fn lerp_packed_params_mismatched_lengths_asserts_in_debug() {
        let _ = lerp_packed_params(&[Vec4::ZERO], &[], 0.5, &[]);
    }

    /// Release builds take the defensive path: mismatched lengths return
    /// `b` wholesale.
    #[cfg(not(debug_assertions))]
    #[test]
    fn lerp_packed_params_mismatched_lengths_returns_b() {
        let b = [Vec4::splat(3.0)];
        assert_eq!(lerp_packed_params(&[], &b, 0.5, &[]), b.to_vec());
    }

    fn from<T: serde::de::DeserializeOwned>(value: serde_json::Value) -> T {
        serde_json::from_value(value).expect("params decode")
    }

    /// `FilterColor` reuses the style layer's CSS color parser and stores
    /// linear (shader-ready) RGBA.
    #[test]
    fn filter_color_parses_css_strings_to_linear_rgba() {
        let c: FilterColor = from(json!("#ff0000"));
        assert_eq!(c.0, [1.0, 0.0, 0.0, 1.0]);
        let c: FilterColor = from(json!("rgb(255 0 0)"));
        assert_eq!(c.0, [1.0, 0.0, 0.0, 1.0]);
        // Linear, not sRGB: mid-gray #808080 is ~0.216 linear, not 0.502 —
        // the sRGB → linear conversion happens at decode.
        let c: FilterColor = from(json!("#808080"));
        assert!((c.0[0] - 0.2158).abs() < 1e-3, "linear gray: {:?}", c.0);
        assert_eq!(c.0[3], 1.0);
    }

    /// Garbage is a hard `Err` — unlike style colors' warn-and-magenta (a
    /// whole `Style` must never fail to decode), a typed filter param is
    /// strict, so the registry path skips the entry with a `filterParams`
    /// warning, like blur's non-px radius.
    #[test]
    fn filter_color_garbage_is_a_hard_error() {
        assert!(serde_json::from_value::<FilterColor>(json!("notacolor")).is_err());
        assert!(serde_json::from_value::<FilterColor>(json!(42)).is_err());
    }
}
