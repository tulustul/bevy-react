//! Visual spec wire types: outline, shadows, line metrics, gradients,
//! per-side border colors, and corner radii.

use std::fmt;

use serde::Deserialize;
use serde::de::{self, Deserializer, MapAccess, Visitor};

use super::animatable::Animatable;
use super::decode_warn;
use super::units::{Angle, Length, Rect};

/// Outline drawn around (outside) the node's border box.
#[derive(Debug, Clone, PartialEq, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OutlineSpec {
    #[serde(default)]
    pub width: Option<Length>,
    #[serde(default)]
    pub offset: Option<Length>,
    #[serde(default)]
    pub color: Option<String>,
}

/// A single drop shadow.
#[derive(Debug, Clone, PartialEq, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BoxShadowSpec {
    #[serde(default)]
    pub color: Option<String>,
    #[serde(default)]
    pub x_offset: Option<Length>,
    #[serde(default)]
    pub y_offset: Option<Length>,
    #[serde(default)]
    pub spread_radius: Option<Length>,
    #[serde(default)]
    pub blur_radius: Option<Length>,
}

/// A `boxShadow` value: one shadow or a stacked list (CSS `box-shadow: a, b, …`).
/// `Many` comes first: serde decodes a struct from a sequence too, so an
/// all-defaults `BoxShadowSpec` would take `[]` as one black shadow.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(untagged)]
pub enum BoxShadowList {
    Many(Vec<BoxShadowSpec>),
    One(BoxShadowSpec),
}

/// Line height for a `<text>`. A bare number is a multiple of the font size
/// (`RelativeToFont`); a string carries a unit (`"20px"` absolute, `"1.5"` / `"1.5em"`
/// a multiple); `{ "px": n }` is an absolute pixel height (legacy object form).
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(untagged)]
pub enum LineHeightSpec {
    Relative(f32),
    Px { px: f32 },
    Str(String),
}

/// Letter spacing for a `<text>`. A bare number is logical pixels; a string carries
/// a unit (`"2px"`, `"0.1em"` for a font-size multiple, `"0.1rem"` for a root-size
/// one, or `"normal"`); `{ "rem": n }` is a multiple of the root size (legacy
/// object form).
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(untagged)]
pub enum LetterSpacingSpec {
    Px(f32),
    Rem { rem: f32 },
    Str(String),
}

/// A single text drop shadow. `offsetX`/`offsetY` are displacement in logical
/// pixels (absent → bevy's default of `4.0`); `color` defaults to bevy's
/// translucent black when unset.
#[derive(Debug, Clone, PartialEq, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TextShadowSpec {
    #[serde(default)]
    pub color: Option<String>,
    #[serde(default)]
    pub offset_x: Option<f32>,
    #[serde(default)]
    pub offset_y: Option<f32>,
}

/// A single color stop for a linear/radial gradient. `position` is where the
/// color sits along the gradient line (a [`Length`]); absent → auto-spaced.
/// `hint` is the `0.0..=1.0` interpolation midpoint between this stop and the
/// next (default `0.5`). Every leaf accepts an `{ animated }` wrapper.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradientStop {
    pub color: Animatable<String>,
    #[serde(default)]
    pub position: Option<Animatable<Length>>,
    #[serde(default)]
    pub hint: Option<Animatable<f32>>,
}

/// A single color stop for a conic gradient. `angle` is the stop's angle in
/// **degrees** (absent → auto-spaced); `hint` as in [`GradientStop`]. Every
/// leaf accepts an `{ animated }` wrapper.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AngularStop {
    pub color: Animatable<String>,
    #[serde(default)]
    pub angle: Option<Animatable<Angle>>,
    #[serde(default)]
    pub hint: Option<Animatable<f32>>,
}

/// Radial/conic gradient center, given as a named anchor (`"center"`, `"top"`,
/// `"topLeft"`, …). Arbitrary `Val`-offset centers are not yet supported.
pub type GradientPosition = String;

/// Color space the gradient interpolates in (`"oklab"` (default), `"oklch"`,
/// `"oklchLong"`, `"srgb"`, `"linearRgb"`, `"hsl"`, `"hslLong"`, `"hsv"`,
/// `"hsvLong"`, `"okhsl"`, `"okhslLong"`).
pub type ColorSpace = String;

/// The size/shape of a radial gradient: a keyword (`"closestSide"` |
/// `"farthestSide"` | `"closestCorner"` | `"farthestCorner"`, default
/// `closestCorner`), `{ circle: <Length> }`, or `{ ellipse: [<Length>,
/// <Length>] }` — `RadialShape` in `jsx.d.ts`. The externally tagged forms
/// this type decoded before (`{ keyword: "…" }`, `{ circle: { circle } }`,
/// `{ ellipse: { ellipse } }`) still decode. The circle/ellipse radii accept
/// `{ animated }` wrappers.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(from = "RadialShapeWire")]
pub enum RadialShapeSpec {
    Keyword(String),
    Circle { circle: Animatable<Length> },
    Ellipse { ellipse: [Animatable<Length>; 2] },
}

#[derive(Deserialize)]
#[serde(untagged)]
enum RadialShapeWire {
    Keyword(String),
    Circle { circle: Animatable<Length> },
    Ellipse { ellipse: [Animatable<Length>; 2] },
    Tagged(TaggedRadialShape),
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
enum TaggedRadialShape {
    Keyword(String),
    Circle { circle: Animatable<Length> },
    Ellipse { ellipse: [Animatable<Length>; 2] },
}

impl From<RadialShapeWire> for RadialShapeSpec {
    fn from(wire: RadialShapeWire) -> Self {
        use {RadialShapeWire as W, TaggedRadialShape as T};
        match wire {
            W::Keyword(k) | W::Tagged(T::Keyword(k)) => Self::Keyword(k),
            W::Circle { circle } | W::Tagged(T::Circle { circle }) => Self::Circle { circle },
            W::Ellipse { ellipse } | W::Tagged(T::Ellipse { ellipse }) => Self::Ellipse { ellipse },
        }
    }
}

#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinearGradientSpec {
    /// Gradient line angle (number = degrees, or a unit string; `0` = to top,
    /// increasing clockwise). Accepts an `{ animated }` wrapper.
    #[serde(default)]
    pub angle: Option<Animatable<Angle>>,
    #[serde(default)]
    pub stops: Vec<GradientStop>,
    #[serde(default)]
    pub color_space: Option<ColorSpace>,
}

#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RadialGradientSpec {
    #[serde(default)]
    pub position: Option<GradientPosition>,
    #[serde(default)]
    pub shape: Option<RadialShapeSpec>,
    #[serde(default)]
    pub stops: Vec<GradientStop>,
    #[serde(default)]
    pub color_space: Option<ColorSpace>,
}

#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConicGradientSpec {
    /// Start angle (number = degrees, or a unit string). Accepts an
    /// `{ animated }` wrapper.
    #[serde(default)]
    pub start: Option<Animatable<Angle>>,
    #[serde(default)]
    pub position: Option<GradientPosition>,
    #[serde(default)]
    pub stops: Vec<AngularStop>,
    #[serde(default)]
    pub color_space: Option<ColorSpace>,
}

/// One gradient, discriminated by its `type` field on the wire.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum GradientSpec {
    Linear(LinearGradientSpec),
    Radial(RadialGradientSpec),
    Conic(ConicGradientSpec),
}

/// A `backgroundGradient`/`borderGradient` value: one gradient or a layered list.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(untagged)]
pub enum GradientList {
    One(GradientSpec),
    Many(Vec<GradientSpec>),
}

/// Border color: a single CSS color applied to all four sides, or a
/// `{ top, right, bottom, left }` object setting sides individually. Omitted
/// sides decode to `None` (painted transparent — bevy's `BorderColor` default).
///
/// Unlike [`super::units::Rect`], a multi-value string (`"red green blue"`) is **not** accepted:
/// CSS color functions contain spaces (`rgb(1 2 3)`), so whitespace-splitting
/// would be ambiguous. Per-side colors go through the object form only.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct BorderColorSpec {
    pub top: Option<String>,
    pub right: Option<String>,
    pub bottom: Option<String>,
    pub left: Option<String>,
}

impl BorderColorSpec {
    /// One color on every side (the back-compat scalar form).
    fn uniform(s: String) -> Self {
        BorderColorSpec {
            top: Some(s.clone()),
            right: Some(s.clone()),
            bottom: Some(s.clone()),
            left: Some(s),
        }
    }
}

impl<'de> Deserialize<'de> for BorderColorSpec {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct BorderColorVisitor;
        impl<'de> Visitor<'de> for BorderColorVisitor {
            type Value = BorderColorSpec;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a CSS color string or a {top,right,bottom,left} object of colors")
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<BorderColorSpec, E> {
                Ok(BorderColorSpec::uniform(s.to_owned()))
            }
            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<BorderColorSpec, A::Error> {
                let mut spec = BorderColorSpec::default();
                while let Some(key) = map.next_key::<String>()? {
                    let v = map.next_value::<String>()?;
                    match key.as_str() {
                        "top" => spec.top = Some(v),
                        "right" => spec.right = Some(v),
                        "bottom" => spec.bottom = Some(v),
                        "left" => spec.left = Some(v),
                        // An unknown side key must not throw (that aborts the whole
                        // commit batch) — `v` is already consumed, so warn and skip.
                        _ => decode_warn(
                            "borderColor",
                            &key,
                            &format!(
                                "unknown borderColor side {key:?}; ignoring (expected top/right/bottom/left)"
                            ),
                        ),
                    }
                }
                Ok(spec)
            }
        }
        d.deserialize_any(BorderColorVisitor)
    }
}

/// The corners' radii: `x` alone for circular corners (the [`Rect`] sides
/// are the corners, CSS order), or `x` horizontal and `y` vertical for
/// elliptical ones. The transition engine's `borderRadius` value.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct CornerRadii {
    /// The radii of circular corners, or the horizontal radii when `y` is set.
    pub x: Rect,
    /// The vertical radii; `None` = circular corners.
    pub y: Option<Rect>,
}

impl From<Rect> for CornerRadii {
    fn from(x: Rect) -> Self {
        Self { x, y: None }
    }
}

/// A `borderRadius` value as a style stores it: any [`Rect`] form for
/// circular corners, or the CSS slash string (`"40px 10px / 10px 40px"`:
/// horizontal radii, then vertical) for elliptical ones. Read it through
/// [`Self::radii`].
///
/// Only the elliptical half is boxed: a circular value — what nearly every
/// styled node sets — is the size of a `Rect` and stays in the style store's
/// inline slot (`border_radius_stays_inline`).
#[derive(Debug, Clone, PartialEq)]
pub enum BorderRadiusSpec {
    Circular(Rect),
    /// `[horizontal, vertical]`.
    Elliptical(Box<[Rect; 2]>),
}

impl BorderRadiusSpec {
    pub fn radii(&self) -> CornerRadii {
        match self {
            Self::Circular(x) => (*x).into(),
            Self::Elliptical(xy) => CornerRadii {
                x: xy[0],
                y: Some(xy[1]),
            },
        }
    }
}

impl From<CornerRadii> for BorderRadiusSpec {
    fn from(radii: CornerRadii) -> Self {
        match radii.y {
            None => Self::Circular(radii.x),
            Some(y) => Self::Elliptical(Box::new([radii.x, y])),
        }
    }
}

impl From<Rect> for BorderRadiusSpec {
    fn from(rect: Rect) -> Self {
        Self::Circular(rect)
    }
}

impl<'de> Deserialize<'de> for BorderRadiusSpec {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        use de::IntoDeserializer;
        use de::value::MapAccessDeserializer;

        /// Every form goes to [`Rect`]'s own decoder (its fallbacks and
        /// `rect` warnings included); a string is split at the slash first,
        /// each half a rect shorthand of its own.
        struct RadiiVisitor;
        impl<'de> Visitor<'de> for RadiiVisitor {
            type Value = BorderRadiusSpec;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a rect, or a \"<horizontal radii> / <vertical radii>\" string")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<BorderRadiusSpec, E> {
                Rect::deserialize(v.into_deserializer()).map(Into::into)
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<BorderRadiusSpec, E> {
                Rect::deserialize(v.into_deserializer()).map(Into::into)
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<BorderRadiusSpec, E> {
                Rect::deserialize(v.into_deserializer()).map(Into::into)
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<BorderRadiusSpec, E> {
                let side =
                    |s: &str| -> Result<Rect, E> { Rect::deserialize(s.into_deserializer()) };
                Ok(match s.split_once('/') {
                    Some((x, y)) => BorderRadiusSpec::Elliptical(Box::new([side(x)?, side(y)?])),
                    None => side(s)?.into(),
                })
            }
            fn visit_map<A: MapAccess<'de>>(self, map: A) -> Result<BorderRadiusSpec, A::Error> {
                Rect::deserialize(MapAccessDeserializer::new(map)).map(Into::into)
            }
        }
        d.deserialize_any(RadiiVisitor)
    }
}

#[cfg(test)]
mod tests {
    use crate::protocol::animatable::AnimatableField;
    use crate::style::Style;
    use crate::style::props::{BORDER_COLOR, BORDER_RADIUS, WIDTH};

    /// `boxShadow: []` is no shadow, not one default (black) shadow.
    #[test]
    fn empty_box_shadow_list_is_no_shadow() {
        use super::BoxShadowList;
        let list = |v| serde_json::from_value::<BoxShadowList>(v).expect("decodes");
        assert_eq!(list(serde_json::json!([])), BoxShadowList::Many(vec![]));
        assert!(matches!(
            list(serde_json::json!({ "color": "red" })),
            BoxShadowList::One(_)
        ));
        assert!(matches!(
            list(serde_json::json!([{ "color": "red" }, {}])),
            BoxShadowList::Many(v) if v.len() == 2
        ));
    }

    /// `borderRadius`: a slash in the string form splits horizontal from
    /// vertical radii, each half a rect shorthand of its own; every form
    /// without one decodes exactly as the `Rect` it always was (circular).
    #[test]
    fn border_radius_decodes_the_slash_form() {
        use super::{BorderRadiusSpec, CornerRadii};
        use crate::protocol::units::{Length::*, Rect};
        let radii = |v: serde_json::Value| {
            serde_json::from_value::<BorderRadiusSpec>(v)
                .expect("decodes")
                .radii()
        };
        let rect = |v: serde_json::Value| serde_json::from_value::<Rect>(v).expect("decodes");

        let r = radii(serde_json::json!("10px 20px / 5px"));
        assert_eq!(r.x, rect(serde_json::json!("10px 20px")));
        assert_eq!(r.y, Some(rect(serde_json::json!(5))));
        assert_eq!((r.x.top, r.x.right), (Px(10.0), Px(20.0)));
        // Spaces around the slash are optional.
        assert_eq!(
            radii(serde_json::json!("50%/25%")),
            radii(serde_json::json!("50% / 25%"))
        );
        assert_eq!(
            radii(serde_json::json!("50%/25%")).y.map(|y| y.top),
            Some(Percent(25.0))
        );

        for v in [
            serde_json::json!(8),
            serde_json::json!(2.5),
            serde_json::json!("8px 16px"),
            serde_json::json!({ "top": 4 }),
            serde_json::json!({ "horizontal": 4 }),
        ] {
            assert_eq!(radii(v.clone()), CornerRadii::from(rect(v)));
        }
    }

    /// Through the style store and the `{ animated }` wrapper: the static
    /// value reads back elliptical, a wrapper's seed takes the slash too.
    #[test]
    fn border_radius_slash_decodes_through_the_style() {
        let s: Style = serde_json::from_str(r#"{ "borderRadius": "40px / 10px" }"#).unwrap();
        let radii = s.get(&BORDER_RADIUS).static_ref().expect("static").radii();
        assert!(radii.y.is_some());

        let s: Style = serde_json::from_value(serde_json::json!({
            "borderRadius": { "animated": { "id": 3 }, "seed": "40px / 10px" }
        }))
        .unwrap();
        let value = s.get(&BORDER_RADIUS).expect("present");
        assert!(value.binding().is_some() && value.value().is_none());
        assert_eq!(value.seed().map(|seed| seed.radii()), Some(radii));
    }

    /// A malformed slash value never aborts the batch: the bad half (or
    /// token) is 0 and reports a `rect` warning, the siblings decode.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn bad_border_radius_slash_values_warn_and_fall_back() {
        use crate::protocol::units::{Length, Rect};
        let decode = |radius: &str| {
            crate::diag::decode_batch_start();
            let s: Style =
                serde_json::from_value(serde_json::json!({ "borderRadius": radius, "width": 40 }))
                    .expect("a bad radius must not abort deserialization");
            assert_eq!(s.get(&WIDTH).static_val(), Some(Length::Px(40.0)));
            let radii = s.get(&BORDER_RADIUS).static_ref().expect("static").radii();
            let warned: Vec<String> = crate::diag::take_decode_warnings()
                .into_iter()
                .filter(|w| w.kind == "rect")
                .map(|w| w.value)
                .collect();
            (radii, warned)
        };

        let (radii, warned) = decode("10px / ");
        assert_eq!(radii.y, Some(Rect::default()), "an empty half is 0");
        assert_eq!(warned.len(), 1, "{warned:?}");

        let (radii, warned) = decode("10px / bogus");
        assert_eq!(radii.y, Some(Rect::default()));
        assert_eq!(warned, ["bogus"]);

        // A second slash is a bad token of the vertical half.
        let (_, warned) = decode("1px / 2px / 3px");
        assert_eq!(warned, ["/"]);
    }

    /// Gradient leaves accept `{ animated }` wrappers; static forms decode as
    /// before; the wire types compare (PartialEq — required by the transition
    /// channel's retarget detection).
    #[test]
    fn gradient_leaves_decode_animatable_and_compare() {
        use super::GradientSpec;
        use crate::protocol::animatable::Animatable;
        let g: GradientSpec = serde_json::from_value(serde_json::json!({
            "type": "linear",
            "angle": { "animated": { "id": 1 }, "seed": 45 },
            "stops": [
                { "color": { "animated": { "type": "interpolateColor", "id": 2,
                    "input": [0, 1], "output": [[0,0,0,1],[1,1,1,1]] } },
                  "position": { "animated": { "id": 3 }, "seed": "20px" } },
                { "color": "#ff0000", "hint": 0.25 },
            ],
        }))
        .unwrap();
        let GradientSpec::Linear(l) = &g else {
            panic!()
        };
        assert!(l.angle.binding().is_some());
        assert!(matches!(&l.stops[0].color, Animatable::Animated(_)));
        assert_eq!(l.stops[1].color, Animatable::Static("#ff0000".to_string()));
        assert_eq!(g.clone(), g, "PartialEq derived");
    }

    /// [`super::RadialShapeSpec`] decodes the forms `RadialShape` in
    /// `jsx.d.ts` declares, and still the externally tagged ones it used to.
    #[test]
    fn radial_shape_wire_forms() {
        use super::RadialShapeSpec::{self, *};
        use crate::protocol::animatable::Animatable::Static;
        use crate::protocol::units::Length::{Percent, Px};
        let shape = |v| serde_json::from_value::<RadialShapeSpec>(v).expect("decodes");
        let keyword = Keyword("closestSide".into());
        let circle = Circle {
            circle: Static(Px(40.0)),
        };
        let ellipse = Ellipse {
            ellipse: [Static(Px(10.0)), Static(Percent(50.0))],
        };

        assert_eq!(shape(serde_json::json!("closestSide")), keyword);
        assert_eq!(shape(serde_json::json!({ "circle": 40 })), circle);
        assert_eq!(
            shape(serde_json::json!({ "ellipse": [10, "50%"] })),
            ellipse
        );

        assert_eq!(
            shape(serde_json::json!({ "keyword": "closestSide" })),
            keyword
        );
        assert_eq!(
            shape(serde_json::json!({ "circle": { "circle": 40 } })),
            circle
        );
        assert_eq!(
            shape(serde_json::json!({ "ellipse": { "ellipse": [10, "50%"] } })),
            ellipse
        );

        let animated = shape(serde_json::json!({ "circle": { "animated": { "id": 1 } } }));
        assert!(matches!(animated, Circle { circle } if circle.binding().is_some()));
    }

    /// `borderColor` decodes from a scalar (uniform, back-compat) or a per-side
    /// object; omitted sides stay `None`, and an unknown side key is rejected.
    #[test]
    fn border_color_scalar_and_per_side() {
        // Scalar string → every side set (the historical form).
        let uniform: Style =
            serde_json::from_str(r#"{ "borderColor": "white" }"#).expect("scalar decodes");
        let bc = uniform
            .get(&BORDER_COLOR)
            .static_ref()
            .expect("border_color present");
        assert_eq!(bc.top.as_deref(), Some("white"));
        assert_eq!(bc.right.as_deref(), Some("white"));
        assert_eq!(bc.bottom.as_deref(), Some("white"));
        assert_eq!(bc.left.as_deref(), Some("white"));

        // Object form sets only the named sides; the rest stay None (transparent).
        let sided: Style =
            serde_json::from_str(r##"{ "borderColor": { "top": "#f00", "left": "blue" } }"##)
                .expect("object decodes");
        let bc = sided
            .get(&BORDER_COLOR)
            .static_ref()
            .expect("border_color present");
        assert_eq!(bc.top.as_deref(), Some("#f00"));
        assert_eq!(bc.left.as_deref(), Some("blue"));
        assert_eq!(bc.right, None);
        assert_eq!(bc.bottom, None);

        // An unknown side key is ignored (warned), not rejected: throwing here would
        // abort the whole commit batch and wedge the reconciler. A valid sibling key
        // still applies; the unknown one leaves all sides at their default (None).
        let bogus: Style =
            serde_json::from_str(r#"{ "borderColor": { "middle": "red", "top": "blue" } }"#)
                .expect("unknown side key must not abort deserialization");
        let bc = bogus
            .get(&BORDER_COLOR)
            .static_ref()
            .expect("border_color present");
        assert_eq!(bc.top.as_deref(), Some("blue"));
        assert_eq!(bc.right, None);
        assert_eq!(bc.bottom, None);
        assert_eq!(bc.left, None);
    }
}
