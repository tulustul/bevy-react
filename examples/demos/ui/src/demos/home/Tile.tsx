import { useEffect, useState } from "react";
import {
  interpolate,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { useIsMobile } from "@/hooks";
import { Beats, TILE_ENTER_MS, TILE_STAGGER_MS } from "./beats";
import { Card } from "./Card";
import { useHomeStore } from "./store";
import { type Tile as TileData, TILE_HEIGHT, TILE_WIDTH, TILES } from "./tiles";

const ENTER_RISE_PX = 24;
const ENTER_SCALE = 0.6;
/** Damping ratio ~0.64: settles in about the fade's duration, so both land together. */
const ENTER_SPRING = { stiffness: 200, damping: 18 };

/** One slot on the wall. It keeps its space whether or not the card is in it,
 * so the grid never re-flows behind a card in flight; everything visible
 * belongs to the card. The slot's only animation is the page's opening entrance. */
export function Tile({
  tile,
  expanded = false,
}: {
  tile: TileData;
  /** Phone only: the card shows its panel look, in this slot. */
  expanded?: boolean;
}) {
  const isMobile = useIsMobile();
  const entrance = useEntrance(tile);
  const slot = isMobile ? slotMobileStyle : slotStyle;
  return (
    <node
      style={
        entrance
          ? {
              ...slot,
              opacity: { animated: entrance.fade },
              transform: {
                translateY: {
                  animated: interpolate(
                    entrance.fade,
                    [0, 1],
                    [ENTER_RISE_PX, 0],
                  ),
                },
                scale: { animated: entrance.scale },
              },
            }
          : slot
      }
    >
      <Card tile={tile} expanded={expanded} />
    </node>
  );
}

/** The entrance's drivers, or `null` once landed (or when the page was already
 * opened). The bindings come OFF after landing: `opacity` is presence-promoted,
 * so leaving them would keep a composited layer per slot for the page's life.
 * The spring, the slower to settle, decides when via its completion callback. */
function useEntrance(tile: TileData) {
  const opened = useHomeStore((s) => s.opened);
  const [landed, setLanded] = useState(opened);
  const delay = Beats.tilesIn + TILES.indexOf(tile) * TILE_STAGGER_MS;
  const fade = useSharedValue(landed ? 1 : 0);
  const scale = useSharedValue(landed ? 1 : ENTER_SCALE);

  useEffect(() => {
    if (landed) return;
    fade.value = withDelay(
      delay,
      withTiming(1, { duration: TILE_ENTER_MS, easing: "easeOut" }),
    );
    scale.value = withDelay(delay, withSpring(1, ENTER_SPRING), () =>
      setLanded(true),
    );
  }, [fade, scale, delay, landed]);

  return landed ? null : { fade, scale };
}

export const slotStyle: BevyStyle = {
  width: TILE_WIDTH,
  height: TILE_HEIGHT,
};

/** A phone slot is as tall as its card (the card holds the `TILE_HEIGHT` floor). */
const slotMobileStyle: BevyStyle = {
  width: "100%",
};
