#![cfg_attr(docsrs, feature(doc_cfg))]
//! Drive `bevy_ui` from a React app running on an embedded V8 runtime.
//!
//! This is the crate an app depends on: the core bridge
//! ([`bevy_react_core`], re-exported at this crate's root) plus the optional
//! element crates, each behind a cargo feature, all on by default. Add
//! [`ReactPlugins`] — bevy-react's `DefaultPlugins` — next to Bevy's own:
//!
//! ```no_run
//! use bevy::prelude::*;
//! use bevy_react::prelude::*;
//!
//! App::new()
//!     .add_plugins(DefaultPlugins)
//!     .add_plugins(ReactPlugins.set(ReactUiPlugin::new("ui/dist/app.js")))
//!     .run();
//! ```
//!
//! `ReactPlugins` alone loads `ui/dist/app.js` (what the `init` template
//! builds). Like any plugin group it takes `.set(..)` to configure a member
//! and `.disable::<P>()` to leave one out.
//!
//! # Picking what gets compiled
//!
//! | feature | adds |
//! |---|---|
//! | `svg` | `<svg>` + shape elements ([`svg`], `SvgPlugin`) |
//! | `anchor` | `<anchor>`, world-anchored overlays (`anchor`, `AnchorPlugin`) |
//! | `canvas` | `<canvas>`, a retained drawing surface (`canvas`, `CanvasPlugin`) |
//! | `portal` | `<portal>`, render-target views (`portal`, `PortalPlugin`) |
//! | `surface` | `<surface>`, UI in offscreen textures (`surface`, `SurfacePlugin`) |
//! | `devtools` | the F12 inspector (inert in `--release`) |
//! | `custom_cursor` | `ReactUiPlugin::cursor` (pulls in `bevy_winit`) |
//! | `svg_text` | `<text>` inside file-mode SVGs (off by default; fontdb) |
//!
//! A disabled feature is not compiled at all. Its elements then mount as
//! plain nodes and warn (`featureMissing`) naming the feature to enable:
//!
//! ```toml
//! bevy-react = { version = "0.7", default-features = false, features = ["svg", "devtools"] }
//! ```
//!
//! A crate that extends bevy-react (custom elements, styles, filters)
//! depends on `bevy-react` with `default-features = false`, like a Bevy
//! plugin crate depends on `bevy`.

// The macros expand to `::bevy_react::…` paths when the caller depends on
// this crate — including this crate's own tests and doctests.
extern crate self as bevy_react;

#[cfg(test)]
mod macro_tests;
mod plugins;

pub use bevy_react_core::*;
pub use plugins::ReactPlugins;

/// SVG: the core's file mode (`<image src="x.svg">` —
/// [`SvgDocument`](svg::SvgDocument), [`SvgSurface`](svg::SvgSurface)) and,
/// with the `svg` feature, the JSX `<svg>` element and
/// its shapes (`SvgPlugin`, `SvgShape`, …).
pub mod svg {
    pub use bevy_react_core::svg::*;
    #[cfg(feature = "svg")]
    #[cfg_attr(docsrs, doc(cfg(feature = "svg")))]
    pub use bevy_react_svg::*;
}

/// The `<anchor>` element: world-anchored UI overlays.
#[cfg(feature = "anchor")]
#[cfg_attr(docsrs, doc(cfg(feature = "anchor")))]
pub use bevy_react_anchor as anchor;

/// The `<canvas>` element: a retained CPU-rastered drawing surface.
#[cfg(feature = "canvas")]
#[cfg_attr(docsrs, doc(cfg(feature = "canvas")))]
pub use bevy_react_canvas as canvas;

/// The `<portal>` element: render-target views.
#[cfg(feature = "portal")]
#[cfg_attr(docsrs, doc(cfg(feature = "portal")))]
pub use bevy_react_portal as portal;

/// The `<surface>` element: React UI rendered into offscreen textures.
#[cfg(feature = "surface")]
#[cfg_attr(docsrs, doc(cfg(feature = "surface")))]
pub use bevy_react_surface as surface;

/// The items most apps use: the plugins, the typed-messaging macros and
/// their registration/send APIs, and the React-node lookups.
pub mod prelude {
    pub use crate::ReactPlugins;
    #[cfg(feature = "anchor")]
    pub use crate::anchor::AnchorPlugin;
    #[cfg(feature = "canvas")]
    pub use crate::canvas::CanvasPlugin;
    #[cfg(feature = "portal")]
    pub use crate::portal::PortalPlugin;
    #[cfg(feature = "surface")]
    pub use crate::surface::SurfacePlugin;
    #[cfg(feature = "svg")]
    pub use crate::svg::SvgPlugin;
    pub use bevy_react_core::{
        ReactAppExt, ReactEvents, ReactNode, ReactNodes, ReactUiPlugin, Request, react_event,
        react_filter, react_message, react_morph_filter, react_request,
    };
}
