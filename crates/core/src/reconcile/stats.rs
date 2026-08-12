//! Live instrumentation of the op-apply hot path, the per-batch side
//! channels feeding it, and the `SystemParam` bundles that keep
//! [`apply_js_ops`](crate::reconcile::apply_js_ops) under Bevy's per-system
//! parameter limit.

use bevy::ecs::system::SystemParam;
use bevy::prelude::*;

use crate::ui_map::AtlasLayoutCache;

/// Live instrumentation of the [`apply_js_ops`](crate::reconcile::apply_js_ops)
/// hot path. Updated once per frame
/// that applies at least one reconciler op (empty frames leave it untouched), so
/// a benchmark driver — or any consumer — can poll `applied_count` to detect
/// "my flushed batch has landed" and read the timing of the most recent batch.
///
/// Note `last_translate` measures only the op→command *queuing* in
/// [`apply_js_ops`](crate::reconcile::apply_js_ops); the queued `Commands`
/// (entity spawn / component insert /
/// hierarchy) execute later at a sync point, and `bevy_ui` layout later still —
/// neither is included here. `last_apply_end` is exposed so a downstream timer
/// can bracket those phases (e.g. up to `UiSystems::Layout`).
///
/// Timings are wall-clock, measured on native only; on web they stay zero/`None`
/// (`std::time::Instant` is unavailable on wasm).
#[derive(Resource, Default, Debug, Clone, Copy)]
pub struct OpApplyStats {
    /// Count of non-empty op batches applied since startup (one increment per
    /// frame that applied at least one op).
    pub applied_count: u64,
    /// Count of [`Op::Reset`](crate::protocol::op::Op::Reset)s applied (a cold
    /// hot-reload tears the tree down).
    /// Devtools uses it to clear its warning-dedup state, so a reloaded app's
    /// re-decoded invalid values flag again (the JS mirror was also reset).
    pub reset_count: u64,
    /// Like `applied_count`, but only counting applies that included at least
    /// one APP flush (per-batch origin flags — see [`FlushFlags`]). The
    /// devtools panel's own repaints bump only `applied_count`; batch-stats
    /// emission keys off this so the panel never reports (and re-triggers
    /// itself with) its own commits. With no flags channel wired (headless
    /// tests), every apply counts as app.
    pub app_applied_count: u64,
    /// Number of ops in the most recently applied batch.
    pub last_ops: usize,
    /// How long the most recently applied ops idled in the channel across the
    /// frame boundary: the OLDEST coalesced batch's [`FlushStamps`] stamp →
    /// this frame's [`FrameStamp`]. Structural queue wait, typically ~one
    /// vsync period (a Bevy-triggered commit always lands just after that
    /// frame's drain); can exceed one frame when batches coalesce. Zero when
    /// the stamp channel or frame stamp is missing (headless tests) and on web.
    pub last_frame_wait: std::time::Duration,
    /// The in-frame leg of the same span: max(batch stamp, frame start) →
    /// the start of [`apply_js_ops`](crate::reconcile::apply_js_ops) — time
    /// eaten by schedules/systems that
    /// ran before the drain this frame. With no [`FrameStamp`] present the
    /// whole send→apply span lands here. Zero when no stamp channel is wired
    /// (headless tests) and on web.
    pub last_pre_apply: std::time::Duration,
    /// Time spent translating the most recent batch into ECS commands — the
    /// [`apply_js_ops`](crate::reconcile::apply_js_ops) body only. Excludes
    /// command execution and layout.
    pub last_translate: std::time::Duration,
    /// The instant [`apply_js_ops`](crate::reconcile::apply_js_ops) finished
    /// queuing the most recent batch
    /// (native only). A later system can subtract this from a post-layout instant
    /// to time command execution + layout.
    pub last_apply_end: Option<std::time::Instant>,
}

/// Receiver of per-batch send instants, stamped by the JS host's `op_flush`
/// right before each batch enters the ops channel (see `js_thread.rs`). Both
/// FIFOs are aligned (stamp sent first), so draining one stamp per received
/// batch keeps them in lockstep. Feeds [`OpApplyStats::last_frame_wait`] and
/// [`OpApplyStats::last_pre_apply`].
#[derive(Resource)]
pub struct FlushStamps(pub(crate) crossbeam_channel::Receiver<std::time::Instant>);

/// The instant Bevy's `First` schedule ran this frame (native only; stays
/// `None` on web and in headless tests that never add [`mark_frame_start`]).
/// The frame boundary that splits [`OpApplyStats::last_frame_wait`] from
/// `last_pre_apply`.
#[derive(Resource, Default, Debug, Clone, Copy)]
pub struct FrameStamp(pub Option<std::time::Instant>);

/// Stamp the frame's start. Registered in `First` (native only).
#[cfg(not(target_arch = "wasm32"))]
pub(crate) fn mark_frame_start(mut stamp: ResMut<FrameStamp>) {
    stamp.0 = Some(std::time::Instant::now());
}

/// Receiver of per-batch devtools-origin flags (`true` = the devtools panel's
/// own React container flushed the batch), sent by the JS host's `op_flush`
/// with the same aligned-FIFO discipline as [`FlushStamps`]. Feeds
/// [`OpApplyStats::app_applied_count`].
#[derive(Resource)]
pub struct FlushFlags(pub(crate) crossbeam_channel::Receiver<bool>);

/// The per-batch side channels (`Option`: absent in headless unit tests),
/// bundled as one `SystemParam` so
/// [`apply_js_ops`](crate::reconcile::apply_js_ops) stays within Bevy's
/// 16-parameter limit.
#[derive(SystemParam)]
pub struct FlushMeta<'w> {
    #[cfg_attr(target_arch = "wasm32", allow(dead_code))]
    pub(super) stamps: Option<Res<'w, FlushStamps>>,
    pub(super) flags: Option<Res<'w, FlushFlags>>,
    #[cfg_attr(target_arch = "wasm32", allow(dead_code))]
    pub(super) frame: Option<Res<'w, FrameStamp>>,
}

/// The asset stores + caches the op-apply path builds components from: the
/// `<image atlas>` `TextureAtlasLayout`s. Bundled as one `SystemParam`
/// so [`apply_js_ops`](crate::reconcile::apply_js_ops) stays under Bevy's
/// per-system parameter limit.
#[derive(SystemParam)]
pub struct UiAssets<'w> {
    pub(super) layouts: ResMut<'w, Assets<TextureAtlasLayout>>,
    pub(super) atlas_cache: ResMut<'w, AtlasLayoutCache>,
}

/// Split "op_flush send → apply start" into the cross-frame queue wait and the
/// in-frame leg at the frame-start boundary. Saturating: a stamp landing
/// mid-frame (after frame start, e.g. a JS-timer commit) clamps the wait to
/// zero; jitter never panics. A `None` frame start puts the whole span in the
/// in-frame leg.
#[cfg(not(target_arch = "wasm32"))]
pub(super) fn split_pre_apply(
    stamp: std::time::Instant,
    frame_start: Option<std::time::Instant>,
    apply_start: std::time::Instant,
) -> (std::time::Duration, std::time::Duration) {
    let boundary = frame_start.map_or(stamp, |fs| fs.max(stamp));
    (
        boundary.saturating_duration_since(stamp),
        apply_start.saturating_duration_since(boundary),
    )
}

#[cfg(test)]
mod tests {
    use super::super::test_util::op_app;
    use super::*;
    use crate::protocol::{NodeId, op::Op};

    /// The per-batch origin flags attribute applies: a devtools-flagged batch
    /// bumps `applied_count` but not `app_applied_count`, so devtools batch
    /// stats (keyed off the app counter) skip the panel's own repaints —
    /// otherwise stats → panel repaint → new batch → stats… self-observes at
    /// frame rate.
    #[test]
    fn devtools_flagged_batches_skip_app_applied_count() {
        let (mut app, ops_tx) = op_app();
        let (flags_tx, flags_rx) = crossbeam_channel::unbounded::<bool>();
        app.insert_resource(FlushFlags(flags_rx));
        let create = |id: NodeId| Op::Create {
            id,
            kind: "node".into(),
            props: Box::default(),
            text: None,
        };

        // A devtools-flagged batch (the panel's own commit): applied, but not
        // an APP apply.
        flags_tx.send(true).unwrap();
        ops_tx.send(vec![create(1)]).unwrap();
        app.update();
        let stats = *app.world().resource::<OpApplyStats>();
        assert_eq!((stats.applied_count, stats.app_applied_count), (1, 0));

        // An app batch bumps both — even when a devtools batch coalesces into
        // the same apply.
        flags_tx.send(false).unwrap();
        ops_tx.send(vec![create(2)]).unwrap();
        flags_tx.send(true).unwrap();
        ops_tx.send(vec![create(3)]).unwrap();
        app.update();
        let stats = *app.world().resource::<OpApplyStats>();
        assert_eq!((stats.applied_count, stats.app_applied_count), (2, 1));
    }

    #[test]
    fn split_pre_apply_splits_wait_and_in_frame() {
        use std::time::Duration;
        let t0 = std::time::Instant::now();
        let t1 = t0 + Duration::from_millis(12);
        let t2 = t1 + Duration::from_millis(3);
        assert_eq!(
            split_pre_apply(t0, Some(t1), t2),
            (Duration::from_millis(12), Duration::from_millis(3))
        );
        // A stamp landing mid-frame (after frame start, e.g. a JS-timer
        // commit) clamps the wait to zero — the whole span is in-frame.
        assert_eq!(split_pre_apply(t1, Some(t0), t2), (Duration::ZERO, t2 - t1));
        // No frame stamp (headless): the whole span is the in-frame leg.
        assert_eq!(split_pre_apply(t0, None, t2), (Duration::ZERO, t2 - t0));
    }

    /// The send→apply span splits at the frame boundary: the cross-frame queue
    /// wait lands in `last_frame_wait`, the in-frame remainder in
    /// `last_pre_apply`.
    #[test]
    fn flush_stamp_splits_frame_wait_from_pre_apply() {
        use std::time::{Duration, Instant};
        let (mut app, ops_tx) = op_app();
        let (stamps_tx, stamps_rx) = crossbeam_channel::unbounded::<Instant>();
        app.insert_resource(FlushStamps(stamps_rx));
        // Both boundaries in the past so ordering is stamp < frame start <
        // apply start (a future-dated frame stamp would saturate the in-frame
        // leg to zero instead).
        let now = Instant::now();
        let stamp = now - Duration::from_millis(30);
        let frame_start = now - Duration::from_millis(10);
        app.insert_resource(FrameStamp(Some(frame_start)));

        stamps_tx.send(stamp).unwrap();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: Box::default(),
                text: None,
            }])
            .unwrap();
        app.update();

        let stats = *app.world().resource::<OpApplyStats>();
        // Both endpoints are fixed instants, so the wait is exact.
        assert_eq!(stats.last_frame_wait, Duration::from_millis(20));
        // The in-frame leg runs to the real apply start — at least the fixed
        // 10ms between the frame stamp and `now`.
        assert!(stats.last_pre_apply >= Duration::from_millis(10));
    }
}
