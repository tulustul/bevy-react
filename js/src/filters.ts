// Filter chain types for the `filter` style field. The wire contract and the
// built-in filters (blur, grayscale, hueRotate, …) live in the Rust
// `crate::filters` module; params are validated there against the filter
// registry, not here.
//
// Registry-driven typing: `BevyFilters` is deliberately EMPTY here. The
// generated `bevy.ts` augments it via declaration merging —
// `declare module "bevy-react" { interface BevyFilters { blur: BlurParams; … } }`
// — with one entry per filter the Rust registry knows (the eight built-ins
// plus every `add_react_filter` custom). `FilterUse` maps that interface into
// a discriminated union, so each filter name types its own params.
//
// Consequence: without generated bindings `keyof BevyFilters` is `never`, so
// `FilterUse` is `never` and the `filter` style is intentionally unusable
// untyped — filters are registry-defined, there is no loose fallback. Run
// your app's exporter (`npm run bevy:generate`) to populate the union.

import type { Animatable } from "./animated";

/** Registry of filter names → their params type. Empty by design; augmented by
 *  the generated `bevy.ts` (see the module doc above). */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BevyFilters {}

/** One filter invocation in a chain: a registered filter name (e.g. `"blur"`,
 *  `"hueRotate"`) plus its parameters, typed per name via [`BevyFilters`].
 *  Omitted params take the filter's CSS-shorthand default —
 *  `{ name: "grayscale" }` is *full* grayscale, like CSS `grayscale()`.
 *
 *  Every param position is [`Animatable`]: `params: { radius: { animated:
 *  sv } }` binds it to a shared value (chain position = binding address, so
 *  reordering the chain keeps bindings attached). The wrapper's optional
 *  `seed` is the static value the resolver decodes in its place — size it
 *  for the animation's range when the param feeds a resolve-time derivation
 *  (a blur radius's capture outset). */
export type FilterUse = {
  [K in keyof BevyFilters]: {
    name: K;
    params?: { [P in keyof BevyFilters[K]]: Animatable<BevyFilters[K][P]> };
  };
}[keyof BevyFilters];

/** The `filter` style value: one [`FilterUse`] (a 1-element chain) or an
 *  ordered array of them — chain order is pass order. */
export type FilterChainValue = FilterUse | FilterUse[];
