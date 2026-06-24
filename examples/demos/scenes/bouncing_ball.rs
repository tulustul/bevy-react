use bevy::prelude::*;
use bevy_react::{ReactAppExt, ReactEvents, Request, react_event, react_request};
use serde::Serialize;
use ts_rs::TS;

use crate::scene::Scene;

pub struct BouncingBallScenePlugin;

impl Plugin for BouncingBallScenePlugin {
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

// --- Ball physics ---

/// Half-extent of the cubic play area, in world units. The ball bounces inside a
/// cube of side `2 * PLAY_HALF` centered on the origin, in all three dimensions,
/// so it can hit any of the six faces.
const PLAY_HALF: f32 = 3.0;
/// Ball radius, used both for the mesh and to keep it inside the walls.
const BALL_RADIUS: f32 = 0.3;

/// A ball's velocity in world units per second (3D — it bounces off every face).
#[derive(Component)]
struct Velocity(Vec3);

/// Which wall the ball just bounced off; forwarded to React as part of
/// `bevyEventsDemo.ballBounced`.
#[derive(Serialize, TS, Clone, Copy, Debug)]
enum Wall {
    Left,
    Right,
    Top,
    Bottom,
    Front,
    Back,
}

/// Advance a ball by `dt`, reflecting it off the walls. Returns the wall it hit
/// this frame, if any (so the caller can react to the bounce).
fn step_ball(transform: &mut Transform, velocity: &mut Velocity, dt: f32) -> Option<Wall> {
    transform.translation += velocity.0 * dt;

    let max = PLAY_HALF - BALL_RADIUS;
    let mut wall = None;

    if transform.translation.x > max {
        transform.translation.x = max;
        velocity.0.x = -velocity.0.x.abs();
        wall = Some(Wall::Right);
    } else if transform.translation.x < -max {
        transform.translation.x = -max;
        velocity.0.x = velocity.0.x.abs();
        wall = Some(Wall::Left);
    }

    if transform.translation.y > max {
        transform.translation.y = max;
        velocity.0.y = -velocity.0.y.abs();
        wall = Some(Wall::Top);
    } else if transform.translation.y < -max {
        transform.translation.y = -max;
        velocity.0.y = velocity.0.y.abs();
        wall = Some(Wall::Bottom);
    }

    if transform.translation.z > max {
        transform.translation.z = max;
        velocity.0.z = -velocity.0.z.abs();
        wall = Some(Wall::Front);
    } else if transform.translation.z < -max {
        transform.translation.z = -max;
        velocity.0.z = velocity.0.z.abs();
        wall = Some(Wall::Back);
    }

    wall
}

// --- Bridge bindings ---

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

/// Spawn a ball moving diagonally inside a translucent cube that shows the walls it
/// bounces off, when the scene becomes active. Both are scoped to
/// `Scene::BouncingBall` so they despawn when the scene is left.
fn spawn_ball(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    // The translucent enclosure: a glass cube around the play area. All faces are
    // drawn (no culling) so the box reads as a 3D volume from any angle.
    let side = 2.0 * PLAY_HALF;
    commands.spawn((
        Mesh3d(meshes.add(Cuboid::new(side, side, side))),
        MeshMaterial3d(materials.add(StandardMaterial {
            base_color: Color::srgba(0.48, 0.64, 0.97, 0.04),
            alpha_mode: AlphaMode::Blend,
            cull_mode: None,
            double_sided: true,
            ..default()
        })),
        Transform::from_xyz(0.0, 0.0, 0.0),
        DespawnOnExit(Scene::BouncingBall),
    ));

    commands.spawn((
        Mesh3d(meshes.add(Sphere::new(BALL_RADIUS))),
        MeshMaterial3d(materials.add(StandardMaterial {
            base_color: Color::srgb(0.97, 0.79, 0.36),
            ..default()
        })),
        Transform::from_xyz(0.0, 0.0, 0.0),
        Velocity(Vec3::new(3.7, 2.9, 4.3)),
        DespawnOnExit(Scene::BouncingBall),
    ));
}

/// Advance the ball and, on each wall hit, send a `bevyEventsDemo.ballBounced`
/// event to React.
fn bounce(time: Res<Time>, mut balls: Query<(&mut Transform, &mut Velocity)>, events: ReactEvents) {
    let dt = time.delta_secs();
    for (mut transform, mut velocity) in &mut balls {
        if let Some(wall) = step_ball(&mut transform, &mut velocity, dt) {
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
