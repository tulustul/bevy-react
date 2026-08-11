//! Shared harness for the devtools test modules.

use bevy::prelude::*;
use tokio::sync::mpsc::{UnboundedReceiver, unbounded_channel};

use super::{DevtoolsConfig, DevtoolsPlugin};
use crate::bridge::OutboundResource;
use crate::protocol::outbound::Outbound;
use crate::reconcile::OpApplyStats;

/// Headless app with the toggle/auto-open systems and a drainable outbound
/// channel (the same harness shape as `keyboard.rs`'s tests).
pub(super) fn test_app(config: DevtoolsConfig) -> (App, UnboundedReceiver<Outbound>) {
    let mut app = App::new();
    // Hold the diag test lock for the app's lifetime: `emit_runtime_warnings`
    // drains the process-global runtime sink every update, so concurrent
    // test apps would steal entries from each other (and from the
    // diag/ui_map sink tests). A non-send resource drops with the App.
    // CONSEQUENCE: one live test_app per test — `drop(app)` before
    // creating a second, or this lock self-deadlocks (std Mutex is not
    // reentrant). Don't take `diag::test_lock()` in a test using this
    // harness either.
    app.insert_non_send(crate::diag::test_lock());
    app.add_plugins(MinimalPlugins);
    app.init_resource::<ButtonInput<KeyCode>>();
    app.init_resource::<ButtonInput<MouseButton>>();
    app.init_resource::<OpApplyStats>();
    let (tx, rx) = unbounded_channel::<Outbound>();
    app.insert_resource(OutboundResource(tx));
    app.add_plugins(DevtoolsPlugin::new(config));
    (app, rx)
}

pub(super) fn drain_events(
    rx: &mut UnboundedReceiver<Outbound>,
) -> Vec<(String, serde_json::Value)> {
    let mut out = Vec::new();
    while let Ok(msg) = rx.try_recv() {
        if let Outbound::Event { name, value } = msg {
            out.push((name, value));
        }
    }
    out
}
