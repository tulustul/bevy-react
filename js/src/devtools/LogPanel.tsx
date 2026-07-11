// The bridge log tab: a Network-panel-like live stream of recorded bridge
// messages — direction badges, per-kind filter chips, pause/clear, and
// click-to-expand JSON detail. Newest entries render first.

import { useState, useSyncExternalStore } from "react";
import { recorder, type LogEntry, type LogKind } from "./recorder";
import { Chip, IconButton, ScrollArea } from "./DevtoolsHost";
import { theme } from "./theme";

const ALL_KINDS: LogKind[] = [
  "ops",
  "emit",
  "request",
  "response",
  "event",
  "uiEvent",
];

function useRecorderVersion(): number {
  return useSyncExternalStore(recorder.subscribe, recorder.getVersion);
}

export function LogPanel() {
  useRecorderVersion();
  const [hidden, setHidden] = useState<ReadonlySet<LogKind>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleKind = (kind: LogKind) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });

  const rows = [...recorder.entries()]
    .reverse()
    .filter((e) => !hidden.has(e.kind));

  return (
    <>
      <Controls hidden={hidden} onToggleKind={toggleKind} />
      <ScrollArea>
        {rows.length === 0 ? (
          <text style={{ color: theme.textDim, fontSize: 11, margin: 8 }}>
            No bridge traffic recorded yet.
          </text>
        ) : (
          rows.map((entry) => (
            <LogRow
              key={entry.seq}
              entry={entry}
              expanded={expanded === entry.seq}
              onToggle={() =>
                setExpanded((cur) => (cur === entry.seq ? null : entry.seq))
              }
            />
          ))
        )}
      </ScrollArea>
    </>
  );
}

function Controls({
  hidden,
  onToggleKind,
}: {
  hidden: ReadonlySet<LogKind>;
  onToggleKind: (kind: LogKind) => void;
}) {
  const paused = recorder.isPaused();
  const devtools = recorder.includesDevtools();
  return (
    <node
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 4,
        padding: { left: 6, right: 6, top: 4, bottom: 4 },
        border: { bottom: 1 },
        borderColor: theme.border,
      }}
    >
      <IconButton
        label={paused ? "resume" : "pause"}
        active={paused}
        onClick={() => recorder.setPaused(!paused)}
      />
      <IconButton label="clear" onClick={() => recorder.clear()} />
      {ALL_KINDS.map((kind) => (
        <Chip
          key={kind}
          label={kind}
          active={!hidden.has(kind)}
          onClick={() => onToggleKind(kind)}
        />
      ))}
      <Chip
        label="devtools"
        active={devtools}
        onClick={() => recorder.setIncludeDevtools(!devtools)}
      />
    </node>
  );
}

function LogRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: LogEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const out = entry.dir === "out";
  return (
    <node style={{ flexDirection: "column" }}>
      <node
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          padding: { left: 6, right: 6, top: 1, bottom: 1 },
        }}
        hoverStyle={{ backgroundColor: theme.bgAlt }}
        onClick={onToggle}
      >
        <text
          style={{
            color: theme.textDim,
            fontSize: 9,
            fontFamily: theme.mono,
          }}
        >
          {formatTime(entry.t)}
        </text>
        <text
          style={{
            color: out ? theme.ok : theme.accent,
            fontSize: 9,
            fontFamily: theme.mono,
          }}
        >
          {out ? "out" : "in"}
        </text>
        <text style={{ color: theme.textDim, fontSize: 10 }}>{entry.kind}</text>
        {/* `noWrap`: long summaries ride the ScrollArea's horizontal scroll
            range instead of wrapping the row. */}
        <text
          style={{
            color: theme.text,
            fontSize: 10,
            fontFamily: theme.mono,
            lineBreak: "noWrap",
          }}
        >
          {entry.summary}
        </text>
        {entry.stats && (
          <text
            style={{
              color: theme.ok,
              fontSize: 9,
              fontFamily: theme.mono,
            }}
          >
            {`${grandTotal(entry).toFixed(2)}ms`}
          </text>
        )}
      </node>
      {expanded && (
        <node
          style={{
            flexDirection: "column",
            padding: { left: 16, right: 6, top: 2, bottom: 4 },
            backgroundColor: theme.bgAlt,
            gap: 2,
          }}
        >
          {entry.stats && <StatsBreakdown entry={entry} />}
          {/* Pretty JSON keeps its explicit newlines; `noWrap` makes each
              line scroll horizontally instead of word-wrapping. */}
          <text
            style={{
              color: theme.textDim,
              fontSize: 9,
              fontFamily: theme.mono,
              lineBreak: "noWrap",
            }}
          >
            {stringifyDetail(entry.detail)}
          </text>
        </node>
      )}
    </node>
  );
}

/** End-to-end cost of an ops entry: the sum of its measured, disjoint segments
 *  (JS render + flush + pre-apply + translate + command + layout). Not a wall
 *  measure — there is no shared clock across the boundary — but the segments
 *  are contiguous, so the sum is the honest equivalent. */
function grandTotal(entry: LogEntry): number {
  return (
    (entry.jsMs ?? 0) + (entry.flushMs ?? 0) + (entry.stats?.total_ms ?? 0)
  );
}

/** The stress-table columns for one ops entry:
 *  Total | Pre-apply | JS | Flush | Translate | Command | Layout | Bevy. */
function StatsBreakdown({ entry }: { entry: LogEntry }) {
  const s = entry.stats;
  if (!s) return null;
  const ms = (v: number | undefined) =>
    v === undefined ? "-" : `${v.toFixed(2)}`;
  const cols: [string, string][] = [
    ["total", ms(grandTotal(entry))],
    ["pre-apply", ms(s.pre_apply_ms)],
    ["js", ms(entry.jsMs)],
    ["flush", ms(entry.flushMs)],
    ["translate", ms(s.translate_ms)],
    ["command", ms(s.command_ms)],
    ["layout", ms(s.layout_ms)],
    ["bevy", ms(s.command_ms + s.layout_ms)],
  ];
  return (
    <node style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {cols.map(([label, value]) => (
        <node
          key={label}
          style={{ flexDirection: "row", gap: 2, alignItems: "center" }}
        >
          <text style={{ color: theme.textDim, fontSize: 9 }}>{label}</text>
          <text
            style={{ color: theme.ok, fontSize: 9, fontFamily: theme.mono }}
          >
            {value}
          </text>
        </node>
      ))}
    </node>
  );
}

/** Wall-clock `HH:MM:SS.mmm` from an epoch-ms stamp. Manual padding — the
 *  embedded isolate has `Date` but no reliable locale formatting. */
function formatTime(t: number): string {
  const d = new Date(t);
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

function stringifyDetail(detail: unknown): string {
  try {
    const s = JSON.stringify(detail, null, 1) ?? "undefined";
    return s.length > 2000 ? `${s.slice(0, 2000)}...` : s;
  } catch {
    return String(detail);
  }
}
