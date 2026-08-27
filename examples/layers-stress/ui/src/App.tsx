import { useEffect, useMemo, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { on } from "./bevy";
import { buildItems } from "./items";
import { StressItem } from "./Item";
import { PRESET, type FilterMode } from "./preset";
import { Colors, FontSizes } from "./theme";

const COUNTS = [20, 100, 500];

const FILTER_MODES: { mode: FilterMode; label: string }[] = [
  { mode: "off", label: "filters: off" },
  { mode: "half", label: "filters: 50%" },
  { mode: "all", label: "filters: 100%" },
];

/** Static blur radius; also the center of the animated 2..10 oscillation. */
const BLUR_RADIUS = 6;

export function App() {
  const [n, setN] = useState(PRESET.n);
  const [animate, setAnimate] = useState(PRESET.animate);
  const [groupAlpha, setGroupAlpha] = useState(PRESET.groupAlpha);
  const [filterMode, setFilterMode] = useState<FilterMode>(PRESET.filterMode);
  const [blur, setBlur] = useState(PRESET.blur);
  const [animateFilter, setAnimateFilter] = useState(PRESET.animateFilter);

  // One shared driver for every filtered item's blur radius: a JS interval
  // oscillating 2..10 px. Unlike the Rust-driven opacity/translate animations
  // this deliberately crosses the bridge every tick — it stresses the
  // params-only filter update path (re-run filter passes, no re-capture).
  const [radius, setRadius] = useState(BLUR_RADIUS);
  useEffect(() => {
    if (!(animateFilter && blur && filterMode !== "off")) return;
    const t0 = Date.now();
    const id = setInterval(() => {
      setRadius(BLUR_RADIUS + 4 * Math.sin((Date.now() - t0) / 300));
    }, 16);
    return () => {
      clearInterval(id);
      setRadius(BLUR_RADIUS);
    };
  }, [animateFilter, blur, filterMode]);

  const isFiltered = (id: number) =>
    filterMode === "all" || (filterMode === "half" && id % 2 === 0);

  const items = useMemo(() => buildItems(n), [n]);

  return (
    <node style={appStyle}>
      <node style={fieldStyle}>
        {items.map((item) => {
          const filtered = isFiltered(item.id);
          return (
            <StressItem
              key={item.id}
              item={item}
              animate={animate}
              groupAlpha={groupAlpha}
              filtered={filtered}
              blur={blur}
              // 0 for items whose style has no radius, so the shared radius
              // ticking doesn't touch their props (memo bails).
              blurRadius={filtered && blur ? radius : 0}
            />
          );
        })}
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
        {FILTER_MODES.map(({ mode, label }) => (
          <Btn
            key={mode}
            label={label}
            selected={mode === filterMode}
            onClick={() => setFilterMode(mode)}
          />
        ))}
        <Btn
          label={blur ? "filter: blur" : "filter: grayscale"}
          selected={blur}
          onClick={() => setBlur((b) => !b)}
        />
        <Btn
          label={animateFilter ? "animate filter: on" : "animate filter: off"}
          selected={animateFilter}
          onClick={() => setAnimateFilter((a) => !a)}
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
  padding: { horizontal: 12, vertical: 6 },
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
