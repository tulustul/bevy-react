//! Headless check of the persistent-isolate hot-reload path — no GPU/window.
//!
//! Proves the Rust spawn loop's Reload branch (`apply_update`): on a reload
//! signal the isolate is NOT torn down — the rebuilt app is `execute_script`ed
//! into the LIVE V8 context (so `globalThis` state survives) and the event loop
//! re-parks (so events keep flowing after the reload). This is the Rust-side
//! mechanism that, with React + react-refresh on top, yields Fast Refresh.
//!
//! The "app" here is hand-written (no React) so we can assert the mechanism
//! directly: a counter on `globalThis` that must survive the re-execution.

use std::time::Duration;

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{Op, Outbound, UiEvent};
use bevy_react::{RawRequest, ReactMessage};

const APP: &[u8] = br#"
(function () {
  // Re-execution (hot update): the isolate is alive, so __n is preserved. Report
  // it and re-park the event loop (the previous loop returned on the reload).
  if (globalThis.__started) {
    Deno.core.ops.op_emit("phase", "update:" + globalThis.__n);
    globalThis.__loop();
    return;
  }
  // Cold start.
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
fn hot_reload_preserves_isolate_state() {
    let dir = std::env::temp_dir().join("bevy_react_hot_reload_test");
    std::fs::create_dir_all(&dir).expect("mkdir");
    std::fs::write(dir.join("vendor.js"), b"// no-op vendor\n").expect("write vendor");
    let app = dir.join("app.js");
    std::fs::write(&app, APP).expect("write app");

    let (ops_tx, _ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (emit_tx, emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, _request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    let (reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    spawn_js_thread(
        dir.join("vendor.js"),
        app,
        ops_tx,
        emit_tx,
        request_tx,
        anim_tx,
        outbound_rx,
        reload_rx,
    );

    let recv = || {
        emit_rx
            .recv_timeout(Duration::from_secs(10))
            .expect("no emit")
            .value
            .as_str()
            .unwrap()
            .to_string()
    };

    // Cold start.
    assert_eq!(recv(), "init:41");

    // A click bumps the counter — proves the cold event loop works.
    click(&outbound_tx);
    assert_eq!(recv(), "click:42");

    // Hot reload: the live isolate re-executes the app. __n (42) must survive,
    // and the re-execution reports it via the "update:" phase.
    reload_tx.send(()).expect("send reload");
    assert_eq!(
        recv(),
        "update:42",
        "global state lost across reload — isolate was torn down, not refreshed"
    );

    // A click AFTER the reload proves the event loop re-parked and still works.
    click(&outbound_tx);
    assert_eq!(
        recv(),
        "click:43",
        "event loop did not resume after hot reload"
    );

    eprintln!("OK   isolate persisted across hot reload; state preserved and loop resumed");
}
