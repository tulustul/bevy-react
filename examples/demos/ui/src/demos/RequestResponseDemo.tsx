import { useEffect, useState } from "react";
import { bevy } from "../generated";
import type { BallState } from "../generated";
import { cardStyle, headingStyle, labelStyle } from "./styles";

export function RequestResponseDemo() {
  const [state, setState] = useState<BallState | null>(null);

  useEffect(() => {
    let alive = true;
    let handle: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const ball = await bevy.ball.get();
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
    <node style={cardStyle}>
      <text style={headingStyle}>Ball telemetry</text>
      <text style={labelStyle}>await bevy.ball.get()</text>

      {state ? (
        <node style={{ flexDirection: "column", gap: 8, alignItems: "start" }}>
          <Row label="position" x={state.x} y={state.y} />
          <Row label="velocity" x={state.vx} y={state.vy} />
        </node>
      ) : (
        <text style={{ color: "#6c7086", fontSize: 14 }}>
          waiting for the ball…
        </text>
      )}
    </node>
  );
}

function Row({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <node style={{ flexDirection: "row", gap: 8 }}>
      <text style={{ color: "#a6adc8", fontSize: 16, width: 80 }}>{label}</text>
      <text style={{ color: "#7aa2f7", fontSize: 16, fontWeight: "bold" }}>
        x {x.toFixed(2)}, y {y.toFixed(2)}
      </text>
    </node>
  );
}
