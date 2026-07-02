//! Shared registration plumbing for the three name-keyed React registries
//! (messages, requests, events). Each registry keeps its own resource and
//! entry type; only the dedup-by-`TypeId` insert lives here.

use std::any::TypeId;
use std::collections::HashMap;

use bevy::prelude::*;

/// A registry entry that remembers which Rust type produced it, so a same-type
/// re-registration (a no-op) can be told apart from a name collision between
/// two different types.
pub(crate) trait NamedEntry {
    fn type_id(&self) -> TypeId;
}

/// Insert `entry` under `name`: re-registering the same type is a harmless
/// no-op, while a different type claiming an occupied name warns and replaces
/// the previous entry. `kind` names the registry ("message"/"request"/"event")
/// in the warning.
pub(crate) fn register_entry<R: NamedEntry>(
    map: &mut HashMap<&'static str, R>,
    name: &'static str,
    kind: &str,
    entry: R,
) {
    if let Some(existing) = map.get(name) {
        if existing.type_id() == entry.type_id() {
            return;
        }
        warn!(
            "react {kind} {name:?} is registered by two different types; replacing the previous entry"
        );
    }
    map.insert(name, entry);
}
