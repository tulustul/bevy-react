//! Real-pipeline pins for the refined shape hit's **hover-map** contract: the
//! shape hit must not hide its `<svg>` root and the root's ancestors from
//! bevy_picking. bevy's `build_hover_map` treats an entity **without** a
//! `Pickable` as blocking (it inserts the entity, then `break`s), so a
//! Node-less shape at the top of the stack would otherwise swallow the hover
//! map for everything beneath it — no `Interaction`, no press, no
//! `Pointer<Click>` for an enclosing `<button>` or its press surface.
//!
//! Harness: the reconciler's real op path (`apply_js_ops` builds the tree, so
//! the stamping under test is the production one) plus bevy's own
//! `PickingPlugin` + `InteractionPlugin`, a feeder in the `Backend` set
//! standing in for the bevy_ui backend (topmost first, `0.00001` per node),
//! the refinement in its production slot, and a `PointerId::Custom` pointer
//! driven by `PointerInput` press/move/release (the pick3d / surface
//! virtual-pointer path). No layout runs: the svg root's box is set by hand.

use bevy::camera::{Camera, ImageRenderTarget, NormalizedRenderTarget};
use bevy::picking::backend::{HitData, PointerHits};
use bevy::picking::hover::HoverMap;
use bevy::picking::pointer::{
    Location, PointerAction, PointerButton, PointerId, PointerInput, PointerInteraction,
    PointerLocation, PointerPress,
};
use bevy::picking::{InteractionPlugin, PickingPlugin, PickingSystems};
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};

use super::{SvgPointerShapeHits, refine_svg_pointer_hits};
use crate::bridge::JsBridge;
use crate::protocol::op::Op;
use crate::protocol::outbound::Outbound;
use crate::reconcile::collect_ui_events;

const POINTER: PointerId = PointerId::Custom(uuid::Uuid::from_u128(0x51C6));

/// Scale-1 image target: logical == physical. Over the circle's center.
fn location() -> Location {
    location_at(Vec2::new(30.0, 30.0))
}

fn location_at(position: Vec2) -> Location {
    Location {
        target: NormalizedRenderTarget::Image(ImageRenderTarget {
            handle: Handle::default(),
            scale_factor: 1.0,
        }),
        position,
    }
}

/// What the bevy_ui backend would report: the Node entities under the cursor,
/// topmost first.
#[derive(Resource)]
struct NodeStack {
    camera: Entity,
    topmost_first: Vec<Entity>,
}

fn feed_node_hits(stack: Res<NodeStack>, mut hits: MessageWriter<PointerHits>) {
    let picks = stack
        .topmost_first
        .iter()
        .enumerate()
        .map(|(i, e)| {
            (
                *e,
                HitData::new(stack.camera, i as f32 * 0.00001, None, None),
            )
        })
        .collect();
    hits.write(PointerHits::new(POINTER, picks, 0.5));
}

fn input(app: &mut App, action: PointerAction) {
    app.world_mut()
        .write_message(PointerInput::new(POINTER, location(), action));
}

fn hovered(app: &App) -> Vec<Entity> {
    app.world()
        .resource::<HoverMap>()
        .get(&POINTER)
        .map(|m| m.keys().copied().collect())
        .unwrap_or_default()
}

/// The `op_app` harness with the outbound receiver kept (the shared one
/// leaks it), plus bevy picking and the refinement in its production slot.
fn real_app() -> (
    App,
    crossbeam_channel::Sender<Vec<Op>>,
    tokio::sync::mpsc::UnboundedReceiver<Outbound>,
) {
    let mut app = App::new();
    app.add_plugins((
        MinimalPlugins,
        bevy::asset::AssetPlugin::default(),
        PickingPlugin,
        InteractionPlugin,
    ));
    app.init_asset::<Image>();
    app.init_asset::<bevy::image::TextureAtlasLayout>();
    app.init_asset::<crate::svg::SvgDocument>();
    app.register_asset_loader(crate::svg::SvgAssetLoader);
    app.init_resource::<crate::plugin::Fonts>();
    app.init_resource::<crate::reconcile::OpApplyStats>();
    app.init_resource::<crate::ui_map::AtlasLayoutCache>();
    app.init_resource::<SvgPointerShapeHits>();
    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    let ui_root = app.world_mut().spawn_empty().id();
    app.insert_resource(JsBridge::new(ops_rx, out_tx, ui_root));
    app.add_systems(
        Update,
        (crate::reconcile::apply_js_ops, collect_ui_events).chain(),
    );
    app.add_systems(
        PreUpdate,
        (
            feed_node_hits.in_set(PickingSystems::Backend),
            refine_svg_pointer_hits
                .after(PickingSystems::Backend)
                .before(PickingSystems::Hover),
        ),
    );
    let camera = app.world_mut().spawn(Camera::default()).id();
    app.world_mut().spawn((
        POINTER,
        PointerLocation::new(location()),
        PointerPress::default(),
        PointerInteraction::default(),
    ));
    app.insert_resource(NodeStack {
        camera,
        topmost_first: Vec::new(),
    });
    (app, ops_tx, out_rx)
}

fn create(id: u32, kind: &str, props: serde_json::Value) -> Op {
    Op::Create {
        id,
        kind: kind.into(),
        props: serde_json::from_value(props).expect("valid props"),
        text: None,
    }
}

fn append(parent: u32, child: u32) -> Op {
    Op::Append { parent, child }
}

/// The Radio pill as the reconciler builds it: Pinchable's press surface
/// (`onPointer*`, block) > `<button onClick>` (pass) > `<svg>` > `<g>` >
/// `<rect>` under the cursor. Pressing and releasing on the rect must click
/// the `<button>`.
#[test]
fn real_ops_press_release_on_shape_clicks_button() {
    let (mut app, tx, mut rx) = real_app();
    tx.send(vec![
        create(
            1,
            "node",
            serde_json::json!({
                "onPointerDown": true, "onPointerUp": true, "onPointerLeave": true,
                "style": { "focusPolicy": "block" }
            }),
        ),
        create(
            2,
            "button",
            serde_json::json!({ "onClick": true, "style": { "focusPolicy": "pass" } }),
        ),
        create(3, "svg", serde_json::json!({})),
        create(4, "g", serde_json::json!({})),
        create(
            5,
            "rect",
            serde_json::json!({ "shape": { "x": 0.0, "y": 0.0, "width": 100.0, "height": 100.0 } }),
        ),
        append(crate::protocol::ROOT_ID, 1),
        append(1, 2),
        append(2, 3),
        append(3, 4),
        append(4, 5),
    ])
    .unwrap();
    app.update();
    let ent = |app: &App, id: u32| crate::reconcile::test_util::ent(app, id);
    let (surface, button, root) = (ent(&app, 1), ent(&app, 2), ent(&app, 3));
    // No layout system here: give the svg root its laid-out box by hand.
    app.world_mut().entity_mut(root).insert((
        ComputedNode {
            size: Vec2::splat(100.0),
            ..Default::default()
        },
        UiGlobalTransform::from_translation(Vec2::splat(50.0)),
    ));
    app.world_mut().resource_mut::<NodeStack>().topmost_first = vec![root, button, surface];

    input(&mut app, PointerAction::Press(PointerButton::Primary));
    app.update();
    let hovered = hovered(&app);
    input(&mut app, PointerAction::Release(PointerButton::Primary));
    app.update();

    let mut ids = Vec::new();
    while let Ok(Outbound::UiEvent { event }) = rx.try_recv() {
        if event.kind == "click" {
            ids.push(event.id);
        }
    }
    assert!(
        hovered.contains(&button),
        "the <button> must be hovered beneath the shape hit: {hovered:?} (clicks: {ids:?})"
    );
    assert_eq!(ids, vec![2], "the click belongs to the <button> (node 2)");
}

/// The real-mouse case that loses the click: press on a thin shape, jitter
/// onto the svg's empty region, release. bevy's `Click` needs one entity
/// pressed AND hovered at release, so the shape gets none — the `<button>`
/// must, which requires it to have been hovered beneath the shape hit.
#[test]
fn real_ops_press_on_shape_release_off_shape_still_clicks_button() {
    let (mut app, tx, mut rx) = real_app();
    tx.send(vec![
        create(
            2,
            "button",
            serde_json::json!({ "onClick": true, "style": { "focusPolicy": "pass" } }),
        ),
        create(3, "svg", serde_json::json!({})),
        create(
            5,
            "rect",
            serde_json::json!({ "shape": { "x": 20.0, "y": 20.0, "width": 20.0, "height": 20.0 } }),
        ),
        append(crate::protocol::ROOT_ID, 2),
        append(2, 3),
        append(3, 5),
    ])
    .unwrap();
    app.update();
    let ent = |app: &App, id: u32| crate::reconcile::test_util::ent(app, id);
    let (button, root) = (ent(&app, 2), ent(&app, 3));
    app.world_mut().entity_mut(root).insert((
        ComputedNode {
            size: Vec2::splat(100.0),
            ..Default::default()
        },
        UiGlobalTransform::from_translation(Vec2::splat(50.0)),
    ));
    app.world_mut().resource_mut::<NodeStack>().topmost_first = vec![root, button];

    // Press on the rect (30,30), drift to the empty region (80,80), release.
    input(&mut app, PointerAction::Press(PointerButton::Primary));
    app.update();
    app.world_mut().write_message(PointerInput::new(
        POINTER,
        location_at(Vec2::splat(80.0)),
        PointerAction::Move {
            delta: Vec2::splat(50.0),
        },
    ));
    app.update();
    app.world_mut().write_message(PointerInput::new(
        POINTER,
        location_at(Vec2::splat(80.0)),
        PointerAction::Release(PointerButton::Primary),
    ));
    app.update();

    let mut ids = Vec::new();
    while let Ok(Outbound::UiEvent { event }) = rx.try_recv() {
        if event.kind == "click" {
            ids.push(event.id);
        }
    }
    assert_eq!(
        ids,
        vec![2],
        "press on shape + release beside it clicks the <button>"
    );
}
