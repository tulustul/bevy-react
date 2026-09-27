//! `<editableText>`: a focusable native text input. Bevy's
//! `EditableTextInputPlugin` (registered by `DefaultPlugins`) drives
//! keyboard/focus/cursor/selection/clipboard; the element spawns the widget,
//! pushes controlled values into it, and reports edits back as its own
//! events (`onChange`/`onSelect`/`onFocus`/`onBlur`).

use accesskit::Role;
use bevy::a11y::AccessibilityNode;
use bevy::input_focus::tab_navigation::TabIndex;
use bevy::input_focus::{AutoFocus, FocusGained, FocusLost};
use bevy::prelude::*;
use bevy::text::{EditableText, FontCx, LayoutCx, TextCursorStyle, TextEdit, TextEditChange};
use serde::Serialize;

use crate::bridge::FocusState;
use crate::element::{Attribute, Common, Element, ElementEvent, ElementEvents, SpawnCtx};
use crate::ext::{ElementFlags, TextRole};
use crate::style::{Writer, WriterCtx, owns};

/// The controlled text. Act-now: seeds the field on create; on update it is
/// pushed into the widget only when it diverges from the live buffer (so
/// typing is never clobbered).
pub static VALUE: Attribute<String> = Attribute {
    event: true,
    ..Attribute::new("value")
};
/// The maximum number of characters accepted.
pub static MAX_LENGTH: Attribute<usize> = Attribute::new("maxLength");
/// Whether the input accepts newlines (multi-line).
pub static MULTILINE: Attribute<bool> = Attribute::new("multiline");
/// Focus the input when it mounts.
pub static AUTOFOCUS: Attribute<bool> = Attribute::new("autofocus");
/// The controlled selection anchor, a UTF-8 **byte** offset into the value.
/// Applied as a pair with [`SELECTION_END`] whenever either changes (a
/// re-render repeating the same pair re-applies nothing, so the user's own
/// caret moves are never clobbered).
pub static SELECTION_START: Attribute<usize> = Attribute::new("selectionStart");
/// The controlled selection focus, a UTF-8 **byte** offset.
pub static SELECTION_END: Attribute<usize> = Attribute::new("selectionEnd");
/// The accessible name announced to assistive tech.
pub static ARIA_LABEL: Attribute<String> = Attribute::new("ariaLabel");

/// The payload of `onSelect`: the selection as UTF-8 byte offsets.
#[derive(Debug, Clone, Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
pub struct SelectEvent {
    pub selection_start: usize,
    pub selection_end: usize,
    /// `"forward"` (anchor ≤ focus), `"backward"`, or `"none"` (collapsed).
    #[ts(type = "\"forward\" | \"backward\" | \"none\"")]
    pub selection_direction: String,
    /// Whether an IME composition is in progress.
    pub composing: bool,
}

/// The text changed (the handler receives the new text).
pub static CHANGE: ElementEvent<String> = ElementEvent::new("change");
/// The selection moved (only sent while an `onSelect` is declared — caret
/// moves are frequent).
pub static SELECT: ElementEvent<SelectEvent> = ElementEvent::new("select");
/// The input gained focus.
pub static FOCUS: ElementEvent<()> = ElementEvent::new("focus");
/// The input lost focus.
pub static BLUR: ElementEvent<()> = ElementEvent::new("blur");

/// The `<editableText>` element.
pub static EDITABLE_TEXT: Element = Element {
    flags: ElementFlags {
        text: TextRole::Input,
        ..ElementFlags::NODE
    },
    attrs: &[
        &VALUE,
        &MAX_LENGTH,
        &MULTILINE,
        &AUTOFOCUS,
        &SELECTION_START,
        &SELECTION_END,
        &ARIA_LABEL,
    ],
    common: Common::IDENTITY.with(Common::VARIANTS),
    writers: &[&EDITABLE_WRITER],
    events: &[&CHANGE, &SELECT, &FOCUS, &BLUR],
    spawn: Some(spawn_editable),
    ..Element::new("editableText")
};

/// The last value reported (or pushed): `onChange` fires only when the live
/// text diverges from it, so a programmatic set never echoes back.
#[derive(Component, Debug, Default, Clone, PartialEq)]
pub struct EditableValue(pub String);

/// The last selection reported (or applied), `(anchor, focus)`: `onSelect`
/// fires only when it moves.
#[derive(Component, Debug, Default, Clone, Copy, PartialEq)]
pub struct EditableSelection(pub Option<(usize, usize)>);

/// A controlled selection waiting for [`apply_pending_selections`] (after
/// Bevy's text-edit pass, so offsets resolve against this frame's text).
#[derive(Component, Debug, Clone, Copy, PartialEq)]
pub struct PendingSelection(pub usize, pub usize);

fn spawn_editable(ctx: &mut SpawnCtx) -> Entity {
    let attrs = &ctx.props.attrs;
    let value = attrs.get(&VALUE).cloned().unwrap_or_default();
    let multiline = attrs.get(&MULTILINE).copied().unwrap_or(false);
    let mut editable = EditableText::new(&value);
    editable.max_characters = attrs.get(&MAX_LENGTH).copied();
    editable.allow_newlines = multiline;
    let (text_color, font, line_height, letter_spacing) = ctx.text_style();
    let a11y = a11y_node(
        multiline,
        attrs.get(&ARIA_LABEL).map(String::as_str),
        &value,
    );
    let entity = ctx.spawn((
        (
            editable,
            text_color,
            font,
            line_height,
            letter_spacing,
            TextLayout {
                linebreak: if multiline {
                    LineBreak::WordBoundary
                } else {
                    LineBreak::NoWrap
                },
                ..default()
            },
            // Caret follows the text color so it stays visible on any themed
            // background (the default is a dark slate).
            TextCursorStyle {
                color: text_color.0,
                ..default()
            },
        ),
        (
            // Focusable via click (the widget's picking observers) and Tab.
            TabIndex(0),
            // The input is a click owner BY TYPE — `collect_ui_events`
            // matches `EditableText` directly — so a press inside it resolves
            // to the input, not to an `onClick` ancestor behind it. The
            // `Interaction` serves hover/press styling and the pointer-capture
            // claim.
            Interaction::default(),
            // Announce as a text field; the live value is kept in sync by
            // `sync_editable_a11y`.
            AccessibilityNode(a11y),
            EditableValue(value),
            EditableSelection::default(),
        ),
    ));
    let mut ec = ctx.commands.entity(entity);
    // `AutoFocus`'s `on_add` hook focuses the entity once mounted.
    if attrs.get(&AUTOFOCUS).copied().unwrap_or(false) {
        ec.insert(AutoFocus);
    }
    if let (Some(&start), Some(&end)) = (attrs.get(&SELECTION_START), attrs.get(&SELECTION_END)) {
        ec.insert(PendingSelection(start, end));
    }
    entity
}

/// The accessibility node of an input: role + label + value.
fn a11y_node(multiline: bool, label: Option<&str>, value: &str) -> accesskit::Node {
    let mut node = accesskit::Node::new(if multiline {
        Role::MultilineTextInput
    } else {
        Role::TextInput
    });
    if let Some(label) = label {
        node.set_label(label.to_owned());
    }
    node.set_value(value.to_owned());
    node
}

/// The live input from the attributes: the controlled value (pushed only
/// when it diverges from the buffer), the controlled selection pair, the
/// accessible label, and the length/newline limits — each compare-before-
/// write.
pub static EDITABLE_WRITER: Writer = Writer {
    reads: &[],
    attrs: &[
        &VALUE,
        &MAX_LENGTH,
        &MULTILINE,
        &SELECTION_START,
        &SELECTION_END,
        &ARIA_LABEL,
    ],
    writes: &[
        owns::<EditableValue>,
        owns::<PendingSelection>,
        owns::<AccessibilityNode>,
    ],
    apply: apply_editable,
};

fn apply_editable(ctx: &WriterCtx, _s: &crate::style::Style, ec: &mut EntityCommands) {
    if ctx.fresh {
        // The spawn seeded everything from the create's attributes.
        return;
    }
    // The writer re-runs when either half of the pair changed (or another
    // attribute it reads did — a harmless re-select of the same range is
    // avoided by comparing with the last applied pair in the queue).
    if let (Some(&start), Some(&end)) = (ctx.attr(&SELECTION_START), ctx.attr(&SELECTION_END)) {
        ec.queue(move |mut entity: EntityWorldMut| {
            let applied = entity
                .get::<EditableSelection>()
                .is_some_and(|s| s.0 == Some((start, end)));
            if !applied {
                entity.insert(PendingSelection(start, end));
            }
        });
    }
    let value = ctx.event(&VALUE).cloned();
    let label = ctx.attr(&ARIA_LABEL).cloned();
    let max = ctx.attr(&MAX_LENGTH).copied();
    let newlines = ctx.attr(&MULTILINE).copied().unwrap_or(false);
    ec.queue(move |mut entity: EntityWorldMut| {
        if let Some(value) = value {
            if let Some(mut editable) = entity.get_mut::<EditableText>()
                && editable.value().to_string() != value
            {
                editable.editor_mut().set_text(&value);
                editable.queue_edit(TextEdit::TextEnd(false));
            }
            // Re-baseline so the `onChange` dedup doesn't echo this set.
            if let Some(mut last) = entity.get_mut::<EditableValue>() {
                last.set_if_neq(EditableValue(value));
            }
        }
        if let Some(mut editable) = entity.get_mut::<EditableText>() {
            if editable.max_characters != max {
                editable.max_characters = max;
            }
            if editable.allow_newlines != newlines {
                editable.allow_newlines = newlines;
            }
        }
        if let Some(mut node) = entity.get_mut::<AccessibilityNode>()
            && node.label() != label.as_deref()
        {
            match &label {
                Some(label) => node.set_label(label.clone()),
                None => node.clear_label(),
            }
        }
    });
}

/// Report edits back to JS. Bevy triggers [`TextEditChange`] after applying
/// edits — but also on cursor/selection moves — so this single observer
/// sends a `change` (deduped against [`EditableValue`]) when the text
/// changed, and a `select` (deduped against [`EditableSelection`], only with
/// an `onSelect` handler) when the selection moved.
pub fn on_text_edit_change(
    change: On<TextEditChange>,
    mut editables: Query<(&EditableText, &mut EditableValue, &mut EditableSelection)>,
    events: ElementEvents,
) {
    let entity = change.event_target();
    let Ok((editable, mut last_value, mut last_selection)) = editables.get_mut(entity) else {
        return;
    };
    let value = editable.value().to_string();
    if last_value.0 != value {
        last_value.0 = value.clone();
        events.send(entity, &CHANGE, &value);
    }
    if events.subscribed(entity, &SELECT) {
        let sel = editable.editor().raw_selection();
        let anchor = sel.anchor().index();
        let focus = sel.focus().index();
        if last_selection.0 != Some((anchor, focus)) {
            // Pre-seeded by a programmatic select; this dedup suppresses that echo.
            last_selection.0 = Some((anchor, focus));
            let direction = if anchor == focus {
                "none"
            } else if anchor < focus {
                "forward"
            } else {
                "backward"
            };
            events.send(
                entity,
                &SELECT,
                &SelectEvent {
                    selection_start: anchor.min(focus),
                    selection_end: anchor.max(focus),
                    selection_direction: direction.to_owned(),
                    composing: editable.is_composing(),
                },
            );
        }
    }
}

/// Send an input's `focus` event and set the node's [`FocusState`] so a
/// `focusStyle` is applied by the interaction restyle. `FocusGained`
/// bubbles, so this acts on the originally focused entity (`ev.entity`);
/// `FocusState` is general (a no-op for nodes without it).
pub fn on_focus_gained(
    ev: On<FocusGained>,
    events: ElementEvents,
    mut focus_states: Query<&mut FocusState>,
) {
    set_focus_state(&mut focus_states, ev.entity, true);
    events.send(ev.entity, &FOCUS, &());
}

/// See [`on_focus_gained`]; the blur counterpart.
pub fn on_focus_lost(
    ev: On<FocusLost>,
    events: ElementEvents,
    mut focus_states: Query<&mut FocusState>,
) {
    set_focus_state(&mut focus_states, ev.entity, false);
    events.send(ev.entity, &BLUR, &());
}

/// Set a node's [`FocusState`] (if it has one), nudging change detection only
/// when the value flips.
fn set_focus_state(focus_states: &mut Query<&mut FocusState>, entity: Entity, focused: bool) {
    if let Ok(mut state) = focus_states.get_mut(entity)
        && state.0 != focused
    {
        state.0 = focused;
    }
}

/// Apply the controlled selections [`EDITABLE_WRITER`] queued to the live
/// `EditableText`. Runs after Bevy's text-edit pass so offsets resolve
/// against the text applied this frame; pre-writes [`EditableSelection`] so
/// the `TextEditChange` this triggers doesn't echo back as a `select`.
pub fn apply_pending_selections(
    mut commands: Commands,
    mut editables: Query<(
        Entity,
        &mut EditableText,
        &PendingSelection,
        &mut EditableSelection,
    )>,
    mut font_cx: ResMut<FontCx>,
    mut layout_cx: ResMut<LayoutCx>,
) {
    for (entity, mut editable, pending, mut last) in &mut editables {
        let (start, end) = (pending.0, pending.1);
        last.0 = Some((start, end));
        editable
            .editor_mut()
            .driver(&mut font_cx.context, &mut layout_cx.0)
            .select_byte_range(start, end);
        commands.entity(entity).remove::<PendingSelection>();
    }
}

/// Keep each input's accessibility node's value in step with its text, so
/// screen readers announce the current content.
pub fn sync_editable_a11y(
    mut q: Query<(&EditableText, &mut AccessibilityNode), Changed<EditableText>>,
) {
    for (editable, mut node) in &mut q {
        node.set_value(editable.value().to_string());
    }
}
