//! `docs/reference/bevy.ts`: the library's own typed surface — every
//! compiled-in feature's elements plus the built-in filters, messages,
//! requests, and events (the exporter seeds those itself) — exported from a
//! bare `App` with no app bindings. The docs site's generated reference pages
//! parse it; this test keeps it current. Only the default feature set
//! produces the committed file, so the test is gated on it.
#![cfg(all(
    feature = "svg",
    feature = "anchor",
    feature = "canvas",
    feature = "portal",
    feature = "surface"
))]

use std::path::Path;

use bevy::app::App;
use bevy_react::prelude::*;

#[test]
fn library_ts_is_current() {
    let committed_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../docs/reference/bevy.ts");
    let out = Path::new(env!("CARGO_TARGET_TMPDIR")).join("library.ts");
    let mut app = App::new();
    ReactPlugins::register_bindings(&mut app);
    app.export_react_typescript(&out).unwrap();
    let rendered = std::fs::read_to_string(&out).unwrap();
    if std::env::var_os("UPDATE_LIBRARY_TS").is_some() {
        std::fs::create_dir_all(committed_path.parent().unwrap()).unwrap();
        std::fs::write(&committed_path, &rendered).unwrap();
        return;
    }
    let committed = std::fs::read_to_string(&committed_path).unwrap_or_default();
    assert!(
        committed == rendered,
        "docs/reference/bevy.ts is stale — regenerate with `npm run reference:generate`"
    );
}
