//! Visual spec wire types: outline, shadows, line metrics, gradients, and
//! per-side border colors.

use std::fmt;

use serde::Deserialize;
use serde::de::{self, Deserializer, MapAccess, Visitor};

use super::animatable::Animatable;
use super::decode_warn;
use super::units::{Angle, Length};

/// Outline drawn around (outside) the node's border box.
#[derive(Debug, Clone, Default, Deserialize)]
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
#[derive(Debug, Clone, Default, Deserialize)]
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
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum BoxShadowList {
    One(BoxShadowSpec),
    Many(Vec<BoxShadowSpec>),
}

/// Line height for a `<text>`. A bare number is a multiple of the font size
/// (`RelativeToFont`); a string carries a unit (`"20px"` absolute, `"1.5"` / `"1.5em"`
/// a multiple); `{ "px": n }` is an absolute pixel height (legacy object form).
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum LineHeightSpec {
    Relative(f32),
    Px { px: f32 },
    Str(String),
}

/// Letter spacing for a `<text>`. A bare number is logical pixels; a string carries
/// a unit (`"2px"`, `"0.1rem"`/`"0.1em"` for a font-size multiple, or `"normal"`);
/// `{ "rem": n }` is a multiple of the font size (legacy object form).
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum LetterSpacingSpec {
    Px(f32),
    Rem { rem: f32 },
    Str(String),
}

/// A single text drop shadow. `offsetX`/`offsetY` are displacement in logical
/// pixels (absent → bevy's default of `4.0`); `color` defaults to bevy's
/// translucent black when unset.
#[derive(Debug, Clone, Default, Deserialize)]
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
/// `"hsvLong"`).
pub type ColorSpace = String;

/// The size/shape of a radial gradient. Externally tagged on the wire:
/// `{ keyword: "closestSide" | "farthestSide" | "closestCorner" |
/// "farthestCorner" }` (default `closestCorner`), `{ circle: { circle:
/// <Length> } }`, or `{ ellipse: { ellipse: [<Length>, <Length>] } }` —
/// pinned by `radial_shape_wire_forms_preserved`. NOTE: `jsx.d.ts`'s
/// `RadialShape` declares flat forms that have never decoded (tracked in
/// `TODO`). The circle/ellipse radii accept `{ animated }` wrappers.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum RadialShapeSpec {
    Keyword(String),
    Circle { circle: Animatable<Length> },
    Ellipse { ellipse: [Animatable<Length>; 2] },
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

#[cfg(test)]
mod tests {
    use crate::protocol::animatable::AnimatableField;
    use crate::protocol::style::Style;

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
        assert!(matches!(&l.stops[0].color, Animatable::Animated { .. }));
        assert_eq!(l.stops[1].color, Animatable::Static("#ff0000".to_string()));
        assert_eq!(g.clone(), g, "PartialEq derived");
    }

    /// Pins the [`super::RadialShapeSpec`] wire forms of the externally-tagged
    /// derive (`{ keyword }` / `{ circle: { circle } }` /
    /// `{ ellipse: { ellipse } }`; the flat forms are rejected) — behavior
    /// that predates the `Animatable` leaves and must survive them.
    #[test]
    fn radial_shape_wire_forms_preserved() {
        use super::RadialShapeSpec;
        use crate::protocol::animatable::Animatable;
        use crate::protocol::units::Length;

        let k: RadialShapeSpec =
            serde_json::from_value(serde_json::json!({ "keyword": "closestSide" })).unwrap();
        assert!(matches!(k, RadialShapeSpec::Keyword(ref s) if s == "closestSide"));

        let c: RadialShapeSpec =
            serde_json::from_value(serde_json::json!({ "circle": { "circle": 40 } })).unwrap();
        let RadialShapeSpec::Circle { circle } = c else {
            panic!("expected Circle, got {c:?}");
        };
        assert_eq!(circle, Animatable::Static(Length::Px(40.0)));

        let e: RadialShapeSpec =
            serde_json::from_value(serde_json::json!({ "ellipse": { "ellipse": [10, "50%"] } }))
                .unwrap();
        let RadialShapeSpec::Ellipse { ellipse } = e else {
            panic!("expected Ellipse, got {e:?}");
        };
        assert_eq!(ellipse[0], Animatable::Static(Length::Px(10.0)));
        assert_eq!(ellipse[1], Animatable::Static(Length::Percent(50.0)));

        // The flat forms have never decoded — keep rejecting them.
        for v in [
            serde_json::json!("closestSide"),
            serde_json::json!({ "circle": 40 }),
            serde_json::json!({ "ellipse": [10, 20] }),
        ] {
            assert!(
                serde_json::from_value::<RadialShapeSpec>(v.clone()).is_err(),
                "{v} unexpectedly decoded"
            );
        }
    }

    /// `borderColor` decodes from a scalar (uniform, back-compat) or a per-side
    /// object; omitted sides stay `None`, and an unknown side key is rejected.
    #[test]
    fn border_color_scalar_and_per_side() {
        // Scalar string → every side set (the historical form).
        let uniform: Style =
            serde_json::from_str(r#"{ "borderColor": "white" }"#).expect("scalar decodes");
        let bc = uniform
            .border_color
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
            .border_color
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
            .border_color
            .static_ref()
            .expect("border_color present");
        assert_eq!(bc.top.as_deref(), Some("blue"));
        assert_eq!(bc.right, None);
        assert_eq!(bc.bottom, None);
        assert_eq!(bc.left, None);
    }
}
