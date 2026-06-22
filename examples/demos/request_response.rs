//! Demo 3 — **Request/Response**. A ball bounces around again, but here React
//! continuously polls Bevy for the ball's position and velocity
//! (`await bevy.ball.get()`) and displays them live. Shows the correlated
//! request/response direction (`On<Request<T>>` + `req.respond`).

use bevy::prelude::*;
use bevy_react::{ReactAppExt, Request, react_request};
use serde::Serialize;
use ts_rs::TS;

use crate::shared::{self, Demo, Velocity};

pub struct RequestResponsePlugin;

impl Plugin for RequestResponsePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_systems(OnEnter(Demo::RequestResponse), spawn_ball)
            .add_systems(Update, bounce.run_if(in_state(Demo::RequestResponse)));
    }
}

/// Register this demo's React bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    // React -> Bevy request: `await bevy.ball.get()` → typed `BallState`.
    app.add_react_request_handler(report_ball);
}

/// React asks for the ball's current state: `await bevy.ball.get()`. A unit
/// payload, so the generated proxy method takes no argument.
#[react_request(name = "ball.get", response = BallState)]
struct BallGet;

/// The reply to [`BallGet`] — the ball's position and velocity in world units.
#[derive(Serialize, TS)]
struct BallState {
    x: f32,
    y: f32,
    vx: f32,
    vy: f32,
}

/// Marks the ball React polls, so the request handler queries unambiguously.
#[derive(Component)]
struct PolledBall;

/// Spawn the polled ball when the demo becomes active.
fn spawn_ball(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    let ball = shared::spawn_ball(
        &mut commands,
        &mut meshes,
        &mut materials,
        Demo::RequestResponse,
    );
    commands.entity(ball).insert(PolledBall);
}

/// Advance the polled ball (no event on bounce — React reads it on demand).
fn bounce(time: Res<Time>, mut balls: Query<(&mut Transform, &mut Velocity), With<PolledBall>>) {
    let dt = time.delta_secs();
    for (mut transform, mut velocity) in &mut balls {
        shared::step_ball(&mut transform, &mut velocity, dt);
    }
}

/// Answer `bevy.ball.get()` with the ball's live state. If the demo isn't active
/// there's no ball, so reject rather than leave the React promise hanging.
fn report_ball(req: On<Request<BallGet>>, balls: Query<(&Transform, &Velocity), With<PolledBall>>) {
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
