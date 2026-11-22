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
        .insert(crate::ReactInteraction::Hovered);
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
        .insert(crate::ReactInteraction::Hovered);
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

/// `positionType: "fixed"` stamps the request marker next to an absolute
/// `Node` — on create (the layout writer rides the spawn bundle; this one
/// does not), on an update either way, through a hover variant — and never
/// on a detached element, where it means absolute.
#[test]
fn position_fixed_writer_stamps_and_clears() {
    use crate::fixed::PositionFixed;
    let (mut app, ops_tx) = op_app();
    app.add_systems(
        Update,
        crate::reconcile::apply_interaction_styles.after(crate::reconcile::apply_js_ops),
    );
    let style = |position: &str| serde_json::json!({ "style": { "positionType": position } });
    ops_tx
        .send(vec![
            create(1, "node", style("fixed")),
            create(2, "root", style("fixed")),
            create(
                3,
                "node",
                serde_json::json!({ "hoverStyle": { "positionType": "fixed" } }),
            ),
        ])
        .unwrap();
    app.update();
    let marked = |app: &App, id| app.world().entity(ent(app, id)).contains::<PositionFixed>();
    let position = |app: &App, id| {
        let node = app.world().entity(ent(app, id)).get::<Node>().unwrap();
        node.position_type
    };
    assert!(marked(&app, 1));
    assert_eq!(position(&app, 1), PositionType::Absolute);
    assert!(!marked(&app, 2), "a <root> already fills its viewport");
    assert_eq!(position(&app, 2), PositionType::Absolute);
    assert!(!marked(&app, 3));

    let hovered = ent(&app, 3);
    for (state, fixed) in [
        (crate::ReactInteraction::Hovered, true),
        (crate::ReactInteraction::None, false),
    ] {
        app.world_mut().entity_mut(hovered).insert(state);
        app.update();
        assert_eq!(marked(&app, 3), fixed, "{state:?}");
    }

    for (position_type, fixed) in [("absolute", false), ("fixed", true)] {
        ops_tx
            .send(vec![update_delta(1, props(style(position_type)), &[], &[])])
            .unwrap();
        app.update();
        assert_eq!(marked(&app, 1), fixed, "{position_type}");
        assert_eq!(position(&app, 1), PositionType::Absolute);
    }
    ops_tx
        .send(vec![update_delta(
            1,
            Props::default(),
            &[],
            &["positionType"],
        )])
        .unwrap();
    app.update();
    assert!(!marked(&app, 1));
    assert_eq!(position(&app, 1), PositionType::Relative);
}

/// An `{ animated }` opacity multiplies the colors' own alphas instead of
/// replacing them: a `<text>` with no background stays without one (it used
/// to get a dark box — transparent black at the opacity's alpha), and a
/// translucent text color keeps its share.
#[test]
fn animated_opacity_multiplies_the_colors_own_alpha() {
    use crate::animations::SharedValues;
    let (mut app, ops_tx) = crate::reconcile::test_util::op_app_with(|app| {
        app.init_resource::<LayerContentDirt>();
        let mut values = SharedValues::default();
        values.set(1, 0.5);
        app.insert_resource(values);
        app.add_systems(
            Update,
            crate::animations::apply_animated_nodes.after(crate::reconcile::apply_js_ops),
        );
    });
    ops_tx
        .send(vec![create(
            1,
            "text",
            serde_json::json!({ "style": {
                "color": "rgba(255, 255, 255, 0.8)",
                "opacity": { "animated": { "id": 1 } },
            } }),
        )])
        .unwrap();
    app.update();
    app.update();
    let text = app.world().entity(ent(&app, 1));
    assert_eq!(text.get::<BackgroundColor>().unwrap().0.alpha(), 0.0);
    let alpha = text.get::<TextColor>().unwrap().0.alpha();
    assert!((alpha - 0.4).abs() < 1e-5, "0.8 × 0.5, got {alpha}");
}
