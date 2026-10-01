import { create } from "zustand";
import { bevy, type WindowSize } from "@/bevy";
import { hmrSingleton } from "@/hmr";

/** What the app assumes when the host cannot report a viewport (the request
 * rejects — no default UI camera / no single window): the desktop shell. */
const FALLBACK_WINDOW: WindowSize = { width: 1280, height: 832 };

/** The UI viewport's logical size: pulled once for the process, then streamed
 * by the built-in `resize` event. `{ width: 0, height: 0 }` only until the
 * first answer lands.
 *
 * One store for the process on purpose, not per-instance state: a component
 * that mounts LATER must start already knowing — the home page's expanded
 * panel once mounted as a phone layout, measured its flight against it, and
 * jumped when its own answer arrived. `hmrSingleton` keeps the answer across a
 * hot reload (the size-gated shell would otherwise blank until it re-lands).
 * Same-value updates are dropped (the first `resize` repeats the request's
 * answer, and a drag-resize streams one per frame). */
export const useWindowSize = hmrSingleton("__windowSizeStore", () => {
  const store = create<WindowSize>(() => ({ width: 0, height: 0 }));
  const publish = (next: WindowSize) => {
    const { width, height } = store.getState();
    if (next.width !== width || next.height !== height) {
      store.setState(next, true);
    }
  };
  bevy.window
    .size()
    .then(publish)
    // The shell gates on the size (see `App`): a rejected request must not
    // leave the app blank forever.
    .catch(() => publish(FALLBACK_WINDOW));
  bevy.on("resize", publish);
  return store;
});
