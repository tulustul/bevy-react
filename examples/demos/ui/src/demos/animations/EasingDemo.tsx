import { useEffect, useRef, useState } from "react";
import { Animated, EasingName, useSharedValue, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { column, playButton, playLabel } from "./shared";
import { Colors, FontSizes } from "@/theme";

// The four easing curves, raced side by side over the same distance/duration so
// their acceleration profiles are easy to compare.

const TRAVEL = 200;
const DOT = 24;

const LANES: { name: string; easing: EasingName; color: string }[] = [
  { name: "linear", easing: "linear", color: Colors.primary100 },
  { name: "easeIn", easing: "easeIn", color: Colors.green100 },
  { name: "easeOut", easing: "easeOut", color: Colors.red100 },
  { name: "easeInOut", easing: "easeInOut", color: Colors.purple100 },
];

const TYPESCRIPT = `x.value = withTiming(200, {
  duration: 800,
  easing: "easeInOut",
});`;

export function EasingDemo() {
  const [duration, setDuration] = useState(800);
  const [play, setPlay] = useState(0);

  return (
    <Example
      description="Same distance, same duration: press Play to compare the four easings."
      typescript={TYPESCRIPT}
    >
      <node style={column}>
        <node style={{ flexDirection: "column", gap: 8 }}>
          {LANES.map((lane) => (
            <Lane key={lane.name} {...lane} duration={duration} play={play} />
          ))}
        </node>
        <Slider
          value={duration}
          min={200}
          max={2000}
          onChange={setDuration}
          label={`duration ${duration.toFixed(0)}ms`}
        />
        <button
          style={playButton}
          pressStyle={{ transform: { scale: 0.92 } }}
          onClick={() => setPlay((n) => n + 1)}
        >
          <text style={playLabel}>Play</text>
        </button>
      </node>
    </Example>
  );
}

type LaneProps = {
  name: string;
  easing: EasingName;
  color: string;
  duration: number;
  play: number;
};

function Lane({ name, easing, color, duration, play }: LaneProps) {
  const x = useSharedValue(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    x.value = 0;
    x.value = withTiming(TRAVEL, { duration, easing });
  }, [x, easing, duration, play]);

  return (
    <node style={lane}>
      <text style={laneLabel}>{name}</text>
      <node style={track}>
        <Animated.node
          style={{ ...dot, backgroundColor: color }}
          animatedStyle={{ translateX: x }}
        />
      </node>
    </node>
  );
}

const lane: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
};

const laneLabel: BevyStyle = {
  width: 76,
  color: Colors.textColor200,
  fontSize: FontSizes.xs,
  textAlign: "right",
};

const track: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  width: TRAVEL + DOT,
  height: DOT + 6,
  backgroundColor: Colors.surface100,
  borderRadius: 6,
};

const dot: BevyStyle = {
  width: DOT,
  height: DOT,
  borderRadius: 6,
};
