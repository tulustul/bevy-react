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

/// Style → ECS state for a set of properties. Register with
/// `ReactAppExt::add_react_style_writer`.
///
/// ```ignore
/// pub static GLOW_WRITER: Writer = Writer {
///     reads: &[&GLOW, &OPACITY],
///     writes: &[owns::<GlowSettings>],
///     apply: apply_glow,
/// };
/// ```
pub struct Writer {
    /// The properties the writer reads: a change to any re-runs it.
    pub reads: &'static [&'static dyn AnyStyleProperty],
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
    /// The node carries text (a `<text>` root, a span, an `editableText`).
    pub text: bool,
    pub assets: &'a AssetServer,
    pub(crate) fonts: &'a crate::plugin::Fonts,
    /// The registry whose writers the apply loop runs.
    pub(crate) styles: &'a super::StyleRegistry,
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
