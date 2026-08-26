import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import type { WindowSize } from "@/bevy";
import { Scrollbar } from "@/theme";

/**
 * The gallery's responsive shell mode, decided by viewport width alone:
 *
 *   - `regular` — the desktop shell: a 220px nav column beside the content.
 *   - `compact` — phones and narrow windows (< 720px): a top bar with a menu
 *     button, and the nav becomes an overlay drawer.
 *
 * Deliberately app-local (no library primitive): `App` owns the one
 * `useWindowSize()` subscription, derives the mode, and provides it here;
 * everything below reads it with `useLayout()`. Nothing branches on touch —
 * the compact shell just has to work with a finger.
 */
export type LayoutMode = "compact" | "regular";

/** Below this logical width the shell goes compact. 720 keeps landscape
 * phones (844–932 wide) on the regular shell, which fits them. */
export const COMPACT_BREAKPOINT = 720;
/** The nav column's width in regular mode (the drawer keeps it in compact). */
export const NAV_WIDTH = 220;
/** The compact shell's fixed top bar height. */
export const TOP_BAR_HEIGHT = 48;

export type Layout = {
  mode: LayoutMode;
  /** The UI viewport's logical size (never null under the provider). */
  win: WindowSize;
  /** The content column's padding (each side). */
  contentPadding: number;
  /** Width left for content inside the content scrollport (the nav column —
   * 0 in compact, the drawer overlays — the scrollbar gutter and the padding
   * taken out) — the number responsive cards clamp to. Computed in JS, NOT with
   * `width:"100%"` + `maxWidth`: that combo makes bevy_ui measure wrapped
   * text at the un-clamped width and the stale height survives the clamp
   * (see `HeaderCard`). */
  contentWidth: number;
};

const CONTENT_PADDING: Record<LayoutMode, number> = {
  compact: 5,
  regular: 24,
};

export function layoutFor(win: WindowSize): Layout {
  const mode: LayoutMode =
    win.width < COMPACT_BREAKPOINT ? "compact" : "regular";
  const navReserve = mode === "regular" ? NAV_WIDTH : 0;
  const contentPadding = CONTENT_PADDING[mode];
  // The content column is a scrollport with a gutter-positioned scrollbar
  // (`App` `contentStyle`), which taffy takes out of the content box.
  const gutter = Scrollbar.thickness ?? 0;
  return {
    mode,
    win,
    contentPadding,
    contentWidth: win.width - navReserve - gutter - 2 * contentPadding,
  };
}

// Guarded on globalThis like the zustand stores: app.js is re-executed on
// every hot reload, and a fresh context object would change the Provider's
// element type — React then remounts the whole shell (nav entrance replays,
// every demo's state resets) instead of refreshing in place.
const g = globalThis as unknown as {
  __demosLayoutContext?: ReturnType<typeof createContext<Layout | null>>;
};
const LayoutContext = (g.__demosLayoutContext ??= createContext<Layout | null>(
  null,
));

export function LayoutProvider({
  win,
  children,
}: PropsWithChildren<{ win: WindowSize }>) {
  // Stable per size so a same-size re-render doesn't fan out to every consumer.
  const layout = useMemo(() => layoutFor(win), [win]);
  return (
    <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>
  );
}

export function useLayout(): Layout {
  const layout = useContext(LayoutContext);
  if (!layout) throw new Error("useLayout() needs <LayoutProvider> (App)");
  return layout;
}

/** `contentWidth` clamped to a card's own `[min, max]`. */
export function clampContentWidth(
  layout: Layout,
  min: number,
  max: number,
): number {
  return Math.max(min, Math.min(max, layout.contentWidth));
}
