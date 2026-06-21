//! The two Bevy systems that drive the boundary each frame:
//! - [`apply_js_ops`] drains reconciler op batches and mutates the UI tree.
//! - [`collect_ui_events`] reports interactions back to the JS thread.

use bevy::prelude::*;

use crate::bridge::{JsBridge, RNode};
use crate::protocol::{NodeId, Op, Props, UiEvent, ROOT_ID};
use crate::ui_map::{background, node_from_style};

/// Apply every queued reconciler op to the ECS. Runs in `Update`; ops simply
/// queue in the channel until this drains them, so startup ordering is a
/// non-issue.
pub fn apply_js_ops(
    mut commands: Commands,
    mut bridge: ResMut<JsBridge>,
    children: Query<&Children>,
) {
    // Drain all pending batches first so we don't hold an immutable borrow of
    // `bridge` while mutating `bridge.nodes` below.
    let mut ops: Vec<Op> = Vec::new();
    while let Ok(batch) = bridge.ops_rx.try_recv() {
        ops.extend(batch);
    }
    if ops.is_empty() {
        return;
    }
    debug!("applying {} reconciler op(s)", ops.len());

    for op in ops {
        match op {
            Op::Reset => {
                // Despawn the whole tree under the root (recursive), then reset
                // the id map to just the root. Stale ops referencing despawned
                // ids resolve to None afterwards and are skipped harmlessly.
                if let Some(&root) = bridge.nodes.get(&ROOT_ID) {
                    if let Ok(kids) = children.get(root) {
                        for child in kids.iter() {
                            commands.entity(child).despawn();
                        }
                    }
                }
                bridge.nodes.retain(|&id, _| id == ROOT_ID);
            }
            Op::Create { id, kind, props } => {
                let entity = spawn_element(&mut commands, id, &kind, &props);
                bridge.nodes.insert(id, entity);
            }
            Op::CreateText { id, text } => {
                let entity = commands
                    .spawn((
                        Text::new(text),
                        TextColor(Color::WHITE),
                        RNode(id),
                    ))
                    .id();
                bridge.nodes.insert(id, entity);
            }
            Op::Append { parent, child } => {
                if let (Some(p), Some(c)) = (resolve(&bridge, parent), resolve(&bridge, child)) {
                    commands.entity(p).add_child(c);
                }
            }
            Op::Insert {
                parent,
                child,
                before,
            } => {
                // PoC: ordered insertion isn't needed by the sample app, so we
                // append. Reordering support would query the parent's Children
                // and use `insert_children(index, &[child])`.
                let _ = before;
                if let (Some(p), Some(c)) = (resolve(&bridge, parent), resolve(&bridge, child)) {
                    commands.entity(p).add_child(c);
                }
            }
            Op::Remove { parent: _, child } => {
                if let Some(c) = resolve(&bridge, child) {
                    commands.entity(c).despawn();
                    bridge.nodes.remove(&child);
                }
            }
            Op::Update { id, props } => {
                if let Some(e) = resolve(&bridge, id) {
                    let mut ec = commands.entity(e);
                    ec.insert(node_from_style(&props.style));
                    if let Some(bg) = background(&props) {
                        ec.insert(bg);
                    }
                }
            }
            Op::UpdateText { id, text } => {
                if let Some(e) = resolve(&bridge, id) {
                    commands.entity(e).insert(Text::new(text));
                }
            }
        }
    }
}

/// Spawn a `node` or `button` host element with its layout and background.
fn spawn_element(commands: &mut Commands, id: NodeId, kind: &str, props: &Props) -> Entity {
    let node = node_from_style(&props.style);
    let mut ec = commands.spawn((node, RNode(id)));
    if kind == "button" {
        // `Button` requires `Interaction`, which is added automatically.
        ec.insert(Button);
    }
    if let Some(bg) = background(props) {
        ec.insert(bg);
    }
    ec.id()
}

fn resolve(bridge: &JsBridge, id: NodeId) -> Option<Entity> {
    bridge.nodes.get(&id).copied()
}

/// Report `Pressed` transitions on any reconciler-owned node to the JS thread.
pub fn collect_ui_events(
    bridge: Res<JsBridge>,
    query: Query<(&Interaction, &RNode), Changed<Interaction>>,
) {
    for (interaction, rnode) in &query {
        if *interaction == Interaction::Pressed {
            debug!("click -> reconciler node {}", rnode.0);
            let _ = bridge.events_tx.send(UiEvent {
                id: rnode.0,
                kind: "click".to_string(),
            });
        }
    }
}
