//! Headless checks for the animations engine wiring: it's on by default and can
//! be opted out with `.with_animations(false)`. We only inspect resources after
//! the plugin builds (no `app.update()`), so no GPU/window is needed.

use bevy::prelude::*;
use bevy_react::ReactUiPlugin;
use bevy_react::bevy_react_animations::SharedValues;

/// Minimal app + vendor bundles so `ReactUiPlugin::build` (which panics on a
/// missing bundle) is satisfied. The plugin loads `vendor.js` beside the app
/// bundle, so we create both. Classic scripts (no ES-module syntax), since the
/// runtime runs them via `execute_script`. Unique per test to avoid races.
fn temp_bundle(tag: &str) -> std::path::PathBuf {
    let dir = std::env::temp_dir().join(format!("bevy_react_anim_{tag}"));
    std::fs::create_dir_all(&dir).expect("create temp bundle dir");
    let app = dir.join("app.js");
    std::fs::write(&app, b"// no-op test app\n").expect("write temp app");
    std::fs::write(dir.join("vendor.js"), b"// no-op vendor\n").expect("write temp vendor");
    app
}

#[test]
fn animations_enabled_by_default() {
    let bundle = temp_bundle("default");
    let mut app = App::new();
    app.add_plugins(ReactUiPlugin::new(&bundle).hot_reload(false));
    assert!(
        app.world().get_resource::<SharedValues>().is_some(),
        "SharedValues should be present when animations are enabled (the default)"
    );
}

#[test]
fn animations_can_be_disabled() {
    let bundle = temp_bundle("disabled");
    let mut app = App::new();
    app.add_plugins(
        ReactUiPlugin::new(&bundle)
            .hot_reload(false)
            .with_animations(false),
    );
    assert!(
        app.world().get_resource::<SharedValues>().is_none(),
        "SharedValues must be absent when .with_animations(false)"
    );
}
