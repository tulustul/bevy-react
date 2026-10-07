# Layout rounding

Bevy rounds every node's laid-out position and size to whole physical
pixels, which keeps edges crisp and text sharp. The price is that a size
animated through layout moves in one-pixel steps, and everything laid out
around it hops along. `layoutRounding: false` turns the rounding off for a
node and its descendants.

## Usage

```tsx
<node style={{ layoutRounding: false, alignItems: "center" }}>
  <node
    style={{
      width: 72,
      height: open ? 120 : 40,
      transition: { size: { duration: 3000 } },
    }}
  />
  <text>glides along</text>
</node>
```

## When rounding shows

Rounding only matters for motion that goes through layout:

- `transition: { size }` easing `width`, `height` or the max sizes;
- an `{ animated }` binding on a size, inset, gap or other layout key;
- the size flight of a [shared element](../animations/shared-elements.md).

Each frame of such an animation is rounded, so the node grows a pixel at a
time, and siblings that are centered or flowed around it shift back and
forth by a pixel as their rounding flips. Animations that never touch
layout, such as `transform`, `opacity` and the visual easing of
`transition: { layout }`, are smooth either way.

## Inheritance

- `layoutRounding` is a boolean. `true` and `false` both apply to the node
  and its whole subtree; unset inherits the nearest ancestor's setting, and
  the default at the top is `true`.
- It inherits downward only. Set it on the parent that lays out both the
  animated node and the neighbours that move with it; setting it on the
  animated node alone leaves the neighbours rounded, and they still hop.
- A `true` deeper inside an unrounded subtree turns rounding back on for
  that branch.
- The setting restarts at every separate UI root: content inside
  [`<root>`](../elements/root.md), [`<surface>`](../elements/surface.md)
  and [`<anchor>`](../elements/anchor.md) is rounded again unless it sets
  `layoutRounding` itself.

## The cost

In an unrounded subtree, anything that rests on a fractional pixel renders
soft: anti-aliased edges, slightly blurred text, and hairline seams between
adjacent backgrounds. An odd-sized child centered in an even-sized parent
is enough. Keep the setting as local as you can, around the part that
animates, rather than on the whole app.

Changing the setting is cheap: it does not trigger a relayout. Switching
rounding back on after an animation settles snaps the content by up to half
a pixel.

See [`layoutRounding`](../reference/style-properties.md#layoutRounding) in
the style reference.
