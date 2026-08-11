//! Settings persistence: the panel's layout blob round-trips JS → file → JS
//! (debounced writes, one-shot restore after the React app mounts).

use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;
use std::time::Duration;

use crate::event::ReactEvents;
use crate::reconcile::OpApplyStats;
use crate::window::ui_viewport_size;
use crate::{react_event, react_message};

use super::panel::{DevtoolsToggle, DevtoolsWindow};
use super::{DevtoolsConfig, DevtoolsState};

/// The panel's persisted layout settings. One flat shape wears three hats: the
/// JS → Bevy `devtools.settings` message (sent on any layout change), the JSON
/// settings file, and — via [`DevtoolsRestore`] — the Bevy → JS restore event.
/// `mode` stays a loose string ("left" | "right" | "float"); JS validates on
/// restore, so an old/hand-edited file can never wedge the panel.
///
/// Geometry is **proportional**: the `*_frac` fields are fractions of the
/// window's logical size (docked width, float rect), so a resized window can
/// never strand the panel off-screen; `split` stays panel-internal pixels.
/// `#[serde(default)]` keeps old files loading: a pre-fraction file (pixel
/// `width`/`float_x`… keys) still restores `mode`/`reserve`/`overlay`/`split`,
/// while its stale pixel fields are ignored and the fractions take defaults.
/// The defaults mirror the JS panel's initial state (`DevtoolsHost.tsx`).
#[react_message(name = "devtools.settings")]
#[derive(serde::Serialize, Clone, PartialEq)]
#[serde(default)]
pub(crate) struct DevtoolsSettings {
    /// Whether the panel was open — persisted so it reopens on relaunch.
    open: bool,
    /// The active tab ("nodes" | "layers" | "console" | "bridge") — persisted
    /// so the panel reopens where you left it. Loose string; JS validates on
    /// restore, unknown values fall back to the default tab.
    tab: String,
    mode: String,
    width_frac: f32,
    float_x_frac: f32,
    float_y_frac: f32,
    float_w_frac: f32,
    float_h_frac: f32,
    reserve: bool,
    /// The persistent selected-node overlay toggle — read at plugin build to
    /// seed [`DevtoolsState::show_selection_overlay`] before the JS panel
    /// wakes, hence the wider visibility.
    pub(super) overlay: bool,
    split: f32,
}

impl Default for DevtoolsSettings {
    fn default() -> Self {
        Self {
            open: false,
            tab: "nodes".into(),
            mode: "right".into(),
            width_frac: 0.3,
            float_x_frac: 0.08,
            float_y_frac: 0.1,
            float_w_frac: 0.33,
            float_h_frac: 0.7,
            reserve: false,
            overlay: true,
            split: 260.0,
        }
    }
}

/// Bevy → JS: the settings loaded from disk, sent once after the React app
/// mounts (a struct can't wear both bridge macros, hence the twin).
#[react_event(name = "devtools.restore")]
struct DevtoolsRestore {
    open: bool,
    tab: String,
    mode: String,
    width_frac: f32,
    float_x_frac: f32,
    float_y_frac: f32,
    float_w_frac: f32,
    float_h_frac: f32,
    reserve: bool,
    overlay: bool,
    split: f32,
}

impl From<&DevtoolsSettings> for DevtoolsRestore {
    fn from(s: &DevtoolsSettings) -> Self {
        Self {
            open: s.open,
            tab: s.tab.clone(),
            mode: s.mode.clone(),
            width_frac: s.width_frac,
            float_x_frac: s.float_x_frac,
            float_y_frac: s.float_y_frac,
            float_w_frac: s.float_w_frac,
            float_h_frac: s.float_h_frac,
            reserve: s.reserve,
            overlay: s.overlay,
            split: s.split,
        }
    }
}

/// Settings persistence state: what was loaded at startup (drives the one-shot
/// restore), the latest blob from JS, and the debounced-write bookkeeping.
#[derive(Resource)]
pub(super) struct DevtoolsPersistence {
    loaded: Option<DevtoolsSettings>,
    pending: Option<DevtoolsSettings>,
    /// What the file currently holds — identical rewrites are skipped.
    last_written: Option<DevtoolsSettings>,
    /// When the pending blob last changed (native only; wasm never writes).
    #[cfg(not(target_arch = "wasm32"))]
    dirty_at: Option<std::time::Instant>,
    /// Quiet time before a write; absorbs per-frame emits during drags.
    debounce: Duration,
}

impl DevtoolsPersistence {
    /// The startup persistence state for the given loaded blob (`None` = no
    /// file / corrupt / persistence disabled).
    pub(super) fn from_loaded(loaded: Option<DevtoolsSettings>) -> Self {
        Self {
            last_written: loaded.clone(),
            loaded,
            pending: None,
            #[cfg(not(target_arch = "wasm32"))]
            dirty_at: None,
            debounce: Duration::from_secs(1),
        }
    }
}

/// Read + parse the settings file. Any failure (no path, missing file, corrupt
/// JSON) means fresh defaults. No-op on web.
#[cfg_attr(target_arch = "wasm32", allow(unused_variables))]
pub(super) fn load_settings(path: Option<&std::path::Path>) -> Option<DevtoolsSettings> {
    #[cfg(not(target_arch = "wasm32"))]
    {
        let text = std::fs::read_to_string(path?).ok()?;
        serde_json::from_str(&text).ok()
    }
    #[cfg(target_arch = "wasm32")]
    None
}

/// Write the pending blob if it differs from what the file holds. Failures
/// warn once per change (the dirty stamp is cleared either way — no retry
/// spam). Native only.
#[cfg(not(target_arch = "wasm32"))]
fn write_pending(persist: &mut DevtoolsPersistence, path: &std::path::Path) {
    persist.dirty_at = None;
    let Some(pending) = persist.pending.clone() else {
        return;
    };
    if persist.last_written.as_ref() == Some(&pending) {
        return;
    }
    if let Some(parent) = path.parent().filter(|p| !p.as_os_str().is_empty()) {
        let _ = std::fs::create_dir_all(parent);
    }
    match serde_json::to_string_pretty(&pending) {
        Ok(json) => match std::fs::write(path, json) {
            Ok(()) => persist.last_written = Some(pending),
            Err(e) => warn!("devtools: failed to write settings {}: {e}", path.display()),
        },
        Err(e) => warn!("devtools: failed to serialize settings: {e}"),
    }
}

pub(super) fn on_settings_message(
    msg: On<DevtoolsSettings>,
    #[cfg_attr(target_arch = "wasm32", allow(unused_mut, unused_variables))] mut persist: ResMut<
        DevtoolsPersistence,
    >,
) {
    #[cfg(not(target_arch = "wasm32"))]
    {
        persist.pending = Some(msg.event().clone());
        persist.dirty_at = Some(std::time::Instant::now());
    }
    #[cfg(target_arch = "wasm32")]
    let _ = msg;
}

/// Push the settings to the JS panel, once, after the React app has mounted
/// (the first applied op batch — sending on frame one would race the isolate's
/// listener registration). Sent **always**, with defaults when no file loaded:
/// the JS recorder arms at install to capture the initial mount and disarms on
/// a restore that says the panel stays closed, so every session must get
/// exactly one restore. The window size goes first (same system, so ordering
/// is guaranteed) — the restored fractions need it — and a persisted
/// `open: true` reopens the panel here (the JS side mirrors the toggle).
pub(super) fn send_restore(
    persist: Res<DevtoolsPersistence>,
    stats: Res<OpApplyStats>,
    cameras: Query<&Camera, With<IsDefaultUiCamera>>,
    windows: Query<&Window>,
    mut state: ResMut<DevtoolsState>,
    events: ReactEvents,
    mut done: Local<bool>,
) {
    if *done {
        return;
    }
    if stats.applied_count == 0 {
        return;
    }
    *done = true;
    if let Some(size) = ui_viewport_size(&cameras, &windows) {
        events.send(&DevtoolsWindow {
            width: size.x,
            height: size.y,
        });
    }
    let settings = persist.loaded.clone().unwrap_or_default();
    events.send(&DevtoolsRestore::from(&settings));
    if settings.open {
        state.open = true;
        events.send(&DevtoolsToggle { open: true });
    }
}

/// Debounced settings write: JS emits on every layout change (per frame during
/// a drag); the file is written once things go quiet.
#[cfg_attr(target_arch = "wasm32", allow(unused_mut, unused_variables))]
pub(super) fn save_settings(mut persist: ResMut<DevtoolsPersistence>, config: Res<DevtoolsConfig>) {
    #[cfg(not(target_arch = "wasm32"))]
    {
        let Some(path) = config.settings_path.clone() else {
            return;
        };
        let debounce = persist.debounce;
        if persist.dirty_at.is_some_and(|t| t.elapsed() >= debounce) {
            write_pending(&mut persist, &path);
        }
    }
}

/// Flush pending settings when the app quits, so a layout change made moments
/// before closing isn't lost to the debounce window.
#[cfg_attr(target_arch = "wasm32", allow(unused_mut, unused_variables))]
pub(super) fn flush_settings_on_exit(
    mut exits: MessageReader<AppExit>,
    mut persist: ResMut<DevtoolsPersistence>,
    config: Res<DevtoolsConfig>,
) {
    #[cfg(not(target_arch = "wasm32"))]
    {
        if exits.read().next().is_none() {
            return;
        }
        let Some(path) = config.settings_path.clone() else {
            return;
        };
        if persist.dirty_at.is_some() {
            write_pending(&mut persist, &path);
        }
    }
    #[cfg(target_arch = "wasm32")]
    exits.clear();
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::devtools::test_util::{drain_events, test_app};
    use crate::protocol::outbound::Outbound;
    use tokio::sync::mpsc::UnboundedReceiver;

    /// A unique temp path per test; deleted on drop.
    struct TempSettings(std::path::PathBuf);
    impl TempSettings {
        fn new(name: &str) -> Self {
            Self(std::env::temp_dir().join(format!(
                "bevy-react-devtools-{name}-{}.json",
                std::process::id()
            )))
        }
    }
    impl Drop for TempSettings {
        fn drop(&mut self) {
            let _ = std::fs::remove_file(&self.0);
        }
    }

    fn sample_settings() -> DevtoolsSettings {
        DevtoolsSettings {
            open: false,
            tab: "layers".into(),
            mode: "float".into(),
            width_frac: 0.4,
            float_x_frac: 0.05,
            float_y_frac: 0.1,
            float_w_frac: 0.5,
            float_h_frac: 0.6,
            reserve: true,
            overlay: false,
            split: 200.0,
        }
    }

    fn drain_restores(rx: &mut UnboundedReceiver<Outbound>) -> Vec<serde_json::Value> {
        drain_events(rx)
            .into_iter()
            .filter(|(name, _)| name == "devtools.restore")
            .map(|(_, v)| v)
            .collect()
    }

    /// A settings file persisted with `open: true` reopens the panel — but only
    /// after the React app mounted (the first applied batch), and exactly once.
    #[test]
    fn restored_open_opens_panel_after_first_batch() {
        let tmp = TempSettings::new("open");
        let settings = DevtoolsSettings {
            open: true,
            ..Default::default()
        };
        std::fs::write(&tmp.0, serde_json::to_string(&settings).unwrap()).unwrap();
        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: Some(tmp.0.clone()),
            ..default()
        });
        app.update();
        assert!(
            drain_events(&mut rx).is_empty(),
            "must not reopen before the React app mounted"
        );

        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;
        app.update();
        let events = drain_events(&mut rx);
        assert!(
            events
                .iter()
                .any(|(name, v)| name == "devtools.restore" && v["open"] == true),
            "the restore blob must carry the persisted open state"
        );
        assert!(
            events
                .iter()
                .any(|(name, v)| name == "devtools.toggle" && v["open"] == true),
            "a persisted open must reopen the panel once a batch has been applied"
        );
        assert!(app.world().resource::<DevtoolsState>().open);

        app.update();
        assert!(
            drain_events(&mut rx)
                .iter()
                .all(|(name, _)| name != "devtools.toggle" && name != "devtools.restore"),
            "the restore-open must fire exactly once"
        );
    }

    /// A pre-existing settings file seeds the Rust-side overlay toggle at
    /// build, and restores to JS exactly once — after the first applied batch.
    #[test]
    fn settings_file_seeds_overlay_and_restores_once() {
        let tmp = TempSettings::new("restore");
        std::fs::write(&tmp.0, serde_json::to_string(&sample_settings()).unwrap()).unwrap();
        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: Some(tmp.0.clone()),
            ..default()
        });

        assert!(
            !app.world()
                .resource::<DevtoolsState>()
                .show_selection_overlay,
            "the loaded overlay=false must seed the state at build"
        );

        app.update();
        assert!(
            drain_restores(&mut rx).is_empty(),
            "no restore before the React app mounted"
        );

        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;
        app.update();
        let restores = drain_restores(&mut rx);
        assert_eq!(restores.len(), 1, "exactly one restore after mount");
        assert_eq!(restores[0]["mode"], "float");
        assert_eq!(restores[0]["split"], 200.0);
        assert_eq!(restores[0]["overlay"], false);

        app.update();
        assert!(drain_restores(&mut rx).is_empty(), "restore is one-shot");
    }

    /// A `devtools.settings` message round-trips to the file once the debounce
    /// elapses (zeroed here), and identical settings don't rewrite.
    #[test]
    fn settings_message_writes_file_debounced() {
        let tmp = TempSettings::new("save");
        let (mut app, _rx) = test_app(DevtoolsConfig {
            settings_path: Some(tmp.0.clone()),
            ..default()
        });
        app.world_mut()
            .resource_mut::<DevtoolsPersistence>()
            .debounce = Duration::ZERO;

        app.world_mut().trigger(sample_settings());
        app.update();

        let written: DevtoolsSettings =
            serde_json::from_str(&std::fs::read_to_string(&tmp.0).unwrap()).unwrap();
        assert!(written == sample_settings(), "full round-trip");

        // An identical re-send must not rewrite (mtime unchanged).
        let mtime = |p: &std::path::Path| std::fs::metadata(p).unwrap().modified().unwrap();
        let before = mtime(&tmp.0);
        app.world_mut().trigger(sample_settings());
        app.update();
        assert_eq!(mtime(&tmp.0), before, "identical settings skip the write");
    }

    /// `AppExit` flushes a still-debouncing change immediately (`Last` runs on
    /// the exit frame), so a drag right before quitting isn't lost.
    #[test]
    fn settings_flush_on_app_exit() {
        let tmp = TempSettings::new("flush");
        let (mut app, _rx) = test_app(DevtoolsConfig {
            settings_path: Some(tmp.0.clone()),
            ..default()
        });
        // Default 1s debounce: a normal update must NOT write yet.
        app.world_mut().trigger(sample_settings());
        app.update();
        assert!(!tmp.0.exists(), "still inside the debounce window");

        app.world_mut().write_message(AppExit::Success);
        app.update();
        assert!(tmp.0.exists(), "AppExit must flush the pending settings");
    }

    /// Corrupt files mean fresh defaults — but STILL exactly one restore (the
    /// JS recorder disarms on it; corrupt ≡ missing ≡ defaults).
    /// `no_settings_file()` disables writing entirely.
    #[test]
    fn corrupt_or_disabled_settings_are_ignored() {
        let tmp = TempSettings::new("corrupt");
        std::fs::write(&tmp.0, "{ not json").unwrap();
        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: Some(tmp.0.clone()),
            ..default()
        });
        assert!(
            app.world()
                .resource::<DevtoolsState>()
                .show_selection_overlay
        );
        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;
        app.update();
        let restores = drain_restores(&mut rx);
        assert_eq!(restores.len(), 1, "corrupt file → one restore, defaults");
        assert_eq!(restores[0]["mode"], "right");
        assert_eq!(restores[0]["open"], false);
        assert!(!app.world().resource::<DevtoolsState>().open);
        // Release the first app (and its diag test lock — see `test_app`)
        // before building the second, or the lock self-deadlocks.
        drop(app);

        let (mut app, _rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
        app.world_mut()
            .resource_mut::<DevtoolsPersistence>()
            .debounce = Duration::ZERO;
        app.world_mut().trigger(sample_settings());
        app.update(); // must not panic / write anywhere
    }

    /// With no settings file at all, the restore (with defaults) is still sent
    /// exactly once after the first applied batch — the JS recorder's disarm
    /// signal must never be skipped.
    #[test]
    fn restore_defaults_sent_without_settings_file() {
        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
        app.update();
        assert!(drain_restores(&mut rx).is_empty(), "not before mount");

        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;
        app.update();
        let restores = drain_restores(&mut rx);
        assert_eq!(restores.len(), 1, "defaults restore exactly once");
        assert_eq!(restores[0]["open"], false);
        assert_eq!(restores[0]["mode"], "right");

        app.update();
        assert!(drain_restores(&mut rx).is_empty(), "one-shot");
    }

    /// A pre-fraction (pixel-unit) settings file still loads: the shared keys
    /// (`mode`/`reserve`/`overlay`/`split`) restore, the stale pixel fields are
    /// ignored as unknown keys, and the fraction fields take defaults.
    #[test]
    fn legacy_pixel_settings_file_migrates() {
        let tmp = TempSettings::new("legacy");
        let legacy = serde_json::json!({
            "mode": "float",
            "width": 420.0,
            "float_x": 10.0,
            "float_y": 20.0,
            "float_w": 500.0,
            "float_h": 600.0,
            "reserve": true,
            "overlay": false,
            "split": 200.0,
        });
        std::fs::write(&tmp.0, legacy.to_string()).unwrap();
        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: Some(tmp.0.clone()),
            ..default()
        });
        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;
        app.update();
        let restores = drain_restores(&mut rx);
        assert_eq!(restores.len(), 1, "a legacy file must still restore");
        assert_eq!(restores[0]["mode"], "float");
        assert_eq!(restores[0]["overlay"], false);
        assert_eq!(restores[0]["split"], 200.0);
        assert_eq!(restores[0]["open"], false, "no persisted open → closed");
        assert_eq!(restores[0]["tab"], "nodes", "no persisted tab → default");
        let frac = restores[0]["width_frac"].as_f64().expect("a number");
        assert!(
            (frac - f64::from(DevtoolsSettings::default().width_frac)).abs() < 1e-6,
            "stale pixel width is ignored; the fraction takes its default"
        );
    }
}
