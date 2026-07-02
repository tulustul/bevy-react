#![cfg_attr(docsrs, feature(doc_auto_cfg))]
//! The `canvas` host element: an arbitrary anti-aliased vector drawing surface.
//!
//! A `<canvas>` is a normal styled UI node carrying an [`ImageNode`] whose
//! texture this module paints. Semantics are web-faithful: the surface is a
//! **retained pixel buffer** that paint accumulates onto. React-side drawing
//! calls (`ctx.moveTo`/`lineTo`/`fill`/`clearRect`/…) record [`DrawCmd`]s that
//! cross the bridge — either as the declarative `draw` prop (clear + replay)
//! or as imperative `draw` ops from a persistent canvas handle (append) — and
//! land in the [`CanvasSurface`]'s pending queue. Each frame,
//! [`update_canvas_surfaces`] drains the queue onto the retained pixmap at the
//! node's laid-out pixel size.
//!
//! Like an HTML canvas whose `width`/`height` is set, a layout resize
//! **clears** the surface (the pixmap is recreated transparent and the raster
//! state resets); the core crate emits a `"resize"` UI event so the app — or
//! the runtime's automatic replay of a declarative painter — redraws.
//! Fill/stroke styles, line width, and the current path persist across
//! drawing sessions until such a reset, mirroring `CanvasRenderingContext2D`.
//!
//! Rasterization is **CPU-side** (via `tiny-skia`), so it is fully decoupled
//! from Bevy's render internals — the canvas is "an image we paint into",
//! reusing the existing [`ImageNode`] plumbing. The rasterizer is isolated in
//! `apply_cmds`; a future GPU backend (e.g. `bevy_vello`) could replace it
//! without touching the protocol, the reconciler, or the JS side.

mod color;
pub use color::parse_css_color;

use bevy::asset::RenderAssetUsages;
use bevy::image::Image;
use bevy::prelude::*;
use bevy::render::render_resource::{Extent3d, TextureDimension, TextureFormat};
use bevy::ui::ComputedNode;
use bevy::ui::widget::ImageNode;
use serde::Deserialize;
use tiny_skia::{BlendMode, Color, FillRule, Paint, PathBuilder, Pixmap, Stroke, Transform};

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

/// Largest backing-texture dimension we allocate, in physical pixels. A guard
/// against a degenerate layout asking for an enormous buffer.
pub const MAX_DIM: u32 = 4096;

/// Round + clamp a laid-out physical size (a `ComputedNode.size`) to the
/// rasterizable range. A `0` component means "not laid out yet". Shared with
/// the core crate's resize-event emitter so the size reported to JS always
/// matches the actual buffer.
pub fn clamp_physical_size(size: Vec2) -> (u32, u32) {
    (
        (size.x.round() as u32).min(MAX_DIM),
        (size.y.round() as u32).min(MAX_DIM),
    )
}

/// Drawing state that persists across drawing sessions — like the HTML canvas,
/// where fill/stroke styles, line width, and the current path survive between
/// calls until reset by a resize or a declarative replay.
struct RasterState {
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

/// The drawing state of a `canvas` element: a retained premultiplied pixel
/// buffer, the persistent raster state, and the queue of commands recorded
/// since the last paint. Paint **accumulates** — a batch draws on top of what
/// is already there — except when `replace` is set (the declarative `draw`
/// prop: clear + replay) or the laid-out size changes (clear-on-resize).
#[derive(Component)]
pub struct CanvasSurface {
    /// Commands recorded since the last paint, not yet applied.
    pending: Vec<DrawCmd>,
    /// Clear the surface and reset raster state before draining `pending`.
    replace: bool,
    /// Fill/stroke/line-width and the current path, persisting across batches.
    state: RasterState,
    /// The retained pixels, premultiplied (tiny-skia native). `None` until the
    /// node is first laid out.
    pixmap: Option<Pixmap>,
    /// Physical size of `pixmap`; a mismatch with the laid-out size recreates
    /// it cleared (HTML width/height-set semantics).
    last_size: (u32, u32),
}

impl CanvasSurface {
    /// A fresh surface whose first paint clears and replays `cmds` (the
    /// element's initial declarative `draw` prop; empty for imperative-only
    /// canvases).
    pub fn new(cmds: Vec<DrawCmd>) -> Self {
        Self {
            pending: cmds,
            replace: true,
            state: RasterState::default(),
            pixmap: None,
            last_size: (0, 0),
        }
    }

    /// Append imperative commands (an `Op::Draw` from a canvas handle). Paint
    /// accumulates on the retained pixels.
    pub fn enqueue(&mut self, cmds: Vec<DrawCmd>) {
        self.pending.extend(cmds);
    }

    /// Replace the picture with `cmds` (a changed declarative `draw` prop):
    /// the next paint clears the surface, resets raster state, and replays.
    /// Anything still pending is dropped — it would be erased anyway.
    pub fn set_display_list(&mut self, cmds: Vec<DrawCmd>) {
        self.pending = cmds;
        self.replace = true;
    }

    /// Sync the surface to the laid-out physical size `(w, h)`: recreate the
    /// pixmap on a size change (clear-on-resize), honor a pending replace,
    /// drain queued commands. Returns the straight-alpha RGBA buffer when the
    /// pixels changed (painted, cleared, or resized), else `None`. `scale` is
    /// the device pixel ratio mapping logical draw coords onto the buffer.
    pub(crate) fn sync(&mut self, w: u32, h: u32, scale: f32) -> Option<Vec<u8>> {
        let resized = self.pixmap.is_none() || self.last_size != (w, h);
        if resized {
            // `w`/`h` are clamped to `1..=MAX_DIM` by the caller, so `new` holds.
            self.pixmap = Some(Pixmap::new(w, h).expect("non-zero, bounded canvas size"));
            self.state = RasterState::default();
            self.last_size = (w, h);
        }
        let mut cleared = resized;
        if self.replace {
            self.replace = false;
            if !resized {
                self.pixmap.as_mut().unwrap().fill(Color::TRANSPARENT);
            }
            self.state = RasterState::default();
            cleared = true;
        }
        if self.pending.is_empty() && !cleared {
            return None;
        }
        let pixmap = self.pixmap.as_mut().unwrap();
        let cmds = std::mem::take(&mut self.pending);
        apply_cmds(pixmap, &mut self.state, &cmds, scale);
        Some(to_straight_alpha(pixmap))
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

/// Paint every canvas with pending work (queued commands, a replace, or a
/// layout resize — which clears, per HTML canvas semantics) and upload the
/// result into the backing image. Reads the node's size from [`ComputedNode`]
/// (already in physical pixels, so the result is crisp on HiDPI).
pub fn update_canvas_surfaces(
    mut images: ResMut<Assets<Image>>,
    mut query: Query<(&ComputedNode, &ImageNode, &mut CanvasSurface)>,
) {
    for (node, image_node, mut surface) in &mut query {
        let (w, h) = clamp_physical_size(node.size);
        if w == 0 || h == 0 {
            continue; // not laid out yet; pending commands stay queued
        }
        // `contains` (not `get_mut`) so an idle canvas doesn't flag the asset
        // changed — and thus re-uploaded — every frame.
        if !images.contains(&image_node.image) {
            continue;
        }
        // Draw commands are in logical (CSS) pixels matching the node's layout
        // size; the texture is physical-pixel sized for HiDPI crispness, so scale
        // the drawing up by the device pixel ratio (`1 / inverse_scale_factor`).
        let scale = if node.inverse_scale_factor > 0.0 {
            node.inverse_scale_factor.recip()
        } else {
            1.0
        };
        let Some(data) = surface.sync(w, h, scale) else {
            continue;
        };
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
        image.data = Some(data);
    }
}

/// Replay `cmds` onto the retained pixmap using the persistent raster state.
/// Draw coordinates are logical pixels; `scale` (the device pixel ratio) maps
/// them onto the physical-pixel buffer, so the drawing fills the texture and
/// stays crisp on HiDPI. The sole rasterizer backend — swap the body to change
/// engines.
fn apply_cmds(pixmap: &mut Pixmap, state: &mut RasterState, cmds: &[DrawCmd], scale: f32) {
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

/// Copy the pixmap out as an RGBA8 (straight-alpha, sRGB) pixel buffer.
/// tiny-skia stores premultiplied alpha; Bevy's UI shader expects straight
/// alpha, so demultiply each pixel on the way out.
fn to_straight_alpha(pixmap: &Pixmap) -> Vec<u8> {
    let mut out = Vec::with_capacity((pixmap.width() * pixmap.height() * 4) as usize);
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

    /// One-shot shim matching the old pure `rasterize` signature: a fresh
    /// surface, one clear+replay paint.
    fn rasterize(cmds: &[DrawCmd], width: u32, height: u32, scale: f32) -> Vec<u8> {
        let mut s = CanvasSurface::new(cmds.to_vec());
        s.sync(width, height, scale)
            .expect("first sync always paints")
    }

    /// The RGBA bytes of pixel `(x, y)` in a `w`-wide buffer.
    fn px(buf: &[u8], w: usize, x: usize, y: usize) -> &[u8] {
        let i = (y * w + x) * 4;
        &buf[i..i + 4]
    }

    fn fill_rect(color: &str, x: f32, y: f32, w: f32, h: f32) -> Vec<DrawCmd> {
        vec![
            DrawCmd::BeginPath,
            DrawCmd::FillStyle {
                color: color.into(),
            },
            DrawCmd::Rect { x, y, w, h },
            DrawCmd::Fill,
        ]
    }

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
        let buf = rasterize(&fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0), 4, 4, 1.0);
        assert_eq!(buf.len(), 4 * 4 * 4);
        // An interior pixel (x=1, y=1) is solid red.
        assert_eq!(px(&buf, 4, 1, 1), &[255, 0, 0, 255]);
    }

    #[test]
    fn scale_maps_logical_coords_onto_the_physical_buffer() {
        // A 2×2 logical rect at 2× scale fills a 4×4 physical buffer entirely.
        let buf = rasterize(&fill_rect("#ff0000", 0.0, 0.0, 2.0, 2.0), 4, 4, 2.0);
        // The far corner pixel (x=3, y=3) is covered — drawing scaled to fill.
        assert_eq!(px(&buf, 4, 3, 3), &[255, 0, 0, 255]);
    }

    #[test]
    fn paint_accumulates_across_batches() {
        let mut s = CanvasSurface::new(vec![]);
        s.enqueue(fill_rect("#ff0000", 0.0, 0.0, 2.0, 2.0));
        s.sync(4, 4, 1.0).expect("painted");
        s.enqueue(fill_rect("#0000ff", 2.0, 2.0, 2.0, 2.0));
        let buf = s.sync(4, 4, 1.0).expect("painted");
        // The first batch's red survives the second batch's blue.
        assert_eq!(px(&buf, 4, 1, 1), &[255, 0, 0, 255]);
        assert_eq!(px(&buf, 4, 3, 3), &[0, 0, 255, 255]);
    }

    #[test]
    fn style_and_path_state_persist_across_batches() {
        let mut s = CanvasSurface::new(vec![]);
        // Batch 1 only sets the fill color and builds a path — no paint yet.
        s.enqueue(vec![
            DrawCmd::FillStyle {
                color: "#ff0000".into(),
            },
            DrawCmd::Rect {
                x: 0.0,
                y: 0.0,
                w: 4.0,
                h: 4.0,
            },
        ]);
        s.sync(4, 4, 1.0);
        // Batch 2 fills using the retained color and path.
        s.enqueue(vec![DrawCmd::Fill]);
        let buf = s.sync(4, 4, 1.0).expect("painted");
        assert_eq!(px(&buf, 4, 1, 1), &[255, 0, 0, 255]);
    }

    #[test]
    fn clear_rect_erases_only_inside() {
        let mut s = CanvasSurface::new(fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0));
        s.sync(4, 4, 1.0);
        s.enqueue(vec![DrawCmd::ClearRect {
            x: 1.0,
            y: 1.0,
            w: 2.0,
            h: 2.0,
        }]);
        let buf = s.sync(4, 4, 1.0).expect("painted");
        assert_eq!(px(&buf, 4, 2, 2)[3], 0, "inside is transparent");
        assert_eq!(px(&buf, 4, 0, 0), &[255, 0, 0, 255], "outside intact");
    }

    #[test]
    fn clear_erases_the_whole_surface() {
        let mut s = CanvasSurface::new(fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0));
        s.sync(4, 4, 1.0);
        s.enqueue(vec![DrawCmd::Clear]);
        let buf = s.sync(4, 4, 1.0).expect("painted");
        assert!(buf.iter().all(|&b| b == 0));
    }

    #[test]
    fn resize_clears_pixels_and_resets_state() {
        let mut s = CanvasSurface::new(fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0));
        s.sync(4, 4, 1.0);
        // The resize alone repaints (cleared), even with nothing pending.
        let buf = s.sync(8, 8, 1.0).expect("resize repaints");
        assert_eq!(buf.len(), 8 * 8 * 4);
        assert!(buf.iter().all(|&b| b == 0), "cleared on resize");
        // Raster state was reset: an unstyled fill uses the default (white).
        s.enqueue(vec![
            DrawCmd::Rect {
                x: 0.0,
                y: 0.0,
                w: 8.0,
                h: 8.0,
            },
            DrawCmd::Fill,
        ]);
        let buf = s.sync(8, 8, 1.0).expect("painted");
        assert_eq!(px(&buf, 8, 4, 4), &[255, 255, 255, 255]);
    }

    #[test]
    fn commands_enqueued_before_first_layout_paint_once_sized() {
        let mut s = CanvasSurface::new(vec![]);
        s.enqueue(fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0));
        // First sized sync (first layout) drains the queue.
        let buf = s.sync(4, 4, 1.0).expect("painted");
        assert_eq!(px(&buf, 4, 1, 1), &[255, 0, 0, 255]);
    }

    #[test]
    fn set_display_list_replaces_the_picture() {
        let mut s = CanvasSurface::new(fill_rect("#ff0000", 0.0, 0.0, 2.0, 2.0));
        s.sync(4, 4, 1.0);
        s.set_display_list(fill_rect("#0000ff", 2.0, 2.0, 2.0, 2.0));
        let buf = s.sync(4, 4, 1.0).expect("painted");
        assert_eq!(px(&buf, 4, 1, 1)[3], 0, "old pixels cleared");
        assert_eq!(px(&buf, 4, 3, 3), &[0, 0, 255, 255], "new pixels painted");
    }

    #[test]
    fn degenerate_stroke_paints_nothing_without_failing() {
        // A stationary drag records `moveTo(p); lineTo(p); stroke()` — a
        // single-point path. tiny-skia's stroker rejects it (an empty
        // butt-cap outline), so the rasterizer must skip it silently.
        let mut s = CanvasSurface::new(vec![]);
        s.enqueue(vec![
            DrawCmd::BeginPath,
            DrawCmd::MoveTo { x: 2.0, y: 2.0 },
            DrawCmd::LineTo { x: 2.0, y: 2.0 },
            DrawCmd::Stroke,
        ]);
        let buf = s.sync(4, 4, 1.0).expect("painted");
        assert!(buf.iter().all(|&b| b == 0), "nothing stroked");
    }

    #[test]
    fn invalid_line_width_is_ignored() {
        // Web semantics: assigning 0 / negative / non-finite keeps the
        // previous width (tiny-skia would reject the stroke outright).
        let mut s = CanvasSurface::new(vec![]);
        s.enqueue(vec![
            DrawCmd::StrokeStyle {
                color: "#ff0000".into(),
            },
            DrawCmd::LineWidth { w: 2.0 },
            DrawCmd::LineWidth { w: 0.0 },
            DrawCmd::LineWidth { w: -3.0 },
            DrawCmd::LineWidth { w: f32::NAN },
            DrawCmd::BeginPath,
            DrawCmd::MoveTo { x: 0.0, y: 2.0 },
            DrawCmd::LineTo { x: 4.0, y: 2.0 },
            DrawCmd::Stroke,
        ]);
        let buf = s.sync(4, 4, 1.0).expect("painted");
        // Width 2 (the last valid value) covers rows 1..3; row 1 is opaque red.
        assert_eq!(px(&buf, 4, 2, 1), &[255, 0, 0, 255]);
    }

    #[test]
    fn idle_sync_returns_none() {
        let mut s = CanvasSurface::new(vec![]);
        assert!(s.sync(4, 4, 1.0).is_some(), "first paint uploads the clear");
        assert!(s.sync(4, 4, 1.0).is_none(), "nothing pending, no repaint");
    }
}
