import { memo, useEffect, useRef, useState } from "react";
import { BevyStyle, BevyTransition } from "bevy-react/jsx";
import {
  Colors,
  Fonts,
  FontSizes,
  Gradients,
  PageSwitch,
  Responsiveness,
  Scrollbar,
} from "@/theme";
import {
  ChevronDownIcon,
  CircularButton,
  CloseIcon,
  Pinchable,
} from "@/components";
import { Title } from "./Title";
import { DEMOS, type DemoItem } from "./demos";
import { useDemosStore } from "./demosStore";
import { useIsMobile } from "./hooks";

type NavigationProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * The gallery nav. Regular shell: the left column, sliding in once at
 * startup. Compact shell: the same column as an overlay drawer — off-screen
 * until the top bar's menu button opens it, closed by the × button, the
 * scrim (in `App`), or selecting a page (the page switches at once and the
 * drawer slides out over it).
 *
 * The active row's highlight is ONE pill that flies from row to row: each
 * row mounts its own pill only while active, and the shared `sharedTag`
 * pairs the unmounting pill with the mounting one in the same commit — the
 * engine's shared-element flight does the rest. Nothing it flies through may
 * clip it: the pill sits beside the row's press layer (a layer only paints
 * within its own bounds), and an expanded section stops clipping its rows.
 */
export const Navigation = memo(function Navigation({
  open,
  onClose,
}: NavigationProps) {
  const { selectedDemo, setSelectedDemo } = useDemosStore();
  const entered = useSlideIn();
  const isMobile = useIsMobile();
  const shown = isMobile ? open : entered;

  // A breakpoint crossing (desktop resize, phone rotation) swaps the nav
  // between the row flow and the overlay: the commit that swaps must SNAP
  // the transform — easing it would leave an empty nav-wide strip (→ regular)
  // or a slide-out over already full-width content (→ isMobile).
  const prevIsMobile = useRef(isMobile);
  const crossing = prevIsMobile.current !== isMobile;
  useEffect(() => {
    prevIsMobile.current = isMobile;
  }, [isMobile]);

  const select = (demo: DemoItem) => {
    setSelectedDemo(demo);
    if (isMobile) onClose();
  };

  // `opacity` only in regular mode: its presence promotes the subtree to a
  // layer, and a closed (off-screen) drawer would keep re-capturing on every
  // hover for nothing.
  const transition: BevyTransition = crossing
    ? {}
    : isMobile
      ? { transform: { duration: DRAWER_MS, easing: "easeOut" } }
      : {
          opacity: { duration: 800, easing: "easeOut" },
          transform: { duration: 800, easing: "easeOut" },
        };

  return (
    <node
      style={{
        ...navStyle,
        ...(isMobile ? drawerStyle : { opacity: entered ? 1 : 0 }),
        transform: { translateX: shown ? 0 : -NAV_SLIDE_PX },
        transition,
      }}
    >
      {isMobile && (
        <node style={closeStyle}>
          <CircularButton size={32} onClick={onClose}>
            <CloseIcon size={18} />
          </CircularButton>
        </node>
      )}
      {/* The logo with the wordmark under it. The compact shell's top bar
          carries the wordmark, so the drawer shows the logo alone — one
          wordmark mount, one morph. */}
      <node style={brandStyle}>
        <image src="bevy-react-logo.png" style={logoStyle} />
        {!isMobile && <Title />}
      </node>
      <node style={itemsStyle} scrollStep={40}>
        {DEMOS.map((item) =>
          item.children ? (
            <Section
              key={item.label}
              item={item}
              selected={selectedDemo}
              onSelect={select}
            />
          ) : (
            <Row
              key={item.label}
              label={item.label}
              active={item === selectedDemo}
              onPress={() => select(item)}
            />
          ),
        )}
      </node>
    </node>
  );
});

// The sidebar's startup entrance: the first commit must reach Bevy *before*
// the settled style, or the transition arms on a node it has never seen and
// snaps. React's passive effects can land in the same Bevy frame as the mount
// (the JS thread runs ahead of the app thread), so the flip waits a beat.
function useSlideIn() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(id);
  }, []);
  return entered;
}

// How far left the sidebar starts — its own width plus enough slack to carry
// the drop shadow off-screen with it.
const NAV_WIDTH = Responsiveness.navWidth;
const NAV_SLIDE_PX = NAV_WIDTH + 40;
// Drawer open/close slide (compact shell); the 800ms is the desktop entrance.
const DRAWER_MS = 250;
// One row's height, and the gap between rows: a section's expanded height.
const ROW_PX = 32;
const ROW_GAP = 2;
// A section's fold/unfold ease.
const FOLD_MS = 300;

type SectionProps = {
  item: DemoItem;
  selected: DemoItem;
  onSelect: (item: DemoItem) => void;
};

/** A nav group: a small label that folds its rows away. */
function Section({ item, selected, onSelect }: SectionProps) {
  const [expanded, setExpanded] = useState(item.expandedByDefault ?? false);
  const children = item.children ?? [];
  const holdsActive = children.includes(selected);

  // The fold animates `maxHeight`, which needs the rows clipped — but a
  // clipping section would also cut the nav pill off as it flies in from
  // another section. So it clips while folded or folding, and lets go once
  // an unfold has finished.
  const [unfolded, setUnfolded] = useState(expanded);
  useEffect(() => {
    if (!expanded) {
      setUnfolded(false);
      return;
    }
    const id = setTimeout(() => setUnfolded(true), FOLD_MS);
    return () => clearTimeout(id);
  }, [expanded]);

  return (
    <node style={{ flexDirection: "column", margin: { top: 10 } }}>
      <Pinchable params={ROW_PINCH} shadow={null}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={sectionStyle}
          hoverStyle={sectionHoverStyle}
        >
          <text
            style={{
              ...sectionLabelStyle,
              color: holdsActive ? Colors.text : Colors.textDim,
            }}
          >
            {item.label}
          </text>
          <node
            style={{
              transform: { rotate: expanded ? 0 : -90 },
              transition: { transform: { duration: 200, easing: "easeOut" } },
            }}
          >
            <ChevronDownIcon size={14} color={Colors.textDim} />
          </node>
        </button>
      </Pinchable>
      <node
        style={{
          ...sectionRowsStyle,
          maxHeight: expanded ? children.length * (ROW_PX + ROW_GAP) + 4 : 0,
          overflowY: expanded && unfolded ? "visible" : "clip",
        }}
      >
        {children.map((child) => (
          <Row
            key={child.label}
            label={child.label}
            active={child === selected}
            // A row folded away can't be chosen mid-collapse.
            onPress={() => expanded && onSelect(child)}
          />
        ))}
      </node>
    </node>
  );
}

type RowProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

/** One page link. Element pages (`<node>`) set in the mono face. The pill
 *  is the row's first child, BESIDE the press layer, so it paints under the
 *  label and flies unclipped. */
function Row({ label, active, onPress }: RowProps) {
  const isTag = label.startsWith("<");
  return (
    <node style={rowWrapStyle}>
      {active && (
        <node sharedTag="nav-active" style={pillStyle}>
          <node style={pillBarStyle} />
        </node>
      )}
      <Pinchable params={ROW_PINCH} shadow={null}>
        <button
          onClick={onPress}
          style={rowStyle}
          hoverStyle={active ? undefined : rowHoverStyle}
        >
          <text
            style={{
              ...(isTag ? rowTagLabelStyle : rowLabelStyle),
              color: active ? Colors.text : ROW_TEXT,
            }}
          >
            {label}
          </text>
        </button>
      </Pinchable>
    </node>
  );
}

const ROW_TEXT = "#a3a9b6";
const ROW_PINCH = { strength: 0.18, radius: 0.5 };

const navStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  width: NAV_WIDTH,
  height: "100%",
  backgroundColor: "#0c0d11",
  backgroundGradient: Gradients.navBackdrop,
  border: { right: 1 },
  borderColor: Colors.line,
  zIndex: 100,
  boxShadow: { blurRadius: 30, color: "#00000099" },
};

// Compact: out of the row flow, pinned to the left edge over the content.
const drawerStyle: BevyStyle = {
  positionType: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
};

const closeStyle: BevyStyle = {
  positionType: "absolute",
  top: 14,
  right: 10,
  zIndex: 1,
};

const brandStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: { horizontal: 16, top: 22, bottom: 18 },
  border: { bottom: 1 },
  borderColor: Colors.line,
};

// The composite logo pair is 450×250.
const logoStyle: BevyStyle = {
  width: 150,
  height: 83,
};

const itemsStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  flexGrow: 1,
  minHeight: 0,
  gap: ROW_GAP,
  padding: { left: 12, right: 14, top: 12, bottom: 24 },
  overflowY: "scroll",
  scrollbar: Scrollbar,
  transition: { scroll: { duration: 200, easing: "easeOut" } },
  globalZIndex: 20,
};

const sectionStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
  width: "100%",
  height: 30,
  padding: { horizontal: 10 },
  borderRadius: 8,
  cursor: "pointer",
  focusPolicy: "pass",
};

const sectionHoverStyle: BevyStyle = {
  backgroundColor: Colors.hover,
};

const sectionLabelStyle: BevyStyle = {
  fontSize: FontSizes.xs,
  fontWeight: "semibold",
  letterSpacing: 0.8,
};

// The guide line down the left of a section's rows.
const sectionRowsStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  gap: ROW_GAP,
  margin: { left: 12 },
  padding: { left: 6 },
  border: { left: 1 },
  borderColor: Colors.line,
  transition: { size: { duration: FOLD_MS, easing: "easeOut" } },
};

const rowWrapStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
};

const rowStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  height: ROW_PX,
  padding: { horizontal: 12 },
  borderRadius: 8,
  cursor: "pointer",
  focusPolicy: "pass",
};

const rowHoverStyle: BevyStyle = {
  backgroundColor: Colors.hover,
};

const rowLabelStyle: BevyStyle = {
  fontSize: FontSizes.sm,
  fontWeight: "medium",
};

const rowTagLabelStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.code - 0.5,
};

// The active row's lit pill: a cyan wash with a glowing bar at its left
// edge. It fills the row behind the label and flies between rows (see
// `Navigation`) in step with the page's light sweep; the bar rides along.
const pillStyle: BevyStyle = {
  positionType: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 8,
  backgroundColor: "#122029",
  transition: { sharedElement: PageSwitch },
  globalZIndex: 1,
};

const pillBarStyle: BevyStyle = {
  positionType: "absolute",
  left: 0,
  top: 2,
  bottom: 2,
  width: 3,
  borderRadius: 2,
  backgroundColor: Colors.cyan,
  boxShadow: { blurRadius: 10, color: Colors.cyanGlow },
};
