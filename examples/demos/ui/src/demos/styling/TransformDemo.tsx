import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { Colors } from "@/theme";
import { box, controlColumn } from "./shared";

export function TransformDemo() {
  return (
    <>
      <Example
        description="translate shifts a node after layout, without moving siblings."
        typescript={`transform: { translateX: 16, translateY: 0 }`}
      >
        <TranslateControl />
      </Example>

      <Example
        description="scale grows or shrinks a node around its center."
        typescript={`transform: { scale: 0.7 }`}
      >
        <ScaleControl />
      </Example>

      <Example
        description="rotate spins a node, in radians, around its center."
        typescript={`transform: { rotate: 0.4 }`}
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
  const [r, setR] = useState(0.4);
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
        max={Math.PI * 2}
        onChange={setR}
        label={`rotate ${r.toFixed(2)}`}
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
