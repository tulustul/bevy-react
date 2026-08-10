//! Hit-testing pins: each test names the contract rule (or documented
//! approximation) it locks down. Points are shape-local user space — the
//! picking wiring owns all transforms.

use bevy::color::Srgba;
use bevy::math::Vec2;

use super::hit_shape;
use crate::svg::{FillRuleKind, LinejoinKind, PathData, ShapeAttrs, ShapeKind, ShapePaint, st};

fn hit(kind: ShapeKind, attrs: &ShapeAttrs, x: f32, y: f32) -> bool {
    hit_shape(kind, attrs, Vec2::new(x, y))
}

fn red() -> Option<ShapePaint> {
    Some(ShapePaint::Color(Srgba::RED))
}

/// A 100×100-space circle, the raster fixture's shape.
fn circle() -> ShapeAttrs {
    ShapeAttrs {
        cx: st(50.0),
        cy: st(50.0),
        r: st(40.0),
        ..Default::default()
    }
}

/// Open triangle (0,0) → (100,0) → (50,80): two real segments, one implied
/// closing edge.
fn triangle_polyline() -> ShapeAttrs {
    ShapeAttrs {
        points: Some(vec![
            Vec2::new(0.0, 0.0),
            Vec2::new(100.0, 0.0),
            Vec2::new(50.0, 80.0),
        ]),
        ..Default::default()
    }
}

/// Default fill (absent = SVG black): the interior hits, the exterior
/// misses. Exactly-on-edge is a numeric boundary; the pinned behavior is
/// that the rightmost vertex point does NOT fill-hit (module-doc rule).
#[test]
fn circle_interior_hits_exterior_misses() {
    let c = circle();
    assert!(hit(ShapeKind::Circle, &c, 50.0, 50.0), "center");
    assert!(hit(ShapeKind::Circle, &c, 85.0, 50.0), "inside near edge");
    assert!(!hit(ShapeKind::Circle, &c, 91.0, 50.0), "just outside");
    assert!(!hit(ShapeKind::Circle, &c, 0.0, 0.0), "far corner");
    assert!(
        !hit(ShapeKind::Circle, &c, 90.0, 50.0),
        "exactly on r: pinned as miss (on-edge resolves by winding parity)"
    );
}

/// Donut path (two same-direction nested squares): `evenodd` sees the hole,
/// `nonzero` (the default) fills it (winding 2).
#[test]
fn evenodd_donut_hole_misses_nonzero_hole_hits() {
    let d = PathData::parse("M0 0 L100 0 L100 100 L0 100 Z M25 25 L75 25 L75 75 L25 75 Z")
        .expect("valid path");
    let evenodd = ShapeAttrs {
        d: Some(d.clone()),
        fill_rule: Some(FillRuleKind::EvenOdd),
        ..Default::default()
    };
    assert!(!hit(ShapeKind::Path, &evenodd, 50.0, 50.0), "hole misses");
    assert!(hit(ShapeKind::Path, &evenodd, 10.0, 50.0), "ring hits");
    let nonzero = ShapeAttrs {
        d: Some(d),
        ..Default::default() // fill_rule absent = nonzero
    };
    assert!(
        hit(ShapeKind::Path, &nonzero, 50.0, 50.0),
        "nonzero control: the hole HITS (winding 2)"
    );
    assert!(hit(ShapeKind::Path, &nonzero, 10.0, 50.0), "ring hits");
}

/// Stroked line, width 8 (half-width 4): 3px perpendicular off the segment
/// hits, 5px misses; 3px beyond the endpoint hits — the pinned round-cap
/// approximation (a butt cap would miss there).
#[test]
fn line_stroke_distance_and_round_cap_approximation() {
    let l = ShapeAttrs {
        x1: st(10.0),
        y1: st(10.0),
        x2: st(90.0),
        y2: st(10.0),
        stroke: red(),
        stroke_width: st(8.0),
        ..Default::default()
    };
    assert!(hit(ShapeKind::Line, &l, 50.0, 13.0), "3px off: inside ink");
    assert!(
        !hit(ShapeKind::Line, &l, 50.0, 15.0),
        "5px off: outside ink"
    );
    assert!(
        hit(ShapeKind::Line, &l, 93.0, 10.0),
        "3px past the endpoint: hits — round-cap approximation (pinned)"
    );
    assert!(!hit(ShapeKind::Line, &l, 95.0, 10.0), "5px past: misses");
    assert!(
        !hit(ShapeKind::Line, &l, 50.0, 14.0),
        "exactly half-width off: strict `<` misses (pinned)"
    );
}

/// A line NEVER fill-tests (no interior — the paint.rs contract): with fill
/// left at its painted default and no stroke, nothing hits, even on the
/// segment itself.
#[test]
fn line_never_fill_tests() {
    let l = ShapeAttrs {
        x1: st(10.0),
        y1: st(10.0),
        x2: st(90.0),
        y2: st(10.0),
        ..Default::default()
    };
    assert!(!hit(ShapeKind::Line, &l, 50.0, 10.0), "on the segment");
}

/// Painted-ness gates every test: fill "none" + no stroke hits nowhere;
/// fill "none" + stroke hits only near the outline; absent fill (SVG
/// default black) hits the interior.
#[test]
fn unpainted_fill_and_stroke_combinations() {
    let rect = |fill, stroke| ShapeAttrs {
        width: st(100.0),
        height: st(50.0),
        fill,
        stroke,
        ..Default::default()
    };
    let bare = rect(Some(ShapePaint::None), None);
    assert!(
        !hit(ShapeKind::Rect, &bare, 50.0, 25.0),
        "interior: nothing painted"
    );
    assert!(
        !hit(ShapeKind::Rect, &bare, 100.2, 25.0),
        "near edge: nothing painted"
    );

    let outline_only = rect(Some(ShapePaint::None), red()); // width default 1.0
    assert!(
        hit(ShapeKind::Rect, &outline_only, 100.3, 25.0),
        "0.3px outside the right edge: inside the default 1.0 stroke"
    );
    assert!(
        !hit(ShapeKind::Rect, &outline_only, 50.0, 25.0),
        "deep interior: fill is none, stroke is far"
    );

    let default_fill = rect(None, None);
    assert!(
        hit(ShapeKind::Rect, &default_fill, 50.0, 25.0),
        "absent fill = SVG default black = painted"
    );
}

/// The open-subpath fill/stroke asymmetry, pinned on the open triangle:
/// fill treats the polyline as closed (interior hits), but the stroke only
/// covers the two REAL segments — a point outside the fill area near the
/// implied closing edge hits nothing.
#[test]
fn polyline_fill_as_closed_but_stroke_stays_open() {
    // Default fill: the interior hits even though the outline is open.
    let filled = triangle_polyline();
    assert!(
        hit(ShapeKind::Polyline, &filled, 50.0, 30.0),
        "interior fill-hits: open subpath fills as if closed"
    );

    // Stroke-only: 3px OUTSIDE the fill, right next to the implied closing
    // edge (0,0)→(50,80). Midpoint (25,40) + 3 × outward normal.
    let n = Vec2::new(-80.0, 50.0).normalize();
    let outside_closing = Vec2::new(25.0, 40.0) + 3.0 * n;
    let stroked = ShapeAttrs {
        fill: Some(ShapePaint::None),
        stroke: red(),
        stroke_width: st(8.0),
        ..triangle_polyline()
    };
    assert!(
        !hit_shape(ShapeKind::Polyline, &stroked, outside_closing),
        "near the implied closing edge, outside the fill: no stroke there"
    );
    assert!(
        hit(ShapeKind::Polyline, &stroked, 50.0, -2.0),
        "2px off a REAL segment: stroke hits"
    );
    // Fill + stroke together: the same outside-the-closing-edge point still
    // misses (no fill there either).
    let both = ShapeAttrs {
        stroke: red(),
        stroke_width: st(8.0),
        ..triangle_polyline()
    };
    assert!(!hit_shape(ShapeKind::Polyline, &both, outside_closing));
    // Polygon control: the CLOSED variant strokes its closing edge.
    let polygon = ShapeAttrs {
        fill: Some(ShapePaint::None),
        stroke: red(),
        stroke_width: st(8.0),
        ..triangle_polyline()
    };
    assert!(
        hit_shape(ShapeKind::Polygon, &polygon, outside_closing),
        "polygon closes: the same point IS on its stroked closing edge"
    );
}

/// The rect radius rules, pinned via a corner point: an explicit `rx=0`
/// disables rounding entirely (sharp corner contains the point), while an
/// absent `rx` mirrors `ry` (rounded corner excludes it).
#[test]
fn rect_rx_explicit_zero_vs_auto_mirror() {
    let rect = |rx| ShapeAttrs {
        width: st(100.0),
        height: st(100.0),
        rx,
        ry: st(20.0),
        ..Default::default()
    };
    assert!(
        hit(ShapeKind::Rect, &rect(st(0.0)), 2.0, 2.0),
        "explicit rx=0 disables rounding: the sharp corner hits"
    );
    assert!(
        !hit(ShapeKind::Rect, &rect(None), 2.0, 2.0),
        "absent rx mirrors ry=20: (2,2) is outside the rounded corner"
    );
    assert!(
        hit(ShapeKind::Rect, &rect(None), 50.0, 50.0),
        "the rounded rect still fills its center"
    );
    assert!(
        !hit(ShapeKind::Rect, &rect(st(-5.0)), 2.0, 2.0),
        "negative rx is invalid-as-auto: mirrors ry=20, corner misses"
    );
}

/// Curve segments (QuadTo/CubicTo) stroke-hit within the width.
#[test]
fn path_curves_stroke_hit() {
    let stroked = |d: &str| ShapeAttrs {
        d: Some(PathData::parse(d).expect("valid path")),
        fill: Some(ShapePaint::None),
        stroke: red(),
        stroke_width: st(8.0),
        ..Default::default()
    };
    // Quad apex at (50, 50).
    let quad = stroked("M0 0 Q50 100 100 0");
    assert!(hit(ShapeKind::Path, &quad, 50.0, 52.0), "2px off the apex");
    assert!(!hit(ShapeKind::Path, &quad, 50.0, 60.0), "10px off");
    // Cubic apex at (50, 75).
    let cubic = stroked("M0 0 C0 100 100 100 100 0");
    assert!(hit(ShapeKind::Path, &cubic, 50.0, 73.0), "2px off the apex");
    assert!(!hit(ShapeKind::Path, &cubic, 50.0, 60.0), "15px off");
}

/// `opacity: 0` still hits — web `visiblePainted` keys on visibility, not
/// opacity (the module-doc rule). Inherited opacity is D2's concern; the
/// shape's own opacity is pinned here.
#[test]
fn zero_opacity_still_hits() {
    let c = ShapeAttrs {
        opacity: st(0.0),
        ..circle()
    };
    assert!(hit(ShapeKind::Circle, &c, 50.0, 50.0));
}

/// Degenerate geometry and non-finite input never panic and never hit —
/// the paint.rs not-rendered rules, mirrored.
#[test]
fn degenerate_and_non_finite_never_hit_never_panic() {
    // Group: no geometry.
    assert!(!hit(ShapeKind::Group, &ShapeAttrs::default(), 0.0, 0.0));
    // Rect with non-positive extent.
    let bad_rect = ShapeAttrs {
        width: st(-5.0),
        height: st(50.0),
        ..Default::default()
    };
    assert!(!hit(ShapeKind::Rect, &bad_rect, 0.0, 0.0));
    // Circle with NaN radius.
    let nan_circle = ShapeAttrs {
        cx: st(50.0),
        cy: st(50.0),
        r: st(f32::NAN),
        ..Default::default()
    };
    assert!(!hit(ShapeKind::Circle, &nan_circle, 50.0, 50.0));
    // NaN cursor point.
    assert!(!hit(ShapeKind::Circle, &circle(), f32::NAN, 50.0));
    // Single-point polyline (< 2 points → not rendered).
    let dot = ShapeAttrs {
        points: Some(vec![Vec2::new(10.0, 10.0)]),
        ..Default::default()
    };
    assert!(!hit(ShapeKind::Polyline, &dot, 10.0, 10.0));
    // Zero-length line: zero-extent geometry never stroke-hits (paint
    // parity — the painter skips it too).
    let dot_line = ShapeAttrs {
        x1: st(10.0),
        y1: st(10.0),
        x2: st(10.0),
        y2: st(10.0),
        stroke: red(),
        stroke_width: st(8.0),
        ..Default::default()
    };
    assert!(!hit(ShapeKind::Line, &dot_line, 10.0, 12.0));
    // NaN vertex in a stroked+filled polyline: must not panic.
    let nan_poly = ShapeAttrs {
        points: Some(vec![
            Vec2::new(0.0, 0.0),
            Vec2::new(f32::NAN, 10.0),
            Vec2::new(20.0, 0.0),
        ]),
        stroke: red(),
        stroke_width: st(8.0),
        ..Default::default()
    };
    let _ = hit(ShapeKind::Polyline, &nan_poly, 5.0, 5.0);
    // Zero and negative stroke widths are no-stroke (spec + invalid).
    for w in [0.0, -4.0, f32::NAN] {
        let l = ShapeAttrs {
            x2: st(100.0),
            stroke: red(),
            stroke_width: st(w),
            ..Default::default()
        };
        assert!(!hit(ShapeKind::Line, &l, 50.0, 0.0), "width {w}");
    }
}

/// kurbo's raw winding does NOT implicitly close open subpaths (the open
/// triangle's interior windings 0), so [`super::close_subpaths`] is
/// load-bearing for the SVG fill-as-if-closed rule — this pin guards it
/// across kurbo upgrades.
#[test]
fn kurbo_raw_winding_needs_the_explicit_close() {
    use kurbo::{BezPath, Point, Shape};
    let mut p = BezPath::new();
    p.move_to(Point::new(0.0, 0.0));
    p.line_to(Point::new(100.0, 0.0));
    p.line_to(Point::new(50.0, 80.0));
    let interior = Point::new(50.0, 30.0);
    assert_eq!(p.winding(interior), 0, "raw winding: open = not inside");
    assert_eq!(
        super::close_subpaths(&p).winding(interior),
        1,
        "closed copy: inside"
    );
}

/// The post-`Z` implicit-restart rule, wire-reachable via `"… Z L…"`: a
/// drawing segment after Close continues from the closed subpath's start
/// (tiny-skia's builder does this implicitly; `replay_path` must spell out
/// the MoveTo for kurbo, and this pins that branch).
#[test]
fn drawing_after_close_restarts_the_subpath_for_fill() {
    // Small closed square, Z, then an open 40×40 outline continuing from
    // (0,0) — filled-as-closed it covers the big square.
    let d = PathData::parse("M0 0 H10 V10 H0 Z L40 0 L40 40 L0 40").expect("valid path");
    let a = ShapeAttrs {
        d: Some(d),
        ..Default::default()
    };
    assert!(
        hit(ShapeKind::Path, &a, 25.0, 25.0),
        "inside the post-Z subpath (outside the first square): the restart MoveTo is load-bearing"
    );
    assert!(
        hit(ShapeKind::Path, &a, 5.0, 5.0),
        "inside the first square"
    );
    assert!(!hit(ShapeKind::Path, &a, 50.0, 25.0), "outside both");
}

/// Machine-check of the two-builder mirror: rasterize via the REAL painter
/// and assert `hit_shape` agrees with pixel coverage on a sampled grid,
/// excluding the anti-aliased edge band. Each sample's 3×3 pixel block must
/// be uniformly opaque (expect hit) or uniformly blank (expect miss); mixed
/// blocks are the excluded ~1px band. This catches STRUCTURAL drift between
/// the builders that the shared constants cannot.
fn assert_raster_hit_parity(kind: ShapeKind, attrs: &ShapeAttrs, name: &str) {
    let mut pixmap = tiny_skia::Pixmap::new(64, 64).expect("pixmap");
    crate::svg::paint::paint_shape(
        &mut pixmap,
        kind,
        attrs,
        tiny_skia::Transform::identity(),
        1.0,
    );
    let mut painted_samples = 0u32;
    for py in 2..62i32 {
        for px in 2..62i32 {
            let mut block = Vec::with_capacity(9);
            for dy in -1..=1i32 {
                for dx in -1..=1i32 {
                    let p = pixmap
                        .pixel((px + dx) as u32, (py + dy) as u32)
                        .expect("in bounds");
                    block.push(p.alpha());
                }
            }
            let expect = if block.iter().all(|&a| a >= 250) {
                true
            } else if block.iter().all(|&a| a == 0) {
                false
            } else {
                continue; // anti-aliased edge band: excluded
            };
            painted_samples += u32::from(expect);
            let p = Vec2::new(px as f32 + 0.5, py as f32 + 0.5);
            assert_eq!(
                hit_shape(kind, attrs, p),
                expect,
                "{name}: raster and hit disagree at ({px},{py})"
            );
        }
    }
    assert!(
        painted_samples >= 50,
        "{name}: only {painted_samples} opaque samples — fixture too small to be meaningful"
    );
}

/// Raster-vs-hit parity across every builder family. The stroked fixture
/// uses ROUND joins so the painter's join geometry matches the hit test's
/// round approximation exactly (a 90° round join IS distance-to-segments).
#[test]
fn raster_and_hit_agree_away_from_edges() {
    let rounded_rect = ShapeAttrs {
        x: st(6.0),
        y: st(8.0),
        width: st(50.0),
        height: st(44.0),
        rx: st(14.0), // ry auto-mirrors
        ..Default::default()
    };
    assert_raster_hit_parity(ShapeKind::Rect, &rounded_rect, "rounded rect");

    let ellipse = ShapeAttrs {
        cx: st(32.0),
        cy: st(32.0),
        rx: st(26.0),
        ry: st(16.0),
        ..Default::default()
    };
    assert_raster_hit_parity(ShapeKind::Ellipse, &ellipse, "ellipse");

    // Concave arrowhead: nonzero fill over a non-convex outline.
    let polygon = ShapeAttrs {
        points: Some(vec![
            Vec2::new(8.0, 56.0),
            Vec2::new(32.0, 10.0),
            Vec2::new(56.0, 56.0),
            Vec2::new(32.0, 42.0),
        ]),
        ..Default::default()
    };
    assert_raster_hit_parity(ShapeKind::Polygon, &polygon, "concave polygon");

    // Curves (Q + C), a Close, then a post-Z subpath restart.
    let curves = ShapeAttrs {
        d: Some(
            PathData::parse("M10 30 Q30 6 50 30 C50 46 40 54 26 50 Z L10 56 L30 56")
                .expect("valid path"),
        ),
        ..Default::default()
    };
    assert_raster_hit_parity(ShapeKind::Path, &curves, "curved path with close-restart");

    let stroked_rect = ShapeAttrs {
        x: st(14.0),
        y: st(14.0),
        width: st(36.0),
        height: st(36.0),
        fill: Some(ShapePaint::None),
        stroke: red(),
        stroke_width: st(6.0),
        stroke_linejoin: Some(LinejoinKind::Round),
        ..Default::default()
    };
    assert_raster_hit_parity(ShapeKind::Rect, &stroked_rect, "stroke-only rect");
}
