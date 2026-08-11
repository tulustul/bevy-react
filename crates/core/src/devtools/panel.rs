//! Panel chrome lifecycle: the toggle key, JS↔Bevy open/close sync, the
//! viewport-size stream, and the docked panel's window-space reservation.

use bevy::prelude::*;
use bevy::ui::IsDefaultUiCamera;

use crate::event::ReactEvents;
use crate::protocol::NodeId;
use crate::reconcile::OpApplyStats;
use crate::window::ui_viewport_size;
use crate::{react_event, react_message};

use super::{DevtoolsConfig, DevtoolsState, DockSide};

/// Bevy → JS: the panel's open state changed Bevy-side (toggle key / auto-open).
/// Carries the resulting state (not a bare "flip") so the panel mirrors Bevy
/// instead of tracking parity.
#[react_event(name = "devtools.toggle")]
pub(super) struct DevtoolsToggle {
    pub(super) open: bool,
}

/// Bevy → JS: the UI viewport's logical size. The panel's layout is
/// proportional (fractions of the viewport), and JS can't see it on its own —
/// sent once when the panel opens and on every size change while it stays open
/// (see [`send_window_size`]; [`super::settings::send_restore`] also sends it
/// ahead of the restore blob so the restored fractions resolve against a real
/// size).
#[react_event(name = "devtools.window")]
pub(super) struct DevtoolsWindow {
    pub(super) width: f32,
    pub(super) height: f32,
}

/// JS → Bevy: the panel opened or closed itself (close button, install sync).
#[react_message(name = "devtools.open")]
pub(super) struct DevtoolsOpenMessage {
    pub(super) open: bool,
}

/// JS → Bevy: the panel's "overlay" toggle — show/hide the persistent
/// selected-node box.
#[react_message(name = "devtools.overlay")]
pub(super) struct DevtoolsOverlayMessage {
    on: bool,
}

/// JS → Bevy: the panel's own `<root>` node id (`None` when the panel closes).
/// Sent on open so [`super::pick::drive_pick_mode`] can reject exactly the
/// panel.
#[react_message(name = "devtools.panelRoot")]
pub(super) struct DevtoolsPanelRootMessage {
    id: Option<NodeId>,
}

/// JS → Bevy: the panel's effective space reservation. `side: None` = no
/// reservation (the reserve toggle is off, the panel floats, or it closed);
/// otherwise the app UI is pushed off that edge by `width` logical pixels
/// (see [`apply_dock_reservation`]).
#[react_message(name = "devtools.dock")]
pub(super) struct DevtoolsDockMessage {
    side: Option<String>,
    width: f32,
}

pub(super) fn on_open_message(msg: On<DevtoolsOpenMessage>, mut state: ResMut<DevtoolsState>) {
    state.open = msg.event().open;
    if !state.open {
        exit_interactions(&mut state);
    }
}

pub(super) fn on_overlay_message(
    msg: On<DevtoolsOverlayMessage>,
    mut state: ResMut<DevtoolsState>,
) {
    state.show_selection_overlay = msg.event().on;
}

pub(super) fn on_panel_root_message(
    msg: On<DevtoolsPanelRootMessage>,
    mut state: ResMut<DevtoolsState>,
) {
    state.panel_root = msg.event().id;
}

pub(super) fn on_dock_message(msg: On<DevtoolsDockMessage>, mut state: ResMut<DevtoolsState>) {
    state.dock_side = match msg.event().side.as_deref() {
        Some("left") => Some(DockSide::Left),
        Some("right") => Some(DockSide::Right),
        _ => None,
    };
    state.dock_width = msg.event().width.max(0.0);
}

/// Stream the UI viewport's logical size to the panel: once when it opens and
/// on every change while it stays open (the `Local` resets while closed, so a
/// resize-while-closed is caught up on the next open). The panel's layout is
/// proportional, and JS has no other way to see the viewport.
pub(super) fn send_window_size(
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

/// Clear the transient interaction state that shouldn't outlive a closed panel.
fn exit_interactions(state: &mut DevtoolsState) {
    state.pick = false;
    state.tree_hover = None;
    state.pick_hover = None;
    // Belt-and-braces: the JS panel also reports `layersOpen: false` /
    // `consoleOpen: false` when those tabs unmount, but every close path must
    // kill the streams even if the message is lost.
    state.layers_tab_open = false;
    state.console_tab_open = false;
    state.console_last_seq = None;
}

/// Flip the panel on the configured key and tell the JS panel the new state.
pub(super) fn toggle_on_key(
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
/// (the panel pushes the app aside rather than overlapping it), and release it
/// whenever the reservation ends. Gated
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
///
/// [`UiRoot`]: crate::plugin::UiRoot
pub(super) fn apply_dock_reservation(
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::devtools::test_util::{drain_events, test_app};
    use crate::protocol::outbound::Outbound;
    use tokio::sync::mpsc::UnboundedReceiver;

    #[test]
    fn toggle_key_flips_state_and_notifies_js() {
        let (mut app, mut rx) = test_app(DevtoolsConfig {
            toggle_key: KeyCode::F9,
            ..default()
        });
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

    /// An open panel with a dock side insets the app root's margin on that
    /// edge; flipping sides swaps the inset; closing releases it. No `Window`
    /// exists in the harness, so the width is unclamped.
    #[test]
    fn dock_reservation_insets_uiroot_margin() {
        let (mut app, _rx) = test_app(DevtoolsConfig::default());
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
        let (mut app, _rx) = test_app(DevtoolsConfig::default());
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

    /// The window's logical size streams to the panel: once on open, again on
    /// every change while open, and re-sent after a close → reopen (a resize
    /// while closed must be caught up).
    #[test]
    fn window_size_sent_on_open_and_resize() {
        use bevy::window::WindowResolution;

        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
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
}
