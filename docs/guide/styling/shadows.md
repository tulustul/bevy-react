---
description: Drop shadows behind a node's box with boxShadow - color, offsets, blur and spread, several stacked shadows - plus a pointer to textShadow.
demo: Shadows
covers: [style.boxShadow]
---

# Shadows

`boxShadow` draws one or more drop shadows behind a node: the node's rounded
box, offset, grown by a spread and softened by a blur. Shadows never affect
layout.

## Usage

```tsx
<node
  style={{
    width: 160,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#1a1b26",
    boxShadow: {
      color: "rgba(0, 0, 0, 0.5)",
      yOffset: 6,
      blurRadius: 16,
    },
  }}
/>
```

## Fields

Every field is optional:

| Field          | Type   | Default   | Effect                                              |
| -------------- | ------ | --------- | --------------------------------------------------- |
| `color`        | color  | `"black"` | Shadow color (see [Colors](colors.md))              |
| `xOffset`      | length | `0`       | Moves the shadow right (negative: left)             |
| `yOffset`      | length | `0`       | Moves the shadow down (negative: up)                |
| `blurRadius`   | length | `0`       | Softens the edge; `0` is a hard edge                |
| `spreadRadius` | length | `0`       | Grows the shape before blurring (negative: shrinks) |

- A bare number is pixels; strings take units (see [Units](units.md)).
  Percentages resolve against the node's width, except `yOffset`, which
  uses its height. `"auto"` counts as `0`.
- An omitted `color` is opaque black; give the color an alpha for a soft
  shadow.
- The shadow follows the node's `borderRadius`, scaled with the spread.
- A blurred shadow reaches about three times `blurRadius` beyond its
  shape.

## Several shadows

An array draws several shadows under the same node:

```tsx
<node
  style={{
    boxShadow: [
      { color: "#4f8cff55", blurRadius: 28, spreadRadius: 6 },
      { color: "#ff000066", yOffset: 4, blurRadius: 6 },
    ],
  }}
/>
```

The shadows paint in array order: the first is at the back, and each later
one draws over the earlier ones where they overlap. This is the reverse of
CSS, where the first shadow is on top.

## Painting rules

- Shadows paint under the node's background, at the node's place in the
  stacking order: siblings painted after the node cover its shadow, and an
  ancestor's overflow clipping cuts it.
- A shadow is a full rounded box, not a ring around the node: a translucent
  or missing `backgroundColor` lets it show through the node.
- A fully transparent shadow, and one whose spread shrinks it to nothing,
  are skipped.
- On a node without a composited layer, `opacity` does not fade the shadow
  (see [Opacity](opacity.md)).
- `boxShadow` has no transition channel or `{ animated }` binding: a change
  snaps. Changing it from React repaints the node without re-running
  layout.

## Text shadows

`<text>` takes a separate `textShadow` style: one hard-edged copy of the
glyphs, offset by `offsetX`/`offsetY` pixels.

```tsx
<text style={{ textShadow: { color: "#00000080", offsetX: 2, offsetY: 2 } }}>
  Shadowed
</text>
```

See [`<text>`](../elements/text.md) for its defaults and rules.

## Limits

- There are no inset shadows.
- On a node promoted to a [composited layer](layers.md) (for example
  `opacity` on a node with children, or a `filter`), the shadow is captured
  with the layer and cut off at the node's border box. Put the shadow on a
  wrapper node that is not promoted.

See [`boxShadow`](../reference/style-properties.md#boxShadow) in the style
reference.
