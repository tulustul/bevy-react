import { useState } from "react";
import { BoxLabel, InlineCode, Paragraph } from "@/components/typography";
import {
  cancelAnimation,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Column, Example, Slider, Stage } from "@/components";
import { Code } from "@/components/docs";
import { Colors, FontSizes, Gradients } from "@/theme";

// The remaining driver cards: a tunable damped spring, a composed sequence
// with a completion callback, and an endless repeat with cancelAnimation.

const SPRING_TSX = `const x = useSharedValue(-90);
x.value = withSpring(90, { stiffness: 120, damping: 12 });

<node style={{ transform: { translateX: { animated: x } } }} />`;

export function SpringDemo() {
  return (
    <Example
      title="Springs"
      info={
        <>
          <Paragraph>
            <InlineCode>withSpring</InlineCode> drives the shared value with a
            damped physical spring instead of a fixed-duration curve: low
            damping overshoots and wobbles, high damping glides. Tune{" "}
            <InlineCode>stiffness</InlineCode> and{" "}
            <InlineCode>damping</InlineCode>, then press Bounce to send the
            square across.
          </Paragraph>
          <Code lang="tsx">{SPRING_TSX}</Code>
        </>
      }
      demo={SpringCard}
    />
  );
}

function SpringCard() {
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
    <Column style={{ gap: 16 }}>
      <Stage style={springStage}>
        <node
          style={{
            ...springSquare,
            transform: { translateX: { animated: x } },
          }}
        />
      </Stage>
      <Slider
        value={stiffness}
        min={20}
        max={300}
        onChange={setStiffness}
        name="stiffness"
      />
      <Slider
        value={damping}
        min={2}
        max={40}
        onChange={setDamping}
        name="damping"
      />
      <Button onClick={bounce}>Bounce</Button>
    </Column>
  );
}

const springStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 240,
  height: 64,
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
  withTiming(110, { duration: 450, easing: "easeOut" }),
  withDelay(250, withTiming(-110, { duration: 450, easing: "easeInOut" })),
  withDelay(250, withTiming(0, { duration: 350, easing: "easeIn" })),
  (finished) => setRunning(false), // completion callback
);`;

export function SequenceDemo() {
  return (
    <Example
      title="Sequences"
      info={
        <>
          <Paragraph>
            <InlineCode>withSequence</InlineCode> chains drivers — each starts
            where the previous ended — and <InlineCode>withDelay</InlineCode>{" "}
            inserts the pauses between them: slide right, pause, slide left,
            pause, return, as one composed driver. The trailing function is the
            completion callback (Reanimated-style): it fires once when Bevy
            reports the whole sequence settled (
            <InlineCode>finished=false</InlineCode> if interrupted), and here
            re-enables the Play button.
          </Paragraph>
          <Code lang="tsx">{SEQUENCE_TSX}</Code>
        </>
      }
      demo={SequenceCard}
    />
  );
}

function SequenceCard() {
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
    <Column style={{ gap: 16 }}>
      <Stage style={sequenceStage}>
        <node
          style={{
            ...sequenceSquare,
            transform: { translateX: { animated: x } },
          }}
        />
      </Stage>
      <Button onClick={running ? undefined : run}>
        {running ? "Playing…" : "Play"}
      </Button>
    </Column>
  );
}

const sequenceStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 280,
  height: 64,
};

const sequenceSquare: BevyStyle = {
  width: 40,
  height: 40,
  borderRadius: 10,
  backgroundColor: Colors.green100,
};

// withRepeat loops a driver forever unless a count is given; cancelAnimation
// freezes the shared value wherever it currently is.

const SPIN_TSX = `rot.value = withRepeat(
  // degrees, like the static transform.rotate field
  withTiming(360, { duration: 1200, easing: "linear" }),
); // no count — loops forever

cancelAnimation(rot); // freeze wherever it is`;

export function SpinDemo() {
  return (
    <Example
      title="Spinning"
      info={
        <>
          <Paragraph>
            An endless rotation: <InlineCode>withRepeat</InlineCode> (no count)
            loops a linear <InlineCode>withTiming</InlineCode> over a full turn
            forever. Stop calls <InlineCode>cancelAnimation</InlineCode>, which
            freezes the shared value wherever it currently is instead of
            snapping back.
          </Paragraph>
          <Code lang="tsx">{SPIN_TSX}</Code>
        </>
      }
      demo={SpinCard}
    />
  );
}

function SpinCard() {
  const rot = useSharedValue(0);
  const [spinning, setSpinning] = useState(false);

  const start = () => {
    rot.value = 0;
    rot.value = withRepeat(
      // Rotation binds in degrees, like the static transform.rotate field.
      withTiming(360, { duration: 1200, easing: "linear" }),
    );
    setSpinning(true);
  };

  const stop = () => {
    cancelAnimation(rot);
    setSpinning(false);
  };

  return (
    <Column style={{ gap: 16 }}>
      <Stage style={spinStage}>
        <node
          style={{ ...spinSquare, transform: { rotate: { animated: rot } } }}
        >
          <BoxLabel style={{ fontSize: FontSizes.xxl }}>^</BoxLabel>
        </node>
      </Stage>
      <node style={{ flexDirection: "row", gap: 10 }}>
        <Button onClick={start}>{spinning ? "Restart" : "Start"}</Button>
        <Button onClick={stop}>Stop</Button>
      </node>
    </Column>
  );
}

const spinStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 160,
  height: 120,
};

const spinSquare: BevyStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
  backgroundColor: Colors.purple100,
  justifyContent: "center",
  alignItems: "center",
};
