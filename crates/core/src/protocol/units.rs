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
    if s.trim().eq_ignore_ascii_case("auto") {
        return Ok(Length::Auto);
    }
    parse_suffixed(
        s,
        "length",
        &[
            ("px", Length::Px),
            ("vmin", Length::VMin),
            ("vmax", Length::VMax),
            ("vw", Length::Vw),
            ("vh", Length::Vh),
            ("%", Length::Percent),
        ],
        Length::Px,
    )
}

/// A unit's constructor from the parsed number.
type UnitCtor<T> = fn(f32) -> T;

/// Parse a number with one of `units`' suffixes (tried in order, so a
/// suffix another one ends with must come after it — `grad` before `rad`,
/// `ms` before `s`), or a bare number through `bare`.
fn parse_suffixed<T>(
    s: &str,
    kind: &str,
    units: &[(&str, UnitCtor<T>)],
    bare: UnitCtor<T>,
) -> Result<T, String> {
    let s = s.trim();
    let (num, ctor) = units
        .iter()
        .find_map(|&(suffix, ctor)| s.strip_suffix(suffix).map(|num| (num, ctor)))
        .unwrap_or((s, bare));
    num.trim()
        .parse::<f32>()
        .map(ctor)
        .map_err(|_| format!("invalid {kind} {s:?}"))
}

/// Deserialize a number-or-unit-string wire value: a number maps through
/// `from_number`, a string through `parse` — an unparseable one warns `kind`
/// and decodes as `fallback()` (never failing the batch).
fn de_unit<'de, D: Deserializer<'de>, T>(
    d: D,
    expecting: &'static str,
    kind: &'static str,
    from_number: fn(f32) -> T,
    parse: fn(&str) -> Result<T, String>,
    fallback: fn() -> T,
) -> Result<T, D::Error> {
    struct UnitVisitor<T> {
        expecting: &'static str,
        kind: &'static str,
        from_number: fn(f32) -> T,
        parse: fn(&str) -> Result<T, String>,
        fallback: fn() -> T,
    }
    impl<T> Visitor<'_> for UnitVisitor<T> {
        type Value = T;
        fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
            f.write_str(self.expecting)
        }
        fn visit_f64<E: de::Error>(self, v: f64) -> Result<T, E> {
            Ok((self.from_number)(v as f32))
        }
        fn visit_i64<E: de::Error>(self, v: i64) -> Result<T, E> {
            Ok((self.from_number)(v as f32))
        }
        fn visit_u64<E: de::Error>(self, v: u64) -> Result<T, E> {
            Ok((self.from_number)(v as f32))
        }
        fn visit_str<E: de::Error>(self, s: &str) -> Result<T, E> {
            Ok((self.parse)(s).unwrap_or_else(|e| {
                decode_warn(self.kind, s, &e);
                (self.fallback)()
            }))
        }
    }
    d.deserialize_any(UnitVisitor {
        expecting,
        kind,
        from_number,
        parse,
        fallback,
    })
}

impl<'de> Deserialize<'de> for Length {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        de_unit(
            d,
            "a number (logical pixels) or a CSS length string",
            "length",
            Length::Px,
            parse_length,
            Length::default,
        )
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
fn parse_angle(s: &str) -> Result<Angle, String> {
    use std::f32::consts::{PI, TAU};
    parse_suffixed(
        s,
        "angle",
        &[
            ("deg", |v| Angle(v.to_radians())),
            ("grad", |v| Angle(v * PI / 200.0)),
            ("turn", |v| Angle(v * TAU)),
            ("rad", Angle),
        ],
        |v| Angle(v.to_radians()),
    )
}

impl<'de> Deserialize<'de> for Angle {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        de_unit(
            d,
            "a number (degrees) or a CSS angle string",
            "angle",
            |v| Angle(v.to_radians()),
            parse_angle,
            Angle::default,
        )
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
fn parse_time(s: &str) -> Result<Time, String> {
    parse_suffixed(
        s,
        "time",
        &[("ms", |v| Time(v / 1000.0)), ("s", Time)],
        |v| Time(v / 1000.0),
    )
}

impl<'de> Deserialize<'de> for Time {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        de_unit(
            d,
            "a number (milliseconds) or a CSS time string",
            "time",
            |v| Time(v / 1000.0),
            parse_time,
            Time::default,
        )
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
/// as pixels).
fn parse_font_size(s: &str) -> Result<FontSize, String> {
    parse_suffixed(
        s,
        "fontSize",
        &[
            ("px", FontSize::Px),
            ("rem", FontSize::Rem),
            ("vmin", FontSize::VMin),
            ("vmax", FontSize::VMax),
            ("vw", FontSize::Vw),
            ("vh", FontSize::Vh),
        ],
        FontSize::Px,
    )
}

impl<'de> Deserialize<'de> for FontSize {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        de_unit(
            d,
            "a number (logical pixels) or a font-size unit string",
            "fontSize",
            FontSize::Px,
            parse_font_size,
            || FontSize::Px(0.0),
        )
    }
}

/// Four sides (or corners), each a [`Length`]. Accepts a number, a CSS shorthand
/// string, a `{ top, right, bottom, left }` object, or an axis pair
/// `{ horizontal, vertical }` (`horizontal` sets left + right, `vertical` sets
/// top + bottom) on the wire.
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
                f.write_str(
                    "a number, a CSS shorthand string, a {top,right,bottom,left} object, \
                     or a {horizontal,vertical} axis pair",
                )
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
                // Two passes: the axis keys are only a base, so an explicit side
                // wins over them whatever order the wire object lists them in.
                let (mut horizontal, mut vertical) = (None, None);
                let (mut top, mut right, mut bottom, mut left) = (None, None, None, None);
                while let Some(key) = map.next_key::<String>()? {
                    let v = map.next_value::<Length>()?;
                    match key.as_str() {
                        "top" => top = Some(v),
                        "right" => right = Some(v),
                        "bottom" => bottom = Some(v),
                        "left" => left = Some(v),
                        "horizontal" => horizontal = Some(v),
                        "vertical" => vertical = Some(v),
                        // An unknown side key must not throw (that aborts the whole
                        // commit batch) — `v` is already consumed, so warn and skip.
                        _ => decode_warn(
                            "rect",
                            &key,
                            &format!(
                                "unknown rect side {key:?}; ignoring (expected \
                                 top/right/bottom/left or horizontal/vertical)"
                            ),
                        ),
                    }
                }
                let mut rect = Rect::default();
                if let Some(v) = vertical {
                    rect.top = v;
                    rect.bottom = v;
                }
                if let Some(h) = horizontal {
                    rect.right = h;
                    rect.left = h;
                }
                if let Some(v) = top {
                    rect.top = v;
                }
                if let Some(v) = right {
                    rect.right = v;
                }
                if let Some(v) = bottom {
                    rect.bottom = v;
                }
                if let Some(v) = left {
                    rect.left = v;
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
    use crate::protocol::transform::Transform;
    use crate::style::Style;
    use crate::style::props::{FONT_SIZE, HEIGHT, PADDING, WIDTH};

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
        assert_eq!(s.get(&WIDTH).static_val(), Some(Length::default()));
        assert_eq!(s.get(&HEIGHT).static_val(), Some(Length::Px(40.0)));

        // Bad `fontSize` → default `Px(0.0)`.
        let s: Style = serde_json::from_str(r#"{ "fontSize": "16pxx" }"#)
            .expect("bad fontSize must not abort");
        assert_eq!(s.get(&FONT_SIZE).copied(), Some(FontSize::Px(0.0)));

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
        assert_eq!(s.get(&PADDING).copied(), Some(Rect::default()));

        let s: Style = serde_json::from_str(r#"{ "padding": "8px 16asd" }"#)
            .expect("partial-bad rect must not abort");
        // top/bottom = 8px (good), right/left = default (the bad token).
        assert_eq!(
            s.get(&PADDING).copied(),
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
            s.get(&PADDING).copied(),
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
        assert_eq!(s.get(&PADDING).copied(), Some(Rect::default()));
    }

    /// The axis form: `horizontal` sets left + right, `vertical` sets top +
    /// bottom. An omitted axis leaves those sides at the rect default, and an
    /// explicit side always wins over an axis — whatever order the wire object
    /// lists the keys in.
    #[test]
    fn rect_axis_pair() {
        // `from_str` (not `from_value`) so the wire key order reaches the visitor
        // as written — `serde_json::Map` sorts its keys.
        let rect = |v: &str| {
            let s: Style = serde_json::from_str(&format!(r#"{{ "padding": {v} }}"#))
                .expect("axis rect must decode");
            s.get(&PADDING).copied().expect("padding present")
        };

        assert_eq!(
            rect(r#"{ "horizontal": 8, "vertical": 4 }"#),
            Rect {
                top: Length::Px(4.0),
                bottom: Length::Px(4.0),
                right: Length::Px(8.0),
                left: Length::Px(8.0),
            }
        );

        // A partial axis pair leaves the other axis at the default (`Px(0)`).
        assert_eq!(
            rect(r#"{ "horizontal": 8 }"#),
            Rect {
                top: Length::default(),
                bottom: Length::default(),
                right: Length::Px(8.0),
                left: Length::Px(8.0),
            }
        );

        // Axis values go through `Length` like sides do — unit strings included.
        assert_eq!(
            rect(r#"{ "horizontal": "50%", "vertical": "auto" }"#),
            Rect {
                top: Length::Auto,
                bottom: Length::Auto,
                right: Length::Percent(50.0),
                left: Length::Percent(50.0),
            }
        );

        // Mixing the two forms is undocumented (and TS lets it through — a union's
        // excess-property check allows any key known to any arm), so it needs a
        // defined result rather than an error: sides win, order-independently.
        let mixed = Rect {
            top: Length::default(),
            bottom: Length::default(),
            right: Length::Px(8.0),
            left: Length::Px(0.0),
        };
        assert_eq!(rect(r#"{ "horizontal": 8, "left": 0 }"#), mixed);
        assert_eq!(rect(r#"{ "left": 0, "horizontal": 8 }"#), mixed);
    }
}
