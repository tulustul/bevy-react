//! The `#[react_*]` macros used the way an app uses them: this crate has no
//! direct `serde` or `ts-rs` dependency, so these only compile if the
//! expansions name `::bevy_react` (resolved from the manifest) and reach
//! serde/ts-rs through its `__private` re-exports.

use bevy::app::App;

use crate::prelude::*;
use crate::{ReactEvent, ReactPayload, ReactRequest};

#[react_message(name = "test.ping")]
struct Ping {
    count: u32,
}

#[react_request(name = "test.get", response = u32)]
struct Get;

#[react_event]
struct Pong {
    count: u32,
}

#[react_filter(name = "testTint", shader = "tint.wgsl")]
struct Tint {
    #[serde(default)]
    amount: f32,
}

#[react_morph_filter(name = "testFade", shader = "fade.wgsl")]
struct Fade {
    #[serde(default)]
    softness: f32,
}

#[test]
fn macros_expand_against_the_facade() {
    assert_eq!(<Ping as ReactPayload>::NAME, "test.ping");
    assert_eq!(<Get as ReactRequest>::NAME, "test.get");
    assert_eq!(<Pong as ReactEvent>::NAME, "pong");

    // Registration and the TypeScript export see the generated impls.
    let mut app = App::new();
    app.add_react_message::<Ping>()
        .add_react_event::<Pong>()
        .add_react_filter::<Tint>()
        .add_react_morph_filter::<Fade>();
    let dir = std::env::temp_dir().join(format!("bevy-react-macro-test-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let path = dir.join("bevy.ts");
    app.export_react_typescript(&path).unwrap();
    let ts = std::fs::read_to_string(&path).unwrap();
    std::fs::remove_dir_all(&dir).ok();
    for name in ["test.ping", "pong", "testTint", "testFade"] {
        assert!(
            ts.contains(name),
            "{name} missing from the generated bevy.ts"
        );
    }
    // Fields are only read by the generated impls.
    let _ = (Ping { count: 0 }.count, Pong { count: 0 }.count);
    let _ = (Tint { amount: 0.0 }.amount, Fade { softness: 0.0 }.softness);
}
