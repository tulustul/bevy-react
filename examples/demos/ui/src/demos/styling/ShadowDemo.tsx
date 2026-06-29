import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { Colors } from "@/theme";
import { box, controlColumn } from "./shared";

export function ShadowDemo() {
  return (
    <>
      <Example
        description="boxShadow casts a soft drop shadow. Drag blur and spread."
        tsx={`boxShadow: {
  color: "#FFFFFF33",
  blurRadius: 12,
  spreadRadius: 3,
}`}
      >
        <BlurControl />
      </Example>

      <Example
        description="xOffset / yOffset push the shadow to imply a light direction."
        tsx={`boxShadow: {
  xOffset: 8,
  yOffset: 8,
  blurRadius: 6,
}`}
      >
        <OffsetControl />
      </Example>

      <Example
        description="An array of shadows stacks back-to-front — here a tight red drop plus a wide soft glow."
        tsx={`boxShadow: [
  { color: "#FF000066", yOffset: 4, blurRadius: 6 },
  { color: "#4F8CFF55", blurRadius: 28, spreadRadius: 6 },
]`}
      >
        <StackedShadow />
      </Example>
    </>
  );
}

function StackedShadow() {
  return (
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.surface100,
            boxShadow: [
              { color: "#FF000066", yOffset: 4, blurRadius: 6 },
              { color: "#4F8CFF55", blurRadius: 28, spreadRadius: 6 },
            ],
          }}
        />
      </node>
    </node>
  );
}

function BlurControl() {
  const [blur, setBlur] = useState(12);
  const [spread, setSpread] = useState(3);
  return (
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            boxShadow: {
              color: Colors.shadow200,
              blurRadius: blur,
              spreadRadius: spread,
            },
          }}
        />
      </node>
      <Slider
        value={blur}
        min={0}
        max={40}
        onChange={setBlur}
        label={`blurRadius ${blur.toFixed(0)}`}
      />
      <Slider
        value={spread}
        min={0}
        max={16}
        onChange={setSpread}
        label={`spreadRadius ${spread.toFixed(0)}`}
      />
    </node>
  );
}

function OffsetControl() {
  const [x, setX] = useState(8);
  const [y, setY] = useState(8);
  return (
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.red100,
            boxShadow: {
              color: Colors.shadow200,
              xOffset: x,
              yOffset: y,
              blurRadius: 6,
            },
          }}
        />
      </node>
      <Slider
        value={x}
        min={-24}
        max={24}
        onChange={setX}
        label={`xOffset ${x.toFixed(0)}`}
      />
      <Slider
        value={y}
        min={-24}
        max={24}
        onChange={setY}
        label={`yOffset ${y.toFixed(0)}`}
      />
    </node>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};
