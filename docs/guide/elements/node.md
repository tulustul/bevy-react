---
description: The <node> element is the styled container every layout is built from, plus the props, state styles and events all styled elements share.
demo: <node>
covers: [element.node]
---

# `<node>`

`<node>` is the plain container: one `bevy_ui` `Node` entity that takes a
`style`, lays out its children with flexbox or grid, and reports pointer
events. There are no `div`s or `span`s; every layout is built from `<node>`.
Most of this page (the `style` prop, state styles, events, identity props)
applies to every styled element, `<button>`, `<text>` and `<image>`
included.

## Usage

```tsx
<node style={{ flexDirection: "row", gap: 12, padding: 16 }}>
  <node style={{ width: 48, height: 48, backgroundColor: "#7aa2f7" }} />
  <node style={{ width: 48, height: 48, backgroundColor: "#9ece6a" }} />
</node>
```

A `<node>` starts with Bevy's defaults: a flex container laid out as a row,
sized by its content, with a transparent background, and passing the
pointer through to whatever is behind it. Arrange children with
[flexbox](../layout/flexbox.md), [grid](../layout/grid.md) or
[positioning](../layout/positioning.md), and size and space them with
[sizing](../styling/sizing.md) and [spacing](../styling/spacing.md).

## Top-level layout

Elements rendered at the top of your React tree are children of a
window-filling flex column that centers them horizontally and spaces them
16px apart. To lay out the whole window yourself, render a single node that
fills it:

```tsx
export function App() {
  return <node style={{ width: "100%", height: "100%" }}>{/* … */}</node>;
}
```

## Common props

| Prop                                     | Effect                                                    | Details                                              |
| ---------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `style`                                  | Layout and paint, as a `BevyStyle` object                 | [Style properties](../reference/style-properties.md) |
| `hoverStyle`, `pressStyle`, `focusStyle` | Style overlays for interaction states                     | [State styles](#state-styles) below                  |
| `onClick`, `onPointer*`                  | Click, drag and hover events                              | [Mouse](../events/mouse.md)                          |
| `onWheel`                                | Raw wheel deltas over the element                         | [Mouse](../events/mouse.md)                          |
| `scrollTop`, `scrollLeft`, `scrollStep`  | Controlled scrolling of an `overflow: "scroll"` container | [Overflow](../styling/overflow.md)                   |
| `onScroll`                               | The scroll offset changed                                 | [Overflow](../styling/overflow.md)                   |
| `name`                                   | Names the Bevy entity, so Rust systems can find it        | [Named nodes](../communication/named-nodes.md)       |
| `sharedTag`                              | Shared-element identity across unmount and mount          | [Shared elements](../animations/shared-elements.md)  |
| `key`                                    | React's list key                                          | React                                                |

Not every element takes every group: `<editableText>` has no pointer, scroll
or wheel props, `<root>` and nested `<text>` spans take only `style`, `name`,
`sharedTag` and `key`. A prop outside an element's groups is ignored with a
`propIgnored` devtools warning. The element reference lists the groups per
element.

Every prop crosses to Bevy only when its value changes, so re-rendering
with the same props costs nothing on the Bevy side. Unsetting a style
property returns it to the element's default (for example `focusPolicy`
returns to `"block"` on a `<button>`).

## State styles

`hoverStyle`, `pressStyle` and `focusStyle` overlay the base `style` while
the element is in that state. They are applied on the Bevy side: no React
state, no re-render.

```tsx
<node
  style={{
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#24283b",
    transition: { backgroundColor: { duration: 150 } },
  }}
  hoverStyle={{ backgroundColor: "#414868" }}
  pressStyle={{ backgroundColor: "#565f89" }}
/>
```

- The overlays stack in order: `style`, then `hoverStyle` while hovered,
  then `pressStyle` while pressed (a pressed element is also hovered), then
  `focusStyle` while focused, so `focusStyle` wins any conflict.
- A state style carries any style property and only changes what it sets.
  When the state ends, those properties return to the base style.
- With a `transition` on the base style, state changes ease instead of
  snapping. See [Style transitions](../animations/style-transitions.md).
- Hover covers every element under the pointer, from the topmost down to the
  first one that blocks (`focusPolicy: "block"`). A hovered child keeps its
  pass-through ancestors hovered too, but a `<button>` on top un-hovers
  everything beneath it, its ancestors included.
- `pressStyle` follows the primary mouse button or a touch. It stays applied
  from the press until the release, even if the pointer leaves the element
  meanwhile.
- `{ animated }` bindings work in the base `style` only. A binding in a state
  style is ignored with a `styleBinding` warning.
- Only `<editableText>` takes focus on its own (by click or `autofocus`). On
  other elements, `focusStyle` applies only while your Rust code gives the
  entity Bevy's `InputFocus`.

## Pointer behavior

- A `<node>` passes the pointer through by default. Even with an `onClick`,
  a press also reaches what is behind it, including the 3D scene, so a
  camera drag can start under your panel. Use a
  [`<button>`](button.md) or `focusPolicy: "block"` for controls and
  panels that should catch the pointer. See
  [Focus policy](../styling/focus-policy.md).
- Clicks do not bubble. A click goes to the topmost element under the
  pointer that has an `onClick` or any `onPointer*` handler, or is a
  `<button>` or `<editableText>`, and to no other element. Clicking a
  `<text>` label inside a clickable node fires the node's `onClick`.
- `onPointer*` handlers alone make an element own clicks: a child with only
  `onPointerEnter` swallows clicks meant for an `onClick` ancestor.

## Limits

- No CSS cascade: styles never inherit from a parent `<node>`, text styles
  included. Share style objects in JavaScript instead.
- Children are laid out by Bevy's flexbox and grid only; there is no inline
  or block flow.

See [`<node>`](../reference/elements.md#node) in the element reference, and
[Common props](../reference/elements.md#common-props) for every shared prop's
type.
