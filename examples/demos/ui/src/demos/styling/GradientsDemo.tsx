import { useEffect, useState } from "react";
import { useSharedValue, withRepeat, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { box, controlColumn, stage } from "./shared";

const PAGE: ExplanationData = {
  title: "Gradients",
  info: (
    <>
      <P>
        <InlineCode>backgroundGradient</InlineCode> and{" "}
        <InlineCode>borderGradient</InlineCode> paint linear, radial, or conic
        gradients as a node's fill or border (borderGradient needs a{" "}
        <InlineCode>border</InlineCode> width to paint into). Angles are
        degrees, 0 is up, clockwise.
      </P>
      <Code lang="tsx">{`backgroundGradient: {
  type: "linear", // or "radial" | "conic"
  angle: 90,
  stops: [{ color: "#f7768e" }, { color: "#7aa2f7" }],
}`}</Code>
      <P>
        An array layers multiple gradients back-to-front, and gradients merge
        through <InlineCode>hoverStyle</InlineCode> like any other style field.
      </P>
    </>
  ),
};

export function GradientsDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <BackgroundGradientDemo />
        <BorderGradientDemo />
      </DemoRow>
      <DemoRow>
        <LayeredGradientsDemo />
      </DemoRow>
      <DemoRow>
        <GradientTransitionDemo />
        <AnimatedGradientDemo />
      </DemoRow>
    </>
  );
}

function BackgroundGradientDemo() {
  return (
    <Example
      title="backgroundGradient"
      info={
        <>
          <P>
            <InlineCode>backgroundGradient</InlineCode> paints a
            linear/radial/conic gradient as the node's fill. Angles are in
            degrees (0 is up, clockwise).
          </P>
          <Code lang="tsx">{`<node
  style={{
    backgroundGradient: {
      type: "linear", // or "radial" | "conic"
      angle: 90,
      stops: [{ color: "#f7768e" }, { color: "#7aa2f7" }],
    },
  }}
/>`}</Code>
        </>
      }
      demo={BackgroundGradientCard}
    />
  );
}

function BackgroundGradientCard() {
  return (
    <node style={stage}>
      <node
        style={{
          ...box,
          backgroundGradient: {
            type: "linear",
            angle: 90,
            stops: [{ color: "#f7768e" }, { color: "#7aa2f7" }],
          },
        }}
      />
      <node
        style={{
          ...box,
          backgroundColor: undefined,
          backgroundGradient: {
            type: "radial",
            stops: [{ color: "#e0af68" }, { color: "#1a1b26" }],
          },
        }}
      />
      <node
        style={{
          ...box,
          backgroundGradient: {
            type: "conic",
            stops: [
              { color: "#f7768e" },
              { color: "#9ece6a" },
              { color: "#7aa2f7" },
              { color: "#f7768e" },
            ],
          },
        }}
      />
    </node>
  );
}

function BorderGradientDemo() {
  return (
    <Example
      title="borderGradient"
      info={
        <>
          <P>
            <InlineCode>borderGradient</InlineCode> paints the border, so it
            needs a <InlineCode>border</InlineCode> width to paint into. It
            pairs with a solid or gradient fill.
          </P>
          <Code lang="tsx">{`<node
  style={{
    border: 6,
    backgroundColor: "#1a1b26",
    borderGradient: {
      type: "conic",
      stops: [
        { color: "#f7768e" },
        { color: "#7aa2f7" },
        { color: "#9ece6a" },
        { color: "#f7768e" },
      ],
    },
  }}
/>`}</Code>
        </>
      }
      demo={BorderGradientCard}
    />
  );
}

function BorderGradientCard() {
  return (
    <node style={stage}>
      <node
        style={{
          ...box,
          border: 6,
          backgroundColor: "#1a1b26",
          borderGradient: {
            type: "conic",
            stops: [
              { color: "#f7768e" },
              { color: "#7aa2f7" },
              { color: "#9ece6a" },
              { color: "#f7768e" },
            ],
          },
        }}
      />
      <node
        style={{
          ...box,
          border: 6,
          backgroundColor: "#1a1b26",
          borderGradient: {
            type: "linear",
            angle: 90,
            stops: [{ color: "#e0af68" }, { color: "#bb9af7" }],
          },
        }}
      />
    </node>
  );
}

function LayeredGradientsDemo() {
  return (
    <Example
      title="Layered gradients"
      info={
        <>
          <P>
            Pass an array to layer translucent gradients back-to-front. Hover
            the swatch to swap the gradient — gradients merge through{" "}
            <InlineCode>hoverStyle</InlineCode> like any other style field.
          </P>
          <Code lang="tsx">{`backgroundGradient: [
  {
    type: "linear",
    angle: 45,
    stops: [{ color: "#f7768e80" }, { color: "#00000000" }],
  },
  {
    type: "linear",
    angle: 135,
    stops: [{ color: "#7aa2f780" }, { color: "#00000000" }],
  },
]`}</Code>
        </>
      }
      demo={LayeredGradientsCard}
    />
  );
}

function LayeredGradientsCard() {
  return (
    <node style={stage}>
      <node
        style={{
          ...box,
          backgroundColor: "#1a1b26",
          backgroundGradient: layered,
        }}
        hoverStyle={{ backgroundGradient: hovered }}
      />
    </node>
  );
}

const layered: BevyStyle["backgroundGradient"] = [
  {
    type: "linear",
    angle: 45,
    stops: [{ color: "#f7768e80" }, { color: "#00000000" }],
  },
  {
    type: "linear",
    angle: 135,
    stops: [{ color: "#7aa2f780" }, { color: "#00000000" }],
  },
];

const hovered: BevyStyle["backgroundGradient"] = {
  type: "conic",
  stops: [{ color: "#9ece6a" }, { color: "#7aa2f7" }, { color: "#9ece6a" }],
};

const TRANSITION_TSX = `<node
  style={{
    backgroundGradient: on
      ? {
          type: "linear",
          angle: 200,
          stops: [
            { color: "#9ece6a" },
            { color: "#e0af68" },
          ],
        }
      : {
          type: "linear",
          angle: 20,
          stops: [
            { color: "#f7768e" },
            { color: "#7aa2f7" },
          ],
        },
    transition: {
      backgroundGradient: {
        duration: 400,
        easing: "easeInOut",
      },
    },
  }}
/>`;

function GradientTransitionDemo() {
  return (
    <Example
      title="Gradient transition"
      info={
        <>
          <P>
            <InlineCode>transition.backgroundGradient</InlineCode> eases a
            gradient change — colors and angles interpolate instead of snapping.
            It needs a <B>strict structural match</B>: same kind, stop count,
            color space, position and shape. Mismatched structures snap (with a
            devtools warning), and setting or unsetting the gradient snaps too —
            fade in or out via transparent stops instead.
          </P>
          <Code lang="tsx">{TRANSITION_TSX}</Code>
        </>
      }
      demo={GradientTransitionCard}
    />
  );
}

const coolGradient: BevyStyle["backgroundGradient"] = {
  type: "linear",
  angle: 20,
  stops: [{ color: "#f7768e" }, { color: "#7aa2f7" }],
};

const warmGradient: BevyStyle["backgroundGradient"] = {
  type: "linear",
  angle: 200,
  stops: [{ color: "#9ece6a" }, { color: "#e0af68" }],
};

function GradientTransitionCard() {
  const [on, setOn] = useState(false);
  return (
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            width: 120,
            height: 90,
            backgroundGradient: on ? warmGradient : coolGradient,
            transition: {
              backgroundGradient: { duration: 400, easing: "easeInOut" },
            },
          }}
        />
      </node>
      <Button onClick={() => setOn((v) => !v)}>Flip gradient</Button>
    </node>
  );
}

const ANIMATED_TSX = `const angle = useSharedValue(0);
angle.value = withRepeat(
  withTiming(360, {
    duration: 4000,
    easing: "linear",
  }),
); // no count — loops forever

backgroundGradient: {
  type: "linear",
  angle: {
    animated: angle,
    seed: 0, // degrees
  },
  stops: [
    { color: "#bb9af7" },
    { color: "#7dcfff" },
  ],
}`;

function AnimatedGradientDemo() {
  return (
    <Example
      title="Animated gradient"
      info={
        <>
          <P>
            Gradient leaves accept inline {"{ animated }"} bindings: a shared
            value drives the field per frame, Bevy-side, in wire units — degrees
            for this <InlineCode>angle</InlineCode>. A binding on a gradient
            parks that surface's transition channel, so the driver and the ease
            never fight over the same field.
          </P>
          <Code lang="tsx">{ANIMATED_TSX}</Code>
        </>
      }
      demo={AnimatedGradientCard}
    />
  );
}

function AnimatedGradientCard() {
  const angle = useSharedValue(0);
  useEffect(() => {
    angle.value = withRepeat(
      withTiming(360, { duration: 1000, easing: "linear" }),
    );
  }, [angle]);
  return (
    <node style={stage}>
      <node
        style={{
          ...box,
          width: 120,
          height: 90,
          backgroundGradient: {
            type: "linear",
            angle: { animated: angle, seed: 0 },
            stops: [{ color: "#bb9af7" }, { color: "#7dcfff" }],
          },
        }}
      />
    </node>
  );
}
