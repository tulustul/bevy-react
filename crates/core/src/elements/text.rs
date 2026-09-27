//! `<text>`: a text block root (a styled node carrying the `Text` — fully
//! interactive and layer-eligible like a `<node>`), and `textSpan`, a nested
//! `<text>` (the reconciler's wire kind for a `<text>` inside a `<text>`): a
//! styled `Node`-less run of its block. A single-string child rides inline
//! as the create op's `text`; bare strings become inheriting runs (see the
//! `createTextSpan` op). The resolved-style inheritance is the core's text
//! service, keyed off [`TextRole`].

use bevy::prelude::*;

use crate::element::{Common, Element, SpawnCtx};
use crate::ext::{ElementFlags, TextRole};
use crate::ui_map::text_layout;

/// The `<text>` block root.
pub static TEXT: Element = Element {
    flags: ElementFlags {
        text: TextRole::Block,
        ..ElementFlags::NODE
    },
    spawn: Some(spawn_text),
    ..Element::new("text")
};

/// A nested `<text>`: a styled span. Layer-family styles and pointer
/// handlers are structural no-ops on it (no layout box; glyphs belong to the
/// block) — warned.
pub static TEXT_SPAN: Element = Element {
    flags: ElementFlags {
        text: TextRole::Span,
        ..ElementFlags::NODE_LESS
    },
    common: Common::IDENTITY,
    spawn: Some(spawn_span),
    ..Element::new("textSpan")
};

fn spawn_text(ctx: &mut SpawnCtx) -> Entity {
    let text = Text::new(ctx.text.unwrap_or_default());
    let resolved = ctx.text_style();
    let layout = text_layout(ctx.style.as_ref());
    let entity = ctx.spawn((text, resolved));
    if let Some(layout) = layout {
        ctx.commands.entity(entity).insert(layout);
    }
    entity
}

fn spawn_span(ctx: &mut SpawnCtx) -> Entity {
    let span = TextSpan(ctx.text.unwrap_or_default().to_owned());
    let resolved = ctx.text_style();
    ctx.spawn((span, resolved))
}
