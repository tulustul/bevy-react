# Transforms

The `transform` style moves, scales and rotates a node after layout, at
render time. The node's children move with it, while its siblings, its
parent and the layout itself are unaffected. It maps to Bevy's
`UiTransform`.

## Usage

```tsx
<node style={{ transform: { translateX: 16, scale: 1.2, rotate: 45 } }} />
```

## Fields

| Field        | Type                              | Default | Effect                              |
| ------------ | --------------------------------- | ------- | ----------------------------------- |
| `translateX` | number (px) or a unit string      | `0`     | Horizontal shift                    |
| `translateY` | number (px) or a unit string      | `0`     | Vertical shift                      |
| `scale`      | number                            | `1`     | Uniform scale of both axes          |
| `scaleX`     | number                            | `scale` | Horizontal scale; overrides `scale` |
| `scaleY`     | number                            | `scale` | Vertical scale; overrides `scale`   |
| `rotate`     | number (degrees) or a unit string | `0`     | Clockwise rotation                  |

Every field is optional; an omitted field stays at its identity value.

- Translations are [lengths](units.md): a bare number is logical pixels, and
  a unit string such as `"50%"` or `"10vw"` is also accepted. Percentages
  resolve against the node's own size, so `translateX: "50%"` shifts it by
  half its width.
- `rotate` is an angle: a bare number is degrees, and `"45deg"`,
  `"1.5rad"`, `"0.25turn"` and `"100grad"` are also accepted.
- Scale and rotation pivot on the node's center. There is no origin setting;
  to pivot elsewhere, use [`transform3d`](3d-transforms.md) and its `origin`.
- The translation is applied after scale and rotation, along the parent's
  axes: a rotated node still moves horizontally for `translateX`.

## Layout and hit testing

A transform never triggers a relayout. Siblings keep their positions, the
parent keeps its size, and scroll ranges do not grow, even when the
transformed node visually overflows its box. Pointer hit testing follows
the transformed box, so a scaled-up button is clickable over its whole
visible area.

## State styles and transitions

`transition: { transform }` eases all six fields together:

```tsx
<button
  style={{
    transform: { scale: 1 },
    transition: { transform: { duration: 120, easing: "easeOut" } },
  }}
  pressStyle={{ transform: { scale: 0.92 } }}
/>
```

- A `transform` in `hoverStyle`, `pressStyle` or `focusStyle` replaces the
  base `transform` as a whole. Repeat the fields you want to keep.
- Put the resting value of every field a state style changes into the base
  style, as `scale: 1` above. A field missing from the active style is not
  eased back to its identity.
- A translation eases only between values of the same unit. `"0%"` to
  `"50%"` eases, but an omitted translation counts as `0` pixels, so
  omitted to `"50%"` snaps. Write `translateX: "0%"` in the base style
  instead.
- Rotation eases numerically, the long way round: `350` to `10` turns back
  through 340 degrees. Use `370` to take the short way.

See [Style transitions](../animations/style-transitions.md) for timing and
springs.

## Animated fields

Every field accepts an inline `{ animated }` binding to a shared value,
driven on the Bevy side every frame without re-rendering React:

```tsx
import { useEffect } from "react";
import { useSharedValue, withRepeat, withTiming } from "bevy-react";

function Spinner() {
  const angle = useSharedValue(0);
  useEffect(() => {
    angle.value = withRepeat(withTiming(360, { duration: 1000 }));
  }, [angle]);
  return <node style={{ transform: { rotate: { animated: angle } } }} />;
}
```

- Bound translations are pixels and bound rotations are degrees.
- While any field is bound, the fields left static in the same `transform`
  stay at identity. Bind every field you need, or put the static part on a
  wrapping node.
- A binding parks `transition: { transform }` on that node.
- Bindings work in the base `style` only.

See [Animated values](../animations/animated-values.md) for the drivers.

## On composited layers

When the node is a [composited layer](layers.md) (it has a `filter`,
`opacity` with children, `transform3d`, and so on), translating it only
moves the cached image. Scaling or rotating it re-renders the layer's
content every frame of the animation. To animate the scale or rotation of a
filtered or otherwise promoted node cheaply, use
[`transform3d`](3d-transforms.md), which never re-renders the content.

## Limits

- 2D only, with no skew and no custom pivot. For perspective, 3D rotations
  or a pivot, use [`transform3d`](3d-transforms.md).
- A transformed node does not move its neighbours. To animate a change that
  should push other nodes around, animate a layout property such as `width`
  or use [`transition: { layout }`](../animations/style-transitions.md).

See [`transform`](../reference/style-properties.md#transform) in the style
reference.
