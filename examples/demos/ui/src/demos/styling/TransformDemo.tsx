import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Example, Slider } from "@/components";
import { Colors } from "@/theme";
import { box, controlColumn } from "./shared";

export function TransformDemo() {
  return (
    <>
      <Example
        description="translate shifts a node after layout, without moving siblings."
        tsx={`transform: { translateX: 16, translateY: 0 }`}
      >
        <TranslateControl />
      </Example>

      <Example
        description="translate also takes responsive units — translateX '50%' shifts a node by half its own width, regardless of pixel size (and eases with a transition)."
        tsx={`transform: { translateX: on ? "50%" : "0%" }`}
      >
        <PercentTranslateControl />
      </Example>

      <Example
        description="scale grows or shrinks a node around its center."
        tsx={`transform: { scale: 0.7 }`}
      >
        <ScaleControl />
      </Example>

      <Example
        description="rotate spins a node around its center (degrees, or a unit string like '0.25turn')."
        tsx={`transform: { rotate: 45 }`}
      >
        <RotateControl />
      </Example>
    </>
  );
}

function TranslateControl() {
  const [x, setX] = useState(16);
  const [y, setY] = useState(0);
  return (
    <node style={controlColumn}>
      <node style={stage}>
        <node style={{ ...box, transform: { translateX: x, translateY: y } }} />
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
  );
}

function PercentTranslateControl() {
  const [on, setOn] = useState(false);
  return (
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
  );
}

function ScaleControl() {
  const [s, setS] = useState(1);
  return (
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
  );
}

function RotateControl() {
  const [r, setR] = useState(45);
  return (
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
