import { useEffect } from "react";
import { create } from "zustand";

export type ExplanationData = {
  title: string;
  description?: string;
  tsx?: string;
  rust?: string;
};

/** Opaque per-`Example`-instance identity (a `useRef` object). */
export type ExplanationKey = object;

type ExplanationState = {
  /** The page's always-visible default, registered by `useDemoPage` on mount. */
  pageDefault: ExplanationData | null;
  /** The clicked card, if any; wins over `pageDefault`. */
  selected: { key: ExplanationKey; data: ExplanationData } | null;
  /** Panel collapsed to a small corner button; sticky across demo switches. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Atomically swap the page default and drop any selection. `null` opts
   * the page out of the panel entirely (it renders nothing). */
  setPage: (pageDefault: ExplanationData | null) => void;
  /** Toggle: selecting the already-selected key deselects. */
  select: (key: ExplanationKey, data: ExplanationData) => void;
  /** With a key, deselect only if that key is still the selection. */
  deselect: (key?: ExplanationKey) => void;
};

const createExplanationStore = () =>
  create<ExplanationState>((set) => ({
    pageDefault: null,
    selected: null,
    collapsed: false,
    setCollapsed: (collapsed) => set({ collapsed }),
    setPage: (pageDefault) => set({ pageDefault, selected: null }),
    select: (key, data) =>
      set((s) =>
        s.selected?.key === key
          ? { selected: null }
          : { selected: { key, data } },
      ),
    deselect: (key) =>
      set((s) =>
        key === undefined || s.selected?.key === key ? { selected: null } : s,
      ),
  }));

// Guard on globalThis so a hot-reload re-exec of app.js keeps the selection
// instead of recreating the store with the default.
const g = globalThis as unknown as {
  __explanationStore?: ReturnType<typeof createExplanationStore>;
};
export const useExplanationStore = (g.__explanationStore ??=
  createExplanationStore());

/**
 * Register the page's default explanation (shown whenever no card is
 * selected), or `null` to opt the page out of the panel. Pass a module-level
 * const so the effect doesn't churn — after a hot-reload re-exec the const
 * is a fresh object, which re-registers edited text even when React
 * preserves the page's hook state.
 */
export function useDemoPage(info: ExplanationData | null) {
  const setPage = useExplanationStore((s) => s.setPage);
  useEffect(() => {
    setPage(info);
  }, [setPage, info]);
}
