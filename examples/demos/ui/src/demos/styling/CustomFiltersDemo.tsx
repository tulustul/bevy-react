import { useEffect, useState } from "react";
import {
  CardTitle,
  InlineCode,
  ListItem,
  Paragraph,
  List,
} from "@/components/typography";
import {
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import {
  ControlColumn,
  DemoRow,
  Example,
  ParamControls,
  Slider,
  slider,
  useParams,
} from "@/components";
import { Code, CodeTabs } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Custom filters",
  info: (
    <>
      <Paragraph>
        A custom filter is a <InlineCode>#[react_filter]</InlineCode> params
        struct plus a WGSL shader asset, registered with{" "}
        <InlineCode>{"app.add_react_filter::<T>()"}</InlineCode> — in both the
        running app and the bindings exporter — then regenerate{" "}
        <InlineCode>bevy.ts</InlineCode> so the params type-check in React.
      </Paragraph>
      <Code lang="rust">{`#[react_filter(shader = "shaders/ripple.wgsl", outset = 12.0, time = true)]
struct Ripple {
    amplitude: f32,
    frequency: f32,
    speed: f32,
}

app.add_react_filter::<Ripple>();`}</Code>
      <List>
        <ListItem>
          Shaders <InlineCode>#import bevy_react::filter</InlineCode>, name
          their entry point <InlineCode>fragment</InlineCode>, and follow the
          prelude's premultiplied-alpha rules.
        </ListItem>
        <ListItem>
          <InlineCode>time = true</InlineCode> feeds the clock uniform and
          re-runs the pass every frame without re-capturing.
        </ListItem>
        <ListItem>
          <InlineCode>outset</InlineCode> reserves extra pixels past the node's
          box for effects that displace outward.
        </ListItem>
      </List>
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
          <Paragraph>
            <InlineCode>ripple</InlineCode> is an app-authored WGSL pass (a{" "}
            <InlineCode>#[react_filter]</InlineCode> struct +{" "}
            <InlineCode>shaders/ripple.wgsl</InlineCode>). Declared with{" "}
            <InlineCode>time = true</InlineCode>, it reads the uniform clock and
            re-renders every frame — animating with zero re-captures: the
            subtree is captured once and only the filter pass re-runs. The wave
            displaces up to the macro's outset (12px) past the card edge.
          </Paragraph>
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
  const [params, controls] = useParams(RIPPLE);
  return (
    <ControlColumn>
      <node style={{ ...card, filter: { name: "ripple", params } }}>
        <image
          src="images/parrot.png"
          style={{ width: 130, borderRadius: 8 }}
        />
        <CardTitle>Making waves</CardTitle>
      </node>
      <ParamControls {...controls} />
    </ControlColumn>
  );
}

const RIPPLE = {
  amplitude: slider(0, 12, 4, { decimals: 1, unit: "px" }),
  frequency: slider(0, 30, 12, { decimals: 1 }),
  speed: slider(0, 4, 1, { decimals: 2 }),
};

function GlitchDemo() {
  return (
    <Example
      style={{ cache: "never" }}
      title="Glitch"
      info={
        <>
          <Paragraph>
            <InlineCode>glitch</InlineCode>: time-seeded horizontal slice
            offsets + RGB channel split, hashed procedurally in the shader — no
            noise textures. Also <InlineCode>time = true</InlineCode>, so the
            corruption pattern re-rolls a few times a second while the layer's
            capture stays untouched. One f32 param packs as{" "}
            <InlineCode>params[0].x</InlineCode>.
          </Paragraph>
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
    <ControlColumn>
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
        <CardTitle>SIGNAL LOST</CardTitle>
      </node>
      <Slider
        value={intensity}
        min={0}
        max={1}
        onChange={setIntensity}
        name="intensity"
      />
    </ControlColumn>
  );
}

function DissolveDemo() {
  return (
    <Example
      title="Dissolve"
      info={
        <>
          <Paragraph>
            <InlineCode>dissolve</InlineCode> burns the image away: texels whose
            procedural noise falls below <InlineCode>progress</InlineCode> go
            fully transparent, with an ember edge at the front. No time uniform
            — this layer repaints only when the slider moves, a pure params-only
            update over the reused capture.
          </Paragraph>
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
    <ControlColumn>
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
        <CardTitle>Burning!!!</CardTitle>
      </node>
      <Slider
        value={progress}
        min={0}
        max={1}
        onChange={setProgress}
        name="progress"
      />
    </ControlColumn>
  );
}

function BurnDemo() {
  return (
    <Example
      title="Animated parameters"
      info={
        <>
          <Paragraph>
            The payoff: dissolve's <InlineCode>progress</InlineCode> bound to a
            shared value written inline in the filter's params. A{" "}
            <InlineCode>withRepeat</InlineCode> driver loops the sequence
            forever — burn to 1, hold, re-materialize, rest — and every cycle
            happens Bevy-side: zero React re-renders, zero re-captures, just the
            dissolve pass re-running over the reused capture with a fresh
            progress each frame.
          </Paragraph>
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
    <ControlColumn>
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
        <CardTitle>Burning!!!</CardTitle>
      </node>
    </ControlColumn>
  );
}

function CyberpunkDemo() {
  return (
    <Example
      title="Cyberpunk 2077"
      style={{ cache: "never" }}
      info={
        <>
          <Paragraph>
            Filters compose with the other layer styles: a{" "}
            <InlineCode>transform3d</InlineCode> tilts the keybinding panel in
            perspective while a bloom + glitch + chromaticAberration chain runs
            over the same capture — the whole HUD look is one style object.
            Hover a row: plain transitions keep easing inside the filtered
            layer.
          </Paragraph>
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
