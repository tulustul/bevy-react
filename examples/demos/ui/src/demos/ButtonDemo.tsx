import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { buttonStyle, headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

// A pure-UI demo of the `<button>` host element: a clickable container that
// reacts to hover and press via `hoverStyle` / `pressStyle`, driving a React
// state counter on `onClick`. No 3D scene: the viewport stays empty.

export function ButtonDemo() {
  const [count, setCount] = useState(0);

  return (
    <Card>
      <text style={headingStyle}>Button</text>
      <text style={labelStyle}>
        {"<button onClick hoverStyle pressStyle />"}
      </text>

      <text style={countStyle}>
        Clicks: <text style={{ color: "#7aa2f7" }}>{count}</text>
      </text>

      <button
        onClick={() => setCount((c) => c + 1)}
        style={{ ...buttonStyle, ...clickButtonStyle }}
        hoverStyle={{ backgroundColor: "#89b4fa" }}
        pressStyle={{ backgroundColor: "#5a7fd6" }}
      >
        <text style={clickLabelStyle}>Click me</text>
      </button>
    </Card>
  );
}

const countStyle: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 18,
};

const clickButtonStyle: BevyStyle = {
  width: 160,
  height: 56,
  backgroundColor: "#7aa2f7",
};

const clickLabelStyle: BevyStyle = {
  color: "#1e1e2e",
  fontSize: 16,
  fontWeight: "bold",
};
