//! The public Bevy plugin: wires the JS thread, channels, UI root, and hot
//! reload into a consumer's `App`.

use std::path::PathBuf;

use bevy::prelude::*;

use crate::bridge::{JsBridge, OpReceiver, OutboundResource, OutboundSender};
use crate::event::ReactEventRegistry;
use crate::js_thread::spawn_js_thread;
use crate::message::{ReactMessage, ReactRegistry};
use crate::protocol::{Op, Outbound};
use crate::reconcile::{apply_js_ops, collect_ui_events};
use crate::request::{RawRequest, ReactRequestRegistry, RequestReceiver, dispatch_react_requests};

/// Adds a React-driven `bevy_ui` layer to a Bevy `App`.
///
/// Point it at a built JS bundle (see the `bevy-react` npm package). The plugin
/// spawns the dedicated JS thread, applies the reconciler's ops to the ECS,
/// reports interactions back to React, and — unless disabled — hot reloads the
/// app when the bundle changes on disk.
pub struct ReactUiPlugin {
    bundle: PathBuf,
    hot_reload: bool,
    spawn_camera: bool,
}

impl ReactUiPlugin {
    /// Create the plugin for the given built JS bundle path. Hot reload and a
    /// default 2D UI camera are enabled by default.
    pub fn new(bundle: impl Into<PathBuf>) -> Self {
        Self {
            bundle: bundle.into(),
            hot_reload: true,
            spawn_camera: true,
        }
    }

    /// Enable/disable watching the bundle and hot reloading on change.
    pub fn hot_reload(mut self, yes: bool) -> Self {
        self.hot_reload = yes;
        self
    }

    /// Enable/disable spawning a `Camera2d` (disable if your app provides one).
    pub fn spawn_camera(mut self, yes: bool) -> Self {
        self.spawn_camera = yes;
        self
    }
}

impl Plugin for ReactUiPlugin {
    fn build(&self, app: &mut App) {
        // Channels: op batches, app messages, and requests flow JS -> Bevy; a single
        // `Outbound` stream (UI events, app events, responses) and reload signals
        // flow Bevy -> JS.
        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let (emit_tx, emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
        let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
        let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        let (reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

        if !self.bundle.exists() {
            panic!(
                "JS bundle not found at {}.\nBuild your app bundle first (e.g. `npm run build`).",
                self.bundle.display()
            );
        }

        // The JS thread only needs the channels — not the ECS — so it can start
        // rendering immediately. Its first ops queue until `setup` builds the root.
        spawn_js_thread(
            self.bundle.clone(),
            ops_tx,
            emit_tx,
            request_tx,
            outbound_rx,
            reload_rx,
        );

        app.insert_resource(BridgeChannels {
            ops_rx: Some(ops_rx),
            outbound_tx: outbound_tx.clone(),
        })
        // A standalone outbound handle for the request dispatcher and the
        // `ReactEvents` param, available before `setup` builds `JsBridge`.
        .insert_resource(OutboundResource(outbound_tx))
        .insert_resource(EmitReceiver(emit_rx))
        .insert_resource(RequestReceiver(request_rx))
        .insert_resource(ReactUiConfig {
            spawn_camera: self.spawn_camera,
        })
        .init_resource::<ReactRegistry>()
        .init_resource::<ReactRequestRegistry>()
        .init_resource::<ReactEventRegistry>()
        .add_systems(Startup, setup)
        .add_systems(
            PreUpdate,
            (dispatch_react_messages, dispatch_react_requests),
        )
        .add_systems(Update, (apply_js_ops, collect_ui_events));

        if self.hot_reload {
            app.insert_resource(BundleWatch {
                path: self.bundle.clone(),
                last_modified: file_mtime(&self.bundle),
                timer: Timer::from_seconds(0.3, TimerMode::Repeating),
                reload_tx,
            })
            .add_systems(Update, watch_bundle);
        } else {
            // Keep the sender alive so the JS thread doesn't see shutdown.
            app.insert_resource(ReloadKeepAlive(reload_tx));
        }
    }
}

/// Marker for the UI root entity (reconciler node id 0 / `ROOT_ID`).
#[derive(Component)]
struct UiRoot;

/// Plugin configuration read by the startup system.
#[derive(Resource)]
struct ReactUiConfig {
    spawn_camera: bool,
}

/// Carries the Bevy-side channel ends from `build` into `setup`.
#[derive(Resource)]
struct BridgeChannels {
    ops_rx: Option<OpReceiver>,
    outbound_tx: OutboundSender,
}

/// Receives app messages emitted by the React app (`emit(name, value)`).
#[derive(Resource)]
struct EmitReceiver(crossbeam_channel::Receiver<ReactMessage>);

/// The single consumption point for React-emitted messages. Drains the channel
/// each frame and routes every message to its registered typed payload via
/// [`ReactRegistry`], triggering it for observers. Runs in `PreUpdate` so the
/// triggers land before consumer `Update` systems run the same frame.
fn dispatch_react_messages(
    rx: Res<EmitReceiver>,
    registry: Res<ReactRegistry>,
    mut commands: Commands,
) {
    while let Ok(msg) = rx.0.try_recv() {
        registry.dispatch(msg, &mut commands);
    }
}

/// Holds the reload sender when hot reload is disabled, so the JS thread's
/// reload channel never observes "all senders dropped" (shutdown).
#[derive(Resource)]
struct ReloadKeepAlive(#[allow(dead_code)] tokio::sync::mpsc::UnboundedSender<()>);

fn setup(mut commands: Commands, mut channels: ResMut<BridgeChannels>, config: Res<ReactUiConfig>) {
    if config.spawn_camera {
        commands.spawn(Camera2d);
    }

    // The root container: a full-window flex column the reconciler appends
    // top-level children into (it is reconciler node id 0). Children stack from
    // the top, horizontally centered.
    let root = commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                justify_content: JustifyContent::FlexStart,
                align_items: AlignItems::Center,
                row_gap: Val::Px(16.0),
                ..default()
            },
            UiRoot,
        ))
        .id();

    let ops_rx = channels.ops_rx.take().expect("setup runs once");
    commands.insert_resource(JsBridge::new(ops_rx, channels.outbound_tx.clone(), root));
}

/// Polls the built bundle's mtime and signals the JS thread to hot reload when
/// it changes (e.g. after `esbuild --watch` rebuilds it).
#[derive(Resource)]
struct BundleWatch {
    path: PathBuf,
    last_modified: Option<std::time::SystemTime>,
    timer: Timer,
    reload_tx: tokio::sync::mpsc::UnboundedSender<()>,
}

fn watch_bundle(time: Res<Time>, mut watch: ResMut<BundleWatch>) {
    watch.timer.tick(time.delta());
    if !watch.timer.just_finished() {
        return;
    }
    let current = file_mtime(&watch.path);
    if current.is_some() && current != watch.last_modified {
        watch.last_modified = current;
        info!("bundle changed — hot reloading React app");
        let _ = watch.reload_tx.send(());
    }
}

fn file_mtime(path: &std::path::Path) -> Option<std::time::SystemTime> {
    std::fs::metadata(path).and_then(|m| m.modified()).ok()
}
