//! `<surface>` through the core's real op path.

use bevy::prelude::*;
use bevy_react_core::protocol::{ROOT_ID, op::Op};
use bevy_react_core::test_util::{children_of, create, create_node, ent, op_app_with, update};

use super::RSurface;
use crate::register_bindings;

/// A `<surface>` mounts carrying its name in an `RSurface`, and stays a
/// detached UI root: appending it under a parent must NOT add it to that
/// parent's Bevy `Children` (it renders to its own offscreen camera instead).
#[test]
fn surface_mounts_detached_with_name() {
    let (mut app, tx) = op_app_with(register_bindings);
    tx.send(vec![
        create_node(1), // a normal parent under the root
        create(2, "surface", serde_json::json!({ "target": "monitor" })),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        // React appends the surface under node 1; the core keeps it detached
        // (no Bevy parent) so it is an independent layout root.
        Op::Append {
            parent: 1,
            child: 2,
        },
    ])
    .unwrap();
    app.update();

    let surface = ent(&app, 2);
    let name = |app: &App| {
        app.world()
            .entity(surface)
            .get::<RSurface>()
            .map(|s| s.0.clone())
    };
    assert_eq!(
        name(&app),
        Some("monitor".to_string()),
        "a surface carries its name in RSurface"
    );
    assert!(
        app.world().entity(surface).get::<ChildOf>().is_none(),
        "a surface is a detached root — never parented into the on-screen tree"
    );
    assert!(
        children_of(&app, ent(&app, 1)).is_empty(),
        "the surface's React parent has no Bevy children"
    );

    // An update rebinds the surface name (and never stamps a `TargetView` —
    // the portal's `target` is a different attribute).
    tx.send(vec![update(
        2,
        "surface",
        serde_json::json!({ "target": "panel" }),
        &[],
        &[],
    )])
    .unwrap();
    app.update();
    assert_eq!(
        name(&app),
        Some("panel".to_string()),
        "an update rebinds the surface name"
    );
    assert!(
        app.world()
            .entity(surface)
            .get::<bevy_react_core::render_target::TargetView>()
            .is_none(),
        "a surface update must not stamp a TargetView"
    );
}

/// A `<surface>` fills its texture by default: its default style sets 100% ×
/// 100%, and the user's `style` overlays it.
#[test]
fn surface_fills_its_texture_by_default() {
    let (mut app, tx) = op_app_with(register_bindings);
    tx.send(vec![
        create(1, "surface", serde_json::json!({ "target": "a" })),
        create(
            2,
            "surface",
            serde_json::json!({ "target": "b", "style": { "width": 50 } }),
        ),
    ])
    .unwrap();
    app.update();
    let node = |id| {
        app.world()
            .entity(ent(&app, id))
            .get::<Node>()
            .cloned()
            .unwrap()
    };
    assert_eq!(node(1).width, Val::Percent(100.0));
    assert_eq!(node(1).height, Val::Percent(100.0));
    assert_eq!(node(2).width, Val::Px(50.0), "the user's style overlays");
    assert_eq!(node(2).height, Val::Percent(100.0));
}

/// `backgroundImage` on a `<surface>` is ignored (the element opts out of the
/// global writer) and warns `styleIgnored`.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn background_image_on_surface_warns_style_ignored() {
    use bevy_react_core::test_util::{arm_runtime, take_runtime_warnings, test_lock};
    let _lock = test_lock();
    arm_runtime();
    let _ = take_runtime_warnings();

    let (mut app, tx) = op_app_with(register_bindings);
    tx.send(vec![create(
        73,
        "surface",
        serde_json::json!({
            "target": "monitor",
            "style": { "backgroundImage": { "src": { "texture": "x" } } },
        }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 73);
    assert!(
        app.world()
            .get::<bevy_react_core::background_image::RBackgroundTexture>(e)
            .is_none()
    );
    let mine: Vec<_> = take_runtime_warnings()
        .into_iter()
        .filter(|w| w.node == Some(73))
        .collect();
    assert!(
        mine.iter()
            .any(|w| w.kind == "styleIgnored" && w.value == "backgroundImage"),
        "got {mine:?}"
    );
}
