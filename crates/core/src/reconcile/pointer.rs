//! Main-window pointer/drag reporting for elements that declared `onPointer*`
//! handlers: the cross-frame drag state ([`ActiveDrag`] + [`DragSource`]) and
//! the per-frame drag driver. Hover boundary events live in
//! [`super::hover`]; discrete clicks in [`super::events`].

use bevy::prelude::*;
use bevy::ui::{ComputedNode, ComputedStackIndex, RelativeCursorPosition, UiGlobalTransform};

use super::events::normalized_01;
use crate::bridge::{JsBridge, PointerHandlers, ReactNode};
use crate::protocol::{outbound::Outbound, outbound::UiEvent};
use crate::svg::SvgUserPos;

/// Event x/y for a node: an SVG shape's **user-space** cursor when its
/// [`SvgUserPos`] slot carries one (written by the shape synthesis while
/// hovered — see `crate::svg::interact`), else the clamped `0..1` normalized
/// position. `None` when neither is known. The single home of the
/// user-pos-wins rule — both the drag and hover collectors go through it.
pub(super) fn event_pos(
    user: Option<&SvgUserPos>,
    rel: Option<&RelativeCursorPosition>,
) -> Option<Vec2> {
    user.and_then(|u| u.0)
        .or_else(|| rel.and_then(normalized_01))
}

/// The mouse buttons the pointer pipeline reports, paired with their DOM
/// `MouseEvent.button` numbers (`0`/`1`/`2` = left/middle/right — the same set
/// bevy_picking forwards; Back/Forward/Other stay ignored).
const POINTER_BUTTONS: [(MouseButton, u8); 3] = [
    (MouseButton::Left, 0),
    (MouseButton::Middle, 1),
    (MouseButton::Right, 2),
];

/// What started (and owns) the active drag: a mouse button (tracked and
/// reported for the whole gesture — any other button pressed mid-drag is
/// ignored, one active drag at a time) or a touch point (reported as the DOM
/// primary button, following that touch's lifecycle instead of the mouse).
#[derive(Debug, Clone, Copy, PartialEq)]
pub(crate) enum DragSource {
    Mouse { button: MouseButton, dom_button: u8 },
    Touch { id: u64 },
}

impl DragSource {
    /// The DOM `MouseEvent.button` number reported on this drag's events.
    fn dom_button(&self) -> u8 {
        match self {
            DragSource::Mouse { dom_button, .. } => *dom_button,
            DragSource::Touch { .. } => 0,
        }
    }
}

/// The node currently being dragged (an `onPointer*` element pressed with any
/// mouse button — or a touch), plus the last positions we read for it — used
/// as a fallback when the pointer position is unknown mid-drag. The entity and
/// its [`DragSource`] live and die together ([`ActiveDrag::begin`] /
/// [`ActiveDrag::end`]), so no per-field reset can be forgotten on either
/// edge. `last_pos` is the node-relative `0..1` position; `last_abs` is the
/// absolute window position (logical px). A `Resource` so the touch-scroll
/// path (`crate::touch_scroll`) can see which touch the drag owns — that touch
/// is *contested* there, and a pan along a scrollable axis steals it.
#[derive(Resource, Default)]
pub(crate) struct ActiveDrag {
    binding: Option<(Entity, DragSource)>,
    last_pos: Vec2,
    last_abs: Vec2,
}

impl ActiveDrag {
    pub(crate) fn begin(&mut self, entity: Entity, source: DragSource, pos: Vec2, abs: Vec2) {
        self.binding = Some((entity, source));
        self.last_pos = pos;
        self.last_abs = abs;
    }

    /// Atomically release the binding (entity + source together) — called on
    /// the release frame *before* any node lookup, so a node despawned
    /// mid-gesture can never leave a stale source behind.
    fn end(&mut self) -> Option<(Entity, DragSource)> {
        self.binding.take()
    }

    /// The touch owning the active drag, when the drag is touch-sourced.
    pub(crate) fn touch_id(&self) -> Option<u64> {
        match self.binding {
            Some((_, DragSource::Touch { id })) => Some(id),
            _ => None,
        }
    }
}

/// Drive native pointer/drag events for elements that declared `onPointer*`
/// handlers. Unlike the discrete click path, this follows the cursor across
/// frames so a dragged control (e.g. a slider) keeps updating even when the
/// pointer leaves its bounds — `RelativeCursorPosition` keeps reporting while the
/// cursor is anywhere in the window, and we clamp to `0..1`. `pointerMove` is
/// emitted only when the window cursor actually moved (DOM semantics), not once
/// per held frame. Any mouse button starts a drag and is reported on its events
/// ([`DragSource::Mouse`] — one drag at a time, keyed to the button that began
/// it). A touch press starts a drag the same way (reported as the primary
/// button) and follows that touch point's lifecycle — see [`ActiveDrag`].
///
/// `RelativeCursorPosition::normalized` is centered (`-0.5` = left/top edge,
/// `0.5` = right/bottom); we shift it to a `0..1` top-left origin to match the
/// CSS-like coordinates the JS handlers expect.
#[allow(clippy::type_complexity, clippy::too_many_arguments)]
pub fn collect_pointer_events(
    bridge: Res<JsBridge>,
    buttons: Res<ButtonInput<MouseButton>>,
    touches: Res<bevy::input::touch::Touches>,
    windows: Query<&Window>,
    nodes: Query<(
        Entity,
        &ReactNode,
        &Interaction,
        &RelativeCursorPosition,
        &PointerHandlers,
        // SVG shapes report x/y in user units instead (see [`event_pos`]).
        Option<&SvgUserPos>,
        // Node geometry, for the touch-begin hit-test (required components of
        // `Node`, so every production handler node carries them).
        &ComputedNode,
        &UiGlobalTransform,
        // Stack position, so overlapping candidates resolve topmost-first
        // (query iteration order is arbitrary and must never decide).
        Option<&ComputedStackIndex>,
    )>,
    interactions: Query<&Interaction>,
    mut capture: ResMut<crate::PointerCapture>,
    mut drag: ResMut<ActiveDrag>,
    // Written by `apply_touch_scroll` (ordered after, same set): a steal
    // recorded in frame N ends the drag here in frame N+1.
    touch_scroll: Res<crate::touch_scroll::TouchScrollState>,
) {
    let emit = |rnode: &ReactNode, kind: &str, pos: Vec2, abs: Vec2, button: u8| {
        let _ = bridge.outbound_tx.send(Outbound::UiEvent {
            event: UiEvent {
                id: rnode.0,
                kind: kind.to_string(),
                x: Some(pos.x),
                y: Some(pos.y),
                client_x: Some(abs.x),
                client_y: Some(abs.y),
                button: Some(button),
                ..default()
            },
        });
    };

    // Absolute cursor position in window logical pixels; `None` when the cursor
    // is outside the window (mid-drag), where we fall back to the last reading.
    let cursor_abs = windows.iter().next().and_then(|w| w.cursor_position());

    // Begin a drag on the frame any button goes down over a handler node.
    // A pass-through stack can mark SEVERAL overlapping handler nodes
    // `Pressed` at once (e.g. a drawing canvas inside a draggable dialog);
    // the TOPMOST candidate owns the gesture — the same rule click ownership
    // already follows.
    if drag.binding.is_none() {
        for (mb, dom) in POINTER_BUTTONS {
            if !buttons.just_pressed(mb) {
                continue;
            }
            let mut topmost: Option<(
                u32,
                Entity,
                &ReactNode,
                &RelativeCursorPosition,
                &PointerHandlers,
                Option<&SvgUserPos>,
            )> = None;
            for (entity, rnode, interaction, rel, handlers, user, _, _, stack) in &nodes {
                let over = if mb == MouseButton::Left {
                    // `ui_focus_system` attributes left presses for us (it
                    // honors `FocusPolicy` blocking).
                    *interaction == Interaction::Pressed
                } else {
                    // Other buttons never set `Pressed`: use this frame's hover
                    // attribution (same blocking rules) plus the geometric
                    // over-test, which rejects a stale sticky `Pressed` left
                    // behind by a left-drag that exited the node.
                    *interaction != Interaction::None && rel.cursor_over()
                };
                if !over {
                    continue;
                }
                let z = stack.map_or(0, |s| s.0);
                if topmost.as_ref().is_none_or(|&(best_z, ..)| z > best_z) {
                    topmost = Some((z, entity, rnode, rel, handlers, user));
                }
            }
            if let Some((_, entity, rnode, rel, handlers, user)) = topmost {
                let pos = event_pos(user, Some(rel)).unwrap_or(drag.last_pos);
                let abs = cursor_abs.unwrap_or(drag.last_abs);
                let source = DragSource::Mouse {
                    button: mb,
                    dom_button: dom,
                };
                drag.begin(entity, source, pos, abs);
                if handlers.down {
                    emit(rnode, "pointerDown", pos, abs, dom);
                }
                break;
            }
        }
    }

    // A touch begins a drag the same way a left press does: `ui_focus_system`
    // treats the primary touch as the pointer (it sets `Interaction::Pressed`
    // and feeds `RelativeCursorPosition`), so the same attribution applies —
    // reported as DOM button 0. But that attribution is position-blind here:
    // it uses ONE pointer position for the whole frame (preferring an idle
    // mouse cursor over the touch on hybrid devices), and with several fingers
    // landing at once `iter_just_pressed` yields in arbitrary order. So a
    // touch only binds to a `Pressed` node it is geometrically inside —
    // rejecting a second finger elsewhere and a phantom press attributed from
    // a resting mouse cursor. First match wins, like the mouse-left path
    // (overlapping simultaneously-`Pressed` nodes are already arbitrary-order
    // there). Residual upstream limit: `ui_focus_system` may not mark the
    // touched node `Pressed` at all while a mouse cursor rests over other UI —
    // this hit-test only removes the false-positive binding.
    if drag.binding.is_none()
        && let Some(scale) = windows.iter().next().map(|w| w.scale_factor())
    {
        'begin_touch: for touch in touches.iter_just_pressed() {
            // `ComputedNode`/`UiGlobalTransform` are physical; touch positions
            // are logical top-left — same conversion as the scroll paths.
            let point = touch.position() * scale;
            let mut topmost: Option<(
                u32,
                Entity,
                &ReactNode,
                &RelativeCursorPosition,
                &PointerHandlers,
                Option<&SvgUserPos>,
            )> = None;
            for (entity, rnode, interaction, rel, handlers, user, computed, transform, stack) in
                &nodes
            {
                if *interaction != Interaction::Pressed
                    || !computed.contains_point(*transform, point)
                {
                    continue;
                }
                // Overlapping hits resolve topmost-first, like the mouse path.
                let z = stack.map_or(0, |s| s.0);
                if topmost.as_ref().is_none_or(|&(best_z, ..)| z > best_z) {
                    topmost = Some((z, entity, rnode, rel, handlers, user));
                }
            }
            if let Some((_, entity, rnode, rel, handlers, user)) = topmost {
                let pos = event_pos(user, Some(rel)).unwrap_or(drag.last_pos);
                let abs = touch.position();
                drag.begin(entity, DragSource::Touch { id: touch.id() }, pos, abs);
                if handlers.down {
                    emit(rnode, "pointerDown", pos, abs, 0);
                }
                break 'begin_touch;
            }
        }
    }

    // While the initiating pointer is held (button for a mouse drag, touch
    // point for a touch drag), follow it and emit move events (a drag). Only
    // an actual displacement emits: a stationary held pointer stays silent
    // (DOM `pointermove` semantics) instead of flooding the bridge with one
    // identical event per frame. Touch drags read the touch's own position —
    // the window has no cursor on a touchscreen. A touch the scroll
    // arbitration stole is no longer held by the drag (it ends below).
    let stolen = match drag.binding {
        Some((_, DragSource::Touch { id })) => touch_scroll.stole_drag(id),
        _ => false,
    };
    let held = match drag.binding {
        Some((_, DragSource::Touch { id })) => touches.get_pressed(id).is_some() && !stolen,
        Some((_, DragSource::Mouse { button, .. })) => buttons.pressed(button),
        None => false,
    };
    if held
        && let Some((entity, source)) = drag.binding
        && let Ok((_, rnode, _, rel, handlers, user, _, _, _)) = nodes.get(entity)
    {
        let pos = event_pos(user, Some(rel)).unwrap_or(drag.last_pos);
        let abs = match source {
            // `held` guarantees the touch is pressed, so its position is known.
            DragSource::Touch { id } => touches
                .get_pressed(id)
                .map(|t| t.position())
                .unwrap_or(drag.last_abs),
            DragSource::Mouse { .. } => cursor_abs.unwrap_or(drag.last_abs),
        };
        let cursor_moved = abs != drag.last_abs;
        drag.last_pos = pos;
        drag.last_abs = abs;
        if cursor_moved && handlers.moved {
            emit(rnode, "pointerMove", pos, abs, source.dom_button());
        }
    }

    // End the drag when the initiating pointer is released (a canceled touch
    // counts — the finger is gone either way), or when the touch-scroll
    // arbitration stole the touch: then the element gets `pointerLeave` (the
    // DOM `pointercancel` analog — the finger went to the scroll, there is no
    // `pointerUp`), and the finger's later release is nobody's drag.
    let released = stolen
        || match drag.binding {
            Some((_, DragSource::Touch { id })) => {
                touches.just_released(id) || touches.just_canceled(id)
            }
            Some((_, DragSource::Mouse { button, .. })) => buttons.just_released(button),
            None => false,
        };
    if released
        && let Some((entity, source)) = drag.end()
        && let Ok((_, rnode, _, rel, handlers, user, _, _, _)) = nodes.get(entity)
    {
        let pos = event_pos(user, Some(rel)).unwrap_or(drag.last_pos);
        let abs = match source {
            // A touch-sourced drag never falls back to the mouse cursor: a
            // *canceled* touch has no `get_released` entry (cancels live in a
            // separate map with no position getter), so the fallback is the
            // finger's last known position — not wherever an idle mouse rests.
            // (A stolen touch is still pressed — read it where it is.)
            DragSource::Touch { id } => touches
                .get_released(id)
                .or_else(|| touches.get_pressed(id))
                .map(|t| t.position())
                .unwrap_or(drag.last_abs),
            DragSource::Mouse { .. } => cursor_abs.unwrap_or(drag.last_abs),
        };
        if stolen {
            if handlers.leave {
                emit(rnode, "pointerLeave", pos, abs, source.dom_button());
            }
        } else if handlers.up {
            emit(rnode, "pointerUp", pos, abs, source.dom_button());
        }
    }

    // Publish whether the UI owns the pointer so world systems (e.g. a camera
    // controller) can ignore the mouse. `dragging` spans the whole gesture even
    // once the cursor leaves the element; `over_ui` covers hover/press on any
    // interactive node (a wheel the UI consumes is `wheel_captured`'s job).
    capture.dragging = drag.binding.is_some();
    capture.over_ui = interactions.iter().any(|i| *i != Interaction::None);
    // This system is the frame's assigner; the wheel systems (`apply_scroll`,
    // `collect_wheel_events` — ordered after, same set) re-claim per frame.
    capture.wheel_captured = false;
}

#[cfg(test)]
mod tests {
    use bevy::picking::events::{Click, Pointer};

    use super::*;
    use crate::protocol::{op::Op, outbound::UiEvent};

    /// A minimal app wired for the picking-based click collectors: a `JsBridge`
    /// (with its outbound receiver kept alive) + `Pointer<Click>` messages.
    fn click_app() -> (App, tokio::sync::mpsc::UnboundedReceiver<Outbound>) {
        let mut app = App::new();
        app.add_plugins(MinimalPlugins);
        let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        let (_ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        std::mem::forget(_ops_tx); // Keep the ops channel open for the app's lifetime.
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_message::<Pointer<Click>>();
        (app, out_rx)
    }

    fn drain_clicks(out_rx: &mut tokio::sync::mpsc::UnboundedReceiver<Outbound>) -> Vec<UiEvent> {
        std::iter::from_fn(|| out_rx.try_recv().ok())
            .map(|o| match o {
                Outbound::UiEvent { event } => event,
                other => panic!("expected a UiEvent, got {other:?}"),
            })
            .collect()
    }

    /// [`collect_pointer_events`] emits `pointerMove` only when the window cursor
    /// actually moved: a stationary held button is silent (the regression was one
    /// identical event per frame), and the down frame doesn't duplicate
    /// `pointerDown` as a zero-length move.
    #[test]
    fn pointer_move_only_fires_on_cursor_movement() {
        let (mut app, mut out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<bevy::input::touch::Touches>();
        app.init_resource::<crate::PointerCapture>();
        app.init_resource::<ActiveDrag>();
        app.init_resource::<crate::touch_scroll::TouchScrollState>();
        app.add_systems(Update, collect_pointer_events);

        let mut window = Window::default();
        window.set_physical_cursor_position(Some(bevy::math::DVec2::new(100.0, 100.0)));
        let win = app.world_mut().spawn(window).id();

        let node = app
            .world_mut()
            .spawn((
                ReactNode(1),
                Interaction::Pressed,
                RelativeCursorPosition {
                    cursor_over: true,
                    normalized: Some(Vec2::ZERO),
                },
                PointerHandlers {
                    down: true,
                    moved: true,
                    up: true,
                    ..default()
                },
                ComputedNode {
                    size: Vec2::new(200.0, 200.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(100.0, 100.0)),
            ))
            .id();

        let kinds = |rx: &mut tokio::sync::mpsc::UnboundedReceiver<Outbound>| {
            drain_clicks(rx)
                .into_iter()
                .map(|e| e.kind)
                .collect::<Vec<_>>()
        };

        // Press frame: a pointerDown, and no same-position pointerMove.
        app.world_mut()
            .resource_mut::<ButtonInput<MouseButton>>()
            .press(MouseButton::Left);
        app.update();
        assert_eq!(kinds(&mut out_rx), ["pointerDown"]);

        // Held but stationary: silence.
        app.world_mut()
            .resource_mut::<ButtonInput<MouseButton>>()
            .clear();
        app.update();
        assert_eq!(kinds(&mut out_rx), Vec::<String>::new());

        // The cursor moves: exactly one pointerMove.
        app.world_mut()
            .get_mut::<Window>(win)
            .unwrap()
            .set_physical_cursor_position(Some(bevy::math::DVec2::new(110.0, 100.0)));
        app.world_mut()
            .get_mut::<RelativeCursorPosition>(node)
            .unwrap()
            .normalized = Some(Vec2::new(0.05, 0.0));
        app.update();
        assert_eq!(kinds(&mut out_rx), ["pointerMove"]);

        // Release: a pointerUp, no trailing move.
        app.world_mut()
            .resource_mut::<ButtonInput<MouseButton>>()
            .release(MouseButton::Left);
        app.update();
        assert_eq!(kinds(&mut out_rx), ["pointerUp"]);
    }

    /// On a phone there is no mouse: a touch is the primary pointer. A touch
    /// press over a handler node (attributed as `Interaction::Pressed` by
    /// `ui_focus_system`, which is touch-aware) must begin a drag and emit
    /// `pointerDown`; finger movement must emit `pointerMove` with the touch
    /// position as the absolute coordinates (the window has no cursor); a
    /// stationary held finger must stay silent; lifting the finger must emit
    /// `pointerUp` and release `PointerCapture::dragging`.
    #[test]
    fn touch_drag_emits_pointer_events() {
        use bevy::input::touch::{TouchInput, TouchPhase, Touches, touch_screen_input_system};

        let (mut app, mut out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<Touches>();
        app.init_resource::<crate::PointerCapture>();
        app.init_resource::<ActiveDrag>();
        app.init_resource::<crate::touch_scroll::TouchScrollState>();
        app.add_message::<TouchInput>();
        app.add_systems(
            Update,
            (touch_screen_input_system, collect_pointer_events).chain(),
        );

        // Phone-like window: no cursor position, ever.
        let win = app.world_mut().spawn(Window::default()).id();

        let node = app
            .world_mut()
            .spawn((
                ReactNode(1),
                Interaction::None,
                RelativeCursorPosition {
                    cursor_over: false,
                    normalized: None,
                },
                PointerHandlers {
                    down: true,
                    moved: true,
                    up: true,
                    ..default()
                },
                // A 200×200 rect centered at (100, 100): contains the touch path.
                ComputedNode {
                    size: Vec2::new(200.0, 200.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(100.0, 100.0)),
            ))
            .id();

        let touch = |phase, x: f32| TouchInput {
            phase,
            position: Vec2::new(x, 100.0),
            window: win,
            force: None,
            id: 7,
        };
        let events = |rx: &mut tokio::sync::mpsc::UnboundedReceiver<Outbound>| drain_clicks(rx);
        let dragging = |app: &App| app.world().resource::<crate::PointerCapture>().dragging;

        // Finger down over the node. `ui_focus_system` (touch-aware) would
        // attribute the press — simulate its output alongside the raw touch.
        app.world_mut()
            .write_message(touch(TouchPhase::Started, 100.0));
        {
            let mut e = app.world_mut().entity_mut(node);
            *e.get_mut::<Interaction>().unwrap() = Interaction::Pressed;
            *e.get_mut::<RelativeCursorPosition>().unwrap() = RelativeCursorPosition {
                cursor_over: true,
                normalized: Some(Vec2::ZERO),
            };
        }
        app.update();
        let down = events(&mut out_rx);
        assert_eq!(
            down.iter().map(|e| e.kind.as_str()).collect::<Vec<_>>(),
            ["pointerDown"]
        );
        assert_eq!(
            down[0].client_x,
            Some(100.0),
            "absolute coordinates ride the touch position, not a window cursor"
        );
        assert!(
            dragging(&app),
            "a touch drag claims PointerCapture::dragging"
        );

        // Held but stationary: silence.
        app.update();
        assert!(events(&mut out_rx).is_empty());

        // The finger moves: exactly one pointerMove at the new position.
        app.world_mut()
            .write_message(touch(TouchPhase::Moved, 110.0));
        app.world_mut()
            .get_mut::<RelativeCursorPosition>(node)
            .unwrap()
            .normalized = Some(Vec2::new(0.05, 0.0));
        app.update();
        let moved = events(&mut out_rx);
        assert_eq!(
            moved.iter().map(|e| e.kind.as_str()).collect::<Vec<_>>(),
            ["pointerMove"]
        );
        assert_eq!(moved[0].client_x, Some(110.0));

        // Finger up: a pointerUp, and the drag capture releases.
        app.world_mut()
            .write_message(touch(TouchPhase::Ended, 110.0));
        app.update();
        assert_eq!(
            events(&mut out_rx)
                .iter()
                .map(|e| e.kind.as_str())
                .collect::<Vec<_>>(),
            ["pointerUp"]
        );
        assert!(!dragging(&app));
    }

    /// The touch-scroll arbitration (`apply_touch_scroll`) steals a
    /// touch-sourced drag once the finger pans along a scrollable axis: the
    /// drag then ends on the next frame with `pointerLeave` (the DOM
    /// `pointercancel` analog — the finger is the scroll's now; no `pointerUp`,
    /// no further moves), `PointerCapture::dragging` drops, and the finger's
    /// eventual release is silent.
    #[test]
    fn stolen_touch_drag_ends_with_pointer_leave() {
        use bevy::input::touch::{TouchInput, TouchPhase, Touches, touch_screen_input_system};

        let (mut app, mut out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<Touches>();
        app.init_resource::<crate::PointerCapture>();
        app.init_resource::<ActiveDrag>();
        app.init_resource::<crate::touch_scroll::TouchScrollState>();
        app.add_message::<TouchInput>();
        app.add_systems(
            Update,
            (touch_screen_input_system, collect_pointer_events).chain(),
        );
        let win = app.world_mut().spawn(Window::default()).id();
        let node = app
            .world_mut()
            .spawn((
                ReactNode(1),
                Interaction::Pressed,
                RelativeCursorPosition {
                    cursor_over: true,
                    normalized: Some(Vec2::ZERO),
                },
                PointerHandlers {
                    down: true,
                    moved: true,
                    up: true,
                    leave: true,
                    ..default()
                },
                ComputedNode {
                    size: Vec2::new(200.0, 200.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(100.0, 100.0)),
            ))
            .id();
        let touch = |phase, y: f32| TouchInput {
            phase,
            position: Vec2::new(100.0, y),
            window: win,
            force: None,
            id: 7,
        };
        let kinds = |rx: &mut tokio::sync::mpsc::UnboundedReceiver<Outbound>| {
            drain_clicks(rx)
                .into_iter()
                .map(|e| e.kind)
                .collect::<Vec<_>>()
        };
        let dragging = |app: &App| app.world().resource::<crate::PointerCapture>().dragging;

        app.world_mut()
            .write_message(touch(TouchPhase::Started, 100.0));
        app.update();
        assert_eq!(kinds(&mut out_rx), ["pointerDown"]);
        assert!(dragging(&app));

        // The scroll path takes the finger (what `apply_touch_scroll` records
        // once the pan crosses the slop along a scrollable axis).
        app.world_mut()
            .resource_mut::<crate::touch_scroll::TouchScrollState>()
            .steal_for_test(7);
        app.world_mut()
            .write_message(touch(TouchPhase::Moved, 60.0));
        app.world_mut()
            .get_mut::<RelativeCursorPosition>(node)
            .unwrap()
            .normalized = Some(Vec2::new(0.0, -0.2));
        app.update();
        assert_eq!(kinds(&mut out_rx), ["pointerLeave"]);
        assert!(!dragging(&app), "a stolen drag no longer owns the pointer");

        // Later finger travel and the release are the scroll's business.
        app.world_mut()
            .write_message(touch(TouchPhase::Moved, 40.0));
        app.update();
        app.world_mut()
            .write_message(touch(TouchPhase::Ended, 40.0));
        app.update();
        assert_eq!(kinds(&mut out_rx), Vec::<String>::new());
    }

    /// With several fingers landing in the same frame, only the touch that is
    /// geometrically over the `Pressed` node binds the drag —
    /// `Touches::iter_just_pressed` yields in arbitrary `HashMap` order, so
    /// without the hit-test the drag could follow the wrong finger.
    #[test]
    fn touch_binds_only_the_touch_over_the_node() {
        use bevy::input::touch::{TouchInput, TouchPhase, Touches, touch_screen_input_system};

        let (mut app, mut out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<Touches>();
        app.init_resource::<crate::PointerCapture>();
        app.init_resource::<ActiveDrag>();
        app.init_resource::<crate::touch_scroll::TouchScrollState>();
        app.add_message::<TouchInput>();
        app.add_systems(
            Update,
            (touch_screen_input_system, collect_pointer_events).chain(),
        );
        let win = app.world_mut().spawn(Window::default()).id();

        // A 200×200 node centered at (100, 100): rect spans x/y 0..200.
        app.world_mut().spawn((
            ReactNode(1),
            Interaction::Pressed,
            RelativeCursorPosition {
                cursor_over: true,
                normalized: Some(Vec2::ZERO),
            },
            PointerHandlers {
                down: true,
                moved: true,
                ..default()
            },
            ComputedNode {
                size: Vec2::new(200.0, 200.0),
                inverse_scale_factor: 1.0,
                ..default()
            },
            UiGlobalTransform::from_translation(Vec2::new(100.0, 100.0)),
        ));

        let touch = |id: u64, phase, pos: Vec2| TouchInput {
            phase,
            position: pos,
            window: win,
            force: None,
            id,
        };

        // Two fingers land the same frame: 7 far away, 8 over the node.
        app.world_mut()
            .write_message(touch(7, TouchPhase::Started, Vec2::new(500.0, 500.0)));
        app.world_mut()
            .write_message(touch(8, TouchPhase::Started, Vec2::new(100.0, 100.0)));
        app.update();
        let down = drain_clicks(&mut out_rx);
        assert_eq!(
            down.iter().map(|e| e.kind.as_str()).collect::<Vec<_>>(),
            ["pointerDown"]
        );
        assert_eq!(
            down[0].client_x,
            Some(100.0),
            "the drag binds to the finger over the node, whatever the iteration order"
        );

        // The unrelated finger moves: the drag must not follow it.
        app.world_mut()
            .write_message(touch(7, TouchPhase::Moved, Vec2::new(520.0, 500.0)));
        app.update();
        assert!(
            drain_clicks(&mut out_rx).is_empty(),
            "the unbound finger's movement is silent"
        );

        // The bound finger moves: exactly one pointerMove at its position.
        app.world_mut()
            .write_message(touch(8, TouchPhase::Moved, Vec2::new(110.0, 100.0)));
        app.update();
        let moved = drain_clicks(&mut out_rx);
        assert_eq!(
            moved.iter().map(|e| e.kind.as_str()).collect::<Vec<_>>(),
            ["pointerMove"]
        );
        assert_eq!(moved[0].client_x, Some(110.0));
    }

    /// A `Pressed` node whose press was attributed from a *resting mouse
    /// cursor* (hybrid devices: `ui_focus_system` prefers the cursor position
    /// over the touch) must not bind a drag to a touch landing elsewhere.
    #[test]
    fn touch_elsewhere_does_not_bind_pressed_node() {
        use bevy::input::touch::{TouchInput, TouchPhase, Touches, touch_screen_input_system};

        let (mut app, mut out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<Touches>();
        app.init_resource::<crate::PointerCapture>();
        app.init_resource::<ActiveDrag>();
        app.init_resource::<crate::touch_scroll::TouchScrollState>();
        app.add_message::<TouchInput>();
        app.add_systems(
            Update,
            (touch_screen_input_system, collect_pointer_events).chain(),
        );
        let win = app.world_mut().spawn(Window::default()).id();

        // Phantom shape: the node is `Pressed` (as the idle mouse cursor's
        // attribution would leave it) but the touch lands far outside it.
        app.world_mut().spawn((
            ReactNode(1),
            Interaction::Pressed,
            RelativeCursorPosition {
                cursor_over: true,
                normalized: Some(Vec2::ZERO),
            },
            PointerHandlers {
                down: true,
                ..default()
            },
            ComputedNode {
                size: Vec2::new(200.0, 200.0),
                inverse_scale_factor: 1.0,
                ..default()
            },
            UiGlobalTransform::from_translation(Vec2::new(100.0, 100.0)),
        ));

        app.world_mut().write_message(TouchInput {
            phase: TouchPhase::Started,
            position: Vec2::new(500.0, 500.0),
            window: win,
            force: None,
            id: 7,
        });
        app.update();
        assert!(
            drain_clicks(&mut out_rx).is_empty(),
            "no pointerDown for a touch outside the Pressed node"
        );
        assert!(!app.world().resource::<crate::PointerCapture>().dragging);
    }

    /// A touch drag ended by `TouchPhase::Canceled` (palm rejection, an OS
    /// gesture) has no `Touches::get_released` entry — the `pointerUp` must
    /// fall back to the finger's last known position, never to a resting
    /// mouse cursor elsewhere in the window (hybrid devices have both).
    #[test]
    fn canceled_touch_pointer_up_reports_last_touch_position() {
        use bevy::input::touch::{TouchInput, TouchPhase, Touches, touch_screen_input_system};

        let (mut app, mut out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<Touches>();
        app.init_resource::<crate::PointerCapture>();
        app.init_resource::<ActiveDrag>();
        app.init_resource::<crate::touch_scroll::TouchScrollState>();
        app.add_message::<TouchInput>();
        app.add_systems(
            Update,
            (touch_screen_input_system, collect_pointer_events).chain(),
        );

        // Hybrid-device window: an idle mouse cursor rests at (200, 50). The
        // canceled-touch pointerUp must NOT report it.
        let mut window = Window::default();
        window.set_physical_cursor_position(Some(bevy::math::DVec2::new(200.0, 50.0)));
        let win = app.world_mut().spawn(window).id();

        app.world_mut().spawn((
            ReactNode(1),
            Interaction::Pressed,
            RelativeCursorPosition {
                cursor_over: true,
                normalized: Some(Vec2::ZERO),
            },
            PointerHandlers {
                up: true,
                ..default()
            },
            ComputedNode {
                size: Vec2::new(200.0, 200.0),
                inverse_scale_factor: 1.0,
                ..default()
            },
            UiGlobalTransform::from_translation(Vec2::new(100.0, 100.0)),
        ));

        let touch = |phase, x: f32| TouchInput {
            phase,
            position: Vec2::new(x, 100.0),
            window: win,
            force: None,
            id: 7,
        };

        app.world_mut()
            .write_message(touch(TouchPhase::Started, 100.0));
        app.update();
        app.world_mut()
            .write_message(touch(TouchPhase::Moved, 110.0));
        app.update();
        drain_clicks(&mut out_rx); // discard pointerDown/pointerMove noise

        app.world_mut()
            .write_message(touch(TouchPhase::Canceled, 110.0));
        app.update();
        let up = drain_clicks(&mut out_rx);
        assert_eq!(
            up.iter().map(|e| e.kind.as_str()).collect::<Vec<_>>(),
            ["pointerUp"],
            "a canceled touch still ends the drag with a pointerUp"
        );
        assert_eq!(
            up[0].client_x,
            Some(110.0),
            "the pointerUp reports the finger's last position, not the idle mouse cursor"
        );
        assert!(!app.world().resource::<crate::PointerCapture>().dragging);
    }

    /// [`collect_pointer_events`] is the frame's `PointerCapture` assigner: a
    /// `wheel_captured` claim from last frame's wheel systems must be reset so
    /// a single scrolled frame doesn't trap world wheel-consumers forever.
    #[test]
    fn pointer_capture_wheel_claim_resets_each_frame() {
        let (mut app, _out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<bevy::input::touch::Touches>();
        app.init_resource::<crate::PointerCapture>();
        app.init_resource::<ActiveDrag>();
        app.init_resource::<crate::touch_scroll::TouchScrollState>();
        app.add_systems(Update, collect_pointer_events);

        app.world_mut()
            .resource_mut::<crate::PointerCapture>()
            .wheel_captured = true;
        app.update();

        assert!(
            !app.world()
                .resource::<crate::PointerCapture>()
                .wheel_captured,
            "a frame with no wheel claim must clear `wheel_captured`"
        );
    }

    /// SVG shapes report pointer-event x/y in SVG **user units**: a node
    /// carrying `SvgUserPos(Some(..))` (written by the shape synthesis while
    /// hovered) emits those coordinates; once the slot is `None` the clamped
    /// normalized position is the fallback.
    #[test]
    fn svg_user_pos_overrides_pointer_event_coords() {
        let (mut app, mut out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<bevy::input::touch::Touches>();
        app.init_resource::<crate::PointerCapture>();
        app.init_resource::<ActiveDrag>();
        app.init_resource::<crate::touch_scroll::TouchScrollState>();
        app.add_systems(Update, collect_pointer_events);

        let mut window = Window::default();
        window.set_physical_cursor_position(Some(bevy::math::DVec2::new(100.0, 100.0)));
        app.world_mut().spawn(window);

        let node = app
            .world_mut()
            .spawn((
                ReactNode(1),
                Interaction::Pressed,
                RelativeCursorPosition {
                    cursor_over: true,
                    normalized: Some(Vec2::ZERO),
                },
                PointerHandlers {
                    down: true,
                    up: true,
                    ..default()
                },
                crate::svg::SvgUserPos(Some(Vec2::new(42.0, 17.0))),
                ComputedNode {
                    size: Vec2::new(200.0, 200.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(100.0, 100.0)),
            ))
            .id();

        // Press: the down event carries the user-space cursor.
        app.world_mut()
            .resource_mut::<ButtonInput<MouseButton>>()
            .press(MouseButton::Left);
        app.update();
        let events = drain_clicks(&mut out_rx);
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].kind, "pointerDown");
        assert_eq!(
            (events[0].x, events[0].y),
            (Some(42.0), Some(17.0)),
            "a present user pos wins over the normalized position"
        );

        // Release with the slot cleared (the synthesis clears it on leave):
        // the up event falls back to the normalized 0..1 position.
        app.world_mut()
            .get_mut::<crate::svg::SvgUserPos>(node)
            .unwrap()
            .0 = None;
        app.world_mut()
            .resource_mut::<ButtonInput<MouseButton>>()
            .clear();
        app.world_mut()
            .resource_mut::<ButtonInput<MouseButton>>()
            .release(MouseButton::Left);
        app.update();
        let events = drain_clicks(&mut out_rx);
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].kind, "pointerUp");
        assert_eq!(
            (events[0].x, events[0].y),
            (Some(0.5), Some(0.5)),
            "an empty user-pos slot falls back to normalized coordinates"
        );
    }
}
