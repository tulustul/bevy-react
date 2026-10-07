# Performance

Executed against commit 0bf47bec129ad3f2ae42ffcc73c031b416df6dbe

Spec: AMD Ryzen 7 5800X 8-Core, 32GB, GeForce RTX 3070

Rows manipulations benchmark:

`npm run build:prod -w stress-app`

`cargo run --release -p stress -- --run table-ops --out benchmark_results/results.json`

## Median per op — 1k table (p50, ms)

| Op | Rows | Ops Emitted | Total | Pre-apply | JS | Flush | Translate | Command | Layout | Bevy |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| create | 0 | 4001 | 35.532 | 6.855 | 5.880 | 2.359 | 1.573 | 17.221 | 10.294 | 27.533 |
| append1 | 1000 | 5 | 2.717 | 0.884 | 0.472 | 0.026 | 0.013 | 0.549 | 1.215 | 1.767 |
| append1k | 1001 | 4001 | 37.781 | 7.236 | 5.649 | 2.080 | 1.755 | 17.395 | 11.199 | 28.533 |
| insert1 | 1000 | 5 | 3.859 | 2.363 | 0.675 | 0.029 | 0.015 | 0.547 | 1.178 | 1.726 |
| insertEvery2nd | 1001 | 2001 | 20.494 | 4.157 | 2.647 | 1.031 | 1.005 | 8.844 | 6.379 | 15.277 |
| updateText1 | 1000 | 1 | 2.410 | 0.749 | 0.508 | 0.017 | 0.002 | 0.368 | 1.215 | 1.608 |
| updateTextEvery2nd | 1000 | 500 | 14.139 | 2.565 | 1.390 | 0.214 | 0.046 | 7.011 | 4.732 | 11.673 |
| updateColor1 | 1000 | 1 | 1.873 | 0.937 | 0.575 | 0.017 | 0.010 | 0.341 | 0.562 | 0.903 |
| updateColorEvery2nd | 1000 | 500 | 4.173 | 2.860 | 1.853 | 0.369 | 0.452 | 0.385 | 0.519 | 0.880 |
| updateTextColor1 | 1000 | 1 | 1.991 | 0.975 | 0.523 | 0.013 | 0.008 | 0.323 | 0.526 | 0.885 |
| updateTextColorEvery2nd | 1000 | 500 | 4.155 | 2.704 | 2.027 | 0.398 | 0.484 | 0.345 | 0.528 | 0.874 |
| swap1 | 1000 | 997 | 6.316 | 4.412 | 2.754 | 0.226 | 0.325 | 0.391 | 1.135 | 1.519 |
| swapEvery2nd | 1000 | 500 | 4.058 | 2.564 | 0.762 | 0.131 | 0.201 | 0.379 | 1.252 | 1.616 |
| remove1 | 1000 | 2 | 2.488 | 0.812 | 0.585 | 0.011 | 0.008 | 0.455 | 1.177 | 1.643 |
| removeEvery2nd | 999 | 500 | 4.500 | 0.844 | 0.716 | 0.106 | 0.566 | 1.973 | 0.956 | 2.876 |
| clear | 1000 | 1001 | 5.584 | 1.010 | 0.866 | 0.184 | 1.039 | 2.859 | 0.595 | 3.376 |

## Median per op — 10k table (p50, ms)

| Op | Rows | Ops Emitted | Total | Pre-apply | JS | Flush | Translate | Command | Layout | Bevy |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| create | 0 | 40001 | 512.458 | 212.153 | 211.947 | 19.124 | 12.865 | 171.523 | 116.635 | 287.014 |
| append1 | 10000 | 5 | 25.809 | 6.760 | 3.696 | 0.031 | 0.019 | 2.856 | 16.631 | 19.522 |
| append1k | 10001 | 4001 | 68.300 | 20.899 | 8.738 | 2.032 | 1.831 | 19.224 | 25.906 | 45.300 |
| insert1 | 10000 | 5 | 28.476 | 5.866 | 4.795 | 0.031 | 0.024 | 2.873 | 19.919 | 22.749 |
| insertEvery2nd | 10001 | 20001 | 209.431 | 37.634 | 28.336 | 10.214 | 8.588 | 87.454 | 75.246 | 161.702 |
| updateText1 | 10000 | 1 | 24.239 | 6.132 | 5.110 | 0.018 | 0.002 | 1.378 | 15.904 | 17.377 |
| updateTextEvery2nd | 10000 | 5000 | 144.729 | 23.324 | 17.594 | 1.944 | 0.401 | 68.152 | 53.439 | 121.359 |
| updateColor1 | 10000 | 1 | 30.160 | 21.226 | 6.367 | 0.020 | 0.013 | 1.384 | 8.710 | 10.098 |
| updateColorEvery2nd | 10000 | 5000 | 50.424 | 36.744 | 23.959 | 3.860 | 3.928 | 1.798 | 7.849 | 9.552 |
| updateTextColor1 | 10000 | 1 | 31.426 | 21.746 | 6.450 | 0.019 | 0.013 | 1.195 | 8.344 | 9.505 |
| updateTextColorEvery2nd | 10000 | 5000 | 38.683 | 25.464 | 22.787 | 2.844 | 3.929 | 1.872 | 8.321 | 10.192 |
| swap1 | 10000 | 9997 | 296.052 | 275.031 | 267.075 | 2.405 | 2.773 | 2.355 | 16.582 | 18.772 |
| swapEvery2nd | 10000 | 5000 | 43.390 | 22.516 | 10.010 | 1.092 | 1.780 | 1.998 | 17.220 | 19.220 |
| remove1 | 10000 | 2 | 26.969 | 6.414 | 5.734 | 0.013 | 0.012 | 2.736 | 17.533 | 20.334 |
| removeEvery2nd | 9999 | 5000 | 54.743 | 20.908 | 7.455 | 0.992 | 4.260 | 19.777 | 10.091 | 29.888 |
| clear | 10000 | 10001 | 48.224 | 6.450 | 8.964 | 1.809 | 8.885 | 27.417 | 5.704 | 32.869 |

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
