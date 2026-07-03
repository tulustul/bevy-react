# stress — bevy-react benchmarks

A minimal, pure-UI Bevy app for benchmarking/stress-testing `bevy-react`. The
first scenario is **table-ops** (a table operation set derived from the
js-framework-benchmark), measured as a _library_ benchmark — bevy-react's own
per-operation timings, no cross-framework comparison.

## The operation set

Every operation comes in a **surgical** (`*1`, one row) and a **mass**
(`*Every2nd`, half the table) variant, and the whole set runs at **two table
scales** — 1k and 10k rows. That 2×2 (surgical/mass × small/large) is the
point: comparing a surgical op across scales exposes costs that are secretly
O(table) rather than O(changed), and comparing mass ops across scales checks
throughput stays linear. `insertEvery2nd` doubles as a quadratic-behavior
detector: if applying interleaved mid-list inserts costs O(table) each (e.g. a
per-insert `Children` splice), the 1k→10k ratio reads ~100× instead of ~10×.

| Op                    | Semantics (table of N rows)                          | Wire path exercised            |
| --------------------- | ---------------------------------------------------- | ------------------------------ |
| `create`              | replace the table with N fresh rows                  | mass spawn                     |
| `append1`             | append 1 fresh row at the end                        | single insert-at-end           |
| `append1k`            | append 1,000 fresh rows (fixed batch at both scales) | mass insert-at-end             |
| `insert1`             | insert 1 fresh row at the middle                     | single mid-list `insertBefore` |
| `insertEvery2nd`      | a fresh row after every 2nd existing row (→ ~1.5N)   | mass interleaved inserts       |
| `updateText1`         | append `" !!!"` to one middle row's label            | single text update → relayout  |
| `updateTextEvery2nd`  | same for every 2nd row                               | mass text updates → relayout   |
| `updateColor1`        | toggle one middle row's `backgroundColor`            | single paint-only style delta  |
| `updateColorEvery2nd` | same for every 2nd row                               | mass paint-only style deltas   |
| `swap1`               | swap rows 1 and N−2                                  | 2 keyed moves                  |
| `swapEvery2nd`        | swap each adjacent pair (0↔1, 2↔3, …)                | mass keyed moves               |
| `remove1`             | remove one middle row                                | single despawn                 |
| `removeEvery2nd`      | remove every 2nd row (→ N/2)                         | mass despawns                  |
| `clear`               | empty the table                                      | full teardown                  |

The rows are keyed and memoized, so swaps emit hierarchy **move** ops (not
per-row updates), text updates hit the relayout path, and color updates hit the
paint-only delta path.

Capture runs the set in blocks so each measured op has a consistent, reported
precondition (the `rows` column): the count-stable in-place ops share one
measured `create` and end with a measured `clear` from a full table; the
structural groups (append/insert/remove) each get an unmeasured create/clear
reset around them.

## Use

Build the React bundle first (required).

**Interactive** (manual exploration / profiling) — table with control buttons and
a live timing readout. A debug build with hot reload is fine here:

```sh
npm run build -w stress-app
cargo run -p bevy-react --example stress
```

**Capture** (automated) — drives the operation set one op at a time, records
per-op timing (p50/p99/mean over N iterations) to JSON, then exits. Needs an X11
display present. Capture disables vsync (`PresentMode::AutoNoVsync`) so `totalMs`
isn't quantized to ~16.6 ms frame boundaries; interactive mode keeps the default
present mode.

> **Always run capture in release + prod.** A debug Rust build and a dev JS
> bundle run ~10x slower, so the numbers are meaningless. Capture warns if it
> detects a debug build.

```sh
npm run build:prod -w stress-app
cargo run --release -p bevy-react --example stress -- --run table-ops --out results.json [--iterations N]
```

Results are written to `benchmark_results/` (gitignored).

Each op reports `totalMs` (event trigger → result detected Bevy-side, the
end-to-end number) plus a per-leg breakdown (each a `{p50,p99,mean,min,max}`):

- `jsMs` — React reconcile + build the op array + the serde decode (JS thread).
- `flushMs` — the `op_flush` native call alone = `serde_v8` decode of the op
  batch at the boundary. A **subset of `jsMs`**; `jsMs − flushMs` ≈ React work.
- `translateMs` — walk the ops → queue ECS commands (`apply_js_ops` body).
- `commandMs` — execute the commands (spawn entities / insert components /
  hierarchy) + UI prepare/content, up to layout.
- `layoutMs` — `bevy_ui` layout (taffy solve + transform/clip propagation).
- `preApplyMs`, `bevyMs` — diagnostics: `trigger → apply_js_ops start`, and the
  full Bevy-side wall from translate-end to detection (≈ `command + layout`).

`opsEmitted` is the flushed batch size. The `js` legs and the Bevy legs run on
different threads, so this is a breakdown, not a strict sum of `totalMs`.

The Markdown report renders one p50 table per scale (1k, 10k). For the
surgical (`*1`) ops, `jsMs`/`flushMs` are sub-millisecond while the isolate's
clock may only have 1 ms resolution (`Date.now()`), so those columns can read
as 0/1 ms noise — the Rust-side legs carry the signal there. Bump
`--iterations` for stable surgical p50s.

## Regenerate bindings

After changing any `#[react_event]` / `#[react_message]` type, regenerate the
typed bridge:

```sh
npm run bevy:generate -w stress-app
```

## Layout

- `main.rs` — entry point + flag parsing (`--run`, `--export-bindings`).
- `table_ops.rs` — the scenario: ops, bridge bindings, and the capture driver.
- `ui/` — the `stress-app` React UI (the table + harness).
