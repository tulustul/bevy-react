// Shared pad-state hook: mirrors connected pads and their live button/axis
// values from the three built-in gamepad events, seeded with
// bevy.gamepad.getAll() for pads that connected before this component
// mounted. An optional onBatch tap hands the raw per-frame gamepadInput
// payload to the caller (the menu's edge-detection) after the state merge.

import { useEffect, useRef, useState } from "react";
import {
  bevy,
  type GamepadAxisName,
  type GamepadButtonName,
  type GamepadConnectedData,
  type GamepadInputEvent,
} from "@/bevy";

export type PadState = {
  info: GamepadConnectedData;
  buttons: Record<string, { pressed: boolean; value: number }>;
  axes: Record<string, number>;
};

/** Collapse the wire name union: standard names are plain strings, the
 * non-standard arm crosses as { other: n }. */
export function inputName(name: GamepadButtonName | GamepadAxisName): string {
  return typeof name === "string" ? name : `other(${name.other})`;
}

export function usePads(
  onBatch?: (batch: GamepadInputEvent) => void,
): Record<number, PadState> {
  const [pads, setPads] = useState<Record<number, PadState>>({});
  // Read through a ref so the one-time subscription never sees a stale tap.
  const onBatchRef = useRef(onBatch);
  onBatchRef.current = onBatch;

  useEffect(() => {
    const offConnect = bevy.on("gamepadConnected", (pad) => {
      setPads((prev) => ({
        ...prev,
        [pad.gamepad]: { info: pad, buttons: {}, axes: {} },
      }));
    });
    const offDisconnect = bevy.on("gamepadDisconnected", ({ gamepad }) => {
      setPads((prev) => {
        const next = { ...prev };
        delete next[gamepad];
        return next;
      });
    });
    const offInput = bevy.on("gamepadInput", (batch) => {
      setPads((prev) => {
        const next = { ...prev };
        for (const b of batch.buttons) {
          const pad = next[b.gamepad];
          if (!pad) continue;
          next[b.gamepad] = {
            ...pad,
            buttons: {
              ...pad.buttons,
              [inputName(b.button)]: { pressed: b.pressed, value: b.value },
            },
          };
        }
        for (const a of batch.axes) {
          const pad = next[a.gamepad];
          if (!pad) continue;
          next[a.gamepad] = {
            ...pad,
            axes: { ...pad.axes, [inputName(a.axis)]: a.value },
          };
        }
        return next;
      });
      onBatchRef.current?.(batch);
    });
    // Pads connected before this component mounted already had their
    // gamepadConnected event; pull them once, keyed merge so a connect event
    // racing the reply never doubles up.
    void bevy.gamepad.getAll().then((connected) => {
      setPads((prev) => {
        const next = { ...prev };
        for (const pad of connected) {
          next[pad.gamepad] ??= { info: pad, buttons: {}, axes: {} };
        }
        return next;
      });
    });
    return () => {
      offConnect();
      offDisconnect();
      offInput();
    };
  }, []);

  return pads;
}
