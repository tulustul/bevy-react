# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`bevy-react` drives **`bevy_ui` from a React app** running on an embedded V8 (deno_core) runtime. It is a **Rust crate + JS package** (one repo) plus an example app. React renders through a custom reconciler that emits UI-mutation ops; Rust applies them to the Bevy ECS; interactions and app-level messages flow back.

This is a Cargo workspace (`bevy-react` lib + `macros/` proc-macro crate) **and** an npm workspace (root `package.json` with members `js` and `examples/demos/ui`). The two halves are developed together.

The example (`examples/demos`) is a gallery: a left-nav switches between demos, and React drives the active 3D scene with `bevy.selectScene(id)` (or `null` for an empty viewport). There are three scenes, each a **separate Bevy plugin**: `basic_ui.rs` (cubes driven by `emit`), `bouncing_ball.rs` (one ball that both pushes Bevy→React events as toasts and answers request/response polls), and `anchored.rs` (crowded cubes with world-anchored badges). Only one scene runs at a time: React `emit`s the selection, and a `States` enum (`Scene` in `shared.rs`, variants `None | Cubes | BouncingBall | CrowdedCubes`) gates each scene's systems, with `DespawnOnExit(Scene::…)` scoping its entities.

## Commands

Build / run the example (this is the main way to see it working):

```sh
npm install                          # once
npm run build -w demos-app           # build the React bundle — REQUIRED before running
cargo run --example demos            # run the Bevy app (needs a GPU/window)
npm run watch -w demos-app           # rebuild bundle on change → hot reloads the running app
```

Tests:

```sh
cargo test                           # all Rust tests
cargo test --lib                     # just the library unit tests
cargo test --lib message::tests::exports_typescript   # a single test by path
cargo test --test roundtrip          # headless end-to-end bridge test (real JS runtime)
```

The `roundtrip` test drives the JS thread directly and asserts an initial render + click round trip. **It requires the bundle to be built first** (`npm run build -w demos-app`); if the bundle is missing it skips (passes) with a notice.

Lint / format / typecheck (run from repo root):

```sh
npm run lint          # eslint + tsc (all workspaces) + cargo clippy --workspace --all-targets
npm run typecheck     # tsc --noEmit across JS workspaces
npm run format        # prettier --write . && cargo fmt
npm run format:check  # CI-style check
```

## Architecture: the Rust↔JS bridge

The whole boundary is a dedicated **JS thread** (owns the V8 isolate, runs a `current_thread` tokio runtime) connected to the **Bevy main thread** by channels. Understanding the message flow requires reading `src/js_thread.rs`, `src/plugin.rs`, `src/protocol.rs`, and `js/src/bridge.ts` together.

**Four ops** (`src/js_thread.rs`) form the boundary:

- `op_flush(ops)` — JS→Bevy, sync. The reconciler batches a `Vec<Op>` per commit and flushes it. `serde_v8` deserializes straight into `protocol::Op` — no JSON strings on the hot path.
- `op_emit(name, value)` — JS→Bevy, sync, fire-and-forget app message.
- `op_request(id, name, value)` — JS→Bevy, sync; correlated request awaiting a reply.
- `op_next_event()` — Bevy→JS, **async** (Rust Future → JS Promise). Returns one `protocol::Outbound`.

**Channels** are created in `ReactUiPlugin::build` (`src/plugin.rs`): crossbeam for JS→Bevy (`Vec<Op>`, `ReactMessage`, `RawRequest`), tokio mpsc for Bevy→JS (`Outbound`) and reload signals.

**`Outbound`** (`src/protocol.rs`) is one internally-tagged enum (`uiEvent | event | response | reload`) carrying _everything_ Bevy sends to JS over a single channel. `js/src/bridge.ts`'s `runEventLoop` is a **router**: it `switch`es on the tag and dispatches UI events to React handlers (keyed by node id), named events to listeners, and responses to the awaiting promise. The reconciler→Bevy identity map is `NodeId(u32) → Entity` (`src/bridge.rs`); node id `0` is the UI root. Requests carry their own `u64` correlation id.

The reconciler/render side lives in `js/src/` (`renderer.ts`, `mount.ts`, `bridge.ts`). The Bevy side that consumes ops and produces events: `src/reconcile.rs` (`apply_js_ops`, `collect_ui_events`) and `src/ui_map.rs` (op→`bevy_ui` component mapping).

## Architecture: typed, codegen-synced app messaging

Three app-level channels, all **typed in Rust and mirrored to TypeScript by codegen** (`ts-rs`). Each direction has an attribute macro (`macros/src/lib.rs`), a registry resource, and a slot in the single exporter.

- **React→Bevy notify** — `#[react_message]` → `ReactPayload` (`src/message.rs`). `emit(name, value)` routes by name, deserializes into the typed struct, and `commands.trigger`s it for observers. Register via `app.add_react_handler(observer)`.
- **React→Bevy request/response** — `#[react_request(name, response = T)]` → `ReactRequest` (`src/request.rs`). Observed as `On<Request<T>>`; answered with `req.respond(value)`. The `Responder` is `Clone + Send`, so replies can be deferred across frames. Unknown name / malformed payload **reject** the JS promise (never hang). Register via `app.add_react_request_handler(observer)`.
- **Bevy→React events** — `#[react_event(name)]` → `ReactEvent` (`src/event.rs`). Sent from any system via the `ReactEvents` system param (`events.send(&E)`). Register via `app.add_react_event::<E>()` so the exporter knows the type. JS subscribes with `bevy.on(name, cb)`.

### The codegen sync invariant (important)

The Rust binding structs are the **single source of truth**. `App::export_react_typescript(path)` (`src/message.rs::render_typescript`) walks all three registries in one pass and writes a self-contained `generated.ts`: per-payload type declarations, the `ReactMessages`/`ReactRequests`/`ReactEvents` maps, typed `emit`/`request`/`on` wrappers, and a structured **`bevy` proxy** whose nested methods come from dotted request names (`"board.get"` → `bevy.board.get()`; a void/unit request payload → a zero-arg method).

- The example exposes this via `cargo run --example demos -- --export-bindings <path>` (a flag handled in `examples/demos/main.rs` that builds a bare `App`, runs the shared `register_react_bindings` aggregating every demo's bindings, exports, and returns without `app.run()`). The npm convenience is `npm run gen:bindings -w demos-app`.
- **After changing any `#[react_message]`/`#[react_request]`/`#[react_event]` type, regenerate** and commit `generated.ts`. Output is deterministic (sorted); the CI guarantee is regenerate-then-`git diff --exit-code`. `generated.ts` is `.prettierignore`d so prettier never fights the generator.
- App code imports the typed surface from `./generated` (e.g. `import { bevy, emit } from "./generated"`), **not** the untyped functions from `"bevy-react"`.

## Conventions & gotchas

- **Bevy 0.19**, Rust **edition 2024**. The lib uses `extern crate self as bevy_react` so the macros' `::bevy_react::…` paths resolve inside the crate's own tests/examples.
- Macro-default names lowercase the **first letter** of the struct ident (`Count` → `"count"`); override with `name = "..."`. Dotted names (`"board.get"`) only make sense as explicit overrides and drive the nested proxy.
- `ts-rs` maps Rust integers to TS `number` (precision loss above 2^53 for `i64`/`u64`/`usize`). Newtype/unit structs flatten: `struct Count(usize)` → `type Count = number`, unit structs inline to `null`.
- `#[react_request]`/`#[react_event]` (like `#[react_message]`) expand to `::ts_rs::` and `::serde::` paths, so an external consumer crate must have those as direct deps. Works seamlessly in-repo because examples share the package's deps.
- The example UI lives in `examples/demos/ui` (the dir is `ui`, not `app`); the per-demo React components are under `ui/src/demos/`. It bundles with esbuild (`build` script in its `package.json`) to a single ESM file that `ReactUiPlugin` loads.
