import { useEffect, useState } from "react";
import { bevy } from "../generated";
import { buttonStyle, cardStyle, headingStyle, labelStyle } from "./styles";

const MAX = 8;
const HINT = 'bevy.emit("count", n)';

/**
 * One-way `emit`: push the count to Bevy whenever it changes,
 * and Bevy renders that many spinning cubes. No requests, no events.
 */
export function BasicUiDemo() {
  const [count, setCount] = useState(3);

  // React -> Bevy notify: push the count whenever it changes.
  useEffect(() => {
    bevy.emit("count", count);
  }, [count]);

  return (
    <node style={cardStyle}>
      <text style={headingStyle}>
        Cubes: <text style={{ color: "#7aa2f7" }}>{count}</text>
      </text>
      <text style={labelStyle}>{HINT}</text>

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
        <button
          onClick={() => setCount(3)}
          style={{ ...buttonStyle, width: 96, backgroundColor: "#414868" }}
          hoverStyle={{ backgroundColor: "#545c7e" }}
          pressStyle={{ backgroundColor: "#2f3450" }}
        >
          reset
        </button>
      </node>
    </node>
  );
}
