# `demos` example

A gallery showing `bevy-react` driving `bevy_ui` from a React app over a live 3D
scene. It runs on two targets from one codebase: **native** (embedded V8) and **web**
(React in the browser's engine, Bevy as wasm).

The app is two halves: the **React UI** (`demos-app` npm workspace → `ui/dist/*.js`)
and the **Bevy app** (the `demos` example). Run everything from the repo root.

```sh
npm install                                   # once
rustup target add wasm32-unknown-unknown      # once, for web
cargo install wasm-bindgen-cli                # once, for web (need not be on PATH)
```

## Running

| Mode             | JS                                      | Rust                                  |
| ---------------- | --------------------------------------- | ------------------------------------- |
| Native · dev     | `npm run build -w demos-app`            | `cargo run --example demos`           |
| Native · release | `npm run build:prod -w demos-app`       | `cargo run --example demos --release` |
| Native · watch   | `npm run watch -w demos-app`            | `cargo run --example demos`           |
| Web · dev        | `npm run build:web -w demos-app` ¹      | N/A                                   |
| Web · release    | `npm run build:web:prod -w demos-app` ¹ | N/A                                   |
| Web · deploy     | `npm run deploy:web -w demos-app`       | N/A                                   |

¹ **`build:web`** does it all in one command: bundles the React app (esbuild), compiles
the Bevy app to wasm (`wasm-bindgen`), writes a static site to `ui/dist/`, and serves it
with `npx serve`. Add `-- --build-only` to build without serving. wasm builds are
disk-heavy — keep tens of GB free (`cargo clean --target wasm32-unknown-unknown` reclaims it).

## Other

```sh
npm run bevy:generate -w demos-app            # regen ui/src/bevy.ts after #[react_*] changes
cargo run --example demos -- --shoot "<portal>" out.png   # headless screenshot (native)
```
