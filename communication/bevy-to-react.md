# Bevy to React

An event is a typed, named broadcast from the Bevy world to the React app.
You declare it as a Rust struct with `#[react_event]`, send it from any system
with the `ReactEvents` system param, and React listens with `bevy.on(name,
callback)`. Every listener registered for the name receives the payload.

## Usage

```tsx
import { useEffect, useState } from "react";
import { bevy } from "./bevy"; // generated

function Score() {
  const [score, setScore] = useState(0);
  useEffect(() => bevy.on("game.scored", (e) => setScore(e.total)), []);
  return <text>{`Score: ${score}`}</text>;
}
```

```rust
use bevy::prelude::*;
use bevy_react::prelude::*;

#[react_event(name = "game.scored")]
struct Scored {
    total: u32,
}

fn award_points(
    goals: Query<(), Added<Goal>>,
    mut score: ResMut<Score>,
    events: ReactEvents,
) {
    for _ in &goals {
        score.0 += 1;
        events.send(&Scored { total: score.0 });
    }
}

app.add_react_event::<Scored>();
```

## Defining an event

`#[react_event]` derives `serde::Serialize` and `ts_rs::TS` on the struct.
The payload crosses as JSON, so the struct's serde shape is what the callback
receives: an object for named fields, the inner value for a newtype, `null`
for a unit struct.

- The name defaults to the struct's name with its first letter lowercased
  (`Scored` is `"scored"`). Override it with `#[react_event(name = "...")]`.
  Dotted names are allowed; they are plain keys of `bevy.on` and don't nest.
- Field naming, nested types and integer precision follow the same rules as
  [messages](react-to-bevy.md#defining-a-message): add
  `#[serde(rename_all = "camelCase")]` and `#[ts(rename_all = "camelCase")]`
  together for camelCase fields, and derive `Serialize` and `TS` on nested
  types you define.
- The built-in event names `resize`, `keyDown`, `keyUp`, `gamepadConnected`,
  `gamepadDisconnected` and `gamepadInput` are reserved: an app event using
  one is left out of the generated file.

## Sending

`ReactEvents` is a system param; `events.send(&event)` pushes one event and
works from any system or observer, in any schedule. A payload that fails to
serialize logs an error and is not sent.

`app.add_react_event::<E>()` only feeds the TypeScript exporter. Sending works
without it, but the event is then missing from `bevy.ts`, and `bevy.on` won't
accept its name. Put the call in the same `register_bindings` function as your
other bindings (see
[registering in the app and the exporter](react-to-bevy.md#registering-in-the-app-and-the-exporter)).

## Listening

`bevy.on(name, callback)` subscribes and returns an unsubscribe function.
Return it from `useEffect` so the listener goes away with the component:

```tsx
useEffect(() => {
  const offScored = bevy.on("game.scored", onScored);
  const offOver = bevy.on("game.over", onGameOver);
  return () => {
    offScored();
    offOver();
  };
}, []);
```

- The callback's parameter is typed from the Rust struct.
- Any number of listeners can share a name; they run in subscription order.
  An exception thrown by one is logged to the console and the others still
  run.
- `bevy.removeEventListener(name, callback)` unsubscribes as well, and
  `bevy.addEventListener` is an alias of `bevy.on`.
- Listeners are global, not owned by a component: one you never unsubscribe
  keeps firing after its component unmounts.
- State updates made by the listeners of one event commit as one synchronous
  React render.

## Delivery and timing

- Everything Bevy sends to React (events, UI events, request responses)
  travels in one ordered channel, so events arrive in the order they were
  sent.
- Events are not buffered. An event that arrives while nobody listens to its
  name is dropped, including events sent before the React app mounted. A
  component that mounts later has missed everything sent before. Pair such
  state with a [request](request-response.md) that returns the current value,
  and call it on mount; the built-ins do this (`resize` with
  [`bevy.window.size()`](../events/window.md), `gamepadConnected` with
  [`bevy.gamepad.getAll()`](../events/gamepad.md)).
- A system that sends at startup can wait for the first applied UI batch, as
  the built-ins do: `.run_if(|s: Res<OpApplyStats>| s.applied_count > 0)`
  (`OpApplyStats` is exported by `bevy_react`).
- React handles events on its own thread, after Bevy sends them. The render a
  listener causes reaches Bevy a frame or more later.
- Each event costs a JSON round trip and, usually, a React render. Sending one
  every frame works, but UI that has to follow something in the 3D scene
  frame by frame is better served by [`<anchor>`](../elements/anchor.md), and
  per-frame visuals by [animated values](../animations/animated-values.md).

## Limits

- No replay and no buffering: listeners must exist when the event arrives.
- Events are broadcasts by name. To reach a specific UI node from Bevy, use a
  [named node](named-nodes.md).

The built-in events are documented with their topics:
[keyboard](../events/keyboard.md), [gamepad](../events/gamepad.md) and
[window](../events/window.md).
