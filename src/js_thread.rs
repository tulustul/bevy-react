//! The dedicated JS thread: owns the V8 isolate, runs the React bundle, and
//! exposes exactly two ops that form the whole Rust<->JS boundary. On a hot
//! reload it tears the runtime down and builds a fresh one from the rebuilt
//! bundle, all on this same thread.

use std::cell::{Cell, RefCell};
use std::path::PathBuf;
use std::rc::Rc;

use crossbeam_channel::Sender;
use deno_core::{
    Extension, FsModuleLoader, JsRuntime, OpDecl, OpState, RuntimeOptions, op2, resolve_path,
};
use tokio::sync::Mutex;
use tokio::sync::mpsc::UnboundedReceiver;

use crate::protocol::{Op, UiEvent};

/// Sentinel `kind` returned by `op_next_event` to make the JS event loop exit so
/// the runtime can be rebuilt. Never produced by Bevy.
const RELOAD_KIND: &str = "__reload__";

/// Sender half stored in `OpState` so `op_flush` can hand op batches to Bevy.
struct OpSender(Sender<Vec<Op>>);

/// Receivers shared (by `Rc`) into each runtime's `OpState`. The async op clones
/// the `Rc` out and awaits without holding the `OpState` borrow.
struct EventReceiver(Rc<Mutex<UnboundedReceiver<UiEvent>>>);
struct ReloadReceiver(Rc<Mutex<UnboundedReceiver<()>>>);

/// Set true when a reload was requested, so the outer loop rebuilds rather than
/// exits. One per runtime instance.
struct ReloadFlag(Rc<Cell<bool>>);

/// JS -> Bevy: ship one commit's worth of mutation ops. Synchronous.
#[op2]
fn op_flush(state: &mut OpState, #[serde] ops: Vec<Op>) {
    let sender = state.borrow::<OpSender>();
    let _ = sender.0.send(ops);
}

/// Bevy -> JS: resolve with the next UI event, the reload sentinel, or `null`
/// on shutdown (all senders dropped). Async so the JS loop parks here cheaply.
#[op2]
#[serde]
async fn op_next_event(state: Rc<RefCell<OpState>>) -> Option<UiEvent> {
    let (events, reload, flag) = {
        let state = state.borrow();
        (
            state.borrow::<EventReceiver>().0.clone(),
            state.borrow::<ReloadReceiver>().0.clone(),
            state.borrow::<ReloadFlag>().0.clone(),
        )
    };
    let mut events = events.lock().await;
    let mut reload = reload.lock().await;
    tokio::select! {
        ev = events.recv() => ev, // Some(event), or None on shutdown
        r = reload.recv() => match r {
            Some(()) => {
                flag.set(true);
                Some(UiEvent { id: 0, kind: RELOAD_KIND.to_string() })
            }
            None => None, // reload sender dropped => shutdown
        }
    }
}

/// JS globals deno_core does not provide on its own (see prior notes).
const PRELUDE: &str = r#"
globalThis.setTimeout = (cb, _ms, ...args) => { Promise.resolve().then(() => cb(...args)); return 0; };
globalThis.clearTimeout = () => {};
globalThis.setInterval = () => 0;
globalThis.clearInterval = () => {};
globalThis.queueMicrotask = globalThis.queueMicrotask || ((cb) => { Promise.resolve().then(cb); });
"#;

/// Spawn the JS thread. Runs until shutdown (Bevy drops the senders); rebuilds
/// the runtime each time a reload is signalled.
pub fn spawn_js_thread(
    bundle_path: PathBuf,
    ops_tx: Sender<Vec<Op>>,
    events_rx: UnboundedReceiver<UiEvent>,
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
                // These outlive individual runtimes so events/reload signals
                // survive across reloads.
                let events_rx = Rc::new(Mutex::new(events_rx));
                let reload_rx = Rc::new(Mutex::new(reload_rx));

                loop {
                    let reload_flag = Rc::new(Cell::new(false));
                    if let Err(e) = run_once(
                        &bundle_path,
                        ops_tx.clone(),
                        events_rx.clone(),
                        reload_rx.clone(),
                        reload_flag.clone(),
                    )
                    .await
                    {
                        eprintln!("[js] runtime error: {e:?}");
                    }
                    if !reload_flag.get() {
                        break; // shutdown
                    }
                    eprintln!("[js] hot reloading bundle");
                }
            });
        })
        .expect("spawn js-runtime thread");
}

/// Build one runtime, run the (re-read) bundle, and pump its event loop until
/// the JS event loop exits (reload or shutdown).
async fn run_once(
    bundle_path: &PathBuf,
    ops_tx: Sender<Vec<Op>>,
    events_rx: Rc<Mutex<UnboundedReceiver<UiEvent>>>,
    reload_rx: Rc<Mutex<UnboundedReceiver<()>>>,
    reload_flag: Rc<Cell<bool>>,
) -> anyhow::Result<()> {
    const FLUSH: OpDecl = op_flush();
    const NEXT: OpDecl = op_next_event();
    let ext = Extension {
        name: "bevy_react_bridge",
        ops: std::borrow::Cow::Borrowed(&[FLUSH, NEXT]),
        ..Default::default()
    };

    let mut runtime = JsRuntime::new(RuntimeOptions {
        module_loader: Some(Rc::new(FsModuleLoader)),
        extensions: vec![ext],
        ..Default::default()
    });

    {
        let op_state = runtime.op_state();
        let mut op_state = op_state.borrow_mut();
        op_state.put(OpSender(ops_tx));
        op_state.put(EventReceiver(events_rx));
        op_state.put(ReloadReceiver(reload_rx));
        op_state.put(ReloadFlag(reload_flag));
    }

    runtime.execute_script("[prelude]", PRELUDE)?;

    // Re-read each time so reloads pick up the rebuilt bundle.
    let bundle_code = std::fs::read_to_string(bundle_path)
        .map_err(|e| anyhow::anyhow!("reading bundle {}: {e}", bundle_path.display()))?;
    let main_module = resolve_path(
        bundle_path.to_string_lossy().as_ref(),
        &std::env::current_dir()?,
    )?;

    let mod_id = runtime
        .load_main_es_module_from_code(&main_module, bundle_code)
        .await?;
    let eval = runtime.mod_evaluate(mod_id);
    runtime.run_event_loop(Default::default()).await?;
    eval.await?;
    Ok(())
}
