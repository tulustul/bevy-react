import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// The `<node>` host element: a styleable, nestable box — the building block every
// other layout is made of. See Layout → Flex/Grid for arranging its children.

const PAGE: ExplanationData = {
  title: "<node>",
  info: (
    <>
      <P>
        <InlineCode>{"<node>"}</InlineCode> is a styleable, nestable box — the
        building block every layout is made of (there are no divs or spans). It
        maps to a <InlineCode>bevy_ui</InlineCode> node and is a{" "}
        <B>flexbox container by default</B>: children flow inside it, arranged
        by the usual flex styles.
      </P>
      <Code lang="tsx">{`<node style={{ padding: 16, gap: 12 }}>
  <node style={{ width: 48, height: 48 }} />
</node>`}</Code>
      <P>
        A bare <InlineCode>{"<node>"}</InlineCode> passes pointer interaction
        through to whatever is behind it — use{" "}
        <InlineCode>{"<button>"}</InlineCode> (or set{" "}
        <InlineCode>focusPolicy</InlineCode>) when it should block. For
        arranging children, see the Flex and Grid pages under Layout.
      </P>
    </>
  ),
};

export function NodeDemo() {
  useDemoPage(PAGE);
  return (
    <Example
      title="Boxes and gaps"
      info={
        <>
          <P>
            Three fixed-size child nodes in a row; the parent's{" "}
            <InlineCode>gap</InlineCode> spaces them out. Layout styles like gap
            re-flow instantly when React state changes — drag the slider.
          </P>
          <Code lang="tsx">{`<node style={{ flexDirection: "row", padding: 16, gap }}>
  <node style={{ width: 48, height: 48 }} />
  <node style={{ width: 48, height: 48 }} />
  <node style={{ width: 48, height: 48 }} />
</node>`}</Code>
        </>
      }
      demo={BoxesCard}
    />
  );
}

function BoxesCard() {
  const [gap, setGap] = useState(12);
  return (
    <>
      <node style={{ ...panelStyle, gap }}>
        <node style={{ ...boxStyle, backgroundColor: Colors.primary100 }} />
        <node style={{ ...boxStyle, backgroundColor: Colors.green100 }} />
        <node style={{ ...boxStyle, backgroundColor: Colors.red100 }} />
      </node>
      <Slider
        value={gap}
        min={0}
        max={32}
        onChange={setGap}
        label={`gap ${gap.toFixed(0)}`}
      />
    </>
  );
}

const panelStyle: BevyStyle = {
  flexDirection: "row",
  padding: 16,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const boxStyle: BevyStyle = {
  width: 48,
  height: 48,
  borderRadius: 8,
};
