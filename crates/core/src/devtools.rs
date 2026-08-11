//! The devtools inspector: a React panel (shipped inside the
//! bevy-react JS runtime, rendered into a detached `<root>` overlay) backed by
//! this Bevy-side plugin. The panel gives a live nodes explorer, two-way node
//! selection (tree → on-screen highlight, screen → tree pick mode), transient
//! inline prop/style editing, stats + render timings, and a bridge-message log.
//!
//! [`DevtoolsPlugin`] is crate-internal: [`ReactUiPlugin`](crate::ReactUiPlugin)
//! auto-registers it, and consumers configure it through
//! [`ReactUiPlugin::devtools`](crate::ReactUiPlugin::devtools), which takes a
//! [`DevtoolsConfig`] (every field defaulted, including `enabled`).
//!
//! The module only exists behind the `devtools` cargo feature (a default
//! feature — release builds compile it out with `default-features = false`),
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
//!   while it is open; the panel's layout is proportional, so JS needs it),
//!   `devtools.layers { layers }` (the current layer set — the implicit base
//!   layer plus every [`crate::layer::LayersRegistry`] row; streamed only
//!   while the panel's Layers tab is active and diffed against the last
//!   payload, so an idle app sends nothing),
//!   `devtools.console { entries }` (the [`crate::console_log`] ring — JS
//!   console output, diag messages, JS-runtime failures; the full backlog
//!   when the Console tab opens, then increments while it stays open).
//! - JS → Bevy messages: `devtools.open { open }`, `devtools.pick { on }`,
//!   `devtools.select { id }`, `devtools.highlight { id }`,
//!   `devtools.overlay { on }`, `devtools.panelRoot { id }`,
//!   `devtools.layersOpen { on }` (the Layers tab was shown/hidden — gates
//!   the layer stream), `devtools.consoleOpen { on }` (likewise for the
//!   console stream), `devtools.consoleClear {}` (empty the console ring),
//!   `devtools.dock { side, width }` (the panel's space reservation — see
//!   [`apply_dock_reservation`]), `devtools.settings { … }` (the persisted
//!   layout blob — see [`settings::DevtoolsSettings`]).
//! - Settings persistence: layout settings — including whether the panel was
//!   open, so it reopens where you left it — round-trip through a JSON file
//!   (default `.bevy-react-devtools.json` in the working directory —
//!   [`DevtoolsConfig::settings_path`]).
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
//!
//! [`OpApplyStats`]: crate::reconcile::OpApplyStats

use bevy::prelude::*;
use bevy::ui::UiSystems;

use crate::message::ReactAppExt;
use crate::protocol::NodeId;

mod console;
#[cfg(test)]
mod js_tables;
mod layers;
mod panel;
mod pick;
mod settings;
mod stats;
#[cfg(test)]
mod test_util;

use console::{
    emit_console, emit_runtime_warnings, on_console_clear_message, on_console_open_message,
};
use layers::{emit_layers, on_layers_open_message};
use panel::{
    apply_dock_reservation, on_dock_message, on_open_message, on_overlay_message,
    on_panel_root_message, send_window_size, toggle_on_key,
};
use pick::{
    drive_pick_mode, on_highlight_message, on_pick_message, on_select_message, position_highlight,
    spawn_highlight_overlay,
};
use settings::{
    DevtoolsPersistence, flush_settings_on_exit, load_settings, on_settings_message, save_settings,
    send_restore,
};
use stats::{DevtoolsTimers, emit_batch_stats, mark_post_layout, mark_pre_layout};

/// Devtools configuration, passed to
/// [`ReactUiPlugin::devtools`](crate::ReactUiPlugin::devtools). Every field
/// has a default (`DevtoolsConfig::default()` is exactly what an app gets
/// without calling `.devtools(...)` at all), so construct it with
/// struct-update syntax:
///
/// ```no_run
/// # use bevy::prelude::*;
/// # use bevy_react::{DevtoolsConfig, ReactUiPlugin};
/// # let mut app = App::new();
/// app.add_plugins(ReactUiPlugin::new("ui/dist/app.js").devtools(DevtoolsConfig {
///     settings_path: Some(".config/devtools.json".into()),
///     ..default()
/// }));
/// ```
///
/// Also a resource, so the toggle/persistence systems can read it.
#[derive(Resource, Clone)]
pub struct DevtoolsConfig {
    /// Whether the devtools are available at all. Default: `true` (dev builds
    /// only either way — release builds never run them).
    pub enabled: bool,
    /// The key that toggles the panel. Default: `F12`.
    pub toggle_key: KeyCode,
    /// Where the panel's layout settings (dock mode/width, float rect, the
    /// reserve and overlay toggles, tree/inspector split, whether the panel
    /// is open) persist across runs; `None` disables persistence. Default:
    /// `.bevy-react-devtools.json` in the working directory. Native only —
    /// on web the file is neither read nor written.
    pub settings_path: Option<std::path::PathBuf>,
}

impl Default for DevtoolsConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            toggle_key: KeyCode::F12,
            settings_path: Some(std::path::PathBuf::from(".bevy-react-devtools.json")),
        }
    }
}

/// The Bevy side of the devtools inspector. See the [module docs](self).
///
/// Crate-internal: [`ReactUiPlugin`](crate::ReactUiPlugin) auto-registers it,
/// built from the consumer's [`DevtoolsConfig`].
pub struct DevtoolsPlugin {
    config: DevtoolsConfig,
}

impl DevtoolsPlugin {
    pub fn new(config: DevtoolsConfig) -> Self {
        Self { config }
    }
}

impl Plugin for DevtoolsPlugin {
    fn build(&self, app: &mut App) {
        // "Dev build only": the feature is a default feature, so this is the
        // expected path for every consumer `--release` build — the plugin
        // registers nothing. `debug!`, not `warn!`: release logs stay clean.
        if !cfg!(debug_assertions) {
            debug!("DevtoolsPlugin is inert in release builds");
            return;
        }
        // The toggle/pick systems read `ButtonInput` resources; a headless app
        // without `InputPlugin` (wiring-only tests) must not panic on them.
        app.init_resource::<ButtonInput<KeyCode>>();
        app.init_resource::<ButtonInput<MouseButton>>();
        // `emit_layers` reads the layer registries; idempotent in the full app
        // (`plugin.rs` inits them too), load-bearing for headless harnesses
        // that build this plugin without `ReactUiPlugin`.
        app.init_resource::<crate::layer::LayersRegistry>();
        app.init_resource::<crate::layer::LayerMembership>();
        // Start collecting apply-time invalid-value warnings (see
        // `crate::diag`): armed for the app's whole lifetime, panel open or
        // not, so warnings from the initial mount are waiting when it opens.
        crate::diag::arm_runtime();
        // Load persisted panel settings (native only; errors — missing file,
        // corrupt JSON — mean fresh defaults). The overlay toggle seeds the
        // Rust-side state immediately so highlight gating is correct before
        // the JS panel wakes; the rest restores to JS via `send_restore`.
        let loaded = load_settings(self.config.settings_path.as_deref());
        app.insert_resource(DevtoolsState {
            show_selection_overlay: loaded.as_ref().is_none_or(|s| s.overlay),
            ..Default::default()
        })
        .insert_resource(DevtoolsPersistence::from_loaded(loaded))
        .init_resource::<DevtoolsTimers>()
        .insert_resource(self.config.clone())
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
        .add_react_handler(on_layers_open_message)
        .add_react_handler(on_console_open_message)
        .add_react_handler(on_console_clear_message)
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
                // Entries produced later the same frame (e.g. hover restyles)
                // simply drain next frame — ordering is deliberately loose.
                emit_runtime_warnings,
                // Same loose ordering: console-ring entries pushed later this
                // frame drain next frame.
                emit_console,
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
                // After the layer geometry sync so the rects are this
                // frame's; a no-op ordering in harnesses that don't schedule
                // that system.
                emit_layers
                    .after(crate::layer::sync_layer_geometry)
                    // Cache stats (`repaints`/`cached`) are stamped by the
                    // repaint resolver.
                    .after(crate::layer::resolve_layer_repaints),
            ),
        );
    }
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
    /// Whether the panel's Layers tab is currently shown (reported via
    /// `devtools.layersOpen`). Gates the `devtools.layers` stream.
    pub layers_tab_open: bool,
    /// Whether the panel's Console tab is currently shown (reported via
    /// `devtools.consoleOpen`). Gates the `devtools.console` stream.
    pub console_tab_open: bool,
    /// The console stream watermark: the highest [`crate::console_log`] seq
    /// already sent. `None` = send the full backlog next frame. Lives in the
    /// resource (not a `Local`) so the `consoleOpen` handler can reset it on
    /// every flip — a same-frame close→open must never skip the backlog.
    pub console_last_seq: Option<u64>,
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
            layers_tab_open: false,
            console_tab_open: false,
            console_last_seq: None,
        }
    }
}
