import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { controlColumn } from "./shared";

const PAGE: ExplanationData = {
  title: "Sizing",
  info: (
    <>
      <P>
        <InlineCode>width</InlineCode> / <InlineCode>height</InlineCode> size a
        node in pixels, percentages of the parent, or viewport units;{" "}
        <InlineCode>auto</InlineCode> (the default) sizes from content and flex.
      </P>
      <Code lang="tsx">{`<node style={{ width: "60%" }} />
<node style={{ height: 50, aspectRatio: 1.6 }} />
<node style={{ width: "100%", maxWidth: 160 }} />`}</Code>
      <P>
        <InlineCode>aspectRatio</InlineCode> derives the missing dimension from
        the given one, and <InlineCode>minWidth</InlineCode> /{" "}
        <InlineCode>maxWidth</InlineCode> (plus their height twins) clamp an
        otherwise flexible size.
      </P>
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
      title="width"
      info={
        <>
          <P>
            <InlineCode>width</InlineCode> / <InlineCode>height</InlineCode>{" "}
            take pixels, percentages, or viewport units. Here the bar's width is
            a percentage of its track.
          </P>
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
    <node style={controlColumn}>
      <node style={track}>
        <node style={{ ...bar, width: `${Math.round(w)}%` }} />
      </node>
      <Slider
        value={w}
        min={10}
        max={100}
        onChange={setW}
        label={`width ${w.toFixed(0)}%`}
      />
    </node>
  );
}

function AspectRatioDemo() {
  return (
    <Example
      title="aspectRatio"
      info={
        <>
          <P>
            <InlineCode>aspectRatio</InlineCode> derives the missing dimension
            from the given one — the height stays fixed while the width follows
            the ratio.
          </P>
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
    <node style={controlColumn}>
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
        label={`aspectRatio ${ar.toFixed(2)}`}
      />
    </node>
  );
}

function MaxWidthDemo() {
  return (
    <Example
      title="maxWidth"
      info={
        <>
          <P>
            <InlineCode>minWidth</InlineCode> /{" "}
            <InlineCode>maxWidth</InlineCode> clamp an otherwise flexible size:
            the bar asks for the full track but never grows past the cap.
          </P>
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
    <node style={controlColumn}>
      <node style={track}>
        <node
          style={{
            ...bar,
            width: "100%",
            maxWidth: max,
            backgroundColor: Colors.yellow100,
          }}
        />
      </node>
      <Slider
        value={max}
        min={40}
        max={240}
        onChange={setMax}
        label={`maxWidth ${max.toFixed(0)}`}
      />
    </node>
  );
}

const track: BevyStyle = {
  flexDirection: "column",
  width: 240,
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const bar: BevyStyle = {
  height: 26,
  borderRadius: 6,
  backgroundColor: Colors.primary100,
};
