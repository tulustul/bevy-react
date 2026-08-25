import { useEffect, useRef, useState } from "react";
import {
  interpolate,
  interpolateColor,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Radio, RadioOption } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { Colors } from "@/theme";

type Mode = "linear" | "easeInOut" | "spring";

const SHOWCASE_TSX = `// horizontal bounce: pause, slide right, pause, slide left —
// forever, staggered per square
x.value = withDelay(
  index * 80,
  withRepeat(
    withSequence(
      withDelay(280, move(110)),
      withDelay(280, move(-110)),
    ),
  ),
);

// an independent ping-pong pulse feeds scale and hue
<node
  style={{
    transform: {
      translateX: { animated: x },
      scale: { animated: interpolate(pulse, [0, 1], [0.9, 1.1]) },
    },
    backgroundColor: {
      animated: interpolateColor(pulse, [0, 1], [cool, warm]),
    },
  }}
/>`;

const COUNT = 4;
const AMP = 110; // horizontal travel, ± from center (px)
const SQUARE = 44;
const TRAVEL_MS = 650; // one-way slide duration
const STOP_MS = 280; // pause at each end
const STAGGER_MS = 80; // per-square start offset
const PULSE_MS = 600; // scale/hue pulse half-period
const RETARGET_MS = 280; // glide back to the loop start on a mode change

// Each square pulses from its cool base color to a warm partner.
const COOL = [
  Colors.primary100,
  Colors.red100,
  Colors.green100,
  Colors.yellow100,
  Colors.purple100,
];
const WARM = [
  Colors.purple100,
  Colors.orange100,
  Colors.teal100,
  Colors.red100,
  Colors.sky100,
];

const MODES: Mode[] = ["linear", "easeInOut", "spring"];
const MODE_OPTIONS: RadioOption<Mode>[] = MODES.map((v) => {
  return { label: v, value: v } satisfies RadioOption;
});

export function ShowcaseDemo() {
  return (
    <Example
      title="Bouncing squares"
      info={
        <>
          <P>
            Everything composed at once: staggered squares run{" "}
            <InlineCode>withRepeat(withSequence(withDelay(...)))</InlineCode>{" "}
            for the horizontal bounce, while an independent{" "}
            <InlineCode>withRepeat</InlineCode> ping-pong pulse feeds{" "}
            <InlineCode>interpolate</InlineCode> (scale) and{" "}
            <InlineCode>interpolateColor</InlineCode> (hue). Switch the easing
            live: <InlineCode>withTiming</InlineCode> for linear/easeInOut,{" "}
            <InlineCode>withSpring</InlineCode> for spring — a mode change
            glides back to the loop start before re-arming so the repeat stays
            seamless.
          </P>
          <Code lang="tsx">{SHOWCASE_TSX}</Code>
        </>
      }
      demo={ShowcaseCard}
    />
  );
}

function ShowcaseCard() {
  const [mode, setMode] = useState<Mode>("easeInOut");

  return (
    <>
      <node style={lanesStyle}>
        {Array.from({ length: COUNT }, (_, i) => (
          <BouncingSquare key={i} index={i} mode={mode} />
        ))}
      </node>

      <Radio options={MODE_OPTIONS} value={mode} onChange={setMode} />
    </>
  );
}

function BouncingSquare({ index, mode }: { index: number; mode: Mode }) {
  // Start at the left extreme so each loop cycle ends where it began (seamless).
  const x = useSharedValue(-AMP);
  // Scale/hue progress, 0↔1, independent of the bounce.
  const pulse = useSharedValue(0);
  const first = useRef(true);

  // Continuous scale + hue pulse: set once, never keyed on `mode`, so it keeps
  // running (even during the bounce's end-stops) and never re-arms.
  useEffect(() => {
    pulse.value = withDelay(
      index * STAGGER_MS,
      withRepeat(
        withTiming(1, { duration: PULSE_MS, easing: "easeInOut" }),
        { reverse: true }, // ping-pong 0↔1
      ),
    );
  }, [pulse, index]);

  // Horizontal bounce: re-armed when the easing mode changes.
  useEffect(() => {
    const move = (to: number) =>
      mode === "spring"
        ? withSpring(to, { stiffness: 120, damping: 14 })
        : withTiming(to, { duration: TRAVEL_MS, easing: mode });

    // pause-left → slide-right → pause-right → slide-left, forever.
    const bounce = withRepeat(
      withSequence(
        withDelay(STOP_MS, move(AMP)),
        withDelay(STOP_MS, move(-AMP)),
      ),
    );

    // On a mode change the value is mid-bounce; a non-reverse repeat re-anchors to
    // wherever it's built from, so glide back to the loop start (-AMP) first to
    // keep the repeat seamless. On first mount we're already at -AMP.
    const driver = first.current
      ? bounce
      : withSequence(
          withTiming(-AMP, { duration: RETARGET_MS, easing: "easeInOut" }),
          bounce,
        );
    first.current = false;

    x.value = withDelay(index * STAGGER_MS, driver);
  }, [x, index, mode]);

  return (
    <node style={laneStyle}>
      <node
        style={{
          ...squareStyle,
          transform: {
            translateX: { animated: x },
            scale: { animated: interpolate(pulse, [0, 1], [0.9, 1.1]) },
          },
          backgroundColor: {
            animated: interpolateColor(
              pulse,
              [0, 1],
              [COOL[index], WARM[index]],
            ),
          },
        }}
      />
    </node>
  );
}

const lanesStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
};

const laneStyle: BevyStyle = {
  width: 2 * AMP + SQUARE,
  height: SQUARE,
  justifyContent: "center",
  alignItems: "center",
};

const squareStyle: BevyStyle = {
  width: SQUARE,
  height: SQUARE,
  borderRadius: 10,
  backgroundColor: Colors.primary100,
};
