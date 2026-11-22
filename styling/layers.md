# Layers

Normally the whole UI is drawn directly to the screen every frame. Some
styles instead promote a node to a **composited layer**: the node and its
subtree are rendered into an offscreen texture, and that texture is drawn
back as one image at the node's place in the stacking order. Layers are
what make group opacity, filters, morphs and 3D transforms possible, and
their textures are cached between frames. Promotion is automatic; the
`cache` style forces it.

## Usage

```tsx
<node style={{ cache: "always" }}>
  <Chart data={data} />
</node>
```

The chart is rendered once into a texture and redrawn from it until
something inside it changes.

## What promotes a node

| Style                                   | Promotes when                                           |
| --------------------------------------- | ------------------------------------------------------- |
| [`opacity`](opacity.md)                 | Set on a node with children, unless `groupAlpha: false` |
| [`filter`](filters.md)                  | The chain is not empty                                  |
| [`backdropFilter`](backdrop-filters.md) | The chain is not empty                                  |
| [`morphFilter`](morph-filters.md)       | Set                                                     |
| [`transform3d`](3d-transforms.md)       | Set, even as an empty `{}`                              |
| `cache`                                 | `"always"` or `"never"`                                 |

- Promotion looks at the base `style` and every state style together. A
  `filter` that only appears in `hoverStyle` keeps the node promoted while
  it is not hovered, so hovering never switches a node between the two
  modes.
- Removing the last promoting style turns the node back into ordinary UI.
- `<root>`, `<surface>`, SVG shapes and nested `<text>` spans cannot be
  layers. A layer style on a nested span is ignored with a
  `spanLayerStyle` warning; put it on the outer `<text>` or on a wrapping
  `<node>`.

## What changes and what does not

Promotion only changes how the subtree is drawn:

- Layout, hit testing, refs, events and animations work as before (a
  `transform3d` additionally moves hit testing to the transformed image).
- The subtree is drawn as one image at the node's stacking position, so
  `opacity` fades it as a group: overlapping children no longer show
  through each other.
- The texture covers the node's border box, grown by the reach of its
  filters (a blur, a glow, a shadow). Anything painted outside that area is
  cut off: children that overflow the node, and the node's own `boxShadow`
  and `outline`. Give a promoted node room for its content, or promote an
  inner node instead.

## Caching

A layer is re-rendered only when its content changes. Between changes, the
cached texture is drawn again, which costs one textured quad however large
the subtree is.

Re-renders the layer:

- a prop or style change of any node inside it, including the root (except
  those listed below);
- text changes, images loading or changing, `<canvas>` and `<svg>`
  repaints;
- nodes inside it being added, removed, moved or resized;
- nodes inside it being shown or hidden (Bevy `Visibility`, such as an
  `<anchor>` that stays hidden until its first layout);
- animations and transitions of nodes inside it;
- a focused `editableText` inside it, every frame while its caret blinks;
- a change in a nested layer, which re-renders every layer around it;
- a change of the root font size (`RemSize`), which re-renders every layer.

Does not re-render the layer, because it is applied when the texture is
drawn:

- moving the root: a `transform` translation, a layout move, scrolling;
- the root's `opacity`;
- `filter` and `backdropFilter` params (only the filter passes re-run);
- `transform3d` and morph progress.

Scaling or rotating the root with the 2D `transform` does re-render it.
For a scale or rotation animation on a promoted node, prefer
`transform3d`.

## The cache style

`cache` takes `"auto"` (the default), `"always"` or `"never"`:

- `"auto"` leaves promotion to the other styles.
- `"always"` promotes the node and caches it. Use it for a large subtree
  that rarely changes, so that it is drawn as one quad instead of node by
  node.
- `"never"` promotes the node but re-renders it every frame, and every
  layer around it too.

Use `"never"` when pixels inside the node change without bevy-react
knowing, which would otherwise freeze in a cached layer:

- a [`<portal>`](../elements/portal.md), or a `backgroundImage` with a
  `{ texture }` source, showing a render target that a camera draws into;
- a texture your app writes on the GPU;
- a time-driven custom filter (`time = true`) inside another layer.

```tsx
<node style={{ opacity: 0.9 }}>
  <node style={{ cache: "never" }}>
    <portal target="minimap" />
  </node>
</node>
```

Engine-driven changes never need it: transitions, morphs and `{ animated }`
bindings tell the cache themselves. Opting out of opacity promotion is
`groupAlpha: false` (see [Opacity](opacity.md)), not `cache`.

## Clipping and scrolling

A layer's texture is never clipped by its ancestors. An ancestor's
`overflow` clip, or the window edge, clips the drawn result instead, as on
the web: a blur inside a scroll view stops at the scroll view's edge.
Scrolling a layer in or out of view only moves its image and never
re-renders it.

The clip follows the clipping ancestor's own `transform`, so a rotated scroll
view cuts a layer along its rotated edge. A `transform3d` layer is the
exception: under a rotated clipping ancestor it is cut at that ancestor's
bounding box.

## Costs

- Each layer holds a texture the size of its node (plus filter reach) at
  physical resolution; filters, backdrops and morphs add work textures.
- Every re-render is an extra render pass. A layer with content that
  changes every frame pays it every frame, even while offscreen.
- `cache: "never"` re-renders its layer every frame. It and a
  [`backdropFilter`](backdrop-filters.md) (whose chain re-runs every frame)
  also make every layer around them re-render every frame.
- A no-effect entry kept for transitions (a blur of radius 0, a
  `transform3d: {}`) keeps the node a layer.

## Inspecting layers

The devtools [Layers tab](../tooling/devtools.md#layers) lists every layer
with the reason it was promoted, its size and estimated texture memory, its
filter chains with live values, and a repaint counter. A counter that keeps
climbing while nothing visibly changes points at a layer that re-renders
every frame.

## Limits

- Content outside the node's border box (plus filter reach) is cut off
  while the node is a layer, unlike CSS opacity.
- A [`positionType: "fixed"`](../layout/positioning.md#fixed) descendant is
  not part of the layer. It is drawn on its own over the layer's image, even
  over layer content that comes after it in the tree, and the layer's
  opacity, filters, morph and 3D transform don't apply to it. Put them on
  the fixed node itself.
- Inside a `<surface>`, pointer hits ignore `transform3d` and land where the
  node would be without its transform; on the window they follow it.
- Pixels written behind bevy-react's back freeze in a cached layer until
  something else re-renders it; use `cache: "never"`.
- A filter's shader may need to compile before its first use, and the
  layer is not drawn meanwhile. See
  [Filters](filters.md#shader-compilation).

See [`cache`](../reference/style-properties.md#cache) in the style
reference.
