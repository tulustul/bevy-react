// Filter chain types for the `filter`/`backdropFilter` and `morphFilter`
// style fields. The wire contract and the built-in filters live in the Rust
// `crate::filters` module; params are validated there against the filter
// registry, not here.
//
// Registry-driven typing: `BevyFilters` and `BevyMorphFilters` are
// deliberately EMPTY here. The generated `bevy.ts` augments them via
// declaration merging —
// `declare module "bevy-react" { interface BevyFilters { blur: BlurParams; … } }`
// — with one entry per filter the Rust registry knows, split by family: the
// ten regular built-ins plus every `add_react_filter` custom land in
// `BevyFilters`; the three morph built-ins (crossfade, linearWipe, pixelize)
// plus every `add_react_morph_filter` custom land in `BevyMorphFilters`.
// `FilterUse`/`MorphFilterValue` map their interface into a discriminated
// union, so each filter name types its own params — and the two families
// never mix (a morph name in a `filter` chain is a type error, mirroring the
// resolve-time rejection).
//
// Consequence: without generated bindings `keyof BevyFilters` is `never`, so
// `FilterUse` is `never` and the `filter` style is intentionally unusable
// untyped — filters are registry-defined, there is no loose fallback (same
// for `BevyMorphFilters` and `morphFilter`). Run your app's exporter
// (`npm run bevy:generate`) to populate the unions.

import type { Animatable } from "./animated";

/** Registry of regular filter names → their params type (the
 *  `filter`/`backdropFilter` chains). Empty by design; augmented by the
 *  generated `bevy.ts` (see the module doc above). */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BevyFilters {}

/** Registry of two-input morph filter names → their params type (the
 *  `morphFilter` style). Empty by design; augmented by the generated
 *  `bevy.ts` (see the module doc above). */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BevyMorphFilters {}

/** One filter invocation in a chain: a registered filter name (e.g. `"blur"`,
 *  `"hueRotate"`) plus its parameters, typed per name via [`BevyFilters`].
 *  Every param is individually optional: an omitted param takes the filter's
 *  Rust-side default (the CSS-shorthand default for built-ins —
 *  `{ name: "grayscale" }` is *full* grayscale, like CSS `grayscale()` — and
 *  the field's `#[serde(default)]` for customs).
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
    params?: { [P in keyof BevyFilters[K]]?: Animatable<BevyFilters[K][P]> };
  };
}[keyof BevyFilters];

/** The `filter` style value: one [`FilterUse`] (a 1-element chain) or an
 *  ordered array of them — chain order is pass order. */
export type FilterChainValue = FilterUse | FilterUse[];

/** The `morphFilter` style value: a morph filter name from the separate
 *  [`BevyMorphFilters`] registry, its params, and the morph identity `key`.
 *  When `key` changes, the node's previous rendered appearance is frozen and
 *  the named two-input filter blends it into the live content, driven by an
 *  engine-owned progress eased over a built-in 300ms default (override with
 *  `transition: { morphFilter }`). The built-in morphs are `crossfade`,
 *  `linearWipe`, and `pixelize`; register customs with
 *  `#[react_morph_filter]` + `add_react_morph_filter` (the `morph_*` prelude
 *  helpers give the shader the two inputs + progress). Regular filters are
 *  not accepted here — the families are separate, in typing and at resolve
 *  time. Every param is individually optional (an omitted param takes the
 *  filter's Rust-side default). Expressed as its own mapped union so
 *  `params` narrows by `name`. */
export type MorphFilterValue = {
  [K in keyof BevyMorphFilters]: {
    /** Morph identity: a change (and only a change) triggers the morph. */
    key: string | number;
    name: K;
    params?: {
      [P in keyof BevyMorphFilters[K]]?: Animatable<BevyMorphFilters[K][P]>;
    };
  };
}[keyof BevyMorphFilters];
