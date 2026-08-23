import { useEffect, useState } from "react";
import { bevy } from "@/bevy";
import { Button, Example } from "@/components";
import { CodeTabs, InlineCode, P } from "@/components/docs";
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
      <P>
        React notifies Bevy with typed messages: a struct tagged{" "}
        <InlineCode>#[react_message]</InlineCode> gets a generated wrapper —
        here <InlineCode>bevy.basicDemo.setCount(n)</InlineCode> — whose payload
        type mirrors the Rust struct. Calling it is fire-and-forget: the value
        deserializes into <InlineCode>SetCount</InlineCode> and is triggered for
        every observer registered with{" "}
        <InlineCode>add_react_handler</InlineCode>.
      </P>
      <CodeTabs tsx={MESSAGE_TSX} rust={MESSAGE_RUST} />
      <P>
        Here the observer writes the count into a resource and the Cubes scene
        rebuilds to that many cubes. There is no reply on this channel — for
        React pulling data back out of Bevy, see the request/response channel on
        the Bevy {"<->"} React page.
      </P>
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
          <P>
            The buttons drive plain React state, and a{" "}
            <InlineCode>useEffect</InlineCode> emits{" "}
            <InlineCode>bevy.basicDemo.setCount(count)</InlineCode> on every
            change. The Bevy observer clamps the value and updates the{" "}
            <InlineCode>DesiredCubes</InlineCode> resource — watch the 3D scene
            respawn the row of cubes to match.
          </P>
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
      <text style={countStyle}>
        Cubes: <text style={{ color: Colors.primary100 }}>{count}</text>
      </text>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <Button
          onClick={() => setCount((c) => Math.min(MAX, c + 1))}
          pinch={2}
          style={{
            ...buttonStyle,
            backgroundColor: Colors.primary100,
            backgroundGradient: undefined,
          }}
          hoverStyle={{
            backgroundColor: Colors.primary200,
            backgroundGradient: undefined,
          }}
          pressStyle={{
            backgroundColor: Colors.primary300,
            backgroundGradient: undefined,
          }}
          labelStyle={{ fontSize: FontSizes.xxxl }}
        >
          +
        </Button>
        <Button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          pinch={2}
          style={{
            ...buttonStyle,
            backgroundColor: Colors.red100,
            backgroundGradient: undefined,
          }}
          hoverStyle={{
            backgroundColor: Colors.red200,
            backgroundGradient: undefined,
          }}
          pressStyle={{
            backgroundColor: Colors.red300,
            backgroundGradient: undefined,
          }}
          labelStyle={{ fontSize: FontSizes.xxxl }}
        >
          -
        </Button>
      </node>
    </>
  );
}

const countStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xl,
  fontWeight: "bold",
};

const buttonStyle: BevyStyle = {
  width: 60,
  height: 60,
};
