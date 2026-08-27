import { create } from "zustand";
import { hmrSingleton } from "@/hmr";
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

export const useDemosStore = hmrSingleton("__demosStore", createDemosStore);
