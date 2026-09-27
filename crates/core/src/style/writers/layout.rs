//! Layout writers: `Node`, stacking, rounding, the scrollbar shell.

use bevy::prelude::*;
use bevy::ui::LayoutConfig;

use crate::scrollbar::ScrollbarConfig;
use crate::style::Style;
use crate::style::props::*;
use crate::style::{Writer, WriterCtx, owns};
use crate::ui_map::{node_from, remove_unless_fresh, set_if_neq_or_insert, set_node_if_changed};

/// `Node` from every layout property. A guarded in-place update, not a
/// re-insert: re-inserting `Node` marks it changed and relays out the
/// subtree even for a paint-only restyle; this relays out only when the
/// layout actually changed.
pub static LAYOUT_WRITER: Writer = Writer {
    reads: &[
        &DISPLAY,
        &BOX_SIZING,
        &POSITION_TYPE,
        &OVERFLOW_X,
        &OVERFLOW_Y,
        &SCROLLBAR_WIDTH,
        &SCROLLBAR,
        &LEFT,
        &RIGHT,
        &TOP,
        &BOTTOM,
        &WIDTH,
        &HEIGHT,
        &MIN_WIDTH,
        &MIN_HEIGHT,
        &MAX_WIDTH,
        &MAX_HEIGHT,
        &ASPECT_RATIO,
        &ALIGN_ITEMS,
        &JUSTIFY_ITEMS,
        &ALIGN_SELF,
        &JUSTIFY_SELF,
        &ALIGN_CONTENT,
        &JUSTIFY_CONTENT,
        &MARGIN,
        &PADDING,
        &BORDER,
        &FLEX_DIRECTION,
        &FLEX_WRAP,
        &FLEX_GROW,
        &FLEX_SHRINK,
        &FLEX_BASIS,
        &GAP,
        &ROW_GAP,
        &COLUMN_GAP,
        &GRID_AUTO_FLOW,
        &GRID_TEMPLATE_ROWS,
        &GRID_TEMPLATE_COLUMNS,
        &GRID_AUTO_ROWS,
        &GRID_AUTO_COLUMNS,
        &GRID_ROW,
        &GRID_COLUMN,
        &BORDER_RADIUS,
    ],
    writes: &[owns::<Node>],
    apply: apply_layout,
};

fn apply_layout(_ctx: &WriterCtx, s: &Style, ec: &mut EntityCommands) {
    ec.queue(set_node_if_changed(node_from(Some(s))));
}

/// `ZIndex` — `Node`-required: never removed; absent writes the default.
pub static Z_INDEX_WRITER: Writer = Writer {
    reads: &[&Z_INDEX],
    writes: &[owns::<ZIndex>],
    apply: |_, s, ec| {
        ec.queue(set_if_neq_or_insert(ZIndex(
            s.get(&Z_INDEX).copied().unwrap_or_default(),
        )));
    },
};

/// `GlobalZIndex`.
pub static GLOBAL_Z_INDEX_WRITER: Writer = Writer {
    reads: &[&GLOBAL_Z_INDEX],
    writes: &[owns::<GlobalZIndex>],
    apply: |ctx, s, ec| match s.get(&GLOBAL_Z_INDEX).copied() {
        Some(z) => {
            ec.insert(GlobalZIndex(z));
        }
        None => remove_unless_fresh::<GlobalZIndex>(ec, ctx.fresh),
    },
};

/// `layoutRounding` → bevy's per-subtree `LayoutConfig`. An explicit value
/// (either way) is an override; absent removes it so the node inherits the
/// nearest ancestor's setting. A component write only — no relayout.
pub static LAYOUT_ROUNDING_WRITER: Writer = Writer {
    reads: &[&LAYOUT_ROUNDING],
    writes: &[owns::<LayoutConfig>],
    apply: |ctx, s, ec| match s.get(&LAYOUT_ROUNDING).copied() {
        Some(use_rounding) => {
            ec.insert(LayoutConfig { use_rounding });
        }
        None => remove_unless_fresh::<LayoutConfig>(ec, ctx.fresh),
    },
};

/// A visible `scrollbar` stamps `ScrollbarConfig`; the shell
/// (`crate::scrollbar`) spawns Bevy's scrollbar widget over the container
/// from it. `"none"`/absent clears it (and the shell despawns any bars).
pub static SCROLLBAR_WRITER: Writer = Writer {
    reads: &[&SCROLLBAR],
    writes: &[owns::<ScrollbarConfig>],
    apply: |ctx, s, ec| match s.get(&SCROLLBAR) {
        Some(spec) if spec.is_visible() => {
            ec.insert(ScrollbarConfig(spec.clone()));
        }
        _ => remove_unless_fresh::<ScrollbarConfig>(ec, ctx.fresh),
    },
};
