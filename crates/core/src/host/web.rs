//! Web JS host: React runs in the browser's own JS engine, so there is no V8
//! isolate, no thread, and no filesystem. We instead expose the op surface on
//! `globalThis.__bevyHost` (the same methods `bridge.ts` calls), back the JS→Bevy
//! ops with the shared crossbeam channels, and push Bevy→JS events from a per-frame
//! Bevy system.
//!
//! Boot order on web: the wasm module's entry point builds the `App` (this runs in
//! [`spawn`], installing `__bevyHost`) and starts Bevy; the HTML page then loads
//! `vendor.js` + `app.js`, which read `__bevyHost` already present on `globalThis`.

use std::cell::RefCell;
use std::collections::VecDeque;

use bevy::prelude::*;
use crossbeam_channel::{Receiver, Sender};
use js_sys::{Function, Object, Promise, Reflect};
use serde::Serialize;
use wasm_bindgen::prelude::*;

use bevy_react_animations::AnimationCommand;

use crate::bridge::OutboundSender;
use crate::message::ReactMessage;
use crate::protocol::{Op, Outbound};
use crate::request::RawRequest;

use super::{HostConfig, HostSenders};

/// Singleton host state. wasm is single-threaded, so a thread-local is the natural
/// home: the op closures (called from JS) and the drain system (a Bevy system on
/// the same thread) both reach it here without `Send` plumbing.
struct WebHost {
    // JS → Bevy: the same crossbeam senders every target uses.
    ops: Sender<Vec<Op>>,
    emit: Sender<ReactMessage>,
    request: Sender<RawRequest>,
    anim: Sender<AnimationCommand>,
    // Bevy → JS: events waiting for a JS `op_next_event` caller, and the `resolve`
    // callbacks of callers parked on `op_next_event`. At most one side is ever
    // non-empty — an arriving event resolves a waiter immediately, else it queues.
    pending_events: VecDeque<JsValue>,
    waiters: VecDeque<Function>,
}

thread_local! {
    static HOST: RefCell<Option<WebHost>> = const { RefCell::new(None) };
}

/// Wire the web host into `app` and return the sender outbound producers use.
pub(crate) fn spawn(app: &mut App, _config: HostConfig, senders: HostSenders) -> OutboundSender {
    console_error_panic_hook::set_once();

    // Bevy → JS over a crossbeam channel drained each frame (no async needed — the
    // page's engine runs React on the same thread).
    let (outbound_tx, outbound_rx) = crossbeam_channel::unbounded::<Outbound>();

    HOST.with(|h| {
        *h.borrow_mut() = Some(WebHost {
            ops: senders.ops,
            emit: senders.emit,
            request: senders.request,
            anim: senders.anim,
            pending_events: VecDeque::new(),
            waiters: VecDeque::new(),
        });
    });

    let host_obj = install_host_object();
    let global: JsValue = js_sys::global().into();
    Reflect::set(&global, &JsValue::from_str("__bevyHost"), &host_obj)
        .expect("install globalThis.__bevyHost");

    app.insert_resource(OutboundDrain(outbound_rx))
        .add_systems(Last, drain_outbound);

    outbound_tx
}

/// Build the `__bevyHost` object: the same five methods `bridge.ts` calls, each
/// backed by a Rust closure. The closures are leaked (`forget`) — the host lives
/// for the whole program, so there is nothing to free.
fn install_host_object() -> Object {
    let host = Object::new();

    // op_flush(ops): JS → Bevy, a commit's worth of mutation ops.
    let flush =
        Closure::<dyn Fn(JsValue)>::new(|ops: JsValue| {
            match serde_wasm_bindgen::from_value::<Vec<Op>>(ops) {
                Ok(batch) => with_host(|h| {
                    let _ = h.ops.send(batch);
                }),
                Err(e) => error(&format!("op_flush decode: {e}")),
            }
        });
    set_method(&host, "op_flush", flush.as_ref());
    flush.forget();

    // op_emit(name, value): JS → Bevy, a named app message.
    let emit = Closure::<dyn Fn(JsValue, JsValue)>::new(|name: JsValue, value: JsValue| {
        let name = name.as_string().unwrap_or_default();
        let value = serde_wasm_bindgen::from_value(value).unwrap_or(serde_json::Value::Null);
        with_host(|h| {
            let _ = h.emit.send(ReactMessage { name, value });
        });
    });
    set_method(&host, "op_emit", emit.as_ref());
    emit.forget();

    // op_request(id, name, value): JS → Bevy, a correlated request. `id` is a BigInt.
    let request =
        Closure::<dyn Fn(JsValue, JsValue, JsValue)>::new(|id: JsValue, name: JsValue, value| {
            let id = bigint_to_u64(&id);
            let name = name.as_string().unwrap_or_default();
            let value = serde_wasm_bindgen::from_value(value).unwrap_or(serde_json::Value::Null);
            with_host(|h| {
                let _ = h.request.send(RawRequest { id, name, value });
            });
        });
    set_method(&host, "op_request", request.as_ref());
    request.forget();

    // op_animate(cmd): JS → Bevy, an animation command.
    let animate = Closure::<dyn Fn(JsValue)>::new(|cmd: JsValue| {
        match serde_wasm_bindgen::from_value::<AnimationCommand>(cmd) {
            Ok(cmd) => with_host(|h| {
                let _ = h.anim.send(cmd);
            }),
            Err(e) => error(&format!("op_animate decode: {e}")),
        }
    });
    set_method(&host, "op_animate", animate.as_ref());
    animate.forget();

    // op_next_event() -> Promise<Outbound | null>: Bevy → JS pull. Resolves from the
    // queue if an event is waiting, else parks until the drain system delivers one.
    let next = Closure::<dyn Fn() -> Promise>::new(next_event_promise);
    set_method(&host, "op_next_event", next.as_ref());
    next.forget();

    host
}

/// `op_next_event`: hand back the next queued event, or a Promise that the drain
/// system resolves when one arrives. The `Promise::new` executor runs synchronously,
/// so the `resolve` handle is captured before we return.
fn next_event_promise() -> Promise {
    HOST.with(|h| {
        let mut guard = h.borrow_mut();
        let host = guard.as_mut().expect("host installed before op_next_event");
        if let Some(ev) = host.pending_events.pop_front() {
            Promise::resolve(&ev)
        } else {
            let mut resolve_slot: Option<Function> = None;
            let promise = Promise::new(&mut |resolve, _reject| resolve_slot = Some(resolve));
            host.waiters
                .push_back(resolve_slot.expect("Promise executor runs synchronously"));
            promise
        }
    })
}

/// The Bevy → JS receiver, drained each frame in `Last`.
#[derive(Resource)]
struct OutboundDrain(Receiver<Outbound>);

/// Push every pending Bevy event to the JS side: resolve a parked `op_next_event`
/// caller if one exists, else queue the event for the next call. `resolve()` only
/// schedules a microtask, so React handlers run after this system returns (and the
/// resulting `op_flush` lands next frame) — no re-entrancy into the host borrow.
fn drain_outbound(drain: Res<OutboundDrain>) {
    while let Ok(ev) = drain.0.try_recv() {
        // serde_json `Value`s inside `Outbound` must become plain JS objects, not JS
        // `Map`s, or the bridge can't read them; u64 ids stay JS numbers (default).
        let serializer = serde_wasm_bindgen::Serializer::new().serialize_maps_as_objects(true);
        let js = match ev.serialize(&serializer) {
            Ok(v) => v,
            Err(e) => {
                error(&format!("outbound encode: {e}"));
                continue;
            }
        };
        // Pop a waiter (or queue) inside the borrow; call `resolve` after releasing it.
        let resolve = with_host(|h| match h.waiters.pop_front() {
            Some(resolve) => Some(resolve),
            None => {
                h.pending_events.push_back(js.clone());
                None
            }
        });
        if let Some(resolve) = resolve {
            let _ = resolve.call1(&JsValue::NULL, &js);
        }
    }
}

/// Run `f` with the installed host. The host is set in [`spawn`] before any op can
/// fire, so absence is a bug; we no-op rather than panic across the JS boundary.
fn with_host<R: Default>(f: impl FnOnce(&mut WebHost) -> R) -> R {
    HOST.with(|h| match h.borrow_mut().as_mut() {
        Some(host) => f(host),
        None => R::default(),
    })
}

/// Convert a JS `BigInt` (how `bridge.ts` passes request ids) to `u64` via its
/// base-10 string — ids stay well under 2^53 in practice.
fn bigint_to_u64(v: &JsValue) -> u64 {
    js_sys::BigInt::new(v)
        .ok()
        .and_then(|b| b.to_string(10).ok())
        .map(String::from)
        .and_then(|s| s.parse().ok())
        .unwrap_or(0)
}

fn set_method(host: &Object, name: &str, f: &JsValue) {
    Reflect::set(host.as_ref(), &JsValue::from_str(name), f).expect("set host method");
}

fn error(msg: &str) {
    web_sys::console::error_1(&JsValue::from_str(msg));
}
