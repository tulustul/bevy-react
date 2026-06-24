//! Headless reproduction of the `Anchored -> other -> Anchored` demo-switch crash
//! (React #327 "Should not already be working"). Like `roundtrip.rs`, this drives
//! the real JS thread over channels — no GPU/window — so the bug is observable in
//! `cargo test` instead of only in the live app.
//!
//! Requires the example bundle (prefer the dev build for readable errors):
//!   npm run build -w demos-app
//! Run with `--nocapture` to see the real `[js]` error + bridge instrumentation:
//!   cargo test --test demo_switch -- --nocapture

use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::time::{Duration, Instant};

use crossbeam_channel::{Receiver, RecvTimeoutError};

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{Op, Outbound, UiEvent};
use bevy_react::{RawRequest, ReactMessage};

fn example_bundle() -> PathBuf {
    // CARGO_MANIFEST_DIR is crates/core; the example bundle is at the repo root.
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/demos/ui/dist/app.js")
}

/// Fold one op into the lookup maps we use to locate nav buttons by their label.
fn accumulate(
    op: &Op,
    buttons: &mut HashSet<u32>,
    parent_of: &mut HashMap<u32, u32>,
    text_of: &mut HashMap<u32, String>,
) {
    match op {
        Op::Create { id, kind, .. } if kind == "button" => {
            buttons.insert(*id);
        }
        Op::CreateTextSpan { id, text } | Op::CreateText { id, text } => {
            text_of.insert(*id, text.clone());
        }
        Op::Append { parent, child } => {
            parent_of.insert(*child, *parent);
        }
        Op::Insert { parent, child, .. } => {
            parent_of.insert(*child, *parent);
        }
        _ => {}
    }
}

/// A nav entry renders `<button><text>{label}</text></button>`, so the button id
/// is the grandparent of the label's text run.
fn find_button(
    label: &str,
    buttons: &HashSet<u32>,
    parent_of: &HashMap<u32, u32>,
    text_of: &HashMap<u32, String>,
) -> Option<u32> {
    for (span, text) in text_of {
        if text.trim() == label
            && let Some(&text_node) = parent_of.get(span)
            && let Some(&button) = parent_of.get(&text_node)
            && buttons.contains(&button)
        {
            return Some(button);
        }
    }
    None
}

/// Drain ops for `dur`, keeping the lookup maps current. Panics if the JS thread
/// dies (channel disconnects) — that's the crash we're hunting.
fn pump(
    ops_rx: &Receiver<Vec<Op>>,
    dur: Duration,
    buttons: &mut HashSet<u32>,
    parent_of: &mut HashMap<u32, u32>,
    text_of: &mut HashMap<u32, String>,
) {
    let deadline = Instant::now() + dur;
    while Instant::now() < deadline {
        match ops_rx.recv_timeout(Duration::from_millis(25)) {
            Ok(batch) => {
                for op in &batch {
                    accumulate(op, buttons, parent_of, text_of);
                }
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => {
                panic!("JS thread died (runtime crashed) — see the `[js] runtime error` above");
            }
        }
    }
}

fn send_cubes_spawned(outbound_tx: &tokio::sync::mpsc::UnboundedSender<Outbound>) {
    let value = serde_json::json!({
        "cubes": [
            { "entity": 4_294_967_297u64, "label": "#0" },
            { "entity": 4_294_967_298u64, "label": "#1" },
            { "entity": 4_294_967_299u64, "label": "#2" },
        ]
    });
    outbound_tx
        .send(Outbound::Event {
            name: "crowdedCubes.spawned".into(),
            value,
        })
        .expect("JS thread gone before event");
}

#[test]
fn demo_switch_anchored_survives() {
    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping demo_switch_anchored_survives: bundle not built at {}\n  run: npm run build -w demos-app",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, _request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let vendor = bundle.with_file_name("vendor.js");
    spawn_js_thread(
        vendor,
        bundle,
        ops_tx,
        emit_tx,
        request_tx,
        anim_tx,
        outbound_rx,
        reload_rx,
    );

    let mut buttons: HashSet<u32> = HashSet::new();
    let mut parent_of: HashMap<u32, u32> = HashMap::new();
    let mut text_of: HashMap<u32, String> = HashMap::new();

    // Wait for the initial render and locate the two top-level nav buttons we'll
    // toggle (both render immediately, unlike the collapsed submenu entries).
    let mut anchored_btn = None;
    let mut other_btn = None;
    let deadline = Instant::now() + Duration::from_secs(20);
    while Instant::now() < deadline && (anchored_btn.is_none() || other_btn.is_none()) {
        match ops_rx.recv_timeout(Duration::from_millis(500)) {
            Ok(batch) => {
                for op in &batch {
                    accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
                }
                anchored_btn = anchored_btn
                    .or_else(|| find_button("World Anchors", &buttons, &parent_of, &text_of));
                other_btn = other_btn
                    .or_else(|| find_button("Interactions", &buttons, &parent_of, &text_of));
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => panic!("JS thread died during initial render"),
        }
    }

    let anchored_btn = anchored_btn.expect("no 'World Anchors' nav button in initial render");
    let other_btn = other_btn.expect("no 'Interactions' nav button in initial render");
    eprintln!("OK   nav buttons: anchored={anchored_btn}, other={other_btn}");

    let click = |id: u32| {
        outbound_tx
            .send(Outbound::UiEvent {
                event: UiEvent {
                    id,
                    kind: "click".into(),
                    x: None,
                    y: None,
                    client_x: None,
                    client_y: None,
                    value: None,
                },
            })
            .expect("JS thread gone before click");
    };

    // The failing user flow, repeated a few times to shake out timing races.
    for round in 0..3 {
        eprintln!("--- round {round}: -> Anchored");
        click(anchored_btn);
        send_cubes_spawned(&outbound_tx);
        pump(
            &ops_rx,
            Duration::from_millis(200),
            &mut buttons,
            &mut parent_of,
            &mut text_of,
        );

        eprintln!("--- round {round}: -> Interactions");
        click(other_btn);
        pump(
            &ops_rx,
            Duration::from_millis(200),
            &mut buttons,
            &mut parent_of,
            &mut text_of,
        );
    }

    // Final liveness check: a live runtime keeps emitting ops for a click.
    eprintln!("--- final liveness probe");
    click(anchored_btn);
    let saw_ops = {
        let deadline = Instant::now() + Duration::from_secs(2);
        let mut any = false;
        while Instant::now() < deadline && !any {
            match ops_rx.recv_timeout(Duration::from_millis(100)) {
                Ok(_) => any = true,
                Err(RecvTimeoutError::Timeout) => {}
                Err(RecvTimeoutError::Disconnected) => {
                    panic!("JS thread crashed during demo switching (#327)")
                }
            }
        }
        any
    };
    assert!(saw_ops, "runtime stopped responding after demo switching");
    eprintln!("PASS demo switching survived");
}
