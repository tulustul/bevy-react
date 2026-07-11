// The bridge recorder: a bounded in-memory ring buffer of every message
// crossing the boundary, fed by the bridge tap (see `installDevtools`). Lives
// entirely in JS memory — recording never itself crosses the bridge, so it can
// never recurse.
//
// Recording follows the panel: it is ARMED at install (so a panel restored
// open on startup captures the app's initial mount), and the first
// `devtools.restore` — sent by Rust exactly once per session, defaults
// included — either keeps it armed (`open: true`) or disarms it. Disarming
// clears everything: while the panel is closed nothing is recorded and nothing
// is retained (`pendingStats` in particular must not grow — its drain, the
// `devtools.batchStats` stream, only flows while the panel is open).
//
// Devtools' own traffic (the panel's render ops, its `devtools.*` emits/events,
// the ~10 Hz stats stream) is DROPPED by default: it would flood the log and —
// for the panel's own ops — self-amplify (log entry → panel re-render → ops →
// new entry, forever). The panel's "devtools traffic" toggle re-includes the
// named `devtools.*` messages; the panel's own render op batches are never
// recorded, which is what makes the loop structurally impossible.

import type { Op, Outbound } from "../bridge";
import type { DevtoolsBatchStats } from "./api";
import { mirror } from "./mirror";

export type LogKind =
  | "ops"
  | "emit"
  | "request"
  | "response"
  | "event"
  | "uiEvent";

/** Render timings for the Rust-side apply of one op batch, attached to "ops"
 *  entries when the matching `devtools.batchStats` event lands. Rust-side legs
 *  only; the JS-side legs (`jsMs`, `flushMs`) live on the entry itself. */
export interface BatchTimings {
  /** `op_flush` send → apply start (channel wait + frame latency). */
  pre_apply_ms: number;
  translate_ms: number;
  command_ms: number;
  layout_ms: number;
  /** Sum of the Rust-side legs above. */
  total_ms: number;
}

export interface LogEntry {
  seq: number;
  /** Wall-clock timestamp (`Date.now()` epoch ms) — the log shows real time. */
  t: number;
  /** `out` = JS→Bevy, `in` = Bevy→JS. */
  dir: "out" | "in";
  kind: LogKind;
  /** Message/event name (emit, request, response, event). */
  name?: string;
  /** Correlation id (request/response). */
  requestId?: number;
  /** The `seq` of the request this response answers. */
  pairedSeq?: number;
  /** One-line row text. */
  summary: string;
  /** Full payload for the expandable detail view. */
  detail: unknown;
  /** Named `devtools.*` traffic (recorded only when opted in). */
  devtools: boolean;
  /** Rust render timings ("ops" entries only; attached when reported). */
  stats?: BatchTimings;
  /** This flush's `op_flush` boundary cost — serde_v8 decode + channel send
   *  ("ops" entries only). */
  flushMs?: number;
  /** Handler + synchronous React render/commit time of the event wrap that
   *  produced this flush, minus the flush costs inside it. Absent for commits
   *  scheduled outside an event wrap (timers, microtasks). */
  jsMs?: number;
}

const CAPACITY = 500;

const entries: LogEntry[] = [];
let seq = 1;
let version = 0;
// Armed at install so a restored-open panel captures the initial mount; the
// session's one `devtools.restore` (or any later toggle/close) settles it.
let enabled = true;
let paused = false;
let includeDevtools = false;
const subscribers = new Set<() => void>();
let notifyQueued = false;

// Recorded "ops" entries still awaiting their Rust-side render timings
// (`devtools.batchStats` arrives after the batch was applied + laid out).
// Rust coalesces all queued flushes into one apply, so one stats event can
// cover several entries; `ops` is each entry's op count for the sum-match.
const pendingStats: { entry: LogEntry; ops: number }[] = [];

/** The most recent applied batch (footer: batch id, op count, total time). */
let lastBatch: {
  applied_count: number;
  ops: number;
  total_ms: number;
} | null = null;

// requestId → the request's log entry (for response pairing + name), and the
// set of devtools-issued request ids (their responses are devtools traffic).
const requestSeqs = new Map<number, { seq: number; name: string }>();
const devtoolsRequests = new Set<number>();

// Ops entries recorded inside the current event wrap (see `onWrapStart`/
// `onWrapEnd`) — they receive the wrap's JS-leg timing when it closes.
let wrapOps: LogEntry[] | null = null;

/** The `flushRaw` instrumentation stash (bridge.ts). */
declare const globalThis: {
  __bevyReactFlush?: { ms: number; ops: number };
};

function scheduleNotify(): void {
  version++;
  if (notifyQueued) return;
  notifyQueued = true;
  queueMicrotask(() => {
    notifyQueued = false;
    for (const cb of subscribers) cb();
  });
}

function record(entry: Omit<LogEntry, "seq" | "t">): LogEntry | null {
  if (!enabled || paused) return null;
  if (entry.devtools && !includeDevtools) return null;
  const full = { ...entry, seq: seq++, t: Date.now() };
  entries.push(full);
  if (entries.length > CAPACITY) entries.splice(0, entries.length - CAPACITY);
  scheduleNotify();
  return full;
}

function opsSummary(batch: Op[]): string {
  const byKind = new Map<string, number>();
  for (const op of batch) byKind.set(op.op, (byKind.get(op.op) ?? 0) + 1);
  const parts = [...byKind.entries()].map(([k, n]) =>
    n > 1 ? `${k}×${n}` : k,
  );
  return `${batch.length} op${batch.length === 1 ? "" : "s"} (${parts.join(", ")})`;
}

export const recorder = {
  // --- The bridge-tap half (installed by `installDevtools`) ---

  onFlush(batch: Op[], devtools: boolean): void {
    // The panel's own render ops are never recorded (see module docs).
    if (devtools) return;
    const entry = record({
      dir: "out",
      kind: "ops",
      summary: opsSummary(batch),
      detail: batch,
      devtools: false,
    });
    if (!entry) return;
    // The tap fires right after `flushRaw` stamped this flush's boundary cost.
    entry.flushMs = globalThis.__bevyReactFlush?.ms;
    pendingStats.push({ entry, ops: batch.length });
    // Belt-and-braces bound: stats normally drain this within a frame or two
    // while the panel is open (and nothing is recorded while it's closed), so
    // hitting the cap means the stats stream stalled — drop the oldest.
    if (pendingStats.length > 64) {
      pendingStats.splice(0, pendingStats.length - 64);
    }
    if (wrapOps) wrapOps.push(entry);
  },

  /** An event wrap (handler + sync React render/commit) began. */
  onWrapStart(): void {
    wrapOps = [];
  },

  /** …and ended after `ms`. Its ops entries get the JS leg: the wrap time
   *  minus the flush costs inside it (kept disjoint so the columns sum). A
   *  multi-commit wrap assigns the same whole-wrap figure to each entry. */
  onWrapEnd(ms: number): void {
    const entries = wrapOps ?? [];
    wrapOps = null;
    if (entries.length === 0) return;
    const flushTotal = entries.reduce((sum, e) => sum + (e.flushMs ?? 0), 0);
    const js = Math.max(0, ms - flushTotal);
    for (const entry of entries) entry.jsMs = js;
    scheduleNotify();
  },

  /** Attach Rust render timings (`devtools.batchStats`) to the ops entries
   *  they cover. Prefer an exact op-count match over the oldest pending
   *  entries; when the sums can't line up (a devtools/panel batch was
   *  coalesced into the same apply), attach to everything pending. */
  attachBatchStats(s: DevtoolsBatchStats): void {
    // Rust attributes applies via the per-batch origin flags and emits stats
    // for APP batches only, so a stats event with no recorded ops awaiting it
    // should no longer happen. Kept as belt-and-braces: ignoring it terminates
    // the "stats → footer re-render → panel ops → new batch → stats…" loop
    // should the attribution ever regress.
    if (pendingStats.length === 0) return;
    const total_ms =
      s.pre_apply_ms + s.translate_ms + s.command_ms + s.layout_ms;
    lastBatch = { applied_count: s.applied_count, ops: s.last_ops, total_ms };
    const timings: BatchTimings = {
      pre_apply_ms: s.pre_apply_ms,
      translate_ms: s.translate_ms,
      command_ms: s.command_ms,
      layout_ms: s.layout_ms,
      total_ms,
    };
    let sum = 0;
    let matched = 0;
    for (const p of pendingStats) {
      if (sum + p.ops > s.last_ops) break;
      sum += p.ops;
      matched++;
    }
    const covered =
      sum === s.last_ops
        ? pendingStats.splice(0, matched)
        : pendingStats.splice(0);
    for (const p of covered) p.entry.stats = timings;
    scheduleNotify();
  },

  onEmit(name: string, value: unknown): void {
    record({
      dir: "out",
      kind: "emit",
      name,
      summary: name,
      detail: value,
      devtools: name.startsWith("devtools."),
    });
  },

  onRequest(id: number, name: string, value: unknown): void {
    const devtools = name.startsWith("devtools.");
    if (devtools) devtoolsRequests.add(id);
    requestSeqs.set(id, { seq, name });
    record({
      dir: "out",
      kind: "request",
      name,
      requestId: id,
      summary: `${name} #${id}`,
      detail: value,
      devtools,
    });
  },

  onOutbound(msg: Outbound): void {
    switch (msg.t) {
      case "uiEvent":
        record({
          dir: "in",
          kind: "uiEvent",
          name: msg.event.kind,
          summary: `${msg.event.kind} #${msg.event.id}`,
          detail: msg.event,
          devtools: mirror.isDevtools(msg.event.id),
        });
        break;
      case "event":
        record({
          dir: "in",
          kind: "event",
          name: msg.name,
          summary: msg.name,
          detail: msg.value,
          devtools: msg.name.startsWith("devtools."),
        });
        break;
      case "response": {
        const paired = requestSeqs.get(msg.id);
        requestSeqs.delete(msg.id);
        const devtools = devtoolsRequests.delete(msg.id);
        const status = msg.result.status;
        record({
          dir: "in",
          kind: "response",
          name: paired?.name,
          requestId: msg.id,
          pairedSeq: paired?.seq,
          summary: `${paired?.name ?? "?"} #${msg.id} → ${status}`,
          detail: msg.result,
          devtools,
        });
        break;
      }
      default:
        break; // animationFinished / reload — high-churn plumbing, not logged
    }
  },

  // --- The panel-facing half ---

  entries(): readonly LogEntry[] {
    return entries;
  },
  lastBatch(): {
    applied_count: number;
    ops: number;
    total_ms: number;
  } | null {
    return lastBatch;
  },
  isEnabled(): boolean {
    return enabled;
  },
  /** Recording follows the panel's open state (see the module docs). Disabling
   *  drops everything held — while closed the recorder must retain nothing. */
  setEnabled(value: boolean): void {
    if (enabled === value) return;
    enabled = value;
    if (!value) {
      entries.length = 0;
      pendingStats.length = 0;
      requestSeqs.clear();
      devtoolsRequests.clear();
      wrapOps = null;
      lastBatch = null;
    }
    scheduleNotify();
  },
  isPaused(): boolean {
    return paused;
  },
  setPaused(value: boolean): void {
    paused = value;
    scheduleNotify();
  },
  includesDevtools(): boolean {
    return includeDevtools;
  },
  setIncludeDevtools(value: boolean): void {
    includeDevtools = value;
    scheduleNotify();
  },
  clear(): void {
    entries.length = 0;
    scheduleNotify();
  },

  subscribe(cb: () => void): () => void {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  },
  getVersion(): number {
    return version;
  },
};
