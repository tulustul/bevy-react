//! [`ElementInfo`] — a registered element resolved against the app's style
//! registry: its attribute and event lookup tables, and the writers a
//! change re-runs on it (the global style writers it keeps plus its own).

use std::sync::OnceLock;

use bevy::platform::collections::HashMap;

use super::attribute::{AnyAttribute, same_attr};
use super::decl::Element;
use super::event::handler_prop;
use super::store::AttrDirty;
use crate::ext::TextRole;
use crate::style::{Invalidation, Style, StyleDirty, StyleRegistry, Writer, WriterMask};

/// The props every element shares, fixed on `Props` — never an attribute
/// name (see [`Common`](super::Common)).
pub(crate) const COMMON_PROPS: &[&str] = &[
    "style",
    "hoverStyle",
    "pressStyle",
    "focusStyle",
    "name",
    "sharedTag",
    "onClick",
    "onPointerDown",
    "onPointerMove",
    "onPointerUp",
    "onPointerEnter",
    "onPointerLeave",
    "onScroll",
    "onWheel",
    "scrollTop",
    "scrollLeft",
    "scrollStep",
];

/// Names no attribute may take: the common props, React's own, and the
/// handler space (`on` + an uppercase letter — JS routes a function there).
fn reserved(name: &str) -> bool {
    COMMON_PROPS.contains(&name)
        || matches!(name, "children" | "key" | "ref")
        || name
            .strip_prefix("on")
            .and_then(|rest| rest.chars().next())
            .is_some_and(|c| c.is_ascii_uppercase())
}

/// A registered element, resolved (see the module docs). Shared by the op
/// decode (attribute lookup) and the apply path (writer tables).
pub struct ElementInfo {
    /// The declaration.
    pub decl: &'static Element,
    attr_by_name: HashMap<&'static str, u8>,
    /// `(handler prop, event index)`, e.g. `("onChange", 0)`.
    event_props: Vec<(String, u8)>,
    /// The global style writers that run on this element (all of them,
    /// minus the ones its own writers' components or `suppress` mask off —
    /// and only the text writers for a node-less text span).
    pub(crate) global_mask: WriterMask,
    /// Per attribute index: the element writers reading it.
    attr_readers: Vec<u64>,
    /// Per element writer: the style properties it reads.
    style_reads: Vec<StyleDirty>,
    /// Style properties only masked-off global writers read (`styleIgnored`).
    pub(crate) ignored_styles: StyleDirty,
    /// Attribute bits whose change is paint (layer content dirt).
    paint_attrs: u64,
    default_style: OnceLock<Option<Style>>,
}

impl ElementInfo {
    /// Resolve `decl` against the app's global style writers.
    ///
    /// # Panics
    /// On a malformed declaration: more than 64 attributes, writers, or
    /// events; a duplicate or reserved attribute name; a required attribute
    /// the element does not list; two of the element's writers writing one
    /// component. (A writer may read attributes the element does not list —
    /// one writer shared by several elements, each listing a subset: those
    /// are simply never set on this element.)
    pub(crate) fn build(decl: &'static Element, styles: &StyleRegistry) -> Self {
        let kind = decl.name;
        assert!(
            decl.attrs.len() <= 64 && decl.writers.len() <= 64 && decl.events.len() <= 64,
            "bevy-react: element <{kind}> declares more than 64 attributes, writers, or events"
        );
        let mut attr_by_name = HashMap::default();
        for (i, attr) in decl.attrs.iter().enumerate() {
            let name = attr.name();
            assert!(
                !reserved(name),
                "bevy-react: element <{kind}> attribute {name:?} is a reserved prop name"
            );
            assert!(
                attr_by_name.insert(name, i as u8).is_none(),
                "bevy-react: element <{kind}> declares attribute {name:?} twice"
            );
        }
        let index_of = |attr: &dyn AnyAttribute| -> Option<u8> {
            decl.attrs
                .iter()
                .position(|a| same_attr(*a, attr))
                .map(|i| i as u8)
        };
        for attr in decl.required {
            assert!(
                index_of(*attr).is_some(),
                "bevy-react: element <{kind}> requires attribute {:?} it does not list",
                attr.name()
            );
        }
        let mut event_props = Vec::new();
        for (i, event) in decl.events.iter().enumerate() {
            let prop = handler_prop(event.name());
            assert!(
                !COMMON_PROPS.contains(&prop.as_str()),
                "bevy-react: element <{kind}> event {:?} collides with the common prop {prop:?}",
                event.name()
            );
            assert!(
                !event_props.iter().any(|(p, _)| *p == prop),
                "bevy-react: element <{kind}> declares event {:?} twice",
                event.name()
            );
            event_props.push((prop, i as u8));
        }

        // The element's own writers: attribute readers, style reads, and
        // the global writers their components mask off.
        let mut attr_readers = vec![0u64; decl.attrs.len()];
        let mut style_reads = Vec::with_capacity(decl.writers.len());
        let mut owned: Vec<std::any::TypeId> = Vec::new();
        let mut masked = WriterMask::NONE;
        for (bit, writer) in decl.writers.iter().enumerate() {
            for attr in writer.attrs {
                if let Some(index) = index_of(*attr) {
                    attr_readers[index as usize] |= 1 << bit;
                }
            }
            style_reads.push(styles.dirty_of(writer.reads));
            for key in writer.writes {
                let (type_id, name) = key();
                assert!(
                    !owned.contains(&type_id),
                    "bevy-react: two writers of <{kind}> write {name}"
                );
                owned.push(type_id);
                masked = masked.union(styles.writers_writing(type_id));
            }
        }
        masked = masked.union(styles.writer_bits(decl.suppress));
        let global_mask = if decl.flags.node_less {
            // No `Node`: only the text writers apply, and only to a span.
            if decl.flags.text == TextRole::None {
                WriterMask::NONE
            } else {
                styles.masks.span
            }
        } else {
            styles.all_writers().without(masked)
        };

        // `styleIgnored`: a property some global writer reads, none of the
        // kept ones nor the element's own do. (Node-less elements warn in
        // their own terms.)
        let mut ignored_styles = StyleDirty::NONE;
        if !decl.flags.node_less {
            let own_reads = style_reads
                .iter()
                .fold(StyleDirty::NONE, |acc, s| acc.union(*s));
            for (id, _) in styles.iter() {
                let readers = styles.readers_of_id(id);
                if !readers.is_empty()
                    && !readers.intersects(global_mask)
                    && !own_reads.contains(id)
                {
                    ignored_styles.insert(id);
                }
            }
        }

        let paint_attrs = decl
            .attrs
            .iter()
            .enumerate()
            .filter(|(_, a)| a.invalidation().contains(Invalidation::PAINT))
            .fold(0u64, |m, (i, _)| m | 1 << i);

        Self {
            decl,
            attr_by_name,
            event_props,
            global_mask,
            attr_readers,
            style_reads,
            ignored_styles,
            paint_attrs,
            default_style: OnceLock::new(),
        }
    }

    /// The element's name.
    pub fn name(&self) -> &'static str {
        self.decl.name
    }

    /// The attribute named `name`, with its index.
    pub fn attr(&self, name: &str) -> Option<(u8, &'static dyn AnyAttribute)> {
        self.attr_by_name
            .get(name)
            .map(|&i| (i, self.decl.attrs[i as usize]))
    }

    /// The event whose handler prop is `prop` (`"onChange"`), by index.
    pub fn event_for_prop(&self, prop: &str) -> Option<u8> {
        self.event_props
            .iter()
            .find(|(p, _)| p == prop)
            .map(|(_, i)| *i)
    }

    /// The element writers a change re-runs: those reading a touched style
    /// property or a touched attribute.
    pub(crate) fn writers_for(&self, style: &StyleDirty, attrs: AttrDirty) -> u64 {
        let mut mask = 0u64;
        for (bit, reads) in self.style_reads.iter().enumerate() {
            if style.is_all() || reads.intersects(style) {
                mask |= 1 << bit;
            }
        }
        let mut bits = attrs.0;
        while bits != 0 {
            let i = bits.trailing_zeros() as usize;
            bits &= bits - 1;
            if let Some(readers) = self.attr_readers.get(i) {
                mask |= readers;
            }
        }
        mask
    }

    /// Every element writer.
    pub(crate) fn all_writers(&self) -> u64 {
        match self.decl.writers.len() {
            64 => u64::MAX,
            n => (1u64 << n) - 1,
        }
    }

    /// The element writer with bit `bit`.
    pub(crate) fn writer_at(&self, bit: usize) -> &'static Writer {
        self.decl.writers[bit]
    }

    /// What an attribute change invalidates.
    pub(crate) fn attr_invalidation(&self, dirty: AttrDirty) -> Invalidation {
        if dirty.0 & self.paint_attrs != 0 {
            Invalidation::PAINT
        } else {
            Invalidation::NONE
        }
    }

    /// The element's default style, built once.
    pub fn default_style(&self) -> Option<&Style> {
        self.default_style
            .get_or_init(|| self.decl.default_style.map(|f| f()))
            .as_ref()
    }

    /// Fill the element's default style under a node's user style (in
    /// place — the retained style carries the defaults, so no apply path ever
    /// overlays them per op; `merge_delta` restores a default the user
    /// unsets).
    pub fn fill_default_style(&self, style: &mut Option<Style>) {
        if let Some(default) = self.default_style() {
            style.get_or_insert_default().fill_defaults(default);
        }
    }
}

impl std::fmt::Debug for ElementInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "ElementInfo({:?})", self.decl.name)
    }
}
