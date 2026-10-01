//! The JS thread on a synthetic bundle, for the headless runtime tests: the
//! app script written to a temp dir beside an empty `vendor.js`, every
//! Bevy-side channel end kept here.

#![allow(dead_code)] // each test binary links this module; not all use all of it

use std::path::PathBuf;
use std::time::{Duration, Instant};

use bevy_react_core::animations::AnimationCommand;
use bevy_react_core::js_thread::spawn_js_thread;
use bevy_react_core::protocol::op::Op;
use bevy_react_core::protocol::outbound::{Outbound, UiEvent};
use bevy_react_core::{RawRequest, ReactMessage};
use crossbeam_channel::{Receiver, RecvTimeoutError};
use tokio::sync::mpsc::UnboundedSender;

/// A JS thread running a synthetic bundle, seen from Bevy's side.
pub struct Js {
    pub ops: Receiver<Vec<Op>>,
    pub emits: Receiver<ReactMessage>,
    pub flush_stamps: Receiver<Instant>,
    pub flush_flags: Receiver<bool>,
    pub reload: UnboundedSender<()>,
    /// The app script: rewrite it, then signal [`Self::reload`].
    pub app: PathBuf,
    // Held open: a dropped outbound sender reads as shutdown to a parked
    // `op_next_event`.
    outbound: UnboundedSender<Outbound>,
    _requests: Receiver<RawRequest>,
    _anims: Receiver<AnimationCommand>,
}

impl Js {
    /// Write `app` into a fresh temp dir named after `test` and spawn the JS
    /// thread on it, with the core's built-in registry.
    pub fn spawn(test: &str, app: impl AsRef<[u8]>) -> Self {
        let dir = std::env::temp_dir().join(format!("bevy-react-{test}-{}", std::process::id()));
        std::fs::create_dir_all(&dir).expect("create temp bundle dir");
        let vendor = dir.join("vendor.js");
        let app_path = dir.join("app.js");
        std::fs::write(&vendor, "").expect("write vendor");
        std::fs::write(&app_path, app).expect("write app");

        let (ops_tx, ops) = crossbeam_channel::unbounded();
        let (flush_stamps_tx, flush_stamps) = crossbeam_channel::unbounded();
        let (flush_devtools_tx, flush_flags) = crossbeam_channel::unbounded();
        let (emit_tx, emits) = crossbeam_channel::unbounded();
        let (request_tx, _requests) = crossbeam_channel::unbounded();
        let (anim_tx, _anims) = crossbeam_channel::unbounded();
        let (outbound, outbound_rx) = tokio::sync::mpsc::unbounded_channel();
        let (reload, reload_rx) = tokio::sync::mpsc::unbounded_channel();
        spawn_js_thread(
            bevy_react_core::ext::ExtRegistrySlot::ready(bevy_react_core::ext::builtin_registry()),
            vendor,
            app_path.clone(),
            ops_tx,
            flush_stamps_tx,
            flush_devtools_tx,
            emit_tx,
            request_tx,
            anim_tx,
            outbound_rx,
            reload_rx,
        );
        Self {
            ops,
            emits,
            flush_stamps,
            flush_flags,
            reload,
            app: app_path,
            outbound,
            _requests,
            _anims,
        }
    }

    /// Report a click (the synthetic apps don't care on which node).
    pub fn click(&self) {
        self.outbound
            .send(Outbound::UiEvent {
                event: UiEvent {
                    id: 1,
                    kind: "click".into(),
                    ..Default::default()
                },
            })
            .expect("JS thread gone");
    }

    /// The value of the next emit named `name` (others are skipped); panics
    /// when none arrives within `timeout`.
    pub fn emitted(&self, name: &str, timeout: Duration) -> serde_json::Value {
        let deadline = Instant::now() + timeout;
        loop {
            let left = deadline.saturating_duration_since(Instant::now());
            match self.emits.recv_timeout(left) {
                Ok(msg) if msg.name == name => return msg.value,
                Ok(_) => {}
                Err(RecvTimeoutError::Timeout) => panic!("no {name:?} emit within {timeout:?}"),
                Err(RecvTimeoutError::Disconnected) => panic!("JS thread died before {name:?}"),
            }
        }
    }
}
