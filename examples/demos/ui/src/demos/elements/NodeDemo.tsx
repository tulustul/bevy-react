import { useState } from "react";
import { Bold, InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider, Stage } from "@/components";
import { Code } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// The `<node>` host element: a styleable, nestable box — the building block every
// other layout is made of. See Layout → Flex/Grid for arranging its children.

const PAGE: ExplanationData = {
  title: "<node>",
  info: (
    <>
      <Paragraph>
        <InlineCode>{"<node>"}</InlineCode> is a styleable, nestable box — the
        building block every layout is made of (there are no divs or spans). It
        maps to a <InlineCode>bevy_ui</InlineCode> node and is a{" "}
        <Bold>flexbox container by default</Bold>: children flow inside it,
        arranged by the usual flex styles.
      </Paragraph>
      <Code lang="tsx">{`<node style={{ padding: 16, gap: 12 }}>
  <node style={{ width: 48, height: 48 }} />
</node>`}</Code>
      <Paragraph>
        A bare <InlineCode>{"<node>"}</InlineCode> passes pointer interaction
        through to whatever is behind it — use{" "}
        <InlineCode>{"<button>"}</InlineCode> (or set{" "}
        <InlineCode>focusPolicy</InlineCode>) when it should block. For
        arranging children, see the Flex and Grid pages under Layout.
      </Paragraph>
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
          <Paragraph>
            Three fixed-size child nodes in a row; the parent's{" "}
            <InlineCode>gap</InlineCode> spaces them out. Layout styles like gap
            re-flow instantly when React state changes — drag the slider.
          </Paragraph>
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
      <Stage style={{ ...panelStyle, gap }}>
        <node style={{ ...boxStyle, backgroundColor: Colors.primary100 }} />
        <node style={{ ...boxStyle, backgroundColor: Colors.green100 }} />
        <node style={{ ...boxStyle, backgroundColor: Colors.red100 }} />
      </Stage>
      <Slider value={gap} min={0} max={32} onChange={setGap} name="gap" />
    </>
  );
}

const panelStyle: BevyStyle = {
  flexDirection: "row",
};

const boxStyle: BevyStyle = {
  width: 48,
  height: 48,
  borderRadius: 8,
};
