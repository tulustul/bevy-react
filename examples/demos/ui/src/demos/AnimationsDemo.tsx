import { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

// Reanimated-style animations declared in React and ticked by the one animation
// system in Bevy — React never re-renders per frame; it only declares the drivers.
// The left-nav "Animations" submenu switches between these examples (purely on the
// React side; this demo has no 3D scene).

const FADE_MS = 500;

const HINT = "<Animated.node animatedStyle={{opacity}} />";

export function FadeAnimationDemo() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: FADE_MS, easing: "easeInOut" }),
      -1,
      true, // ping-pong back to 1
    );
  }, [opacity]);

  return (
    <Card>
      <text style={headingStyle}>Fade</text>
      <text style={labelStyle}>{HINT}</text>

      <node style={fadeStageStyle}>
        <Animated.node style={fadeSquareStyle} animatedStyle={{ opacity }} />
      </node>
    </Card>
  );
}

const fadeStageStyle: BevyStyle = {
  width: 160,
  height: 160,
  justifyContent: "center",
  alignItems: "center",
};

const fadeSquareStyle: BevyStyle = {
  width: 88,
  height: 88,
  borderRadius: 16,
  backgroundColor: "#7aa2f7",
};

// --- Bouncing squares: a richer example (timing/spring + sequence + stagger). ---

type Mode = "linear" | "easeInOut" | "spring";

const COUNT = 4;
const AMP = 110; // horizontal travel, ± from center (px)
const SQUARE = 44;
const TRAVEL_MS = 650; // one-way slide duration
const STOP_MS = 280; // pause at each end
const STAGGER_MS = 80; // per-square start offset
const PULSE_MS = 600; // scale/hue pulse half-period
const RETARGET_MS = 280; // glide back to the loop start on a mode change

// Each square pulses from its cool base color to a warm partner.
const COOL = ["#7aa2f7", "#f7768e", "#9ece6a", "#e0af68", "#bb9af7"];
const WARM = ["#bb9af7", "#ff9e64", "#73daca", "#f7768e", "#7dcfff"];

export function BouncingBallsAnimationDemo() {
  const [mode, setMode] = useState<Mode>("easeInOut");

  return (
    <Card>
      <text style={headingStyle}>Bouncing Squares</text>

      <node style={lanesStyle}>
        {Array.from({ length: COUNT }, (_, i) => (
          <BouncingSquare key={i} index={i} mode={mode} />
        ))}
      </node>

      <node style={rowStyle}>
        {(["linear", "easeInOut", "spring"] as const).map((m) => (
          <ModeButton
            key={m}
            label={m}
            selected={m === mode}
            onPress={() => setMode(m)}
          />
        ))}
      </node>
    </Card>
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
        -1,
        true, // ping-pong 0↔1
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
      -1,
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
      <Animated.node
        style={{ ...squareStyle, backgroundColor: COOL[index] }}
        animatedStyle={{
          translateX: x,
          scale: interpolate(pulse, [0, 1], [0.9, 1.1]),
          backgroundColor: interpolateColor(
            pulse,
            [0, 1],
            [COOL[index], WARM[index]],
          ),
        }}
      />
    </node>
  );
}

function ModeButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <button
      onClick={onPress}
      style={{
        ...modeButtonStyle,
        backgroundColor: selected ? "#7aa2f7" : "#2a2a3c",
      }}
      hoverStyle={{ backgroundColor: selected ? "#7aa2f7" : "#42425e" }}
    >
      <text style={{ color: selected ? "#1e1e2e" : "#cdd6f4", fontSize: 14 }}>
        {label}
      </text>
    </button>
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
  backgroundColor: "#7aa2f7",
};

const rowStyle: BevyStyle = {
  flexDirection: "row",
  gap: 10,
  justifyContent: "center",
};

const modeButtonStyle: BevyStyle = {
  padding: { top: 8, right: 14, bottom: 8, left: 14 },
  borderRadius: 8,
  backgroundColor: "#2a2a3c",
  justifyContent: "center",
  alignItems: "center",
};
