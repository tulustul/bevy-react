//! Demo 2 — **Events**. A ball bounces around inside the walls; every time it
//! hits one, Bevy pushes a `ball.bounced` event to React, which pops a transient
//! toast. Shows the Bevy → React event direction (`ReactEvents::send`).

use bevy::prelude::*;
use bevy_react::{ReactAppExt, ReactEvents, react_event};

use crate::shared::{self, Demo, Velocity, Wall};

pub struct EventsPlugin;

impl Plugin for EventsPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_systems(OnEnter(Demo::Events), spawn_ball)
            .add_systems(Update, bounce.run_if(in_state(Demo::Events)));
    }
}

/// Register this demo's React bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    // Bevy -> React event: `bevy.on("ball.bounced", …)`.
    app.add_react_event::<BallBounced>();
}

/// Bevy tells React the ball hit a wall: `bevy.on("ball.bounced", …)`.
#[react_event(name = "ball.bounced")]
struct BallBounced {
    /// Which wall it hit.
    wall: Wall,
    /// Impact speed (world units/sec), for flavor in the toast.
    speed: f32,
}

/// Spawn the bouncing ball when the demo becomes active.
fn spawn_ball(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    shared::spawn_ball(&mut commands, &mut meshes, &mut materials, Demo::Events);
}

/// Advance the ball and, on each wall hit, send a `ball.bounced` event to React.
fn bounce(time: Res<Time>, mut balls: Query<(&mut Transform, &mut Velocity)>, events: ReactEvents) {
    let dt = time.delta_secs();
    for (mut transform, mut velocity) in &mut balls {
        if let Some(wall) = shared::step_ball(&mut transform, &mut velocity, dt) {
            events.send(&BallBounced {
                wall,
                speed: velocity.0.length(),
            });
        }
    }
}
