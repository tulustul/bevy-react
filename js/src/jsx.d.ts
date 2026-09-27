// Shared prop/style types for the host elements the bevy-react renderer
// understands. The per-element props interfaces and `BevyIntrinsicElements`
// are generated from the Rust element registry (`generated/elements.ts`,
// re-exported here); this file holds the hand-written pieces they compose:
// the common prop groups every element shares, the payload types of the
// common events, and the named value types attributes and styles reference.
// Point your tsconfig at the runtime with `"jsx": "react-jsx"` +
// `"jsxImportSource": "bevy-react"`. Import `BevyStyle` here to type a shared
// style object.

import type { Key } from "react";
import type { Animatable } from "./animated";
import type { BevyStyle } from "./generated/style";

// `BevyStyle` is generated from the Rust style registry (one field per core
// style property); apps augment it with their own properties.
export type { BevyStyle };

// The per-element props interfaces + `BevyIntrinsicElements`, generated from
// the Rust element registry (`CORE_ELEMENTS`).
export type * from "./generated/elements";

/** What React manages itself on every host element: `key` (React strips it
 *  before props reach the reconciler) — so keyed lists type-check. Most host
 *  elements take no `ref`; an element whose runtime hands out a handle (the
 *  `<canvas>`'s `BevyCanvasElement`) types it on its own props. */
export interface BevyKeyProps {
  key?: Key | null | undefined;
}

/** The identity props every element shares (the `IDENTITY` common group). */
export interface BevyAttributes extends BevyKeyProps {
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

/** Hover/press/focus style overlays (the `VARIANTS` common group). */
export interface BevyVariantProps {
  /** Style overlaid on `style` while the element is hovered. */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while the element is pressed. */
  pressStyle?: BevyStyle;
  /** Style overlaid on `style` while the element is focused. Applied on the
   *  Bevy side from the element's focus state, so it needs no React `onFocus`
   *  round-trip (the focus analogue of `hoverStyle`/`pressStyle`). */
  focusStyle?: BevyStyle;
}

/** Click and pointer handlers (the `POINTER` common group). */
export interface BevyPointerProps {
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
}

/** Controlled scrolling (the `SCROLL` common group). */
export interface BevyScrollProps {
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
}

/** The raw wheel (the `WHEEL` common group). */
export interface BevyWheelProps {
  /** Mouse wheel over this node. Fires for **any** node (no `overflow: scroll`
   *  needed) with the raw deltas — drive a zoom, pan, or custom scroll. Handling
   *  the wheel traps it from world systems (a 3D camera behind it won't also zoom). */
  onWheel?: (e: WheelEventData) => void;
}

/** A source sub-rectangle of a texture, in source-texture pixels (an
 *  `<image>`'s `sourceRect`). */
export interface SourceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A uniform sprite-sheet grid plus the selected cell (an `<image>`'s
 *  `atlas`); change `index` to flip frames (e.g. animation). */
export interface AtlasSpec {
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
}

/** Declarative easing for an SVG shape's **numeric** attributes
 *  (`bevy_react_svg`): per-attr timing specs (the style-transition
 *  `BevyTransitionSpec`, reused verbatim), keyed by the numeric attr names.
 *  When a listed static attr changes, the painted value eases instead of
 *  snapping; unlisted attrs — and every non-numeric one (`d`, `points`,
 *  paints, keywords) — snap. An attr driven by an `{ animated }` binding is
 *  owned by its driver: any binding on the shape parks the whole transition
 *  (bindings win). */
export type BevyShapeTransition = {
  [K in
    | "x"
    | "y"
    | "width"
    | "height"
    | "cx"
    | "cy"
    | "r"
    | "rx"
    | "ry"
    | "x1"
    | "y1"
    | "x2"
    | "y2"
    | "strokeWidth"
    | "opacity"]?: BevyTransitionSpec;
};

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
