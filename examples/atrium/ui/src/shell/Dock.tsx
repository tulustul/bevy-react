import { useState } from "react";
import type { Gradient } from "bevy-react";
import { APPS, type AppId } from "../apps";
import { Colors, SNAP } from "../theme";
import { glass } from "./glass";
import { Icon } from "./Icon";

const SIZE = 54;

/** The dock: liquid glass over the world. A closed app opens; an open one
 *  comes to wherever you are looking. */
export function Dock({
  open,
  onPress,
}: {
  open: Record<AppId, boolean>;
  onPress: (app: AppId) => void;
}) {
  const [hover, setHover] = useState<AppId | null>(null);
  return (
    <node
      style={{
        positionType: "absolute",
        left: 0,
        right: 0,
        bottom: 24,
        flexDirection: "column",
        alignItems: "center",
        focusPolicy: "pass",
      }}
    >
      <node
        style={{
          height: 26,
          justifyContent: "center",
          alignItems: "center",
          focusPolicy: "pass",
        }}
      >
        {hover && (
          <text
            style={{
              fontSize: 13,
              fontWeight: "medium",
              color: Colors.text,
              textShadow: {
                color: "rgba(0, 0, 0, 0.55)",
                offsetX: 0,
                offsetY: 1,
              },
            }}
          >
            {APPS.find((a) => a.id === hover)?.title}
          </text>
        )}
      </node>
      <node
        style={{
          ...glass(37),
          flexDirection: "row",
          gap: 12,
          padding: { horizontal: 12, vertical: 10 },
          margin: { top: 6 },
        }}
      >
        {APPS.map((a) => (
          <node
            key={a.id}
            style={{ flexDirection: "column", alignItems: "center" }}
          >
            <button
              onClick={() => onPress(a.id)}
              onPointerEnter={() => setHover(a.id)}
              onPointerLeave={() => setHover((h) => (h === a.id ? null : h))}
              style={{
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE / 2,
                alignItems: "center",
                justifyContent: "center",
                backgroundGradient: ICON_BG[a.id],
                transform: { scale: 1 },
                transition: { transform: SNAP },
                cursor: "pointer",
              }}
              hoverStyle={{ transform: { scale: 1.1 } }}
              pressStyle={{ transform: { scale: 0.94 } }}
            >
              <Icon app={a.id} size={26} />
            </button>
            <node
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                margin: { top: 5 },
                backgroundColor: open[a.id]
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(255, 255, 255, 0)",
                transition: { backgroundColor: SNAP },
              }}
            />
          </node>
        ))}
      </node>
    </node>
  );
}

const ICON_BG: Record<AppId, Gradient> = {
  skies: {
    type: "linear",
    angle: 180,
    stops: [{ color: "#3a64c4" }, { color: "#8a6ac0" }, { color: "#ffaa70" }],
  },
  notes: {
    type: "linear",
    angle: 180,
    stops: [{ color: "#ffd97a" }, { color: "#f0a84c" }],
  },
  lenses: {
    type: "linear",
    angle: 180,
    stops: [{ color: "#3c4658" }, { color: "#161b26" }],
  },
};
