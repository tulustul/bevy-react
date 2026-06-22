import { useEffect, useState } from "react";
import { bevy, emit } from "../generated";
import { buttonStyle, cardStyle, headingStyle, labelStyle } from "./styles";

const MAX = 8;

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
      <text style={labelStyle}>bevy.emit(&quot;count&quot;, n)</text>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <button
          onClick={() => setCount((c) => Math.min(MAX, c + 1))}
          style={{ ...buttonStyle, backgroundColor: "#7aa2f7" }}
        >
          +
        </button>
        <button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          style={{ ...buttonStyle, backgroundColor: "#f7768e" }}
        >
          -
        </button>
        <button
          onClick={() => setCount(3)}
          style={{ ...buttonStyle, width: 96, backgroundColor: "#414868" }}
        >
          reset
        </button>
      </node>
    </node>
  );
}
