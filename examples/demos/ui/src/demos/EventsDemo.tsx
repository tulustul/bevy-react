import { useEffect, useRef, useState } from "react";
import { bevy } from "../generated";
import { headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

const HINT = 'bevy.on("ball.bounced", () => {})';

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
    <Card>
      <text style={headingStyle}>Bounce events</text>
      <text style={labelStyle}>{HINT}</text>

      <text style={{ color: "#6c7086", fontSize: 14 }}>
        Number of bounces: {bounces}
      </text>
    </Card>
  );
}
