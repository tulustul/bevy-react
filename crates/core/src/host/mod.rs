//! The JS-host seam: the small slice of [`ReactUiPlugin`](crate::ReactUiPlugin)
//! that differs between targets.
//!
//! Everything else in the crate (the protocol, the reconciler ops, the message /
//! request / event registries, the JS bundle itself) is shared. Only *where the
//! React app runs* and *how Bevy events reach it* changes:
//!
//! - **native** ([`native`]): an embedded V8 isolate (deno_core) on a dedicated
//!   thread, fed from the filesystem, with mtime-based hot reload.
//! - **web** (`web`, wasm builds only): the browser's own JS engine. The page
//!   loads the bundle;
//!   wasm-bindgen exposes the ops; a per-frame system drains Bevy→JS events.
//!
//! Both expose a single [`spawn`] that wires the host into the `App` and returns
//! the [`OutboundSender`](crate::bridge::OutboundSender) every outbound producer
//! ([`event`](crate::event), [`request`](crate::request)) writes to.

use crossbeam_channel::Sender;

use crate::animations::AnimationCommand;

use crate::message::ReactMessage;
use crate::protocol::op::Op;
use crate::request::RawRequest;

/// The JS→Bevy channel senders the host hands to the JS runtime (on native,
/// `spawn_js_thread` stores one clone in each runtime's `OpState`). These are
/// the same crossbeam channels on every target; only the Bevy→JS direction
/// differs.
#[derive(Clone)]
pub struct HostSenders {
    /// One commit's ops per batch (`op_flush`).
    pub ops: Sender<Vec<Op>>,
    /// Per-batch send instants for the devtools "pre-apply" leg (send →
    /// `apply_js_ops` start: channel wait + frame latency). A side channel, so
    /// the op hot path's type stays `Vec<Op>`; each stamp is sent BEFORE its
    /// batch, so a received batch always finds its stamp queued and the FIFOs
    /// stay aligned. Native only — `Instant::now` is unavailable on wasm, so
    /// the web host drops it and the receiver simply stays empty there.
    #[cfg_attr(target_arch = "wasm32", allow(dead_code))]
    pub flush_stamps: Sender<std::time::Instant>,
    /// Per-batch devtools-origin flags (`true` = the devtools panel's own React
    /// container flushed), same aligned discipline as `flush_stamps` (flag sent
    /// first). Lets applies be attributed, so devtools batch stats skip the
    /// panel's own repaints — see `reconcile::FlushFlags`.
    pub flush_devtools: Sender<bool>,
    /// App messages (`op_emit`).
    pub emit: Sender<ReactMessage>,
    /// Correlated requests (`op_request`).
    pub request: Sender<RawRequest>,
    /// Shared-value animation commands (`op_animate`).
    pub anim: Sender<AnimationCommand>,
}

/// Host configuration carried over from [`ReactUiPlugin`](crate::ReactUiPlugin).
pub(crate) struct HostConfig {
    /// The feature-registry handoff the decoding host installs before its
    /// first op decode (see [`crate::ext::ExtRegistrySlot`]).
    pub ext: crate::ext::ExtRegistrySlot,
    /// Path to the built app bundle (`app.js`); its `vendor.js` sibling is loaded
    /// alongside. Native only — on web the HTML page loads the bundle itself, so
    /// the field is ignored there.
    #[cfg_attr(target_arch = "wasm32", allow(dead_code))]
    pub bundle: std::path::PathBuf,
    /// Watch the bundle and hot reload on change. Native only; ignored on web
    /// (the dev server / browser owns reloading there).
    #[cfg_attr(target_arch = "wasm32", allow(dead_code))]
    pub hot_reload: bool,
}

#[cfg(not(target_arch = "wasm32"))]
mod native;
#[cfg(not(target_arch = "wasm32"))]
pub(crate) use native::spawn;

#[cfg(target_arch = "wasm32")]
mod web;
#[cfg(target_arch = "wasm32")]
pub(crate) use web::spawn;
