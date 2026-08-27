import { useState } from "react";
import { InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import { ControlColumn, DemoRow, Example, Slider, Stage } from "@/components";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";

const PAGE: ExplanationData = {
  title: "Spacing",
  info: (
    <>
      <Paragraph>
        Three props cover spacing: <InlineCode>padding</InlineCode> insets a
        node's content from its own edges, <InlineCode>margin</InlineCode>{" "}
        pushes the node away from its siblings, and <InlineCode>gap</InlineCode>{" "}
        spaces flex/grid children (<InlineCode>rowGap</InlineCode> /{" "}
        <InlineCode>columnGap</InlineCode> split it per axis).
      </Paragraph>
      <Code lang="tsx">{`<node style={{ padding: 16, gap: 12 }}>
  <node style={{ margin: { left: 24 } }} />
</node>`}</Code>
      <Paragraph>
        All of them accept bare px numbers and unit strings;{" "}
        <InlineCode>padding</InlineCode> and <InlineCode>margin</InlineCode>{" "}
        additionally take per-side{" "}
        <InlineCode>{"{ top, right, bottom, left }"}</InlineCode> objects, or an
        axis pair <InlineCode>{"{ horizontal, vertical }"}</InlineCode> —{" "}
        <InlineCode>horizontal</InlineCode> sets left and right,{" "}
        <InlineCode>vertical</InlineCode> sets top and bottom.
      </Paragraph>
    </>
  ),
};

export function SpacingDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <PaddingDemo />
      <AxisPaddingDemo />
      <GapDemo />
      <MarginDemo />
    </DemoRow>
  );
}

function PaddingDemo() {
  return (
    <Example
      title="Padding"
      info={
        <>
          <Paragraph>
            <InlineCode>padding</InlineCode> insets content from the node's own
            edges — drag the slider and watch the outer box grow around the
            fixed-size inner one.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ padding: 16 }} />`}</Code>
        </>
      }
      demo={PaddingCard}
    />
  );
}

function PaddingCard() {
  const [p, setP] = useState(16);
  return (
    <ControlColumn>
      <Stage style={{ ...wrap, padding: p }}>
        <node style={inner} />
      </Stage>
      <Slider value={p} min={0} max={40} onChange={setP} name="padding" />
    </ControlColumn>
  );
}

function AxisPaddingDemo() {
  return (
    <Example
      title="Axis pairs"
      info={
        <>
          <Paragraph>
            An axis pair sets both sides at once —{" "}
            <InlineCode>horizontal</InlineCode> is left and right,{" "}
            <InlineCode>vertical</InlineCode> is top and bottom. Drag the two
            sliders to inset the box per axis.
          </Paragraph>
          <Code lang="tsx">{`<node
  style={{
    padding: {
      horizontal: 24,
      vertical: 8,
    },
  }}
/>`}</Code>
        </>
      }
      demo={AxisPaddingCard}
    />
  );
}

function AxisPaddingCard() {
  const [h, setH] = useState(24);
  const [v, setV] = useState(8);
  return (
    <ControlColumn>
      <Stage style={{ ...wrap, padding: { horizontal: h, vertical: v } }}>
        <node style={{ ...inner, backgroundColor: Colors.yellow100 }} />
      </Stage>
      <Slider
        value={h}
        min={0}
        max={48}
        onChange={setH}
        name="padding.horizontal"
      />
      <Slider
        value={v}
        min={0}
        max={48}
        onChange={setV}
        name="padding.vertical"
      />
    </ControlColumn>
  );
}

function GapDemo() {
  return (
    <Example
      title="Gaps"
      info={
        <>
          <Paragraph>
            <InlineCode>gap</InlineCode> spaces flex/grid children without
            touching the outer edges; <InlineCode>rowGap</InlineCode> /{" "}
            <InlineCode>columnGap</InlineCode> split it per axis.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ flexDirection: "row", gap: 16 }} />`}</Code>
        </>
      }
      demo={GapCard}
    />
  );
}

function GapCard() {
  const [g, setG] = useState(12);
  return (
    <ControlColumn>
      <Stage style={{ ...wrap, flexDirection: "row", gap: g }}>
        <node style={inner} />
        <node style={{ ...inner, backgroundColor: Colors.purple100 }} />
        <node style={{ ...inner, backgroundColor: Colors.yellow100 }} />
      </Stage>
      <Slider value={g} min={0} max={32} onChange={setG} name="gap" />
    </ControlColumn>
  );
}

function MarginDemo() {
  return (
    <Example
      title="Margins"
      info={
        <>
          <Paragraph>
            <InlineCode>margin</InlineCode> pushes a node away from its siblings
            — here a per-side object pushes only from the left.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ margin: { left: 24 } }} />`}</Code>
        </>
      }
      demo={MarginCard}
    />
  );
}

function MarginCard() {
  const [m, setM] = useState(24);
  return (
    <ControlColumn>
      <Stage style={{ ...wrap, flexDirection: "row" }}>
        <node
          style={{
            ...inner,
            backgroundColor: Colors.green100,
            margin: { left: m },
          }}
        />
      </Stage>
      <Slider value={m} min={0} max={48} onChange={setM} name="margin.left" />
    </ControlColumn>
  );
}

const wrap: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const inner: BevyStyle = {
  width: 36,
  height: 36,
  borderRadius: 6,
  backgroundColor: Colors.primary100,
};
