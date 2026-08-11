//! Engine-level unit tests: interpolation primitives, the shared-value
//! table + settlement flow, and wire decoding. The apply-system tests live
//! in `apply/tests.rs`.
use super::eval::{piecewise, piecewise_color};
use super::*;

fn timing(to: f32, duration: f32) -> Driver {
    Driver::Timing {
        to,
        duration,
        easing: Easing::Linear,
    }
}

/// Build bindings the way production does: decode a style carrying inline
/// `{ animated }` wrappers and derive (`crate::style_bindings`).
fn style_bindings(style: serde_json::Value) -> AnimatedBindings {
    let style: crate::protocol::style::Style =
        serde_json::from_value(style).expect("style decodes");
    crate::style_bindings::derive_bindings(Some(&style)).expect("style carries bindings")
}

#[test]
fn piecewise_clamps_and_interpolates() {
    let input = [0.0, 1.0];
    let output = [10.0, 20.0];
    assert_eq!(piecewise(-5.0, &input, &output), 10.0); // clamp low
    assert_eq!(piecewise(5.0, &input, &output), 20.0); // clamp high
    assert!((piecewise(0.5, &input, &output) - 15.0).abs() < 1e-6);
    // Multi-segment.
    let input = [0.0, 0.5, 1.0];
    let output = [0.0, 100.0, 0.0];
    assert!((piecewise(0.25, &input, &output) - 50.0).abs() < 1e-6);
    assert!((piecewise(0.75, &input, &output) - 50.0).abs() < 1e-6);
}

#[test]
fn piecewise_color_interpolates_each_channel() {
    let input = [0.0, 1.0];
    let output = [[0.0, 0.0, 0.0, 1.0], [1.0, 0.5, 0.0, 1.0]];
    let mid = piecewise_color(0.5, &input, &output);
    assert!((mid[0] - 0.5).abs() < 1e-6);
    assert!((mid[1] - 0.25).abs() < 1e-6);
    assert!((mid[2] - 0.0).abs() < 1e-6);
    assert!((mid[3] - 1.0).abs() < 1e-6);
}

#[test]
fn shared_values_animate_and_tick_to_target() {
    let mut values = SharedValues::default();
    values.declare(1, 0.0);
    values.animate(1, &timing(100.0, 1.0), None);
    values.tick(0.5);
    assert!((values.get(1).unwrap() - 50.0).abs() < 1e-3);
    values.tick(0.5);
    assert!((values.get(1).unwrap() - 100.0).abs() < 1e-3);
    // Driver dropped once finished; further ticks are inert.
    values.tick(1.0);
    assert!((values.get(1).unwrap() - 100.0).abs() < 1e-3);
}

#[test]
fn declare_is_idempotent_but_set_overrides() {
    let mut values = SharedValues::default();
    values.declare(1, 5.0);
    values.declare(1, 999.0); // ignored — keeps 5.0
    assert_eq!(values.get(1), Some(5.0));
    values.set(1, 7.0);
    assert_eq!(values.get(1), Some(7.0));
    values.clear();
    assert!(values.is_empty());
}

/// A token-tagged driver reports exactly one `finished: true` settlement when
/// it runs to its natural end — and nothing at all without a token.
#[test]
fn tokened_driver_settles_finished_once() {
    let mut values = SharedValues::default();
    values.declare(1, 0.0);
    values.animate(1, &timing(100.0, 1.0), Some(7));
    values.tick(0.5);
    assert!(values.take_settled().is_empty(), "not settled yet");
    values.tick(0.5);
    assert_eq!(
        values.take_settled(),
        vec![AnimationSettled {
            id: 1,
            token: 7,
            finished: true
        }]
    );
    values.tick(1.0);
    assert!(values.take_settled().is_empty(), "reported exactly once");

    // Token-free drivers stay silent.
    values.animate(1, &timing(0.0, 0.1), None);
    values.tick(1.0);
    assert!(values.take_settled().is_empty());
}

/// Interrupting an active token-tagged driver — via `set`, `cancel`, or a
/// superseding `animate` — reports `finished: false` for the old token.
#[test]
fn interrupting_a_tokened_driver_settles_unfinished() {
    let mut values = SharedValues::default();
    values.declare(1, 0.0);

    values.animate(1, &timing(100.0, 1.0), Some(1));
    values.set(1, 50.0);
    assert_eq!(
        values.take_settled(),
        vec![AnimationSettled {
            id: 1,
            token: 1,
            finished: false
        }]
    );

    values.animate(1, &timing(100.0, 1.0), Some(2));
    values.cancel(1);
    assert_eq!(
        values.take_settled(),
        vec![AnimationSettled {
            id: 1,
            token: 2,
            finished: false
        }]
    );

    values.animate(1, &timing(100.0, 1.0), Some(3));
    values.animate(1, &timing(0.0, 1.0), Some(4));
    assert_eq!(
        values.take_settled(),
        vec![AnimationSettled {
            id: 1,
            token: 3,
            finished: false
        }]
    );

    // `clear` (reset/hot reload) drops pending settlements silently.
    values.clear();
    assert!(values.take_settled().is_empty());
}

#[test]
fn driver_deserializes_from_js_wire_shape() {
    // The exact JSON `animated.ts` produces for a nested driver.
    let json = r#"{
        "type": "repeat",
        "animation": {
            "type": "sequence",
            "steps": [
                { "type": "timing", "to": 50, "duration": 0.4, "easing": "easeInOut" },
                { "type": "spring", "to": 120, "stiffness": 120, "damping": 14, "mass": 1 }
            ]
        },
        "count": -1,
        "reverse": true
    }"#;
    let driver: Driver = serde_json::from_str(json).expect("driver decodes");
    assert!(matches!(
        driver,
        Driver::Repeat {
            count: -1,
            reverse: true,
            ..
        }
    ));
}

#[test]
fn command_and_binding_deserialize() {
    let cmd: AnimationCommand =
        serde_json::from_str(r#"{ "kind": "declare", "id": 3, "initial": 0 }"#).unwrap();
    assert!(matches!(cmd, AnimationCommand::Declare { id: 3, .. }));
    let cmd: AnimationCommand = serde_json::from_str(r#"{ "kind": "clear" }"#).unwrap();
    assert!(matches!(cmd, AnimationCommand::Clear));

    // `animate` decodes with and without the completion-callback token (the
    // JS side omits the key entirely when no callback was passed).
    let cmd: AnimationCommand = serde_json::from_str(
        r#"{ "kind": "animate", "id": 1,
             "driver": { "type": "timing", "to": 1 }, "token": 9 }"#,
    )
    .unwrap();
    assert!(matches!(
        cmd,
        AnimationCommand::Animate { token: Some(9), .. }
    ));
    let cmd: AnimationCommand = serde_json::from_str(
        r#"{ "kind": "animate", "id": 1, "driver": { "type": "timing", "to": 1 } }"#,
    )
    .unwrap();
    assert!(matches!(cmd, AnimationCommand::Animate { token: None, .. }));

    let bindings = style_bindings(serde_json::json!({
        "transform": { "translateX": { "animated": { "id": 1 } } },
        "backgroundColor": { "animated": { "type": "interpolateColor", "id": 1,
            "input": [0, 1], "output": [[0,0,0,1],[1,1,1,1]] } },
    }));
    assert!(bindings.contains(AnimatableProperty::TranslateX));
    assert!(bindings.contains(AnimatableProperty::BackgroundColor));
    assert!(bindings.has_transform());
}
