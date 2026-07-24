import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { box, stage } from "./shared";

const PAGE: ExplanationData = {
  title: "Gradients",
  description: `backgroundGradient and borderGradient paint linear, radial,
or conic gradients as a node's fill or border (borderGradient needs a border
width to paint into). Angles are degrees, 0 = up, clockwise. An array layers
multiple gradients back-to-front, and gradients merge through hoverStyle like
any other style field.`,
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
    </>
  );
}

function BackgroundGradientDemo() {
  return (
    <Example
      title="backgroundGradient"
      description="backgroundGradient paints a linear/radial/conic gradient. Angles are in degrees (0 = up, clockwise)."
      tsx={`backgroundGradient: {
  type: "linear",
  angle: 90,
  stops: [
    { color: "#f7768e" },
    { color: "#7aa2f7" },
  ],
}`}
    >
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
    </Example>
  );
}

function BorderGradientDemo() {
  return (
    <Example
      title="borderGradient"
      description="borderGradient paints the border (needs a border width). Pairs with a solid or gradient fill."
      tsx={`border: 6,
backgroundColor: "#1a1b26",
borderGradient: {
  type: "conic",
  stops: [
    { color: "#f7768e" },
    { color: "#7aa2f7" },
    { color: "#9ece6a" },
    { color: "#f7768e" },
  ],
}`}
    >
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
    </Example>
  );
}

function LayeredGradientsDemo() {
  return (
    <Example
      title="Layered gradients"
      description="Pass an array to layer translucent gradients. Hover the swatch to swap the gradient (proves hoverStyle merging)."
      tsx={`backgroundGradient: [
  { type: "linear", angle: 45,
    stops: [{ color: "#f7768e80" }, { color: "#00000000" }] },
  { type: "linear", angle: 135,
    stops: [{ color: "#7aa2f780" }, { color: "#00000000" }] },
]`}
    >
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
    </Example>
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
