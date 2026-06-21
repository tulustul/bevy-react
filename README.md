# bevy-react

A proof of concept: **drive `bevy_ui` from a React app** running on an embedded
V8 ([deno_core](https://crates.io/crates/deno_core)) runtime. React renders
through a custom reconciler ("react backend") that emits UI mutation ops instead
of touching a DOM; Rust applies them to the Bevy ECS. Clicks flow back so React
can re-render.

## How the Rust↔JS bridge works

The entire boundary is **two channels and two ops**:

```
  Bevy main thread                         JS thread (owns the V8 isolate)
  ─────────────────                        ───────────────────────────────
  apply_js_ops  ◀── ops (crossbeam) ─────  resetAfterCommit → op_flush(ops)
   spawn/patch/despawn bevy_ui              React + react-reconciler
  collect_ui_events ── events (tokio) ───▶ op_next_event() → dispatch handler
   Interaction → UiEvent                    → setState → re-render → flush
```

- **JS → Rust:** the reconciler records ops during a commit and flushes the
  whole batch in `resetAfterCommit` via the sync op `op_flush`. deno_core's
  `serde_v8` deserializes the JS objects straight into the `protocol::Op` enum.
- **Rust → JS:** Bevy pushes `UiEvent`s onto a tokio channel; the async op
  `op_next_event` awaits the next one (Rust Future → JS Promise) and the
  reconciler dispatches it to the React handler. Handlers never cross the
  boundary — only a `{ onClick: true }` marker does; the function stays in a
  JS-side map keyed by node id.
- **Identity:** the reconciler assigns each node a `u32`; Rust keeps a
  `NodeId → Entity` map. Node id `0` is the Bevy UI root.

Threading: the V8 isolate is single-thread-bound, so it lives on its own thread
with a `current_thread` tokio runtime pumping its event loop. tokio is required
by deno_core (its event loop + async ops), not by the bridge design itself.

## Layout

| Path | Role |
|------|------|
| `src/protocol.rs` | serde `Op` / `Props` / `UiEvent` — the wire format |
| `src/bridge.rs` | `JsBridge` resource, channel handles, `RNode` component |
| `src/js_thread.rs` | dedicated JS thread, `op_flush` + `op_next_event`, bundle load |
| `src/reconcile.rs` | `apply_js_ops` + `collect_ui_events` Bevy systems |
| `src/ui_map.rs` | props → `bevy_ui` components |
| `js/src/renderer.ts` | the react-reconciler `HostConfig` (the "react backend") |
| `js/src/bridge.ts` | op buffer, handler registry, event loop |
| `js/src/app.tsx` | the PoC counter app |

## Build & run

Requires Rust ≥ 1.95 (for Bevy 0.19) and Node.

```bash
# 1. Build the JS bundle (React + reconciler → one ESM file)
cd js && npm install && npm run build && cd ..

# 2. Run the app (opens a window with a counter button)
cargo run
```

Click the button → the count increments, round-tripping through the full bridge.

### Headless self-test

Verifies the whole JS↔Rust round trip without a GPU/display (plays the role of
Bevy: asserts the initial render, injects a click, expects the re-render):

```bash
cargo run -- --selftest
# OK   initial render: button id=3, 'Count: 0' present
# OK   click round trip: text updated to 'Count: 1'
# PASS bridge end-to-end
```

## PoC scope / limitations

- Host elements: `node` and `button`, plus text. Strings become text nodes.
- Style subset: width/height (px), flex direction, justify/align, padding,
  margin, gap, background color (hex).
- `insertBefore` currently appends (no list reordering needed by the sample).
- Synchronous (legacy) React rendering, so handler `setState` flushes at once.

Broadening the widget/style coverage (and BSN-based mapping, ordered inserts,
hot reload) is the natural next step once the boundary is proven.
