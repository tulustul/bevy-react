import { useState } from "react";
import { DemoRow, Example, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Borders",
  description: `border sets the edge width (it participates in layout),
borderColor paints it, and borderRadius rounds the corners. Each accepts a
single value or a per-side { top, right, bottom, left } object. outline draws
an extra ring outside the box — width, offset, color — and is ignored by
layout.`,
};

export function BordersDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <BorderRadiusDemo />
        <BorderWidthDemo />
      </DemoRow>
      <DemoRow>
        <PerSideDemo />
        <OutlineDemo />
      </DemoRow>
    </>
  );
}

function BorderRadiusDemo() {
  const [r, setR] = useState(16);
  return (
    <Example
      title="borderRadius"
      description="borderRadius rounds the corners. Drag from square to pill."
      tsx={`<node style={{ borderRadius: 16 }} />`}
    >
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
    </Example>
  );
}

function BorderWidthDemo() {
  const [w, setW] = useState(2);
  return (
    <Example
      title="border"
      description="border adds an edge, painted by borderColor."
      tsx={`border: 2, borderColor: "#7aa2f7"`}
    >
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
    </Example>
  );
}

function PerSideDemo() {
  return (
    <Example
      title="Per-side values"
      description="Each border attribute also takes a per-side object"
      tsx={`borderRadius:
  { top, right, bottom, left }
borderColor:
  { top, right, bottom, left }
border:
  { top, right, bottom, left }`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.surface200,
            borderRadius: {
              top: 0,
              right: 10,
              bottom: 20,
              left: 60,
            },
            border: {
              top: 3,
              right: 6,
              bottom: 9,
              left: 12,
            },
            borderColor: {
              top: Colors.primary100,
              right: Colors.amber100,
              bottom: Colors.red100,
              left: Colors.green100,
            },
          }}
        />
      </node>
    </Example>
  );
}

function OutlineDemo() {
  const [offset, setOffset] = useState(4);
  return (
    <Example
      title="outline"
      description="outline draws a ring outside the box, ignored by layout."
      tsx={`outline: {
  width: 3,
  offset: 4,
  color: "#f9e2af",
}`}
    >
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
    </Example>
  );
}
