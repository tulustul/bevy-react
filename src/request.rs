//! React → Bevy request/response: a correlated, awaitable call from the React
//! app that a Bevy observer answers with a typed reply.
//!
//! Where [`emit`](crate::ReactMessage) is fire-and-forget, a request carries a
//! correlation id: the JS side `await`s `request(name, value)`, the plugin routes
//! it to the typed [`Request<T>`] the user observes, and the observer replies via
//! a [`Responder`] — which sends an [`Outbound::Response`] back on the same id so
//! the JS promise resolves.
//!
//! ```ignore
//! use bevy::prelude::*;
//! use bevy_react::{react_request, Request, ReactAppExt};
//!
//! #[react_request(name = "board.get", response = Board)]
//! struct BoardGet; // unit payload → `bevy.board.get()` takes no args
//!
//! app.add_react_request_handler(|req: On<Request<BoardGet>>, board: Res<Board>| {
//!     req.respond(board.clone());
//! });
//! ```

use std::any::TypeId;
use std::collections::HashMap;
use std::marker::PhantomData;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use bevy::ecs::event::GlobalTrigger;
use bevy::prelude::*;
use serde::Serialize;
use serde::de::DeserializeOwned;
use ts_rs::TS;

use crate::bridge::{OutboundResource, OutboundSender};
use crate::message::TsCollector;
use crate::protocol::{Outbound, ResponseResult};

/// The raw wire form of a request crossing JS → Bevy: a correlation `id`, the
/// request `name`, and the JSON payload. Routed by [`ReactRequestRegistry`].
pub struct RawRequest {
    pub id: u64,
    pub name: String,
    pub value: serde_json::Value,
}

/// A typed request payload a React `request(NAME, value)` call deserializes into,
/// paired with the typed reply it resolves to.
///
/// Usually derived with [`#[react_request]`](crate::react_request), which derives
/// `Deserialize` + `TS` and implements this trait. The response type is one you
/// define separately and derive `Serialize` + `TS` on.
pub trait ReactRequest: DeserializeOwned + TS + Send + Sync + 'static {
    /// The request name, e.g. `"board.get"`. Dotted names become nested proxy
    /// methods (`bevy.board.get`). Defaults to the struct ident with its first
    /// letter lowercased.
    const NAME: &'static str;
    /// The typed value this request resolves to on the JS side.
    type Response: Serialize + TS + Send + Sync + 'static;
}

/// Replies to a single React request, correlated by id.
///
/// `Clone + Send + Sync`, so a handler may store or move it and respond a later
/// frame (a deferred reply). Responding more than once is a logged no-op.
pub struct Responder<R> {
    id: u64,
    tx: OutboundSender,
    done: Arc<AtomicBool>,
    // `fn() -> R` keeps `Responder<R>: Send + Sync` regardless of `R`.
    _marker: PhantomData<fn() -> R>,
}

impl<R> Clone for Responder<R> {
    fn clone(&self) -> Self {
        Self {
            id: self.id,
            tx: self.tx.clone(),
            done: self.done.clone(),
            _marker: PhantomData,
        }
    }
}

impl<R: Serialize> Responder<R> {
    fn new(id: u64, tx: OutboundSender) -> Self {
        Self {
            id,
            tx,
            done: Arc::new(AtomicBool::new(false)),
            _marker: PhantomData,
        }
    }

    /// Resolve the React promise with `value`.
    pub fn respond(&self, value: R) {
        if !self.claim() {
            return;
        }
        let result = match serde_json::to_value(&value) {
            Ok(value) => ResponseResult::Ok { value },
            Err(e) => ResponseResult::Err {
                message: format!("serialize response: {e}"),
            },
        };
        let _ = self.tx.send(Outbound::Response {
            id: self.id,
            result,
        });
    }

    /// Reject the React promise with an error message.
    pub fn respond_err(&self, message: impl Into<String>) {
        if !self.claim() {
            return;
        }
        let _ = self.tx.send(Outbound::Response {
            id: self.id,
            result: ResponseResult::Err {
                message: message.into(),
            },
        });
    }

    /// Returns true the first time; warns and returns false on later calls, so a
    /// double-respond can't settle the JS promise twice.
    fn claim(&self) -> bool {
        if self.done.swap(true, Ordering::SeqCst) {
            warn!(
                "react request {} responded to more than once; ignoring",
                self.id
            );
            false
        } else {
            true
        }
    }
}

/// What a request handler observes: the deserialized `payload` plus a
/// [`Responder`] to reply with. Observe it with `On<Request<T>>`.
pub struct Request<T: ReactRequest> {
    payload: T,
    responder: Responder<T::Response>,
}

impl<T: ReactRequest> Request<T> {
    /// The deserialized request payload.
    pub fn payload(&self) -> &T {
        &self.payload
    }

    /// Take ownership of the payload.
    pub fn into_payload(self) -> T {
        self.payload
    }

    /// A clone of the responder, for replying later (e.g. from another system).
    pub fn responder(&self) -> Responder<T::Response> {
        self.responder.clone()
    }

    /// Resolve the React promise with `value`.
    pub fn respond(&self, value: T::Response) {
        self.responder.respond(value);
    }

    /// Reject the React promise with an error message.
    pub fn respond_err(&self, message: impl Into<String>) {
        self.responder.respond_err(message);
    }
}

impl<T: ReactRequest> Event for Request<T> {
    type Trigger<'a> = GlobalTrigger;
}

/// Lets [`ReactAppExt::add_react_request_handler`](crate::ReactAppExt::add_react_request_handler)
/// recover the request type `T` from an `On<Request<T>>` observer, whose event
/// type is `Request<T>`.
pub trait RequestEvent {
    type Req: ReactRequest;
}

impl<T: ReactRequest> RequestEvent for Request<T> {
    type Req = T;
}

/// Deserialize-and-trigger (or error-reply) closure for one request type.
type RequestHandler = Box<dyn Fn(RawRequest, &OutboundSender, &mut Commands) + Send + Sync>;

/// What we record per registered request: dispatch plus the TypeScript metadata
/// the exporter needs to mirror the request/response pair.
pub(crate) struct RequestRegistration {
    type_id: TypeId,
    handler: RequestHandler,
    /// The request payload's TypeScript reference name.
    pub(crate) ts_request_name: fn() -> String,
    /// The response's TypeScript reference name.
    pub(crate) ts_response_name: fn() -> String,
    /// Whether the request payload is void (a unit struct → no proxy argument).
    pub(crate) request_is_void: fn() -> bool,
    /// Collects the request and response type declarations (and dependencies).
    pub(crate) ts_collect: fn(&mut TsCollector),
}

/// Type-erased request handlers keyed by `request` name. Owned by the plugin; the
/// single dispatch system looks up each incoming request here.
#[derive(Resource, Default)]
pub(crate) struct ReactRequestRegistry {
    pub(crate) handlers: HashMap<&'static str, RequestRegistration>,
}

impl ReactRequestRegistry {
    /// Register the deserialize-and-trigger handler for request `T`. Idempotent
    /// per type; warns only if a different type already owns `T::NAME`.
    pub(crate) fn register<T: ReactRequest>(&mut self) {
        let type_id = TypeId::of::<T>();
        if let Some(existing) = self.handlers.get(T::NAME) {
            if existing.type_id == type_id {
                return;
            }
            warn!(
                "react request {:?} is registered by two different types; replacing the previous handler",
                T::NAME
            );
        }
        self.handlers.insert(
            T::NAME,
            RequestRegistration {
                type_id,
                handler: Box::new(|raw, tx, commands| {
                    // `T` is concrete here, so serde and the trigger are baked in.
                    let responder = Responder::<T::Response>::new(raw.id, tx.clone());
                    match serde_json::from_value::<T>(raw.value) {
                        Ok(payload) => commands.trigger(Request { payload, responder }),
                        Err(e) => {
                            responder.respond_err(format!("malformed request {:?}: {e}", T::NAME))
                        }
                    }
                }),
                ts_request_name: <T as TS>::name,
                ts_response_name: <T::Response as TS>::name,
                // A unit-struct payload renders inline as `null` in ts-rs.
                request_is_void: || <T as TS>::inline() == "null",
                ts_collect: |c| {
                    // A void payload is only ever used inline as `null`, so skip its
                    // (dead) `type X = null` declaration; always declare the response.
                    if <T as TS>::inline() != "null" {
                        c.add::<T>();
                    }
                    c.add::<T::Response>();
                },
            },
        );
    }

    /// Route one request: deserialize into its registered payload and trigger it,
    /// or reply with an error so the JS promise rejects rather than hangs.
    pub(crate) fn dispatch(&self, raw: RawRequest, tx: &OutboundSender, commands: &mut Commands) {
        match self.handlers.get(raw.name.as_str()) {
            Some(reg) => (reg.handler)(raw, tx, commands),
            None => {
                let _ = tx.send(Outbound::Response {
                    id: raw.id,
                    result: ResponseResult::Err {
                        message: format!("no handler registered for request {:?}", raw.name),
                    },
                });
            }
        }
    }
}

/// Receives requests sent by the React app (`request(name, value)`).
#[derive(Resource)]
pub(crate) struct RequestReceiver(pub(crate) crossbeam_channel::Receiver<RawRequest>);

/// The single consumption point for React requests. Drains the channel each frame
/// (in `PreUpdate`, like the message dispatcher) and routes each request to its
/// registered handler, which triggers a [`Request<T>`] or replies with an error.
pub(crate) fn dispatch_react_requests(
    rx: Res<RequestReceiver>,
    registry: Res<ReactRequestRegistry>,
    out: Res<OutboundResource>,
    mut commands: Commands,
) {
    while let Ok(raw) = rx.0.try_recv() {
        registry.dispatch(raw, &out.0, &mut commands);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ReactAppExt;
    use bevy::ecs::world::CommandQueue;
    use tokio::sync::mpsc::{UnboundedReceiver, unbounded_channel};

    #[crate::react_request(name = "ping", response = Pong)]
    struct Ping {
        n: u32,
    }

    #[derive(serde::Serialize, ts_rs::TS)]
    struct Pong {
        n: u32,
    }

    /// Route one request through the registry, applying the trigger it queues so the
    /// observer runs (and responds) before we inspect the outbound channel.
    fn dispatch(app: &mut App, tx: &OutboundSender, raw: RawRequest) {
        app.world_mut()
            .resource_scope(|world, registry: Mut<ReactRequestRegistry>| {
                let mut queue = CommandQueue::default();
                let mut commands = Commands::new(&mut queue, world);
                registry.dispatch(raw, tx, &mut commands);
                queue.apply(world);
            });
    }

    fn raw(id: u64, name: &str, value: serde_json::Value) -> RawRequest {
        RawRequest {
            id,
            name: name.into(),
            value,
        }
    }

    /// A registered request reaches its observer, which replies with a typed value
    /// surfaced as an `Outbound::Response { Ok }` on the matching id.
    #[test]
    fn dispatches_and_responds() {
        let mut app = App::new();
        app.add_react_request_handler(|req: On<Request<Ping>>| {
            let n = req.payload().n;
            req.respond(Pong { n: n + 1 });
        });
        let (tx, mut rx): (OutboundSender, UnboundedReceiver<Outbound>) = unbounded_channel();

        dispatch(
            &mut app,
            &tx,
            raw(7, "ping", serde_json::json!({ "n": 41 })),
        );

        match rx.try_recv() {
            Ok(Outbound::Response {
                id,
                result: ResponseResult::Ok { value },
            }) => {
                assert_eq!(id, 7);
                assert_eq!(value, serde_json::json!({ "n": 42 }));
            }
            other => panic!("expected Ok response, got {other:?}"),
        }
    }

    /// An unknown request name replies with an error so the JS promise rejects
    /// rather than hanging.
    #[test]
    fn unknown_name_replies_err() {
        let mut app = App::new();
        app.init_resource::<ReactRequestRegistry>();
        let (tx, mut rx): (OutboundSender, UnboundedReceiver<Outbound>) = unbounded_channel();

        dispatch(&mut app, &tx, raw(1, "nope", serde_json::json!(null)));

        assert!(matches!(
            rx.try_recv(),
            Ok(Outbound::Response {
                id: 1,
                result: ResponseResult::Err { .. },
            })
        ));
    }

    /// A payload that doesn't match the registered type replies with an error and
    /// never reaches the observer.
    #[test]
    fn malformed_payload_replies_err() {
        let mut app = App::new();
        app.add_react_request_handler(|req: On<Request<Ping>>| req.respond(Pong { n: 0 }));
        let (tx, mut rx): (OutboundSender, UnboundedReceiver<Outbound>) = unbounded_channel();

        dispatch(
            &mut app,
            &tx,
            raw(2, "ping", serde_json::json!({ "n": "nope" })),
        );

        assert!(matches!(
            rx.try_recv(),
            Ok(Outbound::Response {
                id: 2,
                result: ResponseResult::Err { .. },
            })
        ));
    }

    /// Responding twice settles the promise once; the second reply is dropped.
    #[test]
    fn respond_twice_sends_once() {
        let mut app = App::new();
        app.add_react_request_handler(|req: On<Request<Ping>>| {
            req.respond(Pong { n: 1 });
            req.respond(Pong { n: 2 }); // ignored
        });
        let (tx, mut rx): (OutboundSender, UnboundedReceiver<Outbound>) = unbounded_channel();

        dispatch(&mut app, &tx, raw(3, "ping", serde_json::json!({ "n": 0 })));

        assert!(matches!(
            rx.try_recv(),
            Ok(Outbound::Response {
                result: ResponseResult::Ok { .. },
                ..
            })
        ));
        assert!(rx.try_recv().is_err(), "second respond must not send");
    }
}
