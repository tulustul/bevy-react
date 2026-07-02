// Reanimated-style animation API for bevy-react.
//
// Mirrors React Native Reanimated: declare a `SharedValue` (one animatable
// number with a stable id), assign it a *driver* (`withTiming`, `withSpring`,
// `withRepeat`, `withSequence`), and bind style properties to it on an
// `Animated.node`. The declaration crosses the bridge once; the Bevy side drives
// the value every frame — per-frame interpolation never round-trips to JS. The
// one thing that crosses back is completion: a driver with a callback settles
// exactly one `animationFinished` event (routed in `bridge.ts`).
//
// These shapes are hand-mirrored against `bevy_react_animations::protocol` on the
// Rust side (the same contract `bridge.ts` keeps with `protocol::Op`). Keep them
// in sync.

import { createElement, useRef } from "react";
import { animate, registerAnimationCallback } from "./bridge";
import type { BevyImageProps, BevyNodeProps, BevyTextProps } from "./jsx";

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

/** The continuous style properties an `Animated.node` can drive. Mirrors the Rust
 *  `AnimatableProperty` enum (`crates/animations/src/protocol.rs`) — keep the two
 *  in sync (hand-synced, like the rest of the animation wire surface). Transform
 *  channels (`translateX`…`rotate`) map to `UiTransform`; `opacity` drives color
 *  alpha; `backgroundColor` drives the background color. `rotate` is in **radians**
 *  (an imperative numeric channel — unlike the declarative static `transform.rotate`,
 *  which takes a CSS angle/degrees). */
export type AnimatableProperty =
  // Transform → `UiTransform` (post-layout, no relayout).
  | "translateX"
  | "translateY"
  | "scale"
  | "scaleX"
  | "scaleY"
  | "rotate"
  // Color / alpha.
  | "opacity"
  | "backgroundColor"
  | "borderColor"
  | "color"
  // Layout lengths (px) — drive `Node`, so these re-flow surrounding content.
  | "width"
  | "height"
  | "minWidth"
  | "minHeight"
  | "maxWidth"
  | "maxHeight"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "flexBasis"
  | "gap"
  | "rowGap"
  | "columnGap"
  // Layout scalars. (`flexGrow`/`flexShrink` are intentionally omitted: they're
  // relative weights, not magnitudes, so animating them has no intuitive meaning —
  // animate `flexBasis`/`width` instead.)
  | "aspectRatio";

/** The animation-driven half of an `Animated.node`'s style: each animatable
 *  property bound to a shared value or interpolation. */
export type AnimatedStyle = Partial<Record<AnimatableProperty, AnimatedValue>>;

// Per-runtime shared-value id allocator. A hot reload spins up a fresh isolate,
// so this resets to 1 naturally; `reset()` clears the Bevy-side table to match.
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

/** Animate to `to` over `duration` ms (default 300) with `easing` (default
 *  linear). `callback` fires once on settlement (see [`AnimationCallback`]). */
export function withTiming(
  to: number,
  config?: { duration?: number; easing?: EasingName },
  callback?: AnimationCallback,
): Driver {
  return {
    type: "timing",
    to,
    duration: (config?.duration ?? 300) / 1000,
    easing: config?.easing ?? "linear",
    callback,
  };
}

/** Settle on `to` with a damped spring. `callback` fires once on settlement
 *  (see [`AnimationCallback`]). */
export function withSpring(
  to: number,
  config?: { stiffness?: number; damping?: number; mass?: number },
  callback?: AnimationCallback,
): Driver {
  return {
    type: "spring",
    to,
    stiffness: config?.stiffness ?? 100,
    damping: config?.damping ?? 10,
    mass: config?.mass ?? 1,
    callback,
  };
}

/** Repeat `animation` `count` times (`-1` = forever, the default). `reverse`
 *  ping-pongs the endpoints (timing/spring) instead of restarting from the top.
 *  `callback` fires once on settlement (never for an infinite repeat, unless
 *  interrupted — see [`AnimationCallback`]). */
export function withRepeat(
  animation: Driver,
  count = -1,
  reverse = false,
  callback?: AnimationCallback,
): Driver {
  return { type: "repeat", animation, count, reverse, callback };
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

// Thin host wrappers, so apps write `<Animated.node animatedStyle={…}/>` the way
// Reanimated apps write `<Animated.View/>`. The animation lives in `animatedStyle`
// (the intrinsic elements accept it; see jsx.d.ts).
function host<P>(type: string) {
  return (props: P) => createElement(type as any, props as any);
}

export const Animated = {
  node: host<BevyNodeProps>("node"),
  button: host<BevyNodeProps>("button"),
  image: host<BevyImageProps>("image"),
  text: host<BevyTextProps>("text"),
};
