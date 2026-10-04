---
description: Border widths, per-side border colors, rounded corners with transitions and animated radii, and outlines drawn outside the box.
demo: Borders
covers: [style.border, style.borderColor, style.borderRadius, style.outline]
---

# Borders

A node's border is a band inside its box: `border` sets its width per side,
`borderColor` paints it, and `borderRadius` rounds the corners of the whole
box. `outline` draws a separate ring outside the box that takes no space.

## Usage

```tsx
<node
  style={{
    width: 160,
    height: 90,
    border: 2,
    borderColor: "#7aa2f7",
    borderRadius: 12,
  }}
/>
```

## Border width

`border` takes the four-sided value that `padding` and `margin` take:

- a number: pixels on every side (`border: 2`);
- a CSS shorthand string of one to four lengths, in CSS order
  (`"2px 4px"` is top/bottom 2, left/right 4);
- a per-side object `{ top, right, bottom, left }`, unset sides `0`;
- an axis pair `{ horizontal, vertical }`, where `horizontal` sets left and
  right. Explicit sides in the same object win over the pair.

Each side is a length (see [Units](units.md)). An invalid token reports a
`rect` warning and counts as `0`.

The border is part of layout, like padding: a wider border shrinks the
content box (or grows the node, depending on `boxSizing`; see
[Sizing](sizing.md)). A border is invisible until it has a `borderColor` or
a `borderGradient`.

## Border color

```tsx
<node
  style={{
    border: { top: 3, right: 6, bottom: 9, left: 12 },
    borderColor: { top: "#7aa2f7", left: "#f7768e" },
  }}
/>
```

- One color string paints every side. The object form colors sides
  individually, and omitted sides are transparent.
- A multi-color string (`"red blue"`) is not supported; use the object
  form. An unknown key in the object (including `horizontal`/`vertical`)
  reports a `borderColor` warning and is ignored.
- The default is transparent.
- A `borderGradient` paints over the border color (see
  [Gradients](gradients.md)).
- `borderColor` has no transition channel; changes snap. The single-color
  form accepts an `{ animated }` `interpolateColor` binding, which drives all
  four sides (see [Colors](colors.md#animated-colors)).

## Corner radius

`borderRadius` takes the same four forms as `border`, applied to corners.
The sides name the corners clockwise from the top-left, as in the CSS
shorthand:

| Key          | Corner(s)                 |
| ------------ | ------------------------- |
| `top`        | top-left                  |
| `right`      | top-right                 |
| `bottom`     | bottom-right              |
| `left`       | bottom-left               |
| `horizontal` | top-right and bottom-left |
| `vertical`   | top-left and bottom-right |

```tsx
<node style={{ borderRadius: { top: 0, right: 10, bottom: 20, left: 60 } }} />
```

- Percentages resolve against the node's shorter side, and every radius is
  capped at half of it: `"50%"` makes a square node a circle, and a large
  pixel value such as `999` makes a pill.
- One radius per corner: elliptical corners are not supported.
- The radius rounds the background, border, gradients, `boxShadow`,
  `outline` and a [backdrop filter](backdrop-filters.md). It clips a
  `backgroundImage` in `"stretch"` mode, but not in the repeat modes.
- Bevy keeps the radii with the node's layout, so changing `borderRadius`
  re-runs layout.

### Transitions and animation

`transition: { borderRadius }` eases the radii between style states, one
corner at a time:

```tsx
<button
  style={{ borderRadius: 8, transition: { borderRadius: { duration: 200 } } }}
  hoverStyle={{ borderRadius: 24 }}
/>
```

- A corner eases when both values share a unit (px to px, `%` to `%`). A
  corner that changes unit snaps on its own while the others ease.
- Unsetting `borderRadius` eases to square corners.
- Every eased frame is a relayout; prefer short transitions on large trees.

`borderRadius: { animated: sv }` binds all four corners to one shared value,
in pixels. There are no per-corner bindings. A binding wins over the
transition. See [Animated values](../animations/animated-values.md).

## Outline

```tsx
<node
  style={{ border: 2 }}
  hoverStyle={{ outline: { width: 3, offset: 4, color: "#f9e2af" } }}
/>
```

`outline` is an object with three optional fields:

| Field    | Type   | Default   | Effect                                  |
| -------- | ------ | --------- | --------------------------------------- |
| `width`  | length | `1`       | Ring thickness                          |
| `offset` | length | `0`       | Gap between the border box and the ring |
| `color`  | color  | `"white"` | Ring color                              |

- The ring is drawn outside the border box and follows its corner radii.
- It takes no layout space, so it can overlap neighbors, and an ancestor's
  overflow clipping cuts it like any other paint.
- A negative `offset` draws the ring inside the box, down to half the
  node's shorter side.
- Percentages in `width` and `offset` resolve against the node's width.
- There is one ring for all sides, and no transition or `{ animated }`
  binding.

## Limits

- Borders and outlines are solid: there are no dashed or dotted styles.
- On a node without a composited layer, `opacity` does not fade
  `borderColor` or `outline` (see [Opacity](opacity.md)).
- Overflow clipping is rectangular: children are not clipped to the rounded
  corners.

See [`border`](../reference/style-properties.md#border),
[`borderColor`](../reference/style-properties.md#borderColor),
[`borderRadius`](../reference/style-properties.md#borderRadius) and
[`outline`](../reference/style-properties.md#outline) in the style
reference.
