//! The SVG shape-attr transition channel: per-attr easing of a shape's
//! **numeric** attrs (`cx`, `r`, `strokeWidth`, …) toward the values the op
//! merge writes into [`SvgShape`]`.attrs`.
//!
//! Shapes have no `style`, so both the *spec* and the *targets* ride the
//! shape component itself (`attrs.transition`, decoded in `svg/protocol.rs`)
//! — the [`TransitionInput`](super::TransitionInput) on a shape entity is an
//! empty stamp that only makes the drive query match. Like the filter channel
//! (`FilterChannel`, the state-owned-current precedent), the component is
//! **snapped to the target before the transition runs** (`apply_js_ops`
//! merges the atomic `shape` replace earlier in the frame), so this channel
//! owns the value it last wrote per attr: a component value that differs from
//! that last write is an external retarget; anything else means the ease is
//! mid-flight over its own writes.
//!
//! Rules (mirroring the scalar channels + the E2 seed-slot contract):
//! - **First sight snaps**: a fresh attr (or a fresh element) seeds at the
//!   live value — no ease-in from zero.
//! - **Static slots only**: an attr carrying an `{ animated }` wrapper is
//!   never written (the animation driver owns it via the seed slot); the
//!   caller additionally parks the whole channel while the entity has any
//!   `ShapeAttr` binding (`has_shape_attrs`, the coarse `skip_filter`-style
//!   rule).
//! - **Non-numeric changes snap**: `d`/`points`/paints aren't in the channel
//!   at all, and easing one numeric attr never disturbs another.
//! - **No dirt push**: the `Changed<SvgShape>` tick from a real write IS the
//!   raster's repaint signal (`update_svg_surfaces` derives its own dirt).
//! - **Known blind spot** (inherent to state-owned-current over a single
//!   slot): a retarget landing *exactly* on the in-flight eased value is
//!   indistinguishable from this channel's own write and keeps easing toward
//!   the previous target. The filter channel avoids this only because its
//!   target rides a separate component; a shape's target and current share
//!   `attrs`.

use bevy::prelude::*;

use super::Channel;
use crate::protocol::Animatable;
use crate::svg::{NUMERIC_ATTR_COUNT, NUMERIC_ATTRS, SvgShape};

/// One tracked attr: the eased [`Channel`] plus the value this channel last
/// wrote into the component (external-retarget detection — see module doc).
struct SlotState {
    written: f32,
    ch: Channel,
}

impl SlotState {
    /// Seed at the live value: first sight snaps, no runner armed.
    fn snapped(value: f32) -> Self {
        let mut ch = Channel::default();
        ch.init(value);
        SlotState { written: value, ch }
    }
}

/// The per-entity shape channel: one optional slot per [`NUMERIC_ATTRS`] row.
/// Untracked (`None`) slots are attrs that are absent, animated, or have no
/// spec entry — their next sight seeds fresh (snap).
#[derive(Default)]
pub(super) struct ShapeChannel {
    slots: [Option<SlotState>; NUMERIC_ATTR_COUNT],
}

impl ShapeChannel {
    /// Drop all tracking so the next [`Self::drive`] snaps. Called while the
    /// channel is parked (any `ShapeAttr` binding on the entity): unparking
    /// must re-seed at the live values, not ease from stale ones.
    pub(super) fn reset(&mut self) {
        self.slots = Default::default();
    }

    /// Advance every specced static attr toward the component's value and
    /// write the eased reading back, compare-before-write (the shape-stage
    /// phase A/B discipline: reads through `Deref`, one `deref_mut` only when
    /// something really changed — a settled frame never ticks
    /// `Changed<SvgShape>`).
    pub(super) fn drive(&mut self, shape: &mut Mut<SvgShape>, dt: f32) {
        let mut writes: Vec<(usize, f32)> = Vec::new();
        {
            let attrs = &shape.attrs; // Deref read — no change mark
            let Some(spec) = attrs.transition.as_ref() else {
                self.reset();
                return;
            };
            for (i, (_, get, _)) in NUMERIC_ATTRS.iter().enumerate() {
                // Track only a static attr with a spec entry. Everything else
                // — absent attr, `{ animated }` slot (the driver owns it),
                // spec-less attr — is untracked and snaps by simply not being
                // driven (the op merge already wrote the target).
                let (component, timing) = match (get(attrs), spec.at(i)) {
                    (Some(Animatable::Static(v)), Some(timing)) => (*v, timing),
                    _ => {
                        self.slots[i] = None;
                        continue;
                    }
                };
                let st = self.slots[i].get_or_insert_with(|| SlotState::snapped(component));
                // The component differing from our own last write means the
                // op merge snapped a new target in this frame; otherwise the
                // in-flight target stands.
                let target = if component != st.written {
                    component
                } else {
                    st.ch.target
                };
                let eased = st.ch.drive(target, Some(timing), dt);
                // Recorded even when phase B skips the write: skip ⇔
                // `eased == component`, so `written == component` holds
                // either way and next-frame retarget detection stays truthful.
                st.written = eased;
                if eased != component {
                    writes.push((i, eased));
                }
            }
        }
        if !writes.is_empty() {
            let shape: &mut SvgShape = shape; // the one deref_mut
            for (i, v) in writes {
                // Belt and braces on the park rule: only ever write a slot
                // that is still `Static` (phase A checked; nothing between
                // the phases can change it, but never risk clobbering a
                // binding wrapper).
                if let Some(Animatable::Static(cur)) = NUMERIC_ATTRS[i].2(&mut shape.attrs) {
                    *cur = v;
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::super::{TransitionInput, TransitionState, drive_transitions};
    use crate::animations::AnimatedNode;
    use crate::animations::protocol::{AnimatableProperty, AnimatedBindings, Binding};
    use crate::svg::{ShapeKind, SvgShape};
    use bevy::prelude::*;
    use bevy::ui::UiTransform;
    use std::time::Duration;

    /// The `drive_world` harness of the parent module's tests, for shape
    /// entities: bare world + `drive_transitions`, manual `Time`.
    fn world() -> (World, Schedule) {
        let mut world = World::new();
        world.init_resource::<crate::layer::LayerContentDirt>();
        world.insert_resource(Time::<()>::default());
        let mut schedule = Schedule::default();
        schedule.add_systems(drive_transitions);
        (world, schedule)
    }

    fn advance(world: &mut World, secs: f32) {
        world
            .resource_mut::<Time>()
            .advance_by(Duration::from_secs_f32(secs));
    }

    fn attrs(json: serde_json::Value) -> crate::svg::ShapeAttrs {
        serde_json::from_value(json).expect("attrs decode")
    }

    /// Spawn a shape entity the way the reconciler stamps one with a
    /// transition spec: `SvgShape` + empty `TransitionInput` + state.
    fn spawn_shape(world: &mut World, kind: ShapeKind, a: crate::svg::ShapeAttrs) -> Entity {
        world
            .spawn((
                SvgShape { kind, attrs: a },
                TransitionInput::default(),
                TransitionState::default(),
                UiTransform::default(),
            ))
            .id()
    }

    fn cx(world: &World, e: Entity) -> f32 {
        use crate::protocol::AnimatableField;
        world
            .entity(e)
            .get::<SvgShape>()
            .unwrap()
            .attrs
            .cx
            .static_val()
            .expect("cx static")
    }

    fn set_cx(world: &mut World, e: Entity, v: f32) {
        world.entity_mut(e).get_mut::<SvgShape>().unwrap().attrs.cx =
            Some(crate::protocol::Animatable::Static(v));
    }

    const SPECCED: &str = r#"{
        "cx": 30.0, "cy": 50.0, "r": 20.0,
        "transition": { "cx": { "duration": 1000, "easing": "linear" } }
    }"#;

    fn specced() -> crate::svg::ShapeAttrs {
        attrs(serde_json::from_str::<serde_json::Value>(SPECCED).unwrap())
    }

    /// A fresh element's first value SNAPS (no ease-in from zero), and a
    /// later target change eases: strictly between old and new at
    /// mid-duration, exactly the target at the end — then tick-silent.
    #[test]
    fn target_change_eases_then_settles_silent() {
        let (mut world, mut schedule) = world();
        let e = spawn_shape(&mut world, ShapeKind::Circle, specced());

        // First frame: seed at 30, no animation, no write.
        schedule.run(&mut world);
        assert_eq!(cx(&world, e), 30.0, "first sight snaps");

        // Simulate the op merge writing the new target into the component.
        set_cx(&mut world, e, 70.0);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let mid = cx(&world, e);
        assert!(
            mid > 30.0 && mid < 70.0,
            "mid-duration is strictly between: {mid}"
        );
        assert!(
            (mid - 50.0).abs() < 1.0,
            "linear 1s at 0.5s ≈ 50, got {mid}"
        );

        advance(&mut world, 0.5);
        schedule.run(&mut world);
        assert!((cx(&world, e) - 70.0).abs() < 1e-3, "settles on the target");

        // Settled: writes stop (tick silence — the raster must stay idle).
        let tick = world
            .entity(e)
            .get_ref::<SvgShape>()
            .unwrap()
            .last_changed();
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        assert_eq!(
            world
                .entity(e)
                .get_ref::<SvgShape>()
                .unwrap()
                .last_changed(),
            tick,
            "a settled transition must not tick Changed<SvgShape>"
        );
    }

    /// A second retarget mid-flight redirects smoothly: the new ease starts
    /// from the in-flight eased value (the FilterChannel state-owned-current
    /// behavior), never snapping back or to the end.
    #[test]
    fn retarget_mid_flight_redirects_from_current() {
        let (mut world, mut schedule) = world();
        let e = spawn_shape(&mut world, ShapeKind::Circle, specced());
        schedule.run(&mut world); // seed at 30

        set_cx(&mut world, e, 70.0);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let mid = cx(&world, e);
        assert!((mid - 50.0).abs() < 1.0, "mid-flight ≈ 50, got {mid}");

        // Retarget back toward 30 mid-flight (the op writes the component).
        set_cx(&mut world, e, 30.0);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let redirected = cx(&world, e);
        assert!(
            redirected > 30.0 && redirected < mid,
            "redirect eases from the in-flight value toward 30: {redirected}"
        );
        assert!(
            (redirected - 40.0).abs() < 1.0,
            "linear 1s from ~50 at 0.5s ≈ 40, got {redirected}"
        );
    }

    /// A non-numeric change (`d`, `points`) mid-ease of `cx` doesn't disturb
    /// the ease — non-numeric attrs snap (they're not in the channel at all)
    /// while the numeric ease continues unaffected.
    #[test]
    fn non_numeric_change_mid_ease_leaves_the_ease_alone() {
        let (mut world, mut schedule) = world();
        let e = spawn_shape(
            &mut world,
            ShapeKind::Polyline,
            attrs(serde_json::json!({
                "cx": 30.0, "points": [0.0, 0.0, 10.0, 10.0],
                "transition": { "cx": { "duration": 1000, "easing": "linear" } }
            })),
        );
        schedule.run(&mut world); // seed

        // Retarget cx AND swap points in the same (atomic) attrs write.
        {
            let mut shape = world.entity_mut(e);
            let mut shape = shape.get_mut::<SvgShape>().unwrap();
            shape.attrs.cx = Some(crate::protocol::Animatable::Static(70.0));
            shape.attrs.points = Some(vec![Vec2::ZERO, Vec2::splat(99.0)]);
        }
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let mid = cx(&world, e);
        assert!((mid - 50.0).abs() < 1.0, "cx still eases: {mid}");
        assert_eq!(
            world.entity(e).get::<SvgShape>().unwrap().attrs.points,
            Some(vec![Vec2::ZERO, Vec2::splat(99.0)]),
            "points snapped (never eased, never reverted)"
        );

        // Another points-only change mid-ease: the cx ease keeps going.
        world
            .entity_mut(e)
            .get_mut::<SvgShape>()
            .unwrap()
            .attrs
            .points = Some(vec![Vec2::splat(1.0)]);
        advance(&mut world, 0.25);
        schedule.run(&mut world);
        let later = cx(&world, e);
        assert!(
            later > mid && later < 70.0,
            "cx ease undisturbed by the points change: {later}"
        );
    }

    /// Park, fine granularity: an `{ animated }` slot is never written by the
    /// transition even when the entity-level park doesn't apply (belt and
    /// braces — the slot match skips non-Static values).
    #[test]
    fn animated_slot_is_never_written() {
        let (mut world, mut schedule) = world();
        // cx is animated (seed 10), r static with a spec. NO AnimatedNode is
        // stamped (the coarse park is the test below) — the per-slot rule
        // alone must keep cx untouched.
        let e = spawn_shape(
            &mut world,
            ShapeKind::Circle,
            attrs(serde_json::json!({
                "cx": { "animated": { "id": 1 }, "seed": 10.0 },
                "r": 20.0,
                "transition": {
                    "cx": { "duration": 1000, "easing": "linear" },
                    "r": { "duration": 1000, "easing": "linear" }
                }
            })),
        );
        schedule.run(&mut world);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let shape = world.entity(e).get::<SvgShape>().unwrap();
        assert!(
            matches!(
                shape.attrs.cx,
                Some(crate::protocol::Animatable::Animated { seed: Some(s), .. }) if s == 10.0
            ),
            "the animated slot (wrapper + seed) survives untouched"
        );
    }

    /// Park, coarse granularity: ANY `ShapeAttr` binding on the entity parks
    /// the WHOLE channel — a spec'd attr with no binding of its own (`r`)
    /// snaps to the op-written value instead of easing.
    #[test]
    fn shape_binding_parks_the_whole_channel() {
        let (mut world, mut schedule) = world();
        let e = spawn_shape(
            &mut world,
            ShapeKind::Circle,
            attrs(serde_json::json!({
                "cx": { "animated": { "id": 1 }, "seed": 10.0 },
                "r": 20.0,
                "transition": { "r": { "duration": 1000, "easing": "linear" } }
            })),
        );
        // The binding the reconciler would derive from the wrapper on cx.
        world.entity_mut(e).insert(AnimatedNode(AnimatedBindings(
            [(
                AnimatableProperty::ShapeAttr { name: "cx".into() },
                Binding::Shared { id: 1 },
            )]
            .into(),
        )));
        schedule.run(&mut world);

        // Op writes r 20 → 50: parked, so r stays exactly 50 (snap) on every
        // subsequent frame — never an eased intermediate.
        {
            let mut em = world.entity_mut(e);
            em.get_mut::<SvgShape>().unwrap().attrs.r =
                Some(crate::protocol::Animatable::Static(50.0));
        }
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        use crate::protocol::AnimatableField;
        assert_eq!(
            world
                .entity(e)
                .get::<SvgShape>()
                .unwrap()
                .attrs
                .r
                .static_val(),
            Some(50.0),
            "coarse park: r snaps while ANY shape binding exists"
        );

        // Unparking (binding removed) re-seeds: the next retarget eases from
        // the live value, not from stale parked state.
        world.entity_mut(e).remove::<AnimatedNode>();
        schedule.run(&mut world); // re-seed frame (reset happened while parked)
        {
            let mut em = world.entity_mut(e);
            em.get_mut::<SvgShape>().unwrap().attrs.r =
                Some(crate::protocol::Animatable::Static(10.0));
        }
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let r = world
            .entity(e)
            .get::<SvgShape>()
            .unwrap()
            .attrs
            .r
            .static_val()
            .unwrap();
        assert!(
            (r - 30.0).abs() < 1.0,
            "unparked: eases 50→10 from the live value, got {r}"
        );
    }

    /// Removing the spec (the atomic replace carries target values) snaps:
    /// tracking drops and the op-written values stand.
    #[test]
    fn spec_removal_snaps() {
        let (mut world, mut schedule) = world();
        let e = spawn_shape(&mut world, ShapeKind::Circle, specced());
        schedule.run(&mut world);
        set_cx(&mut world, e, 70.0);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        assert!((cx(&world, e) - 50.0).abs() < 1.0, "mid-flight");

        // The op replaces attrs without a transition (and with the target).
        world.entity_mut(e).get_mut::<SvgShape>().unwrap().attrs =
            attrs(serde_json::json!({ "cx": 70.0, "cy": 50.0, "r": 20.0 }));
        advance(&mut world, 0.1);
        schedule.run(&mut world);
        assert_eq!(cx(&world, e), 70.0, "spec removal snaps to the target");
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        assert_eq!(cx(&world, e), 70.0, "and stays put");
    }
}
