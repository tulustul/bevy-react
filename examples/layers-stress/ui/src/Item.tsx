import { memo, useEffect, useMemo } from "react";
import { useSharedValue, withDelay, withRepeat, withTiming } from "bevy-react";
import type { FilterUse } from "bevy-react";
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
  filtered,
  blur,
  blurRadius,
}: {
  item: Item;
  animate: boolean;
  groupAlpha: boolean;
  /** Whether this item carries a `filter` chain (share picked by the App). */
  filtered: boolean;
  /** Filter variant: `blur` (2-pass, outset) instead of `grayscale`. */
  blur: boolean;
  /** Blur radius in px. `0` for unfiltered/grayscale items keeps the prop
   *  referentially stable so the memo bails while the radius animates. */
  blurRadius: number;
}) {
  // Stable instances per mounted item (useSharedValue is useRef-backed), so a
  // re-render's inline `{ animated }` wrappers compare structurally identical
  // and the delta diff emits no op.
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

  // The filter chain, when this item is in the filtered share. Grayscale is
  // the cheap single-pass filter; blur the expensive 2-pass one (its radius
  // also outsets the layer texture). A radius-only change re-renders just this
  // memo and emits a params-only style delta — the no-re-capture update path.
  const filter = useMemo<FilterUse[] | undefined>(() => {
    if (!filtered) return undefined;
    return blur
      ? [{ name: "blur", params: { radius: blurRadius } }]
      : [{ name: "grayscale" }];
  }, [filtered, blur, blurRadius]);

  // Promotion root: `opacity` present (an `{ animated }` one counts) + ≥1
  // child (the banner) promotes the subtree to its own composited layer (a
  // `filter` chain force-promotes it regardless); `groupAlpha: false` (base
  // style) opts out, de-promoting it. The shared values are useRef-stable, so
  // the memo'd style stays referentially stable per item.
  const style = useMemo<BevyStyle>(
    () => ({
      positionType: "absolute",
      left: `${item.left}%`,
      top: `${item.top}%`,
      opacity: { animated: op },
      transform: { translateX: { animated: tx }, translateY: { animated: ty } },
      ...(groupAlpha ? {} : { groupAlpha: false }),
      ...(filter ? { filter } : {}),
    }),
    [item, groupAlpha, filter, tx, ty, op],
  );

  return (
    <node style={style}>
      <TestBanner />
    </node>
  );
});
