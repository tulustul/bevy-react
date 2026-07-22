import { memo, useEffect, useMemo } from "react";
import {
  Animated,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { TestBanner } from "./TestBanner";
import type { Item } from "./items";

// Memoized: toggling one control re-renders every item, but each render's props
// are referentially stable (`item` from the useMemo'd array, booleans), so the
// memo bails and nothing crosses the bridge unless a value actually changed.
//
// Known upstream caveat: shared-value ids are never freed on unmount, so
// switching 500 → 20 strands Bevy-side table entries until a reload. Harmless
// for a stress tool.
export const StressItem = memo(function StressItem({
  item,
  animate,
  groupAlpha,
}: {
  item: Item;
  animate: boolean;
  groupAlpha: boolean;
}) {
  // Stable instances per mounted item (useSharedValue is useRef-backed), so a
  // re-render serializes `animatedStyle` to structurally identical bindings and
  // the delta diff emits no op.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const op = useSharedValue(item.opacity);

  useEffect(() => {
    if (animate) {
      const loop = (to: number, duration: number) =>
        withDelay(
          item.delay,
          withRepeat(
            withTiming(to, { duration, easing: "easeInOut" }),
            -1,
            true, // ping-pong back to the start value
          ),
        );
      tx.value = loop(item.dx, item.durMove);
      ty.value = loop(item.dy, item.durMove);
      // On a promoted layer root the animated opacity drives the layer's group
      // alpha directly (the composite quad), not a per-node color fold.
      op.value = loop(item.opacityTo, item.durOpacity);
    } else {
      // A plain-number set interrupts a running driver — snap home.
      tx.value = 0;
      ty.value = 0;
      op.value = item.opacity;
    }
  }, [animate, item, tx, ty, op]);

  // Promotion root: `opacity` present + ≥1 child (the banner) promotes the
  // subtree to its own composited layer; `groupAlpha: false` (base style)
  // opts out, de-promoting it.
  const style = useMemo<BevyStyle>(
    () => ({
      positionType: "absolute",
      left: `${item.left}%`,
      top: `${item.top}%`,
      opacity: item.opacity,
      ...(groupAlpha ? {} : { groupAlpha: false }),
    }),
    [item, groupAlpha],
  );

  return (
    <Animated.node
      style={style}
      animatedStyle={{ translateX: tx, translateY: ty, opacity: op }}
    >
      <TestBanner />
    </Animated.node>
  );
});
