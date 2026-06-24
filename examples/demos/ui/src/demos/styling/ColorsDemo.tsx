import { useState } from "react";
import { Example, Radio, RadioOption, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { box, controlColumn } from "./shared";

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export function ColorsDemo() {
  return (
    <>
      <Example
        description="backgroundColor fills a node. Mix it from R/G/B channels."
        typescript={`<node style={{ backgroundColor: "#7aa2f7" }} />`}
      >
        <BackgroundControl />
      </Example>

      <Example
        description="borderColor paints the edge laid out by `border`."
        typescript={`border: 4, borderColor: "#bb9af7"`}
      >
        <BorderColorControl />
      </Example>

      <Example
        description="color sets text color and inherits into nested <text>."
        typescript={`<text style={{ color: "#f9e2af" }}>`}
      >
        <TextColorControl />
      </Example>
    </>
  );
}

function BackgroundControl() {
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

function BorderColorControl() {
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

function TextColorControl() {
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
