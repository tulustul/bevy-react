//! Demo 4 — **Animations**. Reanimated-style animations declared in React and
//! orchestrated by a Bevy system. The React side creates shared values
//! (`useSharedValue`), assigns drivers (`withTiming`/`withSpring`/`withRepeat`/
//! `withSequence`), and binds them onto `Animated.node` style props; the bundled
//! `ReactUiAnimationsPlugin` ticks every value each frame — per-frame work never
//! crosses back to JS.
//!
//! The animation engine is global (added by `ReactUiPlugin`), so this demo plugin
//! has no animation wiring of its own. It just provides a small 3D backdrop —
//! scoped to `Demo::Animations` — so the gallery's orbiting camera still has
//! something to look at behind the React overlay.

use bevy::prelude::*;

use crate::shared::Demo;

pub struct AnimationsPlugin;

impl Plugin for AnimationsPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(OnEnter(Demo::Animations), spawn_backdrop)
            .add_systems(Update, spin_backdrop.run_if(in_state(Demo::Animations)));
    }
}

/// The slowly tumbling cube behind the demo's UI.
#[derive(Component)]
struct Backdrop;

fn spawn_backdrop(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    commands.spawn((
        Mesh3d(meshes.add(Cuboid::new(2.4, 2.4, 2.4))),
        MeshMaterial3d(materials.add(StandardMaterial {
            base_color: Color::srgb(0.73, 0.55, 0.93),
            ..default()
        })),
        Transform::from_xyz(0.0, 0.0, 0.0),
        Backdrop,
        DespawnOnExit(Demo::Animations),
    ));
}

fn spin_backdrop(time: Res<Time>, mut query: Query<&mut Transform, With<Backdrop>>) {
    let dt = time.delta_secs();
    for mut transform in &mut query {
        transform.rotate_x(0.4 * dt);
        transform.rotate_y(0.7 * dt);
    }
}
