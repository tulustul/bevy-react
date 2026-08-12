# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.3.0]: https://github.com/tulustul/bevy-react/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/tulustul/bevy-react/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/tulustul/bevy-react/releases/tag/v0.1.2
