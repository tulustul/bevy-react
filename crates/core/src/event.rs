//! Bevy → React named events: an app-level signal pushed from the ECS to the
//! listeners the React app registers with `bevy.on(name, cb)`.
//!
//! Unlike a [`UiEvent`](crate::protocol::UiEvent) (a click on a specific node),
//! a [`ReactEvent`] is a named, typed broadcast. Send one from any system with
//! the [`ReactEvents`] param:
//!
//! ```ignore
//! use bevy::prelude::*;
//! use bevy_react::{react_event, ReactEvents};
//!
//! #[react_event(name = "user.disconnected")]
//! struct UserDisconnected { user_id: String }
//!
//! fn on_drop(mut events: ReactEvents) {
//!     events.send(&UserDisconnected { user_id: "abc".into() });
//! }
//! ```

use std::any::TypeId;
use std::collections::HashMap;

use bevy::ecs::system::SystemParam;
use bevy::prelude::*;
use serde::Serialize;
use ts_rs::TS;

use crate::bridge::OutboundResource;
use crate::protocol::Outbound;
use crate::registry::{NamedEntry, register_entry};
use crate::ts_codegen::TsCollector;

/// A typed payload Bevy sends to React as a named event. Out-only — it is never
/// deserialized on the Rust side, so it derives `Serialize` (not `Deserialize`).
///
/// Usually derived with [`#[react_event]`](crate::react_event).
pub trait ReactEvent: Serialize + TS + Send + Sync + 'static {
    /// The event name React listens for, e.g. `"user.disconnected"`. Defaults to
    /// the struct ident with its first letter lowercased.
    const NAME: &'static str;
}

/// System param for sending [`ReactEvent`]s to the React app.
#[derive(SystemParam)]
pub struct ReactEvents<'w> {
    out: Res<'w, OutboundResource>,
}

impl ReactEvents<'_> {
    /// Push `event` to every React listener registered for `E::NAME`.
    // TODO(review): `send` works whether or not `E` was registered via `add_react_event`, but
    // the generated TS typings only include REGISTERED events — so you can ship an event that
    // never appears in `bevy.on`'s types (silent drift, in the untyped-works direction).
    // Consider a debug-only warning when sending an unregistered event.
    pub fn send<E: ReactEvent>(&self, event: &E) {
        match serde_json::to_value(event) {
            Ok(value) => {
                let _ = self.out.0.send(Outbound::Event {
                    name: E::NAME.to_string(),
                    value,
                });
            }
            Err(e) => error!("serialize react event {:?}: {e}", E::NAME),
        }
    }
}

/// TypeScript metadata for one registered event type (export-only).
pub(crate) struct EventRegistration {
    type_id: TypeId,
    /// The event payload's TypeScript reference name.
    pub(crate) ts_name: fn() -> String,
    /// Collects the payload's type declaration (and its dependencies).
    pub(crate) ts_collect: fn(&mut TsCollector),
}

/// Known Bevy → React event types, keyed by name. Used only by the TypeScript
/// exporter — sending an event does not require registration, but registering
/// makes it appear in the generated `bevy.on` typing.
#[derive(Resource, Default)]
pub(crate) struct ReactEventRegistry {
    pub(crate) handlers: HashMap<&'static str, EventRegistration>,
}

impl NamedEntry for EventRegistration {
    fn type_id(&self) -> TypeId {
        self.type_id
    }
}

impl ReactEventRegistry {
    /// Record event type `E` for export. Idempotent per type; warns only if a
    /// different type already owns `E::NAME`.
    pub(crate) fn register<E: ReactEvent>(&mut self) {
        register_entry(
            &mut self.handlers,
            E::NAME,
            "event",
            EventRegistration {
                type_id: TypeId::of::<E>(),
                ts_name: <E as TS>::name,
                ts_collect: |c| c.add::<E>(),
            },
        );
    }
}
