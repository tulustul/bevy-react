//! Interaction writers: pointer capture and the cursor.

use bevy::picking::Pickable;
use bevy::ui::FocusPolicy;

use crate::cursor::NodeCursor;
use crate::style::props::*;
use crate::style::{Writer, owns};
use crate::ui_map::remove_unless_fresh;

/// The `focusPolicy` an unset style falls back to for `kind`: a `<button>`
/// captures the pointer (bevy_ui's native `Button` sets `Block`, so a button
/// doesn't leak its click to a sibling, an ancestor, or the 3D scene behind
/// it); everything else passes, so containers and labels stay click-through.
pub(crate) fn default_focus_policy(kind: &str) -> FocusPolicy {
    if kind == "button" {
        FocusPolicy::Block
    } else {
        FocusPolicy::Pass
    }
}

/// `focusPolicy` → `FocusPolicy`, mirrored into `Pickable` — bevy_ui's
/// picking backend ignores `FocusPolicy` and blocks by default when
/// `Pickable` is absent, and clicks (plus all `<surface>` interaction) ride
/// picking events. Both are always inserted, never removed: an absent
/// `FocusPolicy` makes `ui_focus_system` fall back to `Block` (silently
/// blocking every node), an absent `Pickable` blocks picking. A `<root>`
/// never blocks or hovers picking itself (its children are ordinary
/// pickable nodes).
pub static FOCUS_POLICY_WRITER: Writer = Writer {
    reads: &[&FOCUS_POLICY],
    writes: &[owns::<FocusPolicy>, owns::<Pickable>],
    apply: |ctx, s, ec| {
        let policy = s
            .get(&FOCUS_POLICY)
            .copied()
            .unwrap_or_else(|| default_focus_policy(ctx.kind));
        ec.insert(policy);
        ec.insert(focus_pickable(ctx.kind, policy));
    },
};

/// The `Pickable` mirror of `policy` on a `kind` element.
pub(crate) fn focus_pickable(kind: &str, policy: FocusPolicy) -> Pickable {
    if kind == "root" {
        Pickable::IGNORE
    } else {
        Pickable {
            should_block_lower: policy == FocusPolicy::Block,
            is_hoverable: true,
        }
    }
}

/// `cursor` → `NodeCursor`, which `drive_cursor_icon` writes onto the
/// window's `CursorIcon` on hover.
pub static CURSOR_WRITER: Writer = Writer {
    reads: &[&CURSOR],
    writes: &[owns::<NodeCursor>],
    apply: |ctx, s, ec| match s.get(&CURSOR) {
        Some(c) => {
            ec.insert(NodeCursor(c.clone()));
        }
        None => remove_unless_fresh::<NodeCursor>(ec, ctx.fresh),
    },
};
