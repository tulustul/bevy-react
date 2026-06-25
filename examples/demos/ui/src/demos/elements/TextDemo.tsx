import { useState } from "react";
import { Example, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";

const SIZE_TS = `<text style={{ fontSize: 28, fontWeight: "bold" }}>
  Big & bold
</text>`;

const FAMILY_TS = `<text style={{ fontFamily: "DancingScript" }}>`;

export function TextDemo() {
  return (
    <>
      <Example
        description="fontSize and fontWeight scale text. Drag to resize."
        tsx={SIZE_TS}
      >
        <SizeControl />
      </Example>

      <Example
        description="Custom font families, and inline nested color spans within one <text>."
        tsx={FAMILY_TS}
      >
        <text
          style={{
            fontFamily: "DancingScript",
            fontSize: FontSizes.xxl,
            color: Colors.amber100,
          }}
        >
          Styled with a custom font family
        </text>

        <text style={{ fontSize: FontSizes.lg, color: Colors.textColor100 }}>
          Nested texts color{" "}
          <text style={{ color: Colors.primary100, fontWeight: "bold" }}>
            part
          </text>{" "}
          of a{" "}
          <text style={{ color: Colors.red100, fontWeight: "bold" }}>
            sentence
          </text>
          .
        </text>
      </Example>
    </>
  );
}

function SizeControl() {
  const [size, setSize] = useState(28);
  return (
    <node style={{ flexDirection: "column", alignItems: "center", gap: 16 }}>
      <text style={{ fontSize: size, fontWeight: "thin" }}>thin</text>
      <text style={{ fontSize: size, fontWeight: "normal" }}>normal</text>
      <text style={{ fontSize: size, fontWeight: "bold" }}>bold</text>
      <Slider
        value={size}
        min={10}
        max={48}
        onChange={setSize}
        label={`fontSize ${size.toFixed(0)}`}
      />
    </node>
  );
}
