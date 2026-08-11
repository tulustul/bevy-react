//! Geometric hit-testing for JSX `<svg>` shape children — the pointer-side
//! twin of [`super::paint`]. Pure functions over shape data — no ECS, no
//! picking wiring (the picking system inverse-transforms the cursor through
//! the composed viewBox/group/shape transforms into each shape's **local user
//! space** and calls [`hit_shape`] with the local point).
//!
//! Semantics are web `pointer-events: visiblePainted` (the SVG default): a
//! point hits when it is inside the shape's **painted fill** or on its
//! **painted stroke**.
//!
//! - Fill is painted when `fill` is absent (the SVG default, black) or a
//!   color; an explicit `fill="none"` skips the fill test. A `<line>` has no
//!   interior and never fill-tests (the [`super::paint`] contract); a `<g>`
//!   has no geometry and never hits.
//! - Stroke is painted when `stroke` is a color **and** the effective width
//!   (`strokeWidth` default 1.0, user units) is finite and positive.
//! - **Opacity does not affect hittability** — the web's `visiblePainted`
//!   keys on `visibility`, not `opacity`, so `opacity: 0` elements still
//!   receive pointer events. Mirrored here: `opacity` (own or inherited) is
//!   ignored.
//!
//! Geometry mirrors the [`super::paint`] module-doc contract exactly (same
//! `KAPPA` arcs, same radius auto/clamp rules, same degenerate → not-rendered
//! rules), so hits land only on pixels the painter painted. Documented
//! approximations:
//!
//! - **Stroke caps/joins**: the stroke test is distance-to-outline `<`
//!   half-width per curve segment, which uniformly approximates **round**
//!   caps and joins. Butt/square caps and miter corners deviate within
//!   ~half-width at segment ends/joints — accepted v1, no exact cap geometry.
//!   A point exactly at half-width distance misses (strict `<`, pinned).
//! - **On-edge fill points**: a point exactly on the outline resolves by the
//!   winding number's ray-cast parity — a numeric boundary. The pinned
//!   behavior (see tests): a point exactly on a circle's rightmost vertex
//!   does **not** hit the fill (it still hits any painted stroke).
//! - Fill treats **open subpaths as implicitly closed** (SVG fill semantics;
//!   the paint side pins the same rule) — subpaths are explicitly closed in
//!   a copy before the winding test, so kurbo's winding needs no implicit
//!   closing of its own. Stroke keeps the path **open**: a polyline's
//!   implied closing edge fill-hits but never stroke-hits.
//! - Zero-length geometry never stroke-hits (paint parity: the painter skips
//!   zero-extent paths, and round/square cap dots on zero-length subpaths
//!   are a known v1 gap on both sides).
//!
//! Note for the picking wiring ([`super::pick`]): distances are measured in
//! the shape's **local user space**. Under a non-uniform ancestor scale the
//! on-screen stroke ink is anisotropic while this test's distance is
//! isotropic, so stroke hits deviate proportionally to the axis-scale ratio —
//! accepted v1. If profiling ever matters there, the right optimization is
//! caching built `BezPath`s keyed on `Changed<SvgShape>`, not micro-tuning
//! `close_subpaths`.

use bevy::math::Vec2;
use kurbo::{BezPath, ParamCurveNearest, PathEl, PathSeg as KSeg, Point, Shape};

use super::paint::{KAPPA, valid_radius};
use super::{FillRuleKind, PathData, PathSeg, ShapeAttrs, ShapeKind, ShapePaint};
use crate::protocol::{animatable::Animatable, animatable::AnimatableField};

#[cfg(test)]
mod tests;

/// Accuracy passed to kurbo's nearest-point solver, in user units. Far below
/// any meaningful stroke width.
const NEAREST_ACCURACY: f64 = 1e-6;

/// Does `pt` (shape-local user space) hit the shape under web
/// `visiblePainted` semantics? See the module doc for the exact rules.
pub(crate) fn hit_shape(kind: ShapeKind, attrs: &ShapeAttrs, pt: Vec2) -> bool {
    if !(pt.x.is_finite() && pt.y.is_finite()) {
        return false;
    }
    // Painted-ness first: fill is painted when absent (SVG default black) or
    // a color — and a line never fill-tests (no interior, the paint.rs
    // contract); stroke is painted when a color is set. A fully unpainted
    // shape can never hit, so skip building its outline entirely.
    let fill_painted = kind != ShapeKind::Line && !matches!(attrs.fill, Some(ShapePaint::None));
    let stroke_painted = matches!(attrs.stroke, Some(ShapePaint::Color(_)));
    if !fill_painted && !stroke_painted {
        return false;
    }
    let Some(path) = shape_to_kurbo(kind, attrs) else {
        return false; // degenerate geometry: not rendered, so not hittable
    };
    let p = Point::new(pt.x as f64, pt.y as f64);

    if fill_painted && hit_fill(&path, p, attrs.fill_rule.unwrap_or(FillRuleKind::NonZero)) {
        return true;
    }

    // Stroke hits only when the effective width is positive; zero-extent
    // geometry never strokes (paint parity — the painter skips it, so there
    // is no ink to hit).
    if stroke_painted {
        let width = attrs.stroke_width.static_or_seed().unwrap_or(1.0);
        let b = path.bounding_box();
        if width.is_finite()
            && width > 0.0
            && (b.width() > 0.0 || b.height() > 0.0)
            && hit_stroke(&path, p, width as f64 * 0.5)
        {
            return true;
        }
    }
    false
}

/// Fill containment via the winding number, with every open subpath closed
/// first (SVG fill-as-if-closed semantics — kurbo's raw winding does NOT
/// implicitly close, verified by test).
fn hit_fill(path: &BezPath, pt: Point, rule: FillRuleKind) -> bool {
    let w = close_subpaths(path).winding(pt);
    match rule {
        FillRuleKind::NonZero => w != 0,
        FillRuleKind::EvenOdd => w % 2 != 0,
    }
}

/// A copy of `path` with every open subpath explicitly closed. Closing an
/// already-closed subpath adds nothing.
fn close_subpaths(path: &BezPath) -> BezPath {
    let mut out = BezPath::new();
    let mut open = false;
    for el in path.elements() {
        match el {
            PathEl::MoveTo(_) => {
                if open {
                    out.close_path();
                }
                open = true;
            }
            PathEl::ClosePath => open = false,
            _ => {}
        }
        out.push(*el);
    }
    if open {
        out.close_path();
    }
    out
}

/// Stroke containment: minimum distance from `pt` to any real curve segment
/// strictly under `half_width`. This uniformly approximates ROUND caps and
/// joins (module-doc rule); zero-length segments are skipped (no ink —
/// paint parity).
fn hit_stroke(path: &BezPath, pt: Point, half_width: f64) -> bool {
    let hw_sq = half_width * half_width;
    path.segments()
        .filter(|seg| !is_zero_length(seg))
        .any(|seg| seg.nearest(pt, NEAREST_ACCURACY).distance_sq < hw_sq)
}

/// All of the segment's points coincide — a zero-length segment the stroker
/// draws nothing for (butt-cap default).
fn is_zero_length(seg: &KSeg) -> bool {
    match *seg {
        KSeg::Line(l) => l.p0 == l.p1,
        KSeg::Quad(q) => q.p0 == q.p1 && q.p1 == q.p2,
        KSeg::Cubic(c) => c.p0 == c.p1 && c.p1 == c.p2 && c.p2 == c.p3,
    }
}

/// `f32` user-space coordinates → kurbo point. Geometry math stays in `f32`
/// (mirroring [`super::paint`]'s arithmetic exactly); only the final
/// coordinates widen.
fn pt(x: f32, y: f32) -> Point {
    Point::new(x as f64, y as f64)
}

/// Build one shape's outline as a kurbo path, or `None` when the geometry is
/// degenerate — the exact [`super::paint::shape_path`] contract (same
/// defaults, same guards, same [`KAPPA`] arcs; see the paint module doc).
fn shape_to_kurbo(kind: ShapeKind, attrs: &ShapeAttrs) -> Option<BezPath> {
    // Absent geometry defaults to 0 (web behavior); an animated attr
    // reads its seed, or counts as absent until the driver writes.
    let g = |v: &Option<Animatable<f32>>| v.static_or_seed().unwrap_or(0.0);
    match kind {
        ShapeKind::Rect => rect_path(attrs),
        ShapeKind::Circle => {
            let r = g(&attrs.r);
            if !(r.is_finite() && r > 0.0) {
                return None;
            }
            Some(ellipse_path(g(&attrs.cx), g(&attrs.cy), r, r))
        }
        ShapeKind::Ellipse => {
            let rx = valid_radius(attrs.rx.static_or_seed())
                .or(valid_radius(attrs.ry.static_or_seed()))
                .unwrap_or(0.0);
            let ry = valid_radius(attrs.ry.static_or_seed())
                .or(valid_radius(attrs.rx.static_or_seed()))
                .unwrap_or(0.0);
            if rx <= 0.0 || ry <= 0.0 {
                return None;
            }
            Some(ellipse_path(g(&attrs.cx), g(&attrs.cy), rx, ry))
        }
        ShapeKind::Line => {
            let mut p = BezPath::new();
            p.move_to(pt(g(&attrs.x1), g(&attrs.y1)));
            p.line_to(pt(g(&attrs.x2), g(&attrs.y2)));
            Some(p)
        }
        ShapeKind::Polyline => poly_path(attrs.points.as_deref(), false),
        ShapeKind::Polygon => poly_path(attrs.points.as_deref(), true),
        ShapeKind::Path => replay_path(attrs.d.as_ref()?),
        ShapeKind::Group => None,
    }
}

/// `<rect>` mirror of [`super::paint`]'s builder: sharp when either resolved
/// radius is 0, else rounded corners as the same four [`KAPPA`] cubics.
fn rect_path(attrs: &ShapeAttrs) -> Option<BezPath> {
    let (w, h) = (
        attrs.width.static_or_seed().unwrap_or(0.0),
        attrs.height.static_or_seed().unwrap_or(0.0),
    );
    if !(w.is_finite() && w > 0.0 && h.is_finite() && h > 0.0) {
        return None;
    }
    let (x, y) = (
        attrs.x.static_or_seed().unwrap_or(0.0),
        attrs.y.static_or_seed().unwrap_or(0.0),
    );
    let rx = valid_radius(attrs.rx.static_or_seed())
        .or(valid_radius(attrs.ry.static_or_seed()))
        .unwrap_or(0.0);
    let ry = valid_radius(attrs.ry.static_or_seed())
        .or(valid_radius(attrs.rx.static_or_seed()))
        .unwrap_or(0.0);
    let (rx, ry) = (rx.min(w * 0.5), ry.min(h * 0.5));
    let mut p = BezPath::new();
    let (r, b) = (x + w, y + h); // right, bottom
    if rx <= 0.0 || ry <= 0.0 {
        // SVG2: a zero radius on either axis disables rounding entirely.
        p.move_to(pt(x, y));
        p.line_to(pt(r, y));
        p.line_to(pt(r, b));
        p.line_to(pt(x, b));
        p.close_path();
        return Some(p);
    }
    let (kx, ky) = (rx * KAPPA, ry * KAPPA);
    p.move_to(pt(x + rx, y));
    p.line_to(pt(r - rx, y));
    p.curve_to(pt(r - rx + kx, y), pt(r, y + ry - ky), pt(r, y + ry));
    p.line_to(pt(r, b - ry));
    p.curve_to(pt(r, b - ry + ky), pt(r - rx + kx, b), pt(r - rx, b));
    p.line_to(pt(x + rx, b));
    p.curve_to(pt(x + rx - kx, b), pt(x, b - ry + ky), pt(x, b - ry));
    p.line_to(pt(x, y + ry));
    p.curve_to(pt(x, y + ry - ky), pt(x + rx - kx, y), pt(x + rx, y));
    p.close_path();
    Some(p)
}

/// The painter's axis-aligned four-cubic ellipse ([`KAPPA`]), verbatim:
/// rightmost start, clockwise (+y down). Radii must be positive.
fn ellipse_path(cx: f32, cy: f32, rx: f32, ry: f32) -> BezPath {
    let (kx, ky) = (rx * KAPPA, ry * KAPPA);
    let mut p = BezPath::new();
    p.move_to(pt(cx + rx, cy));
    p.curve_to(pt(cx + rx, cy + ky), pt(cx + kx, cy + ry), pt(cx, cy + ry));
    p.curve_to(pt(cx - kx, cy + ry), pt(cx - rx, cy + ky), pt(cx - rx, cy));
    p.curve_to(pt(cx - rx, cy - ky), pt(cx - kx, cy - ry), pt(cx, cy - ry));
    p.curve_to(pt(cx + kx, cy - ry), pt(cx + rx, cy - ky), pt(cx + rx, cy));
    p.close_path();
    p
}

/// `<polyline>`/`<polygon>` outline; fewer than 2 points is not rendered.
/// The polyline stays OPEN — fill closes it per-test ([`hit_fill`]), stroke
/// does not.
fn poly_path(points: Option<&[Vec2]>, close: bool) -> Option<BezPath> {
    let pts = points.unwrap_or(&[]);
    if pts.len() < 2 {
        return None;
    }
    let mut p = BezPath::new();
    p.move_to(pt(pts[0].x, pts[0].y));
    for v in &pts[1..] {
        p.line_to(pt(v.x, v.y));
    }
    if close {
        p.close_path();
    }
    Some(p)
}

/// Replay pre-parsed absolute segments (parse guarantees a leading MoveTo).
/// tiny-skia's builder implicitly restarts a subpath after `Close` when a
/// drawing segment follows; kurbo needs that MoveTo spelled out, so it is
/// inserted here (at the subpath start — where `Close` left the pen).
fn replay_path(d: &PathData) -> Option<BezPath> {
    let mut p = BezPath::new();
    let (mut sx, mut sy) = (0.0f32, 0.0f32); // current subpath start
    let mut after_close = false;
    for seg in &d.0 {
        if after_close && !matches!(seg, PathSeg::MoveTo { .. }) {
            p.move_to(pt(sx, sy));
        }
        after_close = false;
        match *seg {
            PathSeg::MoveTo { x, y } => {
                (sx, sy) = (x, y);
                p.move_to(pt(x, y));
            }
            PathSeg::LineTo { x, y } => p.line_to(pt(x, y)),
            PathSeg::QuadTo { c1x, c1y, x, y } => p.quad_to(pt(c1x, c1y), pt(x, y)),
            PathSeg::CubicTo {
                c1x,
                c1y,
                c2x,
                c2y,
                x,
                y,
            } => p.curve_to(pt(c1x, c1y), pt(c2x, c2y), pt(x, y)),
            PathSeg::Close => {
                p.close_path();
                after_close = true;
            }
        }
    }
    // An empty `d` paints nothing (paint parity: PathBuilder::finish → None).
    (!p.elements().is_empty()).then_some(p)
}
