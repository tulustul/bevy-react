//! [`Attribute`] — one element attribute: its wire name, codec, merge
//! semantics, and invalidation. A `static` of it is both the declaration
//! and the typed key (`props.attrs.get(&SRC)`).

use std::any::TypeId;
use std::collections::BTreeMap;
use std::fmt;

use serde::de::DeserializeOwned;

use crate::animations::protocol::Binding;
use crate::protocol::animatable::Animatable;
use crate::style::{Codec, Invalidation, PropertyValue, StoredValue, StyleValueDyn};

/// An attribute value's `{ animated }` support: the animation domain its
/// binding publishes under (`Ext { domain, name: <attribute name> }`, read
/// back from the entity's [`DrivenExtValues`](crate::ext::DrivenExtValues))
/// and how to pull the binding out of a decoded value.
pub struct AttrBinding<T: 'static> {
    /// The domain the evaluated scalar is published under.
    pub domain: &'static str,
    /// The value's binding, when it carries one.
    pub binding: fn(&T) -> Option<Binding>,
}

/// One element attribute. Declare it as a `static` and list it in an
/// [`Element`](super::Element)'s `attrs`; the static is also the typed key
/// the merged attributes are read with. An attribute belongs to the elements
/// that list it — two elements may declare different attributes under one
/// name (the namespace is per element), or share one static.
///
/// Every field is `pub` so a declaration can use struct-update syntax:
///
/// ```ignore
/// pub static SRC: Attribute<String> = Attribute {
///     invalidate: Invalidation::PAINT,
///     ..Attribute::new("src")
/// };
/// ```
pub struct Attribute<T: 'static> {
    /// The wire name (the JSX prop name).
    pub name: &'static str,
    /// How the value decodes and how TypeScript types it.
    pub codec: Codec<T>,
    /// An **act-now** attribute: present in a delta = do something once
    /// (push a controlled value, replay a display list). Never retained —
    /// a writer sees it only on the delta that carries it
    /// ([`WriterCtx::event`](crate::style::WriterCtx::event)), and removing
    /// it from the JSX props is a no-op.
    pub event: bool,
    /// What a change invalidates. [`Invalidation::PAINT`] re-captures the
    /// node's enclosing layer.
    pub invalidate: Invalidation,
    /// Whether the generated JSX typing names it (`false` for a wire-only
    /// attribute a runtime helper sends, like the canvas's `drawAppend`).
    pub typed: bool,
    /// `{ animated }` support (see [`AttrBinding`]).
    pub animated: Option<AttrBinding<T>>,
}

impl<T: PropertyValue + DeserializeOwned + ts_rs::TS> Attribute<T> {
    /// An attribute decoding through `T`'s `Deserialize`, typed as `T`'s
    /// ts-rs type; retained, invalidating nothing until declared otherwise.
    pub const fn new(name: &'static str) -> Self {
        Self::with_codec(name, Codec::serde())
    }
}

impl<T: PropertyValue> Attribute<T> {
    /// An attribute with an explicit [`Codec`].
    pub const fn with_codec(name: &'static str, codec: Codec<T>) -> Self {
        Self {
            name,
            codec,
            event: false,
            invalidate: Invalidation::NONE,
            typed: true,
            animated: None,
        }
    }
}

/// The binding of an [`Animatable`] value (its `{ animated }` wrapper), for
/// an [`AttrBinding::binding`].
pub fn animatable_binding<T>(value: &Animatable<T>) -> Option<Binding> {
    match value {
        Animatable::Animated(slot) => Some(slot.binding.clone()),
        Animatable::Static(_) => None,
    }
}

mod sealed {
    pub trait Sealed {}
}

impl<T: PropertyValue> sealed::Sealed for Attribute<T> {}

/// The type-erased view of an [`Attribute`]. Implemented only by
/// `Attribute<T>` (sealed).
pub trait AnyAttribute: sealed::Sealed + Send + Sync + 'static {
    /// The wire name.
    fn name(&self) -> &'static str;
    /// Whether the attribute is act-now (see [`Attribute::event`]).
    fn is_event(&self) -> bool;
    /// What a change invalidates.
    fn invalidation(&self) -> Invalidation;
    /// Whether the generated JSX typing names it.
    fn is_typed(&self) -> bool;
    /// The value type's `TypeId`.
    fn value_type_id(&self) -> TypeId;
    /// The TypeScript type expression of the value.
    fn ts_type(&self) -> String;
    /// Add the TS declarations [`ts_type`](Self::ts_type) needs.
    fn ts_decls(&self, decls: &mut BTreeMap<String, String>);
    /// The diag kind a keyword-valued attribute warns under.
    fn keyword_kind(&self) -> Option<&'static str>;
    /// Decode one wire value into the store's form.
    fn decode_value(
        &self,
        d: &mut dyn erased_serde::Deserializer<'_>,
    ) -> Result<Option<StoredValue>, erased_serde::Error>;
    /// The `{ animated }` binding a stored value carries, with its domain.
    fn binding(&self, value: &dyn StyleValueDyn) -> Option<(&'static str, Binding)>;
}

impl<T: PropertyValue> AnyAttribute for Attribute<T> {
    fn name(&self) -> &'static str {
        self.name
    }
    fn is_event(&self) -> bool {
        self.event
    }
    fn invalidation(&self) -> Invalidation {
        self.invalidate
    }
    fn is_typed(&self) -> bool {
        self.typed
    }
    fn value_type_id(&self) -> TypeId {
        TypeId::of::<T>()
    }
    fn ts_type(&self) -> String {
        self.codec.ts_type()
    }
    fn ts_decls(&self, decls: &mut BTreeMap<String, String>) {
        self.codec.ts_decls(decls);
    }
    fn keyword_kind(&self) -> Option<&'static str> {
        self.codec.keyword_kind()
    }
    fn decode_value(
        &self,
        d: &mut dyn erased_serde::Deserializer<'_>,
    ) -> Result<Option<StoredValue>, erased_serde::Error> {
        Ok(self.codec.decode(d)?.map(crate::style::stored_value))
    }
    fn binding(&self, value: &dyn StyleValueDyn) -> Option<(&'static str, Binding)> {
        let animated = self.animated.as_ref()?;
        let value = value.as_any().downcast_ref::<T>()?;
        (animated.binding)(value).map(|b| (animated.domain, b))
    }
}

impl fmt::Debug for dyn AnyAttribute {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Attribute({:?})", self.name())
    }
}

/// Whether `registered` is the `attribute` declaration itself.
pub(crate) fn is_attr<T: 'static>(registered: &dyn AnyAttribute, attribute: &Attribute<T>) -> bool {
    std::ptr::addr_eq(
        registered as *const dyn AnyAttribute,
        attribute as *const Attribute<T>,
    )
}

/// Whether `a` and `b` are the same declaration.
pub(crate) fn same_attr(a: &dyn AnyAttribute, b: &dyn AnyAttribute) -> bool {
    std::ptr::addr_eq(a as *const dyn AnyAttribute, b as *const dyn AnyAttribute)
}
