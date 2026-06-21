//! The wire protocol shared between the JS reconciler and the Bevy side.
//!
//! Everything here derives `serde` so deno_core's `serde_v8` can convert
//! directly between the plain JS objects the reconciler builds and these Rust
//! types — no JSON strings on the hot path.

use serde::{Deserialize, Serialize};

/// Stable identity for a node, assigned by the JS reconciler. `0` is reserved
/// for the root container (the Bevy UI root entity).
pub type NodeId = u32;

pub const ROOT_ID: NodeId = 0;

/// A single mutation produced by the React reconciler during a commit. The
/// reconciler batches a `Vec<Op>` per commit and flushes it across the boundary
/// in one call.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "op", rename_all = "camelCase")]
pub enum Op {
    /// Spawn a host element (`node` or `button`).
    Create {
        id: NodeId,
        kind: String,
        #[serde(default)]
        props: Props,
    },
    /// Spawn a text node with its initial string.
    CreateText { id: NodeId, text: String },
    /// Make `child` the last child of `parent` (`parent == ROOT_ID` is the root).
    Append { parent: NodeId, child: NodeId },
    /// Insert `child` before `before` under `parent`.
    Insert {
        parent: NodeId,
        child: NodeId,
        before: NodeId,
    },
    /// Detach and despawn `child` (and its descendants).
    Remove { parent: NodeId, child: NodeId },
    /// Re-apply props to an existing element.
    Update {
        id: NodeId,
        #[serde(default)]
        props: Props,
    },
    /// Replace the string of a text node.
    UpdateText { id: NodeId, text: String },
}

/// Props for a host element. Event handlers never cross the boundary — the
/// reconciler replaces them with booleans (e.g. `onClick: true`) and keeps the
/// actual function in a JS-side map.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Props {
    #[serde(default)]
    pub style: Option<Style>,
    /// Hex color like `#3355ff` (with or without leading `#`).
    #[serde(default)]
    pub background_color: Option<String>,
    /// Text color for text descendants is set on the text node itself; for a
    /// `node`/`button` this is currently unused but kept for symmetry.
    #[serde(default)]
    pub color: Option<String>,
    #[serde(default)]
    pub font_size: Option<f32>,
    /// Whether this element has an `onClick` handler registered in JS.
    #[serde(default)]
    pub on_click: bool,
}

/// A minimal flexbox style subset mapped onto `bevy_ui::Node`.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Style {
    /// Width in logical pixels.
    #[serde(default)]
    pub width: Option<f32>,
    /// Height in logical pixels.
    #[serde(default)]
    pub height: Option<f32>,
    /// `"row"` or `"column"`.
    #[serde(default)]
    pub flex_direction: Option<String>,
    /// `"start" | "center" | "end" | "spaceBetween" | "spaceAround"`.
    #[serde(default)]
    pub justify_content: Option<String>,
    /// `"start" | "center" | "end" | "stretch"`.
    #[serde(default)]
    pub align_items: Option<String>,
    /// Uniform padding in logical pixels.
    #[serde(default)]
    pub padding: Option<f32>,
    /// Uniform margin in logical pixels.
    #[serde(default)]
    pub margin: Option<f32>,
    /// Gap between children in logical pixels (applied to both row and column).
    #[serde(default)]
    pub gap: Option<f32>,
}

/// An interaction event sent from Bevy back into JS, where the reconciler
/// dispatches it to the matching React handler.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UiEvent {
    pub id: NodeId,
    /// Currently only `"click"`.
    pub kind: String,
}
