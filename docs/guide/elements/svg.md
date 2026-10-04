---
description: The <svg> element draws vector graphics from JSX shapes, with viewBox scaling, per-shape pointer events, animated attributes and attribute transitions.
demo: <svg>
covers:
  [
    element.svg,
    element.circle,
    element.ellipse,
    element.g,
    element.line,
    element.path,
    element.polygon,
    element.polyline,
    element.rect,
  ]
---

# `<svg>`

`<svg>` draws vector graphics composed from JSX shape children: `<rect>`,
`<circle>`, `<ellipse>`, `<line>`, `<polyline>`, `<polygon>`, `<path>` and
the `<g>` group. The `<svg>` itself is a styled node like `<node>`. Its
shapes are not layout nodes: they are painted into the element's texture on
the CPU, at the node's laid-out size times the display's scale factor, so the
drawing is crisp at every size. Shapes take pointer handlers, hit-tested
against their painted geometry, and their numeric attributes can animate.

## Usage

```tsx
<svg viewBox="0 0 100 100" style={{ width: 200, height: 200 }}>
  <circle cx={50} cy={50} r={40} fill="#7aa2f7" />
  <path
    d="M 30 50 L 45 65 L 72 36"
    fill="none"
    stroke="#ffffff"
    strokeWidth={6}
    strokeLinecap="round"
  />
</svg>
```

`<svg>` and its shapes come from the `svg` cargo feature, which is on by
default and adds `SvgPlugin` to `ReactPlugins`. Without it, they mount as
plain nodes and report a `featureMissing` warning (see
[Cargo features](../getting-started.md#cargo-features)).

## Coordinates and sizing

Shapes are positioned in user units. `viewBox="minX minY width height"`
(numbers separated by spaces or commas) maps that rectangle of user space onto
the node's box: scaled uniformly to fit and centered (SVG's `xMidYMid meet`),
with the remaining space transparent. Without a `viewBox`, one user unit is
one logical pixel from the node's top-left corner.

- The `<svg>` has no intrinsic size: neither the `viewBox` nor the shapes
  feed layout. Give it a width and a height, or a width and an
  `aspectRatio`.
- Stroke widths are in user units, so strokes scale with the drawing.
- Anything outside the node's box is cut off.
- An invalid `viewBox` (a parse error or a non-positive size) is ignored with
  a `viewBox` warning.

## Shapes

| Element      | Geometry attributes                     | Notes                                  |
| ------------ | --------------------------------------- | -------------------------------------- |
| `<rect>`     | `x`, `y`, `width`, `height`, `rx`, `ry` | `rx`/`ry` round the corners            |
| `<circle>`   | `cx`, `cy`, `r`                         |                                        |
| `<ellipse>`  | `cx`, `cy`, `rx`, `ry`                  |                                        |
| `<line>`     | `x1`, `y1`, `x2`, `y2`                  | Never filled; give it a `stroke`       |
| `<polyline>` | `points`                                | An open outline                        |
| `<polygon>`  | `points`                                | A closed outline                       |
| `<path>`     | `d`                                     | SVG path data                          |
| `<g>`        | none                                    | Groups its children; takes no handlers |

Every shape except `<g>` also takes the paint attributes:

| Attribute        | Type                             | Default     | Effect                                |
| ---------------- | -------------------------------- | ----------- | ------------------------------------- |
| `fill`           | CSS color string or `"none"`     | black       | Interior paint                        |
| `stroke`         | CSS color string or `"none"`     | none        | Outline paint                         |
| `strokeWidth`    | `number`                         | `1`         | Outline width; `0` or less draws none |
| `opacity`        | `number`, `0..1`                 | `1`         | Multiplies the fill and stroke alpha  |
| `fillRule`       | `"nonzero"`, `"evenodd"`         | `"nonzero"` | How overlapping subpaths fill         |
| `strokeLinecap`  | `"butt"`, `"round"`, `"square"`  | `"butt"`    | Line ends                             |
| `strokeLinejoin` | `"miter"`, `"round"`, `"bevel"`  | `"miter"`   | Corners                               |
| `transform`      | SVG transform list string        | none        | Transforms the shape                  |
| `transition`     | per-attribute timing (see below) | none        | Eases numeric attribute changes       |

`<g>` takes `transform`, `opacity` and `transition`. Its transform applies to
every descendant, composed with those of enclosing groups, and its opacity
multiplies into theirs.

Shapes paint in JSX order, later ones on top. They paint only inside an
`<svg>`, and they take no `style`.

### Values

- Geometry attributes default to `0`. A shape with nothing to draw is
  skipped: a `<rect>` without a positive width and height, a `<circle>`
  without a positive `r`, an `<ellipse>` without positive radii, fewer than
  two `points`, an empty `d`.
- `<rect>` and `<ellipse>` radii follow the SVG auto rule: a missing `rx` or
  `ry` takes the other's value, and a negative one counts as missing. On a
  `<rect>`, an explicit `0` on either axis gives square corners, and the
  radii are capped at half the width and height.
- `points` is a flat number array, `[x0, y0, x1, y1, …]`.
- `d` accepts the full SVG path syntax: absolute and relative commands,
  `H`/`V`, the `S`/`T` shorthands, arcs and `Z`.
- `transform` accepts `matrix`, `translate`, `scale`, `rotate(deg [cx cy])`,
  `skewX` and `skewY`, applied in list order, with angles in degrees.
- `fill` and `stroke` take the same color strings as styles (hex, named,
  `rgb()`, `hsl()` and the other functional forms).

An invalid value drops that attribute only, which then takes its default,
and reports a devtools warning: `shapeNumber`, `shapePath`, `shapePoints`
(including an odd number of coordinates), `shapePaint`, `shapeEnum`,
`shapeTransform` or `shapeTransition`.

## Pointer events

Shapes other than `<g>` take `onClick` and the `onPointer*` handlers:

```tsx
function Pad() {
  const [hot, setHot] = useState(false);
  const [at, setAt] = useState("");
  return (
    <svg viewBox="0 0 200 120" style={{ width: 240, height: 144 }}>
      <circle
        cx={100}
        cy={60}
        r={34}
        fill={hot ? "#e0af68" : "#7aa2f7"}
        onPointerEnter={() => setHot(true)}
        onPointerLeave={() => setHot(false)}
        onPointerDown={(e) => setAt(`${e.x}, ${e.y}`)}
      />
    </svg>
  );
}
```

- A point hits a shape when it is inside the painted fill or on the painted
  stroke, like SVG's default `pointer-events: visiblePainted`. The interior of
  a `fill="none"` shape and the empty corners of its bounding box don't hit.
  A shape with `opacity` `0` still hits.
- The topmost painted shape under the pointer receives the event.
- `x`/`y` are in the `<svg>`'s user units (the coordinates the shapes are
  drawn in), not normalized `0..1`. While a drag leaves the shape, they keep
  the last position over it. `clientX`/`clientY` are window pixels as usual.
- A shape without handlers lets the pointer through to the `<svg>`, which
  reports events like any node. Shapes never block hover: an `<svg>` inside
  a `<button>` still hovers and presses the button. Clicks do not bubble, so
  a shape with `onClick` takes the click.
- Shapes have no `hoverStyle`. Track hover with `onPointerEnter` and
  `onPointerLeave`, as above.
- Shapes inside a [`<surface>`](surface.md) or under a
  [3D transform](../styling/3d-transforms.md) hit-test correctly too.

The `<svg>` node itself takes everything `<node>` does: `style`,
`hoverStyle`, `pressStyle`, `focusStyle`, pointer handlers, `onWheel` and the
scroll props.

## Animated attributes

The numeric attributes (`x`, `y`, `width`, `height`, `cx`, `cy`, `r`, `rx`,
`ry`, `x1`, `y1`, `x2`, `y2`, `strokeWidth` and `opacity`) accept an inline
`{ animated }` binding to a shared value, driven every frame on the Bevy side
without re-rendering React:

```tsx
import { useEffect } from "react";
import { useSharedValue, withRepeat, withTiming } from "bevy-react";

function Pulse() {
  const r = useSharedValue(12);
  useEffect(() => {
    r.value = withRepeat(withTiming(26, { duration: 700 }), {
      reverse: true,
    });
  }, [r]);
  return (
    <svg viewBox="0 0 120 120" style={{ width: 144, height: 144 }}>
      <circle cx={60} cy={60} r={{ animated: r, seed: 12 }} fill="#e0af68" />
    </svg>
  );
}
```

- Values are in user units, and `opacity` in `0..1`.
- `seed` is the value drawn until the first animated value arrives. Without
  it, the attribute takes its default meanwhile, so the circle above would
  start undrawn (`r` `0`).
- `d`, `points`, colors, keywords and `transform` don't animate. A binding on
  one of them drops the attribute with a warning.

See [Animated values](../animations/animated-values.md) for shared values and
their drivers.

## Transitions

The `transition` prop eases numeric attributes when their static value
changes. Its keys are numeric attribute names, its values the same timing
specs as style transitions: `duration`, `easing` and `delay`, or a spring.

```tsx
<rect
  x={8}
  y={100 - value}
  width={24}
  height={value}
  fill="#7aa2f7"
  transition={{
    y: { stiffness: 160, damping: 13 },
    height: { stiffness: 160, damping: 13 },
  }}
/>
```

- Unlisted attributes, and every non-numeric one, snap.
- The first value snaps: a shape doesn't animate in when it mounts.
- Any `{ animated }` binding on a shape pauses its whole `transition`: the
  binding wins. Use bindings and transitions on different shapes.
- On `<g>`, only `opacity` can ease (`transform` is a string).

See [Style transitions](../animations/style-transitions.md) for the timing
spec.

## SVG files

To show an `.svg` file, use [`<image>`](image.md) with a `src` ending in
`.svg`. File rendering is part of the core and works without the `svg`
feature. Text inside files needs the `svg_text` cargo feature.

## Limits

- A subset of SVG: no `<text>`, gradients, patterns, clip paths, masks,
  markers or filters, no `<defs>`/`<use>`, no stroke dashes or miter limit,
  and no `preserveAspectRatio` (always `xMidYMid meet`).
- `opacity` multiplies each shape's fill and stroke alpha separately, unlike
  SVG's group opacity: overlapping parts of a translucent `<g>`, or a
  translucent shape's fill and stroke, show through each other.
- Rasterization runs on the CPU. Any change to any shape, including every
  frame of an animation or transition, re-rasterizes the whole `<svg>`, and
  so does a change of its laid-out size.
- The texture is capped at 4096 pixels per side.
- Hit-testing treats stroke caps and joins as round: near the ends of `butt`
  or `square` caps and at `miter` corners, hits can differ from the painted
  stroke by up to half its width.
- Zero-length subpaths draw no cap dots.
- Groups nest up to 64 levels deep; deeper shapes are skipped with a log
  warning.

See [`<svg>`](../reference/elements.md#svg), [`<rect>`](../reference/elements.md#rect),
[`<circle>`](../reference/elements.md#circle),
[`<ellipse>`](../reference/elements.md#ellipse),
[`<line>`](../reference/elements.md#line),
[`<polyline>`](../reference/elements.md#polyline),
[`<polygon>`](../reference/elements.md#polygon),
[`<path>`](../reference/elements.md#path) and
[`<g>`](../reference/elements.md#g) in the element reference.
