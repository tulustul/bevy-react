//! The active-scene state machine that React drives. Only one 3D scene runs at a
//! time; each scene's plugin (under `scenes/`) gates its systems on this state.

use bevy::prelude::*;
use bevy_react::{ReactAppExt, react_message};
use serde::Deserialize;
use ts_rs::TS;

/// Which 3D scene is live — React picks it with `emit("selectScene", id)`.
/// Only one runs at a time so cubes and balls never share the screen; each
/// scene's plugin gates its systems on this state and tags its entities with
/// `DespawnOnExit(Scene::…)` so they vanish on switch. `None` (the startup
/// state, and what `selectScene(null)` selects) runs no scene: the permanent
/// studio backdrop (`scenes::ambient`) shows alone. A fieldless enum
/// serializes as a plain string, so the generated TS is a `"None" | "Cubes" |
/// …` union.
#[derive(States, Default, Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, TS)]
#[ts(rename = "SceneId")]
pub enum Scene {
    #[default]
    None,
    Cubes,
    BouncingBall,
    CrowdedCubes,
    SpaceCubes,
    Surface,
    NamedNodes,
}

/// React picks the active scene from the left-nav; `null` selects none.
#[react_message(name = "selectScene")]
pub struct SelectScene(Option<Scene>);

/// Register the global scene-selection handler (shared by the live app and the
/// `--export-bindings` exporter).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(apply_select_scene);
}

/// Switch the active scene when React emits a selection.
fn apply_select_scene(on: On<SelectScene>, mut next: ResMut<NextState<Scene>>) {
    next.set(on.event().0.unwrap_or_default());
}
