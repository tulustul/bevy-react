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
import { Colors, Fonts, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Focus policy",
  info: (
    <>
      <Paragraph>
        <InlineCode>focusPolicy</InlineCode> decides whether a node stops the
        pointer from reaching what lies beneath it. By default a node{" "}
        <Bold>passes</Bold>: the nodes below are hovered too, and a click on a
        node with no handler of its own falls through to the topmost handler
        beneath. Set <InlineCode>focusPolicy: "block"</InlineCode> and the node{" "}
        <Bold>hides</Bold> everything underneath from the pointer. Either way
        one click fires one handler — the topmost.
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
            A handler-less front box overlaps a clickable back box. With the
            default <InlineCode>"pass"</InlineCode>, the overlap still hovers
            the back box and clicks there fall through to it; with{" "}
            <InlineCode>"block"</InlineCode> the front box hides it — no hover,
            no clicks.
          </Paragraph>
          <Code lang="tsx">{`<node
  onClick={() => setHits((n) => n + 1)}
/>
<node
  style={{
    focusPolicy: pass ? "pass" : "block",
  }}
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

  return (
    <ControlColumn>
      <Stage style={stage}>
        {/* Back box (painted first, below the front box) — clickable, and
            lit while hovered, so pass-through hover shows too. */}
        <node
          style={backBox}
          hoverStyle={{ backgroundColor: Colors.cyanBright }}
          onClick={() => setBackHits((n) => n + 1)}
        >
          <BoxLabel>back</BoxLabel>
          <text style={hitLabel}>{backHits} hits</text>
        </node>
        {/* Front box (painted second) — overhangs the back box with no click
            handler of its own: one click fires the topmost handler, so a
            front `onClick` would win the overlap under either policy. */}
        <node
          style={{ ...frontBox, focusPolicy: pass ? "pass" : "block" }}
          hoverStyle={{ backgroundColor: ROSE_LIT }}
        >
          <BoxLabel>front</BoxLabel>
        </node>
      </Stage>
      <Checkbox
        label='front focusPolicy: "pass" (click-through)'
        enabled={pass}
        onChange={setPass}
      />
      <Caption>
        {pass
          ? "front passes — the overlap hovers and clicks the back box"
          : "front blocks — the overlap never reaches the back box"}
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
  backgroundColor: Colors.cyan,
};

const frontBox: BevyStyle = {
  ...baseBox,
  left: 86,
  top: 18,
  backgroundColor: Colors.rose,
};

/** The front box under the pointer: its rose, lifted toward white (the step
 *  `cyanBright` takes over `cyan`). */
const ROSE_LIT = "#ff8fa3";

// A counter readout, so the mono face.
const hitLabel: BevyStyle = {
  color: Colors.ink,
  fontFamily: Fonts.mono,
  fontSize: FontSizes.xs,
};
