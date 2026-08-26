//! Touch-drag scrolling for `overflow: scroll` nodes — the mobile counterpart
//! of [`crate::scroll::apply_scroll`]: content follows the finger 1:1, clamped
//! to the scrollable range per axis. Shares the wheel path's range/write
//! helpers (`crate::scroll`) but keeps its own geometry walk: the two walks
//! stop for different things (the wheel for `onWheel` listeners, touch for
//! scrollbar parts), so a shared predicate-parameterized walk would be more
//! indirection than the few lines it saves.

use bevy::prelude::*;
use bevy::ui::{ComputedNode, ScrollPosition, UiGlobalTransform, UiStack};
use bevy::ui_widgets::{Scrollbar, ScrollbarThumb};
use bevy::window::PrimaryWindow;

use crate::plugin::PointerCapture;
use crate::reconcile::ActiveDrag;
use crate::scroll::{scroll_base, scroll_range, write_scroll};
use crate::transition::ScrollTransitionState;

/// Web-style tap slop, in logical px: a claimed touch that stays within this
/// radius of its press point is still a tap (its click fires); once it moves
/// past, the gesture is a scroll and the tap's click is suppressed.
const TOUCH_SLOP: f32 = 8.0;

/// All live touch-scroll claims, one per claiming touch (a `Resource`, not a
/// `Local`, so the click path and tests can consult it).
#[derive(Resource, Default)]
pub struct TouchScrollState {
    claims: Vec<TouchClaim>,
}

impl TouchScrollState {
    /// Whether touch `id`'s tap click is consumed by its scroll gesture
    /// (claimed and moved past [`TOUCH_SLOP`]). Read by `collect_ui_events` on
    /// the release frame — valid in either Update order because claims survive
    /// that frame (see `apply_touch_scroll`'s retain).
    pub(crate) fn is_suppressed(&self, id: u64) -> bool {
        self.claims.iter().any(|c| c.id == id && c.moved_past_slop)
    }

    /// Whether touch `id`'s scroll gesture stole the touch from the
    /// handler-node drag it began on (see `apply_touch_scroll`'s arbitration).
    /// Read by `collect_pointer_events` (the frame after the steal) to end that
    /// drag with `pointerLeave`.
    pub(crate) fn stole_drag(&self, id: u64) -> bool {
        self.claims.iter().any(|c| c.id == id && c.stole_drag)
    }

    /// Record a stolen gesture for touch `id` without running the arbitration
    /// (the pointer tests exercise the drag side in isolation).
    #[cfg(test)]
    pub(crate) fn steal_for_test(&mut self, id: u64) {
        self.claims.push(TouchClaim {
            id,
            container: Entity::PLACEHOLDER,
            last_pos: Vec2::ZERO,
            press_pos: Vec2::ZERO,
            moved_past_slop: true,
            contested: false,
            stole_drag: true,
        });
    }
}

/// One touch's scroll gesture: the claiming touch id, its container, the
/// finger's last logical position (the delta source), and the slop tracking
/// for click suppression (`press_pos` = where the finger landed;
/// `moved_past_slop` latches once it leaves the [`TOUCH_SLOP`] radius).
/// `contested` marks a touch that also began a handler-node drag
/// ([`ActiveDrag`]) — undecided until the slop; `stole_drag` records that the
/// arbitration went the scroll's way (a contested claim that yields is dropped).
struct TouchClaim {
    id: u64,
    container: Entity,
    last_pos: Vec2,
    press_pos: Vec2,
    moved_past_slop: bool,
    contested: bool,
    stole_drag: bool,
}

/// Touch-drag scrolling for `overflow: scroll` nodes — the mobile counterpart
/// of [`crate::scroll::apply_scroll`]: content follows the finger 1:1 (finger
/// up reveals lower content), clamped to the scrollable range per axis.
///
/// Claiming mirrors the wheel path's geometry walk: on a fresh touch press the
/// topmost scroll container under the finger **with an in-range `Scroll`
/// axis** claims the gesture for that touch's whole lifetime (even once the
/// finger leaves its bounds — DOM touch-scroll semantics); unclaimable
/// containers are transparent so the touch falls through to the world, and
/// scrollbar parts are opaque (the widget's own observers drive them).
/// Ownership is **per-pointer**: every finger claims its own container and
/// scrolls it concurrently (two fingers on one container simply sum their
/// deltas), including during a mouse drag.
///
/// A touch that landed on a handler node — the one bound to the handler-node
/// drag ([`ActiveDrag`], assigned by `collect_pointer_events` earlier in the
/// set) — is **contested**, and arbitrated the way browsers arbitrate
/// `touch-action: auto`: the element keeps the finger inside the tap slop;
/// once the finger pans past it, the pan's dominant axis decides. If the
/// claimed container can scroll along that axis the scroll **steals** the
/// touch (`stole_drag` — `collect_pointer_events` ends the drag with
/// `pointerLeave`, the `pointercancel` analog, next frame; the content catches
/// up from the press point) — a button in a list never blocks the list's
/// scrolling. Otherwise the drag keeps the finger for good and the claim is
/// dropped — a horizontal slider inside a vertical list keeps working.
///
/// A claimed gesture that moves past [`TOUCH_SLOP`] also consumes its tap:
/// `collect_ui_events` drops that touch's `Pointer<Click>` (web semantics —
/// scrolling cancels the click; `pointerUp` still fires). While a gesture
/// lives it re-claims `PointerCapture::dragging` each frame so world input
/// (e.g. a touch-pan camera ordered after `PointerCaptureSet`) ignores the
/// finger.
#[allow(clippy::type_complexity, clippy::too_many_arguments)]
pub fn apply_touch_scroll(
    touches: Res<bevy::input::touch::Touches>,
    windows: Query<&Window, With<PrimaryWindow>>,
    ui_stack: Res<UiStack>,
    mut scrollables: Query<(
        &ComputedNode,
        &UiGlobalTransform,
        &Node,
        &mut ScrollPosition,
        Option<&mut ScrollTransitionState>,
    )>,
    scrollbar_parts: Query<
        (&ComputedNode, &UiGlobalTransform),
        Or<(With<Scrollbar>, With<ScrollbarThumb>)>,
    >,
    active_drag: Res<ActiveDrag>,
    mut capture: ResMut<PointerCapture>,
    mut state: ResMut<TouchScrollState>,
) {
    // A claim lives while its touch is pressed and deliberately SURVIVES the
    // release/cancel frame, dropping the frame after (when the `just_*` maps
    // clear). Load-bearing invariant: `collect_ui_events` is unordered
    // relative to this system, and bevy_picking delivers the tap's
    // `Pointer<Click>` on the release frame — the claim (and its slop flag)
    // must still be readable then, in either Update order.
    state.claims.retain(|c| {
        touches.get_pressed(c.id).is_some()
            || touches.just_released(c.id)
            || touches.just_canceled(c.id)
    });

    // Claim: every fresh, unowned touch grabs the topmost in-range container
    // under it. Per-touch exclusion only — a mouse drag or another finger's
    // gesture never blocks this touch from claiming.
    if let Ok(window) = windows.single() {
        for touch in touches.iter_just_pressed() {
            if state.claims.iter().any(|c| c.id == touch.id()) {
                continue;
            }
            // Bound to a handler-node drag this frame → contested (see above).
            let contested = active_drag.touch_id() == Some(touch.id());
            // `ComputedNode`/`UiGlobalTransform` are physical; touch positions
            // are logical top-left — same conversion as the wheel path's cursor.
            let point = touch.position() * window.scale_factor();
            for &entity in ui_stack.uinodes.iter().rev() {
                // A scrollbar part (track or thumb) under the finger is OPAQUE:
                // the touch belongs to the widget's own drag observers (which
                // are pointer-type-agnostic — touch drives the thumb), so it
                // must never also claim a content scroll beneath. The track (a
                // real `Node`, `ZIndex(i32::MAX)`, overlaying the container's
                // edge) sits above the container in the stack and is hit
                // first; a thumb without stack geometry falls through to that
                // track, which still stops the walk — both press points are
                // covered either way.
                if let Ok((computed, transform)) = scrollbar_parts.get(entity) {
                    if computed.contains_point(*transform, point) {
                        break;
                    }
                    continue; // a part elsewhere just isn't under this finger
                }
                let Ok((computed, transform, node, _, _)) = scrollables.get(entity) else {
                    continue;
                };
                if !computed.contains_point(*transform, point) {
                    continue;
                }
                // Per-axis, like the wheel path: only an axis that both opted
                // into scrolling AND has actual range makes the container
                // claimable. A `scroll_y` box whose content only overflows
                // horizontally is transparent — the touch falls through to
                // lower nodes / the world instead of dying on a container
                // that can never move.
                let range = scroll_range(computed);
                let scrollable = (node.overflow.x == OverflowAxis::Scroll && range.x > 0.0)
                    || (node.overflow.y == OverflowAxis::Scroll && range.y > 0.0);
                if !scrollable {
                    continue;
                }
                state.claims.push(TouchClaim {
                    id: touch.id(),
                    container: entity,
                    last_pos: touch.position(),
                    press_pos: touch.position(),
                    moved_past_slop: false,
                    contested,
                    stole_drag: false,
                });
                break;
            }
        }
    }

    // Drag: move each claimed container by its finger's delta. A contested
    // claim first has to win the finger (or is dropped — `yielded`).
    let mut yielded: Vec<u64> = Vec::new();
    for claim in &mut state.claims {
        // A released-but-retained claim (see the retain above) moves nothing
        // and no longer owns the pointer.
        let Some(touch) = touches.get_pressed(claim.id) else {
            continue;
        };
        let travel = touch.position() - claim.press_pos;
        if claim.contested {
            // Inside the slop the element keeps the finger: nothing scrolls,
            // nothing is decided (a slider's first pixels are the slider's).
            if travel.length() <= TOUCH_SLOP {
                continue;
            }
            let Ok((computed, _, node, _, _)) = scrollables.get(claim.container) else {
                yielded.push(claim.id);
                continue;
            };
            let range = scroll_range(computed);
            let (axis, overflow) = if travel.x.abs() > travel.y.abs() {
                (range.x, node.overflow.x)
            } else {
                (range.y, node.overflow.y)
            };
            if overflow == OverflowAxis::Scroll && axis > 0.0 {
                claim.contested = false;
                claim.stole_drag = true;
            } else {
                yielded.push(claim.id);
                continue;
            }
        }
        // Latch the slop before the container lookup: the gesture keeps
        // suppressing its tap even if the container despawned mid-gesture.
        if !claim.moved_past_slop && travel.length() > TOUCH_SLOP {
            claim.moved_past_slop = true;
        }
        let Ok((computed, _, node, mut pos, scroll_state)) = scrollables.get_mut(claim.container)
        else {
            continue;
        };
        let delta = touch.position() - claim.last_pos;
        claim.last_pos = touch.position();
        let max = scroll_range(computed);
        let base = scroll_base(&pos, scroll_state.as_deref());
        // Same per-axis rule as the wheel path: only an in-range `Scroll` axis moves.
        let mut next = base;
        if node.overflow.x == OverflowAxis::Scroll && max.x > 0.0 {
            next.x = (base.x - delta.x).clamp(0.0, max.x);
        }
        if node.overflow.y == OverflowAxis::Scroll && max.y > 0.0 {
            next.y = (base.y - delta.y).clamp(0.0, max.y);
        }
        write_scroll(&mut pos, scroll_state, next);
        // Own the pointer for the gesture's whole lifetime, moving or resting.
        capture.dragging = true;
    }
    // A contested claim that lost stays lost: the drag owns the finger until
    // it lifts, and this path's click suppression never applies to it.
    if !yielded.is_empty() {
        state.claims.retain(|c| !yielded.contains(&c.id));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bevy::picking::events::{Click, Pointer};
    use bevy::picking::pointer::{PointerButton, PointerId};

    /// A multi-frame app driving [`apply_touch_scroll`] against the same
    /// 200×100 container (300px content → y range `[0, 200]`) used by the wheel
    /// tests. Touch input flows through Bevy's own `touch_screen_input_system`.
    fn touch_app() -> (App, Entity) {
        use bevy::input::touch::{Touches, touch_screen_input_system};

        let mut app = App::new();
        app.add_plugins(MinimalPlugins);
        app.init_resource::<Touches>();
        app.init_resource::<PointerCapture>();
        app.init_resource::<TouchScrollState>();
        app.init_resource::<ActiveDrag>();
        app.add_message::<bevy::input::touch::TouchInput>();
        app.add_systems(
            Update,
            (touch_screen_input_system, apply_touch_scroll).chain(),
        );
        app.world_mut().spawn((Window::default(), PrimaryWindow));
        let container = app
            .world_mut()
            .spawn((
                Node {
                    overflow: Overflow::scroll_y(),
                    ..default()
                },
                ComputedNode {
                    size: Vec2::new(200.0, 100.0),
                    content_size: Vec2::new(200.0, 300.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(300.0, 200.0)),
                ScrollPosition::default(),
            ))
            .id();
        app.world_mut().insert_resource(UiStack {
            uinodes: vec![container],
            partition: Vec::new(),
        });
        (app, container)
    }

    /// Write one `TouchInput` for touch `id` and run a frame. For same-frame
    /// multi-touch, write extra messages via [`queue_touch`] first.
    fn send_touch(app: &mut App, id: u64, phase: bevy::input::touch::TouchPhase, pos: Vec2) {
        queue_touch(app, id, phase, pos);
        app.update();
    }

    fn queue_touch(app: &mut App, id: u64, phase: bevy::input::touch::TouchPhase, pos: Vec2) {
        let window = app
            .world_mut()
            .query_filtered::<Entity, With<PrimaryWindow>>()
            .single(app.world())
            .unwrap();
        app.world_mut()
            .write_message(bevy::input::touch::TouchInput {
                phase,
                position: pos,
                window,
                force: None,
                id,
            });
    }

    /// A finger pressed on a scroll container drags its content 1:1 (finger up
    /// = scroll down), clamps at the range end, owns the pointer for the whole
    /// gesture (`PointerCapture::dragging`), and releases it on lift.
    #[test]
    fn touch_drag_scrolls_container() {
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        let pos = |app: &App| {
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0
        };
        let dragging = |app: &App| app.world().resource::<PointerCapture>().dragging;

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(300.0, 200.0));
        assert_eq!(pos(&app), Vec2::ZERO, "a press alone must not scroll");
        assert!(dragging(&app), "the gesture claims the pointer immediately");

        // Finger up by 50 → content follows → offset.y grows by 50.
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(300.0, 150.0));
        assert_eq!(pos(&app), Vec2::new(0.0, 50.0));

        // A huge further move clamps at the 200px range end.
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(300.0, -400.0));
        assert_eq!(pos(&app), Vec2::new(0.0, 200.0));

        // In production `collect_pointer_events` (the frame's assigner) resets
        // `dragging` each frame and live gestures re-claim it; emulate the
        // reset and verify the ended gesture does NOT re-claim.
        send_touch(&mut app, 7, TouchPhase::Ended, Vec2::new(300.0, -400.0));
        app.world_mut().resource_mut::<PointerCapture>().dragging = false;
        app.update();
        assert!(!dragging(&app), "lifting the finger releases the claim");
    }

    /// A touch that landed on a handler node (bound to an [`ActiveDrag`] by
    /// `collect_pointer_events`) is CONTESTED — web semantics: the element
    /// keeps the finger until it pans past the tap slop along an axis the
    /// container can scroll; then the scroll steals it (`stole_drag`), the
    /// content catches up 1:1 from the press point, and the tap's click is
    /// suppressed. Inside the slop nothing scrolls — a slider's first pixels
    /// of travel are the slider's.
    #[test]
    fn contested_touch_panning_along_scroll_axis_steals_the_drag() {
        use crate::reconcile::DragSource;
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        app.world_mut().resource_mut::<ActiveDrag>().begin(
            container,
            DragSource::Touch { id: 7 },
            Vec2::ZERO,
            Vec2::ZERO,
        );
        let pos = |app: &App| {
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0
        };
        let stole = |app: &App| app.world().resource::<TouchScrollState>().stole_drag(7);

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(300.0, 200.0));
        assert_eq!(pos(&app), Vec2::ZERO);
        assert!(!stole(&app), "a press alone decides nothing");

        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(300.0, 195.0));
        assert_eq!(
            pos(&app),
            Vec2::ZERO,
            "inside the tap slop the element keeps the finger"
        );
        assert!(!stole(&app));

        // Past the slop, vertical, on a y-scroller: the scroll wins.
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(300.0, 150.0));
        assert_eq!(
            pos(&app),
            Vec2::new(0.0, 50.0),
            "content catches up from the press point"
        );
        assert!(stole(&app));
        assert!(
            app.world().resource::<TouchScrollState>().is_suppressed(7),
            "a stolen gesture is a scroll: its tap click is consumed"
        );
    }

    /// The other arbitration outcome: a contested finger panning ACROSS the
    /// only scrollable axis (horizontal on a y-scroller — a slider inside a
    /// list) yields to the drag for the touch's whole lifetime: nothing
    /// scrolls, then or later, and the click is not suppressed by this path.
    #[test]
    fn contested_touch_panning_across_scroll_axis_yields_to_the_drag() {
        use crate::reconcile::DragSource;
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        app.world_mut().resource_mut::<ActiveDrag>().begin(
            container,
            DragSource::Touch { id: 7 },
            Vec2::ZERO,
            Vec2::ZERO,
        );
        let pos = |app: &App| {
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0
        };

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(300.0, 200.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(350.0, 200.0));
        assert_eq!(
            pos(&app),
            Vec2::ZERO,
            "a horizontal pan cannot scroll a y-only container"
        );
        assert!(!app.world().resource::<TouchScrollState>().stole_drag(7));

        // The decision is final: a later vertical leg still belongs to the drag.
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(350.0, 150.0));
        assert_eq!(pos(&app), Vec2::ZERO, "the drag keeps the finger for good");
        assert!(!app.world().resource::<TouchScrollState>().is_suppressed(7));
    }

    /// Ownership is per-pointer: while one finger drags a handler node
    /// ([`ActiveDrag`] bound to touch 7), an unrelated second finger still
    /// claims and scrolls its container — the old global `dragging` guard
    /// dropped that second touch permanently.
    #[test]
    fn second_finger_scrolls_during_touch_handler_drag() {
        use crate::reconcile::DragSource;
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        let slider = app.world_mut().spawn_empty().id();
        app.world_mut().resource_mut::<ActiveDrag>().begin(
            slider,
            DragSource::Touch { id: 7 },
            Vec2::ZERO,
            Vec2::ZERO,
        );
        // In production `collect_pointer_events` holds `dragging` true every
        // frame of the handler drag; that must not block finger 8.
        app.world_mut().resource_mut::<PointerCapture>().dragging = true;

        send_touch(&mut app, 8, TouchPhase::Started, Vec2::new(300.0, 200.0));
        send_touch(&mut app, 8, TouchPhase::Moved, Vec2::new(300.0, 150.0));
        assert_eq!(
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0,
            Vec2::new(0.0, 50.0)
        );
    }

    /// A live *mouse* drag must not block a touch from claiming a scroll —
    /// the exclusion is the drag-owning touch only, not "any drag".
    #[test]
    fn touch_claims_during_mouse_drag() {
        use crate::reconcile::DragSource;
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        let slider = app.world_mut().spawn_empty().id();
        app.world_mut().resource_mut::<ActiveDrag>().begin(
            slider,
            DragSource::Mouse {
                button: MouseButton::Left,
                dom_button: 0,
            },
            Vec2::ZERO,
            Vec2::ZERO,
        );
        app.world_mut().resource_mut::<PointerCapture>().dragging = true;

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(300.0, 200.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(300.0, 150.0));
        assert_eq!(
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0,
            Vec2::new(0.0, 50.0)
        );
    }

    /// Two fingers on two containers scroll both, independently and
    /// concurrently — claims are a per-touch list, not a single slot.
    #[test]
    fn two_touches_scroll_two_containers() {
        use bevy::input::touch::TouchPhase;

        let (mut app, container_a) = touch_app();
        let container_b = app
            .world_mut()
            .spawn((
                Node {
                    overflow: Overflow::scroll_y(),
                    ..default()
                },
                ComputedNode {
                    size: Vec2::new(200.0, 100.0),
                    content_size: Vec2::new(200.0, 300.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(300.0, 500.0)),
                ScrollPosition::default(),
            ))
            .id();
        app.world_mut().insert_resource(UiStack {
            uinodes: vec![container_a, container_b],
            partition: Vec::new(),
        });

        // Both fingers land the same frame, one per container.
        queue_touch(&mut app, 7, TouchPhase::Started, Vec2::new(300.0, 200.0));
        queue_touch(&mut app, 8, TouchPhase::Started, Vec2::new(300.0, 500.0));
        app.update();

        // Both move the same frame with different deltas.
        queue_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(300.0, 150.0));
        queue_touch(&mut app, 8, TouchPhase::Moved, Vec2::new(300.0, 480.0));
        app.update();

        let pos = |app: &App, e: Entity| app.world().entity(e).get::<ScrollPosition>().unwrap().0;
        assert_eq!(pos(&app, container_a), Vec2::new(0.0, 50.0));
        assert_eq!(pos(&app, container_b), Vec2::new(0.0, 20.0));
    }

    /// Spawn a vertical scrollbar track (a `Scrollbar` targeting `container`)
    /// over the container's right edge — center (390, 200), 20×100 — plus a
    /// `ScrollbarThumb` on its upper half, and push both above the container
    /// in the `UiStack`, like production (`ZIndex(i32::MAX)` overlay).
    fn spawn_scrollbar(app: &mut App, container: Entity) -> (Entity, Entity) {
        use bevy::ui_widgets::ControlOrientation;

        let track = app
            .world_mut()
            .spawn((
                Scrollbar::new(container, ControlOrientation::Vertical, 20.0),
                Node::default(),
                ComputedNode {
                    size: Vec2::new(20.0, 100.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(390.0, 200.0)),
            ))
            .id();
        let thumb = app
            .world_mut()
            .spawn((
                ScrollbarThumb::default(),
                ComputedNode {
                    size: Vec2::new(20.0, 40.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(390.0, 180.0)),
                ChildOf(track),
            ))
            .id();
        app.world_mut().insert_resource(UiStack {
            uinodes: vec![container, track, thumb],
            partition: Vec::new(),
        });
        (track, thumb)
    }

    /// A touch pressed on the scrollbar *track* belongs to the widget (paging,
    /// thumb dragging) — it must never also claim the content scroll beneath,
    /// or two writers fight the same offset with opposite sign conventions.
    #[test]
    fn touch_on_scrollbar_track_never_claims_content_scroll() {
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        spawn_scrollbar(&mut app, container);

        // Press on the track, below the thumb, and drag.
        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(390.0, 240.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(390.0, 200.0));
        assert_eq!(
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0,
            Vec2::ZERO,
            "the touch on the track must not drive a content scroll"
        );
        assert!(!app.world().resource::<PointerCapture>().dragging);
    }

    /// Same for the *thumb*: whether it is hit directly in the stack or falls
    /// through to the track beneath it, the walk stops — the widget's own
    /// observers drive the drag.
    #[test]
    fn touch_on_scrollbar_thumb_never_claims_content_scroll() {
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        spawn_scrollbar(&mut app, container);

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(390.0, 180.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(390.0, 220.0));
        assert_eq!(
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0,
            Vec2::ZERO,
            "the touch on the thumb must not drive a content scroll"
        );
        assert!(!app.world().resource::<PointerCapture>().dragging);
    }

    /// Opacity must not over-reach: a touch on the container *beside* the bar
    /// still scrolls the content.
    #[test]
    fn touch_beside_the_track_still_scrolls() {
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        spawn_scrollbar(&mut app, container);

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(250.0, 200.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(250.0, 150.0));
        assert_eq!(
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0,
            Vec2::new(0.0, 50.0)
        );
    }

    /// The claim gate is per-axis: a `scroll_y` container whose content only
    /// overflows horizontally (y range 0) can never move, so it must stay
    /// transparent — claiming it would deaden world touch input (e.g. a
    /// touch-pan camera behind the pane) for the gesture's whole lifetime.
    #[test]
    fn scroll_y_container_with_only_horizontal_overflow_stays_transparent() {
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        // Content wider than the box but fitting vertically: range = (200, 0),
        // while only the y axis is `Scroll`.
        *app.world_mut()
            .entity_mut(container)
            .get_mut::<ComputedNode>()
            .unwrap() = ComputedNode {
            size: Vec2::new(200.0, 100.0),
            content_size: Vec2::new(400.0, 100.0),
            inverse_scale_factor: 1.0,
            ..default()
        };

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(300.0, 200.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(300.0, 150.0));
        assert_eq!(
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0,
            Vec2::ZERO
        );
        assert!(
            !app.world().resource::<PointerCapture>().dragging,
            "an unclaimable container must not own the pointer"
        );
    }

    /// [`touch_app`] extended for click suppression: the container carries an
    /// `ReactNode`/`ClickOwner` (a clickable row), a `JsBridge` catches outbound
    /// events, and `collect_ui_events` runs **before** `apply_touch_scroll` —
    /// the harder of the two unordered production schedules, proving the
    /// suppression flag is readable from the previous frames' state alone.
    fn click_scroll_app() -> (
        App,
        Entity,
        tokio::sync::mpsc::UnboundedReceiver<crate::protocol::outbound::Outbound>,
    ) {
        use crate::bridge::JsBridge;
        use crate::protocol::{op::Op, outbound::Outbound};

        let (mut app, container) = touch_app();
        let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        let (_ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        std::mem::forget(_ops_tx); // Keep the ops channel open for the app's lifetime.
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_message::<Pointer<Click>>();
        app.add_systems(
            Update,
            crate::reconcile::collect_ui_events.before(apply_touch_scroll),
        );
        app.world_mut()
            .entity_mut(container)
            .insert((crate::bridge::ReactNode(9), crate::bridge::ClickOwner));
        (app, container, out_rx)
    }

    /// A synthetic picking `Pointer<Click>` targeting `entity`, as bevy_picking
    /// would emit on the release frame (release over the press node).
    fn synth_click(pointer_id: PointerId, entity: Entity) -> Pointer<Click> {
        Pointer::new(
            pointer_id,
            bevy::picking::pointer::Location {
                target: bevy::camera::NormalizedRenderTarget::Image(
                    Handle::<Image>::default().into(),
                ),
                position: Vec2::ZERO,
            },
            Click {
                button: PointerButton::Primary,
                hit: bevy::picking::backend::HitData::new(Entity::PLACEHOLDER, 0.0, None, None),
                duration: std::time::Duration::ZERO,
                count: 1,
            },
            entity,
        )
    }

    fn drain_clicks(
        out_rx: &mut tokio::sync::mpsc::UnboundedReceiver<crate::protocol::outbound::Outbound>,
    ) -> Vec<String> {
        use crate::protocol::outbound::Outbound;
        std::iter::from_fn(|| out_rx.try_recv().ok())
            .map(|o| match o {
                Outbound::UiEvent { event } => event.kind,
                other => panic!("expected a UiEvent, got {other:?}"),
            })
            .collect()
    }

    /// A touch scroll that moved past the tap slop consumes that touch's
    /// click (web semantics: scrolling cancels the tap) — while an unrelated
    /// pointer's click on the same node still fires.
    #[test]
    fn scroll_past_slop_suppresses_the_tap() {
        use bevy::input::touch::TouchPhase;

        let (mut app, container, mut out_rx) = click_scroll_app();

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(300.0, 200.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(300.0, 150.0));

        // Release frame: bevy_picking delivers the tap's Click (touch) — and,
        // for contrast, an unrelated mouse click on the same row.
        queue_touch(&mut app, 7, TouchPhase::Ended, Vec2::new(300.0, 150.0));
        app.world_mut()
            .write_message(synth_click(PointerId::Touch(7), container));
        app.world_mut()
            .write_message(synth_click(PointerId::Mouse, container));
        app.update();

        assert_eq!(
            drain_clicks(&mut out_rx),
            ["click"],
            "the scrolled touch's tap is suppressed; the mouse click still fires"
        );
    }

    /// A sub-slop tap (finger barely moved) still clicks — suppression only
    /// kicks in once the gesture actually scrolls past the slop radius.
    #[test]
    fn sub_slop_tap_still_clicks() {
        use bevy::input::touch::TouchPhase;

        let (mut app, container, mut out_rx) = click_scroll_app();

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(300.0, 200.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(303.0, 200.0));

        queue_touch(&mut app, 7, TouchPhase::Ended, Vec2::new(303.0, 200.0));
        app.world_mut()
            .write_message(synth_click(PointerId::Touch(7), container));
        app.update();

        assert_eq!(
            drain_clicks(&mut out_rx),
            ["click"],
            "a tap within the slop radius keeps its click"
        );
    }

    /// The suppression flag must survive the release frame (the frame the
    /// `Pointer<Click>` arrives on) and drop the frame after — the retain
    /// rule `collect_ui_events`' order-independence rests on.
    #[test]
    fn suppression_survives_the_release_frame() {
        use bevy::input::touch::TouchPhase;

        let (mut app, _container) = touch_app();

        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(300.0, 200.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(300.0, 150.0));
        assert!(app.world().resource::<TouchScrollState>().is_suppressed(7));

        // The release frame: the claim (and its slop flag) must still be there.
        send_touch(&mut app, 7, TouchPhase::Ended, Vec2::new(300.0, 150.0));
        assert!(
            app.world().resource::<TouchScrollState>().is_suppressed(7),
            "suppression is readable on the release frame"
        );

        // One frame later the `just_*` maps cleared: the claim drops.
        app.update();
        assert!(
            !app.world().resource::<TouchScrollState>().is_suppressed(7),
            "the claim drops the frame after release"
        );
    }

    /// A touch outside every scroll container claims nothing — the world (e.g.
    /// a touch-pan camera) keeps the gesture.
    #[test]
    fn touch_outside_containers_does_not_claim() {
        use bevy::input::touch::TouchPhase;

        let (mut app, container) = touch_app();
        send_touch(&mut app, 7, TouchPhase::Started, Vec2::new(10.0, 10.0));
        send_touch(&mut app, 7, TouchPhase::Moved, Vec2::new(10.0, 60.0));
        assert_eq!(
            app.world()
                .entity(container)
                .get::<ScrollPosition>()
                .unwrap()
                .0,
            Vec2::ZERO
        );
        assert!(!app.world().resource::<PointerCapture>().dragging);
    }
}
