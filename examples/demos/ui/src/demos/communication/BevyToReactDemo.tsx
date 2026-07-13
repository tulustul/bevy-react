import { useEffect, useState } from "react";
import { bevy } from "@/bevy";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";

export function BevyToReactDemo() {
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
    <Example
      description="Bevy -> React: a typed event sent from a system fires every JS listener subscribed by name."
      tsx={BOUNCE_TYPESCRIPT}
      rust={BOUNCE_RUST}
    >
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
    </Example>
  );
}
