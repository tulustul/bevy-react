import { useState } from "react";
import { InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import {
  Box,
  ControlColumn,
  DemoRow,
  Example,
  Slider,
  Stage,
} from "@/components";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";

const PAGE: ExplanationData = {
  title: "Shadows",
  info: (
    <>
      <Paragraph>
        <InlineCode>boxShadow</InlineCode> casts a drop shadow behind the node's
        box: <InlineCode>color</InlineCode>, <InlineCode>blurRadius</InlineCode>
        , <InlineCode>spreadRadius</InlineCode>, and{" "}
        <InlineCode>xOffset/yOffset</InlineCode> to imply a light direction.
      </Paragraph>
      <Code lang="tsx">{`boxShadow: {
  color: "#FFFFFF33",
  xOffset: 8,
  yOffset: 8,
  blurRadius: 12,
  spreadRadius: 3,
}`}</Code>
      <Paragraph>
        An array stacks multiple shadows back-to-front. Shadows draw outside the
        box and never affect layout.
      </Paragraph>
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
          <Paragraph>
            An array of shadows stacks back-to-front — here a tight red drop
            plus a wide soft glow.
          </Paragraph>
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
    <ControlColumn>
      <Stage style={stage}>
        <Box
          style={{
            backgroundColor: Colors.surface100,
            boxShadow: [
              { color: "#FF000066", yOffset: 4, blurRadius: 6 },
              { color: "#4F8CFF55", blurRadius: 28, spreadRadius: 6 },
            ],
          }}
        />
      </Stage>
    </ControlColumn>
  );
}

function BlurDemo() {
  return (
    <Example
      title="Blur and spread"
      info={
        <>
          <Paragraph>
            <InlineCode>blurRadius</InlineCode> softens the shadow's edge;{" "}
            <InlineCode>spreadRadius</InlineCode> grows it outward from the box
            before blurring. Drag both to shape the halo.
          </Paragraph>
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
    <ControlColumn>
      <Stage style={stage}>
        <Box
          style={{
            boxShadow: {
              color: Colors.shadow200,
              blurRadius: blur,
              spreadRadius: spread,
            },
          }}
        />
      </Stage>
      <Slider
        value={blur}
        min={0}
        max={40}
        onChange={setBlur}
        name="blurRadius"
      />
      <Slider
        value={spread}
        min={0}
        max={16}
        onChange={setSpread}
        name="spreadRadius"
      />
    </ControlColumn>
  );
}

function OffsetDemo() {
  return (
    <Example
      title="Offsets"
      info={
        <>
          <Paragraph>
            <InlineCode>xOffset / yOffset</InlineCode> push the shadow away from
            the box to imply a light direction — negative values move it the
            other way.
          </Paragraph>
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
    <ControlColumn>
      <Stage style={stage}>
        <Box
          style={{
            backgroundColor: Colors.red100,
            boxShadow: {
              color: Colors.shadow200,
              xOffset: x,
              yOffset: y,
              blurRadius: 6,
            },
          }}
        />
      </Stage>
      <Slider value={x} min={-24} max={24} onChange={setX} name="xOffset" />
      <Slider value={y} min={-24} max={24} onChange={setY} name="yOffset" />
    </ControlColumn>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  // deliberately roomy: the shadows need somewhere to fall
  padding: 32,
};
