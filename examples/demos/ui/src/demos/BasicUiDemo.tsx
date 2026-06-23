import { useEffect, useState } from "react";
import { bevy } from "../generated";
import { buttonStyle, headingStyle } from "./styles";
import { Example } from "../components";

const MAX = 8;
const TYPESCRIPT = "bevy.basicDemo.setCount(n)";

export function BasicUiDemo() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    bevy.basicDemo.setCount(count);
  }, [count]);

  return (
    <Example typescript={TYPESCRIPT}>
      <text style={headingStyle}>
        Cubes: <text style={{ color: "#7aa2f7" }}>{count}</text>
      </text>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <button
          onClick={() => setCount((c) => Math.min(MAX, c + 1))}
          style={{ ...buttonStyle, backgroundColor: "#7aa2f7" }}
          hoverStyle={{ backgroundColor: "#89b4fa" }}
          pressStyle={{ backgroundColor: "#5a7fd6" }}
        >
          +
        </button>
        <button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          style={{ ...buttonStyle, backgroundColor: "#f7768e" }}
          hoverStyle={{ backgroundColor: "#ff8fa3" }}
          pressStyle={{ backgroundColor: "#d65a72" }}
        >
          -
        </button>
      </node>
    </Example>
  );
}
