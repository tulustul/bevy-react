import type { PlaceInfo } from "../bevy";
import { clock, daylight } from "../apps";
import { Colors } from "../theme";

const SHADOW = { color: "rgba(0, 0, 0, 0.4)", offsetX: 0, offsetY: 1 };

/** Where and when you are, top left. A new place condenses in — the
 *  `condense` morph, Atrium's own WGSL over these pixels. */
export function Hud({
  place,
  hour,
}: {
  place: PlaceInfo | undefined;
  hour: number;
}) {
  if (!place) return null;
  return (
    <node
      style={{
        positionType: "absolute",
        left: 34,
        top: 28,
        flexDirection: "column",
        gap: 3,
        morphFilter: { key: place.id, name: "condense", params: {} },
        transition: { morphFilter: { duration: 900, easing: "easeInOut" } },
      }}
    >
      <text
        style={{
          fontSize: 26,
          fontWeight: "semibold",
          color: Colors.text,
          textShadow: SHADOW,
        }}
      >
        {place.name}
      </text>
      <text
        style={{
          fontSize: 14,
          color: "rgba(255, 255, 255, 0.82)",
          textShadow: SHADOW,
        }}
      >
        {`${clock(hour)} · ${daylight(hour)} · ${place.temp}°`}
      </text>
    </node>
  );
}
