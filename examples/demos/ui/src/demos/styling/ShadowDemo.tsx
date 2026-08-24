import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Shadows",
  info: (
    <>
      <P>
        <InlineCode>boxShadow</InlineCode> casts a drop shadow behind the node's
        box: <InlineCode>color</InlineCode>, <InlineCode>blurRadius</InlineCode>
        , <InlineCode>spreadRadius</InlineCode>, and{" "}
        <InlineCode>xOffset/yOffset</InlineCode> to imply a light direction.
      </P>
      <Code lang="tsx">{`boxShadow: {
  color: "#FFFFFF33",
  xOffset: 8,
  yOffset: 8,
  blurRadius: 12,
  spreadRadius: 3,
}`}</Code>
      <P>
        An array stacks multiple shadows back-to-front. Shadows draw outside the
        box and never affect layout.
      </P>
    </>
  ),
};

export function ShadowDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <BlurDemo />
      <OffsetDemo />
      <StackedShadowsDemo />
    </DemoRow>
  );
}

function StackedShadowsDemo() {
  return (
    <Example
      title="Stacked shadows"
      info={
        <>
          <P>
            An array of shadows stacks back-to-front — here a tight red drop
            plus a wide soft glow.
          </P>
          <Code lang="tsx">{`boxShadow: [
  { color: "#FF000066", yOffset: 4, blurRadius: 6 },
  { color: "#4F8CFF55", blurRadius: 28, spreadRadius: 6 },
]`}</Code>
        </>
      }
      demo={StackedShadowsCard}
    />
  );
}

function StackedShadowsCard() {
  return (
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.surface100,
            boxShadow: [
              { color: "#FF000066", yOffset: 4, blurRadius: 6 },
              { color: "#4F8CFF55", blurRadius: 28, spreadRadius: 6 },
            ],
          }}
        />
      </node>
    </node>
  );
}

function BlurDemo() {
  return (
    <Example
      title="Blur and spread"
      info={
        <>
          <P>
            <InlineCode>blurRadius</InlineCode> softens the shadow's edge;{" "}
            <InlineCode>spreadRadius</InlineCode> grows it outward from the box
            before blurring. Drag both to shape the halo.
          </P>
          <Code lang="tsx">{`boxShadow: { color: "#FFFFFF33", blurRadius: 12, spreadRadius: 3 }`}</Code>
        </>
      }
      demo={BlurCard}
    />
  );
}

function BlurCard() {
  const [blur, setBlur] = useState(12);
  const [spread, setSpread] = useState(3);
  return (
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            boxShadow: {
              color: Colors.shadow200,
              blurRadius: blur,
              spreadRadius: spread,
            },
          }}
        />
      </node>
      <Slider
        value={blur}
        min={0}
        max={40}
        onChange={setBlur}
        label={`blurRadius ${blur.toFixed(0)}`}
      />
      <Slider
        value={spread}
        min={0}
        max={16}
        onChange={setSpread}
        label={`spreadRadius ${spread.toFixed(0)}`}
      />
    </node>
  );
}

function OffsetDemo() {
  return (
    <Example
      title="Offsets"
      info={
        <>
          <P>
            <InlineCode>xOffset / yOffset</InlineCode> push the shadow away from
            the box to imply a light direction — negative values move it the
            other way.
          </P>
          <Code lang="tsx">{`boxShadow: { xOffset: 8, yOffset: 8, blurRadius: 6 }`}</Code>
        </>
      }
      demo={OffsetCard}
    />
  );
}

function OffsetCard() {
  const [x, setX] = useState(8);
  const [y, setY] = useState(8);
  return (
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.red100,
            boxShadow: {
              color: Colors.shadow200,
              xOffset: x,
              yOffset: y,
              blurRadius: 6,
            },
          }}
        />
      </node>
      <Slider
        value={x}
        min={-24}
        max={24}
        onChange={setX}
        label={`xOffset ${x.toFixed(0)}`}
      />
      <Slider
        value={y}
        min={-24}
        max={24}
        onChange={setY}
        label={`yOffset ${y.toFixed(0)}`}
      />
    </node>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};
