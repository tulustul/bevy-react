import { useState } from "react";
import { DemoRow, Example, Radio, RadioOption, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors, FontSizes } from "@/theme";
import { box, controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Colors",
  info: (
    <>
      <P>
        The color-valued style props: <InlineCode>backgroundColor</InlineCode>{" "}
        fills a node, <InlineCode>borderColor</InlineCode> paints the edge laid
        out by <InlineCode>border</InlineCode>, and{" "}
        <InlineCode>color</InlineCode> sets text color (inheriting into
        bare-string children).
      </P>
      <Code lang="tsx">{`backgroundColor: "#7aa2f7"
backgroundColor: "tomato"
backgroundColor: "rgb(255 255 255 / 5%)"
backgroundColor: "hsl(140 70% 45%)"
backgroundColor: "oklch(0.7 0.15 30)"`}</Code>
      <P>
        Any CSS color string works — hex, named colors,{" "}
        <InlineCode>rgb()/hsl()/oklch()</InlineCode>, or{" "}
        <InlineCode>transparent</InlineCode>. An invalid string falls back with
        a devtools warning, never a crash.
      </P>
    </>
  ),
};

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export function ColorsDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <BackgroundColorDemo />
        <BorderColorDemo />
        <TextColorDemo />
      </DemoRow>
      <DemoRow>
        <ColorFormatsDemo />
      </DemoRow>
    </>
  );
}

const COLOR_FORMATS: string[] = [
  "tomato",
  "rgb(122 162 247)",
  "rgb(122, 62, 247)",
  "rgb(255 255 255 / 5%)",
  "hsl(140 70% 45%)",
  "oklch(0.7 0.15 30)",
  "#bb9af7",
];

function ColorFormatsDemo() {
  return (
    <Example
      title="Color formats"
      info={
        <>
          <P>
            One swatch per syntax family — hex, named colors, modern and legacy{" "}
            <InlineCode>rgb()</InlineCode>, <InlineCode>hsl()</InlineCode>,{" "}
            <InlineCode>oklch()</InlineCode>, and percentage alpha.
          </P>
          <Code lang="tsx">{`<node style={{ backgroundColor: "oklch(0.7 0.15 30)" }} />`}</Code>
        </>
      }
      demo={ColorFormatsCard}
    />
  );
}

function ColorFormatsCard() {
  return (
    <node
      style={{
        gap: 10,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
      }}
    >
      {COLOR_FORMATS.map((color) => (
        <node
          key={color}
          style={{
            width: 150,
            height: 76,
            borderRadius: 10,
            backgroundColor: color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <text
            style={{
              color: Colors.textColor400,
              fontSize: FontSizes.xs,
              fontWeight: "bold",
            }}
          >
            {color}
          </text>
        </node>
      ))}
    </node>
  );
}

function BackgroundColorDemo() {
  return (
    <Example
      title="backgroundColor"
      info={
        <>
          <P>
            <InlineCode>backgroundColor</InlineCode> fills the node's box. Mix
            it live from R/G/B channels — a plain string prop, cheap to change
            every frame.
          </P>
          <Code lang="tsx">{`<node style={{ backgroundColor: \`#\${r}\${g}\${b}\` }} />`}</Code>
        </>
      }
      demo={BackgroundColorCard}
    />
  );
}

function BackgroundColorCard() {
  const [r, setR] = useState(122);
  const [g, setG] = useState(162);
  const [b, setB] = useState(247);
  const color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return (
    <node style={controlColumn}>
      <node style={{ ...box, width: 110, height: 72, backgroundColor: color }}>
        <text
          style={{
            color: Colors.textColor400,
            fontSize: FontSizes.xs,
            fontWeight: "bold",
          }}
        >
          {color}
        </text>
      </node>
      <Slider
        value={r}
        min={0}
        max={255}
        onChange={setR}
        label={`R ${r.toFixed(0)}`}
      />
      <Slider
        value={g}
        min={0}
        max={255}
        onChange={setG}
        label={`G ${g.toFixed(0)}`}
      />
      <Slider
        value={b}
        min={0}
        max={255}
        onChange={setB}
        label={`B ${b.toFixed(0)}`}
      />
    </node>
  );
}

const BORDER_OPTIONS: RadioOption<string>[] = [
  { label: "blue", value: Colors.primary100 },
  { label: "green", value: Colors.green100 },
  { label: "red", value: Colors.red100 },
  { label: "purple", value: Colors.purple100 },
];

function BorderColorDemo() {
  return (
    <Example
      title="borderColor"
      info={
        <>
          <P>
            <InlineCode>border</InlineCode> lays out the edge width;{" "}
            <InlineCode>borderColor</InlineCode> paints it. See the Borders page
            for per-side widths and radius.
          </P>
          <Code lang="tsx">{`<node style={{ border: 4, borderColor: "#bb9af7" }} />`}</Code>
        </>
      }
      demo={BorderColorCard}
    />
  );
}

function BorderColorCard() {
  const [c, setC] = useState<string>(Colors.purple100);
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...box,
          backgroundColor: Colors.surface200,
          border: 4,
          borderColor: c,
        }}
      />
      <Radio options={BORDER_OPTIONS} value={c} onChange={setC} />
    </node>
  );
}

const TEXT_OPTIONS: RadioOption<string>[] = [
  { label: "amber", value: Colors.amber100 },
  { label: "sky", value: Colors.sky100 },
  { label: "green", value: Colors.green100 },
  { label: "red", value: Colors.red100 },
];

function TextColorDemo() {
  return (
    <Example
      title="color"
      info={
        <>
          <P>
            <InlineCode>color</InlineCode> sets the text color. Nested{" "}
            <InlineCode>{"<text>"}</InlineCode> spans can override it for inline
            runs.
          </P>
          <Code lang="tsx">{`<text style={{ color: "#f9e2af" }}>Colored text</text>`}</Code>
        </>
      }
      demo={TextColorCard}
    />
  );
}

function TextColorCard() {
  const [c, setC] = useState<string>(Colors.amber100);
  return (
    <node style={controlColumn}>
      <text style={{ color: c, fontSize: FontSizes.xxl, fontWeight: "bold" }}>
        Colored text
      </text>
      <Radio options={TEXT_OPTIONS} value={c} onChange={setC} />
    </node>
  );
}
