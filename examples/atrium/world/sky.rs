//! The sky dome: a sphere around the eye, painted by `sky.wgsl` from the
//! palette. It rides along with the eye so it is always infinitely far.

use bevy::mesh::MeshVertexBufferLayoutRef;
use bevy::pbr::{MaterialPipeline, MaterialPipelineKey};
use bevy::prelude::*;
use bevy::render::render_resource::{
    AsBindGroup, RenderPipelineDescriptor, SpecializedMeshPipelineError,
};
use bevy::shader::ShaderRef;

use super::Atmos;
use crate::look::Eye;

/// Inside the far plane, outside the farthest mountain.
const RADIUS: f32 = 4_000.0;

#[derive(Asset, AsBindGroup, TypePath, Clone)]
pub struct SkyMaterial {
    #[uniform(0)]
    pub atmos: Atmos,
}

impl Material for SkyMaterial {
    fn fragment_shader() -> ShaderRef {
        "atrium/sky.wgsl".into()
    }

    fn enable_prepass() -> bool {
        false
    }

    fn enable_shadows() -> bool {
        false
    }

    // Seen from inside: draw the back faces.
    fn specialize(
        _: &MaterialPipeline,
        descriptor: &mut RenderPipelineDescriptor,
        _: &MeshVertexBufferLayoutRef,
        _: MaterialPipelineKey<Self>,
    ) -> Result<(), SpecializedMeshPipelineError> {
        descriptor.primitive.cull_mode = None;
        Ok(())
    }
}

#[derive(Component)]
pub struct Dome;

pub fn spawn(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<SkyMaterial>>,
) {
    commands.spawn((
        Dome,
        Mesh3d(meshes.add(Sphere::new(RADIUS).mesh().uv(64, 32))),
        MeshMaterial3d(materials.add(SkyMaterial {
            atmos: Atmos::default(),
        })),
        Transform::default(),
        bevy::light::NotShadowCaster,
    ));
}

pub fn follow_eye(
    eye: Single<&GlobalTransform, With<Eye>>,
    mut dome: Single<&mut Transform, With<Dome>>,
) {
    dome.translation = eye.translation();
}
