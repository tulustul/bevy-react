import { useEffect } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors } from "@/theme";
import { FLIGHT_MS } from "../beats";
import { vignetteStyle, type VignetteProps } from "../shared";
import { useVignetteState } from "../store";

const SLOTS = [0, 1] as const;
/** The little card's hop between the two slots (not the page's flight). */
const CARD_FLIGHT_MS = 520;
const AUTO_MS = 1600;

/** Shared elements: a card that lives in one slot at a time. Flipping `slot`
 * is an unmount + mount in one commit; the `sharedTag` makes it fly. The right
 * slot is round, and the flight eases the corners like any value channel. */
export function SharedElementsVignette({ expanded, grown }: VignetteProps) {
  const [slot, setSlot] = useVignetteState("shared.slot", 0);
  // Scoped by size: tile and panel are both mounted during the page flight,
  // and two live nodes sharing a tag is the pairing ambiguity.
  const tag = `home-shared-card-${expanded ? "large" : "small"}`;

  useEffect(() => {
    if (expanded) return;
    const id = setInterval(
      () => setSlot((s) => (s + 1) % SLOTS.length),
      AUTO_MS,
    );
    return () => clearInterval(id);
  }, [expanded, setSlot]);

  const size = grown ? 120 : 54;
  const box = size + 16;
  const roundSlot = (i: number) => i === 1;

  return (
    <node style={vignetteStyle}>
      <node style={{ ...rowStyle, gap: grown ? 28 : 18 }}>
        {SLOTS.map((i) => (
          <node
            key={i}
            style={{
              ...slotStyle,
              width: box,
              height: box,
              borderRadius: roundSlot(i) ? 200 : grown ? 16 : 10,
              transition: { size: { duration: FLIGHT_MS, easing: "easeOut" } },
            }}
            onClick={expanded && slot !== i ? () => setSlot(i) : undefined}
            hoverStyle={expanded && slot !== i ? slotHoverStyle : undefined}
          >
            {slot === i && (
              <node
                sharedTag={tag}
                style={{
                  ...cardStyle,
                  width: "85%",
                  height: "85%",
                  borderRadius: roundSlot(i) ? size / 2 : grown ? 12 : 8,
                  globalZIndex: 100,
                  transition: {
                    sharedElement: {
                      duration: CARD_FLIGHT_MS,
                      easing: "easeInOut",
                    },
                  },
                }}
              />
            )}
          </node>
        ))}
      </node>
    </node>
  );
}

const rowStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
};

const slotStyle: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  border: 1,
  borderColor: Colors.surface500,
  backgroundColor: Colors.surface100 + "66",
};

const slotHoverStyle: BevyStyle = {
  borderColor: Colors.primary100,
  cursor: "pointer",
};

const cardStyle: BevyStyle = {
  backgroundGradient: {
    type: "linear",
    angle: 135,
    stops: [{ color: Colors.sky100 }, { color: Colors.purple100 }],
  },
};
