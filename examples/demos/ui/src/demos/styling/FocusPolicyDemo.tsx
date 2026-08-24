import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Checkbox, Example } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "./shared";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Focus policy",
  info: (
    <>
      <P>
        <InlineCode>focusPolicy</InlineCode> decides whether a node captures
        pointer interaction or lets it fall through. By default a node{" "}
        <B>passes</B>: clicks on it also reach whatever is painted below, while
        the node still reacts to its own clicks too. Set{" "}
        <InlineCode>focusPolicy: "block"</InlineCode> and the node{" "}
        <B>captures</B> the click, so nothing underneath receives it.
      </P>
      <Code lang="tsx">{`<node style={{ focusPolicy: pass ? "pass" : "block" }} />`}</Code>
    </>
  ),
};

export function FocusPolicyDemo() {
  useDemoPage(PAGE);
  return (
    <Example
      title="Pass vs block"
      info={
        <>
          <P>
            A front box overlaps a clickable back box. With the default{" "}
            <InlineCode>"pass"</InlineCode>, overlap clicks fall through the
            front box to the back box (both counters advance); with{" "}
            <InlineCode>"block"</InlineCode> the front box captures the click
            and the back box no longer receives it.
          </P>
          <Code lang="tsx">{`<node
  style={{ focusPolicy: pass ? "pass" : "block" }}
  onClick={() => setFrontHits((n) => n + 1)}
/>`}</Code>
        </>
      }
      demo={FocusPolicyCard}
    />
  );
}

function FocusPolicyCard() {
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
