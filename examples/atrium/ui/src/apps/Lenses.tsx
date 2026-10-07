import { useEffect, useState } from "react";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
  type BevyStyle,
} from "bevy-react";
import type { LensInfo } from "../bevy";
import { useDebug } from "../hooks";
import { Colors, SNAP } from "../theme";
import { Header } from "./Header";

const TILE = { width: 216, height: 150 };
const BIG = { width: 456, height: 316 };
const FLY = { duration: 480, easing: "easeInOut" } as const;

/** Lenses: live cameras around the lake, each a `<portal>`. Open one and
 *  the tile flies into the big view — a shared element: React swaps the
 *  grid for the detail in one commit, and the `sharedTag` pairs the two
 *  portals so the new one takes off from where the old one was. */
export function Lenses({
  lenses,
  onFound,
}: {
  lenses: LensInfo[];
  onFound: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const lens = lenses.find((l) => l.id === open);
  useDebug("lens", (id) => setOpen(id || null));
  return (
    <node style={{ flexGrow: 1, flexDirection: "column", padding: 22 }}>
      <node
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "spaceBetween",
          height: 62,
        }}
      >
        {lens ? (
          <Back onClick={() => setOpen(null)} />
        ) : (
          <Header label="Lenses" title="Around the lake" />
        )}
        <Live />
      </node>

      {lens ? (
        <node style={{ flexDirection: "column", margin: { top: 10 } }}>
          <portal
            target={`lens-${lens.id}`}
            sharedTag={`lens-${lens.id}`}
            style={{
              ...BIG,
              borderRadius: 18,
              transition: { sharedElement: FLY },
            }}
          />
          <node
            style={{
              flexDirection: "row",
              justifyContent: "spaceBetween",
              margin: { top: 12 },
            }}
          >
            <text
              style={{
                fontSize: 15,
                fontWeight: "semibold",
                color: Colors.text,
              }}
            >
              {lens.name}
            </text>
            <text style={{ fontSize: 13, color: Colors.muted }}>
              {lens.seesYou ? "That's you on the pier." : lens.detail}
            </text>
          </node>
        </node>
      ) : (
        <node
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            margin: { top: 10 },
          }}
        >
          {lenses.map((l) => (
            <Tile
              key={l.id}
              lens={l}
              onOpen={() => {
                setOpen(l.id);
                if (l.seesYou) onFound();
              }}
            />
          ))}
        </node>
      )}
    </node>
  );
}

function Tile({ lens, onOpen }: { lens: LensInfo; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      style={{ ...TILE, borderRadius: 16, cursor: "pointer" }}
    >
      <portal
        target={`lens-${lens.id}`}
        sharedTag={`lens-${lens.id}`}
        style={{
          ...TILE,
          borderRadius: 16,
          transition: { sharedElement: FLY },
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 54,
          padding: { horizontal: 12, vertical: 9 },
          flexDirection: "column",
          justifyContent: "flexEnd",
          borderRadius: { top: 0, right: 0, bottom: 16, left: 16 },
          backgroundGradient: {
            type: "linear",
            angle: 180,
            stops: [
              { color: "rgba(0, 0, 0, 0)" },
              { color: "rgba(0, 0, 0, 0.55)" },
            ],
          },
        }}
      >
        <text
          style={{ fontSize: 14, fontWeight: "semibold", color: Colors.text }}
        >
          {lens.name}
        </text>
      </node>
    </button>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  const platter: BevyStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 38,
    borderRadius: 19,
    padding: { horizontal: 16 },
    backgroundColor: Colors.platter,
    transition: { backgroundColor: SNAP },
    cursor: "pointer",
  };
  return (
    <button
      onClick={onClick}
      style={platter}
      hoverStyle={{ backgroundColor: Colors.platterHover }}
      pressStyle={{ backgroundColor: Colors.platterPress }}
    >
      <svg viewBox="0 0 20 20" style={{ width: 14, height: 14 }}>
        <path
          d="M12.5 4.5L7 10l5.5 5.5"
          fill="none"
          stroke={Colors.text}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <text style={{ fontSize: 14, fontWeight: "medium", color: Colors.text }}>
        All lenses
      </text>
    </button>
  );
}

/** A red dot that breathes, and the word. */
function Live() {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0.35, { duration: 900, easing: Easing.easeInOut }),
      { reverse: true },
    );
  }, [pulse]);
  return (
    <node style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
      <node
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#ff5a5a",
          opacity: { animated: pulse },
        }}
      />
      <text
        style={{
          fontSize: 12,
          fontWeight: "semibold",
          letterSpacing: 1.4,
          color: Colors.muted,
        }}
      >
        LIVE
      </text>
    </node>
  );
}
