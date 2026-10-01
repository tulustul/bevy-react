//! Headless reproduction of the `<anchor> -> other -> <anchor>` demo-switch crash
//! (React #327 "Should not already be working"). Like `roundtrip.rs`, this drives
//! the real JS thread over channels — no GPU/window — so the bug is observable in
//! `cargo test` instead of only in the live app.
//!
//! Requires the example bundle (prefer the dev build for readable errors):
//!   npm run build -w demos
//! Run with `--nocapture` to see the real `[js]` error + bridge instrumentation:
//!   cargo test --test demo_switch -- --nocapture

use std::time::{Duration, Instant};

mod common;
use common::Harness;

fn send_cubes_spawned(h: &Harness) {
    h.event(
        "crowdedCubes.spawned",
        serde_json::json!({
            "cubes": [
                { "entity": 4_294_967_297u64, "label": "#0" },
                { "entity": 4_294_967_298u64, "label": "#1" },
                { "entity": 4_294_967_299u64, "label": "#2" },
            ]
        }),
    );
}

#[test]
fn demo_switch_anchored_survives() {
    let Some(mut h) = Harness::start("demo_switch_anchored_survives") else {
        return;
    };

    // Wait for the initial render and locate the two top-level nav buttons we'll
    // toggle (both render immediately, unlike the collapsed submenu entries).
    let anchored_btn = h
        .wait_button("<anchor>", Duration::from_secs(20))
        .expect("no '<anchor>' nav button in initial render");
    let other_btn = h
        .wait_button("Events", Duration::from_secs(20))
        .expect("no 'Events' nav button in initial render");
    eprintln!("OK   nav buttons: anchored={anchored_btn}, other={other_btn}");

    // The failing user flow, repeated a few times to shake out timing races.
    // A crashed runtime surfaces as a panic in `pump` (the ops channel
    // disconnects).
    for round in 0..3 {
        eprintln!("--- round {round}: -> <anchor>");
        h.click(anchored_btn);
        send_cubes_spawned(&h);
        h.pump(Duration::from_millis(200));

        eprintln!("--- round {round}: -> Events");
        h.click(other_btn);
        h.pump(Duration::from_millis(200));
    }

    // Final liveness check: a live runtime keeps emitting ops for a click.
    // Click the button that toggles state every time (`other_btn`): re-clicking
    // the already-selected `anchored_btn` is an idempotent re-render, which
    // correctly emits ZERO ops now that updates are diffed — silence there is
    // the delta optimization, not a dead runtime.
    eprintln!("--- final liveness probe");
    h.click(other_btn);
    let deadline = Instant::now() + Duration::from_secs(2);
    let mut saw_ops = false;
    while !saw_ops && Instant::now() < deadline {
        saw_ops = h.recv(Duration::from_millis(100)).is_some();
    }
    assert!(saw_ops, "runtime stopped responding after demo switching");
    eprintln!("PASS demo switching survived");
}
