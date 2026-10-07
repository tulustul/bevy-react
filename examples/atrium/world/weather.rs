//! Rain, snow, fireflies — and sky lanterns. Each kind is one mesh of quads
//! animated in `particles.wgsl` (one draw call), its amount eased from the
//! sky's moment every frame: Kyoto rains, Zermatt snows, and fireflies come
//! out over the shore when a clear evening falls. Finish the tour and React
//! sends `bevy.atrium.celebrate()`: lanterns rise off the lake.

use bevy::asset::RenderAssetUsages;
use bevy::camera::visibility::NoFrustumCulling;
use bevy::mesh::{Indices, MeshVertexBufferLayoutRef, PrimitiveTopology};
use bevy::pbr::{MaterialPipeline, MaterialPipelineKey};
use bevy::prelude::*;
use bevy::render::render_resource::{
    AsBindGroup, RenderPipelineDescriptor, SpecializedMeshPipelineError,
};
use bevy::shader::ShaderRef;
use bevy_react::{ReactAppExt, react_message};

use super::{Sky, sun_direction};

/// React → Bevy: the tour is done — light the lanterns.
#[react_message(name = "atrium.celebrate")]
pub struct Celebrate;

#[derive(Asset, AsBindGroup, TypePath, Clone)]
pub struct ParticleMaterial {
    /// (kind, amount 0..1, lanterns' launch time, 0)
    #[uniform(0)]
    params: Vec4,
}

impl Material for ParticleMaterial {
    fn vertex_shader() -> ShaderRef {
        "atrium/particles.wgsl".into()
    }

    fn fragment_shader() -> ShaderRef {
        "atrium/particles.wgsl".into()
    }

    fn alpha_mode(&self) -> AlphaMode {
        AlphaMode::Premultiplied
    }

    fn enable_prepass() -> bool {
        false
    }

    fn enable_shadows() -> bool {
        false
    }

    fn specialize(
        _: &MaterialPipeline,
        descriptor: &mut RenderPipelineDescriptor,
        layout: &MeshVertexBufferLayoutRef,
        _: MaterialPipelineKey<Self>,
    ) -> Result<(), SpecializedMeshPipelineError> {
        descriptor.vertex.buffers = vec![layout.0.get_layout(&[
            Mesh::ATTRIBUTE_POSITION.at_shader_location(0),
            Mesh::ATTRIBUTE_UV_0.at_shader_location(1),
            Mesh::ATTRIBUTE_COLOR.at_shader_location(2),
        ])?];
        descriptor.primitive.cull_mode = None;
        Ok(())
    }
}

#[derive(Component, Clone, Copy, PartialEq)]
enum Kind {
    Rain,
    Snow,
    Fireflies,
    Lanterns,
}

const KINDS: [(Kind, u32); 4] = [
    (Kind::Rain, 4500),
    (Kind::Snow, 5000),
    (Kind::Fireflies, 140),
    (Kind::Lanterns, 90),
];

/// When the lanterns were lit (seconds of app time), if they were.
#[derive(Resource, Default)]
struct Lanterns(Option<f32>);

pub fn plugin(app: &mut App) {
    app.add_plugins(MaterialPlugin::<ParticleMaterial>::default())
        .init_resource::<Lanterns>()
        .add_systems(Startup, spawn)
        .add_systems(Update, drift);
}

pub fn register_bindings(app: &mut App) {
    app.add_react_handler(on_celebrate);
}

fn on_celebrate(_: On<Celebrate>, time: Res<Time>, mut lanterns: ResMut<Lanterns>) {
    lanterns.0 = Some(time.elapsed_secs());
}

fn spawn(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<ParticleMaterial>>,
) {
    for (i, (kind, count)) in KINDS.into_iter().enumerate() {
        commands.spawn((
            kind,
            Mesh3d(meshes.add(quads(count, i as u32 + 1))),
            MeshMaterial3d(materials.add(ParticleMaterial {
                params: Vec4::new(i as f32, 0.0, 0.0, 0.0),
            })),
            // The quads are placed in the vertex shader; their mesh bounds
            // mean nothing.
            NoFrustumCulling,
            bevy::light::NotShadowCaster,
        ));
    }
}

/// `count` quads, each with its own random seed in the vertex color.
fn quads(count: u32, salt: u32) -> Mesh {
    let mut rng = 0x2545_f491_u32.wrapping_mul(salt);
    let mut seeds = Vec::with_capacity(count as usize * 4);
    let mut corners = Vec::with_capacity(count as usize * 4);
    let mut indices = Vec::with_capacity(count as usize * 6);
    for q in 0..count {
        let seed = [
            rand(&mut rng),
            rand(&mut rng),
            rand(&mut rng),
            rand(&mut rng),
        ];
        for corner in [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]] {
            seeds.push(seed);
            corners.push(corner);
        }
        let b = q * 4;
        indices.extend_from_slice(&[b, b + 2, b + 1, b, b + 3, b + 2]);
    }
    Mesh::new(
        PrimitiveTopology::TriangleList,
        RenderAssetUsages::RENDER_WORLD,
    )
    .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, vec![[0.0f32; 3]; corners.len()])
    .with_inserted_attribute(Mesh::ATTRIBUTE_UV_0, corners)
    .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, seeds)
    .with_inserted_indices(Indices::U32(indices))
}

fn rand(state: &mut u32) -> f32 {
    *state ^= *state << 13;
    *state ^= *state >> 17;
    *state ^= *state << 5;
    (*state >> 8) as f32 / (1u32 << 24) as f32
}

/// Ease each kind's amount toward what the sky calls for.
fn drift(
    time: Res<Time>,
    sky: Res<Sky>,
    lanterns: Res<Lanterns>,
    particles: Query<(&Kind, &MeshMaterial3d<ParticleMaterial>)>,
    mut materials: ResMut<Assets<ParticleMaterial>>,
) {
    let m = sky.now;
    let dusk = 1.0 - (sun_direction(m.hour).y * 12.0 + 0.4).clamp(0.0, 1.0);
    let k = 1.0 - (-2.0 * time.delta_secs()).exp();
    for (kind, handle) in &particles {
        let (want, start) = match kind {
            Kind::Rain => (m.rain, 0.0),
            Kind::Snow => (m.snow, 0.0),
            Kind::Fireflies => (
                dusk * (1.0 - m.rain) * (1.0 - m.snow) * (1.0 - m.aurora) * (1.0 - m.cover),
                0.0,
            ),
            Kind::Lanterns => match lanterns.0 {
                Some(at) => (1.0, at),
                None => (0.0, 0.0),
            },
        };
        let Some(current) = materials.get(&handle.0).map(|m| m.params) else {
            continue;
        };
        let amount = current.y + (want - current.y) * k;
        if ((amount - current.y).abs() > 1e-4 || current.z != start)
            && let Some(mut mat) = materials.get_mut(&handle.0)
        {
            mat.params.y = amount;
            mat.params.z = start;
        }
    }
}
