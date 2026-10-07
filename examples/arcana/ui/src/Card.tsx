import type { ReactNode } from "react";
import type {
  AnimatedValue,
  BevyStyle,
  FilterChainValue,
  SharedValue,
} from "bevy-react";
import { RARITY_LABEL, type CardDef, type Rarity } from "./cards";
import { Sigil } from "./Sigil";
import { Colors, Fonts, GILT } from "./theme";

/** A card at `u = 1`; every dimension below scales by `u` (the inspected
 *  card renders the same component at 2× into its 3D surface). */
export const CARD_W = 240;
export const CARD_H = 336;

const PIPS: Record<Rarity, number> = { common: 1, rare: 2, legendary: 3 };

/** The edition's foil — a WGSL filter over the whole card's pixels. `tilt`
 *  (degrees) slides the rainbow: bind the card's tilt to it. */
export function editionFilter(
  rarity: Rarity,
  tilt: AnimatedValue,
): FilterChainValue | undefined {
  const angle = { animated: tilt };
  if (rarity === "rare") {
    return {
      name: "holo",
      params: { angle, strength: 0.55, saturation: 0.95, glitter: 0.6 },
    };
  }
  if (rarity === "legendary") {
    return [
      { name: "bloom", params: { radius: 7, threshold: 0.62, intensity: 1.1 } },
      {
        name: "holo",
        params: {
          angle,
          strength: 0.85,
          saturation: 1,
          glitter: 1,
          drift: 0.12,
        },
      },
    ];
  }
  return undefined;
}

/** The back's gold sheen (no spoilers: every back is the same). */
export function backFilter(tilt: AnimatedValue): FilterChainValue {
  return {
    name: "holo",
    params: {
      angle: { animated: tilt },
      strength: 0.28,
      saturation: 0.2,
      glitter: 0.5,
    },
  };
}

export function Diamond({
  size,
  color = Colors.gold,
  hollow = false,
}: {
  size: number;
  color?: string;
  hollow?: boolean;
}) {
  return (
    <node
      style={{
        width: size,
        height: size,
        transform: { rotate: 45 },
        ...(hollow
          ? { border: Math.max(1, size * 0.18), borderColor: color }
          : { backgroundColor: color }),
      }}
    />
  );
}

function Frame({
  u,
  style,
  children,
}: {
  u: number;
  style?: BevyStyle;
  children: ReactNode;
}) {
  return (
    <node
      style={{
        width: CARD_W * u,
        height: CARD_H * u,
        borderRadius: 16 * u,
        padding: 5 * u,
        backgroundGradient: GILT,
        ...style,
      }}
    >
      {children}
    </node>
  );
}

export function CardFront({
  card,
  u = 1,
  style,
}: {
  card: CardDef;
  u?: number;
  style?: BevyStyle;
}) {
  const pips = PIPS[card.rarity];
  return (
    <Frame u={u} style={style}>
      <node
        style={{
          flexGrow: 1,
          borderRadius: 12 * u,
          padding: 10 * u,
          flexDirection: "column",
          alignItems: "center",
          backgroundGradient: [
            {
              type: "radial",
              position: "top",
              stops: [
                { color: `${card.color}55` },
                { color: `${card.color}00`, position: "60%" },
              ],
            },
            {
              type: "linear",
              angle: 180,
              stops: [{ color: card.deep }, { color: Colors.ink }],
            },
          ],
        }}
      >
        <node
          style={{ flexDirection: "row", alignItems: "center", gap: 7 * u }}
        >
          <Diamond size={4 * u} />
          <text
            style={{
              fontFamily: Fonts.display,
              fontSize: 12 * u,
              letterSpacing: 4 * u,
              color: Colors.gold,
            }}
          >
            {card.numeral}
          </text>
          <Diamond size={4 * u} />
        </node>
        <node
          style={{
            margin: { top: 8 * u },
            width: 206 * u,
            height: 185 * u,
            borderRadius: 8 * u,
            border: Math.max(1, u),
            borderColor: Colors.goldFaint,
            overflowX: "clip",
            overflowY: "clip",
          }}
        >
          <portal
            target={`card-${card.id}`}
            style={{ width: "100%", height: "100%" }}
          />
        </node>
        <text
          style={{
            margin: { top: 11 * u },
            fontFamily: Fonts.display,
            fontSize: 16 * u,
            fontWeight: "semibold",
            letterSpacing: 2.5 * u,
            color: "#fff6e2",
          }}
        >
          {card.name.toUpperCase()}
        </text>
        <node
          style={{
            margin: { top: 6 * u },
            width: 130 * u,
            height: Math.max(1, u),
            backgroundGradient: {
              type: "linear",
              angle: 90,
              stops: [
                { color: "#f3d58a00" },
                { color: Colors.gold },
                { color: "#f3d58a00" },
              ],
            },
          }}
        />
        <text
          style={{
            margin: { top: 5 * u },
            fontFamily: Fonts.script,
            fontSize: 15 * u,
            color: card.color,
            textAlign: "center",
          }}
        >
          {card.flavor}
        </text>
        <node style={{ flexGrow: 1 }} />
        <node
          style={{ flexDirection: "row", alignItems: "center", gap: 6 * u }}
        >
          {[0, 1, 2].map((k) => (
            <Diamond
              key={k}
              size={5 * u}
              hollow={k >= pips}
              color={k < pips ? Colors.gold : Colors.goldFaint}
            />
          ))}
          {card.rarity !== "common" && (
            <text
              style={{
                margin: { left: 4 * u },
                fontFamily: Fonts.display,
                fontSize: 9 * u,
                letterSpacing: 2.5 * u,
                color: Colors.gold,
              }}
            >
              {RARITY_LABEL[card.rarity].toUpperCase()}
            </text>
          )}
        </node>
      </node>
    </Frame>
  );
}

/** Every card's back: the gilt frame around a turning sigil. `spin` (a
 *  shared value in degrees) turns it without re-rendering. */
export function CardBack({
  u = 1,
  spin,
  style,
}: {
  u?: number;
  spin?: SharedValue;
  style?: BevyStyle;
}) {
  return (
    <Frame u={u} style={style}>
      <node
        style={{
          flexGrow: 1,
          borderRadius: 12 * u,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 14 * u,
          backgroundGradient: {
            type: "radial",
            stops: [
              { color: "#4d2799" },
              { color: "#1f0e48", position: "58%" },
              { color: "#0c0619" },
            ],
          },
          border: Math.max(1, u),
          borderColor: Colors.goldFaint,
        }}
      >
        <Sigil
          size={170 * u}
          style={
            spin ? { transform: { rotate: { animated: spin } } } : undefined
          }
        />
        <text
          style={{
            fontFamily: Fonts.display,
            fontSize: 11 * u,
            letterSpacing: 8 * u,
            color: Colors.goldFaint,
          }}
        >
          ARCANA
        </text>
      </node>
    </Frame>
  );
}
