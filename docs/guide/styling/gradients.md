---
description: Linear, radial and conic gradients on a node's fill and border, with stops, hints, color spaces, layered lists, transitions and animated leaves.
demo: Gradients
covers: [style.backgroundGradient, style.borderGradient]
---

# Gradients

`backgroundGradient` paints a linear, radial or conic gradient over a node's
background color, and `borderGradient` paints one into its border. Each takes
one gradient or an array of gradients layered on top of each other.

## Usage

```tsx
<node
  style={{
    width: 160,
    height: 90,
    backgroundGradient: {
      type: "linear",
      angle: 90,
      stops: [{ color: "#f7768e" }, { color: "#7aa2f7" }],
    },
  }}
/>
```

## Gradient kinds

Every gradient has a `type`, a `stops` array and an optional `colorSpace`:

| `type`     | Fields              | Shape                           |
| ---------- | ------------------- | ------------------------------- |
| `"linear"` | `angle`             | Along a line through the center |
| `"radial"` | `position`, `shape` | Outward from `position`         |
| `"conic"`  | `start`, `position` | Around `position`, clockwise    |

- `angle` (linear) and `start` (conic) are angles: a bare number is degrees,
  or a unit string (`"45deg"`, `"1.5rad"`, `"0.25turn"`, `"100grad"`). `0`
  points up and angles grow clockwise, so `angle: 90` runs left to right.
  Both default to `0`.
- `position` is a named anchor: `"center"` (the default), `"top"`,
  `"bottom"`, `"left"`, `"right"`, `"topLeft"`, `"topRight"`,
  `"bottomLeft"` or `"bottomRight"`. Offsets in lengths are not supported;
  an unknown name is treated as `"center"`.
- `shape` sizes a radial gradient; see [Radial shapes](#radial-shapes).

## Stops

```tsx
const stops = [
  { color: "#1a1b26" },
  { color: "#7aa2f7", position: "30%", hint: 0.2 },
  { color: "#f7768e", position: 120 },
];
```

- `color` is required and takes any color string (see [Colors](colors.md)).
- `position` (linear and radial stops) is a length along the gradient line:
  pixels, or a percentage of the line. Stops without one are spaced evenly
  between their neighbors, as in CSS.
- Conic stops take `angle` instead of `position`, as an angle.
- `hint` (`0`–`1`, default `0.5`) moves the midpoint of the blend between
  this stop and the next.
- One stop paints a solid color; an empty `stops` array paints nothing.

## Color spaces

`colorSpace` picks the space the stops blend in: `"oklab"` (the default),
`"oklch"`, `"srgb"`, `"linearRgb"`, `"hsl"` or `"hsv"`. The hue-based
spaces also come as `"oklchLong"`, `"hslLong"` and `"hsvLong"`, which travel
the long way around the hue circle. An unknown value falls back to
`"oklab"`.

## Radial shapes

`shape` defaults to the `closestCorner` keyword. The forms the runtime
accepts are:

| Value                                   | Shape                                    |
| --------------------------------------- | ---------------------------------------- |
| `{ keyword: "closestSide" }`            | Circle/ellipse reaching the closest side |
| `{ keyword: "farthestSide" }`           | …the farthest side                       |
| `{ keyword: "closestCorner" }`          | …the closest corner                      |
| `{ keyword: "farthestCorner" }`         | …the farthest corner                     |
| `{ circle: { circle: 40 } }`            | Circle of radius 40                      |
| `{ ellipse: { ellipse: [60, "50%"] } }` | Ellipse with these x/y radii             |

The `shape` TypeScript type currently declares other forms (a bare
`"closestSide"`, `{ circle: 40 }`), which the runtime rejects. Write the
forms above with a cast until the two agree:

```tsx
// The `shape` type does not list this form yet.
const shape = { keyword: "farthestCorner" } as any;

<node
  style={{
    backgroundGradient: {
      type: "radial",
      position: "topLeft",
      shape,
      stops: [{ color: "#e0af68" }, { color: "#1a1b26" }],
    },
  }}
/>;
```

An unknown keyword is treated as `closestCorner`.

## Fill and border

- `backgroundGradient` fills the node inside its border, rounded by
  `borderRadius`, and paints over `backgroundColor`: transparent stops let
  the color show through.
- `borderGradient` paints only the border band, over `borderColor`. It needs
  a `border` width (see [Borders](borders.md)).
- A `backgroundImage` paints over both gradients.
- An array layers its gradients in order: the first at the back, each later
  one on top. The two styles are independent of each other.
- `opacity` fades every stop on a node without a composited layer (see
  [Opacity](opacity.md)).
- Gradients merge through `hoverStyle`, `pressStyle` and `focusStyle` as a
  whole value: a variant's gradient replaces the base one.

## Transitions

`transition: { backgroundGradient }` and `transition: { borderGradient }`
ease a gradient change, each on its own:

```tsx
<node
  style={{
    backgroundGradient: {
      type: "linear",
      angle: on ? 200 : 20,
      stops: on
        ? [{ color: "#9ece6a" }, { color: "#e0af68" }]
        : [{ color: "#f7768e" }, { color: "#7aa2f7" }],
    },
    transition: { backgroundGradient: { duration: 400 } },
  }}
/>
```

- Only matching structures ease: the same number of gradients, and for each
  one the same `type`, stop count and `colorSpace`, the same `position`
  (radial, conic), and the same `shape` kind (radial: two keywords must be
  equal; two circles or two ellipses ease their radii).
- Any other change snaps immediately, silently. Setting or unsetting the
  gradient snaps too. To fade a gradient in or out, keep it in the base style
  and ease its stops to and from transparent colors.
- Within a match, stop colors interpolate per channel in sRGB (not in the
  gradient's own `colorSpace`), and positions, hints, radii and angles
  interpolate numerically. Angles take the long way: 350 to 10 degrees passes
  through 180.
- A position or radius that changes unit, or a stop that gains or loses its
  `position`, snaps on its own while the rest eases.

## Animated leaves

Every numeric and color leaf accepts an inline `{ animated }` binding, driven
every frame on the Bevy side:

```tsx
import { useEffect } from "react";
import { useSharedValue, withRepeat, withTiming } from "bevy-react";

function Spinner() {
  const angle = useSharedValue(0);
  useEffect(() => {
    angle.value = withRepeat(withTiming(360, { duration: 4000 }));
  }, [angle]);
  return (
    <node
      style={{
        width: 120,
        height: 90,
        backgroundGradient: {
          type: "linear",
          angle: { animated: angle, seed: 0 },
          stops: [{ color: "#bb9af7" }, { color: "#7dcfff" }],
        },
      }}
    />
  );
}
```

- The leaves are `angle`, `start`, stop `color`, `position`, `hint` and
  conic stop `angle`, and the radii of a `circle` or `ellipse` shape.
- Values are in wire units: degrees for angles, pixels for positions and
  radii, `0`–`1` for hints. Stop colors take an `interpolateColor` binding
  (see [Colors](colors.md#animated-colors)); the other leaves take a plain
  shared value or an `interpolate` mapping.
- `seed` is the value drawn until the binding first drives the leaf.
  Without one, a bound color starts transparent and a bound number at its
  default.
- Bindings work in the base `style` only; one in a state style is ignored
  with a `styleBinding` warning.
- Any binding on a surface parks that surface's transition: a
  `transition: { backgroundGradient }` next to a `backgroundGradient` binding
  does nothing and reports a `gradientTransition` warning. The other surface
  is unaffected.

See [Animated values](../animations/animated-values.md) for shared values and
drivers.

## Limits

- `position` takes only the named anchors.
- The radial `shape` TypeScript type does not match the accepted forms (see
  [Radial shapes](#radial-shapes)). A value in one of the declared-but-rejected
  forms makes the whole React commit fail to apply, not just the gradient.

See [`backgroundGradient`](../reference/style-properties.md#backgroundGradient)
and [`borderGradient`](../reference/style-properties.md#borderGradient) in the
style reference.
