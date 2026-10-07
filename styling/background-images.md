# Background images

The `backgroundImage` style paints a texture as part of a node's own
background: over its `backgroundColor` and gradients, under its content and
children. The source is an asset path or a texture the app registered on the
Rust side. A background image never affects layout.

## Usage

```tsx
<node
  style={{
    width: 150,
    height: 96,
    borderRadius: 10,
    backgroundColor: "#1a1b26",
    backgroundImage: { src: "images/parrot.png" },
  }}
/>
```

The value is always an object with a `src`; there is no string shorthand.

| Field   | Type                                              | Default     | Effect                                   |
| ------- | ------------------------------------------------- | ----------- | ---------------------------------------- |
| `src`   | `string` or `{ texture: string }`                 | required    | Asset path, or a registered texture name |
| `mode`  | `"stretch"`, `"repeat"`, `"repeatX"`, `"repeatY"` | `"stretch"` | How the texture fills the node           |
| `scale` | `number`                                          | `1`         | Tile size multiplier in the repeat modes |
| `tint`  | color                                             | white       | Multiplied with every texel              |

A value without `src`, or a bare string, is ignored with a
`backgroundImage` warning; the rest of the style still applies.

## Sources

- A string `src` is an asset path loaded by Bevy's `AssetServer`, relative
  to the app's asset folder, as for [`<image>`](../elements/image.md). Any
  format your Bevy build can load works.
- `{ texture: "name" }` shows a texture registered in the `RenderTargets`
  resource. Until the name is registered the node shows nothing, and it
  picks the texture up as soon as it appears.

```tsx
<node
  style={{
    width: 190,
    height: 130,
    backgroundImage: { src: { texture: "checker" }, mode: "repeat" },
  }}
/>
```

```rust
use bevy::asset::RenderAssetUsages;
use bevy::prelude::*;
use bevy::render::render_resource::{Extent3d, TextureDimension, TextureFormat};
use bevy_react::RenderTargets;

fn register_checker(
    mut targets: ResMut<RenderTargets>,
    mut images: ResMut<Assets<Image>>,
) {
    let image = Image::new_fill(
        Extent3d { width: 2, height: 2, depth_or_array_layers: 1 },
        TextureDimension::D2,
        &[122, 162, 247, 255],
        TextureFormat::Rgba8UnormSrgb,
        RenderAssetUsages::default(),
    );
    targets.register("checker", images.add(image));
}
```

Registered textures are meant for static content: an image you generated or
loaded once. To show a camera's live output, use
[`<portal>`](../elements/portal.md).

## Fit and tiling

- The image fills the node's content box, inside the border and the
  padding. With padding, the `backgroundColor` shows around it.
- `"stretch"` fills that box exactly, ignoring the texture's aspect ratio.
- `"repeat"` tiles the texture on both axes at its own size, one texel per
  logical pixel on every display, times `scale`. `"repeatX"` tiles
  horizontally and stretches vertically; `"repeatY"` the reverse.
- `scale` only applies to the repeat modes (`0.5` tiles at half size). Under
  `"stretch"` it is ignored with a `backgroundImage` warning.
- `borderRadius` clips the image in `"stretch"` mode but not in the repeat
  modes.
- An unknown `mode` falls back to `"stretch"` with a `backgroundImage`
  warning.

## Tint and opacity

`tint` multiplies every texel, like an `<image>`'s tint. `opacity` on the
node fades the image with the rest of the node's fills (see
[Opacity](opacity.md)).

`tint` accepts an `{ animated }` `interpolateColor` binding in the base
style, driven every frame without re-rendering React:

```tsx
function Glowing() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1600 }), { reverse: true });
  }, [t]);
  const tint = interpolateColor(t, [0, 1], ["#ffffff", "#7aa2f7"]);
  return (
    <node
      style={{
        width: 150,
        height: 96,
        backgroundImage: { src: "images/parrot.png", tint: { animated: tint } },
      }}
    />
  );
}
```

`scale` does not animate: an `{ animated }` wrapper on it is accepted but
has no effect.

## Behavior

- While the asset loads, the node's `backgroundColor` and gradients show,
  and nothing reflows when the texture arrives.
- A `hoverStyle`, `pressStyle` or `focusStyle` value replaces the whole
  `backgroundImage` (all its fields) and swaps instantly; there is no
  transition.
- [`imageRendering`](image-rendering.md) controls how an asset-path source
  is resampled when drawn smaller or larger than its own size.
- `<image>`, `<canvas>`, `<portal>`, `<surface>` and `<svg>` own their
  node's image: on them `backgroundImage` is ignored with a `styleIgnored`
  warning. Wrap them in a `<node>` to give them a background.

## Limits

- No `object-fit` or position: the image either stretches to the content
  box or tiles from its top-left corner.
- A `{ texture }` source is not watched for changes. A texture that changes
  every frame still shows inside normal UI, but inside a cached
  [composited layer](layers.md) it freezes on the last captured frame.
- A background never resizes a render target created with automatic
  resolution; give such targets a fixed resolution.
- `imageRendering` modes are refused on a `{ texture }` source.

See [`backgroundImage`](../reference/style-properties.md#backgroundImage) in
the style reference.
