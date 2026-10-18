# Request / response

A request is a call from React to Bevy that returns a promise. You declare the
request payload as a Rust struct with `#[react_request]`, naming the response
type; a Bevy observer receives it as `Request<T>` and answers with
`respond`. The promise resolves with the typed reply, or rejects with an
error.

## Usage

```tsx
import { useEffect, useState } from "react";
import { bevy } from "./bevy"; // generated

function Health() {
  const [hp, setHp] = useState<number | null>(null);
  useEffect(() => {
    bevy.player.stats().then(
      (s) => setHp(s.health),
      () => setHp(null),
    );
  }, []);
  return <text>{hp === null ? "No player" : `HP ${hp}`}</text>;
}
```

```rust
use bevy::prelude::*;
use bevy_react::prelude::*;
use serde::Serialize;
use ts_rs::TS;

#[react_request(name = "player.stats", response = PlayerStats)]
struct GetPlayerStats;

#[derive(Serialize, TS)]
struct PlayerStats {
    health: u32,
}

fn player_stats(
    req: On<Request<GetPlayerStats>>,
    players: Query<&Health, With<Player>>,
) {
    match players.single() {
        Ok(health) => req.respond(PlayerStats { health: health.0 }),
        Err(_) => req.respond_err("no player"),
    }
}

app.add_react_request_handler(player_stats);
```

## Defining a request

`#[react_request(name = "...", response = Type)]` derives
`serde::Deserialize` and `ts_rs::TS` on the payload struct. `response` is
required; `name` is optional and defaults to the struct's name with its first
letter lowercased (`GetPlayerStats` is `"getPlayerStats"`).

- The response is any type that implements `serde::Serialize` and
  `ts_rs::TS`: your own struct deriving both (your crate then needs the
  `serde` and `ts-rs` dependencies), a primitive, or a collection such as
  `Vec<T>` or `Option<T>`.
- A unit-struct payload makes a zero-argument method:
  `bevy.player.stats()`. Any other payload is the method's one argument,
  typed from the struct: `bevy.board.move({ piece: "e2", to: "e4" })`.
- Field naming and integer precision follow the same rules as
  [messages](react-to-bevy.md#defining-a-message), for the payload and the
  response alike.

## Calling from React

A dotted name nests the proxy method: `"player.stats"` becomes
`bevy.player.stats()`, `"board.move"` becomes `bevy.board.move(value)`. The
generated `request` function is the same call by name:

```tsx
import { bevy, request } from "./bevy";

const stats = await bevy.player.stats();
const same = await request("player.stats", null); // unit payload: null
```

Requests share the proxy tree with [messages](react-to-bevy.md#names): a name
used both as a method and as a namespace, or a top-level `emit`, `request`,
`on`, `addEventListener` or `removeEventListener`, makes the TypeScript export
panic. `bevy-react` also exports an untyped `request(name, value)`; prefer the
generated one.

## Answering

The observer receives `On<Request<T>>`:

- `req.payload()` is the deserialized payload `&T`.
- `req.respond(value)` resolves the promise with `value`.
- `req.respond_err(message)` rejects it with an `Error` whose message is
  `message`.
- Only the first answer counts. Later calls are ignored with a warning, so
  when several observers handle one request, the first to answer wins.
- `app.add_react_request_handler(observer)` registers the request type
  (inferred from the observer's parameter) and adds the observer;
  `app.add_react_request::<T>()` registers the type alone. Keep these calls
  in your shared `register_bindings` function (see
  [registering in the app and the exporter](react-to-bevy.md#registering-in-the-app-and-the-exporter)).

Every request must be answered. A promise whose request no observer answers
stays pending forever. That includes an observer that doesn't run because a
parameter fails validation, such as a `Single` with no match: query with
`Query` and reject explicitly instead, as in the usage example.

## Deferred replies

`req.responder()` returns a `Responder` (exported by `bevy_react`) for the
same request. It is `Clone + Send + Sync`, so you can store it in a resource
or component, or move it into a task, and answer on a later frame:

```rust
use bevy_react::Responder;

#[derive(Resource, Default)]
struct WaitingForLevel(Vec<Responder<LevelInfo>>);

fn level_info(
    req: On<Request<GetLevelInfo>>,
    mut waiting: ResMut<WaitingForLevel>,
) {
    waiting.0.push(req.responder());
}

fn answer_when_loaded(
    level: Option<Res<Level>>,
    mut waiting: ResMut<WaitingForLevel>,
) {
    let Some(level) = level else { return };
    for responder in waiting.0.drain(..) {
        responder.respond(LevelInfo { name: level.name.clone() });
    }
}
```

A `Responder` has the same `respond` and `respond_err` methods and the same
answer-once rule, shared by all its clones. Dropping every clone without
answering leaves the promise pending.

## Rejections

The promise rejects, and never hangs, when:

- no request type is registered under the name (`no handler registered for
request "..."`);
- the payload doesn't deserialize into the request type (`malformed request
"..."`);
- the response fails to serialize (`serialize response: ...`);
- the observer calls `respond_err`.

Handle rejections: data that may be missing on the Bevy side, a scene that
was switched away, a stale `bevy.ts`.

## Timing

Bevy collects requests once per frame, in `PreUpdate`, and an
immediate answer is sent from there. The promise therefore resolves at the
earliest about a frame after the call. A polling loop gains nothing from
asking faster than the frame rate, and continuous data is cheaper as an
[event](bevy-to-react.md). Requests can't be cancelled: if the component that
asked may unmount first, ignore the late result:

```tsx
useEffect(() => {
  let alive = true;
  bevy.player.stats().then(
    (s) => alive && setHp(s.health),
    () => {},
  );
  return () => {
    alive = false;
  };
}, []);
```

## Built-in requests

Two requests are built in and typed in every generated `bevy.ts`; their names
are reserved:

| Call                    | Resolves with                      | Page                            |
| ----------------------- | ---------------------------------- | ------------------------------- |
| `bevy.window.size()`    | `WindowSize`: the UI viewport size | [Window](../events/window.md)   |
| `bevy.gamepad.getAll()` | `GamepadConnectedData[]`           | [Gamepad](../events/gamepad.md) |

## Limits

- No cancellation and no timeout. Race the promise in JavaScript if you need
  one.
- An unanswered request leaks its pending promise.
- Each call is one round trip through Bevy's frame loop.
