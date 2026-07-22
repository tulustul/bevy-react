//! Filter wire types, built-in filters, and the filter registry: the
//! layer-based `filter` style chain.
//!
//! This module owns the filter wire format and registry the way
//! [`crate::canvas`]/[`crate::animations`] own theirs: `protocol`/
//! `reconcile`/`ui_map` reference these types by module path, never the
//! reverse. On the wire a filter is one `{"name", "params"}` object or an
//! ordered array of them; `params` stays an untyped JSON map at this layer —
//! typed validation happens later against the registry, not during decode.
//!
//! Decoding follows the protocol's warn-don't-abort convention (see
//! [`Length`](crate::protocol::Length)'s custom `Deserialize`): a malformed
//! value emits a `decode_warn` and the whole chain degrades to empty, never
//! failing the containing `Style`'s deserialization.
//!
//! The typed layer below the wire — [`ReactFilter`], the built-in param
//! structs, and [`FilterRegistry`] — turns a [`FilterUse`] into
//! [`ResolvedFilterPass`]es: deserialize the raw params (strict:
//! deny-unknown-fields), pack them into a `Vec4` uniform array with a
//! [`ParamSlot`] layout (no-straddle rule: a slot never crosses a `Vec4`
//! boundary), and pick the pass shader. The eight built-ins register via
//! [`register_builtin_filters`]; custom filters are `#[react_filter]` structs
//! registered with `add_react_filter`.
//!
//! The module also owns the runtime write path of a chain.
//! [`resolve_filter_chains`] turns a promoted root's [`FilterInput`] into a
//! [`ResolvedFilterChain`] component — resolving each entry against the
//! registry (invalid entries skip with a `filterParams` warning), rewriting
//! `Length` slots to physical px, stamping [`ResolvedFilterPass::wire_index`],
//! and summing the chain outset. The interpolation primitives
//! ([`lerp_packed_params`], [`lerp_angle`]) blend packed param arrays
//! layout-aware for the easing paths. Exactly three systems write
//! [`ResolvedFilterChain`] and bump its `version` counter: the resolver's
//! snap, the transition filter channel's whole-value ease (`transition.rs`,
//! planned by `plan_filter_ease` with identity-padding for chain
//! extensions), and the animation per-param `filter[<i>].<param>` bindings
//! (`animations`) — see [`ResolvedFilterChain::version`] for the writer
//! registry and precedence.

use std::any::TypeId;
use std::collections::HashMap;
use std::sync::{Arc, LazyLock};

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use bevy::ui::ComputedNode;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Deserializer};
use serde_json::{Map, Value};
use ts_rs::TS;

use crate::animations::ValueKind;
use crate::layer::{LayerContentDirt, PromotedLayer};
use crate::protocol::{Angle, Length};
use crate::registry::{NamedEntry, register_entry};
use crate::ts_codegen::TsCollector;

/// One filter invocation in a chain: a registry name plus its raw, untyped
/// parameter map (empty when the wire object has no `params` or `params` is
/// `null`).
#[derive(Debug, Clone, Default, PartialEq)]
pub struct FilterUse {
    pub name: String,
    pub params: Map<String, Value>,
}

/// An ordered filter chain. Decodes from a single `{"name", "params"}` object
/// (a 1-element chain) or an array of them (applied in order); any malformed
/// entry — or non-object/array garbage — warns and degrades the whole value
/// to an empty chain.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct FilterChain(pub Vec<FilterUse>);

impl<'de> Deserialize<'de> for FilterChain {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        Ok(chain_from_value(Value::deserialize(d)?))
    }
}

/// Longest decodable chain. [`ResolvedFilterPass::wire_index`] is a `u8`, so
/// only entry indices `0..=u8::MAX` are addressable; a longer chain is
/// nonsense input and degrades whole-value like any other malformed chain.
pub const MAX_CHAIN_LEN: usize = u8::MAX as usize + 1;

fn chain_from_value(value: Value) -> FilterChain {
    let entries: Vec<Value> = match value {
        Value::Array(entries) => entries,
        obj @ Value::Object(_) => vec![obj],
        other => {
            warn_decode(
                &other,
                &format!("filter must be an object or array of objects, got {other}"),
            );
            return FilterChain::default();
        }
    };
    if entries.len() > MAX_CHAIN_LEN {
        // Don't serialize the (huge) offending array back into the sink —
        // its length is the whole story.
        crate::protocol::decode_warn(
            "filterParams",
            &format!("[array of {} entries]", entries.len()),
            &format!(
                "filter chain has {} entries, over the cap of {MAX_CHAIN_LEN}",
                entries.len()
            ),
        );
        return FilterChain::default();
    }
    let mut uses = Vec::with_capacity(entries.len());
    for entry in entries {
        match filter_use(entry) {
            Ok(fu) => uses.push(fu),
            // Whole-value degradation: one bad entry empties the chain, so a
            // half-applied filter stack can never render.
            Err((offending, message)) => {
                warn_decode(&offending, &message);
                return FilterChain::default();
            }
        }
    }
    FilterChain(uses)
}

/// Decode one `{"name", "params"}` entry, consuming it — the accept path moves
/// `name`/`params` out instead of cloning. An error hands back the most
/// precise offending value alongside the message, for the decode-warning sink.
fn filter_use(value: Value) -> Result<FilterUse, (Value, String)> {
    let mut obj = match value {
        Value::Object(obj) => obj,
        other => {
            let message = format!("filter entry must be an object, got {other}");
            return Err((other, message));
        }
    };
    let name = match obj.remove("name") {
        Some(Value::String(name)) => name,
        Some(other) => {
            let message = format!("filter name must be a string, got {other}");
            return Err((other, message));
        }
        None => {
            let entry = Value::Object(obj);
            let message = format!("filter entry {entry} is missing \"name\"");
            return Err((entry, message));
        }
    };
    let params = match obj.remove("params") {
        // Deliberate null-leniency: JS callers naturally send `params: null`
        // for "no params" — treat it exactly like an absent key.
        None | Some(Value::Null) => Map::new(),
        Some(Value::Object(params)) => params,
        Some(other) => {
            let message = format!("filter params must be an object, got {other}");
            return Err((other, message));
        }
    };
    Ok(FilterUse { name, params })
}

fn warn_decode(value: &Value, message: &str) {
    // `Value`'s `Display` is compact JSON — the raw offending wire value.
    crate::protocol::decode_warn("filterParams", &value.to_string(), message);
}

// ---------------------------------------------------------------------------
// Param packing
// ---------------------------------------------------------------------------

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
/// param's *logical*-px value as produced by [`ReactFilter::pack`]; the chain
/// resolve system ([`resolve_filter_chains`]) rewrites those components to
/// physical px using this layout metadata before upload. Every other kind packs in its final
/// unit (scalars as-is, angles in radians).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ParamSlot {
    pub name: &'static str,
    pub kind: ValueKind,
    pub vec: usize,
    pub comp: usize,
    pub len: usize,
}

fn check_param_cap(name: &str, vecs: usize) -> Result<(), String> {
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
/// [`ReactFilter::pack`] copies the four components into a `Vec4` slot
/// untouched. `Default` is transparent black (`[0.0; 4]`).
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

// ---------------------------------------------------------------------------
// The filter trait + resolved output
// ---------------------------------------------------------------------------

/// A typed, named filter: how its params deserialize (strict — built-ins use
/// `#[serde(deny_unknown_fields)]`), pack into shader uniforms, and resolve
/// into render passes.
pub trait ReactFilter: Send + Sync + Sized + 'static {
    /// The wire name in a [`FilterUse`] (camelCase, e.g. `"hueRotate"`).
    const NAME: &'static str;

    /// Whether the effect is time-driven (must re-render every frame even
    /// with static params). None of the built-ins are.
    const USES_TIME: bool = false;

    /// The params JSON of this filter's **identity** invocation (no visual
    /// effect), if it has one — brightness/contrast/saturate `amount: 1`,
    /// grayscale/sepia/invert `amount: 0` (their identity is `0`, NOT the CSS
    /// shorthand default of `1`), blur `radius: 0`, hueRotate `angle: 0`.
    ///
    /// Consumed by the transition engine's filter channel: when a chain
    /// gains/loses trailing entries, the shorter side is padded with identity
    /// passes so the change *fades* instead of popping (see
    /// [`plan_filter_ease`]). The identity value is resolved through the
    /// normal [`resolve`](Self::resolve) path, so its packing, layout, and
    /// shader handles match the real filter's for free. `None` (the default —
    /// `#[react_filter]` custom filters keep it) opts out of extension:
    /// mismatched chains involving the filter swap discretely.
    fn identity_params() -> Option<Value> {
        None
    }

    /// The pass shader. Lazy: called inside `resolve`, never at registration
    /// time, so registering filters needs no `AssetServer`.
    fn shader(assets: &AssetServer) -> Handle<Shader>;

    /// Extra *logical* px the effect bleeds outside the node's rect (blur
    /// reach). Identity for most filters. Fallible so params that cannot
    /// yield a px value (blur's non-px radius) reject instead of silently
    /// packing `0.0`.
    fn outset(&self) -> Result<f32, String> {
        Ok(0.0)
    }

    /// Pack the params into the uniform `Vec4` array plus the layout saying
    /// where each named param landed. `Length` params pack their logical-px
    /// value (see [`ParamSlot`]).
    ///
    /// **Contract:** this is the canonical *single-invocation* packing;
    /// `resolve` overrides may repack (e.g. blur's per-direction params), but
    /// must agree with the layout for named slots. Every slot obeys
    /// [`ParamSlot`]'s no-straddle rule: `comp + len <= 4`, padding to the
    /// next `Vec4` where needed. `#[react_filter]`-generated impls fill the
    /// array contiguously in field declaration order; the built-ins keep
    /// their hand-written canonical layouts.
    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>);

    /// Resolve into render passes. The default builds one pass straight from
    /// [`pack`](Self::pack) (see [`resolve_single_pass`]); multi-pass effects
    /// (blur: H then V) override it. Passes come back with `wire_index: 0` —
    /// resolve fns don't know their chain position; the chain resolver
    /// rewrites it (see [`ResolvedFilterPass::wire_index`]).
    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        resolve_single_pass(self, assets)
    }
}

/// The default single-pass resolve body: [`ReactFilter::pack`] + the
/// param-vec cap check + one pass tagged `wire_index: 0`.
///
/// `pub` so `#[react_filter]`-generated `resolve` overrides (which prepend
/// `Length` px validation) can delegate to the canonical body from consumer
/// crates instead of re-implementing the cap check.
pub fn resolve_single_pass<T: ReactFilter>(
    filter: &T,
    assets: &AssetServer,
) -> Result<Vec<ResolvedFilterPass>, String> {
    let (params, layout) = filter.pack();
    check_param_cap(T::NAME, params.len())?;
    Ok(vec![ResolvedFilterPass {
        shader: T::shader(assets),
        params,
        layout,
        wire_index: 0,
    }])
}

/// One resolved render pass of a filter chain.
#[derive(Debug, Clone, PartialEq)]
pub struct ResolvedFilterPass {
    pub shader: Handle<Shader>,
    /// The packed uniform array (at most [`MAX_FILTER_PARAM_VECS`] entries).
    pub params: Vec<Vec4>,
    /// Where each named param sits in `params` (animation + physical-px
    /// rewrite metadata).
    pub layout: Arc<[ParamSlot]>,
    /// Index of the originating [`FilterUse`] in the wire chain — blur's two
    /// expanded passes share one. Resolve fns always emit `0`; the chain
    /// resolve system ([`resolve_filter_chains`]) rewrites it per chain
    /// position.
    ///
    /// **Rewrite rule:** chains longer than `u8::MAX` saturate — the
    /// rewriter must clamp to `u8::MAX`, never wrap. Wire input can't reach
    /// saturation (decode caps chains at [`MAX_CHAIN_LEN`] entries, so every
    /// decoded index fits); the rule exists for programmatic chains.
    pub wire_index: u8,
}

/// The wire `filter` chain of a node, mirrored off the base style by the
/// apply path (`crate::ui_map::apply_style_masked`'s FILTER arm) — present
/// iff the style carries a non-empty chain. The thin input side of the
/// [`resolve_filter_chains`] system, mirroring the
/// `crate::transition::TransitionInput` pattern: the style apply owns writes,
/// the resolver only reads. (Variants can't carry `filter`, so the base style
/// is the only source.)
#[derive(Component, Debug, Clone, Default, PartialEq)]
pub struct FilterInput(pub FilterChain);

/// A node's fully resolved `filter` chain, attached to promoted layer roots
/// by [`resolve_filter_chains`]. Absent on a promoted root whose chain has no
/// valid entries (pure capture/composite — no filter machinery).
#[derive(Component, Debug, Clone, Default)]
pub struct ResolvedFilterChain {
    /// Wire-order, and contiguous per wire entry (a multi-pass filter like
    /// blur expands into ADJACENT passes sharing a `wire_index`) —
    /// `devtools`' chain display groups by adjacency, so a reordering
    /// optimization must preserve contiguity or fix that consumer.
    pub passes: Vec<ResolvedFilterPass>,
    /// Total chain outset in **physical** px — the raw per-entry
    /// `ceil(logical × scale)` sum. NOT quantized: [`quantize_outset`] is
    /// applied by the geometry sync when sizing the capture texture.
    pub outset_px: u32,
    /// True when any pass's filter `USES_TIME` — the layer must re-render
    /// every frame.
    pub always_dirty: bool,
    /// Bumped (wrapping — it is a pure change signal, only inequality
    /// matters) on every real change so downstream caches can detect it.
    /// Writer registry — exactly three systems bump this counter, and every
    /// one must use `wrapping_add(1)` so they share one overflow semantics:
    /// the resolver's snap ([`resolve_filter_chains`]), the transition's
    /// whole-value filter-channel ease (`transition.rs`'s
    /// `drive_transitions`), and the animation stage-4 per-param re-assert
    /// (`animations`' `apply_filter_params`).
    pub version: u32,
    /// The scale factor the `Length` slots and `outset_px` were rewritten
    /// with — per-entity staleness tracking: a mismatch against the node's
    /// current scale forces a re-resolve without any `Changed` signal.
    pub scale: f32,
}

/// Quantize a physical-px outset up to the next multiple of 16 so an animated
/// radius grows a layer texture in coarse steps instead of reallocating every
/// frame.
pub fn quantize_outset(o: u32) -> u32 {
    o.div_ceil(16) * 16
}

// ---------------------------------------------------------------------------
// Param interpolation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Built-in filters
// ---------------------------------------------------------------------------

/// The shared shader for the seven color ops — one color-matrix pass with the
/// canonical packing `params[0] = (brightness, contrast, saturate, grayscale)`,
/// `params[1] = (sepia, invert, hue_radians, 0)`. Each op fills its own slot
/// and identity elsewhere, so any color op can be evaluated by the same
/// shader.
fn color_matrix_shader(assets: &AssetServer) -> Handle<Shader> {
    load_embedded_asset!(assets, "layer/color_matrix.wgsl")
}

/// The identity color-matrix packing (each op overwrites its own slot).
fn color_matrix_identity() -> Vec<Vec4> {
    vec![Vec4::new(1.0, 1.0, 1.0, 0.0), Vec4::ZERO]
}

/// Serde default for the amount ops (see each op's doc for the CSS rationale).
fn one() -> f32 {
    1.0
}

/// Define an `amount: f32`-shaped color op: wire name plus its slot in the
/// canonical color-matrix packing, and the amount that is the op's *identity*
/// (`1` for the multiplicative ops, `0` for the mix-in ops — deliberately not
/// always the CSS shorthand default).
macro_rules! color_matrix_filters {
    ($($(#[$doc:meta])* $ty:ident = $name:literal @ ($vec:literal, $comp:literal) identity $id:literal;)+) => {$(
        $(#[$doc])*
        #[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
        #[serde(deny_unknown_fields)]
        pub struct $ty {
            #[serde(default = "one")]
            pub amount: f32,
        }

        impl ReactFilter for $ty {
            const NAME: &'static str = $name;

            fn shader(assets: &AssetServer) -> Handle<Shader> {
                color_matrix_shader(assets)
            }

            fn identity_params() -> Option<Value> {
                Some(serde_json::json!({ "amount": $id }))
            }

            fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
                static LAYOUT: LazyLock<Arc<[ParamSlot]>> = LazyLock::new(|| {
                    Arc::from(vec![ParamSlot {
                        name: "amount",
                        kind: ValueKind::Scalar,
                        vec: $vec,
                        comp: $comp,
                        len: 1,
                    }])
                });
                let mut params = color_matrix_identity();
                params[$vec][$comp] = self.amount;
                (params, LAYOUT.clone())
            }
        }
    )+};
}

color_matrix_filters! {
    /// `brightness`: `amount` defaults to `1.0` — CSS `brightness()` with the
    /// value omitted means `1` (identity).
    BrightnessParams = "brightness" @ (0, 0) identity 1.0;
    /// `contrast`: `amount` defaults to `1.0` — CSS `contrast()` with the
    /// value omitted means `1` (identity).
    ContrastParams = "contrast" @ (0, 1) identity 1.0;
    /// `saturate`: `amount` defaults to `1.0` — CSS `saturate()` with the
    /// value omitted means `1` (identity).
    SaturateParams = "saturate" @ (0, 2) identity 1.0;
    /// `grayscale`: `amount` defaults to `1.0` — CSS `grayscale()` with the
    /// value omitted means `1` (**full** effect; identity is `0`), so a
    /// bare `{name:"grayscale"}` applies the effect.
    GrayscaleParams = "grayscale" @ (0, 3) identity 0.0;
    /// `sepia`: `amount` defaults to `1.0` — CSS `sepia()` with the value
    /// omitted means `1` (**full** effect; identity is `0`).
    SepiaParams = "sepia" @ (1, 0) identity 0.0;
    /// `invert`: `amount` defaults to `1.0` — CSS `invert()` with the value
    /// omitted means `1` (**full** effect; identity is `0`).
    InvertParams = "invert" @ (1, 1) identity 0.0;
}

/// `hueRotate`: `angle` defaults to `0deg` — CSS `hue-rotate()` with the
/// value omitted means `0deg` (identity). Packs radians at `params[1].z` of
/// the shared color-matrix packing.
#[derive(Debug, Clone, Copy, PartialEq, Default, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct HueRotateParams {
    // The `#[ts(type)]` override mirrors what `#[react_filter]` emits for an
    // `Angle` field (no `TS` impl on the wire-flexible type itself).
    #[serde(default)]
    #[ts(type = "number | string")]
    pub angle: Angle,
}

impl ReactFilter for HueRotateParams {
    const NAME: &'static str = "hueRotate";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        color_matrix_shader(assets)
    }

    fn identity_params() -> Option<Value> {
        Some(serde_json::json!({ "angle": 0.0 }))
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        static LAYOUT: LazyLock<Arc<[ParamSlot]>> = LazyLock::new(|| {
            Arc::from(vec![ParamSlot {
                name: "angle",
                kind: ValueKind::Angle,
                vec: 1,
                comp: 2,
                len: 1,
            }])
        });
        let mut params = color_matrix_identity();
        params[1][2] = self.angle.radians();
        (params, LAYOUT.clone())
    }
}

/// `blur`: separable Gaussian blur. `radius` defaults to `0` — CSS `blur()`
/// with the value omitted means `0` (identity).
///
/// Resolves to **two** passes, horizontal then vertical, each packed as
/// `params[0] = (radius_logical_px, dir.x, dir.y, 0)` with dir `(1,0)` then
/// `(0,1)`. Only the radius is a named (layout-exposed) param — the direction
/// components are pass-internal.
#[derive(Debug, Clone, Copy, PartialEq, Default, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct BlurParams {
    // Mirrors `#[react_filter]`'s override for a `Length` field.
    #[serde(default)]
    #[ts(type = "number | string")]
    pub radius: Length,
}

fn blur_layout() -> Arc<[ParamSlot]> {
    static LAYOUT: LazyLock<Arc<[ParamSlot]>> = LazyLock::new(|| {
        Arc::from(vec![ParamSlot {
            name: "radius",
            kind: ValueKind::Length,
            vec: 0,
            comp: 0,
            len: 1,
        }])
    });
    LAYOUT.clone()
}

impl ReactFilter for BlurParams {
    const NAME: &'static str = "blur";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "layer/blur.wgsl")
    }

    fn identity_params() -> Option<Value> {
        Some(serde_json::json!({ "radius": 0.0 }))
    }

    /// 3σ-style reach: a Gaussian of radius `r` is visually gone past `3r`.
    fn outset(&self) -> Result<f32, String> {
        Ok(3.0 * length_logical_px(Self::NAME, "radius", self.radius)?)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        // The horizontal pass's packing; `resolve` builds both directions.
        // `pack` is infallible, so a non-px radius falls back to 0 here — but
        // it can never reach the shader: `resolve`/`outset` reject it first.
        (
            vec![Vec4::new(
                length_logical_px(Self::NAME, "radius", self.radius).unwrap_or(0.0),
                1.0,
                0.0,
                0.0,
            )],
            blur_layout(),
        )
    }

    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        let radius = length_logical_px(Self::NAME, "radius", self.radius)?;
        let shader = Self::shader(assets);
        let pass = |dir: (f32, f32)| ResolvedFilterPass {
            shader: shader.clone(),
            params: vec![Vec4::new(radius, dir.0, dir.1, 0.0)],
            layout: blur_layout(),
            wire_index: 0,
        };
        Ok(vec![pass((1.0, 0.0)), pass((0.0, 1.0))])
    }
}

// ---------------------------------------------------------------------------
// The registry
// ---------------------------------------------------------------------------

/// One registered filter: everything the chain resolver needs, baked into
/// `AssetServer`-free fn pointers at registration time (shader loading stays
/// lazy — the pointers *receive* the `&AssetServer`).
///
/// `resolve` and `outset` each deserialize the params — intentionally, not an
/// oversight: the duplication keeps `outset` `AssetServer`-free, so the future
/// per-frame texture-sizing path never grows an `AssetServer` dependency. Do
/// not "optimize" them into one fn.
pub struct FilterRegistration {
    type_id: TypeId,
    /// Deserialize a raw [`FilterUse::params`] value (strict) and resolve it
    /// into render passes. Errors are messages for the devtools warning sink.
    pub(crate) resolve: fn(&Value, &AssetServer) -> Result<Vec<ResolvedFilterPass>, String>,
    /// Deserialize the raw params and report the filter's logical-px outset.
    /// Separate from `resolve` so the chain resolver can size layer textures
    /// without an `AssetServer` in hand.
    pub(crate) outset: fn(&Value) -> Result<f32, String>,
    /// Mirrors [`ReactFilter::USES_TIME`].
    pub(crate) uses_time: bool,
    /// Mirrors [`ReactFilter::identity_params`] — `None` means the filter has
    /// no identity and cannot pad a chain extension (see [`plan_filter_ease`]).
    pub(crate) identity: fn() -> Option<Value>,
    /// The params type's TypeScript reference name (export-only; the wire
    /// name is this entry's key in [`FilterRegistry::entries`], exactly like
    /// the event registry).
    pub(crate) ts_name: fn() -> String,
    /// Collects the params type declaration (and its dependencies).
    pub(crate) ts_collect: fn(&mut TsCollector),
}

impl NamedEntry for FilterRegistration {
    fn type_id(&self) -> TypeId {
        self.type_id
    }
}

/// Known filters, keyed by wire name. Populated by
/// [`register_builtin_filters`]; consumed by [`resolve_filter_chains`].
#[derive(Resource, Default)]
pub struct FilterRegistry {
    pub(crate) entries: HashMap<&'static str, FilterRegistration>,
}

impl FilterRegistry {
    /// Register filter type `T` under `T::NAME`. Idempotent per type; a
    /// different type claiming an occupied name warns and replaces (see
    /// [`register_entry`]).
    pub fn register<T: ReactFilter + DeserializeOwned + TS>(&mut self) {
        register_entry(
            &mut self.entries,
            T::NAME,
            "filter",
            FilterRegistration {
                type_id: TypeId::of::<T>(),
                resolve: |value, assets| {
                    let passes = decode_params::<T>(value)?.resolve(assets)?;
                    // Custom `resolve` overrides bypass the default's cap
                    // check, so re-check every pass here.
                    for pass in &passes {
                        check_param_cap(T::NAME, pass.params.len())?;
                    }
                    Ok(passes)
                },
                outset: |value| decode_params::<T>(value)?.outset(),
                uses_time: T::USES_TIME,
                identity: T::identity_params,
                // `T` is concrete here, so its TS shape is baked into these
                // fns (the same split as `EventRegistration`).
                ts_name: <T as TS>::name,
                ts_collect: |c| c.add::<T>(),
            },
        );
    }

    /// Register the eight built-in filters into this registry. Two callers:
    /// [`register_builtin_filters`] (the runtime path, via
    /// `ReactUiPlugin::build`) and the TypeScript exporter
    /// (`crate::ts_codegen`), which seeds a throwaway registry with them so
    /// built-ins are always exported even though the bare exporter `App`
    /// (`register_bindings` only) never adds the plugin.
    pub(crate) fn register_builtins(&mut self) {
        self.register::<BlurParams>();
        self.register::<BrightnessParams>();
        self.register::<ContrastParams>();
        self.register::<SaturateParams>();
        self.register::<GrayscaleParams>();
        self.register::<SepiaParams>();
        self.register::<InvertParams>();
        self.register::<HueRotateParams>();
    }
}

fn decode_params<T: ReactFilter + DeserializeOwned>(value: &Value) -> Result<T, String> {
    T::deserialize(value).map_err(|e| format!("filter {:?} params: {e}", T::NAME))
}

/// Register the eight built-in filters. Called by `ReactUiPlugin::build`.
/// Deliberately `AssetServer`-free: shader loads happen lazily inside each
/// entry's `resolve`.
pub fn register_builtin_filters(app: &mut App) {
    app.world_mut()
        .get_resource_or_init::<FilterRegistry>()
        .register_builtins();
}

// ---------------------------------------------------------------------------
// Whole-value `filter` transitions
// ---------------------------------------------------------------------------

/// How a `transition: { filter }` interpolates between two wire chains,
/// decided by [`classify_filter_transition`] when the transition engine
/// retargets:
///
/// - `Matched` — same names, same order, same length: the resolved pass lists
///   align position-wise and packed params lerp pairwise per frame.
/// - `Extended` — the chains differ in length, the shorter's names are a
///   prefix of the longer's, and every entry of both chains has identity
///   params ([`ReactFilter::identity_params`]): the shorter side is padded at
///   the END (CSS pads at the end) with identity passes of the longer's
///   trailing entries, then lerped pairwise — so hover-adds-blur *fades in*
///   from radius `0` instead of popping.
/// - `Discrete` — anything else (mismatched names, a custom filter without an
///   identity): the chain swaps wholesale at eased progress `0.5`, CSS's
///   discrete interpolation.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum FilterStrategy {
    Matched,
    Extended,
    Discrete,
}

/// Classify how a filter transition from wire chain `from` to `to` should
/// interpolate. `registry: None` (an asset-free test world) disables the
/// identity lookup, degrading `Extended` candidates to `Discrete`.
pub(crate) fn classify_filter_transition(
    from: &FilterChain,
    to: &FilterChain,
    registry: Option<&FilterRegistry>,
) -> FilterStrategy {
    if from.0.len() == to.0.len() && from.0.iter().zip(&to.0).all(|(a, b)| a.name == b.name) {
        return FilterStrategy::Matched;
    }
    let (short, long) = if from.0.len() <= to.0.len() {
        (from, to)
    } else {
        (to, from)
    };
    let prefix = short.0.iter().zip(&long.0).all(|(s, l)| s.name == l.name);
    let has_identity = |chain: &FilterChain| {
        chain.0.iter().all(|fu| {
            registry.is_some_and(|r| {
                r.entries
                    .get(fu.name.as_str())
                    .is_some_and(|e| (e.identity)().is_some())
            })
        })
    };
    if prefix && has_identity(from) && has_identity(to) {
        FilterStrategy::Extended
    } else {
        FilterStrategy::Discrete
    }
}

/// The prepared interpolation of one armed filter transition, built by
/// [`plan_filter_ease`] at retarget time and sampled by the transition
/// engine's filter channel each frame.
#[derive(Debug, Clone)]
pub(crate) enum FilterEase {
    /// Position-wise aligned pass lists (`Matched`, or `Extended` after
    /// identity padding): each frame lerps packed params pairwise. `settle`
    /// is the resolver's own **unpadded** target output — the completion
    /// write must equal it bit-exactly so the two writers agree and stop
    /// churning.
    Aligned {
        start: Vec<ResolvedFilterPass>,
        target: Vec<ResolvedFilterPass>,
        settle: Vec<ResolvedFilterPass>,
    },
    /// Wholesale swap at eased progress `0.5`.
    Discrete {
        start: Vec<ResolvedFilterPass>,
        target: Vec<ResolvedFilterPass>,
    },
}

impl FilterEase {
    /// The pass list at eased progress `p`.
    pub(crate) fn sample(&self, p: f32) -> Vec<ResolvedFilterPass> {
        match self {
            Self::Aligned { start, target, .. } => start
                .iter()
                .zip(target)
                .map(|(s, t)| {
                    // Target metadata (shader / layout / wire_index) with
                    // lerped params — an aligned pair shares them by
                    // construction.
                    let mut pass = t.clone();
                    pass.params = lerp_packed_params(&s.params, &t.params, p, &t.layout);
                    pass
                })
                .collect(),
            Self::Discrete { start, target } => {
                if p < 0.5 {
                    start.clone()
                } else {
                    target.clone()
                }
            }
        }
    }

    /// The completion value: the resolver's own output for the target wire
    /// chain, bit-exact — never a padded list.
    pub(crate) fn settle(&self) -> &[ResolvedFilterPass] {
        match self {
            Self::Aligned { settle, .. } => settle,
            Self::Discrete { target, .. } => target,
        }
    }
}

/// Plan the interpolation for a filter retarget: classify the wire chains,
/// pad for `Extended`, and defensively fall back to a discrete swap whenever
/// the pass lists don't align (a custom resolver may emit differing pass
/// structures even for matching names, and identity resolution can fail).
///
/// `start` is the transition state's own current pass list — the engine owns
/// its current value, since [`resolve_filter_chains`] already snapped the
/// component to the target this frame — and `target` is that freshly snapped
/// resolver output. `scale` is the resolved chain's physical-px factor,
/// applied to padding passes exactly like the resolver's own rewrite.
pub(crate) fn plan_filter_ease(
    from_wire: &FilterChain,
    to_wire: &FilterChain,
    start: Vec<ResolvedFilterPass>,
    target: Vec<ResolvedFilterPass>,
    registry: Option<&FilterRegistry>,
    assets: Option<&AssetServer>,
    scale: f32,
) -> FilterEase {
    match classify_filter_transition(from_wire, to_wire, registry) {
        FilterStrategy::Discrete => FilterEase::Discrete { start, target },
        FilterStrategy::Matched => aligned_or_discrete(start, target.clone(), target),
        FilterStrategy::Extended => {
            // `Extended` is only classified with a registry in hand; the
            // assets are needed to resolve the padding's shader handles.
            let (Some(registry), Some(assets)) = (registry, assets) else {
                return FilterEase::Discrete { start, target };
            };
            if from_wire.0.len() < to_wire.0.len() {
                // Growing: the START side pads — added filters fade IN.
                match identity_passes(
                    &to_wire.0[from_wire.0.len()..],
                    from_wire.0.len(),
                    registry,
                    assets,
                    scale,
                ) {
                    Some(pad) => {
                        let mut start = start;
                        start.extend(pad);
                        aligned_or_discrete(start, target.clone(), target)
                    }
                    None => FilterEase::Discrete { start, target },
                }
            } else {
                // Shrinking: the TARGET side pads — removed trailing filters
                // fade OUT to identity; completion snaps to the unpadded
                // resolver output.
                match identity_passes(
                    &from_wire.0[to_wire.0.len()..],
                    to_wire.0.len(),
                    registry,
                    assets,
                    scale,
                ) {
                    Some(pad) => {
                        let mut padded = target.clone();
                        padded.extend(pad);
                        aligned_or_discrete(start, padded, target)
                    }
                    None => FilterEase::Discrete { start, target },
                }
            }
        }
    }
}

/// `Aligned` when the pass lists actually align pairwise (same length, same
/// per-index shader, layout, and param count — [`lerp_packed_params`]'s
/// contract, plus the shader so a mid-ease frame never renders lerped params
/// through the wrong pass), else a discrete swap onto the unpadded `settle`
/// value.
fn aligned_or_discrete(
    start: Vec<ResolvedFilterPass>,
    target: Vec<ResolvedFilterPass>,
    settle: Vec<ResolvedFilterPass>,
) -> FilterEase {
    let compatible = start.len() == target.len()
        && start.iter().zip(&target).all(|(s, t)| {
            s.params.len() == t.params.len() && s.layout == t.layout && s.shader == t.shader
        });
    if compatible {
        FilterEase::Aligned {
            start,
            target,
            settle,
        }
    } else {
        FilterEase::Discrete {
            start,
            target: settle,
        }
    }
}

/// Resolve the identity passes that pad a chain extension: one identity
/// invocation per entry of `entries` (the longer chain's trailing
/// [`FilterUse`]s), through the registry's normal resolve path — packing,
/// layout, and shader handles come for free — with `wire_index` continuing at
/// `offset` and `Length` slots rewritten to physical px like the resolver's
/// own passes. `None` when any entry lacks an identity or fails to resolve
/// (the caller falls back to a discrete swap).
fn identity_passes(
    entries: &[FilterUse],
    offset: usize,
    registry: &FilterRegistry,
    assets: &AssetServer,
    scale: f32,
) -> Option<Vec<ResolvedFilterPass>> {
    let mut out = Vec::new();
    for (i, fu) in entries.iter().enumerate() {
        let reg = registry.entries.get(fu.name.as_str())?;
        let identity = (reg.identity)()?;
        let passes = (reg.resolve)(&identity, assets).ok()?;
        // Saturate, never wrap — the same rule as the chain resolver.
        let wire_index = (offset + i).min(u8::MAX as usize) as u8;
        for mut pass in passes {
            pass.wire_index = wire_index;
            rewrite_length_slots(&mut pass, scale);
            out.push(pass);
        }
    }
    Some(out)
}

/// Physical-px rewrite: `Length` slots are packed logical (the [`ParamSlot`]
/// contract) — scale them for upload. Bounds are defended so a custom
/// filter's bad layout can't panic here. Shared by [`resolve_filter_chains`]
/// and the transition padding ([`plan_filter_ease`]).
fn rewrite_length_slots(pass: &mut ResolvedFilterPass, scale: f32) {
    let layout = pass.layout.clone();
    for slot in layout.iter().filter(|s| s.kind == ValueKind::Length) {
        for comp in slot.comp..(slot.comp + slot.len).min(4) {
            if let Some(vec) = pass.params.get_mut(slot.vec) {
                vec[comp] *= scale;
            }
        }
    }
}

// ---------------------------------------------------------------------------
// The chain resolve system
// ---------------------------------------------------------------------------

/// Turn each promoted root's wire [`FilterInput`] into a packed
/// [`ResolvedFilterChain`]. Runs in `Update` after the interaction restyle
/// (the last [`FilterInput`] writer this frame) and before the transition/
/// animation appliers — both write onto the resolved chain: the transition's
/// filter-channel ease and stage 4's per-param `filter[<i>].<param>` bindings.
///
/// Re-resolves when the input changed, the node was (re-)promoted, or the
/// node's scale factor no longer matches the one baked into the existing
/// chain. Per the plan's identity-fallback rule, an unknown filter name
/// (`filterUnknown`) or rejected params (`filterParams`) warn into
/// [`crate::diag`] under the node's scope and skip that entry; a chain with
/// no valid entries attaches no [`ResolvedFilterChain`] at all (the node
/// stays promoted — promotion reads the wire chain).
///
/// Writes are compare-before-write: an identical re-resolve neither bumps
/// `version` nor produces dirt; a real change bumps it and pushes the root
/// into [`LayerContentDirt::composite_only`] (filter output changes never
/// dirty the capture — it holds unfiltered content).
#[allow(clippy::type_complexity)]
pub fn resolve_filter_chains(
    mut commands: Commands,
    registry: Res<FilterRegistry>,
    assets: Res<AssetServer>,
    mut dirt: ResMut<LayerContentDirt>,
    mut roots: Query<(
        Entity,
        &crate::bridge::RNode,
        Ref<FilterInput>,
        Ref<PromotedLayer>,
        Option<&mut ResolvedFilterChain>,
        &ComputedNode,
    )>,
    mut unset: RemovedComponents<FilterInput>,
    stale: Query<(), With<ResolvedFilterChain>>,
) {
    for (entity, rnode, input, promoted, existing, computed) in &mut roots {
        // Physical pixels per logical pixel, from this frame's layout output.
        let scale = computed.inverse_scale_factor().recip();
        let scale = if scale.is_finite() && scale > 0.0 {
            scale
        } else {
            1.0
        };
        // `Ref` flags, not query filters: the scale-mismatch arm must see
        // rows that carry NO change signal (a DPI change ticks nothing on
        // this entity), so "simplifying" this into
        // `Or<(Changed<FilterInput>, Added<PromotedLayer>)>` would kill it.
        let needs_resolve = input.is_changed()
            || promoted.is_added()
            || existing.as_ref().is_some_and(|c| c.scale != scale);
        if !needs_resolve {
            continue;
        }
        // Attribute the validation warnings below to this node's inspector.
        let _diag = crate::diag::node_scope(rnode.0);

        let mut passes: Vec<ResolvedFilterPass> = Vec::new();
        let mut outset_px = 0u32;
        let mut always_dirty = false;
        for (index, fu) in input.0.0.iter().enumerate() {
            let Some(reg) = registry.entries.get(fu.name.as_str()) else {
                crate::diag::report(
                    "filterUnknown",
                    &fu.name,
                    &format!("unknown filter {:?} — entry skipped", fu.name),
                );
                continue;
            };
            let params = Value::Object(fu.params.clone());
            let resolved = match (reg.resolve)(&params, &assets) {
                Ok(resolved) => resolved,
                Err(msg) => {
                    crate::diag::report("filterParams", &params.to_string(), &msg);
                    continue;
                }
            };
            let outset = match (reg.outset)(&params) {
                Ok(outset) => outset,
                Err(msg) => {
                    crate::diag::report("filterParams", &params.to_string(), &msg);
                    continue;
                }
            };
            // The `as u32` cast saturates (NaN → 0, inf → MAX); the add +
            // clamp keep a pathological radius from overflowing the capture
            // inflation math downstream.
            outset_px = outset_px
                .saturating_add((outset.max(0.0) * scale).ceil() as u32)
                .min(MAX_FILTER_OUTSET_PX);
            always_dirty |= reg.uses_time;
            // Saturate, never wrap (see `ResolvedFilterPass::wire_index`) —
            // decode caps chains under `u8::MAX`, but programmatic chains
            // could exceed it.
            let wire_index = index.min(u8::MAX as usize) as u8;
            for mut pass in resolved {
                pass.wire_index = wire_index;
                rewrite_length_slots(&mut pass, scale);
                passes.push(pass);
            }
        }

        if passes.is_empty() {
            // All entries invalid (or an empty input): pure capture/composite.
            if existing.is_some() {
                commands.entity(entity).remove::<ResolvedFilterChain>();
                dirt.composite_only.push(entity);
            }
            continue;
        }
        match existing {
            Some(mut chain) => {
                if chain.passes == passes
                    && chain.outset_px == outset_px
                    && chain.always_dirty == always_dirty
                {
                    // Identical output — keep version + dirt quiet, but track
                    // the scale so a mismatch doesn't re-resolve every frame.
                    if chain.scale != scale {
                        chain.scale = scale;
                    }
                    continue;
                }
                *chain = ResolvedFilterChain {
                    passes,
                    outset_px,
                    always_dirty,
                    version: chain.version.wrapping_add(1),
                    scale,
                };
                dirt.composite_only.push(entity);
            }
            None => {
                commands.entity(entity).insert(ResolvedFilterChain {
                    passes,
                    outset_px,
                    always_dirty,
                    version: 1,
                    scale,
                });
                dirt.composite_only.push(entity);
            }
        }
    }

    // A style that dropped its chain (empty/unset filter) removes the input;
    // if the node is still promoted (another reason holds it), the resolved
    // chain would linger — clean it up here. (Demotion has its own cleanup in
    // `evaluate_layer_promotions`.) The `stale` gate is also load-bearing for
    // despawn safety: `RemovedComponents` yields despawned entities too, and
    // the contains-check keeps `commands.entity()` off them.
    for entity in unset.read() {
        if stale.contains(entity) {
            commands.entity(entity).remove::<ResolvedFilterChain>();
            dirt.composite_only.push(entity);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `FilterChain`'s decode never errors — malformed input degrades.
    fn chain(json: &str) -> FilterChain {
        serde_json::from_str(json).expect("FilterChain decode must not error")
    }

    fn blur_use(radius: u64) -> FilterUse {
        let mut params = Map::new();
        params.insert("radius".into(), Value::from(radius));
        FilterUse {
            name: "blur".into(),
            params,
        }
    }

    #[test]
    fn single_object_decodes_to_one_element_chain() {
        assert_eq!(
            chain(r#"{"name":"blur","params":{"radius":4}}"#),
            FilterChain(vec![blur_use(4)]),
        );
    }

    #[test]
    fn array_decodes_preserving_order() {
        assert_eq!(
            chain(
                r#"[
                    {"name":"blur","params":{"radius":4}},
                    {"name":"grayscale","params":{"amount":1}}
                ]"#
            ),
            FilterChain(vec![blur_use(4), {
                let mut params = Map::new();
                params.insert("amount".into(), Value::from(1u64));
                FilterUse {
                    name: "grayscale".into(),
                    params,
                }
            }]),
        );
    }

    #[test]
    fn missing_params_decodes_to_empty_map() {
        #[cfg(all(feature = "devtools", debug_assertions))]
        let _ = crate::diag::take_decode_warnings();
        let expected = FilterChain(vec![FilterUse {
            name: "invert".into(),
            params: Map::new(),
        }]);
        assert_eq!(chain(r#"{"name":"invert"}"#), expected);
        // Deliberate null-leniency: `params: null` is exactly an absent key.
        assert_eq!(chain(r#"{"name":"invert","params":null}"#), expected);
        #[cfg(all(feature = "devtools", debug_assertions))]
        assert!(crate::diag::take_decode_warnings().is_empty());
    }

    /// Whole-value semantics: one bad entry degrades the entire chain, so a
    /// half-applied filter stack can never render.
    #[test]
    fn malformed_entry_degrades_whole_value_to_empty_chain() {
        // A non-object entry in an otherwise valid array.
        assert_eq!(chain(r#"[{"name":"blur"},3]"#), FilterChain::default());
        // An entry with no name.
        assert_eq!(chain(r#"{"params":{}}"#), FilterChain::default());
        // A non-string name.
        assert_eq!(chain(r#"{"name":7}"#), FilterChain::default());
        // Non-object params.
        assert_eq!(
            chain(r#"{"name":"blur","params":3}"#),
            FilterChain::default()
        );
    }

    /// A chain longer than [`MAX_CHAIN_LEN`] (`wire_index` is a `u8`) warns
    /// and degrades whole-value, like any other malformed chain.
    #[test]
    fn over_long_chain_degrades_to_empty_chain() {
        #[cfg(all(feature = "devtools", debug_assertions))]
        let _ = crate::diag::take_decode_warnings();
        let at_cap = format!(
            "[{}]",
            vec![r#"{"name":"invert"}"#; MAX_CHAIN_LEN].join(",")
        );
        assert_eq!(chain(&at_cap).0.len(), MAX_CHAIN_LEN);
        let over_cap = format!(
            "[{}]",
            vec![r#"{"name":"invert"}"#; MAX_CHAIN_LEN + 1].join(",")
        );
        assert_eq!(chain(&over_cap), FilterChain::default());
        #[cfg(all(feature = "devtools", debug_assertions))]
        {
            let warns = crate::diag::take_decode_warnings();
            assert_eq!(warns.len(), 1);
            assert_eq!(warns[0].kind, "filterParams");
            assert!(
                warns[0].message.contains("over the cap"),
                "{}",
                warns[0].message
            );
        }
    }

    #[test]
    fn garbage_top_level_value_degrades_to_empty_chain() {
        assert_eq!(chain("42"), FilterChain::default());
        assert_eq!(chain("true"), FilterChain::default());
        assert_eq!(chain(r#""blur""#), FilterChain::default());
    }

    /// Warn-don't-abort: a garbage `filter` value must not fail the
    /// deserialization of a containing struct (the eventual `Style`).
    #[test]
    fn malformed_chain_does_not_abort_containing_struct() {
        #[derive(Deserialize)]
        struct Holder {
            filter: FilterChain,
            width: f32,
        }
        let h: Holder =
            serde_json::from_str(r#"{"filter":42,"width":16.0}"#).expect("holder decodes");
        assert_eq!(h.filter, FilterChain::default());
        assert_eq!(h.width, 16.0);
    }

    /// Malformed values are mirrored into the devtools decode sink (the sink
    /// is thread-local, so draining it per-test is parallel-safe).
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn malformed_values_report_decode_warnings() {
        let _ = crate::diag::take_decode_warnings();
        let _ = chain(r#"[{"name":"blur"},3]"#);
        let _ = chain("true");
        let warns = crate::diag::take_decode_warnings();
        let brief: Vec<_> = warns.iter().map(|w| (w.kind, w.value.as_str())).collect();
        assert_eq!(brief, vec![("filterParams", "3"), ("filterParams", "true")]);
        assert!(warns.iter().all(|w| !w.message.is_empty()));
    }

    /// A clean decode leaves the sink empty.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn valid_values_report_nothing() {
        let _ = crate::diag::take_decode_warnings();
        let _ = chain(r#"{"name":"blur"}"#);
        assert!(crate::diag::take_decode_warnings().is_empty());
        // An explicit empty array is a valid empty chain, not a degradation —
        // no warning.
        assert_eq!(chain("[]"), FilterChain::default());
        assert!(crate::diag::take_decode_warnings().is_empty());
    }

    // -- built-ins + registry + packing ------------------------------------

    use std::f32::consts::PI;

    use serde_json::json;

    /// A headless app that owns a real `AssetServer` for `resolve` calls,
    /// with the `Shader` asset + the crate's embedded filter shaders
    /// registered (no render sub-app) so `ReactFilter::shader` loads resolve
    /// to real embedded handles.
    pub(super) fn asset_app() -> App {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Shader>()
            .register_asset_loader(bevy::shader::ShaderLoader);
        crate::plugin::register_layer_shader_assets(&mut app);
        app
    }

    fn params<T: serde::de::DeserializeOwned>(value: serde_json::Value) -> T {
        serde_json::from_value(value).expect("params decode")
    }

    /// Each color op writes its value into its documented slot of the shared
    /// color-matrix packing and identity everywhere else, and its layout
    /// exposes only its own `amount` at that slot.
    #[test]
    fn color_ops_pack_into_documented_slots() {
        let identity0 = Vec4::new(1.0, 1.0, 1.0, 0.0);

        let (p, layout) = params::<BrightnessParams>(json!({ "amount": 1.2 })).pack();
        assert_eq!(p, vec![Vec4::new(1.2, 1.0, 1.0, 0.0), Vec4::ZERO]);
        assert_eq!(
            &*layout,
            &[ParamSlot {
                name: "amount",
                kind: ValueKind::Scalar,
                vec: 0,
                comp: 0,
                len: 1,
            }]
        );

        let (p, layout) = params::<ContrastParams>(json!({ "amount": 0.8 })).pack();
        assert_eq!(p, vec![Vec4::new(1.0, 0.8, 1.0, 0.0), Vec4::ZERO]);
        assert_eq!((layout[0].vec, layout[0].comp), (0, 1));

        let (p, layout) = params::<SaturateParams>(json!({ "amount": 1.5 })).pack();
        assert_eq!(p, vec![Vec4::new(1.0, 1.0, 1.5, 0.0), Vec4::ZERO]);
        assert_eq!((layout[0].vec, layout[0].comp), (0, 2));

        let (p, layout) = params::<GrayscaleParams>(json!({ "amount": 0.25 })).pack();
        assert_eq!(p, vec![Vec4::new(1.0, 1.0, 1.0, 0.25), Vec4::ZERO]);
        assert_eq!((layout[0].vec, layout[0].comp), (0, 3));

        let (p, layout) = params::<SepiaParams>(json!({ "amount": 0.5 })).pack();
        assert_eq!(p, vec![identity0, Vec4::new(0.5, 0.0, 0.0, 0.0)]);
        assert_eq!((layout[0].vec, layout[0].comp), (1, 0));

        let (p, layout) = params::<InvertParams>(json!({ "amount": 0.75 })).pack();
        assert_eq!(p, vec![identity0, Vec4::new(0.0, 0.75, 0.0, 0.0)]);
        assert_eq!((layout[0].vec, layout[0].comp), (1, 1));
    }

    /// `hueRotate` decodes CSS angles (bare number = degrees) and packs
    /// radians at `params[1].z`.
    #[test]
    fn hue_rotate_packs_radians_at_documented_slot() {
        let (p, layout) = params::<HueRotateParams>(json!({ "angle": 180 })).pack();
        assert!((p[1].z - PI).abs() < 1e-5);
        assert_eq!(p[0], Vec4::new(1.0, 1.0, 1.0, 0.0));
        assert_eq!(
            &*layout,
            &[ParamSlot {
                name: "angle",
                kind: ValueKind::Angle,
                vec: 1,
                comp: 2,
                len: 1,
            }]
        );
    }

    /// `{}` params take each filter's CSS-shorthand default: 1.0 for the six
    /// amount ops (identity for brightness/contrast/saturate, full effect for
    /// grayscale/sepia/invert), 0 for blur radius and hue angle.
    #[test]
    fn empty_params_default_to_css_shorthand_values() {
        assert_eq!(params::<BrightnessParams>(json!({})).amount, 1.0);
        assert_eq!(params::<ContrastParams>(json!({})).amount, 1.0);
        assert_eq!(params::<SaturateParams>(json!({})).amount, 1.0);
        assert_eq!(params::<SepiaParams>(json!({})).amount, 1.0);
        assert_eq!(params::<InvertParams>(json!({})).amount, 1.0);
        // A bare `{name:"grayscale"}` APPLIES the effect: amount 1.0, packed
        // into its slot.
        let g = params::<GrayscaleParams>(json!({}));
        assert_eq!(g.amount, 1.0);
        assert_eq!(g.pack().0[0].w, 1.0);
        assert_eq!(params::<BlurParams>(json!({})).radius, Length::Px(0.0));
        assert_eq!(params::<HueRotateParams>(json!({})).angle.radians(), 0.0);
    }

    /// Blur expands into exactly two separable passes — horizontal `(1,0)`
    /// then vertical `(0,1)` — radius (logical px) in `params[0].x`, both
    /// tagged `wire_index: 0` for the chain resolver to rewrite.
    #[test]
    fn blur_resolves_to_two_directional_passes() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes = params::<BlurParams>(json!({ "radius": 4 }))
            .resolve(assets)
            .expect("blur resolves");
        assert_eq!(passes.len(), 2);
        assert_eq!(passes[0].params, vec![Vec4::new(4.0, 1.0, 0.0, 0.0)]);
        assert_eq!(passes[1].params, vec![Vec4::new(4.0, 0.0, 1.0, 0.0)]);
        assert!(passes.iter().all(|p| p.wire_index == 0));
        assert_eq!(passes[0].layout[0].kind, ValueKind::Length);
    }

    /// Blur bleeds 3x its radius (Gaussian reach) in logical px.
    #[test]
    fn blur_outset_is_three_radii() {
        assert_eq!(
            params::<BlurParams>(json!({ "radius": 4 })).outset(),
            Ok(12.0)
        );
        assert_eq!(params::<BlurParams>(json!({})).outset(), Ok(0.0));
    }

    /// A non-px blur radius (`"50%"`, `"1vw"`, ...) rejects from both baked
    /// registry fns — resolve and outset — naming the offending unit, instead
    /// of silently packing `0.0`.
    #[test]
    fn non_px_blur_radius_rejects_from_registry() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<BlurParams>();
        let blur = &registry.entries["blur"];

        let value = json!({ "radius": "50%" });
        let err = (blur.resolve)(&value, assets).expect_err("percent radius must reject resolve");
        assert!(
            err.contains("px") && err.contains("%"),
            "names the unit: {err}"
        );
        let err = (blur.outset)(&value).expect_err("percent radius must reject outset");
        assert!(
            err.contains("px") && err.contains("%"),
            "names the unit: {err}"
        );

        let err = (blur.outset)(&json!({ "radius": "1vw" })).expect_err("vw radius must reject");
        assert!(err.contains("vw"), "names the unit: {err}");

        // Bare numbers and explicit px stay accepted.
        assert!((blur.resolve)(&json!({ "radius": 4 }), assets).is_ok());
        assert_eq!((blur.outset)(&json!({ "radius": "4px" })), Ok(12.0));
    }

    /// Unknown param keys are rejected (deny-unknown-fields), both at the
    /// typed layer and through the registry's baked resolve fn.
    #[test]
    fn unknown_param_key_is_rejected() {
        assert!(serde_json::from_value::<BlurParams>(json!({ "radius": 4, "bogus": 1 })).is_err());
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<GrayscaleParams>();
        let err = (registry.entries["grayscale"].resolve)(&json!({ "typo": 2 }), assets)
            .expect_err("unknown key must reject");
        assert!(err.contains("grayscale"), "error names the filter: {err}");
    }

    /// A filter packing more than `MAX_FILTER_PARAM_VECS` vec4s fails to
    /// resolve.
    #[test]
    fn over_cap_param_vecs_are_rejected() {
        struct NineVecs;
        impl ReactFilter for NineVecs {
            const NAME: &'static str = "nineVecs";
            fn shader(_assets: &AssetServer) -> Handle<Shader> {
                Handle::default()
            }
            fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
                (
                    vec![Vec4::ZERO; MAX_FILTER_PARAM_VECS + 1],
                    Arc::from(Vec::new()),
                )
            }
        }
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let err = NineVecs.resolve(assets).expect_err("over cap must reject");
        assert!(err.contains("nineVecs"), "error names the filter: {err}");
    }

    /// The registry's baked `resolve` re-checks the cap on every pass, so a
    /// custom `resolve` override can't smuggle an over-cap pass past the
    /// default-resolve check.
    #[test]
    fn registry_recheck_rejects_over_cap_custom_resolve() {
        #[derive(Deserialize, ts_rs::TS)]
        #[serde(deny_unknown_fields)]
        struct SneakyResolve {}
        impl ReactFilter for SneakyResolve {
            const NAME: &'static str = "sneakyResolve";
            fn shader(_assets: &AssetServer) -> Handle<Shader> {
                Handle::default()
            }
            fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
                (Vec::new(), Arc::from(Vec::new()))
            }
            fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
                Ok(vec![ResolvedFilterPass {
                    shader: Self::shader(assets),
                    params: vec![Vec4::ZERO; MAX_FILTER_PARAM_VECS + 1],
                    layout: Arc::from(Vec::new()),
                    wire_index: 0,
                }])
            }
        }
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<SneakyResolve>();
        let err = (registry.entries["sneakyResolve"].resolve)(&json!({}), assets)
            .expect_err("over-cap custom resolve must reject");
        assert!(
            err.contains("sneakyResolve"),
            "error names the filter: {err}"
        );
    }

    #[test]
    fn quantize_outset_rounds_up_to_16() {
        assert_eq!(quantize_outset(0), 0);
        assert_eq!(quantize_outset(1), 16);
        assert_eq!(quantize_outset(16), 16);
        assert_eq!(quantize_outset(17), 32);
    }

    // -- param interpolation ------------------------------------------------

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

    /// `register_builtin_filters` registers all eight names; running it again
    /// (same types) is a no-op per `register_entry` semantics.
    #[test]
    fn builtin_filters_register_all_eight() {
        let mut app = App::new();
        register_builtin_filters(&mut app);
        let registry = app.world().resource::<FilterRegistry>();
        let mut names: Vec<_> = registry.entries.keys().copied().collect();
        names.sort_unstable();
        assert_eq!(
            names,
            [
                "blur",
                "brightness",
                "contrast",
                "grayscale",
                "hueRotate",
                "invert",
                "saturate",
                "sepia",
            ]
        );
        assert!(registry.entries.values().all(|r| !r.uses_time));
        register_builtin_filters(&mut app);
        assert_eq!(app.world().resource::<FilterRegistry>().entries.len(), 8);
    }

    /// Every built-in entry carries working TS-export slots — `ts_name` names
    /// the params type and `ts_collect` declares it into a collector — so the
    /// TS exporter (`message.rs::render_typescript`) walks built-ins exactly
    /// like custom filters.
    #[test]
    fn builtin_filters_have_working_ts_slots() {
        let mut app = App::new();
        register_builtin_filters(&mut app);
        let registry = app.world().resource::<FilterRegistry>();
        for (name, reg) in &registry.entries {
            let ts = (reg.ts_name)();
            let mut c = TsCollector::default();
            (reg.ts_collect)(&mut c);
            assert!(c.decls.contains_key(&ts), "{name}: no decl for {ts}");
        }

        let blur = &registry.entries["blur"];
        assert_eq!((blur.ts_name)(), "BlurParams");
        let mut c = TsCollector::default();
        (blur.ts_collect)(&mut c);
        let decl = &c.decls["BlurParams"];
        // The `Length` field mirrors `#[react_filter]`'s wire-flexible
        // `number | string` override.
        assert!(decl.contains("radius"), "{decl}");
        assert!(decl.contains("number | string"), "{decl}");

        // The six amount ops share the macro-generated shape; `Angle` gets
        // the same override as `Length`.
        assert_eq!((registry.entries["grayscale"].ts_name)(), "GrayscaleParams");
        assert_eq!((registry.entries["hueRotate"].ts_name)(), "HueRotateParams");
        let mut c = TsCollector::default();
        (registry.entries["hueRotate"].ts_collect)(&mut c);
        assert!(
            c.decls["HueRotateParams"].contains("angle: number | string"),
            "{}",
            c.decls["HueRotateParams"]
        );
    }

    /// The registry's fn pointers carry the whole pipeline: deserialize →
    /// pack → passes, and the separate outset accessor.
    #[test]
    fn registry_resolve_end_to_end() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<BlurParams>();
        registry.register::<HueRotateParams>();

        let blur = &registry.entries["blur"];
        let passes = (blur.resolve)(&json!({ "radius": 8 }), assets).expect("blur resolves");
        assert_eq!(passes.len(), 2);
        assert_eq!(passes[0].params[0].x, 8.0);
        assert_eq!(
            (blur.outset)(&json!({ "radius": 8 })).expect("outset"),
            24.0
        );

        let hue = &registry.entries["hueRotate"];
        let passes = (hue.resolve)(&json!({ "angle": "0.5turn" }), assets).expect("hue resolves");
        assert_eq!(passes.len(), 1);
        assert!((passes[0].params[1].z - PI).abs() < 1e-4);
        assert_eq!((hue.outset)(&json!({})).expect("outset"), 0.0);
    }

    // -- shader wiring ------------------------------------------------------

    /// Under the asset-capable harness every built-in resolves to real
    /// embedded shader handles: the seven color ops share
    /// `color_matrix.wgsl`, blur's two passes share `blur.wgsl`, and the two
    /// shaders are distinct.
    #[test]
    fn resolve_returns_embedded_shader_handles() {
        let mut app = asset_app();
        register_builtin_filters(&mut app);
        let world = app.world();
        let assets = world.resource::<AssetServer>();
        let registry = world.resource::<FilterRegistry>();

        let shader_of = |name: &str| {
            let passes =
                (registry.entries[name].resolve)(&json!({}), assets).expect("filter resolves");
            let first = passes[0].shader.clone();
            assert!(
                passes.iter().all(|p| p.shader == first),
                "all of {name}'s passes share one shader"
            );
            assert_ne!(first, Handle::default(), "{name} has a real shader");
            first
        };
        let path_of = |handle: &Handle<Shader>| handle.path().expect("embedded path").to_string();

        let color = shader_of("brightness");
        for name in [
            "contrast",
            "saturate",
            "grayscale",
            "sepia",
            "invert",
            "hueRotate",
        ] {
            assert_eq!(shader_of(name), color, "{name} shares the color shader");
        }
        assert_eq!(
            &path_of(&color),
            "embedded://bevy_react/layer/color_matrix.wgsl"
        );

        let blur = shader_of("blur");
        assert_ne!(blur, color);
        assert_eq!(&path_of(&blur), "embedded://bevy_react/layer/blur.wgsl");
    }

    /// The filter-pass WGSL parses and validates as naga modules. naga has no
    /// naga_oil composition, so the prelude is checked standalone (minus its
    /// `#define_import_path`) and each pass shader gets a poor-man's compose:
    /// its `#import` block textually replaced by the prelude body. Real
    /// composition is exercised by the live filter pipeline
    /// (`layer/render.rs`) on a real GPU.
    #[test]
    fn filter_wgsl_parses_and_validates() {
        /// Parse + validate, then assert the expected entry points exist.
        /// The entry-point check is load-bearing: if `splice` ever mangles a
        /// pass shader (e.g. an `#import` form its skip loop mis-parses), the
        /// degenerate result is usually the prelude body alone — which still
        /// validates — so without this assertion the test would go silently
        /// green while never checking the pass's fragment shader.
        fn validate(name: &str, source: &str, entry_points: &[&str]) {
            let module = naga::front::wgsl::parse_str(source)
                .unwrap_or_else(|e| panic!("{name} does not parse:\n{}", e.emit_to_string(source)));
            naga::valid::Validator::new(
                naga::valid::ValidationFlags::all(),
                naga::valid::Capabilities::all(),
            )
            .validate(&module)
            .unwrap_or_else(|e| panic!("{name} does not validate: {e:?}"));
            for entry in entry_points {
                assert!(
                    module.entry_points.iter().any(|e| e.name == *entry),
                    "{name} is missing entry point `{entry}` — splice mangled?"
                );
            }
        }

        /// Replace the (possibly multi-line) `#import ... }` block with the
        /// prelude body.
        fn splice(prelude_body: &str, src: &str) -> String {
            let mut out = String::new();
            let mut lines = src.lines();
            while let Some(line) = lines.next() {
                if line.trim_start().starts_with("#import") {
                    out.push_str(prelude_body);
                    out.push('\n');
                    if !line.contains('}') {
                        for rest in lines.by_ref() {
                            if rest.trim() == "}" {
                                break;
                            }
                        }
                    }
                } else {
                    out.push_str(line);
                    out.push('\n');
                }
            }
            out
        }

        let prelude_body: String = include_str!("layer/filter_prelude.wgsl")
            .lines()
            .filter(|l| !l.trim_start().starts_with("#define_import_path"))
            .collect::<Vec<_>>()
            .join("\n");
        validate("filter_prelude.wgsl", &prelude_body, &["vertex"]);
        validate(
            "color_matrix.wgsl",
            &splice(&prelude_body, include_str!("layer/color_matrix.wgsl")),
            &["vertex", "fragment"],
        );
        validate(
            "blur.wgsl",
            &splice(&prelude_body, include_str!("layer/blur.wgsl")),
            &["vertex", "fragment"],
        );

        // The prelude's params array must track `MAX_FILTER_PARAM_VECS`; a
        // mismatch would otherwise surface only at pipeline creation on a
        // live GPU (the filter-pass bind group in `layer/render.rs` vs. the
        // WGSL declaration).
        assert!(
            include_str!("layer/filter_prelude.wgsl")
                .contains(&format!("array<vec4<f32>, {MAX_FILTER_PARAM_VECS}>")),
            "filter_prelude.wgsl params array size must equal MAX_FILTER_PARAM_VECS"
        );
    }

    // -- the chain resolve system (op-driven) -------------------------------

    use crate::bridge::JsBridge;
    use crate::layer::{LayerContentDirt, PromotedLayer};
    use crate::protocol::{NodeId, Op, Outbound, Props};

    fn op_props(json: serde_json::Value) -> Props {
        serde_json::from_value(json).expect("valid props")
    }

    fn create(id: NodeId, json: serde_json::Value) -> Op {
        Op::Create {
            id,
            kind: "node".into(),
            props: op_props(json),
            text: None,
        }
    }

    fn create_kind(id: NodeId, kind: &str, json: serde_json::Value) -> Op {
        Op::Create {
            id,
            kind: kind.into(),
            props: op_props(json),
            text: None,
        }
    }

    fn update(id: NodeId, json: serde_json::Value, style_unset: &[&str]) -> Op {
        Op::Update {
            id,
            props: op_props(json),
            unset: vec![],
            style_unset: style_unset.iter().map(|s| s.to_string()).collect(),
        }
    }

    fn entity_of(app: &App, id: NodeId) -> Entity {
        *app.world().resource::<JsBridge>().nodes.get(&id).unwrap()
    }

    /// The smallest app that runs `apply_js_ops` → `evaluate_layer_promotions`
    /// → [`resolve_filter_chains`] in order: `layer.rs`'s op harness plus the
    /// `Shader` asset machinery of [`asset_app`] (real embedded handles) and
    /// the built-in filter registry.
    fn resolve_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Shader>()
            .register_asset_loader(bevy::shader::ShaderLoader);
        crate::plugin::register_layer_shader_assets(&mut app);
        app.init_asset::<Image>();
        app.init_asset::<bevy::image::TextureAtlasLayout>();
        app.init_resource::<crate::plugin::Fonts>();
        app.init_resource::<crate::reconcile::OpApplyStats>();
        app.init_resource::<crate::ui_map::AtlasLayoutCache>();
        app.init_resource::<crate::layer::LayersRegistry>();
        app.init_resource::<crate::layer::LayerMembership>();
        app.init_resource::<LayerContentDirt>();
        register_builtin_filters(&mut app);

        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        std::mem::forget(out_rx);
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_systems(
            Update,
            (
                crate::reconcile::apply_js_ops,
                crate::layer::evaluate_layer_promotions.after(crate::reconcile::apply_js_ops),
                resolve_filter_chains.after(crate::layer::evaluate_layer_promotions),
            ),
        );
        (app, ops_tx)
    }

    fn drain_dirt(app: &mut App) {
        let mut dirt = app.world_mut().resource_mut::<LayerContentDirt>();
        dirt.nodes.clear();
        dirt.composite_only.clear();
    }

    /// A filtered create resolves into a [`ResolvedFilterChain`] on the
    /// promoted root: version 1, the documented packing, a real shader, no
    /// outset, not time-driven.
    #[test]
    fn filtered_create_attaches_resolved_chain() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "filter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<PromotedLayer>(e).is_some(), "promoted");
        let chain = app
            .world()
            .get::<ResolvedFilterChain>(e)
            .expect("chain resolved");
        assert_eq!(chain.version, 1);
        assert_eq!(chain.passes.len(), 1);
        // Bare `{name:"grayscale"}` = full effect: amount 1.0 at params[0].w.
        assert_eq!(chain.passes[0].params[0].w, 1.0);
        assert_ne!(chain.passes[0].shader, Handle::default());
        assert_eq!(chain.passes[0].wire_index, 0);
        assert_eq!(chain.outset_px, 0);
        assert!(!chain.always_dirty);
        assert_eq!(chain.scale, 1.0);
    }

    /// A param delta re-resolves: version bump, new packed value, and the
    /// root lands in `LayerContentDirt.composite_only` — never `nodes` (the
    /// capture holds unfiltered content).
    #[test]
    fn param_update_bumps_version_and_dirties_composite_only() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "filter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        drain_dirt(&mut app);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale", "params": { "amount": 0.5 } } } }),
                &[],
            )])
            .unwrap();
        app.update();
        let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
        assert_eq!(chain.version, 2);
        assert_eq!(chain.passes[0].params[0].w, 0.5);
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "{dirt:?}");
    }

    /// Re-sending the identical style is version-stable and produces no dirt
    /// (compare-before-write).
    #[test]
    fn identical_resend_is_version_stable_and_clean() {
        let (mut app, ops_tx) = resolve_app();
        let style = json!({ "style": { "filter": { "name": "grayscale" } } });
        ops_tx.send(vec![create(1, style.clone())]).unwrap();
        app.update();
        let e = entity_of(&app, 1);
        drain_dirt(&mut app);

        ops_tx.send(vec![update(1, style, &[])]).unwrap();
        app.update();
        let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
        assert_eq!(chain.version, 1, "identical re-send must not bump");
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(dirt.composite_only.is_empty(), "{dirt:?}");
        assert!(dirt.nodes.is_empty(), "{dirt:?}");
    }

    /// An unknown filter name in a chain warns (`filterUnknown`, attributed to
    /// the node) and is skipped — the rest of the chain still resolves.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn unknown_filter_entry_skips_and_warns() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                7,
                json!({ "style": { "filter": [{ "name": "nope" }, { "name": "sepia" }] } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 7);
        let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
        assert_eq!(chain.passes.len(), 1, "only sepia's pass survives");
        // Sepia's slot is params[1].x; its chain position is 1.
        assert_eq!(chain.passes[0].params[1].x, 1.0);
        assert_eq!(chain.passes[0].wire_index, 1);

        let warns: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(7))
            .collect();
        assert_eq!(warns.len(), 1, "{warns:?}");
        assert_eq!(warns[0].kind, "filterUnknown");
        assert_eq!(warns[0].value, "nope");
    }

    /// Bad params (a non-px blur radius) warn (`filterParams`) and skip the
    /// entry; a chain with no valid entries attaches no chain at all — but the
    /// node stays promoted.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn bad_params_entry_skips_and_warns() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                8,
                json!({ "style": { "filter": { "name": "blur", "params": { "radius": "50%" } } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 8);
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "stays promoted (promotion reads the wire chain)"
        );
        assert!(
            app.world().get::<ResolvedFilterChain>(e).is_none(),
            "all entries invalid → no filter machinery"
        );

        let warns: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(8))
            .collect();
        assert_eq!(warns.len(), 1, "{warns:?}");
        assert_eq!(warns[0].kind, "filterParams");
        assert!(warns[0].message.contains("px"), "{}", warns[0].message);
    }

    /// A blur chain resolves to two passes sharing `wire_index` 0; a scale
    /// factor ≠ 1 (set on the node's `ComputedNode`) rewrites the packed
    /// `Length` slots and the outset to physical px and re-resolves on change.
    #[test]
    fn blur_chain_rewrites_length_slots_by_scale_factor() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": [
                        { "name": "blur", "params": { "radius": 4 } },
                        { "name": "grayscale" }
                    ]
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        {
            let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
            assert_eq!(chain.passes.len(), 3, "blur H + blur V + grayscale");
            let wire: Vec<u8> = chain.passes.iter().map(|p| p.wire_index).collect();
            assert_eq!(wire, [0, 0, 1]);
            assert_eq!(chain.passes[0].params[0].x, 4.0, "radius at scale 1");
            assert_eq!(chain.passes[1].params[0].x, 4.0);
            assert_eq!(chain.outset_px, 12, "3 radii, physical px");
        }

        // A scale-factor change (per-entity, via `ComputedNode`) forces a
        // re-resolve even with no style delta: Length slots and the outset
        // are physical now.
        app.world_mut()
            .get_mut::<ComputedNode>(e)
            .expect("computed node")
            .inverse_scale_factor = 0.5;
        drain_dirt(&mut app);
        app.update();
        let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
        assert_eq!(chain.scale, 2.0);
        assert_eq!(chain.version, 2);
        assert_eq!(chain.passes[0].params[0].x, 8.0, "radius rewritten");
        assert_eq!(chain.passes[1].params[0].x, 8.0);
        // Direction components are not Length slots — untouched.
        assert_eq!(chain.passes[0].params[0].y, 1.0);
        assert_eq!(chain.passes[1].params[0].z, 1.0);
        // Grayscale has no Length slot — untouched.
        assert_eq!(chain.passes[2].params[0].w, 1.0);
        assert_eq!(chain.outset_px, 24, "logical 12 × scale 2");
        assert!(
            app.world()
                .resource::<LayerContentDirt>()
                .composite_only
                .contains(&e)
        );
    }

    /// Unsetting the filter style demotes the node AND removes the resolved
    /// chain (the demote arm's cleanup).
    #[test]
    fn unset_filter_demotes_and_removes_chain() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "filter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<ResolvedFilterChain>(e).is_some());

        ops_tx
            .send(vec![update(1, json!({}), &["filter"])])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(
            app.world().get::<ResolvedFilterChain>(e).is_none(),
            "chain removed on demote"
        );
        assert!(
            app.world().get::<FilterInput>(e).is_none(),
            "input mirrors the (now unset) style"
        );
    }

    /// A filter on a node that still has `opacity` keeps it promoted when the
    /// filter unsets — the stale resolved chain must still be cleaned up.
    #[test]
    fn unset_filter_on_still_promoted_node_removes_chain() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![
                create(
                    1,
                    json!({ "style": { "filter": { "name": "grayscale" }, "opacity": 0.5 } }),
                ),
                create(2, json!({})),
                Op::Append {
                    parent: 1,
                    child: 2,
                },
            ])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<ResolvedFilterChain>(e).is_some());

        ops_tx
            .send(vec![update(1, json!({}), &["filter"])])
            .unwrap();
        app.update();
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "opacity keeps it promoted"
        );
        assert!(
            app.world().get::<ResolvedFilterChain>(e).is_none(),
            "stale chain cleaned up"
        );
    }

    /// Op-driven negative: a `<text>` element created WITH a filter style is
    /// seeded/evaluated but ineligible — never promoted, never resolved.
    #[test]
    fn filtered_text_element_stays_unpromoted_and_unresolved() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create_kind(
                1,
                "text",
                json!({ "style": { "filter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "ineligible");
        assert!(app.world().get::<ResolvedFilterChain>(e).is_none());
    }

    // -- filter transition strategy ------------------------------------------

    fn wire(names: &[&str]) -> FilterChain {
        FilterChain(
            names
                .iter()
                .map(|n| FilterUse {
                    name: (*n).into(),
                    params: Map::new(),
                })
                .collect(),
        )
    }

    fn builtin_registry() -> FilterRegistry {
        let mut r = FilterRegistry::default();
        r.register_builtins();
        r
    }

    /// Same names, same order, same length → `Matched`, regardless of params
    /// and of whether the names are registered.
    #[test]
    fn classify_same_names_is_matched() {
        use FilterStrategy::Matched;
        let r = builtin_registry();
        assert_eq!(
            classify_filter_transition(
                &wire(&["blur", "sepia"]),
                &wire(&["blur", "sepia"]),
                Some(&r)
            ),
            Matched
        );
        // A custom (even unregistered) name still matches itself.
        assert_eq!(
            classify_filter_transition(&wire(&["glow"]), &wire(&["glow"]), Some(&r)),
            Matched
        );
    }

    /// Any mismatch involving a filter without an identity (customs, unknown
    /// names), a non-prefix pair, or a missing registry → `Discrete`.
    #[test]
    fn classify_mismatch_without_identity_is_discrete() {
        use FilterStrategy::Discrete;
        let r = builtin_registry();
        // "glow" has no identity (not registered) → no extension.
        assert_eq!(
            classify_filter_transition(&wire(&[]), &wire(&["glow"]), Some(&r)),
            Discrete
        );
        assert_eq!(
            classify_filter_transition(&wire(&["glow"]), &wire(&["glow", "blur"]), Some(&r)),
            Discrete
        );
        // Same length, different names: neither matched nor an extension.
        assert_eq!(
            classify_filter_transition(&wire(&["sepia"]), &wire(&["blur"]), Some(&r)),
            Discrete
        );
        // Built-ins but NOT a prefix: position-wise alignment is impossible.
        assert_eq!(
            classify_filter_transition(&wire(&["sepia"]), &wire(&["blur", "sepia"]), Some(&r)),
            Discrete
        );
        // No registry in hand (asset-free world): extension unavailable.
        assert_eq!(
            classify_filter_transition(&wire(&[]), &wire(&["blur"]), None),
            Discrete
        );
    }

    /// Unequal-length built-in-only prefix pairs → `Extended`, both growing
    /// and shrinking.
    #[test]
    fn classify_builtin_prefix_extension_is_extended() {
        use FilterStrategy::Extended;
        let r = builtin_registry();
        assert_eq!(
            classify_filter_transition(&wire(&[]), &wire(&["blur"]), Some(&r)),
            Extended
        );
        assert_eq!(
            classify_filter_transition(&wire(&["blur"]), &wire(&["blur", "sepia"]), Some(&r)),
            Extended
        );
        // Shrinking is symmetric.
        assert_eq!(
            classify_filter_transition(&wire(&["blur", "sepia"]), &wire(&["blur"]), Some(&r)),
            Extended
        );
    }

    /// Every built-in carries a TRUE identity — for grayscale/sepia/invert
    /// that is `0`, NOT their CSS shorthand default of `1` — and it resolves
    /// through the normal registry path to an identity packing.
    #[test]
    fn builtin_identity_params_are_true_identities() {
        let r = builtin_registry();
        let amount = |name: &str| (r.entries[name].identity)().unwrap()["amount"].clone();
        assert_eq!(amount("brightness"), json!(1.0));
        assert_eq!(amount("contrast"), json!(1.0));
        assert_eq!(amount("saturate"), json!(1.0));
        assert_eq!(amount("grayscale"), json!(0.0));
        assert_eq!(amount("sepia"), json!(0.0));
        assert_eq!(amount("invert"), json!(0.0));
        assert_eq!(
            (r.entries["blur"].identity)().unwrap()["radius"],
            json!(0.0)
        );
        assert_eq!(
            (r.entries["hueRotate"].identity)().unwrap()["angle"],
            json!(0.0)
        );

        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes =
            (r.entries["grayscale"].resolve)(&(r.entries["grayscale"].identity)().unwrap(), assets)
                .expect("identity resolves");
        assert_eq!(passes[0].params[0].w, 0.0, "identity packing, no effect");
    }

    /// `Extended` pads the SHORTER side at the END with identity passes of
    /// the longer chain's trailing entries — start-side when growing (fade
    /// in), target-side when shrinking (fade out) — and `settle` is always
    /// the resolver's unpadded target output.
    #[test]
    fn plan_extends_shorter_side_with_trailing_identity_passes() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let r = builtin_registry();

        let from = wire(&["blur"]);
        let to = wire(&["blur", "sepia"]);
        // Resolver-shaped pass lists: blur → two passes (wire 0), sepia → one
        // (wire 1).
        let blur = (r.entries["blur"].resolve)(&json!({ "radius": 4 }), assets).unwrap();
        let mut sepia = (r.entries["sepia"].resolve)(&json!({ "amount": 0.5 }), assets).unwrap();
        sepia[0].wire_index = 1;
        let short_passes = blur.clone();
        let mut long_passes = blur.clone();
        long_passes.extend(sepia);

        // Growing: the START side pads.
        let ease = plan_filter_ease(
            &from,
            &to,
            short_passes.clone(),
            long_passes.clone(),
            Some(&r),
            Some(assets),
            1.0,
        );
        let FilterEase::Aligned {
            start,
            target,
            settle,
        } = ease
        else {
            panic!("expected aligned");
        };
        assert_eq!(target, long_passes);
        assert_eq!(settle, long_passes);
        assert_eq!(start.len(), 3, "start padded at the end");
        assert_eq!(start[..2], short_passes[..], "existing passes untouched");
        assert_eq!(
            start[2].wire_index, 1,
            "pad sits at the longer chain's position"
        );
        assert_eq!(start[2].layout, long_passes[2].layout);
        assert_eq!(start[2].shader, long_passes[2].shader);
        // Identity sepia: amount 0 — NOT the shorthand default of 1.
        assert_eq!(start[2].params[1].x, 0.0);

        // Shrinking: the TARGET side pads; completion stays unpadded.
        let ease = plan_filter_ease(
            &to,
            &from,
            long_passes.clone(),
            short_passes.clone(),
            Some(&r),
            Some(assets),
            1.0,
        );
        let FilterEase::Aligned {
            start,
            target,
            settle,
        } = ease
        else {
            panic!("expected aligned");
        };
        assert_eq!(start, long_passes);
        assert_eq!(settle, short_passes, "settle is the resolver's own output");
        assert_eq!(target.len(), 3);
        assert_eq!(target[..2], short_passes[..]);
        assert_eq!(target[2].wire_index, 1);
        assert_eq!(target[2].params[1].x, 0.0, "sepia fades out to identity");
    }

    /// The defensive alignment check also requires matching shaders: a
    /// `Matched` wire pair whose pass lists carry different shaders per index
    /// (a custom resolver may swap shaders by params) falls back to the
    /// documented discrete swap instead of rendering lerped params through
    /// the wrong pass mid-ease.
    #[test]
    fn plan_mismatched_shaders_fall_back_to_discrete() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let r = builtin_registry();
        // Same single-name chain on both sides → `Matched` classification.
        let chain = wire(&["glow"]);

        let start = (r.entries["grayscale"].resolve)(&json!({}), assets).unwrap();
        let mut target = start.clone();
        target[0].shader = <BlurParams as ReactFilter>::shader(assets);
        assert_ne!(start[0].shader, target[0].shader);
        assert_eq!(start[0].layout, target[0].layout);
        assert_eq!(start[0].params.len(), target[0].params.len());

        let ease = plan_filter_ease(
            &chain,
            &chain,
            start.clone(),
            target.clone(),
            Some(&r),
            Some(assets),
            1.0,
        );
        let FilterEase::Discrete {
            start: s,
            target: t,
        } = ease
        else {
            panic!("expected discrete fallback on shader mismatch");
        };
        assert_eq!(s, start);
        assert_eq!(t, target);

        // Control: identical shaders (and layouts/params) stay aligned.
        let ease = plan_filter_ease(
            &chain,
            &chain,
            start.clone(),
            start.clone(),
            Some(&r),
            Some(assets),
            1.0,
        );
        assert!(matches!(ease, FilterEase::Aligned { .. }));
    }

    // -- whole-value filter transitions (headless, schedule-driven) ----------

    /// [`resolve_app`] plus the transition engine: the interaction restyle
    /// (`apply_interaction_styles`, the last `FilterInput` writer) and
    /// `drive_transitions` run after [`resolve_filter_chains`]'s inputs in
    /// the plugin's ordering, with `TimePlugin` disabled in favor of a
    /// manually advanced `Time` so eases step deterministically.
    fn ease_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
        let mut app = App::new();
        app.add_plugins((
            MinimalPlugins.build().disable::<bevy::time::TimePlugin>(),
            AssetPlugin::default(),
        ));
        app.insert_resource(Time::<()>::default());
        app.init_asset::<Shader>()
            .register_asset_loader(bevy::shader::ShaderLoader);
        crate::plugin::register_layer_shader_assets(&mut app);
        app.init_asset::<Image>();
        app.init_asset::<bevy::image::TextureAtlasLayout>();
        app.init_resource::<crate::plugin::Fonts>();
        app.init_resource::<crate::reconcile::OpApplyStats>();
        app.init_resource::<crate::ui_map::AtlasLayoutCache>();
        app.init_resource::<crate::layer::LayersRegistry>();
        app.init_resource::<crate::layer::LayerMembership>();
        app.init_resource::<LayerContentDirt>();
        register_builtin_filters(&mut app);

        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        std::mem::forget(out_rx);
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_systems(
            Update,
            (
                crate::reconcile::apply_js_ops,
                crate::layer::evaluate_layer_promotions.after(crate::reconcile::apply_js_ops),
                crate::reconcile::apply_interaction_styles
                    .after(crate::layer::evaluate_layer_promotions),
                resolve_filter_chains.after(crate::reconcile::apply_interaction_styles),
                crate::transition::drive_transitions.after(resolve_filter_chains),
            ),
        );
        (app, ops_tx)
    }

    /// Advance the manual clock and run one frame.
    fn tick(app: &mut App, secs: f32) {
        app.world_mut()
            .resource_mut::<Time>()
            .advance_by(std::time::Duration::from_secs_f32(secs));
        app.update();
    }

    /// Matched-chain ease: a grayscale amount 0→1 delta (filter-only — the
    /// TRANSITION dirty group is never touched) eases the packed param each
    /// frame with a version bump + composite-only dirt per easing frame,
    /// settles EXACTLY on the resolver's own output, and stops churning after
    /// settle (the stage-interplay scar test).
    #[test]
    fn filter_transition_eases_matched_params_and_settles_exactly() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": { "name": "grayscale", "params": { "amount": 0.0 } },
                    "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                } }),
            )])
            .unwrap();
        app.update(); // apply + resolve + seed the transition state — no mount ease
        let e = entity_of(&app, 1);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].w,
            0.0
        );
        drain_dirt(&mut app);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale", "params": { "amount": 1.0 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.25);
        let (mut last_w, mut last_version) = {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            let w = chain.passes[0].params[0].w;
            assert!(w > 0.0 && w < 1.0, "strictly between endpoints: {w}");
            (w, chain.version)
        };
        // Each easing frame bumps the version, moves the value, and pushes
        // composite-only dirt — never capture dirt.
        for _ in 0..2 {
            drain_dirt(&mut app);
            tick(&mut app, 0.25);
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            assert!(chain.version > last_version, "easing frame bumps version");
            let w = chain.passes[0].params[0].w;
            assert!(w > last_w && w < 1.0, "monotone ease: {last_w} → {w}");
            (last_w, last_version) = (w, chain.version);
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "{dirt:?}");
        }

        // Finish: the settle write is the resolver's own output, bit-exact.
        tick(&mut app, 0.5);
        let settled_version = {
            let world = app.world();
            let chain = world.get::<ResolvedFilterChain>(e).unwrap();
            let expected = (world.resource::<FilterRegistry>().entries["grayscale"].resolve)(
                &json!({ "amount": 1.0 }),
                world.resource::<AssetServer>(),
            )
            .unwrap();
            assert_eq!(chain.passes, expected, "settles on the resolver's output");
            chain.version
        };
        // Extra frames: no version churn, no dirt — the two writers agree.
        drain_dirt(&mut app);
        tick(&mut app, 0.25);
        tick(&mut app, 0.25);
        let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
        assert_eq!(chain.version, settled_version, "settled: no more churn");
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(!dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "{dirt:?}");
    }

    /// Mid-ease retarget — the state-owned-current mechanism's whole point:
    /// grayscale eases 0→1; at the midpoint we retarget to 0.25. The new
    /// ease must start FROM the channel's own last write (≈0.5) — not from
    /// the old target (1.0) and not from the resolver's freshly snapped
    /// 0.25 — then ease down to 0.25, settle bit-exact on the resolver's own
    /// output, and go version-quiet.
    #[test]
    fn filter_transition_mid_ease_retarget_starts_from_current() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": { "name": "grayscale", "params": { "amount": 0.0 } },
                    "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);

        // Ease 0 → 1 and advance to the midpoint.
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale", "params": { "amount": 1.0 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.5);
        let mid = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].w;
        assert!(
            (mid - 0.5).abs() < 1e-3,
            "midpoint expected ~0.5, got {mid}"
        );

        // Retarget to 0.25 mid-ease. The resolver snaps the component to
        // 0.25 this same frame; the channel must re-ease from its own
        // current (~0.5), overriding the snap.
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale", "params": { "amount": 0.25 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.1);
        let w = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].w;
        // 10% along a linear 0.5 → 0.25 ease: 0.475. Starting from the old
        // target (1.0) would read 0.925; adopting the resolver's snap would
        // read a flat 0.25.
        assert!(
            (w - 0.475).abs() < 1e-3,
            "new ease starts from current: expected ~0.475, got {w}"
        );

        // Still easing monotonically down toward 0.25.
        tick(&mut app, 0.4);
        let w2 = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].w;
        assert!(w2 < w && w2 > 0.25, "easing down: {w} → {w2}");

        // Settle bit-exact on the resolver's own output, then go quiet.
        tick(&mut app, 0.6);
        let settled_version = {
            let world = app.world();
            let chain = world.get::<ResolvedFilterChain>(e).unwrap();
            let expected = (world.resource::<FilterRegistry>().entries["grayscale"].resolve)(
                &json!({ "amount": 0.25 }),
                world.resource::<AssetServer>(),
            )
            .unwrap();
            assert_eq!(chain.passes, expected, "settles on the resolver's output");
            chain.version
        };
        tick(&mut app, 0.25);
        tick(&mut app, 0.25);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().version,
            settled_version,
            "settled: no more churn"
        );
    }

    /// The 90% case: an (opacity-)promoted node gains a blur — chain [] →
    /// [blur r=8] via a base-style delta. Extended strategy: the radius fades
    /// IN from identity 0 instead of popping; every easing frame is
    /// composite-only dirt, the capture is NEVER dirtied.
    #[test]
    fn filter_transition_fades_in_added_blur() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![
                create(
                    1,
                    json!({ "style": {
                        "opacity": 0.5,
                        "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                    } }),
                ),
                create(2, json!({})),
                Op::Append {
                    parent: 1,
                    child: 2,
                },
            ])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "promoted via opacity"
        );
        assert!(app.world().get::<ResolvedFilterChain>(e).is_none());
        drain_dirt(&mut app);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "blur", "params": { "radius": 8 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.5);
        let mid = {
            let chain = app
                .world()
                .get::<ResolvedFilterChain>(e)
                .expect("chain resolved");
            assert_eq!(chain.passes.len(), 2, "blur H + V");
            let r = chain.passes[0].params[0].x;
            assert!(r > 0.0 && r < 8.0, "radius eases 0→8, got {r}");
            assert_eq!(chain.passes[1].params[0].x, r, "both directions agree");
            // Direction components ride along untouched.
            assert_eq!(chain.passes[0].params[0].y, 1.0);
            assert_eq!(chain.passes[1].params[0].z, 1.0);
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "capture never dirtied: {dirt:?}");
            r
        };
        drain_dirt(&mut app);
        tick(&mut app, 0.25);
        {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            let r = chain.passes[0].params[0].x;
            assert!(r > mid && r < 8.0, "still easing: {mid} → {r}");
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "capture never dirtied: {dirt:?}");
        }

        // Settle exactly on the resolver's output for the target chain.
        tick(&mut app, 0.5);
        let world = app.world();
        let chain = world.get::<ResolvedFilterChain>(e).unwrap();
        let expected = (world.resource::<FilterRegistry>().entries["blur"].resolve)(
            &json!({ "radius": 8 }),
            world.resource::<AssetServer>(),
        )
        .unwrap();
        assert_eq!(chain.passes, expected);
        assert_eq!(chain.passes[0].params[0].x, 8.0);
    }

    /// The overlay-lift payoff — the hover-blur fade, end to end through the real
    /// interaction path: base `blur radius 0` + `hoverStyle` `radius 8` +
    /// `transition.filter`. The node promotes EAGERLY at creation (variant
    /// presence union — no first-hover hitch), an `Interaction` flip makes
    /// [`crate::reconcile::apply_interaction_styles`] re-stamp `FilterInput`
    /// with the merged chain, and the transition eases the radius 0→8
    /// (matched strategy: same single-name blur chain), then back 8→0 on
    /// hover-out from wherever the ease currently is.
    #[test]
    fn hover_filter_eases_through_interaction_restyle() {
        use bevy::ui::Interaction;

        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({
                    "style": {
                        "filter": { "name": "blur", "params": { "radius": 0.0 } },
                        "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                    },
                    "hoverStyle": { "filter": { "name": "blur", "params": { "radius": 8.0 } } },
                }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        // Promoted from creation — before any hover — and resolved at the
        // base radius. The variants also stamped an `Interaction`.
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "hover-filter node promotes eagerly"
        );
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].x,
            0.0
        );
        assert_eq!(app.world().get::<Interaction>(e), Some(&Interaction::None));
        drain_dirt(&mut app);

        // Hover in: the interaction restyle merges base+hover and re-stamps
        // `FilterInput` with radius 8; the ease starts from 0.
        *app.world_mut()
            .entity_mut(e)
            .get_mut::<Interaction>()
            .unwrap() = Interaction::Hovered;
        tick(&mut app, 0.25);
        let mid = {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            assert_eq!(chain.passes.len(), 2, "matched blur chain: H + V");
            let r = chain.passes[0].params[0].x;
            assert!(r > 0.0 && r < 8.0, "radius eases 0→8, got {r}");
            assert_eq!(chain.passes[1].params[0].x, r, "both directions agree");
            // Still promoted — interaction never flips promotion. (The flip
            // frame itself MAY carry capture dirt: the interaction restyle is
            // a conservative full re-apply, since a variant can change any
            // painted style.)
            assert!(app.world().get::<PromotedLayer>(e).is_some());
            r
        };
        // Pure easing frames after the flip are composite-only — the capture
        // stays clean while the blur fades.
        drain_dirt(&mut app);
        tick(&mut app, 0.25);
        let later = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].x;
        assert!(later > mid && later < 8.0, "monotone ease: {mid} → {later}");
        {
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "capture never dirtied: {dirt:?}");
        }

        // Settle bit-exact on the resolver's output for the hover chain.
        tick(&mut app, 0.6);
        {
            let world = app.world();
            let chain = world.get::<ResolvedFilterChain>(e).unwrap();
            let expected = (world.resource::<FilterRegistry>().entries["blur"].resolve)(
                &json!({ "radius": 8.0 }),
                world.resource::<AssetServer>(),
            )
            .unwrap();
            assert_eq!(chain.passes, expected, "settles on the resolver's output");
        }

        // Hover out: the merged style falls back to the base chain and the
        // radius eases back down from 8 — no snap.
        *app.world_mut()
            .entity_mut(e)
            .get_mut::<Interaction>()
            .unwrap() = Interaction::None;
        tick(&mut app, 0.25);
        let down = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].x;
        assert!(down > 0.0 && down < 8.0, "eases back down, got {down}");
        tick(&mut app, 1.0);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].x,
            0.0,
            "settled back on the base radius"
        );
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "still promoted after hover-out (presence union)"
        );
    }

    /// A mismatched pair involving a custom filter (no identity) swaps
    /// discretely: the OLD chain's passes hold until eased progress 0.5, then
    /// the new chain lands bit-exact, and the version stops churning after
    /// settle.
    #[test]
    fn filter_transition_discrete_swaps_at_midpoint() {
        use crate::react_filter;

        #[react_filter(shader = "shaders/step.wgsl")]
        struct StepParams {
            amount: f32,
        }

        let (mut app, ops_tx) = ease_app();
        app.world_mut()
            .resource_mut::<FilterRegistry>()
            .register::<StepParams>();

        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": { "name": "stepParams", "params": { "amount": 2.0 } },
                    "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        let start_passes = app
            .world()
            .get::<ResolvedFilterChain>(e)
            .unwrap()
            .passes
            .clone();
        assert_eq!(start_passes[0].params[0].x, 2.0);

        // Swap to a different-name chain (a custom is involved → discrete).
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale" } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.25);
        // Before the midpoint the OLD passes are re-written over the
        // resolver's snap.
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes,
            start_passes
        );
        tick(&mut app, 0.3); // eased progress 0.55: swapped
        let expected = {
            let world = app.world();
            (world.resource::<FilterRegistry>().entries["grayscale"].resolve)(
                &json!({}),
                world.resource::<AssetServer>(),
            )
            .unwrap()
        };
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes,
            expected
        );

        // Settle: same target, then quiet.
        tick(&mut app, 0.5);
        let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
        assert_eq!(chain.passes, expected);
        let v = chain.version;
        tick(&mut app, 0.25);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().version,
            v,
            "settled: no more churn"
        );
    }

    // -- per-param filter bindings (full pipeline) ---------------------------

    /// [`ease_app`] plus the animations engine, `AnimationSet::Apply` ordered
    /// after [`resolve_filter_chains`] like the plugin does — the ops →
    /// promotion → resolve → per-param-binding-apply pipeline.
    fn anim_app() -> (
        App,
        crossbeam_channel::Sender<Vec<Op>>,
        crossbeam_channel::Sender<crate::animations::AnimationCommand>,
    ) {
        let (mut app, ops_tx) = ease_app();
        let (anim_tx, anim_rx) = crossbeam_channel::unbounded();
        app.add_plugins(crate::animations::ReactUiAnimationsPlugin::new(anim_rx));
        app.configure_sets(
            Update,
            crate::animations::AnimationSet::Apply
                .after(resolve_filter_chains)
                .after(crate::reconcile::apply_js_ops),
        );
        (app, ops_tx, anim_tx)
    }

    /// A `filter[0].radius` binding drives blur through the real pipeline:
    /// the shared value lands (× scale 1) in BOTH expanded blur passes, each
    /// change is one version bump + composite-only dirt (the capture is
    /// never re-dirtied), and a settled value is version-quiet.
    #[test]
    fn filter_param_binding_follows_shared_value_through_pipeline() {
        let (mut app, ops_tx, anim_tx) = anim_app();
        anim_tx
            .send(crate::animations::AnimationCommand::Set { id: 1, value: 4.0 })
            .unwrap();
        ops_tx
            .send(vec![create(
                1,
                json!({
                    "style": { "filter": { "name": "blur", "params": { "radius": 10 } } },
                    "animated": { "filter[0].radius": { "type": "shared", "id": 1 } },
                }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            assert_eq!(chain.passes.len(), 2, "blur expands to H+V");
            assert_eq!(chain.passes[0].params[0].x, 4.0, "H radius driven");
            assert_eq!(chain.passes[1].params[0].x, 4.0, "V radius driven");
            assert_eq!(chain.version, 2, "resolve (1) + binding write (2)");
        }

        // A value change: one bump, composite-only dirt, both passes.
        drain_dirt(&mut app);
        anim_tx
            .send(crate::animations::AnimationCommand::Set { id: 1, value: 6.0 })
            .unwrap();
        tick(&mut app, 0.016);
        {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            assert_eq!(chain.passes[0].params[0].x, 6.0);
            assert_eq!(chain.passes[1].params[0].x, 6.0);
            assert_eq!(chain.version, 3);
        }
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "never capture dirt: {dirt:?}");

        // Settled: quiet.
        drain_dirt(&mut app);
        tick(&mut app, 0.016);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().version,
            3
        );
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(!dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "{dirt:?}");
    }

    /// The scar test: a filter style delta mid-animation rebuilds the chain
    /// (the resolver snaps the params to the new static style) — the binding
    /// re-asserts the driven value the same frame (`AnimationSet::Apply` runs
    /// after [`resolve_filter_chains`]), so the driven param never shows the
    /// static value on screen.
    #[test]
    fn filter_param_binding_reasserts_after_chain_rebuild() {
        let (mut app, ops_tx, anim_tx) = anim_app();
        anim_tx
            .send(crate::animations::AnimationCommand::Set { id: 1, value: 4.0 })
            .unwrap();
        ops_tx
            .send(vec![create(
                1,
                json!({
                    "style": { "filter": { "name": "blur", "params": { "radius": 10 } } },
                    "animated": { "filter[0].radius": { "type": "shared", "id": 1 } },
                }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        let v0 = app.world().get::<ResolvedFilterChain>(e).unwrap().version;

        // The delta rebuilds the chain (radius 12, and a real outset change
        // so the resolver's compare-before-write sees a difference even
        // against the driven params) …
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "blur", "params": { "radius": 12 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.016);
        let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
        // … and the binding re-asserted on top of the resolver's snap.
        assert_eq!(chain.passes[0].params[0].x, 4.0, "H re-asserted");
        assert_eq!(chain.passes[1].params[0].x, 4.0, "V re-asserted");
        assert_eq!(
            chain.outset_px, 36,
            "the rebuild itself landed (3 × radius 12)"
        );
        assert!(chain.version > v0, "resolver + binding both bumped");
    }
}

/// Tests for the `#[react_filter]` attribute macro (custom filters). Like the
/// other `react_*` attributes, the macro is exercised through `core` — its
/// expansion resolves `::bevy_react::` via `extern crate self`.
#[cfg(test)]
mod macro_tests {
    use std::f32::consts::PI;

    use bevy::math::Vec2;
    use serde_json::json;

    use super::tests::asset_app;
    use super::*;
    use crate::react_filter;

    /// The full custom-filter surface in one struct: every override argument
    /// plus a param of each straddle-relevant type.
    #[react_filter(
        name = "testGlow",
        shader = "shaders/glow.wgsl",
        outset = 4.0,
        time = true
    )]
    struct GlowParams {
        intensity: f32,
        direction: Vec2,
        tint: FilterColor,
        angle: Angle,
    }

    fn glow_json() -> serde_json::Value {
        json!({ "intensity": 1.5, "direction": [2, 3], "tint": "#ff0000", "angle": 180 })
    }

    fn from<T: serde::de::DeserializeOwned>(value: serde_json::Value) -> T {
        serde_json::from_value(value).expect("params decode")
    }

    #[test]
    fn macro_filter_exposes_name_time_and_outset() {
        assert_eq!(GlowParams::NAME, "testGlow");
        const { assert!(GlowParams::USES_TIME) };
        assert_eq!(from::<GlowParams>(glow_json()).outset(), Ok(4.0));
    }

    /// The macro never emits an identity — custom filters keep the trait
    /// default (`None`), so mismatched chains involving them swap discretely
    /// instead of identity-extending.
    #[test]
    fn macro_filter_has_no_identity() {
        assert!(GlowParams::identity_params().is_none());
        let mut registry = FilterRegistry::default();
        registry.register::<GlowParams>();
        assert!((registry.entries["testGlow"].identity)().is_none());
    }

    /// The generated `pack` fills vec4s contiguously in field declaration
    /// order, and a multi-component param that would straddle a vec4 boundary
    /// (tint: 4 components starting at comp 3) pads to the next vec4, leaving
    /// the gap zero — a slot never crosses a vec4 (`ParamSlot`'s rule).
    #[test]
    fn macro_pack_fills_declaration_order_and_pads_straddling_params() {
        let (params, layout) = from::<GlowParams>(glow_json()).pack();
        let slot = |name, kind, vec, comp, len| ParamSlot {
            name,
            kind,
            vec,
            comp,
            len,
        };
        assert_eq!(
            &*layout,
            &[
                slot("intensity", ValueKind::Scalar, 0, 0, 1),
                slot("direction", ValueKind::Scalar, 0, 1, 2),
                slot("tint", ValueKind::Color, 1, 0, 4),
                slot("angle", ValueKind::Angle, 2, 0, 1),
            ]
        );
        assert_eq!(params.len(), 3);
        // The straddle padding at params[0].w stays zero.
        assert_eq!(params[0], Vec4::new(1.5, 2.0, 3.0, 0.0));
        // Linear red, shader-ready.
        assert_eq!(params[1], Vec4::new(1.0, 0.0, 0.0, 1.0));
        // 180deg packs as radians.
        assert!((params[2].x - PI).abs() < 1e-5);
        assert_eq!((params[2].y, params[2].z, params[2].w), (0.0, 0.0, 0.0));
    }

    /// A layout with no straddle packs back-to-back with no padding:
    /// `[f32; 3]` + `f32` exactly fill vec0, `Vec4` fills vec1.
    #[test]
    fn macro_pack_exact_fit_does_not_pad() {
        #[react_filter(shader = "shaders/fill.wgsl")]
        struct FillParams {
            a: [f32; 3],
            b: f32,
            c: Vec4,
        }
        let (params, layout) =
            from::<FillParams>(json!({ "a": [1, 2, 3], "b": 4, "c": [5, 6, 7, 8] })).pack();
        let placed: Vec<_> = layout
            .iter()
            .map(|s| (s.name, s.vec, s.comp, s.len))
            .collect();
        assert_eq!(placed, vec![("a", 0, 0, 3), ("b", 0, 3, 1), ("c", 1, 0, 4)]);
        assert_eq!(
            params,
            vec![Vec4::new(1.0, 2.0, 3.0, 4.0), Vec4::new(5.0, 6.0, 7.0, 8.0)]
        );
    }

    /// Defaults: wire name = first-letter-lowercased ident, not time-driven,
    /// zero outset.
    #[test]
    fn macro_default_name_lowercases_first_letter() {
        #[react_filter(shader = "x.wgsl")]
        struct MyEffect {
            amount: f32,
        }
        assert_eq!(MyEffect::NAME, "myEffect");
        const { assert!(!MyEffect::USES_TIME) };
        assert_eq!(from::<MyEffect>(json!({ "amount": 1.0 })).outset(), Ok(0.0));
    }

    /// The macro adds `deny_unknown_fields`: an unknown param key rejects
    /// through the registry's resolve path, naming the filter.
    #[test]
    fn macro_unknown_param_key_rejects_through_registry() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<GlowParams>();
        let mut bad = glow_json();
        bad["bogus"] = json!(1);
        let err = (registry.entries["testGlow"].resolve)(&bad, assets)
            .expect_err("unknown key must reject");
        assert!(err.contains("testGlow"), "names the filter: {err}");
        assert!(err.contains("bogus"), "names the key: {err}");
    }

    /// End-to-end registration: `register::<GlowParams>()` bakes resolve/
    /// outset/uses_time; resolve yields one pass with the packed values and
    /// the plain-asset-path shader.
    #[test]
    fn macro_filter_registers_and_resolves_end_to_end() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<GlowParams>();
        let reg = &registry.entries["testGlow"];
        assert!(reg.uses_time);

        let passes = (reg.resolve)(&glow_json(), assets).expect("glow resolves");
        assert_eq!(passes.len(), 1);
        assert_eq!(passes[0].wire_index, 0);
        assert_eq!(passes[0].params.len(), 3);
        assert_eq!(passes[0].params[1], Vec4::new(1.0, 0.0, 0.0, 1.0));
        assert_eq!(
            passes[0]
                .shader
                .path()
                .expect("plain asset path")
                .to_string(),
            "shaders/glow.wgsl"
        );
        assert_eq!((reg.outset)(&glow_json()), Ok(4.0));
    }

    /// A `Length` param packs its logical-px value (the chain resolver
    /// rewrites it to physical px); a non-px unit rejects from BOTH generated
    /// entry points the chain resolver checks — `outset` and `resolve` —
    /// naming the filter and unit, mirroring blur.
    #[test]
    fn macro_length_param_packs_logical_px_and_rejects_non_px() {
        #[react_filter(shader = "shaders/wobble.wgsl")]
        struct WobbleParams {
            offset: Length,
            strength: f32,
        }
        let w = from::<WobbleParams>(json!({ "offset": 4, "strength": 2.0 }));
        let (params, layout) = w.pack();
        assert_eq!(layout[0].kind, ValueKind::Length);
        assert_eq!(params[0].x, 4.0, "logical px");
        assert_eq!(params[0].y, 2.0);
        assert_eq!(w.outset(), Ok(0.0));

        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let bad = from::<WobbleParams>(json!({ "offset": "50%", "strength": 1.0 }));
        let err = bad.outset().expect_err("non-px must reject outset");
        assert!(
            err.contains("wobbleParams") && err.contains("offset") && err.contains("%"),
            "names filter, param, and unit: {err}"
        );
        bad.resolve(assets).expect_err("non-px must reject resolve");
    }

    /// A param-less filter is legal: `pack()` yields zero vec4s and an empty
    /// layout, and it registers + resolves through the registry like any
    /// other filter.
    #[test]
    fn macro_zero_field_struct_packs_empty_and_resolves() {
        #[react_filter(shader = "z.wgsl")]
        struct NoParams {}
        let (params, layout) = from::<NoParams>(json!({})).pack();
        assert!(params.is_empty());
        assert!(layout.is_empty());

        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<NoParams>();
        let passes = (registry.entries["noParams"].resolve)(&json!({}), assets)
            .expect("param-less filter resolves");
        assert_eq!(passes.len(), 1);
        assert!(passes[0].params.is_empty());
    }

    /// Field names that mirror the generated code's own locals/arguments
    /// (`params`, `assets`) compile and pack normally — `self.`-qualified
    /// field access keeps user names from colliding with generated bindings.
    #[test]
    fn macro_field_names_do_not_shadow_generated_locals() {
        #[react_filter(shader = "s.wgsl")]
        struct Shadowy {
            params: f32,
            assets: f32,
        }
        let (params, layout) = from::<Shadowy>(json!({ "params": 1.0, "assets": 2.0 })).pack();
        let placed: Vec<_> = layout.iter().map(|s| (s.name, s.vec, s.comp)).collect();
        assert_eq!(placed, vec![("params", 0, 0), ("assets", 0, 1)]);
        assert_eq!(params, vec![Vec4::new(1.0, 2.0, 0.0, 0.0)]);
    }

    /// `add_react_filter` (the `ReactAppExt` extension) registers into the
    /// same `FilterRegistry` the chain resolver reads: the entry is baked and
    /// resolves end-to-end.
    #[test]
    fn add_react_filter_registers_and_resolves() {
        use crate::ReactAppExt;
        let mut app = asset_app();
        app.add_react_filter::<GlowParams>();
        let world = app.world();
        let assets = world.resource::<AssetServer>();
        let registry = world.resource::<FilterRegistry>();
        let reg = &registry.entries["testGlow"];
        assert!(reg.uses_time);
        let passes = (reg.resolve)(&glow_json(), assets).expect("glow resolves");
        assert_eq!(passes.len(), 1);
        assert_eq!(passes[0].params[1], Vec4::new(1.0, 0.0, 0.0, 1.0));
    }

    /// `register_entry` semantics through the App extension: the same type
    /// twice is a single entry (no-op), while a DIFFERENT type claiming the
    /// occupied name warns and replaces the previous entry.
    #[test]
    fn add_react_filter_dedups_same_type_and_replaces_different_type() {
        use crate::ReactAppExt;

        #[react_filter(name = "testGlow", shader = "other.wgsl")]
        struct ImposterGlow {
            amount: f32,
        }

        let mut app = App::new();
        app.add_react_filter::<GlowParams>();
        app.add_react_filter::<GlowParams>();
        {
            let registry = app.world().resource::<FilterRegistry>();
            assert_eq!(registry.entries.len(), 1);
            assert!(registry.entries["testGlow"].uses_time, "GlowParams' entry");
        }

        app.add_react_filter::<ImposterGlow>();
        let registry = app.world().resource::<FilterRegistry>();
        assert_eq!(registry.entries.len(), 1, "replaced, not appended");
        let reg = &registry.entries["testGlow"];
        assert!(!reg.uses_time, "ImposterGlow's entry (time defaults false)");
        assert_eq!((reg.ts_name)(), "ImposterGlow");
    }

    /// Registering a built-in type again through the App extension is a
    /// same-TypeId no-op, so a user's `register_bindings` can safely list
    /// built-ins alongside the plugin's own registration.
    #[test]
    fn add_react_filter_on_builtin_is_a_noop() {
        use crate::ReactAppExt;
        let mut app = App::new();
        register_builtin_filters(&mut app);
        app.add_react_filter::<BlurParams>();
        assert_eq!(app.world().resource::<FilterRegistry>().entries.len(), 8);
    }

    /// Registration bakes the TS-export slots with the event registry's exact
    /// split: the wire name is the entries key, `ts_name` names the params
    /// type, and `ts_collect` feeds the collector its declaration (with the
    /// macro's `#[ts(type)]` overrides applied).
    #[test]
    fn macro_filter_ts_slots_expose_params_type() {
        let mut registry = FilterRegistry::default();
        registry.register::<GlowParams>();
        let reg = &registry.entries["testGlow"];
        assert_eq!((reg.ts_name)(), "GlowParams");
        let mut c = TsCollector::default();
        (reg.ts_collect)(&mut c);
        let decl = &c.decls["GlowParams"];
        assert!(decl.contains("intensity: number"), "{decl}");
        assert!(decl.contains("direction: [number, number]"), "{decl}");
        // `FilterColor` inlines as its wire form (a CSS color string).
        assert!(decl.contains("tint: string"), "{decl}");
        assert!(decl.contains("angle: number | string"), "{decl}");
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
