import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { cloneElement, ReactElement, useRef, useState } from "react";
import { FilterUse, useSharedValue, withSpring, withTiming } from "bevy-react";
import type { PinchParams } from "@/bevy";

type PinchableChildProps = {
  style?: BevyStyle;
  onPointerDown?: (e: PointerEventData) => void;
  onPointerMove?: (e: PointerEventData) => void;
  onPointerUp?: (e: PointerEventData) => void;
  onPointerLeave?: (e: PointerEventData) => void;
};

export type PinchableProps = {
  /** Overrides for the press pinch's filter params, merged over
   *  `DEFAULT_PARAMS`. `strength` is the pressed-state magnitude (animated in
   *  on press, sprung back to 0 on release) — `strength: 0` renders the child
   *  untouched (no filter, no handlers — it stops being a composited layer).
   *  `x`/`y` pin the anchor instead of following the cursor. */
  params?: Partial<PinchParams>;
  /** A single element that takes node props. Pinchable injects the `pinch`
   *  filter into its base style (replacing any `filter` the child styles
   *  itself with) and chains onto its pointer handlers. */
  children: ReactElement<PinchableChildProps>;
  filters?: FilterUse[];
};

/** The press feel: pressed-state magnitudes for the built-in `pinch` filter
 *  (normalized params — see `crates/core/src/filters/builtin/pinch.rs`). */
export const DEFAULT_PARAMS: Omit<PinchParams, "x" | "y"> = {
  strength: 0.35,
  radius: 0.4,
  light: 0.6,
  lightAngle: 270,
  gloss: 0.15,
  glossSize: 0.0,
  outerSoftness: 0.3,
  innerSoftness: 0.3,
};

/** Presses its child through the `pinch` filter: pointer-down eases the
 *  squeeze in at the cursor, release springs back with a bulge wobble.
 *
 *  `strength` is driven Bevy-side through an inline { animated } binding
 *  (base style only — bindings in pressStyle are ignored), while the cursor
 *  anchor x/y are plain statics swapped per-press. The identity chain
 *  (strength 0) stays mounted so the child is a stable cached layer — no
 *  promote/demote churn, and unsetting the chain mid-spring would snap. */
export function Pinchable({ params, children, filters }: PinchableProps) {
  const strength = useSharedValue(0);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const pressed = useRef(false);

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
    return children;
  }

  const press = (e: PointerEventData) => {
    pressed.current = true;
    setCenter({ x: e.x, y: e.y });
    strength.value = withTiming(pressStrength, {
      duration: 100,
      easing: "easeOut",
    });
  };
  // Drag-follow: pointer moves only fire while the button is held, but the
  // guard keeps the anchor frozen after a drag-off (leave releases the press
  // while held moves keep streaming with clamped coords).
  const move = (e: PointerEventData) => {
    if (!pressed.current) return;
    setCenter({ x: e.x, y: e.y });
  };
  // Bouncy on purpose: the overshoot crosses zero into a brief bulge wobble.
  const release = () => {
    if (!pressed.current) return;
    pressed.current = false;
    strength.value = withSpring(0, { stiffness: 700, damping: 10 });
  };

  const chain =
    (
      theirs: ((e: PointerEventData) => void) | undefined,
      ours: (e: PointerEventData) => void,
    ) =>
    (e: PointerEventData) => {
      theirs?.(e);
      ours(e);
    };

  const props = children.props;
  return cloneElement(children, {
    style: {
      ...(props.style ?? {}),
      filter: [
        {
          name: "pinch",
          params: {
            ...rest,
            x: x ?? center.x,
            y: y ?? center.y,
            strength: { animated: strength, seed: 0 },
          },
        },
        ...(filters ?? []),
      ],
    },
    onPointerDown: chain(props.onPointerDown, press),
    onPointerMove: chain(props.onPointerMove, move),
    onPointerUp: chain(props.onPointerUp, release),
    onPointerLeave: chain(props.onPointerLeave, release),
  });
}
