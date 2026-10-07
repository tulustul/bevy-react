# Cursors

The `cursor` style sets the mouse cursor while the pointer is over a node,
like CSS `cursor`. It takes a system cursor keyword, or the name of a custom
image cursor your app registered on the Rust side.

## Usage

```tsx
<button style={{ cursor: "pointer" }} onClick={save}>
  <text>Save</text>
</button>
```

## Which node sets the cursor

- The topmost node under the pointer that has a `cursor` style decides.
  Nodes without one are transparent to this: a child inherits its nearest
  cursor-bearing ancestor, and an overlay without a `cursor` shows the
  cursor of whatever is beneath it.
- `focusPolicy` and event handlers play no part; any node can set a cursor.
- With no cursor-bearing node under the pointer, the window shows the
  `"default"` cursor.
- State styles work: `cursor: "grab"` in `style` with `cursor: "grabbing"`
  in `pressStyle` switches on press.
- It also works over in-world UI in a [`<surface>`](../elements/surface.md)
  and over nodes with a [`transform3d`](3d-transforms.md), where it follows
  what is drawn.

To stop cursors under a modal or a panel from showing through, give the
overlay its own `cursor: "default"`.

## System cursors

| Keyword                                                    | Cursor                        |
| ---------------------------------------------------------- | ----------------------------- |
| `"default"` (also `"auto"`)                                | The platform arrow            |
| `"pointer"`                                                | A hand, for links and buttons |
| `"text"`, `"verticalText"`                                 | Text selection                |
| `"wait"`, `"progress"`                                     | Busy, busy but interactive    |
| `"help"`, `"contextMenu"`                                  | Help, context menu available  |
| `"crosshair"`, `"cell"`                                    | Precise selection             |
| `"move"`, `"allScroll"`                                    | Move, scroll in any direction |
| `"grab"`, `"grabbing"`                                     | Draggable, dragging           |
| `"copy"`, `"alias"`, `"noDrop"`, `"notAllowed"`            | Drag and drop feedback        |
| `"zoomIn"`, `"zoomOut"`                                    | Zoom                          |
| `"colResize"`, `"rowResize"`                               | Column and row resizing       |
| `"nResize"`, `"eResize"`, `"sResize"`, `"wResize"`         | Edge resizing                 |
| `"neResize"`, `"nwResize"`, `"seResize"`, `"swResize"`     | Corner resizing               |
| `"ewResize"`, `"nsResize"`, `"neswResize"`, `"nwseResize"` | Two-way resizing              |

- The CSS kebab-case spellings work too (`"not-allowed"`, `"col-resize"`).
- Names are case-sensitive.
- What each cursor looks like depends on the platform.
- A name that is neither a keyword nor a registered custom cursor shows the
  default arrow and reports a `cursor` warning in
  [devtools](../tooling/devtools.md).

## Custom cursors

Register an image under a name on the `ReactUiPlugin`, then select it by
name like a keyword:

```tsx
<node style={{ cursor: "hand" }} />
```

```rust
use bevy::prelude::*;
use bevy_react::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(ReactPlugins.set(
            // name, image path in the assets folder, hotspot pixel
            ReactUiPlugin::default().cursor("hand", "cursors/hand.png", (6, 0)),
        ))
        .run();
}
```

- The image is loaded through the `AssetServer`, relative to the asset
  folder, at startup. The hotspot is the click point, in image pixels from
  the top-left corner.
- A registered name wins over a keyword: registering `"pointer"` replaces
  the system pointer for every node that uses it, and registering
  `"default"` replaces the arrow app-wide, including where no node sets a
  cursor.
- Custom cursors need the `custom_cursor` cargo feature, which is on by
  default (it pulls in `bevy_winit`). Without it `.cursor(..)` doesn't
  exist, keywords still work, and a custom name reports a `cursor` warning.

## Limits

- The cursor is set on the primary window only.
- bevy-react owns that window's cursor: a cursor your own systems set on the
  window is replaced on the next frame. Register it as a custom cursor and
  select it from React instead.

See [`cursor`](../reference/style-properties.md#cursor) in the style
reference.
