import { useState } from "react";
import {
  Bold,
  BoxLabel,
  Caption,
  InlineCode,
  Paragraph,
} from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import { Checkbox, ControlColumn, Example, Stage } from "@/components";
import { Code } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Focus policy",
  info: (
    <>
      <Paragraph>
        <InlineCode>focusPolicy</InlineCode> decides whether a node captures
        pointer interaction or lets it fall through. By default a node{" "}
        <Bold>passes</Bold>: clicks on it also reach whatever is painted below,
        while the node still reacts to its own clicks too. Set{" "}
        <InlineCode>focusPolicy: "block"</InlineCode> and the node{" "}
        <Bold>captures</Bold> the click, so nothing underneath receives it.
      </Paragraph>
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
          <Paragraph>
            A front box overlaps a clickable back box. With the default{" "}
            <InlineCode>"pass"</InlineCode>, overlap clicks fall through the
            front box to the back box (both counters advance); with{" "}
            <InlineCode>"block"</InlineCode> the front box captures the click
            and the back box no longer receives it.
          </Paragraph>
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
    <ControlColumn>
      <Stage style={stage}>
        {/* Back box (painted first, below the front box) — clickable. */}
        <node style={{ ...backBox }} onClick={() => setBackHits((n) => n + 1)}>
          <BoxLabel>back</BoxLabel>
          <text style={hitLabel}>{backHits} hits</text>
        </node>
        {/* Front box (painted second) — overhangs the back box. Its
            focusPolicy decides whether clicks in the overlap stop here. */}
        <node
          style={{ ...frontBox, focusPolicy: pass ? "pass" : "block" }}
          hoverStyle={{ backgroundColor: Colors.red200 }}
          onClick={() => setFrontHits((n) => n + 1)}
        >
          <BoxLabel>front</BoxLabel>
          <text style={hitLabel}>{frontHits} hits</text>
        </node>
      </Stage>
      <Checkbox
        label='front focusPolicy: "pass" (click-through)'
        enabled={pass}
        onChange={setPass}
      />
      <Caption>
        {pass
          ? "front passes — overlap clicks reach the back box"
          : "front blocks — overlap clicks stop at the front box"}
      </Caption>
    </ControlColumn>
  );
}

const stage: BevyStyle = {
  positionType: "relative",
  width: 220,
  height: 120,
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

const hitLabel: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xs,
};
