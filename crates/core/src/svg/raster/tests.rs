//! Tests for the svg raster systems — split out of `raster.rs` per the
//! module-size guidance (the `paint/tests.rs` precedent). File-mode
//! (`<image src="*.svg">`) coverage pins the B3 behavior byte-for-byte; the
//! JSX `<svg>` suite covers the shapes branch: same-frame derived dirt
//! (`Changed<SvgShape>`/`Changed<Children>`), pixel-proof re-rasters, and the
//! zero-mutable-deref clean frame.

use bevy::prelude::*;
use bevy::ui::widget::ImageNode;
use bevy::ui::{ComputedNode, ContentSize};

use super::*;
use crate::protocol::{ROOT_ID, op::Op};
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
        props: serde_json::from_value(serde_json::json!({ "src": "icons/a.svg" }))
            .expect("valid props"),
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
        .clone()
        .unwrap();
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
        .clone()
        .unwrap();
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
        .clone()
        .unwrap();
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
        serde_json::from_value(serde_json::json!({ "tint": "blue" })).unwrap(),
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

// --- JSX `<svg>` shapes branch ---

use serde_json::json;

/// [`op_app`] wired with the raster system + layer dirt, like the plugin.
fn jsx_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (mut app, tx) = op_app();
    app.init_resource::<crate::layer::LayerContentDirt>();
    app.add_systems(
        Update,
        update_svg_surfaces.after(crate::reconcile::apply_js_ops),
    );
    (app, tx)
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

/// A delta carrying the given props JSON.
fn delta(id: u32, props: serde_json::Value) -> Op {
    update_delta(id, serde_json::from_value(props).unwrap(), &[], &[])
}

/// Fabricate last frame's layout: `w`×`h` physical px.
fn lay_out(app: &mut App, e: Entity, w: f32, h: f32) {
    app.world_mut().entity_mut(e).insert(ComputedNode {
        size: Vec2::new(w, h),
        ..Default::default()
    });
}

/// One texel of the element-owned texture, straight-alpha RGBA.
fn texel(app: &App, e: Entity, x: u32, y: u32) -> [u8; 4] {
    let handle = app
        .world()
        .entity(e)
        .get::<ImageNode>()
        .unwrap()
        .image
        .clone();
    let image = app
        .world()
        .resource::<Assets<Image>>()
        .get(&handle)
        .unwrap();
    let w = image.size().x;
    let data = image.data.as_ref().expect("CPU pixels written");
    let i = 4 * (y * w + x) as usize;
    data[i..i + 4].try_into().unwrap()
}

fn clear_dirt(app: &mut App) {
    app.world_mut()
        .resource_mut::<crate::layer::LayerContentDirt>()
        .nodes
        .clear();
}

fn dirt_contains(app: &App, e: Entity) -> bool {
    app.world()
        .resource::<crate::layer::LayerContentDirt>()
        .nodes
        .contains(&e)
}

fn surface_tick(app: &App, e: Entity) -> bevy::ecs::change_detection::Tick {
    app.world()
        .entity(e)
        .get_change_ticks::<SvgSurface>()
        .unwrap()
        .changed
}

/// Mount `<svg viewBox="0 0 100 100">` with a red circle (cx 30, cy 50,
/// r 20) and paint it at 100×100 physical px (identity user→px mapping);
/// returns the settled root.
fn mounted_circle(app: &mut App, tx: &crossbeam_channel::Sender<Vec<Op>>) -> Entity {
    tx.send(vec![
        create_kind(1, "svg", json!({ "viewBox": "0 0 100 100" })),
        create_kind(
            2,
            "circle",
            json!({ "shape": { "cx": 30.0, "cy": 50.0, "r": 20.0, "fill": "red" } }),
        ),
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
    let e = ent(app, 1);
    lay_out(app, e, 100.0, 100.0);
    app.update();
    e
}

/// End-to-end first paint: mount `<svg><circle/></svg>` via ops, give the
/// root a laid-out size, run one frame — the circle's pixels land in the
/// element-owned texture, the layer dirt taps, and the parked mount state
/// (`dirty: true, doc: None`) is consumed. A second clean frame takes zero
/// mutable derefs.
#[test]
fn jsx_first_paint_rasters_shapes_then_idles() {
    let (mut app, tx) = jsx_app();
    tx.send(vec![
        create_kind(1, "svg", json!({ "viewBox": "0 0 100 100" })),
        create_kind(
            2,
            "circle",
            json!({ "shape": { "cx": 50.0, "cy": 50.0, "r": 40.0, "fill": "red" } }),
        ),
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
    let e = ent(&app, 1);
    assert!(
        app.world().entity(e).get::<SvgSurface>().unwrap().dirty,
        "parked until laid out"
    );

    lay_out(&mut app, e, 100.0, 100.0);
    clear_dirt(&mut app);
    app.update();

    let surface = app.world().entity(e).get::<SvgSurface>().unwrap();
    assert_eq!(surface.last_size, UVec2::new(100, 100));
    assert!(!surface.dirty, "the first paint consumes the mount state");
    assert_eq!(
        texel(&app, e, 50, 50),
        [255, 0, 0, 255],
        "circle center is opaque red"
    );
    assert_eq!(texel(&app, e, 2, 2)[3], 0, "corner outside the circle");
    assert!(
        dirt_contains(&app, e),
        "a real pixel upload must dirty the owning layer"
    );

    // Idle second frame: no re-raster, not a single mutable deref.
    clear_dirt(&mut app);
    let tick = surface_tick(&app, e);
    app.update();
    assert_eq!(
        surface_tick(&app, e),
        tick,
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

/// THE queued-write visibility proof: a `shape` delta is a command queued by
/// `apply_js_ops` and flushed before the raster system — `Changed<SvgShape>`
/// must see it and repaint in the SAME `app.update()`. The re-raster rides
/// derived dirt alone: `SvgSurface` is never ticked.
#[test]
fn shape_delta_rerasters_same_frame() {
    let (mut app, tx) = jsx_app();
    let e = mounted_circle(&mut app, &tx);
    assert_eq!(texel(&app, e, 30, 50), [255, 0, 0, 255]);
    assert_eq!(texel(&app, e, 70, 50)[3], 0);

    clear_dirt(&mut app);
    let tick = surface_tick(&app, e);
    tx.send(vec![delta(
        2,
        json!({ "shape": { "cx": 70.0, "cy": 50.0, "r": 20.0, "fill": "red" } }),
    )])
    .unwrap();
    app.update(); // ONE frame

    assert_eq!(
        texel(&app, e, 70, 50),
        [255, 0, 0, 255],
        "the moved circle must paint the same frame as the op"
    );
    assert_eq!(
        texel(&app, e, 30, 50)[3],
        0,
        "the old position repaints away"
    );
    assert!(dirt_contains(&app, e));
    assert_eq!(
        surface_tick(&app, e),
        tick,
        "derived dirt re-rasters without touching SvgSurface"
    );
}

/// Child-list changes re-raster: an appended shape paints on top the same
/// frame, and a pure reorder (no shape data changed) re-rasters through the
/// `Changed<Children>` path — pixel-proven by the overlap order flipping.
#[test]
fn child_list_changes_reraster() {
    let (mut app, tx) = jsx_app();
    tx.send(vec![
        create_kind(1, "svg", json!({})),
        create_kind(
            2,
            "rect",
            json!({ "shape": { "width": 40.0, "height": 40.0, "fill": "red" } }),
        ),
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
    let e = ent(&app, 1);
    lay_out(&mut app, e, 40.0, 40.0);
    app.update();
    assert_eq!(texel(&app, e, 20, 20), [255, 0, 0, 255]);

    // Append a fully-overlapping blue rect: it paints on top, same frame.
    clear_dirt(&mut app);
    tx.send(vec![
        create_kind(
            3,
            "rect",
            json!({ "shape": { "width": 40.0, "height": 40.0, "fill": "blue" } }),
        ),
        Op::Append {
            parent: 1,
            child: 3,
        },
    ])
    .unwrap();
    app.update();
    assert_eq!(
        texel(&app, e, 20, 20),
        [0, 0, 255, 255],
        "the appended shape paints on top, same frame"
    );
    assert!(dirt_contains(&app, e));

    // Pure reorder: move red to the end. No SvgShape changes — only
    // Changed<Children> can trigger this repaint.
    clear_dirt(&mut app);
    let tick = surface_tick(&app, e);
    tx.send(vec![Op::Append {
        parent: 1,
        child: 2,
    }])
    .unwrap();
    app.update();
    assert_eq!(
        texel(&app, e, 20, 20),
        [255, 0, 0, 255],
        "a pure reorder re-rasters via Changed<Children>"
    );
    assert!(dirt_contains(&app, e));
    assert_eq!(surface_tick(&app, e), tick);
}

/// A nested `<g transform="translate(20 0)" opacity="0.5">` composes into its
/// child: the circle paints offset by the group translate and faded by the
/// group opacity (straight-alpha red survives, alpha halves).
#[test]
fn group_transform_and_opacity_compose_into_children() {
    let (mut app, tx) = jsx_app();
    tx.send(vec![
        create_kind(1, "svg", json!({})), // no viewBox: logical-px space
        create_kind(
            2,
            "g",
            json!({ "shape": { "transform": "translate(20 0)", "opacity": 0.5 } }),
        ),
        create_kind(
            3,
            "circle",
            json!({ "shape": { "cx": 20.0, "cy": 20.0, "r": 10.0, "fill": "red" } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
        Op::Append {
            parent: 2,
            child: 3,
        },
    ])
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    lay_out(&mut app, e, 80.0, 40.0);
    app.update();

    assert_eq!(
        texel(&app, e, 20, 20)[3],
        0,
        "the untranslated position is empty — the g transform applied"
    );
    let [r, _, _, a] = texel(&app, e, 40, 20);
    assert!(
        (120..=135).contains(&a),
        "g opacity 0.5 fades the child, got alpha {a}"
    );
    assert!(r >= 250, "straight-alpha red survives the fade, got {r}");
}

/// A `viewBox` update (C3's queued dirty write) rescales the content: the
/// same circle repaints at half scale after the user-unit space doubles.
#[test]
fn view_box_update_rescales_content() {
    let (mut app, tx) = jsx_app();
    let e = mounted_circle(&mut app, &tx);
    assert_eq!(texel(&app, e, 30, 50), [255, 0, 0, 255]);

    clear_dirt(&mut app);
    tx.send(vec![delta(1, json!({ "viewBox": "0 0 200 200" }))])
        .unwrap();
    app.update();

    // Meet-scale 0.5: the circle now sits at (15,25) with r 10.
    assert_eq!(
        texel(&app, e, 15, 25),
        [255, 0, 0, 255],
        "content rescales under the new viewBox"
    );
    assert_eq!(texel(&app, e, 30, 50)[3], 0, "old-scale position is empty");
    assert!(dirt_contains(&app, e));
    assert!(
        !app.world().entity(e).get::<SvgSurface>().unwrap().dirty,
        "the viewBox repaint request is consumed"
    );
}

/// The hidden-node fix, JSX flavor: derived dirt (`Changed<SvgShape>`) seen
/// while the node has zero size is a one-shot signal — it must persist into
/// `surface.dirty` so a re-show at the *same* size still repaints.
#[test]
fn shape_change_while_hidden_persists_into_dirty() {
    let (mut app, tx) = jsx_app();
    let e = mounted_circle(&mut app, &tx);

    // Hide (zero size), then recolor the circle while hidden.
    app.world_mut()
        .entity_mut(e)
        .insert(ComputedNode::default());
    clear_dirt(&mut app);
    tx.send(vec![delta(
        2,
        json!({ "shape": { "cx": 30.0, "cy": 50.0, "r": 20.0, "fill": "blue" } }),
    )])
    .unwrap();
    app.update();
    assert!(
        app.world().entity(e).get::<SvgSurface>().unwrap().dirty,
        "a shape change seen while hidden must persist into dirty"
    );
    assert!(
        app.world()
            .resource::<crate::layer::LayerContentDirt>()
            .nodes
            .is_empty(),
        "no raster while hidden"
    );

    // Re-show at the SAME size: only the persisted flag can trigger this.
    lay_out(&mut app, e, 100.0, 100.0);
    app.update();
    assert_eq!(
        texel(&app, e, 30, 50),
        [0, 0, 255, 255],
        "re-show repaints with the change made while hidden"
    );
    assert!(!app.world().entity(e).get::<SvgSurface>().unwrap().dirty);
}

/// JSX surfaces size purely by style: the measure re-stamp system must skip
/// doc-less surfaces even when its `ImageNode` trigger fires.
#[test]
fn stamp_system_skips_doc_less_jsx_surfaces() {
    let (mut app, tx) = op_app();
    app.add_systems(PostUpdate, stamp_svg_measures);
    tx.send(vec![create_kind(1, "svg", json!({}))]).unwrap();
    app.update();
    let e = ent(&app, 1);
    app.update(); // settle mount-frame change flags

    let tick = app
        .world()
        .entity(e)
        .get_change_ticks::<ContentSize>()
        .unwrap()
        .changed;
    // Fire the stamp system's trigger: tick the ImageNode.
    app.world_mut()
        .entity_mut(e)
        .get_mut::<ImageNode>()
        .unwrap()
        .set_changed();
    app.update();
    assert_eq!(
        app.world()
            .entity(e)
            .get_change_ticks::<ContentSize>()
            .unwrap()
            .changed,
        tick,
        "a JSX (doc-less) surface must never stamp an intrinsic measure"
    );
}

/// Removing the LAST shape child: bevy's `ChildOf` on_remove hook REMOVES the
/// now-empty `Children` component outright, so `Changed<Children>` can never
/// see it — the removal must derive dirt through `RemovedComponents<Children>`
/// instead, and repaint (to transparent) the same frame.
#[test]
fn removing_the_last_shape_clears_the_raster() {
    let (mut app, tx) = jsx_app();
    let e = mounted_circle(&mut app, &tx);
    assert_eq!(texel(&app, e, 30, 50), [255, 0, 0, 255]);

    clear_dirt(&mut app);
    tx.send(vec![Op::Remove {
        parent: 1,
        child: 2,
    }])
    .unwrap();
    app.update(); // ONE frame

    assert_eq!(
        texel(&app, e, 30, 50)[3],
        0,
        "removing the only shape must repaint to transparent, same frame"
    );
    assert!(dirt_contains(&app, e));
}

// --- Animation-driven shape attrs (E2) ---

use crate::animations::{AnimationCommand, AnimationSet, ReactUiAnimationsPlugin};
use crate::protocol::animatable::AnimatableField;

/// [`jsx_app`] plus the animations engine, wired with the SAME ordering the
/// plugin declares (`plugin.rs`): `AnimationSet::Apply` after `apply_js_ops`,
/// and `update_svg_surfaces` after **both** — the driven-write→raster
/// same-frame contract under test below.
fn jsx_anim_app() -> (
    App,
    crossbeam_channel::Sender<Vec<Op>>,
    crossbeam_channel::Sender<AnimationCommand>,
) {
    let (mut app, tx) = op_app();
    app.init_resource::<crate::layer::LayerContentDirt>();
    let (anim_tx, anim_rx) = crossbeam_channel::unbounded();
    app.add_plugins(ReactUiAnimationsPlugin::new(anim_rx));
    app.configure_sets(
        Update,
        AnimationSet::Apply.after(crate::reconcile::apply_js_ops),
    );
    app.add_systems(
        Update,
        update_svg_surfaces
            .after(crate::reconcile::apply_js_ops)
            .after(AnimationSet::Apply),
    );
    (app, tx, anim_tx)
}

/// THE Apply→raster ordering proof: a driven shape attr (`r` bound to a
/// shared value) must repaint in the SAME `app.update()` as the value change
/// — the animation apply stage writes the seed before the raster reads it.
/// The repaint rides `Changed<SvgShape>` alone (`SvgSurface` never ticked),
/// and a settled driver is completely quiet (no shape tick, no repaint).
#[test]
fn driven_shape_attr_repaints_same_frame() {
    let (mut app, tx, anim) = jsx_anim_app();
    tx.send(vec![
        create_kind(1, "svg", json!({ "viewBox": "0 0 100 100" })),
        create_kind(
            2,
            "circle",
            json!({ "shape": {
                "cx": 50.0, "cy": 50.0, "fill": "red",
                "r": { "animated": { "id": 1 }, "seed": 20.0 },
            } }),
        ),
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
    anim.send(AnimationCommand::Declare {
        id: 1,
        initial: 20.0,
    })
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    lay_out(&mut app, e, 100.0, 100.0);
    app.update();
    assert_eq!(texel(&app, e, 50, 50), [255, 0, 0, 255]);
    assert_eq!(
        texel(&app, e, 85, 50)[3],
        0,
        "radius 20: (85,50) is outside"
    );

    // Drive r to 40 and run ONE frame: the driven write must land before the
    // raster reads it, or this frame still paints the old radius.
    clear_dirt(&mut app);
    let s_tick = surface_tick(&app, e);
    anim.send(AnimationCommand::Set { id: 1, value: 40.0 })
        .unwrap();
    app.update();

    assert_eq!(
        texel(&app, e, 85, 50),
        [255, 0, 0, 255],
        "the driven radius must paint the SAME frame (Apply → raster ordering)"
    );
    let shape_entity = ent(&app, 2);
    let shape = app.world().entity(shape_entity).get::<SvgShape>().unwrap();
    assert_eq!(
        shape.attrs.r.static_or_seed(),
        Some(40.0),
        "the driven value lives in the seed slot"
    );
    assert!(
        dirt_contains(&app, e),
        "the repaint dirtied the owning layer"
    );
    assert_eq!(
        surface_tick(&app, e),
        s_tick,
        "driven repaints ride Changed<SvgShape> — SvgSurface untouched"
    );

    // Settled: a clean frame ticks neither the shape nor a repaint.
    clear_dirt(&mut app);
    let shape_tick = app
        .world()
        .entity(shape_entity)
        .get_change_ticks::<SvgShape>()
        .unwrap()
        .changed;
    app.update();
    assert_eq!(
        app.world()
            .entity(shape_entity)
            .get_change_ticks::<SvgShape>()
            .unwrap()
            .changed,
        shape_tick,
        "a settled driver must not tick Changed<SvgShape>"
    );
    assert!(
        app.world()
            .resource::<crate::layer::LayerContentDirt>()
            .nodes
            .is_empty(),
        "a settled driver must not re-raster"
    );
}

/// A driven `<g>` opacity fades its children the same frame: the group's
/// seed write composes through the walk (`static_or_seed`) into the leaf's
/// painted alpha.
#[test]
fn driven_group_opacity_fades_children_same_frame() {
    let (mut app, tx, anim) = jsx_anim_app();
    tx.send(vec![
        create_kind(1, "svg", json!({})), // no viewBox: logical-px space
        create_kind(
            2,
            "g",
            json!({ "shape": { "opacity": { "animated": { "id": 1 }, "seed": 1.0 } } }),
        ),
        create_kind(
            3,
            "circle",
            json!({ "shape": { "cx": 20.0, "cy": 20.0, "r": 10.0, "fill": "red" } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
        Op::Append {
            parent: 2,
            child: 3,
        },
    ])
    .unwrap();
    anim.send(AnimationCommand::Declare {
        id: 1,
        initial: 1.0,
    })
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    lay_out(&mut app, e, 40.0, 40.0);
    app.update();
    assert_eq!(texel(&app, e, 20, 20), [255, 0, 0, 255]);

    anim.send(AnimationCommand::Set { id: 1, value: 0.5 })
        .unwrap();
    app.update();
    let [r, _, _, a] = texel(&app, e, 20, 20);
    assert!(
        (120..=135).contains(&a),
        "driven g opacity 0.5 must fade the child the same frame, got alpha {a}"
    );
    assert!(r >= 250, "straight-alpha red survives the fade, got {r}");
}

/// The nested variant: emptying a `<g>` (its only child removed) also loses
/// the g's `Children` component — the removal signal must climb from the
/// still-alive group to the root.
#[test]
fn removing_a_groups_last_child_clears_its_paint() {
    let (mut app, tx) = jsx_app();
    tx.send(vec![
        create_kind(1, "svg", json!({})),
        create_kind(2, "g", json!({})),
        create_kind(
            3,
            "circle",
            json!({ "shape": { "cx": 20.0, "cy": 20.0, "r": 10.0, "fill": "red" } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
        Op::Append {
            parent: 2,
            child: 3,
        },
    ])
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    lay_out(&mut app, e, 40.0, 40.0);
    app.update();
    assert_eq!(texel(&app, e, 20, 20), [255, 0, 0, 255]);

    clear_dirt(&mut app);
    tx.send(vec![Op::Remove {
        parent: 2,
        child: 3,
    }])
    .unwrap();
    app.update();

    assert_eq!(
        texel(&app, e, 20, 20)[3],
        0,
        "emptying a nested <g> must repaint the root to transparent"
    );
    assert!(dirt_contains(&app, e));
}

// --- Transition-eased shape attrs (E3) ---

/// [`jsx_app`] with the SAME writer→raster ordering the plugin declares
/// (`plugin.rs`) for the transition engine: `drive_transitions` after
/// `apply_js_ops` (the plugin routes it through `apply_interaction_styles`,
/// which is itself after the op drain — this harness has no interaction
/// styling, so the direct edge is the honest mirror) and
/// `update_svg_surfaces` after BOTH. Manual `Time` so the ease can be
/// advanced to exact points.
fn jsx_transition_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (mut app, tx) = crate::reconcile::test_util::op_app_manual_time();
    app.init_resource::<crate::layer::LayerContentDirt>();
    app.add_systems(
        Update,
        (
            crate::transition::drive_transitions.after(crate::reconcile::apply_js_ops),
            update_svg_surfaces
                .after(crate::reconcile::apply_js_ops)
                .after(crate::transition::drive_transitions),
        ),
    );
    (app, tx)
}

fn advance_time(app: &mut App, secs: f32) {
    app.world_mut()
        .resource_mut::<Time>()
        .advance_by(std::time::Duration::from_secs_f32(secs));
}

/// THE transition→raster ordering pin: an eased shape attr must repaint in
/// the SAME `app.update()` that eased it — `drive_transitions` writes
/// `SvgShape` before `update_svg_surfaces` reads it. A `cx` retarget through
/// the real op path paints the mid-ease position (not the start, not the
/// snapped target) on the mid-duration frame, and the settled frame goes
/// completely quiet.
#[test]
fn eased_shape_attr_repaints_same_frame() {
    let (mut app, tx) = jsx_transition_app();
    let shape = serde_json::json!({
        "cx": 30.0, "cy": 50.0, "r": 10.0, "fill": "red",
        "transition": { "cx": { "duration": 1000, "easing": "linear" } },
    });
    tx.send(vec![
        create_kind(1, "svg", json!({ "viewBox": "0 0 100 100" })),
        create_kind(2, "circle", json!({ "shape": shape })),
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
    let e = ent(&app, 1);
    lay_out(&mut app, e, 100.0, 100.0);
    app.update();
    assert_eq!(
        texel(&app, e, 30, 50),
        [255, 0, 0, 255],
        "first sight snaps to cx=30 (no ease-in)"
    );

    // Retarget cx 30 → 70 through the real op path. Mid-duration frame:
    // the eased position (≈50) paints THIS frame.
    tx.send(vec![delta(
        2,
        json!({ "shape": {
            "cx": 70.0, "cy": 50.0, "r": 10.0, "fill": "red",
            "transition": { "cx": { "duration": 1000, "easing": "linear" } },
        } }),
    )])
    .unwrap();
    advance_time(&mut app, 0.5);
    app.update(); // ONE frame: op merge → ease → raster

    assert_eq!(
        texel(&app, e, 50, 50),
        [255, 0, 0, 255],
        "the mid-ease position must paint the SAME frame (drive → raster ordering)"
    );
    assert_eq!(
        texel(&app, e, 30, 50)[3],
        0,
        "start position repainted away"
    );
    assert_eq!(texel(&app, e, 70, 50)[3], 0, "target not snapped to");

    // Finish the ease: exactly the target.
    advance_time(&mut app, 0.5);
    app.update();
    assert_eq!(texel(&app, e, 70, 50), [255, 0, 0, 255]);
    assert_eq!(texel(&app, e, 50, 50)[3], 0);

    // Settled: a further frame ticks nothing and re-rasters nothing.
    clear_dirt(&mut app);
    let shape_entity = ent(&app, 2);
    let tick = app
        .world()
        .entity(shape_entity)
        .get_change_ticks::<SvgShape>()
        .unwrap()
        .changed;
    advance_time(&mut app, 0.5);
    app.update();
    assert_eq!(
        app.world()
            .entity(shape_entity)
            .get_change_ticks::<SvgShape>()
            .unwrap()
            .changed,
        tick,
        "a settled shape transition must not tick Changed<SvgShape>"
    );
    assert!(
        app.world()
            .resource::<crate::layer::LayerContentDirt>()
            .nodes
            .is_empty(),
        "a settled shape transition must not re-raster"
    );
}
