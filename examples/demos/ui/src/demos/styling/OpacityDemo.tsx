import { useState } from "react";
import { Checkbox, DemoRow, Example, Slider } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, controlColumn, row } from "./shared";
import { TestBanner } from "@/components/TestBanner";

const PAGE: ExplanationData = {
  title: "Opacity",
  info: (
    <>
      <P>
        <InlineCode>opacity</InlineCode> fades a node and its children. On a
        node with children it promotes the subtree to a <B>composited layer</B>{" "}
        and fades it as one group (web semantics), so overlapping translucent
        pieces never show through each other;{" "}
        <InlineCode>groupAlpha: false</InlineCode> opts out to per-node fading.
      </P>
      <Code lang="tsx">{`<node style={{ opacity: 0.4 }}>…</node>
<node style={{ opacity: 0.4, groupAlpha: false }}>…</node>
<node style={{ display: "none" }} />`}</Code>
      <P>
        <InlineCode>display: "none"</InlineCode> is the other way to make a node
        disappear — it removes the node from layout entirely instead of fading
        it.
      </P>
    </>
  ),
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
  return (
    <Example
      title="Node opacity"
      info={
        <>
          <P>
            <InlineCode>opacity</InlineCode> fades a node and its children
            together. Drag the slider to fade the box in and out.
          </P>
          <Code lang="tsx">{`<node style={{ opacity: 0.4 }} />`}</Code>
        </>
      }
      demo={BasicOpacityCard}
    />
  );
}

function BasicOpacityCard() {
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

function GroupAlphaDemo() {
  return (
    <Example
      title="Group alpha"
      info={
        <>
          <P>
            <InlineCode>opacity</InlineCode> on a node with children promotes
            the subtree to a composited layer: the whole widget fades as one
            group, so overlapping translucent pieces never show through each
            other. <InlineCode>groupAlpha: false</InlineCode> opts out — each
            node fades on its own (watch the seams appear).
          </P>
          <Code lang="tsx">{`<node style={{ opacity, groupAlpha }}>…</node>`}</Code>
        </>
      }
      demo={GroupAlphaCard}
    />
  );
}

function GroupAlphaCard() {
  const [opacity, setOpacity] = useState(0.7);
  const [groupAlpha, setGroupAlpha] = useState(true);
  return (
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
  );
}

function DisplayNoneDemo() {
  return (
    <Example
      title="Hiding nodes"
      info={
        <>
          <P>
            <InlineCode>display: "none"</InlineCode> removes a node from layout
            entirely — the remaining siblings close the gap, unlike a fade to{" "}
            <InlineCode>opacity: 0</InlineCode>.
          </P>
          <Code lang="tsx">{`<node style={{ display: hidden ? "none" : "flex" }} />`}</Code>
        </>
      }
      demo={DisplayNoneCard}
    />
  );
}

function DisplayNoneCard() {
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
