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

mod common;
use common::Js;

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

#[test]
fn hot_reload_preserves_isolate_state() {
    let js = Js::spawn("hot_reload", APP);
    let recv = || {
        js.emitted("phase", Duration::from_secs(10))
            .as_str()
            .unwrap()
            .to_string()
    };

    // Cold start.
    assert_eq!(recv(), "init:41");

    // A click bumps the counter — proves the cold event loop works.
    js.click();
    assert_eq!(recv(), "click:42");

    // Hot reload: the live isolate re-executes the app. __n (42) must survive,
    // and the re-execution reports it via the "update:" phase.
    js.reload.send(()).expect("send reload");
    assert_eq!(
        recv(),
        "update:42",
        "global state lost across reload — isolate was torn down, not refreshed"
    );

    // A click AFTER the reload proves the event loop re-parked and still works.
    js.click();
    assert_eq!(
        recv(),
        "click:43",
        "event loop did not resume after hot reload"
    );

    eprintln!("OK   isolate persisted across hot reload; state preserved and loop resumed");
}
