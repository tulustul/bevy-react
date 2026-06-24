import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "../../components";
import { Colors } from "../../theme";
import { controlColumn } from "./shared";

export function SizingDemo() {
  return (
    <>
      <Example
        description="width/height take pixels, percentages, or viewport units."
        typescript={`<node style={{ width: "60%" }} />`}
      >
        <WidthControl />
      </Example>

      <Example
        description="aspectRatio derives the missing dimension from the given one."
        typescript={`height: 50, aspectRatio: 1.6`}
      >
        <AspectControl />
      </Example>

      <Example
        description="minWidth/maxWidth clamp an otherwise flexible size."
        typescript={`width: "100%", maxWidth: 160`}
      >
        <MaxWidthControl />
      </Example>
    </>
  );
}

function WidthControl() {
  const [w, setW] = useState(60);
  return (
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
  );
}

function AspectControl() {
  const [ar, setAr] = useState(1.6);
  return (
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
  );
}

function MaxWidthControl() {
  const [max, setMax] = useState(160);
  return (
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
