import { useEffect } from "react";
import {
  Animated,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  interpolateColor,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const GROW_MS = 900;

const TYPESCRIPT = `const t = useSharedValue(0);
t.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
// Any continuous style value is animatable now — not just transform/opacity.
<Animated.node
  animatedStyle={{
    width: interpolate(t, [0, 1], [88, 200]),
    height: interpolate(t, [0, 1], [88, 120]),
    borderColor: interpolateColor(t, [0, 1], ["#3b82f6", "#ec4899"]),
  }}
/>`;

const PAGE: ExplanationData = {
  title: "Layout & Color",
  description:
    "A single shared value (withRepeat + withTiming, ping-pong) drives layout — width/height, which re-flow the surrounding row — and borderColor via interpolate / interpolateColor. Any continuous style value is animatable, not just transform and opacity; width/height write the Node only when they change, so layout isn't thrashed once the value settles.",
  tsx: TYPESCRIPT,
};

export function LayoutAnimationDemo() {
  useDemoPage(PAGE);
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: GROW_MS, easing: "easeInOut" }),
      -1,
      true, // ping-pong
    );
  }, [t]);

  return (
    <Example>
      <node style={stageStyle}>
        <Animated.node
          style={boxStyle}
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

const stageStyle: BevyStyle = {
  width: 260,
  height: 160,
  justifyContent: "center",
  alignItems: "center",
};

const boxStyle: BevyStyle = {
  width: 88,
  height: 88,
  border: 4,
  borderRadius: 16,
  borderColor: Colors.sky100,
  backgroundColor: Colors.primary100,
};
