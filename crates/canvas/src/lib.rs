//! The `canvas` host element: an arbitrary anti-aliased vector drawing surface.
//!
//! A `<canvas>` is a normal styled UI node carrying an [`ImageNode`] whose
//! texture this module paints. React records an HTML-`<canvas>`-style display
//! list (`ctx.moveTo`/`lineTo`/`bezierTo`/`fill`/`stroke`/…), it crosses the
//! bridge as a `Props::draw` display list of [`DrawCmd`]s, the reconciler stamps
//! it onto a [`CanvasSurface`], and [`update_canvas_surfaces`] rasterizes the
//! commands into the backing image at the node's laid-out pixel size.
//!
//! Rasterization is **CPU-side** (via `tiny-skia`), so it is fully decoupled from
//! Bevy's render internals — the canvas is "an image we paint into", reusing the
//! existing [`ImageNode`] plumbing. The rasterizer is isolated in [`rasterize`];
//! a future GPU backend (e.g. `bevy_vello`) could replace it without touching the
//! protocol, the reconciler, or the JS side.

mod color;
pub use color::parse_css_color;

use bevy::asset::RenderAssetUsages;
use bevy::image::Image;
use bevy::prelude::*;
use bevy::render::render_resource::{Extent3d, TextureDimension, TextureFormat};
use bevy::ui::ComputedNode;
use bevy::ui::widget::ImageNode;
use serde::Deserialize;
use tiny_skia::{FillRule, Paint, PathBuilder, Pixmap, Stroke, Transform};

/// One vector drawing command in a `canvas` element's display list. Mirrors a
/// subset of the HTML `CanvasRenderingContext2D` path API; coordinates are in
/// logical (CSS) pixels matching the node's layout size, top-left origin — the
/// rasterizer scales them to physical pixels by the device pixel ratio. Bevy-free,
/// decoded on the Rust side and replayed into the rasterizer by
/// [`update_canvas_surfaces`].
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
}

/// Largest backing-texture dimension we allocate, in physical pixels. A guard
/// against a degenerate layout asking for an enormous buffer.
const MAX_DIM: u32 = 4096;

/// The drawing state of a `canvas` element: its current display list plus the
/// bookkeeping [`update_canvas_surfaces`] uses to decide when to re-rasterize.
/// The reconciler replaces this whole component (with `dirty` set) whenever React
/// sends a new `draw` list.
#[derive(Component, Clone, Debug)]
pub struct CanvasSurface {
    /// The ordered draw commands to replay into the texture.
    pub cmds: Vec<DrawCmd>,
    /// Set when `cmds` changed and the texture needs repainting.
    dirty: bool,
    /// Last physical size we rasterized at; a layout resize re-rasterizes.
    last_size: (u32, u32),
}

impl CanvasSurface {
    /// A surface for `cmds`, marked dirty so it paints on the next frame.
    pub fn new(cmds: Vec<DrawCmd>) -> Self {
        Self {
            cmds,
            dirty: true,
            last_size: (0, 0),
        }
    }
}

/// A 1×1 transparent image to back a freshly-spawned canvas until its first
/// rasterization (which happens once the node has a laid-out size). Kept in both
/// worlds so [`update_canvas_surfaces`] can mutate the CPU copy and have it
/// re-upload.
pub fn blank_canvas_image() -> Image {
    Image::new_fill(
        Extent3d {
            width: 1,
            height: 1,
            depth_or_array_layers: 1,
        },
        TextureDimension::D2,
        &[0, 0, 0, 0],
        TextureFormat::Rgba8UnormSrgb,
        RenderAssetUsages::MAIN_WORLD | RenderAssetUsages::RENDER_WORLD,
    )
}

/// Repaint every canvas whose display list changed or whose laid-out size moved.
/// Reads the node's size from [`ComputedNode`] (already in physical pixels, so
/// the result is crisp on HiDPI) and overwrites the backing image's pixels.
pub fn update_canvas_surfaces(
    mut images: ResMut<Assets<Image>>,
    mut query: Query<(&ComputedNode, &ImageNode, &mut CanvasSurface)>,
) {
    for (node, image_node, mut surface) in &mut query {
        let w = (node.size.x.round() as u32).min(MAX_DIM);
        let h = (node.size.y.round() as u32).min(MAX_DIM);
        if w == 0 || h == 0 {
            continue; // not laid out yet; re-runs when ComputedNode gets a size
        }
        if !surface.dirty && surface.last_size == (w, h) {
            continue;
        }
        let Some(mut image) = images.get_mut(&image_node.image) else {
            continue;
        };
        let extent = Extent3d {
            width: w,
            height: h,
            depth_or_array_layers: 1,
        };
        if image.texture_descriptor.size != extent {
            image.resize(extent);
        }
        // Draw commands are in logical (CSS) pixels matching the node's layout
        // size; the texture is physical-pixel sized for HiDPI crispness, so scale
        // the drawing up by the device pixel ratio (`1 / inverse_scale_factor`).
        let scale = if node.inverse_scale_factor > 0.0 {
            node.inverse_scale_factor.recip()
        } else {
            1.0
        };
        image.data = Some(rasterize(&surface.cmds, w, h, scale));
        surface.dirty = false;
        surface.last_size = (w, h);
    }
}

/// Replay a display list into a `width × height` RGBA8 (straight-alpha, sRGB)
/// pixel buffer. Draw coordinates are logical pixels; `scale` (the device pixel
/// ratio) maps them onto the physical-pixel buffer, so the drawing fills the
/// texture and stays crisp on HiDPI. The sole rasterizer backend — swap the body
/// to change engines.
fn rasterize(cmds: &[DrawCmd], width: u32, height: u32, scale: f32) -> Vec<u8> {
    // `width`/`height` are clamped to `1..=MAX_DIM` by the caller, so `new` holds.
    let mut pixmap = Pixmap::new(width, height).expect("non-zero, bounded canvas size");
    // Logical-pixel draw coords → physical-pixel buffer. Applied to every fill /
    // stroke, so it scales geometry, stroke width, and arc radii uniformly.
    let xf = Transform::from_scale(scale, scale);

    let mut path = PathBuilder::new();
    let mut has_point = false;
    let mut fill = [255u8, 255, 255, 255];
    let mut stroke = [0u8, 0, 0, 255];
    let mut line_width = 1.0f32;

    for cmd in cmds {
        match cmd {
            DrawCmd::BeginPath => {
                path = PathBuilder::new();
                has_point = false;
            }
            DrawCmd::MoveTo { x, y } => {
                path.move_to(*x, *y);
                has_point = true;
            }
            DrawCmd::LineTo { x, y } => {
                // A `lineTo` with no current point starts the subpath there,
                // matching the HTML canvas behavior.
                if has_point {
                    path.line_to(*x, *y);
                } else {
                    path.move_to(*x, *y);
                    has_point = true;
                }
            }
            DrawCmd::QuadTo { cx, cy, x, y } => {
                if has_point {
                    path.quad_to(*cx, *cy, *x, *y);
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
                if has_point {
                    path.cubic_to(*c1x, *c1y, *c2x, *c2y, *x, *y);
                }
            }
            DrawCmd::Arc {
                x,
                y,
                r,
                start,
                end,
            } => {
                push_arc(&mut path, *x, *y, *r, *start, *end, &mut has_point);
            }
            DrawCmd::Rect { x, y, w, h } => {
                if let Some(rect) = tiny_skia::Rect::from_xywh(*x, *y, *w, *h) {
                    path.push_rect(rect);
                }
            }
            DrawCmd::ClosePath => path.close(),
            DrawCmd::FillStyle { color } => fill = parse_rgba8(color),
            DrawCmd::StrokeStyle { color } => stroke = parse_rgba8(color),
            DrawCmd::LineWidth { w } => line_width = *w,
            DrawCmd::Fill => {
                if let Some(p) = path.clone().finish() {
                    pixmap.fill_path(&p, &solid(fill), FillRule::Winding, xf, None);
                }
            }
            DrawCmd::Stroke => {
                if let Some(p) = path.clone().finish() {
                    let stroke_opts = Stroke {
                        width: line_width,
                        ..Default::default()
                    };
                    pixmap.stroke_path(&p, &solid(stroke), &stroke_opts, xf, None);
                }
            }
        }
    }

    // tiny-skia stores premultiplied alpha; Bevy's UI shader expects straight
    // alpha, so demultiply each pixel on the way out.
    let mut out = Vec::with_capacity((width * height * 4) as usize);
    for px in pixmap.pixels() {
        let c = px.demultiply();
        out.extend_from_slice(&[c.red(), c.green(), c.blue(), c.alpha()]);
    }
    out
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
fn parse_rgba8(s: &str) -> [u8; 4] {
    let c = parse_css_color(s).unwrap_or(bevy::color::Srgba::new(0.0, 0.0, 0.0, 1.0));
    [
        (c.red.clamp(0.0, 1.0) * 255.0).round() as u8,
        (c.green.clamp(0.0, 1.0) * 255.0).round() as u8,
        (c.blue.clamp(0.0, 1.0) * 255.0).round() as u8,
        (c.alpha.clamp(0.0, 1.0) * 255.0).round() as u8,
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_hex_colors() {
        assert_eq!(parse_rgba8("#ff0000"), [255, 0, 0, 255]);
        assert_eq!(parse_rgba8("#00ff0080"), [0, 255, 0, 128]);
        assert_eq!(parse_rgba8("#f00"), [255, 0, 0, 255]);
        assert_eq!(parse_rgba8("#0f08"), [0, 255, 0, 136]);
        assert_eq!(parse_rgba8("garbage"), [0, 0, 0, 255]);
    }

    #[test]
    fn rasterizes_a_filled_rect_opaquely() {
        let cmds = vec![
            DrawCmd::FillStyle {
                color: "#ff0000".into(),
            },
            DrawCmd::Rect {
                x: 0.0,
                y: 0.0,
                w: 4.0,
                h: 4.0,
            },
            DrawCmd::Fill,
        ];
        let width = 4usize;
        let buf = rasterize(&cmds, width as u32, 4, 1.0);
        assert_eq!(buf.len(), width * 4 * 4);
        // An interior pixel (x=1, y=1) is solid red.
        let i = (width + 1) * 4;
        assert_eq!(&buf[i..i + 4], &[255, 0, 0, 255]);
    }

    #[test]
    fn scale_maps_logical_coords_onto_the_physical_buffer() {
        // A 2×2 logical rect at 2× scale fills a 4×4 physical buffer entirely.
        let cmds = vec![
            DrawCmd::FillStyle {
                color: "#ff0000".into(),
            },
            DrawCmd::Rect {
                x: 0.0,
                y: 0.0,
                w: 2.0,
                h: 2.0,
            },
            DrawCmd::Fill,
        ];
        let buf = rasterize(&cmds, 4, 4, 2.0);
        // The far corner pixel (x=3, y=3) is covered — drawing scaled to fill.
        let i = (3 * 4 + 3) * 4;
        assert_eq!(&buf[i..i + 4], &[255, 0, 0, 255]);
    }
}
