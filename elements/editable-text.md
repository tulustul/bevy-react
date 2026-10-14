# `<editableText>`

`<editableText>` is a focusable plain-text input, single- or multi-line,
built on Bevy's `EditableText` widget. Bevy handles typing, the caret,
selection, IME composition and the clipboard; the element follows React's
controlled-input pattern with `value` and `onChange`. It has no look of its
own: the box, border and focus ring are your styles.

## Usage

```tsx
const [name, setName] = useState("");

<editableText
  value={name}
  onChange={setName}
  maxLength={40}
  style={{
    width: 280,
    padding: { horizontal: 12, vertical: 8 },
    border: 1,
    borderColor: "#414868",
    borderRadius: 8,
    backgroundColor: "#1a1b26",
    color: "#c0caf5",
    cursor: "text",
  }}
  focusStyle={{ borderColor: "#7aa2f7" }}
/>;
```

## Attributes

| Attribute        | Type      | Default | Effect                                                |
| ---------------- | --------- | ------- | ----------------------------------------------------- |
| `value`          | `string`  | `""`    | The text, pushed into the field when the prop changes |
| `maxLength`      | `number`  | none    | The most characters the user can type or paste        |
| `multiline`      | `boolean` | `false` | Enter inserts a newline and long lines wrap           |
| `autofocus`      | `boolean` | `false` | Focus the field when it mounts                        |
| `selectionStart` | `number`  | none    | Selection anchor, a UTF-8 byte offset                 |
| `selectionEnd`   | `number`  | none    | Selection focus (the caret end), a UTF-8 byte offset  |
| `ariaLabel`      | `string`  | none    | The field's accessible name                           |
| `readOnly`       | `boolean` | `false` | The user can select and copy the text, not change it  |
| `disabled`       | `boolean` | `false` | The field is inert: no focus, caret or edits          |

## Events

| Handler    | Argument      | Fires when                       |
| ---------- | ------------- | -------------------------------- |
| `onChange` | `string`      | The user changed the text        |
| `onSelect` | `SelectEvent` | The caret or the selection moved |
| `onFocus`  | none          | The field gained focus           |
| `onBlur`   | none          | The field lost focus             |

`SelectEvent` has `selectionStart` and `selectionEnd` (UTF-8 byte offsets,
start never greater than end), `selectionDirection` (`"forward"`,
`"backward"`, or `"none"` for a collapsed caret) and `composing` (an IME
composition is in progress).

## Controlled value

- `onChange` receives the whole new text after each user edit. It does not
  fire for changes you make through `value`.
- `value` reaches the field only when the prop changes. When it differs
  from what the field shows, it replaces the text and moves the caret to the
  end; when it matches (the usual echo of `onChange`), nothing happens, so
  typing is never interrupted.
- Without `value` the field is uncontrolled and starts empty.
- `maxLength` limits edits only: a longer `value` from React is shown in
  full.

## Selection

`selectionStart` and `selectionEnd` select a range when either prop
changes. `selectionStart` is the anchor and `selectionEnd` the focus, where
the caret sits, so a backward selection has `selectionStart` greater than
`selectionEnd`. Equal values place the caret.

- Offsets are UTF-8 byte offsets, the same unit `onSelect` reports. They
  match JavaScript string indices for ASCII text only.
- A range whose offsets don't fall on character boundaries is ignored.
- `onSelect` fires only while a handler is set, and not for selections you
  set through the props.

To control the selection while the user moves the caret, mirror `onSelect`
into the props, swapping the ends of a backward selection:

```tsx
const [sel, setSel] = useState({ start: 0, end: 0 });

<editableText
  value={text}
  onChange={setText}
  selectionStart={sel.start}
  selectionEnd={sel.end}
  onSelect={(e) =>
    setSel(
      e.selectionDirection === "backward"
        ? { start: e.selectionEnd, end: e.selectionStart }
        : { start: e.selectionStart, end: e.selectionEnd },
    )
  }
/>;
```

## Focus and keyboard

- A field is focusable without a `tabIndex` (it acts as `tabIndex={0}`; set
  `-1` to keep it out of the Tab order). It takes focus when clicked, when it
  mounts with `autofocus`, by Tab, or when your Rust code sets Bevy's
  `InputFocus` to it. Clicking anywhere else blurs it, as on the web; so
  does Escape, and Rust clearing `InputFocus`. See
  [Focus](../events/focus.md).
- `focusStyle` applies while the field is focused, with no React state, and
  so does `focusVisibleStyle`: a field shows its focus indicator however it
  was focused. `hoverStyle` and `pressStyle` work as on a `<node>`.
- When the focus moves between two fields, the first one's `onBlur` fires
  before the second one's `onFocus`.
- Editing keys are Bevy's: arrows, Home and End, word moves and deletes with
  Ctrl (Alt on macOS), Ctrl+A, Ctrl+C, Ctrl+X and Ctrl+V with the system
  clipboard (Cmd on macOS), and Escape to collapse the selection and leave
  the field.
  Double-click selects a word, triple-click selects everything.
- The field consumes typed keys, but the global `keyDown` and `keyUp` events
  still fire. There is no submit event: handle Enter there while the field
  is focused.

```tsx
import { on } from "./bevy";

useEffect(() => {
  if (!focused) return;
  return on("keyDown", (e) => {
    if (e.key === "Enter") submit();
  });
}, [focused]);
```

See [Keyboard](../events/keyboard.md) for the event payload.

## Read-only and disabled

|                                 | `readOnly`            | `disabled`       |
| ------------------------------- | --------------------- | ---------------- |
| Focus (click, Tab, `autofocus`) | Yes                   | No               |
| Caret, selection, copy          | Yes                   | No (both hidden) |
| Typing, paste, cut, IME         | No                    | No               |
| `onChange` from the user        | Never                 | Never            |
| `onSelect` from the user        | Fires                 | Never            |
| `focusStyle`                    | Applies while focused | Never            |
| `hoverStyle`                    | Applies               | Applies          |
| `pressStyle`                    | Applies               | Never            |

- Both still follow a controlled `value`.
- A field that becomes `disabled` while focused gives the focus up (its
  `onBlur` fires). `disabled` wins when both are set.
- Neither has a look of its own. Dim a disabled field through its `style`:
  `style={disabled ? dimmed : normal}`.
- A read-only field draws its selection in the unfocused color (Bevy's
  `TextCursorStyle::unfocused_selection_color`), even while focused.
- Assistive tech sees the field as read-only or disabled.

## Layout and styles

- The field has no intrinsic width, and its intrinsic height is one line,
  `multiline` included. Give it a `width`, and a `height` for several lines.
  Content beyond the box scrolls to follow the caret.
- `multiline` wraps long lines at word boundaries; a single-line field never
  wraps.
- `color` (which also colors the caret), `fontSize`, `fontWeight`,
  `fontFamily`, `lineHeight` and `letterSpacing` style the text as on
  [`<text>`](text.md). `textAlign` and `lineBreak` have no effect.
- A click inside the field never fires an ancestor's `onClick`. The field
  itself takes no `onClick`, `onPointer*`, scroll or wheel props.
- The field passes the pointer like a `<node>`: a hover-styled card around
  it stays hovered, and a press on it also reaches an ancestor's
  `onPointerDown`. Inside a draggable element, give the field
  `focusPolicy: "block"` so selecting text doesn't drag it. See
  [Focus policy](../styling/focus-policy.md).
- Assistive tech sees a text input (a multi-line one with `multiline`),
  named by `ariaLabel`, with the current text as its value.

## Limits

- Plain text with one style for the whole field.
- No placeholder or password mode, no undo or redo, and no submit event.
- Rejecting an edit in `onChange` doesn't revert the field: if the state
  stays at the previous `value`, the prop doesn't change and the field keeps
  the user's text.
- The same applies to a selection: setting the pair it already holds does
  nothing, even after the user moved the caret, unless you mirror `onSelect`
  as shown above.
- Changing `multiline` after mount switches Enter-to-newline but not
  wrapping. Set it when the field mounts.
- Tab moves focus between fields only once the app adds Bevy's
  `TabNavigationPlugin`. See [Focus](../events/focus.md#tab-navigation).

See [`<editableText>`](../reference/elements.md#editableText) in the element
reference.
