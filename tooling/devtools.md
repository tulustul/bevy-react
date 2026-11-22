# Devtools

The devtools are an inspector for the live UI, drawn with bevy-react itself
in an overlay above your app. They show the node tree as React built it,
let you edit styles and props in place, list the composited layers and the
running animations, collect console output and warnings, and log every
message that crosses the bridge.
They run in debug builds only.

## Usage

There is nothing to set up. With the `devtools` cargo feature (on by
default) and a development bundle, `ReactUiPlugin` adds the inspector:

```sh
cargo run             # debug build: F12 toggles the panel
cargo run --release   # release build: no devtools
```

Press **F12** to open or close the panel. It reopens where you left it: open
or closed, docked or floating, and at the same size.

## Configuration

`ReactUiPlugin::devtools` takes a `DevtoolsConfig`. Every field has a
default, so override only what you need:

```rust
use bevy::prelude::*;
use bevy_react::{prelude::*, DevtoolsConfig};

app.add_plugins(ReactPlugins.set(
    ReactUiPlugin::default().devtools(DevtoolsConfig {
        toggle_key: KeyCode::F1,
        settings_path: Some(".config/devtools.json".into()),
        ..default()
    }),
));
```

| Field           | Default                     | Effect                                        |
| --------------- | --------------------------- | --------------------------------------------- |
| `enabled`       | `true`                      | `false` leaves the inspector out entirely     |
| `toggle_key`    | `KeyCode::F12`              | The key that opens and closes the panel       |
| `pause_key`     | `KeyCode::F11`              | Pauses and resumes on the Animations tab      |
| `settings_path` | `.bevy-react-devtools.json` | Where the panel layout persists; `None` = off |

The settings file is relative to the working directory and holds only the
panel's layout (dock side, size, toggles, whether it was open). Add it to
your `.gitignore`. Persistence is native only: in a web build the file is
neither read nor written.

## Release builds

The inspector never runs in a release build, even when the feature is
compiled in: the plugin registers nothing without `debug_assertions`. Its
JavaScript half is left out of production bundles (`bevy-react build
--prod`). Both halves are needed: a debug binary with a production bundle,
or a release binary with a development bundle, shows no panel.

Cargo features can't depend on the build profile, so the inactive Rust code
is still compiled into release binaries. If a shipping build must not
contain it, turn off default features and list the ones you use without
`devtools` (see [Cargo features](../getting-started.md#cargo-features)).

## The panel

The header holds the layout and mode controls, as icons; hover one for its
name:

- **Dock left**, **Dock right**, **Float**: dock the panel to a window
  edge, or float it. A docked panel resizes from its inner edge; a floating
  one moves by its header and resizes from its bottom-right corner.
- **Push the app aside** (docked only): reserve the panel's width so the
  app's UI reflows beside it instead of underneath. Like a docked browser
  devtools, it shrinks the app's viewport: `window.size` and the `resize`
  event report what is left, so a layout computed from the window's size
  reflows too. `vw` units and `positionType: "fixed"` nodes still span the
  whole window.
- **Pick a node on screen**: click a node on screen to select it in the
  tree, which opens to it and scrolls it into view. Hovering highlights what
  you would pick. The click is the inspector's: the app never sees it, so
  nothing is pressed, clicked or focused. Escape leaves pick mode.
- **Outline the selection**: show or hide the outline drawn around the
  selected node.
- **Paint flashing**: flash every node Bevy redraws. See
  [Paint flashing](#paint-flashing).
- **Close**: close the panel. Its tooltip shows the toggle key.

A panel too narrow for every tab label shows only the active tab's; the
others keep their icon and name it on hover.

The footer shows the app's node count and the last op batch: its number, op
count and Rust-side apply time.

The panel owns the pointer over it: clicks, hover and the wheel never reach
the app beneath it, and `PointerCapture` reports the pointer as the UI's
there, so camera controls that honor it ignore it. Its own nodes and ops are
left out of the tree, the counts and the bridge log.

## Nodes

The Nodes tab is the node tree and an inspector for the selected node.

- Each row shows the element, with its `name` prop when it has one (see
  [Named nodes](../communication/named-nodes.md)). Where a React component
  starts emitting nodes, the row leads with that component's name, such as
  `<Card>`. Text rows show their content.
- Chips above the tree switch between the main UI tree and each `<root>`,
  labelled by the root's `name`. **expand** and **collapse** apply to the
  whole tree.
- Hovering a row outlines its node on screen. Clicking a row selects it.

The inspector lists the selected node's `style` and props as raw wire
values, exactly what React sent:

- Click a value to edit it. Enter applies, Escape cancels. An invalid value
  stays in the editor with an error and is never sent.
- The checkbox next to a style declaration disables it; ticking it again
  restores the value.
- **+ add style** takes a `field: value` declaration.
- Edits are transient. They go through the same path as a React update, and
  the next React render that changes the same field overwrites them. Nothing
  is written back to your source.

## Warnings

An invalid value (an unknown color name, a malformed length, a style
property the element ignores, an unknown prop) never stops rendering: it
falls back to a default and reports a warning. Every warning goes to the
terminal log once per distinct message, in every build. With the devtools
running, it also flags the offending row in the inspector with a warning
sign and the warning text, and appears in the Console tab. An unknown style field is
flagged even before Bevy reports it.

## Layers

The Layers tab lists the composited layers (see
[Layers](../styling/layers.md)): a wireframe map of their rectangles over a
list with, for each layer:

- the element and node id, and why it was promoted: `opacity`, `filter`,
  `transform3d`, `backdrop`, `morph` or `cache`;
- how many times it has repainted, how many nodes it holds, its size and its
  estimated texture memory;
- its `filter`, `backdropFilter` and `morphFilter` chains with live param
  values, including animated ones.

A layer whose node is not currently rendered is marked `inactive`. Hovering
a row outlines its node on screen. The tab streams data only while it is
shown.

## Animations

The Animations tab lists what is animating right now, in two sections.

**Shared values** lists the [shared values](../animations/animated-values.md)
with a running driver; the **idle** chip adds the idle ones a node is bound
to. For each:

- its id, its current reading, and a meter showing where the reading sits
  between where the driver started and the values it aims for;
- one line per driver stage, outermost first, with its progress: the run of
  a `withRepeat` (`repeat 3 of inf, reverse`), the step of a `withSequence`,
  the time left of a `withDelay`, how far a `withTiming` is, the velocity of
  a `withSpring`;
- the nodes bound to it and the fields they bind. Hovering one outlines it
  on screen. A running value with no nodes drives nothing on screen.

**Transitions** lists every node with a
[style transition](../animations/style-transitions.md) in flight, with one
line per `transition` key: `transform`, `opacity`, `layout`, `filter`, and
so on. A shared element's flight is one `sharedElement` line. Svg shape
attributes eased by a shape's `transition` are listed by attribute name.
Each line shows the spec's timing and how far the run is. Hovering the node
outlines it on screen.

The **values** and **transitions** chips show or hide each section.

### Pause and speed

**pause** freezes the app clock and the speed chips slow it down or speed
it up. **F11** (the `pause_key`, shown in the button's tooltip) pauses and
resumes too, while the tab is shown. This is Bevy's `Time<Virtual>`, so everything that runs on it pauses
or slows down along with the animations: the 3D scene, your own systems,
time-driven filters. Hot reload and paint flashing keep running.

While paused, every running row gets a slider over its timeline. Drag it to
move that animation alone, from where it started to where it ends. A spring
ends when it settles. A `withRepeat` that never ends shows its current
cycle. A run moved to its end holds there until you resume, and its
completion callback fires once the clock moves again. Resuming plays every
animation on from where its slider left it.

An animation that starts while paused, such as a hover transition, waits at
its start, so you can pause, trigger it, and step through it. Setting a
value directly (`sv.value = x`, `SharedValues::set`, a style without a
transition) still applies at once.

Leaving the tab, or closing the panel, gives the clock back as the tab
found it. The panel's own clock state is never saved.

The meters are bound to the shared values themselves, so Bevy moves them
every frame like any animated style; the numbers are sampled ten times a
second of real time. A value Rust drives with `SharedValues::set` has no
driver: it is listed under **idle**, without a meter, while a node is bound
to it. Each section lists at most 200 rows. The tab streams data only while
it is shown.

## Paint flashing

Bevy's UI renderer keeps what it extracted for a node and rebuilds it only
when something the node draws changed: its size or position, a color, a
border, an image, its text. With **paint** on, every node rebuilt in a frame
flashes a green box that fades out, so you see what a state change, a hover
or an animation really touches, and what it leaves alone.

- A node that changes every frame holds a steady box for as long as it
  does: an animated `transform`, a transition while it eases.
- A container that moves or resizes flashes together with everything that
  moved with it.
- A screen at rest shows nothing. A box that stays on a screen that looks
  still is a write repeated every frame.

A flash reports the CPU side of drawing a node, not pixels: whether a
composited layer captured its texture again is what the `repaints` counter
in the [Layers](#layers) tab counts.

Flashing runs only while the panel is open, and the toggle is remembered
with the rest of the panel's settings. The panel's own nodes never flash,
nor do nodes inside a `<surface>`.

## Console

The Console tab collects JavaScript `console` output, bevy-react's warnings
and JS runtime failures, such as a rejected hot reload. Each entry shows its
time, its source (`js` or `rust`) and its level; level chips filter the
list, and **clear** empties it. It keeps the last 500 entries, collected
from startup whether or not the panel is open. Everything here is also in
the terminal log.

In a web build the Console tab stays empty: `console` output goes to the
browser's own console.

## Bridge

The Bridge tab is a network log of the bridge: op batches sent by React,
`emit` messages, requests and their responses, Bevy events, and UI events
such as clicks. Each row shows the time, direction (`out` to Bevy, `in` to
React), kind and a summary. Clicking a row expands its JSON payload.

Op batches carry their cost. The row shows the total, and the expanded row
breaks it down: your event handler plus React's render and commit (`js`),
serializing and decoding the batch (`flush`), translating ops into ECS
commands (`translate`), running those commands (`command`) and laying out
the UI (`layout`). `wait`, the time a
batch queued until the next frame started, is shown but not counted in the
total. See [Performance](../performance.md) for what these numbers mean.

**pause** freezes the log and **clear** empties it. The kind chips filter
it, and the `devtools` chip includes the panel's own messages, hidden by
default. The log keeps the last 500 entries and records only while the
panel is open.

## Limits

- Pick mode keeps only its clicks from the app: hovering still runs the
  app's hover styles and `onPointerEnter`/`onPointerLeave` handlers.
- Pick mode only sees the window's UI. Nodes inside a `<surface>` can't be
  picked on screen; select them in the tree.
- Edits are transient and per node. There is no undo beyond re-enabling a
  disabled declaration.
- Pausing doesn't pause JavaScript: `setTimeout`, promises and event handlers
  keep running on wall time. Values your Rust code sets from its own clock,
  such as an audio thread, keep moving too.

![The devtools panel docked over the demos app: the Nodes tab shows the expanded element tree with component names such as Navigation2 and Pinchable, a selected text node, and its style in the inspector below.](https://tulustul.github.io/bevy-react/screenshots/devtools-nodes.png)

![The Bridge tab: a live log of ops, UI events and messages, with one op batch expanded to its timing breakdown and its JSON payload.](https://tulustul.github.io/bevy-react/screenshots/devtools-bridge.png)

![The Animations tab while paused: a toggle switch's transform spring and its button's backgroundColor fade, each scrubbed partway along its slider.](https://tulustul.github.io/bevy-react/screenshots/devtools-animations.png)
