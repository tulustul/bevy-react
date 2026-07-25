import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// A pure-UI demo of the `<button>` host element: a clickable container that
// reacts to hover and press via `hoverStyle` / `pressStyle`, driving a React
// state counter on `onClick`. No 3D scene: the viewport stays empty.
//
// `<button>` styles exactly like a `<node>`; the difference is intent. As a
// discrete control it *blocks* pointer interaction by default (`focusPolicy:
// "block"`), so a click stops at the button and never leaks to a sibling, an
// ancestor, or the 3D scene/portal behind it. A `<node>` passes interaction
// through by default — set `focusPolicy` on either to override.

const TYPESCRIPT = `<button
  onClick={() =>
    setCount((c) => c + 1)}
  hoverStyle={{
    backgroundColor: "#89b4fa",
  }}
  pressStyle={{
    backgroundColor: "#5a7fd6",
  }}
/>`;

const PAGE: ExplanationData = {
  title: "<button>",
  description:
    'A clickable control that reacts to hover and press via hoverStyle/pressStyle, driving React state on onClick. It styles exactly like a <node>; the difference is intent: as a discrete control it blocks pointer interaction by default (focusPolicy: "block"), so a click stops at the button instead of passing through to a sibling, an ancestor, or the 3D scene behind it. A <node> passes interaction through by default — set focusPolicy on either to override.',
  tsx: TYPESCRIPT,
};

export function ButtonDemo() {
  useDemoPage(PAGE);
  const [count, setCount] = useState(0);

  return (
    <Example>
      <text style={countStyle}>
        Clicks: <text style={{ color: Colors.primary100 }}>{count}</text>
      </text>

      <button
        onClick={() => setCount((c) => c + 1)}
        style={clickButtonStyle}
        hoverStyle={{ backgroundColor: Colors.primary200 }}
        pressStyle={{ backgroundColor: Colors.primary300 }}
      >
        <text style={clickLabelStyle}>Click me</text>
      </button>
    </Example>
  );
}

const countStyle: BevyStyle = {
  color: Colors.textColor100,
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
