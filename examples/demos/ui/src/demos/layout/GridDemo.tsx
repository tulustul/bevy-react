import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Radio, RadioOption, Slider } from "../../components";
import { Colors, FontSizes } from "../../theme";

// `display: "grid"` opts a `<node>` into CSS-grid layout. Tracks accept the full
// CSS syntax: `repeat(n, …)`, fr units, fixed sizes, and `span`/line placement.

const COLORS = [
  Colors.primary100,
  Colors.green100,
  Colors.red100,
  Colors.yellow100,
  Colors.purple100,
  Colors.sky100,
];

function Cells({ count, from = 0 }: { count: number; from?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Cell
          key={i}
          label={i + from + 1}
          color={COLORS[(i + from) % COLORS.length]}
        />
      ))}
    </>
  );
}

function Cell({ label, color }: { label: number | string; color: string }) {
  return (
    <node style={{ ...cell, backgroundColor: color }}>
      <text style={cellText}>{label}</text>
    </node>
  );
}

const COLS_OPTIONS: RadioOption<number>[] = [
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
];

function GridPlayground() {
  const [cols, setCols] = useState(3);
  const [gap, setGap] = useState(8);
  return (
    <node style={controlColumn}>
      <node
        style={{ ...frame, gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}
      >
        <Cells count={cols * 2} />
      </node>
      <Radio options={COLS_OPTIONS} value={cols} onChange={setCols} />
      <Slider
        value={gap}
        min={0}
        max={20}
        onChange={setGap}
        label={`gap ${gap.toFixed(0)}`}
      />
    </node>
  );
}

export function GridDemo() {
  return (
    <>
      <Example
        description="repeat(n, 1fr) makes n equal, flexible columns. Try the count and gap."
        typescript={`<node style={{
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
}}>`}
      >
        <GridPlayground />
      </Example>

      <Example
        description="Mixed tracks: a fixed sidebar and a flexible body column."
        typescript={`gridTemplateColumns: "80px 1fr"`}
      >
        <node style={{ ...frame, gridTemplateColumns: "80px 1fr" }}>
          <Cells count={4} />
        </node>
      </Example>

      <Example
        description="gridColumn: span 2 makes a cell straddle two columns."
        typescript={`<node style={{ gridColumn: "span 2" }}>`}
      >
        <node style={{ ...frame, gridTemplateColumns: "repeat(3, 1fr)" }}>
          <node
            style={{
              ...cell,
              gridColumn: "span 2",
              backgroundColor: COLORS[0],
            }}
          >
            <text style={cellText}>span 2</text>
          </node>
          <Cells count={4} from={1} />
        </node>
      </Example>

      <Example
        description="gridRow: span 2 with explicit rows builds a feature cell."
        typescript={`gridTemplateRows: "repeat(2, 48px)"
gridRow: "span 2"`}
      >
        <node
          style={{
            ...frame,
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 48px)",
          }}
        >
          <node
            style={{ ...cell, gridRow: "span 2", backgroundColor: COLORS[0] }}
          >
            <text style={cellText}>tall</text>
          </node>
          <Cells count={4} from={1} />
        </node>
      </Example>
    </>
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
  padding: 12,
  gridAutoRows: "48px",
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const cell: BevyStyle = {
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
};

const cellText: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xs,
  fontWeight: "bold",
};
