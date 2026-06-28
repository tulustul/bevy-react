// Shared prop/style types for the host elements the bevy-react renderer
// understands. The JSX element registry itself lives in `jsx-runtime.ts`; point
// your tsconfig at it with `"jsx": "react-jsx"` + `"jsxImportSource": "bevy-react"`.
// Import `BevyStyle` here to type a shared style object.

import type { Key, ReactNode } from "react";
import type { AnimatedStyle } from "./animated";
import type { CanvasPainter, DrawCmd } from "./canvas";

/** Attributes React manages itself (not real host props — React strips `key`
 *  before props reach the reconciler). Shared by every host element so keyed
 *  lists type-check. Host elements take no `ref`, so `key` is all that's here. */
export interface BevyAttributes {
  key?: Key | null | undefined;
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
 *  (`"8px"`, `"8px 16px"`, `"1px 2px 3px 4px"`), or an explicit object. */
export type Rect =
  | number
  | string
  | { top?: Length; right?: Length; bottom?: Length; left?: Length };

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

/** Size/shape of a radial gradient (default `"closestCorner"`). */
export type RadialShape =
  | "closestSide"
  | "farthestSide"
  | "closestCorner"
  | "farthestCorner"
  | { circle: Length }
  | { ellipse: [Length, Length] };

/** A linear/radial color stop. `position` places it along the gradient line
 *  (absent → auto-spaced); `hint` is the `0..1` interpolation midpoint to the
 *  next stop (default `0.5`). */
export type GradientStop = { color: Color; position?: Length; hint?: number };

/** A conic color stop. `angle` is an [`Angle`] (bare number = degrees; absent →
 *  auto-spaced). */
export type AngularStop = { color: Color; angle?: Angle; hint?: number };

/** One gradient. `angle`/`start` are [`Angle`]s (bare number = degrees; `0` = to
 *  top, clockwise). */
export type Gradient =
  | {
      type: "linear";
      angle?: Angle;
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
      start?: Angle;
      position?: GradientPosition;
      stops: AngularStop[];
      colorSpace?: ColorSpace;
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

/** Per-channel transition timing. `transform` covers all transform channels;
 *  `all` is the fallback for any channel without its own entry. */
export interface BevyTransition {
  all?: BevyTransitionSpec;
  transform?: BevyTransitionSpec;
  opacity?: BevyTransitionSpec;
  backgroundColor?: BevyTransitionSpec;
  /** Covers the size channels (`width`/`height`/`maxWidth`/`maxHeight`). These are
   * layout properties, so easing one re-flows surrounding content — a real
   * accordion. Needs an explicit pixel target (e.g. `maxHeight: open ? 300 : 0`);
   * `auto`/unknown heights snap. Pair with `overflowY: "clip"`. */
  size?: BevyTransitionSpec;
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

  // inset
  left?: Length;
  right?: Length;
  top?: Length;
  bottom?: Length;

  // size
  width?: Length;
  height?: Length;
  minWidth?: Length;
  minHeight?: Length;
  maxWidth?: Length;
  maxHeight?: Length;
  aspectRatio?: number;

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
  flexBasis?: Length;
  gap?: Length;
  rowGap?: Length;
  columnGap?: Length;

  // grid
  gridAutoFlow?: "row" | "column" | "rowDense" | "columnDense";
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
  gridAutoRows?: string;
  gridAutoColumns?: string;
  gridRow?: string;
  gridColumn?: string;

  // visual (sibling components)
  /** Background color (any CSS [`Color`], e.g. `"#1e1e2e"` or `"rebeccapurple"`). */
  backgroundColor?: Color;
  /** Border color: one CSS [`Color`] for all sides, or a per-side object.
   *  Omitted sides are transparent. Per-side colors must use the object form —
   *  a multi-value string is not supported (CSS color functions contain spaces).
   *  Needs a `border` width to be visible. */
  borderColor?:
    | Color
    | { top?: Color; right?: Color; bottom?: Color; left?: Color };
  borderRadius?: Rect;
  outline?: { width?: Length; offset?: Length; color?: Color };
  boxShadow?: {
    color?: Color;
    xOffset?: Length;
    yOffset?: Length;
    spreadRadius?: Length;
    blurRadius?: Length;
  };
  /** Background gradient(s): one gradient or a layered list. Painted *over*
   *  `backgroundColor` (like CSS `background-image`): an opaque gradient hides
   *  it, so the color is a fallback; transparent stops let it show through. */
  backgroundGradient?: Gradient | Gradient[];
  /** Border gradient(s): one gradient or a layered list. Painted *over*
   *  `borderColor` (needs a `border` width to be visible). */
  borderGradient?: Gradient | Gradient[];
  zIndex?: number;
  /** Lifts the node (and its subtree) into the UI's global stacking order,
   *  escaping the parent stacking context — so a deeply-nested overlay can paint
   *  above unrelated subtrees. Unlike `zIndex`, which only reorders a node among
   *  its siblings. */
  globalZIndex?: number;

  // transform / opacity
  /** Static 2D transform. With `transition` a change eases instead of snapping.
   * `scale` is uniform; `scaleX`/`scaleY` override one axis. `rotate` is an
   * [`Angle`] (bare number = degrees, e.g. `45`, or `"1.5rad"`). */
  transform?: {
    translateX?: number;
    translateY?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    rotate?: Angle;
  };
  /** Opacity in `0..1`, multiplied into the background (and text) alpha. With a
   * `transition` a change eases. */
  opacity?: number;
  /** CSS-like transition timing. When a `transform` / `opacity` / `backgroundColor`
   * change occurs — via re-render or `hoverStyle`/`pressStyle` — it eases over time
   * (using the same driver/easing engine as `animatedStyle`) instead of snapping. */
  transition?: BevyTransition;

  // text (only meaningful on `<text>` elements/spans)
  /** Text color (any CSS [`Color`]). */
  color?: Color;
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

// TODO(review): the pointer model is bespoke and limited — left-button press/move/up only,
// with normalized x/y + clientX/Y rather than DOM `PointerEvent` semantics. No enter/leave/
// over, no wheel-as-element-event, no button/modifier info. It's part of the public contract,
// so settle the shape before too many apps depend on it.
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
}

/** Props common to `node` and `button`. */
export interface BevyNodeProps extends BevyAttributes {
  style?: BevyStyle;
  /** Style overlaid on `style` while the element is hovered. */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while the element is pressed. */
  pressStyle?: BevyStyle;
  /** Reanimated-style animation bindings (see `Animated.node`). Each property is
   *  driven by a shared value and updated every frame on the Bevy side. */
  animatedStyle?: AnimatedStyle;
  onClick?: () => void;
  /** Pointer pressed on this element (a drag begins). Receives the cursor's
   *  normalized position within the element. */
  onPointerDown?: (e: PointerEventData) => void;
  /** Pointer moved while held down (a drag). Fires each frame the button stays
   *  down — even when the cursor leaves the element — until release. */
  onPointerMove?: (e: PointerEventData) => void;
  /** Pointer released after a press/drag that began on this element. */
  onPointerUp?: (e: PointerEventData) => void;
  children?: ReactNode;
}

/** Props for the `text` element (maps to `bevy_ui::Text` / `TextSpan`). Style
 *  its `color`/`fontSize`/`fontWeight`/`textAlign`/`lineHeight`/`letterSpacing`/
 *  `textShadow`/`lineBreak` via `style`; nest `<text>` to restyle a run. */
export interface BevyTextProps extends BevyAttributes {
  style?: BevyStyle;
  children?: ReactNode;
}

/** Props for the `canvas` element: an arbitrary anti-aliased vector drawing
 *  surface (maps to a `bevy_ui::ImageNode` whose texture is rasterized from the
 *  display list). Style it like any node; size it via `style.width`/`height`. */
export interface BevyCanvasProps extends BevyAttributes {
  style?: BevyStyle;
  /** Style overlaid on `style` while the element is hovered. */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while the element is pressed. */
  pressStyle?: BevyStyle;
  /** Reanimated-style animation bindings (see `Animated.node`). */
  animatedStyle?: AnimatedStyle;
  /** The drawing: either a painter that receives an HTML-canvas-like context
   *  (`CanvasContext`), or a pre-recorded `DrawCmd[]` display list. Re-rasterized
   *  whenever this prop changes. */
  draw?: DrawCmd[] | CanvasPainter;
  onClick?: () => void;
  /** Pointer pressed on the canvas. Receives the cursor's normalized position. */
  onPointerDown?: (e: PointerEventData) => void;
  /** Pointer moved while held (a drag). Fires each frame until release. */
  onPointerMove?: (e: PointerEventData) => void;
  /** Pointer released after a press/drag that began on the canvas. */
  onPointerUp?: (e: PointerEventData) => void;
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
  /** Reanimated-style animation bindings (see `Animated.node`). */
  animatedStyle?: AnimatedStyle;
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
  /** The surface name the Bevy app registered (`Surfaces::create`). The subtree
   *  renders into that surface's texture; an unregistered name renders nowhere
   *  until it appears. */
  name: string;
  style?: BevyStyle;
  /** Style overlaid on `style` while a child is hovered (in-world). */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while a child is pressed. */
  pressStyle?: BevyStyle;
  /** Reanimated-style animation bindings (see `Animated.node`). */
  animatedStyle?: AnimatedStyle;
  onClick?: () => void;
  /** Pointer pressed on this element (an in-world drag begins). */
  onPointerDown?: (e: PointerEventData) => void;
  /** Pointer moved while held (an in-world drag). Fires each frame until release. */
  onPointerMove?: (e: PointerEventData) => void;
  /** Pointer released after a press/drag that began on this element. */
  onPointerUp?: (e: PointerEventData) => void;
  children?: ReactNode;
}

/** Props for the `image` element (maps to `bevy_ui::ImageNode`). */
export interface BevyImageProps extends BevyAttributes {
  style?: BevyStyle;
  /** Style overlaid on `style` while the element is hovered. */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while the element is pressed. */
  pressStyle?: BevyStyle;
  /** Reanimated-style animation bindings (see `Animated.image`). */
  animatedStyle?: AnimatedStyle;
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
