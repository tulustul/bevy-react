//! The JS-host seam: the small slice of [`ReactUiPlugin`](crate::ReactUiPlugin)
//! that differs between targets.
//!
//! Everything else in the crate (the protocol, the reconciler ops, the message /
//! request / event registries, the JS bundle itself) is shared. Only *where the
//! React app runs* and *how Bevy events reach it* changes:
//!
//! - **native** ([`native`]): an embedded V8 isolate (deno_core) on a dedicated
//!   thread, fed from the filesystem, with mtime-based hot reload.
//! - **web** ([`web`]): the browser's own JS engine. The page loads the bundle;
//!   wasm-bindgen exposes the ops; a per-frame system drains Bevy→JS events.
//!
//! Both expose a single [`spawn`] that wires the host into the `App` and returns
//! the [`OutboundSender`](crate::bridge::OutboundSender) every outbound producer
//! ([`event`](crate::event), [`request`](crate::request)) writes to.

use crossbeam_channel::Sender;

use bevy_react_animations::AnimationCommand;

use crate::message::ReactMessage;
use crate::protocol::Op;
use crate::request::RawRequest;

/// The JS→Bevy channel senders the host hands to the JS runtime. These are the
/// same crossbeam channels on every target; only the Bevy→JS direction differs.
pub(crate) struct HostSenders {
    pub ops: Sender<Vec<Op>>,
    pub emit: Sender<ReactMessage>,
    pub request: Sender<RawRequest>,
    pub anim: Sender<AnimationCommand>,
}

/// Host configuration carried over from [`ReactUiPlugin`](crate::ReactUiPlugin).
pub(crate) struct HostConfig {
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
