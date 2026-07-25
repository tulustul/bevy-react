import { useState } from "react";
import { Checkbox, DemoRow, Example, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, controlColumn, row } from "./shared";
import { TestBanner } from "@/components/TestBanner";

const PAGE: ExplanationData = {
  title: "Opacity",
  description: `opacity fades a node and its children. On a node with
children it promotes the subtree to a composited layer and fades it as one
group (web semantics), so overlapping translucent pieces never show through
each other; groupAlpha: false opts out to per-node fading. display: "none"
removes a node from layout entirely.`,
};

export function OpacityDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <BasicOpacityDemo />
        <GroupAlphaDemo />
      </DemoRow>
      <DemoRow>
        <DisplayNoneDemo />
      </DemoRow>
    </>
  );
}

function BasicOpacityDemo() {
  const [opacity, setOpacity] = useState(0.4);
  return (
    <Example
      title="opacity"
      description="opacity fades a node and its children together. Drag to fade."
      tsx={`<node style={{ opacity: 0.4 }} />`}
    >
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
    </Example>
  );
}

function GroupAlphaDemo() {
  const [opacity, setOpacity] = useState(0.7);
  const [groupAlpha, setGroupAlpha] = useState(true);
  return (
    <Example
      title="groupAlpha"
      description="opacity on a node with children promotes the subtree to a
composited layer: the whole widget fades as one group, so
overlapping translucent pieces never show through each other. groupAlpha:
false opts out — each node fades on its own (watch the seams appear)."
      tsx={`<node style={{
  opacity,
  groupAlpha,
}}>…</node>`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            margin: { left: -40 },
            positionType: "absolute",
          }}
        />
        <TestBanner
          style={{ opacity, groupAlpha, margin: { left: 40, top: 40 } }}
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
    </Example>
  );
}

function DisplayNoneDemo() {
  const [hidden, setHidden] = useState(false);
  return (
    <Example
      title="display: none"
      description="display: none removes a node from layout entirely."
      tsx={`<node style={{ display: "none" }} />`}
    >
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
        <Checkbox
          label="Hide middle box"
          enabled={hidden}
          onChange={setHidden}
        />
      </node>
    </Example>
  );
}
