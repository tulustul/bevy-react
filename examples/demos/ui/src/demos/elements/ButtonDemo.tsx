import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";

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
  onClick={() => setCount((c) => c + 1)}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ backgroundColor: "#5a7fd6" }}
/>`;

export function ButtonDemo() {
  const [count, setCount] = useState(0);

  return (
    <Example
      description="A clickable control with hover and press style overrides, driving React state. Unlike a <node>, a <button> blocks pointer interaction by default — the click stops here instead of passing through to whatever is behind it (override with focusPolicy)."
      tsx={TYPESCRIPT}
    >
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
