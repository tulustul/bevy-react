import { create } from "zustand";
import { DEMOS, type DemoItem } from "./demos";

type DemosState = {
  selectedDemo: DemoItem;
  setSelectedDemo: (demo: DemoItem) => void;
};

const createDemosStore = () =>
  create<DemosState>((set) => ({
    selectedDemo: DEMOS[0],
    setSelectedDemo: (demo) => set({ selectedDemo: demo }),
  }));

// Guard on globalThis so a hot-reload re-exec of app.js keeps the selection
// instead of recreating the store with the default.
const g = globalThis as unknown as {
  __demosStore?: ReturnType<typeof createDemosStore>;
};
export const useDemosStore = (g.__demosStore ??= createDemosStore());
