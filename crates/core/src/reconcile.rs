//! The two Bevy systems that drive the boundary each frame:
//! - [`apply_js_ops`] drains reconciler op batches and mutates the UI tree.
//! - [`collect_ui_events`] reports interactions back to the JS thread.

use bevy::image::Image;
use bevy::input_focus::tab_navigation::TabIndex;
use bevy::prelude::*;
use bevy::text::{EditableText, TextCursorStyle, TextEdit, TextEditChange};
use bevy::ui::RelativeCursorPosition;
use bevy::ui::widget::NodeImageMode;
use bevy_react_animations::AnimatedNode;
use bevy_react_canvas::{CanvasSurface, blank_canvas_image};

use crate::anchor::Anchored;
use crate::bridge::{JsBridge, PointerHandlers, RNode, StyleVariants};
use crate::plugin::Fonts;
use crate::protocol::{NodeId, Op, Outbound, Props, ROOT_ID, UiEvent};
use crate::ui_map::{
    apply_style, apply_text_style, image_node, overlay_style, resolved_text_style, text_layout,
};

/// Apply every queued reconciler op to the ECS. Runs in `Update`; ops simply
/// queue in the channel until this drains them, so startup ordering is a
/// non-issue.
#[allow(clippy::too_many_arguments)]
pub fn apply_js_ops(
    mut commands: Commands,
    mut bridge: ResMut<JsBridge>,
    assets: Res<AssetServer>,
    fonts: Res<Fonts>,
    mut images: ResMut<Assets<Image>>,
    children: Query<&Children>,
    rnodes: Query<&RNode>,
    mut editables: Query<&mut EditableText>,
    // A `<text>` *root* carries a layout `Node`; a span (nested `<text>` or a
    // bare string) does not. Used on update to re-apply layout/visual/transform
    // style to roots only — spans must never get a `Node`.
    text_roots: Query<(), With<Node>>,
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
                bridge.editable_inputs.clear();
                bridge.editable_values.clear();
            }
            Op::Create { id, kind, props } => {
                let entity = match kind.as_str() {
                    // A `<text>` root: a UI node carrying the text block + style.
                    "text" => {
                        let mut ec = commands.spawn(RNode(id));
                        apply_style(&mut ec, &props.style);
                        ec.insert(Text::new(String::new()));
                        apply_text_style(&mut ec, &props.style, &fonts);
                        if let Some(layout) = text_layout(&props.style) {
                            ec.insert(layout);
                        }
                        apply_anchor(&mut ec, &props);
                        ec.id()
                    }
                    // A nested `<text>`: a styled span (no layout box of its own).
                    "textSpan" => {
                        let mut ec = commands.spawn((RNode(id), TextSpan(String::new())));
                        apply_text_style(&mut ec, &props.style, &fonts);
                        ec.id()
                    }
                    // A `<canvas>`: a styled node carrying an `ImageNode` whose
                    // texture the canvas system paints from the display list. The
                    // image stretches to fill the node's laid-out box.
                    "canvas" => {
                        let handle = images.add(blank_canvas_image());
                        let mut node_img = ImageNode::new(handle);
                        node_img.image_mode = NodeImageMode::Stretch;
                        let mut ec = commands.spawn(RNode(id));
                        apply_style(&mut ec, &props.style);
                        ec.insert((
                            node_img,
                            CanvasSurface::new(props.draw.clone().unwrap_or_default()),
                        ));
                        apply_style_variants(&mut ec, &props);
                        apply_pointer_handlers(&mut ec, &props);
                        apply_animated(&mut ec, &props);
                        apply_anchor(&mut ec, &props);
                        ec.id()
                    }
                    // An `<editableText>`: a focusable native text input. Bevy's
                    // `EditableTextInputPlugin` (registered by `DefaultPlugins`)
                    // drives keyboard/focus/cursor/selection/clipboard; we just
                    // spawn the widget and observe `TextEditChange` for `onChange`.
                    "editableText" => {
                        let mut ec = commands.spawn(RNode(id));
                        apply_style(&mut ec, &props.style);
                        let mut editable =
                            EditableText::new(props.value.as_deref().unwrap_or_default());
                        editable.max_characters = props.max_length;
                        editable.allow_newlines = props.multiline;
                        let (text_color, font) = resolved_text_style(&props.style, &fonts);
                        ec.insert((
                            editable,
                            text_color,
                            font,
                            TextLayout {
                                linebreak: if props.multiline {
                                    LineBreak::WordBoundary
                                } else {
                                    LineBreak::NoWrap
                                },
                                ..default()
                            },
                            // Caret follows the text color so it stays visible on
                            // any themed background (the default is a dark slate).
                            TextCursorStyle {
                                color: text_color.0,
                                ..default()
                            },
                            // Focusable via click (the widget's picking observers)
                            // and Tab navigation.
                            TabIndex(0),
                        ));
                        apply_anchor(&mut ec, &props);
                        ec.id()
                    }
                    _ => spawn_element(&mut commands, id, &kind, &props, &assets),
                };
                if matches!(kind.as_str(), "text" | "textSpan") {
                    bridge
                        .text_styles
                        .insert(id, resolved_text_style(&props.style, &fonts));
                }
                if kind == "editableText" {
                    bridge.editable_inputs.insert(id);
                    bridge
                        .editable_values
                        .insert(id, props.value.clone().unwrap_or_default());
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
                    bridge.editable_inputs.remove(&child);
                    bridge.editable_values.remove(&child);
                }
            }
            Op::Update { id, props } => {
                let Some(e) = resolve(&bridge, id) else {
                    continue;
                };
                if bridge.text_styles.contains_key(&id) {
                    // A `<text>` element: refresh its style and re-propagate to
                    // any bare-string children that inherit it.
                    let style = resolved_text_style(&props.style, &fonts);
                    bridge.text_styles.insert(id, style.clone());
                    let mut ec = commands.entity(e);
                    // A text *root* (has a `Node`) also gets the layout/visual/
                    // transform style + transition, mirroring its create path —
                    // otherwise a `transform`/`transition` on a `<text>` would only
                    // apply on mount and never animate. Spans have no `Node` and are
                    // skipped so they never gain a layout box.
                    if text_roots.contains(e) {
                        apply_style(&mut ec, &props.style);
                    }
                    ec.insert(style.clone());
                    if let Some(layout) = text_layout(&props.style) {
                        ec.insert(layout);
                    }
                    apply_anchor(&mut ec, &props);
                    if let Ok(kids) = children.get(e) {
                        for child in kids.iter() {
                            if let Ok(rnode) = rnodes.get(child) {
                                if bridge.raw_spans.contains(&rnode.0) {
                                    commands.entity(child).insert(style.clone());
                                }
                            }
                        }
                    }
                } else if bridge.editable_inputs.contains(&id) {
                    // Controlled `editableText`: push `value` into the live buffer
                    // only when it diverges from what the widget already holds, so
                    // a re-render echoing the user's own keystrokes is a no-op and
                    // never resets the cursor. Re-applying baseline keeps the
                    // `onChange` dedup from echoing this programmatic set back.
                    if let Some(new_val) = &props.value {
                        if let Ok(mut editable) = editables.get_mut(e) {
                            if editable.value().to_string() != *new_val {
                                editable.editor_mut().set_text(new_val);
                                editable.queue_edit(TextEdit::TextEnd(false));
                            }
                        }
                        bridge.editable_values.insert(id, new_val.clone());
                    }
                    apply_style(&mut commands.entity(e), &props.style);
                } else {
                    let mut ec = commands.entity(e);
                    apply_style(&mut ec, &props.style);
                    // Image attributes only ever appear on `image` elements, so
                    // their presence is enough to re-apply the texture/tint.
                    if is_image(&props) {
                        ec.insert(image_node(&props, &assets));
                    }
                    // A `<canvas>`'s new display list: replace the surface (the
                    // canvas system keeps the same `ImageNode` handle and repaints).
                    if let Some(cmds) = &props.draw {
                        ec.insert(CanvasSurface::new(cmds.clone()));
                    }
                    apply_style_variants(&mut ec, &props);
                    apply_pointer_handlers(&mut ec, &props);
                    apply_animated(&mut ec, &props);
                    apply_anchor(&mut ec, &props);
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
    apply_pointer_handlers(&mut ec, props);
    apply_animated(&mut ec, props);
    apply_anchor(&mut ec, props);
    ec.id()
}

/// Stamp (or clear) the [`AnimatedNode`] bindings on a host element. Present →
/// the animations plugin drives the listed props each frame (no-op if animations
/// are disabled — nothing reads the component).
fn apply_animated(ec: &mut EntityCommands, props: &Props) {
    match &props.animated {
        Some(bindings) => {
            ec.insert(AnimatedNode(bindings.clone()));
        }
        None => {
            ec.remove::<AnimatedNode>();
        }
    }
}

/// Stamp (or clear) the [`Anchored`] binding on a host element. Present → the
/// positioning system projects the target entity's world position to the screen
/// each frame and writes this node's `left`/`top`. A malformed/dead entity id is
/// ignored (the binding is simply not applied).
fn apply_anchor(ec: &mut EntityCommands, props: &Props) {
    match &props.anchor {
        Some(anchor) => match Entity::try_from_bits(anchor.entity as u64) {
            Some(target) => {
                let offset = anchor.offset.map(Vec3::from).unwrap_or(Vec3::ZERO);
                ec.insert(Anchored {
                    target,
                    offset,
                    scale: anchor.scale,
                });
            }
            None => {
                ec.remove::<Anchored>();
            }
        },
        None => {
            ec.remove::<Anchored>();
        }
    }
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

/// Stamp (or clear) the [`PointerHandlers`] marker plus the components the
/// drag-capture system needs. When any `onPointer*` handler is declared the
/// element also gets an `Interaction` (so the focus system tracks the press that
/// starts a drag) and a [`RelativeCursorPosition`] (so we can read the cursor's
/// normalized position within it). `insert_if_new` leaves an existing
/// `Interaction` (a `button`'s, or a hover/press variant's) untouched.
fn apply_pointer_handlers(ec: &mut EntityCommands, props: &Props) {
    if props.on_pointer_down || props.on_pointer_move || props.on_pointer_up {
        ec.insert(PointerHandlers {
            down: props.on_pointer_down,
            moved: props.on_pointer_move,
            up: props.on_pointer_up,
        });
        ec.insert_if_new(Interaction::default());
        ec.insert_if_new(RelativeCursorPosition::default());
    } else {
        ec.remove::<PointerHandlers>();
        ec.remove::<RelativeCursorPosition>();
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
                    x: None,
                    y: None,
                    client_x: None,
                    client_y: None,
                    value: None,
                },
            });
        }
    }
}

/// Report `editableText` value edits back to JS as `"change"` UI events. Bevy
/// triggers [`TextEditChange`] after applying edits — but also on cursor moves and
/// selection changes, so we dedup against the last value emitted for the node and
/// only fire when the text actually changed. The matching React `onChange` is
/// looked up by node id + `"change"` kind in the JS event-loop router.
pub fn on_text_edit_change(
    change: On<TextEditChange>,
    mut bridge: ResMut<JsBridge>,
    editables: Query<(&EditableText, &RNode)>,
) {
    let Ok((editable, rnode)) = editables.get(change.event_target()) else {
        return;
    };
    let value = editable.value().to_string();
    if bridge.editable_values.get(&rnode.0) == Some(&value) {
        return; // cursor/selection move, or an echo of a programmatic set
    }
    bridge.editable_values.insert(rnode.0, value.clone());
    debug!("change -> reconciler node {}", rnode.0);
    let _ = bridge.outbound_tx.send(Outbound::UiEvent {
        event: UiEvent {
            id: rnode.0,
            kind: "change".to_string(),
            x: None,
            y: None,
            client_x: None,
            client_y: None,
            value: Some(value),
        },
    });
}

/// The node currently being dragged (an `onPointer*` element pressed with the
/// left mouse button), plus the last cursor positions we read for it — used as a
/// fallback when the cursor leaves the window mid-drag. `last_pos` is the
/// node-relative `0..1` position; `last_abs` is the absolute window position.
#[derive(Default)]
pub struct ActiveDrag {
    entity: Option<Entity>,
    last_pos: Vec2,
    last_abs: Vec2,
}

/// Drive native pointer/drag events for elements that declared `onPointer*`
/// handlers. Unlike the discrete click path, this follows the cursor across
/// frames so a dragged control (e.g. a slider) keeps updating even when the
/// pointer leaves its bounds — `RelativeCursorPosition` keeps reporting while the
/// cursor is anywhere in the window, and we clamp to `0..1`.
///
/// `RelativeCursorPosition::normalized` is centered (`-0.5` = left/top edge,
/// `0.5` = right/bottom); we shift it to a `0..1` top-left origin to match the
/// CSS-like coordinates the JS handlers expect.
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
    )>,
    interactions: Query<&Interaction>,
    mut capture: ResMut<crate::PointerCapture>,
    mut drag: Local<ActiveDrag>,
) {
    let emit = |rnode: &RNode, kind: &str, pos: Vec2, abs: Vec2| {
        let _ = bridge.outbound_tx.send(Outbound::UiEvent {
            event: UiEvent {
                id: rnode.0,
                kind: kind.to_string(),
                x: Some(pos.x),
                y: Some(pos.y),
                client_x: Some(abs.x),
                client_y: Some(abs.y),
                value: None,
            },
        });
    };

    // Absolute cursor position in window logical pixels; `None` when the cursor
    // is outside the window (mid-drag), where we fall back to the last reading.
    let cursor_abs = windows.iter().next().and_then(|w| w.cursor_position());

    // Begin a drag on the frame the button goes down, over a pressed handler node.
    if buttons.just_pressed(MouseButton::Left) {
        for (entity, rnode, interaction, rel, handlers) in &nodes {
            if *interaction == Interaction::Pressed {
                let pos = normalized_01(rel).unwrap_or(drag.last_pos);
                let abs = cursor_abs.unwrap_or(drag.last_abs);
                drag.entity = Some(entity);
                drag.last_pos = pos;
                drag.last_abs = abs;
                if handlers.down {
                    emit(rnode, "pointerDown", pos, abs);
                }
                break;
            }
        }
    }

    // While held, follow the cursor and emit move events (a drag).
    if buttons.pressed(MouseButton::Left) {
        if let Some(entity) = drag.entity {
            if let Ok((_, rnode, _, rel, handlers)) = nodes.get(entity) {
                let pos = normalized_01(rel).unwrap_or(drag.last_pos);
                let abs = cursor_abs.unwrap_or(drag.last_abs);
                drag.last_pos = pos;
                drag.last_abs = abs;
                if handlers.moved {
                    emit(rnode, "pointerMove", pos, abs);
                }
            }
        }
    }

    // End the drag on release.
    if buttons.just_released(MouseButton::Left) {
        if let Some(entity) = drag.entity.take() {
            if let Ok((_, rnode, _, rel, handlers)) = nodes.get(entity) {
                let pos = normalized_01(rel).unwrap_or(drag.last_pos);
                let abs = cursor_abs.unwrap_or(drag.last_abs);
                if handlers.up {
                    emit(rnode, "pointerUp", pos, abs);
                }
            }
        }
    }

    // Publish whether the UI owns the pointer so world systems (e.g. a camera
    // controller) can ignore the mouse. `dragging` spans the whole gesture even
    // once the cursor leaves the element; `over_ui` covers hover/press on any
    // interactive node (so e.g. wheel-zoom over UI can be trapped too).
    capture.dragging = drag.entity.is_some();
    capture.over_ui = interactions.iter().any(|i| *i != Interaction::None);
}

/// Shift `RelativeCursorPosition`'s centered, unclamped position to a clamped
/// `0..1` top-left-origin coordinate. `None` when the cursor position is unknown.
fn normalized_01(rel: &RelativeCursorPosition) -> Option<Vec2> {
    rel.normalized
        .map(|n| Vec2::new((n.x + 0.5).clamp(0.0, 1.0), (n.y + 0.5).clamp(0.0, 1.0)))
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bridge::JsBridge;
    use crate::transition::TransitionInput;
    use std::f32::consts::PI;

    fn text_props(rotate: f32) -> Props {
        serde_json::from_value(serde_json::json!({
            "style": {
                "transform": { "rotate": rotate },
                "transition": { "transform": { "duration": 0.3 } },
            }
        }))
        .expect("valid text props")
    }

    /// A `<text>` root's `transform`/`transition` must update on re-render — not
    /// just at mount. Regression: the text-update branch skipped `apply_style`, so
    /// a rotating chevron's target never changed and the animation never ran.
    #[test]
    fn text_update_reapplies_transform_target() {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_resource::<Fonts>();

        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        // Keep the outbound receiver alive so the sender stays open.
        let (out_tx, _out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_systems(Update, apply_js_ops);

        // Mount a `<text>` with rotate 0.
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "text".into(),
                props: text_props(0.0),
            }])
            .unwrap();
        app.update();
        let e = app.world().resource::<JsBridge>().nodes[&1];
        assert_eq!(
            app.world()
                .entity(e)
                .get::<TransitionInput>()
                .unwrap()
                .rotate,
            Some(0.0),
            "create stamps the initial transform target"
        );

        // Re-render with rotate π — the transition target must follow.
        ops_tx
            .send(vec![Op::Update {
                id: 1,
                props: text_props(PI),
            }])
            .unwrap();
        app.update();
        assert_eq!(
            app.world()
                .entity(e)
                .get::<TransitionInput>()
                .unwrap()
                .rotate,
            Some(PI),
            "a text re-render must refresh the transform target so it animates"
        );
    }
}
