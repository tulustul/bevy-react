---
description: Run a bevy-react app in the browser by compiling the Bevy app to wasm and loading the same React bundles in the page.
---

# Web builds

A bevy-react app also runs in the browser. The Bevy app compiles to
`wasm32-unknown-unknown`, and the same `vendor.js` and `app.js` bundles run in
the browser's own JS engine instead of the embedded V8. The UI is still
`bevy_ui` drawn into Bevy's canvas, not DOM. No code changes are needed: the
bundles detect the browser host at startup. The
[live demo](https://tulustul.github.io/bevy-react/demo/) is the demos app built
this way.

## Usage

One-time setup:

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli
```

Install the `wasm-bindgen` CLI at the version of the `wasm-bindgen` crate in
your `Cargo.lock` (`cargo install wasm-bindgen-cli --version <x.y.z>`). A CLI
a patch or two newer usually works; a larger gap makes `wasm-bindgen` fail.

Build the three parts into one folder, here `ui/dist/` for a package whose
binary is `my_game`:

```sh
(cd ui && npx bevy-react build)        # dist/vendor.js + dist/app.js
cargo build --target wasm32-unknown-unknown
wasm-bindgen --target web --out-dir ui/dist --out-name game \
  target/wasm32-unknown-unknown/debug/my_game.wasm
cp -r assets ui/dist/assets
```

`wasm-bindgen` writes `game.js` (the loader) and `game_bg.wasm`. Pick an
`--out-name` other than `app` or `vendor`, so the loader doesn't overwrite a
bundle.

Add an `index.html` to `ui/dist/` with a `<script type="module">` that boots
the parts in this order:

```tsx
import init from "./game.js";
await init(); // runs your Rust `main`: builds the App, starts Bevy

await loadScript("./vendor.js");
await loadScript("./app.js");

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.body.appendChild(s);
  });
}
```

Then serve the folder over HTTP, for example with `npx serve ui/dist`.
Browsers don't load wasm from `file://` URLs. All paths are relative, so the
site also works from a subdirectory.

For a release build, use `npx bevy-react build --prod` and
`cargo build --release`, and point `wasm-bindgen` at
`target/wasm32-unknown-unknown/release/`.

## Load order

The order in the page script is required:

1. **`init()` first.** It runs your `main`. While the `App` builds,
   `ReactUiPlugin` installs the browser host on `globalThis.__bevyHost`, the
   object the React runtime sends its ops to. `App::run` then schedules Bevy's
   frame loop and returns, so `init()` resolves.
2. **`vendor.js` next.** It reads `__bevyHost` when it is evaluated. Loaded
   before `init()` resolves, it falls back to the native host and throws
   (`Deno is not defined`).
3. **`app.js` last.** It takes React and the runtime from `vendor.js`.

Both bundles are classic scripts, not ES modules: load them with plain
`<script>` elements as above. React can render as soon as `app.js` runs. The
first commits are held until the Bevy app has finished its asynchronous
renderer setup, then applied in order, so there's nothing to wait for.

## The Rust side

Your `main` is the wasm entry point unchanged. A few things differ:

- `ReactUiPlugin::new(path)` and `hot_reload(..)` are ignored: the page loads
  the bundles, and nothing watches them.
- Gate native-only code with `#[cfg(not(target_arch = "wasm32"))]`. This
  includes the `--export-bindings` exporter from
  [TypeScript codegen](ts-codegen.md): generate `bevy.ts` with a native run.
- Bevy's default features render through WebGL2 (the `webgl2` feature).

To make the canvas fill the page and follow the browser window, let it track
its parent element:

```rust
let window = Window {
    fit_canvas_to_parent: true,
    ..default()
};
app.add_plugins(DefaultPlugins.set(WindowPlugin {
    primary_window: Some(window),
    ..default()
}));
```

Give `html` and `body` a full height with no margin and `overflow: hidden`.
On phones, also set `touch-action: none` on the canvas: without it the browser
turns touch drags into page scrolling and pinch-zoom instead of passing them
to the app.

bevy-react enables the browser backend of `getrandom` for you. If the wasm
build still fails inside `getrandom`, copy the `wasm32-unknown-unknown`
section of the repository's [`.cargo/config.toml`](../../../.cargo/config.toml)
into your project.

## Assets

Bevy's default `AssetPlugin` fetches assets over HTTP from `assets/` next to
the page. Copy your asset folder to `dist/assets/`: textures, fonts given to
`default_font(..)` and `font(..)`, cursor images and custom filter shaders all
load from there. If the native build points `AssetPlugin` somewhere else, keep
the default on the web.

On GitHub Pages, add an empty `.nojekyll` file to the site so every file is
served as is.

## Differences from native

- **No hot reload.** Rebuild and reload the page: `npx bevy-react build --watch`
  still rebuilds `app.js` on change, but the page doesn't pick it up, and a
  reload resets all React state. See [Hot reload](hot-reload.md) for the
  native workflow.
- **One thread.** React runs on the page's main thread, between Bevy frames,
  where on native it has a thread of its own. A slow render delays the next
  frame. Events from Bevy are delivered at the end of each frame, and the ops
  React commits in response apply on the next one.
- **Logs go to the browser console.** That covers `console.*` from React,
  Rust panics and Bevy's log output.
- **Devtools** run in debug builds with a few gaps: the panel's layout isn't
  saved between sessions, the Console tab stays empty (use the browser's
  console), and some timing columns in the Bridge tab are not measured. See
  [Devtools](devtools.md).
- **WebGL2 shaders.** Custom WGSL (filters, materials) is translated to GLSL
  ES 3.00, so it can't use storage buffers, compute, or the bit-counting
  built-ins such as `countOneBits`. A shader that fails to compile there can
  stop the whole app. Bevy also turns some effects off, depth of field among
  them.

## Reference setup

The demos app and the
[Cyberpunk](https://tulustul.github.io/bevy-react/cyberpunk/) and
[Civilization](https://tulustul.github.io/bevy-react/civilization/) showcases
build for the web with one script,
[`examples/build-web.mjs`](../../../examples/build-web.mjs): it builds both
bundles with `buildVendor` and `buildApp` from `bevy-react/build-lib`,
compiles the Bevy app to wasm, runs `wasm-bindgen`, copies the example's
page (for the demos,
[`examples/demos/ui/index.html`](../../../examples/demos/ui/index.html)) and
its assets into `dist/`, and serves it. The demos' `main` and window setup are in
[`examples/demos/main.rs`](../../../examples/demos/main.rs). Run it from the
repository root:

```sh
npm run build:web -w demos                        # debug build, then serve
npm run build:web:prod -w demos -- --build-only   # release build, no server
```

## Limits

- wasm builds need a lot of disk space: keep tens of GB free.
  `cargo clean --target wasm32-unknown-unknown` reclaims it.
- Integers above 2^53 in event or response payloads can't be sent to React on
  the web (they are dropped with a console error); on native they arrive as a
  `BigInt`.
