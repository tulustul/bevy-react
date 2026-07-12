import { useEffect, useState } from "react";
import { bevy, type WindowSize } from "@/bevy";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";

export function BevyToReactDemo() {
  return (
    <>
      <BounceExample />
      <WindowSizeExample />
    </>
  );
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

const RESIZE_TYPESCRIPT = `const [size, setSize] = useState<WindowSize | null>(null);

useEffect(() => {
  void bevy.window.size().then(setSize); // current value on mount
  return bevy.on("resize", setSize);     // live updates
}, []);`;

function WindowSizeExample() {
  const [size, setSize] = useState<WindowSize | null>(null);

  useEffect(() => {
    void bevy.window.size().then(setSize);
    return bevy.on("resize", setSize);
  }, []);

  return (
    <Example
      description={`Built into the core plugin, no registration needed: bevy.on("resize") streams the UI viewport's logical size, and bevy.window.size() pulls it on demand (here: once on mount). Resize the app window to see it update.`}
      tsx={RESIZE_TYPESCRIPT}
    >
      <text style={{ fontSize: FontSizes.lg }}>Window</text>
      <text
        style={{
          fontSize: FontSizes.xxxl,
          fontWeight: "bold",
          color: Colors.yellow100,
        }}
      >
        {size ? `${Math.round(size.width)} x ${Math.round(size.height)}` : "-"}
      </text>
    </Example>
  );
}
