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
