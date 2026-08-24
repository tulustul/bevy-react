//! The transition engine's unit tests — moved verbatim from the module
//! root (assertions untouched; only this header is new).
use super::channels::{Channel, ProgressChannel};
use super::*;
use crate::animations::{AnimatedBindings, Driver, Easing, Lerp};
use crate::protocol::{animatable::AnimatableField, units::Time as WireTime};
use std::time::Duration;

fn timing(duration: f32, easing: Easing) -> ChannelTransition {
    ChannelTransition {
        duration: Some(WireTime::from_secs(duration)),
        easing,
        delay: WireTime::from_secs(0.0),
        stiffness: None,
        damping: None,
        mass: 1.0,
    }
}

fn parse<T: serde::de::DeserializeOwned>(json: serde_json::Value) -> T {
    serde_json::from_value(json).expect("valid json")
}

/// [2.1 parity] `ProgressChannel` semantics, pinned across the
/// `EasedChannel` generalization: an ease lands EXACTLY on the target at
/// completion (no float drift from the last lerp — completion writes the
/// target itself), a spec-less retarget snaps immediately, and a mid-ease
/// retarget restarts from the current reading (not the old start).
#[test]
fn progress_channel_ease_settles_exactly_and_snaps_without_spec() {
    let mut ch = ProgressChannel::<Length>::default();
    ch.init(Length::Px(10.0));
    let spec = timing(0.2, Easing::EaseInOut);
    // Uneven dts: the final lerp would be inexact unless completion
    // writes the target itself.
    let v = ch.drive(Length::Px(20.0), Some(&spec), 0.07);
    assert!(
        matches!(v, Length::Px(x) if x > 10.0 && x < 20.0),
        "mid-ease reading: {v:?}"
    );
    let mid = ch.drive(Length::Px(20.0), Some(&spec), 0.07);
    assert!(
        matches!(mid, Length::Px(x) if x > 10.0 && x < 20.0),
        "still easing: {mid:?}"
    );
    // A mid-ease retarget restarts from the current reading.
    let v = ch.drive(Length::Px(0.0), Some(&spec), 0.0);
    assert_eq!(v, mid, "retarget frame holds the current reading");
    let v = ch.drive(Length::Px(0.0), Some(&spec), 10.0);
    assert_eq!(v, Length::Px(0.0), "completion lands bit-exact on target");
    // Settled: further drives are inert.
    assert_eq!(
        ch.drive(Length::Px(0.0), Some(&spec), 0.016),
        Length::Px(0.0)
    );
    // Spec-less retarget snaps.
    assert_eq!(ch.drive(Length::Px(5.0), None, 0.0), Length::Px(5.0));
    // Mixed units can't lerp — the ease still runs but reads snap to the
    // target lerp fallback.
    let v = ch.drive(Length::Percent(50.0), Some(&spec), 0.01);
    assert_eq!(v, Length::Percent(50.0), "cross-unit lerp snaps");
}

#[test]
fn channel_resolution_is_explicit_only() {
    let t: Transition = parse(serde_json::json!({
        "transform": { "duration": 100 },
        "backgroundColor": { "duration": 100 },
        "opacity": { "duration": 200 },
    }));
    // Every channel reads its own entry — there is no fallback key.
    // The wire numbers are milliseconds → seconds (200ms → 0.2s, 100ms → 0.1s).
    let secs = |c: &ChannelTransition| c.duration.map(WireTime::seconds);
    assert!(t.for_opacity().is_some());
    assert_eq!(secs(t.for_opacity().unwrap()), Some(0.2));
    assert_eq!(secs(t.for_transform().unwrap()), Some(0.1));
    assert_eq!(secs(t.for_background().unwrap()), Some(0.1));

    // An unspecified channel has no transition.
    let t: Transition = parse(serde_json::json!({ "opacity": { "duration": 50 } }));
    assert!(t.for_transform().is_none());
    assert!(t.for_opacity().is_some());
}

/// The filter channel resolves like its siblings: its own explicit entry,
/// else none.
#[test]
fn filter_channel_resolves_explicit_only() {
    let secs = |c: &ChannelTransition| c.duration.map(WireTime::seconds);
    let t: Transition = parse(serde_json::json!({
        "opacity": { "duration": 100 },
        "filter": { "duration": 400 },
    }));
    assert_eq!(secs(t.for_filter().unwrap()), Some(0.4));

    let t: Transition = parse(serde_json::json!({ "filter": { "duration": 100 } }));
    assert_eq!(secs(t.for_filter().unwrap()), Some(0.1));

    let t: Transition = parse(serde_json::json!({ "opacity": { "duration": 50 } }));
    assert!(t.for_filter().is_none());
}

#[test]
fn to_driver_selects_spring_or_timing() {
    let spring = ChannelTransition {
        duration: None,
        easing: Easing::Linear,
        delay: WireTime::from_secs(0.0),
        stiffness: Some(120.0),
        damping: Some(14.0),
        mass: 1.0,
    };
    assert!(matches!(spring.to_driver(1.0), Driver::Spring { .. }));
    assert!(matches!(
        timing(0.3, Easing::Linear).to_driver(1.0),
        Driver::Timing { .. }
    ));
    // A delay wraps the timing in a Delay driver.
    let delayed = ChannelTransition {
        delay: WireTime::from_secs(0.2),
        ..timing(0.3, Easing::Linear)
    };
    assert!(matches!(delayed.to_driver(1.0), Driver::Delay { .. }));
}

#[test]
fn channel_snaps_without_spec_and_eases_with_one() {
    // No spec → snap straight to target.
    let mut ch = Channel::default();
    ch.init(1.0);
    assert_eq!(ch.drive(0.5, None, 0.016), 0.5);

    // With a 1s linear timing → halfway after 0.5s.
    let mut ch = Channel::default();
    ch.init(1.0);
    let spec = timing(1.0, Easing::Linear);
    ch.drive(0.0, Some(&spec), 0.0); // arm; no time elapsed yet
    let v = ch.drive(0.0, Some(&spec), 0.5); // same target, advance 0.5s
    assert!((v - 0.5).abs() < 1e-3, "halfway expected ~0.5, got {v}");
    let v = ch.drive(0.0, Some(&spec), 0.5);
    assert!((v - 0.0).abs() < 1e-3, "end expected 0, got {v}");
    assert!(ch.runner.is_none(), "runner dropped once finished");
}

#[test]
fn color_channel_lerps_to_target() {
    let mut c = ProgressChannel::<[f32; 4]>::default();
    c.init([0.0, 0.0, 0.0, 1.0]);
    let spec = timing(1.0, Easing::Linear);
    c.drive([1.0, 0.5, 0.0, 1.0], Some(&spec), 0.0); // arm
    let mid = c.drive([1.0, 0.5, 0.0, 1.0], Some(&spec), 0.5);
    assert!((mid[0] - 0.5).abs() < 1e-3);
    assert!((mid[1] - 0.25).abs() < 1e-3);
    assert!((mid[2] - 0.0).abs() < 1e-3);
}

/// Build a one-entity world running `drive_transitions`, advancing `Time`.
fn drive_world() -> (World, Schedule) {
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

#[test]
fn system_eases_scale_on_press_then_release() {
    let (mut world, mut schedule) = drive_world();
    let spec = Transition {
        transform: Some(timing(1.0, Easing::Linear)),
        ..Default::default()
    };
    let e = world
        .spawn((
            TransitionInput {
                spec: spec.clone(),
                scale: Some(1.0),
                ..Default::default()
            },
            TransitionState::default(),
            UiTransform::default(),
        ))
        .id();

    // First frame seeds the resting state — scale snaps to 1, no animation.
    schedule.run(&mut world);
    assert_eq!(world.entity(e).get::<UiTransform>().unwrap().scale.x, 1.0);

    // Press: target 0.95. Halfway through a 1s ease → ~0.975.
    world
        .entity_mut(e)
        .get_mut::<TransitionInput>()
        .unwrap()
        .scale = Some(0.95);
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let sx = world.entity(e).get::<UiTransform>().unwrap().scale.x;
    assert!(
        (sx - 0.975).abs() < 1e-2,
        "mid-press expected ~0.975, got {sx}"
    );

    // Finish the press ease.
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let sx = world.entity(e).get::<UiTransform>().unwrap().scale.x;
    assert!((sx - 0.95).abs() < 1e-3, "pressed expected 0.95, got {sx}");

    // Release back to 1.0, eases again.
    world
        .entity_mut(e)
        .get_mut::<TransitionInput>()
        .unwrap()
        .scale = Some(1.0);
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let sx = world.entity(e).get::<UiTransform>().unwrap().scale.x;
    assert!(
        (sx - 0.975).abs() < 1e-2,
        "mid-release expected ~0.975, got {sx}"
    );
}

/// `transition.transform3d` eases the layer's params field-wise; without a
/// spec the write snaps; perspective snaps when the previous target was
/// orthographic; a demoted entity (no `LayerTransform3d`) is a no-op.
#[test]
fn system_eases_transform3d() {
    use crate::layer::transform3d::LayerTransform3d;
    use crate::protocol::transform::Transform3d;

    let (mut world, mut schedule) = drive_world();
    let spec = Transition {
        transform3d: Some(timing(1.0, Easing::Linear)),
        ..Default::default()
    };
    let base = Transform3d::default();
    let e = world
        .spawn((
            TransitionInput {
                spec: spec.clone(),
                transform3d: Some(base.clone()),
                ..Default::default()
            },
            TransitionState::default(),
            UiTransform::default(),
            LayerTransform3d(base.clone()),
        ))
        .id();

    // First frame seeds resting state: identity, no ease-in from nowhere.
    schedule.run(&mut world);
    let t = world.entity(e).get::<LayerTransform3d>().unwrap().0.clone();
    assert!(t.is_identity());

    // Retarget rotateY 90° (+ a perspective from an orthographic start —
    // that channel snaps while the rotation eases).
    let target = Transform3d {
        rotate_y: Some(crate::protocol::animatable::Animatable::Static(
            crate::protocol::units::Angle::from_radians(std::f32::consts::FRAC_PI_2),
        )),
        perspective: Some(crate::protocol::animatable::Animatable::Static(800.0)),
        ..Default::default()
    };
    world
        .entity_mut(e)
        .get_mut::<TransitionInput>()
        .unwrap()
        .transform3d = Some(target.clone());
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let t = world.entity(e).get::<LayerTransform3d>().unwrap().0.clone();
    let ry = t.rotate_y.static_val().unwrap().radians();
    assert!(
        (ry - std::f32::consts::FRAC_PI_4).abs() < 0.05,
        "mid-ease expected ~45°, got {}°",
        ry.to_degrees()
    );
    assert_eq!(
        t.perspective.static_val(),
        Some(800.0),
        "ortho→perspective snaps"
    );

    // Finish the ease.
    advance(&mut world, 0.6);
    schedule.run(&mut world);
    let t = world.entity(e).get::<LayerTransform3d>().unwrap().0.clone();
    assert!(
        (t.rotate_y.static_val().unwrap().radians() - std::f32::consts::FRAC_PI_2).abs() < 1e-3
    );

    // No spec → snap. (Fresh entity, spec without a transform3d entry.)
    let e2 = world
        .spawn((
            TransitionInput {
                spec: Transition {
                    opacity: Some(timing(1.0, Easing::Linear)),
                    ..Default::default()
                },
                transform3d: Some(target.clone()),
                ..Default::default()
            },
            TransitionState::default(),
            UiTransform::default(),
            LayerTransform3d(base),
        ))
        .id();
    schedule.run(&mut world);
    // Without a transform3d spec the drive block never runs —
    // the static style applier owns the component (stays at `base` here,
    // since this harness has no style apply).
    let t2 = world
        .entity(e2)
        .get::<LayerTransform3d>()
        .unwrap()
        .0
        .clone();
    assert!(t2.is_identity());

    // Demoted entity (no LayerTransform3d): driving is a no-op, no panic.
    let e3 = world
        .spawn((
            TransitionInput {
                spec,
                transform3d: Some(target.clone()),
                ..Default::default()
            },
            TransitionState::default(),
            UiTransform::default(),
        ))
        .id();
    advance(&mut world, 0.1);
    schedule.run(&mut world);
    assert!(world.entity(e3).get::<LayerTransform3d>().is_none());
}

#[test]
fn system_eases_percent_translate() {
    let (mut world, mut schedule) = drive_world();
    let spec = Transition {
        transform: Some(timing(1.0, Easing::Linear)),
        ..Default::default()
    };
    let e = world
        .spawn((
            TransitionInput {
                spec,
                translate_x: Some(Length::Percent(0.0)),
                ..Default::default()
            },
            TransitionState::default(),
            UiTransform::default(),
        ))
        .id();

    // First frame seeds the resting state at 0% — snaps, no animation.
    schedule.run(&mut world);
    assert_eq!(
        world.entity(e).get::<UiTransform>().unwrap().translation.x,
        Val::Percent(0.0)
    );

    // Retarget to 100%: halfway through a 1s linear ease → ~50%, still in
    // percent units (not collapsed to px).
    world
        .entity_mut(e)
        .get_mut::<TransitionInput>()
        .unwrap()
        .translate_x = Some(Length::Percent(100.0));
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let tx = world.entity(e).get::<UiTransform>().unwrap().translation.x;
    assert!(
        matches!(tx, Val::Percent(v) if (v - 50.0).abs() < 1.0),
        "mid expected ~50%, got {tx:?}"
    );

    advance(&mut world, 0.5);
    schedule.run(&mut world);
    assert_eq!(
        world.entity(e).get::<UiTransform>().unwrap().translation.x,
        Val::Percent(100.0)
    );
}

#[test]
fn animated_style_channel_wins_over_transition() {
    let (mut world, mut schedule) = drive_world();
    let spec = Transition {
        transform: Some(timing(1.0, Easing::Linear)),
        ..Default::default()
    };
    // The entity also has an AnimatedNode binding for scale → transition must
    // not touch the transform (the imperative path owns it).
    let bindings = AnimatedBindings(
        [(
            crate::animations::AnimatableProperty::Scale,
            crate::animations::protocol::Binding::Shared { id: 1 },
        )]
        .into(),
    );
    let e = world
        .spawn((
            TransitionInput {
                spec,
                scale: Some(1.0),
                ..Default::default()
            },
            TransitionState::default(),
            UiTransform::from_scale(Vec2::splat(2.0)), // a value the imperative path "set"
            AnimatedNode(bindings),
        ))
        .id();

    schedule.run(&mut world);
    world
        .entity_mut(e)
        .get_mut::<TransitionInput>()
        .unwrap()
        .scale = Some(0.95);
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    // Untouched by the transition: still the imperative 2.0.
    assert_eq!(world.entity(e).get::<UiTransform>().unwrap().scale.x, 2.0);
}

/// A `filter[<i>].<param>` binding parks the WHOLE whole-value filter
/// channel (`skip_filter`): on a filter retarget the transition must not
/// touch the resolved chain — the per-param binding (the animations
/// applier) owns it. A control entity without the binding shows the
/// channel would otherwise write.
#[test]
fn filter_param_binding_gates_filter_transition() {
    use crate::animations::ValueKind;
    use std::sync::Arc;

    let (mut world, mut schedule) = drive_world();
    let spec = Transition {
        filter: Some(timing(1.0, Easing::Linear)),
        ..Default::default()
    };
    let pass = |amount: f32| crate::filters::ResolvedFilterPass {
        shader: Handle::default(),
        params: vec![Vec4::new(amount, 0.0, 0.0, 0.0)],
        layout: Arc::from(vec![crate::filters::ParamSlot {
            name: "amount",
            kind: ValueKind::Scalar,
            vec: 0,
            comp: 0,
            len: 1,
        }]),
        wire_index: 0,
    };
    let wire = |amount: f32| -> crate::filters::FilterChain {
        serde_json::from_value(serde_json::json!(
            { "name": "grayscale", "params": { "amount": amount } }
        ))
        .unwrap()
    };
    let chain = |amount: f32| crate::filters::ResolvedFilterChain {
        passes: vec![pass(amount)],
        outset_px: 0,
        always_dirty: false,
        version: 1,
        scale: 1.0,
    };
    let bindings = AnimatedBindings(
        [(
            crate::animations::AnimatableProperty::FilterParam {
                index: 0,
                name: "amount".into(),
            },
            crate::animations::protocol::Binding::Shared { id: 1 },
        )]
        .into(),
    );

    let spawn = |world: &mut World, gated: bool| {
        let mut e = world.spawn((
            TransitionInput {
                spec: spec.clone(),
                ..Default::default()
            },
            TransitionState::default(),
            UiTransform::default(),
            crate::filters::FilterInput(wire(0.0)),
            chain(0.0),
        ));
        if gated {
            e.insert(AnimatedNode(bindings.clone()));
        }
        e.id()
    };
    let gated = spawn(&mut world, true);
    let control = spawn(&mut world, false);

    // Seed frame: both channels adopt the current wire chain + passes.
    schedule.run(&mut world);

    // Retarget: stamp the new wire chain and simulate the resolver's
    // same-frame snap of the component to the target.
    for e in [gated, control] {
        *world
            .entity_mut(e)
            .get_mut::<crate::filters::FilterInput>()
            .unwrap() = crate::filters::FilterInput(wire(1.0));
        let mut em = world.entity_mut(e);
        let mut c = em.get_mut::<crate::filters::ResolvedFilterChain>().unwrap();
        c.passes = vec![pass(1.0)];
        c.version = 2;
    }
    advance(&mut world, 0.1);
    schedule.run(&mut world);

    // Control: the channel armed a matched ease over the snap and wrote
    // a mid-ease value — proving the channel was live.
    let c = world
        .entity(control)
        .get::<crate::filters::ResolvedFilterChain>()
        .unwrap();
    let w = c.passes[0].params[0].x;
    assert!(
        w > 0.0 && w < 1.0,
        "control: transition eased over the snap, got {w}"
    );
    assert_eq!(c.version, 3, "control: transition bumped the version");

    // Gated: `skip_filter` — the snapped chain is untouched.
    let c = world
        .entity(gated)
        .get::<crate::filters::ResolvedFilterChain>()
        .unwrap();
    assert_eq!(
        c.passes[0].params[0].x, 1.0,
        "gated: the transition must not touch the chain"
    );
    assert_eq!(c.version, 2, "gated: version stays the resolver's");
}

/// Once a transition has settled, `drive_transitions` must stop marking the
/// target components changed (compare-before-write) — a settled hover/press
/// style shouldn't keep transform propagation / extraction hot forever.
#[test]
fn settled_transition_does_not_dirty_components() {
    #[derive(Resource, Default)]
    struct Dirty(usize);

    let (mut world, mut schedule) = drive_world();
    world.init_resource::<Dirty>();
    let spec = Transition {
        transform: Some(timing(0.2, Easing::Linear)),
        background_color: Some(timing(0.2, Easing::Linear)),
        opacity: Some(timing(0.2, Easing::Linear)),
        ..Default::default()
    };
    let e = world
        .spawn((
            TransitionInput {
                spec,
                scale: Some(1.0),
                // Deliberately different from the bg target's alpha: opacity
                // owns the final alpha, and the two writes must still settle.
                opacity: Some(0.5),
                background_color: Some([1.0, 0.0, 0.0, 1.0]),
                ..Default::default()
            },
            TransitionState::default(),
            UiTransform::default(),
            BackgroundColor(Color::WHITE),
        ))
        .id();

    type AnyTargetChanged = Or<(Changed<UiTransform>, Changed<BackgroundColor>)>;

    let mut detect = Schedule::default();
    detect.add_systems(|q: Query<(), AnyTargetChanged>, mut dirty: ResMut<Dirty>| {
        dirty.0 = q.iter().count();
    });

    // Seed, retarget, and run the ease well past completion.
    schedule.run(&mut world);
    world
        .entity_mut(e)
        .get_mut::<TransitionInput>()
        .unwrap()
        .scale = Some(0.9);
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    detect.run(&mut world); // consume all the churn so far

    advance(&mut world, 0.5);
    schedule.run(&mut world);
    detect.run(&mut world);
    assert_eq!(
        world.resource::<Dirty>().0,
        0,
        "a settled transition must not dirty anything"
    );
}

#[test]
fn lerp_length_same_unit_else_snaps() {
    assert_eq!(Length::Px(0.0).lerp(Length::Px(10.0), 0.5), Length::Px(5.0));
    assert_eq!(
        Length::Percent(0.0).lerp(Length::Percent(100.0), 0.25),
        Length::Percent(25.0)
    );
    // `auto` or mixed units can't be interpolated → snap to the target.
    assert_eq!(Length::Auto.lerp(Length::Px(10.0), 0.5), Length::Px(10.0));
    assert_eq!(
        Length::Px(0.0).lerp(Length::Percent(10.0), 0.5),
        Length::Percent(10.0)
    );
}

fn px(l: Length) -> f32 {
    match l {
        Length::Px(v) => v,
        other => panic!("expected Px, got {other:?}"),
    }
}

#[test]
fn length_channel_eases_then_idles() {
    let mut ch = ProgressChannel::<Length>::default();
    ch.init(Length::Px(0.0));
    let spec = timing(1.0, Easing::Linear);
    // Arm toward 100; the arm frame reports the (still 0) value.
    assert!((px(ch.drive(Length::Px(100.0), Some(&spec), 0.0)) - 0.0).abs() < 1e-3);
    assert!((px(ch.drive(Length::Px(100.0), Some(&spec), 0.5)) - 50.0).abs() < 1e-3);
    assert!((px(ch.drive(Length::Px(100.0), Some(&spec), 0.5)) - 100.0).abs() < 1e-3);
    // Settled and target unchanged → idle: the runner is dropped and the
    // reading holds steady (the caller's compare skips the `Node` write).
    assert!(ch.runner.is_none(), "runner dropped once settled");
    assert_eq!(
        ch.drive(Length::Px(100.0), Some(&spec), 0.5),
        Length::Px(100.0)
    );
}

#[test]
fn system_eases_max_height_layout() {
    let (mut world, mut schedule) = drive_world();
    let spec = Transition {
        size: Some(timing(1.0, Easing::Linear)),
        ..Default::default()
    };
    let e = world
        .spawn((
            TransitionInput {
                spec,
                max_height: Some(Length::Px(120.0)),
                ..Default::default()
            },
            TransitionState::default(),
            Node::default(),
            UiTransform::default(),
        ))
        .id();

    // First frame seeds the resting state (120) without writing Node.
    schedule.run(&mut world);

    // Collapse to 0: halfway through a 1s ease → ~60.
    world
        .entity_mut(e)
        .get_mut::<TransitionInput>()
        .unwrap()
        .max_height = Some(Length::Px(0.0));
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let mh = world.entity(e).get::<Node>().unwrap().max_height;
    assert!(
        matches!(mh, Val::Px(v) if (v - 60.0).abs() < 1.0),
        "mid expected ~60px, got {mh:?}"
    );

    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let mh = world.entity(e).get::<Node>().unwrap().max_height;
    assert!(
        matches!(mh, Val::Px(v) if v.abs() < 1e-3),
        "settled expected 0px, got {mh:?}"
    );
}

/// `drive_scroll_transition` eases `ScrollPosition` toward the state's target
/// (seeded at the live offset on first sight) and settles exactly on it.
#[test]
fn system_eases_scroll_toward_target() {
    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    world.insert_resource(Time::<()>::default());
    let mut schedule = Schedule::default();
    schedule.add_systems(drive_scroll_transition);

    let e = world
        .spawn((
            ScrollTransitionInput(timing(1.0, Easing::Linear)),
            ScrollTransitionState::default(),
            ScrollPosition::default(),
        ))
        .id();

    // First frame seeds resting state at the live offset (0) — no movement.
    schedule.run(&mut world);
    assert_eq!(
        world.entity(e).get::<ScrollPosition>().unwrap().0,
        Vec2::ZERO
    );

    // Target y=100; halfway through a 1s linear ease → ~50.
    world
        .entity_mut(e)
        .get_mut::<ScrollTransitionState>()
        .unwrap()
        .target = Vec2::new(0.0, 100.0);
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let y = world.entity(e).get::<ScrollPosition>().unwrap().0.y;
    assert!((y - 50.0).abs() < 1.0, "mid-ease expected ~50, got {y}");

    // Finish the ease → exactly 100.
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    assert_eq!(
        world.entity(e).get::<ScrollPosition>().unwrap().0,
        Vec2::new(0.0, 100.0)
    );
}

/// A direct external write to `ScrollPosition` mid-ease (the scrollbar widget's
/// thumb-drag and track-click paging write the offset directly) snaps: the
/// written value survives exactly and nothing eases back toward the stale target.
#[test]
fn scroll_direct_write_snaps_the_ease() {
    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    world.insert_resource(Time::<()>::default());
    let mut schedule = Schedule::default();
    schedule.add_systems(drive_scroll_transition);

    let e = world
        .spawn((
            ScrollTransitionInput(timing(1.0, Easing::Linear)),
            ScrollTransitionState::default(),
            ScrollPosition::default(),
        ))
        .id();
    schedule.run(&mut world); // seed resting state at 0

    // Leave an ease mid-flight toward y=100.
    world
        .entity_mut(e)
        .get_mut::<ScrollTransitionState>()
        .unwrap()
        .target = Vec2::new(0.0, 100.0);
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let y = world.entity(e).get::<ScrollPosition>().unwrap().0.y;
    assert!(y > 0.0 && y < 100.0, "mid-ease expected, got {y}");

    // The widget writes the offset directly: the value must survive as-is...
    world.entity_mut(e).get_mut::<ScrollPosition>().unwrap().0 = Vec2::new(0.0, 42.0);
    advance(&mut world, 0.25);
    schedule.run(&mut world);
    assert_eq!(
        world.entity(e).get::<ScrollPosition>().unwrap().0,
        Vec2::new(0.0, 42.0)
    );
    // ...and stay put on later frames (target adopted, runners dropped).
    advance(&mut world, 0.25);
    schedule.run(&mut world);
    assert_eq!(
        world.entity(e).get::<ScrollPosition>().unwrap().0,
        Vec2::new(0.0, 42.0)
    );
}

/// `snap_to` (what `bridge_scrollbar_capture` calls each drag frame) parks a
/// mid-flight ease at the live offset: the stale target stops mattering.
#[test]
fn scroll_snap_to_parks_a_mid_flight_ease() {
    let mut world = World::new();
    world.init_resource::<crate::layer::LayerContentDirt>();
    world.insert_resource(Time::<()>::default());
    let mut schedule = Schedule::default();
    schedule.add_systems(drive_scroll_transition);

    let e = world
        .spawn((
            ScrollTransitionInput(timing(1.0, Easing::Linear)),
            ScrollTransitionState::default(),
            ScrollPosition::default(),
        ))
        .id();
    schedule.run(&mut world); // seed resting state at 0

    world
        .entity_mut(e)
        .get_mut::<ScrollTransitionState>()
        .unwrap()
        .target = Vec2::new(0.0, 100.0);
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    let live = world.entity(e).get::<ScrollPosition>().unwrap().0;
    assert!(
        live.y > 0.0 && live.y < 100.0,
        "mid-ease expected, got {live:?}"
    );

    world
        .entity_mut(e)
        .get_mut::<ScrollTransitionState>()
        .unwrap()
        .snap_to(live);
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    assert_eq!(world.entity(e).get::<ScrollPosition>().unwrap().0, live);
    advance(&mut world, 0.5);
    schedule.run(&mut world);
    assert_eq!(world.entity(e).get::<ScrollPosition>().unwrap().0, live);
}
