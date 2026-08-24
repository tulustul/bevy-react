import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Radio, RadioOption } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Z-index",
  info: (
    <>
      <P>
        <InlineCode>zIndex</InlineCode> reorders a node among its{" "}
        <B>siblings</B> — it is local to the parent's stacking context, so a
        nested node can never out-stack an unrelated subtree with it.
      </P>
      <Code lang="tsx">{`<node style={{ zIndex: 2 }} />

// escape the local stacking context entirely:
<node style={{ globalZIndex: 99 }} />`}</Code>
      <P>
        <InlineCode>globalZIndex</InlineCode> instead lifts the node into the
        UI's top-level stack — the tool for popovers and overlays that must
        render in front of everything.
      </P>
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
          <P>
            <InlineCode>zIndex</InlineCode> reorders a node among its{" "}
            <B>siblings</B>. Both chips share one parent, so it decides which is
            painted on top.
          </P>
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
          <P>
            A popover nested in the back card overhangs the front card.{" "}
            <InlineCode>zIndex</InlineCode> only sorts it within its own card,
            so it stays buried — <InlineCode>globalZIndex</InlineCode> lifts it
            into the UI's top-level stack and out in front.
          </P>
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
    <node style={controlColumn}>
      <node style={cardRow}>
        {/* Back card (painted first) — owns the overhanging popover. */}
        <node style={{ ...card, backgroundColor: Colors.primary100 }}>
          <text style={cardLabel}>back</text>
          <node style={{ ...popover, ...popoverZ }}>
            <text style={popoverLabel}>popover</text>
          </node>
        </node>
        {/* Front card (painted second) — covers anything below it in the stack. */}
        <node style={{ ...card, backgroundColor: Colors.red100 }}>
          <text style={cardLabel}>front</text>
        </node>
      </node>
      <Radio options={MODE_OPTIONS} value={mode} onChange={setMode} />
      <text style={caption}>{HINTS[mode]}</text>
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

const cardRow: BevyStyle = {
  flexDirection: "row",
  overflowX: "visible",
  overflowY: "visible",
  padding: 14,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
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

const cardLabel: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xs,
  fontWeight: "bold",
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

const popoverLabel: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xs,
  fontWeight: "bold",
};
