// Prop types for the `<svg>` element and its shape children — split out of
// `jsx.d.ts` (which re-exports everything here, so `bevy-react/jsx` stays the
// one import surface). The JSX element registry lives in `jsx-runtime.ts`.

import type { ReactNode } from "react";
import type { Animatable } from "./animated";
import type {
  BevyAttributes,
  BevyStyle,
  BevyTransitionSpec,
  PointerEventData,
} from "./jsx";

/** Declarative easing for a shape's **numeric** attributes: per-attr timing
 *  specs (the style-transition `BevyTransitionSpec`, reused verbatim), keyed
 *  by the numeric attr names. When a listed static attr changes, the painted
 *  value eases instead of snapping; unlisted attrs — and every non-numeric
 *  one (`d`, `points`, paints, keywords) — snap. An attr driven by an
 *  `{ animated }` binding is owned by its driver: any binding on the shape
 *  parks the whole transition (bindings win). */
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

// Naming: Rect/Line/Path carry a `Shape` infix (`BevyRectShapeProps`) because
// those words are taken/generic elsewhere in the JSX surface (e.g. the style
// `Rect` type); the unambiguous shapes (circle, ellipse, …) don't need one.

/** Props common to every SVG shape child (`<circle>`, `<rect>`, `<line>`,
 *  `<ellipse>`, `<polyline>`, `<polygon>`, `<path>`). All geometry and paint
 *  values are **SVG user-space units**: the enclosing `<svg>`'s `viewBox` maps
 *  user space onto the element's box (no `viewBox` → 1 user unit = 1 logical
 *  px). Shapes are pure vector content — they take no `style` (layout, size,
 *  and backgrounds belong to the `<svg>` element). Every numeric attribute
 *  accepts the inline `{ animated, seed? }` binding wrapper — see `circle`'s
 *  `r` for the full story. */
export interface BevyShapeCommonProps extends BevyAttributes {
  /** Interior paint: any CSS [`Color`], or `"none"` to not fill. Absent uses
   *  the SVG default — **black** (unlike CSS backgrounds). */
  fill?: string;
  /** Outline paint: any CSS [`Color`], or `"none"`. Absent uses the SVG
   *  default — no stroke. */
  stroke?: string;
  /** Stroke thickness in user-space units (SVG default `1`). */
  strokeWidth?: Animatable<number>;
  /** Opacity in `0..1`, multiplied into both the fill and stroke alpha. */
  opacity?: Animatable<number>;
  /** Which regions of self-intersecting geometry the fill claims (SVG default
   *  `"nonzero"`). */
  fillRule?: "nonzero" | "evenodd";
  /** How the open ends of a stroked line/path are capped (SVG default
   *  `"butt"`). */
  strokeLinecap?: "butt" | "round" | "square";
  /** How stroked corners join (SVG default `"miter"`). */
  strokeLinejoin?: "miter" | "round" | "bevel";
  /** SVG transform list (`"translate(10 20) rotate(45) scale(2)"`), applied
   *  in user space. Parsed on the Rust side; a malformed list warns and is
   *  dropped. */
  transform?: string;
  /** Ease numeric attr changes instead of snapping — see
   *  [`BevyShapeTransition`]. */
  transition?: BevyShapeTransition;
  /** Clicked with the primary (left) mouse button: fires on release over the
   *  shape the press landed on (DOM `click` semantics). Hit-testing follows
   *  the painted geometry, not the shape's bounding box. */
  onClick?: () => void;
  /** Pointer pressed on this shape (a drag begins). Receives the cursor in
   *  SVG user-space units (`viewBox` coordinates; logical px when there is no
   *  `viewBox`). Off-shape drag frames fall back to the position normalized
   *  against the enclosing `<svg>`'s box. */
  onPointerDown?: (e: PointerEventData) => void;
  /** Pointer moved while held down (a drag). Fires each frame the button
   *  stays down — even when the cursor leaves the shape — until release. */
  onPointerMove?: (e: PointerEventData) => void;
  /** Pointer released after a press/drag that began on this shape. */
  onPointerUp?: (e: PointerEventData) => void;
  /** Pointer entered this shape's painted geometry (hover begins). */
  onPointerEnter?: (e: PointerEventData) => void;
  /** Pointer left this shape's painted geometry (hover ends). */
  onPointerLeave?: (e: PointerEventData) => void;
}

/** Props for the `circle` shape child: a circle of radius `r` centered at
 *  (`cx`, `cy`), in user-space units. */
export interface BevyCircleProps extends BevyShapeCommonProps {
  /** Center x (default `0`). */
  cx?: Animatable<number>;
  /** Center y (default `0`). */
  cy?: Animatable<number>;
  /** Radius; `0`/absent renders nothing.
   *
   *  Like every numeric shape attribute, accepts the inline `{ animated }`
   *  binding wrapper ([`Animatable`], the style-field convention:
   *  `r={{ animated: sv }}` with a `useSharedValue`): the binding drives the
   *  attribute per frame, in user-space units. The wrapper's optional `seed`
   *  is the static value rendered until the driver writes — a seed-less
   *  animated attribute reads as absent (this attr's default) until then. */
  r?: Animatable<number>;
}

/** Props for the `rect` shape child: an axis-aligned rectangle with optional
 *  rounded corners, in user-space units. */
export interface BevyRectShapeProps extends BevyShapeCommonProps {
  /** Left edge (default `0`). */
  x?: Animatable<number>;
  /** Top edge (default `0`). */
  y?: Animatable<number>;
  /** Width; `0`/absent renders nothing. */
  width?: Animatable<number>;
  /** Height; `0`/absent renders nothing. */
  height?: Animatable<number>;
  /** Corner radius, x axis (defaults to `ry` when only one is given). */
  rx?: Animatable<number>;
  /** Corner radius, y axis (defaults to `rx` when only one is given). */
  ry?: Animatable<number>;
}

/** Props for the `ellipse` shape child: an axis-aligned ellipse with radii
 *  (`rx`, `ry`) centered at (`cx`, `cy`), in user-space units. */
export interface BevyEllipseProps extends BevyShapeCommonProps {
  /** Center x (default `0`). */
  cx?: Animatable<number>;
  /** Center y (default `0`). */
  cy?: Animatable<number>;
  /** Horizontal radius; `0`/absent renders nothing. */
  rx?: Animatable<number>;
  /** Vertical radius; `0`/absent renders nothing. */
  ry?: Animatable<number>;
}

/** Props for the `line` shape child: a straight segment from (`x1`, `y1`) to
 *  (`x2`, `y2`), in user-space units. A line has no interior — only `stroke`
 *  paints it (`fill` is meaningless, as in SVG). */
export interface BevyLineShapeProps extends BevyShapeCommonProps {
  /** Start x (default `0`). */
  x1?: Animatable<number>;
  /** Start y (default `0`). */
  y1?: Animatable<number>;
  /** End x (default `0`). */
  x2?: Animatable<number>;
  /** End y (default `0`). */
  y2?: Animatable<number>;
}

/** Props for the `polyline` shape child: an open run of straight segments
 *  through `points`. */
export interface BevyPolylineProps extends BevyShapeCommonProps {
  /** The vertices as a **flat** number array `[x0, y0, x1, y1, …]` in
   *  user-space units (not pairs — an odd count warns and drops the list). */
  points?: number[];
}

/** Props for the `polygon` shape child: like `polyline`, but the outline
 *  closes back to the first vertex (SVG semantics). */
export interface BevyPolygonProps extends BevyShapeCommonProps {
  /** The vertices as a **flat** number array `[x0, y0, x1, y1, …]` in
   *  user-space units (not pairs — an odd count warns and drops the list). */
  points?: number[];
}

/** Props for the `path` shape child: arbitrary vector geometry from SVG path
 *  data. */
export interface BevyPathShapeProps extends BevyShapeCommonProps {
  /** SVG path data (`"M 10 10 L 90 90 C … Z"`), user-space units — the full
   *  command set including arcs. Parsed on the Rust side; malformed data warns
   *  and drops the path. */
  d?: string;
}

/** Props for the `g` shape child: a group that transforms/fades its shape
 *  children together. Nest freely (`<g>` inside `<g>`); transforms compose
 *  down the group chain, in user-space units. */
export interface BevyGProps extends BevyAttributes {
  /** SVG transform list (`"translate(10 20) rotate(45)"`) applied to every
   *  descendant shape, in user space. */
  transform?: string;
  /** Group opacity in `0..1`, multiplied into descendant shapes' paint. */
  opacity?: Animatable<number>;
  /** Ease numeric attr changes (`opacity`, for a group) instead of snapping —
   *  see [`BevyShapeTransition`]. */
  transition?: BevyShapeTransition;
  /** Shape children (`<circle>`, `<rect>`, `<path>`, nested `<g>`, …). */
  children?: ReactNode;
}

/** Props for the `svg` element: a resolution-independent vector drawing
 *  composed of SVG shape children (`<circle>`, `<rect>`, `<path>`, …),
 *  rasterized crisply at whatever size layout gives the element. Style and
 *  size it like any node (`style.width`/`height`); the shape children carry
 *  only geometry and paint. */
export interface BevySvgProps extends BevyAttributes {
  style?: BevyStyle;
  /** Style overlaid on `style` while the element is hovered. */
  hoverStyle?: BevyStyle;
  /** Style overlaid on `style` (and `hoverStyle`) while the element is pressed. */
  pressStyle?: BevyStyle;
  /** Style overlaid on `style` while the element is focused. */
  focusStyle?: BevyStyle;
  /** The user-space rectangle (`"minX minY width height"`) mapped onto the
   *  element's box — shape geometry is expressed in these **user units**, so
   *  the drawing scales with the element. Absent = logical-pixel space (1 user
   *  unit = 1 logical px, no scaling). */
  viewBox?: string;
  /** Clicked with the primary (left) mouse button, anywhere on the element's
   *  box (shape children also take their own, geometry-accurate handlers). */
  onClick?: () => void;
  /** Pointer pressed on the element (a drag begins). Receives the cursor's
   *  normalized position within the element. */
  onPointerDown?: (e: PointerEventData) => void;
  /** Pointer moved while held (a drag). Fires each frame until release. */
  onPointerMove?: (e: PointerEventData) => void;
  /** Pointer released after a press/drag that began on the element. */
  onPointerUp?: (e: PointerEventData) => void;
  /** Pointer entered the element (hover begins). */
  onPointerEnter?: (e: PointerEventData) => void;
  /** Pointer left the element (hover ends). */
  onPointerLeave?: (e: PointerEventData) => void;
  /** Shape children (`<circle>`, `<rect>`, `<path>`, `<g>`, …). */
  children?: ReactNode;
}
