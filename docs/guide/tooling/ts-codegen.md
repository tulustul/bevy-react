---
description: The generated bevy.ts mirrors your Rust bindings in TypeScript, with typed emit, request and on, the bevy proxy, and typings for filters, styles and elements.
---

# TypeScript codegen

`App::export_react_typescript(path)` writes one self-contained TypeScript
module, conventionally `src/bevy.ts`, from everything registered on an `App`:
your `#[react_message]`, `#[react_request]` and `#[react_event]` types, your
filters, style properties and elements, plus bevy-react's built-ins. The Rust
types are the single source of truth; the file is regenerated, never edited.
[Getting started](../getting-started.md#generate-the-typed-client) sets up the
`--export-bindings` flag. This page covers what the file contains and how to
keep it in sync.

## Usage

Declare the bindings in Rust, then call them through the generated `bevy`
object:

```tsx
import { useEffect, useState } from "react";
import { bevy } from "./bevy";

export function Hud() {
  const [points, setPoints] = useState(0);
  useEffect(() => bevy.on("game.over", (e) => setPoints(e.points)), []);
  return (
    <button
      onClick={async () => {
        bevy.game.setSpeed(2);
        setPoints((await bevy.game.score()).points);
      }}
    >
      <text>{`${points} points`}</text>
    </button>
  );
}
```

```rust
use bevy::prelude::*;
use bevy_react::prelude::*;

#[react_message(name = "game.setSpeed")]
struct SetSpeed(f32);

#[react_request(name = "game.score", response = Score)]
struct GetScore;

#[derive(serde::Serialize, ts_rs::TS)]
struct Score {
    points: u32,
}

#[react_event(name = "game.over")]
struct GameOver {
    points: u32,
}

pub fn register_bindings(app: &mut App) {
    app.add_react_handler(|on: On<SetSpeed>| info!("speed {}", on.event().0))
        .add_react_request_handler(|req: On<Request<GetScore>>| {
            req.respond(Score { points: 42 });
        })
        .add_react_event::<GameOver>();
}
```

Regenerate after any change to these types:

```sh
cargo run -- --export-bindings ui/src/bevy.ts
```

The `#[react_*]` macros derive serde and ts-rs for the type they annotate.
Types you define yourself, like a response or a nested field type, derive
`serde::Serialize` or `Deserialize` and `ts_rs::TS` directly, so your crate
needs `serde` and `ts-rs` as dependencies for them.

## What `bevy.ts` contains

- **Type declarations.** One `export type` per message, request, response,
  event and filter-params type, and every named type they reference,
  each declared once. Rust doc comments on fields become JSDoc.
- **Name maps.** `ReactMessages` (name to payload), `ReactRequests` (name to
  `{ request; response }`) and `ReactEvents` (name to payload).
- **Typed functions.** `emit(name, value)`, `request(name, value)`,
  `on(name, cb)` and `removeEventListener(name, cb)`, checked against the
  maps. `on` returns an unsubscribe function, so it can be returned from a
  `useEffect` as is.
- **The `bevy` object.** A method per message and request (see below).
- **Augmentations of the `bevy-react` package** in
  `declare module "bevy-react"` blocks:
  - `BevyFilters`: every regular filter and its params type, built-ins
    included. It types the `filter` and `backdropFilter` styles (see
    [Filters](../styling/filters.md)).
  - `BevyMorphFilters`: every morph filter, for the `morphFilter` style (see
    [Morph filters](../styling/morph-filters.md)).
  - `BevyStyle`: your own style properties (see
    [Custom styles](../extending/custom-styles.md)). The core properties are
    typed by the package itself.
  - `BevyIntrinsicElements`: the JSX props of every non-core element,
    feature elements like `<svg>` or `<portal>` and your own (see
    [Custom elements](../extending/custom-elements.md)).

The built-in bindings are always included, even though the exporter's `App`
never adds `ReactUiPlugin`: the `keyDown`, `keyUp` and `resize` events, the
gamepad events, messages and `gamepad.getAll` request, the `window.size`
request, and every built-in filter. See [Keyboard](../events/keyboard.md),
[Gamepad](../events/gamepad.md) and [Window](../events/window.md). An app
binding that reuses a built-in name is left out of the file. A custom filter
with a built-in's name replaces the built-in, at runtime and in the file.

Until the file is generated, the filter styles accept no value and the
feature elements don't type-check. The augmentations only apply while
`bevy.ts` is part of the TypeScript program: keep it inside the `include` of
your `tsconfig.json` (the scaffolded `src/` is).

## The `bevy` object

Every message and every request becomes a method. Dots in a binding's name
nest it: `"game.score"` becomes `bevy.game.score()`, and a name without dots
becomes a top-level method. Messages and requests can share a namespace.

- A message method takes the payload and returns `void`.
- A request method returns a `Promise` of the response. It takes the payload,
  or no argument when the request type is a unit struct (`struct GetScore;`).
- Events are not methods: subscribe with `bevy.on(name, cb)`.
- `bevy.emit`, `bevy.request`, `bevy.on`, `bevy.addEventListener` (the same
  function as `on`) and `bevy.removeEventListener` are the typed functions
  above, for when the name is a variable.

A binding's name defaults to its struct name with the first letter lowercased
(`SetSpeed` becomes `"setSpeed"`); `name = "..."` in the attribute overrides
it. The export panics with a message naming the binding when the names can't
form one object:

- a top-level name equal to `emit`, `request`, `on`, `addEventListener` or
  `removeEventListener`,
- a name used both as a method and as a namespace (`"game"` and
  `"game.score"`),
- a message and a request with the same name.

Rename the binding, for example by giving it a namespace.

## One registration site

The exporter builds a bare `App`: no `DefaultPlugins`, no window, no JS
runtime. It only sees what you register on it, so put every registration in
one `register_bindings(app)` function that both your plugin and the exporter
call:

```rust
pub struct GamePlugin;

impl Plugin for GamePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        // systems, resources…
    }
}

// In `main`, on `--export-bindings <path>`:
let mut app = App::new();
ReactPlugins::register_bindings(&mut app);
register_bindings(&mut app);
app.export_react_typescript(&path)?;
```

The two sides drift silently when they differ. A binding registered only in
the running app is missing from the types; one registered only in the
exporter is typed but has no handler at runtime. The same goes for
`add_react_filter`, `add_react_morph_filter`, `add_react_element` and
`add_react_style`: keep those calls in the shared function too.

`ReactPlugins::register_bindings(app)` registers the elements of every
compiled-in feature plugin (`<svg>` and its shapes, `<anchor>`, `<canvas>`,
`<portal>`, `<surface>`) and nothing else. It follows your cargo features, so
the generated JSX types match the build. A plugin left out with
`.disable::<P>()` is still typed.

The `--export-bindings` flag is a convention. `export_react_typescript` works
from any entry point with an `App`, such as a test or a build task, and
creates missing parent directories. The demos app shares a
`register_bindings` per scene between each plugin and its exporter in
[`examples/demos/main.rs`](../../../examples/demos/main.rs).

## Keeping it in sync

Regenerate `bevy.ts` after you change any `#[react_*]` type, add or remove a
registration, or change your cargo features. The output is deterministic
(sorted by name), so commit it and let CI check that it is current:

```sh
cargo run -- --export-bindings ui/src/bevy.ts
git diff --exit-code -- ui/src/bevy.ts
```

Exclude `bevy.ts` from your formatter (`**/bevy.ts` in `.prettierignore`), or
reformatting breaks that check.

Import the typed surface from `./bevy` (`import { bevy, emit } from "./bevy"`),
not the untyped `emit`, `request` and `addEventListener` from `"bevy-react"`.
Calls through `./bevy` are checked against the same structs Bevy serializes.
The scaffolded placeholder `bevy.ts` re-exports the untyped functions until
the first generation.

## Type mapping

Types are rendered by [ts-rs](https://crates.io/crates/ts-rs). The mappings
to watch:

| Rust                                    | TypeScript                              |
| --------------------------------------- | --------------------------------------- |
| `u8`–`u32`, `i8`–`i32`, `f32`, `f64`    | `number`                                |
| `usize`, `isize`                        | `number`, exact only up to 2^53         |
| `u64`, `i64`, `u128`, `i128`            | `bigint`                                |
| `Option<T>`                             | `T \| null`                             |
| `Vec<T>`                                | `Array<T>`                              |
| newtype struct (`struct SetSpeed(f32)`) | an alias of the inner type (`= number`) |
| unit struct (`struct GetScore;`)        | `null`                                  |
| enum                                    | a union in serde's representation       |

- **64-bit integers are typed `bigint` but arrive as `number`.** Payloads
  cross as JSON numbers, so a `u64` from Bevy is a plain `number` at runtime
  while it fits in 2^53. Prefer `u32` or `f64` for numbers React computes
  with.
- **Field names cross unchanged.** `points_total` stays `points_total`. To
  get camelCase in both the JSON and the type, set the rename for serde and
  ts-rs alike, as the built-in payloads do:

```rust
#[react_event(name = "game.over")]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
struct GameOver {
    points_total: u32, // `pointsTotal` in JSON and in bevy.ts
}
```

The generated filter entries are listed with their params in the
[filter reference](../reference/filters.md).
