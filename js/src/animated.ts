// Reanimated-style animation API for bevy-react.
//
// Mirrors React Native Reanimated's value model: declare a `SharedValue` (one
// animatable number with a stable id) and assign it a *driver* (`withTiming`,
// `withSpring`, `withRepeat`, `withSequence`). The declaration crosses the
// bridge once; the Bevy side drives the value every frame — per-frame
// interpolation never round-trips to JS. The one thing that crosses back is
// completion: a driver with a callback settles exactly one `animationFinished`
// event (routed in `bridge.ts`).
//
// Unlike Reanimated there is no `Animated.View`/`animatedStyle`: a binding is
// written **inline in `style`** behind the explicit `{ animated: … }` wrapper
// (`opacity: { animated: sv }`, `filter: { name, params: { radius:
// { animated: sv } } }`) on plain intrinsic elements — see [`Animatable`].
// The style crosses the wire untouched; the Rust side decodes the wrapper and
// derives the node's bindings from the merged style.
//
// These shapes are hand-mirrored against `bevy_react::animations::protocol` on the
// Rust side (the same contract `bridge.ts` keeps with `protocol::Op`). Keep them
// in sync.

import { useRef } from "react";
import { animate, registerAnimationCallback } from "./bridge";

/** Easing curve names understood by `withTiming` (mirrors Rust `Easing`). */
export type EasingName = "linear" | "easeIn" | "easeOut" | "easeInOut";

/** Easing curves for `withTiming`, e.g. `Easing.easeInOut`. */
export const Easing = {
  linear: "linear",
  easeIn: "easeIn",
  easeOut: "easeOut",
  easeInOut: "easeInOut",
} as const satisfies Record<string, EasingName>;

/** A completion callback (Reanimated-style): fires once when the driver
 *  assigned to a shared value settles — `finished` is `true` on natural
 *  completion, `false` when it was interrupted (a `set`, `cancelAnimation`, or
 *  a newly assigned driver). Only the **top-level** driver's callback fires;
 *  one nested inside `withRepeat`/`withSequence`/`withDelay` is ignored. */
export type AnimationCallback = (finished: boolean) => void;

/** A driver: how a shared value evolves over time. Built by the `with*`
 *  helpers and assigned to `sharedValue.value`. Drivers compose. `callback` is
 *  JS-only (stripped before the wire); see [`AnimationCallback`]. */
export type Driver =
  | {
      type: "timing";
      to: number;
      duration: number;
      easing: EasingName;
      callback?: AnimationCallback;
    }
  | {
      type: "spring";
      to: number;
      stiffness: number;
      damping: number;
      mass: number;
      callback?: AnimationCallback;
    }
  | {
      type: "repeat";
      animation: Driver;
      count: number;
      reverse: boolean;
      callback?: AnimationCallback;
    }
  | { type: "sequence"; steps: Driver[]; callback?: AnimationCallback }
  | {
      type: "delay";
      delay: number;
      animation: Driver;
      callback?: AnimationCallback;
    };

/** A binding from a style property to a shared value, evaluated each frame on the
 *  Bevy side. Produced by passing a `SharedValue` directly, or via
 *  `interpolate` / `interpolateColor`. */
export type Binding =
  | { type: "shared"; id: number }
  | { type: "interpolate"; id: number; input: number[]; output: number[] }
  | {
      type: "interpolateColor";
      id: number;
      input: number[];
      output: [number, number, number, number][];
    };

/** A handle to a Bevy-resident animatable value (Reanimated's `useSharedValue`).
 *  Setting `.value` to a number sets it immediately; setting it to a driver
 *  starts an animation from the value's live reading. The getter returns the last
 *  JS-set number (per-frame values live in Bevy, not JS). */
export interface SharedValue {
  readonly id: number;
  value: number | Driver;
}

/** A value an animated style property can bind to: a shared value (used
 *  directly) or an interpolation binding. */
export type AnimatedValue = SharedValue | Binding;

/** A style position that can hold either a static value or an inline
 *  animation binding: `T`, or the explicit `{ animated: … }` wrapper around a
 *  shared value / `interpolate` / `interpolateColor` result. The wrapper is
 *  decoded Rust-side (the style crosses the wire untouched) and the binding
 *  drives the property every frame — the field then has **no static value**.
 *
 *  Which positions accept it is visible in [`BevyStyle`]'s field types:
 *  opacity, colors, layout lengths (bound lengths animate in **px**),
 *  `transform` channels (bound `rotate` is **degrees**, like the static
 *  field), every `transform3d` field, and filter/backdropFilter params
 *  (validated Rust-side against the resolved chain — `filterBinding`
 *  warnings; an unmatched binding is inert).
 *
 *  `seed` (filter/backdrop params only): the static value the chain resolver
 *  uses in the wrapper's place. Resolve-time derivations read only static
 *  params — most visibly a blur's capture outset — so size it for the
 *  animation's range: `radius: { animated: sv, seed: 10 }`.
 *
 *  Bindings are honored in the base `style` only; a wrapper inside
 *  `hoverStyle`/`pressStyle`/`focusStyle` is ignored with a warning. */
export type Animatable<T> = T | { animated: AnimatedValue; seed?: T };

// Per-runtime shared-value id allocator. The isolate persists across hot
// reloads (only the app bundle re-executes; this module lives in the vendor
// bundle), so the counter never resets and just keeps growing — fine, since
// ids only need to be unique. `reset()` sends `AnimationCommand::Clear` to
// wipe the Bevy-side table before the re-render re-declares each value under
// a fresh id.
let nextSharedId = 1;

/**
 * Declare a shared value with an `initial` reading. Stable across re-renders
 * (the id is allocated once per component instance).
 */
// TODO(review): this performs a bridge side-effect (`animate({kind:"declare"})`) DURING
// render. It's safe today only because StrictMode is off and the root is driven synchronously;
// under StrictMode or a discarded/double-invoked render it would allocate (and leak) a shared
// id in the Bevy table until the next `clear`. Move the declare into an effect.
export function useSharedValue(initial: number): SharedValue {
  const ref = useRef<SharedValue | null>(null);
  if (ref.current === null) {
    const id = nextSharedId++;
    animate({ kind: "declare", id, initial });
    ref.current = makeSharedValue(id, initial);
  }
  return ref.current;
}

function makeSharedValue(id: number, initial: number): SharedValue {
  let last = initial;
  return {
    id,
    get value(): number | Driver {
      return last;
    },
    set value(v: number | Driver) {
      if (typeof v === "number") {
        last = v;
        animate({ kind: "set", id, value: v });
      } else {
        const { callback } = v as { callback?: AnimationCallback };
        const driver = toWireDriver(v, false);
        if (callback) {
          const token = registerAnimationCallback(callback);
          animate({ kind: "animate", id, driver, token });
        } else {
          animate({ kind: "animate", id, driver });
        }
      }
    },
  };
}

/** Copy a driver tree without its JS-only `callback` fields (the wire shape
 *  must stay JSON-pure for `serde_v8`). Only the top-level callback is honored
 *  (extracted by the caller before this walk); a nested one is dropped with a
 *  warning — this engine reports the settlement of the *assigned* driver, not
 *  of every stage inside it. */
function toWireDriver(driver: Driver, nested: boolean): Driver {
  const { callback, ...rest } = driver as Driver & {
    callback?: AnimationCallback;
  };
  if (callback && nested) {
    console.warn(
      "[bevy-react] animation callbacks only fire on the top-level driver; nested callback ignored",
    );
  }
  const d = rest as Driver;
  switch (d.type) {
    case "repeat":
    case "delay":
      return { ...d, animation: toWireDriver(d.animation, true) };
    case "sequence":
      return { ...d, steps: d.steps.map((s) => toWireDriver(s, true)) };
    default:
      return d;
  }
}

/** Config for [`withTiming`]. */
export type TimingConfig = {
  /** Duration in ms (default `300`). */
  duration?: number;
  /** Easing curve (default `"linear"`). */
  easing?: EasingName;
  /** Fires once on settlement (see [`AnimationCallback`]). */
  onComplete?: AnimationCallback;
};

/** Animate to `to` over `duration` ms with `easing`. */
export function withTiming(to: number, config?: TimingConfig): Driver {
  return {
    type: "timing",
    to,
    duration: (config?.duration ?? 300) / 1000,
    easing: config?.easing ?? "linear",
    callback: config?.onComplete,
  };
}

/** Config for [`withSpring`]. */
export type SpringConfig = {
  /** Spring stiffness (default `100`). */
  stiffness?: number;
  /** Spring damping (default `10`). */
  damping?: number;
  /** Spring mass (default `1`). */
  mass?: number;
  /** Fires once on settlement (see [`AnimationCallback`]). */
  onComplete?: AnimationCallback;
};

/** Settle on `to` with a damped spring. */
export function withSpring(to: number, config?: SpringConfig): Driver {
  return {
    type: "spring",
    to,
    stiffness: config?.stiffness ?? 100,
    damping: config?.damping ?? 10,
    mass: config?.mass ?? 1,
    callback: config?.onComplete,
  };
}

/** Config for [`withRepeat`]. */
export type RepeatConfig = {
  /** How many times to play `animation`; omitted = repeat forever. */
  count?: number;
  /** Ping-pong the endpoints (timing/spring) instead of restarting
   *  from the top (default `false`). */
  reverse?: boolean;
  /** Fires once on settlement — never for an infinite repeat, unless
   *  interrupted (see [`AnimationCallback`]). */
  onComplete?: AnimationCallback;
};

/** Repeat `animation` — forever by default, or `count` times. */
export function withRepeat(animation: Driver, config?: RepeatConfig): Driver {
  return {
    type: "repeat",
    animation,
    count: config?.count ?? -1,
    reverse: config?.reverse ?? false,
    callback: config?.onComplete,
  };
}

/** Run each driver in order, each starting where the previous ended. A trailing
 *  function argument is a completion callback for the whole sequence (see
 *  [`AnimationCallback`]). */
export function withSequence(
  ...args: [...Driver[], AnimationCallback | Driver] | Driver[]
): Driver {
  const steps = [...args] as Driver[];
  let callback: AnimationCallback | undefined;
  if (typeof steps[steps.length - 1] === "function") {
    callback = steps.pop() as unknown as AnimationCallback;
  }
  return { type: "sequence", steps, callback };
}

/** Hold in place for `delayMs`, then run `animation`. The canonical way to
 *  stagger animations or pause between steps. `callback` fires once the whole
 *  (delay + animation) settles (see [`AnimationCallback`]). */
export function withDelay(
  delayMs: number,
  animation: Driver,
  callback?: AnimationCallback,
): Driver {
  return { type: "delay", delay: delayMs / 1000, animation, callback };
}

/** Map a shared value through a piecewise-linear curve (clamped at the ends). */
export function interpolate(
  value: SharedValue,
  input: number[],
  output: number[],
): Binding {
  return { type: "interpolate", id: value.id, input, output };
}

/** Map a shared value to a color, interpolating between hex stops. */
export function interpolateColor(
  value: SharedValue,
  input: number[],
  output: string[],
): Binding {
  return {
    type: "interpolateColor",
    id: value.id,
    input,
    output: output.map(hexToRgba),
  };
}

/** Stop a shared value's active animation, freezing it in place. If the driver
 *  carried a completion callback, it fires with `finished: false`. */
export function cancelAnimation(value: SharedValue): void {
  animate({ kind: "cancel", id: value.id });
}

function hexToRgba(hex: string): [number, number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return [r, g, b, a];
}
