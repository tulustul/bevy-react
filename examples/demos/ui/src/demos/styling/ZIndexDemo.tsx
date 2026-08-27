import { useState } from "react";
import {
  Bold,
  BoxLabel,
  Caption,
  InlineCode,
  Paragraph,
} from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import {
  ControlColumn,
  DemoRow,
  Example,
  Radio,
  RadioOption,
  Stage,
} from "@/components";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";

const PAGE: ExplanationData = {
  title: "Z-index",
  info: (
    <>
      <Paragraph>
        <InlineCode>zIndex</InlineCode> reorders a node among its{" "}
        <Bold>siblings</Bold> — it is local to the parent's stacking context, so
        a nested node can never out-stack an unrelated subtree with it.
      </Paragraph>
      <Code lang="tsx">{`<node style={{ zIndex: 2 }} />

// escape the local stacking context entirely:
<node style={{ globalZIndex: 99 }} />`}</Code>
      <Paragraph>
        <InlineCode>globalZIndex</InlineCode> instead lifts the node into the
        UI's top-level stack — the tool for popovers and overlays that must
        render in front of everything.
      </Paragraph>
    </>
  ),
};

export function ZIndexDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <LocalZIndexDemo />
      <GlobalZIndexDemo />
    </DemoRow>
  );
}

// --- Local zIndex: swap which of two overlapping siblings is on top ----------

type Front = "blue" | "red";
const FRONT_OPTIONS: RadioOption<Front>[] = [
  { label: "blue front", value: "blue" },
  { label: "red front", value: "red" },
];

function LocalZIndexDemo() {
  return (
    <Example
      title="Local stacking order"
      info={
        <>
          <Paragraph>
            <InlineCode>zIndex</InlineCode> reorders a node among its{" "}
            <Bold>siblings</Bold>. Both chips share one parent, so it decides
            which is painted on top.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ zIndex: front === "blue" ? 2 : 1 }} />
<node style={{ zIndex: front === "red" ? 2 : 1 }} />`}</Code>
        </>
      }
      demo={LocalZIndexCard}
    />
  );
}

function LocalZIndexCard() {
  const [front, setFront] = useState<Front>("red");
  return (
    <ControlColumn>
      <Stage style={overlapStage}>
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
      </Stage>
      <Radio options={FRONT_OPTIONS} value={front} onChange={setFront} />
    </ControlColumn>
  );
}

// --- Global zIndex: escape the parent stacking context -----------------------

type Mode = "none" | "zIndex" | "globalZIndex";
const MODE_OPTIONS: RadioOption<Mode>[] = [
  { label: "none", value: "none" },
  { label: "zIndex: 99", value: "zIndex" },
  { label: "globalZIndex: 99", value: "globalZIndex" },
];

const HINTS: Record<Mode, string> = {
  none: "no z — front card covers the popover",
  zIndex: "zIndex: 99 — still buried (local to the back card)",
  globalZIndex: "globalZIndex: 99 — popover jumps in front",
};

function GlobalZIndexDemo() {
  return (
    <Example
      title="Global stacking order"
      info={
        <>
          <Paragraph>
            A popover nested in the back card overhangs the front card.{" "}
            <InlineCode>zIndex</InlineCode> only sorts it within its own card,
            so it stays buried — <InlineCode>globalZIndex</InlineCode> lifts it
            into the UI's top-level stack and out in front.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ /* back card */ }}>
  <node style={{ globalZIndex: 99 }}>popover</node>
</node>
<node style={{ /* front card, painted second */ }} />`}</Code>
        </>
      }
      demo={GlobalZIndexCard}
    />
  );
}

function GlobalZIndexCard() {
  const [mode, setMode] = useState<Mode>("globalZIndex");
  const popoverZ: BevyStyle =
    mode === "zIndex"
      ? { zIndex: 99 }
      : mode === "globalZIndex"
        ? { globalZIndex: 99 }
        : {};
  return (
    <ControlColumn>
      <Stage style={cardRow}>
        {/* Back card (painted first) — owns the overhanging popover. */}
        <node style={{ ...card, backgroundColor: Colors.primary100 }}>
          <BoxLabel>back</BoxLabel>
          <node style={{ ...popover, ...popoverZ }}>
            <BoxLabel>popover</BoxLabel>
          </node>
        </node>
        {/* Front card (painted second) — covers anything below it in the stack. */}
        <node style={{ ...card, backgroundColor: Colors.red100 }}>
          <BoxLabel>front</BoxLabel>
        </node>
      </Stage>
      <Radio options={MODE_OPTIONS} value={mode} onChange={setMode} />
      <Caption>{HINTS[mode]}</Caption>
    </ControlColumn>
  );
}

const overlapStage: BevyStyle = {
  positionType: "relative",
  width: 150,
  height: 96,
};

const chip: BevyStyle = {
  positionType: "absolute",
  width: 60,
  height: 60,
  borderRadius: 10,
};

const cardRow: BevyStyle = {
  flexDirection: "row",
  overflowX: "visible",
  overflowY: "visible",
};

const card: BevyStyle = {
  positionType: "relative",
  width: 100,
  height: 110,
  borderRadius: 10,
  overflowX: "visible",
  overflowY: "visible",
  padding: 8,
};

const popover: BevyStyle = {
  positionType: "absolute",
  left: 70,
  top: 55,
  width: 90,
  height: 56,
  borderRadius: 8,
  backgroundColor: Colors.amber100,
  alignItems: "center",
  justifyContent: "center",
};
