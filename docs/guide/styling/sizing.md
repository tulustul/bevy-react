---
description: Size nodes with width and height, clamp them with min and max sizes, derive one axis with aspectRatio, and pick the box model with boxSizing.
demo: Sizing
covers:
  [
    style.width,
    style.height,
    style.minWidth,
    style.minHeight,
    style.maxWidth,
    style.maxHeight,
    style.aspectRatio,
    style.boxSizing,
  ]
---

# Sizing

`width` and `height` set a node's size, `minWidth`, `minHeight`, `maxWidth`
and `maxHeight` clamp it, and `aspectRatio` derives one axis from the other.
All the size keys take lengths (see [Units](units.md)) and default to
`"auto"`, which leaves the size to the content and the parent's
[flexbox](../layout/flexbox.md) or [grid](../layout/grid.md) layout.

## Usage

```tsx
<node style={{ width: "60%", maxWidth: 480, aspectRatio: 16 / 9 }} />
```

## Width and height

- A number or `"px"` value is a fixed size in logical pixels; `"50%"` is of
  the parent's content box; viewport units follow the window.
- `"auto"` (the default) sizes from the content, then lets the layout
  adjust: in a flex container the item can grow or shrink along the main
  axis (`flexGrow`, `flexShrink`) and stretches across it (`alignItems`
  defaults to `"stretch"`).
- A fixed size on a flex item's main axis is only its starting size:
  `flexShrink`, which defaults to `1`, still shrinks it when the line
  overflows. Set `flexShrink: 0` (or a `minWidth`) to hold it.
- A percentage of a parent whose size on that axis depends on its content
  (an auto-height column, say) behaves as `"auto"`.

## Minimum and maximum sizes

```tsx
<node style={{ width: "100%", maxWidth: 160 }} />
```

- `maxWidth` and `maxHeight` cap the size, `minWidth` and `minHeight` floor
  it, whatever produced it: an explicit size, flex growing or shrinking,
  stretching, or an aspect ratio. When they conflict, the minimum wins.
- `maxWidth`/`maxHeight` `"auto"` (the default) means no cap.
- `minWidth`/`minHeight` `"auto"` (the default) means no floor, except for
  flex and grid items: those never shrink below their content's minimum
  size (the width of their longest word, for text). Set `minWidth: 0` to
  let such an item shrink further, or give it an `overflowX` of `"hidden"`
  or `"scroll"` (see [Overflow](overflow.md)).

## Aspect ratio

`aspectRatio` is a number, width divided by height. When layout knows one
axis and the other is `"auto"`, it derives the missing one:

```tsx
<node style={{ height: 50, aspectRatio: 1.6 }} /> // 80 × 50
```

The known axis can come from an explicit size or from layout, such as a
stretched width. With both `width` and `height` set, `aspectRatio` has no
effect. An `<image>` already keeps its texture's ratio when you set one axis
(see [`<image>`](../elements/image.md)).

## Box sizing

`boxSizing` decides which box `width`, `height` and the min and max sizes
measure:

- `"borderBox"` (the default): the size includes padding and border.
  A `width: 100` node with `padding: 10` is 100px wide with an 80px content
  area.
- `"contentBox"`: the size is the content area; padding and border are
  added outside it. The same node is 120px wide.

Both spellings are accepted: `"borderBox"` or `"border-box"`, `"contentBox"`
or `"content-box"`. Note that the default is the opposite of CSS's.

## Animating sizes

- `transition: { size }` eases `width`, `height`, `maxWidth` and
  `maxHeight` between style values of the same unit (pixels to pixels,
  percentages to percentages). A change of unit, or to or from `"auto"`,
  snaps. Every eased frame is a real relayout, so siblings re-flow around
  the node, which makes it the tool for accordions:

  ```tsx
  <node
    style={{
      maxHeight: open ? 300 : 0,
      overflowY: "clip",
      transition: { size: { duration: 250 } },
    }}
  >
    {details}
  </node>
  ```

- Every size key, `aspectRatio` included, accepts an `{ animated }`
  binding, driven in logical pixels (a plain number for `aspectRatio`)
  every frame without re-rendering React. See
  [Animated values](../animations/animated-values.md).
- `transition: { layout }` eases a size change visually instead, scaling
  the node's box from the old size to the new one while the real layout
  snaps. See [Style transitions](../animations/style-transitions.md).
- Laid-out sizes are rounded to whole pixels, so a size animated through
  layout steps a pixel at a time and its neighbours hop. Turn rounding off
  for that subtree with [Layout rounding](layout-rounding.md).

`minWidth`, `minHeight`, `aspectRatio` and `boxSizing` have no transition
channel.

## Limits

- There are no `min-content`, `max-content` or `fit-content` size keywords;
  a size is a length or `"auto"`.
- Known issue: a node that combines a percentage `width` with `maxWidth`
  can measure wrapped text inside it at the unclamped width, so it reserves
  too little height and the content overflows. Give such a node a pixel
  width instead.

See [`width`](../reference/style-properties.md#width),
[`height`](../reference/style-properties.md#height),
[`minWidth`](../reference/style-properties.md#minWidth),
[`minHeight`](../reference/style-properties.md#minHeight),
[`maxWidth`](../reference/style-properties.md#maxWidth),
[`maxHeight`](../reference/style-properties.md#maxHeight),
[`aspectRatio`](../reference/style-properties.md#aspectRatio) and
[`boxSizing`](../reference/style-properties.md#boxSizing) in the style
reference.
