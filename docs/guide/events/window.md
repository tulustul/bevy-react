---
description: Read the UI viewport's logical size in React with the built-in resize event and the bevy.window.size() request, for responsive layouts.
demo: Window
---

# Window

The UI viewport's size reaches React through two built-ins: the `resize`
[event](../communication/bevy-to-react.md) and the `bevy.window.size()`
[request](../communication/request-response.md), the bevy-react counterparts
of the browser's `resize` event and `window.innerWidth`/`innerHeight`. Both
are typed in every generated `bevy.ts`, with no Rust code or registration.

## Usage

Seed the value with the request on mount, then follow the event:

```tsx
import { useEffect, useState } from "react";
import { bevy, type WindowSize } from "./bevy"; // generated

function useWindowSize(): WindowSize | null {
  const [size, setSize] = useState<WindowSize | null>(null);
  useEffect(() => {
    bevy.window.size().then(setSize, () => {});
    return bevy.on("resize", setSize);
  }, []);
  return size;
}
```

## What is measured

Both report a `WindowSize`, `{ width, height }`, in logical pixels: the same
unit as plain numbers in styles.

- The size is the viewport of the default UI camera, the camera `bevy_ui`
  lays the UI out against (the one marked `IsDefaultUiCamera`). It stays
  correct when that camera renders to a viewport or an offscreen texture.
- Without a camera marked `IsDefaultUiCamera`, the size of the app's window
  is used. With several windows and no such camera, there is no size.
- Logical pixels depend on the display's scale factor, so moving the window
  to a display with another scale factor changes the size too.

## The resize event

- The first `resize` is sent once React's first render has been applied to
  the world, so listeners subscribed in the effects of your initial tree
  receive the starting size.
- After that, one `resize` is sent per frame in which the size changed, and
  never for an unchanged size. A window being dragged larger sends one per
  frame.
- A component that mounts later has missed the earlier events: call the
  request on mount, as in the usage example. The answer and the events
  travel in one ordered channel, so the newest value always lands last.

## The size request

`bevy.window.size()` resolves with the current size at any time. It rejects
with `no UI viewport available` when there is no viewport to measure, such as
before a window exists or in a headless app, so always pass a rejection
handler.

## Responsive layout

Sizes that only depend on the viewport need no events: the `vw`, `vh`,
`vmin` and `vmax` units re-resolve on every resize without a React render
(see [Units](../styling/units.md)). Read the size when the tree itself has to
change, such as a compact layout under a breakpoint:

```tsx
function Shell() {
  const size = useWindowSize();
  if (!size) return null; // nothing until the size is known
  return size.width < 720 ? <CompactShell /> : <WideShell />;
}
```

Rendering nothing until the first size arrives avoids a first frame in the
wrong layout. Each `resize` re-renders every subscribed component, so keep
the subscription near the top and pass the derived value down, or share it
through a React context.

## Limits

- Only the size is reported: no window position, focus, or scale factor.
- In a multi-window app, mark the UI camera with `IsDefaultUiCamera`, or no
  size is reported.
- A [`<canvas>`](../elements/canvas.md)'s own `onResize` reports that
  element's size, not the viewport's.

The built-in types are listed in the generated
[`bevy.ts`](../../reference/bevy.ts) reference.
