//! `<cube>` through the real op path (the core's `test_util` harness): the
//! entity it spawns, attribute updates, driven values, lifetime, and the
//! pointer plumbing.

use bevy::picking::Pickable;
use bevy::picking::backend::HitData;
use bevy::picking::hover::HoverMap;
use bevy::picking::pointer::PointerId;
use bevy::prelude::*;
use bevy_react::ext::{DrivenExt, DrivenExtValues, DrivenValue};
use bevy_react::protocol::{ROOT_ID, op::Op};
use bevy_react_core::test_util::{create, create_node, ent, op_app_with, update};
use serde_json::json;

use super::{Cube, register_bindings, register_systems};

fn cube_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    op_app_with(|app| {
        app.init_asset::<Mesh>();
        app.init_asset::<StandardMaterial>();
        register_bindings(app);
        register_systems(app);
    })
}

/// Mount `<node id=1><cube id=2 {props} /></node>` under the root; two
/// frames, so the cube systems (ordered after the op drain in the real app)
/// see the spawned entity.
fn mount(props: serde_json::Value) -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (mut app, tx) = cube_app();
    tx.send(vec![
        create_node(1),
        create(2, "cube", props),
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
    app.update();
    (app, tx)
}

fn transform(app: &App) -> Transform {
    *app.world().entity(ent(app, 2)).get::<Transform>().unwrap()
}

fn color(app: &App) -> Srgba {
    let entity = app.world().entity(ent(app, 2));
    let handle = entity.get::<MeshMaterial3d<StandardMaterial>>().unwrap();
    let materials = app.world().resource::<Assets<StandardMaterial>>();
    materials.get(&handle.0).unwrap().base_color.to_srgba()
}

fn assert_close(a: f32, b: f32) {
    assert!((a - b).abs() < 1e-4, "{a} != {b}");
}

/// A cube is a mesh entity with no layout box, never parented under its
/// React parent, placed and colored from its attributes.
#[test]
fn cube_mounts_as_a_detached_mesh() {
    let (app, _tx) = mount(json!({
        "size": 2.0, "x": 1.0, "y": 2.0, "z": 3.0, "rotateY": 90.0, "color": "#ff0000",
    }));
    let entity = app.world().entity(ent(&app, 2));
    assert!(entity.contains::<Cube>());
    assert!(entity.contains::<Mesh3d>());
    assert!(entity.get::<Node>().is_none(), "a cube has no layout box");
    assert!(
        entity.get::<ChildOf>().is_none(),
        "a cube is never parented under its React parent"
    );

    let t = transform(&app);
    assert_eq!(t.translation, Vec3::new(1.0, 2.0, 3.0));
    assert_eq!(t.scale, Vec3::splat(2.0));
    let (axis, angle) = t.rotation.to_axis_angle();
    assert_close(axis.y.abs(), 1.0);
    assert_close(angle, 90f32.to_radians());
    assert_eq!(color(&app), Srgba::new(1.0, 0.0, 0.0, 1.0));
}

/// Absent attributes fall back to the defaults: unit size at the origin,
/// white.
#[test]
fn cube_defaults() {
    let (app, _tx) = mount(json!({}));
    assert_eq!(transform(&app), Transform::default());
    assert_eq!(color(&app), Srgba::WHITE);
}

/// A delta re-places and re-colors the cube; unsetting an attribute
/// restores its default.
#[test]
fn cube_updates_and_unsets() {
    let (mut app, tx) = mount(json!({ "size": 2.0, "color": "red" }));
    tx.send(vec![update(
        2,
        "cube",
        json!({ "color": "blue", "y": 4.0 }),
        &["size"],
        &[],
    )])
    .unwrap();
    app.update();
    app.update();
    let t = transform(&app);
    assert_eq!(t.scale, Vec3::ONE, "unset size is the default");
    assert_eq!(t.translation.y, 4.0);
    assert_eq!(color(&app), Srgba::new(0.0, 0.0, 1.0, 1.0));
}

/// Bound attributes render their seed until the engine publishes, then
/// follow the driven values — a number for `size`, a color for `color`.
#[test]
fn cube_follows_driven_values() {
    let (mut app, _tx) = mount(json!({
        "size": { "animated": { "id": 1 }, "seed": 2.0 },
        "color": { "animated": { "type": "interpolateColor", "id": 2,
            "input": [0, 1], "output": [[1, 0, 0, 1], [0, 0, 1, 1]] } },
    }));
    assert_eq!(transform(&app).scale, Vec3::splat(2.0), "the seed renders");
    assert_eq!(
        color(&app),
        Srgba::WHITE,
        "a seed-less color is the default"
    );

    let cube = ent(&app, 2);
    app.world_mut()
        .entity_mut(cube)
        .insert(DrivenExtValues(vec![
            DrivenExt {
                domain: "cube",
                name: "size".into(),
                value: DrivenValue::Scalar(3.0),
            },
            DrivenExt {
                domain: "cube",
                name: "color".into(),
                value: DrivenValue::Color([0.0, 1.0, 0.0, 1.0]),
            },
        ]));
    app.update();
    assert_eq!(transform(&app).scale, Vec3::splat(3.0));
    assert_eq!(color(&app), Srgba::new(0.0, 1.0, 0.0, 1.0));
}

/// Removing the React parent despawns the detached cube with it.
#[test]
fn removing_the_parent_despawns_the_cube() {
    let (mut app, tx) = mount(json!({}));
    let cube = ent(&app, 2);
    tx.send(vec![Op::Remove {
        parent: ROOT_ID,
        child: 1,
    }])
    .unwrap();
    app.update();
    assert!(
        app.world().get_entity(cube).is_err(),
        "the cube is despawned"
    );
}

/// A cube is pickable exactly while it has pointer handlers, and the hover
/// map drives its `Interaction`.
#[test]
fn handlers_make_the_cube_pickable_and_hoverable() {
    let (mut app, tx) = mount(json!({}));
    let cube = ent(&app, 2);
    assert!(!app.world().entity(cube).contains::<Pickable>());

    tx.send(vec![update(
        2,
        "cube",
        json!({ "onPointerEnter": true }),
        &[],
        &[],
    )])
    .unwrap();
    app.update();
    app.update();
    assert!(app.world().entity(cube).contains::<Pickable>());

    let mut hover = HoverMap::default();
    hover
        .0
        .entry(PointerId::Mouse)
        .or_default()
        .insert(cube, HitData::new(Entity::PLACEHOLDER, 1.0, None, None));
    app.world_mut().insert_resource(hover);
    app.update();
    assert_eq!(
        app.world().entity(cube).get::<Interaction>(),
        Some(&Interaction::Hovered)
    );

    tx.send(vec![update(2, "cube", json!({}), &["onPointerEnter"], &[])])
        .unwrap();
    app.update();
    app.update();
    assert!(
        !app.world().entity(cube).contains::<Pickable>(),
        "the last handler gone, the cube leaves picking"
    );
}
