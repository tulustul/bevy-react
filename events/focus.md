# Focus

One element at a time holds the keyboard focus (Bevy's `InputFocus`). It is
the element typed keys go to, the one `focusStyle` applies to, and the one
Tab moves on from. An [`<editableText>`](../elements/editable-text.md) can
take the focus on its own; any other element can with a `tabIndex`.

## Usage

```tsx
const [focused, setFocused] = useState(false);

<node
  tabIndex={0}
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
  style={{ padding: 12, border: 2, borderColor: "#414868" }}
  focusStyle={{ borderColor: "#7aa2f7" }}
>
  <text>{focused ? "Focused" : "Click me"}</text>
</node>;
```

## What can take the focus

| Element                                                 | Focusable                               |
| ------------------------------------------------------- | --------------------------------------- |
| `<editableText>`                                        | Always (as if `tabIndex={0}`)           |
| `<node>`, `<button>`, `<text>`, `<image>` and the like  | With a `tabIndex`                       |
| `<root>`, `<surface>`, nested `<text>` runs, SVG shapes | Never (`tabIndex` warns and is ignored) |

A `<button>` is not focusable by default: a focused button takes Enter and
Space (see [Keyboard activation](#keyboard-activation)), which a game may
have bound to something else. Give the buttons of a menu a `tabIndex`.

`tabIndex` is Bevy's `TabIndex`:

| Value    | By click or from Rust | By Tab                              |
| -------- | --------------------- | ----------------------------------- |
| `0`      | Yes                   | Yes, in tree order                  |
| Negative | Yes                   | No                                  |
| Positive | Yes                   | Yes, **after** every `0`, ascending |

Positive values sort after `0`, the opposite of HTML. Use `0` and `-1`.

## Focusing with the pointer

A press focuses the topmost element under the pointer that is focusable or
has a focusable ancestor; a press that finds none clears the focus, so
clicking anywhere else blurs. It is the same rule that picks the element a
[click](mouse.md#clicks) goes to:

- A press on a child, such as the `<text>` label of a focusable button,
  focuses the nearest focusable ancestor.
- Of nested focusables, the innermost under the pointer wins.
- A pass-through element drawn over a focusable one doesn't take the focus
  away from it. `focusPolicy: "block"` on the element above does: nothing
  beneath it is pressed. See [Focus policy](../styling/focus-policy.md).
- Any mouse button focuses, and so does a touch.
- Pressing the element that already has the focus changes nothing.

Focusability never changes hit testing: a `tabIndex` doesn't make an element
block the pointer or own clicks.

## Events

| Handler   | Argument | Fires when                   |
| --------- | -------- | ---------------------------- |
| `onFocus` | none     | The element gained the focus |
| `onBlur`  | none     | The element lost the focus   |

- They fire on the element itself and don't bubble: a container isn't told
  about its children's focus.
- When the focus moves from one element to another, the old one's `onBlur`
  fires before the new one's `onFocus`.
- Each fires at most once per frame. Focus that leaves and returns within
  one frame fires nothing.
- A key that takes the focus away reaches [`keyDown`](keyboard.md) listeners
  before the `onBlur` it causes, as in the DOM. A field can tell Escape (a
  cancel) from a click elsewhere (a commit) that way.
- An element that unmounts while focused gives the focus up; its `onBlur`
  doesn't fire, like any handler of an unmounted element.

## Focus styles

`focusStyle` overlays the element's `style` while it holds the focus, and
`focusVisibleStyle` overlays that while the focus indicator shows. Both are
applied on the Bevy side, in the frame the focus moves, with no React state.
See [State styles](../elements/node.md#state-styles).

```tsx
<button
  tabIndex={0}
  focusStyle={{ backgroundColor: "#2a2e42" }}
  focusVisibleStyle={{ outline: { width: 2, color: "#7aa2f7" } }}
/>
```

The indicator follows Bevy's `InputFocusVisible`, like CSS `:focus-visible`:

- Tab navigation turns it on, a pointer press turns it off. A button focused
  by a click gets `focusStyle` only; reached with Tab it gets both.
- A focused `<editableText>` always shows it, however it was focused.
- Without Tab navigation (below) nothing turns it on, so outside text fields
  `focusVisibleStyle` never applies unless your Rust code sets
  `InputFocusVisible` (a gamepad menu would keep it `true`).

## Tab navigation

Tab and Shift+Tab move the focus once the app adds Bevy's
`TabNavigationPlugin`. bevy-react doesn't add it, because a game may use Tab
for something else, but it marks its UI roots as Bevy tab groups so that
this line is all it takes:

```rust
use bevy::input_focus::tab_navigation::TabNavigationPlugin;

app.add_plugins(TabNavigationPlugin);
```

- The order is the tree order of the elements with `tabIndex >= 0`, then
  positive values ascending. Tab wraps around.
- The window's UI comes first, then each [`<root>`](../elements/root.md) and
  the [`<anchor>`](../elements/anchor.md) overlays.
- A [`<surface>`](../elements/surface.md) is its own scope: Tab never
  enters it from the screen, and cycles among the surface's own elements
  once a click has put the focus inside.
- Hidden subtrees (`visibility: "hidden"`) are skipped. A `display: "none"`
  subtree is not: unmount it, or hide it with `visibility`.
- Tab also reaches React as a `keyDown`, like every key (see
  [Keyboard](keyboard.md)).
- Bevy logs a warning for the first Tab after startup (the window itself
  holds the focus and belongs to no group), and one per Tab press while no
  element is focusable.

## Keyboard activation

Enter and Space click a focused `<button>`: its `onClick` fires, once per
key press (not on auto-repeat). Only a `<button>` is activated this way; a
focused `<node onClick>` is not, as on the web. The keys still arrive as
`keyDown` events.

## Disabled controls

`disabled` on a [`<button>`](../elements/button.md#disabled) or an
[`<editableText>`](../elements/editable-text.md#read-only-and-disabled)
takes the element out of focus altogether: a press doesn't focus it, Tab
skips it, and it gives the focus up when it becomes disabled while focused.
A press on a disabled control inside a focusable container focuses the
container.

## Focus from Rust

`InputFocus` is an ordinary Bevy resource: set it to a React entity (found
by [name](../communication/named-nodes.md)) to focus it, clear it to blur.
`focusStyle`, `onFocus` and `onBlur` follow whoever changes it.

```rust
use bevy::input_focus::{FocusCause, InputFocus};
use bevy_react::ReactNodes;

fn focus_search(nodes: ReactNodes, mut focus: ResMut<InputFocus>) {
    if let Some(entity) = nodes.get("search") {
        focus.set(entity, FocusCause::Navigated);
    }
}
```

`TabIndex` on a React entity is written by bevy-react (from `tabIndex`):
set the prop, not the component.

## Limits

- No `focus()` or `blur()` from React: use `autofocus` on an
  `<editableText>`, a click, Tab, or Rust.
- `autofocus` exists on `<editableText>` only.
- No per-element key handlers: keys are the window-wide `keyDown`/`keyUp`.
- A `tabIndex` alone doesn't make an element interactive for
  [`PointerCapture`](mouse.md#keeping-input-away-from-the-world): a press on
  it can still start a camera drag. A `<button>`, or any pointer handler or
  `hoverStyle` on the element, claims the pointer.
- No focus trap for dialogs, and no arrow-key or gamepad navigation: both
  are available from Rust (`TabGroup::modal`, Bevy's directional
  navigation).
- A focusable element that is not a `<button>` or an `<editableText>` is
  announced to assistive tech as a plain container; there is no `ariaLabel`
  for it.
- In a `<surface>`, the IME candidate window is placed for the window, not
  for the point on the mesh.
