//! The crate's tests: the scaling math, the attribute decode, the
//! positioning system, and the element through the real op path.

use crate::element::anchored;
use crate::position::distance_scale;
use crate::{AnchorScaling, ENTITY, OFFSET, SCALE};
use bevy::math::Vec3;

fn scaling(min: f32, max: f32, factor: f32, base_distance: f32) -> AnchorScaling {
    AnchorScaling {
        min,
        max,
        factor,
        base_distance,
    }
}

/// Reversed bounds would panic `f32::clamp` every frame; `sanitized` swaps
/// them instead.
#[test]
fn sanitize_swaps_reversed_bounds() {
    let s = scaling(2.0, 0.4, 1.0, 24.0).sanitized().expect("kept");
    assert_eq!((s.min, s.max), (0.4, 2.0));
    // An already-valid config passes through unchanged.
    let s = scaling(0.4, 2.0, 1.0, 24.0).sanitized().expect("kept");
    assert_eq!((s.min, s.max), (0.4, 2.0));
}

/// Any non-finite field disables scaling entirely (NaN bounds would panic
/// `f32::clamp`; a NaN factor/base_distance would produce a NaN scale).
#[test]
fn sanitize_rejects_non_finite_fields() {
    for bad in [
        scaling(f32::NAN, 2.0, 1.0, 24.0),
        scaling(0.4, f32::NAN, 1.0, 24.0),
        scaling(0.4, 2.0, f32::NAN, 24.0),
        scaling(0.4, 2.0, 1.0, f32::NAN),
        scaling(0.4, f32::INFINITY, 1.0, 24.0),
    ] {
        assert!(bad.sanitized().is_none(), "kept {bad:?}");
    }
}

/// `dist == 0` (camera exactly on the anchor) must stay finite: the `inf`
/// ratio pins to `max`, including the `factor == 0` case whose `0 * inf`
/// product is NaN.
#[test]
fn distance_scale_is_finite_at_zero_distance() {
    let c = scaling(0.4, 2.0, 1.0, 24.0);
    assert_eq!(distance_scale(&c, 0.0), 2.0);
    let flat = scaling(0.4, 2.0, 0.0, 24.0);
    assert_eq!(distance_scale(&flat, 0.0), 2.0);
    // Normal case: at exactly base_distance the scale is 1.
    assert_eq!(distance_scale(&c, 24.0), 1.0);
}

#[test]
fn props_deserialize_anchor_attributes() {
    install_registry();
    // entity bits 2^32 + 1 = index 1, generation 1 (a realistic value).
    let props = bevy_react_core::protocol::props::Props::decode_for(
        "anchor",
        serde_json::json!({
            "entity": 4294967297u64,
            "offset": [0.0, 1.0, 0.0],
            "scale": { "min": 0.4, "max": 2.0, "factor": 1.0, "baseDistance": 24.0 }
        }),
    );
    let bits = props.attrs.get(&ENTITY).expect("entity present");
    assert_eq!(*bits as u64, 4_294_967_297);
    assert_eq!(props.attrs.get(&OFFSET), Some(&[0.0, 1.0, 0.0]));
    let scale = props.attrs.get(&SCALE).expect("scale present");
    assert_eq!(
        (scale.min, scale.max, scale.factor, scale.base_distance),
        (0.4, 2.0, 1.0, 24.0)
    );
    let bound = anchored(&props.attrs);
    assert_eq!(bound.target.to_bits(), 4_294_967_297);
    assert_eq!(bound.offset, Vec3::new(0.0, 1.0, 0.0));
}

#[test]
fn anchor_offset_defaults_to_zero() {
    install_registry();
    let props = bevy_react_core::protocol::props::Props::decode_for(
        "anchor",
        serde_json::json!({ "entity": 1u64 }),
    );
    assert!(props.attrs.get(&OFFSET).is_none());
    assert_eq!(anchored(&props.attrs).offset, Vec3::ZERO);
}

#[test]
fn anchored_node_is_reparented_under_the_layer() {
    use crate::{AnchorLayer, Anchored, position_anchored_nodes};
    use bevy::ecs::system::RunSystemOnce;
    use bevy::prelude::*;
    use bevy::ui::{ComputedNode, IsDefaultUiCamera, UiGlobalTransform};

    let mut world = World::new();

    // A default UI camera so the system gets past its camera guard.
    world.spawn((
        Camera::default(),
        GlobalTransform::default(),
        IsDefaultUiCamera,
    ));

    // The shared overlay layer (carries the components the layer query reads).
    let layer = world
        .spawn((
            AnchorLayer,
            ComputedNode::default(),
            UiGlobalTransform::default(),
        ))
        .id();

    // Some unrelated container the overlay was "declared" under in the React tree.
    let other_parent = world.spawn(Node::default()).id();

    // An anchored node parented under `other_parent` (not the layer). It has no
    // `ComputedNode`, so it stays hidden — but the reparent runs first regardless.
    let target = world.spawn(GlobalTransform::default()).id();
    let badge = world
        .spawn((
            Node::default(),
            Anchored {
                target,
                offset: Vec3::ZERO,
                scale: None,
            },
            ChildOf(other_parent),
        ))
        .id();

    world.run_system_once(position_anchored_nodes).unwrap();

    assert_eq!(
        world.entity(badge).get::<ChildOf>().map(|c| c.parent()),
        Some(layer),
        "an anchored node must be reparented under the anchor layer"
    );
}

/// An anchored overlay moves via `UiTransform.translation` — never
/// `Node.left/top`, which are taffy inputs. A moving target (the every-frame
/// case while the camera orbits) must not tick `Changed<Node>` (a relayout)
/// after the one-time seed, and a static frame must tick neither.
#[test]
fn anchored_move_never_ticks_node() {
    use crate::{AnchorLayer, Anchored, position_anchored_nodes};
    use bevy::camera::{ComputedCameraValues, RenderTargetInfo};
    use bevy::ecs::schedule::Schedule;
    use bevy::prelude::*;
    use bevy::ui::{ComputedNode, IsDefaultUiCamera, UiGlobalTransform, UiTransform, Val2};

    #[derive(Resource, Default)]
    struct Probe {
        node: usize,
        transform: usize,
    }

    // A camera whose projection + target info are hand-built so
    // `world_to_viewport` works headless; the expected positions below are
    // computed with the very same method the system uses.
    let camera = Camera {
        computed: ComputedCameraValues {
            clip_from_view: Mat4::perspective_infinite_reverse_rh(
                std::f32::consts::FRAC_PI_4,
                1.0,
                0.1,
            ),
            target_info: Some(RenderTargetInfo {
                physical_size: UVec2::new(1000, 1000),
                scale_factor: 1.0,
            }),
            ..Default::default()
        },
        ..Default::default()
    };
    let cam_tf = GlobalTransform::default(); // at origin, looking -Z
    let half = Vec2::new(10.0, 5.0); // badge is 20x10 at scale factor 1
    let expected = |world_pos: Vec3| {
        let viewport = camera
            .world_to_viewport(&cam_tf, world_pos)
            .expect("test points are in front of the camera");
        Val2::px(viewport.x - half.x, viewport.y - half.y)
    };

    let mut world = World::new();
    world.init_resource::<Probe>();
    world.spawn((camera.clone(), cam_tf, IsDefaultUiCamera));
    let layer = world
        .spawn((
            AnchorLayer,
            ComputedNode::default(),
            UiGlobalTransform::default(),
        ))
        .id();
    let pos_a = Vec3::new(0.0, 0.0, -10.0);
    let target = world.spawn(GlobalTransform::from_translation(pos_a)).id();
    let badge = world
        .spawn((
            Node::default(),
            ComputedNode {
                size: Vec2::new(20.0, 10.0),
                inverse_scale_factor: 1.0,
                ..Default::default()
            },
            UiGlobalTransform::default(),
            Anchored {
                target,
                offset: Vec3::ZERO,
                scale: None,
            },
            ChildOf(layer),
        ))
        .id();

    let mut apply = Schedule::default();
    apply.add_systems(position_anchored_nodes);
    // A separate detect schedule so each `Changed` filter spans exactly one
    // apply run.
    let mut detect = Schedule::default();
    detect.add_systems(
        |nodes: Query<(), (Changed<Node>, With<Anchored>)>,
         transforms: Query<(), (Changed<UiTransform>, With<Anchored>)>,
         mut probe: ResMut<Probe>| {
            probe.node += nodes.iter().count();
            probe.transform += transforms.iter().count();
        },
    );

    // Frame 1: the seed writes Node (absolute at the layer origin) and the
    // first translation. Burn the spawn's Changed ticks with it.
    apply.run(&mut world);
    detect.run(&mut world);
    assert_eq!(
        world
            .entity(badge)
            .get::<UiTransform>()
            .unwrap()
            .translation,
        expected(pos_a),
        "the projected position lands in the transform translation"
    );
    assert_eq!(
        world.entity(badge).get::<Visibility>(),
        Some(&Visibility::Inherited),
        "an on-screen anchor is visible"
    );

    // Frame 2: the target moves (simulated orbit). The overlay must follow
    // via the transform alone — no Node tick, no relayout.
    *world.resource_mut::<Probe>() = Probe::default();
    let pos_b = Vec3::new(2.0, 1.0, -10.0);
    world
        .entity_mut(target)
        .insert(GlobalTransform::from_translation(pos_b));
    apply.run(&mut world);
    detect.run(&mut world);
    let probe = world.resource::<Probe>();
    assert_eq!(
        (probe.node, probe.transform),
        (0, 1),
        "a moving anchor must ride the transform, never Node (a relayout)"
    );
    assert_eq!(
        world
            .entity(badge)
            .get::<UiTransform>()
            .unwrap()
            .translation,
        expected(pos_b),
        "the overlay follows the moved target"
    );

    // Frame 3: everything static — fully settled, neither component ticks.
    *world.resource_mut::<Probe>() = Probe::default();
    apply.run(&mut world);
    detect.run(&mut world);
    let probe = world.resource::<Probe>();
    assert_eq!(
        (probe.node, probe.transform),
        (0, 0),
        "a static anchor must tick neither Node nor UiTransform"
    );
}

/// Install a decode scope holding the core's registrations plus this crate's
/// element, for the bare-props decodes above.
fn install_registry() {
    use bevy_react_core::ReactAppExt;
    let mut app = bevy::app::App::new();
    bevy_react_core::style::add_core_styles(&mut app);
    app.add_react_elements(bevy_react_core::elements::CORE_ELEMENTS);
    crate::register_bindings(&mut app);
    bevy_react_core::ext::set_thread_registry(std::sync::Arc::new(
        bevy_react_core::ext::ExtRegistry::from_app(&app),
    ));
}

mod op_path {
    use bevy::prelude::*;
    use bevy_react_core::protocol::ROOT_ID;
    use bevy_react_core::protocol::op::Op;
    use bevy_react_core::protocol::props::Props;
    use bevy_react_core::test_util::{
        JsBridge, children_of, create, create_node, ent, op_app_with, update, update_delta,
    };

    use crate::{AnchorLayer, Anchored};

    fn app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
        op_app_with(crate::register_bindings)
    }

    /// An `<anchor>` is a detached element: its `entity`/`offset`/`scale`
    /// attributes stamp an [`Anchored`] binding, a delta rebinds it, and it is
    /// never attached under its React parent (the anchor system parents it
    /// under the `AnchorLayer`). Unsetting the entity leaves a placeholder
    /// target — hidden, like a despawned one.
    #[test]
    fn anchor_kind_mounts_and_rebinds() {
        let (mut app, tx) = app();
        let target = app.world_mut().spawn_empty().id();
        let bits = target.to_bits() as f64;
        tx.send(vec![
            create_node(1),
            create(
                2,
                "anchor",
                serde_json::json!({ "entity": bits, "offset": [0.0, 1.0, 0.0] }),
            ),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            Op::Append {
                parent: 1,
                child: 2,
            },
        ])
        .unwrap();
        app.update();

        let e = ent(&app, 2);
        assert!(
            app.world().entity(e).get::<Node>().is_some(),
            "an anchor is a styled node"
        );
        let anchored = app
            .world()
            .entity(e)
            .get::<Anchored>()
            .expect("the attributes stamp an Anchored binding")
            .clone();
        assert_eq!(anchored.target, target, "follows the wire entity");
        assert_eq!(anchored.offset, Vec3::new(0.0, 1.0, 0.0));
        assert!(
            children_of(&app, ent(&app, 1)).is_empty(),
            "a detached anchor is never attached under its React parent"
        );
        assert!(app.world().resource::<JsBridge>().detached.contains(&2));

        // A delta with a new offset re-stamps the binding.
        tx.send(vec![update(
            2,
            "anchor",
            serde_json::json!({ "offset": [0.0, 2.0, 0.0] }),
            &[],
            &[],
        )])
        .unwrap();
        app.update();
        assert_eq!(
            app.world().entity(e).get::<Anchored>().map(|a| a.offset),
            Some(Vec3::new(0.0, 2.0, 0.0)),
            "a delta rebinds the anchor offset"
        );

        // Unsetting the entity follows nothing (hidden like a despawned target).
        tx.send(vec![update_delta(2, Props::default(), &["entity"], &[])])
            .unwrap();
        app.update();
        assert_eq!(
            app.world().entity(e).get::<Anchored>().map(|a| a.target),
            Some(Entity::PLACEHOLDER)
        );

        // Removing the React parent despawns the detached anchor too.
        tx.send(vec![Op::Remove {
            parent: ROOT_ID,
            child: 1,
        }])
        .unwrap();
        app.update();
        assert!(!app.world().entities().contains(e));
        assert!(app.world().resource::<JsBridge>().detached.is_empty());
    }

    /// `Op::Reset` despawns reconciler nodes only: the persistent
    /// [`AnchorLayer`] (its own UI root) survives a reload, while the detached
    /// anchors living under it are despawned through the detached set.
    #[test]
    fn reset_keeps_the_layer_and_despawns_anchors() {
        let (mut app, tx) = app();
        let layer = app.world_mut().spawn(AnchorLayer).id();
        let target = app.world_mut().spawn_empty().id();
        tx.send(vec![
            create(
                1,
                "anchor",
                serde_json::json!({ "entity": target.to_bits() as f64 }),
            ),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
        ])
        .unwrap();
        app.update();
        let overlay = ent(&app, 1);
        // Where `position_anchored_nodes` puts it.
        app.world_mut().entity_mut(overlay).insert(ChildOf(layer));

        tx.send(vec![Op::Reset]).unwrap();
        app.update();

        assert!(
            app.world().entities().contains(layer),
            "Op::Reset must preserve the persistent anchor layer"
        );
        assert!(
            !app.world().entities().contains(overlay),
            "Op::Reset must despawn detached anchors living under the layer"
        );
    }
}
