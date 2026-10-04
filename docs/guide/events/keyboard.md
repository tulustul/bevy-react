---
description: Listen to window-wide key presses in React with the built-in keyDown and keyUp events and their KeyboardEventData payload.
demo: Keyboard
---

# Keyboard

Key presses reach React as two built-in [events](../communication/bevy-to-react.md),
`keyDown` and `keyUp`. They are window-wide: they fire for every key the app
window receives, whichever element has focus, and they are typed in every
generated `bevy.ts` without any Rust code or registration. There are no
per-element key handlers.

## Usage

```tsx
import { useEffect } from "react";
import { bevy } from "./bevy"; // generated

function Menu({ onClose }: { onClose: () => void }) {
  useEffect(
    () =>
      bevy.on("keyDown", (e) => {
        if (e.key === "Escape") onClose();
      }),
    [onClose],
  );
  return <node>{/* … */}</node>;
}
```

## The events

- `keyDown` fires when a key is pressed, and again for each OS auto-repeat
  while it is held (with `repeat: true`).
- `keyUp` fires when the key is released.

Both carry a `KeyboardEventData` (importable from your `./bevy` module):

| Field      | Type             | Meaning                                                                      |
| ---------- | ---------------- | ---------------------------------------------------------------------------- |
| `key`      | `string`         | The logical key: the typed character (`"a"`, `"A"`, `"1"`) or a key name     |
| `code`     | `string`         | The physical key, independent of the keyboard layout (`"KeyA"`, `"Digit1"`)  |
| `text`     | `string \| null` | The text the key produces, if any; `null` for arrows, modifiers and the like |
| `repeat`   | `boolean`        | Whether this `keyDown` is an OS auto-repeat                                  |
| `ctrlKey`  | `boolean`        | A Control key is held                                                        |
| `shiftKey` | `boolean`        | A Shift key is held                                                          |
| `altKey`   | `boolean`        | An Alt key is held                                                           |
| `metaKey`  | `boolean`        | A Super key (Windows, Command) is held                                       |

- Key names are Bevy's, which mostly match the web's: `"Enter"`,
  `"Escape"`, `"Tab"`, `"Backspace"`, `"ArrowLeft"`, `"Shift"`. The space bar
  is `"Space"` (the web uses `" "`); its `text` is `" "`.
- `code` values are Bevy's `KeyCode` names, which follow the web's `code`
  values for most keys (`"Enter"`, `"Space"`, `"ArrowLeft"`, `"ShiftLeft"`).
  The Windows/Command keys are `"SuperLeft"` and `"SuperRight"`.
- Match shortcuts on `key` when the character matters (`"?"`, `"+"`) and on
  `code` when the position does (WASD on any layout).
- The modifier flags show the state at the end of the frame the key event
  arrived in: either side counts, and a modifier's own `keyDown` already has
  its flag set.

Filter auto-repeat out when a key should act once per press:

```tsx
bevy.on("keyDown", (e) => {
  if (e.repeat) return;
  if (e.code === "KeyS" && e.ctrlKey) save();
});
```

## Text input and focus

Because the events are window-wide, they also fire while the user types in an
[`<editableText>`](../elements/editable-text.md). Keep single-key shortcuts
from firing during text entry by tracking the input's focus:

```tsx
const typing = useRef(false);

useEffect(
  () =>
    bevy.on("keyDown", (e) => {
      if (typing.current) return;
      if (e.key === "m") toggleMap();
    }),
  [],
);

<editableText
  onFocus={() => (typing.current = true)}
  onBlur={() => (typing.current = false)}
/>;
```

The same holds on the Bevy side: systems that read `ButtonInput<KeyCode>`
see every keystroke, including the ones typed into an `<editableText>`, and
React can't stop them. If gameplay keys must pause while the player types,
tell Bevy with a [message](../communication/react-to-bevy.md) from `onFocus`
and `onBlur`.

## Limits

- No per-element `onKeyDown` and no `preventDefault`: a listener can't keep a
  key from an `<editableText>` or from Bevy systems.
- Each key event is one trip across the bridge. That suits shortcuts and
  menus; continuous input such as character movement belongs in a Bevy system
  reading `ButtonInput<KeyCode>`.
- Events are not buffered: a key pressed before a listener subscribes is
  missed.

The built-in event types are listed in the generated
[`bevy.ts`](../../reference/bevy.ts) reference.
