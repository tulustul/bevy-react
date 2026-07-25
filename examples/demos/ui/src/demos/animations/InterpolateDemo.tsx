import { useState } from "react";
import { interpolate, interpolateColor, useSharedValue } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Slider } from "@/components";
import { column } from "./shared";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// One shared value, many outputs: interpolate / interpolateColor map it onto
// inline { animated } style bindings each frame in Bevy. The sliders set the
// value directly (no driver), but the same bindings work under any driver.

const PAGE: ExplanationData = {
  title: "Interpolation",
  description: `interpolate and interpolateColor map a shared value through a
piecewise-linear curve onto any continuous style binding, evaluated each frame
on the Bevy side. The input/output arrays can hold any number of matching
stops, and the value clamps outside the input range. Here the sliders set the
shared value directly — no driver — but the same bindings ride withTiming,
withSpring, or any other driver unchanged. Click a card for details.`,
  tsx: `style={{
  transform: { scale: { animated:
    interpolate(t, [0, 1], [0.6, 1.4]),
  } },
  backgroundColor: { animated:
    interpolateColor(t, [0, 1],
      ["#7aa2f7", "#f7768e"]),
  },
}}`,
};

export function InterpolateDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <ScaleColorDemo />
      <MultiStopDemo />
      <ClampedWindowsDemo />
    </DemoRow>
  );
}

const SCALE_COLOR_TSX = `style={{
  transform: { scale: { animated:
    interpolate(t, [0, 1], [0.6, 1.4]),
  } },
  backgroundColor: { animated:
    interpolateColor(t, [0, 1],
      ["#7aa2f7", "#f7768e"]),
  },
}}`;

function ScaleColorDemo() {
  const t = useSharedValue(0);
  const [v, setV] = useState(0);

  const onChange = (n: number) => {
    setV(n);
    t.value = n; // immediate set — drives the bindings below
  };

  return (
    <Example
      title="Scale & color"
      description="One shared value, many outputs: the slider sets the value directly (no driver), and interpolate / interpolateColor map it onto scale and background color each frame on the Bevy side. Drag 0 to 1 and watch both bindings follow."
      tsx={SCALE_COLOR_TSX}
    >
      <node style={column}>
        <node style={scaleStage}>
          <node
            style={{
              ...scaleSquare,
              transform: {
                scale: { animated: interpolate(t, [0, 1], [0.6, 1.4]) },
              },
              backgroundColor: {
                animated: interpolateColor(
                  t,
                  [0, 1],
                  [Colors.primary100, Colors.red100],
                ),
              },
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

const scaleStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 200,
  height: 120,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const scaleSquare: BevyStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
  backgroundColor: Colors.primary100,
};

const MULTI_STOP_TSX = `style={{ transform: {
  translateX: { animated:
    interpolate(t, [0, 1], [-84, 84]),
  },
  translateY: { animated:
    interpolate(t,
      [0, 0.25, 0.5, 0.75, 1],
      [34, -34, 34, -34, 34]),
  },
} }}`;

function MultiStopDemo() {
  const t = useSharedValue(0);
  const [v, setV] = useState(0);

  const onChange = (n: number) => {
    setV(n);
    t.value = n;
  };

  return (
    <Example
      title="Multi-stop ranges"
      description="The input/output arrays take any number of matching stops, and each segment interpolates linearly between its pair. Here translateX maps the value across the stage in one straight segment while translateY zigzags through five stops — one value, a piecewise path."
      tsx={MULTI_STOP_TSX}
    >
      <node style={column}>
        <node style={zigStage}>
          <node
            style={{
              ...zigDot,
              transform: {
                translateX: { animated: interpolate(t, [0, 1], [-84, 84]) },
                translateY: {
                  animated: interpolate(
                    t,
                    [0, 0.25, 0.5, 0.75, 1],
                    [34, -34, 34, -34, 34],
                  ),
                },
              },
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

const zigStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 208,
  height: 110,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const zigDot: BevyStyle = {
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: Colors.green100,
};

const BAR_COLORS = [
  Colors.primary100,
  Colors.green100,
  Colors.yellow100,
  Colors.orange100,
  Colors.red100,
];

const CLAMPED_TSX = `// bar i only moves inside
// its own window of t
height: { animated:
  interpolate(t,
    [i * 0.16, i * 0.16 + 0.36],
    [10, 68]),
}`;

function ClampedWindowsDemo() {
  const t = useSharedValue(0);
  const [v, setV] = useState(0);

  const onChange = (n: number) => {
    setV(n);
    t.value = n;
  };

  return (
    <Example
      title="Clamped windows"
      description="interpolate clamps outside its input range, so each bar maps only its own slice of the same shared value and sits pinned at an endpoint the rest of the time. Drag slowly: one value in, a staggered cascade out."
      tsx={CLAMPED_TSX}
    >
      <node style={column}>
        <node style={barsStage}>
          {BAR_COLORS.map((color, i) => (
            <node
              key={i}
              style={{
                ...bar,
                backgroundColor: color,
                height: {
                  animated: interpolate(
                    t,
                    [i * 0.16, i * 0.16 + 0.36],
                    [10, 68],
                  ),
                },
              }}
            />
          ))}
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

const barsStage: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexEnd",
  justifyContent: "center",
  gap: 10,
  width: 180,
  height: 92,
  padding: { bottom: 12, top: 12, left: 12, right: 12 },
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const bar: BevyStyle = {
  width: 18,
  height: 10,
  borderRadius: 5,
};
