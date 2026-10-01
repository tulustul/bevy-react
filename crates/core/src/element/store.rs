//! [`Attrs`] — one node's element attributes: a sparse list of the ones it
//! sets, sorted by their index in the element's attribute list, read with
//! the attribute statics as typed keys (`attrs.get(&SRC)`).

use std::fmt;

use super::attribute::{AnyAttribute, Attribute, is_attr};
use crate::style::{PropertyValue, StoredValue, StyleValueDyn};

/// Which of an element's attributes a delta touched (bit = the attribute's
/// index in [`Element::attrs`](super::Element::attrs)).
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub struct AttrDirty(pub u64);

impl AttrDirty {
    pub const NONE: Self = Self(0);

    pub fn insert(&mut self, index: u8) {
        self.0 |= 1 << index;
    }

    pub fn any(&self) -> bool {
        self.0 != 0
    }

    pub fn union(self, other: Self) -> Self {
        Self(self.0 | other.0)
    }
}

pub(crate) struct Entry {
    /// The attribute's index in its element's attribute list.
    pub(crate) index: u8,
    pub(crate) attr: &'static dyn AnyAttribute,
    pub(crate) value: StoredValue,
}

impl Clone for Entry {
    fn clone(&self) -> Self {
        Self {
            index: self.index,
            attr: self.attr,
            value: self.value.clone_value(),
        }
    }
}

/// The element attributes of one node (or of one delta): each set attribute
/// once, sorted by its index in the element's attribute list. Decoded
/// against the node's element (see [`crate::element`]); read with the
/// attribute statics as typed keys.
#[derive(Default, Clone)]
pub struct Attrs {
    entries: Vec<Entry>,
}

impl Attrs {
    /// The empty set.
    pub fn empty() -> &'static Attrs {
        static EMPTY: Attrs = Attrs {
            entries: Vec::new(),
        };
        &EMPTY
    }

    /// The value of `attribute`, if set. Attributes are identified by their
    /// declaration's address — declare them `static`, never `const`.
    pub fn get<T: PropertyValue>(&self, attribute: &Attribute<T>) -> Option<&T> {
        self.entries
            .iter()
            .find(|e| is_attr(e.attr, attribute))
            .and_then(|e| e.value.as_any().downcast_ref::<T>())
    }

    /// Whether `attribute` is set.
    pub fn contains<T: 'static>(&self, attribute: &Attribute<T>) -> bool {
        self.entries.iter().any(|e| is_attr(e.attr, attribute))
    }

    /// The value stored under the wire name `name`, type-erased.
    pub fn get_by_name(&self, name: &str) -> Option<&dyn StyleValueDyn> {
        self.entries
            .iter()
            .find(|e| e.attr.name() == name)
            .map(|e| &*e.value)
    }

    /// Whether no attribute is set.
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Every set attribute with its value, in element order.
    pub fn iter(&self) -> impl Iterator<Item = (&'static dyn AnyAttribute, &dyn StyleValueDyn)> {
        self.entries.iter().map(|e| (e.attr, &*e.value))
    }

    /// The attributes this set carries, as a dirty mask.
    pub fn keys(&self) -> AttrDirty {
        AttrDirty(self.entries.iter().fold(0, |m, e| m | 1 << e.index))
    }

    pub(crate) fn insert(&mut self, entry: Entry) {
        match self.entries.binary_search_by_key(&entry.index, |e| e.index) {
            Ok(i) => self.entries[i] = entry,
            Err(i) => self.entries.insert(i, entry),
        }
    }

    /// Clear the attribute at `index`; whether it was set.
    pub(crate) fn remove_index(&mut self, index: u8) -> bool {
        match self.entries.binary_search_by_key(&index, |e| e.index) {
            Ok(i) => {
                self.entries.remove(i);
                true
            }
            Err(_) => false,
        }
    }

    /// Move the act-now entries out (they are never retained).
    pub(crate) fn take_events(&mut self) -> Attrs {
        if !self.entries.iter().any(|e| e.attr.is_event()) {
            return Attrs::default();
        }
        let (events, retained) = std::mem::take(&mut self.entries)
            .into_iter()
            .partition(|e| e.attr.is_event());
        self.entries = retained;
        Attrs { entries: events }
    }

    /// Move every entry of `delta` onto `self` (the delta is consumed) and
    /// return the attributes whose value actually changed —
    /// compare-before-set, so a re-sent unchanged value re-runs nothing.
    pub(crate) fn overlay_delta(&mut self, delta: &mut Attrs) -> AttrDirty {
        let mut dirty = AttrDirty::NONE;
        for entry in delta.entries.drain(..) {
            match self.entries.binary_search_by_key(&entry.index, |e| e.index) {
                Ok(i) => {
                    if !self.entries[i].value.dyn_eq(&*entry.value) {
                        dirty.insert(entry.index);
                        self.entries[i] = entry;
                    }
                }
                Err(i) => {
                    dirty.insert(entry.index);
                    self.entries.insert(i, entry);
                }
            }
        }
        dirty
    }
}

impl fmt::Debug for Attrs {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.debug_map()
            .entries(self.entries.iter().map(|e| (e.attr.name(), &*e.value)))
            .finish()
    }
}

impl PartialEq for Attrs {
    fn eq(&self, other: &Self) -> bool {
        self.entries.len() == other.entries.len()
            && self
                .entries
                .iter()
                .zip(&other.entries)
                .all(|(a, b)| a.index == b.index && a.value.dyn_eq(&*b.value))
    }
}
