import { useState } from "react";
import type { BevyStyle } from "bevy-react/jsx";
import { Checkbox, Example, Radio, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";

const SIZE_TS = `<text style={{ fontSize: 28, fontWeight: "bold" }}>
  Big & bold
</text>`;

const FAMILY_TS = `<text style={{ fontFamily: "DancingScript" }}>`;

const TYPOGRAPHY_TS = `<text style={{ lineHeight: 1.8, letterSpacing: 2 }}>
<text style={{ textShadow: { color: "#000", offsetX: 2, offsetY: 2 } }}>`;

const WRAP_TS = `<text style={{ width: 220, lineBreak: "anyCharacter" }}>`;

const PARAGRAPH =
  "Line height, letter spacing, and a drop shadow give a block of text its rhythm and weight.";

type LineBreak = NonNullable<BevyStyle["lineBreak"]>;

const LINE_BREAKS: { label: string; value: LineBreak }[] = [
  { label: "wordBoundary", value: "wordBoundary" },
  { label: "anyCharacter", value: "anyCharacter" },
  { label: "wordOrCharacter", value: "wordOrCharacter" },
  { label: "noWrap", value: "noWrap" },
];

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

      <Example
        description="lineHeight, letterSpacing, and textShadow tune typography. Drag the sliders and toggle the shadow."
        tsx={TYPOGRAPHY_TS}
      >
        <TypographyControl />
      </Example>

      <Example
        description="lineBreak controls wrapping when text overflows its width. Pick a mode."
        tsx={WRAP_TS}
      >
        <WrapControl />
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

function TypographyControl() {
  const [lineHeight, setLineHeight] = useState(1.4);
  const [letterSpacing, setLetterSpacing] = useState(1.5);
  const [shadow, setShadow] = useState(true);
  return (
    <node style={{ flexDirection: "column", gap: 16, width: 380 }}>
      <text
        style={{
          fontSize: FontSizes.base,
          color: Colors.textColor100,
          lineHeight,
          letterSpacing,
          textShadow: shadow
            ? { color: "#000000cc", offsetX: 2, offsetY: 2 }
            : undefined,
        }}
      >
        {PARAGRAPH}
      </text>
      <Slider
        value={lineHeight}
        min={1}
        max={2.5}
        onChange={setLineHeight}
        label={`lineHeight ${lineHeight.toFixed(2)}`}
      />
      <Slider
        value={letterSpacing}
        min={0}
        max={8}
        onChange={setLetterSpacing}
        label={`letterSpacing ${letterSpacing.toFixed(1)}px`}
      />
      <Checkbox label="textShadow" enabled={shadow} onChange={setShadow} />
    </node>
  );
}

function WrapControl() {
  const [mode, setMode] = useState<LineBreak>("wordBoundary");
  return (
    <node style={{ flexDirection: "column", alignItems: "center", gap: 16 }}>
      <node
        style={{
          width: 220,
          padding: 12,
          backgroundColor: Colors.surface100,
          borderRadius: 8,
        }}
      >
        <text
          style={{
            fontSize: FontSizes.sm,
            color: Colors.textColor200,
            lineBreak: mode,
          }}
        >
          Pneumonoultramicroscopicsilicovolcanoconiosis wraps differently per
          mode.
        </text>
      </node>
      <Radio value={mode} options={LINE_BREAKS} onChange={setMode} />
    </node>
  );
}
