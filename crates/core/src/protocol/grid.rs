//! CSS grid track/template/placement string parsing, decoding straight into
//! `bevy_ui` grid types via the `grid_fields!` deserializers.

use std::fmt;

use bevy::ui::{GridPlacement, GridTrack, RepeatedGridTrack};
use serde::de::{self, Deserializer, Visitor};

use super::decode_warn;

/// Split a grid track list on whitespace while keeping `repeat(...)` groups
/// (which contain spaces) intact.
fn split_tracks(s: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut depth = 0usize;
    let mut cur = String::new();
    for ch in s.chars() {
        match ch {
            '(' => {
                depth += 1;
                cur.push(ch);
            }
            ')' => {
                depth = depth.saturating_sub(1);
                cur.push(ch);
            }
            c if c.is_whitespace() && depth == 0 => {
                if !cur.is_empty() {
                    out.push(std::mem::take(&mut cur));
                }
            }
            c => cur.push(c),
        }
    }
    if !cur.is_empty() {
        out.push(cur);
    }
    out
}

/// Parse one sizing token (`"1fr"`, `"100px"`, `"50%"`, `"auto"`,
/// `"min-content"`, `"max-content"`, `"2flex"`) into a `GridTrack`.
fn single_track(token: &str) -> Option<GridTrack> {
    let t = token.trim();
    match t {
        "auto" => return Some(GridTrack::auto()),
        "min-content" => return Some(GridTrack::min_content()),
        "max-content" => return Some(GridTrack::max_content()),
        _ => {}
    }
    let parse = |num: &str| num.trim().parse::<f32>().ok();
    if let Some(v) = t.strip_suffix("fr").and_then(parse) {
        Some(GridTrack::fr(v))
    } else if let Some(v) = t.strip_suffix("flex").and_then(parse) {
        Some(GridTrack::flex(v))
    } else if let Some(v) = t.strip_suffix("px").and_then(parse) {
        Some(GridTrack::px(v))
    } else {
        t.strip_suffix('%').and_then(parse).map(GridTrack::percent)
    }
}

/// Build a repeated track (`repeat(count, token)`), dispatching on the unit.
fn repeated_track(count: u16, token: &str) -> Option<RepeatedGridTrack> {
    let t = token.trim();
    match t {
        "auto" => return Some(RepeatedGridTrack::auto(count)),
        "min-content" => return Some(RepeatedGridTrack::min_content(count)),
        "max-content" => return Some(RepeatedGridTrack::max_content(count)),
        _ => {}
    }
    let parse = |num: &str| num.trim().parse::<f32>().ok();
    if let Some(v) = t.strip_suffix("fr").and_then(parse) {
        Some(RepeatedGridTrack::fr(count, v))
    } else if let Some(v) = t.strip_suffix("flex").and_then(parse) {
        Some(RepeatedGridTrack::flex(count, v))
    } else if let Some(v) = t.strip_suffix("px").and_then(parse) {
        Some(RepeatedGridTrack::px(count as usize, v))
    } else {
        t.strip_suffix('%')
            .and_then(parse)
            .map(|v| RepeatedGridTrack::percent(count as usize, v))
    }
}

/// Parse a CSS grid template (`"repeat(3, 1fr)"`, `"1fr 2fr 100px"`, `"auto"`).
/// An unparsable token warns and is skipped; the rest of the template survives.
fn parse_template(s: &str) -> Vec<RepeatedGridTrack> {
    split_tracks(s)
        .into_iter()
        .filter_map(|tok| {
            let parse_one = || {
                if let Some(inner) = tok
                    .strip_prefix("repeat(")
                    .and_then(|t| t.strip_suffix(')'))
                {
                    let (count, track) = inner.split_once(',')?;
                    repeated_track(count.trim().parse().ok()?, track)
                } else {
                    single_track(&tok).map(Into::into)
                }
            };
            let parsed = parse_one();
            if parsed.is_none() {
                decode_warn(
                    "gridTrack",
                    &tok,
                    &format!("ignoring unparsable grid track {tok:?}"),
                );
            }
            parsed
        })
        .collect()
}

/// Parse an auto-track list (`grid-auto-rows`/`columns`); no `repeat()`.
fn parse_auto_tracks(s: &str) -> Vec<GridTrack> {
    split_tracks(s)
        .iter()
        .filter_map(|t| {
            let parsed = single_track(t);
            if parsed.is_none() {
                decode_warn(
                    "gridTrack",
                    t,
                    &format!("ignoring unparsable grid track {t:?}"),
                );
            }
            parsed
        })
        .collect()
}

/// Fallible half of [`de_grid_placement`]: `None` on anything that must not
/// reach `GridPlacement`'s panicking constructors. A zero anywhere in the value
/// (invalid in CSS) aborts the whole placement (rather than degrading to a
/// partial one, which would silently mis-place the item).
fn try_grid_placement(s: &str) -> Option<GridPlacement> {
    enum Token {
        Num(i16),  // a nonzero line number
        Span(u16), // a nonzero `span N`
        Auto,
        Invalid, // a zero line/span, or an unrecognized token
    }
    fn token(t: &str) -> Token {
        let t = t.trim();
        if t == "auto" {
            return Token::Auto;
        }
        if let Some(n) = t.strip_prefix("span") {
            return match n.trim().parse::<u16>() {
                Ok(0) | Err(_) => Token::Invalid,
                Ok(n) => Token::Span(n),
            };
        }
        match t.parse::<i16>() {
            Ok(0) | Err(_) => Token::Invalid,
            Ok(n) => Token::Num(n),
        }
    }
    use Token::*;
    if let Some((a, b)) = s.split_once('/') {
        return Some(match (token(a), token(b)) {
            (Num(start), Span(span)) => GridPlacement::start_span(start, span),
            (Auto, Span(span)) => GridPlacement::span(span),
            (Num(start), Num(end)) => GridPlacement::start_end(start, end),
            (Num(start), Auto) => GridPlacement::start(start),
            (Auto, Num(end)) => GridPlacement::end(end),
            (Auto, Auto) => GridPlacement::auto(),
            _ => return None,
        });
    }
    match token(s) {
        Auto => Some(GridPlacement::auto()),
        Span(span) => Some(GridPlacement::span(span)),
        Num(line) => Some(GridPlacement::start(line)),
        Invalid => None,
    }
}

/// Shared shape of the three grid deserializers: string in, parsed value out,
/// `null` → `None`, non-string → hard error (like the keyword fields).
macro_rules! grid_fields {
    ( $(
        $(#[$meta:meta])*
        fn $fn_name:ident($expect:literal) -> $ty:ty { $parse:expr }
    )+ ) => { $(
        $(#[$meta])*
        pub(crate) fn $fn_name<'de, D: Deserializer<'de>>(d: D) -> Result<Option<$ty>, D::Error> {
            struct V;
            impl<'de> Visitor<'de> for V {
                type Value = Option<$ty>;
                fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                    f.write_str($expect)
                }
                fn visit_str<E: de::Error>(self, s: &str) -> Result<Self::Value, E> {
                    let parse: fn(&str) -> $ty = $parse;
                    Ok(Some(parse(s)))
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

grid_fields! {
    fn de_grid_template("a CSS grid template string") -> Vec<RepeatedGridTrack> {
        parse_template
    }
    fn de_grid_auto_tracks("a grid auto-track list string") -> Vec<GridTrack> {
        parse_auto_tracks
    }
    /// A zero grid line/span (invalid in CSS — and `GridPlacement`'s
    /// constructors panic on it) or an unrecognized token warns and falls back
    /// to `auto`.
    fn de_grid_placement("a grid line placement string") -> GridPlacement {
        |s| {
            try_grid_placement(s).unwrap_or_else(|| {
                decode_warn(
                    "gridPlacement",
                    s,
                    &format!("unrecognized grid placement {s:?}"),
                );
                GridPlacement::default()
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::style::Style;

    /// Grid templates/placements parse once at decode into the bevy types.
    #[test]
    fn grid_templates_and_placement_decode() {
        let s: Style = serde_json::from_value(serde_json::json!({
            "gridTemplateColumns": "1fr 2fr 100px",
            "gridTemplateRows": "repeat(3, 1fr)",
            "gridAutoRows": "auto 40px",
        }))
        .expect("grid template decodes");
        assert_eq!(s.grid_template_columns.map(|t| t.len()), Some(3));
        assert_eq!(s.grid_template_rows.map(|t| t.len()), Some(1));
        assert_eq!(s.grid_auto_rows.map(|t| t.len()), Some(2));

        // An unparsable track is skipped (warned); the rest survive.
        let s: Style =
            serde_json::from_value(serde_json::json!({ "gridTemplateRows": "1fr bogus 2fr" }))
                .expect("bad track must not abort");
        assert_eq!(s.grid_template_rows.map(|t| t.len()), Some(2));

        let placed = |v: &str| {
            let s: Style = serde_json::from_value(serde_json::json!({ "gridRow": v }))
                .expect("grid placement decodes");
            format!("{:?}", s.grid_row.unwrap())
        };
        let expect = |p: GridPlacement| format!("{p:?}");
        assert_eq!(placed("1 / 3"), expect(GridPlacement::start_end(1, 3)));
        assert_eq!(placed("span 2"), expect(GridPlacement::span(2)));
        assert_eq!(
            placed("2 / span 3"),
            expect(GridPlacement::start_span(2, 3))
        );
        assert_eq!(placed("2 / 2"), expect(GridPlacement::start_end(2, 2)));
        assert_eq!(placed("-1"), expect(GridPlacement::start(-1)));
        assert_eq!(placed("2 / auto"), expect(GridPlacement::start(2)));
        assert_eq!(placed("auto / 3"), expect(GridPlacement::end(3)));
    }

    /// A zero grid line/span is invalid CSS and panics `GridPlacement`'s
    /// constructors — every zero-bearing form must warn and fall back to `auto`
    /// at decode, never reach the constructor or degrade to a partial placement.
    #[test]
    fn grid_placement_zero_falls_back_to_auto() {
        let placed = |v: &str| {
            let s: Style = serde_json::from_value(serde_json::json!({ "gridRow": v }))
                .expect("zero placement must not abort");
            format!("{:?}", s.grid_row.unwrap())
        };
        let auto = format!("{:?}", GridPlacement::auto());
        for s in ["0", "span 0", "0 / 2", "2 / 0", "0 / span 2", "2 / span 0"] {
            assert_eq!(placed(s), auto, "input {s:?}");
        }
        // Unrecognized garbage also falls back rather than panicking.
        assert_eq!(placed("garbage"), auto);
    }
}
