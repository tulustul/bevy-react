# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2026-11-23

### Added

- **QuickJS as an alternative JS engine.** The `quickjs` cargo feature runs
  your React bundle on QuickJS ([quickjs-ng](https://github.com/quickjs-ng/quickjs)
  through `rquickjs`) instead of V8. The stripped binary is ~48 MB smaller
  (V8's 49 MB against QuickJS's 1.3 MB), startup is faster (~20 ms against
  ~37 ms on a production bundle) and nothing is downloaded at build time.
  The build needs a C compiler instead. React work runs 10–30× slower, which
  is fine for typical game UIs and not for re-rendering thousands of nodes
  per commit; there is no `Intl`. The engines are additive: an engine you
  don't enable is neither downloaded nor linked, and with both compiled in
  `ReactUiPlugin::engine(JsEngine::QuickJs)` picks (V8 by default). Hot
  reload, devtools and timers behave the same on both. See the new
  [JS engines](https://tulustul.github.io/bevy-react/tooling/js-engines/)
  guide page; the measurements are in `examples/stress/ENGINES.md`.
- **The engine and its version in the log.** Each startup logs one INFO
  line such as `QuickJS-ng 0.16.2 ready in 50.8 ms`.
- **Examples pick their engine at compile time.** `demos`, `civilization`,
  `cyberpunk`, `coldwake` and `synth` run on QuickJS alone with
  `cargo run -p <example> --no-default-features --features quickjs`;
  `minimal` is QuickJS-only, and the `stress` / `layers-stress` benchmarks
  take `--engine v8|quickjs`.
- Every web build of the examples shows a loading spinner until Bevy's
  first frame.

### Changed

- **A native app needs a JS engine feature** (breaking for
  `default-features = false` builds). `v8` is a new default feature of
  `bevy-react`; a build that turns the defaults off must list `v8` or
  `quickjs`, or `ReactUiPlugin` panics at startup.
- **`js_thread::spawn_js_thread` takes the engine** as its first argument
  (breaking for custom hosts and headless harnesses), and every host now
  installs its ops on `globalThis.__bevyHost`, the only object the JS
  runtime reads (`Deno.core.ops` is no longer consulted directly).
- **Production bundles are minified and drop their source maps.**
  `bevy-react build --prod` used to keep readable code and an inline map:
  the stress example's `vendor.js` goes from 1.5 MB to 145 KB. Dev builds
  keep the map.
- **Performance.** Unchanged on V8 from 0.8.1: the table-ops benchmark,
  run against v0.8.1 on the same machine, is within noise.

### Fixed

- An `{ animated }` or transitioned `opacity` on a node that isn't
  promoted to a layer replaced its colors' own alpha: a `<text>` got a
  dark box behind its glyphs and a translucent color went opaque. The
  opacity now multiplies into each color's alpha.
- A radial gradient's `shape` in the forms its TypeScript type declares
  (`"closestSide"`, `{ circle: 40 }`, `{ ellipse: [a, b] }`) failed to
  decode and dropped the whole commit. Both those and the old forms work.
- `boxShadow: []` drew one black shadow instead of none.
- A shared-element flight from a mirrored node (`scaleX: -1`) started from
  a negative size.
- On the web, `None` and unit values reached JS as `undefined` instead of
  `null` as on native, so an `x !== null` check passed on the web only.
- The `init` template installs `@types/react-reconciler`, without which a
  standalone app's typecheck failed.

## [0.8.1] - 2026-10-15

### Added

- **Devtools Animations tab.** Lists the shared values with a running
  driver (each driver stage's progress, the nodes bound to it) and every
  style transition in flight. **pause** and the speed chips drive Bevy's
  `Time<Virtual>`; while paused, a slider on each row scrubs that
  animation. `DevtoolsConfig::pause_key` (F11) pauses from the keyboard.
- **Rust drives shared values.** `SharedValues::set(id, value)` is public:
  send a shared value's `x.id` to Rust and set it from your own clock.
- **Animations of your own in the devtools** (Rust extensions): implement
  `ext::AnimationRuns` on a component and register it with
  `app.add_react_animation_runs::<C>()`. `Run`, `RunLength` and
  `run_length` are public in `animations`.
- **`examples/synth`**, a node graph editor for a modular synth you can
  hear: fifteen modules played live on the audio thread, cables with spring
  physics and flowing signals drawn by a Bevy shader under the UI, pop-in
  and drag animations, an Add menu, a minimap, presets and a crisp zoom.
  It also runs in the browser.

### Changed

- **A shared value lives as long as its component.** Unmounting the
  component that called `useSharedValue` frees the value and stops its
  driver; the completion callback fires with `false`. It used to stay in
  Bevy until a full reload.
- **The wheel stops at pointer-blocking nodes.** A node with
  `focusPolicy: "block"` (the `<button>` default) passes the wheel only to
  its ancestors, like a click: a button in a scrolled list still scrolls
  it, one lying over another container doesn't.
- **Devtools panel.** Pick mode keeps its click from the app (nothing is
  pressed, clicked or focused). The panel owns the wheel and hover over it,
  and `PointerCapture` reports the pointer as the UI's there. Icons replace
  the letter buttons; a narrow panel shows only the active tab's label.
- **Performance.** Unchanged from 0.8.0: the table-ops benchmark is within
  noise.

### Fixed

- The devtools' **push** moved the app aside without telling it:
  `window.size` and the `resize` event now report the width left beside
  the docked panel, so the app lays out in it.

## [0.8.0] - 2026-10-12

### Added

- **Keyboard focus on every element.** `tabIndex`, `onFocus` and `onBlur`
  work on any element, and `focusStyle` applies to it. The new
  `focusVisibleStyle` overlays it only while the focus indicator shows
  (keyboard navigation, or a focused `<editableText>`). Add Bevy's
  `TabNavigationPlugin` and Tab / Shift+Tab walk the elements with
  `tabIndex >= 0`; Enter and Space click a focused `<button>`.
- **`disabled` and `readOnly`.** `<button disabled>`,
  `<editableText disabled>`, and `<editableText readOnly>` (keeps the focus,
  the caret and a selection to copy, takes no edit).
- **`em` and `rem` lengths.** Every length takes `"2rem"` (a multiple of
  Bevy's `RemSize`, 20px by default) and `"1.5em"` (a multiple of the
  element's font size). `fontSize` takes `em` too.
- **`positionType: "fixed"`.** Places a node against the viewport of its UI
  camera: it takes no space, and its ancestors' scrolling, clipping,
  transforms and composited layers don't reach it.
- **Elliptical `borderRadius`.** The CSS slash form: `"50% / 25%"`,
  `"40px 10px / 10px 40px"`. Painting, hit-testing and
  `transition: { borderRadius }` follow the ellipse.
- **Inline images in text.** An `<image>` inside a `<text>` or a span flows
  with the glyphs, sized in px, `em` or `rem`.
- **`fontFamily` fallback lists.** `"Space Grotesk, Inter"` is tried per
  glyph in order. The CSS generic keywords (`sans-serif`, `monospace`, …)
  map to Bevy's generic families (needs its `system_font_discovery`
  feature).
- **Safe alignment keywords.** `"safeCenter"`, `"safeStart"`, `"safeEnd"`,
  `"safeFlexStart"` and `"safeFlexEnd"`: aligned like the plain keyword
  while the content fits, at the start once it overflows.
- **Gradient `colorSpace: "okhsl"` and `"okhslLong"`.**
- **`onPointerHover`.** Fires on each frame the pointer moved over the
  element, a button held or not. `onPointerMove` stays drag-only.
- **Modifier keys on pointer and wheel events:** `shiftKey`, `ctrlKey`,
  `altKey`, `metaKey`.
- **`<surface>`.** Composited layers (`opacity`, `filter`, `backdropFilter`,
  `morphFilter`, `transform3d`, `cache`) work inside a surface. The wheel
  reaches its scroll containers and `onWheel`. `SurfaceSpec::scale_factor`
  renders it at a DPI scale. The `SurfacePointerRay` resource points at
  surface UI with your own world-space ray (a crosshair, a gamepad
  reticle).
- **Devtools paint flashing.** The panel's **paint** toggle flashes every
  node Bevy re-extracts for rendering.
- **Examples.** Three showcase apps: `civilization` (a 4X strategy HUD over
  a hex map), `cyberpunk` (a game's front end) and `coldwake` (an in-world,
  diegetic interface).

### Changed

- **Bevy 0.20** (breaking). Needs Rust 1.97.1 or newer. Apps on Bevy 0.19
  stay on bevy-react 0.7.
- **Shaders are WESL** (breaking). A custom filter or morph shader must be a
  `.wesl` file that imports the prelude with
  `import bevy_react::filter::{…};` in place of `#import`, with `#ifdef`
  blocks turned into `@if(…)`. A `shader` path ending in `.wgsl` is a build
  error. Your app's own material shaders need the same port.
- **UI roots are sized in viewport units** (breaking). The window tree,
  `<root>` and `<surface>` default to `100vw` × `100vh` instead of `100%`:
  Bevy 0.20 grows a `100%` root to fit its content, and nothing inside it
  scrolls. If you set `"100%"` on a `<root>` or `<surface>` yourself,
  switch to viewport units.
- **Hover and press come from Bevy picking** (breaking for Rust code that
  queries React entities). Read `bevy_react::ReactInteraction` in place of
  `bevy::ui::Interaction` and `RelativeCursorPosition`. The mouse, each
  touch, `<surface>` UI and 3D-transformed elements now behave alike: every
  finger drags its own element, hover in a surface follows `focusPolicy`,
  a scrollbar blocks what lies beneath it, and a press stays pressed until
  release.
- **`<button>` carries `bevy::ui_widgets::Button`, `<editableText>`
  `bevy::ui_widgets::TextInput`** (breaking for Rust code that queries
  them). Clicking elsewhere or pressing Escape now blurs a text field.
- **Focus follows Bevy's `InputFocus` directly.** `onBlur` fires before the
  next element's `onFocus`, and `focusStyle` applies in the frame the focus
  moves (it was a frame late).
- **`overflow` clips follow transforms and layout transitions.** A rotated
  or scaled clipping node clips along its transformed box, and with
  `transition: { layout }` the clip eases with the box.
- **`letterSpacing: "…em"` is a multiple of the text's font size**, as in
  CSS (it was `RemSize`; write `"…rem"` for that). An unset `fontSize` is
  `1rem`.
- **Performance.** Bevy 0.20's UI renderer does more work per frame: the
  table-ops benchmark runs 12–17% slower than on 0.7.0. Members of a clean
  cached layer no longer enter Bevy's UI queue.
- **Breaking for Rust extensions:**
  - `add_react_handler` and `add_react_request_handler` take one generic
    parameter less (`<E, M, S>`); calls that infer them are unaffected.
  - `Length` gained `Em` and `Rem`, `FontSize` gained `Em`.
  - `POSITION_TYPE`'s value is `style::props::PositionMode`,
    `BORDER_RADIUS`'s is `protocol::visual::BorderRadiusSpec` (`.radii()`
    gives the `CornerRadii`).
  - `elements::editable::{FOCUS, BLUR, on_focus_gained, on_focus_lost}` are
    gone, `FocusState` is `{ focused, visible }`, `Common::ALL` includes
    `Common::FOCUS`, and a custom element may not declare a `tabIndex`
    attribute or a `focus`/`blur` event.
  - A node-less custom element gets its pointer events from picking alone,
    with no `Interaction` sync system. `VirtualButtons::leave` takes the
    release and the parking location separately.
  - `TabIndex` and `FixedNode` on a React entity are written by bevy-react.

### Fixed

- `<anchor>` overlays trailed a moving camera or entity by one frame. They
  are now positioned in `PostUpdate`: a system that moves the camera or an
  anchored entity there must run
  `.before(bevy_react::anchor::position_anchored_nodes)`.
- Releasing a drag over an ancestor with `onClick` clicked it (a slider
  released over the card around it). `onPointerUp` now always comes before
  `onClick`.
- A node with `maxWidth` reserved the height of its content wrapped at the
  unclamped width.
- A composited layer captured while hidden (inside an `<anchor>` before its
  first layout) stayed empty once shown.
- A live `<surface>` kept rendering with its meshes out of view.
- A click on screen-space UI also clicked the `<surface>` mesh behind it,
  and the wheel could reach surface UI lying under the window cursor.
- Surface UI lost its `focusStyle` on the next hover or press change.
- A touch neither hovered nor pressed its element while the mouse rested
  elsewhere in the window, and a second finger pressed nothing.
- `onPointerDown`, `onPointerMove` and `onPointerUp` never fired on `<svg>`
  shapes.
- The glyphs of a `<text>` stopped the pointer whatever its `focusPolicy`.
- The `cursor` style could come from a node the pointer cannot reach
  (scrolled out, hidden, or beneath a `focusPolicy: "block"` node).
- A drag that left a 3D-transformed element froze `x`/`y` at its edge.
- `<editableText value="…">` mounted empty.
- A hot-reloaded image kept its old mip levels under
  `imageRendering: "trilinear"`.
- A `ref` object (`useRef`) was serialized into the create op and reported
  as an unknown attribute.
- A dev bundle on a build without the `devtools` feature logged two
  `no handler registered` errors at startup.

## [0.7.0] - 2026-10-05

### Added

- **Custom elements.** Register your own JSX intrinsics with
  `app.add_react_element(&ELEMENT)`: a static `Element` declaring its typed
  attributes, writers, events and spawn hook — a UI node or any ECS entity
  (e.g. a 3D mesh). The core elements and the feature crates use the same
  API. Attributes accept `{ animated }` bindings; JSX props are generated
  into `bevy.ts`.
- **Custom style properties.** A static `StyleProperty<T>` registered with
  `app.add_react_style(&PROP)`, applied by your own writer
  (`add_react_style_writer`) or auto-stamped on the entity as
  `StyleValue<T>`. `style` typing is generated into `bevy.ts`.
- **Crate split, `ReactPlugins` and cargo features.** `bevy-react` is now a
  facade over `bevy_react_core` and the element crates (`bevy_react_svg`,
  `_anchor`, `_canvas`, `_portal`, `_surface`), one cargo feature each, all
  on by default. `ReactPlugins` adds `ReactUiPlugin` plus every compiled-in
  element plugin (`.disable::<P>()` drops one); a disabled feature's
  elements warn `featureMissing`. `bevy_react::prelude` carries the
  plugins, macros and messaging APIs. `custom_cursor` (default) is the one
  feature that pulls in `bevy_winit`.
- **`bevy-react build` CLI command** — builds the vendor + app bundles
  (`--watch`, `--prod`), replacing the `build.mjs` every app copied.
- **Docs site:** <https://tulustul.github.io/bevy-react/> — a guide plus a
  generated reference, with the live wasm demo under `/demo/`.
- **Demos:** new "Lumen" design, plus pages for custom elements and custom
  styles.

### Changed

- **Performance.** Op batches cross the bridge as one JSON string, decoded
  in one pass; transitions and animations cost nothing while idle; cheaper
  mount/remove/reorder paths; text color changes no longer re-shape;
  cached layers skip stock extraction, keep persistent render entities and
  bucketed textures; Live `<portal>` targets render only while visible.
- **bevy-react no longer forces Bevy's default features.** Every crate uses
  `default-features = false` and lists what it needs — no more audio, glTF,
  PBR, gilrs or `LogPlugin` pulled into your app.
- **The `#[react_*]` macros need no `serde`/`ts-rs` dependency** in the
  caller.
- Custom filters shadow built-ins in any registration order.
- **Breaking:** `svg-text` feature renamed to `svg_text`;
  `ReactUiPlugin::with_animations` removed (the engine is always on); the
  wire protocol changed — upgrade the crates and the `bevy-react` npm
  package together.

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

[Unreleased]: https://github.com/tulustul/bevy-react/compare/v0.8.1...HEAD
[0.8.1]: https://github.com/tulustul/bevy-react/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/tulustul/bevy-react/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/tulustul/bevy-react/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/tulustul/bevy-react/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/tulustul/bevy-react/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/tulustul/bevy-react/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/tulustul/bevy-react/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/tulustul/bevy-react/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/tulustul/bevy-react/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/tulustul/bevy-react/releases/tag/v0.1.2
