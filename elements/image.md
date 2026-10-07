# `<image>`

`<image>` draws a texture asset inside a UI node. It is a styled node like
`<node>` (layout, background, border, pointer handlers, children) whose Bevy
`ImageNode` the element owns. A `src` ending in `.svg` switches it to SVG
mode: the file is parsed once and rasterized at the node's laid-out size and
DPI.

## Usage

```tsx
<image src="logo.png" style={{ width: 120 }} />
```

`src` is an asset path resolved by Bevy's `AssetServer`, relative to the
app's asset folder. Any format your Bevy build can load works (enable the
matching Bevy feature, such as `png`).

## Attributes

| Attribute    | Type                                 | Default     | Effect                                                     |
| ------------ | ------------------------------------ | ----------- | ---------------------------------------------------------- |
| `src`        | `string`                             | none        | Asset path; `.svg` (any case) selects SVG mode             |
| `tint`       | CSS color string                     | white       | Multiplied with every texel; the fill when `src` is absent |
| `flipX`      | `boolean`                            | `false`     | Mirror horizontally                                        |
| `flipY`      | `boolean`                            | `false`     | Mirror vertically                                          |
| `imageMode`  | `ImageMode`                          | `"auto"`    | How the texture sizes and fills the node                   |
| `sourceRect` | `{ x, y, width, height }`            | none        | Draw only this region, in texture pixels                   |
| `atlas`      | `AtlasSpec`                          | none        | Treat the texture as a sprite-sheet grid                   |
| `visualBox`  | `"content"`, `"padding"`, `"border"` | `"content"` | Which box of the node the image fills                      |

All of them are plain props: change them from React state and only the
image is rebuilt. None of them accepts an `{ animated }` binding.

## Sizing

The texture always fills the node's visual box. `imageMode` decides whether
the texture also feeds layout:

- `"auto"` (the default) gives the node the texture's size as its intrinsic
  size, one texel per logical pixel. Set one axis and the other follows the
  aspect ratio; set both and the texture stretches to that box. With a
  `sourceRect` the intrinsic size is the rectangle's, with an `atlas` the
  cell's.
- Every other mode (`"stretch"`, sliced, tiled) contributes no intrinsic
  size: size the node through `style`.

There is no `object-fit: contain` for raster images. To keep the aspect
ratio, constrain one axis only.

Until the texture has loaded, an `auto` image measures as zero and the
layout reflows when it arrives. Give it an explicit size if that jump
matters. An `<image>` with children is laid out like any container and is
not measured by its texture either.

## Image modes

`imageMode` takes `"auto"`, `"stretch"`, or an object for Bevy's 9-slice and
tiled scaling. A 9-slice frame resizes without distorting its corners:

```tsx
<image
  src="ui/frame.png"
  imageMode={{ type: "sliced", border: 24, maxCornerScale: 0.5 }}
  style={{ width: 320, height: 180 }}
/>
```

- `{ type: "sliced" }`: `border` is the corner inset in texture pixels,
  either one number or `{ top, right, bottom, left }`. `centerScaleMode` and
  `sidesScaleMode` are `"stretch"` (default) or `{ tile: n }`, which repeats
  the section once it is stretched more than `n` times. `maxCornerScale`
  (default `1`) caps how much the corners scale.
- `{ type: "tiled" }`: `tileX` and `tileY` (default `false`) repeat the whole
  texture along that axis once it is stretched more than `stretchValue`
  times (default `1`).

Any string other than `"stretch"` is treated as `"auto"`.

## Crops and sprite sheets

`sourceRect` draws only part of the texture:

```tsx
<image src="logo.png" sourceRect={{ x: 0, y: 0, width: 200, height: 110 }} />
```

`atlas` treats `src` as a uniform grid and selects one cell, row-major:

```tsx
<image
  src="sprites/hero.png"
  atlas={{
    tileWidth: 32,
    tileHeight: 32,
    columns: 8,
    rows: 4,
    index: frame,
  }}
  style={{ width: 64, height: 64 }}
/>
```

`padding` (`[x, y]`, the gap between cells) and `offset` (`[x, y]`, the
grid's origin in the texture) are optional; `index` defaults to `0`. The grid
layout is built once per distinct grid and shared, so stepping `index` every
frame for a sprite animation creates nothing new. With both `atlas` and
`sourceRect`, the rectangle is relative to the selected cell's top-left
corner.

## Tint, opacity and styles

- `tint` multiplies every texel; an invalid color renders magenta and reports
  a `color` warning in devtools. Without `src`, the image is a solid fill of
  `tint` (white by default) with no useful intrinsic size, so give it a width
  and height.
- `opacity` fades the image, including from `hoverStyle` and `pressStyle`.
- `backgroundColor` paints behind the image: through transparent texels, and
  in the padding when `visualBox` is `"content"`.
- `backgroundImage` is ignored on `<image>` (the element owns its image) and
  reports a `styleIgnored` warning.
- Pointer events hit the node's whole box. Transparent texels are not
  click-through.

## SVG files

```tsx
<image src="icons/gear.svg" style={{ width: 64 }} />
```

An `src` ending in `.svg` (case-insensitive) is rendered as a vector:

- The intrinsic size is the document's `width`/`height` (its `viewBox` size
  when those are absent), in logical pixels, with the same sizing rules as
  `"auto"`.
- Each node rasterizes the document at its own laid-out size times the
  display's scale factor, so it is crisp at every size. It re-rasterizes when
  that size changes and when the file is reloaded.
- The document is scaled uniformly and centered in the node (SVG's
  `xMidYMid meet`); it is never stretched, and the remaining space is
  transparent.
- While the node's size is animating (a `size` transition, a shared-element
  flight or an animated width/height), it re-rasterizes only after about 12%
  of size change and stretches the last raster in between. It re-rasterizes
  crisply when the animation settles.
- `tint`, `flipX`/`flipY`, `visualBox` and `opacity` apply. `imageMode` is
  ignored, and `sourceRect` and `atlas` are ignored with an `svgImageAttrs`
  warning.

SVG `<text>` needs the off-by-default `svg_text` cargo feature, which loads
system fonts through fontdb. Without it, text in the file is not drawn:

```sh
cargo add bevy-react --features svg_text
```

To compose vector graphics from React instead of loading files, use the
`<svg>` element.

## Limits

- No `object-fit`-style fitting for raster images: the texture stretches to
  the box (SVG files are the exception).
- `src` is an asset path only. To show a render target, use the `<portal>`
  element or a `backgroundImage` with a `{ texture }` source.
- A large texture drawn small aliases by default. The `imageRendering` style
  addresses this for raster sources; its explicit modes are not available in
  SVG mode (they report a warning).
- SVG rasterization runs on the CPU, once per node: each resize of each node
  showing a file costs a full raster.
- Bitmaps embedded in an SVG file are skipped; the vector content still
  renders.

See [`<image>`](../reference/elements.md#image) in the element reference.
