//! Shared-element flight tests: seeded first sight, observed through real
//! layout (the harness of [`super::layout_tests`]).
use super::layout::{LayoutChannel, RectWriter};
use super::layout_tests::{
    R0, R1, Written, global, layout_app, layout_spec, root_row, square, step, x_of,
};
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
/// one), the position translate-only from the seed toward where it SETTLES,
/// and settle restores the authored `Node` values with no further writes.
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
    // Halfway along the straight line from the seed (300, 50) to where the
    // node SETTLES (100, 25) — NOT halfway to the live rect, whose center is
    // at x = 75 right now because the node is laid out 150 wide. Easing
    // toward the live rect is what bowed the flight.
    assert!(
        (g.translation.x - 200.0).abs() < 1e-3 && (g.translation.y - 37.5).abs() < 1e-3,
        "halfway: straight line seed → settled, got {:?}",
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
    assert_eq!(
        ch.drive(
            [100.0, 25.0, 0.0, 0.0],
            [100.0, 25.0, 0.0, 0.0],
            &spec,
            RectWriter::None,
            0.016
        ),
        None
    );
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
    assert!(ch.drive(R1, R1, &spec, RectWriter::None, 0.5).is_some());
    assert_eq!(
        ch.drive(R1, R1, &spec, RectWriter::None, 1.0),
        None,
        "settled"
    );
    assert!(!ch.shared_active());
    let settle_step = [R1[0] + 5.0, R1[1], R1[2] + 10.0, R1[3]];
    assert_eq!(
        ch.drive(settle_step, settle_step, &spec, RectWriter::None, 0.016),
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

/// A node whose authored size is a PERCENTAGE of its parent — the shape the
/// demos' home page uses on both ends of its tile ↔ panel flight — flies the
/// same way a pixel-sized one does, and settles back onto the percentage
/// resolving to the same box it flew to.
///
/// This is the case every other test here misses: they all author `Px`, where
/// "the natural size measured at first layout" and "what the authored `Length`
/// resolves to at settle" are trivially the same number. With a percentage
/// those are two different computations, and a mismatch would show up as the
/// node snapping on the frame the flight ends.
#[test]
fn shared_seed_flies_and_settles_when_the_authored_size_is_a_percentage() {
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    // A fixed 200×50 slot, the way a tile slot (or the panel's stage) is fixed.
    let slot = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(root),
        ))
        .id();
    // The flying node fills that slot, and is seeded from a much bigger rect.
    let card = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                ..Default::default()
            },
            ChildOf(slot),
            TransitionInput {
                spec: Transition {
                    shared_element: Some(timing(1.0, Easing::Linear)),
                    ..Default::default()
                },
                width: Some(Length::Percent(100.0)),
                height: Some(Length::Percent(100.0)),
                ..Default::default()
            },
            TransitionState::default(),
            // Differs from the natural 200×50 in BOTH axes, the way a tile
            // (256×216) differs from the panel it flies into.
            seed(Vec2::new(300.0, 60.0), Vec2::new(100.0, 20.0)),
        ))
        .id();

    step(&mut app, 0.0);
    assert!(
        app.world().entity(card).get::<SharedSeed>().is_none(),
        "seed consumed"
    );

    step(&mut app, 0.5);
    assert_eq!(
        node_size(&app, card),
        (Val::Px(150.0), Val::Px(35.0)),
        "halfway: the percentage is replaced by the flying px size"
    );

    step(&mut app, 1.0);
    assert_eq!(
        node_size(&app, card),
        (Val::Percent(100.0), Val::Percent(100.0)),
        "settle restores the authored PERCENTAGE, not the flown px"
    );
    // The percentage has to resolve to the same box the flight ended on, or
    // the node visibly snaps on the settle frame.
    let g = global(&app, card);
    assert_eq!(
        g.matrix2,
        Mat2::IDENTITY,
        "settled: no residual FLIP scale, got {:?}",
        g.matrix2
    );
    assert_eq!(
        g.translation,
        Vec2::new(100.0, 25.0),
        "settled: centered in its 200x50 slot"
    );
    step(&mut app, 0.016);
    assert!(
        !app.world().resource::<Written>().0.contains(&card),
        "settled: no further global-transform writes"
    );
}

/// The SHRINK direction: a node seeded from a rect BIGGER than the slot it
/// lands in — the demos' home page collapsing an expanded panel back into its
/// tile, and the mirror of every other test here, which all grow.
///
/// A flex item's main-axis size is its basis *adjusted by grow/shrink*, so
/// the px the size flight writes is shrunk straight back into the container:
/// the flight owns the node's flex sizing for its duration, or the main axis
/// snaps to its natural size on the frame after the seed while the cross axis
/// eases on — half a flight, which is what the collapse looked like.
#[test]
fn shared_seed_shrinking_into_a_smaller_slot_flies_both_axes() {
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    // A fixed 200×50 slot, the way a tile's slot is fixed. `root_row` lays
    // its children out in a row, so WIDTH is the flex main axis here.
    let slot = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(root),
        ))
        .id();
    let card = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                ..Default::default()
            },
            ChildOf(slot),
            TransitionInput {
                spec: Transition {
                    shared_element: Some(timing(1.0, Easing::Linear)),
                    ..Default::default()
                },
                width: Some(Length::Percent(100.0)),
                height: Some(Length::Percent(100.0)),
                ..Default::default()
            },
            TransitionState::default(),
            // Twice the slot in both axes: the panel-to-tile direction.
            seed(Vec2::new(300.0, 60.0), Vec2::new(400.0, 100.0)),
        ))
        .id();
    let shown = |app: &App| app.world().entity(card).get::<ComputedNode>().unwrap().size;
    let flex = |app: &App| {
        let n = app.world().entity(card).get::<Node>().unwrap();
        (n.flex_grow, n.flex_shrink)
    };
    let authored_shrink = flex(&app).1;

    // Frame 0: the seed rect, shown through the FLIP scale (layout cannot
    // have the seed size yet), exactly as in the grow direction.
    step(&mut app, 0.0);
    let g = global(&app, card);
    assert_eq!(
        g.translation,
        Vec2::new(300.0, 60.0),
        "frame 0: seed center"
    );
    assert!(
        (g.matrix2.x_axis.x - 2.0).abs() < 1e-6 && (g.matrix2.y_axis.y - 2.0).abs() < 1e-6,
        "frame 0: seed size via FLIP scale, got {:?}",
        g.matrix2
    );

    // Halfway: BOTH axes are laid out at the eased px. Without the flex
    // takeover the width reads 200 here (shrunk back into the slot) while the
    // height reads 75.
    step(&mut app, 0.5);
    assert_eq!(
        node_size(&app, card),
        (Val::Px(300.0), Val::Px(75.0)),
        "halfway: both axes fly in px"
    );
    let size = shown(&app);
    assert!(
        (size.x - 300.0).abs() < 1.0 && (size.y - 75.0).abs() < 1.0,
        "halfway: layout HONOURS the flown width (flex must not shrink it back), got {size:?}"
    );
    assert_eq!(
        global(&app, card).matrix2,
        Mat2::IDENTITY,
        "halfway: real layout owns the size, no residual FLIP scale"
    );

    // Settle restores the authored size AND the flex sizing the flight took.
    step(&mut app, 1.0);
    assert_eq!(
        node_size(&app, card),
        (Val::Percent(100.0), Val::Percent(100.0)),
        "settle restores the authored percentage"
    );
    assert_eq!(
        flex(&app),
        (0.0, authored_shrink),
        "settle restores the authored flex sizing"
    );
    let size = shown(&app);
    assert!(
        (size.x - 200.0).abs() < 1e-3 && (size.y - 50.0).abs() < 1e-3,
        "settled: back in the slot, got {size:?}"
    );
    assert_eq!(global(&app, card).translation, Vec2::new(100.0, 25.0));
    step(&mut app, 0.016);
    assert!(
        !app.world().resource::<Written>().0.contains(&card),
        "settled: no further global-transform writes"
    );
}

/// The flight is a STRAIGHT LINE from the seed to where the node settles.
///
/// The shape that used to bow: a fixed slot that does NOT center its child, so
/// the node is laid out top-left and its live layout center slides as the size
/// flight shrinks it (here from x = 300 down to 100). Easing toward that live
/// center makes the position quadratic in progress — the target is itself
/// linear in progress — and the two axes bow by different amounts, so the card
/// visibly arcs. Easing toward the SETTLED rect instead is linear at every
/// sample, in both axes at once.
#[test]
fn shared_flight_travels_in_a_straight_line() {
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    let slot = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(root),
        ))
        .id();
    let card = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                ..Default::default()
            },
            ChildOf(slot),
            TransitionInput {
                spec: Transition {
                    shared_element: Some(timing(1.0, Easing::Linear)),
                    ..Default::default()
                },
                width: Some(Length::Percent(100.0)),
                height: Some(Length::Percent(100.0)),
                ..Default::default()
            },
            TransitionState::default(),
            // Bigger in both axes and offset in both, so a bow in either one
            // shows up.
            seed(Vec2::new(500.0, 150.0), Vec2::new(600.0, 200.0)),
        ))
        .id();

    // Natural: the card fills its 200×50 slot at the row's start → (100, 25).
    let from = Vec2::new(500.0, 150.0);
    let to = Vec2::new(100.0, 25.0);

    step(&mut app, 0.0);
    assert_eq!(global(&app, card).translation, from, "frame 0: the seed");

    let mut elapsed = 0.0;
    for _ in 0..3 {
        step(&mut app, 0.25);
        elapsed += 0.25;
        let want = from.lerp(to, elapsed);
        let got = global(&app, card).translation;
        assert!(
            (got - want).length() < 1e-3,
            "p = {elapsed}: want {want:?} on the straight line, got {got:?}"
        );
    }

    step(&mut app, 0.25);
    assert_eq!(global(&app, card).translation, to, "settled");
}

/// A scroll landing under a flight moves where the node will settle; the
/// flight follows it — BOTH ends shift by the scroll (the node scroll-locks
/// with the content, the line stays straight) — and settles bit-exact on the
/// scrolled rect with no pop. The node's own width flight moves its center
/// too (start-aligned, so by half the width step): that motion is the
/// flight's own and must NOT read as external — the halfway point before the
/// scroll is exactly the seed-frame line's.
#[test]
fn shared_flight_follows_a_scroll_under_it() {
    use bevy::ui::{Overflow, ScrollPosition};
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    // A 100px-tall scrollport (the root is 1000×100) over 250px of content.
    let port = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                overflow: Overflow::scroll_y(),
                ..Default::default()
            },
            ChildOf(root),
        ))
        .id();
    app.world_mut().spawn((
        Node {
            width: Val::Px(100.0),
            height: Val::Px(200.0),
            flex_shrink: 0.0,
            ..Default::default()
        },
        ChildOf(port),
    ));
    let b = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(50.0),
                flex_shrink: 0.0,
                ..Default::default()
            },
            ChildOf(port),
            shared_spec(1.0),
            TransitionState::default(),
            seed(Vec2::new(300.0, 50.0), Vec2::new(100.0, 50.0)),
        ))
        .id();
    // Natural: 200×50 below the spacer → center (100, 225).
    let from = Vec2::new(300.0, 50.0);
    let to = Vec2::new(100.0, 225.0);

    step(&mut app, 0.0);
    assert_eq!(global(&app, b).translation, from, "frame 0: the seed");
    step(&mut app, 0.016);
    step(&mut app, 0.484);
    let got = global(&app, b).translation;
    let want = from.lerp(to, 0.5);
    assert!(
        (got - want).length() < 1e-3,
        "halfway, no scroll yet: the width flight's own re-flow is not external — want {want:?}, got {got:?}"
    );

    // Scroll the port by 50px: the settled rect is now (100, 175).
    app.world_mut()
        .entity_mut(port)
        .insert(ScrollPosition(Vec2::new(0.0, 50.0)));
    let scroll = Vec2::new(0.0, -50.0);
    let mut elapsed = 0.5;
    for _ in 0..2 {
        step(&mut app, 0.2);
        elapsed += 0.2;
        let want = (from + scroll).lerp(to + scroll, elapsed);
        let got = global(&app, b).translation;
        assert!(
            (got - want).length() < 1e-3,
            "p = {elapsed}: both ends shifted by the scroll — want {want:?}, got {got:?}"
        );
    }

    step(&mut app, 0.1);
    assert_eq!(
        global(&app, b).translation,
        to + scroll,
        "settled on the scrolled rect"
    );
    step(&mut app, 0.016);
    assert!(
        !app.world().resource::<Written>().0.contains(&b),
        "settled: no pop, no writes"
    );
    assert_eq!(global(&app, b).translation, to + scroll);
}

/// A seeded input with an authored `w`×`h` px size (restored on settle).
fn shared_input(secs: f32, w: f32, h: f32) -> TransitionInput {
    TransitionInput {
        spec: Transition {
            shared_element: Some(timing(secs, Easing::Linear)),
            ..Default::default()
        },
        width: Some(Length::Px(w)),
        height: Some(Length::Px(h)),
        ..Default::default()
    }
}

fn px_node(w: f32, h: f32) -> Node {
    Node {
        width: Val::Px(w),
        height: Val::Px(h),
        ..Default::default()
    }
}

/// Nested shared flights: an outer node (200×50 at the row start, seeded
/// from the same-size rect at (600, 50)) and an inner one (50×50 at the
/// outer's start, natural root centre (25, 25), seeded from the SAME
/// relative spot inside the outgoing outer — root (525, 50)). Each flies its
/// own straight root-space line: the inner shows its seed on frame 0 and
/// halfway is halfway — the outer's delta is never stacked on top of it.
#[test]
fn nested_shared_flights_ride_the_outer_once() {
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    let a = app
        .world_mut()
        .spawn((
            px_node(200.0, 50.0),
            ChildOf(root),
            shared_spec(1.0),
            TransitionState::default(),
            seed(Vec2::new(600.0, 50.0), Vec2::new(200.0, 50.0)),
        ))
        .id();
    let b = app
        .world_mut()
        .spawn((
            px_node(50.0, 50.0),
            ChildOf(a),
            shared_input(1.0, 50.0, 50.0),
            TransitionState::default(),
            seed(Vec2::new(525.0, 50.0), Vec2::new(50.0, 50.0)),
        ))
        .id();
    step(&mut app, 0.0);
    assert_eq!(global(&app, a).translation, Vec2::new(600.0, 50.0));
    assert_eq!(
        global(&app, b).translation,
        Vec2::new(525.0, 50.0),
        "frame 0: the inner node shows ITS seed, not seed + the outer's travel"
    );

    step(&mut app, 0.5);
    let ga = global(&app, a).translation;
    let gb = global(&app, b).translation;
    assert!(
        (ga - Vec2::new(350.0, 37.5)).length() < 1e-3,
        "outer halfway: {ga:?}"
    );
    assert!(
        (gb - Vec2::new(275.0, 37.5)).length() < 1e-3,
        "inner halfway along its own line (525,50) → (25,25): {gb:?}"
    );

    step(&mut app, 1.0);
    assert_eq!(global(&app, a).translation, Vec2::new(100.0, 25.0));
    assert_eq!(global(&app, b).translation, Vec2::new(25.0, 25.0));
}

/// An inner flight that settles BEFORE its ancestor's holds its root-space
/// destination until the ancestor settles too — it never jumps onto the
/// ancestor's still-moving frame. Outer: 100×50 seed → 200×50 natural, a
/// 1s flight (a size flight, so the inner's pristine rect keeps moving with
/// the eased width); inner: 50×50 at the outer's END (natural root (175, 25),
/// seeded from (625, 50)), a 0.5s flight.
#[test]
fn nested_shared_child_holds_its_destination_until_the_outer_settles() {
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    let a = app
        .world_mut()
        .spawn((
            Node {
                justify_content: JustifyContent::FlexEnd,
                ..px_node(200.0, 50.0)
            },
            ChildOf(root),
            shared_spec(1.0),
            TransitionState::default(),
            seed(Vec2::new(600.0, 50.0), Vec2::new(100.0, 50.0)),
        ))
        .id();
    let b = app
        .world_mut()
        .spawn((
            px_node(50.0, 50.0),
            ChildOf(a),
            shared_input(0.5, 50.0, 50.0),
            TransitionState::default(),
            seed(Vec2::new(625.0, 50.0), Vec2::new(50.0, 50.0)),
        ))
        .id();
    step(&mut app, 0.0);
    assert_eq!(
        global(&app, b).translation,
        Vec2::new(625.0, 50.0),
        "seed frame"
    );

    step(&mut app, 0.25);
    let gb = global(&app, b).translation;
    assert!(
        (gb - Vec2::new(400.0, 37.5)).length() < 1e-3,
        "inner halfway through its 0.5s flight: {gb:?}"
    );

    step(&mut app, 0.5);
    let ga = global(&app, a).translation;
    let gb = global(&app, b).translation;
    assert!(
        (ga - Vec2::new(225.0, 31.25)).length() < 1e-3,
        "outer at 3/4: {ga:?}"
    );
    assert!(
        (gb - Vec2::new(175.0, 25.0)).length() < 1e-3,
        "inner settled: held at its root-space destination while the outer flies: {gb:?}"
    );
    assert!(
        app.world().resource::<Written>().0.contains(&b),
        "holding = still composing (the pristine rect is elsewhere)"
    );

    step(&mut app, 0.5);
    for _ in 0..3 {
        step(&mut app, 0.016);
    }
    assert_eq!(global(&app, a).translation, Vec2::new(100.0, 25.0));
    assert_eq!(global(&app, b).translation, Vec2::new(175.0, 25.0));
    assert!(
        !app.world().resource::<Written>().0.contains(&b),
        "released once the outer settled: no more writes"
    );
}

/// The same holds under a plain `transition: { layout }` ancestor: row
/// `[S 100][K 200]`, S removed on the frame the shared node mounts inside K.
/// K eases from x 200 → 100; the flyer shows its seed regardless.
#[test]
fn shared_flight_under_a_plain_layout_ease_is_root_anchored() {
    let mut app = shared_app();
    let root = app.world_mut().spawn(root_row()).id();
    let s = app.world_mut().spawn((square(100.0), ChildOf(root))).id();
    let k = app
        .world_mut()
        .spawn((
            px_node(200.0, 100.0),
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    step(&mut app, 0.016);
    assert_eq!(x_of(&app, k), 200.0);
    app.world_mut().entity_mut(s).despawn();
    // Natural root centre after the removal: (25, 25); seeded 100px right.
    let b = app
        .world_mut()
        .spawn((
            px_node(50.0, 50.0),
            ChildOf(k),
            shared_input(1.0, 50.0, 50.0),
            TransitionState::default(),
            seed(Vec2::new(125.0, 25.0), Vec2::new(50.0, 50.0)),
        ))
        .id();
    step(&mut app, 0.0);
    assert_eq!(
        x_of(&app, k),
        200.0,
        "change frame: K still shown at its old spot"
    );
    assert_eq!(
        global(&app, b).translation,
        Vec2::new(125.0, 25.0),
        "the flyer shows its seed, not seed + K's delta"
    );
    step(&mut app, 0.5);
    assert!((x_of(&app, k) - 150.0).abs() < 1e-3);
    let gb = global(&app, b).translation;
    assert!(
        (gb - Vec2::new(75.0, 25.0)).length() < 1e-3,
        "halfway on its own line: {gb:?}"
    );
}
