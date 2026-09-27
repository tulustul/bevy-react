//! [`StyleProperty`] — one style property: its wire name, codec, and
//! invalidation. A `static` of it is both the declaration and the typed key
//! (`style.get(&OPACITY)`).

use std::any::{Any, TypeId};
use std::fmt;

use serde::de::DeserializeOwned;

use super::codec::Codec;
use super::invalidation::{Invalidate, Invalidation};

/// What a style value must be: stored type-erased, compared on merge
/// (compare-before-set), cloned when hover/press/focus variants overlay the
/// base style.
pub trait PropertyValue: Any + Send + Sync + Clone + PartialEq + fmt::Debug {}
impl<T: Any + Send + Sync + Clone + PartialEq + fmt::Debug> PropertyValue for T {}

/// One style property. Declare it as a `static` and register it with
/// `ReactAppExt::add_react_style(s)`; the static is also the typed key the
/// merged style is read with.
///
/// Every field is `pub` so a declaration can use struct-update syntax:
///
/// ```ignore
/// pub static OPACITY: StyleProperty<Animatable<f32>> = StyleProperty {
///     invalidate: Invalidate::Computed(opacity_invalidation),
///     ..StyleProperty::new("opacity")
/// };
/// ```
pub struct StyleProperty<T: 'static> {
    /// The wire name (the key in a `style` object).
    pub name: &'static str,
    /// How the value decodes and how TypeScript types it.
    pub codec: Codec<T>,
    /// What a change to the value invalidates.
    pub invalidate: Invalidate<T>,
}

impl<T: PropertyValue + DeserializeOwned + ts_rs::TS> StyleProperty<T> {
    /// A property decoding through `T`'s `Deserialize` and typed as `T`'s
    /// ts-rs type; invalidates nothing until declared otherwise.
    pub const fn new(name: &'static str) -> Self {
        Self::with_codec(name, Codec::serde())
    }
}

impl<T: PropertyValue> StyleProperty<T> {
    /// A property with an explicit [`Codec`] (a bevy keyword enum, a custom
    /// decoder, an explicit TS type).
    pub const fn with_codec(name: &'static str, codec: Codec<T>) -> Self {
        Self {
            name,
            codec,
            invalidate: Invalidate::Fixed(Invalidation::NONE),
        }
    }
}

mod sealed {
    pub trait Sealed {}
}

impl<T: PropertyValue> sealed::Sealed for StyleProperty<T> {}

/// The type-erased view of a [`StyleProperty`] the registry stores.
/// Implemented only by `StyleProperty<T>` (sealed), so methods can be added
/// without breaking declarations.
pub trait AnyStyleProperty: sealed::Sealed + Send + Sync + 'static {
    /// The wire name.
    fn name(&self) -> &'static str;
    /// The value type's `TypeId`.
    fn value_type_id(&self) -> TypeId;
    /// The value type's Rust name (diagnostics).
    fn value_type_name(&self) -> &'static str;
    /// The TypeScript type expression of the value.
    fn ts_type(&self) -> String;
    /// Add the TS declarations [`ts_type`](Self::ts_type) needs (by type
    /// name) — the exporter declares them beside the `BevyStyle`
    /// augmentation.
    fn ts_decls(&self, decls: &mut std::collections::BTreeMap<String, String>);
    /// The diag kind a keyword-valued property warns under (devtools maps
    /// the kind back to the property).
    fn keyword_kind(&self) -> Option<&'static str>;
    /// Whether this property's invalidation is computed per change (it then
    /// needs the replaced value — the merge records it).
    fn computes_invalidation(&self) -> bool;
    /// What a change from `old` to `new` invalidates on `node`.
    fn invalidation(
        &self,
        old: Option<&dyn super::StyleValueDyn>,
        new: Option<&dyn super::StyleValueDyn>,
        node: &super::NodeCtx<'_>,
    ) -> Invalidation;
    /// Stamp this property's value in `style` as a
    /// [`StyleValue`](super::StyleValue) component (auto-stamping).
    fn stamp(&self, style: &super::Style, ec: &mut bevy::prelude::EntityCommands, fresh: bool);
    /// Decode one wire value into the store's form.
    fn decode_value(
        &self,
        d: &mut dyn erased_serde::Deserializer<'_>,
    ) -> Result<Option<super::store::StoredValue>, erased_serde::Error>;
}

impl<T: PropertyValue> AnyStyleProperty for StyleProperty<T> {
    fn name(&self) -> &'static str {
        self.name
    }
    fn value_type_id(&self) -> TypeId {
        TypeId::of::<T>()
    }
    fn value_type_name(&self) -> &'static str {
        std::any::type_name::<T>()
    }
    fn ts_type(&self) -> String {
        self.codec.ts_type()
    }
    fn ts_decls(&self, decls: &mut std::collections::BTreeMap<String, String>) {
        self.codec.ts_decls(decls);
    }
    fn keyword_kind(&self) -> Option<&'static str> {
        self.codec.keyword_kind()
    }
    fn computes_invalidation(&self) -> bool {
        matches!(self.invalidate, Invalidate::Computed(_))
    }
    fn invalidation(
        &self,
        old: Option<&dyn super::StyleValueDyn>,
        new: Option<&dyn super::StyleValueDyn>,
        node: &super::NodeCtx<'_>,
    ) -> Invalidation {
        fn typed<T: 'static>(v: Option<&dyn super::StyleValueDyn>) -> Option<&T> {
            v.and_then(|v| v.as_any().downcast_ref::<T>())
        }
        self.invalidate.eval(typed(old), typed(new), node)
    }
    fn stamp(&self, style: &super::Style, ec: &mut bevy::prelude::EntityCommands, fresh: bool) {
        super::stamp::stamp(style.get(self), ec, fresh);
    }
    fn decode_value(
        &self,
        d: &mut dyn erased_serde::Deserializer<'_>,
    ) -> Result<Option<super::store::StoredValue>, erased_serde::Error> {
        Ok(self.codec.decode(d)?.map(super::store::stored))
    }
}

impl fmt::Debug for dyn AnyStyleProperty {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "StyleProperty({:?})", self.name())
    }
}
