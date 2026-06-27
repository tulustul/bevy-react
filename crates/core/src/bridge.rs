//! The Bevy-side endpoint of the Rust<->JS boundary: channel handles plus the
//! id<->entity bookkeeping the reconciler ops are applied against.

use bevy::platform::collections::{HashMap, HashSet};
use bevy::prelude::*;
use bevy::text::{LetterSpacing, LineHeight};
use crossbeam_channel::Receiver;

use crate::protocol::{NodeId, Op, Outbound, Style};

/// The text appearance a `<text>` element/span carries, kept so inheriting child
/// runs (bare strings) can copy it on append without an ECS query (Bevy commands
/// are deferred within an op batch, so the parent's components aren't visible yet).
pub type ResolvedTextStyle = (TextColor, TextFont, LineHeight, LetterSpacing);

/// Carries batches of reconciler ops from the JS thread to Bevy.
pub type OpReceiver = Receiver<Vec<Op>>;
/// Carries everything Bevy sends to the JS side — UI events, app events, and
/// request responses — over one channel (sync `send`, no runtime needed).
///
/// The transport differs by target. On native, the JS thread parks on an async
/// recv, so this is a tokio `UnboundedSender`. On web there is no separate thread
/// (React runs in the page's own engine), so a crossbeam `Sender` drained per
/// frame is enough. Both expose the same `send(msg) -> Result<…>`, so every
/// producer ([`event`](crate::event), [`request`](crate::request)) is target-agnostic.
#[cfg(not(target_arch = "wasm32"))]
pub type OutboundSender = tokio::sync::mpsc::UnboundedSender<Outbound>;
#[cfg(target_arch = "wasm32")]
pub type OutboundSender = crossbeam_channel::Sender<Outbound>;

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
    /// Node ids that are `<surface>` detached roots. Their subtree renders into an
    /// offscreen image via a dedicated UI camera, so they must NOT be parented into
    /// the on-screen Bevy hierarchy: child-attach ops skip `add_child` for these.
    pub surfaces: HashSet<NodeId>,
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
    /// React-tree parentage of `<surface>` detached roots: surface id → its React
    /// parent id, plus the reverse (parent → its surface children). A surface is kept
    /// OUT of `child_order`/`parent_of` (it's not a Bevy child, and counting it would
    /// skew sibling insert indices), so its structural position lives here instead. This
    /// lets `Op::Remove` of an *ancestor* despawn the detached surface — which Bevy's
    /// recursive despawn can't reach, since the surface has no `ChildOf`.
    pub surface_parent: HashMap<NodeId, NodeId>,
    pub child_surfaces: HashMap<NodeId, Vec<NodeId>>,
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
            surfaces: HashSet::new(),
            editable_values: HashMap::new(),
            child_order: HashMap::new(),
            parent_of: HashMap::new(),
            surface_parent: HashMap::new(),
            child_surfaces: HashMap::new(),
        }
    }

    /// Record a `<surface>`'s React parent (detaching it from any previous one first),
    /// so a later removal of an ancestor can find and despawn this detached root.
    pub fn attach_surface(&mut self, surface: NodeId, parent: NodeId) {
        self.detach_surface(surface);
        self.surface_parent.insert(surface, parent);
        self.child_surfaces.entry(parent).or_default().push(surface);
    }

    /// Unlink `surface` from its current React parent's surface list (if any). Called
    /// before a re-`Append`/`Insert` (a reorder/re-parent) and on removal.
    pub fn detach_surface(&mut self, surface: NodeId) {
        if let Some(parent) = self.surface_parent.remove(&surface)
            && let Some(list) = self.child_surfaces.get_mut(&parent)
        {
            list.retain(|&id| id != surface);
        }
    }

    /// Every detached surface id structurally **under** `node` — its surface children,
    /// recursively through normal descendants (`child_order`) and nested surfaces —
    /// removing their parentage bookkeeping as it goes. Does NOT include `node` itself
    /// (a surface removed directly is handled by its own `Remove`). Used so `Op::Remove`
    /// despawns surfaces that Bevy's recursive despawn of `node` can't reach.
    pub fn surfaces_under(&mut self, node: NodeId) -> Vec<NodeId> {
        let mut out = Vec::new();
        self.collect_surfaces(node, &mut out);
        out
    }

    fn collect_surfaces(&mut self, node: NodeId, out: &mut Vec<NodeId>) {
        if let Some(surfaces) = self.child_surfaces.remove(&node) {
            for surface in surfaces {
                self.surface_parent.remove(&surface);
                out.push(surface);
                // A surface can itself host nested surfaces.
                self.collect_surfaces(surface, out);
            }
        }
        if let Some(kids) = self.child_order.get(&node).cloned() {
            for kid in kids {
                self.collect_surfaces(kid, out);
            }
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
