//! SVG path-data (`d`) parsing: the wire string is parsed **once, at the
//! serde boundary** (the [`crate::protocol`] rule) into a flat list of
//! **absolute-coordinate** segments, so replaying the path at paint time is a
//! plain loop — no re-parsing, no relative/shorthand bookkeeping downstream.
//!
//! `svgtypes`' [`SimplifyingPathParser`] (the resvg-family parser) does the
//! normalizing: relative segments become absolute, `H`/`V` full `LineTo`s,
//! the smooth shorthands (`S`/`T`) full curves via the SVG control-point
//! reflection rule, elliptical arcs (`A`/`a`) cubics, and a segment drawn
//! after a `Z` gets the implicit `MoveTo` back to its subpath start.

use svgtypes::{SimplePathSegment, SimplifyingPathParser};

/// One normalized path segment. Coordinates are always absolute, in the SVG
/// user-unit space of the enclosing `<svg>`'s `viewBox`.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum PathSeg {
    MoveTo {
        x: f32,
        y: f32,
    },
    LineTo {
        x: f32,
        y: f32,
    },
    /// Quadratic Bézier: one control point, then the endpoint. (`c1*` like
    /// `CubicTo`'s scheme — and deliberately NOT `cx`/`cy`, which would shadow
    /// the parse loop's current-point locals of the same name.)
    QuadTo {
        c1x: f32,
        c1y: f32,
        x: f32,
        y: f32,
    },
    /// Cubic Bézier: two control points, then the endpoint.
    CubicTo {
        c1x: f32,
        c1y: f32,
        c2x: f32,
        c2y: f32,
        x: f32,
        y: f32,
    },
    Close,
}

/// A parsed `d` attribute: the normalized segment list (possibly empty — an
/// empty `d` string is a valid, paint-nothing path).
#[derive(Debug, Clone, Default, PartialEq)]
pub struct PathData(pub Vec<PathSeg>);

impl PathData {
    /// Parse a `d` string into normalized absolute segments. `Err` carries the
    /// warn message; the whole path is dropped on any error (a half-parsed
    /// path would silently paint the wrong shape).
    pub(crate) fn parse(d: &str) -> Result<PathData, String> {
        let f = |v: f64| v as f32;
        SimplifyingPathParser::from(d)
            .map(|seg| {
                Ok(
                    match seg.map_err(|e| format!("invalid path data {d:?}: {e}"))? {
                        SimplePathSegment::MoveTo { x, y } => PathSeg::MoveTo { x: f(x), y: f(y) },
                        SimplePathSegment::LineTo { x, y } => PathSeg::LineTo { x: f(x), y: f(y) },
                        SimplePathSegment::Quadratic { x1, y1, x, y } => PathSeg::QuadTo {
                            c1x: f(x1),
                            c1y: f(y1),
                            x: f(x),
                            y: f(y),
                        },
                        SimplePathSegment::CurveTo {
                            x1,
                            y1,
                            x2,
                            y2,
                            x,
                            y,
                        } => PathSeg::CubicTo {
                            c1x: f(x1),
                            c1y: f(y1),
                            c2x: f(x2),
                            c2y: f(y2),
                            x: f(x),
                            y: f(y),
                        },
                        SimplePathSegment::ClosePath => PathSeg::Close,
                    },
                )
            })
            .collect::<Result<_, String>>()
            .map(PathData)
    }
}

#[cfg(test)]
mod tests {
    use super::{PathData, PathSeg};

    /// Mixed absolute/relative input normalizes to the exact absolute segment
    /// list: `l` adds to the current point, `q`/`c` absolute-ize control
    /// points and endpoint, `z` closes.
    #[test]
    fn mixed_relative_absolute_normalizes() {
        let d = PathData::parse("M10 10 l10 0 q5 5 10 0 c1 2 3 4 5 6 z").expect("valid path");
        assert_eq!(
            d.0,
            vec![
                PathSeg::MoveTo { x: 10.0, y: 10.0 },
                PathSeg::LineTo { x: 20.0, y: 10.0 },
                PathSeg::QuadTo {
                    c1x: 25.0,
                    c1y: 15.0,
                    x: 30.0,
                    y: 10.0
                },
                PathSeg::CubicTo {
                    c1x: 31.0,
                    c1y: 12.0,
                    c2x: 33.0,
                    c2y: 14.0,
                    x: 35.0,
                    y: 16.0
                },
                PathSeg::Close,
            ]
        );
    }

    /// `H`/`V` (and their relative forms) become full `LineTo`s; a segment
    /// after a `z` restarts at the subpath start with an explicit `MoveTo`.
    #[test]
    fn h_v_and_close_normalize() {
        let d = PathData::parse("M1 2 H5 v3 h-2 Z l1 1").expect("valid path");
        assert_eq!(
            d.0,
            vec![
                PathSeg::MoveTo { x: 1.0, y: 2.0 },
                PathSeg::LineTo { x: 5.0, y: 2.0 },
                PathSeg::LineTo { x: 5.0, y: 5.0 },
                PathSeg::LineTo { x: 3.0, y: 5.0 },
                PathSeg::Close,
                // After Close the current point is the subpath start (1, 2).
                PathSeg::MoveTo { x: 1.0, y: 2.0 },
                PathSeg::LineTo { x: 2.0, y: 3.0 },
            ]
        );
    }

    /// `S` reflects the previous cubic's second control point about the
    /// current point; `T` reflects the previous quadratic control. When the
    /// previous segment is not of the matching family, the control is the
    /// current point.
    #[test]
    fn smooth_shorthands_expand_via_reflection() {
        let d = PathData::parse("M0 0 C1 1 2 1 3 0 S5 -1 6 0").expect("valid path");
        assert_eq!(
            d.0[2],
            PathSeg::CubicTo {
                // Reflection of (2, 1) about (3, 0) = (4, -1).
                c1x: 4.0,
                c1y: -1.0,
                c2x: 5.0,
                c2y: -1.0,
                x: 6.0,
                y: 0.0
            }
        );
        let d = PathData::parse("M0 0 Q1 2 2 0 T4 0").expect("valid path");
        assert_eq!(
            d.0[2],
            PathSeg::QuadTo {
                // Reflection of (1, 2) about (2, 0) = (3, -2).
                c1x: 3.0,
                c1y: -2.0,
                x: 4.0,
                y: 0.0
            }
        );
        // `T` with no preceding Q/T: control collapses to the current point.
        let d = PathData::parse("M5 5 T9 9").expect("valid path");
        assert_eq!(
            d.0[1],
            PathSeg::QuadTo {
                c1x: 5.0,
                c1y: 5.0,
                x: 9.0,
                y: 9.0
            }
        );
    }

    /// Garbage input fails as a whole — the caller warns and drops the field.
    #[test]
    fn garbage_input_errors() {
        assert!(PathData::parse("M10 10 L nope").is_err());
        // Paths must start with a moveto.
        assert!(PathData::parse("L10 10").is_err());
    }

    /// Elliptical arcs convert to cubics ending at the arc's endpoint.
    #[test]
    fn arcs_become_cubics() {
        let d = PathData::parse("M0 0 A5 5 0 0 1 10 10").expect("arcs are supported");
        assert_eq!(d.0[0], PathSeg::MoveTo { x: 0.0, y: 0.0 });
        assert!(
            d.0[1..]
                .iter()
                .all(|s| matches!(s, PathSeg::CubicTo { .. }))
        );
        let Some(PathSeg::CubicTo { x, y, .. }) = d.0.last() else {
            panic!("no cubic in {:?}", d.0);
        };
        assert!(
            (x - 10.0).abs() < 1e-4 && (y - 10.0).abs() < 1e-4,
            "{:?}",
            d.0
        );
    }

    /// An empty `d` is a valid, paint-nothing path (not an error).
    #[test]
    fn empty_input_is_an_empty_path() {
        assert_eq!(PathData::parse("").expect("valid"), PathData::default());
    }
}
