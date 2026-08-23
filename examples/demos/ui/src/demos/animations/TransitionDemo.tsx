import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";

import { DemoRow, Example } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { column, playButton, playLabel } from "./shared";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// A pure-UI demo of CSS-like `transition`: a style change (hover/press, or React
// state) *eases* instead of snapping, governed by the same Bevy animation engine
// as the inline `{ animated }` bindings — but fully declarative, no shared
// values or event wiring.

const PAGE: ExplanationData = {
  title: "Style Transitions",
  info: (
    <>
      <P>
        CSS-like <InlineCode>transition</InlineCode>: a style change —
        hover/press, or plain React state — <B>eases instead of snapping</B>,
        governed by the same Bevy animation engine as the inline{" "}
        {"{ animated }"} bindings, but fully declarative: no shared values, no
        event wiring.
      </P>
      <Code lang="tsx">{`<node
  style={{
    transform: { translateX: on ? 36 : 0 },
    transition: {
      transform: { stiffness: 180, damping: 14 },
      backgroundColor: { duration: 200, easing: "easeOut" },
    },
  }}
/>`}</Code>
      <P>
        Each field gets its own config: timing (
        <InlineCode>duration</InlineCode> + <InlineCode>easing</InlineCode>) or
        spring (<InlineCode>stiffness</InlineCode> +{" "}
        <InlineCode>damping</InlineCode>).
      </P>
    </>
  ),
};

export function TransitionDemo() {
  useDemoPage(PAGE);

  return (
    <>
      <DemoRow>
        <HoverPressDemo />
        <ToggleSwitchDemo />
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
      info={
        <>
          <P>
            A <InlineCode>transition</InlineCode> eases hover/press style
            changes instead of snapping them: the transform runs a quick{" "}
            <InlineCode>easeOut</InlineCode>, the background color a slower
            fade.
          </P>
          <Code lang="tsx">{`<button
  style={{
    transform: { scale: 1 },
    transition: {
      transform: { duration: 120, easing: "easeOut" },
      backgroundColor: { duration: 180 },
    },
  }}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ transform: { scale: 0.92 } }}
/>`}</Code>
        </>
      }
      demo={HoverPressCard}
    />
  );
}

function HoverPressCard() {
  return (
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
  );
}

function ToggleSwitchDemo() {
  return (
    <Example
      title="Toggle switch"
      info={
        <>
          <P>
            Transitions also ease plain React-state changes — here a toggle
            switch built from two styles: the click flips a boolean, a spring (
            <InlineCode>stiffness</InlineCode>/<InlineCode>damping</InlineCode>)
            slides the knob, and the track color fades on a timer. No animation
            code, just the two states.
          </P>
          <Code lang="tsx">{`const [on, setOn] = useState(false);

<button // the track
  onClick={() => setOn((v) => !v)}
  style={{
    backgroundColor: on ? "#9ece6a" : "#42425e",
    transition: { backgroundColor: { duration: 200 } },
  }}
>
  <node // the knob
    style={{
      transform: { translateX: on ? 36 : 0 },
      transition: { transform: { stiffness: 180, damping: 14 } },
    }}
  />
</button>`}</Code>
        </>
      }
      demo={ToggleSwitchCard}
    />
  );
}

function ToggleSwitchCard() {
  const [on, setOn] = useState(false);

  return (
    <node style={switchRow}>
      <button
        onClick={() => setOn((v) => !v)}
        style={{
          ...switchTrack,
          backgroundColor: on ? Colors.green100 : Colors.surface500,
          transition: { backgroundColor: { duration: 200 } },
        }}
      >
        <node
          style={{
            ...switchKnob,
            transform: { translateX: on ? 36 : 0 },
            transition: { transform: { stiffness: 180, damping: 14 } },
          }}
        />
      </button>
      <text style={switchLabel}>{on ? "ON" : "OFF"}</text>
    </node>
  );
}

function TimingVsSpringDemo() {
  return (
    <Example
      title="Timing vs spring"
      info={
        <>
          <P>
            The same style change under the two timing configs: the top square
            eases on a fixed-<InlineCode>duration</InlineCode> curve and stops
            dead; the bottom one rides a damped spring (
            <InlineCode>stiffness</InlineCode>/<InlineCode>damping</InlineCode>
            ), so it overshoots and settles.
          </P>
          <Code lang="tsx">{`// top square: fixed-duration curve
transition: {
  transform: { duration: 450, easing: "easeInOut" },
}

// bottom square: damped spring
transition: {
  transform: { stiffness: 120, damping: 9 },
}`}</Code>
        </>
      }
      demo={TimingVsSpringCard}
    />
  );
}

function TimingVsSpringCard() {
  const [on, setOn] = useState(false);
  const x = on ? 64 : -64;

  return (
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
  );
}

function SizeDemo() {
  return (
    <Example
      title="Size"
      info={
        <>
          <P>
            <InlineCode>{"transition: { size }"}</InlineCode> covers the layout
            size channels (width/height/maxWidth/maxHeight). Easing{" "}
            <InlineCode>maxHeight</InlineCode> between 0 and a pixel value makes
            a real accordion — the content below re-flows every frame.{" "}
            <InlineCode>auto</InlineCode> targets snap, so give both states
            explicit numbers and clip the overflow.
          </P>
          <Code lang="tsx">{`<node
  style={{
    maxHeight: open ? 96 : 0,
    overflowY: "clip",
    transition: { size: { duration: 300, easing: "easeInOut" } },
  }}
/>`}</Code>
        </>
      }
      demo={SizeCard}
    />
  );
}

function SizeCard() {
  const [open, setOpen] = useState(false);

  return (
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
  );
}

function DelayDemo() {
  return (
    <Example
      title="Delay & all"
      info={
        <>
          <P>
            <InlineCode>all</InlineCode> is the fallback channel for any field
            without its own entry — here it eases{" "}
            <InlineCode>transform</InlineCode> and{" "}
            <InlineCode>backgroundColor</InlineCode> together — and{" "}
            <InlineCode>delay</InlineCode> holds each dot back a little longer,
            turning one state flip into a stagger.
          </P>
          <Code lang="tsx">{`<node
  style={{
    transform: { translateY: up ? -18 : 18 },
    backgroundColor: up ? "#bb9af7" : "#7aa2f7",
    transition: {
      all: { duration: 300, easing: "easeOut", delay: i * 120 },
    },
  }}
/>`}</Code>
        </>
      }
      demo={DelayCard}
    />
  );
}

function DelayCard() {
  const [up, setUp] = useState(false);

  return (
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

const switchRow: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
  height: 96,
};

// The pill-shaped track: the knob slides inside its padding, and the click
// target is the whole pill.
const switchTrack: BevyStyle = {
  flexDirection: "row",
  justifyContent: "flexStart",
  alignItems: "center",
  width: 76,
  height: 40,
  padding: 4,
  borderRadius: 999,
  cursor: "pointer",
};

// travel = track width − 2·padding − knob width = 36
const switchKnob: BevyStyle = {
  width: 32,
  height: 32,
  borderRadius: 999,
  backgroundColor: Colors.textColor100,
  boxShadow: { blurRadius: 4, spreadRadius: 1, color: Colors.shadow100 },
};

const switchLabel: BevyStyle = {
  width: 36,
  color: Colors.textColor200,
  fontSize: FontSizes.sm,
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
