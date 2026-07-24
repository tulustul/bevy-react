import { useEffect, useState } from "react";
import { bevy } from "@/bevy";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

export function BevyToReactDemo() {
  useDemoPage(PAGE);
  return <BounceExample />;
}

const BOUNCE_TYPESCRIPT = `bevy.on("bevyEventsDemo.ballBounced", (e) => {
  setBounces((n) => n + 1);
});`;

const BOUNCE_RUST = `#[react_event(name = "bevyEventsDemo.ballBounced")]
struct BallBounced {
    wall: Wall,
    speed: f32,
}

fn bounce(events: ReactEvents, /* ... */) {
    events.send(&BallBounced { wall, speed });
}

app.add_react_event::<BallBounced>();`;

const PAGE: ExplanationData = {
  title: "Bevy -> React",
  description:
    'Bevy -> React: a typed #[react_event] sent from any system via ReactEvents fires every JS listener subscribed by name with bevy.on. Here the bouncing-ball scene sends "bevyEventsDemo.ballBounced" on each wall hit and the counter increments.',
  tsx: BOUNCE_TYPESCRIPT,
  rust: BOUNCE_RUST,
};

function BounceExample() {
  const [bounces, setBounces] = useState(0);

  useEffect(() => {
    const off = bevy.on("bevyEventsDemo.ballBounced", () => {
      setBounces((bounces) => bounces + 1);
    });

    return () => {
      off();
    };
  }, []);

  return (
    <Example>
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
    </Example>
  );
}
