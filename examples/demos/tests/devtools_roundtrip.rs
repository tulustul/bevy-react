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

use bevy_react::protocol::op::Op;

mod common;
use common::Harness;

#[test]
fn devtools_panel_round_trip() {
    let Some(mut h) = Harness::start("devtools_panel_round_trip") else {
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
        if root_id.is_some() && h.tree.find_button_under("x", root_id).is_some() {
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
        .find_button_under("x", Some(root_id))
        .expect("no close (x) button in the devtools panel");
    eprintln!("OK   panel mounted: <root> id={root_id}, close button id={close}");

    // The origin flags must attribute the flushes: the app mount crossed as
    // app batches (first flag false), the panel mount as devtools batches.
    let flags: Vec<bool> = h.flush_flags.try_iter().collect();
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

    // Phase 1c: the Console tab. Clicking it unmounts the Layers panel
    // (whose cleanup reports `layersOpen { on: false }`) and mounts the
    // Console panel (which announces `consoleOpen { on: true }`). A
    // hand-built `devtools.console` payload must render both a js and a rust
    // row, and the clear button must emit `devtools.consoleClear`.
    let console_tab = h
        .tree
        .find_button_under("Console", Some(root_id))
        .expect("no Console tab button in the devtools panel");
    h.click(console_tab);

    let mut saw_console_open = false;
    let mut saw_layers_unmount = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(saw_console_open && saw_layers_unmount) {
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
