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
//! Geometry IS the painter's: the outline comes from
//! [`super::paint::shape_path`] (same arcs, radius auto/clamp rules, and
//! degenerate → not-rendered rules), so hits land only on pixels the painter
//! painted. Documented approximations:
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
use tiny_skia::PathSegment;

use super::{FillRuleKind, ShapeAttrs, ShapeKind, ShapePaint};
use bevy_react_core::protocol::animatable::AnimatableField;

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

/// The painter's own outline ([`super::paint::shape_path`] — same defaults,
/// guards, and [`KAPPA`](super::paint::KAPPA) arcs) as a kurbo path, or
/// `None` when the geometry is degenerate (not rendered, so not hittable).
/// tiny-skia's builder already spells out the MoveTo that restarts a subpath
/// drawn after a `Close`, which kurbo needs explicit.
fn shape_to_kurbo(kind: ShapeKind, attrs: &ShapeAttrs) -> Option<BezPath> {
    let path = super::paint::shape_path(kind, attrs)?;
    // Geometry math stays in `f32` (the painter's arithmetic); only the
    // final coordinates widen.
    let pt = |p: tiny_skia::Point| Point::new(p.x as f64, p.y as f64);
    let mut out = BezPath::new();
    for seg in path.segments() {
        match seg {
            PathSegment::MoveTo(p) => out.move_to(pt(p)),
            PathSegment::LineTo(p) => out.line_to(pt(p)),
            PathSegment::QuadTo(c, p) => out.quad_to(pt(c), pt(p)),
            PathSegment::CubicTo(c1, c2, p) => out.curve_to(pt(c1), pt(c2), pt(p)),
            PathSegment::Close => out.close_path(),
        }
    }
    Some(out)
}
