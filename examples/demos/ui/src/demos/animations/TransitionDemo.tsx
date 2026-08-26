import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";

import { Button, DemoRow, Example } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { column } from "./shared";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// A pure-UI demo of CSS-like `transition`: a style change (hover/press, or React
// state) *eases* instead of snapping, governed by the same Bevy animation engine
// as the inline `{ animated }` bindings — but fully declarative, no shared
// values or event wiring.

const PAGE: ExplanationData = {
  title: "Style transitions",
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
        <RadiusDemo />
      </DemoRow>
      <DemoRow>
        <TimingVsSpringDemo />
        <SizeDemo />
        <DelayDemo />
      </DemoRow>
      <DemoRow>
        <LayoutDemo />
      </DemoRow>
    </>
  );
}

function HoverPressDemo() {
  return (
    <Example
      title="Hover and press"
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
      title="Toggle switches"
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

function RadiusDemo() {
  return (
    <Example
      title="Corner radius"
      info={
        <>
          <P>
            <InlineCode>{"transition: { borderRadius }"}</InlineCode> eases the
            corner radii per corner instead of snapping them: a click that turns
            a square into a circle, or a hover that rounds a button. Keep both
            states in the same unit; a corner that changes unit snaps on its
            own.
          </P>
          <Code lang="tsx">{`<button
  onClick={() => setRound((v) => !v)}
  style={{
    borderRadius: round ? 48 : 8,
    transition: {
      borderRadius: {
        duration: 350,
        easing: "easeInOut",
      },
    },
  }}
/>

<button
  style={{
    borderRadius: 4,
    transition: {
      borderRadius: { duration: 200 },
    },
  }}
  hoverStyle={{ borderRadius: 24 }}
/>`}</Code>
        </>
      }
      demo={RadiusCard}
    />
  );
}

function RadiusCard() {
  return (
    <node style={radiusRow}>
      <button
        style={radiusPill}
        hoverStyle={{ borderRadius: 25 }}
        pressStyle={{ borderRadius: 50 }}
      >
        <text style={labelStyle}>Hover or click me</text>
      </button>
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
      <Button onClick={() => setOn((v) => !v)}>Toggle</Button>
    </node>
  );
}

function SizeDemo() {
  return (
    <Example
      title="Size transitions"
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
      <Button onClick={() => setOpen((v) => !v)}>
        {open ? "Hide details -" : "Show details +"}
      </Button>
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
      title="Delays"
      info={
        <>
          <P>
            Each channel names its own timing —{" "}
            <InlineCode>transform</InlineCode> and{" "}
            <InlineCode>backgroundColor</InlineCode> here share one — and{" "}
            <InlineCode>delay</InlineCode> holds each dot back a little longer,
            turning one state flip into a stagger.
          </P>
          <Code lang="tsx">{`const spec = {
  duration: 300,
  easing: "easeOut",
  delay: i * 120,
};

<node
  style={{
    transform: {
      translateY: up ? -18 : 18,
    },
    backgroundColor: up
      ? "#bb9af7"
      : "#7aa2f7",
    transition: {
      transform: spec,
      backgroundColor: spec,
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
        {[0, 1, 2, 3].map((i) => {
          const spec = {
            duration: 300,
            easing: "easeOut",
            delay: i * 120,
          } as const;
          return (
            <node
              key={i}
              style={{
                ...waveDot,
                backgroundColor: up ? Colors.purple100 : Colors.primary100,
                transform: { translateY: up ? -18 : 18 },
                transition: { transform: spec, backgroundColor: spec },
              }}
            />
          );
        })}
      </node>
      <Button onClick={() => setUp((v) => !v)}>Wave</Button>
    </node>
  );
}

function LayoutDemo() {
  return (
    <Example
      title="Layout transitions"
      info={
        <>
          <P>
            <InlineCode>{"transition: { layout }"}</InlineCode> eases a node to
            wherever layout puts it next — whatever moved it: a reorder, a
            sibling growing, a parent resize (FLIP). The real layout snaps; the
            box glides from its old rect to the new one, children riding along,
            and clicks land on the visual.
          </P>
          <Code lang="tsx">{`<node
  key={id}
  style={{
    width: wide ? 120 : 40,
    transition: {
      layout: { duration: 400 },
    },
  }}
/>`}</Code>
          <P>
            A size change eases the node's <B>own box</B> only — its children
            stay crisp — but whatever is laid out <B>around</B> it snaps. So the
            container's height goes through the real-layout{" "}
            <InlineCode>{"transition: { size }"}</InlineCode> instead (explicit
            heights), re-flowing the buttons live, while the boxes glide between
            grid cells and the row on their own channel.
          </P>
        </>
      }
      demo={LayoutCard}
    />
  );
}

const LAYOUT_IDS = [0, 1, 2, 3, 4, 5];
// Explicit container heights: the `size` channel eases real layout, so the
// buttons below (and the card) re-flow live — `auto` heights would snap.
const ROW_HEIGHT = 56; // 8 + 40 + 8
const GRID_HEIGHT = 152; // 8 + 3 × 40 + 2 × 8 + 8

function LayoutCard() {
  const [order, setOrder] = useState(LAYOUT_IDS);
  const [wide, setWide] = useState(false);
  const [grid, setGrid] = useState(true);

  function shuffle() {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
  }

  return (
    <node style={column}>
      <node
        style={{
          ...(grid ? layoutGrid : layoutRow),
          height: grid ? GRID_HEIGHT : ROW_HEIGHT,
        }}
      >
        {order.map((id) => (
          <node
            key={id}
            style={{
              ...layoutBox,
              backgroundColor: LAYOUT_COLORS[id],
              width: id === 2 && wide ? 120 : 40,
            }}
          >
            <text style={layoutLabel}>{String(id)}</text>
          </node>
        ))}
      </node>
      <node style={{ flexDirection: "row", gap: 8 }}>
        <Button onClick={shuffle}>Shuffle</Button>
        <Button onClick={() => setWide((v) => !v)}>
          {wide ? "Shrink 2" : "Widen 2"}
        </Button>
        <Button onClick={() => setGrid((v) => !v)}>
          {grid ? "Flex" : "Grid"}
        </Button>
      </node>
    </node>
  );
}

const LAYOUT_COLORS = [
  Colors.primary100,
  Colors.green100,
  Colors.yellow100,
  Colors.red100,
  Colors.primary300,
  Colors.textColor200,
];

// The container eases its HEIGHT through the real-layout `size` channel,
// not `layout`: FLIP would only fake its own box while the buttons below
// and the card snap to the final layout (overlap mid-flight). Children sit
// at the top so their local rects hold still while the height eases —
// their own `layout` channel then glides them between grid cells and the
// row without re-arming every frame.
const layoutRow: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexStart",
  gap: 8,
  width: 300,
  padding: 8,
  borderRadius: 8,
  backgroundColor: Colors.surface100,
  transition: { size: { duration: 400, easing: "easeInOut" } },
};

// The same boxes re-flowed by a different layout algorithm — every box
// glides to its grid cell (and back), the container growing around them.
const layoutGrid: BevyStyle = {
  ...layoutRow,
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  justifyItems: "center",
};

const layoutBox: BevyStyle = {
  height: 40,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  transition: { layout: { duration: 400, easing: "easeInOut" } },
};

const layoutLabel: BevyStyle = {
  color: Colors.surface100,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};

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
  textAlign: "center",
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

const radiusRow: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
  height: 96,
};

// Hover rounds the corners, press squares them — both eased.
const radiusPill: BevyStyle = {
  width: 100,
  height: 100,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 4,
  backgroundColor: Colors.primary100,
  transition: { borderRadius: { duration: 300, easing: "easeOut" } },
};
