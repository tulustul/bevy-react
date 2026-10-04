import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { ReactNode, useState } from "react";
import { FilterUse, useSharedValue, withSpring, withTiming } from "bevy-react";
import type { PinchParams } from "@/bevy";

export type PinchableProps = {
  /** Overrides for the press pinch's filter params, merged over
   *  `DEFAULT_PARAMS`. `strength` is the pressed-state magnitude (animated in
   *  on press, sprung back to 0 on release) — `strength: 0` renders the
   *  children untouched (no wrapper, no filter, no handlers).
   *  `x`/`y` pin the anchor instead of following the cursor. */
  params?: Partial<PinchParams>;
  style?: BevyStyle;
  /** Extra filters run BEFORE the pinch on the press surface (e.g. a
   *  `gradientMap` recolor that the pinch then warps). */
  filters?: FilterUse[];
  /** Whether the press surface stops pointer interaction from reaching what
   *  is behind it (`"block"`, the default — it is a button-shaped thing) or
   *  lets it through (`"pass"`). */
  focusPolicy?: "block" | "pass";
  /** The drop shadow (or glow) under the surface at rest — it flattens
   *  while pressed. `null` drops the shadow layer entirely (flat rows). */
  shadow?: PinchShadow | null;
  /** Called when the press starts (`true`) and ends (`false`) — the press
   *  surface owns the gesture, so a child can't observe it with its own
   *  pointer handlers (see `children`). */
  onPressedChange?: (pressed: boolean) => void;
  /** The content to press. Rendered INSIDE Pinchable's own press surface —
   *  it is never cloned or restyled, so its `style`/`transition`/`pressStyle`/
   *  handlers are exactly what it declared. To be pressable through the
   *  wrapper it must not block pointer interaction itself: a `<node>` passes
   *  by default; a `<button>` must set `focusPolicy: "pass"` (see `Button`).
   *  Nor may it carry `onPointer*` handlers: the topmost handler node owns a
   *  press gesture, so it would take every press from the surface and the
   *  pinch would never run (`onClick` is fine — use `onPressedChange` to
   *  observe the press). */
  children: ReactNode;
};

/** The `shadow` filter's look at rest, in px. A colored, offset-free one is a
 *  glow. */
export type PinchShadow = { color: string; offsetY: number; spread: number };

const DEFAULT_SHADOW: PinchShadow = { color: "black", offsetY: 4, spread: 5 };

/** The press feel: pressed-state magnitudes for the built-in `pinch` filter
 *  (normalized params — see `crates/core/src/filters/builtin/pinch.rs`). */
export const DEFAULT_PARAMS: Omit<PinchParams, "x" | "y"> = {
  strength: 0.35,
  radius: 0.4,
  light: 0.6,
  lightAngle: 270,
  gloss: 0.15,
  glossSize: 0.0,
  outerSoftness: 0.4,
  innerSoftness: 0.3,
};

/** Whether these params (as passed to `Pinchable`) produce a press effect
 *  at all — `strength: 0` renders the children bare. */
export function isPinchEnabled(params?: Partial<PinchParams>): boolean {
  return (params?.strength ?? DEFAULT_PARAMS.strength) !== 0;
}

/** Presses its children through the `pinch` filter: pointer-down eases the
 *  squeeze in at the cursor, release springs back with a bulge wobble.
 *
 *  Two wrapper nodes, both owned by Pinchable — the children are rendered
 *  as-is, never cloned:
 *
 *  - the **shadow layer** (outer): a drop shadow (or glow, see `shadow`) that
 *    flattens while pressed, eased through `transition: { filter }`. It has
 *    to be its own layer: the
 *    pinch chain below carries an `{ animated }` binding, and ANY filter
 *    binding parks a node's whole filter transition channel;
 *  - the **press surface** (inner): the pinch chain, the pressed translate,
 *    and the pointer handlers. `strength` is driven Bevy-side through an
 *    inline `{ animated }` binding, while the cursor anchor x/y are plain
 *    statics swapped per-press. The identity chain (strength 0) stays mounted
 *    so the surface is a stable cached layer — no promote/demote churn, and
 *    unsetting the chain mid-spring would snap.
 *
 *  Pointer events reach the press surface only if nothing above it blocks —
 *  see `children`. */
export function Pinchable({
  params,
  style,
  children,
  filters,
  focusPolicy = "block",
  shadow = DEFAULT_SHADOW,
  onPressedChange,
}: PinchableProps) {
  const strength = useSharedValue(0);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [pressed, setPressed] = useState(false);

  const {
    strength: pressStrength,
    x,
    y,
    ...rest
  } = {
    ...DEFAULT_PARAMS,
    ...(params ?? {}),
  };

  if (pressStrength === 0) {
    return <>{children}</>;
  }

  const press = (e: PointerEventData) => {
    setPressed(true);
    onPressedChange?.(true);
    setCenter({ x: e.x, y: e.y });
    strength.value = withTiming(pressStrength, {
      duration: 100,
      easing: "easeOut",
    });
  };
  // Drag-follow: pointer moves only fire while the surface is held, but the
  // guard keeps the anchor frozen after a drag-off (leave releases the press
  // while held moves keep streaming with clamped coords).
  const move = (e: PointerEventData) => {
    if (!pressed) return;
    setCenter({ x: e.x, y: e.y });
  };
  // Bouncy on purpose: the overshoot crosses zero into a brief bulge wobble.
  const release = () => {
    if (!pressed) return;
    setPressed(false);
    onPressedChange?.(false);
    strength.value = withSpring(0, { stiffness: 700, damping: 10 });
  };

  const shadowStyle: BevyStyle = shadow
    ? {
        filter: {
          name: "shadow",
          params: {
            color: shadow.color,
            offsetY: pressed ? 0 : shadow.offsetY,
            spread: pressed ? shadow.spread * 0.4 : shadow.spread,
          },
        },
        transition: { filter: { duration: 150 } },
      }
    : {};

  const surfaceStyle: BevyStyle = {
    // Fill the shadow wrapper along its (row) main axis so a child's
    // percentage width resolves against a definite size — a content-sized
    // surface would collapse `width: "100%"` children (nav rows) to content.
    flexGrow: 1,
    focusPolicy,
    transform: { translateY: 0 },
    transition: { transform: { duration: 150 } },
    filter: [
      ...(filters ?? []),
      {
        name: "pinch",
        params: {
          ...rest,
          x: x ?? center.x,
          y: y ?? center.y,
          strength: { animated: strength, seed: 0 },
        },
      },
    ],
  };

  return (
    <node style={{ ...style, ...shadowStyle }}>
      <node
        style={surfaceStyle}
        pressStyle={surfacePressStyle}
        onPointerDown={press}
        onPointerMove={move}
        onPointerUp={release}
        onPointerLeave={release}
      >
        {children}
      </node>
    </node>
  );
}

const surfacePressStyle: BevyStyle = { transform: { translateY: 2 } };
