//! Shared harnesses and op builders for the `filters` test suites.

use bevy::prelude::*;
use bevy::shader::Shader;

use super::backdrop::{BackdropInput, ResolvedBackdropChain};
use super::builtin::register_builtin_filters;
use super::morph::{MorphInput, ResolvedMorphChain};
use super::registry::FilterRegistry;
use super::resolve::{FilterInput, ResolvedFilterChain, resolve_chains};
use crate::bridge::JsBridge;
use crate::layer::LayerContentDirt;
use crate::protocol::{NodeId, op::Op, outbound::Outbound, props::Props};

/// A headless app that owns a real `AssetServer` for `resolve` calls,
/// with the `Shader` asset + the crate's embedded filter shaders
/// registered (no render sub-app) so `ReactFilter::shader` loads resolve
/// to real embedded handles.
pub(crate) fn asset_app() -> App {
    let mut app = App::new();
    app.add_plugins((MinimalPlugins, AssetPlugin::default()));
    app.init_asset::<Shader>()
        .register_asset_loader(bevy::shader::ShaderLoader);
    crate::plugin::register_layer_shader_assets(&mut app);
    app
}

/// Decode a filter's params from JSON, panicking on mismatch.
pub(crate) fn params<T: serde::de::DeserializeOwned>(value: serde_json::Value) -> T {
    serde_json::from_value(value).expect("params decode")
}

/// A standalone registry seeded with the eight built-ins.
pub(crate) fn builtin_registry() -> FilterRegistry {
    let mut r = FilterRegistry::default();
    r.register_builtins();
    r
}

pub(crate) fn op_props(json: serde_json::Value) -> Props {
    serde_json::from_value(json).expect("valid props")
}

pub(crate) fn create(id: NodeId, json: serde_json::Value) -> Op {
    Op::Create {
        id,
        kind: "node".into(),
        props: Box::new(op_props(json)),
        text: None,
    }
}

pub(crate) fn create_kind(id: NodeId, kind: &str, json: serde_json::Value) -> Op {
    Op::Create {
        id,
        kind: kind.into(),
        props: Box::new(op_props(json)),
        text: None,
    }
}

pub(crate) fn update(id: NodeId, json: serde_json::Value, style_unset: &[&str]) -> Op {
    Op::Update {
        id,
        props: Box::new(op_props(json)),
        unset: vec![],
        style_unset: style_unset.iter().map(|s| s.to_string()).collect(),
    }
}

pub(crate) fn entity_of(app: &App, id: NodeId) -> Entity {
    *app.world().resource::<JsBridge>().nodes.get(&id).unwrap()
}

pub(crate) fn drain_dirt(app: &mut App) {
    let mut dirt = app.world_mut().resource_mut::<LayerContentDirt>();
    dirt.nodes.clear();
    dirt.composite_only.clear();
}

/// Advance the manual clock and run one frame.
pub(crate) fn tick(app: &mut App, secs: f32) {
    app.world_mut()
        .resource_mut::<Time>()
        .advance_by(std::time::Duration::from_secs_f32(secs));
    app.update();
}

/// Everything [`resolve_app`] and [`ease_app`] share: [`asset_app`]'s shader
/// machinery, the UI-side resources the op-apply path needs, the built-in
/// filter registry, and a `JsBridge` wired to a fresh ops channel. The system
/// schedule is the caller's; `manual_time` swaps `TimePlugin` for a manually
/// advanced `Time` (see [`tick`]) so eases step deterministically.
fn op_app(manual_time: bool) -> (App, crossbeam_channel::Sender<Vec<Op>>) {
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
    app.init_asset::<Shader>()
        .register_asset_loader(bevy::shader::ShaderLoader);
    crate::plugin::register_layer_shader_assets(&mut app);
    app.init_asset::<Image>();
    app.init_asset::<bevy::image::TextureAtlasLayout>();
    app.init_resource::<crate::plugin::Fonts>();
    app.init_resource::<crate::reconcile::OpApplyStats>();
    app.init_resource::<crate::ui_map::AtlasLayoutCache>();
    app.init_resource::<crate::layer::LayersRegistry>();
    app.init_resource::<crate::layer::LayerMembership>();
    app.init_resource::<LayerContentDirt>();
    register_builtin_filters(&mut app);

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    std::mem::forget(out_rx);
    let root = app.world_mut().spawn_empty().id();
    app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
    (app, ops_tx)
}

/// The smallest app that runs `apply_js_ops` → `evaluate_layer_promotions`
/// → [`resolve_chains`] (all three instances) in order: `layer.rs`'s op
/// harness plus the `Shader` asset machinery of [`asset_app`] (real embedded
/// handles) and the built-in filter registry.
pub(crate) fn resolve_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (mut app, ops_tx) = op_app(false);
    app.add_systems(
        Update,
        (
            crate::reconcile::apply_js_ops,
            crate::layer::evaluate_layer_promotions.after(crate::reconcile::apply_js_ops),
            (
                resolve_chains::<FilterInput, ResolvedFilterChain>,
                resolve_chains::<BackdropInput, ResolvedBackdropChain>,
                resolve_chains::<MorphInput, ResolvedMorphChain>,
            )
                .after(crate::layer::evaluate_layer_promotions),
        ),
    );
    (app, ops_tx)
}

/// [`resolve_app`] plus the transition engine: the interaction restyle
/// (`apply_interaction_styles`, the last chain-input writer) and
/// `drive_transitions` run after [`resolve_chains`]'s inputs in
/// the plugin's ordering, with `TimePlugin` disabled in favor of a
/// manually advanced `Time` so eases step deterministically.
pub(crate) fn ease_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (mut app, ops_tx) = op_app(true);
    app.add_systems(
        Update,
        (
            crate::reconcile::apply_js_ops,
            crate::layer::evaluate_layer_promotions.after(crate::reconcile::apply_js_ops),
            crate::reconcile::apply_interaction_styles
                .after(crate::layer::evaluate_layer_promotions),
            (
                resolve_chains::<FilterInput, ResolvedFilterChain>,
                resolve_chains::<BackdropInput, ResolvedBackdropChain>,
                resolve_chains::<MorphInput, ResolvedMorphChain>,
            )
                .in_set(ResolveSet)
                .after(crate::reconcile::apply_interaction_styles),
            crate::transition::drive_transitions.after(ResolveSet),
        ),
    );
    (app, ops_tx)
}

/// Label for the resolver pair so downstream test systems can order after
/// both instances at once.
#[derive(bevy::ecs::schedule::SystemSet, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub(crate) struct ResolveSet;

/// [`ease_app`] plus the animations engine, `AnimationSet::Apply` ordered
/// after [`resolve_chains`] like the plugin does — the ops →
/// promotion → resolve → per-param-binding-apply pipeline.
pub(crate) fn anim_app() -> (
    App,
    crossbeam_channel::Sender<Vec<Op>>,
    crossbeam_channel::Sender<crate::animations::AnimationCommand>,
) {
    let (mut app, ops_tx) = ease_app();
    let (anim_tx, anim_rx) = crossbeam_channel::unbounded();
    app.add_plugins(crate::animations::ReactUiAnimationsPlugin::new(anim_rx));
    app.configure_sets(
        Update,
        crate::animations::AnimationSet::Apply
            .after(ResolveSet)
            .after(crate::reconcile::apply_js_ops),
    );
    (app, ops_tx, anim_tx)
}
