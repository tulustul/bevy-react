//! Drive `bevy_ui` from a React app running on an embedded V8 (deno_core)
//! runtime. The bridge is deliberately tiny: two channels and two ops connect a
//! dedicated JS thread to Bevy.
//!
//! The public entry point is [`ReactUiPlugin`]: add it to your Bevy `App`,
//! pointing it at a built JS bundle, and the library owns the JS thread, the
//! op/event channels, the UI root, and (optionally) hot reload.
//!
//! ```no_run
//! use bevy::prelude::*;
//! use bevy_react::ReactUiPlugin;
//!
//! App::new()
//!     .add_plugins(DefaultPlugins)
//!     .add_plugins(ReactUiPlugin::new("path/to/dist/app.js"))
//!     .run();
//! ```
//!
//! The `protocol` and `js_thread` modules are exposed for advanced use (custom
//! integrations, headless tests); most users only need [`ReactUiPlugin`].

// Let the `#[react_message]` macro's generated `::bevy_react::…` paths resolve
// inside this crate too (e.g. in our own tests and examples).
extern crate self as bevy_react;

mod anchor;
mod bridge;
mod event;
mod message;
mod plugin;
mod reconcile;
mod request;
mod scroll;
mod ui_map;

pub mod js_thread;
pub mod protocol;

// The animation engine and the canvas host element each live in their own crate
// (this crate depends on both). Re-exported so consumers can reach them directly.
pub use anchor::{Anchor, AnchorScaling, Anchored};
pub use bevy_react_animations::{self, ReactUiAnimationsPlugin};
pub use bevy_react_canvas::{self, CanvasSurface};
pub use bevy_react_macros::{react_event, react_message, react_request};
pub use event::{ReactEvent, ReactEvents};
pub use message::{ReactAppExt, ReactMessage, ReactPayload};
pub use plugin::{Fonts, PointerCapture, PointerCaptureSet, ReactUiPlugin};
pub use request::{RawRequest, ReactRequest, Request, RequestEvent, Responder};
