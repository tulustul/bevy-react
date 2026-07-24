import { useEffect, useState } from "react";
import { bevy } from "@/bevy";
import type { BallState } from "@/bevy";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const TYPESCRIPT = "const ball = await bevy.pollingDemo.getBall();";

const RUST = `#[react_request(name = "pollingDemo.getBall", response = BallState)]
struct GetBall;

#[derive(Serialize, TS)]
struct BallState { x: f32, y: f32, vx: f32, vy: f32 }

fn report_ball(
    req: On<Request<GetBall>>,
    balls: Query<(&Transform, &Velocity)>,
) {
    let (t, v) = balls.single().unwrap();
    req.respond(BallState {
        x: t.translation.x, y: t.translation.y,
        vx: v.0.x, vy: v.0.y,
    });
}

app.add_react_request_handler(report_ball);`;

const PAGE: ExplanationData = {
  title: "Bevy <-> React",
  description:
    "React <-> Bevy: an awaited bevy.pollingDemo.getBall() request (a #[react_request] observed as On<Request<GetBall>> and answered with req.respond) returns a typed BallState. The demo polls it every 50ms for live position/velocity telemetry; an unknown or failed request rejects the promise instead of hanging.",
  tsx: TYPESCRIPT,
  rust: RUST,
};

export function BidirectionCommunicationDemo() {
  useDemoPage(PAGE);
  const [state, setState] = useState<BallState | null>(null);

  useEffect(() => {
    let alive = true;
    let handle: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const ball = await bevy.pollingDemo.getBall();
        if (!alive) {
          return;
        }
        setState(ball);
      } catch {
        // The demo was switched away mid-flight: the ball is gone and Bevy
        // rejected. Ignore — the cleanup below stops the loop.
      }
      if (alive) {
        handle = setTimeout(tick, 50);
      }
    };
    tick();

    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, []);

  return (
    <Example>
      {state ? (
        <node style={{ flexDirection: "column", gap: 8, alignItems: "start" }}>
          <Row label="position" x={state.x} y={state.y} />
          <Row label="velocity" x={state.vx} y={state.vy} />
        </node>
      ) : (
        <text style={{ color: Colors.textColor300, fontSize: FontSizes.sm }}>
          waiting for the ball...
        </text>
      )}
    </Example>
  );
}

function Row({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <node style={{ flexDirection: "row", gap: 8 }}>
      <text
        style={{
          color: Colors.textColor200,
          fontSize: FontSizes.base,
          width: 80,
        }}
      >
        {label}
      </text>
      <text
        style={{
          color: Colors.primary100,
          fontSize: FontSizes.base,
          fontWeight: "bold",
        }}
      >
        x {x.toFixed(2)}, y {y.toFixed(2)}
      </text>
    </node>
  );
}
