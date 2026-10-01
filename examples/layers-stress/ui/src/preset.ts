// The UI's startup config. `build.mjs` rewrites `preset.json` on every build
// from STRESS_PRESET (a JSON object of overrides — how `--measure` runs preset
// the UI without touching Rust bindings), e.g.
//   STRESS_PRESET='{"n":500,"filterMode":"all","blur":true}' \
//     npm run build -w layers-stress-app
// With STRESS_PRESET unset it regenerates byte-identical to the committed
// defaults.
import preset from "./preset.json";

/** Which share of items carries a `filter` chain (`half` = every 2nd item). */
export type FilterMode = "off" | "half" | "all";

export type Preset = {
  n: number;
  animate: boolean;
  groupAlpha: boolean;
  filterMode: FilterMode;
  blur: boolean;
  animateFilter: boolean;
  animateSize: boolean;
};

export const PRESET = preset as Preset;
