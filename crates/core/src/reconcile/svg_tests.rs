//! `<image src="*.svg">` svg-mode reconcile tests (mode detection, both
//! src-swap transitions, document-handle compare-before-write, the
//! ignored-attr warning) plus the JSX `<svg>` element + shape-children
//! reconcile tests (Node-less [`SvgShape`] entities, atomic `shape` replace,
//! `viewBox` writes, table cleanup). The svg machinery itself lives in
//! [`crate::svg`]; the raster + intrinsic-measure systems are tested in
//! `crate::svg::raster`.

use bevy::prelude::*;
use bevy::ui::RelativeCursorPosition;
use bevy::ui::widget::{ImageNode, NodeImageMode};

use super::test_util::{children_of, ent, op_app, update_delta};
use crate::bridge::{JsBridge, PointerHandlers};
use crate::protocol::{ROOT_ID, animatable::AnimatableField, op::Op, props::Props};
use crate::svg::{ShapeAttrs, ShapeKind, SvgShape, SvgSurface, SvgUserPos};

/// `Op::Create` for an `<image>` with the given props JSON.
fn image_create(id: u32, props: serde_json::Value) -> Op {
    Op::Create {
        id,
        kind: "image".into(),
        props: serde_json::from_value(props).expect("valid image props"),
        text: None,
    }
}

fn src_props(src: &str) -> Props {
    serde_json::from_value(serde_json::json!({ "src": src })).expect("valid props")
}

/// An `.svg` src enters svg mode: the entity carries an [`SvgSurface`] with
/// the parsed-document handle requested, the `ImageNode` stretches an
/// element-owned texture (NOT the path loaded as an `Image`), and image props
/// like `tint` still apply.
#[test]
fn svg_src_mounts_element_owned_surface() {
    let (mut app, tx) = op_app();
    tx.send(vec![image_create(
        1,
        serde_json::json!({ "src": "icons/a.svg", "tint": "red" }),
    )])
    .unwrap();
    app.update();

    let e = ent(&app, 1);
    let entity = app.world().entity(e);
    let surface = entity
        .get::<SvgSurface>()
        .expect("svg mode stamps an SvgSurface");
    assert!(surface.doc.is_some(), "the parsed document is requested");
    assert!(surface.dirty, "a fresh surface awaits its first raster");
    assert_eq!(surface.last_size, UVec2::ZERO);
    let img = entity
        .get::<ImageNode>()
        .expect("svg mode is backed by an ImageNode");
    assert!(
        matches!(img.image_mode, NodeImageMode::Stretch),
        "the raster stretches to the laid-out box"
    );
    let path_image: Handle<Image> = app.world().resource::<AssetServer>().load("icons/a.svg");
    assert_ne!(
        img.image, path_image,
        "the texture is element-owned, never the path loaded as an Image"
    );
    assert_eq!(
        img.color,
        crate::ui_map::parse_color("red"),
        "tint applies in svg mode"
    );
}

/// Detection is case-insensitive on the extension.
#[test]
fn svg_detection_is_case_insensitive() {
    let (mut app, tx) = op_app();
    tx.send(vec![image_create(1, serde_json::json!({ "src": "B.SVG" }))])
        .unwrap();
    app.update();
    assert!(
        app.world()
            .entity(ent(&app, 1))
            .get::<SvgSurface>()
            .is_some(),
        "an uppercase .SVG src must still enter svg mode"
    );
}

/// A raster src stays on the plain path: no [`SvgSurface`], and the texture is
/// the asset-server load of the path.
#[test]
fn raster_src_stays_plain_image() {
    let (mut app, tx) = op_app();
    tx.send(vec![image_create(
        1,
        serde_json::json!({ "src": "icons/a.png" }),
    )])
    .unwrap();
    app.update();

    let e = ent(&app, 1);
    assert!(
        app.world().entity(e).get::<SvgSurface>().is_none(),
        "a raster image must not carry an SvgSurface"
    );
    let expected: Handle<Image> = app.world().resource::<AssetServer>().load("icons/a.png");
    assert_eq!(
        app.world().entity(e).get::<ImageNode>().unwrap().image,
        expected,
        "a raster src loads the path as the texture"
    );
}

/// Swapping src `.png` → `.svg` inserts the [`SvgSurface`] + element-owned
/// texture; swapping back removes it and restores the plain texture-loading
/// `ImageNode`.
#[test]
fn src_swaps_transition_between_modes() {
    let (mut app, tx) = op_app();
    tx.send(vec![image_create(
        1,
        serde_json::json!({ "src": "icons/a.png" }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 1);

    // png → svg: svg mode engages, with a fresh element-owned texture.
    tx.send(vec![update_delta(1, src_props("icons/a.svg"), &[], &[])])
        .unwrap();
    app.update();
    {
        let entity = app.world().entity(e);
        assert!(
            entity.get::<SvgSurface>().is_some(),
            "swapping to an .svg src must insert an SvgSurface"
        );
        let img = entity.get::<ImageNode>().unwrap();
        assert!(matches!(img.image_mode, NodeImageMode::Stretch));
        let png: Handle<Image> = app.world().resource::<AssetServer>().load("icons/a.png");
        assert_ne!(
            img.image, png,
            "the loaded png texture must be replaced by an element-owned blank"
        );
    }

    // svg → png: svg mode disengages, the plain path is restored.
    tx.send(vec![update_delta(1, src_props("icons/a.png"), &[], &[])])
        .unwrap();
    app.update();
    let entity = app.world().entity(e);
    assert!(
        entity.get::<SvgSurface>().is_none(),
        "swapping back to a raster src must remove the SvgSurface"
    );
    let expected: Handle<Image> = app.world().resource::<AssetServer>().load("icons/a.png");
    assert_eq!(
        entity.get::<ImageNode>().unwrap().image,
        expected,
        "the plain texture-loading rebuild path is restored"
    );
}

/// Compare-before-write on the document handle: a delta that keeps the same
/// src neither reloads the doc nor re-flags `dirty`; a delta to a different
/// `.svg` swaps the handle and re-flags.
#[test]
fn same_src_update_keeps_doc_handle_and_dirty_state() {
    let (mut app, tx) = op_app();
    tx.send(vec![image_create(
        1,
        serde_json::json!({ "src": "icons/a.svg" }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    let doc_id = app
        .world()
        .entity(e)
        .get::<SvgSurface>()
        .unwrap()
        .doc
        .as_ref()
        .unwrap()
        .id();
    // Simulate the raster system having painted: dirty cleared.
    app.world_mut()
        .entity_mut(e)
        .get_mut::<SvgSurface>()
        .unwrap()
        .dirty = false;
    let texture_before = app.world().entity(e).get::<ImageNode>().unwrap().image.id();
    // Captured AFTER the dirty write above (which itself ticks the component).
    let surface_tick = app
        .world()
        .entity(e)
        .get_change_ticks::<SvgSurface>()
        .unwrap()
        .changed;

    // A tint-only delta re-derives the ImageNode but must not churn the doc.
    tx.send(vec![update_delta(
        1,
        serde_json::from_value(serde_json::json!({ "tint": "blue" })).unwrap(),
        &[],
        &[],
    )])
    .unwrap();
    app.update();
    {
        let entity = app.world().entity(e);
        let surface = entity.get::<SvgSurface>().unwrap();
        assert_eq!(
            surface.doc.as_ref().map(|h| h.id()),
            Some(doc_id),
            "an unchanged src must keep the same document handle"
        );
        assert!(
            !surface.dirty,
            "an unchanged src must not re-flag the surface dirty"
        );
        assert_eq!(
            entity.get::<ImageNode>().unwrap().image.id(),
            texture_before,
            "the element-owned texture must be reused, not reallocated"
        );
        assert_eq!(
            entity.get_change_ticks::<SvgSurface>().unwrap().changed,
            surface_tick,
            "a same-doc rebuild must not even flag Changed<SvgSurface>"
        );
    }

    // A different .svg src swaps the handle and requests a repaint.
    tx.send(vec![update_delta(1, src_props("icons/b.svg"), &[], &[])])
        .unwrap();
    app.update();
    let surface = app.world().entity(e).get::<SvgSurface>().unwrap();
    assert_ne!(
        surface.doc.as_ref().map(|h| h.id()),
        Some(doc_id),
        "a different .svg src must swap the document handle"
    );
    assert!(surface.dirty, "a swapped document must re-flag dirty");
}

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
/// element-owned stretched `ImageNode`, carrying an [`SvgSurface`] in JSX mode
/// (`doc: None`) with the parsed `viewBox`. It registers as an svg root and a
/// foreign-image element (its `ImageNode` must never be touched by
/// `backgroundImage`).
#[test]
fn jsx_svg_root_mounts_styled_with_surface() {
    let (mut app, tx) = op_app();
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
        .get::<SvgSurface>()
        .expect("an <svg> root carries an SvgSurface");
    assert!(surface.doc.is_none(), "JSX mode has no document asset");
    assert_eq!(
        surface.view_box.map(|vb| (vb.min, vb.size)),
        Some((Vec2::ZERO, Vec2::new(100.0, 50.0))),
        "the viewBox prop lands on the surface"
    );
    assert!(surface.dirty, "a fresh surface awaits its first raster");
    let bridge = app.world().resource::<JsBridge>();
    assert!(bridge.svg_roots.contains(&1), "registered as an svg root");
    assert!(
        bridge.foreign_images.contains(&1),
        "the element-owned ImageNode must be guarded from backgroundImage"
    );
}

/// Shape children are **Node-less** entities (the `textSpan` precedent): they
/// carry an [`SvgShape`] with the decoded folded attrs and nothing layout- or
/// style-related, register in `bridge.shapes`, and attach under the `<svg>`
/// root in op order.
#[test]
fn shape_children_mount_nodeless_in_order() {
    let (mut app, tx) = op_app();
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
    let bridge = app.world().resource::<JsBridge>();
    assert!(bridge.shapes.contains(&2) && bridge.shapes.contains(&3));
    assert_eq!(
        children_of(&app, ent(&app, 1)),
        vec![circle, ent(&app, 3)],
        "ECS child order matches op order"
    );
}

/// `{ animated }` wrappers on a shape's numeric attrs stamp an
/// [`AnimatedNode`](crate::animations::AnimatedNode) carrying the
/// `ShapeAttr` bindings (create AND update — bindings derive from the
/// atomically-replaced attrs), and an update that drops the last wrapper
/// removes the stamp. The seeded/static halves land in `SvgShape.attrs`
/// (an animated attr reads its seed or as absent).
#[test]
fn animated_shape_attrs_stamp_and_remove_animated_node() {
    use crate::animations::AnimatedNode;
    use crate::animations::protocol::{AnimatableProperty, Binding};

    let (mut app, tx) = op_app();
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
            animated
                .0
                .get(AnimatableProperty::ShapeAttr { name: "cx".into() }),
            Some(&Binding::Shared { id: 3 })
        );
        assert_eq!(
            animated
                .0
                .get(AnimatableProperty::ShapeAttr { name: "r".into() }),
            Some(&Binding::Shared { id: 7 })
        );
        assert!(animated.0.has_shape_attrs());
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
    let (mut app, tx) = op_app();
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
    assert!(app.world().resource::<JsBridge>().shapes.contains(&1));
}

/// `shape` updates replace the attrs **atomically** (the merged object is the
/// whole truth: attrs absent from the new object reset), an identical re-send
/// must not even tick `Changed<SvgShape>` (the raster's dirt signal), and
/// `unset: ["shape"]` resets to default attrs.
#[test]
fn shape_update_replaces_attrs_atomically_and_tick_free() {
    let (mut app, tx) = op_app();
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
/// [`SvgSurface`] and requests a re-raster; an identical re-send is
/// compare-before-write tick-free and leaves `dirty` alone.
#[test]
fn svg_root_view_box_updates_compare_before_write() {
    let (mut app, tx) = op_app();
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
        .get_mut::<SvgSurface>()
        .unwrap()
        .dirty = false;

    let vb: Props =
        serde_json::from_value(serde_json::json!({ "viewBox": "0 0 200 100" })).unwrap();
    tx.send(vec![update_delta(1, vb.clone(), &[], &[])])
        .unwrap();
    app.update();
    {
        let surface = app.world().entity(e).get::<SvgSurface>().unwrap();
        assert_eq!(
            surface.view_box.map(|v| v.size),
            Some(Vec2::new(200.0, 100.0)),
            "the new viewBox lands on the surface"
        );
        assert!(surface.dirty, "a viewBox change requests a re-raster");
    }
    app.world_mut()
        .entity_mut(e)
        .get_mut::<SvgSurface>()
        .unwrap()
        .dirty = false;
    // Captured AFTER the dirty write above (which itself ticks the component).
    let tick = app
        .world()
        .entity(e)
        .get_change_ticks::<SvgSurface>()
        .unwrap()
        .changed;

    tx.send(vec![update_delta(1, vb, &[], &[])]).unwrap();
    app.update();
    let entity = app.world().entity(e);
    assert_eq!(
        entity.get_change_ticks::<SvgSurface>().unwrap().changed,
        tick,
        "an identical viewBox re-send must not tick Changed<SvgSurface>"
    );
    assert!(
        !entity.get::<SvgSurface>().unwrap().dirty,
        "an identical viewBox re-send must not re-flag dirty"
    );
}

/// `unset: ["viewBox"]` resets the surface to logical-pixel space
/// (`view_box: None`) and requests a re-raster.
#[test]
fn svg_root_view_box_unset_resets_to_none() {
    let (mut app, tx) = op_app();
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
        .get_mut::<SvgSurface>()
        .unwrap()
        .dirty = false;

    tx.send(vec![update_delta(1, Props::default(), &["viewBox"], &[])])
        .unwrap();
    app.update();
    let surface = app.world().entity(e).get::<SvgSurface>().unwrap();
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
    let (mut app, tx) = op_app();
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
/// [`SvgUserPos`] — and stays Node-less; a handler-less sibling gets none of
/// them (its hits fall through to the `<svg>` root).
#[test]
fn shape_handlers_stamp_pointer_components_on_create() {
    let (mut app, tx) = op_app();
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
        with.get::<SvgUserPos>().is_some(),
        "shapes additionally carry the user-space cursor slot"
    );
    assert!(with.get::<Node>().is_none(), "still Node-less");

    let without = app.world().entity(ent(&app, 2));
    assert!(
        without.get::<PointerHandlers>().is_none()
            && without.get::<Interaction>().is_none()
            && without.get::<RelativeCursorPosition>().is_none()
            && without.get::<SvgUserPos>().is_none(),
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
    let (mut app, tx) = op_app();
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
                && entity.get::<SvgUserPos>().is_some(),
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
            && entity.get::<SvgUserPos>().is_none(),
        "unsetting every handler strips the synthesis set"
    );
}

/// `onScroll`/`onWheel` on a shape never fire (shapes are Node-less — no
/// `ScrollPosition`, no wheel surface): both the create and the update path
/// record the `svgShapeScroll` warning, attributed to the node.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn shape_scroll_handlers_warn_on_create_and_update() {
    let _lock = crate::diag::test_lock();
    crate::diag::arm_runtime();
    let _ = crate::diag::take_runtime_warnings();

    let (mut app, tx) = op_app();
    tx.send(vec![create_kind(
        1,
        "circle",
        serde_json::json!({ "shape": { "r": 4.0 }, "onScroll": true }),
    )])
    .unwrap();
    app.update();
    let warns = crate::diag::take_runtime_warnings();
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
    let warns = crate::diag::take_runtime_warnings();
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
    let (mut app, tx) = op_app();
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
    {
        let bridge = app.world().resource::<JsBridge>();
        assert!(bridge.svg_roots.contains(&1) && bridge.shapes.contains(&2));
    }

    tx.send(vec![Op::Reset]).unwrap();
    app.update();
    let bridge = app.world().resource::<JsBridge>();
    assert!(
        bridge.svg_roots.is_empty(),
        "Op::Reset must clear svg_roots"
    );
    assert!(bridge.shapes.is_empty(), "Op::Reset must clear shapes");
}

/// Removing the `<svg>` subtree despawns the root and its shape children and
/// prunes both new side tables (the `forget_subtree` path).
#[test]
fn remove_svg_subtree_forgets_bookkeeping() {
    let (mut app, tx) = op_app();
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
        bridge.svg_roots.is_empty(),
        "the svg root is pruned from svg_roots"
    );
    assert!(bridge.shapes.is_empty(), "the shape is pruned from shapes");
}

/// `atlas`/`sourceRect` are meaningless in svg mode (there is no source
/// texture to grid or crop): both the create and the update path record the
/// `svgImageAttrs` warning, attributed to the node.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn svg_mode_warns_on_atlas_and_source_rect() {
    let _lock = crate::diag::test_lock();
    crate::diag::arm_runtime();
    let _ = crate::diag::take_runtime_warnings();

    let (mut app, tx) = op_app();
    tx.send(vec![image_create(
        1,
        serde_json::json!({
            "src": "icons/a.svg",
            "atlas": { "tileWidth": 8, "tileHeight": 8, "columns": 2, "rows": 2 },
        }),
    )])
    .unwrap();
    app.update();
    let warns = crate::diag::take_runtime_warnings();
    assert!(
        warns
            .iter()
            .any(|w| w.kind == "svgImageAttrs" && w.node == Some(1) && w.value == "atlas"),
        "create with atlas in svg mode must warn: {warns:?}"
    );

    tx.send(vec![update_delta(
        1,
        serde_json::from_value(serde_json::json!({
            "sourceRect": { "x": 0.0, "y": 0.0, "width": 4.0, "height": 4.0 },
        }))
        .unwrap(),
        &[],
        &[],
    )])
    .unwrap();
    app.update();
    let warns = crate::diag::take_runtime_warnings();
    assert!(
        warns
            .iter()
            .any(|w| w.kind == "svgImageAttrs" && w.node == Some(1) && w.value == "sourceRect"),
        "update adding sourceRect in svg mode must warn: {warns:?}"
    );
}
