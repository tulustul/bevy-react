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
use bevy_react::protocol::{Op, Outbound, UiEvent};
use bevy_react::{RawRequest, ReactMessage};

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

/// End-to-end check of the canvas resize→replay path: a `"resize"` UI event on
/// a `<canvas>` with a declarative `draw` painter must make the JS runtime
/// re-record the painter and send a `draw` op that clears + replays (the Rust
/// side just cleared the retained surface). Located by op kind, not tree
/// shape, so the demo's structure can change freely.
#[test]
fn canvas_resize_replay_round_trip() {
    use bevy_react::protocol::DrawCmd;

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
    // prop on the `target` wire field.
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
                        props.target.as_deref(),
                        Some("modal"),
                        "the <root>'s `name` prop must cross as wire `target`"
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

/// End-to-end check of the `<layer>` demo at the wire level: navigating to the
/// demo must mount `<layer>` nodes (the effects panel one carrying its
/// `effect` + declarative `style.uniforms`) with children appended to them,
/// and clicking the effect selector must emit an `Op::Update` whose delta
/// swaps the effect and carries the new effect's uniforms — the declarative
/// uniforms path the Rust reconciler repacks material params from.
#[test]
fn layer_demo_round_trip() {
    use bevy_react::layer::LayerUniformValue;

    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping layer_demo_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
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

    // Navigate to the `<layer>` demo ("Elements" is expanded by default).
    let nav = drain_until_button(
        &ops_rx,
        "<layer>",
        Duration::from_secs(15),
        &mut buttons,
        &mut parent_of,
        &mut text_of,
    )
    .expect("no '<layer>' nav button in initial render");
    click(nav);

    // The demo mounts two layers: the group-opacity comparison (no `effect`,
    // `style.opacity` 0.5) and the effects panel (initially `effect="dissolve"`
    // with declarative `uniforms`). Identify them by the `effect` prop.
    let mut compare_id: Option<u32> = None;
    let mut panel_id: Option<u32> = None;
    let deadline = Instant::now() + Duration::from_secs(10);
    while (compare_id.is_none() || panel_id.is_none()) && Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(200)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
                if let Op::Create {
                    id, kind, props, ..
                } = op
                    && kind == "layer"
                {
                    match props.effect.as_deref() {
                        Some("dissolve") => {
                            let style = props.style.as_ref().expect("panel layer has a style");
                            let uniforms = style
                                .uniforms
                                .as_ref()
                                .expect("declarative uniforms ride the create");
                            assert_eq!(
                                uniforms.get("threshold"),
                                Some(&LayerUniformValue::Scalar(0.35)),
                                "the demo's initial dissolve threshold crosses the wire"
                            );
                            panel_id = Some(*id);
                        }
                        None => {
                            let style = props.style.as_ref().expect("compare layer has a style");
                            assert_eq!(
                                style.opacity,
                                Some(0.5),
                                "the comparison layer mounts at 50% group opacity"
                            );
                            compare_id = Some(*id);
                        }
                        other => panic!("unexpected layer effect on create: {other:?}"),
                    }
                }
            }
        }
    }
    let compare_id = compare_id.expect("no comparison `<layer>` create op in the demo");
    let panel_id = panel_id.expect("no effects-panel `<layer>` create op in the demo");

    // Both layers got children appended (the overlap art / the fx card).
    assert!(
        parent_of.values().any(|&p| p == compare_id),
        "no child appended to the comparison layer"
    );
    assert!(
        parent_of.values().any(|&p| p == panel_id),
        "no child appended to the effects-panel layer"
    );
    eprintln!("OK   layers mounted: compare id={compare_id}, panel id={panel_id}");

    // Switch the effect: clicking the "chromatic" pill re-renders the panel
    // layer with `effect="chromaticAberration"` and that effect's uniforms.
    let chroma = find_button("chromatic", &buttons, &parent_of, &text_of)
        .expect("no 'chromatic' selector pill in the effects panel");
    click(chroma);

    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(200)) {
            for op in &batch {
                if let Op::Update { id, props, .. } = op
                    && *id == panel_id
                    && props.effect.as_deref() == Some("chromaticAberration")
                {
                    let uniforms = props
                        .style
                        .as_ref()
                        .and_then(|s| s.uniforms.as_ref())
                        .expect("the effect swap carries the new effect's uniforms");
                    assert!(
                        matches!(uniforms.get("strength"), Some(LayerUniformValue::Scalar(_))),
                        "chromaticAberration uniforms carry a scalar `strength`"
                    );
                    eprintln!("OK   effect swap update: chromaticAberration + uniforms");
                    eprintln!("PASS <layer> demo end-to-end");
                    return;
                }
            }
        }
    }
    panic!("no effect-swap update op after clicking the 'chromatic' pill");
}

/// The `<layer>` demo's SelectDemo navigation event, mirroring the example's
/// `debug.selectDemo` binding (`examples/demos/screenshot.rs`) so this test can
/// steer the gallery without a pointer.
#[bevy_react::react_event(name = "debug.selectDemo")]
struct SelectDemo {
    label: String,
}

/// End-to-end check of the `<layer>` world wiring against the REAL JS runtime
/// and the REAL op-apply path: a headless (windowless) `App` running
/// [`ReactUiPlugin`] on the demo bundle. After navigating to the `<layer>`
/// demo, each mounted layer must have its render-to-texture plumbing (display
/// material + companion root + offscreen camera targeting the material's
/// texture), with the demo's declarative uniforms packed into the material
/// params; clicking the effect selector (through the real picking-message →
/// `collect_ui_events` path) must swap the composed shader and repack the
/// params — "material params changed", asserted on the actual asset.
#[test]
fn layer_world_wiring_round_trip() {
    use bevy::camera::{NormalizedRenderTarget, RenderTarget as BevyRenderTarget};
    use bevy::ecs::system::RunSystemOnce as _;
    use bevy::picking::backend::HitData;
    use bevy::picking::events::{Click, Pointer};
    use bevy::picking::pointer::{Location, PointerButton, PointerId};
    use bevy::prelude::*;
    use bevy_react::layer::{LayerCamera, LayerMaterial, LayerRoot, RLayer};
    use bevy_react::{ReactAppExt as _, ReactEvents, ReactUiPlugin};

    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping layer_world_wiring_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let mut app = App::new();
    // Windowless: the plugin's window/input/picking-fed systems find their
    // parameters missing (no render, no winit, no picking plugins). Skip those
    // systems instead of panicking — the op-apply + layer systems this test
    // exercises have everything they need.
    app.set_error_handler(bevy::ecs::error::ignore);
    app.add_plugins((MinimalPlugins, AssetPlugin::default()));
    // The asset stores a windowless run needs registered up front: `Image`
    // BEFORE `ReactUiPlugin` (its presence is the plugin's headless-assets
    // gate), `Font` because the plugin's font setup allocates handles.
    app.init_asset::<Image>();
    app.init_asset::<Font>();
    app.init_asset::<TextureAtlasLayout>();
    // No picking plugins here — the click below is written as a raw
    // `Pointer<Click>` message, exactly what a picking backend would produce.
    app.add_message::<Pointer<Click>>();

    let plugin = ReactUiPlugin::new(&bundle).hot_reload(false);
    #[cfg(feature = "devtools")]
    let plugin = plugin.devtools(bevy_react::DevtoolsConfig {
        enabled: false,
        ..Default::default()
    });
    app.add_plugins(plugin);
    app.add_react_event::<SelectDemo>();

    // Pump real frames; the JS thread renders/reacts between them.
    let pump = |app: &mut App, dur: Duration| {
        let deadline = Instant::now() + dur;
        while Instant::now() < deadline {
            app.update();
            std::thread::sleep(Duration::from_millis(10));
        }
    };

    let layers = |app: &mut App| -> Vec<(Entity, RLayer)> {
        app.world_mut()
            .query::<(Entity, &RLayer)>()
            .iter(app.world())
            .map(|(e, l)| (e, l.clone()))
            .collect()
    };

    // Navigate to the `<layer>` demo. The demo app subscribes to
    // `debug.selectDemo` in an effect after its first render, so keep
    // re-sending until the layers appear (re-selecting is idempotent).
    let deadline = Instant::now() + Duration::from_secs(30);
    while layers(&mut app).len() < 2 {
        assert!(
            Instant::now() < deadline,
            "`<layer>` demo never mounted (its two layers did not appear)"
        );
        app.world_mut()
            .run_system_once(|events: ReactEvents| {
                events.send(&SelectDemo {
                    label: "<layer>".into(),
                });
            })
            .expect("send debug.selectDemo");
        pump(&mut app, Duration::from_millis(500));
    }

    // Identify the two demo layers by their resolved effect.
    let all = layers(&mut app);
    let (compare, _) = *all
        .iter()
        .find(|(_, l)| l.effect == "none")
        .expect("comparison layer (effect \"none\")");
    let (panel, panel_layer) = all
        .iter()
        .find(|(_, l)| l.effect == "dissolve")
        .map(|(e, l)| (*e, l.clone()))
        .expect("effects-panel layer (initially \"dissolve\")");
    assert_eq!(
        panel_layer.effect, "dissolve",
        "sanity: the panel started on dissolve"
    );

    // Give the bind/drive systems a couple frames past the mount, then assert
    // the full render-to-texture wiring per layer.
    pump(&mut app, Duration::from_millis(100));
    let wiring = |app: &mut App, display: Entity| -> LayerMaterial {
        let world = app.world();
        let rlayer = world.entity(display).get::<RLayer>().unwrap().clone();
        let companion = rlayer.companion;
        assert_eq!(
            world.entity(companion).get::<LayerRoot>().map(|r| r.0),
            Some(display),
            "companion root points back at the display node"
        );
        let cam = world
            .entity(companion)
            .get::<UiTargetCamera>()
            .expect("companion bound to an offscreen camera")
            .0;
        assert_eq!(
            world.entity(cam).get::<LayerCamera>().map(|c| c.0),
            Some(display),
            "camera points back at the display node"
        );
        let material_handle = world
            .entity(display)
            .get::<MaterialNode<LayerMaterial>>()
            .expect("display node renders through MaterialNode<LayerMaterial>")
            .0
            .clone();
        let material = world
            .resource::<Assets<LayerMaterial>>()
            .get(&material_handle)
            .expect("layer material asset exists")
            .clone();
        match world.entity(cam).get::<BevyRenderTarget>().unwrap() {
            BevyRenderTarget::Image(target) => assert_eq!(
                target.handle, material.layer,
                "camera renders into the material's layer texture"
            ),
            other => panic!("layer camera should target an image, got {other:?}"),
        }
        assert_ne!(
            material.shader,
            Handle::default(),
            "the material carries a composed registry shader"
        );
        material
    };
    let _ = wiring(&mut app, compare);
    let dissolve_material = wiring(&mut app, panel);
    // The demo's declarative uniforms (threshold 0.35, softness 0.12) packed
    // into the dissolve schema's first two lanes.
    assert_eq!(
        dissolve_material.packed.params[0].x, 0.35,
        "initial dissolve threshold packed from `style.uniforms`"
    );
    assert_eq!(
        dissolve_material.packed.params[0].y, 0.12,
        "initial dissolve softness packed from `style.uniforms`"
    );
    eprintln!("OK   wiring: companion+camera+material bound, dissolve uniforms packed");

    // Click the "chromatic" selector pill through the real event path: find its
    // label's text entity, then feed a `Pointer<Click>` message — exactly what
    // a picking backend would emit — and let `collect_ui_events` climb to the
    // owning button and report the click to JS.
    let label_entity = app
        .world_mut()
        .query::<(Entity, &Text)>()
        .iter(app.world())
        .find(|(_, t)| t.0.trim() == "chromatic")
        .map(|(e, _)| e)
        .expect("no 'chromatic' pill label in the world");
    app.world_mut().write_message(Pointer::new(
        PointerId::Mouse,
        Location {
            target: NormalizedRenderTarget::Image(bevy::camera::ImageRenderTarget {
                handle: Handle::default(),
                scale_factor: 1.0,
            }),
            position: Vec2::ZERO,
        },
        Click {
            button: PointerButton::Primary,
            hit: HitData::new(Entity::PLACEHOLDER, 0.0, None, None),
            duration: Duration::from_millis(50),
            count: 1,
        },
        label_entity,
    ));

    // The JS re-render must swap the panel layer's effect and repack the
    // material params — "material params changed", observed on the asset.
    let deadline = Instant::now() + Duration::from_secs(10);
    loop {
        assert!(
            Instant::now() < deadline,
            "panel layer never swapped to chromaticAberration after the click"
        );
        pump(&mut app, Duration::from_millis(100));
        let world = app.world();
        let Some(rlayer) = world.entity(panel).get::<RLayer>() else {
            panic!("panel layer display entity vanished");
        };
        if rlayer.effect != "chromaticAberration" {
            continue;
        }
        let handle = world
            .entity(panel)
            .get::<MaterialNode<LayerMaterial>>()
            .unwrap()
            .0
            .clone();
        let material = world
            .resource::<Assets<LayerMaterial>>()
            .get(&handle)
            .unwrap();
        assert_ne!(
            material.shader, dissolve_material.shader,
            "the composed shader swapped with the effect"
        );
        // strength (lane 0) from the demo's slider state; direction (lanes
        // 2..4) from the schema default.
        assert_eq!(
            material.packed.params[0].x, 0.012,
            "chromaticAberration strength repacked from `style.uniforms`"
        );
        assert_eq!(
            material.packed.params[0].z, 1.0,
            "direction.x keeps its schema default"
        );
        break;
    }
    eprintln!("OK   effect swap: shader + params changed on the material asset");
    eprintln!("PASS <layer> world wiring end-to-end");
}
