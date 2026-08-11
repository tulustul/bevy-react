//! Stage 5 of [`apply_animated_nodes`](super::apply_animated_nodes): SVG
//! shape-attr bindings ([`AnimatableProperty::ShapeAttr`]) — write each
//! frame's resolved value onto the bound [`SvgShape`] attr. Split into its
//! own file for module size (the `runner.rs` precedent); the orchestration
//! loop in `mod.rs` gates on `has_shape_attrs()` and calls
//! [`apply_shape_attrs`] once per bound entity.
//!
//! ## The seed-slot write (the locked design)
//!
//! Driven values land in the wrapper's **seed slot**: the stage writes
//! `Animatable::Animated { binding, seed: Some(driven) }` — never
//! `Static(driven)`, which would destroy the binding. Why this is right:
//!
//! - The read path already renders seeds
//!   ([`static_or_seed`](crate::protocol::animatable::AnimatableField::static_or_seed) —
//!   paint, hit, and the group walk all use it), so no consumer changes.
//! - [`ShapeAttrs`](crate::svg::ShapeAttrs)' `PartialEq` includes the seed
//!   (deliberately — see the `Animatable` derive note in `protocol/animatable.rs`), so
//!   compare-before-write and the raster's `Changed<SvgShape>` derived dirt
//!   (C5) stay sound.
//! - A JS atomic attrs re-send restoring the original seed is corrected the
//!   **same frame**: the op merge runs in `apply_js_ops`, this stage runs
//!   after it (`AnimationSet::Apply`), and the raster reads after both
//!   (`update_svg_surfaces.after(AnimationSet::Apply)` in `plugin.rs`).
//!
//! Values are applied in **wire units** — SVG user-space numbers for
//! geometry/`strokeWidth` (the viewBox scales them at raster time), `0..1`
//! for `opacity` — no logical→physical conversion here
//! ([`AnimatableProperty::ShapeAttr`] is genuinely `ValueKind::Scalar`).
//!
//! No dirt is pushed here: the `Changed<SvgShape>` tick from the seed write
//! IS the raster's repaint signal, and `svg::update_svg_surfaces` taps
//! [`LayerContentDirt`](crate::layer::LayerContentDirt) itself when it
//! repaints. (Write timing for E3, the transition engine: this stage is the
//! last `SvgShape` writer of the frame — op merge first, driver second.)
//! While any shape binding exists the transition engine's shape channel is
//! parked — and, uniquely, RESET for re-seed — see
//! [`ChannelId`](super::super::props::ChannelId) for the authoritative park
//! semantics.

use bevy::prelude::*;

use super::super::protocol::{AnimatableProperty, AnimatedBindings, Binding};
use super::super::{SharedValues, eval_scalar};
use super::warn::warn_if;
use crate::protocol::animatable::Animatable;
use crate::svg::{SvgShape, numeric_attr, numeric_attr_mut};

/// Validate (when `validate`) and apply every
/// [`AnimatableProperty::ShapeAttr`] binding of one node against its
/// [`SvgShape`]. Mirrors stage 4's discipline: phase A reads through `Deref`
/// (no change mark) and collects real differences; phase B takes one
/// `deref_mut` only when something actually changed — a clean frame never
/// ticks `Changed<SvgShape>`. Validation warnings (`shapeBinding`, devtools)
/// fire once per bindings restamp, never per frame.
pub(super) fn apply_shape_attrs(
    bindings: &AnimatedBindings,
    values: &SharedValues,
    shape: Option<&mut Mut<SvgShape>>,
    rnode: Option<&crate::bridge::RNode>,
    validate: bool,
) {
    // Attribute validation warnings to the node's devtools inspector.
    let _diag = rnode.map(|r| crate::diag::node_scope(r.0));
    // Lazy like stage 4 — see `warn::warn_if`.
    let warn = |validate: bool, make: &dyn Fn() -> (String, String)| {
        warn_if(validate, "shapeBinding", make)
    };

    let Some(shape) = shape else {
        // Bindings stamped on a node with no `SvgShape` — a stale stamp
        // (shape bindings only ever derive from shape entities' attrs).
        for (property, _) in bindings.iter() {
            if let AnimatableProperty::ShapeAttr { name } = property {
                warn(validate, &|| {
                    (
                        name.clone(),
                        format!(
                            "binding shape.{name}: the node has no SvgShape to drive — \
                             binding ignored"
                        ),
                    )
                });
            }
        }
        return;
    };

    // Phase A — read-only (through `Deref`, no change mark): resolve each
    // bound attr against the live slot and collect the seeds that actually
    // differ. Values are in wire units (user-space numbers / 0..1 opacity) —
    // no conversion (see the module doc).
    let mut writes: Vec<(&str, f32)> = Vec::new();
    {
        let attrs = &shape.attrs;
        for (property, binding) in bindings.iter() {
            let AnimatableProperty::ShapeAttr { name } = property else {
                continue;
            };
            let Some(v) = eval_scalar(binding, values) else {
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
                Some(Animatable::Animated { seed, .. }) => {
                    if *seed != Some(v) {
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
            if let Some(Some(Animatable::Animated { seed, .. })) =
                numeric_attr_mut(&mut shape.attrs, name).map(Option::as_mut)
            {
                *seed = Some(v);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::animations::{
        AnimatedNode, Driver, Easing, SharedValues, apply_animated_nodes, protocol,
    };
    use crate::protocol::{animatable::Animatable, animatable::AnimatableField};
    use crate::svg::{ShapeAttrs, ShapeKind, SvgShape};
    use bevy::prelude::*;
    use bevy::ui::UiTransform;
    use serde_json::json;

    fn decode_attrs(v: serde_json::Value) -> ShapeAttrs {
        serde_json::from_value(v).expect("attrs decode")
    }

    /// Production-path bindings: decode attrs carrying `{ animated }`
    /// wrappers and derive (`crate::style_bindings::derive_shape_bindings`).
    fn shape_bindings(attrs: &ShapeAttrs) -> protocol::AnimatedBindings {
        crate::style_bindings::derive_shape_bindings(Some(attrs)).expect("attrs carry bindings")
    }

    fn shape_world() -> (World, Schedule) {
        let mut world = World::new();
        world.init_resource::<crate::layer::LayerContentDirt>();
        world.init_resource::<SharedValues>();
        let mut schedule = Schedule::default();
        schedule.add_systems(apply_animated_nodes);
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
            values.declare(1, 10.0);
            values.animate(
                1,
                &Driver::Timing {
                    to: 30.0,
                    duration: 1.0,
                    easing: Easing::Linear,
                },
                None,
            );
            values.tick(1.0); // run to the target: 30
        }

        let attrs = decode_attrs(json!({
            "cx": 50.0,
            "r": { "animated": { "id": 1 }, "seed": 10.0 },
        }));
        let bindings = shape_bindings(&attrs);
        let e = world
            .spawn((
                AnimatedNode(bindings),
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
            matches!(shape.attrs.r, Some(Animatable::Animated { .. })),
            "the binding survives — the driver must never write Static"
        );
        assert_eq!(
            shape.attrs.cx.static_val(),
            Some(50.0),
            "unbound static attrs stay untouched"
        );
        assert!(
            world
                .resource::<crate::layer::LayerContentDirt>()
                .nodes
                .is_empty(),
            "the stage pushes no dirt — Changed<SvgShape> is the signal"
        );
    }

    /// A settled driver is tick-silent: the second apply with an unchanged
    /// value must not re-mark `SvgShape` changed (compare-before-write), and
    /// a JS re-send snapping the seed back is corrected on the next apply.
    #[test]
    fn settled_shape_attr_does_not_tick_changed() {
        let (mut world, mut schedule) = shape_world();
        world.resource_mut::<SharedValues>().set(1, 25.0);

        let attrs = decode_attrs(json!({ "r": { "animated": { "id": 1 }, "seed": 5.0 } }));
        let bindings = shape_bindings(&attrs);
        let e = world
            .spawn((
                AnimatedNode(bindings),
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
        world.entity_mut(e).get_mut::<SvgShape>().unwrap().attrs.r = Some(Animatable::Animated {
            binding: protocol::Binding::Shared { id: 1 },
            seed: Some(5.0),
        });
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

    /// A stale binding — stamped `ShapeAttr` rows whose attrs no longer carry
    /// the wrapper (re-sent static / absent), an unknown attr name, or a
    /// missing `SvgShape` entirely — stays inert: no write, no tick, no
    /// panic. (The devtools warn coverage is the gated test below.)
    #[test]
    fn stale_shape_bindings_stay_inert() {
        let (mut world, mut schedule) = shape_world();
        world.resource_mut::<SharedValues>().set(1, 99.0);

        // Static attr + absent attr, but bindings still stamped for both —
        // plus a name outside the numeric table.
        let attrs = decode_attrs(json!({ "r": 10.0 }));
        let bindings = protocol::AnimatedBindings(
            [
                (
                    protocol::AnimatableProperty::ShapeAttr { name: "r".into() },
                    protocol::Binding::Shared { id: 1 },
                ),
                (
                    protocol::AnimatableProperty::ShapeAttr { name: "cx".into() },
                    protocol::Binding::Shared { id: 1 },
                ),
                (
                    protocol::AnimatableProperty::ShapeAttr {
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
                UiTransform::default(),
                SvgShape {
                    kind: ShapeKind::Circle,
                    attrs,
                },
            ))
            .id();
        // A shape-bound entity with no SvgShape at all (stale stamp).
        world.spawn((AnimatedNode(bindings), UiTransform::default()));

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
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut world, mut schedule) = shape_world();
        world.resource_mut::<SharedValues>().set(1, 42.0);

        let attrs = decode_attrs(json!({ "r": 10.0 }));
        let bindings = protocol::AnimatedBindings(
            [
                (
                    protocol::AnimatableProperty::ShapeAttr { name: "r".into() },
                    protocol::Binding::Shared { id: 1 },
                ),
                (
                    protocol::AnimatableProperty::ShapeAttr {
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
                UiTransform::default(),
                crate::bridge::RNode(5),
                SvgShape {
                    kind: ShapeKind::Circle,
                    attrs,
                },
            ))
            .id();

        schedule.run(&mut world);
        let warns = crate::diag::take_runtime_warnings();
        let mine: Vec<_> = warns.iter().filter(|w| w.node == Some(5)).collect();
        assert_eq!(mine.len(), 2, "{warns:?}");
        assert!(mine.iter().all(|w| w.kind == "shapeBinding"));
        let values: Vec<_> = mine.iter().map(|w| w.value.as_str()).collect();
        assert!(values.contains(&"r"), "{values:?}");
        assert!(values.contains(&"bogus"), "{values:?}");

        // Steady state: no re-warn.
        schedule.run(&mut world);
        assert!(
            crate::diag::take_runtime_warnings()
                .iter()
                .all(|w| w.node != Some(5)),
            "validation warnings must not repeat per frame"
        );

        // A restamp (props update re-inserts the bindings) re-validates.
        let restamped = world.entity(e).get::<AnimatedNode>().unwrap().0.clone();
        world.entity_mut(e).insert(AnimatedNode(restamped));
        schedule.run(&mut world);
        let refires = crate::diag::take_runtime_warnings()
            .iter()
            .filter(|w| w.node == Some(5))
            .count();
        assert_eq!(refires, 2, "a bindings restamp re-validates");

        // No SvgShape at all: one warn per shape binding, still inert.
        world.spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            crate::bridge::RNode(6),
        ));
        schedule.run(&mut world);
        let shapeless = crate::diag::take_runtime_warnings()
            .iter()
            .filter(|w| w.node == Some(6))
            .count();
        assert_eq!(shapeless, 2, "a shape-less node warns per binding");
    }

    /// `<g>` group entities are driven like any shape: a bound group
    /// `opacity` lands in its seed slot (the walk composes it into children
    /// via `static_or_seed` — pixel proof in `svg::raster` tests).
    #[test]
    fn group_opacity_binding_drives_seed() {
        let (mut world, mut schedule) = shape_world();
        world.resource_mut::<SharedValues>().set(1, 0.5);

        let attrs = decode_attrs(json!({
            "opacity": { "animated": { "id": 1 }, "seed": 1.0 },
        }));
        let bindings = shape_bindings(&attrs);
        let e = world
            .spawn((
                AnimatedNode(bindings),
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
