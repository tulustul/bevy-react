// Shared prop/style types for the host elements the bevy-react renderer
// understands. The JSX element registry itself lives in `jsx-runtime.ts`; point
// your tsconfig at it with `"jsx": "react-jsx"` + `"jsxImportSource": "bevy-react"`.
// Import `BevyStyle` here to type a shared style object.

import type { ReactNode } from "react";

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

/** Props common to `node` and `button`. */
export interface BevyNodeProps {
  style?: BevyStyle;
  onClick?: () => void;
  children?: ReactNode;
}

/** Props for the `text` element (maps to `bevy_ui::Text` / `TextSpan`). Style
 *  its `color`/`fontSize`/`fontWeight`/`textAlign` via `style`; nest `<text>`
 *  to restyle a run. */
export interface BevyTextProps {
  style?: BevyStyle;
  children?: ReactNode;
}

/** Props for the `image` element (maps to `bevy_ui::ImageNode`). */
export interface BevyImageProps {
  style?: BevyStyle;
  /** Asset path resolved by Bevy's `AssetServer` (relative to `assets/`). */
  src?: string;
  /** Tint multiplied with the image (hex); also the fill of a `src`-less image. */
  tint?: string;
  flipX?: boolean;
  flipY?: boolean;
  imageMode?: "auto" | "stretch";
  onClick?: () => void;
}
