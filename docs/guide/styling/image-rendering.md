---
description: Choose how an image or background image is resampled when drawn at another size - smooth mipmapped minification or crisp pixel art.
demo: Image rendering
covers: [style.imageRendering]
---

# Image rendering

The `imageRendering` style picks how a node's raster image is resampled when
it is drawn at a size other than its own. Bevy loads an image with a single
mip level, so a large image drawn small aliases and shimmers; `"trilinear"`
fixes that, and `"nearest"` keeps pixel art crisp when scaled up.

## Usage

```tsx
<image
  src="images/parrot.png"
  style={{ width: 64, imageRendering: "trilinear" }}
/>
```

## Modes

| Value         | Sampling                                     | Use for                          |
| ------------- | -------------------------------------------- | -------------------------------- |
| `"auto"`      | The engine default, unchanged (default)      | Images drawn near their own size |
| `"bilinear"`  | Smooth, from the full-size image only        | Moderate scaling                 |
| `"trilinear"` | Smooth, across a generated mip chain         | Large images drawn small         |
| `"nearest"`   | Nearest texel, from the full-size image only | Pixel art, scaled up             |

- `"auto"` never touches the image: it renders with the sampler your app
  configured in `ImagePlugin` (bilinear with Bevy's defaults, nearest under
  `ImagePlugin::default_nearest()`).
- An unknown value reports an `imageRendering` warning and acts as
  `"auto"`.

## What it applies to

- The style sets the mode of the node's own raster image: an `<image>` with
  a raster `src`, or the node's [`backgroundImage`](background-images.md)
  with an asset-path source. On a node with neither, it has no effect.
- It is per node and not inherited: set it on each image.
- The source asset is never modified. A node with an explicit mode draws a
  copy of the image with that sampling; nodes asking for the same image and
  mode share one copy, and it is freed with its last user. Two nodes can show
  one file in two modes, and a Bevy `Sprite` using the same file is
  unaffected.
- No copy is made when the image already samples the requested way (for
  example `"bilinear"` on a plain PNG in an app with the default sampler).
- When the file changes on disk, the copy is rebuilt.

## Trilinear

`"trilinear"` builds a chain of half-size levels for the image on the CPU,
in the background. Until it is ready, the node keeps drawing the original
image. The levels are averaged in linear light and weighted by alpha, so
transparent edges don't darken. With its levels, the copy takes about 1.33
times the image's memory.

It needs an image in an 8-bit RGBA format (`Rgba8Unorm` or
`Rgba8UnormSrgb`), which is how most PNG and JPEG files load; other formats
are refused with a warning.

## Refused sources

These sources are drawn as they are, and an explicit mode on them reports one
`imageRendering` warning:

- live textures: `<canvas>`, `<portal>`, an `<image>` showing an SVG file,
  a `backgroundImage` with a `{ texture }` source, and any render target;
- images loaded without a CPU-side copy of their pixels (render-world-only
  asset usage);
- `"trilinear"` on an image format other than 8-bit RGBA.

## Limits

- Composited [layers](layers.md) are not affected: a layer draws its
  captured subtree one to one, and a layer with a `transform3d` already
  samples its capture smoothly.
- The copy is made per image and mode, so many large images with an
  explicit mode cost memory accordingly.

See [`imageRendering`](../reference/style-properties.md#imageRendering) in
the style reference.
