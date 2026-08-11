//! Gamepad support: connection lifecycle and input changes pushed to React as
//! built-in typed events, and rumble driven back from JS.
//!
//! Three Bevy → React events (subscribe via the generated typed surface):
//!
//! ```ts
//! bevy.on("gamepadConnected",    (p) => { ... });  // { gamepad, name, vendorId, productId }
//! bevy.on("gamepadDisconnected", (p) => { ... });  // { gamepad }
//! bevy.on("gamepadInput",        (p) => { ... });  // { buttons: [...], axes: [...] }
//! ```
//!
//! And two fire-and-forget React → Bevy messages for force feedback, surfaced
//! on the proxy via their dotted names: `bevy.gamepad.rumble({...})` /
//! `bevy.gamepad.stopRumble({...})` (duration in **milliseconds**, web-like) —
//! plus the pull request `bevy.gamepad.getAll()`, the `bevy.window.size()`
//! of this module: components that mount after a pad connected missed its
//! `gamepadConnected` event, so they seed from the pull on mount:
//!
//! ```ts
//! useEffect(() => {
//!   void bevy.gamepad.getAll().then(seedPads); // already-connected pads
//!   return bevy.on("gamepadConnected", addPad); // live updates
//! }, []);
//! ```
//!
//! Like the [`keyboard`](crate::keyboard) events, all of these are framework
//! built-ins: the exporter ([`ts_codegen`](crate::ts_codegen)) always seeds
//! them into the generated `bevy.ts`, so they are typed in every app with no
//! registration.
//!
//! Semantics worth knowing:
//!
//! - **Ids are monotonic and never reused.** Each connection gets a fresh
//!   `gamepad` id (a reconnecting pad too) — unlike the web's reusable
//!   `Gamepad.index`, a stale id can never silently refer to a new device.
//! - **One `gamepadInput` per frame.** The settings-filtered
//!   [`GamepadEvent`] stream (deadzones/thresholds already applied by
//!   `bevy_input`) is coalesced per frame, every change kept in order. Idle
//!   pads emit nothing.
//! - **Sticks are Bevy-convention: up is `+1`.** The web Gamepad API is
//!   inverted (down is positive); values here cross unchanged.
//! - Button/axis names are Bevy's enum names, camelCased (`"south"`,
//!   `"dPadUp"`, `"leftTrigger2"`); non-standard inputs cross as
//!   `{ "other": n }`.
//! - Connection events are gated on the first applied UI batch (the same
//!   listener-race gate `"resize"` uses): pads connected before the app
//!   mounted are announced once the gate opens, so JS never misses one.

use std::collections::BTreeMap;
use std::time::Duration;

use bevy::input::gamepad::{
    GamepadAxis, GamepadButton, GamepadConnection, GamepadConnectionEvent, GamepadEvent,
    GamepadRumbleIntensity, GamepadRumbleRequest,
};
use bevy::log::warn;
use bevy::prelude::*;
use serde::Serialize;
use ts_rs::TS;

use crate::event::ReactEvents;
use crate::reconcile::OpApplyStats;
use crate::request::Request;
use crate::{react_event, react_message, react_request};

/// Wire name for a gamepad button: Bevy's [`GamepadButton`] variants,
/// camelCased. External serde tagging makes unit variants plain strings and
/// `Other(n)` an `{ "other": n }` object — in both the JSON and the generated
/// TS union.
#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
pub enum GamepadButtonName {
    South,
    East,
    North,
    West,
    C,
    Z,
    LeftTrigger,
    LeftTrigger2,
    RightTrigger,
    RightTrigger2,
    Select,
    Start,
    Mode,
    LeftThumb,
    RightThumb,
    DPadUp,
    DPadDown,
    DPadLeft,
    DPadRight,
    /// Non-standard button (flight-stick extras and the like).
    Other(u8),
}

/// Wire name for a gamepad axis: Bevy's [`GamepadAxis`] variants, camelCased.
/// Same shape rules as [`GamepadButtonName`].
#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
pub enum GamepadAxisName {
    LeftStickX,
    LeftStickY,
    LeftZ,
    RightStickX,
    RightStickY,
    RightZ,
    /// Non-standard axis (HOTAS sliders, potentiometers, …).
    Other(u8),
}

// Both matches are deliberately wildcard-free: a Bevy upgrade that grows the
// enum must fail to compile here rather than silently dropping inputs.
impl From<GamepadButton> for GamepadButtonName {
    fn from(button: GamepadButton) -> Self {
        match button {
            GamepadButton::South => Self::South,
            GamepadButton::East => Self::East,
            GamepadButton::North => Self::North,
            GamepadButton::West => Self::West,
            GamepadButton::C => Self::C,
            GamepadButton::Z => Self::Z,
            GamepadButton::LeftTrigger => Self::LeftTrigger,
            GamepadButton::LeftTrigger2 => Self::LeftTrigger2,
            GamepadButton::RightTrigger => Self::RightTrigger,
            GamepadButton::RightTrigger2 => Self::RightTrigger2,
            GamepadButton::Select => Self::Select,
            GamepadButton::Start => Self::Start,
            GamepadButton::Mode => Self::Mode,
            GamepadButton::LeftThumb => Self::LeftThumb,
            GamepadButton::RightThumb => Self::RightThumb,
            GamepadButton::DPadUp => Self::DPadUp,
            GamepadButton::DPadDown => Self::DPadDown,
            GamepadButton::DPadLeft => Self::DPadLeft,
            GamepadButton::DPadRight => Self::DPadRight,
            GamepadButton::Other(n) => Self::Other(n),
        }
    }
}

impl From<GamepadAxis> for GamepadAxisName {
    fn from(axis: GamepadAxis) -> Self {
        match axis {
            GamepadAxis::LeftStickX => Self::LeftStickX,
            GamepadAxis::LeftStickY => Self::LeftStickY,
            GamepadAxis::LeftZ => Self::LeftZ,
            GamepadAxis::RightStickX => Self::RightStickX,
            GamepadAxis::RightStickY => Self::RightStickY,
            GamepadAxis::RightZ => Self::RightZ,
            GamepadAxis::Other(n) => Self::Other(n),
        }
    }
}

/// Payload of [`GamepadConnected`]: the pad's wire id plus the metadata Bevy
/// carries on the connection event (web smashes vendor/product into the `id`
/// string; here they stay structured).
#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
pub struct GamepadConnectedData {
    /// Monotonic wire id — never reused across reconnects.
    gamepad: u32,
    /// OS-provided device name.
    name: String,
    /// USB vendor id, when the backend knows it.
    vendor_id: Option<u16>,
    /// USB product id, when the backend knows it.
    product_id: Option<u16>,
}

/// Built-in Bevy → React event: a gamepad connected (or was already connected
/// when the app mounted). Subscribe with `bevy.on("gamepadConnected", cb)`.
#[react_event(name = "gamepadConnected")]
pub struct GamepadConnected(pub GamepadConnectedData);

/// Payload of [`GamepadDisconnected`].
#[derive(Serialize, TS)]
pub struct GamepadDisconnectedData {
    /// The wire id the pad was announced under. Retired for good.
    gamepad: u32,
}

/// Built-in Bevy → React event: a gamepad disconnected. Subscribe with
/// `bevy.on("gamepadDisconnected", cb)`.
#[react_event(name = "gamepadDisconnected")]
pub struct GamepadDisconnected(pub GamepadDisconnectedData);

/// One button change within a [`GamepadInputEvent`] batch.
#[derive(Serialize, TS)]
pub struct GamepadButtonChange {
    gamepad: u32,
    button: GamepadButtonName,
    /// Digital state after the change (thresholds from `GamepadSettings`).
    pressed: bool,
    /// Analog value in `0.0..=1.0` (triggers report the full range).
    value: f32,
}

/// One axis change within a [`GamepadInputEvent`] batch. Sticks are
/// `-1.0..=1.0`, **up = +1** (Bevy convention; the web is inverted).
#[derive(Serialize, TS)]
pub struct GamepadAxisChange {
    gamepad: u32,
    axis: GamepadAxisName,
    value: f32,
}

/// Payload of [`GamepadInputEvent`]: every settings-filtered change of the
/// frame, in order, across all pads.
#[derive(Serialize, TS)]
pub struct GamepadInputData {
    buttons: Vec<GamepadButtonChange>,
    axes: Vec<GamepadAxisChange>,
}

/// Built-in Bevy → React event: at most one per frame, only when something
/// changed. Subscribe with `bevy.on("gamepadInput", cb)`. (Named
/// `GamepadInputEvent` Rust-side — `bevy_input` already owns `GamepadInput` —
/// but the wire event name is `"gamepadInput"`.)
#[react_event(name = "gamepadInput")]
pub struct GamepadInputEvent(pub GamepadInputData);

/// Built-in React → Bevy message: start (or restart) rumbling a pad —
/// `bevy.gamepad.rumble({...})`, fire-and-forget. Unknown ids are logged and
/// ignored; rumble itself is best-effort (platform/pad support varies).
#[react_message(name = "gamepad.rumble")]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
pub struct GamepadRumble {
    /// Wire id from [`GamepadConnected`].
    gamepad: u32,
    /// Milliseconds (web-`playEffect`-like). Negative values clamp to 0.
    duration: f32,
    /// Low-frequency motor intensity, clamped to `0.0..=1.0`.
    strong_motor: f32,
    /// High-frequency motor intensity, clamped to `0.0..=1.0`.
    weak_motor: f32,
}

/// Built-in React → Bevy message: stop all rumble on a pad —
/// `bevy.gamepad.stopRumble({...})`.
#[react_message(name = "gamepad.stopRumble")]
pub struct GamepadStopRumble {
    gamepad: u32,
}

/// Built-in React → Bevy request: pull every currently-connected pad —
/// `bevy.gamepad.getAll()` (unit payload → zero-arg proxy method). The pull
/// companion to [`GamepadConnected`], for components that mount after the pad
/// connected and so missed the event (the same late-mount pattern as
/// `bevy.window.size()` + `"resize"`). Resolves with `[]` when nothing is
/// connected.
#[react_request(name = "gamepad.getAll", response = Vec<GamepadConnectedData>)]
pub struct GamepadGetAll;

/// A connected pad's identity as announced to JS.
struct PadInfo {
    entity: Entity,
    name: String,
    vendor_id: Option<u16>,
    product_id: Option<u16>,
}

/// Entity ↔ wire-id map for connected pads. Ids are monotonic and never
/// reused: a reconnect (same entity or not) gets a fresh id. `BTreeMap` keys
/// give the late-join announce sweep a deterministic order.
#[derive(Resource, Default)]
pub(crate) struct GamepadRegistry {
    next_id: u32,
    pads: BTreeMap<u32, PadInfo>,
}

impl GamepadRegistry {
    /// Register a connection. A fresh entity gets a fresh id (`is_new` true).
    /// An entity that is ALREADY registered refreshes its metadata in place
    /// and keeps its id (`is_new` false) — defensive: a backend re-announcing
    /// a live pad must not burn ids or ghost a second JS-side pad. A real
    /// reconnect always has a `Disconnected` in between (which removes the
    /// entry, so it lands on the fresh-id path).
    fn connect(
        &mut self,
        entity: Entity,
        name: String,
        vendor_id: Option<u16>,
        product_id: Option<u16>,
    ) -> (u32, bool) {
        if let Some(id) = self.id_for(entity) {
            let pad = self.pads.get_mut(&id).expect("id_for returned a live id");
            pad.name = name;
            pad.vendor_id = vendor_id;
            pad.product_id = product_id;
            return (id, false);
        }
        let id = self.next_id;
        self.next_id += 1;
        self.pads.insert(
            id,
            PadInfo {
                entity,
                name,
                vendor_id,
                product_id,
            },
        );
        (id, true)
    }

    /// Drop the pad for `entity`, returning the wire id it was known under.
    fn disconnect(&mut self, entity: Entity) -> Option<u32> {
        let id = self.id_for(entity)?;
        self.pads.remove(&id);
        Some(id)
    }

    /// Wire id for a pad entity. Linear scan — pad counts are tiny.
    fn id_for(&self, entity: Entity) -> Option<u32> {
        self.iter()
            .find(|(_, pad)| pad.entity == entity)
            .map(|(id, _)| id)
    }

    /// Pad entity for a wire id (the rumble direction).
    fn entity_for(&self, id: u32) -> Option<Entity> {
        self.pads.get(&id).map(|pad| pad.entity)
    }

    fn iter(&self) -> impl Iterator<Item = (u32, &PadInfo)> {
        self.pads.iter().map(|(id, pad)| (*id, pad))
    }
}

fn connected_data(id: u32, pad: &PadInfo) -> GamepadConnectedData {
    GamepadConnectedData {
        gamepad: id,
        name: pad.name.clone(),
        vendor_id: pad.vendor_id,
        product_id: pad.product_id,
    }
}

/// Forward the settings-filtered [`GamepadEvent`] stream to React: connection
/// events as they happen, button/axis changes coalesced into at most one
/// [`GamepadInputEvent`] per frame. Gated on the first applied op batch (JS
/// listeners don't exist before it); the frame the gate opens, every
/// already-connected pad is announced — before any input — so connect always
/// precedes input JS-side. Registered in the plugin's `Update`.
pub(crate) fn collect_gamepad_events(
    stats: Res<OpApplyStats>,
    mut connections: MessageReader<GamepadConnectionEvent>,
    mut reader: MessageReader<GamepadEvent>,
    mut registry: ResMut<GamepadRegistry>,
    events: ReactEvents,
    mut announced: Local<bool>,
) {
    // Cheap when idle: nothing to read, and either the gate is still closed or
    // the one-time announce sweep already ran.
    let live = stats.applied_count > 0;
    if connections.is_empty() && reader.is_empty() && (*announced || !live) {
        return;
    }

    // Connections come from the dedicated `GamepadConnectionEvent` stream, NOT
    // `GamepadEvent::Connection`: pads already connected at startup are
    // enumerated by `bevy_gilrs`'s `PreStartup` system, which writes only this
    // stream (never `RawGamepadEvent`, so they never reach `GamepadEvent`).
    // Runtime hot-plugs appear on both; the `GamepadEvent` arm is ignored
    // below so they register exactly once.
    for conn in connections.read() {
        match &conn.connection {
            GamepadConnection::Connected {
                name,
                vendor_id,
                product_id,
            } => {
                let (id, is_new) =
                    registry.connect(conn.gamepad, name.clone(), *vendor_id, *product_id);
                // Duplicates (gilrs re-announcing a startup pad) refresh
                // silently; pre-announce connections are covered by the
                // sweep below.
                if is_new && live && *announced {
                    events.send(&GamepadConnected(connected_data(id, &registry.pads[&id])));
                }
            }
            GamepadConnection::Disconnected => {
                if let Some(id) = registry.disconnect(conn.gamepad)
                    && live
                    && *announced
                {
                    events.send(&GamepadDisconnected(GamepadDisconnectedData {
                        gamepad: id,
                    }));
                }
            }
        }
    }

    let mut buttons = Vec::new();
    let mut axes = Vec::new();
    for ev in reader.read() {
        match ev {
            // Handled via the dedicated stream above (see the comment there).
            GamepadEvent::Connection(_) => {}
            GamepadEvent::Button(change) => {
                if live && let Some(id) = registry.id_for(change.entity) {
                    buttons.push(GamepadButtonChange {
                        gamepad: id,
                        button: change.button.into(),
                        pressed: change.state.is_pressed(),
                        value: change.value,
                    });
                }
            }
            GamepadEvent::Axis(change) => {
                if live && let Some(id) = registry.id_for(change.entity) {
                    axes.push(GamepadAxisChange {
                        gamepad: id,
                        axis: change.axis.into(),
                        value: change.value,
                    });
                }
            }
        }
    }

    // Late-join announce: the frame the gate first opens, announce every pad
    // already in the registry — including any connection processed above this
    // same frame (those skipped their live send, so nothing doubles up). Runs
    // before the input send so connect always precedes input JS-side.
    if live && !*announced {
        *announced = true;
        for (id, pad) in registry.iter() {
            events.send(&GamepadConnected(connected_data(id, pad)));
        }
    }

    if !buttons.is_empty() || !axes.is_empty() {
        events.send(&GamepadInputEvent(GamepadInputData { buttons, axes }));
    }
}

/// Answer `bevy.gamepad.getAll()` with the current registry snapshot.
pub(crate) fn handle_gamepad_get_all(
    req: On<Request<GamepadGetAll>>,
    registry: Res<GamepadRegistry>,
) {
    req.respond(
        registry
            .iter()
            .map(|(id, pad)| connected_data(id, pad))
            .collect::<Vec<_>>(),
    );
}

/// Observer for `bevy.gamepad.rumble(...)`: map the wire id to the pad entity
/// and hand Bevy a [`GamepadRumbleRequest::Add`].
pub(crate) fn on_rumble(
    on: On<GamepadRumble>,
    registry: Res<GamepadRegistry>,
    mut rumble: MessageWriter<GamepadRumbleRequest>,
) {
    let msg = on.event();
    let Some(entity) = registry.entity_for(msg.gamepad) else {
        warn!("gamepad.rumble: unknown gamepad id {}", msg.gamepad);
        return;
    };
    rumble.write(GamepadRumbleRequest::Add {
        gamepad: entity,
        // `from_secs_f32` panics on negative/NaN input — the `.max(0.0)` clamp
        // is load-bearing (`NaN.max(0.0)` is 0.0).
        duration: Duration::from_secs_f32(msg.duration.max(0.0) / 1000.0),
        intensity: GamepadRumbleIntensity {
            strong_motor: msg.strong_motor.clamp(0.0, 1.0),
            weak_motor: msg.weak_motor.clamp(0.0, 1.0),
        },
    });
}

/// Observer for `bevy.gamepad.stopRumble(...)`.
pub(crate) fn on_stop_rumble(
    on: On<GamepadStopRumble>,
    registry: Res<GamepadRegistry>,
    mut rumble: MessageWriter<GamepadRumbleRequest>,
) {
    let msg = on.event();
    let Some(entity) = registry.entity_for(msg.gamepad) else {
        warn!("gamepad.stopRumble: unknown gamepad id {}", msg.gamepad);
        return;
    };
    rumble.write(GamepadRumbleRequest::Stop { gamepad: entity });
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ReactAppExt;
    use crate::bridge::{OutboundResource, OutboundSender};
    use crate::message::{ReactMessage, ReactRegistry};
    use crate::protocol::{outbound::Outbound, outbound::ResponseResult};
    use crate::request::{RawRequest, ReactRequestRegistry};
    use bevy::ecs::world::CommandQueue;
    use bevy::input::ButtonState;
    use bevy::input::gamepad::{
        GamepadAxisChangedEvent, GamepadButtonChangedEvent, GamepadConnectionEvent,
    };
    use tokio::sync::mpsc::{UnboundedReceiver, unbounded_channel};

    /// Headless `App` with the gamepad collector and a drainable outbound
    /// channel (the `keyboard.rs` harness, plus the batch-gate resources).
    fn test_app() -> (App, UnboundedReceiver<Outbound>) {
        let mut app = App::new();
        app.add_plugins(MinimalPlugins);
        app.add_message::<GamepadEvent>();
        app.add_message::<GamepadConnectionEvent>();
        app.init_resource::<OpApplyStats>();
        app.init_resource::<GamepadRegistry>();
        let (tx, rx) = unbounded_channel::<Outbound>();
        app.insert_resource(OutboundResource(tx));
        app.add_systems(Update, collect_gamepad_events);
        (app, rx)
    }

    fn open_gate(app: &mut App) {
        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;
    }

    /// Connections are written to the dedicated `GamepadConnectionEvent`
    /// stream — the only one `bevy_gilrs` uses for pads already connected at
    /// startup (its `PreStartup` enumeration never writes `RawGamepadEvent`,
    /// so `GamepadEvent::Connection` is never produced for them).
    fn write_connect(app: &mut App, entity: Entity, name: &str) {
        app.world_mut().write_message(GamepadConnectionEvent::new(
            entity,
            GamepadConnection::Connected {
                name: name.to_string(),
                vendor_id: Some(0x054c),
                product_id: Some(0x0ce6),
            },
        ));
    }

    fn write_disconnect(app: &mut App, entity: Entity) {
        app.world_mut().write_message(GamepadConnectionEvent::new(
            entity,
            GamepadConnection::Disconnected,
        ));
    }

    fn write_button(app: &mut App, entity: Entity, button: GamepadButton, value: f32) {
        let state = if value > 0.0 {
            ButtonState::Pressed
        } else {
            ButtonState::Released
        };
        app.world_mut()
            .write_message(GamepadEvent::Button(GamepadButtonChangedEvent::new(
                entity, button, state, value,
            )));
    }

    fn write_axis(app: &mut App, entity: Entity, axis: GamepadAxis, value: f32) {
        app.world_mut()
            .write_message(GamepadEvent::Axis(GamepadAxisChangedEvent::new(
                entity, axis, value,
            )));
    }

    fn expect_event(rx: &mut UnboundedReceiver<Outbound>, expected: &str) -> serde_json::Value {
        match rx
            .try_recv()
            .unwrap_or_else(|_| panic!("a {expected} event"))
        {
            Outbound::Event { name, value } => {
                assert_eq!(name, expected);
                value
            }
            other => panic!("expected Outbound::Event, got {other:?}"),
        }
    }

    /// Connections are gated until the first op batch applies; the gate-open
    /// frame announces every known pad, live pads announce immediately after,
    /// and ids are never reused across reconnects.
    #[test]
    fn connect_gates_until_first_batch_then_announces() {
        let (mut app, mut rx) = test_app();
        let pad_a = app.world_mut().spawn_empty().id();
        let pad_b = app.world_mut().spawn_empty().id();

        write_connect(&mut app, pad_a, "Pad A");
        app.update();
        assert!(rx.try_recv().is_err(), "gated until a batch has applied");

        open_gate(&mut app);
        app.update();
        let value = expect_event(&mut rx, "gamepadConnected");
        assert_eq!(value["gamepad"], 0);
        assert_eq!(value["name"], "Pad A");
        assert_eq!(value["vendorId"], 0x054c);
        assert_eq!(value["productId"], 0x0ce6);
        assert!(rx.try_recv().is_err(), "no double announce");

        write_connect(&mut app, pad_b, "Pad B");
        app.update();
        let value = expect_event(&mut rx, "gamepadConnected");
        assert_eq!(value["gamepad"], 1);
        assert_eq!(value["name"], "Pad B");

        write_disconnect(&mut app, pad_a);
        app.update();
        let value = expect_event(&mut rx, "gamepadDisconnected");
        assert_eq!(value["gamepad"], 0);

        // Reconnect (same entity): fresh id, never a reuse.
        write_connect(&mut app, pad_a, "Pad A");
        app.update();
        let value = expect_event(&mut rx, "gamepadConnected");
        assert_eq!(value["gamepad"], 2);
    }

    /// All of a frame's button/axis changes coalesce into exactly one
    /// `gamepadInput`, in order; a quiet frame sends nothing.
    #[test]
    fn input_coalesces_into_one_event_per_frame() {
        let (mut app, mut rx) = test_app();
        let pad = app.world_mut().spawn_empty().id();
        open_gate(&mut app);
        write_connect(&mut app, pad, "Pad");
        app.update();
        expect_event(&mut rx, "gamepadConnected");

        write_button(&mut app, pad, GamepadButton::South, 1.0);
        write_button(&mut app, pad, GamepadButton::DPadUp, 0.0);
        write_axis(&mut app, pad, GamepadAxis::LeftStickY, 0.42);
        app.update();

        let value = expect_event(&mut rx, "gamepadInput");
        let buttons = value["buttons"].as_array().expect("buttons array");
        assert_eq!(buttons.len(), 2);
        assert_eq!(buttons[0]["gamepad"], 0);
        assert_eq!(buttons[0]["button"], "south");
        assert_eq!(buttons[0]["pressed"], true);
        assert_eq!(buttons[0]["value"], 1.0);
        assert_eq!(buttons[1]["button"], "dPadUp");
        assert_eq!(buttons[1]["pressed"], false);
        let axes = value["axes"].as_array().expect("axes array");
        assert_eq!(axes.len(), 1);
        assert_eq!(axes[0]["axis"], "leftStickY");
        assert!((axes[0]["value"].as_f64().unwrap() - 0.42).abs() < 1e-6);
        assert!(rx.try_recv().is_err(), "one gamepadInput per frame");

        app.update();
        assert!(rx.try_recv().is_err(), "quiet frame sends nothing");
    }

    /// Non-standard inputs cross externally tagged: `{ "other": n }`.
    #[test]
    fn other_button_serializes_externally_tagged() {
        let (mut app, mut rx) = test_app();
        let pad = app.world_mut().spawn_empty().id();
        open_gate(&mut app);
        write_connect(&mut app, pad, "Pad");
        app.update();
        expect_event(&mut rx, "gamepadConnected");

        write_button(&mut app, pad, GamepadButton::Other(7), 1.0);
        app.update();
        let value = expect_event(&mut rx, "gamepadInput");
        assert_eq!(
            value["buttons"][0]["button"],
            serde_json::json!({"other": 7})
        );
    }

    /// A same-entity `Connected` without a disconnect in between (a backend
    /// re-announce) must refresh in place — same id, no second announce — or
    /// JS shows a ghost second pad. (Note: one PHYSICAL pad exposed as two
    /// kernel devices — Steam Input virtual pads, xpadneo extra nodes — is a
    /// different situation: those are genuinely two entities and correctly
    /// show as two pads.)
    #[test]
    fn duplicate_connect_same_entity_keeps_id_and_announces_once() {
        let (mut app, mut rx) = test_app();
        let pad = app.world_mut().spawn_empty().id();

        write_connect(&mut app, pad, "Pad");
        open_gate(&mut app);
        app.update();
        let value = expect_event(&mut rx, "gamepadConnected");
        assert_eq!(value["gamepad"], 0);

        // Same entity connects again, no disconnect between (gilrs duplicate).
        write_connect(&mut app, pad, "Pad");
        app.update();
        assert!(rx.try_recv().is_err(), "duplicate must not re-announce");

        // The pad keeps its original id for input and rumble.
        write_button(&mut app, pad, GamepadButton::South, 1.0);
        app.update();
        let value = expect_event(&mut rx, "gamepadInput");
        assert_eq!(value["buttons"][0]["gamepad"], 0);
    }

    /// A runtime hot-plug reaches Bevy on BOTH streams (`bevy_gilrs` writes
    /// `RawGamepadEvent::Connection` — forwarded into `GamepadEvent` — and the
    /// dedicated `GamepadConnectionEvent`); only the dedicated stream may
    /// register, or the pad doubles up and burns ids.
    #[test]
    fn dual_stream_connect_registers_once() {
        let (mut app, mut rx) = test_app();
        let pad = app.world_mut().spawn_empty().id();
        open_gate(&mut app);
        app.update();

        let conn = GamepadConnectionEvent::new(
            pad,
            GamepadConnection::Connected {
                name: "Pad".to_string(),
                vendor_id: None,
                product_id: None,
            },
        );
        app.world_mut()
            .write_message(GamepadEvent::Connection(conn.clone()));
        app.world_mut().write_message(conn);
        app.update();

        let value = expect_event(&mut rx, "gamepadConnected");
        assert_eq!(value["gamepad"], 0);
        assert!(rx.try_recv().is_err(), "exactly one announce");
    }

    /// Input from an entity that never connected (nothing in the registry) is
    /// dropped rather than crossing with a made-up id.
    #[test]
    fn unknown_entity_input_is_dropped() {
        let (mut app, mut rx) = test_app();
        let stray = app.world_mut().spawn_empty().id();
        open_gate(&mut app);
        app.update();

        write_button(&mut app, stray, GamepadButton::South, 1.0);
        app.update();
        assert!(rx.try_recv().is_err());
    }

    #[test]
    fn idle_frame_sends_nothing() {
        let (mut app, mut rx) = test_app();
        app.update();
        assert!(rx.try_recv().is_err());
    }

    /// Run one message through the plugin's dispatch path, applying the
    /// queued trigger so observers run before we assert (`message.rs` pattern).
    fn dispatch(app: &mut App, name: &str, value: serde_json::Value) {
        app.world_mut()
            .resource_scope(|world, registry: Mut<ReactRegistry>| {
                let mut queue = CommandQueue::default();
                let mut commands = Commands::new(&mut queue, world);
                registry.dispatch(
                    ReactMessage {
                        name: name.into(),
                        value,
                    },
                    &mut commands,
                );
                queue.apply(world);
            });
    }

    /// Headless `App` wired for the rumble direction: registry seeded with one
    /// pad under id 0, both observers attached.
    fn rumble_app() -> (App, Entity) {
        let mut app = App::new();
        app.add_message::<GamepadRumbleRequest>();
        let pad = app.world_mut().spawn_empty().id();
        let mut registry = GamepadRegistry::default();
        registry.connect(pad, "Pad".into(), None, None);
        app.insert_resource(registry);
        app.add_react_handler(on_rumble);
        app.add_react_handler(on_stop_rumble);
        (app, pad)
    }

    fn drain_rumble(app: &mut App) -> Vec<GamepadRumbleRequest> {
        app.world_mut()
            .resource_mut::<Messages<GamepadRumbleRequest>>()
            .drain()
            .collect()
    }

    /// `bevy.gamepad.rumble` maps the wire id to the pad entity and writes a
    /// clamped `Add`; `stopRumble` writes `Stop`; unknown ids write nothing.
    #[test]
    fn rumble_maps_id_to_entity_and_writes_request() {
        let (mut app, pad) = rumble_app();

        dispatch(
            &mut app,
            "gamepad.rumble",
            serde_json::json!({
                "gamepad": 0,
                "duration": 500.0,
                "strongMotor": 1.5,
                "weakMotor": 0.25,
            }),
        );
        match drain_rumble(&mut app).as_slice() {
            [
                GamepadRumbleRequest::Add {
                    gamepad,
                    intensity,
                    duration,
                },
            ] => {
                assert_eq!(*gamepad, pad);
                assert_eq!(*duration, Duration::from_millis(500));
                assert_eq!(intensity.strong_motor, 1.0, "clamped to 0..=1");
                assert_eq!(intensity.weak_motor, 0.25);
            }
            other => panic!("expected one Add request, got {} items", other.len()),
        }

        dispatch(
            &mut app,
            "gamepad.stopRumble",
            serde_json::json!({"gamepad": 0}),
        );
        match drain_rumble(&mut app).as_slice() {
            [GamepadRumbleRequest::Stop { gamepad }] => assert_eq!(*gamepad, pad),
            other => panic!("expected one Stop request, got {} items", other.len()),
        }

        dispatch(
            &mut app,
            "gamepad.rumble",
            serde_json::json!({
                "gamepad": 99,
                "duration": 100.0,
                "strongMotor": 1.0,
                "weakMotor": 1.0,
            }),
        );
        assert!(
            drain_rumble(&mut app).is_empty(),
            "unknown id writes nothing"
        );
    }

    /// Route one raw request through the registry, applying the queued trigger
    /// so the observer responds before we inspect the channel (the pattern
    /// from `window.rs`'s tests).
    fn dispatch_get_all(app: &mut App, tx: &OutboundSender, id: u64) {
        app.world_mut()
            .resource_scope(|world, registry: Mut<ReactRequestRegistry>| {
                let mut queue = CommandQueue::default();
                let mut commands = Commands::new(&mut queue, world);
                registry.dispatch(
                    RawRequest {
                        id,
                        name: "gamepad.getAll".into(),
                        value: serde_json::Value::Null,
                    },
                    tx,
                    &mut commands,
                );
                queue.apply(world);
            });
    }

    /// `bevy.gamepad.getAll()` resolves with the connected pads (the pull
    /// companion for components that mounted after the connect event), and
    /// with `[]` — never a rejection — when nothing is connected.
    #[test]
    fn get_all_request_returns_connected_pads() {
        let mut app = App::new();
        app.init_resource::<GamepadRegistry>();
        app.add_react_request_handler(handle_gamepad_get_all);
        let (tx, mut rx): (OutboundSender, UnboundedReceiver<Outbound>) = unbounded_channel();

        dispatch_get_all(&mut app, &tx, 1);
        match rx.try_recv() {
            Ok(Outbound::Response {
                id: 1,
                result: ResponseResult::Ok { value },
            }) => assert_eq!(value, serde_json::json!([])),
            other => panic!("expected empty Ok response, got {other:?}"),
        }

        let pad = app.world_mut().spawn_empty().id();
        app.world_mut().resource_mut::<GamepadRegistry>().connect(
            pad,
            "Pad".into(),
            Some(0x045e),
            None,
        );
        dispatch_get_all(&mut app, &tx, 2);
        match rx.try_recv() {
            Ok(Outbound::Response {
                id: 2,
                result: ResponseResult::Ok { value },
            }) => {
                let pads = value.as_array().expect("array response");
                assert_eq!(pads.len(), 1);
                assert_eq!(pads[0]["gamepad"], 0);
                assert_eq!(pads[0]["name"], "Pad");
                assert_eq!(pads[0]["vendorId"], 0x045e);
                assert_eq!(pads[0]["productId"], serde_json::Value::Null);
            }
            other => panic!("expected Ok response, got {other:?}"),
        }
    }

    /// A negative duration clamps to zero instead of panicking
    /// (`Duration::from_secs_f32` panics on negative input).
    #[test]
    fn negative_rumble_duration_clamps_to_zero() {
        let (mut app, _pad) = rumble_app();
        dispatch(
            &mut app,
            "gamepad.rumble",
            serde_json::json!({
                "gamepad": 0,
                "duration": -50.0,
                "strongMotor": 0.5,
                "weakMotor": 0.5,
            }),
        );
        match drain_rumble(&mut app).as_slice() {
            [GamepadRumbleRequest::Add { duration, .. }] => {
                assert_eq!(*duration, Duration::ZERO);
            }
            other => panic!("expected one Add request, got {} items", other.len()),
        }
    }
}
