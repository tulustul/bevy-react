# bevy-react

Build [`bevy_ui`](https://docs.rs/bevy/latest/bevy/ui/index.html) interfaces with
**React**. You write components in React/TSX and they render to native Bevy UI —
no web view, no DOM. State and interactions flow both ways between your Bevy app
and React, and edits hot-reload live while keeping component state.

## Project status

Currently, the project is a **quick, vibecoded proof of concept** demonstrating the idea. The API is very unstable and will change, the code quality is not satisfying.
**Do not use it in production**

<!-- TODO: screenshots / demo gif -->

```tsx
import { mount } from "bevy-react";
import { useState } from "react";

function App() {
  const [n, setN] = useState(0);
  return (
    <node style={{ padding: 20, gap: 12, flexDirection: "column" }}>
      <text>{`Count: ${n}`}</text>
      <button
        onClick={() => setN((c) => c + 1)}
        style={{ backgroundColor: "#7aa2f7" }}
      >
        <text>+</text>
      </button>
    </node>
  );
}

await mount(<App />);
```

That's a real component — `<node>` and `<button>` render to actual `bevy_ui`
nodes, `useState` works as you'd expect, and saving the file updates the running
app without losing the count.

## Why bevy-react

- **React, not a bespoke UI DSL.** Hooks, components, conditional rendering, lists —
  everything you already know.
- **Native Bevy UI.** No browser, no web view. Your UI is `bevy_ui` entities in the
  same world as your game.
- **Hot reload that keeps state.** Edit a component and it re-renders live with hook
  state and running animations intact.
- **Typed, two-way messaging.** React and the ECS talk over typed channels generated
  straight from your Rust types.

## Features

### Elements & styling

Host elements `<node>`, `<button>`, `<text>`, `<image>`, `<editableText>`, and
`<canvas>` cover layout, input, and drawing. Style them with a flexbox/grid object
(colors, spacing, borders, radius, shadows, transforms).

```tsx
<node
  style={{
    flexDirection: "row",
    gap: 16,
    padding: 20,
    backgroundColor: "#1e1e2e",
    borderRadius: 8,
  }}
>
  <text style={{ fontSize: 18, color: "#cdd6f4" }}>Hello</text>
</node>
```

### Hover & press states

Overlay extra style while an element is hovered or pressed — no state wiring needed.

```tsx
<button
  onClick={() => save()}
  style={{ backgroundColor: "#7aa2f7" }}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ backgroundColor: "#5a7fd6" }}
>
  <text>Save</text>
</button>
```

### Pointer & drag

`onPointerDown` / `onPointerMove` / `onPointerUp` give you drag gestures, with both
element-normalized (`x`, `y`) and window (`clientX`, `clientY`) coordinates.

```tsx
<node
  onPointerDown={(e) => start(e.clientX, e.clientY)}
  onPointerMove={(e) => drag(e.clientX, e.clientY)}
  onPointerUp={() => drop()}
/>
```

### Transitions

Ease changes to a style by listing which properties should animate, with timing or
spring config.

```tsx
<button
  onClick={() => setOn((v) => !v)}
  style={{
    backgroundColor: on ? "#a6e3a1" : "#45475a",
    transform: { translateX: on ? 36 : -36 },
    transition: {
      transform: { stiffness: 180, damping: 14 }, // spring
      backgroundColor: { duration: 200 }, // timing (ms)
    },
  }}
>
  <text>{on ? "ON" : "OFF"}</text>
</button>
```

### Animations

For richer motion, use Reanimated-style shared values driven on the Bevy side (no
per-frame JS). Create a value with `useSharedValue`, assign it a driver, and bind it
through `animatedStyle` on an `Animated.*` element.

```tsx
import { Animated, useSharedValue, withRepeat, withTiming } from "bevy-react";
import { useEffect } from "react";

function Pulse() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: 500, easing: "easeInOut" }),
      -1, // repeat forever
      true, // ping-pong
    );
  }, [opacity]);

  return (
    <Animated.node
      style={{ width: 80, height: 80 }}
      animatedStyle={{ opacity }}
    />
  );
}
```

Drivers: `withTiming`, `withSpring`, `withRepeat`, `withSequence`, `withDelay`, plus
`interpolate` / `interpolateColor` to map one value through a curve.

### Fonts

Register a font on the host, then select it by name in any `<text>` style.

```rust
ReactUiPlugin::new("ui/dist/app.js").font("DancingScript", "assets/dancing.ttf")
```

```tsx
<text style={{ fontFamily: "DancingScript", fontSize: 34 }}>Fancy</text>
```

### Canvas drawing

`<canvas>` takes a `draw` callback with an HTML-canvas-like context; the result is
rasterized into a texture. Returning fresh drawing each render makes it reactive.

```tsx
<canvas
  style={{ width: 460, height: 260 }}
  draw={(ctx) => {
    ctx.strokeStyle = "#89b4fa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.bezierCurveTo(100, 0, 200, 150, 300, 20);
    ctx.stroke();
  }}
/>
```

### World-anchored overlays

Pin UI to a 3D entity so it tracks the entity on screen as the camera moves.

```tsx
import { Anchored } from "bevy-react";

<Anchored.node entity={cube} offset={[0, 1, 0]} style={{ padding: 8 }}>
  <text>Label</text>
</Anchored.node>;
```

### Talking to Bevy

Three typed channels connect React and the ECS:

- **Notify** — `bevy.foo.set(value)` (or `emit(name, value)`): fire-and-forget
  React → Bevy.
- **Request** — `await bevy.foo.get()` (or `request(name, value)`): ask Bevy and
  await a reply.
- **Subscribe** — `bevy.on(name, cb)`: receive Bevy → React events; returns an
  unsubscribe function.

**1. Define the channel in Rust** with a macro and register it on the `App`:

```rust
use bevy::prelude::*;
use bevy_react::{ReactAppExt, ReactEvents, react_event, react_message};

// React → Bevy: `bevy.game.reset()`.
#[react_message(name = "game.reset")]
struct Reset;

fn on_reset(_: On<Reset>, /* queries, resources… */) {
    // reset the game
}

// Bevy → React: `bevy.on("game.scored", …)`.
#[react_event(name = "game.scored")]
struct Scored;

fn award_point(events: ReactEvents) {
    events.send(&Scored);
}

app.add_react_handler(on_reset);
app.add_react_event::<Scored>();
```

**2. Generate the typed client** that React imports from `./generated`. Add an export
path to your app — typically a flag that builds the `App`, registers your channels,
and calls `app.export_react_typescript("ui/src/generated.ts")` (see
[SETUP.md](./SETUP.md#talking-to-bevy-typed-channels)) — then run it (re-run whenever
you add or change a channel):

```sh
cargo run -- --export-bindings ui/src/generated.ts
```

**3. Use it from React:**

```tsx
import { bevy } from "./generated";
import { useEffect, useState } from "react";

function Score() {
  const [hits, setHits] = useState(0);

  useEffect(() => bevy.on("game.scored", () => setHits((h) => h + 1)), []);

  return (
    <button onClick={() => bevy.game.reset()}>
      <text>{`Hits: ${hits}`}</text>
    </button>
  );
}
```

See [SETUP.md](./SETUP.md#talking-to-bevy-typed-channels) for the request (await a
reply) and event (Bevy → React) channels.

## Getting started

See **[SETUP.md](./SETUP.md)** for setting up a new project end to end — the Rust
host, the React app, bundling, and typed bindings.

bevy-react is a Rust crate (`bevy-react`) plus an npm package (`bevy-react`),
developed together. Both are `0.1.0` and not yet published, so for now you depend on
them by path or git.

## The demos app

[`examples/demos`](./examples/demos) is a gallery that exercises every feature above,
with a left-nav that switches between live demos. It's the best **reference
implementation** — each demo is a small, self-contained component you can read and
copy when wiring up your own UI, messaging, or animations.

```sh
npm install
npm run build -w demos-app
cargo run --example demos
```

## Contributing

The internals — the Rust↔JS bridge, hot-reload mechanics, and codegen — are
documented in [`CLAUDE.md`](./CLAUDE.md).
