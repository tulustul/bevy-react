import { create } from "zustand";
import { hmrSingleton } from "@/hmr";
import { DEMOS, demoFromUrl, type DemoItem } from "./demos";

type DemosState = {
  selectedDemo: DemoItem;
  setSelectedDemo: (demo: DemoItem) => void;
};

const createDemosStore = () =>
  create<DemosState>((set) => ({
    selectedDemo: demoFromUrl() ?? DEMOS[0],
    setSelectedDemo: (demo) => set({ selectedDemo: demo }),
  }));

export const useDemosStore = hmrSingleton("__demosStore", createDemosStore);
