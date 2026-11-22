//! The dedicated JS thread: owns the JS engine, runs the React bundle, and
//! exposes the ops that form the whole Rust<->JS boundary.
//!
//! The engine is pluggable ([`JsEngine`], one cargo feature each — `v8`,
//! `quickjs`); everything that is not marshalling — the op bodies
//! ([`host`]), the JS prelude (timers, `console`), the reload/refresh loop —
//! is shared. An engine adapter installs the ops on `globalThis.__bevyHost`
//! (the surface `bridge.ts` calls), executes scripts, and drives its event
//! loop (the private `Engine` trait).
//!
//! The bundle is split in two (see `js/build-lib.mjs`): a **vendor** script
//! (react, react-reconciler, the bevy-react runtime) executed once and never
//! re-run, and an **app** script (the user's components) re-executed on every
//! edit. On a hot reload the runtime is KEPT ALIVE: we re-execute the rebuilt
//! app, which re-registers components and drives a React Fast Refresh (hook
//! state preserved). Only if that fails do we fall back to re-running the last
//! working app.

// With no engine compiled in, `JsEngine` is uninhabited and everything past
// its `match` is dead — a build only the feature crates' standalone checks
// make (an app needs an engine; `host::native::spawn` says so at startup).
#![cfg_attr(
    not(any(feature = "v8", feature = "quickjs")),
    allow(dead_code, unused_variables, unreachable_code)
)]

use std::cell::Cell;
use std::path::{Path, PathBuf};
use std::rc::Rc;

use tokio::sync::Mutex;
use tokio::sync::Notify;
use tokio::sync::mpsc::UnboundedReceiver;

pub use crate::host::{FlushInfo, HostSenders};
use crate::protocol::outbound::Outbound;

mod host;
#[cfg(feature = "quickjs")]
mod quickjs;
#[cfg(feature = "v8")]
mod v8;

use host::{EventLoop, Host};

/// The JS engine the React bundle runs on (native targets; on the web it runs
/// in the browser's own). Each variant exists only when its cargo feature is
/// on — an engine left out is neither downloaded nor linked — so naming one
/// the build lacks is a compile error. Chosen with
/// [`ReactUiPlugin::engine`](crate::ReactUiPlugin::engine).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum JsEngine {
    /// V8 through deno_core (feature `v8`, the default): a JIT compiler, the
    /// fastest at running JS; a ~40 MB prebuilt static library.
    #[cfg(feature = "v8")]
    V8,
    /// QuickJS (quickjs-ng through rquickjs; feature `quickjs`): a small
    /// interpreter compiled from C (~1 MB), slower at running JS, quick to
    /// start.
    #[cfg(feature = "quickjs")]
    QuickJs,
}

impl JsEngine {
    /// Every engine compiled into this build, the default first (V8 when it
    /// is there).
    pub const COMPILED: &[JsEngine] = &[
        #[cfg(feature = "v8")]
        JsEngine::V8,
        #[cfg(feature = "quickjs")]
        JsEngine::QuickJs,
    ];

    /// The engine used when none is chosen: the first of [`Self::COMPILED`].
    pub fn default_engine() -> Option<Self> {
        Self::COMPILED.first().copied()
    }
}

/// What an engine adapter provides; the rest of the thread is shared.
#[allow(async_fn_in_trait)] // private, single-threaded: no `Send` bound wanted
trait Engine: Sized {
    /// A fresh runtime with the ops installed on `globalThis.__bevyHost` and
    /// unhandled promise rejections logged (not fatal).
    async fn new(host: Host) -> Result<Self, String>;
    /// The engine's name and version, for the startup log line.
    fn version() -> String;
    /// Run a classic (non-module, sloppy-mode) script in the live context.
    async fn execute(&mut self, name: &'static str, code: String) -> Result<(), String>;
    /// Drive timers, op futures and microtasks until nothing is pending.
    async fn run_event_loop(&mut self) -> Result<(), String>;
}

/// The JS stack thread size: room for QuickJS's own stack cap (8 MB) plus
/// the Rust frames under it. V8 caps its stack itself, well below this.
const JS_THREAD_STACK: usize = 16 << 20;

/// Spawn the JS thread running `engine`. Builds the runtime once and keeps it
/// alive across hot reloads (re-executing only the app bundle); runs until
/// shutdown.
pub fn spawn_js_thread(
    engine: JsEngine,
    ext: crate::ext::ExtRegistrySlot,
    vendor_path: PathBuf,
    app_path: PathBuf,
    senders: HostSenders,
    outbound_rx: UnboundedReceiver<Outbound>,
    reload_rx: UnboundedReceiver<()>,
) {
    std::thread::Builder::new()
        .name("js-runtime".to_string())
        .stack_size(JS_THREAD_STACK)
        .spawn(move || {
            let rt = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .expect("build current-thread tokio runtime");
            let host = Host {
                senders,
                ext,
                event_loop: EventLoop {
                    outbound: Rc::new(Mutex::new(outbound_rx)),
                    reload: Rc::new(Mutex::new(reload_rx)),
                    reload_flag: Rc::new(Cell::new(false)),
                    reload_notify: Rc::new(Notify::new()),
                },
            };
            match engine {
                #[cfg(feature = "v8")]
                JsEngine::V8 => rt.block_on(run::<v8::V8>(host, &vendor_path, &app_path)),
                #[cfg(feature = "quickjs")]
                JsEngine::QuickJs => {
                    rt.block_on(run::<quickjs::QuickJs>(host, &vendor_path, &app_path))
                }
            }
        })
        .expect("spawn js-runtime thread");
}

/// The JS thread's life on engine `E`: build, then pump the event loop,
/// re-executing the app on each reload until shutdown.
async fn run<E: Engine>(host: Host, vendor_path: &Path, app_path: &Path) {
    let started = std::time::Instant::now();
    let event_loop = host.event_loop.clone();
    // The last app bundle that executed WITHOUT throwing. A reload that throws
    // (syntax error or a runtime error like an undefined identifier in a
    // component) is rejected and this is re-run instead, so a broken edit
    // never tears down the working UI — see the reload arm below.
    let mut last_good_app = match read_app(app_path) {
        Ok(code) => code,
        Err(e) => {
            tracing::error!(target: "bevy_react_core::js", "reading app failed: {e:?}");
            return;
        }
    };

    let mut runtime = match build_runtime::<E>(host, vendor_path, &last_good_app).await {
        Ok(rt) => {
            // Which engine runs the app, and its startup cost: runtime
            // creation, the bundles' parse + evaluation and the first
            // (synchronous) render's flush.
            tracing::info!(target: "bevy_react_core::js", "{} ready in {:.1} ms", E::version(), started.elapsed().as_secs_f64() * 1000.0);
            rt
        }
        Err(e) => {
            tracing::error!(target: "bevy_react_core::js", "{}: initial runtime build failed: {e}", E::version());
            return;
        }
    };

    loop {
        event_loop.reload_flag.set(false);
        // `pump` drives the JS event loop: the initial/refreshed render
        // commits, then it parks on `op_next_event` until a reload or shutdown.
        match pump(&mut runtime, &event_loop).await {
            Pumped::Shutdown => break,
            Pumped::Reload => {
                // Re-execute the rebuilt app in the LIVE runtime. The next
                // `pump` drives the resulting Fast Refresh.
                let new_code = match read_app(app_path) {
                    Ok(code) => code,
                    Err(e) => {
                        tracing::warn!(target: "bevy_react_core::js", "reading rebuilt app failed ({e}); keeping the previous working version");
                        continue;
                    }
                };
                match runtime.execute("[app-update]", new_code.clone()).await {
                    // Applied cleanly — this becomes the new fallback.
                    Ok(()) => last_good_app = new_code,
                    Err(e) => {
                        // The new bundle threw (a syntax error, or a runtime
                        // error like `padding: aa16` referencing an undefined
                        // identifier). Don't refresh into broken code: re-run
                        // the last working bundle so its `mount()` re-parks
                        // the event loop and the UI stays live. The next good
                        // edit applies.
                        tracing::warn!(target: "bevy_react_core::js", "update rejected ({e}); keeping the previous working version");
                        crate::console_log::push(
                            crate::console_log::Source::Rust,
                            crate::console_log::Level::Error,
                            &format!(
                                "hot reload rejected ({e}); keeping the previous working version"
                            ),
                        );
                        if let Err(e) = runtime
                            .execute("[app-restore]", last_good_app.clone())
                            .await
                        {
                            // The known-good bundle failed to re-run (should
                            // not happen — it ran moments ago). Log and keep
                            // pumping rather than wedge.
                            tracing::error!(target: "bevy_react_core::js", "restoring previous app failed: {e}");
                            crate::console_log::push(
                                crate::console_log::Source::Rust,
                                crate::console_log::Level::Error,
                                &format!("restoring previous app failed: {e}"),
                            );
                        }
                    }
                }
            }
        }
    }
}

/// The JS globals every engine shares (timers, `console`, `performance`),
/// over the ops on `__bevyHost`.
const PRELUDE: &str = include_str!("prelude.js");

/// Build a fresh runtime: install the ops, run the prelude, then execute the
/// vendor and app scripts. The app's `mount()` renders the initial tree
/// synchronously (via `flushSync`) and parks on `op_next_event`; the caller's
/// `pump` drives it.
async fn build_runtime<E: Engine>(
    host: Host,
    vendor_path: &Path,
    app_code: &str,
) -> Result<E, String> {
    let mut runtime = E::new(host).await?;
    runtime.execute("[prelude]", PRELUDE.to_owned()).await?;
    let vendor_code = std::fs::read_to_string(vendor_path)
        .map_err(|e| format!("reading vendor {}: {e}", vendor_path.display()))?;
    runtime.execute("[vendor]", vendor_code).await?;
    runtime.execute("[app]", app_code.to_owned()).await?;
    Ok(runtime)
}

/// What ended a pump of the JS event loop.
enum Pumped {
    /// A reload was signalled; the app bundle should be re-executed.
    Reload,
    /// All senders dropped — Bevy is shutting down.
    Shutdown,
}

/// Drive the JS event loop until it yields control back to Rust: either a
/// reload was signalled (`op_next_event` returned the reload sentinel, so the
/// JS event loop returned) or all senders dropped (shutdown).
async fn pump<E: Engine>(runtime: &mut E, event_loop: &EventLoop) -> Pumped {
    let reload_flag = &event_loop.reload_flag;
    // Race the event loop against the reload signal. The event loop only
    // resolves when it goes idle, but an app with a perpetual timer (e.g. a
    // `setInterval` clock) never does — so without this the reload sentinel
    // `op_next_event` returns would never reach us, the bundle would never
    // re-execute, and nothing would re-park on `op_next_event` (the UI would
    // freeze). `biased` polls the event loop first so it fully drains the
    // pending microtasks (the prior `runEventLoop` returning) before we bail.
    loop {
        let loop_result = tokio::select! {
            biased;
            res = runtime.run_event_loop() => Some(res),
            _ = event_loop.reload_notify.notified() => None,
        };
        match loop_result {
            // Woken by the reload notify (a real reload sets `reload_flag`
            // before `notify_one`). If the flag is clear this is a *stale*
            // permit: when a prior reload resolved via the event-loop branch
            // above, `biased` drained the loop first and dropped this
            // `notified()` future after it had been notified, which re-arms
            // the permit. Ignore it and keep driving the loop, or we'd
            // re-execute the app a second time.
            None => {
                if reload_flag.get() {
                    return Pumped::Reload;
                }
            }
            Some(Err(e)) => {
                // Steady-state errors are caught inside the JS event loop, so
                // this is rare; treat it like a reload so we rebuild rather
                // than wedge. (Unhandled promise rejections are logged by the
                // engine's rejection hook instead.)
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

/// Read the app bundle from disk. Re-executing it in the live runtime (on a
/// hot reload) is what drives Fast Refresh: the app IIFE re-registers its
/// components and calls `mount()`, which — seeing the runtime already mounted
/// — triggers `performReactRefresh()` and re-parks the event loop on
/// `op_next_event`.
fn read_app(app_path: &Path) -> Result<String, String> {
    std::fs::read_to_string(app_path)
        .map_err(|e| format!("reading app {}: {e}", app_path.display()))
}
