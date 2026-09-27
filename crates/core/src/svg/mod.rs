mod asset;
mod image;
mod raster;
mod text;
use bevy::asset::Handle;
use bevy::ecs::component::Component;
use bevy::math::{UVec2, Vec2};
use bevy::ui::widget::ImageMeasure;
use bevy::ui::{ContentSize, NodeMeasure, VisualBox};

pub use asset::{SvgAssetLoader, SvgDocument, SvgParseError, parse_svg_bytes};
pub(crate) use image::{ensure_svg_image, is_svg_src, warn_ignored_attrs};
pub use raster::{rasterize_document, stamp_svg_measures, update_svg_surfaces};

/// The 100×100-viewBox red-circle fixture shared by the svg test suites
/// (parse, raster, and the rasterizer spike below).
#[cfg(test)]
pub(crate) const CIRCLE_SVG: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#f00"/></svg>"##;

/// The element-owned raster surface of an `<image>` whose `src` names an
/// `.svg` asset (**svg mode**): the node's `ImageNode` texture is an
/// element-owned pixel buffer — never a path loaded as a Bevy `Image` — and
/// the svg raster system repaints it at the laid-out size whenever the
/// layout or the document change. (The JSX `<svg>` element is the
/// `bevy_react_svg` feature's own surface.)
#[derive(Component)]
pub struct SvgSurface {
    /// The parsed document to rasterize.
    pub doc: Handle<SvgDocument>,
    /// Physical-px size of the last raster; `UVec2::ZERO` before the first.
    pub last_size: UVec2,
    /// Repaint requested: set on mount and whenever the document handle
    /// changes; the raster system clears it after painting.
    pub dirty: bool,
    /// Reused raster buffers — a cache, not state: the raster system writes
    /// it through `bypass_change_detection`, so a repaint alone never ticks
    /// `Changed<SvgSurface>` (the clean-frame / derived-dirt contract).
    pub(crate) raster: crate::raster::RasterCache,
}

impl SvgSurface {
    /// A fresh surface awaiting its first raster of `doc`.
    pub fn new(doc: Handle<SvgDocument>) -> Self {
        Self {
            doc,
            last_size: UVec2::ZERO,
            dirty: true,
            raster: crate::raster::RasterCache::default(),
        }
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
