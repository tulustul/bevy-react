//! TypeScript code generation for the typed app-messaging surface.
//!
//! The Rust binding structs (`#[react_message]` / `#[react_request]` /
//! `#[react_event]`) are the single source of truth. This module walks the three
//! registries ([`ReactRegistry`], [`ReactRequestRegistry`], [`ReactEventRegistry`])
//! plus the `<layer>` effect registry ([`LayerEffects`]) in one pass and renders a
//! self-contained `bevy.ts`: per-payload type declarations, the `ReactMessages` /
//! `ReactRequests` / `ReactEvents` maps, typed `emit` / `request` / `on` wrappers,
//! a structured `bevy` proxy object, and per-effect uniforms types with a typed
//! `Layer` wrapper component.
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
use crate::layer::{LayerEffects, UniformDecl, UniformKind};
use crate::message::ReactRegistry;
use crate::request::ReactRequestRegistry;

/// Render the registries as one self-contained TypeScript module: every
/// payload/request/response/event type declaration (plus transitive dependencies),
/// the `ReactMessages` / `ReactRequests` / `ReactEvents` maps, typed
/// `emit`/`request`/`on` wrappers, the structured `bevy` proxy object, and the
/// `<layer>` effect section (per-effect uniforms types + the typed `Layer`
/// wrapper — see [`render_layer_section`]). See
/// [`ReactAppExt::export_react_typescript`](crate::ReactAppExt::export_react_typescript).
///
/// Output is deterministic (sorted) so a `git diff --exit-code` after regeneration
/// is the sync guarantee between Rust and TypeScript.
pub(crate) fn render_typescript(
    messages: &ReactRegistry,
    requests: &ReactRequestRegistry,
    events: &ReactEventRegistry,
    layer_effects: &LayerEffects,
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
    // Built-in framework events: always seeded so `bevy.on("keyDown", …)` is typed
    // in every app with no per-app registration (see `crate::keyboard` and
    // `crate::window`). `Resize` pulls in `WindowSize`, which the built-in
    // `window.size` request row below references too.
    collector.add::<crate::keyboard::KeyDown>();
    collector.add::<crate::keyboard::KeyUp>();
    collector.add::<crate::window::Resize>();

    // Sorted name lists keep the maps and proxy stable across runs.
    let mut message_names: Vec<(&str, String)> = messages
        .handlers
        .iter()
        .map(|(name, reg)| (*name, (reg.ts_name)()))
        .collect();
    message_names.sort();

    // `window.size` is reserved for the built-in viewport request (see
    // `crate::window`); drop any app request that collides, then append the
    // built-in (always present — the plugin registers its handler).
    const BUILTIN_REQUESTS: [&str; 1] = ["window.size"];
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
    request_rows.sort_by(|a, b| a.name.cmp(b.name));

    // `keyDown`/`keyUp`/`resize` are reserved for the built-in events; drop any
    // app event that collides so the generated interface can't get a duplicate key,
    // then append the built-ins (always present).
    const BUILTIN_EVENTS: [&str; 3] = ["keyDown", "keyUp", "resize"];
    let mut event_names: Vec<(&str, String)> = events
        .handlers
        .iter()
        .map(|(name, reg)| (*name, (reg.ts_name)()))
        .filter(|(name, _)| !BUILTIN_EVENTS.contains(name))
        .collect();
    event_names.push(("keyDown", <crate::keyboard::KeyDown as TS>::name()));
    event_names.push(("keyUp", <crate::keyboard::KeyUp as TS>::name()));
    event_names.push(("resize", <crate::window::Resize as TS>::name()));
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
         } from \"bevy-react\";\n\
         import type {\n\
         \x20 BevyLayerProps,\n\
         \x20 BevyLayerStyle,\n\
         \x20 LayerUniformValue,\n\
         } from \"bevy-react\";\n\
         import { createElement, type ReactElement } from \"react\";\n\n",
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
    out.push_str(&render_bevy_object(&request_rows, &message_names));

    // The `<layer>` effect section: per-effect uniforms types + typed wrapper.
    out.push_str(&render_layer_section(layer_effects));
    out
}

/// The single [`UniformKind`] → TypeScript mapping: scalars are `number`,
/// vectors are fixed-length tuples (tuples are assignable to the `<layer>`
/// intrinsic's `number[]`-carrying [`crate::layer::LayerUniformValue`] mirror),
/// colors travel as hex/CSS color strings.
fn uniform_ts_type(kind: UniformKind) -> &'static str {
    match kind {
        UniformKind::F32 => "number",
        UniformKind::Vec2 => "[number, number]",
        UniformKind::Vec3 => "[number, number, number]",
        UniformKind::Vec4 => "[number, number, number, number]",
        UniformKind::Color => "string",
    }
}

/// `PascalCase` a registered effect name for its generated `<X>Uniforms` type.
/// Effect names are identifier-enforced at definition time
/// (`LayerEffect::new`), so in practice only underscores split words
/// (`"my_effect"` → `MyEffect`); the general non-alphanumeric splitting and the
/// `Effect` prefix for a name with no leading letter stay as defensive
/// backstops so this can never emit an invalid TypeScript identifier.
fn pascal_ident(name: &str) -> String {
    let mut out = String::new();
    let mut upper_next = true;
    for c in name.chars() {
        if c.is_ascii_alphanumeric() {
            if upper_next && c.is_ascii_alphabetic() {
                out.push(c.to_ascii_uppercase());
            } else {
                out.push(c);
            }
            upper_next = false;
        } else {
            upper_next = true;
        }
    }
    if !out.starts_with(|c: char| c.is_ascii_alphabetic()) {
        out.insert_str(0, "Effect");
    }
    out
}

/// The doc comment body for one generated uniform field: its WGSL kind and the
/// Rust-declared default (colors show their packed linear-RGBA lanes — the
/// value the shader sees — since reversing them to the authored CSS string is
/// lossy).
fn uniform_field_doc(decl: &UniformDecl) -> String {
    let d = decl.default;
    match decl.kind {
        UniformKind::F32 => format!("`f32` — default `{:?}`.", d[0]),
        UniformKind::Vec2 => format!("`vec2` — default `[{:?}, {:?}]`.", d[0], d[1]),
        UniformKind::Vec3 => {
            format!("`vec3` — default `[{:?}, {:?}, {:?}]`.", d[0], d[1], d[2])
        }
        UniformKind::Vec4 => format!(
            "`vec4` — default `[{:?}, {:?}, {:?}, {:?}]`.",
            d[0], d[1], d[2], d[3]
        ),
        UniformKind::Color => format!(
            "Color, as a CSS color string — default linear RGBA `[{:?}, {:?}, {:?}, {:?}]`.",
            d[0], d[1], d[2], d[3]
        ),
    }
}

/// Render the `<layer>` effect section: one `<Pascal>Uniforms` type per
/// registered effect (interface of optional typed fields; empty schemas — like
/// the `"none"` builtin — collapse to `Record<string, never>` so they accept no
/// keys), the `LayerEffects` name → uniforms map, a compile-time proof that
/// every generated shape stays assignable to the intrinsic's
/// `Record<string, LayerUniformValue>` wire type, and the typed `Layer` wrapper
/// component (`createElement`-based — `bevy.ts` is a `.ts` file, no JSX).
fn render_layer_section(effects: &LayerEffects) -> String {
    // Effect name → generated Pascal type ident. Distinct names may legally
    // flatten to the same ident (`"my-effect"` / `"myEffect"`); that would emit
    // two same-named types, so fail loudly at export time, like the proxy does
    // for ambiguous binding names.
    let mut pascal_names: BTreeMap<&str, String> = BTreeMap::new();
    let mut claimed: BTreeMap<String, &str> = BTreeMap::new();
    for (name, _) in effects.iter() {
        let pascal = format!("{}Uniforms", pascal_ident(name));
        if let Some(prev) = claimed.insert(pascal.clone(), name) {
            panic!(
                "layer effects {prev:?} and {name:?} both generate the TypeScript type {pascal:?}; rename one"
            );
        }
        pascal_names.insert(name, pascal);
    }

    let mut out = String::new();
    out.push_str(
        "\n// ---- `<layer>` effects ----------------------------------------------------\n\n",
    );

    for (name, effect) in effects.iter() {
        let pascal = &pascal_names[name];
        let decls = effect.schema.decls();
        if decls.is_empty() {
            writeln!(
                out,
                "/** Uniforms for the {name:?} `<layer>` effect (declares none). */"
            )
            .unwrap();
            writeln!(out, "export type {pascal} = Record<string, never>;").unwrap();
        } else {
            writeln!(out, "/** Uniforms for the {name:?} `<layer>` effect. */").unwrap();
            writeln!(out, "export interface {pascal} {{").unwrap();
            for decl in decls {
                writeln!(out, "  /** {} */", uniform_field_doc(decl)).unwrap();
                writeln!(out, "  {}?: {};", decl.name, uniform_ts_type(decl.kind)).unwrap();
            }
            out.push_str("}\n");
        }
        out.push('\n');
    }

    out.push_str("/** Every registered `<layer>` effect and the uniforms it declares. */\n");
    out.push_str("export interface LayerEffects {\n");
    for (name, _) in effects.iter() {
        writeln!(out, "  {}: {};", json_key(name), pascal_names[name]).unwrap();
    }
    out.push_str("}\n\n");

    out.push_str(
        "/** Compile-time proof: every effect's uniforms shape fits the `<layer>`\n\
         \x20*  intrinsic's `Record<string, LayerUniformValue>` wire type. */\n\
         export type AssertLayerUniformsCompat<\n\
         \x20 T extends Partial<Record<string, LayerUniformValue>>,\n\
         > = T;\n\
         export type LayerUniformsCompat = [\n",
    );
    for (name, _) in effects.iter() {
        let pascal = &pascal_names[name];
        // The `{ [K in keyof P]: P[K] }` wrap is load-bearing: interfaces get
        // no implicit index signature, so the bare `P` would fail the
        // `Partial<Record<string, LayerUniformValue>>` constraint even when
        // every field fits — the mapped copy is checked key by key.
        writeln!(
            out,
            "  AssertLayerUniformsCompat<{{ [K in keyof {pascal}]: {pascal}[K] }}>,"
        )
        .unwrap();
    }
    out.push_str("];\n\n");

    out.push_str(
        "/** `BevyLayerStyle` with `uniforms` narrowed to one effect's typed shape. */\n\
         export type LayerStyleFor<U> = Omit<BevyLayerStyle, \"uniforms\"> & {\n\
         \x20 uniforms?: U;\n\
         };\n\n\
         /** Props for the typed `Layer` wrapper (see `Layer`). */\n\
         export type LayerProps<E extends keyof LayerEffects> = { effect?: E } & Omit<\n\
         \x20 BevyLayerProps,\n\
         \x20 \"effect\" | \"style\" | \"hoverStyle\" | \"pressStyle\"\n\
         > & {\n\
         \x20   style?: LayerStyleFor<LayerEffects[E]>;\n\
         \x20   hoverStyle?: LayerStyleFor<LayerEffects[E]>;\n\
         \x20   pressStyle?: LayerStyleFor<LayerEffects[E]>;\n\
         \x20 };\n\n\
         /** Typed `<layer>`: choosing an `effect` compile-checks `style.uniforms`\n\
         \x20*  (and the hover/press variants) against that effect's Rust-declared\n\
         \x20*  schema. The plain `<layer>` intrinsic stays available untyped. */\n\
         export function Layer<E extends keyof LayerEffects = \"none\">(\n\
         \x20 props: LayerProps<E>,\n\
         ): ReactElement {\n\
         \x20 return createElement(\"layer\", props as BevyLayerProps);\n\
         }\n",
    );
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

/// Render every registered React message/request/event to a self-contained
/// TypeScript module at `path`, creating any missing parent directories.
///
/// Any registry may be absent if nothing of that kind was registered; we fall back
/// to an empty one so the module is still valid. Backs
/// [`ReactAppExt::export_react_typescript`](crate::ReactAppExt::export_react_typescript).
pub(crate) fn export(world: &World, path: &Path) -> std::io::Result<()> {
    let empty_messages = ReactRegistry::default();
    let empty_requests = ReactRequestRegistry::default();
    let empty_events = ReactEventRegistry::default();
    // An app that never registered a layer effect has no `LayerEffects`
    // resource at all (it is created on demand); the default registry still
    // carries the `"none"` builtin, so the generated section is never empty.
    let default_layer_effects = LayerEffects::default();
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
            .get_resource::<LayerEffects>()
            .unwrap_or(&default_layer_effects),
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
    use crate::layer::{LayerAppExt as _, LayerEffect};
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
        app.add_react_request::<PiecesList>();
        app.add_react_event::<UserDisconnected>();

        let world = app.world();
        let layer_effects = LayerEffects::default();
        let render = || {
            render_typescript(
                world.resource::<ReactRegistry>(),
                world.resource::<ReactRequestRegistry>(),
                world.resource::<ReactEventRegistry>(),
                &layer_effects,
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

    /// The single [`UniformKind`] → TypeScript mapping: scalars are `number`,
    /// vectors are fixed-length tuples (assignable to the intrinsic's
    /// `number[]`), colors are hex/CSS strings.
    #[test]
    fn maps_uniform_kinds_to_typescript() {
        assert_eq!(uniform_ts_type(UniformKind::F32), "number");
        assert_eq!(uniform_ts_type(UniformKind::Vec2), "[number, number]");
        assert_eq!(
            uniform_ts_type(UniformKind::Vec3),
            "[number, number, number]"
        );
        assert_eq!(
            uniform_ts_type(UniformKind::Vec4),
            "[number, number, number, number]"
        );
        assert_eq!(uniform_ts_type(UniformKind::Color), "string");
    }

    /// The exporter mirrors the `<layer>` effect registry: a typed per-effect
    /// uniforms interface, the `LayerEffects` map (registered effects plus the
    /// `"none"` builtin), and the typed `Layer` wrapper component.
    #[test]
    fn exports_layer_effects() {
        const VALID_FRAGMENT: &str = "@fragment\nfn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {\n\
             \x20   return vec4<f32>(0.0);\n}\n";

        let mut app = App::new();
        app.register_layer_effect(
            LayerEffect::new("glow")
                .fragment_wgsl(VALID_FRAGMENT)
                .uniform("strength", UniformKind::F32, 0.5)
                .uniform("tint", UniformKind::Color, Color::WHITE),
        );

        let world = app.world();
        let messages = ReactRegistry::default();
        let requests = ReactRequestRegistry::default();
        let events = ReactEventRegistry::default();
        let render = || {
            render_typescript(
                &messages,
                &requests,
                &events,
                world.resource::<LayerEffects>(),
            )
        };
        let ts = render();

        // Per-effect uniforms interface: optional fields typed by kind, with
        // the declared default surfaced in the field doc.
        assert!(ts.contains("export interface GlowUniforms"), "{ts}");
        assert!(ts.contains("strength?: number;"), "{ts}");
        assert!(ts.contains("tint?: string;"), "{ts}");
        assert!(ts.contains("default `0.5`"), "{ts}");
        // The effects map carries the registered effect AND the builtins —
        // including the backdrop-sampling "frost".
        assert!(ts.contains("export interface LayerEffects"), "{ts}");
        assert!(ts.contains("glow: GlowUniforms;"), "{ts}");
        assert!(ts.contains("none: NoneUniforms;"), "{ts}");
        assert!(ts.contains("frost: FrostUniforms;"), "{ts}");
        assert!(ts.contains("export interface FrostUniforms"), "{ts}");
        assert!(ts.contains("blur?: number;"), "{ts}");
        assert!(ts.contains("saturation?: number;"), "{ts}");
        // "none" declares no uniforms → a closed empty shape.
        assert!(
            ts.contains("export type NoneUniforms = Record<string, never>;"),
            "{ts}"
        );
        // The compile-time compat proof, per effect and mapped-type-wrapped
        // (interfaces lack implicit index signatures — the wrap is what makes
        // the check compile), must not be dropped silently.
        assert!(
            ts.contains(
                "AssertLayerUniformsCompat<{ [K in keyof GlowUniforms]: GlowUniforms[K] }>"
            ),
            "{ts}"
        );
        assert!(
            ts.contains(
                "AssertLayerUniformsCompat<{ [K in keyof NoneUniforms]: NoneUniforms[K] }>"
            ),
            "{ts}"
        );
        // The wrapper's supporting types.
        assert!(ts.contains("export type LayerStyleFor<U>"), "{ts}");
        assert!(
            ts.contains("export type LayerProps<E extends keyof LayerEffects>"),
            "{ts}"
        );
        // The typed wrapper: generic over the effect name, defaulting to "none".
        assert!(
            ts.contains("export function Layer<E extends keyof LayerEffects = \"none\">"),
            "{ts}"
        );
        assert!(ts.contains("createElement(\"layer\""), "{ts}");
        // Output is stable across runs.
        assert_eq!(ts, render());
    }
}
