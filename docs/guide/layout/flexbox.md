---
description: Lay out children in rows and columns with flexbox, the default layout of every node, with wrapping, growing, shrinking, alignment and gaps.
demo: Flexbox
covers:
  [
    style.display,
    style.flexDirection,
    style.flexWrap,
    style.flexGrow,
    style.flexShrink,
    style.flexBasis,
    style.alignItems,
    style.alignSelf,
    style.alignContent,
    style.justifyContent,
    style.gap,
    style.rowGap,
    style.columnGap,
  ]
---

# Flexbox

Every node lays out its children with flexbox unless its `display` says
otherwise. The style keys map one to one onto the fields of Bevy's `Node`,
which Bevy lays out with taffy, so the behavior follows the CSS flexbox
spec. Keyword values are camelCase (`"spaceBetween"`, `"rowReverse"`).

## Usage

```tsx
<node style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
  <node style={{ width: 40, height: 40, backgroundColor: "#7aa2f7" }} />
  <node style={{ flexGrow: 1, height: 40, backgroundColor: "#9ece6a" }} />
  <node style={{ width: 40, height: 40, backgroundColor: "#f7768e" }} />
</node>
```

## Defaults

Unset keys keep Bevy's defaults:

| Key              | Default                  |
| ---------------- | ------------------------ |
| `display`        | `"flex"`                 |
| `flexDirection`  | `"row"`                  |
| `flexWrap`       | `"nowrap"`               |
| `flexGrow`       | `0`                      |
| `flexShrink`     | `1`                      |
| `flexBasis`      | `"auto"`                 |
| `justifyContent` | behaves as `"flexStart"` |
| `alignItems`     | behaves as `"stretch"`   |
| `alignContent`   | behaves as `"stretch"`   |
| `alignSelf`      | `"auto"`                 |
| `gap`            | `0`                      |

Compared with a web page:

- Every node is a flex container. There is no inline layout: text is its own
  `<text>` element, a flex item like any other.
- `boxSizing` defaults to `"borderBox"`, so `width` includes padding and
  border (see [Sizing](../styling/sizing.md)).
- The elements your app renders at the top level are children of a
  window-filling column that centers them horizontally, 16px apart. Give the
  top-level node `width: "100%"` and `height: "100%"` to take the whole
  window.

An unrecognized keyword in any key on this page falls back to the default
and reports a devtools warning.

## Display

`display` picks the layout model for the node's children:

- `"flex"` (the default): flexbox, as described on this page.
- `"grid"`: CSS grid, see [Grid](grid.md).
- `"block"`: children stack vertically and stretch to the container's width,
  like CSS block flow.
- `"none"`: the node and its whole subtree take no space and are not drawn.
  To hide a node but keep its space, use `opacity: 0` instead.

## Direction and wrapping

`flexDirection` sets the main axis: `"row"` (left to right), `"column"` (top
to bottom), `"rowReverse"` or `"columnReverse"`.

`flexWrap` decides what happens when the items don't fit on the main axis:

- `"nowrap"` (also spelled `"noWrap"`, the default): one line; items shrink,
  then overflow.
- `"wrap"`: items move onto new lines along the cross axis.
- `"wrapReverse"`: like `"wrap"`, with new lines added before the previous
  one.

```tsx
<node style={{ width: 152, flexWrap: "wrap", gap: 8 }}>{swatches}</node>
```

## Growing and shrinking

- `flexGrow` (a number, default `0`): the item's share of the free space on
  the main axis. `0` keeps its base size.
- `flexShrink` (a number, default `1`): the item's share of the shrinking
  when the line overflows. `0` keeps its base size.
- `flexBasis` (a length, default `"auto"`): the base size before growing and
  shrinking. `"auto"` uses the item's `width` (in a row) or `height` (in a
  column), else its content size. A percentage is of the container's
  content box on the main axis.

There is no `flex` shorthand; set the keys you need. Columns that split a
row equally:

```tsx
const column: BevyStyle = { flexGrow: 1, flexBasis: 0 };
```

A flex item never shrinks below its content's minimum size, because
`minWidth` and `minHeight` default to `"auto"`. Set `minWidth: 0` (or an
`overflowX` of `"hidden"` or `"scroll"`) to let it shrink further, for
example a row with clipped text. See [Sizing](../styling/sizing.md) and
[Overflow](../styling/overflow.md).

## Alignment

| Key              | Set on    | Aligns                                 |
| ---------------- | --------- | -------------------------------------- |
| `justifyContent` | container | the items along the main axis          |
| `alignItems`     | container | each item across its line              |
| `alignSelf`      | item      | this item across its line              |
| `alignContent`   | container | the wrapped lines along the cross axis |

Accepted values:

- `justifyContent`: `"start"`, `"end"`, `"flexStart"`, `"flexEnd"`,
  `"center"`, `"spaceBetween"`, `"spaceAround"`, `"spaceEvenly"`,
  `"stretch"`. In flexbox, `"stretch"` behaves as `"flexStart"`.
- `alignItems`: `"start"`, `"end"`, `"flexStart"`, `"flexEnd"`,
  `"center"`, `"baseline"`, `"stretch"`. With the default stretch, an item
  without its own cross size fills the line.
- `alignSelf`: `"auto"` (use the container's `alignItems`) or any
  `alignItems` value.
- `alignContent`: the same values as `justifyContent`; here `"stretch"`
  grows the lines to fill the container. It only has an effect when the
  items wrap onto several lines.

`"start"`/`"end"` and `"flexStart"`/`"flexEnd"` are different values.
`"start"` and `"end"` are physical: layout is always left to right, so
`"start"` is the left (or top) edge. `"flexStart"` and `"flexEnd"` follow
`flexDirection`, so they swap sides under `"rowReverse"` and
`"columnReverse"`.

`justifyItems` and `justifySelf` have no effect on flex items; they belong
to [Grid](grid.md).

## Gaps

`gap` spaces the children of a flex or grid container, between items only,
never at the container's edges. `rowGap` and `columnGap` set one axis and
win over `gap` whatever order the keys are written in:

```tsx
<node style={{ flexWrap: "wrap", gap: 8, rowGap: 16 }}>{tags}</node>
```

In a row, `columnGap` separates the items and `rowGap` separates the wrapped
lines; in a column it is the other way around. The value is a length: a
percentage is of the container's own content box on that axis, and `"auto"`
is `0`.

## Animating

- `transition: { layout }` on the items eases every rearrangement (a
  direction or alignment change, an inserted sibling, a wrap) from the old
  position to the new one. See
  [Style transitions](../animations/style-transitions.md).
- `flexBasis`, `gap`, `rowGap` and `columnGap` accept an `{ animated }`
  binding, driven in pixels every frame without re-rendering React. See
  [Animated values](../animations/animated-values.md).
- `flexGrow`, `flexShrink` and the keyword keys don't animate.

## Limits

- No `order` and no right-to-left layout: items lay out in tree order, left
  to right.
- Keywords are camelCase only: `"space-between"` is not accepted.

See [`display`](../reference/style-properties.md#display),
[`flexDirection`](../reference/style-properties.md#flexDirection),
[`flexWrap`](../reference/style-properties.md#flexWrap),
[`flexGrow`](../reference/style-properties.md#flexGrow),
[`flexShrink`](../reference/style-properties.md#flexShrink),
[`flexBasis`](../reference/style-properties.md#flexBasis),
[`justifyContent`](../reference/style-properties.md#justifyContent),
[`alignItems`](../reference/style-properties.md#alignItems),
[`alignSelf`](../reference/style-properties.md#alignSelf),
[`alignContent`](../reference/style-properties.md#alignContent),
[`gap`](../reference/style-properties.md#gap),
[`rowGap`](../reference/style-properties.md#rowGap) and
[`columnGap`](../reference/style-properties.md#columnGap) in the style
reference.
