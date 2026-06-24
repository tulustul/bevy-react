import { useState } from "react";
import { Example, Slider } from "@/components";
import { Colors } from "@/theme";
import { box, controlColumn } from "./shared";

export function BordersDemo() {
  return (
    <>
      <Example
        description="borderRadius rounds the corners. Drag from square to pill."
        typescript={`<node style={{ borderRadius: 16 }} />`}
      >
        <RadiusControl />
      </Example>

      <Example
        description="border adds an edge, painted by borderColor."
        typescript={`border: 2, borderColor: "#7aa2f7"`}
      >
        <WidthControl />
      </Example>

      <Example
        description="outline draws a ring outside the box, ignored by layout."
        typescript={`outline: { width: 3, offset: 4, color: "#f9e2af" }`}
      >
        <OutlineControl />
      </Example>
    </>
  );
}

function RadiusControl() {
  const [r, setR] = useState(16);
  return (
    <node style={controlColumn}>
      <node style={{ ...box, borderRadius: r }} />
      <Slider
        value={r}
        min={0}
        max={36}
        onChange={setR}
        label={`borderRadius ${r.toFixed(0)}`}
      />
    </node>
  );
}

function WidthControl() {
  const [w, setW] = useState(2);
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...box,
          backgroundColor: Colors.surface200,
          border: w,
          borderColor: Colors.primary100,
        }}
      />
      <Slider
        value={w}
        min={0}
        max={12}
        onChange={setW}
        label={`border ${w.toFixed(0)}`}
      />
    </node>
  );
}

function OutlineControl() {
  const [offset, setOffset] = useState(4);
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...box,
          outline: { width: 3, offset, color: Colors.amber100 },
        }}
      />
      <Slider
        value={offset}
        min={0}
        max={16}
        onChange={setOffset}
        label={`outline offset ${offset.toFixed(0)}`}
      />
    </node>
  );
}
