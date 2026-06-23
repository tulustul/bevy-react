import { useEffect, useState } from "react";
import { bevy } from "../generated";
import { Example } from "../components";

const TYPESCRIPT = `bevy.on(
  "bouncingBall.bounced",
  () => setBounces((bounces) => bounces + 1);
)`;

const RUST = `#[react_event(name = "bouncingBall.bounced")]
struct BallBounced {
  // data
}

fn bounce(events: ReactEvents) {
    events.send(&BallBounced { });
}

app.add_systems(Update, bounce);
`;

export function EventsDemo() {
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
    <Example typescript={TYPESCRIPT} rust={RUST}>
      <text style={{ fontSize: 18 }}>Bounces: {bounces}</text>
    </Example>
  );
}
