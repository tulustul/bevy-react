# Gamepad

Gamepads reach React through built-ins that are typed in every generated
`bevy.ts`, with no Rust code or registration: three
[events](../communication/bevy-to-react.md) (`gamepadConnected`,
`gamepadDisconnected`, `gamepadInput`), the `bevy.gamepad.getAll()`
[request](../communication/request-response.md), and the
`bevy.gamepad.rumble()` and `bevy.gamepad.stopRumble()`
[messages](../communication/react-to-bevy.md).

## Usage

```tsx
import { useEffect } from "react";
import { bevy } from "./bevy"; // generated

function Menu({ onConfirm }: { onConfirm: () => void }) {
  useEffect(
    () =>
      bevy.on("gamepadInput", (batch) => {
        for (const b of batch.buttons) {
          if (b.button === "south" && b.pressed) onConfirm();
        }
      }),
    [onConfirm],
  );
  return <node>{/* … */}</node>;
}
```

Pads are detected through Bevy's gamepad backend, the `bevy_gilrs` cargo
feature, which is part of Bevy's default features. Without it no pad ever
connects.

## Connected pads

`gamepadConnected` carries a `GamepadConnectedData`:

| Field       | Type             | Meaning                                       |
| ----------- | ---------------- | --------------------------------------------- |
| `gamepad`   | `number`         | The pad's id, used by every other gamepad API |
| `name`      | `string`         | The device name the OS reports                |
| `vendorId`  | `number \| null` | USB vendor id, when known                     |
| `productId` | `number \| null` | USB product id, when known                    |

`gamepadDisconnected` carries `{ gamepad }`, the id the pad was announced
under.

- Ids count up and are never reused: a pad that reconnects gets a new id, so
  a stale id never refers to another device.
- Pads connected before the app started are announced once React's first
  render has been applied, before any of their input.
- `bevy.gamepad.getAll()` resolves with every connected pad
  (`GamepadConnectedData[]`, `[]` when none). Components that mount after a
  pad connected have missed its event; seed from the request, then follow the
  events:

```tsx
import { useEffect, useState } from "react";
import { bevy, type GamepadConnectedData } from "./bevy";

function usePads() {
  const [pads, setPads] = useState<GamepadConnectedData[]>([]);
  useEffect(() => {
    void bevy.gamepad.getAll().then(setPads);
    const offConnect = bevy.on("gamepadConnected", (p) =>
      setPads((ps) => [...ps, p]),
    );
    const offDisconnect = bevy.on("gamepadDisconnected", (p) =>
      setPads((ps) => ps.filter((x) => x.gamepad !== p.gamepad)),
    );
    return () => {
      offConnect();
      offDisconnect();
    };
  }, []);
  return pads;
}
```

## Input

`gamepadInput` fires at most once per frame, and only in frames where some
input changed. Its `buttons` and `axes` arrays list every change of the
frame across all pads, in order:

- A button change is `{ gamepad, button, pressed, value }`: `value` is
  `0..1` (analog triggers use the whole range), `pressed` is the digital state
  after the change.
- An axis change is `{ gamepad, axis, value }`, with `value` in `-1..1`.
  Sticks follow Bevy's convention, **up is `+1`**, the inverse of the web
  Gamepad API.
- Changes are filtered by Bevy's `GamepadSettings` (dead zones and press
  thresholds) before they are reported. An idle pad sends nothing.
- Every analog change is a separate entry, and `pressed` stays `true` across
  all the changes of a held trigger. To act once per press, compare against
  the previous state yourself.
- Input arriving before React's first render has been applied is dropped.

Button and axis names are Bevy's, camelCased:

| Kind    | Names                                                                                                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buttons | `south`, `east`, `north`, `west`, `c`, `z`, `leftTrigger`, `leftTrigger2`, `rightTrigger`, `rightTrigger2`, `select`, `start`, `mode`, `leftThumb`, `rightThumb`, `dPadUp`, `dPadDown`, `dPadLeft`, `dPadRight` |
| Axes    | `leftStickX`, `leftStickY`, `leftZ`, `rightStickX`, `rightStickY`, `rightZ`                                                                                                                                     |

`south` is the bottom face button (A on Xbox pads, Cross on PlayStation),
`leftTrigger` the left bumper and `leftTrigger2` the analog left trigger;
`leftThumb` is a stick click. Non-standard buttons and axes arrive as
`{ other: n }`.

## Rumble

```tsx
bevy.gamepad.rumble({
  gamepad: pad.gamepad,
  duration: 200, // milliseconds
  strongMotor: 0.4,
  weakMotor: 0.6,
});

bevy.gamepad.stopRumble({ gamepad: pad.gamepad });
```

- `duration` is in milliseconds; negative values count as `0`.
- `strongMotor` (low frequency) and `weakMotor` (high frequency) are
  intensities, clamped to `0..1`. All four fields are required.
- Overlapping rumbles add up rather than replace each other. Call
  `stopRumble` first to replace a running effect.
- `stopRumble` stops every rumble on the pad.
- An unknown id is ignored with a warning in the Bevy log. Rumble support
  varies by platform and pad.

## Limits

- No built-in focus navigation: moving through menus with a pad is up to
  your React code.
- Pad ids change on every reconnect.
- Rumble is best-effort and fire-and-forget: React gets no confirmation.

The built-in types are listed in the generated
[`bevy.ts`](../../reference/bevy.ts) reference.
