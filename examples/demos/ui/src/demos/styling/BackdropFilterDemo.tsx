import { useState } from "react";
import { DemoRow, Example, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "./shared";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "backdropFilter",
  description: `backdropFilter takes the same { name, params } chains as
filter, but filters what is rendered BEHIND the node — currently the camera's
post-processed 3D frame (UI painted beneath the node is not included) — and
composites the result under the node's own background. The frosted quad covers
the node's border box and respects borderRadius. The backdrop is live, so its
passes re-run every frame; the node's own content still caches. Transitions
and animatedStyle ("backdropFilter[<i>].<param>") mirror filter, including the
empty-chain snap on removal.`,
};

export function BackdropFilterDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <GlassCardDemo />
        <ChainDemo />
      </DemoRow>

      <DemoRow>
        <BothChainsDemo />
        <CustomFilterDemo />
      </DemoRow>
    </>
  );
}

const glass = {
  width: 300,
  height: 200,
  borderRadius: 12,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  gap: 6,
  backgroundColor: "rgba(26, 27, 38, 0.35)",
};

function GlassCardDemo() {
  const [radius, setRadius] = useState(20);

  return (
    <Example
      title="Frosted glass"
      description="A semi-transparent panel with backdropFilter blur is the
classic glass card: the moving cubes stay readable as soft shapes behind it.
Drag the radius — only the backdrop passes re-run; the panel's own content
never re-captures. The frost respects borderRadius: it is masked to the
panel's rounded border box with the same antialiased edge the background
paints."
      tsx={`<node style={{
  backgroundColor: "rgba(26, 27, 38, 0.35)",
  backdropFilter: { name: "blur", params: { radius: 8 } },
}}>
  <text>frosted glass</text>
</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...glass,
            backdropFilter: { name: "blur", params: { radius } },
          }}
        >
          <text
            style={{ color: Colors.textColor100, fontSize: FontSizes.base }}
          >
            frosted glass
          </text>
        </node>
        <Slider
          value={radius}
          min={0}
          max={24}
          onChange={setRadius}
          label={`radius ${radius.toFixed(1)}px`}
        />
      </node>
    </Example>
  );
}

function ChainDemo() {
  const [radius, setRadius] = useState(6);

  return (
    <Example
      title="Blur"
      description="Chains work on the backdrop too, in pass order: grayscale
first, then blur — the world behind the panel turns to soft monochrome while
the UI in front keeps its colors."
      tsx={`<node style={{ backdropFilter: [
  { name: "grayscale" },
  { name: "blur", params: { radius: 6 } },
] }}>…</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...glass,
            backdropFilter: [
              { name: "grayscale" },
              { name: "blur", params: { radius } },
            ],
          }}
        >
          <text style={{ color: Colors.primary100, fontSize: FontSizes.base }}>
            color survives in front
          </text>
        </node>
        <Slider
          value={radius}
          min={0}
          max={20}
          onChange={setRadius}
          label={`radius ${radius.toFixed(1)}px`}
        />
      </node>
    </Example>
  );
}

function BothChainsDemo() {
  const [content, setContent] = useState(1);

  return (
    <Example
      title="filter + backdropFilter"
      description="backdropFilter and filter are independent chains on one
node: the backdrop blurs the scene while the content chain desaturates the
panel's own children. Each resolves, transitions, and animates on its own."
      tsx={`<node style={{
  backdropFilter: { name: "blur", params: { radius: 8 } },
  filter: { name: "grayscale" },
}}>…</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...glass,
            backdropFilter: { name: "blur", params: { radius: 8 } },
            filter: { name: "grayscale", params: { amount: content } },
          }}
        >
          <text style={{ color: Colors.primary100, fontSize: FontSizes.base }}>
            content chain
          </text>
          <text style={caption}>backdrop stays a plain blur</text>
        </node>
        <Slider
          value={content}
          min={0}
          max={1}
          onChange={setContent}
          label={`content grayscale ${content.toFixed(2)}`}
        />
      </node>
    </Example>
  );
}

function CustomFilterDemo() {
  return (
    <Example
      title="Custom filters"
      description="Custom #[react_filter]s run on the backdrop unchanged —
this glass warps, fringes, and glitches the scene behind it (ripple +
chromaticAberration + glitch)."
    >
      <node
        style={{
          ...glass,
          backdropFilter: [
            {
              name: "ripple",
              params: { amplitude: 5, frequency: 12, speed: 2 },
            },
            { name: "chromaticAberration", params: { offset: 5, angle: 0 } },
            { name: "glitch", params: { intensity: 0.5 } },
          ],
        }}
      ></node>
    </Example>
  );
}
