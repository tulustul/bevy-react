import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Checkbox, Example, Radio, RadioOption, Slider } from "@/components";
import { Colors } from "@/theme";
import { box, controlColumn, row } from "./shared";

export function OpacityDemo() {
  return (
    <>
      <Example
        description="opacity fades a node and its children together. Drag to fade."
        typescript={`<node style={{ opacity: 0.4 }} />`}
      >
        <OpacityControl />
      </Example>

      <Example
        description="zIndex controls paint order when nodes overlap."
        typescript={`<node style={{ zIndex: 2 }} />`}
      >
        <ZIndexControl />
      </Example>

      <Example
        description="display: none removes a node from layout entirely."
        typescript={`<node style={{ display: "none" }} />`}
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

type Front = "blue" | "red";
const FRONT_OPTIONS: RadioOption<Front>[] = [
  { label: "blue front", value: "blue" },
  { label: "red front", value: "red" },
];

function ZIndexControl() {
  const [front, setFront] = useState<Front>("red");
  return (
    <node style={controlColumn}>
      <node style={overlapStage}>
        <node
          style={{
            ...chip,
            left: 18,
            top: 14,
            backgroundColor: Colors.primary100,
            zIndex: front === "blue" ? 2 : 1,
          }}
        />
        <node
          style={{
            ...chip,
            left: 50,
            top: 30,
            backgroundColor: Colors.red100,
            zIndex: front === "red" ? 2 : 1,
          }}
        />
      </node>
      <Radio options={FRONT_OPTIONS} value={front} onChange={setFront} />
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

const overlapStage: BevyStyle = {
  positionType: "relative",
  width: 150,
  height: 96,
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const chip: BevyStyle = {
  positionType: "absolute",
  width: 60,
  height: 60,
  borderRadius: 10,
};
