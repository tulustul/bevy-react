//! [`Writer`] — the behavior half of the style registry: the code that turns
//! the merged style into ECS state. Each writer declares the properties it
//! reads and the components it writes; a style change re-runs exactly the
//! writers that read a changed property.

use std::any::TypeId;

use bevy::prelude::*;

use super::AnyStyleProperty;
use crate::ext::ElementFlags;
use crate::style::Style;

/// A component a writer owns, as a `static`-friendly fn (see [`owns`]).
pub type ComponentKey = fn() -> (TypeId, &'static str);

/// The [`ComponentKey`] of `C`: `writes: &[owns::<BackgroundColor>]`.
pub fn owns<C: Component>() -> (TypeId, &'static str) {
    (TypeId::of::<C>(), std::any::type_name::<C>())
}

/// Style (and element attributes) → ECS state. A **global** writer reads
/// style properties only and runs on every styled element — register it
/// with `ReactAppExt::add_react_style_writer`. An **element** writer is
/// listed on its [`Element`](crate::element::Element) and runs only there;
/// it may also read the element's attributes (`attrs`), through
/// [`WriterCtx::attr`] / [`WriterCtx::event`].
///
/// ```ignore
/// pub static GLOW_WRITER: Writer = Writer {
///     reads: &[&GLOW, &OPACITY],
///     attrs: &[],
///     writes: &[owns::<GlowSettings>],
///     apply: apply_glow,
/// };
/// ```
pub struct Writer {
    /// The style properties the writer reads: a change to any re-runs it.
    pub reads: &'static [&'static dyn AnyStyleProperty],
    /// The element attributes it reads (an element writer only): a change
    /// to any re-runs it.
    pub attrs: &'static [&'static dyn crate::element::AnyAttribute],
    /// The components it writes. A component has one writer — registering a
    /// second writer for it panics.
    pub writes: &'static [ComponentKey],
    /// Write the entity's state from the full merged `style` (never a
    /// delta): an absent property means "remove / reset". On a freshly
    /// spawned entity (`ctx.fresh`) a writer runs only when the style sets
    /// one of its `reads` — there is nothing to remove yet.
    pub apply: fn(&WriterCtx, &Style, &mut EntityCommands),
}

/// What a writer knows about the node beyond its style.
pub struct WriterCtx<'a> {
    /// The node is a promoted layer root (the opacity fold is suppressed;
    /// the layer's group alpha owns the fade).
    pub promoted: bool,
    /// The entity was spawned this commit: there is nothing to remove, so
    /// "absent → remove" branches can skip their (no-op) removals.
    pub fresh: bool,
    /// The element kind (`"node"`, `"button"`, `"text"`, a registered kind…).
    pub kind: &'a str,
    /// The element kind's flags.
    pub flags: ElementFlags,
    pub assets: &'a AssetServer,
    pub(crate) fonts: &'a crate::plugin::Fonts,
    /// The registry whose writers the apply loop runs.
    pub(crate) styles: &'a super::StyleRegistry,
    /// The node's element (its writer tables).
    pub(crate) element: &'a crate::element::ElementInfo,
    /// The node's merged (retained) attributes.
    pub attrs: &'a crate::element::Attrs,
    /// The act-now attributes of the delta being applied (empty on a
    /// restyle).
    pub events: &'a crate::element::Attrs,
    /// The node being written.
    pub id: crate::protocol::NodeId,
}

impl WriterCtx<'_> {
    /// The node's merged value of `attribute`.
    pub fn attr<T: super::PropertyValue>(
        &self,
        attribute: &crate::element::Attribute<T>,
    ) -> Option<&T> {
        self.attrs.get(attribute)
    }

    /// The act-now `attribute` carried by the delta being applied.
    pub fn event<T: super::PropertyValue>(
        &self,
        attribute: &crate::element::Attribute<T>,
    ) -> Option<&T> {
        self.events.get(attribute)
    }

    /// Whether the node takes part in the text model (its text writers run).
    pub fn text(&self) -> bool {
        self.flags.text != crate::ext::TextRole::None
    }
}

/// A set of registered writers (bit = registration index).
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub struct WriterMask(pub u64);

impl WriterMask {
    pub const NONE: Self = Self(0);
    pub const ALL: Self = Self(u64::MAX);

    pub const fn union(self, other: Self) -> Self {
        Self(self.0 | other.0)
    }

    pub const fn without(self, other: Self) -> Self {
        Self(self.0 & !other.0)
    }

    pub const fn intersection(self, other: Self) -> Self {
        Self(self.0 & other.0)
    }

    pub const fn intersects(self, other: Self) -> bool {
        self.0 & other.0 != 0
    }

    pub const fn is_empty(self) -> bool {
        self.0 == 0
    }
}

impl std::ops::BitOr for WriterMask {
    type Output = Self;
    fn bitor(self, rhs: Self) -> Self {
        self.union(rhs)
    }
}
