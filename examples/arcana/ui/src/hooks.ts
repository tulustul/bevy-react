import { useEffect, useRef, useState } from "react";
import { bevy, type WindowSize } from "./bevy";

/** The UI viewport's logical size, streamed by the built-in `resize` event.
 *  `0×0` until the host answers. */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });
  useEffect(() => {
    bevy.window
      .size()
      .then(setSize)
      .catch(() => setSize({ width: 1280, height: 832 }));
    return bevy.on("resize", setSize);
  }, []);
  return size;
}

/** A scripted step from `--shoot … --do "<secs> <verb> [arg]"` (the
 *  `debug.act` event): runs `run(arg)` for this component's `verb`. */
export function useDebug(verb: string, run: (arg: string) => void) {
  const latest = useRef(run);
  latest.current = run;
  useEffect(
    () =>
      bevy.on("debug.act", ({ action }) => {
        const [head, ...rest] = action.split(" ");
        if (head === verb) latest.current(rest.join(" "));
      }),
    [verb],
  );
}
