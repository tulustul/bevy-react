//! Headless end-to-end check of the devtools panel — no GPU/window needed.
//! Plays Bevy's role against the real JS runtime: pushes `devtools.toggle`
//! events and asserts the panel mounts into a detached `<root>` (in a
//! devtools-attributed flush), that clicking the panel's own close button
//! emits `devtools.open { open: false }` back, and that the `<root>` unmounts.
//!
//! Requires the example bundle to be built first:
//!   npm install && npm run build -w demos
//! If the bundle is missing the test skips (passes) with a notice.

use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::time::{Duration, Instant};

use crossbeam_channel::RecvTimeoutError;

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{op::Op, outbound::Outbound, outbound::UiEvent};
use bevy_react::{RawRequest, ReactMessage};

mod common;

fn example_bundle() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/demos/ui/dist/app.js")
}

/// Fold one op into the lookup maps (see `roundtrip.rs` for the pattern).
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
            if let Some(text) = text {
                text_of.insert(*id, text.clone());
            }
        }
        Op::CreateTextSpan { id, text } | Op::CreateText { id, text } => {
            text_of.insert(*id, text.clone());
        }
        Op::Append { parent, child } | Op::Insert { parent, child, .. } => {
            parent_of.insert(*child, *parent);
        }
        _ => {}
    }
}

/// Walk up from a text run with `label` to its enclosing `<button>`.
///
/// `under` scopes the search to one subtree: the climb must reach that
/// ancestor id (the devtools `<root>`) for the button to count. Without it a
/// label the demos gallery also uses — "Layers" is both a devtools tab and a
/// left-nav demo — resolves to whichever match `text_of`'s (randomly ordered)
/// iteration hands back first, which made this test ~50% flaky.
fn find_button_under(
    label: &str,
    under: Option<u32>,
    buttons: &HashSet<u32>,
    parent_of: &HashMap<u32, u32>,
    text_of: &HashMap<u32, String>,
) -> Option<u32> {
    // Sorted so a tie between two in-scope matches is at least deterministic.
    let mut spans: Vec<u32> = text_of
        .iter()
        .filter(|(_, text)| text.trim() == label)
        .map(|(span, _)| *span)
        .collect();
    spans.sort_unstable();

    for span in spans {
        let mut current = span;
        let mut button = None;
        let mut in_scope = under.is_none();
        for _ in 0..32 {
            let Some(&parent) = parent_of.get(&current) else {
                break;
            };
            if button.is_none() && buttons.contains(&parent) {
                button = Some(parent);
            }
            if Some(parent) == under {
                in_scope = true;
                break;
            }
            if button.is_some() && in_scope {
                break;
            }
            current = parent;
        }
        if in_scope && let Some(button) = button {
            return Some(button);
        }
    }
    None
}

/// Unscoped lookup — for labels outside the devtools panel (the app's nav).
fn find_button(
    label: &str,
    buttons: &HashSet<u32>,
    parent_of: &HashMap<u32, u32>,
    text_of: &HashMap<u32, String>,
) -> Option<u32> {
    find_button_under(label, None, buttons, parent_of, text_of)
}

#[test]
fn devtools_panel_round_trip() {
    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping devtools_panel_round_trip: bundle not built at {}\n  run: npm install && npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    // Send-instant stamps (devtools pre-apply timing); unread here, held open.
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    // Per-batch origin flags: read below to assert the panel's own flushes are
    // devtools-attributed on the wire (what keeps batch stats from observing
    // the panel's own commits).
    let (flush_devtools_tx, flush_devtools_rx) = crossbeam_channel::unbounded();
    let (emit_tx, emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
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

    // Phase 0: wait for the app's initial render (any left-nav button proves the
    // isolate is up, the app mounted, and — since the devtools host mounts BEFORE
    // the app container — the `devtools.toggle` listener is subscribed).
    let deadline = Instant::now() + Duration::from_secs(15);
    while find_button("Communication", &buttons, &parent_of, &text_of).is_none() {
        assert!(Instant::now() < deadline, "no initial app render");
        match ops_rx.recv_timeout(Duration::from_millis(100)) {
            Ok(batch) => {
                for op in &batch {
                    accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
                }
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => panic!("JS thread died during app mount"),
        }
    }
    eprintln!("OK   app mounted");

    // Phase 1: open the panel (Bevy's toggle key, played by hand).
    outbound_tx
        .send(Outbound::Event {
            name: "devtools.toggle".into(),
            value: serde_json::json!({ "open": true }),
        })
        .expect("JS thread gone before toggle");

    // The panel must mount into a detached `<root>` and render its chrome.
    let mut root_id: Option<u32> = None;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if root_id.is_some()
            && find_button_under("x", root_id, &buttons, &parent_of, &text_of).is_some()
        {
            break;
        }
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(200)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
                if let Op::Create { id, kind, .. } = op
                    && kind == "root"
                {
                    root_id = Some(*id);
                }
            }
        }
    }
    let root_id = root_id.expect("no `<root>` create op after devtools.toggle");
    assert!(
        text_of.values().any(|t| t.trim() == "devtools"),
        "panel chrome (title) did not render"
    );
    let close = find_button_under("x", Some(root_id), &buttons, &parent_of, &text_of)
        .expect("no close (x) button in the devtools panel");
    eprintln!("OK   panel mounted: <root> id={root_id}, close button id={close}");

    // The origin flags must attribute the flushes: the app mount crossed as
    // app batches (first flag false), the panel mount as devtools batches.
    let flags: Vec<bool> = flush_devtools_rx.try_iter().collect();
    assert_eq!(
        flags.first(),
        Some(&false),
        "the app mount must cross as an app-attributed flush"
    );
    assert!(
        flags.iter().any(|&devtools| devtools),
        "the panel mount must cross as a devtools-attributed flush"
    );
    eprintln!("OK   flush origin flags: {flags:?}");

    // Phase 1b: the Layers tab. Clicking it mounts the Layers panel, whose
    // mount effect announces `devtools.layersOpen { on: true }` (the gate for
    // the Rust-side layer stream). A hand-built `devtools.layers` payload
    // must then render — the reason pill's text proves the panel consumed it.
    let layers_tab = find_button_under("Layers", Some(root_id), &buttons, &parent_of, &text_of)
        .expect("no Layers tab button in the devtools panel");
    outbound_tx
        .send(Outbound::UiEvent {
            event: UiEvent {
                id: layers_tab,
                kind: "click".into(),
                ..Default::default()
            },
        })
        .expect("JS thread gone before Layers tab click");

    let mut saw_layers_open = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !saw_layers_open {
        // Keep the ops channel drained — the tab switch re-renders the panel.
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(50)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
            }
        }
        while let Ok(msg) = emit_rx.try_recv() {
            if msg.name == "devtools.layersOpen" {
                assert_eq!(
                    msg.value,
                    serde_json::json!({ "on": true }),
                    "opening the tab must announce on: true"
                );
                saw_layers_open = true;
            }
        }
    }
    assert!(
        saw_layers_open,
        "no devtools.layersOpen emit after opening the Layers tab"
    );
    eprintln!("OK   Layers tab: layersOpen {{ on: true }} emitted");

    outbound_tx
        .send(Outbound::Event {
            name: "devtools.layers".into(),
            value: serde_json::json!({
                "layers": [
                    { "id": 0, "reasons": ["base"], "depth": 0, "node_count": 0,
                      "rect": { "x": 0.0, "y": 0.0, "width": 800.0, "height": 600.0,
                                "physical_width": 800, "physical_height": 600 },
                      "repaints": 0, "filters": [] },
                    { "id": 7, "reasons": ["opacity", "filter"], "depth": 1, "node_count": 5,
                      "rect": { "x": 10.0, "y": 10.0, "width": 100.0, "height": 50.0,
                                "physical_width": 100, "physical_height": 50 },
                      "repaints": 0,
                      "filters": [
                          { "name": "blur", "params": [["radius", [4.25]]] },
                          { "name": "sepia", "params": [["amount", [1.0]]] },
                      ] },
                ]
            }),
        })
        .expect("JS thread gone before layers payload");

    let deadline = Instant::now() + Duration::from_secs(10);
    // The reason pill proves the row rendered; the chain line proves the
    // resolved-filter display consumed the per-wire entries + param values.
    while !(text_of.values().any(|t| t.trim() == "opacity")
        && text_of
            .values()
            .any(|t| t.trim() == "blur(radius 4.25) sepia(amount 1)"))
    {
        assert!(
            Instant::now() < deadline,
            "the Layers panel never rendered the payload's reason pill + filter chain"
        );
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(100)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
            }
        }
    }
    eprintln!("OK   Layers tab rendered the payload (reason pill + filter chain)");

    // Phase 1c: the Console tab. Clicking it unmounts the Layers panel
    // (whose cleanup reports `layersOpen { on: false }`) and mounts the
    // Console panel (which announces `consoleOpen { on: true }`). A
    // hand-built `devtools.console` payload must render both a js and a rust
    // row, and the clear button must emit `devtools.consoleClear`.
    let console_tab = find_button_under("Console", Some(root_id), &buttons, &parent_of, &text_of)
        .expect("no Console tab button in the devtools panel");
    outbound_tx
        .send(Outbound::UiEvent {
            event: UiEvent {
                id: console_tab,
                kind: "click".into(),
                ..Default::default()
            },
        })
        .expect("JS thread gone before Console tab click");

    let mut saw_console_open = false;
    let mut saw_layers_unmount = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(saw_console_open && saw_layers_unmount) {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(50)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
            }
        }
        while let Ok(msg) = emit_rx.try_recv() {
            if msg.name == "devtools.consoleOpen" {
                assert_eq!(
                    msg.value,
                    serde_json::json!({ "on": true }),
                    "opening the tab must announce on: true"
                );
                saw_console_open = true;
            }
            if msg.name == "devtools.layersOpen" && msg.value == serde_json::json!({ "on": false })
            {
                saw_layers_unmount = true;
            }
        }
    }
    assert!(
        saw_console_open,
        "no devtools.consoleOpen emit after opening the Console tab"
    );
    assert!(
        saw_layers_unmount,
        "the Layers panel's unmount (tab switch) never reported layersOpen: false"
    );
    eprintln!("OK   Console tab: consoleOpen {{ on: true }} emitted (Layers unmounted)");

    outbound_tx
        .send(Outbound::Event {
            name: "devtools.console".into(),
            value: serde_json::json!({
                "entries": [
                    { "seq": 1, "time_ms": 1753178400123u64, "source": "js",
                      "level": "error", "message": "boom from app" },
                    { "seq": 2, "time_ms": 1753178400124u64, "source": "rust",
                      "level": "warn", "message": "[color] unrecognized color \"redd\"" },
                ]
            }),
        })
        .expect("JS thread gone before console payload");

    let deadline = Instant::now() + Duration::from_secs(10);
    while !(text_of.values().any(|t| t.contains("boom from app"))
        && text_of.values().any(|t| t.contains("unrecognized color")))
    {
        assert!(
            Instant::now() < deadline,
            "the Console panel never rendered the payload's rows"
        );
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(100)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
            }
        }
    }
    eprintln!("OK   Console tab rendered the payload");

    // The clear button (unambiguous: the Bridge tab's LogPanel — the only
    // other "clear" — never mounted in this run).
    let clear = find_button_under("clear", Some(root_id), &buttons, &parent_of, &text_of)
        .expect("no clear button in the Console tab");
    outbound_tx
        .send(Outbound::UiEvent {
            event: UiEvent {
                id: clear,
                kind: "click".into(),
                ..Default::default()
            },
        })
        .expect("JS thread gone before clear click");
    let mut saw_clear = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !saw_clear {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(50)) {
            for op in &batch {
                accumulate(op, &mut buttons, &mut parent_of, &mut text_of);
            }
        }
        while let Ok(msg) = emit_rx.try_recv() {
            if msg.name == "devtools.consoleClear" {
                saw_clear = true;
            }
        }
    }
    assert!(
        saw_clear,
        "no devtools.consoleClear emit after clicking clear"
    );
    eprintln!("OK   Console tab: clear emitted devtools.consoleClear");

    // Phase 2: click the panel's own close button.
    outbound_tx
        .send(Outbound::UiEvent {
            event: UiEvent {
                id: close,
                kind: "click".into(),
                ..Default::default()
            },
        })
        .expect("JS thread gone before close click");

    // The self-initiated close must sync Bevy's state over the emit channel AND
    // unmount the `<root>` (the closed panel renders null). Watch both channels.
    // The panel is on the Console tab, so the close also unmounts the Console
    // panel — its cleanup must report `consoleOpen { on: false }` (what stops
    // the Rust-side console stream).
    let mut saw_emit = false;
    let mut saw_remove = false;
    let mut saw_console_close = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(saw_emit && saw_remove && saw_console_close) {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(100)) {
            for op in &batch {
                if let Op::Remove { child, .. } = op
                    && *child == root_id
                {
                    saw_remove = true;
                }
            }
        }
        while let Ok(msg) = emit_rx.try_recv() {
            if msg.name == "devtools.open" {
                assert_eq!(
                    msg.value,
                    serde_json::json!({ "open": false }),
                    "close must report open: false"
                );
                saw_emit = true;
            }
            if msg.name == "devtools.consoleOpen" && msg.value == serde_json::json!({ "on": false })
            {
                saw_console_close = true;
            }
        }
    }
    assert!(
        saw_remove,
        "panel `<root>` never removed after close (emit seen: {saw_emit})"
    );
    assert!(
        saw_emit,
        "no devtools.open emit after clicking close (remove seen: {saw_remove})"
    );
    assert!(
        saw_console_close,
        "the Console panel's unmount cleanup never reported consoleOpen: false"
    );
    eprintln!("OK   close: devtools.open {{ open: false }} emitted, <root> removed");
    eprintln!("PASS devtools end-to-end");
}
