//! Render-world half of the cached-layer extraction skip: members of layers
//! that will NOT re-capture this frame are hidden from stock `bevy_ui_render`
//! extraction for exactly the `ExtractSchedule` window.
//!
//! **Why.** Stock extraction runs for every UI node with a visible
//! [`InheritedVisibility`]: it spawns a `TemporaryRenderEntity` per drawable,
//! `queue_uinodes` specializes and queues each item, and
//! [`redistribute_ui_layers`](super::redistribute_ui_layers) steals every
//! promoted member out of the camera phase — only to DROP the items of a
//! cached layer (its persistent texture already holds their pixels). With a
//! page of cached layers that is the whole per-node extract + queue + steal +
//! temporary-despawn cost spent on nothing, every frame.
//!
//! **How.** Every stock UI extractor early-outs on
//! `!inherited_visibility.get()` (backgrounds, borders, images, texture
//! slices, gradients, box shadows, text sections/shadows/decorations/cursor,
//! viewport nodes, debug overlay — re-verify on Bevy upgrades).
//! [`hide_cached_layer_members`] runs after
//! [`extract_ui_layers`](super::extract_ui_layers) (which finalizes
//! `needs_capture`, propagation included) and before every stock extraction
//! set, overwriting the members' `InheritedVisibility` with `HIDDEN`;
//! [`restore_cached_layer_members`] runs after them and restores `VISIBLE`.
//! Same contract as the clip swap ([`super::clip`]): the main world is
//! exclusively borrowed for the whole window (`ResMut<MainWorld>`), so no
//! main-world system — picking, focus, `visibility_propagate_system`,
//! devtools — can observe the flip, and both writes bypass change detection
//! (the net effect within a frame is identity). Only VISIBLE members are
//! flipped and stashed; a member the app hid stays as it is.
//!
//! The layer root is a member of its own layer, so its own drawable (its
//! background/border) is skipped too — it is part of the capture. With no
//! stolen item left to position the composite quad, a cached layer's quad
//! takes the root's own stacking position instead
//! ([`ExtractedLayer::fallback_sort_key`](super::ExtractedLayer::fallback_sort_key)).
//! Known gap, shared with the clip swap: a `UiMaterial` extractor is generic
//! and unordered relative to the window — an item it extracts for a cached
//! member is stolen and dropped as before (correct, just not skipped).

use bevy::ecs::query::QueryState;
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::render::MainWorld;
use bevy::render::sync_world::MainEntity;
use bevy::ui::ComputedNode;

use super::ExtractedUiLayers;

/// The extractable UI nodes: stock extractors all require a `ComputedNode`,
/// so anything without one (text spans, svg shapes) is never extracted and
/// never needs hiding.
type MembersQuery = QueryState<(Entity, &'static mut InheritedVisibility), With<ComputedNode>>;

/// The members hidden by [`hide_cached_layer_members`], restored by
/// [`restore_cached_layer_members`]. Render-world resource; drained every
/// frame. Also holds the cached main-world query (archetype matching is
/// refreshed per iteration, so a persistent state costs nothing to keep).
#[derive(Resource, Default)]
pub struct HiddenMembers {
    pub stash: Vec<Entity>,
    query: Option<MembersQuery>,
}

/// `ExtractSchedule`, after `extract_ui_layers` and before every stock UI
/// extraction set: hide the members of every layer served from cache.
pub fn hide_cached_layer_members(
    mut main_world: ResMut<MainWorld>,
    extracted: Res<ExtractedUiLayers>,
    mut hidden: ResMut<HiddenMembers>,
) {
    let hidden = &mut *hidden;
    hidden.stash.clear();
    // Every layer re-captures (or there are none): nothing to skip.
    if extracted.layers.iter().all(|l| l.needs_capture) {
        return;
    }
    hide_in(
        &mut main_world,
        &extracted.membership,
        |idx| !extracted.layers[idx].needs_capture,
        &mut hidden.stash,
        &mut hidden.query,
    );
}

/// `ExtractSchedule`, after every stock UI extraction set: restore the
/// hidden members so the main world resumes with true visibility in place.
pub fn restore_cached_layer_members(
    mut main_world: ResMut<MainWorld>,
    mut hidden: ResMut<HiddenMembers>,
) {
    restore_out(&mut main_world, &mut hidden.stash);
}

/// Core of [`hide_cached_layer_members`], factored on `&mut World` for
/// tests. `membership` is node → layer index; `cached(idx)` says whether that
/// layer skips its capture this frame. Walks the extractable nodes (dense
/// archetype iteration) rather than the map (a random entity lookup per
/// member), flipping visible members of cached layers and recording them.
pub fn hide_in(
    world: &mut World,
    membership: &HashMap<MainEntity, usize>,
    cached: impl Fn(usize) -> bool,
    stash: &mut Vec<Entity>,
    query: &mut Option<MembersQuery>,
) {
    stash.clear();
    if membership.is_empty() {
        return;
    }
    let query = query.get_or_insert_with(|| world.query_filtered());
    for (entity, mut visibility) in query.iter_mut(world) {
        if !visibility.get() {
            continue; // Hidden by the app: stock skips it already; leave it.
        }
        let Some(&idx) = membership.get(&MainEntity::from(entity)) else {
            continue; // Not a member: extracted as usual.
        };
        if !cached(idx) {
            continue; // Its layer re-captures: its items are needed.
        }
        *visibility.bypass_change_detection() = InheritedVisibility::HIDDEN;
        stash.push(entity);
    }
}

/// Core of [`restore_cached_layer_members`]: every stashed member was
/// `VISIBLE` when hidden, so restoring is a constant write.
pub fn restore_out(world: &mut World, stash: &mut Vec<Entity>) {
    for entity in stash.drain(..) {
        if let Some(mut visibility) = world.get_mut::<InheritedVisibility>(entity) {
            *visibility.bypass_change_detection() = InheritedVisibility::VISIBLE;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn node(world: &mut World, visibility: InheritedVisibility) -> Entity {
        world.spawn((ComputedNode::default(), visibility)).id()
    }

    /// Visible members of cached layers are hidden (root included) and
    /// stashed; members of re-capturing layers, app-hidden members,
    /// non-members and nodes without a `ComputedNode` are untouched; the
    /// restore is exact and drains the stash. Change ticks never move.
    #[test]
    fn hide_restore_roundtrip() {
        let mut world = World::new();
        let cached_root = node(&mut world, InheritedVisibility::VISIBLE);
        let cached_member = node(&mut world, InheritedVisibility::VISIBLE);
        let app_hidden_member = node(&mut world, InheritedVisibility::HIDDEN);
        let live_member = node(&mut world, InheritedVisibility::VISIBLE);
        let outside = node(&mut world, InheritedVisibility::VISIBLE);
        // A member without a ComputedNode (never extracted): not in the query.
        let span = world.spawn(InheritedVisibility::VISIBLE).id();

        let mut membership: HashMap<MainEntity, usize> = HashMap::default();
        for e in [cached_root, cached_member, app_hidden_member, span] {
            membership.insert(MainEntity::from(e), 0);
        }
        membership.insert(MainEntity::from(live_member), 1);
        let cached = |idx: usize| idx == 0;

        // Snapshot change ticks: the flip must be invisible to detection.
        world.clear_trackers();
        let tick_of = |world: &World, e: Entity| {
            world
                .entity(e)
                .get_ref::<InheritedVisibility>()
                .unwrap()
                .last_changed()
        };
        let before = tick_of(&world, cached_member);

        let mut stash = Vec::new();
        let mut query = None;
        hide_in(&mut world, &membership, cached, &mut stash, &mut query);
        let vis = |world: &World, e: Entity| world.get::<InheritedVisibility>(e).unwrap().get();
        assert!(
            !vis(&world, cached_root),
            "root's own drawable is capture content"
        );
        assert!(!vis(&world, cached_member));
        assert!(!vis(&world, app_hidden_member));
        assert!(
            vis(&world, live_member),
            "re-capturing layer keeps its items"
        );
        assert!(vis(&world, outside));
        assert!(vis(&world, span));
        assert_eq!(stash.len(), 2, "only really-flipped members are stashed");
        assert_eq!(
            tick_of(&world, cached_member),
            before,
            "bypasses change detection"
        );

        restore_out(&mut world, &mut stash);
        assert!(vis(&world, cached_root));
        assert!(vis(&world, cached_member));
        assert!(!vis(&world, app_hidden_member), "app-hidden stays hidden");
        assert!(stash.is_empty(), "stash drains on restore");
        assert_eq!(tick_of(&world, cached_member), before);

        // The cached query state survives structural change (a new node).
        let late = node(&mut world, InheritedVisibility::VISIBLE);
        membership.insert(MainEntity::from(late), 0);
        hide_in(&mut world, &membership, cached, &mut stash, &mut query);
        assert!(!vis(&world, late));
        assert_eq!(stash.len(), 3);
        restore_out(&mut world, &mut stash);
    }

    /// An empty membership (no layers) touches nothing and clears a stale
    /// stash; a despawned stashed entity is skipped on restore.
    #[test]
    fn hide_in_empty_and_restore_stale() {
        let mut world = World::new();
        let e = node(&mut world, InheritedVisibility::VISIBLE);
        let mut stash = vec![e];
        hide_in(
            &mut world,
            &HashMap::default(),
            |_| true,
            &mut stash,
            &mut None,
        );
        assert!(stash.is_empty());

        world.despawn(e);
        let mut stash = vec![e];
        restore_out(&mut world, &mut stash);
        assert!(stash.is_empty());
    }
}
