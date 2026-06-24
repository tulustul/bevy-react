import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { Colors } from "@/theme";
import { controlColumn } from "./shared";

export function SpacingDemo() {
  return (
    <>
      <Example
        description="padding insets content from the node's own edges."
        typescript={`<node style={{ padding: 16 }} />`}
      >
        <PaddingControl />
      </Example>

      <Example
        description="gap spaces flex/grid children; rowGap/columnGap split it."
        typescript={`<node style={{ gap: 16 }} />`}
      >
        <GapControl />
      </Example>

      <Example
        description="margin pushes a node away from its siblings."
        typescript={`margin: { left: 24 }`}
      >
        <MarginControl />
      </Example>
    </>
  );
}

function PaddingControl() {
  const [p, setP] = useState(16);
  return (
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
  );
}

function GapControl() {
  const [g, setG] = useState(12);
  return (
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
  );
}

function MarginControl() {
  const [m, setM] = useState(24);
  return (
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
