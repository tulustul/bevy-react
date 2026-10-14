# `<root>`

`<root>` renders its children as a separate top-level UI tree on the
window, wherever it sits in your React tree. It fills the window and floats
above the app's own UI, which makes it the place for modals, toasts and
overlays declared next to the state that drives them. It is the on-screen
counterpart of [`<surface>`](surface.md), which renders a tree into a
texture.

## Usage

```tsx
const [open, setOpen] = useState(false);

<node>
  <button onClick={() => setOpen(true)}>
    <text>Open</text>
  </button>
  {open && (
    <root
      name="modal"
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000aa",
      }}
    >
      <node
        style={{ padding: 20, borderRadius: 12, backgroundColor: "#24283b" }}
      >
        <text>Hello from an overlay</text>
        <button onClick={() => setOpen(false)}>
          <text>Close</text>
        </button>
      </node>
    </root>
  )}
</node>;
```

Mounting and unmounting the `<root>` is the whole open and close mechanism.

## Default style

A `<root>` starts with this style, which its own `style` overrides property
by property:

```tsx
{ width: "100vw", height: "100vh", flexDirection: "column", globalZIndex: 1 }
```

The size is in [viewport units](../styling/units.md), not `"100%"`: Bevy
grows a UI root's row to fit its content, so a root sized `"100%"` outgrows
the window once its content is taller, and nothing inside it scrolls.

It has no alignment or gap of its own, so its children stretch across its
width. Center them with `alignItems` and `justifyContent`, as above. (The
main window tree differs: it centers top-level elements and spaces them
16px apart.)

## How it behaves

- **Detached from its parent's layout.** Its React parent's size, padding,
  `overflow` clipping, transforms and opacity don't affect it. In React it is
  an ordinary child: context, state and handlers work as usual, and it
  unmounts with its parent.
- **On the window's UI camera.** It renders on the default UI camera, like
  the main tree. There is no attribute to target another camera or window;
  for UI on a texture or a 3D mesh, use `<surface>`.
- **Stacking.** Roots and the main tree (`globalZIndex` 0) are ordered by
  `globalZIndex`, so the default `1` floats above the app. Two roots with
  the same value stack by history, not by rule (the one mounted or
  restacked last is on top): give overlays that can be open together
  distinct values. See [Z-index](../styling/z-index.md).
- **Click-through.** The root itself is never hit by the pointer, background
  included: clicks and hover on its empty area reach the app and the 3D
  scene beneath. Its children are ordinary pickable elements.
- **Props.** A `<root>` takes `style`, `name`, `sharedTag` and `key`. State
  styles and event handlers on it are ignored with a `propIgnored` warning;
  put them on a child.
- **Tab order.** With [Tab navigation](../events/focus.md#tab-navigation),
  a root's focusable elements come after the main tree's.

## Blocking modals

To keep the app beneath from reacting while a modal is open, make the
backdrop a blocking child that fills the root:

```tsx
<root>
  <node
    style={{
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000000aa",
      focusPolicy: "block",
    }}
  >
    <node style={dialogStyle}>{/* … */}</node>
  </node>
</root>
```

To close on an outside click, give the backdrop an `onClick` and the dialog
`focusPolicy: "block"`, so clicks inside the dialog don't reach the
backdrop. See [Focus policy](../styling/focus-policy.md).

## Devtools

The Nodes tab of the [devtools](../tooling/devtools.md) shows one tree at a
time and has a root selector: `main` for the window tree, plus one entry per
mounted `<root>`, labelled with its `name` (or `root#N` without one). Name
your roots to find them there. The devtools panel is itself a `<root>`,
kept above every app overlay.

## Limits

- Window UI camera only; no target camera or window.
- Layer styles on the `<root>` itself (`filter`, `backdropFilter`,
  `morphFilter`, `transform3d`, `cache`) have no effect, and its `opacity`
  fades only its own background. Wrap the content in a full-size child and
  style that.
- The root is its own UI root for [shared elements](../animations/shared-elements.md):
  a `sharedTag` never pairs a node inside a root with one outside it.
- For one element pinned to the window that should stay an ordinary child
  (same tree, same stacking order, shared elements with the rest of the
  app), [`positionType: "fixed"`](../layout/positioning.md#fixed) is the
  lighter tool.

See [`<root>`](../reference/elements.md#root) in the element reference.
