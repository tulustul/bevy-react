//! Batch render timings: per-applied-op-batch stats streamed to the panel,
//! with the command/layout legs split by markers bracketing `UiSystems::Layout`
//! (the same shape as the stress harness's `BenchTimers`).

use bevy::prelude::*;
use std::time::Duration;

use crate::event::ReactEvents;
use crate::react_event;
use crate::reconcile::OpApplyStats;

use super::DevtoolsState;

/// Bevy → JS: render timings for one applied op batch. **Event-driven** — sent
/// only on frames that applied a batch (while the panel is open), so an idle
/// app produces zero devtools traffic. The JS recorder attaches these to the
/// corresponding "ops" log entries. Timing legs are wall-clock ms; zero on web
/// (no `std::time::Instant` on wasm).
#[react_event(name = "devtools.batchStats")]
struct DevtoolsBatchStats {
    /// Op batches applied since startup (identifies the batch).
    applied_count: u64,
    /// Ops applied this frame (all queued flushes, coalesced).
    last_ops: usize,
    /// `op_flush` send → frame start: cross-frame queue wait (typically ~one
    /// vsync; structural, excluded from the panel's totals).
    frame_wait_ms: f64,
    /// Frame start (or send, if later) → apply start: in-frame schedules
    /// before the drain.
    pre_apply_ms: f64,
    /// Op → ECS-command translation (the `apply_js_ops` body).
    translate_ms: f64,
    /// Command execution (spawn/insert/hierarchy) + UI prepare/content.
    command_ms: f64,
    /// `UiSystems::Layout` + `PostLayout` (taffy + transform/clip propagation).
    layout_ms: f64,
}

/// Per-frame instants/durations splitting the post-translate cost into command
/// execution and layout, exactly like the stress harness's `BenchTimers`.
/// Updated only on frames a batch was applied.
#[derive(Resource, Default)]
pub(super) struct DevtoolsTimers {
    /// Stamped each frame just before `UiSystems::Layout` (native only).
    #[cfg(not(target_arch = "wasm32"))]
    pre_layout: Option<std::time::Instant>,
    /// `pre_layout - apply_end`: command execution + UI prepare/content for the
    /// most recent applied batch.
    last_command: Duration,
    /// `UiSystems::Layout` + `PostLayout` for the most recent applied batch.
    last_layout: Duration,
    /// The `applied_count` last recorded, to detect a fresh batch this frame.
    seen_applied: u64,
}

#[cfg_attr(target_arch = "wasm32", allow(unused_mut, unused_variables))]
pub(super) fn mark_pre_layout(mut timers: ResMut<DevtoolsTimers>) {
    #[cfg(not(target_arch = "wasm32"))]
    {
        timers.pre_layout = Some(std::time::Instant::now());
    }
}

pub(super) fn mark_post_layout(stats: Res<OpApplyStats>, mut timers: ResMut<DevtoolsTimers>) {
    // Only meaningful on frames that applied a batch (its commands flush + lay
    // out this same frame). Other frames leave the last values intact.
    if stats.applied_count == timers.seen_applied {
        return;
    }
    timers.seen_applied = stats.applied_count;
    #[cfg(not(target_arch = "wasm32"))]
    if let (Some(end), Some(pre)) = (stats.last_apply_end, timers.pre_layout) {
        let (command, layout) = split_legs(end, pre, std::time::Instant::now());
        timers.last_command = command;
        timers.last_layout = layout;
    }
}

/// Split "batch applied → layout done" into the command and layout legs.
/// Saturating: system-order jitter must clamp to zero, never panic.
#[cfg(not(target_arch = "wasm32"))]
fn split_legs(
    apply_end: std::time::Instant,
    pre_layout: std::time::Instant,
    post_layout: std::time::Instant,
) -> (Duration, Duration) {
    (
        pre_layout.saturating_duration_since(apply_end),
        post_layout.saturating_duration_since(pre_layout),
    )
}

/// Push one `devtools.batchStats` per applied APP op batch while the panel is
/// open. Runs after [`mark_post_layout`], so the command/layout legs for THIS
/// frame's batch are already split. Frames that applied nothing send nothing —
/// and neither do applies of the panel's OWN commits (`app_applied_count`
/// unchanged): stats for those would make the panel repaint, producing the
/// next batch, whose stats repaint it again… a self-observation loop at frame
/// rate. The per-batch origin flags ([`crate::reconcile::FlushFlags`]) are
/// what makes the distinction possible.
pub(super) fn emit_batch_stats(
    state: Res<DevtoolsState>,
    stats: Res<OpApplyStats>,
    timers: Res<DevtoolsTimers>,
    events: ReactEvents,
    mut seen: Local<u64>,
) {
    if stats.app_applied_count == *seen {
        return;
    }
    *seen = stats.app_applied_count;
    if !state.open {
        return;
    }
    events.send(&DevtoolsBatchStats {
        applied_count: stats.applied_count,
        last_ops: stats.last_ops,
        frame_wait_ms: stats.last_frame_wait.as_secs_f64() * 1000.0,
        pre_apply_ms: stats.last_pre_apply.as_secs_f64() * 1000.0,
        translate_ms: stats.last_translate.as_secs_f64() * 1000.0,
        command_ms: timers.last_command.as_secs_f64() * 1000.0,
        layout_ms: timers.last_layout.as_secs_f64() * 1000.0,
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::devtools::DevtoolsConfig;
    use crate::devtools::test_util::{drain_events, test_app};
    use crate::protocol::outbound::Outbound;
    use tokio::sync::mpsc::UnboundedReceiver;

    /// Batch stats key off `app_applied_count`: an apply of the panel's own
    /// commits (only `applied_count` bumped) emits nothing, so the panel can't
    /// re-trigger itself; an app apply emits one event.
    #[test]
    fn batch_stats_skip_devtools_only_applies() {
        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
        app.world_mut().resource_mut::<DevtoolsState>().open = true;
        let stats_events = |rx: &mut UnboundedReceiver<Outbound>| {
            drain_events(rx)
                .into_iter()
                .filter(|(name, _)| name == "devtools.batchStats")
                .count()
        };

        // A devtools-only apply: the panel's own repaint. No stats.
        {
            let mut stats = app.world_mut().resource_mut::<OpApplyStats>();
            stats.applied_count = 1;
            stats.app_applied_count = 0;
        }
        app.update();
        assert_eq!(
            stats_events(&mut rx),
            0,
            "the panel's own commits must not produce batch stats"
        );

        // An app apply: exactly one stats event, carrying both pre-apply legs.
        {
            let mut stats = app.world_mut().resource_mut::<OpApplyStats>();
            stats.applied_count = 2;
            stats.app_applied_count = 1;
        }
        app.update();
        let stats: Vec<_> = drain_events(&mut rx)
            .into_iter()
            .filter(|(name, _)| name == "devtools.batchStats")
            .collect();
        assert_eq!(stats.len(), 1, "an app apply reports once");
        assert!(
            stats[0].1.get("frame_wait_ms").is_some(),
            "batch stats carry the frame-wait leg"
        );
    }

    #[test]
    fn split_legs_computes_command_and_layout() {
        let t0 = std::time::Instant::now();
        let t1 = t0 + Duration::from_millis(5);
        let t2 = t1 + Duration::from_millis(7);
        assert_eq!(
            split_legs(t0, t1, t2),
            (Duration::from_millis(5), Duration::from_millis(7))
        );
        // Out-of-order instants (system jitter) clamp to zero, never panic.
        assert_eq!(split_legs(t1, t0, t2), (Duration::ZERO, t2 - t0));
    }
}
