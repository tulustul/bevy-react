import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { cloneElement, ReactElement, useRef, useState } from "react";
import { FilterUse, useSharedValue, withSpring, withTiming } from "bevy-react";

type PinchableChildProps = {
  style?: BevyStyle;
  onPointerDown?: (e: PointerEventData) => void;
  onPointerMove?: (e: PointerEventData) => void;
  onPointerUp?: (e: PointerEventData) => void;
  onPointerLeave?: (e: PointerEventData) => void;
};

export type PinchableProps = {
  /** Intensity multiplier for the pinch-on-press effect: scales the pressed
   *  strength and radius together. 1 = default feel, 0 renders the child
   *  untouched (no filter, no handlers — the child stops being a composited
   *  layer). */
  pinch?: number;
  /** A single element that takes node props. Pinchable injects the `pinch`
   *  filter into its base style (replacing any `filter` the child styles
   *  itself with) and chains onto its pointer handlers. */
  children: ReactElement<PinchableChildProps>;
  filters?: FilterUse[];
};

// Pressed-state magnitudes at `pinch: 1` (the custom `pinch` filter takes
// normalized params — see `examples/demos/filters.rs`).
const PRESS_STRENGTH = 0.25;
const PRESS_RADIUS = 0.6;

/** Presses its child through the `pinch` filter: pointer-down eases the
 *  squeeze in at the cursor, release springs back with a bulge wobble.
 *
 *  `strength` is driven Bevy-side through an inline { animated } binding
 *  (base style only — bindings in pressStyle are ignored), while the cursor
 *  anchor x/y are plain statics swapped per-press. The identity chain
 *  (strength 0) stays mounted so the child is a stable cached layer — no
 *  promote/demote churn, and unsetting the chain mid-spring would snap. */
export function Pinchable({ pinch = 1, children, filters }: PinchableProps) {
  const strength = useSharedValue(0);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const pressed = useRef(false);

  if (pinch === 0) {
    return children;
  }

  const press = (e: PointerEventData) => {
    pressed.current = true;
    setCenter({ x: e.x, y: e.y });
    strength.value = withTiming(PRESS_STRENGTH * pinch, {
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
            x: center.x,
            y: center.y,
            strength: { animated: strength, seed: 0 },
            radius: PRESS_RADIUS * pinch,
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
