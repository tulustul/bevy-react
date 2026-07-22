import { useState } from "react";
import { Checkbox, Example, ProgressBar, Slider } from "@/components";
import { Colors } from "@/theme";
import { box, controlColumn, row } from "./shared";
import { TestBanner } from "@/components/TestBanner";

export function OpacityDemo() {
  return (
    <>
      <Example
        description="opacity fades a node and its children together. Drag to fade."
        tsx={`<node style={{ opacity: 0.4 }} />`}
      >
        <OpacityControl />
      </Example>

      <Example
        description="opacity on a node with children promotes the subtree to a
composited layer: the whole widget fades as one group, so
overlapping translucent pieces never show through each other. groupAlpha:
false opts out — each node fades on its own (watch the seams appear)."
        tsx={`<node style={{ opacity, groupAlpha }}>…</node>`}
      >
        <GroupOpacityControl />
      </Example>

      <Example
        description="display: none removes a node from layout entirely."
        tsx={`<node style={{ display: "none" }} />`}
      >
        <DisplayControl />
      </Example>
    </>
  );
}

function OpacityControl() {
  const [opacity, setOpacity] = useState(0.4);
  return (
    <node style={controlColumn}>
      <node style={{ ...box, opacity }} />
      <Slider
        value={opacity}
        min={0}
        max={1}
        onChange={setOpacity}
        label={`opacity ${opacity.toFixed(2)}`}
      />
    </node>
  );
}

function GroupOpacityControl() {
  const [opacity, setOpacity] = useState(0.7);
  const [groupAlpha, setGroupAlpha] = useState(true);
  return (
    <node style={controlColumn}>
      <TestBanner
        style={{
          margin: { left: -40, top: -20 },
          positionType: "absolute",
        }}
      />
      <TestBanner
        style={{ opacity, groupAlpha, margin: { left: 40, top: 20 } }}
      />
      <Slider
        value={opacity}
        min={0}
        max={1}
        onChange={setOpacity}
        label={`opacity ${opacity.toFixed(2)}`}
      />
      <Checkbox
        label="groupAlpha"
        enabled={groupAlpha}
        onChange={setGroupAlpha}
      />
    </node>
  );
}

function DisplayControl() {
  const [hidden, setHidden] = useState(false);
  return (
    <node style={controlColumn}>
      <node style={row}>
        <node style={box} />
        <node
          style={{
            ...box,
            backgroundColor: Colors.green100,
            display: hidden ? "none" : "flex",
          }}
        />
        <node style={{ ...box, backgroundColor: Colors.purple100 }} />
      </node>
      <Checkbox label="Hide middle box" enabled={hidden} onChange={setHidden} />
    </node>
  );
}
