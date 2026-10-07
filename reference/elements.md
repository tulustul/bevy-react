# Elements

Every intrinsic element the library registers, generated from its element
registry: the core elements and those of the default cargo features. Each
element also takes `style` and `children` (unless noted) and the common
prop groups listed below.

## Common props

### Identity

`BevyAttributes`

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `string` | Names the element's Bevy entity: the value lands on it as a Bevy `Name` component and in the `ReactNodes` index, so app systems can find React-created entities (`Query<(Entity, &Name), With<ReactNode>>` or `ReactNodes::get("hud")`) and attach their own components, read layout, or watch mount/unmount. Not unique — a list can name every card `"card"` (`ReactNodes::all`). Dynamic: a change renames, removing it (or `""`) drops the `Name`. Bridge-owned: Rust code must not set `Name` on React nodes itself. |
| `sharedTag` | `string` | Shared-element identity. When one commit unmounts a node with this tag and mounts another with the same tag — a different parent, a different screen; React has no reparenting, so a "move" is always unmount + mount — the incoming node starts where the outgoing one visually was: its position and size (the rect it showed, mid-flight included), its background color, opacity, transforms, filters and gradients, and eases to its own layout and style with `transition: { sharedElement }` on the incoming node (required — a tag without it pairs but snaps). Pairing rules: same tag, same element type, same UI root (a `<surface>`/`<root>` is its own), same commit; the first mounted matching outgoing node seeds every incoming node with the tag, silently. Unique tags per screen (`hero-${id}`) are the intent. Size flies in measured px through real layout (the parent re-flows each frame; children stay crisp); position by translation; the outgoing node unmounts instantly; the flight is clipped by the new parent's overflow like any layout transition. A `""` is untagged. |

### State styles

`BevyVariantProps`

| Prop | Type | Description |
| --- | --- | --- |
| `hoverStyle` | `BevyStyle` | Style overlaid on `style` while the element is hovered. |
| `pressStyle` | `BevyStyle` | Style overlaid on `style` (and `hoverStyle`) while the element is pressed. |
| `focusStyle` | `BevyStyle` | Style overlaid on `style` while the element is focused. Applied on the Bevy side from the element's focus state, so it needs no React `onFocus` round-trip (the focus analogue of `hoverStyle`/`pressStyle`). |

### Pointer events

`BevyPointerProps`

| Prop | Type | Description |
| --- | --- | --- |
| `onClick` | `() => void` | Clicked with the primary (left) mouse button: fires on release over the element the press landed on (press, drag off, release elsewhere does not click — DOM `click` semantics). For right/middle interactions use `onPointerDown`/`onPointerUp` and read `e.button`. |
| `onPointerDown` | `(e: PointerEventData) => void` | Pointer pressed on this element (a drag begins). Receives the cursor's normalized position within the element. |
| `onPointerMove` | `(e: PointerEventData) => void` | Pointer moved while held down (a drag). Fires each frame the button stays down — even when the cursor leaves the element — until release. |
| `onPointerUp` | `(e: PointerEventData) => void` | Pointer released after a press/drag that began on this element. |
| `onPointerEnter` | `(e: PointerEventData) => void` | Pointer entered this element (hover begins). Fires once on the boundary crossing — not again on press/release while still inside. |
| `onPointerLeave` | `(e: PointerEventData) => void` | Pointer left this element (hover ends). |

### Scrolling

`BevyScrollProps`

| Prop | Type | Description |
| --- | --- | --- |
| `scrollTop` | `number` | Controlled vertical scroll offset in logical px (maps to `ScrollPosition.y`). Meaningful on a node with `overflowY: "scroll"`. Pushed into the node only when it diverges from the live offset, so it never fights the user's wheel. |
| `scrollLeft` | `number` | Controlled horizontal scroll offset in logical px (maps to `ScrollPosition.x`). Meaningful on a node with `overflowX: "scroll"`. |
| `scrollStep` | `number` | Logical pixels scrolled per mouse-wheel "line" for this container (default 20). Only scales line-based wheels; trackpad pixel deltas are used as-is. |
| `onScroll` | `(e: { scrollTop: number; scrollLeft: number }) => void` | Fires when this node's scroll offset changes (wheel or a controlled write). Receives the new offset; pair with `scrollTop`/`scrollLeft` for a controlled scroll container. |

### Wheel

`BevyWheelProps`

| Prop | Type | Description |
| --- | --- | --- |
| `onWheel` | `(e: WheelEventData) => void` | Mouse wheel over this node. Fires for **any** node (no `overflow: scroll` needed) with the raw deltas — drive a zoom, pan, or custom scroll. Handling the wheel traps it from world systems (a 3D camera behind it won't also zoom). |

## `<anchor>`

Common props: Identity, State styles, Pointer events, Scrolling, Wheel. Guide: [<anchor>](../elements/anchor.md).

| Attribute | Type | Required |
| --- | --- | --- |
| `entity` | `number \| bigint` | yes |
| `offset` | `Vec3` |  |
| `scale` | `AnchorScaling` |  |

## `<button>`

Common props: Identity, State styles, Pointer events, Scrolling, Wheel. Guide: [<button>](../elements/button.md).

No element-specific attributes.

## `<canvas>`

Common props: Identity, State styles, Pointer events, Scrolling, Wheel. Guide: [<canvas>](../elements/canvas.md).

| Attribute | Type |
| --- | --- |
| `draw` | `CanvasPainter \| DrawCmd[]` |


| Event | Handler type |
| --- | --- |
| `onResize` | `(payload: CanvasSize) => void` |

## `<circle>`

Common props: Identity, Pointer events. Guide: [<svg>](../elements/svg.md).

| Attribute | Type |
| --- | --- |
| `cx` | `Animatable<number>` |
| `cy` | `Animatable<number>` |
| `r` | `Animatable<number>` |
| `fill` | `string` |
| `stroke` | `string` |
| `strokeWidth` | `Animatable<number>` |
| `opacity` | `Animatable<number>` |
| `fillRule` | `"nonzero" \| "evenodd"` |
| `strokeLinecap` | `"butt" \| "round" \| "square"` |
| `strokeLinejoin` | `"miter" \| "round" \| "bevel"` |
| `transform` | `string` |
| `transition` | `BevyShapeTransition` |

## <a id="editableText"></a>`<editableText>`

Common props: Identity, State styles. Guide: [<editableText>](../elements/editable-text.md).

| Attribute | Type |
| --- | --- |
| `value` | `string` |
| `maxLength` | `number` |
| `multiline` | `boolean` |
| `autofocus` | `boolean` |
| `selectionStart` | `number` |
| `selectionEnd` | `number` |
| `ariaLabel` | `string` |


| Event | Handler type |
| --- | --- |
| `onChange` | `(payload: string) => void` |
| `onSelect` | `(payload: SelectEvent) => void` |
| `onFocus` | `() => void` |
| `onBlur` | `() => void` |

## `<ellipse>`

Common props: Identity, Pointer events. Guide: [<svg>](../elements/svg.md).

| Attribute | Type |
| --- | --- |
| `cx` | `Animatable<number>` |
| `cy` | `Animatable<number>` |
| `rx` | `Animatable<number>` |
| `ry` | `Animatable<number>` |
| `fill` | `string` |
| `stroke` | `string` |
| `strokeWidth` | `Animatable<number>` |
| `opacity` | `Animatable<number>` |
| `fillRule` | `"nonzero" \| "evenodd"` |
| `strokeLinecap` | `"butt" \| "round" \| "square"` |
| `strokeLinejoin` | `"miter" \| "round" \| "bevel"` |
| `transform` | `string` |
| `transition` | `BevyShapeTransition` |

## `<g>`

Common props: Identity. Guide: [<svg>](../elements/svg.md).

| Attribute | Type |
| --- | --- |
| `transform` | `string` |
| `opacity` | `Animatable<number>` |
| `transition` | `BevyShapeTransition` |

## `<image>`

Common props: Identity, State styles, Pointer events, Scrolling, Wheel. Guide: [<image>](../elements/image.md).

| Attribute | Type |
| --- | --- |
| `src` | `string` |
| `tint` | `string` |
| `flipX` | `boolean` |
| `flipY` | `boolean` |
| `imageMode` | `ImageMode` |
| `sourceRect` | `SourceRect` |
| `atlas` | `AtlasSpec` |
| `visualBox` | `"content" \| "padding" \| "border"` |

## `<line>`

Common props: Identity, Pointer events. Guide: [<svg>](../elements/svg.md).

| Attribute | Type |
| --- | --- |
| `x1` | `Animatable<number>` |
| `y1` | `Animatable<number>` |
| `x2` | `Animatable<number>` |
| `y2` | `Animatable<number>` |
| `fill` | `string` |
| `stroke` | `string` |
| `strokeWidth` | `Animatable<number>` |
| `opacity` | `Animatable<number>` |
| `fillRule` | `"nonzero" \| "evenodd"` |
| `strokeLinecap` | `"butt" \| "round" \| "square"` |
| `strokeLinejoin` | `"miter" \| "round" \| "bevel"` |
| `transform` | `string` |
| `transition` | `BevyShapeTransition` |

## `<node>`

Common props: Identity, State styles, Pointer events, Scrolling, Wheel. Guide: [<node>](../elements/node.md).

No element-specific attributes.

## `<path>`

Common props: Identity, Pointer events. Guide: [<svg>](../elements/svg.md).

| Attribute | Type |
| --- | --- |
| `d` | `string` |
| `fill` | `string` |
| `stroke` | `string` |
| `strokeWidth` | `Animatable<number>` |
| `opacity` | `Animatable<number>` |
| `fillRule` | `"nonzero" \| "evenodd"` |
| `strokeLinecap` | `"butt" \| "round" \| "square"` |
| `strokeLinejoin` | `"miter" \| "round" \| "bevel"` |
| `transform` | `string` |
| `transition` | `BevyShapeTransition` |

## `<polygon>`

Common props: Identity, Pointer events. Guide: [<svg>](../elements/svg.md).

| Attribute | Type |
| --- | --- |
| `points` | `number[]` |
| `fill` | `string` |
| `stroke` | `string` |
| `strokeWidth` | `Animatable<number>` |
| `opacity` | `Animatable<number>` |
| `fillRule` | `"nonzero" \| "evenodd"` |
| `strokeLinecap` | `"butt" \| "round" \| "square"` |
| `strokeLinejoin` | `"miter" \| "round" \| "bevel"` |
| `transform` | `string` |
| `transition` | `BevyShapeTransition` |

## `<polyline>`

Common props: Identity, Pointer events. Guide: [<svg>](../elements/svg.md).

| Attribute | Type |
| --- | --- |
| `points` | `number[]` |
| `fill` | `string` |
| `stroke` | `string` |
| `strokeWidth` | `Animatable<number>` |
| `opacity` | `Animatable<number>` |
| `fillRule` | `"nonzero" \| "evenodd"` |
| `strokeLinecap` | `"butt" \| "round" \| "square"` |
| `strokeLinejoin` | `"miter" \| "round" \| "bevel"` |
| `transform` | `string` |
| `transition` | `BevyShapeTransition` |

## `<portal>`

Common props: Identity, State styles, Pointer events, Scrolling, Wheel. Guide: [<portal>](../elements/portal.md).

| Attribute | Type | Required |
| --- | --- | --- |
| `target` | `string` | yes |

## `<rect>`

Common props: Identity, Pointer events. Guide: [<svg>](../elements/svg.md).

| Attribute | Type |
| --- | --- |
| `x` | `Animatable<number>` |
| `y` | `Animatable<number>` |
| `width` | `Animatable<number>` |
| `height` | `Animatable<number>` |
| `rx` | `Animatable<number>` |
| `ry` | `Animatable<number>` |
| `fill` | `string` |
| `stroke` | `string` |
| `strokeWidth` | `Animatable<number>` |
| `opacity` | `Animatable<number>` |
| `fillRule` | `"nonzero" \| "evenodd"` |
| `strokeLinecap` | `"butt" \| "round" \| "square"` |
| `strokeLinejoin` | `"miter" \| "round" \| "bevel"` |
| `transform` | `string` |
| `transition` | `BevyShapeTransition` |

## `<root>`

Common props: Identity. Guide: [<root>](../elements/root.md).

No element-specific attributes.

## `<surface>`

Common props: Identity. Guide: [<surface>](../elements/surface.md).

| Attribute | Type | Required |
| --- | --- | --- |
| `target` | `string` | yes |

## `<svg>`

Common props: Identity, State styles, Pointer events, Scrolling, Wheel. Guide: [<svg>](../elements/svg.md).

| Attribute | Type |
| --- | --- |
| `viewBox` | `string` |

## `<text>`

Common props: Identity, State styles, Pointer events, Scrolling, Wheel. Guide: [<text>](../elements/text.md).

No element-specific attributes.
