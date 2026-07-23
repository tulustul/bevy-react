//! Main-window event reporting back to JS — clicks, scroll offsets, canvas
//! resizes — plus the small shared utilities every event collector leans on
//! ([`send_ui_event`], [`climb`], coordinate normalization).

use bevy::picking::events::{Click, Pointer};
use bevy::picking::pointer::{PointerButton, PointerId};
use bevy::platform::collections::HashSet;
use bevy::prelude::*;
use bevy::ui::RelativeCursorPosition;
use bevy::ui::{ComputedNode, ScrollPosition, UiGlobalTransform};

use crate::bridge::{CanvasSizeTracker, JsBridge, RNode, ScrollListener};
use crate::canvas::{CanvasSurface, clamp_physical_size};
use crate::protocol::{NodeId, Outbound, UiEvent};
use crate::surface::SurfaceVirtualPointer;

/// Report clicks on reconciler-owned nodes to the JS thread. Rides bevy_picking's
/// `Pointer<Click>`, which fires on *release over the same node the press landed
/// on* — DOM click semantics, so press → drag off → release never clicks. Like
/// DOM `click`, only the primary (left) button clicks; right/middle interactions
/// are the `onPointer*` events' job (which carry the button). The surface
/// virtual pointer is excluded: its clicks are
/// [`collect_surface_clicks`](crate::reconcile::collect_surface_clicks)' job.
pub fn collect_ui_events(
    bridge: Res<JsBridge>,
    surface_pointer: Option<Res<SurfaceVirtualPointer>>,
    mut clicks: MessageReader<Pointer<Click>>,
    // Only `Interaction`-bearing nodes own a click (a `<button>` gets one via
    // `Button`; a `<text>` child does not) — the same attribution rule as the
    // legacy `ui_focus_system` path and `collect_surface_clicks`.
    targets: Query<&RNode, With<Interaction>>,
    child_of: Query<&ChildOf>,
) {
    // One gesture fans out to every entity in the pointer's hover map (a button
    // AND its pass-through label); climbing resolves them to the same owner, so
    // dedupe per (pointer, owner) within the frame.
    let mut seen: HashSet<(PointerId, Entity)> = HashSet::new();
    for ev in clicks.read() {
        if ev.button != PointerButton::Primary {
            continue;
        }
        if surface_pointer
            .as_ref()
            .is_some_and(|p| ev.pointer_id == p.id)
        {
            continue;
        }
        // Resolve the picked leaf (often a text span) to the nearest interactive
        // ancestor, so a click on a button's label still fires the button.
        if let Some(target) = climb(ev.entity, &child_of, |e| targets.contains(e))
            && seen.insert((ev.pointer_id, target))
            && let Ok(rnode) = targets.get(target)
        {
            debug!("click -> reconciler node {}", rnode.0);
            send_ui_event(&bridge, rnode.0, "click", None, None, None);
        }
    }
}

/// Report `ScrollPosition` changes back to JS as `"scroll"` events. Scoped to
/// nodes carrying a [`ScrollListener`] (i.e. those with an `onScroll` handler) so
/// the `Changed<ScrollPosition>` query stays cheap — `ScrollPosition` is a
/// required component of every `Node`, so an unscoped query would fire for every
/// node on its mount frame. A controlled write-back is deduped against
/// [`JsBridge::scroll_positions`], breaking the controlled-component echo loop.
#[allow(clippy::type_complexity)]
pub fn collect_scroll_events(
    mut bridge: ResMut<JsBridge>,
    query: Query<(&ScrollPosition, &RNode), (With<ScrollListener>, Changed<ScrollPosition>)>,
) {
    for (scroll, rnode) in &query {
        let id = rnode.0;
        if bridge.scroll_positions.get(&id) == Some(&scroll.0) {
            // Our own controlled write (or an unchanged value) — don't echo it.
            continue;
        }
        bridge.scroll_positions.insert(id, scroll.0);
        debug!("scroll -> reconciler node {id}");
        let _ = bridge.outbound_tx.send(Outbound::UiEvent {
            event: UiEvent {
                id,
                kind: "scroll".to_string(),
                scroll_top: Some(scroll.0.y),
                scroll_left: Some(scroll.0.x),
                ..default()
            },
        });
    }
}

/// Emit a `"resize"` UI event (new logical size) for every `<canvas>` whose
/// laid-out **physical** size changed — including its first layout (0 → W×H)
/// and a DPR change at constant logical size, both of which cleared the
/// retained surface. Not gated on a handler flag: the JS runtime consumes
/// resizes unconditionally (to replay a declarative painter and keep the
/// canvas handle's size fresh); a user `onResize` is dispatched if registered.
/// The per-entity [`CanvasSizeTracker`] filters the non-size `ComputedNode`
/// rewrites layout does every pass. Sizes clamp exactly like the rasterizer's,
/// so the reported size always matches the actual buffer.
#[allow(clippy::type_complexity)]
pub fn collect_canvas_resize_events(
    bridge: Res<JsBridge>,
    mut query: Query<
        (&RNode, &ComputedNode, &mut CanvasSizeTracker),
        (With<CanvasSurface>, Changed<ComputedNode>),
    >,
) {
    for (rnode, node, mut tracker) in &mut query {
        let (w, h) = clamp_physical_size(node.size);
        if w == 0 || h == 0 || tracker.0 == (w, h) {
            continue;
        }
        tracker.0 = (w, h);
        let scale = if node.inverse_scale_factor > 0.0 {
            node.inverse_scale_factor
        } else {
            1.0
        };
        debug!("canvas resize -> reconciler node {}", rnode.0);
        let _ = bridge.outbound_tx.send(Outbound::UiEvent {
            event: UiEvent {
                id: rnode.0,
                kind: "resize".to_string(),
                width: Some(w as f32 * scale),
                height: Some(h as f32 * scale),
                ..default()
            },
        });
    }
}

/// Send one [`Outbound::UiEvent`] to the JS thread for a reconciler node.
pub(super) fn send_ui_event(
    bridge: &JsBridge,
    id: NodeId,
    kind: &str,
    pos: Option<Vec2>,
    abs: Option<Vec2>,
    button: Option<u8>,
) {
    let _ = bridge.outbound_tx.send(Outbound::UiEvent {
        event: UiEvent {
            id,
            kind: kind.to_string(),
            x: pos.map(|p| p.x),
            y: pos.map(|p| p.y),
            client_x: abs.map(|a| a.x),
            client_y: abs.map(|a| a.y),
            button,
            ..default()
        },
    });
}

/// DOM `MouseEvent.button` number for a picking button (`0`/`1`/`2` =
/// left/middle/right — bevy_picking never forwards Back/Forward/Other).
pub(super) fn dom_button(button: PointerButton) -> u8 {
    match button {
        PointerButton::Primary => 0,
        PointerButton::Middle => 1,
        PointerButton::Secondary => 2,
    }
}

/// Shift `RelativeCursorPosition`'s centered, unclamped position to a clamped
/// `0..1` top-left-origin coordinate. `None` when the cursor position is unknown.
pub(super) fn normalized_01(rel: &RelativeCursorPosition) -> Option<Vec2> {
    rel.normalized
        .map(|n| Vec2::new((n.x + 0.5).clamp(0.0, 1.0), (n.y + 0.5).clamp(0.0, 1.0)))
}

/// Node-relative `0..1` position (top-left origin) of a surface-space pixel
/// `position` within a node, plus that absolute surface pixel as the client coord.
/// `None` when the point can't be normalized (degenerate node).
pub(super) fn surface_relative(
    node: &ComputedNode,
    transform: &UiGlobalTransform,
    position: Vec2,
) -> Option<(Vec2, Vec2)> {
    node.normalize_point(*transform, position).map(|n| {
        (
            Vec2::new((n.x + 0.5).clamp(0.0, 1.0), (n.y + 0.5).clamp(0.0, 1.0)),
            position,
        )
    })
}

/// Walk up the `ChildOf` chain from `entity` (inclusive) to the nearest entity that
/// satisfies `is_target`. Surface picking hits the topmost leaf node (e.g. a `<text>`
/// inside a `<button>`); this resolves it to the node that actually owns the
/// interaction — mirroring how the legacy focus system attributes to the nearest
/// `Interaction` node. Stops at the (detached) surface root when nothing matches.
pub(crate) fn climb(
    mut entity: Entity,
    child_of: &Query<&ChildOf>,
    is_target: impl Fn(Entity) -> bool,
) -> Option<Entity> {
    loop {
        if is_target(entity) {
            return Some(entity);
        }
        entity = child_of.get(entity).ok()?.parent();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::Op;

    /// [`collect_scroll_events`] reports a `"scroll"` for a `ScrollListener` node
    /// whose offset diverges from the recorded one, ignores non-listener nodes, and
    /// records the emitted value.
    #[test]
    fn collect_scroll_events_emits_for_listener_only() {
        use bevy::ecs::system::RunSystemOnce;

        let mut world = World::new();
        let (out_tx, mut out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        let (_ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let root = world.spawn_empty().id();
        world.insert_resource(JsBridge::new(ops_rx, out_tx, root));

        world.spawn((
            ScrollPosition(Vec2::new(0.0, 50.0)),
            RNode(1),
            ScrollListener,
        ));
        // No marker → must be ignored even though its ScrollPosition is "changed".
        world.spawn((ScrollPosition(Vec2::new(0.0, 70.0)), RNode(2)));

        world.run_system_once(collect_scroll_events).unwrap();

        match out_rx.try_recv().expect("a scroll event for the listener") {
            Outbound::UiEvent { event } => {
                assert_eq!(event.id, 1);
                assert_eq!(event.kind, "scroll");
                assert_eq!(event.scroll_top, Some(50.0));
                assert_eq!(event.scroll_left, Some(0.0));
            }
            other => panic!("expected a UiEvent, got {other:?}"),
        }
        assert!(
            out_rx.try_recv().is_err(),
            "the non-listener node must not emit"
        );
        assert_eq!(
            world.resource::<JsBridge>().scroll_positions.get(&1),
            Some(&Vec2::new(0.0, 50.0))
        );
    }

    /// A `ScrollPosition` equal to the recorded value (a controlled write-back, or
    /// an unchanged offset) is NOT echoed — this is what breaks the controlled
    /// component's feedback loop.
    #[test]
    fn collect_scroll_events_dedups_controlled_writeback() {
        use bevy::ecs::system::RunSystemOnce;

        let mut world = World::new();
        let (out_tx, mut out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        let (_ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let root = world.spawn_empty().id();
        world.insert_resource(JsBridge::new(ops_rx, out_tx, root));

        // The controlled write already recorded this exact offset.
        world
            .resource_mut::<JsBridge>()
            .scroll_positions
            .insert(1, Vec2::new(0.0, 50.0));
        world.spawn((
            ScrollPosition(Vec2::new(0.0, 50.0)),
            RNode(1),
            ScrollListener,
        ));

        world.run_system_once(collect_scroll_events).unwrap();

        assert!(
            out_rx.try_recv().is_err(),
            "a write-back equal to the recorded value must not echo back to React"
        );
    }
}
