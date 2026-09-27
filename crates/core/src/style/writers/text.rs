//! Text writers. The resolved style is split in two halves so a recolor
//! never touches the shaping components (bevy_text re-shapes a block on
//! `Changed<TextFont | LineHeight | LetterSpacing>`, never on `TextColor`).

use bevy::prelude::*;
use bevy::text::{LetterSpacing, LineHeight, TextCursorStyle};

use super::folded_opacity;
use crate::style::props::*;
use crate::style::{Writer, owns};
use crate::ui_map::{
    remove_unless_fresh, resolve_text_color, resolve_text_font, set_if_neq_or_insert, text_layout,
    text_shadow,
};

/// `TextColor` of a text node (the `opacity` fold suppressed on a promoted
/// root). An `editableText`'s caret follows it, so it stays visible on any
/// themed background.
pub static TEXT_COLOR_WRITER: Writer = Writer {
    reads: &[&COLOR, &OPACITY],
    writes: &[owns::<TextColor>, owns::<TextCursorStyle>],
    apply: |ctx, s, ec| {
        if !ctx.text {
            return;
        }
        let color = resolve_text_color(Some(s), ctx.promoted);
        ec.queue(set_if_neq_or_insert(color));
        if ctx.kind == "editableText" {
            ec.queue(move |mut entity: EntityWorldMut| {
                if let Some(mut cursor) = entity.get_mut::<TextCursorStyle>()
                    && cursor.color != color.0
                {
                    cursor.color = color.0;
                }
            });
        }
    },
};

/// The shaping half: `TextFont` + `LineHeight` + `LetterSpacing`, each
/// compare-before-write.
pub static TEXT_FONT_WRITER: Writer = Writer {
    reads: &[
        &FONT_SIZE,
        &FONT_WEIGHT,
        &FONT_FAMILY,
        &LINE_HEIGHT,
        &LETTER_SPACING,
    ],
    writes: &[owns::<TextFont>, owns::<LineHeight>, owns::<LetterSpacing>],
    apply: |ctx, s, ec| {
        if !ctx.text {
            return;
        }
        let (font, line, spacing) = resolve_text_font(Some(s), ctx.fonts);
        ec.queue(set_if_neq_or_insert(font));
        ec.queue(set_if_neq_or_insert(line));
        ec.queue(set_if_neq_or_insert(spacing));
    },
};

/// `TextLayout` from `textAlign`/`lineBreak`. Never removed when both go
/// absent, only overwritten (a parity quirk). An `editableText`'s layout
/// comes from its `multiline` prop instead.
pub static TEXT_LAYOUT_WRITER: Writer = Writer {
    reads: &[&TEXT_ALIGN, &LINE_BREAK],
    writes: &[owns::<TextLayout>],
    apply: |ctx, s, ec| {
        if !ctx.text || ctx.kind == "editableText" {
            return;
        }
        if let Some(layout) = text_layout(Some(s)) {
            ec.insert(layout);
        }
    },
};

/// A `<text>` root's block drop shadow (inert on non-text nodes); removed
/// when the style drops it.
pub static TEXT_SHADOW_WRITER: Writer = Writer {
    reads: &[&TEXT_SHADOW, &OPACITY],
    writes: &[owns::<TextShadow>],
    apply: |ctx, s, ec| match text_shadow(Some(s), folded_opacity(ctx, s)) {
        Some(shadow) => {
            ec.insert(shadow);
        }
        None => remove_unless_fresh::<TextShadow>(ec, ctx.fresh),
    },
};
