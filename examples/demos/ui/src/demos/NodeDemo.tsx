import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { codeStyle, headingStyle, labelStyle } from "./styles";
import { Button, Card } from "../components";

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
      <text style={{ ...labelStyle, ...codeStyle }}>
        {"<node style={{ flexDirection, gap }} />"}
      </text>

      <node
        style={{
          ...containerStyle,
          flexDirection: row ? "row" : "column",
          justifyContent,
        }}
      >
        {SWATCHES.map((color) => (
          <node
            key={color}
            style={{ ...swatchStyle, backgroundColor: color }}
          />
        ))}
      </node>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <Button onClick={() => setRow((r) => !r)}>
          flexDirection: {row ? "row" : "column"}
        </Button>
        <Button
          onClick={() => setJustifyIndex((i) => (i + 1) % JUSTIFY.length)}
        >
          justify: {justifyContent}
        </Button>
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
