import { memo, useCallback, useEffect, useRef, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { emit, on, type BenchOp } from "./bevy";
import { buildData, type Row } from "./data";

// Prefer a high-resolution clock when the runtime provides one; the embedded V8
// isolate may only have `Date.now()` (1ms resolution).
const now: () => number =
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? () => performance.now()
    : () => Date.now();

const CONTROLS: { label: string; op: BenchOp }[] = [
  { label: "Create 1,000", op: "Create1k" },
  { label: "Create 10,000", op: "Create10k" },
  { label: "Append 1,000", op: "Append1k" },
  { label: "Update every 10th", op: "UpdateEvery10th" },
  { label: "Swap rows", op: "Swap" },
  { label: "Select", op: "Select" },
  { label: "Remove", op: "Remove" },
  { label: "Clear", op: "Clear" },
];

export function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [readout, setReadout] = useState<{
    op: string;
    ms: number;
    count: number;
  } | null>(null);

  // A fresh snapshot of `rows` for ops that need the current list synchronously
  // (e.g. Select reads an id) without threading it through a functional update.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Per-step timing: `startRef` is stamped when an op is triggered, `pendingRef`
  // carries it through the commit so the post-commit effect can close the timing.
  const startRef = useRef(0);
  const pendingRef = useRef<{ op: BenchOp; driven: boolean } | null>(null);
  const seedRef = useRef(1);

  const onSelect = useCallback((id: number) => setSelected(id), []);
  const onRemove = useCallback(
    (id: number) => setRows((rs) => rs.filter((r) => r.id !== id)),
    [],
  );

  // Apply one operation. All mutations go through `setState` so they land in a
  // single reconciler commit (the thing the benchmark measures).
  const runOp = useCallback((op: BenchOp, seed: number) => {
    switch (op) {
      case "Create1k":
        setSelected(null);
        setRows(buildData(1000, seed));
        break;
      case "Create10k":
        setSelected(null);
        setRows(buildData(10000, seed));
        break;
      case "Append1k":
        setRows((rs) => [...rs, ...buildData(1000, seed)]);
        break;
      case "UpdateEvery10th":
        setRows((rs) =>
          rs.map((r, i) =>
            i % 10 === 0 ? { ...r, label: `${r.label} !!!` } : r,
          ),
        );
        break;
      case "Swap":
        setRows((rs) => {
          if (rs.length < 999) return rs;
          const c = rs.slice();
          const t = c[1];
          c[1] = c[998];
          c[998] = t;
          return c;
        });
        break;
      case "Select":
        setSelected(rowsRef.current[1]?.id ?? null);
        break;
      case "Remove":
        setRows((rs) => rs.filter((_, i) => i !== 1));
        break;
      case "Clear":
        setSelected(null);
        setRows([]);
        break;
    }
  }, []);

  const perform = useCallback(
    (op: BenchOp, seed: number, driven: boolean) => {
      startRef.current = now();
      pendingRef.current = { op, driven };
      runOp(op, seed);
    },
    [runOp],
  );

  // Capture driver: run the op the Bevy side asks for.
  useEffect(
    () => on("bench.runStep", ({ op, seed }) => perform(op, seed, true)),
    [perform],
  );

  // After every commit, close out a pending op. Driven steps report their JS-side
  // time back to Bevy (`bench.stepDone`); manual steps update the on-screen readout
  // (which would itself re-render, so we never do that during a measured drive).
  useEffect(() => {
    const p = pendingRef.current;
    if (!p) return;
    pendingRef.current = null;
    const ms = now() - startRef.current;
    if (p.driven) {
      // The bridge stashes the last commit's op_flush (serde-decode) time.
      const flush = (globalThis as { __bevyReactFlush?: { ms: number } })
        .__bevyReactFlush;
      emit("bench.stepDone", { js_ms: ms, flush_ms: flush?.ms ?? 0 });
    } else {
      setReadout({ op: p.op, ms, count: rowsRef.current.length });
    }
  });

  return (
    <node style={appStyle}>
      <text style={titleStyle}>krausest · bevy-react</text>

      <node style={controlsStyle}>
        {CONTROLS.map((c) => (
          <Btn
            key={c.op}
            label={c.label}
            onClick={() => perform(c.op, seedRef.current++, false)}
          />
        ))}
      </node>

      <text style={readoutStyle}>
        {readout
          ? `${readout.op}: ${readout.ms.toFixed(2)} ms · ${readout.count} rows`
          : `${rows.length} rows`}
      </text>

      <node style={tableStyle}>
        {rows.map((row) => (
          <RowView
            key={row.id}
            row={row}
            selected={row.id === selected}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        ))}
      </node>
    </node>
  );
}

interface RowProps {
  row: Row;
  selected: boolean;
  onSelect: (id: number) => void;
  onRemove: (id: number) => void;
}

// Memoized so a list-wide re-render only re-renders the rows whose props actually
// changed — the keyed-reconciliation behaviour the benchmark exercises.
const RowView = memo(function RowView({
  row,
  selected,
  onSelect,
  onRemove,
}: RowProps) {
  return (
    <node style={selected ? rowSelectedStyle : rowStyle}>
      <text style={idStyle}>{row.id}</text>
      <button
        onClick={() => onSelect(row.id)}
        style={labelCellStyle}
        hoverStyle={cellHover}
      >
        <text style={labelTextStyle}>{row.label}</text>
      </button>
      <button
        onClick={() => onRemove(row.id)}
        style={removeCellStyle}
        hoverStyle={removeHover}
      >
        <text style={removeTextStyle}>✕</text>
      </button>
    </node>
  );
});

function Btn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={btnStyle}
      hoverStyle={btnHover}
      pressStyle={btnPress}
    >
      <text style={btnTextStyle}>{label}</text>
    </button>
  );
}

// --- Styles (a small Catppuccin-ish palette, kept self-contained) ---

const BG = "#1e1e2e";
const SURFACE = "#313244";
const TEXT = "#cdd6f4";
const SUBTEXT = "#a6adc8";
const PRIMARY = "#89b4fa";
const RED = "#f38ba8";
const MONO = "Noto Sans Mono";

const appStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "column",
  padding: 16,
  gap: 12,
  backgroundColor: BG,
};

const titleStyle: BevyStyle = {
  color: TEXT,
  fontSize: 22,
  fontWeight: "bold",
};

const controlsStyle: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
};

const readoutStyle: BevyStyle = {
  color: SUBTEXT,
  fontSize: 14,
  fontFamily: MONO,
};

const tableStyle: BevyStyle = {
  flexDirection: "column",
  width: "100%",
  flexGrow: 1,
  minHeight: 0,
  overflowY: "scroll",
};

const rowStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  padding: { top: 4, bottom: 4, left: 8, right: 8 },
};

const rowSelectedStyle: BevyStyle = {
  ...rowStyle,
  backgroundColor: SURFACE,
};

const idStyle: BevyStyle = {
  color: SUBTEXT,
  fontSize: 13,
  fontFamily: MONO,
  width: 64,
};

const labelCellStyle: BevyStyle = {
  flexGrow: 1,
  padding: { top: 2, bottom: 2 },
};

const cellHover: BevyStyle = {
  backgroundColor: SURFACE,
};

const labelTextStyle: BevyStyle = {
  color: TEXT,
  fontSize: 14,
};

const removeCellStyle: BevyStyle = {
  width: 28,
  height: 24,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 4,
};

const removeHover: BevyStyle = {
  backgroundColor: SURFACE,
};

const removeTextStyle: BevyStyle = {
  color: RED,
  fontSize: 14,
};

const btnStyle: BevyStyle = {
  padding: { top: 6, bottom: 6, left: 12, right: 12 },
  borderRadius: 6,
  backgroundColor: SURFACE,
  justifyContent: "center",
  alignItems: "center",
};

const btnHover: BevyStyle = {
  backgroundColor: PRIMARY,
};

const btnPress: BevyStyle = {
  backgroundColor: "#5a7fd6",
};

const btnTextStyle: BevyStyle = {
  color: TEXT,
  fontSize: 13,
  fontWeight: "bold",
};
