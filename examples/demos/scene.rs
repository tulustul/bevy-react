//! The active-scene state machine that React drives. Only one 3D scene runs at a
//! time; each scene's plugin (under `scenes/`) gates its systems on this state.
//!
//! A switch can **dip**: the old scene dissolves into the ambient backdrop (it
//! keeps running — its state is still active), the state flips under full
//! cover at the midpoint, and the new scene condenses back out. The timing is
//! whatever React passes — the page morph's own spec — so the scene and the
//! page sweep start, cross the middle, and land together.

use bevy::prelude::*;
use bevy_react::transition::{Channel, ChannelTransition};
use bevy_react::{ReactAppExt, react_message};
use serde::Deserialize;
use ts_rs::TS;

/// Which 3D scene is live — React picks it with `bevy.selectScene({ scene })`.
/// Only one runs at a time so cubes and balls never share the screen; each
/// scene's plugin gates its systems on this state and tags its entities with
/// `DespawnOnExit(Scene::…)` so they vanish on switch. `None` (the startup
/// state, and what `scene: null` selects) runs no scene: the permanent
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

/// React picks the active scene from the left-nav; `scene: null` selects none.
/// With a `transition` the switch dips through the backdrop on that timing;
/// without one it is instant (the first selection — nothing to dip from).
/// Selecting the scene already showing (or already on its way in) does
/// nothing: pages sharing a scene share its live world.
#[react_message(name = "selectScene")]
pub struct SelectScene {
    scene: Option<Scene>,
    #[ts(optional, type = "import(\"bevy-react\").BevyTransitionSpec")]
    transition: Option<ChannelTransition>,
}

pub struct ScenePlugin;

impl Plugin for ScenePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        // Needs DefaultPlugins (StatesPlugin) added first.
        app.init_state::<Scene>()
            .init_resource::<SceneDip>()
            // PreUpdate: a midpoint flip applies in this frame's
            // `StateTransition`, not the next.
            .add_systems(PreUpdate, drive_dip);
    }
}

/// Register the global scene-selection handler (shared by the live app and the
/// `--export-bindings` exporter).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(apply_select_scene);
}

/// The scene switch in flight, if any. `scenes::ambient` fades its overlay
/// with [`SceneDip::cover`].
#[derive(Resource, Default)]
pub struct SceneDip {
    /// How much of the 3D world the backdrop overlay hides, `0..=1`.
    pub cover: f32,
    /// The scene the switch ends on: React's last selection.
    target: Scene,
    /// The midpoint still has to flip the state to `target`.
    flip: bool,
    /// This flight swaps scenes (rise, flip, fall) rather than reversing back
    /// to the scene still showing (fall only).
    swap: bool,
    /// The cover the flight started from: an interrupted dip restarts there.
    from: f32,
    progress: Channel,
    spec: Option<ChannelTransition>,
}

impl SceneDip {
    /// Start a full-length flight to `to` from the current cover — the page
    /// morph's restart rule, so an interrupted switch still lands with it.
    fn restart(&mut self, showing: Scene, to: Scene, spec: ChannelTransition) {
        self.target = to;
        self.swap = to != showing;
        self.flip = self.swap;
        self.from = self.cover;
        self.progress.init(0.0);
        self.spec = Some(spec);
    }
}

/// Run condition: the active scene is dissolving out (it flips at the midpoint).
pub fn leaving(dip: Res<SceneDip>) -> bool {
    dip.flip
}

/// The overlay's cover at flight progress `p`: a swap rises `from → 1` over
/// the first half and falls `1 → 0` over the second; a reversal falls
/// `from → 0`. Clamped, since a spring overshoots `p`.
fn cover(from: f32, swap: bool, p: f32) -> f32 {
    let c = if !swap {
        from * (1.0 - p)
    } else if p < 0.5 {
        from + (1.0 - from) * 2.0 * p
    } else {
        2.0 - 2.0 * p
    };
    c.clamp(0.0, 1.0)
}

/// Switch the active scene when React emits a selection.
fn apply_select_scene(
    on: On<SelectScene>,
    state: Res<State<Scene>>,
    mut next: ResMut<NextState<Scene>>,
    mut dip: ResMut<SceneDip>,
) {
    let to = on.event().scene.unwrap_or_default();
    if to == dip.target {
        return;
    }
    // What shows once this frame's state transition runs.
    let showing = match &*next {
        NextState::Pending(s) | NextState::PendingIfNeq(s) => *s,
        NextState::Unchanged => *state.get(),
    };
    match &on.event().transition {
        Some(spec) => dip.restart(showing, to, spec.clone()),
        None => {
            *dip = SceneDip {
                target: to,
                ..default()
            };
            if to != showing {
                next.set(to);
            }
        }
    }
}

/// Advance the dip: flip the state at the midpoint, settle at the end.
fn drive_dip(time: Res<Time>, mut dip: ResMut<SceneDip>, mut next: ResMut<NextState<Scene>>) {
    // Idle: read only, so `resource_changed::<SceneDip>` stays quiet.
    let Some(spec) = dip.spec.clone() else {
        return;
    };
    let dip = &mut *dip;
    let p = dip.progress.drive(1.0, Some(&spec), time.delta_secs());
    if dip.flip && p >= 0.5 {
        next.set(dip.target);
        dip.flip = false;
    }
    dip.cover = cover(dip.from, dip.swap, p);
    if dip.progress.runner.is_none() {
        dip.cover = 0.0;
        dip.spec = None;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn app() -> App {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, bevy::state::app::StatesPlugin))
            .add_plugins(ScenePlugin);
        app.update();
        app
    }

    fn select(app: &mut App, scene: Scene, ms: Option<u32>) {
        let transition = ms.map(|ms| {
            serde_json::from_value(serde_json::json!({ "duration": ms, "easing": "linear" }))
                .unwrap()
        });
        app.world_mut().trigger(SelectScene {
            scene: Some(scene),
            transition,
        });
    }

    /// Step `ms` of virtual time in 10ms frames (virtual time clamps a
    /// longer frame).
    fn step(app: &mut App, ms: u64) {
        let dt = std::time::Duration::from_millis(10);
        app.insert_resource(bevy::time::TimeUpdateStrategy::ManualDuration(dt));
        for _ in 0..ms / 10 {
            app.update();
        }
    }

    fn state(app: &App) -> Scene {
        *app.world().resource::<State<Scene>>().get()
    }

    fn cover_now(app: &App) -> f32 {
        app.world().resource::<SceneDip>().cover
    }

    #[test]
    fn cover_curve() {
        assert_eq!(cover(0.0, true, 0.0), 0.0);
        assert_eq!(cover(0.0, true, 0.25), 0.5);
        assert_eq!(cover(0.0, true, 0.5), 1.0);
        assert_eq!(cover(0.0, true, 0.75), 0.5);
        assert_eq!(cover(0.0, true, 1.0), 0.0);
        // An interrupted swap rises from where it was.
        assert_eq!(cover(0.6, true, 0.25), 0.8);
        // A reversal only falls; a spring's overshoot clamps.
        assert_eq!(cover(0.6, false, 0.5), 0.3);
        assert_eq!(cover(0.0, true, 1.2), 0.0);
    }

    #[test]
    fn swap_flips_at_the_midpoint() {
        let mut app = app();
        select(&mut app, Scene::Cubes, Some(1000));
        step(&mut app, 400);
        assert_eq!(
            state(&app),
            Scene::None,
            "old scene runs until the midpoint"
        );
        assert!((cover_now(&app) - 0.8).abs() < 1e-3);
        step(&mut app, 200);
        assert_eq!(state(&app), Scene::Cubes, "flipped under full cover");
        step(&mut app, 500);
        assert_eq!(cover_now(&app), 0.0);
        assert!(app.world().resource::<SceneDip>().spec.is_none(), "settled");
    }

    #[test]
    fn instant_and_same_scene_selections() {
        let mut app = app();
        select(&mut app, Scene::Cubes, None);
        step(&mut app, 16);
        assert_eq!(state(&app), Scene::Cubes);
        // Reselecting the live scene (a same-scene page switch) arms nothing.
        select(&mut app, Scene::Cubes, Some(1000));
        step(&mut app, 16);
        assert!(app.world().resource::<SceneDip>().spec.is_none());
    }

    #[test]
    fn going_back_mid_dip_reverses_without_a_flip() {
        let mut app = app();
        select(&mut app, Scene::Cubes, Some(1000));
        step(&mut app, 250); // cover 0.5, still showing None
        select(&mut app, Scene::None, Some(1000));
        step(&mut app, 500);
        assert_eq!(state(&app), Scene::None);
        assert!((cover_now(&app) - 0.25).abs() < 1e-3, "falls from 0.5");
        step(&mut app, 600);
        assert_eq!(cover_now(&app), 0.0);
        assert_eq!(state(&app), Scene::None, "never flipped");
    }

    #[test]
    fn retarget_after_the_flip_dips_again() {
        let mut app = app();
        select(&mut app, Scene::Cubes, Some(1000));
        step(&mut app, 750); // flipped; cover falling at 0.5
        assert_eq!(state(&app), Scene::Cubes);
        select(&mut app, Scene::Surface, Some(1000));
        step(&mut app, 250);
        assert!((cover_now(&app) - 0.75).abs() < 1e-3, "rises from 0.5");
        assert_eq!(state(&app), Scene::Cubes);
        step(&mut app, 260); // past the midpoint (float steps land just shy of it)
        assert_eq!(state(&app), Scene::Surface);
    }
}
