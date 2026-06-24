import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";

// A pure-UI demo of the `<button>` host element: a clickable container that
// reacts to hover and press via `hoverStyle` / `pressStyle`, driving a React
// state counter on `onClick`. No 3D scene: the viewport stays empty.

const TYPESCRIPT = `<button
  onClick={() => setCount((c) => c + 1)}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ backgroundColor: "#5a7fd6" }}
/>`;

export function ButtonDemo() {
  const [count, setCount] = useState(0);

  return (
    <Example
      description="A clickable node with hover and press style overrides, driving React state."
      typescript={TYPESCRIPT}
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
};

const clickLabelStyle: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};
