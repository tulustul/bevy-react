import { useState } from "react";
import type { BevyStyle } from "bevy-react/jsx";
import { Checkbox, DemoRow, Example, Radio, Slider } from "@/components";
import { B, Code, CodeTabs, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "<text>",
  info: (
    <>
      <P>
        <InlineCode>{"<text>"}</InlineCode> renders a run of styled glyphs — it
        is the only way to put text on screen (there is no bare-string rendering
        outside it). Font size, weight, family, color, line height, letter
        spacing, and shadow are all regular style fields.
      </P>
      <P>
        Nesting one <InlineCode>{"<text>"}</InlineCode> inside another restyles
        an <B>inline span</B> of the parent's run — that is how you color or
        bold part of a sentence. Spans do not inherit the parent's font
        settings: restate <InlineCode>fontSize</InlineCode> /{" "}
        <InlineCode>fontFamily</InlineCode> on the span if they should match.
      </P>
      <Code lang="tsx">{`<text style={{ fontSize: 18 }}>
  Nested <text style={{ color: "#7aa2f7", fontSize: 18 }}>spans</text> restyle
  part of a sentence.
</text>`}</Code>
      <P>
        Alignment-class fields (<InlineCode>textAlign</InlineCode>,{" "}
        <InlineCode>lineBreak</InlineCode>, <InlineCode>textShadow</InlineCode>)
        apply on the root <InlineCode>{"<text>"}</InlineCode> only. Click any
        example below for details and its code.
      </P>
    </>
  ),
};

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
  return (
    <Example
      title="Size and weight"
      info={
        <>
          <P>
            <InlineCode>fontSize</InlineCode> takes a number of logical pixels
            (or a unit string like <InlineCode>"2vw"</InlineCode> /{" "}
            <InlineCode>"1.5rem"</InlineCode>).{" "}
            <InlineCode>fontWeight</InlineCode> picks a named weight from{" "}
            <InlineCode>thin</InlineCode> to <InlineCode>black</InlineCode> —
            with a variable font, every step renders true.
          </P>
          <Code lang="tsx">{`<text style={{ fontSize: 28, fontWeight: "bold" }}>
  Big & bold
</text>`}</Code>
        </>
      }
      demo={FontSizeCard}
    />
  );
}

function FontSizeCard() {
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

function FontFamilyDemo() {
  return (
    <Example
      title="Fonts and spans"
      info={
        <>
          <P>
            Fonts are registered <B>up front on the Rust side</B> and selected
            by name from React — <InlineCode>fontFamily</InlineCode> cannot load
            a file at runtime. Inline spans (a nested{" "}
            <InlineCode>{"<text>"}</InlineCode>) recolor or re-weight part of
            one paragraph.
          </P>
          <CodeTabs
            tsx={`<text style={{ fontFamily: "DancingScript" }}>
  Styled with a custom font family
</text>

<text style={{ fontSize: 18 }}>
  Nested texts color{" "}
  <text style={{ color: "#7aa2f7", fontSize: 18 }}>part</text> of a sentence.
</text>`}
            rust={`ReactUiPlugin::new(bundle)
    .default_font("fonts/NotoSans.ttf")
    .font("DancingScript", "fonts/DancingScript.ttf")`}
          />
        </>
      }
      demo={FontFamilyCard}
    />
  );
}

function FontFamilyCard() {
  return (
    <>
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
    </>
  );
}

function TypographyDemo() {
  return (
    <Example
      title="Typography"
      info={
        <>
          <P>
            <InlineCode>lineHeight</InlineCode> (a multiple of the font size, or
            px), <InlineCode>letterSpacing</InlineCode> (px), and{" "}
            <InlineCode>textShadow</InlineCode> tune how a block of text sits on
            the page. All three are plain style fields — toggle or animate them
            like any other.
          </P>
          <Code lang="tsx">{`<text
  style={{
    lineHeight: 1.8,
    letterSpacing: 2,
    textShadow: { color: "#000", offsetX: 2, offsetY: 2 },
  }}
>
  {paragraph}
</text>`}</Code>
        </>
      }
      demo={TypographyCard}
    />
  );
}

function TypographyCard() {
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

function LineBreakDemo() {
  return (
    <Example
      title="Line breaking"
      info={
        <>
          <P>
            <InlineCode>lineBreak</InlineCode> picks the wrapping mode when text
            overflows its width: break at word boundaries (default), at any
            character, prefer words but fall back to characters, or never wrap
            at all. Root <InlineCode>{"<text>"}</InlineCode> only.
          </P>
          <Code lang="tsx">{`<text style={{ width: 220, lineBreak: "anyCharacter" }}>
  Pneumonoultramicroscopicsilicovolcanoconiosis
</text>`}</Code>
        </>
      }
      demo={LineBreakCard}
    />
  );
}

function LineBreakCard() {
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
