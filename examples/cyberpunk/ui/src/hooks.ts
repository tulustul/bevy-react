import { useEffect, useRef } from "react";
import {
  interpolate,
  useSharedValue,
  withDelay,
  withTiming,
  type BevyStyle,
} from "bevy-react";
import { on, type KeyboardEventData, type ReactEvents } from "./bevy";

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

/** Key presses (no auto-repeat unless `repeat`), while mounted. `run` gets
 *  the event; match on `e.key` or `e.code`. */
export function useKeys(run: (e: KeyboardEventData) => void, repeat = false) {
  useEvent("keyDown", (e) => {
    if (e.repeat && !repeat) return;
    run(e);
  });
}

/** A scripted step from `--shoot … --do "<secs> <verb> [arg]"` (the
 *  `debug.act` event): runs `run(arg)` for this component's `verb`. */
export function useDebug(verb: string, run: (arg: string) => void) {
  useEvent("debug.act", ({ action }) => {
    const [head, ...rest] = action.split(" ");
    if (head === verb) run(rest.join(" "));
  });
}

/** Slide in from `x` px while fading in, after `delay` ms (Bevy runs the
 *  animation; React renders once). */
export function useEnter(x = -24, delay = 0, duration = 280): BevyStyle {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: "easeOut" }));
  }, [t, delay, duration]);
  return {
    opacity: { animated: t },
    transform: { translateX: { animated: interpolate(t, [0, 1], [x, 0]) } },
  };
}
