import { useEffect, useState } from "react";
import {
  useSharedValue,
  withRepeat,
  withTiming,
  type PointerEventData,
} from "bevy-react";
import { bevy } from "../bevy";
import { C, Fonts, OWNS_POINTER, caps, gilt, panel } from "../theme";
import { Icon } from "../ui/Icon";
import { RoundButton, radial } from "../ui/kit";

const MAP_W = 300;
/** The map's aspect (its hex grid's width over its height). */
const MAP_H = Math.round(MAP_W / 1.83);

/** Bottom right: the end-turn button and the minimap — a `<portal>` of a
 *  top-down camera filming the whole map, your view outlined on it. */
export function ActionPanel({
  label,
  busy,
  lens,
  onNext,
  onLens,
}: {
  label: string;
  busy: boolean;
  lens: boolean;
  onNext: () => void;
  onLens: () => void;
}) {
  const jump = (e: PointerEventData) => bevy.map.jump({ u: e.x, v: e.y });
  return (
    <node
      style={{
        positionType: "absolute",
        right: 12,
        bottom: 12,
        flexDirection: "column",
        alignItems: "flexEnd",
      }}
    >
      <node
        style={{
          flexDirection: "row",
          alignItems: "center",
          margin: { bottom: -18, right: 8 },
        }}
      >
        <node
          style={{
            ...panel,
            height: 34,
            padding: { left: 16, right: 30 },
            margin: { right: -22 },
            justifyContent: "center",
            borderRadius: 17,
          }}
          hoverStyle={OWNS_POINTER}
        >
          <text
            style={{
              fontFamily: Fonts.display,
              fontWeight: "bold",
              fontSize: 14,
              letterSpacing: 1.5,
              color: C.goldHi,
            }}
          >
            {label}
          </text>
        </node>
        <EndTurn busy={busy} onClick={onNext} />
      </node>
      <node
        style={{ ...panel, padding: 6, flexDirection: "column", gap: 6 }}
        hoverStyle={OWNS_POINTER}
      >
        <node
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            padding: { left: 2 },
          }}
        >
          <RoundButton
            icon="map"
            size={28}
            tip={lens ? "Back to the terrain" : "Political lens"}
            tipSide="top"
            active={lens}
            onClick={onLens}
          />
          <text style={{ ...caps, color: lens ? C.goldHi : C.muted }}>
            {lens ? "POLITICAL LENS" : "TERRAIN"}
          </text>
        </node>
        <portal
          target="minimap"
          onPointerDown={jump}
          onPointerMove={jump}
          style={{
            width: MAP_W,
            height: MAP_H,
            border: 1,
            borderColor: C.goldLo,
            cursor: "crosshair",
          }}
        />
      </node>
    </node>
  );
}

/** The great round button: a gilt ring that turns while the world takes
 *  its turn. */
function EndTurn({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  const spin = useSharedValue(0);
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    spin.value = 0;
    if (busy) spin.value = withRepeat(withTiming(360, { duration: 700 }));
  }, [busy, spin]);
  return (
    <button
      onClick={onClick}
      onPointerEnter={() => setGlow(true)}
      onPointerLeave={() => setGlow(false)}
      style={{
        width: 96,
        height: 96,
        borderRadius: 48,
        padding: 5,
        backgroundGradient: gilt,
        boxShadow: glow
          ? { color: "rgba(246, 228, 168, 0.6)", blurRadius: 22 }
          : { color: "rgba(0, 0, 0, 0.6)", blurRadius: 14, yOffset: 4 },
      }}
      pressStyle={{ transform: { scale: 0.95 } }}
    >
      <node
        style={{
          flexGrow: 1,
          borderRadius: 43,
          padding: 6,
          backgroundGradient: {
            type: "conic",
            stops: [
              { color: "#7fd0ff" },
              { color: "#16446a" },
              { color: "#7fd0ff" },
              { color: "#16446a" },
              { color: "#7fd0ff" },
            ],
          },
          transform: { rotate: { animated: spin } },
        }}
      >
        <node
          style={{
            flexGrow: 1,
            borderRadius: 37,
            alignItems: "center",
            justifyContent: "center",
            backgroundGradient: radial("#2f6a9c", "#0b1c2e"),
          }}
        >
          <Icon name={busy ? "moon" : "arrow"} size={34} color={C.goldHi} />
        </node>
      </node>
    </button>
  );
}
