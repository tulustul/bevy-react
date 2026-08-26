import { memo, useEffect, useRef, useState } from "react";
import { BevyStyle, BevyTransition } from "bevy-react/jsx";
import { Colors, FontSizes, Gradients, Scrollbar } from "@/theme";
import { Button, CloseIcon, IconButton, Pinchable } from "@/components";
import { NAV_WIDTH } from "./layoutMode";
import { DEMOS, type DemoItem } from "./demos";
import { useDemosStore } from "./demosStore";

type NavigationProps = {
  /** Compact shell: the nav is an overlay drawer driven by `open`. */
  compact: boolean;
  open: boolean;
  onClose: () => void;
};

/**
 * The gallery nav. Regular shell: the left column, sliding in once at
 * startup. Compact shell: the same column as an overlay drawer — off-screen
 * until the top bar's menu button opens it, closed by the × button, the
 * scrim (in `App`), or selecting a page (the page switches at once and the
 * drawer slides out over it).
 */
export const Navigation = memo(function Navigation({
  compact,
  open,
  onClose,
}: NavigationProps) {
  const { selectedDemo, setSelectedDemo } = useDemosStore();
  const entered = useSlideIn();
  const shown = compact ? open : entered;

  // A breakpoint crossing (desktop resize, phone rotation) swaps the nav
  // between the row flow and the overlay: the commit that swaps must SNAP
  // the transform — easing it would leave an empty nav-wide strip (→ regular)
  // or a slide-out over already full-width content (→ compact).
  const prevCompact = useRef(compact);
  const crossing = prevCompact.current !== compact;
  useEffect(() => {
    prevCompact.current = compact;
  }, [compact]);

  const select = (demo: DemoItem) => {
    setSelectedDemo(demo);
    if (compact) onClose();
  };

  // `opacity` only in regular mode: its presence promotes the subtree to a
  // layer, and a closed (off-screen) drawer would keep re-capturing on every
  // Title morph / hover for nothing.
  const transition: BevyTransition = crossing
    ? {}
    : compact
      ? { transform: { duration: DRAWER_MS, easing: "easeOut" } }
      : {
          opacity: { duration: 800, easing: "easeOut" },
          transform: { duration: 800, easing: "easeOut" },
        };

  return (
    <node
      style={{
        ...navStyle,
        ...(compact ? drawerStyle : { opacity: entered ? 1 : 0 }),
        transform: { translateX: shown ? 0 : -NAV_SLIDE_PX },
        transition,
      }}
    >
      {compact && (
        <IconButton size={32} style={closeStyle} onClick={onClose}>
          <CloseIcon size={20} />
        </IconButton>
      )}
      <image src="bevy-react-logo.png" style={{ width: 150 }} />
      <Title />
      <node style={itemsStyle} scrollStep={40}>
        {DEMOS.map((demo, index) => (
          <Item
            key={index}
            item={demo}
            selectedItem={selectedDemo}
            onSelected={select}
          />
        ))}
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
const NAV_SLIDE_PX = NAV_WIDTH + 40;
// Drawer open/close slide (compact shell); the 800ms is the desktop entrance.
const DRAWER_MS = 250;

const title = "bevy-react";
const titleDelay = 7000;

// The library title dusts away from time to time — or on click — and blows
// back in. The
// text stays mounted (opacity toggle) so the wrapper keeps its layout size —
// a morph snapshot is layout-anchored, and a collapsing wrapper would
// stretch the frozen image; the key flip freezes the old appearance and
// dustify blends it with the (now invisible / visible) live content.
function Title() {
  const [text, setText] = useState(title);
  const toggle = () => setText(text === title ? "Demos" : title);

  // The ambient flip; a click-triggered toggle re-arms it (effect deps on
  // `text`), so the next automatic morph is always a full delay away.
  useEffect(() => {
    const delay = titleDelay + Math.random() * titleDelay;
    const id = setTimeout(toggle, delay);
    return () => clearTimeout(id);
    // Deliberately keyed on `text` only: `toggle` is recreated every render,
    // and listing it would re-arm the timer on unrelated re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Pinchable
      style={{ width: "100%" }}
      params={{ strength: 0.28, radius: 0.48 }}
      filters={[
        {
          name: "gradientMap",
          params: {
            stops: [{ color: "#caf9afff" }, { color: "#c72e00ff" }],
          },
        },
      ]}
    >
      <node
        onClick={toggle}
        style={{
          cursor: "pointer",
          morphFilter: {
            key: text,
            name: "dustify",
            params: {
              direction: 0,
              softness: 180,
              turbulence: 0.6,
              wind: 0,
              drift: 30,
              grain: 4,
            },
          },
          transition: { morphFilter: { duration: 2000, easing: "linear" } },
          width: "100%",
        }}
      >
        <text style={{ ...titleStyle }}>{text}</text>
      </node>
    </Pinchable>
  );
}

type ItemProps = {
  item: DemoItem;
  selectedItem: DemoItem;
  isChild?: boolean;
  onSelected: (item: DemoItem) => void;
};

function Item({ item, selectedItem, isChild, onSelected }: ItemProps) {
  const [expanded, setExpanded] = useState(item.expandedByDefault ?? false);

  function onPress() {
    if (item.children?.length) {
      setExpanded(!expanded);
    } else if (item.component) {
      onSelected(item);
    }
  }

  function onChildSelected(item: DemoItem) {
    if (expanded) {
      onSelected(item);
    }
  }

  return (
    <node style={{ flexDirection: "column" }}>
      <ItemButton
        isActive={item.label === selectedItem.label}
        isExpanded={expanded}
        label={item.label}
        onPress={onPress}
        isChild={isChild ?? false}
        hasChildren={!!item.children?.length}
      />

      {item.children?.length ? (
        <node
          style={{
            flexDirection: "column",
            gap: 8,
            margin: { left: 15 },
            overflowY: "clip",
            maxHeight: expanded ? item.children.length * NAV_ITEM_PX : 0,
            transition: {
              size: { duration: 300, easing: "easeOut" },
            },
          }}
        >
          <node />
          {item.children.map((child, index) => (
            <Item
              key={index}
              item={child}
              isChild={true}
              onSelected={onChildSelected}
              selectedItem={selectedItem}
            />
          ))}
        </node>
      ) : null}
    </node>
  );
}

// Estimated height of one (leaf) submenu row — child button plus the column gap.
// A slight overshoot is fine (hidden by `overflowY: clip`); undershoot would clip
// the last row, so round up.
const NAV_ITEM_PX = 42;

type ItemButtonProps = {
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  isChild: boolean;
  hasChildren: boolean;
  onPress: () => void;
};
function ItemButton({
  isActive,
  isExpanded,
  isChild,
  hasChildren,
  label,
  onPress,
}: ItemButtonProps) {
  return (
    <Button
      onClick={onPress}
      style={{
        ...navButtonStyle,
        padding: isChild ? 6 : 12,
        backgroundGradient: isActive ? Gradients.primary : Gradients.surface,
      }}
      hoverStyle={{
        backgroundGradient: isActive
          ? Gradients.primary
          : Gradients.surfaceHover,
      }}
    >
      <node
        style={{
          justifyContent: "spaceBetween",
          alignItems: "center",
          width: "100%",
        }}
      >
        <text
          style={{
            color: isActive ? Colors.textColor400 : Colors.textColor100,
            fontSize: isChild ? FontSizes.sm : FontSizes.base,
            fontWeight: "bold",
            margin: { right: 10 },
          }}
        >
          {label}
        </text>
        {hasChildren && (
          <text
            style={{
              fontFamily: "Noto Sans Mono",
            }}
          >
            {isExpanded ? "-" : "+"}
          </text>
        )}
      </node>
    </Button>
  );
}

const navStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  width: NAV_WIDTH,
  height: "100%",
  gap: 8,
  padding: 10,
  backgroundColor: Colors.surface100,
  backgroundGradient: Gradients.navBackdrop,
  zIndex: 100,
  boxShadow: { blurRadius: 15, spreadRadius: 0, color: Colors.shadow100 },
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
  top: 6,
  right: 6,
};

const itemsStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  width: "100%",
  height: "100%",
  gap: 8,
  overflowY: "scroll",
  scrollbar: Scrollbar,
  transition: { scroll: { duration: 200, easing: "easeOut" } },
  padding: { right: 10 },
};

const titleStyle: BevyStyle = {
  fontFamily: "MetalMania",
  color: Colors.primary100,
  fontSize: 40,
  fontWeight: "bold",
  margin: { top: 0, right: 0, bottom: 12, left: 0 },
  width: "100%",
  textAlign: "center",
};

const navButtonStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "start",
  gap: 2,
  padding: 12,
  borderRadius: 8,
  width: "100%",
  cursor: "pointer",
};
