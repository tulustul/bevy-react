import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Spacing",
  info: (
    <>
      <P>
        Three props cover spacing: <InlineCode>padding</InlineCode> insets a
        node's content from its own edges, <InlineCode>margin</InlineCode>{" "}
        pushes the node away from its siblings, and <InlineCode>gap</InlineCode>{" "}
        spaces flex/grid children (<InlineCode>rowGap</InlineCode> /{" "}
        <InlineCode>columnGap</InlineCode> split it per axis).
      </P>
      <Code lang="tsx">{`<node style={{ padding: 16, gap: 12 }}>
  <node style={{ margin: { left: 24 } }} />
</node>`}</Code>
      <P>
        All of them accept bare px numbers and unit strings;{" "}
        <InlineCode>padding</InlineCode> and <InlineCode>margin</InlineCode>{" "}
        additionally take per-side{" "}
        <InlineCode>{"{ top, right, bottom, left }"}</InlineCode> objects.
      </P>
    </>
  ),
};

export function SpacingDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <PaddingDemo />
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
          <P>
            <InlineCode>padding</InlineCode> insets content from the node's own
            edges — drag the slider and watch the outer box grow around the
            fixed-size inner one.
          </P>
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
    <node style={controlColumn}>
      <node style={{ ...wrap, padding: p }}>
        <node style={inner} />
      </node>
      <Slider
        value={p}
        min={0}
        max={40}
        onChange={setP}
        label={`padding ${p.toFixed(0)}`}
      />
    </node>
  );
}

function GapDemo() {
  return (
    <Example
      title="Gaps"
      info={
        <>
          <P>
            <InlineCode>gap</InlineCode> spaces flex/grid children without
            touching the outer edges; <InlineCode>rowGap</InlineCode> /{" "}
            <InlineCode>columnGap</InlineCode> split it per axis.
          </P>
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
    <node style={controlColumn}>
      <node style={{ ...wrap, flexDirection: "row", gap: g }}>
        <node style={inner} />
        <node style={{ ...inner, backgroundColor: Colors.purple100 }} />
        <node style={{ ...inner, backgroundColor: Colors.yellow100 }} />
      </node>
      <Slider
        value={g}
        min={0}
        max={32}
        onChange={setG}
        label={`gap ${g.toFixed(0)}`}
      />
    </node>
  );
}

function MarginDemo() {
  return (
    <Example
      title="Margins"
      info={
        <>
          <P>
            <InlineCode>margin</InlineCode> pushes a node away from its siblings
            — here a per-side object pushes only from the left.
          </P>
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
    <node style={controlColumn}>
      <node style={{ ...wrap, flexDirection: "row" }}>
        <node
          style={{
            ...inner,
            backgroundColor: Colors.green100,
            margin: { left: m },
          }}
        />
      </node>
      <Slider
        value={m}
        min={0}
        max={48}
        onChange={setM}
        label={`margin.left ${m.toFixed(0)}`}
      />
    </node>
  );
}

const wrap: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: 8,
  backgroundColor: Colors.surface100,
  borderRadius: 10,
};

const inner: BevyStyle = {
  width: 36,
  height: 36,
  borderRadius: 6,
  backgroundColor: Colors.primary100,
};
