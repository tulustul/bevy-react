//! The two Bevy systems that drive the boundary each frame:
//! - [`apply_js_ops`] drains reconciler op batches and mutates the UI tree.
//! - [`collect_ui_events`] reports interactions back to the JS thread.

use bevy::prelude::*;

use crate::bridge::{JsBridge, RNode, StyleVariants};
use crate::protocol::{NodeId, Op, Outbound, Props, ROOT_ID, UiEvent};
use crate::ui_map::{
    apply_style, apply_text_style, image_node, overlay_style, resolved_text_style, text_layout,
};

/// Apply every queued reconciler op to the ECS. Runs in `Update`; ops simply
/// queue in the channel until this drains them, so startup ordering is a
/// non-issue.
pub fn apply_js_ops(
    mut commands: Commands,
    mut bridge: ResMut<JsBridge>,
    assets: Res<AssetServer>,
    children: Query<&Children>,
    rnodes: Query<&RNode>,
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
                bridge.text_styles.clear();
                bridge.raw_spans.clear();
            }
            Op::Create { id, kind, props } => {
                let entity = match kind.as_str() {
                    // A `<text>` root: a UI node carrying the text block + style.
                    "text" => {
                        let mut ec = commands.spawn(RNode(id));
                        apply_style(&mut ec, &props.style);
                        ec.insert(Text::new(String::new()));
                        apply_text_style(&mut ec, &props.style);
                        if let Some(layout) = text_layout(&props.style) {
                            ec.insert(layout);
                        }
                        ec.id()
                    }
                    // A nested `<text>`: a styled span (no layout box of its own).
                    "textSpan" => {
                        let mut ec = commands.spawn((RNode(id), TextSpan(String::new())));
                        apply_text_style(&mut ec, &props.style);
                        ec.id()
                    }
                    _ => spawn_element(&mut commands, id, &kind, &props, &assets),
                };
                if matches!(kind.as_str(), "text" | "textSpan") {
                    bridge
                        .text_styles
                        .insert(id, resolved_text_style(&props.style));
                }
                bridge.nodes.insert(id, entity);
            }
            Op::CreateText { id, text } => {
                let entity = commands
                    .spawn((Text::new(text), TextColor(Color::WHITE), RNode(id)))
                    .id();
                bridge.nodes.insert(id, entity);
            }
            Op::CreateTextSpan { id, text } => {
                // A bare-string run inside a `<text>`. Style is inherited from its
                // parent on append (see below); until then it keeps span defaults.
                let entity = commands.spawn((TextSpan(text), RNode(id))).id();
                bridge.nodes.insert(id, entity);
                bridge.raw_spans.insert(id);
            }
            Op::Append { parent, child } => {
                if let (Some(p), Some(c)) = (resolve(&bridge, parent), resolve(&bridge, child)) {
                    commands.entity(p).add_child(c);
                    inherit_text_style(&mut commands, &bridge, parent, child, c);
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
                    inherit_text_style(&mut commands, &bridge, parent, child, c);
                }
            }
            Op::Remove { parent: _, child } => {
                if let Some(c) = resolve(&bridge, child) {
                    commands.entity(c).despawn();
                    bridge.nodes.remove(&child);
                    bridge.text_styles.remove(&child);
                    bridge.raw_spans.remove(&child);
                }
            }
            Op::Update { id, props } => {
                let Some(e) = resolve(&bridge, id) else {
                    continue;
                };
                if bridge.text_styles.contains_key(&id) {
                    // A `<text>` element: refresh its style and re-propagate to
                    // any bare-string children that inherit it.
                    let style = resolved_text_style(&props.style);
                    bridge.text_styles.insert(id, style.clone());
                    let mut ec = commands.entity(e);
                    ec.insert(style.clone());
                    if let Some(layout) = text_layout(&props.style) {
                        ec.insert(layout);
                    }
                    if let Ok(kids) = children.get(e) {
                        for child in kids.iter() {
                            if let Ok(rnode) = rnodes.get(child) {
                                if bridge.raw_spans.contains(&rnode.0) {
                                    commands.entity(child).insert(style.clone());
                                }
                            }
                        }
                    }
                } else {
                    let mut ec = commands.entity(e);
                    apply_style(&mut ec, &props.style);
                    // Image attributes only ever appear on `image` elements, so
                    // their presence is enough to re-apply the texture/tint.
                    if is_image(&props) {
                        ec.insert(image_node(&props, &assets));
                    }
                    apply_style_variants(&mut ec, &props);
                }
            }
            Op::UpdateText { id, text } => {
                if let Some(e) = resolve(&bridge, id) {
                    // A run is either a standalone `Text` or, inside a `<text>`, a
                    // `TextSpan` — update whichever this entity is.
                    if bridge.raw_spans.contains(&id) {
                        commands.entity(e).insert(TextSpan(text));
                    } else {
                        commands.entity(e).insert(Text::new(text));
                    }
                }
            }
        }
    }
}

/// When a bare-string run is appended into a `<text>`, copy the parent's text
/// style onto it (Bevy has no text-style inheritance, and the parent's freshly
/// queued components aren't yet visible to an ECS query this frame).
fn inherit_text_style(
    commands: &mut Commands,
    bridge: &JsBridge,
    parent: NodeId,
    child: NodeId,
    child_entity: Entity,
) {
    if !bridge.raw_spans.contains(&child) {
        return;
    }
    if let Some(style) = bridge.text_styles.get(&parent).cloned() {
        commands.entity(child_entity).insert(style);
    }
}

/// Spawn a `node`, `button`, or `image` host element with its style.
fn spawn_element(
    commands: &mut Commands,
    id: NodeId,
    kind: &str,
    props: &Props,
    assets: &AssetServer,
) -> Entity {
    let mut ec = commands.spawn(RNode(id));
    apply_style(&mut ec, &props.style);
    match kind {
        // `Button` requires `Interaction`, which is added automatically.
        "button" => {
            ec.insert(Button);
        }
        "image" => {
            ec.insert(image_node(props, assets));
        }
        _ => {}
    }
    apply_style_variants(&mut ec, props);
    ec.id()
}

/// Stamp (or clear) the hover/press [`StyleVariants`] on a host element. When
/// either variant is present the element also gets an `Interaction` so the focus
/// system tracks hover/press for it; `insert_if_new` leaves any existing
/// `Interaction` untouched (a `button`'s, or a node already mid-hover) so we
/// never reset its state on a re-render.
fn apply_style_variants(ec: &mut EntityCommands, props: &Props) {
    if props.hover_style.is_some() || props.press_style.is_some() {
        ec.insert(StyleVariants {
            base: props.style.clone(),
            hover: props.hover_style.clone(),
            press: props.press_style.clone(),
        });
        ec.insert_if_new(Interaction::default());
    } else {
        ec.remove::<StyleVariants>();
    }
}

/// Whether these props carry any `image` element attribute.
fn is_image(props: &Props) -> bool {
    props.src.is_some()
        || props.tint.is_some()
        || props.image_mode.is_some()
        || props.flip_x
        || props.flip_y
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
            let _ = bridge.outbound_tx.send(Outbound::UiEvent {
                event: UiEvent {
                    id: rnode.0,
                    kind: "click".to_string(),
                },
            });
        }
    }
}

/// Re-apply the merged style for any element with [`StyleVariants`] whose
/// `Interaction` changed (hover/press in or out) — or whose variants changed from
/// a React re-render while still hovered. `None` → base, `Hovered` → base+hover,
/// `Pressed` → base+hover+press. Runs entirely on the Bevy side: no round-trip to
/// JS, no React re-render on mouse move.
pub fn apply_interaction_styles(
    mut commands: Commands,
    query: Query<
        (Entity, &Interaction, &StyleVariants),
        Or<(Changed<Interaction>, Changed<StyleVariants>)>,
    >,
) {
    for (entity, interaction, variants) in &query {
        let style = match *interaction {
            Interaction::Pressed => overlay_style(
                &overlay_style(&variants.base, &variants.hover),
                &variants.press,
            ),
            Interaction::Hovered => overlay_style(&variants.base, &variants.hover),
            Interaction::None => variants.base.clone(),
        };
        apply_style(&mut commands.entity(entity), &style);
    }
}
