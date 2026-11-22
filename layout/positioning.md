# Positioning

`positionType` decides whether a node takes part in its parent's flex or
grid layout, and the inset keys `left`, `right`, `top` and `bottom` offset
it. A `"relative"` node (the default) stays in the flow and is nudged from
its laid-out spot; an `"absolute"` node leaves the flow and is placed
against its parent's box; a `"fixed"` node leaves the flow and is placed
against the window.

## Usage

```tsx
<node style={{ width: 200, height: 120, backgroundColor: "#24283b" }}>
  <node
    style={{
      positionType: "absolute",
      top: 8,
      right: 8,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: "#f7768e",
    }}
  />
</node>
```

## Insets

`left`, `right`, `top` and `bottom` are lengths (see
[Units](../styling/units.md)): a number is logical pixels, and `"auto"` (the
default) means not set. A percentage is of the parent's width (`left`,
`right`) or height (`top`, `bottom`).

## Relative

A `"relative"` node is laid out in the flow like any flex or grid item, then
moved by its insets. The move affects the node and its subtree only:
siblings keep their places as if it hadn't moved.

- `left: 10` moves it 10px right, `right: 10` moves it 10px left; `top` and
  `bottom` work the same way vertically.
- When both are set on one axis, `left` wins over `right` and `top` over
  `bottom`.
- For a purely visual offset that never touches layout, `transform` is the
  cheaper tool (see [Transforms](../styling/transforms.md)).

## Absolute

An `"absolute"` node is removed from the flow: its siblings lay out as if it
weren't there, and it takes up no space in its parent.

- The reference box is always the direct parent, whatever the parent's own
  `positionType`; there is no search for a positioned ancestor. Insets are
  measured from the parent's padding box: inside its border, excluding a
  reserved scrollbar gutter. Percentages are of that box.
- Insets on opposite sides with no size on that axis stretch the node
  between them. `left: 0` and `right: 0` make it as wide as the parent; all
  four at `0` cover the parent:

  ```tsx
  const overlay: BevyStyle = {
    positionType: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
  ```

- With a size and both opposite insets, `left` and `top` win. `"auto"`
  margins then split the leftover space, which centers a fixed-size node
  between `left: 0` and `right: 0`.
- With no inset on an axis, the node is placed by the parent's alignment on
  that axis (`justifyContent` on the main axis, `alignItems` or its own
  `alignSelf` on the cross axis). A parent with `justifyContent: "center"`
  and `alignItems: "center"` centers an inset-less absolute child.
- Margins still apply, as an extra offset from the insets.

An absolute node is still part of the tree for everything that isn't
layout:

- It paints in tree order among its siblings; being absolute doesn't raise
  it. Use `zIndex` or `globalZIndex` (see [Z-index](../styling/z-index.md)).
- An ancestor's `overflow` clipping still clips it, and inside a scroll
  container it scrolls with the content (see
  [Overflow](../styling/overflow.md)).

## Fixed

A `"fixed"` node is placed against the viewport instead of its parent: the
window for the app's tree and for a [`<root>`](../elements/root.md), the
texture for content inside a [`<surface>`](../elements/surface.md).

```tsx
<node style={{ height: 200, overflowY: "scroll" }}>
  {rows}
  <node
    style={{
      positionType: "fixed",
      right: 24,
      bottom: 24,
    }}
  >
    <text>Saved</text>
  </node>
</node>
```

- Insets, percentages and stretching work as for `"absolute"`, measured
  from the viewport's edges: `right: 24` and `bottom: 24` pin the node to
  the bottom right corner, and all four insets at `0` cover the viewport.
- Set an inset on each axis. Without one the node sits at the viewport's
  left or top edge, not where it would have been in the flow. Its own
  `justifySelf` and `alignSelf` place it on such an axis instead:
  `"center"` on both centers it in the viewport.
- It takes no space in its parent and adds nothing to a scroll container's
  scroll range.
- No ancestor scrolls, clips or transforms it. It stays put while its scroll
  container and the page scroll, an ancestor's `overflow` doesn't cut it,
  and an ancestor's `transform` neither moves nor scales it. Its own
  `transform` applies.
- An ancestor with `display: "none"` hides it, like any other descendant.

For everything that isn't layout it is still a child of its parent:

- It paints in tree order: over its parent and earlier siblings, under
  whatever comes later in the tree. Add `globalZIndex` to float it above
  everything (see [Z-index](../styling/z-index.md)).
- Its events bubble to its React ancestors, and it unmounts with its parent.

Each fixed node is laid out on its own, which suits a handful of badges,
toasts and panels. It is not the tool for hundreds of list rows.

## Overlays outside the tree

A fixed node stays in your tree. For UI that should leave it, use an
element made for it:

- [`<root>`](../elements/root.md) is a separate window-filling root that
  floats above your app's tree, with its own stacking order and its own
  entry in the devtools: for modals and screens of overlay UI.
- [`<anchor>`](../elements/anchor.md) follows a 3D entity's projected
  position on screen.

## Animating

- The insets accept an `{ animated }` binding, driven in pixels every frame
  without re-rendering React. See
  [Animated values](../animations/animated-values.md).
- The insets have no transition channel of their own;
  `transition: { layout }` eases the move when a static inset changes. See
  [Style transitions](../animations/style-transitions.md).
- Switching `positionType` to or from `"fixed"` snaps, also with
  `transition: { layout }`: the two positions are measured against
  different boxes. To glide between them, swap two nodes that share a
  `sharedTag` (see [Shared elements](../animations/shared-elements.md)).

## Limits

- An absolute node's containing block is always its parent: it can't escape
  to a grandparent's box. Restructure the tree, or use `"fixed"`.
- A fixed node's containing block is always the viewport. Unlike in CSS, an
  ancestor with a `transform`, a `transform3d` or a `filter` does not become
  its containing block.
- A fixed node is not part of an ancestor's
  [composited layer](../styling/layers.md): an ancestor's `opacity`,
  `filter`, `backdropFilter`, `morphFilter` and `transform3d` don't apply to
  it (CSS would fade it with an ancestor's opacity). It is drawn on its own,
  over the layer's image. Put such a style on the fixed node itself.
- On [`<root>`](../elements/root.md), [`<surface>`](../elements/surface.md)
  and [`<anchor>`](../elements/anchor.md), which are placed by their own
  rules, `"fixed"` means `"absolute"`.
- There is no `"sticky"` or `"static"`. `positionType` takes `"relative"`,
  `"absolute"` and `"fixed"`; anything else falls back to `"relative"` with
  a devtools warning.

See [`positionType`](../reference/style-properties.md#positionType),
[`left`](../reference/style-properties.md#left),
[`right`](../reference/style-properties.md#right),
[`top`](../reference/style-properties.md#top) and
[`bottom`](../reference/style-properties.md#bottom) in the style reference.
