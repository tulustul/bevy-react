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
pub fn op_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (app, ops_tx, _root) = build_op_app(false, |_| {});
    (app, ops_tx)
}

/// [`op_app`] with a setup hook run before the bridge snapshots the feature
/// registry — where a feature crate's tests add their plugin
/// (`app.add_plugins(SvgPlugin)`), so its kinds and keys dispatch.
pub fn op_app_with(setup: impl FnOnce(&mut App)) -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (app, ops_tx, _root) = build_op_app(false, setup);
    (app, ops_tx)
}

/// [`op_app_manual_time`] with a setup hook (see [`op_app_with`]).
pub fn op_app_manual_time_with(
    setup: impl FnOnce(&mut App),
) -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (app, ops_tx, _root) = build_op_app(true, setup);
    (app, ops_tx)
}

/// [`op_app`] with `TimePlugin` swapped for a manually-advanced `Time` (the
/// `filters::test_util` precedent) — for tests that assert on eased values
/// at exact points along a transition.
pub fn op_app_manual_time() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (app, ops_tx, _root) = build_op_app(true, |_| {});
    (app, ops_tx)
}

/// [`op_app`] that also exposes the spawned UI root entity, for tests that
/// assert on the root's `Children`.
pub fn ordering_app() -> (App, crossbeam_channel::Sender<Vec<Op>>, Entity) {
    build_op_app(false, |_| {})
}

fn build_op_app(
    manual_time: bool,
    setup: impl FnOnce(&mut App),
) -> (App, crossbeam_channel::Sender<Vec<Op>>, Entity) {
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
    // The caller's feature registrations (a feature plugin's kinds/keys), then
    // the registry snapshot the bridge dispatches on and the thread-local
    // decode scope the test's own `serde_json::from_value` calls resolve
    // feature keys against. The core's style properties and writers first,
    // as `ReactUiPlugin` registers them.
    crate::style::add_core_styles(&mut app);
    setup(&mut app);
    let registry = crate::ext::ExtRegistry::from_app(&app);
    registry.styles().validate();
    crate::ext::set_thread_registry(std::sync::Arc::new(registry.clone()));
    let mut bridge = JsBridge::new(ops_rx, out_tx, root);
    bridge.ext = std::sync::Arc::new(registry);
    app.insert_resource(bridge);
    app.add_systems(Update, apply_js_ops);
    (app, ops_tx, root)
}

pub fn create_node(id: NodeId) -> Op {
    Op::Create {
        id,
        kind: "node".into(),
        props: Box::default(),
        text: None,
    }
}

/// A delta update: only the supplied fields are touched.
pub fn update_delta(id: NodeId, props: Props, unset: &[&str], style_unset: &[&str]) -> Op {
    Op::Update {
        id,
        props: Box::new(props),
        unset: unset.iter().map(|s| s.to_string()).collect(),
        style_unset: style_unset.iter().map(|s| s.to_string()).collect(),
    }
}

// Pass rotate as an explicit `rad` string so the asserted radian value is
// carried verbatim (a bare number would be read as degrees).
pub fn text_props(rotate: f32) -> Props {
    serde_json::from_value(serde_json::json!({
        "style": {
            "transform": { "rotate": format!("{rotate}rad") },
            "transition": { "transform": { "duration": 0.3 } },
        }
    }))
    .expect("valid text props")
}

/// The entity a node id resolved to.
pub fn ent(app: &App, id: NodeId) -> Entity {
    app.world().resource::<JsBridge>().nodes[&id]
}

/// The parent's children, in order.
pub fn children_of(app: &App, parent: Entity) -> Vec<Entity> {
    app.world()
        .entity(parent)
        .get::<Children>()
        .map(|c| c.iter().collect())
        .unwrap_or_default()
}
