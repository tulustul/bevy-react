# Getting started

A bevy-react app has two parts:

- **The Rust crate `bevy-react`** (imported as `bevy_react`). It hosts the
  JS runtime and applies the UI to the ECS.
- **The npm package `bevy-react`**. It provides the React renderer, the JSX
  types and a CLI. The CLI scaffolds the UI package and bundles it into two
  JS files that the Bevy app loads at startup.

Both are released together with the same version number. Use matching
versions of the two.

## Add the crate

Run this in your Bevy app's package:

```sh
cargo add bevy-react
```

All element features are on by default. To compile in less, see "Cargo
features" below.

## Scaffold the UI

From the same directory (the one that holds your `Cargo.toml`), run:

```sh
npx bevy-react init ui
cd ui
npm install
npm run watch
```

`init` copies a starter package into `ui/`. If you leave out the directory
argument, it uses `ui`. `npm run watch` builds both bundles once, then
rebuilds the app bundle whenever a file changes. Keep it running while you
work.

`init` accepts these flags:

| Flag             | Effect                                                    |
| ---------------- | --------------------------------------------------------- |
| `--name <name>`  | npm package name (default: the target directory's name)   |
| `--install`      | run `npm install` after scaffolding                       |
| `--force`        | scaffold into a directory that is not empty               |
| `--local <path>` | depend on a local copy of the npm package (`file:<path>`) |

The scaffolded package contains:

- `src/index.tsx`: the entry point. It calls `mount(<App />)`. `mount` never
  resolves, so don't `await` it.
- `src/App.tsx`: a starter component, a button with hover and press styles
  that counts its clicks.
- `src/bevy.ts`: a placeholder for the typed client generated from your Rust
  types (see "Generate the typed client" below).
- `tsconfig.json`: set up with `"jsxImportSource": "bevy-react"`, so JSX
  resolves to bevy-react's elements (`<node>`, `<text>`, `<button>`, …).
- `package.json`: the dependencies and these scripts:

| Script                  | Runs                                                      |
| ----------------------- | --------------------------------------------------------- |
| `npm run build`         | `bevy-react build`: `dist/vendor.js` + `dist/app.js`      |
| `npm run watch`         | `bevy-react build --watch`: rebuilds `app.js` on change   |
| `npm run build:prod`    | `bevy-react build --prod`: production bundles             |
| `npm run typecheck`     | `tsc --noEmit`                                            |
| `npm run bevy:generate` | the Rust app's `--export-bindings`, writing `src/bevy.ts` |

## Add the plugins

`ReactPlugins` is bevy-react's counterpart to `DefaultPlugins`. It contains
`ReactUiPlugin` (the bridge) plus one plugin for each element feature your
build compiles in. Add it after Bevy's `DefaultPlugins`. It doesn't include
them. Also add a camera: `bevy_ui` only renders through one, and bevy-react
doesn't spawn any.

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

Any camera that renders UI works, including the 3D camera your game already
has. Then start the app with `cargo run`.

Keep these points in mind:

- **The default bundle path is `ui/dist/app.js`**
  (`ReactUiPlugin::DEFAULT_BUNDLE`). The path is relative to the process's
  working directory, not to Bevy's asset folder, so run `cargo run` from the
  package root.
- **Both bundles must exist.** `vendor.js` must sit next to `app.js`. If
  either file is missing, the app panics at startup and prints the absolute
  path it looked for. Build the UI first.
- **Hot reload is on by default.** The plugin watches `app.js` and re-runs
  it when it changes. Edits follow React Fast Refresh rules: a component
  keeps its hook state unless you change its hooks.
- **Devtools.** With the `devtools` feature, F12 toggles the inspector in
  debug builds. Release builds never run it.

### Configure the plugins

`ReactPlugins` is an ordinary Bevy plugin group. Use `.set(..)` to replace a
member with a configured one, and `.disable::<P>()` to leave one out:

```rust
app.add_plugins(
    ReactPlugins
        .set(ReactUiPlugin::new("assets/ui/app.js").hot_reload(false))
        .disable::<CanvasPlugin>(),
);
```

A build without element features (`default-features = false`, see below)
can add `ReactUiPlugin::new(..)` directly instead of the group. With no
element features, the group contains only that plugin.

`ReactUiPlugin` has these builder methods:

| Method                                  | Purpose                                                         |
| --------------------------------------- | --------------------------------------------------------------- |
| `new(path)`                             | The app bundle to load. `vendor.js` must be next to it.         |
| `hot_reload(bool)`                      | Watch the bundle and hot-reload it on change (default: `true`). |
| `default_font(path)`                    | App-wide default font (asset path).                             |
| `font(name, path)`                      | A named font family, selected with `fontFamily: name`.          |
| `cursor(name, path, hotspot)`           | A named image cursor, selected with `cursor: name`.             |
| `devtools(DevtoolsConfig)`              | Configure or disable the inspector.                             |
| `precompile_filters(PrecompileFilters)` | Choose which filter shaders compile at startup (default: all).  |

Font and cursor paths are loaded through the `AssetServer`. `cursor` needs
the `custom_cursor` feature, and `devtools` needs the `devtools` feature.

## Build the UI

Run `bevy-react build` (or `npx bevy-react build`) from the UI package. It
bundles `src/index.tsx` into two files in `dist/`:

- **`vendor.js`**: React, the reconciler and the bevy-react runtime. It is
  loaded once and never re-run.
- **`app.js`**: your own code. It runs again on every hot reload.

Deploy both files side by side.

| Flag      | Effect                                                              |
| --------- | ------------------------------------------------------------------- |
| `--watch` | Build `vendor.js` once, then rebuild `app.js` on every change.      |
| `--prod`  | Production React. Fast Refresh and the devtools panel are left out. |

`--watch` builds `vendor.js` only when it starts, so restart it after you
upgrade React or bevy-react. For a custom build pipeline, import
`buildVendor`, `buildApp` and `watchApp` from `bevy-react/build-lib`. The CLI
is built on these.

## Generate the typed client

`src/bevy.ts` mirrors your Rust side in TypeScript: the typed
`bevy` proxy for your `#[react_message]`, `#[react_request]` and
`#[react_event]` channels, your registered filters, and the JSX types of the
compiled-in feature elements. The scaffolded file is an untyped placeholder.
Until you generate the real one, `<svg>`, `<canvas>`, `<anchor>`, `<portal>`
and `<surface>` don't type-check. The bundles still build.

The template's `bevy:generate` script runs
`cargo run --manifest-path ../Cargo.toml -- --export-bindings src/bevy.ts`.
That assumes the UI directory sits right inside your Cargo package; edit the
script if your layout is different. Your `main` handles the flag by building
a bare `App` (no window, no JS runtime), registering the bindings and
writing the file:

```rust
use bevy::prelude::*;
use bevy_react::prelude::*;

fn main() {
    let mut args = std::env::args().skip(1);
    if args.next().as_deref() == Some("--export-bindings") {
        let path = args.next().expect("--export-bindings needs a path");
        let mut app = App::new();
        // The JSX elements of every compiled-in feature.
        ReactPlugins::register_bindings(&mut app);
        // Your own #[react_*] registrations go here: the same calls
        // the running app makes.
        app.export_react_typescript(&path)
            .expect("failed to write the TypeScript bindings");
        return;
    }

    // … the normal `App::new()` … `.run()` from above.
}
```

Then run either of these:

```sh
npm run bevy:generate                          # from ui/
cargo run -- --export-bindings ui/src/bevy.ts  # from the package root
```

The flag is only a convention that the template's script relies on. The
underlying call is `App::export_react_typescript(path)`, so you can export
from any other entry point instead, such as a test or a build task.

Regenerate `bevy.ts` after you change any `#[react_*]` type, register a
filter or element, or change your cargo features. Import the typed surface
from `./bevy` (`import { bevy } from "./bevy"`), not the untyped functions
from `"bevy-react"`. The TS codegen page covers the generated file in
detail.

## Cargo features

Every feature except `svg_text` is on by default:

| Feature         | Adds                                                                 | Default |
| --------------- | -------------------------------------------------------------------- | ------- |
| `svg`           | `<svg>` and its shape elements (`SvgPlugin`)                         | yes     |
| `anchor`        | `<anchor>`, world-anchored overlays (`AnchorPlugin`)                 | yes     |
| `canvas`        | `<canvas>`, a retained drawing surface (`CanvasPlugin`)              | yes     |
| `portal`        | `<portal>`, render-target views (`PortalPlugin`)                     | yes     |
| `surface`       | `<surface>`, UI rendered into offscreen textures (`SurfacePlugin`)   | yes     |
| `devtools`      | the F12 inspector (never runs in release builds)                     | yes     |
| `custom_cursor` | `ReactUiPlugin::cursor`, named image cursors (pulls in `bevy_winit`) | yes     |
| `svg_text`      | `<text>` inside `.svg` files shown with `<image>` (pulls in fontdb)  | no      |

To compile in only what you use:

```sh
cargo add bevy-react --no-default-features --features svg,devtools
```

A disabled feature isn't compiled at all. Its elements mount as plain nodes
and log a `featureMissing` warning that names the feature and the plugin to
add. A feature plugin left out of `ReactPlugins` with `.disable::<P>()`
causes the same warning.

The core elements (`<node>`, `<button>`, `<text>`, `<editableText>`,
`<image>`, `<root>`) and the built-in
[filters](reference/filters.md) are always available.

bevy-react depends on Bevy with Bevy's default features turned off and
enables only what it needs: UI, its renderer, text, picking and so on. You
can trim Bevy's own features in your app as usual. On Linux, `custom_cursor`
needs a windowing backend (Bevy's `x11` or `wayland` feature). Bevy's
default features include both. A crate that extends bevy-react with custom
elements, styles or filters should depend on `bevy-react` with
`default-features = false`, the same way a Bevy plugin crate depends on
`bevy`.

## Next steps

- The [elements](reference/elements.md) and
  [style properties](reference/style-properties.md) references.
- [`examples/minimal`](https://github.com/tulustul/bevy-react/tree/main/examples/minimal):
  the smallest complete setup, built without default features.
- [`examples/demos`](https://github.com/tulustul/bevy-react/tree/main/examples/demos):
  the gallery behind the [live demo](https://tulustul.github.io/bevy-react/demo/).
  Each demo is a small component you can copy from.
