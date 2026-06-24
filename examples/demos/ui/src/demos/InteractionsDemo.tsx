import { useRef, useState } from "react";
import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { Example } from "../components";
import { Colors, FontSizes } from "../theme";

const TYPESCRIPT = `<node
  onClick={...}
  onPointerDown={...}
  onPointerMove={...}
  onPointerUp={...}
/>`;

// A pure-UI demo of the raw pointer events the bridge reports: `click`,
// `pointerDown`, `pointerMove`, `pointerUp`. Grab the box and drag it around —
// dragging uses the absolute `clientX`/`clientY` the bridge now sends (the
// normalized `x`/`y` are clamped to the box and can't drive free movement). No
// Bevy scene: the 3D viewport stays empty.

const STAGE_W = 380;
const STAGE_H = 240;
const BOX = 72;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

type LogLine = { id: number; text: string };

export function InteractionsDemo() {
  const [pos, setPos] = useState({
    left: (STAGE_W - BOX) / 2,
    top: (STAGE_H - BOX) / 2,
  });
  const [pressed, setPressed] = useState(false);
  const [last, setLast] = useState("-");
  const [log, setLog] = useState<LogLine[]>([]);

  // Cursor position at the previous drag frame, so we move the box by the delta.
  const lastClient = useRef({ x: 0, y: 0 });
  const lineId = useRef(0);

  const record = (text: string) => {
    setLast(text);
    setLog((prev) => {
      const next = [{ id: lineId.current++, text }, ...prev];
      return next.slice(0, 6);
    });
  };

  const fmt = (e: PointerEventData) =>
    `x=${e.x.toFixed(2)} y=${e.y.toFixed(2)} | client=(${Math.round(
      e.clientX,
    )}, ${Math.round(e.clientY)})`;

  const onPointerDown = (e: PointerEventData) => {
    lastClient.current = { x: e.clientX, y: e.clientY };
    setPressed(true);
    record(`pointerDown  ${fmt(e)}`);
  };

  const onPointerMove = (e: PointerEventData) => {
    const dx = e.clientX - lastClient.current.x;
    const dy = e.clientY - lastClient.current.y;
    lastClient.current = { x: e.clientX, y: e.clientY };
    setPos((p) => ({
      left: clamp(p.left + dx, 0, STAGE_W - BOX),
      top: clamp(p.top + dy, 0, STAGE_H - BOX),
    }));
    record(`pointerMove  ${fmt(e)}`);
  };

  const onPointerUp = (e: PointerEventData) => {
    setPressed(false);
    record(`pointerUp  ${fmt(e)}`);
  };

  return (
    <Example
      description="Raw pointer events the bridge reports. Grab the box and drag it around the stage."
      typescript={TYPESCRIPT}
    >
      <node style={stageStyle}>
        <node
          style={{
            ...boxStyle,
            left: pos.left,
            top: pos.top,
            backgroundColor: pressed ? Colors.purple100 : Colors.primary100,
          }}
          onClick={() => record("click")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <text style={boxLabelStyle}>drag</text>
        </node>
      </node>

      <text
        style={{
          color: Colors.primary100,
          fontSize: FontSizes.sm,
          fontWeight: "bold",
        }}
      >
        {last}
      </text>

      <node style={logStyle}>
        {log.map((l) => (
          <text key={l.id} style={logLineStyle}>
            {l.text}
          </text>
        ))}
      </node>
    </Example>
  );
}

const stageStyle: BevyStyle = {
  width: STAGE_W,
  height: STAGE_H,
  positionType: "relative",
  backgroundColor: Colors.surface100,
  borderRadius: 12,
  border: 1,
  borderColor: Colors.surface400,
  overflowX: "hidden",
  overflowY: "hidden",
};

const boxStyle: BevyStyle = {
  positionType: "absolute",
  width: BOX,
  height: BOX,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
};

const boxLabelStyle: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};

const logStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "start",
  gap: 2,
  width: STAGE_W,
  height: 110,
};

const logLineStyle: BevyStyle = {
  color: Colors.textColor300,
  fontSize: FontSizes.xs,
};
