//! [`Style`] — one node's merged style: a sparse, id-sorted list of the
//! properties it sets, read through the registry's typed keys
//! (`style.get(&OPACITY)`).

use std::any::Any;
use std::fmt;

use serde::de::{self, DeserializeSeed, Deserializer, IgnoredAny, MapAccess, Visitor};
use smallbox::{SmallBox, smallbox, space::S4};

use super::dirty::StyleDirty;
use super::property::{AnyStyleProperty, PropertyValue, StyleProperty};
use super::registry::PropId;

/// The object-safe view of a stored property value: compared on merge
/// (compare-before-set), cloned when a hover/press/focus variant overlays
/// the base style.
pub trait StyleValueDyn: Any + Send + Sync + fmt::Debug {
    /// Equality across the type boundary (a different type is never equal).
    fn dyn_eq(&self, other: &dyn StyleValueDyn) -> bool;
    fn clone_value(&self) -> StoredValue;
    fn as_any(&self) -> &dyn Any;
}

impl<T: PropertyValue> StyleValueDyn for T {
    fn dyn_eq(&self, other: &dyn StyleValueDyn) -> bool {
        other.as_any().downcast_ref::<T>() == Some(self)
    }
    fn clone_value(&self) -> StoredValue {
        stored(self.clone())
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}

/// A stored value: inline when it fits 32 bytes (most do — lengths, colors,
/// keywords, numbers), on the heap otherwise.
pub type StoredValue = SmallBox<dyn StyleValueDyn, S4>;

/// Store `value`.
pub(crate) fn stored<T: PropertyValue>(value: T) -> StoredValue {
    smallbox!(value)
}

/// The replaced values of the changed properties whose invalidation is
/// computed per change ([`Invalidate::Computed`](super::Invalidate::Computed)),
/// by id — `None` where the property was absent.
#[derive(Debug, Default)]
pub struct OldValues(Vec<(PropId, Option<StoredValue>)>);

impl Clone for OldValues {
    fn clone(&self) -> Self {
        Self(
            self.0
                .iter()
                .map(|(id, v)| (*id, v.as_ref().map(|v| v.clone_value())))
                .collect(),
        )
    }
}

impl OldValues {
    /// The replaced value of `id`: `None` when not recorded, `Some(None)`
    /// when the property was absent.
    pub fn get(&self, id: PropId) -> Option<Option<&dyn StyleValueDyn>> {
        self.0
            .iter()
            .find(|(i, _)| *i == id)
            .map(|(_, v)| v.as_deref())
    }

    fn record(&mut self, id: PropId, property: &dyn AnyStyleProperty, old: Option<StoredValue>) {
        if property.computes_invalidation() && self.get(id).is_none() {
            self.0.push((id, old));
        }
    }
}

struct Entry {
    id: PropId,
    property: &'static dyn AnyStyleProperty,
    value: StoredValue,
}

impl Clone for Entry {
    fn clone(&self) -> Self {
        Self {
            id: self.id,
            property: self.property,
            value: self.value.clone_value(),
        }
    }
}

/// The merged style of one node: the properties it sets, each once, sorted
/// by [`PropId`]. Decoded through the style registry (every key resolves to
/// its registered property and decodes through that property's codec); read
/// with the property statics as typed keys.
#[derive(Default, Clone)]
pub struct Style {
    entries: Vec<Entry>,
}

impl Style {
    /// The empty style (every property absent) — what a node without a
    /// `style` applies.
    pub fn empty() -> &'static Style {
        static EMPTY: Style = Style {
            entries: Vec::new(),
        };
        &EMPTY
    }

    /// The value of `property`, if set. Properties are identified by their
    /// declaration's address — declare them as `static`, never `const` (a
    /// `const` is a fresh temporary at every use).
    pub fn get<T: PropertyValue>(&self, property: &StyleProperty<T>) -> Option<&T> {
        let found = self.entries.iter().find(|e| is(e.property, property));
        debug_assert!(
            found.is_some()
                || !self
                    .entries
                    .iter()
                    .any(|e| e.property.name() == property.name),
            "style property {:?} read through another declaration than the registered one \
             — declare style properties as `static`, not `const`",
            property.name
        );
        found.and_then(|e| e.value.as_any().downcast_ref::<T>())
    }

    /// Set `property` to `value` (a core property, or one registered on this
    /// thread's decode scope).
    pub fn set<T: PropertyValue>(&mut self, property: &'static StyleProperty<T>, value: T) {
        let id = resolve_id(property)
            .unwrap_or_else(|| panic!("style property {:?} is not registered", property.name));
        self.insert(Entry {
            id,
            property,
            value: stored(value),
        });
    }

    /// Clear `property`.
    pub fn remove<T: PropertyValue>(&mut self, property: &StyleProperty<T>) {
        self.entries.retain(|e| !is(e.property, property));
    }

    /// Whether no property is set.
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Every set property with its value, by id.
    pub fn iter(
        &self,
    ) -> impl Iterator<Item = (&'static dyn AnyStyleProperty, &dyn StyleValueDyn)> {
        self.entries.iter().map(|e| (e.property, &*e.value))
    }

    fn insert(&mut self, entry: Entry) {
        match self.entries.binary_search_by_key(&entry.id, |e| e.id) {
            Ok(i) => self.entries[i] = entry,
            Err(i) => self.entries.insert(i, entry),
        }
    }

    /// Move every property of `delta` onto `self` (the delta is consumed)
    /// and return the properties whose value actually changed —
    /// compare-before-set, so a re-sent unchanged value re-runs nothing. The
    /// replaced values a computed invalidation needs land in `old`.
    pub(crate) fn overlay_delta(&mut self, delta: &mut Style, old: &mut OldValues) -> StyleDirty {
        let mut dirty = StyleDirty::NONE;
        for entry in delta.entries.drain(..) {
            match self.entries.binary_search_by_key(&entry.id, |e| e.id) {
                Ok(i) => {
                    if !self.entries[i].value.dyn_eq(&*entry.value) {
                        dirty.insert(entry.id);
                        let replaced = std::mem::replace(&mut self.entries[i], entry);
                        old.record(replaced.id, replaced.property, Some(replaced.value));
                    }
                }
                Err(i) => {
                    dirty.insert(entry.id);
                    old.record(entry.id, entry.property, None);
                    self.entries.insert(i, entry);
                }
            }
        }
        dirty
    }

    /// The value stored under `id`.
    pub(crate) fn get_dyn(&self, id: PropId) -> Option<&dyn StyleValueDyn> {
        self.entries
            .binary_search_by_key(&id, |e| e.id)
            .ok()
            .map(|i| &*self.entries[i].value)
    }

    /// The properties this style sets.
    pub(crate) fn keys(&self) -> StyleDirty {
        let mut keys = StyleDirty::NONE;
        for e in &self.entries {
            keys.insert(e.id);
        }
        keys
    }

    /// Clear the property named `wire_name`; its id when it was set. An
    /// unknown core-less name warns.
    pub(crate) fn unset_field(&mut self, wire_name: &str, old: &mut OldValues) -> Option<PropId> {
        match self
            .entries
            .iter()
            .position(|e| e.property.name() == wire_name)
        {
            Some(i) => {
                let removed = self.entries.remove(i);
                old.record(removed.id, removed.property, Some(removed.value));
                Some(removed.id)
            }
            None => {
                let known = super::core_id(wire_name).is_some()
                    || crate::ext::with_thread_registry(|r| {
                        r.is_none_or(|r| r.styles().id(wire_name).is_some())
                    });
                if !known {
                    tracing::warn!(
                        target: "bevy_react",
                        "unknown style field {wire_name:?} in styleUnset; ignoring"
                    );
                }
                None
            }
        }
    }

    /// Insert every property of `defaults` this style does not set (an
    /// element's default style under the user's). Clones only the defaults'
    /// entries.
    pub(crate) fn fill_defaults(&mut self, defaults: &Style) {
        for entry in &defaults.entries {
            if let Err(i) = self.entries.binary_search_by_key(&entry.id, |e| e.id) {
                self.entries.insert(i, entry.clone());
            }
        }
    }

    /// Restore `id` from `defaults` (after the user unset it), when the
    /// defaults set it.
    pub(crate) fn restore_default(&mut self, defaults: &Style, id: PropId) {
        if let Ok(i) = defaults.entries.binary_search_by_key(&id, |e| e.id) {
            self.insert(defaults.entries[i].clone());
        }
    }

    /// Overlay a hover/press/focus variant: every property the variant sets
    /// wins.
    pub(crate) fn overlay_variant(&mut self, overlay: &Style) {
        for entry in &overlay.entries {
            self.insert(entry.clone());
        }
    }
}

impl fmt::Debug for Style {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.debug_map()
            .entries(self.entries.iter().map(|e| (e.property.name(), &*e.value)))
            .finish()
    }
}

/// Whether `registered` is the `property` declaration itself.
fn is<T: 'static>(registered: &dyn AnyStyleProperty, property: &StyleProperty<T>) -> bool {
    std::ptr::addr_eq(
        registered as *const dyn AnyStyleProperty,
        property as *const StyleProperty<T>,
    )
}

/// The id of `property` in the decode scope: a core property's fixed id, or
/// its id in this thread's registry.
fn resolve_id(property: &dyn AnyStyleProperty) -> Option<PropId> {
    super::core_id(property.name()).or_else(|| {
        crate::ext::with_thread_registry(|r| r.and_then(|r| r.styles().id_of(property)))
    })
}

/// A key of a `style` object: a registered property, or an unknown name.
enum Key {
    Known(PropId, &'static dyn AnyStyleProperty),
    Unknown,
}

/// Resolve a key against this thread's registry (the core's alone when none
/// is installed — a headless decode), without allocating for known keys.
struct KeySeed;

impl<'de> DeserializeSeed<'de> for KeySeed {
    type Value = Key;
    fn deserialize<D: Deserializer<'de>>(self, d: D) -> Result<Key, D::Error> {
        d.deserialize_str(self)
    }
}

impl<'de> Visitor<'de> for KeySeed {
    type Value = Key;
    fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str("a style property name")
    }
    fn visit_str<E: de::Error>(self, name: &str) -> Result<Key, E> {
        let resolved = crate::ext::with_thread_registry(|r| {
            let styles = match r {
                Some(r) => r.styles(),
                None => super::core_registry(),
            };
            styles
                .id(name)
                .and_then(|id| styles.by_id(id).map(|p| (id, p)))
        });
        Ok(match resolved {
            Some((id, property)) => Key::Known(id, property),
            None => {
                crate::protocol::decode_warn(
                    "unknownStyleField",
                    name,
                    &format!("unknown style property {name:?}"),
                );
                Key::Unknown
            }
        })
    }
}

/// Decode one property value through its codec (type-erased — the codec
/// decodes straight into the property's type, no intermediate tree).
struct ValueSeed(&'static dyn AnyStyleProperty);

impl<'de> DeserializeSeed<'de> for ValueSeed {
    type Value = Option<StoredValue>;
    fn deserialize<D: Deserializer<'de>>(self, d: D) -> Result<Self::Value, D::Error> {
        let mut erased = <dyn erased_serde::Deserializer>::erase(d);
        self.0.decode_value(&mut erased).map_err(de::Error::custom)
    }
}

impl<'de> serde::Deserialize<'de> for Style {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct V;
        impl<'de> Visitor<'de> for V {
            type Value = Style;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a style object")
            }
            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Style, A::Error> {
                let mut style = Style::default();
                while let Some(key) = map.next_key_seed(KeySeed)? {
                    match key {
                        Key::Known(id, property) => {
                            match map.next_value_seed(ValueSeed(property))? {
                                Some(value) => style.insert(Entry {
                                    id,
                                    property,
                                    value,
                                }),
                                // `null` (or a value its decoder dropped
                                // after reporting it) is absent.
                                None => style.entries.retain(|e| e.id != id),
                            }
                        }
                        Key::Unknown => {
                            map.next_value::<IgnoredAny>()?;
                        }
                    }
                }
                Ok(style)
            }
        }
        d.deserialize_map(V)
    }
}
