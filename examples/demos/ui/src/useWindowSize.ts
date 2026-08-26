import { useEffect, useState } from "react";
import { bevy, type WindowSize } from "@/bevy";

/** What the app assumes when the host cannot report a viewport (the request
 * rejects — no default UI camera / no single window): the desktop shell. */
export const FALLBACK_WINDOW: WindowSize = { width: 1280, height: 832 };

/** The UI viewport's logical size: pulled once on mount, then streamed by the
 * built-in `resize` event. `null` until the first response lands. Same-value
 * updates are dropped (the first `resize` after mount repeats the request's
 * answer, and a drag-resize streams one event per frame). */
export function useWindowSize(): WindowSize | null {
  const [size, setSize] = useState<WindowSize | null>(null);
  useEffect(() => {
    const update = (next: WindowSize) =>
      setSize((prev) =>
        prev && prev.width === next.width && prev.height === next.height
          ? prev
          : next,
      );
    bevy.window
      .size()
      .then(update)
      // The shell gates on the size (see `App`): a rejected request must not
      // leave the app blank forever.
      .catch(() => update(FALLBACK_WINDOW));
    return bevy.on("resize", update);
  }, []);
  return size;
}
