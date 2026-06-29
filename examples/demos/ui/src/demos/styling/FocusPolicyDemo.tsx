import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Checkbox, Example } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "./shared";

export function FocusPolicyDemo() {
  return (
    <Example
      description="A front box overlaps a clickable back box. By default a node PASSES pointer interaction through, so overlap clicks fall through the front box to the back box (the front box still reacts to its own clicks too). Set focusPolicy: 'block' and the front box CAPTURES the click, so the back box no longer receives it."
      tsx={`<node style={{ focusPolicy: pass ? "pass" : "block" }} />`}
    >
      <FocusPolicyControl />
    </Example>
  );
}

function FocusPolicyControl() {
  const [pass, setPass] = useState(true);
  const [backHits, setBackHits] = useState(0);
  const [frontHits, setFrontHits] = useState(0);

  return (
    <node style={controlColumn}>
      <node style={stage}>
        {/* Back box (painted first, below the front box) — clickable. */}
        <node style={{ ...backBox }} onClick={() => setBackHits((n) => n + 1)}>
          <text style={boxLabel}>back</text>
          <text style={hitLabel}>{backHits} hits</text>
        </node>
        {/* Front box (painted second) — overhangs the back box. Its
            focusPolicy decides whether clicks in the overlap stop here. */}
        <node
          style={{ ...frontBox, focusPolicy: pass ? "pass" : "block" }}
          hoverStyle={{ backgroundColor: Colors.red200 }}
          onClick={() => setFrontHits((n) => n + 1)}
        >
          <text style={boxLabel}>front</text>
          <text style={hitLabel}>{frontHits} hits</text>
        </node>
      </node>
      <Checkbox
        label='front focusPolicy: "pass" (click-through)'
        enabled={pass}
        onChange={setPass}
      />
      <text style={caption}>
        {pass
          ? "front passes — overlap clicks reach the back box"
          : "front blocks — overlap clicks stop at the front box"}
      </text>
    </node>
  );
}

const stage: BevyStyle = {
  positionType: "relative",
  width: 220,
  height: 120,
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
  overflowX: "visible",
  overflowY: "visible",
};

const baseBox: BevyStyle = {
  positionType: "absolute",
  flexDirection: "column",
  width: 120,
  height: 84,
  borderRadius: 10,
  padding: 8,
  justifyContent: "spaceBetween",
};

const backBox: BevyStyle = {
  ...baseBox,
  left: 14,
  top: 18,
  backgroundColor: Colors.primary100,
};

const frontBox: BevyStyle = {
  ...baseBox,
  left: 86,
  top: 18,
  backgroundColor: Colors.red100,
};

const boxLabel: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xs,
  fontWeight: "bold",
};

const hitLabel: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xs,
};
