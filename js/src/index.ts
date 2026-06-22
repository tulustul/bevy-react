// Public API of the `bevy-react` library.
//
// Most apps only need `mount`:
//
//   import { mount } from "bevy-react";
//   import { App } from "./App";
//   await mount(<App />);
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
  EasingName,
} from "./animated";

// World-anchored overlays (`<Anchored.node entity={…} offset={…}/>`).
export { Anchored } from "./anchored";
export type { AnchorProps, AnchorScale, Vec3 } from "./anchored";
