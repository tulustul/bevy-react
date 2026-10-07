import { useEffect, useState } from "react";
import {
  interpolate,
  useSharedValue,
  type SharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "bevy-react";
import { bevy } from "./bevy";
import {
  CARD_H,
  CARD_W,
  CardBack,
  CardFront,
  backFilter,
  editionFilter,
} from "./Card";
import type { Pull } from "./cards";
import { FLY } from "./theme";

type Point = { x: number; y: number };
type Slot = Point & { tilt: number };

const FLIP_MS = 760;

/** Five slots on a gentle arc, offsets from the table's center. */
export function fanSlots(count: number, u: number): Slot[] {
  const spacing = (CARD_W - 14) * u;
  return Array.from({ length: count }, (_, i) => {
    const k = i - (count - 1) / 2;
    return { x: k * spacing, y: k * k * 10 * u, tilt: k * 4 };
  });
}

/** The dealt cards. Each one's whole life — out of the pack, onto its slot,
 *  off to the grimoire — is one animated value (`path`: 0 → 1 → 2) mapped
 *  through `transform3d`, and the flip is another (`rotateY`, 0 → 180°).
 *  The engine drives every frame; React only re-renders when a card turns. */
export function Fan({
  pulls,
  center,
  u,
  revealed,
  landed,
  collecting,
  grimoire,
  onReveal,
  onInspect,
}: {
  pulls: Pull[];
  center: Point;
  u: number;
  revealed: Set<number>;
  /** The deal already played: mount on the slots, turned cards turned. */
  landed: boolean;
  collecting: boolean;
  /** Where collected cards fly to, window px. */
  grimoire: Point;
  onReveal: (uid: number) => void;
  onInspect: (pull: Pull) => void;
}) {
  const slots = fanSlots(pulls.length, u);
  return (
    <>
      {pulls.map((pull, i) => (
        <FanCard
          key={pull.uid}
          pull={pull}
          index={i}
          slot={slots[i]}
          center={center}
          u={u}
          revealed={revealed.has(pull.uid)}
          landed={landed}
          collecting={collecting}
          grimoire={{ x: grimoire.x - center.x, y: grimoire.y - center.y }}
          onReveal={() => onReveal(pull.uid)}
          onInspect={() => onInspect(pull)}
        />
      ))}
    </>
  );
}

function FanCard({
  pull,
  index,
  slot,
  center,
  u,
  revealed,
  landed,
  collecting,
  grimoire,
  onReveal,
  onInspect,
}: {
  pull: Pull;
  index: number;
  slot: Slot;
  center: Point;
  u: number;
  revealed: boolean;
  landed: boolean;
  collecting: boolean;
  grimoire: Point;
  onReveal: () => void;
  onInspect: () => void;
}) {
  const { card } = pull;
  // Remounted after the deal (back from the grimoire or a held card): no
  // replay — and a card already turned stays turned, without a second flare.
  const [turnedAtMount] = useState(revealed);
  const [landedAtMount] = useState(landed || revealed);
  const path = useSharedValue(landedAtMount ? 1 : 0);
  const flip = useSharedValue(turnedAtMount ? 180 : 0);
  const sway = useSharedValue(0);
  const spin = useSharedValue(0);
  const [front, setFront] = useState(turnedAtMount);
  const [bursts, setBursts] = useState(0);

  useEffect(() => {
    if (!landedAtMount)
      path.value = withDelay(120 + index * 110, withSpring(1, FLY));
    sway.value = withDelay(
      index * 400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2300, easing: "easeInOut" }),
          withTiming(-1, { duration: 2300, easing: "easeInOut" }),
        ),
      ),
    );
    spin.value = withRepeat(withTiming(360, { duration: 40000 }));
  }, [path, sway, spin, index, landedAtMount]);

  useEffect(() => {
    if (!revealed || turnedAtMount) return;
    flip.value = withTiming(180, { duration: FLIP_MS, easing: "easeInOut" });
    // Edge-on at the halfway mark: swap faces there, unseen.
    const t = setTimeout(() => {
      setFront(true);
      if (card.rarity !== "common") setBursts((b) => b + 1);
      if (card.rarity === "legendary") bevy.arcana.flare({ hue: card.hue });
    }, FLIP_MS / 2);
    return () => clearTimeout(t);
  }, [revealed, turnedAtMount, flip, card]);

  useEffect(() => {
    if (collecting)
      path.value = withDelay(
        index * 90,
        withTiming(2, { duration: 620, easing: "easeIn" }),
      );
  }, [collecting, path, index]);

  const w = CARD_W * u;
  const h = CARD_H * u;
  const tilt = interpolate(sway, [-1, 1], [-35, 35]);
  const left = center.x + slot.x - w / 2;
  const top = center.y + slot.y - h / 2;

  return (
    <>
      {card.rarity === "legendary" && !front && (
        <Aura left={left} top={top} w={w} h={h} path={path} slot={slot} />
      )}
      <node
        style={{
          positionType: "absolute",
          left,
          top,
          width: w,
          height: h,
          cache: "never",
          opacity: {
            animated: interpolate(path, [0, 0.12, 1.75, 2], [0, 1, 1, 0]),
          },
          transform3d: {
            perspective: 1000,
            translateX: {
              animated: interpolate(
                path,
                [0, 1, 2],
                [-slot.x, 0, grimoire.x - slot.x],
              ),
            },
            translateY: {
              animated: interpolate(
                path,
                [0, 1, 2],
                [-slot.y + 30, 0, grimoire.y - slot.y],
              ),
            },
            scale: { animated: interpolate(path, [0, 1, 2], [0.5, 1, 0.1]) },
            rotateZ: {
              animated: interpolate(path, [0, 1, 2], [0, slot.tilt, -25]),
            },
            rotateX: { animated: interpolate(sway, [-1, 1], [-3, 3]) },
            rotateY: { animated: flip },
          },
          filter: front ? editionFilter(card.rarity, tilt) : backFilter(tilt),
          transition: { transform: { duration: 180, easing: "easeOut" } },
        }}
        hoverStyle={{ transform: { translateY: -16 * u }, zIndex: 10 }}
        onClick={front ? onInspect : revealed ? undefined : onReveal}
      >
        {front ? (
          // Pre-mirrored: the card rests at rotateY 180°.
          <CardFront card={card} u={u} style={{ transform: { scaleX: -1 } }} />
        ) : (
          <CardBack u={u} spin={spin} />
        )}
      </node>
      {bursts > 0 && (
        <Burst
          key={bursts}
          x={center.x + slot.x}
          y={center.y + slot.y}
          size={h}
          gold={card.rarity === "legendary"}
        />
      )}
    </>
  );
}

/** A legendary waiting face-down breathes gold — the hint that makes you
 *  turn it last. (The fade sits on a wrapper: animated opacity fades a node
 *  with children as one layer, leaving the gradient's own colors alone.) */
function Aura({
  left,
  top,
  w,
  h,
  path,
  slot,
}: {
  left: number;
  top: number;
  w: number;
  h: number;
  path: SharedValue;
  slot: Slot;
}) {
  const breathe = useSharedValue(0.3);
  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: "easeInOut" }),
        withTiming(0.3, { duration: 900, easing: "easeInOut" }),
      ),
    );
  }, [breathe]);
  const pad = 54;
  return (
    <node
      style={{
        positionType: "absolute",
        left: left - pad,
        top: top - pad,
        opacity: { animated: breathe },
        transform: {
          translateX: { animated: interpolate(path, [0, 1], [-slot.x, 0]) },
          translateY: { animated: interpolate(path, [0, 1], [-slot.y, 0]) },
        },
      }}
    >
      <node
        style={{
          width: w + pad * 2,
          height: h + pad * 2,
          backgroundGradient: {
            type: "radial",
            stops: [
              { color: "#ffcf6e99" },
              { color: "#ff9a3c33", position: "45%" },
              { color: "#ff9a3c00", position: "70%" },
            ],
          },
        }}
      />
    </node>
  );
}

/** A ring of light thrown off a rare card as it turns. */
function Burst({
  x,
  y,
  size,
  gold,
}: {
  x: number;
  y: number;
  size: number;
  gold: boolean;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 900, easing: "easeOut" });
  }, [t]);
  const color = gold ? "#ffd27a" : "#a8e6ff";
  return (
    <node
      style={{
        positionType: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        opacity: { animated: interpolate(t, [0, 0.12, 1], [0, 1, 0]) },
        transform: {
          scale: { animated: interpolate(t, [0, 1], [0.5, gold ? 1.9 : 1.5]) },
        },
      }}
    >
      <node
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          border: 2,
          borderColor: color,
          backgroundGradient: {
            type: "radial",
            stops: [
              { color: `${color}00`, position: "50%" },
              { color: `${color}55`, position: "68%" },
              { color: `${color}00`, position: "71%" },
            ],
          },
        }}
      />
    </node>
  );
}
