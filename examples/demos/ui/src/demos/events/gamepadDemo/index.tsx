// Gamepad demo: a game-like menu driven by any connected controller (LB/RB
// pages, d-pad/stick navigation with hold auto-repeat, A to select with
// rumble), and a live schematic visualizer for every detected pad below.
// Mouse works everywhere too (hover focuses, click selects) — mouse actions
// just skip the rumble (there is no acting pad).

import { useCallback, useEffect, useRef, useState } from "react";
import { bevy, type GamepadInputEvent } from "@/bevy";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { GameMenu } from "./GameMenu";
import { PadVisualizer } from "./PadVisualizer";
import { MENU_PAGES } from "./menuData";
import {
  INITIAL_NAV,
  actionForAxis,
  actionForButton,
  applyAction,
  axisDir,
  type NavAction,
  type NavState,
} from "./menuNav";
import { inputName, usePads } from "./usePads";

const TYPESCRIPT = `import { bevy } from "@/bevy";

bevy.on("gamepadInput", (batch) => {
  for (const b of batch.buttons) {
    // edge-detect: act on the
    // pressed transition, not on
    // every analog value tick
    if (b.pressed && !wasDown(b)) {
      navigate(b.button);
    }
  }
  for (const a of batch.axes) {
    // threshold-cross at +-0.5;
    // stick up is +1 in Bevy
    step(a.axis, dir(a.value));
  }
});

bevy.gamepad.rumble({
  gamepad: id,
  duration: 200, // ms
  strongMotor: 0.4,
  weakMotor: 0.6,
});`;

const PAGE: ExplanationData = {
  title: "Gamepad",
  description:
    "A game-like menu driven entirely by the batched gamepadInput event: LB/RB switch pages, the d-pad or either stick moves the focus (hold to auto-repeat), and A selects with a rumble on the acting pad. Sticks use Bevy's convention: up is +1 (the web Gamepad API is inverted). Below, every detected controller renders as a live canvas schematic - buttons light up, triggers fill, stick dots follow the axes. bevy.gamepad.getAll() seeds pads that connected before the demo mounted. The mouse drives the same menu actions, minus the rumble.",
  tsx: TYPESCRIPT,
};

const REPEAT_DELAY_MS = 350;
const REPEAT_MS = 120;
const PULSE_MS = 180;

export function GamepadDemo() {
  useDemoPage(PAGE);
  const [nav, setNav] = useState<NavState>(INITIAL_NAV);
  const [pulseKey, setPulseKey] = useState<string | null>(null);

  // Source of truth lives in refs: one input batch can carry several actions,
  // and repeat timers fire outside React renders.
  const navRef = useRef(nav);
  const prevPressed = useRef(new Map<string, boolean>());
  const prevAxisDir = useRef(new Map<string, -1 | 0 | 1>());
  const repeatTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Apply an action and run its side effects (rumble targets the acting
   * pad; mouse actions pass no pad and stay silent). */
  const applyAndCommit = useCallback((action: NavAction, gamepad?: number) => {
    const next = applyAction(navRef.current, action, MENU_PAGES);
    navRef.current = next;
    setNav(next);
    // Only item selection rumbles; page changes stay silent.
    if (action.kind === "activate" || action.kind === "activateAt") {
      if (pulseTimer.current != null) clearTimeout(pulseTimer.current);
      setPulseKey(`${next.page}:${next.col}:${next.row}`);
      pulseTimer.current = setTimeout(() => setPulseKey(null), PULSE_MS);
      if (gamepad != null) {
        bevy.gamepad.rumble({
          gamepad,
          duration: 180,
          strongMotor: 1,
          weakMotor: 0.5,
        });
      }
    }
  }, []);

  const stopRepeat = useCallback((key: string) => {
    const timer = repeatTimers.current.get(key);
    if (timer != null) {
      clearTimeout(timer);
      repeatTimers.current.delete(key);
    }
  }, []);

  /** Hold-to-repeat for direction steps: first step already happened; after
   * the initial delay, keep stepping until the source deactivates. */
  const startRepeat = useCallback(
    (key: string, action: NavAction, gamepad: number) => {
      stopRepeat(key);
      const tick = () => {
        applyAndCommit(action, gamepad);
        repeatTimers.current.set(key, setTimeout(tick, REPEAT_MS));
      };
      repeatTimers.current.set(key, setTimeout(tick, REPEAT_DELAY_MS));
    },
    [applyAndCommit, stopRepeat],
  );

  const handleBatch = useCallback(
    (batch: GamepadInputEvent) => {
      for (const b of batch.buttons) {
        const name = inputName(b.button);
        const key = `${b.gamepad}:${name}`;
        const was = prevPressed.current.get(key) ?? false;
        prevPressed.current.set(key, b.pressed);
        // Rising edge only: analog ticks (triggers) keep pressed=true and
        // must not re-fire the action.
        if (b.pressed && !was) {
          const action = actionForButton(name);
          if (action) {
            applyAndCommit(action, b.gamepad);
            if (action.kind === "col" || action.kind === "row") {
              startRepeat(key, action, b.gamepad);
            }
          }
        } else if (!b.pressed && was) {
          stopRepeat(key);
        }
      }
      for (const a of batch.axes) {
        const name = inputName(a.axis);
        const key = `${a.gamepad}:${name}`;
        const dir = axisDir(a.value);
        const prev = prevAxisDir.current.get(key) ?? 0;
        if (dir === prev) continue;
        prevAxisDir.current.set(key, dir);
        stopRepeat(key);
        if (dir !== 0) {
          const action = actionForAxis(name, dir);
          if (action) {
            applyAndCommit(action, a.gamepad);
            startRepeat(key, action, a.gamepad);
          }
        }
      }
    },
    [applyAndCommit, startRepeat, stopRepeat],
  );

  const pads = usePads(handleBatch);
  const hasPads = Object.keys(pads).length > 0;

  // A pad that disconnects stops sending events; kill its held repeats.
  useEffect(() => {
    for (const key of [...repeatTimers.current.keys()]) {
      if (!(Number(key.split(":")[0]) in pads)) stopRepeat(key);
    }
  }, [pads, stopRepeat]);

  useEffect(() => {
    const timers = repeatTimers.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      if (pulseTimer.current != null) clearTimeout(pulseTimer.current);
    };
  }, []);

  return (
    <node style={{ flexDirection: "column", gap: 20, alignItems: "center" }}>
      {!hasPads && (
        <text style={{ fontSize: FontSizes.sm, color: Colors.textColor200 }}>
          Connect a controller - or use the mouse
        </text>
      )}
      <GameMenu
        nav={nav}
        pulseKey={pulseKey}
        dispatch={(action) => applyAndCommit(action)}
      />
      <Example title="Detected controllers">
        <PadVisualizer pads={pads} />
      </Example>
    </node>
  );
}
