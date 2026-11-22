# `<text>`

`<text>` renders a block of text. It is a full styled node, like a
[`<node>`](node.md), with layout, background, border, pointer events, state
styles and layer styles, whose content is its string children. A `<text>`
nested inside another `<text>` is an inline span that restyles part of the
block, and an `<image>` inside it is an inline image that flows with the
glyphs.

## Usage

```tsx
<text style={{ fontSize: 18, color: "#c0caf5" }}>
  Hello, <text style={{ fontSize: 18, color: "#7aa2f7" }}>world</text>!
</text>
```

## Content

- Children are strings, numbers, nested `<text>` spans and
  [inline images](#inline-images): `<text>Score: {score}</text>` works as in
  the DOM.
- A `"\n"` in a string starts a new line, whatever the `lineBreak` mode.
- JSX whitespace rules apply: a line break between text and a tag is
  dropped, so write `{" "}` where a span needs a space beside it.
- An `<image>` is the only element that goes inside a `<text>`. Put any
  other box next to the text in a `<node>`.
- A bare string outside any `<text>` still renders, but as unstyled text:
  white, 20px, in Bevy's built-in font rather than your default font. Always
  wrap text in `<text>`.

## Spans

A nested `<text>` is a span: a styled run inside its block. It takes
`style`, `name`, `sharedTag` and `key`.

- **Spans don't inherit.** A span's unset properties take the defaults
  (white, `1rem`, the default font), not the parent's values. Restate
  `fontSize` and `fontFamily` on every span, for example by spreading a
  shared style object, or size the span relative to the text around it with
  `fontSize: "1em"`.
- Bare strings do inherit: a string run takes the style of the `<text>`
  directly around it, block or span.
- On a span, `color`, `fontSize`, `fontWeight`, `fontFamily`, `lineHeight`,
  `letterSpacing` and `opacity` (which fades the span's glyphs) apply.
  `textAlign`, `lineBreak` and `textShadow` belong to the block, and box
  styles (size, padding, background, border) have no effect: a span has no
  box.
- `filter`, `backdropFilter`, `morphFilter`, `transform3d` and `cache` on a
  span are ignored with a `spanLayerStyle` warning. Put them on the block.
- Spans take no event handlers or state styles (a `propIgnored` warning).
  A click on a span goes to its block.

```tsx
const body: BevyStyle = { fontSize: 16, fontFamily: "Inter" };

<text style={{ ...body, color: "#c0caf5" }}>
  Status: <text style={{ ...body, color: "#9ece6a" }}>online</text>
</text>;
```

## Inline images

An `<image>` written inside a `<text>`, directly or inside a span, is an
inline image: a box in the text flow, placed by the text layout like a
glyph.

```tsx
<text style={{ fontSize: 18 }}>
  Built with <image src="icons/bevy.png" style={{ height: "1em" }} /> Bevy
</text>
```

- **What applies.** The attributes `src`, `tint`, `flipX` and `flipY`, plus
  `name` and `key`; from `style`, only `width`, `height` and `opacity`.
- **Size.** `width` and `height` take pixels, `"em"` (a multiple of the font
  size of the text directly around the image, block or span) and `"rem"`.
  With neither, the image has its texture's size, one texel per logical
  pixel. With one, the other follows the texture's aspect ratio. With both,
  the texture stretches to that box.
- **Placement.** The image's bottom edge sits on the baseline, and an image
  taller than the text grows its line. It wraps as a unit: a line may break
  before or after it, never inside. `textAlign` moves it with its line.
- **Loading.** With both sides given, the box is reserved before the texture
  loads, so the text does not move when it arrives. Otherwise the image takes
  no space until it has loaded, and the block re-flows then.
- Without `src`, the image is a solid box of `tint` (white by default): give
  it a size.
- There is no margin: write `{" "}` for a space beside the image.
- The image is part of its block. A click on it is a click on the block, and
  the block's `filter`, `transform3d` and other layer styles include it, as
  does the block's `opacity` (except under `groupAlpha: false`, which fades
  the glyphs only). `opacity` on the image fades the image alone.
  `textShadow` does not shadow it.

An inline image is less than an [`<image>`](image.md):

- An `.svg` source is not drawn (an `inlineImage` warning). The other
  `<image>` attributes (`imageMode`, `sourceRect`, `atlas`, `visualBox`)
  report `unknownProp`.
- A size in `%` or viewport units, or an `{ animated }` binding, reports an
  `inlineImage` warning and counts as unset. Other style properties report
  `styleIgnored`: there is no margin, border, radius or `filter` of its own.
- Event handlers and state styles report `propIgnored`.
- `imageRendering` does not apply. A large texture drawn small aliases, so
  use a source close to the drawn size.
- There is no vertical alignment other than the baseline, and an inline
  image takes no children.

## Text styles

| Property        | Value                                                                     | Default          | Applies to  |
| --------------- | ------------------------------------------------------------------------- | ---------------- | ----------- |
| `color`         | CSS color, or an `{ animated }` color binding                             | white            | block, span |
| `fontSize`      | px number, or `"px"`, `"rem"`, `"em"`, `"vw"`, `"vh"`, `"vmin"`, `"vmax"` | `1rem` (20px)    | block, span |
| `fontWeight`    | keyword, or a numeric string `"1"` to `"1000"`                            | `"normal"` (400) | block, span |
| `fontFamily`    | a registered family name, or a comma-separated fallback list              | the default font | block, span |
| `lineHeight`    | multiple of the font size, px string, or `{ px }`                         | `1.2`            | block, span |
| `letterSpacing` | px number, `"px"`/`"rem"`/`"em"` string, or `{ rem }`                     | `0`              | block, span |
| `textAlign`     | `"left"`, `"center"`, `"right"`, `"justify"`, `"start"`, `"end"`          | `"left"`         | block       |
| `lineBreak`     | `"wordBoundary"`, `"anyCharacter"`, `"wordOrCharacter"`, `"noWrap"`       | `"wordBoundary"` | block       |
| `textShadow`    | `{ color?, offsetX?, offsetY? }`                                          | none             | block       |

`<editableText>` uses the same `color` and font properties.

### Color

`color` takes any [CSS color](../styling/colors.md); an invalid one renders
magenta with a warning. `opacity` on the element multiplies it. There is no
`transition` channel for `color`: to animate it, bind it to a shared value
with `interpolateColor` (see [Interpolation](../animations/interpolation.md)):

```tsx
const t = useSharedValue(0);

<text
  style={{
    color: { animated: interpolateColor(t, [0, 1], ["#c0caf5", "#f7768e"]) },
  }}
>
  Alert
</text>;
```

### Size and weight

- `fontSize`: a bare number is logical pixels. `"rem"` is a multiple of
  [the root font size](../styling/units.md#the-root-font-size), Bevy's
  `RemSize` resource (20px by default); viewport units follow the window
  size. `"em"` is a multiple of the size the text inherits: the enclosing
  text's on a span (`"0.5em"` in a 30px block is 15px, and `"1em"` is how a
  span takes its parent's size), the root font size on a block. An
  unparsable string becomes `0` (the text disappears) and reports a
  `fontSize` warning.
- `"em"` lengths on the text's own box are multiples of its `fontSize`, so
  a badge with `padding: "0.25em 0.5em"` keeps its proportions at any size.
- `fontWeight`: `"thin"` (100), `"light"` (300), `"normal"` (400),
  `"medium"` (500), `"semibold"` (600), `"bold"` (700), `"black"` (900), or
  any weight as a string, such as `"800"`. A JSON number is rejected, which
  the TypeScript type prevents. An unknown keyword falls back to `"normal"`
  with a `fontWeight` warning.
- Weights render only as far as the font provides them. A variable font
  covers every weight; a static font file has its own weight only, and Bevy
  does not synthesize bold.

### Line height and letter spacing

- `lineHeight`: a number is a multiple of the font size. As a string, `"px"`
  is absolute, and a unitless, `"em"` or `"rem"` value is a multiple of the
  font size. `{ px: 24 }` is absolute. An invalid string falls back to `1.2`
  with a `lineHeight` warning.
- `letterSpacing`: a number, a numeric string or a `"px"` string is logical
  pixels. `"em"` is a multiple of the text's own font size, as in CSS:
  `"0.1em"` on 40px text is 4px. `"rem"` and `{ rem }` are multiples of the
  root font size. `"normal"` is `0`. An invalid string falls back to `0`
  with a `letterSpacing` warning. With a font size in viewport units, `"em"`
  spacing has no exact form: it reads as `"rem"` and reports a
  `letterSpacing` warning.

### Alignment and wrapping

- `textAlign` aligns the lines within the block's width. A content-sized
  block is exactly as wide as its longest line, so give it a `width` (or let
  its parent stretch it) to center or right-align a single line. `"start"`
  and `"end"` follow the text direction.
- `lineBreak` chooses where text wraps when it is wider than the block:
  `"wordBoundary"` breaks between words, `"anyCharacter"` anywhere,
  `"wordOrCharacter"` between words and inside words that don't fit a line
  alone, and `"noWrap"` never wraps (a `"\n"` still breaks).
- Text wraps against the block's own width or, without one, the width its
  parent allows.

### Shadow

`textShadow` draws one hard-edged copy of the text behind it: `offsetX` and
`offsetY` in logical pixels (default `4` each) and a `color` (default black
at 75% opacity). There is no blur. The element's `opacity` fades the shadow
with the text.

```tsx
<text style={{ textShadow: { color: "#000000cc", offsetX: 2, offsetY: 2 } }}>
  Game over
</text>
```

## Fonts

Fonts are registered on the Rust side and selected by name from React:

```tsx
<text style={{ fontFamily: "Mono", fontSize: 14 }}>let x = 1;</text>
```

```rust
app.add_plugins(
    ReactPlugins.set(
        ReactUiPlugin::default()
            .default_font("fonts/Inter-Variable.ttf")
            .font("Mono", "fonts/JetBrainsMono.ttf"),
    ),
);
```

- Paths are asset paths, relative to the app's asset folder, loaded through
  the `AssetServer` at startup.
- `default_font` applies to every `<text>`, span and `<editableText>`
  without a `fontFamily`. Without it, text uses Bevy's built-in font.
- `fontFamily` names are exact and case-sensitive. An unknown name falls back
  to the default font with a `fontFamily` warning. Registering a name twice
  keeps the last path, and the same file may be registered under several
  names.
- Each family is one font file. Register a variable font to get every
  weight, or register each static weight under its own name
  (`"Inter Bold"`).
- React cannot load fonts at runtime: every family must be registered up
  front.

### Fallback lists

`fontFamily` also takes a CSS-style comma list. Each glyph comes from the
first font in the list that has it:

```tsx
<text style={{ fontFamily: "Display, Inter, sans-serif" }}>Saved ✓</text>
```

- An entry is a registered name, quoted or not (`"'Space Grotesk', Inter"`).
  A single name selects exactly that font, as before: a glyph it lacks is
  drawn as the font's missing-glyph box.
- A list always ends with the default font, whether you write it or not, so
  text in a list never ends up without a font.
- An unregistered name reports a `fontFamily` warning and is skipped. A
  system font cannot be picked by its name; register the file instead.
- The CSS generic keywords (`serif`, `sans-serif`, `monospace`, `cursive`,
  `fantasy`, `system-ui`, `ui-serif`, `ui-sans-serif`, `ui-monospace`,
  `ui-rounded`, `emoji`, `math`, `fangsong`) map to Bevy's generic families.
  They match nothing unless the app enables Bevy's `system_font_discovery`
  feature (the system's fonts) or maps a family itself
  (`FontCx::set_sans_serif_family`); without either Bevy logs an error once
  and the list moves on to its next entry.
- A block waits for every registered font in its list to load before it is
  drawn. A font whose file fails to load keeps that text hidden, as it does
  when named alone.

## Interaction and layers

A `<text>` block is a full element: it takes pointer handlers, state styles
(a `hoverStyle` color for links), scroll props, and layer styles such as
`filter` and `transform3d`. See [`<node>`](node.md) for the shared props and
[Layers](../styling/layers.md) for what promotes a block.

## Limits

- Spans don't inherit their parent's style, and they have no box, events or
  layer styles.
- An `<image>` is the only inline element, with the limits listed under
  [Inline images](#inline-images). Other boxes cannot flow with the text.
- Unsetting both `textAlign` and `lineBreak`, including when a state style
  that set them ends, keeps the last alignment and wrapping. Set
  `textAlign: "left"` and `lineBreak: "wordBoundary"` explicitly instead.
- One shadow per block, without blur.

See [`<text>`](../reference/elements.md#text) in the element reference, and
[`color`](../reference/style-properties.md#color),
[`fontSize`](../reference/style-properties.md#fontSize),
[`fontWeight`](../reference/style-properties.md#fontWeight),
[`fontFamily`](../reference/style-properties.md#fontFamily),
[`lineHeight`](../reference/style-properties.md#lineHeight),
[`letterSpacing`](../reference/style-properties.md#letterSpacing),
[`textAlign`](../reference/style-properties.md#textAlign),
[`lineBreak`](../reference/style-properties.md#lineBreak) and
[`textShadow`](../reference/style-properties.md#textShadow) in the style
reference.
