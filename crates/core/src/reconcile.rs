//! The two Bevy systems that drive the boundary each frame:
//! - [`apply_js_ops`] drains reconciler op batches and mutates the UI tree.
//! - [`collect_ui_events`] reports interactions back to the JS thread.

use accesskit::Role;
use bevy::a11y::AccessibilityNode;
use bevy::ecs::system::SystemParam;
use bevy::image::Image;
use bevy::input_focus::tab_navigation::TabIndex;
use bevy::input_focus::{AutoFocus, FocusGained, FocusLost};
use bevy::picking::events::{Click, Drag, Out, Over, Pointer, Press, Release};
use bevy::platform::collections::HashSet;
use bevy::prelude::*;
use bevy::text::{EditableText, FontCx, LayoutCx, TextCursorStyle, TextEdit, TextEditChange};
use bevy::ui::FocusPolicy;
use bevy::ui::RelativeCursorPosition;
use bevy::ui::widget::NodeImageMode;
use bevy::ui::{ComputedNode, ScrollPosition, UiGlobalTransform};
use bevy_react_animations::AnimatedNode;
use bevy_react_canvas::{CanvasSurface, blank_canvas_image};
use bevy_react_portal::{RPortal, blank_portal_image};
use bevy_react_surface::{RSurface, SurfaceVirtualPointer};

use crate::anchor::Anchored;
use crate::bridge::{
    FocusState, JsBridge, PointerHandlers, RNode, ScrollListener, ScrollStep, StyleVariants,
};
use crate::filter::{FilterAssets, FilterMaterial, FilterMaterialCache, filter_material};
use crate::plugin::Fonts;
use crate::protocol::{NodeId, Op, Outbound, Props, ROOT_ID, Style, UiEvent};
use crate::transition::{ScrollTransitionState, apply_scroll_transition};
use crate::ui_map::{
    AtlasLayoutCache, apply_atlas, apply_opacity, apply_style, apply_text_style, image_node,
    overlay_style, parse_color, resolved_text_style, text_layout,
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

/// The asset stores + caches the op-apply path builds components from: the
/// `<image atlas>` `TextureAtlasLayout`s and the `filter` style's
/// [`FilterMaterial`]s (plus the shared white pixel). Bundled as one `SystemParam`
/// so [`apply_js_ops`] stays under Bevy's per-system parameter limit.
#[derive(SystemParam)]
pub struct UiAssets<'w> {
    layouts: ResMut<'w, Assets<TextureAtlasLayout>>,
    atlas_cache: ResMut<'w, AtlasLayoutCache>,
    filter_materials: ResMut<'w, Assets<FilterMaterial>>,
    filter_cache: ResMut<'w, FilterMaterialCache>,
    filter_assets: Res<'w, FilterAssets>,
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
    // Sprite-sheet grids for `<image atlas>`, plus the cache that keeps repeated
    // commits from leaking a `TextureAtlasLayout` per frame (see `AtlasLayoutCache`).
    // Asset stores + caches for `<image atlas>` and the `filter` material, bundled
    // into one `SystemParam` so `apply_js_ops` stays within Bevy's 16-param limit.
    mut ui_assets: UiAssets,
    children: Query<&Children>,
    rnodes: Query<&RNode>,
    // On re-render the entity's kind isn't on the op, so we detect a `<button>` by
    // its marker to keep re-asserting its `FocusPolicy::Block` default (see
    // `apply_button_focus_default`) that the per-commit `apply_style` resets to `Pass`.
    buttons: Query<(), With<Button>>,
    // The persistent world-anchor overlay layer (a child of the root). It is
    // infrastructure, not a reconciler node, so `Op::Reset` must preserve it.
    anchor_layer: Query<(), With<crate::anchor::AnchorLayer>>,
    mut editables: Query<&mut EditableText>,
    // Controlled `scrollTop`/`scrollLeft`: every `Node` has a `ScrollPosition`
    // (it's a required component), so `get_mut(e)` succeeds for any node — we only
    // write the axis React controls, and only when it diverges from the live value.
    // `ComputedNode` lets us clamp the write to the scrollable range, like the
    // wheel handler does, so a controlled offset can't overscroll. With a scroll
    // transition the offset is eased: the controlled value sets the target rather
    // than `ScrollPosition` directly.
    mut scroll_query: Query<(
        &mut ScrollPosition,
        &ComputedNode,
        Option<&mut ScrollTransitionState>,
    )>,
    mut a11y_nodes: Query<&mut AccessibilityNode>,
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
                bridge.editable_selections.clear();
                bridge.editable_select_handlers.clear();
                bridge.editable_focus_handlers.clear();
                bridge.editable_pending_selection.clear();
                bridge.scroll_positions.clear();
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
                            // Announce as a text field to assistive tech; the live
                            // value is kept in sync by `sync_editable_a11y`.
                            AccessibilityNode(editable_a11y_node(&props)),
                        ));
                        // `AutoFocus`'s `on_add` hook focuses the entity once mounted.
                        if props.autofocus {
                            ec.insert(AutoFocus);
                        }
                        // `focusStyle` (and any hover/press) — applied Bevy-side as
                        // the field's focus/interaction state changes.
                        apply_style_variants(&mut ec, &props);
                        apply_anchor(&mut ec, &props);
                        ec.id()
                    }
                    _ => spawn_element(
                        &mut commands,
                        id,
                        &kind,
                        &props,
                        &assets,
                        &mut ui_assets.layouts,
                        &mut ui_assets.atlas_cache,
                        &mut FilterCtx {
                            materials: &mut ui_assets.filter_materials,
                            cache: &mut ui_assets.filter_cache,
                            white: &ui_assets.filter_assets.white,
                        },
                    ),
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
                    register_editable_handlers(&mut bridge, id, &props);
                    queue_pending_selection(&mut bridge, id, &props);
                }
                if kind == "surface" {
                    bridge.surfaces.insert(id);
                }
                // Controlled scroll + the `onScroll` listener apply to any node
                // (anything with `overflow: scroll`). A `textSpan` has no `Node`
                // and so never matches the read-back query — harmless there.
                {
                    let mut ec = commands.entity(entity);
                    apply_scroll_listener(&mut ec, &props);
                    apply_scroll_step(&mut ec, &props);
                    apply_scroll_transition(&mut ec, &props.style);
                    create_controlled_scroll(&mut bridge, &mut ec, id, &props);
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
                    bridge.editable_selections.remove(&s);
                    bridge.editable_select_handlers.remove(&s);
                    bridge.editable_focus_handlers.remove(&s);
                    bridge.editable_pending_selection.remove(&s);
                    bridge.scroll_positions.remove(&s);
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
                    bridge.editable_selections.remove(&child);
                    bridge.editable_select_handlers.remove(&child);
                    bridge.editable_focus_handlers.remove(&child);
                    bridge.editable_pending_selection.remove(&child);
                    bridge.scroll_positions.remove(&child);
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
                    // Handler presence and the controlled selection can change on a
                    // re-render; refresh them. The accessible label is kept live too.
                    register_editable_handlers(&mut bridge, id, &props);
                    queue_pending_selection(&mut bridge, id, &props);
                    if let Ok(mut node) = a11y_nodes.get_mut(e) {
                        match &props.aria_label {
                            Some(label) => node.set_label(label.clone()),
                            None => node.clear_label(),
                        }
                    }
                    let mut ec = commands.entity(e);
                    apply_style(&mut ec, &props.style);
                    apply_style_variants(&mut ec, &props);
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
                        let mut img = image_node(&props, &assets);
                        apply_atlas(
                            &mut img,
                            &props,
                            &mut ui_assets.layouts,
                            &mut ui_assets.atlas_cache,
                        );
                        ec.insert(img);
                    }
                    // A `filter` swaps the node's draw for a `MaterialNode`; run
                    // after the style/image above so it can drop the components it
                    // replaces. Absent → it removes any prior filter material.
                    apply_filter(
                        &mut ec,
                        &props,
                        &assets,
                        &mut FilterCtx {
                            materials: &mut ui_assets.filter_materials,
                            cache: &mut ui_assets.filter_cache,
                            white: &ui_assets.filter_assets.white,
                        },
                    );
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
                    // `apply_style` just reset this entity to the `Pass` default;
                    // re-assert a button's `Block` (no-op / `Pass` for plain nodes).
                    if buttons.get(e).is_ok() {
                        apply_button_focus_default(&mut ec, &props.style);
                    }
                    apply_style_variants(&mut ec, &props);
                    apply_pointer_handlers(&mut ec, &props);
                    apply_scroll_listener(&mut ec, &props);
                    apply_scroll_step(&mut ec, &props);
                    apply_scroll_transition(&mut ec, &props.style);
                    apply_animated(&mut ec, &props);
                    apply_anchor(&mut ec, &props);
                    update_controlled_scroll(&mut bridge, &mut scroll_query, e, id, &props);
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

/// The resources [`apply_filter`] needs to build/cache a `FilterMaterial` and bind
/// the shared white pixel — bundled so the call sites don't thread three params.
struct FilterCtx<'a> {
    materials: &'a mut Assets<FilterMaterial>,
    cache: &'a mut FilterMaterialCache,
    white: &'a Handle<Image>,
}

/// Apply (or clear) a `filter` style on an element. Present → build a
/// [`FilterMaterial`] (source = the `<image>`'s texture, else the shared white
/// pixel tinted by `base_color`) and insert a `MaterialNode<FilterMaterial>`,
/// dropping the standard `ImageNode` / `BackgroundColor` so the node isn't drawn
/// twice. Absent → remove any prior filter material so the node reverts to its
/// normal draw. Must run *after* `apply_style` / the image insert (it removes the
/// components those add). See [`crate::filter`] for the scope (own surface only).
fn apply_filter(ec: &mut EntityCommands, props: &Props, assets: &AssetServer, ctx: &mut FilterCtx) {
    let Some(spec) = props.style.as_ref().and_then(|s| s.filter.as_ref()) else {
        ec.remove::<MaterialNode<FilterMaterial>>();
        return;
    };
    // Base color: the image tint, else the background color, else white. Opacity is
    // folded into alpha just like the standard background/image paths.
    let opacity = props.style.as_ref().and_then(|s| s.opacity);
    let base = props
        .tint
        .as_deref()
        .or_else(|| {
            props
                .style
                .as_ref()
                .and_then(|s| s.background_color.as_deref())
        })
        .map(parse_color)
        .unwrap_or(Color::WHITE);
    let texture = match &props.src {
        Some(path) => assets.load(path),
        None => ctx.white.clone(),
    };
    let mat = filter_material(spec, texture, apply_opacity(base, opacity));
    let handle = ctx.cache.handle(ctx.materials, mat);

    // The material replaces the node's own draw (so a filtered node never carries a
    // visible `BackgroundColor` — that's already dropped in `apply_style`).
    if props.src.is_some() {
        // A `MaterialNode` has no content measure, so a filtered `<image>` with only
        // a `width` would collapse to zero height. Keep the `ImageNode` (it measures
        // the texture's intrinsic size) but make it transparent so only the filter
        // material paints — no double draw.
        let mut img = image_node(props, assets);
        img.color = img.color.with_alpha(0.0);
        ec.insert(img);
    } else {
        // A solid-colored node: the material paints the (filtered) color; drop any
        // `ImageNode` a prior render left behind.
        ec.remove::<ImageNode>();
    }
    ec.remove::<BackgroundColor>();
    ec.insert(MaterialNode(handle));
}

/// Spawn a `node`, `button`, or `image` host element with its style.
#[allow(clippy::too_many_arguments)]
fn spawn_element(
    commands: &mut Commands,
    id: NodeId,
    kind: &str,
    props: &Props,
    assets: &AssetServer,
    layouts: &mut Assets<TextureAtlasLayout>,
    atlas_cache: &mut AtlasLayoutCache,
    filter: &mut FilterCtx,
) -> Entity {
    let mut ec = commands.spawn(RNode(id));
    apply_style(&mut ec, &props.style);
    match kind {
        // `Button` requires `Interaction`, which is added automatically.
        "button" => {
            ec.insert(Button);
            // Buttons capture the pointer by default; `apply_style` already
            // defaulted this entity to `Pass`, so override unless the prop is set.
            apply_button_focus_default(&mut ec, &props.style);
        }
        "image" => {
            let mut img = image_node(props, assets);
            apply_atlas(&mut img, props, layouts, atlas_cache);
            ec.insert(img);
        }
        _ => {}
    }
    // A `filter` swaps the node's image/background draw for a filter material.
    apply_filter(&mut ec, props, assets, filter);
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
    if props.hover_style.is_some() || props.press_style.is_some() || props.focus_style.is_some() {
        ec.insert(StyleVariants {
            base: props.style.clone(),
            hover: props.hover_style.clone(),
            press: props.press_style.clone(),
            focus: props.focus_style.clone(),
        });
        // Hover/press are driven by `Interaction`; focus by `FocusState` (toggled
        // by the focus observers). Add each only for the variants present.
        if props.hover_style.is_some() || props.press_style.is_some() {
            ec.insert_if_new(Interaction::default());
        }
        if props.focus_style.is_some() {
            ec.insert_if_new(FocusState::default());
        } else {
            ec.remove::<FocusState>();
        }
    } else {
        ec.remove::<StyleVariants>();
        ec.remove::<FocusState>();
    }
}

/// Stamp (or clear) the [`PointerHandlers`] marker plus the components the
/// drag-capture system needs. When any `onPointer*` handler is declared the
/// element also gets a [`RelativeCursorPosition`] (so we can read the cursor's
/// normalized position within it).
///
/// Both `onClick` and the `onPointer*` handlers are detected through the
/// `Interaction` `Pressed` transition (see [`collect_ui_events`]), so any element
/// carrying either gets an `Interaction`. Without it a plain `<node onClick>` —
/// no hover/press style, not a `<button>` — would never be reported as clicked.
/// `insert_if_new` leaves an existing `Interaction` (a `button`'s, or a
/// hover/press variant's) untouched.
fn apply_pointer_handlers(ec: &mut EntityCommands, props: &Props) {
    if props.on_pointer_down || props.on_pointer_move || props.on_pointer_up {
        ec.insert(PointerHandlers {
            down: props.on_pointer_down,
            moved: props.on_pointer_move,
            up: props.on_pointer_up,
        });
        ec.insert_if_new(RelativeCursorPosition::default());
    } else {
        ec.remove::<PointerHandlers>();
        ec.remove::<RelativeCursorPosition>();
    }
    if props.on_click || props.on_pointer_down || props.on_pointer_move || props.on_pointer_up {
        ec.insert_if_new(Interaction::default());
    }
}

/// Toggle the [`ScrollListener`] marker so [`collect_scroll_events`] reports this
/// node's `ScrollPosition` changes only while an `onScroll` handler is declared.
fn apply_scroll_listener(ec: &mut EntityCommands, props: &Props) {
    if props.on_scroll {
        ec.insert_if_new(ScrollListener);
    } else {
        ec.remove::<ScrollListener>();
    }
}

/// Stamp (or clear) the per-node [`ScrollStep`] wheel step from `scrollStep`.
fn apply_scroll_step(ec: &mut EntityCommands, props: &Props) {
    match props.scroll_step {
        Some(step) => {
            ec.insert(ScrollStep(step));
        }
        None => {
            ec.remove::<ScrollStep>();
        }
    }
}

/// Apply a controlled `scrollTop`/`scrollLeft` on **create**: insert the offset
/// (defaulting the uncontrolled axis to 0) and seed [`JsBridge::scroll_positions`]
/// so neither the programmatic write nor the node's mount-frame
/// `Changed<ScrollPosition>` echoes back as an `onScroll`. A listener with no
/// controlled offset is seeded at the default `ZERO` for the same reason.
fn create_controlled_scroll(
    bridge: &mut JsBridge,
    ec: &mut EntityCommands,
    id: NodeId,
    props: &Props,
) {
    if props.scroll_top.is_some() || props.scroll_left.is_some() {
        let pos = Vec2::new(
            props.scroll_left.unwrap_or(0.0),
            props.scroll_top.unwrap_or(0.0),
        );
        // Overrides the `ZERO` that `Node`'s required `ScrollPosition` defaults to.
        ec.insert(ScrollPosition(pos));
        bridge.scroll_positions.insert(id, pos);
    } else if props.on_scroll {
        bridge.scroll_positions.insert(id, Vec2::ZERO);
    }
}

/// Push a controlled `scrollTop`/`scrollLeft` into a live node on **update**:
/// write only the axis React controls, clamped to the scrollable range, and only
/// when it diverges from the live offset (so a re-render echoing the user's own
/// wheel scroll is a no-op and never snaps the view). Mirrors the controlled
/// `value` diff for `editableText`.
///
/// Records the **requested** (pre-clamp) value in [`JsBridge::scroll_positions`].
/// When the request was in range this equals the written offset, so the read-back
/// dedups it (no echo). When the request overshot, the clamped component value
/// diverges from the recorded request, so the read-back fires one `"scroll"` with
/// the real offset — letting a controlled `scrollTop={BIG}` settle to the true max.
///
/// With a scroll transition ([`ScrollTransitionState`] present) the clamped value
/// becomes the eased **target** instead of being written to `ScrollPosition` — the
/// `drive_scroll_transition` system moves the offset toward it. The uncontrolled
/// axis keeps the current target (not the mid-ease position) so it doesn't snap.
fn update_controlled_scroll(
    bridge: &mut JsBridge,
    scroll_query: &mut Query<(
        &mut ScrollPosition,
        &ComputedNode,
        Option<&mut ScrollTransitionState>,
    )>,
    e: Entity,
    id: NodeId,
    props: &Props,
) {
    if props.scroll_top.is_none() && props.scroll_left.is_none() {
        return;
    }
    if let Ok((mut pos, computed, scroll_state)) = scroll_query.get_mut(e) {
        // Base on the eased target if a transition owns the offset, else the live one.
        let mut requested = scroll_state.as_ref().map_or(pos.0, |s| s.target);
        if let Some(x) = props.scroll_left {
            requested.x = x;
        }
        if let Some(y) = props.scroll_top {
            requested.y = y;
        }
        // Same range as the wheel handler (`scroll::apply_scroll`): `ComputedNode`
        // sizes are physical, the component is logical, so scale with `inverse_scale_factor`.
        let max = (computed.content_size - computed.size + computed.scrollbar_size).max(Vec2::ZERO)
            * computed.inverse_scale_factor;
        let clamped = requested.clamp(Vec2::ZERO, max);
        match scroll_state {
            // Eased: set the target; `drive_scroll_transition` moves `ScrollPosition`.
            Some(mut state) => state.target = clamped,
            // Snap: write the offset directly, only when it diverges.
            None => {
                if pos.0 != clamped {
                    pos.0 = clamped;
                }
            }
        }
        bridge.scroll_positions.insert(id, requested);
    }
}

/// `<button>` captures the pointer by default — bevy_ui's native `Button` sets
/// `FocusPolicy::Block`, and we mirror that so a button doesn't leak its click to a
/// sibling, an ancestor, or the 3D scene/portal behind it. [`apply_style`] defaults
/// every element to `Pass`, so for a button with no explicit `focusPolicy` we
/// re-assert `Block` here. A bare `<node>` keeps `Pass`, so containers/labels stay
/// click-through and don't swallow clicks meant for what's behind or around them.
/// An explicit `focusPolicy` prop (handled in `apply_style`) always wins.
fn apply_button_focus_default(ec: &mut EntityCommands, style: &Option<Style>) {
    let has_explicit = style
        .as_ref()
        .and_then(|s| s.focus_policy.as_deref())
        .is_some();
    if !has_explicit {
        ec.insert(FocusPolicy::Block);
    }
}

/// Whether these props carry any `image` element attribute.
fn is_image(props: &Props) -> bool {
    props.src.is_some()
        || props.tint.is_some()
        || props.image_mode.is_some()
        || props.flip_x
        || props.flip_y
        || props.source_rect.is_some()
        || props.atlas.is_some()
        || props.visual_box.is_some()
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
                    ..default()
                },
            });
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

/// Build the accesskit node for an `editableText` from its props (role + label +
/// initial value). The live value is kept current by [`sync_editable_a11y`].
fn editable_a11y_node(props: &Props) -> accesskit::Node {
    let role = if props.multiline {
        Role::MultilineTextInput
    } else {
        Role::TextInput
    };
    let mut node = accesskit::Node::new(role);
    if let Some(label) = &props.aria_label {
        node.set_label(label.clone());
    }
    node.set_value(props.value.clone().unwrap_or_default());
    node
}

/// Add or remove `id` from `set` to mirror a boolean prop.
fn set_membership(set: &mut HashSet<NodeId>, id: NodeId, present: bool) {
    if present {
        set.insert(id);
    } else {
        set.remove(&id);
    }
}

/// Record which optional `editableText` handlers are registered in JS, so the
/// high-frequency `"select"`/`"focus"`/`"blur"` events are only emitted when
/// something is listening. Called on create and on every controlled update.
fn register_editable_handlers(bridge: &mut JsBridge, id: NodeId, props: &Props) {
    set_membership(&mut bridge.editable_select_handlers, id, props.on_select);
    set_membership(
        &mut bridge.editable_focus_handlers,
        id,
        props.on_focus || props.on_blur,
    );
}

/// Queue a controlled selection (byte offsets) for [`apply_pending_selections`],
/// when both `selectionStart` and `selectionEnd` are supplied.
fn queue_pending_selection(bridge: &mut JsBridge, id: NodeId, props: &Props) {
    if let (Some(start), Some(end)) = (props.selection_start, props.selection_end) {
        bridge.editable_pending_selection.insert(id, (start, end));
    }
}

/// Report `editableText` edits back to JS. Bevy triggers [`TextEditChange`] after
/// applying edits — but also on cursor/selection moves — so this single observer
/// emits a `"change"` (deduped against the last value) when the text changed, and
/// a `"select"` (deduped against the last selection, and only for nodes with an
/// `onSelect` handler, since caret moves are frequent) when the selection moved.
/// Each is routed by node id + kind in the JS event-loop router.
pub fn on_text_edit_change(
    change: On<TextEditChange>,
    mut bridge: ResMut<JsBridge>,
    editables: Query<(&EditableText, &RNode)>,
) {
    let Ok((editable, rnode)) = editables.get(change.event_target()) else {
        return;
    };
    let id = rnode.0;
    let composing = editable.is_composing();

    let value = editable.value().to_string();
    if bridge.editable_values.get(&id) != Some(&value) {
        bridge.editable_values.insert(id, value.clone());
        debug!("change -> reconciler node {id}");
        let _ = bridge.outbound_tx.send(Outbound::UiEvent {
            event: UiEvent {
                id,
                kind: "change".to_string(),
                value: Some(value),
                composing: Some(composing),
                ..default()
            },
        });
    }

    if bridge.editable_select_handlers.contains(&id) {
        let sel = editable.editor().raw_selection();
        let anchor = sel.anchor().index();
        let focus = sel.focus().index();
        if bridge.editable_selections.get(&id) != Some(&(anchor, focus)) {
            // Pre-seeded by a programmatic select; this dedup suppresses that echo.
            bridge.editable_selections.insert(id, (anchor, focus));
            let direction = if anchor == focus {
                "none"
            } else if anchor < focus {
                "forward"
            } else {
                "backward"
            };
            let _ = bridge.outbound_tx.send(Outbound::UiEvent {
                event: UiEvent {
                    id,
                    kind: "select".to_string(),
                    selection_start: Some(anchor.min(focus)),
                    selection_end: Some(anchor.max(focus)),
                    selection_direction: Some(direction.to_string()),
                    composing: Some(composing),
                    ..default()
                },
            });
        }
    }
}

/// Emit an `editableText`'s `"focus"` / `"blur"` events, and toggle the node's
/// [`FocusState`] so a `focusStyle` is (un)applied by [`apply_interaction_styles`].
/// `FocusGained`/`FocusLost` are `auto_propagate` (they bubble to parents), so we
/// act on the originally focused entity (`ev.entity`). Event emission is gated to
/// editables with an `onFocus`/`onBlur` handler; `FocusState` is general (no-op for
/// nodes without it).
pub fn on_focus_gained(
    ev: On<FocusGained>,
    bridge: ResMut<JsBridge>,
    editables: Query<&RNode, With<EditableText>>,
    mut focus_states: Query<&mut FocusState>,
) {
    set_focus_state(&mut focus_states, ev.entity, true);
    emit_focus_event(&bridge, &editables, ev.entity, "focus");
}

/// See [`on_focus_gained`]; the blur counterpart.
pub fn on_focus_lost(
    ev: On<FocusLost>,
    bridge: ResMut<JsBridge>,
    editables: Query<&RNode, With<EditableText>>,
    mut focus_states: Query<&mut FocusState>,
) {
    set_focus_state(&mut focus_states, ev.entity, false);
    emit_focus_event(&bridge, &editables, ev.entity, "blur");
}

/// Set a node's [`FocusState`] (if it has one), nudging change-detection only when
/// the value actually flips so `apply_interaction_styles` re-merges just on change.
fn set_focus_state(focus_states: &mut Query<&mut FocusState>, entity: Entity, focused: bool) {
    if let Ok(mut state) = focus_states.get_mut(entity)
        && state.0 != focused
    {
        state.0 = focused;
    }
}

fn emit_focus_event(
    bridge: &JsBridge,
    editables: &Query<&RNode, With<EditableText>>,
    entity: Entity,
    kind: &str,
) {
    let Ok(rnode) = editables.get(entity) else {
        return;
    };
    if !bridge.editable_focus_handlers.contains(&rnode.0) {
        return;
    }
    let _ = bridge.outbound_tx.send(Outbound::UiEvent {
        event: UiEvent {
            id: rnode.0,
            kind: kind.to_string(),
            ..default()
        },
    });
}

/// Apply controlled selections queued by [`queue_pending_selection`] to the live
/// `EditableText`. Runs after Bevy's text-edit pass so offsets resolve against the
/// text applied this frame. Pre-writes the last-emitted selection so the
/// `TextEditChange` this triggers doesn't echo back to JS as a `"select"`.
pub fn apply_pending_selections(
    mut bridge: ResMut<JsBridge>,
    mut editables: Query<&mut EditableText>,
    mut font_cx: ResMut<FontCx>,
    mut layout_cx: ResMut<LayoutCx>,
) {
    if bridge.editable_pending_selection.is_empty() {
        return;
    }
    let pending: Vec<(NodeId, (usize, usize))> =
        bridge.editable_pending_selection.drain().collect();
    for (id, (start, end)) in pending {
        let Some(&entity) = bridge.nodes.get(&id) else {
            continue;
        };
        let Ok(mut editable) = editables.get_mut(entity) else {
            continue;
        };
        // Suppress the echoed `"select"` (anchor=start, focus=end after the write).
        bridge.editable_selections.insert(id, (start, end));
        editable
            .editor_mut()
            .driver(&mut font_cx.context, &mut layout_cx.0)
            .select_byte_range(start, end);
    }
}

/// Keep each `editableText`'s accessibility node's value in step with its text, so
/// screen readers announce the current content. Label/role are set on spawn (and
/// the label refreshed on update) in [`apply_js_ops`].
pub fn sync_editable_a11y(
    mut q: Query<(&EditableText, &mut AccessibilityNode), Changed<EditableText>>,
) {
    for (editable, mut node) in &mut q {
        node.set_value(editable.value().to_string());
    }
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
                ..default()
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
/// `Interaction` or `FocusState` changed (hover/press/focus in or out) — or whose
/// variants changed from a React re-render. The interaction axis: `None` → base,
/// `Hovered` → base+hover, `Pressed` → base+hover+press; then `focus` overlays last
/// (so an explicit `focusStyle` wins on conflicting fields). Both `Interaction` and
/// `FocusState` are optional — a focus-only `editableText` has no `Interaction`, and
/// a hover-only node has no `FocusState`. Runs entirely on the Bevy side: no
/// round-trip to JS, no React re-render on mouse move or focus change.
#[allow(clippy::type_complexity)]
pub fn apply_interaction_styles(
    mut commands: Commands,
    query: Query<
        (
            Entity,
            Option<&Interaction>,
            Option<&FocusState>,
            &StyleVariants,
        ),
        Or<(
            Changed<Interaction>,
            Changed<FocusState>,
            Changed<StyleVariants>,
        )>,
    >,
) {
    for (entity, interaction, focus, variants) in &query {
        let mut style = match interaction {
            Some(Interaction::Pressed) => overlay_style(
                &overlay_style(&variants.base, &variants.hover),
                &variants.press,
            ),
            Some(Interaction::Hovered) => overlay_style(&variants.base, &variants.hover),
            _ => variants.base.clone(),
        };
        if focus.is_some_and(|f| f.0) {
            style = overlay_style(&style, &variants.focus);
        }
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
            ..default()
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

    /// Spin up a minimal app wired to `apply_js_ops`, returning the app and the
    /// op sender (the outbound receiver is leaked to keep the sender open).
    fn op_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_asset::<TextureAtlasLayout>();
        app.init_resource::<Fonts>();
        app.init_resource::<OpApplyStats>();
        app.init_resource::<AtlasLayoutCache>();
        // `apply_js_ops` reads the `filter` material assets/cache + white pixel.
        app.init_asset::<FilterMaterial>();
        app.init_resource::<FilterMaterialCache>();
        app.add_systems(Startup, crate::filter::init_filter_assets);

        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        std::mem::forget(out_rx); // keep the channel open for the test's lifetime
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_systems(Update, apply_js_ops);
        (app, ops_tx)
    }

    /// A plain `<node onClick>` — no hover/press style, not a `<button>` — must get
    /// an `Interaction` so [`collect_ui_events`] can report its clicks. Regression:
    /// `onClick` crossed the wire as a bool but nothing attached an `Interaction`,
    /// so such a node was silently unclickable (only a `<button>`, or a node that
    /// also had a hover/press style or an `onPointer*` handler, worked).
    #[test]
    fn node_onclick_attaches_interaction() {
        let (mut app, ops_tx) = op_app();

        ops_tx
            .send(vec![
                // 1: a bare onClick node — the case that was broken.
                Op::Create {
                    id: 1,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({ "onClick": true })).unwrap(),
                    text: None,
                },
                // 2: a node with no interaction props at all — must stay inert.
                Op::Create {
                    id: 2,
                    kind: "node".into(),
                    props: Props::default(),
                    text: None,
                },
            ])
            .unwrap();
        app.update();

        let nodes = &app.world().resource::<JsBridge>().nodes;
        let (clickable, inert) = (nodes[&1], nodes[&2]);
        assert!(
            app.world().entity(clickable).get::<Interaction>().is_some(),
            "`onClick` alone must make a <node> clickable"
        );
        assert!(
            app.world().entity(inert).get::<Interaction>().is_none(),
            "a node with no handlers/hover/press must not gain an Interaction"
        );
    }

    /// `FocusPolicy` defaults differ by element kind: a `<button>` captures the
    /// pointer (`Block`, mirroring bevy_ui's native `Button`), while a `<node>`
    /// passes it through (`Pass`), so a container/label never swallows clicks meant
    /// for what's behind it. An explicit `focusPolicy` prop overrides either, and
    /// re-rendering a button keeps its `Block` (the per-commit `apply_style` resets
    /// it to `Pass` first).
    #[test]
    fn focus_policy_defaults_block_button_pass_node() {
        let (mut app, ops_tx) = op_app();

        let node_props =
            |json: serde_json::Value| -> Props { serde_json::from_value(json).unwrap() };
        ops_tx
            .send(vec![
                // 1: bare button → Block default.
                Op::Create {
                    id: 1,
                    kind: "button".into(),
                    props: Props::default(),
                    text: None,
                },
                // 2: bare node → Pass default.
                Op::Create {
                    id: 2,
                    kind: "node".into(),
                    props: Props::default(),
                    text: None,
                },
                // 3: button with explicit focusPolicy "pass" → overrides the default.
                Op::Create {
                    id: 3,
                    kind: "button".into(),
                    props: node_props(serde_json::json!({ "style": { "focusPolicy": "pass" } })),
                    text: None,
                },
            ])
            .unwrap();
        app.update();

        let fp = |app: &App, id: u32| -> Option<FocusPolicy> {
            let e = app.world().resource::<JsBridge>().nodes[&id];
            app.world().entity(e).get::<FocusPolicy>().copied()
        };
        assert_eq!(
            fp(&app, 1),
            Some(FocusPolicy::Block),
            "button defaults to Block"
        );
        assert_eq!(
            fp(&app, 2),
            Some(FocusPolicy::Pass),
            "node defaults to Pass"
        );
        assert_eq!(
            fp(&app, 3),
            Some(FocusPolicy::Pass),
            "explicit focusPolicy overrides the button default"
        );

        // Re-render the bare button: `apply_style` resets to `Pass`, but the button
        // default must be re-asserted so it stays `Block`.
        ops_tx
            .send(vec![Op::Update {
                id: 1,
                props: Props::default(),
            }])
            .unwrap();
        app.update();
        assert_eq!(
            fp(&app, 1),
            Some(FocusPolicy::Block),
            "a re-rendered button keeps its Block default"
        );
    }

    /// A `<text>` root's `transform`/`transition` must update on re-render — not
    /// just at mount. Regression: the text-update branch skipped `apply_style`, so
    /// a rotating chevron's target never changed and the animation never ran.
    #[test]
    fn text_update_reapplies_transform_target() {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_asset::<TextureAtlasLayout>();
        app.init_resource::<Fonts>();
        app.init_resource::<OpApplyStats>();
        app.init_resource::<AtlasLayoutCache>();
        // `apply_js_ops` reads the `filter` material assets/cache + white pixel.
        app.init_asset::<FilterMaterial>();
        app.init_resource::<FilterMaterialCache>();
        app.add_systems(Startup, crate::filter::init_filter_assets);

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
        app.init_asset::<TextureAtlasLayout>();
        app.init_resource::<Fonts>();
        app.init_resource::<OpApplyStats>();
        app.init_resource::<AtlasLayoutCache>();
        // `apply_js_ops` reads the `filter` material assets/cache + white pixel.
        app.init_asset::<FilterMaterial>();
        app.init_resource::<FilterMaterialCache>();
        app.add_systems(Startup, crate::filter::init_filter_assets);
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

    /// A node created with a controlled `scrollTop` gets that `ScrollPosition`; an
    /// `onScroll` node gets a `ScrollListener` and is seeded in the dedup map (at
    /// `ZERO` when uncontrolled) so its mount-frame change doesn't echo back.
    #[test]
    fn controlled_scroll_create_sets_position_and_listener() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![
                // controlled offset + an onScroll handler.
                Op::Create {
                    id: 1,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({
                        "scrollTop": 50.0, "onScroll": true,
                        "style": { "overflowY": "scroll" }
                    }))
                    .unwrap(),
                    text: None,
                },
                // listener only (read-only scroll): seeded at ZERO.
                Op::Create {
                    id: 2,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({ "onScroll": true })).unwrap(),
                    text: None,
                },
                // controlled only, no handler → no marker.
                Op::Create {
                    id: 3,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({ "scrollTop": 30.0 }))
                        .unwrap(),
                    text: None,
                },
            ])
            .unwrap();
        app.update();

        let nodes = app.world().resource::<JsBridge>().nodes.clone();
        let (e1, e2, e3) = (nodes[&1], nodes[&2], nodes[&3]);

        assert_eq!(
            app.world().entity(e1).get::<ScrollPosition>().unwrap().0,
            Vec2::new(0.0, 50.0)
        );
        assert!(app.world().entity(e1).get::<ScrollListener>().is_some());
        assert!(app.world().entity(e2).get::<ScrollListener>().is_some());
        assert!(
            app.world().entity(e3).get::<ScrollListener>().is_none(),
            "a controlled node with no onScroll must not be marked"
        );

        let bridge = app.world().resource::<JsBridge>();
        assert_eq!(bridge.scroll_positions.get(&1), Some(&Vec2::new(0.0, 50.0)));
        assert_eq!(bridge.scroll_positions.get(&2), Some(&Vec2::ZERO));
        assert_eq!(bridge.scroll_positions.get(&3), Some(&Vec2::new(0.0, 30.0)));
    }

    /// A controlled `scrollTop` past the scrollable range clamps the written
    /// `ScrollPosition` to the max, while recording the *requested* value so the
    /// read-back can correct React's controlled state down to the real max.
    #[test]
    fn controlled_scroll_update_clamps_to_range() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "onScroll": true, "style": { "overflowY": "scroll" }
                }))
                .unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();

        let e1 = app.world().resource::<JsBridge>().nodes[&1];
        // A laid-out size with real range: content 300, view 100 → max scroll 200.
        app.world_mut().entity_mut(e1).insert(ComputedNode {
            size: Vec2::new(200.0, 100.0),
            content_size: Vec2::new(200.0, 300.0),
            inverse_scale_factor: 1.0,
            ..default()
        });

        ops_tx
            .send(vec![Op::Update {
                id: 1,
                props: serde_json::from_value(serde_json::json!({
                    "onScroll": true, "scrollTop": 10000.0,
                    "style": { "overflowY": "scroll" }
                }))
                .unwrap(),
            }])
            .unwrap();
        app.update();

        assert_eq!(
            app.world().entity(e1).get::<ScrollPosition>().unwrap().0,
            Vec2::new(0.0, 200.0),
            "the written offset is clamped to the scrollable range"
        );
        assert_eq!(
            app.world().resource::<JsBridge>().scroll_positions.get(&1),
            Some(&Vec2::new(0.0, 10000.0)),
            "the requested (pre-clamp) value is recorded so the read-back can correct React"
        );
    }

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

    /// With a `transition: { scroll }`, a controlled `scrollTop` change sets the eased
    /// `ScrollTransitionState` target instead of snapping `ScrollPosition` — the drive
    /// system (not exercised here) moves the offset toward it.
    #[test]
    fn controlled_scroll_with_transition_sets_target_not_position() {
        let (mut app, ops_tx) = op_app();
        let style = serde_json::json!({
            "overflowY": "scroll", "transition": { "scroll": { "duration": 300 } }
        });
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({ "style": style })).unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();

        let e1 = app.world().resource::<JsBridge>().nodes[&1];
        // A real scroll range so the target isn't clamped away (content 300, view 100).
        app.world_mut().entity_mut(e1).insert(ComputedNode {
            size: Vec2::new(200.0, 100.0),
            content_size: Vec2::new(200.0, 300.0),
            inverse_scale_factor: 1.0,
            ..default()
        });

        ops_tx
            .send(vec![Op::Update {
                id: 1,
                props: serde_json::from_value(
                    serde_json::json!({ "scrollTop": 80.0, "style": style }),
                )
                .unwrap(),
            }])
            .unwrap();
        app.update();

        assert_eq!(
            app.world().entity(e1).get::<ScrollPosition>().unwrap().0,
            Vec2::ZERO,
            "a controlled change with a scroll transition must not snap the offset"
        );
        assert_eq!(
            app.world()
                .entity(e1)
                .get::<ScrollTransitionState>()
                .unwrap()
                .target,
            Vec2::new(0.0, 80.0),
            "it sets the eased target instead"
        );
    }
}
