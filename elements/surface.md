# `<surface>`

`<surface>` renders a React subtree into an offscreen texture instead of onto
the screen. Your Bevy app puts that texture on any material: an in-world
monitor, a control panel, a hologram with your own shader on top. It is the
inverse of [`<portal>`](portal.md), which shows a camera's texture inside the
UI. Tag the mesh that displays the texture with `SurfacePointer` and the UI
on it is clickable in 3D.

## Usage

```tsx
function Monitor() {
  const [count, setCount] = useState(0);
  return (
    <surface target="monitor" style={{ backgroundColor: "#1a1b26" }}>
      <button onClick={() => setCount((n) => n + 1)}>
        <text>{`Clicked ${count} times`}</text>
      </button>
    </surface>
  );
}
```

```rust
use bevy::prelude::*;
use bevy_react::surface::{SurfacePointer, SurfaceSpec, Surfaces};

fn setup(
    mut commands: Commands,
    mut surfaces: ResMut<Surfaces>,
    mut images: ResMut<Assets<Image>>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    let screen = surfaces.create(
        &mut images,
        "monitor",
        SurfaceSpec {
            size: UVec2::new(800, 600),
            ..default()
        },
    );
    commands.spawn((
        Mesh3d(meshes.add(Rectangle::new(4.0, 3.0))),
        MeshMaterial3d(materials.add(StandardMaterial {
            base_color_texture: Some(screen),
            unlit: true,
            ..default()
        })),
        SurfacePointer::new("monitor"),
    ));
}
```

`<surface>` comes from the `surface` cargo feature, which is on by default
and adds `SurfacePlugin` to `ReactPlugins`. Without it, a `<surface>` mounts
as a plain node and reports a `featureMissing` warning (see
[Cargo features](../getting-started.md#cargo-features)).

## Surfaces

`Surfaces::create(&mut images, name, spec)` allocates a texture, registers it
under `name` and returns its `Handle<Image>` for your materials. bevy-react
spawns a UI camera for each surface that renders the matching `<surface>`
subtree into the texture, before the main camera draws, so the texture is
never a frame behind. Creating an existing name again replaces the surface.

`SurfaceSpec` configures it:

| Field          | Default            | Meaning                                                 |
| -------------- | ------------------ | ------------------------------------------------------- |
| `size`         | 512 × 512          | Texture size in pixels, at most 4096 per side           |
| `clear_color`  | `Color::BLACK`     | Fills the texture under the UI; transparent for a decal |
| `mode`         | `RenderMode::Live` | When the UI renders (see "Render modes")                |
| `scale_factor` | `1.0`              | Texture pixels per UI pixel, like a window's DPI scale  |

`get(name)` returns the texture handle, and `invalidate`, `set_mode` and
`remove` work as on render targets. `remove(name)` despawns the surface's
camera and hides its `<surface>` subtrees until the name is created again.

On the React side, `target` names the surface. A `<surface>` whose name isn't
registered yet renders nothing, and appears as soon as the app creates it.
Changing `target` moves the subtree to another surface.

## Layout

- The subtree lays out in `size / scale_factor` logical pixels, whatever the
  window's scale factor. At the default `1.0` one logical pixel is one
  texture pixel; at `2.0` an 800 × 600 texture holds a 400 × 300 layout whose
  text and shapes rasterize at twice the resolution, the way a HiDPI window
  does. Raise it for a mesh that fills much of the screen.
- The `<surface>` element fills the texture by default (`width: "100vw"`,
  `height: "100vh"`; inside a surface the viewport is its texture). Its
  `style` overrides that and styles the root like a node.
- The `<surface>` takes no space where you write it in the React tree. Put it
  anywhere, for example beside the screen UI that controls it; unmounting it
  or an ancestor removes it.
- It is a UI root of its own, like [`<root>`](root.md). Layout, `overflow`
  clipping, `layoutRounding` and shared-element pairing don't cross its
  boundary.
- The `<surface>` element itself takes only `target`, `style`, `name` and
  `key`: no pointer handlers or hover styles. Put those on its children.

## Clicking in the world

`SurfacePointer::new(name)` on the entity with the mesh makes the UI on it
interactive. bevy-react casts a ray from the active window camera through the
cursor, finds the nearest `SurfacePointer` mesh, reads the texture coordinate
at the hit, and moves a virtual pointer to that pixel of the surface.

- Children get `onClick`, the `onPointer*` handlers, `hoverStyle` and
  `pressStyle`, and the `cursor` style sets the OS cursor, as on screen. The
  same rules apply, [`focusPolicy`](../styling/focus-policy.md) included: a
  `<button>` un-hovers the card around it.
- A drag ends when the cursor leaves the mesh: the element gets
  `onPointerUp` at the last position on the surface.
- A click focuses an `<editableText>` or an element with a `tabIndex` as on
  screen, and typing goes to it. With
  [Tab navigation](../events/focus.md#tab-navigation) a surface is its own
  scope: Tab never enters it from the screen, and cycles among its own
  elements once the focus is inside.
- The wheel scrolls the scroll container under the pointer and fires
  `onWheel`; screen UI under the cursor takes it first.
- The mesh needs UVs, with `(0, 0)` at the texture's top-left. If your
  material maps the surface to the second UV set (`base_color_channel:
UvChannel::Uv1`), match it with
  `SurfacePointer::new(name).with_uv_channel(UvChannel::Uv1)` so clicks land
  on the right pixel.
- Several meshes can display and pick the same surface.
- Only `SurfacePointer` meshes are ray-cast: another mesh in front of the
  screen doesn't block clicks.
- Screen UI covers the world: while the cursor is on an interactive on-screen
  element (a button, a node with pointer handlers), the surface behind it
  gets no hover or clicks. A press that started on the surface keeps it
  through the drag.

### Pointing without the cursor

An app that locks or hides the cursor (a first- or third-person camera, a
gamepad reticle) points with its own ray. Write it to the `SurfacePointerRay`
resource every frame: the mouse buttons and the wheel then act where that ray
lands. `Ray(None)` points at nothing, and `SurfacePointerRay::Cursor` (the
default) goes back to the window cursor.

The pointer is driven in `PreUpdate`. A system that writes the ray there,
after bevy's `InputSystems` and before `SurfacePointerSet`, has it act in the
same frame; written later (in `Update`, say) it acts one frame late, and a
cursor you draw yourself is then a frame ahead of the hover and the clicks.

```rust
use bevy::input::InputSystems;
use bevy_react::surface::{SurfacePointerRay, SurfacePointerSet};

app.add_systems(
    PreUpdate,
    aim_pointer.after(InputSystems).before(SurfacePointerSet),
);

/// The screen center is the pointer.
fn aim_pointer(
    camera: Single<&GlobalTransform, With<Camera3d>>,
    mut pointer: ResMut<SurfacePointerRay>,
) {
    let ray = Ray3d::new(camera.translation(), camera.forward());
    *pointer = SurfacePointerRay::Ray(Some(ray));
}
```

Screen UI doesn't cover a ray of your own. The
[Coldwake example](https://github.com/tulustul/bevy-react/tree/main/examples/coldwake)
points this way: it keeps its own cursor on the hologram the camera is
locked on and casts the ray through it.

## Render modes

- `RenderMode::Live` (the default): the UI renders every frame while at
  least one `SurfacePointer` mesh naming the surface is visible to a camera.
  When every tagged mesh is culled, it renders nothing. A surface with no
  tagged mesh renders every frame, since bevy-react can't tell which
  materials use it, so tag every mesh that shows a surface.
- `RenderMode::Snapshot`: the UI renders once when the surface is created,
  when you call `invalidate(name)` and when its mode changes, then the
  texture keeps that frame. Call `invalidate` after the UI changes; good for
  static panels.

## Limits

- Pointer hits inside a surface ignore `transform3d`: they land where the
  node would be without its transform. See [Layers](../styling/layers.md).
- A `backdropFilter` inside a surface filters the surface's clear color, the
  only thing behind its UI.
- A live surface without a tagged mesh renders every frame, visible or not.
- Textures are capped at 4096 pixels per side.

![A 3D monitor model whose screen is a live React "OS" — a menu bar, a CRT-effect toggle, a status line and a taskbar — rendered into an offscreen texture and clickable in 3D.](https://tulustul.github.io/bevy-react/screenshots/monitor-screen.png)

See [`<surface>`](../reference/elements.md#surface) in the element reference.
