//! Shared-element pairing: the `sharedTag` prop and the op-apply pre-pass
//! that turns "a tagged node unmounts while another with the same tag mounts
//! in the same commit" into a seeded transition on the incoming node.
//!
//! React has no reparenting — a node that "moves" between parents (a card
//! changing column, a thumbnail becoming a detail hero) is an unmount plus a
//! mount of a fresh node. Identity is therefore a **tag**, not an element:
//! `<image sharedTag="hero-42">` in the grid, `<image sharedTag="hero-42">`
//! in the detail screen. The trigger is the commit itself: nothing imperative.
//!
//! The pairing lives on the Rust side because only the shadow tree knows a
//! removed subtree's contents — React emits one `Remove` for the subtree
//! root, and a screen swap removes a whole screen at once. It is a pre-pass
//! over the batch ([`plan_pairs`]) that runs only while some node carries a
//! tag ([`SharedTags::is_empty`] gates it), then per pair:
//!
//! - a snapshot command queued **before** any op's commands reads the
//!   outgoing entity while it is still alive (its `Remove` despawns through
//!   deferred `Commands`) — see [`crate::transition::shared::snapshot`];
//! - a seed command queued **after** the ops stamps that snapshot on the
//!   incoming entity as a [`SharedSeed`](crate::transition::shared::SharedSeed),
//!   which the transition engine consumes on the node's first drive.
//!
//! Pairing rules: same tag, same element kind, same UI root (a `<surface>` /
//! `<root>` subtree is its own root); the **first mounted** matching outgoing
//! node seeds every incoming node with that tag; no warnings — a tag that
//! matches nothing simply mounts normally. `Op::Reset` (a reload) never pairs.

use std::borrow::Cow;
use std::collections::{HashMap, HashSet};

use crate::bridge::JsBridge;
use crate::protocol::{NodeId, op::Op};

/// The intrinsic element names, interned so the per-node kind record costs
/// no allocation for any known element.
const KNOWN_KINDS: &[&str] = &[
    "node",
    "text",
    "textSpan",
    "button",
    "image",
    "canvas",
    "portal",
    "surface",
    "root",
    "svg",
    "anchor",
    "editableText",
    "circle",
    "rect",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "path",
    "g",
];

fn intern_kind(kind: &str) -> Cow<'static, str> {
    match KNOWN_KINDS.iter().find(|k| **k == kind) {
        Some(k) => Cow::Borrowed(k),
        None => Cow::Owned(kind.to_owned()),
    }
}

/// The `sharedTag` index over bridge nodes (tag → node ids, in mount order)
/// plus every node's element kind (the pairing's type-match rule needs the
/// kind of a node tagged by a later delta, which the update op doesn't
/// carry). Lives on [`JsBridge`], maintained by the op-apply path only.
#[derive(Default, Debug)]
pub struct SharedTags {
    by_tag: HashMap<String, Vec<NodeId>>,
    kinds: HashMap<NodeId, Cow<'static, str>>,
}

impl SharedTags {
    /// The effective tag of a `sharedTag` prop value: `Some` only when
    /// non-empty (an empty string means "untagged", like an absent prop).
    pub(crate) fn effective(tag: Option<&str>) -> Option<&str> {
        tag.filter(|t| !t.is_empty())
    }

    /// Whether no live node carries a tag — the pre-pass gate.
    pub(crate) fn is_empty(&self) -> bool {
        self.by_tag.is_empty()
    }

    /// Record a node's element kind (every create, tagged or not).
    pub(crate) fn note_kind(&mut self, id: NodeId, kind: &str) {
        self.kinds.insert(id, intern_kind(kind));
    }

    pub(crate) fn kind_of(&self, id: NodeId) -> Option<&str> {
        self.kinds.get(&id).map(|k| k.as_ref())
    }

    /// Apply a `sharedTag` prop transition on one node (`old`/`new` are the
    /// raw prop values; empty strings count as untagged). Idempotent for
    /// `old == new`.
    pub(crate) fn apply(&mut self, id: NodeId, old: Option<&str>, new: Option<&str>) {
        let old = Self::effective(old);
        let new = Self::effective(new);
        if old == new {
            return;
        }
        if let Some(old) = old {
            self.remove(old, id);
        }
        if let Some(new) = new {
            let bucket = self.by_tag.entry(new.to_owned()).or_default();
            if !bucket.contains(&id) {
                bucket.push(id);
            }
        }
    }

    /// Drop a node entirely (it is being forgotten): its tag bucket entry, if
    /// any, and its kind record.
    pub(crate) fn forget(&mut self, id: NodeId, tag: Option<&str>) {
        if let Some(tag) = Self::effective(tag) {
            self.remove(tag, id);
        }
        self.kinds.remove(&id);
    }

    pub(crate) fn clear(&mut self) {
        self.by_tag.clear();
        self.kinds.clear();
    }

    fn remove(&mut self, tag: &str, id: NodeId) {
        if let Some(bucket) = self.by_tag.get_mut(tag) {
            bucket.retain(|&e| e != id);
            if bucket.is_empty() {
                self.by_tag.remove(tag);
            }
        }
    }

    fn all(&self, tag: &str) -> &[NodeId] {
        self.by_tag.get(tag).map(Vec::as_slice).unwrap_or(&[])
    }
}

/// One planned pairing: the incoming node (created this batch) and the
/// outgoing node it seeds from (removed this batch, still alive until the
/// batch's commands apply).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) struct SharedPair {
    pub incoming: NodeId,
    pub outgoing: NodeId,
}

/// The pre-pass: plan every shared-element pairing in `ops` against the
/// current shadow tree (which the ops have NOT been applied to yet). Cheap by
/// construction — it returns immediately while no node is tagged, and
/// otherwise costs one tag-only scan of the ops plus an ancestor walk per
/// tagged create.
pub(crate) fn plan_pairs(bridge: &JsBridge, ops: &[Op]) -> Vec<SharedPair> {
    let tags = &bridge.shared_tags;
    if tags.is_empty() {
        return Vec::new();
    }
    // Removed subtree roots this batch; nothing to pair without one.
    let removed: HashSet<NodeId> = ops
        .iter()
        .filter_map(|op| match op {
            Op::Remove { child, .. } => Some(*child),
            _ => None,
        })
        .collect();
    if removed.is_empty() {
        return Vec::new();
    }
    // The batch's own parentage (creates are attached by later ops in the
    // same batch) and its new detached roots — both needed to find the
    // incoming node's UI root before the ops apply.
    let mut batch_parent: HashMap<NodeId, NodeId> = HashMap::new();
    let mut batch_detached: HashSet<NodeId> = HashSet::new();
    for op in ops {
        match op {
            Op::Append { parent, child } | Op::Insert { parent, child, .. } => {
                batch_parent.insert(*child, *parent);
            }
            Op::Create { id, kind, .. } if kind == "surface" || kind == "root" => {
                batch_detached.insert(*id);
            }
            _ => {}
        }
    }
    let is_detached = |id: NodeId| bridge.is_detached_root(id) || batch_detached.contains(&id);
    // The UI root of a node: the top of its parent chain, stopping at a
    // detached root (a `<surface>`/`<root>` is its own root). The batch's
    // parentage is consulted first so nodes created this batch resolve.
    let root_of = |mut id: NodeId| -> NodeId {
        loop {
            if is_detached(id) {
                return id;
            }
            match batch_parent.get(&id).or_else(|| bridge.parent_of.get(&id)) {
                Some(&p) => id = p,
                None => return id,
            }
        }
    };
    // Whether `id` or an ancestor (through detached roots' React parents,
    // which an ancestor removal despawns too) is removed this batch.
    let under_removed = |mut id: NodeId| -> bool {
        loop {
            if removed.contains(&id) {
                return true;
            }
            match bridge
                .parent_of
                .get(&id)
                .or_else(|| bridge.surface_parent.get(&id))
            {
                Some(&p) => id = p,
                None => return false,
            }
        }
    };

    let mut pairs = Vec::new();
    for op in ops {
        let Op::Create {
            id, kind, props, ..
        } = op
        else {
            continue;
        };
        let Some(tag) = SharedTags::effective(props.shared_tag.as_deref()) else {
            continue;
        };
        let incoming_root = root_of(*id);
        // First mounted match wins — for EVERY incoming node with the tag.
        let outgoing = tags.all(tag).iter().copied().find(|&old| {
            tags.kind_of(old) == Some(kind.as_str())
                && under_removed(old)
                && root_of(old) == incoming_root
        });
        if let Some(outgoing) = outgoing {
            pairs.push(SharedPair {
                incoming: *id,
                outgoing,
            });
        }
    }
    pairs
}

#[cfg(test)]
mod tests {
    use bevy::prelude::*;
    use bevy::ui::{ComputedNode, UiGlobalTransform};

    use super::*;
    use crate::protocol::ROOT_ID;
    use crate::reconcile::test_util::{ent, op_app, update_delta};
    use crate::transition::shared::SharedSeed;

    fn tagged(id: NodeId, kind: &str, tag: &str, flight: bool) -> Op {
        let mut props = serde_json::json!({ "sharedTag": tag });
        if flight {
            props["style"] = serde_json::json!({
                "width": 200, "height": 200,
                "transition": { "sharedElement": { "duration": 1000 } },
            });
        }
        Op::Create {
            id,
            kind: kind.into(),
            props: serde_json::from_value(props).unwrap(),
            text: None,
        }
    }

    fn append(parent: NodeId, child: NodeId) -> Op {
        Op::Append { parent, child }
    }

    fn remove(parent: NodeId, child: NodeId) -> Op {
        Op::Remove { parent, child }
    }

    /// Give the outgoing node an on-screen rect (no layout runs in the op
    /// harness): center `(150, 50)`, size `100×100` physical px.
    fn place(app: &mut App, e: Entity) {
        let placed: UiGlobalTransform =
            bevy::math::Affine2::from_translation(Vec2::new(150.0, 50.0)).into();
        let mut em = app.world_mut().entity_mut(e);
        em.get_mut::<ComputedNode>().unwrap().size = Vec2::new(100.0, 100.0);
        *em.get_mut::<UiGlobalTransform>().unwrap() = placed;
    }

    fn seed_of(app: &App, id: NodeId) -> Option<crate::transition::shared::SharedRect> {
        app.world()
            .entity(ent(app, id))
            .get::<SharedSeed>()
            .map(|s| s.rect)
    }

    /// A tagged node removed in the same batch another one with its tag is
    /// created seeds the incoming node with its on-screen rect; the outgoing
    /// entity is gone afterwards.
    #[test]
    fn pairing_stamps_seed_from_the_outgoing_node() {
        let (mut app, tx) = op_app();
        tx.send(vec![tagged(1, "node", "hero", false), append(ROOT_ID, 1)])
            .unwrap();
        app.update();
        let old = ent(&app, 1);
        place(&mut app, old);

        tx.send(vec![
            tagged(2, "node", "hero", true),
            remove(ROOT_ID, 1),
            append(ROOT_ID, 2),
        ])
        .unwrap();
        app.update();

        let seed = seed_of(&app, 2).expect("incoming node is seeded");
        assert_eq!(seed.center, Vec2::new(150.0, 50.0));
        assert_eq!(seed.size, Vec2::new(100.0, 100.0));
        assert!(app.world().get_entity(old).is_err(), "outgoing despawned");
    }

    /// Kind must match, and only a REMOVED node pairs.
    #[test]
    fn pairing_requires_same_kind_and_a_removal() {
        let (mut app, tx) = op_app();
        tx.send(vec![tagged(1, "node", "hero", false), append(ROOT_ID, 1)])
            .unwrap();
        app.update();
        // Same tag, different kind.
        tx.send(vec![
            tagged(2, "image", "hero", true),
            remove(ROOT_ID, 1),
            append(ROOT_ID, 2),
        ])
        .unwrap();
        app.update();
        assert!(seed_of(&app, 2).is_none(), "kind mismatch never pairs");

        // Same tag + kind, but the tagged node stays mounted.
        tx.send(vec![tagged(3, "image", "hero", true), append(ROOT_ID, 3)])
            .unwrap();
        app.update();
        assert!(seed_of(&app, 3).is_none(), "no removal, no pairing");
    }

    /// The outgoing node is found deep inside a removed subtree (React emits
    /// one `Remove` for the subtree root), and a tag added by a later delta
    /// counts like one set at mount.
    #[test]
    fn pairing_finds_tagged_descendants_of_a_removed_subtree() {
        let (mut app, tx) = op_app();
        tx.send(vec![
            crate::reconcile::test_util::create_node(10),
            append(ROOT_ID, 10),
            crate::reconcile::test_util::create_node(11),
            append(10, 11),
        ])
        .unwrap();
        app.update();
        let tag: crate::protocol::props::Props =
            serde_json::from_value(serde_json::json!({ "sharedTag": "hero" })).unwrap();
        tx.send(vec![update_delta(11, tag, &[], &[])]).unwrap();
        app.update();

        tx.send(vec![
            tagged(2, "node", "hero", true),
            remove(ROOT_ID, 10),
            append(ROOT_ID, 2),
        ])
        .unwrap();
        app.update();
        assert!(
            seed_of(&app, 2).is_some(),
            "descendant of removed root pairs"
        );
    }

    /// Several outgoing nodes with one tag: the first mounted seeds EVERY
    /// incoming node with that tag (no warning, deterministic).
    #[test]
    fn pairing_takes_the_first_mounted_match_for_every_create() {
        let (mut app, tx) = op_app();
        tx.send(vec![
            tagged(1, "node", "card", false),
            append(ROOT_ID, 1),
            tagged(2, "node", "card", false),
            append(ROOT_ID, 2),
        ])
        .unwrap();
        app.update();
        let e1 = ent(&app, 1);
        place(&mut app, e1);
        // Node 2 sits elsewhere so the seeds are distinguishable.
        let e2 = ent(&app, 2);
        let far: UiGlobalTransform =
            bevy::math::Affine2::from_translation(Vec2::new(900.0, 900.0)).into();
        *app.world_mut()
            .entity_mut(e2)
            .get_mut::<UiGlobalTransform>()
            .unwrap() = far;

        tx.send(vec![
            tagged(3, "node", "card", true),
            tagged(4, "node", "card", true),
            remove(ROOT_ID, 1),
            remove(ROOT_ID, 2),
            append(ROOT_ID, 3),
            append(ROOT_ID, 4),
        ])
        .unwrap();
        app.update();
        for id in [3, 4] {
            let seed = seed_of(&app, id).expect("seeded");
            assert_eq!(seed.center, Vec2::new(150.0, 50.0), "node {id}");
        }
    }

    /// Without a `transition: { sharedElement }` spec the pairing is inert:
    /// no seed is stamped (the node mounts normally).
    #[test]
    fn pairing_is_inert_without_a_shared_element_spec() {
        let (mut app, tx) = op_app();
        tx.send(vec![tagged(1, "node", "hero", false), append(ROOT_ID, 1)])
            .unwrap();
        app.update();
        tx.send(vec![
            tagged(2, "node", "hero", false),
            remove(ROOT_ID, 1),
            append(ROOT_ID, 2),
        ])
        .unwrap();
        app.update();
        assert!(seed_of(&app, 2).is_none());
    }

    /// End to end through real ops: the incoming node's background starts at
    /// the OUTGOING node's live color (a static node with no transition of
    /// its own) and eases to its own with the `sharedElement` timing.
    #[test]
    fn seeded_background_color_eases_from_the_outgoing_node() {
        use crate::reconcile::test_util::op_app_manual_time;
        let (mut app, tx) = op_app_manual_time();
        app.init_resource::<crate::layer::LayerContentDirt>();
        app.add_systems(
            Update,
            crate::transition::drive_transitions.after(crate::reconcile::apply_js_ops),
        );
        let red: Op = Op::Create {
            id: 1,
            kind: "node".into(),
            props: serde_json::from_value(serde_json::json!({
                "sharedTag": "hero", "style": { "backgroundColor": "#ff0000" }
            }))
            .unwrap(),
            text: None,
        };
        tx.send(vec![red, append(ROOT_ID, 1)]).unwrap();
        app.update();

        let blue: Op = Op::Create {
            id: 2,
            kind: "node".into(),
            props: serde_json::from_value(serde_json::json!({
                "sharedTag": "hero",
                "style": {
                    "backgroundColor": "#0000ff",
                    "transition": { "sharedElement": { "duration": 1000, "easing": "linear" } },
                },
            }))
            .unwrap(),
            text: None,
        };
        tx.send(vec![blue, remove(ROOT_ID, 1), append(ROOT_ID, 2)])
            .unwrap();
        app.update();
        let bg = |app: &App| {
            app.world()
                .entity(ent(app, 2))
                .get::<BackgroundColor>()
                .unwrap()
                .0
                .to_srgba()
        };
        let c = bg(&app);
        assert!(
            (c.red - 1.0).abs() < 1e-3 && c.blue.abs() < 1e-3,
            "frame 0: the outgoing node's red, got {c:?}"
        );
        app.world_mut()
            .resource_mut::<Time>()
            .advance_by(std::time::Duration::from_millis(500));
        app.update();
        let c = bg(&app);
        assert!(
            (c.red - 0.5).abs() < 0.02 && (c.blue - 0.5).abs() < 0.02,
            "halfway: {c:?}"
        );
        app.world_mut()
            .resource_mut::<Time>()
            .advance_by(std::time::Duration::from_millis(600));
        app.update();
        let c = bg(&app);
        assert!(
            c.red.abs() < 1e-3 && (c.blue - 1.0).abs() < 1e-3,
            "settled: {c:?}"
        );
    }

    /// A static outgoing node (no `transition` of its own) seeds identity
    /// values — opacity 1, scale 1 — not a zeroed default state.
    #[test]
    fn static_outgoing_node_seeds_identity_values() {
        let (mut app, tx) = op_app();
        tx.send(vec![tagged(1, "node", "hero", false), append(ROOT_ID, 1)])
            .unwrap();
        app.update();
        let old = ent(&app, 1);
        let seed = crate::transition::shared::snapshot(app.world(), old).expect("seed");
        assert_eq!(seed.opacity_current(), 1.0);
        assert_eq!(seed.scale_current(), 1.0);
    }

    /// An incoming node that dies within the same batch leaves no parked
    /// seed behind; a `Reset` clears the parked seeds too.
    #[test]
    fn pending_seeds_never_leak() {
        use crate::transition::shared::PendingSharedSeeds;
        let (mut app, tx) = op_app();
        tx.send(vec![tagged(1, "node", "hero", false), append(ROOT_ID, 1)])
            .unwrap();
        app.update();
        tx.send(vec![
            tagged(2, "node", "hero", true),
            remove(ROOT_ID, 1),
            append(ROOT_ID, 2),
            remove(ROOT_ID, 2),
        ])
        .unwrap();
        app.update();
        let pending = app.world().get_resource::<PendingSharedSeeds>();
        assert!(
            pending.is_none_or(|p| p.0.is_empty()),
            "same-batch death: no leak"
        );

        tx.send(vec![tagged(3, "node", "hero", false), append(ROOT_ID, 3)])
            .unwrap();
        app.update();
        tx.send(vec![
            tagged(4, "node", "hero", true),
            remove(ROOT_ID, 3),
            Op::Reset,
        ])
        .unwrap();
        app.update();
        let pending = app.world().get_resource::<PendingSharedSeeds>();
        assert!(pending.is_none_or(|p| p.0.is_empty()), "reset: no leak");
    }

    /// A tagged node inside a detached `<root>` never pairs with one in the
    /// window root (their rects don't share a space).
    #[test]
    fn pairing_requires_the_same_ui_root() {
        let (mut app, tx) = op_app();
        tx.send(vec![
            Op::Create {
                id: 20,
                kind: "root".into(),
                props: Box::default(),
                text: None,
            },
            append(ROOT_ID, 20),
            tagged(1, "node", "hero", false),
            append(20, 1),
        ])
        .unwrap();
        app.update();
        tx.send(vec![
            tagged(2, "node", "hero", true),
            remove(20, 1),
            append(ROOT_ID, 2),
        ])
        .unwrap();
        app.update();
        assert!(seed_of(&app, 2).is_none(), "cross-root pair rejected");
    }
}
