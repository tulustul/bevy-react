//! Typed app messages emitted by the React app for the Bevy world to consume.
//!
//! This is the complement to the UI bridge: where ops describe UI mutations, an
//! app message carries an app-level signal (e.g. "set the count") from React
//! into the ECS. The JS side calls `emit(name, value)`; the plugin owns a single
//! consumption point that routes each message by name to the typed payload the
//! user registered with [`ReactAppExt::add_react_handler`], deserializing the
//! JSON for them and triggering it for [observers](bevy::ecs::observer) to handle.
//!
//! ```ignore
//! use bevy::prelude::*;
//! use bevy_react::{react_message, ReactAppExt};
//!
//! #[react_message]
//! struct Count(usize); // name defaults to "count"
//!
//! app.add_react_handler(|on: On<Count>| {
//!     let n = on.event().0; // typed — no serde_json::Value juggling
//! });
//! ```

use std::any::TypeId;
use std::collections::HashMap;
use std::path::Path;

use bevy::ecs::system::IntoObserverSystem;
use bevy::prelude::*;
use serde::de::DeserializeOwned;
use ts_rs::TS;

use crate::event::{ReactEvent, ReactEventRegistry};
use crate::request::{ReactRequest, ReactRequestRegistry, RequestEvent};
use crate::ts_codegen::TsCollector;

/// A named, JSON-valued signal sent from the React app to Bevy.
///
/// This is the raw wire form carried across the JS↔Bevy channel. Consumers
/// don't read it directly: register a typed [`ReactPayload`] and observe that
/// instead. The plugin deserializes the [`value`](ReactMessage::value) into the
/// payload type whose [`ReactPayload::NAME`] matches [`name`](ReactMessage::name).
#[derive(Clone, Debug)]
pub struct ReactMessage {
    /// Application-defined message name (the first argument to `emit`).
    pub name: String,
    /// The payload (the second argument to `emit`), as JSON.
    pub value: serde_json::Value,
}

/// A typed payload a React `emit(NAME, value)` call deserializes into.
///
/// Usually you don't implement this by hand — apply [`#[react_message]`](crate::react_message),
/// which derives `Deserialize` and `TS` and implements both `Event` and this trait. The
/// JSON `value` is deserialized straight into `Self`, so the payload's shape must
/// match what JS emits: `emit("count", 5)` needs a payload that deserializes from
/// a number (e.g. `struct Count(usize)`), while `emit("move", { x, y })` needs a struct.
///
/// The [`TS`] bound lets [`ReactAppExt::export_react_typescript`] mirror the payload's
/// shape into a TypeScript type, so the JS `emit` is type-checked against the same struct.
pub trait ReactPayload: Event + DeserializeOwned + TS + Send + Sync + 'static {
    /// The `emit` name this type is routed from.
    const NAME: &'static str;
}

/// Type-erased deserialize-and-trigger closures keyed by `emit` name. Owned by
/// the plugin; the single dispatch system looks up each incoming message here.
/// The [`TypeId`] lets us treat re-registering the *same* payload (e.g. attaching
/// several observers via [`ReactAppExt::add_react_handler`]) as a harmless no-op,
/// while still warning when two *different* types claim one name.
#[derive(Resource, Default)]
pub(crate) struct ReactRegistry {
    pub(crate) handlers: HashMap<&'static str, Registration>,
}

/// What we record per registered payload: the dispatch closure plus the TypeScript
/// metadata [`ReactAppExt::export_react_typescript`] needs to mirror the type.
pub(crate) struct Registration {
    /// Distinguishes re-registering the same type (a no-op) from a name collision.
    type_id: TypeId,
    /// Deserialize-and-trigger for this payload.
    handler: Handler,
    /// The payload's TypeScript reference name (e.g. `Count`), used in the message map.
    pub(crate) ts_name: fn() -> String,
    /// Records this payload's declaration and all its transitive dependencies.
    pub(crate) ts_collect: fn(&mut TsCollector),
}

/// Deserializes a JSON payload and queues a trigger for it, or returns the serde
/// error if the JSON doesn't match the registered payload type.
type Handler =
    Box<dyn Fn(serde_json::Value, &mut Commands) -> Result<(), serde_json::Error> + Send + Sync>;

impl ReactRegistry {
    /// Register the deserialize-and-trigger handler for payload `T`. Idempotent
    /// for a given type; warns only if a different type already owns `T::NAME`.
    pub(crate) fn register<T>(&mut self)
    where
        T: ReactPayload,
        for<'a> <T as Event>::Trigger<'a>: Default,
    {
        let type_id = TypeId::of::<T>();
        if let Some(existing) = self.handlers.get(T::NAME) {
            if existing.type_id == type_id {
                return; // same payload registered again — nothing to do.
            }
            warn!(
                "react message {:?} is registered by two different types; replacing the previous handler",
                T::NAME
            );
        }
        self.handlers.insert(
            T::NAME,
            Registration {
                type_id,
                handler: Box::new(|value, commands| {
                    // `T` is concrete here, so serde and the trigger are baked in.
                    let payload: T = serde_json::from_value(value)?;
                    commands.trigger(payload);
                    Ok(())
                }),
                // `T` is concrete here too, so its TS shape is baked into these fns.
                ts_name: T::name,
                ts_collect: |c| c.add::<T>(),
            },
        );
    }

    /// Route one message: deserialize into its registered payload and trigger it.
    /// Logs a warning for an unregistered name and an error for malformed JSON.
    pub(crate) fn dispatch(&self, msg: ReactMessage, commands: &mut Commands) {
        match self.handlers.get(msg.name.as_str()) {
            None => warn!("no handler registered for react message {:?}", msg.name),
            Some(reg) => {
                if let Err(e) = (reg.handler)(msg.value, commands) {
                    error!("malformed react message {:?}: {e}", msg.name);
                }
            }
        }
    }
}

/// Registers typed React message payloads on a Bevy [`App`].
pub trait ReactAppExt {
    /// Register a typed React message payload without attaching an observer.
    ///
    /// After this, an `emit(T::NAME, value)` from the React app deserializes
    /// `value` into `T` and triggers it. Prefer [`add_react_handler`](Self::add_react_handler)
    /// unless you want to register the type and observe it separately.
    fn add_react_message<T>(&mut self) -> &mut Self
    where
        T: ReactPayload,
        for<'a> <T as Event>::Trigger<'a>: Default;

    /// Register a payload and attach an observer for it in one call.
    ///
    /// The payload type is inferred from the observer's `On<T>` parameter, so you
    /// never name it twice. Call it again with another observer to add more
    /// handlers for the same message — registration is idempotent.
    ///
    /// ```ignore
    /// app.add_react_handler(|count: On<Count>, mut desired: ResMut<DesiredCubes>| {
    ///     desired.0 = count.event().0;
    /// });
    /// ```
    fn add_react_handler<E, B, M, S>(&mut self, observer: S) -> &mut Self
    where
        E: ReactPayload,
        for<'a> <E as Event>::Trigger<'a>: Default,
        B: Bundle,
        S: IntoObserverSystem<E, B, M>;

    /// Register a typed React request without attaching an observer. Prefer
    /// [`add_react_request_handler`](Self::add_react_request_handler).
    fn add_react_request<T>(&mut self) -> &mut Self
    where
        T: ReactRequest;

    /// Register a request and attach its observer in one call.
    ///
    /// The request type is inferred from the observer's `On<Request<T>>` parameter.
    /// The observer answers the request via [`Request::respond`](crate::Request::respond).
    ///
    /// ```ignore
    /// app.add_react_request_handler(|req: On<Request<BoardGet>>, board: Res<Board>| {
    ///     req.respond(board.clone());
    /// });
    /// ```
    fn add_react_request_handler<E, B, M, S>(&mut self, observer: S) -> &mut Self
    where
        E: Event + RequestEvent,
        for<'a> <E as Event>::Trigger<'a>: Default,
        B: Bundle,
        S: IntoObserverSystem<E, B, M>;

    /// Register a Bevy → React event type so it appears in the generated
    /// `ReactEvents` map and `bevy.on` typing. Sending an event with
    /// [`ReactEvents`](crate::ReactEvents) does not require this, but then the type
    /// won't be known to the exporter.
    fn add_react_event<E>(&mut self) -> &mut Self
    where
        E: ReactEvent;

    /// Write the TypeScript types for every registered React message to `path`.
    ///
    /// The generated module declares each payload's type (mirrored from the Rust
    /// `#[react_message]` struct via `ts-rs`), a `ReactMessages` map from `emit` name
    /// to payload type, and a typed `emit` wrapper. Import that `emit` from your React
    /// app instead of the untyped one from `"bevy-react"`, and `emit(name, value)` is
    /// checked against the same structs Bevy deserializes into.
    ///
    /// Call this from a small exporter entry point (e.g. a `--export-bindings <path>`
    /// arg) after registering your handlers, then commit the output. Re-run it and
    /// `git diff --exit-code` in CI to guarantee the TypeScript never drifts from Rust.
    ///
    /// ```ignore
    /// let mut app = App::new();
    /// app.add_react_handler(apply_count); // register the same payloads as the real app
    /// app.export_react_typescript("ui/src/messages.ts")?;
    /// ```
    //
    // TODO(review): codegen sync hinges on a hand-maintained DUPLICATE registration — the
    // exporter entry point must re-register exactly the same handlers as the real app. Add a
    // handler in the app but forget it here and the type silently vanishes from `generated.ts`
    // (the CI `git diff` only catches drift if this exporter is itself correct). Prefer
    // exporting from the REAL app build (e.g. an `--export-bindings` mode that exports before
    // `app.run()`), so there's a single registration site.
    fn export_react_typescript(&self, path: impl AsRef<Path>) -> std::io::Result<()>;
}

impl ReactAppExt for App {
    fn add_react_message<T>(&mut self) -> &mut Self
    where
        T: ReactPayload,
        for<'a> <T as Event>::Trigger<'a>: Default,
    {
        self.world_mut()
            .get_resource_or_init::<ReactRegistry>()
            .register::<T>();
        self
    }

    fn add_react_handler<E, B, M, S>(&mut self, observer: S) -> &mut Self
    where
        E: ReactPayload,
        for<'a> <E as Event>::Trigger<'a>: Default,
        B: Bundle,
        S: IntoObserverSystem<E, B, M>,
    {
        self.add_react_message::<E>();
        self.add_observer(observer);
        self
    }

    fn add_react_request<T>(&mut self) -> &mut Self
    where
        T: ReactRequest,
    {
        self.world_mut()
            .get_resource_or_init::<ReactRequestRegistry>()
            .register::<T>();
        self
    }

    fn add_react_request_handler<E, B, M, S>(&mut self, observer: S) -> &mut Self
    where
        E: Event + RequestEvent,
        for<'a> <E as Event>::Trigger<'a>: Default,
        B: Bundle,
        S: IntoObserverSystem<E, B, M>,
    {
        // `E` is `Request<T>`; register the underlying request type `T`.
        self.add_react_request::<E::Req>();
        self.add_observer(observer);
        self
    }

    fn add_react_event<E>(&mut self) -> &mut Self
    where
        E: ReactEvent,
    {
        self.world_mut()
            .get_resource_or_init::<ReactEventRegistry>()
            .register::<E>();
        self
    }

    fn export_react_typescript(&self, path: impl AsRef<Path>) -> std::io::Result<()> {
        crate::ts_codegen::export(self.world(), path.as_ref())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::react_message;
    use bevy::ecs::world::CommandQueue;

    #[react_message]
    struct Count(usize);

    // Only used to assert their derived `NAME`, so their fields go unread.
    #[react_message(name = "hp")]
    #[allow(dead_code)]
    struct Health(u32);

    #[react_message]
    #[allow(dead_code)]
    struct PlayerScore(i64);

    #[derive(Resource, Default)]
    struct LastCount(usize);

    /// The macro defaults the name to the struct ident, first letter lowered, and
    /// honours an explicit override.
    #[test]
    fn derives_emit_name() {
        assert_eq!(Count::NAME, "count");
        assert_eq!(PlayerScore::NAME, "playerScore");
        assert_eq!(Health::NAME, "hp");
    }

    fn test_app() -> App {
        let mut app = App::new();
        app.init_resource::<LastCount>();
        // Single call registers the deserializer and attaches the observer.
        app.add_react_handler(|on: On<Count>, mut last: ResMut<LastCount>| last.0 = on.event().0);
        app
    }

    /// Run one message through the plugin's dispatch path, applying the trigger
    /// it queues so observers run before we assert.
    fn dispatch(app: &mut App, msg: ReactMessage) {
        app.world_mut()
            .resource_scope(|world, registry: Mut<ReactRegistry>| {
                let mut queue = CommandQueue::default();
                let mut commands = Commands::new(&mut queue, world);
                registry.dispatch(msg, &mut commands);
                queue.apply(world);
            });
    }

    /// A registered payload deserializes and reaches its observer.
    #[test]
    fn dispatches_to_observer() {
        let mut app = test_app();
        dispatch(
            &mut app,
            ReactMessage {
                name: "count".into(),
                value: serde_json::json!(3),
            },
        );
        assert_eq!(app.world().resource::<LastCount>().0, 3);
    }

    /// An unknown name and malformed JSON are tolerated (logged, not panicked).
    #[test]
    fn tolerates_unknown_and_malformed() {
        let mut app = test_app();
        dispatch(
            &mut app,
            ReactMessage {
                name: "nope".into(),
                value: serde_json::json!(1),
            },
        );
        dispatch(
            &mut app,
            ReactMessage {
                name: "count".into(),
                value: serde_json::json!("not a number"),
            },
        );
        // Neither message should have reached the observer.
        assert_eq!(app.world().resource::<LastCount>().0, 0);
    }
}
