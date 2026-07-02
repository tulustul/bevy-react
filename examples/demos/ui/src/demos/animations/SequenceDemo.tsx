import { useState } from "react";
import {
  Animated,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { column, playButton, playLabel } from "./shared";
import { Colors } from "@/theme";

// withSequence chains drivers — each starts where the previous ended — and
// withDelay inserts the pauses between them. The trailing function is the
// completion callback (Reanimated-style): it fires once, on the Bevy side
// reporting the whole sequence settled, with finished=false if something
// interrupted it. Here it re-enables the Play button.

const TYPESCRIPT = `x.value = withSequence(
  withTiming(110, { easing: "easeOut" }),
  withDelay(250, withTiming(-110)),
  withDelay(250, withTiming(0)),
  (finished) => setRunning(false),
);`;

export function SequenceDemo() {
  const x = useSharedValue(0);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    x.value = withSequence(
      withTiming(110, { duration: 450, easing: "easeOut" }),
      withDelay(250, withTiming(-110, { duration: 450, easing: "easeInOut" })),
      withDelay(250, withTiming(0, { duration: 350, easing: "easeIn" })),
      () => setRunning(false),
    );
  };

  return (
    <Example
      description="Press Play: slide right, pause, slide left, pause, return - one composed driver. Its completion callback re-enables the button."
      tsx={TYPESCRIPT}
    >
      <node style={column}>
        <node style={stage}>
          <Animated.node style={square} animatedStyle={{ translateX: x }} />
        </node>
        <button
          style={running ? { ...playButton, opacity: 0.4 } : playButton}
          pressStyle={{ transform: { scale: 0.92 } }}
          onClick={running ? undefined : run}
        >
          <text style={playLabel}>{running ? "Playing…" : "Play"}</text>
        </button>
      </node>
    </Example>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 280,
  height: 64,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const square: BevyStyle = {
  width: 40,
  height: 40,
  borderRadius: 10,
  backgroundColor: Colors.green100,
};
