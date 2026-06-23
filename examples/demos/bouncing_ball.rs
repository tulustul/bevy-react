//! **Bouncing ball** scene — one ball bounces inside a glass cube, shared by two
//! demos that exercise opposite directions of the bridge:
//!
//!   * **Bevy → React events**: every wall hit sends a `bevyEventsDemo.ballBounced`
//!     event to React, which pops a transient toast (`ReactEvents::send`).
//!   * **React ↔ Bevy request/response**: React polls `bevy.pollingDemo.getBall()`
//!     and shows the ball's live position/velocity (`On<Request<T>>` + `req.respond`).
//!
//! Both nav items select the same `Scene::BouncingBall`, so this one plugin owns
//! the scene and registers both bindings.

use bevy::prelude::*;
use bevy_react::{ReactAppExt, ReactEvents, Request, react_event, react_request};
use serde::Serialize;
use ts_rs::TS;

use crate::shared::{self, Scene, Velocity, Wall};

pub struct BouncingBallPlugin;

impl Plugin for BouncingBallPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_systems(OnEnter(Scene::BouncingBall), spawn_ball)
            .add_systems(Update, bounce.run_if(in_state(Scene::BouncingBall)));
    }
}

/// Register this scene's React bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    // Bevy -> React event: `bevy.on("bevyEventsDemo.ballBounced", …)`.
    app.add_react_event::<BallBounced>();
    // React -> Bevy request: `await bevy.pollingDemo.getBall()` → typed `BallState`.
    app.add_react_request_handler(report_ball);
}

/// Bevy tells React the ball hit a wall: `bevy.on("bevyEventsDemo.ballBounced", …)`.
#[react_event(name = "bevyEventsDemo.ballBounced")]
struct BallBounced {
    /// Which wall it hit.
    wall: Wall,
    /// Impact speed (world units/sec), for flavor in the toast.
    speed: f32,
}

/// React asks for the ball's current state: `await bevy.pollingDemo.getBall()`. A
/// unit payload, so the generated proxy method takes no argument.
#[react_request(name = "pollingDemo.getBall", response = BallState)]
struct GetBall;

/// The reply to [`GetBall`] — the ball's position and velocity in world units.
#[derive(Serialize, TS)]
struct BallState {
    x: f32,
    y: f32,
    vx: f32,
    vy: f32,
}

/// Spawn the bouncing ball when the scene becomes active.
fn spawn_ball(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    shared::spawn_ball(
        &mut commands,
        &mut meshes,
        &mut materials,
        Scene::BouncingBall,
    );
}

/// Advance the ball and, on each wall hit, send a `bevyEventsDemo.ballBounced`
/// event to React.
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

/// Answer `bevy.pollingDemo.getBall()` with the ball's live state. If the scene
/// isn't active there's no ball, so reject rather than leave the React promise hanging.
fn report_ball(req: On<Request<GetBall>>, balls: Query<(&Transform, &Velocity)>) {
    match balls.single() {
        Ok((transform, velocity)) => req.respond(BallState {
            x: transform.translation.x,
            y: transform.translation.y,
            vx: velocity.0.x,
            vy: velocity.0.y,
        }),
        Err(_) => req.respond_err("ball not active"),
    }
}
