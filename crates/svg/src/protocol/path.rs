//! SVG path-data (`d`) parsing: the wire string is parsed **once, at the
//! serde boundary** (the [`crate::protocol`] rule) into a flat list of
//! **absolute-coordinate** segments, so replaying the path at paint time is a
//! plain loop — no re-parsing, no relative/shorthand bookkeeping downstream.
//!
//! The grammar work is done by `svgtypes`' [`PathParser`] (the resvg-family
//! parser); this module normalizes what it yields: relative segments become
//! absolute, `H`/`V` become full `LineTo`s, and the smooth shorthands (`S`/`T`)
//! are expanded to full curves via the SVG control-point reflection rule.
//!
//! Elliptical arcs (`A`/`a`) are **unsupported in v1**: `svgtypes` offers no
//! arc→cubic conversion helper, and hand-rolling the endpoint-to-center math
//! is out of scope, so a path containing an arc fails as a whole (the caller
//! warns with kind `"shapePath"` and drops the field — never a partial path).

use svgtypes::{PathParser, PathSegment};

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
        let mut segs = Vec::new();
        // Normalization state, kept in f64 (the parser's unit) so long chains
        // of relative segments don't accumulate f32 rounding.
        let (mut cx, mut cy) = (0.0f64, 0.0f64); // current point
        let (mut sx, mut sy) = (0.0f64, 0.0f64); // current subpath start
        // The reflection sources for the smooth shorthands: the previous
        // segment's last control point, `Some` only when that segment was of
        // the matching family (SVG's "if the previous command was not a
        // C/S (resp. Q/T), the control point is the current point" rule).
        let mut prev_cubic: Option<(f64, f64)> = None;
        let mut prev_quad: Option<(f64, f64)> = None;
        for seg in PathParser::from(d) {
            let seg = seg.map_err(|e| format!("invalid path data {d:?}: {e}"))?;
            // Resolve a possibly-relative endpoint against the current point.
            let abs = |is_abs: bool, x: f64, y: f64| {
                if is_abs { (x, y) } else { (cx + x, cy + y) }
            };
            match seg {
                PathSegment::MoveTo { abs: a, x, y } => {
                    (cx, cy) = abs(a, x, y);
                    (sx, sy) = (cx, cy);
                    (prev_cubic, prev_quad) = (None, None);
                    segs.push(PathSeg::MoveTo {
                        x: cx as f32,
                        y: cy as f32,
                    });
                }
                PathSegment::LineTo { abs: a, x, y } => {
                    (cx, cy) = abs(a, x, y);
                    (prev_cubic, prev_quad) = (None, None);
                    segs.push(PathSeg::LineTo {
                        x: cx as f32,
                        y: cy as f32,
                    });
                }
                PathSegment::HorizontalLineTo { abs: a, x } => {
                    cx = if a { x } else { cx + x };
                    (prev_cubic, prev_quad) = (None, None);
                    segs.push(PathSeg::LineTo {
                        x: cx as f32,
                        y: cy as f32,
                    });
                }
                PathSegment::VerticalLineTo { abs: a, y } => {
                    cy = if a { y } else { cy + y };
                    (prev_cubic, prev_quad) = (None, None);
                    segs.push(PathSeg::LineTo {
                        x: cx as f32,
                        y: cy as f32,
                    });
                }
                PathSegment::CurveTo {
                    abs: a,
                    x1,
                    y1,
                    x2,
                    y2,
                    x,
                    y,
                } => {
                    let (c1x, c1y) = abs(a, x1, y1);
                    let (c2x, c2y) = abs(a, x2, y2);
                    (cx, cy) = abs(a, x, y);
                    (prev_cubic, prev_quad) = (Some((c2x, c2y)), None);
                    segs.push(PathSeg::CubicTo {
                        c1x: c1x as f32,
                        c1y: c1y as f32,
                        c2x: c2x as f32,
                        c2y: c2y as f32,
                        x: cx as f32,
                        y: cy as f32,
                    });
                }
                PathSegment::SmoothCurveTo {
                    abs: a,
                    x2,
                    y2,
                    x,
                    y,
                } => {
                    // First control = reflection of the previous cubic's
                    // second control about the current point.
                    let (px, py) = prev_cubic.unwrap_or((cx, cy));
                    let (c1x, c1y) = (2.0 * cx - px, 2.0 * cy - py);
                    let (c2x, c2y) = abs(a, x2, y2);
                    (cx, cy) = abs(a, x, y);
                    (prev_cubic, prev_quad) = (Some((c2x, c2y)), None);
                    segs.push(PathSeg::CubicTo {
                        c1x: c1x as f32,
                        c1y: c1y as f32,
                        c2x: c2x as f32,
                        c2y: c2y as f32,
                        x: cx as f32,
                        y: cy as f32,
                    });
                }
                PathSegment::Quadratic {
                    abs: a,
                    x1,
                    y1,
                    x,
                    y,
                } => {
                    let (qx, qy) = abs(a, x1, y1);
                    (cx, cy) = abs(a, x, y);
                    (prev_cubic, prev_quad) = (None, Some((qx, qy)));
                    segs.push(PathSeg::QuadTo {
                        c1x: qx as f32,
                        c1y: qy as f32,
                        x: cx as f32,
                        y: cy as f32,
                    });
                }
                PathSegment::SmoothQuadratic { abs: a, x, y } => {
                    let (px, py) = prev_quad.unwrap_or((cx, cy));
                    let (qx, qy) = (2.0 * cx - px, 2.0 * cy - py);
                    (cx, cy) = abs(a, x, y);
                    (prev_cubic, prev_quad) = (None, Some((qx, qy)));
                    segs.push(PathSeg::QuadTo {
                        c1x: qx as f32,
                        c1y: qy as f32,
                        x: cx as f32,
                        y: cy as f32,
                    });
                }
                PathSegment::EllipticalArc { .. } => {
                    return Err(format!("arc segments unsupported in v1 in path data {d:?}"));
                }
                PathSegment::ClosePath { .. } => {
                    (cx, cy) = (sx, sy);
                    (prev_cubic, prev_quad) = (None, None);
                    segs.push(PathSeg::Close);
                }
            }
        }
        Ok(PathData(segs))
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

    /// `H`/`V` (and their relative forms) become full `LineTo`s; the segment
    /// after a `z` continues from the subpath start.
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

    /// Arcs are unsupported in v1: the whole path is rejected, with a message
    /// naming the limitation.
    #[test]
    fn arcs_are_rejected_whole() {
        let err = PathData::parse("M0 0 A5 5 0 0 1 10 10").expect_err("arc must be rejected");
        assert!(err.contains("arc segments unsupported"), "{err}");
    }

    /// An empty `d` is a valid, paint-nothing path (not an error).
    #[test]
    fn empty_input_is_an_empty_path() {
        assert_eq!(PathData::parse("").expect("valid"), PathData::default());
    }
}
