//! The active-scene state machine that React drives. Only one 3D scene runs at a
//! time; each scene's plugin (under `scenes/`) gates its systems on this state.

use bevy::prelude::*;
use bevy_react::{ReactAppExt, react_message};
use serde::Deserialize;
use ts_rs::TS;

/// Which 3D scene is live. Only one runs at a time so cubes and balls never
/// share the screen; each scene's plugin gates its systems on this state and tags
/// its entities with `DespawnOnExit(Scene::…)` so they vanish on switch. `None`
/// is the empty viewport React selects with `selectScene(null)`.
#[derive(States, Default, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Scene {
    #[default]
    None,
    Cubes,
    BouncingBall,
    CrowdedCubes,
}

/// The wire form of [`Scene`] — what React sends with `emit("selectScene", id)`.
/// A fieldless enum serializes as a plain string, so the generated TS is a
/// `"Cubes" | "BouncingBall" | "CrowdedCubes"` union. There is no `None`: a null on
/// the wire maps to [`Scene::None`].
#[derive(Deserialize, TS)]
pub enum SceneId {
    Cubes,
    BouncingBall,
    CrowdedCubes,
}

/// React picks the active scene from the left-nav: `emit("selectScene", id)`. A
/// `null` clears the viewport (no scene).
#[react_message(name = "selectScene")]
pub struct SelectScene(Option<SceneId>);

/// Register the global scene-selection handler (shared by the live app and the
/// `--export-bindings` exporter).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(apply_select_scene);
}

/// Switch the active scene when React emits a selection; `None` clears it.
fn apply_select_scene(on: On<SelectScene>, mut next: ResMut<NextState<Scene>>) {
    next.set(match on.event().0 {
        Some(SceneId::Cubes) => Scene::Cubes,
        Some(SceneId::BouncingBall) => Scene::BouncingBall,
        Some(SceneId::CrowdedCubes) => Scene::CrowdedCubes,
        None => Scene::None,
    });
}
