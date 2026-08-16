//! TypeScript code generation for the typed app-messaging surface.
//!
//! The Rust binding structs (`#[react_message]` / `#[react_request]` /
//! `#[react_event]` / the filter params types) are the single source of truth.
//! This module walks the four registries ([`ReactRegistry`],
//! [`ReactRequestRegistry`], [`ReactEventRegistry`], [`FilterRegistry`]) in one
//! pass and renders a self-contained `bevy.ts`: per-payload type declarations,
//! the `ReactMessages` / `ReactRequests` / `ReactEvents` maps, a
//! `declare module "bevy-react"` block augmenting the `BevyFilters` interface
//! (which types the `filter` style field), typed `emit` / `request` / `on`
//! wrappers, and a structured `bevy` proxy object.
//!
//! [`export`] writes that module to disk; it backs
//! [`ReactAppExt::export_react_typescript`](crate::ReactAppExt::export_react_typescript).
//!
//! Output is deterministic (sorted) so a `git diff --exit-code` after regeneration
//! is the sync guarantee between Rust and TypeScript.

use std::any::TypeId;
use std::collections::{BTreeMap, HashSet};
use std::fmt::Write as _;
use std::path::Path;

use bevy::ecs::world::World;
use ts_rs::{TS, TypeVisitor};

use crate::event::ReactEventRegistry;
use crate::filters::FilterRegistry;
use crate::message::ReactRegistry;
use crate::request::ReactRequestRegistry;

/// Render the four registries as one self-contained TypeScript module: every
/// payload/request/response/event/filter-params type declaration (plus transitive
/// dependencies), the `ReactMessages` / `ReactRequests` / `ReactEvents` maps, the
/// `BevyFilters` module augmentation, typed `emit`/`request`/`on` wrappers, and
/// the structured `bevy` proxy object. See
/// [`ReactAppExt::export_react_typescript`](crate::ReactAppExt::export_react_typescript).
///
/// Output is deterministic (sorted) so a `git diff --exit-code` after regeneration
/// is the sync guarantee between Rust and TypeScript.
pub(crate) fn render_typescript(
    messages: &ReactRegistry,
    requests: &ReactRequestRegistry,
    events: &ReactEventRegistry,
    filters: &FilterRegistry,
) -> String {
    // One shared collector across all four registries: a type referenced by more
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
    // Built-in framework events: always seeded so `bevy.on("keyDown", …)` is typed
    // in every app with no per-app registration (see `crate::keyboard` and
    // `crate::window`). `Resize` pulls in `WindowSize`, which the built-in
    // `window.size` request row below references too.
    collector.add::<crate::keyboard::KeyDown>();
    collector.add::<crate::keyboard::KeyUp>();
    collector.add::<crate::window::Resize>();
    // The gamepad built-ins (see `crate::gamepad`): three events and the two
    // rumble messages. Payload/union deps (`GamepadConnectedData`,
    // `GamepadButtonName`, …) are collected transitively.
    collector.add::<crate::gamepad::GamepadConnected>();
    collector.add::<crate::gamepad::GamepadDisconnected>();
    collector.add::<crate::gamepad::GamepadInputEvent>();
    collector.add::<crate::gamepad::GamepadRumble>();
    collector.add::<crate::gamepad::GamepadStopRumble>();

    // `gamepad.rumble`/`gamepad.stopRumble` are reserved for the built-in
    // rumble messages (see `crate::gamepad`); drop any app message that
    // collides, then append the built-ins (always present — the plugin
    // registers their observers). Sorted name lists keep the maps and proxy
    // stable across runs.
    const BUILTIN_MESSAGES: [&str; 2] = ["gamepad.rumble", "gamepad.stopRumble"];
    let mut message_names: Vec<(&str, String)> = messages
        .handlers
        .iter()
        .map(|(name, reg)| (*name, (reg.ts_name)()))
        .filter(|(name, _)| !BUILTIN_MESSAGES.contains(name))
        .collect();
    message_names.push((
        "gamepad.rumble",
        <crate::gamepad::GamepadRumble as TS>::name(),
    ));
    message_names.push((
        "gamepad.stopRumble",
        <crate::gamepad::GamepadStopRumble as TS>::name(),
    ));
    message_names.sort();

    // `window.size`/`gamepad.getAll` are reserved for the built-in requests
    // (see `crate::window` / `crate::gamepad`); drop any app request that
    // collides, then append the built-ins (always present — the plugin
    // registers their handlers).
    const BUILTIN_REQUESTS: [&str; 2] = ["window.size", "gamepad.getAll"];
    let mut request_rows: Vec<RequestRow> = requests
        .handlers
        .iter()
        .map(|(name, reg)| RequestRow {
            name,
            request_ts: (reg.ts_request_name)(),
            response_ts: (reg.ts_response_name)(),
            void: (reg.request_is_void)(),
        })
        .filter(|row| !BUILTIN_REQUESTS.contains(&row.name))
        .collect();
    request_rows.push(RequestRow {
        name: "window.size",
        request_ts: <crate::window::WindowSizeGet as TS>::name(),
        response_ts: <crate::window::WindowSize as TS>::name(),
        void: true,
    });
    request_rows.push(RequestRow {
        name: "gamepad.getAll",
        request_ts: <crate::gamepad::GamepadGetAll as TS>::name(),
        response_ts: <Vec<crate::gamepad::GamepadConnectedData> as TS>::name(),
        void: true,
    });
    request_rows.sort_by(|a, b| a.name.cmp(b.name));

    // The keyboard/resize/gamepad names are reserved for the built-in events;
    // drop any app event that collides so the generated interface can't get a
    // duplicate key, then append the built-ins (always present).
    const BUILTIN_EVENTS: [&str; 6] = [
        "keyDown",
        "keyUp",
        "resize",
        "gamepadConnected",
        "gamepadDisconnected",
        "gamepadInput",
    ];
    let mut event_names: Vec<(&str, String)> = events
        .handlers
        .iter()
        .map(|(name, reg)| (*name, (reg.ts_name)()))
        .filter(|(name, _)| !BUILTIN_EVENTS.contains(name))
        .collect();
    event_names.push(("keyDown", <crate::keyboard::KeyDown as TS>::name()));
    event_names.push(("keyUp", <crate::keyboard::KeyUp as TS>::name()));
    event_names.push(("resize", <crate::window::Resize as TS>::name()));
    event_names.push((
        "gamepadConnected",
        <crate::gamepad::GamepadConnected as TS>::name(),
    ));
    event_names.push((
        "gamepadDisconnected",
        <crate::gamepad::GamepadDisconnected as TS>::name(),
    ));
    event_names.push((
        "gamepadInput",
        <crate::gamepad::GamepadInputEvent as TS>::name(),
    ));
    event_names.sort();

    // Filters: app-registered customs plus the thirteen built-ins, seeded
    // here — like the built-in events/requests above — because the exporter
    // runs on a bare `App` (`register_bindings` only) while `ReactUiPlugin`
    // always registers the built-ins at runtime. Unlike the reserved event
    // names, a custom filter claiming a built-in name *wins* — including its
    // family bit — mirroring the registry's warn-and-replace runtime
    // semantics (`register_entry`). The two families split into two
    // interfaces: regular filters (`filter`/`backdropFilter` chains) into
    // `BevyFilters`, morph filters (`morphFilter`) into `BevyMorphFilters`.
    let mut builtin_filters = FilterRegistry::default();
    builtin_filters.register_builtins();
    let mut filter_rows: Vec<(&str, String)> = Vec::new();
    let mut morph_rows: Vec<(&str, String)> = Vec::new();
    for (name, reg) in &filters.entries {
        (reg.ts_collect)(&mut collector);
        let rows = if reg.is_morph {
            &mut morph_rows
        } else {
            &mut filter_rows
        };
        rows.push((*name, (reg.ts_name)()));
    }
    for (name, reg) in &builtin_filters.entries {
        if !filters.entries.contains_key(name) {
            (reg.ts_collect)(&mut collector);
            let rows = if reg.is_morph {
                &mut morph_rows
            } else {
                &mut filter_rows
            };
            rows.push((*name, (reg.ts_name)()));
        }
    }
    filter_rows.sort();
    morph_rows.sort();

    let mut out = String::new();
    out.push_str(
        "// @generated by bevy-react — do not edit by hand.\n\
         // Mirrors the Rust `#[react_message]` / `#[react_request]` / `#[react_event]`\n\
         // types and the registered `#[react_filter]`s / `#[react_morph_filter]`s (plus\n\
         // built-ins). Regenerate via your app's `App::export_react_typescript` exporter.\n\n\
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

    // The filter registries: augment the (empty) `BevyFilters` and
    // `BevyMorphFilters` interfaces the `bevy-react` package exports, turning
    // the `filter`/`backdropFilter` chains' `FilterUse` mapped union and the
    // `morphFilter` style's `MorphFilterValue` into one typed entry per
    // registered filter of the matching family. The specifier must be the
    // package name app code imports — that is the module whose declaration
    // merging targets.
    out.push_str(
        "/** Every registered filter name and its params type, split by family.\n\
         \x20*  Augments the empty `BevyFilters` (regular filters — the `filter` and\n\
         \x20*  `backdropFilter` chains) and `BevyMorphFilters` (two-input morph\n\
         \x20*  filters — the `morphFilter` style) registry interfaces in the\n\
         \x20*  `bevy-react` package, so each style field types its names' params. */\n\
         declare module \"bevy-react\" {\n\
         \x20 interface BevyFilters {\n",
    );
    for (name, ts_name) in &filter_rows {
        writeln!(out, "    {}: {ts_name};", json_key(name)).unwrap();
    }
    out.push_str("  }\n  interface BevyMorphFilters {\n");
    for (name, ts_name) in &morph_rows {
        writeln!(out, "    {}: {ts_name};", json_key(name)).unwrap();
    }
    out.push_str("  }\n}\n\n");

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
    out.push_str(&render_bevy_object(&request_rows, &message_names));
    out
}

/// One request's exporter metadata.
struct RequestRow<'a> {
    name: &'a str,
    request_ts: String,
    response_ts: String,
    void: bool,
}

/// A node in the nested proxy tree built from dotted request/message names.
enum ProxyNode<'a> {
    Namespace(BTreeMap<String, ProxyNode<'a>>),
    Leaf(ProxyLeaf<'a>),
}

/// A leaf method in the proxy: a request (awaits a typed response) or a
/// fire-and-forget message (returns `void`).
enum ProxyLeaf<'a> {
    Request(&'a RequestRow<'a>),
    Message { name: &'a str, ts_name: &'a str },
}

/// Build the `bevy` object literal: the typed wrappers plus a nested proxy where a
/// request `"board.get"` becomes `bevy.board.get(...)` and a message
/// `"basicDemo.setCount"` becomes `bevy.basicDemo.setCount(...)`.
fn render_bevy_object(requests: &[RequestRow], messages: &[(&str, String)]) -> String {
    // Reserved top-level keys the wrappers occupy; a binding must not collide.
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
        insert_proxy(&mut root, &segments, ProxyLeaf::Request(row), row.name);
    }
    for &(name, ref ts_name) in messages {
        let segments: Vec<&str> = name.split('.').collect();
        insert_proxy(
            &mut root,
            &segments,
            ProxyLeaf::Message {
                name,
                ts_name: ts_name.as_str(),
            },
            name,
        );
    }
    for key in root.keys() {
        if RESERVED.contains(&key.as_str()) {
            panic!(
                "react binding {key:?} collides with a reserved `bevy` method; rename it (e.g. give it a dotted namespace)"
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

/// Insert a request/message leaf at its dotted path, panicking on a
/// namespace/leaf clash (a name used as both a method and a namespace, or claimed
/// by two bindings).
fn insert_proxy<'a>(
    tree: &mut BTreeMap<String, ProxyNode<'a>>,
    segments: &[&str],
    leaf: ProxyLeaf<'a>,
    full_name: &str,
) {
    let (head, rest) = segments.split_first().expect("binding name is non-empty");
    if rest.is_empty() {
        if tree
            .insert((*head).to_string(), ProxyNode::Leaf(leaf))
            .is_some()
        {
            panic!(
                "react binding name {full_name:?} is ambiguous (used as both a method and a namespace, or claimed by two bindings)"
            );
        }
        return;
    }
    let child = tree
        .entry((*head).to_string())
        .or_insert_with(|| ProxyNode::Namespace(BTreeMap::new()));
    match child {
        ProxyNode::Namespace(children) => insert_proxy(children, rest, leaf, full_name),
        ProxyNode::Leaf(_) => panic!(
            "react binding name {full_name:?} is ambiguous (used as both a method and a namespace)"
        ),
    }
}

/// Render one proxy node (a namespace object, a request method, or a message
/// method) at `depth`.
fn render_proxy_node(out: &mut String, key: &str, node: &ProxyNode, depth: usize) {
    let indent = "  ".repeat(depth);
    let method = json_key(key);
    match node {
        ProxyNode::Leaf(ProxyLeaf::Request(row)) => {
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
        ProxyNode::Leaf(ProxyLeaf::Message { name, ts_name }) => {
            writeln!(
                out,
                "{indent}{method}(value: {ts_name}): void {{ emit({name:?}, value); }},",
            )
            .unwrap();
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
    /// `pub(crate)` so registry tests (e.g. `filters`) can assert what a
    /// baked `ts_collect` fn feeds the exporter.
    pub(crate) decls: BTreeMap<String, String>,
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
            // `visit_dependencies` surfaces named types referenced by fields; a
            // container's *inner* type (e.g. `Vec<CubeInfo>` → `CubeInfo`) is surfaced
            // by `visit_generics` instead, so we must walk both to be self-contained.
            T::visit_dependencies(self);
            T::visit_generics(self);
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

/// Render every registered React message/request/event/filter to a
/// self-contained TypeScript module at `path`, creating any missing parent
/// directories.
///
/// Any registry may be absent if nothing of that kind was registered; we fall back
/// to an empty one so the module is still valid (the built-in filters are seeded
/// by `render_typescript` regardless). Backs
/// [`ReactAppExt::export_react_typescript`](crate::ReactAppExt::export_react_typescript).
pub(crate) fn export(world: &World, path: &Path) -> std::io::Result<()> {
    let empty_messages = ReactRegistry::default();
    let empty_requests = ReactRequestRegistry::default();
    let empty_events = ReactEventRegistry::default();
    let empty_filters = FilterRegistry::default();
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
        world
            .get_resource::<FilterRegistry>()
            .unwrap_or(&empty_filters),
    );
    // Create any missing parent directories so callers can point at a path whose
    // containing dir doesn't exist yet (e.g. `ui/src/bevy.ts`) without a NotFound
    // from `fs::write`.
    if let Some(parent) = path.parent()
        && !parent.as_os_str().is_empty()
    {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(path, contents)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{ReactAppExt, react_message};
    use bevy::prelude::*;

    #[derive(Resource, Default)]
    struct LastCount(usize);

    #[react_message]
    struct Count(usize);

    // A struct payload with a nested type, to exercise object rendering and the
    // transitive-dependency collection.
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

    // A request whose response is a `Vec` of a custom struct, to exercise that the
    // collector declares a container's *inner* named type (surfaced via generics).
    #[crate::react_request(name = "pieces.list", response = Vec<PieceInfo>)]
    #[allow(dead_code)]
    struct PiecesList;

    #[derive(serde::Serialize, ts_rs::TS)]
    #[allow(dead_code)]
    struct PieceInfo {
        kind: String,
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

    // A custom filter, to exercise the `BevyFilters` augmentation alongside
    // the seeded built-ins.
    #[derive(serde::Deserialize, ts_rs::TS)]
    #[serde(deny_unknown_fields)]
    #[allow(dead_code)]
    struct GlowParams {
        strength: f32,
    }

    impl crate::filters::ReactFilter for GlowParams {
        const NAME: &'static str = "glow";
        fn shader(_assets: &AssetServer) -> Handle<bevy::shader::Shader> {
            Handle::default()
        }
        fn pack(&self) -> (Vec<Vec4>, std::sync::Arc<[crate::filters::ParamSlot]>) {
            (
                vec![Vec4::new(self.strength, 0.0, 0.0, 0.0)],
                std::sync::Arc::from(Vec::new()),
            )
        }
    }

    /// The `declare module "bevy-react"` block listing every filter split by
    /// family: the ten regular built-ins and any customs merged and sorted by
    /// wire name in `BevyFilters`, the morph family (the three built-in
    /// morphs plus custom morphs) in `BevyMorphFilters`.
    const BEVY_FILTERS_WITH_GLOW: &str = "declare module \"bevy-react\" {\n\
         \x20 interface BevyFilters {\n\
         \x20   bloom: BloomParams;\n\
         \x20   blur: BlurParams;\n\
         \x20   brightness: BrightnessParams;\n\
         \x20   chromaticAberration: ChromaticAberrationParams;\n\
         \x20   contrast: ContrastParams;\n\
         \x20   glow: GlowParams;\n\
         \x20   gradientMap: GradientMapParams;\n\
         \x20   grayscale: GrayscaleParams;\n\
         \x20   hueRotate: HueRotateParams;\n\
         \x20   invert: InvertParams;\n\
         \x20   outline: OutlineParams;\n\
         \x20   saturate: SaturateParams;\n\
         \x20   sepia: SepiaParams;\n\
         \x20   shadow: ShadowParams;\n\
         \x20 }\n\
         \x20 interface BevyMorphFilters {\n\
         \x20   crossfade: CrossfadeParams;\n\
         \x20   linearWipe: LinearWipeParams;\n\
         \x20   pixelize: PixelizeParams;\n\
         \x20   wipeTest: WipeTestParams;\n\
         \x20 }\n\
         }\n";

    /// A registered custom morph for the codegen test — lands in
    /// `BevyMorphFilters`, not `BevyFilters`.
    #[derive(serde::Deserialize, ts_rs::TS)]
    #[serde(deny_unknown_fields)]
    #[allow(dead_code)]
    struct WipeTestParams {
        angle: f32,
    }

    impl crate::filters::ReactFilter for WipeTestParams {
        const NAME: &'static str = "wipeTest";
        const IS_MORPH: bool = true;
        fn shader(_assets: &AssetServer) -> Handle<bevy::shader::Shader> {
            Handle::default()
        }
        fn pack(&self) -> (Vec<Vec4>, std::sync::Arc<[crate::filters::ParamSlot]>) {
            (
                vec![Vec4::new(self.angle, 0.0, 0.0, 0.0)],
                std::sync::Arc::from(Vec::new()),
            )
        }
    }

    impl crate::filters::ReactMorphFilter for WipeTestParams {}

    /// The exporter mirrors registered messages, requests, events, and filters
    /// (and their dependencies) into a self-contained, deterministically-ordered
    /// module.
    #[test]
    fn exports_typescript() {
        let mut app = App::new();
        app.init_resource::<LastCount>();
        app.add_react_handler(|on: On<Count>, mut last: ResMut<LastCount>| last.0 = on.event().0);
        app.add_react_message::<Move>();
        app.add_react_request::<BoardGet>();
        app.add_react_request::<PiecesMove>();
        app.add_react_request::<PiecesList>();
        app.add_react_event::<UserDisconnected>();
        app.add_react_filter::<GlowParams>();
        app.add_react_morph_filter::<WipeTestParams>();

        let world = app.world();
        let render = || {
            render_typescript(
                world.resource::<ReactRegistry>(),
                world.resource::<ReactRequestRegistry>(),
                world.resource::<ReactEventRegistry>(),
                world.resource::<FilterRegistry>(),
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
        // Built-in keyboard events are always seeded, even with none registered.
        assert!(
            ts.contains("export type KeyDown = KeyboardEventData;"),
            "{ts}"
        );
        assert!(
            ts.contains("export type KeyUp = KeyboardEventData;"),
            "{ts}"
        );
        assert!(ts.contains("keyDown: KeyDown;"), "{ts}");
        assert!(ts.contains("keyUp: KeyUp;"), "{ts}");
        // So are the built-in gamepad events and rumble messages …
        assert!(
            ts.contains("export type GamepadConnected = GamepadConnectedData;"),
            "{ts}"
        );
        assert!(ts.contains("gamepadConnected: GamepadConnected;"), "{ts}");
        assert!(
            ts.contains("gamepadDisconnected: GamepadDisconnected;"),
            "{ts}"
        );
        assert!(ts.contains("gamepadInput: GamepadInputEvent;"), "{ts}");
        assert!(ts.contains(r#""gamepad.rumble": GamepadRumble;"#), "{ts}");
        assert!(
            ts.contains(r#""gamepad.stopRumble": GamepadStopRumble;"#),
            "{ts}"
        );
        // … whose button union keeps the externally-tagged non-standard arm
        // (the TS type must agree with the serde wire shape).
        assert!(ts.contains("export type GamepadButtonName = "), "{ts}");
        assert!(ts.contains(r#"{ "other": number }"#), "{ts}");
        assert!(
            ts.contains(r#"rumble(value: GamepadRumble): void { emit("gamepad.rumble", value); }"#),
            "{ts}"
        );
        assert!(
            ts.contains(
                r#"stopRumble(value: GamepadStopRumble): void { emit("gamepad.stopRumble", value); }"#
            ),
            "{ts}"
        );
        // The pull companion request lands in the same `gamepad` proxy
        // namespace as the rumble messages (mixed message + request leaves).
        assert!(
            ts.contains(
                r#""gamepad.getAll": { request: null; response: Array<GamepadConnectedData> };"#
            ),
            "{ts}"
        );
        assert!(
            ts.contains(
                r#"getAll(): Promise<Array<GamepadConnectedData>> { return request("gamepad.getAll", null); }"#
            ),
            "{ts}"
        );
        // So are the built-in viewport-size event and request.
        assert!(ts.contains("export type WindowSize = "), "{ts}");
        assert!(ts.contains("export type Resize = WindowSize;"), "{ts}");
        assert!(ts.contains("resize: Resize;"), "{ts}");
        assert!(
            ts.contains(r#""window.size": { request: null; response: WindowSize };"#),
            "{ts}"
        );
        assert!(
            ts.contains(r#"size(): Promise<WindowSize> { return request("window.size", null); }"#),
            "{ts}"
        );
        // Filters: the custom's params type lands in the shared sorted decl
        // block alongside the built-ins' …
        assert!(ts.contains("export type GlowParams = "), "{ts}");
        assert!(ts.contains("export type BlurParams = "), "{ts}");
        assert!(ts.contains("export type HueRotateParams = "), "{ts}");
        // … and the `declare module` augmentation lists built-ins + the custom,
        // sorted by wire name.
        assert!(ts.contains(BEVY_FILTERS_WITH_GLOW), "{ts}");
        // A `Vec<PieceInfo>` response declares its inner struct and types as an array.
        assert!(ts.contains("export type PieceInfo = "), "{ts}");
        assert!(
            ts.contains(r#""pieces.list": { request: null; response: Array<PieceInfo> };"#),
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
        // Messages fold into the proxy too, as fire-and-forget `void` methods.
        assert!(
            ts.contains(r#"count(value: Count): void { emit("count", value); }"#),
            "{ts}"
        );
        assert!(
            ts.contains(r#"move(value: Move): void { emit("move", value); }"#),
            "{ts}"
        );
        // Output is stable across runs (no HashMap iteration order leaking in).
        assert_eq!(ts, render());
    }

    /// With no filter registered at all (the empty-registry fallback), the
    /// ten built-ins are still seeded — they are always available at runtime
    /// via `ReactUiPlugin`, which the bare exporter `App` never adds.
    #[test]
    fn empty_filter_registry_still_exports_builtins() {
        let ts = render_typescript(
            &ReactRegistry::default(),
            &ReactRequestRegistry::default(),
            &ReactEventRegistry::default(),
            &FilterRegistry::default(),
        );
        for (name, ts_name) in [
            ("bloom", "BloomParams"),
            ("blur", "BlurParams"),
            ("brightness", "BrightnessParams"),
            ("chromaticAberration", "ChromaticAberrationParams"),
            ("contrast", "ContrastParams"),
            ("grayscale", "GrayscaleParams"),
            ("hueRotate", "HueRotateParams"),
            ("invert", "InvertParams"),
            ("pixelize", "PixelizeParams"),
            ("saturate", "SaturateParams"),
            ("sepia", "SepiaParams"),
        ] {
            assert!(ts.contains(&format!("    {name}: {ts_name};")), "{ts}");
            assert!(ts.contains(&format!("export type {ts_name} = ")), "{ts}");
        }
        assert!(ts.contains("declare module \"bevy-react\" {"), "{ts}");
        // Gamepad events + rumble messages are seeded from fully empty
        // registries too (the plugin always registers their handlers).
        assert!(ts.contains("gamepadConnected: GamepadConnected;"), "{ts}");
        assert!(ts.contains("gamepadInput: GamepadInputEvent;"), "{ts}");
        assert!(ts.contains(r#""gamepad.rumble": GamepadRumble;"#), "{ts}");
        assert!(
            ts.contains(r#""gamepad.stopRumble": GamepadStopRumble;"#),
            "{ts}"
        );
    }

    /// An app message claiming a built-in message name loses to the built-in
    /// (same reservation rule as built-in events), and the name appears
    /// exactly once.
    #[test]
    fn app_message_claiming_builtin_name_is_dropped() {
        #[react_message(name = "gamepad.rumble")]
        #[allow(dead_code)]
        struct ImposterRumble(u32);

        let mut messages = ReactRegistry::default();
        messages.register::<ImposterRumble>();
        let ts = render_typescript(
            &messages,
            &ReactRequestRegistry::default(),
            &ReactEventRegistry::default(),
            &FilterRegistry::default(),
        );
        assert!(ts.contains(r#""gamepad.rumble": GamepadRumble;"#), "{ts}");
        // The imposter never reaches the map or the proxy. (Its orphaned type
        // decl still renders — same as any app type colliding with a built-in;
        // harmless, and consistent with the `window.size` request rule.)
        assert!(!ts.contains(r#""gamepad.rumble": ImposterRumble;"#), "{ts}");
        assert!(!ts.contains("value: ImposterRumble"), "{ts}");
        assert_eq!(ts.matches(r#""gamepad.rumble":"#).count(), 1, "{ts}"); // the map entry
        assert!(
            ts.contains(r#"rumble(value: GamepadRumble): void { emit("gamepad.rumble", value); }"#),
            "{ts}"
        );
    }

    /// A custom filter claiming a built-in wire name wins over the seeded
    /// built-in — mirroring `register_entry`'s warn-and-replace runtime
    /// semantics — and the name appears exactly once.
    #[test]
    fn custom_filter_claiming_builtin_name_wins() {
        #[derive(serde::Deserialize, ts_rs::TS)]
        #[serde(deny_unknown_fields)]
        #[allow(dead_code)]
        struct CustomBlurParams {
            sigma: f32,
        }
        impl crate::filters::ReactFilter for CustomBlurParams {
            const NAME: &'static str = "blur";
            fn shader(_assets: &AssetServer) -> Handle<bevy::shader::Shader> {
                Handle::default()
            }
            fn pack(&self) -> (Vec<Vec4>, std::sync::Arc<[crate::filters::ParamSlot]>) {
                (Vec::new(), std::sync::Arc::from(Vec::new()))
            }
        }
        let mut filters = FilterRegistry::default();
        filters.register::<CustomBlurParams>();
        let ts = render_typescript(
            &ReactRegistry::default(),
            &ReactRequestRegistry::default(),
            &ReactEventRegistry::default(),
            &filters,
        );
        assert!(ts.contains("    blur: CustomBlurParams;"), "{ts}");
        assert!(!ts.contains("    blur: BlurParams;"), "{ts}");
        assert_eq!(ts.matches("blur:").count(), 1, "{ts}");
    }
}
