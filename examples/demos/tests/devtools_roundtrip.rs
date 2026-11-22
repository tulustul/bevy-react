//! Headless end-to-end check of the devtools panel — no GPU/window needed.
//! Plays Bevy's role against the real JS runtime: pushes `devtools.toggle`
//! events and asserts the panel mounts into a detached `<root>` (in a
//! devtools-attributed flush), that clicking the panel's own close button
//! emits `devtools.open { open: false }` back, and that the `<root>` unmounts.
//!
//! Requires the example bundle to be built first:
//!   npm install && npm run build -w demos
//! If the bundle is missing the test skips (passes) with a notice.

use std::time::{Duration, Instant};

use bevy_react::animations::Binding;
use bevy_react::protocol::animatable::Animatable;
use bevy_react::protocol::op::Op;
use bevy_react::style::props::TRANSFORM;

use bevy_react::JsEngine;

mod common;
use common::Harness;

#[test]
fn devtools_panel_round_trip() {
    common::each_engine(devtools_panel_round_trip_on);
}

fn devtools_panel_round_trip_on(engine: JsEngine) {
    let Some(mut h) = Harness::start("devtools_panel_round_trip", engine) else {
        return;
    };

    // Phase 0: wait for the app's initial render (any left-nav button proves the
    // isolate is up, the app mounted, and — since the devtools host mounts BEFORE
    // the app container — the `devtools.toggle` listener is subscribed).
    h.wait_button("Communication", Duration::from_secs(15))
        .expect("no initial app render");
    eprintln!("OK   app mounted");

    // Phase 1: open the panel (Bevy's toggle key, played by hand).
    h.event("devtools.toggle", serde_json::json!({ "open": true }));

    // The panel must mount into a detached `<root>` and render its chrome.
    // Its buttons are looked up under that root: "Layers" is both a devtools
    // tab and a left-nav demo.
    let mut root_id: Option<u32> = None;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if root_id.is_some() && h.tree.find_button_under("Close", root_id).is_some() {
            break;
        }
        let Some(batch) = h.recv(Duration::from_millis(200)) else {
            continue;
        };
        for op in &batch {
            if let Op::Create { id, kind, .. } = op
                && kind == "root"
            {
                root_id = Some(*id);
            }
        }
    }
    let root_id = root_id.expect("no `<root>` create op after devtools.toggle");
    assert!(
        h.tree.text_of.values().any(|t| t.trim() == "devtools"),
        "panel chrome (title) did not render"
    );
    let close = h
        .tree
        .find_button_under("Close", Some(root_id))
        .expect("no Close button in the devtools panel");
    eprintln!("OK   panel mounted: <root> id={root_id}, close button id={close}");

    // The origin flags must attribute the flushes: the app mount crossed as
    // app batches (first flag false), the panel mount as devtools batches.
    let flags: Vec<bool> = h.flushes.try_iter().map(|f| f.devtools).collect();
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
    let layers_tab = h
        .tree
        .find_button_under("Layers", Some(root_id))
        .expect("no Layers tab button in the devtools panel");
    h.click(layers_tab);

    let mut saw_layers_open = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !saw_layers_open {
        // Keep the ops channel drained — the tab switch re-renders the panel.
        h.recv(Duration::from_millis(50));
        while let Ok(msg) = h.emits.try_recv() {
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

    h.event(
        "devtools.layers",
        serde_json::json!({
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
    );

    let deadline = Instant::now() + Duration::from_secs(10);
    // The reason pill proves the row rendered; the chain line proves the
    // resolved-filter display consumed the per-wire entries + param values.
    while !(h.tree.text_of.values().any(|t| t.trim() == "opacity")
        && h.tree
            .text_of
            .values()
            .any(|t| t.trim() == "blur(radius 4.25) sepia(amount 1)"))
    {
        assert!(
            Instant::now() < deadline,
            "the Layers panel never rendered the payload's reason pill + filter chain"
        );
        h.recv(Duration::from_millis(100));
    }
    eprintln!("OK   Layers tab rendered the payload (reason pill + filter chain)");

    // Phase 1c: the Animations tab. Clicking it unmounts the Layers panel
    // (whose cleanup reports `layersOpen { on: false }`) and mounts the
    // Animations panel (which announces `animationsOpen { on: true }`). In a
    // hand-built payload the running value renders with its driver line and
    // a meter bound to the shared value itself; the idle one waits behind
    // the "idle" chip until it is clicked.
    let animations_tab = h
        .tree
        .find_button_under("Animations", Some(root_id))
        .expect("no Animations tab button in the devtools panel");
    h.click(animations_tab);

    let mut saw_animations_open = false;
    let mut saw_layers_unmount = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(saw_animations_open && saw_layers_unmount) {
        h.recv(Duration::from_millis(50));
        while let Ok(msg) = h.emits.try_recv() {
            if msg.name == "devtools.animationsOpen" {
                assert_eq!(
                    msg.value,
                    serde_json::json!({ "on": true }),
                    "opening the tab must announce on: true"
                );
                saw_animations_open = true;
            }
            if msg.name == "devtools.layersOpen" && msg.value == serde_json::json!({ "on": false })
            {
                saw_layers_unmount = true;
            }
        }
    }
    assert!(
        saw_animations_open,
        "no devtools.animationsOpen emit after opening the Animations tab"
    );
    assert!(
        saw_layers_unmount,
        "the Layers panel's unmount (tab switch) never reported layersOpen: false"
    );
    eprintln!("OK   Animations tab: animationsOpen {{ on: true }} emitted (Layers unmounted)");

    h.event("devtools.animations", animations_payload(false));
    let meter = h.wait_op(Duration::from_secs(10), |op| match op {
        Op::Create { props, .. } => match props.style.as_ref()?.get(&TRANSFORM)?.translate_x {
            // The app's own values are allocated from 1, never this high.
            Some(Animatable::Animated(ref slot)) if slot.binding.id() == 9001 => {
                Some(slot.binding.clone())
            }
            _ => None,
        },
        _ => None,
    });
    assert_eq!(
        meter,
        Some(Binding::Interpolate {
            id: 9001,
            input: vec![0.0, 1.0],
            output: vec![-72.0, 0.0],
        }),
        "the running value's meter must bind the shared value over its range"
    );
    let rendered =
        |h: &common::Harness, text: &str| h.tree.text_of.values().any(|t| t.trim() == text);
    assert!(
        rendered(&h, "timing 0 -> 1, 300ms linear, 50%"),
        "the running row's driver line did not render"
    );
    assert!(
        !rendered(&h, "sv 9002"),
        "an idle value must wait behind the chip"
    );
    let idle_chip = h
        .tree
        .find_button_under("idle", Some(root_id))
        .expect("no idle chip in the Animations tab");
    h.click(idle_chip);
    let deadline = Instant::now() + Duration::from_secs(10);
    while !rendered(&h, "sv 9002") {
        assert!(
            Instant::now() < deadline,
            "the idle chip never revealed the idle value"
        );
        h.recv(Duration::from_millis(100));
    }
    eprintln!("OK   Animations tab rendered the payload (bound meter, idle behind its chip)");

    // The transition line reads its spec and progress while playing; the
    // pause chip asks Rust to pause the app clock; once the stream reports
    // it paused, every running row gets a scrubber, and pressing one asks
    // Rust to move that run.
    assert!(
        rendered(&h, "opacity: 300ms easeOut, 33%"),
        "the transition line did not render"
    );
    let pause = h
        .tree
        .find_button_under("pause", Some(root_id))
        .expect("no pause chip in the Animations tab");
    h.click(pause);
    let clock = wait_emit(&mut h, "devtools.animationsClock");
    assert_eq!(clock, serde_json::json!({ "paused": true, "speed": 1 }));
    h.event("devtools.animations", animations_payload(true));
    let deadline = Instant::now() + Duration::from_secs(10);
    while !rendered(&h, "100 / 300 ms") {
        assert!(
            Instant::now() < deadline,
            "a paused tab never showed the transition's scrubber"
        );
        h.recv(Duration::from_millis(100));
    }
    assert!(
        rendered(&h, "150 / 300 ms"),
        "the running value's scrubber did not render"
    );
    // The scrubber row holds the track and the time label.
    let label = *h
        .tree
        .text_of
        .iter()
        .find(|(_, t)| t.trim() == "100 / 300 ms")
        .expect("scrubber label")
        .0;
    let label_box = h.tree.parent_of[&label];
    let row = h.tree.parent_of[&label_box];
    let track = *h
        .tree
        .parent_of
        .iter()
        .find(|&(child, parent)| *parent == row && *child != label_box)
        .expect("scrubber track")
        .0;
    h.ui_event(bevy_react::protocol::outbound::UiEvent {
        id: track,
        kind: "pointerDown".into(),
        x: Some(0.5),
        y: Some(0.5),
        button: Some(0),
        ..Default::default()
    });
    let seek = wait_emit(&mut h, "devtools.seekRun");
    assert_eq!(seek["node"], 9100);
    assert_eq!(seek["label"], "opacity");
    assert!((seek["t"].as_f64().unwrap() - 0.15).abs() < 1e-9, "{seek}");
    eprintln!("OK   Animations tab: pause asks for the clock, a paused scrubber seeks");

    // Phase 1d: the Console tab. Clicking it unmounts the Animations panel
    // (whose cleanup reports `animationsOpen { on: false }`) and mounts the
    // Console panel (which announces `consoleOpen { on: true }`). A
    // hand-built `devtools.console` payload must render both a js and a rust
    // row, and the clear button must emit `devtools.consoleClear`.
    let console_tab = h
        .tree
        .find_button_under("Console", Some(root_id))
        .expect("no Console tab button in the devtools panel");
    h.click(console_tab);

    let mut saw_console_open = false;
    let mut saw_animations_unmount = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(saw_console_open && saw_animations_unmount) {
        h.recv(Duration::from_millis(50));
        while let Ok(msg) = h.emits.try_recv() {
            if msg.name == "devtools.consoleOpen" {
                assert_eq!(
                    msg.value,
                    serde_json::json!({ "on": true }),
                    "opening the tab must announce on: true"
                );
                saw_console_open = true;
            }
            if msg.name == "devtools.animationsOpen"
                && msg.value == serde_json::json!({ "on": false })
            {
                saw_animations_unmount = true;
            }
        }
    }
    assert!(
        saw_console_open,
        "no devtools.consoleOpen emit after opening the Console tab"
    );
    assert!(
        saw_animations_unmount,
        "the Animations panel's unmount (tab switch) never reported animationsOpen: false"
    );
    eprintln!("OK   Console tab: consoleOpen {{ on: true }} emitted (Animations unmounted)");

    h.event(
        "devtools.console",
        serde_json::json!({
            "entries": [
                { "seq": 1, "time_ms": 1753178400123u64, "source": "js",
                  "level": "error", "message": "boom from app" },
                { "seq": 2, "time_ms": 1753178400124u64, "source": "rust",
                  "level": "warn", "message": "[color] unrecognized color \"redd\"" },
            ]
        }),
    );

    let deadline = Instant::now() + Duration::from_secs(10);
    while !(h.tree.text_of.values().any(|t| t.contains("boom from app"))
        && h.tree
            .text_of
            .values()
            .any(|t| t.contains("unrecognized color")))
    {
        assert!(
            Instant::now() < deadline,
            "the Console panel never rendered the payload's rows"
        );
        h.recv(Duration::from_millis(100));
    }
    eprintln!("OK   Console tab rendered the payload");

    // The clear button (unambiguous: the Bridge tab's LogPanel — the only
    // other "clear" — never mounted in this run).
    let clear = h
        .tree
        .find_button_under("clear", Some(root_id))
        .expect("no clear button in the Console tab");
    h.click(clear);
    let mut saw_clear = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !saw_clear {
        h.recv(Duration::from_millis(50));
        saw_clear = h
            .emits
            .try_iter()
            .any(|msg| msg.name == "devtools.consoleClear");
    }
    assert!(
        saw_clear,
        "no devtools.consoleClear emit after clicking clear"
    );
    eprintln!("OK   Console tab: clear emitted devtools.consoleClear");

    // Phase 1e: a pick. Bevy reports `devtools.picked` for an app node the
    // tree shows collapsed; the panel switches to the Nodes tab, expands the
    // node's ancestors and asks Bevy to scroll its row — a node of the
    // panel's own — into view.
    let picked = h
        .tree
        .find_button("How it works?")
        .expect("no How it works? nav button");
    h.event("devtools.picked", serde_json::json!({ "id": picked }));
    let row = wait_emit(&mut h, "devtools.reveal")["id"]
        .as_u64()
        .expect("a node id") as u32;
    assert!(
        h.tree.is_under(row, root_id),
        "the row to reveal must be one of the panel's own nodes"
    );
    eprintln!("OK   pick: the picked node's row (#{row}) asked to be revealed");

    // Back to the Console tab, which the close below expects to unmount.
    let console_tab = h
        .tree
        .find_button_under("Console", Some(root_id))
        .expect("no Console tab button");
    h.click(console_tab);
    assert_eq!(
        wait_emit(&mut h, "devtools.consoleOpen"),
        serde_json::json!({ "on": true })
    );

    // Phase 2: click the panel's own close button.
    h.click(close);

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
        if let Some(batch) = h.recv(Duration::from_millis(100)) {
            saw_remove |= batch
                .iter()
                .any(|op| matches!(op, Op::Remove { child, .. } if *child == root_id));
        }
        while let Ok(msg) = h.emits.try_recv() {
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

/// A hand-built `devtools.animations` payload: a running and an idle value,
/// one node's opacity transition, and the clock.
fn animations_payload(paused: bool) -> serde_json::Value {
    serde_json::json!({
        "values": [
            { "id": 9001, "value": 0.5, "driver": ["timing 0 -> 1, 300ms linear, 50%"],
              "range": [0.0, 1.0], "time": [0.15, 0.0, 0.3], "nodes": [] },
            { "id": 9002, "value": 2.0, "driver": [], "range": null, "time": null, "nodes": [] },
        ],
        "total": 2,
        "transitions": [
            { "node": 9100, "lines": [
                { "label": "opacity", "spec": "300ms easeOut", "time": [0.1, 0.0, 0.3] },
            ] },
        ],
        "transitions_total": 1,
        "clock": { "paused": paused, "speed": 1.0 },
    })
}

/// The next emit named `name`, within 10 s.
fn wait_emit(h: &mut Harness, name: &str) -> serde_json::Value {
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        h.recv(Duration::from_millis(50));
        while let Ok(msg) = h.emits.try_recv() {
            if msg.name == name {
                return msg.value;
            }
        }
    }
    panic!("no {name} emit");
}
