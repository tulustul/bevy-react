import { useState } from "react";
import { DemoRow, Example, Radio, RadioOption, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors, FontSizes } from "@/theme";
import { box, controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Colors",
  description: `Color-valued style props: backgroundColor fills a node,
borderColor paints the edge laid out by border, and color sets text color
(inheriting into nested <text>). Any CSS color string works — hex, named
colors, rgb()/hsl()/oklch(), or transparent.`,
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
      description="Any CSS color works: hex, named, rgb()/hsl()/oklch(), or transparent."
      tsx={`backgroundColor: "rebeccapurple""`}
    >
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
    </Example>
  );
}

function BackgroundColorDemo() {
  const [r, setR] = useState(122);
  const [g, setG] = useState(162);
  const [b, setB] = useState(247);
  const color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return (
    <Example
      title="backgroundColor"
      description="backgroundColor fills a node. Mix it from R/G/B channels."
      tsx={`<node style={{ backgroundColor: "#7aa2f7" }} />`}
    >
      <node style={controlColumn}>
        <node
          style={{ ...box, width: 110, height: 72, backgroundColor: color }}
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
    </Example>
  );
}

const BORDER_OPTIONS: RadioOption<string>[] = [
  { label: "blue", value: Colors.primary100 },
  { label: "green", value: Colors.green100 },
  { label: "red", value: Colors.red100 },
  { label: "purple", value: Colors.purple100 },
];

function BorderColorDemo() {
  const [c, setC] = useState<string>(Colors.purple100);
  return (
    <Example
      title="borderColor"
      description="borderColor paints the edge laid out by `border`."
      tsx={`border: 4, borderColor: "#bb9af7"`}
    >
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
    </Example>
  );
}

const TEXT_OPTIONS: RadioOption<string>[] = [
  { label: "amber", value: Colors.amber100 },
  { label: "sky", value: Colors.sky100 },
  { label: "green", value: Colors.green100 },
  { label: "red", value: Colors.red100 },
];

function TextColorDemo() {
  const [c, setC] = useState<string>(Colors.amber100);
  return (
    <Example
      title="color"
      description="color sets text color and inherits into nested <text>."
      tsx={`<text style={{ color: "#f9e2af" }}>`}
    >
      <node style={controlColumn}>
        <text style={{ color: c, fontSize: FontSizes.xxl, fontWeight: "bold" }}>
          Colored text
        </text>
        <Radio options={TEXT_OPTIONS} value={c} onChange={setC} />
      </node>
    </Example>
  );
}
