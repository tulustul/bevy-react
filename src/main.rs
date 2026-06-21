//! bevy-react: drive `bevy_ui` from a React app running on an embedded V8
//! (deno_core) runtime. The bridge is deliberately tiny: two channels and two
//! ops connect a dedicated JS thread to Bevy (see the design doc).

mod bridge;
mod js_thread;
mod protocol;
mod reconcile;
mod ui_map;

use std::path::PathBuf;

use bevy::prelude::*;

use bridge::{EventSender, JsBridge, OpReceiver};
use protocol::{Op, UiEvent};
use reconcile::{apply_js_ops, collect_ui_events};

/// Marker for the UI root entity (reconciler node id 0 / `ROOT_ID`).
#[derive(Component)]
struct UiRoot;

fn main() {
    // `--selftest` exercises the full JS<->Rust bridge headlessly (no GPU): it
    // plays the role of Bevy, asserting the initial render and a click round
    // trip. Useful where a window/display isn't available.
    if std::env::args().any(|a| a == "--selftest") {
        std::process::exit(selftest());
    }
    run_app();
}

fn run_app() {
    // Channels: op batches flow JS -> Bevy; UI events and reload signals flow
    // Bevy -> JS.
    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (events_tx, events_rx) = tokio::sync::mpsc::unbounded_channel::<UiEvent>();
    let (reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    // Launch the JS thread up front. It only needs the channels — not the ECS —
    // so it can start rendering immediately. Its first ops just queue until
    // Bevy's `setup` builds the root.
    let bundle = bundle_path();
    if !bundle.exists() {
        panic!(
            "JS bundle not found at {}.\nRun `cd js && npm install && npm run build` first.",
            bundle.display()
        );
    }
    let last_modified = file_mtime(&bundle);
    js_thread::spawn_js_thread(bundle.clone(), ops_tx, events_rx, reload_rx);

    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "bevy-react".to_string(),
                ..default()
            }),
            ..default()
        }))
        // Park the Bevy-side channel ends until `setup` can pair them with the
        // root entity inside the `JsBridge` resource.
        .insert_resource(BridgeChannels {
            ops_rx: Some(ops_rx),
            events_tx,
        })
        .insert_resource(BundleWatch {
            path: bundle,
            last_modified,
            timer: Timer::from_seconds(0.3, TimerMode::Repeating),
            reload_tx,
        })
        .add_systems(Startup, setup)
        .add_systems(Update, (apply_js_ops, collect_ui_events, watch_bundle))
        .run();
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

/// Carries the Bevy-side channel ends from `main` into `setup`.
#[derive(Resource)]
struct BridgeChannels {
    ops_rx: Option<OpReceiver>,
    events_tx: EventSender,
}

fn setup(mut commands: Commands, mut channels: ResMut<BridgeChannels>) {
    // UI requires a camera.
    commands.spawn(Camera2d);

    // The root container: a full-window centered flex column that the reconciler
    // appends top-level children into (it is reconciler node id 0).
    let root = commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                justify_content: JustifyContent::Center,
                align_items: AlignItems::Center,
                row_gap: Val::Px(16.0),
                ..default()
            },
            UiRoot,
        ))
        .id();

    let ops_rx = channels.ops_rx.take().expect("setup runs once");
    commands.insert_resource(JsBridge::new(ops_rx, channels.events_tx.clone(), root));
}

fn bundle_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("js")
        .join("dist")
        .join("bundle.js")
}

/// Headless end-to-end check of the bridge. Returns a process exit code.
fn selftest() -> i32 {
    use std::time::{Duration, Instant};

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (events_tx, events_rx) = tokio::sync::mpsc::unbounded_channel::<UiEvent>();
    // Held for the duration: dropping the reload sender would look like shutdown.
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let bundle = bundle_path();
    if !bundle.exists() {
        eprintln!("bundle missing: {}", bundle.display());
        return 1;
    }
    js_thread::spawn_js_thread(bundle, ops_tx, events_rx, reload_rx);

    // Phase 1: collect the initial render. Expect a `button` (with onClick) and
    // a `Count: 0` text node.
    let mut button_id: Option<u32> = None;
    let mut saw_count0 = false;
    let deadline = Instant::now() + Duration::from_secs(15);
    while Instant::now() < deadline && !(button_id.is_some() && saw_count0) {
        match ops_rx.recv_timeout(Duration::from_millis(500)) {
            Ok(batch) => {
                for op in &batch {
                    match op {
                        Op::Create { id, kind, props } if kind == "button" => {
                            button_id = Some(*id);
                            if !props.on_click {
                                eprintln!("FAIL: button created without onClick");
                                return 1;
                            }
                        }
                        Op::CreateText { text, .. } if text.contains("Count: 0") => {
                            saw_count0 = true;
                        }
                        _ => {}
                    }
                }
            }
            Err(_) => {}
        }
    }

    let Some(button_id) = button_id else {
        eprintln!("FAIL: no button in initial render (saw_count0={saw_count0})");
        return 1;
    };
    if !saw_count0 {
        eprintln!("FAIL: initial 'Count: 0' text not rendered");
        return 1;
    }
    println!("OK   initial render: button id={button_id}, 'Count: 0' present");

    // Phase 2: act as Bevy reporting a click on the button.
    if events_tx.send(UiEvent { id: button_id, kind: "click".into() }).is_err() {
        eprintln!("FAIL: JS thread gone before click");
        return 1;
    }

    // Phase 3: expect the re-render to update the text to 'Count: 1'.
    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if let Ok(batch) = ops_rx.recv_timeout(Duration::from_millis(500)) {
            for op in &batch {
                if let Op::UpdateText { text, .. } = op {
                    if text.contains("Count: 1") {
                        println!("OK   click round trip: text updated to 'Count: 1'");
                        println!("PASS bridge end-to-end");
                        return 0;
                    }
                }
            }
        }
    }
    eprintln!("FAIL: no 'Count: 1' update after click");
    1
}
