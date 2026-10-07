# Named nodes

The `name` prop puts a Bevy `Name` on the entity a React element creates, so
Rust systems can find React-created UI and work with it directly: read its
layout or hover state, add their own components, or spawn 3D things that
follow it. Nothing but the name crosses from React; there are no messages and
no entity ids to pass around.

## Usage

```tsx
<node name="minimap" style={{ width: 200, height: 200 }} />
```

```rust
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};
use bevy_react::{ReactApplySet, ReactNodes};

fn track_minimap(
    nodes: ReactNodes,
    layout: Query<(&ComputedNode, &UiGlobalTransform)>,
) {
    let Some(minimap) = nodes.get("minimap") else { return };
    let Ok((node, transform)) = layout.get(minimap) else { return };
    // node.size() and transform.translation are in physical pixels
}

app.add_systems(Update, track_minimap.after(ReactApplySet));
```

## The name prop

Every element accepts `name`, a string.

- It lands on the entity as a Bevy `Name` and in the `ReactNodes` index.
- It is dynamic: changing it renames the entity; `""` or removing the prop
  removes the `Name`.
- Names are not unique. A list can give every item the same name, and Bevy
  reads them as a group.

## Finding nodes

### `ReactNodes`

`ReactNodes` is a read-only system param that looks entities up by name:

| Method           | Returns                                                  |
| ---------------- | -------------------------------------------------------- |
| `get(name)`      | `Option<Entity>`: the first mounted entity with the name |
| `all(name)`      | `&[Entity]`: every entity with the name, in mount order  |
| `contains(name)` | `bool`: whether any mounted entity has the name          |
| `iter()`         | every `(name, &[Entity])` group, in no particular order  |

When several entities share a name, `get` returns the first mounted one and
reports a `nameAmbiguous` warning (in the Bevy log and in
[devtools](../tooling/devtools.md)). Use `all` for groups. This system reads
each card's hover state; a node has an `Interaction` when it declares a
pointer handler, `onClick`, `hoverStyle` or `pressStyle`:

```rust
fn glow_hovered_cards(
    nodes: ReactNodes,
    cards: Query<&Interaction>,
) {
    for &card in nodes.all("card") {
        if let Ok(Interaction::Hovered) = cards.get(card) {
            // …
        }
    }
}
```

### Queries

Every entity the React renderer creates (nodes, text, SVG shapes, portals,
surfaces, roots) carries the `ReactNode` marker component. Filter with it, so
the query skips the other named entities in your app, such as glTF nodes:

```rust
fn on_mount(added: Query<(Entity, &Name), Added<ReactNode>>) {
    for (entity, name) in &added {
        info!("mounted {name} as {entity}");
    }
}
```

`Added<ReactNode>` and `RemovedComponents<ReactNode>` are the mount and
unmount signals. `ReactNode` holds the node's renderer id.

## Ordering

React's changes are applied to the world in `ReactApplySet`, in `Update`;
that is where entities spawn and despawn and where `Name` and the
`ReactNodes` index change. Order your systems `.after(ReactApplySet)` to see
the current frame's mounts, or they run a frame behind.

Layout is computed later, in `PostUpdate`. For the current frame's
`ComputedNode` and `UiGlobalTransform`, run in `PostUpdate` after
`UiSystems::Layout`; to move 3D entities with the node in the same frame,
also run before `TransformSystems::Propagate`, as the
[demo scene](../../../examples/demos/scenes/named_pins.rs) does.

An `Entity` is only valid while its React node is mounted. React despawns it
on unmount without telling anyone who kept the handle, and a full hot reload
rebuilds the whole tree. Look nodes up again each frame, or watch
`RemovedComponents<ReactNode>`.

## What you may change

The renderer re-applies the components it owns whenever React updates the
node, so your writes to them are overwritten, sometimes only much later (only
what a change touches is re-applied). Read them freely; don't write them:

- `Node`, `BackgroundColor`, `BorderColor`, `Outline`, `BoxShadow`,
  `ZIndex`, `GlobalZIndex`, `LayoutConfig`, `Visibility`, `UiTransform`,
  `ImageNode`
- `Text`, `TextSpan`, `TextFont`, `TextColor`, `TextLayout`
- `ScrollPosition`, `Interaction`, `FocusPolicy`, `Pickable`
- `Name`, `Children`, `ChildOf`

Every other component is yours: your own components and markers,
`MaterialNode<M>`, `TabIndex`, audio. In particular, don't insert a `Name` on
a React node yourself: the index doesn't see it, and the next `name` change
overwrites it.

## Children you spawn

Entities you parent under a React node are despawned with it. But whenever
React changes that node's children (a child mounts, unmounts or moves), the
node's child list is rebuilt from the React tree and your children lose their
parent; an orphaned UI `Node` then renders as a top-level UI root. Only parent
your entities under nodes whose React children never change, or keep them
separate and follow the node's layout instead.

## Limits

- The index is read-only, and a name can't select a single node out of a
  group.
- Entity handles go stale when React unmounts the node.
- The bridge-owned components above can't be driven from Rust; drive those
  from React (or with [animated values](../animations/animated-values.md)).

See [Identity](../reference/elements.md#identity) in the element reference.
