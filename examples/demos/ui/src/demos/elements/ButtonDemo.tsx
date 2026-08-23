import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// A pure-UI demo of the `<button>` host element: a clickable container that
// reacts to hover and press via `hoverStyle` / `pressStyle`, driving a React
// state counter on `onClick`. No 3D scene: the viewport stays empty.

const PAGE: ExplanationData = {
  title: "<button>",
  info: (
    <>
      <P>
        <InlineCode>{"<button>"}</InlineCode> is a clickable control: wire{" "}
        <InlineCode>onClick</InlineCode>, and give it{" "}
        <InlineCode>hoverStyle</InlineCode> /{" "}
        <InlineCode>pressStyle</InlineCode> overlays that apply while the
        pointer hovers or presses — no state juggling needed for feedback.
      </P>
      <Code lang="tsx">{`<button
  onClick={() => setCount((c) => c + 1)}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ backgroundColor: "#5a7fd6" }}
>
  <text>Click me</text>
</button>`}</Code>
      <P>
        It styles exactly like a <InlineCode>{"<node>"}</InlineCode>; the
        difference is intent. A button <B>blocks</B> pointer interaction by
        default (<InlineCode>focusPolicy: "block"</InlineCode>), so a click
        stops at it instead of passing through to whatever is behind — a
        sibling, an ancestor, or the 3D scene. A{" "}
        <InlineCode>{"<node>"}</InlineCode> passes interaction through. Set{" "}
        <InlineCode>focusPolicy</InlineCode> on either to override.
      </P>
    </>
  ),
};

export function ButtonDemo() {
  useDemoPage(PAGE);
  return (
    <Example
      title="Click counter"
      info={
        <>
          <P>
            The classic counter: <InlineCode>onClick</InlineCode> bumps React
            state, and the hover/press overlays give the button its feedback for
            free.
          </P>
          <Code lang="tsx">{`const [count, setCount] = useState(0);

<button
  onClick={() => setCount((c) => c + 1)}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ backgroundColor: "#5a7fd6" }}
>
  <text>Click me</text>
</button>`}</Code>
        </>
      }
      demo={CounterCard}
    />
  );
}

function CounterCard() {
  const [count, setCount] = useState(0);
  return (
    <>
      <text style={countStyle}>
        Clicks: <text style={countValueStyle}>{count}</text>
      </text>

      <button
        onClick={() => setCount((c) => c + 1)}
        style={clickButtonStyle}
        hoverStyle={{ backgroundColor: Colors.primary200 }}
        pressStyle={{ backgroundColor: Colors.primary300 }}
      >
        <text style={clickLabelStyle}>Click me</text>
      </button>
    </>
  );
}

const countStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.lg,
};

// Spans take element defaults for unset fields — restate the size.
const countValueStyle: BevyStyle = {
  color: Colors.primary100,
  fontSize: FontSizes.lg,
};

const clickButtonStyle: BevyStyle = {
  width: 160,
  height: 56,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
  backgroundColor: Colors.primary100,
  cursor: "pointer",
};

const clickLabelStyle: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};
