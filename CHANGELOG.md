# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
