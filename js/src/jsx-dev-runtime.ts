// Dev-mode counterpart of `jsx-runtime.ts` (used by `"jsx": "react-jsxdev"` and
// esbuild's dev automatic runtime). Same `JSX` registry, React's dev factory.

import type * as React from "react";

export { Fragment, jsxDEV } from "react/jsx-dev-runtime";

import type { BevyIntrinsicElements } from "./generated/elements";

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
  // The host elements: generated from the Rust element registry (the core's
  // in the package, an app's own — a feature crate's included — merged in by
  // its generated `bevy.ts`).
  export interface IntrinsicElements extends BevyIntrinsicElements {}
}
