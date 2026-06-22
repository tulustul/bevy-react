//! Headless check that the JS runtime's `setTimeout` honors its delay (a real
//! timer via `op_sleep`), rather than the old shim that fired on the microtask
//! queue and ignored the delay. Drives the JS thread directly — no GPU/window.
//!
//! It compares an emit made immediately at script start against one made from a
//! `setTimeout(_, 300)`, so the measured gap is the timer delay alone — runtime
//! build / module-load cost is excluded (it precedes both emits).

use std::io::Write;
use std::time::{Duration, Instant};

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{Op, Outbound};
use bevy_react::{RawRequest, ReactMessage};

#[test]
fn set_timeout_honors_delay() {
    // Emit "early" synchronously, schedule "late" 300ms out, then park on
    // op_next_event so the runtime's event loop stays alive to pump the timer.
    let bundle = std::env::temp_dir().join("bevy_react_timer_test.mjs");
    std::fs::File::create(&bundle)
        .expect("create temp bundle")
        .write_all(
            br#"
            Deno.core.ops.op_emit("early", null);
            setTimeout(() => { Deno.core.ops.op_emit("late", null); }, 300);
            for (;;) { const m = await Deno.core.ops.op_next_event(); if (m == null) break; }
            "#,
        )
        .expect("write temp bundle");

    let (ops_tx, _ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (emit_tx, emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, _request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    let (_outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    // Held for the duration: dropping the reload sender would look like shutdown.
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    spawn_js_thread(bundle, ops_tx, emit_tx, request_tx, outbound_rx, reload_rx);

    let early = emit_rx
        .recv_timeout(Duration::from_secs(10))
        .expect("immediate emit never arrived");
    assert_eq!(early.name, "early");
    let after_early = Instant::now();

    let late = emit_rx
        .recv_timeout(Duration::from_secs(10))
        .expect("setTimeout callback never emitted");
    assert_eq!(late.name, "late");

    let gap = after_early.elapsed();
    // The old microtask shim fired the callback in well under 50ms; a real 300ms
    // timer must take noticeably longer (generous lower bound to avoid flakiness).
    assert!(
        gap >= Duration::from_millis(200),
        "setTimeout fired too early ({gap:?}) — delay not honored"
    );
    eprintln!("OK   setTimeout honored its delay (gap {gap:?})");
}
