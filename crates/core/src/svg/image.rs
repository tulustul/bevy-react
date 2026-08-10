//! Svg-mode glue for the `<image>` element: `src` extension detection, the
//! element-owned texture + [`SvgSurface`] lifecycle, and the ignored-attr
//! warning. Called by the bridge machinery (`reconcile::create`/`update`);
//! this module never reaches back into it. (It does borrow the sibling leaf
//! `crate::canvas` for the 1×1 blank placeholder — svg paints into the same
//! kind of CPU-backed image a canvas does.)

use bevy::asset::{AssetServer, Assets, Handle};
use bevy::ecs::world::EntityWorldMut;
use bevy::image::Image;
use bevy::ui::widget::ImageNode;

use super::{SvgDocument, SvgSurface};

/// Whether an `<image src>` selects svg mode: the path ends in `.svg`,
/// case-insensitively.
pub(crate) fn is_svg_src(src: &str) -> bool {
    src.get(src.len().wrapping_sub(4)..)
        .is_some_and(|ext| ext.eq_ignore_ascii_case(".svg"))
}

/// Warn (devtools-flagged) that `atlas`/`sourceRect` are ignored in svg mode:
/// the texture is a raster of the whole document at laid-out size, so there is
/// no source texture to crop or grid. Call under the op's `diag::node_scope`
/// (a queued command would run after the scope guard dropped).
pub(crate) fn warn_ignored_attrs(atlas: bool, source_rect: bool) {
    for (present, name) in [(atlas, "atlas"), (source_rect, "sourceRect")] {
        if present {
            crate::diag::report(
                "svgImageAttrs",
                name,
                &format!(
                    "`{name}` is ignored on an svg-mode <image> \
                     (the document rasters whole at laid-out size)"
                ),
            );
        }
    }
}

/// The queued-command tail of mounting/updating an svg-mode `<image>`:
/// requests `path`'s [`SvgDocument`], keeps (or allocates) the element-owned
/// raster texture, patches it into the prop-built `img`, and syncs the
/// [`SvgSurface`]. Compare-before-write on the document handle: a delta that
/// keeps the same `src` reuses the handle and never re-flags `dirty` (the
/// `bind_background_textures` precedent). The intrinsic measure is **not**
/// stamped here: this path always rides an `ImageNode` insert, which makes
/// `bevy_ui`'s content-size system wipe the measure the same frame — the
/// `PostUpdate` re-stamp (`crate::svg::stamp_svg_measures`) owns it instead.
pub(crate) fn ensure_svg_image(mut entity: EntityWorldMut, path: String, mut img: ImageNode) {
    let doc: Handle<SvgDocument> =
        entity.world_scope(|world| world.resource::<AssetServer>().load(path));
    // The element-owned texture survives prop updates (the raster system
    // repaints it in place); only a node *entering* svg mode allocates a
    // fresh blank.
    let texture = match (entity.get::<SvgSurface>(), entity.get::<ImageNode>()) {
        (Some(_), Some(node)) => node.image.clone(),
        _ => entity.world_scope(|world| {
            world
                .resource_mut::<Assets<Image>>()
                .add(crate::canvas::blank_canvas_image())
        }),
    };
    img.image = texture;
    // Compare through the immutable borrow BEFORE taking `get_mut`: the
    // same-doc path must not even flag `Changed<SvgSurface>`, so the
    // no-churn guarantee is self-enforcing rather than a convention the
    // raster system has to know about.
    let same_doc = entity
        .get::<SvgSurface>()
        .map(|surface| surface.doc.as_ref().map(Handle::id) == Some(doc.id()));
    match same_doc {
        Some(true) => {}
        Some(false) => {
            if let Some(mut surface) = entity.get_mut::<SvgSurface>() {
                surface.doc = Some(doc.clone());
                surface.dirty = true;
            }
        }
        None => {
            entity.insert(SvgSurface::new(doc.clone()));
        }
    }
    entity.insert(img);
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The extension test is case-insensitive, matches only a trailing
    /// `.svg`, and never slices mid-codepoint.
    #[test]
    fn svg_extension_detection() {
        assert!(is_svg_src("icons/a.svg"));
        assert!(is_svg_src("ICONS/A.SVG"));
        assert!(is_svg_src("a.SvG"));
        assert!(!is_svg_src("a.png"));
        assert!(!is_svg_src("svg"));
        assert!(!is_svg_src(".sv"));
        assert!(!is_svg_src("a.svg.png"));
        assert!(!is_svg_src("naïve.png")); // multi-byte tail must not panic
        assert!(is_svg_src("naïve.svg"));
    }
}
