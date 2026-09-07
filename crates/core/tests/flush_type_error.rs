//! Headless contract check for `op_flush`'s error path through the REAL
//! deno_core runtime: a *structurally* invalid batch (one `serde_json` cannot
//! decode into `protocol::OpBatch` at all — as opposed to a valid op carrying
//! an invalid style VALUE, which falls back + warns, see `decode_warnings.rs`)
//! must surface in JS as a thrown `TypeError` from the `op_flush` call itself,
//! ship nothing to Bevy, and leave the runtime healthy: the next well-formed
//! batch arrives intact.
//!
//! The devtools bridge tap relies on this shape — it wraps the flush, and an
//! exception class other than `TypeError` (deno_core's default mapping of a
//! plain `serde_json::Error` is a `SyntaxError`/`InvalidData`-class error) would
//! slip past the reporting path. Self-contained: drives `spawn_js_thread` with
//! a tiny synthetic bundle written to a temp dir, no demos build needed.

use std::time::{Duration, Instant};

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{op::Op, outbound::Outbound};
use bevy_react::{RawRequest, ReactMessage};

/// Flush a batch that is not even an array, then one whose op tag is unknown
/// (each must throw a `TypeError` and ship nothing), then a valid two-op batch
/// (must arrive). The observations go back over the emit channel.
const APP: &str = r#"
const ops = Deno.core.ops;
function attempt(batch) {
  try {
    ops.op_flush(JSON.stringify(batch), false);
    return { threw: false };
  } catch (e) {
    return {
      threw: true,
      isTypeError: e instanceof TypeError,
      message: String(e && e.message),
    };
  }
}
const notArray = attempt({ op: "create", id: 1, kind: "node", props: {} });
const badTag = attempt([{ op: "teleport", id: 1 }]);
ops.op_flush(JSON.stringify([
  { op: "create", id: 1, kind: "node", props: { style: { width: "16px" } } },
  { op: "append", parent: 0, child: 1 },
]), false);
ops.op_emit("flushErrors", { notArray, badTag });
"#;

#[test]
fn invalid_batch_throws_type_error_and_next_batch_arrives() {
    let dir = std::env::temp_dir().join(format!(
        "bevy-react-flush-type-error-{}",
        std::process::id()
    ));
    std::fs::create_dir_all(&dir).expect("create temp bundle dir");
    let vendor = dir.join("vendor.js");
    let app = dir.join("app.js");
    std::fs::write(&vendor, "// empty vendor\n").expect("write vendor");
    std::fs::write(&app, APP).expect("write app");

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (flush_stamps_tx, flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, flush_devtools_rx) = crossbeam_channel::unbounded();
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

    // The observations arrive after all three flushes ran on the JS thread.
    let deadline = Instant::now() + Duration::from_secs(15);
    let report = loop {
        match emit_rx.recv_timeout(Duration::from_millis(200)) {
            Ok(msg) if msg.name == "flushErrors" => break msg.value,
            Ok(_) => {}
            Err(crossbeam_channel::RecvTimeoutError::Timeout) => {
                assert!(Instant::now() < deadline, "no flushErrors emit");
            }
            Err(crossbeam_channel::RecvTimeoutError::Disconnected) => {
                panic!("JS thread died before emitting the report")
            }
        }
    };

    for case in ["notArray", "badTag"] {
        let obs = &report[case];
        assert_eq!(obs["threw"], true, "{case}: op_flush must throw, got {obs}");
        assert_eq!(
            obs["isTypeError"], true,
            "{case}: the thrown error must be a TypeError, got {obs}"
        );
        assert!(
            !obs["message"].as_str().unwrap_or("").is_empty(),
            "{case}: the TypeError must carry serde's message, got {obs}"
        );
    }

    // Only the valid batch crossed — the two invalid ones shipped nothing,
    // and their side-channel stamps/flags were never sent either (the decode
    // fails before the stamp), so the FIFOs stay aligned one-to-one.
    let batch = ops_rx
        .recv_timeout(Duration::from_secs(5))
        .expect("the valid batch after the failed ones must arrive");
    assert_eq!(
        batch.len(),
        2,
        "the valid batch must arrive intact: {batch:?}"
    );
    assert!(
        matches!(batch[0], Op::Create { id, .. } if id == 1),
        "first op must be the create: {:?}",
        batch[0]
    );
    assert!(
        ops_rx.try_recv().is_err(),
        "invalid batches must ship nothing to Bevy"
    );
    assert_eq!(
        flush_stamps_rx.try_iter().count(),
        1,
        "one stamp per shipped batch"
    );
    assert_eq!(
        flush_devtools_rx.try_iter().count(),
        1,
        "one devtools flag per shipped batch"
    );
    eprintln!("PASS invalid op batches throw TypeError, runtime stays healthy: {report}");
}
