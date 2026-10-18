# `<button>`

`<button>` is a [`<node>`](node.md) meant for controls. It takes the same
style and props as a `<node>` and has no built-in look; what it adds is
pointer behavior: it blocks the pointer by default, always tracks hover and
press, and owns every click that lands inside it. On the Bevy side it
carries Bevy's widget `Button` component (`bevy::ui_widgets::Button`).

## Usage

```tsx
const [count, setCount] = useState(0);

<button
  onClick={() => setCount((c) => c + 1)}
  style={{
    padding: { horizontal: 16, vertical: 8 },
    borderRadius: 8,
    backgroundColor: "#7aa2f7",
    cursor: "pointer",
  }}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ backgroundColor: "#5a7fd6" }}
>
  <text style={{ color: "#1a1b26" }}>Clicked {count} times</text>
</button>;
```

`hoverStyle` and `pressStyle` give the button its feedback with no React
state. See [State styles](node.md#state-styles) for the overlay rules.

## How it differs from `<node>`

|                       | `<node>`                                 | `<button>`                           |
| --------------------- | ---------------------------------------- | ------------------------------------ |
| Default `focusPolicy` | `"pass"`                                 | `"block"`                            |
| Owns clicks           | Only with `onClick` or an `onPointer*`   | Always, with or without `onClick`    |
| Hover and press state | Tracked only with state styles, handlers | Always tracked (`ReactInteraction`)  |
| Focusable             | With a `tabIndex`                        | With a `tabIndex`                    |
| Bevy components       | `Node`                                   | `Node`, `Button`, `ReactInteraction` |

### It blocks the pointer

A press on a button stops there: the 3D scene, siblings behind it and its
ancestors don't receive it, so clicking a toolbar button doesn't also start
a camera drag. Set `focusPolicy: "pass"` in its style to let the pointer
through; unsetting it returns to `"block"`. See
[Focus policy](../styling/focus-policy.md).

Blocking also ends hover for what is beneath: while the pointer is over the
button, a hover-styled card around it loses its `hoverStyle` and gets an
`onPointerLeave`. Give the button `focusPolicy: "pass"` if the card should
stay hovered.

### It owns its clicks

- A click anywhere inside the button, on its `<text>` label or any other
  child, fires the button's `onClick`.
- A button without `onClick` still takes the click: an `onClick` on one of
  its ancestors does not fire. Clicks never bubble.
- A child with its own `onClick` or `onPointer*` handler gets the click
  instead of the button.
- `onClick` fires for the primary mouse button (or a tap) on release over the
  button the press started on. Pressing, dragging off and releasing
  elsewhere does not click. For other buttons use `onPointerDown` and read
  `e.button`. See [Mouse](../events/mouse.md).

## Disabled

`disabled` makes a button inert without unmounting it or dropping its
handlers:

```tsx
<button
  disabled={!canSave}
  onClick={save}
  style={canSave ? saveStyle : { ...saveStyle, ...dimmed }}
>
  <text>Save</text>
</button>
```

- `onClick` doesn't fire, by pointer or by keyboard. The button still owns
  the click: it is swallowed, not passed to an `onClick` ancestor.
- It can't take the focus: a press doesn't focus it, Tab skips it, and a
  button that becomes disabled while focused gives the focus up.
- `pressStyle` never applies. `hoverStyle` and the `onPointer*` handlers
  keep working, as CSS `:hover` does on a disabled control (a tooltip on a
  disabled button needs them). Drop the `hoverStyle` yourself if it
  shouldn't light up.
- There is no disabled look and no `disabledStyle`: the button is styled by
  the same prop that disables it, as above.
- Assistive tech sees the button as disabled.

## Keyboard

A `<button>` takes the keyboard focus only with a `tabIndex`. While it is
focused, Enter and Space click it: `onClick` fires once per key press.
`focusStyle` shows the focus. See [Focus](../events/focus.md).

```tsx
<button tabIndex={0} onClick={start} focusStyle={{ borderColor: "#7aa2f7" }}>
  <text>Start</text>
</button>
```

## Building a button component

The element is deliberately bare: wrap it once in your own component with
your look, label styles and press feedback. The demo app's `Button`
([`components/Button.tsx`](../../../examples/demos/ui/src/components/Button.tsx))
is a fuller example, combining gradients, a `pinch`
[filter](../styling/filters.md) driven by an
[animated value](../animations/animated-values.md), and a shadow that
flattens while pressed.

![The demo app's Button component in its example card: a "Click me" button that squeezes under the cursor on press and springs back, counting the clicks.](https://tulustul.github.io/bevy-react/screenshots/button.webp)

## Limits

- There is no `ariaLabel`. The button is named for assistive tech from the
  text under it (nested wrappers included), refreshed when its direct
  children change, so an icon-only button has no name.

See [`<button>`](../reference/elements.md#button) in the element reference.
