import { ComponentType, ReactNode, useEffect } from "react";
import { create } from "zustand";
import type { BevyStyle } from "bevy-react/jsx";

export type ExplanationData = {
  title: string;
  /** Rich docs content built from the `components/docs` kit (typography +
   * `<Code>`/`<CodeTabs>`), freely interleaving prose and snippets. */
  info?: ReactNode;
  /** Render the header card collapsed to its title row until expanded — for
   * pages whose content sits behind/under the card (3D scenes, surfaces). */
  startCollapsed?: boolean;
};

/** What a clicked `<Example>` contributes: its docs plus the demo
 * **component**, which the modal mounts as its own instance. A component
 * reference (not a rendered ReactNode) is what makes the two instances
 * isolated: captured JSX closes over the page component's state, so a
 * snapshot would drive the page's sliders from inside the modal. */
export type ExampleSelection = ExplanationData & {
  demo?: ComponentType;
  /** The example card's `cache` style, forwarded so the modal can mirror it —
   * a live-content demo (`cache: "never"`, e.g. a portal) must also opt the
   * modal's own composited layer out of capture caching or its second
   * instance renders frozen. */
  cache?: BevyStyle["cache"];
};

/** Opaque per-`Example`-instance identity (a `useRef` object). */
export type ExplanationKey = object;

type ExplanationState = {
  /** The page's header-card content, registered by `useDemoPage` on mount. */
  pageDefault: ExplanationData | null;
  /** The clicked card, if any; shown in the example modal. */
  selected: { key: ExplanationKey; data: ExampleSelection } | null;
  /** Bumped on every new selection — the modal's morph key, so switching
   * examples crossfades and open/close blends from/to empty. */
  selectionSeq: number;
  /** Atomically swap the page default and drop any selection. `null` opts
   * the page out of the header card entirely. */
  setPage: (pageDefault: ExplanationData | null) => void;
  /** Toggle: selecting the already-selected key closes the modal. */
  select: (key: ExplanationKey, data: ExampleSelection) => void;
  /** With a key, deselect only if that key is still the selection. */
  deselect: (key?: ExplanationKey) => void;
};

const createExplanationStore = () =>
  create<ExplanationState>((set) => ({
    pageDefault: null,
    selected: null,
    selectionSeq: 0,
    setPage: (pageDefault) => set({ pageDefault, selected: null }),
    select: (key, data) =>
      set((s) =>
        s.selected?.key === key
          ? { selected: null }
          : { selected: { key, data }, selectionSeq: s.selectionSeq + 1 },
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
 * Register the page's header-card content, or `null` to opt the page out of
 * the card (pages that are pure documentation render the kit themselves).
 * Pass a module-level const so the effect doesn't churn — after a hot-reload
 * re-exec the const is a fresh object, which re-registers edited text even
 * when React preserves the page's hook state.
 */
export function useDemoPage(info: ExplanationData | null) {
  const setPage = useExplanationStore((s) => s.setPage);
  useEffect(() => {
    setPage(info);
  }, [setPage, info]);
}
