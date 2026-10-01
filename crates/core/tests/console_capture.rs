//! Headless end-to-end check of the devtools console ring through the REAL
//! deno_core runtime: `console.*` calls in app code must land in
//! [`bevy_react_core::console_log`] with the right source/level (via the prelude
//! shim → `op_log`), and an unhandled promise rejection must be captured by
//! the prelude's rejection handler as a js/error entry instead of erroring
//! the event loop.
//!
//! Self-contained: drives `spawn_js_thread` with a tiny synthetic bundle
//! (written to a temp dir), so it needs no demos build. The ring is
//! process-global, but this integration test is its own process — no
//! contention with the lib tests. Compiled out without the devtools sinks
//! (release / no devtools feature): the ring is stubbed there.
#![cfg(all(feature = "devtools", debug_assertions))]

use std::time::{Duration, Instant};

use bevy_react_core::console_log::{self, Level, Source};

mod common;
use common::Js;

/// Exercise every console level plus an unhandled rejection, then park on
/// `op_next_event` so the event loop stays alive to process the rejection.
const APP: &str = r#"
console.log("cap-hello", { a: 1 });
console.debug("cap-dbg");
console.warn("cap-warn");
console.error(new Error("cap-boom"));
Promise.reject(new Error("cap-lost"));
Deno.core.ops.op_next_event();
"#;

#[test]
fn console_capture_round_trip() {
    // Held for the test: the parked `op_next_event` keeps the runtime alive.
    let _js = Js::spawn("console_capture", APP);

    // Poll the ring until every expected entry landed (the rejection is
    // processed asynchronously by the event loop, so it can trail the
    // synchronous console calls).
    let expected: [(&str, Source, Level); 5] = [
        ("cap-hello", Source::Js, Level::Info),
        ("cap-dbg", Source::Js, Level::Debug),
        ("cap-warn", Source::Js, Level::Warn),
        ("cap-boom", Source::Js, Level::Error),
        ("cap-lost", Source::Js, Level::Error),
    ];
    let deadline = Instant::now() + Duration::from_secs(10);
    let entries = loop {
        let (entries, _) = console_log::since(0);
        if expected
            .iter()
            .all(|(marker, _, _)| entries.iter().any(|e| e.message.contains(marker)))
        {
            break entries;
        }
        assert!(
            Instant::now() < deadline,
            "missing console entries; ring has: {:?}",
            entries.iter().map(|e| &e.message).collect::<Vec<_>>()
        );
        std::thread::sleep(Duration::from_millis(50));
    };

    for (marker, source, level) in expected {
        let entry = entries
            .iter()
            .find(|e| e.message.contains(marker))
            .unwrap_or_else(|| panic!("no entry containing {marker:?}"));
        assert_eq!(entry.source, source, "source of {marker:?}");
        assert_eq!(entry.level, level, "level of {marker:?}");
    }

    // Object args JSON-stringify through the shim's __fmtArg.
    let hello = entries
        .iter()
        .find(|e| e.message.contains("cap-hello"))
        .unwrap();
    assert!(
        hello.message.contains(r#"{"a":1}"#),
        "object arg must stringify: {:?}",
        hello.message
    );
    // The rejection goes through the prelude handler, labeled as such.
    let lost = entries
        .iter()
        .find(|e| e.message.contains("cap-lost"))
        .unwrap();
    assert!(
        lost.message.contains("unhandled promise rejection"),
        "rejections are labeled: {:?}",
        lost.message
    );

    let seqs: Vec<u64> = entries.iter().map(|e| e.seq).collect();
    assert!(
        seqs.windows(2).all(|w| w[1] > w[0]),
        "seqs strictly increase: {seqs:?}"
    );
    eprintln!("PASS console capture end-to-end");
}
