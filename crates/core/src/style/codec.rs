//! How a property's value crosses the wire: [`Codec`] — the decoder (wire
//! JSON → `T`) and the TypeScript type the generated `BevyStyle` names.

use std::collections::BTreeMap;

use serde::de::DeserializeOwned;

use crate::ts_codegen::TsCollector;

/// A type-erased decoder: the property's wire value → `Some(T)`, or `None`
/// for an explicit `null` / a value the decoder dropped after reporting it
/// itself (the lenient warn-and-fall-back decoders).
pub type DecodeFn<T> =
    fn(&mut dyn erased_serde::Deserializer<'_>) -> Result<Option<T>, erased_serde::Error>;

/// Where a codec's TypeScript type comes from.
#[derive(Clone, Copy)]
pub(crate) enum TsSource {
    /// `T`'s own ts-rs type: its name, and the collector of its declaration
    /// (plus transitive dependencies) for the exporter.
    Type {
        name: fn() -> String,
        collect: fn(&mut TsCollector),
    },
    /// A union of keyword strings, and the diag kind an unrecognized one
    /// warns under.
    Keywords {
        keywords: &'static [&'static str],
        kind: &'static str,
    },
    /// A literal TS type expression.
    Literal(&'static str),
}

/// A property's wire codec. Built by [`StyleProperty::new`]
/// (`T: Deserialize + TS`) or passed to [`StyleProperty::with_codec`] from
/// one of the constructors below; opaque otherwise.
///
/// [`StyleProperty::new`]: super::StyleProperty::new
/// [`StyleProperty::with_codec`]: super::StyleProperty::with_codec
pub struct Codec<T: 'static> {
    pub(crate) decode: DecodeFn<T>,
    pub(crate) ts: TsSource,
}

impl<T: DeserializeOwned> Codec<T> {
    /// Decode through `T`'s `Deserialize`, typed as `T`'s ts-rs type.
    pub const fn serde() -> Self
    where
        T: ts_rs::TS,
    {
        Self {
            decode: decode_serde::<T>,
            ts: TsSource::Type {
                name: ts_name::<T>,
                collect: ts_collect::<T>,
            },
        }
    }

    /// Decode through `T`'s `Deserialize`, typed as the TS expression `ts`
    /// (a value type without a ts-rs impl, or one whose TS spelling differs).
    pub const fn serde_as(ts: &'static str) -> Self {
        Self {
            decode: decode_serde::<T>,
            ts: TsSource::Literal(ts),
        }
    }
}

impl<T> Codec<T> {
    /// A keyword-valued property (a bevy enum decoded from a fixed keyword
    /// set), typed as the union of the table's keywords.
    pub const fn keyword(table: &'static KeywordTable<T>) -> Self {
        Self {
            decode: table.decode,
            ts: TsSource::Keywords {
                keywords: table.keywords,
                kind: table.kind,
            },
        }
    }

    /// A custom decoder, typed as the TS expression `ts`.
    pub const fn custom(decode: DecodeFn<T>, ts: &'static str) -> Self {
        Self {
            decode,
            ts: TsSource::Literal(ts),
        }
    }

    /// Decode one wire value.
    pub(crate) fn decode(
        &self,
        d: &mut dyn erased_serde::Deserializer<'_>,
    ) -> Result<Option<T>, erased_serde::Error> {
        (self.decode)(d)
    }

    /// The TypeScript type expression.
    pub(crate) fn ts_type(&self) -> String {
        match self.ts {
            TsSource::Type { name, .. } => name(),
            TsSource::Keywords { keywords, .. } => keywords
                .iter()
                .map(|k| format!("{k:?}"))
                .collect::<Vec<_>>()
                .join(" | "),
            TsSource::Literal(s) => s.to_owned(),
        }
    }

    /// The declarations the TS type needs (a ts-rs struct and the types it
    /// references), by type name. Keyword unions and literal expressions
    /// declare nothing — they name types the `bevy-react` package owns.
    pub(crate) fn ts_decls(&self, decls: &mut BTreeMap<String, String>) {
        if let TsSource::Type { collect, .. } = self.ts {
            let mut collector = TsCollector::default();
            collect(&mut collector);
            decls.extend(collector.decls);
        }
    }

    /// The diag kind of a keyword codec.
    pub(crate) fn keyword_kind(&self) -> Option<&'static str> {
        match self.ts {
            TsSource::Keywords { kind, .. } => Some(kind),
            _ => None,
        }
    }
}

/// A keyword table: the wire keywords of one keyword-valued property kind
/// and their decoder (unknown keyword → warn + the enum's default). Emitted
/// per kind by `keyword_fields!`.
pub struct KeywordTable<T: 'static> {
    /// The diag kind an unrecognized keyword warns under.
    pub kind: &'static str,
    /// Every accepted keyword, aliases included.
    pub keywords: &'static [&'static str],
    pub decode: DecodeFn<T>,
}

fn decode_serde<T: DeserializeOwned>(
    d: &mut dyn erased_serde::Deserializer<'_>,
) -> Result<Option<T>, erased_serde::Error> {
    erased_serde::deserialize::<Option<T>>(d)
}

fn ts_name<T: ts_rs::TS>() -> String {
    T::name()
}

fn ts_collect<T: ts_rs::TS + 'static>(collector: &mut TsCollector) {
    collector.add::<T>();
}
