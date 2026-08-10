//! Main-window pointer/drag/hover reporting for elements that declared
//! `onPointer*` handlers: the cross-frame drag state ([`ActiveDrag`]), the
//! per-frame drag driver, and the `Interaction`-boundary hover events.

use bevy::prelude::*;
use bevy::ui::RelativeCursorPosition;

use super::events::{normalized_01, send_ui_event};
use crate::bridge::{HoverState, JsBridge, PointerHandlers, RNode};
use crate::protocol::{Outbound, UiEvent};
use crate::svg::SvgUserPos;

/// Event x/y for a node: an SVG shape's **user-space** cursor when its
/// [`SvgUserPos`] slot carries one (written by the shape synthesis while
/// hovered — see `crate::svg::interact`), else the clamped `0..1` normalized
/// position. `None` when neither is known. The single home of the
/// user-pos-wins rule — both the drag and hover collectors go through it.
fn event_pos(user: Option<&SvgUserPos>, rel: Option<&RelativeCursorPosition>) -> Option<Vec2> {
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

/// The node currently being dragged (an `onPointer*` element pressed with any
/// mouse button), plus the last cursor positions we read for it — used as a
/// fallback when the cursor leaves the window mid-drag. `button`/`dom_button`
/// are the button that began the drag: move/up track and report it, and any
/// other button pressed mid-drag is ignored (one active drag at a time).
/// `last_pos` is the node-relative `0..1` position; `last_abs` is the absolute
/// window position.
pub struct ActiveDrag {
    entity: Option<Entity>,
    button: MouseButton,
    dom_button: u8,
    last_pos: Vec2,
    last_abs: Vec2,
}

impl Default for ActiveDrag {
    fn default() -> Self {
        Self {
            entity: None,
            button: MouseButton::Left,
            dom_button: 0,
            last_pos: Vec2::ZERO,
            last_abs: Vec2::ZERO,
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
/// ([`ActiveDrag::button`] — one drag at a time, keyed to the button that began
/// it).
///
/// `RelativeCursorPosition::normalized` is centered (`-0.5` = left/top edge,
/// `0.5` = right/bottom); we shift it to a `0..1` top-left origin to match the
/// CSS-like coordinates the JS handlers expect.
#[allow(clippy::type_complexity)]
pub fn collect_pointer_events(
    bridge: Res<JsBridge>,
    buttons: Res<ButtonInput<MouseButton>>,
    windows: Query<&Window>,
    nodes: Query<(
        Entity,
        &RNode,
        &Interaction,
        &RelativeCursorPosition,
        &PointerHandlers,
        // SVG shapes report x/y in user units instead (see [`event_pos`]).
        Option<&SvgUserPos>,
    )>,
    interactions: Query<&Interaction>,
    mut capture: ResMut<crate::PointerCapture>,
    mut drag: Local<ActiveDrag>,
) {
    let emit = |rnode: &RNode, kind: &str, pos: Vec2, abs: Vec2, button: u8| {
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
    if drag.entity.is_none() {
        'begin: for (mb, dom) in POINTER_BUTTONS {
            if !buttons.just_pressed(mb) {
                continue;
            }
            for (entity, rnode, interaction, rel, handlers, user) in &nodes {
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
                if over {
                    let pos = event_pos(user, Some(rel)).unwrap_or(drag.last_pos);
                    let abs = cursor_abs.unwrap_or(drag.last_abs);
                    drag.entity = Some(entity);
                    drag.button = mb;
                    drag.dom_button = dom;
                    drag.last_pos = pos;
                    drag.last_abs = abs;
                    if handlers.down {
                        emit(rnode, "pointerDown", pos, abs, dom);
                    }
                    break 'begin;
                }
            }
        }
    }

    // While the initiating button is held, follow the cursor and emit move
    // events (a drag). Only an actual cursor displacement emits: a stationary
    // held pointer stays silent (DOM `pointermove` semantics) instead of
    // flooding the bridge with one identical event per frame.
    if buttons.pressed(drag.button)
        && let Some(entity) = drag.entity
        && let Ok((_, rnode, _, rel, handlers, user)) = nodes.get(entity)
    {
        let pos = event_pos(user, Some(rel)).unwrap_or(drag.last_pos);
        let abs = cursor_abs.unwrap_or(drag.last_abs);
        let cursor_moved = abs != drag.last_abs;
        drag.last_pos = pos;
        drag.last_abs = abs;
        if cursor_moved && handlers.moved {
            emit(rnode, "pointerMove", pos, abs, drag.dom_button);
        }
    }

    // End the drag when the initiating button is released.
    if buttons.just_released(drag.button)
        && let Some(entity) = drag.entity.take()
        && let Ok((_, rnode, _, rel, handlers, user)) = nodes.get(entity)
    {
        let pos = event_pos(user, Some(rel)).unwrap_or(drag.last_pos);
        let abs = cursor_abs.unwrap_or(drag.last_abs);
        if handlers.up {
            emit(rnode, "pointerUp", pos, abs, drag.dom_button);
        }
    }

    // Publish whether the UI owns the pointer so world systems (e.g. a camera
    // controller) can ignore the mouse. `dragging` spans the whole gesture even
    // once the cursor leaves the element; `over_ui` covers hover/press on any
    // interactive node (a wheel the UI consumes is `wheel_captured`'s job).
    capture.dragging = drag.entity.is_some();
    capture.over_ui = interactions.iter().any(|i| *i != Interaction::None);
    // This system is the frame's assigner; the wheel systems (`apply_scroll`,
    // `collect_wheel_events` — ordered after, same set) re-claim per frame.
    capture.wheel_captured = false;
}

/// Emit `pointerEnter` / `pointerLeave` for main-window nodes that declared those
/// handlers. Hover in/out is the `Interaction` `None`↔(`Hovered`|`Pressed`) boundary
/// — the same signal that drives hover *styling*
/// ([`apply_interaction_styles`](crate::reconcile::apply_interaction_styles)) — so
/// this lands on the right node via `FocusPolicy` (a `<button>`, not its child text)
/// with no ancestor climbing. Per-node [`HoverState`] remembers whether the pointer
/// was inside, so a click's `Hovered`↔`Pressed` transition never re-fires enter/leave.
#[allow(clippy::type_complexity)]
pub fn collect_hover_events(
    bridge: Res<JsBridge>,
    windows: Query<&Window>,
    mut nodes: Query<
        (
            &Interaction,
            &mut HoverState,
            &PointerHandlers,
            &RNode,
            Option<&RelativeCursorPosition>,
            // SVG shapes report x/y in user units instead (see [`event_pos`]).
            Option<&SvgUserPos>,
        ),
        Changed<Interaction>,
    >,
) {
    let cursor_abs = windows.iter().next().and_then(|w| w.cursor_position());
    for (interaction, mut hover, handlers, rnode, rel, user) in &mut nodes {
        let inside = *interaction != Interaction::None;
        if inside == hover.0 {
            continue; // A `Hovered`↔`Pressed` change, not a boundary crossing.
        }
        hover.0 = inside;
        let kind = if inside {
            "pointerEnter"
        } else {
            "pointerLeave"
        };
        if (inside && handlers.enter) || (!inside && handlers.leave) {
            let pos = event_pos(user, rel).unwrap_or(Vec2::ZERO);
            let abs = cursor_abs.unwrap_or(Vec2::ZERO);
            send_ui_event(&bridge, rnode.0, kind, Some(pos), Some(abs), None);
        }
    }
}

#[cfg(test)]
mod tests {
    use bevy::image::Image;
    use bevy::picking::events::{Click, Pointer};
    use bevy::picking::pointer::{PointerButton, PointerId};

    use super::super::events::collect_ui_events;
    use super::super::surface_events::collect_surface_clicks;
    use super::*;
    use crate::protocol::{Op, UiEvent};
    use crate::surface::SurfaceVirtualPointer;

    /// A synthetic picking `Pointer<Click>` location: the render target is
    /// irrelevant to the collectors, so a default image handle stands in.
    fn click_location() -> bevy::picking::pointer::Location {
        bevy::picking::pointer::Location {
            target: bevy::camera::NormalizedRenderTarget::Image(Handle::<Image>::default().into()),
            position: Vec2::ZERO,
        }
    }

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

    /// [`collect_hover_events`] emits `pointerEnter` on the first non-`None`
    /// interaction and `pointerLeave` on the return to `None`, and must NOT re-fire
    /// on the `Hovered`↔`Pressed` transition of a click (guarded by [`HoverState`]).
    #[test]
    fn hover_events_fire_on_boundary_only() {
        let mut app = App::new();
        app.add_plugins(MinimalPlugins);
        let (out_tx, mut out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        let (_ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_systems(Update, collect_hover_events);

        let e = app
            .world_mut()
            .spawn((
                Interaction::None,
                HoverState(false),
                PointerHandlers {
                    enter: true,
                    leave: true,
                    ..default()
                },
                RNode(1),
            ))
            .id();

        let set = |app: &mut App, i: Interaction| {
            *app.world_mut()
                .entity_mut(e)
                .get_mut::<Interaction>()
                .unwrap() = i;
            app.update();
        };

        app.update(); // Mount frame: still "outside" (None) → no event.
        set(&mut app, Interaction::Hovered); // None → Hovered: enter.
        set(&mut app, Interaction::Pressed); // Hovered → Pressed: no re-enter.
        set(&mut app, Interaction::None); // Pressed → None: leave.

        let kinds: Vec<String> = std::iter::from_fn(|| out_rx.try_recv().ok())
            .map(|o| match o {
                Outbound::UiEvent { event } => {
                    assert_eq!(event.id, 1);
                    event.kind
                }
                other => panic!("expected a UiEvent, got {other:?}"),
            })
            .collect();
        assert_eq!(kinds, vec!["pointerEnter", "pointerLeave"]);
    }

    /// [`collect_ui_events`] rides `Pointer<Click>`: only the primary button
    /// clicks (right/middle are the `onPointer*` events' job), a click on a
    /// node's leaf (label) climbs to the `Interaction`-bearing owner, and the
    /// multi-pick fan-out (leaf + owner both hovered) dedupes to ONE event.
    #[test]
    fn picking_click_fires_once_primary_only() {
        let (mut app, mut out_rx) = click_app();
        app.add_systems(Update, collect_ui_events);

        let owner = app.world_mut().spawn((RNode(1), Interaction::None)).id();
        let leaf = app.world_mut().spawn(ChildOf(owner)).id();

        let click = |entity, button| {
            Pointer::new(
                PointerId::Mouse,
                click_location(),
                Click {
                    button,
                    hit: bevy::picking::backend::HitData::new(Entity::PLACEHOLDER, 0.0, None, None),
                    duration: std::time::Duration::ZERO,
                    count: 1,
                },
                entity,
            )
        };
        // A right click must be ignored entirely…
        app.world_mut()
            .write_message(click(leaf, PointerButton::Secondary));
        // …while a primary gesture fans out to every hovered entity (leaf +
        // owner) and must dedupe to one click.
        app.world_mut()
            .write_message(click(leaf, PointerButton::Primary));
        app.world_mut()
            .write_message(click(owner, PointerButton::Primary));
        app.update();

        let events = drain_clicks(&mut out_rx);
        assert_eq!(
            events.len(),
            1,
            "secondary filtered out; leaf + owner primary picks dedupe to one click"
        );
        assert_eq!(events[0].id, 1);
        assert_eq!(events[0].kind, "click");
        assert_eq!(
            events[0].button, None,
            "clicks carry no button (primary implied)"
        );
    }

    /// [`collect_pointer_events`] emits `pointerMove` only when the window cursor
    /// actually moved: a stationary held button is silent (the regression was one
    /// identical event per frame), and the down frame doesn't duplicate
    /// `pointerDown` as a zero-length move.
    #[test]
    fn pointer_move_only_fires_on_cursor_movement() {
        let (mut app, mut out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<crate::PointerCapture>();
        app.add_systems(Update, collect_pointer_events);

        let mut window = Window::default();
        window.set_physical_cursor_position(Some(bevy::math::DVec2::new(100.0, 100.0)));
        let win = app.world_mut().spawn(window).id();

        let node = app
            .world_mut()
            .spawn((
                RNode(1),
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

    /// [`collect_pointer_events`] is the frame's `PointerCapture` assigner: a
    /// `wheel_captured` claim from last frame's wheel systems must be reset so
    /// a single scrolled frame doesn't trap world wheel-consumers forever.
    #[test]
    fn pointer_capture_wheel_claim_resets_each_frame() {
        let (mut app, _out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<crate::PointerCapture>();
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

    /// Clicks do NOT bubble: when nested `Interaction` owners are all under the
    /// cursor (pass-through hit stack), only the topmost owner — the resolving
    /// hit with the smallest `HitData.depth`, not the first message (hover-map
    /// order is arbitrary) — gets the click.
    #[test]
    fn nested_onclick_owners_click_topmost_only() {
        let (mut app, mut out_rx) = click_app();
        app.add_systems(Update, collect_ui_events);

        let outer = app.world_mut().spawn((RNode(1), Interaction::None)).id();
        let inner = app
            .world_mut()
            .spawn((RNode(2), Interaction::None, ChildOf(outer)))
            .id();
        let leaf = app.world_mut().spawn(ChildOf(inner)).id();

        let click = |entity, depth| {
            Pointer::new(
                PointerId::Mouse,
                click_location(),
                Click {
                    button: PointerButton::Primary,
                    hit: bevy::picking::backend::HitData::new(
                        Entity::PLACEHOLDER,
                        depth,
                        None,
                        None,
                    ),
                    duration: std::time::Duration::ZERO,
                    count: 1,
                },
                entity,
            )
        };
        // Adversarial order: the DEEPEST hit arrives first (the hover map is a
        // HashMap — message order carries no meaning). Depths mirror the
        // bevy_ui backend: topmost 0.0, +0.00001 per node beneath.
        app.world_mut().write_message(click(outer, 0.00002));
        app.world_mut().write_message(click(leaf, 0.0));
        app.world_mut().write_message(click(inner, 0.00001));
        app.update();

        let events = drain_clicks(&mut out_rx);
        assert_eq!(
            events.len(),
            1,
            "a click over nested owners must fire only the topmost owner"
        );
        assert_eq!(events[0].id, 2, "the inner (topmost) node owns the click");
    }

    /// [`collect_surface_clicks`] applies the same no-bubbling rule: nested
    /// surface owners under one virtual-pointer gesture click only the topmost.
    #[test]
    fn surface_nested_onclick_owners_click_topmost_only() {
        let (mut app, mut out_rx) = click_app();
        app.add_systems(Startup, crate::surface::init_surface_pointer);
        app.add_systems(Update, collect_surface_clicks);
        app.update(); // Run Startup so the pointer resource exists.

        let outer = app.world_mut().spawn((RNode(1), Interaction::None)).id();
        let inner = app
            .world_mut()
            .spawn((RNode(2), Interaction::None, ChildOf(outer)))
            .id();

        let surface_id = app.world().resource::<SurfaceVirtualPointer>().id;
        let click = |entity, depth| {
            Pointer::new(
                surface_id,
                click_location(),
                Click {
                    button: PointerButton::Primary,
                    hit: bevy::picking::backend::HitData::new(
                        Entity::PLACEHOLDER,
                        depth,
                        None,
                        None,
                    ),
                    duration: std::time::Duration::ZERO,
                    count: 1,
                },
                entity,
            )
        };
        // Deepest-first again: selection must ride depth, not arrival order.
        app.world_mut().write_message(click(outer, 0.00001));
        app.world_mut().write_message(click(inner, 0.0));
        app.update();

        let events = drain_clicks(&mut out_rx);
        assert_eq!(
            events.len(),
            1,
            "a surface click over nested owners must fire only the topmost owner"
        );
        assert_eq!(events[0].id, 2, "the inner (topmost) node owns the click");
    }

    /// SVG shapes report pointer-event x/y in SVG **user units**: a node
    /// carrying `SvgUserPos(Some(..))` (written by the shape synthesis while
    /// hovered) emits those coordinates; once the slot is `None` the clamped
    /// normalized position is the fallback.
    #[test]
    fn svg_user_pos_overrides_pointer_event_coords() {
        let (mut app, mut out_rx) = click_app();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<crate::PointerCapture>();
        app.add_systems(Update, collect_pointer_events);

        let mut window = Window::default();
        window.set_physical_cursor_position(Some(bevy::math::DVec2::new(100.0, 100.0)));
        app.world_mut().spawn(window);

        let node = app
            .world_mut()
            .spawn((
                RNode(1),
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

    /// [`collect_hover_events`] applies the same user-space override: a
    /// `pointerEnter` on a shape reports the SVG user-space cursor.
    #[test]
    fn svg_user_pos_overrides_hover_event_coords() {
        let (mut app, mut out_rx) = click_app();
        app.add_systems(Update, collect_hover_events);

        let e = app
            .world_mut()
            .spawn((
                Interaction::None,
                HoverState(false),
                PointerHandlers {
                    enter: true,
                    ..default()
                },
                RNode(1),
                RelativeCursorPosition {
                    cursor_over: true,
                    normalized: Some(Vec2::ZERO),
                },
                crate::svg::SvgUserPos(Some(Vec2::new(30.0, 60.0))),
            ))
            .id();
        app.update(); // Mount frame: still outside.
        *app.world_mut().get_mut::<Interaction>(e).unwrap() = Interaction::Hovered;
        app.update();

        let events = drain_clicks(&mut out_rx);
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].kind, "pointerEnter");
        assert_eq!(
            (events[0].x, events[0].y),
            (Some(30.0), Some(60.0)),
            "enter coordinates ride the user-space cursor"
        );
    }

    /// No-regression pin for handler fallthrough: a click picked on a
    /// handler-less shape (no `Interaction`) climbs the `ChildOf` chain to
    /// the `<svg>` root's own `Interaction` — the root still owns the click.
    #[test]
    fn handlerless_shape_click_falls_to_svg_root() {
        let (mut app, mut out_rx) = click_app();
        app.add_systems(Update, collect_ui_events);

        let root = app.world_mut().spawn((RNode(1), Interaction::None)).id();
        let shape = app
            .world_mut()
            .spawn((
                RNode(2),
                crate::svg::SvgShape {
                    kind: crate::svg::ShapeKind::Circle,
                    attrs: crate::svg::ShapeAttrs::default(),
                },
                ChildOf(root),
            ))
            .id();

        app.world_mut().write_message(Pointer::new(
            PointerId::Mouse,
            click_location(),
            Click {
                button: PointerButton::Primary,
                hit: bevy::picking::backend::HitData::new(Entity::PLACEHOLDER, 0.0, None, None),
                duration: std::time::Duration::ZERO,
                count: 1,
            },
            shape,
        ));
        app.update();

        let events = drain_clicks(&mut out_rx);
        assert_eq!(events.len(), 1, "the click resolves to exactly one owner");
        assert_eq!(
            events[0].id, 1,
            "a handler-less shape's click belongs to the <svg> root"
        );
    }

    /// The surface virtual pointer's clicks belong to `collect_surface_clicks`
    /// alone: [`collect_ui_events`] must skip them (no double-fire), and the
    /// surface collector reports exactly one click.
    #[test]
    fn surface_pointer_clicks_are_not_main_clicks() {
        let (mut app, mut out_rx) = click_app();
        app.add_systems(Startup, crate::surface::init_surface_pointer);
        app.add_systems(Update, (collect_ui_events, collect_surface_clicks));
        app.update(); // Run Startup so the pointer resource exists.

        let owner = app.world_mut().spawn((RNode(7), Interaction::None)).id();
        let surface_id = app.world().resource::<SurfaceVirtualPointer>().id;
        app.world_mut().write_message(Pointer::new(
            surface_id,
            click_location(),
            Click {
                button: PointerButton::Primary,
                hit: bevy::picking::backend::HitData::new(Entity::PLACEHOLDER, 0.0, None, None),
                duration: std::time::Duration::ZERO,
                count: 1,
            },
            owner,
        ));
        app.update();

        let events = drain_clicks(&mut out_rx);
        assert_eq!(
            events.len(),
            1,
            "exactly one click: surface-collected, not double-fired by collect_ui_events"
        );
        assert_eq!(events[0].id, 7);
        assert_eq!(events[0].button, None, "clicks carry no button");
    }
}
