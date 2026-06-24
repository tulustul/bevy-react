import { useState } from "react";
import {
  Animated,
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { column, playButton, playLabel } from "./shared";
import { Colors, FontSizes } from "@/theme";

// withRepeat loops a driver forever (count -1); cancelAnimation freezes the
// shared value wherever it currently is.

const TYPESCRIPT = `rot.value = withRepeat(
  withTiming(Math.PI * 2, { easing: "linear" }),
  -1,
);
cancelAnimation(rot); // freeze`;

export function SpinDemo() {
  const rot = useSharedValue(0);
  const [spinning, setSpinning] = useState(false);

  const start = () => {
    rot.value = 0;
    rot.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 1200, easing: "linear" }),
      -1,
    );
    setSpinning(true);
  };

  const stop = () => {
    cancelAnimation(rot);
    setSpinning(false);
  };

  return (
    <Example
      description="An endless rotation via withRepeat; Stop calls cancelAnimation to freeze it."
      typescript={TYPESCRIPT}
    >
      <node style={column}>
        <node style={stage}>
          <Animated.node style={square} animatedStyle={{ rotate: rot }}>
            <text style={squareText}>^</text>
          </Animated.node>
        </node>
        <node style={{ flexDirection: "row", gap: 10 }}>
          <button
            style={playButton}
            pressStyle={{ transform: { scale: 0.92 } }}
            onClick={start}
          >
            <text style={playLabel}>{spinning ? "Restart" : "Start"}</text>
          </button>
          <button
            style={{ ...playButton, backgroundColor: Colors.red100 }}
            pressStyle={{ transform: { scale: 0.92 } }}
            onClick={stop}
          >
            <text style={playLabel}>Stop</text>
          </button>
        </node>
      </node>
    </Example>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 160,
  height: 120,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const square: BevyStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
  backgroundColor: Colors.purple100,
  justifyContent: "center",
  alignItems: "center",
};

const squareText: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xxl,
  fontWeight: "bold",
};
