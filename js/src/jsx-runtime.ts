// Automatic-JSX runtime for bevy-react. Element *creation* delegates to React's
// runtime (react-reconciler does the actual work); the exported `JSX` namespace
// mirrors React's but replaces `IntrinsicElements` with bevy-react's host
// elements, so `<node>`/`<button>`/`<image>` type against our props rather than
// HTML/SVG.
//
// Opt in from a consumer tsconfig with:
//   "jsx": "react-jsx", "jsxImportSource": "bevy-react"

import type * as React from "react";

export { Fragment, jsx, jsxs } from "react/jsx-runtime";

import type { BevyImageProps, BevyNodeProps, BevyTextProps } from "./jsx";

// Note: in a regular `.ts` module, namespace members must be `export`ed to be
// visible as `JSX.IntrinsicElements` (unlike an ambient `.d.ts`).
export namespace JSX {
  export type ElementType = React.JSX.ElementType;
  export interface Element extends React.JSX.Element {}
  export interface ElementClass extends React.JSX.ElementClass {}
  export interface ElementAttributesProperty
    extends React.JSX.ElementAttributesProperty {}
  export interface ElementChildrenAttribute
    extends React.JSX.ElementChildrenAttribute {}
  export type LibraryManagedAttributes<C, P> =
    React.JSX.LibraryManagedAttributes<C, P>;
  export interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
  export interface IntrinsicClassAttributes<T> extends React.JSX
    .IntrinsicClassAttributes<T> {}
  export interface IntrinsicElements {
    /** A flex/grid container. */
    node: BevyNodeProps;
    /** A clickable container (maps to `bevy_ui::Button`). */
    button: BevyNodeProps;
    /** An image (maps to `bevy_ui::ImageNode`). */
    image: BevyImageProps;
    /** Styled, nestable text (maps to `bevy_ui::Text` / `TextSpan`). */
    text: BevyTextProps;
  }
}
