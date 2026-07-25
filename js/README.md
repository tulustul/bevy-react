<p align="center">
  <img src="../examples/assets/bevy-react-logo.png" alt="bevy-react logo" width="220" />
</p>

<h1 align="center">bevy-react (JS)</h1>

The JavaScript half of [**bevy-react**](https://github.com/tulustul/bevy-react):
a custom React reconciler and runtime that renders your components to native
[`bevy_ui`](https://docs.rs/bevy/latest/bevy/ui/index.html) — no web view, no DOM.

This package does nothing on its own. It runs inside a V8 isolate embedded by the
[`bevy-react` Rust crate](https://crates.io/crates/bevy-react), which owns the
Bevy side of the bridge.

**Start there:** see the [main README](https://github.com/tulustul/bevy-react#readme)
for what this is and how it works, and [SETUP.md](https://github.com/tulustul/bevy-react/blob/main/SETUP.md)
for setting up a project end to end.

## What's in here

- `mount`, host-element JSX types (`<node>`, `<text>`, `<button>`, …)
- Animations: inline `{ animated }` style bindings, `useSharedValue`, `withTiming`, `withSpring`, …
- `bevy-react/build-lib` — esbuild-based bundling with React Fast Refresh
- `npx bevy-react init ui` — scaffold the React UI for a new project
