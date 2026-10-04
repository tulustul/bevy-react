---
description: Space nodes with padding inside their border and margin outside it, in any four-sided form, including auto margins that push items apart.
demo: Spacing
covers: [style.margin, style.padding]
---

# Spacing

`padding` insets a node's children from its border, and `margin` keeps
space around the node, between it and its siblings or its parent's edge.
Both take a four-sided value and default to `0`. To space a container's
children evenly, use `gap` on the container instead (see
[Flexbox](../layout/flexbox.md#gaps)).

## Usage

```tsx
<node style={{ flexDirection: "row", padding: 16, gap: 8 }}>
  <node style={{ width: 36, height: 36, backgroundColor: "#7aa2f7" }} />
  <node
    style={{
      width: 36,
      height: 36,
      margin: { left: "auto" },
      backgroundColor: "#9ece6a",
    }}
  />
</node>
```

The second box's `"auto"` left margin takes all the free space in the row,
which pushes it to the far end.

## Values

Each key takes the `Rect` forms described in [Units](units.md#four-sided-values):

```tsx
const all: BevyStyle = { padding: 12 };
const shorthand: BevyStyle = { padding: "8px 16px" }; // vertical, horizontal
const axes: BevyStyle = { padding: { horizontal: 24, vertical: 8 } };
const sides: BevyStyle = { margin: { top: 4, left: 24 } }; // the rest 0
```

- A percentage on any side, vertical sides included, is of the parent's
  width, as in CSS.
- A per-side object sets the sides it omits to `0`, and the value always
  replaces the whole rect. A `hoverStyle` with `padding: { left: 20 }`
  zeroes the other three sides while hovered; repeat them in the overlay to
  keep them.

## Padding

- Padding sits inside the border, and the background paints under it.
  Children lay out in the content box that remains.
- With the default `boxSizing: "borderBox"`, padding counts toward the
  node's `width` and `height`; with `"contentBox"` it is added to them (see
  [Sizing](sizing.md)).
- `"auto"` padding is `0`.

## Margin

- Margin sits outside the border and paints nothing.
- An `"auto"` margin absorbs free space in a flex or grid container:
  `margin: { left: "auto" }` pushes an item to the end of its row, and
  `margin: "auto"` centers it on both axes. On an absolute node between
  opposite insets, `"auto"` margins center it (see
  [Positioning](../layout/positioning.md)).
- A negative margin pulls the node, and everything laid out after it,
  closer.
- Adjacent margins never collapse in flex and grid layouts: two 8px margins
  make 16px.

The node's `border` width is the third layer of the box, between padding
and margin; see [Borders](borders.md).

## Animating

`margin` and `padding` take no `{ animated }` binding and have no transition
channel: a change applies at once. To ease the movement it causes, put
`transition: { layout }` on the nodes that move (see
[Style transitions](../animations/style-transitions.md)), or animate a
spacer's size or the container's `gap` instead.

See [`margin`](../reference/style-properties.md#margin) and
[`padding`](../reference/style-properties.md#padding) in the style
reference.
