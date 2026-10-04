import { useEffect, useState, type PropsWithChildren } from "react";
import { interpolate, useSharedValue, withDelay, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, Filters, Fonts, FontSizes, Responsiveness } from "@/theme";
import { useDemoPage } from "@/explanationStore";
import { useIsMobile, useWindowSize } from "@/hooks";
import { Beats, FLIGHT_MS, GROW_DELAY_MS } from "./beats";
import { Card } from "./Card";
import { Logos } from "./Logos";
import { PAGE_PADDING_MOBILE, PanelCaption } from "./shared";
import { useHomeStore } from "./store";
import { slotStyle, Tile } from "./Tile";
import { TILE_HEIGHT, TILE_WIDTH, TILES } from "./tiles";
import { Title } from "./Title";

/** Wait after a flight lands before whole-pixel layout returns: the re-round
 * must never land on a moving frame (the contents land `GROW_DELAY_MS` late). */
const ROUNDING_SETTLE_MS = 90;

const MAX_COLUMNS = 3;
const GRID_GAP = 16;
const PAGE_PADDING = 28;
/** The page card's hairline rim (desktop), inside its box like its padding. */
const PAGE_BORDER = 1;

type Grid = { columns: number; width: number; height: number };

/** As many columns as fit (up to `MAX_COLUMNS`), and the rows that takes. The
 * page card hugs this box and the panel fills it. */
function gridGeometry(available: number): Grid {
  const fits = Math.floor((available + GRID_GAP) / (TILE_WIDTH + GRID_GAP));
  const columns = Math.min(MAX_COLUMNS, Math.max(1, fits));
  const rows = Math.ceil(TILES.length / columns);
  return {
    columns,
    width: TILE_WIDTH * columns + GRID_GAP * (columns - 1),
    height: TILE_HEIGHT * rows + GRID_GAP * (rows - 1),
  };
}

/** The landing page: logos + title + a wall of six live vignettes. Clicking a
 * tile flies it to the centre on a `sharedTag` while the rest fade; Back
 * reverses the flight. Every animation here is a feature of the library. */
export function Home() {
  useDemoPage(null);
  const isMobile = useIsMobile();
  const win = useWindowSize();

  // Render-time reset, not an effect: an effect would commit the stale panel
  // first, and its unmount plus the wall tile's mount would pair as a stray
  // `sharedTag` flight on page entry.
  useState(() => useHomeStore.getState().reset());

  const selectedItem = useHomeStore((s) => s.selectedItem);
  const previousSelectedItem = useHomeStore((s) => s.previousSelectedItem);
  const settle = useHomeStore((s) => s.settle);

  const contentPadding = Responsiveness.contentPadding;
  const grid = gridGeometry(
    win.width -
      Responsiveness.navWidth -
      (contentPadding + PAGE_PADDING + PAGE_BORDER) * 2,
  );
  const tile = TILES.find((t) => t.id === selectedItem) ?? null;

  // Deliberately a beat late: a settle on the landing frame would re-round
  // exactly where the eye is still following the card.
  useEffect(() => {
    if (previousSelectedItem === null) return;
    const id = setTimeout(
      () => settle(previousSelectedItem),
      FLIGHT_MS + GROW_DELAY_MS + ROUNDING_SETTLE_MS,
    );
    return () => clearTimeout(id);
  }, [previousSelectedItem, settle]);

  return (
    // `minHeight`, never `height`: a fixed box too small for its centred
    // content overflows upwards and the card top becomes unreachable. `win` is
    // 0×0 until the host answers, hence the floor.
    <node
      style={
        isMobile
          ? viewportStyle
          : {
              ...viewportStyle,
              justifyContent: "center",
              minHeight: Math.max(600, win.height - contentPadding * 2),
            }
      }
    >
      <node
        style={{
          ...pageStyle,
          ...(isMobile
            ? pageMobileStyle
            : {
                ...pageDesktopStyle,
                width: grid.width + (PAGE_PADDING + PAGE_BORDER) * 2,
              }),
        }}
      >
        <Logos />
        <Title />
        <Reveal delay={Beats.tagline}>
          {/* Each side in its own light: Bevy's ember, React's cyan. */}
          <text style={taglineStyle}>
            Build <text style={taglineBevyStyle}>bevy_ui</text> interfaces with{" "}
            <text style={taglineReactStyle}>React</text> — no web view, no DOM.
          </text>
        </Reveal>

        <node
          style={
            isMobile
              ? stageMobileStyle
              : { ...stageStyle, width: grid.width, height: grid.height }
          }
        >
          {/* Desktop: the panel is a second Card, paired by `sharedTag`. On a
              phone the tile itself expands (`Wall`). */}
          {tile && !isMobile && <Card tile={tile} expanded size={grid} />}
          <Wall grid={grid} />
        </node>

        <Reveal delay={Beats.hint}>
          <PanelCaption>
            {isMobile
              ? "Browse the demos from the menu for more."
              : "Browse the demos in the sidebar for more."}
          </PanelCaption>
        </Reveal>
      </node>
    </node>
  );
}

function Wall({ grid }: { grid: Grid }) {
  const isMobile = useIsMobile();
  const selectedItem = useHomeStore((s) => s.selectedItem);
  const previousSelectedItem = useHomeStore((s) => s.previousSelectedItem);
  const opened = useHomeStore((s) => s.opened);
  // Desktop only: on a phone the selected tile expands in place.
  const overlay = !isMobile && selectedItem !== null;
  const fade = useSharedValue(opened ? 0 : 1);

  useEffect(() => {
    fade.value = withTiming(overlay ? 0 : 1, {
      duration: FLIGHT_MS,
      easing: "easeOut",
    });
  }, [overlay, fade]);

  return (
    <node
      style={{
        ...(isMobile
          ? wallMobileStyle
          : { ...wallStyle, width: grid.width, height: grid.height }),
        ...(overlay ? overlayStyle : {}),
      }}
    >
      {TILES.map((t) =>
        isMobile ? (
          <Tile key={t.id} tile={t} expanded={selectedItem === t.id} />
        ) : (
          // The tile in flight is travelling, not appearing: it skips the fade.
          <node
            key={t.id}
            style={
              t.id === previousSelectedItem
                ? { transform: { scale: 1 } }
                : {
                    opacity: { animated: fade },
                    transform: {
                      scale: { animated: interpolate(fade, [0, 1], [0.7, 1]) },
                    },
                  }
            }
          >
            {selectedItem === t.id ? (
              <node style={slotStyle} />
            ) : (
              <Tile tile={t} />
            )}
          </node>
        ),
      )}
    </node>
  );
}

function Reveal({ delay, children }: PropsWithChildren<{ delay: number }>) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: "easeOut" }),
    );
  }, [v, delay]);

  return (
    <node
      style={{
        flexDirection: "column",
        alignItems: "center",
        opacity: { animated: v },
        transform: {
          translateY: { animated: interpolate(v, [0, 1], [16, 0]) },
        },
      }}
    >
      {children}
    </node>
  );
}

const viewportStyle: BevyStyle = {
  width: "100%",
  flexDirection: "column",
  alignItems: "center",
};

const pageStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 14,
  padding: PAGE_PADDING,
  borderRadius: 22,
  backgroundColor: "rgba(0, 0, 0, 0.3)",
};

/** Desktop only: the frost is an always-dirty chain (its source is the live
 * 3D frame), which a phone has no budget for. */
const pageDesktopStyle: BevyStyle = {
  border: PAGE_BORDER,
  borderColor: Colors.line,
  backdropFilter: Filters.backdrop,
};

const pageMobileStyle: BevyStyle = {
  width: "100%",
  padding: PAGE_PADDING_MOBILE,
  gap: 10,
};

const stageStyle: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
};

const stageMobileStyle: BevyStyle = {
  width: "100%",
  alignItems: "center",
};

const wallStyle: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: GRID_GAP,
  justifyContent: "center",
  // Wrapped lines are placed by `alignContent`, not `alignItems`.
  alignContent: "center",
};

const wallMobileStyle: BevyStyle = {
  width: "100%",
  flexDirection: "column",
  alignItems: "stretch",
  gap: GRID_GAP,
};

/** Out of flow over the stage, centring its content where it was in flow, so
 * the incoming panel lays out as if the wall had gone. */
const overlayStyle: BevyStyle = {
  positionType: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
};

const taglineStyle: BevyStyle = {
  color: Colors.textBody,
  fontSize: FontSizes.lg,
  fontWeight: "medium",
  textAlign: "center",
};

// Spans take element defaults for unset fields — each restates its face.
const taglineReactStyle: BevyStyle = {
  fontSize: FontSizes.lg,
  fontWeight: "semibold",
  color: Colors.cyan,
};

/** An identifier: the mono face, a step smaller (it reads larger than Inter). */
const taglineBevyStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.base,
  fontWeight: "medium",
  color: Colors.ember,
};
