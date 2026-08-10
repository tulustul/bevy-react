// The detected-controllers strip: one box per connected pad, laid out as a
// wrapping horizontal row, each with a live canvas-drawn schematic. Falls
// back to a single "No controllers detected" box.

import { useMemo } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";
import { TextMono } from "@/components/TextMono";
import { makePadPainter, PAD_CANVAS_H, PAD_CANVAS_W } from "./padPainter";
import type { PadState } from "./usePads";

export function PadVisualizer({ pads }: { pads: Record<number, PadState> }) {
  const entries = Object.entries(pads);
  return (
    <node style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
      {entries.length === 0 ? (
        <node style={boxStyle}>
          <text style={{ fontSize: FontSizes.sm, color: Colors.textColor300 }}>
            No controllers detected
          </text>
        </node>
      ) : (
        entries.map(([id, pad]) => (
          <PadBox key={id} id={Number(id)} pad={pad} />
        ))
      )}
    </node>
  );
}

function PadBox({ id, pad }: { id: number; pad: PadState }) {
  const draw = useMemo(() => makePadPainter(pad), [pad]);
  return (
    <node style={boxStyle}>
      <text
        style={{
          fontSize: FontSizes.sm,
          fontWeight: "bold",
          color: Colors.textColor100,
        }}
      >
        {`#${id} ${pad.info.name}`}
      </text>
      <canvas
        style={{ width: PAD_CANVAS_W, height: PAD_CANVAS_H }}
        draw={draw}
      />
    </node>
  );
}

const boxStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  padding: 12,
  borderRadius: 12,
  border: 1,
  borderColor: Colors.surface500,
  backgroundColor: Colors.surface100,
  minWidth: PAD_CANVAS_W + 24,
  minHeight: 80,
  justifyContent: "center",
};
