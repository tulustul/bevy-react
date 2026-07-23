//! `editableText` event reporting and state sync: `"change"`/`"select"` from
//! Bevy's text-edit pass, `"focus"`/`"blur"` from the focus observers,
//! controlled-selection application, and the accessibility value mirror.
//! (Behavior coverage lives in the `roundtrip` integration test.)

use bevy::a11y::AccessibilityNode;
use bevy::input_focus::{FocusGained, FocusLost};
use bevy::prelude::*;
use bevy::text::{EditableText, FontCx, LayoutCx, TextEditChange};

use crate::bridge::{FocusState, JsBridge, RNode};
use crate::protocol::{NodeId, Outbound, UiEvent};

/// Report `editableText` edits back to JS. Bevy triggers [`TextEditChange`] after
/// applying edits — but also on cursor/selection moves — so this single observer
/// emits a `"change"` (deduped against the last value) when the text changed, and
/// a `"select"` (deduped against the last selection, and only for nodes with an
/// `onSelect` handler, since caret moves are frequent) when the selection moved.
/// Each is routed by node id + kind in the JS event-loop router.
pub fn on_text_edit_change(
    change: On<TextEditChange>,
    mut bridge: ResMut<JsBridge>,
    editables: Query<(&EditableText, &RNode)>,
) {
    let Ok((editable, rnode)) = editables.get(change.event_target()) else {
        return;
    };
    let id = rnode.0;
    let composing = editable.is_composing();

    let value = editable.value().to_string();
    if bridge.editable_values.get(&id) != Some(&value) {
        bridge.editable_values.insert(id, value.clone());
        debug!("change -> reconciler node {id}");
        let _ = bridge.outbound_tx.send(Outbound::UiEvent {
            event: UiEvent {
                id,
                kind: "change".to_string(),
                value: Some(value),
                composing: Some(composing),
                ..default()
            },
        });
    }

    if bridge.editable_select_handlers.contains(&id) {
        let sel = editable.editor().raw_selection();
        let anchor = sel.anchor().index();
        let focus = sel.focus().index();
        if bridge.editable_selections.get(&id) != Some(&(anchor, focus)) {
            // Pre-seeded by a programmatic select; this dedup suppresses that echo.
            bridge.editable_selections.insert(id, (anchor, focus));
            let direction = if anchor == focus {
                "none"
            } else if anchor < focus {
                "forward"
            } else {
                "backward"
            };
            let _ = bridge.outbound_tx.send(Outbound::UiEvent {
                event: UiEvent {
                    id,
                    kind: "select".to_string(),
                    selection_start: Some(anchor.min(focus)),
                    selection_end: Some(anchor.max(focus)),
                    selection_direction: Some(direction.to_string()),
                    composing: Some(composing),
                    ..default()
                },
            });
        }
    }
}

/// Emit an `editableText`'s `"focus"` / `"blur"` events, and toggle the node's
/// [`FocusState`] so a `focusStyle` is (un)applied by
/// [`apply_interaction_styles`](crate::reconcile::apply_interaction_styles).
/// `FocusGained`/`FocusLost` are `auto_propagate` (they bubble to parents), so we
/// act on the originally focused entity (`ev.entity`). Event emission is gated to
/// editables with an `onFocus`/`onBlur` handler; `FocusState` is general (no-op for
/// nodes without it).
pub fn on_focus_gained(
    ev: On<FocusGained>,
    bridge: ResMut<JsBridge>,
    editables: Query<&RNode, With<EditableText>>,
    mut focus_states: Query<&mut FocusState>,
) {
    set_focus_state(&mut focus_states, ev.entity, true);
    emit_focus_event(&bridge, &editables, ev.entity, "focus");
}

/// See [`on_focus_gained`]; the blur counterpart.
pub fn on_focus_lost(
    ev: On<FocusLost>,
    bridge: ResMut<JsBridge>,
    editables: Query<&RNode, With<EditableText>>,
    mut focus_states: Query<&mut FocusState>,
) {
    set_focus_state(&mut focus_states, ev.entity, false);
    emit_focus_event(&bridge, &editables, ev.entity, "blur");
}

/// Set a node's [`FocusState`] (if it has one), nudging change-detection only when
/// the value actually flips so `apply_interaction_styles` re-merges just on change.
fn set_focus_state(focus_states: &mut Query<&mut FocusState>, entity: Entity, focused: bool) {
    if let Ok(mut state) = focus_states.get_mut(entity)
        && state.0 != focused
    {
        state.0 = focused;
    }
}

fn emit_focus_event(
    bridge: &JsBridge,
    editables: &Query<&RNode, With<EditableText>>,
    entity: Entity,
    kind: &str,
) {
    let Ok(rnode) = editables.get(entity) else {
        return;
    };
    if !bridge.editable_focus_handlers.contains(&rnode.0) {
        return;
    }
    let _ = bridge.outbound_tx.send(Outbound::UiEvent {
        event: UiEvent {
            id: rnode.0,
            kind: kind.to_string(),
            ..default()
        },
    });
}

/// Apply controlled selections queued by
/// [`queue_pending_selection`](super::stamps::queue_pending_selection) to the live
/// `EditableText`. Runs after Bevy's text-edit pass so offsets resolve against the
/// text applied this frame. Pre-writes the last-emitted selection so the
/// `TextEditChange` this triggers doesn't echo back to JS as a `"select"`.
pub fn apply_pending_selections(
    mut bridge: ResMut<JsBridge>,
    mut editables: Query<&mut EditableText>,
    mut font_cx: ResMut<FontCx>,
    mut layout_cx: ResMut<LayoutCx>,
) {
    if bridge.editable_pending_selection.is_empty() {
        return;
    }
    let pending: Vec<(NodeId, (usize, usize))> =
        bridge.editable_pending_selection.drain().collect();
    for (id, (start, end)) in pending {
        let Some(&entity) = bridge.nodes.get(&id) else {
            continue;
        };
        let Ok(mut editable) = editables.get_mut(entity) else {
            continue;
        };
        // Suppress the echoed `"select"` (anchor=start, focus=end after the write).
        bridge.editable_selections.insert(id, (start, end));
        editable
            .editor_mut()
            .driver(&mut font_cx.context, &mut layout_cx.0)
            .select_byte_range(start, end);
    }
}

/// Keep each `editableText`'s accessibility node's value in step with its text, so
/// screen readers announce the current content. Label/role are set on spawn (and
/// the label refreshed on update) in
/// [`apply_js_ops`](crate::reconcile::apply_js_ops).
pub fn sync_editable_a11y(
    mut q: Query<(&EditableText, &mut AccessibilityNode), Changed<EditableText>>,
) {
    for (editable, mut node) in &mut q {
        node.set_value(editable.value().to_string());
    }
}
