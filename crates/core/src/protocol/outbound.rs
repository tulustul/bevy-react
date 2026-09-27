//! Everything Bevy sends to JS: [`UiEvent`] and the [`Outbound`] envelope.

use serde::{Deserialize, Serialize};

use super::NodeId;

/// An interaction event sent from Bevy back into JS, where the reconciler
/// dispatches it to the matching React handler.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UiEvent {
    pub id: NodeId,
    /// `"click"`, a pointer kind (`"pointerDown"` / `"pointerMove"` /
    /// `"pointerUp"` / `"pointerEnter"` / `"pointerLeave"`), `"scroll"`, or
    /// `"wheel"` — the common events. An element's own events ride
    /// [`Outbound::ElementEvent`].
    pub kind: String,
    /// Cursor x within the node, normalized to `0..1` (left→right). Present only
    /// for pointer events; `None` for `"click"`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub x: Option<f32>,
    /// Cursor y within the node, normalized to `0..1` (top→bottom). Present only
    /// for pointer events; `None` for `"click"`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub y: Option<f32>,
    /// Absolute cursor x in window logical pixels (left→right, top-left origin).
    /// Present only for pointer events; lets a handler drag a node across the
    /// screen (the normalized `x`/`y` are clamped to the node and can't).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub client_x: Option<f32>,
    /// Absolute cursor y in window logical pixels (top→bottom). Present only for
    /// pointer events; see [`client_x`](Self::client_x).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub client_y: Option<f32>,
    /// Which mouse button fired, in DOM `MouseEvent.button` numbering:
    /// `0` left/primary, `1` middle/auxiliary, `2` right/secondary. Present for
    /// `"pointerDown"`/`"pointerMove"`/`"pointerUp"`; absent for `"click"`
    /// (primary-only, like DOM `click`) and hover/scroll/text events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub button: Option<u8>,
    /// Vertical scroll offset (logical px) → `ScrollPosition.y`. Present only for
    /// `"scroll"` events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scroll_top: Option<f32>,
    /// Horizontal scroll offset (logical px) → `ScrollPosition.x`. Present only for
    /// `"scroll"` events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scroll_left: Option<f32>,
    /// Raw horizontal wheel delta (the frame's accumulated scroll). Present only
    /// for `"wheel"` events; interpret with [`delta_mode`](Self::delta_mode).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delta_x: Option<f32>,
    /// Raw vertical wheel delta. Present only for `"wheel"` events; positive is a
    /// wheel-down / scroll-forward gesture, matching DOM `WheelEvent.deltaY`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delta_y: Option<f32>,
    /// How to read the wheel deltas: `"line"` (mouse notches — scale by your own
    /// per-line distance) or `"pixel"` (trackpad — already in pixels). Mirrors
    /// DOM `WheelEvent.deltaMode`. Present only for `"wheel"` events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delta_mode: Option<String>,
}

/// Everything that flows Bevy -> JS over the single outbound channel. Internally
/// tagged (`t`) so `serde_v8` produces a plain JS object the JS event loop can
/// `switch` on. Each variant serializes to a map, as internal tagging requires.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "t", rename_all = "camelCase")]
pub enum Outbound {
    /// A UI interaction on a reconciler node (the original click path).
    UiEvent { event: UiEvent },
    /// An element's own event (see [`crate::element::ElementEvent`]): routed
    /// to the node's `on<Event>` handler, called with `payload` (none for a
    /// `null` payload).
    ElementEvent {
        id: super::NodeId,
        event: String,
        payload: serde_json::Value,
    },
    /// A named Bevy -> React app event (e.g. `"user.disconnected"`). `value` is
    /// the payload, pre-serialized so this channel stays a single concrete type.
    Event {
        name: String,
        value: serde_json::Value,
    },
    /// A reply to a React -> Bevy request, correlated by the request `id`.
    Response { id: u64, result: ResponseResult },
    /// A token-tagged animation driver settled: `finished` is `true` on natural
    /// completion, `false` on interruption. `token` correlates the JS completion
    /// callback registered when the driver was assigned.
    AnimationFinished {
        id: crate::animations::SharedId,
        token: u64,
        finished: bool,
    },
    /// Hot-reload sentinel: make the JS event loop exit so the runtime rebuilds.
    Reload,
}

/// The outcome of a React -> Bevy request. Internally tagged (`status`) so JS
/// reads `result.status === "ok"`. The error is a message, surfaced to JS as a
/// rejected promise — the typed success value is the only thing in the schema.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum ResponseResult {
    Ok { value: serde_json::Value },
    Err { message: String },
}

#[cfg(test)]
mod tests {
    use super::*;

    /// An element event serializes its payload verbatim under `payload`.
    #[test]
    fn serializes_element_event() {
        let v = serde_json::to_value(Outbound::ElementEvent {
            id: 7,
            event: "change".into(),
            payload: serde_json::json!("hello"),
        })
        .expect("serializable");
        assert_eq!(v["t"], "elementEvent");
        assert_eq!(v["event"], "change");
        assert_eq!(v["payload"], "hello");
    }

    /// A pointer event carries the DOM button number; button-less events omit it
    /// entirely.
    #[test]
    fn serializes_pointer_event_with_button() {
        let ev = UiEvent {
            id: 3,
            kind: "pointerDown".into(),
            button: Some(2),
            ..Default::default()
        };
        let v = serde_json::to_value(&ev).expect("serializable");
        assert_eq!(v["kind"], "pointerDown");
        assert_eq!(v["button"], 2);
    }
}
