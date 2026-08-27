import { useState } from "react";
import { InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import {
  Box,
  Button,
  ControlColumn,
  DemoRow,
  Example,
  Slider,
  Stage,
} from "@/components";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";

const PAGE: ExplanationData = {
  title: "Transforms",
  info: (
    <>
      <Paragraph>
        The <InlineCode>transform</InlineCode> style applies a 2D transform —{" "}
        <InlineCode>translateX/translateY</InlineCode>,{" "}
        <InlineCode>scale</InlineCode>, <InlineCode>rotate</InlineCode> — after
        layout, at render time: siblings never move. Bare numbers are px for
        translate and degrees for rotate; strings carry units, including{" "}
        <InlineCode>%</InlineCode> translations relative to the node's own size.
      </Paragraph>
      <Code lang="tsx">{`<node
  style={{
    transform: { translateX: 16, scale: 1.2, rotate: 45 },
    transition: { transform: { duration: 250 } },
  }}
/>`}</Code>
      <Paragraph>
        Transforms ease with{" "}
        <InlineCode>{"transition: { transform }"}</InlineCode> and never trigger
        a relayout.
      </Paragraph>
    </>
  ),
};

export function TransformDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <TranslateDemo />
        <PercentTranslateDemo />
      </DemoRow>
      <DemoRow>
        <ScaleDemo />
        <RotateDemo />
      </DemoRow>
    </>
  );
}

function TranslateDemo() {
  return (
    <Example
      title="Translation"
      info={
        <>
          <Paragraph>
            <InlineCode>translateX/translateY</InlineCode> shift a node after
            layout, without moving siblings — the stage box stays put while the
            square slides over it.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ transform: { translateX: 16, translateY: 0 } }} />`}</Code>
        </>
      }
      demo={TranslateCard}
    />
  );
}

function TranslateCard() {
  const [x, setX] = useState(16);
  const [y, setY] = useState(0);
  return (
    <ControlColumn>
      <Stage style={stage}>
        <Box style={{ transform: { translateX: x, translateY: y } }} />
      </Stage>
      <Slider value={x} min={-60} max={60} onChange={setX} name="translateX" />
      <Slider value={y} min={-40} max={40} onChange={setY} name="translateY" />
    </ControlColumn>
  );
}

function PercentTranslateDemo() {
  return (
    <Example
      title="Percentage translation"
      info={
        <>
          <Paragraph>
            translate also takes responsive units:{" "}
            <InlineCode>translateX: "50%"</InlineCode> shifts a node by half its
            own width, regardless of pixel size — and the percent value eases
            with a transition like any other.
          </Paragraph>
          <Code lang="tsx">{`<node
  style={{
    transform: { translateX: on ? "50%" : "0%" },
    transition: { transform: { duration: 250, easing: "easeOut" } },
  }}
/>`}</Code>
        </>
      }
      demo={PercentTranslateCard}
    />
  );
}

function PercentTranslateCard() {
  const [on, setOn] = useState(false);
  return (
    <ControlColumn>
      <Stage style={stage}>
        <Box
          style={{
            backgroundColor: Colors.amber100,
            transform: { translateX: on ? "50%" : "0%" },
            transition: { transform: { duration: 250, easing: "easeOut" } },
          }}
        />
      </Stage>
      <Button onClick={() => setOn((v) => !v)}>
        {`translateX ${on ? '"50%"' : '"0%"'}`}
      </Button>
    </ControlColumn>
  );
}

function ScaleDemo() {
  return (
    <Example
      title="Scaling"
      info={
        <>
          <Paragraph>
            <InlineCode>scale</InlineCode> grows or shrinks a node around its
            center. Layout is untouched — neighbors keep their positions.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ transform: { scale: 0.7 } }} />`}</Code>
        </>
      }
      demo={ScaleCard}
    />
  );
}

function ScaleCard() {
  const [s, setS] = useState(1);
  return (
    <ControlColumn>
      <Stage style={stage}>
        <Box
          style={{ backgroundColor: Colors.green100, transform: { scale: s } }}
        />
      </Stage>
      <Slider value={s} min={0.3} max={1.8} onChange={setS} name="scale" />
    </ControlColumn>
  );
}

function RotateDemo() {
  return (
    <Example
      title="Rotation"
      info={
        <>
          <Paragraph>
            <InlineCode>rotate</InlineCode> spins a node around its center. Bare
            numbers are degrees; a unit string like{" "}
            <InlineCode>"0.25turn"</InlineCode> works too.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ transform: { rotate: 45 } }} />`}</Code>
        </>
      }
      demo={RotateCard}
    />
  );
}

function RotateCard() {
  const [r, setR] = useState(45);
  return (
    <ControlColumn>
      <Stage style={stage}>
        <Box
          style={{
            backgroundColor: Colors.purple100,
            transform: { rotate: r },
          }}
        />
      </Stage>
      <Slider
        value={r}
        min={0}
        max={360}
        onChange={setR}
        name="rotate"
        unit="°"
      />
    </ControlColumn>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 200,
  height: 140,
};
