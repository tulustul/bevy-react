import { useState } from "react";
import { InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import { ControlColumn, DemoRow, Example, Slider, Stage } from "@/components";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";

const PAGE: ExplanationData = {
  title: "Sizing",
  info: (
    <>
      <Paragraph>
        <InlineCode>width</InlineCode> / <InlineCode>height</InlineCode> size a
        node in pixels, percentages of the parent, or viewport units;{" "}
        <InlineCode>auto</InlineCode> (the default) sizes from content and flex.
      </Paragraph>
      <Code lang="tsx">{`<node style={{ width: "60%" }} />
<node style={{ height: 50, aspectRatio: 1.6 }} />
<node style={{ width: "100%", maxWidth: 160 }} />`}</Code>
      <Paragraph>
        <InlineCode>aspectRatio</InlineCode> derives the missing dimension from
        the given one, and <InlineCode>minWidth</InlineCode> /{" "}
        <InlineCode>maxWidth</InlineCode> (plus their height twins) clamp an
        otherwise flexible size.
      </Paragraph>
    </>
  ),
};

export function SizingDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <WidthDemo />
      <AspectRatioDemo />
      <MaxWidthDemo />
    </DemoRow>
  );
}

function WidthDemo() {
  return (
    <Example
      title="Width and height"
      info={
        <>
          <Paragraph>
            <InlineCode>width</InlineCode> / <InlineCode>height</InlineCode>{" "}
            take pixels, percentages, or viewport units. Here the bar's width is
            a percentage of its track.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ width: "60%" }} />`}</Code>
        </>
      }
      demo={WidthCard}
    />
  );
}

function WidthCard() {
  const [w, setW] = useState(60);
  return (
    <ControlColumn>
      <Stage style={track}>
        <node style={{ ...bar, width: `${Math.round(w)}%` }} />
      </Stage>
      <Slider
        value={w}
        min={10}
        max={100}
        onChange={setW}
        name="width"
        unit="%"
      />
    </ControlColumn>
  );
}

function AspectRatioDemo() {
  return (
    <Example
      title="Aspect ratios"
      info={
        <>
          <Paragraph>
            <InlineCode>aspectRatio</InlineCode> derives the missing dimension
            from the given one — the height stays fixed while the width follows
            the ratio.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ height: 50, aspectRatio: 1.6 }} />`}</Code>
        </>
      }
      demo={AspectRatioCard}
    />
  );
}

function AspectRatioCard() {
  const [ar, setAr] = useState(1.6);
  return (
    <ControlColumn>
      <node
        style={{
          height: 50,
          aspectRatio: ar,
          borderRadius: 10,
          backgroundColor: Colors.red100,
        }}
      />
      <Slider
        value={ar}
        min={0.5}
        max={2.5}
        onChange={setAr}
        name="aspectRatio"
      />
    </ControlColumn>
  );
}

function MaxWidthDemo() {
  return (
    <Example
      title="Minimum and maximum sizes"
      info={
        <>
          <Paragraph>
            <InlineCode>minWidth</InlineCode> /{" "}
            <InlineCode>maxWidth</InlineCode> clamp an otherwise flexible size:
            the bar asks for the full track but never grows past the cap.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ width: "100%", maxWidth: 160 }} />`}</Code>
        </>
      }
      demo={MaxWidthCard}
    />
  );
}

function MaxWidthCard() {
  const [max, setMax] = useState(160);
  return (
    <ControlColumn>
      <Stage style={track}>
        <node
          style={{
            ...bar,
            width: "100%",
            maxWidth: max,
            backgroundColor: Colors.yellow100,
          }}
        />
      </Stage>
      <Slider
        value={max}
        min={40}
        max={240}
        onChange={setMax}
        name="maxWidth"
      />
    </ControlColumn>
  );
}

const track: BevyStyle = {
  flexDirection: "column",
  width: 240,
};

const bar: BevyStyle = {
  height: 26,
  borderRadius: 6,
  backgroundColor: Colors.primary100,
};
