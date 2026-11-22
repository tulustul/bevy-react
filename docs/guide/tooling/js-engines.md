---
description: Run the React bundle on V8 or on QuickJS — a JIT that is fastest at JavaScript, or a small interpreter that keeps the binary ~48 MB lighter.
---

# JS engines

In a native build, bevy-react runs your React bundle in an embedded JS
engine. There are two, each behind a cargo feature:

- **`v8`** (the default): V8 through
  [`deno_core`](https://crates.io/crates/deno_core). It is a JIT, so it runs
  JavaScript fastest. It adds about 49 MB to a stripped binary, and its build
  script downloads a prebuilt ~40 MB static library.
- **`quickjs`**: [QuickJS](https://github.com/quickjs-ng/quickjs) through
  [`rquickjs`](https://crates.io/crates/rquickjs). It is an interpreter that
  starts faster and uses less memory, and it adds about 1.3 MB. It compiles
  from C, so the build needs a C compiler, and it downloads nothing.

An engine you don't enable is neither downloaded nor linked. A web build
ignores both features, because the browser's own engine runs the bundle
there.

## Usage

To use QuickJS instead of V8, turn the default features off and list what
you use:

```toml
[dependencies]
bevy-react = { version = "0.8", default-features = false, features = [
    "quickjs", "svg", "anchor", "canvas", "portal", "surface", "devtools",
    "custom_cursor",
] }
```

Nothing else changes. The same bundle runs on either engine, and hot
reload, devtools and timers behave the same way.

The features are additive. With both compiled in, choose one at startup
(V8 is the default):

```rust
use bevy_react::JsEngine;

app.add_plugins(
    ReactPlugins.set(ReactUiPlugin::default().engine(JsEngine::QuickJs)),
);
```

At startup the log names the engine, its version and how long it took to
run the bundle and render the first frame of UI:

```text
INFO bevy_react_core::js: QuickJS-ng 0.16.2 ready in 50.8 ms
```

`JsEngine` only has variants for the engines compiled in, so naming a
missing one is a compile error. A native build with neither feature panics
at startup.

## Choosing

| Measured                                    | V8      | QuickJS       |
| ------------------------------------------- | ------- | ------------- |
| Added to a stripped binary                  | 49 MB   | 1.3 MB        |
| Startup with a 145 KB production bundle     | ~37 ms  | ~20 ms        |
| React work (reconcile + build the op batch) | 1×      | 10–30× slower |
| Re-rendering a 1,000-row list, JS time      | ~0.6 ms | ~10 ms        |
| Peak memory in the 10,000-row benchmark     | 1.39 GB | 1.21 GB       |

QuickJS suits most game UIs. Menus, HUDs and panels of tens to hundreds of
nodes re-render in about a millisecond of JS. Bevy-side animation
([animated values](../animations/animated-values.md),
[style transitions](../animations/style-transitions.md)) does not involve the
engine, so it runs equally smoothly on both. Choose V8 when a single commit
re-renders thousands of nodes, or when JavaScript drives a large tree every
frame.

The full comparison, with the commands to reproduce it, is in
[`examples/stress/ENGINES.md`](https://github.com/tulustul/bevy-react/blob/main/examples/stress/ENGINES.md).

## QuickJS limits

- **No `Intl`.** `Intl.NumberFormat`, `Intl.DateTimeFormat` and the locale
  arguments of `toLocaleString` are missing. Format numbers and dates
  yourself or with a library that doesn't need `Intl`.
- **No JIT.** This is why it is slower. It is also why it can run on
  platforms that forbid generating executable code at runtime.
- **Mobile.** `rquickjs` ships prebuilt bindings for desktop targets only.
  Android and iOS need its `bindgen` feature, which needs libclang. bevy-react
  doesn't build for mobile yet.
