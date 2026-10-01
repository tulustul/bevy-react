//! The two sides of the per-frame Rust↔JS boundary:
//! - [`apply_js_ops`] drains reconciler op batches and mutates the UI tree.
//! - The `collect_*` systems report interactions back to the JS thread.
//!
//! File map: `apply` (the op-apply system + lifecycle/hierarchy arms),
//! `create`/`update` (the two big op arms — one generic path each, driven by
//! the node's registered element, see [`crate::element`]), `stamps` (the
//! common prop stamps shared by both), `stats` (instrumentation + the
//! `SystemParam` bundles), `events` (main-window click/scroll collectors +
//! shared utilities), `pointer` (drag/hover), `interaction` (the
//! hover/press/focus restyle), `virtual_events` (the virtual-pointer mirror
//! of the event path — a `<surface>`'s in-world pointer). Submodules are
//! private; everything is re-exported here, so `crate::reconcile::X` is the
//! one path.

mod apply;
mod create;
mod events;
mod hover;
mod interaction;
mod pointer;
pub(crate) mod stamps;
mod stats;
mod update;
mod virtual_events;

#[cfg(test)]
mod svg_tests;
#[cfg(any(test, feature = "test_util"))]
pub(crate) mod test_util;

pub use apply::apply_js_ops;
pub(crate) use events::climb;
pub use events::{collect_scroll_events, collect_ui_events};
pub use hover::collect_hover_events;
pub use interaction::apply_interaction_styles;
pub(crate) use pointer::ActiveDrag;
pub use pointer::collect_pointer_events;
// Only tests construct drag sources from outside `reconcile` (seeding drags).
#[cfg(test)]
pub(crate) use pointer::DragSource;
#[cfg(not(target_arch = "wasm32"))]
pub(crate) use stats::mark_frame_start;
pub use stats::{FlushFlags, FlushStamps, FrameStamp, OpApplyStats};
pub(crate) use update::reapply_opacity_outputs;
pub use virtual_events::{
    apply_virtual_interaction_styles, collect_virtual_clicks, collect_virtual_hover_events,
    collect_virtual_pointer_events,
};
