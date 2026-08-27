import { useEffect, useRef, useState } from "react";
import { BevyStyle, BevyTransition } from "bevy-react/jsx";
import { ChevronLeftIcon, SecondaryButton } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { useIsMobile } from "@/hooks";
import {
  flightTransition,
  GROW_DELAY_MS,
  GROW_MS,
  growTransition,
} from "./beats";
import { type ExpandPhase, ExpandPhaseProvider, Extra } from "./Extra";
import {
  CARD_PADDING,
  PanelCaption,
  Spacing,
  useCardContentWidth,
} from "./shared";
import { useHomeStore } from "./store";
import { type Tile as TileData, TILE_HEIGHT, tileTag } from "./tiles";

/** `Extra` caps for the footer (blurb + Back). Desktop is one `noWrap` line;
 * a phone blurb wraps to 2–4 lines. */
const FOOTER_MAX_HEIGHT = 100;
const FOOTER_MAX_HEIGHT_MOBILE = 200;
const FOOTER_PADDING_X = 5;

/** The card, at both ends of the flight: the wall tile (`expanded: false`) and
 * the centre panel (`expanded: true`). One component on purpose — the flight is
 * a `sharedTag` pair, so the incoming node's first frame must render EXACTLY
 * what the outgoing one showed, then ease into its own look (`useGrown`).
 * On a phone there is no flight: the wall's own card grows in place.
 *
 * The box flies on `sharedElement`; everything inside rides `growTransition`
 * (sizes as real layout, extras as `Extra`s). Not frosted: six always-dirty
 * `backdropFilter` chains at rest is a bill this wall does not need to pay. */
export function Card({
  tile,
  expanded,
  size,
}: {
  tile: TileData;
  expanded: boolean;
  /** The panel's box (the grid's), desktop only. */
  size?: { width: number; height: number };
}) {
  const isMobile = useIsMobile();
  const contentWidth = useCardContentWidth();
  const select = useHomeStore((s) => s.select);
  const deselect = useHomeStore((s) => s.deselect);
  const returning = useHomeStore((s) => s.previousSelectedItem === tile.id);
  const { grown, phase } = useGrown(expanded, returning);
  const Vignette = tile.vignette;

  const box: BevyStyle = expanded
    ? {
        ...panelStyle,
        ...(isMobile
          ? { minHeight: TILE_HEIGHT }
          : { ...panelDesktopStyle, width: size?.width, height: size?.height }),
      }
    : {
        ...tileStyle,
        ...(isMobile ? { minHeight: TILE_HEIGHT } : { height: "100%" }),
      };

  return (
    <ExpandPhaseProvider value={phase}>
      <node
        sharedTag={isMobile ? undefined : tileTag(tile.id)}
        onClick={expanded ? undefined : () => select(tile.id)}
        style={{
          ...cardStyle,
          ...box,
          transition: {
            ...(isMobile ? inPlaceTransition : flightTransition),
            transform: { duration: 300, easing: "easeOut" },
          },
          layoutRounding: !phase,
        }}
        hoverStyle={expanded ? undefined : hoverStyle}
      >
        <node style={isMobile ? contentsMobileStyle : contentsStyle}>
          <text style={{ ...labelStyle, color: tile.accent }}>
            {tile.label}
          </text>
          <node style={stageStyle}>
            <Vignette expanded={expanded} grown={grown} />
          </node>
          {(expanded || returning) && (
            <Extra
              grown={grown}
              maxHeight={
                isMobile ? FOOTER_MAX_HEIGHT_MOBILE : FOOTER_MAX_HEIGHT
              }
            >
              <node style={footerStyle}>
                <PanelCaption
                  style={
                    isMobile
                      ? // Explicit px width: see `useCardContentWidth`.
                        { width: contentWidth! - FOOTER_PADDING_X * 2 }
                      : blurbStyle
                  }
                >
                  {tile.blurb}
                </PanelCaption>
                <SecondaryButton
                  style={backStyle}
                  onClick={expanded ? deselect : undefined}
                >
                  <node style={backLabelStyle}>
                    <ChevronLeftIcon size={14} color={Colors.textColor100} />
                    <text style={backTextStyle}>Back</text>
                  </node>
                </SecondaryButton>
              </node>
            </Extra>
          )}
        </node>
      </node>
    </ExpandPhaseProvider>
  );
}

/** `grown` starts as the OTHER end's look (a panel mounts un-grown, a returning
 * tile mounts grown) and flips to the host's own after `GROW_DELAY_MS`, arming
 * every `growTransition` inside. `phase` names that movement for the vignettes;
 * on a phone a toggle of `expanded` after mount re-enters it. */
function useGrown(expanded: boolean, returning: boolean) {
  const [grown, setGrown] = useState(!expanded && returning);
  const [phase, setPhase] = useState<ExpandPhase>(() =>
    expanded ? "expanding" : returning ? "collapsing" : null,
  );
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setPhase(expanded ? "expanding" : "collapsing");
  }, [expanded]);
  useEffect(() => {
    if (grown === expanded) return;
    const id = setTimeout(() => setGrown(expanded), GROW_DELAY_MS);
    return () => clearTimeout(id);
  }, [grown, expanded]);
  useEffect(() => {
    if (phase === null) return;
    const id = setTimeout(() => setPhase(null), GROW_DELAY_MS + GROW_MS);
    return () => clearTimeout(id);
  }, [phase]);
  return { grown, phase };
}

const cardStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  borderRadius: 16,
  padding: CARD_PADDING,
};

const tileStyle: BevyStyle = {
  width: "100%",
  backgroundColor: "rgba(26, 27, 38, 0.85)",
  transform: { scale: 1 },
};

/** `focusPolicy: "block"` on the card itself, never on the contents: a blocking
 * CHILD shadows the card's own hover. */
const panelStyle: BevyStyle = {
  width: "100%",
  backgroundColor: "rgba(17, 17, 27, 0.72)",
  focusPolicy: "block",
};

const panelDesktopStyle: BevyStyle = {
  maxHeight: 450,
  globalZIndex: 10,
};

/** What eases on the in-place phone toggle, in place of the flight. */
const inPlaceTransition = {
  backgroundColor: growTransition,
} satisfies BevyTransition;

const hoverStyle: BevyStyle = {
  transform: { scale: 0.95 },
  cursor: "pointer",
};

/** No `gap`: the footer `Extra` must take zero room in the tile look. */
const contentsStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "column",
  alignItems: "stretch",
};

/** On a phone the floor lives here, not as `height: 100%` — that would resolve
 * against the card's `minHeight` and pin the contents while the footer opens. */
const contentsMobileStyle: BevyStyle = {
  width: "100%",
  minHeight: TILE_HEIGHT - CARD_PADDING * 2,
  flexDirection: "column",
  alignItems: "stretch",
};

const labelStyle: BevyStyle = {
  fontSize: FontSizes.xl,
  fontWeight: "bold",
  textAlign: "center",
  margin: { bottom: Spacing.label },
};

/** Plain node, no `layout` channel: its rect is driven by the card's size
 * flight every frame, which a FLIP channel cannot attribute. */
const stageStyle: BevyStyle = {
  flexGrow: 1,
  alignItems: "center",
  justifyContent: "center",
};

const footerStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: Spacing.footerGap,
  padding: { top: Spacing.footer, bottom: 4, horizontal: FOOTER_PADDING_X },
};

const blurbStyle: BevyStyle = {
  lineBreak: "noWrap",
};

const backStyle: BevyStyle = {
  padding: { horizontal: 14, vertical: 6 },
};

const backLabelStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
};

const backTextStyle: BevyStyle = {
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};
