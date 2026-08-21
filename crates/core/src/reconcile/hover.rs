//! Main-window hover reporting (`pointerEnter` / `pointerLeave`) for elements
//! that declared those handlers — split from `pointer.rs` (the drag driver),
//! whose cross-frame state it does not share: hover is a pure per-frame
//! `Interaction`-boundary observer.

use bevy::prelude::*;
use bevy::ui::RelativeCursorPosition;

use super::events::send_ui_event;
use super::pointer::event_pos;
use crate::bridge::{HoverState, JsBridge, PointerHandlers, RNode};
use crate::svg::SvgUserPos;

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
    use super::*;
    use crate::bridge::JsBridge;
    use crate::protocol::{op::Op, outbound::Outbound, outbound::UiEvent};

    /// A minimal app with a `JsBridge` (outbound receiver kept alive) and
    /// [`collect_hover_events`] scheduled.
    fn hover_app() -> (App, tokio::sync::mpsc::UnboundedReceiver<Outbound>) {
        let mut app = App::new();
        app.add_plugins(MinimalPlugins);
        let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        let (_ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        std::mem::forget(_ops_tx); // Keep the ops channel open for the app's lifetime.
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_systems(Update, collect_hover_events);
        (app, out_rx)
    }

    fn drain_events(out_rx: &mut tokio::sync::mpsc::UnboundedReceiver<Outbound>) -> Vec<UiEvent> {
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
        let (mut app, mut out_rx) = hover_app();

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

        let kinds: Vec<String> = drain_events(&mut out_rx)
            .into_iter()
            .map(|event| {
                assert_eq!(event.id, 1);
                event.kind
            })
            .collect();
        assert_eq!(kinds, vec!["pointerEnter", "pointerLeave"]);
    }

    /// [`collect_hover_events`] applies the SVG user-space override: a
    /// `pointerEnter` on a shape reports the SVG user-space cursor.
    #[test]
    fn svg_user_pos_overrides_hover_event_coords() {
        let (mut app, mut out_rx) = hover_app();

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

        let events = drain_events(&mut out_rx);
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].kind, "pointerEnter");
        assert_eq!(
            (events[0].x, events[0].y),
            (Some(30.0), Some(60.0)),
            "enter coordinates ride the user-space cursor"
        );
    }
}
