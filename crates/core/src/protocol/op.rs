//! JS→Bevy mutation ops: the [`Op`] batch the reconciler flushes per commit,
//! plus [`OpBatch`]'s decode-warning attribution wrapper.

use std::fmt;

use serde::Deserialize;
use serde::de::{self, Deserializer, MapAccess, Visitor};

use super::NodeId;
use super::props::Props;

/// A single mutation produced by the React reconciler during a commit. The
/// reconciler batches a `Vec<Op>` per commit and flushes it across the boundary
/// in one call.
///
/// The prop-bearing variants box their [`Props`] deliberately. An enum is as
/// wide as its widest variant, and `Props` is hundreds of bytes (it was
/// several kilobytes when it inlined four typed styles). Unboxed, *every*
/// element of the flushed `Vec<Op>` pays that width — a batch of 5k `Remove`s
/// once moved tens of megabytes for ops carrying no props at all, and the
/// decode/translate legs scaled with the widest variant instead of the actual
/// payload. Boxing keeps `Op` narrow (see `op_stays_narrow` below).
///
/// Wire form: an object tagged by `op` (camelCase variant name) with the
/// variant's fields alongside (`{ "op": "append", "parent": 0, "child": 7 }`).
/// `Deserialize` is hand-written (below) rather than `#[serde(tag = "op")]`:
/// serde's internally-tagged derive buffers the whole object into its private
/// `Content` tree before it can dispatch on the tag, so every op paid a full
/// key-by-key copy plus a second walk — the dominant cost of `op_flush`.
#[derive(Debug, Clone)]
pub enum Op {
    /// Tear down the entire current tree. Emitted first by every fresh runtime
    /// so a hot reload clears the previous UI before the new render is applied.
    Reset,
    /// Spawn a host element of a registered kind (see [`crate::element`]).
    Create {
        id: NodeId,
        kind: String,
        props: Box<Props>,
        /// Inline text content for a single-string `<text>`/`<textSpan>` (the
        /// `shouldSetTextContent` fast path — no separate child text entity).
        text: Option<String>,
    },
    /// Spawn a standalone text node (a bare string outside any `<text>`).
    CreateText { id: NodeId, text: String },
    /// Spawn a text run inside a `<text>` element (a Bevy `TextSpan`). Its style
    /// is inherited from the enclosing `<text>` at append time.
    CreateTextSpan { id: NodeId, text: String },
    /// Make `child` the last child of `parent` (`parent == ROOT_ID` is the root).
    Append { parent: NodeId, child: NodeId },
    /// Insert `child` before `before` under `parent`.
    Insert {
        parent: NodeId,
        child: NodeId,
        before: NodeId,
    },
    /// Detach and despawn `child` (and its descendants).
    Remove { parent: NodeId, child: NodeId },
    /// Apply a prop **delta** to an existing element, against its last applied
    /// props (retained per node in `JsBridge::props_cache`).
    ///
    /// A field present in `props` is set; a wire name listed in `unset` is
    /// reset to its default (for booleans: set `false`); a field in neither is
    /// left unchanged. `props.style` is itself a field-level delta: its `Some`
    /// fields overwrite the corresponding fields of the last applied style,
    /// and style wire names listed in `style_unset` are cleared (`style_unset`
    /// applies even when `props.style` is absent). The variant styles
    /// (`hoverStyle`/`pressStyle`/`focusStyle`) and other object-valued props
    /// are atomic: present replaces the whole value, `unset` clears it.
    ///
    /// The act-now props (`scrollTop`/`scrollLeft` and the element's act-now
    /// attributes — `value`, `draw`, …) keep their "present = act now"
    /// meaning and are never part of the retained state (see
    /// [`Props::merge_delta`]). An update carrying only act-now attributes is
    /// an imperative command (the canvas handle's `drawAppend`).
    ///
    /// The wire op carries the node's `kind` too (before `props`): the props
    /// decode against the element's attributes (see [`crate::element`]).
    Update {
        id: NodeId,
        props: Box<Props>,
        /// Top-level prop wire names (camelCase) reset to their defaults.
        unset: Vec<String>,
        /// Style field wire names (camelCase) cleared from the merged style
        /// (wire name `styleUnset`).
        style_unset: Vec<String>,
    },
    /// Replace the string of a text node.
    UpdateText { id: NodeId, text: String },
}

/// The wire tag (`op`) values, camelCase variant names.
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "camelCase")]
enum OpTag {
    Reset,
    Create,
    CreateText,
    CreateTextSpan,
    Append,
    Insert,
    Remove,
    Update,
    UpdateText,
}

/// Every key an op object can carry, across all variants. A key's value type
/// is the same in every variant that has it, so the visitor can decode each
/// entry as it streams by — in any key order, no buffering — and assemble the
/// variant once the object is exhausted.
#[derive(Deserialize)]
#[serde(field_identifier, rename_all = "camelCase")]
enum OpKey {
    Op,
    Id,
    Kind,
    Props,
    Text,
    Parent,
    Child,
    Before,
    Unset,
    StyleUnset,
    #[serde(other)]
    Other,
}

impl<'de> Deserialize<'de> for Op {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        d.deserialize_map(OpVisitor)
    }
}

struct OpVisitor;

/// Fill `slot` from a streamed entry; a repeated key is an error, as with the
/// derive.
fn take<T, E: de::Error>(slot: &mut Option<T>, value: T, key: &'static str) -> Result<(), E> {
    if slot.is_some() {
        return Err(E::duplicate_field(key));
    }
    *slot = Some(value);
    Ok(())
}

fn required<T, E: de::Error>(slot: Option<T>, key: &'static str) -> Result<T, E> {
    slot.ok_or_else(|| E::missing_field(key))
}

impl<'de> Visitor<'de> for OpVisitor {
    type Value = Op;

    fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str("a reconciler op object tagged by `op`")
    }

    fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Op, A::Error> {
        let mut tag: Option<OpTag> = None;
        let mut id: Option<NodeId> = None;
        let mut kind: Option<String> = None;
        let mut props: Option<Box<Props>> = None;
        let mut text: Option<String> = None;
        let mut parent: Option<NodeId> = None;
        let mut child: Option<NodeId> = None;
        let mut before: Option<NodeId> = None;
        let mut unset: Option<Vec<String>> = None;
        let mut style_unset: Option<Vec<String>> = None;
        // The element the props decode against — opened by the `kind` key,
        // which the runtime emits before `props` (see `crate::element`).
        let mut _scope: Option<crate::element::DecodeScope> = None;
        while let Some(key) = map.next_key::<OpKey>()? {
            match key {
                OpKey::Op => take(&mut tag, map.next_value()?, "op")?,
                OpKey::Id => take(&mut id, map.next_value()?, "id")?,
                OpKey::Kind => {
                    let k: String = map.next_value()?;
                    _scope = Some(crate::element::DecodeScope::new(&k));
                    take(&mut kind, k, "kind")?;
                }
                OpKey::Props => take(&mut props, map.next_value()?, "props")?,
                // `Option`: `create` carries `text` optionally (a JSON `null`
                // reads as absent), the text ops require it.
                OpKey::Text => {
                    if let Some(t) = map.next_value::<Option<String>>()? {
                        take(&mut text, t, "text")?;
                    }
                }
                OpKey::Parent => take(&mut parent, map.next_value()?, "parent")?,
                OpKey::Child => take(&mut child, map.next_value()?, "child")?,
                OpKey::Before => take(&mut before, map.next_value()?, "before")?,
                OpKey::Unset => take(&mut unset, map.next_value()?, "unset")?,
                OpKey::StyleUnset => take(&mut style_unset, map.next_value()?, "styleUnset")?,
                OpKey::Other => {
                    map.next_value::<de::IgnoredAny>()?;
                }
            }
        }
        Ok(match required(tag, "op")? {
            OpTag::Reset => Op::Reset,
            OpTag::Create => Op::Create {
                id: required(id, "id")?,
                kind: required(kind, "kind")?,
                props: props.unwrap_or_default(),
                text,
            },
            OpTag::CreateText => Op::CreateText {
                id: required(id, "id")?,
                text: required(text, "text")?,
            },
            OpTag::CreateTextSpan => Op::CreateTextSpan {
                id: required(id, "id")?,
                text: required(text, "text")?,
            },
            OpTag::Append => Op::Append {
                parent: required(parent, "parent")?,
                child: required(child, "child")?,
            },
            OpTag::Insert => Op::Insert {
                parent: required(parent, "parent")?,
                child: required(child, "child")?,
                before: required(before, "before")?,
            },
            OpTag::Remove => Op::Remove {
                parent: required(parent, "parent")?,
                child: required(child, "child")?,
            },
            OpTag::Update => Op::Update {
                id: required(id, "id")?,
                props: props.unwrap_or_default(),
                unset: unset.unwrap_or_default(),
                style_unset: style_unset.unwrap_or_default(),
            },
            OpTag::UpdateText => Op::UpdateText {
                id: required(id, "id")?,
                text: required(text, "text")?,
            },
        })
    }
}

/// A `Vec<Op>` whose `Deserialize` brackets each element's decode with the
/// [`crate::diag`] decode sink's watermarks, stamping every warning a field
/// deserializer pushed with the op's target node id — the id is structurally
/// out of scope down in the field visitors, but trivially known per op here.
/// The wire format is exactly a plain op array; in release builds the
/// bracketing calls are inline no-ops and this decodes like a bare `Vec<Op>`.
pub struct OpBatch(pub Vec<Op>);

/// The node an op targets, for decode-warning attribution. Tree ops carry no
/// decodable values, so they have no meaningful target.
fn op_target_id(op: &Op) -> Option<NodeId> {
    match op {
        Op::Create { id, .. }
        | Op::CreateText { id, .. }
        | Op::CreateTextSpan { id, .. }
        | Op::Update { id, .. }
        | Op::UpdateText { id, .. } => Some(*id),
        Op::Reset | Op::Append { .. } | Op::Insert { .. } | Op::Remove { .. } => None,
    }
}

impl<'de> Deserialize<'de> for OpBatch {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct BatchVisitor;
        impl<'de> Visitor<'de> for BatchVisitor {
            type Value = Vec<Op>;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("an array of reconciler ops")
            }
            fn visit_seq<A: de::SeqAccess<'de>>(self, mut seq: A) -> Result<Vec<Op>, A::Error> {
                // Clearing at batch start (not on drain) bounds the sink even
                // when nothing ever drains it, and drops entries from a batch
                // whose decode threw mid-way (Bevy never saw those ops).
                crate::diag::decode_batch_start();
                let mut ops = Vec::with_capacity(seq.size_hint().unwrap_or(0));
                loop {
                    let mark = crate::diag::decode_watermark();
                    let Some(op) = seq.next_element::<Op>()? else {
                        break;
                    };
                    crate::diag::decode_attribute_since(mark, op_target_id(&op));
                    ops.push(op);
                }
                Ok(ops)
            }
        }
        d.deserialize_seq(BatchVisitor).map(OpBatch)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::style::Style;
    use crate::style::props::CURSOR;

    /// Every element of a flushed batch is as wide as `Op`'s widest variant, so
    /// a fat variant taxes ops that carry nothing (a `Remove` is four words of
    /// payload). `Props` is kilobytes — it must stay behind a `Box`. This bound
    /// is generous; it exists to fail loudly if a multi-kilobyte payload is ever
    /// inlined into a variant again, not to pin an exact layout.
    #[test]
    fn op_stays_narrow() {
        let size = std::mem::size_of::<Op>();
        assert!(
            size <= 128,
            "Op grew to {size} bytes — box the payload of the variant that widened it \
             (every op in a batch pays this width)"
        );
    }

    /// `OpBatch` stamps decode-fallback warnings with the op that carried
    /// them, so devtools can attribute "invalid length" to a node id even
    /// though the field visitors can't see one. The decode sink is
    /// thread-local (and cleared at batch start), so this is parallel-safe.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn op_batch_attributes_decode_warnings() {
        // A leftover from an earlier decode on this thread must not leak in.
        crate::diag::decode_report("length", "stale", "stale entry");
        let json = r#"[
            {"op":"update","id":7,"kind":"node","props":{"style":{"width":"aa16"}}},
            {"op":"append","parent":0,"child":7},
            {"op":"update","id":9,"kind":"node","props":{"style":{"display":"flexx","padding":"1px bogus"}}}
        ]"#;
        let batch: OpBatch = serde_json::from_str(json).expect("batch decodes");
        assert_eq!(batch.0.len(), 3, "fallbacks must not drop ops");
        let warns = crate::diag::take_decode_warnings();
        let brief: Vec<_> = warns
            .iter()
            .map(|w| (w.node, w.kind, w.value.as_str()))
            .collect();
        assert_eq!(
            brief,
            vec![
                (Some(7), "length", "aa16"),
                (Some(9), "display", "flexx"),
                (Some(9), "rect", "bogus"),
            ],
        );
        assert!(warns.iter().all(|w| !w.message.is_empty()));
        assert!(
            crate::diag::take_decode_warnings().is_empty(),
            "drain empties the sink"
        );
    }

    /// An `<editableText>` create op carries its attributes and handler
    /// flags, decoded against the element the op's `kind` names.
    #[test]
    fn deserializes_editable_text_create() {
        use crate::elements::editable::{
            ARIA_LABEL, AUTOFOCUS, MAX_LENGTH, MULTILINE, SELECTION_END, SELECTION_START, VALUE,
        };
        crate::ext::install_builtin_registry();
        let json = r#"{"op":"create","id":7,"kind":"editableText","props":{
            "value":"hi","maxLength":40,"multiline":true,"onChange":true,
            "autofocus":true,"selectionStart":0,"selectionEnd":2,
            "ariaLabel":"Name","onSelect":true,"onFocus":true,"onBlur":true,
            "focusStyle":{"borderColor":"white"}}}"#;
        match serde_json::from_str::<Op>(json).expect("valid op") {
            Op::Create {
                id, kind, props, ..
            } => {
                assert_eq!(id, 7);
                assert_eq!(kind, "editableText");
                let a = &props.attrs;
                assert_eq!(a.get(&VALUE).map(String::as_str), Some("hi"));
                assert_eq!(a.get(&MAX_LENGTH), Some(&40));
                assert_eq!(a.get(&MULTILINE), Some(&true));
                assert_eq!(a.get(&AUTOFOCUS), Some(&true));
                assert_eq!(a.get(&SELECTION_START), Some(&0));
                assert_eq!(a.get(&SELECTION_END), Some(&2));
                assert_eq!(a.get(&ARIA_LABEL).map(String::as_str), Some("Name"));
                // onChange / onSelect / onFocus / onBlur: all four events.
                assert_eq!(props.handlers, 0b1111);
                assert!(props.focus_style.is_some());
            }
            other => panic!("expected create, got {other:?}"),
        }
    }

    /// An `update` op decodes with and without the unset lists — `styleUnset`
    /// in particular must land in `style_unset` (the enum's `rename_all`
    /// doesn't cover variant fields).
    #[test]
    fn deserializes_update_delta_form() {
        crate::ext::install_builtin_registry();
        let minimal: Op =
            serde_json::from_str(r#"{"op":"update","id":3,"kind":"node","props":{}}"#).unwrap();
        match minimal {
            Op::Update {
                unset, style_unset, ..
            } => {
                assert!(unset.is_empty() && style_unset.is_empty());
            }
            other => panic!("expected update, got {other:?}"),
        }
        let full: Op = serde_json::from_str(
            r#"{"op":"update","id":3,"kind":"node","props":{"style":{"width":1}},
                "unset":["onClick"],"styleUnset":["backgroundColor"]}"#,
        )
        .unwrap();
        match full {
            Op::Update {
                unset, style_unset, ..
            } => {
                assert_eq!(unset, vec!["onClick"]);
                assert_eq!(style_unset, vec!["backgroundColor"]);
            }
            other => panic!("expected update, got {other:?}"),
        }
    }

    /// An update op decodes its props against the element its `kind` names
    /// (an `<editableText>`'s act-now `value` here — a `<canvas>`'s
    /// `drawAppend` rides the same path). The decode scope ends with the op.
    #[test]
    fn update_op_decodes_attributes_by_kind() {
        use crate::elements::editable::VALUE;
        crate::ext::install_builtin_registry();
        let op: Op = serde_json::from_str(
            r#"{"op":"update","id":7,"kind":"editableText","props":{"value":"hi"}}"#,
        )
        .unwrap();
        match op {
            Op::Update { id, props, .. } => {
                assert_eq!(id, 7);
                assert_eq!(
                    props.attrs.get(&VALUE).map(String::as_str),
                    Some("hi"),
                    "decoded by kind"
                );
            }
            other => panic!("expected update, got {other:?}"),
        }
        assert!(
            crate::element::decode_element().is_none(),
            "the op's decode scope closes with it"
        );
    }
    /// `cursor` decodes to the raw name (keyword or custom); resolution (registry
    /// first, then system keyword) is deferred to `drive_cursor_icon`, like `fontFamily`.
    #[test]
    fn deserializes_cursor_name() {
        let s: Style = serde_json::from_str(r#"{ "cursor": "pointer" }"#).expect("cursor decodes");
        assert_eq!(s.get(&CURSOR).map(String::as_str), Some("pointer"));

        let s: Style =
            serde_json::from_str(r#"{ "cursor": "hand" }"#).expect("custom name decodes");
        assert_eq!(s.get(&CURSOR).map(String::as_str), Some("hand"));
    }
}
