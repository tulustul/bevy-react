//! [`StyleRegistry`] — every registered style property and writer, core and
//! feature.

use std::any::TypeId;

use bevy::platform::collections::HashMap;

use super::dirty::{MAX_PROPERTIES, StyleDirty};
use super::property::AnyStyleProperty;
use super::props::CORE_STYLES;
use super::writer::{Writer, WriterMask};

/// A registered property's id: a core property's is its index in
/// [`CORE_STYLES`] (fixed, whatever the registration order — so the merge
/// path needs no registry to name one); a feature property's follows the
/// core range in registration order.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct PropId(pub u16);

/// The fixed id of a core property, by name.
pub(crate) fn core_id(name: &str) -> Option<PropId> {
    static IDS: std::sync::OnceLock<HashMap<&'static str, PropId>> = std::sync::OnceLock::new();
    IDS.get_or_init(|| {
        CORE_STYLES
            .iter()
            .enumerate()
            .map(|(i, p)| (p.name(), PropId(i as u16)))
            .collect()
    })
    .get(name)
    .copied()
}

/// The fixed id of `property` when it is a core declaration.
fn core_id_of(property: &dyn AnyStyleProperty) -> Option<PropId> {
    CORE_STYLES
        .iter()
        .position(|p| same_declaration(*p, property))
        .map(|i| PropId(i as u16))
}

/// The style properties and writers of one app, in registration order.
/// Lives inside [`ExtRegistry`](crate::ext::ExtRegistry), so the decoding
/// host and the apply path receive it through the same handoff as the
/// feature prop keys.
#[derive(Default, Clone)]
pub struct StyleRegistry {
    /// By id; the core range is reserved (`None` until registered).
    props: Vec<Option<&'static dyn AnyStyleProperty>>,
    by_name: HashMap<&'static str, PropId>,
    writers: Vec<&'static Writer>,
    /// Component → the writer claiming it (its bit, and its type name for
    /// the panic).
    owners: HashMap<TypeId, (usize, &'static str)>,
    /// Per property (by id): the writers reading it. Rebuilt on every
    /// registration, so it is right whatever the registration order.
    readers: Vec<WriterMask>,
    /// The core writer sets the apply paths consult per op, resolved once.
    pub(crate) masks: CoreWriterMasks,
    /// The auto-stamped properties: feature properties no writer reads.
    stamped: Vec<PropId>,
}

/// The bits of the core writer sets the apply paths consult per op (see
/// `crate::style::writers`), resolved at registration instead of per op.
#[derive(Debug, Default, Clone, Copy)]
pub(crate) struct CoreWriterMasks {
    pub fresh_bundled: WriterMask,
    pub span: WriterMask,
    pub text_color: WriterMask,
    pub text_font: WriterMask,
    pub transition: WriterMask,
}

impl StyleRegistry {
    /// Register one property.
    ///
    /// # Panics
    /// On a name already registered — two features claiming one property,
    /// or a feature re-declaring a core one — caught at startup, never a
    /// silent last-writer-wins.
    pub fn add(&mut self, property: &'static dyn AnyStyleProperty) {
        let name = property.name();
        assert!(
            !self.by_name.contains_key(name),
            "bevy-react: style property {name:?} registered twice"
        );
        if self.props.len() < CORE_STYLES.len() {
            self.props.resize(CORE_STYLES.len(), None);
        }
        let id = match core_id_of(property) {
            Some(id) => id,
            None => {
                assert!(
                    self.props.len() < MAX_PROPERTIES,
                    "bevy-react: more than {MAX_PROPERTIES} style properties"
                );
                self.props.push(None);
                PropId(self.props.len() as u16 - 1)
            }
        };
        self.props[id.0 as usize] = Some(property);
        self.by_name.insert(name, id);
        self.rebuild_readers();
    }

    /// Register one writer.
    ///
    /// # Panics
    /// On a writer registered twice, a component another writer already
    /// writes (one owner per component), or past 64 writers.
    pub fn add_writer(&mut self, writer: &'static Writer) {
        assert!(
            !self.writers.iter().any(|w| std::ptr::eq(*w, writer)),
            "bevy-react: style writer registered twice"
        );
        assert!(
            self.writers.len() < 64,
            "bevy-react: more than 64 style writers"
        );
        assert!(
            writer.attrs.is_empty(),
            "bevy-react: a global style writer cannot read element attributes — list it on \
             the element instead"
        );
        let bit = self.writers.len();
        for key in writer.writes {
            let (type_id, name) = key();
            assert!(
                self.owners.insert(type_id, (bit, name)).is_none(),
                "bevy-react: two style writers write {name}"
            );
        }
        self.writers.push(writer);
        self.rebuild_readers();
        use super::writers as w;
        self.masks = CoreWriterMasks {
            fresh_bundled: self.writer_bits(w::FRESH_BUNDLED),
            span: self.writer_bits(w::SPAN_WRITERS),
            text_color: self.writer_bit(&w::TEXT_COLOR_WRITER),
            text_font: self.writer_bit(&w::TEXT_FONT_WRITER),
            transition: self.writer_bit(&w::TRANSITION_WRITER),
        };
    }

    /// The writer with bit `bit`.
    pub(crate) fn writer_at(&self, bit: usize) -> &'static Writer {
        self.writers[bit]
    }

    fn rebuild_readers(&mut self) {
        self.readers = vec![WriterMask::NONE; self.props.len()];
        for (bit, writer) in self.writers.iter().enumerate() {
            for property in writer.reads {
                if let Some(id) = self.id_of(*property) {
                    self.readers[id.0 as usize].0 |= 1 << bit;
                }
            }
        }
        // Auto-stamping: a feature property no writer reads is read by the
        // stamp writer. (A core property is always consumed by its engine.)
        let stamp = self.writer_bit(&super::STAMP_WRITER);
        self.stamped.clear();
        for (i, property) in self.props.iter().enumerate() {
            if i >= CORE_STYLES.len() && property.is_some() && self.readers[i].is_empty() {
                self.stamped.push(PropId(i as u16));
                self.readers[i] = stamp;
            }
        }
    }

    /// The auto-stamped properties (see [`StyleValue`](super::StyleValue)).
    pub fn stamped(&self) -> &[PropId] {
        &self.stamped
    }

    /// Check the registrations as a whole — once every plugin has
    /// registered (a property can gain its writer after it was declared).
    ///
    /// # Panics
    /// On two auto-stamped properties with one value type: their
    /// `StyleValue<T>` components would collide on the entity.
    pub fn validate(&self) {
        let mut seen: HashMap<std::any::TypeId, &'static str> = HashMap::default();
        for &id in &self.stamped {
            let Some(property) = self.by_id(id) else {
                continue;
            };
            if let Some(other) = seen.insert(property.value_type_id(), property.name()) {
                panic!(
                    "bevy-react: style properties {other:?} and {:?} are both stamped as \
                     `StyleValue<{}>` — give one its own value type (a newtype) or a writer",
                    property.name(),
                    property.value_type_name()
                );
            }
        }
    }

    /// The property registered under `name`.
    pub fn get(&self, name: &str) -> Option<&'static dyn AnyStyleProperty> {
        self.id(name).and_then(|id| self.props[id.0 as usize])
    }

    /// The id of the property registered under `name`.
    pub fn id(&self, name: &str) -> Option<PropId> {
        self.by_name.get(name).copied()
    }

    /// The id of `property` (the registered declaration itself).
    pub fn id_of(&self, property: &dyn AnyStyleProperty) -> Option<PropId> {
        self.id(property.name())
            .filter(|id| self.props[id.0 as usize].is_some_and(|p| same_declaration(p, property)))
    }

    /// The property with id `id`, if registered.
    pub fn by_id(&self, id: PropId) -> Option<&'static dyn AnyStyleProperty> {
        self.props.get(id.0 as usize).copied().flatten()
    }

    /// Every registered property, by id.
    pub fn iter(&self) -> impl Iterator<Item = (PropId, &'static dyn AnyStyleProperty)> + '_ {
        self.props
            .iter()
            .enumerate()
            .filter_map(|(i, p)| p.map(|p| (PropId(i as u16), p)))
    }

    /// How many properties are registered.
    pub fn len(&self) -> usize {
        self.by_name.len()
    }

    pub fn is_empty(&self) -> bool {
        self.by_name.is_empty()
    }

    /// The set touching exactly `properties` (the registered ones).
    pub fn dirty_of(&self, properties: &[&dyn AnyStyleProperty]) -> StyleDirty {
        let mut dirty = StyleDirty::NONE;
        for property in properties {
            if let Some(id) = self.id_of(*property) {
                dirty.insert(id);
            }
        }
        dirty
    }

    /// Whether `dirty` touches any of `properties`.
    pub fn touches(&self, dirty: &StyleDirty, properties: &[&dyn AnyStyleProperty]) -> bool {
        properties
            .iter()
            .any(|p| self.id_of(*p).is_some_and(|id| dirty.contains(id)))
    }

    /// Every registered writer, with its bit.
    pub fn writers(&self) -> impl Iterator<Item = (usize, &'static Writer)> + '_ {
        self.writers.iter().copied().enumerate()
    }

    /// The writers a change to the `dirty` properties must re-run.
    pub fn writers_for(&self, dirty: &StyleDirty) -> WriterMask {
        if dirty.is_all() {
            return self.all_writers();
        }
        let mut mask = WriterMask::NONE;
        for id in dirty.ids() {
            if let Some(readers) = self.readers.get(id.0 as usize) {
                mask = mask.union(*readers);
            }
        }
        mask
    }

    /// Every registered writer.
    pub fn all_writers(&self) -> WriterMask {
        match self.writers.len() {
            64 => WriterMask::ALL,
            n => WriterMask((1u64 << n) - 1),
        }
    }

    /// What a change to the `dirty` properties invalidates on `node`: each
    /// property's declaration, evaluated against its replaced value (`old` —
    /// unknown for a restyle, where it reads as absent) and its value in the
    /// merged `style`.
    pub fn invalidation(
        &self,
        dirty: &StyleDirty,
        old: &super::OldValues,
        style: &super::Style,
        node: &super::NodeCtx<'_>,
    ) -> super::Invalidation {
        if dirty.is_all() {
            return super::Invalidation::ALL;
        }
        let mut invalidation = super::Invalidation::NONE;
        for id in dirty.ids() {
            if let Some(property) = self.by_id(id) {
                let previous = old.get(id).flatten();
                invalidation =
                    invalidation.union(property.invalidation(previous, style.get_dyn(id), node));
            }
        }
        invalidation
    }

    /// The global writer writing the component `type_id`, as a mask (empty
    /// when none does).
    pub fn writers_writing(&self, type_id: TypeId) -> WriterMask {
        self.owners
            .get(&type_id)
            .map_or(WriterMask::NONE, |(bit, _)| WriterMask(1 << bit))
    }

    /// The writers reading the property with id `id`.
    pub fn readers_of_id(&self, id: PropId) -> WriterMask {
        self.readers
            .get(id.0 as usize)
            .copied()
            .unwrap_or(WriterMask::NONE)
    }

    /// The writers reading `property`.
    pub fn readers_of(&self, property: &dyn AnyStyleProperty) -> WriterMask {
        self.id_of(property)
            .map_or(WriterMask::NONE, |id| self.readers[id.0 as usize])
    }

    /// The bit of `writer` (empty when unregistered).
    pub fn writer_bit(&self, writer: &Writer) -> WriterMask {
        self.writers
            .iter()
            .position(|w| std::ptr::eq(*w, writer))
            .map_or(WriterMask::NONE, |i| WriterMask(1 << i))
    }

    /// The bits of several writers.
    pub fn writer_bits(&self, writers: &[&Writer]) -> WriterMask {
        writers
            .iter()
            .fold(WriterMask::NONE, |m, w| m.union(self.writer_bit(w)))
    }
}

/// Whether `a` and `b` are the same property declaration (the same static).
fn same_declaration(a: &dyn AnyStyleProperty, b: &dyn AnyStyleProperty) -> bool {
    std::ptr::addr_eq(
        a as *const dyn AnyStyleProperty,
        b as *const dyn AnyStyleProperty,
    )
}
