import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";

import { DemoRow, Example } from "@/components";
import { column, playButton, playLabel } from "./shared";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// A pure-UI demo of CSS-like `transition`: a style change (hover/press, or React
// state) *eases* instead of snapping, governed by the same Bevy animation engine
// as the inline `{ animated }` bindings — but fully declarative, no shared
// values or event wiring.

const PAGE: ExplanationData = {
  title: "Style Transitions",
  description:
    "CSS-like transition: a style change (hover/press, or React state) eases instead of snapping, governed by the same Bevy animation engine as the inline { animated } bindings — but fully declarative, no shared values or event wiring. Each field gets its own timing (duration + easing) or spring (stiffness + damping) config.",
};

export function TransitionDemo() {
  useDemoPage(PAGE);

  return (
    <>
      <DemoRow>
        <HoverPressDemo />
        <StateToggleDemo />
      </DemoRow>
      <DemoRow>
        <TimingVsSpringDemo />
        <SizeDemo />
        <DelayDemo />
      </DemoRow>
    </>
  );
}

function HoverPressDemo() {
  return (
    <Example
      title="Hover & press"
      description="A `transition` eases hover/press style changes instead of snapping them: the transform runs a quick easeOut, the background color a slower fade."
      tsx={`<button
  style={{
    transform: { scale: 1 },
    transition: {
      transform: {
        duration: 120,
        easing: "easeOut",
      },
      backgroundColor: {
        duration: 180,
      },
    },
  }}
  hoverStyle={{
    backgroundColor: "#89b4fa",
  }}
  pressStyle={{
    transform: { scale: 0.92 },
  }}
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
  );
}

function StateToggleDemo() {
  const [on, setOn] = useState(false);

  return (
    <Example
      title="React state"
      description="Transitions also ease plain React-state changes: clicking toggles the style, and a spring (stiffness/damping) drives the transform while opacity and color fade on timers."
      tsx={`<button
  style={{
    transform: {
      translateX: on ? 36 : -36,
    },
    transition: {
      transform: {
        stiffness: 180,
        damping: 14,
      },
    },
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
  );
}

function TimingVsSpringDemo() {
  const [on, setOn] = useState(false);
  const x = on ? 64 : -64;

  return (
    <Example
      title="Timing vs spring"
      description="The same style change under the two timing configs: the top square eases on a fixed-duration curve and stops dead; the bottom one rides a damped spring (stiffness/damping), so it overshoots and settles."
      tsx={`transition: { transform: {
  duration: 450,
  easing: "easeInOut",
} }
transition: { transform: {
  stiffness: 120, damping: 9,
} }`}
    >
      <node style={column}>
        <node style={vsLane}>
          <text style={vsLabel}>timing</text>
          <node style={vsTrack}>
            <node
              style={{
                ...vsDot,
                backgroundColor: Colors.primary100,
                transform: { translateX: x },
                transition: {
                  transform: { duration: 450, easing: "easeInOut" },
                },
              }}
            />
          </node>
        </node>
        <node style={vsLane}>
          <text style={vsLabel}>spring</text>
          <node style={vsTrack}>
            <node
              style={{
                ...vsDot,
                backgroundColor: Colors.green100,
                transform: { translateX: x },
                transition: { transform: { stiffness: 120, damping: 9 } },
              }}
            />
          </node>
        </node>
        <button
          style={playButton}
          pressStyle={{ transform: { scale: 0.92 } }}
          onClick={() => setOn((v) => !v)}
        >
          <text style={playLabel}>Toggle</text>
        </button>
      </node>
    </Example>
  );
}

function SizeDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Example
      title="Size"
      description="transition: { size } covers the layout size channels (width/height/maxWidth/maxHeight). Easing maxHeight between 0 and a pixel value makes a real accordion — the content below re-flows every frame. auto targets snap, so give both states explicit numbers and clip the overflow."
      tsx={`<node style={{
  maxHeight: open ? 96 : 0,
  overflowY: "clip",
  transition: { size: {
    duration: 300,
    easing: "easeInOut",
  } },
}} />`}
    >
      <node style={accordionColumn}>
        <button
          style={accordionHeader}
          pressStyle={{ transform: { scale: 0.97 } }}
          onClick={() => setOpen((v) => !v)}
        >
          <text style={accordionHeaderText}>
            {open ? "Hide details -" : "Show details +"}
          </text>
        </button>
        <node style={{ ...accordionBody, maxHeight: open ? 96 : 0 }}>
          <node style={accordionPanel}>
            <text style={accordionText}>Eased maxHeight re-flows layout,</text>
            <text style={accordionText}>so this panel really opens</text>
            <text style={accordionText}>instead of fading in place.</text>
          </node>
        </node>
        <node style={accordionFooter}>
          <text style={accordionText}>I sit below and get pushed.</text>
        </node>
      </node>
    </Example>
  );
}

function DelayDemo() {
  const [up, setUp] = useState(false);

  return (
    <Example
      title="Delay & all"
      description="all is the fallback channel for any field without its own entry — here it eases transform and backgroundColor together — and delay holds each dot back a little longer, turning one state flip into a stagger."
      tsx={`transition: {
  all: {
    duration: 300,
    easing: "easeOut",
    delay: i * 120,
  },
}`}
    >
      <node style={column}>
        <node style={waveRow}>
          {[0, 1, 2, 3].map((i) => (
            <node
              key={i}
              style={{
                ...waveDot,
                backgroundColor: up ? Colors.purple100 : Colors.primary100,
                transform: { translateY: up ? -18 : 18 },
                transition: {
                  all: { duration: 300, easing: "easeOut", delay: i * 120 },
                },
              }}
            />
          ))}
        </node>
        <button
          style={playButton}
          pressStyle={{ transform: { scale: 0.92 } }}
          onClick={() => setUp((v) => !v)}
        >
          <text style={playLabel}>Wave</text>
        </button>
      </node>
    </Example>
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

const vsLane: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
};

const vsLabel: BevyStyle = {
  width: 48,
  color: Colors.textColor200,
  fontSize: FontSizes.xs,
  textAlign: "right",
};

const vsTrack: BevyStyle = {
  justifyContent: "center",
  alignItems: "center",
  width: 152,
  height: 30,
  backgroundColor: Colors.surface100,
  borderRadius: 6,
};

const vsDot: BevyStyle = {
  width: 24,
  height: 24,
  borderRadius: 6,
};

const accordionColumn: BevyStyle = {
  flexDirection: "column",
  gap: 10,
  width: 216,
};

const accordionHeader: BevyStyle = {
  justifyContent: "center",
  alignItems: "center",
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  borderRadius: 8,
  backgroundColor: Colors.surface300,
  transform: { scale: 1 },
  transition: { transform: { duration: 100, easing: "easeOut" } },
};

const accordionHeaderText: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};

const accordionBody: BevyStyle = {
  overflowY: "clip",
  transition: { size: { duration: 300, easing: "easeInOut" } },
};

const accordionPanel: BevyStyle = {
  flexDirection: "column",
  gap: 4,
  padding: 12,
  borderRadius: 8,
  backgroundColor: Colors.surface100,
};

const accordionFooter: BevyStyle = {
  padding: { top: 6, right: 12, bottom: 6, left: 12 },
  borderRadius: 8,
  backgroundColor: Colors.surface100,
  alignItems: "center",
};

const accordionText: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.xs,
};

const waveRow: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
  height: 84,
};

const waveDot: BevyStyle = {
  width: 26,
  height: 26,
  borderRadius: 8,
};
