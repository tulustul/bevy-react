//! The op-apply system: [`apply_js_ops`] drains reconciler op batches and
//! mutates the UI tree. Lifecycle/hierarchy arms (Reset, Append, Insert,
//! Remove, UpdateText, Draw) live inline here; the two big arms are
//! `create::apply_create` and `update::apply_update`.

use bevy::a11y::AccessibilityNode;
use bevy::image::Image;
use bevy::platform::collections::HashSet;
use bevy::prelude::*;
use bevy::text::EditableText;
use bevy::ui::{ComputedNode, ScrollPosition};

use super::stats::{FlushMeta, OpApplyStats, UiAssets};
use super::{create, update};
use crate::bridge::{JsBridge, RNode, SpanKind};
use crate::canvas::CanvasSurface;
use crate::plugin::Fonts;
use crate::protocol::{NodeId, Op, ROOT_ID};
use crate::transition::ScrollTransitionState;

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
    // commits from leaking a `TextureAtlasLayout` per frame (see `AtlasLayoutCache`),
    // bundled into one `SystemParam` so `apply_js_ops` stays within Bevy's
    // 16-param limit.
    mut ui_assets: UiAssets,
    children: Query<&Children>,
    rnodes: Query<&RNode>,
    // On re-render the entity's kind isn't on the op, so we detect a `<button>` by
    // its marker to keep re-asserting its `FocusPolicy::Block` default (see
    // `stamps::apply_button_focus_default`) that the per-commit `apply_style`
    // resets to `Pass`.
    buttons: Query<(), With<Button>>,
    // The persistent world-anchor overlay layer (a child of the root). It is
    // infrastructure, not a reconciler node, so `Op::Reset` must preserve it and
    // the end-of-batch hierarchy rebuild must keep it in the root's children.
    anchor_layer: Query<Entity, With<crate::anchor::AnchorLayer>>,
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
    // The stamp + origin-flag side channels; absent in headless unit tests
    // (stamps also stay empty on web). See [`FlushMeta`].
    #[cfg_attr(target_arch = "wasm32", allow(unused_variables))] meta: FlushMeta,
) {
    // Drain all pending batches first so we don't hold an immutable borrow of
    // `bridge` while mutating `bridge.nodes` below.
    let mut ops: Vec<Op> = Vec::new();
    #[cfg_attr(target_arch = "wasm32", allow(unused_mut, unused_variables))]
    let mut batches = 0usize;
    while let Ok(batch) = bridge.ops_rx.try_recv() {
        ops.extend(batch);
        batches += 1;
    }
    if ops.is_empty() {
        return;
    }
    let op_count = ops.len();
    #[cfg(not(target_arch = "wasm32"))]
    let started = std::time::Instant::now();
    // One stamp per received batch (aligned FIFOs — see `FlushStamps`); the
    // OLDEST is when the earliest coalesced batch entered the channel.
    #[cfg(not(target_arch = "wasm32"))]
    let first_stamp = meta.stamps.as_ref().and_then(|stamps| {
        let mut first = None;
        for _ in 0..batches {
            if let Ok(stamp) = stamps.0.try_recv() {
                first.get_or_insert(stamp);
            }
        }
        first
    });
    // One origin flag per received batch (aligned FIFOs — see [`FlushFlags`]);
    // any non-devtools flush makes this an APP apply. A missing channel
    // (headless tests) or a missing flag counts as app.
    let any_app = match &meta.flags {
        Some(flags) => {
            let mut any_app = false;
            for _ in 0..batches {
                match flags.0.try_recv() {
                    Ok(devtools) => any_app |= !devtools,
                    Err(_) => any_app = true,
                }
            }
            any_app
        }
        None => true,
    };
    debug!("applying {op_count} reconciler op(s)");

    // Parents whose child ORDER diverged from the ECS this batch (same-parent
    // re-appends and every `Insert`); they get one `replace_children` after the
    // loop instead of a per-op O(siblings) splice — mass reorders are O(ops) +
    // one O(children) rebuild, not quadratic. First-time attaches still queue an
    // O(1) `add_child` per op (a same-batch ancestor removal must reach the child
    // recursively), and removals don't dirty their parent at all: despawn's
    // relationship cleanup drops the child from `Children` preserving the order
    // of the rest.
    let mut dirty: HashSet<NodeId> = HashSet::new();

    for op in ops {
        match op {
            Op::Reset => {
                stats.reset_count += 1;
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
                // Detached roots (`<surface>`/`<root>`) aren't under `root`, so the
                // child-despawn above misses them. On a cold reload the old React
                // tree is discarded without unmount lifecycle (no
                // `detachDeletedInstance`), so despawn them here too — otherwise a
                // stale surface subtree keeps rendering into its texture, and a
                // stale `<root>` stays on screen.
                for id in bridge.surfaces.iter().chain(bridge.roots.iter()) {
                    if let Some(&e) = bridge.nodes.get(id) {
                        commands.entity(e).despawn();
                    }
                }
                bridge.nodes.retain(|&id, _| id == ROOT_ID);
                bridge.props_cache.clear();
                bridge.text_styles.clear();
                bridge.spans.clear();
                bridge.editable_inputs.clear();
                bridge.surfaces.clear();
                bridge.roots.clear();
                bridge.foreign_images.clear();
                bridge.svg_roots.clear();
                bridge.shapes.clear();
                bridge.editable_values.clear();
                bridge.editable_selections.clear();
                bridge.editable_select_handlers.clear();
                bridge.editable_focus_handlers.clear();
                bridge.editable_pending_selection.clear();
                bridge.scroll_positions.clear();
                // The root persists but its children were just despawned; the shadow
                // tree is fully rebuilt by the ops that follow. Drop any pre-reset
                // dirty parents too — the reloaded app re-uses node ids, and its own
                // ops re-dirty whatever it rebuilds.
                bridge.siblings.clear();
                bridge.child_list.clear();
                bridge.parent_of.clear();
                bridge.surface_parent.clear();
                bridge.child_surfaces.clear();
                dirty.clear();
            }
            Op::Create {
                id,
                kind,
                props,
                text,
            } => {
                create::apply_create(
                    &mut commands,
                    &mut bridge,
                    &assets,
                    &fonts,
                    &mut images,
                    &mut ui_assets,
                    id,
                    kind,
                    props,
                    text,
                );
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
                bridge.spans.insert(id, SpanKind::RawInherited);
            }
            Op::Append { parent, child } => {
                // A `<surface>`/`<root>` is a detached UI root: never parent it into
                // the on-screen hierarchy (a surface renders to its own offscreen
                // camera; a `<root>` is an independent screen-space tree). Its own
                // children attach to it normally via their own Append ops. Record
                // its React parent so removing an ancestor can despawn this detached
                // root (Bevy's recursive despawn never reaches it).
                if bridge.is_detached_root(child) {
                    bridge.attach_surface(child, parent);
                    continue;
                }
                if let (Some(p), Some(c)) = (resolve(&bridge, parent), resolve(&bridge, child)) {
                    let same_parent = bridge.parent_of.get(&child) == Some(&parent);
                    // Child count may cross 0↔1+: re-evaluate the parent's layer
                    // promotion (see `crate::layer`). The attach also changes the
                    // parent's rendered content → re-capture its layer.
                    bridge.layer_dirty.insert(parent);
                    crate::layer::mark_content_dirty(&mut commands.entity(p));
                    bridge.append_child(parent, child);
                    if same_parent {
                        // Re-append = move to the end: an O(1) shadow reorder, synced
                        // to the ECS by the end-of-batch rebuild.
                        dirty.insert(parent);
                    } else {
                        // Fresh node (or cross-parent move): attach in the ECS NOW —
                        // a same-batch removal of an ancestor must be able to despawn
                        // it recursively; deferring the attach would leak it as an
                        // orphaned window-UI root. `add_child` appends, matching the
                        // shadow tail (so no rebuild is needed), and a cross-parent
                        // `add_child` also detaches from the old ECS parent via the
                        // relationship hooks.
                        commands.entity(p).add_child(c);
                    }
                    inherit_text_style(&mut commands, &bridge, parent, child, c);
                }
            }
            Op::Insert {
                parent,
                child,
                before,
            } => {
                // A detached root (`<surface>`/`<root>`) is never parented (see
                // `Op::Append`), but still record its React parent for
                // ancestor-removal cleanup.
                if bridge.is_detached_root(child) {
                    bridge.attach_surface(child, parent);
                    continue;
                }
                // Ordered insertion: place `child` at `before`'s position. The live
                // `Children` can't be read here (commands queued earlier in this same
                // batch haven't applied), so the shadow tree is the ordering truth and
                // the ECS position is fixed up by the end-of-batch rebuild of the
                // (always dirty) parent. A missing `before` falls back to appending.
                if let (Some(p), Some(c)) = (resolve(&bridge, parent), resolve(&bridge, child)) {
                    let same_parent = bridge.parent_of.get(&child) == Some(&parent);
                    // Child count may cross 0↔1+: re-evaluate the parent's layer
                    // promotion (see `crate::layer`). The attach also changes the
                    // parent's rendered content → re-capture its layer.
                    bridge.layer_dirty.insert(parent);
                    crate::layer::mark_content_dirty(&mut commands.entity(p));
                    bridge.insert_before(parent, child, before);
                    if !same_parent {
                        // Fresh/cross-parent: attach NOW (at the end — the rebuild
                        // moves it into place); see `Op::Append` for why deferring
                        // the attach itself would leak on same-batch removal.
                        commands.entity(p).add_child(c);
                    }
                    dirty.insert(parent);
                    inherit_text_style(&mut commands, &bridge, parent, child, c);
                }
            }
            Op::Remove { parent, child } => {
                // Losing its last child demotes a promoted parent: re-evaluate.
                // The removal also changes the parent's rendered content →
                // re-capture its layer.
                bridge.layer_dirty.insert(parent);
                if let Some(p) = resolve(&bridge, parent) {
                    crate::layer::mark_content_dirty(&mut commands.entity(p));
                }
                // React emits `Remove` only for the subtree's top node, and Bevy
                // despawns that node recursively — but a `<surface>`/`<root>` nested
                // under it is a detached root (no `ChildOf`), so neither reaches it.
                // Despawn every detached root at/under `child` (incl. `child` itself
                // if it is one) before the recursive despawn below; otherwise the
                // orphan keeps rendering (a surface into its often-shared texture, a
                // `<root>` straight onto the screen).
                let mut surfaces = bridge.surfaces_under(child);
                if bridge.is_detached_root(child) {
                    bridge.detach_surface(child);
                    surfaces.push(child);
                }
                for s in surfaces {
                    if let Some(se) = resolve(&bridge, s) {
                        commands.entity(se).despawn();
                    }
                    // `forget_subtree` prunes `s` *and* the content rendered inside it
                    // (its `child_order` subtree) from every per-node side-table.
                    bridge.detach(s);
                    bridge.forget_subtree(s);
                }

                if let Some(c) = resolve(&bridge, child) {
                    commands.entity(c).despawn();
                    // Unlink from the parent's ordered list, then drop the whole subtree
                    // from the shadow tree — `forget_subtree` prunes `child` and every
                    // despawned descendant from all per-node side-tables, so no stale
                    // `NodeId → Entity` handles linger until the next `Reset`.
                    bridge.detach(child);
                    bridge.forget_subtree(child);
                }
            }
            Op::Update {
                id,
                props,
                unset,
                style_unset,
            } => {
                update::apply_update(
                    &mut commands,
                    &mut bridge,
                    &assets,
                    &fonts,
                    &mut ui_assets,
                    &children,
                    &rnodes,
                    &buttons,
                    &mut editables,
                    &mut scroll_query,
                    &mut a11y_nodes,
                    &text_roots,
                    id,
                    props,
                    unset,
                    style_unset,
                );
            }
            Op::UpdateText { id, text } => {
                if let Some(e) = resolve(&bridge, id) {
                    // A run is either a standalone `Text` or, inside a `<text>`, a
                    // `TextSpan` — update whichever this entity is.
                    if bridge.spans.contains_key(&id) {
                        commands.entity(e).insert(TextSpan(text));
                    } else {
                        commands.entity(e).insert(Text::new(text));
                    }
                    // Belt: the reshape watcher (`Changed<TextLayoutInfo>`)
                    // catches this too, but only once Bevy re-shapes.
                    crate::layer::mark_content_dirty(&mut commands.entity(e));
                }
            }
            Op::Draw { id, cmds } => {
                // Imperative canvas drawing (a handle's microtask flush) or the
                // runtime's declarative replay after a resize: append to the
                // retained surface. A missing node (already unmounted, stale
                // handle) is skipped silently, like every other op. Queued so a
                // same-batch `Create`'s deferred `CanvasSurface` insert lands
                // first.
                if let Some(e) = resolve(&bridge, id) {
                    commands.entity(e).queue(move |mut entity: EntityWorldMut| {
                        if let Some(mut surface) = entity.get_mut::<CanvasSurface>() {
                            surface.enqueue(cmds);
                        }
                    });
                }
            }
        }
    }

    // Sync the ECS hierarchy: one `replace_children` per parent whose child list
    // changed this batch (Bevy diffs — kept children get no `ChildOf` rewrite, the
    // order becomes exactly the slice's). Skipping unresolvable parents guards the
    // despawned-entity panic: anything removed (or wiped by `Reset`) mid-batch was
    // pruned from `bridge.nodes` by `forget_subtree`.
    for parent in dirty {
        let Some(p) = resolve(&bridge, parent) else {
            continue;
        };
        let mut list: Vec<Entity> = Vec::new();
        // The AnchorLayer is a Rust-side child of the root, invisible to the shadow
        // tree — keep it as the first child (its spawn-time position; overlays are
        // lifted by `GlobalZIndex`, not sibling order). Without this, the root's
        // rebuild would strip its `ChildOf`.
        if parent == ROOT_ID
            && let Ok(layer) = anchor_layer.single()
        {
            list.push(layer);
        }
        list.extend(
            bridge
                .children_of(parent)
                .filter_map(|id| resolve(&bridge, id)),
        );
        // Note: an anchored overlay under `parent` gets `ChildOf(parent)` re-asserted
        // here (its live parent is the AnchorLayer) — same as the old per-op
        // `insert_child` path; the anchor system self-heals it next frame.
        commands.entity(p).replace_children(&list);
    }

    // Record this batch for live instrumentation (see [`OpApplyStats`]).
    stats.applied_count = stats.applied_count.wrapping_add(1);
    if any_app {
        stats.app_applied_count = stats.app_applied_count.wrapping_add(1);
    }
    stats.last_ops = op_count;
    #[cfg(not(target_arch = "wasm32"))]
    {
        let end = std::time::Instant::now();
        let (wait, pre) = first_stamp
            .map(|stamp| {
                super::stats::split_pre_apply(stamp, meta.frame.as_ref().and_then(|f| f.0), started)
            })
            .unwrap_or_default();
        stats.last_frame_wait = wait;
        stats.last_pre_apply = pre;
        stats.last_translate = end.duration_since(started);
        stats.last_apply_end = Some(end);
    }
}

/// When a bare-string run is appended into a `<text>`, copy the parent's text
/// style onto it (Bevy has no text-style inheritance, and the parent's freshly
/// queued components aren't yet visible to an ECS query this frame).
// TODO(review): this hand-rolled CSS-style text inheritance (here + the O(children)
// re-propagation loop in the `<text>` branch of `update::apply_update`) is a complexity
// hotspot. It's likely unavoidable until Bevy grows real text-style inheritance, but
// worth watching as the text model grows.
fn inherit_text_style(
    commands: &mut Commands,
    bridge: &JsBridge,
    parent: NodeId,
    child: NodeId,
    child_entity: Entity,
) {
    if bridge.spans.get(&child) != Some(&SpanKind::RawInherited) {
        return;
    }
    if let Some(style) = bridge.text_styles.get(&parent).cloned() {
        commands.entity(child_entity).insert(style);
    }
}

pub(super) fn resolve(bridge: &JsBridge, id: NodeId) -> Option<Entity> {
    bridge.nodes.get(&id).copied()
}

#[cfg(test)]
mod tests {
    use super::super::test_util::{children_of, create_node, ent, ordering_app};
    use super::*;
    use crate::protocol::Props;

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

    /// One batch mixing all three structural ops on the same parent: append a new
    /// child, move an existing one, remove another. The end-of-batch rebuild must
    /// produce the final order in one `replace_children`, with the removed child's
    /// despawn applied first.
    #[test]
    fn mixed_batch_orders_correctly() {
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

        // [2,3,4] → append 5 → move 4 before 2 → remove 3 ⇒ [4,2,5].
        tx.send(vec![
            create_node(5),
            Op::Append {
                parent: 1,
                child: 5,
            },
            Op::Insert {
                parent: 1,
                child: 4,
                before: 2,
            },
            Op::Remove {
                parent: 1,
                child: 3,
            },
        ])
        .unwrap();
        app.update();

        let parent = ent(&app, 1);
        assert_eq!(
            children_of(&app, parent),
            vec![ent(&app, 4), ent(&app, 2), ent(&app, 5)],
            "append + move + remove in one batch must land as [4, 2, 5]"
        );
    }

    /// Moving a child to a DIFFERENT parent in one batch: the old `ChildOf` must be
    /// dropped eagerly (the rebuild's `replace_children` skips relationship hooks for
    /// the entities it adds), or the child would linger in the old parent's
    /// `Children`.
    #[test]
    fn move_between_parents_in_one_batch() {
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            create_node(1), // parent A
            create_node(2), // parent B
            create_node(3),
            create_node(4),
            create_node(5),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            Op::Append {
                parent: ROOT_ID,
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
            Op::Append {
                parent: 2,
                child: 5,
            },
        ])
        .unwrap();
        app.update();

        // Move 3 from A to B (append at B's end).
        tx.send(vec![Op::Append {
            parent: 2,
            child: 3,
        }])
        .unwrap();
        app.update();

        let (a, b) = (ent(&app, 1), ent(&app, 2));
        assert_eq!(
            children_of(&app, a),
            vec![ent(&app, 4)],
            "the moved child must leave the old parent's Children"
        );
        assert_eq!(children_of(&app, b), vec![ent(&app, 5), ent(&app, 3)]);
        assert_eq!(
            app.world()
                .entity(ent(&app, 3))
                .get::<ChildOf>()
                .map(|c| c.parent()),
            Some(b),
            "the moved child's ChildOf must point at the new parent"
        );
    }

    /// The `AnchorLayer` is a Rust-side child of the root, invisible to the shadow
    /// tree — a root rebuild must keep it as the first child instead of stripping
    /// its `ChildOf`.
    #[test]
    fn root_rebuild_preserves_anchor_layer() {
        let (mut app, tx, root) = ordering_app();
        let layer = app
            .world_mut()
            .spawn((crate::anchor::AnchorLayer, ChildOf(root)))
            .id();

        tx.send(vec![
            create_node(1),
            create_node(2),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            Op::Append {
                parent: ROOT_ID,
                child: 2,
            },
        ])
        .unwrap();
        app.update();
        assert_eq!(
            children_of(&app, root),
            vec![layer, ent(&app, 1), ent(&app, 2)]
        );

        // Reorder the root's reconciler children; the layer must stay first.
        tx.send(vec![Op::Insert {
            parent: ROOT_ID,
            child: 2,
            before: 1,
        }])
        .unwrap();
        app.update();
        assert_eq!(
            children_of(&app, root),
            vec![layer, ent(&app, 2), ent(&app, 1)],
            "the AnchorLayer must survive root rebuilds as the first child"
        );
    }

    /// The leak regression the demos app exposed: a child created and appended in
    /// the SAME batch that removes its (pre-existing) parent. The attach must be
    /// queued per op — if it were deferred to the end-of-batch rebuild (which skips
    /// removed parents), the recursive despawn couldn't reach the child and it would
    /// survive as an orphaned window-UI root.
    #[test]
    fn same_batch_create_under_removed_parent_despawns() {
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            create_node(1),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
        ])
        .unwrap();
        app.update();

        // One batch: grow the subtree, then remove its root.
        tx.send(vec![
            create_node(2),
            Op::Append {
                parent: 1,
                child: 2,
            },
            Op::Remove {
                parent: ROOT_ID,
                child: 1,
            },
        ])
        .unwrap();
        app.update();

        let survivors = app.world_mut().query::<&RNode>().iter(app.world()).count();
        assert_eq!(
            survivors, 0,
            "the same-batch child must be despawned with its removed parent, not \
             leaked as an orphaned root"
        );
    }

    /// Remove + reorder on the same parent in one batch: the dirty rebuild runs with
    /// a despawned ex-child mid-queue and must not resurrect or panic on it.
    #[test]
    fn remove_then_reorder_same_parent() {
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

        // [2,3,4] → remove 3, then move 4 before 2 ⇒ [4,2].
        tx.send(vec![
            Op::Remove {
                parent: 1,
                child: 3,
            },
            Op::Insert {
                parent: 1,
                child: 4,
                before: 2,
            },
        ])
        .unwrap();
        app.update();

        let parent = ent(&app, 1);
        assert_eq!(children_of(&app, parent), vec![ent(&app, 4), ent(&app, 2)]);
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

    /// `Op::Reset` must despawn detached `<root>`s: they aren't children of the UI
    /// root, so the root-children despawn misses them; a cold reload would otherwise
    /// leave the stale overlay on screen.
    #[test]
    fn reset_despawns_detached_roots() {
        let (mut app, tx, _ui_root) = ordering_app();
        tx.send(vec![
            Op::Create {
                id: 1,
                kind: "root".into(),
                props: Props::default(),
                text: None,
            },
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
        ])
        .unwrap();
        app.update();
        let root_e = ent(&app, 1);

        tx.send(vec![Op::Reset]).unwrap();
        app.update();
        assert!(
            !app.world().entities().contains(root_e),
            "Op::Reset must despawn detached <root>s"
        );
        assert!(
            app.world().resource::<JsBridge>().roots.is_empty(),
            "Op::Reset must clear the roots set"
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

    /// Removing a subtree must forget its *descendants'* per-node bookkeeping, not just
    /// the removed root's. React emits `Remove` only for the top node, and Bevy despawns
    /// the whole subtree recursively — so the bridge's `NodeId`-keyed side-tables would
    /// otherwise keep stale entries for every descendant until the next `Op::Reset`.
    #[test]
    fn remove_subtree_forgets_descendant_node_data() {
        let (mut app, tx, _root) = ordering_app();
        // A plain nested subtree wrapper(1) → mid(2) → leaf(3); `leaf` is an
        // `editableText` so a set-typed side-table (`editable_inputs`) is exercised too.
        tx.send(vec![
            create_node(1),
            create_node(2),
            Op::Create {
                id: 3,
                kind: "editableText".into(),
                props: Props::default(),
                text: None,
            },
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            Op::Append {
                parent: 1,
                child: 2,
            },
            Op::Append {
                parent: 2,
                child: 3,
            },
        ])
        .unwrap();
        app.update();
        let mid = ent(&app, 2);
        let leaf = ent(&app, 3);
        assert!(
            app.world()
                .resource::<JsBridge>()
                .editable_inputs
                .contains(&3),
            "the editableText descendant is tracked before removal"
        );

        // React unmounts the wrapper: a single `Remove` for the top node only.
        tx.send(vec![Op::Remove {
            parent: ROOT_ID,
            child: 1,
        }])
        .unwrap();
        app.update();

        assert!(
            !app.world().entities().contains(mid),
            "the descendant mid node is despawned with the subtree"
        );
        assert!(
            !app.world().entities().contains(leaf),
            "the descendant leaf node is despawned with the subtree"
        );
        let bridge = app.world().resource::<JsBridge>();
        assert!(
            !bridge.nodes.contains_key(&1),
            "the removed root is forgotten"
        );
        assert!(
            !bridge.nodes.contains_key(&2),
            "the descendant mid node id is forgotten (no stale entity handle)"
        );
        assert!(
            !bridge.nodes.contains_key(&3),
            "the descendant leaf node id is forgotten (no stale entity handle)"
        );
        assert!(
            !bridge.editable_inputs.contains(&3),
            "the descendant editableText is dropped from the editable_inputs set"
        );
    }
}
