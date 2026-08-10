//! Pixel and coordinate-math tests for the JSX shape painter — split out of
//! `paint.rs` per the module-size guidance. Everything asserts real pixels or
//! exact transform components; shape attrs decode through the wire
//! deserializer (`serde_json`) so the tests exercise the same decode path the
//! bridge uses.

use bevy::math::Vec2;
use serde_json::json;
use tiny_skia::{Pixmap, Transform};

use super::{paint_shape, shape_path, view_box_transform};
use crate::svg::{ShapeAttrs, ShapeKind, ViewBox, st};

/// Decode a shape-attrs JSON object through the wire deserializer.
fn attrs(v: serde_json::Value) -> ShapeAttrs {
    serde_json::from_value(v).expect("valid shape attrs")
}

fn vb(min_x: f32, min_y: f32, w: f32, h: f32) -> ViewBox {
    ViewBox {
        min: Vec2::new(min_x, min_y),
        size: Vec2::new(w, h),
    }
}

/// RGBA of one pixel, premultiplied (tiny-skia native).
fn px(p: &Pixmap, x: u32, y: u32) -> (u8, u8, u8, u8) {
    let c = p.pixel(x, y).expect("in bounds");
    (c.red(), c.green(), c.blue(), c.alpha())
}

fn alpha(p: &Pixmap, x: u32, y: u32) -> u8 {
    px(p, x, y).3
}

// --- coordinate math ---

/// No viewBox = logical-pixel space: 1 user unit is 1 logical px, so the only
/// scaling is the device pixel ratio onto the physical buffer.
#[test]
fn no_viewbox_scales_by_dpr_only() {
    assert_eq!(
        view_box_transform(None, 300, 200, 1.0),
        Transform::identity()
    );
    assert_eq!(
        view_box_transform(None, 640, 480, 2.0),
        Transform::from_scale(2.0, 2.0)
    );
}

/// `xMidYMid meet`: uniform scale by the tighter axis, the slack axis
/// letterboxed with equal bands on both sides.
#[test]
fn meet_letterbox_centers_the_slack_axis() {
    // Wide viewBox in a square target: scale = min(2, 4) = 2; the 100px of
    // vertical slack splits into 50px bands top and bottom.
    assert_eq!(
        view_box_transform(Some(&vb(0.0, 0.0, 100.0, 50.0)), 200, 200, 1.0),
        Transform::from_row(2.0, 0.0, 0.0, 2.0, 0.0, 50.0)
    );
    // Tall viewBox: bands left and right instead.
    assert_eq!(
        view_box_transform(Some(&vb(0.0, 0.0, 50.0, 100.0)), 200, 200, 1.0),
        Transform::from_row(2.0, 0.0, 0.0, 2.0, 50.0, 0.0)
    );
}

/// A non-zero viewBox min translates content by `-min` *before* the scale:
/// the translation components come out pre-multiplied by the scale.
#[test]
fn meet_min_offset_translates_before_scaling() {
    assert_eq!(
        view_box_transform(Some(&vb(10.0, 20.0, 100.0, 100.0)), 200, 200, 1.0),
        Transform::from_row(2.0, 0.0, 0.0, 2.0, -20.0, -40.0)
    );
}

// --- raster smoke ---

/// The classic red circle (cx 50, cy 50, r 40, viewBox 0 0 100 100) into a
/// 200×200 pixmap: everything scales 2×, so the edge sits at r = 80 around
/// (100, 100).
#[test]
fn circle_rasters_scaled_into_the_box() {
    let mut pm = Pixmap::new(200, 200).unwrap();
    let t = view_box_transform(Some(&vb(0.0, 0.0, 100.0, 100.0)), 200, 200, 1.0);
    let a = attrs(json!({ "cx": 50, "cy": 50, "r": 40, "fill": "red" }));
    paint_shape(&mut pm, ShapeKind::Circle, &a, t, 1.0);
    assert_eq!(px(&pm, 100, 100), (255, 0, 0, 255), "center is opaque red");
    assert_eq!(alpha(&pm, 25, 100), 255, "just inside the scaled r=80 edge");
    assert_eq!(alpha(&pm, 15, 100), 0, "just outside the scaled edge");
}

// --- stroke semantics (the pinned behaviors) ---

/// User-space stroke widths scale with the viewBox transform (SVG semantics):
/// strokeWidth 4 under a 2× transform paints ≈8 device px of ink. This pins
/// tiny-skia's stroke-then-transform behavior; if it painted 4px the painter
/// design would have to pre-scale geometry instead.
#[test]
fn stroke_width_scales_with_the_viewbox_transform() {
    let mut pm = Pixmap::new(200, 200).unwrap();
    let t = view_box_transform(Some(&vb(0.0, 0.0, 100.0, 100.0)), 200, 200, 1.0);
    let a = attrs(json!({
        "x1": 10, "y1": 50, "x2": 90, "y2": 50,
        "stroke": "red", "strokeWidth": 4
    }));
    paint_shape(&mut pm, ShapeKind::Line, &a, t, 1.0);
    let thickness = (80..120).filter(|&y| alpha(&pm, 100, y) > 127).count();
    assert!(
        (7..=9).contains(&thickness),
        "strokeWidth 4 under a 2x transform must paint about 8 px, got {thickness}"
    );
}

/// `stroke-linecap: square` extends half the width past the endpoint; the
/// default butt cap stops exactly at it — pins the linecap enum mapping.
#[test]
fn square_linecap_extends_past_the_endpoint() {
    let line = json!({ "x1": 10, "y1": 20, "x2": 30, "y2": 20, "stroke": "red", "strokeWidth": 8 });
    let mut butt = Pixmap::new(50, 40).unwrap();
    paint_shape(
        &mut butt,
        ShapeKind::Line,
        &attrs(line.clone()),
        Transform::identity(),
        1.0,
    );
    assert_eq!(alpha(&butt, 32, 20), 0, "butt cap ends at the endpoint");
    let mut square = Pixmap::new(50, 40).unwrap();
    let mut with_cap = line;
    with_cap["strokeLinecap"] = json!("square");
    paint_shape(
        &mut square,
        ShapeKind::Line,
        &attrs(with_cap),
        Transform::identity(),
        1.0,
    );
    assert_eq!(
        alpha(&square, 32, 20),
        255,
        "square cap extends width/2 past the endpoint"
    );
}

// --- transform composition ---

/// `attrs.transform` composes INSIDE the outer transform (shape transform
/// applied first): translate(10 0) under a 2× outer scale lands the feature
/// at +20 device px — pins the tiny-skia `pre_concat` direction.
#[test]
fn shape_transform_composes_inside_the_outer_transform() {
    let mut pm = Pixmap::new(60, 30).unwrap();
    let a = attrs(json!({ "width": 10, "height": 10, "transform": "translate(10 0)" }));
    paint_shape(
        &mut pm,
        ShapeKind::Rect,
        &a,
        Transform::from_scale(2.0, 2.0),
        1.0,
    );
    // Correct (pre_concat): x ∈ [20, 40). Wrong direction: x ∈ [10, 30).
    assert_eq!(
        alpha(&pm, 15, 5),
        0,
        "translate must be scaled by the outer transform"
    );
    assert_eq!(alpha(&pm, 25, 5), 255);
    assert_eq!(
        alpha(&pm, 35, 5),
        255,
        "right half missing = translate applied after the scale"
    );
    assert_eq!(alpha(&pm, 45, 5), 0);
}

// --- rect corner radii ---

/// rx set, ry absent → ry = rx (the SVG auto rule); the corner is rounded
/// away while edge midspans stay filled.
#[test]
fn rect_rounds_corners_and_applies_the_auto_ry_rule() {
    let mut pm = Pixmap::new(40, 40).unwrap();
    let a = attrs(json!({ "width": 40, "height": 40, "rx": 10 }));
    paint_shape(&mut pm, ShapeKind::Rect, &a, Transform::identity(), 1.0);
    // (2,2) is 11.3 from the corner-arc center (10,10) — outside r 10.
    assert_eq!(alpha(&pm, 2, 2), 0, "corner rounded away (auto ry = rx)");
    assert_eq!(alpha(&pm, 20, 2), 255, "top edge midspan filled");
    assert_eq!(alpha(&pm, 2, 20), 255, "left edge midspan filled");
}

/// An explicit zero radius on either axis disables rounding entirely (SVG2:
/// "if either rx or ry is zero, no corner rounding occurs").
#[test]
fn rect_explicit_zero_radius_disables_rounding() {
    let mut pm = Pixmap::new(40, 40).unwrap();
    let a = attrs(json!({ "width": 40, "height": 40, "rx": 10, "ry": 0 }));
    paint_shape(&mut pm, ShapeKind::Rect, &a, Transform::identity(), 1.0);
    assert_eq!(alpha(&pm, 1, 1), 255, "ry=0 keeps the corner sharp");
}

// --- polygon / polyline ---

/// Polygon closes its outline; polyline stays open but SVG `fill` still
/// treats the subpath as implicitly closed, so both fill the same interior.
#[test]
fn polygon_closes_and_polyline_fills_as_if_closed() {
    let tri = json!({ "points": [0, 0, 40, 0, 0, 40] });
    let mut pg = Pixmap::new(40, 40).unwrap();
    paint_shape(
        &mut pg,
        ShapeKind::Polygon,
        &attrs(tri.clone()),
        Transform::identity(),
        1.0,
    );
    assert_eq!(alpha(&pg, 8, 8), 255, "polygon interior filled");
    assert_eq!(alpha(&pg, 30, 30), 0, "outside the triangle");
    let mut pl = Pixmap::new(40, 40).unwrap();
    paint_shape(
        &mut pl,
        ShapeKind::Polyline,
        &attrs(tri),
        Transform::identity(),
        1.0,
    );
    assert_eq!(
        alpha(&pl, 8, 8),
        255,
        "SVG fill treats an open polyline as implicitly closed"
    );
}

// --- paint resolution ---

/// Absent fill paints the SVG default (black); explicit `fill="none"` paints
/// nothing.
#[test]
fn fill_defaults_to_black_and_none_skips() {
    let mut pm = Pixmap::new(20, 20).unwrap();
    let a = attrs(json!({ "width": 20, "height": 20 }));
    paint_shape(&mut pm, ShapeKind::Rect, &a, Transform::identity(), 1.0);
    assert_eq!(
        px(&pm, 10, 10),
        (0, 0, 0, 255),
        "absent fill = SVG-default black"
    );
    let mut pm = Pixmap::new(20, 20).unwrap();
    let a = attrs(json!({ "width": 20, "height": 20, "fill": "none" }));
    paint_shape(&mut pm, ShapeKind::Rect, &a, Transform::identity(), 1.0);
    assert_eq!(alpha(&pm, 10, 10), 0, "explicit fill=none paints nothing");
}

/// Two same-direction concentric subpaths: even-odd punches a hole where the
/// default nonzero winding stays solid.
#[test]
fn evenodd_punches_the_donut_hole() {
    let d = "M0 0 H40 V40 H0 Z M10 10 H30 V30 H10 Z";
    let mut eo = Pixmap::new(40, 40).unwrap();
    let a = attrs(json!({ "d": d, "fillRule": "evenodd" }));
    paint_shape(&mut eo, ShapeKind::Path, &a, Transform::identity(), 1.0);
    assert_eq!(
        alpha(&eo, 20, 20),
        0,
        "even-odd: the inner subpath is a hole"
    );
    assert_eq!(alpha(&eo, 5, 20), 255, "the ring is filled");
    let mut nz = Pixmap::new(40, 40).unwrap();
    let a = attrs(json!({ "d": d }));
    paint_shape(&mut nz, ShapeKind::Path, &a, Transform::identity(), 1.0);
    assert_eq!(
        alpha(&nz, 20, 20),
        255,
        "default nonzero winding keeps same-direction subpaths solid"
    );
}

/// Effective alpha = paint alpha × attrs.opacity × inherited opacity:
/// 1.0 × 0.5 × 0.5 ≈ 64/255 premultiplied.
#[test]
fn opacity_multiplies_attr_and_inherited() {
    let mut pm = Pixmap::new(20, 20).unwrap();
    let a = attrs(json!({ "width": 20, "height": 20, "fill": "red", "opacity": 0.5 }));
    paint_shape(&mut pm, ShapeKind::Rect, &a, Transform::identity(), 0.5);
    let (r, _, _, alpha) = px(&pm, 10, 10);
    assert!(
        (60..=68).contains(&alpha),
        "0.5 x 0.5 must give alpha of about 64/255, got {alpha}"
    );
    assert!(
        (60..=68).contains(&r),
        "premultiplied red tracks alpha, got {r}"
    );
}

/// A line has no interior: fill (even an explicit one) never paints.
#[test]
fn line_never_fills() {
    let mut pm = Pixmap::new(40, 40).unwrap();
    let a = attrs(json!({ "x1": 0, "y1": 0, "x2": 40, "y2": 40, "fill": "red" }));
    paint_shape(&mut pm, ShapeKind::Line, &a, Transform::identity(), 1.0);
    assert!(
        pm.pixels().iter().all(|p| p.alpha() == 0),
        "no stroke set and fill must be skipped for a line"
    );
}

// --- degenerate geometry (the rules D1 must mirror) ---

/// Every degenerate case renders nothing — and never panics.
#[test]
fn degenerate_geometry_renders_nothing() {
    let none = |kind, v| shape_path(kind, &attrs(v)).is_none();
    assert!(none(ShapeKind::Rect, json!({})), "width/height default 0");
    assert!(none(ShapeKind::Rect, json!({ "width": -5, "height": 10 })));
    assert!(
        none(ShapeKind::Circle, json!({ "cx": 5, "cy": 5 })),
        "r defaults 0"
    );
    assert!(none(ShapeKind::Circle, json!({ "r": 0 })));
    assert!(
        none(ShapeKind::Ellipse, json!({ "rx": 10, "ry": 0 })),
        "explicit zero radius means not rendered"
    );
    assert!(
        none(ShapeKind::Ellipse, json!({ "cx": 5 })),
        "both radii absent"
    );
    assert!(
        none(ShapeKind::Polyline, json!({ "points": [1, 2] })),
        "one point"
    );
    assert!(none(ShapeKind::Polygon, json!({})), "no points at all");
    assert!(none(ShapeKind::Path, json!({})), "no d");
    assert!(
        none(ShapeKind::Group, json!({ "width": 10, "height": 10 })),
        "groups have no geometry"
    );
    // NaN never panics, never paints (a struct literal — JSON can't carry NaN).
    let a = ShapeAttrs {
        x: st(f32::NAN),
        width: st(10.0),
        height: st(10.0),
        ..Default::default()
    };
    assert!(shape_path(ShapeKind::Rect, &a).is_none());
    let a = ShapeAttrs {
        r: st(f32::NAN),
        ..Default::default()
    };
    assert!(shape_path(ShapeKind::Circle, &a).is_none());
}

/// Ellipse auto rule: a single set radius mirrors onto the other axis.
#[test]
fn ellipse_auto_radius_mirrors_the_other_axis() {
    let p = shape_path(
        ShapeKind::Ellipse,
        &attrs(json!({ "cx": 20, "cy": 20, "rx": 15 })),
    )
    .expect("auto ry = rx renders");
    let b = p.bounds();
    assert_eq!((b.width(), b.height()), (30.0, 30.0));
}
