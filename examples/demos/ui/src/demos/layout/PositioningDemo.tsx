import { useState } from "react";
import { BoxLabel, InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import {
  ControlColumn,
  DemoRow,
  Example,
  Radio,
  RadioOption,
  Slider,
  Stage,
} from "@/components";
import { Code } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Positioning",
  info: (
    <>
      <Paragraph>
        <InlineCode>positionType</InlineCode> decides whether a node takes part
        in its parent's flex or grid layout; <InlineCode>left</InlineCode>,{" "}
        <InlineCode>right</InlineCode>, <InlineCode>top</InlineCode> and{" "}
        <InlineCode>bottom</InlineCode> offset it.
      </Paragraph>
      <Code lang="tsx">{`<node
  style={{
    positionType: "absolute",
    top: 8,
    right: 8,
  }}
/>`}</Code>
      <Paragraph>
        A <InlineCode>"relative"</InlineCode> node (the default) is nudged from
        its laid-out spot; an <InlineCode>"absolute"</InlineCode> node leaves
        the flow and is placed against its direct parent's padding box.
      </Paragraph>
    </>
  ),
};

export function PositioningDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <OutOfFlowDemo />
        <RelativeDemo />
      </DemoRow>
      <DemoRow>
        <CornerDemo />
        <StretchDemo />
      </DemoRow>
    </>
  );
}

type Position = "relative" | "absolute";

const POSITION_OPTIONS: RadioOption<Position>[] = [
  { label: "relative", value: "relative" },
  { label: "absolute", value: "absolute" },
];

function OutOfFlowDemo() {
  return (
    <Example
      title="Out of the flow"
      info={
        <>
          <Paragraph>
            An absolute node takes up no space: its siblings close the gap as if
            it weren't there, and the insets place it against the parent.
          </Paragraph>
          <Code lang="tsx">{`<node
  style={{
    positionType: "absolute",
    right: 0,
    bottom: 0,
  }}
/>`}</Code>
        </>
      }
      demo={OutOfFlowCard}
    />
  );
}

function OutOfFlowCard() {
  const [position, setPosition] = useState<Position>("absolute");
  return (
    <ControlColumn>
      <Stage style={row}>
        <Cell label="1" color={Colors.cyan} />
        <node
          style={{
            ...cell,
            positionType: position,
            right: 0,
            bottom: 0,
            backgroundColor: Colors.rose,
          }}
        >
          <BoxLabel>2</BoxLabel>
        </node>
        <Cell label="3" color={Colors.amber} />
      </Stage>
      <Radio
        options={POSITION_OPTIONS}
        value={position}
        onChange={setPosition}
      />
    </ControlColumn>
  );
}

function RelativeDemo() {
  return (
    <Example
      title="Relative offsets"
      info={
        <>
          <Paragraph>
            A relative node is laid out in the flow, then moved by its insets.
            Siblings keep their places as if it hadn't moved.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ left: 20, top: -10 }} />`}</Code>
        </>
      }
      demo={RelativeCard}
    />
  );
}

function RelativeCard() {
  const [left, setLeft] = useState(20);
  const [top, setTop] = useState(-10);
  return (
    <ControlColumn>
      <Stage style={row}>
        <Cell label="1" color={Colors.cyan} />
        <node
          style={{
            ...cell,
            left: Math.round(left),
            top: Math.round(top),
            backgroundColor: Colors.rose,
          }}
        >
          <BoxLabel>2</BoxLabel>
        </node>
        <Cell label="3" color={Colors.amber} />
      </Stage>
      <Slider
        value={left}
        min={-40}
        max={40}
        onChange={setLeft}
        name="left"
        unit="px"
      />
      <Slider
        value={top}
        min={-30}
        max={30}
        onChange={setTop}
        name="top"
        unit="px"
      />
    </ControlColumn>
  );
}

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

const CORNER_OPTIONS: RadioOption<Corner>[] = [
  { label: "↖", value: "topLeft" },
  { label: "↗", value: "topRight" },
  { label: "↙", value: "bottomLeft" },
  { label: "↘", value: "bottomRight" },
];

function CornerDemo() {
  return (
    <Example
      title="Corner badges"
      info={
        <>
          <Paragraph>
            One inset per axis pins an absolute node to a corner. The insets are
            measured from the parent's padding box, inside its border.
          </Paragraph>
          <Code lang="tsx">{`<node
  style={{
    positionType: "absolute",
    top: 8,
    right: 8,
  }}
/>`}</Code>
        </>
      }
      demo={CornerCard}
    />
  );
}

function CornerCard() {
  const [corner, setCorner] = useState<Corner>("topRight");
  const [inset, setInset] = useState(8);
  const n = Math.round(inset);
  const vertical = corner.startsWith("top") ? { top: n } : { bottom: n };
  const horizontal = corner.endsWith("Left") ? { left: n } : { right: n };
  return (
    <ControlColumn>
      <Stage style={box}>
        <node style={{ ...badge, ...vertical, ...horizontal }} />
      </Stage>
      <Radio options={CORNER_OPTIONS} value={corner} onChange={setCorner} />
      <Slider
        value={inset}
        min={0}
        max={40}
        onChange={setInset}
        name="inset"
        unit="px"
      />
    </ControlColumn>
  );
}

function StretchDemo() {
  return (
    <Example
      title="Stretching overlays"
      info={
        <>
          <Paragraph>
            Insets on opposite sides with no size on that axis stretch the node
            between them; all four at <InlineCode>0</InlineCode> cover the
            parent.
          </Paragraph>
          <Code lang="tsx">{`<node
  style={{
    positionType: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }}
/>`}</Code>
        </>
      }
      demo={StretchCard}
    />
  );
}

function StretchCard() {
  const [inset, setInset] = useState(16);
  const n = Math.round(inset);
  return (
    <ControlColumn>
      <Stage style={box}>
        <node
          style={{
            positionType: "absolute",
            left: n,
            right: n,
            top: n,
            bottom: n,
            borderRadius: 8,
            backgroundColor: Colors.violet,
          }}
        />
      </Stage>
      <Slider
        value={inset}
        min={0}
        max={50}
        onChange={setInset}
        name="inset"
        unit="px"
      />
    </ControlColumn>
  );
}

function Cell({ label, color }: { label: string; color: string }) {
  return (
    <node style={{ ...cell, backgroundColor: color }}>
      <BoxLabel>{label}</BoxLabel>
    </node>
  );
}

const row: BevyStyle = {
  width: 240,
  height: 100,
  gap: 8,
  alignItems: "center",
};

const cell: BevyStyle = {
  width: 48,
  height: 48,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
};

const box: BevyStyle = {
  width: 240,
  height: 140,
};

const badge: BevyStyle = {
  positionType: "absolute",
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: Colors.rose,
};
