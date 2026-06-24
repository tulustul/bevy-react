//! The Bevy-side endpoint of the Rust<->JS boundary: channel handles plus the
//! id<->entity bookkeeping the reconciler ops are applied against.

use bevy::platform::collections::{HashMap, HashSet};
use bevy::prelude::*;
use crossbeam_channel::Receiver;
use tokio::sync::mpsc::UnboundedSender;

use crate::protocol::{NodeId, Op, Outbound, Style};

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

/// Base + hover + press styles kept on an element that declares `hoverStyle`
/// and/or `pressStyle`. The interaction system re-applies the merged style as
/// the node's `Interaction` changes, entirely on the Bevy side (no round-trip
/// to JS). Absent on elements without variants — they style as before.
#[derive(Component, Debug, Clone, Default)]
pub struct StyleVariants {
    pub base: Option<Style>,
    pub hover: Option<Style>,
    pub press: Option<Style>,
}

/// Records which pointer handlers a node declared in JS, so the drag-capture
/// system knows whether to emit `pointerDown` / `pointerMove` / `pointerUp` for
/// it. Stamped (or removed) alongside the node's `Interaction` +
/// `RelativeCursorPosition` whenever any `onPointer*` handler is present.
#[derive(Component, Debug, Clone, Copy, Default)]
pub struct PointerHandlers {
    pub down: bool,
    pub moved: bool,
    pub up: bool,
}

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
    /// Node ids that are `editableText` inputs, so an `Update` knows to push a
    /// diverging `value` into the live `EditableText` buffer.
    pub editable_inputs: HashSet<NodeId>,
    /// The last text value emitted to JS for each `editableText`, used to dedup
    /// `TextEditChange` (which also fires on cursor moves) into real `"change"`s.
    pub editable_values: HashMap<NodeId, String>,
    /// Authoritative ordered children per parent (incl. `ROOT_ID`). Bevy's `Children`
    /// component can't be read mid-batch — `Commands` hierarchy ops are deferred to the
    /// next sync point — so this mirror is the source of truth for computing ordered
    /// insertion indices. Kept in lock-step with the ECS by `apply_js_ops`.
    pub child_order: HashMap<NodeId, Vec<NodeId>>,
    /// Reverse lookup (child → its current parent) so a re-parent or reorder can detach
    /// the child from its old parent's ordered list before re-inserting it.
    pub parent_of: HashMap<NodeId, NodeId>,
    // TODO(review): JsBridge now holds several parallel NodeId-keyed side-tables
    // (nodes/text_styles/raw_spans/editable_*/child_order/parent_of), and every `Remove`
    // must remember to clear each one. Consider moving per-node metadata onto the entities
    // as components so `despawn` cleans up for free and the maps can't drift.
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
            editable_inputs: HashSet::new(),
            editable_values: HashMap::new(),
            child_order: HashMap::new(),
            parent_of: HashMap::new(),
        }
    }

    /// Unlink `child` from its current parent's ordered children list (if any). Called
    /// before an `Append`/`Insert` so a reorder or re-parent doesn't leave a stale
    /// duplicate in the shadow tree.
    pub fn detach(&mut self, child: NodeId) {
        if let Some(parent) = self.parent_of.remove(&child)
            && let Some(siblings) = self.child_order.get_mut(&parent)
        {
            siblings.retain(|&id| id != child);
        }
    }

    /// Drop `child` and its whole subtree from the shadow tree. React emits a `Remove`
    /// only for the root of a removed subtree (Bevy despawns the descendants
    /// recursively), so we recurse to keep `child_order`/`parent_of` bounded.
    pub fn forget_subtree(&mut self, child: NodeId) {
        if let Some(grandkids) = self.child_order.remove(&child) {
            for grandkid in grandkids {
                self.parent_of.remove(&grandkid);
                self.forget_subtree(grandkid);
            }
        }
    }
}
