# Style properties

Every property the `style` prop (and the `hoverStyle`/`pressStyle`/`focusStyle`
state styles) accepts, generated from the library's style registry. An app
can register its own properties on top of these.

**Animatable** properties accept an inline `{ animated: sharedValue }`
binding in place of the value; "per field" means the value is an object whose
individual fields accept one.

| Property | Type | Animatable | Guide |
| --- | --- | --- | --- |
| <span id="display"></span>`display` | `"flex" \| "grid" \| "block" \| "none"` |  | [Flexbox](../layout/flexbox.md) |
| <span id="boxSizing"></span>`boxSizing` | `"borderBox" \| "border-box" \| "contentBox" \| "content-box"` |  | [Sizing](../styling/sizing.md) |
| <span id="positionType"></span>`positionType` | `"absolute" \| "relative"` |  | [Positioning](../layout/positioning.md) |
| <span id="overflowX"></span>`overflowX` | `"visible" \| "clip" \| "hidden" \| "scroll"` |  | [Overflow](../styling/overflow.md) |
| <span id="overflowY"></span>`overflowY` | `"visible" \| "clip" \| "hidden" \| "scroll"` |  | [Overflow](../styling/overflow.md) |
| <span id="scrollbarWidth"></span>`scrollbarWidth` | `number` |  | [Overflow](../styling/overflow.md) |
| <span id="left"></span>`left` | `Length` | yes | [Positioning](../layout/positioning.md) |
| <span id="right"></span>`right` | `Length` | yes | [Positioning](../layout/positioning.md) |
| <span id="top"></span>`top` | `Length` | yes | [Positioning](../layout/positioning.md) |
| <span id="bottom"></span>`bottom` | `Length` | yes | [Positioning](../layout/positioning.md) |
| <span id="width"></span>`width` | `Length` | yes | [Sizing](../styling/sizing.md) |
| <span id="height"></span>`height` | `Length` | yes | [Sizing](../styling/sizing.md) |
| <span id="minWidth"></span>`minWidth` | `Length` | yes | [Sizing](../styling/sizing.md) |
| <span id="minHeight"></span>`minHeight` | `Length` | yes | [Sizing](../styling/sizing.md) |
| <span id="maxWidth"></span>`maxWidth` | `Length` | yes | [Sizing](../styling/sizing.md) |
| <span id="maxHeight"></span>`maxHeight` | `Length` | yes | [Sizing](../styling/sizing.md) |
| <span id="aspectRatio"></span>`aspectRatio` | `number` | yes | [Sizing](../styling/sizing.md) |
| <span id="alignItems"></span>`alignItems` | `"start" \| "end" \| "flexStart" \| "flexEnd" \| "center" \| "baseline" \| "stretch"` |  | [Flexbox](../layout/flexbox.md) |
| <span id="justifyItems"></span>`justifyItems` | `"start" \| "end" \| "center" \| "baseline" \| "stretch"` |  | [Grid](../layout/grid.md) |
| <span id="alignSelf"></span>`alignSelf` | `"auto" \| "start" \| "end" \| "flexStart" \| "flexEnd" \| "center" \| "baseline" \| "stretch"` |  | [Flexbox](../layout/flexbox.md) |
| <span id="justifySelf"></span>`justifySelf` | `"auto" \| "start" \| "end" \| "center" \| "baseline" \| "stretch"` |  | [Grid](../layout/grid.md) |
| <span id="alignContent"></span>`alignContent` | `"start" \| "end" \| "flexStart" \| "flexEnd" \| "center" \| "stretch" \| "spaceBetween" \| "spaceEvenly" \| "spaceAround"` |  | [Flexbox](../layout/flexbox.md) |
| <span id="justifyContent"></span>`justifyContent` | `"start" \| "end" \| "flexStart" \| "flexEnd" \| "center" \| "stretch" \| "spaceBetween" \| "spaceEvenly" \| "spaceAround"` |  | [Flexbox](../layout/flexbox.md) |
| <span id="margin"></span>`margin` | `Rect` |  | [Spacing](../styling/spacing.md) |
| <span id="padding"></span>`padding` | `Rect` |  | [Spacing](../styling/spacing.md) |
| <span id="border"></span>`border` | `Rect` |  | [Borders](../styling/borders.md) |
| <span id="flexDirection"></span>`flexDirection` | `"row" \| "column" \| "rowReverse" \| "columnReverse"` |  | [Flexbox](../layout/flexbox.md) |
| <span id="flexWrap"></span>`flexWrap` | `"nowrap" \| "noWrap" \| "wrap" \| "wrapReverse"` |  | [Flexbox](../layout/flexbox.md) |
| <span id="flexGrow"></span>`flexGrow` | `number` |  | [Flexbox](../layout/flexbox.md) |
| <span id="flexShrink"></span>`flexShrink` | `number` |  | [Flexbox](../layout/flexbox.md) |
| <span id="flexBasis"></span>`flexBasis` | `Length` | yes | [Flexbox](../layout/flexbox.md) |
| <span id="gap"></span>`gap` | `Length` | yes | [Flexbox](../layout/flexbox.md) |
| <span id="rowGap"></span>`rowGap` | `Length` | yes | [Flexbox](../layout/flexbox.md) |
| <span id="columnGap"></span>`columnGap` | `Length` | yes | [Flexbox](../layout/flexbox.md) |
| <span id="gridAutoFlow"></span>`gridAutoFlow` | `"row" \| "column" \| "rowDense" \| "columnDense"` |  | [Grid](../layout/grid.md) |
| <span id="gridTemplateRows"></span>`gridTemplateRows` | `string` |  | [Grid](../layout/grid.md) |
| <span id="gridTemplateColumns"></span>`gridTemplateColumns` | `string` |  | [Grid](../layout/grid.md) |
| <span id="gridAutoRows"></span>`gridAutoRows` | `string` |  | [Grid](../layout/grid.md) |
| <span id="gridAutoColumns"></span>`gridAutoColumns` | `string` |  | [Grid](../layout/grid.md) |
| <span id="gridRow"></span>`gridRow` | `string` |  | [Grid](../layout/grid.md) |
| <span id="gridColumn"></span>`gridColumn` | `string` |  | [Grid](../layout/grid.md) |
| <span id="backgroundColor"></span>`backgroundColor` | `Color` | yes | [Colors](../styling/colors.md) |
| <span id="borderColor"></span>`borderColor` | `Animatable<Color> \| { top?: Color; right?: Color; bottom?: Color; left?: Color }` |  | [Borders](../styling/borders.md) |
| <span id="borderRadius"></span>`borderRadius` | `Rect` | yes | [Borders](../styling/borders.md) |
| <span id="outline"></span>`outline` | `{ width?: Length; offset?: Length; color?: Color }` |  | [Borders](../styling/borders.md) |
| <span id="boxShadow"></span>`boxShadow` | `BoxShadow \| BoxShadow[]` |  | [Shadows](../styling/shadows.md) |
| <span id="filter"></span>`filter` | `FilterChainValue` | per field | [Filters](../styling/filters.md) |
| <span id="backdropFilter"></span>`backdropFilter` | `FilterChainValue` | per field | [Backdrop filters](../styling/backdrop-filters.md) |
| <span id="morphFilter"></span>`morphFilter` | `MorphFilterValue` | per field | [Morph filters](../styling/morph-filters.md) |
| <span id="backgroundGradient"></span>`backgroundGradient` | `Gradient \| Gradient[]` | per field | [Gradients](../styling/gradients.md) |
| <span id="borderGradient"></span>`borderGradient` | `Gradient \| Gradient[]` | per field | [Gradients](../styling/gradients.md) |
| <span id="backgroundImage"></span>`backgroundImage` | `BackgroundImage` | per field | [Background images](../styling/background-images.md) |
| <span id="imageRendering"></span>`imageRendering` | `"auto" \| "bilinear" \| "trilinear" \| "nearest"` |  | [Image rendering](../styling/image-rendering.md) |
| <span id="layoutRounding"></span>`layoutRounding` | `boolean` |  | [Layout rounding](../styling/layout-rounding.md) |
| <span id="zIndex"></span>`zIndex` | `number` |  | [Z-index](../styling/z-index.md) |
| <span id="globalZIndex"></span>`globalZIndex` | `number` |  | [Z-index](../styling/z-index.md) |
| <span id="focusPolicy"></span>`focusPolicy` | `"block" \| "pass"` |  | [Focus policy](../styling/focus-policy.md) |
| <span id="cursor"></span>`cursor` | `SystemCursor \| (string & {})` |  | [Cursors](../styling/cursors.md) |
| <span id="scrollbar"></span>`scrollbar` | `"none" \| "default" \| ScrollbarStyle` |  | [Overflow](../styling/overflow.md) |
| <span id="transform"></span>`transform` | `BevyTransform` | per field | [Transforms](../styling/transforms.md) |
| <span id="transform3d"></span>`transform3d` | `BevyTransform3d` | per field | [3D transforms](../styling/3d-transforms.md) |
| <span id="opacity"></span>`opacity` | `number` | yes | [Opacity](../styling/opacity.md) |
| <span id="groupAlpha"></span>`groupAlpha` | `boolean` |  | [Opacity](../styling/opacity.md) |
| <span id="cache"></span>`cache` | `"auto" \| "always" \| "never"` |  | [Layers](../styling/layers.md) |
| <span id="transition"></span>`transition` | `BevyTransition` |  | [Style transitions](../animations/style-transitions.md) |
| <span id="color"></span>`color` | `Color` | yes | [<text>](../elements/text.md) |
| <span id="fontSize"></span>`fontSize` | `FontSize` |  | [<text>](../elements/text.md) |
| <span id="fontWeight"></span>`fontWeight` | `"thin" \| "light" \| "normal" \| "medium" \| "semibold" \| "bold" \| "black" \| (string & {})` |  | [<text>](../elements/text.md) |
| <span id="fontFamily"></span>`fontFamily` | `string` |  | [<text>](../elements/text.md) |
| <span id="textAlign"></span>`textAlign` | `"left" \| "center" \| "right" \| "justify" \| "start" \| "end"` |  | [<text>](../elements/text.md) |
| <span id="lineHeight"></span>`lineHeight` | `number \| string \| { px: number }` |  | [<text>](../elements/text.md) |
| <span id="letterSpacing"></span>`letterSpacing` | `number \| string \| { rem: number }` |  | [<text>](../elements/text.md) |
| <span id="textShadow"></span>`textShadow` | `{ color?: Color; offsetX?: number; offsetY?: number }` |  | [<text>](../elements/text.md) |
| <span id="lineBreak"></span>`lineBreak` | `"wordBoundary" \| "anyCharacter" \| "wordOrCharacter" \| "noWrap"` |  | [<text>](../elements/text.md) |

## Value types

The named types used above, as declared in the `bevy-react` package.

### `Length`

```ts
/** A length: a bare number is logical pixels; a string carries a unit
 *  (`"50%"`, `"100vw"`, `"100vh"`, `"50vmin"`, `"50vmax"`, `"10px"`, `"auto"`). */
export type Length = number | string;
```

### `Rect`

```ts
/** Four sides/corners: a number (uniform), a CSS shorthand string
 *  (`"8px"`, `"8px 16px"`, `"1px 2px 3px 4px"`), an explicit per-side object, or
 *  an axis pair — `horizontal` sets left + right, `vertical` sets top + bottom.
 *  On `borderRadius` the sides name the four corners, so `horizontal` is the
 *  top-right + bottom-left pair. */
export type Rect =
  | number
  | string
  | { top?: Length; right?: Length; bottom?: Length; left?: Length }
  | { horizontal?: Length; vertical?: Length };
```

### `Color`

```ts
/** A CSS color string. Accepts hex (`"#f00"`, `"#1e1e2e"`, `"#1e1e2eaa"`), a
 *  named color (`"red"`, `"rebeccapurple"`), `"transparent"`, or functional
 *  notation: `"rgb(255 0 0 / 50%)"` / `"rgba(255,0,0,.5)"`, `"hsl(0 100% 50%)"`,
 *  `"hwb(0 0% 0%)"`, `"oklab(0.7 0.1 0.05)"`, `"oklch(0.7 0.1 30)"`. An
 *  unrecognized value renders as a loud magenta (and logs a warning). */
export type Color = string;
```

### `BoxShadow`

```ts
/** One drop shadow. Offsets/radii are [`Length`]s (bare number = px). */
export type BoxShadow = {
  color?: Color;
  xOffset?: Length;
  yOffset?: Length;
  spreadRadius?: Length;
  blurRadius?: Length;
};
```

### `FilterChainValue`

```ts
/** The `filter` style value: one [`FilterUse`] (a 1-element chain) or an
 *  ordered array of them — chain order is pass order. */
export type FilterChainValue = FilterUse | FilterUse[];
```

### `MorphFilterValue`

```ts
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
```

### `Gradient`

```ts
/** One gradient. `angle`/`start` are [`Angle`]s (bare number = degrees; `0` = to
 *  top, clockwise). Every numeric/color leaf accepts an `{ animated }` binding
 *  (degrees / px / raw `0..1` wire units; a binding parks that surface's
 *  `transition` channel). */
export type Gradient =
  | {
      type: "linear";
      angle?: Animatable<Angle>;
      stops: GradientStop[];
      colorSpace?: ColorSpace;
    }
  | {
      type: "radial";
      position?: GradientPosition;
      shape?: RadialShape;
      stops: GradientStop[];
      colorSpace?: ColorSpace;
    }
  | {
      type: "conic";
      start?: Animatable<Angle>;
      position?: GradientPosition;
      stops: AngularStop[];
      colorSpace?: ColorSpace;
    };
```

### `BackgroundImage`

```ts
/** A `backgroundImage` style value. `src` is an asset path (like an `<image>`'s
 *  `src`), or `{ texture }` naming a render target the app registered in
 *  `RenderTargets` — it binds late (transparent until registered; prefer
 *  fixed-resolution targets: a background never drives an auto target's size). */
export type BackgroundImage = {
  /** Asset path, or `{ texture }` naming an app-registered texture
   *  (`RenderTargets::register`) — **static** content that binds late
   *  (transparent until registered). For live/continuously-updating content
   *  use a `<portal>` element instead; backgrounds don't participate in
   *  live-repaint tracking. */
  src: string | { texture: string };
  /** Tint multiplied with the texture; `opacity` fades it like a background
   *  color. Animatable via an `interpolateColor` binding — in the base style
   *  only (variant styles ignore bindings). */
  tint?: Animatable<Color>;
  /** Fit/repeat mode (default `"stretch"`). */
  mode?: BackgroundImageMode;
  /** Tile scale for the repeat modes, in logical px (`1` = the texture's own
   *  size at 1× DPI, on every display). Ignored — with a devtools warning —
   *  under `"stretch"`. An `{ animated }` wrapper decodes but does not drive
   *  the value yet. */
  scale?: number;
};
```

### `SystemCursor`

```ts
/** The built-in system cursor keywords (winit's `SystemCursorIcon`, camelCase or CSS
 *  kebab-case). Used by the `cursor` style prop; a custom-cursor name (registered on
 *  the Rust side via `add_custom_cursor`) is any other string. */
export type SystemCursor =
  | "default"
  | "contextMenu"
  | "help"
  | "pointer"
  | "progress"
  | "wait"
  | "cell"
  | "crosshair"
  | "text"
  | "verticalText"
  | "alias"
  | "copy"
  | "move"
  | "noDrop"
  | "notAllowed"
  | "grab"
  | "grabbing"
  | "eResize"
  | "nResize"
  | "neResize"
  | "nwResize"
  | "sResize"
  | "seResize"
  | "swResize"
  | "wResize"
  | "ewResize"
  | "nsResize"
  | "neswResize"
  | "nwseResize"
  | "colResize"
  | "rowResize"
  | "allScroll"
  | "zoomIn"
  | "zoomOut";
```

### `ScrollbarStyle`

```ts
/** Configures a node's visible scrollbar (the object form of `style.scrollbar`).
 *  A bar appears per axis that is `overflow: scroll` **and** overflows, and
 *  auto-hides when its content fits. */
export interface ScrollbarStyle {
  /** Styles the track (the groove behind the thumb). */
  track?: ScrollbarPartStyle;
  /** Styles the thumb (the draggable handle). */
  thumb?: ScrollbarPartStyle;
  /** Bar cross-axis size in logical px (default `12`). */
  thickness?: number;
  /** Minimum thumb length in logical px, so it stays grabbable on long content
   *  (default `24`). */
  minThumbLength?: number;
  /** `"gutter"` (default) reserves space so content shrinks and the bar sits in
   *  its own track; `"float"` reserves nothing and floats the bar over content. */
  position?: "gutter" | "float";
  /** Which edge the vertical bar sits on (default `"right"`). */
  verticalSide?: "left" | "right";
  /** Which edge the horizontal bar sits on (default `"bottom"`). */
  horizontalSide?: "top" | "bottom";
}
```

### `BevyTransform`

```ts
/** A static 2D transform (`style.transform`). With `transition` a change
 *  eases instead of snapping. `translateX`/`translateY` are [`Length`]s (bare
 *  number = logical pixels, or a unit string like `"50%"`/`"10vw"`, resolved
 *  against the node's own size). `scale` is uniform; `scaleX`/`scaleY`
 *  override one axis. `rotate` is an [`Angle`] (bare number = degrees, e.g.
 *  `45`, or `"1.5rad"`). */
export interface BevyTransform {
  translateX?: Animatable<Length>;
  translateY?: Animatable<Length>;
  scale?: Animatable<number>;
  scaleX?: Animatable<number>;
  scaleY?: Animatable<number>;
  /** Bound values are **degrees**, like the static [`Angle`] form. */
  rotate?: Animatable<Angle>;
}
```

### `BevyTransform3d`

```ts
/** A 3D perspective transform (`style.transform3d`), applied to the
 *  subtree's *rendered result* at composite time (group semantics, like
 *  `opacity`/`filter`). Its presence — even an empty `{}` — promotes the
 *  subtree to a composited layer; animating it never re-captures
 *  (composite-time cost, like translation). Picking, hover, and cursor follow
 *  the transformed visual. Field order is fixed: scale → rotateX → rotateY →
 *  rotateZ → translate, then the self `perspective` projection, all around
 *  `origin`.
 *
 *  Units: translations and `perspective` are logical px; rotations are
 *  [`Angle`]s (bare number = degrees); `origin` is per-axis px-or-percent of
 *  the border box (default `"50%"`/`"50%"` = center). `translateZ` is only
 *  visible with `perspective` (positive = toward the viewer = magnify).
 *  Backfaces render mirrored and stay clickable.
 *
 *  With `transition: { transform3d }` changes ease field-wise (perspective
 *  snaps when either endpoint is orthographic). Unsetting the whole field
 *  demotes the layer and **snaps** — keep an identity `{}` in the base style
 *  when removal should ease. Avoid hover-triggered transforms that move the
 *  element out from under the cursor (hover flips off → moves back →
 *  oscillates, as in CSS). */
export interface BevyTransform3d {
  /** Focal distance in logical px (CSS `perspective(d)`); unset = orthographic. */
  perspective?: Animatable<number>;
  translateX?: Animatable<number>;
  translateY?: Animatable<number>;
  translateZ?: Animatable<number>;
  rotateX?: Animatable<Angle>;
  rotateY?: Animatable<Angle>;
  rotateZ?: Animatable<Angle>;
  scale?: Animatable<number>;
  scaleX?: Animatable<number>;
  scaleY?: Animatable<number>;
  /** Pivot + vanishing point, relative to the border box (bound axes in px). */
  origin?: { x: Animatable<Length>; y: Animatable<Length> };
}
```

### `BevyTransition`

```ts
/** Per-channel transition timing. Every channel is explicit — there is no
 *  fallback key; `transform` covers all transform channels together. */
export interface BevyTransition {
  transform?: BevyTransitionSpec;
  opacity?: BevyTransitionSpec;
  backgroundColor?: BevyTransitionSpec;
  /** Eases `backgroundGradient` between style states, whole-value. Structures
   * must match STRICTLY (same kind, stop count, colorSpace, position, shape
   * variant) — any mismatch snaps immediately with a devtools warning. Setting
   * or unsetting the gradient always snaps: fade via a transparent-stops
   * gradient in the base style instead. Stop colors ease in sRGB (the
   * backgroundColor space); angles ease numerically (350 to 10 goes the long
   * way, like CSS). */
  backgroundGradient?: BevyTransitionSpec;
  /** The `borderGradient` twin of `backgroundGradient`, independent of it. */
  borderGradient?: BevyTransitionSpec;
  /** Covers the size channels (`width`/`height`/`maxWidth`/`maxHeight`). These are
   * layout properties, so easing one re-flows surrounding content — a real
   * accordion. Needs an explicit pixel target (e.g. `maxHeight: open ? 300 : 0`);
   * `auto`/unknown heights snap. Pair with `overflowY: "clip"`. */
  size?: BevyTransitionSpec;
  /** Eases `borderRadius` per corner between style states — every wire form
   * (uniform, shorthand, per-corner object), so uniform-to-per-corner eases too.
   * Same-unit corners interpolate; a corner that changes unit (or hits `auto`)
   * snaps on its own. Unsetting the field eases to square corners. The radius
   * is a layout property (it lives on the node), so like `size` every eased
   * frame is a relayout. An `{ animated }` binding on `borderRadius` parks it. */
  borderRadius?: BevyTransitionSpec;
  /** Eases the scroll offset (`ScrollPosition`) of an `overflow: scroll` node
   * toward its target — a controlled `scrollTop`/`scrollLeft` change or accumulated
   * wheel input — instead of snapping (smooth scroll). Covers both axes. Direct
   * scrollbar manipulation (thumb drag, track click) bypasses the ease and snaps.
   * Don't also feed `onScroll` back into the same controlled axis, or the round-trip
   * fights the ease (drive the target from buttons/state; read `onScroll` into
   * separate state). */
  scroll?: BevyTransitionSpec;
  /** Eases the layer-based `filter` chain between style states: same-name chains
   * interpolate their params; a chain extended/truncated at the end over built-in
   * filters fades through identity values (hover-adds-blur fades in); anything
   * else swaps wholesale at the midpoint. */
  filter?: BevyTransitionSpec;
  /** Eases the `backdropFilter` chain — the second, independent instance of the
   * `filter` channel (same whole-value strategy and ease-to-empty snap: unsetting
   * `backdropFilter` demotes and snaps, so keep an identity entry — e.g.
   * `{ name: "blur", params: { radius: 0 } }` — when removal should ease). */
  backdropFilter?: BevyTransitionSpec;
  /** Eases the `transform3d` fields together (composite-time — animating never
   * re-captures the layer). `perspective` snaps when either endpoint is
   * orthographic; unsetting the whole `transform3d` style demotes and snaps —
   * keep an identity `{}` in the base style when removal should ease. */
  transform3d?: BevyTransitionSpec;
  /** Times the `morphFilter` progress (the engine-owned 0→1 blend from the
   * frozen old appearance to the live content on a `key` change). Unlike every
   * other channel it has a BUILT-IN default (300ms ease-in-out) — a key change
   * animates even with no `transition` at all; this entry overrides the
   * timing. */
  morphFilter?: BevyTransitionSpec;
  /** Eases the node's LAID-OUT rect (position + size together) whenever layout
   * moves or resizes it, whatever the cause — a sibling insert/remove/reorder,
   * a parent resize, a re-wrap, a window resize (FLIP). The real layout still
   * snaps (no relayout, no layer); the node glides from its old rect, children
   * ride the translation (not the scale), picking follows. A size change scales
   * only the node's OWN paint — children stay crisp at their final offsets —
   * but nothing laid out AROUND the node eases (siblings snap to the final
   * layout): a container whose size must re-flow its surroundings wants the
   * real-layout `size` channel instead, with `layout` on its children. The
   * first layout adopts silently (no enter animation;
   * unmount can't animate) and `display: none` → shown grows in place. The
   * node's own `size` channel or a `{ animated }` binding on a layout field
   * owns its rect (the layout channel adopts, they compose); a rect moved every
   * frame by anything else (an ancestor's `size` ease) lags, then catches up. */
  layout?: BevyTransitionSpec;
  /** Times a shared-element flight (see the `sharedTag` prop): when this node
   * mounts as the incoming half of a tag pair, every channel seeded from the
   * outgoing node — its rect (position via translation, size in measured px
   * through real layout), background color, opacity, transforms, filters,
   * gradients — eases with THIS one spec, overriding the per-channel specs
   * for the flight only (ordinary later changes use their own). Required for
   * the flight; explicit-only like every channel (no built-in default). */
  sharedElement?: BevyTransitionSpec;
}
```

### `FontSize`

```ts
/** A font size: a bare number is logical pixels, or a unit string — `"24px"`,
 *  `"2vw"`/`"2vh"`/`"2vmin"`/`"2vmax"`, or `"1.5rem"` (relative to Bevy's `RemSize`,
 *  default 20px). CSS `em` is not supported (no Bevy equivalent). */
export type FontSize = number | string;
```

### `FilterUse`

```ts
/** One filter invocation in a chain: a registered filter name (e.g. `"blur"`,
 *  `"hueRotate"`) plus its parameters, typed per name via [`BevyFilters`].
 *  Every param is individually optional: an omitted param takes the filter's
 *  Rust-side default (for built-ins the shorthand-default convention: a
 *  *visible* effect — `{ name: "grayscale" }` is *full* grayscale like CSS
 *  `grayscale()`, and a bare `blur` is a visible 20px blur unlike CSS's 0 —
 *  and the field's `#[serde(default)]` for customs).
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
```

### `Angle`

```ts
/** A CSS angle: a bare number is **degrees**, or a unit string (`"45deg"`,
 *  `"1.5rad"`, `"0.25turn"`, `"100grad"`). */
export type Angle = number | string;
```

### `GradientStop`

```ts
/** A linear/radial color stop. `position` places it along the gradient line
 *  (absent → auto-spaced); `hint` is the `0..1` interpolation midpoint to the
 *  next stop (default `0.5`). All three leaves are animatable — `color` via an
 *  `interpolateColor` binding, `position` in logical px, `hint` raw `0..1`
 *  (base-style only). */
export type GradientStop = {
  color: Animatable<Color>;
  position?: Animatable<Length>;
  hint?: Animatable<number>;
};
```

### `ColorSpace`

```ts
/** Color space a gradient interpolates in (default `"oklab"`). */
export type ColorSpace =
  | "oklab"
  | "oklch"
  | "oklchLong"
  | "srgb"
  | "linearRgb"
  | "hsl"
  | "hslLong"
  | "hsv"
  | "hsvLong";
```

### `GradientPosition`

```ts
/** Named center anchor for a radial/conic gradient (default `"center"`). */
export type GradientPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";
```

### `RadialShape`

```ts
/** Size/shape of a radial gradient (default `"closestCorner"`). The explicit
 *  radii are animatable (a bound radius animates in logical px; base-style
 *  only). */
export type RadialShape =
  | "closestSide"
  | "farthestSide"
  | "closestCorner"
  | "farthestCorner"
  | { circle: Animatable<Length> }
  | { ellipse: [Animatable<Length>, Animatable<Length>] };
```

### `AngularStop`

```ts
/** A conic color stop. `angle` is an [`Angle`] (bare number = degrees; absent →
 *  auto-spaced). All three leaves are animatable — `color` via an
 *  `interpolateColor` binding, `angle` in degrees, `hint` raw `0..1`
 *  (base-style only). */
export type AngularStop = {
  color: Animatable<Color>;
  angle?: Animatable<Angle>;
  hint?: Animatable<number>;
};
```

### `BackgroundImageMode`

```ts
/** How a `backgroundImage` fits its node: `"stretch"` (default — fill the box
 *  exactly, aspect ignored) or the repeat modes (tile at the texture's logical
 *  size × `scale`). Unlike an `<image>`'s [`ImageMode`] there is no `"auto"` —
 *  a background never affects layout. */
export type BackgroundImageMode = "stretch" | "repeat" | "repeatX" | "repeatY";
```

### `ScrollbarPartStyle`

```ts
/** Styling for one scrollbar part (the `track` groove or the draggable `thumb`),
 *  with optional interaction-state overlays. `pressed` wins over `hover`, which
 *  overlays the base. (Scrollbars take no keyboard focus, so there is no `focused`
 *  state.) */
export interface ScrollbarPartStyle extends ScrollbarPartVisual {
  /** Overlaid while the pointer is over this part. */
  hover?: ScrollbarPartVisual;
  /** Overlaid while the bar is being dragged (wins over `hover`). */
  pressed?: ScrollbarPartVisual;
}
```

### `BevyTransitionSpec`

```ts
/** Timing for one transition channel: a timing curve (default) or, if `stiffness`
 *  or `damping` is given, a spring. `duration`/`delay` are [`Time`]s — a bare
 *  number is **milliseconds**, or a unit string (`"0.2s"`). */
export type BevyTransitionSpec = {
  /** Timing duration (default `300` ms). Ignored for a spring. */
  duration?: Time;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  /** Hold this long before easing (default `0`). */
  delay?: Time;
  /** Spring stiffness; its presence (with/without `damping`) selects a spring. */
  stiffness?: number;
  damping?: number;
  mass?: number;
};
```

### `ScrollbarPartVisual`

```ts
/** The paint properties of one scrollbar part in one interaction state.
 *  Deliberately **not** a full [`BevyStyle`]: the thumb is a headless Bevy widget
 *  with no layout node, so only these apply. Size/placement come from the parent
 *  [`ScrollbarStyle`] (`thickness`) — a part never sets its own width/height. */
export interface ScrollbarPartVisual {
  /** Fill color (any CSS [`Color`]). */
  backgroundColor?: Color;
  /** Border color: one CSS [`Color`] for all sides, or a per-side object. */
  borderColor?:
    | Color
    | { top?: Color; right?: Color; bottom?: Color; left?: Color };
  /** Corner radii (same forms as any [`Rect`]). */
  borderRadius?: Rect;
  /** Border thickness (same forms as any [`Rect`]). */
  border?: Rect;
}
```

### `Time`

```ts
/** A CSS time/duration: a bare number is **milliseconds**, or a unit string
 *  (`"200ms"`, `"0.2s"`). */
export type Time = number | string;
```
