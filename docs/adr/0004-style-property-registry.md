# ADR-0004: Style properties are registered statics; behavior lives in writers

## Status

Accepted (2026-09).

## Context

Every style field was hard-wired into about seven places: the typed `Style`
struct (74 `Option` fields), a `with_style_fields!` row (wire name, dirty
group bits, an overlay flag), an arm of `apply_style_masked`, the keyword
decoder table, the hand-written TypeScript `BevyStyle`, the devtools field and
warning-kind tables, and the coverage tests that tied them together.
Invalidation was implicit — the layer content-dirt tap was a hand-inverted
group mask, and every hover/press/focus edge re-applied everything. Feature
crates could register props and elements, but not style properties.

Chromium's `css_properties.json5` shows the alternative: one declaration per
property, and everything else derived from it.

## Decision

- **A property is a `static StyleProperty<T> { name, codec, invalidate }`**,
  built with struct-update defaults (`..StyleProperty::new("x")`). The static
  is both the declaration and the typed key (`style.get(&KEY)`, pointer
  identity). No docs field, no overlay flag, no engine wiring on the
  property: the engines (transitions, animation bindings, promotion) read the
  keys they care about and declare their own wiring.
- **Every property registers the same way** — `app.add_react_style(&P)` /
  `add_react_styles(&[..])` — the core's included (`CORE_STYLES`, fixed ids so
  the core's masks stay `const`). Duplicate names panic.
- **Behavior lives in writers**: `Writer { reads, writes, apply }`, registered
  with `add_react_style_writer(s)`. The registry inverts `reads` into
  per-property writer masks; a delta re-runs only the writers reading a
  touched property. Declared `writes` are ownership: a clash panics. A
  property no writer reads is auto-stamped as `StyleValue<T>`.
- **Invalidation is declared per property** — `Invalidate::Fixed(set)` or
  `Invalidate::Computed(fn(old, new, node))` over a closed vocabulary. `PAINT`
  drives layer content dirt, `PROMOTION` drives promotion re-evaluation.
- **The store is sparse** (`PropId`-sorted entries, values in a `SmallBox`),
  decoded straight from the wire through an erased serde seed resolved via
  the thread's registry. Unknown keys warn (`unknownStyleField`).
- **Variants carry every property**; promotion unions every state.
- **TypeScript is generated**: the core `BevyStyle` into the package's
  committed `js/src/generated/style.ts` (a test diffs it), an app's
  properties into its `bevy.ts` as a `declare module "bevy-react"`
  augmentation. The devtools field table comes from Rust at runtime.

## Consequences

- Adding a property is one static plus (usually) one writer entry; an app
  property with no writer needs only the static.
- Precise invalidation: a hover changing only `cursor`, `focusPolicy`, or a
  filter no longer re-captures the layer; a promoted root's opacity or
  translation is composite-only.
- `BevyStyle` fields lose their per-field JSDoc (there is no docs field); the
  documentation lives on the Rust statics, and the named value types
  (`BevyTransform`, `FilterChainValue`, …) keep theirs.
- `focusPolicy`, `layoutRounding`, `groupAlpha` and `cache` are now carried by
  variants (the first two apply per state; the last two only feed the
  promotion union).
- Performance held: the table-ops benchmark stayed within run-to-run noise
  (op flush got faster — the store skips the 74-field struct).

## Considered and rejected

- A `#[style]` attribute macro — a plain struct with defaults reads the same
  and needs no macro.
- Behavior flags on the property (dirty groups, overlay, promotes, transition
  channel) — behavior belongs to writers and engines; the property stays a
  declaration.
- A generic table test over every property — declarations are checked by
  the compiler and by ordinary feature tests.
