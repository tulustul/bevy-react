import { useState } from "react";
import {
  Animated,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Example, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "./shared";

// Custom filters: the app's own WGSL passes in the `filter` chain, next to the
// built-ins. Each is a `#[react_filter]` struct in `examples/demos/filters.rs`
// pointing at a shader under `examples/assets/shaders/`; registration mirrors
// the name + params type into `bevy.ts`, so `{ name: "ripple", params: … }`
// below is fully typed — a typo'd name or param is a compile error, exactly
// like the built-in filters.
export function CustomFiltersDemo() {
  return (
    <>
      <Example
        description="ripple is an app-authored WGSL pass (a #[react_filter]
struct + shaders/ripple.wgsl). Declared with time = true, it reads the
uniform clock and re-renders every frame — animating with zero re-captures:
the subtree is captured once and only the filter pass re-runs. The wave
displaces up to the macro's outset (12px) past the card edge."
        rust={`#[react_filter(shader = "shaders/ripple.wgsl",
  outset = 12.0, time = true)]
struct Ripple { amplitude: f32, frequency: f32, speed: f32 }`}
        tsx={`<node style={{ filter: { name: "ripple",
  params: { amplitude, frequency: 12, speed: 1 } } }}>…</node>`}
      >
        <RippleControl />
      </Example>

      <Example
        description="glitch: time-seeded horizontal slice offsets + RGB channel
split, hashed procedurally in the shader — no noise textures. Also time = true,
so the corruption pattern re-rolls a few times a second while the layer's
capture stays untouched. One f32 param packs as params[0].x."
        rust={`#[react_filter(shader = "shaders/glitch.wgsl", time = true)]
struct Glitch { intensity: f32 }`}
        tsx={`<node style={{ filter: { name: "glitch",
  params: { intensity } } }}>…</node>`}
      >
        <GlitchControl />
      </Example>

      <Example
        description="dissolve burns the image away: texels whose procedural
noise falls below progress go fully transparent, with an ember edge at the
front. No time uniform — this layer repaints only when the slider moves, a
pure params-only update over the reused capture."
        rust={`#[react_filter(shader = "shaders/dissolve.wgsl")]
struct Dissolve { progress: f32 }`}
        tsx={`<image src="images/parrot.png" style={{ filter: {
  name: "dissolve", params: { progress } } }} />`}
      >
        <DissolveControl />
      </Example>

      <Example
        description="The payoff: dissolve's progress bound to a shared value
via animatedStyle. One click assigns a withSequence driver — burn to 1, hold,
re-materialize — and the whole run happens Bevy-side: zero React re-renders,
zero re-captures, just the dissolve pass re-running over the reused capture
with a fresh progress each frame."
        tsx={`const progress = useSharedValue(0);
progress.value = withSequence(
  withTiming(1, { duration: 1400, easing: "easeIn" }),
  withDelay(500, withTiming(0, { duration: 500 })));

<Animated.image src="images/parrot.png"
  style={{ filter: { name: "dissolve", params: { progress: 0 } } }}
  animatedStyle={{ "filter[0].progress": progress }} />`}
      >
        <BurnControl />
      </Example>
    </>
  );
}

// Mixed content (image + text) under the ripple: the whole card warps as one
// captured image, the classic "filter applies to the composited subtree".
function RippleControl() {
  const [amplitude, setAmplitude] = useState(4);
  return (
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
        <text style={caption}>Captured once, rippling every frame.</text>
      </node>
      <Slider
        value={amplitude}
        min={0}
        max={12}
        onChange={setAmplitude}
        label={`amplitude ${amplitude.toFixed(1)}px`}
      />
    </node>
  );
}

function GlitchControl() {
  const [intensity, setIntensity] = useState(0.5);
  return (
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
        <text style={caption}>Slices + RGB split, hashed in WGSL.</text>
      </node>
      <Slider
        value={intensity}
        min={0}
        max={1}
        onChange={setIntensity}
        label={`intensity ${intensity.toFixed(2)}`}
      />
    </node>
  );
}

// A bare <image> leaf: the dissolved texels go transparent, so the page shows
// through the burn holes.
function DissolveControl() {
  const [progress, setProgress] = useState(0.4);
  return (
    <node style={controlColumn}>
      <image
        src="images/parrot.png"
        style={{
          width: 150,
          filter: { name: "dissolve", params: { progress } },
        }}
      />
      <Slider
        value={progress}
        min={0}
        max={1}
        onChange={setProgress}
        label={`progress ${progress.toFixed(2)}`}
      />
    </node>
  );
}

// The animated dissolve: a sequence driver burns the image away and brings it
// back, all Bevy-resident. The only React renders are the button label flips
// (the sequence's completion callback).
function BurnControl() {
  const progress = useSharedValue(0);
  const [burning, setBurning] = useState(false);
  const burn = () => {
    setBurning(true);
    progress.value = withSequence(
      withTiming(1, { duration: 1400, easing: "easeIn" }),
      withDelay(500, withTiming(0, { duration: 500, easing: "easeOut" })),
      (finished) => {
        if (finished) setBurning(false);
      },
    );
  };
  return (
    <node style={controlColumn}>
      <Animated.image
        src="images/parrot.png"
        style={{
          width: 150,
          filter: { name: "dissolve", params: { progress: 0 } },
        }}
        animatedStyle={{ "filter[0].progress": progress }}
      />
      <Button onClick={burn}>{burning ? "Burning..." : "Burn it down"}</Button>
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
