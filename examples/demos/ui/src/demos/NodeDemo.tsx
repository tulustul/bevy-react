import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

// A pure-UI demo of the `<node>` host element: the flex/grid layout primitive.
// Toggle the container's `flexDirection` and cycle its `justifyContent` to see
// the colored child nodes re-flow. No 3D scene: the viewport stays empty.

const JUSTIFY: BevyStyle["justifyContent"][] = [
  "flexStart",
  "center",
  "flexEnd",
  "spaceBetween",
];

const SWATCHES = ["#7aa2f7", "#9ece6a", "#f7768e", "#e0af68"];

export function NodeDemo() {
  const [row, setRow] = useState(true);
  const [justifyIndex, setJustifyIndex] = useState(0);
  const justifyContent = JUSTIFY[justifyIndex];

  return (
    <Card>
      <text style={headingStyle}>Node</text>
      <text style={labelStyle}>{"<node style={{ flexDirection, gap }} />"}</text>

      <node
        style={{
          ...containerStyle,
          flexDirection: row ? "row" : "column",
          justifyContent,
        }}
      >
        {SWATCHES.map((color) => (
          <node key={color} style={{ ...swatchStyle, backgroundColor: color }} />
        ))}
      </node>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <button
          onClick={() => setRow((r) => !r)}
          style={toggleStyle}
          hoverStyle={toggleHoverStyle}
        >
          <text style={toggleLabelStyle}>
            flexDirection: {row ? "row" : "column"}
          </text>
        </button>
        <button
          onClick={() => setJustifyIndex((i) => (i + 1) % JUSTIFY.length)}
          style={toggleStyle}
          hoverStyle={toggleHoverStyle}
        >
          <text style={toggleLabelStyle}>justify: {justifyContent}</text>
        </button>
      </node>
    </Card>
  );
}

const containerStyle: BevyStyle = {
  width: 320,
  height: 160,
  gap: 10,
  padding: 12,
  alignItems: "center",
  backgroundColor: "#11111b",
  borderRadius: 12,
};

const swatchStyle: BevyStyle = {
  width: 48,
  height: 48,
  borderRadius: 8,
};

const toggleStyle: BevyStyle = {
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  borderRadius: 8,
  backgroundColor: "#2a2a3c",
};

const toggleHoverStyle: BevyStyle = {
  backgroundColor: "#42425e",
};

const toggleLabelStyle: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 14,
  fontWeight: "bold",
};
