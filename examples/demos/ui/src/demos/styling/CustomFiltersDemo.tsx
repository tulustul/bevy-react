import { useEffect, useState } from "react";
import {
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { controlColumn } from "./shared";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Custom filters",
  description: `A custom filter is a #[react_filter] params struct plus a WGSL
shader asset, registered with app.add_react_filter::<T>() — in both the
running app and the bindings exporter — then regenerate bevy.ts so the params
type-check in React. Shaders #import bevy_react::filter, name their entry
point "fragment", and follow the prelude's premultiplied-alpha rules.
time = true feeds the clock uniform and re-runs the pass every frame without
re-capturing; outset reserves extra pixels past the node's box for effects
that displace outward.`,
  rust: `#[react_filter(
  shader = "shaders/ripple.wgsl",
  outset = 12.0,
  time = true,
)]
struct Ripple {
  amplitude: f32,
  frequency: f32,
  speed: f32,
}`,
};

export function CustomFiltersDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <RippleDemo />
        <GlitchDemo />
        <DissolveDemo />
      </DemoRow>

      <DemoRow>
        <BurnDemo />
        <CyberpunkDemo />
      </DemoRow>
    </>
  );
}

function RippleDemo() {
  const [amplitude, setAmplitude] = useState(4);

  return (
    <Example
      style={{ cache: "never" }}
      title="Ripple"
      description="ripple is an app-authored WGSL pass (a #[react_filter]
struct + shaders/ripple.wgsl). Declared with time = true, it reads the
uniform clock and re-renders every frame — animating with zero re-captures:
the subtree is captured once and only the filter pass re-runs. The wave
displaces up to the macro's outset (12px) past the card edge."
      rust={`#[react_filter(
  shader = "shaders/ripple.wgsl",
  outset = 12.0,
  time = true,
)]
struct Ripple {
  amplitude: f32,
  frequency: f32,
  speed: f32,
}`}
      tsx={`<node style={{ filter: {
  name: "ripple",
  params: {
    amplitude,
    frequency: 12,
    speed: 1,
  },
} }}>…</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...card,
            filter: {
              name: "ripple",
              params: { amplitude, frequency: 12, speed: 1 },
            },
          }}
        >
          <image
            src="images/parrot.png"
            style={{ width: 130, borderRadius: 8 }}
          />
          <text style={cardTitle}>Making waves</text>
        </node>
        <Slider
          value={amplitude}
          min={0}
          max={12}
          onChange={setAmplitude}
          label={`amplitude ${amplitude.toFixed(1)}px`}
        />
      </node>
    </Example>
  );
}

function GlitchDemo() {
  const [intensity, setIntensity] = useState(0.5);

  return (
    <Example
      style={{ cache: "never" }}
      title="Glitch"
      description="glitch: time-seeded horizontal slice offsets + RGB channel
split, hashed procedurally in the shader — no noise textures. Also time = true,
so the corruption pattern re-rolls a few times a second while the layer's
capture stays untouched. One f32 param packs as params[0].x."
      rust={`#[react_filter(
  shader = "shaders/glitch.wgsl",
  time = true,
)]
struct Glitch { intensity: f32 }`}
      tsx={`<node style={{ filter: {
  name: "glitch",
  params: { intensity },
} }}>…</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...card,
            filter: { name: "glitch", params: { intensity } },
          }}
        >
          <image
            src="images/parrot.png"
            style={{ width: 130, borderRadius: 8 }}
          />
          <text style={cardTitle}>SIGNAL LOST</text>
        </node>
        <Slider
          value={intensity}
          min={0}
          max={1}
          onChange={setIntensity}
          label={`intensity ${intensity.toFixed(2)}`}
        />
      </node>
    </Example>
  );
}

function DissolveDemo() {
  const [progress, setProgress] = useState(0.4);

  return (
    <Example
      title="Dissolve"
      description="dissolve burns the image away: texels whose procedural
noise falls below progress go fully transparent, with an ember edge at the
front. No time uniform — this layer repaints only when the slider moves, a
pure params-only update over the reused capture."
      rust={`#[react_filter(
  shader = "shaders/dissolve.wgsl",
)]
struct Dissolve { progress: f32 }`}
      tsx={`<image
  src="images/parrot.png"
  style={{ filter: {
    name: "dissolve",
    params: { progress },
  } }}
/>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...card,
            filter: { name: "dissolve", params: { progress } },
          }}
        >
          <image
            src="images/parrot.png"
            style={{ width: 130, borderRadius: 8 }}
          />
          <text style={cardTitle}>Burning!!!</text>
        </node>
        <Slider
          value={progress}
          min={0}
          max={1}
          onChange={setProgress}
          label={`progress ${progress.toFixed(2)}`}
        />
      </node>
    </Example>
  );
}

function BurnDemo() {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withDelay(600, withTiming(1, { duration: 1400, easing: "easeIn" })),
        withDelay(500, withTiming(0, { duration: 1400, easing: "easeOut" })),
      ),
    );
  }, [progress]);
  return (
    <Example
      title="Filter animation"
      description="The payoff: dissolve's progress bound to a shared value
written inline in the filter's params. A withRepeat driver loops the sequence
forever — burn to 1, hold, re-materialize, rest — and every cycle happens
Bevy-side: zero React re-renders, zero re-captures, just the dissolve pass
re-running over the reused capture with a fresh progress each frame."
      tsx={`const progress = useSharedValue(0);
progress.value = withRepeat(
  withSequence(
    withDelay(600, withTiming(1, {
      duration: 1400,
      easing: "easeIn",
    })),
    withDelay(500,
      withTiming(0, { duration: 500 })),
  ), // loops forever by default
);

<image
  src="images/parrot.png"
  style={{ filter: {
    name: "dissolve",
    params: { progress: {
      animated: progress,
    } },
  } }}
/>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...card,
            filter: {
              name: "dissolve",
              params: { progress: { animated: progress } },
            },
          }}
        >
          <image
            src="images/parrot.png"
            style={{ width: 130, borderRadius: 8 }}
          />
          <text style={cardTitle}>Burning!!!</text>
        </node>
      </node>
    </Example>
  );
}

function CyberpunkDemo() {
  return (
    <Example title="Cyberpunk2077 style" style={{ cache: "never" }}>
      <node
        style={{
          flexDirection: "column",
          cache: "never",
          transform3d: {
            rotateY: -30,
            rotateX: 10,
            perspective: 300,
            translateX: -20,
            translateY: 20,
          },
          filter: [
            {
              name: "bloom",
              params: { intensity: 0.5, radius: 2, threshold: 0.1 },
            },
            {
              name: "glitch",
              params: { intensity: 0.5 },
            },
            {
              name: "chromaticAberration",
              params: { offset: 2, angle: 0 },
            },
          ],
        }}
      >
        <CyberpunkKeybinding label="Draw Weapon" keybinding="Alt" />
        <CyberpunkKeybinding label="Crouch" keybinding="C" />
        <CyberpunkKeybinding label="Reload" keybinding="R" />
      </node>
    </Example>
  );
}

function CyberpunkKeybinding({
  label,
  keybinding,
}: {
  label: string;
  keybinding: string;
}) {
  const keyFontSize = 18 - keybinding.length * 2;
  return (
    <node
      style={{
        gap: 10,
        padding: 5,
        alignItems: "center",
        justifyContent: "flexEnd",
        transform: { scale: 1.0 },
        backgroundColor: Colors.transparent,
        transition: {
          transform: { duration: 200, easing: "easeInOut" },
          backgroundColor: { duration: 200, easing: "easeInOut" },
        },
      }}
      hoverStyle={{
        transform: { scale: 1.1 },
        backgroundColor: Colors.surface100,
      }}
    >
      <text style={{ color: Colors.red100 }}>{label}</text>
      <text
        style={{
          color: Colors.sky100,
          border: 2,
          borderColor: Colors.sky100,
          borderRadius: 5,
          padding: 5,
          width: 30,
          height: 30,
          fontSize: keyFontSize,
          textAlign: "center",
          lineHeight: "15px",
        }}
      >
        {keybinding}
      </text>
    </node>
  );
}

const card: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: 14,
  borderRadius: 12,
  backgroundColor: Colors.surface300,
};

const cardTitle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};
