//! Headless end-to-end check of the Rust<->JS bridge — no GPU/window needed.
//! Plays the role of Bevy: drives the JS thread directly and asserts the initial
//! render plus a click round trip.
//!
//! Requires the example bundle to be built first:
//!   npm install && npm run build -w demos
//! If the bundle is missing the test skips (passes) with a notice.

use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::time::{Duration, Instant};

use crossbeam_channel::{Receiver, RecvTimeoutError};

use bevy_react::animations::AnimationCommand;
use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{op::Op, outbound::Outbound, outbound::UiEvent};
use bevy_react::{RawRequest, ReactMessage};

mod common;

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
            "skipping bridge_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    // Send-instant stamps (devtools pre-apply timing); unread here, held open.
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, _flush_devtools_rx) = crossbeam_channel::unbounded();
    // Held for the duration so emits/requests from the app go nowhere harmlessly.
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    // Held for the duration so animation commands go nowhere harmlessly.
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    common::answer_window_size(request_rx, outbound_tx.clone());
    // Held for the duration: dropping the reload sender would look like shutdown.
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let vendor = bundle.with_file_name("vendor.js");
    spawn_js_thread(
        vendor,
        bundle,
        ops_tx,
        flush_stamps_tx,
        flush_devtools_tx,
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
    // counter demo — expand the "Communication" submenu, then select "React to Bevy"
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
        "React to Bevy",
        Duration::from_secs(10),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'React to Bevy' nav button after expanding 'Communication'");
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
            "skipping animation_callback_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    // Send-instant stamps (devtools pre-apply timing); unread here, held open.
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, _flush_devtools_rx) = crossbeam_channel::unbounded();
    // Held for the duration so emits/requests from the app go nowhere harmlessly.
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    let (anim_tx, anim_rx) = crossbeam_channel::unbounded::<AnimationCommand>();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    common::answer_window_size(request_rx, outbound_tx.clone());
    // Held for the duration: dropping the reload sender would look like shutdown.
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let vendor = bundle.with_file_name("vendor.js");
    spawn_js_thread(
        vendor,
        bundle,
        ops_tx,
        flush_stamps_tx,
        flush_devtools_tx,
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

    // Navigate the left-nav: expand "Animations", select "Animated values"
    // (the Sequence card lives there).
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

    let animated_values = drain_until_button(
        &ops_rx,
        "Animated values",
        Duration::from_secs(10),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'Animated values' nav button after expanding 'Animations'");
    click(animated_values);

    let play = drain_until_button(
        &ops_rx,
        "Play",
        Duration::from_secs(10),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'Play' button in the Sequence demo");
    // Everything queued so far is another page's business — the home wall's
    // tile entrances carry completion callbacks of their own (tokened
    // `Animate`s from before the navigation), and the first tokened command
    // after the click must be Play's.
    while anim_rx.try_recv().is_ok() {}
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

/// End-to-end check of the canvas resize→replay path: a `"resize"` UI event on
/// a `<canvas>` with a declarative `draw` painter must make the JS runtime
/// re-record the painter and send a `draw` op that clears + replays (the Rust
/// side just cleared the retained surface). Located by op kind, not tree
/// shape, so the demo's structure can change freely.
#[test]
fn canvas_resize_replay_round_trip() {
    use bevy_react::canvas::DrawCmd;

    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping canvas_resize_replay_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    // Send-instant stamps (devtools pre-apply timing); unread here, held open.
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, _flush_devtools_rx) = crossbeam_channel::unbounded();
    // Held for the duration so emits/requests from the app go nowhere harmlessly.
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    // Held for the duration so animation commands go nowhere harmlessly.
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    common::answer_window_size(request_rx, outbound_tx.clone());
    // Held for the duration: dropping the reload sender would look like shutdown.
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let vendor = bundle.with_file_name("vendor.js");
    spawn_js_thread(
        vendor,
        bundle,
        ops_tx,
        flush_stamps_tx,
        flush_devtools_tx,
        emit_tx,
        request_tx,
        anim_tx,
        outbound_rx,
        reload_rx,
    );

    let mut buttons: HashSet<u32> = HashSet::new();
    let mut parent_of: HashMap<u32, u32> = HashMap::new();
    let mut text_of: HashMap<u32, String> = HashMap::new();

    // Navigate to the `<canvas>` demo ("Elements" is expanded by default).
    let canvas_nav = drain_until_button(
        &ops_rx,
        "<canvas>",
        Duration::from_secs(15),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no '<canvas>' nav button in initial render");
    outbound_tx
        .send(Outbound::UiEvent {
            event: UiEvent {
                id: canvas_nav,
                kind: "click".into(),
                ..Default::default()
            },
        })
        .expect("JS thread gone before nav click");

    // The demo mounts its declarative (`draw`-prop) canvas first; an
    // imperative (ref-handle) canvas may follow — keep the FIRST create only,
    // since the replay-on-resize contract under test is the declarative one.
    let mut canvas_id: Option<u32> = None;
    let deadline = Instant::now() + Duration::from_secs(10);
    while canvas_id.is_none() && Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                if let Op::Create { id, kind, .. } = op
                    && kind == "canvas"
                {
                    canvas_id = Some(*id);
                    break;
                }
            }
        }
    }
    let canvas_id = canvas_id.expect("no canvas create op in the '<canvas>' demo");
    eprintln!("OK   canvas mounted: id={canvas_id}");

    // Play Bevy's part: the canvas was laid out (its surface cleared) — report it.
    outbound_tx
        .send(Outbound::UiEvent {
            event: UiEvent {
                id: canvas_id,
                kind: "resize".into(),
                width: Some(460.0),
                height: Some(260.0),
                ..Default::default()
            },
        })
        .expect("JS thread gone before resize");

    // The runtime must replay the declarative painter: a `draw` op for this
    // node, starting with a full clear, followed by the recorded drawing.
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                if let Op::Draw { id, cmds } = op
                    && *id == canvas_id
                {
                    assert_eq!(
                        cmds.first(),
                        Some(&DrawCmd::Clear),
                        "resize replay must lead with a clear"
                    );
                    assert!(cmds.len() > 1, "resize replay recorded no drawing");
                    eprintln!("OK   resize replay: draw op with {} commands", cmds.len());
                    eprintln!("PASS canvas resize end-to-end");
                    return;
                }
            }
        }
    }
    panic!("no draw op after resize — declarative painter never replayed");
}

/// End-to-end check of the `<root>` host element from APP code (the modal demo):
/// opening the modal must mount a detached `<root>` whose `name` prop crossed as
/// the `target` wire field, and closing it must remove that root — exercising
/// the detached-root machinery outside the devtools panel.
#[test]
fn root_demo_modal_round_trip() {
    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping root_demo_modal_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    // Send-instant stamps (devtools pre-apply timing); unread here, held open.
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, _flush_devtools_rx) = crossbeam_channel::unbounded();
    // Held for the duration so emits/requests from the app go nowhere harmlessly.
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    // Held for the duration so animation commands go nowhere harmlessly.
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    common::answer_window_size(request_rx, outbound_tx.clone());
    // Held for the duration: dropping the reload sender would look like shutdown.
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let vendor = bundle.with_file_name("vendor.js");
    spawn_js_thread(
        vendor,
        bundle,
        ops_tx,
        flush_stamps_tx,
        flush_devtools_tx,
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

    // Navigate to the `<root>` demo ("Elements" is expanded by default).
    let nav = drain_until_button(
        &ops_rx,
        "<root>",
        Duration::from_secs(15),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no '<root>' nav button in initial render");
    click(nav);

    let open = drain_until_button(
        &ops_rx,
        "Open modal",
        Duration::from_secs(10),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'Open modal' button in the <root> demo");
    click(open);

    // The modal must mount as a `<root>` create op carrying the demo's `name`
    // prop (its own wire field — it becomes the entity's Bevy `Name` and the
    // devtools root-selector label).
    let mut root_id: Option<u32> = None;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if root_id.is_some() && find_button("Close", &buttons, &parent_of, &text_of).is_some() {
            break;
        }
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(200)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
                if let Op::Create {
                    id, kind, props, ..
                } = op
                    && kind == "root"
                {
                    assert_eq!(
                        props.name.as_deref(),
                        Some("modal"),
                        "the <root>'s `name` prop must cross as wire `name`"
                    );
                    root_id = Some(*id);
                }
            }
        }
    }
    let root_id = root_id.expect("no `<root>` create op after opening the modal");
    let close = find_button("Close", &buttons, &parent_of, &text_of)
        .expect("no 'Close' button in the modal");
    eprintln!("OK   modal mounted: <root name=\"modal\"> id={root_id}");

    // Closing must remove the detached root.
    click(close);
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(200)) {
            for op in &batch {
                if let Op::Remove { child, .. } = op
                    && *child == root_id
                {
                    eprintln!("OK   modal closed: <root> removed");
                    eprintln!("PASS <root> demo end-to-end");
                    return;
                }
            }
        }
    }
    panic!("modal `<root>` never removed after Close");
}

/// End-to-end check of the JSX `<svg>` pipeline: navigating to the `<svg>`
/// demo must mount an `svg` element whose `viewBox` decoded, shape children
/// whose attrs crossed as the folded `shape` object, every shape attached via
/// Append/Insert — and, once the render settles, a quiet window with **no
/// empty update ops** (the delta-diff invariant, end-to-end).
#[test]
fn svg_jsx_render_round_trip() {
    use bevy_react::protocol::props::Props;

    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping svg_jsx_render_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    // Send-instant stamps (devtools pre-apply timing); unread here, held open.
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, _flush_devtools_rx) = crossbeam_channel::unbounded();
    // Held for the duration so emits/requests from the app go nowhere harmlessly.
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    // Held for the duration so animation commands go nowhere harmlessly.
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    common::answer_window_size(request_rx, outbound_tx.clone());
    // Held for the duration: dropping the reload sender would look like shutdown.
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let vendor = bundle.with_file_name("vendor.js");
    spawn_js_thread(
        vendor,
        bundle,
        ops_tx,
        flush_stamps_tx,
        flush_devtools_tx,
        emit_tx,
        request_tx,
        anim_tx,
        outbound_rx,
        reload_rx,
    );

    let mut buttons: HashSet<u32> = HashSet::new();
    let mut parent_of: HashMap<u32, u32> = HashMap::new();
    let mut text_of: HashMap<u32, String> = HashMap::new();

    // Navigate to the `<svg>` demo ("Elements" is expanded by default).
    let nav = drain_until_button(
        &ops_rx,
        "<svg>",
        Duration::from_secs(15),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no '<svg>' nav button in initial render");
    outbound_tx
        .send(Outbound::UiEvent {
            event: UiEvent {
                id: nav,
                kind: "click".into(),
                ..Default::default()
            },
        })
        .expect("JS thread gone before nav click");

    // The demo's chart card mounts an `<svg viewBox>` element with shape
    // children (rect/circle/line/path/polyline under a transformed <g>).
    let mut svg_seen = false;
    let mut chart_rect: Option<u32> = None;
    let mut shape_ids: Vec<u32> = Vec::new();
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(svg_seen && chart_rect.is_some()) {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
                if let Op::Create {
                    id, kind, props, ..
                } = op
                {
                    match kind.as_str() {
                        "svg" => {
                            assert!(
                                props.view_box.is_some(),
                                "the chart <svg>'s viewBox must decode on its create op"
                            );
                            svg_seen = true;
                        }
                        "rect" | "circle" | "line" | "path" | "polyline" | "polygon"
                        | "ellipse" | "g" => {
                            let shape = props.shape.as_ref().unwrap_or_else(|| {
                                panic!("<{kind}> created without a folded shape object")
                            });
                            if kind == "rect"
                                && shape.x.is_some()
                                && shape.width.is_some()
                                && shape.fill.is_some()
                            {
                                chart_rect = Some(*id);
                            }
                            shape_ids.push(*id);
                        }
                        _ => {}
                    }
                }
            }
        }
    }
    assert!(svg_seen, "no <svg> create op in the '<svg>' demo");
    let chart_rect =
        chart_rect.expect("no chart <rect> with x/width/fill in its folded shape object");

    // Let the render settle (drain whatever the mount still flushes)…
    let settle_deadline = Instant::now() + Duration::from_secs(2);
    while Instant::now() < settle_deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(100)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
            }
        }
    }
    // Children arrive via Append/Insert: every created shape got a parent.
    // Checked after the settle drain so a multi-commit mount (attaches in a
    // later batch than the creates) can't false-fail.
    for id in &shape_ids {
        assert!(
            parent_of.contains_key(id),
            "shape node {id} was created but never attached via Append/Insert"
        );
    }
    eprintln!(
        "OK   chart mounted: <svg viewBox> present, {} shape nodes attached, rect id={chart_rect}",
        shape_ids.len()
    );
    // …then a quiet window: an idle tree must emit NO empty update op
    // (`{props: {}}`, nothing unset) — a state-neutral re-render is op silence.
    let empty_props = format!("{:?}", Props::default());
    let quiet_deadline = Instant::now() + Duration::from_secs(1);
    let mut updates = 0usize;
    while Instant::now() < quiet_deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(100)) {
            for op in &batch {
                if let Op::Update {
                    id,
                    props,
                    unset,
                    style_unset,
                } = op
                {
                    updates += 1;
                    assert!(
                        !(unset.is_empty()
                            && style_unset.is_empty()
                            && format!("{props:?}") == empty_props),
                        "empty update op for node {id} during the quiet window \
                         (a no-change re-render must emit no op at all)"
                    );
                }
            }
        }
    }
    eprintln!("OK   quiet window: {updates} update ops, none empty");
    eprintln!("PASS <svg> JSX render end-to-end");
}

/// End-to-end check of per-shape events, JS side: a shape's `NodeId` receiving
/// a `click` UiEvent must run the app's React handler (counter text updates),
/// and a `pointerEnter` must run the hover handler (the shape's folded object
/// re-crosses with a swapped fill). Keys on stable signals — the demo's unique
/// clickable `<circle>` (handler flags on its create op) and the `clicks: N`
/// text — never on op order.
#[test]
fn svg_shape_click_round_trip() {
    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping svg_shape_click_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    // Send-instant stamps (devtools pre-apply timing); unread here, held open.
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, _flush_devtools_rx) = crossbeam_channel::unbounded();
    // Held for the duration so emits/requests from the app go nowhere harmlessly.
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    // Held for the duration so animation commands go nowhere harmlessly.
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    common::answer_window_size(request_rx, outbound_tx.clone());
    // Held for the duration: dropping the reload sender would look like shutdown.
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let vendor = bundle.with_file_name("vendor.js");
    spawn_js_thread(
        vendor,
        bundle,
        ops_tx,
        flush_stamps_tx,
        flush_devtools_tx,
        emit_tx,
        request_tx,
        anim_tx,
        outbound_rx,
        reload_rx,
    );

    let mut buttons: HashSet<u32> = HashSet::new();
    let mut parent_of: HashMap<u32, u32> = HashMap::new();
    let mut text_of: HashMap<u32, String> = HashMap::new();

    let send = |event: UiEvent| {
        outbound_tx
            .send(Outbound::UiEvent { event })
            .expect("JS thread gone mid-test");
    };

    // Navigate to the `<svg>` demo ("Elements" is expanded by default).
    let nav = drain_until_button(
        &ops_rx,
        "<svg>",
        Duration::from_secs(15),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no '<svg>' nav button in initial render");
    send(UiEvent {
        id: nav,
        kind: "click".into(),
        ..Default::default()
    });

    // The interactive card mounts the demo's ONE clickable shape: a `<circle>`
    // whose create op carries the click + hover handler flags (the chart's
    // shapes carry none). Its initial fill is recorded to assert the hover
    // swap later. The `clicks: 0` counter text rides inline on its create op
    // (single-string `<text>`, the `shouldSetTextContent` fast path).
    let mut circle: Option<(u32, String)> = None;
    let mut saw_counter = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(circle.is_some() && saw_counter) {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                if let Op::Create {
                    id,
                    kind,
                    props,
                    text,
                } = op
                {
                    if kind == "circle" && props.on_click {
                        assert!(
                            props.on_pointer_enter && props.on_pointer_leave,
                            "clickable circle created without its hover handler flags"
                        );
                        let shape = props
                            .shape
                            .as_ref()
                            .expect("clickable circle created without a folded shape object");
                        let fill = shape.fill.as_ref().expect("clickable circle has no fill");
                        circle = Some((*id, format!("{fill:?}")));
                    }
                    if text.as_deref().map(str::trim) == Some("clicks: 0") {
                        saw_counter = true;
                    }
                }
            }
        }
    }
    let (circle_id, initial_fill) = circle.expect("no clickable <circle> create op");
    assert!(saw_counter, "initial 'clicks: 0' text not rendered");
    eprintln!("OK   interactive card: clickable circle id={circle_id}, 'clicks: 0' present");

    // Play Bevy's part: report a click on the shape's NodeId (the collectors
    // emit `click` with no coords, like any node click). The app handler must
    // increment its counter, arriving as an UpdateText to `clicks: 1`.
    send(UiEvent {
        id: circle_id,
        kind: "click".into(),
        ..Default::default()
    });
    let deadline = Instant::now() + Duration::from_secs(10);
    let mut clicked = false;
    while !clicked && Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                if let Op::UpdateText { text, .. } = op
                    && text.trim() == "clicks: 1"
                {
                    clicked = true;
                }
            }
        }
    }
    assert!(clicked, "no 'clicks: 1' update after shape click");
    eprintln!("OK   shape click round trip: counter updated to 'clicks: 1'");

    // Hover: a `pointerEnter` (coords in user space, as the shape synthesis
    // reports them) must run the enter handler — the fill swaps, and the
    // whole folded shape object re-crosses on an update op.
    send(UiEvent {
        id: circle_id,
        kind: "pointerEnter".into(),
        x: Some(100.0),
        y: Some(60.0),
        ..Default::default()
    });
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                if let Op::Update { id, props, .. } = op
                    && *id == circle_id
                    && let Some(shape) = props.shape.as_ref()
                {
                    let fill = shape.fill.as_ref().expect("hovered circle lost its fill");
                    assert_ne!(
                        format!("{fill:?}"),
                        initial_fill,
                        "hover update re-crossed the shape without swapping the fill"
                    );
                    eprintln!("OK   hover round trip: circle fill swapped on pointerEnter");
                    eprintln!("PASS <svg> shape events end-to-end");
                    return;
                }
            }
        }
    }
    panic!("no shape update after pointerEnter — hover handler never fired");
}

/// The "Named nodes" demo renders its cards as `<node name="pin">`: the `name`
/// prop must cross the bridge under its own wire field (not the old
/// `target` alias) on the create ops, one per card.
#[test]
fn named_nodes_round_trip() {
    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping named_nodes_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, _flush_devtools_rx) = crossbeam_channel::unbounded();
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded::<AnimationCommand>();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    common::answer_window_size(request_rx, outbound_tx.clone());
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let vendor = bundle.with_file_name("vendor.js");
    spawn_js_thread(
        vendor,
        bundle,
        ops_tx,
        flush_stamps_tx,
        flush_devtools_tx,
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
    let named = drain_until_button(
        &ops_rx,
        "Named nodes",
        Duration::from_secs(10),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no 'Named nodes' nav button after expanding 'Communication'");
    click(named);

    // The page mounts six cards, each a create op carrying `name: "pin"`.
    let mut pins = 0usize;
    let deadline = Instant::now() + Duration::from_secs(10);
    while pins < 6 && Instant::now() < deadline {
        match ops_rx.recv_timeout(Duration::from_millis(100)) {
            Ok(batch) => {
                for op in &batch {
                    if let Op::Create { props, .. } = op
                        && props.name.as_deref() == Some("pin")
                    {
                        pins += 1;
                    }
                    if let Op::Create { props, .. } = op {
                        assert_ne!(
                            props.target.as_deref(),
                            Some("pin"),
                            "`name` must not alias to the `target` wire field"
                        );
                    }
                }
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => panic!("JS thread died during render"),
        }
    }
    assert_eq!(pins, 6, "six `<node name=\"pin\">` create ops expected");
}
