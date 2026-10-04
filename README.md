<p align="center">
  <img src="https://raw.githubusercontent.com/tulustul/bevy-react/main/examples/assets/bevy-react-logo.png" alt="bevy-react logo" width="220" />
</p>

<h1 align="center">bevy-react</h1>

<p align="center">
  <a href="https://github.com/tulustul/bevy-react/actions/workflows/ci.yml"><img src="https://github.com/tulustul/bevy-react/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://crates.io/crates/bevy-react"><img src="https://img.shields.io/crates/v/bevy-react" alt="crates.io" /></a>
  <a href="https://www.npmjs.com/package/bevy-react"><img src="https://img.shields.io/npm/v/bevy-react" alt="npm" /></a>
  <a href="https://docs.rs/bevy-react"><img src="https://img.shields.io/docsrs/bevy-react" alt="docs.rs" /></a>
  <a href="#bevy-compatibility"><img src="https://img.shields.io/badge/bevy-0.19-232326?logo=bevy" alt="bevy 0.19" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue" alt="license: MIT OR Apache-2.0" /></a>
</p>

Build [`bevy_ui`](https://docs.rs/bevy/latest/bevy/ui/index.html) interfaces with
**React**. You write components in React/TSX and they render to native Bevy UI
through a **React Native-style bridge** - **no web view, no DOM**. The JS side stays
purely declarative; Rust and Bevy do the heavy lifting. State and interactions flow
both ways between your Bevy app and React, and edits hot-reload live while keeping
component state.

**[Documentation](https://tulustul.github.io/bevy-react/)** ·
**[Live demo](https://tulustul.github.io/bevy-react/demo/)** (the web build of the
demos gallery, running in your browser)

![The bevy-react demos home page: the React and Bevy logos above six live demo cards (shared elements, layout animations, filters, morphing, hot reload and typed messages).](https://raw.githubusercontent.com/tulustul/bevy-react/main/screenshots/home.webp)

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

mount(<App />);
```

That's a real component - `<node>` and `<button>` render to actual `bevy_ui`
nodes, `useState` works as you'd expect, and saving the file updates the running
app without losing the count.

## Getting started

```sh
cargo add bevy-react
npx bevy-react init ui
cd ui && npm install && npm run watch
```

```rust
use bevy::prelude::*;
use bevy_react::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        // Loads `ui/dist/app.js` and `ui/dist/vendor.js`.
        .add_plugins(ReactPlugins)
        .add_systems(Startup, |mut commands: Commands| {
            commands.spawn(Camera2d);
        })
        .run();
}
```

The [Getting started](https://tulustul.github.io/bevy-react/getting-started/)
guide covers configuration, cargo features, and the typed client.

## Features

- **Elements:** [`<node>`](https://tulustul.github.io/bevy-react/elements/node/),
  [`<button>`](https://tulustul.github.io/bevy-react/elements/button/),
  [`<text>`](https://tulustul.github.io/bevy-react/elements/text/),
  [`<editableText>`](https://tulustul.github.io/bevy-react/elements/editable-text/),
  [`<image>`](https://tulustul.github.io/bevy-react/elements/image/),
  [`<canvas>`](https://tulustul.github.io/bevy-react/elements/canvas/),
  [`<svg>`](https://tulustul.github.io/bevy-react/elements/svg/),
  [`<portal>`](https://tulustul.github.io/bevy-react/elements/portal/),
  [`<surface>`](https://tulustul.github.io/bevy-react/elements/surface/) (UI on a
  3D mesh), [`<root>`](https://tulustul.github.io/bevy-react/elements/root/),
  [`<anchor>`](https://tulustul.github.io/bevy-react/elements/anchor/)
  (world-anchored overlays)
- **Layout:** [flexbox](https://tulustul.github.io/bevy-react/layout/flexbox/),
  [grid](https://tulustul.github.io/bevy-react/layout/grid/),
  [positioning](https://tulustul.github.io/bevy-react/layout/positioning/)
- **Styling:** a CSS-like `style` prop with
  [hover, press and focus states](https://tulustul.github.io/bevy-react/elements/node/),
  [gradients](https://tulustul.github.io/bevy-react/styling/gradients/),
  [shadows](https://tulustul.github.io/bevy-react/styling/shadows/),
  [transforms](https://tulustul.github.io/bevy-react/styling/transforms/) and
  [3D transforms](https://tulustul.github.io/bevy-react/styling/3d-transforms/)
- **Effects:** GPU [filters](https://tulustul.github.io/bevy-react/styling/filters/),
  [backdrop filters](https://tulustul.github.io/bevy-react/styling/backdrop-filters/)
  (frosted glass), [morph filters](https://tulustul.github.io/bevy-react/styling/morph-filters/)
  (view transitions), all on cached [composited layers](https://tulustul.github.io/bevy-react/styling/layers/)
- **Animation:** [style transitions](https://tulustul.github.io/bevy-react/animations/style-transitions/)
  including layout (FLIP) animations,
  [animated values](https://tulustul.github.io/bevy-react/animations/animated-values/)
  driven in Bevy, not JS, and
  [shared elements](https://tulustul.github.io/bevy-react/animations/shared-elements/)
- **Talking to Bevy:** typed [messages](https://tulustul.github.io/bevy-react/communication/react-to-bevy/),
  [events](https://tulustul.github.io/bevy-react/communication/bevy-to-react/),
  [requests](https://tulustul.github.io/bevy-react/communication/request-response/)
  and [named nodes](https://tulustul.github.io/bevy-react/communication/named-nodes/),
  with [generated TypeScript](https://tulustul.github.io/bevy-react/tooling/ts-codegen/)
- **Extensible:** your own [elements](https://tulustul.github.io/bevy-react/extending/custom-elements/)
  (UI nodes, or any ECS entity such as a 3D mesh),
  [style properties](https://tulustul.github.io/bevy-react/extending/custom-styles/)
  and [WGSL filters](https://tulustul.github.io/bevy-react/extending/custom-filters/)
- **Tooling:** [devtools](https://tulustul.github.io/bevy-react/tooling/devtools/),
  [hot reload](https://tulustul.github.io/bevy-react/tooling/hot-reload/) that keeps
  state, [web builds](https://tulustul.github.io/bevy-react/tooling/web/)

## Project status

Currently, the project is a **quick, vibecoded proof of concept** demonstrating the idea. The API is very unstable and will change, the code quality is not satisfying.
**Do not use it in production**.

## Bevy compatibility

| bevy | bevy-react |
| ---- | ---------- |
| 0.19 | 0.1 – 0.6  |

## License

Dual-licensed under either of
[Apache License 2.0](https://github.com/tulustul/bevy-react/blob/main/LICENSE-APACHE)
or [MIT license](https://github.com/tulustul/bevy-react/blob/main/LICENSE-MIT), at
your option.
