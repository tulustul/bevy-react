import type { BevyMorphFilters } from "bevy-react";
import {
  checkbox,
  slider,
  type ParamSpecs,
  type ParamValues,
} from "@/components";

/** A `morphFilter` value minus the key — one tile's name + params, typed
 * over the morph-filter registry (separate from the regular `filter`
 * family). Params are individually optional, like `MorphFilterValue`
 * itself — omitted params ride their Rust-side `#[serde(default)]`s. */
export type MorphUse = {
  [K in keyof BevyMorphFilters]: {
    name: K;
    params?: { [P in keyof BevyMorphFilters[K]]?: BevyMorphFilters[K][P] };
  };
}[keyof BevyMorphFilters];

export type MorphEasing = "linear" | "easeIn" | "easeOut" | "easeInOut";

export type FilterEntry = {
  label: string;
  /** Each tile owns its timing — hand-tuned per filter, tweak freely.
   * `duration` (ms) seeds the tile's duration slider. */
  duration: number;
  easing: MorphEasing;
  /** The tile's knobs, keyed by name — rendered by `<ParamControls>`. */
  controls: ParamSpecs;
  /** Builds the tile's `{ name, params }` from the control values. Params the
   * controls don't cover stay at the filter's Rust-side defaults. */
  use: (values: ParamValues<ParamSpecs>) => MorphUse;
};

/** Preserves each entry's own `controls` shape for its `use` callback — the
 * array they land in erases it back to the uniform `FilterEntry`. */
const entry = <T extends ParamSpecs>(e: {
  label: string;
  duration: number;
  easing: MorphEasing;
  controls: T;
  use: (values: ParamValues<T>) => MorphUse;
}): FilterEntry => e as unknown as FilterEntry;

// The three morph-capable built-ins shipped by bevy-react itself.
export const BUILTIN_TRANSITIONS: FilterEntry[] = [
  entry({
    label: "crossfade",
    duration: 300,
    easing: "linear",
    // `spread` staggers the per-region timing (0 = uniform crossfade),
    // `scale` is the noise feature size in logical px.
    controls: {
      spread: slider(0, 1, 0.6),
      scale: slider(8, 200, 40),
      softness: slider(0, 1, 1),
      seed: slider(0, 10, 0),
    },
    use: (params) => ({ name: "crossfade", params }),
  }),
  entry({
    label: "linearWipe",
    duration: 800,
    easing: "linear",
    controls: { angle: slider(0, 360, 45), softness: slider(0, 100, 60) },
    use: (params) => ({ name: "linearWipe", params }),
  }),
  entry({
    label: "pixelize",
    duration: 1200,
    easing: "linear",
    controls: { squares: slider(4, 64, 20), steps: slider(0, 50, 50) },
    use: ({ squares, steps }) => ({
      name: "pixelize",
      params: { squaresMin: [squares, squares], steps },
    }),
  }),
];

// The gl-transitions pack (ports registered in `examples/demos/filters.rs`,
// shaders in `examples/assets/shaders/morphs/`). Color-only filters
// (circleCrop, burn0) keep their defaults — no controls.
export const CUSTOM_MORPHS: FilterEntry[] = [
  entry({
    label: "windowslice",
    duration: 800,
    easing: "linear",
    controls: { count: slider(2, 40, 10), smoothness: slider(0, 1, 0.5) },
    use: (params) => ({ name: "windowslice", params }),
  }),
  entry({
    label: "radial",
    duration: 800,
    easing: "linear",
    // `smoothness` is an Angle param: bare wire numbers are DEGREES (the
    // shader's soft edge is radians-scale, upstream default 1 rad = 57deg).
    controls: { smoothness: slider(0, 180, 57) },
    use: (params) => ({ name: "radial", params }),
  }),
  entry({
    label: "polkaDotsCurtain",
    duration: 1500,
    easing: "linear",
    controls: { dots: slider(2, 60, 15), center: slider(0, 1, 0) },
    use: ({ dots, center }) => ({
      name: "polkaDotsCurtain",
      params: { dots, center: [center, center] },
    }),
  }),
  entry({
    label: "circleCrop",
    duration: 800,
    easing: "linear",
    controls: {},
    use: () => ({ name: "circleCrop" }),
  }),
  entry({
    label: "curtain",
    duration: 1000,
    easing: "easeOut",
    controls: { vertical: checkbox(), close: checkbox() },
    // These two are numeric 0/1 flags on the Rust side, not bools.
    use: ({ vertical, close }) => ({
      name: "curtainOpen",
      params: { vertical: Number(vertical), close: Number(close) },
    }),
  }),
  entry({
    label: "burn",
    duration: 900,
    easing: "linear",
    controls: {},
    use: () => ({ name: "burn0" }),
  }),
  entry({
    label: "tilesWave",
    duration: 900,
    easing: "linear",
    controls: {
      tiles: slider(2, 24, 8),
      flipy: checkbox(false, { label: "flip y" }),
    },
    use: ({ tiles, flipy }) => ({
      name: "tilesWave",
      params: { tiles: [tiles, tiles], flipy: Number(flipy) },
    }),
  }),
  entry({
    label: "gridFlip",
    duration: 1500,
    easing: "linear",
    controls: { size: slider(2, 12, 6), randomness: slider(0, 1, 0.1) },
    use: ({ size, randomness }) => ({
      name: "gridFlip",
      params: { size: [size, size], randomness },
    }),
  }),
  entry({
    label: "doorway",
    duration: 1000,
    easing: "easeInOut",
    controls: { perspective: slider(0, 1, 0.5), depth: slider(1, 10, 3) },
    use: (params) => ({ name: "doorway", params }),
  }),
  entry({
    label: "bookFlip",
    duration: 1200,
    easing: "easeInOut",
    controls: {},
    use: () => ({ name: "bookFlip" }),
  }),
  entry({
    label: "powerKaleido",
    duration: 1500,
    easing: "easeInOut",
    controls: {
      scale: slider(0.5, 6, 2, { decimals: 1 }),
      speed: slider(0, 15, 5),
    },
    use: (params) => ({ name: "powerKaleido", params }),
  }),
  entry({
    label: "stripDatamoshGlitch",
    duration: 700,
    easing: "linear",
    controls: {
      strength: slider(0, 3, 1, { decimals: 1 }),
      bars: slider(4, 100, 42),
    },
    use: (params) => ({ name: "stripDatamoshGlitch", params }),
  }),
  entry({
    label: "filmBurn",
    duration: 1200,
    easing: "easeInOut",
    controls: { seed: slider(0, 10, 2.31, { decimals: 1 }) },
    use: (params) => ({ name: "filmBurn", params }),
  }),
  entry({
    label: "invertedPageCurl",
    duration: 1600,
    easing: "linear",
    controls: {},
    use: () => ({ name: "invertedPageCurl" }),
  }),
  entry({
    label: "dustify",
    duration: 2000,
    easing: "linear",
    // `wind` is relative to `direction` (0 = downwind with the sweep);
    // softness min 10 sidesteps the degenerate hard-edge (no flight) case.
    controls: {
      direction: slider(0, 360, 0),
      softness: slider(10, 500, 160),
      turbulence: slider(0, 1, 0.5),
      wind: slider(-180, 180, -180),
      drift: slider(0, 300, 60),
      grain: slider(2, 24, 7),
      raggedness: slider(0, 5, 0.6, { decimals: 2 }),
      evolution: slider(0, 5, 1, { decimals: 2 }),
    },
    use: (params) => ({ name: "dustify", params }),
  }),
];
