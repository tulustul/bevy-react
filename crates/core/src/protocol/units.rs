//! The unit-bearing wire types: [`Length`], [`Angle`], [`Time`],
//! [`FontSize`], [`Rect`] — parsed once at the serde boundary.

use std::fmt;

use serde::Deserialize;
use serde::de::{self, Deserializer, MapAccess, Visitor};

use super::decode_warn;

/// A length value mirroring `bevy_ui::Val`, parsed from the wire form (a number
/// is logical pixels; a string carries an explicit unit).
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Length {
    Auto,
    Px(f32),
    Percent(f32),
    Vw(f32),
    Vh(f32),
    VMin(f32),
    VMax(f32),
}

impl Default for Length {
    fn default() -> Self {
        Length::Px(0.0)
    }
}

/// Parse a CSS-ish length token (`"auto"`, `"10px"`, `"50%"`, `"100vw"`, `"5"`).
fn parse_length(s: &str) -> Result<Length, String> {
    let s = s.trim();
    if s.eq_ignore_ascii_case("auto") {
        return Ok(Length::Auto);
    }
    // `vmin`/`vmax` before `vw`/`vh` is unnecessary (suffixes are distinct), but
    // `%` is checked last so numeric parsing handles the bare-number case.
    type LengthCtor = fn(f32) -> Length;
    let units: [(&str, LengthCtor); 6] = [
        ("px", Length::Px),
        ("vmin", Length::VMin),
        ("vmax", Length::VMax),
        ("vw", Length::Vw),
        ("vh", Length::Vh),
        ("%", Length::Percent),
    ];
    for (suffix, ctor) in units {
        if let Some(num) = s.strip_suffix(suffix) {
            let v: f32 = num
                .trim()
                .parse()
                .map_err(|_| format!("invalid length {s:?}"))?;
            return Ok(ctor(v));
        }
    }
    s.parse::<f32>()
        .map(Length::Px)
        .map_err(|_| format!("invalid length {s:?}"))
}

impl<'de> Deserialize<'de> for Length {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct LengthVisitor;
        impl<'de> Visitor<'de> for LengthVisitor {
            type Value = Length;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number (logical pixels) or a CSS length string")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<Length, E> {
                Ok(Length::Px(v as f32))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<Length, E> {
                Ok(Length::Px(v as f32))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<Length, E> {
                Ok(Length::Px(v as f32))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<Length, E> {
                Ok(parse_length(s).unwrap_or_else(|e| {
                    decode_warn("length", s, &e);
                    Length::default()
                }))
            }
        }
        d.deserialize_any(LengthVisitor)
    }
}

/// An angle, parsed from the wire as a number (read as **degrees**, the CSS
/// convention) or a unit string (`"45deg"`, `"1.5rad"`, `"0.25turn"`, `"100grad"`).
/// Stored internally as radians — the unit Bevy's gradient and transform APIs want.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Angle(f32);

impl Angle {
    /// This angle in radians.
    pub fn radians(self) -> f32 {
        self.0
    }

    /// An angle from radians (the internal unit) — the write half of
    /// [`Self::radians`], for engine code re-emitting eased values.
    pub fn from_radians(radians: f32) -> Self {
        Angle(radians)
    }
}

/// Parse a CSS angle token into radians. A bare number is degrees; a suffix of
/// `deg`/`grad`/`turn`/`rad` selects the unit (`grad` is matched before `rad`
/// since `"100grad"` also ends in `"rad"`).
fn parse_angle(s: &str) -> Result<f32, String> {
    use std::f32::consts::{PI, TAU};
    let s = s.trim();
    type AngleConv = fn(f32) -> f32;
    let units: [(&str, AngleConv); 4] = [
        ("deg", f32::to_radians),
        ("grad", |v| v * PI / 200.0),
        ("turn", |v| v * TAU),
        ("rad", |v| v),
    ];
    for (suffix, conv) in units {
        if let Some(num) = s.strip_suffix(suffix) {
            let v: f32 = num
                .trim()
                .parse()
                .map_err(|_| format!("invalid angle {s:?}"))?;
            return Ok(conv(v));
        }
    }
    s.parse::<f32>()
        .map(f32::to_radians)
        .map_err(|_| format!("invalid angle {s:?}"))
}

impl<'de> Deserialize<'de> for Angle {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct AngleVisitor;
        impl Visitor<'_> for AngleVisitor {
            type Value = Angle;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number (degrees) or a CSS angle string")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<Angle, E> {
                Ok(Angle((v as f32).to_radians()))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<Angle, E> {
                Ok(Angle((v as f32).to_radians()))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<Angle, E> {
                Ok(Angle((v as f32).to_radians()))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<Angle, E> {
                Ok(parse_angle(s).map(Angle).unwrap_or_else(|e| {
                    decode_warn("angle", s, &e);
                    Angle::default()
                }))
            }
        }
        d.deserialize_any(AngleVisitor)
    }
}

/// A time/duration, parsed from the wire as a number (read as **milliseconds**,
/// the JS-facing unit) or a unit string (`"200ms"`, `"0.2s"`). Stored as seconds —
/// the unit the animations engine and the transition driver consume.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Time(f32);

impl Time {
    /// Construct from a value already in seconds.
    pub fn from_secs(secs: f32) -> Self {
        Time(secs)
    }
    /// This duration in seconds.
    pub fn seconds(self) -> f32 {
        self.0
    }
}

/// Parse a CSS time token into seconds. A bare number is milliseconds; a suffix of
/// `ms`/`s` selects the unit (`ms` is matched before `s` since `"200ms"` also ends
/// in `"s"`).
fn parse_time(s: &str) -> Result<f32, String> {
    let s = s.trim();
    if let Some(num) = s.strip_suffix("ms") {
        return num
            .trim()
            .parse::<f32>()
            .map(|v| v / 1000.0)
            .map_err(|_| format!("invalid time {s:?}"));
    }
    if let Some(num) = s.strip_suffix('s') {
        return num
            .trim()
            .parse::<f32>()
            .map_err(|_| format!("invalid time {s:?}"));
    }
    s.parse::<f32>()
        .map(|v| v / 1000.0)
        .map_err(|_| format!("invalid time {s:?}"))
}

impl<'de> Deserialize<'de> for Time {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct TimeVisitor;
        impl Visitor<'_> for TimeVisitor {
            type Value = Time;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number (milliseconds) or a CSS time string")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<Time, E> {
                Ok(Time(v as f32 / 1000.0))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<Time, E> {
                Ok(Time(v as f32 / 1000.0))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<Time, E> {
                Ok(Time(v as f32 / 1000.0))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<Time, E> {
                Ok(parse_time(s).map(Time).unwrap_or_else(|e| {
                    decode_warn("time", s, &e);
                    Time::default()
                }))
            }
        }
        d.deserialize_any(TimeVisitor)
    }
}

/// A font size mirroring `bevy_text::FontSize`, parsed from the wire as a number
/// (logical pixels) or a unit string (`"24px"`, `"100vw"`/`vh`/`vmin`/`vmax`,
/// `"1.5rem"`). `rem` is relative to bevy's `RemSize` resource (default 20px).
/// (CSS `em` has no `bevy_text` equivalent, so it is not accepted.)
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum FontSize {
    Px(f32),
    Vw(f32),
    Vh(f32),
    VMin(f32),
    VMax(f32),
    Rem(f32),
}

/// Parse a font-size token (`"24px"`, `"100vw"`, `"1.5rem"`, or a bare number read
/// as pixels). Suffixes are checked longest-first where they'd otherwise alias
/// (`vmin`/`vmax` before `vw`/`vh`).
fn parse_font_size(s: &str) -> Result<FontSize, String> {
    let s = s.trim();
    type FsCtor = fn(f32) -> FontSize;
    let units: [(&str, FsCtor); 6] = [
        ("px", FontSize::Px),
        ("rem", FontSize::Rem),
        ("vmin", FontSize::VMin),
        ("vmax", FontSize::VMax),
        ("vw", FontSize::Vw),
        ("vh", FontSize::Vh),
    ];
    for (suffix, ctor) in units {
        if let Some(num) = s.strip_suffix(suffix) {
            let v: f32 = num
                .trim()
                .parse()
                .map_err(|_| format!("invalid fontSize {s:?}"))?;
            return Ok(ctor(v));
        }
    }
    s.parse::<f32>()
        .map(FontSize::Px)
        .map_err(|_| format!("invalid fontSize {s:?}"))
}

impl<'de> Deserialize<'de> for FontSize {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct FontSizeVisitor;
        impl Visitor<'_> for FontSizeVisitor {
            type Value = FontSize;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number (logical pixels) or a font-size unit string")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<FontSize, E> {
                Ok(FontSize::Px(v as f32))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<FontSize, E> {
                Ok(FontSize::Px(v as f32))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<FontSize, E> {
                Ok(FontSize::Px(v as f32))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<FontSize, E> {
                Ok(parse_font_size(s).unwrap_or_else(|e| {
                    decode_warn("fontSize", s, &e);
                    FontSize::Px(0.0)
                }))
            }
        }
        d.deserialize_any(FontSizeVisitor)
    }
}

/// Four sides (or corners), each a [`Length`]. Accepts a number, a CSS shorthand
/// string, or a `{ top, right, bottom, left }` object on the wire.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Rect {
    pub top: Length,
    pub right: Length,
    pub bottom: Length,
    pub left: Length,
}

impl Rect {
    fn uniform(v: Length) -> Self {
        Rect {
            top: v,
            right: v,
            bottom: v,
            left: v,
        }
    }

    /// Expand 1–4 CSS values into four sides (top, right, bottom, left).
    fn from_shorthand(values: &[Length]) -> Result<Self, String> {
        Ok(match values {
            [a] => Rect::uniform(*a),
            [a, b] => Rect {
                top: *a,
                bottom: *a,
                right: *b,
                left: *b,
            },
            [a, b, c] => Rect {
                top: *a,
                right: *b,
                left: *b,
                bottom: *c,
            },
            [a, b, c, d] => Rect {
                top: *a,
                right: *b,
                bottom: *c,
                left: *d,
            },
            _ => return Err("expected 1–4 length values".into()),
        })
    }
}

impl<'de> Deserialize<'de> for Rect {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct RectVisitor;
        impl<'de> Visitor<'de> for RectVisitor {
            type Value = Rect;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number, a CSS shorthand string, or a {top,right,bottom,left} object")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<Rect, E> {
                Ok(Rect::uniform(Length::Px(v as f32)))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<Rect, E> {
                Ok(Rect::uniform(Length::Px(v as f32)))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<Rect, E> {
                Ok(Rect::uniform(Length::Px(v as f32)))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<Rect, E> {
                // A bad token or value-count must not throw (that aborts the whole
                // commit batch and wedges the reconciler) — warn and fall back.
                let values: Vec<Length> = s
                    .split_whitespace()
                    .map(|tok| {
                        parse_length(tok).unwrap_or_else(|e| {
                            decode_warn("rect", tok, &e);
                            Length::default()
                        })
                    })
                    .collect();
                Ok(Rect::from_shorthand(&values).unwrap_or_else(|e| {
                    decode_warn("rect", s, &format!("invalid rect {s:?}: {e}"));
                    Rect::default()
                }))
            }
            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Rect, A::Error> {
                let mut rect = Rect::default();
                while let Some(key) = map.next_key::<String>()? {
                    let v = map.next_value::<Length>()?;
                    match key.as_str() {
                        "top" => rect.top = v,
                        "right" => rect.right = v,
                        "bottom" => rect.bottom = v,
                        "left" => rect.left = v,
                        // An unknown side key must not throw (that aborts the whole
                        // commit batch) — `v` is already consumed, so warn and skip.
                        _ => decode_warn(
                            "rect",
                            &key,
                            &format!(
                                "unknown rect side {key:?}; ignoring (expected top/right/bottom/left)"
                            ),
                        ),
                    }
                }
                Ok(rect)
            }
        }
        d.deserialize_any(RectVisitor)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::animatable::AnimatableField;
    use crate::protocol::style::Style;
    use crate::protocol::transform::Transform;

    /// Angles parse from a bare number (degrees) or a unit string, always landing
    /// in radians.
    #[test]
    fn angle_units() {
        use std::f32::consts::{PI, TAU};
        let parse = |v: serde_json::Value| serde_json::from_value::<Angle>(v).unwrap().radians();
        assert!((parse(serde_json::json!(180)) - PI).abs() < 1e-5);
        assert!((parse(serde_json::json!("180deg")) - PI).abs() < 1e-5);
        assert!((parse(serde_json::json!("3.14159rad")) - PI).abs() < 1e-4);
        assert!((parse(serde_json::json!("0.5turn")) - PI).abs() < 1e-5);
        assert!((parse(serde_json::json!("400grad")) - TAU).abs() < 1e-5);
    }

    /// A malformed unit string in any unit-bearing field must **not** fail the
    /// whole `Style` (and thus the whole commit batch): it decodes to the type's
    /// default and warns. A good value alongside it still decodes correctly.
    #[test]
    fn bad_unit_values_fall_back_instead_of_aborting() {
        // Bad `width` (unknown unit) → default, sibling `height` intact.
        let s: Style = serde_json::from_str(r#"{ "width": "100pixels", "height": "40px" }"#)
            .expect("a bad length must not abort deserialization");
        assert_eq!(s.width.static_val(), Some(Length::default()));
        assert_eq!(s.height.static_val(), Some(Length::Px(40.0)));

        // Bad `fontSize` → default `Px(0.0)`.
        let s: Style = serde_json::from_str(r#"{ "fontSize": "16pxx" }"#)
            .expect("bad fontSize must not abort");
        assert_eq!(s.font_size, Some(FontSize::Px(0.0)));

        // Bad transform `rotate` (angle) → default `Angle(0)`, valid `translateX` intact.
        let t: Transform = serde_json::from_str(r#"{ "rotate": "45degg", "translateX": "50%" }"#)
            .expect("bad angle must not abort");
        assert_eq!(t.rotate.static_val(), Some(Angle::default()));
        assert_eq!(t.translate_x.static_val(), Some(Length::Percent(50.0)));

        // Rect shorthand (`padding`/`margin`/`border`/`borderRadius`): a bad token
        // defaults just that side; a good shorthand still decodes; a bad value-count
        // defaults the whole rect. None of these abort (the reported `padding: "16asd"`).
        let s: Style =
            serde_json::from_str(r#"{ "padding": "16asd" }"#).expect("bad rect must not abort");
        assert_eq!(s.padding, Some(Rect::default()));

        let s: Style = serde_json::from_str(r#"{ "padding": "8px 16asd" }"#)
            .expect("partial-bad rect must not abort");
        // top/bottom = 8px (good), right/left = default (the bad token).
        assert_eq!(
            s.padding,
            Some(Rect {
                top: Length::Px(8.0),
                bottom: Length::Px(8.0),
                right: Length::default(),
                left: Length::default(),
            })
        );

        let s: Style = serde_json::from_str(r#"{ "padding": "8px 16px" }"#)
            .expect("valid two-value shorthand decodes");
        assert_eq!(
            s.padding,
            Some(Rect {
                top: Length::Px(8.0),
                bottom: Length::Px(8.0),
                right: Length::Px(16.0),
                left: Length::Px(16.0),
            })
        );

        // Too many values (>4) → whole rect falls back to default, no abort.
        let s: Style = serde_json::from_str(r#"{ "padding": "1px 2px 3px 4px 5px" }"#)
            .expect("bad value-count must not abort");
        assert_eq!(s.padding, Some(Rect::default()));
    }
}
