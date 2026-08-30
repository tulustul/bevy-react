# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2026-08-30

### Added

- **Layout transitions (`transition: { layout }`).** A node eases from its
  old rect to its new one whenever layout moves it — a sibling inserted or
  removed, a reorder, a parent resize, a re-wrap, a window resize (FLIP). The
  real layout still snaps (no relayout, no layer); the node glides by
  translation, children ride the translation and stay crisp, picking follows
  the visual. The first layout adopts silently (no enter animation) and
  `display: none` → shown grows in place. Composes with the node's own `size`
  channel and with `{ animated }` layout bindings, which keep owning the rect.
- **Shared elements (`sharedTag` + `transition: { sharedElement }`).** React
  has no reparenting, so a node that "moves" between parents or screens is an
  unmount + mount; give both the same `sharedTag` and the incoming node starts
  where the outgoing one visually was — rect (mid-flight included),
  background color, opacity, transforms, filters, gradients — and eases to
  its own layout and style with the one `sharedElement` spec. The commit is
  the trigger (no imperative API); pairing is same tag, same element kind,
  same UI root, same commit. Size flies in measured px through real layout,
  position by translation toward the root-space settled destination; nested
  tagged nodes each fly their own straight line.
- **Named nodes (`name` prop).** Every element takes `name="hud"`; it lands on
  the entity as a Bevy `Name` (dynamic — a later delta replaces it, `""`
  removes it). Rust reaches React-created entities through the public
  `ReactNode(NodeId)` marker component and the `ReactNodes` system param
  (`get` / `all` / `iter` / `contains`); order consumers `.after(ReactApplySet)`
  for same-frame mounts. Names are group semantics, not unique.
- **`layoutRounding` style.** Maps to bevy's `LayoutConfig::use_rounding`
  (inherited downward, restarts at `<surface>`/`<root>`). `false` lays a
  subtree out at fractional pixels — the fix for the 1px hops of any
  real-layout size animation (`transition: { size }`, a shared-element size
  flight, a bound `width`/`height`): the animated box and everything
  re-flowing around it glide instead of stepping.
- **`imageRendering` style.** `"auto" | "bilinear" | "trilinear" | "nearest"`
  fixes large images drawn small. An explicit mode binds the node to a derived
  variant asset per `(source, mode)` — `trilinear` builds a CPU mip pyramid off
  the main thread, the node staying on its source until it lands. Variants are
  shared and refcounted, rebuilt when the source reloads, and never made when
  the source already satisfies the mode. Live textures (canvas, svg, portal,
  `{ texture }`) refuse an explicit mode with a devtools warning.
- **`padding` / `margin` axis pairs.** Both accept `{ horizontal, vertical }`
  alongside the number, CSS shorthand string and `{ top, right, bottom, left }`
  forms; an explicit side wins over its axis whatever the key order.
- **`pinch` built-in filter.** Promoted from the demo's custom filter: `x`/`y`
  center, `strength` (−1 bulge ..= 1 pinch), `radius`, plus lighting —
  `light`, `lightAngle` (default −135 = top-left), `gloss`, `glossSize`.
- **`chromaticAberration` gains `rotation`.** A tangential swirl in degrees on
  top of the directional `offset`/`angle` split (R rotates by `+rotation`,
  B by `−rotation`); 0 keeps the pure split.
- **`ReactUiPlugin::precompile_filters(PrecompileFilters { .. })`.** Warms
  the selected filter and morph pipelines (per partition: `builtins`,
  `filters`, `morphs` × `All | Names | Off`, default `All`) plus the layer
  pipelines for each camera format the first frame it is seen, so a morph's
  first run no longer blinks dark while its pipeline compiles async.
- **Devtools: component attribution.** The Nodes tab now leads each row with
  the React component that emitted the node (`<Card>`), via React's owner
  chain — dev-only, zero wire cost.
- **Demos app.** Mobile support in the web build (responsive shell: compact
  top bar + overlay nav drawer under 720px, touch scrolling); a new home page
  (a gallery wall of live vignettes that expand via shared elements); new
  pages — How it works?, Getting started, Layers, Named nodes, Shared
  elements, Layout rounding, Image rendering, Pinch filter — and richer
  per-example explanations with code snippets, param controls and a modal
  viewer; a general look-and-feel pass (buttons, badges, navigation slide-in,
  ripples in the bouncing-ball scene); `--shoot --size WxH`.

### Changed

- **`borderRadius` is animatable.** `transition: { borderRadius }` eases the
  corner radii per corner across every wire form (uniform, shorthand,
  per-corner object); a corner that changes unit snaps alone, unsetting eases
  to square. A uniform `borderRadius: { animated }` binding drives one px
  value for all corners.
- **`backgroundGradient` / `borderGradient` are animatable.**
  `transition: { backgroundGradient | borderGradient }` eases
  strictly-matching gradient structures stop-wise (colors like
  `backgroundColor`, numeric long-way angles, same-unit lengths); a structural
  mismatch, appear or unset snaps silently, so fade via transparent stops.
  Gradient leaves (angles, positions, stop positions) accept inline
  `{ animated }` wrappers.
- **Filters and layer styles allowed on `<text>`.** A top-level `<text>` now
  has full `<node>` parity: hover/press styles, click/pointer handlers and the
  layer family (`filter`, `backdropFilter`, `morphFilter`, `transform3d`,
  `opacity`, `cache`) work directly on it — no wrapper `<node>` needed. On a
  nested span they are structural no-ops, flagged in the devtools inspector.
- **`transition` channels are explicit-only.** The `all` shorthand was
  removed; `morphFilter` keeps its built-in 300ms default.
- **Op-apply is ~2–3x faster on mount-heavy commits.** `Props`' `hoverStyle` /
  `pressStyle` / `focusStyle` slots are now `Option<Box<Style>>` instead of
  inline `Style` (as are all four slots of the internal `StyleVariants`
  component). `Props` is decoded, default-initialized and merged once per
  create/update op, and its cost is linear in its size — holding four inline
  `Style`s made every node pay for variants it almost never declares. The
  struct drops 19,280 -> 6,056 bytes, and on the table-ops benchmark the
  op-translate leg falls 47–71% (10k create 178.7 -> 59.7 ms) with the
  serde decode down 18–30%; 10k create total is 29.9% faster than 0.5.0.
  Source-breaking only for code constructing `protocol::props::Props`
  directly. The wire format is unchanged.
- **Terminal warnings are deduplicated.** Every devtools warning is now also
  logged once per distinct `(kind, value, message)` per process through
  `diag`; several noisy per-frame styling warnings were dropped.

### Fixed

- Buttons (and any pressable node) no longer block touch-drag scrolling of an
  enclosing scroll container.
- Devtools console messages were not visible in the terminal.
- Undriven transition channels are re-seeded on a spec-less commit, so a
  style change that lands without its `transition` spec no longer resumes
  from a stale current value.

## [0.5.1] - 2026-08-22

### Added

- **Touch-drag scrolling.**
- **Touch support for `onPointer*` drags.**

### Changed

- **Blur filter now defaults to 20px radius**

## [0.5.0] - 2026-08-16

### Added

- **`morphFilter` — view-transition morphs.** Set
  `morphFilter: { key, name, params }` on a node and, whenever `key` changes,
  its previous rendered appearance is frozen and blended into the live content
  by the named two-input filter — a GPU view transition for content swaps.
  Progress is engine-driven with built-in default timing (300ms ease-in-out;
  override with `transition: { morphFilter }`), a mid-flight key change
  restarts smoothly from the in-flight blend, and a regular `filter` chain
  composes on top. Built-in morphs: `crossfade` (noise-staggered dissolve),
  `linearWipe` (`angle`, `softness`), and `pixelize` (a port of
  gl-transitions' mosaic out / mosaic in; `squaresMin`, `steps`). Custom
  morphs are a `#[react_morph_filter]` struct plus a WGSL shader, registered
  with `app.add_react_morph_filter::<T>()` and typed end-to-end through the
  generated `BevyMorphFilters` interface.
- **Text-effect built-in filters.** Three new entries in the `filter` chain
  family: `gradientMap` recolors the subtree by luminance through a multi-stop
  linear gradient (`stops` with per-stop `color`/`position`, `angle`,
  `amount`), anchored to the node's border box even when chained after
  outset-growing passes; `outline` dilates the alpha silhouette into a colored
  ring painted under the content (`width`, `color`, `softness` — softness
  alone doubles as a glow); `shadow` is a CSS-style drop shadow — the
  silhouette tinted `color`, shifted by `offsetX`/`offsetY`, Gaussian-blurred
  by `spread`, composited under the content.
- new demos homepage

## [0.4.0] - 2026-08-12

### Added

- **SVG.** Two web-faithful doors onto the same raster core. An `<image>` whose
  `src` names an `.svg` file renders as a true vector — parsed once,
  re-rasterized at the laid-out size × DPI, crisp at every size (layout uses the
  file's intrinsic size, like a bitmap). And `<svg>` is a React-composed drawing
  surface: the shape children (`<path>`, `<rect>`, `<circle>`, `<ellipse>`,
  `<line>`, `<polyline>`, `<polygon>`, `<g>`) are real elements with props,
  per-shape pointer events (hit-testing follows the painted geometry; event
  coordinates arrive in viewBox user units), `{ animated }` bindings on numeric
  attributes, and a `transition` prop for eased attribute changes. SVG `<text>`
  inside files is available behind the off-by-default `svg-text` cargo feature.
- **Gamepad input.** Built-in events `gamepadConnected`, `gamepadDisconnected`,
  and `gamepadInput` (button and axis changes, with both digital and analog
  values), a `gamepad.getAll` request returning the currently connected pads,
  and `gamepad.rumble` / `gamepad.stopRumble` messages (durations in
  milliseconds, motor intensities clamped to `0..=1`). Pads are identified by a
  monotonic wire id that is never reused across reconnects.
- **`backgroundImage` style.** Paints a texture under a node's content, over
  `backgroundColor` and `backgroundGradient`. `src` is an asset path or
  `{ texture }` naming a render target the app registered in `RenderTargets`;
  `tint` is animatable, `mode` is `"stretch"` (default) or the repeat modes
  (`"repeat"`, `"repeatX"`, `"repeatY"`), and `scale` sets the tile size in
  logical px. Never affects layout.

### Changed

- **Faster op batches.** The reconciler's ops are no longer as wide as their
  fattest variant, so a commit's cost tracks what it actually carries: mass
  operations run 10–45% faster than 0.3.0 end-to-end (`clear` −45%,
  `insertEvery2nd` −34%, `create` −32% at 10k rows), and the wire-decode leg
  drops by 2–7×.

### Internal

No behavior change, but worth knowing when reading or patching the crate:

- **Animation machinery generalized.** The per-property animation and transition
  code is now driven by one `with_animatable_props!` table instead of parallel
  hand-written matches, so adding an animatable property is a table entry the
  compiler checks exhaustively on both enums. `animations.rs` and
  `transition.rs` split into `animations/{apply,eval,props}/…` and
  `transition/{channels,spec,scroll,shape_channel,transform3d}`.
- **Big modules split into directory modules.** `protocol.rs` (~4,200 lines)
  became `protocol/` — one file per concern (`op`, `props`, `style`, `merge`,
  `units`, `visual`, `transform`, `grid`, `keywords`, `animatable`,
  `background_image`, `outbound`) — and `devtools.rs` (~3,000 lines) became
  `devtools/` (`panel`, `layers`, `console`, `stats`, `pick`, `settings`,
  `js_tables`). Only the `protocol` split is visible outside the crate (see
  above); `devtools` is private.

## [0.3.0] - 2026-07-25

### Added

- **Composited layers.** Some styles now promote a subtree to an offscreen
  composited layer — `opacity` on a node with children (group-alpha web
  semantics; opt out with `groupAlpha: false`), a `filter` chain, a
  `transform3d`, or the new `cache` style (`"always"` forces promotion,
  `"never"` opts a subtree out of capture caching — the escape hatch for
  live content like `<portal>` render targets). Captures are cached: a clean
  layer skips its capture pass, and translation, group alpha, and filter
  params animate at composite time without re-capturing. Promotion is
  render-side only — layout, picking, refs, and animations are untouched.
- **Filters.** The `filter` style runs a chain of GPU post-processing passes
  over an element and everything under it. Built-ins: `blur`, `bloom`,
  `chromaticAberration`, `grayscale`, `sepia`, `invert`, `hueRotate`,
  `brightness`, `contrast`, `saturate`. Custom filters are a `#[react_filter]`
  params struct plus a WGSL shader, registered with `app.add_react_filter::<T>()`
  and typed end-to-end through the generated `bevy.ts`. Chains ease with
  `transition: { filter }`, and any param accepts an inline animated binding.
- **`backdropFilter`.** Same chain shape as `filter`, but it filters what is
  rendered _behind_ the node — frosted-glass panels over the live 3D scene.
  The result respects `borderRadius`, so the frost edge follows the node's
  rounded background. v1 filters the camera's post-processed frame only (UI
  painted beneath the node is not included).
- **`transform3d`.** A 3D perspective transform (scale, rotations, translation,
  `perspective`, `origin`) applied to the composited result — animating it
  never re-captures the subtree. Picking follows the visual: the cursor is
  inverted through the transform, so hover and clicks land where things look
  like they are. Transformed quads are antialiased (edge feathering + mipmapped
  sampling), and fields ease via `transition: { transform3d }` or inline
  animated bindings.
- **Devtools: Layers and Console tabs.** The Layers tab lists promoted layers
  with their promotion reasons, filter chains, and live param values; the
  Console tab surfaces JS console output inside the inspector.

### Changed

- **Animations: inline `{ animated }` bindings** (breaking). `<Animated.node>`
  and `animatedStyle` are gone — bind a shared value directly in `style` with
  the `{ animated: … }` wrapper, on any plain element, in any animatable
  position (opacity, colors, layout lengths, transform channels, `transform3d`
  fields, filter params). Driver completion callbacks moved into the config
  object (`withTiming(to, { onComplete })` instead of a trailing argument),
  and rotations now bind in **degrees**.
- **`<Anchored.node>` is now `<anchor>`** (breaking). World-anchored UI is a
  built-in element instead of a JS wrapper component.
- Clicks no longer bubble to the parent node's `onClick`, and hovering UI no
  longer blocks camera/world controls underneath it.

### Fixed

- Dragging a scrollbar now bypasses style animations, so the thumb tracks the
  pointer directly.

## [0.2.0] - 2026-07-13

### Added

- **Devtools.** An in-app inspector panel (toggled with <kbd>F12</kbd>), enabled
  automatically in dev builds — nothing to set up. Includes a live node tree with
  per-node prop/style inspection, bridge statistics (op throughput, frame wait
  time and pre-apply time tracked separately), and isolated style edits.
  Configure or disable it via `ReactUiPlugin::devtools(DevtoolsConfig { ... })`;
  opt out of compiling it entirely by disabling the `devtools` default feature.
- **`<root>` element.** Renders its children as an independent top-level UI
  tree, detached from wherever the element sits in your component tree — so
  overlays (like the devtools panel) can float above the app without living
  inside its layout. Fills the window as a column by default; name it to pick
  it out in the devtools root selector.
- **Styled scrollbars.** New `style.scrollbar` object for nodes with
  `overflow: scroll`: style the `track` and `thumb` (colors, borders, radii) with
  `hover`/`pressed` state overlays, set bar `thickness` and a minimum thumb
  length. Bars appear per overflowing axis and auto-hide when content fits.
- **Window size bindings.** A `resize` Bevy→React event carrying the new logical
  window size (`bevy.on("resize", …)`) plus a `window.size` request
  (`bevy.window.size()`) to read it on demand.

### Changed

- The bridge now skips `pointermove` UI events when the cursor has not actually
  moved, reducing redundant traffic on the Bevy→JS channel.

## [0.1.2] - 2026-07-03

Last release before this changelog was introduced.

[0.6.0]: https://github.com/tulustul/bevy-react/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/tulustul/bevy-react/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/tulustul/bevy-react/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/tulustul/bevy-react/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/tulustul/bevy-react/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/tulustul/bevy-react/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/tulustul/bevy-react/releases/tag/v0.1.2
