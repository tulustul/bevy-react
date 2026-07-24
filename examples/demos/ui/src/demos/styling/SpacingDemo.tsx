import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Spacing",
  description: `padding insets a node's content from its own edges, margin
pushes the node away from its siblings, and gap spaces flex/grid children
(rowGap/columnGap split it per axis). All accept bare px numbers, unit
strings, and — for padding and margin — per-side
{ top, right, bottom, left } objects.`,
};

export function SpacingDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <PaddingDemo />
      <GapDemo />
      <MarginDemo />
    </DemoRow>
  );
}

function PaddingDemo() {
  const [p, setP] = useState(16);
  return (
    <Example
      title="padding"
      description="padding insets content from the node's own edges."
      tsx={`<node style={{ padding: 16 }} />`}
    >
      <node style={controlColumn}>
        <node style={{ ...wrap, padding: p }}>
          <node style={inner} />
        </node>
        <Slider
          value={p}
          min={0}
          max={40}
          onChange={setP}
          label={`padding ${p.toFixed(0)}`}
        />
      </node>
    </Example>
  );
}

function GapDemo() {
  const [g, setG] = useState(12);
  return (
    <Example
      title="gap"
      description="gap spaces flex/grid children; rowGap/columnGap split it."
      tsx={`<node style={{ gap: 16 }} />`}
    >
      <node style={controlColumn}>
        <node style={{ ...wrap, flexDirection: "row", gap: g }}>
          <node style={inner} />
          <node style={{ ...inner, backgroundColor: Colors.purple100 }} />
          <node style={{ ...inner, backgroundColor: Colors.yellow100 }} />
        </node>
        <Slider
          value={g}
          min={0}
          max={32}
          onChange={setG}
          label={`gap ${g.toFixed(0)}`}
        />
      </node>
    </Example>
  );
}

function MarginDemo() {
  const [m, setM] = useState(24);
  return (
    <Example
      title="margin"
      description="margin pushes a node away from its siblings."
      tsx={`margin: { left: 24 }`}
    >
      <node style={controlColumn}>
        <node style={{ ...wrap, flexDirection: "row" }}>
          <node
            style={{
              ...inner,
              backgroundColor: Colors.green100,
              margin: { left: m },
            }}
          />
        </node>
        <Slider
          value={m}
          min={0}
          max={48}
          onChange={setM}
          label={`margin.left ${m.toFixed(0)}`}
        />
      </node>
    </Example>
  );
}

const wrap: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: 8,
  backgroundColor: Colors.surface100,
  borderRadius: 10,
};

const inner: BevyStyle = {
  width: 36,
  height: 36,
  borderRadius: 6,
  backgroundColor: Colors.primary100,
};
