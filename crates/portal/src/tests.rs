//! `<portal>` through the core's real op path.

use bevy::prelude::*;
use bevy::ui::widget::ImageNode;
use bevy_react_core::render_target::TargetView;
use bevy_react_core::test_util::{create, ent, op_app_with, update};

use super::register_bindings;

/// A `<portal>` mounts to an `ImageNode` carrying a `TargetView` with its
/// target name; an update rebinds the name.
#[test]
fn portal_mounts_with_target_and_rebinds() {
    let (mut app, tx) = op_app_with(register_bindings);
    tx.send(vec![create(
        1,
        "portal",
        serde_json::json!({ "target": "follow" }),
    )])
    .unwrap();
    app.update();

    let e = ent(&app, 1);
    assert_eq!(
        app.world()
            .entity(e)
            .get::<TargetView>()
            .map(|p| p.0.clone()),
        Some("follow".to_string()),
        "a portal carries its target name"
    );
    assert!(
        app.world().entity(e).get::<ImageNode>().is_some(),
        "a portal is backed by an ImageNode"
    );

    tx.send(vec![update(
        1,
        "portal",
        serde_json::json!({ "target": "minimap" }),
        &[],
        &[],
    )])
    .unwrap();
    app.update();
    assert_eq!(
        app.world()
            .entity(e)
            .get::<TargetView>()
            .map(|p| p.0.clone()),
        Some("minimap".to_string()),
        "an update rebinds the portal's target name"
    );
}

/// `backgroundImage` on a `<portal>` never reaches its element-owned
/// `ImageNode` (the element opts out of the global writer) and warns
/// `styleIgnored`.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn background_image_on_portal_warns_style_ignored() {
    use bevy_react_core::test_util::{arm_runtime, take_runtime_warnings, test_lock};
    let _lock = test_lock();
    arm_runtime();
    let _ = take_runtime_warnings();

    let (mut app, tx) = op_app_with(register_bindings);
    tx.send(vec![create(
        71,
        "portal",
        serde_json::json!({
            "target": "follow",
            "style": { "backgroundImage": { "src": { "texture": "x" } } },
        }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 71);
    assert!(
        app.world()
            .get::<bevy_react_core::background_image::RBackgroundTexture>(e)
            .is_none()
    );
    let mine: Vec<_> = take_runtime_warnings()
        .into_iter()
        .filter(|w| w.node == Some(71))
        .collect();
    assert!(
        mine.iter()
            .any(|w| w.kind == "styleIgnored" && w.value == "backgroundImage"),
        "got {mine:?}"
    );
}
