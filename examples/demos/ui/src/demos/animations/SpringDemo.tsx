import { useState } from "react";
import { Animated, useSharedValue, withSpring } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { column, playButton, playLabel } from "./shared";
import { Colors } from "@/theme";

// A damped spring: tune stiffness and damping, then watch the square settle.

const TYPESCRIPT = `x.value = withSpring(90, {
  stiffness: 120,
  damping: 12,
});`;

export function SpringDemo() {
  const [stiffness, setStiffness] = useState(120);
  const [damping, setDamping] = useState(12);
  const [right, setRight] = useState(false);
  const x = useSharedValue(-90);

  const bounce = () => {
    const to = right ? -90 : 90;
    x.value = withSpring(to, { stiffness, damping });
    setRight(!right);
  };

  return (
    <Example
      description="A physical spring: low damping overshoots and wobbles, high damping glides."
      typescript={TYPESCRIPT}
    >
      <node style={column}>
        <node style={stage}>
          <Animated.node style={square} animatedStyle={{ translateX: x }} />
        </node>
        <Slider
          value={stiffness}
          min={20}
          max={300}
          onChange={setStiffness}
          label={`stiffness ${stiffness.toFixed(0)}`}
        />
        <Slider
          value={damping}
          min={2}
          max={40}
          onChange={setDamping}
          label={`damping ${damping.toFixed(0)}`}
        />
        <button
          style={playButton}
          pressStyle={{ transform: { scale: 0.92 } }}
          onClick={bounce}
        >
          <text style={playLabel}>Bounce</text>
        </button>
      </node>
    </Example>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 240,
  height: 64,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const square: BevyStyle = {
  width: 40,
  height: 40,
  borderRadius: 10,
  backgroundColor: Colors.primary100,
};
