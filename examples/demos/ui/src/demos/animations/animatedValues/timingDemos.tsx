import { useEffect, useRef, useState } from "react";
import {
  EasingName,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  interpolateColor,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Example, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { column, playButton, playLabel } from "../shared";
import { Colors, FontSizes } from "@/theme";

// The withTiming-driven cards: an endless opacity ping-pong, the four easing
// curves raced side by side, and a layout/color loop through interpolate.

const FADE_MS = 500;

const FADE_TSX = `const opacity = useSharedValue(1);
opacity.value = withRepeat(
  withTiming(0, { duration: 500, easing: "easeInOut" }),
  { reverse: true }, // ping-pong back to 1
);

<node style={{ opacity: { animated: opacity } }} />`;

export function FadeDemo() {
  return (
    <Example
      title="Fades"
      info={
        <>
          <P>
            A shared value drives the style's {"{ animated }"} binding
            imperatively: <InlineCode>withTiming</InlineCode> eases opacity to
            0, and <InlineCode>withRepeat</InlineCode> with{" "}
            <InlineCode>{"{ reverse: true }"}</InlineCode> loops it forever,
            ping-ponging back to 1. The animation runs on the Bevy side — React
            renders once and never re-renders per frame.
          </P>
          <Code lang="tsx">{FADE_TSX}</Code>
        </>
      }
      demo={FadeCard}
    />
  );
}

function FadeCard() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: FADE_MS, easing: "easeInOut" }),
      { reverse: true }, // ping-pong back to 1
    );
  }, [opacity]);

  return (
    <node style={fadeStageStyle}>
      <node style={{ ...fadeSquareStyle, opacity: { animated: opacity } }} />
    </node>
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

const EASING_TSX = `const x = useSharedValue(0);
x.value = 0; // rewind, then race
x.value = withTiming(200, { duration: 800, easing: "easeInOut" });

<node style={{ transform: { translateX: { animated: x } } }} />`;

export function EasingDemo() {
  return (
    <Example
      title="Easing"
      info={
        <>
          <P>
            The four <InlineCode>withTiming</InlineCode> easing curves (
            <InlineCode>linear</InlineCode>, <InlineCode>easeIn</InlineCode>,{" "}
            <InlineCode>easeOut</InlineCode>, <InlineCode>easeInOut</InlineCode>
            ) raced side by side over the same distance and duration, so their
            acceleration profiles are easy to compare. Press Race to restart the
            race; the slider changes the shared duration.
          </P>
          <Code lang="tsx">{EASING_TSX}</Code>
        </>
      }
      demo={EasingCard}
    />
  );
}

function EasingCard() {
  const [duration, setDuration] = useState(800);
  const [play, setPlay] = useState(0);

  return (
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
      <Button
        unstyled
        style={playButton}
        labelStyle={playLabel}
        onClick={() => setPlay((n) => n + 1)}
      >
        Race
      </Button>
    </node>
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
        <node
          style={{
            ...dot,
            backgroundColor: color,
            transform: { translateX: { animated: x } },
          }}
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
t.value = withRepeat(withTiming(1, { duration: 900 }), {
  reverse: true, // ping-pong
});

// Any continuous style value is animatable — bindings ride the
// style itself.
<node
  style={{
    width: { animated: interpolate(t, [0, 1], [88, 200]) },
    height: { animated: interpolate(t, [0, 1], [88, 120]) },
    borderColor: {
      animated: interpolateColor(t, [0, 1], ["#3b82f6", "#ec4899"]),
    },
  }}
/>`;

export function LayoutColorDemo() {
  return (
    <Example
      title="Layout and color"
      info={
        <>
          <P>
            A single shared value (<InlineCode>withRepeat</InlineCode> +{" "}
            <InlineCode>withTiming</InlineCode>, ping-pong) drives layout —
            width/height, which re-flow the surrounding row — and borderColor
            via <InlineCode>interpolate</InlineCode> /{" "}
            <InlineCode>interpolateColor</InlineCode>. Any continuous style
            value is animatable, not just transform and opacity; width/height
            write the Node only when they change, so layout isn't thrashed once
            the value settles.
          </P>
          <Code lang="tsx">{LAYOUT_TSX}</Code>
        </>
      }
      demo={LayoutColorCard}
    />
  );
}

function LayoutColorCard() {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: GROW_MS, easing: "easeInOut" }),
      { reverse: true }, // ping-pong
    );
  }, [t]);

  return (
    <node style={layoutStageStyle}>
      <node
        style={{
          ...layoutBoxStyle,
          width: { animated: interpolate(t, [0, 1], [88, 200]) },
          height: { animated: interpolate(t, [0, 1], [88, 120]) },
          borderColor: {
            animated: interpolateColor(
              t,
              [0, 1],
              [Colors.sky100, Colors.purple100],
            ),
          },
        }}
      />
    </node>
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
