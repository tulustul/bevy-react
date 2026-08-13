// Public API of the `bevy-react` library.
//
// Most apps only need `mount`:
//
//   import { mount } from "bevy-react";
//   import { App } from "./App";
//   mount(<App />);
//
// The lower-level pieces are exported for advanced/custom integrations.

export { mount } from "./mount";
export { render, flushSync } from "./renderer";
export {
  emit,
  request,
  addEventListener,
  removeEventListener,
  reset,
  runEventLoop,
} from "./bridge";
export type { Op, SerializedProps, UiEvent } from "./bridge";

// Reanimated-style animations (bindings ride inline in `style` behind the
// `{ animated: … }` wrapper — see `Animatable`).
export {
  Easing,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  interpolateColor,
  cancelAnimation,
} from "./animated";
export type {
  SharedValue,
  Driver,
  Binding,
  AnimatedValue,
  Animatable,
  AnimationCallback,
  EasingName,
  TimingConfig,
  SpringConfig,
  RepeatConfig,
} from "./animated";

// Layer-based filter chains (`style={{ filter: … }}`) and morphs
// (`morphFilter`). `BevyFilters` / `BevyMorphFilters` are the empty
// name→params registry interfaces the generated `bevy.ts` augments
// (`declare module "bevy-react"`) — they must be exported here for that
// declaration merging to attach.
export type {
  BevyFilters,
  BevyMorphFilters,
  FilterUse,
  FilterChainValue,
  MorphFilterValue,
} from "./filters";

// World-anchored overlays (`<anchor entity={…} offset={…}>…</anchor>`).
export type { AnchorScaling, BevyAnchorProps, Vec3 } from "./jsx";

// SVG vector drawings (`<svg viewBox="0 0 24 24"><circle cx={12} … /></svg>`).
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
  BevySvgProps,
} from "./jsx";

// Canvas drawing. `CanvasContext` records an HTML-canvas-like display list
// rasterized on the Bevy side — declaratively via `<canvas draw={(ctx) => …}/>`,
// or imperatively through a `<canvas ref={…}>`'s persistent `BevyCanvasElement`
// handle (`getContext()` → a `RetainedCanvasContext` that batches and
// flushes at will; paint accumulates on the retained surface).
export {
  BevyCanvasElement,
  CanvasContext,
  RetainedCanvasContext,
  recordDrawing,
} from "./canvas";
export type { CanvasHost, CanvasPainter, DrawCmd } from "./canvas";
