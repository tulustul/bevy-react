import type { PlaceInfo } from "../bevy";
import { clock, daylight } from "../apps";
import { Colors, SNAP } from "../theme";
import { Header } from "./Header";

const TRACK_W = 568;
const KNOB = 26;

/** The sky over a day at the lake, left to right — the scrubber's track. */
const DAY = {
  type: "linear" as const,
  angle: 90,
  stops: [
    { color: "#0b1330", position: "0%" },
    { color: "#141f48", position: "17%" },
    { color: "#b86a7c", position: "22%" },
    { color: "#f2b487", position: "27%" },
    { color: "#7fb8ec", position: "38%" },
    { color: "#4f8fe0", position: "50%" },
    { color: "#79b0ea", position: "68%" },
    { color: "#ffb47a", position: "78%" },
    { color: "#c06a7e", position: "83%" },
    { color: "#28305e", position: "88%" },
    { color: "#0b1330", position: "100%" },
  ],
};

/** Skies: borrow the sky of anywhere. Pick a place and the world plays the
 *  hours between as a time-lapse; drag the day to scrub its light. */
export function Skies({
  places,
  place,
  hour,
  onPick,
  onScrub,
}: {
  places: PlaceInfo[];
  place: PlaceInfo | undefined;
  hour: number;
  onPick: (p: PlaceInfo) => void;
  onScrub: (hour: number) => void;
}) {
  const scrub = (x?: number) => {
    if (x === undefined) return;
    onScrub(Math.min(Math.max(x, 0), 0.9999) * 24);
  };
  const night = hour < 5 || hour > 21;
  return (
    <node style={{ flexGrow: 1, flexDirection: "column", padding: 26 }}>
      <node style={{ flexDirection: "row", alignItems: "flexEnd" }}>
        <node style={{ flexGrow: 1, flexDirection: "column" }}>
          <Header label="Skies" title={place?.name ?? " "} />
          <text
            style={{ fontSize: 15, color: Colors.muted, margin: { top: 4 } }}
          >
            {place
              ? `${place.region} · ${light(place, hour)} · ${place.temp}°`
              : " "}
          </text>
        </node>
        <text style={{ fontSize: 34, color: Colors.text, fontWeight: "light" }}>
          {clock(hour)}
        </text>
      </node>

      {/* The day: drag anywhere on it. */}
      <node
        onPointerDown={(e) => scrub(e.x)}
        onPointerMove={(e) => scrub(e.x)}
        style={{
          margin: { top: 20 },
          width: TRACK_W,
          height: 34,
          borderRadius: 17,
          backgroundGradient: DAY,
          cursor: "pointer",
        }}
      >
        <node
          style={{
            positionType: "absolute",
            top: 4,
            left: (hour / 24) * TRACK_W - KNOB / 2,
            width: KNOB,
            height: KNOB,
            borderRadius: KNOB / 2,
            backgroundColor: night ? "#dfe8ff" : "#fff6dc",
            border: 3,
            borderColor: "rgba(255, 255, 255, 0.55)",
            boxShadow: {
              color: "rgba(0, 0, 0, 0.35)",
              blurRadius: 10,
              yOffset: 2,
            },
          }}
        />
      </node>
      <node
        style={{
          width: TRACK_W,
          flexDirection: "row",
          justifyContent: "spaceBetween",
          margin: { top: 6 },
          padding: { horizontal: 10 },
        }}
      >
        {["00", "06", "12", "18", "24"].map((h) => (
          <text key={h} style={{ fontSize: 11, color: Colors.faint }}>
            {h}
          </text>
        ))}
      </node>

      <node
        style={{
          margin: { top: 16 },
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {places.map((p) => (
          <PlaceCard
            key={p.id}
            place={p}
            selected={p.id === place?.id}
            onPick={() => onPick(p)}
          />
        ))}
      </node>
    </node>
  );
}

/** The place's own words at its own hour; scrubbed away from it, what the
 *  light is doing. */
function light(place: PlaceInfo, hour: number): string {
  return Math.abs(hour - place.hour) < 0.02 ? place.condition : daylight(hour);
}

function PlaceCard({
  place,
  selected,
  onPick,
}: {
  place: PlaceInfo;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      style={{
        width: 181,
        height: 86,
        borderRadius: 18,
        padding: { horizontal: 14, vertical: 12 },
        flexDirection: "column",
        justifyContent: "spaceBetween",
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [{ color: place.skyTop }, { color: place.skyBottom }],
        },
        outline: {
          width: selected ? 2.5 : 0,
          offset: 3,
          color: selected ? "#ffffff" : "rgba(255, 255, 255, 0)",
        },
        transform: { scale: selected ? 1.03 : 1 },
        transition: { transform: SNAP },
        cursor: "pointer",
      }}
      hoverStyle={{ transform: { scale: selected ? 1.03 : 1.02 } }}
    >
      <node style={{ flexDirection: "row", justifyContent: "spaceBetween" }}>
        <text
          style={{ fontSize: 15, fontWeight: "semibold", color: Colors.text }}
        >
          {place.name}
        </text>
        <text style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.85)" }}>
          {clock(place.hour)}
        </text>
      </node>
      <text style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.85)" }}>
        {place.condition}
      </text>
    </button>
  );
}
