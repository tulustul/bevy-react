//! The two Bevy systems that drive the boundary each frame:
//! - [`apply_js_ops`] drains reconciler op batches and mutates the UI tree.
//! - [`collect_ui_events`] reports interactions back to the JS thread.

use bevy::image::Image;
use bevy::input_focus::tab_navigation::TabIndex;
use bevy::picking::events::{Click, Drag, Out, Over, Pointer, Press, Release};
use bevy::prelude::*;
use bevy::text::{EditableText, TextCursorStyle, TextEdit, TextEditChange};
use bevy::ui::RelativeCursorPosition;
use bevy::ui::widget::NodeImageMode;
use bevy::ui::{ComputedNode, UiGlobalTransform};
use bevy_react_animations::AnimatedNode;
use bevy_react_canvas::{CanvasSurface, blank_canvas_image};
use bevy_react_portal::{RPortal, blank_portal_image};
use bevy_react_surface::{RSurface, SurfaceVirtualPointer};

use crate::anchor::Anchored;
use crate::bridge::{JsBridge, PointerHandlers, RNode, StyleVariants};
use crate::plugin::Fonts;
use crate::protocol::{NodeId, Op, Outbound, Props, ROOT_ID, Style, UiEvent};
use crate::ui_map::{
    apply_style, apply_text_style, image_node, overlay_style, resolved_text_style, text_layout,
};

/// Live instrumentation of the [`apply_js_ops`] hot path. Updated once per frame
/// that applies at least one reconciler op (empty frames leave it untouched), so
/// a benchmark driver — or any consumer — can poll `applied_count` to detect
/// "my flushed batch has landed" and read the timing of the most recent batch.
///
/// Note `last_translate` measures only the op→command *queuing* in
/// [`apply_js_ops`]; the queued `Commands` (entity spawn / component insert /
/// hierarchy) execute later at a sync point, and `bevy_ui` layout later still —
/// neither is included here. `last_apply_end` is exposed so a downstream timer
/// can bracket those phases (e.g. up to `UiSystems::Layout`).
///
/// Timings are wall-clock, measured on native only; on web they stay zero/`None`
/// (`std::time::Instant` is unavailable on wasm).
#[derive(Resource, Default, Debug, Clone, Copy)]
pub struct OpApplyStats {
    /// Count of non-empty op batches applied since startup (one increment per
    /// frame that applied at least one op).
    pub applied_count: u64,
    /// Number of ops in the most recently applied batch.
    pub last_ops: usize,
    /// Time spent translating the most recent batch into ECS commands — the
    /// [`apply_js_ops`] body only. Excludes command execution and layout.
    pub last_translate: std::time::Duration,
    /// The instant [`apply_js_ops`] finished queuing the most recent batch
    /// (native only). A later system can subtract this from a post-layout instant
    /// to time command execution + layout.
    pub last_apply_end: Option<std::time::Instant>,
}

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
    // The persistent world-anchor overlay layer (a child of the root). It is
    // infrastructure, not a reconciler node, so `Op::Reset` must preserve it.
    anchor_layer: Query<(), With<crate::anchor::AnchorLayer>>,
    mut editables: Query<&mut EditableText>,
    // A `<text>` *root* carries a layout `Node`; a span (nested `<text>` or a
    // bare string) does not. Used on update to re-apply layout/visual/transform
    // style to roots only — spans must never get a `Node`.
    text_roots: Query<(), With<Node>>,
    mut stats: ResMut<OpApplyStats>,
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
    let op_count = ops.len();
    #[cfg(not(target_arch = "wasm32"))]
    let started = std::time::Instant::now();
    debug!("applying {op_count} reconciler op(s)");

    for op in ops {
        match op {
            Op::Reset => {
                // Despawn the whole tree under the root (recursive), then reset
                // the id map to just the root. Stale ops referencing despawned
                // ids resolve to None afterwards and are skipped harmlessly.
                if let Some(&root) = bridge.nodes.get(&ROOT_ID)
                    && let Ok(kids) = children.get(root)
                {
                    for child in kids.iter() {
                        // The anchor layer is persistent infrastructure: keep it,
                        // but despawn the reconciler overlays reparented under it
                        // so a reload doesn't leave stale duplicate overlays.
                        if anchor_layer.contains(child) {
                            if let Ok(overlays) = children.get(child) {
                                for overlay in overlays.iter() {
                                    commands.entity(overlay).despawn();
                                }
                            }
                        } else {
                            commands.entity(child).despawn();
                        }
                    }
                }
                // Detached `<surface>` roots aren't under `root`, so the child-despawn
                // above misses them. On a cold reload the old React tree is discarded
                // without unmount lifecycle (no `detachDeletedInstance`), so despawn
                // them here too — otherwise stale surface subtrees keep rendering into
                // their texture.
                for id in bridge.surfaces.iter() {
                    if let Some(&e) = bridge.nodes.get(id) {
                        commands.entity(e).despawn();
                    }
                }
                bridge.nodes.retain(|&id, _| id == ROOT_ID);
                bridge.text_styles.clear();
                bridge.raw_spans.clear();
                bridge.text_spans.clear();
                bridge.editable_inputs.clear();
                bridge.surfaces.clear();
                bridge.editable_values.clear();
                // The root persists but its children were just despawned; the shadow
                // tree is fully rebuilt by the ops that follow.
                bridge.child_order.clear();
                bridge.parent_of.clear();
                bridge.surface_parent.clear();
                bridge.child_surfaces.clear();
            }
            Op::Create {
                id,
                kind,
                props,
                text,
            } => {
                let entity = match kind.as_str() {
                    // A `<text>` root: a UI node carrying the text block + style.
                    // A single-string child rides inline as `text` (no child span).
                    "text" => {
                        let mut ec = commands.spawn(RNode(id));
                        apply_style(&mut ec, &props.style);
                        ec.insert(Text::new(text.clone().unwrap_or_default()));
                        apply_text_style(&mut ec, &props.style, &fonts);
                        if let Some(layout) = text_layout(&props.style) {
                            ec.insert(layout);
                        }
                        apply_anchor(&mut ec, &props);
                        ec.id()
                    }
                    // A nested `<text>`: a styled span (no layout box of its own).
                    // A single-string child rides inline as `text`.
                    "textSpan" => {
                        let mut ec =
                            commands.spawn((RNode(id), TextSpan(text.clone().unwrap_or_default())));
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
                    // A `<portal>`: a styled node carrying an `ImageNode` whose
                    // texture is an offscreen render target the `bevy-react-portal`
                    // registry owns. Starts on a blank placeholder; `bind_portals`
                    // swaps in the real target texture for `target` once it exists.
                    "portal" => {
                        let handle = images.add(blank_portal_image());
                        let mut node_img = ImageNode::new(handle);
                        node_img.image_mode = NodeImageMode::Stretch;
                        let mut ec = commands.spawn(RNode(id));
                        apply_style(&mut ec, &props.style);
                        ec.insert((node_img, RPortal(props.target.clone().unwrap_or_default())));
                        apply_style_variants(&mut ec, &props);
                        apply_pointer_handlers(&mut ec, &props);
                        apply_animated(&mut ec, &props);
                        apply_anchor(&mut ec, &props);
                        ec.id()
                    }
                    // A `<surface>`: a styled container whose subtree renders into
                    // an offscreen image instead of the on-screen UI. It is a
                    // **detached UI root** — `bevy_react_surface::bind_surfaces`
                    // points its `UiTargetCamera` at the surface's offscreen UI
                    // camera, and the child-attach ops below keep it out of the
                    // on-screen Bevy hierarchy. The root fills the texture by
                    // default (user `style` overrides). Pointer/click events on it
                    // arrive via the surface picking path (`collect_surface_events`),
                    // not the legacy `Interaction` focus path.
                    "surface" => {
                        let style = overlay_style(&surface_root_base(), &props.style);
                        let mut ec = commands.spawn(RNode(id));
                        apply_style(&mut ec, &style);
                        ec.insert(RSurface(props.target.clone().unwrap_or_default()));
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
                        let (text_color, font, line_height, letter_spacing) =
                            resolved_text_style(&props.style, &fonts);
                        ec.insert((
                            editable,
                            text_color,
                            font,
                            line_height,
                            letter_spacing,
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
                // A `textSpan` carries its text in a `TextSpan` component, so a later
                // `Op::UpdateText` must update that (not insert a stray `Text`). It is
                // NOT a `raw_span`: nested `<text>` spans keep their own style.
                if kind == "textSpan" {
                    bridge.text_spans.insert(id);
                }
                if kind == "editableText" {
                    bridge.editable_inputs.insert(id);
                    bridge
                        .editable_values
                        .insert(id, props.value.clone().unwrap_or_default());
                }
                if kind == "surface" {
                    bridge.surfaces.insert(id);
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
                bridge.text_spans.insert(id);
            }
            Op::Append { parent, child } => {
                // A `<surface>` is a detached UI root: never parent it into the
                // on-screen hierarchy (it renders to its own offscreen camera). Its
                // own children attach to it normally via their own Append ops. Record
                // its React parent so removing an ancestor can despawn this detached
                // root (Bevy's recursive despawn never reaches it).
                if bridge.surfaces.contains(&child) {
                    bridge.attach_surface(child, parent);
                    continue;
                }
                if let (Some(p), Some(c)) = (resolve(&bridge, parent), resolve(&bridge, child)) {
                    // Detach first so appending a node that's being moved (or reordered to
                    // the end) leaves no stale entry in its old parent's list.
                    bridge.detach(child);
                    bridge.child_order.entry(parent).or_default().push(child);
                    bridge.parent_of.insert(child, parent);
                    commands.entity(p).add_child(c);
                    inherit_text_style(&mut commands, &bridge, parent, child, c);
                }
            }
            Op::Insert {
                parent,
                child,
                before,
            } => {
                // A detached `<surface>` root is never parented (see `Op::Append`), but
                // still record its React parent for ancestor-removal cleanup.
                if bridge.surfaces.contains(&child) {
                    bridge.attach_surface(child, parent);
                    continue;
                }
                // Ordered insertion: place `child` at `before`'s position. The live
                // `Children` can't be read here (commands queued earlier in this same
                // batch haven't applied), so the index comes from the shadow tree, which
                // mirrors exactly what the deferred commands will produce. `insert_child`
                // removes any existing occurrence of `child` first, then inserts at the
                // (post-detach) index — matching the shadow update below.
                if let (Some(p), Some(c)) = (resolve(&bridge, parent), resolve(&bridge, child)) {
                    bridge.detach(child);
                    let siblings = bridge.child_order.entry(parent).or_default();
                    let idx = siblings
                        .iter()
                        .position(|&id| id == before)
                        .unwrap_or(siblings.len());
                    siblings.insert(idx, child);
                    bridge.parent_of.insert(child, parent);
                    commands.entity(p).insert_child(idx, c);
                    inherit_text_style(&mut commands, &bridge, parent, child, c);
                }
            }
            Op::Remove { parent: _, child } => {
                // React emits `Remove` only for the subtree's top node, and Bevy
                // despawns that node recursively — but a `<surface>` nested under it is a
                // detached root (no `ChildOf`), so neither reaches it. Despawn every
                // detached surface at/under `child` (incl. `child` itself if it is one)
                // before the recursive despawn below; otherwise the orphaned surface
                // keeps rendering its stale subtree into its (often shared) texture.
                let mut surfaces = bridge.surfaces_under(child);
                if bridge.surfaces.contains(&child) {
                    bridge.detach_surface(child);
                    surfaces.push(child);
                }
                for s in surfaces {
                    if let Some(se) = resolve(&bridge, s) {
                        commands.entity(se).despawn();
                    }
                    bridge.nodes.remove(&s);
                    bridge.text_styles.remove(&s);
                    bridge.raw_spans.remove(&s);
                    bridge.text_spans.remove(&s);
                    bridge.editable_inputs.remove(&s);
                    bridge.surfaces.remove(&s);
                    bridge.editable_values.remove(&s);
                    bridge.detach(s);
                    bridge.forget_subtree(s);
                }

                if let Some(c) = resolve(&bridge, child) {
                    commands.entity(c).despawn();
                    // TODO(review): these single-node removals leak the *descendants* of a
                    // removed subtree — React emits `Remove` only for the subtree root, but
                    // Bevy despawns the whole subtree, so descendant ids linger here (stale
                    // entity handles) until the next `Reset`. Prune the subtree from these
                    // tables too (the `child_order` tree below already gives the ids).
                    bridge.nodes.remove(&child);
                    bridge.text_styles.remove(&child);
                    bridge.raw_spans.remove(&child);
                    bridge.text_spans.remove(&child);
                    bridge.editable_inputs.remove(&child);
                    bridge.surfaces.remove(&child);
                    bridge.editable_values.remove(&child);
                    // Unlink from the parent's ordered list, then drop the subtree from the
                    // shadow tree so it stays bounded.
                    bridge.detach(child);
                    bridge.forget_subtree(child);
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
                            if let Ok(rnode) = rnodes.get(child)
                                && bridge.raw_spans.contains(&rnode.0)
                            {
                                commands.entity(child).insert(style.clone());
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
                        if let Ok(mut editable) = editables.get_mut(e)
                            && editable.value().to_string() != *new_val
                        {
                            editable.editor_mut().set_text(new_val);
                            editable.queue_edit(TextEdit::TextEnd(false));
                        }
                        bridge.editable_values.insert(id, new_val.clone());
                    }
                    apply_style(&mut commands.entity(e), &props.style);
                } else if bridge.surfaces.contains(&id) {
                    // A `<surface>` re-render: re-apply the (full-size-defaulted)
                    // style and rebind its name. It shares the `target` wire field
                    // with `<portal>`, so it must branch before the general path
                    // below (which would wrongly stamp an `RPortal`).
                    let style = overlay_style(&surface_root_base(), &props.style);
                    let mut ec = commands.entity(e);
                    apply_style(&mut ec, &style);
                    if let Some(name) = &props.target {
                        ec.insert(RSurface(name.clone()));
                    }
                    apply_anchor(&mut ec, &props);
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
                    // A `<portal>`'s new target name: rebind it (the binding system
                    // points its `ImageNode` at the new target next frame).
                    if let Some(target) = &props.target {
                        ec.insert(RPortal(target.clone()));
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
                    if bridge.text_spans.contains(&id) {
                        commands.entity(e).insert(TextSpan(text));
                    } else {
                        commands.entity(e).insert(Text::new(text));
                    }
                }
            }
        }
    }

    // Record this batch for live instrumentation (see [`OpApplyStats`]).
    stats.applied_count = stats.applied_count.wrapping_add(1);
    stats.last_ops = op_count;
    #[cfg(not(target_arch = "wasm32"))]
    {
        let end = std::time::Instant::now();
        stats.last_translate = end.duration_since(started);
        stats.last_apply_end = Some(end);
    }
}

/// When a bare-string run is appended into a `<text>`, copy the parent's text
/// style onto it (Bevy has no text-style inheritance, and the parent's freshly
/// queued components aren't yet visible to an ECS query this frame).
// TODO(review): this hand-rolled CSS-style text inheritance (here + the O(children)
// re-propagation loop in the `<text>` `Op::Update` branch) is a complexity hotspot. It's
// likely unavoidable until Bevy grows real text-style inheritance, but worth watching as the
// text model grows.
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

/// The default style a `<surface>` root gets before the user's `style` is overlaid:
/// it fills the offscreen texture (the camera's logical viewport) so the subtree
/// has a definite box to lay out in. The user can override `width`/`height` (or any
/// other field) via the element's `style` prop.
fn surface_root_base() -> Option<Style> {
    Some(Style {
        width: Some(crate::protocol::Length::Percent(100.0)),
        height: Some(crate::protocol::Length::Percent(100.0)),
        ..Default::default()
    })
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
    if buttons.pressed(MouseButton::Left)
        && let Some(entity) = drag.entity
        && let Ok((_, rnode, _, rel, handlers)) = nodes.get(entity)
    {
        let pos = normalized_01(rel).unwrap_or(drag.last_pos);
        let abs = cursor_abs.unwrap_or(drag.last_abs);
        drag.last_pos = pos;
        drag.last_abs = abs;
        if handlers.moved {
            emit(rnode, "pointerMove", pos, abs);
        }
    }

    // End the drag on release.
    if buttons.just_released(MouseButton::Left)
        && let Some(entity) = drag.entity.take()
        && let Ok((_, rnode, _, rel, handlers)) = nodes.get(entity)
    {
        let pos = normalized_01(rel).unwrap_or(drag.last_pos);
        let abs = cursor_abs.unwrap_or(drag.last_abs);
        if handlers.up {
            emit(rnode, "pointerUp", pos, abs);
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
#[allow(clippy::type_complexity)]
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

/// Send one [`Outbound::UiEvent`] to the JS thread for a reconciler node.
fn send_ui_event(bridge: &JsBridge, id: NodeId, kind: &str, pos: Option<Vec2>, abs: Option<Vec2>) {
    let _ = bridge.outbound_tx.send(Outbound::UiEvent {
        event: UiEvent {
            id,
            kind: kind.to_string(),
            x: pos.map(|p| p.x),
            y: pos.map(|p| p.y),
            client_x: abs.map(|a| a.x),
            client_y: abs.map(|a| a.y),
            value: None,
        },
    });
}

/// Node-relative `0..1` position (top-left origin) of a surface-space pixel
/// `position` within a node, plus that absolute surface pixel as the client coord.
/// `None` when the point can't be normalized (degenerate node).
fn surface_relative(
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
fn climb(
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

/// Report `<surface>` clicks to JS. The in-world picking path drives a virtual
/// pointer ([`SurfaceVirtualPointer`]) over the offscreen subtree, so a click on a
/// surface node arrives as a `Pointer<Click>` for that pointer — the analogue of
/// [`collect_ui_events`] for surfaces (whose nodes never get a legacy `Interaction`
/// press, since they don't render to a window). Scoped to the surface pointer id so
/// it never double-fires for main-window UI.
pub fn collect_surface_clicks(
    bridge: Res<JsBridge>,
    pointer: Option<Res<SurfaceVirtualPointer>>,
    mut clicks: MessageReader<Pointer<Click>>,
    // Only `Interaction`-bearing nodes own a click (a `<button>` gets one via `Button`;
    // a `<text>` child does not) — matching the legacy `collect_ui_events` attribution.
    targets: Query<&RNode, With<Interaction>>,
    child_of: Query<&ChildOf>,
) {
    let Some(pointer) = pointer else { return };
    for ev in clicks.read() {
        if ev.pointer_id != pointer.id {
            continue;
        }
        // Resolve the picked leaf to the nearest interactive ancestor (the button),
        // so a click on its label text still fires the button's handler.
        if let Some(target) = climb(ev.entity, &child_of, |e| targets.contains(e))
            && let Ok(rnode) = targets.get(target)
        {
            debug!("surface click -> reconciler node {}", rnode.0);
            send_ui_event(&bridge, rnode.0, "click", None, None);
        }
    }
}

/// Report `onPointer*` drag events for `<surface>` nodes, mirroring
/// [`collect_pointer_events`] for the in-world picking path. Press → `pointerDown`,
/// drag → `pointerMove`, release → `pointerUp`, each gated on the node's declared
/// [`PointerHandlers`] and carrying the cursor's node-relative `0..1` position
/// (the surface-space pixel as `client_x/y`).
#[allow(clippy::too_many_arguments)]
pub fn collect_surface_pointer_events(
    bridge: Res<JsBridge>,
    pointer: Option<Res<SurfaceVirtualPointer>>,
    mut presses: MessageReader<Pointer<Press>>,
    mut releases: MessageReader<Pointer<Release>>,
    mut drags: MessageReader<Pointer<Drag>>,
    nodes: Query<(&RNode, &PointerHandlers, &ComputedNode, &UiGlobalTransform)>,
    child_of: Query<&ChildOf>,
) {
    let Some(pointer) = pointer else { return };
    let emit = |entity: Entity, want: fn(&PointerHandlers) -> bool, kind: &str, at: Vec2| {
        // Resolve the picked leaf to the nearest ancestor that declared `onPointer*`.
        if let Some(target) = climb(entity, &child_of, |e| nodes.contains(e))
            && let Ok((rnode, handlers, node, transform)) = nodes.get(target)
            && want(handlers)
            && let Some((pos, abs)) = surface_relative(node, transform, at)
        {
            send_ui_event(&bridge, rnode.0, kind, Some(pos), Some(abs));
        }
    };
    for ev in presses.read() {
        if ev.pointer_id == pointer.id {
            emit(
                ev.entity,
                |h| h.down,
                "pointerDown",
                ev.pointer_location.position,
            );
        }
    }
    for ev in drags.read() {
        if ev.pointer_id == pointer.id {
            emit(
                ev.entity,
                |h| h.moved,
                "pointerMove",
                ev.pointer_location.position,
            );
        }
    }
    for ev in releases.read() {
        if ev.pointer_id == pointer.id {
            emit(
                ev.entity,
                |h| h.up,
                "pointerUp",
                ev.pointer_location.position,
            );
        }
    }
}

/// Apply hover/press [`StyleVariants`] to `<surface>` nodes from the in-world
/// picking path — the surface-side analogue of [`apply_interaction_styles`], which
/// can't help here because surface nodes never receive a legacy `Interaction`
/// (their offscreen camera makes `ui_focus_system` skip them). Over → base+hover,
/// press → base+hover+press, out/release → base/hover.
#[allow(clippy::too_many_arguments)]
pub fn apply_surface_interaction_styles(
    mut commands: Commands,
    pointer: Option<Res<SurfaceVirtualPointer>>,
    mut overs: MessageReader<Pointer<Over>>,
    mut outs: MessageReader<Pointer<Out>>,
    mut presses: MessageReader<Pointer<Press>>,
    mut releases: MessageReader<Pointer<Release>>,
    variants: Query<&StyleVariants>,
    child_of: Query<&ChildOf>,
) {
    let Some(pointer) = pointer else { return };
    let mut restyle = |entity: Entity, style: Option<Style>| {
        apply_style(&mut commands.entity(entity), &style);
    };
    // Resolve a picked leaf to the nearest ancestor with hover/press variants (the
    // button), so its label text highlights the button rather than nothing.
    let target = |entity: Entity| climb(entity, &child_of, |e| variants.contains(e));
    for ev in outs.read() {
        if ev.pointer_id == pointer.id
            && let Some(t) = target(ev.entity)
            && let Ok(v) = variants.get(t)
        {
            restyle(t, v.base.clone());
        }
    }
    for ev in overs.read() {
        if ev.pointer_id == pointer.id
            && let Some(t) = target(ev.entity)
            && let Ok(v) = variants.get(t)
        {
            restyle(t, overlay_style(&v.base, &v.hover));
        }
    }
    for ev in releases.read() {
        if ev.pointer_id == pointer.id
            && let Some(t) = target(ev.entity)
            && let Ok(v) = variants.get(t)
        {
            restyle(t, overlay_style(&v.base, &v.hover));
        }
    }
    for ev in presses.read() {
        if ev.pointer_id == pointer.id
            && let Some(t) = target(ev.entity)
            && let Ok(v) = variants.get(t)
        {
            let pressed = overlay_style(&overlay_style(&v.base, &v.hover), &v.press);
            restyle(t, pressed);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bridge::JsBridge;
    use crate::transition::TransitionInput;
    use std::f32::consts::PI;

    // Pass rotate as an explicit `rad` string so the asserted radian value is
    // carried verbatim (a bare number would be read as degrees).
    fn text_props(rotate: f32) -> Props {
        serde_json::from_value(serde_json::json!({
            "style": {
                "transform": { "rotate": format!("{rotate}rad") },
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
        app.init_resource::<OpApplyStats>();

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
                text: None,
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

    /// Regression: an inline-text nested `<text>` (a `textSpan` carrying its text
    /// on the create op) must keep updating its `TextSpan` on `Op::UpdateText` — it
    /// must never gain a stray `Text` component (which renders a duplicate, leaving
    /// the old value visible alongside the new one).
    #[test]
    fn update_text_on_inline_span_keeps_textspan() {
        let (mut app, ops_tx, _root) = ordering_app();

        ops_tx
            .send(vec![
                // A `<text>` root with a nested inline `<text>{0}</text>` span.
                Op::Create {
                    id: 1,
                    kind: "text".into(),
                    props: Props::default(),
                    text: None,
                },
                Op::Create {
                    id: 2,
                    kind: "textSpan".into(),
                    props: Props::default(),
                    text: Some("0".into()),
                },
                Op::Append {
                    parent: 1,
                    child: 2,
                },
            ])
            .unwrap();
        app.update();

        ops_tx
            .send(vec![Op::UpdateText {
                id: 2,
                text: "1".into(),
            }])
            .unwrap();
        app.update();

        let span = ent(&app, 2);
        assert_eq!(
            app.world().entity(span).get::<TextSpan>().map(|s| &*s.0),
            Some("1"),
            "the span's TextSpan must hold the updated text"
        );
        assert!(
            app.world().entity(span).get::<Text>().is_none(),
            "a span must never gain a Text component (that renders a duplicate)"
        );
    }

    // --- ordered insertion (`Op::Insert` honoring `before`) --------------------

    /// Build a minimal app with `apply_js_ops` wired up and a spawned UI root, plus
    /// the ops sender. Mirrors `text_update_reapplies_transform_target`'s harness.
    fn ordering_app() -> (App, crossbeam_channel::Sender<Vec<Op>>, Entity) {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_resource::<Fonts>();
        app.init_resource::<OpApplyStats>();
        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let (out_tx, _out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_systems(Update, apply_js_ops);
        (app, ops_tx, root)
    }

    fn create_node(id: NodeId) -> Op {
        Op::Create {
            id,
            kind: "node".into(),
            props: Props::default(),
            text: None,
        }
    }

    /// The entity a node id resolved to.
    fn ent(app: &App, id: NodeId) -> Entity {
        app.world().resource::<JsBridge>().nodes[&id]
    }

    /// The parent's children, in order.
    fn children_of(app: &App, parent: Entity) -> Vec<Entity> {
        app.world()
            .entity(parent)
            .get::<Children>()
            .map(|c| c.iter().collect())
            .unwrap_or_default()
    }

    /// Append-only construction yields the appended order — and does so within a
    /// single batch, where the live `Children` is not yet readable.
    #[test]
    fn append_builds_child_order() {
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            create_node(1), // parent
            create_node(2),
            create_node(3),
            create_node(4),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            Op::Append {
                parent: 1,
                child: 2,
            },
            Op::Append {
                parent: 1,
                child: 3,
            },
            Op::Append {
                parent: 1,
                child: 4,
            },
        ])
        .unwrap();
        app.update();

        let parent = ent(&app, 1);
        assert_eq!(
            children_of(&app, parent),
            vec![ent(&app, 2), ent(&app, 3), ent(&app, 4)],
        );
    }

    /// Moving an existing child with `Insert` reorders it (React emits `insertBefore`
    /// with the same id, no preceding remove): `[A,B,C]` + move C before A → `[C,A,B]`.
    #[test]
    fn insert_reorders_existing_child() {
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            create_node(1),
            create_node(2),
            create_node(3),
            create_node(4),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            Op::Append {
                parent: 1,
                child: 2,
            },
            Op::Append {
                parent: 1,
                child: 3,
            },
            Op::Append {
                parent: 1,
                child: 4,
            },
        ])
        .unwrap();
        app.update();

        // Move C (4) before A (2).
        tx.send(vec![Op::Insert {
            parent: 1,
            child: 4,
            before: 2,
        }])
        .unwrap();
        app.update();

        let parent = ent(&app, 1);
        assert_eq!(
            children_of(&app, parent),
            vec![ent(&app, 4), ent(&app, 2), ent(&app, 3)],
            "C should move to the front: [C, A, B]"
        );
    }

    /// Inserting a brand-new child mid-list lands it at `before`'s position:
    /// `[A,B,C]` + insert D before B → `[A,D,B,C]`.
    #[test]
    fn insert_new_child_in_the_middle() {
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            create_node(1),
            create_node(2),
            create_node(3),
            create_node(4),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            Op::Append {
                parent: 1,
                child: 2,
            },
            Op::Append {
                parent: 1,
                child: 3,
            },
            Op::Append {
                parent: 1,
                child: 4,
            },
        ])
        .unwrap();
        app.update();

        // New node D (5) inserted before B (3).
        tx.send(vec![
            create_node(5),
            Op::Insert {
                parent: 1,
                child: 5,
                before: 3,
            },
        ])
        .unwrap();
        app.update();

        let parent = ent(&app, 1);
        assert_eq!(
            children_of(&app, parent),
            vec![ent(&app, 2), ent(&app, 5), ent(&app, 3), ent(&app, 4)],
            "D should land before B: [A, D, B, C]"
        );
    }

    /// The regression that motivates the shadow tree: an `Insert` whose `before` was
    /// appended earlier in the SAME batch. The live `Children` can't be read mid-batch
    /// (deferred commands), so the index must come from the shadow order — `[X, Y]`.
    #[test]
    fn insert_orders_within_a_single_batch() {
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            create_node(10), // parent
            create_node(11), // X
            create_node(12), // Y
            Op::Append {
                parent: ROOT_ID,
                child: 10,
            },
            Op::Append {
                parent: 10,
                child: 12,
            }, // Y appended first
            Op::Insert {
                parent: 10,
                child: 11,
                before: 12,
            }, // X inserted before Y, same batch
        ])
        .unwrap();
        app.update();

        let parent = ent(&app, 10);
        assert_eq!(
            children_of(&app, parent),
            vec![ent(&app, 11), ent(&app, 12)],
            "X must precede Y even though Children was unreadable mid-batch"
        );
    }

    /// A `<portal>` mounts to an `ImageNode` carrying an `RPortal` with its target
    /// name; an update rebinds the name.
    #[test]
    fn portal_mounts_with_target_and_rebinds() {
        use bevy::ui::widget::ImageNode;
        use bevy_react_portal::RPortal;
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![Op::Create {
            id: 1,
            kind: "portal".into(),
            props: serde_json::from_value(serde_json::json!({ "target": "follow" }))
                .expect("valid portal props"),
            text: None,
        }])
        .unwrap();
        app.update();

        let e = ent(&app, 1);
        assert_eq!(
            app.world().entity(e).get::<RPortal>().map(|p| p.0.clone()),
            Some("follow".to_string()),
            "a portal carries its target name"
        );
        assert!(
            app.world().entity(e).get::<ImageNode>().is_some(),
            "a portal is backed by an ImageNode"
        );

        tx.send(vec![Op::Update {
            id: 1,
            props: serde_json::from_value(serde_json::json!({ "target": "minimap" }))
                .expect("valid portal props"),
        }])
        .unwrap();
        app.update();
        assert_eq!(
            app.world().entity(e).get::<RPortal>().map(|p| p.0.clone()),
            Some("minimap".to_string()),
            "an update rebinds the portal's target name"
        );
    }

    /// A `<surface>` mounts carrying its name in an `RSurface`, and stays a detached
    /// UI root: appending it under a parent must NOT add it to that parent's Bevy
    /// `Children` (it renders to its own offscreen camera instead).
    #[test]
    fn surface_mounts_detached_with_name() {
        use bevy_react_surface::RSurface;
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            create_node(1), // a normal parent under the root
            Op::Create {
                id: 2,
                kind: "surface".into(),
                props: serde_json::from_value(serde_json::json!({ "target": "monitor" }))
                    .expect("valid surface props"),
                text: None,
            },
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            // React appends the surface under node 1; the reconciler must keep it
            // detached (no Bevy parent) so it is an independent layout root.
            Op::Append {
                parent: 1,
                child: 2,
            },
        ])
        .unwrap();
        app.update();

        let surface = ent(&app, 2);
        assert_eq!(
            app.world()
                .entity(surface)
                .get::<RSurface>()
                .map(|s| s.0.clone()),
            Some("monitor".to_string()),
            "a surface carries its name in RSurface"
        );
        assert!(
            app.world().entity(surface).get::<ChildOf>().is_none(),
            "a surface is a detached root — never parented into the on-screen tree"
        );
        assert!(
            children_of(&app, ent(&app, 1)).is_empty(),
            "the surface's React parent has no Bevy children"
        );

        // An update rebinds the surface name (and never stamps an RPortal).
        tx.send(vec![Op::Update {
            id: 2,
            props: serde_json::from_value(serde_json::json!({ "target": "panel" }))
                .expect("valid surface props"),
        }])
        .unwrap();
        app.update();
        assert_eq!(
            app.world()
                .entity(surface)
                .get::<RSurface>()
                .map(|s| s.0.clone()),
            Some("panel".to_string()),
            "an update rebinds the surface name"
        );
        assert!(
            app.world()
                .entity(surface)
                .get::<bevy_react_portal::RPortal>()
                .is_none(),
            "a surface update must not stamp an RPortal (shared `target` field)"
        );
    }

    /// `Op::Reset` must keep the persistent anchor layer alive (it is spawned once at
    /// startup) while still clearing the reconciler overlays reparented under it.
    #[test]
    fn reset_preserves_anchor_layer_but_clears_its_overlays() {
        use crate::anchor::AnchorLayer;
        let (mut app, tx, root) = ordering_app();

        // The anchor layer is a child of the root; an overlay (a reconciler node) has
        // been reparented under it, exactly as `position_anchored_nodes` would do.
        let layer = app.world_mut().spawn((AnchorLayer, ChildOf(root))).id();
        let overlay = app.world_mut().spawn((RNode(99), ChildOf(layer))).id();

        tx.send(vec![Op::Reset]).unwrap();
        app.update();

        assert!(
            app.world().entities().contains(layer),
            "Op::Reset must preserve the persistent anchor layer"
        );
        assert!(
            !app.world().entities().contains(overlay),
            "Op::Reset must despawn overlays reparented under the anchor layer"
        );
    }

    /// `Op::Reset` must despawn detached `<surface>` roots. They aren't children of the
    /// UI root (a surface renders to its own offscreen camera), so the root-children
    /// despawn misses them; a cold reload would otherwise leak a stale surface subtree
    /// that keeps rendering into the texture.
    #[test]
    fn reset_despawns_detached_surfaces() {
        let (mut app, tx, _root) = ordering_app();

        // Mount a `<surface>` under the root (it stays a detached root in Bevy).
        tx.send(vec![
            Op::Create {
                id: 1,
                kind: "surface".into(),
                props: serde_json::from_value(serde_json::json!({ "target": "monitor" }))
                    .expect("valid surface props"),
                text: None,
            },
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
        ])
        .unwrap();
        app.update();
        let surface = ent(&app, 1);
        assert!(app.world().entities().contains(surface));

        tx.send(vec![Op::Reset]).unwrap();
        app.update();

        assert!(
            !app.world().entities().contains(surface),
            "Op::Reset must despawn the detached surface root"
        );
        assert!(
            app.world().resource::<JsBridge>().surfaces.is_empty(),
            "Op::Reset must clear surface bookkeeping"
        );
    }

    /// Removing an ancestor whose subtree *contains* a detached `<surface>` must despawn
    /// the surface too. React emits `Remove` only for the subtree's top node, and the
    /// surface is a detached root (no `ChildOf`), so neither React's op nor Bevy's
    /// recursive despawn of the ancestor reaches it — `apply_js_ops` must find it via the
    /// tracked React parentage. Regression: navigating away from the Home demo left its
    /// `<surface name="monitor">` rendering into the shared monitor texture under the
    /// `<surface>` demo. This reproduces the exact op stream React emits (verified: only
    /// the wrapper gets a `Remove`, never the nested surface).
    #[test]
    fn remove_ancestor_despawns_nested_surface() {
        let (mut app, tx, _root) = ordering_app();
        // Mirror Home's shape: a wrapper `<node>` under the root, a `<surface>` nested
        // inside it, and a normal node rendered inside the surface.
        tx.send(vec![
            create_node(1), // wrapper (Home's container)
            Op::Create {
                id: 2,
                kind: "surface".into(),
                props: serde_json::from_value(serde_json::json!({ "target": "monitor" }))
                    .expect("valid surface props"),
                text: None,
            },
            create_node(3), // content rendered inside the surface
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            Op::Append {
                parent: 1,
                child: 2,
            }, // surface nested under the wrapper
            Op::Append {
                parent: 2,
                child: 3,
            }, // content inside the surface
        ])
        .unwrap();
        app.update();
        let wrapper = ent(&app, 1);
        let surface = ent(&app, 2);
        let inner = ent(&app, 3);
        assert!(app.world().entities().contains(surface));

        // React unmounts the wrapper: a single `Remove` for the top node only.
        tx.send(vec![Op::Remove {
            parent: ROOT_ID,
            child: 1,
        }])
        .unwrap();
        app.update();

        assert!(
            !app.world().entities().contains(wrapper),
            "the removed wrapper is despawned"
        );
        assert!(
            !app.world().entities().contains(surface),
            "the detached <surface> nested under the removed wrapper must be despawned"
        );
        assert!(
            !app.world().entities().contains(inner),
            "the surface's own subtree is despawned with it"
        );
        let bridge = app.world().resource::<JsBridge>();
        assert!(bridge.surfaces.is_empty(), "surface bookkeeping is cleared");
        assert!(
            !bridge.nodes.contains_key(&2),
            "the surface node id is forgotten"
        );
        assert!(
            bridge.child_surfaces.is_empty() && bridge.surface_parent.is_empty(),
            "surface parentage maps are cleared"
        );
    }
}
