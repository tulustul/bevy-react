//! Tests for the svg-mode `<image>` raster system — split out of `raster.rs`
//! per the module-size guidance (the `paint/tests.rs` precedent). Pins the
//! B3 behavior byte-for-byte. (The JSX `<svg>` suite lives beside its own
//! raster: `svg/jsx_tests.rs`.)

use bevy::ui::widget::ImageNode;
use bevy::ui::{ComputedNode, ContentSize};

use super::*;
use crate::reconcile::test_util::{ent, op_app, update_delta};
use crate::svg::{CIRCLE_SVG, parse_svg_bytes};

fn circle_doc() -> SvgDocument {
    parse_svg_bytes(CIRCLE_SVG.as_bytes()).expect("valid SVG")
}

/// The pure rasterizer scales uniformly and letterboxes (`xMidYMid meet`),
/// with assertions that fail under both a 1:1 (unscaled) render and a
/// naive stretch.
#[test]
fn rasterizes_at_target_size() {
    let doc = circle_doc();

    // Square target: uniform 0.5 scale, no letterbox. The circle lands at
    // center (25,25), r 20.
    let px = rasterize_document(&doc, 50, 50).expect("nonzero target");
    assert_eq!((px.width(), px.height()), (50, 50));
    let center = px.pixel(25, 25).expect("in bounds");
    assert_eq!(
        (center.red(), center.green(), center.blue(), center.alpha()),
        (255, 0, 0, 255),
        "circle center must be opaque red"
    );
    assert_eq!(px.pixel(1, 1).unwrap().alpha(), 0, "corner is outside");
    // Scale proof: (8,25) is 17px from the scaled center (inside r 20)
    // but ~48.8px from the unscaled circle's center (50,50) (outside
    // r 40) — red only if the document actually scaled down.
    assert_eq!(
        px.pixel(8, 25).unwrap().alpha(),
        255,
        "must render scaled to the target, not 1:1"
    );

    // Non-square target: meet-scale 0.5 again, centered — 25px letterbox
    // bands left and right; circle center (50,25), r 20.
    let px = rasterize_document(&doc, 100, 50).expect("nonzero target");
    let center = px.pixel(50, 25).expect("in bounds");
    assert_eq!(
        (center.red(), center.alpha()),
        (255, 255),
        "content must be centered in the wide box"
    );
    assert_eq!(
        px.pixel(2, 25).unwrap().alpha(),
        0,
        "left-edge center falls in the letterbox band"
    );
    // (12,25) is inside the circle under a naive 1.0×0.5 stretch
    // (((12−50)/40)² ≈ 0.9 < 1) but 38px from the meet-scaled center —
    // transparent proves letterboxing, never stretching.
    assert_eq!(
        px.pixel(12, 25).unwrap().alpha(),
        0,
        "aspect must letterbox, never stretch"
    );
}

/// `Op::Create` for an `<image>` pointing at an `.svg` src.
fn svg_image_create(id: u32) -> crate::protocol::op::Op {
    crate::protocol::op::Op::Create {
        id,
        kind: "image".into(),
        props: crate::protocol::props::Props::decode_for(
            "image",
            serde_json::json!({ "src": "icons/a.svg" }),
        ),
        text: None,
    }
}

/// End-to-end through the op harness: mount an svg `<image>`, park the
/// parsed document, give the node a laid-out size, run `Update` — the
/// backing image gets pixels at the clamped physical size, the surface
/// settles, the layer dirt tap fires, and the intrinsic measure stamps.
/// A second clean frame takes no mutable deref at all.
#[test]
fn system_rasters_once_then_stays_idle() {
    let (mut app, tx) = op_app();
    app.init_resource::<crate::layer::LayerContentDirt>();
    app.add_systems(
        Update,
        update_svg_surfaces.after(crate::reconcile::apply_js_ops),
    );

    tx.send(vec![svg_image_create(1)]).unwrap();
    app.update();
    let e = ent(&app, 1);

    // "Load" resolves: park the parsed document at the requested handle.
    let handle = app
        .world()
        .entity(e)
        .get::<SvgSurface>()
        .unwrap()
        .doc
        .clone();
    app.world_mut()
        .resource_mut::<Assets<SvgDocument>>()
        .insert(handle.id(), circle_doc())
        .expect("park the parsed document");
    // Fabricate last frame's layout: 40×40 physical px.
    app.world_mut().entity_mut(e).insert(ComputedNode {
        size: Vec2::new(40.0, 40.0),
        ..Default::default()
    });
    let measure_tick_before = app
        .world()
        .entity(e)
        .get_change_ticks::<ContentSize>()
        .unwrap()
        .changed;

    app.update();

    let surface = app.world().entity(e).get::<SvgSurface>().unwrap();
    assert_eq!(surface.last_size, UVec2::new(40, 40));
    assert!(!surface.dirty, "the raster clears the repaint request");
    let image_handle = app
        .world()
        .entity(e)
        .get::<ImageNode>()
        .unwrap()
        .image
        .clone();
    let image = app
        .world()
        .resource::<Assets<Image>>()
        .get(&image_handle)
        .expect("element-owned image");
    assert_eq!(image.size(), UVec2::new(40, 40), "resized to layout");
    let data = image.data.as_ref().expect("CPU pixels written");
    assert_eq!(data.len(), 40 * 40 * 4);
    // Center pixel of the rastered circle (RGBA straight alpha).
    let center = 4 * (20 * 40 + 20);
    assert_eq!(
        &data[center..center + 4],
        &[255, 0, 0, 255],
        "center of the rastered circle is opaque red"
    );
    assert!(
        app.world()
            .resource::<crate::layer::LayerContentDirt>()
            .nodes
            .contains(&e),
        "a real pixel upload must dirty the owning layer"
    );
    assert_ne!(
        app.world()
            .entity(e)
            .get_change_ticks::<ContentSize>()
            .unwrap()
            .changed,
        measure_tick_before,
        "the first raster stamps the intrinsic measure"
    );

    // Second frame, nothing changed: the clean path takes zero mutable
    // derefs — no surface tick, no dirt tap (and thus no image get_mut).
    app.world_mut()
        .resource_mut::<crate::layer::LayerContentDirt>()
        .nodes
        .clear();
    let surface_tick = app
        .world()
        .entity(e)
        .get_change_ticks::<SvgSurface>()
        .unwrap()
        .changed;
    app.update();
    assert_eq!(
        app.world()
            .entity(e)
            .get_change_ticks::<SvgSurface>()
            .unwrap()
            .changed,
        surface_tick,
        "a clean frame must not tick the surface"
    );
    assert!(
        app.world()
            .resource::<crate::layer::LayerContentDirt>()
            .nodes
            .is_empty(),
        "a clean frame must not re-raster or re-upload"
    );
}

/// Hot-reload while hidden: a `Modified` doc event that arrives while the
/// node has zero laid-out size must persist into `dirty` (the event is
/// drained once and would otherwise be lost), so re-showing the node at
/// the *same* size still re-rasters — with the new document's pixels.
#[test]
fn doc_reload_while_hidden_rerasters_on_reshow() {
    let (mut app, tx) = op_app();
    app.init_resource::<crate::layer::LayerContentDirt>();
    app.add_systems(
        Update,
        update_svg_surfaces.after(crate::reconcile::apply_js_ops),
    );

    tx.send(vec![svg_image_create(1)]).unwrap();
    app.update();
    let e = ent(&app, 1);
    let handle = app
        .world()
        .entity(e)
        .get::<SvgSurface>()
        .unwrap()
        .doc
        .clone();
    app.world_mut()
        .resource_mut::<Assets<SvgDocument>>()
        .insert(handle.id(), circle_doc())
        .expect("park the parsed document");
    let shown = ComputedNode {
        size: Vec2::new(40.0, 40.0),
        ..Default::default()
    };
    app.world_mut().entity_mut(e).insert(shown);
    app.update(); // first raster: red circle, dirty cleared

    // Hide (zero size), then hot-reload the document to a blue circle —
    // `insert` over the existing asset queues `AssetEvent::Modified`.
    app.world_mut()
        .entity_mut(e)
        .insert(ComputedNode::default());
    let blue = parse_svg_bytes(CIRCLE_SVG.replace("#f00", "#00f").as_bytes()).unwrap();
    app.world_mut()
        .resource_mut::<Assets<SvgDocument>>()
        .insert(handle.id(), blue)
        .expect("hot-reload the parsed document");
    app.world_mut()
        .resource_mut::<crate::layer::LayerContentDirt>()
        .nodes
        .clear();
    // Two hidden frames: queued asset events flush at end of frame, so
    // the system reads `Modified` on the second.
    app.update();
    app.update();
    let surface = app.world().entity(e).get::<SvgSurface>().unwrap();
    assert!(
        surface.dirty,
        "a doc reload seen while hidden must persist into `dirty`"
    );
    assert!(
        app.world()
            .resource::<crate::layer::LayerContentDirt>()
            .nodes
            .is_empty(),
        "no raster while hidden"
    );

    // Re-show at the SAME size: `last_size == size`, so only the
    // persisted dirty flag can trigger the re-raster.
    app.world_mut().entity_mut(e).insert(shown);
    app.update();
    let surface = app.world().entity(e).get::<SvgSurface>().unwrap();
    assert!(!surface.dirty, "re-show re-rasters and settles");
    assert!(
        app.world()
            .resource::<crate::layer::LayerContentDirt>()
            .nodes
            .contains(&e),
        "the re-raster must dirty the owning layer"
    );
    let image_handle = app
        .world()
        .entity(e)
        .get::<ImageNode>()
        .unwrap()
        .image
        .clone();
    let image = app
        .world()
        .resource::<Assets<Image>>()
        .get(&image_handle)
        .unwrap();
    let data = image.data.as_ref().unwrap();
    let center = 4 * (20 * 40 + 20);
    assert_eq!(
        &data[center..center + 4],
        &[0, 0, 255, 255],
        "the re-raster must show the reloaded (blue) document"
    );
}

/// The `PostUpdate` re-stamp: an `ImageNode` change (exactly the condition
/// under which `bevy_ui` clears the measure) re-stamps `ContentSize` for a
/// loaded document; a frame with no trigger leaves it untouched.
#[test]
fn stamp_system_restamps_on_image_change_only() {
    let (mut app, tx) = op_app();
    app.add_systems(PostUpdate, stamp_svg_measures);

    tx.send(vec![svg_image_create(1)]).unwrap();
    app.update();
    let e = ent(&app, 1);
    let handle = app
        .world()
        .entity(e)
        .get::<SvgSurface>()
        .unwrap()
        .doc
        .clone();
    app.world_mut()
        .resource_mut::<Assets<SvgDocument>>()
        .insert(handle.id(), circle_doc())
        .expect("park the parsed document");
    // Settle: a no-trigger frame so mount-time `is_changed` flags expire.
    app.update();

    let tick_before = app
        .world()
        .entity(e)
        .get_change_ticks::<ContentSize>()
        .unwrap()
        .changed;
    // A tint delta re-derives the ImageNode → bevy_ui would clear the
    // measure this frame → the stamp system must re-stamp it.
    tx.send(vec![update_delta(
        1,
        *crate::protocol::props::Props::decode_for("image", serde_json::json!({ "tint": "blue" })),
        &[],
        &[],
    )])
    .unwrap();
    app.update();
    let tick_after_change = app
        .world()
        .entity(e)
        .get_change_ticks::<ContentSize>()
        .unwrap()
        .changed;
    assert_ne!(
        tick_after_change, tick_before,
        "an ImageNode change must re-stamp the measure"
    );

    // No trigger → no ContentSize deref, no relayout.
    app.update();
    assert_eq!(
        app.world()
            .entity(e)
            .get_change_ticks::<ContentSize>()
            .unwrap()
            .changed,
        tick_after_change,
        "a quiet frame must not tick ContentSize"
    );
}
