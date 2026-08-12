//! Shared harnesses and op builders for the `reconcile` test suites.

use bevy::prelude::*;

use super::apply_js_ops;
use super::stats::OpApplyStats;
use crate::bridge::JsBridge;
use crate::plugin::Fonts;
use crate::protocol::{NodeId, op::Op, outbound::Outbound, props::Props};
use crate::ui_map::AtlasLayoutCache;

/// Spin up a minimal app wired to `apply_js_ops`, returning the app and the
/// op sender (the outbound receiver is leaked to keep the sender open).
pub(crate) fn op_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (app, ops_tx, _root) = build_op_app(false);
    (app, ops_tx)
}

/// [`op_app`] with `TimePlugin` swapped for a manually-advanced `Time` (the
/// `filters::test_util` precedent) — for tests that assert on eased values
/// at exact points along a transition.
pub(crate) fn op_app_manual_time() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (app, ops_tx, _root) = build_op_app(true);
    (app, ops_tx)
}

/// [`op_app`] that also exposes the spawned UI root entity, for tests that
/// assert on the root's `Children`.
pub(crate) fn ordering_app() -> (App, crossbeam_channel::Sender<Vec<Op>>, Entity) {
    build_op_app(false)
}

fn build_op_app(manual_time: bool) -> (App, crossbeam_channel::Sender<Vec<Op>>, Entity) {
    let mut app = App::new();
    if manual_time {
        app.add_plugins((
            MinimalPlugins.build().disable::<bevy::time::TimePlugin>(),
            AssetPlugin::default(),
        ));
        app.insert_resource(Time::<()>::default());
    } else {
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
    }
    app.init_asset::<Image>();
    app.init_asset::<TextureAtlasLayout>();
    // `<image src="*.svg">` (svg mode) requests an `SvgDocument`; mirror the
    // plugin's asset registration so those creates work in the harness.
    app.init_asset::<crate::svg::SvgDocument>();
    app.register_asset_loader(crate::svg::SvgAssetLoader);
    app.init_resource::<Fonts>();
    app.init_resource::<OpApplyStats>();
    app.init_resource::<AtlasLayoutCache>();
    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    std::mem::forget(out_rx); // keep the channel open for the test's lifetime
    let root = app.world_mut().spawn_empty().id();
    app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
    app.add_systems(Update, apply_js_ops);
    (app, ops_tx, root)
}

pub(crate) fn create_node(id: NodeId) -> Op {
    Op::Create {
        id,
        kind: "node".into(),
        props: Box::default(),
        text: None,
    }
}

/// A delta update: only the supplied fields are touched.
pub(crate) fn update_delta(id: NodeId, props: Props, unset: &[&str], style_unset: &[&str]) -> Op {
    Op::Update {
        id,
        props: Box::new(props),
        unset: unset.iter().map(|s| s.to_string()).collect(),
        style_unset: style_unset.iter().map(|s| s.to_string()).collect(),
    }
}

// Pass rotate as an explicit `rad` string so the asserted radian value is
// carried verbatim (a bare number would be read as degrees).
pub(crate) fn text_props(rotate: f32) -> Props {
    serde_json::from_value(serde_json::json!({
        "style": {
            "transform": { "rotate": format!("{rotate}rad") },
            "transition": { "transform": { "duration": 0.3 } },
        }
    }))
    .expect("valid text props")
}

/// The entity a node id resolved to.
pub(crate) fn ent(app: &App, id: NodeId) -> Entity {
    app.world().resource::<JsBridge>().nodes[&id]
}

/// The parent's children, in order.
pub(crate) fn children_of(app: &App, parent: Entity) -> Vec<Entity> {
    app.world()
        .entity(parent)
        .get::<Children>()
        .map(|c| c.iter().collect())
        .unwrap_or_default()
}
