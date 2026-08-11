//! The UI viewport's size, exposed to React as built-ins: the `"resize"` event
//! and the `bevy.window.size()` request.
//!
//! Web apps read `window.innerWidth` and listen to `resize`; here the size
//! lives Bevy-side, so it is pushed once after the first applied UI batch (so
//! JS listeners exist), then on every change — plus a pull request for
//! late-mounted components that missed the last event:
//!
//! ```ts
//! const [size, setSize] = useState<WindowSize | null>(null);
//! useEffect(() => {
//!   void bevy.window.size().then(setSize); // current value on mount
//!   return bevy.on("resize", setSize);     // live updates
//! }, []);
//! ```
//!
//! Like the [`keyboard`](crate::keyboard) events, both are framework built-ins:
//! the exporter ([`ts_codegen`](crate::ts_codegen)) always seeds them into the
//! generated `bevy.ts`, so they are typed in every app with no registration.
//!
//! The size is the **default UI camera's logical viewport** — what `bevy_ui`
//! lays out against, which stays correct when that camera renders offscreen
//! (the demos' `--shoot` mode) — falling back to the primary window. A
//! scale-factor change alters the logical size, so it fires `"resize"` too.
//!
//! Naming note: the per-node `<canvas>` `"resize"` rides `Outbound::UiEvent`
//! keyed by node id; this event rides `Outbound::Event` keyed by name. The JS
//! router switches on the tag first, so the two never collide.

use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;
use serde::Serialize;
use ts_rs::TS;

use crate::event::ReactEvents;
use crate::reconcile::OpApplyStats;
use crate::request::Request;
use crate::{react_event, react_request};

/// The UI viewport's logical size, in logical px. Carried by the built-in
/// [`Resize`] event and returned by the [`WindowSizeGet`] request.
#[derive(Serialize, TS)]
pub struct WindowSize {
    pub width: f32,
    pub height: f32,
}

/// Built-in Bevy → React event: the UI viewport's logical size, sent once
/// after the first applied UI batch and again on every change. Subscribe with
/// `bevy.on("resize", cb)`. A newtype over [`WindowSize`] so codegen emits
/// `type Resize = WindowSize` and the wire payload stays flat.
#[react_event(name = "resize")]
pub struct Resize(pub WindowSize);

/// Built-in React → Bevy request: pull the UI viewport's current logical size
/// at any time — `bevy.window.size()` (unit payload → zero-arg proxy method).
/// Rejects when no viewport exists yet (headless, or pre-window) rather than
/// answering 0×0.
#[react_request(name = "window.size", response = WindowSize)]
pub struct WindowSizeGet;

/// The UI's layout viewport in logical px: the default UI camera's target —
/// which detached `<root>`s (the devtools panel) lay out against, and which
/// stays correct when that camera renders offscreen (the demos' `--shoot`
/// mode, where the OS window's size is unrelated to the capture target) —
/// falling back to the window (headless tests have no camera; a windowed app
/// without an explicit [`IsDefaultUiCamera`] targets the window anyway).
/// `None` when neither resolves (no window, or multiple windows).
pub(crate) fn ui_viewport_size(
    cameras: &Query<&Camera, With<IsDefaultUiCamera>>,
    windows: &Query<&Window>,
) -> Option<Vec2> {
    if let Ok(camera) = cameras.single()
        && let Some(size) = camera.logical_viewport_size()
    {
        return Some(size);
    }
    windows
        .single()
        .ok()
        .map(|window| Vec2::new(window.width(), window.height()))
}

/// Send the built-in `"resize"` event: once after the first applied op batch
/// (the same listener-race gate devtools' restore uses), then on every
/// logical-size change. Poll + `Local` diff rather than `WindowResized`, so it
/// works headless and in `--shoot` mode, and catches scale-factor changes.
pub(crate) fn send_resize_events(
    stats: Res<OpApplyStats>,
    cameras: Query<&Camera, With<IsDefaultUiCamera>>,
    windows: Query<&Window>,
    events: ReactEvents,
    mut last: Local<Option<Vec2>>,
) {
    if stats.applied_count == 0 {
        return;
    }
    let Some(size) = ui_viewport_size(&cameras, &windows) else {
        return;
    };
    if *last != Some(size) {
        *last = Some(size);
        events.send(&Resize(WindowSize {
            width: size.x,
            height: size.y,
        }));
    }
}

/// Answer `bevy.window.size()` with the current UI viewport size, or reject
/// the promise when no viewport exists (never resolve with a made-up 0×0).
pub(crate) fn handle_window_size_request(
    req: On<Request<WindowSizeGet>>,
    cameras: Query<&Camera, With<IsDefaultUiCamera>>,
    windows: Query<&Window>,
) {
    match ui_viewport_size(&cameras, &windows) {
        Some(size) => req.respond(WindowSize {
            width: size.x,
            height: size.y,
        }),
        None => req.respond_err("no UI viewport available"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ReactAppExt;
    use crate::bridge::{OutboundResource, OutboundSender};
    use crate::protocol::{outbound::Outbound, outbound::ResponseResult};
    use crate::request::{RawRequest, ReactRequestRegistry};
    use bevy::ecs::world::CommandQueue;
    use bevy::window::WindowResolution;
    use tokio::sync::mpsc::{UnboundedReceiver, unbounded_channel};

    /// Headless `App` with the resize system, a drainable outbound channel, and
    /// no camera — exercising `ui_viewport_size`'s window fallback.
    fn test_app() -> (App, UnboundedReceiver<Outbound>) {
        let mut app = App::new();
        app.add_plugins(MinimalPlugins);
        app.init_resource::<OpApplyStats>();
        let (tx, rx) = unbounded_channel::<Outbound>();
        app.insert_resource(OutboundResource(tx));
        app.add_systems(Update, send_resize_events);
        (app, rx)
    }

    fn spawn_window(app: &mut App, width: u32, height: u32) -> Entity {
        app.world_mut()
            .spawn(Window {
                resolution: WindowResolution::new(width, height),
                ..default()
            })
            .id()
    }

    fn expect_resize(rx: &mut UnboundedReceiver<Outbound>, width: f32, height: f32) {
        match rx.try_recv().expect("a resize event") {
            Outbound::Event { name, value } => {
                assert_eq!(name, "resize");
                assert_eq!(value["width"], width);
                assert_eq!(value["height"], height);
            }
            other => panic!("expected Outbound::Event, got {other:?}"),
        }
    }

    /// Nothing is sent before the first op batch applies (JS listeners don't
    /// exist yet); once it has, the current size goes out exactly once and is
    /// then deduped until it actually changes.
    #[test]
    fn resize_gates_on_first_batch_then_fires_once_per_change() {
        let (mut app, mut rx) = test_app();
        let window = spawn_window(&mut app, 800, 600);

        app.update();
        assert!(rx.try_recv().is_err(), "gated until a batch has applied");

        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;
        app.update();
        expect_resize(&mut rx, 800.0, 600.0);

        app.update();
        assert!(rx.try_recv().is_err(), "unchanged size must not re-send");

        app.world_mut()
            .get_mut::<Window>(window)
            .unwrap()
            .resolution = WindowResolution::new(1024, 768);
        app.update();
        expect_resize(&mut rx, 1024.0, 768.0);
        app.update();
        assert!(rx.try_recv().is_err());
    }

    /// Route one raw request through the registry, applying the queued trigger
    /// so the observer responds before we inspect the channel (the pattern from
    /// `request.rs`'s tests).
    fn dispatch_size_request(app: &mut App, tx: &OutboundSender, id: u64) {
        app.world_mut()
            .resource_scope(|world, registry: Mut<ReactRequestRegistry>| {
                let mut queue = CommandQueue::default();
                let mut commands = Commands::new(&mut queue, world);
                registry.dispatch(
                    RawRequest {
                        id,
                        name: "window.size".into(),
                        value: serde_json::Value::Null,
                    },
                    tx,
                    &mut commands,
                );
                queue.apply(world);
            });
    }

    /// `bevy.window.size()` resolves with the current viewport size, and
    /// rejects (rather than hanging or answering 0×0) when none exists.
    #[test]
    fn window_size_request_responds_or_rejects() {
        let mut app = App::new();
        app.add_react_request_handler(handle_window_size_request);
        let (tx, mut rx): (OutboundSender, UnboundedReceiver<Outbound>) = unbounded_channel();

        // No window, no camera → the promise must reject.
        dispatch_size_request(&mut app, &tx, 1);
        assert!(matches!(
            rx.try_recv(),
            Ok(Outbound::Response {
                id: 1,
                result: ResponseResult::Err { .. },
            })
        ));

        spawn_window(&mut app, 640, 480);
        dispatch_size_request(&mut app, &tx, 2);
        match rx.try_recv() {
            Ok(Outbound::Response {
                id: 2,
                result: ResponseResult::Ok { value },
            }) => {
                assert_eq!(value["width"], 640.0);
                assert_eq!(value["height"], 480.0);
            }
            other => panic!("expected Ok response, got {other:?}"),
        }
    }
}
