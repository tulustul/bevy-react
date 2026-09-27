//! The svg feature's consumer of the animation engine's publish slot: every
//! `shape` binding ([`AnimatableProperty::Ext`] with domain `"shape"`) the
//! engine evaluated this frame ([`DrivenExtValues`]) is written onto the bound
//! [`SvgShape`] attr. Ordered after `AnimationSet::Apply` (the publish) and
//! before the raster ([`ElementRasterSet`](bevy_react_core::ext::ElementRasterSet)), so
//! a driven value paints the same frame.
//!
//! ## The seed-slot write (the locked design)
//!
//! Driven values land in the wrapper's **seed slot**: the write keeps
//! `Animatable::animated(binding, Some(driven))` — never `Static(driven)`,
//! which would destroy the binding. Why this is right:
//!
//! - The read path already renders seeds
//!   ([`static_or_seed`](bevy_react_core::protocol::animatable::AnimatableField::static_or_seed) —
//!   paint, hit, and the group walk all use it), so no consumer changes.
//! - [`ShapeAttrs`](crate::ShapeAttrs)' `PartialEq` includes the seed
//!   (deliberately — see the `Animatable` derive note in `protocol/animatable.rs`), so
//!   compare-before-write and the raster's `Changed<SvgShape>` derived dirt
//!   stay sound.
//! - A JS atomic attrs re-send restoring the original seed is corrected the
//!   **same frame**: the op merge runs in `apply_js_ops`, this system runs
//!   after it (it wakes on `Changed<SvgShape>`), and the raster reads after
//!   both.
//!
//! Values are applied in **wire units** — SVG user-space numbers for
//! geometry/`strokeWidth` (the viewBox scales them at raster time), `0..1`
//! for `opacity` — no logical→physical conversion here.
//!
//! No dirt is pushed here: the `Changed<SvgShape>` tick from the seed write
//! IS the raster's repaint signal, and `svg::update_svg_surfaces` taps
//! [`LayerContentDirt`](bevy_react_core::layer::LayerContentDirt) itself when it
//! repaints. While any shape binding exists the shape transition channel is
//! parked — and reset for re-seed — see [`super::transition`].

use bevy::prelude::*;

use super::{SvgShape, numeric_attr, numeric_attr_mut};
use bevy_react_core::animations::AnimatedNode;
use bevy_react_core::animations::protocol::{AnimatableProperty, AnimatedBindings, Binding};
use bevy_react_core::ext::DrivenExtValues;
use bevy_react_core::protocol::animatable::Animatable;

/// Write this frame's driven `shape` values onto every bound shape's attrs.
/// Wakes on a fresh publish, a bindings restamp (validation), or an op
/// merge rewriting the attrs (a re-sent seed is re-asserted the same frame).
#[allow(clippy::type_complexity)]
pub fn apply_driven_shape_attrs(
    mut shapes: Query<
        (
            Ref<AnimatedNode>,
            &DrivenExtValues,
            &mut SvgShape,
            Option<&bevy_react_core::ReactNode>,
        ),
        Or<(
            Changed<AnimatedNode>,
            Changed<DrivenExtValues>,
            Changed<SvgShape>,
        )>,
    >,
) {
    for (anim, driven, mut shape, rnode) in &mut shapes {
        if !anim.0.has_ext_domain("shape") {
            continue;
        }
        // Validation warnings fire once per bindings restamp (the `Ref`
        // change tick), never per frame.
        apply_driven(&anim.0, driven, &mut shape, rnode, anim.is_changed());
    }
}

/// `make` (which allocates the key + message) runs only when the warning
/// actually fires, so the per-binding per-frame path stays allocation-free.
fn warn_if(validate: bool, kind: &'static str, make: &dyn Fn() -> (String, String)) {
    if validate {
        let (key, msg) = make();
        bevy_react_core::diag::report(kind, &key, &msg);
    }
}

/// Validate (when `validate`) and apply every `shape` binding of one node
/// against its [`SvgShape`]. Phase A reads through `Deref` (no change mark)
/// and collects real differences; phase B takes one `deref_mut` only when
/// something actually changed — a clean frame never ticks `Changed<SvgShape>`.
fn apply_driven(
    bindings: &AnimatedBindings,
    driven: &DrivenExtValues,
    shape: &mut Mut<SvgShape>,
    rnode: Option<&bevy_react_core::ReactNode>,
    validate: bool,
) {
    // Attribute validation warnings to the node's devtools inspector.
    let _diag = rnode.map(|r| bevy_react_core::diag::node_scope(r.0));
    let warn = |validate: bool, make: &dyn Fn() -> (String, String)| {
        warn_if(validate, "shapeBinding", make)
    };

    // Phase A — read-only (through `Deref`, no change mark): resolve each
    // bound attr against the live slot and collect the seeds that actually
    // differ. Values are in wire units (user-space numbers / 0..1 opacity) —
    // no conversion (see the module doc).
    let mut writes: Vec<(&str, f32)> = Vec::new();
    {
        let attrs = &shape.attrs;
        for (property, binding) in bindings.iter() {
            let AnimatableProperty::Ext {
                domain: "shape",
                name,
            } = property
            else {
                continue;
            };
            let Some(v) = driven.get("shape", name) else {
                // A color binding can never drive a numeric attr; a missing
                // shared value is transient and stays silent (every stage
                // skips it).
                if matches!(binding, Binding::InterpolateColor { .. }) {
                    warn(validate, &|| {
                        (
                            name.clone(),
                            format!(
                                "binding shape.{name}: shape attrs are scalars — an \
                                 interpolateColor binding cannot drive one"
                            ),
                        )
                    });
                }
                continue;
            };
            // Name → slot through the one wire-name table (`NUMERIC_ATTRS`).
            // Unknown shouldn't happen — derivation uses the same table —
            // but a stale binding could carry one.
            let Some(slot) = numeric_attr(attrs, name) else {
                warn(validate, &|| {
                    (
                        name.clone(),
                        format!("binding shape.{name}: not a numeric shape attr — binding ignored"),
                    )
                });
                continue;
            };
            match slot {
                Some(Animatable::Animated(a)) => {
                    if a.seed != Some(v) {
                        writes.push((name.as_str(), v));
                    }
                }
                // The attrs were re-sent without the wrapper while the
                // binding is still stamped (the atomic replace re-derives
                // bindings, so this is transient at worst): never overwrite
                // a static value — warn and stay inert.
                Some(Animatable::Static(_)) | None => {
                    warn(validate, &|| {
                        (
                            name.clone(),
                            format!(
                                "binding shape.{name}: the attr no longer carries an \
                                 {{ animated }} wrapper (stale binding) — binding ignored"
                            ),
                        )
                    });
                }
            }
        }
    }

    // Phase B — one `deref_mut`, taken only when something really changed
    // (a clean frame must not tick `Changed<SvgShape>`): write the driven
    // values into the seed slots, keeping the `Animated` variant — and thus
    // the binding — intact (the module-doc design).
    if !writes.is_empty() {
        let shape: &mut SvgShape = shape;
        for (name, v) in writes {
            if let Some(seed) = numeric_attr_mut(&mut shape.attrs, name)
                .and_then(Option::as_mut)
                .and_then(Animatable::seed_mut)
            {
                *seed = Some(v);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::apply_driven_shape_attrs;
    use crate::{ShapeAttrs, ShapeKind, SvgShape};
    use bevy::prelude::*;
    use bevy::ui::UiTransform;
    use bevy_react_core::animations::{AnimatedNode, Driver, Easing, SharedValues, protocol};
    use bevy_react_core::ext::DrivenExtValues;
    use bevy_react_core::protocol::{animatable::Animatable, animatable::AnimatableField};
    use serde_json::json;

    fn decode_attrs(v: serde_json::Value) -> ShapeAttrs {
        serde_json::from_value(v).expect("attrs decode")
    }

    /// Production-path bindings: decode attrs carrying `{ animated }`
    /// wrappers and derive (`crate::bindings_tests::derive_shape_bindings`).
    fn shape_bindings(attrs: &ShapeAttrs) -> protocol::AnimatedBindings {
        crate::bindings_tests::derive_shape_bindings(Some(attrs)).expect("attrs carry bindings")
    }

    fn shape_world() -> (World, Schedule) {
        let mut world = World::new();
        world.init_resource::<bevy_react_core::layer::LayerContentDirt>();
        world.init_resource::<SharedValues>();
        let mut schedule = Schedule::default();
        // The engine's publish, then this feature's consumer — the
        // production order (`AnimationSet::Apply` → the svg consumer).
        schedule.add_systems(
            (
                bevy_react_core::test_util::animation_apply(),
                apply_driven_shape_attrs,
            )
                .chain(),
        );
        (world, schedule)
    }

    /// Drive `r` through the real command path (declare → animate → tick):
    /// the driven value lands in the seed slot — the binding survives (never
    /// `Static`) and `static_or_seed` (what paint/hit read) returns it.
    #[test]
    fn shape_attr_binding_drives_seed_through_command_path() {
        let (mut world, mut schedule) = shape_world();
        {
            let mut values = world.resource_mut::<SharedValues>();
            bevy_react_core::test_util::shared_declare(&mut values, 1, 10.0);
            bevy_react_core::test_util::shared_animate(
                &mut values,
                1,
                &Driver::Timing {
                    to: 30.0,
                    duration: 1.0,
                    easing: Easing::Linear,
                },
                None,
            );
            bevy_react_core::test_util::shared_tick(&mut values, 1.0); // run to the target: 30
        }

        let attrs = decode_attrs(json!({
            "cx": 50.0,
            "r": { "animated": { "id": 1 }, "seed": 10.0 },
        }));
        let bindings = shape_bindings(&attrs);
        let e = world
            .spawn((
                AnimatedNode(bindings),
                DrivenExtValues::default(),
                UiTransform::default(),
                SvgShape {
                    kind: ShapeKind::Circle,
                    attrs,
                },
            ))
            .id();

        schedule.run(&mut world);

        let shape = world.entity(e).get::<SvgShape>().unwrap();
        assert_eq!(
            shape.attrs.r.static_or_seed(),
            Some(30.0),
            "the driven value renders through the seed slot"
        );
        assert!(
            matches!(shape.attrs.r, Some(Animatable::Animated(_))),
            "the binding survives — the driver must never write Static"
        );
        assert_eq!(
            shape.attrs.cx.static_val(),
            Some(50.0),
            "unbound static attrs stay untouched"
        );
        assert!(
            world
                .resource::<bevy_react_core::layer::LayerContentDirt>()
                .nodes
                .is_empty(),
            "the consumer pushes no dirt — Changed<SvgShape> is the signal"
        );
    }

    /// A settled driver is tick-silent: the second apply with an unchanged
    /// value must not re-mark `SvgShape` changed (compare-before-write), and
    /// a JS re-send snapping the seed back is corrected on the next apply.
    #[test]
    fn settled_shape_attr_does_not_tick_changed() {
        let (mut world, mut schedule) = shape_world();
        bevy_react_core::test_util::shared_set(&mut world.resource_mut::<SharedValues>(), 1, 25.0);

        let attrs = decode_attrs(json!({ "r": { "animated": { "id": 1 }, "seed": 5.0 } }));
        let bindings = shape_bindings(&attrs);
        let e = world
            .spawn((
                AnimatedNode(bindings),
                DrivenExtValues::default(),
                UiTransform::default(),
                SvgShape {
                    kind: ShapeKind::Circle,
                    attrs,
                },
            ))
            .id();

        schedule.run(&mut world);
        assert_eq!(
            world
                .entity(e)
                .get::<SvgShape>()
                .unwrap()
                .attrs
                .r
                .static_or_seed(),
            Some(25.0)
        );

        // Settled: no change-detection churn on re-apply.
        let tick = world
            .entity(e)
            .get_ref::<SvgShape>()
            .unwrap()
            .last_changed();
        schedule.run(&mut world);
        assert_eq!(
            world
                .entity(e)
                .get_ref::<SvgShape>()
                .unwrap()
                .last_changed(),
            tick,
            "a settled binding must not tick Changed<SvgShape>"
        );

        // A re-render re-sent the attrs with the original seed (the op merge
        // runs before this stage): the still-active binding re-asserts.
        world.entity_mut(e).get_mut::<SvgShape>().unwrap().attrs.r = Some(Animatable::animated(
            protocol::Binding::Shared { id: 1 },
            Some(5.0),
        ));
        schedule.run(&mut world);
        assert_eq!(
            world
                .entity(e)
                .get::<SvgShape>()
                .unwrap()
                .attrs
                .r
                .static_or_seed(),
            Some(25.0),
            "the binding re-asserts over a re-sent seed the next apply"
        );
    }

    /// A stale binding — stamped `Ext` rows whose attrs no longer carry
    /// the wrapper (re-sent static / absent), an unknown attr name, or a
    /// missing `SvgShape` entirely — stays inert: no write, no tick, no
    /// panic. (The devtools warn coverage is the gated test below.)
    #[test]
    fn stale_shape_bindings_stay_inert() {
        let (mut world, mut schedule) = shape_world();
        bevy_react_core::test_util::shared_set(&mut world.resource_mut::<SharedValues>(), 1, 99.0);

        // Static attr + absent attr, but bindings still stamped for both —
        // plus a name outside the numeric table.
        let attrs = decode_attrs(json!({ "r": 10.0 }));
        let bindings = protocol::AnimatedBindings(
            [
                (
                    protocol::AnimatableProperty::Ext {
                        domain: "shape",
                        name: "r".into(),
                    },
                    protocol::Binding::Shared { id: 1 },
                ),
                (
                    protocol::AnimatableProperty::Ext {
                        domain: "shape",
                        name: "cx".into(),
                    },
                    protocol::Binding::Shared { id: 1 },
                ),
                (
                    protocol::AnimatableProperty::Ext {
                        domain: "shape",
                        name: "bogus".into(),
                    },
                    protocol::Binding::Shared { id: 1 },
                ),
            ]
            .into_iter()
            .collect(),
        );
        let e = world
            .spawn((
                AnimatedNode(bindings.clone()),
                DrivenExtValues::default(),
                UiTransform::default(),
                SvgShape {
                    kind: ShapeKind::Circle,
                    attrs,
                },
            ))
            .id();
        // A shape-bound entity with no SvgShape at all (stale stamp).
        world.spawn((
            AnimatedNode(bindings),
            DrivenExtValues::default(),
            UiTransform::default(),
        ));

        schedule.run(&mut world);
        let shape = world.entity(e).get::<SvgShape>().unwrap();
        assert_eq!(
            shape.attrs.r.static_val(),
            Some(10.0),
            "a static value is never overwritten by a stale binding"
        );
        assert_eq!(shape.attrs.cx, None, "an absent attr stays absent");

        let tick = world
            .entity(e)
            .get_ref::<SvgShape>()
            .unwrap()
            .last_changed();
        schedule.run(&mut world);
        assert_eq!(
            world
                .entity(e)
                .get_ref::<SvgShape>()
                .unwrap()
                .last_changed(),
            tick,
            "inert bindings must not tick Changed<SvgShape>"
        );
    }

    /// Bind-time validation warns (`shapeBinding`, attributed to the node)
    /// once per bindings restamp — not per frame — for each stale-binding
    /// shape: static/absent slot, unknown name, chainless node.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn shape_binding_validation_warns_once_per_restamp() {
        let _lock = bevy_react_core::diag::test_lock();
        bevy_react_core::diag::arm_runtime();
        let _ = bevy_react_core::diag::take_runtime_warnings();

        let (mut world, mut schedule) = shape_world();
        bevy_react_core::test_util::shared_set(&mut world.resource_mut::<SharedValues>(), 1, 42.0);

        let attrs = decode_attrs(json!({ "r": 10.0 }));
        let bindings = protocol::AnimatedBindings(
            [
                (
                    protocol::AnimatableProperty::Ext {
                        domain: "shape",
                        name: "r".into(),
                    },
                    protocol::Binding::Shared { id: 1 },
                ),
                (
                    protocol::AnimatableProperty::Ext {
                        domain: "shape",
                        name: "bogus".into(),
                    },
                    protocol::Binding::Shared { id: 1 },
                ),
            ]
            .into_iter()
            .collect(),
        );
        let e = world
            .spawn((
                AnimatedNode(bindings.clone()),
                DrivenExtValues::default(),
                UiTransform::default(),
                bevy_react_core::ReactNode(5),
                SvgShape {
                    kind: ShapeKind::Circle,
                    attrs,
                },
            ))
            .id();

        schedule.run(&mut world);
        let warns = bevy_react_core::diag::take_runtime_warnings();
        let mine: Vec<_> = warns.iter().filter(|w| w.node == Some(5)).collect();
        assert_eq!(mine.len(), 2, "{warns:?}");
        assert!(mine.iter().all(|w| w.kind == "shapeBinding"));
        let values: Vec<_> = mine.iter().map(|w| w.value.as_str()).collect();
        assert!(values.contains(&"r"), "{values:?}");
        assert!(values.contains(&"bogus"), "{values:?}");

        // Steady state: no re-warn.
        schedule.run(&mut world);
        assert!(
            bevy_react_core::diag::take_runtime_warnings()
                .iter()
                .all(|w| w.node != Some(5)),
            "validation warnings must not repeat per frame"
        );

        // A restamp (props update re-inserts the bindings) re-validates.
        let restamped = world.entity(e).get::<AnimatedNode>().unwrap().0.clone();
        world.entity_mut(e).insert(AnimatedNode(restamped));
        schedule.run(&mut world);
        let refires = bevy_react_core::diag::take_runtime_warnings()
            .iter()
            .filter(|w| w.node == Some(5))
            .count();
        assert_eq!(refires, 2, "a bindings restamp re-validates");
    }

    /// `<g>` group entities are driven like any shape: a bound group
    /// `opacity` lands in its seed slot (the walk composes it into children
    /// via `static_or_seed` — pixel proof in `svg::raster` tests).
    #[test]
    fn group_opacity_binding_drives_seed() {
        let (mut world, mut schedule) = shape_world();
        bevy_react_core::test_util::shared_set(&mut world.resource_mut::<SharedValues>(), 1, 0.5);

        let attrs = decode_attrs(json!({
            "opacity": { "animated": { "id": 1 }, "seed": 1.0 },
        }));
        let bindings = shape_bindings(&attrs);
        let e = world
            .spawn((
                AnimatedNode(bindings),
                DrivenExtValues::default(),
                UiTransform::default(),
                SvgShape {
                    kind: ShapeKind::Group,
                    attrs,
                },
            ))
            .id();

        schedule.run(&mut world);
        assert_eq!(
            world
                .entity(e)
                .get::<SvgShape>()
                .unwrap()
                .attrs
                .opacity
                .static_or_seed(),
            Some(0.5),
            "a group's bound opacity is driven like any numeric attr"
        );
    }
}
