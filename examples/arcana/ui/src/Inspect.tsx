import { useEffect, useRef, useState } from "react";
import {
  interpolate,
  useSharedValue,
  withSpring,
  withTiming,
} from "bevy-react";
import { bevy } from "./bevy";
import { CARD_H, CARD_W, CardFront, Diamond } from "./Card";
import { RARITY_LABEL, type CardDef } from "./cards";
import { GlassButton, Label } from "./Glass";
import { useDebug } from "./hooks";
import { Colors, Fonts, GILT } from "./theme";

const FOIL = {
  common: [0, 0],
  rare: [0.55, 0],
  legendary: [0.85, 0.12],
} as const;
const OUT_MS = 450;

/** Holding a card. The flat card lifts to the middle of the screen; then
 *  Bevy hangs a real 3D card exactly over it — draped with this same
 *  component, rendered into `<surface target="inspect">` — and the flat one
 *  goes. Drag to turn it over: the back is React too, and its heart
 *  still takes clicks, in 3D. */
export function Inspect({
  card,
  count,
  favorite,
  width,
  height,
  onFavorite,
  onClose,
}: {
  card: CardDef;
  count: number;
  favorite: boolean;
  width: number;
  height: number;
  onFavorite: () => void;
  onClose: () => void;
}) {
  const cardH = Math.round(Math.min(height * 0.64, 540));
  const u = cardH / CARD_H;
  const lift = useSharedValue(0);
  const twin = useSharedValue(1);
  const [leaving, setLeaving] = useState(false);
  const handoff = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    lift.value = withSpring(1, { stiffness: 140, damping: 18, mass: 1 });
    const [foil, drift] = FOIL[card.rarity];
    // Once the twin has landed, Bevy hangs the 3D card over it — pixel for
    // pixel — and the twin quietly goes.
    handoff.current = setTimeout(() => {
      bevy.arcana.inspect({ height: cardH, foil, drift });
      twin.value = withTiming(0, { duration: 300, easing: "easeInOut" });
    }, 480);
    return () => clearTimeout(handoff.current);
  }, [card, cardH, lift, twin]);

  const close = () => {
    if (leaving) return;
    setLeaving(true);
    clearTimeout(handoff.current);
    bevy.arcana.inspect({ height: null, foil: 0, drift: 0 });
    lift.value = withTiming(0, { duration: OUT_MS, easing: "easeIn" });
    setTimeout(onClose, OUT_MS);
  };
  useDebug("close", close);
  useEffect(() => bevy.on("keyDown", (e) => e.key === "Escape" && close()));

  return (
    <node
      style={{
        positionType: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        opacity: { animated: lift },
      }}
    >
      {/* The flat twin, exactly where the 3D card will hang. */}
      <node
        style={{
          positionType: "absolute",
          left: (width - CARD_W * u) / 2,
          top: (height - cardH) / 2,
          opacity: { animated: twin },
          transform: {
            scale: { animated: interpolate(lift, [0, 1], [0.86, 1]) },
          },
        }}
      >
        <CardFront card={card} u={u} />
      </node>

      <node
        style={{
          positionType: "absolute",
          top: 34,
          left: 0,
          right: 0,
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <text
          style={{
            fontFamily: Fonts.display,
            fontSize: 12,
            letterSpacing: 6,
            color: Colors.gold,
          }}
        >
          {[card.numeral, RARITY_LABEL[card.rarity]]
            .filter(Boolean)
            .join("  ·  ")
            .toUpperCase()}
        </text>
        <text
          style={{
            fontFamily: Fonts.display,
            fontSize: 26,
            fontWeight: "semibold",
            letterSpacing: 5,
            color: Colors.text,
          }}
        >
          {card.name.toUpperCase()}
        </text>
      </node>
      <node
        style={{
          positionType: "absolute",
          bottom: 36,
          left: 0,
          right: 0,
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <text style={{ fontSize: 13, letterSpacing: 1, color: Colors.muted }}>
          Drag to turn the card · Esc to put it back
        </text>
        <GlassButton onClick={close}>
          <Label>PUT IT BACK</Label>
        </GlassButton>
      </node>

      {/* Both faces, side by side, rendered into the 3D card's texture. */}
      <surface target="inspect" style={{ flexDirection: "row" }}>
        <CardFront card={card} u={2} />
        <CardDetails
          card={card}
          count={count}
          favorite={favorite}
          onFavorite={onFavorite}
        />
      </surface>
    </node>
  );
}

/** The 3D card's back: the card's lore, and a heart that works in 3D. */
function CardDetails({
  card,
  count,
  favorite,
  onFavorite,
}: {
  card: CardDef;
  count: number;
  favorite: boolean;
  onFavorite: () => void;
}) {
  const u = 2;
  return (
    <node
      style={{
        width: CARD_W * u,
        height: CARD_H * u,
        borderRadius: 16 * u,
        padding: 5 * u,
        backgroundGradient: GILT,
      }}
    >
      <node
        style={{
          flexGrow: 1,
          borderRadius: 12 * u,
          padding: 16 * u,
          flexDirection: "column",
          alignItems: "center",
          gap: 9 * u,
          backgroundGradient: {
            type: "linear",
            angle: 180,
            stops: [{ color: card.deep }, { color: Colors.ink }],
          },
        }}
      >
        <text
          style={{
            fontFamily: Fonts.display,
            fontSize: 11 * u,
            letterSpacing: 4 * u,
            color: Colors.gold,
          }}
        >
          {card.numeral}
        </text>
        <text
          style={{
            fontFamily: Fonts.display,
            fontSize: 17 * u,
            fontWeight: "semibold",
            letterSpacing: 2 * u,
            color: Colors.text,
          }}
        >
          {card.name.toUpperCase()}
        </text>
        <node
          style={{ flexDirection: "row", alignItems: "center", gap: 6 * u }}
        >
          <Diamond size={4 * u} />
          <text
            style={{
              fontSize: 10 * u,
              letterSpacing: 2 * u,
              color: card.color,
            }}
          >
            {card.element.toUpperCase()}
          </text>
          <Diamond size={4 * u} />
        </node>
        <node
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 5 * u,
            margin: { top: 4 * u },
          }}
        >
          {card.keywords.map((k) => (
            <node
              key={k}
              style={{
                padding: { horizontal: 8 * u, vertical: 3 * u },
                borderRadius: 9 * u,
                border: u,
                borderColor: Colors.goldFaint,
              }}
            >
              <text style={{ fontSize: 9 * u, color: Colors.text }}>{k}</text>
            </node>
          ))}
        </node>
        <text
          style={{
            margin: { top: 6 * u },
            fontFamily: Fonts.script,
            fontSize: 17 * u,
            color: card.color,
            textAlign: "center",
          }}
        >
          {card.flavor}
        </text>
        <node style={{ flexGrow: 1 }} />
        <text
          style={{ fontSize: 9 * u, letterSpacing: 2 * u, color: Colors.muted }}
        >
          {count > 0 ? `IN YOUR GRIMOIRE  ×${count}` : "NEWLY DRAWN"}
        </text>
        <button
          onClick={onFavorite}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6 * u,
            padding: { horizontal: 12 * u, vertical: 6 * u },
            borderRadius: 14 * u,
            border: u,
            borderColor: favorite ? "#ff7aa8" : Colors.goldFaint,
            backgroundColor: favorite
              ? "rgba(255, 90, 140, 0.18)"
              : "rgba(255, 255, 255, 0.04)",
          }}
          hoverStyle={{
            backgroundColor: favorite
              ? "rgba(255, 90, 140, 0.3)"
              : "rgba(255, 255, 255, 0.12)",
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 12 * u, height: 12 * u }}>
            <path
              d="M12 21s-7.5-4.6-9.8-9C.6 8.5 2.6 4.5 6.4 4.5c2.3 0 3.8 1.4 4.6 2.6h2c.8-1.2 2.3-2.6 4.6-2.6 3.8 0 5.8 4 4.2 7.5C19.5 16.4 12 21 12 21z"
              fill={favorite ? "#ff7aa8" : "none"}
              stroke={favorite ? "#ff7aa8" : Colors.gold}
              strokeWidth={1.6}
            />
          </svg>
          <text
            style={{ fontSize: 10 * u, letterSpacing: u, color: Colors.text }}
          >
            {favorite ? "Favorite" : "Mark favorite"}
          </text>
        </button>
      </node>
    </node>
  );
}
