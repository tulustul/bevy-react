//! Pure tiny-skia painting for JSX `<svg>` shape children: coordinate math,
//! per-kind path construction, and single-shape fill/stroke. No ECS and no
//! systems — the raster walker (which descends the `<svg>` root's children,
//! composing group transforms and opacity) calls [`paint_shape`] once per
//! **leaf** with the composed values; groups have no geometry and are never
//! painted directly.
//!
//! **viewBox fitting is `xMidYMid meet` only** in v1: there is no
//! `preserveAspectRatio` wire prop, so no stretch/slice modes exist here. The
//! math intentionally mirrors [`rasterize_document`](super::rasterize_document)
//! (file mode) — both call the shared [`meet_transform`].
//!
//! Geometry rules (documented here because the hit-tester must mirror them
//! exactly — one geometry contract, two backends):
//!
//! - Absent geometry attributes default to **0** (web behavior); a shape whose
//!   resolved geometry is degenerate returns `None` from [`shape_path`] and is
//!   not rendered — never a panic, including NaN/∞ input (tiny-skia's builders
//!   reject non-finite bounds).
//! - **rect**: `width`/`height` non-finite or ≤ 0 → not rendered. Radii follow
//!   the SVG auto rule: an *absent* radius takes the other's value; a negative
//!   or non-finite radius is invalid and treated as absent (auto); an
//!   **explicit 0** on either axis disables rounding entirely (SVG2); radii
//!   clamp to half the extents. Rounded corners are cubic arc approximations
//!   ([`KAPPA`]).
//! - **circle**: `r` non-finite or ≤ 0 → not rendered.
//! - **ellipse**: same auto rule as rect radii (one absent radius mirrors the
//!   other); either resolved radius non-finite or ≤ 0 → not rendered.
//! - **line**: just Move+Line; a line has no interior, so fill is skipped
//!   explicitly in [`paint_shape`].
//! - **polyline/polygon**: fewer than 2 points → not rendered; polygon closes
//!   its outline, polyline stays open — but SVG `fill` treats an open subpath
//!   as implicitly closed (tiny-skia's fill does too), so both fill the same
//!   interior; only the stroke differs.
//! - **path**: replays the pre-parsed absolute [`PathSeg`] list; absent/empty
//!   `d` → not rendered.
//! - **group**: no geometry, always `None`.
//!
//! Paint rules: absent `fill` → black, explicit `"none"` → skip; absent
//! `stroke` or `"none"` → skip; `strokeWidth` defaults to 1.0, non-finite or
//! ≤ 0 skips the stroke (0 is the spec's no-stroke; negative is invalid and
//! treated the same). Stroke width is in **user units**: tiny-skia outlines
//! the stroke in path space and then transforms, so the viewBox scale scales
//! the ink (pinned by test). Effective alpha = paint alpha × `opacity` ×
//! inherited opacity. `attrs.transform` composes **inside** the passed
//! transform (shape transform first, then viewBox/DPR — `pre_concat`, pinned
//! by test).

use bevy::color::Srgba;
use bevy::math::Vec2;
use tiny_skia::{FillRule, LineCap, LineJoin, Paint, Path, PathBuilder, Pixmap, Stroke, Transform};

use super::{
    FillRuleKind, LinecapKind, LinejoinKind, PathData, PathSeg, ShapeAttrs, ShapeKind, ShapePaint,
    ShapeTransform, ViewBox,
};
use crate::protocol::{Animatable, AnimatableField};

#[cfg(test)]
mod tests;

/// Cubic-Bézier quarter-circle control-point distance (as a fraction of the
/// radius): the standard 4-cubic circle approximation constant. Shared with
/// [`super::hit`] so the hit-tester's arcs are the painter's arcs.
pub(super) const KAPPA: f32 = 0.552_284_8;

/// [`ShapeTransform`] (SVG matrix order `[a b c d e f]`) → tiny-skia — the
/// same field order. Lives here rather than on the wire type so the protocol
/// module stays raster-agnostic (its documented rule).
impl From<&ShapeTransform> for Transform {
    fn from(t: &ShapeTransform) -> Self {
        let ShapeTransform([a, b, c, d, e, f]) = *t;
        Transform::from_row(a, b, c, d, e, f)
    }
}

/// Uniform `xMidYMid meet` fit of the content rect (`min`, `size`, user
/// units) into a `w`×`h` pixel box: scale by the tighter axis, center the
/// slack axis, translating by `-min` first. Shared by the file-mode
/// rasterizer ([`super::rasterize_document`]) and [`view_box_transform`].
/// `size` must be positive (callers guard).
pub(crate) fn meet_transform(min: Vec2, size: Vec2, w: u32, h: u32) -> Transform {
    let scale = (w as f32 / size.x).min(h as f32 / size.y);
    let tx = (w as f32 - size.x * scale) * 0.5 - min.x * scale;
    let ty = (h as f32 - size.y * scale) * 0.5 - min.y * scale;
    Transform::from_row(scale, 0.0, 0.0, scale, tx, ty)
}

/// The user-unit → physical-pixel transform of a JSX `<svg>` element.
///
/// - `None`: logical-pixel space — 1 user unit = 1 logical px of the laid-out
///   box, so the only scaling is the device pixel ratio (`scale_factor`).
/// - `Some`: `xMidYMid meet` (the only mode in v1 — no `preserveAspectRatio`
///   wire prop exists). The viewBox maps onto the whole physical box, which
///   already includes the DPR, so `scale_factor` plays no part.
///
/// A degenerate viewBox (non-positive size — unreachable via the wire, the
/// parser rejects it) falls back to logical-pixel space.
pub(crate) fn view_box_transform(
    view_box: Option<&ViewBox>,
    w_px: u32,
    h_px: u32,
    scale_factor: f32,
) -> Transform {
    match view_box {
        Some(vb) if vb.size.x > 0.0 && vb.size.y > 0.0 => {
            meet_transform(vb.min, vb.size, w_px, h_px)
        }
        _ => Transform::from_scale(scale_factor, scale_factor),
    }
}

/// Build the outline of one shape in user units, or `None` when the shape's
/// geometry is degenerate (see the module doc for the per-kind rules — the
/// hit-tester mirrors them).
pub(crate) fn shape_path(kind: ShapeKind, attrs: &ShapeAttrs) -> Option<Path> {
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
            ellipse_path(g(&attrs.cx), g(&attrs.cy), r, r)
        }
        ShapeKind::Ellipse => {
            // Auto rule: an absent radius mirrors the other; invalid
            // (negative/non-finite) counts as absent.
            let rx = valid_radius(attrs.rx.static_or_seed())
                .or(valid_radius(attrs.ry.static_or_seed()))
                .unwrap_or(0.0);
            let ry = valid_radius(attrs.ry.static_or_seed())
                .or(valid_radius(attrs.rx.static_or_seed()))
                .unwrap_or(0.0);
            if rx <= 0.0 || ry <= 0.0 {
                return None;
            }
            ellipse_path(g(&attrs.cx), g(&attrs.cy), rx, ry)
        }
        ShapeKind::Line => {
            let mut pb = PathBuilder::new();
            pb.move_to(g(&attrs.x1), g(&attrs.y1));
            pb.line_to(g(&attrs.x2), g(&attrs.y2));
            pb.finish()
        }
        ShapeKind::Polyline => poly_path(attrs.points.as_deref(), false),
        ShapeKind::Polygon => poly_path(attrs.points.as_deref(), true),
        ShapeKind::Path => replay_path(attrs.d.as_ref()?),
        ShapeKind::Group => None,
    }
}

/// Paint ONE leaf shape onto the pixmap: fill (SVG default black) then stroke
/// (SVG default none), with `attrs.transform` composed inside `transform` and
/// `inherited_opacity` (the walker's composed group opacity) multiplied into
/// both paints. See the module doc for the full default/degenerate rules.
pub(crate) fn paint_shape(
    pixmap: &mut Pixmap,
    kind: ShapeKind,
    attrs: &ShapeAttrs,
    transform: Transform,
    inherited_opacity: f32,
) {
    let Some(path) = shape_path(kind, attrs) else {
        return;
    };
    // Shape transform first, then the outer (viewBox/DPR) transform:
    // pre_concat maps p → transform(shape_t(p)). Pinned by test.
    let full = match &attrs.transform {
        Some(t) => transform.pre_concat(t.into()),
        None => transform,
    };
    let opacity = attrs
        .opacity
        .static_or_seed()
        .unwrap_or(1.0)
        .clamp(0.0, 1.0)
        * inherited_opacity.clamp(0.0, 1.0);

    // Fill: absent → SVG-default black; explicit "none" → skip. A line has no
    // interior, so skip its fill outright (it would only no-op anyway).
    if kind != ShapeKind::Line {
        match attrs.fill.unwrap_or(ShapePaint::Color(Srgba::BLACK)) {
            ShapePaint::Color(c) => {
                let rule = match attrs.fill_rule.unwrap_or(FillRuleKind::NonZero) {
                    FillRuleKind::NonZero => FillRule::Winding,
                    FillRuleKind::EvenOdd => FillRule::EvenOdd,
                };
                pixmap.fill_path(&path, &solid(c, opacity), rule, full, None);
            }
            ShapePaint::None => {}
        }
    }

    // Stroke: absent and "none" both skip. Width is in user units — the
    // transform scales the ink (pinned by test).
    match attrs.stroke {
        Some(ShapePaint::Color(c)) => {
            let width = attrs.stroke_width.static_or_seed().unwrap_or(1.0);
            // 0 = the spec's no-stroke; negative/NaN invalid, treated the same.
            // A zero-extent path (single point / empty) has an empty butt-cap
            // outline; tiny-skia's stroker warns "path stroking failed" on it,
            // so skip like the canvas does. v1 limit: zero-length subpaths
            // never draw round/square cap dots.
            let b = path.bounds();
            if width.is_finite() && width > 0.0 && (b.width() > 0.0 || b.height() > 0.0) {
                let stroke = Stroke {
                    width,
                    line_cap: match attrs.stroke_linecap.unwrap_or(LinecapKind::Butt) {
                        LinecapKind::Butt => LineCap::Butt,
                        LinecapKind::Round => LineCap::Round,
                        LinecapKind::Square => LineCap::Square,
                    },
                    line_join: match attrs.stroke_linejoin.unwrap_or(LinejoinKind::Miter) {
                        LinejoinKind::Miter => LineJoin::Miter,
                        LinejoinKind::Round => LineJoin::Round,
                        LinejoinKind::Bevel => LineJoin::Bevel,
                    },
                    ..Stroke::default()
                };
                pixmap.stroke_path(&path, &solid(c, opacity), &stroke, full, None);
            }
        }
        Some(ShapePaint::None) | None => {}
    }
}

/// A radius attribute value usable as an explicit radius: negative or
/// non-finite is invalid per SVG2 and treated as absent (auto). Note an
/// explicit `0.0` **passes** — "explicitly zero" is meaningful (it disables
/// rect rounding and un-renders an ellipse axis), unlike "absent". Shared
/// with [`super::hit`] so both sides resolve radii identically.
pub(super) fn valid_radius(v: Option<f32>) -> Option<f32> {
    v.filter(|v| v.is_finite() && *v >= 0.0)
}

/// `<rect>`: sharp when either resolved radius is 0, else rounded corners as
/// four cubic arcs. See the module doc for the radius auto/clamp rules.
fn rect_path(attrs: &ShapeAttrs) -> Option<Path> {
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
    let mut pb = PathBuilder::new();
    if rx <= 0.0 || ry <= 0.0 {
        // SVG2: a zero radius on either axis disables rounding entirely.
        pb.push_rect(tiny_skia::Rect::from_xywh(x, y, w, h)?);
        return pb.finish();
    }
    let (kx, ky) = (rx * KAPPA, ry * KAPPA);
    let (r, b) = (x + w, y + h); // right, bottom
    pb.move_to(x + rx, y);
    pb.line_to(r - rx, y);
    pb.cubic_to(r - rx + kx, y, r, y + ry - ky, r, y + ry);
    pb.line_to(r, b - ry);
    pb.cubic_to(r, b - ry + ky, r - rx + kx, b, r - rx, b);
    pb.line_to(x + rx, b);
    pb.cubic_to(x + rx - kx, b, x, b - ry + ky, x, b - ry);
    pb.line_to(x, y + ry);
    pb.cubic_to(x, y + ry - ky, x + rx - kx, y, x + rx, y);
    pb.close();
    pb.finish()
}

/// An axis-aligned ellipse as four cubic arcs ([`KAPPA`]), starting at the
/// rightmost point, winding clockwise (+y down). Radii must be positive.
fn ellipse_path(cx: f32, cy: f32, rx: f32, ry: f32) -> Option<Path> {
    let (kx, ky) = (rx * KAPPA, ry * KAPPA);
    let mut pb = PathBuilder::new();
    pb.move_to(cx + rx, cy);
    pb.cubic_to(cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry);
    pb.cubic_to(cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy);
    pb.cubic_to(cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry);
    pb.cubic_to(cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy);
    pb.close();
    pb.finish()
}

/// `<polyline>`/`<polygon>` outline; fewer than 2 points renders nothing.
fn poly_path(points: Option<&[Vec2]>, close: bool) -> Option<Path> {
    let pts = points.unwrap_or(&[]);
    if pts.len() < 2 {
        return None;
    }
    let mut pb = PathBuilder::new();
    pb.move_to(pts[0].x, pts[0].y);
    for p in &pts[1..] {
        pb.line_to(p.x, p.y);
    }
    if close {
        pb.close();
    }
    pb.finish()
}

/// Replay pre-parsed absolute path segments (parse guarantees the list starts
/// with a MoveTo). An empty list finishes to `None` (paint-nothing).
fn replay_path(d: &PathData) -> Option<Path> {
    let mut pb = PathBuilder::new();
    for seg in &d.0 {
        match *seg {
            PathSeg::MoveTo { x, y } => pb.move_to(x, y),
            PathSeg::LineTo { x, y } => pb.line_to(x, y),
            PathSeg::QuadTo { c1x, c1y, x, y } => pb.quad_to(c1x, c1y, x, y),
            PathSeg::CubicTo {
                c1x,
                c1y,
                c2x,
                c2y,
                x,
                y,
            } => pb.cubic_to(c1x, c1y, c2x, c2y, x, y),
            PathSeg::Close => pb.close(),
        }
    }
    pb.finish()
}

/// An anti-aliased solid paint from a straight-alpha [`Srgba`] with the
/// composed opacity multiplied in (the [`crate::canvas`] `solid()` pattern,
/// taking `Srgba` + opacity instead of bytes). Non-finite components fall
/// back to opaque black, matching the canvas color fallback.
fn solid(c: Srgba, opacity: f32) -> Paint<'static> {
    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    let color = tiny_skia::Color::from_rgba(
        c.red.clamp(0.0, 1.0),
        c.green.clamp(0.0, 1.0),
        c.blue.clamp(0.0, 1.0),
        (c.alpha * opacity).clamp(0.0, 1.0),
    )
    .unwrap_or(tiny_skia::Color::BLACK);
    paint.set_color(color);
    paint
}
