import { useEffect } from "react";
import { Animated, useSharedValue, withRepeat, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

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
