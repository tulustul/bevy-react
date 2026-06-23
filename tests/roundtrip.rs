//! Headless end-to-end check of the Rust<->JS bridge — no GPU/window needed.
//! Plays the role of Bevy: drives the JS thread directly and asserts the initial
//! render plus a click round trip.
//!
//! Requires the example bundle to be built first:
//!   npm install && npm run build -w demos-app
//! If the bundle is missing the test skips (passes) with a notice.

use std::path::PathBuf;
use std::time::{Duration, Instant};

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{Op, Outbound, UiEvent};
use bevy_react::{RawRequest, ReactMessage};

fn example_bundle() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("examples/demos/ui/dist/bundle.js")
}

#[test]
fn bridge_round_trip() {
    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping bridge_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos-app",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    // Held for the duration so emits/requests from the app go nowhere harmlessly.
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, _request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    // Held for the duration so animation commands go nowhere harmlessly.
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    // Held for the duration: dropping the reload sender would look like shutdown.
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    spawn_js_thread(
        bundle,
        ops_tx,
        emit_tx,
        request_tx,
        anim_tx,
        outbound_rx,
        reload_rx,
    );

    // Phase 1: the default demo (Basic UI) renders an increment button labelled
    // `+` and the count run `3` (from `Cubes: <text>{count}</text>`, so the count
    // is its own span, separate from the "Cubes: " label). The left-nav buttons
    // are created first, so we can't take the first button — find the one whose
    // bare-text child is `+` (nav buttons wrap their labels in `<text>` spans).
    use std::collections::{HashMap, HashSet};
    let mut buttons: HashSet<u32> = HashSet::new(); // button ids (with onClick)
    let mut plus_text: Option<u32> = None; // id of the bare `+` text node
    let mut parent_of: HashMap<u32, u32> = HashMap::new(); // child -> parent
    let mut button_id: Option<u32> = None;
    let mut saw_initial = false;
    let deadline = Instant::now() + Duration::from_secs(15);
    while Instant::now() < deadline && !(button_id.is_some() && saw_initial) {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                match op {
                    Op::Create { id, kind, props } if kind == "button" => {
                        assert!(props.on_click, "button created without onClick");
                        buttons.insert(*id);
                    }
                    Op::CreateText { id, text } if text.trim() == "+" => {
                        plus_text = Some(*id);
                    }
                    Op::CreateText { text, .. } | Op::CreateTextSpan { text, .. }
                        if text.trim() == "3" =>
                    {
                        saw_initial = true;
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
            // The increment button is the parent of the bare `+` text node.
            if button_id.is_none()
                && let Some(parent) = plus_text.and_then(|t| parent_of.get(&t))
                && buttons.contains(parent)
            {
                button_id = Some(*parent);
            }
        }
    }

    let button_id = button_id.expect("no '+' button in initial render");
    assert!(saw_initial, "initial count '3' not rendered");
    eprintln!("OK   initial render: '+' button id={button_id}, count '3' present");

    // Phase 2: report a click on the button.
    outbound_tx
        .send(Outbound::UiEvent {
            event: UiEvent {
                id: button_id,
                kind: "click".into(),
                x: None,
                y: None,
                client_x: None,
                client_y: None,
            },
        })
        .expect("JS thread gone before click");

    // Phase 3: clicking `+` from the default 3 should update the count run to '4'.
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                if let Op::UpdateText { text, .. } = op
                    && text.trim() == "4"
                {
                    eprintln!("OK   click round trip: count updated to '4'");
                    eprintln!("PASS bridge end-to-end");
                    return;
                }
            }
        }
    }
    panic!("no count '4' update after click");
}
