import { DemoRow, Example, Pinchable, Stage } from "@/components";
import { Code, CodeTabs } from "@/components/docs";
import { InlineCode, Paragraph } from "@/components/typography";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors, FontSizes } from "@/theme";
import {
  interpolate,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type Driver,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { useEffect, useState } from "react";

// `sparkle` is not part of bevy-react: the demos app registers it in
// `examples/demos/sparkle/mod.rs`, and `bevy.ts` (generated) adds it to
// `BevyStyle`. Particles live in an overlay above the whole UI, so the
// example renders its button inline (no `demo` component): the Details
// modal would otherwise mount a second button whose sparkles float over it.

const PROPERTY_RUST = `#[derive(Debug, Clone, PartialEq, Deserialize, TS)]
pub struct Sparkle {
    pub rate: f32,
    #[ts(optional)] pub color: Option<String>,
    #[ts(optional)] pub size: Option<f32>,
}

pub static SPARKLE: StyleProperty<Sparkle> = StyleProperty::new("sparkle");

app.add_react_style(&SPARKLE);`;

const PROPERTY_TSX = `// Typed like any core property (\`sparkle?: Sparkle\` in BevyStyle).
<button
  style={{ sparkle: { rate: 8 } }}
  pressStyle={{ sparkle: { rate: 70, size: 7, color: "gold" } }}
>
  <text>Make a wish</text>
</button>`;

const SYSTEM_RUST = `// No writer reads \`sparkle\`, so the core stamps its value on the node.
fn emit_sparkles(
    time: Res<Time>,
    mut emitters: Query<(&StyleValue<Sparkle>, &ComputedNode, &UiGlobalTransform, …)>,
    …
) {
    for (sparkle, node, global, …) in &mut emitters {
        // spawn sparkle.0.rate particles per second inside the node's box
    }
}`;

const PAGE: ExplanationData = {
  title: "Custom styles",
  info: (
    <>
      <Paragraph>
        An app registers its own style properties with{" "}
        <InlineCode>app.add_react_style</InlineCode>. The value type decodes
        with serde, and the exporter types it into{" "}
        <InlineCode>BevyStyle</InlineCode> — in <InlineCode>style</InlineCode>{" "}
        and in the hover, press and focus variants alike.
      </Paragraph>
      <CodeTabs tsx={PROPERTY_TSX} rust={PROPERTY_RUST} />
      <Paragraph>
        A property no writer reads is stamped on the node as a{" "}
        <InlineCode>{"StyleValue<T>"}</InlineCode> component, present exactly
        while the merged style sets it. The app's own systems query it — here,
        to emit particles.
      </Paragraph>
      <Code lang="rust">{SYSTEM_RUST}</Code>
      <Paragraph>
        A property that must shape its own component registers a{" "}
        <InlineCode>Writer</InlineCode> with{" "}
        <InlineCode>add_react_style_writer</InlineCode> instead; it runs
        whenever the property changes, like the core's own writers.
      </Paragraph>
    </>
  ),
};

export function CustomStylesDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <SparkleExample />
    </DemoRow>
  );
}

const BUTTON_TSX = `const [pressed, setPressed] = useState(false);
const amp = pressed ? 4 : 1;

<Pinchable
  onPressedChange={setPressed}
  style={{
    transform: {
      translateX: { animated: interpolate(shakeX, [-1, 1], [-amp, amp]) },
      translateY: { animated: interpolate(shakeY, [-1, 1], [-amp, amp]) },
    },
  }}
>
  <button
    style={{ sparkle: { rate: 8 }, sparkleBurst: clicks, focusPolicy: "pass" }}
    pressStyle={{ sparkle: { rate: 70, size: 7 } }}
    onClick={() => setClicks((n) => n + 1)}
  >
    <text>Make a wish</text>
  </button>
</Pinchable>`;

function SparkleExample() {
  return (
    <Example
      title="Sparkle"
      info={
        <>
          <Paragraph>
            The button sparkles gently at rest and hard while pressed: the press
            value sits in the <InlineCode>pressStyle</InlineCode> variant, and
            the stamped component follows the merged style.
          </Paragraph>
          <Paragraph>
            A click bursts a ring of particles in every direction. That is a
            second property, <InlineCode>sparkleBurst</InlineCode>: a trigger
            key (here a click counter) whose every new value fires one burst —
            the first value is only recorded. It can't be a{" "}
            <InlineCode>sparkle</InlineCode> field: a variant replaces a
            property's whole value, so a key inside{" "}
            <InlineCode>sparkle</InlineCode> would vanish under the press
            variant — right when a click lands.
          </Paragraph>
          <Paragraph>
            The shake is two ordinary animated values, not part of the custom
            style: each loops through its own run of random offsets at random
            paces, and the two never line up. Variants accept static values only
            — a binding inside <InlineCode>pressStyle</InlineCode> is ignored —
            so the amplitude follows React state, from{" "}
            <InlineCode>Pinchable</InlineCode>&apos;s{" "}
            <InlineCode>onPressedChange</InlineCode>. The shake moves the whole
            wrapper: a translation on a composited layer is applied at composite
            time, so it never re-captures the button. The particles follow it —
            the emitter reads the button&apos;s global transform.
          </Paragraph>
          <Code lang="tsx">{BUTTON_TSX}</Code>
        </>
      }
    >
      <Stage style={stageStyle}>
        <SparkleButton />
      </Stage>
    </Example>
  );
}

/** An endless irregular wobble in -1..1: a fixed run of random offsets at
 *  random paces, repeated (each run starts where the last one ended). */
function jitter(steps: number): Driver {
  const hops = Array.from({ length: steps }, () =>
    withTiming(Math.random() * 2 - 1, { duration: 35 + Math.random() * 45 }),
  );
  return withRepeat(withSequence(...hops));
}

function SparkleButton() {
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const [pressed, setPressed] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    // Co-prime run lengths: the two axes never fall into step.
    shakeX.value = jitter(9);
    shakeY.value = jitter(7);
  }, [shakeX, shakeY]);

  const amp = pressed ? 4 : 1;
  return (
    // The inner button must carry no `onPointer*` handlers: the topmost
    // handler node owns a press, and it would starve Pinchable's surface
    // (no pinch). The press state comes from `onPressedChange` instead.
    <Pinchable
      params={{ strength: 0.6, radius: 0.4 }}
      onPressedChange={setPressed}
      style={{
        transform: {
          translateX: {
            animated: interpolate(shakeX, [-1, 1], [-amp, amp]),
          },
          translateY: {
            animated: interpolate(shakeY, [-1, 1], [-amp, amp]),
          },
        },
      }}
    >
      <button
        style={{ ...buttonStyle, sparkleBurst: clicks }}
        pressStyle={buttonPressStyle}
        onClick={() => setClicks((n) => n + 1)}
      >
        <text style={labelStyle}>Make a wish</text>
      </button>
    </Pinchable>
  );
}

const stageStyle: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 300,
  height: 160,
};

const buttonStyle: BevyStyle = {
  padding: { horizontal: 28, vertical: 14 },
  borderRadius: 999,
  backgroundGradient: {
    type: "linear",
    angle: 180,
    stops: [{ color: Colors.amber100 }, { color: Colors.yellow100 }],
  },
  cursor: "pointer",
  // Pinchable's press surface behind the button takes the press, so the
  // button must let pointer interaction through (see `Button`).
  focusPolicy: "pass",
  sparkle: { rate: 8 },
};

const buttonPressStyle: BevyStyle = {
  sparkle: { rate: 70, size: 7 },
};

const labelStyle: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.lg,
  fontWeight: "bold",
};
