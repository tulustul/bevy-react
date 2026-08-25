import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Transforms",
  info: (
    <>
      <P>
        The <InlineCode>transform</InlineCode> style applies a 2D transform —{" "}
        <InlineCode>translateX/translateY</InlineCode>,{" "}
        <InlineCode>scale</InlineCode>, <InlineCode>rotate</InlineCode> — after
        layout, at render time: siblings never move. Bare numbers are px for
        translate and degrees for rotate; strings carry units, including{" "}
        <InlineCode>%</InlineCode> translations relative to the node's own size.
      </P>
      <Code lang="tsx">{`<node
  style={{
    transform: { translateX: 16, scale: 1.2, rotate: 45 },
    transition: { transform: { duration: 250 } },
  }}
/>`}</Code>
      <P>
        Transforms ease with{" "}
        <InlineCode>{"transition: { transform }"}</InlineCode> and never trigger
        a relayout.
      </P>
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
          <P>
            <InlineCode>translateX/translateY</InlineCode> shift a node after
            layout, without moving siblings — the stage box stays put while the
            square slides over it.
          </P>
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
    <node style={controlColumn}>
      <node style={stage}>
        <node style={{ ...box, transform: { translateX: x, translateY: y } }} />
      </node>
      <Slider
        value={x}
        min={-60}
        max={60}
        onChange={setX}
        label={`translateX ${x.toFixed(0)}`}
      />
      <Slider
        value={y}
        min={-40}
        max={40}
        onChange={setY}
        label={`translateY ${y.toFixed(0)}`}
      />
    </node>
  );
}

function PercentTranslateDemo() {
  return (
    <Example
      title="Percentage translation"
      info={
        <>
          <P>
            translate also takes responsive units:{" "}
            <InlineCode>translateX: "50%"</InlineCode> shifts a node by half its
            own width, regardless of pixel size — and the percent value eases
            with a transition like any other.
          </P>
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
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.amber100,
            transform: { translateX: on ? "50%" : "0%" },
            transition: { transform: { duration: 250, easing: "easeOut" } },
          }}
        />
      </node>
      <Button onClick={() => setOn((v) => !v)}>
        {`translateX ${on ? '"50%"' : '"0%"'}`}
      </Button>
    </node>
  );
}

function ScaleDemo() {
  return (
    <Example
      title="Scaling"
      info={
        <>
          <P>
            <InlineCode>scale</InlineCode> grows or shrinks a node around its
            center. Layout is untouched — neighbors keep their positions.
          </P>
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
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.green100,
            transform: { scale: s },
          }}
        />
      </node>
      <Slider
        value={s}
        min={0.3}
        max={1.8}
        onChange={setS}
        label={`scale ${s.toFixed(2)}`}
      />
    </node>
  );
}

function RotateDemo() {
  return (
    <Example
      title="Rotation"
      info={
        <>
          <P>
            <InlineCode>rotate</InlineCode> spins a node around its center. Bare
            numbers are degrees; a unit string like{" "}
            <InlineCode>"0.25turn"</InlineCode> works too.
          </P>
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
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.purple100,
            transform: { rotate: r },
          }}
        />
      </node>
      <Slider
        value={r}
        min={0}
        max={360}
        onChange={setR}
        label={`rotate ${r.toFixed(0)}°`}
      />
    </node>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 200,
  height: 140,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};
