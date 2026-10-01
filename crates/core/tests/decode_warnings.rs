//! Headless end-to-end check of the decode-warning path through the REAL
//! deno_core runtime and the real `op_flush` (one JSON string in, `serde_json`
//! decode behind the op — the production wire): a flushed batch with invalid
//! style values must decode without dropping ops, collect per-op-attributed
//! [`bevy_react` diag] warnings, and hand them back through the
//! `op_take_decode_warnings` op — the exact sequence the devtools bridge tap
//! performs after every flush.
//!
//! Self-contained: drives `spawn_js_thread` with a tiny synthetic bundle
//! (written to a temp dir), so it needs no demos build. Compiled out entirely
//! without the diag sinks (release / no devtools feature): the op would
//! legitimately return `[]` there.
#![cfg(all(feature = "devtools", debug_assertions))]

use std::time::Duration;

mod common;
use common::Js;

/// Flush one batch with invalid values (a bad length, a bad keyword, a bad
/// rect token, a bad backgroundImage mode — each after the first on a
/// different node — and an attribute the op's element doesn't have: `src` is
/// an `<image>` attribute, not a `<node>` one), then ship whatever
/// `op_take_decode_warnings` drains back over the emit channel. Update ops
/// carry their `kind` before `props`, as the runtime emits them.
const APP: &str = r#"
const ops = Deno.core.ops;
ops.op_flush(JSON.stringify([
  { op: "create", id: 1, kind: "node", props: { style: { width: "aa16" } } },
  { op: "append", parent: 0, child: 1 },
  { op: "update", id: 2, kind: "node", props: { style: { display: "flexx", padding: "1px bogus" } } },
  { op: "update", id: 3, kind: "node", props: { style: { backgroundImage: { src: "x.png", mode: "tile" } } } },
  { op: "update", id: 4, kind: "node", props: { src: "a.png" } },
  { op: "update", id: 5, kind: "image", props: { src: "a.png" } },
]), false);
ops.op_emit("decodeWarnings", ops.op_take_decode_warnings());
"#;

#[test]
fn decode_warnings_round_trip() {
    let js = Js::spawn("decode_warnings", APP);

    // The invalid values must not cost any ops: the whole batch arrives.
    let batch = js
        .ops
        .recv_timeout(Duration::from_secs(15))
        .expect("no op batch from the JS thread");
    assert_eq!(batch.len(), 6, "fallback decoding must not drop ops");

    // The drained warnings come back over the emit channel.
    let warnings = js.emitted("decodeWarnings", Duration::from_secs(15));

    let brief: Vec<(Option<u64>, &str, &str)> = warnings
        .as_array()
        .expect("warnings must be an array")
        .iter()
        .map(|w| {
            (
                w["node"].as_u64(),
                w["kind"].as_str().unwrap_or(""),
                w["value"].as_str().unwrap_or(""),
            )
        })
        .collect();
    assert_eq!(
        brief,
        vec![
            (Some(1), "length", "aa16"),
            (Some(2), "display", "flexx"),
            (Some(2), "rect", "bogus"),
            (Some(3), "backgroundImage", "tile"),
            (Some(4), "unknownProp", "src"),
        ],
        "the op decode must attribute each warning to its op's node"
    );
    eprintln!("PASS decode warnings end-to-end: {brief:?}");
}
