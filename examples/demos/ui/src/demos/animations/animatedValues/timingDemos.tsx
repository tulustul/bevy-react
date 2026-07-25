import { useEffect, useRef, useState } from "react";
import {
  Animated,
  EasingName,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  interpolateColor,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { column, playButton, playLabel } from "../shared";
import { Colors, FontSizes } from "@/theme";

// The withTiming-driven cards: an endless opacity ping-pong, the four easing
// curves raced side by side, and a layout/color loop through interpolate.

const FADE_MS = 500;

const FADE_TSX = `const opacity = useSharedValue(1);
opacity.value = withRepeat(
  withTiming(0, { duration: 500 }),
  -1, true, // ping-pong
);
<Animated.node
  animatedStyle={{ opacity }}
/>`;

export function FadeDemo() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: FADE_MS, easing: "easeInOut" }),
      -1,
      true, // ping-pong back to 1
    );
  }, [opacity]);

  return (
    <Example
      title="Fade"
      description="A shared value drives animatedStyle imperatively: withTiming eases opacity to 0, and withRepeat(-1, true) loops it forever, ping-ponging back to 1. The animation runs on the Bevy side — React renders once and never re-renders per frame."
      tsx={FADE_TSX}
    >
      <node style={fadeStageStyle}>
        <Animated.node style={fadeSquareStyle} animatedStyle={{ opacity }} />
      </node>
    </Example>
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
  backgroundColor: Colors.primary100,
};

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

const EASING_TSX = `x.value = withTiming(200, {
  duration: 800,
  easing: "easeInOut",
});`;

export function EasingDemo() {
  const [duration, setDuration] = useState(800);
  const [play, setPlay] = useState(0);

  return (
    <Example
      title="Easing"
      description="The four withTiming easing curves (linear, easeIn, easeOut, easeInOut) raced side by side over the same distance and duration, so their acceleration profiles are easy to compare. Press Race to restart the race; the slider changes the shared duration."
      tsx={EASING_TSX}
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
          <text style={playLabel}>Race</text>
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

// A single shared value driving layout (width/height) and borderColor.

const GROW_MS = 900;

const LAYOUT_TSX = `const t = useSharedValue(0);
t.value = withRepeat(
  withTiming(1, { duration: 900 }),
  -1, true,
);
// Any continuous style value is
// animatable now — not just
// transform/opacity.
<Animated.node
  animatedStyle={{
    width: interpolate(
      t, [0, 1], [88, 200],
    ),
    height: interpolate(
      t, [0, 1], [88, 120],
    ),
    borderColor: interpolateColor(
      t, [0, 1],
      ["#3b82f6", "#ec4899"],
    ),
  }}
/>`;

export function LayoutColorDemo() {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: GROW_MS, easing: "easeInOut" }),
      -1,
      true, // ping-pong
    );
  }, [t]);

  return (
    <Example
      title="Layout & Color"
      description="A single shared value (withRepeat + withTiming, ping-pong) drives layout — width/height, which re-flow the surrounding row — and borderColor via interpolate / interpolateColor. Any continuous style value is animatable, not just transform and opacity; width/height write the Node only when they change, so layout isn't thrashed once the value settles."
      tsx={LAYOUT_TSX}
    >
      <node style={layoutStageStyle}>
        <Animated.node
          style={layoutBoxStyle}
          animatedStyle={{
            width: interpolate(t, [0, 1], [88, 200]),
            height: interpolate(t, [0, 1], [88, 120]),
            borderColor: interpolateColor(
              t,
              [0, 1],
              [Colors.sky100, Colors.purple100],
            ),
          }}
        />
      </node>
    </Example>
  );
}

const layoutStageStyle: BevyStyle = {
  width: 260,
  height: 160,
  justifyContent: "center",
  alignItems: "center",
};

const layoutBoxStyle: BevyStyle = {
  width: 88,
  height: 88,
  border: 4,
  borderRadius: 16,
  borderColor: Colors.sky100,
  backgroundColor: Colors.primary100,
};
