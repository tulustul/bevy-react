//! Interaction writers: pointer capture and the cursor.

use bevy::picking::Pickable;
use bevy::ui::FocusPolicy;

use crate::cursor::NodeCursor;
use crate::style::props::*;
use crate::style::{Writer, owns};
use crate::ui_map::remove_unless_fresh;

/// `focusPolicy` → `FocusPolicy` (unset passes — an element that captures
/// the pointer by default, like `<button>`, says so in its default style),
/// mirrored into `Pickable` — bevy_ui's
/// picking backend ignores `FocusPolicy` and blocks by default when
/// `Pickable` is absent, and clicks (plus all `<surface>` interaction) ride
/// picking events. Both are always inserted, never removed: an absent
/// `FocusPolicy` makes `ui_focus_system` fall back to `Block` (silently
/// blocking every node), an absent `Pickable` blocks picking. A `<root>`
/// never blocks or hovers picking itself (its children are ordinary
/// pickable nodes).
pub static FOCUS_POLICY_WRITER: Writer = Writer {
    reads: &[&FOCUS_POLICY],
    attrs: &[],
    writes: &[owns::<FocusPolicy>, owns::<Pickable>],
    apply: |ctx, s, ec| {
        let policy = s.get(&FOCUS_POLICY).copied().unwrap_or(FocusPolicy::Pass);
        ec.insert(policy);
        ec.insert(focus_pickable(ctx.flags, policy));
    },
};

/// The `Pickable` mirror of `policy` on an element with `flags`.
pub(crate) fn focus_pickable(flags: crate::ext::ElementFlags, policy: FocusPolicy) -> Pickable {
    if flags.pick_ignore {
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
    attrs: &[],
    writes: &[owns::<NodeCursor>],
    apply: |ctx, s, ec| match s.get(&CURSOR) {
        Some(c) => {
            ec.insert(NodeCursor(c.clone()));
        }
        None => remove_unless_fresh::<NodeCursor>(ec, ctx.fresh),
    },
};
