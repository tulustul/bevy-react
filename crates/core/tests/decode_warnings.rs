//! Headless end-to-end check of the decode-warning path through the REAL
//! deno_core runtime (serde_v8, not serde_json): a flushed batch with invalid
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

use std::time::{Duration, Instant};

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{op::Op, outbound::Outbound};
use bevy_react::{RawRequest, ReactMessage};

/// Flush one batch with four invalid values (a bad length, a bad keyword, a
/// bad rect token, a bad backgroundImage mode — each after the first on a
/// different node), then ship whatever `op_take_decode_warnings` drains back
/// over the emit channel.
const APP: &str = r#"
const ops = Deno.core.ops;
ops.op_flush([
  { op: "create", id: 1, kind: "node", props: { style: { width: "aa16" } } },
  { op: "append", parent: 0, child: 1 },
  { op: "update", id: 2, props: { style: { display: "flexx", padding: "1px bogus" } } },
  { op: "update", id: 3, props: { style: { backgroundImage: { src: "x.png", mode: "tile" } } } },
], false);
ops.op_emit("decodeWarnings", ops.op_take_decode_warnings());
"#;

#[test]
fn decode_warnings_round_trip() {
    let dir =
        std::env::temp_dir().join(format!("bevy-react-decode-warnings-{}", std::process::id()));
    std::fs::create_dir_all(&dir).expect("create temp bundle dir");
    let vendor = dir.join("vendor.js");
    let app = dir.join("app.js");
    std::fs::write(&vendor, "// empty vendor\n").expect("write vendor");
    std::fs::write(&app, APP).expect("write app");

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, _flush_devtools_rx) = crossbeam_channel::unbounded();
    let (emit_tx, emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, _request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (_outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    spawn_js_thread(
        vendor,
        app,
        ops_tx,
        flush_stamps_tx,
        flush_devtools_tx,
        emit_tx,
        request_tx,
        anim_tx,
        outbound_rx,
        reload_rx,
    );

    // The invalid values must not cost any ops: the whole batch arrives.
    let batch = ops_rx
        .recv_timeout(Duration::from_secs(15))
        .expect("no op batch from the JS thread");
    assert_eq!(batch.len(), 4, "fallback decoding must not drop ops");

    // The drained warnings come back over the emit channel.
    let deadline = Instant::now() + Duration::from_secs(15);
    let warnings = loop {
        match emit_rx.recv_timeout(Duration::from_millis(200)) {
            Ok(msg) if msg.name == "decodeWarnings" => break msg.value,
            Ok(_) => {}
            Err(crossbeam_channel::RecvTimeoutError::Timeout) => {
                assert!(Instant::now() < deadline, "no decodeWarnings emit");
            }
            Err(crossbeam_channel::RecvTimeoutError::Disconnected) => {
                panic!("JS thread died before emitting warnings")
            }
        }
    };

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
        ],
        "serde_v8 decode must attribute each warning to its op's node"
    );
    eprintln!("PASS decode warnings end-to-end: {brief:?}");
}
