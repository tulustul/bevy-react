//! Global keyboard events: forward window-level keystrokes to React as built-in
//! typed events, independent of any focused node.
//!
//! Unlike a per-node pointer handler, these are app-global: any React component
//! subscribes through the generated typed surface, exactly like every other
//! Bevy → React event:
//!
//! ```ts
//! bevy.on("keyDown", (e) => { if (e.key === "Escape") close(); });
//! bevy.on("keyUp",  (e) => { ... });
//! ```
//!
//! [`KeyDown`] / [`KeyUp`] are framework built-ins: the exporter
//! ([`ts_codegen`](crate::ts_codegen)) always seeds them into the generated
//! `bevy.ts`, so `bevy.on("keyDown", …)` is typed in every app with no
//! registration. Bevy's [`KeyboardInput`] fires on press/release/auto-repeat (not
//! every frame), so [`collect_keyboard_events`] stays quiet while nothing is typed.

use bevy::input::ButtonState;
use bevy::input::keyboard::{Key, KeyCode, KeyboardInput};
use bevy::prelude::*;
use serde::Serialize;
use ts_rs::TS;

use crate::event::ReactEvents;
use crate::react_event;

/// Web-`KeyboardEvent`-like payload carried by [`KeyDown`] / [`KeyUp`]. Out-only.
/// `rename_all` is set for both `serde` and `ts-rs` so the wire JSON and the
/// generated TS type agree (`ctrl_key` → `ctrlKey`).
#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
pub struct KeyboardEventData {
    /// Layout-aware logical key: the typed character (`"a"`, `"A"`) or a named
    /// key (`"Enter"`, `"ArrowLeft"`, `"Escape"`).
    key: String,
    /// Layout-independent physical key, W3C `code` style (`"KeyA"`, `"Enter"`).
    code: String,
    /// The text produced by the key, if any (respects modifiers/IME). `null` for
    /// keys that don't produce text (e.g. arrows, modifiers).
    text: Option<String>,
    /// Whether this is an OS auto-repeat while the key is held.
    repeat: bool,
    ctrl_key: bool,
    shift_key: bool,
    alt_key: bool,
    /// The "Meta"/"Super" key (Windows/Command).
    meta_key: bool,
}

/// Built-in Bevy → React event for a key press (and OS auto-repeat). Subscribe
/// with `bevy.on("keyDown", cb)`. A newtype over [`KeyboardEventData`] so codegen
/// emits `type KeyDown = KeyboardEventData` and the wire payload stays flat.
#[react_event(name = "keyDown")]
pub struct KeyDown(pub KeyboardEventData);

/// Built-in Bevy → React event for a key release. Subscribe with
/// `bevy.on("keyUp", cb)`. See [`KeyDown`].
#[react_event(name = "keyUp")]
pub struct KeyUp(pub KeyboardEventData);

/// Map Bevy's logical [`Key`] to a web-`KeyboardEvent.key`-like string: the raw
/// character for `Character`, else the variant name (`Enter`, `ArrowLeft`, …).
fn logical_key_string(key: &Key) -> String {
    match key {
        Key::Character(s) => s.to_string(),
        other => format!("{other:?}"),
    }
}

/// Forward each [`KeyboardInput`] transition to React as a built-in typed event
/// ([`KeyDown`] / [`KeyUp`]). Registered in the plugin's `Update`.
pub fn collect_keyboard_events(
    mut reader: MessageReader<KeyboardInput>,
    keys: Res<ButtonInput<KeyCode>>,
    events: ReactEvents,
) {
    // Cheap when idle: no messages → the modifier snapshot below is skipped by the
    // empty loop. `ButtonInput` reflects this frame's end state (updated in
    // `PreUpdate`), which is what a keydown's own modifier flags should report.
    if reader.is_empty() {
        return;
    }
    let ctrl = keys.any_pressed([KeyCode::ControlLeft, KeyCode::ControlRight]);
    let shift = keys.any_pressed([KeyCode::ShiftLeft, KeyCode::ShiftRight]);
    let alt = keys.any_pressed([KeyCode::AltLeft, KeyCode::AltRight]);
    let meta = keys.any_pressed([KeyCode::SuperLeft, KeyCode::SuperRight]);

    for ev in reader.read() {
        let data = KeyboardEventData {
            key: logical_key_string(&ev.logical_key),
            code: format!("{:?}", ev.key_code),
            text: ev.text.as_ref().map(|t| t.to_string()),
            repeat: ev.repeat,
            ctrl_key: ctrl,
            shift_key: shift,
            alt_key: alt,
            meta_key: meta,
        };
        match ev.state {
            ButtonState::Pressed => events.send(&KeyDown(data)),
            ButtonState::Released => events.send(&KeyUp(data)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bridge::OutboundResource;
    use crate::protocol::Outbound;
    use bevy::input::keyboard::{Key, KeyCode, KeyboardInput};
    use tokio::sync::mpsc::{UnboundedReceiver, unbounded_channel};

    /// Build a headless `App` whose outbound channel we can drain, with the
    /// keyboard system registered. Returns the app and the receiving end.
    fn test_app() -> (App, UnboundedReceiver<Outbound>) {
        let mut app = App::new();
        app.add_plugins(MinimalPlugins);
        // `collect_keyboard_events` needs the `KeyboardInput` message + the
        // `ButtonInput<KeyCode>` resource; register both without full `DefaultPlugins`.
        app.add_message::<KeyboardInput>();
        app.init_resource::<ButtonInput<KeyCode>>();

        // A tokio unbounded channel stands in for the real outbound sender so the
        // test can assert what crossed the boundary. On this (non-wasm) target
        // `OutboundSender` is `tokio::sync::mpsc::UnboundedSender`.
        let (tx, rx) = unbounded_channel::<Outbound>();
        app.insert_resource(OutboundResource(tx));
        app.add_systems(Update, collect_keyboard_events);
        (app, rx)
    }

    fn write_key(app: &mut App, key_code: KeyCode, logical: Key, state: ButtonState) {
        app.world_mut().write_message(KeyboardInput {
            key_code,
            logical_key: logical,
            state,
            text: match state {
                ButtonState::Pressed => Some("a".into()),
                ButtonState::Released => None,
            },
            repeat: false,
            window: Entity::PLACEHOLDER,
        });
    }

    #[test]
    fn key_press_and_release_produce_named_events() {
        let (mut app, mut rx) = test_app();

        write_key(
            &mut app,
            KeyCode::KeyA,
            Key::Character("a".into()),
            ButtonState::Pressed,
        );
        app.update();

        let ev = rx.try_recv().expect("a keyDown event");
        match ev {
            Outbound::Event { name, value } => {
                assert_eq!(name, "keyDown");
                assert_eq!(value["key"], "a");
                assert_eq!(value["code"], "KeyA");
                assert_eq!(value["text"], "a");
                assert_eq!(value["repeat"], false);
                assert_eq!(value["ctrlKey"], false);
            }
            other => panic!("expected Outbound::Event, got {other:?}"),
        }

        write_key(
            &mut app,
            KeyCode::KeyA,
            Key::Character("a".into()),
            ButtonState::Released,
        );
        app.update();

        match rx.try_recv().expect("a keyUp event") {
            Outbound::Event { name, .. } => assert_eq!(name, "keyUp"),
            other => panic!("expected Outbound::Event, got {other:?}"),
        }
    }

    #[test]
    fn named_key_maps_to_variant_name() {
        let (mut app, mut rx) = test_app();
        write_key(&mut app, KeyCode::Escape, Key::Escape, ButtonState::Pressed);
        app.update();

        match rx.try_recv().expect("a keyDown event") {
            Outbound::Event { value, .. } => {
                assert_eq!(value["key"], "Escape");
                assert_eq!(value["code"], "Escape");
            }
            other => panic!("expected Outbound::Event, got {other:?}"),
        }
    }

    #[test]
    fn idle_frame_sends_nothing() {
        let (mut app, mut rx) = test_app();
        app.update();
        assert!(rx.try_recv().is_err());
    }
}
