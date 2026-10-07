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

## Showcase

[**Arcana**](https://github.com/tulustul/bevy-react/tree/main/examples/arcana)
opens packs of living tarot cards: holographic foil that is a WGSL shader running
over React components, card art that is a live 3D scene, glass buttons that refract
the world behind them, and a card that leaves the UI to become a real 3D object you
can turn over — still React, still clickable.

![A tarot card held as a real 3D object: turned in perspective, its foil running in rainbow bands, a live black hole spinning in its art window.](https://raw.githubusercontent.com/tulustul/bevy-react/main/screenshots/arcana-card.webp)

[**Atrium**](https://github.com/tulustul/bevy-react/tree/main/examples/atrium)
is a spatial desktop: React apps on windows of frosted glass floating over an
alpine lake. You drag them around you in 3D, borrow the sky of any place on a
globe (the northern lights come out over your lake), watch your windows
reflected in the water, and find yourself through live cameras around the
shore. Every window is still React, still clickable.

![The northern lights over black mountains, mirrored in the lake: frosted-glass React windows float in front, a dotted globe turned to Iceland beside them.](https://raw.githubusercontent.com/tulustul/bevy-react/main/screenshots/atrium-aurora.webp)

[**Epoch**](https://github.com/tulustul/bevy-react/tree/main/examples/epoch)
recreates the interface of a 4X strategy game over a generated hex world: city
banners and unit flags pinned to the 3D map, a minimap filmed by a second
camera, a city screen, a technology tree, and reports with history graphs for
every civilization. Every panel is React; the numbers come from the map.

![A hex map of forests, farms and snowy mountains under a strategy-game interface: city banners over the towns, research and civic trackers, rival leaders, a minimap and the next-turn button.](https://raw.githubusercontent.com/tulustul/bevy-react/main/screenshots/epoch-map.webp)

[**Cyberpunk**](https://github.com/tulustul/bevy-react/tree/main/examples/cyberpunk)
is a homage to the front end of a famous open-world RPG: the title screen,
the main menu, a six-step character creation, saves, eight tabs of settings
that really change the camera, the window and the sound, and the pause
menu over your lifepath's world. Every screen is React and glitches into the
next through a custom morph shader; the worlds on the cards are live 3D.

![The main menu of the homage: a slashed yellow CYBERPUNK wordmark and five menu items on a translucent red band, glowing cyan and red bars and walls of magenta data blurred behind it.](https://raw.githubusercontent.com/tulustul/bevy-react/main/screenshots/cyberpunk-menu.webp)

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

## Bevy compatibility

| bevy | bevy-react |
| ---- | ---------- |
| 0.19 | 0.1 – 0.7  |

## License

Dual-licensed under either of
[Apache License 2.0](https://github.com/tulustul/bevy-react/blob/main/LICENSE-APACHE)
or [MIT license](https://github.com/tulustul/bevy-react/blob/main/LICENSE-MIT), at
your option.
