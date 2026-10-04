---
description: Decide whether a node stops pointer hover, clicks and 3D-scene picking from reaching what lies beneath it, with focusPolicy block or pass.
demo: Focus policy
covers: [style.focusPolicy]
---

# Focus policy

The `focusPolicy` style decides whether a node stops the pointer from
reaching what lies beneath it: other UI nodes, and the 3D scene behind the
UI. `"block"` stops it; `"pass"` lets it through. Despite the name (it comes
from Bevy), it has nothing to do with keyboard focus.

## Usage

A modal backdrop that keeps hover, clicks and scene picking away from
everything behind it:

```tsx
<node
  style={{
    positionType: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    focusPolicy: "block",
  }}
>
  <Dialog />
</node>
```

## Values

| Value     | Effect                                            | Default for                  |
| --------- | ------------------------------------------------- | ---------------------------- |
| `"pass"`  | Nodes and the scene beneath still see the pointer | Every element but `<button>` |
| `"block"` | Nothing beneath the node sees the pointer         | `<button>`                   |

An explicit value overrides the element's default, on a `<button>` too. An
unknown value reports a `focusPolicy` warning and acts as `"pass"`.

## What blocking stops

Under the pointer, nodes are visited from the topmost down (see
[Z-index](z-index.md)) until the first blocking node, which is included.
Everything beneath it is out of reach:

- **Hover and press.** Only the visited nodes are hovered or pressed, which
  drives `hoverStyle`, `pressStyle`, `onPointerEnter` and `onPointerLeave`.
  That includes the blocking node's own ancestors, which are beneath it: a
  `<button>` inside a hover-styled card un-hovers the card while the pointer
  is on the button. Give the button `focusPolicy: "pass"` if the card should
  stay hovered; the button still gets its own clicks.
- **Clicks.** One click fires one handler, chosen from the topmost visited
  node that has a click handler on itself or an ancestor (see
  [Mouse events](../events/mouse.md)). A click on a blocking overlay without
  a handler can only reach a handler on the overlay's ancestors, never the
  nodes beneath it.
- **3D scene picking.** Bevy picking on meshes and sprites behind the UI
  (for example with `MeshPickingPlugin`) only sees the pointer through
  passing nodes. A blocking node hides the scene behind it.

With `"pass"` everywhere, every node under the pointer is hovered, and a
click goes to the topmost handler among them.

## Input your own systems read

`focusPolicy` affects picking and hover only. Systems that read the mouse
directly, such as a camera controller, should check the `PointerCapture`
resource instead, which reports when the UI owns the pointer. It reports
the pointer as over the UI while it hovers an interactive node (one with a
click or pointer handler, a `hoverStyle` or `pressStyle`, or a `<button>`),
whatever that node's focus policy. A plain panel with no handlers doesn't
capture the pointer, even with `"block"`. See
[Mouse events](../events/mouse.md).

## Behavior

- Transparency doesn't matter: a node at `opacity: 0` or with no background
  still blocks or passes by its policy. `display: "none"` removes it from
  hit testing.
- A [`<root>`](../elements/root.md) never takes part in hit testing itself;
  its children do, by their own policies.
- In a [`<surface>`](../elements/surface.md), the policy applies the same
  way to the in-world pointer.

See [`focusPolicy`](../reference/style-properties.md#focusPolicy) in the
style reference.
