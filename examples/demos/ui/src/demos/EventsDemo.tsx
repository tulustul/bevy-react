import { useEffect, useRef, useState } from "react";
import { bevy } from "../generated";
import { cardStyle, headingStyle, labelStyle } from "./styles";

export function EventsDemo() {
  const bouncesRef = useRef(0);
  const [bounces, setBounces] = useState(0);

  useEffect(() => {
    const off = bevy.on("ball.bounced", () => {
      bouncesRef.current++;
      setBounces(bouncesRef.current);
    });

    return () => {
      off();
    };
  }, []);

  return (
    <node style={cardStyle}>
      <text style={headingStyle}>Bounce events</text>
      <text style={labelStyle}>bevy.on(&quot;ball.bounced&quot;)</text>

      <node style={toastColumn}>
        <text style={{ color: "#6c7086", fontSize: 14 }}>
          Number of bounces: {bounces}
          <text style={{ color: "#1e1e2e", fontSize: 15 }}>{bounces}</text>
        </text>
      </node>
    </node>
  );
}

const toastColumn = {
  flexDirection: "column" as const,
  alignItems: "center" as const,
  gap: 8,
  justifyContent: "start" as const,
};
