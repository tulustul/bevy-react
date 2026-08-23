import { useEffect, useState } from "react";
import { bevy } from "@/bevy";
import type { BallState } from "@/bevy";
import { Example } from "@/components";
import { CodeTabs, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const REQUEST_TSX = `// A unit request payload becomes a zero-arg proxy method;
// the promise resolves with the typed BallState reply.
const ball = await bevy.pollingDemo.getBall();`;

const POLL_TSX = `useEffect(() => {
  let alive = true;
  const tick = async () => {
    try {
      const ball = await bevy.pollingDemo.getBall();
      if (alive) setState(ball);
    } catch {
      // Scene switched away: the ball is gone and Bevy
      // rejected the request. Cleanup stops the loop.
    }
    if (alive) setTimeout(tick, 50);
  };
  tick();
  return () => {
    alive = false;
  };
}, []);`;

const REQUEST_RUST = `#[react_request(name = "pollingDemo.getBall", response = BallState)]
struct GetBall;

#[derive(Serialize, TS)]
struct BallState {
    x: f32,
    y: f32,
    vx: f32,
    vy: f32,
}

fn report_ball(
    req: On<Request<GetBall>>,
    balls: Query<(&Transform, &Velocity)>,
) {
    match balls.single() {
        Ok((t, v)) => req.respond(BallState {
            x: t.translation.x,
            y: t.translation.y,
            vx: v.0.x,
            vy: v.0.y,
        }),
        // Rejects the awaiting promise instead of hanging.
        Err(_) => req.respond_err("ball not active"),
    }
}

app.add_react_request_handler(report_ball);`;

const PAGE: ExplanationData = {
  title: "Request / response",
  startCollapsed: true,
  info: (
    <>
      <P>
        The request/response channel: awaiting{" "}
        <InlineCode>bevy.pollingDemo.getBall()</InlineCode> sends a correlated
        request that a Bevy observer — declared with{" "}
        <InlineCode>#[react_request]</InlineCode>, observed as{" "}
        <InlineCode>{"On<Request<GetBall>>"}</InlineCode> — answers with{" "}
        <InlineCode>req.respond</InlineCode>. The promise resolves with a typed{" "}
        <InlineCode>BallState</InlineCode> generated from the Rust struct.
      </P>
      <CodeTabs tsx={REQUEST_TSX} rust={REQUEST_RUST} />
      <P>
        An unknown name, a malformed payload, or an explicit{" "}
        <InlineCode>respond_err</InlineCode> rejects the promise — it never
        hangs. This demo polls the request every 50ms for live position/velocity
        telemetry of the bouncing ball.
      </P>
    </>
  ),
};

export function BidirectionCommunicationDemo() {
  useDemoPage(PAGE);
  return <BallTelemetryExample />;
}

function BallTelemetryExample() {
  return (
    <Example
      title="Ball telemetry"
      info={
        <>
          <P>
            A <InlineCode>setTimeout</InlineCode> loop awaits{" "}
            <InlineCode>bevy.pollingDemo.getBall()</InlineCode> every 50ms and
            stores the reply in React state — live position/velocity read
            straight off the 3D ball. When the scene is switched away the ball
            despawns and Bevy rejects the in-flight request; the{" "}
            <InlineCode>catch</InlineCode> ignores it and the effect cleanup
            stops the loop.
          </P>
          <CodeTabs tsx={POLL_TSX} rust={REQUEST_RUST} />
        </>
      }
      demo={BallTelemetryCard}
    />
  );
}

function BallTelemetryCard() {
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

  return state ? (
    <node style={{ flexDirection: "column", gap: 8, alignItems: "start" }}>
      <Row label="position" x={state.x} y={state.y} />
      <Row label="velocity" x={state.vx} y={state.vy} />
    </node>
  ) : (
    <text style={{ color: Colors.textColor300, fontSize: FontSizes.sm }}>
      waiting for the ball...
    </text>
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
