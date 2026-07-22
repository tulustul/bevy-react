import { useEffect, useMemo, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { on } from "./bevy";
import { buildItems } from "./items";
import { StressItem } from "./Item";
import { Colors, FontSizes } from "./theme";

const COUNTS = [20, 100, 500];

export function App() {
  const [n, setN] = useState(20);
  const [animate, setAnimate] = useState(false);
  const [groupAlpha, setGroupAlpha] = useState(true);

  const items = useMemo(() => buildItems(n), [n]);

  return (
    <node style={appStyle}>
      <node style={fieldStyle}>
        {items.map((item) => (
          <StressItem
            key={item.id}
            item={item}
            animate={animate}
            groupAlpha={groupAlpha}
          />
        ))}
      </node>

      {/* Rendered after the field so the controls paint above it. */}
      <node style={controlsStyle}>
        <text style={titleStyle}>layers-stress</text>
        {COUNTS.map((v) => (
          <Btn
            key={v}
            label={String(v)}
            selected={v === n}
            onClick={() => setN(v)}
          />
        ))}
        <Btn
          label={animate ? "animations: on" : "animations: off"}
          selected={animate}
          onClick={() => setAnimate((a) => !a)}
        />
        <Btn
          label={groupAlpha ? "groupAlpha: on" : "groupAlpha: off"}
          selected={groupAlpha}
          onClick={() => setGroupAlpha((g) => !g)}
        />
        <FpsReadout />
      </node>
    </node>
  );
}

// Isolated leaf so the 4 Hz FPS event only re-renders this text node, never the
// item field.
function FpsReadout() {
  const [fps, setFps] = useState<number | null>(null);
  useEffect(() => on("layersStress.fps", (e) => setFps(e.fps)), []);
  return (
    <text style={fpsStyle}>
      {fps === null ? "fps: —" : `fps: ${fps.toFixed(0)}`}
    </text>
  );
}

function Btn({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...btnStyle,
        backgroundColor: selected ? Colors.primary100 : Colors.surface300,
      }}
      hoverStyle={{
        backgroundColor: selected ? Colors.primary100 : Colors.surface500,
      }}
      pressStyle={{ backgroundColor: Colors.primary300 }}
    >
      <text
        style={{
          color: selected ? Colors.textColor400 : Colors.textColor100,
          fontSize: FontSizes.sm,
          fontWeight: "bold",
        }}
      >
        {label}
      </text>
    </button>
  );
}

const appStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "column",
  backgroundColor: Colors.surface200,
};

const fieldStyle: BevyStyle = {
  positionType: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

const controlsStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  padding: 12,
  backgroundColor: Colors.surface100,
};

const titleStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xl,
  fontWeight: "bold",
  margin: { right: 8 },
};

const btnStyle: BevyStyle = {
  padding: { top: 6, bottom: 6, left: 12, right: 12 },
  borderRadius: 6,
  justifyContent: "center",
  alignItems: "center",
};

const fpsStyle: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.sm,
  fontFamily: "Noto Sans Mono",
  margin: { left: 8 },
};
