import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Sizing",
  description: `width/height size a node in pixels, percentages of the
parent, or viewport units; auto (the default) sizes from content and flex.
aspectRatio derives the missing dimension from the given one.
minWidth/maxWidth (and their height twins) clamp an otherwise flexible size.`,
};

export function SizingDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <WidthDemo />
      <AspectRatioDemo />
      <MaxWidthDemo />
    </DemoRow>
  );
}

function WidthDemo() {
  const [w, setW] = useState(60);
  return (
    <Example
      title="width"
      description="width/height take pixels, percentages, or viewport units."
      tsx={`<node style={{ width: "60%" }} />`}
    >
      <node style={controlColumn}>
        <node style={track}>
          <node style={{ ...bar, width: `${Math.round(w)}%` }} />
        </node>
        <Slider
          value={w}
          min={10}
          max={100}
          onChange={setW}
          label={`width ${w.toFixed(0)}%`}
        />
      </node>
    </Example>
  );
}

function AspectRatioDemo() {
  const [ar, setAr] = useState(1.6);
  return (
    <Example
      title="aspectRatio"
      description="aspectRatio derives the missing dimension from the given one."
      tsx={`height: 50, aspectRatio: 1.6`}
    >
      <node style={controlColumn}>
        <node
          style={{
            height: 50,
            aspectRatio: ar,
            borderRadius: 10,
            backgroundColor: Colors.red100,
          }}
        />
        <Slider
          value={ar}
          min={0.5}
          max={2.5}
          onChange={setAr}
          label={`aspectRatio ${ar.toFixed(2)}`}
        />
      </node>
    </Example>
  );
}

function MaxWidthDemo() {
  const [max, setMax] = useState(160);
  return (
    <Example
      title="maxWidth"
      description="minWidth/maxWidth clamp an otherwise flexible size."
      tsx={`width: "100%", maxWidth: 160`}
    >
      <node style={controlColumn}>
        <node style={track}>
          <node
            style={{
              ...bar,
              width: "100%",
              maxWidth: max,
              backgroundColor: Colors.yellow100,
            }}
          />
        </node>
        <Slider
          value={max}
          min={40}
          max={240}
          onChange={setMax}
          label={`maxWidth ${max.toFixed(0)}`}
        />
      </node>
    </Example>
  );
}

const track: BevyStyle = {
  flexDirection: "column",
  width: 240,
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const bar: BevyStyle = {
  height: 26,
  borderRadius: 6,
  backgroundColor: Colors.primary100,
};
