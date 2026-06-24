# Setting up a new project

A bevy-react project has two halves: a **Rust host** (the Bevy app) and a **React
app** that builds to a JS bundle the host loads at runtime.

If you'd rather copy a working setup than assemble one, the [`examples/demos`](./examples/demos)
app is a complete, idiomatic reference — host, build script, bindings, and a gallery
of components.

## 1. Rust host

```toml
# Cargo.toml
[dependencies]
bevy = "0.19"
bevy-react = { path = "../bevy-react/crates/core" } # path or git until published
```

```rust
// src/main.rs
use bevy::prelude::*;
use bevy_react::ReactUiPlugin;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(ReactUiPlugin::new("ui/dist/app.js"))
        // `bevy_ui` needs a camera to render — the plugin doesn't spawn one, so
        // provide your own (a `Camera2d`, or any camera that renders UI).
        .add_systems(Startup, |mut commands: Commands| {
            commands.spawn(Camera2d);
        })
        .run();
}
```

`ReactUiPlugin` takes the path to your built app bundle. Builder options (defaults
shown):

- `.hot_reload(true)` — apply bundle edits live, preserving hook state.
- `.with_animations(true)` — enable the animation engine.
- `.default_font("assets/font.ttf")` — app-wide default font.
- `.font("Name", "assets/name.ttf")` — register a named font for `fontFamily`.

## 2. React app

Install the JS dependencies:

```sh
npm install bevy-react react react-reconciler
```

Point JSX at the bevy-react runtime in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "bevy-react"
  }
}
```

Bundle with the provided build helpers — this emits **two** files, `dist/vendor.js`
(the runtime) and `dist/app.js` (your components), both of which must exist before
you run the host:

```js
// build.mjs
import { buildVendor, buildApp } from "bevy-react/build-lib";

const cwd = process.cwd();
await buildVendor({ outfile: "dist/vendor.js", cwd });
await buildApp({ entry: "src/index.tsx", outfile: "dist/app.js", cwd });
```

Your entry point mounts the tree:

```tsx
// src/index.tsx
import { mount } from "bevy-react";
import { App } from "./App";

mount(<App />);
```

## 3. Run it

```sh
npm run build   # → dist/vendor.js + dist/app.js
cargo run       # launches the Bevy app and loads the bundle
```

Run the bundler in watch mode while developing — saving a component re-applies it
live, keeping its `useState` and running animations intact.

## Talking to Bevy (typed channels)

React and the ECS communicate over three channels. Each one is **defined in Rust**
with an attribute macro, **registered** on the `App`, and then exposed to React as a
typed `bevy` proxy you import from `./generated`. After defining or changing any of
these types, regenerate the client (see [Generating the client](#generating-the-client)
below) and commit the result.

The payload/response types must derive `Serialize` and `ts_rs::TS` (the macros add
these for the type they annotate; any _nested_ reply or event struct needs them too),
so a consumer crate needs `serde` and `ts-rs` as direct dependencies:

```toml
serde = { version = "1", features = ["derive"] }
ts-rs = "11"
```

### Notify — React → Bevy, fire-and-forget

```rust
use bevy::prelude::*;
use bevy_react::{ReactAppExt, react_message};

// A dotted name nests the method: `bevy.basicDemo.setCount(n)`.
#[react_message(name = "basicDemo.setCount")]
struct SetCount(usize);

// Handle it with an observer; read the payload via `.event()`.
fn apply_set_count(count: On<SetCount>, mut desired: ResMut<DesiredCubes>) {
    desired.0 = count.event().0;
}

// Register it on the App.
app.add_react_handler(apply_set_count);
```

```tsx
import { bevy } from "./generated";

bevy.basicDemo.setCount(3); // or: emit("basicDemo.setCount", 3)
```

### Request — React → Bevy, await a reply

```rust
use bevy::prelude::*;
use bevy_react::{ReactAppExt, Request, react_request};
use serde::Serialize;
use ts_rs::TS;

// A unit payload → the generated method takes no argument.
#[react_request(name = "pollingDemo.getBall", response = BallState)]
struct GetBall;

// The reply type.
#[derive(Serialize, TS)]
struct BallState {
    x: f32,
    y: f32,
}

// Always respond (or reject) so the JS promise never hangs.
fn report_ball(req: On<Request<GetBall>>, balls: Query<&Transform>) {
    match balls.single() {
        Ok(t) => req.respond(BallState { x: t.translation.x, y: t.translation.y }),
        Err(_) => req.respond_err("ball not active"),
    }
}

app.add_react_request_handler(report_ball);
```

```tsx
const ball = await bevy.pollingDemo.getBall(); // typed as BallState
```

### Event — Bevy → React, subscribe

```rust
use bevy::prelude::*;
use bevy_react::{ReactAppExt, ReactEvents, react_event};

#[react_event(name = "bevyEventsDemo.ballBounced")]
struct BallBounced {
    speed: f32,
}

// Send from any system via the `ReactEvents` param.
fn bounce(events: ReactEvents) {
    events.send(&BallBounced { speed: 4.0 });
}

app.add_react_event::<BallBounced>();
```

```tsx
import { useEffect } from "react";
import { bevy } from "./generated";

// `bevy.on` returns an unsubscribe function.
useEffect(
  () => bevy.on("bevyEventsDemo.ballBounced", (e) => toast(e.speed)),
  [],
);
```

### Generating the client

There is no built-in command — you generate the client by calling
`App::export_react_typescript(path)` from your own app. The convention is a flag that
builds a bare `App`, runs your channel registrations, exports, and returns without
`run()`ing (so it needs no window or JS runtime):

```rust
// in main(), before adding DefaultPlugins / ReactUiPlugin:
let mut args = std::env::args().skip(1);
if args.next().as_deref() == Some("--export-bindings") {
    let path = args.next().expect("--export-bindings requires an output path");
    let mut app = App::new();
    register_react_bindings(&mut app); // your add_react_* calls, factored out
    app.export_react_typescript(&path).expect("failed to write bindings");
    return;
}
```

Run it (and re-run after changing any channel, then commit the output):

```sh
cargo run -- --export-bindings ui/src/generated.ts
```

A `package.json` script keeps it handy:

```json
{
  "scripts": {
    "gen:bindings": "cargo run -- --export-bindings ui/src/generated.ts"
  }
}
```

[`examples/demos`](./examples/demos) defines all three channels across its demos —
read those for a complete, working reference.
