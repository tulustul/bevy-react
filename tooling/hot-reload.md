# Hot reload

While the app runs, bevy-react watches the app bundle and re-runs it when
it changes. Edits apply through React Fast Refresh: an edited component
re-renders in place and keeps its `useState` and other hook state. The
Bevy side is untouched, so entities, running animations and the 3D scene
carry on as they were.

## Usage

Keep the watcher running in the UI package and start the app as usual:

```sh
npm run watch   # in ui/: bevy-react build --watch
cargo run       # in the Cargo package
```

`--watch` builds `vendor.js` once, then rebuilds `app.js` on every change.
The app polls `app.js` for changes (a few times a second) and re-runs it.
Hot reload is on by default; turn it off with `hot_reload(false)`:

```rust
app.add_plugins(
    ReactPlugins.set(ReactUiPlugin::default().hot_reload(false)),
);
```

Hot reload covers the React side only. A change to Rust code needs a
rebuild and restart, as usual.

## What keeps its state

On every change, the whole of `app.js` runs again in the live JS runtime.
Every component becomes a new function and React re-renders the tree:

- A component whose hooks are unchanged keeps its state. Changes to its
  markup, styles, handlers and helper functions apply in place.
- A component whose hook calls change (a hook added, removed or reordered,
  or a different `useState` initial value) remounts with fresh state, and
  so does its subtree. Class components always remount.
- Effects and memos run again on every reload, whatever their
  dependencies. Give every effect a cleanup function: a subscription
  without one is registered twice.
- Non-component edits (constants, utilities, `bevy.ts`) apply too: the
  components that use them re-render with the new values.

## Module-level state

Because the whole bundle runs again, code at the top level of a module runs
again too. Every module-level value starts over:

- A store created at module level, such as a `zustand` store, is replaced
  by an empty one.
- A context from `createContext` gets a new identity. Its provider counts as
  a different component, and the whole subtree under it remounts.
- A top-level side effect, such as `bevy.on(...)` or a timer, runs once
  more per reload.

Park such values on `globalThis` so the first run creates them and later
runs reuse them. The demos use this helper:

```tsx
import { createContext } from "react";
import { create } from "zustand";

export function hmrSingleton<T>(key: string, init: () => T): T {
  const g = globalThis as unknown as Record<string, T | undefined>;
  return (g[key] ??= init());
}

export const useCounter = hmrSingleton("__counterStore", () =>
  create<{ count: number }>(() => ({ count: 0 })),
);

const ThemeContext = hmrSingleton("__themeContext", () =>
  createContext("dark"),
);
```

A value created this way keeps its first definition: edits to its `init`
apply only after a restart.

## Errors

- A file that doesn't compile fails the rebuild. esbuild prints the error
  in the watch terminal and leaves `app.js` as it was, so the app keeps
  running. esbuild doesn't type-check; run `npm run typecheck` for that.
- A bundle that throws while it runs (for example, a top-level reference to
  an undefined name) is rejected. The previous working version stays live,
  and the error is logged to the terminal and the devtools
  [Console](devtools.md#console). The next good edit applies normally.
- A component that throws while rendering is an ordinary React error,
  logged as `[js] react error:`. Without an error boundary, React unmounts
  the tree as usual.

## Production bundles

Fast Refresh is a development feature. `bevy-react build --prod` leaves the
refresh runtime and the component instrumentation out of the bundles. Hot
reload still works with a production bundle, but every change remounts the
whole app with fresh state.

Release binaries watch `app.js` too, since `hot_reload` defaults to `true`
in every build. Turn it off for a shipped game, which has no reason to poll
its bundle.

## Limits

- Only `app.js` is watched. `vendor.js` (React and the bevy-react runtime)
  loads once: after upgrading React or bevy-react, rebuild and restart both
  the watcher and the app.
- Components from npm packages are bundled without Fast Refresh
  instrumentation. Every reload remounts them, and they lose their state.
- Native only. In a web build the page loads the bundles, and reloading is
  up to your dev server (see [Web builds](web.md)).

See [Getting started](../getting-started.md#build-the-ui) for the build
flags and the custom build API.
