//! The Bevy-side endpoint of the Rust<->JS boundary: channel handles plus the
//! id<->entity bookkeeping the reconciler ops are applied against.

use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use crossbeam_channel::Receiver;
use tokio::sync::mpsc::UnboundedSender;

use crate::protocol::{NodeId, Op, UiEvent};

/// Carries batches of reconciler ops from the JS thread to Bevy.
pub type OpReceiver = Receiver<Vec<Op>>;
/// Carries UI events from Bevy to the JS thread (sync `send`, no runtime needed).
pub type EventSender = UnboundedSender<UiEvent>;

/// Component stamped on every entity the reconciler creates, recording the JS
/// node id so interaction events can be reported back with the right identity.
#[derive(Component, Debug, Clone, Copy)]
pub struct RNode(pub NodeId);

/// The Bevy resource holding the live boundary state.
#[derive(Resource)]
pub struct JsBridge {
    /// Incoming op batches from the reconciler.
    pub ops_rx: OpReceiver,
    /// Outgoing interaction events to the reconciler.
    pub events_tx: EventSender,
    /// Maps reconciler node ids to their spawned entities.
    pub nodes: HashMap<NodeId, Entity>,
}

impl JsBridge {
    pub fn new(ops_rx: OpReceiver, events_tx: EventSender, root: Entity) -> Self {
        let mut nodes = HashMap::new();
        // ROOT_ID (0) always resolves to the UI root entity.
        nodes.insert(crate::protocol::ROOT_ID, root);
        Self {
            ops_rx,
            events_tx,
            nodes,
        }
    }
}
