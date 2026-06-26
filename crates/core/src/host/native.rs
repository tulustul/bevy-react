//! Native JS host: creates the Bevy→JS tokio channels, spawns the V8 JS thread
//! (see [`crate::js_thread`]), and watches the bundle on disk for hot reload.

use bevy::prelude::*;

use crate::bridge::OutboundSender;
use crate::js_thread::spawn_js_thread;
use crate::protocol::Outbound;

use super::{HostConfig, HostSenders};

/// Wire the native host into `app` and return the sender outbound producers use.
///
/// Spawns the dedicated JS thread immediately (it only needs the channels, not the
/// ECS, so it can start rendering before `Startup` builds the root) and registers
/// bundle hot-reload watching unless disabled.
pub(crate) fn spawn(app: &mut App, config: HostConfig, senders: HostSenders) -> OutboundSender {
    // Bevy → JS: a single `Outbound` stream (UI events, app events, responses) plus
    // reload signals. The JS thread parks on an async recv, so these are tokio mpsc.
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    let (reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let bundle = config.bundle;
    // The build emits two files side by side: `vendor.js` (loaded once) and the
    // app bundle (`bundle`, re-executed on each hot reload).
    let vendor = bundle.with_file_name("vendor.js");
    for (label, path) in [("app bundle", &bundle), ("vendor bundle", &vendor)] {
        if !path.exists() {
            panic!(
                "JS {label} not found at {}.\nBuild your app first (e.g. `npm run build`).",
                path.display()
            );
        }
    }

    spawn_js_thread(
        vendor,
        bundle.clone(),
        senders.ops,
        senders.emit,
        senders.request,
        senders.anim,
        outbound_rx,
        reload_rx,
    );

    if config.hot_reload {
        app.insert_resource(BundleWatch {
            last_modified: file_mtime(&bundle),
            path: bundle,
            timer: Timer::from_seconds(0.3, TimerMode::Repeating),
            reload_tx,
        })
        .add_systems(Update, watch_bundle);
    } else {
        // Keep the sender alive so the JS thread doesn't see shutdown.
        app.insert_resource(ReloadKeepAlive(reload_tx));
    }

    outbound_tx
}

/// Holds the reload sender when hot reload is disabled, so the JS thread's reload
/// channel never observes "all senders dropped" (shutdown).
#[derive(Resource)]
struct ReloadKeepAlive(#[allow(dead_code)] tokio::sync::mpsc::UnboundedSender<()>);

/// Polls the built bundle's mtime and signals the JS thread to hot reload when it
/// changes (e.g. after `esbuild --watch` rebuilds it).
#[derive(Resource)]
struct BundleWatch {
    path: std::path::PathBuf,
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
