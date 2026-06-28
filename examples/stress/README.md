# stress — bevy-react benchmarks

A minimal, pure-UI Bevy app for benchmarking/stress-testing `bevy-react`. The
first scenario is **table-ops** (the standard table operation set borrowed from
the js-framework-benchmark: create 1k/10k, append 1k, update every 10th, swap,
select, remove, clear), measured as a *library* benchmark — bevy-react's own
per-operation timings, no cross-framework comparison.

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
display present.

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
