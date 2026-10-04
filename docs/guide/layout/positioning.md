---
description: Take a node out of the layout flow with positionType absolute, offset it with left, right, top and bottom, and know what the offsets are relative to.
covers: [style.positionType, style.left, style.right, style.top, style.bottom]
---

# Positioning

`positionType` decides whether a node takes part in its parent's flex or
grid layout, and the inset keys `left`, `right`, `top` and `bottom` offset
it. A `"relative"` node (the default) stays in the flow and is nudged from
its laid-out spot; an `"absolute"` node leaves the flow and is placed
against its parent's box.

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

## Overlays outside the tree

There is no `"fixed"`, `"sticky"` or `"static"` position. For UI that must
stay put relative to the window or a 3D object, use an element made for it:

- [`<root>`](../elements/root.md) is a separate window-filling root that
  floats above your app's tree, for modals, toasts and panels.
- [`<anchor>`](../elements/anchor.md) follows a 3D entity's projected
  position on screen.

## Animating

- The insets accept an `{ animated }` binding, driven in pixels every frame
  without re-rendering React. See
  [Animated values](../animations/animated-values.md).
- The insets have no transition channel of their own;
  `transition: { layout }` eases the move when a static inset changes. See
  [Style transitions](../animations/style-transitions.md).

## Limits

- The containing block is always the parent: an absolute node can't escape
  to a grandparent's box. Restructure the tree, or use `<root>`.
- `positionType` takes only `"relative"` and `"absolute"`; anything else
  falls back to `"relative"` with a devtools warning.

See [`positionType`](../reference/style-properties.md#positionType),
[`left`](../reference/style-properties.md#left),
[`right`](../reference/style-properties.md#right),
[`top`](../reference/style-properties.md#top) and
[`bottom`](../reference/style-properties.md#bottom) in the style reference.
