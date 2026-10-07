# Mouse

Elements take DOM-like pointer handlers: `onClick`, `onPointerDown`,
`onPointerMove`, `onPointerUp`, `onPointerEnter`, `onPointerLeave` and
`onWheel`. Bevy detects the input (through `bevy_ui`'s interaction state and
Bevy picking) and calls the React handler a moment later. The element
reference lists which elements accept which handlers.

## Usage

```tsx
<node
  onClick={() => select(item.id)}
  onPointerEnter={() => setHovered(true)}
  onPointerLeave={() => setHovered(false)}
  style={{ width: 160, height: 40 }}
/>
```

## Clicks

`onClick` takes no argument. It fires when the primary (left) button is
released over the same element the press landed on: press, drag off and
release elsewhere does not click. Right and middle clicks have no `onClick`;
use `onPointerDown`/`onPointerUp` and read `e.button`.

Clicks don't bubble. One gesture clicks one element: the topmost element
under the pointer that owns clicks.

- Elements that own clicks: any element with `onClick` or an `onPointer*`
  handler, every `<button>`, and every `<editableText>`.
- A press on a child that owns no clicks, such as the `<text>` label inside a
  button, goes to the nearest ancestor that does. A child with only
  `hoverStyle`/`pressStyle` doesn't take the click from its ancestor.
- A `<button>` inside a clickable card takes clicks on itself, even with no
  `onClick` of its own.

## Drags and pointer events

| Handler          | Fires                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| `onPointerDown`  | A left, middle or right button goes down over the element                               |
| `onPointerMove`  | While that button stays down, on each frame the pointer moved, even outside the element |
| `onPointerUp`    | When that button is released, wherever the pointer is                                   |
| `onPointerEnter` | Once when the pointer enters the element                                                |
| `onPointerLeave` | Once when the pointer leaves the element                                                |

- A press on an element with any `onPointer*` handler starts a drag on it,
  which lasts until the button that started it is released. One drag runs at
  a time: other buttons pressed during it are ignored. When several elements
  with pointer handlers overlap under the press, the topmost one gets the
  drag.
- There is no hover-move event: `onPointerMove` only fires during a drag. A
  held, unmoving pointer sends nothing.
- Enter and leave fire on the boundary only, not again when the element is
  pressed or released inside it.

The pointer handlers receive a `PointerEventData`:

| Field                | Meaning                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `x`, `y`             | Position within the element, `0..1` from its top-left corner; clamped to the element during a drag |
| `clientX`, `clientY` | Position in the window, in logical pixels from its top-left corner; not clamped                    |
| `button`             | `0` left, `1` middle, `2` right; on down, move and up only (absent on enter and leave)             |

Because `x`/`y` stop at the element's edges, drag things with the
`clientX`/`clientY` deltas:

```tsx
import { useRef, useState } from "react";
import type { PointerEventData } from "bevy-react";

function Draggable() {
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const last = useRef({ x: 0, y: 0 });
  const down = (e: PointerEventData) => {
    last.current = { x: e.clientX, y: e.clientY };
  };
  const move = (e: PointerEventData) => {
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setPos((p) => ({ left: p.left + dx, top: p.top + dy }));
  };
  return (
    <node
      onPointerDown={down}
      onPointerMove={move}
      style={{ positionType: "absolute", ...pos, width: 80, height: 80 }}
    />
  );
}
```

On the shapes of an [`<svg>`](../elements/svg.md), `x`/`y` are in the SVG's
user space instead. Inside a [`<surface>`](../elements/surface.md),
`clientX`/`clientY` are pixels of the surface's texture.

## Hover and press styles

For visual feedback, prefer `hoverStyle` and `pressStyle` to
`onPointerEnter`/`onPointerLeave` plus React state: Bevy applies them itself,
with no round trip through React (see
[state styles](../reference/elements.md#state-styles)). The `cursor` style
sets the mouse cursor while the element is hovered (see
[Cursors](../styling/cursors.md)).

## Pass-through and blocking

The [`focusPolicy`](../styling/focus-policy.md) style decides whether an
element stops the pointer from reaching what lies beneath it. It is
`"pass"` on every element except `<button>`, which defaults to `"block"`.

- With `"pass"`, hover and press reach every element under the pointer,
  ancestors included: moving onto a child doesn't make its parent leave, and
  both receive their enter events. An element without handlers layered over
  a button doesn't stop the button's clicks.
- With `"block"`, hover, press and clicks stop at the element; elements
  beneath it get `onPointerLeave` when the pointer moves onto it.
- Clicks go to one element either way (see [Clicks](#clicks)).

## Wheel

`onWheel` works on any element that accepts it, scroll container or not, and
receives the raw delta in a `WheelEventData`: `x`, `y`, `clientX` and
`clientY` as above, plus:

| Field       | Meaning                                                                    |
| ----------- | -------------------------------------------------------------------------- |
| `deltaX`    | Horizontal delta; positive when the content should move right              |
| `deltaY`    | Vertical delta; positive when the wheel turns up, away from the user       |
| `deltaMode` | `"line"` (mouse wheel notches) or `"pixel"` (trackpads, already in pixels) |

```tsx
<node
  onWheel={(e) => {
    const step = e.deltaMode === "line" ? 0.1 : 0.005;
    setZoom((z) => Math.min(3, Math.max(0.5, z + e.deltaY * step)));
  }}
/>
```

- The sign follows Bevy, not the DOM: a wheel turned up gives a positive
  `deltaY`, where a DOM `WheelEvent` gives a negative one.
- Nothing is scaled: `"line"` deltas count notches, so pick your own
  distance per line.
- At most one event per frame, carrying the frame's accumulated delta.
- The topmost element with `onWheel` whose box contains the pointer gets the
  event, regardless of `focusPolicy` and of elements without `onWheel` on top
  of it.
- That element claims the wheel: scroll containers beneath it, its ancestors
  included, don't scroll, like a DOM `preventDefault`.
- Scroll containers scroll by themselves; their `onScroll` reports the new
  offset (see [Overflow](../styling/overflow.md)).

## Keeping input away from the world

The UI doesn't stop Bevy systems from reading the mouse. A camera controller
that reads mouse input directly also reacts to a drag on a slider. The
`PointerCapture` resource reports what the UI owns this frame; gate world
input on it and order the system after `PointerCaptureSet`:

```rust
use bevy::prelude::*;
use bevy_react::{PointerCapture, PointerCaptureSet};

fn orbit_camera(capture: Res<PointerCapture>) {
    if capture.is_captured() {
        return;
    }
    // drive the camera from the mouse
}

app.add_systems(Update, orbit_camera.after(PointerCaptureSet));
```

| Field            | True when                                                               |
| ---------------- | ----------------------------------------------------------------------- |
| `dragging`       | A UI drag is in progress, even with the pointer outside the element     |
| `over_ui`        | The pointer hovers or presses an interactive element                    |
| `wheel_captured` | This frame's wheel scrolled a container or went to an `onWheel` element |

`is_captured()` is true when any of them is. Only interactive elements count
for `over_ui`: those with a pointer handler, `onClick`, `hoverStyle` or
`pressStyle`, and every `<button>` and `<editableText>`. Plain layout and text
let the pointer through to the world. A scroll container whose content fits
leaves the wheel to the world, so a wheel-zoom camera that checks only
`wheel_captured` keeps zooming over hoverable UI.

## Touch

A touch works like the left button: a tap clicks, and a touch drag sends
`onPointerDown`, `onPointerMove` and `onPointerUp` with `button` `0` and the
finger's position.

- Inside a scroll container, a drag that pans along a scrollable axis is
  taken over by scrolling: the element gets `onPointerLeave` instead of
  `onPointerUp`.
- A touch that moves more than 8 logical pixels while scrolling doesn't click.
- One drag runs at a time; other fingers are ignored meanwhile.

## Limits

- No modifier keys on pointer events. Track them with the
  [keyboard](keyboard.md) events.
- No hover-move events, double-click events, bubbling, capture phase or
  `stopPropagation`.
- Handlers run a frame or more after the input, on React's thread; for
  feedback that must be instant, use state styles.
- `onClick` is primary-button only.

See [Pointer events](../reference/elements.md#pointer-events) and
[Wheel](../reference/elements.md#wheel) in the element reference.
