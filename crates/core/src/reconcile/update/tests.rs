use std::f32::consts::PI;

use super::super::test_util::{op_app, text_props, update_delta};
use super::*;
use crate::bridge::PointerHandlers;
use crate::protocol::op::Op;
use crate::transition::TransitionInput;

/// A `<text>` root's `transform`/`transition` must update on re-render — not
/// just at mount. Regression: the text-update branch skipped `apply_style`, so
/// a rotating chevron's target never changed and the animation never ran.
#[test]
fn text_update_reapplies_transform_target() {
    let (mut app, ops_tx) = op_app();

    // Mount a `<text>` with rotate 0.
    ops_tx
        .send(vec![Op::Create {
            id: 1,
            kind: "text".into(),
            props: Box::new(text_props(0.0)),
            text: None,
        }])
        .unwrap();
    app.update();
    let e = app.world().resource::<JsBridge>().nodes[&1];
    assert_eq!(
        app.world()
            .entity(e)
            .get::<TransitionInput>()
            .unwrap()
            .rotate,
        Some(0.0),
        "create stamps the initial transform target"
    );

    // Re-render with rotate π — the transition target must follow.
    ops_tx
        .send(vec![update_delta(1, text_props(PI), &[], &[])])
        .unwrap();
    app.update();
    assert_eq!(
        app.world()
            .entity(e)
            .get::<TransitionInput>()
            .unwrap()
            .rotate,
        Some(PI),
        "a text re-render must refresh the transform target so it animates"
    );
}

/// A delta update touching only `width` must leave every other derived
/// component untouched — not merely re-inserted-equal, but with its change
/// tick intact (re-insertion would re-extract paint and re-run the
/// interaction restyle via `Changed<StyleVariants>`).
#[test]
fn delta_update_skips_untouched_writers() {
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![Op::Create {
            id: 1,
            kind: "node".into(),
            props: serde_json::from_value(serde_json::json!({
                "style": {
                    "backgroundColor": "red",
                    "width": 10,
                    "outline": { "color": "white" },
                },
                "hoverStyle": { "backgroundColor": "blue" },
                "onClick": true,
            }))
            .unwrap(),
            text: None,
        }])
        .unwrap();
    app.update();

    let e = app.world().resource::<JsBridge>().nodes[&1];
    let paint_ticks = |app: &App| {
        let entity = app.world().entity(e);
        (
            entity
                .get_change_ticks::<BackgroundColor>()
                .unwrap()
                .changed,
            entity.get_change_ticks::<Outline>().unwrap().changed,
        )
    };
    let variants_tick = |app: &App| {
        app.world()
            .entity(e)
            .get_change_ticks::<StyleVariants>()
            .unwrap()
            .changed
    };
    let ticks_before = paint_ticks(&app);

    ops_tx
        .send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({ "style": { "width": 100 } })).unwrap(),
            &[],
            &[],
        )])
        .unwrap();
    app.update();

    {
        let entity = app.world().entity(e);
        assert_eq!(
            entity.get::<Node>().unwrap().width,
            Val::Px(100.0),
            "the delta's own field must apply"
        );
        assert_eq!(
            entity.get::<BackgroundColor>().unwrap().0,
            crate::ui_map::parse_color("red"),
            "untouched background survives a width-only delta"
        );
        assert!(
            entity.get::<StyleVariants>().is_some(),
            "variants survive (base mirrors the style, so it was rebuilt)"
        );
        assert!(
            entity.get::<Interaction>().is_some(),
            "the onClick Interaction survives"
        );
    }
    assert_eq!(
        ticks_before,
        paint_ticks(&app),
        "untouched paint components must not even be marked changed"
    );

    // A non-style delta (a handler toggle) must not touch `StyleVariants`
    // at all — re-inserting it would trigger a full interaction restyle
    // via `Changed<StyleVariants>` on every unrelated update.
    let tick_before = variants_tick(&app);
    ops_tx
        .send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({ "onPointerDown": true })).unwrap(),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    assert_eq!(
        tick_before,
        variants_tick(&app),
        "a handler-only delta must not re-insert StyleVariants"
    );
}

/// `styleUnset` removes exactly the named field's component; the rest of
/// the merged style (and unrelated props) stay.
#[test]
fn delta_style_unset_removes_component() {
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![Op::Create {
            id: 1,
            kind: "node".into(),
            props: serde_json::from_value(serde_json::json!({
                "style": { "backgroundColor": "red", "width": 10 },
            }))
            .unwrap(),
            text: None,
        }])
        .unwrap();
    app.update();
    let e = app.world().resource::<JsBridge>().nodes[&1];
    assert!(app.world().entity(e).get::<BackgroundColor>().is_some());

    ops_tx
        .send(vec![update_delta(
            1,
            Props::default(),
            &[],
            &["backgroundColor"],
        )])
        .unwrap();
    app.update();

    let entity = app.world().entity(e);
    assert_eq!(
        entity.get::<BackgroundColor>(),
        Some(&BackgroundColor::DEFAULT),
        "an unset style field resets its component (a `Node`-required one lands the default)"
    );
    assert_eq!(
        entity.get::<Node>().unwrap().width,
        Val::Px(10.0),
        "the retained width survives the unset"
    );
}

/// `styleUnset: ["backgroundImage"]` removes the `ImageNode` and both
/// marker components; a delta swapping a `{ texture }` source for a path
/// drops the stale `RBackgroundTexture` (or the bind system would stomp
/// the asset handle).
#[test]
fn background_image_unset_and_source_swap() {
    use crate::background_image::{BackgroundTileScale, RBackgroundTexture};
    use bevy::ui::widget::ImageNode;
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![Op::Create {
            id: 1,
            kind: "node".into(),
            props: serde_json::from_value(serde_json::json!({
                "style": { "backgroundImage": {
                    "src": { "texture": "minimap" }, "mode": "repeat"
                } }
            }))
            .unwrap(),
            text: None,
        }])
        .unwrap();
    app.update();
    let e = app.world().resource::<JsBridge>().nodes[&1];
    assert!(app.world().entity(e).get::<RBackgroundTexture>().is_some());
    assert!(app.world().entity(e).get::<BackgroundTileScale>().is_some());

    // texture → path source swap: marker (and tile scale, mode now
    // defaults to stretch) must go; the ImageNode stays.
    ops_tx
        .send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({
                "style": { "backgroundImage": { "src": "images/bg.png" } }
            }))
            .unwrap(),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    let entity = app.world().entity(e);
    assert!(
        entity.get::<RBackgroundTexture>().is_none(),
        "a path source drops the stale texture marker"
    );
    assert!(entity.get::<BackgroundTileScale>().is_none());
    assert!(entity.get::<ImageNode>().is_some());

    ops_tx
        .send(vec![update_delta(
            1,
            Props::default(),
            &[],
            &["backgroundImage"],
        )])
        .unwrap();
    app.update();
    let entity = app.world().entity(e);
    assert!(
        entity.get::<ImageNode>().is_none(),
        "unsetting backgroundImage removes the ImageNode"
    );
    assert!(entity.get::<BackgroundTileScale>().is_none());
}

/// An opacity-only delta re-folds the background image's tint alpha (the
/// `opacity` table row carries `BG_IMAGE`), and a delta on a `<canvas>`
/// leaves its element-owned `ImageNode` untouched.
#[test]
fn background_image_opacity_refold_and_canvas_guard() {
    use bevy::ui::widget::ImageNode;
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![
            Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "style": { "backgroundImage": {
                        "src": "images/bg.png", "tint": "#ffffff"
                    } }
                }))
                .unwrap(),
                text: None,
            },
            Op::Create {
                id: 2,
                kind: "canvas".into(),
                props: serde_json::from_value(serde_json::json!({})).unwrap(),
                text: None,
            },
        ])
        .unwrap();
    app.update();
    let bridge = app.world().resource::<JsBridge>();
    let (e1, e2) = (bridge.nodes[&1], bridge.nodes[&2]);
    assert_eq!(
        app.world()
            .entity(e1)
            .get::<ImageNode>()
            .unwrap()
            .color
            .alpha(),
        1.0
    );
    let canvas_handle = app
        .world()
        .entity(e2)
        .get::<ImageNode>()
        .unwrap()
        .image
        .clone();

    ops_tx
        .send(vec![
            update_delta(
                1,
                serde_json::from_value(serde_json::json!({ "style": { "opacity": 0.5 } })).unwrap(),
                &[],
                &[],
            ),
            // A backgroundImage delta on the canvas must not retarget its
            // element-owned texture.
            update_delta(
                2,
                serde_json::from_value(serde_json::json!({
                    "style": { "backgroundImage": { "src": { "texture": "x" } } }
                }))
                .unwrap(),
                &[],
                &[],
            ),
        ])
        .unwrap();
    app.update();
    assert_eq!(
        app.world()
            .entity(e1)
            .get::<ImageNode>()
            .unwrap()
            .color
            .alpha(),
        0.5,
        "an opacity-only delta re-folds the background tint"
    );
    assert_eq!(
        app.world().entity(e2).get::<ImageNode>().unwrap().image,
        canvas_handle,
        "the canvas keeps its own texture despite the ignored style"
    );
}

/// Explicit unsets are the delta's "reset" mechanism: `styleUnset` drops
/// the style field's component, `unset` drops a whole prop (here the last
/// variant style, which must remove `StyleVariants` from the entity).
#[test]
fn delta_unsets_reset_absent_fields() {
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![Op::Create {
            id: 1,
            kind: "node".into(),
            props: serde_json::from_value(serde_json::json!({
                "style": { "backgroundColor": "red" },
                "hoverStyle": { "backgroundColor": "blue" },
            }))
            .unwrap(),
            text: None,
        }])
        .unwrap();
    app.update();
    let e = app.world().resource::<JsBridge>().nodes[&1];
    assert!(app.world().entity(e).get::<StyleVariants>().is_some());

    ops_tx
        .send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({ "style": { "width": 5 } })).unwrap(),
            &["hoverStyle"],
            &["backgroundColor"],
        )])
        .unwrap();
    app.update();

    let entity = app.world().entity(e);
    assert_eq!(
        entity.get::<BackgroundColor>(),
        Some(&BackgroundColor::DEFAULT),
        "styleUnset resets the background"
    );
    assert!(
        entity.get::<StyleVariants>().is_none(),
        "unsetting the last variant style removes StyleVariants"
    );
    assert_eq!(
        entity.get::<Node>().unwrap().width,
        Val::Px(5.0),
        "the delta's own field still applies"
    );
}

/// An unrelated delta on a controlled-scroll node must not touch the
/// scroll offset (event-like props are never replayed from the cache).
#[test]
fn delta_update_does_not_replay_controlled_scroll() {
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![Op::Create {
            id: 1,
            kind: "node".into(),
            props: serde_json::from_value(serde_json::json!({
                "scrollTop": 40.0,
                "style": { "overflowY": "scroll" },
            }))
            .unwrap(),
            text: None,
        }])
        .unwrap();
    app.update();
    let e = app.world().resource::<JsBridge>().nodes[&1];
    // Simulate the user scrolling away from the controlled value.
    app.world_mut()
        .entity_mut(e)
        .get_mut::<ScrollPosition>()
        .unwrap()
        .0 = Vec2::new(0.0, 7.0);

    ops_tx
        .send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({ "style": { "width": 50 } })).unwrap(),
            &[],
            &[],
        )])
        .unwrap();
    app.update();

    assert_eq!(
        app.world().entity(e).get::<ScrollPosition>().unwrap().0,
        Vec2::new(0.0, 7.0),
        "a width-only delta must not re-push the cached scrollTop"
    );
}

/// On a `<text>` with inheriting bare-string spans, a transform-only delta
/// must skip the O(children) span re-propagation (their tick stays), while
/// a `color` delta re-propagates.
#[test]
fn text_delta_gates_span_repropagation() {
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![
            Op::Create {
                id: 1,
                kind: "text".into(),
                props: serde_json::from_value(serde_json::json!({
                    "style": { "color": "red" },
                }))
                .unwrap(),
                text: None,
            },
            Op::CreateTextSpan {
                id: 2,
                text: "run".into(),
            },
            Op::Append {
                parent: 1,
                child: 2,
            },
        ])
        .unwrap();
    app.update();
    let bridge = app.world().resource::<JsBridge>();
    let (root, span) = (bridge.nodes[&1], bridge.nodes[&2]);
    let span_tick = app
        .world()
        .entity(span)
        .get_change_ticks::<TextColor>()
        .unwrap()
        .changed;

    // Transform-only delta: no text writer re-runs → span untouched.
    ops_tx
        .send(vec![update_delta(
            1,
            serde_json::from_value(
                serde_json::json!({ "style": { "transform": { "scale": 2.0 } } }),
            )
            .unwrap(),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    assert_eq!(
        app.world()
            .entity(span)
            .get_change_ticks::<TextColor>()
            .unwrap()
            .changed,
        span_tick,
        "a transform-only text delta must not re-propagate to spans"
    );

    // Color delta: the text color writer re-runs → span restyled.
    ops_tx
        .send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({ "style": { "color": "blue" } })).unwrap(),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    let world = app.world();
    assert_eq!(
        world.entity(span).get::<TextColor>().unwrap().0,
        crate::ui_map::parse_color("blue"),
        "a color delta re-propagates to inheriting spans"
    );
    assert_eq!(
        world.entity(root).get::<TextColor>().unwrap().0,
        crate::ui_map::parse_color("blue")
    );
}

/// A handler toggled off via `unset` clears its marker; the merged (not
/// delta-only) props drive the rebuild, so the other handler survives.
#[test]
fn delta_toggles_pointer_handlers() {
    let (mut app, ops_tx) = op_app();
    ops_tx
        .send(vec![Op::Create {
            id: 1,
            kind: "node".into(),
            props: serde_json::from_value(
                serde_json::json!({ "onPointerDown": true, "onPointerUp": true }),
            )
            .unwrap(),
            text: None,
        }])
        .unwrap();
    app.update();
    let e = app.world().resource::<JsBridge>().nodes[&1];

    // Unset one of the two: the marker must keep the other (merged props).
    ops_tx
        .send(vec![update_delta(
            1,
            Props::default(),
            &["onPointerUp"],
            &[],
        )])
        .unwrap();
    app.update();
    let handlers = app
        .world()
        .entity(e)
        .get::<PointerHandlers>()
        .expect("one handler remains");
    assert!(handlers.down && !handlers.up);

    ops_tx
        .send(vec![update_delta(
            1,
            Props::default(),
            &["onPointerDown"],
            &[],
        )])
        .unwrap();
    app.update();
    assert!(
        app.world().entity(e).get::<PointerHandlers>().is_none(),
        "unsetting the last handler clears the marker"
    );
}
