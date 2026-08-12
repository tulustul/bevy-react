//! JS→Bevy mutation ops: the [`Op`] batch the reconciler flushes per commit,
//! plus [`OpBatch`]'s decode-warning attribution wrapper.

use std::fmt;

use serde::Deserialize;
use serde::de::{self, Deserializer, Visitor};

use crate::canvas::DrawCmd;

use super::NodeId;
use super::props::Props;

/// A single mutation produced by the React reconciler during a commit. The
/// reconciler batches a `Vec<Op>` per commit and flushes it across the boundary
/// in one call.
///
/// The prop-bearing variants box their [`Props`] deliberately. An enum is as
/// wide as its widest variant, and `Props` inlines four [`super::style::Style`]s
/// (base + hover/press/focus) — several kilobytes. Unboxed, *every* element of
/// the flushed `Vec<Op>` paid that width, so a batch of 5k `Remove`s moved tens
/// of megabytes for ops carrying no props at all, and the decode/translate legs
/// scaled with the widest variant instead of the actual payload. Boxing keeps
/// `Op` pointer-sized (see `op_stays_narrow` below).
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "op", rename_all = "camelCase")]
pub enum Op {
    /// Tear down the entire current tree. Emitted first by every fresh runtime
    /// so a hot reload clears the previous UI before the new render is applied.
    Reset,
    /// Spawn a host element (`node`, `button`, or `image`).
    Create {
        id: NodeId,
        kind: String,
        #[serde(default)]
        props: Box<Props>,
        /// Inline text content for a single-string `<text>`/`<textSpan>` (the
        /// `shouldSetTextContent` fast path — no separate child text entity).
        #[serde(default)]
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
    /// The event-like props (`value`, `selectionStart`/`selectionEnd`,
    /// `scrollTop`/`scrollLeft`, `draw`) keep their "present = act now" meaning
    /// and are never part of the retained state (see [`Props::merge_delta`]).
    Update {
        id: NodeId,
        #[serde(default)]
        props: Box<Props>,
        /// Top-level prop wire names (camelCase) reset to their defaults.
        #[serde(default)]
        unset: Vec<String>,
        /// Style field wire names (camelCase) cleared from the merged style.
        /// (The enum's `rename_all` covers variant names, not their fields, so
        /// the wire name is spelled out.)
        #[serde(default, rename = "styleUnset")]
        style_unset: Vec<String>,
    },
    /// Replace the string of a text node.
    UpdateText { id: NodeId, text: String },
    /// Append draw commands to a `canvas` element's retained surface — the
    /// imperative `getContext()` handle's microtask flush, or the JS
    /// runtime's clear+replay of a declarative painter after a resize. Paint
    /// accumulates on the retained pixels; a leading [`DrawCmd::Clear`] makes
    /// the batch a replace. Bypasses the props cache entirely (nothing is
    /// retained protocol-side). A missing or non-canvas node is skipped
    /// silently, like every other op.
    Draw { id: NodeId, cmds: Vec<DrawCmd> },
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
        | Op::UpdateText { id, .. }
        | Op::Draw { id, .. } => Some(*id),
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
    use crate::protocol::style::Style;

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
            {"op":"update","id":7,"props":{"style":{"width":"aa16"}}},
            {"op":"append","parent":0,"child":7},
            {"op":"update","id":9,"props":{"style":{"display":"flexx","padding":"1px bogus"}}}
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

    /// An `<editableText>` create op carries its controlled value and attributes.
    #[test]
    fn deserializes_editable_text_create() {
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
                assert_eq!(props.value.as_deref(), Some("hi"));
                assert_eq!(props.max_length, Some(40));
                assert!(props.multiline);
                assert!(props.on_change);
                assert!(props.autofocus);
                assert_eq!(props.selection_start, Some(0));
                assert_eq!(props.selection_end, Some(2));
                assert_eq!(props.aria_label.as_deref(), Some("Name"));
                assert!(props.on_select);
                assert!(props.on_focus);
                assert!(props.on_blur);
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
        let minimal: Op = serde_json::from_str(r#"{"op":"update","id":3,"props":{}}"#).unwrap();
        match minimal {
            Op::Update {
                unset, style_unset, ..
            } => {
                assert!(unset.is_empty() && style_unset.is_empty());
            }
            other => panic!("expected update, got {other:?}"),
        }
        let full: Op = serde_json::from_str(
            r#"{"op":"update","id":3,"props":{"style":{"width":1}},
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

    /// A `draw` op decodes, including the clear commands (the imperative
    /// canvas path). Struct-variant fields aren't renamed by the enum's
    /// `rename_all`, so the wire form is pinned here.
    #[test]
    fn deserializes_draw_op() {
        let op: Op = serde_json::from_str(
            r##"{"op":"draw","id":7,"cmds":[
                {"cmd":"clear"},
                {"cmd":"clearRect","x":1.0,"y":2.0,"w":3.0,"h":4.0},
                {"cmd":"fillStyle","color":"#f00"}
            ]}"##,
        )
        .unwrap();
        match op {
            Op::Draw { id, cmds } => {
                assert_eq!(id, 7);
                assert_eq!(cmds.len(), 3);
                assert_eq!(cmds[0], DrawCmd::Clear);
                assert_eq!(
                    cmds[1],
                    DrawCmd::ClearRect {
                        x: 1.0,
                        y: 2.0,
                        w: 3.0,
                        h: 4.0
                    }
                );
                assert_eq!(
                    cmds[2],
                    DrawCmd::FillStyle {
                        color: "#f00".into()
                    }
                );
            }
            other => panic!("expected draw, got {other:?}"),
        }
    }

    /// `cursor` decodes to the raw name (keyword or custom); resolution (registry
    /// first, then system keyword) is deferred to `drive_cursor_icon`, like `fontFamily`.
    #[test]
    fn deserializes_cursor_name() {
        let s: Style = serde_json::from_str(r#"{ "cursor": "pointer" }"#).expect("cursor decodes");
        assert_eq!(s.cursor.as_deref(), Some("pointer"));

        let s: Style =
            serde_json::from_str(r#"{ "cursor": "hand" }"#).expect("custom name decodes");
        assert_eq!(s.cursor.as_deref(), Some("hand"));
    }
}
