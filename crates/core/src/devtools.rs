//! The Chrome-DevTools-style inspector: a React panel (shipped inside the
//! bevy-react JS runtime, rendered into a detached `<root>` overlay) backed by
//! this Bevy-side plugin. The panel gives a live nodes explorer, two-way node
//! selection (tree → on-screen highlight, screen → tree pick mode), transient
//! inline prop/style editing, stats + render timings, and a bridge-message log.
//!
//! Add [`DevtoolsPlugin`] after [`ReactUiPlugin`](crate::ReactUiPlugin):
//!
//! ```ignore
//! app.add_plugins(DevtoolsPlugin::new().toggle_key(KeyCode::F12));
//! ```
//!
//! The module only exists behind the `devtools` cargo feature (off by default,
//! auto-enabled for this repo's own examples/tests via the self dev-dependency),
//! and the plugin is inert in `--release` builds even when compiled in. The JS
//! half lives in `js/src/devtools/` and is stripped from production bundles.
//!
//! ## Bridge channels
//!
//! All devtools traffic is deliberately **untyped on the JS side** (hand-written
//! mirror types in `js/src/devtools/api.ts`), so nothing here appears in an
//! app's generated `bevy.ts` — the `--export-bindings` exporter never adds this
//! plugin. Rust still uses the typed macros:
//!
//! - Bevy → JS events: `devtools.toggle { open }`, `devtools.batchStats { … }`
//!   (event-driven — one per applied APP op batch while open; an idle app
//!   sends nothing, and the panel's own repaints are excluded via the
//!   per-batch origin flags so the panel never observes itself),
//!   `devtools.picked { id }`, `devtools.window { width, height }` (the UI
//!   viewport's logical size — once when the panel opens and on every resize
//!   while it is open; the panel's layout is proportional, so JS needs it).
//! - JS → Bevy messages: `devtools.open { open }`, `devtools.pick { on }`,
//!   `devtools.select { id }`, `devtools.highlight { id }`,
//!   `devtools.overlay { on }`, `devtools.panelRoot { id }`,
//!   `devtools.dock { side, width }` (the panel's space reservation — see
//!   [`apply_dock_reservation`]), `devtools.settings { … }` (the persisted
//!   layout blob — see [`DevtoolsSettings`]).
//! - Settings persistence: layout settings — including whether the panel was
//!   open, so it reopens where you left it — round-trip through a JSON file
//!   (default `.bevy-react-devtools.json` in the working directory —
//!   [`DevtoolsPlugin::settings_path`] / [`DevtoolsPlugin::no_settings_file`]).
//!   The blob returns to the panel exactly once via `devtools.restore` —
//!   **always**, with defaults when there is no (or a corrupt) file: the JS
//!   recorder arms itself at install to capture the app's initial mount and
//!   relies on that one deterministic signal to disarm when the panel is
//!   staying closed (see `js/src/devtools/recorder.ts`).
//!
//! Render-time legs mirror the stress harness (`examples/stress/table_ops.rs`):
//! `translate` (op → command queuing, from [`OpApplyStats`]), `command` (command
//! execution + UI prepare/content), `layout` (taffy solve + post-layout
//! propagation), bracketed around `UiSystems::Layout` in `PostUpdate`.

use bevy::picking::hover::HoverMap;
use bevy::picking::pointer::PointerId;
use bevy::prelude::*;
use bevy::ui::{ComputedNode, IsDefaultUiCamera, UiGlobalTransform, UiSystems};
use std::time::Duration;

use crate::bridge::{JsBridge, RNode};
use crate::event::ReactEvents;
use crate::message::ReactAppExt;
use crate::plugin::PointerCapture;
use crate::protocol::NodeId;
use crate::reconcile::{OpApplyStats, climb};
use crate::{react_event, react_message};

/// The Bevy side of the devtools inspector. See the [module docs](self).
///
/// The panel toggles with [`toggle_key`](Self::toggle_key) (default `F12`).
/// Whether it was open persists with the layout settings, so an app closed
/// with the panel open reopens it on the next launch (once the React app has
/// mounted).
pub struct DevtoolsPlugin {
    toggle_key: KeyCode,
    settings_path: Option<std::path::PathBuf>,
}

impl Default for DevtoolsPlugin {
    fn default() -> Self {
        Self {
            toggle_key: KeyCode::F12,
            settings_path: Some(std::path::PathBuf::from(".bevy-react-devtools.json")),
        }
    }
}

impl DevtoolsPlugin {
    pub fn new() -> Self {
        Self::default()
    }

    /// The key that toggles the panel (default `F12`).
    pub fn toggle_key(mut self, key: KeyCode) -> Self {
        self.toggle_key = key;
        self
    }

    /// Where the panel's layout settings (dock mode/width, float rect, the
    /// reserve and overlay toggles, tree/inspector split) persist across runs.
    /// Default: `.bevy-react-devtools.json` in the working directory. Native
    /// only — on web the file is neither read nor written.
    pub fn settings_path(mut self, path: impl Into<std::path::PathBuf>) -> Self {
        self.settings_path = Some(path.into());
        self
    }

    /// Disable settings persistence entirely.
    pub fn no_settings_file(mut self) -> Self {
        self.settings_path = None;
        self
    }
}

impl Plugin for DevtoolsPlugin {
    fn build(&self, app: &mut App) {
        // "Dev build only": even when the feature is compiled in (e.g.
        // `cargo run --release --example demos`, where the self dev-dependency
        // still unifies the feature on), the plugin registers nothing.
        if !cfg!(debug_assertions) {
            warn!("DevtoolsPlugin is inert in release builds");
            return;
        }
        // Load persisted panel settings (native only; errors — missing file,
        // corrupt JSON — mean fresh defaults). The overlay toggle seeds the
        // Rust-side state immediately so highlight gating is correct before
        // the JS panel wakes; the rest restores to JS via `send_restore`.
        let loaded = load_settings(self.settings_path.as_deref());
        app.insert_resource(DevtoolsState {
            show_selection_overlay: loaded.as_ref().is_none_or(|s| s.overlay),
            ..Default::default()
        })
        .insert_resource(DevtoolsPersistence {
            last_written: loaded.clone(),
            loaded,
            pending: None,
            #[cfg(not(target_arch = "wasm32"))]
            dirty_at: None,
            debounce: Duration::from_secs(1),
        })
        .init_resource::<DevtoolsTimers>()
        .insert_resource(DevtoolsConfig {
            toggle_key: self.toggle_key,
            settings_path: self.settings_path.clone(),
        })
        // Panel → Bevy state sync. Registration is what routes the emits;
        // none of this reaches an app's generated `bevy.ts` because the
        // bindings exporter never adds this plugin.
        .add_react_handler(on_open_message)
        .add_react_handler(on_pick_message)
        .add_react_handler(on_select_message)
        .add_react_handler(on_highlight_message)
        .add_react_handler(on_overlay_message)
        .add_react_handler(on_panel_root_message)
        .add_react_handler(on_dock_message)
        .add_react_handler(on_settings_message)
        // Registered in the plugin's OWN tuples — `plugin.rs`'s Update tuple
        // sits at Bevy's 20-arity cap.
        .add_systems(Startup, spawn_highlight_overlay)
        .add_systems(
            Update,
            (
                toggle_on_key,
                send_window_size,
                position_highlight,
                apply_dock_reservation,
                send_restore,
                save_settings,
            ),
        )
        // A quit right after a layout drag must not lose the change: flush
        // pending settings on `AppExit`, which is written during `Update` —
        // `Last` still runs on that final frame.
        .add_systems(Last, flush_settings_on_exit)
        // In the pointer-capture set, after the system that ASSIGNS
        // `PointerCapture::over_ui` each frame, so pick mode's claim
        // survives for world-input systems ordered `.after(PointerCaptureSet)`.
        .add_systems(
            Update,
            drive_pick_mode
                .in_set(crate::plugin::PointerCaptureSet)
                .after(crate::reconcile::collect_pointer_events),
        )
        .add_systems(
            PostUpdate,
            (
                // The markers bracket `UiSystems::Layout` exactly like the
                // stress harness: `apply_js_ops` ran in `Update`, so
                // `OpApplyStats` already reflects this frame's batch.
                mark_pre_layout
                    .after(UiSystems::Content)
                    .before(UiSystems::Layout),
                // After PostLayout so the layout leg covers the whole
                // pipeline (taffy solve + computed transform/clip
                // propagation), not just the Layout set.
                mark_post_layout.after(UiSystems::PostLayout),
                emit_batch_stats.after(mark_post_layout),
            ),
        );
    }
}

/// Plugin configuration, kept as a resource so the key handler can read it.
#[derive(Resource)]
struct DevtoolsConfig {
    toggle_key: KeyCode,
    /// Where panel settings persist (`None` = persistence disabled).
    settings_path: Option<std::path::PathBuf>,
}

/// Live devtools state, written by the JS panel's messages (and the toggle key)
/// and read by the highlight/pick systems.
#[derive(Resource)]
pub(crate) struct DevtoolsState {
    /// Whether the panel is open. Gates stats emission and pick/highlight.
    pub open: bool,
    /// Whether pick mode ("click a node on screen to select it") is active.
    pub pick: bool,
    /// The node selected in the tree explorer.
    pub selected: Option<NodeId>,
    /// The node whose tree row the panel pointer is hovering.
    pub tree_hover: Option<NodeId>,
    /// The node under the window cursor while pick mode is active.
    pub pick_hover: Option<NodeId>,
    /// Whether the persistent selected-node overlay is shown (the panel's
    /// "overlay" toggle). Momentary highlights (tree-row hover, pick-mode
    /// hover) are always on.
    pub show_selection_overlay: bool,
    /// The panel's own `<root>` node id, reported by the JS panel on open
    /// (`None` while closed). Pick mode rejects hits under exactly this root —
    /// app `<root>` overlays stay pickable.
    pub panel_root: Option<NodeId>,
    /// Which window edge the panel reserves space on (`None` = the panel
    /// overlays the app: reserve toggled off, floating, or closed). Reported
    /// by the JS panel via `devtools.dock`.
    pub dock_side: Option<DockSide>,
    /// The reserved width in logical pixels (meaningful with `dock_side`).
    pub dock_width: f32,
}

/// The window edge a docked, space-reserving panel sits on.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum DockSide {
    Left,
    Right,
}

impl Default for DevtoolsState {
    fn default() -> Self {
        Self {
            open: false,
            pick: false,
            selected: None,
            tree_hover: None,
            pick_hover: None,
            show_selection_overlay: true,
            panel_root: None,
            dock_side: None,
            dock_width: 0.0,
        }
    }
}

// --- Bridge bindings (see module docs; untyped on the JS side) -----------------

/// Bevy → JS: the panel's open state changed Bevy-side (toggle key / auto-open).
/// Carries the resulting state (not a bare "flip") so the panel mirrors Bevy
/// instead of tracking parity.
#[react_event(name = "devtools.toggle")]
struct DevtoolsToggle {
    open: bool,
}

/// Bevy → JS: pick mode clicked a node on screen — select it in the tree.
#[react_event(name = "devtools.picked")]
struct DevtoolsPicked {
    id: NodeId,
}

/// Bevy → JS: the UI viewport's logical size. The panel's layout is
/// proportional (fractions of the viewport), and JS can't see it on its own —
/// sent once when the panel opens and on every size change while it stays open
/// (see [`send_window_size`]; [`send_restore`] also sends it ahead of the
/// restore blob so the restored fractions resolve against a real size).
#[react_event(name = "devtools.window")]
struct DevtoolsWindow {
    width: f32,
    height: f32,
}

/// The UI's layout viewport in logical px: the default UI camera's target —
/// which detached `<root>`s (the panel) lay out against, and which stays
/// correct when that camera renders offscreen (the demos' `--shoot` mode,
/// where the OS window's size is unrelated to the capture target) — falling
/// back to the window (headless tests have no camera; a windowed app without
/// an explicit [`IsDefaultUiCamera`] targets the window anyway).
fn ui_viewport_size(
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

/// Bevy → JS: render timings for one applied op batch. **Event-driven** — sent
/// only on frames that applied a batch (while the panel is open), so an idle
/// app produces zero devtools traffic. The JS recorder attaches these to the
/// corresponding "ops" log entries. Timing legs are wall-clock ms; zero on web
/// (no `std::time::Instant` on wasm).
#[react_event(name = "devtools.batchStats")]
struct DevtoolsBatchStats {
    /// Op batches applied since startup (identifies the batch).
    applied_count: u64,
    /// Ops applied this frame (all queued flushes, coalesced).
    last_ops: usize,
    /// `op_flush` send → apply start: channel wait + frame latency.
    pre_apply_ms: f64,
    /// Op → ECS-command translation (the `apply_js_ops` body).
    translate_ms: f64,
    /// Command execution (spawn/insert/hierarchy) + UI prepare/content.
    command_ms: f64,
    /// `UiSystems::Layout` + `PostLayout` (taffy + transform/clip propagation).
    layout_ms: f64,
}

/// JS → Bevy: the panel opened or closed itself (close button, install sync).
#[react_message(name = "devtools.open")]
struct DevtoolsOpenMessage {
    open: bool,
}

/// JS → Bevy: the panel's pick-mode button was toggled.
#[react_message(name = "devtools.pick")]
struct DevtoolsPickMessage {
    on: bool,
}

/// JS → Bevy: a tree row was selected (or the selection cleared).
#[react_message(name = "devtools.select")]
struct DevtoolsSelectMessage {
    id: Option<NodeId>,
}

/// JS → Bevy: a tree row is hovered (highlight that node on screen), or `null`
/// on hover end.
#[react_message(name = "devtools.highlight")]
struct DevtoolsHighlightMessage {
    id: Option<NodeId>,
}

/// JS → Bevy: the panel's "overlay" toggle — show/hide the persistent
/// selected-node box.
#[react_message(name = "devtools.overlay")]
struct DevtoolsOverlayMessage {
    on: bool,
}

/// JS → Bevy: the panel's own `<root>` node id (`None` when the panel closes).
/// Sent on open so [`drive_pick_mode`] can reject exactly the panel.
#[react_message(name = "devtools.panelRoot")]
struct DevtoolsPanelRootMessage {
    id: Option<NodeId>,
}

/// JS → Bevy: the panel's effective space reservation. `side: None` = no
/// reservation (the reserve toggle is off, the panel floats, or it closed);
/// otherwise the app UI is pushed off that edge by `width` logical pixels
/// (see [`apply_dock_reservation`]).
#[react_message(name = "devtools.dock")]
struct DevtoolsDockMessage {
    side: Option<String>,
    width: f32,
}

fn on_open_message(msg: On<DevtoolsOpenMessage>, mut state: ResMut<DevtoolsState>) {
    state.open = msg.event().open;
    if !state.open {
        exit_interactions(&mut state);
    }
}

fn on_pick_message(msg: On<DevtoolsPickMessage>, mut state: ResMut<DevtoolsState>) {
    state.pick = msg.event().on;
    if !state.pick {
        state.pick_hover = None;
    }
}

fn on_select_message(msg: On<DevtoolsSelectMessage>, mut state: ResMut<DevtoolsState>) {
    state.selected = msg.event().id;
}

fn on_highlight_message(msg: On<DevtoolsHighlightMessage>, mut state: ResMut<DevtoolsState>) {
    state.tree_hover = msg.event().id;
}

fn on_overlay_message(msg: On<DevtoolsOverlayMessage>, mut state: ResMut<DevtoolsState>) {
    state.show_selection_overlay = msg.event().on;
}

fn on_panel_root_message(msg: On<DevtoolsPanelRootMessage>, mut state: ResMut<DevtoolsState>) {
    state.panel_root = msg.event().id;
}

fn on_dock_message(msg: On<DevtoolsDockMessage>, mut state: ResMut<DevtoolsState>) {
    state.dock_side = match msg.event().side.as_deref() {
        Some("left") => Some(DockSide::Left),
        Some("right") => Some(DockSide::Right),
        _ => None,
    };
    state.dock_width = msg.event().width.max(0.0);
}

// --- Settings persistence ------------------------------------------------------

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

impl Default for DevtoolsSettings {
    fn default() -> Self {
        Self {
            open: false,
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
struct DevtoolsPersistence {
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

/// Read + parse the settings file. Any failure (no path, missing file, corrupt
/// JSON) means fresh defaults. No-op on web.
#[cfg_attr(target_arch = "wasm32", allow(unused_variables))]
fn load_settings(path: Option<&std::path::Path>) -> Option<DevtoolsSettings> {
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

fn on_settings_message(
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
fn send_restore(
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

/// Stream the UI viewport's logical size to the panel: once when it opens and
/// on every change while it stays open (the `Local` resets while closed, so a
/// resize-while-closed is caught up on the next open). The panel's layout is
/// proportional, and JS has no other way to see the viewport.
fn send_window_size(
    state: Res<DevtoolsState>,
    stats: Res<OpApplyStats>,
    cameras: Query<&Camera, With<IsDefaultUiCamera>>,
    windows: Query<&Window>,
    events: ReactEvents,
    mut last: Local<Option<Vec2>>,
) {
    // Same first-batch gate as `send_restore`: no listener races.
    if stats.applied_count == 0 {
        return;
    }
    if !state.open {
        *last = None;
        return;
    }
    let Some(size) = ui_viewport_size(&cameras, &windows) else {
        return;
    };
    if *last != Some(size) {
        *last = Some(size);
        events.send(&DevtoolsWindow {
            width: size.x,
            height: size.y,
        });
    }
}

/// Debounced settings write: JS emits on every layout change (per frame during
/// a drag); the file is written once things go quiet.
#[cfg_attr(target_arch = "wasm32", allow(unused_mut, unused_variables))]
fn save_settings(mut persist: ResMut<DevtoolsPersistence>, config: Res<DevtoolsConfig>) {
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
fn flush_settings_on_exit(
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

/// Clear the transient interaction state that shouldn't outlive a closed panel.
fn exit_interactions(state: &mut DevtoolsState) {
    state.pick = false;
    state.tree_hover = None;
    state.pick_hover = None;
}

/// Flip the panel on the configured key and tell the JS panel the new state.
fn toggle_on_key(
    keys: Res<ButtonInput<KeyCode>>,
    cfg: Res<DevtoolsConfig>,
    mut state: ResMut<DevtoolsState>,
    events: ReactEvents,
) {
    if !keys.just_pressed(cfg.toggle_key) {
        return;
    }
    state.open = !state.open;
    if !state.open {
        exit_interactions(&mut state);
    }
    events.send(&DevtoolsToggle { open: state.open });
}

/// Reserve window space for a docked panel: inset the app's [`UiRoot`] margin
/// on the reserved edge so the whole reconciler tree reflows beside the panel
/// (Chrome-style "push"), and release it whenever the reservation ends. Gated
/// on `state.open`, so every close path (close button, toggle key) releases
/// the space with no extra bookkeeping.
///
/// The margins are compared before writing — an unconditional `Node` deref-mut
/// would re-run app layout every frame. The reserved width is clamped against
/// the window so a huge panel can't push the app entirely off-screen
/// (headless: no window, no clamp — fine for tests).
///
/// Known limitation: app-created `<root>` overlays are detached full-window
/// trees (see `reconcile.rs` `root_base`), so they are not pushed — only the
/// main tree under [`UiRoot`] is.
fn apply_dock_reservation(
    state: Res<DevtoolsState>,
    windows: Query<&Window>,
    mut root: Query<&mut Node, With<crate::plugin::UiRoot>>,
) {
    let Ok(mut node) = root.single_mut() else {
        return;
    };
    let reserved = if state.open { state.dock_side } else { None };
    let width = match windows.single() {
        Ok(window) => state.dock_width.min(window.width() - 100.0).max(0.0),
        Err(_) => state.dock_width,
    };
    let (left, right) = match reserved {
        Some(DockSide::Left) => (Val::Px(width), Val::ZERO),
        Some(DockSide::Right) => (Val::ZERO, Val::Px(width)),
        None => (Val::ZERO, Val::ZERO),
    };
    if node.margin.left != left || node.margin.right != right {
        node.margin.left = left;
        node.margin.right = right;
    }
}

/// Per-frame instants/durations splitting the post-translate cost into command
/// execution and layout, exactly like the stress harness's `BenchTimers`.
/// Updated only on frames a batch was applied.
#[derive(Resource, Default)]
struct DevtoolsTimers {
    /// Stamped each frame just before `UiSystems::Layout` (native only).
    #[cfg(not(target_arch = "wasm32"))]
    pre_layout: Option<std::time::Instant>,
    /// `pre_layout - apply_end`: command execution + UI prepare/content for the
    /// most recent applied batch.
    last_command: Duration,
    /// `UiSystems::Layout` + `PostLayout` for the most recent applied batch.
    last_layout: Duration,
    /// The `applied_count` last recorded, to detect a fresh batch this frame.
    seen_applied: u64,
}

#[cfg_attr(target_arch = "wasm32", allow(unused_mut, unused_variables))]
fn mark_pre_layout(mut timers: ResMut<DevtoolsTimers>) {
    #[cfg(not(target_arch = "wasm32"))]
    {
        timers.pre_layout = Some(std::time::Instant::now());
    }
}

fn mark_post_layout(stats: Res<OpApplyStats>, mut timers: ResMut<DevtoolsTimers>) {
    // Only meaningful on frames that applied a batch (its commands flush + lay
    // out this same frame). Other frames leave the last values intact.
    if stats.applied_count == timers.seen_applied {
        return;
    }
    timers.seen_applied = stats.applied_count;
    #[cfg(not(target_arch = "wasm32"))]
    if let (Some(end), Some(pre)) = (stats.last_apply_end, timers.pre_layout) {
        let (command, layout) = split_legs(end, pre, std::time::Instant::now());
        timers.last_command = command;
        timers.last_layout = layout;
    }
}

/// Split "batch applied → layout done" into the command and layout legs.
/// Saturating: system-order jitter must clamp to zero, never panic.
#[cfg(not(target_arch = "wasm32"))]
fn split_legs(
    apply_end: std::time::Instant,
    pre_layout: std::time::Instant,
    post_layout: std::time::Instant,
) -> (Duration, Duration) {
    (
        pre_layout.saturating_duration_since(apply_end),
        post_layout.saturating_duration_since(pre_layout),
    )
}

/// Pick mode ("inspect" cursor): while active, the topmost app node under the
/// window cursor is hover-highlighted, and a left click selects it in the tree
/// (exiting pick mode). Uses the picking `HoverMap` — the established pattern
/// for UI hit-tests here (window-cursor `UiStack` walks can't see everything
/// picking can) — and resolves hits the way surface picking does: climb from the
/// topmost (min-depth) hit to the nearest `RNode` owner. Anything under the
/// panel's own `<root>` (reported by the JS panel as
/// [`DevtoolsState::panel_root`]) is rejected so the panel can never pick
/// itself; app `<root>` overlays are ordinary pick targets. Only the mouse
/// pointer is consulted: `<surface>` subtrees (in-world virtual pointer) are
/// out of pick mode's scope.
///
/// Known limitation (documented): the picking click still reaches the app's own
/// `onClick` handlers — Chrome suppresses the page click, we don't.
#[allow(clippy::too_many_arguments)]
fn drive_pick_mode(
    mut state: ResMut<DevtoolsState>,
    hover_map: Option<Res<HoverMap>>,
    mouse: Res<ButtonInput<MouseButton>>,
    capture: Option<ResMut<PointerCapture>>,
    bridge: Option<Res<JsBridge>>,
    rnodes: Query<&RNode>,
    child_of: Query<&ChildOf>,
    events: ReactEvents,
) {
    if !(state.open && state.pick) {
        return;
    }
    // Claim the pointer for the whole pick session so world input (camera
    // orbit/zoom) ignores the picking gestures.
    if let Some(mut capture) = capture {
        capture.over_ui = true;
    }

    // The panel's own root, resolved to its entity. `None` (not yet reported /
    // no bridge) rejects nothing — pick mode is only reachable from an open
    // panel, which reports its root on mount.
    let panel_entity = state
        .panel_root
        .and_then(|id| bridge.as_ref().and_then(|b| b.nodes.get(&id).copied()));

    let hovered = hover_map
        .as_deref()
        .and_then(|hover_map| hover_map.get(&PointerId::Mouse))
        .and_then(|hits| {
            // The Mouse hover map mixes backends: bevy_ui hits (stack-index
            // depth) AND mesh-picking hits (ray distance in world units — the
            // demos always have a 3D scene behind the UI). The scales aren't
            // comparable, and a mesh often wins a raw `min_by(depth)`, which
            // made picking look dead over the whole viewport. So: keep only
            // hits that resolve to a reconciled UI node (climb to an `RNode`
            // owner — this drops mesh hits but keeps panel nodes, so you still
            // can't pick app nodes THROUGH the panel), take the frontmost of
            // those, THEN apply the panel self-rejection.
            let (&top, _) = hits
                .iter()
                .filter(|&(&entity, _)| climb(entity, &child_of, |e| rnodes.contains(e)).is_some())
                .min_by(|a, b| a.1.depth.total_cmp(&b.1.depth))?;
            // The panel can't pick itself (its nodes live under its own root).
            if let Some(panel) = panel_entity
                && climb(top, &child_of, |e| e == panel).is_some()
            {
                return None;
            }
            let owner = climb(top, &child_of, |e| rnodes.contains(e))?;
            rnodes.get(owner).ok().map(|r| r.0)
        });
    state.pick_hover = hovered;

    if mouse.just_pressed(MouseButton::Left)
        && let Some(id) = hovered
    {
        state.pick = false;
        state.pick_hover = None;
        state.selected = Some(id);
        events.send(&DevtoolsPicked { id });
    }
}

/// Marks the single pre-spawned highlight overlay entity: the translucent box
/// drawn over the node the devtools is hovering/selecting (Chrome's blue box).
#[derive(Component)]
struct DevtoolsHighlightOverlay;

/// Spawn the (hidden) highlight overlay once. A detached window-root node so it
/// needs no parent; `GlobalZIndex(i32::MAX - 1)` floats it above the app but
/// below the devtools panel's `<root>` (`i32::MAX`), and `Pickable::IGNORE`
/// keeps it out of the `HoverMap` so pick mode can never pick the highlight box
/// hovering under the cursor.
fn spawn_highlight_overlay(mut commands: Commands) {
    commands.spawn((
        DevtoolsHighlightOverlay,
        Node {
            position_type: PositionType::Absolute,
            display: Display::None,
            ..default()
        },
        // Chrome-like translucent blue fill + hairline.
        BackgroundColor(Color::srgba(0.54, 0.71, 0.97, 0.30)),
        Outline {
            width: Val::Px(1.0),
            color: Color::srgba(0.54, 0.71, 0.97, 0.9),
            ..default()
        },
        GlobalZIndex(i32::MAX - 1),
        Pickable::IGNORE,
    ));
}

/// Move the highlight overlay over the current target each frame. Target
/// priority: pick-mode hover, then a hovered tree row, then the selection.
/// Rust-side on purpose: bounding boxes change every frame (layout, scroll,
/// animation), and this is one query with zero bridge traffic — a React-side
/// box would need per-frame geometry crossing the boundary.
fn position_highlight(
    state: Res<DevtoolsState>,
    // `Option`: `JsBridge` is only inserted at `Startup` (see `OutboundResource`),
    // and headless tests run this plugin without a JS runtime at all.
    bridge: Option<Res<JsBridge>>,
    targets: Query<(&ComputedNode, &UiGlobalTransform)>,
    mut overlay: Query<&mut Node, With<DevtoolsHighlightOverlay>>,
) {
    let Ok(mut node) = overlay.single_mut() else {
        return;
    };
    let Some(bridge) = bridge else {
        return;
    };
    let target = state
        .pick_hover
        .or(state.tree_hover)
        // The persistent selection box is gated by the panel's overlay toggle;
        // the momentary hover highlights above are always on.
        .or(state.selected.filter(|_| state.show_selection_overlay))
        .filter(|_| state.open);
    let rect = target
        .and_then(|id| bridge.nodes.get(&id))
        .and_then(|&e| targets.get(e).ok())
        .map(|(computed, transform)| {
            highlight_rect(
                computed.size,
                transform.translation,
                computed.inverse_scale_factor,
            )
        });
    // Write only on change: a `Node` mutation forces a bevy_ui relayout, so an
    // idle overlay must not dirty itself every frame.
    match rect {
        Some((pos, size)) => {
            let (left, top) = (Val::Px(pos.x), Val::Px(pos.y));
            let (width, height) = (Val::Px(size.x), Val::Px(size.y));
            if node.display != Display::Flex
                || node.left != left
                || node.top != top
                || node.width != width
                || node.height != height
            {
                node.display = Display::Flex;
                node.left = left;
                node.top = top;
                node.width = width;
                node.height = height;
            }
        }
        None => {
            if node.display != Display::None {
                node.display = Display::None;
            }
        }
    }
}

/// A node's window-space logical rect from its computed (physical) geometry:
/// `UiGlobalTransform.translation` is the node's physical center, so top-left =
/// center - size/2, all scaled to logical px by the inverse scale factor.
fn highlight_rect(physical_size: Vec2, physical_center: Vec2, inverse_scale: f32) -> (Vec2, Vec2) {
    let top_left = (physical_center - physical_size * 0.5) * inverse_scale;
    (top_left, physical_size * inverse_scale)
}

/// Push one `devtools.batchStats` per applied APP op batch while the panel is
/// open. Runs after `mark_post_layout`, so the command/layout legs for THIS
/// frame's batch are already split. Frames that applied nothing send nothing —
/// and neither do applies of the panel's OWN commits (`app_applied_count`
/// unchanged): stats for those would make the panel repaint, producing the
/// next batch, whose stats repaint it again… a self-observation loop at frame
/// rate. The per-batch origin flags ([`crate::reconcile::FlushFlags`]) are
/// what makes the distinction possible.
fn emit_batch_stats(
    state: Res<DevtoolsState>,
    stats: Res<OpApplyStats>,
    timers: Res<DevtoolsTimers>,
    events: ReactEvents,
    mut seen: Local<u64>,
) {
    if stats.app_applied_count == *seen {
        return;
    }
    *seen = stats.app_applied_count;
    if !state.open {
        return;
    }
    events.send(&DevtoolsBatchStats {
        applied_count: stats.applied_count,
        last_ops: stats.last_ops,
        pre_apply_ms: stats.last_pre_apply.as_secs_f64() * 1000.0,
        translate_ms: stats.last_translate.as_secs_f64() * 1000.0,
        command_ms: timers.last_command.as_secs_f64() * 1000.0,
        layout_ms: timers.last_layout.as_secs_f64() * 1000.0,
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bridge::{OutboundResource, RRoot};
    use crate::protocol::Outbound;
    use tokio::sync::mpsc::{UnboundedReceiver, unbounded_channel};

    /// Headless app with the toggle/auto-open systems and a drainable outbound
    /// channel (the same harness shape as `keyboard.rs`'s tests).
    fn test_app(plugin: DevtoolsPlugin) -> (App, UnboundedReceiver<Outbound>) {
        let mut app = App::new();
        app.add_plugins(MinimalPlugins);
        app.init_resource::<ButtonInput<KeyCode>>();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<OpApplyStats>();
        let (tx, rx) = unbounded_channel::<Outbound>();
        app.insert_resource(OutboundResource(tx));
        app.add_plugins(plugin);
        (app, rx)
    }

    fn drain_events(rx: &mut UnboundedReceiver<Outbound>) -> Vec<(String, serde_json::Value)> {
        let mut out = Vec::new();
        while let Ok(msg) = rx.try_recv() {
            if let Outbound::Event { name, value } = msg {
                out.push((name, value));
            }
        }
        out
    }

    #[test]
    fn toggle_key_flips_state_and_notifies_js() {
        let (mut app, mut rx) = test_app(DevtoolsPlugin::new().toggle_key(KeyCode::F9));
        app.update();
        assert!(drain_events(&mut rx).is_empty(), "no toggle before the key");

        app.world_mut()
            .resource_mut::<ButtonInput<KeyCode>>()
            .press(KeyCode::F9);
        app.update();
        let events = drain_events(&mut rx);
        assert_eq!(
            events
                .iter()
                .find(|(name, _)| name == "devtools.toggle")
                .map(|(_, v)| v["open"].as_bool()),
            Some(Some(true)),
            "the configured key must open the panel and notify JS"
        );
        assert!(app.world().resource::<DevtoolsState>().open);

        // Release + press again closes it.
        {
            let mut keys = app.world_mut().resource_mut::<ButtonInput<KeyCode>>();
            keys.clear_just_pressed(KeyCode::F9);
            keys.release(KeyCode::F9);
        }
        app.update();
        app.world_mut()
            .resource_mut::<ButtonInput<KeyCode>>()
            .press(KeyCode::F9);
        app.update();
        let events = drain_events(&mut rx);
        assert_eq!(
            events
                .iter()
                .find(|(name, _)| name == "devtools.toggle")
                .map(|(_, v)| v["open"].as_bool()),
            Some(Some(false)),
            "pressing again must close the panel"
        );
        assert!(!app.world().resource::<DevtoolsState>().open);
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
        let (mut app, mut rx) = test_app(DevtoolsPlugin::new().settings_path(&tmp.0));
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

    /// The JS editor validates against its own field table
    /// (`js/src/devtools/fields.ts`); assert it names every wire field of
    /// `protocol.rs`'s `with_style_fields!` table, so adding a `Style` field
    /// can't silently leave it un-editable in devtools. Matches the key either
    /// bare (`width:`) or quoted (`"width":`) — prettier decides which.
    /// camelCase wire names make the bare `name:` probe unambiguous (a missing
    /// `top` is never satisfied by `scrollTop:`).
    #[test]
    fn js_style_field_table_covers_every_style_field() {
        let fields_ts = include_str!("../../../js/src/devtools/fields.ts");
        macro_rules! check_fields {
            ($(($field:ident, $wire:literal, ($($group:tt)*), $overlay:ident)),* $(,)?) => {
                $(
                    assert!(
                        fields_ts.contains(concat!($wire, ":"))
                            || fields_ts.contains(concat!("\"", $wire, "\":")),
                        concat!(
                            "js/src/devtools/fields.ts is missing style field \"",
                            $wire,
                            "\" — add it to STYLE_FIELDS with a category"
                        )
                    );
                )*
            };
        }
        crate::protocol::with_style_fields!(check_fields);
    }

    /// Build a bare world with everything `drive_pick_mode` needs (pick mode
    /// active). Returns the world + the outbound receiver (for asserting
    /// `devtools.picked`). Tests spawn their entities, then set the hover map
    /// with [`set_mouse_hits`].
    fn pick_world(pressed: bool) -> (World, UnboundedReceiver<Outbound>) {
        let mut world = World::new();
        world.insert_resource(DevtoolsState {
            open: true,
            pick: true,
            ..Default::default()
        });
        let mut mouse = ButtonInput::<MouseButton>::default();
        if pressed {
            mouse.press(MouseButton::Left);
        }
        world.insert_resource(mouse);
        let (tx, rx) = unbounded_channel::<Outbound>();
        world.insert_resource(OutboundResource(tx));
        (world, rx)
    }

    /// Insert a `JsBridge` (channels kept alive, nothing reads them) mapping
    /// the given node ids to entities, and report `panel_root` to the state —
    /// the shape the JS panel produces via `devtools.panelRoot` on open.
    fn report_panel_root(world: &mut World, id: NodeId, panel_entity: Entity) {
        let (out_tx, out_rx) = unbounded_channel::<Outbound>();
        std::mem::forget(out_rx);
        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<crate::protocol::Op>>();
        std::mem::forget(ops_tx);
        let root = world.spawn_empty().id();
        let mut bridge = JsBridge::new(ops_rx, out_tx, root);
        bridge.nodes.insert(id, panel_entity);
        world.insert_resource(bridge);
        world.resource_mut::<DevtoolsState>().panel_root = Some(id);
    }

    /// Insert a Mouse `HoverMap` with the given `(entity, depth)` hits.
    fn set_mouse_hits(world: &mut World, hits: &[(Entity, f32)]) {
        use bevy::ecs::entity::EntityHashMap;
        use bevy::picking::backend::HitData;
        let mut hovered = EntityHashMap::default();
        for &(entity, depth) in hits {
            hovered.insert(entity, HitData::new(Entity::PLACEHOLDER, depth, None, None));
        }
        let mut hover_map = HoverMap::default();
        hover_map.insert(PointerId::Mouse, hovered);
        world.insert_resource(hover_map);
    }

    /// A mesh-picking hit (ray distance, numerically "closer") must not shadow
    /// UI hits: the frontmost hit that resolves to an `RNode` wins. Regression:
    /// a raw `min_by(depth)` over the mixed hover map let 3D scene meshes win
    /// everywhere, making pick mode look dead.
    #[test]
    fn pick_ignores_mesh_hits_and_takes_frontmost_ui_node() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, _rx) = pick_world(false);
        let mesh = world.spawn_empty().id(); // no RNode — a scene mesh
        let node = world.spawn(RNode(7)).id();
        let leaf = world.spawn(ChildOf(node)).id(); // e.g. its text run
        set_mouse_hits(&mut world, &[(mesh, 0.5), (leaf, 30.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        assert_eq!(
            world.resource::<DevtoolsState>().pick_hover,
            Some(7),
            "the frontmost RNode-resolving hit must win; mesh hits are ignored"
        );
    }

    /// The panel can't pick itself: a frontmost hit under the REPORTED panel
    /// root yields no hover (and no pick-through to app nodes beneath it).
    #[test]
    fn pick_rejects_panel_hits() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, _rx) = pick_world(false);
        let panel_root = world.spawn((RRoot, RNode(100))).id();
        let panel_button = world.spawn((RNode(101), ChildOf(panel_root))).id();
        let app_node = world.spawn(RNode(7)).id();
        report_panel_root(&mut world, 100, panel_root);
        set_mouse_hits(&mut world, &[(panel_button, 1.0), (app_node, 5.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        assert_eq!(
            world.resource::<DevtoolsState>().pick_hover,
            None,
            "a panel hit in front must block picking (no pick-through)"
        );
    }

    /// Nodes under an APP `<root>` overlay are ordinary pick targets — only
    /// the panel's own reported root is rejected. Regression: rejecting any
    /// `RRoot` ancestor made every app overlay unpickable.
    #[test]
    fn pick_allows_nodes_under_app_roots() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, _rx) = pick_world(false);
        let panel_root = world.spawn((RRoot, RNode(100))).id();
        let app_root = world.spawn((RRoot, RNode(50))).id();
        let overlay_node = world.spawn((RNode(7), ChildOf(app_root))).id();
        report_panel_root(&mut world, 100, panel_root);
        set_mouse_hits(&mut world, &[(overlay_node, 5.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        assert_eq!(
            world.resource::<DevtoolsState>().pick_hover,
            Some(7),
            "a node under an app <root> must be pickable"
        );
    }

    /// The panel behind an app node doesn't block it: rejection applies only
    /// when the frontmost RNode-resolving hit is the panel's.
    #[test]
    fn pick_prefers_frontmost_app_hit_over_panel_behind() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, _rx) = pick_world(false);
        let panel_root = world.spawn((RRoot, RNode(100))).id();
        let panel_button = world.spawn((RNode(101), ChildOf(panel_root))).id();
        let app_node = world.spawn(RNode(7)).id();
        report_panel_root(&mut world, 100, panel_root);
        set_mouse_hits(&mut world, &[(panel_button, 5.0), (app_node, 1.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        assert_eq!(
            world.resource::<DevtoolsState>().pick_hover,
            Some(7),
            "an app node in front of the panel must win"
        );
    }

    /// A left click on a hovered app node selects it, exits pick mode, and
    /// reports `devtools.picked` to JS.
    #[test]
    fn pick_click_selects_and_notifies_js() {
        use bevy::ecs::system::RunSystemOnce;

        let (mut world, mut rx) = pick_world(true);
        let app_node = world.spawn(RNode(7)).id();
        set_mouse_hits(&mut world, &[(app_node, 5.0)]);

        world.run_system_once(drive_pick_mode).unwrap();
        let state = world.resource::<DevtoolsState>();
        assert_eq!(state.selected, Some(7));
        assert!(!state.pick, "a successful pick exits pick mode");
        match rx.try_recv().expect("a devtools.picked event") {
            Outbound::Event { name, value } => {
                assert_eq!(name, "devtools.picked");
                assert_eq!(value["id"], 7);
            }
            other => panic!("expected Outbound::Event, got {other:?}"),
        }
    }

    /// An open panel with a dock side insets the app root's margin on that
    /// edge; flipping sides swaps the inset; closing releases it. No `Window`
    /// exists in the harness, so the width is unclamped.
    #[test]
    fn dock_reservation_insets_uiroot_margin() {
        let (mut app, _rx) = test_app(DevtoolsPlugin::new());
        let root = app
            .world_mut()
            .spawn((Node::default(), crate::plugin::UiRoot))
            .id();
        let margin = |app: &mut App| {
            let node = app.world().entity(root).get::<Node>().unwrap();
            (node.margin.left, node.margin.right)
        };

        {
            let mut state = app.world_mut().resource_mut::<DevtoolsState>();
            state.open = true;
            state.dock_side = Some(DockSide::Right);
            state.dock_width = 300.0;
        }
        app.update();
        assert_eq!(margin(&mut app), (Val::ZERO, Val::Px(300.0)));

        app.world_mut().resource_mut::<DevtoolsState>().dock_side = Some(DockSide::Left);
        app.update();
        assert_eq!(margin(&mut app), (Val::Px(300.0), Val::ZERO));

        // Any close path just flips `open`; the reservation releases for free.
        app.world_mut().resource_mut::<DevtoolsState>().open = false;
        app.update();
        assert_eq!(margin(&mut app), (Val::ZERO, Val::ZERO));
    }

    /// The `devtools.dock` message maps its loose wire shape onto the state:
    /// known sides parse, anything else (or `None`) clears the reservation,
    /// and a negative width clamps to zero.
    #[test]
    fn dock_message_parses_side_and_clamps_width() {
        let (mut app, _rx) = test_app(DevtoolsPlugin::new());
        let dock = |app: &mut App, side: Option<&str>, width: f32| {
            app.world_mut().trigger(DevtoolsDockMessage {
                side: side.map(String::from),
                width,
            });
            let state = app.world().resource::<DevtoolsState>();
            (state.dock_side, state.dock_width)
        };

        assert_eq!(
            dock(&mut app, Some("left"), 320.0),
            (Some(DockSide::Left), 320.0)
        );
        assert_eq!(
            dock(&mut app, Some("right"), 280.0),
            (Some(DockSide::Right), 280.0)
        );
        assert_eq!(dock(&mut app, Some("bogus"), -5.0), (None, 0.0));
        assert_eq!(dock(&mut app, None, 380.0), (None, 380.0));
    }

    /// Batch stats key off `app_applied_count`: an apply of the panel's own
    /// commits (only `applied_count` bumped) emits nothing, so the panel can't
    /// re-trigger itself; an app apply emits one event.
    #[test]
    fn batch_stats_skip_devtools_only_applies() {
        let (mut app, mut rx) = test_app(DevtoolsPlugin::new().no_settings_file());
        app.world_mut().resource_mut::<DevtoolsState>().open = true;
        let stats_events = |rx: &mut UnboundedReceiver<Outbound>| {
            drain_events(rx)
                .into_iter()
                .filter(|(name, _)| name == "devtools.batchStats")
                .count()
        };

        // A devtools-only apply: the panel's own repaint. No stats.
        {
            let mut stats = app.world_mut().resource_mut::<OpApplyStats>();
            stats.applied_count = 1;
            stats.app_applied_count = 0;
        }
        app.update();
        assert_eq!(
            stats_events(&mut rx),
            0,
            "the panel's own commits must not produce batch stats"
        );

        // An app apply: exactly one stats event.
        {
            let mut stats = app.world_mut().resource_mut::<OpApplyStats>();
            stats.applied_count = 2;
            stats.app_applied_count = 1;
        }
        app.update();
        assert_eq!(stats_events(&mut rx), 1, "an app apply reports once");
    }

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

    /// A pre-existing settings file seeds the Rust-side overlay toggle at
    /// build, and restores to JS exactly once — after the first applied batch.
    #[test]
    fn settings_file_seeds_overlay_and_restores_once() {
        let tmp = TempSettings::new("restore");
        std::fs::write(&tmp.0, serde_json::to_string(&sample_settings()).unwrap()).unwrap();
        let (mut app, mut rx) = test_app(DevtoolsPlugin::new().settings_path(&tmp.0));

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
        let (mut app, _rx) = test_app(DevtoolsPlugin::new().settings_path(&tmp.0));
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
        let (mut app, _rx) = test_app(DevtoolsPlugin::new().settings_path(&tmp.0));
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
        let (mut app, mut rx) = test_app(DevtoolsPlugin::new().settings_path(&tmp.0));
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

        let (mut app, _rx) = test_app(DevtoolsPlugin::new().no_settings_file());
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
        let (mut app, mut rx) = test_app(DevtoolsPlugin::new().no_settings_file());
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
        let (mut app, mut rx) = test_app(DevtoolsPlugin::new().settings_path(&tmp.0));
        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;
        app.update();
        let restores = drain_restores(&mut rx);
        assert_eq!(restores.len(), 1, "a legacy file must still restore");
        assert_eq!(restores[0]["mode"], "float");
        assert_eq!(restores[0]["overlay"], false);
        assert_eq!(restores[0]["split"], 200.0);
        assert_eq!(restores[0]["open"], false, "no persisted open → closed");
        let frac = restores[0]["width_frac"].as_f64().expect("a number");
        assert!(
            (frac - f64::from(DevtoolsSettings::default().width_frac)).abs() < 1e-6,
            "stale pixel width is ignored; the fraction takes its default"
        );
    }

    /// The window's logical size streams to the panel: once on open, again on
    /// every change while open, and re-sent after a close → reopen (a resize
    /// while closed must be caught up).
    #[test]
    fn window_size_sent_on_open_and_resize() {
        use bevy::window::WindowResolution;

        let (mut app, mut rx) = test_app(DevtoolsPlugin::new().no_settings_file());
        let window = app
            .world_mut()
            .spawn(Window {
                resolution: WindowResolution::new(800, 600),
                ..Default::default()
            })
            .id();
        let sizes = |rx: &mut UnboundedReceiver<Outbound>| {
            drain_events(rx)
                .into_iter()
                .filter(|(name, _)| name == "devtools.window")
                .map(|(_, v)| (v["width"].as_f64().unwrap(), v["height"].as_f64().unwrap()))
                .collect::<Vec<_>>()
        };

        // Closed: nothing, even after mount (send_restore fires one — drain it).
        app.world_mut().resource_mut::<OpApplyStats>().applied_count = 1;
        app.update();
        let restore_frame = sizes(&mut rx);
        assert_eq!(
            restore_frame,
            vec![(800.0, 600.0)],
            "the restore one-shot sends the size once, ahead of the blob"
        );

        // Open: one size event; idle frames send nothing more.
        app.world_mut().resource_mut::<DevtoolsState>().open = true;
        app.update();
        assert_eq!(sizes(&mut rx), vec![(800.0, 600.0)], "sent on open");
        app.update();
        assert!(sizes(&mut rx).is_empty(), "idle frames are silent");

        // Resize while open: exactly one update.
        app.world_mut()
            .entity_mut(window)
            .get_mut::<Window>()
            .unwrap()
            .resolution = WindowResolution::new(1024, 768);
        app.update();
        assert_eq!(sizes(&mut rx), vec![(1024.0, 768.0)], "sent on resize");

        // Resize while closed → reopen catches up.
        app.world_mut().resource_mut::<DevtoolsState>().open = false;
        app.update();
        app.world_mut()
            .entity_mut(window)
            .get_mut::<Window>()
            .unwrap()
            .resolution = WindowResolution::new(640, 480);
        app.update();
        assert!(sizes(&mut rx).is_empty(), "closed: no size traffic");
        app.world_mut().resource_mut::<DevtoolsState>().open = true;
        app.update();
        assert_eq!(
            sizes(&mut rx),
            vec![(640.0, 480.0)],
            "reopen must catch up on a resize that happened while closed"
        );
    }

    #[test]
    fn highlight_rect_converts_physical_center_to_logical_top_left() {
        // A 200×100 physical node centered at (300, 150) on a 2× display.
        let (pos, size) = highlight_rect(Vec2::new(200.0, 100.0), Vec2::new(300.0, 150.0), 0.5);
        assert_eq!(pos, Vec2::new(100.0, 50.0));
        assert_eq!(size, Vec2::new(100.0, 50.0));
    }

    #[test]
    fn split_legs_computes_command_and_layout() {
        let t0 = std::time::Instant::now();
        let t1 = t0 + Duration::from_millis(5);
        let t2 = t1 + Duration::from_millis(7);
        assert_eq!(
            split_legs(t0, t1, t2),
            (Duration::from_millis(5), Duration::from_millis(7))
        );
        // Out-of-order instants (system jitter) clamp to zero, never panic.
        assert_eq!(split_legs(t1, t0, t2), (Duration::ZERO, t2 - t0));
    }
}
