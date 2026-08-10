//! The SVG subsystem: parse SVG documents and rasterize them to pixels.
//!
//! Documents parse into a [`usvg::Tree`] — an immutable, `Send + Sync`
//! simplified scene graph — and rasterize **CPU-side** via `resvg` onto the
//! same `tiny-skia` [`Pixmap`](tiny_skia::Pixmap) type the [`crate::canvas`]
//! module paints, so SVG output plugs into the existing "an image we paint
//! into" [`ImageNode`](bevy::ui::widget::ImageNode) plumbing without touching
//! Bevy's render internals. Like `canvas`, this is a leaf module: the bridge
//! machinery reaches into `crate::svg`, never the reverse.
//!
//! Licensing note: `resvg`/`usvg` were historically MPL-2.0, but as of the
//! linebender-maintained releases (0.47 included) they are dual-licensed
//! `MIT OR Apache-2.0` — no license caveat applies.

mod asset;
mod hit;
mod image;
pub(crate) mod interact;
mod paint;
pub(crate) mod pick;
mod protocol;
mod raster;
mod text;
mod walk;

use bevy::asset::Handle;
use bevy::ecs::component::Component;
use bevy::math::{UVec2, Vec2};
use bevy::ui::widget::ImageMeasure;
use bevy::ui::{ComputedNode, ContentSize, NodeMeasure, VisualBox};

pub use asset::{SvgAssetLoader, SvgDocument, SvgParseError, parse_svg_bytes};
pub(crate) use image::{ensure_svg_image, is_svg_src, warn_ignored_attrs};
pub use interact::SvgUserPos;
#[cfg(test)]
pub(crate) use protocol::st;
pub use protocol::{
    FillRuleKind, LinecapKind, LinejoinKind, PathData, PathSeg, ShapeAttrs, ShapePaint,
    ShapeTransform, ShapeTransitionSpec, ViewBox,
};
pub(crate) use protocol::{
    NUMERIC_ATTR_COUNT, NUMERIC_ATTRS, de_view_box, numeric_attr, numeric_attr_mut,
};
pub use raster::{rasterize_document, stamp_svg_measures, update_svg_surfaces};

/// The 100×100-viewBox red-circle fixture shared by the svg test suites
/// (parse, raster, and the rasterizer spike below).
#[cfg(test)]
pub(crate) const CIRCLE_SVG: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#f00"/></svg>"##;

/// The kind of a JSX SVG shape child: which wire intrinsic (`<circle>`,
/// `<rect>`, …, `<g>`) spawned it, and therefore which [`ShapeAttrs`] fields
/// the rasterizer reads.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ShapeKind {
    Path,
    Rect,
    Circle,
    Ellipse,
    Line,
    Polyline,
    Polygon,
    Group,
}

impl ShapeKind {
    /// Map a create-op `kind` (the bare JSX intrinsic name) to its shape
    /// kind; `None` for non-shape kinds. This is the create dispatch's arm
    /// guard: any kind it recognizes mounts as a Node-less [`SvgShape`].
    pub fn from_kind(kind: &str) -> Option<ShapeKind> {
        Some(match kind {
            "path" => Self::Path,
            "rect" => Self::Rect,
            "circle" => Self::Circle,
            "ellipse" => Self::Ellipse,
            "line" => Self::Line,
            "polyline" => Self::Polyline,
            "polygon" => Self::Polygon,
            "g" => Self::Group,
            _ => return None,
        })
    }
}

/// One shape child of a JSX `<svg>` element: a **Node-less** entity (the
/// `textSpan` precedent — no layout box, no style, no `stamp_common`)
/// carrying only its kind and folded attrs. The rasterizer walks the `<svg>`
/// root's `Children` to paint these, and the hit-tester reads the same data.
/// Updates rewrite `attrs` compare-before-write, so `Changed<SvgShape>` is a
/// sound dirt signal for the raster.
#[derive(Component, Debug, Clone, PartialEq)]
pub struct SvgShape {
    pub kind: ShapeKind,
    pub attrs: ShapeAttrs,
}

/// The element-owned raster surface of a node that displays an SVG.
///
/// Present on an `<image>` whose `src` names an `.svg` asset (**svg mode**)
/// and on the JSX `<svg>` element: the node's `ImageNode` texture is an
/// element-owned pixel buffer — never a path loaded as a Bevy `Image` — and
/// the svg raster system repaints it at the laid-out size whenever the
/// layout, the document, or (JSX mode) the shape children change.
#[derive(Component)]
pub struct SvgSurface {
    /// The parsed document to rasterize. `Some` = an svg-mode `<image>`
    /// (**file mode**); `None` = a JSX `<svg>` element, whose document is
    /// built from its [`SvgShape`] children instead of an asset.
    pub doc: Option<Handle<SvgDocument>>,
    /// The JSX `<svg>` element's coordinate system: the user-unit rect mapped
    /// onto the laid-out box. `None` = logical-pixel space — and always
    /// `None` in file mode (the document carries its own viewBox).
    pub view_box: Option<ViewBox>,
    /// Physical-px size of the last raster; `UVec2::ZERO` before the first.
    pub last_size: UVec2,
    /// Repaint requested: set on mount and whenever the document handle (or
    /// the JSX `viewBox`) changes; the raster system clears it after
    /// painting. JSX shape and child-list changes intentionally do **not**
    /// set this; the rasterizer derives that dirt itself
    /// (`Changed<SvgShape>`/`Changed<Children>`, plus
    /// `RemovedComponents<Children>` for an emptied container).
    pub dirty: bool,
}

impl SvgSurface {
    /// A fresh file-mode surface awaiting its first raster of `doc`.
    pub fn new(doc: Handle<SvgDocument>) -> Self {
        Self {
            doc: Some(doc),
            view_box: None,
            last_size: UVec2::ZERO,
            dirty: true,
        }
    }

    /// A fresh JSX-mode surface (no document asset — the picture is the
    /// element's [`SvgShape`] children) awaiting its first raster.
    pub fn jsx(view_box: Option<ViewBox>) -> Self {
        Self {
            doc: None,
            view_box,
            last_size: UVec2::ZERO,
            dirty: true,
        }
    }
}

/// The node's physical-per-logical scale factor, guarded against the zero
/// `inverse_scale_factor` of a never-laid-out `ComputedNode` (fall back to
/// `1.0` rather than an inf/NaN recip). Shared by the pick refinement and the
/// interaction synthesis — both feed it into `paint::view_box_transform`.
pub(crate) fn node_scale_factor(node: &ComputedNode) -> f32 {
    if node.inverse_scale_factor > 0.0 {
        node.inverse_scale_factor.recip()
    } else {
        1.0
    }
}

/// Stamp the node's intrinsic-size measure from the document: an
/// [`ImageMeasure`] over the document's intrinsic size (converted to physical
/// px, like `bevy_ui`'s own image measure), so an unstyled svg `<image>` lays
/// out exactly like a raster image of that size — aspect ratio preserved when
/// only one axis is constrained — while never reading the texture. (The
/// texture is re-rastered *at* laid-out size; measuring it would loop
/// layout → raster → layout.)
///
/// Ordering caveat for callers: `bevy_ui`'s `update_image_content_size_system`
/// (`PostUpdate`, `UiSystems::Content`) **clears** the measure of any
/// non-`Auto`-mode `ImageNode` whose component changed that frame — so a stamp
/// from the op-apply path (`Update`) is wiped whenever it rides an `ImageNode`
/// re-insert. The raster system must re-stamp from a system ordered after it
/// (and before `UiSystems::Layout`).
pub(crate) fn stamp_intrinsic_measure(
    content_size: &mut ContentSize,
    doc_size: Vec2,
    scale_factor: f32,
    visual_box: VisualBox,
) {
    content_size.set(NodeMeasure::Image(ImageMeasure {
        size: doc_size * scale_factor,
        visual_box,
    }));
}

#[cfg(test)]
mod tests {
    use super::CIRCLE_SVG;

    /// Compile-time proof that a type is `Send + Sync`.
    fn assert_send_sync<T: Send + Sync>() {}

    /// `usvg::Tree` must be `Send + Sync` — Bevy's `Asset` trait requires it,
    /// and the planned SVG asset wraps the parsed tree directly.
    #[test]
    fn usvg_tree_is_send_sync() {
        assert_send_sync::<usvg::Tree>();
    }

    /// Parse a minimal document and rasterize it into a 64×64 pixmap, scaling
    /// the 100×100 viewBox down to fill it. Asserts actual pixel values: the
    /// center of the circle is opaque red, the corner outside it transparent.
    /// (tiny-skia pixels are premultiplied; at full alpha that is a no-op.)
    #[test]
    fn smoke_rasters_a_circle() {
        let tree =
            usvg::Tree::from_str(CIRCLE_SVG, &usvg::Options::default()).expect("valid SVG parses");
        let mut pixmap = tiny_skia::Pixmap::new(64, 64).expect("nonzero pixmap");
        let transform = tiny_skia::Transform::from_scale(64.0 / 100.0, 64.0 / 100.0);
        resvg::render(&tree, transform, &mut pixmap.as_mut());

        let center = pixmap.pixel(32, 32).expect("in bounds");
        assert_eq!(
            (center.red(), center.green(), center.blue(), center.alpha()),
            (255, 0, 0, 255),
            "circle center must be opaque red"
        );
        let corner = pixmap.pixel(1, 1).expect("in bounds");
        assert_eq!(
            corner.alpha(),
            0,
            "corner outside the circle must be transparent"
        );
    }

    /// Informational perf datapoint: wall time to rasterize the same tree at
    /// 512×512. No assertion — run with `--nocapture` to see it.
    #[test]
    fn perf_datapoint_512() {
        let tree =
            usvg::Tree::from_str(CIRCLE_SVG, &usvg::Options::default()).expect("valid SVG parses");
        let mut pixmap = tiny_skia::Pixmap::new(512, 512).expect("nonzero pixmap");
        let transform = tiny_skia::Transform::from_scale(512.0 / 100.0, 512.0 / 100.0);
        let start = std::time::Instant::now();
        resvg::render(&tree, transform, &mut pixmap.as_mut());
        eprintln!(
            "svg perf datapoint: 512x512 circle raster took {:?}",
            start.elapsed()
        );
    }
}
