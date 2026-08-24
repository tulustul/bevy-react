//! The apply engine's unit tests — stage order, dirt discipline, node/color
//! writes, filter-param routing + validation. Moved verbatim from the
//! engine's test module (assertions untouched).
use bevy::prelude::*;
use bevy::ui::UiTransform;

use super::super::protocol::{AnimatableProperty, AnimatedBindings, Binding, ValueKind};
use super::super::{AnimatedNode, SharedValues};
use super::{ValidationMemory, apply_animated_nodes};
use crate::protocol::animatable::AnimatableField;

/// Build bindings the way production does: decode a style carrying inline
/// `{ animated }` wrappers and derive (`crate::style_bindings`).
fn style_bindings(style: serde_json::Value) -> AnimatedBindings {
    let style: crate::protocol::style::Style =
        serde_json::from_value(style).expect("style decodes");
    crate::style_bindings::derive_bindings(Some(&style)).expect("style carries bindings")
}

/// Direct construction for the stage-4 chain tests: they pair bindings
/// with synthetic resolved chains at explicit wire indices — including
/// deliberately mismatched index/name combinations a real style can't
/// express (validation must warn and stay inert).
fn filter_bindings(entries: &[(u8, &str, Binding)]) -> AnimatedBindings {
    AnimatedBindings(
        entries
            .iter()
            .map(|(index, name, b)| {
                (
                    AnimatableProperty::FilterParam {
                        index: *index,
                        name: (*name).into(),
                    },
                    b.clone(),
                )
            })
            .collect(),
    )
}

/// The table-driven applier writes the transform translation, the interpolated
/// background color, and lets opacity own the final alpha — exactly the three
/// stages (transform → color → opacity) the per-field applier did.
#[test]
fn apply_writes_transform_color_then_opacity() {
    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    let mut values = SharedValues::default();
    values.set(1, 25.0); // translateX (px)
    values.set(2, 0.5); // opacity
    values.set(3, 0.0); // color progress → output[0] = red
    world.insert_resource(values);

    let bindings = style_bindings(serde_json::json!({
        "transform": { "translateX": { "animated": { "id": 1 } } },
        "opacity": { "animated": { "id": 2 } },
        "backgroundColor": { "animated": { "type": "interpolateColor", "id": 3,
            "input": [0, 1], "output": [[1, 0, 0, 1], [0, 0, 1, 1]] } },
    }));

    let e = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            BackgroundColor(Color::WHITE),
        ))
        .id();

    let mut schedule = Schedule::default();
    schedule.add_systems(apply_animated_nodes);
    schedule.run(&mut world);

    let t = world.entity(e).get::<UiTransform>().unwrap();
    assert_eq!(t.translation.x, Val::Px(25.0));

    // Color resolved to red, then opacity overwrote alpha to 0.5.
    let s = world
        .entity(e)
        .get::<BackgroundColor>()
        .unwrap()
        .0
        .to_srgba();
    assert!((s.red - 1.0).abs() < 1e-4);
    assert!(s.green.abs() < 1e-4);
    assert!(s.blue.abs() < 1e-4);
    assert!((s.alpha - 0.5).abs() < 1e-4, "opacity owns final alpha");
}

/// An animated `backgroundImage.tint` drives the `ImageNode.color` rgb
/// while opacity owns the final alpha (the stage-2 bake keeps the two
/// from ping-ponging), and a settled re-run leaves the component clean.
#[test]
fn apply_drives_background_image_tint_with_opacity() {
    use bevy::ui::widget::ImageNode;
    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    let mut values = SharedValues::default();
    values.set(1, 0.0); // tint progress → output[0] = red
    values.set(2, 0.5); // opacity
    world.insert_resource(values);

    let bindings = style_bindings(serde_json::json!({
        "backgroundImage": { "src": "bg.png", "tint": { "animated": {
            "type": "interpolateColor", "id": 1,
            "input": [0, 1], "output": [[1, 0, 0, 1], [0, 0, 1, 1]] } } },
        "opacity": { "animated": { "id": 2 } },
    }));
    let e = world
        .spawn((AnimatedNode(bindings), ImageNode::default()))
        .id();

    let mut schedule = Schedule::default();
    schedule.add_systems(apply_animated_nodes);
    schedule.run(&mut world);

    let s = world.entity(e).get::<ImageNode>().unwrap().color.to_srgba();
    assert!((s.red - 1.0).abs() < 1e-4, "tint rgb follows the binding");
    assert!(s.green.abs() < 1e-4);
    assert!(s.blue.abs() < 1e-4);
    assert!((s.alpha - 0.5).abs() < 1e-4, "opacity owns final alpha");

    // Settled: a second run with unchanged values must not dirty the
    // component (compare-before-write on both stages).
    let tick = world
        .entity(e)
        .get_ref::<ImageNode>()
        .unwrap()
        .last_changed();
    schedule.run(&mut world);
    assert_eq!(
        world
            .entity(e)
            .get_ref::<ImageNode>()
            .unwrap()
            .last_changed(),
        tick,
        "settled re-run leaves ImageNode untouched"
    );
}

/// The 2D `rotate` binding takes **degrees** on the wire (matching the
/// declarative `transform.rotate` position it lives in) and stores
/// radians in `UiTransform` — same contract as the `transform3d`
/// rotations.
#[test]
fn rotate_binding_converts_degrees_to_radians() {
    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    let mut values = SharedValues::default();
    values.set(1, 90.0); // degrees
    world.insert_resource(values);

    let bindings = style_bindings(serde_json::json!({
        "transform": { "rotate": { "animated": { "id": 1 } } },
    }));
    let e = world
        .spawn((AnimatedNode(bindings), UiTransform::default()))
        .id();

    let mut schedule = Schedule::default();
    schedule.add_systems(apply_animated_nodes);
    schedule.run(&mut world);

    let t = world.entity(e).get::<UiTransform>().unwrap();
    assert!(
        (t.rotation.as_radians() - std::f32::consts::FRAC_PI_2).abs() < 1e-5,
        "90° on the wire → π/2 stored, got {}",
        t.rotation.as_radians()
    );
}

/// A layout length lands on `Node` (as px); a `borderColor` binding inserts a
/// `BorderColor` on all sides when absent; and a re-render that resets `Node`
/// is corrected on the next apply (the compare-before-write re-applies because
/// the live value differs from the still-active binding's value).
#[test]
fn apply_drives_node_length_and_border_color() {
    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    let mut values = SharedValues::default();
    values.set(10, 200.0); // width (px)
    values.set(11, 0.0); // border-color progress → output[0] = green
    world.insert_resource(values);

    let bindings = style_bindings(serde_json::json!({
        "width": { "animated": { "id": 10 } },
        "borderColor": { "animated": { "type": "interpolateColor", "id": 11,
            "input": [0, 1], "output": [[0, 1, 0, 1], [1, 0, 0, 1]] } },
    }));

    let e = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            Node::default(),
        ))
        .id();

    let mut schedule = Schedule::default();
    schedule.add_systems(apply_animated_nodes);
    schedule.run(&mut world);

    assert_eq!(world.entity(e).get::<Node>().unwrap().width, Val::Px(200.0));
    let bc = world.entity(e).get::<BorderColor>().unwrap();
    let s = bc.top.to_srgba();
    assert!(
        s.green > 0.9 && s.red < 0.1,
        "border resolved to green, got {s:?}"
    );
    assert_eq!(bc.left, bc.top, "all four sides set uniformly");

    // A re-render resets the static width; the still-active binding re-applies.
    world.entity_mut(e).get_mut::<Node>().unwrap().width = Val::Px(100.0);
    schedule.run(&mut world);
    assert_eq!(
        world.entity(e).get::<Node>().unwrap().width,
        Val::Px(200.0),
        "binding re-applies after a re-render reset"
    );
}

/// [I1] A `backdropFilter[<i>].<param>` binding on a Node-carrying entity
/// belongs to stage 4 (resolved-chain writes) — stage 2 skips it
/// explicitly (table stage `Backdrop`): it never writes `Node`, never
/// marks it changed, and pushes no layer dirt. Pins the skip as intent —
/// it used to rely on the node-writer wildcard being inert.
#[test]
fn backdrop_param_binding_never_writes_node() {
    #[derive(Resource, Default)]
    struct NodeChanged(usize);

    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    world.init_resource::<NodeChanged>();
    let mut values = SharedValues::default();
    values.set(1, 300.0);
    world.insert_resource(values);

    let bindings = style_bindings(serde_json::json!({
        "backdropFilter": { "name": "blur",
            "params": { "radius": { "animated": { "id": 1 } } } },
    }));

    let e = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            Node::default(),
        ))
        .id();

    let mut schedule = Schedule::default();
    schedule.add_systems(
        (
            apply_animated_nodes,
            |q: Query<(), (Changed<Node>, With<AnimatedNode>)>, mut c: ResMut<NodeChanged>| {
                c.0 += q.iter().count();
            },
        )
            .chain(),
    );
    schedule.run(&mut world); // spawn itself reads as Changed — ignore
    world.resource_mut::<NodeChanged>().0 = 0;
    schedule.run(&mut world);

    assert_eq!(
        world.resource::<NodeChanged>().0,
        0,
        "backdrop binding must not touch Node change detection"
    );
    assert_eq!(
        world.entity(e).get::<Node>().unwrap().width,
        Val::Auto,
        "no Node field written"
    );
    let dirt = world.resource::<crate::layer::LayerContentDirt>();
    assert!(
        dirt.nodes.is_empty() && dirt.composite_only.is_empty(),
        "no dirt pushed for an inert backdrop binding"
    );
}

/// [I3] `ValidationMemory` semantics: first sight validates; a settled
/// stamp stays quiet; state drift under a settled memory re-stamps
/// without forcing validation to have run; and PRUNING an entity that
/// lost its bindings makes a later re-appearance validate (re-warn)
/// again — the bounded-map + re-warn contract both stages rely on.
#[test]
fn validation_memory_prunes_and_revalidates() {
    let mut world = World::new();
    let e = world.spawn_empty().id();

    let mut m = ValidationMemory::<(Option<u32>, Option<u32>)>::default();
    let v1 = (Some(1), None);
    assert!(m.should_validate(e, &v1), "first sight validates");
    m.stamp(e, true, &v1, v1);
    assert!(!m.should_validate(e, &v1), "settled stamp is quiet");

    // The stage's own version bump: stamped as post-state without
    // validation, so next frame reads settled (no re-warn churn).
    let v2 = (Some(2), None);
    m.stamp(e, false, &v1, v2);
    assert!(!m.should_validate(e, &v2), "own bump stamped, still quiet");

    // A real re-resolve (drift between frames) re-validates.
    assert!(m.should_validate(e, &(Some(9), None)), "drift re-validates");

    // Bindings removed → pruned → a re-appearance validates again.
    m.prune(&[]);
    assert!(m.should_validate(e, &v2), "pruned entity re-validates");

    // The `S = ()` degenerate form (stage 5): stamp-iff-validated.
    let mut s = ValidationMemory::<()>::default();
    assert!(s.should_validate(e, &()));
    s.stamp(e, true, &(), ());
    assert!(!s.should_validate(e, &()));
    s.prune(&[]);
    assert!(s.should_validate(e, &()), "pruned shape memory re-warns");
}

/// Once every bound shared value has settled, the apply system must stop
/// marking the target components changed — otherwise every `Animated.node`
/// keeps Bevy's transform propagation / render extraction hot forever.
#[test]
fn settled_apply_does_not_dirty_components() {
    #[derive(Resource, Default)]
    struct Dirty(usize);

    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    let mut values = SharedValues::default();
    values.set(1, 25.0); // translateX (px)
    values.set(2, 0.5); // opacity
    values.set(3, 0.0); // color progress
    world.insert_resource(values);
    world.init_resource::<Dirty>();

    let bindings = style_bindings(serde_json::json!({
        "transform": { "translateX": { "animated": { "id": 1 } } },
        "opacity": { "animated": { "id": 2 } },
        "backgroundColor": { "animated": { "type": "interpolateColor", "id": 3,
            "input": [0, 1], "output": [[1, 0, 0, 1], [0, 0, 1, 1]] } },
        "width": { "animated": { "id": 1 } },
    }));

    world.spawn((
        AnimatedNode(bindings),
        UiTransform::default(),
        BackgroundColor(Color::WHITE),
        Node::default(),
    ));

    type AnyTargetChanged = Or<(
        Changed<UiTransform>,
        Changed<BackgroundColor>,
        Changed<Node>,
    )>;

    let mut apply = Schedule::default();
    apply.add_systems(apply_animated_nodes);
    // A separate schedule so the detector's change ticks span exactly one
    // apply run (Changed<> is relative to the detector's own last run).
    let mut detect = Schedule::default();
    detect.add_systems(|q: Query<(), AnyTargetChanged>, mut dirty: ResMut<Dirty>| {
        dirty.0 = q.iter().count();
    });

    apply.run(&mut world);
    detect.run(&mut world);
    assert!(
        world.resource::<Dirty>().0 > 0,
        "first apply must write the bound components"
    );

    apply.run(&mut world);
    detect.run(&mut world);
    assert_eq!(
        world.resource::<Dirty>().0,
        0,
        "an apply with settled values must not dirty anything"
    );
}

// -- per-param filter bindings (stage 4) ---------------------------------

// -- transform3d bindings (stage 1b) -------------------------------------

/// `transform3d.<field>` bindings overwrite their field over the static
/// params (unbound fields untouched), convert rotation degrees to stored
/// radians, and settle without re-dirtying the component.
#[test]
fn transform3d_bindings_drive_layer_params() {
    use crate::layer::transform3d::LayerTransform3d;
    use crate::protocol::transform::Transform3d;

    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    let mut values = SharedValues::default();
    values.set(1, 90.0); // rotateY, degrees on the wire
    world.insert_resource(values);

    let bindings = style_bindings(serde_json::json!({
        "transform3d": { "rotateY": { "animated": { "id": 1 } } },
    }));
    assert!(bindings.has_transform3d());
    assert!(!bindings.has_transform(), "distinct from the 2D group");

    let static_params = Transform3d {
        perspective: Some(crate::protocol::animatable::Animatable::Static(500.0)),
        ..Default::default()
    };
    let e = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            LayerTransform3d(static_params),
        ))
        .id();

    let mut apply = Schedule::default();
    apply.add_systems(apply_animated_nodes);
    apply.run(&mut world);
    let t = world.entity(e).get::<LayerTransform3d>().unwrap().0.clone();
    assert_eq!(
        t.rotate_y.static_val().unwrap().radians(),
        std::f32::consts::FRAC_PI_2,
        "degrees on the wire, radians stored"
    );
    assert_eq!(
        t.perspective.static_val(),
        Some(500.0),
        "unbound fields keep the base"
    );

    // Settled value → no change-detection churn on re-apply.
    let tick_before = world.entity(e).get_ref::<LayerTransform3d>().unwrap();
    let last = tick_before.last_changed();
    apply.run(&mut world);
    let tick_after = world.entity(e).get_ref::<LayerTransform3d>().unwrap();
    assert_eq!(
        tick_after.last_changed(),
        last,
        "a settled binding must not re-mark the params changed"
    );
}

/// Mixed bindings decode and iterate deterministically: the `BTreeMap`
/// orders by variant declaration order, `FilterParam` last (by index,
/// then name).
#[test]
fn bindings_with_filter_params_iterate_deterministically() {
    use AnimatableProperty as P;
    let bindings = style_bindings(serde_json::json!({
        "filter": [
            { "name": "blur", "params": { "radius": { "animated": { "id": 2 } } } },
            { "name": "grayscale" },
            { "name": "custom", "params": { "b": { "animated": { "id": 1 } } } },
        ],
        "opacity": { "animated": { "id": 3 } },
        "transform": { "scale": { "animated": { "id": 4 } } },
    }));
    assert!(bindings.has_filter_params());
    assert!(bindings.has_transform());
    let keys: Vec<_> = bindings.iter().map(|(p, _)| p.clone()).collect();
    assert_eq!(
        keys,
        vec![
            P::Scale,
            P::Opacity,
            P::FilterParam {
                index: 0,
                name: "radius".into()
            },
            P::FilterParam {
                index: 2,
                name: "b".into()
            },
        ]
    );
}

fn slot(
    name: &'static str,
    kind: ValueKind,
    vec: usize,
    comp: usize,
    len: usize,
) -> crate::filters::ParamSlot {
    crate::filters::ParamSlot {
        name,
        kind,
        vec,
        comp,
        len,
    }
}

fn pass(
    wire_index: u8,
    params: Vec<Vec4>,
    layout: Vec<crate::filters::ParamSlot>,
) -> crate::filters::ResolvedFilterPass {
    crate::filters::ResolvedFilterPass {
        shader: Handle::default(),
        params,
        layout: std::sync::Arc::from(layout),
        wire_index,
    }
}

fn chain(
    passes: Vec<crate::filters::ResolvedFilterPass>,
    scale: f32,
) -> crate::filters::ResolvedFilterChain {
    crate::filters::ResolvedFilterChain {
        passes,
        outset_px: 0,
        always_dirty: false,
        version: 1,
        scale,
    }
}

fn filter_world(value: f32) -> (World, Schedule) {
    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    let mut values = SharedValues::default();
    values.set(1, value);
    world.insert_resource(values);
    let mut schedule = Schedule::default();
    schedule.add_systems(apply_animated_nodes);
    (world, schedule)
}

fn drain_dirt(world: &mut World) {
    let mut dirt = world.resource_mut::<crate::layer::LayerContentDirt>();
    dirt.nodes.clear();
    dirt.composite_only.clear();
}

/// A bound scalar param follows the shared value: the packed component
/// updates, the version bumps once per changed frame, dirt is
/// composite-only (never capture), and a settled value goes quiet. A
/// mid-animation chain rebuild (the resolver snapping the params back)
/// is re-asserted on the next apply — the scar-test mechanism.
#[test]
fn filter_param_binding_drives_scalar_slot_composite_only() {
    let (mut world, mut schedule) = filter_world(0.25);
    let bindings = filter_bindings(&[(0, "amount", Binding::Shared { id: 1 })]);
    let e = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            chain(
                vec![pass(
                    0,
                    vec![Vec4::new(1.0, 0.0, 0.0, 0.0)],
                    vec![slot("amount", ValueKind::Scalar, 0, 0, 1)],
                )],
                1.0,
            ),
        ))
        .id();

    schedule.run(&mut world);
    {
        let c = world
            .entity(e)
            .get::<crate::filters::ResolvedFilterChain>()
            .unwrap();
        assert_eq!(c.passes[0].params[0].x, 0.25, "param follows the value");
        assert_eq!(c.version, 2, "one bump per changed frame");
    }
    let dirt = world.resource::<crate::layer::LayerContentDirt>();
    assert_eq!(dirt.composite_only, vec![e], "composite-only dirt");
    assert!(dirt.nodes.is_empty(), "the capture is never dirtied");

    // Settled: no version churn, no dirt.
    drain_dirt(&mut world);
    schedule.run(&mut world);
    {
        let c = world
            .entity(e)
            .get::<crate::filters::ResolvedFilterChain>()
            .unwrap();
        assert_eq!(c.version, 2, "settled value is version-quiet");
    }
    let dirt = world.resource::<crate::layer::LayerContentDirt>();
    assert!(dirt.composite_only.is_empty() && dirt.nodes.is_empty());

    // A re-resolve snapped the param back to the static style: the
    // binding re-asserts on the next apply.
    {
        let mut em = world.entity_mut(e);
        let mut c = em.get_mut::<crate::filters::ResolvedFilterChain>().unwrap();
        c.passes[0].params[0].x = 1.0;
        c.version = c.version.wrapping_add(1); // 3
    }
    schedule.run(&mut world);
    let c = world
        .entity(e)
        .get::<crate::filters::ResolvedFilterChain>()
        .unwrap();
    assert_eq!(c.passes[0].params[0].x, 0.25, "binding re-asserts");
    assert_eq!(c.version, 4);
}

/// A binding addresses a WIRE chain position: every resolved pass with
/// that `wire_index` gets the write (blur's H+V), other positions stay
/// untouched; `Length` slots are applied as logical px × the chain's
/// scale (the resolver's physical-px rewrite).
#[test]
fn filter_param_binding_routes_wire_index_and_scales_lengths() {
    let (mut world, mut schedule) = filter_world(5.0);
    let bindings = filter_bindings(&[(0, "radius", Binding::Shared { id: 1 })]);
    let radius_layout = || vec![slot("radius", ValueKind::Length, 0, 0, 1)];
    let e = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            chain(
                vec![
                    pass(0, vec![Vec4::new(20.0, 1.0, 0.0, 0.0)], radius_layout()),
                    pass(0, vec![Vec4::new(20.0, 0.0, 1.0, 0.0)], radius_layout()),
                    pass(1, vec![Vec4::new(20.0, 0.0, 0.0, 0.0)], radius_layout()),
                ],
                2.0,
            ),
        ))
        .id();

    schedule.run(&mut world);
    let c = world
        .entity(e)
        .get::<crate::filters::ResolvedFilterChain>()
        .unwrap();
    assert_eq!(c.passes[0].params[0].x, 10.0, "H pass: 5 logical × 2");
    assert_eq!(c.passes[1].params[0].x, 10.0, "V pass too");
    assert_eq!(c.passes[0].params[0].y, 1.0, "direction untouched");
    assert_eq!(c.passes[2].params[0].x, 20.0, "other wire entry untouched");
}

/// `Angle` slots take the bound value in DEGREES (the param's wire unit)
/// and pack radians; `Color` slots take an `interpolateColor` binding and
/// write all four components.
#[test]
fn filter_param_binding_converts_angle_and_writes_color() {
    let (mut world, mut schedule) = filter_world(90.0);
    world.resource_mut::<SharedValues>().set(2, 0.0);
    let bindings = filter_bindings(&[
        (0, "angle", Binding::Shared { id: 1 }),
        (
            0,
            "tint",
            Binding::InterpolateColor {
                id: 2,
                input: vec![0.0, 1.0],
                output: vec![[1.0, 0.0, 0.0, 1.0], [0.0, 0.0, 1.0, 1.0]],
            },
        ),
    ]);
    let e = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            chain(
                vec![pass(
                    0,
                    vec![Vec4::ZERO, Vec4::ZERO],
                    vec![
                        slot("angle", ValueKind::Angle, 0, 0, 1),
                        slot("tint", ValueKind::Color, 1, 0, 4),
                    ],
                )],
                1.0,
            ),
        ))
        .id();

    schedule.run(&mut world);
    let c = world
        .entity(e)
        .get::<crate::filters::ResolvedFilterChain>()
        .unwrap();
    assert!(
        (c.passes[0].params[0].x - std::f32::consts::FRAC_PI_2).abs() < 1e-6,
        "90° packs as π/2 radians, got {}",
        c.passes[0].params[0].x
    );
    assert_eq!(
        c.passes[0].params[1],
        Vec4::new(1.0, 0.0, 0.0, 1.0),
        "color slot takes all four components"
    );
}

/// Bind-time validation: an unknown param name, an out-of-range index, a
/// multi-component scalar slot, and a missing chain each warn
/// (`filterBinding`, attributed to the node) exactly once — not per frame
/// — and the binding stays inert. A chain re-resolve re-validates.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn filter_param_validation_warns_once_and_stays_inert() {
    let _lock = crate::diag::test_lock();
    crate::diag::arm_runtime();
    let _ = crate::diag::take_runtime_warnings();

    let (mut world, mut schedule) = filter_world(1.0);
    let bindings = filter_bindings(&[
        (0, "nope", Binding::Shared { id: 1 }),
        (3, "amount", Binding::Shared { id: 1 }),
        (0, "dir", Binding::Shared { id: 1 }),
    ]);
    let e = world
        .spawn((
            AnimatedNode(bindings.clone()),
            UiTransform::default(),
            crate::bridge::ReactNode(9),
            chain(
                vec![pass(
                    0,
                    vec![Vec4::new(0.5, 0.0, 0.0, 0.0)],
                    vec![
                        slot("amount", ValueKind::Scalar, 0, 0, 1),
                        slot("dir", ValueKind::Scalar, 0, 1, 2),
                    ],
                )],
                1.0,
            ),
        ))
        .id();

    schedule.run(&mut world);
    {
        let c = world
            .entity(e)
            .get::<crate::filters::ResolvedFilterChain>()
            .unwrap();
        assert_eq!(
            c.passes[0].params[0],
            Vec4::new(0.5, 0.0, 0.0, 0.0),
            "inert"
        );
        assert_eq!(c.version, 1, "no version churn from inert bindings");
    }
    let warns = crate::diag::take_runtime_warnings();
    let mine: Vec<_> = warns.iter().filter(|w| w.node == Some(9)).collect();
    assert_eq!(mine.len(), 3, "{warns:?}");
    assert!(mine.iter().all(|w| w.kind == "filterBinding"));
    let values: Vec<_> = mine.iter().map(|w| w.value.as_str()).collect();
    assert!(values.contains(&"filter[0].nope"), "{values:?}");
    assert!(values.contains(&"filter[3].amount"), "{values:?}");
    assert!(values.contains(&"filter[0].dir"), "{values:?}");

    // Steady state: no re-warn.
    schedule.run(&mut world);
    assert!(
        crate::diag::take_runtime_warnings()
            .iter()
            .all(|w| w.node != Some(9)),
        "validation warnings must not repeat per frame"
    );

    // A chain re-resolve (version bump) re-validates.
    world
        .entity_mut(e)
        .get_mut::<crate::filters::ResolvedFilterChain>()
        .unwrap()
        .version = 7;
    schedule.run(&mut world);
    let refires = crate::diag::take_runtime_warnings()
        .iter()
        .filter(|w| w.node == Some(9))
        .count();
    assert_eq!(refires, 3, "a re-resolved chain re-validates");

    // No chain at all: one warn per filter binding, still inert.
    let e2 = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            crate::bridge::ReactNode(10),
        ))
        .id();
    schedule.run(&mut world);
    let chainless = crate::diag::take_runtime_warnings()
        .iter()
        .filter(|w| w.node == Some(10))
        .count();
    assert_eq!(chainless, 3, "chainless node warns per binding");
    assert!(
        world
            .entity(e2)
            .get::<crate::filters::ResolvedFilterChain>()
            .is_none()
    );

    // Mixed: a VALID binding actively animating (the shared value changes
    // every frame, so stage 4 itself bumps the chain `version` every
    // frame) next to an invalid binding on the same node. The validation
    // stamp stores the POST-write version, so stage 4's own bump never
    // reads as a re-resolve — the invalid binding warns exactly once, not
    // once per animated frame.
    let mixed = filter_bindings(&[
        (0, "amount", Binding::Shared { id: 1 }),
        (0, "nope", Binding::Shared { id: 1 }),
    ]);
    let e3 = world
        .spawn((
            AnimatedNode(mixed),
            UiTransform::default(),
            crate::bridge::ReactNode(11),
            chain(
                vec![pass(
                    0,
                    vec![Vec4::ZERO],
                    vec![slot("amount", ValueKind::Scalar, 0, 0, 1)],
                )],
                1.0,
            ),
        ))
        .id();
    for (frame, v) in [0.1f32, 0.2, 0.3, 0.4].into_iter().enumerate() {
        world.resource_mut::<SharedValues>().set(1, v);
        schedule.run(&mut world);
        let version = world
            .entity(e3)
            .get::<crate::filters::ResolvedFilterChain>()
            .unwrap()
            .version;
        assert_eq!(
            version as usize,
            2 + frame,
            "the valid binding writes (bumps version) every animated frame"
        );
    }
    let warns = crate::diag::take_runtime_warnings();
    let mine: Vec<_> = warns.iter().filter(|w| w.node == Some(11)).collect();
    assert_eq!(
        mine.len(),
        1,
        "an animating valid binding must not re-warn the invalid one per frame: {warns:?}"
    );
    assert_eq!(mine[0].value, "filter[0].nope");
}

// -- gradient-leaf bindings (stage 6) ------------------------------------

/// A bound linear `angle` (degrees on the wire) drives the folded
/// `BackgroundGradient` component per frame through the real pipeline:
/// the component's angle follows in RADIANS while the static stops keep
/// their style values, each change frame is content dirt, and a settled
/// value writes nothing (compare-before-write).
#[test]
fn gradient_angle_binding_drives_per_frame() {
    use crate::filters::test_util::{create, drain_dirt, entity_of, tick};
    use bevy::ui::{BackgroundGradient, Gradient, Val};
    use serde_json::json;

    let (mut app, ops_tx, anim_tx) = crate::filters::test_util::anim_app();
    anim_tx
        .send(crate::animations::AnimationCommand::Set {
            id: 1,
            value: 90.0, // degrees on the wire
        })
        .unwrap();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": { "backgroundGradient": {
                "type": "linear",
                "angle": { "animated": { "id": 1 }, "seed": 0 },
                "stops": [
                    { "color": "#ff0000", "position": 0 },
                    { "color": "#0000ff", "position": "100%" },
                ],
            } } }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);
    {
        let bg = &app.world().get::<BackgroundGradient>(e).unwrap().0;
        let Gradient::Linear(l) = &bg[0] else {
            panic!("expected linear, got {:?}", bg[0]);
        };
        assert!(
            (l.angle - std::f32::consts::FRAC_PI_2).abs() < 1e-5,
            "90° on the wire → π/2 stored, got {}",
            l.angle
        );
        // Static stops keep their style values (no opacity styled → no fold).
        let s0 = l.stops[0].color.to_srgba();
        assert!(s0.red > 0.99 && s0.blue < 0.01 && (s0.alpha - 1.0).abs() < 1e-5);
        assert_eq!(l.stops[0].point, Val::Px(0.0));
        assert_eq!(l.stops[1].point, Val::Percent(100.0));
    }

    // A value change: the component follows, and the change is content dirt.
    drain_dirt(&mut app);
    anim_tx
        .send(crate::animations::AnimationCommand::Set { id: 1, value: 45.0 })
        .unwrap();
    tick(&mut app, 0.016);
    {
        let bg = &app.world().get::<BackgroundGradient>(e).unwrap().0;
        let Gradient::Linear(l) = &bg[0] else {
            panic!("expected linear");
        };
        assert!((l.angle - std::f32::consts::FRAC_PI_4).abs() < 1e-5);
    }
    let dirt = app.world().resource::<crate::layer::LayerContentDirt>();
    assert!(dirt.nodes.contains(&e), "gradient write is content dirt");

    // Settled: a tick with an unchanged value writes nothing.
    drain_dirt(&mut app);
    let before = app
        .world()
        .entity(e)
        .get_ref::<BackgroundGradient>()
        .unwrap()
        .last_changed();
    tick(&mut app, 0.016);
    assert_eq!(
        app.world()
            .entity(e)
            .get_ref::<BackgroundGradient>()
            .unwrap()
            .last_changed(),
        before,
        "a settled binding must not re-mark the component changed"
    );
    let dirt = app.world().resource::<crate::layer::LayerContentDirt>();
    assert!(!dirt.nodes.contains(&e), "settled: no dirt");
    assert!(!dirt.composite_only.contains(&e), "settled: no dirt");
}

/// A bound stop color (`interpolateColor`) on a node with a static
/// `opacity: 0.5` (childless — unpromoted): the written stop alpha is the
/// binding's alpha × the style opacity (the stamp's static fold).
#[test]
fn gradient_stop_color_binding_folds_opacity() {
    use crate::filters::test_util::{create, entity_of};
    use bevy::ui::{BackgroundGradient, Gradient};
    use serde_json::json;

    let (mut app, ops_tx, anim_tx) = crate::filters::test_util::anim_app();
    anim_tx
        .send(crate::animations::AnimationCommand::Set { id: 1, value: 1.0 })
        .unwrap();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": {
                "opacity": 0.5,
                "backgroundGradient": {
                    "type": "linear",
                    "stops": [
                        { "color": { "animated": { "type": "interpolateColor", "id": 1,
                            "input": [0, 1],
                            "output": [[1, 0, 0, 1], [0, 0, 1, 1]] },
                            "seed": "#ffffff" },
                          "position": 0 },
                        { "color": "#000000", "position": "100%" },
                    ],
                },
            } }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);
    let bg = &app.world().get::<BackgroundGradient>(e).unwrap().0;
    let Gradient::Linear(l) = &bg[0] else {
        panic!("expected linear, got {:?}", bg[0]);
    };
    let s0 = l.stops[0].color.to_srgba();
    assert!(
        s0.blue > 0.99 && s0.red < 0.01,
        "the binding resolved to blue: {s0:?}"
    );
    assert!(
        (s0.alpha - 0.5).abs() < 1e-5,
        "binding alpha 1.0 × opacity 0.5 = 0.5, got {}",
        s0.alpha
    );
    // The static stop is folded too (the stamp's static fold).
    let s1 = l.stops[1].color.to_srgba();
    assert!((s1.alpha - 0.5).abs() < 1e-5, "static stop folds: {s1:?}");
}

/// Any gradient binding parks that surface's transition channel: a style
/// retarget of the static stops with `transition: { backgroundGradient }`
/// must NOT ease — the component reflects the new statics + the driven
/// angle the same frame, with no intermediate colors on later ticks.
#[test]
fn gradient_binding_parks_transition_channel() {
    use crate::filters::test_util::{create, entity_of, tick, update};
    use bevy::ui::{BackgroundGradient, Gradient};
    use serde_json::json;

    let gradient = |color: &str| {
        json!({
            "type": "linear",
            "angle": { "animated": { "id": 1 }, "seed": 0 },
            "stops": [
                { "color": color, "position": 0 },
                { "color": color, "position": "100%" },
            ],
        })
    };
    let (mut app, ops_tx, anim_tx) = crate::filters::test_util::anim_app();
    anim_tx
        .send(crate::animations::AnimationCommand::Set { id: 1, value: 90.0 })
        .unwrap();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": {
                "backgroundGradient": gradient("#ff0000"),
                "transition": { "backgroundGradient": { "duration": 1000, "easing": "linear" } },
            } }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);

    // Retarget the statics to blue: must land the same frame, un-eased,
    // with the driven angle re-asserted on top.
    ops_tx
        .send(vec![update(
            1,
            json!({ "style": { "backgroundGradient": gradient("#0000ff") } }),
            &[],
        )])
        .unwrap();
    let assert_blue_driven = |app: &bevy::app::App, when: &str| {
        let bg = &app.world().get::<BackgroundGradient>(e).unwrap().0;
        let Gradient::Linear(l) = &bg[0] else {
            panic!("expected linear, got {:?}", bg[0]);
        };
        for s in &l.stops {
            let c = s.color.to_srgba();
            assert!(
                c.blue > 0.99 && c.red < 0.01 && (c.alpha - 1.0).abs() < 1e-5,
                "{when}: parked channel must not ease — expected exact blue, got {c:?}"
            );
        }
        assert!(
            (l.angle - std::f32::consts::FRAC_PI_2).abs() < 1e-5,
            "{when}: the driven angle re-asserts over the snap, got {}",
            l.angle
        );
    };
    tick(&mut app, 0.1);
    assert_blue_driven(&app, "retarget frame");
    // Later ticks (mid-"ease" window): still exact — nothing is animating.
    tick(&mut app, 0.3);
    assert_blue_driven(&app, "later tick");
}

/// The defensive validation paths (unreachable through the op path, where
/// bindings and stamp derive from the same merged style): an index beyond
/// the stamped list, a stop index beyond the stops, a leaf-kind miss
/// (ShapeX on a linear), and a bound surface with no stamp at all each
/// warn (`gradientBinding`, attributed) exactly once per restamp — never
/// per frame — and stay inert.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn gradient_binding_out_of_range_warns_once() {
    use super::super::protocol::GradientLeaf;
    use bevy::ui::{BackgroundGradient, ColorStop, Gradient, LinearGradient, Val};

    let _lock = crate::diag::test_lock();
    crate::diag::arm_runtime();
    let _ = crate::diag::take_runtime_warnings();

    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    let mut values = SharedValues::default();
    values.set(1, 5.0);
    world.insert_resource(values);

    let list = vec![Gradient::Linear(LinearGradient {
        color_space: default(),
        angle: 0.0,
        stops: vec![
            ColorStop {
                color: Color::WHITE,
                point: Val::Px(0.0),
                hint: 0.5,
            },
            ColorStop {
                color: Color::BLACK,
                point: Val::Px(100.0),
                hint: 0.5,
            },
        ],
    })];
    let bindings = AnimatedBindings(
        [
            // Index beyond the 1-entry stamped list.
            (
                AnimatableProperty::BackgroundGradientParam {
                    index: 3,
                    leaf: GradientLeaf::Angle,
                },
                Binding::Shared { id: 1 },
            ),
            // Stop index beyond the 2 stops.
            (
                AnimatableProperty::BackgroundGradientParam {
                    index: 0,
                    leaf: GradientLeaf::StopColor(9),
                },
                Binding::InterpolateColor {
                    id: 1,
                    input: vec![0.0, 1.0],
                    output: vec![[1.0, 0.0, 0.0, 1.0], [0.0, 0.0, 1.0, 1.0]],
                },
            ),
            // Leaf-kind miss: a shape radius on a linear gradient.
            (
                AnimatableProperty::BackgroundGradientParam {
                    index: 0,
                    leaf: GradientLeaf::ShapeX,
                },
                Binding::Shared { id: 1 },
            ),
            // A bound surface with no stamp (no borderGradient style).
            (
                AnimatableProperty::BorderGradientParam {
                    index: 0,
                    leaf: GradientLeaf::Angle,
                },
                Binding::Shared { id: 1 },
            ),
        ]
        .into_iter()
        .collect(),
    );
    let e = world
        .spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            crate::bridge::ReactNode(7),
            crate::ui_map::GradientTargets {
                background: Some(list.clone()),
                border: None,
                opacity: None,
            },
            BackgroundGradient(list.clone()),
        ))
        .id();

    let mut schedule = Schedule::default();
    schedule.add_systems(apply_animated_nodes);
    schedule.run(&mut world);

    let warns = crate::diag::take_runtime_warnings();
    let mine: Vec<_> = warns.iter().filter(|w| w.node == Some(7)).collect();
    assert_eq!(mine.len(), 4, "{warns:?}");
    assert!(mine.iter().all(|w| w.kind == "gradientBinding"));
    let values: Vec<_> = mine.iter().map(|w| w.value.as_str()).collect();
    assert!(
        values.contains(&"backgroundGradient[3].angle"),
        "{values:?}"
    );
    assert!(
        values.contains(&"backgroundGradient[0].stops[9].color"),
        "{values:?}"
    );
    assert!(
        values.contains(&"backgroundGradient[0].shape.x"),
        "{values:?}"
    );
    assert!(values.contains(&"borderGradient[0].angle"), "{values:?}");

    // All bindings inert: component untouched, no dirt.
    assert_eq!(
        world.entity(e).get::<BackgroundGradient>().unwrap().0,
        list,
        "invalid bindings never write"
    );
    let dirt = world.resource::<crate::layer::LayerContentDirt>();
    assert!(dirt.nodes.is_empty() && dirt.composite_only.is_empty());

    // Steady state: no re-warn.
    schedule.run(&mut world);
    assert!(
        crate::diag::take_runtime_warnings()
            .iter()
            .all(|w| w.node != Some(7)),
        "validation warnings must not repeat per frame"
    );

    // A restamp re-validates.
    let restamped = world.entity(e).get::<AnimatedNode>().unwrap().0.clone();
    world.entity_mut(e).insert(AnimatedNode(restamped));
    schedule.run(&mut world);
    let refires = crate::diag::take_runtime_warnings()
        .iter()
        .filter(|w| w.node == Some(7))
        .count();
    assert_eq!(refires, 4, "a bindings restamp re-validates");
}
