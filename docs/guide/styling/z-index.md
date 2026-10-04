---
description: Control paint and hit-test order with zIndex among siblings and globalZIndex across the whole UI, for popovers and overlays.
demo: Z-index
covers: [style.zIndex, style.globalZIndex]
---

# Z-index

UI nodes paint in tree order. `zIndex` reorders a node among its siblings;
`globalZIndex` lifts a node and its subtree out of its parent's stacking
order into the UI's top-level order, for popovers and overlays. The same
order decides which node is on top for hover and clicks.

## Usage

```tsx
const box = { width: 80, height: 80 };

<node style={{ flexDirection: "row" }}>
  <node style={{ ...box, backgroundColor: "#7aa2f7", zIndex: 1 }} />
  <node style={{ ...box, left: -40, backgroundColor: "#f7768e" }} />
</node>;
```

The blue node paints over the red one, although it comes first.

## Stacking order

- Without either style, later siblings paint over earlier ones, and children
  paint over their parent.
- `zIndex` is an integer, default `0`. Among siblings, a higher value paints
  on top; equal values keep tree order. Negative values sort below siblings
  at `0`, but a child never paints below its own parent.
- `zIndex` only reorders siblings. A deeply nested node can't use it to rise
  above an unrelated subtree; that takes `globalZIndex`.
- Hit testing follows the same order: the topmost node under the pointer is
  hovered and clicked first (see [Focus policy](focus-policy.md)).

## Global z-index

```tsx
<node style={{ backgroundColor: "#24283b" }}>
  <node style={{ positionType: "absolute", top: 40, globalZIndex: 10 }}>
    <text>Popover</text>
  </node>
</node>
```

- A node with `globalZIndex` is sorted together with the UI's root nodes
  instead of inside its parent. A positive value paints above every node
  without one; a negative value paints below them. The app's React tree
  counts as `0`.
- Between nodes with the same `globalZIndex`, `zIndex` breaks the tie.
- The node's subtree comes along: its children stack inside it as usual.
- Layout is unaffected: the node keeps its place and size in its parent's
  layout. Only paint and hit-test order change.
- Unset by default. Removing it puts the node back into its parent's order.

Built-in overlays use the same scale: a [`<root>`](../elements/root.md)
defaults to `globalZIndex: 1`, just above the app's tree, and
[`<anchor>`](../elements/anchor.md) overlays sit at `-1`, below it. Override
a `<root>`'s value with its own style.

## Limits

- Both styles take integers.
- Inside a [composited layer](layers.md) (for example under a node with
  `opacity` and children), a `globalZIndex` descendant is drawn as part of
  the layer's image: it can't rise above the layer's surroundings, and
  whatever it paints outside the layer root's box is cut off.

See [`zIndex`](../reference/style-properties.md#zIndex) and
[`globalZIndex`](../reference/style-properties.md#globalZIndex) in the style
reference.
