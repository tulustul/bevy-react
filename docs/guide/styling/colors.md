---
description: The CSS color strings every color style accepts (hex, named, rgb, hsl, hwb, oklab, oklch), backgroundColor, color transitions and animated colors.
demo: Colors
covers: [style.backgroundColor]
---

# Colors

Every color in bevy-react is a CSS color string: hex, a named color, or
functional notation such as `rgb()`, `hsl()` or `oklch()`. The same parser
serves every color-valued style and attribute. `backgroundColor`, the most
common of them, fills a node's box.

## Usage

```tsx
<node style={{ width: 120, height: 80, backgroundColor: "#7aa2f7" }} />
```

## Color strings

| Form              | Examples                                                |
| ----------------- | ------------------------------------------------------- |
| Hex               | `"#f00"`, `"#f008"`, `"#7aa2f7"`, `"#7aa2f780"`         |
| Named             | `"tomato"`, `"RebeccaPurple"`, `"transparent"`          |
| `rgb()`, `rgba()` | `"rgb(122 162 247)"`, `"rgba(122, 162, 247, 0.5)"`      |
| `hsl()`, `hsla()` | `"hsl(140 70% 45%)"`, `"hsla(0, 100%, 50%, 0.5)"`       |
| `hwb()`           | `"hwb(200 10% 20%)"`                                    |
| `oklab()`         | `"oklab(0.7 0.1 0.05)"`                                 |
| `oklch()`         | `"oklch(0.7 0.15 30)"`, `"oklch(70% 0.15 30deg / 50%)"` |

- Hex takes 3, 4, 6 or 8 digits; the 4- and 8-digit forms end with alpha.
  The leading `#` is optional.
- Named colors are the CSS named colors, case-insensitive, plus
  `"transparent"`.
- Functional notation accepts commas or spaces between components. Alpha is
  a fourth component or follows a `/`, as a `0`–`1` number or a percentage;
  it defaults to opaque. Function names are case-insensitive.
- `rgb()` channels are `0`–`255` or percentages.
- Hues are degrees, as a bare number or with `deg`. Other angle units
  (`rad`, `turn`) are not accepted.
- Saturation, lightness, whiteness and blackness, and the oklab/oklch
  lightness, take a percentage or a `0`–`1` number. oklab's `a`/`b` and
  oklch's chroma are plain numbers.
- `currentColor`, `none` components, `color()`, `lab()`, `lch()`,
  `color-mix()` and relative colors are not supported.
- An unrecognized string renders magenta and reports a `color` warning in
  [devtools](../tooling/devtools.md) (and once in the terminal). The rest of
  the style still applies.

The same strings work everywhere a color is taken: `borderColor` and
`outline` ([Borders](borders.md)), `boxShadow` ([Shadows](shadows.md)),
gradient stops ([Gradients](gradients.md)), the `backgroundImage` tint
([Background images](background-images.md)), text `color` and `textShadow`
([`<text>`](../elements/text.md)), the `<image>` tint
([`<image>`](../elements/image.md)), and the paints of
[`<svg>`](../elements/svg.md) and [`<canvas>`](../elements/canvas.md).

## Background color

- `backgroundColor` fills the node inside its border (the padding box),
  rounded by `borderRadius`. The default is no fill.
- A node paints, back to front: its `boxShadow`, `backgroundColor`, border,
  `backgroundGradient`, `borderGradient`, `backgroundImage`, its own content
  (text, an image), then its children. A gradient or image therefore covers
  the color wherever it is opaque.
- `opacity` multiplies the color's alpha (see [Opacity](opacity.md)).
- Changing it repaints the node without re-running layout, so driving it
  from React state on every change is fine.

## Transitions

`transition: { backgroundColor }` eases the color between style states:

```tsx
<button
  style={{
    backgroundColor: "#7aa2f7",
    transition: { backgroundColor: { duration: 200 } },
  }}
  hoverStyle={{ backgroundColor: "#bb9af7" }}
/>
```

- The color interpolates per channel in sRGB, alpha included.
- Removing `backgroundColor` snaps, since there is no color to ease to. To
  fade a fill out, ease to the same color at zero alpha
  (`"rgb(122 162 247 / 0)"`). `"transparent"` is transparent black, so the
  frames on the way there darken.
- Text `color` and `borderColor` have no transition channel: they snap.

See [Style transitions](../animations/style-transitions.md) for timing and
springs.

## Animated colors

A color accepts an inline `{ animated }` binding to an `interpolateColor`
mapping of a shared value. Bevy evaluates it every frame without
re-rendering React:

```tsx
import { useEffect } from "react";
import {
  interpolateColor,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";

function Pulse() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 800 }), { reverse: true });
  }, [t]);
  const color = interpolateColor(t, [0, 1], ["#7aa2f7", "#f7768e"]);
  return (
    <node
      style={{ width: 80, height: 80, backgroundColor: { animated: color } }}
    />
  );
}
```

- `interpolateColor`'s output colors must be hex strings (`"#rgb"`,
  `"#rrggbb"` or `"#rrggbbaa"`). It interpolates per channel in sRGB and
  clamps at the ends of its input range.
- Color bindings work on `backgroundColor`, the single-color form of
  `borderColor` (all four sides), text `color`, the `backgroundImage` tint
  and gradient stop colors. A plain shared value can't drive a color.
- Bindings work in the base `style` only; one in `hoverStyle`, `pressStyle`
  or `focusStyle` is ignored with a `styleBinding` warning.
- A binding wins over `transition: { backgroundColor }` for that node.

See [Animated values](../animations/animated-values.md) and
[Interpolation](../animations/interpolation.md).

See [`backgroundColor`](../reference/style-properties.md#backgroundColor) in
the style reference.
