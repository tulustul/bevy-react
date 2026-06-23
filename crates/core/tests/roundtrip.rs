//! Headless end-to-end check of the Rust<->JS bridge — no GPU/window needed.
//! Plays the role of Bevy: drives the JS thread directly and asserts the initial
//! render plus a click round trip.
//!
//! Requires the example bundle to be built first:
//!   npm install && npm run build -w demos-app
//! If the bundle is missing the test skips (passes) with a notice.

use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::time::{Duration, Instant};

use crossbeam_channel::{Receiver, RecvTimeoutError};

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{Op, Outbound, UiEvent};
use bevy_react::{RawRequest, ReactMessage};

fn example_bundle() -> PathBuf {
    // CARGO_MANIFEST_DIR is crates/core; the example bundle is at the repo root.
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/demos/ui/dist/bundle.js")
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

/// Drain ops (keeping the lookup maps current) until a button with `label` exists
/// or `dur` elapses.
fn drain_until_button(
    ops_rx: &Receiver<Vec<Op>>,
    label: &str,
    dur: Duration,
    buttons: &mut HashSet<u32>,
    parent_of: &mut HashMap<u32, u32>,
    text_of: &mut HashMap<u32, String>,
) -> Option<u32> {
    let deadline = Instant::now() + dur;
    loop {
        if let Some(button) = find_button(label, buttons, parent_of, text_of) {
            return Some(button);
        }
        if Instant::now() >= deadline {
            return None;
        }
        match ops_rx.recv_timeout(Duration::from_millis(100)) {
            Ok(batch) => {
                for op in &batch {
                    accumulate(op, buttons, parent_of, text_of);
                }
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => panic!("JS thread died during nav"),
        }
    }
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

    let mut buttons: HashSet<u32> = HashSet::new();
    let mut parent_of: HashMap<u32, u32> = HashMap::new();
    let mut text_of: HashMap<u32, String> = HashMap::new();

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

    // Phase 0: the gallery starts on another demo, so navigate the left-nav to the
    // counter demo — expand the "Communication" submenu, then select "Bevy <- React"
    // (the `bevy.basicDemo.setCount` counter) — before asserting the round trip.
    let comm = drain_until_button(
        &ops_rx,
        "Communication",
        Duration::from_secs(15),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'Communication' nav button in initial render");
    click(comm);

    let basic = drain_until_button(
        &ops_rx,
        "Bevy <- React",
        Duration::from_secs(10),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'Bevy <- React' nav button after expanding 'Communication'");
    click(basic);

    // Phase 1: the counter renders an increment button labelled `+` and the count
    // run `3` (from `Cubes: <text>{count}</text>`, so the count is its own span).
    // The increment button is the parent of the bare `+` text node.
    let mut plus_text: Option<u32> = None;
    let mut button_id: Option<u32> = None;
    let mut saw_initial = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(button_id.is_some() && saw_initial) {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
                match op {
                    Op::Create { props, kind, .. } if kind == "button" => {
                        assert!(props.on_click, "button created without onClick");
                    }
                    Op::CreateText { id, text } if text.trim() == "+" => {
                        plus_text = Some(*id);
                    }
                    Op::CreateText { text, .. } | Op::CreateTextSpan { text, .. }
                        if text.trim() == "3" =>
                    {
                        saw_initial = true;
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

    let button_id = button_id.expect("no '+' button in counter demo");
    assert!(saw_initial, "initial count '3' not rendered");
    eprintln!("OK   counter render: '+' button id={button_id}, count '3' present");

    // Phase 2: report a click on the button.
    click(button_id);

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
