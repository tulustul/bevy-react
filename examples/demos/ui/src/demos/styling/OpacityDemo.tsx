import { useState } from "react";
import { Checkbox, Example, Slider } from "@/components";
import { Colors } from "@/theme";
import { box, controlColumn, row } from "./shared";

export function OpacityDemo() {
  return (
    <>
      <Example
        description="opacity fades a node and its children together. Drag to fade."
        tsx={`<node style={{ opacity: 0.4 }} />`}
      >
        <OpacityControl />
      </Example>

      <Example
        description="display: none removes a node from layout entirely."
        tsx={`<node style={{ display: "none" }} />`}
      >
        <DisplayControl />
      </Example>
    </>
  );
}

function OpacityControl() {
  const [opacity, setOpacity] = useState(0.4);
  return (
    <node style={controlColumn}>
      <node style={{ ...box, opacity }} />
      <Slider
        value={opacity}
        min={0}
        max={1}
        onChange={setOpacity}
        label={`opacity ${opacity.toFixed(2)}`}
      />
    </node>
  );
}

function DisplayControl() {
  const [hidden, setHidden] = useState(false);
  return (
    <node style={controlColumn}>
      <node style={row}>
        <node style={box} />
        <node
          style={{
            ...box,
            backgroundColor: Colors.green100,
            display: hidden ? "none" : "flex",
          }}
        />
        <node style={{ ...box, backgroundColor: Colors.purple100 }} />
      </node>
      <Checkbox label="Hide middle box" enabled={hidden} onChange={setHidden} />
    </node>
  );
}
