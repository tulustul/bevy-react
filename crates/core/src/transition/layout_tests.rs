//! Tests for the `layout` transition channel: the rect-easing rules
//! ([`LayoutChannel`]) and the post-layout composition system
//! ([`drive_layout_transitions`]) observed through `UiGlobalTransform`.
use super::layout::{LayoutChannel, LayoutDelta, LayoutRect, RectWriter};
use super::tests::timing;
use super::*;
use crate::animations::Easing;

pub(super) const R0: LayoutRect = [150.0, 50.0, 100.0, 100.0];
pub(super) const R1: LayoutRect = [50.0, 50.0, 100.0, 100.0];

/// Mount rule: the first rect adopts silently (no reading to apply); a real
/// move then eases from the old rect and settles bit-exact on the new one.
#[test]
fn layout_channel_seeds_silently_then_eases_and_settles() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    assert_eq!(ch.drive(R0, R0, &spec, RectWriter::None, 0.016), None);
    // The frame of the change reads the OLD rect (progress 0).
    assert_eq!(ch.drive(R1, R1, &spec, RectWriter::None, 0.0), Some(R0));
    let mid = ch
        .drive(R1, R1, &spec, RectWriter::None, 0.5)
        .expect("mid-flight");
    assert!((mid[0] - 100.0).abs() < 1e-3, "halfway: {mid:?}");
    assert_eq!(
        ch.drive(R1, R1, &spec, RectWriter::None, 10.0),
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
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    ch.drive(R1, R1, &spec, RectWriter::None, 0.0);
    let mid = ch.drive(R1, R1, &spec, RectWriter::None, 0.5).unwrap();
    let back = ch.drive(R0, R0, &spec, RectWriter::None, 0.0).unwrap();
    assert_eq!(back, mid, "retarget frame holds the current reading");
    let later = ch.drive(R0, R0, &spec, RectWriter::None, 0.5).unwrap();
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
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    let nudged = [150.4, 50.0, 100.0, 100.3];
    assert_eq!(ch.drive(nudged, nudged, &spec, RectWriter::None, 0.0), None);
    assert!(!ch.in_flight());
    // Exactly-at-threshold moves DO animate.
    let moved = [150.4, 50.5, 100.0, 100.3];
    assert!(
        ch.drive(moved, moved, &spec, RectWriter::None, 0.0)
            .is_some()
    );
}

/// Zero-size endpoints: to-0 has no pixels to animate (snap); from-0 grows
/// in place — scale 0→1 about the FINAL rect, the stale old position ignored.
#[test]
fn layout_channel_zero_size_rules() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    let hidden = [0.0, 0.0, 0.0, 0.0];
    assert_eq!(
        ch.drive(hidden, hidden, &spec, RectWriter::None, 0.0),
        None,
        "to-0 snaps"
    );
    assert!(!ch.in_flight());
    // Shown again elsewhere: grows from a point at the new center.
    let first = ch
        .drive(R1, R1, &spec, RectWriter::None, 0.0)
        .expect("from-0 eases");
    assert_eq!(first, [R1[0], R1[1], 0.0, 0.0]);
    let mid = ch.drive(R1, R1, &spec, RectWriter::None, 0.5).unwrap();
    assert!(
        (mid[0] - R1[0]).abs() < 1e-3 && (mid[2] - 50.0).abs() < 1e-3,
        "{mid:?}"
    );
}

/// While the node's own `size` channel writes its `Node` each frame
/// (`RectWriter::SizeChannel`), rect steps the size step explains — a centred
/// node's centre following its own growth — adopt silently, grace frame
/// included; a `{ animated }` binding adopts everything, and cancels a
/// running ease (the binding owns the rect now).
#[test]
fn layout_channel_adopts_size_explained_steps_under_a_size_flight() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    let grown = [R0[0] + 5.0, R0[1], R0[2] + 10.0, R0[3]];
    assert_eq!(
        ch.drive(grown, grown, &spec, RectWriter::SizeChannel, 0.016),
        None
    );
    assert!(!ch.in_flight());
    // The frame after (the writer's settle step) is judged the same way.
    let settled = [grown[0] + 5.0, grown[1], grown[2] + 10.0, grown[3]];
    assert_eq!(
        ch.drive(settled, settled, &spec, RectWriter::None, 0.016),
        None,
        "grace frame adopts an explained step"
    );
    assert!(!ch.in_flight());
    // A binding: blind adopt, mid-flight too.
    ch.drive(R1, R1, &spec, RectWriter::None, 0.0);
    assert!(ch.in_flight());
    assert_eq!(ch.drive(R1, R1, &spec, RectWriter::Binding, 0.0), None);
    assert!(!ch.in_flight());
}

/// A jump the size step cannot explain — a flex-direction swap landing while
/// the bars' own sizes ease — is a real move: it eases translate-only from
/// the last reading, the size shown being layout's, and the target follows
/// the live rect without restarting until the ease lands.
#[test]
fn layout_channel_eases_an_unexplained_jump_under_a_size_flight_translate_only() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    // 100px of x for a 2px size step.
    let jumped = [R1[0], R1[1], R1[2] + 2.0, R1[3]];
    let shown = ch
        .drive(jumped, jumped, &spec, RectWriter::SizeChannel, 0.0)
        .expect("eases");
    assert_eq!(
        shown,
        [R0[0], R0[1], jumped[2], jumped[3]],
        "old position, live size"
    );
    assert!(ch.in_flight());
    // Mid-flight the live rect keeps re-flowing with the size: the target
    // moves, the ease does not restart (halfway from R0 to the NEW target).
    let moved = [jumped[0] + 4.0, jumped[1], jumped[2] + 2.0, jumped[3]];
    let mid = ch
        .drive(moved, moved, &spec, RectWriter::SizeChannel, 0.5)
        .expect("still easing");
    assert!(
        (mid[0] - (R0[0] + 0.5 * (moved[0] - R0[0]))).abs() < 1e-3,
        "{mid:?}"
    );
    assert_eq!([mid[2], mid[3]], [moved[2], moved[3]], "size is layout's");
    assert_eq!(
        ch.drive(moved, moved, &spec, RectWriter::SizeChannel, 0.6),
        None,
        "landed on the target"
    );
    assert!(!ch.in_flight());
    // Back to adopting the size flight's own re-flow.
    let stepped = [moved[0] + 1.0, moved[1], moved[2] + 2.0, moved[3]];
    assert_eq!(
        ch.drive(stepped, stepped, &spec, RectWriter::SizeChannel, 0.016),
        None
    );
}

/// The yardstick is the size CHANNEL's own step, not the measured one: a
/// flex squeeze snaps the measured size to its final value on the change
/// frame (a 160px "step"), which would explain any move — the channel's own
/// 2px step does not, and the move eases.
#[test]
fn layout_channel_judges_by_the_size_channels_own_step_not_the_squeezed_measure() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.note_own_size([Some(100.0), Some(100.0), None, None]);
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    // Measured: 100px of x, height squeezed 100 → 40; own step: 2px.
    let squeezed = [R1[0], R1[1], R1[2], 40.0];
    ch.note_own_size([Some(102.0), Some(98.0), None, None]);
    let shown = ch
        .drive(squeezed, squeezed, &spec, RectWriter::SizeChannel, 0.0)
        .expect("eases: the squeeze is not the channel's doing");
    assert_eq!(shown, [R0[0], R0[1], squeezed[2], squeezed[3]]);
    // The same measure with no px readings to judge by falls back to the
    // measured step, which explains it.
    let mut ch = LayoutChannel::default();
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    ch.note_own_size([None; 4]);
    assert_eq!(
        ch.drive(squeezed, squeezed, &spec, RectWriter::SizeChannel, 0.0),
        None
    );
}

/// A size flight starting under a running `layout` ease does not cancel it:
/// the ease carries on translate-only, following the live rect.
#[test]
fn layout_channel_keeps_easing_when_a_size_flight_starts_mid_flight() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    ch.drive(R1, R1, &spec, RectWriter::None, 0.0);
    assert!(ch.in_flight());
    let grown = [R1[0] + 5.0, R1[1], R1[2] + 10.0, R1[3]];
    let mid = ch
        .drive(grown, grown, &spec, RectWriter::SizeChannel, 0.5)
        .expect("still easing");
    assert!(ch.in_flight());
    assert!(
        (mid[0] - (R0[0] + 0.5 * (grown[0] - R0[0]))).abs() < 1e-3,
        "{mid:?}"
    );
    assert_eq!([mid[2], mid[3]], [grown[2], grown[3]]);
}

/// A sub-epsilon retarget MID-FLIGHT must not cancel the ease: the target
/// nudges silently and the runner keeps going (a fractional layout shift
/// while easing is common — a settled-only snap rule would pop).
#[test]
fn layout_channel_sub_epsilon_retarget_mid_flight_keeps_easing() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    ch.drive(R1, R1, &spec, RectWriter::None, 0.0);
    let nudged = [R1[0] + 0.2, R1[1], R1[2], R1[3]];
    let mid = ch
        .drive(nudged, nudged, &spec, RectWriter::None, 0.5)
        .expect("still easing");
    assert!(ch.in_flight());
    assert!(
        (mid[0] - 100.1).abs() < 1e-3,
        "halfway to the nudged target: {mid:?}"
    );
    assert_eq!(
        ch.drive(nudged, nudged, &spec, RectWriter::None, 10.0),
        None
    );
}

/// The `size` channel's settle frame: `drive_transitions` (Update) writes the
/// final `Node` value and clears its runner in the same call, so by
/// PostUpdate no writer is reported while the rect still steps by the last
/// size increment. The frame after a size frame is judged by the size rule
/// once more (a grace frame) instead of arming a full-duration ease for
/// that tail.
#[test]
fn layout_channel_adopt_tail_swallows_the_settle_step() {
    let mut ch = LayoutChannel::default();
    let spec = timing(1.0, Easing::Linear);
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    let grown = [R0[0] + 5.0, R0[1], R0[2] + 10.0, R0[3]];
    assert_eq!(
        ch.drive(grown, grown, &spec, RectWriter::SizeChannel, 0.016),
        None
    );
    let settled = [grown[0] + 5.5, grown[1], grown[2] + 11.0, grown[3]];
    assert_eq!(
        ch.drive(settled, settled, &spec, RectWriter::None, 0.016),
        None,
        "grace frame adopts"
    );
    assert!(!ch.in_flight());
    // A change on the NEXT frame animates again.
    assert!(ch.drive(R0, R0, &spec, RectWriter::None, 0.0).is_some());
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
    ch.drive(R0, R0, &spec, RectWriter::None, 0.0);
    ch.drive(R1, R1, &spec, RectWriter::None, 0.0);
    assert!(ch.in_flight());
    ch.reset();
    assert!(!ch.in_flight());
    assert_eq!(ch.drive(R0, R0, &spec, RectWriter::None, 0.0), None);
}

// --- System tests: real bevy_ui layout, observed through `UiGlobalTransform` ---

use super::layout::drive_layout_transitions;
use bevy::math::Affine2;
use bevy::ui::ui_surface::UiSurface;
use bevy::ui::{ComputedNode, UiGlobalTransform};
use std::time::Duration;

const TARGET: bevy::math::UVec2 = bevy::math::UVec2::new(1000, 100);

/// Which entities had their global transform written this frame (probe
/// ordered right after the driver, inside the same schedule).
#[derive(Resource, Default)]
pub(super) struct Written(pub(super) Vec<Entity>);

/// A headless layout app mirroring bevy_ui's own layout test harness (camera
/// with a dummy 1000×100 render target, scale factor 1), plus the layout
/// transition driver and a change probe.
pub(super) fn layout_app() -> App {
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

pub(super) fn step(app: &mut App, secs: f32) {
    app.world_mut()
        .resource_mut::<Time>()
        .advance_by(Duration::from_secs_f32(secs));
    app.update();
}

pub(super) fn layout_spec(secs: f32) -> TransitionInput {
    TransitionInput {
        spec: Transition {
            layout: Some(timing(secs, Easing::Linear)),
            ..Default::default()
        },
        ..Default::default()
    }
}

pub(super) fn square(px: f32) -> Node {
    Node {
        width: Val::Px(px),
        height: Val::Px(px),
        ..Default::default()
    }
}

pub(super) fn root_row() -> Node {
    Node {
        width: Val::Percent(100.0),
        height: Val::Percent(100.0),
        flex_direction: FlexDirection::Row,
        ..Default::default()
    }
}

pub(super) fn global(app: &App, e: Entity) -> Affine2 {
    **app.world().entity(e).get::<UiGlobalTransform>().unwrap()
}

pub(super) fn x_of(app: &App, e: Entity) -> f32 {
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

/// Under `layoutRounding: false` (bevy's `LayoutConfig { use_rounding:
/// false }`, inherited) the channel must measure the UNROUNDED rect, like
/// bevy's own walk: row `[A 33.3][B 50]` lays B's center at 58.3, and
/// removing A must show 58.3 on the change frame — not the rounded 58 an
/// always-rounded measure would have remembered.
#[test]
fn layout_channel_measures_unrounded_under_layout_config() {
    use bevy::ui::LayoutConfig;
    let mut app = layout_app();
    let root = app
        .world_mut()
        .spawn((
            root_row(),
            LayoutConfig {
                use_rounding: false,
            },
        ))
        .id();
    let a = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(33.3),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(root),
        ))
        .id();
    let b = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(50.0),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(root),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    step(&mut app, 0.016);
    assert!(
        (x_of(&app, b) - 58.3).abs() < 1e-3,
        "pristine unrounded layout, got {}",
        x_of(&app, b)
    );
    app.world_mut().entity_mut(a).despawn();
    step(&mut app, 0.0);
    assert!(
        (x_of(&app, b) - 58.3).abs() < 1e-3,
        "change frame shows the old UNROUNDED rect, got {}",
        x_of(&app, b)
    );
    step(&mut app, 1.0);
    assert_eq!(x_of(&app, b), 25.0, "settled on bevy's unrounded value");
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

/// Inheritance mirrors bevy's walk: a node's own `LayoutConfig` beats its
/// ancestors'. Root unrounded, the row rounded again, a transitioning child
/// of the row: `[A 33.3][B 50]` lays B at the ROUNDED 58 (A rounds to 33),
/// and removing A shows 58 on the change frame — bevy's pristine value and
/// the channel's measure agree.
#[test]
fn layout_channel_honors_the_nearest_layout_config_override() {
    use bevy::ui::LayoutConfig;
    let mut app = layout_app();
    let root = app
        .world_mut()
        .spawn((
            root_row(),
            LayoutConfig {
                use_rounding: false,
            },
        ))
        .id();
    let row = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Row,
                ..Default::default()
            },
            ChildOf(root),
            LayoutConfig { use_rounding: true },
        ))
        .id();
    let a = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(33.3),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(row),
        ))
        .id();
    let b = app
        .world_mut()
        .spawn((
            Node {
                width: Val::Px(50.0),
                height: Val::Px(50.0),
                ..Default::default()
            },
            ChildOf(row),
            layout_spec(1.0),
            TransitionState::default(),
        ))
        .id();
    step(&mut app, 0.016);
    assert_eq!(x_of(&app, b), 58.0, "pristine: the row's own config rounds");

    app.world_mut().entity_mut(a).despawn();
    step(&mut app, 0.0);
    assert_eq!(
        x_of(&app, b),
        58.0,
        "change frame: measured with the row's (rounded) config, as bevy displayed it"
    );
    step(&mut app, 1.0);
    assert_eq!(x_of(&app, b), 25.0, "settled on bevy's value");
}

/// Real layout, `size` AND `layout` on the same nodes: two bars whose
/// container flips row → column while their sizes swap in the same commit
/// (the home page's layout vignette). The flip's move is not the size
/// flight's re-flow, so it eases — on the change frame the bar sits near its
/// OLD centre at its live, easing size (translate-only, no FLIP scale) — and
/// everything lands on bevy's own values once both channels settle.
#[test]
fn direction_flip_under_a_size_flight_eases_the_move_and_lands() {
    use bevy::math::{Mat2, Vec2};
    let mut app = layout_app();
    app.init_resource::<crate::layer::LayerContentDirt>();
    app.add_systems(Update, drive_transitions);
    let root = app.world_mut().spawn(root_row()).id();
    // Default shrink on purpose: the 100px-tall root squeezes the column's
    // bars straight to 50px on the change frame — a measured size step that
    // would explain any move; the channel judges by its own ~1px step.
    let bar = |w: f32, h: f32| Node {
        width: Val::Px(w),
        height: Val::Px(h),
        ..Default::default()
    };
    let input = |w: f32, h: f32| TransitionInput {
        spec: Transition {
            size: Some(timing(1.0, Easing::Linear)),
            layout: Some(timing(1.0, Easing::Linear)),
            ..Default::default()
        },
        width: Some(Length::Px(w)),
        height: Some(Length::Px(h)),
        ..Default::default()
    };
    let spawn = |app: &mut App| {
        app.world_mut()
            .spawn((
                bar(30.0, 110.0),
                ChildOf(root),
                input(30.0, 110.0),
                TransitionState::default(),
            ))
            .id()
    };
    let a = spawn(&mut app);
    let b = spawn(&mut app);
    step(&mut app, 0.016);
    step(&mut app, 0.016);
    assert_eq!(global(&app, b).translation, Vec2::new(45.0, 55.0), "row");

    // The flip: direction and sizes in one commit.
    app.world_mut()
        .entity_mut(root)
        .get_mut::<Node>()
        .unwrap()
        .flex_direction = FlexDirection::Column;
    for e in [a, b] {
        *app.world_mut()
            .entity_mut(e)
            .get_mut::<TransitionInput>()
            .unwrap() = input(110.0, 30.0);
    }
    step(&mut app, 0.016);
    let g = global(&app, b);
    // Raw, the squeezed column puts b's centre at y = 75: it shows a step
    // from its old centre instead.
    assert!(
        (g.translation.y - 55.0).abs() < 4.0 && (g.translation.x - 45.0).abs() < 2.0,
        "eased from the old centre: {:?}",
        g.translation
    );
    assert!(
        (g.matrix2.x_axis.x - 1.0).abs() < 1e-6 && (g.matrix2.y_axis.y - 1.0).abs() < 1e-6,
        "translate-only: {:?}",
        g.matrix2
    );
    assert!(
        app.world()
            .entity(b)
            .get::<TransitionState>()
            .unwrap()
            .size_in_flight(),
        "the size flight is the size channel's"
    );

    step(&mut app, 2.0);
    let g = global(&app, b);
    assert_eq!(g.translation, Vec2::new(55.0, 45.0), "column, settled");
    assert_eq!(g.matrix2, Mat2::IDENTITY);
}
