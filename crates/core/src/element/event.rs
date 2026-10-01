//! [`ElementEvent`] — an element's own event (`onChange`, `onResize`, …):
//! declared on the element, sent from the element's Rust systems with
//! [`ElementEvents`], delivered to the node's `on<Name>` handler with the
//! payload as its argument.

use std::any::TypeId;
use std::collections::BTreeMap;
use std::marker::PhantomData;

use bevy::ecs::system::SystemParam;
use bevy::prelude::*;
use serde::Serialize;

use crate::bridge::{OutboundResource, ReactNode};
use crate::protocol::outbound::Outbound;
use crate::ts_codegen::TsCollector;

/// One element event. Declare it as a `static`, list it in an
/// [`Element`](super::Element)'s `events`, and send it with
/// [`ElementEvents::send`]. The handler prop is `on` + the capitalized name
/// (`"change"` → `onChange`); its argument is the payload (none for a `()`
/// payload).
pub struct ElementEvent<T: 'static> {
    /// The event name (the handler prop without `on`).
    pub name: &'static str,
    /// Send even when the node declares no handler — for an event the
    /// runtime itself consumes (the canvas's `resize`).
    pub always: bool,
    ts_name: fn() -> String,
    ts_collect: fn(&mut TsCollector),
    _payload: PhantomData<fn(T)>,
}

impl<T: Serialize + ts_rs::TS + 'static> ElementEvent<T> {
    /// An event named `name`, sent only to nodes with a handler.
    pub const fn new(name: &'static str) -> Self {
        Self {
            name,
            always: false,
            ts_name: crate::ts_codegen::ts_name::<T>,
            ts_collect: crate::ts_codegen::ts_collect::<T>,
            _payload: PhantomData,
        }
    }

    /// Send the event even to nodes without a handler.
    pub const fn unconditional(self) -> Self {
        Self {
            always: true,
            ..self
        }
    }
}

mod sealed {
    pub trait Sealed {}
}

impl<T> sealed::Sealed for ElementEvent<T> {}

/// The type-erased view of an [`ElementEvent`] (sealed).
pub trait AnyElementEvent: sealed::Sealed + Send + Sync + 'static {
    fn name(&self) -> &'static str;
    /// Whether the payload is `()` (a no-argument handler).
    fn is_unit(&self) -> bool;
    /// The payload's TypeScript type.
    fn ts_payload(&self) -> String;
    /// Add the TS declarations the payload type needs.
    fn ts_decls(&self, decls: &mut BTreeMap<String, String>);
}

impl<T: 'static> AnyElementEvent for ElementEvent<T> {
    fn name(&self) -> &'static str {
        self.name
    }
    fn is_unit(&self) -> bool {
        TypeId::of::<T>() == TypeId::of::<()>()
    }
    fn ts_payload(&self) -> String {
        (self.ts_name)()
    }
    fn ts_decls(&self, decls: &mut BTreeMap<String, String>) {
        if self.is_unit() {
            return;
        }
        let mut collector = TsCollector::default();
        (self.ts_collect)(&mut collector);
        decls.extend(collector.decls);
    }
}

impl std::fmt::Debug for dyn AnyElementEvent {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "ElementEvent({:?})", self.name())
    }
}

/// The handler prop of an event named `name`: `on` + the capitalized name.
pub fn handler_prop(name: &str) -> String {
    let mut chars = name.chars();
    match chars.next() {
        Some(first) => format!("on{}{}", first.to_uppercase(), chars.as_str()),
        None => "on".to_owned(),
    }
}

/// The element events a node has a handler for — the gate
/// [`ElementEvents::send`] checks (an `always` event skips it). Kept in sync
/// with the node's handler props by the op-apply path; present only on nodes
/// whose element declares events.
#[derive(Component, Debug, Default, Clone)]
pub struct EventSubscriptions(pub(crate) Vec<&'static dyn AnyElementEvent>);

impl EventSubscriptions {
    /// Whether the node has a handler for `event`.
    pub fn contains(&self, event: &dyn AnyElementEvent) -> bool {
        self.0.iter().any(|e| same_event(*e, event))
    }
}

fn same_event(a: &dyn AnyElementEvent, b: &dyn AnyElementEvent) -> bool {
    std::ptr::addr_eq(
        a as *const dyn AnyElementEvent,
        b as *const dyn AnyElementEvent,
    )
}

/// System param for sending an element's own events to its React node.
#[derive(SystemParam)]
pub struct ElementEvents<'w, 's> {
    out: Option<Res<'w, OutboundResource>>,
    nodes: Query<'w, 's, (&'static ReactNode, Option<&'static EventSubscriptions>)>,
}

impl ElementEvents<'_, '_> {
    /// Send `event` with `payload` to `entity`'s node — when the node has a
    /// handler for it (or the event is `always`). Returns whether it was
    /// sent.
    pub fn send<T: Serialize + 'static>(
        &self,
        entity: Entity,
        event: &'static ElementEvent<T>,
        payload: &T,
    ) -> bool {
        let Ok((node, subscriptions)) = self.nodes.get(entity) else {
            return false;
        };
        if !event.always && !subscriptions.is_some_and(|s| s.contains(event)) {
            return false;
        }
        let Some(out) = self.out.as_ref() else {
            return false;
        };
        send_to(&out.0, node.0, event, payload)
    }

    /// Whether `entity`'s node has a handler for `event`.
    pub fn subscribed<T: 'static>(&self, entity: Entity, event: &'static ElementEvent<T>) -> bool {
        self.nodes
            .get(entity)
            .is_ok_and(|(_, s)| s.is_some_and(|s| s.contains(event)))
    }
}

/// Send one element event over the outbound channel.
pub(crate) fn send_to<T: Serialize + 'static>(
    out: &crate::bridge::OutboundSender,
    id: crate::protocol::NodeId,
    event: &'static ElementEvent<T>,
    payload: &T,
) -> bool {
    let payload = if TypeId::of::<T>() == TypeId::of::<()>() {
        serde_json::Value::Null
    } else {
        match serde_json::to_value(payload) {
            Ok(v) => v,
            Err(e) => {
                tracing::error!("serialize element event {:?}: {e}", event.name);
                return false;
            }
        }
    };
    out.send(Outbound::ElementEvent {
        id,
        event: event.name.to_owned(),
        payload,
    })
    .is_ok()
}
