---
description: Clip or scroll content larger than its node with overflowX and overflowY, control the scroll offset from React, and add a styled, draggable scrollbar.
demo: Overflow
covers:
  [style.overflowX, style.overflowY, style.scrollbarWidth, style.scrollbar]
---

# Overflow

`overflowX` and `overflowY` decide, per axis, what happens to children that
extend past a node's box: they spill out, get clipped, or make the node a
scroll container. A scroll container scrolls with the mouse wheel and touch
drags, takes a controlled offset from React, and can show a draggable
scrollbar through the `scrollbar` style.

## Usage

```tsx
function Log({ lines }: { lines: string[] }) {
  return (
    <node
      style={{
        flexDirection: "column",
        height: 240,
        overflowY: "scroll",
        scrollbar: "default",
      }}
    >
      {lines.map((line, i) => (
        <text key={i}>{line}</text>
      ))}
    </node>
  );
}
```

## Overflow modes

Each axis takes one of four values:

| Value                 | Content outside the box | Minimum size as a flex or grid item |
| --------------------- | ----------------------- | ----------------------------------- |
| `"visible"` (default) | Drawn                   | Its content's minimum size          |
| `"clip"`              | Clipped                 | Its content's minimum size          |
| `"hidden"`            | Clipped                 | `0`                                 |
| `"scroll"`            | Clipped and scrollable  | `0`                                 |

- Clipping cuts at the padding box (inside the border) on that axis only:
  `overflowX: "clip"` lets content spill vertically.
- Clipped content is neither drawn nor hit by the pointer.
- `"clip"` and `"hidden"` cut the same pixels; they differ in layout. As a
  flex or grid item, a `"clip"` node keeps its content's minimum size as its
  own, while a `"hidden"` or `"scroll"` node can be shrunk below it by its
  parent. A `"hidden"` axis is not scrollable.
- An unrecognized value falls back to `"visible"` and reports an `overflow`
  devtools warning. There is no `overflow` shorthand: set both axes.

## Scroll containers

A `"scroll"` axis offsets the children by the node's scroll offset. The
offset runs from `0` to the content's size minus the box's size and is
clamped to that range; when the content fits, there is nothing to scroll.
Absolutely positioned children scroll with the rest.

### Wheel and touch

- The mouse wheel scrolls the topmost scroll container under the cursor
  that has room to scroll on the wheeled axis. A container whose content
  fits lets the wheel through to the containers beneath it and, past the
  last one, to the 3D scene.
- A container that can scroll on that axis takes the wheel even when it is
  already at the end, so the wheel never chains to an outer container.
- A vertical wheel doesn't scroll a container that only scrolls
  horizontally; that needs a horizontal wheel or trackpad gesture.
- The `scrollStep` prop sets how many logical pixels one wheel notch
  scrolls, `20` by default. Trackpads report pixels, which are used as is.
- A node with an `onWheel` handler under the cursor takes the wheel: no
  container beneath it scrolls. See [Mouse events](../events/mouse.md).
- When a container scrolls, `PointerCapture::wheel_captured` is set for the
  frame, so a world system gating on it (a zoom camera) ignores that wheel.
- On a touch screen, dragging a finger over a container scrolls it with the
  finger. A touch that moves more than 8px becomes a scroll, and its tap no
  longer clicks.

### Controlled offset

```tsx
const [scrollTop, setScrollTop] = useState(0);

<node
  style={{ height: 240, overflowY: "scroll" }}
  scrollTop={scrollTop}
  onScroll={(e) => setScrollTop(e.scrollTop)}
>
  {rows}
</node>;
```

- `scrollTop` and `scrollLeft` (logical pixels) move the offset when their
  value changes. Re-rendering with the same value does nothing, so they
  never fight the user's wheel; keep the state in sync through `onScroll`
  so the next value you set is a real change.
- A value past the end lands on the end once layout has run, and `onScroll`
  then reports the real offset. Setting a large `scrollTop` in the same
  render that appends rows pins a log to its bottom.
- `onScroll` receives `{ scrollTop, scrollLeft }` whenever the offset
  changes: wheel, touch, scrollbar, or an eased scroll. A value you set
  yourself that lands in range is not echoed back.
- The scroll props are accepted on `<node>`, `<button>`, `<text>`,
  `<image>`, `<canvas>`, `<svg>`, `<portal>` and `<anchor>`.

`transition: { scroll }` eases the offset toward each new wheel or
`scrollTop`/`scrollLeft` target instead of jumping (dragging the scrollbar
still snaps). Don't also feed `onScroll` back into the same controlled axis
then: the round trip fights the ease. See
[Style transitions](../animations/style-transitions.md).

## The scrollbar

Bevy draws no scrollbar on its own. The `scrollbar` style adds one per
`"scroll"` axis, hidden while the content fits. The thumb is draggable and
clicking the track pages.

- `"none"` (the default): no visible bar.
- `"default"`: a neutral bar, 12px thick: a faint dark track and a gray,
  rounded thumb.
- An object, to configure it:

```tsx
const bar: ScrollbarStyle = {
  track: { backgroundColor: "#00000088", borderRadius: 8 },
  thumb: {
    backgroundColor: "#7aa2f7",
    borderRadius: 8,
    hover: { backgroundColor: "#89b4fa" },
    pressed: { backgroundColor: "#b4befe" },
  },
  thickness: 10,
};

<node style={{ height: 180, overflowY: "scroll", scrollbar: bar }} />;
```

| Field            | Default    | Effect                                              |
| ---------------- | ---------- | --------------------------------------------------- |
| `track`          | faint dark | The groove's look                                   |
| `thumb`          | gray pill  | The handle's look                                   |
| `thickness`      | `12`       | Bar width across its axis, in logical pixels        |
| `minThumbLength` | `24`       | The thumb never gets shorter, so it stays grabbable |
| `position`       | `"gutter"` | `"gutter"` reserves space; `"float"` overlays       |
| `verticalSide`   | `"right"`  | `"left"` or `"right"` edge for the vertical bar     |
| `horizontalSide` | `"bottom"` | `"top"` or `"bottom"` edge for the horizontal bar   |

`track` and `thumb` take only `backgroundColor`, `borderColor` (one color
or a per-side object), `borderRadius` and `border` (both four-sided
values), plus `hover` and `pressed` overlays of the same four fields;
`pressed`, active while the bar is dragged, wins over `hover`. Unset fields
keep the defaults: the thumb's radius stays half the thickness. An unknown
field or keyword is ignored with a `scrollbar` devtools warning.

The bar draws above the container and its siblings, but under anything
with a higher `globalZIndex`.

### Gutter and `scrollbarWidth`

`scrollbarWidth` (a number of logical pixels, default `0`) reserves a
gutter on each `"scroll"` axis: on the right for `overflowY`, at the bottom
for `overflowX`. The content lays out beside it. It draws nothing by
itself.

- A `scrollbar` with `position: "gutter"` reserves its `thickness` this way,
  so content never runs under the bar. An explicit `scrollbarWidth` wins
  over it, `0` included.
- `position: "float"` reserves nothing and draws the bar over the content.
- The gutter is always on the right or bottom edge. A bar moved to the
  left or top with `verticalSide` or `horizontalSide` covers the content's
  edge while the gutter stays empty on the other side, so use
  `position: "float"` there and pad the content yourself.

## Limits

- The wheel only reaches UI on the window: scroll containers inside a
  `<surface>` don't scroll with the wheel, and a UI camera with an offset
  viewport is not accounted for. Drive them with `scrollTop` and
  `scrollLeft`.
- No scroll chaining, overscroll, or scroll snapping.
- The scrollbar is placed assuming the container's parent has no border; a
  border on the parent offsets the bar by its width.

See [`overflowX`](../reference/style-properties.md#overflowX),
[`overflowY`](../reference/style-properties.md#overflowY),
[`scrollbarWidth`](../reference/style-properties.md#scrollbarWidth) and
[`scrollbar`](../reference/style-properties.md#scrollbar) in the style
reference.
