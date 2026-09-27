//! `<image>`: a styled node whose `ImageNode` is element-owned — a loaded
//! texture (`src`), or a solid tint; an `.svg` `src` enters **svg mode** (an
//! element-owned raster painted at laid-out size — see `crate::svg`).

use bevy::prelude::*;
use bevy::ui::widget::NodeImageMode;

use crate::element::{Attribute, Element};
use crate::ext::ElementFlags;
use crate::protocol::animatable::AnimatableField;
use crate::protocol::background_image::{AtlasSpec, ImageMode, SourceRect};
use crate::style::props::OPACITY;
use crate::style::{Codec, Invalidation, Writer, WriterCtx, owns};
use crate::ui_map::{AtlasLayoutCache, apply_atlas, image_node, svg_image_node};

/// Asset path, resolved by Bevy's `AssetServer` (relative to the app's
/// `assets/` folder). Absent → a solid-color image (see [`TINT`]). An `.svg`
/// path (case-insensitive) enters svg mode.
pub static SRC: Attribute<String> = Attribute {
    invalidate: Invalidation::PAINT,
    ..Attribute::new("src")
};
/// Tint multiplied with the image (a CSS color); also the fill of a
/// `src`-less image.
pub static TINT: Attribute<String> = Attribute {
    invalidate: Invalidation::PAINT,
    ..Attribute::new("tint")
};
/// Flip the image along its x-axis.
pub static FLIP_X: Attribute<bool> = Attribute {
    invalidate: Invalidation::PAINT,
    ..Attribute::new("flipX")
};
/// Flip the image along its y-axis.
pub static FLIP_Y: Attribute<bool> = Attribute {
    invalidate: Invalidation::PAINT,
    ..Attribute::new("flipY")
};
/// How the image fits its box: `"auto"` / `"stretch"`, or a `type`-tagged
/// object for 9-slice (`"sliced"`) / `"tiled"` scaling.
pub static IMAGE_MODE: Attribute<ImageMode> = Attribute {
    invalidate: Invalidation::PAINT,
    ..Attribute::with_codec("imageMode", Codec::serde_as("ImageMode"))
};
/// Source sub-rect of the texture, in source-texture pixels
/// (`ImageNode.rect`). With `atlas`, it offsets from the cell's corner.
pub static SOURCE_RECT: Attribute<SourceRect> = Attribute {
    invalidate: Invalidation::PAINT,
    ..Attribute::with_codec("sourceRect", Codec::serde_as("SourceRect"))
};
/// Treat `src` as a uniform sprite-sheet grid and select one cell
/// (`ImageNode.texture_atlas`, a cached `TextureAtlasLayout`).
pub static ATLAS: Attribute<AtlasSpec> = Attribute {
    invalidate: Invalidation::PAINT,
    ..Attribute::with_codec("atlas", Codec::serde_as("AtlasSpec"))
};
/// Which box of the node the image fills: `"content"` | `"padding"`
/// (default) | `"border"` (`ImageNode.visual_box`).
pub static VISUAL_BOX: Attribute<String> = Attribute {
    invalidate: Invalidation::PAINT,
    ..Attribute::with_codec(
        "visualBox",
        Codec::serde_as("\"content\" | \"padding\" | \"border\""),
    )
};

/// The `<image>` element.
pub static IMAGE: Element = Element {
    flags: ElementFlags::OWNS_IMAGE,
    attrs: &[
        &SRC,
        &TINT,
        &FLIP_X,
        &FLIP_Y,
        &IMAGE_MODE,
        &SOURCE_RECT,
        &ATLAS,
        &VISUAL_BOX,
    ],
    writers: &[&IMAGE_WRITER],
    ..Element::new("image")
};

/// The `<image>`'s `ImageNode`: rebuilt from the attributes and the merged
/// `opacity` (folded into the tint unless the node is a promoted layer root)
/// whenever any of them changes — a `src` swap, a hover opacity, a promotion
/// flip — and written compare-before-write so an unchanged rebuild ticks
/// nothing.
pub static IMAGE_WRITER: Writer = Writer {
    reads: &[&OPACITY],
    attrs: &[
        &SRC,
        &TINT,
        &FLIP_X,
        &FLIP_Y,
        &IMAGE_MODE,
        &SOURCE_RECT,
        &ATLAS,
        &VISUAL_BOX,
    ],
    writes: &[owns::<ImageNode>],
    apply: apply_image,
};

fn apply_image(ctx: &WriterCtx, s: &crate::style::Style, ec: &mut EntityCommands) {
    let opacity = s.get(&OPACITY).static_val();
    let attrs = ctx.attrs;
    if let Some(path) = attrs
        .get(&SRC)
        .filter(|p| crate::svg::is_svg_src(p.as_str()))
    {
        crate::svg::warn_ignored_attrs(attrs.contains(&ATLAS), attrs.contains(&SOURCE_RECT));
        let img = svg_image_node(attrs, opacity, ctx.promoted);
        let path = path.clone();
        ec.queue(move |entity: EntityWorldMut| crate::svg::ensure_svg_image(entity, path, img));
        return;
    }
    let mut img = image_node(attrs, opacity, ctx.assets, ctx.promoted);
    let atlas = attrs.get(&ATLAS).cloned();
    let fresh = ctx.fresh;
    ec.queue(move |mut entity: EntityWorldMut| {
        if let Some(atlas) = atlas {
            entity.world_scope(|world| {
                world.resource_scope(|world, mut cache: Mut<AtlasLayoutCache>| {
                    let mut layouts = world.resource_mut::<Assets<TextureAtlasLayout>>();
                    apply_atlas(&mut img, Some(&atlas), &mut layouts, &mut cache);
                });
            });
        }
        set_image_node(&mut entity, img);
        if !fresh {
            entity.remove::<(crate::svg::SvgSurface, crate::ext::LiveTexture)>();
        }
    });
}

/// Write `img` onto the entity's `ImageNode` field by field, compare-before-
/// write (a rebuilt node equal to the current one ticks nothing — the
/// image-rendering binding reacts to `Changed<ImageNode>`).
fn set_image_node(entity: &mut EntityWorldMut, img: ImageNode) {
    let Some(mut current) = entity.get_mut::<ImageNode>() else {
        entity.insert(img);
        return;
    };
    let unchanged = current.image == img.image
        && current.color == img.color
        && current.flip_x == img.flip_x
        && current.flip_y == img.flip_y
        && current.rect == img.rect
        && current.texture_atlas == img.texture_atlas
        && current.visual_box == img.visual_box
        && same_mode(&current.image_mode, &img.image_mode);
    if !unchanged {
        *current = img;
    }
}

fn same_mode(a: &NodeImageMode, b: &NodeImageMode) -> bool {
    format!("{a:?}") == format!("{b:?}")
}
