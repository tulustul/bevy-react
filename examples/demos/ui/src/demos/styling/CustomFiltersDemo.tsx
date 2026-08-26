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
import { Code, CodeTabs, InlineCode, Li, P, Ul } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { controlColumn } from "./shared";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Custom filters",
  info: (
    <>
      <P>
        A custom filter is a <InlineCode>#[react_filter]</InlineCode> params
        struct plus a WGSL shader asset, registered with{" "}
        <InlineCode>{"app.add_react_filter::<T>()"}</InlineCode> — in both the
        running app and the bindings exporter — then regenerate{" "}
        <InlineCode>bevy.ts</InlineCode> so the params type-check in React.
      </P>
      <Code lang="rust">{`#[react_filter(shader = "shaders/ripple.wgsl", outset = 12.0, time = true)]
struct Ripple {
    amplitude: f32,
    frequency: f32,
    speed: f32,
}

app.add_react_filter::<Ripple>();`}</Code>
      <Ul>
        <Li>
          Shaders <InlineCode>#import bevy_react::filter</InlineCode>, name
          their entry point <InlineCode>fragment</InlineCode>, and follow the
          prelude's premultiplied-alpha rules.
        </Li>
        <Li>
          <InlineCode>time = true</InlineCode> feeds the clock uniform and
          re-runs the pass every frame without re-capturing.
        </Li>
        <Li>
          <InlineCode>outset</InlineCode> reserves extra pixels past the node's
          box for effects that displace outward.
        </Li>
      </Ul>
    </>
  ),
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
  return (
    <Example
      style={{ cache: "never" }}
      title="Ripple"
      info={
        <>
          <P>
            <InlineCode>ripple</InlineCode> is an app-authored WGSL pass (a{" "}
            <InlineCode>#[react_filter]</InlineCode> struct +{" "}
            <InlineCode>shaders/ripple.wgsl</InlineCode>). Declared with{" "}
            <InlineCode>time = true</InlineCode>, it reads the uniform clock and
            re-renders every frame — animating with zero re-captures: the
            subtree is captured once and only the filter pass re-runs. The wave
            displaces up to the macro's outset (12px) past the card edge.
          </P>
          <CodeTabs
            tsx={`<node
  style={{
    filter: {
      name: "ripple",
      params: { amplitude, frequency, speed },
    },
  }}
>
  …
</node>`}
            rust={`#[react_filter(shader = "shaders/ripple.wgsl", outset = 12.0, time = true)]
struct Ripple {
    /// Peak displacement, in px.
    amplitude: f32,
    /// Wave phase across the layer's half-diagonal, in radians.
    frequency: f32,
    /// Wave cycles per second.
    speed: f32,
}`}
          />
        </>
      }
      demo={RippleCard}
    />
  );
}

function RippleCard() {
  const [amplitude, setAmplitude] = useState(4);
  const [frequency, setFrequency] = useState(12);
  const [speed, setSpeed] = useState(1);
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...card,
          filter: {
            name: "ripple",
            params: { amplitude, frequency, speed },
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
      <Slider
        value={frequency}
        min={0}
        max={30}
        onChange={setFrequency}
        label={`frequency ${frequency.toFixed(1)}`}
      />
      <Slider
        value={speed}
        min={0}
        max={4}
        onChange={setSpeed}
        label={`speed ${speed.toFixed(2)}`}
      />
    </node>
  );
}

function GlitchDemo() {
  return (
    <Example
      style={{ cache: "never" }}
      title="Glitch"
      info={
        <>
          <P>
            <InlineCode>glitch</InlineCode>: time-seeded horizontal slice
            offsets + RGB channel split, hashed procedurally in the shader — no
            noise textures. Also <InlineCode>time = true</InlineCode>, so the
            corruption pattern re-rolls a few times a second while the layer's
            capture stays untouched. One f32 param packs as{" "}
            <InlineCode>params[0].x</InlineCode>.
          </P>
          <CodeTabs
            tsx={`<node style={{ filter: { name: "glitch", params: { intensity } } }}>
  …
</node>`}
            rust={`#[react_filter(shader = "shaders/glitch.wgsl", time = true)]
struct Glitch {
    /// Overall strength, 0 (clean) ..= 1 (heavily corrupted).
    intensity: f32,
}`}
          />
        </>
      }
      demo={GlitchCard}
    />
  );
}

function GlitchCard() {
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

function DissolveDemo() {
  return (
    <Example
      title="Dissolve"
      info={
        <>
          <P>
            <InlineCode>dissolve</InlineCode> burns the image away: texels whose
            procedural noise falls below <InlineCode>progress</InlineCode> go
            fully transparent, with an ember edge at the front. No time uniform
            — this layer repaints only when the slider moves, a pure params-only
            update over the reused capture.
          </P>
          <CodeTabs
            tsx={`<image
  src="images/parrot.png"
  style={{ filter: { name: "dissolve", params: { progress } } }}
/>`}
            rust={`#[react_filter(shader = "shaders/dissolve.wgsl")]
struct Dissolve {
    /// 0 = intact, 1 = fully dissolved.
    progress: f32,
}`}
          />
        </>
      }
      demo={DissolveCard}
    />
  );
}

function DissolveCard() {
  const [progress, setProgress] = useState(0.4);
  return (
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
  );
}

function BurnDemo() {
  return (
    <Example
      title="Animated parameters"
      info={
        <>
          <P>
            The payoff: dissolve's <InlineCode>progress</InlineCode> bound to a
            shared value written inline in the filter's params. A{" "}
            <InlineCode>withRepeat</InlineCode> driver loops the sequence
            forever — burn to 1, hold, re-materialize, rest — and every cycle
            happens Bevy-side: zero React re-renders, zero re-captures, just the
            dissolve pass re-running over the reused capture with a fresh
            progress each frame.
          </P>
          <Code lang="tsx">{`const progress = useSharedValue(0);
progress.value = withRepeat(
  withSequence(
    withDelay(600, withTiming(1, { duration: 1400, easing: "easeIn" })),
    withDelay(500, withTiming(0, { duration: 1400, easing: "easeOut" })),
  ), // loops forever by default
);

<image
  src="images/parrot.png"
  style={{
    filter: {
      name: "dissolve",
      params: { progress: { animated: progress } },
    },
  }}
/>`}</Code>
        </>
      }
      demo={BurnCard}
    />
  );
}

function BurnCard() {
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
  );
}

function CyberpunkDemo() {
  return (
    <Example
      title="Cyberpunk 2077"
      style={{ cache: "never" }}
      info={
        <>
          <P>
            Filters compose with the other layer styles: a{" "}
            <InlineCode>transform3d</InlineCode> tilts the keybinding panel in
            perspective while a bloom + glitch + chromaticAberration chain runs
            over the same capture — the whole HUD look is one style object.
            Hover a row: plain transitions keep easing inside the filtered
            layer.
          </P>
          <Code lang="tsx">{`<node
  style={{
    transform3d: { rotateY: -30, rotateX: 10, perspective: 300 },
    filter: [
      {
        name: "bloom",
        params: { intensity: 0.5, radius: 2, threshold: 0.1 },
      },
      { name: "glitch", params: { intensity: 0.5 } },
      { name: "chromaticAberration", params: { offset: 2, angle: 0 } },
    ],
  }}
>
  …
</node>`}</Code>
        </>
      }
      demo={CyberpunkCard}
    />
  );
}

function CyberpunkCard() {
  return (
    <node
      style={{
        flexDirection: "column",
        cache: "never",
        padding: { bottom: 50 },
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
