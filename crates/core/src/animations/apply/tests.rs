//! The apply engine's unit tests — stage order, dirt discipline, node/color
//! writes, filter-param routing + validation. Moved verbatim from the
//! engine's test module (assertions untouched).
use bevy::prelude::*;
use bevy::ui::UiTransform;

use super::super::protocol::{AnimatableProperty, AnimatedBindings, Binding, ValueKind};
use super::super::{AnimatedNode, SharedValues};
use super::{ValidationMemory, apply_animated_nodes};
use crate::protocol::AnimatableField;

/// Build bindings the way production does: decode a style carrying inline
/// `{ animated }` wrappers and derive (`crate::style_bindings`).
fn style_bindings(style: serde_json::Value) -> AnimatedBindings {
    let style: crate::protocol::Style = serde_json::from_value(style).expect("style decodes");
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
    use crate::protocol::Transform3d;

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
        perspective: Some(crate::protocol::Animatable::Static(500.0)),
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
            crate::bridge::RNode(9),
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
            crate::bridge::RNode(10),
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
            crate::bridge::RNode(11),
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
