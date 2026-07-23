//! The two sides of the per-frame Rust↔JS boundary:
//! - [`apply_js_ops`] drains reconciler op batches and mutates the UI tree.
//! - The `collect_*` systems report interactions back to the JS thread.
//!
//! File map: `apply` (the op-apply system + lifecycle/hierarchy arms),
//! `create`/`update` (the two big op arms), `stamps` (props → component
//! helpers shared by both), `stats` (instrumentation + the `SystemParam`
//! bundles), `events` (main-window click/scroll/canvas collectors + shared
//! utilities), `pointer` (drag/hover), `interaction` (the hover/press/focus
//! restyle), `editable` (`editableText` events + a11y), `surface_events`
//! (the `<surface>` mirror of the event path). Submodules are private;
//! everything is re-exported here, so `crate::reconcile::X` is the one path.

mod apply;
mod create;
mod editable;
mod events;
mod interaction;
mod pointer;
mod stamps;
mod stats;
mod surface_events;
mod update;

#[cfg(test)]
pub(crate) mod test_util;

pub use apply::apply_js_ops;
pub use editable::{
    apply_pending_selections, on_focus_gained, on_focus_lost, on_text_edit_change,
    sync_editable_a11y,
};
pub(crate) use events::climb;
pub use events::{collect_canvas_resize_events, collect_scroll_events, collect_ui_events};
pub use interaction::apply_interaction_styles;
pub use pointer::{collect_hover_events, collect_pointer_events};
#[cfg(not(target_arch = "wasm32"))]
pub(crate) use stats::mark_frame_start;
pub use stats::{FlushFlags, FlushStamps, FrameStamp, OpApplyStats, UiAssets};
pub use surface_events::{
    apply_surface_interaction_styles, collect_surface_clicks, collect_surface_hover_events,
    collect_surface_pointer_events,
};
pub(crate) use update::reapply_opacity_outputs;
