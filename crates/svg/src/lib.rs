//! The JSX `<svg>` element for `bevy_react_core`: an `<svg>` root (a styled
//! node with an element-owned raster texture) whose picture is its eight
//! Node-less shape children (`<path>`, `<rect>`, `<circle>`, `<ellipse>`,
//! `<line>`, `<polyline>`, `<polygon>`, `<g>`), painted CPU-side (tiny-skia)
//! in `viewBox` user units, hit-tested per shape (kurbo), with per-shape
//! pointer events carrying user-space coordinates, `{ animated }` numeric
//! attrs, and a per-attr `transition`.
//!
//! Add [`SvgPlugin`] to an app that also has `ReactUiPlugin` (any order):
//!
//! ```no_run
//! use bevy::prelude::*;
//! use bevy_react_core::ReactUiPlugin;
//! use bevy_react_svg::SvgPlugin;
//!
//! App::new()
//!     .add_plugins(DefaultPlugins)
//!     .add_plugins((ReactUiPlugin::new("ui/dist/app.js"), SvgPlugin))
//!     .run();
//! ```
//!
//! Without the plugin an `<svg>` (or a shape) in the React tree mounts as a
//! plain node and the bridge reports a `featureMissing` warning naming this
//! crate. Rendering an `.svg` *file* is the core's `<image src="x.svg">`.
//!
//! Everything here plugs into the core through its element registry
//! ([`bevy_react_core::element`]) and extension contract
//! ([`bevy_react_core::ext`]): the nine elements are registered [`Element`]
//! statics ([`SVG_ELEMENTS`]) listing their attributes ([`attrs`] — one per
//! SVG attribute, `cx`/`fill`/`d`/…) and writers, the numeric attributes'
//! bindings ride the animation engine's publish slot, the shape transition
//! is the crate's own system on the engine's channel primitive, and the four
//! per-frame systems order by the contract's sets.
//!
//! [`Element`]: bevy_react_core::element::Element

use bevy::prelude::*;
use bevy_react_core::ReactAppExt;

mod animate;
pub mod attrs;
mod element;
mod hit;
pub(crate) mod interact;
mod paint;
pub(crate) mod pick;
mod protocol;
mod surface;
mod transition;
mod walk;

#[cfg(test)]
mod bindings_tests;
#[cfg(test)]
mod op_pointer_tests;
#[cfg(test)]
mod op_tests;
#[cfg(test)]
mod raster_tests;

pub use animate::apply_driven_shape_attrs;
pub use element::{
    CIRCLE, ELLIPSE, G, LINE, PATH, POLYGON, POLYLINE, RECT, SHAPE_WRITER, SVG, SVG_ELEMENTS,
    VIEW_BOX_WRITER,
};
#[cfg(test)]
pub(crate) use protocol::st;
pub use protocol::{
    FillRuleKind, LinecapKind, LinejoinKind, PathData, PathSeg, ShapeAttrs, ShapePaint,
    ShapeTransform, ShapeTransitionSpec, ViewBox,
};
pub(crate) use protocol::{NUMERIC_ATTR_COUNT, NUMERIC_ATTRS, numeric_attr, numeric_attr_mut};
pub use surface::{ShapeKind, SvgJsxSurface, SvgShape, node_scale_factor, update_jsx_svg_surfaces};
pub use transition::{ShapeTransitionState, apply_shape_transition, drive_shape_transitions};

/// Registers the `<svg>` element and its shape intrinsics (with their
/// attributes and writers), and the crate's per-frame systems. Requires
/// `ReactUiPlugin` in the same app (added in any order; warned at `finish`
/// when missing).
pub struct SvgPlugin;

impl Plugin for SvgPlugin {
    fn build(&self, app: &mut App) {
        register(app);
    }

    fn finish(&self, app: &mut App) {
        if !app.is_plugin_added::<bevy_react_core::ReactUiPlugin>() {
            warn!(
                target: "bevy_react",
                "bevy_react_svg::SvgPlugin is added but ReactUiPlugin is not: \
                 the <svg> element has nothing to mount into"
            );
        }
    }
}

/// The plugin's registrations: the bindings ([`register_bindings`]) plus
/// the per-frame systems ([`register_systems`]).
pub fn register(app: &mut App) {
    register_bindings(app);
    register_systems(app);
}

/// The elements alone — what a headless op harness (and the TypeScript
/// exporter) needs to mount an `<svg>` through the real op path (the systems
/// are added per test, against the harness's own schedule).
pub fn register_bindings(app: &mut App) {
    app.add_react_elements(SVG_ELEMENTS);
}

/// The crate's per-frame systems and their resources, ordered by the
/// contract's sets. Needs the core plugin's resources (`LayerContentDirt`,
/// picking's `PointerHits` messages) at run time.
pub fn register_systems(app: &mut App) {
    use bevy_react_core::ext::{ElementRasterSet, InteractionSyncSet, PickRefineSet};

    // Per-pointer refined svg shape hits — the picking refinement's
    // handoff to the Interaction/event synthesis.
    app.init_resource::<pick::SvgPointerShapeHits>();
    app.add_systems(
        PreUpdate,
        pick::refine_svg_pointer_hits.in_set(PickRefineSet),
    );
    // The crate's per-frame systems, ordered by the contract's sets: the
    // shape transition drive (after the op drain snapped the targets), the
    // driven-attr consumer (after the engine's publish), both before the
    // raster so a moving attr paints the same frame; the interaction
    // synthesis in its slot before styling and the event collectors.
    app.add_systems(
        Update,
        (
            transition::drive_shape_transitions
                .after(bevy_react_core::ReactApplySet)
                .before(ElementRasterSet),
            animate::apply_driven_shape_attrs
                .after(bevy_react_core::animations::AnimationSet::Apply)
                .before(ElementRasterSet),
            surface::update_jsx_svg_surfaces.in_set(ElementRasterSet),
            interact::sync_shape_interactions.in_set(InteractionSyncSet),
        ),
    );
}

/// The core's headless op app with this crate registered — what a JSX
/// `<svg>` needs to mount through the real op path.
#[cfg(test)]
pub(crate) fn test_app() -> (
    App,
    crossbeam_channel::Sender<Vec<bevy_react_core::protocol::op::Op>>,
) {
    bevy_react_core::test_util::op_app_with(register_bindings)
}

/// [`test_app`] with a manually-advanced `Time`.
#[cfg(test)]
pub(crate) fn test_app_manual_time() -> (
    App,
    crossbeam_channel::Sender<Vec<bevy_react_core::protocol::op::Op>>,
) {
    bevy_react_core::test_util::op_app_manual_time_with(register_bindings)
}
