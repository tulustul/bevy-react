---
description: Register your own JSX elements from Rust with add_react_element - attributes, writers, a spawn hook, element events and animated attributes.
demo: Custom elements
---

# Custom elements

An app can register its own JSX elements in Rust. The API is the one every
built-in element uses: `<svg>`, `<canvas>`, `<portal>`, `<surface>` and
`<anchor>` are each a crate registering one. An element declares its
attributes (its own props), the writers that turn them into components, its
events and a spawn hook. React then mounts, updates and unmounts entities of
that kind like any other. An element doesn't have to be UI: the demos'
`<cube>` is a 3D mesh in the world.

## Usage

Declare the attribute and the element as `static`s, register the element,
and render it from React:

```tsx
<node>
  {cubes.map((c) => (
    <cube key={c.id} x={c.x} size={0.4} />
  ))}
</node>
```

```rust
use bevy::prelude::*;
use bevy_react::element::{Attribute, Common, Element};
use bevy_react::ext::ElementFlags;
use bevy_react::style::{Writer, owns};
use bevy_react::{ReactAppExt, ReactApplySet};

#[derive(Component)]
struct Cube;

static X: Attribute<f32> = Attribute::new("x");
static SIZE: Attribute<f32> = Attribute::new("size");

static CUBE: Element = Element {
    // No `Node`, and never parented under its React parent.
    flags: ElementFlags { detached: true, ..ElementFlags::NODE_LESS },
    attrs: &[&X, &SIZE],
    common: Common::IDENTITY,
    writers: &[&CUBE_WRITER],
    spawn: Some(|ctx| ctx.spawn((Cube, Transform::default()))),
    ..Element::new("cube")
};

// Attributes → components. Runs when `x` or `size` changes.
static CUBE_WRITER: Writer = Writer {
    reads: &[],
    attrs: &[&X, &SIZE],
    writes: &[owns::<Transform>],
    apply: |ctx, _style, ec| {
        let x = ctx.attr(&X).copied().unwrap_or(0.0);
        let size = ctx.attr(&SIZE).copied().unwrap_or(1.0);
        ec.insert(
            Transform::from_xyz(x, 0.0, 0.0)
                .with_scale(Vec3::splat(size)),
        );
    },
};

pub struct CubePlugin;

impl Plugin for CubePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_systems(Update, add_meshes.after(ReactApplySet));
    }
}

/// Also called from the `--export-bindings` path.
pub fn register_bindings(app: &mut App) {
    app.add_react_element(&CUBE);
}

fn add_meshes(
    mut commands: Commands,
    cubes: Query<Entity, Added<Cube>>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    for entity in &cubes {
        commands.entity(entity).insert((
            Mesh3d(meshes.add(Cuboid::from_length(1.0))),
            MeshMaterial3d(materials.add(StandardMaterial::default())),
        ));
    }
}
```

Then regenerate `bevy.ts` (see [Typing](#typing)) so `<cube>` type-checks.
The complete element, with animated attributes and pointer events, is
[`examples/demos/cube`](../../../examples/demos/cube/mod.rs).

## The element

`Element` is a plain struct. Start from `Element::new("name")` (a plain
styled node with every common prop) and override fields with struct-update
syntax:

| Field           | Meaning                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| `name`          | The JSX intrinsic name                                                      |
| `flags`         | What the entity is (see [Flags](#flags)); default `ElementFlags::NODE`      |
| `attrs`         | The element's attributes, at most 64                                        |
| `required`      | Attributes the generated typing marks required (must be listed in `attrs`)  |
| `common`        | Which shared prop groups apply (see below); default `Common::ALL`           |
| `writers`       | The element's own writers, in apply order                                   |
| `suppress`      | Global style writers this element opts out of                               |
| `events`        | The element's own events                                                    |
| `default_style` | `fn() -> Style`: the style the user's `style` overlays                      |
| `spawn`         | The spawn hook; `None` spawns the entity with nothing extra                 |
| `ts_ref`        | The TypeScript type a `ref` resolves to (only for runtime-provided handles) |

The props every element shares are not attributes. `common` picks the groups
that apply; a shared prop outside them is ignored with a `propIgnored`
warning:

| Group              | Props                                               |
| ------------------ | --------------------------------------------------- |
| `Common::IDENTITY` | `name`, `sharedTag`                                 |
| `Common::VARIANTS` | `hoverStyle`, `pressStyle`, `focusStyle`            |
| `Common::POINTER`  | `onClick`, `onPointerEnter`, `onPointerLeave`, …    |
| `Common::SCROLL`   | `onScroll`, `scrollTop`, `scrollLeft`, `scrollStep` |
| `Common::WHEEL`    | `onWheel`                                           |

Combine groups with `.with(..)`. `default_style` builds a `Style` with
`Style::set` and the core property statics in `bevy_react::style::props`
(the built-in `<button>` sets `FOCUS_POLICY` to block). Unsetting a property
in JSX falls back to the default style's value.

## Attributes

An attribute is a `static Attribute<T>`. The static is the declaration and
also the typed key you read the value with: `ctx.attr(&SIZE)` in a writer,
`ctx.props.attrs.get(&SIZE)` in the spawn hook. Declare attributes `static`,
never `const`: they are identified by address.

- `Attribute::new(name)` decodes through `T`'s serde `Deserialize` and types
  the prop as `T`'s ts-rs type, so `T` derives both (`serde` and `ts-rs` 10,
  the version bevy-react uses). `Attribute::with_codec(name, codec)` takes
  the same codecs as a style property (see
  [codecs](custom-styles.md#codecs)).
- Attributes are per element. Two elements may declare the same name with
  different types, or share one static. A prop the element doesn't declare is
  dropped with an `unknownProp` warning.
- Names reserved for shared props, `children`, `key`, `ref`, and anything
  shaped like a handler (`on` followed by an uppercase letter) can't be
  attributes; registering one panics.
- Updates are deltas: a writer runs when an attribute it reads changes, and
  sees the merged value. A removed prop reads as `None`.
- `event: true` makes an **act-now** attribute: a command, not state. It is
  never retained, a writer sees it only on the update that carries it
  (`ctx.event(&ATTR)`), and removing it from JSX does nothing. `<canvas>`'s
  `draw` is one.
- `invalidate: Invalidation::PAINT` marks a change as repainting the node, so
  an enclosing cached [layer](../styling/layers.md) re-captures. Set it on
  any attribute that changes what a UI element paints.
- `typed: false` keeps a wire-only attribute out of the generated JSX types.

A value that fails to deserialize fails the whole commit: the React commit
throws a `TypeError` and Bevy never receives its ops. The generated types
are the guard; for lenient decoding, write a custom codec that reports the
value and returns `Ok(None)`.

## Spawn hook and writers

The **spawn hook** creates the entity with the components it is born with.
Always spawn through `ctx.spawn(bundle)`: it adds the bridge identity and,
for an element with a box, the style components in one bundle. `SpawnCtx`
also carries `commands`, `images`, `assets`, the create op's `props`, the
effective `style`, `kind` and `id`; `ctx.blank_image()` makes a placeholder
texture for an element that paints its own image.

**Writers** do everything prop-derived. A `Writer` declares what it reads
and what it writes:

- `reads` lists style properties and `attrs` lists attributes. A change to
  any of them re-runs the writer. On a freshly spawned entity
  (`ctx.fresh`), it runs only if one of them is set.
- `apply` gets the full merged values, never a delta: an absent value means
  remove or reset.
- `writes` lists the components it owns (`owns::<C>`). Two writers of one
  element writing the same component panics at registration. An element
  writer that writes a component a global style writer also writes takes
  over that component on this element; `suppress` opts out of a global
  writer explicitly, and a style property only suppressed writers read is
  ignored with a `styleIgnored` warning.
- Compare before you write (queue an entity command that inserts only on a
  real change) when your systems react to `Changed<C>`.

There is no separate update function: creates and updates both go through
the writers. React's own mount, update and unmount of the element are the
only lifecycle; unmounting despawns the entity and its Bevy children.

## Flags

`ElementFlags` tells the core's shared systems what the entity is:

| Constant        | Entity                                                                               |
| --------------- | ------------------------------------------------------------------------------------ |
| `NODE`          | A styled UI node (the default)                                                       |
| `OWNS_IMAGE`    | A styled node whose `ImageNode` the element owns (`backgroundImage` leaves it alone) |
| `NODE_LESS`     | No `Node`: no `style`, no layout box, never a composited layer                       |
| `DETACHED_ROOT` | A styled node that becomes its own UI root, like `<root>` and `<surface>`            |

`detached: true` means the core never attaches the entity in the Bevy
hierarchy: it records the React parent, so unmounting an ancestor still
despawns it, and leaves the Bevy parent to you. A non-UI entity such as a
mesh needs it, since a UI node is no transform parent for a mesh.
`pick_ignore: true` makes the entity itself never a picking target.

## Element events

An element can send its own events to React. Declare a
`static ElementEvent<T>`, list it in `events`, and send it with the
`ElementEvents` system param. The handler prop is `on` plus the capitalized
name, and its argument is the payload:

```tsx
<cube onLanded={({ speed }) => setLastSpeed(speed)} />
```

```rust
use bevy_react::element::{ElementEvent, ElementEvents};

#[derive(serde::Serialize, ts_rs::TS)]
struct Landed {
    speed: f32,
}

static LANDED: ElementEvent<Landed> = ElementEvent::new("landed");
// In the element: `events: &[&LANDED],`

fn report_landings(events: ElementEvents, cubes: Query<(Entity, &Fall)>) {
    for (entity, fall) in &cubes {
        if fall.just_landed {
            events.send(entity, &LANDED, &Landed { speed: fall.speed });
        }
    }
}
```

- `send` delivers only to nodes that have a handler, and returns whether it
  sent. `ElementEvent::new(..).unconditional()` sends regardless, for an
  event a runtime helper consumes itself.
- A `()` payload makes a handler with no argument.
- An event name whose handler prop collides with a shared prop (`onClick`)
  panics at registration.

## Animated attributes

An attribute can accept an inline `{ animated }` binding to a shared value,
driven every frame on the Bevy side without re-rendering React. Give it an
`Animatable<T>` value and an `AttrBinding` naming a domain:

```tsx
function PulsingCube() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1), { reverse: true });
  }, [t]);
  return (
    <cube
      size={{ animated: interpolate(t, [0, 1], [0.6, 1.2]), seed: 0.6 }}
      color={{
        animated: interpolateColor(t, [0, 1], ["#7aa2f7", "#f7768e"]),
      }}
    />
  );
}
```

```rust
use bevy_react::animations::AnimationSet;
use bevy_react::element::{AttrBinding, animatable_binding};
use bevy_react::ext::DrivenExtValues;
use bevy_react::protocol::animatable::Animatable;
use bevy_react::style::Codec;

static SIZE: Attribute<Animatable<f32>> = Attribute {
    animated: Some(AttrBinding {
        domain: "cube",
        binding: animatable_binding::<f32>,
    }),
    ..Attribute::with_codec("size", Codec::serde_as("Animatable<number>"))
};

// Ordered `.after(AnimationSet::Apply)`.
fn drive_sizes(
    mut cubes: Query<
        (&DrivenExtValues, &mut Transform),
        Changed<DrivenExtValues>,
    >,
) {
    for (driven, mut transform) in &mut cubes {
        if let Some(size) = driven.get("cube", "size") {
            transform.scale = Vec3::splat(size);
        }
    }
}
```

- The engine evaluates each binding and publishes the result into the
  entity's `DrivenExtValues` under `(domain, attribute name)`, only when the
  value changes. Read it after `AnimationSet::Apply` to apply it the same
  frame: `get` returns a number, `get_color` an `Srgba` (from an
  `interpolateColor` binding), `value` either.
- The binding picks the kind, so an attribute of any type can animate.
  Checking that the kind fits the attribute is your system's job; the demo
  cube reports a mismatch as a `styleBinding` warning.
- While bound, `Animatable::value()` is `None` and `seed()` is the wrapper's
  `seed`: use it until the first value is published. A binding to a missing
  shared value publishes nothing.
- Attribute changes don't ease on their own: there is no `transition` for
  attributes unless your element implements one.

## Pointer events

A styled element takes the pointer handlers like `<node>`. A node-less
element needs help from your code:

- `onClick` fires for any picking hit on the entity, so bring a picking
  backend that sees it (Bevy's `MeshPickingPlugin` for a mesh).
- `onPointerEnter` and `onPointerLeave` follow the entity's `Interaction`.
  The core inserts one on a node-less element while it has pointer handlers,
  but `bevy_ui` only updates it for UI nodes: drive it yourself in a system
  in `InteractionSyncSet`, as the demo cube does from the hover map.
- The drag handlers (`onPointerDown`, `onPointerMove`, `onPointerUp`) are
  only delivered to UI nodes; a node-less element never receives them.

## System ordering

Order your element's systems by the public sets, never by core function
names:

| Set                   | Schedule     | Use it to                                                        |
| --------------------- | ------------ | ---------------------------------------------------------------- |
| `ReactApplySet`       | `Update`     | Run `.after` it to see this frame's mounts and attribute changes |
| `AnimationSet::Apply` | `Update`     | Run `.after` it to read this frame's `DrivenExtValues`           |
| `InteractionSyncSet`  | `Update`     | Write `Interaction` for entities `bevy_ui` doesn't track         |
| `ElementOverrideSet`  | `Update`     | Override this frame's animated and eased values                  |
| `ElementRasterSet`    | `Update`     | Repaint an element-owned texture from this frame's final state   |
| `PickRefineSet`       | `PreUpdate`  | Refine a node's picking hit into a sub-element hit               |
| `MeasureStampSet`     | `PostUpdate` | Re-stamp an intrinsic `ContentSize` measure before layout        |

The sets other than `ReactApplySet` (crate root) and `AnimationSet`
(`bevy_react::animations`) live in `bevy_react::ext`.

## Typing

The TypeScript exporter generates a props interface per registered element
(`<cube>` gets `BevyCubeProps`): the shared prop groups, `style` for an
element with a box, the typed attributes, the event handlers, and
`children`. Your `bevy.ts` adds them to JSX by augmenting the package's
`BevyIntrinsicElements` interface. Type names in a codec's TS literal that no
ts-rs type declares are imported from the `bevy-react` package, so use its
exported types there (`Animatable<number>`, `Color`).

Register the element on both paths: in the running app and in the
`--export-bindings` exporter. A shared `register_bindings(app)` function
called from both keeps them in step. Then regenerate `bevy.ts`. See
[TypeScript codegen](../tooling/ts-codegen.md).

A kind no plugin registered mounts as a plain `<node>` so its children still
attach, and its props are dropped. Only the kinds of bevy-react's own
optional features (`svg`, `canvas`, `portal`, …) report a `featureMissing`
warning; an unregistered app element mounts silently. A current `bevy.ts`
catches the mistake at type-check time.

## Beyond UI

A node-less, detached element is how bevy-react drives entities that aren't
UI at all — meshes, lights, audio emitters. Such an element gets the
React-facing half of the system:

- Mounting, updating and unmounting with React, keyed lists included. It
  despawns when its React ancestor unmounts.
- Attributes decoded from props, with writers re-run only for what changed.
- `{ animated }` attributes, driven every frame in Bevy (see
  [Animated attributes](#animated-attributes)).
- Element events with typed payloads.
- `name` for lookups from your systems, when the element takes the
  identity props (see [Named nodes](../communication/named-nodes.md)).
- `onClick` through any picking backend that hits the entity, and
  `onPointerEnter`/`onPointerLeave` once you drive its `Interaction` (see
  [Pointer events](#pointer-events)).
- Generated JSX typing.

Everything built on `bevy_ui` stays with UI nodes:

- No `style`, so no layout, no hover, press or focus styles, no
  [style transitions](../animations/style-transitions.md), and no
  transforms, opacity, filters or [layers](../styling/layers.md). The entity
  is positioned and shaped by its attributes and your systems.
- No picking by default: add a backend (`MeshPickingPlugin` for meshes) and
  sync `Interaction` yourself.
- No drag events (`onPointerDown`/`Move`/`Up`).
- No [shared elements](../animations/shared-elements.md): those need a
  `transition` style.
- No easing of static attribute changes. Use `{ animated }` bindings, or
  build a channel on the core's `transition::Channel` (the `<svg>` shapes'
  `transition` prop is made that way).
- The Bevy parent is yours to choose; the core never attaches a detached
  entity in the hierarchy.

## Limits

- At most 64 attributes, 64 writers and 64 events per element.
- Registering the same name twice with a different declaration panics.
- Attributes take static values or `{ animated }` bindings only; they have
  no hover, press or focus variants (those are style).
- No per-frame callback: React re-renders or a binding drive changes.
  Continuous behavior belongs in your own systems.
- A node-less element has no `style`, layout box or composited layer.

See the [element reference](../reference/elements.md) for the built-in
elements, which are declared the same way.
