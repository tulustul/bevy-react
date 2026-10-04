---
description: The <canvas> element is a retained drawing surface with an HTML-canvas-like path API, painted declaratively with draw or imperatively through a ref.
demo: <canvas>
covers: [element.canvas]
---

# `<canvas>`

`<canvas>` is a pixel surface you draw on with a subset of the HTML
`CanvasRenderingContext2D` path API. It is a styled node like `<node>`
(layout, background, border, pointer handlers) whose texture the element
owns. Drawing calls are recorded in JS and rasterized on the Bevy side, on the
CPU and anti-aliased, at the node's laid-out size times the display's scale
factor. Like an HTML canvas, the surface is retained: paint accumulates until
something clears it.

## Usage

```tsx
<canvas
  style={{ width: 300, height: 150 }}
  draw={(ctx) => {
    ctx.strokeStyle = "#7aa2f7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.bezierCurveTo(100, 0, 200, 150, 300, 20);
    ctx.stroke();
  }}
/>
```

Coordinates are logical pixels from the node's top-left corner, the same
units as `style`. The canvas has no intrinsic size: give it a width and a
height, or let flex layout size it.

`<canvas>` comes from the `canvas` cargo feature, which is on by default and
adds `CanvasPlugin` to `ReactPlugins`. Without it, a `<canvas>` mounts as a
plain node and reports a `featureMissing` warning (see
[Cargo features](../getting-started.md#cargo-features)).

There are two ways to draw, and one canvas can use both:

- **Declarative**: a `draw` painter that describes the whole picture. The
  canvas is cleared and the painter replayed whenever `draw` changes.
- **Imperative**: a `ref` handle whose context draws at any time, outside
  React rendering. Each batch paints on top of what is already there.

## Declarative drawing

`draw` takes a painter function, called with a fresh `CanvasContext` that
records every call into a display list. The list crosses to Bevy, which clears
the surface, resets the drawing state and replays it.

- The painter runs whenever the `draw` prop changes. A function compares by
  identity, so an inline arrow re-records on every render of the component.
  Wrap the painter in `useCallback`, with the data it reads as
  dependencies, to skip repaints when nothing changed.
- `draw` also accepts a prebuilt `DrawCmd[]` list (the `DrawCmd` type is
  exported from `bevy-react`). A list compares by value.
- After a resize, the runtime replays the latest painter for you.
- The painter does not receive the canvas size. Draw at a size you set in
  `style`, or keep the size from `onResize` in state.
- `draw={[]}` clears the canvas. Removing the `draw` prop keeps the last
  picture but stops the replays on resize.

## Imperative drawing

A `ref` on a `<canvas>` resolves to a `BevyCanvasElement` handle.
`getContext()` returns its long-lived context, with the same drawing API:

```tsx
import { useRef } from "react";
import type { BevyCanvasElement } from "bevy-react";

function Sketchpad() {
  const ref = useRef<BevyCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  // Pointer x/y are normalized 0..1 within the element.
  const at = (e: { x: number; y: number }) => ({
    x: e.x * ref.current!.width,
    y: e.y * ref.current!.height,
  });

  return (
    <canvas
      ref={ref}
      style={{ width: 400, height: 300 }}
      onResize={({ width, height }) => {
        const ctx = ref.current!.getContext();
        ctx.fillStyle = "#1a1b26";
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.fill();
      }}
      onPointerDown={(e) => (last.current = at(e))}
      onPointerMove={(e) => {
        const from = last.current;
        if (!from) return;
        const to = at(e);
        const ctx = ref.current!.getContext();
        ctx.strokeStyle = "#7aa2f7";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        last.current = to;
      }}
      onPointerUp={() => (last.current = null)}
    />
  );
}
```

- Calls made in one synchronous burst are batched and sent to Bevy as one
  update on a microtask. No React render is involved, so drawing at pointer
  rate costs no re-renders.
- `width` and `height` are the laid-out size in logical pixels, `0` before
  the first layout.
- The handle survives re-renders and Fast Refresh. Drawing through a handle
  whose canvas has unmounted does nothing.
- Draw content that must survive a resize from `onResize`, which also fires
  on the first layout.

## Retained pixels and resizing

Paint accumulates on the canvas until one of these clears it:

- `clear()` or `clearRect(x, y, w, h)`;
- a change of the `draw` prop (clear, then replay);
- a resize.

The drawing state (`fillStyle`, `strokeStyle`, `lineWidth` and the current
path) also persists between batches, as on the web. A `draw` replay or a
resize resets it to the defaults.

A resize is any change of the canvas's laid-out size in physical pixels,
including its first layout and a display scale-factor change at the same
logical size. It clears the surface (HTML canvas `width`/`height` semantics),
then replays the declarative painter if there is one, then calls `onResize`
with the new `{ width, height }` in logical pixels.

Imperative drawing is erased by the next resize and, on a canvas that also
has a `draw` painter, by the next `draw` change.

## Drawing API

| Member                                    | Effect                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `fillStyle`, `strokeStyle`                | Fill and stroke color, any CSS color string                                             |
| `lineWidth`                               | Stroke width in logical pixels; 0, negative or non-finite values are ignored            |
| `beginPath()`                             | Start a new, empty path                                                                 |
| `moveTo(x, y)`                            | Start a subpath at a point                                                              |
| `lineTo(x, y)`                            | Add a line; without a current point it starts the subpath there                         |
| `quadraticCurveTo(cx, cy, x, y)`          | Add a quadratic Bézier; ignored without a current point                                 |
| `bezierCurveTo(c1x, c1y, c2x, c2y, x, y)` | Add a cubic Bézier; ignored without a current point                                     |
| `arc(x, y, r, start, end)`                | Add a circular arc, angles in radians, drawn clockwise; joins the current point by line |
| `rect(x, y, w, h)`                        | Add a rectangle subpath                                                                 |
| `closePath()`                             | Close the current subpath                                                               |
| `fill()`                                  | Fill the current path (nonzero winding rule)                                            |
| `stroke()`                                | Stroke the current path (butt caps, miter joins)                                        |
| `clearRect(x, y, w, h)`                   | Erase a rectangle to transparent; path and styles are kept                              |
| `clear()`                                 | Erase the whole surface (not in the web API); path and styles are kept                  |

- Colors take the same strings as styles: hex, named colors, `rgb()`,
  `hsl()` and the other functional forms, alpha included. A color that
  doesn't parse paints opaque black, without a warning.
- The starting fill color is white and the starting stroke color black, with
  a 1px line. On the web the fill starts black, so set `fillStyle` before the
  first `fill()`.
- Every method returns the context, so calls chain.

## Styles and events

- `<canvas>` takes everything `<node>` does: `style`, `hoverStyle`,
  `pressStyle`, `focusStyle`, pointer handlers, `onWheel` and the scroll
  props.
- Pointer events report `x`/`y` normalized to `0..1`. Multiply by the
  handle's `width`/`height` to get canvas coordinates, as above.
- `backgroundColor` shows through transparent pixels. `backgroundImage` is
  ignored (the element owns its image) with a `styleIgnored` warning.

## Limits

- Only the path API above. There are no transforms (`translate`, `rotate`,
  `setTransform`), no text, images, gradients or patterns, no line caps,
  joins or dashes, no `globalAlpha`, no `save`/`restore`, no `ellipse`,
  `arcTo`, `fillRect` or `strokeRect`, no counter-clockwise arcs, and no
  `isPointInPath`.
- Rasterization runs on the CPU, and every painted batch re-uploads the whole
  texture. A large canvas redrawn every frame costs CPU time and upload
  bandwidth.
- The backing texture is capped at 4096 pixels per side.
- `imageRendering` modes other than `"auto"` are not available on a canvas
  and report an `imageRendering` warning.

See [`<canvas>`](../reference/elements.md#canvas) in the element reference.
