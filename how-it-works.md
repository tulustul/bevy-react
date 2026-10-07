# How it works

bevy-react uses a bridge architecture, like early versions of React Native,
with Bevy's ECS in place of native views. React runs in an embedded
JavaScript engine and only describes the UI. A custom reconciler turns each
React commit into a batch of small operations, and the Bevy side applies them
to ordinary ECS entities — `bevy_ui` nodes for every built-in element. Layout,
input, picking and rendering are plain Bevy; nothing is emulated.

## The two sides

- **The JS side** is your React app plus bevy-react's reconciler, which
  stands in for react-dom. In a native build it runs in a V8 isolate
  (through [`deno_core`](https://crates.io/crates/deno_core)) on a dedicated
  thread, off the game loop: there is no Node and no browser. In a web build
  the same code runs in the browser's own JS engine.
- **The Bevy side** is `ReactUiPlugin` (part of `ReactPlugins`). It hosts the
  JS runtime, loads your bundle, applies the operations to the ECS and sends
  events back.

Your UI ships as two bundles built by the `bevy-react` CLI: `vendor.js`
(React, the reconciler and the runtime) and `app.js` (your components). See
[Getting started](getting-started.md).

## From a render to entities

When React commits, the reconciler sends that commit's changes as one
batch: create a node, update its props, append, insert or remove a child,
set a text. In its next frame, Bevy drains every batch that has arrived,
applies them in order, and then lays out and renders as usual.

- Every element becomes an entity that carries Bevy components such as
  `Node`, `BackgroundColor`, `Text` or `ImageNode`. Which ones depends on
  the element type and its props.
- A commit shows up in the first Bevy frame after it was sent. Natively,
  React renders on its own thread, so a slow render delays the update but
  never stalls a Bevy frame. On the web the two share the browser's main
  thread.
- Props cross generically. Every prop except `children`, `key` and `ref` is
  sent; a handler such as `onClick` crosses only as a flag, and the function
  stays in JS. Bevy decodes each prop against the element's registered
  attributes and the registered style properties, and reports an unknown one
  as a warning (in the log and in devtools) instead of failing.
- The bridge owns the components it writes. Your systems can find React
  nodes, read their layout and add components of their own (see
  [Named nodes](communication/named-nodes.md)), but must not overwrite what
  the bridge manages.

Elements and style properties are registered in Rust. The core elements,
the feature elements (`<svg>`, `<canvas>`, …) and your own all go through
the same API (see [Custom elements](extending/custom-elements.md) and
[Custom styles](extending/custom-styles.md)).

## Not only UI

The bridge itself manages ECS entities, not UI specifically. `bevy_ui` is
the built-in element set, and it is where layout, `style`, picking, layers
and transitions come from. A custom element can spawn any entity instead: a
3D mesh, a light, a sound emitter. React then mounts, updates and unmounts it
like any other element, driving its attributes from state, and `name` makes
it reachable from your systems. The demos' `<cube>` is such an element: a
mesh in the 3D scene, rendered from a React list. What a non-UI element gets,
and what it has to bring itself, is listed under
[Beyond UI](extending/custom-elements.md#beyond-ui).

## Updates are deltas

On a re-render, the reconciler compares old and new props and sends only
the fields that changed. `style` is compared field by field, and other
props by value, so an inline object literal that did not change sends
nothing. A re-render that produces identical values sends no operation at
all, which makes idiomatic React (re-render freely, let the diff sort it
out) cheap.

On the Bevy side, a change re-runs only the code that reads the changed
properties. A color change repaints the node without a relayout; a `width`
change triggers a relayout, as it would in `bevy_ui` itself.

## Events flow back

Interactions travel the other way over a single channel. Bevy's picking
finds what is under the pointer, and the runtime routes each event to the
handler registered for that node and event name. Events do not bubble: the
topmost node under the pointer that handles the event receives it (see
[Mouse](events/mouse.md)). The same channel carries the app's own events,
request responses and animation completions.

## Talking to your app

App-level state uses three typed channels, each defined by a Rust type and
mirrored to TypeScript by codegen: messages from React to Bevy
([React to Bevy](communication/react-to-bevy.md)), requests that Bevy
answers ([Request / response](communication/request-response.md)) and
events from Bevy to React ([Bevy to React](communication/bevy-to-react.md)).

```tsx
import { bevy } from "./bevy"; // generated

bevy.player.setName("Ada");
```

```rust
#[react_message(name = "player.setName")]
struct SetName(String);

app.add_react_handler(|on: On<SetName>| {
    info!("name: {}", on.event().0);
});
```

The generated `bevy.ts` is the contract: change a Rust type, regenerate,
and the TypeScript compiler points at every call site to update (see
[TypeScript codegen](tooling/ts-codegen.md)).

## Animations run in Bevy

[Style transitions](animations/style-transitions.md) and
[animated values](animations/animated-values.md) are declared from React
once and driven by Bevy every frame. A transition is part of the style; an
animated value is a number that lives on the Bevy side, bound into a style
and moved by a driver such as `withTiming`. No JS runs per frame and nothing
crosses the bridge per tick; the only message back is a completion callback
when you ask for one. In a native build, a busy JS thread therefore never
makes an animation stutter.

## Hot reload

In a native build the JS runtime and the React tree survive edits. Saving a
file rebuilds only `app.js`, which runs again in the live runtime, and React
Fast Refresh re-renders. Components keep their `useState` and other hook
state, and the Bevy side (entities, running animations) carries on. A
component whose hook calls changed remounts with fresh state. See
[Hot reload](tooling/hot-reload.md).

## Composited layers

Some styles promote a subtree to a composited layer: group `opacity` on a
node with children, a `filter` chain, a `backdropFilter`, a `transform3d`, a
`morphFilter`, or `cache: "always"` or `"never"`. The subtree is rendered
into an offscreen texture and drawn back as one quad.

- The capture is cached: a layer whose content did not change is not
  rendered again.
- Moving it, fading it and changing filter params happen when the quad is
  drawn, so animating them never re-renders the content.
- Promotion itself changes neither layout nor picking.

See [Layers](styling/layers.md).

## The web host

On wasm the UI is still `bevy_ui` drawn by Bevy into its canvas, not DOM.
The page loads `vendor.js` and `app.js` next to the wasm module, the bridge
operations are exposed to the browser's JS engine, and a Bevy system
delivers events to JS each frame. The bundle is the same as natively. See
[Web builds](tooling/web.md).

## What this means for performance

- Re-render freely: unchanged props cost nothing to send.
- Animate with transitions and animated values, not with a `setState` per
  frame. Each state change is a render, a diff and a batch.
- Prefer `transform` and `opacity` for motion. Changing sizes, positions
  and other layout properties relayouts the UI on every change.
- Every element is an entity, and the cost of a commit grows with the number
  of nodes it creates or changes.
- The devtools Bridge tab shows the operations each commit sends (see
  [Devtools](tooling/devtools.md)), and [Performance](performance.md) has
  benchmark numbers.
