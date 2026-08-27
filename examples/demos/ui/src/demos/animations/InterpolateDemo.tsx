import { useState } from "react";
import { InlineCode, Paragraph } from "@/components/typography";
import { interpolate, interpolateColor, useSharedValue } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Column, DemoRow, Example, Slider, Stage } from "@/components";
import { Code } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// One shared value, many outputs: interpolate / interpolateColor map it onto
// inline { animated } style bindings each frame in Bevy. The sliders set the
// value directly (no driver), but the same bindings work under any driver.

const PAGE: ExplanationData = {
  title: "Interpolation",
  info: (
    <>
      <Paragraph>
        <InlineCode>interpolate</InlineCode> and{" "}
        <InlineCode>interpolateColor</InlineCode> map a shared value through a
        piecewise-linear curve onto any continuous style binding, evaluated each
        frame on the Bevy side. The input/output arrays can hold any number of
        matching stops, and the value clamps outside the input range.
      </Paragraph>
      <Code lang="tsx">{`style={{
  transform: {
    scale: { animated: interpolate(t, [0, 1], [0.6, 1.4]) },
  },
  backgroundColor: {
    animated: interpolateColor(t, [0, 1], ["#7aa2f7", "#f7768e"]),
  },
}}`}</Code>
      <Paragraph>
        Here the sliders set the shared value directly — no driver — but the
        same bindings ride <InlineCode>withTiming</InlineCode>,{" "}
        <InlineCode>withSpring</InlineCode>, or any other driver unchanged.
        Click a card for details.
      </Paragraph>
    </>
  ),
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

const SCALE_COLOR_TSX = `const t = useSharedValue(0);

<node
  style={{
    transform: {
      scale: { animated: interpolate(t, [0, 1], [0.6, 1.4]) },
    },
    backgroundColor: {
      animated: interpolateColor(t, [0, 1], ["#7aa2f7", "#f7768e"]),
    },
  }}
/>;

// the slider writes the value directly — no driver
t.value = n;`;

function ScaleColorDemo() {
  return (
    <Example
      title="Scale and color"
      info={
        <>
          <Paragraph>
            One shared value, many outputs: the slider sets the value directly
            (no driver), and <InlineCode>interpolate</InlineCode> /{" "}
            <InlineCode>interpolateColor</InlineCode> map it onto scale and
            background color each frame on the Bevy side. Drag 0 to 1 and watch
            both bindings follow.
          </Paragraph>
          <Code lang="tsx">{SCALE_COLOR_TSX}</Code>
        </>
      }
      demo={ScaleColorCard}
    />
  );
}

function ScaleColorCard() {
  const t = useSharedValue(0);
  const [v, setV] = useState(0);

  const onChange = (n: number) => {
    setV(n);
    t.value = n; // immediate set — drives the bindings below
  };

  return (
    <Column style={{ gap: 16 }}>
      <Stage style={scaleStage}>
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
      </Stage>
      <Slider value={v} min={0} max={1} onChange={onChange} name="t" />
    </Column>
  );
}

const scaleStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 200,
  height: 120,
};

const scaleSquare: BevyStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
  backgroundColor: Colors.primary100,
};

const MULTI_STOP_TSX = `style={{
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
}}`;

function MultiStopDemo() {
  return (
    <Example
      title="Multi-stop ranges"
      info={
        <>
          <Paragraph>
            The input/output arrays take any number of matching stops, and each
            segment interpolates linearly between its pair. Here{" "}
            <InlineCode>translateX</InlineCode> maps the value across the stage
            in one straight segment while <InlineCode>translateY</InlineCode>{" "}
            zigzags through five stops — one value, a piecewise path.
          </Paragraph>
          <Code lang="tsx">{MULTI_STOP_TSX}</Code>
        </>
      }
      demo={MultiStopCard}
    />
  );
}

function MultiStopCard() {
  const t = useSharedValue(0);
  const [v, setV] = useState(0);

  const onChange = (n: number) => {
    setV(n);
    t.value = n;
  };

  return (
    <Column style={{ gap: 16 }}>
      <Stage style={zigStage}>
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
      </Stage>
      <Slider value={v} min={0} max={1} onChange={onChange} name="t" />
    </Column>
  );
}

const zigStage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 208,
  height: 110,
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

const CLAMPED_TSX = `// bar i only moves inside its own window of t
height: {
  animated: interpolate(t, [i * 0.16, i * 0.16 + 0.36], [10, 68]),
}`;

function ClampedWindowsDemo() {
  return (
    <Example
      title="Clamped windows"
      info={
        <>
          <Paragraph>
            <InlineCode>interpolate</InlineCode> clamps outside its input range,
            so each bar maps only its own slice of the same shared value and
            sits pinned at an endpoint the rest of the time. Drag slowly: one
            value in, a staggered cascade out.
          </Paragraph>
          <Code lang="tsx">{CLAMPED_TSX}</Code>
        </>
      }
      demo={ClampedWindowsCard}
    />
  );
}

function ClampedWindowsCard() {
  const t = useSharedValue(0);
  const [v, setV] = useState(0);

  const onChange = (n: number) => {
    setV(n);
    t.value = n;
  };

  return (
    <Column style={{ gap: 16 }}>
      <Stage style={barsStage}>
        {BAR_COLORS.map((color, i) => (
          <node
            key={i}
            style={{
              ...bar,
              backgroundColor: color,
              height: {
                animated: interpolate(t, [i * 0.16, i * 0.16 + 0.36], [10, 68]),
              },
            }}
          />
        ))}
      </Stage>
      <Slider value={v} min={0} max={1} onChange={onChange} name="t" />
    </Column>
  );
}

const barsStage: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexEnd",
  justifyContent: "center",
  gap: 10,
  width: 180,
  height: 92,
};

const bar: BevyStyle = {
  width: 18,
  height: 10,
  borderRadius: 5,
};
