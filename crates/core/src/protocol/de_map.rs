//! [`PresentKeys`] — a `Deserializer` adapter that decodes every derived
//! struct through `deserialize_map` (iterating the keys the object actually
//! has) instead of `deserialize_struct` (probing every declared field).
//!
//! Why: the JS-host deserializers (`serde_v8`, `serde_wasm_bindgen`) implement
//! `deserialize_struct` as one property `Get` per **declared** field — for
//! [`super::style::Style`] that is ~75 lookups (each minting an internalized
//! key string) to decode a delta that carries three fields. Their
//! `deserialize_map` enumerates the object's own keys instead, so a sparse
//! object costs its present keys only. serde's derived struct visitors accept
//! either entry (`visit_map` handles any key order and skips unknown keys), so
//! the adapter changes nothing about *what* decodes — `#[serde(default)]`,
//! `deserialize_with`, `rename_all`, unknown-field tolerance all stay with the
//! derive — only *how the host is asked* for it.
//!
//! The adapter is recursive: every sub-deserializer a visitor is handed
//! (option payloads, newtype payloads, sequence elements, map keys/values,
//! enum variants) is wrapped again, so a `Props` decoded through it carries
//! the present-keys strategy down to its nested `Style`s/specs. Scalars pass
//! through untouched. A `serde_v8` *magic* struct (its `$__v8_magic_field`
//! field list) is forwarded as a struct — those are not objects to enumerate.

use serde::de::{
    self, DeserializeSeed, Deserializer, EnumAccess, MapAccess, SeqAccess, VariantAccess, Visitor,
};

/// The field list `serde_v8`'s magic types (`JsBuffer`, `Value`, …) request
/// their struct with; such a request must reach the host as a struct.
const V8_MAGIC_FIELD: &str = "$__v8_magic_field";

/// Wrap a deserializer so every struct it decodes goes through
/// `deserialize_map` — see the module docs.
pub(crate) struct PresentKeys<D>(pub D);

impl PresentKeys<()> {
    /// A `DeserializeSeed` decoding a `T` through the adapter — for
    /// `MapAccess::next_value_seed` / `SeqAccess::next_element_seed` sites.
    pub(crate) fn seed<T>() -> WrapSeed<std::marker::PhantomData<T>> {
        WrapSeed(std::marker::PhantomData)
    }
}

macro_rules! forward {
    ($($method:ident),* $(,)?) => {
        $(
            fn $method<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value, D::Error> {
                self.0.$method(Wrap(visitor))
            }
        )*
    };
}

impl<'de, D: Deserializer<'de>> Deserializer<'de> for PresentKeys<D> {
    type Error = D::Error;

    fn deserialize_struct<V: Visitor<'de>>(
        self,
        name: &'static str,
        fields: &'static [&'static str],
        visitor: V,
    ) -> Result<V::Value, D::Error> {
        if fields == [V8_MAGIC_FIELD] {
            self.0.deserialize_struct(name, fields, Wrap(visitor))
        } else {
            self.0.deserialize_map(Wrap(visitor))
        }
    }

    forward! {
        deserialize_any, deserialize_bool,
        deserialize_i8, deserialize_i16, deserialize_i32, deserialize_i64, deserialize_i128,
        deserialize_u8, deserialize_u16, deserialize_u32, deserialize_u64, deserialize_u128,
        deserialize_f32, deserialize_f64, deserialize_char,
        deserialize_str, deserialize_string, deserialize_bytes, deserialize_byte_buf,
        deserialize_option, deserialize_unit, deserialize_seq, deserialize_map,
        deserialize_identifier, deserialize_ignored_any,
    }

    fn deserialize_unit_struct<V: Visitor<'de>>(
        self,
        name: &'static str,
        visitor: V,
    ) -> Result<V::Value, D::Error> {
        self.0.deserialize_unit_struct(name, Wrap(visitor))
    }

    fn deserialize_newtype_struct<V: Visitor<'de>>(
        self,
        name: &'static str,
        visitor: V,
    ) -> Result<V::Value, D::Error> {
        self.0.deserialize_newtype_struct(name, Wrap(visitor))
    }

    fn deserialize_tuple<V: Visitor<'de>>(
        self,
        len: usize,
        visitor: V,
    ) -> Result<V::Value, D::Error> {
        self.0.deserialize_tuple(len, Wrap(visitor))
    }

    fn deserialize_tuple_struct<V: Visitor<'de>>(
        self,
        name: &'static str,
        len: usize,
        visitor: V,
    ) -> Result<V::Value, D::Error> {
        self.0.deserialize_tuple_struct(name, len, Wrap(visitor))
    }

    fn deserialize_enum<V: Visitor<'de>>(
        self,
        name: &'static str,
        variants: &'static [&'static str],
        visitor: V,
    ) -> Result<V::Value, D::Error> {
        self.0.deserialize_enum(name, variants, Wrap(visitor))
    }

    fn is_human_readable(&self) -> bool {
        self.0.is_human_readable()
    }
}

/// A visitor whose sub-deserializers (option/newtype payloads, seq/map/enum
/// accessors) are re-wrapped in [`PresentKeys`]; scalars pass straight through.
struct Wrap<V>(V);

macro_rules! forward_scalar {
    ($($method:ident: $ty:ty),* $(,)?) => {
        $(
            fn $method<E: de::Error>(self, v: $ty) -> Result<V::Value, E> {
                self.0.$method(v)
            }
        )*
    };
}

impl<'de, V: Visitor<'de>> Visitor<'de> for Wrap<V> {
    type Value = V::Value;

    fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        self.0.expecting(f)
    }

    forward_scalar! {
        visit_bool: bool,
        visit_i8: i8, visit_i16: i16, visit_i32: i32, visit_i64: i64, visit_i128: i128,
        visit_u8: u8, visit_u16: u16, visit_u32: u32, visit_u64: u64, visit_u128: u128,
        visit_f32: f32, visit_f64: f64, visit_char: char,
        visit_str: &str, visit_borrowed_str: &'de str, visit_string: String,
        visit_bytes: &[u8], visit_borrowed_bytes: &'de [u8], visit_byte_buf: Vec<u8>,
    }

    fn visit_none<E: de::Error>(self) -> Result<V::Value, E> {
        self.0.visit_none()
    }

    fn visit_unit<E: de::Error>(self) -> Result<V::Value, E> {
        self.0.visit_unit()
    }

    fn visit_some<D: Deserializer<'de>>(self, d: D) -> Result<V::Value, D::Error> {
        self.0.visit_some(PresentKeys(d))
    }

    fn visit_newtype_struct<D: Deserializer<'de>>(self, d: D) -> Result<V::Value, D::Error> {
        self.0.visit_newtype_struct(PresentKeys(d))
    }

    fn visit_seq<A: SeqAccess<'de>>(self, seq: A) -> Result<V::Value, A::Error> {
        self.0.visit_seq(WrapSeq(seq))
    }

    fn visit_map<A: MapAccess<'de>>(self, map: A) -> Result<V::Value, A::Error> {
        self.0.visit_map(WrapMap(map))
    }

    fn visit_enum<A: EnumAccess<'de>>(self, data: A) -> Result<V::Value, A::Error> {
        self.0.visit_enum(WrapEnum(data))
    }
}

/// A seed whose deserializer is wrapped in [`PresentKeys`].
pub(crate) struct WrapSeed<S>(S);

impl<'de, S: DeserializeSeed<'de>> DeserializeSeed<'de> for WrapSeed<S> {
    type Value = S::Value;

    fn deserialize<D: Deserializer<'de>>(self, d: D) -> Result<S::Value, D::Error> {
        self.0.deserialize(PresentKeys(d))
    }
}

struct WrapSeq<A>(A);

impl<'de, A: SeqAccess<'de>> SeqAccess<'de> for WrapSeq<A> {
    type Error = A::Error;

    fn next_element_seed<T: DeserializeSeed<'de>>(
        &mut self,
        seed: T,
    ) -> Result<Option<T::Value>, A::Error> {
        self.0.next_element_seed(WrapSeed(seed))
    }

    fn size_hint(&self) -> Option<usize> {
        self.0.size_hint()
    }
}

struct WrapMap<A>(A);

impl<'de, A: MapAccess<'de>> MapAccess<'de> for WrapMap<A> {
    type Error = A::Error;

    fn next_key_seed<K: DeserializeSeed<'de>>(
        &mut self,
        seed: K,
    ) -> Result<Option<K::Value>, A::Error> {
        self.0.next_key_seed(WrapSeed(seed))
    }

    fn next_value_seed<T: DeserializeSeed<'de>>(&mut self, seed: T) -> Result<T::Value, A::Error> {
        self.0.next_value_seed(WrapSeed(seed))
    }

    fn size_hint(&self) -> Option<usize> {
        self.0.size_hint()
    }
}

struct WrapEnum<A>(A);

impl<'de, A: EnumAccess<'de>> EnumAccess<'de> for WrapEnum<A> {
    type Error = A::Error;
    type Variant = WrapVariant<A::Variant>;

    fn variant_seed<S: DeserializeSeed<'de>>(
        self,
        seed: S,
    ) -> Result<(S::Value, Self::Variant), A::Error> {
        let (value, variant) = self.0.variant_seed(WrapSeed(seed))?;
        Ok((value, WrapVariant(variant)))
    }
}

struct WrapVariant<A>(A);

impl<'de, A: VariantAccess<'de>> VariantAccess<'de> for WrapVariant<A> {
    type Error = A::Error;

    fn unit_variant(self) -> Result<(), A::Error> {
        self.0.unit_variant()
    }

    fn newtype_variant_seed<T: DeserializeSeed<'de>>(self, seed: T) -> Result<T::Value, A::Error> {
        self.0.newtype_variant_seed(WrapSeed(seed))
    }

    fn tuple_variant<V: Visitor<'de>>(self, len: usize, visitor: V) -> Result<V::Value, A::Error> {
        self.0.tuple_variant(len, Wrap(visitor))
    }

    fn struct_variant<V: Visitor<'de>>(
        self,
        fields: &'static [&'static str],
        visitor: V,
    ) -> Result<V::Value, A::Error> {
        self.0.struct_variant(fields, Wrap(visitor))
    }
}
