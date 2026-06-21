//! The dedicated JS thread: owns the V8 isolate, runs the React bundle, and
//! exposes exactly two ops that form the whole Rust<->JS boundary.

use std::cell::RefCell;
use std::path::PathBuf;
use std::rc::Rc;

use crossbeam_channel::Sender;
use deno_core::{
    Extension, FsModuleLoader, JsRuntime, OpDecl, OpState, RuntimeOptions, op2, resolve_path,
};
use tokio::sync::Mutex;
use tokio::sync::mpsc::UnboundedReceiver;

use crate::protocol::{Op, UiEvent};

/// Sender half stored in `OpState` so `op_flush` can hand op batches to Bevy.
struct OpSender(Sender<Vec<Op>>);

/// Receiver half stored in `OpState` so `op_next_event` can await UI events.
/// Wrapped in an async `Mutex<...>` behind an `Rc` so the op can clone the
/// handle out and await without holding the `OpState` borrow.
struct EventReceiver(Rc<Mutex<UnboundedReceiver<UiEvent>>>);

/// JS -> Bevy: ship one commit's worth of mutation ops. Synchronous; just
/// pushes onto the channel Bevy drains each frame.
#[op2]
fn op_flush(state: &mut OpState, #[serde] ops: Vec<Op>) {
    let sender = state.borrow::<OpSender>();
    // If Bevy has shut down the receiver, dropping the ops is fine.
    let _ = sender.0.send(ops);
}

/// Bevy -> JS: resolve with the next UI event, or `null` once Bevy drops the
/// sender (app shutting down). Async so the JS event loop parks here cheaply
/// instead of polling.
#[op2]
#[serde]
async fn op_next_event(state: Rc<RefCell<OpState>>) -> Option<UiEvent> {
    let receiver = {
        let state = state.borrow();
        state.borrow::<EventReceiver>().0.clone()
    };
    let mut guard = receiver.lock().await;
    guard.recv().await
}

/// JS globals deno_core does not provide on its own. React's scheduler probes
/// for `setTimeout`; with synchronous (legacy) rendering it is never actually
/// used to drive work, so a microtask-backed shim is sufficient.
const PRELUDE: &str = r#"
globalThis.setTimeout = (cb, _ms, ...args) => { Promise.resolve().then(() => cb(...args)); return 0; };
globalThis.clearTimeout = () => {};
globalThis.setInterval = () => 0;
globalThis.clearInterval = () => {};
globalThis.queueMicrotask = globalThis.queueMicrotask || ((cb) => { Promise.resolve().then(cb); });
"#;

/// Spawn the JS thread. Returns immediately; the thread runs until the bundle's
/// event loop ends (which happens when `events_rx`'s sender is dropped).
pub fn spawn_js_thread(
    bundle_path: PathBuf,
    ops_tx: Sender<Vec<Op>>,
    events_rx: UnboundedReceiver<UiEvent>,
) {
    std::thread::Builder::new()
        .name("js-runtime".to_string())
        .spawn(move || {
            let rt = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .expect("build current-thread tokio runtime");
            if let Err(e) = rt.block_on(run(bundle_path, ops_tx, events_rx)) {
                eprintln!("[js] runtime error: {e:?}");
            }
        })
        .expect("spawn js-runtime thread");
}

async fn run(
    bundle_path: PathBuf,
    ops_tx: Sender<Vec<Op>>,
    events_rx: UnboundedReceiver<UiEvent>,
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

    // Stash the channel endpoints where the ops can reach them.
    {
        let op_state = runtime.op_state();
        let mut op_state = op_state.borrow_mut();
        op_state.put(OpSender(ops_tx));
        op_state.put(EventReceiver(Rc::new(Mutex::new(events_rx))));
    }

    // Install missing globals before loading the (ESM) React bundle.
    runtime.execute_script("[prelude]", PRELUDE)?;

    let bundle_code = std::fs::read_to_string(&bundle_path)
        .map_err(|e| anyhow::anyhow!("reading bundle {}: {e}", bundle_path.display()))?;
    let main_module = resolve_path(
        bundle_path.to_string_lossy().as_ref(),
        &std::env::current_dir()?,
    )?;

    let mod_id = runtime
        .load_main_es_module_from_code(&main_module, bundle_code)
        .await?;
    let eval = runtime.mod_evaluate(mod_id);

    // The bundle's top-level `await eventLoop()` keeps an `op_next_event`
    // future pending, so the event loop stays alive and parks on events until
    // Bevy drops the sender.
    runtime.run_event_loop(Default::default()).await?;
    eval.await?;
    Ok(())
}
