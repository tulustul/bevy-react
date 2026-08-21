//! Main-window event reporting back to JS — clicks, scroll offsets, canvas
//! resizes — plus the small shared utilities every event collector leans on
//! ([`send_ui_event`], [`climb`], coordinate normalization).

use bevy::picking::events::{Click, Pointer};
use bevy::picking::pointer::{PointerButton, PointerId};
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::ui::RelativeCursorPosition;
use bevy::ui::{ComputedNode, ScrollPosition, UiGlobalTransform};

use crate::bridge::{CanvasSizeTracker, JsBridge, RNode, ScrollListener};
use crate::canvas::{CanvasSurface, clamp_physical_size};
use crate::protocol::{NodeId, outbound::Outbound, outbound::UiEvent};
use crate::surface::SurfaceVirtualPointer;

/// Report clicks on reconciler-owned nodes to the JS thread. Rides bevy_picking's
/// `Pointer<Click>`, which fires on *release over the same node the press landed
/// on* — DOM click semantics, so press → drag off → release never clicks. Like
/// DOM `click`, only the primary (left) button clicks; right/middle interactions
/// are the `onPointer*` events' job (which carry the button). The surface
/// virtual pointer is excluded: its clicks are
/// [`collect_surface_clicks`](crate::reconcile::collect_surface_clicks)' job.
/// A touch whose scroll gesture moved past the tap slop is excluded too (web
/// semantics: scrolling cancels the tap — `pointerUp` still fires).
pub fn collect_ui_events(
    bridge: Res<JsBridge>,
    surface_pointer: Option<Res<SurfaceVirtualPointer>>,
    // `Option` so the many headless tests that never touch scrolling don't
    // have to init it; production always has it (`ReactUiPlugin`).
    touch_scroll: Option<Res<crate::touch_scroll::TouchScrollState>>,
    mut clicks: MessageReader<Pointer<Click>>,
    // Only `Interaction`-bearing nodes own a click (a `<button>` gets one via
    // `Button`; a `<text>` child does not) — the same attribution rule as the
    // legacy `ui_focus_system` path and `collect_surface_clicks`.
    targets: Query<&RNode, With<Interaction>>,
    child_of: Query<&ChildOf>,
) {
    // One gesture fans out to every entity in the pointer's hover map (a
    // pass-through node stacks the whole ancestor chain under the cursor).
    // Clicks do NOT bubble: per pointer, only the topmost resolving hit — the
    // one with the smallest `HitData.depth` (bevy_ui's backend assigns 0.0 to
    // the topmost node, +ε per node beneath) — owns the click. Depth, not
    // arrival order, decides: the hover map is a HashMap, so message order
    // carries no meaning.
    let mut topmost: HashMap<PointerId, (f32, Entity)> = HashMap::new();
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
        // A scrolled touch consumed its tap: bevy_picking emits `Click` on
        // entity identity alone (no movement threshold), so a 200px scroll
        // gesture would otherwise "click" the row it started on. Suppression
        // is readable here in either Update order relative to
        // `apply_touch_scroll` — the slop latches on move frames and the
        // claim survives the release frame (see `TouchScrollState`). A touch
        // bound to a handler drag (`ActiveDrag`) past slop still clicks —
        // pre-existing behavior, out of scope here.
        if let PointerId::Touch(id) = ev.pointer_id
            && touch_scroll.as_ref().is_some_and(|s| s.is_suppressed(id))
        {
            continue;
        }
        // Resolve the picked leaf (often a text span) to the nearest interactive
        // ancestor, so a click on a button's label still fires the button.
        if let Some(target) = climb(ev.entity, &child_of, |e| targets.contains(e)) {
            let candidate = (ev.hit.depth, target);
            topmost
                .entry(ev.pointer_id)
                .and_modify(|best| {
                    if candidate.0 < best.0 {
                        *best = candidate;
                    }
                })
                .or_insert(candidate);
        }
    }
    for (_, (_, target)) in topmost {
        if let Ok(rnode) = targets.get(target) {
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
    use crate::protocol::op::Op;
    use crate::reconcile::collect_surface_clicks;

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

    /// A synthetic picking `Pointer<Click>` location: the render target is
    /// irrelevant to the collectors, so a default image handle stands in.
    fn click_location() -> bevy::picking::pointer::Location {
        bevy::picking::pointer::Location {
            target: bevy::camera::NormalizedRenderTarget::Image(
                Handle::<bevy::image::Image>::default().into(),
            ),
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
