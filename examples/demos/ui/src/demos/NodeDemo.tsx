import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { codeStyle, headingStyle, labelStyle } from "./styles";
import { Card, Radio, RadioOption } from "../components";

type FlexDirection = Required<BevyStyle>["flexDirection"];
type JustifyContent = Required<BevyStyle>["justifyContent"];
type AlignItems = Required<BevyStyle>["alignItems"];

const JUSTIFY_OPTIONS: RadioOption<JustifyContent>[] = [
  { label: "center", value: "center" },
  { label: "flexStart", value: "flexStart" },
  { label: "flexEnd", value: "flexEnd" },
  { label: "spaceBetween", value: "spaceBetween" },
];

const ALIGN_OPTIONS: RadioOption<AlignItems>[] = [
  { label: "center", value: "center" },
  { label: "flexStart", value: "flexStart" },
  { label: "flexEnd", value: "flexEnd" },
  { label: "stretch", value: "stretch" },
];

const DIRECTION_OPTIONS: RadioOption<FlexDirection>[] = [
  { label: "row", value: "row" },
  { label: "column", value: "column" },
];

const SWATCHES = ["#7aa2f7", "#9ece6a", "#f7768e", "#e0af68"];

export function NodeDemo() {
  const [justifyContent, setJustifyContent] =
    useState<JustifyContent>("center");
  const [alignItems, setAlignItems] = useState<AlignItems>("center");
  const [flexDirection, setFlexDirection] = useState<FlexDirection>("row");

  return (
    <Card>
      <text style={headingStyle}>Node</text>
      <text style={{ ...labelStyle, ...codeStyle }}>
        {"<node style={{ flexDirection, gap }} />"}
      </text>

      <node
        style={{
          ...containerStyle,
          flexDirection,
          justifyContent,
          alignItems,
        }}
      >
        {SWATCHES.map((color) => (
          <node
            key={color}
            style={{ ...swatchStyle, backgroundColor: color }}
          />
        ))}
      </node>

      <Radio
        options={JUSTIFY_OPTIONS}
        value={justifyContent}
        onChange={setJustifyContent}
      />
      <Radio
        options={ALIGN_OPTIONS}
        value={alignItems}
        onChange={setAlignItems}
      />
      <Radio
        options={DIRECTION_OPTIONS}
        value={flexDirection}
        onChange={setFlexDirection}
      />
    </Card>
  );
}

const containerStyle: BevyStyle = {
  width: 320,
  height: 160,
  gap: 10,
  padding: 12,
  alignItems: "center",
  backgroundColor: "#11111b",
  borderRadius: 12,
};

const swatchStyle: BevyStyle = {
  width: 48,
  height: 48,
  borderRadius: 8,
};
