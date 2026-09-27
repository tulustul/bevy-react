//! Regression tests for behavior the writer split fixed by construction:
//! each writer now sees the element kind, promotion, and text-ness at every
//! call site (create, update, hover/press restyle), where the old per-site
//! arms each covered a different subset.

use bevy::picking::Pickable;
use bevy::prelude::*;
use bevy::text::TextCursorStyle;
use bevy::ui::FocusPolicy;
use bevy::ui::widget::ImageNode;

use crate::layer::LayerContentDirt;
use crate::protocol::op::Op;
use crate::protocol::props::Props;
use crate::reconcile::test_util::{ent, op_app, update_delta};
use crate::ui_map::parse_color;

fn props(json: serde_json::Value) -> Props {
    serde_json::from_value(json).expect("valid props")
}

fn create(id: u32, kind: &str, json: serde_json::Value) -> Op {
    Op::Create {
        id,
        kind: kind.into(),
        props: Props::decode_for(kind, json),
        text: None,
    }
}

/// A `<button>` with hover/press variants and no explicit `focusPolicy`
/// keeps capturing the pointer across a hover flip: the restyle re-runs the
/// focus-policy writer, whose default follows the element kind. (The old
/// restyle wrote the `Pass` default and only the update path re-asserted a
/// button's `Block`.)
#[test]
fn button_keeps_block_focus_across_hover() {
    let (mut app, ops_tx) = op_app();
    app.add_systems(
        Update,
        crate::reconcile::apply_interaction_styles.after(crate::reconcile::apply_js_ops),
    );
    ops_tx
        .send(vec![create(
            1,
            "button",
            serde_json::json!({ "hoverStyle": { "backgroundColor": "red" } }),
        )])
        .unwrap();
    app.update();
    let button = ent(&app, 1);
    app.world_mut()
        .entity_mut(button)
        .insert(Interaction::Hovered);
    app.update();
    let entity = app.world().entity(button);
    assert_eq!(entity.get::<FocusPolicy>(), Some(&FocusPolicy::Block));
    assert!(
        entity
            .get::<Pickable>()
            .is_some_and(|p| p.should_block_lower),
        "the picking mirror follows the button default"
    );
}

/// A `<root>` never blocks or hovers picking itself — also after an update
/// that re-runs the focus-policy writer (the create path inserted
/// `Pickable::IGNORE` once; a `focusPolicy` delta used to overwrite it).
#[test]
fn root_stays_unpickable_after_focus_policy_update() {
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![create(1, "root", serde_json::json!({}))])
        .unwrap();
    app.update();
    ops_tx
        .send(vec![update_delta(
            1,
            props(serde_json::json!({ "style": { "focusPolicy": "pass" } })),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    let root = ent(&app, 1);
    assert_eq!(
        app.world().entity(root).get::<Pickable>(),
        Some(&Pickable::IGNORE)
    );
}

/// An `editableText`'s color and font follow a re-render (they used to be
/// written at create only), and its caret keeps following the text color.
#[test]
fn editable_text_applies_color_and_font_updates() {
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![create(
            1,
            "editableText",
            serde_json::json!({ "style": { "color": "red", "fontSize": 12 } }),
        )])
        .unwrap();
    app.update();
    ops_tx
        .send(vec![update_delta(
            1,
            props(serde_json::json!({ "style": { "color": "blue", "fontSize": 30 } })),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    let entity = app.world().entity(ent(&app, 1));
    assert_eq!(
        entity.get::<TextColor>().map(|c| c.0),
        Some(parse_color("blue"))
    );
    assert_eq!(
        entity.get::<TextCursorStyle>().map(|c| c.color),
        Some(parse_color("blue")),
        "the caret follows the text color"
    );
    let font = entity.get::<TextFont>().expect("font");
    assert_eq!(font.font_size, bevy::text::FontSize::Px(30.0));
}

/// An `<image>`'s own `ImageNode` folds `opacity` into its tint; an
/// opacity-only re-render re-folds it (it used to wait for an image-attr
/// change).
#[test]
fn image_refolds_opacity_on_opacity_delta() {
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![create(
            1,
            "image",
            serde_json::json!({ "style": { "opacity": 1.0 } }),
        )])
        .unwrap();
    app.update();
    ops_tx
        .send(vec![update_delta(
            1,
            props(serde_json::json!({ "style": { "opacity": 0.5 } })),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    let image = app.world().entity(ent(&app, 1)).get::<ImageNode>().unwrap();
    assert!(
        (image.color.alpha() - 0.5).abs() < 1e-5,
        "opacity re-folded into the tint, got {}",
        image.color.alpha()
    );
}

/// …and a hover variant's `opacity` re-folds it too.
#[test]
fn image_refolds_opacity_on_hover() {
    let (mut app, ops_tx) = op_app();
    app.add_systems(
        Update,
        crate::reconcile::apply_interaction_styles.after(crate::reconcile::apply_js_ops),
    );
    ops_tx
        .send(vec![create(
            1,
            "image",
            serde_json::json!({ "tint": "red", "hoverStyle": { "opacity": 0.25 } }),
        )])
        .unwrap();
    app.update();
    let image = ent(&app, 1);
    app.world_mut()
        .entity_mut(image)
        .insert(Interaction::Hovered);
    app.update();
    let color = app.world().entity(image).get::<ImageNode>().unwrap().color;
    assert!(
        (color.alpha() - 0.25).abs() < 1e-5,
        "alpha {}",
        color.alpha()
    );
    assert_eq!(
        color.with_alpha(1.0),
        parse_color("red"),
        "the tint survives the re-fold"
    );
}

/// A nested `<text>` span's recolor tells the layer cache its pixels
/// changed (it used to push no content dirt: spans skipped the styled
/// apply, and with it the cache tap).
#[test]
fn span_recolor_pushes_layer_content_dirt() {
    let (mut app, ops_tx) = op_app();
    app.init_resource::<LayerContentDirt>();
    ops_tx
        .send(vec![
            create(1, "text", serde_json::json!({})),
            create(
                2,
                "textSpan",
                serde_json::json!({ "style": { "color": "red" } }),
            ),
            Op::Append {
                parent: 1,
                child: 2,
            },
        ])
        .unwrap();
    app.update();
    app.world_mut()
        .resource_mut::<LayerContentDirt>()
        .nodes
        .clear();
    ops_tx
        .send(vec![update_delta(
            2,
            props(serde_json::json!({ "style": { "color": "blue" } })),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    let span = ent(&app, 2);
    assert!(
        app.world()
            .resource::<LayerContentDirt>()
            .nodes
            .contains(&span),
        "the recolored span is content dirt"
    );
    assert_eq!(
        app.world().entity(span).get::<TextColor>().map(|c| c.0),
        Some(parse_color("blue"))
    );
}
