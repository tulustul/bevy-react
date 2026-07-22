#![cfg_attr(docsrs, feature(doc_cfg))]
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
mod cursor;
// Devtools diagnostics sinks (invalid style/prop values). Always declared —
// the protocol/apply call sites are unconditional — but its real implementation
// only exists with the `devtools` feature on a debug build; otherwise every fn
// is an inline no-op stub.
mod diag;
// The devtools inspector. A feature-gated module (not a separate
// crate — it needs `JsBridge` and friends, which stay private) that is fully
// compiled out unless the `devtools` cargo feature (a default feature) is on.
// Crate-internal: `ReactUiPlugin` auto-registers `DevtoolsPlugin` and exposes
// the only knob (`ReactUiPlugin::devtools`).
#[cfg(feature = "devtools")]
mod devtools;
mod event;
mod filter;
mod host;
mod keyboard;
mod message;
mod pick_clip;
mod plugin;
mod reconcile;
mod registry;
mod request;
mod scroll;
mod scrollbar;
mod transition;
mod ts_codegen;
mod ui_map;
mod window;

// The native JS host (embedded V8 / deno_core on a dedicated thread). Exposed for
// advanced use (custom integrations, headless tests). The web target has no such
// thread — React runs in the browser's own engine — so this module is absent there.
#[cfg(not(target_arch = "wasm32"))]
pub mod js_thread;
pub mod protocol;

// The animation engine and the canvas/portal/surface host elements. Public
// modules so consumers can reach their full APIs; the most-used items are also
// re-exported at the crate root below.
pub mod animations;
pub mod canvas;
pub mod layer;
pub mod portal;
pub mod surface;

pub use anchor::{Anchor, AnchorScaling, Anchored};
pub use animations::ReactUiAnimationsPlugin;
pub use bevy_react_macros::{react_event, react_message, react_request};
pub use canvas::CanvasSurface;
#[cfg(feature = "devtools")]
#[cfg_attr(docsrs, doc(cfg(feature = "devtools")))]
pub use devtools::DevtoolsConfig;
pub use event::{ReactEvent, ReactEvents};
pub use message::{ReactAppExt, ReactMessage, ReactPayload};
pub use plugin::{Fonts, PointerCapture, PointerCaptureSet, ReactUiPlugin};
pub use portal::{
    PortalCamera, RenderMode, RenderTarget, RenderTargetSpec, RenderTargets, Resolution,
};
pub use reconcile::OpApplyStats;
pub use request::{RawRequest, ReactRequest, Request, RequestEvent, Responder};
pub use scrollbar::{
    HorizontalEdge, ScrollbarConfig, ScrollbarPartStyle, ScrollbarPosition, ScrollbarSpec,
    VerticalEdge,
};
pub use surface::{SurfacePointer, SurfaceSpec, SurfaceVirtualPointer, Surfaces, UvChannel};
