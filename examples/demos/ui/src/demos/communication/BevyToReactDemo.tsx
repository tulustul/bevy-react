import { useEffect, useState } from "react";
import { bevy } from "@/bevy";
import { Example } from "@/components";
import { B, CodeTabs, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const EVENT_TSX = `import { bevy } from "./bevy"; // generated

useEffect(() => {
  const off = bevy.on("bevyEventsDemo.ballBounced", (e) => {
    setBounces((n) => n + 1);
  });
  return off; // unsubscribe on unmount
}, []);`;

const EVENT_RUST = `#[react_event(name = "bevyEventsDemo.ballBounced")]
struct BallBounced {
    wall: Wall,
    speed: f32,
}

// Send from any system via the ReactEvents system param.
fn bounce(events: ReactEvents, /* … */) {
    events.send(&BallBounced { wall, speed });
}

// Registration tells the exporter about the type:
app.add_react_event::<BallBounced>();`;

const PAGE: ExplanationData = {
  title: "Bevy to React",
  startCollapsed: true,
  info: (
    <>
      <P>
        Bevy pushes typed events to React: a struct tagged{" "}
        <InlineCode>#[react_event]</InlineCode> can be sent from any system via
        the <InlineCode>ReactEvents</InlineCode> system param, and every JS
        listener subscribed with <InlineCode>bevy.on(name, cb)</InlineCode>{" "}
        fires with the deserialized payload. The payload type is{" "}
        <B>generated from the Rust struct</B>, so the callback is fully typed.
      </P>
      <CodeTabs tsx={EVENT_TSX} rust={EVENT_RUST} />
      <P>
        Here the bouncing-ball 3D scene sends{" "}
        <InlineCode>bevyEventsDemo.ballBounced</InlineCode> on each wall hit.
        This direction is fire-and-forget streaming — for React pulling data on
        demand, see the request/response channel on the Bevy {"<->"} React page.
      </P>
    </>
  ),
};

export function BevyToReactDemo() {
  useDemoPage(PAGE);
  return <BounceExample />;
}

function BounceExample() {
  return (
    <Example
      title="Bounce counter"
      info={
        <>
          <P>
            One <InlineCode>bevy.on</InlineCode> subscription in a{" "}
            <InlineCode>useEffect</InlineCode>: each{" "}
            <InlineCode>ballBounced</InlineCode> event increments local React
            state. <InlineCode>bevy.on</InlineCode> returns the unsubscribe
            function, so returning it from the effect cleans up on unmount.
            Watch the ball in the 3D scene — every wall hit ticks the counter.
          </P>
          <CodeTabs tsx={EVENT_TSX} rust={EVENT_RUST} />
        </>
      }
      demo={BounceCard}
    />
  );
}

function BounceCard() {
  const [bounces, setBounces] = useState(0);

  useEffect(() => {
    return bevy.on("bevyEventsDemo.ballBounced", () => {
      setBounces((bounces) => bounces + 1);
    });
  }, []);

  return (
    <node style={{ flexDirection: "column", alignItems: "center" }}>
      <text style={{ fontSize: FontSizes.lg }}>Bounces</text>
      <text
        style={{
          fontSize: FontSizes.xxxl,
          fontWeight: "bold",
          color: Colors.yellow100,
        }}
      >
        {bounces}
      </text>
    </node>
  );
}
