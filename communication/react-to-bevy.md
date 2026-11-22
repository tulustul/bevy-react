# React to Bevy

A message is a typed, fire-and-forget notification from React to the Bevy
world. You declare it as a Rust struct with `#[react_message]`, React sends it
through the generated `bevy` proxy, and Bevy deserializes it and triggers it
as an event for your observers. There is no reply: when React needs an answer,
use a [request](request-response.md).

## Usage

```tsx
import { bevy } from "./bevy"; // generated

<button onClick={() => bevy.game.setSpeed(2.5)}>
  <text>Faster</text>
</button>;
```

```rust
use bevy::prelude::*;
use bevy_react::prelude::*;

#[react_message(name = "game.setSpeed")]
struct SetSpeed(f32);

#[derive(Resource)]
struct Speed(f32);

fn set_speed(on: On<SetSpeed>, mut speed: ResMut<Speed>) {
    speed.0 = on.event().0;
}

app.add_react_handler(set_speed);
```

After adding or changing a message, regenerate `bevy.ts` (see
[TypeScript codegen](../tooling/ts-codegen.md)) so the proxy method and its
payload type exist on the React side.

## Defining a message

`#[react_message]` derives `serde::Deserialize` and `ts_rs::TS` on the struct
and implements Bevy's `Event` for it, so don't derive those yourself. The
struct's serde shape is the JSON the React side sends:

| Rust                             | React call                         |
| -------------------------------- | ---------------------------------- |
| `struct SetSpeed(f32);`          | `bevy.game.setSpeed(2.5)`          |
| `struct Move { x: f32, y: f32 }` | `bevy.player.move({ x: 1, y: 2 })` |
| `struct Reset;` (a unit struct)  | `bevy.game.reset(null)`            |

- A unit-struct message still takes one argument, `null`. (Requests with a
  unit payload become zero-argument methods; messages do not.)
- Field names cross as written, so snake_case fields stay snake_case in
  TypeScript. For camelCase, add both serde's and ts-rs's `rename_all`, as the
  built-in messages do. They must agree, or the generated type and the wire
  JSON diverge:

```rust
#[react_message(name = "player.aim")]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
struct PlayerAim {
    target_x: f32, // `targetX` in TypeScript
    target_y: f32,
}
```

- Your crate needs no `serde` or `ts-rs` dependency for the message struct
  itself. A nested type you define (an enum field, a sub-struct) must derive
  `Deserialize` and `TS` itself, which does need both crates.
- Integers up to 32 bits map to TypeScript `number`. `i64`/`u64` are typed
  `bigint` but cross as JS numbers, exact only below 2^53 — see
  [TypeScript codegen](../tooling/ts-codegen.md).

## Names

The name defaults to the struct's name with its first letter lowercased:
`SetSpeed` is `"setSpeed"`, `PlayerScore` is `"playerScore"`. Override it
with `#[react_message(name = "...")]`.

- A dotted name nests the proxy method: `"game.setSpeed"` becomes
  `bevy.game.setSpeed(value)`, an undotted `"setSpeed"` becomes
  `bevy.setSpeed(value)`.
- Messages and [requests](request-response.md) share the proxy tree. A name
  used both as a method and as a namespace (`"game"` and `"game.reset"`), or a
  top-level name of `emit`, `request`, `on`, `addEventListener` or
  `removeEventListener`, makes the TypeScript export panic.
- The built-in names `gamepad.rumble` and `gamepad.stopRumble` are reserved:
  an app message using one is left out of the generated file.
- One type per name. Registering a second type under a taken name logs a
  warning and replaces the first.

## Handling messages

`app.add_react_handler(observer)` registers the message type (inferred from
the observer's `On<T>` parameter) and adds the observer. The observer is an
ordinary Bevy observer system and takes any system parameters.

- Call `add_react_handler` again with another observer to handle one message
  in several places; registering the same type twice is harmless.
- `app.add_react_message::<T>()` registers the type without an observer, for
  when you add the observer separately with `app.add_observer`.
- Bevy drains the messages React sent once per frame, in `PreUpdate`, in
  the order they were emitted. Observers run there, so your
  `Update` systems see their effects in the same frame.
- Messages are handled before that frame's UI changes are applied (UI ops
  apply in `ReactApplySet`, in `Update`). A message emitted in the same commit
  that mounts a [named node](named-nodes.md) arrives before the node exists in
  Bevy. If the observer needs that node, record what to do in a resource and
  act on it in a system ordered `.after(ReactApplySet)`.

## Sending from React

Import the typed surface from your generated `./bevy` module:

```tsx
import { bevy, emit } from "./bevy";

bevy.game.setSpeed(2.5);
emit("game.setSpeed", 2.5); // the same message
```

Both are checked against the Rust struct at compile time. `bevy-react` also
exports an untyped `emit(name, value)` that accepts any name and value; prefer
the generated one. Sending is synchronous and cheap, so it works from event
handlers, effects and timers alike. The value must be plain JSON data.

## Malformed and unknown messages

React gets no feedback either way:

- A name with no registered type logs a warning in the Bevy log and is
  dropped.
- A payload that doesn't deserialize into the registered type logs an error
  and is dropped; no observer runs.

With a current `bevy.ts`, the TypeScript compiler rules out both. When a
message can fail on the Bevy side and React has to know, make it a
[request](request-response.md) and reject it with `respond_err`.

## Registering in the app and the exporter

The TypeScript exporter only knows the types registered on the `App` it
exports. Keep every `add_react_handler` (and `add_react_request_handler`,
`add_react_event`) call in one function that both your plugin and the
`--export-bindings` entry point call, so a message can't work at runtime but
be missing from `bevy.ts`, or the other way round:

```rust
pub struct GamePlugin;

impl Plugin for GamePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.insert_resource(Speed(1.0));
    }
}

/// Also called by the `--export-bindings` entry point.
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(set_speed);
}
```

[Getting started](../getting-started.md) shows the exporter entry point, and
[TypeScript codegen](../tooling/ts-codegen.md) covers the generated file.

## Limits

- No reply, no delivery confirmation. Failures only show in the Bevy log.
- Messages are queued until the next frame: nothing in Bevy reacts in the same
  instant `emit` returns.
- Messages are app-wide. To act on a specific UI node from Bevy, find it with
  a [named node](named-nodes.md).

The other directions are [Bevy to React](bevy-to-react.md) events and
[request / response](request-response.md) calls; the built-in messages are
the gamepad's [rumble](../events/gamepad.md#rumble) controls.
