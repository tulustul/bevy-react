//! The rasterizer and the retained surface's semantics (accumulating paint,
//! persistent state, clear-on-resize, replace), plus the element through the
//! real op path.

use crate::draw::parse_rgba8;
use crate::{CanvasSurface, DrawCmd};

/// One-shot shim matching the old pure `rasterize` signature: a fresh
/// surface, one clear+replay paint.
fn rasterize(cmds: &[DrawCmd], width: u32, height: u32, scale: f32) -> Vec<u8> {
    let mut s = CanvasSurface::new(cmds.to_vec());
    s.sync(width, height, scale)
        .expect("first sync always paints")
}

/// The RGBA bytes of pixel `(x, y)` in a `w`-wide buffer.
fn px(buf: &[u8], w: usize, x: usize, y: usize) -> &[u8] {
    let i = (y * w + x) * 4;
    &buf[i..i + 4]
}

fn fill_rect(color: &str, x: f32, y: f32, w: f32, h: f32) -> Vec<DrawCmd> {
    vec![
        DrawCmd::BeginPath,
        DrawCmd::FillStyle {
            color: color.into(),
        },
        DrawCmd::Rect { x, y, w, h },
        DrawCmd::Fill,
    ]
}

#[test]
fn parses_hex_colors() {
    assert_eq!(parse_rgba8("#ff0000"), [255, 0, 0, 255]);
    assert_eq!(parse_rgba8("#00ff0080"), [0, 255, 0, 128]);
    assert_eq!(parse_rgba8("#f00"), [255, 0, 0, 255]);
    assert_eq!(parse_rgba8("#0f08"), [0, 255, 0, 136]);
    assert_eq!(parse_rgba8("garbage"), [0, 0, 0, 255]);
}

#[test]
fn rasterizes_a_filled_rect_opaquely() {
    let buf = rasterize(&fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0), 4, 4, 1.0);
    assert_eq!(buf.len(), 4 * 4 * 4);
    // An interior pixel (x=1, y=1) is solid red.
    assert_eq!(px(&buf, 4, 1, 1), &[255, 0, 0, 255]);
}

#[test]
fn scale_maps_logical_coords_onto_the_physical_buffer() {
    // A 2×2 logical rect at 2× scale fills a 4×4 physical buffer entirely.
    let buf = rasterize(&fill_rect("#ff0000", 0.0, 0.0, 2.0, 2.0), 4, 4, 2.0);
    // The far corner pixel (x=3, y=3) is covered — drawing scaled to fill.
    assert_eq!(px(&buf, 4, 3, 3), &[255, 0, 0, 255]);
}

#[test]
fn paint_accumulates_across_batches() {
    let mut s = CanvasSurface::new(vec![]);
    s.enqueue(fill_rect("#ff0000", 0.0, 0.0, 2.0, 2.0));
    s.sync(4, 4, 1.0).expect("painted");
    s.enqueue(fill_rect("#0000ff", 2.0, 2.0, 2.0, 2.0));
    let buf = s.sync(4, 4, 1.0).expect("painted");
    // The first batch's red survives the second batch's blue.
    assert_eq!(px(&buf, 4, 1, 1), &[255, 0, 0, 255]);
    assert_eq!(px(&buf, 4, 3, 3), &[0, 0, 255, 255]);
}

#[test]
fn style_and_path_state_persist_across_batches() {
    let mut s = CanvasSurface::new(vec![]);
    // Batch 1 only sets the fill color and builds a path — no paint yet.
    s.enqueue(vec![
        DrawCmd::FillStyle {
            color: "#ff0000".into(),
        },
        DrawCmd::Rect {
            x: 0.0,
            y: 0.0,
            w: 4.0,
            h: 4.0,
        },
    ]);
    s.sync(4, 4, 1.0);
    // Batch 2 fills using the retained color and path.
    s.enqueue(vec![DrawCmd::Fill]);
    let buf = s.sync(4, 4, 1.0).expect("painted");
    assert_eq!(px(&buf, 4, 1, 1), &[255, 0, 0, 255]);
}

#[test]
fn clear_rect_erases_only_inside() {
    let mut s = CanvasSurface::new(fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0));
    s.sync(4, 4, 1.0);
    s.enqueue(vec![DrawCmd::ClearRect {
        x: 1.0,
        y: 1.0,
        w: 2.0,
        h: 2.0,
    }]);
    let buf = s.sync(4, 4, 1.0).expect("painted");
    assert_eq!(px(&buf, 4, 2, 2)[3], 0, "inside is transparent");
    assert_eq!(px(&buf, 4, 0, 0), &[255, 0, 0, 255], "outside intact");
}

#[test]
fn clear_erases_the_whole_surface() {
    let mut s = CanvasSurface::new(fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0));
    s.sync(4, 4, 1.0);
    s.enqueue(vec![DrawCmd::Clear]);
    let buf = s.sync(4, 4, 1.0).expect("painted");
    assert!(buf.iter().all(|&b| b == 0));
}

#[test]
fn resize_clears_pixels_and_resets_state() {
    let mut s = CanvasSurface::new(fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0));
    s.sync(4, 4, 1.0);
    // The resize alone repaints (cleared), even with nothing pending.
    let buf = s.sync(8, 8, 1.0).expect("resize repaints");
    assert_eq!(buf.len(), 8 * 8 * 4);
    assert!(buf.iter().all(|&b| b == 0), "cleared on resize");
    // Raster state was reset: an unstyled fill uses the default (white).
    s.enqueue(vec![
        DrawCmd::Rect {
            x: 0.0,
            y: 0.0,
            w: 8.0,
            h: 8.0,
        },
        DrawCmd::Fill,
    ]);
    let buf = s.sync(8, 8, 1.0).expect("painted");
    assert_eq!(px(&buf, 8, 4, 4), &[255, 255, 255, 255]);
}

#[test]
fn commands_enqueued_before_first_layout_paint_once_sized() {
    let mut s = CanvasSurface::new(vec![]);
    s.enqueue(fill_rect("#ff0000", 0.0, 0.0, 4.0, 4.0));
    // First sized sync (first layout) drains the queue.
    let buf = s.sync(4, 4, 1.0).expect("painted");
    assert_eq!(px(&buf, 4, 1, 1), &[255, 0, 0, 255]);
}

#[test]
fn set_display_list_replaces_the_picture() {
    let mut s = CanvasSurface::new(fill_rect("#ff0000", 0.0, 0.0, 2.0, 2.0));
    s.sync(4, 4, 1.0);
    s.set_display_list(fill_rect("#0000ff", 2.0, 2.0, 2.0, 2.0));
    let buf = s.sync(4, 4, 1.0).expect("painted");
    assert_eq!(px(&buf, 4, 1, 1)[3], 0, "old pixels cleared");
    assert_eq!(px(&buf, 4, 3, 3), &[0, 0, 255, 255], "new pixels painted");
}

#[test]
fn degenerate_stroke_paints_nothing_without_failing() {
    // A stationary drag records `moveTo(p); lineTo(p); stroke()` — a
    // single-point path. tiny-skia's stroker rejects it (an empty
    // butt-cap outline), so the rasterizer must skip it silently.
    let mut s = CanvasSurface::new(vec![]);
    s.enqueue(vec![
        DrawCmd::BeginPath,
        DrawCmd::MoveTo { x: 2.0, y: 2.0 },
        DrawCmd::LineTo { x: 2.0, y: 2.0 },
        DrawCmd::Stroke,
    ]);
    let buf = s.sync(4, 4, 1.0).expect("painted");
    assert!(buf.iter().all(|&b| b == 0), "nothing stroked");
}

#[test]
fn invalid_line_width_is_ignored() {
    // Web semantics: assigning 0 / negative / non-finite keeps the
    // previous width (tiny-skia would reject the stroke outright).
    let mut s = CanvasSurface::new(vec![]);
    s.enqueue(vec![
        DrawCmd::StrokeStyle {
            color: "#ff0000".into(),
        },
        DrawCmd::LineWidth { w: 2.0 },
        DrawCmd::LineWidth { w: 0.0 },
        DrawCmd::LineWidth { w: -3.0 },
        DrawCmd::LineWidth { w: f32::NAN },
        DrawCmd::BeginPath,
        DrawCmd::MoveTo { x: 0.0, y: 2.0 },
        DrawCmd::LineTo { x: 4.0, y: 2.0 },
        DrawCmd::Stroke,
    ]);
    let buf = s.sync(4, 4, 1.0).expect("painted");
    // Width 2 (the last valid value) covers rows 1..3; row 1 is opaque red.
    assert_eq!(px(&buf, 4, 2, 1), &[255, 0, 0, 255]);
}

#[test]
fn idle_sync_returns_none() {
    let mut s = CanvasSurface::new(vec![]);
    assert!(s.sync(4, 4, 1.0).is_some(), "first paint uploads the clear");
    assert!(s.sync(4, 4, 1.0).is_none(), "nothing pending, no repaint");
}

mod op_path {
    use bevy::ecs::system::RunSystemOnce;
    use bevy::prelude::*;
    use bevy::ui::widget::ImageNode;
    use bevy_react_core::background_image::{BackgroundTileScale, RBackgroundTexture};
    use bevy_react_core::element::ElementEvents;
    use bevy_react_core::protocol::op::Op;
    use bevy_react_core::test_util::{JsBridge, create, ent, op_app_with, update};

    use crate::{CanvasSize, DRAW_APPEND, DrawCmd, RESIZE};

    fn app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
        op_app_with(crate::register_bindings)
    }

    /// An update op decodes its props against the element its `kind` names:
    /// the imperative `drawAppend` is an act-now attribute riding an ordinary
    /// update (there is no draw op).
    #[test]
    fn update_op_decodes_draw_append_by_kind() {
        // The harness installs this thread's decode scope (core + canvas).
        let _app = app();
        let op: Op = serde_json::from_str(
            r##"{"op":"update","id":7,"kind":"canvas","props":{"drawAppend":[
                {"cmd":"clear"},
                {"cmd":"clearRect","x":1.0,"y":2.0,"w":3.0,"h":4.0},
                {"cmd":"fillStyle","color":"#f00"}
            ]}}"##,
        )
        .unwrap();
        let Op::Update { id, props, .. } = op else {
            panic!("expected an update");
        };
        assert_eq!(id, 7);
        let cmds = props.attrs.get(&DRAW_APPEND).expect("decoded by kind");
        assert_eq!(
            cmds,
            &vec![
                DrawCmd::Clear,
                DrawCmd::ClearRect {
                    x: 1.0,
                    y: 2.0,
                    w: 3.0,
                    h: 4.0
                },
                DrawCmd::FillStyle {
                    color: "#f00".into()
                },
            ]
        );
    }

    /// A canvas's imperative `drawAppend` carries only an act-now attribute
    /// and is never retained.
    #[test]
    fn draw_append_is_an_act_now_update() {
        let (mut app, tx) = app();
        tx.send(vec![create(1, "canvas", serde_json::json!({}))])
            .unwrap();
        app.update();
        tx.send(vec![update(
            1,
            "canvas",
            serde_json::json!({ "drawAppend": [{ "cmd": "clear" }] }),
            &[],
            &[],
        )])
        .unwrap();
        app.update();
        let bridge = app.world().resource::<JsBridge>();
        assert!(
            !bridge.props_cache[&1].attrs.contains(&DRAW_APPEND),
            "act-now attributes are never retained"
        );
    }

    /// `resize` is unconditional: it reaches JS without an `onResize` (the
    /// runtime replays a declarative painter and sizes the handle from it).
    #[test]
    fn resize_is_sent_without_a_handler() {
        let (mut app, tx) = app();
        tx.send(vec![create(1, "canvas", serde_json::json!({}))])
            .unwrap();
        app.update();
        let canvas = ent(&app, 1);
        let sent = app
            .world_mut()
            .run_system_once(move |events: ElementEvents| {
                events.send(
                    canvas,
                    &RESIZE,
                    &CanvasSize {
                        width: 4.0,
                        height: 2.0,
                    },
                )
            })
            .unwrap();
        assert!(sent, "resize is unconditional");
    }

    /// A `backgroundImage` on a `<canvas>` is ignored (the canvas owns its
    /// `ImageNode`): no marker components appear and the canvas texture is
    /// left alone.
    #[test]
    fn background_image_ignored_on_canvas() {
        let (mut app, tx) = app();
        tx.send(vec![create(
            1,
            "canvas",
            serde_json::json!({
                "style": { "backgroundImage": {
                    "src": { "texture": "x" }, "mode": "repeat"
                } }
            }),
        )])
        .unwrap();
        app.update();

        let e = ent(&app, 1);
        assert!(
            app.world().entity(e).get::<ImageNode>().is_some(),
            "the canvas keeps its own ImageNode"
        );
        assert!(app.world().entity(e).get::<RBackgroundTexture>().is_none());
        assert!(app.world().entity(e).get::<BackgroundTileScale>().is_none());
    }
}
