import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { DocsFold, PageSwitch, Responsiveness, Scrollbar } from "@/theme";
import { DEMO_ORDER, DEMOS, demoSlug, findDemo } from "./demos";
import { Navigation } from "./Navigation";
import { HeaderCard } from "./HeaderCard";
import { ExampleModal } from "./ExampleModal";
import { TopBar } from "./TopBar";
import { useWindowSize } from "./hooks/useWindowSize";
import { useDemosStore } from "./demosStore";
import { useExplanationStore } from "./explanationStore";
import { useContentWidth, useIsMobile } from "./hooks";

export function App() {
  const win = useWindowSize();

  // Gate on a real viewport, not on truthiness: `useWindowSize` starts at
  // 0×0 rather than null, so `!win` never fired and the shell spent its first
  // frames laid out as if it were on a phone (0 < the compact breakpoint).
  if (win.width === 0) {
    return null;
  }

  return <Shell />;
}

function Shell() {
  const { selectedDemo, setSelectedDemo } = useDemosStore();
  const columnWidth = useContentWidth();
  const headerTitle = useExplanationStore((s) => s.pageDefault?.title);

  const isMobile = useIsMobile();

  // Compact-only: the nav drawer's open state. Crossing the breakpoint (a
  // desktop resize) resets it — the regular shell has no drawer.
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => setNavOpen(false), [isMobile]);
  const closeNav = useCallback(() => setNavOpen(false), []);

  // The page switch is a sweep of light in the direction the nav moved:
  // down the list sweeps down, up sweeps up. Decided in the same commit as
  // the morph key change, so the freeze blends with the right direction.
  const prevDemo = useRef(selectedDemo);
  const sweepAngle = useMemo(() => {
    const down =
      DEMO_ORDER.indexOf(selectedDemo) >= DEMO_ORDER.indexOf(prevDemo.current);
    prevDemo.current = selectedDemo;
    return down ? 180 : 0;
  }, [selectedDemo]);

  // The 3D scene dips through the backdrop on the page switch's own timing,
  // so world and page land together. The first selection snaps, like the
  // morph's first mount: there is nothing to dip from.
  const sceneSelected = useRef(false);
  useEffect(() => {
    bevy.selectScene({
      scene: selectedDemo.scene ?? null,
      transition: sceneSelected.current ? PageSwitch : undefined,
    });
    sceneSelected.current = true;
  }, [selectedDemo]);

  // Web: mirror the demo into `?page=<slug>`, so the address bar is always a
  // link to it (the docs site deep-links the same way).
  useEffect(() => {
    if (typeof history === "undefined") return;
    const search =
      selectedDemo === DEMOS[0] ? "" : `?page=${demoSlug(selectedDemo.label)}`;
    history.replaceState(null, "", location.pathname + search);
  }, [selectedDemo]);

  useEffect(
    () =>
      bevy.on("debug.selectDemo", ({ label }) => {
        const demo = findDemo(DEMOS, (d) => d.label === label);
        if (demo) setSelectedDemo(demo);
      }),
    [setSelectedDemo],
  );

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
          morphFilter: {
            key: selectedDemo.label,
            name: "lightSweep",
            params: { angle: sweepAngle },
          },
        }}
        scrollStep={100}
      >
        <node
          style={{
            ...contentInnerStyle,
            ...(isMobile && contentInnerMobileStyle),
            width: columnWidth,
          }}
        >
          <HeaderCard />
          {selectedDemo.component && (
            // The examples glide when the docs above them fold. Never on a
            // page switch: the wrapper is fresh per page (a first layout is
            // adopted silently), and the glide arms only once the header
            // shows this page — it registers a commit after the page mounts,
            // possibly a Bevy frame later.
            <node
              key={selectedDemo.label}
              style={{
                ...bodyStyle,
                ...(isMobile && bodyMobileStyle),
                ...(headerTitle === selectedDemo.label && {
                  transition: { layout: DocsFold },
                }),
              }}
            >
              <selectedDemo.component />
            </node>
          )}
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

// The scroll area; the column inside is centred and padded on its own, so
// the padding scrolls with the content.
const contentStyle: BevyStyle = {
  flexGrow: 1,
  height: "100%",
  flexDirection: "column",
  alignItems: "center",
  overflowY: "scroll",
  scrollbar: Scrollbar,
  transition: {
    scroll: { duration: 200, easing: "easeOut" },
    morphFilter: PageSwitch,
  },
};

// Centred: the docs and the examples below them share one centre line.
const contentInnerStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 28,
  boxSizing: "contentBox",
  padding: {
    horizontal: Responsiveness.contentPadding,
    top: Responsiveness.contentPadding + 8,
    bottom: Responsiveness.contentPadding * 2,
  },
};

const contentInnerMobileStyle: BevyStyle = {
  padding: {
    horizontal: Responsiveness.contentPaddingMobile,
    top: 20,
    bottom: 40,
  },
  gap: 16,
};

// The page's own content, laid out as if straight in the column above.
const bodyStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  alignSelf: "stretch",
  gap: contentInnerStyle.gap,
};

const bodyMobileStyle: BevyStyle = { gap: contentInnerMobileStyle.gap };
