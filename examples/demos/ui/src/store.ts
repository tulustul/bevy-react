import { create } from "zustand";
import { DEMOS, type DemoItem } from "./demos";

type NavState = {
  selectedDemo: DemoItem;
  setSelectedDemo: (demo: DemoItem) => void;
};

const createNavStore = () =>
  create<NavState>((set) => ({
    selectedDemo: DEMOS[0],
    setSelectedDemo: (demo) => set({ selectedDemo: demo }),
  }));

// Guard on globalThis so a hot-reload re-exec of app.js keeps the selection
// instead of recreating the store with the default.
const g = globalThis as unknown as {
  __navStore?: ReturnType<typeof createNavStore>;
};
export const useNavStore = (g.__navStore ??= createNavStore());
