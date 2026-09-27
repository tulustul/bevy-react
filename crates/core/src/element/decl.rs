//! [`Element`] — one element kind's declaration: its flags, attributes,
//! writers, events, default style, and born-with components.

use bevy::asset::{AssetServer, Assets, Handle};
use bevy::ecs::bundle::Bundle;
use bevy::ecs::entity::Entity;
use bevy::ecs::system::Commands;
use bevy::image::Image;

use super::attribute::AnyAttribute;
use super::event::AnyElementEvent;
use crate::bridge::ResolvedTextStyle;
use crate::ext::ElementFlags;
use crate::protocol::{NodeId, props::Props};
use crate::style::{Style, Writer};

/// The fixed common props (the ones every element kind shares, living as
/// plain `Props` fields rather than registered attributes), grouped. An
/// element declares the groups that apply to it; a common prop outside them
/// is ignored with a `propIgnored` warning.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Common(u8);

impl Common {
    /// `name` + `sharedTag`.
    pub const IDENTITY: Self = Self(1);
    /// `hoverStyle` / `pressStyle` / `focusStyle`.
    pub const VARIANTS: Self = Self(1 << 1);
    /// `onClick` + the `onPointer*` handlers.
    pub const POINTER: Self = Self(1 << 2);
    /// `onScroll` + `scrollTop` / `scrollLeft` / `scrollStep`.
    pub const SCROLL: Self = Self(1 << 3);
    /// `onWheel`.
    pub const WHEEL: Self = Self(1 << 4);
    /// Every group.
    pub const ALL: Self = Self(0b11111);

    /// The union of two sets.
    pub const fn with(self, other: Self) -> Self {
        Self(self.0 | other.0)
    }

    /// Whether every group of `other` is in the set.
    pub const fn contains(self, other: Self) -> bool {
        self.0 & other.0 == other.0
    }
}

/// An element's spawn hook: spawn the entity through [`SpawnCtx::spawn`]
/// with the components the element is born with (a blank `ImageNode`, a
/// `Button`, a text block). Everything prop-derived is the writers' job.
pub type SpawnFn = fn(&mut SpawnCtx<'_, '_, '_>) -> Entity;

/// One element kind. Declare it as a `static` and register it with
/// `ReactAppExt::add_react_element(s)` — which also registers its
/// attributes, writers, and events. The core's own elements are
/// [`CORE_ELEMENTS`](crate::elements::CORE_ELEMENTS), registered the same
/// way.
///
/// Every field is `pub` so a declaration can use struct-update syntax:
///
/// ```ignore
/// pub static IMAGE: Element = Element {
///     flags: ElementFlags::OWNS_IMAGE,
///     attrs: &[&SRC, &TINT],
///     writers: &[&IMAGE_WRITER],
///     ..Element::new("image")
/// };
/// ```
pub struct Element {
    /// The JSX intrinsic name (the create op's `kind`).
    pub name: &'static str,
    /// What the element is, as far as the core's shared systems care.
    pub flags: ElementFlags,
    /// The element's attributes — its namespace: a key outside this list
    /// (and outside the common props) is unknown on this element. At most
    /// 64; the index in this list is the attribute's bit.
    pub attrs: &'static [&'static dyn AnyAttribute],
    /// The attributes the generated JSX typing marks required.
    pub required: &'static [&'static dyn AnyAttribute],
    /// The common prop groups that apply.
    pub common: Common,
    /// The element's own writers, in apply order: they run after the global
    /// style writers, only on this element, and may read attributes and
    /// style properties. A component one of them writes masks off the
    /// global writer writing the same component, on this element.
    pub writers: &'static [&'static Writer],
    /// Global style writers this element opts out of (a style property
    /// only they read is ignored here, with a `styleIgnored` warning).
    pub suppress: &'static [&'static Writer],
    /// The element's own events (`onChange`, `onResize`, …).
    pub events: &'static [&'static dyn AnyElementEvent],
    /// The style the user's `style` overlays (a web "UA stylesheet"):
    /// unsetting a property falls back to this value.
    pub default_style: Option<fn() -> Style>,
    /// The spawn hook (see [`SpawnFn`]); `None` spawns the bare/styled
    /// entity with nothing extra.
    pub spawn: Option<SpawnFn>,
    /// The TypeScript type a `ref` on this element resolves to, when the
    /// runtime gives it a handle (the canvas's `BevyCanvasElement`).
    pub ts_ref: Option<&'static str>,
}

impl Element {
    /// A plain styled element named `name`: no attributes, every common
    /// group, nothing extra.
    pub const fn new(name: &'static str) -> Self {
        Self {
            name,
            flags: ElementFlags::NODE,
            attrs: &[],
            required: &[],
            common: Common::ALL,
            writers: &[],
            suppress: &[],
            events: &[],
            default_style: None,
            spawn: None,
            ts_ref: None,
        }
    }
}

impl std::fmt::Debug for Element {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Element({:?})", self.name)
    }
}

/// What an element's [`SpawnFn`] works with. [`spawn`](Self::spawn) creates
/// the entity — the bridge identity, the flags, and (for a styled element)
/// the always-present style components — in one bundle with the element's
/// own, so a fresh node lands in its final archetype at once.
pub struct SpawnCtx<'a, 'w, 's> {
    pub commands: &'a mut Commands<'w, 's>,
    pub images: &'a mut Assets<Image>,
    pub assets: &'a AssetServer,
    pub(crate) fonts: &'a crate::plugin::Fonts,
    /// The node id being created.
    pub id: NodeId,
    /// The element kind being created (a spawn hook shared by several
    /// elements branches on it).
    pub kind: &'a str,
    /// The create op's props (act-now attributes included).
    pub props: &'a Props,
    /// The effective style: the element's default style overlaid by the
    /// user's.
    pub style: &'a Option<Style>,
    /// The inline single-string child, for an element that takes one.
    pub text: Option<&'a str>,
    /// The element's flags.
    pub flags: ElementFlags,
}

impl SpawnCtx<'_, '_, '_> {
    /// Spawn the element's entity with `extra` (its born-with components).
    pub fn spawn(&mut self, extra: impl Bundle) -> Entity {
        let base = (crate::bridge::ReactNode(self.id), self.flags);
        if self.flags.node_less {
            self.commands.spawn((base, extra)).id()
        } else {
            self.commands
                .spawn((
                    base,
                    crate::ui_map::fresh_style_bundle(self.style, self.flags),
                    extra,
                ))
                .id()
        }
    }

    /// A fresh 1×1 transparent placeholder texture for an element-owned
    /// raster (repainted in place at laid-out size).
    pub fn blank_image(&mut self) -> Handle<Image> {
        self.images.add(crate::raster::blank_image())
    }

    /// The resolved text style of the effective style (color, font, line
    /// height, letter spacing) — a text element's born-with components.
    pub fn text_style(&self) -> ResolvedTextStyle {
        crate::ui_map::resolved_text_style(self.style.as_ref(), self.fonts, false)
    }
}
