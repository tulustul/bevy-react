//! Paint writers: colors, borders, shadows, gradients, background images.

use bevy::prelude::*;
use bevy::ui::widget::NodeImageMode;

use super::folded_opacity;
use bevy::image::TRANSPARENT_IMAGE_HANDLE;

use crate::background_image::{BackgroundTileScale, RBackgroundTexture};
use crate::image_rendering::{ImageRendering, ImageRenderingMode};
use crate::protocol::animatable::AnimatableField;
use crate::protocol::background_image::BackgroundImageSource;
use crate::style::Style;
use crate::style::props::*;
use crate::style::{Writer, WriterCtx, owns};
use crate::ui_map::{
    GradientTargets, apply_opacity, background_color, border_color, build_box_shadows,
    build_gradients, length_to_val, parse_color, remove_unless_fresh, set_if_neq_or_insert,
};

/// `BackgroundColor` (the folded static color) — `Node`-required: never
/// removed, written compare-before-write, absent lands the default.
pub static BACKGROUND_COLOR_WRITER: Writer = Writer {
    reads: &[&BACKGROUND_COLOR, &OPACITY],
    attrs: &[],
    writes: &[owns::<BackgroundColor>],
    apply: |ctx, s, ec| {
        ec.queue(set_if_neq_or_insert(background_color(
            Some(s),
            folded_opacity(ctx, s),
        )));
    },
};

/// `BorderColor` — `Node`-required, like `BackgroundColor`.
pub static BORDER_COLOR_WRITER: Writer = Writer {
    reads: &[&BORDER_COLOR],
    attrs: &[],
    writes: &[owns::<BorderColor>],
    apply: |_, s, ec| {
        ec.queue(set_if_neq_or_insert(border_color(Some(s))));
    },
};

pub static OUTLINE_WRITER: Writer = Writer {
    reads: &[&OUTLINE],
    attrs: &[],
    writes: &[owns::<Outline>],
    apply: |ctx, s, ec| match s.get(&OUTLINE) {
        Some(o) => {
            ec.insert(Outline {
                width: o.width.map(length_to_val).unwrap_or(Val::Px(1.0)),
                offset: o.offset.map(length_to_val).unwrap_or(Val::Px(0.0)),
                color: o.color.as_deref().map(parse_color).unwrap_or(Color::WHITE),
            });
        }
        None => remove_unless_fresh::<Outline>(ec, ctx.fresh),
    },
};

pub static BOX_SHADOW_WRITER: Writer = Writer {
    reads: &[&BOX_SHADOW],
    attrs: &[],
    writes: &[owns::<BoxShadow>],
    apply: |ctx, s, ec| match s.get(&BOX_SHADOW) {
        Some(b) => {
            ec.insert(BoxShadow(build_box_shadows(b)));
        }
        None => remove_unless_fresh::<BoxShadow>(ec, ctx.fresh),
    },
};

pub static BACKGROUND_GRADIENT_WRITER: Writer = Writer {
    reads: &[&BACKGROUND_GRADIENT, &OPACITY],
    attrs: &[],
    writes: &[owns::<BackgroundGradient>],
    apply: |ctx, s, ec| match s.get(&BACKGROUND_GRADIENT) {
        Some(grad) => {
            ec.insert(BackgroundGradient(build_gradients(
                grad,
                folded_opacity(ctx, s),
            )));
        }
        None => remove_unless_fresh::<BackgroundGradient>(ec, ctx.fresh),
    },
};

pub static BORDER_GRADIENT_WRITER: Writer = Writer {
    reads: &[&BORDER_GRADIENT, &OPACITY],
    attrs: &[],
    writes: &[owns::<BorderGradient>],
    apply: |ctx, s, ec| match s.get(&BORDER_GRADIENT) {
        Some(grad) => {
            ec.insert(BorderGradient(build_gradients(
                grad,
                folded_opacity(ctx, s),
            )));
        }
        None => remove_unless_fresh::<BorderGradient>(ec, ctx.fresh),
    },
};

/// The gradient engines' input: unfolded builds + the fold opacity. Queued
/// set-if-neq so a settled restyle doesn't trip change detection; removed
/// when neither surface has a gradient.
pub static GRADIENT_TARGETS_WRITER: Writer = Writer {
    reads: &[&BACKGROUND_GRADIENT, &BORDER_GRADIENT, &OPACITY],
    attrs: &[],
    writes: &[owns::<GradientTargets>],
    apply: apply_gradient_targets,
};

fn apply_gradient_targets(ctx: &WriterCtx, s: &Style, ec: &mut EntityCommands) {
    let targets = GradientTargets {
        background: s
            .get(&BACKGROUND_GRADIENT)
            .map(|g| build_gradients(g, None)),
        border: s.get(&BORDER_GRADIENT).map(|g| build_gradients(g, None)),
        opacity: folded_opacity(ctx, s),
    };
    let gradient_less = targets.background.is_none() && targets.border.is_none();
    if ctx.fresh && gradient_less {
        return;
    }
    if gradient_less {
        ec.remove::<GradientTargets>();
    } else {
        ec.queue(set_if_neq_or_insert(targets));
    }
}

/// `imageRendering`: an explicit mode stamps the marker the binding systems
/// (`crate::image_rendering`) pair with the entity's `ImageNode`; `auto` is
/// passive, so it reads as absent.
pub static IMAGE_RENDERING_WRITER: Writer = Writer {
    reads: &[&IMAGE_RENDERING],
    attrs: &[],
    writes: &[owns::<ImageRenderingMode>],
    apply: |ctx, s, ec| match s.get(&IMAGE_RENDERING).copied() {
        Some(mode) if mode != ImageRendering::Auto => {
            ec.insert(ImageRenderingMode(mode));
        }
        _ => remove_unless_fresh::<ImageRenderingMode>(ec, ctx.fresh),
    },
};

/// `backgroundImage` → the node's `ImageNode` (plus the
/// [`RBackgroundTexture`]/[`BackgroundTileScale`] markers). Skipped where the
/// `ImageNode` belongs to the element (image/canvas/portal/svg) and on
/// styleless or detached-surface nodes — those warn at the call site.
pub static BACKGROUND_IMAGE_WRITER: Writer = Writer {
    reads: &[&BACKGROUND_IMAGE, &OPACITY],
    attrs: &[],
    writes: &[
        owns::<ImageNode>,
        owns::<RBackgroundTexture>,
        owns::<BackgroundTileScale>,
    ],
    apply: apply_background_image,
};

fn apply_background_image(ctx: &WriterCtx, s: &Style, ec: &mut EntityCommands) {
    if ctx.flags.owns_image || ctx.flags.node_less {
        return;
    }
    let Some(spec) = s.get(&BACKGROUND_IMAGE) else {
        if !ctx.fresh {
            ec.remove::<(
                ImageNode,
                RBackgroundTexture,
                BackgroundTileScale,
                crate::ext::LiveTexture,
            )>();
        }
        return;
    };
    let mut image = match &spec.src {
        BackgroundImageSource::Path(path) => {
            // A stale marker would let `bind_background_textures` stomp the
            // asset handle — clear it whenever the source is a path.
            ec.remove::<(RBackgroundTexture, crate::ext::LiveTexture)>();
            ImageNode::new(ctx.assets.load(path.clone()))
        }
        BackgroundImageSource::Texture { texture } => {
            ec.insert((RBackgroundTexture(texture.clone()), crate::ext::LiveTexture));
            ImageNode::new(TRANSPARENT_IMAGE_HANDLE)
        }
    };
    // An animated tint reads as absent here (white base) — the animation
    // applier (`AnimatableProperty::BackgroundImageTint`) drives the color
    // every frame instead.
    if let Some(tint) = spec.tint.static_ref() {
        image.color = parse_color(tint);
    }
    // `opacity` folds into the tint alpha exactly like `image_node`:
    // suppressed on a promoted layer root (group alpha applies at composite).
    image.color = apply_opacity(image.color, folded_opacity(ctx, s));
    let mode = spec.mode.unwrap_or_default();
    if mode.tiles() {
        // `stretch_value` is written in logical terms here;
        // `sync_background_tile_scale` applies the DPI correction (it also
        // reacts to this very insert via `Changed<ImageNode>`).
        let scale = spec.scale.static_val().unwrap_or(1.0);
        let (tile_x, tile_y) = mode.tile_axes();
        image.image_mode = NodeImageMode::Tiled {
            tile_x,
            tile_y,
            stretch_value: scale,
        };
        ec.insert(BackgroundTileScale(scale));
    } else {
        image.image_mode = NodeImageMode::Stretch;
        ec.remove::<BackgroundTileScale>();
    }
    ec.insert(image);
}
