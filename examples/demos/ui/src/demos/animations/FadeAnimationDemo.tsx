import { useEffect } from "react";
import { Animated, useSharedValue, withRepeat, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const FADE_MS = 500;

const TYPESCRIPT = `const opacity = useSharedValue(1);
opacity.value = withRepeat(
  withTiming(0, { duration: 500 }),
  -1, true, // ping-pong
);
<Animated.node animatedStyle={{ opacity }} />`;

const PAGE: ExplanationData = {
  title: "Fade",
  description:
    "A shared value drives animatedStyle imperatively: withTiming eases opacity to 0, and withRepeat(-1, true) loops it forever, ping-ponging back to 1. The animation runs on the Bevy side — React renders once and never re-renders per frame.",
  tsx: TYPESCRIPT,
};

export function FadeAnimationDemo() {
  useDemoPage(PAGE);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: FADE_MS, easing: "easeInOut" }),
      -1,
      true, // ping-pong back to 1
    );
  }, [opacity]);

  return (
    <Example>
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
