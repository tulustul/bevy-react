import { useEffect, useState } from "react";
import { InlineCode, Paragraph } from "@/components/typography";
import { bevy } from "@/bevy";
import { Button, Example, Readout, SecondaryButton } from "@/components";
import { CodeTabs } from "@/components/docs";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const MAX = 8;

const MESSAGE_TSX = `import { bevy } from "./bevy"; // generated

const [count, setCount] = useState(3);

// Typed fire-and-forget notify — no reply to await. The dotted
// name becomes a nested method on the generated bevy proxy.
useEffect(() => {
  bevy.basicDemo.setCount(count);
}, [count]);`;

const MESSAGE_RUST = `#[react_message(name = "basicDemo.setCount")]
struct SetCount(usize);

// An observer receives the typed payload and applies it to the ECS.
fn apply_set_count(
    count: On<SetCount>,
    mut desired: ResMut<DesiredCubes>,
) {
    desired.0 = count.event().0.min(MAX_CUBES);
}

// Registration routes the name to the observer (and tells the
// TypeScript exporter about the payload type):
app.add_react_handler(apply_set_count);`;

const PAGE: ExplanationData = {
  title: "React to Bevy",
  startCollapsed: true,
  info: (
    <>
      <Paragraph>
        React notifies Bevy with typed messages: a struct tagged{" "}
        <InlineCode>#[react_message]</InlineCode> gets a generated wrapper —
        here <InlineCode>bevy.basicDemo.setCount(n)</InlineCode> — whose payload
        type mirrors the Rust struct. Calling it is fire-and-forget: the value
        deserializes into <InlineCode>SetCount</InlineCode> and is triggered for
        every observer registered with{" "}
        <InlineCode>add_react_handler</InlineCode>.
      </Paragraph>
      <CodeTabs tsx={MESSAGE_TSX} rust={MESSAGE_RUST} />
      <Paragraph>
        Here the observer writes the count into a resource and the Cubes scene
        rebuilds to that many cubes. There is no reply on this channel — for
        React pulling data back out of Bevy, see the request/response channel on
        the Bevy {"<->"} React page.
      </Paragraph>
    </>
  ),
};

export function ReactToBevyDemo() {
  useDemoPage(PAGE);
  return <CubeCounterExample />;
}

function CubeCounterExample() {
  return (
    <Example
      title="Cube counter"
      info={
        <>
          <Paragraph>
            The buttons drive plain React state, and a{" "}
            <InlineCode>useEffect</InlineCode> emits{" "}
            <InlineCode>bevy.basicDemo.setCount(count)</InlineCode> on every
            change. The Bevy observer clamps the value and updates the{" "}
            <InlineCode>DesiredCubes</InlineCode> resource — watch the 3D scene
            respawn the row of cubes to match.
          </Paragraph>
          <CodeTabs tsx={MESSAGE_TSX} rust={MESSAGE_RUST} />
        </>
      }
      demo={CubeCounterCard}
    />
  );
}

function CubeCounterCard() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    bevy.basicDemo.setCount(count);
  }, [count]);

  return (
    <>
      {/* The count is React state — the value React sends — so it carries
          React's cyan. It stays its own `<text>` (the roundtrip test reads
          it), and `+` stays the bare text child of its `<button>`. */}
      <Readout label="Cubes" value={count} color={Colors.cyan} />

      <node style={{ flexDirection: "row", gap: 12 }}>
        <Button
          onClick={() => setCount((c) => Math.min(MAX, c + 1))}
          pinch={{ radius: 0.8 }}
          style={stepButtonStyle}
          labelStyle={stepLabelStyle}
        >
          +
        </Button>
        <SecondaryButton
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          pinch={{ radius: 0.8 }}
          style={stepButtonStyle}
          labelStyle={stepLabelStyle}
        >
          −
        </SecondaryButton>
      </node>
    </>
  );
}

// Square steppers: `minWidth: 0` lifts Button's base minimum width.
const stepButtonStyle: BevyStyle = {
  width: 52,
  height: 52,
  minWidth: 0,
  padding: 0,
};

const stepLabelStyle: BevyStyle = {
  fontSize: FontSizes.xxl,
  fontWeight: "semibold",
};
