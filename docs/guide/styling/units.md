---
description: The value forms style properties accept for lengths, four-sided rects, angles, durations and font sizes, and what each unit resolves against.
demo: Units
---

# Units

Style values that carry a unit accept either a bare number, read in the
property's default unit, or a string with an explicit unit. Lengths default
to logical pixels, angles to degrees and durations to milliseconds. Values
are parsed once, when the style crosses to Bevy.

## Usage

```tsx
<node
  style={{
    width: 240, // logical px
    height: "50vh", // half the window's height
    padding: "8px 16px", // vertical, horizontal
    transform: { rotate: "0.25turn" },
    transition: { transform: { duration: "0.3s" } },
  }}
/>
```

## Lengths

Layout sizes, insets, margins, padding, gaps, transform translation and
shadow offsets are lengths:

| Value                  | Meaning                                        |
| ---------------------- | ---------------------------------------------- |
| `16` or `"16px"`       | Logical pixels                                 |
| `"50%"`                | A percentage of a reference size (see below)   |
| `"10vw"`, `"10vh"`     | 10% of the viewport's width or height          |
| `"10vmin"`, `"10vmax"` | 10% of the viewport's smaller or larger side   |
| `"auto"`               | Left to layout, where the property supports it |

- A logical pixel is multiplied by the window's scale factor and Bevy's
  `UiScale` resource, so the same value looks the same size on every
  display.
- The viewport is the target the UI draws into: the window for your app's
  UI, the texture for UI inside a [`<surface>`](../elements/surface.md).
  Viewport units follow it when it resizes and ignore `UiScale`.
- `"auto"` sizes from content on `width`, `height`, the min and max sizes
  and `flexBasis`; means "not set" on the insets; absorbs free space on
  `margin`; and is `0` on `padding`, `border` and the gaps.
- A numeric string without a unit (`"16"`) is pixels. Units are lowercase,
  except that `"auto"` matches in any case.
- Anything else (`"1em"`, `"2rem"`, `"calc(…)"`, `"16pt"`) becomes `0` and
  reports a `length` devtools warning. The rest of the style still applies.

An `{ animated }` binding on a length property is driven in logical pixels,
whatever unit the static value used. See
[Animated values](../animations/animated-values.md).

### What percentages are of

| Property                                            | Percentage of                           |
| --------------------------------------------------- | --------------------------------------- |
| `width`, `minWidth`, `maxWidth`, `left`, `right`    | The parent's width                      |
| `height`, `minHeight`, `maxHeight`, `top`, `bottom` | The parent's height                     |
| `margin`, `padding`, `border` (all four sides)      | The parent's width                      |
| `flexBasis`                                         | The parent's size on the flex main axis |
| `gap`, `rowGap`, `columnGap`                        | The node's own size on that axis        |
| grid tracks (`"25%"`)                               | The grid container's size               |

The parent's size here is its content box (for an absolute node, its
padding box, see [Positioning](../layout/positioning.md)). A percentage of a
size that layout hasn't fixed yet, such as the height of an auto-height
parent, behaves as `"auto"`. Other properties, such as `transform` and
`borderRadius`, give their own basis on their pages.

## Four-sided values

`margin`, `padding`, `border` and `borderRadius` take a `Rect`, one length
per side in any of these forms:

| Value                             | Sides                              |
| --------------------------------- | ---------------------------------- |
| `8`                               | All four                           |
| `"8px"`, `"8px 16px"`, …          | CSS shorthand: 1 to 4 lengths      |
| `{ top: 8, left: "auto" }`        | Per side; omitted sides are `0`    |
| `{ horizontal: 16, vertical: 8 }` | `left` + `right`, `top` + `bottom` |

- The shorthand follows CSS order: one value for all sides, two for
  vertical and horizontal, three for top, horizontal and bottom, four for
  top, right, bottom and left.
- If an object mixes the two forms, an explicit side wins over its axis.
- On `borderRadius` the four slots are the corners, starting top-left and
  going clockwise (see [Borders](borders.md)).
- A value always replaces the whole rect. `hoverStyle={{ padding: { left: 20 } }}`
  sets the other three sides to `0` while hovered, not to the base style's
  values.
- A shorthand token that doesn't parse becomes `0` for its sides, more than
  four values make the whole rect `0`, and an unknown object key is
  ignored. Each reports a `rect` devtools warning.

## Angles

Rotations (`transform`, `transform3d`) and gradient angles are angles:

| Value         | Meaning                   |
| ------------- | ------------------------- |
| `45`          | Degrees                   |
| `"45deg"`     | Degrees                   |
| `"0.785rad"`  | Radians                   |
| `"0.125turn"` | Turns (1turn = 360°)      |
| `"50grad"`    | Gradians (400grad = 360°) |

An invalid angle becomes `0` and reports an `angle` devtools warning. An
`{ animated }` binding on an angle is driven in degrees.

## Durations

A transition's `duration` and `delay` are durations: a bare number is
milliseconds, `"300ms"` is milliseconds and `"0.3s"` is seconds. An invalid
duration becomes `0` and reports a `time` devtools warning. See
[Style transitions](../animations/style-transitions.md).

## Font sizes

`fontSize` takes a number (logical pixels), `"px"`, the viewport units, or
`"rem"`: a multiple of Bevy's `RemSize` resource, 20px by default, which
makes it the knob for scaling all `rem` text at once. It does not accept
percentages or `em`. An invalid value becomes `0` and reports a `fontSize`
devtools warning. See [`<text>`](../elements/text.md).

## Limits

- No `calc()`, `em`, or unit arithmetic. Compute mixed values in
  JavaScript, for example from the window size (see
  [Window](../events/window.md)).
- Colors are strings of their own; see [Colors](colors.md).

Every style property's accepted type is listed in the
[style reference](../reference/style-properties.md).
