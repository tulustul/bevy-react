//! Headless check that a BROKEN hot reload doesn't wedge the JS thread — no GPU.
//!
//! Regression test for the freeze the user hit by typing `padding: aa16` (an
//! undefined identifier): the rebuilt bundle threw synchronously out of
//! `execute_script`, the spawn loop escalated to a full rebuild that re-threw,
//! then `break`ed the loop — killing the JS thread so the UI froze permanently
//! and never recovered. The loop now rejects a throwing update, re-runs the last
//! working bundle (which re-parks the event loop), and keeps going.
//!
//! The "app" is hand-written (no React) so we can drive the Rust mechanism
//! directly: a counter on `globalThis` that must survive, plus event-loop
//! re-parking that must keep working after a rejected update.

use std::time::Duration;

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{Op, Outbound, UiEvent};
use bevy_react::{RawRequest, ReactMessage};

// A working bundle: cold start parks the event loop; re-execution (hot update)
// preserves `__n` and re-parks. Mirrors tests/hot_reload.rs's APP.
const GOOD_APP: &[u8] = br#"
(function () {
  if (globalThis.__started) {
    Deno.core.ops.op_emit("phase", "update:" + globalThis.__n);
    globalThis.__loop();
    return;
  }
  globalThis.__started = true;
  globalThis.__n = 41;
  globalThis.__loop = () => (async () => {
    for (;;) {
      const m = await Deno.core.ops.op_next_event();
      if (m == null) return;        // shutdown
      if (m.t === "reload") return; // yield to Rust so it can re-exec the app
      if (m.t === "uiEvent") {
        globalThis.__n++;
        Deno.core.ops.op_emit("phase", "click:" + globalThis.__n);
      }
    }
  })();
  Deno.core.ops.op_emit("phase", "init:" + globalThis.__n);
  globalThis.__loop();
})();
"#;

// A broken bundle: references an undefined identifier at module scope, so
// `execute_script` throws synchronously — exactly the `padding: aa16` shape.
const BROKEN_APP: &[u8] = b"aa16;\n";

fn click(tx: &tokio::sync::mpsc::UnboundedSender<Outbound>) {
    tx.send(Outbound::UiEvent {
        event: UiEvent {
            id: 1,
            kind: "click".into(),
            ..Default::default()
        },
    })
    .expect("JS thread gone");
}

#[test]
fn broken_reload_is_rejected_and_recovers() {
    let dir = std::env::temp_dir().join("bevy_react_broken_reload_test");
    std::fs::create_dir_all(&dir).expect("mkdir");
    std::fs::write(dir.join("vendor.js"), b"// no-op vendor\n").expect("write vendor");
    let app = dir.join("app.js");
    std::fs::write(&app, GOOD_APP).expect("write app");

    let (ops_tx, _ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (emit_tx, emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, _request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    let (reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    spawn_js_thread(
        dir.join("vendor.js"),
        app.clone(),
        ops_tx,
        emit_tx,
        request_tx,
        anim_tx,
        outbound_rx,
        reload_rx,
    );

    // Receive the next emit whose phase has `prefix`, skipping any others. A real
    // wedge surfaces as a 10s timeout ("no emit"); we drain duplicate `update:`
    // emits because a reload can fire a spurious second re-park (a PRE-EXISTING
    // race — see the flaky tests/hot_reload.rs — not this fix, which does exactly
    // one restore per reject). Returns the counter value after the prefix.
    let recv_prefix = |prefix: &str| -> u32 {
        loop {
            let phase = emit_rx
                .recv_timeout(Duration::from_secs(10))
                .expect("no emit — UI wedged?")
                .value
                .as_str()
                .unwrap()
                .to_string();
            if let Some(n) = phase.strip_prefix(prefix) {
                return n.parse().expect("counter");
            }
        }
    };

    // Cold start + a click prove the working baseline.
    assert_eq!(recv_prefix("init:"), 41);
    click(&outbound_tx);
    assert_eq!(recv_prefix("click:"), 42);

    // Push a BROKEN bundle and reload. The update throws out of `execute_script`;
    // the loop must reject it and re-run the last-good bundle, which re-parks the
    // event loop and reports the preserved counter (42 — isolate NOT torn down).
    std::fs::write(&app, BROKEN_APP).expect("write broken app");
    reload_tx.send(()).expect("send reload");
    assert_eq!(
        recv_prefix("update:"),
        42,
        "a broken reload tore down the working app instead of being rejected"
    );

    // The key regression assertion: a click AFTER the rejected update still works.
    // Previously the JS thread had `break`ed here and the UI was frozen forever
    // (this would now time out in `recv_prefix` rather than return).
    click(&outbound_tx);
    assert!(
        recv_prefix("click:") > 42,
        "event loop did not survive a rejected (broken) hot reload"
    );

    // Fixing the code (a good bundle again) applies on the next reload — recovery.
    std::fs::write(&app, GOOD_APP).expect("rewrite good app");
    reload_tx.send(()).expect("send reload");
    recv_prefix("update:"); // next good edit applied
    click(&outbound_tx);
    assert!(
        recv_prefix("click:") > 42,
        "event loop broken after recovery"
    );

    eprintln!("OK   broken reload rejected; working UI preserved and recovered on next good edit");
}
