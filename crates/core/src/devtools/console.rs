//! The two diag streams: the Console tab (the [`crate::console_log`] ring)
//! and runtime invalid-value warnings (the [`crate::diag`] sink).

use bevy::platform::collections::HashSet;
use bevy::prelude::*;

use crate::event::ReactEvents;
use crate::protocol::NodeId;
use crate::reconcile::OpApplyStats;
use crate::{react_event, react_message};

use super::DevtoolsState;

/// Bevy → JS: an invalid style/prop value fell back to a default at apply time
/// (an unrecognized color, an unknown fontFamily/cursor, a bad text metric) —
/// see [`crate::diag`]'s runtime sink. The panel's mirror matches `value`
/// against the node's retained wire values to flag the offending inspector
/// row. **Not** gated on the panel being open: warnings accumulate on the
/// mirror so opening the panel later still shows them. (Decode-time warnings
/// take the synchronous `op_take_decode_warnings` path instead — no event.)
#[react_event(name = "devtools.warning")]
struct DevtoolsWarning {
    /// The affected node, when the parse site ran under a node scope.
    id: Option<NodeId>,
    /// The value's domain (`"color"`, `"fontFamily"`, `"cursor"`, …).
    kind: String,
    /// The raw offending wire value.
    value: String,
    /// The human-readable log message (shown under the flagged row).
    message: String,
}

/// Bevy → JS: console entries from the [`crate::console_log`] ring — JS
/// `console.*` output, [`crate::diag`] messages, and JS-runtime failures.
/// Streamed by [`emit_console`] only while the panel is open on the Console
/// tab: the full ring backlog on tab open, then only-new entries per frame.
/// Native-only content (the web host has no console shim — the ring is
/// stubbed on wasm).
#[react_event(name = "devtools.console")]
struct DevtoolsConsole {
    entries: Vec<DevtoolsConsoleEntry>,
}

/// One console row (oldest → newest within a batch).
#[derive(serde::Serialize, ts_rs::TS, Debug, Clone, PartialEq)]
struct DevtoolsConsoleEntry {
    /// Process-monotonic id (never reused, survives clears).
    seq: u64,
    /// Wall-clock epoch milliseconds.
    time_ms: u64,
    /// `"js"` | `"rust"`.
    source: String,
    /// `"debug"` | `"info"` | `"warn"` | `"error"`.
    level: String,
    message: String,
}

/// JS → Bevy: the panel's Console tab was shown/hidden (mount/unmount of the
/// Console panel). Gates [`emit_console`].
#[react_message(name = "devtools.consoleOpen")]
pub(super) struct DevtoolsConsoleOpenMessage {
    pub(super) on: bool,
}

/// JS → Bevy: the Console tab's clear button — empty the console ring. The
/// panel clears its local list immediately; entries logged between the click
/// and this message arriving may show once in the panel yet miss a later
/// backlog (browser-console parity — seq monotonicity keeps the stream
/// watermark consistent either way).
#[react_message(name = "devtools.consoleClear")]
pub(super) struct DevtoolsConsoleClearMessage {}

pub(super) fn on_console_open_message(
    msg: On<DevtoolsConsoleOpenMessage>,
    mut state: ResMut<DevtoolsState>,
) {
    state.console_tab_open = msg.event().on;
    // Reset the watermark on EVERY flip: a fresh open always gets the full
    // backlog, even when the close and reopen land in the same frame.
    state.console_last_seq = None;
}

pub(super) fn on_console_clear_message(_msg: On<DevtoolsConsoleClearMessage>) {
    crate::console_log::clear();
}

/// Stream the [`crate::console_log`] ring to the panel while it is open on
/// the Console tab: the full backlog right after the tab opens (watermark
/// `None`, reset by [`on_console_open_message`]), then only entries newer
/// than the watermark. Listener race is safe by construction — the gate flag
/// only flips via a JS message the panel sends *after* subscribing. No
/// self-observation loop: an emit re-renders the panel, but rendering logs
/// nothing.
pub(super) fn emit_console(mut state: ResMut<DevtoolsState>, events: ReactEvents) {
    if !(state.open && state.console_tab_open) {
        return;
    }
    let (entries, watermark) = crate::console_log::since(state.console_last_seq.unwrap_or(0));
    state.console_last_seq = Some(watermark);
    if entries.is_empty() {
        return;
    }
    events.send(&DevtoolsConsole {
        entries: entries
            .into_iter()
            .map(|e| DevtoolsConsoleEntry {
                seq: e.seq,
                time_ms: e.time_ms,
                source: e.source.as_str().into(),
                level: e.level.as_str().into(),
                message: e.message,
            })
            .collect(),
    });
}

/// Drain the [`crate::diag`] runtime sink and ship each **new** warning to JS
/// as a `devtools.warning` event. Deduped by a hash of the whole entry so the
/// hover/press restyle paths (which re-parse the same bad value on every flip)
/// can't spam; the set resets on [`OpApplyStats::reset_count`] (hot reload) so
/// a reloaded app's warnings flag again — the JS mirror was reset too. NOT
/// gated on the panel being open (always-on-in-dev: the mirror stores the
/// flags for whenever the panel opens); the `applied_count` gate only holds
/// entries back until the React app has mounted its listeners (same
/// listener-race guard as [`super::settings::send_restore`] — entries stay
/// queued, not lost).
pub(super) fn emit_runtime_warnings(
    stats: Res<OpApplyStats>,
    events: ReactEvents,
    mut seen: Local<HashSet<u64>>,
    mut last_reset: Local<u64>,
) {
    if stats.reset_count != *last_reset {
        *last_reset = stats.reset_count;
        seen.clear();
    }
    if stats.applied_count == 0 {
        return;
    }
    for w in crate::diag::take_runtime_warnings() {
        let mut hasher = std::hash::DefaultHasher::new();
        std::hash::Hash::hash(&(w.node, w.kind, &w.value, &w.message), &mut hasher);
        if seen.insert(std::hash::Hasher::finish(&hasher)) {
            events.send(&DevtoolsWarning {
                id: w.node,
                kind: w.kind.to_string(),
                value: w.value,
                message: w.message,
            });
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::devtools::DevtoolsConfig;
    use crate::devtools::test_util::{drain_events, test_app};
    use crate::protocol::outbound::Outbound;
    use tokio::sync::mpsc::UnboundedReceiver;

    /// Runtime invalid-value warnings ship once per distinct entry as
    /// `devtools.warning` (hover restyles re-report the same bad value on
    /// every flip — the dedup set must swallow those), and re-ship after a
    /// hot reload (`reset_count` bump), matching the JS mirror's reset.
    /// Global-sink caveats: hold the diag test lock, and filter both drained
    /// warnings and emitted events by our own node id.
    #[cfg(debug_assertions)]
    #[test]
    fn runtime_warnings_emit_once_and_reset_on_reload() {
        // NOTE: the diag test lock is already held by `test_app`'s app —
        // taking it here too would deadlock.
        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
        let _ = crate::diag::take_runtime_warnings();
        // The listener-race gate holds warnings until the app has mounted.
        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;

        let report = || {
            let _scope = crate::diag::node_scope(31337);
            crate::diag::report("color", "redd", "unrecognized color \"redd\"");
        };
        let mine = |events: &[(String, serde_json::Value)]| {
            events
                .iter()
                .filter(|(name, v)| name == "devtools.warning" && v["id"] == 31337)
                .count()
        };

        report();
        app.update();
        let events = drain_events(&mut rx);
        assert_eq!(
            mine(&events),
            1,
            "first report ships (panel closed is fine)"
        );
        assert!(
            events.iter().any(|(name, v)| name == "devtools.warning"
                && v["kind"] == "color"
                && v["value"] == "redd"
                && v["message"].as_str().is_some_and(|m| m.contains("redd"))),
            "the event carries kind/value/message"
        );

        report();
        app.update();
        assert_eq!(
            mine(&drain_events(&mut rx)),
            0,
            "an identical re-report is deduped"
        );

        app.world_mut().resource_mut::<OpApplyStats>().reset_count += 1;
        report();
        app.update();
        assert_eq!(
            mine(&drain_events(&mut rx)),
            1,
            "a hot reload clears the dedup set so warnings re-flag"
        );
    }

    /// The console stream: silent while closed; full backlog on tab open;
    /// increments only afterwards; backlog resent after an off→on flip (the
    /// handler resets the watermark). Global-ring discipline: `test_app`
    /// holds the diag test lock; assertions filter by unique markers and
    /// never assume the ring holds ONLY our entries.
    #[test]
    fn console_stream_backlog_then_increment() {
        use crate::console_log::{Level, Source};

        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
        let mine = |v: &serde_json::Value| -> Vec<String> {
            v["entries"]
                .as_array()
                .unwrap()
                .iter()
                .filter_map(|e| e["message"].as_str())
                .filter(|m| m.contains("cons-t1-"))
                .map(String::from)
                .collect()
        };
        let payloads = |rx: &mut UnboundedReceiver<Outbound>| {
            drain_events(rx)
                .into_iter()
                .filter(|(name, _)| name == "devtools.console")
                .map(|(_, v)| v)
                .collect::<Vec<_>>()
        };

        crate::console_log::push(Source::Rust, Level::Warn, "cons-t1-a");
        crate::console_log::push(Source::Js, Level::Error, "cons-t1-b");
        app.update();
        assert!(
            payloads(&mut rx).iter().all(|v| mine(v).is_empty()),
            "closed panel: no console stream"
        );

        app.world_mut().resource_mut::<DevtoolsState>().open = true;
        app.world_mut()
            .trigger(DevtoolsConsoleOpenMessage { on: true });
        app.update();
        let sent = payloads(&mut rx);
        let marked: Vec<String> = sent.iter().flat_map(&mine).collect();
        assert_eq!(
            marked,
            vec!["cons-t1-a".to_string(), "cons-t1-b".to_string()],
            "tab open sends the backlog, oldest first"
        );
        // Field shape spot-check on our own entry.
        let entry = sent
            .iter()
            .flat_map(|v| v["entries"].as_array().unwrap().clone())
            .find(|e| e["message"] == "cons-t1-b")
            .unwrap();
        assert_eq!(entry["source"], "js");
        assert_eq!(entry["level"], "error");
        assert!(entry["seq"].as_u64().is_some());
        assert!(entry["time_ms"].as_u64().is_some());

        crate::console_log::push(Source::Js, Level::Info, "cons-t1-c");
        app.update();
        let marked: Vec<String> = payloads(&mut rx).iter().flat_map(&mine).collect();
        assert_eq!(
            marked,
            vec!["cons-t1-c".to_string()],
            "later frames send only new entries"
        );

        // Off → on: the handler resets the watermark, so the full backlog
        // (all three markers) is resent.
        app.world_mut()
            .trigger(DevtoolsConsoleOpenMessage { on: false });
        app.update();
        assert!(payloads(&mut rx).iter().all(|v| mine(v).is_empty()));
        app.world_mut()
            .trigger(DevtoolsConsoleOpenMessage { on: true });
        app.update();
        let marked: Vec<String> = payloads(&mut rx).iter().flat_map(mine).collect();
        assert_eq!(
            marked,
            vec![
                "cons-t1-a".to_string(),
                "cons-t1-b".to_string(),
                "cons-t1-c".to_string()
            ],
            "a re-shown tab gets the full backlog again"
        );
    }

    /// `devtools.consoleClear` empties the ring (seq keeps counting).
    #[test]
    fn console_clear_message_empties_ring() {
        use crate::console_log::{Level, Source};

        let (mut app, _rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
        crate::console_log::push(Source::Js, Level::Info, "cons-t2-before");
        let (_, watermark_before) = crate::console_log::since(0);
        app.world_mut().trigger(DevtoolsConsoleClearMessage {});
        let (entries, _) = crate::console_log::since(0);
        assert!(
            entries.iter().all(|e| !e.message.contains("cons-t2-")),
            "clear must drop our entry"
        );
        crate::console_log::push(Source::Js, Level::Info, "cons-t2-after");
        let (entries, _) = crate::console_log::since(0);
        let after = entries
            .iter()
            .find(|e| e.message == "cons-t2-after")
            .expect("post-clear pushes land");
        assert!(
            after.seq > watermark_before,
            "seq keeps counting across a clear"
        );
    }
}
