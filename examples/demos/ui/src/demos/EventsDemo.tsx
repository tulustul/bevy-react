import { useEffect, useRef, useState } from "react";
import { bevy } from "../generated";
import { headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

const HINT = 'bevy.on("bevyEventsDemo.ballBounced", () => {})';

export function EventsDemo() {
  const bouncesRef = useRef(0);
  const [bounces, setBounces] = useState(0);

  useEffect(() => {
    const off = bevy.on("bevyEventsDemo.ballBounced", () => {
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

      <text style={{ fontSize: 18 }}>Number of bounces: {bounces}</text>
    </Card>
  );
}
