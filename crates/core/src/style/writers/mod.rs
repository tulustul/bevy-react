//! The core's style writers — registered through the same
//! `add_react_style_writers` call a feature crate uses ([`CORE_WRITERS`]).
//! Each turns part of the merged style into components; see [`Writer`].

use super::{Writer, WriterCtx};
use crate::style::Style;
use crate::style::props::OPACITY;

mod interaction;
mod layer;
mod layout;
mod paint;
mod text;

pub use interaction::*;
pub use layer::*;
pub use layout::*;
pub use paint::*;
pub use text::*;

/// Every core writer, in apply order (their bits).
pub static CORE_WRITERS: &[&Writer] = &[
    &LAYOUT_WRITER,
    &GROUP_ALPHA_WRITER,
    &BACKGROUND_COLOR_WRITER,
    &TRANSFORM_WRITER,
    &TRANSFORM3D_WRITER,
    &BORDER_COLOR_WRITER,
    &OUTLINE_WRITER,
    &BOX_SHADOW_WRITER,
    &BACKGROUND_GRADIENT_WRITER,
    &BORDER_GRADIENT_WRITER,
    &GRADIENT_TARGETS_WRITER,
    &TEXT_SHADOW_WRITER,
    &Z_INDEX_WRITER,
    &GLOBAL_Z_INDEX_WRITER,
    &IMAGE_RENDERING_WRITER,
    &LAYOUT_ROUNDING_WRITER,
    &CURSOR_WRITER,
    &SCROLLBAR_WRITER,
    &FOCUS_POLICY_WRITER,
    &FILTER_WRITER,
    &BACKDROP_FILTER_WRITER,
    &MORPH_FILTER_WRITER,
    &TRANSITION_WRITER,
    &BACKGROUND_IMAGE_WRITER,
    &TEXT_COLOR_WRITER,
    &TEXT_FONT_WRITER,
    &TEXT_LAYOUT_WRITER,
    &SCROLL_TRANSITION_WRITER,
    &super::STAMP_WRITER,
];

/// The writers whose components ride a fresh element's spawn bundle
/// (`fresh_style_bundle` and the text spawn tuples) instead of the fresh
/// apply.
pub(crate) static FRESH_BUNDLED: &[&Writer] = &[
    &LAYOUT_WRITER,
    &BACKGROUND_COLOR_WRITER,
    &BORDER_COLOR_WRITER,
    &Z_INDEX_WRITER,
    &FOCUS_POLICY_WRITER,
    &TEXT_COLOR_WRITER,
    &TEXT_FONT_WRITER,
    &TEXT_LAYOUT_WRITER,
];

/// The writers a nested `<text>` span runs (it has no `Node` — no box to
/// style beyond its glyphs).
pub(crate) static SPAN_WRITERS: &[&Writer] =
    &[&TEXT_COLOR_WRITER, &TEXT_FONT_WRITER, &TEXT_LAYOUT_WRITER];

/// The opacity a style folds into colors: its static value, or `None` on a
/// promoted layer root (the layer's group alpha owns the fade).
fn folded_opacity(ctx: &WriterCtx, s: &Style) -> Option<f32> {
    use crate::protocol::animatable::AnimatableField;
    if ctx.promoted {
        None
    } else {
        s.get(&OPACITY).static_val()
    }
}

#[cfg(test)]
mod tests;
