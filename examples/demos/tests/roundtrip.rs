//! Headless end-to-end check of the Rust<->JS bridge — no GPU/window needed.
//! Plays the role of Bevy: drives the JS thread directly and asserts the initial
//! render plus a click round trip.
//!
//! Requires the example bundle to be built first:
//!   npm install && npm run build -w demos
//! If the bundle is missing the test skips (passes) with a notice.

use std::time::{Duration, Instant};

use crossbeam_channel::RecvTimeoutError;

use bevy_react::animations::AnimationCommand;
use bevy_react::protocol::{op::Op, outbound::Outbound, outbound::UiEvent};

mod common;
use common::Harness;

#[test]
fn bridge_round_trip() {
    let Some(mut h) = Harness::start("bridge_round_trip") else {
        return;
    };

    // Phase 0: the gallery starts on another demo, so navigate the left-nav to the
    // counter demo — expand the "Communication" submenu, then select "React to Bevy"
    // (the `bevy.basicDemo.setCount` counter) — before asserting the round trip.
    h.click_label("Communication");
    h.click_label("React to Bevy");

    // Phase 1: the counter renders an increment button labelled `+` and the count
    // run `3` (from `Cubes: <text>{count}</text>`, so the count is its own span).
    // The increment button is the parent of the bare `+` text node.
    let mut plus_text: Option<u32> = None;
    let mut button_id: Option<u32> = None;
    let mut saw_initial = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(button_id.is_some() && saw_initial) {
        let Some(batch) = h.recv(Duration::from_millis(500)) else {
            continue;
        };
        for op in &batch {
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
            && let Some(parent) = plus_text.and_then(|t| h.tree.parent_of.get(&t))
            && h.tree.buttons.contains(parent)
        {
            button_id = Some(*parent);
        }
    }

    let button_id = button_id.expect("no '+' button in counter demo");
    assert!(saw_initial, "initial count '3' not rendered");
    eprintln!("OK   counter render: '+' button id={button_id}, count '3' present");

    // Phase 2: report a click on the button.
    h.click(button_id);

    // Phase 3: clicking `+` from the default 3 should update the count run to '4'.
    h.wait_op(Duration::from_secs(10), |op| {
        matches!(op, Op::UpdateText { text, .. } if text.trim() == "4").then_some(())
    })
    .expect("no count '4' update after click");
    eprintln!("OK   click round trip: count updated to '4'");
    eprintln!("PASS bridge end-to-end");
}

/// End-to-end check of animation completion callbacks: the Sequence demo's Play
/// button assigns a driver whose callback re-enables the button. Playing Bevy's
/// role, we capture the token-tagged `animate` command and inject the
/// `AnimationFinished` settlement, asserting the callback's re-render lands.
#[test]
fn animation_callback_round_trip() {
    let Some(mut h) = Harness::start("animation_callback_round_trip") else {
        return;
    };

    // Navigate the left-nav: expand "Animations", select "Animated values"
    // (the Sequence card lives there).
    h.click_label("Animations");
    h.click_label("Animated values");
    let play = h
        .wait_button("Play", Duration::from_secs(10))
        .expect("no 'Play' button in the Sequence demo");
    // Everything queued so far is another page's business — the home wall's
    // tile entrances carry completion callbacks of their own (tokened
    // `Animate`s from before the navigation), and the first tokened command
    // after the click must be Play's.
    while h.anims.try_recv().is_ok() {}
    h.click(play);

    // The click handler assigns the sequence driver with a completion callback —
    // the `animate` command must carry a correlation token. Skip the demo's
    // other commands (`declare` on mount, etc.).
    let deadline = Instant::now() + Duration::from_secs(10);
    let (value_id, token) = loop {
        assert!(Instant::now() < deadline, "no tokened animate after Play");
        match h.anims.recv_timeout(Duration::from_millis(500)) {
            Ok(AnimationCommand::Animate {
                id,
                token: Some(token),
                ..
            }) => break (id, token),
            Ok(_) | Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => panic!("JS thread died before animate"),
        }
    };
    eprintln!("OK   Play assigned driver: shared value {value_id}, token {token}");

    // Bevy's part, played by hand: report the driver settled. The callback runs
    // `setRunning(false)`, flipping the button label "Playing…" -> "Play".
    h.send(Outbound::AnimationFinished {
        id: value_id,
        token,
        finished: true,
    });
    h.wait_op(Duration::from_secs(10), |op| {
        matches!(op, Op::UpdateText { text, .. } if text.trim() == "Play").then_some(())
    })
    .expect("no 'Play' label update after AnimationFinished — callback never fired");
    eprintln!("OK   completion callback re-render: label back to 'Play'");
    eprintln!("PASS animation callback end-to-end");
}

/// End-to-end check of the canvas resize→replay path: a `resize` element
/// event on a `<canvas>` with a declarative `draw` painter must make the JS
/// runtime re-record the painter and send an update op whose act-now
/// `drawAppend` clears + replays (the Rust side just cleared the retained
/// surface). Located by op kind, not tree shape, so the demo's structure can
/// change freely.
#[test]
fn canvas_resize_replay_round_trip() {
    use bevy_react::canvas::{DRAW_APPEND, DrawCmd};

    let Some(mut h) = Harness::start("canvas_resize_replay_round_trip") else {
        return;
    };

    // Navigate to the `<canvas>` demo ("Elements" is expanded by default).
    h.click_label("<canvas>");

    // The demo mounts its declarative (`draw`-prop) canvas first; an
    // imperative (ref-handle) canvas may follow — keep the FIRST create only,
    // since the replay-on-resize contract under test is the declarative one.
    let canvas_id = h
        .wait_op(Duration::from_secs(10), |op| match op {
            Op::Create { id, kind, .. } if kind == "canvas" => Some(*id),
            _ => None,
        })
        .expect("no canvas create op in the '<canvas>' demo");
    eprintln!("OK   canvas mounted: id={canvas_id}");

    // Play Bevy's part: the canvas was laid out (its surface cleared) — report it.
    h.send(Outbound::ElementEvent {
        id: canvas_id,
        event: "resize".into(),
        payload: serde_json::json!({ "width": 460.0, "height": 260.0 }),
    });

    // The runtime must replay the declarative painter: an update op for this
    // node whose `drawAppend` starts with a full clear, followed by the
    // recorded drawing.
    let (leads_with_clear, len) = h
        .wait_op(Duration::from_secs(10), |op| match op {
            Op::Update { id, props, .. } if *id == canvas_id => props
                .attrs
                .get(&DRAW_APPEND)
                .map(|cmds| (matches!(cmds.first(), Some(DrawCmd::Clear)), cmds.len())),
            _ => None,
        })
        .expect("no drawAppend after resize — declarative painter never replayed");
    assert!(leads_with_clear, "resize replay must lead with a clear");
    assert!(len > 1, "resize replay recorded no drawing");
    eprintln!("OK   resize replay: drawAppend with {len} commands");
    eprintln!("PASS canvas resize end-to-end");
}

/// End-to-end check of the `<root>` host element from APP code (the modal demo):
/// opening the modal must mount a detached `<root>` whose `name` prop crossed as
/// the `target` wire field, and closing it must remove that root — exercising
/// the detached-root machinery outside the devtools panel.
#[test]
fn root_demo_modal_round_trip() {
    let Some(mut h) = Harness::start("root_demo_modal_round_trip") else {
        return;
    };

    // Navigate to the `<root>` demo ("Elements" is expanded by default).
    h.click_label("<root>");
    h.click_label("Open modal");

    // The modal must mount as a `<root>` create op carrying the demo's `name`
    // prop (its own wire field — it becomes the entity's Bevy `Name` and the
    // devtools root-selector label).
    let mut root_id: Option<u32> = None;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if root_id.is_some() && h.tree.find_button("Close").is_some() {
            break;
        }
        let Some(batch) = h.recv(Duration::from_millis(200)) else {
            continue;
        };
        for op in &batch {
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
    let root_id = root_id.expect("no `<root>` create op after opening the modal");
    let close = h
        .tree
        .find_button("Close")
        .expect("no 'Close' button in the modal");
    eprintln!("OK   modal mounted: <root name=\"modal\"> id={root_id}");

    // Closing must remove the detached root.
    h.click(close);
    h.wait_op(Duration::from_secs(10), |op| {
        matches!(op, Op::Remove { child, .. } if *child == root_id).then_some(())
    })
    .expect("modal `<root>` never removed after Close");
    eprintln!("OK   modal closed: <root> removed");
    eprintln!("PASS <root> demo end-to-end");
}

/// End-to-end check of the JSX `<svg>` pipeline: navigating to the `<svg>`
/// demo must mount an `svg` element whose `viewBox` decoded, shape children
/// whose attrs crossed as the folded `shape` object, every shape attached via
/// Append/Insert — and, once the render settles, a quiet window with **no
/// empty update ops** (the delta-diff invariant, end-to-end).
#[test]
fn svg_jsx_render_round_trip() {
    use bevy_react::protocol::props::Props;

    let Some(mut h) = Harness::start("svg_jsx_render_round_trip") else {
        return;
    };

    // Navigate to the `<svg>` demo ("Elements" is expanded by default).
    h.click_label("<svg>");

    // The demo's chart card mounts an `<svg viewBox>` element with shape
    // children (rect/circle/line/path/polyline under a transformed <g>).
    let mut svg_seen = false;
    let mut chart_rect: Option<u32> = None;
    let mut shape_ids: Vec<u32> = Vec::new();
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(svg_seen && chart_rect.is_some()) {
        let Some(batch) = h.recv(Duration::from_millis(500)) else {
            continue;
        };
        for op in &batch {
            let Op::Create {
                id, kind, props, ..
            } = op
            else {
                continue;
            };
            match kind.as_str() {
                "svg" => {
                    assert!(
                        props.attrs.get_by_name("viewBox").is_some(),
                        "the chart <svg>'s viewBox must decode on its create op"
                    );
                    svg_seen = true;
                }
                "rect" | "circle" | "line" | "path" | "polyline" | "polygon" | "ellipse" | "g" => {
                    // Shape attributes cross flat, each decoded against
                    // the shape's own element.
                    let has = |name: &str| props.attrs.get_by_name(name).is_some();
                    if kind == "rect" && has("x") && has("width") && has("fill") {
                        chart_rect = Some(*id);
                    }
                    shape_ids.push(*id);
                }
                _ => {}
            }
        }
    }
    assert!(svg_seen, "no <svg> create op in the '<svg>' demo");
    let chart_rect = chart_rect.expect("no chart <rect> with x/width/fill attributes");

    // Let the render settle (drain whatever the mount still flushes)…
    h.pump(Duration::from_secs(2));
    // Children arrive via Append/Insert: every created shape got a parent.
    // Checked after the settle drain so a multi-commit mount (attaches in a
    // later batch than the creates) can't false-fail.
    for id in &shape_ids {
        assert!(
            h.tree.parent_of.contains_key(id),
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
        let Some(batch) = h.recv(Duration::from_millis(100)) else {
            continue;
        };
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
    let Some(mut h) = Harness::start("svg_shape_click_round_trip") else {
        return;
    };

    // Navigate to the `<svg>` demo ("Elements" is expanded by default).
    h.click_label("<svg>");

    // The interactive card mounts the demo's ONE clickable shape: a `<circle>`
    // whose create op carries the click + hover handler flags (the chart's
    // shapes carry none). Its initial fill is recorded to assert the hover
    // swap later. The `clicks: 0` counter text rides inline on its create op
    // (single-string `<text>`, the `shouldSetTextContent` fast path).
    let mut circle: Option<(u32, String)> = None;
    let mut saw_counter = false;
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline && !(circle.is_some() && saw_counter) {
        let Some(batch) = h.recv(Duration::from_millis(500)) else {
            continue;
        };
        for op in &batch {
            let Op::Create {
                id,
                kind,
                props,
                text,
            } = op
            else {
                continue;
            };
            if kind == "circle" && props.on_click {
                assert!(
                    props.on_pointer_enter && props.on_pointer_leave,
                    "clickable circle created without its hover handler flags"
                );
                let fill = props
                    .attrs
                    .get_by_name("fill")
                    .expect("clickable circle has no fill");
                circle = Some((*id, format!("{fill:?}")));
            }
            if text.as_deref().map(str::trim) == Some("clicks: 0") {
                saw_counter = true;
            }
        }
    }
    let (circle_id, initial_fill) = circle.expect("no clickable <circle> create op");
    assert!(saw_counter, "initial 'clicks: 0' text not rendered");
    eprintln!("OK   interactive card: clickable circle id={circle_id}, 'clicks: 0' present");

    // Play Bevy's part: report a click on the shape's NodeId (the collectors
    // emit `click` with no coords, like any node click). The app handler must
    // increment its counter, arriving as an UpdateText to `clicks: 1`.
    h.click(circle_id);
    h.wait_op(Duration::from_secs(10), |op| {
        matches!(op, Op::UpdateText { text, .. } if text.trim() == "clicks: 1").then_some(())
    })
    .expect("no 'clicks: 1' update after shape click");
    eprintln!("OK   shape click round trip: counter updated to 'clicks: 1'");

    // Hover: a `pointerEnter` (coords in user space, as the shape synthesis
    // reports them) must run the enter handler — the fill swaps, crossing on
    // an update op.
    h.ui_event(UiEvent {
        id: circle_id,
        kind: "pointerEnter".into(),
        x: Some(100.0),
        y: Some(60.0),
        ..Default::default()
    });
    let fill = h
        .wait_op(Duration::from_secs(10), |op| match op {
            Op::Update { id, props, .. } if *id == circle_id => props
                .attrs
                .get_by_name("fill")
                .map(|fill| format!("{fill:?}")),
            _ => None,
        })
        .expect("no shape update after pointerEnter — hover handler never fired");
    assert_ne!(
        fill, initial_fill,
        "hover update re-sent the fill without swapping it"
    );
    eprintln!("OK   hover round trip: circle fill swapped on pointerEnter");
    eprintln!("PASS <svg> shape events end-to-end");
}

/// The "Named nodes" demo renders its cards as `<node name="pin">`: the `name`
/// prop must cross the bridge under its own wire field (not the old
/// `target` alias) on the create ops, one per card.
#[test]
fn named_nodes_round_trip() {
    let Some(mut h) = Harness::start("named_nodes_round_trip") else {
        return;
    };

    h.click_label("Communication");
    h.click_label("Named nodes");

    // The page mounts six cards, each a create op carrying `name: "pin"`.
    let mut pins = 0usize;
    let deadline = Instant::now() + Duration::from_secs(10);
    while pins < 6 && Instant::now() < deadline {
        let Some(batch) = h.recv(Duration::from_millis(100)) else {
            continue;
        };
        for op in &batch {
            if let Op::Create { props, .. } = op {
                assert!(
                    props.attrs.get_by_name("target").is_none(),
                    "`name` must not alias to the `target` wire field"
                );
                if props.name.as_deref() == Some("pin") {
                    pins += 1;
                }
            }
        }
    }
    assert_eq!(pins, 6, "six `<node name=\"pin\">` create ops expected");
}
