//! The engine-agnostic bodies of the ops every engine exposes on
//! `globalThis.__bevyHost` (see `bridge.ts`'s `BevyHost`). An engine adapter
//! only marshals arguments and errors; what an op DOES lives here once.

use std::cell::Cell;
use std::future::Future;
use std::rc::Rc;

use tokio::sync::Mutex;
use tokio::sync::Notify;
use tokio::sync::mpsc::UnboundedReceiver;

use crate::animations::AnimationCommand;
use crate::host::{FlushInfo, HostSenders};
use crate::message::ReactMessage;
use crate::protocol::{op::OpBatch, outbound::Outbound};
use crate::request::RawRequest;

/// The Bevy→JS ends `op_next_event` waits on. They outlive individual runtimes
/// (shared by `Rc`), so events and reload signals survive a full-reload
/// rebuild; the async op clones them out and awaits without holding any engine
/// borrow.
#[derive(Clone)]
pub(super) struct EventLoop {
    pub outbound: Rc<Mutex<UnboundedReceiver<Outbound>>>,
    pub reload: Rc<Mutex<UnboundedReceiver<()>>>,
    /// Set when a reload was requested, so the outer loop rebuilds rather than
    /// exits.
    pub reload_flag: Rc<Cell<bool>>,
    /// Woken by `op_next_event` when it hands the JS loop the reload sentinel,
    /// so `pump` can break out of the engine's event loop even when perpetual
    /// timers (e.g. a `setInterval` clock) keep it from ever going idle.
    pub reload_notify: Rc<Notify>,
}

/// Everything an op reaches: the JS→Bevy senders, the feature-registry
/// handoff, and the Bevy→JS event loop. One clone per runtime.
#[derive(Clone)]
pub(super) struct Host {
    pub senders: HostSenders,
    pub ext: crate::ext::ExtRegistrySlot,
    pub event_loop: EventLoop,
}

impl Host {
    /// JS → Bevy: ship one commit's worth of mutation ops.
    ///
    /// The batch crosses as ONE JSON string (`JSON.stringify` in `bridge.ts`'s
    /// `flushRaw`, `serde_json` here) rather than an engine-object walk: the
    /// engine's native stringify plus one linear parse costs a fraction of the
    /// per-property API traffic (key interning, `Get`s, type probes) a value
    /// walk of the same tree pays — measured 60-75% off the boundary cost of
    /// every batch op on V8. The [`OpBatch`] wrapper decodes exactly like a
    /// `Vec<Op>` but stamps any decode-fallback warnings with their op's node
    /// id (see [`crate::diag`]); [`take_decode_warnings`] drains them. Those
    /// are value-level fallbacks; a *structurally* invalid batch is the `Err`
    /// here, which the adapter throws into the JS call as a `TypeError` —
    /// `bridge.ts` relies on that to isolate a hand-built (devtools edit) op
    /// without losing React's own pending ops.
    pub fn flush(&self, json: &str, devtools: bool) -> Result<(), String> {
        // The feature registry decodes feature-owned prop keys (`crate::ext`):
        // installed on this thread from the plugin's handoff slot on the first
        // flush — a bounded wait, `Startup` fills the slot before the first frame.
        if crate::ext::with_thread_registry(|r| r.is_none()) {
            crate::ext::set_thread_registry(self.ext.wait());
        }
        let ops: OpBatch = serde_json::from_str(json).map_err(|e| e.to_string())?;
        // The info goes first (see `HostSenders::flush`): the decode of `ops`
        // already happened, so the stamp marks pure channel-entry time.
        let _ = self.senders.flush.send(FlushInfo {
            sent: Some(std::time::Instant::now()),
            devtools,
        });
        let _ = self.senders.ops.send(ops.0);
        Ok(())
    }

    /// JS → Bevy: emit a named app message (e.g. "count") for ECS systems to read.
    // TODO(review): the app-message path (emit/request/event) double-converts
    // the JS value → `serde_json::Value` → the typed `T` (here, and again in
    // message::dispatch / request::dispatch; outbound mirrors it in
    // event::send), two extra allocations per message — unlike the `flush`
    // hot path, which deserializes straight into `protocol::Op`. Routing-by-name
    // needs the type erased, but high-frequency events still pay for it.
    pub fn emit(&self, name: String, value: serde_json::Value) {
        let _ = self.senders.emit.send(ReactMessage { name, value });
    }

    /// JS → Bevy: send a correlated request. The reply comes back
    /// asynchronously as an [`Outbound::Response`] with the same `id`, which
    /// the JS event loop matches to the pending promise.
    pub fn request(&self, id: u64, name: String, value: serde_json::Value) {
        let _ = self.senders.request.send(RawRequest { id, name, value });
    }

    /// JS → Bevy: declare/start/stop a shared-value animation. Fire-and-forget
    /// (like [`Self::emit`]); the animations plugin drains the channel and
    /// drives the value each frame, so per-frame interpolation never crosses back.
    pub fn animate(&self, cmd: AnimationCommand) {
        let _ = self.senders.anim.send(cmd);
    }

    /// Bevy → JS: the next outbound message (UI event, app event, request
    /// response), the reload sentinel, or `None` on shutdown (all senders
    /// dropped). Async so the JS loop parks on it cheaply.
    pub fn next_event(&self) -> impl Future<Output = Option<Outbound>> + use<> {
        let handles = self.event_loop.clone();
        async move {
            let mut events = handles.outbound.lock().await;
            let mut reload = handles.reload.lock().await;
            tokio::select! {
                ev = events.recv() => ev, // Some(outbound), or None on shutdown
                r = reload.recv() => match r {
                    Some(()) => {
                        handles.reload_flag.set(true);
                        // Wake `pump`: timers may be keeping the event loop
                        // from going idle, so it can't notice the reload alone.
                        handles.reload_notify.notify_one();
                        Some(Outbound::Reload)
                    }
                    None => None, // reload sender dropped => shutdown
                }
            }
        }
    }
}

/// JS → Bevy-side state: drain the invalid-value warnings collected while
/// decoding the most recent flush batch (same thread, so "most recent" is
/// exact). Called by the dev-only devtools bridge tap right after each flush;
/// production bundles never call it. Empty outside dev/devtools builds.
pub(super) fn take_decode_warnings() -> Vec<crate::diag::Warning> {
    crate::diag::take_decode_warnings()
}

/// JS → Bevy log: surface a `console.*` call. `level` is one of
/// "error" | "warn" | "info" | "debug" (mapped from the console method in the
/// prelude). The `target: "bevy_react_core::js"` marks the line as coming from
/// the React app, and the tracing level keeps `console.log` and
/// `console.error` visually distinct (INFO vs the red ERROR).
pub(super) fn log(level: &str, msg: &str) {
    match level {
        "error" => tracing::error!(target: "bevy_react_core::js", "{msg}"),
        "warn" => tracing::warn!(target: "bevy_react_core::js", "{msg}"),
        "debug" => tracing::debug!(target: "bevy_react_core::js", "{msg}"),
        _ => tracing::info!(target: "bevy_react_core::js", "{msg}"),
    }
    // Mirror into the devtools console ring (dev builds only; no-op stub
    // otherwise) — this single op is the funnel for ALL JS console output,
    // including the runtime's own error handlers.
    crate::console_log::push(
        crate::console_log::Source::Js,
        crate::console_log::Level::from_js(level),
        msg,
    );
}

/// Sleep `ms` milliseconds. Backs the prelude's `setTimeout`/`setInterval`;
/// driven by the engine's event loop (kept alive by the always-pending
/// `op_next_event`), so timers fire even when the app is otherwise idle.
pub(super) async fn sleep(ms: f64) {
    let ms = ms.max(0.0) as u64;
    tokio::time::sleep(std::time::Duration::from_millis(ms)).await;
}

/// A monotonic high-resolution clock in milliseconds since the first call
/// (sub-millisecond, `f64`). Backs the prelude's `performance.now` where the
/// engine has none (deno_core): without it every JS-side timing (benchmark
/// legs, React's scheduler clock, the devtools bridge tap) would fall back to
/// `Date.now()` and be quantized to whole milliseconds.
pub(super) fn now() -> f64 {
    static ORIGIN: std::sync::LazyLock<std::time::Instant> =
        std::sync::LazyLock::new(std::time::Instant::now);
    ORIGIN.elapsed().as_secs_f64() * 1000.0
}
