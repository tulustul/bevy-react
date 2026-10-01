//! Wire types for the JSX `<svg>` element and its shape children, and their
//! decoders — the codecs of the attributes in [`crate::attrs`].
//!
//! Decoding follows the protocol module's rule: wire strings parse **once, at
//! the serde boundary**, and every malformed value **warns and drops the
//! attribute** (via [`bevy_react_core::protocol::decode_warn`]) — never
//! failing the batch. Warn kinds emitted here: `"viewBox"`, `"shapeNumber"`,
//! `"shapePath"`, `"shapePoints"`, `"shapePaint"`, `"shapeEnum"`,
//! `"shapeTransform"`, `"shapeTransition"` (each mirrored in the core
//! devtools' kind list and `js/src/devtools/warnings.ts`).

use std::fmt;

use bevy::color::Srgba;
use bevy::math::Vec2;
use serde::Deserialize;
use serde::de::{self, Deserializer, Visitor};

use bevy_react_core::protocol::{animatable::Animatable, decode_warn};
use bevy_react_core::raster::parse_css_color;

mod path;
#[cfg(test)]
mod tests;

pub use path::{PathData, PathSeg};

/// The assembled attributes of one SVG shape child (`<circle>`, `<rect>`,
/// `<line>`, `<polyline>`, `<polygon>`, `<path>`, `<g>`, …) — the shape's
/// registered attributes ([`crate::attrs`]) gathered into one value by the
/// shape writer, which the painter, the hit-tester, the transition channel
/// and the animation consumer all read. All-`Option`: absent means
/// "attribute not set", and the shape kind decides which fields it reads.
/// (Its `Deserialize` decodes the same flat object through the same
/// per-field decoders — the protocol tests' form.)
///
/// The **numeric** attrs (the crate's `NUMERIC_ATTRS` set) accept the inline
/// `{ animated: …, seed? }` wrapper ([`Animatable`], the style-field wire
/// form): the binding derives an
/// [`AnimatableProperty::ShapeAttr`](bevy_react_core::animations::protocol::AnimatableProperty)
/// entry and the animation driver writes the attr per frame. Consumers
/// (paint/hit/walk) read these fields via
/// [`static_or_seed`](bevy_react_core::protocol::animatable::AnimatableField::static_or_seed): an
/// animated attr with no `seed` reads as **absent** — the attr's own default
/// (geometry `0`, `strokeWidth` `1`, `opacity` `1`) — until the driver
/// writes; a `seed` renders as the static value in the wrapper's place.
/// Every other field (`d`, `points`, paints, keywords, `transform`) is not
/// animatable: a wrapper (or any object) arriving there warns with the
/// field's own kind and drops the field.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ShapeAttrs {
    // --- geometry (SVG user units) ---
    pub x: Option<Animatable<f32>>,
    pub y: Option<Animatable<f32>>,
    pub width: Option<Animatable<f32>>,
    pub height: Option<Animatable<f32>>,
    pub cx: Option<Animatable<f32>>,
    pub cy: Option<Animatable<f32>>,
    pub r: Option<Animatable<f32>>,
    pub rx: Option<Animatable<f32>>,
    pub ry: Option<Animatable<f32>>,
    pub x1: Option<Animatable<f32>>,
    pub y1: Option<Animatable<f32>>,
    pub x2: Option<Animatable<f32>>,
    pub y2: Option<Animatable<f32>>,
    /// `<polyline>`/`<polygon>` vertices. Wire: a flat number array
    /// `[x0, y0, x1, y1, …]`, paired here; an odd count warns and drops.
    #[serde(deserialize_with = "de_points")]
    pub points: Option<Vec<Vec2>>,
    /// `<path>` data, parsed into absolute segments (see [`PathData`]).
    #[serde(deserialize_with = "de_path")]
    pub d: Option<PathData>,

    // --- paint ---
    /// Interior paint. Absent falls back to the SVG default (black) — distinct
    /// from an explicit `"none"`.
    #[serde(deserialize_with = "de_paint")]
    pub fill: Option<ShapePaint>,
    /// Outline paint. Absent falls back to the SVG default (no stroke).
    #[serde(deserialize_with = "de_paint")]
    pub stroke: Option<ShapePaint>,
    pub stroke_width: Option<Animatable<f32>>,
    pub opacity: Option<Animatable<f32>>,
    #[serde(deserialize_with = "de_fill_rule")]
    pub fill_rule: Option<FillRuleKind>,
    #[serde(deserialize_with = "de_linecap")]
    pub stroke_linecap: Option<LinecapKind>,
    #[serde(deserialize_with = "de_linejoin")]
    pub stroke_linejoin: Option<LinejoinKind>,

    /// SVG transform list, resolved to a 2D affine at decode.
    #[serde(deserialize_with = "de_transform")]
    pub transform: Option<ShapeTransform>,

    /// Declarative easing for the **numeric** attrs: when a static numeric
    /// attr changes, the transition engine eases the painted value instead of
    /// snapping (see `crate::transition`'s shape channel). Config, not a
    /// value: deliberately **outside** `NUMERIC_ATTRS`, so the binding
    /// deriver / paint / hit never see it — but it participates in
    /// `PartialEq` like every field (a spec-only change is a real attrs
    /// change). Boxed: the spec's inline
    /// entry array (~0.7 KB) would otherwise bulk EVERY `ShapeAttrs` — and
    /// ride every clone (props cache, `SvgShape`, the op-apply clones) — for
    /// a field most shapes don't set.
    #[serde(deserialize_with = "de_transition")]
    pub transition: Option<Box<ShapeTransitionSpec>>,
}

/// Read accessor for one numeric attr of a [`ShapeAttrs`] (a
/// `NUMERIC_ATTRS` row).
pub(crate) type NumericAttrAccessor = fn(&ShapeAttrs) -> &Option<Animatable<f32>>;

/// Mutable accessor twin of [`NumericAttrAccessor`] (the row's third column),
/// for the animation apply stage's name→slot writes.
pub(crate) type NumericAttrAccessorMut = fn(&mut ShapeAttrs) -> &mut Option<Animatable<f32>>;

/// Wire name → field accessors (read, mut) for every **numeric** (and
/// therefore animatable) shape attr — the single source both for the binding
/// deriver (`crate::bindings_tests::derive_shape_bindings`, which emits
/// `AnimatableProperty::ShapeAttr { name }` per animated field) and for the
/// animation apply stage that resolves a bound name back to its field
/// ([`numeric_attr_mut`]). Wire names are the camelCase serde names
/// ([`ShapeAttrs`] is `rename_all = "camelCase"` — only `strokeWidth` differs
/// from its field).
pub(crate) const NUMERIC_ATTR_COUNT: usize = 15;
pub(crate) const NUMERIC_ATTRS: [(&str, NumericAttrAccessor, NumericAttrAccessorMut);
    NUMERIC_ATTR_COUNT] = [
    ("x", |a| &a.x, |a| &mut a.x),
    ("y", |a| &a.y, |a| &mut a.y),
    ("width", |a| &a.width, |a| &mut a.width),
    ("height", |a| &a.height, |a| &mut a.height),
    ("cx", |a| &a.cx, |a| &mut a.cx),
    ("cy", |a| &a.cy, |a| &mut a.cy),
    ("r", |a| &a.r, |a| &mut a.r),
    ("rx", |a| &a.rx, |a| &mut a.rx),
    ("ry", |a| &a.ry, |a| &mut a.ry),
    ("x1", |a| &a.x1, |a| &mut a.x1),
    ("y1", |a| &a.y1, |a| &mut a.y1),
    ("x2", |a| &a.x2, |a| &mut a.x2),
    ("y2", |a| &a.y2, |a| &mut a.y2),
    ("strokeWidth", |a| &a.stroke_width, |a| &mut a.stroke_width),
    ("opacity", |a| &a.opacity, |a| &mut a.opacity),
];

/// The mutable slot of one numeric attr by **wire name** (`NUMERIC_ATTRS`,
/// the one table — never a parallel name→field match), or `None` for a name
/// outside the numeric set (a stale binding; the apply stage warns).
pub(crate) fn numeric_attr_mut<'a>(
    attrs: &'a mut ShapeAttrs,
    name: &str,
) -> Option<&'a mut Option<Animatable<f32>>> {
    NUMERIC_ATTRS
        .iter()
        .find(|(n, _, _)| *n == name)
        .map(|(_, _, m)| m(attrs))
}

/// The read-only slot of one numeric attr by wire name — the read twin of
/// [`numeric_attr_mut`], for the apply stage's compare-before-write phase
/// (reading must not tick change detection).
pub(crate) fn numeric_attr<'a>(
    attrs: &'a ShapeAttrs,
    name: &str,
) -> Option<&'a Option<Animatable<f32>>> {
    NUMERIC_ATTRS
        .iter()
        .find(|(n, _, _)| *n == name)
        .map(|(_, r, _)| r(attrs))
}

/// Shorthand for a static numeric attr in test fixtures (struct-literal
/// `ShapeAttrs` construction predates the [`Animatable`] field type).
#[cfg(test)]
pub(crate) fn st(v: f32) -> Option<Animatable<f32>> {
    Some(Animatable::Static(v))
}

/// The shape `transition` spec: per-attr easing timing, keyed by the
/// `NUMERIC_ATTRS` wire names (shapes have no `style`, so the spec is the
/// shape's own `transition` attribute — explicit entries only, no
/// non-numeric channels).
/// Entries are stored positionally in `NUMERIC_ATTRS` order; reuse of
/// [`ChannelTransition`](bevy_react_core::transition::ChannelTransition) (the
/// style-transition timing type) is verbatim —
/// same wire shape (`duration`/`easing`/`delay`/springs), same driver.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct ShapeTransitionSpec {
    entries: [Option<bevy_react_core::transition::ChannelTransition>; NUMERIC_ATTR_COUNT],
}

impl ShapeTransitionSpec {
    /// The timing for one numeric attr by **wire name**; `None` when the
    /// spec has no entry for it (that attr snaps).
    pub fn for_attr(&self, name: &str) -> Option<&bevy_react_core::transition::ChannelTransition> {
        NUMERIC_ATTRS
            .iter()
            .position(|(n, _, _)| *n == name)
            .and_then(|i| self.entries[i].as_ref())
    }

    /// The timing at one `NUMERIC_ATTRS` index (the engine's positional
    /// twin of [`Self::for_attr`]).
    pub(crate) fn at(
        &self,
        index: usize,
    ) -> Option<&bevy_react_core::transition::ChannelTransition> {
        self.entries[index].as_ref()
    }
}

/// `deserialize_with` for [`ShapeAttrs::transition`]: an object keyed by
/// numeric attr wire names, each value a
/// [`ChannelTransition`](bevy_react_core::transition::ChannelTransition). Unknown /
/// non-numeric keys (nothing else is easeable) and malformed spec values
/// warn (`"shapeTransition"`) and drop **that key**; a non-object value
/// warns and drops the whole field. Decodes through [`serde_json::Value`]
/// (specs are tiny and rare — not a hot path) so no wire type can ever
/// hard-error the batch.
pub(crate) fn de_transition<'de, D: Deserializer<'de>>(
    d: D,
) -> Result<Option<Box<ShapeTransitionSpec>>, D::Error> {
    let Some(value) = Option::<serde_json::Value>::deserialize(d)? else {
        return Ok(None);
    };
    let serde_json::Value::Object(map) = value else {
        if !value.is_null() {
            decode_warn(
                "shapeTransition",
                &value.to_string(),
                "transition takes an object of per-attr timing specs; dropping",
            );
        }
        return Ok(None);
    };
    let mut spec = ShapeTransitionSpec::default();
    for (key, entry) in map {
        let Some(i) = NUMERIC_ATTRS.iter().position(|(n, _, _)| *n == key) else {
            decode_warn(
                "shapeTransition",
                &key,
                &format!("`{key}` is not a numeric shape attr (only those ease); dropping"),
            );
            continue;
        };
        match serde_json::from_value(entry) {
            Ok(timing) => spec.entries[i] = Some(timing),
            Err(e) => {
                decode_warn(
                    "shapeTransition",
                    &key,
                    &format!("invalid transition spec for `{key}`: {e}; dropping"),
                );
            }
        }
    }
    Ok(Some(Box::new(spec)))
}

/// A resolved SVG paint: the explicit `"none"` keyword (don't paint — the web
/// meaning of `fill="none"`, distinct from an *absent* paint, which uses the
/// SVG defaults: fill black, stroke none) or a CSS color.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ShapePaint {
    None,
    Color(Srgba),
}

/// `fill-rule` keyword.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FillRuleKind {
    NonZero,
    EvenOdd,
}

/// `stroke-linecap` keyword.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LinecapKind {
    Butt,
    Round,
    Square,
}

/// `stroke-linejoin` keyword.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LinejoinKind {
    Miter,
    Round,
    Bevel,
}

/// An SVG transform list resolved to a 2D affine, in SVG matrix order
/// `[a, b, c, d, e, f]`: `x' = a·x + c·y + e`, `y' = b·x + d·y + f`.
///
/// Stored as a plain matrix rather than a `tiny_skia::Transform` so the wire
/// type stays raster-agnostic (the protocol layer never names the raster
/// backend); the painter's `From<&ShapeTransform>` impl (in `svg::paint`)
/// converts via `Transform::from_row` — the same field order.
///
/// v1 scope: `translate(x [y])`, `scale(s [sy])`, `rotate(deg [cx cy])`,
/// composed in list order. Anything else (`matrix`/`skewX`/`skewY`, or a
/// parse error) warns with kind `"shapeTransform"` and drops the field.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ShapeTransform(pub [f32; 6]);

impl Default for ShapeTransform {
    fn default() -> Self {
        ShapeTransform([1.0, 0.0, 0.0, 1.0, 0.0, 0.0])
    }
}

const IDENTITY: [f64; 6] = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0];

/// Affine concat `a · b` (apply `b` first, then `a`) — transform-list order
/// is left-to-right, so the running matrix post-multiplies each new function.
fn mul(a: [f64; 6], b: [f64; 6]) -> [f64; 6] {
    [
        a[0] * b[0] + a[2] * b[1],
        a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3],
        a[1] * b[2] + a[3] * b[3],
        a[0] * b[4] + a[2] * b[5] + a[4],
        a[1] * b[4] + a[3] * b[5] + a[5],
    ]
}

impl ShapeTransform {
    /// Parse an SVG transform-list string into a resolved affine. `svgtypes`
    /// splits `rotate(a cx cy)` into translate·rotate·translate tokens, so
    /// the rotate-about-a-point form arrives here as supported primitives.
    pub(crate) fn parse(s: &str) -> Result<ShapeTransform, String> {
        use svgtypes::{TransformListParser, TransformListToken as T};
        let mut m = IDENTITY;
        for token in TransformListParser::from(s) {
            let token = token.map_err(|e| format!("invalid transform {s:?}: {e}"))?;
            let t = match token {
                T::Translate { tx, ty } => [1.0, 0.0, 0.0, 1.0, tx, ty],
                T::Scale { sx, sy } => [sx, 0.0, 0.0, sy, 0.0, 0.0],
                T::Rotate { angle } => {
                    let (sin, cos) = angle.to_radians().sin_cos();
                    [cos, sin, -sin, cos, 0.0, 0.0]
                }
                T::Matrix { .. } | T::SkewX { .. } | T::SkewY { .. } => {
                    return Err(format!(
                        "unsupported transform function in {s:?} \
                         (v1 supports translate/scale/rotate)"
                    ));
                }
            };
            m = mul(m, t);
        }
        Ok(ShapeTransform(m.map(|v| v as f32)))
    }
}

/// The `<svg>` element's `viewBox`: the user-unit rectangle mapped onto the
/// element's layout box.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ViewBox {
    pub min: Vec2,
    pub size: Vec2,
}

impl ViewBox {
    /// Parse the `"minX minY width height"` form (whitespace/comma separated,
    /// per the SVG spec). A non-positive size is invalid (`svgtypes` checks).
    pub(crate) fn parse(s: &str) -> Result<ViewBox, String> {
        let vb: svgtypes::ViewBox = s
            .parse()
            .map_err(|e| format!("invalid viewBox {s:?}: {e}"))?;
        Ok(ViewBox {
            min: Vec2::new(vb.x as f32, vb.y as f32),
            size: Vec2::new(vb.w as f32, vb.h as f32),
        })
    }
}

/// The `viewBox` attribute's decoder: warn-and-drop on a malformed string —
/// or on any non-string (`viewBox` is not animatable and takes no
/// `{ animated }` wrapper) — like every other wire decode; `null`/absent is
/// absent.
pub(crate) fn de_view_box<'de, D: Deserializer<'de>>(d: D) -> Result<Option<ViewBox>, D::Error> {
    Ok(match serde_json::Value::deserialize(d)? {
        serde_json::Value::String(s) => match ViewBox::parse(&s) {
            Ok(vb) => Some(vb),
            Err(e) => {
                decode_warn("viewBox", &s, &e);
                None
            }
        },
        serde_json::Value::Null => None,
        serde_json::Value::Object(_) => {
            decode_warn(
                "viewBox",
                "{…}",
                "`viewBox` takes a string \"minX minY width height\", not an object",
            );
            None
        }
        other => {
            decode_warn(
                "viewBox",
                &other.to_string(),
                "`viewBox` takes a string \"minX minY width height\"",
            );
            None
        }
    })
}

/// A numeric attribute's decoder: a number, or an `{ animated, seed? }`
/// wrapper ([`Animatable`]). Anything else warns (`shapeNumber`) and drops
/// the attribute — never failing the batch.
pub(crate) fn de_number<'de, D: Deserializer<'de>>(
    d: D,
) -> Result<Option<Animatable<f32>>, D::Error> {
    let value = serde_json::Value::deserialize(d)?;
    if value.is_null() {
        return Ok(None);
    }
    Ok(match Animatable::<f32>::deserialize(&value) {
        Ok(n) => Some(n),
        Err(e) => {
            decode_warn(
                "shapeNumber",
                &value.to_string(),
                &format!("expected a number or an {{ animated }} wrapper: {e}; dropping"),
            );
            None
        }
    })
}

impl ShapeAttrs {
    /// The `{ animated }` wrappers among the numeric attrs, by wire name
    /// (`NUMERIC_ATTRS`, the one wire-name table) — what the animation
    /// engine drives (each numeric attribute publishes its own binding —
    /// [`crate::attrs`]).
    pub fn animated_bindings(
        &self,
    ) -> Vec<(String, bevy_react_core::animations::protocol::Binding)> {
        NUMERIC_ATTRS
            .iter()
            .filter_map(|(name, field, _)| match field(self) {
                Some(Animatable::Animated(a)) => Some(((*name).to_string(), a.binding.clone())),
                _ => None,
            })
            .collect()
    }
}

/// Consume an unexpected JSON **object** on a non-animatable field — most
/// likely an `{ animated }` wrapper (only the numeric attrs accept those) —
/// warn with the field's own kind, and drop the field. Keeps the module's
/// never-fail-the-batch rule: without this arm the visitors would hard-error
/// on any object, aborting the whole op batch.
fn warn_object_dropped<'de, A: de::MapAccess<'de>>(
    map: A,
    kind: &'static str,
) -> Result<(), A::Error> {
    let v = serde_json::Value::deserialize(de::value::MapAccessDeserializer::new(map))?;
    let hint = if v.get("animated").is_some() {
        " (only numeric shape attrs accept { animated } bindings)"
    } else {
        ""
    };
    decode_warn(
        kind,
        &v.to_string(),
        &format!("unexpected object value{hint}; dropping"),
    );
    Ok(())
}

pub(crate) fn de_path<'de, D: Deserializer<'de>>(d: D) -> Result<Option<PathData>, D::Error> {
    struct V;
    impl<'de> Visitor<'de> for V {
        type Value = Option<PathData>;
        fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
            f.write_str("an SVG path data string")
        }
        fn visit_str<E: de::Error>(self, s: &str) -> Result<Self::Value, E> {
            Ok(match PathData::parse(s) {
                Ok(p) => Some(p),
                Err(e) => {
                    decode_warn("shapePath", s, &e);
                    None
                }
            })
        }
        fn visit_map<A: de::MapAccess<'de>>(self, map: A) -> Result<Self::Value, A::Error> {
            warn_object_dropped(map, "shapePath").map(|()| None)
        }
        fn visit_unit<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_none<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
    }
    d.deserialize_any(V)
}

pub(crate) fn de_points<'de, D: Deserializer<'de>>(d: D) -> Result<Option<Vec<Vec2>>, D::Error> {
    struct V;
    impl<'de> Visitor<'de> for V {
        type Value = Option<Vec<Vec2>>;
        fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
            f.write_str("a flat number array [x0, y0, x1, y1, …]")
        }
        fn visit_seq<A: de::SeqAccess<'de>>(self, mut seq: A) -> Result<Self::Value, A::Error> {
            let mut nums = Vec::with_capacity(seq.size_hint().unwrap_or(0));
            while let Some(n) = seq.next_element::<f32>()? {
                nums.push(n);
            }
            if nums.len() % 2 != 0 {
                decode_warn(
                    "shapePoints",
                    &format!("[{} numbers]", nums.len()),
                    &format!(
                        "points needs an even number of coordinates, got {}; dropping",
                        nums.len()
                    ),
                );
                return Ok(None);
            }
            Ok(Some(
                nums.as_chunks::<2>()
                    .0
                    .iter()
                    .map(|&[x, y]| Vec2::new(x, y))
                    .collect(),
            ))
        }
        fn visit_map<A: de::MapAccess<'de>>(self, map: A) -> Result<Self::Value, A::Error> {
            warn_object_dropped(map, "shapePoints").map(|()| None)
        }
        fn visit_unit<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_none<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
    }
    d.deserialize_any(V)
}

pub(crate) fn de_paint<'de, D: Deserializer<'de>>(d: D) -> Result<Option<ShapePaint>, D::Error> {
    struct V;
    impl<'de> Visitor<'de> for V {
        type Value = Option<ShapePaint>;
        fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
            f.write_str("a CSS color string or the keyword \"none\"")
        }
        fn visit_str<E: de::Error>(self, s: &str) -> Result<Self::Value, E> {
            if s == "none" {
                return Ok(Some(ShapePaint::None));
            }
            Ok(match parse_css_color(s) {
                Some(c) => Some(ShapePaint::Color(c)),
                None => {
                    decode_warn("shapePaint", s, &format!("unrecognized paint {s:?}"));
                    None
                }
            })
        }
        fn visit_map<A: de::MapAccess<'de>>(self, map: A) -> Result<Self::Value, A::Error> {
            warn_object_dropped(map, "shapePaint").map(|()| None)
        }
        fn visit_unit<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_none<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
    }
    d.deserialize_any(V)
}

pub(crate) fn de_transform<'de, D: Deserializer<'de>>(
    d: D,
) -> Result<Option<ShapeTransform>, D::Error> {
    struct V;
    impl<'de> Visitor<'de> for V {
        type Value = Option<ShapeTransform>;
        fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
            f.write_str("an SVG transform list string")
        }
        fn visit_str<E: de::Error>(self, s: &str) -> Result<Self::Value, E> {
            Ok(match ShapeTransform::parse(s) {
                Ok(t) => Some(t),
                Err(e) => {
                    decode_warn("shapeTransform", s, &e);
                    None
                }
            })
        }
        fn visit_map<A: de::MapAccess<'de>>(self, map: A) -> Result<Self::Value, A::Error> {
            warn_object_dropped(map, "shapeTransform").map(|()| None)
        }
        fn visit_unit<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_none<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
    }
    d.deserialize_any(V)
}

/// Keyword deserializers with the shared `"shapeEnum"` warn kind: an
/// unrecognized keyword warns and **drops the field** (unlike the style
/// `keyword_fields!`, which falls back to the bevy default — a shape enum has
/// no "bevy default" to fall to; absent means the SVG default).
macro_rules! shape_keywords {
    ($( fn $fn_name:ident($ty:ident) { $($kw:literal => $variant:ident),+ $(,)? } )+) => { $(
        pub(crate) fn $fn_name<'de, D: Deserializer<'de>>(d: D) -> Result<Option<$ty>, D::Error> {
            struct V;
            impl<'de> Visitor<'de> for V {
                type Value = Option<$ty>;
                fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                    f.write_str(concat!("a `", stringify!($ty), "` keyword"))
                }
                fn visit_str<E: de::Error>(self, s: &str) -> Result<Self::Value, E> {
                    Ok(match s {
                        $( $kw => Some(<$ty>::$variant), )+
                        _ => {
                            decode_warn(
                                "shapeEnum",
                                s,
                                &format!(
                                    concat!("unrecognized ", stringify!($ty), " keyword {:?}"),
                                    s
                                ),
                            );
                            None
                        }
                    })
                }
                fn visit_map<A: de::MapAccess<'de>>(self, map: A) -> Result<Self::Value, A::Error> {
                    warn_object_dropped(map, "shapeEnum").map(|()| None)
                }
                fn visit_unit<E: de::Error>(self) -> Result<Self::Value, E> {
                    Ok(None)
                }
                fn visit_none<E: de::Error>(self) -> Result<Self::Value, E> {
                    Ok(None)
                }
            }
            d.deserialize_any(V)
        }
    )+ };
}

shape_keywords! {
    fn de_fill_rule(FillRuleKind) {
        "nonzero" => NonZero, "evenodd" => EvenOdd,
    }
    fn de_linecap(LinecapKind) {
        "butt" => Butt, "round" => Round, "square" => Square,
    }
    fn de_linejoin(LinejoinKind) {
        "miter" => Miter, "round" => Round, "bevel" => Bevel,
    }
}
