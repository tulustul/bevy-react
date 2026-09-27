//! The op-apply system: [`apply_js_ops`] drains reconciler op batches and
//! mutates the UI tree. Lifecycle/hierarchy arms (Reset, Append, Insert,
//! Remove, UpdateText) live inline here; the two big arms are
//! `create::apply_create` and `update::apply_update`.

use bevy::image::Image;
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::ui::{ComputedNode, ScrollPosition};

use super::stats::{FlushMeta, OpApplyStats};
use super::{create, update};
use crate::bridge::{JsBridge, ReactNode, SpanKind};
use crate::plugin::Fonts;
use crate::protocol::{NodeId, ROOT_ID, op::Op};
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
    children: Query<&Children>,
    rnodes: Query<&ReactNode>,
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
    // re-appends, cross-parent moves, and `Insert`s of fresh nodes); see
    // [`ParentDirt`] for the two sync strategies. A reorder-heavy parent gets one
    // `replace_children` after the loop instead of a per-op O(siblings) splice —
    // mass reorders are O(ops) + one O(children) rebuild, not quadratic; a parent
    // that only received a few fresh mid-list inserts gets one positional
    // `insert_children` per insert instead. First-time attaches still queue an
    // O(1) `add_child` per op (a same-batch ancestor removal must reach the child
    // recursively), and removals don't dirty their parent at all: despawn's
    // relationship cleanup drops the child from `Children` preserving the order
    // of the rest.
    let mut dirty: HashMap<NodeId, ParentDirt> = HashMap::new();
    // Removed subtree roots this batch as `(parent, entity)`, in op order,
    // despawned after the loop (see there); `removed_under` counts them per
    // parent — a parent shedding [`ParentDirt::MASS_REMOVAL_MIN`] or more gets
    // them detached in one pass — and doubles as the content-dirt dedupe.
    let mut removals: Vec<(NodeId, Entity)> = Vec::new();
    let mut removed_under: HashMap<NodeId, usize> = HashMap::new();

    // Shared-element pairing (see `crate::shared_tags`): plan against the
    // pre-batch shadow tree, then snapshot every outgoing node BEFORE any
    // op's commands (its despawn is queued below, deferred like every
    // command) — the seeds are stamped after the loop, once the incoming
    // entities exist.
    let shared_pairs = crate::shared_tags::plan_pairs(&bridge, &ops);
    for pair in &shared_pairs {
        if let Some(&outgoing) = bridge.nodes.get(&pair.outgoing) {
            let incoming = pair.incoming;
            commands.queue(move |world: &mut World| {
                crate::transition::shared::snapshot_into_pending(world, outgoing, incoming)
            });
        }
    }

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
                        // Only reconciler nodes: infrastructure a feature
                        // parented under the root survives a reload.
                        if rnodes.contains(child) {
                            commands.entity(child).despawn();
                        }
                    }
                }
                // Detached nodes (`<surface>`/`<root>`/`<anchor>`) aren't under
                // `root`, so the child-despawn above misses them. On a cold
                // reload the old React tree is discarded without unmount
                // lifecycle (no `detachDeletedInstance`), so despawn them here
                // too — otherwise a stale surface subtree keeps rendering into
                // its texture, and a stale `<root>` stays on screen.
                for id in bridge.detached.iter() {
                    if let Some(&e) = bridge.nodes.get(id) {
                        commands.entity(e).try_despawn();
                    }
                }
                bridge.nodes.retain(|&id, _| id == ROOT_ID);
                bridge.names.clear();
                bridge.shared_tags.clear();
                commands.queue(crate::transition::shared::clear_pending);
                bridge.props_cache.clear();
                bridge.text_styles.clear();
                bridge.spans.clear();
                bridge.detached.clear();
                bridge.animated.clear();
                bridge.scroll_positions.clear();
                // The root persists but its children were just despawned; the shadow
                // tree is fully rebuilt by the ops that follow. Drop any pre-reset
                // dirty parents too — the reloaded app re-uses node ids, and its own
                // ops re-dirty whatever it rebuilds.
                bridge.siblings.clear();
                bridge.child_list.clear();
                bridge.parent_of.clear();
                bridge.detached_parent.clear();
                bridge.child_detached.clear();
                dirty.clear();
                // The pending despawns stay queued (they tolerate the root
                // sweep above having taken them already), but the counts are
                // keyed by ids the reloaded app re-uses.
                removed_under.clear();
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
                    id,
                    kind,
                    props,
                    text,
                );
            }
            Op::CreateText { id, text } => {
                let entity = commands
                    .spawn((
                        Text::new(text),
                        TextColor(Color::WHITE),
                        ReactNode(id),
                        crate::ext::ElementFlags::NODE,
                    ))
                    .id();
                bridge.nodes.insert(id, entity);
            }
            Op::CreateTextSpan { id, text } => {
                // A bare-string run inside a `<text>`. Style is inherited from its
                // parent on append (see below); until then it keeps span defaults.
                let entity = commands
                    .spawn((
                        TextSpan(text),
                        ReactNode(id),
                        crate::ext::ElementFlags::NODE_LESS,
                    ))
                    .id();
                bridge.nodes.insert(id, entity);
                bridge.spans.insert(id, SpanKind::RawInherited);
            }
            Op::Append { parent, child } => {
                // A detached node is never parented into the on-screen
                // hierarchy by the op path (a surface renders to its own
                // offscreen camera; a `<root>` is an independent screen-space
                // tree; an `<anchor>` lives under the anchor layer). Its own
                // children attach to it normally via their own Append ops.
                // Record its React parent so removing an ancestor can despawn
                // it (Bevy's recursive despawn never reaches it).
                if bridge.is_detached(child) {
                    bridge.attach_detached(child, parent);
                    continue;
                }
                if let (Some(p), Some(c)) = (resolve(&bridge, parent), resolve(&bridge, child)) {
                    let old_parent = bridge.parent_of.get(&child).copied();
                    let same_parent = old_parent == Some(parent);
                    // Child count may cross 0↔1+: re-evaluate the parent's layer
                    // promotion (see `crate::layer`). The attach also changes the
                    // parent's rendered content → re-capture its layer.
                    bridge.layer_dirty.insert(parent);
                    crate::layer::mark_content_dirty(&mut commands.entity(p));
                    bridge.append_child(parent, child);
                    if same_parent {
                        // Re-append = move to the end: an O(1) shadow reorder, synced
                        // to the ECS by the end-of-batch rebuild.
                        ParentDirt::rebuild(&mut dirty, parent);
                    } else {
                        // Leaving the old parent may take a positional insert's
                        // `before` with it: that parent can no longer sync by index.
                        if let Some(old) = old_parent {
                            ParentDirt::escalate(&mut dirty, old);
                        }
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
                // A detached node is never parented (see `Op::Append`), but
                // still record its React parent for ancestor-removal cleanup.
                if bridge.is_detached(child) {
                    bridge.attach_detached(child, parent);
                    continue;
                }
                // Ordered insertion: place `child` at `before`'s position. The live
                // `Children` can't be read here (commands queued earlier in this same
                // batch haven't applied), so the shadow tree is the ordering truth and
                // the ECS position is fixed up after the loop — positionally for a
                // fresh node, by a full rebuild of the parent for a move (see
                // [`ParentDirt`]). A missing `before` falls back to appending.
                if let (Some(p), Some(c)) = (resolve(&bridge, parent), resolve(&bridge, child)) {
                    let old_parent = bridge.parent_of.get(&child).copied();
                    let before_attached = bridge.parent_of.get(&before) == Some(&parent);
                    // Child count may cross 0↔1+: re-evaluate the parent's layer
                    // promotion (see `crate::layer`). The attach also changes the
                    // parent's rendered content → re-capture its layer.
                    bridge.layer_dirty.insert(parent);
                    crate::layer::mark_content_dirty(&mut commands.entity(p));
                    bridge.insert_before(parent, child, before);
                    match old_parent {
                        // Same-parent move: an O(1) shadow reorder, synced to the ECS
                        // by the end-of-batch rebuild.
                        Some(old) if old == parent => ParentDirt::rebuild(&mut dirty, parent),
                        // Cross-parent move: attach NOW (at the end — the rebuild
                        // moves it into place); see `Op::Append` for why deferring
                        // the attach itself would leak on same-batch removal. The old
                        // parent may have lost a positional insert's `before`.
                        Some(old) => {
                            ParentDirt::escalate(&mut dirty, old);
                            commands.entity(p).add_child(c);
                            ParentDirt::rebuild(&mut dirty, parent);
                        }
                        // Fresh node: attach NOW at the end (same leak argument), then
                        // move it before `before` positionally after the loop. When
                        // the shadow fell back to appending, the ECS tail already
                        // matches and nothing is dirty.
                        None => {
                            commands.entity(p).add_child(c);
                            if before_attached {
                                ParentDirt::insert(&mut dirty, parent, child, before);
                            }
                        }
                    }
                    inherit_text_style(&mut commands, &bridge, parent, child, c);
                }
            }
            Op::Remove { parent, child } => {
                // Losing its last child demotes a promoted parent: re-evaluate.
                // The removal also changes the parent's rendered content →
                // re-capture its layer.
                bridge.layer_dirty.insert(parent);
                // One content-dirt push per parent per batch is enough (ids are
                // never re-used within a batch, so the entity is the same).
                let count = removed_under.entry(parent).or_insert(0);
                *count += 1;
                if *count == 1
                    && let Some(p) = resolve(&bridge, parent)
                {
                    crate::layer::mark_content_dirty(&mut commands.entity(p));
                }
                // The removed node may be a positional insert's `before`: the
                // positional command would then find no anchor and leave the
                // inserted child at the tail.
                ParentDirt::escalate(&mut dirty, parent);
                // React emits `Remove` only for the subtree's top node, and Bevy
                // despawns that node recursively — but a detached node nested
                // under it (no `ChildOf` to its React parent) is not reached.
                // Despawn every detached node at/under `child` (incl. `child`
                // itself if it is one) before the recursive despawn below;
                // otherwise the orphan keeps rendering (a surface into its
                // often-shared texture, a `<root>` straight onto the screen).
                let mut detached = bridge.detached_under(child);
                if bridge.is_detached(child) {
                    bridge.detach_detached(child);
                    detached.push(child);
                }
                for s in detached {
                    if let Some(se) = resolve(&bridge, s) {
                        commands.entity(se).despawn();
                    }
                    // `forget_subtree` prunes `s` *and* the content rendered inside it
                    // (its `child_order` subtree) from every per-node side-table.
                    bridge.detach(s);
                    bridge.forget_subtree(s);
                }

                if let Some(c) = resolve(&bridge, child) {
                    // The despawn is queued after the loop (see `removals`); a
                    // same-batch attach under `child` has landed by then, so the
                    // recursive despawn still reaches it.
                    removals.push((parent, c));
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
                    &children,
                    &rnodes,
                    &mut scroll_query,
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
        }
    }
    for pair in shared_pairs {
        let id = pair.incoming;
        match bridge.nodes.get(&id) {
            Some(&incoming) => commands.queue(move |world: &mut World| {
                crate::transition::shared::stamp_pending(world, id, incoming)
            }),
            // The incoming node died within this same batch: nothing to
            // stamp, so the parked seed must not linger.
            None => commands.queue(move |world: &mut World| {
                crate::transition::shared::discard_pending(world, id)
            }),
        }
    }

    // Sync the ECS hierarchy. An insert-only parent gets one positional
    // `insert_children` per fresh child (its `before` is located in the live
    // `Children` when the command applies — every earlier command of this batch,
    // including the child's own tail attach and any same-batch `before`'s
    // placement, has landed by then); every other dirty parent gets one
    // `replace_children` (Bevy diffs — kept children get no `ChildOf` rewrite, the
    // order becomes exactly the slice's). Skipping unresolvable parents guards the
    // despawned-entity panic: anything removed (or wiped by `Reset`) mid-batch was
    // pruned from `bridge.nodes` by `forget_subtree`.
    for (&parent, dirt) in &dirty {
        let Some(p) = resolve(&bridge, parent) else {
            continue;
        };
        if let ParentDirt::InsertsOnly(inserts) = dirt
            && let Some(planned) = inserts
                .iter()
                .map(|&(child, before)| Some((resolve(&bridge, child)?, resolve(&bridge, before)?)))
                .collect::<Option<Vec<_>>>()
        {
            for (c, b) in planned {
                commands.entity(p).queue(move |mut parent: EntityWorldMut| {
                    let Some(index) = parent
                        .get::<Children>()
                        .and_then(|kids| kids.iter().position(|e| e == b))
                    else {
                        return;
                    };
                    // Already `ChildOf(parent)` (attached at op time): this moves it
                    // from the tail to `before`'s slot, shifting the rest right.
                    parent.insert_children(index, &[c]);
                });
            }
            continue;
        }
        let list: Vec<Entity> = bridge
            .children_of(parent)
            .filter_map(|id| resolve(&bridge, id))
            .collect();
        commands.entity(p).replace_children(&list);
    }

    // Despawn the removed subtrees (recursively). Despawn's relationship
    // cleanup drops the child from its parent's `Children` by a scan from the
    // BACK plus a `Vec::remove` memmove of what follows, and React emits a
    // commit's deletions in child order — front to back, so applied as-is every
    // scan is a full one and k removals out of N siblings cost O(k·N) (a
    // 10k-row `clear` spent ~57 ms there). Two measures: the despawns go in
    // REVERSE op order, so each removed child is the last one still attached
    // (a `clear` is O(N); a removal of every other child scans only the
    // survivors between it and the tail), and a parent shedding
    // `MASS_REMOVAL_MIN`+ children — unless a rebuild above already detached
    // them — has its children detached in one pass by [`despawn_detached`].
    // Nothing here orders against the other commands: the removed subtrees are
    // disjoint from the rest of the batch (ids are never re-used, a same-batch
    // attach under one of them has landed by now), and a subtree an earlier
    // removal already covered, or a same-batch `Reset` swept, is skipped.
    let mut mass: HashMap<NodeId, (Entity, Vec<Entity>)> = HashMap::new();
    for (parent, e) in removals.into_iter().rev() {
        // (A same-batch `Reset` cleared the counts: those go the plain way.)
        if removed_under.get(&parent).copied().unwrap_or(0) >= ParentDirt::MASS_REMOVAL_MIN
            && !dirty.contains_key(&parent)
            && let Some(p) = resolve(&bridge, parent)
        {
            mass.entry(parent)
                .or_insert_with(|| (p, Vec::new()))
                .1
                .push(e);
        } else {
            commands.entity(e).try_despawn();
        }
    }
    for (p, removed) in mass.into_values() {
        commands.queue(move |world: &mut World| despawn_detached(world, p, removed));
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

/// How a parent's ECS `Children` is brought back in line with the shadow tree at
/// the end of a batch.
///
/// A fresh node inserted mid-list (`Op::Insert` of a never-parented child before
/// an existing sibling) is attached at the tail at op time and moved into place by
/// one positional `insert_children` — a contiguous scan of the live `Children`,
/// microseconds even at 10k siblings — instead of rebuilding the whole child list
/// from the shadow tree (`children_of` + `replace_children`, which hashes every
/// sibling twice and builds an `EntityHashSet` of all of them). Anything the
/// positional path can't express escalates the parent to a full rebuild: a
/// same-parent reorder (re-append or `Insert` of an existing child), a
/// cross-parent move (into it, or out of it — the departing node may be a
/// positional insert's anchor), a removal (same reason), or more than
/// [`Self::POSITIONAL_CAP`] inserts (per-insert scans stop paying off against one
/// O(children) rebuild — the mass-insert case).
enum ParentDirt {
    /// Only fresh-node inserts so far: `(child, before)` pairs in op order.
    InsertsOnly(Vec<(NodeId, NodeId)>),
    /// Rebuild the whole child list from the shadow tree.
    Rebuild,
}

impl ParentDirt {
    /// Above this many positional inserts on one parent per batch, the parent
    /// falls back to a full rebuild.
    const POSITIONAL_CAP: usize = 16;

    /// From this many removals on one parent per batch, [`despawn_detached`]
    /// takes over from per-despawn relationship cleanup: its one O(siblings)
    /// `retain` pays off once the reverse-order scans (about k·N/2 sibling
    /// compares + memmoves for k removals spread over N) cost more, at k of a
    /// few dozen whatever N is.
    const MASS_REMOVAL_MIN: usize = 32;

    /// The parent needs a full rebuild.
    fn rebuild(dirty: &mut HashMap<NodeId, ParentDirt>, parent: NodeId) {
        dirty.insert(parent, ParentDirt::Rebuild);
    }

    /// Record a fresh-node insert of `child` before `before` under `parent`.
    fn insert(
        dirty: &mut HashMap<NodeId, ParentDirt>,
        parent: NodeId,
        child: NodeId,
        before: NodeId,
    ) {
        match dirty
            .entry(parent)
            .or_insert_with(|| ParentDirt::InsertsOnly(Vec::new()))
        {
            ParentDirt::InsertsOnly(inserts) if inserts.len() < Self::POSITIONAL_CAP => {
                inserts.push((child, before));
            }
            slot @ ParentDirt::InsertsOnly(_) => *slot = ParentDirt::Rebuild,
            ParentDirt::Rebuild => {}
        }
    }

    /// A structural change the positional path can't express happened under
    /// `parent`: if it is insert-only so far, make it a full rebuild. A parent that
    /// isn't dirty stays clean (the change alone keeps the ECS order intact).
    fn escalate(dirty: &mut HashMap<NodeId, ParentDirt>, parent: NodeId) {
        if let Some(slot) = dirty.get_mut(&parent) {
            *slot = ParentDirt::Rebuild;
        }
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

/// Despawn `removed` (children of `parent`, recursively) with `Children`
/// detached in one pass instead of once per despawn. `ChildOf`'s on-remove
/// hook drops the entity from the parent's `Children` by a linear scan +
/// `Vec::remove` memmove, O(N) per child; here the collection is taken off
/// the parent for the duration (the hooks scan an empty list), and the
/// survivors — the same entities, still `ChildOf(parent)`, in the same order —
/// are put back afterwards. Bevy's own `replace_related` does this same
/// `collection_mut_risky` swap; the invariant kept is that every entity in the
/// collection is `ChildOf(parent)`, which nothing here changes. The hook may
/// drop the emptied `Children` meanwhile (its "remove when empty" command),
/// hence the re-insert; a parent already despawned (by a same-batch ancestor
/// removal) took its children with it.
fn despawn_detached(world: &mut World, parent: Entity, removed: Vec<Entity>) {
    use bevy::ecs::entity::EntityHashSet;
    use bevy::ecs::relationship::RelationshipTarget;

    let taken = world.get_entity_mut(parent).ok().and_then(|mut p| {
        p.get_mut::<Children>()
            .map(|mut c| std::mem::take(c.collection_mut_risky()))
    });
    for &e in &removed {
        if let Ok(e) = world.get_entity_mut(e) {
            e.despawn();
        }
    }
    let Some(mut survivors) = taken else {
        return;
    };
    let removed: EntityHashSet = removed.into_iter().collect();
    survivors.retain(|e| !removed.contains(e));
    if let Ok(mut p) = world.get_entity_mut(parent) {
        if survivors.is_empty() {
            p.remove::<Children>();
        } else if let Some(mut c) = p.get_mut::<Children>() {
            *c.collection_mut_risky() = survivors;
        } else {
            p.insert(Children::from_collection_risky(survivors));
        }
    }
}

#[cfg(test)]
mod tests {
    use super::super::test_util::{children_of, create_node, ent, ordering_app};
    use super::*;

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

        let survivors = app
            .world_mut()
            .query::<&ReactNode>()
            .iter(app.world())
            .count();
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

    /// The positional insert path (no rebuild): a fresh node before the FIRST
    /// child, then another fresh node before that same-batch-inserted one. Each
    /// `insert_children` must find its `before` in the live `Children` — the
    /// second one's anchor is placed by the first command of the same batch.
    /// `[A,B]` + insert C before A + insert D before C → `[D,C,A,B]`.
    #[test]
    fn fresh_inserts_before_first_and_before_same_batch_insert() {
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            create_node(1),
            create_node(2),
            create_node(3),
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
        ])
        .unwrap();
        app.update();

        tx.send(vec![
            create_node(4),
            create_node(5),
            Op::Insert {
                parent: 1,
                child: 4,
                before: 2,
            },
            Op::Insert {
                parent: 1,
                child: 5,
                before: 4,
            },
        ])
        .unwrap();
        app.update();

        let parent = ent(&app, 1);
        assert_eq!(
            children_of(&app, parent),
            vec![ent(&app, 5), ent(&app, 4), ent(&app, 2), ent(&app, 3)],
            "fresh inserts before the head and before a same-batch insert: [D, C, A, B]"
        );
    }

    /// A fresh insert whose `before` is removed later in the SAME batch: the
    /// positional anchor is gone by the time the command applies, so the parent
    /// must escalate to a full rebuild — `[A,B,C]` + insert D before B + remove B
    /// → `[A,D,C]`, not `[A,C,D]`.
    #[test]
    fn fresh_insert_then_remove_of_its_anchor_rebuilds() {
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

        tx.send(vec![
            create_node(5),
            Op::Insert {
                parent: 1,
                child: 5,
                before: 3,
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
            vec![ent(&app, 2), ent(&app, 5), ent(&app, 4)],
            "the inserted node must take its removed anchor's slot: [A, D, C]"
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
                    props: Box::default(),
                    text: None,
                },
                Op::Create {
                    id: 2,
                    kind: "textSpan".into(),
                    props: Box::default(),
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
                props: Box::default(),
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
            app.world().resource::<JsBridge>().detached.is_empty(),
            "Op::Reset must clear the detached set"
        );
    }

    /// `Op::Reset` despawns reconciler nodes only: infrastructure a feature
    /// parented under the UI root survives a reload (a feature's own UI roots
    /// — the `<anchor>` layer — are not the root's children at all).
    #[test]
    fn reset_keeps_infrastructure_children() {
        let (mut app, tx, root) = ordering_app();
        let infra = app.world_mut().spawn(ChildOf(root)).id();
        tx.send(vec![
            create_node(1),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
        ])
        .unwrap();
        app.update();
        let node = ent(&app, 1);

        tx.send(vec![Op::Reset]).unwrap();
        app.update();

        assert!(
            app.world().entities().contains(infra),
            "Op::Reset must keep non-reconciler children of the root"
        );
        assert!(
            !app.world().entities().contains(node),
            "Op::Reset must despawn reconciler nodes"
        );
    }
    /// Removing an ancestor whose subtree *contains* a detached root must despawn
    /// it too. React emits `Remove` only for the subtree's top node, and a detached
    /// root has no `ChildOf`, so neither React's op nor Bevy's recursive despawn of
    /// the ancestor reaches it — `apply_js_ops` must find it via the tracked React
    /// parentage. Regression: navigating away from the Home demo left its
    /// `<surface target="monitor">` rendering into the shared monitor texture under
    /// the `<surface>` demo. This reproduces the exact op stream React emits
    /// (verified: only the wrapper gets a `Remove`, never the nested detached root) —
    /// a `<root>` standing in for the feature crate's `<surface>`.
    #[test]
    fn remove_ancestor_despawns_nested_detached_root() {
        let (mut app, tx, _root) = ordering_app();
        // Mirror Home's shape: a wrapper `<node>` under the root, a detached root
        // nested inside it, and a normal node rendered inside that.
        tx.send(vec![
            create_node(1), // wrapper (Home's container)
            super::super::test_util::create(2, "root", serde_json::json!({})),
            create_node(3), // content rendered inside the detached root
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            Op::Append {
                parent: 1,
                child: 2,
            }, // detached root nested under the wrapper
            Op::Append {
                parent: 2,
                child: 3,
            }, // content inside the detached root
        ])
        .unwrap();
        app.update();
        let wrapper = ent(&app, 1);
        let detached = ent(&app, 2);
        let inner = ent(&app, 3);
        assert!(app.world().entities().contains(detached));

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
            !app.world().entities().contains(detached),
            "the detached root nested under the removed wrapper must be despawned"
        );
        assert!(
            !app.world().entities().contains(inner),
            "the detached root's own subtree is despawned with it"
        );
        let bridge = app.world().resource::<JsBridge>();
        assert!(
            bridge.detached.is_empty(),
            "detached bookkeeping is cleared"
        );
        assert!(
            !bridge.nodes.contains_key(&2),
            "the detached node id is forgotten"
        );
        assert!(
            bridge.child_detached.is_empty() && bridge.detached_parent.is_empty(),
            "detached parentage maps are cleared"
        );
    }

    /// Removing a subtree must forget its *descendants'* per-node bookkeeping, not just
    /// the removed root's. React emits `Remove` only for the top node, and Bevy despawns
    /// the whole subtree recursively — so the bridge's `NodeId`-keyed side-tables would
    /// otherwise keep stale entries for every descendant until the next `Op::Reset`.
    #[test]
    fn remove_subtree_forgets_descendant_node_data() {
        let (mut app, tx, _root) = ordering_app();
        // A plain nested subtree wrapper(1) → mid(2) → leaf(3); `leaf` is a
        // `<text>` so a side-table (`text_styles`) is exercised too.
        tx.send(vec![
            create_node(1),
            create_node(2),
            Op::Create {
                id: 3,
                kind: "text".into(),
                props: Box::default(),
                text: Some("leaf".into()),
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
                .text_styles
                .contains_key(&3),
            "the text descendant is tracked before removal"
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
            !bridge.text_styles.contains_key(&3),
            "the descendant text is dropped from the text_styles table"
        );
    }

    /// The batched detach path (`despawn_detached`, taken from
    /// `ParentDirt::MASS_REMOVAL_MIN` removals on one parent): survivors keep
    /// their order and their `ChildOf`, a removed child's subtree despawns with
    /// it, the bridge forgets the removed ids, later single removals still work
    /// after the collection swap, and emptying the parent drops `Children`.
    #[test]
    fn mass_removal_detaches_children_in_one_pass() {
        let (mut app, tx, _root) = ordering_app();
        let n = 100u32;
        assert!(n as usize / 2 >= ParentDirt::MASS_REMOVAL_MIN);
        let mut ops = vec![
            create_node(1),
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
        ];
        for i in 0..n {
            ops.push(create_node(10 + i));
            ops.push(Op::Append {
                parent: 1,
                child: 10 + i,
            });
        }
        // A grandchild under a to-be-removed child (odd index).
        ops.push(create_node(1000));
        ops.push(Op::Append {
            parent: 11,
            child: 1000,
        });
        tx.send(ops).unwrap();
        app.update();
        let parent = ent(&app, 1);
        let grandchild = ent(&app, 1000);
        assert_eq!(children_of(&app, parent).len(), n as usize);
        let removed: Vec<Entity> = (0..n)
            .filter(|i| i % 2 == 1)
            .map(|i| ent(&app, 10 + i))
            .collect();
        let expected: Vec<Entity> = (0..n)
            .filter(|i| i % 2 == 0)
            .map(|i| ent(&app, 10 + i))
            .collect();

        // Remove every other child in one batch (React's front-to-back order).
        tx.send(
            (0..n)
                .filter(|i| i % 2 == 1)
                .map(|i| Op::Remove {
                    parent: 1,
                    child: 10 + i,
                })
                .collect(),
        )
        .unwrap();
        app.update();
        assert_eq!(
            children_of(&app, parent),
            expected,
            "survivors keep their order"
        );
        for e in &removed {
            assert!(
                !app.world().entities().contains(*e),
                "removed child despawned"
            );
        }
        assert!(
            !app.world().entities().contains(grandchild),
            "a removed child's subtree is despawned with it"
        );
        for e in &expected {
            assert_eq!(
                app.world().get::<ChildOf>(*e).map(|c| c.parent()),
                Some(parent),
                "survivors stay ChildOf(parent)"
            );
        }
        let bridge = app.world().resource::<JsBridge>();
        assert!(
            !bridge.nodes.contains_key(&11) && !bridge.nodes.contains_key(&1000),
            "removed ids are forgotten"
        );

        // A single removal after the swap goes the ordinary way and still lands.
        tx.send(vec![Op::Remove {
            parent: 1,
            child: 10,
        }])
        .unwrap();
        app.update();
        assert_eq!(children_of(&app, parent), expected[1..].to_vec());

        // Removing the rest in one pass empties the parent: `Children` is dropped.
        tx.send(
            (2..n)
                .filter(|i| i % 2 == 0)
                .map(|i| Op::Remove {
                    parent: 1,
                    child: 10 + i,
                })
                .collect(),
        )
        .unwrap();
        app.update();
        assert!(
            app.world().get::<Children>(parent).is_none(),
            "an emptied Children is removed"
        );
        assert_eq!(
            app.world_mut()
                .query::<&ReactNode>()
                .iter(app.world())
                .count(),
            1,
            "only the container remains"
        );
    }
}
