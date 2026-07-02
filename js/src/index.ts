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

// Reanimated-style animations.
export {
  Animated,
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
  AnimatedStyle,
  AnimatableProperty,
  AnimationCallback,
  EasingName,
} from "./animated";

// World-anchored overlays (`<Anchored.node entity={…} offset={…}/>`).
export { Anchored } from "./anchored";
export type { AnchorProps, AnchorScaling, Vec3 } from "./anchored";

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
