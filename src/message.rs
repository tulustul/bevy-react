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
use std::collections::{BTreeMap, HashMap, HashSet};
use std::fmt::Write as _;
use std::path::Path;

use bevy::ecs::system::IntoObserverSystem;
use bevy::prelude::*;
use serde::de::DeserializeOwned;
use ts_rs::{TS, TypeVisitor};

use crate::event::{ReactEvent, ReactEventRegistry};
use crate::request::{ReactRequest, ReactRequestRegistry, RequestEvent};

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
    handlers: HashMap<&'static str, Registration>,
}

/// What we record per registered payload: the dispatch closure plus the TypeScript
/// metadata [`ReactAppExt::export_react_typescript`] needs to mirror the type.
struct Registration {
    /// Distinguishes re-registering the same type (a no-op) from a name collision.
    type_id: TypeId,
    /// Deserialize-and-trigger for this payload.
    handler: Handler,
    /// The payload's TypeScript reference name (e.g. `Count`), used in the message map.
    ts_name: fn() -> String,
    /// Records this payload's declaration and all its transitive dependencies.
    ts_collect: fn(&mut TsCollector),
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

/// Render the three registries as one self-contained TypeScript module: every
/// payload/request/response/event type declaration (plus transitive dependencies),
/// the `ReactMessages` / `ReactRequests` / `ReactEvents` maps, typed
/// `emit`/`request`/`on` wrappers, and the structured `bevy` proxy object. See
/// [`ReactAppExt::export_react_typescript`].
///
/// Output is deterministic (sorted) so a `git diff --exit-code` after regeneration
/// is the sync guarantee between Rust and TypeScript.
pub(crate) fn render_typescript(
    messages: &ReactRegistry,
    requests: &ReactRequestRegistry,
    events: &ReactEventRegistry,
) -> String {
    // One shared collector across all three registries: a type referenced by more
    // than one (e.g. a struct used as both a message and a response) is declared once.
    let mut collector = TsCollector::default();
    for reg in messages.handlers.values() {
        (reg.ts_collect)(&mut collector);
    }
    for reg in requests.handlers.values() {
        (reg.ts_collect)(&mut collector);
    }
    for reg in events.handlers.values() {
        (reg.ts_collect)(&mut collector);
    }

    // Sorted name lists keep the maps and proxy stable across runs.
    let mut message_names: Vec<(&str, String)> = messages
        .handlers
        .iter()
        .map(|(name, reg)| (*name, (reg.ts_name)()))
        .collect();
    message_names.sort();

    let mut request_rows: Vec<RequestRow> = requests
        .handlers
        .iter()
        .map(|(name, reg)| RequestRow {
            name,
            request_ts: (reg.ts_request_name)(),
            response_ts: (reg.ts_response_name)(),
            void: (reg.request_is_void)(),
        })
        .collect();
    request_rows.sort_by(|a, b| a.name.cmp(b.name));

    let mut event_names: Vec<(&str, String)> = events
        .handlers
        .iter()
        .map(|(name, reg)| (*name, (reg.ts_name)()))
        .collect();
    event_names.sort();

    let mut out = String::new();
    out.push_str(
        "// @generated by bevy-react — do not edit by hand.\n\
         // Mirrors the Rust `#[react_message]` / `#[react_request]` / `#[react_event]`\n\
         // types. Regenerate via your app's `App::export_react_typescript` exporter.\n\n\
         import {\n\
         \x20 emit as rawEmit,\n\
         \x20 request as rawRequest,\n\
         \x20 addEventListener as rawAddEventListener,\n\
         \x20 removeEventListener as rawRemoveEventListener,\n\
         } from \"bevy-react\";\n\n",
    );

    // Type declarations.
    for decl in collector.decls.values() {
        writeln!(out, "export {decl}").unwrap();
    }

    // Maps.
    out.push_str("\n/** Every `emit` name and the payload type it carries. */\n");
    out.push_str("export interface ReactMessages {\n");
    for (name, ts_name) in &message_names {
        writeln!(out, "  {}: {ts_name};", json_key(name)).unwrap();
    }
    out.push_str("}\n\n");

    out.push_str("/** Every `request` name and its request/response types. */\n");
    out.push_str("export interface ReactRequests {\n");
    for row in &request_rows {
        let request_ts = if row.void { "null" } else { &row.request_ts };
        writeln!(
            out,
            "  {}: {{ request: {request_ts}; response: {} }};",
            json_key(row.name),
            row.response_ts,
        )
        .unwrap();
    }
    out.push_str("}\n\n");

    out.push_str("/** Every Bevy → React event name and the payload it carries. */\n");
    out.push_str("export interface ReactEvents {\n");
    for (name, ts_name) in &event_names {
        writeln!(out, "  {}: {ts_name};", json_key(name)).unwrap();
    }
    out.push_str("}\n\n");

    // Typed standalone wrappers.
    out.push_str(
        "/** Send a typed app message to the Bevy side. */\n\
         export function emit<K extends keyof ReactMessages>(name: K, value: ReactMessages[K]): void {\n\
         \x20 rawEmit(name, value);\n\
         }\n\n\
         /** Send a typed request and await its typed response. */\n\
         export function request<K extends keyof ReactRequests>(\n\
         \x20 name: K,\n\
         \x20 value: ReactRequests[K][\"request\"],\n\
         ): Promise<ReactRequests[K][\"response\"]> {\n\
         \x20 return rawRequest(name, value) as Promise<ReactRequests[K][\"response\"]>;\n\
         }\n\n\
         /** Subscribe to a typed Bevy → React event. Returns an unsubscribe fn. */\n\
         export function on<K extends keyof ReactEvents>(\n\
         \x20 name: K,\n\
         \x20 cb: (value: ReactEvents[K]) => void,\n\
         ): () => void {\n\
         \x20 rawAddEventListener(name, cb as (value: unknown) => void);\n\
         \x20 return () => rawRemoveEventListener(name, cb as (value: unknown) => void);\n\
         }\n\n\
         /** Unsubscribe a listener previously passed to `on`/`addEventListener`. */\n\
         export function removeEventListener<K extends keyof ReactEvents>(\n\
         \x20 name: K,\n\
         \x20 cb: (value: ReactEvents[K]) => void,\n\
         ): void {\n\
         \x20 rawRemoveEventListener(name, cb as (value: unknown) => void);\n\
         }\n\n",
    );

    // The structured `bevy` proxy object.
    out.push_str(&render_bevy_object(&request_rows));
    out
}

/// One request's exporter metadata.
struct RequestRow<'a> {
    name: &'a str,
    request_ts: String,
    response_ts: String,
    void: bool,
}

/// A node in the nested proxy tree built from dotted request names.
enum ProxyNode<'a> {
    Namespace(BTreeMap<String, ProxyNode<'a>>),
    Leaf(&'a RequestRow<'a>),
}

/// Build the `bevy` object literal: the typed wrappers plus a nested proxy where a
/// request `"board.get"` becomes `bevy.board.get(...)`.
fn render_bevy_object(requests: &[RequestRow]) -> String {
    // Reserved top-level keys the wrappers occupy; a request must not collide.
    const RESERVED: [&str; 5] = [
        "emit",
        "request",
        "on",
        "addEventListener",
        "removeEventListener",
    ];

    let mut root: BTreeMap<String, ProxyNode> = BTreeMap::new();
    for row in requests {
        let segments: Vec<&str> = row.name.split('.').collect();
        insert_proxy(&mut root, &segments, row);
    }
    for key in root.keys() {
        if RESERVED.contains(&key.as_str()) {
            panic!(
                "react request {key:?} collides with a reserved `bevy` method; rename it (e.g. give it a dotted namespace)"
            );
        }
    }

    let mut out = String::new();
    out.push_str(
        "/** Structured, fully typed proxy over every message, request, and event. */\n\
         export const bevy = {\n\
         \x20 emit,\n\
         \x20 request,\n\
         \x20 on,\n\
         \x20 addEventListener: on,\n\
         \x20 removeEventListener,\n",
    );
    for (key, node) in &root {
        render_proxy_node(&mut out, key, node, 1);
    }
    out.push_str("} as const;\n");
    out
}

/// Insert a request leaf at its dotted path, panicking on a namespace/leaf clash.
fn insert_proxy<'a>(
    tree: &mut BTreeMap<String, ProxyNode<'a>>,
    segments: &[&str],
    row: &'a RequestRow<'a>,
) {
    let (head, rest) = segments.split_first().expect("request name is non-empty");
    if rest.is_empty() {
        if tree
            .insert((*head).to_string(), ProxyNode::Leaf(row))
            .is_some()
        {
            panic!(
                "react request name {:?} is ambiguous (used as both a method and a namespace)",
                row.name
            );
        }
        return;
    }
    let child = tree
        .entry((*head).to_string())
        .or_insert_with(|| ProxyNode::Namespace(BTreeMap::new()));
    match child {
        ProxyNode::Namespace(children) => insert_proxy(children, rest, row),
        ProxyNode::Leaf(_) => panic!(
            "react request name {:?} is ambiguous (used as both a method and a namespace)",
            row.name
        ),
    }
}

/// Render one proxy node (a namespace object or a request method) at `depth`.
fn render_proxy_node(out: &mut String, key: &str, node: &ProxyNode, depth: usize) {
    let indent = "  ".repeat(depth);
    let method = json_key(key);
    match node {
        ProxyNode::Leaf(row) => {
            if row.void {
                writeln!(
                    out,
                    "{indent}{method}(): Promise<{}> {{ return request({:?}, null); }},",
                    row.response_ts, row.name,
                )
                .unwrap();
            } else {
                writeln!(
                    out,
                    "{indent}{method}(value: {}): Promise<{}> {{ return request({:?}, value); }},",
                    row.request_ts, row.response_ts, row.name,
                )
                .unwrap();
            }
        }
        ProxyNode::Namespace(children) => {
            writeln!(out, "{indent}{method}: {{").unwrap();
            for (child_key, child) in children {
                render_proxy_node(out, child_key, child, depth + 1);
            }
            writeln!(out, "{indent}}},").unwrap();
        }
    }
}

/// Walks a payload type and its dependencies, collecting each one's TypeScript
/// declaration exactly once. `ts-rs` renders references by name (not by import), so
/// concatenating every declaration into one file yields a self-contained module.
///
/// Shared across the message, request, and event registries so a type referenced
/// by more than one of them is declared once (deduped by `TypeId`).
#[derive(Default)]
pub(crate) struct TsCollector {
    seen: HashSet<TypeId>,
    /// type name → its `ts-rs` declaration, ordered for stable output.
    decls: BTreeMap<String, String>,
}

impl TsCollector {
    /// Record `T`'s declaration (if unseen) and recurse into the types it references.
    pub(crate) fn add<T: TS + 'static + ?Sized>(&mut self) {
        if self.seen.insert(TypeId::of::<T>()) {
            // Only types with their own file get a declaration. Transparent newtypes
            // (e.g. `struct Count(usize)` → `number`) and primitives inline into their
            // referent, so `decl()` would panic — skip them and keep their inline name.
            if T::output_path().is_some() {
                self.decls.insert(T::name(), T::decl());
            }
            T::visit_dependencies(self);
        }
    }
}

impl TypeVisitor for TsCollector {
    fn visit<T: TS + 'static + ?Sized>(&mut self) {
        self.add::<T>();
    }
}

/// Quote a TypeScript object key only when it isn't a plain identifier, so common
/// names stay readable (`count:`) while odd ones (`hp-bar:`) are still valid.
fn json_key(name: &str) -> String {
    let is_ident = !name.is_empty()
        && name.chars().enumerate().all(|(i, c)| {
            c == '_' || c == '$' || c.is_ascii_alphabetic() || (i > 0 && c.is_ascii_digit())
        });
    if is_ident {
        name.to_string()
    } else {
        format!("{name:?}")
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
        // Any registry may be absent if nothing of that kind was registered; fall
        // back to an empty one so the module is still valid.
        let world = self.world();
        let empty_messages = ReactRegistry::default();
        let empty_requests = ReactRequestRegistry::default();
        let empty_events = ReactEventRegistry::default();
        let contents = render_typescript(
            world
                .get_resource::<ReactRegistry>()
                .unwrap_or(&empty_messages),
            world
                .get_resource::<ReactRequestRegistry>()
                .unwrap_or(&empty_requests),
            world
                .get_resource::<ReactEventRegistry>()
                .unwrap_or(&empty_events),
        );
        std::fs::write(path, contents)
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

    // A struct payload with a nested type, to exercise object rendering and the
    // transitive-dependency collection in `to_typescript`.
    #[react_message]
    #[allow(dead_code)]
    struct Move {
        delta: Vec2i,
    }

    #[derive(serde::Deserialize, ts_rs::TS)]
    #[allow(dead_code)]
    struct Vec2i {
        x: i32,
        y: i32,
    }

    // A void request (unit struct) and a request with a payload + response, to
    // exercise the request map, the void special-case, and the nested `bevy` proxy.
    #[crate::react_request(name = "board.get", response = BoardSnapshot)]
    #[allow(dead_code)]
    struct BoardGet;

    #[crate::react_request(name = "pieces.move", response = MoveStatus)]
    #[allow(dead_code)]
    struct PiecesMove {
        to: String,
    }

    #[derive(serde::Serialize, ts_rs::TS)]
    #[allow(dead_code)]
    struct BoardSnapshot {
        fen: String,
    }

    #[derive(serde::Serialize, ts_rs::TS)]
    #[allow(dead_code)]
    struct MoveStatus {
        ok: bool,
    }

    #[crate::react_event(name = "user.disconnected")]
    #[allow(dead_code)]
    struct UserDisconnected {
        user_id: String,
    }

    /// The exporter mirrors registered messages, requests, and events (and their
    /// dependencies) into a self-contained, deterministically-ordered module.
    #[test]
    fn exports_typescript() {
        let mut app = App::new();
        app.init_resource::<LastCount>();
        app.add_react_handler(|on: On<Count>, mut last: ResMut<LastCount>| last.0 = on.event().0);
        app.add_react_message::<Move>();
        app.add_react_request::<BoardGet>();
        app.add_react_request::<PiecesMove>();
        app.add_react_event::<UserDisconnected>();

        let world = app.world();
        let render = || {
            render_typescript(
                world.resource::<ReactRegistry>(),
                world.resource::<ReactRequestRegistry>(),
                world.resource::<ReactEventRegistry>(),
            )
        };
        let ts = render();

        // Each payload gets a named alias mirroring its Rust shape; nested types too.
        assert!(ts.contains("export type Count = number;"), "{ts}");
        assert!(ts.contains("export type Vec2i = "), "{ts}");
        assert!(ts.contains("export type Move = "), "{ts}");
        // The three maps key by name.
        assert!(ts.contains("count: Count;"), "{ts}");
        assert!(ts.contains("move: Move;"), "{ts}");
        assert!(
            ts.contains(r#""board.get": { request: null; response: BoardSnapshot };"#),
            "{ts}"
        );
        assert!(
            ts.contains(r#""pieces.move": { request: PiecesMove; response: MoveStatus };"#),
            "{ts}"
        );
        assert!(
            ts.contains(r#""user.disconnected": UserDisconnected;"#),
            "{ts}"
        );
        // Typed wrappers + the nested proxy (void request → no-arg method).
        assert!(
            ts.contains("export function request<K extends keyof ReactRequests>"),
            "{ts}"
        );
        assert!(
            ts.contains(r#"get(): Promise<BoardSnapshot> { return request("board.get", null); }"#),
            "{ts}"
        );
        assert!(
            ts.contains(
                r#"move(value: PiecesMove): Promise<MoveStatus> { return request("pieces.move", value); }"#
            ),
            "{ts}"
        );
        // Output is stable across runs (no HashMap iteration order leaking in).
        assert_eq!(ts, render());
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
