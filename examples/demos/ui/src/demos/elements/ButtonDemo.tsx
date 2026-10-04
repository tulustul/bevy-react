import { useState } from "react";
import { Bold, BoxLabel, InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example, Readout } from "@/components";
import { Code } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// A pure-UI demo of the `<button>` host element, shown twice: once basic — the
// host element with hand-written hover/press overlays — and once through the
// gallery's shared `Button` component (`components/Button.tsx`), which layers
// the house look, filters and press feedback over the same element. Both count
// clicks in React state. No 3D scene: the viewport stays empty.

const PAGE: ExplanationData = {
  title: "<button>",
  info: (
    <>
      <Paragraph>
        <InlineCode>{"<button>"}</InlineCode> is a clickable control: wire{" "}
        <InlineCode>onClick</InlineCode>, and give it{" "}
        <InlineCode>hoverStyle</InlineCode> /{" "}
        <InlineCode>pressStyle</InlineCode> overlays that apply while the
        pointer hovers or presses — no state juggling needed for feedback.
      </Paragraph>
      <Code lang="tsx">{`<button
  onClick={() => setCount((c) => c + 1)}
  hoverStyle={{ backgroundColor: "#dea350" }}
  pressStyle={{ backgroundColor: "#b9782a" }}
>
  <text>Click me</text>
</button>`}</Code>
      <Paragraph>
        It styles exactly like a <InlineCode>{"<node>"}</InlineCode>; the
        difference is intent. A button <Bold>blocks</Bold> pointer interaction
        by default (<InlineCode>focusPolicy: "block"</InlineCode>), so a click
        stops at it instead of passing through to whatever is behind — a
        sibling, an ancestor, or the 3D scene. A{" "}
        <InlineCode>{"<node>"}</InlineCode> passes interaction through. Set{" "}
        <InlineCode>focusPolicy</InlineCode> on either to override.
      </Paragraph>
      <Paragraph>
        The host element is deliberately bare. Apps wrap it once with their own
        look — the gallery's <InlineCode>Button</InlineCode> component is
        exactly that: a fairly complex combination of filters, gradients,
        transitions and press feedback over a plain{" "}
        <InlineCode>{"<button>"}</InlineCode>. Its source (
        <InlineCode>components/Button.tsx</InlineCode>) is a good reference for
        building your own.
      </Paragraph>
    </>
  ),
};

export function ButtonDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <BasicButtonExample />
      <RichButtonExample />
    </DemoRow>
  );
}

function BasicButtonExample() {
  return (
    <Example
      title="Basic button"
      info={
        <>
          <Paragraph>
            The host element as-is: <InlineCode>onClick</InlineCode> bumps React
            state, and the <InlineCode>hoverStyle</InlineCode> /{" "}
            <InlineCode>pressStyle</InlineCode> overlays give the button its
            feedback for free.
          </Paragraph>
          <Code lang="tsx">{`const [count, setCount] = useState(0);

<button
  onClick={() => setCount((c) => c + 1)}
  style={{ borderRadius: 8, /* … */ }}
  hoverStyle={{ backgroundColor: "#dea350" }}
  pressStyle={{ backgroundColor: "#b9782a" }}
>
  <text>Click me</text>
</button>`}</Code>
        </>
      }
      demo={BasicButtonCard}
    />
  );
}

function BasicButtonCard() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Readout label="Clicks" value={count} />
      <button
        onClick={() => setCount((c) => c + 1)}
        style={basicButtonStyle}
        hoverStyle={{ backgroundColor: Colors.brassBright }}
        pressStyle={{ backgroundColor: Colors.brassDeep }}
      >
        <BoxLabel style={{ fontSize: FontSizes.sm }}>Click me</BoxLabel>
      </button>
    </>
  );
}

function RichButtonExample() {
  return (
    <Example
      title="Rich button"
      info={
        <>
          <Paragraph>
            The same counter through the gallery's shared{" "}
            <InlineCode>Button</InlineCode> component. It is a complex
            combination of filters, gradients, transitions and press feedback
            layered over the plain element — too much to fit in a snippet, so
            look at <InlineCode>components/Button.tsx</InlineCode> in the demos
            source for reference.
          </Paragraph>
          <Code lang="tsx">{`import { Button } from "@/components";

const [count, setCount] = useState(0);

<Button
  onClick={() => setCount((c) => c + 1)}
>
  Click me
</Button>`}</Code>
        </>
      }
      demo={RichButtonCard}
    />
  );
}

function RichButtonCard() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Readout label="Clicks" value={count} />
      <Button onClick={() => setCount((c) => c + 1)} style={richButtonStyle}>
        Click me
      </Button>
    </>
  );
}

// The bare host element, hand-styled: a flat fill, no glow, no press effect.
const basicButtonStyle: BevyStyle = {
  width: 160,
  height: 36,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 10,
  backgroundColor: Colors.brass,
  cursor: "pointer",
};

const richButtonStyle: BevyStyle = {
  width: 160,
};
