//! The Bevy-side endpoint of the Rust<->JS boundary: channel handles plus the
//! id<->entity bookkeeping the reconciler ops are applied against.

use bevy::platform::collections::{HashMap, HashSet};
use bevy::prelude::*;
use crossbeam_channel::Receiver;
use tokio::sync::mpsc::UnboundedSender;

use crate::protocol::{NodeId, Op, Outbound};

/// The text appearance a `<text>` element/span carries, kept so inheriting child
/// runs (bare strings) can copy it on append without an ECS query (Bevy commands
/// are deferred within an op batch, so the parent's components aren't visible yet).
pub type ResolvedTextStyle = (TextColor, TextFont);

/// Carries batches of reconciler ops from the JS thread to Bevy.
pub type OpReceiver = Receiver<Vec<Op>>;
/// Carries everything Bevy sends to the JS thread — UI events, app events, and
/// request responses — over one channel (sync `send`, no runtime needed).
pub type OutboundSender = UnboundedSender<Outbound>;

/// Component stamped on every entity the reconciler creates, recording the JS
/// node id so interaction events can be reported back with the right identity.
#[derive(Component, Debug, Clone, Copy)]
pub struct RNode(pub NodeId);

/// A standalone clone of the outbound sender, inserted in [`Plugin::build`] so
/// the request dispatcher and the [`ReactEvents`](crate::ReactEvents) system
/// param can push to JS without depending on [`JsBridge`], which only exists
/// after `Startup`.
#[derive(Resource, Clone)]
pub struct OutboundResource(pub OutboundSender);

/// The Bevy resource holding the live boundary state.
#[derive(Resource)]
pub struct JsBridge {
    /// Incoming op batches from the reconciler.
    pub ops_rx: OpReceiver,
    /// Outgoing UI events to the reconciler (wrapped in [`Outbound::UiEvent`]).
    pub outbound_tx: OutboundSender,
    /// Maps reconciler node ids to their spawned entities.
    pub nodes: HashMap<NodeId, Entity>,
    /// Resolved text style of each `<text>` element/span, for span inheritance.
    pub text_styles: HashMap<NodeId, ResolvedTextStyle>,
    /// Node ids that are bare-string runs inheriting their parent's text style.
    pub raw_spans: HashSet<NodeId>,
}

impl JsBridge {
    pub fn new(ops_rx: OpReceiver, outbound_tx: OutboundSender, root: Entity) -> Self {
        let mut nodes = HashMap::new();
        // ROOT_ID (0) always resolves to the UI root entity.
        nodes.insert(crate::protocol::ROOT_ID, root);
        Self {
            ops_rx,
            outbound_tx,
            nodes,
            text_styles: HashMap::new(),
            raw_spans: HashSet::new(),
        }
    }
}
