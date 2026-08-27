import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { emit, on, type BenchOp } from "./bevy";
import { buildData, type Row } from "./data";

// Prefer a high-resolution clock when the runtime provides one; the embedded V8
// isolate may only have `Date.now()` (1ms resolution).
const now: () => number =
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? () => performance.now()
    : () => Date.now();

// Interactive control buttons. `n` only matters for `Create` (the table scale);
// the capture driver owns its own sequence and sends `n` with every step.
const CONTROLS: { label: string; op: BenchOp; n?: number }[] = [
  { label: "Create 1,000", op: "Create", n: 1000 },
  { label: "Create 10,000", op: "Create", n: 10000 },
  { label: "Append 1", op: "Append1" },
  { label: "Append 1,000", op: "Append1k" },
  { label: "Insert 1", op: "Insert1" },
  { label: "Insert every 2nd", op: "InsertEvery2nd" },
  { label: "Text 1", op: "UpdateText1" },
  { label: "Text every 2nd", op: "UpdateTextEvery2nd" },
  { label: "Color 1", op: "UpdateColor1" },
  { label: "Color every 2nd", op: "UpdateColorEvery2nd" },
  { label: "Swap 1", op: "Swap1" },
  { label: "Swap every 2nd", op: "SwapEvery2nd" },
  { label: "Remove 1", op: "Remove1" },
  { label: "Remove every 2nd", op: "RemoveEvery2nd" },
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

  // A fresh snapshot of `rows` so the post-commit readout can report the row
  // count without re-rendering during a measured drive.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Per-step timing: `startRef` is stamped when an op is triggered, `pendingRef`
  // carries it through the commit so the post-commit effect can close the timing.
  const startRef = useRef(0);
  const pendingRef = useRef<{ op: BenchOp; driven: boolean } | null>(null);
  const seedRef = useRef(1);

  // Apply one operation. All mutations go through `setState` so they land in a
  // single reconciler commit (the thing the benchmark measures). Row-count
  // effects must mirror `rows_after` in `table_ops.rs` (the report's `rows`
  // precondition column). `n` is the table scale; only `Create` consumes it.
  const runOp = useCallback((op: BenchOp, n: number, seed: number) => {
    switch (op) {
      case "Create":
        setSelected(null);
        setRows(buildData(n, seed));
        break;
      case "Append1":
        setRows((rs) => [...rs, ...buildData(1, seed)]);
        break;
      case "Append1k":
        setRows((rs) => [...rs, ...buildData(1000, seed)]);
        break;
      case "Insert1":
        // One fresh row spliced into the middle (an `insertBefore`, not an append).
        setRows((rs) => {
          const c = rs.slice();
          c.splice(Math.floor(rs.length / 2), 0, ...buildData(1, seed));
          return c;
        });
        break;
      case "InsertEvery2nd":
        // A fresh row after every complete pair of existing rows → interleaved
        // `insertBefore`s, the mass mid-list insertion case.
        setRows((rs) => {
          const fresh = buildData(Math.floor(rs.length / 2), seed);
          const out: Row[] = [];
          for (let i = 0; i < rs.length; i++) {
            out.push(rs[i]);
            if (i % 2 === 1) out.push(fresh[(i - 1) / 2]);
          }
          return out;
        });
        break;
      case "UpdateText1":
        // Text change on one middle row → new content measure → genuine relayout.
        setRows((rs) => {
          const mid = Math.floor(rs.length / 2);
          return rs.map((r, i) =>
            i === mid ? { ...r, label: `${r.label} !!!` } : r,
          );
        });
        break;
      case "UpdateTextEvery2nd":
        // Text change on every 2nd row → new content measure → genuine relayout.
        setRows((rs) =>
          rs.map((r, i) =>
            i % 2 === 0 ? { ...r, label: `${r.label} !!!` } : r,
          ),
        );
        break;
      case "UpdateColor1":
        // Paint-only change on one middle row: only `backgroundColor` moves.
        setRows((rs) => {
          const mid = Math.floor(rs.length / 2);
          return rs.map((r, i) =>
            i === mid
              ? { ...r, bg: r.bg === ROW_BG_A ? ROW_BG_B : ROW_BG_A }
              : r,
          );
        });
        break;
      case "UpdateColorEvery2nd":
        // Paint-only change on every 2nd row: only `backgroundColor` moves, no
        // layout field. Toggles between two colors so repeated runs keep changing.
        setRows((rs) =>
          rs.map((r, i) =>
            i % 2 === 0
              ? { ...r, bg: r.bg === ROW_BG_A ? ROW_BG_B : ROW_BG_A }
              : r,
          ),
        );
        break;
      case "Swap1":
        // Swap two rows far apart (1 and len−2, js-framework-benchmark-style).
        setRows((rs) => {
          if (rs.length < 4) return rs;
          const c = rs.slice();
          const t = c[1];
          c[1] = c[c.length - 2];
          c[c.length - 2] = t;
          return c;
        });
        break;
      case "SwapEvery2nd":
        // Swap each adjacent pair — mass keyed moves with a predictable count.
        setRows((rs) => {
          const c = rs.slice();
          for (let i = 0; i + 1 < c.length; i += 2) {
            const t = c[i];
            c[i] = c[i + 1];
            c[i + 1] = t;
          }
          return c;
        });
        break;
      case "Remove1":
        setRows((rs) => {
          const mid = Math.floor(rs.length / 2);
          return rs.filter((_, i) => i !== mid);
        });
        break;
      case "RemoveEvery2nd":
        // Keeps the even indices (removes the 2nd, 4th, … rows).
        setRows((rs) => rs.filter((_, i) => i % 2 === 0));
        break;
      case "Clear":
        setSelected(null);
        setRows([]);
        break;
    }
  }, []);

  const perform = useCallback(
    (op: BenchOp, n: number, seed: number, driven: boolean) => {
      startRef.current = now();
      pendingRef.current = { op, driven };
      runOp(op, n, seed);
    },
    [runOp],
  );

  // Capture driver: run the op the Bevy side asks for.
  useEffect(
    () => on("bench.runStep", ({ op, n, seed }) => perform(op, n, seed, true)),
    [perform],
  );

  // Stable row-click handler: a per-row inline closure would change identity on
  // every render and defeat `RowView`'s memo (re-rendering the whole table on
  // every commit — at 10k rows that dwarfed the op being measured).
  const select = useCallback((id: number) => setSelected(id), []);

  // After every commit, close out a pending op. Driven steps report their JS-side
  // time back to Bevy (`bench.stepDone`); manual steps update the on-screen readout
  // (which would itself re-render, so we never do that during a measured drive).
  // Intentionally runs after every commit — a dependency array would defeat the
  // post-commit accounting this effect exists to do.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <text style={titleStyle}>table-ops · bevy-react</text>

      <node style={controlsStyle}>
        {CONTROLS.map((c) => (
          <Btn
            key={c.label}
            label={c.label}
            onClick={() => perform(c.op, c.n ?? 0, seedRef.current++, false)}
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
            isSelected={row.id === selected}
            onSelect={select}
          />
        ))}
      </node>
    </node>
  );
}

interface RowProps {
  row: Row;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

// Memoized so a list-wide re-render only re-renders the rows whose props actually
// changed — the keyed-reconciliation behaviour the benchmark exercises. Every prop
// is referentially stable across unrelated commits (`row` untouched, `isSelected`
// a boolean, `onSelect` a stable useCallback), so the memo genuinely bails: a
// surgical op re-renders only the changed row, not the whole table.
const RowView = memo(function RowView({ row, isSelected, onSelect }: RowProps) {
  // Keep the style reference stable when neither selection nor `bg` changed, so a
  // re-render doesn't look like a prop change and emit a spurious `update` op —
  // only a real `bg`/selection change rebuilds the object. Mirrors the
  // module-const styles' referential stability.
  const style = useMemo<BevyStyle>(
    () =>
      isSelected
        ? rowSelectedStyle
        : row.bg
          ? { ...rowStyle, backgroundColor: row.bg }
          : rowStyle,
    [isSelected, row.bg],
  );
  return (
    <button style={style} onClick={() => onSelect(row.id)}>
      <text>{`${row.id} ${row.label}`}</text>
    </button>
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
const MONO = "Noto Sans Mono";

// Two backgrounds the `UpdateColor*` ops toggle between (a paint-only change:
// same layout, only `backgroundColor` differs).
const ROW_BG_A = "#45475a";
const ROW_BG_B = "#585b70";

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
  gap: 5,
  width: "100%",
  overflowY: "scroll",
};

const btnStyle: BevyStyle = {
  padding: { horizontal: 12, vertical: 6 },
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

const rowStyle: BevyStyle = {
  padding: 5,
};

const rowSelectedStyle: BevyStyle = {
  padding: 5,
  backgroundColor: SURFACE,
};
