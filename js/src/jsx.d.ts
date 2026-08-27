// Shared prop/style types for the host elements the bevy-react renderer
// understands. The JSX element registry itself lives in `jsx-runtime.ts`; point
// your tsconfig at it with `"jsx": "react-jsx"` + `"jsxImportSource": "bevy-react"`.
// Import `BevyStyle` here to type a shared style object.

import type { Key, ReactNode, Ref } from "react";
import type { Animatable } from "./animated";
import type { BevyCanvasElement, CanvasPainter, DrawCmd } from "./canvas";
import type { FilterChainValue, MorphFilterValue } from "./filters";

/** Attributes React manages itself (not real host props — React strips `key`
 *  before props reach the reconciler). Shared by every host element so keyed
 *  lists type-check. Most host elements take no `ref` — `<canvas>` is the
 *  exception (its ref resolves to a persistent `BevyCanvasElement` handle,
 *  typed on `BevyCanvasProps`). */
export interface BevyAttributes {
  key?: Key | null | undefined;
  /** Names the element's Bevy entity: the value lands on it as a Bevy `Name`
   *  component and in the `ReactNodes` index, so app systems can find
   *  React-created entities (`Query<(Entity, &Name), With<ReactNode>>` or
   *  `ReactNodes::get("hud")`) and attach their own components, read layout,
   *  or watch mount/unmount. Not unique — a list can name every card `"card"`
   *  (`ReactNodes::all`). Dynamic: a change renames, removing it (or `""`)
   *  drops the `Name`. Bridge-owned: Rust code must not set `Name` on React
   *  nodes itself. */
  name?: string;
  /** Shared-element identity. When one commit unmounts a node with this tag
   *  and mounts another with the same tag — a different parent, a different
   *  screen; React has no reparenting, so a "move" is always unmount + mount —
   *  the incoming node starts where the outgoing one visually was: its
   *  position and size (the rect it showed, mid-flight included), its
   *  background color, opacity, transforms, filters and gradients, and eases
   *  to its own layout and style with `transition: { sharedElement }` on the
   *  incoming node (required — a tag without it pairs but snaps). Pairing
   *  rules: same tag, same element type, same UI root (a `<surface>`/`<root>`
   *  is its own), same commit; the first mounted matching outgoing node seeds
   *  every incoming node with the tag, silently. Unique tags per screen
   *  (`hero-${id}`) are the intent. Size flies in measured px through real
   *  layout (the parent re-flows each frame; children stay crisp); position by
   *  translation; the outgoing node unmounts instantly; the flight is clipped
   *  by the new parent's overflow like any layout transition. A `""` is
   *  untagged. */
  sharedTag?: string;
}

/** A length: a bare number is logical pixels; a string carries a unit
 *  (`"50%"`, `"100vw"`, `"100vh"`, `"50vmin"`, `"50vmax"`, `"10px"`, `"auto"`). */
export type Length = number | string;

/** A CSS color string. Accepts hex (`"#f00"`, `"#1e1e2e"`, `"#1e1e2eaa"`), a
 *  named color (`"red"`, `"rebeccapurple"`), `"transparent"`, or functional
 *  notation: `"rgb(255 0 0 / 50%)"` / `"rgba(255,0,0,.5)"`, `"hsl(0 100% 50%)"`,
 *  `"hwb(0 0% 0%)"`, `"oklab(0.7 0.1 0.05)"`, `"oklch(0.7 0.1 30)"`. An
 *  unrecognized value renders as a loud magenta (and logs a warning). */
export type Color = string;

/** A CSS angle: a bare number is **degrees**, or a unit string (`"45deg"`,
 *  `"1.5rad"`, `"0.25turn"`, `"100grad"`). */
export type Angle = number | string;

/** A CSS time/duration: a bare number is **milliseconds**, or a unit string
 *  (`"200ms"`, `"0.2s"`). */
export type Time = number | string;

/** A font size: a bare number is logical pixels, or a unit string — `"24px"`,
 *  `"2vw"`/`"2vh"`/`"2vmin"`/`"2vmax"`, or `"1.5rem"` (relative to Bevy's `RemSize`,
 *  default 20px). CSS `em` is not supported (no Bevy equivalent). */
export type FontSize = number | string;

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

/** A conic color stop. `angle` is an [`Angle`] (bare number = degrees; absent →
 *  auto-spaced). All three leaves are animatable — `color` via an
 *  `interpolateColor` binding, `angle` in degrees, `hint` raw `0..1`
 *  (base-style only). */
export type AngularStop = {
  color: Animatable<Color>;
  angle?: Animatable<Angle>;
  hint?: Animatable<number>;
};

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

/** One drop shadow. Offsets/radii are [`Length`]s (bare number = px). */
export type BoxShadow = {
  color?: Color;
  xOffset?: Length;
  yOffset?: Length;
  spreadRadius?: Length;
  blurRadius?: Length;
};

/** How a 9-slice section scales when resized: `"stretch"`, or `{ tile }` where
 *  `tile` is the repeat threshold (`stretch_value`). */
export type ImageSliceScale = "stretch" | { tile: number };

/** How an `<image>` fits its node. The string forms map to bevy's trivial modes;
 *  the object forms map to bevy's 9-slice (`"sliced"`) / `"tiled"` scaling, letting
 *  one asset (e.g. a frame/border) resize without distorting its corners. */
export type ImageMode =
  | "auto"
  | "stretch"
  | {
      type: "sliced";
      /** Border insets in *source-texture pixels*: a number (uniform) or per-side. */
      border:
        | number
        | { top: number; right: number; bottom: number; left: number };
      /** How the center section scales (default `"stretch"`). */
      centerScaleMode?: ImageSliceScale;
      /** How the four side sections scale (default `"stretch"`). */
      sidesScaleMode?: ImageSliceScale;
      /** Max scale of the four corner sections (default `1`). */
      maxCornerScale?: number;
    }
  | {
      type: "tiled";
      tileX?: boolean;
      tileY?: boolean;
      /** Repeat threshold (default `1`). */
      stretchValue?: number;
    };

/** How a `backgroundImage` fits its node: `"stretch"` (default — fill the box
 *  exactly, aspect ignored) or the repeat modes (tile at the texture's logical
 *  size × `scale`). Unlike an `<image>`'s [`ImageMode`] there is no `"auto"` —
 *  a background never affects layout. */
export type BackgroundImageMode = "stretch" | "repeat" | "repeatX" | "repeatY";

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

/** A CSS-like style object mapped onto `bevy_ui::Node` and its sibling visual
 *  components. Every field is optional; unset fields keep Bevy's defaults. */
export interface BevyStyle {
  // display / box model
  display?: "flex" | "grid" | "block" | "none";
  boxSizing?: "borderBox" | "contentBox";
  positionType?: "relative" | "absolute";
  overflowX?: "visible" | "clip" | "hidden" | "scroll";
  overflowY?: "visible" | "clip" | "hidden" | "scroll";
  scrollbarWidth?: number;

  // inset — animatable ([`Animatable`]; a bound length animates in px)
  left?: Animatable<Length>;
  right?: Animatable<Length>;
  top?: Animatable<Length>;
  bottom?: Animatable<Length>;

  // size — animatable ([`Animatable`]; a bound length animates in px)
  width?: Animatable<Length>;
  height?: Animatable<Length>;
  minWidth?: Animatable<Length>;
  minHeight?: Animatable<Length>;
  maxWidth?: Animatable<Length>;
  maxHeight?: Animatable<Length>;
  aspectRatio?: Animatable<number>;

  // alignment
  alignItems?:
    | "start"
    | "end"
    | "flexStart"
    | "flexEnd"
    | "center"
    | "baseline"
    | "stretch";
  alignSelf?:
    | "auto"
    | "start"
    | "end"
    | "flexStart"
    | "flexEnd"
    | "center"
    | "baseline"
    | "stretch";
  alignContent?:
    | "start"
    | "end"
    | "flexStart"
    | "flexEnd"
    | "center"
    | "stretch"
    | "spaceBetween"
    | "spaceEvenly"
    | "spaceAround";
  justifyItems?: "start" | "end" | "center" | "baseline" | "stretch";
  justifySelf?: "auto" | "start" | "end" | "center" | "baseline" | "stretch";
  justifyContent?:
    | "start"
    | "end"
    | "flexStart"
    | "flexEnd"
    | "center"
    | "stretch"
    | "spaceBetween"
    | "spaceEvenly"
    | "spaceAround";

  // spacing
  margin?: Rect;
  padding?: Rect;
  border?: Rect;

  // flex
  flexDirection?: "row" | "column" | "rowReverse" | "columnReverse";
  flexWrap?: "nowrap" | "wrap" | "wrapReverse";
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: Animatable<Length>;
  gap?: Animatable<Length>;
  rowGap?: Animatable<Length>;
  columnGap?: Animatable<Length>;

  // grid
  gridAutoFlow?: "row" | "column" | "rowDense" | "columnDense";
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
  gridAutoRows?: string;
  gridAutoColumns?: string;
  gridRow?: string;
  gridColumn?: string;

  // visual (sibling components)
  /** Background color (any CSS [`Color`], e.g. `"#1e1e2e"` or
   *  `"rebeccapurple"`). Animatable via an `interpolateColor` binding. */
  backgroundColor?: Animatable<Color>;
  /** Border color: one CSS [`Color`] for all sides, or a per-side object.
   *  Omitted sides are transparent. Per-side colors must use the object form —
   *  a multi-value string is not supported (CSS color functions contain spaces).
   *  Needs a `border` width to be visible. Only the single-color form is
   *  animatable (the binding drives all four sides). */
  borderColor?:
    | Animatable<Color>
    | { top?: Color; right?: Color; bottom?: Color; left?: Color };
  /** Corner radii. Animatable as a whole: a bound value drives all four corners
   *  in px (no per-corner wrappers); `transition: { borderRadius }` eases
   *  static changes per corner. */
  borderRadius?: Animatable<Rect>;
  outline?: { width?: Length; offset?: Length; color?: Color };
  /** One drop shadow, or an array of shadows stacked back-to-front (first
   *  paints on top), like CSS `box-shadow: a, b, …`. */
  boxShadow?: BoxShadow | BoxShadow[];
  /** CSS-like `filter` chain: one `{ name, params }` entry (e.g.
   *  `{ name: "blur", params: { radius: 4 } }`) or an ordered array of them —
   *  chain order is pass order. Omitted params take the filter's shorthand
   *  default: a *visible* effect, not necessarily the identity
   *  (`{ name: "grayscale" }` is full grayscale; a bare `blur` is a visible
   *  20px blur, unlike CSS's 0). Subtree semantics,
   *  like CSS: the node is promoted to a composited layer and the filter
   *  applies to its whole captured subtree (images, text, buttons, nested
   *  nodes) as one image. */
  filter?: FilterChainValue;
  /** Backdrop filter chain — same wire shape as `filter`, but it filters what is
   *  rendered BEHIND the node (v1: the camera's post-processed 3D scene — UI
   *  painted beneath the node is not included) and draws the result under the
   *  node's own content, like CSS `backdrop-filter` frosted glass. The node
   *  promotes to a composited layer; the filtered region is the node's
   *  rectangular border box (no `borderRadius` mask in v1) and re-renders every
   *  frame (live source). Unsetting the chain demotes and snaps — keep an
   *  identity entry (e.g. `{ name: "blur", params: { radius: 0 } }`) when
   *  removal should transition smoothly. */
  backdropFilter?: FilterChainValue;
  /** View-transition-style morph: `{ key, name, params }`. When `key` changes,
   *  the node's previous rendered appearance is frozen as a snapshot and the
   *  named two-input morph filter (its own registry, separate from `filter` —
   *  built-ins `crossfade`, `linearWipe`, `pixelize`; customs via
   *  `#[react_morph_filter]`; a regular filter name here warns and snaps)
   *  blends frozen → live content, driven by an engine-owned
   *  progress with a built-in 300ms ease (override via
   *  `transition: { morphFilter }`). React can swap the content freely in the
   *  same commit — the old pixels are already frozen. The frozen image is
   *  anchored to the node's layout rect (it scrolls and moves with the node);
   *  if the swap changes the node's size, the old appearance stretches onto
   *  the new box — handle size changes gracefully in app code. Presence
   *  promotes the node to a composited layer; first mount never animates; a
   *  mid-flight key change freezes the in-flight blend and restarts (always
   *  smooth). A morph filter must resolve to a single pass (a multi-pass
   *  resolve is rejected with a devtools warning). Enter/exit idiom: an
   *  EMPTY carrier (a mounted node that paints nothing) is a valid
   *  transparent capture — toggle the content in the same commit as the key
   *  flip and the morph blends from/to nothing, no placeholder background
   *  needed (the carrier must have rendered ≥1 frame before the first
   *  flip; a same-commit mount+flip adopts the key silently). */
  morphFilter?: MorphFilterValue;
  /** Background gradient(s): one gradient or a layered list. Painted *over*
   *  `backgroundColor` (like CSS `background-image`): an opaque gradient hides
   *  it, so the color is a fallback; transparent stops let it show through.
   *  Transitionable via `transition.backgroundGradient` (strict structural
   *  match; mismatch/appear/unset snap). */
  backgroundGradient?: Gradient | Gradient[];
  /** Border gradient(s): one gradient or a layered list. Painted *over*
   *  `borderColor` (needs a `border` width to be visible). Transitionable via
   *  `transition.borderGradient` (strict structural match;
   *  mismatch/appear/unset snap). */
  borderGradient?: Gradient | Gradient[];
  /** Background image: painted *over* `backgroundColor` AND
   *  `backgroundGradient`, under the node's content (bevy's fixed paint
   *  order — the color/gradient show through transparency and while the
   *  texture loads). Never affects layout. Rounded corners clip it under
   *  `"stretch"`, but NOT under the repeat modes (bevy's tiling pipeline
   *  limitation); a swap snaps (no cross-fade). Ignored — with a devtools
   *  warning — on `<image>`/`<canvas>`/`<portal>` (their `ImageNode` belongs
   *  to the element) and `<surface>`. */
  backgroundImage?: BackgroundImage;
  /** How this node's raster source (`<image src>` or `backgroundImage`) is
   * resampled when drawn at a size other than its own. `"auto"` (default)
   * is passive: the engine default, level-0 bilinear today. `"bilinear"`
   * samples level 0 only; `"trilinear"` generates a mip pyramid for the
   * image and samples across levels — the fix for a large image drawn small
   * (aliasing / shimmer while it scales); `"nearest"` is nearest-neighbor
   * (pixel art). Per node, not inherited, not animatable. Each explicit mode
   * is honored through a derived copy of the asset per `(source, mode)` —
   * the source asset is never modified, two nodes with different modes on
   * one file both render as asked, and the copy is shared and dropped with
   * its last user. A live texture (`{ texture }` render target, `<portal>`,
   * canvas, svg) can't be copied: every explicit mode is ignored there with
   * a warning, as is `"trilinear"` on a non-RGBA8 format. Composited layers
   * are unaffected (a `transform3d` layer always samples its capture
   * trilinear). Silent on a node with no raster source. */
  imageRendering?: "auto" | "bilinear" | "trilinear" | "nearest";
  /** Whether layout rounds this node's rect to whole physical pixels (bevy's
   * `LayoutConfig::use_rounding`). Unset = inherit from the nearest ancestor
   * that sets it; the root default is `true`. It inherits downward only and
   * restarts at every detached root (`<surface>`, `<root>`), so set it on the
   * PARENT that lays out the animated node and its neighbours. `false` lays
   * that subtree out at fractional pixels — the fix for the 1px hops of any
   * real-layout size animation (`transition: { size }`, a shared-element size
   * flight, a bound width/height): the animated box AND everything
   * re-flowing around it glide instead of stepping. The price, at rest,
   * wherever content lands on a half pixel: anti-aliased soft edges, slightly
   * blurred text, hairline seams between adjacent boxes. Not a hover/press
   * variant field. */
  layoutRounding?: boolean;
  zIndex?: number;
  /** Lifts the node (and its subtree) into the UI's global stacking order,
   *  escaping the parent stacking context — so a deeply-nested overlay can paint
   *  above unrelated subtrees. Unlike `zIndex`, which only reorders a node among
   *  its siblings. */
  globalZIndex?: number;
  /** Pointer pass-through. `"pass"` makes the element click-through — pointer
   *  interaction (hover/press/click) falls to elements behind it. `"block"` makes
   *  it *capture* interaction so siblings, the 3D scene, and portals behind it
   *  don't receive it. Defaults differ by element: a `<button>` blocks (it's a
   *  discrete control), a `<node>` (and other containers) passes — so a wrapper or
   *  label never swallows clicks meant for what's behind or around it. Set this to
   *  override, e.g. a click-through button or a click-capturing panel/backdrop. */
  focusPolicy?: "block" | "pass";
  /** Mouse cursor shown while the pointer is over this element (CSS `cursor`).
   *  Drives the OS cursor icon; the topmost element under the pointer with a
   *  `cursor` set wins, so a child without one inherits its ancestor's. A
   *  {@link SystemCursor} keyword uses a built-in cursor; any other string names a
   *  custom image cursor registered on the Rust side via `ReactUiPlugin::cursor`.
   *  A custom cursor registered under a keyword name (e.g. `"pointer"`) *overrides*
   *  that system cursor. */
  cursor?: SystemCursor | (string & {});

  // transform / opacity
  /** Static 2D transform. With `transition` a change eases instead of snapping.
   * `translateX`/`translateY` are [`Length`]s (bare number = logical pixels, or a
   * unit string like `"50%"`/`"10vw"`, resolved against the node's own size).
   * `scale` is uniform; `scaleX`/`scaleY` override one axis. `rotate` is an
   * [`Angle`] (bare number = degrees, e.g. `45`, or `"1.5rad"`). */
  transform?: {
    translateX?: Animatable<Length>;
    translateY?: Animatable<Length>;
    scale?: Animatable<number>;
    scaleX?: Animatable<number>;
    scaleY?: Animatable<number>;
    /** Bound values are **degrees**, like the static [`Angle`] form. */
    rotate?: Animatable<Angle>;
  };
  /** 3D perspective transform, applied to the subtree's *rendered result* at
   * composite time (group semantics, like `opacity`/`filter`). Its presence —
   * even an empty `{}` — promotes the subtree to a composited layer; animating
   * it never re-captures (composite-time cost, like translation). Picking,
   * hover, and cursor follow the transformed visual. Field order is fixed:
   * scale → rotateX → rotateY → rotateZ → translate, then the self
   * `perspective` projection, all around `origin`.
   *
   * Units: translations and `perspective` are logical px; rotations are
   * [`Angle`]s (bare number = degrees); `origin` is per-axis px-or-percent of
   * the border box (default `"50%"`/`"50%"` = center). `translateZ` is only
   * visible with `perspective` (positive = toward the viewer = magnify).
   * Backfaces render mirrored and stay clickable.
   *
   * With `transition: { transform3d }` changes ease field-wise (perspective
   * snaps when either endpoint is orthographic). Unsetting the whole field
   * demotes the layer and **snaps** — keep an identity `{}` in the base style
   * when removal should ease. Avoid hover-triggered transforms that move the
   * element out from under the cursor (hover flips off → moves back →
   * oscillates, as in CSS). */
  transform3d?: {
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
  };
  /** Opacity in `0..1`, multiplied into the background (and text) alpha. With a
   * `transition` a change eases. On a node with children (unless `groupAlpha`
   * is `false`) the subtree instead composites as a layer and the value fades
   * the whole group at once (web semantics) — an `{ animated }` opacity
   * promotes the same way. */
  opacity?: Animatable<number>;
  /** Whether `opacity` on a node with children fades the subtree as a group
   * (composited layer, the default — web semantics) rather than folding into
   * each node's own colors. Set `false` to opt out of layer promotion for
   * perf-sensitive spots. Not carried by `hoverStyle`/`pressStyle`. */
  groupAlpha?: boolean;
  /** Layer-cache hint. `"always"` force-promotes this subtree to a composited
   * layer so its capture is cached and re-rendered only when content changes —
   * the `will-change` pattern for static or transform/opacity-animated
   * subtrees. `"never"` also force-promotes, but re-captures every frame —
   * the escape hatch for content whose pixels change outside the dirt
   * tracking's sight (a live `<portal>` render target, an app-owned texture);
   * every enclosing layer re-captures too. `"auto"` (default) promotes only
   * when another rule does (e.g. `opacity`). Not carried by
   * `hoverStyle`/`pressStyle`. */
  cache?: "auto" | "always" | "never";
  /** CSS-like transition timing. When a `transform` / `opacity` / `backgroundColor`
   * change occurs — via re-render or `hoverStyle`/`pressStyle` — it eases over time
   * (using the same driver/easing engine as the inline `{ animated }`
   * bindings) instead of snapping. */
  transition?: BevyTransition;
  /** A visible scrollbar for an `overflow: scroll` node. `"none"` (default) hides
   *  it; `"default"` is a built-in neutral bar; an object configures it. Draggable
   *  thumb + click-to-page are built in. See [`ScrollbarStyle`]. */
  scrollbar?: "none" | "default" | ScrollbarStyle;

  // text (only meaningful on `<text>` elements/spans)
  /** Text color (any CSS [`Color`]). Animatable via `interpolateColor`. */
  color?: Animatable<Color>;
  /** Font size: a bare number is logical pixels, or a unit string (`"24px"`,
   * `"2vw"`, `"1.5rem"`). See [`FontSize`]. */
  fontSize?: FontSize;
  fontWeight?:
    | "thin"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "black"
    | (string & {});
  /** Registered font-family name to render with (see the plugin's
   * `default_font`/`font` config). Unknown or unset → the configured default. */
  fontFamily?: string;
  /** Horizontal alignment of the text block (`<text>` root only). */
  textAlign?: "left" | "center" | "right" | "justify" | "start" | "end";
  /** Line height. A bare number is a multiple of the font size; a string carries a
   * unit (`"20px"` absolute, `"1.5"`/`"1.5em"` a multiple); `{ px }` is an absolute
   * pixel height. Unset → 1.2× the font size (bevy's default). */
  lineHeight?: number | string | { px: number };
  /** Letter spacing. A bare number is logical pixels; a string carries a unit
   * (`"2px"`, `"0.1rem"`/`"0.1em"`, or `"normal"`); `{ rem }` is a font-size
   * multiple. */
  letterSpacing?: number | string | { rem: number };
  /** A single drop shadow behind the text (`<text>` root only). `offsetX`/
   * `offsetY` are displacement in logical pixels (default `4`); `color` defaults
   * to bevy's translucent black. */
  textShadow?: { color?: Color; offsetX?: number; offsetY?: number };
  /** How the text wraps when it overflows its bounds (`<text>` root only).
   * Default `"wordBoundary"`. */
  lineBreak?: "wordBoundary" | "anyCharacter" | "wordOrCharacter" | "noWrap";
}

// TODO(review): the pointer model is bespoke — normalized x/y + clientX/Y and a DOM
// `button` number rather than full DOM `PointerEvent` semantics. No modifier info.
// It's part of the public contract, so settle the shape before too many apps depend
// on it.
/** Payload for the pointer handlers: the cursor position within the element,
 *  normalized to `0..1` from a top-left origin (`x` left→right, `y` top→bottom),
 *  clamped to the element's bounds even while dragging outside it. `clientX` /
 *  `clientY` give the absolute cursor position in window logical pixels (also a
 *  top-left origin), unclamped — use those to drag a node across the screen. */
export interface PointerEventData {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  /** Which mouse button, DOM `MouseEvent.button` numbering (`0` left, `1`
   *  middle, `2` right). Present on down/move/up (a move's button is the one
   *  dragging); absent on enter/leave. */
  button?: number;
}

/** Payload for `onWheel`: the cursor position within the element (same `x`/`y`
 *  normalized `0..1` + absolute `clientX`/`clientY` as `PointerEventData`) plus the
 *  **raw** wheel delta. `deltaMode` says how to read the deltas — `"line"` (mouse
 *  notches: scale by your own per-line distance) or `"pixel"` (trackpad: already in
 *  pixels) — mirroring DOM `WheelEvent`. Unlike a scroll container, nothing is scaled
 *  or applied for you: use the deltas to drive a zoom, pan, or custom scroll. */
export interface WheelEventData {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  /** Raw horizontal wheel delta this frame. */
  deltaX: number;
  /** Raw vertical wheel delta this frame; positive is wheel-down / scroll-forward. */
  deltaY: number;
  /** How to interpret the deltas: `"line"` (mouse) or `"pixel"` (trackpad). */
  deltaMode: "line" | "pixel";
}

/** Props common to `node` and `button`. */
export interface BevyNodeProps extends BevyAttributes {
  style?: BevyStyle;
  /** Style overlaid on `style` while the element is hovered. */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while the element is pressed. */
  pressStyle?: BevyStyle;
  /** Clicked with the primary (left) mouse button: fires on release over the
   *  element the press landed on (press, drag off, release elsewhere does not
   *  click — DOM `click` semantics). For right/middle interactions use
   *  `onPointerDown`/`onPointerUp` and read `e.button`. */
  onClick?: () => void;
  /** Pointer pressed on this element (a drag begins). Receives the cursor's
   *  normalized position within the element. */
  onPointerDown?: (e: PointerEventData) => void;
  /** Pointer moved while held down (a drag). Fires each frame the button stays
   *  down — even when the cursor leaves the element — until release. */
  onPointerMove?: (e: PointerEventData) => void;
  /** Pointer released after a press/drag that began on this element. */
  onPointerUp?: (e: PointerEventData) => void;
  /** Pointer entered this element (hover begins). Fires once on the boundary
   *  crossing — not again on press/release while still inside. */
  onPointerEnter?: (e: PointerEventData) => void;
  /** Pointer left this element (hover ends). */
  onPointerLeave?: (e: PointerEventData) => void;
  /** Controlled vertical scroll offset in logical px (maps to `ScrollPosition.y`).
   *  Meaningful on a node with `overflowY: "scroll"`. Pushed into the node only
   *  when it diverges from the live offset, so it never fights the user's wheel. */
  scrollTop?: number;
  /** Controlled horizontal scroll offset in logical px (maps to `ScrollPosition.x`).
   *  Meaningful on a node with `overflowX: "scroll"`. */
  scrollLeft?: number;
  /** Logical pixels scrolled per mouse-wheel "line" for this container (default 20).
   *  Only scales line-based wheels; trackpad pixel deltas are used as-is. */
  scrollStep?: number;
  /** Fires when this node's scroll offset changes (wheel or a controlled write).
   *  Receives the new offset; pair with `scrollTop`/`scrollLeft` for a controlled
   *  scroll container. */
  onScroll?: (e: { scrollTop: number; scrollLeft: number }) => void;
  /** Mouse wheel over this node. Fires for **any** node (no `overflow: scroll`
   *  needed) with the raw deltas — drive a zoom, pan, or custom scroll. Handling
   *  the wheel traps it from world systems (a 3D camera behind it won't also zoom). */
  onWheel?: (e: WheelEventData) => void;
  children?: ReactNode;
}

/** A world-space vector `[x, y, z]` in Bevy world units. */
export type Vec3 = [number, number, number];

/** Distance-based scaling for an anchored overlay. The Bevy side applies
 *  `clamp(1 + factor * (baseDistance / distance - 1), min, max)`, so the overlay
 *  renders at scale 1 when the camera is `baseDistance` away, grows as it gets
 *  closer, and shrinks farther out. Omit `scale` entirely to keep a constant size. */
export interface AnchorScaling {
  min: number;
  max: number;
  /** Scaling strength: `0` disables scaling, `1` is true perspective (apparent
   *  size halves at twice `baseDistance`), `2` scales twice as fast. */
  factor: number;
  /** Camera distance at which the overlay renders at scale 1. */
  baseDistance: number;
}

/** Props for the `anchor` element: a node-like container whose screen position
 *  Bevy recomputes every frame by projecting the target entity's world position
 *  (plus `offset`) onto the screen. Because it stays a flat overlay, clicks/
 *  hover work exactly like any other node — nest buttons, images, and text as
 *  children to anchor them. */
export interface BevyAnchorProps extends BevyNodeProps {
  /** The Bevy entity to follow, as `Entity::to_bits()` (received from Bevy).
   *  A `u64` arrives from typed bindings as a `bigint`; either form is accepted. */
  entity: number | bigint;
  /** World-space offset added to the entity's position before projecting. */
  offset?: Vec3;
  /** When set, the overlay scales with camera distance (see `AnchorScaling`). */
  scale?: AnchorScaling;
}

/** Props for the `text` element (maps to `bevy_ui::Text` / `TextSpan`). Style
 *  its `color`/`fontSize`/`fontWeight`/`textAlign`/`lineHeight`/`letterSpacing`/
 *  `textShadow`/`lineBreak` via `style`; nest `<text>` to restyle a run.
 *
 *  A top-level `<text>` has full `<node>` parity: hover/press styles, click/
 *  pointer handlers, and the layer-family styles (`filter`/`backdropFilter`/
 *  `morphFilter`/`transform3d`/`opacity`/`cache`) all work directly on it —
 *  no wrapper `<node>` needed. On a *nested* `<text>` (a span — no layout box
 *  of its own) those extras are structural no-ops; the runtime flags them in
 *  the devtools inspector. */
export type BevyTextProps = BevyNodeProps;

/** Props for the `canvas` element: an arbitrary anti-aliased vector drawing
 *  surface with web-faithful retained pixels (maps to a `bevy_ui::ImageNode`
 *  whose texture paint accumulates onto). Style it like any node; size it via
 *  `style.width`/`height`. Draw declaratively via `draw`, or imperatively —
 *  at any time, without a React render — through `ref.current.getContext()`. */
export interface BevyCanvasProps extends BevyAttributes {
  /** Persistent handle to the element (`BevyCanvasElement`): `getContext()`
   *  for imperative, accumulating drawing, plus the laid-out `width`/`height`. */
  ref?: Ref<BevyCanvasElement>;
  style?: BevyStyle;
  /** Style overlaid on `style` while the element is hovered. */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while the element is pressed. */
  pressStyle?: BevyStyle;
  /** The declarative drawing: either a painter that receives an HTML-canvas-like
   *  context (`CanvasContext`), or a pre-recorded `DrawCmd[]` display list.
   *  Whenever this prop changes, the retained surface is **cleared and the
   *  drawing replayed**; the runtime also replays it automatically after a
   *  resize. Omit it to manage the surface purely through the ref handle. */
  draw?: DrawCmd[] | CanvasPainter;
  /** The laid-out size changed (including the first layout, 0 → W×H) and the
   *  retained surface was **cleared** — redraw here when drawing imperatively
   *  (a declarative `draw` prop is replayed for you). Receives the new logical
   *  size. */
  onResize?: (e: { width: number; height: number }) => void;
  onClick?: () => void;
  /** Pointer pressed on the canvas. Receives the cursor's normalized position. */
  onPointerDown?: (e: PointerEventData) => void;
  /** Pointer moved while held (a drag). Fires each frame until release. */
  onPointerMove?: (e: PointerEventData) => void;
  /** Pointer released after a press/drag that began on the canvas. */
  onPointerUp?: (e: PointerEventData) => void;
  /** Pointer entered the canvas (hover begins). */
  onPointerEnter?: (e: PointerEventData) => void;
  /** Pointer left the canvas (hover ends). */
  onPointerLeave?: (e: PointerEventData) => void;
  /** Mouse wheel over the canvas, with the raw deltas — e.g. to zoom a map.
   *  Handling it traps the wheel from world systems (see `WheelEventData`). */
  onWheel?: (e: WheelEventData) => void;
}

/** Props for the `portal` element: a view of an **offscreen render target** (the
 *  live or snapshot output of a Bevy camera drawing into a texture). Maps to a
 *  `bevy_ui::ImageNode` whose texture is the named render target the Bevy app
 *  registered. Style and size it like any node; the texture stretches to fill its
 *  box, and (for `Auto`-resolution targets) the camera renders at the box's
 *  resolution and aspect. */
export interface BevyPortalProps extends BevyAttributes {
  style?: BevyStyle;
  /** Style overlaid on `style` while the element is hovered. */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while the element is pressed. */
  pressStyle?: BevyStyle;
  /** The render-target name to display. The Bevy app registers it (via
   *  `RenderTargets::create`) and hands the name to React over the typed event
   *  channel; an unregistered name shows transparent until it appears. */
  target: string;
  onClick?: () => void;
  /** Pointer pressed on the portal. Receives the cursor's normalized position. */
  onPointerDown?: (e: PointerEventData) => void;
  /** Pointer moved while held (a drag). Fires each frame until release. */
  onPointerMove?: (e: PointerEventData) => void;
  /** Pointer released after a press/drag that began on the portal. */
  onPointerUp?: (e: PointerEventData) => void;
  /** Pointer entered the portal (hover begins). */
  onPointerEnter?: (e: PointerEventData) => void;
  /** Pointer left the portal (hover ends). */
  onPointerLeave?: (e: PointerEventData) => void;
  /** Mouse wheel over the portal, with the raw deltas (see `WheelEventData`). */
  onWheel?: (e: WheelEventData) => void;
}

/** Props for the `root` element: the **screen-space twin** of `<surface>`. Its
 *  children render as an independent top-level UI tree on the default camera —
 *  detached from wherever the element sits in your component tree — so an overlay
 *  (like the devtools panel) can float above the app without living inside the
 *  app's layout or inflating its node tree.
 *
 *  By default a `<root>` fills the window as a **column** (like the main app
 *  root — Bevy's own default is `row`) and sits just above the window tree
 *  (`globalZIndex: 1` — bevy_ui gives equal z-indices no defined order, so the
 *  default must win the tie deterministically); set `style.flexDirection` /
 *  `style.globalZIndex` to change either. The root node itself never blocks or
 *  hovers picking — its children are ordinary interactive nodes. */
export interface BevyRootProps extends BevyAttributes {
  /** Also labels this root in the devtools root selector (unnamed roots are
   *  auto-numbered; the default window tree is `"main"`). */
  name?: string;
  style?: BevyStyle;
  children?: ReactNode;
}

/** Props for the `surface` element: the **inverse** of `<portal>`. Its children
 *  are rendered into an **offscreen texture** instead of the on-screen UI; the Bevy
 *  app registers a surface by name (via `Surfaces::create`, choosing the pixel
 *  resolution) and uses the resulting `Handle<Image>` as a material texture on any
 *  3D mesh — a diegetic monitor, panel, or hologram driven by live React.
 *
 *  A `<surface>` is a **detached root**: place it anywhere in your tree and its
 *  subtree renders off-screen, not inline. It fills the texture by default; size or
 *  lay out its content with `style`. If the named surface isn't registered yet, it
 *  renders nowhere until it appears. Tag the displaying mesh with `SurfacePointer`
 *  on the Bevy side to make the subtree clickable in 3D — `onClick`/`onPointer*`
 *  and hover/press styles then fire from in-world pointer hits. */
export interface BevySurfaceProps extends BevyAttributes {
  /** The surface the Bevy app registered (`Surfaces::create`), by name. The
   *  subtree renders into that surface's texture; an unregistered target
   *  renders nowhere until it appears. (`name` is the element's own identity,
   *  like on every element — the two are independent.) */
  target: string;
  style?: BevyStyle;
  /** Style overlaid on `style` while a child is hovered (in-world). */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while a child is pressed. */
  pressStyle?: BevyStyle;
  onClick?: () => void;
  /** Pointer pressed on this element (an in-world drag begins). */
  onPointerDown?: (e: PointerEventData) => void;
  /** Pointer moved while held (an in-world drag). Fires each frame until release. */
  onPointerMove?: (e: PointerEventData) => void;
  /** Pointer released after a press/drag that began on this element. */
  onPointerUp?: (e: PointerEventData) => void;
  /** Pointer entered this element (hover begins). Fires from in-world pointer hits. */
  onPointerEnter?: (e: PointerEventData) => void;
  /** Pointer left this element (hover ends). */
  onPointerLeave?: (e: PointerEventData) => void;
  // NOTE: no `onWheel` on `<surface>` yet — the main-window wheel path can't reach a
  // subtree rendered into an offscreen texture (it would need the in-world virtual
  // pointer, like the surface `onPointer*` events). Deferred.
  children?: ReactNode;
}

/** Props for the `image` element (maps to `bevy_ui::ImageNode`). */
export interface BevyImageProps extends BevyAttributes {
  style?: BevyStyle;
  /** Style overlaid on `style` while the element is hovered. */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while the element is pressed. */
  pressStyle?: BevyStyle;
  /** Asset path resolved by Bevy's `AssetServer` (relative to `assets/`). */
  src?: string;
  /** Tint multiplied with the image (any CSS [`Color`]); also the fill of a
   *  `src`-less image. */
  tint?: Color;
  flipX?: boolean;
  flipY?: boolean;
  imageMode?: ImageMode;
  /** Display only a sub-rectangle of the texture (source-texture pixels). Maps to
   *  `ImageNode.rect`; with `atlas`, offsets from the selected cell's corner. */
  sourceRect?: { x: number; y: number; width: number; height: number };
  /** Treat `src` as a uniform sprite-sheet grid and show one cell. Maps to
   *  `ImageNode.texture_atlas`; change `index` to flip frames (e.g. animation). */
  atlas?: {
    tileWidth: number;
    tileHeight: number;
    columns: number;
    rows: number;
    /** Gap between cells, `[x, y]` px. */
    padding?: [number, number];
    /** Grid origin offset from the texture's top-left, `[x, y]` px. */
    offset?: [number, number];
    /** Cell to display (row-major); default `0`. */
    index?: number;
  };
  /** Which box of the node the image fills (default `"padding"`). */
  visualBox?: "content" | "padding" | "border";
  onClick?: () => void;
}

/** Props for the `editableText` element: a focusable, editable text field (maps
 *  to Bevy's native `bevy_text::EditableText`, which handles keyboard input,
 *  cursor, selection, clipboard, and word navigation). Controlled: pass `value`
 *  and update it from `onChange`. Style `color`/`fontSize`/`fontWeight` via
 *  `style`, like `<text>`. */
export interface BevyEditableTextProps extends BevyAttributes {
  style?: BevyStyle;
  /** Style overlaid on `style` while the field is focused. Applied on the Bevy
   *  side from the field's focus state, so it needs no React `onFocus` round-trip
   *  (the focus analogue of `hoverStyle`/`pressStyle`). */
  focusStyle?: BevyStyle;
  /** The current text. Pushed into the field only when it differs from what the
   *  widget already holds, so it never disrupts the caret while typing. */
  value?: string;
  /** Fires on every edit with the field's new text. */
  onChange?: (value: string) => void;
  /** Maximum number of characters accepted. */
  maxLength?: number;
  /** Allow newlines (multi-line input). Defaults to single-line. */
  multiline?: boolean;
  /** Focus the field when it mounts. */
  autofocus?: boolean;
  /** Controlled selection anchor, a UTF-8 **byte** offset into `value`. Set
   *  together with `selectionEnd` to move the caret/selection programmatically. */
  selectionStart?: number;
  /** Controlled selection focus, a UTF-8 **byte** offset into `value`. */
  selectionEnd?: number;
  /** Accessible name announced to assistive tech (the a11y node's label). */
  ariaLabel?: string;
  /** Fires when the selection or caret moves. Offsets are UTF-8 **byte**
   *  positions (not UTF-16 like the DOM). `direction` is the anchor→focus order. */
  onSelect?: (selection: {
    selectionStart: number;
    selectionEnd: number;
    selectionDirection: "forward" | "backward" | "none";
    composing: boolean;
  }) => void;
  /** Fires when the field gains focus. */
  onFocus?: () => void;
  /** Fires when the field loses focus. */
  onBlur?: () => void;
}

// The `<svg>` element + SVG shape-child prop types live in `jsx-svg.d.ts`
// (split for file size); re-exported here so `bevy-react/jsx` remains the one
// import surface for host-element props.
export type {
  BevyCircleProps,
  BevyEllipseProps,
  BevyGProps,
  BevyLineShapeProps,
  BevyPathShapeProps,
  BevyPolygonProps,
  BevyPolylineProps,
  BevyRectShapeProps,
  BevyShapeCommonProps,
  BevyShapeTransition,
  BevySvgProps,
} from "./jsx-svg";
