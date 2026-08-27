import { useState } from "react";
import { BoxLabel, InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle, Gradient } from "bevy-react/jsx";
import {
  DemoRow,
  Example,
  Radio,
  RadioOption,
  Slider,
  Stage,
} from "@/components";
import { Code } from "@/components/docs";
import { Gradients } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// `display: "grid"` opts a `<node>` into CSS-grid layout. Tracks accept the full
// CSS syntax: `repeat(n, …)`, fr units, fixed sizes, and `span`/line placement.

const PAGE: ExplanationData = {
  title: "Grid",
  info: (
    <>
      <Paragraph>
        <InlineCode>display: "grid"</InlineCode> opts a{" "}
        <InlineCode>{"<node>"}</InlineCode> into CSS-grid layout. Track lists (
        <InlineCode>gridTemplateColumns</InlineCode>,{" "}
        <InlineCode>gridTemplateRows</InlineCode>,{" "}
        <InlineCode>gridAutoRows</InlineCode>) accept the full CSS syntax:{" "}
        <InlineCode>repeat(n, …)</InlineCode>, fr units, and fixed sizes.
      </Paragraph>
      <Code lang="tsx">{`<node
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  }}
>
  {cells}
</node>`}</Code>
      <Paragraph>
        Children place themselves with <InlineCode>gridColumn</InlineCode>/
        <InlineCode>gridRow</InlineCode>, including{" "}
        <InlineCode>"span n"</InlineCode> and explicit line placement;{" "}
        <InlineCode>gap</InlineCode> spaces the tracks.
      </Paragraph>
    </>
  ),
};

const CELLS = Gradients.spectrum;

function Cells({ count, from = 0 }: { count: number; from?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Cell
          key={i}
          label={i + from + 1}
          gradient={CELLS[(i + from) % CELLS.length]}
        />
      ))}
    </>
  );
}

function Cell({
  label,
  gradient,
}: {
  label: number | string;
  gradient: Gradient;
}) {
  return (
    <node style={{ ...cell, backgroundGradient: gradient }}>
      <BoxLabel>{label}</BoxLabel>
    </node>
  );
}

const COLS_OPTIONS: RadioOption<number>[] = [
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
];

export function GridDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <GridPlaygroundDemo />
        <MixedTracksDemo />
      </DemoRow>

      <DemoRow>
        <ColumnSpanDemo />
        <RowSpanDemo />
      </DemoRow>
    </>
  );
}

function GridPlaygroundDemo() {
  return (
    <Example
      title="Repeat and fractions"
      info={
        <>
          <Paragraph>
            <InlineCode>repeat(n, 1fr)</InlineCode> makes n equal, flexible
            columns — the cells re-flow instantly as the track list or gap
            changes from state.
          </Paragraph>
          <Code lang="tsx">{`<node
  style={{
    display: "grid",
    gridTemplateColumns: \`repeat(\${cols}, 1fr)\`,
    gap,
  }}
>`}</Code>
        </>
      }
      demo={GridPlaygroundCard}
    />
  );
}

function GridPlaygroundCard() {
  const [cols, setCols] = useState(3);
  const [gap, setGap] = useState(8);
  return (
    <node style={controlColumn}>
      <Stage
        style={{ ...frame, gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}
      >
        <Cells count={cols * 2} />
      </Stage>
      <Radio options={COLS_OPTIONS} value={cols} onChange={setCols} />
      <Slider value={gap} min={0} max={20} onChange={setGap} name="gap" />
    </node>
  );
}

function MixedTracksDemo() {
  return (
    <Example
      title="Mixed tracks"
      info={
        <>
          <Paragraph>
            Track lists mix freely: a fixed 80px sidebar column next to a
            flexible <InlineCode>1fr</InlineCode> body column — the classic app
            shell in one line.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ display: "grid", gridTemplateColumns: "80px 1fr" }}>`}</Code>
        </>
      }
      demo={MixedTracksCard}
    />
  );
}

function MixedTracksCard() {
  return (
    <Stage style={{ ...frame, gridTemplateColumns: "80px 1fr" }}>
      <Cells count={4} />
    </Stage>
  );
}

function ColumnSpanDemo() {
  return (
    <Example
      title="Column spans"
      info={
        <>
          <Paragraph>
            <InlineCode>gridColumn: "span 2"</InlineCode> makes a cell straddle
            two columns; the remaining cells auto-place around it.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ gridColumn: "span 2" }}>
  <text>span 2</text>
</node>`}</Code>
        </>
      }
      demo={ColumnSpanCard}
    />
  );
}

function ColumnSpanCard() {
  return (
    <Stage style={{ ...frame, gridTemplateColumns: "repeat(3, 1fr)" }}>
      <node
        style={{
          ...cell,
          gridColumn: "span 2",
          backgroundGradient: CELLS[0],
        }}
      >
        <BoxLabel>span 2</BoxLabel>
      </node>
      <Cells count={4} from={1} />
    </Stage>
  );
}

function RowSpanDemo() {
  return (
    <Example
      title="Row spans"
      info={
        <>
          <Paragraph>
            <InlineCode>gridRow: "span 2"</InlineCode> with explicit row tracks
            builds a feature cell that stands two rows tall.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ gridTemplateRows: "repeat(2, 48px)" }}>
  <node style={{ gridRow: "span 2" }} />
</node>`}</Code>
        </>
      }
      demo={RowSpanCard}
    />
  );
}

function RowSpanCard() {
  return (
    <Stage
      style={{
        ...frame,
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(2, 48px)",
      }}
    >
      <node
        style={{ ...cell, gridRow: "span 2", backgroundGradient: CELLS[0] }}
      >
        <BoxLabel>tall</BoxLabel>
      </node>
      <Cells count={4} from={1} />
    </Stage>
  );
}

const controlColumn: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
};

const frame: BevyStyle = {
  display: "grid",
  width: 280,
  gap: 8,
  gridAutoRows: "48px",
};

const cell: BevyStyle = {
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
};
