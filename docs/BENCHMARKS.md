# Benchmarks

Executed against commit 9643efacc87bbdbeeefaf86741d716a2c4273032

Spec: AMD Ryzen 7 5800X 8-Core, 32GB, GeForce RTX 3070

Rows manipulations benchmark:

`npm run build:prod -w stress-app`

`cargo run --release -p bevy-react --example stress -- --run table-ops --out benchmark_results/results.json`

## Median per op — 1k table (p50, ms)

| Op | Rows | Ops Emitted | Total | Pre-apply | JS | Flush | Translate | Command | Layout | Bevy |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| create | 0 | 4001 | 50.748 | 14.131 | 13.000 | 9.000 | 3.505 | 22.241 | 10.612 | 32.723 |
| append1 | 1000 | 5 | 2.541 | 0.771 | 0.000 | 0.000 | 0.015 | 0.527 | 1.167 | 1.698 |
| append1k | 1001 | 4001 | 52.087 | 14.260 | 14.000 | 9.000 | 3.714 | 22.134 | 12.207 | 34.536 |
| insert1 | 1000 | 5 | 2.800 | 0.898 | 1.000 | 0.000 | 0.147 | 0.499 | 1.221 | 1.712 |
| insertEvery2nd | 1001 | 2001 | 28.086 | 7.576 | 7.000 | 5.000 | 2.084 | 11.579 | 7.068 | 18.577 |
| updateText1 | 1000 | 1 | 2.488 | 0.865 | 1.000 | 0.000 | 0.002 | 0.395 | 1.146 | 1.524 |
| updateTextEvery2nd | 1000 | 500 | 14.061 | 2.357 | 2.000 | 0.000 | 0.047 | 6.968 | 4.674 | 11.660 |
| updateColor1 | 1000 | 1 | 1.636 | 0.749 | 0.000 | 0.000 | 0.010 | 0.347 | 0.520 | 0.863 |
| updateColorEvery2nd | 1000 | 500 | 5.836 | 4.351 | 4.000 | 2.000 | 0.634 | 0.414 | 0.480 | 0.881 |
| swap1 | 1000 | 997 | 6.263 | 4.328 | 4.000 | 1.000 | 0.342 | 0.380 | 1.151 | 1.553 |
| swapEvery2nd | 1000 | 500 | 4.554 | 2.683 | 1.000 | 1.000 | 0.208 | 0.381 | 1.260 | 1.643 |
| remove1 | 1000 | 2 | 2.481 | 0.766 | 0.000 | 0.000 | 0.009 | 0.483 | 1.229 | 1.714 |
| removeEvery2nd | 999 | 500 | 6.343 | 2.399 | 1.000 | 1.000 | 0.785 | 2.045 | 1.161 | 3.198 |
| clear | 1000 | 1001 | 7.794 | 2.720 | 2.000 | 1.000 | 1.426 | 3.250 | 0.528 | 3.775 |

## Median per op — 10k table (p50, ms)

| Op | Rows | Ops Emitted | Total | Pre-apply | JS | Flush | Translate | Command | Layout | Bevy |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| create | 0 | 40001 | 719.452 | 325.401 | 325.000 | 87.000 | 68.097 | 218.069 | 116.840 | 335.266 |
| append1 | 10000 | 5 | 23.949 | 5.491 | 4.000 | 0.000 | 0.017 | 1.971 | 16.225 | 18.437 |
| append1k | 10001 | 4001 | 74.617 | 20.489 | 15.000 | 8.000 | 4.023 | 23.920 | 25.823 | 49.810 |
| insert1 | 10000 | 5 | 39.530 | 19.799 | 6.000 | 0.000 | 0.867 | 1.750 | 16.684 | 18.763 |
| insertEvery2nd | 10001 | 20001 | 287.919 | 70.335 | 65.000 | 45.000 | 29.860 | 110.117 | 74.484 | 185.034 |
| updateText1 | 10000 | 1 | 23.534 | 5.696 | 5.000 | 0.000 | 0.002 | 1.168 | 16.175 | 17.361 |
| updateTextEvery2nd | 10000 | 5000 | 159.482 | 36.749 | 24.000 | 6.000 | 0.321 | 65.957 | 54.906 | 121.277 |
| updateColor1 | 10000 | 1 | 15.556 | 5.628 | 5.000 | 0.000 | 0.012 | 1.182 | 8.526 | 9.710 |
| updateColorEvery2nd | 10000 | 5000 | 70.210 | 54.242 | 41.000 | 19.000 | 5.823 | 2.261 | 7.788 | 10.028 |
| swap1 | 10000 | 9997 | 377.288 | 356.773 | 355.000 | 11.000 | 2.714 | 1.967 | 15.872 | 17.827 |
| swapEvery2nd | 10000 | 5000 | 42.965 | 22.740 | 13.000 | 5.000 | 1.818 | 1.772 | 16.329 | 18.044 |
| remove1 | 10000 | 2 | 38.643 | 20.145 | 6.000 | 0.000 | 0.010 | 1.883 | 16.300 | 18.092 |
| removeEvery2nd | 9999 | 5000 | 94.403 | 20.722 | 11.000 | 5.000 | 6.367 | 33.634 | 33.003 | 66.428 |
| clear | 10000 | 10001 | 100.565 | 21.831 | 14.000 | 8.000 | 15.818 | 57.024 | 5.356 | 62.324 |

### Legend

All timings are the **median (p50)** over the samples, in **milliseconds**.

| Column | Meaning |
| --- | --- |
| **Op** | The operation under test (create, swap1, removeEvery2nd, …). |
| **Rows** | Table row count when the op ran (its precondition). |
| **Ops Emitted** | Size of the flushed op batch React produced for one occurrence of this op. |
| **Total** | End-to-end wall time, event trigger → post-layout on the frame the batch applied. Equals `Pre-apply + Translate + Bevy`. |
| **Pre-apply** | Trigger → Bevy starts applying the batch. Covers the JS round-trip + inter-thread scheduling. Contains **JS**. |
| **JS** | React reconcile + build the op batch + the `op_flush` call (measured on the JS thread). Subset of **Pre-apply**; contains **Flush**. |
| **Flush** | The `op_flush` native call alone = `serde_v8` decode of the batch. Subset of **JS**. |
| **Translate** | `apply_js_ops` walks the op batch → queues ECS commands (Bevy side). |
| **Command** | Execute the queued ECS commands + UI prepare/content, before layout. |
| **Layout** | `bevy_ui` layout: taffy solve + transform/clip propagation. |
| **Bevy** | Apply done → post-layout, same frame. Full post-translate Bevy wall time; ≈ `Command + Layout`. |