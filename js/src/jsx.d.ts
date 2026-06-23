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

/** Four sides/corners: a number (uniform), a CSS shorthand string
 *  (`"8px"`, `"8px 16px"`, `"1px 2px 3px 4px"`), or an explicit object. */
export type Rect =
  | number
  | string
  | { top?: Length; right?: Length; bottom?: Length; left?: Length };

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
  /** Hex background color, e.g. `#1e1e2e`. */
  backgroundColor?: string;
  /** Hex border color (applied to all sides). */
  borderColor?: string;
  borderRadius?: Rect;
  outline?: { width?: Length; offset?: Length; color?: string };
  boxShadow?: {
    color?: string;
    xOffset?: Length;
    yOffset?: Length;
    spreadRadius?: Length;
    blurRadius?: Length;
  };
  zIndex?: number;

  // text (only meaningful on `<text>` elements/spans)
  /** Hex text color. */
  color?: string;
  /** Font size in logical pixels. */
  fontSize?: number;
  fontWeight?:
    | "thin"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "black"
    | (string & {});
  /** Horizontal alignment of the text block (`<text>` root only). */
  textAlign?: "left" | "center" | "right" | "justify" | "start" | "end";
}

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
 *  its `color`/`fontSize`/`fontWeight`/`textAlign` via `style`; nest `<text>`
 *  to restyle a run. */
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
  /** Tint multiplied with the image (hex); also the fill of a `src`-less image. */
  tint?: string;
  flipX?: boolean;
  flipY?: boolean;
  imageMode?: "auto" | "stretch";
  onClick?: () => void;
}

/** Props for the `editableText` element: a focusable, editable text field (maps
 *  to Bevy's native `bevy_text::EditableText`, which handles keyboard input,
 *  cursor, selection, clipboard, and word navigation). Controlled: pass `value`
 *  and update it from `onChange`. Style `color`/`fontSize`/`fontWeight` via
 *  `style`, like `<text>`. */
export interface BevyEditableTextProps extends BevyAttributes {
  style?: BevyStyle;
  /** The current text. Pushed into the field only when it differs from what the
   *  widget already holds, so it never disrupts the caret while typing. */
  value?: string;
  /** Fires on every edit with the field's new text. */
  onChange?: (value: string) => void;
  /** Maximum number of characters accepted. */
  maxLength?: number;
  /** Allow newlines (multi-line input). Defaults to single-line. */
  multiline?: boolean;
}
