# JS engines: V8 vs QuickJS

bevy-react runs the React bundle on V8 (cargo feature `v8`, the default) or
QuickJS (`quickjs`). This report compares them. Every number comes from one
machine, so read the ratios rather than the absolute values.

Measured 2026-11-22 on top of `9800a41`. Machine: AMD Ryzen 7 5800X
(8 cores, 16 threads), 32 GB RAM, GeForce RTX 3070, Arch Linux, X11,
rustc 1.99. Builds: Rust `--release`, prod JS bundles. Versions: deno_core
0.404 (V8 149), rquickjs 0.14 (quickjs-ng) with `disable-assertions`.

## Summary

|                                         | V8                       | QuickJS                   |
| --------------------------------------- | ------------------------ | ------------------------- |
| Engine's share of a stripped binary     | 49.2 MB                  | 1.3 MB                    |
| `minimal` example, stripped release     | 164.3 MB                 | 116.3 MB (−29%)           |
| Engine's `target/` footprint            | 834 MB (a 185 MB `.a`)   | 36 MB                     |
| Download at build time                  | ~40 MB prebuilt V8 lib   | none (C sources in crate) |
| Clean release build of the engine alone | 17 s (download included) | 23 s (needs a C compiler) |
| Startup, 145 KB prod bundle             | 34–40 ms                 | 18–26 ms                  |
| Startup, 3.1 MB dev bundle              | 77–81 ms                 | 48–54 ms                  |
| React work (table-ops `jsMs`)           | 1×                       | 10–31× slower             |
| `JSON.stringify` + decode (`flushMs`)   | 1×                       | 2.3–5× slower             |
| Peak RSS, table-ops (10k rows)          | 1389 MB                  | 1204–1225 MB              |

V8 is a JIT, so it runs JavaScript much faster. QuickJS is an interpreter. It
starts sooner, makes the binary much smaller, downloads nothing at build time
and uses less memory. Expect QuickJS to be fine for the UI of a typical game:
menus, HUDs, panels of tens to hundreds of nodes. At the measured ~10 µs of JS
per node React re-renders, a commit there costs about a millisecond. Prefer V8
for UIs that re-render thousands of nodes at once.

## Size and build

The engine's own cost is measured in three throwaway binaries: an empty `main`
(0.34 MB), one that evaluates `1 + 1` in deno_core (49.58 MB), and one that does
the same in rquickjs (1.68 MB). Each is a clean `--release` build with
`strip = true` and its own target dir. The V8 build time includes downloading
the prebuilt `librusty_v8.a` over a fast connection, so on a slow network it is
longer. The QuickJS build compiles quickjs-ng from C with `cc`.

The `minimal` example (core only, Bevy's default features) was built in
release twice, once with `quickjs` and once with `v8`, then stripped.

## Startup

The time is the startup log line
`INFO bevy_react_core::js: <engine> <version> ready in …`. It covers creating
the runtime, parsing and evaluating `vendor.js` and `app.js`, and the first
synchronous render with its flush. Three runs of the `layers-stress` UI (20 items):

| Bundle                      | V8            | QuickJS       |
| --------------------------- | ------------- | ------------- |
| prod (145 KB vendor + 6 KB) | 34, 38, 40 ms | 18, 18, 26 ms |
| dev (3.1 MB vendor + 73 KB) | 77, 81, 81 ms | 48, 48, 54 ms |

QuickJS parses and runs the bundle faster than V8 creates and warms up an
isolate. Precompiling the bundle to QuickJS bytecode is not needed.

## Table operations

Command:
`cargo run --release -p stress -- --run table-ops --out <file> --engine <v8|quickjs>`.
See [README](README.md) for what each op does and what each leg measures. The
p50 values below are the mean of two runs per engine.

- **JS** (`jsMs`) is the work the engine does: React's reconcile plus building
  and flushing the op batch.
- **Total** (`totalMs`) runs from the event to the frame where the batch is
  laid out, Bevy's share included. Bevy's legs (translate, command, layout)
  are the same on both engines.
- At 1k rows the totals also carry frame-boundary noise (the ~10 ms floor of a
  surgical op), so compare JS there.

### 1k rows (p50 ms)

| Op                      |  Ops | JS V8 | JS QuickJS |   × | Total V8 | Total QuickJS |   × |
| ----------------------- | ---: | ----: | ---------: | --: | -------: | ------------: | --: |
| create                  | 4001 |  5.67 |     130.13 |  23 |     47.5 |         162.9 | 3.4 |
| append1                 |    5 |  0.52 |      10.65 |  20 |     11.0 |          13.1 | 1.2 |
| append1k                | 4001 |  5.93 |     129.45 |  22 |     51.8 |         163.8 | 3.2 |
| insert1                 |    5 |  0.90 |      10.39 |  12 |     11.0 |          13.2 | 1.2 |
| insertEvery2nd          | 2001 |  3.18 |      33.45 |  11 |     31.4 |          51.9 | 1.7 |
| updateText1             |    1 |  0.61 |      12.71 |  21 |     11.2 |          14.8 | 1.3 |
| updateTextEvery2nd      |  500 |  1.69 |      26.22 |  16 |     25.2 |          39.7 | 1.6 |
| updateColor1            |    1 |  0.70 |       9.42 |  13 |     10.2 |          11.0 | 1.1 |
| updateColorEvery2nd     |  500 |  2.33 |      26.66 |  11 |     12.2 |          27.7 | 2.3 |
| updateTextColor1        |    1 |  0.64 |       9.40 |  15 |     10.2 |          10.8 | 1.1 |
| updateTextColorEvery2nd |  500 |  2.25 |      24.79 |  11 |     12.7 |          26.0 | 2.0 |
| swap1                   |  997 |  3.20 |      92.11 |  29 |     13.7 |          94.8 | 6.9 |
| swapEvery2nd            |  500 |  0.80 |      10.99 |  14 |     11.6 |          13.6 | 1.2 |
| remove1                 |    2 |  0.67 |      10.42 |  16 |     11.2 |          12.8 | 1.1 |
| removeEvery2nd          |  500 |  0.84 |       9.37 |  11 |     14.0 |          11.5 | 0.8 |
| clear                   | 1001 |  1.08 |      11.84 |  11 |     14.6 |          11.2 | 0.8 |

### 10k rows (p50 ms)

| Op                      |   Ops |  JS V8 | JS QuickJS |   × | Total V8 | Total QuickJS |    × |
| ----------------------- | ----: | -----: | ---------: | --: | -------: | ------------: | ---: |
| create                  | 40001 | 260.90 |    8013.02 |  31 |    639.8 |        8354.9 | 13.1 |
| append1                 |     5 |   4.03 |      97.24 |  24 |     38.6 |         121.4 |  3.1 |
| append1k                |  4001 |   9.60 |     196.78 |  20 |     96.7 |         253.3 |  2.6 |
| insert1                 |     5 |   6.39 |      98.74 |  15 |     49.7 |         126.2 |  2.5 |
| insertEvery2nd          | 20001 |  30.59 |     318.46 |  10 |    284.7 |         528.7 |  1.9 |
| updateText1             |     1 |   5.20 |     100.87 |  19 |     39.6 |         124.0 |  3.1 |
| updateTextEvery2nd      |  5000 |  21.26 |     245.97 |  12 |    190.6 |         391.8 |  2.1 |
| updateColor1            |     1 |   6.38 |      86.56 |  14 |     23.8 |          98.4 |  4.1 |
| updateColorEvery2nd     |  5000 |  25.14 |     257.36 |  10 |     54.2 |         266.7 |  4.9 |
| updateTextColor1        |     1 |   5.95 |      85.93 |  14 |     25.5 |          97.6 |  3.8 |
| updateTextColorEvery2nd |  5000 |  23.58 |     251.36 |  11 |     58.0 |         260.3 |  4.5 |
| swap1                   |  9997 | 276.30 |    7106.71 |  26 |    318.4 |        7133.4 | 22.4 |
| swapEvery2nd            |  5000 |   9.21 |     103.63 |  11 |     46.3 |         133.1 |  2.9 |
| remove1                 |     2 |   7.59 |      95.42 |  13 |     56.3 |         123.2 |  2.2 |
| removeEvery2nd          |  5000 |   9.29 |      92.30 |  10 |     83.5 |         115.6 |  1.4 |
| clear                   | 10001 |   9.16 |     104.17 |  11 |     63.7 |         100.2 |  1.6 |

`flushMs` is the `JSON.stringify` of a batch plus its decode in Rust, and
both engines run the stringify natively. On ops of 500 or more it is 2.3–5×
slower on QuickJS, so the JSON boundary is not where QuickJS loses time.

A surgical op on the 10k table costs ~100 ms of JS on QuickJS. React
re-renders the 10k-child list to find the one changed row, about 10 µs per
row. The table's rows are memoized, so this cost comes from reconciling the
list itself, not from re-rendering the rows.

`swap1` is React's far-swap, which emits a move for nearly every row, so it
costs as much as a create.

A full capture takes 91 s on V8 and 471 s on QuickJS. Most of the difference
is the 10k `create`/`swap1` iterations.

With QuickJS's C `assert`s left on (rquickjs's default, `NDEBUG` unset), JS
was a further ~15% slower. The workspace enables `disable-assertions`.

## Frame rate (`layers-stress`)

Command: `cargo run --release -p layers-stress -- --measure 15 --engine <e>`,
500 cards, with the scenario baked in by `STRESS_PRESET`. The values are the
smoothed FPS over the last 8 seconds of two runs.

- **Rust-driven animation, JS idle** (`{"n":500,"animate":true}`): V8 223–240
  and QuickJS 227–250 FPS. The engine plays no part in a frame that JS does
  not touch.
- **Static blur on every card** (`"filterMode":"all","blur":true`): ~490 FPS
  on V8 and ~510 on QuickJS.
- **A JS `setInterval` re-rendering all 500 cards every 16 ms** (animated blur
  radius, `"animateFilter":true`): V8 reads 27–50 FPS and QuickJS 43–480. The
  two are not comparable. On V8 every interval lands, and Bevy's re-run of
  500 blur chains is the bottleneck. On QuickJS the 500-card re-render takes
  longer than the interval, so the blur updates much less often. The frames
  in between are cheap, and the animation is visibly choppier. Expect this in
  any per-frame JS animation of a large tree. Bevy-side animation (`{
animated }` bindings, transitions) does not involve the engine.

## Memory

The values are peak RSS of the whole process.

- **table-ops (10k rows):** V8 1389 MB, QuickJS 1204–1225 MB.
- **`layers-stress`, JS idle:** V8 632–678 MB, QuickJS 574–603 MB.
- **`layers-stress`, static blur:** V8 855 MB, QuickJS 733 MB.

QuickJS's own heap (`memory_usage`) stayed at about 25 MB in the
animated-blur scenario.

Separately, that scenario grows RSS on both engines to several GB: ~3 GB on
V8 and ~8.6 GB on QuickJS within 13 s. The growth is not in the JS heap.
Static blur does not grow at all, so the leak is on the Bevy side, in the path
of changing filter params. It is filed in `TODO`.

## Reproducing

```sh
npm run build:prod -w stress-app
cargo run --release -p stress -- --run table-ops --out benchmark_results/v8.json --engine v8
cargo run --release -p stress -- --run table-ops --out benchmark_results/quickjs.json --engine quickjs

STRESS_PRESET='{"n":500,"animate":true}' npm run build:prod -w layers-stress-app
cargo run --release -p layers-stress -- --measure 15 --engine quickjs
npm run build -w layers-stress-app   # restore the committed preset

# startup
cargo run --release -p stress -- --engine quickjs   # logs "QuickJS-ng … ready in … ms"
```

Run each capture twice, as the frame floor can pin a run (see the README).
