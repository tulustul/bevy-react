# Performance

Executed against commit 00ec3f927c7084b211192b24c8f4f034dfdf8de4

Spec: AMD Ryzen 7 5800X 8-Core, 32GB, GeForce RTX 3070

Rows manipulations benchmark:

`npm run build:prod -w stress-app`

`cargo run --release -p stress -- --run table-ops --out benchmark_results/results.json`

## Median per op — 1k table (p50, ms)

| Op                      | Rows | Ops Emitted |  Total | Pre-apply |    JS | Flush | Translate | Command | Layout |   Bevy |
| ----------------------- | ---: | ----------: | -----: | --------: | ----: | ----: | --------: | ------: | -----: | -----: |
| create                  |    0 |        4001 | 36.262 |     6.620 | 5.877 | 2.268 |     1.570 |  17.769 | 10.555 | 28.522 |
| append1                 | 1000 |           5 |  3.708 |     1.522 | 0.488 | 0.028 |     0.014 |   0.560 |  1.667 |  2.282 |
| append1k                | 1001 |        4001 | 39.270 |     7.008 | 5.334 | 1.962 |     1.532 |  18.226 | 12.737 | 30.926 |
| insert1                 | 1000 |           5 |  3.859 |     1.543 | 0.544 | 0.027 |     0.016 |   0.582 |  1.590 |  2.196 |
| insertEvery2nd          | 1001 |        2001 | 22.365 |     4.362 | 2.742 | 1.004 |     1.024 |   9.376 |  7.627 | 16.842 |
| updateText1             | 1000 |           1 |  3.537 |     1.568 | 0.547 | 0.015 |     0.002 |   0.418 |  1.578 |  2.042 |
| updateTextEvery2nd      | 1000 |         500 | 15.012 |     1.956 | 1.347 | 0.232 |     0.052 |   7.294 |  5.460 | 12.845 |
| updateColor1            | 1000 |           1 |  2.990 |     1.796 | 0.671 | 0.018 |     0.011 |   0.364 |  0.692 |  1.091 |
| updateColorEvery2nd     | 1000 |         500 |  6.080 |     4.506 | 2.169 | 0.457 |     0.438 |   0.395 |  0.635 |  1.044 |
| updateTextColor1        | 1000 |           1 |  2.892 |     1.776 | 0.581 | 0.015 |     0.009 |   0.374 |  0.704 |  1.095 |
| updateTextColorEvery2nd | 1000 |         500 |  6.239 |     4.664 | 2.106 | 0.380 |     0.519 |   0.366 |  0.674 |  1.047 |
| swap1                   | 1000 |         997 |  6.968 |     4.839 | 3.988 | 0.244 |     0.339 |   0.402 |  1.589 |  2.039 |
| swapEvery2nd            | 1000 |         500 |  4.154 |     1.810 | 0.800 | 0.116 |     0.205 |   0.434 |  1.699 |  2.141 |
| remove1                 | 1000 |           2 |  3.587 |     1.477 | 0.553 | 0.012 |     0.008 |   0.524 |  1.529 |  2.050 |
| removeEvery2nd          |  999 |         500 |  6.126 |     1.500 | 0.697 | 0.105 |     0.583 |   2.611 |  1.369 |  4.053 |
| clear                   | 1000 |        1001 |  7.366 |     1.828 | 0.888 | 0.183 |     1.050 |   3.697 |  0.620 |  4.346 |

## Median per op — 10k table (p50, ms)

| Op                      |  Rows | Ops Emitted |   Total | Pre-apply |      JS |  Flush | Translate | Command |  Layout |    Bevy |
| ----------------------- | ----: | ----------: | ------: | --------: | ------: | -----: | --------: | ------: | ------: | ------: |
| create                  |     0 |       40001 | 589.450 |   257.961 | 257.043 | 18.469 |    12.116 | 183.074 | 135.874 | 319.234 |
| append1                 | 10000 |           5 |  33.458 |     9.540 |   3.678 |  0.029 |     0.016 |   2.599 |  21.331 |  24.009 |
| append1k                | 10001 |        4001 |  80.882 |    29.466 |  10.141 |  1.989 |     1.665 |  20.201 |  29.239 |  50.093 |
| insert1                 | 10000 |           5 |  32.902 |     9.845 |   5.084 |  0.029 |     0.019 |   2.669 |  20.608 |  23.309 |
| insertEvery2nd          | 10001 |       20001 | 247.329 |    51.068 |  35.933 |  9.195 |     8.617 |  92.942 |  95.609 | 188.100 |
| updateText1             | 10000 |           1 |  32.277 |    10.040 |   3.935 |  0.016 |     0.003 |   1.796 |  20.380 |  22.170 |
| updateTextEvery2nd      | 10000 |        5000 | 167.710 |    29.546 |  14.427 |  1.826 |     0.271 |  68.269 |  69.434 | 137.666 |
| updateColor1            | 10000 |           1 |  21.942 |    10.743 |   3.963 |  0.019 |     0.012 |   1.557 |   9.896 |  11.391 |
| updateColorEvery2nd     | 10000 |        5000 |  49.776 |    32.718 |  20.394 |  3.269 |     3.781 |   2.231 |   9.885 |  12.243 |
| updateTextColor1        | 10000 |           1 |  24.128 |    12.535 |   4.256 |  0.019 |     0.013 |   1.521 |  10.233 |  11.808 |
| updateTextColorEvery2nd | 10000 |        5000 |  52.616 |    36.475 |  18.460 |  2.987 |     4.001 |   1.831 |  10.086 |  11.932 |
| swap1                   | 10000 |        9997 | 383.129 |   358.694 | 349.851 |  2.294 |     2.330 |   2.192 |  21.369 |  23.646 |
| swapEvery2nd            | 10000 |        5000 |  40.272 |    13.907 |   8.048 |  1.153 |     1.646 |   2.669 |  22.719 |  25.371 |
| remove1                 | 10000 |           2 |  33.519 |     9.994 |   4.747 |  0.013 |     0.009 |   2.532 |  20.886 |  23.424 |
| removeEvery2nd          |  9999 |        5000 |  54.059 |     9.524 |   8.835 |  0.862 |     4.337 |  24.509 |  15.562 |  40.423 |
| clear                   | 10000 |       10001 |  61.935 |    11.872 |   7.003 |  1.728 |     8.166 |  36.309 |   5.366 |  41.818 |

### Legend

All timings are the **median (p50)** over the samples, in **milliseconds**.

| Column          | Meaning                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Op**          | The operation under test (create, swap1, removeEvery2nd, …).                                                                         |
| **Rows**        | Table row count when the op ran (its precondition).                                                                                  |
| **Ops Emitted** | Size of the flushed op batch React produced for one occurrence of this op.                                                           |
| **Total**       | End-to-end wall time, event trigger → post-layout on the frame the batch applied. Equals `Pre-apply + Translate + Bevy`.             |
| **Pre-apply**   | Trigger → Bevy starts applying the batch. Covers the JS round-trip + inter-thread scheduling. Contains **JS**.                       |
| **JS**          | React reconcile + build the op batch + the `op_flush` call (measured on the JS thread). Subset of **Pre-apply**; contains **Flush**. |
| **Flush**       | The `op_flush` native call alone = `JSON.stringify` of the batch + its `serde_json` decode. Subset of **JS**.                        |
| **Translate**   | `apply_js_ops` walks the op batch → queues ECS commands (Bevy side).                                                                 |
| **Command**     | Execute the queued ECS commands + UI prepare/content, before layout.                                                                 |
| **Layout**      | `bevy_ui` layout: taffy solve + transform/clip propagation.                                                                          |
| **Bevy**        | Apply done → post-layout, same frame. Full post-translate Bevy wall time; ≈ `Command + Layout`.                                      |
