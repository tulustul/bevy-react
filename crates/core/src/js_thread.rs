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

use bevy::log::{debug, error, info, warn};
use crossbeam_channel::Sender;
use deno_core::{Extension, JsRuntime, OpDecl, OpState, RuntimeOptions, op2};
use tokio::sync::Mutex;
use tokio::sync::Notify;
use tokio::sync::mpsc::UnboundedReceiver;

use bevy_react_animations::AnimationCommand;

use crate::message::ReactMessage;
use crate::protocol::{Op, Outbound};
use crate::request::RawRequest;

/// Sender half stored in `OpState` so `op_flush` can hand op batches to Bevy.
struct OpSender(Sender<Vec<Op>>);

/// Sender half stored in `OpState` so `op_emit` can hand app messages to Bevy.
struct EmitSender(Sender<ReactMessage>);

/// Sender half stored in `OpState` so `op_request` can hand requests to Bevy.
struct RequestSender(Sender<RawRequest>);

/// Sender half stored in `OpState` so `op_animate` can hand animation commands to
/// the animations plugin. Always present; if animations are disabled the receiver
/// is dropped and sends are silently discarded.
struct AnimSender(Sender<AnimationCommand>);

/// Receivers shared (by `Rc`) into each runtime's `OpState`. The async op clones
/// the `Rc` out and awaits without holding the `OpState` borrow.
struct OutboundReceiver(Rc<Mutex<UnboundedReceiver<Outbound>>>);
struct ReloadReceiver(Rc<Mutex<UnboundedReceiver<()>>>);

/// Set true when a reload was requested, so the outer loop rebuilds rather than
/// exits. One per runtime instance.
struct ReloadFlag(Rc<Cell<bool>>);

/// Woken by `op_next_event` when it hands the JS loop the reload sentinel, so
/// `pump` can break out of `run_event_loop` even when perpetual timers (e.g. a
/// `setInterval` clock) keep the event loop from ever going idle on its own.
struct ReloadNotify(Rc<Notify>);

/// JS -> Bevy: ship one commit's worth of mutation ops. Synchronous.
#[op2]
fn op_flush(state: &mut OpState, #[serde] ops: Vec<Op>) {
    let sender = state.borrow::<OpSender>();
    let _ = sender.0.send(ops);
}

/// JS -> Bevy: emit a named app message (e.g. "count") for ECS systems to read.
// TODO(review): the app-message path (emit/request/event) double-converts v8 →
// `serde_json::Value` → the typed `T` (here, and again in message::dispatch /
// request::dispatch; outbound mirrors it in event::send), two extra allocations per
// message — unlike the `op_flush` hot path, which deserializes straight into `protocol::Op`.
// Routing-by-name needs the type erased, but high-frequency events still pay for it.
#[op2]
fn op_emit(state: &mut OpState, #[string] name: String, #[serde] value: serde_json::Value) {
    let sender = state.borrow::<EmitSender>();
    let _ = sender.0.send(ReactMessage { name, value });
}

/// JS -> Bevy: surface a `console.*` call in the Bevy log. `level` is one of
/// "error" | "warn" | "info" | "debug" (mapped from the console method in the
/// prelude shim). The `target: "bevy_react::js"` marks the line as coming from the React
/// app, and the tracing level keeps `console.log` and `console.error` visually
/// distinct (INFO vs the red ERROR).
#[op2(fast)]
fn op_log(#[string] level: String, #[string] msg: String) {
    match level.as_str() {
        "error" => error!(target: "bevy_react::js", "{msg}"),
        "warn" => warn!(target: "bevy_react::js", "{msg}"),
        "debug" => debug!(target: "bevy_react::js", "{msg}"),
        _ => info!(target: "bevy_react::js", "{msg}"),
    }
}

/// JS -> Bevy: declare/start/stop a shared-value animation. Synchronous,
/// fire-and-forget (like `op_emit`); the animations plugin drains the channel and
/// drives the value each frame, so per-frame interpolation never crosses back.
#[op2]
fn op_animate(state: &mut OpState, #[serde] cmd: AnimationCommand) {
    let sender = state.borrow::<AnimSender>();
    let _ = sender.0.send(cmd);
}

/// JS -> Bevy: send a correlated request. The reply comes back asynchronously as
/// an [`Outbound::Response`](crate::protocol::Outbound) with the same `id`, which
/// the JS event loop matches to the pending promise. `id` is a `BigInt` on the JS
/// side (well under 2^53 in practice).
#[op2]
fn op_request(
    state: &mut OpState,
    #[bigint] id: u64,
    #[string] name: String,
    #[serde] value: serde_json::Value,
) {
    let sender = state.borrow::<RequestSender>();
    let _ = sender.0.send(RawRequest { id, name, value });
}

/// Bevy -> JS: resolve with the next outbound message (UI event, app event,
/// request response), the reload sentinel, or `null` on shutdown (all senders
/// dropped). Async so the JS loop parks here cheaply.
#[op2]
#[serde]
async fn op_next_event(state: Rc<RefCell<OpState>>) -> Option<Outbound> {
    let (events, reload, flag, notify) = {
        let state = state.borrow();
        (
            state.borrow::<OutboundReceiver>().0.clone(),
            state.borrow::<ReloadReceiver>().0.clone(),
            state.borrow::<ReloadFlag>().0.clone(),
            state.borrow::<ReloadNotify>().0.clone(),
        )
    };
    let mut events = events.lock().await;
    let mut reload = reload.lock().await;
    tokio::select! {
        ev = events.recv() => ev, // Some(outbound), or None on shutdown
        r = reload.recv() => match r {
            Some(()) => {
                flag.set(true);
                // Wake `pump`: timers may be keeping `run_event_loop` from
                // returning, so it can't notice the reload on its own.
                notify.notify_one();
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

/// JS globals deno_core does not provide on its own. `setTimeout`/`setInterval`
/// honor their delay via the async `op_sleep`; a `0`ms timeout stays on the
/// microtask queue so React's scheduler (which yields with `setTimeout(_, 0)`)
/// stays cheap. Cancellation is observable (a cleared callback never runs), even
/// though the underlying sleep still completes.
// The prelude also installs a `console` that forwards to `op_log`, so every
// `console.*` call (the runtime's own error handlers in bridge.ts/renderer.ts as
// well as any user component) reaches the Bevy log tagged `target: "bevy_react::js"`, with
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
"#;

/// What ended a pump of the JS event loop.
enum Pumped {
    /// A reload was signalled; the app bundle should be re-executed.
    Reload,
    /// All senders dropped — Bevy is shutting down.
    Shutdown,
}

/// The senders the runtime needs; cloned into each (re)build of the isolate.
#[derive(Clone)]
struct Senders {
    ops: Sender<Vec<Op>>,
    emit: Sender<ReactMessage>,
    request: Sender<RawRequest>,
    anim: Sender<AnimationCommand>,
}

/// Spawn the JS thread. Builds the isolate once and keeps it alive across hot
/// reloads (re-executing only the app bundle); runs until shutdown.
#[allow(clippy::too_many_arguments)]
pub fn spawn_js_thread(
    vendor_path: PathBuf,
    app_path: PathBuf,
    ops_tx: Sender<Vec<Op>>,
    emit_tx: Sender<ReactMessage>,
    request_tx: Sender<RawRequest>,
    anim_tx: Sender<AnimationCommand>,
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
                let senders = Senders {
                    ops: ops_tx,
                    emit: emit_tx,
                    request: request_tx,
                    anim: anim_tx,
                };
                // These outlive individual runtimes so events/reload signals
                // survive across a full-reload rebuild.
                let outbound_rx = Rc::new(Mutex::new(outbound_rx));
                let reload_rx = Rc::new(Mutex::new(reload_rx));
                let reload_flag = Rc::new(Cell::new(false));
                let reload_notify = Rc::new(Notify::new());

                let mut runtime = match build_runtime(
                    &vendor_path,
                    &app_path,
                    &senders,
                    outbound_rx.clone(),
                    reload_rx.clone(),
                    reload_flag.clone(),
                    reload_notify.clone(),
                ) {
                    Ok(rt) => rt,
                    Err(e) => {
                        error!(target: "bevy_react::js", "initial runtime build failed: {e:?}");
                        return;
                    }
                };

                loop {
                    reload_flag.set(false);
                    // `pump` drives the JS event loop: the initial/refreshed
                    // render commits, then it parks on `op_next_event` until a
                    // reload or shutdown.
                    match pump(&mut runtime, &reload_flag, &reload_notify).await {
                        Pumped::Shutdown => break,
                        Pumped::Reload => {
                            // Re-execute the rebuilt app in the LIVE isolate. The
                            // next `pump` drives the resulting Fast Refresh.
                            if let Err(e) = apply_update(&mut runtime, &app_path) {
                                // The update threw synchronously (e.g. a syntax
                                // error in the bundle). Fall back to a full
                                // isolate rebuild.
                                warn!(target: "bevy_react::js", "fast refresh failed ({e}); full reload");
                                match build_runtime(
                                    &vendor_path,
                                    &app_path,
                                    &senders,
                                    outbound_rx.clone(),
                                    reload_rx.clone(),
                                    reload_flag.clone(),
                                    reload_notify.clone(),
                                ) {
                                    Ok(rt) => runtime = rt,
                                    Err(e) => {
                                        error!(target: "bevy_react::js", "full reload failed: {e:?}");
                                        break;
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
    app_path: &Path,
    senders: &Senders,
    outbound_rx: Rc<Mutex<UnboundedReceiver<Outbound>>>,
    reload_rx: Rc<Mutex<UnboundedReceiver<()>>>,
    reload_flag: Rc<Cell<bool>>,
    reload_notify: Rc<Notify>,
) -> anyhow::Result<JsRuntime> {
    const FLUSH: OpDecl = op_flush();
    const EMIT: OpDecl = op_emit();
    const REQUEST: OpDecl = op_request();
    const ANIMATE: OpDecl = op_animate();
    const NEXT: OpDecl = op_next_event();
    const SLEEP: OpDecl = op_sleep();
    const LOG: OpDecl = op_log();
    let ext = Extension {
        name: "bevy_react_bridge",
        ops: std::borrow::Cow::Borrowed(&[FLUSH, EMIT, REQUEST, ANIMATE, NEXT, SLEEP, LOG]),
        ..Default::default()
    };

    let mut runtime = JsRuntime::new(RuntimeOptions {
        extensions: vec![ext],
        ..Default::default()
    });

    {
        let op_state = runtime.op_state();
        let mut op_state = op_state.borrow_mut();
        op_state.put(OpSender(senders.ops.clone()));
        op_state.put(EmitSender(senders.emit.clone()));
        op_state.put(RequestSender(senders.request.clone()));
        op_state.put(AnimSender(senders.anim.clone()));
        op_state.put(OutboundReceiver(outbound_rx));
        op_state.put(ReloadReceiver(reload_rx));
        op_state.put(ReloadFlag(reload_flag));
        op_state.put(ReloadNotify(reload_notify));
    }

    runtime.execute_script("[prelude]", PRELUDE)?;

    let vendor_code = std::fs::read_to_string(vendor_path)
        .map_err(|e| anyhow::anyhow!("reading vendor {}: {e}", vendor_path.display()))?;
    runtime.execute_script("[vendor]", vendor_code)?;

    let app_code = std::fs::read_to_string(app_path)
        .map_err(|e| anyhow::anyhow!("reading app {}: {e}", app_path.display()))?;
    runtime.execute_script("[app]", app_code)?;

    Ok(runtime)
}

/// Drive the JS event loop until it yields control back to Rust: either a reload
/// was signalled (`op_next_event` returned the reload sentinel, so the JS event
/// loop returned) or all senders dropped (shutdown).
async fn pump(
    runtime: &mut JsRuntime,
    reload_flag: &Rc<Cell<bool>>,
    reload_notify: &Notify,
) -> Pumped {
    // Race the event loop against the reload signal. `run_event_loop` only
    // resolves when the loop goes idle, but an app with a perpetual timer
    // (e.g. a `setInterval` clock) never does — so without this the reload
    // sentinel `op_next_event` returns would never reach us, the bundle would
    // never re-execute, and nothing would re-park on `op_next_event` (the UI
    // would freeze). `biased` polls the event loop first so it fully drains the
    // pending microtasks (the prior `runEventLoop` returning) before we bail.
    let loop_result = tokio::select! {
        biased;
        res = runtime.run_event_loop(Default::default()) => Some(res),
        _ = reload_notify.notified() => None,
    };
    match loop_result {
        // Woken by a reload while the event loop was still busy with timers.
        None => Pumped::Reload,
        Some(Err(e)) => {
            // Steady-state errors are caught inside the JS event loop, so this
            // is rare; treat it like a reload so we rebuild rather than wedge.
            error!(target: "bevy_react::js", "event loop error: {e}");
            Pumped::Reload
        }
        // The loop went idle: a reload with no pending timers, or shutdown.
        Some(Ok(())) => {
            if reload_flag.get() {
                Pumped::Reload
            } else {
                Pumped::Shutdown
            }
        }
    }
}

/// Re-execute the (rebuilt) app bundle in the LIVE isolate. The app IIFE
/// re-registers its components and calls `mount()`, which — seeing the isolate
/// already mounted — triggers `performReactRefresh()` and re-parks the event
/// loop on `op_next_event`. Synchronous: the caller's next `pump` drives the
/// refresh render (and the re-park). Returns `Err` only if the script threw
/// synchronously (e.g. a syntax error), which the caller treats as "full reload".
fn apply_update(runtime: &mut JsRuntime, app_path: &Path) -> anyhow::Result<()> {
    let app_code = std::fs::read_to_string(app_path)
        .map_err(|e| anyhow::anyhow!("reading app {}: {e}", app_path.display()))?;
    runtime.execute_script("[app-update]", app_code)?;
    Ok(())
}
