import { useState } from "react";
import { DemoRow, Example, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Borders",
  info: (
    <>
      <P>
        <InlineCode>border</InlineCode> sets the edge width — and it
        participates in layout, so a thicker border takes real space.{" "}
        <InlineCode>borderColor</InlineCode> paints it, and{" "}
        <InlineCode>borderRadius</InlineCode> rounds the corners.
      </P>
      <Code lang="tsx">{`<node
  style={{
    border: 2,
    borderColor: "#7aa2f7",
    borderRadius: { top: 0, right: 10, bottom: 20, left: 60 },
  }}
/>`}</Code>
      <P>
        Each of the three accepts a single value or a per-side{" "}
        <InlineCode>{"{ top, right, bottom, left }"}</InlineCode> object.{" "}
        <InlineCode>outline</InlineCode> draws an extra ring outside the box —{" "}
        <InlineCode>width</InlineCode>, <InlineCode>offset</InlineCode>,{" "}
        <InlineCode>color</InlineCode> — and is ignored by layout.
      </P>
    </>
  ),
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
  return (
    <Example
      title="Rounded corners"
      info={
        <>
          <P>
            <InlineCode>borderRadius</InlineCode> rounds the corners. Drag the
            slider from a square corner all the way to a pill.
          </P>
          <Code lang="tsx">{`<node style={{ borderRadius: 16 }} />`}</Code>
        </>
      }
      demo={BorderRadiusCard}
    />
  );
}

function BorderRadiusCard() {
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

function BorderWidthDemo() {
  return (
    <Example
      title="Border width and color"
      info={
        <>
          <P>
            <InlineCode>border</InlineCode> adds an edge of the given width,
            painted by <InlineCode>borderColor</InlineCode>. The width is part
            of layout, so growing it shrinks the content box.
          </P>
          <Code lang="tsx">{`<node style={{ border: 2, borderColor: "#7aa2f7" }} />`}</Code>
        </>
      }
      demo={BorderWidthCard}
    />
  );
}

function BorderWidthCard() {
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

function PerSideDemo() {
  return (
    <Example
      title="Per-side values"
      info={
        <>
          <P>
            Every border attribute also takes a per-side{" "}
            <InlineCode>{"{ top, right, bottom, left }"}</InlineCode> object, so
            each edge can have its own width, color, and corner radius.
          </P>
          <Code lang="tsx">{`<node
  style={{
    borderRadius: { top: 0, right: 10, bottom: 20, left: 60 },
    border: { top: 3, right: 6, bottom: 9, left: 12 },
    borderColor: {
      top: "#7aa2f7",
      right: "#f9e2af",
      bottom: "#f7768e",
      left: "#9ece6a",
    },
  }}
/>`}</Code>
        </>
      }
      demo={PerSideCard}
    />
  );
}

function PerSideCard() {
  return (
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
  );
}

function OutlineDemo() {
  return (
    <Example
      title="Outlines"
      info={
        <>
          <P>
            <InlineCode>outline</InlineCode> draws a ring outside the box — it
            is ignored by layout, so changing its width or offset never moves
            anything. Drag the offset to float the ring away from the edge.
          </P>
          <Code lang="tsx">{`<node
  style={{ outline: { width: 3, offset: 4, color: "#f9e2af" } }}
/>`}</Code>
        </>
      }
      demo={OutlineCard}
    />
  );
}

function OutlineCard() {
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
