//! The JSX `<svg>` element through the real op path: root + shape mounts,
//! atomic `shape` replaces, `viewBox` deltas, pointer-handler stamps, the
//! animated-attr stamps, and the bridge bookkeeping on reset/remove.

use bevy::prelude::*;
use bevy::ui::RelativeCursorPosition;
use bevy::ui::widget::{ImageNode, NodeImageMode};

use super::{ShapeAttrs, ShapeKind, SvgJsxSurface, SvgShape};
use bevy_react_core::ext::{ElementFlags, EventLocalPos};
use bevy_react_core::protocol::{ROOT_ID, animatable::AnimatableField, op::Op, props::Props};
use bevy_react_core::test_util::{JsBridge, PointerHandlers};
use bevy_react_core::test_util::{children_of, ent, update_delta};

/// `Op::Create` for an arbitrary `kind` with the given props JSON.
fn create_kind(id: u32, kind: &str, props: serde_json::Value) -> Op {
    Op::Create {
        id,
        kind: kind.into(),
        props: serde_json::from_value(props).expect("valid props"),
        text: None,
    }
}

/// A JSX `<svg>` root mounts as a normal styled node backed by an
/// element-owned stretched `ImageNode`, carrying an [`SvgJsxSurface`] with
/// the parsed `viewBox`. It registers as an svg root and a
/// foreign-image element (its `ImageNode` must never be touched by
/// `backgroundImage`).
#[test]
fn jsx_svg_root_mounts_styled_with_surface() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(
        1,
        "svg",
        serde_json::json!({
            "viewBox": "0 0 100 50",
            "style": { "width": 200 },
        }),
    )])
    .unwrap();
    app.update();

    let e = ent(&app, 1);
    let entity = app.world().entity(e);
    assert_eq!(
        entity.get::<Node>().map(|n| n.width),
        Some(Val::Px(200.0)),
        "an <svg> root is a styled layout node"
    );
    let img = entity
        .get::<ImageNode>()
        .expect("an <svg> root is backed by an ImageNode");
    assert!(
        matches!(img.image_mode, NodeImageMode::Stretch),
        "the raster stretches to the laid-out box"
    );
    let surface = entity
        .get::<SvgJsxSurface>()
        .expect("an <svg> root carries an SvgJsxSurface");
    assert_eq!(
        surface.view_box.map(|vb| (vb.min, vb.size)),
        Some((Vec2::ZERO, Vec2::new(100.0, 50.0))),
        "the viewBox prop lands on the surface"
    );
    assert!(surface.dirty, "a fresh surface awaits its first raster");
    let flags = app
        .world()
        .entity(ent(&app, 1))
        .get::<ElementFlags>()
        .copied();
    assert_eq!(
        flags,
        Some(ElementFlags::OWNS_IMAGE),
        "the element-owned ImageNode must be guarded from backgroundImage"
    );
}

/// Shape children are **Node-less** entities (the `textSpan` precedent): they
/// carry an [`SvgShape`] with the decoded folded attrs and nothing layout- or
/// style-related, register in `bridge.shapes`, and attach under the `<svg>`
/// root in op order.
#[test]
fn shape_children_mount_nodeless_in_order() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![
        create_kind(1, "svg", serde_json::json!({})),
        create_kind(
            2,
            "circle",
            serde_json::json!({ "shape": { "cx": 5.0, "cy": 6.0, "r": 4.0 } }),
        ),
        create_kind(3, "rect", serde_json::json!({ "shape": { "width": 10.0 } })),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
        Op::Append {
            parent: 1,
            child: 3,
        },
    ])
    .unwrap();
    app.update();

    let circle = ent(&app, 2);
    let entity = app.world().entity(circle);
    let shape = entity
        .get::<SvgShape>()
        .expect("a shape child carries an SvgShape");
    assert_eq!(shape.kind, ShapeKind::Circle);
    assert_eq!(shape.attrs.cx.static_val(), Some(5.0));
    assert_eq!(shape.attrs.r.static_val(), Some(4.0));
    assert!(
        entity.get::<Node>().is_none(),
        "a shape child is Node-less — it must never gain a layout box"
    );
    assert_eq!(
        app.world()
            .entity(ent(&app, 3))
            .get::<SvgShape>()
            .map(|s| s.kind),
        Some(ShapeKind::Rect)
    );
    for id in [2, 3] {
        assert_eq!(
            app.world().entity(ent(&app, id)).get::<ElementFlags>(),
            Some(&ElementFlags::NODE_LESS),
            "a shape is flagged node-less"
        );
    }
    assert_eq!(
        children_of(&app, ent(&app, 1)),
        vec![circle, ent(&app, 3)],
        "ECS child order matches op order"
    );
}

/// `{ animated }` wrappers on a shape's numeric attrs stamp an
/// [`AnimatedNode`](bevy_react_core::animations::AnimatedNode) carrying the
/// `ShapeAttr` bindings (create AND update — bindings derive from the
/// atomically-replaced attrs), and an update that drops the last wrapper
/// removes the stamp. The seeded/static halves land in `SvgShape.attrs`
/// (an animated attr reads its seed or as absent).
#[test]
fn animated_shape_attrs_stamp_and_remove_animated_node() {
    use bevy_react_core::animations::AnimatedNode;
    use bevy_react_core::animations::protocol::{AnimatableProperty, Binding};

    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(
        1,
        "circle",
        serde_json::json!({ "shape": {
            "cx": { "animated": { "id": 3 } },
            "r": { "animated": { "id": 7 }, "seed": 4 },
            "cy": 6,
        } }),
    )])
    .unwrap();
    app.update();

    let e = ent(&app, 1);
    {
        let entity = app.world().entity(e);
        let animated = entity
            .get::<AnimatedNode>()
            .expect("animated attrs stamp an AnimatedNode on create");
        assert_eq!(
            animated.0.get(AnimatableProperty::Ext {
                domain: "shape",
                name: "cx".into()
            }),
            Some(&Binding::Shared { id: 3 })
        );
        assert_eq!(
            animated.0.get(AnimatableProperty::Ext {
                domain: "shape",
                name: "r".into()
            }),
            Some(&Binding::Shared { id: 7 })
        );
        assert!(animated.0.has_ext_domain("shape"));
        let shape = entity.get::<SvgShape>().unwrap();
        assert_eq!(shape.attrs.cy.static_val(), Some(6.0));
        assert_eq!(shape.attrs.r.static_or_seed(), Some(4.0), "seed readable");
        assert_eq!(shape.attrs.cx.static_or_seed(), None, "seed-less = absent");
    }

    // Replacing the attrs with all-static ones removes the stamp.
    let static_attrs: Props =
        serde_json::from_value(serde_json::json!({ "shape": { "cx": 9.0 } })).unwrap();
    tx.send(vec![update_delta(1, static_attrs, &[], &[])])
        .unwrap();
    app.update();
    let entity = app.world().entity(e);
    assert!(
        entity.get::<AnimatedNode>().is_none(),
        "dropping the last wrapper must remove the AnimatedNode"
    );
    assert_eq!(
        entity.get::<SvgShape>().unwrap().attrs.cx.static_val(),
        Some(9.0)
    );
}

/// A `<g>` often arrives with no attrs at all: it still mounts an [`SvgShape`]
/// (kind `Group`, default attrs) — never falling through to the plain-node
/// `spawn_element` path.
#[test]
fn group_mounts_with_default_attrs() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(1, "g", serde_json::json!({}))])
        .unwrap();
    app.update();

    let entity = app.world().entity(ent(&app, 1));
    let shape = entity
        .get::<SvgShape>()
        .expect("an attr-less <g> still mounts an SvgShape");
    assert_eq!(shape.kind, ShapeKind::Group);
    assert_eq!(shape.attrs, ShapeAttrs::default());
    assert!(entity.get::<Node>().is_none(), "a group is Node-less too");
    assert_eq!(entity.get::<ElementFlags>(), Some(&ElementFlags::NODE_LESS));
}

/// `shape` updates replace the attrs **atomically** (the merged object is the
/// whole truth: attrs absent from the new object reset), an identical re-send
/// must not even tick `Changed<SvgShape>` (the raster's dirt signal), and
/// `unset: ["shape"]` resets to default attrs.
#[test]
fn shape_update_replaces_attrs_atomically_and_tick_free() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(
        1,
        "circle",
        serde_json::json!({ "shape": { "cx": 5.0, "r": 4.0 } }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 1);

    let cx9: Props = serde_json::from_value(serde_json::json!({ "shape": { "cx": 9.0 } })).unwrap();
    tx.send(vec![update_delta(1, cx9.clone(), &[], &[])])
        .unwrap();
    app.update();
    {
        let shape = app.world().entity(e).get::<SvgShape>().unwrap();
        assert_eq!(
            shape.attrs.cx.static_val(),
            Some(9.0),
            "the new attrs apply"
        );
        assert_eq!(
            shape.attrs.r, None,
            "atomic replace: the absent attr resets"
        );
    }
    let tick = app
        .world()
        .entity(e)
        .get_change_ticks::<SvgShape>()
        .unwrap()
        .changed;

    // An identical re-send must be tick-free.
    tx.send(vec![update_delta(1, cx9, &[], &[])]).unwrap();
    app.update();
    assert_eq!(
        app.world()
            .entity(e)
            .get_change_ticks::<SvgShape>()
            .unwrap()
            .changed,
        tick,
        "an identical shape re-send must not tick Changed<SvgShape>"
    );

    // `unset: ["shape"]` resets the attrs to default.
    tx.send(vec![update_delta(1, Props::default(), &["shape"], &[])])
        .unwrap();
    app.update();
    assert_eq!(
        app.world().entity(e).get::<SvgShape>().unwrap().attrs,
        ShapeAttrs::default(),
        "unsetting shape resets the attrs"
    );
}

/// A `viewBox` update on an `<svg>` root writes the merged value into its
/// [`SvgJsxSurface`] and requests a re-raster; an identical re-send is
/// compare-before-write tick-free and leaves `dirty` alone.
#[test]
fn svg_root_view_box_updates_compare_before_write() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(
        1,
        "svg",
        serde_json::json!({ "viewBox": "0 0 100 50" }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    // Simulate the raster system having painted: dirty cleared.
    app.world_mut()
        .entity_mut(e)
        .get_mut::<SvgJsxSurface>()
        .unwrap()
        .dirty = false;

    let vb: Props =
        serde_json::from_value(serde_json::json!({ "viewBox": "0 0 200 100" })).unwrap();
    tx.send(vec![update_delta(1, vb.clone(), &[], &[])])
        .unwrap();
    app.update();
    {
        let surface = app.world().entity(e).get::<SvgJsxSurface>().unwrap();
        assert_eq!(
            surface.view_box.map(|v| v.size),
            Some(Vec2::new(200.0, 100.0)),
            "the new viewBox lands on the surface"
        );
        assert!(surface.dirty, "a viewBox change requests a re-raster");
    }
    app.world_mut()
        .entity_mut(e)
        .get_mut::<SvgJsxSurface>()
        .unwrap()
        .dirty = false;
    // Captured AFTER the dirty write above (which itself ticks the component).
    let tick = app
        .world()
        .entity(e)
        .get_change_ticks::<SvgJsxSurface>()
        .unwrap()
        .changed;

    tx.send(vec![update_delta(1, vb, &[], &[])]).unwrap();
    app.update();
    let entity = app.world().entity(e);
    assert_eq!(
        entity.get_change_ticks::<SvgJsxSurface>().unwrap().changed,
        tick,
        "an identical viewBox re-send must not tick Changed<SvgJsxSurface>"
    );
    assert!(
        !entity.get::<SvgJsxSurface>().unwrap().dirty,
        "an identical viewBox re-send must not re-flag dirty"
    );
}

/// `unset: ["viewBox"]` resets the surface to logical-pixel space
/// (`view_box: None`) and requests a re-raster.
#[test]
fn svg_root_view_box_unset_resets_to_none() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(
        1,
        "svg",
        serde_json::json!({ "viewBox": "0 0 100 50" }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    // Simulate the raster system having painted: dirty cleared.
    app.world_mut()
        .entity_mut(e)
        .get_mut::<SvgJsxSurface>()
        .unwrap()
        .dirty = false;

    tx.send(vec![update_delta(1, Props::default(), &["viewBox"], &[])])
        .unwrap();
    app.update();
    let surface = app.world().entity(e).get::<SvgJsxSurface>().unwrap();
    assert_eq!(
        surface.view_box, None,
        "unsetting viewBox resets to logical-pixel space"
    );
    assert!(surface.dirty, "the reset requests a re-raster");
}

/// A stray style delta on a shape entity (a component-less re-render) is
/// silently ignored: no components gained, and the `SvgShape` is not even
/// ticked. (Pointer handlers are NOT stray — see the stamping tests below.)
#[test]
fn stray_delta_on_shape_is_ignored() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(
        1,
        "circle",
        serde_json::json!({ "shape": { "r": 4.0 } }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    let tick = app
        .world()
        .entity(e)
        .get_change_ticks::<SvgShape>()
        .unwrap()
        .changed;

    tx.send(vec![update_delta(
        1,
        serde_json::from_value(serde_json::json!({
            "style": { "width": 5, "backgroundColor": "red" },
        }))
        .unwrap(),
        &[],
        &[],
    )])
    .unwrap();
    app.update();

    let entity = app.world().entity(e);
    assert!(
        entity.get::<Node>().is_none(),
        "a stray style delta must not grow a layout box on a shape"
    );
    assert!(
        entity.get::<BackgroundColor>().is_none(),
        "a stray style delta must not paint a shape entity"
    );
    assert!(
        entity.get::<Interaction>().is_none(),
        "a style-only delta must not stamp interaction state"
    );
    assert_eq!(
        entity.get_change_ticks::<SvgShape>().unwrap().changed,
        tick,
        "a shape-less delta must not tick Changed<SvgShape>"
    );
}

/// A shape declaring handlers mounts with the synthesis component set —
/// `PointerHandlers` + `Interaction` + `RelativeCursorPosition` +
/// [`EventLocalPos`] — and stays Node-less; a handler-less sibling gets none of
/// them (its hits fall through to the `<svg>` root).
#[test]
fn shape_handlers_stamp_pointer_components_on_create() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![
        create_kind(
            1,
            "circle",
            serde_json::json!({
                "shape": { "r": 4.0 },
                "onClick": true,
                "onPointerDown": true,
            }),
        ),
        create_kind(2, "rect", serde_json::json!({ "shape": { "width": 3.0 } })),
    ])
    .unwrap();
    app.update();

    let with = app.world().entity(ent(&app, 1));
    let handlers = with
        .get::<PointerHandlers>()
        .expect("a handler-bearing shape carries PointerHandlers");
    assert!(handlers.down, "onPointerDown is registered");
    assert!(
        with.get::<Interaction>().is_some(),
        "onClick/onPointer* need the Interaction click-ownership marker"
    );
    assert!(
        with.get::<RelativeCursorPosition>().is_some(),
        "pointer handlers need the relative cursor"
    );
    assert!(
        with.get::<EventLocalPos>().is_some(),
        "shapes additionally carry the user-space cursor slot"
    );
    assert!(with.get::<Node>().is_none(), "still Node-less");

    let without = app.world().entity(ent(&app, 2));
    assert!(
        without.get::<PointerHandlers>().is_none()
            && without.get::<Interaction>().is_none()
            && without.get::<RelativeCursorPosition>().is_none()
            && without.get::<EventLocalPos>().is_none(),
        "a handler-less shape must stay bare (root fallthrough)"
    );
}

/// `dirty.pointer` deltas toggle the whole component set on and off: adding
/// handlers to a bare shape stamps them; unsetting every handler removes
/// them — including `Interaction` (unlike layout nodes, a shape's
/// `Interaction` serves its handlers alone, and a leftover would steal
/// clicks from the `<svg>` root's climb).
#[test]
fn shape_pointer_update_adds_and_removes_components() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(
        1,
        "circle",
        serde_json::json!({ "shape": { "r": 4.0 } }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 1);

    tx.send(vec![update_delta(
        1,
        serde_json::from_value(serde_json::json!({ "onClick": true, "onPointerEnter": true }))
            .unwrap(),
        &[],
        &[],
    )])
    .unwrap();
    app.update();
    {
        let entity = app.world().entity(e);
        assert!(
            entity.get::<PointerHandlers>().is_some()
                && entity.get::<Interaction>().is_some()
                && entity.get::<EventLocalPos>().is_some(),
            "an update adding handlers stamps the synthesis set"
        );
    }

    tx.send(vec![update_delta(
        1,
        Props::default(),
        &["onClick", "onPointerEnter"],
        &[],
    )])
    .unwrap();
    app.update();
    let entity = app.world().entity(e);
    assert!(
        entity.get::<PointerHandlers>().is_none()
            && entity.get::<Interaction>().is_none()
            && entity.get::<RelativeCursorPosition>().is_none()
            && entity.get::<EventLocalPos>().is_none(),
        "unsetting every handler strips the synthesis set"
    );
}

/// `onScroll`/`onWheel` on a shape never fire (shapes are Node-less — no
/// `ScrollPosition`, no wheel surface): both the create and the update path
/// record the `svgShapeScroll` warning, attributed to the node.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn shape_scroll_handlers_warn_on_create_and_update() {
    let _lock = bevy_react_core::diag::test_lock();
    bevy_react_core::diag::arm_runtime();
    let _ = bevy_react_core::diag::take_runtime_warnings();

    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(
        1,
        "circle",
        serde_json::json!({ "shape": { "r": 4.0 }, "onScroll": true }),
    )])
    .unwrap();
    app.update();
    let warns = bevy_react_core::diag::take_runtime_warnings();
    assert!(
        warns
            .iter()
            .any(|w| w.kind == "svgShapeScroll" && w.node == Some(1) && w.value == "onScroll"),
        "create with onScroll on a shape must warn: {warns:?}"
    );

    tx.send(vec![update_delta(
        1,
        serde_json::from_value(serde_json::json!({ "onWheel": true })).unwrap(),
        &[],
        &[],
    )])
    .unwrap();
    app.update();
    let warns = bevy_react_core::diag::take_runtime_warnings();
    assert!(
        warns
            .iter()
            .any(|w| w.kind == "svgShapeScroll" && w.node == Some(1) && w.value == "onWheel"),
        "update adding onWheel on a shape must warn: {warns:?}"
    );
}

/// `Op::Reset` clears the svg side tables like every other per-node table.
#[test]
fn reset_clears_svg_tables() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![
        create_kind(1, "svg", serde_json::json!({})),
        create_kind(2, "circle", serde_json::json!({ "shape": { "r": 1.0 } })),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
    ])
    .unwrap();
    app.update();
    assert_eq!(app.world().resource::<JsBridge>().nodes.len(), 3);

    tx.send(vec![Op::Reset]).unwrap();
    app.update();
    let bridge = app.world().resource::<JsBridge>();
    assert_eq!(bridge.nodes.len(), 1, "Op::Reset keeps only the root");
    assert!(
        bridge.shared_tags.kind_of(1).is_none() && bridge.shared_tags.kind_of(2).is_none(),
        "Op::Reset must forget the svg kinds"
    );
}

/// Removing the `<svg>` subtree despawns the root and its shape children and
/// prunes both new side tables (the `forget_subtree` path).
#[test]
fn remove_svg_subtree_forgets_bookkeeping() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![
        create_kind(1, "svg", serde_json::json!({})),
        create_kind(2, "circle", serde_json::json!({ "shape": { "r": 1.0 } })),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
    ])
    .unwrap();
    app.update();
    let (svg, circle) = (ent(&app, 1), ent(&app, 2));

    tx.send(vec![Op::Remove {
        parent: ROOT_ID,
        child: 1,
    }])
    .unwrap();
    app.update();

    assert!(
        !app.world().entities().contains(svg),
        "the removed <svg> root is despawned"
    );
    assert!(
        !app.world().entities().contains(circle),
        "the shape child is despawned with the subtree"
    );
    let bridge = app.world().resource::<JsBridge>();
    assert!(
        !bridge.nodes.contains_key(&1) && !bridge.nodes.contains_key(&2),
        "both node ids are forgotten"
    );
    assert!(
        bridge.shared_tags.kind_of(1).is_none() && bridge.shared_tags.kind_of(2).is_none(),
        "the svg root and shape kinds are pruned"
    );
}
