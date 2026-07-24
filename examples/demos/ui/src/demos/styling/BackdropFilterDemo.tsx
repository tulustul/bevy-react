import { useEffect, useState } from "react";
import {
  Animated,
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";
import { Example, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "./shared";

// `backdropFilter` filters what is rendered BEHIND the node — in v1 the 3D
// scene (UI painted beneath the node is not included) — and draws the result
// under the node's own content: CSS backdrop-filter frosted glass. Same chain
// vocabulary as `filter` (every built-in and custom filter works unchanged);
// the backdrop re-renders every frame, so it tracks the moving scene live.
export function BackdropFilterDemo() {
  return (
    <>
      <Example
        description="A semi-transparent panel with backdropFilter blur is the
classic glass card: the moving cubes stay readable as soft shapes behind it.
Drag the radius — only the backdrop passes re-run; the panel's own content
never re-captures. The frost covers the node's rectangular border box (no
borderRadius mask in v1)."
        tsx={`<node style={{
  backgroundColor: "rgba(26, 27, 38, 0.35)",
  backdropFilter: { name: "blur", params: { radius: 8 } },
}}>
  <text>frosted glass</text>
</node>`}
      >
        <GlassCardControl />
      </Example>

      <Example
        description="Chains work on the backdrop too, in pass order: grayscale
first, then blur — the world behind the panel turns to soft monochrome while
the UI in front keeps its colors."
        tsx={`<node style={{ backdropFilter: [
  { name: "grayscale" },
  { name: "blur", params: { radius: 6 } },
] }}>…</node>`}
      >
        <ChainControl />
      </Example>

      <Example
        description="backdropFilter and filter are independent chains on one
node: the backdrop blurs the scene while the content chain desaturates the
panel's own children. Each resolves, transitions, and animates on its own."
        tsx={`<node style={{
  backdropFilter: { name: "blur", params: { radius: 8 } },
  filter: { name: "grayscale" },
}}>…</node>`}
      >
        <BothChainsControl />
      </Example>

      <Example description="Custom filter">
        <CustomFilter />
      </Example>
    </>
  );
}

// A fixed-size glass panel: see-through background, frosted backdrop, real
// content on top. Sized generously so plenty of scene moves behind it.
const glass = {
  width: 300,
  height: 200,
  borderRadius: 12,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  gap: 6,
  backgroundColor: "rgba(26, 27, 38, 0.35)",
};

function GlassCardControl() {
  const [radius, setRadius] = useState(8);
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...glass,
          backdropFilter: { name: "blur", params: { radius } },
        }}
      >
        <text style={{ color: Colors.textColor100, fontSize: FontSizes.base }}>
          frosted glass
        </text>
        <text style={caption}>the scene blurs behind this panel</text>
      </node>
      <Slider
        value={radius}
        min={0}
        max={24}
        onChange={setRadius}
        label={`radius ${radius.toFixed(1)}px`}
      />
    </node>
  );
}

function ChainControl() {
  const [radius, setRadius] = useState(6);
  return (
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
  );
}

function BothChainsControl() {
  const [content, setContent] = useState(1);
  return (
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
  );
}

function CustomFilter() {
  return (
    <node
      style={{
        ...glass,
        backdropFilter: [
          { name: "ripple", params: { amplitude: 5, frequency: 12, speed: 2 } },
          { name: "chromaticAberration", params: { offset: 5, angle: 0 } },
          { name: "glitch", params: { intensity: 0.5 } },
        ],
      }}
    ></node>
  );
}
