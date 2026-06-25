import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { box, stage } from "./shared";

export function GradientsDemo() {
  return (
    <>
      <Example
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

      <Example
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

      <Example
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
    </>
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
