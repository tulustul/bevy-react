//! The `filter` style's wire format: one `{"name", "params"}` object or an
//! ordered array of them, decoded warn-don't-abort — a malformed value warns
//! into the decode sink and degrades the whole chain to empty, never failing
//! the containing `Style`'s deserialization (see the [`crate::filters`]
//! module doc).

use serde::{Deserialize, Deserializer};
use serde_json::{Map, Value};

/// One filter invocation in a chain: a registry name plus its raw, untyped
/// parameter map (empty when the wire object has no `params` or `params` is
/// `null`).
#[derive(Debug, Clone, Default, PartialEq)]
pub struct FilterUse {
    pub name: String,
    pub params: Map<String, Value>,
}

/// An ordered filter chain. Decodes from a single `{"name", "params"}` object
/// (a 1-element chain) or an array of them (applied in order); any malformed
/// entry — or non-object/array garbage — warns and degrades the whole value
/// to an empty chain.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct FilterChain(pub Vec<FilterUse>);

impl<'de> Deserialize<'de> for FilterChain {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        Ok(chain_from_value(Value::deserialize(d)?))
    }
}

/// Longest decodable chain.
/// [`ResolvedFilterPass::wire_index`](crate::filters::ResolvedFilterPass::wire_index)
/// is a `u8`, so only entry indices `0..=u8::MAX` are addressable; a longer
/// chain is nonsense input and degrades whole-value like any other malformed
/// chain.
pub const MAX_CHAIN_LEN: usize = u8::MAX as usize + 1;

fn chain_from_value(value: Value) -> FilterChain {
    let entries: Vec<Value> = match value {
        Value::Array(entries) => entries,
        obj @ Value::Object(_) => vec![obj],
        other => {
            warn_decode(
                &other,
                &format!("filter must be an object or array of objects, got {other}"),
            );
            return FilterChain::default();
        }
    };
    if entries.len() > MAX_CHAIN_LEN {
        // Don't serialize the (huge) offending array back into the sink —
        // its length is the whole story.
        crate::protocol::decode_warn(
            "filterParams",
            &format!("[array of {} entries]", entries.len()),
            &format!(
                "filter chain has {} entries, over the cap of {MAX_CHAIN_LEN}",
                entries.len()
            ),
        );
        return FilterChain::default();
    }
    let mut uses = Vec::with_capacity(entries.len());
    for entry in entries {
        match filter_use(entry) {
            Ok(fu) => uses.push(fu),
            // Whole-value degradation: one bad entry empties the chain, so a
            // half-applied filter stack can never render.
            Err((offending, message)) => {
                warn_decode(&offending, &message);
                return FilterChain::default();
            }
        }
    }
    FilterChain(uses)
}

/// Decode one `{"name", "params"}` entry, consuming it — the accept path moves
/// `name`/`params` out instead of cloning. An error hands back the most
/// precise offending value alongside the message, for the decode-warning sink.
fn filter_use(value: Value) -> Result<FilterUse, (Value, String)> {
    let mut obj = match value {
        Value::Object(obj) => obj,
        other => {
            let message = format!("filter entry must be an object, got {other}");
            return Err((other, message));
        }
    };
    let name = match obj.remove("name") {
        Some(Value::String(name)) => name,
        Some(other) => {
            let message = format!("filter name must be a string, got {other}");
            return Err((other, message));
        }
        None => {
            let entry = Value::Object(obj);
            let message = format!("filter entry {entry} is missing \"name\"");
            return Err((entry, message));
        }
    };
    let params = match obj.remove("params") {
        // Deliberate null-leniency: JS callers naturally send `params: null`
        // for "no params" — treat it exactly like an absent key.
        None | Some(Value::Null) => Map::new(),
        Some(Value::Object(params)) => params,
        Some(other) => {
            let message = format!("filter params must be an object, got {other}");
            return Err((other, message));
        }
    };
    Ok(FilterUse { name, params })
}

fn warn_decode(value: &Value, message: &str) {
    // `Value`'s `Display` is compact JSON — the raw offending wire value.
    crate::protocol::decode_warn("filterParams", &value.to_string(), message);
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `FilterChain`'s decode never errors — malformed input degrades.
    fn chain(json: &str) -> FilterChain {
        serde_json::from_str(json).expect("FilterChain decode must not error")
    }

    fn blur_use(radius: u64) -> FilterUse {
        let mut params = Map::new();
        params.insert("radius".into(), Value::from(radius));
        FilterUse {
            name: "blur".into(),
            params,
        }
    }

    #[test]
    fn single_object_decodes_to_one_element_chain() {
        assert_eq!(
            chain(r#"{"name":"blur","params":{"radius":4}}"#),
            FilterChain(vec![blur_use(4)]),
        );
    }

    #[test]
    fn array_decodes_preserving_order() {
        assert_eq!(
            chain(
                r#"[
                    {"name":"blur","params":{"radius":4}},
                    {"name":"grayscale","params":{"amount":1}}
                ]"#
            ),
            FilterChain(vec![blur_use(4), {
                let mut params = Map::new();
                params.insert("amount".into(), Value::from(1u64));
                FilterUse {
                    name: "grayscale".into(),
                    params,
                }
            }]),
        );
    }

    #[test]
    fn missing_params_decodes_to_empty_map() {
        #[cfg(all(feature = "devtools", debug_assertions))]
        let _ = crate::diag::take_decode_warnings();
        let expected = FilterChain(vec![FilterUse {
            name: "invert".into(),
            params: Map::new(),
        }]);
        assert_eq!(chain(r#"{"name":"invert"}"#), expected);
        // Deliberate null-leniency: `params: null` is exactly an absent key.
        assert_eq!(chain(r#"{"name":"invert","params":null}"#), expected);
        #[cfg(all(feature = "devtools", debug_assertions))]
        assert!(crate::diag::take_decode_warnings().is_empty());
    }

    /// Whole-value semantics: one bad entry degrades the entire chain, so a
    /// half-applied filter stack can never render.
    #[test]
    fn malformed_entry_degrades_whole_value_to_empty_chain() {
        // A non-object entry in an otherwise valid array.
        assert_eq!(chain(r#"[{"name":"blur"},3]"#), FilterChain::default());
        // An entry with no name.
        assert_eq!(chain(r#"{"params":{}}"#), FilterChain::default());
        // A non-string name.
        assert_eq!(chain(r#"{"name":7}"#), FilterChain::default());
        // Non-object params.
        assert_eq!(
            chain(r#"{"name":"blur","params":3}"#),
            FilterChain::default()
        );
    }

    /// A chain longer than [`MAX_CHAIN_LEN`] (`wire_index` is a `u8`) warns
    /// and degrades whole-value, like any other malformed chain.
    #[test]
    fn over_long_chain_degrades_to_empty_chain() {
        #[cfg(all(feature = "devtools", debug_assertions))]
        let _ = crate::diag::take_decode_warnings();
        let at_cap = format!(
            "[{}]",
            vec![r#"{"name":"invert"}"#; MAX_CHAIN_LEN].join(",")
        );
        assert_eq!(chain(&at_cap).0.len(), MAX_CHAIN_LEN);
        let over_cap = format!(
            "[{}]",
            vec![r#"{"name":"invert"}"#; MAX_CHAIN_LEN + 1].join(",")
        );
        assert_eq!(chain(&over_cap), FilterChain::default());
        #[cfg(all(feature = "devtools", debug_assertions))]
        {
            let warns = crate::diag::take_decode_warnings();
            assert_eq!(warns.len(), 1);
            assert_eq!(warns[0].kind, "filterParams");
            assert!(
                warns[0].message.contains("over the cap"),
                "{}",
                warns[0].message
            );
        }
    }

    #[test]
    fn garbage_top_level_value_degrades_to_empty_chain() {
        assert_eq!(chain("42"), FilterChain::default());
        assert_eq!(chain("true"), FilterChain::default());
        assert_eq!(chain(r#""blur""#), FilterChain::default());
    }

    /// Warn-don't-abort: a garbage `filter` value must not fail the
    /// deserialization of a containing struct (the eventual `Style`).
    #[test]
    fn malformed_chain_does_not_abort_containing_struct() {
        #[derive(Deserialize)]
        struct Holder {
            filter: FilterChain,
            width: f32,
        }
        let h: Holder =
            serde_json::from_str(r#"{"filter":42,"width":16.0}"#).expect("holder decodes");
        assert_eq!(h.filter, FilterChain::default());
        assert_eq!(h.width, 16.0);
    }

    /// Malformed values are mirrored into the devtools decode sink (the sink
    /// is thread-local, so draining it per-test is parallel-safe).
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn malformed_values_report_decode_warnings() {
        let _ = crate::diag::take_decode_warnings();
        let _ = chain(r#"[{"name":"blur"},3]"#);
        let _ = chain("true");
        let warns = crate::diag::take_decode_warnings();
        let brief: Vec<_> = warns.iter().map(|w| (w.kind, w.value.as_str())).collect();
        assert_eq!(brief, vec![("filterParams", "3"), ("filterParams", "true")]);
        assert!(warns.iter().all(|w| !w.message.is_empty()));
    }

    /// A clean decode leaves the sink empty.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn valid_values_report_nothing() {
        let _ = crate::diag::take_decode_warnings();
        let _ = chain(r#"{"name":"blur"}"#);
        assert!(crate::diag::take_decode_warnings().is_empty());
        // An explicit empty array is a valid empty chain, not a degradation —
        // no warning.
        assert_eq!(chain("[]"), FilterChain::default());
        assert!(crate::diag::take_decode_warnings().is_empty());
    }
}
