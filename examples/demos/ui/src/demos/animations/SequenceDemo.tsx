import {
  Animated,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "../../components";
import { column, playButton, playLabel } from "./shared";
import { Colors } from "../../theme";

// withSequence chains drivers — each starts where the previous ended — and
// withDelay inserts the pauses between them.

const TYPESCRIPT = `x.value = withSequence(
  withTiming(110, { easing: "easeOut" }),
  withDelay(250, withTiming(-110)),
  withDelay(250, withTiming(0)),
);`;

export function SequenceDemo() {
  const x = useSharedValue(0);

  const run = () => {
    x.value = withSequence(
      withTiming(110, { duration: 450, easing: "easeOut" }),
      withDelay(250, withTiming(-110, { duration: 450, easing: "easeInOut" })),
      withDelay(250, withTiming(0, { duration: 350, easing: "easeIn" })),
    );
  };

  return (
    <Example
      description="Press Play: slide right, pause, slide left, pause, return - one composed driver."
      typescript={TYPESCRIPT}
    >
      <node style={column}>
        <node style={stage}>
          <Animated.node style={square} animatedStyle={{ translateX: x }} />
        </node>
        <button
          style={playButton}
          pressStyle={{ transform: { scale: 0.92 } }}
          onClick={run}
        >
          <text style={playLabel}>Play</text>
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
