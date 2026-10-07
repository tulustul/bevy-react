# Opacity

The `opacity` style fades a node, from `0` (invisible) to `1` (opaque). On a
node with children it fades the whole subtree as one image, like CSS: the
subtree is rendered into a [composited layer](layers.md) and blended once, so
overlapping pieces never show through each other. `groupAlpha: false` opts
out of the layer and fades only the node's own fills.

## Usage

```tsx
<node style={{ opacity: 0.4, padding: 16, backgroundColor: "#24283b" }}>
  <text>Faded together</text>
</node>
```

## Group fading

`opacity` promotes the node to a composited layer when all of these hold:

- the node has at least one child;
- `groupAlpha` is not `false` in its base style or any state style;
- the element can be promoted: nested `<text>` spans, SVG shapes,
  `<root>` and `<surface>` never are.

The node and everything under it, borders, shadows and text included, then
fade together. Changing or animating the opacity of a layer is cheap: the
captured image is reused and only its blend changes.

Promotion depends on whether `opacity` is set, not on its value:

- `opacity: 1` keeps the layer, so a fade that crosses `1` never re-creates
  it.
- An `opacity` in `hoverStyle`, `pressStyle` or `focusStyle` promotes the
  node from the start, and an `{ animated }` opacity promotes it too.
  Interaction never adds or removes a layer.

## Per-node fading

Without a layer, either because the node has no children or because of
`groupAlpha: false`, `opacity` multiplies the alpha of the node's own fills:

- `backgroundColor`, `backgroundGradient` and `borderGradient`;
- the `backgroundImage` tint;
- a `<text>`'s color and `textShadow`, and an `<image>`'s tint.

It does not fade the node's `borderColor`, `outline` or `boxShadow`, and it
does not fade its children: with `groupAlpha: false` on a container, only
the container's background fades.

```tsx
<node style={{ opacity: 0.6, groupAlpha: false, backgroundColor: "#24283b" }}>
  <text>Not faded</text>
</node>
```

Use `groupAlpha: false` where a layer would cost too much (a long list of
faded rows) and the visual difference doesn't matter, or set `opacity` on
each child yourself.

## Transitions and animation

```tsx
<node
  style={{ opacity: 1, transition: { opacity: { duration: 200 } } }}
  hoverStyle={{ opacity: 0.7 }}
/>
```

- `transition: { opacity }` eases opacity between style states. Keep the
  resting `opacity: 1` in the base style so the way back eases too.
- `opacity: { animated: sv }` binds it to a shared value, driven every frame
  on the Bevy side. A binding wins over the transition.

See [Style transitions](../animations/style-transitions.md) and
[Animated values](../animations/animated-values.md).

## Behavior

- An invisible node is still there: at `opacity: 0` it keeps its layout
  space and still receives hover and clicks. Use `display: "none"` to take
  it out of layout and interaction.
- Opacities nest: a faded node inside a faded layer is faded twice.
- The value is not clamped; keep it between `0` and `1`.

## Limits

- A promoted node is captured within its border box: whatever the subtree
  paints outside it is cut off while the layer exists, including the node's
  own `boxShadow` and `outline` and children that overflow the box. Put the
  shadow on an unpromoted wrapper, or use `groupAlpha: false`.
- Each layer is an offscreen texture the size of the node; many large faded
  containers cost GPU memory and a capture whenever their content changes.
  See [Layers](layers.md).
- On a node without a layer that also has a `transition` style (for any
  channel) or an `{ animated }` opacity, the opacity replaces the alpha of
  its fills instead of multiplying it: a translucent `backgroundColor`
  becomes as opaque as the opacity value.

See [`opacity`](../reference/style-properties.md#opacity) and
[`groupAlpha`](../reference/style-properties.md#groupAlpha) in the style
reference.
