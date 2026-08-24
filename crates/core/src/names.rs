//! Named React nodes: the `name` prop lands on the entity as a Bevy [`Name`]
//! and in a bridge-maintained index, so app systems can find React-created
//! entities — the escape hatch for "do it manually in Bevy".
//!
//! Two doors, both read-only for the app:
//!
//! - **Plain queries** — `Query<(Entity, &Name), With<ReactNode>>`, with
//!   `Added<ReactNode>` / `RemovedComponents<ReactNode>` as the lifecycle
//!   signal. [`ReactNode`](crate::ReactNode) scopes the query to bridge
//!   entities (every glTF node and light in the app carries a `Name` too).
//! - **[`ReactNodes`]** — a hash lookup by name (`get`/`all`/`iter`), backed by
//!   the index the op-apply path keeps in step with the `Name` components.
//!
//! `Name` on a React node is **bridge-owned**: the `name` prop is the source of
//! truth (a delta replaces it, `unset` or an empty string removes it), and a
//! `Name` inserted by hand is invisible to the index and overwritten by the
//! next delta.

use std::collections::HashMap;

use bevy::ecs::system::SystemParam;
use bevy::prelude::*;

use crate::bridge::JsBridge;
use crate::protocol::NodeId;

/// Devtools warning kind for an ambiguous [`ReactNodes::get`] (2+ nodes share
/// the name). Mirrored in `js/src/devtools/warnings.ts`.
pub(crate) const AMBIGUOUS_KIND: &str = "nameAmbiguous";

/// The by-name index over bridge entities (`name` prop → entities, in mount
/// order). Lives on [`JsBridge`] and is maintained by the op-apply path only.
#[derive(Default, Debug)]
pub struct NameIndex {
    by_name: HashMap<String, Vec<Entity>>,
}

impl NameIndex {
    /// The effective name of a `name` prop value: `Some` only when non-empty
    /// (an empty string means "unnamed", like an absent prop).
    pub(crate) fn effective(name: Option<&str>) -> Option<&str> {
        name.filter(|n| !n.is_empty())
    }

    pub(crate) fn insert(&mut self, name: &str, entity: Entity) {
        let bucket = self.by_name.entry(name.to_owned()).or_default();
        if !bucket.contains(&entity) {
            bucket.push(entity);
        }
    }

    pub(crate) fn remove(&mut self, name: &str, entity: Entity) {
        if let Some(bucket) = self.by_name.get_mut(name) {
            bucket.retain(|&e| e != entity);
            if bucket.is_empty() {
                self.by_name.remove(name);
            }
        }
    }

    pub(crate) fn clear(&mut self) {
        self.by_name.clear();
    }

    fn all(&self, name: &str) -> &[Entity] {
        self.by_name.get(name).map(Vec::as_slice).unwrap_or(&[])
    }
}

/// Apply a `name` prop transition on one bridge entity: swap the `Name`
/// component and keep the index in step. `old`/`new` are the raw prop values
/// (empty strings count as unnamed). Idempotent for `old == new`.
pub(crate) fn apply_name(
    ec: &mut EntityCommands,
    index: &mut NameIndex,
    old: Option<&str>,
    new: Option<&str>,
) {
    let entity = ec.id();
    let old = NameIndex::effective(old);
    let new = NameIndex::effective(new);
    if old == new {
        return;
    }
    if let Some(old) = old {
        index.remove(old, entity);
    }
    match new {
        Some(new) => {
            index.insert(new, entity);
            ec.insert(Name::new(new.to_owned()));
        }
        None => {
            ec.remove::<Name>();
        }
    }
}

/// Read-only lookup of React-created entities by their `name` prop.
///
/// ```ignore
/// fn place_pins(nodes: ReactNodes, layout: Query<(&ComputedNode, &UiGlobalTransform)>) {
///     for entity in nodes.all("card") { /* … */ }
///     if let Some(hud) = nodes.get("hud") { /* … */ }
/// }
/// ```
///
/// Order your system `.after(ReactApplySet)` to see this frame's mounts. The
/// index tracks the `name` prop exactly (see the module docs for the
/// bridge-owned rule); entities are listed in mount order. Names are not
/// unique — `<Card name="card">` in a list is legitimate — so [`Self::get`]
/// returns the first match and flags the ambiguity in devtools, while
/// [`Self::all`] is the group form.
///
/// Entities are only valid for the frame you looked them up in: React
/// unmounts (and hot reloads) despawn them with no notice to a stored handle.
/// Re-query each frame, or keep the handle in your own component and watch
/// `RemovedComponents<ReactNode>` — the demo's `sync_pins` does the former.
#[derive(SystemParam)]
pub struct ReactNodes<'w> {
    bridge: Res<'w, JsBridge>,
}

impl ReactNodes<'_> {
    /// The entity named `name` — the first mounted one when several share the
    /// name (a devtools `nameAmbiguous` warning flags that node). `None` when
    /// no live React node carries the name.
    pub fn get(&self, name: &str) -> Option<Entity> {
        let all = self.bridge.names.all(name);
        let first = *all.first()?;
        if all.len() > 1 {
            let node = self.node_id(first);
            let _scope = node.map(crate::diag::node_scope);
            crate::diag::report(
                AMBIGUOUS_KIND,
                name,
                &format!(
                    "ReactNodes::get({name:?}) matched {} nodes; returning the first mounted — use `all` for the group",
                    all.len()
                ),
            );
        }
        Some(first)
    }

    /// Every live React entity named `name`, in mount order (empty when none).
    pub fn all(&self, name: &str) -> &[Entity] {
        self.bridge.names.all(name)
    }

    /// Whether any live React node carries `name`.
    pub fn contains(&self, name: &str) -> bool {
        !self.bridge.names.all(name).is_empty()
    }

    /// Every (name, entities) group in the index, in no particular order.
    pub fn iter(&self) -> impl Iterator<Item = (&str, &[Entity])> {
        self.bridge
            .names
            .by_name
            .iter()
            .map(|(n, es)| (n.as_str(), es.as_slice()))
    }

    fn node_id(&self, entity: Entity) -> Option<NodeId> {
        self.bridge
            .nodes
            .iter()
            .find_map(|(&id, &e)| (e == entity).then_some(id))
    }
}

#[cfg(test)]
mod tests {
    use bevy::ecs::system::SystemState;

    use super::*;
    use crate::protocol::{ROOT_ID, op::Op, props::Props};
    use crate::reconcile::test_util::{ent, op_app, update_delta};

    fn named(id: NodeId, name: &str) -> Op {
        Op::Create {
            id,
            kind: "node".into(),
            props: serde_json::from_value(serde_json::json!({ "name": name })).unwrap(),
            text: None,
        }
    }

    fn append(parent: NodeId, child: NodeId) -> Op {
        Op::Append { parent, child }
    }

    fn name_props(name: &str) -> Props {
        serde_json::from_value(serde_json::json!({ "name": name })).unwrap()
    }

    fn lookup(app: &mut App, name: &str) -> Option<Entity> {
        let world = app.world_mut();
        let mut state = SystemState::<ReactNodes>::new(world);
        state.get(world).unwrap().get(name)
    }

    fn all(app: &mut App, name: &str) -> Vec<Entity> {
        let world = app.world_mut();
        let mut state = SystemState::<ReactNodes>::new(world);
        state.get(world).unwrap().all(name).to_vec()
    }

    fn name_of(app: &App, entity: Entity) -> Option<String> {
        app.world()
            .get_entity(entity)
            .ok()
            .and_then(|e| e.get::<Name>().map(|n| n.as_str().to_owned()))
    }

    /// `<node name="hud">` mounts with a `Name("hud")` and is found by name.
    #[test]
    fn create_stamps_name_and_indexes() {
        let (mut app, tx) = op_app();
        tx.send(vec![named(1, "hud"), append(ROOT_ID, 1)]).unwrap();
        app.update();

        let e = ent(&app, 1);
        assert_eq!(name_of(&app, e).as_deref(), Some("hud"));
        assert_eq!(lookup(&mut app, "hud"), Some(e));
        assert_eq!(lookup(&mut app, "nope"), None);
    }

    /// A `name` delta swaps the component and moves the entity between
    /// buckets; a delta not touching `name` leaves both alone.
    #[test]
    fn rename_replaces_component_and_moves_index() {
        let (mut app, tx) = op_app();
        tx.send(vec![named(1, "a"), append(ROOT_ID, 1)]).unwrap();
        app.update();
        tx.send(vec![update_delta(1, name_props("b"), &[], &[])])
            .unwrap();
        app.update();

        let e = ent(&app, 1);
        assert_eq!(name_of(&app, e).as_deref(), Some("b"));
        assert_eq!(lookup(&mut app, "a"), None);
        assert_eq!(lookup(&mut app, "b"), Some(e));

        // An unrelated delta preserves the name.
        let src: Props = serde_json::from_value(serde_json::json!({ "src": "x.png" })).unwrap();
        tx.send(vec![update_delta(1, src, &[], &[])]).unwrap();
        app.update();
        assert_eq!(name_of(&app, e).as_deref(), Some("b"));
        assert_eq!(lookup(&mut app, "b"), Some(e));
    }

    /// `unset` (`name` dropped from the JSX) and an empty string both remove
    /// the `Name` and the index entry.
    #[test]
    fn unset_and_empty_string_remove_name() {
        let (mut app, tx) = op_app();
        tx.send(vec![
            named(1, "a"),
            named(2, "b"),
            append(ROOT_ID, 1),
            append(ROOT_ID, 2),
        ])
        .unwrap();
        app.update();
        tx.send(vec![
            update_delta(1, Props::default(), &["name"], &[]),
            update_delta(2, name_props(""), &[], &[]),
        ])
        .unwrap();
        app.update();

        assert_eq!(name_of(&app, ent(&app, 1)), None);
        assert_eq!(name_of(&app, ent(&app, 2)), None);
        assert_eq!(lookup(&mut app, "a"), None);
        assert_eq!(lookup(&mut app, "b"), None);
        assert_eq!(lookup(&mut app, ""), None, "empty names are never indexed");

        // An empty name on create is likewise unnamed.
        tx.send(vec![named(3, ""), append(ROOT_ID, 3)]).unwrap();
        app.update();
        assert_eq!(name_of(&app, ent(&app, 3)), None);
    }

    /// Unmounting a subtree forgets every named node in it (the root and its
    /// descendants), with no stale entity handles left in the index.
    #[test]
    fn remove_forgets_subtree_names() {
        let (mut app, tx) = op_app();
        tx.send(vec![
            named(1, "card"),
            named(2, "label"),
            append(ROOT_ID, 1),
            append(1, 2),
        ])
        .unwrap();
        app.update();
        assert!(lookup(&mut app, "card").is_some() && lookup(&mut app, "label").is_some());

        tx.send(vec![Op::Remove {
            parent: ROOT_ID,
            child: 1,
        }])
        .unwrap();
        app.update();
        assert_eq!(lookup(&mut app, "card"), None);
        assert_eq!(lookup(&mut app, "label"), None);
    }

    /// A hot-reload `Reset` clears the index with the tree.
    #[test]
    fn reset_clears_index() {
        let (mut app, tx) = op_app();
        tx.send(vec![named(1, "a"), append(ROOT_ID, 1)]).unwrap();
        app.update();
        tx.send(vec![Op::Reset]).unwrap();
        app.update();
        assert_eq!(lookup(&mut app, "a"), None);
    }

    /// Names are not unique: `all` lists sharers in mount order and `get`
    /// returns the first mounted one.
    #[test]
    fn duplicates_list_in_mount_order() {
        let (mut app, tx) = op_app();
        tx.send(vec![
            named(1, "card"),
            named(2, "card"),
            named(3, "card"),
            append(ROOT_ID, 1),
            append(ROOT_ID, 2),
            append(ROOT_ID, 3),
        ])
        .unwrap();
        app.update();

        let (e1, e2, e3) = (ent(&app, 1), ent(&app, 2), ent(&app, 3));
        assert_eq!(all(&mut app, "card"), vec![e1, e2, e3]);
        assert_eq!(lookup(&mut app, "card"), Some(e1));

        // Dropping the first leaves the rest in order.
        tx.send(vec![Op::Remove {
            parent: ROOT_ID,
            child: 1,
        }])
        .unwrap();
        app.update();
        assert_eq!(all(&mut app, "card"), vec![e2, e3]);
        assert_eq!(lookup(&mut app, "card"), Some(e2));
    }

    /// An ambiguous `get` flags the returned node in devtools (the sink is
    /// process-global: serialize via the test lock, filter by kind).
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn ambiguous_get_warns() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, tx) = op_app();
        tx.send(vec![
            named(1, "card"),
            named(2, "card"),
            append(ROOT_ID, 1),
            append(ROOT_ID, 2),
        ])
        .unwrap();
        app.update();
        let _ = crate::diag::take_runtime_warnings();

        assert_eq!(lookup(&mut app, "card"), Some(ent(&app, 1)));
        let warnings: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.kind == AMBIGUOUS_KIND)
            .collect();
        assert_eq!(warnings.len(), 1, "one ambiguity warning per get");
        assert_eq!(warnings[0].node, Some(1), "attributed to the returned node");
        assert_eq!(warnings[0].value, "card");

        // A unique name never warns.
        tx.send(vec![named(3, "solo"), append(ROOT_ID, 3)]).unwrap();
        app.update();
        let _ = crate::diag::take_runtime_warnings();
        assert_eq!(lookup(&mut app, "solo"), Some(ent(&app, 3)));
        assert!(
            crate::diag::take_runtime_warnings()
                .iter()
                .all(|w| w.kind != AMBIGUOUS_KIND)
        );
    }
}
