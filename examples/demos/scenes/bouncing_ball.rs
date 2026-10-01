use bevy::mesh::MeshVertexBufferLayoutRef;
use bevy::pbr::{MaterialPipeline, MaterialPipelineKey};
use bevy::prelude::*;
use bevy::render::render_resource::{
    AsBindGroup, RenderPipelineDescriptor, SpecializedMeshPipelineError,
};
use bevy::shader::ShaderRef;
use bevy_react::{ReactAppExt, ReactEvents, Request, react_event, react_request};
use serde::Serialize;
use ts_rs::TS;

use crate::scene::Scene;

pub struct BouncingBallScenePlugin;

impl Plugin for BouncingBallScenePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        // `init_resource` runs now, so it needs `Assets<Mesh>` to exist —
        // `main.rs` adds `DefaultPlugins` before the scene plugins.
        app.add_plugins(MaterialPlugin::<RippleMaterial>::default())
            .init_resource::<RippleQuad>()
            .add_systems(OnEnter(Scene::BouncingBall), spawn_ball)
            .add_systems(
                Update,
                (bounce, advance_ripples).run_if(in_state(Scene::BouncingBall)),
            );
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
/// The ball's warm yellow. Shared with the bounce ripple so the two can't drift.
const BALL_COLOR: Srgba = Srgba::rgb(0.97, 0.79, 0.36);

/// How long a bounce ripple lives, in seconds.
const RIPPLE_LIFETIME: f32 = 0.9;
/// The radius a ripple reaches at the end of its life, in world units. A bounce
/// near a wall's edge gets less (see [`wall_room`]).
const RIPPLE_MAX_RADIUS: f32 = 1.1;
/// Peak emissive strength of a ripple, before the shader's rise/decay curve
/// (which never reaches 1, so the ring lands well under this). Low enough that
/// it stays a translucent wash of light over the glass rather than a solid band;
/// raise it to push the ring into the camera's `Bloom::NATURAL`.
const RIPPLE_STRENGTH: f32 = 1.6;
/// How far inside the wall a ripple sits, so its quad never coincides with the
/// glass face.
const RIPPLE_LIFT: f32 = 0.02;

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

impl Wall {
    /// The wall's inward normal — the direction its bounce ripple faces (into
    /// the play area).
    fn inward_normal(self) -> Vec3 {
        match self {
            Wall::Left => Vec3::X,
            Wall::Right => Vec3::NEG_X,
            Wall::Bottom => Vec3::Y,
            Wall::Top => Vec3::NEG_Y,
            Wall::Back => Vec3::Z,
            Wall::Front => Vec3::NEG_Z,
        }
    }
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

// --- Bounce ripples ---

/// The quad every ripple is drawn on, built once and shared. It is 2×2, so its
/// inscribed circle has radius 1 and a ripple's `Transform::scale` *is* its
/// radius in world units.
#[derive(Resource)]
struct RippleQuad(Handle<Mesh>);

impl FromWorld for RippleQuad {
    fn from_world(world: &mut World) -> Self {
        let mut meshes = world.resource_mut::<Assets<Mesh>>();
        Self(meshes.add(Rectangle::from_length(2.0)))
    }
}

/// Draws one expanding ring (`examples/assets/shaders/bounce_ripple.wgsl`). Both
/// fields share binding 0, so `AsBindGroup` combines them into the single
/// uniform struct the shader declares.
#[derive(Asset, AsBindGroup, Reflect, Clone, Default)]
struct RippleMaterial {
    #[uniform(0)]
    color: LinearRgba,
    /// x = progress 0..1, y = peak emissive strength, z/w unused.
    #[uniform(0)]
    params: Vec4,
}

impl Material for RippleMaterial {
    fn fragment_shader() -> ShaderRef {
        "shaders/bounce_ripple.wgsl".into()
    }

    /// Additive: the ring only ever adds light, so overlapping ripples and the
    /// translucent glass box never need sorting to look right. Bevy maps this to
    /// premultiplied blending — see the shader's note on returning alpha 0.
    fn alpha_mode(&self) -> AlphaMode {
        AlphaMode::Add
    }

    /// Transparent materials are skipped by the prepass but *not* by the shadow
    /// pass, and the default prepass shader has no idea the quad is mostly
    /// empty — without this the ring casts a hard square shadow.
    fn enable_shadows() -> bool {
        false
    }

    fn specialize(
        _pipeline: &MaterialPipeline,
        descriptor: &mut RenderPipelineDescriptor,
        _layout: &MeshVertexBufferLayoutRef,
        _key: MaterialPipelineKey<Self>,
    ) -> Result<(), SpecializedMeshPipelineError> {
        // The camera orbits *outside* the box, so a ripple lying on the near
        // wall faces away from it. Draw both sides.
        descriptor.primitive.cull_mode = None;
        Ok(())
    }
}

/// A live ripple, ticked by [`advance_ripples`] until it has aged out.
#[derive(Component)]
struct Ripple {
    age: f32,
    /// The radius this ripple reaches at the end of its life, in world units.
    max_radius: f32,
}

/// How far a ripple centered at `contact` can spread before it would hang off the
/// edge of the wall whose inward normal is `normal`.
fn wall_room(contact: Vec3, normal: Vec3) -> f32 {
    // Only the two in-plane axes bound the ripple — the impacted axis *is* the
    // wall. `normal.abs()` is a unit axis, so padding it by the full play area
    // keeps that axis out of the minimum.
    let room = Vec3::splat(PLAY_HALF) - contact.abs() + normal.abs() * 2.0 * PLAY_HALF;
    room.min_element()
}

/// Spawn a ripple on the wall the ball just hit, lying flat on that face.
fn spawn_ripple(
    commands: &mut Commands,
    quad: &RippleQuad,
    materials: &mut Assets<RippleMaterial>,
    ball: Vec3,
    wall: Wall,
) {
    let normal = wall.inward_normal();
    // The ball is clamped to `PLAY_HALF - BALL_RADIUS`, so stepping one radius
    // against the inward normal lands exactly on the wall; lift it back a hair
    // so the ring never coincides with the glass face.
    let contact = ball - normal * (BALL_RADIUS - RIPPLE_LIFT);

    commands.spawn((
        Mesh3d(quad.0.clone()),
        MeshMaterial3d(materials.add(RippleMaterial {
            color: BALL_COLOR.into(),
            params: Vec4::new(0.0, RIPPLE_STRENGTH, 0.0, 0.0),
        })),
        Transform {
            translation: contact,
            // The quad's own facing is +Z; the ring is radially symmetric, so
            // any roll about the normal is fine.
            rotation: Quat::from_rotation_arc(Vec3::Z, normal),
            scale: Vec3::ZERO,
        },
        Ripple {
            age: 0.0,
            // A bounce close to an edge gets a smaller ripple rather than one
            // that grows out through the side of the box.
            max_radius: RIPPLE_MAX_RADIUS.min(wall_room(contact, normal)),
        },
        DespawnOnExit(Scene::BouncingBall),
    ));
}

/// Grow each live ripple and hand its progress to the shader, despawning it once
/// it has aged out. Each ripple owns its material, so they animate independently.
fn advance_ripples(
    time: Res<Time>,
    mut commands: Commands,
    mut ripples: Query<(
        Entity,
        &mut Ripple,
        &mut Transform,
        &MeshMaterial3d<RippleMaterial>,
    )>,
    mut materials: ResMut<Assets<RippleMaterial>>,
) {
    let dt = time.delta_secs();
    for (entity, mut ripple, mut transform, handle) in &mut ripples {
        ripple.age += dt;
        let t = ripple.age / RIPPLE_LIFETIME;
        if t >= 1.0 {
            // Dropping the entity drops its material handle, freeing the asset.
            commands.entity(entity).despawn();
            continue;
        }

        // Cubic ease-out: quick off the wall, then drifting as it fades.
        let eased = 1.0 - (1.0 - t).powi(3);
        transform.scale = Vec3::splat(ripple.max_radius * eased);
        if let Some(mut material) = materials.get_mut(&handle.0) {
            material.params.x = t;
        }
    }
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
            base_color: Color::srgba(0.48, 0.64, 0.97, 0.4),
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
            base_color: BALL_COLOR.into(),
            // Self-lit so the ball reads as the scene's light source and stays
            // vivid seen through the tinted glass walls.
            emissive: BALL_COLOR.into(),
            ..default()
        })),
        Transform::from_xyz(0.0, 0.0, 0.0),
        Velocity(Vec3::new(3.7, 2.9, 4.3)),
        DespawnOnExit(Scene::BouncingBall),
    ));
}

/// Advance the ball and, on each wall hit, send a `bevyEventsDemo.ballBounced`
/// event to React and paint a ripple on the wall it hit.
fn bounce(
    time: Res<Time>,
    mut commands: Commands,
    mut balls: Query<(&mut Transform, &mut Velocity)>,
    events: ReactEvents,
    quad: Res<RippleQuad>,
    mut ripple_materials: ResMut<Assets<RippleMaterial>>,
) {
    let dt = time.delta_secs();
    for (mut transform, mut velocity) in &mut balls {
        if let Some(wall) = step_ball(&mut transform, &mut velocity, dt) {
            events.send(&BallBounced {
                wall,
                speed: velocity.0.length(),
            });
            spawn_ripple(
                &mut commands,
                &quad,
                &mut ripple_materials,
                transform.translation,
                wall,
            );
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
