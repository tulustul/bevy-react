import { useEffect, useMemo, useRef } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Scrollbar } from "@/theme";
import { DEMOS, findDemoByLabel } from "./demos";
import { Navigation } from "./Navigation";
import { HeaderCard } from "./HeaderCard";
import { ExampleModal } from "./ExampleModal";
import { useDemosStore } from "./demosStore";
import { setNavigate } from "./demoNavigation";
import type { MorphUse } from "./demos/styling/morphFilterDemo/params";

// The page-transition morphs: each demo switch picks one at random.
const PAGE_MORPHS: MorphUse[] = [
  { name: "stripDatamoshGlitch", params: { strength: 0.45, tear: 0.1 } },
  {
    name: "gridFlip",
    params: { divider: 0, size: [10, 10], color: "transparent" },
  },
  { name: "bookFlip" },
  { name: "pixelize", params: { squaresMin: [50, 50] } },
  { name: "windowslice", params: { count: 30 } },
  { name: "crossfade", params: { scale: 100 } },
];

export function App() {
  const { selectedDemo, setSelectedDemo } = useDemosStore();

  // Re-rolled exactly when the demo changes — same commit as the morph key
  // change, so the freeze blends with the freshly picked filter. Each pick is
  // drawn from a shrinking pool (refilled from PAGE_MORPHS once empty), so
  // the filters cycle through the whole list before any repeats.
  const morphPool = useRef<MorphUse[]>([]);
  const pageMorph = useMemo(() => {
    if (morphPool.current.length === 0) morphPool.current = [...PAGE_MORPHS];
    const i = Math.floor(Math.random() * morphPool.current.length);
    return morphPool.current.splice(i, 1)[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the demo IS the re-roll trigger
  }, [selectedDemo]);

  useEffect(() => {
    bevy.selectScene(selectedDemo.scene ?? null);
  }, [selectedDemo]);

  useEffect(() => {
    const byLabel = (label: string) => {
      const demo = findDemoByLabel(DEMOS, label);
      if (demo) setSelectedDemo(demo);
    };
    setNavigate(byLabel);
    return bevy.on("debug.selectDemo", ({ label }) => byLabel(label));
  }, [setSelectedDemo]);

  return (
    <node style={rootStyle}>
      <Navigation />

      <node
        style={{
          ...contentStyle,
          morphFilter: { key: selectedDemo.label, ...pageMorph },
        }}
        scrollStep={100}
      >
        <node style={contentInnerStyle}>
          <HeaderCard />
          {selectedDemo.component && <selectedDemo.component />}
        </node>
      </node>

      <ExampleModal />
    </node>
  );
}

const rootStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "row",
};

const contentStyle: BevyStyle = {
  flexGrow: 1,
  height: "100%",
  flexDirection: "column",
  alignItems: "flexStart",
  overflowY: "scroll",
  overflowX: "scroll",
  scrollbar: Scrollbar,
  transition: {
    scroll: { duration: 200, easing: "easeOut" },
    morphFilter: { duration: 300, easing: "linear" },
  },
};

const contentInnerStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
  padding: 24,
  minWidth: "100%",
};
