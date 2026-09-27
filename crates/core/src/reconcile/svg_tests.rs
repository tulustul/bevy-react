//! `<image src="*.svg">` svg-mode reconcile tests (mode detection, both
//! src-swap transitions, document-handle compare-before-write, the
//! ignored-attr warning) plus the JSX `<svg>` element + shape-children
//! reconcile tests (Node-less [`SvgShape`] entities, atomic `shape` replace,
//! `viewBox` writes, table cleanup). The svg machinery itself lives in
//! [`crate::svg`]; the raster + intrinsic-measure systems are tested in
//! `crate::svg::raster`.

use bevy::prelude::*;
use bevy::ui::widget::{ImageNode, NodeImageMode};

use super::test_util::{ent, op_app, update_delta};
use crate::protocol::{op::Op, props::Props};
use crate::svg::SvgSurface;

/// `Op::Create` for an `<image>` with the given props JSON.
fn image_create(id: u32, props: serde_json::Value) -> Op {
    Op::Create {
        id,
        kind: "image".into(),
        props: Props::decode_for("image", props),
        text: None,
    }
}

fn src_props(src: &str) -> Props {
    *Props::decode_for("image", serde_json::json!({ "src": src }))
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
    let doc_id = app.world().entity(e).get::<SvgSurface>().unwrap().doc.id();
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
        *Props::decode_for("image", serde_json::json!({ "tint": "blue" })),
        &[],
        &[],
    )])
    .unwrap();
    app.update();
    {
        let entity = app.world().entity(e);
        let surface = entity.get::<SvgSurface>().unwrap();
        assert_eq!(
            surface.doc.id(),
            doc_id,
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
        surface.doc.id(),
        doc_id,
        "a different .svg src must swap the document handle"
    );
    assert!(surface.dirty, "a swapped document must re-flag dirty");
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
        *Props::decode_for(
            "image",
            serde_json::json!({
                "sourceRect": { "x": 0.0, "y": 0.0, "width": 4.0, "height": 4.0 },
            }),
        ),
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
