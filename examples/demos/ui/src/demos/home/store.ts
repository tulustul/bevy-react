import { useCallback } from "react";
import { create } from "zustand";
import { hmrSingleton } from "@/hmr";

type HomeState = {
  /** The expanded tile, or `null` for the gallery. */
  selectedItem: string | null;
  /** The tile flying home from the panel right now — the wall's fade skips it. */
  previousSelectedItem: string | null;
  /** Whether a panel has ever been opened; the opening choreography plays once per visit. */
  opened: boolean;
  select: (id: string) => void;
  deselect: () => void;
  /** The flight is over. Ignored unless `id` is still the one in flight. */
  settle: (id: string) => void;
  reset: () => void;
};

const initialState = {
  selectedItem: null,
  previousSelectedItem: null,
  opened: false,
} satisfies Partial<HomeState>;

// Every action is ONE `set`: the outgoing card must unmount and the incoming
// one mount in the same React commit or the `sharedTag` pair never forms
// (pinned on the wire by `crates/core/tests/home_shared_flight.rs`).
export const useHomeStore = hmrSingleton("__homeStore", () =>
  create<HomeState>((set) => ({
    ...initialState,
    select: (id) =>
      set({ selectedItem: id, previousSelectedItem: null, opened: true }),
    deselect: () =>
      set((s) => ({
        selectedItem: null,
        previousSelectedItem: s.selectedItem,
      })),
    settle: (id) =>
      set((s) =>
        s.previousSelectedItem === id ? { previousSelectedItem: null } : s,
      ),
    reset: () => set(initialState),
  })),
);

type VignetteStore = {
  values: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
};

const useVignetteStore = hmrSingleton("__vignetteStore", () =>
  create<VignetteStore>((set) => ({
    values: {},
    set: (key, value) =>
      set((s) =>
        Object.is(s.values[key], value)
          ? s
          : { values: { ...s.values, [key]: value } },
      ),
  })),
);

/** `useState` whose value outlives the component. A vignette renders at both
 * ends of a flight as two different mounts, so hook state would reset on every
 * expand/collapse; `key` names the slot (e.g. `"morphing.face"`). */
export function useVignetteState<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const value = useVignetteStore((s) =>
    key in s.values ? (s.values[key] as T) : initial,
  );
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const { values, set } = useVignetteStore.getState();
      const prev = key in values ? (values[key] as T) : initial;
      set(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    [key, initial],
  );
  return [value, setValue];
}
