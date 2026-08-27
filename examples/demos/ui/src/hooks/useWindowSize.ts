import { useEffect, useState } from "react";
import { bevy, type WindowSize } from "@/bevy";

/** What the app assumes when the host cannot report a viewport (the request
 * rejects — no default UI camera / no single window): the desktop shell. */
export const FALLBACK_WINDOW: WindowSize = { width: 1280, height: 832 };

/** The last size the host reported, shared by every hook instance.
 *
 * This is module state on purpose. The size is a property of the window, not
 * of any one component, and a per-instance `useState({ width: 0, height: 0 })`
 * is actively wrong: a component that mounts LATER would start at 0×0 and
 * report `isMobile` until its own request came back, then snap. That is
 * invisible for a component mounted at startup and very visible for one
 * mounted mid-interaction — the home page's expanded panel mounted as a phone
 * layout, measured its flight against it, and jumped when the answer arrived.
 */
let current: WindowSize | null = null;

/** Everyone currently mounted, so one answer updates all of them. */
const listeners = new Set<(size: WindowSize) => void>();

/** The in-flight (or completed) subscription. Started once for the process:
 * one request and one `resize` listener however many components ask. */
let started = false;

function publish(next: WindowSize) {
  if (
    current &&
    current.width === next.width &&
    current.height === next.height
  ) {
    return;
  }
  current = next;
  for (const listener of listeners) listener(next);
}

function start() {
  if (started) return;
  started = true;
  bevy.window
    .size()
    .then(publish)
    // The shell gates on the size (see `App`): a rejected request must not
    // leave the app blank forever.
    .catch(() => publish(FALLBACK_WINDOW));
  bevy.on("resize", publish);
}

/** The UI viewport's logical size: pulled once for the process, then streamed
 * by the built-in `resize` event. `{ width: 0, height: 0 }` only until the
 * first answer lands — after that every new hook instance starts already
 * knowing, so a component mounting mid-animation never renders a phone layout
 * on a desktop. Same-value updates are dropped (the first `resize` after mount
 * repeats the request's answer, and a drag-resize streams one per frame). */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(
    () => current ?? { width: 0, height: 0 },
  );

  useEffect(() => {
    listeners.add(setSize);
    start();
    // A late mount adopts whatever is already known, without waiting.
    if (current) setSize(current);
    return () => {
      listeners.delete(setSize);
    };
  }, []);

  return size;
}
