//! Tests for the `layout` transition channel: the rect-easing rules
//! ([`LayoutChannel`]) and the post-layout composition system
//! ([`drive_layout_transitions`]) observed through `UiGlobalTransform`.
use super::layout::{LayoutChannel, LayoutDelta, LayoutRect};
use super::tests::timing;
use super::*;
use crate::animations::Easing;

const R0: LayoutRect = [150.0, 50.0, 100.0, 100.0];
const R1: LayoutRect = [50.0, 50.0, 100.0, 100.0];

/// Mount rule: the first rect adopts silently (no reading to apply); a real
/// move then eases from the old rect and settles bit-exact on the new one.
#[test]
fn layout_channel_seeds_silently_then_eases_and_settles() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    assert_eq!(ch.drive(R0, &spec, false, 0.016), None);
    // The frame of the change reads the OLD rect (progress 0).
    assert_eq!(ch.drive(R1, &spec, false, 0.0), Some(R0));
    let mid = ch.drive(R1, &spec, false, 0.5).expect("mid-flight");
    assert!((mid[0] - 100.0).abs() < 1e-3, "halfway: {mid:?}");
    assert_eq!(
        ch.drive(R1, &spec, false, 10.0),
        None,
        "settled = no reading"
    );
    assert!(!ch.in_flight());
}

/// A retarget mid-flight continues from the current reading, not the start.
#[test]
fn layout_channel_retargets_from_current() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, &spec, false, 0.0);
    ch.drive(R1, &spec, false, 0.0);
    let mid = ch.drive(R1, &spec, false, 0.5).unwrap();
    let back = ch.drive(R0, &spec, false, 0.0).unwrap();
    assert_eq!(back, mid, "retarget frame holds the current reading");
    let later = ch.drive(R0, &spec, false, 0.5).unwrap();
    assert!(
        later[0] > mid[0] && later[0] < R0[0],
        "heading back: {later:?}"
    );
}

/// Sub-half-pixel churn (rounding, hinting) never starts an animation.
#[test]
fn layout_channel_snaps_below_half_pixel() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, &spec, false, 0.0);
    let nudged = [150.4, 50.0, 100.0, 100.3];
    assert_eq!(ch.drive(nudged, &spec, false, 0.0), None);
    assert!(!ch.in_flight());
    // Exactly-at-threshold moves DO animate.
    let moved = [150.4, 50.5, 100.0, 100.3];
    assert!(ch.drive(moved, &spec, false, 0.0).is_some());
}

/// Zero-size endpoints: to-0 has no pixels to animate (snap); from-0 grows
/// in place — scale 0→1 about the FINAL rect, the stale old position ignored.
#[test]
fn layout_channel_zero_size_rules() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, &spec, false, 0.0);
    let hidden = [0.0, 0.0, 0.0, 0.0];
    assert_eq!(ch.drive(hidden, &spec, false, 0.0), None, "to-0 snaps");
    assert!(!ch.in_flight());
    // Shown again elsewhere: grows from a point at the new center.
    let first = ch.drive(R1, &spec, false, 0.0).expect("from-0 eases");
    assert_eq!(first, [R1[0], R1[1], 0.0, 0.0]);
    let mid = ch.drive(R1, &spec, false, 0.5).unwrap();
    assert!(
        (mid[0] - R1[0]).abs() < 1e-3 && (mid[2] - 50.0).abs() < 1e-3,
        "{mid:?}"
    );
}

/// While the node's own `size` channel is writing its `Node` each frame
/// (`adopt`), the layout channel adopts every rect silently — no retarget.
#[test]
fn layout_channel_adopts_when_size_channel_owns_the_rect() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, &spec, false, 0.0);
    assert_eq!(ch.drive(R1, &spec, true, 0.0), None);
    assert!(!ch.in_flight());
    // The frame after an adopt is a grace frame (the writer's settle step).
    assert_eq!(ch.drive(R0, &spec, false, 0.0), None);
    assert!(!ch.in_flight());
    // A mid-flight adopt cancels the ease.
    ch.drive(R1, &spec, false, 0.0);
    assert!(ch.in_flight());
    assert_eq!(ch.drive(R1, &spec, true, 0.0), None);
    assert!(!ch.in_flight());
}

/// A sub-epsilon retarget MID-FLIGHT must not cancel the ease: the target
/// nudges silently and the runner keeps going (a fractional layout shift
/// while easing is common — a settled-only snap rule would pop).
#[test]
fn layout_channel_sub_epsilon_retarget_mid_flight_keeps_easing() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, &spec, false, 0.0);
    ch.drive(R1, &spec, false, 0.0);
    let nudged = [R1[0] + 0.2, R1[1], R1[2], R1[3]];
    let mid = ch.drive(nudged, &spec, false, 0.5).expect("still easing");
    assert!(ch.in_flight());
    assert!(
        (mid[0] - 100.1).abs() < 1e-3,
        "halfway to the nudged target: {mid:?}"
    );
    assert_eq!(ch.drive(nudged, &spec, false, 10.0), None);
}

/// The `size` channel's settle frame: `drive_transitions` (Update) writes the
/// final `Node` value and clears its runner in the same call, so by
/// PostUpdate `adopt` is already false while the rect still steps by the
/// last size increment. The frame after an adopt adopts once more (a grace
/// frame) instead of arming a full-duration ease for that tail.
#[test]
fn layout_channel_adopt_tail_swallows_the_settle_step() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, &spec, false, 0.0);
    assert_eq!(ch.drive(R1, &spec, true, 0.016), None);
    let settled = [R1[0] + 5.5, R1[1], R1[2] + 11.0, R1[3]];
    assert_eq!(
        ch.drive(settled, &spec, false, 0.016),
        None,
        "grace frame adopts"
    );
    assert!(!ch.in_flight());
    // A change on the NEXT frame animates again.
    assert!(ch.drive(R0, &spec, false, 0.0).is_some());
}

/// The from-zero first sample is a point; the derived delta still has a
/// strictly positive scale (a zero scale would compose a singular global
/// for the whole subtree while the clock is paused).
#[test]
fn from_zero_delta_is_never_singular() {
    let d = LayoutDelta::between([50.0, 50.0, 0.0, 0.0], R1);
    assert!(d.scale.x > 0.0 && d.scale.y > 0.0, "{d:?}");
    assert!(d.scale.x < 0.01);
}

/// `reset` forgets everything: the next sight re-seeds (mount rule again).
#[test]
fn layout_channel_reset_reseeds() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, &spec, false, 0.0);
    ch.drive(R1, &spec, false, 0.0);
    assert!(ch.in_flight());
    ch.reset();
    assert!(!ch.in_flight());
    assert_eq!(ch.drive(R0, &spec, false, 0.0), None);
}

// --- System tests: real bevy_ui layout, observed through `UiGlobalTransform` ---

use super::layout::drive_layout_transitions;
use bevy::math::{Affine2, Mat2};
use bevy::ui::ui_surface::UiSurface;
use bevy::ui::{ComputedNode, UiGlobalTransform};
use std::time::Duration;

const TARGET: bevy::math::UVec2 = bevy::math::UVec2::new(1000, 100);

/// Which entities had their global transform written this frame (probe
/// ordered right after the driver, inside the same schedule).
#[derive(Resource, Default)]
struct Written(Vec<Entity>);

/// A headless layout app mirroring bevy_ui's own layout test harness (camera
/// with a dummy 1000×100 render target, scale factor 1), plus the layout
/// transition driver and a change probe.
fn layout_app() -> App {
    use bevy::app::{HierarchyPropagatePlugin, PropagateSet, TaskPoolPlugin};
    use bevy::ui::{ComputedUiRenderTargetInfo, ComputedUiTargetCamera};
    let mut app = App::new();
    app.add_plugins(TaskPoolPlugin::default());
    app.add_plugins(HierarchyPropagatePlugin::<ComputedUiTargetCamera>::new(
        PostUpdate,
    ));
    app.add_plugins(HierarchyPropagatePlugin::<ComputedUiRenderTargetInfo>::new(
        PostUpdate,
    ));
    app.init_resource::<bevy::ui::UiScale>();
    app.init_resource::<UiSurface>();
    app.init_resource::<bevy::text::TextPipeline>();
    app.init_resource::<bevy::text::FontCx>();
    app.init_resource::<bevy::text::ScaleCx>();
    app.init_resource::<bevy::transform::StaticTransformOptimizations>();
    app.insert_resource(Time::<()>::default());
    app.init_resource::<Written>();
    app.add_systems(
        PostUpdate,
        (
            ApplyDeferred,
            bevy::ui::update::propagate_ui_target_cameras,
            bevy::ui::ui_layout_system,
            drive_layout_transitions,
            |q: Query<Entity, Changed<UiGlobalTransform>>, mut w: ResMut<Written>| {
                w.0 = q.iter().collect();
            },
        )
            .chain(),
    );
    app.configure_sets(
        PostUpdate,
        PropagateSet::<ComputedUiTargetCamera>::default()
            .after(bevy::ui::update::propagate_ui_target_cameras)
            .before(bevy::ui::ui_layout_system),
    );
    app.configure_sets(
        PostUpdate,
        PropagateSet::<ComputedUiRenderTargetInfo>::default()
            .after(bevy::ui::update::propagate_ui_target_cameras)
            .before(bevy::ui::ui_layout_system),
    );
    use bevy::camera::{Camera, Camera2d, ComputedCameraValues, RenderTargetInfo, Viewport};
    app.world_mut().spawn((
        Camera2d,
        Camera {
            computed: ComputedCameraValues {
                target_info: Some(RenderTargetInfo {
                    physical_size: TARGET,
                    scale_factor: 1.0,
                }),
                ..Default::default()
            },
            viewport: Some(Viewport {
                physical_size: TARGET,
                ..Default::default()
            }),
            ..Default::default()
        },
    ));
    app
}

fn step(app: &mut App, secs: f32) {
    app.world_mut()
        .resource_mut::<Time>()
        .advance_by(Duration::from_secs_f32(secs));
    app.update();
}

fn layout_spec(secs: f32) -> TransitionInput {
    TransitionInput {
        spec: Transition {
            layout: Some(timing(secs, Easing::Linear)),
            ..Default::default()
        },
        ..Default::default()
    }
}

fn square(px: f32) -> Node {
    Node {
        width: Val::Px(px),
        height: Val::Px(px),
        ..Default::default()
    }
}

fn root_row() -> Node {
    Node {
        width: Val::Percent(100.0),
        height: Val::Percent(100.0),
        flex_direction: FlexDirection::Row,
        ..Default::default()
    }
}

fn global(app: &App, e: Entity) -> Affine2 {
    **app.world().entity(e).get::<UiGlobalTransform>().unwrap()
}

fn x_of(app: &App, e: Entity) -> f32 {
    global(app, e).translation.x
}

/// Row `[A][B]`; remove A. B's layout snaps 150→50, but its global eases:
/// the change frame shows the OLD position (no pop), halfway is halfway,
/// and settle is bit-exact on bevy's own value with no further writes.
#[test]
fn sibling_removal_eases_from_old_position_and_settles_quietly() {
    let mut app = layout_app();
    let root = app.world_mut().spawn(root_row()).id();
    let a = app.world_mut().spawn((square(100.0), ChildOf(root))).id();
    let b = app
        .world_mut()
        .spawn((
            square(100.0),
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    step(&mut app, 0.016);
    assert_eq!(x_of(&app, b), 150.0, "pristine layout: after A");

    app.world_mut().entity_mut(a).despawn();
    step(&mut app, 0.0);
    assert_eq!(x_of(&app, b), 150.0, "change frame shows the old rect");
    step(&mut app, 0.5);
    assert!(
        (x_of(&app, b) - 100.0).abs() < 1e-3,
        "halfway: {}",
        x_of(&app, b)
    );
    step(&mut app, 1.0);
    assert_eq!(x_of(&app, b), 50.0, "settled on bevy's value");
    step(&mut app, 0.016);
    assert!(
        !app.world().resource::<Written>().0.contains(&b),
        "settled: no global-transform writes"
    );
}

/// The delta applies to the whole subtree: a child of the moving node is
/// carried by exactly its parent's offset.
#[test]
fn descendants_ride_along_with_the_animating_node() {
    let mut app = layout_app();
    let root = app.world_mut().spawn(root_row()).id();
    let a = app.world_mut().spawn((square(100.0), ChildOf(root))).id();
    let b = app
        .world_mut()
        .spawn((
            square(100.0),
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    let c = app
        .world_mut()
        .spawn((
            Node {
                margin: UiRect::left(Val::Px(20.0)),
                ..square(30.0)
            },
            ChildOf(b),
        ))
        .id();
    step(&mut app, 0.016);
    let c_before = x_of(&app, c);
    app.world_mut().entity_mut(a).despawn();
    step(&mut app, 0.0);
    assert_eq!(x_of(&app, c), c_before, "child shows its old position too");
    step(&mut app, 0.5);
    assert!((x_of(&app, c) - (c_before - 50.0)).abs() < 1e-3);
}

/// A nested layout transition animates only its OWN local delta: a child
/// whose local rect is unchanged rides its parent's offset once, never
/// twice.
#[test]
fn nested_layout_transitions_do_not_double_animate() {
    let mut app = layout_app();
    let root = app.world_mut().spawn(root_row()).id();
    let a = app.world_mut().spawn((square(100.0), ChildOf(root))).id();
    let k = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(200.0),
                height: Val::Px(100.0),
                ..Default::default()
            },
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    let c = app
        .world_mut()
        .spawn((
            square(50.0),
            ChildOf(k),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    step(&mut app, 0.016);
    let (k0, c0) = (x_of(&app, k), x_of(&app, c));
    app.world_mut().entity_mut(a).despawn();
    step(&mut app, 0.5);
    assert!((x_of(&app, k) - (k0 - 50.0)).abs() < 1e-3);
    assert!(
        (x_of(&app, c) - (c0 - 50.0)).abs() < 1e-3,
        "child moved by the parent's offset only: {} vs {}",
        x_of(&app, c),
        c0 - 50.0
    );
}

/// Unsetting `transition.layout` mid-flight snaps to bevy's own value.
#[test]
fn unsetting_layout_spec_mid_flight_snaps() {
    let mut app = layout_app();
    let root = app.world_mut().spawn(root_row()).id();
    let a = app.world_mut().spawn((square(100.0), ChildOf(root))).id();
    let b = app
        .world_mut()
        .spawn((
            square(100.0),
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    step(&mut app, 0.016);
    app.world_mut().entity_mut(a).despawn();
    step(&mut app, 0.5);
    assert!((x_of(&app, b) - 100.0).abs() < 1e-3);
    app.world_mut()
        .entity_mut(b)
        .insert(TransitionInput::default());
    step(&mut app, 0.0);
    assert_eq!(x_of(&app, b), 50.0, "snapped");
}

/// A size change scales the shown pixels about the node's center: the
/// change frame shows the old 100-wide rect at its old center (scale 0.5
/// of the new 200-wide layout).
#[test]
fn size_change_scales_about_the_old_rect() {
    let mut app = layout_app();
    let root = app.world_mut().spawn(root_row()).id();
    let _a = app.world_mut().spawn((square(100.0), ChildOf(root))).id();
    let b = app
        .world_mut()
        .spawn((
            square(100.0),
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    step(&mut app, 0.016);
    app.world_mut()
        .entity_mut(b)
        .get_mut::<Node>()
        .unwrap()
        .width = Val::Px(200.0);
    step(&mut app, 0.0);
    let g = global(&app, b);
    assert_eq!(g.translation.x, 150.0, "old center");
    assert!(
        (g.matrix2.x_axis.x - 0.5).abs() < 1e-6,
        "x scale: {}",
        g.matrix2.x_axis.x
    );
    assert!((g.matrix2.y_axis.y - 1.0).abs() < 1e-6);
    step(&mut app, 10.0);
    let g = global(&app, b);
    assert_eq!(g.translation.x, 200.0);
    assert_eq!(g.matrix2, bevy::math::Mat2::IDENTITY);
}

/// The change frame reproduces the previously DISPLAYED rect bit-exact even
/// under fractional layout: the delta is measured from the same rounded
/// rect bevy's walk consumed, so no ≤1px rounding shimmer at ease start.
#[test]
fn change_frame_matches_previously_displayed_rect_under_fractional_layout() {
    let mut app = layout_app();
    let root = app
        .world_mut()
        .spawn(Node {
            justify_content: JustifyContent::Center,
            ..root_row()
        })
        .id();
    let odd = |w: f32| Node {
        width: Val::Px(w),
        height: Val::Px(33.3),
        ..Default::default()
    };
    let a = app.world_mut().spawn((odd(33.3), ChildOf(root))).id();
    let b = app
        .world_mut()
        .spawn((
            odd(50.7),
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    step(&mut app, 0.016);
    let displayed = global(&app, b);
    let displayed_size = app.world().entity(b).get::<ComputedNode>().unwrap().size();
    app.world_mut().entity_mut(a).despawn();
    step(&mut app, 0.0);
    let g = global(&app, b);
    let size = app.world().entity(b).get::<ComputedNode>().unwrap().size();
    assert_eq!(
        g.translation, displayed.translation,
        "change frame == last displayed"
    );
    // bevy's own rounded width may flip by a pixel across the change; the
    // shown width is still exactly the previously displayed one.
    assert!((g.matrix2.x_axis.x * size.x - displayed_size.x).abs() < 1e-3);
}

/// A `{ animated }` binding on one of the node's own `Node` fields owns its
/// rect frame-by-frame: the layout channel adopts instead of chasing (no
/// per-frame re-arm stall).
#[test]
fn own_node_binding_makes_the_layout_channel_adopt() {
    use crate::animations::protocol::Binding;
    use crate::animations::{AnimatableProperty, AnimatedBindings, AnimatedNode};
    let mut app = layout_app();
    let root = app.world_mut().spawn(root_row()).id();
    let _a = app.world_mut().spawn((square(100.0), ChildOf(root))).id();
    let b = app
        .world_mut()
        .spawn((
            square(100.0),
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
            AnimatedNode(AnimatedBindings(
                [(AnimatableProperty::Width, Binding::Shared { id: 1 })].into(),
            )),
        ))
        .id();
    step(&mut app, 0.016);
    // Stand-in for the binding's per-frame write.
    app.world_mut()
        .entity_mut(b)
        .get_mut::<Node>()
        .unwrap()
        .width = Val::Px(200.0);
    step(&mut app, 0.0);
    let g = global(&app, b);
    assert_eq!(g.translation.x, 200.0, "adopted: bevy's own value");
    assert_eq!(g.matrix2, bevy::math::Mat2::IDENTITY);
}

/// The FLIP scale is the node's OWN: a child of a resizing parent is not
/// scaled — it rides the parent's translation and sits at its final offset
/// from the parent's shown center (container eases, content stays crisp).
#[test]
fn children_ride_translation_but_not_scale() {
    let mut app = layout_app();
    let root = app.world_mut().spawn(root_row()).id();
    let _a = app.world_mut().spawn((square(100.0), ChildOf(root))).id();
    let b = app
        .world_mut()
        .spawn((
            Node {
                align_items: AlignItems::Center,
                ..square(100.0)
            },
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    let c = app
        .world_mut()
        .spawn((
            Node {
                margin: UiRect::left(Val::Px(10.0)),
                ..square(30.0)
            },
            ChildOf(b),
        ))
        .id();
    step(&mut app, 0.016);
    // B doubles its width: its center moves 150 → 200; C's final center is
    // 25px from B's left edge (10 margin + 15 half-width) = −75 from B's
    // center (half-width 100).
    app.world_mut()
        .entity_mut(b)
        .get_mut::<Node>()
        .unwrap()
        .width = Val::Px(200.0);
    step(&mut app, 0.0);
    let gb = global(&app, b);
    let gc = global(&app, c);
    assert!((gb.matrix2.x_axis.x - 0.5).abs() < 1e-6, "B itself scales");
    assert_eq!(gc.matrix2, bevy::math::Mat2::IDENTITY, "C does not");
    assert_eq!(
        gc.translation.x,
        gb.translation.x - 75.0,
        "C at its final offset"
    );
}

// --- Shared-element flights: seeded first sight, observed through real layout ---

use super::shared::{SharedRect, SharedSeed};

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
