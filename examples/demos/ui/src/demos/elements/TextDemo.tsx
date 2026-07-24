import { useState } from "react";
import type { BevyStyle } from "bevy-react/jsx";
import { Checkbox, DemoRow, Example, Radio, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "<text>",
  description:
    "The <text> host element renders styled glyph runs. fontSize and fontWeight scale and weight the type; fontFamily selects a font registered up front on the Rust side (ReactUiPlugin::new(bundle).font(name, path)) — fonts are not loaded from JS at runtime. <text> nests: an inner <text> restyles a span (color, weight) inline within its parent's run. lineHeight, letterSpacing and textShadow tune typography, and lineBreak picks the wrapping mode when text overflows its width.",
};

const SIZE_TS = `<text style={{ fontSize: 28, fontWeight: "bold" }}>
  Big & bold
</text>`;

// Font families are loaded upfront on the Rust side, then selected by name from React.
const FAMILY_RUST = `ReactUiPlugin::new(bundle)
    .font("DancingScript", "fonts/DancingScript-VariableFont_wght.ttf");`;

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
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <FontSizeDemo />
        <FontFamilyDemo />
      </DemoRow>

      <DemoRow>
        <TypographyDemo />
        <LineBreakDemo />
      </DemoRow>
    </>
  );
}

function FontSizeDemo() {
  const [size, setSize] = useState(28);
  return (
    <Example
      title="fontSize & fontWeight"
      description="fontSize and fontWeight scale text. Drag to resize."
      tsx={SIZE_TS}
    >
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
    </Example>
  );
}

function FontFamilyDemo() {
  return (
    <Example
      title="fontFamily & spans"
      description="Custom font families, and inline nested color spans within one <text>."
      rust={FAMILY_RUST}
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
  );
}

function TypographyDemo() {
  const [lineHeight, setLineHeight] = useState(1.4);
  const [letterSpacing, setLetterSpacing] = useState(1.5);
  const [shadow, setShadow] = useState(true);
  return (
    <Example
      title="Typography"
      description="lineHeight, letterSpacing, and textShadow tune typography. Drag the sliders and toggle the shadow."
      tsx={TYPOGRAPHY_TS}
    >
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
    </Example>
  );
}

function LineBreakDemo() {
  const [mode, setMode] = useState<LineBreak>("wordBoundary");
  return (
    <Example
      title="lineBreak"
      description="lineBreak controls wrapping when text overflows its width. Pick a mode."
      tsx={WRAP_TS}
    >
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
    </Example>
  );
}
