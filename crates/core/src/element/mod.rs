//! The element registry. Every element kind — the core's and a feature
//! crate's alike — is a `static` [`Element`] registered with
//! `ReactAppExt::add_react_element(s)`: its flags, its [`Attribute`]s (the
//! element-specific props, each a `static` that doubles as the typed key the
//! merged attributes are read with), the [`Writer`](crate::style::Writer)s
//! that turn attributes (and style properties) into components, its own
//! [`ElementEvent`]s, a default style, and a spawn hook for the components
//! it is born with. The core's own elements are
//! [`CORE_ELEMENTS`](crate::elements::CORE_ELEMENTS).
//!
//! Attributes are **per element**: an element's attribute list is its
//! namespace, so decoding a prop needs the node's kind. The op decoder
//! installs it per op ([`DecodeScope`]) from the op's `kind` key, which the
//! JS runtime emits before `props` on every create and update.
//!
//! The props every element shares (`name`, `sharedTag`, the style variants,
//! the pointer/scroll/wheel handlers, the controlled scroll offsets) are not
//! attributes: they stay fixed `Props` fields, grouped by [`Common`] — an
//! element declares the groups that apply to it.

mod attribute;
mod decl;
mod event;
mod registry;
mod store;
pub(crate) mod ts;

#[cfg(test)]
mod apply_tests;
#[cfg(test)]
mod tests;

use std::cell::RefCell;
use std::sync::Arc;

pub use attribute::{AnyAttribute, AttrBinding, Attribute, animatable_binding};
pub use decl::{Common, Element, SpawnCtx, SpawnFn};
pub use event::{AnyElementEvent, ElementEvent, ElementEvents, EventSubscriptions, handler_prop};
pub use registry::ElementInfo;
pub(crate) use store::Entry;
pub use store::{AttrDirty, Attrs};

thread_local! {
    /// The element the props being decoded on this thread belong to (see
    /// [`DecodeScope`]); `None` outside an op.
    static DECODE_ELEMENT: RefCell<Option<DecodeElement>> = const { RefCell::new(None) };
}

/// The decode scope's element: resolved, or a kind the registry does not
/// know (its attributes drop silently — the kind itself is reported once at
/// apply).
#[derive(Clone)]
pub(crate) enum DecodeElement {
    Known(Arc<ElementInfo>),
    Unknown,
}

/// While alive, props decoded on this thread resolve their attributes
/// against `kind`'s element (the thread's registry). The op decoder opens
/// one per create/update op; harnesses decoding bare props open one too.
pub struct DecodeScope {
    previous: Option<DecodeElement>,
}

impl DecodeScope {
    /// Scope decoding to the element registered as `kind` on this thread.
    pub fn new(kind: &str) -> Self {
        let element = crate::ext::with_thread_registry(|r| {
            let registry = match r {
                Some(r) => r.element_info(kind).cloned(),
                None => crate::ext::core_element_info(kind),
            };
            match registry {
                Some(info) => DecodeElement::Known(info),
                None => DecodeElement::Unknown,
            }
        });
        let previous = DECODE_ELEMENT.with(|e| e.borrow_mut().replace(element));
        Self { previous }
    }
}

impl Drop for DecodeScope {
    fn drop(&mut self) {
        let previous = self.previous.take();
        DECODE_ELEMENT.with(|e| *e.borrow_mut() = previous);
    }
}

/// The current decode scope's element.
pub(crate) fn decode_element() -> Option<DecodeElement> {
    DECODE_ELEMENT.with(|e| e.borrow().clone())
}
