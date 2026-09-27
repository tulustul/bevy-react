//! Per-property invalidation: a change re-captures a node's layer only when
//! a touched property declares `PAINT` — so composite-side changes (a
//! promoted root's opacity or translation, a filter chain) and non-visual
//! ones (`cursor`, `focusPolicy`) keep the capture cached.

use bevy::prelude::*;
use bevy::ui::FocusPolicy;

use crate::bridge::JsBridge;
use crate::layer::{LayerContentDirt, PromotedLayer, PromotionReasons};
use crate::protocol::op::Op;
use crate::protocol::props::Props;
use crate::reconcile::test_util::{ent, op_app, update_delta};

fn props(json: serde_json::Value) -> Props {
    serde_json::from_value(json).expect("valid props")
}

/// An op app with the hover restyle and a layer-dirt inbox, one node
/// created from `json` (id 1), its create-time dirt cleared.
fn app_with(json: serde_json::Value) -> (App, crossbeam_channel::Sender<Vec<Op>>, Entity) {
    let (mut app, ops_tx) = op_app();
    app.init_resource::<LayerContentDirt>();
    app.add_systems(
        Update,
        crate::reconcile::apply_interaction_styles.after(crate::reconcile::apply_js_ops),
    );
    ops_tx
        .send(vec![Op::Create {
            id: 1,
            kind: "node".into(),
            props: Box::new(props(json)),
            text: None,
        }])
        .unwrap();
    app.update();
    let e = ent(&app, 1);
    clear_dirt(&mut app);
    (app, ops_tx, e)
}

fn clear_dirt(app: &mut App) {
    let mut dirt = app.world_mut().resource_mut::<LayerContentDirt>();
    dirt.nodes.clear();
    dirt.composite_only.clear();
}

fn dirtied(app: &App, e: Entity) -> bool {
    app.world()
        .resource::<LayerContentDirt>()
        .nodes
        .contains(&e)
}

/// Mark node 1 a promoted layer root, as the evaluator would.
fn promote(app: &mut App, e: Entity) {
    app.world_mut()
        .resource_mut::<JsBridge>()
        .promoted_layers
        .insert(1);
    app.world_mut().entity_mut(e).insert(PromotedLayer {
        reasons: PromotionReasons(PromotionReasons::FORCED),
    });
}

fn hover(app: &mut App, e: Entity) {
    app.world_mut().entity_mut(e).insert(Interaction::Hovered);
    app.update();
}

#[test]
fn hover_changing_only_the_cursor_keeps_the_capture() {
    let (mut app, _tx, e) = app_with(serde_json::json!({ "hoverStyle": { "cursor": "pointer" } }));
    hover(&mut app, e);
    assert!(!dirtied(&app, e));
}

#[test]
fn hover_changing_only_the_filter_keeps_the_capture() {
    let (mut app, _tx, e) = app_with(serde_json::json!({
        "style": { "filter": { "name": "blur", "params": { "radius": 1 } } },
        "hoverStyle": { "filter": { "name": "blur", "params": { "radius": 4 } } },
    }));
    hover(&mut app, e);
    assert!(!dirtied(&app, e));
}

/// `focusPolicy` is carried by variants now (every property is), and it
/// changes hit-testing, not pixels.
#[test]
fn hover_focus_policy_applies_without_repaint() {
    let (mut app, _tx, e) =
        app_with(serde_json::json!({ "hoverStyle": { "focusPolicy": "block" } }));
    hover(&mut app, e);
    assert_eq!(
        app.world().entity(e).get::<FocusPolicy>(),
        Some(&FocusPolicy::Block)
    );
    assert!(!dirtied(&app, e));
}

#[test]
fn hover_recolor_repaints() {
    let (mut app, _tx, e) =
        app_with(serde_json::json!({ "hoverStyle": { "backgroundColor": "red" } }));
    hover(&mut app, e);
    assert!(dirtied(&app, e));
}

/// On a promoted root, opacity is the layer's group alpha — composite-time.
#[test]
fn opacity_delta_on_a_promoted_root_is_composite_only() {
    let (mut app, ops_tx, e) = app_with(serde_json::json!({ "style": { "opacity": 1.0 } }));
    promote(&mut app, e);
    ops_tx
        .send(vec![update_delta(
            1,
            props(serde_json::json!({ "style": { "opacity": 0.5 } })),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    assert!(!dirtied(&app, e));
    assert_eq!(
        app.world()
            .entity(e)
            .get::<crate::layer::LayerGroupAlpha>()
            .map(|a| a.0),
        Some(0.5)
    );
}

/// …while on an ordinary node it folds into the colors: a repaint.
#[test]
fn opacity_delta_on_a_plain_node_repaints() {
    let (mut app, ops_tx, e) = app_with(serde_json::json!({ "style": { "opacity": 1.0 } }));
    ops_tx
        .send(vec![update_delta(
            1,
            props(serde_json::json!({ "style": { "opacity": 0.5 } })),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    assert!(dirtied(&app, e));
}

/// A promoted root's translation moves its quad; a scale changes pixels.
#[test]
fn translate_only_on_a_promoted_root_is_composite_only() {
    let (mut app, ops_tx, e) = app_with(serde_json::json!({
        "style": { "transform": { "translateX": 0 } }
    }));
    promote(&mut app, e);
    ops_tx
        .send(vec![update_delta(
            1,
            props(serde_json::json!({ "style": { "transform": { "translateX": 40 } } })),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    assert!(!dirtied(&app, e), "translation is composite-time");

    ops_tx
        .send(vec![update_delta(
            1,
            props(serde_json::json!({
                "style": { "transform": { "translateX": 40, "scale": 2 } }
            })),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    assert!(dirtied(&app, e), "a scale repaints");
}

/// `cache` in a variant promotes at mount — promotion unions every state, so
/// a hover never flips it.
#[test]
fn cache_in_a_hover_variant_promotes() {
    let p = props(serde_json::json!({ "hoverStyle": { "cache": "always" } }));
    let reasons = crate::layer::promotion_reasons(&p, 0, false);
    assert!(reasons.0 & PromotionReasons::FORCED != 0);
}
