// The Console tab: JS console output, Rust diag messages, and JS-runtime
// failures, streamed from the Rust-side console ring (see
// crates/core/src/console_log.rs). Each row shows a timestamp, its source
// (js/rust), and its severity; level chips filter, the clear button empties
// both the panel and the ring. Chronological (newest at the bottom, like
// Chrome's console); new entries auto-scroll to the bottom — but only while
// the view is already there (scrolling up parks it).
//
// Data flow: the mount effect announces `devtools.consoleOpen` — Rust replies
// with the full ring backlog, then streams only-new entries while the tab
// stays open. Nothing crosses the bridge while the tab is hidden.
//
// Web-host limitation (by design): on wasm there is no `op_log` console shim
// (console.* goes to the browser's own console) and the ring is stubbed, so
// this tab shows nothing from JS on web — native-only content.

import { useEffect, useState } from "react";
import {
  onConsole,
  sendConsoleClear,
  sendConsoleOpen,
  type DevtoolsConsoleEntry,
} from "./api";
import { Chip, IconButton, StickyScrollArea } from "./DevtoolsHost";
import { formatTime } from "./LogPanel";
import { theme } from "./theme";

const LEVELS = ["debug", "info", "warn", "error"] as const;

/** Keep the row renderer total over ARBITRARY strings: a throw during render
 *  would loop (throw → console.error → ring → emit → re-render → throw) at
 *  frame rate. Unknown levels degrade to info's styling. */
function levelColor(level: string): string {
  switch (level) {
    case "error":
      return theme.danger;
    case "warn":
      return theme.warn;
    case "debug":
      return theme.textDim;
    default:
      return theme.text;
  }
}

export function ConsolePanel() {
  // Oldest → newest, capped to the ring's size so the panel can't outgrow it.
  const [entries, setEntries] = useState<DevtoolsConsoleEntry[]>([]);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  // Subscribe FIRST, then announce — the backlog event must not race the
  // listener. The unmount cleanup is the tab-hidden signal (tab switch, close
  // button, F12 all funnel through it).
  useEffect(() => {
    const off = onConsole((e) =>
      setEntries((prev) => {
        const next = [...prev, ...e.entries];
        return next.length > 500 ? next.slice(next.length - 500) : next;
      }),
    );
    sendConsoleOpen(true);
    return () => {
      off();
      sendConsoleOpen(false);
    };
  }, []);

  const toggleLevel = (level: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });

  const rows = entries.filter((e) => !hidden.has(e.level));
  const last = entries[entries.length - 1];

  return (
    <>
      <node
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 4,
          padding: { horizontal: 6, vertical: 4 },
          border: { bottom: 1 },
          borderColor: theme.border,
        }}
      >
        <IconButton
          label="clear"
          onClick={() => {
            // Local list clears immediately; Rust empties the ring. Entries
            // logged in between may show once then miss a later backlog —
            // browser-console parity.
            setEntries([]);
            sendConsoleClear();
          }}
        />
        {LEVELS.map((level) => (
          <Chip
            key={level}
            label={level}
            active={!hidden.has(level)}
            onClick={() => toggleLevel(level)}
          />
        ))}
      </node>
      <StickyScrollArea pinKey={last?.seq}>
        {rows.length === 0 ? (
          <text style={{ color: theme.textDim, fontSize: 11, margin: 8 }}>
            No console output captured yet.
          </text>
        ) : (
          rows.map((entry) => <ConsoleRow key={entry.seq} entry={entry} />)
        )}
      </StickyScrollArea>
    </>
  );
}

function ConsoleRow({ entry }: { entry: DevtoolsConsoleEntry }) {
  const color = levelColor(entry.level);
  return (
    <node
      style={{
        flexDirection: "row",
        alignItems: "flexStart",
        gap: 6,
        padding: { horizontal: 6, vertical: 1 },
      }}
      hoverStyle={{ backgroundColor: theme.bgAlt }}
    >
      <text
        style={{ color: theme.textDim, fontSize: 9, fontFamily: theme.mono }}
      >
        {formatTime(entry.time_ms)}
      </text>
      <text
        style={{
          color: entry.source === "rust" ? theme.accentAlt : theme.textDim,
          fontSize: 9,
          fontFamily: theme.mono,
        }}
      >
        {entry.source}
      </text>
      <text style={{ color, fontSize: 9, fontFamily: theme.mono }}>
        {entry.level}
      </text>
      {/* `noWrap` keeps a multi-line message's explicit newlines (stack
          traces) and rides the ScrollArea's horizontal scroll instead of
          wrapping the row. */}
      <text
        style={{
          color:
            entry.level === "warn" || entry.level === "error"
              ? color
              : theme.text,
          fontSize: 10,
          fontFamily: theme.mono,
          lineBreak: "noWrap",
        }}
      >
        {entry.message}
      </text>
    </node>
  );
}
