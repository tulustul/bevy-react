//! Shared-element flight tests: seeded first sight, observed through real
//! layout (the harness of [`super::layout_tests`]).
use super::layout::LayoutChannel;
use super::layout_tests::{R0, R1, Written, global, layout_app, root_row, step, x_of};
use super::shared::{SharedRect, SharedSeed};
use super::tests::timing;
use super::*;
use crate::animations::Easing;
use bevy::math::Affine2;
use bevy::ui::ComputedNode;

/// [`layout_app`] plus `drive_transitions` in `Update` (the seed consumer
/// and the size channels' writer).
fn shared_app() -> App {
    let mut app = layout_app();
    app.init_resource::<crate::layer::LayerContentDirt>();
    app.add_systems(Update, drive_transitions);
    app
}

fn shared_spec(secs: f32) -> TransitionInput {
    TransitionInput {
        spec: Transition {
            shared_element: Some(timing(secs, Easing::Linear)),
            ..Default::default()
        },
        width: Some(Length::Px(200.0)),
        height: Some(Length::Px(50.0)),
        ..Default::default()
    }
}

fn seed(center: Vec2, size: Vec2) -> SharedSeed {
    SharedSeed {
        state: Box::new(TransitionState::default()),
        rect: SharedRect { center, size },
    }
}

fn node_size(app: &App, e: Entity) -> (Val, Val) {
    let n = app.world().entity(e).get::<Node>().unwrap();
    (n.width, n.height)
}

/// A seeded incoming node (natural rect: 200×50 at the row's start, center
/// `(100, 25)`; seed: 100×50 centered at `(300, 50)`) shows the SEED rect on
/// its first frame — the position by translation, the size by the FLIP
/// scale (no empty frame) — then flies: the size through real layout in px
/// (the `Node` fields ease from the seed's measured size to the natural
/// one), the position translate-only against the moving layout, and settle
/// restores the authored `Node` values with no further writes.
#[test]
fn shared_seed_shows_seed_rect_on_frame_zero_then_flies_through_real_layout() {
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    let b = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(root),
            shared_spec(1.0),
            TransitionState::default(),
            seed(Vec2::new(300.0, 50.0), Vec2::new(100.0, 50.0)),
        ))
        .id();
    step(&mut app, 0.0);
    let g = global(&app, b);
    assert_eq!(
        g.translation,
        Vec2::new(300.0, 50.0),
        "frame 0: seed center"
    );
    assert!(
        (g.matrix2.x_axis.x - 0.5).abs() < 1e-6 && (g.matrix2.y_axis.y - 1.0).abs() < 1e-6,
        "frame 0: seed size via FLIP scale, got {:?}",
        g.matrix2
    );
    assert!(
        app.world().entity(b).get::<SharedSeed>().is_none(),
        "seed consumed"
    );

    step(&mut app, 0.5);
    assert_eq!(
        node_size(&app, b),
        (Val::Px(150.0), Val::Px(50.0)),
        "halfway: width flies in px through real layout"
    );
    let g = global(&app, b);
    // Laid out at 150 wide → natural center x = 75; halfway between the
    // seed (300) and that moving target.
    assert!(
        (g.translation.x - 187.5).abs() < 1e-3 && (g.translation.y - 37.5).abs() < 1e-3,
        "halfway: translate-only against the live layout, got {:?}",
        g.translation
    );
    assert_eq!(
        g.matrix2,
        Mat2::IDENTITY,
        "no scale once real layout owns the size"
    );

    step(&mut app, 1.0);
    assert_eq!(
        node_size(&app, b),
        (Val::Px(200.0), Val::Px(50.0)),
        "settle restores the authored size"
    );
    assert_eq!(global(&app, b).translation, Vec2::new(100.0, 25.0));
    step(&mut app, 0.016);
    assert!(
        !app.world().resource::<Written>().0.contains(&b),
        "settled: no global-transform writes"
    );
    assert_eq!(node_size(&app, b), (Val::Px(200.0), Val::Px(50.0)));
}

/// A seed rect within the snap epsilon of the natural rect (a reload
/// re-pairs every node with its old self) is a no-op: nothing arms.
#[test]
fn shared_seed_within_epsilon_is_a_silent_adopt() {
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    let b = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(root),
            shared_spec(1.0),
            TransitionState::default(),
            seed(Vec2::new(100.2, 25.0), Vec2::new(200.0, 50.0)),
        ))
        .id();
    step(&mut app, 0.0);
    assert_eq!(
        global(&app, b),
        Affine2::from_translation(Vec2::new(100.0, 25.0))
    );
    step(&mut app, 0.5);
    assert!(!app.world().resource::<Written>().0.contains(&b));
    assert_eq!(node_size(&app, b), (Val::Px(200.0), Val::Px(50.0)));
}

/// A seed against a 0×0 natural rect (an image whose texture isn't resident
/// on its mount frame) adopts silently — no singular scale, no size flight.
#[test]
fn shared_seed_against_zero_natural_rect_adopts() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.seed_shared([300.0, 50.0, 100.0, 50.0], [100.0, 25.0, 0.0, 0.0], &spec);
    assert!(!ch.shared_active());
    assert_eq!(ch.drive([100.0, 25.0, 0.0, 0.0], &spec, false, 0.016), None);
    let mut state = TransitionState::default();
    state.arm_shared_size([100.0, 50.0], [0.0, 0.0], 1.0, &spec);
    assert!(!state.size_in_flight(), "no size flight toward 0px");
}

/// Leaving shared mode arms the adopt grace frame: the size flight settles
/// one frame later, and that last rect step must not re-arm a `layout` ease.
#[test]
fn shared_flight_exit_swallows_the_size_settle_step() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.seed_shared(R0, R1, &spec);
    assert!(ch.drive(R1, &spec, false, 0.5).is_some());
    assert_eq!(ch.drive(R1, &spec, false, 1.0), None, "settled");
    assert!(!ch.shared_active());
    let settle_step = [R1[0] + 5.0, R1[1], R1[2] + 10.0, R1[3]];
    assert_eq!(
        ch.drive(settle_step, &spec, false, 0.016),
        None,
        "grace frame adopts"
    );
    assert!(!ch.in_flight());
}

/// The flight's timing is captured at the seed: a variant swap that replaces
/// the `transition` object mid-flight (dropping `sharedElement`) neither
/// snaps the rect nor resets the channel.
#[test]
fn shared_flight_survives_losing_its_spec_mid_flight() {
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    let b = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(root),
            shared_spec(1.0),
            TransitionState::default(),
            seed(Vec2::new(300.0, 50.0), Vec2::new(200.0, 50.0)),
        ))
        .id();
    step(&mut app, 0.0);
    assert_eq!(global(&app, b).translation, Vec2::new(300.0, 50.0));
    // A variant swap: the input's transition no longer names sharedElement.
    app.world_mut()
        .entity_mut(b)
        .get_mut::<TransitionInput>()
        .unwrap()
        .spec = Transition::default();
    step(&mut app, 0.5);
    let x = global(&app, b).translation.x;
    assert!(
        (x - 200.0).abs() < 1e-3,
        "still flying from the cached spec: {x}"
    );
}

/// The seed is anchored in ROOT space. A parent re-flowed by the size
/// flight — here a centered row `[hero][sibling]` whose width follows the
/// hero's — must not drag the take-off point along: the hero (natural
/// 200×50, seeded 100×50 at `(100, 25)`) eases from the seed toward the
/// live natural center in root space, instead of jumping by the parent's
/// shift on the frame after the seed frame.
#[test]
fn shared_seed_stays_anchored_when_the_parent_reflows_around_the_size_flight() {
    let mut app = shared_app();
    let root = app
        .world_mut()
        .spawn(Node {
            justify_content: JustifyContent::Center,
            ..root_row()
        })
        .id();
    let parent = app
        .world_mut()
        .spawn((
            Node {
                flex_direction: FlexDirection::Row,
                ..Default::default()
            },
            ChildOf(root),
        ))
        .id();
    let hero = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(parent),
            shared_spec(1.0),
            TransitionState::default(),
            seed(Vec2::new(100.0, 25.0), Vec2::new(100.0, 50.0)),
        ))
        .id();
    app.world_mut().spawn((
        Node {
            width: Val::Px(100.0),
            height: Val::Px(50.0),
            ..Default::default()
        },
        ChildOf(parent),
    ));
    step(&mut app, 0.0);
    assert_eq!(
        global(&app, hero).translation,
        Vec2::new(100.0, 25.0),
        "frame 0: seed center"
    );

    // Frame 1: the width flight has shrunk the hero, the centered parent
    // has shifted right by ~50px — the hero must still be (almost) at the
    // seed, not 50px to the right of it.
    step(&mut app, 0.016);
    let x = x_of(&app, hero);
    assert!(
        (x - 100.0).abs() < 8.0,
        "frame 1: the take-off point must not move with the re-flowed parent, got x = {x}"
    );

    // Halfway: the natural center is 450 whatever the hero's width (the row
    // is centered and the hero leads it), so a root-space ease reads 275.
    step(&mut app, 0.484);
    let x = x_of(&app, hero);
    assert!(
        (x - 275.0).abs() < 1.0,
        "halfway: root-space ease seed→live target, got x = {x}"
    );
}

/// On the seed frame the node is shown through the FLIP scale, so a corner
/// radius resolved at the natural size would shrink with the box: a 36px
/// (circle) seed on a 72×72 thumb, shown as a 200×200 hero at scale 0.36,
/// must still READ as 36px on screen — `ComputedNode.border_radius` is
/// compensated for that one frame (bevy rewrites it from `Node` next frame).
#[test]
fn shared_seed_frame_shows_the_seed_corner_radius_through_the_flip_scale() {
    use crate::protocol::units::Rect;
    let px = |v: f32| Rect {
        top: Length::Px(v),
        right: Length::Px(v),
        bottom: Length::Px(v),
        left: Length::Px(v),
    };
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    let mut input = shared_spec(1.0);
    input.width = Some(Length::Px(200.0));
    input.height = Some(Length::Px(200.0));
    input.border_radius = Some(px(16.0));
    let mut seed_state = TransitionState::at_identity();
    seed_state.border_radius.init(px(36.0));
    let hero = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(200.0),
                border_radius: BorderRadius::all(Val::Px(16.0)),
                ..Default::default()
            },
            ChildOf(root),
            input,
            TransitionState::default(),
            SharedSeed {
                state: Box::new(seed_state),
                rect: SharedRect {
                    center: Vec2::new(300.0, 50.0),
                    size: Vec2::new(72.0, 72.0),
                },
            },
        ))
        .id();
    step(&mut app, 0.0);
    let g = global(&app, hero);
    let scale = g.matrix2.x_axis.x;
    assert!(
        (scale - 0.36).abs() < 1e-3,
        "seed frame FLIP scale, got {scale}"
    );
    let shown = app
        .world()
        .entity(hero)
        .get::<ComputedNode>()
        .unwrap()
        .border_radius
        .top_left
        * scale;
    assert!(
        (shown - 36.0).abs() < 1.0,
        "seed frame: the seed radius as shown through the FLIP scale, got {shown}px"
    );
}
