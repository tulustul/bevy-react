import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "transform",
  description: `The transform style applies a 2D transform — translateX/
translateY, scale, rotate — after layout, at render time: siblings never
move. Bare numbers are px for translate and degrees for rotate; strings carry
units, including % translations relative to the node's own size. Transforms
ease with transition: { transform } and never trigger a relayout.`,
};

export function TransformDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <TranslateDemo />
        <PercentTranslateDemo />
      </DemoRow>
      <DemoRow>
        <ScaleDemo />
        <RotateDemo />
      </DemoRow>
    </>
  );
}

function TranslateDemo() {
  const [x, setX] = useState(16);
  const [y, setY] = useState(0);
  return (
    <Example
      title="translate"
      description="translate shifts a node after layout, without moving siblings."
      tsx={`transform: {
  translateX: 16,
  translateY: 0,
}`}
    >
      <node style={controlColumn}>
        <node style={stage}>
          <node
            style={{ ...box, transform: { translateX: x, translateY: y } }}
          />
        </node>
        <Slider
          value={x}
          min={-60}
          max={60}
          onChange={setX}
          label={`translateX ${x.toFixed(0)}`}
        />
        <Slider
          value={y}
          min={-40}
          max={40}
          onChange={setY}
          label={`translateY ${y.toFixed(0)}`}
        />
      </node>
    </Example>
  );
}

function PercentTranslateDemo() {
  const [on, setOn] = useState(false);
  return (
    <Example
      title="Percent translate"
      description="translate also takes responsive units — translateX '50%' shifts a node by half its own width, regardless of pixel size (and eases with a transition)."
      tsx={`transform: {
  translateX: on ? "50%" : "0%",
}`}
    >
      <node style={controlColumn}>
        <node style={stage}>
          <node
            style={{
              ...box,
              backgroundColor: Colors.amber100,
              transform: { translateX: on ? "50%" : "0%" },
              transition: { transform: { duration: 0.25, easing: "easeOut" } },
            }}
          />
        </node>
        <Button onClick={() => setOn((v) => !v)}>
          translateX {on ? '"50%"' : '"0%"'}
        </Button>
      </node>
    </Example>
  );
}

function ScaleDemo() {
  const [s, setS] = useState(1);
  return (
    <Example
      title="scale"
      description="scale grows or shrinks a node around its center."
      tsx={`transform: { scale: 0.7 }`}
    >
      <node style={controlColumn}>
        <node style={stage}>
          <node
            style={{
              ...box,
              backgroundColor: Colors.green100,
              transform: { scale: s },
            }}
          />
        </node>
        <Slider
          value={s}
          min={0.3}
          max={1.8}
          onChange={setS}
          label={`scale ${s.toFixed(2)}`}
        />
      </node>
    </Example>
  );
}

function RotateDemo() {
  const [r, setR] = useState(45);
  return (
    <Example
      title="rotate"
      description="rotate spins a node around its center (degrees, or a unit string like '0.25turn')."
      tsx={`transform: { rotate: 45 }`}
    >
      <node style={controlColumn}>
        <node style={stage}>
          <node
            style={{
              ...box,
              backgroundColor: Colors.purple100,
              transform: { rotate: r },
            }}
          />
        </node>
        <Slider
          value={r}
          min={0}
          max={360}
          onChange={setR}
          label={`rotate ${r.toFixed(0)}°`}
        />
      </node>
    </Example>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 200,
  height: 140,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};
