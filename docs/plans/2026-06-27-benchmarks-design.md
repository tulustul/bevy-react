# Benchmarks & stress tests — design and catalogue

**Date:** 2026-06-27
**Status:** design / not yet implemented
**Source of truth for scope:** the `Benchmarks and stress tests` section of `/TODO`.

## Goals (what the results are for)

1. **A publishable comparison artifact** — the headline "_the reconciler is
   identical `react-reconciler`; here is the pure host/bridge overhead_" chart,
   measured against `react-dom` (and, where we can, React Native).
2. **Manual exploration / profiling** — run a scenario live, attach a profiler,
   watch frame time while iterating.

CI regression-gating is explicitly **not** a primary driver, so we do not build
threshold-gating infra up front (it can be layered on later — every capture run
already emits machine-readable JSON).

## Framing (carried from TODO)

The reconciler IS `react-reconciler` — the same Fiber engine as web React — so
results split into:

- **(a) apples-to-apples reconcile work** — run the **same component tree**
  through a `react-dom` host and the Bevy host; the delta is pure host/bridge
  overhead.
- **(b) apples-to-oranges paint** — `bevy_ui`/GPU vs DOM. Reported, but never
  presented as a like-for-like number.

### Expectation to validate

reconcile ≈ web & faster than RN (Hermes); commit boundary faster than DOM
mutation, ≈ RN Fabric; layout slower than Blink at high node counts (the main
risk); world-anchored UI **ahead** of web (web needs per-frame rAF + style
writes; we do it in Rust/GPU with zero JS).

## Harness structure (three tiers, three execution models)

| Tier | What | Where it runs | How |
|---|---|---|---|
| 1 | Library micro-benchmarks | headless, pure Rust | `crates/*/benches/*.rs`, **criterion**, `cargo bench` |
| 2 | App-driven runtime / stress | live Bevy app loop | `examples/stress` runner |
| 3 | Cross-framework comparison | Bevy app **and** browser | shared host-agnostic scenarios, two backends |

### Tier 2/3 runner: `examples/stress`

A **separate** example (not folded into `demos` — that one is the live marketing
gallery), but reusing the demos patterns: `States`-enum gating,
`DespawnOnExit(...)` scoping, the scene plugins, and `CameraPlugin`. Two entry
modes, both already precedented by demos' `--shoot` / `--export-bindings`:

- **Interactive selector** (left-nav) — for the *manual exploration / profiling*
  goal.
- **Flag-driven capture** — `--run <scenario> [params] --out results.json` —
  runs, captures timing, emits JSON, exits. One binary, scenario = a module ⇒
  **one link target** (important: linking already OOMs CI per `TODO` line 9; N
  separate examples would be N slow Bevy links).

### Tier 3 mechanism: host-agnostic scenarios

The comparison requires the **same component tree** through both hosts. Both are
`react-reconciler`, so scenarios are authored **once** against a thin neutral
primitive set (`<Box>`, `<Text>`, `<Row>`…) with two backends:

- **bevy-react backend** → `bevy_ui` nodes, runs in `examples/stress`.
- **react-dom backend** → `<div>`/`<span>`, a parallel web build runnable in a
  browser (headless via Playwright for capture).

The per-backend primitive mapping cost **is** the host overhead being measured,
so the symmetric indirection is correct, not a confound.

### Results format

Each capture emits a single JSON document: scenario id, params, environment
(commit, machine, bevy/react versions), and a metric block (samples + p50/p99
or criterion estimate). A small chart step renders the headline comparison from
the bevy-react JSON + the react-dom JSON for the same scenario id.

---

## Catalogue

Each entry: **ID** · what it measures · method · primary metric · web React
comparison (where one exists).

### Tier 1 — library micro-benchmarks (criterion, headless)

- **L1 — Op-flush hot path.**
  `serde_v8` deserialize + `apply_js_ops` (`crates/core/src/reconcile.rs`) +
  `ui_map`, swept over `Vec<Op>` length **10 → 100k**.
  *Metric:* ns/op and ops/sec vs batch size. *Proves:* the "no JSON strings on
  the hot path" claim.
  *Comparison:* host-specific; no external equivalent. Conceptually the analogue
  of `react-dom`'s commit-phase mutation apply.

- **L2 — Mount cost vs tree shape.**
  First-render cost for **deep** (10k-deep), **wide** (10k siblings), and
  **balanced** trees. *Metric:* total mount time + ops emitted.
  *Comparison:* deep/recursive case mirrors the **Sierpinski** triangle demo
  (below); raw create cost mirrors js-framework-benchmark "create 1,000 / 10,000
  rows".

- **L3 — Update amplification.**
  Change one prop deep in an N-node tree; **assert O(1) ops, not O(N)**.
  *Metric:* ops emitted per single logical change (regression guard).
  *Relates to:* the full-`Node`-rebuild-on-every-`Op::Update` debt
  (`ui_map.rs:494`). *Comparison:* uibench's targeted-update scenarios.

- **L4 — Keyed-list churn.**
  swap / insert / remove / reorder at scale on a keyed list.
  *Metric:* ops emitted + apply time per operation.
  *Comparison:* js-framework-benchmark "swap rows", "remove row", "select row";
  uibench list-reconciliation cases.

### Tier 2 — app-driven runtime / stress tests (live Bevy loop)

- **S1 — End-to-end event round-trip latency (p50/p99 under load).**
  click → `uiEvent` → handler → `setState` → flush → applied. Extend
  `crates/core/tests/roundtrip.rs` with timing.
  *Metric:* round-trip latency distribution; expect ~1 frame (Bevy→JS is async
  via tokio mpsc → `op_next_event`).
  *Comparison:* no standard web benchmark; informally vs `react-dom` synthetic
  event → `setState` → commit in the same scenario.

- **S2 — Bevy→React event flood / backpressure.**
  Produce events faster than React commits; watch the channel grow.
  *Metric:* channel depth over time, dropped/lagged events, memory.
  *Ties to:* unbounded-channels debt (`plugin.rs:125`). *Comparison:*
  library-specific; none.

- **S3 — Request/response under concurrency.**
  Many in-flight `op_request` correlations, including malformed payloads.
  *Metric:* completion latency under N concurrent; **assert none hang** (bad
  input must reject, never block). *Comparison:* library-specific; none.

- **S4 — Frame-budget interaction. (HIGHEST VALUE)**
  `op_flush` is sync on the Bevy main thread and shares the 16.6ms budget with
  the 3D sim. Measure dropped frames under a large flush.
  **Key sub-question:** do world-anchored elements (declared once by React,
  positioned every frame by a Bevy system, *no* per-frame bridge traffic)
  trigger a `bevy_ui` **relayout** on position change, or just transform/extract?
  If transform-only, N anchored badges scale ~free; if relayout, that is the
  cost to fix.
  *Metric:* frame-time histogram / dropped frames vs flush size and anchored-node
  count. *Comparison:* sustained-load spirit matches **DBMonster** (below); the
  world-anchored result is where we expect to be **ahead** of web.

- **S5 — Animations engine throughput.**
  N concurrent animations/frame; **confirm values are driven Rust-side**
  (`crates/animations`), not round-tripped to JS each frame.
  *Metric:* max concurrent animations within frame budget; bridge traffic per
  frame (should be ~0). *Comparison:* DBMonster (sustained high-frequency
  updates).

- **S6 — Canvas rasterizer throughput.**
  `DrawCmd` throughput per frame (`crates/canvas`).
  *Metric:* draw commands/frame within budget. *Comparison:* none direct (this is
  our rasterizer host element); loosely, a `<canvas>` 2D draw loop.

- **S7 — Hot-reload latency + steady-state memory.**
  Fast Refresh path; isolate stays alive across many reloads.
  *Metric:* reload-to-repaint latency; isolate memory across repeated reloads
  (leak watch). *Comparison:* none standard.

- **S8 — Leak / steady-state.**
  Frame-time stability and entity count across repeated `selectScene` switches;
  **verify `DespawnOnExit` reclaims**.
  *Metric:* entity count delta per switch cycle; frame-time drift over time.
  *Comparison:* DBMonster (long-run stability).

### Tier 3 — cross-framework comparison (shared scenarios, two backends)

These are the publishable artifact. Each is ported to **both** the bevy-react
host and a vanilla **react-dom** host from one shared component tree.

- **X1 — js-framework-benchmark (krausest) operation set.**
  The industry-standard table: create 1k / 10k rows, update every 10th, swap,
  select, remove, clear, append.
  *Metric:* per-operation time, bevy-react vs react-dom.
  *Compare with:* https://github.com/krausest/js-framework-benchmark ·
  results table https://krausest.github.io/js-framework-benchmark/

- **X2 — uibench (localvoid).**
  Clean reconciler-only comparison, minimal paint — the best isolation of
  "reconcile work" (a) from paint (b).
  *Metric:* uibench's own scored operation set, both hosts.
  *Compare with:* https://github.com/localvoid/uibench · live
  https://localvoid.github.io/uibench/

- **X3 — DBMonster.**
  Sustained high-frequency update / repaint stress.
  *Metric:* sustained FPS / frame-time under continuous mutation, both hosts.
  *Compare with:* https://github.com/mathieuancelin/js-repaint-perfs · live
  https://mathieuancelin.github.io/js-repaint-perfs/

- **X4 — Sierpinski triangle.**
  Deep-recursive update under load — the canonical Fiber stress demo.
  *Metric:* update latency / frame-time at depth, both hosts.
  *Compare with:* React Fiber vs Stack demo
  https://github.com/claudiopro/react-fiber-vs-stack-demo · live
  https://claudiopro.github.io/react-fiber-vs-stack-demo/

---

## Implementation order (cheapest high-value first)

1. **L1, L3, L4** — criterion benches. Cheapest, no app, immediately guard the
   hot-path/regression claims.
2. **Neutral-primitive layer + `examples/stress` skeleton** (interactive +
   `--run` capture, JSON out). Unblocks everything app-shaped.
3. **S4** (frame-budget / world-anchored) — highest single-test value; answers
   the relayout-vs-transform question.
4. **X2 (uibench)** then **X1 (krausest)** — the headline comparison artifact.
5. Remaining S* and X3/X4 as capacity allows.

## Open questions

- **Neutral-primitive abstraction vs author-twice.** This doc assumes the
  shared `<Box>/<Text>` layer (rigorous, single source). Authoring each
  cross-framework scenario twice is simpler but a weaker artifact — revisit if
  the abstraction proves leaky.
- **React Native comparison.** The expectation references RN Hermes / RN Fabric,
  but there is no drop-in standard RN port of these scenarios. Treat RN numbers
  as a later, best-effort addition rather than a tier-3 requirement.
- **Headless render for capture.** Tier 2/3 Bevy captures need an X11 display
  (same constraint as `--shoot`); confirm the CI/capture environment provides one
  or run captures locally for the artifact.
