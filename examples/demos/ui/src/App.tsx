import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Scrollbar } from "@/theme";
import { DEMOS, findDemoByLabel } from "./demos";
import { Navigation } from "./Navigation";
import { HeaderCard } from "./HeaderCard";
import { ExampleModal } from "./ExampleModal";
import { TopBar } from "./TopBar";
import { useWindowSize } from "./hooks/useWindowSize";
import { useDemosStore } from "./demosStore";
import { setNavigate } from "./demoNavigation";
import type { MorphUse } from "./demos/styling/morphFilterDemo/params";
import { useIsMobile } from "./hooks";

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
  const win = useWindowSize();

  if (!win) {
    return null;
  }

  return <Shell />;
}

function Shell() {
  const { selectedDemo, setSelectedDemo } = useDemosStore();

  const isMobile = useIsMobile();

  // Compact-only: the nav drawer's open state. Crossing the breakpoint (a
  // desktop resize) resets it — the regular shell has no drawer.
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => setNavOpen(false), [isMobile]);
  const closeNav = useCallback(() => setNavOpen(false), []);

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
    <node style={isMobile ? rootCompactStyle : rootStyle}>
      {isMobile && <TopBar onMenu={() => setNavOpen(true)} />}
      {/* First in the row (regular: the left column); compact positions it
          absolutely, so order is irrelevant there and zIndex stacks it. */}
      <Navigation open={navOpen} onClose={closeNav} />

      <node
        style={{
          ...contentStyle,
          // A column child: take what the bar leaves, never the bar's share.
          ...(isMobile ? { height: undefined, minHeight: 0 } : {}),
          morphFilter: { key: selectedDemo.label, ...pageMorph },
        }}
        scrollStep={100}
      >
        <node
          style={{
            ...contentInnerStyle,
            ...(isMobile && contentInnerMobileStyle),
          }}
        >
          <HeaderCard />
          {selectedDemo.component && <selectedDemo.component />}
        </node>
      </node>

      {/* Tap outside the open drawer to close it. Mounted only while open:
          a transparent node would still swallow the page's clicks. */}
      {isMobile && navOpen && <node style={scrimStyle} onClick={closeNav} />}

      <ExampleModal />
    </node>
  );
}

const rootStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "row",
};

// Compact: top bar over the content column; the nav is an absolute overlay.
const rootCompactStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "column",
};

// Between the content (below) and the drawer (`zIndex: 100`).
const scrimStyle: BevyStyle = {
  positionType: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 90,
  backgroundColor: "rgba(0, 0, 0, 0.55)",
};

const contentStyle: BevyStyle = {
  flexGrow: 1,
  height: "100%",
  flexDirection: "column",
  alignItems: "flexStart",
  overflowY: "scroll",
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
  width: "100%",
  padding: 24,
};

const contentInnerMobileStyle: BevyStyle = {
  padding: 5,
  gap: 10,
};
