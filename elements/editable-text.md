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

- A field takes focus when clicked, when it mounts with `autofocus`, or when
  your Rust code sets Bevy's `InputFocus` to it. Clicking elsewhere does not
  blur it: focus moves only to another focusable element or when Rust
  clears `InputFocus`.
- `focusStyle` applies while the field is focused, with no React state.
  `hoverStyle` and `pressStyle` work as on a `<node>`.
- Don't rely on the order of one field's `onBlur` and the next field's
  `onFocus`. When tracking the focused field, clear it on blur only if it
  still names the field losing focus:
  `onBlur={() => setFocused((f) => (f === "first" ? null : f))}`.
- Editing keys are Bevy's: arrows, Home and End, word moves and deletes with
  Ctrl (Alt on macOS), Ctrl+A, Ctrl+C, Ctrl+X and Ctrl+V with the system
  clipboard (Cmd on macOS), and Escape to collapse the selection.
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
- Assistive tech sees a text input (a multi-line one with `multiline`),
  named by `ariaLabel`, with the current text as its value.

## Limits

- Plain text with one style for the whole field.
- No placeholder, read-only, disabled or password mode, no undo or redo, and
  no submit event.
- Rejecting an edit in `onChange` doesn't revert the field: if the state
  stays at the previous `value`, the prop doesn't change and the field keeps
  the user's text.
- The same applies to a selection: setting the pair it already holds does
  nothing, even after the user moved the caret, unless you mirror `onSelect`
  as shown above.
- Changing `multiline` after mount switches Enter-to-newline but not
  wrapping. Set it when the field mounts.
- Tab doesn't move focus between fields by default. Each field carries a
  `TabIndex(0)`, but Tab navigation needs Bevy's `TabNavigationPlugin` and a
  `TabGroup` on an ancestor, which bevy-react does not add.

See [`<editableText>`](../reference/elements.md#editableText) in the element
reference.
