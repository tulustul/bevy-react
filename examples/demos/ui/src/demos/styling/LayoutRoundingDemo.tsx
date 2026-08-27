import { useState } from "react";
import { InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Column, DemoRow, Example, Stage } from "@/components";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors, FontSizes } from "@/theme";

// Layout rounding: bevy snaps every laid-out rect to whole physical pixels,
// per node, inherited (`LayoutConfig::use_rounding`). `layoutRounding: false`
// opts a subtree out so real-layout size animations glide instead of hopping.

const PAGE: ExplanationData = {
  title: "Layout rounding",
  info: (
    <>
      <Paragraph>
        Layout rounds every node's rect to whole physical pixels: crisp edges,
        sharp text, no seams between neighbours. It also means a box whose size
        is animated through layout grows in 1px steps, and everything laid out
        around it hops along, even when its position is sub-pixel smooth.{" "}
        <InlineCode>layoutRounding: false</InlineCode> turns the rounding off
        for a node and its descendants (unset inherits, the root default is{" "}
        <InlineCode>true</InlineCode>).
      </Paragraph>
      <Code lang="tsx">{`<node style={{ layoutRounding: false }}>
  <node
    style={{
      height: open ? 120 : 40,
      transition: {
        size: { duration: 3000 },
      },
    }}
  />
  <text>re-flows smoothly</text>
</node>`}</Code>
      <Paragraph>
        It inherits downward only, so set it on the parent that lays out the
        animated node and its neighbours, and keep it that local: inside an
        unrounded subtree, whatever rests on a half pixel gets anti-aliased soft
        edges, slightly blurred text and hairline seams.
      </Paragraph>
    </>
  ),
};

export function LayoutRoundingDemo() {
  useDemoPage(PAGE);

  return (
    <DemoRow>
      <ComparisonDemo />
    </DemoRow>
  );
}

function ComparisonDemo() {
  return (
    <Example
      title="Rounded vs unrounded"
      info={
        <>
          <Paragraph>
            Two identical panels; the right one sets{" "}
            <InlineCode>layoutRounding: false</InlineCode>. Toggle the size ease
            (3 seconds, so the steps are easy to see): on the left the box grows
            in whole pixels and the caption and the block below hop with it, on
            the right they all glide.
          </Paragraph>
          <Code lang="tsx">{`// on the PARENT that lays out the
// animated box and its neighbours
<node style={{ layoutRounding: false }}>
  <node
    style={{
      ...box,
      height: open ? 120 : 40,
      transition: {
        size: { duration: 3000 },
      },
    }}
  />
  <text>glides along</text>
  <node style={follow} />
</node>`}</Code>
        </>
      }
      demo={ComparisonCard}
    />
  );
}

function ComparisonCard() {
  const [open, setOpen] = useState(false);
  return (
    <Column>
      <node style={panels}>
        <Panel title="rounded" open={open} />
        <Panel
          title="unrounded"
          open={open}
          style={{ layoutRounding: false }}
        />
      </node>
      <Button onClick={() => setOpen((v) => !v)}>Toggle size</Button>
    </Column>
  );
}

function Panel({
  title,
  open,
  style,
}: {
  title: string;
  open: boolean;
  style?: BevyStyle;
}) {
  return (
    <Stage style={{ ...panel, ...style }}>
      <node style={{ ...growBox, height: open ? 120 : 40 }} />
      <text style={label}>{title}</text>
      <node style={followBox} />
    </Stage>
  );
}

const panels: BevyStyle = {
  flexDirection: "row",
  gap: 16,
};

// Even width, centred content: any odd-sized child rests on a half pixel.
const panel: BevyStyle = {
  width: 140,
  height: 220,
  gap: 10,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const growBox: BevyStyle = {
  width: 72,
  borderRadius: 6,
  backgroundColor: Colors.primary100,
  transition: { size: { duration: 3000, easing: "easeInOut" } },
};

const followBox: BevyStyle = {
  width: 72,
  height: 24,
  borderRadius: 6,
  backgroundColor: Colors.green100,
};

const label: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.sm,
};
