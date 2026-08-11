//! Pick mode ("click a node on screen to select it") and the on-screen
//! highlight overlay (pick hover, tree-row hover, persistent selection box).

use bevy::picking::hover::HoverMap;
use bevy::picking::pointer::PointerId;
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};

use crate::bridge::{JsBridge, RNode};
use crate::event::ReactEvents;
use crate::plugin::PointerCapture;
use crate::protocol::NodeId;
use crate::reconcile::climb;
use crate::{react_event, react_message};

use super::DevtoolsState;

/// Bevy → JS: pick mode clicked a node on screen — select it in the tree.
#[react_event(name = "devtools.picked")]
struct DevtoolsPicked {
    id: NodeId,
}

/// JS → Bevy: the panel's pick-mode button was toggled.
#[react_message(name = "devtools.pick")]
pub(super) struct DevtoolsPickMessage {
    on: bool,
}

/// JS → Bevy: a tree row was selected (or the selection cleared).
#[react_message(name = "devtools.select")]
pub(super) struct DevtoolsSelectMessage {
    id: Option<NodeId>,
}

/// JS → Bevy: a tree row is hovered (highlight that node on screen), or `null`
/// on hover end.
#[react_message(name = "devtools.highlight")]
pub(super) struct DevtoolsHighlightMessage {
    id: Option<NodeId>,
}

pub(super) fn on_pick_message(msg: On<DevtoolsPickMessage>, mut state: ResMut<DevtoolsState>) {
    state.pick = msg.event().on;
    if !state.pick {
        state.pick_hover = None;
    }
}

pub(super) fn on_select_message(msg: On<DevtoolsSelectMessage>, mut state: ResMut<DevtoolsState>) {
    state.selected = msg.event().id;
}

pub(super) fn on_highlight_message(
    msg: On<DevtoolsHighlightMessage>,
    mut state: ResMut<DevtoolsState>,
) {
    state.tree_hover = msg.event().id;
}

/// Pick mode ("inspect" cursor): while active, the topmost app node under the
/// window cursor is hover-highlighted, and a left click selects it in the tree
/// (exiting pick mode). Uses the picking `HoverMap` — the established pattern
/// for UI hit-tests here (window-cursor `UiStack` walks can't see everything
/// picking can) — and resolves hits the way surface picking does: climb from the
/// topmost (min-depth) hit to the nearest `RNode` owner. Anything under the
/// panel's own `<root>` (reported by the JS panel as
/// [`DevtoolsState::panel_root`]) is rejected so the panel can never pick
/// itself; app `<root>` overlays are ordinary pick targets. Only the mouse
/// pointer is consulted: `<surface>` subtrees (in-world virtual pointer) are
/// out of pick mode's scope.
///
/// Known limitation (documented): the picking click still reaches the app's own
/// `onClick` handlers — pick mode does not suppress the click.
#[allow(clippy::too_many_arguments)]
pub(super) fn drive_pick_mode(
    mut state: ResMut<DevtoolsState>,
    hover_map: Option<Res<HoverMap>>,
    mouse: Res<ButtonInput<MouseButton>>,
    capture: Option<ResMut<PointerCapture>>,
    bridge: Option<Res<JsBridge>>,
    rnodes: Query<&RNode>,
    child_of: Query<&ChildOf>,
    events: ReactEvents,
) {
    if !(state.open && state.pick) {
        return;
    }
    // Claim the pointer for the whole pick session so world input (camera
    // orbit/zoom) ignores the picking gestures — both channels: hover
    // (`over_ui` blocks drags/presses) and wheel (`wheel_captured` blocks zoom).
    if let Some(mut capture) = capture {
        capture.over_ui = true;
        capture.wheel_captured = true;
    }

    // The panel's own root, resolved to its entity. `None` (not yet reported /
    // no bridge) rejects nothing — pick mode is only reachable from an open
    // panel, which reports its root on mount.
    let panel_entity = state
        .panel_root
        .and_then(|id| bridge.as_ref().and_then(|b| b.nodes.get(&id).copied()));

    let hovered = hover_map
        .as_deref()
        .and_then(|hover_map| hover_map.get(&PointerId::Mouse))
        .and_then(|hits| {
            // The Mouse hover map mixes backends: bevy_ui hits (stack-index
            // depth) AND mesh-picking hits (ray distance in world units — the
            // demos always have a 3D scene behind the UI). The scales aren't
            // comparable, and a mesh often wins a raw `min_by(depth)`, which
            // made picking look dead over the whole viewport. So: keep only
            // hits that resolve to a reconciled UI node (climb to an `RNode`
            // owner — this drops mesh hits but keeps panel nodes, so you still
            // can't pick app nodes THROUGH the panel), take the frontmost of
            // those, THEN apply the panel self-rejection.
            let (&top, _) = hits
                .iter()
                .filter(|&(&entity, _)| climb(entity, &child_of, |e| rnodes.contains(e)).is_some())
                .min_by(|a, b| a.1.depth.total_cmp(&b.1.depth))?;
            // The panel can't pick itself (its nodes live under its own root).
            if let Some(panel) = panel_entity
                && climb(top, &child_of, |e| e == panel).is_some()
            {
                return None;
            }
            let owner = climb(top, &child_of, |e| rnodes.contains(e))?;
            rnodes.get(owner).ok().map(|r| r.0)
        });
    state.pick_hover = hovered;

    if mouse.just_pressed(MouseButton::Left)
        && let Some(id) = hovered
    {
        state.pick = false;
        state.pick_hover = None;
        state.selected = Some(id);
        events.send(&DevtoolsPicked { id });
    }
}

/// Marks the single pre-spawned highlight overlay entity: the translucent box
/// drawn over the node the devtools is hovering/selecting.
#[derive(Component)]
pub(super) struct DevtoolsHighlightOverlay;

/// Spawn the (hidden) highlight overlay once. A detached window-root node so it
/// needs no parent; `GlobalZIndex(i32::MAX - 1)` floats it above the app but
/// below the devtools panel's `<root>` (`i32::MAX`), and `Pickable::IGNORE`
/// keeps it out of the `HoverMap` so pick mode can never pick the highlight box
/// hovering under the cursor.
pub(super) fn spawn_highlight_overlay(mut commands: Commands) {
    commands.spawn((
        DevtoolsHighlightOverlay,
        Node {
            position_type: PositionType::Absolute,
            display: Display::None,
            ..default()
        },
        // Translucent blue fill + hairline.
        BackgroundColor(Color::srgba(0.54, 0.71, 0.97, 0.30)),
        Outline {
            width: Val::Px(1.0),
            color: Color::srgba(0.54, 0.71, 0.97, 0.9),
            ..default()
        },
        GlobalZIndex(i32::MAX - 1),
        Pickable::IGNORE,
    ));
}

/// Move the highlight overlay over the current target each frame. Target
/// priority: pick-mode hover, then a hovered tree row, then the selection.
/// Rust-side on purpose: bounding boxes change every frame (layout, scroll,
/// animation), and this is one query with zero bridge traffic — a React-side
/// box would need per-frame geometry crossing the boundary.
pub(super) fn position_highlight(
    state: Res<DevtoolsState>,
    // `Option`: `JsBridge` is only inserted at `Startup` (see `OutboundResource`),
    // and headless tests run this plugin without a JS runtime at all.
    bridge: Option<Res<JsBridge>>,
    targets: Query<(&ComputedNode, &UiGlobalTransform)>,
    mut overlay: Query<&mut Node, With<DevtoolsHighlightOverlay>>,
) {
    let Ok(mut node) = overlay.single_mut() else {
        return;
    };
    let Some(bridge) = bridge else {
        return;
    };
    let target = state
        .pick_hover
        .or(state.tree_hover)
        // The persistent selection box is gated by the panel's overlay toggle;
        // the momentary hover highlights above are always on.
        .or(state.selected.filter(|_| state.show_selection_overlay))
        .filter(|_| state.open);
    let rect = target
        .and_then(|id| bridge.nodes.get(&id))
        .and_then(|&e| targets.get(e).ok())
        .map(|(computed, transform)| {
            highlight_rect(
                computed.size,
                transform.translation,
                computed.inverse_scale_factor,
            )
        });
    // Write only on change: a `Node` mutation forces a bevy_ui relayout, so an
    // idle overlay must not dirty itself every frame.
    match rect {
        Some((pos, size)) => {
            let (left, top) = (Val::Px(pos.x), Val::Px(pos.y));
            let (width, height) = (Val::Px(size.x), Val::Px(size.y));
            if node.display != Display::Flex
                || node.left != left
                || node.top != top
                || node.width != width
                || node.height != height
            {
                node.display = Display::Flex;
                node.left = left;
                node.top = top;
                node.width = width;
                node.height = height;
            }
        }
        None => {
            if node.display != Display::None {
                node.display = Display::None;
            }
        }
    }
}

/// A node's window-space logical rect from its computed (physical) geometry:
/// `UiGlobalTransform.translation` is the node's physical center, so top-left =
/// center - size/2, all scaled to logical px by the inverse scale factor.
fn highlight_rect(physical_size: Vec2, physical_center: Vec2, inverse_scale: f32) -> (Vec2, Vec2) {
    let top_left = (physical_center - physical_size * 0.5) * inverse_scale;
    (top_left, physical_size * inverse_scale)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bridge::{OutboundResource, RRoot};
    use crate::devtools::DevtoolsConfig;
    use crate::devtools::test_util::test_app;
    use crate::protocol::outbound::Outbound;
    use tokio::sync::mpsc::{UnboundedReceiver, unbounded_channel};

    /// An active pick session owns the pointer completely: it must claim the
    /// hover channel (`over_ui` — no world drags start) AND the wheel channel
    /// (`wheel_captured` — no world zoom), every frame it is active.
    #[test]
    fn pick_mode_claims_hover_and_wheel_channels() {
        let (mut app, _rx) = test_app(DevtoolsConfig::default());
        app.init_resource::<crate::PointerCapture>();
        {
            let mut state = app.world_mut().resource_mut::<DevtoolsState>();
            state.open = true;
            state.pick = true;
        }
        app.update();

        let capture = app.world().resource::<crate::PointerCapture>();
        assert!(capture.over_ui, "pick mode must claim the hover channel");
        assert!(
            capture.wheel_captured,
            "pick mode must claim the wheel channel too"
        );
    }

    /// Build a bare world with everything `drive_pick_mode` needs (pick mode
    /// active). Returns the world + the outbound receiver (for asserting
    /// `devtools.picked`). Tests spawn their entities, then set the hover map
    /// with [`set_mouse_hits`].
    fn pick_world(pressed: bool) -> (World, UnboundedReceiver<Outbound>) {
        let mut world = World::new();
        world.insert_resource(DevtoolsState {
            open: true,
            pick: true,
            ..Default::default()
        });
        let mut mouse = ButtonInput::<MouseButton>::default();
        if pressed {
            mouse.press(MouseButton::Left);
        }
        world.insert_resource(mouse);
        let (tx, rx) = unbounded_channel::<Outbound>();
        world.insert_resource(OutboundResource(tx));
        (world, rx)
    }

    /// Insert a `JsBridge` (channels kept alive, nothing reads them) mapping
    /// the given node ids to entities, and report `panel_root` to the state —
    /// the shape the JS panel produces via `devtools.panelRoot` on open.
    fn report_panel_root(world: &mut World, id: NodeId, panel_entity: Entity) {
        let (out_tx, out_rx) = unbounded_channel::<Outbound>();
        std::mem::forget(out_rx);
        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<crate::protocol::op::Op>>();
        std::mem::forget(ops_tx);
        let root = world.spawn_empty().id();
        let mut bridge = JsBridge::new(ops_rx, out_tx, root);
        bridge.nodes.insert(id, panel_entity);
        world.insert_resource(bridge);
        world.resource_mut::<DevtoolsState>().panel_root = Some(id);
    }

    /// Insert a Mouse `HoverMap` with the given `(entity, depth)` hits.
    fn set_mouse_hits(world: &mut World, hits: &[(Entity, f32)]) {
        use bevy::ecs::entity::EntityHashMap;
        use bevy::picking::backend::HitData;
        let mut hovered = EntityHashMap::default();
        for &(entity, depth) in hits {
            hovered.insert(entity, HitData::new(Entity::PLACEHOLDER, depth, None, None));
        }
        let mut hover_map = HoverMap::default();
        hover_map.insert(PointerId::Mouse, hovered);
        world.insert_resource(hover_map);
    }

    /// A mesh-picking hit (ray distance, numerically "closer") must not shadow
    /// UI hits: the frontmost hit that resolves to an `RNode` wins. Regression:
    /// a raw `min_by(depth)` over the mixed hover map let 3D scene meshes win
    /// everywhere, making pick mode look dead.
    #[test]
    fn pick_ignores_mesh_hits_and_takes_frontmost_ui_node() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, _rx) = pick_world(false);
        let mesh = world.spawn_empty().id(); // no RNode — a scene mesh
        let node = world.spawn(RNode(7)).id();
        let leaf = world.spawn(ChildOf(node)).id(); // e.g. its text run
        set_mouse_hits(&mut world, &[(mesh, 0.5), (leaf, 30.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        assert_eq!(
            world.resource::<DevtoolsState>().pick_hover,
            Some(7),
            "the frontmost RNode-resolving hit must win; mesh hits are ignored"
        );
    }

    /// The panel can't pick itself: a frontmost hit under the REPORTED panel
    /// root yields no hover (and no pick-through to app nodes beneath it).
    #[test]
    fn pick_rejects_panel_hits() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, _rx) = pick_world(false);
        let panel_root = world.spawn((RRoot, RNode(100))).id();
        let panel_button = world.spawn((RNode(101), ChildOf(panel_root))).id();
        let app_node = world.spawn(RNode(7)).id();
        report_panel_root(&mut world, 100, panel_root);
        set_mouse_hits(&mut world, &[(panel_button, 1.0), (app_node, 5.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        assert_eq!(
            world.resource::<DevtoolsState>().pick_hover,
            None,
            "a panel hit in front must block picking (no pick-through)"
        );
    }

    /// Nodes under an APP `<root>` overlay are ordinary pick targets — only
    /// the panel's own reported root is rejected. Regression: rejecting any
    /// `RRoot` ancestor made every app overlay unpickable.
    #[test]
    fn pick_allows_nodes_under_app_roots() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, _rx) = pick_world(false);
        let panel_root = world.spawn((RRoot, RNode(100))).id();
        let app_root = world.spawn((RRoot, RNode(50))).id();
        let overlay_node = world.spawn((RNode(7), ChildOf(app_root))).id();
        report_panel_root(&mut world, 100, panel_root);
        set_mouse_hits(&mut world, &[(overlay_node, 5.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        assert_eq!(
            world.resource::<DevtoolsState>().pick_hover,
            Some(7),
            "a node under an app <root> must be pickable"
        );
    }

    /// The panel behind an app node doesn't block it: rejection applies only
    /// when the frontmost RNode-resolving hit is the panel's.
    #[test]
    fn pick_prefers_frontmost_app_hit_over_panel_behind() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, _rx) = pick_world(false);
        let panel_root = world.spawn((RRoot, RNode(100))).id();
        let panel_button = world.spawn((RNode(101), ChildOf(panel_root))).id();
        let app_node = world.spawn(RNode(7)).id();
        report_panel_root(&mut world, 100, panel_root);
        set_mouse_hits(&mut world, &[(panel_button, 5.0), (app_node, 1.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        assert_eq!(
            world.resource::<DevtoolsState>().pick_hover,
            Some(7),
            "an app node in front of the panel must win"
        );
    }

    /// A left click on a hovered app node selects it, exits pick mode, and
    /// reports `devtools.picked` to JS.
    #[test]
    fn pick_click_selects_and_notifies_js() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, mut rx) = pick_world(true);
        let app_node = world.spawn(RNode(7)).id();
        set_mouse_hits(&mut world, &[(app_node, 5.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        let state = world.resource::<DevtoolsState>();
        assert_eq!(state.selected, Some(7));
        assert!(!state.pick, "a successful pick exits pick mode");
        match rx.try_recv().expect("a devtools.picked event") {
            Outbound::Event { name, value } => {
                assert_eq!(name, "devtools.picked");
                assert_eq!(value["id"], 7);
            }
            other => panic!("expected Outbound::Event, got {other:?}"),
        }
    }

    #[test]
    fn highlight_rect_converts_physical_center_to_logical_top_left() {
        // A 200×100 physical node centered at (300, 150) on a 2× display.
        let (pos, size) = highlight_rect(Vec2::new(200.0, 100.0), Vec2::new(300.0, 150.0), 0.5);
        assert_eq!(pos, Vec2::new(100.0, 50.0));
        assert_eq!(size, Vec2::new(100.0, 50.0));
    }
}
