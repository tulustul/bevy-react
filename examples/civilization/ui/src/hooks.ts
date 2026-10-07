import { useEffect, useRef, useState } from "react";
import {
  interpolate,
  useSharedValue,
  withTiming,
  type BevyStyle,
} from "bevy-react";
import { bevy, on, type ReactEvents, type WindowSize } from "./bevy";

/** The UI viewport's logical size, streamed by the built-in `resize` event.
 *  `0×0` until the host answers. */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });
  useEffect(() => {
    bevy.window
      .size()
      .then(setSize)
      .catch(() => setSize({ width: 1440, height: 900 }));
    return bevy.on("resize", setSize);
  }, []);
  return size;
}

/** Listen to a Bevy event while mounted; `run` always sees the latest
 *  render's state. */
export function useEvent<K extends keyof ReactEvents>(
  name: K,
  run: (value: ReactEvents[K]) => void,
) {
  const latest = useRef(run);
  latest.current = run;
  useEffect(() => on(name, (value) => latest.current(value)), [name]);
}

/** A scripted step from `--shoot … --do "<secs> <verb> [arg]"` (the
 *  `debug.act` event): runs `run(arg)` for this component's `verb`. */
export function useDebug(verb: string, run: (arg: string) => void) {
  useEvent("debug.act", ({ action }) => {
    const [head, ...rest] = action.split(" ");
    if (head === verb) run(rest.join(" "));
  });
}

/** Slide in from an offset when mounted (Bevy runs the animation; React
 *  renders once). */
export function useSlideIn(x: number, y: number, duration = 320): BevyStyle {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration, easing: "easeOut" });
  }, [t, duration]);
  return {
    transform: {
      translateX: { animated: interpolate(t, [0, 1], [x, 0]) },
      translateY: { animated: interpolate(t, [0, 1], [y, 0]) },
    },
  };
}

/** Fade and grow in when mounted. */
export function useFadeIn(duration = 260): BevyStyle {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration, easing: "easeOut" });
  }, [t, duration]);
  return {
    opacity: { animated: t },
    transform: { scale: { animated: interpolate(t, [0, 1], [0.97, 1]) } },
  };
}
