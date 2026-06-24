import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { buttonStyle, headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

// A pure-UI demo of CSS-like `transition`: a style change (hover/press, or React
// state) *eases* instead of snapping, governed by the same Bevy animation engine
// as `animatedStyle` — but fully declarative, no shared values or event wiring.

const HINT = "style={{ transform, transition }} pressStyle hoverStyle";

export function TransitionDemo() {
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <text style={headingStyle}>Transition</text>
      <text style={labelStyle}>{HINT}</text>

      {/* The motivating case: gently scale down on press, brighten on hover —
          both transform and backgroundColor ease between states. */}
      <button
        style={{
          ...buttonStyle,
          width: 160,
          height: 56,
          backgroundColor: "#7aa2f7",
          transform: { scale: 1 },
          transition: {
            transform: { duration: 120, easing: "easeOut" },
            backgroundColor: { duration: 180 },
          },
        }}
        hoverStyle={{ backgroundColor: "#89b4fa" }}
        pressStyle={{ transform: { scale: 0.92 }, backgroundColor: "#5a7fd6" }}
      >
        <text style={pressLabelStyle}>Press me</text>
      </button>

      {/* Transitions also ease plain React-state changes (not just hover/press):
          a spring drives the toggle's offset, opacity, and color. */}
      <button
        onClick={() => setOn((v) => !v)}
        style={{
          ...buttonStyle,
          width: 160,
          height: 56,
          backgroundColor: on ? "#a6e3a1" : "#45475a",
          opacity: on ? 1 : 0.6,
          transform: { translateX: on ? 36 : -36 },
          transition: {
            transform: { stiffness: 180, damping: 14 },
            opacity: { duration: 200 },
            backgroundColor: { duration: 200 },
          },
        }}
      >
        <text style={toggleLabelStyle}>{on ? "ON" : "OFF"}</text>
      </button>

      {/* A real accordion: easing `maxHeight` (a *layout* property) reflows the
          card — unlike transform/opacity, which are post-layout. `overflowY: clip`
          hides the content while collapsed. */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          ...buttonStyle,
          width: 220,
          height: 44,
          backgroundColor: "#cba6f7",
        }}
      >
        <text style={pressLabelStyle}>
          {open ? "Hide details ▲" : "Show details ▼"}
        </text>
      </button>
      <node
        style={{
          width: 220,
          overflowY: "clip",
          maxHeight: open ? 120 : 0,
          backgroundColor: "#11111b",
          borderRadius: 8,
          transition: { size: { duration: 250, easing: "easeInOut" } },
        }}
      >
        <node style={{ flexDirection: "column", gap: 6, padding: 14 }}>
          <text style={detailStyle}>Eases maxHeight (layout),</text>
          <text style={detailStyle}>so the card reflows as it</text>
          <text style={detailStyle}>opens and closes — both ways.</text>
        </node>
      </node>
    </Card>
  );
}

const detailStyle: BevyStyle = {
  color: "#bac2de",
  fontSize: 14,
};

const pressLabelStyle: BevyStyle = {
  color: "#1e1e2e",
  fontSize: 16,
  fontWeight: "bold",
};

const toggleLabelStyle: BevyStyle = {
  color: "#1e1e2e",
  fontSize: 16,
  fontWeight: "bold",
};
