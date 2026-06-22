# bevy-react

Drive **`bevy_ui` from a React app** running on an embedded V8
([deno_core](https://crates.io/crates/deno_core)) runtime. React renders through
a custom reconciler ("react backend") that emits UI mutation ops instead of
touching a DOM; Rust applies them to the Bevy ECS. Clicks flow back so React can
re-render. Includes hot reload.

This repo is a **library** (Rust crate + JS package) plus an example app.

## How the Rust↔JS bridge works

The UI core is **two channels and two ops** (app-level messaging — `emit`,
requests, events — adds two more ops over the same threads; see below):

```
  Bevy main thread                         JS thread (owns the V8 isolate)
  ─────────────────                        ───────────────────────────────
  apply_js_ops  ◀── ops (crossbeam) ─────  resetAfterCommit → op_flush(ops)
   spawn/patch/despawn bevy_ui              React + react-reconciler
  collect_ui_events ── outbound (tokio) ─▶ op_next_event() → route by kind
   Interaction → UiEvent                    → setState → re-render → flush
```

- **JS → Rust:** the reconciler records ops during a commit and flushes the
  batch in `resetAfterCommit` via the sync op `op_flush`. deno_core's `serde_v8`
  deserializes the JS objects straight into the `Op` enum.
- **Rust → JS:** Bevy pushes a single `Outbound` stream onto a tokio channel; the
  async op `op_next_event` awaits the next one (Rust Future → JS Promise) and the
  JS loop routes it by kind — UI events to React handlers, named events to
  listeners, request responses to the awaiting promise. Handlers never cross the
  boundary — only a `{ onClick: true }` marker does.
- **Identity:** the reconciler assigns each node a `u32`; Rust keeps a
  `NodeId → Entity` map. Node id `0` is the Bevy UI root. Requests carry their own
  `u64` correlation id.

The V8 isolate is single-thread-bound, so it lives on its own thread with a
`current_thread` tokio runtime pumping its event loop.

## Using the library

### Rust (the host)

Add the plugin and point it at a built JS bundle:

```rust
use bevy::prelude::*;
use bevy_react::ReactUiPlugin;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(ReactUiPlugin::new("path/to/dist/bundle.js"))
        // .hot_reload(false)  // default: true
        // .spawn_camera(false) // default: true (spawns a Camera2d)
        .run();
}
```

`ReactUiPlugin` owns the JS thread, the op/event channels, the UI root entity,
and (by default) hot reload.

### JS (the app)

Install `bevy-react` + `react` + `react-reconciler`, write components with the
`node`/`button` host elements, and `mount` your tree:

```tsx
import { mount } from "bevy-react";
import "bevy-react/jsx"; // <node>/<button> JSX typings
import React, { useState } from "react";

function App() {
  const [n, setN] = useState(0);
  return (
    <node style={{ padding: 20, gap: 12 }} backgroundColor="#1e1e2e">
      {`Count: ${n}`}
      <button onClick={() => setN((c) => c + 1)} backgroundColor="#7aa2f7">
        +
      </button>
    </node>
  );
}

await mount(<App />);
```

Bundle it to a single ESM file with esbuild (see the example's `build` script)
and hand that path to `ReactUiPlugin`.

### React → Bevy messages

Beyond UI, React can push app-level signals into the ECS with `emit(name,
value)`:

```tsx
// JS: send the current count whenever it changes
import { emit } from "bevy-react";
useLayoutEffect(() => emit("count", count), [count]);
```

On the Rust side you tag a payload struct with `#[react_message]` and handle it
with a normal Bevy observer. The plugin owns the single channel read: it routes
each message by name, deserializes the JSON into your type, and triggers it — no
manual read-loop or `serde_json::Value` juggling. The payload deserializes
straight from the emitted value, so its shape must match what JS sends
(`emit("count", 5)` → a number, so a newtype):

```rust
use bevy_react::{react_message, ReactAppExt};

#[react_message]              // emit name defaults to "count" (struct name, lowercased)
struct Count(usize);          // use #[react_message(name = "...")] to override

// register the payload and attach the observer in one call:
app.add_react_handler(|count: On<Count>, /* ...any system params... */| {
    let n = count.event().0;  // typed
});
```

An `emit` with no registered name logs a warning; a payload that fails to
deserialize logs an error — neither panics.

### Requests and events (the full duplex)

`emit` is one of three app-level channels. The other two:

**React → Bevy requests** — an awaitable call with a typed reply. Tag a request
struct with `#[react_request]` (giving it a response type), register an observer,
and answer it with `req.respond(...)` (synchronously, or later — the `Responder`
is `Clone + Send`, so you can store it and reply across frames):

```rust
#[react_request(name = "board.get", response = Board)]
struct BoardGet;                       // unit payload → `bevy.board.get()` takes no args

app.add_react_request_handler(|req: On<Request<BoardGet>>, board: Res<Board>| {
    req.respond(board.clone());
});
```

An unknown request name or a malformed payload replies with an error (the JS
promise rejects) rather than hanging.

**Bevy → React events** — a named broadcast React subscribes to. Tag the payload
with `#[react_event]`, register it, and send it from any system:

```rust
#[react_event(name = "user.disconnected")]
struct UserDisconnected { user_id: String }

app.add_react_event::<UserDisconnected>();

fn on_drop(mut events: ReactEvents) {
    events.send(&UserDisconnected { user_id: "abc".into() });
}
```

### Typed bindings, synced from Rust

The Rust `#[react_message]` / `#[react_request]` / `#[react_event]` types are the single
source of truth. Each derives [`ts-rs`](https://docs.rs/ts-rs)' `TS`, and
`App::export_react_typescript(path)` walks everything you've registered and writes one
self-contained TypeScript module: a type per payload, the `ReactMessages` /
`ReactRequests` / `ReactEvents` maps, typed `emit` / `request` / `on` wrappers, and a
structured **`bevy` proxy** whose nested methods come from dotted request names
(`"board.get"` → `bevy.board.get()`).

Add a small exporter entry point that registers the same handlers as your app and call
the exporter (see `examples/counter/main.rs`'s `--export-bindings` flag and the
`gen:bindings` npm script):

```tsx
// JS: every call below is type-checked against the Rust types.
import { bevy, emit } from "./generated"; // generated; do not edit

emit("count", count); // React → Bevy notify
const board = await bevy.board.get(); // React → Bevy request (awaited)
const stop = bevy.on("user.disconnected", (e) => console.log(e.userId)); // Bevy → React
```

```sh
# regenerate after changing the Rust types
cargo run --example counter -- --export-bindings examples/counter/ui/src/generated.ts
```

Commit the generated file and, in CI, regenerate then `git diff --exit-code` it: if a
Rust type changes without regenerating, the build fails — so the TypeScript can never
drift from Rust.

### Host elements & styling

Host elements: `node` (flex/grid container), `button`, `image`, and `text`; a
bare string outside any `<text>` becomes a default (white) text node. An `image`
takes `src` (an asset path resolved by Bevy's `AssetServer`, relative to your
app's `assets/` folder), or renders a solid `tint` color when `src` is omitted
(plus `flipX`/`flipY`/`imageMode`).

**Text.** Like React Native, text is styled through a `<text>` element (Bevy
puts styling on the text entity, not the parent, with no inheritance). `<text>`
is nestable — a nested `<text>` restyles a run, mapping to Bevy's `Text` /
`TextSpan` hierarchy. Text style keys live in `style`: `color`, `fontSize`,
`fontWeight`, and `textAlign` (`textAlign` applies to the `<text>` root only):

```tsx
<text style={{ color: "#cdd6f4", fontSize: 22, fontWeight: "bold" }}>
  Cubes: <text style={{ color: "#7aa2f7" }}>{count}</text>
</text>
```

Styling is **CSS-like** and covers essentially all of `bevy_ui::Node` plus its
sibling visual components:

```tsx
<node
  style={{
    // lengths: a number = px; strings carry units
    width: 380,
    height: "50%",
    maxWidth: "100vw",
    flexBasis: "auto",
    // flexbox + alignment
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    // CSS grid
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridColumn: "1 / 3",
    // box: rects accept a number, "8px 16px" shorthand, or {top,right,bottom,left}
    padding: "8px 16px",
    margin: 24,
    border: 2,
    borderRadius: 12,
    // visual components
    backgroundColor: "#1e1e2e",
    borderColor: "#7aa2f7",
    zIndex: 10,
    outline: { width: 2, color: "#fff" },
    boxShadow: { color: "#0008", xOffset: 0, yOffset: 4, blurRadius: 8 },
  }}
/>
```

Import `BevyStyle` from `bevy-react/jsx` for the full typed key list.

## Repo layout

| Path                                                  | Role                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `src/lib.rs`                                          | crate root; public `ReactUiPlugin`                           |
| `src/plugin.rs`                                       | the plugin: JS thread, systems, UI root, hot-reload watcher  |
| `src/{protocol,bridge,js_thread,reconcile,ui_map}.rs` | the bridge internals                                         |
| `tests/roundtrip.rs`                                  | headless end-to-end bridge test                              |
| `js/`                                                 | the `bevy-react` JS library (reconciler, `mount`, JSX types) |
| `examples/counter/`                                   | example: Rust binary (`main.rs`) + React app (`app/`)        |

It's an npm workspace (`js` + `examples/counter/app`) so React resolves to one
copy.

## Build, run, verify

Requires Rust ≥ 1.95 (Bevy 0.19) and Node.

```bash
# 1. Install JS deps (workspace) and build the example bundle
npm install
npm run build -w counter-app

# 2. Headless bridge test (no GPU needed)
cargo test            # tests/roundtrip.rs → PASS

# 3. Run the example (opens a window)
cargo run --example counter
```

The example overlays the React UI (top of the window) on a live 3D scene; the
counter (`+`/`-`/`reset`, clamped to 0–8, default 3) drives how many spinning
cubes are in the scene — `emit("count", n)` → `ReactMessage` → cubes. This shows
React rendering UI _and_ steering the Bevy world.

### Hot reload

Run the bundler in watch mode and the app side by side:

```bash
npm run watch -w counter-app   # esbuild rebuilds dist/bundle.js on save
cargo run --example counter    # in another terminal
```

Edit `examples/counter/app/src/App.tsx`; esbuild rebuilds, the host polls the
bundle's mtime, and the JS runtime is rebuilt from the new bundle:

```
edit app → esbuild --watch rewrites dist/bundle.js
  → ReactUiPlugin watcher sees new mtime → reload signal
  → JS thread rebuilds the V8 runtime → reset op + fresh render → host updates
```

**Limitation:** full reload, so React state resets (the counter returns to 0 on
edit). State-preserving Fast Refresh (react-refresh runtime + transform) is a
worthwhile follow-up, not yet implemented.
