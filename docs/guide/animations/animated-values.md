---
description: Drive styles every frame from Bevy with Reanimated-style shared values, timing, spring, repeat, sequence and delay drivers, and inline animated bindings.
demo: Animated values
---

# Animated values

Animated values are a Reanimated-style animation API. `useSharedValue`
creates a number that lives on the Bevy side, drivers such as `withTiming`
and `withSpring` describe how it moves, and an inline `{ animated }` wrapper
binds it to a style property. React renders once; every frame after that is
computed and applied by Bevy, with no re-renders and no per-frame traffic
from JS.

## Usage

```tsx
import { useSharedValue, withTiming } from "bevy-react";

function Slide() {
  const x = useSharedValue(0);
  return (
    <button
      onClick={() => {
        x.value = withTiming(200, { duration: 800, easing: "easeInOut" });
      }}
      style={{ transform: { translateX: { animated: x } } }}
    >
      <text>Slide</text>
    </button>
  );
}
```

## Shared values

`useSharedValue(initial)` returns a handle that is stable across re-renders,
one per component instance. `initial` is used only on the first render.

- Assigning a number (`x.value = 0`) sets the value at once and stops any
  running driver.
- Assigning a driver (`x.value = withSpring(1)`) starts an animation from the
  value's current reading on the Bevy side, so interrupting a running
  animation never jumps.
- `cancelAnimation(x)` stops the running driver and freezes the value where
  it is.
- Reading `x.value` returns the last number assigned from JS, not the
  animated reading: per-frame values never travel back to JS. Use a
  [completion callback](#completion-callbacks) to learn when an animation
  ends.
- One shared value can drive any number of properties on any number of
  nodes, and you can pass it to other components as a prop.
- Assign drivers in event handlers and effects. An assignment during render
  restarts the animation on every render.

Shared values and their running animations survive a
[hot reload](../tooling/hot-reload.md) that keeps component state. A full
reload clears them.

## Drivers

| Driver                                | Moves the value                                         |
| ------------------------------------- | ------------------------------------------------------- |
| `withTiming(to, config?)`             | Along an easing curve over a fixed duration             |
| `withSpring(to, config?)`             | With a damped spring until it rests on `to`             |
| `withRepeat(driver, config?)`         | Runs `driver` again, forever or `count` times           |
| `withSequence(...drivers, callback?)` | Runs each driver in turn, from where the previous ended |
| `withDelay(ms, driver, callback?)`    | Holds the current value for `ms`, then runs `driver`    |

Configs, all fields optional:

- `withTiming`: `duration` in milliseconds (default `300`), `easing`
  (default `"linear"`), `onComplete`. The easings are `"linear"`, `"easeIn"`,
  `"easeOut"` and `"easeInOut"` (cubic), also exported as `Easing.easeInOut`
  and so on.
- `withSpring`: `stiffness` (default `100`), `damping` (default `10`),
  `mass` (default `1`), `onComplete`. A spring has no duration; a low
  `damping` overshoots and wobbles before it settles.
- `withRepeat`: `count` (omit it to repeat forever), `reverse` (default
  `false`), `onComplete`.

Drivers compose:

```tsx
x.value = withSequence(
  withTiming(110, { duration: 450, easing: "easeOut" }),
  withDelay(250, withTiming(-110, { duration: 450 })),
  withDelay(250, withSpring(0)),
);
```

`withRepeat` details:

- Without `reverse`, every run starts again from the value the repeat began
  at, so the value jumps back at the end of each run. That is what makes
  `withRepeat(withTiming(360, { duration: 1200 }))` from `0` spin forever.
- With `reverse: true`, runs alternate direction (there and back), and
  `count` counts each direction as a run: `count: 2` goes there and back
  once. `reverse` applies to a `withTiming` or `withSpring` inside; any other
  driver repeats as written.

```tsx
const opacity = useSharedValue(1);
useEffect(() => {
  opacity.value = withRepeat(
    withTiming(0, { duration: 500, easing: "easeInOut" }),
    { reverse: true },
  );
}, [opacity]);
```

## Completion callbacks

A driver can report when it settles. `withTiming`, `withSpring` and
`withRepeat` take `onComplete` in their config; `withSequence` takes a
trailing function and `withDelay` a third argument:

```tsx
x.value = withSequence(
  withTiming(110, { duration: 450 }),
  withTiming(0, { duration: 350 }),
  (finished) => setRunning(false),
);
```

- The callback runs once, with `finished` `true` when the animation ran to
  its end and `false` when it was interrupted: by assigning a number or a new
  driver, or by `cancelAnimation`.
- Only the driver assigned to `.value` reports. A callback on a driver nested
  inside `withRepeat`, `withSequence` or `withDelay` is ignored, with a
  console warning.
- A `withRepeat` without `count` calls back only when it is interrupted.
- The callback arrives through the event loop like any event from Bevy, so
  it may set state.

## Bindings

Write `{ animated: value }` in place of a style value. The value is a shared
value, or an `interpolate` or `interpolateColor` result that maps it through a
curve (see [Interpolation](interpolation.md)):

```tsx
<node
  style={{
    width: { animated: w },
    opacity: { animated: fade },
    transform: { rotate: { animated: angle } },
  }}
/>
```

| Position                                         | Bound value                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| `opacity`                                        | `0` to `1`                                       |
| `transform`: `translateX`, `translateY`          | Logical px                                       |
| `transform`: `scale`, `scaleX`, `scaleY`         | Factor                                           |
| `transform`: `rotate`                            | Degrees                                          |
| Layout lengths (listed below)                    | Logical px                                       |
| `aspectRatio`                                    | Ratio                                            |
| `borderRadius`                                   | Logical px, all four corners                     |
| `backgroundColor`, `borderColor`, `color`        | An `interpolateColor` binding                    |
| `backgroundImage`: `tint`                        | An `interpolateColor` binding                    |
| `transform3d` fields                             | See [3D transforms](../styling/3d-transforms.md) |
| `filter`, `backdropFilter`, `morphFilter` params | See [Filters](../styling/filters.md)             |
| Gradient angles, stops and radii                 | See [Gradients](../styling/gradients.md)         |

The layout lengths are `width`, `height`, `minWidth`, `minHeight`,
`maxWidth`, `maxHeight`, `left`, `right`, `top`, `bottom`, `flexBasis`,
`gap`, `rowGap` and `columnGap`.

Rules:

- A bound length is always in pixels and a bound rotation in degrees,
  whatever unit the static form of the field would use.
- The binding is the field's only value: there is no static value under it.
- A color position needs an `interpolateColor` binding. A plain shared value
  or `interpolate` cannot drive a color.
- `borderColor` and `borderRadius` bind as a whole: one value for every side
  or corner.
- Bindings work in the base `style` only. A binding in `hoverStyle`,
  `pressStyle` or `focusStyle` is ignored with a `styleBinding` warning. To
  react to hover, animate the value from `onPointerEnter` and
  `onPointerLeave` instead.
- A binding wins over a `transition` on the same property (see
  [Style transitions](style-transitions.md)).
- `seed` (`{ animated: value, seed: 16 }`) only matters for filter params and
  element attributes; style fields ignore it.

Element attributes can be animated too: the numeric attributes of SVG shapes
(see [`<svg>`](../elements/svg.md)) and those of your own elements
(see [Custom elements](../extending/custom-elements.md)).

## Cost

A shared value is stepped once per Bevy frame by the frame's delta time,
and the nodes bound to it are written only on frames where it changed. An
idle value costs nothing. Transform, opacity and color bindings do not
trigger a relayout. Layout bindings (sizes, positions, gaps, `aspectRatio`, `borderRadius`)
relayout the UI on every frame they change, so prefer `transform` for pure
motion.

## Limits

- A shared value is one number. Animate several numbers with several values.
- The JS side cannot read the live value, and easing is limited to the four
  named curves: a JS easing function cannot run in Bevy.
- `interpolateColor` takes hex colors only.
- Padding, margin and `backgroundImage.scale` cannot be animated.

The **Animatable** column of the
[style reference](../reference/style-properties.md) marks every property that
accepts a binding.
