import { useEffect } from "react";
import {
  interpolate,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "bevy-react";
import { CARD_H, CARD_W, CardFront, Diamond, editionFilter } from "./Card";
import { CARDS, type CardDef } from "./cards";
import { Colors, Fonts, GILT } from "./theme";

const COLUMNS = 5;
const GAP = 22;

/** Every card of the deck: owned ones alive (their 3D worlds render only
 *  while they're on screen), the rest still sealed in shadow. */
export function Grimoire({
  owned,
  width,
  height,
  onInspect,
}: {
  owned: Record<string, number>;
  width: number;
  height: number;
  onInspect: (card: CardDef) => void;
}) {
  const rows = Math.ceil(CARDS.length / COLUMNS);
  const u = Math.min(
    (width - 120 - GAP * (COLUMNS - 1)) / (CARD_W * COLUMNS),
    (height - 250 - GAP * (rows - 1)) / (CARD_H * rows),
    0.75,
  );
  const sway = useSharedValue(0);
  useEffect(() => {
    sway.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: "easeInOut" }),
        withTiming(-1, { duration: 3000, easing: "easeInOut" }),
      ),
    );
  }, [sway]);
  const tilt = interpolate(sway, [-1, 1], [-30, 30]);

  const found = CARDS.filter((c) => owned[c.id]).length;
  return (
    <node
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        padding: { top: 104 },
        gap: 22,
      }}
    >
      <node style={{ flexDirection: "column", alignItems: "center", gap: 8 }}>
        <text
          style={{
            fontFamily: Fonts.display,
            fontSize: 13,
            letterSpacing: 7,
            color: Colors.gold,
          }}
        >
          THE GRIMOIRE
        </text>
        <node
          style={{
            width: 220,
            height: 3,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <node
            style={{
              width: `${(found / CARDS.length) * 100}%`,
              height: "100%",
              borderRadius: 2,
              backgroundGradient: {
                type: "linear",
                angle: 90,
                stops: [{ color: Colors.goldDeep }, { color: Colors.gold }],
              },
            }}
          />
        </node>
        <text
          style={{ fontSize: 12, color: Colors.muted }}
        >{`${found} of ${CARDS.length} discovered`}</text>
      </node>
      <node
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: GAP,
          width: (CARD_W * u + GAP) * COLUMNS,
        }}
      >
        {CARDS.map((card) =>
          owned[card.id] ? (
            <node
              key={card.id}
              style={{
                cache: "never",
                filter: editionFilter(card.rarity, tilt),
                transition: { transform: { duration: 200, easing: "easeOut" } },
              }}
              hoverStyle={{
                transform: { translateY: -10, scale: 1.04 },
                zIndex: 5,
              }}
              onClick={() => onInspect(card)}
            >
              <CardFront card={card} u={u} />
              {owned[card.id] > 1 && <Count n={owned[card.id]} />}
            </node>
          ) : (
            <Sealed key={card.id} card={card} u={u} />
          ),
        )}
      </node>
    </node>
  );
}

function Count({ n }: { n: number }) {
  return (
    <node
      style={{
        positionType: "absolute",
        right: -8,
        top: -8,
        padding: { horizontal: 8, vertical: 3 },
        borderRadius: 10,
        backgroundGradient: GILT,
      }}
    >
      <text
        style={{
          fontFamily: Fonts.display,
          fontSize: 11,
          fontWeight: "bold",
          color: Colors.ink,
        }}
      >{`×${n}`}</text>
    </node>
  );
}

function Sealed({ card, u }: { card: CardDef; u: number }) {
  return (
    <node
      style={{
        width: CARD_W * u,
        height: CARD_H * u,
        borderRadius: 16 * u,
        border: 1,
        borderColor: "rgba(243, 213, 138, 0.18)",
        backgroundColor: "rgba(10, 6, 22, 0.55)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 10 * u,
      }}
    >
      <Diamond size={7 * u} hollow color="rgba(243, 213, 138, 0.3)" />
      <text
        style={{
          fontFamily: Fonts.display,
          fontSize: 15 * u,
          letterSpacing: 4 * u,
          color: "rgba(243, 213, 138, 0.35)",
        }}
      >
        {card.numeral}
      </text>
    </node>
  );
}
