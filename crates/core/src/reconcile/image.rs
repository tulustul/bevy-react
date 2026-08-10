//! `<image>` element rebuild glue shared by the update paths
//! (`apply_update`'s image-dirty branch and `reapply_opacity_outputs`):
//! detect image props and re-derive the `ImageNode`, branching on svg mode.

use bevy::prelude::*;

use super::stats::UiAssets;
use crate::protocol::Props;
use crate::ui_map::{apply_atlas, image_node_promoted, svg_image_node};

/// (Re)build an `<image>`'s `ImageNode` from its merged props, branching on
/// svg mode: an `.svg` src keeps the element-owned raster texture + document
/// binding (via the queued `crate::svg::ensure_svg_image`, which also handles
/// a raster→svg transition), while any other src restores the plain
/// texture-loading path and drops a stale `SvgSurface`. `warn_svg_attrs` is
/// set on prop-driven rebuilds (a promotion flip carries no new props).
pub(super) fn rebuild_image(
    ec: &mut EntityCommands,
    props: &Props,
    assets: &AssetServer,
    ui_assets: &mut UiAssets,
    promoted: bool,
    warn_svg_attrs: bool,
) {
    if let Some(path) = props.src.as_deref().filter(|p| crate::svg::is_svg_src(p)) {
        if warn_svg_attrs {
            crate::svg::warn_ignored_attrs(props.atlas.is_some(), props.source_rect.is_some());
        }
        let img = svg_image_node(props, promoted);
        let path = path.to_owned();
        ec.queue(move |entity: EntityWorldMut| crate::svg::ensure_svg_image(entity, path, img));
    } else {
        let mut img = image_node_promoted(props, assets, promoted);
        apply_atlas(
            &mut img,
            props,
            &mut ui_assets.layouts,
            &mut ui_assets.atlas_cache,
        );
        ec.insert(img);
        ec.remove::<crate::svg::SvgSurface>();
    }
}

/// Whether these props carry any `image` element attribute.
pub(super) fn is_image(props: &Props) -> bool {
    props.src.is_some()
        || props.tint.is_some()
        || props.image_mode.is_some()
        || props.flip_x
        || props.flip_y
        || props.source_rect.is_some()
        || props.atlas.is_some()
        || props.visual_box.is_some()
}
