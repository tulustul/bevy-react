# layers-stress — auto layer-promotion stress test

A minimal, pure-UI Bevy app that stresses the auto layer-promotion system
(`crates/core/src/layer.rs`): N `TestBanner` cards scattered at seeded-random
positions, each wrapped in an opacity-bearing node so it auto-promotes to its
own composited layer (its own offscreen capture texture + render pass). Vsync
is always off, so the FPS readout reflects real throughput.

## Controls

- **20 / 100 / 500** — how many cards (= promoted layers) to render. The
  scatter is seeded and single-stream, so counts are prefix-stable: the first
  20 cards of N=100 are exactly N=20's cards.
- **animations** — Rust-driven `translateX`/`translateY` (post-layout, no
  relayout) + `opacity` ping-pong loops, per-card randomized amplitude,
  duration, and stagger. Animated opacity on a promoted root drives the
  layer's composite group alpha directly. Zero per-frame JS cost — what's
  being measured is layer capture/composite, not the bridge.
- **groupAlpha** — off sets `groupAlpha: false` on every card, de-promoting
  all layers (each node folds opacity into its own colors instead; watch the
  seams appear). This is the un-layered baseline to compare FPS against.
- **filters: off / 50% / 100%** — apply a `filter` chain to that share of
  items (50% = every 2nd item, deterministic by index). A filter force-promotes
  its subtree and adds composite-time GPU filter passes.
- **filter: grayscale / blur** — the variant applied to the filtered share:
  `grayscale` (single color-matrix pass) or `blur` radius 6 (the expensive
  separable 2-pass filter, whose reach also outsets the layer texture).
- **animate filter** — one shared JS interval oscillates the blur radius
  2..10 px (~60 Hz). Unlike the Rust-driven **animations**, every tick crosses
  the bridge as a params-only style delta per filtered item — this exercises
  the filter-param update path (re-run filter passes, no re-capture). Only
  meaningful with the `blur` variant.
- **fps** — smoothed FPS from Bevy's `FrameTimeDiagnosticsPlugin`, pushed to
  React ~4x/sec over the `layersStress.fps` event.

The devtools Layers tab shows the live promoted-layer set (count, sizes,
estimated texture memory) while the app runs.

## Running

```sh
npm install                          # once, repo root
npm run build -w layers-stress-app   # build the React bundles
cargo run -p bevy-react --example layers-stress
npm run watch -w layers-stress-app   # rebuild on edit → Fast Refresh
```

After changing the Rust `#[react_event]` bindings, regenerate the typed
surface: `npm run bevy:generate -w layers-stress-app`.

## Measuring (`--measure` + `STRESS_PRESET`)

Unattended measurement runs preset the UI at build time and log FPS from Rust —
no extra bindings involved:

```sh
STRESS_PRESET='{"n":500,"animate":false,"filterMode":"all","blur":true}' \
  npm run build -w layers-stress-app
cargo run -p bevy-react --example layers-stress -- --measure 15
```

- `STRESS_PRESET` (a JSON object; unknown keys, wrong-typed values, and
  invalid `filterMode` variants are rejected at build time) is baked into the
  bundle by `ui/build.mjs` as `src/preset.ts` — the UI's startup state. Keys:
  `n`, `animate`, `groupAlpha`, `filterMode` (`"off" | "half" | "all"`),
  `blur`, `animateFilter`. Unset, the committed defaults regenerate
  byte-identical. Rebuild without it to restore the interactive defaults.
- `--measure <secs>` prints `[measure] t=…s fps=…` once per second (smoothed
  FPS) and exits after `<secs>`. Hot reload is disabled so the file watcher
  can't perturb the numbers. The first ~5 s are warm-up (pipeline compilation,
  initial captures) — read the steady state off the tail.

## Filter cost (measured 2026-07-22)

Steady-state FPS (mean of the last 8 one-second samples of a 15 s `--measure`
run), 500 items, `groupAlpha` on, vsync off. **Absolute numbers are
machine-specific (one Linux/X11 box, hot Rust build); only the ratios carry
information.**

| Scenario (n=500)                    | Opacity/translate anims | FPS | vs. baseline |
| ----------------------------------- | ----------------------- | --- | ------------ |
| filters off (baseline)              | off                     | 303 | —            |
| 50% grayscale                       | off                     | 295 | −3%          |
| 100% grayscale                      | off                     | 297 | −2%          |
| 100% blur (r=6)                     | off                     | 295 | −3%          |
| 100% blur + animate filter (~60 Hz) | off                     | 45  | −85%         |
| filters off                         | on                      | 304 | —            |
| 100% blur (r=6)                     | on                      | 305 | ±0%          |

Same matrix's animated-filter row at n=100 for scaling: baseline 774, static
100% blur 773 (free), animated 100% blur 577 (−25%).

Takeaways:

- **Static filters are effectively free at rest.** 500 filtered layers —
  grayscale or blur — cost ≤3% vs. the unfiltered layer baseline: with
  retained layer pixels the filtered result is cached, so the steady state is
  composite-only.
- **Filters don't tax the animation hot path.** Rust-driven opacity/translate
  animations over 500 _blurred_ layers run at full baseline speed (305 vs.
  304): group-alpha and position animate at composite time without re-running
  the filter passes.
- **Animating filter _params_ on the whole field is the expensive case.**
  Oscillating the blur radius of all 500 items every ~16 ms drops to 45 FPS
  (still no wgpu errors or stalls). Every tick re-renders the filtered items,
  ships 500 params-only deltas over the bridge, and re-runs 2×500 blur passes.
  It is an extreme scenario (a real UI animates a handful of filters, and
  n=100 costs 25%), but the per-item·frame overhead grows super-linearly
  (~4.4 µs at n=100 → ~38 µs at n=500) — worth profiling in Stage 2 whether
  the JS-side re-render/delta storm or the GPU passes dominate before building
  filter-param animation drivers.

No wgpu validation errors or panics in any run.
