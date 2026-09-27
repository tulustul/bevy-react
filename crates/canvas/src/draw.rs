//! The display list ([`DrawCmd`]) and its rasterizer: the persistent raster
//! state and the command replay onto a tiny-skia pixmap — the sole backend
//! (swap `apply_cmds`' body to change engines).

use bevy_react_core::raster::parse_css_color;
use serde::Deserialize;
use tiny_skia::{BlendMode, Color, FillRule, Paint, PathBuilder, Pixmap, Stroke, Transform};

/// One vector drawing command in a `canvas` element's display list. Mirrors a
/// subset of the HTML `CanvasRenderingContext2D` path API; coordinates are in
/// logical (CSS) pixels matching the node's layout size, top-left origin — the
/// rasterizer scales them to physical pixels by the device pixel ratio. Bevy-free,
/// decoded on the Rust side and replayed into the rasterizer by
/// [`update_canvas_surfaces`](crate::update_canvas_surfaces).
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum DrawCmd {
    /// Start a fresh (empty) path, discarding the current one.
    BeginPath,
    /// Move the pen to `(x, y)`, beginning a new subpath.
    MoveTo { x: f32, y: f32 },
    /// Add a straight segment from the current point to `(x, y)`.
    LineTo { x: f32, y: f32 },
    /// Add a quadratic Bézier to `(x, y)` with control point `(cx, cy)`.
    QuadTo { cx: f32, cy: f32, x: f32, y: f32 },
    /// Add a cubic Bézier to `(x, y)` with controls `(c1x, c1y)`, `(c2x, c2y)`.
    BezierTo {
        c1x: f32,
        c1y: f32,
        c2x: f32,
        c2y: f32,
        x: f32,
        y: f32,
    },
    /// Add a circular arc centered at `(x, y)`, radius `r`, from `start` to `end`
    /// radians (clockwise). Approximated by short segments.
    Arc {
        x: f32,
        y: f32,
        r: f32,
        start: f32,
        end: f32,
    },
    /// Add an axis-aligned rectangle subpath.
    Rect { x: f32, y: f32, w: f32, h: f32 },
    /// Close the current subpath back to its start.
    ClosePath,
    /// Set the fill color (hex `#rgb` / `#rrggbb` / `#rrggbbaa`).
    FillStyle { color: String },
    /// Set the stroke color (hex, same forms as `FillStyle`).
    StrokeStyle { color: String },
    /// Set the stroke width in canvas pixels.
    LineWidth { w: f32 },
    /// Fill the current path with the current fill color.
    Fill,
    /// Stroke the current path with the current stroke color and line width.
    Stroke,
    /// Erase a rectangle back to transparent. Like the HTML `clearRect`, it
    /// touches only pixels — path and style state stay intact.
    ClearRect { x: f32, y: f32, w: f32, h: f32 },
    /// Erase the whole surface back to transparent. A non-standard convenience:
    /// JS may not know the laid-out size synchronously. Like [`ClearRect`],
    /// leaves path and style state intact.
    ///
    /// [`ClearRect`]: DrawCmd::ClearRect
    Clear,
}

/// Drawing state that persists across drawing sessions — like the HTML canvas,
/// where fill/stroke styles, line width, and the current path survive between
/// calls until reset by a resize or a declarative replay.
pub(crate) struct RasterState {
    fill: [u8; 4],
    stroke: [u8; 4],
    line_width: f32,
    path: PathBuilder,
    has_point: bool,
}

impl Default for RasterState {
    fn default() -> Self {
        Self {
            fill: [255, 255, 255, 255],
            stroke: [0, 0, 0, 255],
            line_width: 1.0,
            path: PathBuilder::new(),
            has_point: false,
        }
    }
}

/// Replay `cmds` onto the retained pixmap using the persistent raster state.
/// Draw coordinates are logical pixels; `scale` (the device pixel ratio) maps
/// them onto the physical-pixel buffer, so the drawing fills the texture and
/// stays crisp on HiDPI. The sole rasterizer backend — swap the body to change
/// engines.
pub(crate) fn apply_cmds(
    pixmap: &mut Pixmap,
    state: &mut RasterState,
    cmds: &[DrawCmd],
    scale: f32,
) {
    // Logical-pixel draw coords → physical-pixel buffer. Applied to every fill /
    // stroke, so it scales geometry, stroke width, and arc radii uniformly.
    let xf = Transform::from_scale(scale, scale);

    for cmd in cmds {
        match cmd {
            DrawCmd::BeginPath => {
                state.path = PathBuilder::new();
                state.has_point = false;
            }
            DrawCmd::MoveTo { x, y } => {
                state.path.move_to(*x, *y);
                state.has_point = true;
            }
            DrawCmd::LineTo { x, y } => {
                // A `lineTo` with no current point starts the subpath there,
                // matching the HTML canvas behavior.
                if state.has_point {
                    state.path.line_to(*x, *y);
                } else {
                    state.path.move_to(*x, *y);
                    state.has_point = true;
                }
            }
            DrawCmd::QuadTo { cx, cy, x, y } => {
                if state.has_point {
                    state.path.quad_to(*cx, *cy, *x, *y);
                }
            }
            DrawCmd::BezierTo {
                c1x,
                c1y,
                c2x,
                c2y,
                x,
                y,
            } => {
                if state.has_point {
                    state.path.cubic_to(*c1x, *c1y, *c2x, *c2y, *x, *y);
                }
            }
            DrawCmd::Arc {
                x,
                y,
                r,
                start,
                end,
            } => {
                push_arc(
                    &mut state.path,
                    *x,
                    *y,
                    *r,
                    *start,
                    *end,
                    &mut state.has_point,
                );
            }
            DrawCmd::Rect { x, y, w, h } => {
                if let Some(rect) = tiny_skia::Rect::from_xywh(*x, *y, *w, *h) {
                    state.path.push_rect(rect);
                }
            }
            DrawCmd::ClosePath => state.path.close(),
            DrawCmd::FillStyle { color } => state.fill = parse_rgba8(color),
            DrawCmd::StrokeStyle { color } => state.stroke = parse_rgba8(color),
            DrawCmd::LineWidth { w } => {
                // The HTML canvas ignores invalid widths (0, negative, NaN, ∞)
                // and keeps the previous value; tiny-skia's stroker would
                // reject them ("path stroking failed").
                if w.is_finite() && *w > 0.0 {
                    state.line_width = *w;
                }
            }
            DrawCmd::Fill => {
                if let Some(p) = state.path.clone().finish() {
                    pixmap.fill_path(&p, &solid(state.fill), FillRule::Winding, xf, None);
                }
            }
            DrawCmd::Stroke => {
                if let Some(p) = state.path.clone().finish() {
                    // A single-point path — e.g. a stationary drag's
                    // `moveTo(p); lineTo(p)` — has an empty butt-cap outline:
                    // tiny-skia's stroker returns `None` for it and warns
                    // "path stroking failed". The web draws nothing too, so
                    // skip it silently.
                    let b = p.bounds();
                    if b.width() > 0.0 || b.height() > 0.0 {
                        let stroke_opts = Stroke {
                            width: state.line_width,
                            ..Default::default()
                        };
                        pixmap.stroke_path(&p, &solid(state.stroke), &stroke_opts, xf, None);
                    }
                }
            }
            DrawCmd::ClearRect { x, y, w, h } => {
                if let Some(rect) = tiny_skia::Rect::from_xywh(*x, *y, *w, *h) {
                    let paint = Paint {
                        blend_mode: BlendMode::Clear,
                        anti_alias: true,
                        ..Default::default()
                    };
                    pixmap.fill_rect(rect, &paint, xf, None);
                }
            }
            DrawCmd::Clear => pixmap.fill(Color::TRANSPARENT),
        }
    }
}

/// An anti-aliased solid-color paint from straight-alpha RGBA bytes.
fn solid(rgba: [u8; 4]) -> Paint<'static> {
    let mut paint = Paint {
        anti_alias: true,
        ..Default::default()
    };
    paint.set_color_rgba8(rgba[0], rgba[1], rgba[2], rgba[3]);
    paint
}

/// Append a circular arc to `path` as short line segments. Mirrors the HTML
/// canvas `arc`: if the path already has a point, a line is drawn to the arc's
/// start; otherwise the arc's start becomes the subpath origin.
fn push_arc(
    path: &mut PathBuilder,
    cx: f32,
    cy: f32,
    r: f32,
    start: f32,
    end: f32,
    has_point: &mut bool,
) {
    // ~2° per segment, at least one — plenty smooth for typical chart radii.
    let span = (end - start).abs();
    let steps = ((span / (std::f32::consts::PI / 90.0)).ceil() as usize).max(1);
    for i in 0..=steps {
        let t = start + (end - start) * (i as f32 / steps as f32);
        let (px, py) = (cx + r * t.cos(), cy + r * t.sin());
        if i == 0 && !*has_point {
            path.move_to(px, py);
            *has_point = true;
        } else {
            path.line_to(px, py);
            *has_point = true;
        }
    }
}

/// Parse a CSS color string (see [`parse_css_color`]) into straight-alpha RGBA
/// bytes. Anything unparseable falls back to opaque black.
pub(crate) fn parse_rgba8(s: &str) -> [u8; 4] {
    let c = parse_css_color(s).unwrap_or(bevy::color::Srgba::new(0.0, 0.0, 0.0, 1.0));
    [
        (c.red.clamp(0.0, 1.0) * 255.0).round() as u8,
        (c.green.clamp(0.0, 1.0) * 255.0).round() as u8,
        (c.blue.clamp(0.0, 1.0) * 255.0).round() as u8,
        (c.alpha.clamp(0.0, 1.0) * 255.0).round() as u8,
    ]
}
