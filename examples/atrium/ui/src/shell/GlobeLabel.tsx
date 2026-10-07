import type { PlaceInfo } from "../bevy";
import { clock } from "../apps";
import { Colors } from "../theme";
import { glass } from "./glass";

/** A glass label pinned to the place on the 3D globe: `<anchor>` projects
 *  the pin entity's world position into the UI every frame, centering the
 *  anchor's box (the little ring) on it, so the label rides the globe as it
 *  turns — and as you look around. */
export function GlobeLabel({
  place,
  hour,
}: {
  place: PlaceInfo;
  hour: number;
}) {
  return (
    <anchor
      entity={place.pin}
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        border: 1.5,
        borderColor: "rgba(255, 255, 255, 0.9)",
        focusPolicy: "pass",
      }}
    >
      <node
        style={{
          positionType: "absolute",
          left: 9,
          bottom: 9,
          flexDirection: "row",
          alignItems: "flexStart",
          focusPolicy: "pass",
        }}
      >
        <node
          style={{
            width: 26,
            height: 1.5,
            margin: { top: 30 },
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            transform: { rotate: -40 },
          }}
        />
        <node
          style={{
            ...glass(15),
            flexDirection: "column",
            padding: { horizontal: 12, vertical: 7 },
            morphFilter: { key: place.id, name: "condense", params: {} },
          }}
        >
          <text
            style={{ fontSize: 13, fontWeight: "semibold", color: Colors.text }}
          >
            {place.name}
          </text>
          <text style={{ fontSize: 11.5, color: Colors.muted }}>
            {clock(hour)}
          </text>
        </node>
      </node>
    </anchor>
  );
}
