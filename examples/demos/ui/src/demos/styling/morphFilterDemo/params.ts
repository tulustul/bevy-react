import type { BevyMorphFilters } from "bevy-react";

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

export type ParamControl = {
  kind: "slider" | "checkbox"; // checkbox stores 0|1 in the values array
  label: string;
  min?: number; // slider only
  max?: number;
  initial: number;
  decimals?: number; // slider label formatting, default 0
};

export type FilterEntry = {
  label: string;
  /** Each tile owns its timing — hand-tuned per filter, tweak freely.
   * `duration` (ms) seeds the tile's duration slider. */
  duration: number;
  easing: MorphEasing;
  controls: ParamControl[];
  /** Builds the tile's `{ name, params }` from the control values (aligned
   * with `controls` by index). Params the controls don't cover stay at the
   * filter's Rust-side defaults. */
  use: (values: number[]) => MorphUse;
};

const slider = (
  label: string,
  min: number,
  max: number,
  initial: number,
  decimals = 0,
): ParamControl => ({ kind: "slider", label, min, max, initial, decimals });

const checkbox = (label: string, initial = 0): ParamControl => ({
  kind: "checkbox",
  label,
  initial,
});

// The three morph-capable built-ins shipped by bevy-react itself.
export const BUILTIN_TRANSITIONS: FilterEntry[] = [
  {
    label: "crossfade",
    duration: 500,
    easing: "easeInOut",
    controls: [],
    use: () => ({ name: "crossfade" }),
  },
  {
    label: "linearWipe",
    duration: 800,
    easing: "linear",
    controls: [slider("angle", 0, 360, 45), slider("softness", 0, 100, 60)],
    use: ([angle, softness]) => ({
      name: "linearWipe",
      params: { angle, softness },
    }),
  },
  {
    label: "pixelize",
    duration: 1200,
    easing: "linear",
    controls: [slider("squares", 4, 64, 20), slider("steps", 0, 50, 50)],
    use: ([squares, steps]) => ({
      name: "pixelize",
      params: { squaresMin: [squares, squares], steps },
    }),
  },
];

// The gl-transitions pack (ports registered in `examples/demos/filters.rs`,
// shaders in `examples/assets/shaders/morphs/`). Color-only filters
// (circleCrop, burn0) keep their defaults — no controls.
export const CUSTOM_MORPHS: FilterEntry[] = [
  {
    label: "windowslice",
    duration: 800,
    easing: "linear",
    controls: [slider("count", 2, 40, 10), slider("smoothness", 0, 1, 0.5, 2)],
    use: ([count, smoothness]) => ({
      name: "windowslice",
      params: { count, smoothness },
    }),
  },
  {
    label: "radial",
    duration: 800,
    easing: "linear",
    // `smoothness` is an Angle param: bare wire numbers are DEGREES (the
    // shader's soft edge is radians-scale, upstream default 1 rad = 57deg).
    controls: [slider("smoothness", 0, 180, 57)],
    use: ([smoothness]) => ({ name: "radial", params: { smoothness } }),
  },
  {
    label: "polkaDotsCurtain",
    duration: 1500,
    easing: "linear",
    controls: [slider("dots", 2, 60, 15), slider("center", 0, 1, 0, 2)],
    use: ([dots, center]) => ({
      name: "polkaDotsCurtain",
      params: { dots, center: [center, center] },
    }),
  },
  {
    label: "circleCrop",
    duration: 800,
    easing: "linear",
    controls: [],
    use: () => ({ name: "circleCrop" }),
  },
  {
    label: "curtain",
    duration: 1000,
    easing: "easeOut",
    controls: [checkbox("vertical"), checkbox("close")],
    use: ([vertical, close]) => ({
      name: "curtainOpen",
      params: { vertical, close },
    }),
  },
  {
    label: "burn",
    duration: 900,
    easing: "linear",
    controls: [],
    use: () => ({ name: "burn0" }),
  },
  {
    label: "tilesWave",
    duration: 900,
    easing: "linear",
    controls: [slider("tiles", 2, 24, 8), checkbox("flip y")],
    use: ([tiles, flipy]) => ({
      name: "tilesWave",
      params: { tiles: [tiles, tiles], flipy },
    }),
  },
  {
    label: "gridFlip",
    duration: 1500,
    easing: "linear",
    controls: [slider("size", 2, 12, 6), slider("randomness", 0, 1, 0.1, 2)],
    use: ([size, randomness]) => ({
      name: "gridFlip",
      params: { size: [size, size], randomness },
    }),
  },
  {
    label: "doorway",
    duration: 1000,
    easing: "easeInOut",
    controls: [slider("perspective", 0, 1, 0.5, 2), slider("depth", 1, 10, 3)],
    use: ([perspective, depth]) => ({
      name: "doorway",
      params: { perspective, depth },
    }),
  },
  {
    label: "bookFlip",
    duration: 1200,
    easing: "easeInOut",
    controls: [],
    use: () => ({ name: "bookFlip" }),
  },
  {
    label: "powerKaleido",
    duration: 1500,
    easing: "easeInOut",
    controls: [slider("scale", 0.5, 6, 2, 1), slider("speed", 0, 15, 5)],
    use: ([scale, speed]) => ({
      name: "powerKaleido",
      params: { scale, speed },
    }),
  },
  {
    label: "stripDatamoshGlitch",
    duration: 700,
    easing: "linear",
    controls: [slider("strength", 0, 3, 1, 1), slider("bars", 4, 100, 42)],
    use: ([strength, bars]) => ({
      name: "stripDatamoshGlitch",
      params: { strength, bars },
    }),
  },
  {
    label: "filmBurn",
    duration: 1200,
    easing: "easeInOut",
    controls: [slider("seed", 0, 10, 2.31, 1)],
    use: ([seed]) => ({ name: "filmBurn", params: { seed } }),
  },
  {
    label: "invertedPageCurl",
    duration: 1600,
    easing: "linear",
    controls: [],
    use: () => ({ name: "invertedPageCurl" }),
  },
  {
    label: "dustify",
    duration: 2000,
    easing: "linear",
    // `wind` is relative to `direction` (0 = downwind with the sweep);
    // softness min 10 sidesteps the degenerate hard-edge (no flight) case.
    controls: [
      slider("direction", 0, 360, 0),
      slider("softness", 10, 500, 160),
      slider("turbulence", 0, 1, 0.5, 2),
      slider("wind", -180, 180, -180),
      slider("drift", 0, 300, 60),
      slider("grain", 2, 24, 7),
      slider("raggedness", 0, 5, 0.6, 2),
      slider("evolution", 0, 5, 1, 2),
    ],
    use: ([
      direction,
      softness,
      turbulence,
      wind,
      drift,
      grain,
      raggedness,
      evolution,
    ]) => ({
      name: "dustify",
      params: {
        direction,
        softness,
        turbulence,
        wind,
        drift,
        grain,
        raggedness,
        evolution,
      },
    }),
  },
];
