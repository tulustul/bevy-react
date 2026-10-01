//! The harness the headless tests drive the real demos bundle with: the JS
//! thread over channels (no GPU/window), with this side playing Bevy — op
//! batches in, clicks/events/settlements out — plus enough of the op tree to
//! find a button by its label.

#![allow(dead_code)] // each test binary links this module; not all use all of it

use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::time::{Duration, Instant};

use bevy_react::RawRequest;
use bevy_react::ReactMessage;
use bevy_react::animations::AnimationCommand;
use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::op::Op;
use bevy_react::protocol::outbound::{Outbound, ResponseResult, UiEvent};
use crossbeam_channel::{Receiver, RecvTimeoutError};
use tokio::sync::mpsc::UnboundedSender;

/// The viewport the harness reports — the desktop shell (`>= 720` wide).
pub const WINDOW: (u32, u32) = (1280, 832);

/// The slice of the rendered tree the tests navigate by: which nodes are
/// buttons, each node's parent, and each text run's label.
#[derive(Default)]
pub struct Tree {
    pub buttons: HashSet<u32>,
    pub parent_of: HashMap<u32, u32>,
    pub text_of: HashMap<u32, String>,
}

impl Tree {
    /// Fold one op in.
    pub fn record(&mut self, op: &Op) {
        match op {
            Op::Create { id, kind, text, .. } => {
                if kind == "button" {
                    self.buttons.insert(*id);
                }
                // A single-string `<text>` rides its label inline on the create
                // op (the `shouldSetTextContent` fast path), not as a child run.
                if let Some(text) = text {
                    self.text_of.insert(*id, text.clone());
                }
            }
            Op::CreateTextSpan { id, text } | Op::CreateText { id, text } => {
                self.text_of.insert(*id, text.clone());
            }
            Op::Append { parent, child } | Op::Insert { parent, child, .. } => {
                self.parent_of.insert(*child, *parent);
            }
            _ => {}
        }
    }

    /// The `<button>` enclosing a text run labelled `label` — the label sits
    /// under one or more wrapper `<node>`s, so walk up from it.
    pub fn find_button(&self, label: &str) -> Option<u32> {
        self.find_button_under(label, None)
    }

    /// [`Self::find_button`] scoped to one subtree: the climb must reach the
    /// `under` ancestor for the button to count. Without it a label two
    /// subtrees share ("Layers" is both a devtools tab and a left-nav demo)
    /// resolves to whichever match comes first.
    pub fn find_button_under(&self, label: &str, under: Option<u32>) -> Option<u32> {
        // Sorted so a tie between two in-scope matches is deterministic.
        let mut spans: Vec<u32> = self
            .text_of
            .iter()
            .filter(|(_, text)| text.trim() == label)
            .map(|(span, _)| *span)
            .collect();
        spans.sort_unstable();
        for span in spans {
            let mut current = span;
            let mut button = None;
            let mut in_scope = under.is_none();
            // Bounded so a malformed parent map can't loop forever.
            for _ in 0..32 {
                let Some(&parent) = self.parent_of.get(&current) else {
                    break;
                };
                if button.is_none() && self.buttons.contains(&parent) {
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

    /// Whether `id` is `root` or a descendant of it.
    pub fn is_under(&self, mut id: u32, root: u32) -> bool {
        for _ in 0..64 {
            if id == root {
                return true;
            }
            match self.parent_of.get(&id) {
                Some(&parent) => id = parent,
                None => return false,
            }
        }
        false
    }
}

/// The JS thread running the demos bundle, seen from Bevy's side.
pub struct Harness {
    pub ops: Receiver<Vec<Op>>,
    pub emits: Receiver<ReactMessage>,
    pub anims: Receiver<AnimationCommand>,
    /// Per-batch devtools-origin flags (`true` = the panel's own flush).
    pub flush_flags: Receiver<bool>,
    pub tree: Tree,
    outbound: UnboundedSender<Outbound>,
    // Held open: dropping the reload sender would look like shutdown, and
    // the stamp channel's sends must find a live receiver.
    _reload: UnboundedSender<()>,
    _flush_stamps: Receiver<Instant>,
}

impl Harness {
    /// Spawn the JS thread on the built bundle — `None` (after a skip notice
    /// naming `test`) when the bundle isn't built.
    pub fn start(test: &str) -> Option<Self> {
        let bundle = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("ui/dist/app.js");
        if !bundle.exists() {
            eprintln!(
                "skipping {test}: bundle not built at {}\n  run: npm install && npm run build -w demos",
                bundle.display()
            );
            return None;
        }
        let (ops_tx, ops) = crossbeam_channel::unbounded();
        let (flush_stamps_tx, _flush_stamps) = crossbeam_channel::unbounded();
        let (flush_devtools_tx, flush_flags) = crossbeam_channel::unbounded();
        let (emit_tx, emits) = crossbeam_channel::unbounded();
        let (request_tx, request_rx) = crossbeam_channel::unbounded();
        let (anim_tx, anims) = crossbeam_channel::unbounded();
        let (outbound, outbound_rx) = tokio::sync::mpsc::unbounded_channel();
        let (_reload, reload_rx) = tokio::sync::mpsc::unbounded_channel();
        answer_window_size(request_rx, outbound.clone());
        spawn_js_thread(
            bevy_react::ext::ExtRegistrySlot::ready(ext_registry()),
            bundle.with_file_name("vendor.js"),
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
        Some(Self {
            ops,
            emits,
            anims,
            flush_flags,
            tree: Tree::default(),
            outbound,
            _reload,
            _flush_stamps,
        })
    }

    /// Send the JS side one Bevy→JS message.
    pub fn send(&self, msg: Outbound) {
        self.outbound.send(msg).expect("JS thread gone");
    }

    /// Report a UI event.
    pub fn ui_event(&self, event: UiEvent) {
        self.send(Outbound::UiEvent { event });
    }

    /// Report a click on node `id`.
    pub fn click(&self, id: u32) {
        self.ui_event(UiEvent {
            id,
            kind: "click".into(),
            ..Default::default()
        });
    }

    /// Send a named app event (what `ReactEvents::send` delivers).
    pub fn event(&self, name: &str, value: serde_json::Value) {
        self.send(Outbound::Event {
            name: name.into(),
            value,
        });
    }

    /// One op batch, recorded into [`Self::tree`]; `None` on timeout. Panics
    /// if the JS thread died — see the `[js]` error logged above it.
    pub fn recv(&mut self, timeout: Duration) -> Option<Vec<Op>> {
        match self.ops.recv_timeout(timeout) {
            Ok(batch) => {
                for op in &batch {
                    self.tree.record(op);
                }
                Some(batch)
            }
            Err(RecvTimeoutError::Timeout) => None,
            Err(RecvTimeoutError::Disconnected) => panic!("JS thread died (runtime crashed)"),
        }
    }

    /// Receive (and record) batches for `dur`.
    pub fn pump(&mut self, dur: Duration) {
        let deadline = Instant::now() + dur;
        while Instant::now() < deadline {
            self.recv(Duration::from_millis(25));
        }
    }

    /// Receive until a button labelled `label` exists, or `dur` elapses.
    pub fn wait_button(&mut self, label: &str, dur: Duration) -> Option<u32> {
        let deadline = Instant::now() + dur;
        loop {
            if let Some(button) = self.tree.find_button(label) {
                return Some(button);
            }
            if Instant::now() >= deadline {
                return None;
            }
            self.recv(Duration::from_millis(100));
        }
    }

    /// Wait for the button labelled `label` and click it (a left-nav
    /// section or entry, a demo's own button).
    pub fn click_label(&mut self, label: &str) -> u32 {
        let button = self
            .wait_button(label, Duration::from_secs(15))
            .unwrap_or_else(|| panic!("no '{label}' button rendered"));
        self.click(button);
        button
    }

    /// Receive until an op maps to `Some` through `find`, or `dur` elapses.
    pub fn wait_op<T>(
        &mut self,
        dur: Duration,
        mut find: impl FnMut(&Op) -> Option<T>,
    ) -> Option<T> {
        let deadline = Instant::now() + dur;
        while Instant::now() < deadline {
            if let Some(hit) = self
                .recv(Duration::from_millis(100))
                .and_then(|batch| batch.iter().find_map(&mut find))
            {
                return Some(hit);
            }
        }
        None
    }
}

/// Answer the demos shell's `window.size` bootstrap request with [`WINDOW`]:
/// the shell renders nothing until it knows the viewport, so a harness that
/// dropped the request would never see the nav. Every other request is
/// dropped. Runs until the JS thread drops its sender.
fn answer_window_size(request_rx: Receiver<RawRequest>, outbound_tx: UnboundedSender<Outbound>) {
    std::thread::spawn(move || {
        for req in request_rx {
            if req.name != "window.size" {
                continue;
            }
            let value = serde_json::json!({ "width": WINDOW.0, "height": WINDOW.1 });
            if outbound_tx
                .send(Outbound::Response {
                    id: req.id,
                    result: ResponseResult::Ok { value },
                })
                .is_err()
            {
                return; // JS thread gone
            }
        }
    });
}

/// The feature registry the demos app runs with: the core's style
/// properties, writers, and elements plus every `ReactPlugins` feature
/// element (the gallery renders JSX `<svg>`s, `<canvas>`, …). Built on a
/// bare `App`, exactly as the plugins register into the real one.
fn ext_registry() -> bevy_react::ext::ExtRegistry {
    use bevy_react::ReactAppExt;
    let mut app = bevy::app::App::new();
    bevy_react::style::add_core_styles(&mut app);
    app.add_react_elements(bevy_react::elements::CORE_ELEMENTS);
    bevy_react::ReactPlugins::register_bindings(&mut app);
    bevy_react::ext::ExtRegistry::from_app(&app)
}
