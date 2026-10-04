---
description: Map one shared value onto many style values with interpolate and interpolateColor, piecewise-linear curves evaluated in Bevy every frame.
demo: Interpolation
---

# Interpolation

`interpolate` and `interpolateColor` map a [shared value](animated-values.md)
through a piecewise-linear curve and return a binding for an `{ animated }`
style position. One value can then drive several properties, each over its
own range, and the mapping is evaluated on the Bevy side every frame.

## Usage

```tsx
import {
  interpolate,
  interpolateColor,
  useSharedValue,
  withTiming,
} from "bevy-react";

function Card() {
  const t = useSharedValue(0);
  return (
    <node
      onPointerEnter={() => {
        t.value = withTiming(1, { duration: 200 });
      }}
      onPointerLeave={() => {
        t.value = withTiming(0, { duration: 200 });
      }}
      style={{
        width: 120,
        height: 80,
        transform: {
          scale: { animated: interpolate(t, [0, 1], [1, 1.1]) },
        },
        backgroundColor: {
          animated: interpolateColor(t, [0, 1], ["#7aa2f7", "#f7768e"]),
        },
      }}
    />
  );
}
```

The shared value runs from 0 to 1, the scale from 1 to 1.1 and the color
from blue to red. Setting the value directly (`t.value = 0.5`, from a slider
for example) moves every binding at once, with no driver at all.

## `interpolate`

`interpolate(value, input, output)` returns a number binding:

- `input` lists readings of the shared value in ascending order, and
  `output` the result at each of them, in the units of the position it binds:
  pixels for lengths, degrees for rotations (see
  [Animated values](animated-values.md#bindings)).
- Between two neighbouring stops the result is linear. Use as many stops as
  you need:

  ```tsx
  translateY: {
    animated: interpolate(
      t,
      [0, 0.25, 0.5, 0.75, 1],
      [34, -34, 34, -34, 34],
    ),
  },
  ```

- Outside the input range the result clamps to the first or last output.
  There is no extrapolation option; add stops beyond the range where you
  want the curve to continue.
- A repeated input stop makes a step: `input: [0, 0.5, 0.5, 1]` with
  `output: [0, 0, 1, 1]` jumps from 0 to 1 at 0.5.
- Extra stops in the longer of the two lists are ignored. A single stop
  gives a constant.

Clamping makes staggering easy: give each item its own window of the same
value, and it sits at an end of its range outside that window.

```tsx
items.map((item, i) => (
  <node
    key={item.id}
    style={{
      width: 18,
      height: {
        animated: interpolate(t, [i * 0.16, i * 0.16 + 0.36], [10, 68]),
      },
    }}
  />
));
```

## `interpolateColor`

`interpolateColor(value, input, colors)` returns a color binding, for the
positions that take one: `backgroundColor`, `borderColor`, `color`, a
`backgroundImage` tint, gradient stop colors and color filter params.

- `colors` are hex strings: `#rgb`, `#rrggbb`, or `#rrggbbaa` with alpha.
  Other color syntaxes (`rgb()`, named colors, `#rgba`) are not understood;
  the binding is rejected with a `styleBinding` warning and does nothing.
- Colors are interpolated channel by channel in sRGB, alpha included.
- Stops, ordering and clamping work as for `interpolate`.

## With drivers

The bindings follow the shared value whatever moves it, so animate one
progress value and map it per property. Because the curve clamps, a spring
that overshoots past the last stop holds at the last output; extend the stops
when the overshoot should show:

```tsx
t.value = withSpring(1, { damping: 8 });

scale: { animated: interpolate(t, [0, 1, 2], [1, 1.1, 1.2]) },
```

Writing the binding inline in render costs nothing extra: an unchanged
binding compares equal and sends no update.

## Limits

- Curves are piecewise linear only. Shape the timing with the driver's
  easing or spring instead.
- `interpolateColor` takes hex colors only and interpolates in sRGB, which
  can pass through muddy midpoints between distant hues. Add an intermediate
  stop to steer it.
- Bindings, interpolated or not, work in the base `style` only.

The **Animatable** column of the
[style reference](../reference/style-properties.md) marks every property that
accepts a binding.
