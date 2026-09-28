//! `<cube>` — an app-authored custom element: one JSX element is one 3D mesh
//! entity in the world, registered through the same public API the
//! `bevy_react_*` feature crates use (`add_react_element`). The "Custom
//! elements" demo mounts up to a thousand of them.
//!
//! - **Node-less + detached.** A cube has no `Node` (no style, no layout
//!   box) and is never parented under its React parent in the Bevy
//!   hierarchy — a UI node has no `GlobalTransform` for a mesh to inherit.
//!   The React parent only scopes its lifetime: unmounting the parent
//!   despawns the cube.
//! - **Attributes** (`size`, `x`/`y`/`z`, `rotateY`, `color`) all accept an
//!   inline `{ animated }` wrapper: the animation engine publishes each
//!   bound value (a number, or a color for an `interpolateColor`) into the
//!   entity's [`DrivenExtValues`] under the `"cube"` domain.
//! - **One writer, one consumer.** [`CUBE_WRITER`] folds the merged
//!   attributes into [`CubeAttrs`] (compare-before-write); the
//!   [`apply_cube_attrs`] system turns `CubeAttrs` + this frame's driven
//!   values into the `Transform` and the material color.
//! - **Pointer events.** `onClick` rides the core's click path (a
//!   `Pointer<Click>` on any bridge entity); `onPointerEnter`/`Leave` need
//!   an `Interaction`, which `ui_focus_system` never writes for a mesh — so
//!   [`sync_cube_interactions`] derives it from the hover map, the svg
//!   shapes' pattern. Mesh picking runs with `require_markers`, so only
//!   handler-bearing cubes (which get a `Pickable`) are ray-cast.

use bevy::picking::Pickable;
use bevy::picking::hover::HoverMap;
use bevy::picking::mesh_picking::{MeshPickingPlugin, MeshPickingSettings};
use bevy::picking::pointer::{PointerId, PointerPress};
use bevy::prelude::*;
use bevy_react_core::animations::protocol::Binding;
use bevy_react_core::animations::{AnimatedNode, AnimationSet};
use bevy_react_core::element::{
    AttrBinding, Attribute, Attrs, Common, Element, SpawnCtx, animatable_binding,
};
use bevy_react_core::ext::{DrivenExtValues, ElementFlags, InteractionSyncSet};
use bevy_react_core::protocol::animatable::{Animatable, AnimatableField};
use bevy_react_core::style::{Codec, Writer, owns};
use bevy_react_core::{ReactAppExt, ReactApplySet, ReactNode};

#[cfg(test)]
mod tests;

/// The animation domain every cube attribute's binding publishes under.
const DOMAIN: &str = "cube";

/// Adds the `<cube>` element, mesh picking, and the cube systems.
pub struct CubePlugin;

impl Plugin for CubePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_plugins(MeshPickingPlugin)
            // Only `Pickable` entities (handler-bearing cubes) and cameras
            // marked `MeshPickingCamera` take part — no other scene's meshes.
            .insert_resource(MeshPickingSettings {
                require_markers: true,
                ..default()
            });
        register_systems(app);
    }
}

/// The element alone — what the TypeScript exporter (and a headless op
/// harness) needs.
pub fn register_bindings(app: &mut App) {
    app.add_react_element(&CUBE);
}

/// The per-frame cube systems, ordered by the extension contract's sets.
pub fn register_systems(app: &mut App) {
    app.add_systems(
        Update,
        (
            sync_cube_pickable.after(ReactApplySet),
            apply_cube_attrs
                .after(ReactApplySet)
                .after(AnimationSet::Apply),
            sync_cube_interactions.in_set(InteractionSyncSet),
        ),
    );
}

/// A numeric cube attribute: a number or an `{ animated }` wrapper.
const fn scalar(name: &'static str) -> Attribute<Animatable<f32>> {
    Attribute {
        animated: Some(AttrBinding {
            domain: DOMAIN,
            binding: animatable_binding::<f32>,
        }),
        ..Attribute::with_codec(name, Codec::serde_as("Animatable<number>"))
    }
}

/// Edge length in world units (default `1`).
pub static SIZE: Attribute<Animatable<f32>> = scalar("size");
/// World-space position (default `0`).
pub static X: Attribute<Animatable<f32>> = scalar("x");
pub static Y: Attribute<Animatable<f32>> = scalar("y");
pub static Z: Attribute<Animatable<f32>> = scalar("z");
/// Rotation around the vertical axis, in degrees (default `0`).
pub static ROTATE_Y: Attribute<Animatable<f32>> = scalar("rotateY");
/// Any CSS color (default white), or an `interpolateColor` binding.
pub static COLOR: Attribute<Animatable<String>> = Attribute {
    animated: Some(AttrBinding {
        domain: DOMAIN,
        binding: animatable_binding::<String>,
    }),
    ..Attribute::with_codec("color", Codec::serde_as("Animatable<Color>"))
};

/// `<cube>`: a node-less, detached element whose entity is a mesh.
pub static CUBE: Element = Element {
    flags: ElementFlags {
        detached: true,
        ..ElementFlags::NODE_LESS
    },
    attrs: &[&SIZE, &X, &Y, &Z, &ROTATE_Y, &COLOR],
    common: Common::IDENTITY.with(Common::POINTER),
    writers: &[&CUBE_WRITER],
    spawn: Some(spawn_cube),
    ..Element::new("cube")
};

/// Marks a `<cube>` entity.
#[derive(Component)]
pub struct Cube;

/// One cube field as the attributes give it: the static value (or, while
/// animated, the wrapper's `seed`), and whether a binding drives it.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Field<T> {
    pub value: Option<T>,
    pub animated: bool,
}

impl<T: Copy> Field<T> {
    fn of(attr: Option<&Animatable<T>>) -> Self {
        Self {
            value: attr.static_or_seed(),
            animated: attr.binding().is_some(),
        }
    }
}

/// The cube's merged attributes, colors parsed. Written by [`CUBE_WRITER`]
/// only on a real change, so `Changed<CubeAttrs>` is an honest signal.
#[derive(Component, Clone, Copy, Debug, Default, PartialEq)]
pub struct CubeAttrs {
    pub size: Field<f32>,
    pub x: Field<f32>,
    pub y: Field<f32>,
    pub z: Field<f32>,
    pub rotate_y: Field<f32>,
    pub color: Field<Srgba>,
}

impl CubeAttrs {
    /// Gather the merged attributes. An unparsable color warns (under the
    /// op's node scope) and falls back to magenta, like the core's colors.
    fn assemble(attrs: &Attrs) -> Self {
        let color = attrs.get(&COLOR);
        Self {
            size: Field::of(attrs.get(&SIZE)),
            x: Field::of(attrs.get(&X)),
            y: Field::of(attrs.get(&Y)),
            z: Field::of(attrs.get(&Z)),
            rotate_y: Field::of(attrs.get(&ROTATE_Y)),
            color: Field {
                value: color
                    .and_then(|c| c.value().or_else(|| c.seed()))
                    .map(|s| parse_color(s)),
                animated: color.binding().is_some(),
            },
        }
    }
}

fn parse_color(input: &str) -> Srgba {
    bevy_react_core::raster::parse_css_color(input).unwrap_or_else(|| {
        let msg = format!("unrecognized color {input:?}");
        bevy_react_core::diag::report("color", input, &msg);
        Srgba::new(1.0, 0.0, 1.0, 1.0)
    })
}

/// The shared unit cube every `<cube>` scales.
#[derive(Resource)]
struct CubeMesh(Handle<Mesh>);

impl FromWorld for CubeMesh {
    fn from_world(world: &mut World) -> Self {
        let mut meshes = world.resource_mut::<Assets<Mesh>>();
        Self(meshes.add(Cuboid::from_length(1.0)))
    }
}

/// Spawn the cube with its attributes, then give it the shared mesh and a
/// material of its own (freed with the entity). The spawn context holds no
/// mesh/material assets, so the second step is a queued entity command.
fn spawn_cube(ctx: &mut SpawnCtx) -> Entity {
    let attrs = CubeAttrs::assemble(&ctx.props.attrs);
    let entity = ctx.spawn((Cube, attrs, Transform::default(), Visibility::default()));
    ctx.commands
        .entity(entity)
        .queue(|mut entity: EntityWorldMut| {
            let (mesh, material) = entity.world_scope(|world| {
                let mesh = world.get_resource_or_init::<CubeMesh>().0.clone();
                let material = world
                    .resource_mut::<Assets<StandardMaterial>>()
                    .add(StandardMaterial::default());
                (mesh, material)
            });
            entity.insert((Mesh3d(mesh), MeshMaterial3d(material)));
        });
    entity
}

/// Fold the merged attributes into [`CubeAttrs`]. The spawn already did it
/// for the create, so only updates write — compare-before-write.
pub static CUBE_WRITER: Writer = Writer {
    reads: &[],
    attrs: &[&SIZE, &X, &Y, &Z, &ROTATE_Y, &COLOR],
    writes: &[owns::<CubeAttrs>],
    apply: |ctx, _style, ec| {
        if ctx.fresh {
            return;
        }
        let attrs = CubeAttrs::assemble(ctx.attrs);
        ec.queue(move |mut entity: EntityWorldMut| {
            if entity.get::<CubeAttrs>() != Some(&attrs) {
                entity.insert(attrs);
            }
        });
    },
};

/// Resolve one numeric field: the driven value while bound (falling back
/// to the seed until the engine publishes), else the static value.
fn scalar_value(
    field: Field<f32>,
    driven: Option<&DrivenExtValues>,
    name: &str,
    default: f32,
) -> f32 {
    let driven = field
        .animated
        .then(|| driven.and_then(|d| d.get(DOMAIN, name)))
        .flatten();
    driven.or(field.value).unwrap_or(default)
}

/// Write each changed cube's `Transform` and material color from its
/// attributes and this frame's driven values. Wakes on an attribute change,
/// a fresh publish, or a bindings restamp (which also validates, once).
#[allow(clippy::type_complexity)]
pub fn apply_cube_attrs(
    mut cubes: Query<
        (
            &CubeAttrs,
            Option<&DrivenExtValues>,
            Option<Ref<AnimatedNode>>,
            &mut Transform,
            &MeshMaterial3d<StandardMaterial>,
            Option<&ReactNode>,
        ),
        (
            With<Cube>,
            Or<(
                Changed<CubeAttrs>,
                Changed<DrivenExtValues>,
                Changed<AnimatedNode>,
                Added<MeshMaterial3d<StandardMaterial>>,
            )>,
        ),
    >,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    for (attrs, driven, anim, mut transform, material, rnode) in &mut cubes {
        if let Some(anim) = anim.as_ref().filter(|a| a.is_changed()) {
            let _diag = rnode.map(|r| bevy_react_core::diag::node_scope(r.0));
            validate_bindings(anim);
        }
        let next = Transform {
            translation: Vec3::new(
                scalar_value(attrs.x, driven, "x", 0.0),
                scalar_value(attrs.y, driven, "y", 0.0),
                scalar_value(attrs.z, driven, "z", 0.0),
            ),
            rotation: Quat::from_rotation_y(
                scalar_value(attrs.rotate_y, driven, "rotateY", 0.0).to_radians(),
            ),
            scale: Vec3::splat(scalar_value(attrs.size, driven, "size", 1.0)),
        };
        transform.set_if_neq(next);

        let driven_color = attrs
            .color
            .animated
            .then(|| driven.and_then(|d| d.get_color(DOMAIN, "color")))
            .flatten();
        let color = Color::from(driven_color.or(attrs.color.value).unwrap_or(Srgba::WHITE));
        // Compare first: `get_mut` marks the asset modified (a re-upload).
        if materials
            .get(&material.0)
            .is_some_and(|m| m.base_color != color)
            && let Some(mut m) = materials.get_mut(&material.0)
        {
            m.base_color = color;
        }
    }
}

/// Warn about a binding whose kind can't drive its attribute: a color
/// binding on a numeric attribute, or a numeric one on `color`.
fn validate_bindings(anim: &AnimatedNode) {
    use bevy_react_core::animations::AnimatableProperty;
    for (property, binding) in anim.0.iter() {
        let AnimatableProperty::Ext {
            domain: DOMAIN,
            name,
        } = property
        else {
            continue;
        };
        let is_color = matches!(binding, Binding::InterpolateColor { .. });
        let msg = match (name.as_str(), is_color) {
            ("color", false) => "binding cube.color: needs an interpolateColor binding",
            (_, true) if name != "color" => {
                "binding cube attribute: numeric — an interpolateColor binding cannot drive it"
            }
            _ => continue,
        };
        bevy_react_core::diag::report("styleBinding", name, msg);
    }
}

/// Give handler-bearing cubes a `Pickable` (the mesh picking backend's
/// marker) and take it away with the last handler. The core stamps
/// `Interaction` on a node-less element exactly while it has pointer
/// handlers.
#[allow(clippy::type_complexity)]
fn sync_cube_pickable(
    mut commands: Commands,
    gained: Query<Entity, (With<Cube>, With<Interaction>, Without<Pickable>)>,
    lost: Query<Entity, (With<Cube>, Without<Interaction>, With<Pickable>)>,
) {
    for entity in &gained {
        commands.entity(entity).insert(Pickable::default());
    }
    for entity in &lost {
        commands.entity(entity).remove::<Pickable>();
    }
}

/// Drive `Interaction` for handler-bearing cubes from the hover map and the
/// hovering pointer's press state — the enter/leave collectors read it.
fn sync_cube_interactions(
    hover_map: Option<Res<HoverMap>>,
    pointers: Query<(&PointerId, &PointerPress)>,
    mut cubes: Query<(Entity, &mut Interaction), With<Cube>>,
) {
    for (entity, mut interaction) in &mut cubes {
        let hovering = hover_map.as_ref().and_then(|map| {
            map.iter()
                .find(|(_, hits)| hits.contains_key(&entity))
                .map(|(id, _)| *id)
        });
        let pressed = hovering.is_some_and(|id| {
            pointers
                .iter()
                .any(|(pid, press)| *pid == id && press.is_primary_pressed())
        });
        interaction.set_if_neq(match (hovering.is_some(), pressed) {
            (true, true) => Interaction::Pressed,
            (true, false) => Interaction::Hovered,
            (false, _) => Interaction::None,
        });
    }
}
