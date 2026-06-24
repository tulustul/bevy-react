import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";

import { Example } from "../../components";
import { Colors, FontSizes } from "../../theme";

// A pure-UI demo of CSS-like `transition`: a style change (hover/press, or React
// state) *eases* instead of snapping, governed by the same Bevy animation engine
// as `animatedStyle` — but fully declarative, no shared values or event wiring.

export function TransitionDemo() {
  const [on, setOn] = useState(false);

  return (
    <>
      <Example
        description="A `transition` eases hover/press style changes instead of snapping them."
        typescript={`<button
  style={{ transform: { scale: 1 }, transition: {
    transform: { duration: 120, easing: "easeOut" },
    backgroundColor: { duration: 180 },
  }}}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ transform: { scale: 0.92 } }}
/>`}
      >
        <button
          style={{
            ...pillStyle,
            backgroundColor: Colors.primary100,
            transform: { scale: 1 },
            transition: {
              transform: { duration: 120, easing: "easeOut" },
              backgroundColor: { duration: 180 },
            },
          }}
          hoverStyle={{ backgroundColor: Colors.primary200 }}
          pressStyle={{
            transform: { scale: 0.92 },
            backgroundColor: Colors.primary300,
          }}
        >
          <text style={labelStyle}>Press me</text>
        </button>
      </Example>

      <Example
        description="Transitions also ease plain React-state changes; here a spring drives the toggle."
        typescript={`<button
  style={{
    transform: { translateX: on ? 36 : -36 },
    transition: { transform: { stiffness: 180, damping: 14 } },
  }}
/>`}
      >
        <button
          onClick={() => setOn((v) => !v)}
          style={{
            ...pillStyle,
            backgroundColor: on ? Colors.green100 : Colors.surface500,
            opacity: on ? 1 : 0.6,
            transform: { translateX: on ? 36 : -36 },
            transition: {
              transform: { stiffness: 180, damping: 14 },
              opacity: { duration: 200 },
              backgroundColor: { duration: 200 },
            },
          }}
        >
          <text style={labelStyle}>{on ? "ON" : "OFF"}</text>
        </button>
      </Example>
    </>
  );
}

const pillStyle: BevyStyle = {
  width: 160,
  height: 56,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
};

const labelStyle: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};
