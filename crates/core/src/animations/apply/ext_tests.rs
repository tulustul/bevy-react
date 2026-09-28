//! Stage 5 — the `Ext` publish: feature-owned bindings evaluate into the
//! entity's `DrivenExtValues`, the binding picking scalar or color.
use bevy::prelude::*;
use bevy::ui::UiTransform;

use super::super::protocol::{AnimatableProperty, AnimatedBindings, Binding};
use super::super::{AnimatedNode, SharedValues};
use super::apply_animated_nodes;
use crate::ext::{DrivenExtValues, DrivenValue};

fn ext(name: &str) -> AnimatableProperty {
    AnimatableProperty::Ext {
        domain: "probe",
        name: name.into(),
    }
}

/// A probe entity carrying a scalar (`size`), an interpolated scalar
/// (`y`), and a color (`color`) binding, over shared values 1 and 2.
fn probe_world() -> (World, Entity) {
    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    let mut values = SharedValues::default();
    values.set(1, 2.5);
    values.set(2, 0.5);
    world.insert_resource(values);

    let bindings = AnimatedBindings(
        [
            (ext("size"), Binding::Shared { id: 1 }),
            (
                ext("y"),
                Binding::Interpolate {
                    id: 2,
                    input: vec![0.0, 1.0],
                    output: vec![0.0, 10.0],
                },
            ),
            (
                ext("color"),
                Binding::InterpolateColor {
                    id: 2,
                    input: vec![0.0, 1.0],
                    output: vec![[1.0, 0.0, 0.0, 1.0], [0.0, 0.0, 1.0, 1.0]],
                },
            ),
        ]
        .into_iter()
        .collect(),
    );
    let e = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            DrivenExtValues::default(),
        ))
        .id();
    (world, e)
}

fn apply(world: &mut World) {
    let mut schedule = Schedule::default();
    schedule.add_systems(apply_animated_nodes);
    schedule.run(world);
}

/// Scalars publish as `Scalar`, `interpolateColor` as an sRGB `Color`; the
/// typed getters only answer for their own kind.
#[test]
fn ext_bindings_publish_scalars_and_colors() {
    let (mut world, e) = probe_world();
    apply(&mut world);

    let driven = world.entity(e).get::<DrivenExtValues>().unwrap();
    assert_eq!(driven.get("probe", "size"), Some(2.5));
    assert_eq!(driven.get("probe", "y"), Some(5.0));
    assert_eq!(
        driven.value("probe", "color"),
        Some(DrivenValue::Color([0.5, 0.0, 0.5, 1.0]))
    );
    assert_eq!(
        driven.get_color("probe", "color"),
        Some(Srgba::new(0.5, 0.0, 0.5, 1.0))
    );
    assert_eq!(
        driven.get("probe", "color"),
        None,
        "a color is not a scalar"
    );
    assert_eq!(
        driven.get_color("probe", "size"),
        None,
        "a scalar is not a color"
    );
}

/// A binding whose shared value is missing publishes nothing, for either
/// kind — the consumer sees the gap.
#[test]
fn ext_binding_without_shared_value_publishes_nothing() {
    let (mut world, e) = probe_world();
    world.insert_resource(SharedValues::default());
    apply(&mut world);

    let driven = world.entity(e).get::<DrivenExtValues>().unwrap();
    assert!(driven.0.is_empty(), "nothing evaluable: {driven:?}");
}

/// A settled frame (same shared values) never ticks the publish slot.
#[test]
fn settled_ext_publish_does_not_tick() {
    let (mut world, e) = probe_world();
    apply(&mut world);
    let before = world
        .entity(e)
        .get_ref::<DrivenExtValues>()
        .unwrap()
        .last_changed();
    world.increment_change_tick();
    apply(&mut world);
    let after = world
        .entity(e)
        .get_ref::<DrivenExtValues>()
        .unwrap()
        .last_changed();
    assert_eq!(before, after, "a settled publish must not re-write");
}
