import { useState } from "react";
import {
  Animated,
  cancelAnimation,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { column, playButton, playLabel } from "../shared";
import { Colors, FontSizes, Gradients } from "@/theme";

// The remaining driver cards: a tunable damped spring, a composed sequence
// with a completion callback, and an endless repeat with cancelAnimation.

const SPRING_TSX = `x.value = withSpring(90, {
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
      title="Spring"
      description="withSpring drives the shared value with a damped physical spring instead of a fixed-duration curve: low damping overshoots and wobbles, high damping glides. Tune stiffness and damping, then press Bounce to send the square across."
      tsx={SPRING_TSX}
    >
      <node style={column}>
        <node style={springStage}>
          <Animated.node
            style={springSquare}
            animatedStyle={{ translateX: x }}
          />
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

const springStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 240,
  height: 64,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const springSquare: BevyStyle = {
  width: 40,
  height: 40,
  borderRadius: 10,
  backgroundColor: Colors.primary100,
  backgroundGradient: Gradients.primary,
};

// withSequence chains drivers — each starts where the previous ended — and
// withDelay inserts the pauses between them. The trailing function is the
// completion callback (Reanimated-style): it fires once, on the Bevy side
// reporting the whole sequence settled, with finished=false if something
// interrupted it. Here it re-enables the Play button.

const SEQUENCE_TSX = `x.value = withSequence(
  withTiming(110, {
    easing: "easeOut",
  }),
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
      title="Sequence"
      description="withSequence chains drivers — each starts where the previous ended — and withDelay inserts the pauses between them: slide right, pause, slide left, pause, return, as one composed driver. The trailing function is the completion callback (Reanimated-style): it fires once when Bevy reports the whole sequence settled (finished=false if interrupted), and here re-enables the Play button."
      tsx={SEQUENCE_TSX}
    >
      <node style={column}>
        <node style={sequenceStage}>
          <Animated.node
            style={sequenceSquare}
            animatedStyle={{ translateX: x }}
          />
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

const sequenceStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 280,
  height: 64,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const sequenceSquare: BevyStyle = {
  width: 40,
  height: 40,
  borderRadius: 10,
  backgroundColor: Colors.green100,
};

// withRepeat loops a driver forever (count -1); cancelAnimation freezes the
// shared value wherever it currently is.

const SPIN_TSX = `rot.value = withRepeat(
  withTiming(Math.PI * 2, {
    easing: "linear",
  }),
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
      title="Spin"
      description="An endless rotation: withRepeat with count -1 loops a linear withTiming over a full turn forever. Stop calls cancelAnimation, which freezes the shared value wherever it currently is instead of snapping back."
      tsx={SPIN_TSX}
    >
      <node style={column}>
        <node style={spinStage}>
          <Animated.node style={spinSquare} animatedStyle={{ rotate: rot }}>
            <text style={spinSquareText}>^</text>
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

const spinStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 160,
  height: 120,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const spinSquare: BevyStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
  backgroundColor: Colors.purple100,
  justifyContent: "center",
  alignItems: "center",
};

const spinSquareText: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xxl,
  fontWeight: "bold",
};
