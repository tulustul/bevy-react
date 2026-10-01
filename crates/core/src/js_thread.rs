//! The dedicated JS thread: owns the V8 isolate, runs the React bundle, and
//! exposes the ops that form the whole Rust<->JS boundary.
//!
//! The bundle is split in two (see `examples/.../build.mjs`): a **vendor**
//! script (react, react-reconciler, the bevy-react runtime) executed once and
//! never re-run, and an **app** script (the user's components) re-executed on
//! every edit. On a hot reload the isolate is KEPT ALIVE: we re-`execute_script`
//! the rebuilt app, which re-registers components and drives a React Fast
//! Refresh (hook state preserved). Only if that fails do we fall back to tearing
//! the whole runtime down and rebuilding it.

use std::cell::{Cell, RefCell};
use std::path::{Path, PathBuf};
use std::rc::Rc;

use deno_core::{Extension, JsRuntime, OpDecl, OpState, RuntimeOptions, op2};
use deno_error::JsErrorBox;
use tokio::sync::Mutex;
use tokio::sync::Notify;
use tokio::sync::mpsc::UnboundedReceiver;

use crate::animations::AnimationCommand;
pub use crate::host::{FlushInfo, HostSenders};
use crate::message::ReactMessage;
use crate::protocol::{op::OpBatch, outbound::Outbound};
use crate::request::RawRequest;

/// The Bevy→JS ends `op_next_event` waits on, stored in each runtime's
/// `OpState`. They outlive individual runtimes (shared by `Rc`), so events and
/// reload signals survive a full-reload rebuild; the async op clones them out
/// and awaits without holding the `OpState` borrow.
#[derive(Clone)]
struct EventLoop {
    outbound: Rc<Mutex<UnboundedReceiver<Outbound>>>,
    reload: Rc<Mutex<UnboundedReceiver<()>>>,
    /// Set when a reload was requested, so the outer loop rebuilds rather than
    /// exits.
    reload_flag: Rc<Cell<bool>>,
    /// Woken by `op_next_event` when it hands the JS loop the reload sentinel,
    /// so `pump` can break out of `run_event_loop` even when perpetual timers
    /// (e.g. a `setInterval` clock) keep the event loop from ever going idle.
    reload_notify: Rc<Notify>,
}

/// JS -> Bevy: ship one commit's worth of mutation ops. Synchronous.
///
/// The batch crosses as ONE JSON string (`JSON.stringify` in `bridge.ts`'s
/// `flushRaw`, `serde_json` here) rather than a `serde_v8` object walk: V8's
/// native stringify plus one linear parse costs a fraction of the per-property
/// v8 API traffic (key interning, `Get`s, type probes) a serde_v8 decode of the
/// same tree pays — measured 60-75% off the boundary cost of every batch op.
/// `devtools` marks batches from the panel's own React container (see
/// [`FlushInfo::devtools`]). The [`OpBatch`] wrapper decodes exactly like a
/// `Vec<Op>` but stamps any decode-fallback warnings with their op's node id
/// (see [`crate::diag`]); [`op_take_decode_warnings`] drains them. Those are
/// value-level fallbacks; a *structurally* invalid batch is a `TypeError`
/// thrown into the JS call, which `bridge.ts` relies on to isolate a hand-built
/// (devtools edit) op without losing React's own pending ops.
#[op2(fast)]
fn op_flush(state: &mut OpState, #[string] json: &str, devtools: bool) -> Result<(), JsErrorBox> {
    // The feature registry decodes feature-owned prop keys (`crate::ext`):
    // installed on this thread from the plugin's handoff slot on the first
    // flush — a bounded wait, `Startup` fills the slot before the first frame.
    if crate::ext::with_thread_registry(|r| r.is_none()) {
        let registry = state.borrow::<ExtSlot>().0.wait();
        crate::ext::set_thread_registry(registry);
    }
    let ops: OpBatch =
        serde_json::from_str(json).map_err(|e| JsErrorBox::type_error(e.to_string()))?;
    // The info goes first (see `HostSenders::flush`): the decode of `ops`
    // already happened, so the stamp marks pure channel-entry time.
    let senders = state.borrow::<HostSenders>();
    let _ = senders.flush.send(FlushInfo {
        sent: Some(std::time::Instant::now()),
        devtools,
    });
    let _ = senders.ops.send(ops.0);
    Ok(())
}

/// JS -> Bevy(-side state): drain the invalid-value warnings collected while
/// decoding the most recent `op_flush` batch (same thread, so "most recent" is
/// exact). Called by the dev-only devtools bridge tap right after each flush;
/// production bundles never call it. Empty outside dev/devtools builds.
#[op2]
#[serde]
fn op_take_decode_warnings() -> Vec<crate::diag::Warning> {
    crate::diag::take_decode_warnings()
}

/// JS -> Bevy: emit a named app message (e.g. "count") for ECS systems to read.
// TODO(review): the app-message path (emit/request/event) double-converts v8 →
// `serde_json::Value` → the typed `T` (here, and again in message::dispatch /
// request::dispatch; outbound mirrors it in event::send), two extra allocations per
// message — unlike the `op_flush` hot path, which deserializes straight into `protocol::Op`.
// Routing-by-name needs the type erased, but high-frequency events still pay for it.
#[op2]
fn op_emit(state: &mut OpState, #[string] name: String, #[serde] value: serde_json::Value) {
    let _ = state
        .borrow::<HostSenders>()
        .emit
        .send(ReactMessage { name, value });
}

/// JS -> Bevy: surface a `console.*` call in the Bevy log. `level` is one of
/// "error" | "warn" | "info" | "debug" (mapped from the console method in the
/// prelude shim). The `target: "bevy_react_core::js"` marks the line as coming from the React
/// app, and the tracing level keeps `console.log` and `console.error` visually
/// distinct (INFO vs the red ERROR).
#[op2(fast)]
fn op_log(#[string] level: String, #[string] msg: String) {
    match level.as_str() {
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
        crate::console_log::Level::from_js(&level),
        &msg,
    );
}

/// JS -> Bevy: declare/start/stop a shared-value animation. Synchronous,
/// fire-and-forget (like `op_emit`); the animations plugin drains the channel and
/// drives the value each frame, so per-frame interpolation never crosses back.
#[op2]
fn op_animate(state: &mut OpState, #[serde] cmd: AnimationCommand) {
    let _ = state.borrow::<HostSenders>().anim.send(cmd);
}

/// JS -> Bevy: send a correlated request. The reply comes back asynchronously as
/// an [`Outbound::Response`](crate::protocol::outbound::Outbound) with the same `id`, which
/// the JS event loop matches to the pending promise. `id` is a `BigInt` on the JS
/// side (well under 2^53 in practice).
#[op2]
fn op_request(
    state: &mut OpState,
    #[bigint] id: u64,
    #[string] name: String,
    #[serde] value: serde_json::Value,
) {
    let _ = state
        .borrow::<HostSenders>()
        .request
        .send(RawRequest { id, name, value });
}

/// Bevy -> JS: resolve with the next outbound message (UI event, app event,
/// request response), the reload sentinel, or `null` on shutdown (all senders
/// dropped). Async so the JS loop parks here cheaply.
#[op2]
#[serde]
async fn op_next_event(state: Rc<RefCell<OpState>>) -> Option<Outbound> {
    let handles = state.borrow().borrow::<EventLoop>().clone();
    let mut events = handles.outbound.lock().await;
    let mut reload = handles.reload.lock().await;
    tokio::select! {
        ev = events.recv() => ev, // Some(outbound), or None on shutdown
        r = reload.recv() => match r {
            Some(()) => {
                handles.reload_flag.set(true);
                // Wake `pump`: timers may be keeping `run_event_loop` from
                // returning, so it can't notice the reload on its own.
                handles.reload_notify.notify_one();
                Some(Outbound::Reload)
            }
            None => None, // reload sender dropped => shutdown
        }
    }
}

/// JS -> (no Bevy): sleep `ms` milliseconds, then resolve. Backs the real
/// `setTimeout`/`setInterval` polyfills below; driven by `run_event_loop` (kept
/// alive by the always-pending `op_next_event`), so timers fire even when the app
/// is otherwise idle.
#[op2]
async fn op_sleep(ms: f64) {
    let ms = ms.max(0.0) as u64;
    tokio::time::sleep(std::time::Duration::from_millis(ms)).await;
}

/// JS -> (no Bevy): a monotonic high-resolution clock in milliseconds since the
/// first call (sub-millisecond, `f64`). Backs the prelude's `performance.now`:
/// deno_core defines no `performance` global, so without it every JS-side timing
/// (benchmark legs, React's scheduler clock, the devtools bridge tap) would fall
/// back to `Date.now()` and be quantized to whole milliseconds.
#[op2(fast)]
fn op_now() -> f64 {
    static ORIGIN: std::sync::LazyLock<std::time::Instant> =
        std::sync::LazyLock::new(std::time::Instant::now);
    ORIGIN.elapsed().as_secs_f64() * 1000.0
}

/// JS globals deno_core does not provide on its own. `setTimeout`/`setInterval`
/// honor their delay via the async `op_sleep`; a `0`ms timeout stays on the
/// microtask queue so React's scheduler (which yields with `setTimeout(_, 0)`)
/// stays cheap. Cancellation is observable (a cleared callback never runs), even
/// though the underlying sleep still completes.
// The prelude also installs a `console` that forwards to `op_log`, so every
// `console.*` call (the runtime's own error handlers in bridge.ts/renderer.ts as
// well as any user component) reaches the Bevy log tagged `target: "bevy_react_core::js"`, with
// the tracing level distinguishing `log` from `error`. We define it explicitly
// rather than relying on deno_core's default so behavior is deterministic.
const PRELUDE: &str = r#"
let __nextTimer = 1;
const __cancelled = new Set();
globalThis.setTimeout = (cb, ms = 0, ...args) => {
  const id = __nextTimer++;
  const delay = Math.max(0, +ms || 0);
  const run = () => { if (!__cancelled.delete(id)) cb(...args); };
  if (delay === 0) Promise.resolve().then(run);
  else Deno.core.ops.op_sleep(delay).then(run);
  return id;
};
globalThis.clearTimeout = (id) => { if (id != null) __cancelled.add(id); };
globalThis.setInterval = (cb, ms = 0, ...args) => {
  const id = __nextTimer++;
  const delay = Math.max(0, +ms || 0);
  (async () => {
    while (!__cancelled.has(id)) {
      await Deno.core.ops.op_sleep(delay);
      if (__cancelled.has(id)) break;
      cb(...args);
    }
    __cancelled.delete(id);
  })();
  return id;
};
globalThis.clearInterval = (id) => { if (id != null) __cancelled.add(id); };
globalThis.queueMicrotask = globalThis.queueMicrotask || ((cb) => { Promise.resolve().then(cb); });
if (!globalThis.performance) {
  globalThis.performance = { now: () => Deno.core.ops.op_now(), timeOrigin: Date.now() };
}

const __fmtArg = (a) => {
  if (typeof a === "string") return a;
  if (a instanceof Error) return a.stack || (a.name + ": " + a.message);
  try { return JSON.stringify(a); } catch { return String(a); }
};
const __log = (level) => (...args) =>
  Deno.core.ops.op_log(level, args.map(__fmtArg).join(" "));
globalThis.console = {
  log: __log("info"),
  info: __log("info"),
  debug: __log("debug"),
  trace: __log("debug"),
  warn: __log("warn"),
  error: __log("error"),
  dir: __log("info"),
  table: __log("info"),
  // No-op fallbacks so libraries that probe these never throw:
  group: () => {}, groupCollapsed: () => {}, groupEnd: () => {}, assert: () => {},
};
// Unhandled promise rejections: log (→ op_log → the devtools console) and
// swallow. Returning true suppresses op_dispatch_exception — a deliberate
// behavior change: previously a rejection errored the event loop, which
// `pump` treats as a reload and re-executes the whole app bundle. A logged
// rejection with a live app beats a silent restart.
Deno.core.setUnhandledPromiseRejectionHandler((_promise, reason) => {
  console.error("[js] unhandled promise rejection:", __fmtArg(reason));
  return true;
});
"#;

/// What ended a pump of the JS event loop.
enum Pumped {
    /// A reload was signalled; the app bundle should be re-executed.
    Reload,
    /// All senders dropped — Bevy is shutting down.
    Shutdown,
}

/// The feature-registry handoff stored in `OpState` (see `op_flush`).
struct ExtSlot(crate::ext::ExtRegistrySlot);

/// Spawn the JS thread. Builds the isolate once and keeps it alive across hot
/// reloads (re-executing only the app bundle); runs until shutdown.
pub fn spawn_js_thread(
    ext: crate::ext::ExtRegistrySlot,
    vendor_path: PathBuf,
    app_path: PathBuf,
    senders: HostSenders,
    outbound_rx: UnboundedReceiver<Outbound>,
    reload_rx: UnboundedReceiver<()>,
) {
    std::thread::Builder::new()
        .name("js-runtime".to_string())
        .spawn(move || {
            let rt = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .expect("build current-thread tokio runtime");

            rt.block_on(async move {
                let event_loop = EventLoop {
                    outbound: Rc::new(Mutex::new(outbound_rx)),
                    reload: Rc::new(Mutex::new(reload_rx)),
                    reload_flag: Rc::new(Cell::new(false)),
                    reload_notify: Rc::new(Notify::new()),
                };

                // The last app bundle that executed WITHOUT throwing. A reload that
                // throws (syntax error or a runtime error like an undefined
                // identifier in a component) is rejected and this is re-run instead,
                // so a broken edit never tears down the working UI — see the reload
                // arm below.
                let mut last_good_app = match read_app(&app_path) {
                    Ok(code) => code,
                    Err(e) => {
                        tracing::error!(target: "bevy_react_core::js", "reading app failed: {e:?}");
                        return;
                    }
                };

                let mut runtime = match build_runtime(
                    &vendor_path,
                    &last_good_app,
                    &ext,
                    &senders,
                    &event_loop,
                ) {
                    Ok(rt) => rt,
                    Err(e) => {
                        tracing::error!(target: "bevy_react_core::js", "initial runtime build failed: {e:?}");
                        return;
                    }
                };

                loop {
                    event_loop.reload_flag.set(false);
                    // `pump` drives the JS event loop: the initial/refreshed
                    // render commits, then it parks on `op_next_event` until a
                    // reload or shutdown.
                    match pump(&mut runtime, &event_loop).await {
                        Pumped::Shutdown => break,
                        Pumped::Reload => {
                            // Re-execute the rebuilt app in the LIVE isolate. The
                            // next `pump` drives the resulting Fast Refresh.
                            let new_code = match read_app(&app_path) {
                                Ok(code) => code,
                                Err(e) => {
                                    tracing::warn!(target: "bevy_react_core::js", "reading rebuilt app failed ({e}); keeping the previous working version");
                                    continue;
                                }
                            };
                            match runtime.execute_script("[app-update]", new_code.clone()) {
                                // Applied cleanly — this becomes the new fallback.
                                Ok(_) => last_good_app = new_code,
                                Err(e) => {
                                    // The new bundle threw (a syntax error, or a
                                    // runtime error like `padding: aa16` referencing
                                    // an undefined identifier). Don't refresh into
                                    // broken code: re-run the last working bundle so
                                    // its `mount()` re-parks the event loop and the
                                    // UI stays live. The next good edit applies.
                                    tracing::warn!(target: "bevy_react_core::js", "update rejected ({e}); keeping the previous working version");
                                    crate::console_log::push(
                                        crate::console_log::Source::Rust,
                                        crate::console_log::Level::Error,
                                        &format!("hot reload rejected ({e}); keeping the previous working version"),
                                    );
                                    if let Err(e) = runtime
                                        .execute_script("[app-restore]", last_good_app.clone())
                                    {
                                        // The known-good bundle failed to re-run
                                        // (should not happen — it ran moments ago).
                                        // Log and keep pumping rather than wedge.
                                        tracing::error!(target: "bevy_react_core::js", "restoring previous app failed: {e:?}");
                                        crate::console_log::push(
                                            crate::console_log::Source::Rust,
                                            crate::console_log::Level::Error,
                                            &format!("restoring previous app failed: {e:?}"),
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            });
        })
        .expect("spawn js-runtime thread");
}

/// Build a fresh isolate: register ops, run the prelude, then execute the vendor
/// and app scripts. The app's `mount()` renders the initial tree synchronously
/// (via `flushSync`) and parks on `op_next_event`; the caller's `pump` drives it.
fn build_runtime(
    vendor_path: &Path,
    app_code: &str,
    registry: &crate::ext::ExtRegistrySlot,
    senders: &HostSenders,
    event_loop: &EventLoop,
) -> Result<JsRuntime, Box<dyn std::error::Error>> {
    const FLUSH: OpDecl = op_flush();
    const TAKE_WARNINGS: OpDecl = op_take_decode_warnings();
    const EMIT: OpDecl = op_emit();
    const REQUEST: OpDecl = op_request();
    const ANIMATE: OpDecl = op_animate();
    const NEXT: OpDecl = op_next_event();
    const SLEEP: OpDecl = op_sleep();
    const LOG: OpDecl = op_log();
    const NOW: OpDecl = op_now();
    let ext = Extension {
        name: "bevy_react_bridge",
        ops: std::borrow::Cow::Borrowed(&[
            FLUSH,
            TAKE_WARNINGS,
            EMIT,
            REQUEST,
            ANIMATE,
            NEXT,
            SLEEP,
            LOG,
            NOW,
        ]),
        ..Default::default()
    };

    let mut runtime = JsRuntime::new(RuntimeOptions {
        extensions: vec![ext],
        ..Default::default()
    });

    {
        let op_state = runtime.op_state();
        let mut op_state = op_state.borrow_mut();
        op_state.put(ExtSlot(registry.clone()));
        op_state.put(senders.clone());
        op_state.put(event_loop.clone());
    }

    runtime.execute_script("[prelude]", PRELUDE)?;

    let vendor_code = std::fs::read_to_string(vendor_path)
        .map_err(|e| format!("reading vendor {}: {e}", vendor_path.display()))?;
    runtime.execute_script("[vendor]", vendor_code)?;

    runtime.execute_script("[app]", app_code.to_owned())?;

    Ok(runtime)
}

/// Drive the JS event loop until it yields control back to Rust: either a reload
/// was signalled (`op_next_event` returned the reload sentinel, so the JS event
/// loop returned) or all senders dropped (shutdown).
async fn pump(runtime: &mut JsRuntime, event_loop: &EventLoop) -> Pumped {
    let reload_flag = &event_loop.reload_flag;
    // Race the event loop against the reload signal. `run_event_loop` only
    // resolves when the loop goes idle, but an app with a perpetual timer
    // (e.g. a `setInterval` clock) never does — so without this the reload
    // sentinel `op_next_event` returns would never reach us, the bundle would
    // never re-execute, and nothing would re-park on `op_next_event` (the UI
    // would freeze). `biased` polls the event loop first so it fully drains the
    // pending microtasks (the prior `runEventLoop` returning) before we bail.
    loop {
        let loop_result = tokio::select! {
            biased;
            res = runtime.run_event_loop(Default::default()) => Some(res),
            _ = event_loop.reload_notify.notified() => None,
        };
        match loop_result {
            // Woken by the reload notify (a real reload sets `reload_flag` before
            // `notify_one`). If the flag is clear this is a *stale* permit: when a
            // prior reload resolved via the event-loop branch above, `biased`
            // drained the loop first and dropped this `notified()` future after it
            // had been notified, which re-arms the permit. Ignore it and keep
            // driving the loop, or we'd re-execute the app a second time.
            None => {
                if reload_flag.get() {
                    return Pumped::Reload;
                }
            }
            Some(Err(e)) => {
                // Steady-state errors are caught inside the JS event loop, so this
                // is rare; treat it like a reload so we rebuild rather than wedge.
                // (Unhandled promise rejections used to land here too — the
                // prelude's rejection handler now logs them instead.)
                tracing::error!(target: "bevy_react_core::js", "event loop error: {e}");
                crate::console_log::push(
                    crate::console_log::Source::Rust,
                    crate::console_log::Level::Error,
                    &format!("JS event loop error: {e}"),
                );
                return Pumped::Reload;
            }
            // The loop went idle: a reload with no pending timers, or shutdown.
            Some(Ok(())) => {
                return if reload_flag.get() {
                    Pumped::Reload
                } else {
                    Pumped::Shutdown
                };
            }
        }
    }
}

/// Read the app bundle from disk. Re-executing it in the live isolate (on a hot
/// reload) is what drives Fast Refresh: the app IIFE re-registers its components
/// and calls `mount()`, which — seeing the isolate already mounted — triggers
/// `performReactRefresh()` and re-parks the event loop on `op_next_event`.
fn read_app(app_path: &Path) -> Result<String, String> {
    std::fs::read_to_string(app_path)
        .map_err(|e| format!("reading app {}: {e}", app_path.display()))
}
