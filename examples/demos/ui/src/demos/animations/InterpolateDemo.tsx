import { useState } from "react";
import {
  Animated,
  interpolate,
  interpolateColor,
  useSharedValue,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { column } from "./shared";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// One shared value, many outputs: a slider sets it directly, and interpolate /
// interpolateColor map it onto scale and background color each frame in Bevy.

const TYPESCRIPT = `animatedStyle={{
  scale: interpolate(t, [0, 1], [0.6, 1.4]),
  backgroundColor: interpolateColor(
    t, [0, 1], ["#7aa2f7", "#f7768e"],
  ),
}}`;

const PAGE: ExplanationData = {
  title: "Interpolate",
  description:
    "One shared value, many outputs: the slider sets the value directly (no driver), and interpolate / interpolateColor map it onto scale and background color each frame on the Bevy side. Drag 0 to 1 and watch both bindings follow.",
  tsx: TYPESCRIPT,
};

export function InterpolateDemo() {
  useDemoPage(PAGE);
  const t = useSharedValue(0);
  const [v, setV] = useState(0);

  const onChange = (n: number) => {
    setV(n);
    t.value = n; // immediate set — drives the bindings below
  };

  return (
    <Example>
      <node style={column}>
        <node style={stage}>
          <Animated.node
            style={square}
            animatedStyle={{
              scale: interpolate(t, [0, 1], [0.6, 1.4]),
              backgroundColor: interpolateColor(
                t,
                [0, 1],
                [Colors.primary100, Colors.red100],
              ),
            }}
          />
        </node>
        <Slider
          value={v}
          min={0}
          max={1}
          onChange={onChange}
          label={`t ${v.toFixed(2)}`}
        />
      </node>
    </Example>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 200,
  height: 120,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const square: BevyStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
  backgroundColor: Colors.primary100,
};
