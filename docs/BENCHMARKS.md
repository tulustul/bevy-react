# Benchmarks

Executed against commit ff6287785958e14b752d78fae5cd43d47e760b64

Spec: AMD Ryzen 7 5800X 8-Core, 32GB, GeForce RTX 3070

Rows manipulations benchmark:

`npm run build:prod -w stress-app`

`cargo run --release -p bevy-react --example stress -- --run table-ops --out benchmark_results/results.json`

## Median per op — 1k table (p50, ms)

| Op                  | Rows | Ops Emitted |  Total | Pre-apply |     JS |  Flush | Translate | Command | Layout |   Bevy |
| ------------------- | ---: | ----------: | -----: | --------: | -----: | -----: | --------: | ------: | -----: | -----: |
| create              |    0 |        4001 | 51.594 |    16.948 | 14.000 | 10.000 |     3.413 |  20.821 | 10.621 | 31.477 |
| append1             | 1000 |           5 |  2.388 |     0.736 |  1.000 |  0.000 |     0.011 |   0.412 |  1.194 |  1.585 |
| append1k            | 1001 |        4001 | 53.300 |    16.410 | 14.000 | 10.000 |     3.408 |  20.646 | 12.343 | 33.427 |
| insert1             | 1000 |           5 |  2.799 |     0.733 |  1.000 |  0.000 |     0.150 |   0.438 |  1.251 |  1.714 |
| insertEvery2nd      | 1001 |        2001 | 27.800 |     8.245 |  7.000 |  5.000 |     1.901 |  10.478 |  7.337 | 17.689 |
| updateText1         | 1000 |           1 |  2.415 |     0.813 |  1.000 |  0.000 |     0.001 |   0.357 |  1.249 |  1.597 |
| updateTextEvery2nd  | 1000 |         500 | 15.919 |     4.040 |  2.000 |  1.000 |     0.154 |   6.793 |  4.918 | 11.711 |
| updateColor1        | 1000 |           1 |  1.635 |     0.807 |  1.000 |  0.000 |     0.007 |   0.302 |  0.503 |  0.815 |
| updateColorEvery2nd | 1000 |         500 |  5.712 |     4.346 |  4.000 |  2.000 |     0.471 |   0.354 |  0.509 |  0.859 |
| swap1               | 1000 |         997 |  8.332 |     6.204 |  4.000 |  2.000 |     0.585 |   0.281 |  1.302 |  1.590 |
| swapEvery2nd        | 1000 |         500 |  4.798 |     2.868 |  2.000 |  1.000 |     0.362 |   0.306 |  1.239 |  1.566 |
| remove1             | 1000 |           2 |  2.351 |     0.734 |  1.000 |  0.000 |     0.006 |   0.332 |  1.222 |  1.571 |
| removeEvery2nd      |  999 |         500 |  6.437 |     2.478 |  2.000 |  1.000 |     0.850 |   1.924 |  1.189 |  3.116 |
| clear               | 1000 |        1001 |  8.286 |     3.145 |  2.000 |  2.000 |     1.486 |   3.134 |  0.545 |  3.636 |

## Median per op — 10k table (p50, ms)

| Op                  |  Rows | Ops Emitted |   Total | Pre-apply |      JS |   Flush | Translate | Command |  Layout |    Bevy |
| ------------------- | ----: | ----------: | ------: | --------: | ------: | ------: | --------: | ------: | ------: | ------: |
| create              |     0 |       40001 | 946.609 |   557.429 | 458.000 | 173.000 |    50.832 | 200.118 | 117.214 | 318.829 |
| append1             | 10000 |           5 |  23.485 |     5.438 |   4.000 |   0.000 |     0.012 |   1.197 |  16.817 |  18.020 |
| append1k            | 10001 |        4001 |  77.128 |    23.464 |  16.000 |   9.000 |     3.834 |  21.846 |  26.595 |  48.454 |
| insert1             | 10000 |           5 |  37.715 |    19.143 |   6.000 |   0.000 |     0.916 |   1.289 |  16.936 |  18.339 |
| insertEvery2nd      | 10001 |       20001 | 373.027 |   166.965 | 110.000 |  89.000 |    26.011 | 101.702 |  77.451 | 178.360 |
| updateText1         | 10000 |           1 |  23.840 |     5.626 |   5.000 |   0.000 |     0.002 |   1.153 |  16.655 |  17.812 |
| updateTextEvery2nd  | 10000 |        5000 | 162.128 |    40.093 |  26.000 |   9.000 |     1.431 |  66.112 |  55.697 | 121.811 |
| updateColor1        | 10000 |           1 |  15.565 |     5.794 |   5.000 |   0.000 |     0.008 |   1.092 |   8.630 |   9.761 |
| updateColorEvery2nd | 10000 |        5000 |  69.458 |    55.130 |  40.000 |  19.000 |     4.471 |   1.923 |   8.284 |  10.103 |
| swap1               | 10000 |        9997 | 415.951 |   391.249 | 352.000 |  35.000 |     7.378 |   1.467 |  16.132 |  17.601 |
| swapEvery2nd        | 10000 |        5000 |  46.682 |    25.579 |  15.000 |   7.000 |     3.403 |   1.424 |  16.357 |  17.764 |
| remove1             | 10000 |           2 |  37.275 |    19.808 |   6.000 |   0.000 |     0.008 |   1.207 |  16.855 |  17.967 |
| removeEvery2nd      |  9999 |        5000 |  93.248 |    23.763 |  14.000 |   7.000 |     6.572 |  32.544 |  29.986 |  62.679 |
| clear               | 10000 |       10001 | 142.168 |    64.751 |  41.000 |  34.000 |    15.344 |  55.915 |   5.778 |  61.152 |

## Legend

| Column          | Meaning                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Op**          | The operation under test (create1k, swap, clear, …).                                                                                 |
| **Ops Emitted** | Size of the flushed op batch React produced                                                                                          |
| **Total**       | End-to-end wall time, event trigger → change detected. Equals `Pre-apply + Translate + Bevy`.                                        |
| **Pre-apply**   | Trigger → Bevy starts applying the batch. Covers the JS round-trip + inter-thread scheduling. Contains **JS**.                       |
| **JS**          | React reconcile + build the op batch + the `op_flush` call (measured on the JS thread). Subset of **Pre-apply**; contains **Flush**. |
| **Flush**       | The `op_flush` native call alone = `serde_v8` decode of the batch. Subset of **JS**.                                                 |
| **Translate**   | `apply_js_ops` walks the op batch → queues ECS commands (Bevy side).                                                                 |
| **Command**     | Execute the queued ECS commands + UI prepare/content, before layout.                                                                 |
| **Layout**      | `bevy_ui` layout: taffy solve + transform/clip propagation.                                                                          |
| **Bevy**        | Apply done → change detected. Full post-translate Bevy wall time; ≈ `Command + Layout`.                                              |
