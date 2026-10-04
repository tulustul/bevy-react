# Findings from writing the docs site (2026-10-04)

Collected by the docs writers while checking every page against the code.
Everything here comes from **reading** the code; nothing was run. The guide
pages document the current behavior (often as a "Limits" entry), so fixing an
item means updating its page too.

## Bugs: a bad value drops the whole commit

A value that fails serde decoding makes `op_flush` throw, so the whole React
commit is lost, not just that prop (`js_thread.rs:68`, `bridge.ts:270`).

- Radial gradient `shape`: the TS `RadialShape` (`js/src/jsx.d.ts`) declares
  `"closestSide"` / `{ circle: 40 }` / `{ ellipse: [..] }`. Rust only accepts
  `{ keyword }` / `{ circle: { circle } }` / `{ ellipse: { ellipse } }`
  (`protocol/visual.rs`). So the typed form throws. The gradients page shows
  the working form with an `as any` cast. (Extends the existing TODO bug.)
- A fractional `zIndex`/`globalZIndex` (e.g. `1.5`) fails to decode.
- A numeric `fontWeight` (e.g. `800`) fails to decode (TS prevents it).
- A custom style or attribute value that fails decoding throws the same way.

## Bugs: behavior

- **Opacity replaces alpha.** With any `transition` style or `{ animated }`
  opacity, on a node that isn't promoted to a layer, opacity _replaces_ the
  alpha of the background, text and tint instead of multiplying it
  (`transition/mod.rs` ~551, `write_final_alpha`).
- **Hover-only styles stick.** A hover-only `transform` / `transform3d`
  sticks after hover ends: the writers never remove `UiTransform`
  (`style/writers/layer.rs:37-56`).
- **Channels keep stale state.** When a state leaves a property unset, the
  transition channel snaps and keeps its stale target, so the next change
  snaps too. Affects transform fields, opacity and backgroundColor
  (`transition/mod.rs` ~455-485, ~511).
- **2D transform fields drop.** While any field of a 2D `transform` has an
  `{ animated }` binding, its static fields are dropped to identity
  (`animations/apply/mod.rs:378-414`). `transform3d` keeps them.
- **TextLayout is never removed.** `TEXT_LAYOUT_WRITER` never removes
  `TextLayout`, so unsetting `textAlign`/`lineBreak` keeps the old layout.
- **`multiline` only applies at spawn.** On `<editableText>`, changing
  `multiline` after mount doesn't update the wrapping mode (`editable.rs`).
- **Focus observers fire on ancestors.** `on_focus_gained`/`on_focus_lost`
  are global observers of bubbling events, so they re-run per ancestor.
  `focusStyle` likely acts like `:focus-within` (`elements/editable.rs:299-320`).
- **`ClickOwner` from enter/leave handlers.** `ClickOwner` is stamped for any
  `onPointer*` handler, enter/leave included. So a child with only
  `onPointerEnter` swallows its ancestor's clicks (`reconcile/stamps.rs:162`).
  A `<button>` without `onClick` also swallows clicks.
- **Unanswered requests never settle.** A request no observer answers stays
  pending forever: `Responder` has no `Drop`, and JS never clears
  `pendingRequests`.
- **Message errors skip devtools.** Malformed/unknown messages log via
  `tracing` only, not `diag`.
- **Keyboard events while editing.** `keyDown`/`keyUp` fire while an
  `<editableText>` is focused.
- **Wheel ignores non-listening blockers.** The topmost `onWheel` listener is
  picked by geometry, so a non-listening element (a modal) doesn't block a
  listener under it.
- **Wheel hit-test vs `<surface>` UI.** The wheel/scroll hit-test uses the
  window cursor in physical space against all UI nodes, so it may hit
  `<surface>` UI whose texture coordinates line up (`scroll.rs`).
- **Cursor ignores clipping.** The cursor hit-test ignores ancestor clipping
  (`cursor.rs` `window_cursor`).
- **3D-transform picking only remaps the mouse.** It remaps only
  `PointerId::Mouse` (`layer/pick3d.rs` ~199, ~302), so touch hits the
  untransformed box.
- **Promoted layers cut off overflow.** A promoted layer's capture is the
  border box plus filter outset, so the root's own `boxShadow`/`outline` and
  overflowing children are cut off (`layer.rs:119`).
- **Scrollbar gutter side.** With `verticalSide: "left"` /
  `horizontalSide: "top"` + `position: "gutter"`, the gutter is still
  reserved right/bottom (the demos' "Left-side scrollbars" case). And
  `scrollbar.rs:636-638` assumes the parent has no border.
- **SVG-mode `<image>` sizing.** It rasterizes at the border box but draws
  into `visualBox` (content box by default), so uneven padding stretches it.
- **Canvas default fill.** The default fill is white (`RasterState::default`).
  Web is black, and the JS getter starts at `#000000`.
- **Canvas color errors.** An unparsable canvas color paints black with no
  diag warning (`parse_rgba8`).
- **`<anchor>` scale.** `<anchor>` overwrites `UiTransform.scale` every frame,
  so a `transform.scale` style has no effect. It also only hides behind the
  camera or past the far plane, not when off-screen
  (`anchor/src/position.rs:118-122`).
- **`<anchor>` warnings bypass diag.** `AnchorScaling::sanitized` logs with
  `tracing::warn!` instead of `diag` (`position.rs:37,44`).
- **`<anchor>` camera fallback.** With no `IsDefaultUiCamera`, `<anchor>`
  projects through the first other camera (maybe a portal or surface one).
- **Serde renames break filter bindings.** `#[react_filter]` names param
  slots after the Rust field, so a `#[serde(rename)]` field's `{ animated }`
  binding never finds its slot (`crates/macros/src/lib.rs` ~396).
- **Web: integers above 2^53.** An outbound payload with an integer above
  2^53 fails to encode in `drain_outbound` (`host/web.rs`) and is dropped, so
  the request never resolves.
- **64-bit typing.** `i64`/`u64` are typed `bigint`, but the runtime value is
  a JS number.
- **Codegen package imports.** `ts_codegen.rs:121-128` adds `bevy-react`
  package imports only for element types. A custom style codec naming a
  package type may not resolve.
- **Devtools on release.** A dev JS bundle on a release binary sends
  `devtools.*` requests that nothing answers.
- **Vendor globals.** `vendorGlobalPlugin` (`js/build-lib.mjs`) redirects
  `react-reconciler`/`scheduler`, but `VENDOR_KEYS` doesn't export them.
- **Shader errors are terminal-only.** Filter shader compile errors are a
  terminal warning only, not a devtools diag.
- **Tab navigation.** It never works out of the box: there is no
  `TabNavigationPlugin` and no `TabGroup`.
- **Rejected edits don't revert.** Rejecting an `<editableText>` edit in
  `onChange` doesn't revert the field, because an unchanged `value` prop is
  never re-sent.
- **Default easing.** Transitions and `withTiming` default to `"linear"`
  (CSS is `ease`). A `transition: { morphFilter: { duration } }` without
  `easing` is linear, not the built-in ease-in-out. Intended?
- **Static shared-element sources.** A shared element whose outgoing node has
  no `transition` style seeds only rect, transform and background color
  (`shared.rs` `snapshot`).

## Stale code docs / comments

- `crates/core/src/js_thread.rs:9-10` and CLAUDE.md "Hot reload": a sync error
  in a reloaded bundle does NOT rebuild the runtime. The update is rejected
  and the last good `app.js` re-runs (`js_thread.rs:349-380`).
- `js/src/jsx.d.ts`:
  - `WheelEventData.deltaY` "positive is wheel-down": it is Bevy's raw delta,
    where positive = wheel up.
  - `onPointerMove` "fires each frame the button stays down": it fires only on
    movement.
  - `BevyTransition.size` "needs an explicit pixel target": any same-unit pair
    eases.
  - Gradient mismatch "with a devtools warning": it snaps silently. Same in
    `GradientsDemo.tsx`.
  - `sharedElement` "overrides per-channel specs": the code is
    `own.or(shared)`. The same claim is in `transition/spec.rs`, CONTEXT.md
    and `SharedElementsDemo.tsx`.
  - `SystemCursor` says `add_custom_cursor`: the API is `ReactUiPlugin::cursor`.
  - `BevyTransform3d` says picking follows the visual: mouse only.
- `crates/core/src/style/props/visual.rs` `BOX_SHADOW`: "back-to-front (first
  paints on top)" contradicts itself; the first shadow is at the back.
- `crates/core/src/style/props/text.rs:42-44`: `letterSpacing` `{ rem }` is
  `RemSize`-relative, not font-size-relative.
- `crates/core/src/bridge.rs` `ReactNode` doc: lists `BorderRadius` (it lives
  on `Node` in 0.19), and `TabIndex` as app-owned (`<editableText>` inserts it).
- `crates/core/src/scroll.rs` `apply_scroll` doc: says `over_ui`; the code
  sets `wheel_captured`.
- `crates/core/src/plugin.rs:695`: keyboard events are global
  `bevy.on("keyDown")`, not `onKeyDown` props.
- `js/src/bridge.ts:349` `emit` comment: mentions `MessageReader<ReactMessage>`
  (stale).
- `crates/core/src/gamepad.rs` `GamepadRumble` "start (or restart)": `Add`
  stacks rumbles.
- `crates/surface/src/registry.rs:70-71`: `<surface name=…>` should be `target`.
- `crates/canvas/src/draw.rs` `FillStyle`/`StrokeStyle`: "hex only", but any
  CSS color parses.
- `crates/core/src/elements/editable.rs:299-320`: "originally focused entity"
  is wrong (see focus bubbling above).
- `crates/bevy-react/src/lib.rs:40`: `version = "0.7"` while the workspace is
  0.6.0.
- `examples/demos/main.rs:20,67-68`: `cargo run -p bevy-react --example demos`
  should be `cargo run -p demos`.
- Memory note on text spans: the unset default is 20px (Bevy `TextFont`), not
  16px.

## Stale demo prose (examples/demos/ui/src/demos/)

- `elements/SvgDemo.tsx` PAGE: `<svg viewBox style={{ width: 56 }}>` gives zero
  height (no intrinsic size).
- `elements/surfaceDemo/SurfaceDemo.tsx`: "the `name` ties the element to a
  surface" should say `target`.
- `elements/TextDemo.tsx:16`: text CAN render outside `<text>` (it becomes
  white 20px text in Bevy's font).
- `elements/RootDemo.tsx:13,43,113`: the default `globalZIndex` is only 1; the
  root is a column, not centered.
- `elements/EditableTextDemo.tsx` (~35): Bevy fires `FocusLost` before
  `FocusGained`.
- `layout/GridDemo.tsx:16-17,27-29`: not "full CSS syntax". No `minmax()`,
  `fit-content()`, auto-fill/auto-fit, multi-track `repeat`, named lines, or
  `"span 2 / 4"`.
- `styling/FocusPolicyDemo.tsx:22,41`: only the topmost click owner fires;
  "both counters advance" is wrong.
- `styling/OpacityDemo.tsx` (~99): with `groupAlpha: false`, only the node's
  own fills fade.
- `styling/BackgroundImageDemo.tsx` Rust snippet: the path is
  `bevy_react::RenderTargets`, not `bevy_react::portal::RenderTargets`.
- `styling/ImageRenderingDemo.tsx:180,240`: `duration: 0.2` means 0.2 ms;
  should be `200`.
- `styling/morphFilterDemo/MorphFilterDemo.tsx:63`: references an "enter &
  exit row" that doesn't exist.
- `events/MouseDemo.tsx` WHEEL_TSX: "Wheel up (deltaY < 0) zooms in" is
  probably backwards (positive = up).

## Other

- `js/templates/ui/package.json` still lists `react-refresh` as a
  devDependency.
- The `getrandom` cfg flag in `.cargo/config.toml` may be redundant with the
  `wasm_js` feature.
