//! Headless check that the JS runtime's `setTimeout` honors its delay (a real
//! timer via `op_sleep`), rather than the old shim that fired on the microtask
//! queue and ignored the delay. Drives the JS thread directly — no GPU/window.
//!
//! It compares an emit made immediately at script start against one made from a
//! `setTimeout(_, 300)`, so the measured gap is the timer delay alone — runtime
//! build / module-load cost is excluded (it precedes both emits).

use std::time::{Duration, Instant};

mod common;
use common::Js;

#[test]
fn set_timeout_honors_delay() {
    // Emit "early" synchronously, schedule "late" 300ms out, then park on
    // op_next_event so the runtime's event loop stays alive to pump the timer.
    // The app bundle is a classic script (no top-level await), so the body runs
    // in an async IIFE.
    let js = Js::spawn(
        "timers",
        r#"
        (async () => {
          Deno.core.ops.op_emit("early", null);
          setTimeout(() => { Deno.core.ops.op_emit("late", null); }, 300);
          for (;;) { const m = await Deno.core.ops.op_next_event(); if (m == null) break; }
        })();
        "#,
    );

    js.emitted("early", Duration::from_secs(10));
    let after_early = Instant::now();
    js.emitted("late", Duration::from_secs(10));

    let gap = after_early.elapsed();
    // The old microtask shim fired the callback in well under 50ms; a real 300ms
    // timer must take noticeably longer (generous lower bound to avoid flakiness).
    assert!(
        gap >= Duration::from_millis(200),
        "setTimeout fired too early ({gap:?}) — delay not honored"
    );
    eprintln!("OK   setTimeout honored its delay (gap {gap:?})");
}
