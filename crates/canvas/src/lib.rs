//! The `<canvas>` element for `bevy_react_core`: an arbitrary anti-aliased
//! vector drawing surface.
//!
//! A `<canvas>` is a normal styled UI node carrying an `ImageNode` whose
//! texture this crate paints. Semantics are web-faithful: the surface is a
//! **retained pixel buffer** that paint accumulates onto. React-side drawing
//! calls (`ctx.moveTo`/`lineTo`/`fill`/`clearRect`/…) record [`DrawCmd`]s that
//! cross the bridge — either as the declarative [`DRAW`] attribute (clear +
//! replay) or as the imperative [`DRAW_APPEND`] attribute a persistent canvas
//! handle sends on an ordinary update op (append) — and land in the
//! [`CanvasSurface`]'s pending queue. Each frame, [`update_canvas_surfaces`]
//! drains the queue onto the retained pixmap at the node's laid-out pixel size.
//!
//! Like an HTML canvas whose `width`/`height` is set, a layout resize
//! **clears** the surface (the pixmap is recreated transparent and the raster
//! state resets) and the element sends its [`RESIZE`] event — unconditionally,
//! so the JS runtime can replay a declarative painter and keep the handle's
//! size fresh (a user `onResize` is called too). Fill/stroke styles, line
//! width, and the current path persist across drawing sessions until such a
//! reset, mirroring `CanvasRenderingContext2D`.
//!
//! Rasterization is **CPU-side** (via `tiny-skia`, through the core's
//! [`raster`](bevy_react_core::raster) helpers), so it is fully decoupled from
//! Bevy's render internals — the canvas is "an image we paint into". The
//! rasterizer is isolated in the display-list replay; a future GPU backend
//! could replace it without touching the protocol, the reconciler, or the JS
//! side.
//!
//! The JS half — the painter recording and the `<canvas ref>` handle
//! (`getContext()`) — lives in the `bevy-react` npm package: `<canvas>` is its
//! one documented kind-aware exception (a function-valued `draw` prop and an
//! imperative handle can't ride the generic prop wire).
//!
//! Apps normally get this crate through `bevy-react`'s `canvas` cargo feature
//! (on by default): `bevy_react::canvas`, with [`CanvasPlugin`] a `ReactPlugins`
//! member. Depending on this crate directly, add [`CanvasPlugin`] to an app that
//! also has `ReactUiPlugin` (any order):
//!
//! ```no_run
//! use bevy::prelude::*;
//! use bevy_react_canvas::CanvasPlugin;
//! use bevy_react_core::ReactUiPlugin;
//!
//! App::new()
//!     .add_plugins(DefaultPlugins)
//!     .add_plugins((ReactUiPlugin::new("ui/dist/app.js"), CanvasPlugin))
//!     .run();
//! ```
//!
//! Without the plugin a `<canvas>` in the React tree mounts as a plain node
//! and the bridge reports a `featureMissing` warning naming its feature and plugin.
//!
//! Everything here plugs into the core through its element registry
//! ([`bevy_react_core::element`]) and extension contract
//! ([`bevy_react_core::ext`]): [`CANVAS`] is a registered element with its two
//! act-now attributes, one writer ([`CANVAS_WRITER`]), and its `resize`
//! event; [`update_canvas_surfaces`] runs in the contract's
//! [`ElementRasterSet`](bevy_react_core::ext::ElementRasterSet) (after the op
//! drain, so a fresh surface and its queued commands paint the same frame),
//! and [`collect_canvas_resize_events`] after the op drain
//! ([`ReactApplySet`](bevy_react_core::ReactApplySet)).

use bevy::prelude::*;
use bevy_react_core::ReactAppExt;

mod draw;
mod element;
mod surface;

#[cfg(test)]
mod tests;

pub use draw::DrawCmd;
pub use element::{
    CANVAS, CANVAS_WRITER, CanvasSize, CanvasSizeTracker, DRAW, DRAW_APPEND, RESIZE,
    collect_canvas_resize_events,
};
pub use surface::{CanvasSurface, update_canvas_surfaces};

/// Registers the `<canvas>` element, its rasterizer, and its resize
/// reporter. Requires `ReactUiPlugin` in the same app (added in any order;
/// warned at `finish` when missing).
pub struct CanvasPlugin;

impl Plugin for CanvasPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_systems(
            Update,
            (
                update_canvas_surfaces.in_set(bevy_react_core::ext::ElementRasterSet),
                collect_canvas_resize_events.after(bevy_react_core::ReactApplySet),
            ),
        );
    }

    fn finish(&self, app: &mut App) {
        if !app.is_plugin_added::<bevy_react_core::ReactUiPlugin>() {
            tracing::warn!(
                target: "bevy_react",
                "bevy_react_canvas::CanvasPlugin is added but ReactUiPlugin is not: \
                 the <canvas> element has nothing to mount into"
            );
        }
    }
}

/// The element registration alone (no systems) — what the TypeScript
/// exporter and a headless op harness need.
pub fn register_bindings(app: &mut App) {
    app.add_react_element(&CANVAS);
}
