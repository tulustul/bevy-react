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
use bevy_react_animations::AnimationCommand;

fn example_bundle() -> PathBuf {
    // CARGO_MANIFEST_DIR is crates/core; the example bundle is at the repo root.
    // The build emits vendor.js + app.js; the app bundle is what we point at.
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
        Op::Create { id, kind, text, .. } => {
            if kind == "button" {
                buttons.insert(*id);
            }
            // A single-string `<text>` rides its label inline on the create op
            // (the `shouldSetTextContent` fast path) rather than as a child run.
            if let Some(text) = text {
                text_of.insert(*id, text.clone());
            }
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

/// A nav entry renders `<button>…<text>{label}</text>…</button>`, where the label
/// `<text>` is nested under one or more wrapper `<node>`s, so walk up from the label's
/// text run until we reach the enclosing button.
fn find_button(
    label: &str,
    buttons: &HashSet<u32>,
    parent_of: &HashMap<u32, u32>,
    text_of: &HashMap<u32, String>,
) -> Option<u32> {
    for (span, text) in text_of {
        if text.trim() != label {
            continue;
        }
        // Bound the walk so a malformed parent map can't loop forever.
        let mut current = *span;
        for _ in 0..8 {
            let Some(&parent) = parent_of.get(&current) else {
                break;
            };
            if buttons.contains(&parent) {
                return Some(parent);
            }
            current = parent;
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

    let click = |id: u32| {
        outbound_tx
            .send(Outbound::UiEvent {
                event: UiEvent {
                    id,
                    kind: "click".into(),
                    ..Default::default()
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
                    Op::Create {
                        id,
                        props,
                        kind,
                        text,
                    } => {
                        if kind == "button" {
                            assert!(props.on_click, "button created without onClick");
                        }
                        // The `+` label and the `3` count both ride inline on their
                        // `<text>` create op (the `shouldSetTextContent` fast path).
                        match text.as_deref().map(str::trim) {
                            Some("+") => plus_text = Some(*id),
                            Some("3") => saw_initial = true,
                            _ => {}
                        }
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

/// End-to-end check of animation completion callbacks: the Sequence demo's Play
/// button assigns a driver whose callback re-enables the button. Playing Bevy's
/// role, we capture the token-tagged `animate` command and inject the
/// `AnimationFinished` settlement, asserting the callback's re-render lands.
#[test]
fn animation_callback_round_trip() {
    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping animation_callback_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos-app",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    // Held for the duration so emits/requests from the app go nowhere harmlessly.
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, _request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    let (anim_tx, anim_rx) = crossbeam_channel::unbounded::<AnimationCommand>();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    // Held for the duration: dropping the reload sender would look like shutdown.
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

    let click = |id: u32| {
        outbound_tx
            .send(Outbound::UiEvent {
                event: UiEvent {
                    id,
                    kind: "click".into(),
                    ..Default::default()
                },
            })
            .expect("JS thread gone before click");
    };

    // Navigate the left-nav: expand "Animations", select "Sequence".
    let animations = drain_until_button(
        &ops_rx,
        "Animations",
        Duration::from_secs(15),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'Animations' nav button in initial render");
    click(animations);

    let sequence = drain_until_button(
        &ops_rx,
        "Sequence",
        Duration::from_secs(10),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'Sequence' nav button after expanding 'Animations'");
    click(sequence);

    let play = drain_until_button(
        &ops_rx,
        "Play",
        Duration::from_secs(10),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'Play' button in the Sequence demo");
    click(play);

    // The click handler assigns the sequence driver with a completion callback —
    // the `animate` command must carry a correlation token. Skip the demo's
    // other commands (`declare` on mount, etc.).
    let deadline = Instant::now() + Duration::from_secs(10);
    let (value_id, token) = loop {
        assert!(Instant::now() < deadline, "no tokened animate after Play");
        match anim_rx.recv_timeout(Duration::from_millis(500)) {
            Ok(AnimationCommand::Animate {
                id,
                token: Some(token),
                ..
            }) => break (id, token),
            Ok(_) => {}
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => panic!("JS thread died before animate"),
        }
    };
    eprintln!("OK   Play assigned driver: shared value {value_id}, token {token}");

    // Bevy's part, played by hand: report the driver settled. The callback runs
    // `setRunning(false)`, flipping the button label "Playing…" -> "Play".
    outbound_tx
        .send(Outbound::AnimationFinished {
            id: value_id,
            token,
            finished: true,
        })
        .expect("JS thread gone before settlement");

    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                if let Op::UpdateText { text, .. } = op
                    && text.trim() == "Play"
                {
                    eprintln!("OK   completion callback re-render: label back to 'Play'");
                    eprintln!("PASS animation callback end-to-end");
                    return;
                }
            }
        }
    }
    panic!("no 'Play' label update after AnimationFinished — callback never fired");
}
