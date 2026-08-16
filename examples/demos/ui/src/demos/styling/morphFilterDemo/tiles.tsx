import { useEffect, useRef, useState } from "react";

import { Checkbox, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import type { FilterEntry } from "./params";
import { TILE, TileContent, VARIANT_COUNT, nextVariant } from "./variants";

const period = () => 2000 + Math.random() * 4000;

/** While enabled, fires `swap` on a self-rescheduling timer with a random
 * 4-10s period (re-rolled each cycle) and a random initial delay, so the
 * tiles stay desynchronized and only a handful morph at once.
 *
 * Returns a reset function: a manual swap calls it so the pending timer
 * restarts with a fresh full period instead of firing right after the
 * click. No-op while autoplay is off. */
function useAutoplay(enabled: boolean, swap: () => void) {
  const swapRef = useRef(swap);
  swapRef.current = swap;
  const restartRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let id: ReturnType<typeof setTimeout>;
    const schedule = (delay: number) => {
      id = setTimeout(() => {
        swapRef.current();
        schedule(period());
      }, delay);
    };
    restartRef.current = () => {
      clearTimeout(id);
      schedule(period());
    };
    schedule(Math.random() * 4000);
    return () => {
      restartRef.current = null;
      clearTimeout(id);
    };
  }, [enabled]);
  return () => restartRef.current?.();
}

export function MorphTile({
  entry,
  autoplay,
  showParams,
}: {
  entry: FilterEntry;
  autoplay: boolean;
  showParams: boolean;
}) {
  // Random initial variant (first mount never animates, so no morph fires).
  const [variant, setVariant] = useState(() =>
    Math.floor(Math.random() * VARIANT_COUNT),
  );
  const [duration, setDuration] = useState(entry.duration);
  const [values, setValues] = useState(() =>
    entry.controls.map((c) => c.initial),
  );

  const swap = () => setVariant((v) => nextVariant(v));
  const resetAutoplayTimer = useAutoplay(autoplay, swap);
  const clickSwap = () => {
    swap();
    resetAutoplayTimer();
  };

  const setValue = (i: number, v: number) =>
    setValues((vals) => vals.map((old, j) => (j === i ? v : old)));

  return (
    <node
      style={{
        width: TILE,
        flexDirection: "column",
        alignItems: "stretch",
        gap: 6,
      }}
    >
      <node
        style={{
          width: TILE,
          height: TILE,
          borderRadius: 10,
          flexDirection: "column",
          morphFilter: { key: variant, ...entry.use(values) },
          transition: {
            morphFilter: { duration, easing: entry.easing },
          },
        }}
        onClick={clickSwap}
      >
        <TileContent variant={variant} />
      </node>
      <text
        style={{
          color: Colors.textColor200,
          fontSize: FontSizes.sm,
          textAlign: "center",
        }}
      >
        {entry.label}
      </text>
      {showParams && (
        <Slider
          value={duration}
          min={200}
          max={30000}
          onChange={setDuration}
          label={`duration ${Math.round(duration)} ms`}
        />
      )}
      {showParams &&
        entry.controls.map((c, i) =>
          c.kind === "slider" ? (
            <Slider
              key={c.label}
              value={values[i]}
              min={c.min}
              max={c.max}
              label={`${c.label} ${values[i].toFixed(c.decimals ?? 0)}`}
              onChange={(v) => setValue(i, v)}
            />
          ) : (
            <Checkbox
              key={c.label}
              label={c.label}
              enabled={values[i] === 1}
              onChange={(on) => setValue(i, on ? 1 : 0)}
            />
          ),
        )}
    </node>
  );
}
