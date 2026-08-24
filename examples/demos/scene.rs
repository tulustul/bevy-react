//! The active-scene state machine that React drives. Only one 3D scene runs at a
//! time; each scene's plugin (under `scenes/`) gates its systems on this state.

use bevy::prelude::*;
use bevy_react::{ReactAppExt, react_message};
use serde::Deserialize;
use ts_rs::TS;

/// Which 3D scene is live. Only one runs at a time so cubes and balls never
/// share the screen; each scene's plugin gates its systems on this state and tags
/// its entities with `DespawnOnExit(Scene::…)` so they vanish on switch. `None`
/// is only the pre-React startup state: once React mounts, `selectScene(null)`
/// lands on `Ambient` (the default animated-gradient backdrop), so demos without a scene
/// of their own still have something alive behind them.
#[derive(States, Default, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Scene {
    #[default]
    None,
    Ambient,
    Cubes,
    BouncingBall,
    CrowdedCubes,
    SpaceCubes,
    Surface,
    NamedNodes,
}

/// The wire form of [`Scene`] — what React sends with `emit("selectScene", id)`.
/// A fieldless enum serializes as a plain string, so the generated TS is a
/// `"Ambient" | "Cubes" | …` union. There is no `None`: a null on the wire maps
/// to [`Scene::Ambient`], the default backdrop.
#[derive(Deserialize, TS)]
pub enum SceneId {
    Ambient,
    Cubes,
    BouncingBall,
    CrowdedCubes,
    SpaceCubes,
    Surface,
    NamedNodes,
}

/// React picks the active scene from the left-nav: `emit("selectScene", id)`. A
/// `null` selects the default ambient backdrop.
#[react_message(name = "selectScene")]
pub struct SelectScene(Option<SceneId>);

/// Register the global scene-selection handler (shared by the live app and the
/// `--export-bindings` exporter).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(apply_select_scene);
}

/// Switch the active scene when React emits a selection; `None` falls back to
/// the ambient backdrop.
fn apply_select_scene(on: On<SelectScene>, mut next: ResMut<NextState<Scene>>) {
    next.set(match on.event().0 {
        Some(SceneId::Ambient) => Scene::Ambient,
        Some(SceneId::Cubes) => Scene::Cubes,
        Some(SceneId::BouncingBall) => Scene::BouncingBall,
        Some(SceneId::CrowdedCubes) => Scene::CrowdedCubes,
        Some(SceneId::SpaceCubes) => Scene::SpaceCubes,
        Some(SceneId::Surface) => Scene::Surface,
        Some(SceneId::NamedNodes) => Scene::NamedNodes,
        None => Scene::Ambient,
    });
}
