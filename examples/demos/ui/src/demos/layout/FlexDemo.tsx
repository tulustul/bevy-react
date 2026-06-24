import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Radio, RadioOption } from "../../components";
import { Colors } from "../../theme";

// `<node>` is a flexbox container by default. These snippets show the main flex
// knobs; see Layout → Grid for `display: "grid"`.

const COLORS = [
  Colors.primary100,
  Colors.green100,
  Colors.red100,
  Colors.yellow100,
];

type FlexDirection = Required<BevyStyle>["flexDirection"];
type JustifyContent = Required<BevyStyle>["justifyContent"];
type AlignItems = Required<BevyStyle>["alignItems"];

const DIRECTION_OPTIONS: RadioOption<FlexDirection>[] = [
  { label: "row", value: "row" },
  { label: "column", value: "column" },
];

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

function Swatches({ count = 4 }: { count?: number }) {
  return (
    <>
      {COLORS.slice(0, count).map((c) => (
        <node key={c} style={{ ...swatch, backgroundColor: c }} />
      ))}
    </>
  );
}

// An interactive container: flip the three main flex knobs and watch the swatches
// rearrange live.
function FlexPlayground() {
  const [flexDirection, setFlexDirection] = useState<FlexDirection>("row");
  const [justifyContent, setJustifyContent] =
    useState<JustifyContent>("center");
  const [alignItems, setAlignItems] = useState<AlignItems>("center");

  return (
    <node style={{ flexDirection: "column", gap: 12, alignItems: "center" }}>
      <node
        style={{ ...playground, flexDirection, justifyContent, alignItems }}
      >
        <Swatches />
      </node>

      <Radio
        options={DIRECTION_OPTIONS}
        value={flexDirection}
        onChange={setFlexDirection}
      />
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
    </node>
  );
}

export function FlexDemo() {
  return (
    <>
      <Example
        description="Flip the three main flex knobs live and watch the swatches rearrange."
        typescript={`<node style={{
  flexDirection,
  justifyContent,
  alignItems
}}>`}
      >
        <FlexPlayground />
      </Example>

      <Example
        description="flexWrap pushes overflowing children onto the next line."
        typescript={`<node style={{ flexWrap: "wrap", gap: 8 }}>`}
      >
        <node style={{ ...frame, width: 152, flexWrap: "wrap", gap: 8 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <node
              key={i}
              style={{ ...swatch, backgroundColor: COLORS[i % COLORS.length] }}
            />
          ))}
        </node>
      </Example>

      <Example
        description="flexGrow lets a child absorb the remaining space."
        typescript={`<node style={{ flexGrow: 1 }}>`}
      >
        <node style={{ ...frame, width: 260, gap: 8 }}>
          <node style={{ ...swatch, backgroundColor: COLORS[0] }} />
          <node style={{ ...grow, backgroundColor: COLORS[1] }} />
          <node style={{ ...swatch, backgroundColor: COLORS[2] }} />
        </node>
      </Example>
    </>
  );
}

const playground: BevyStyle = {
  width: 320,
  height: 160,
  gap: 10,
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const frame: BevyStyle = {
  alignItems: "center",
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const swatch: BevyStyle = {
  width: 40,
  height: 40,
  borderRadius: 8,
};

const grow: BevyStyle = {
  flexGrow: 1,
  height: 40,
  borderRadius: 8,
};
