//! The window material: `pane.wgsl` over the React `<surface>` texture.
//! It reads the view's transmission texture (the world behind the window),
//! which puts it in Bevy's transmissive pass — after every opaque thing is
//! drawn, so the glass has the whole world to frost.

use bevy::mesh::MeshVertexBufferLayoutRef;
use bevy::pbr::{MaterialPipeline, MaterialPipelineKey};
use bevy::prelude::*;
use bevy::render::render_resource::{
    AsBindGroup, RenderPipelineDescriptor, SpecializedMeshPipelineError,
};
use bevy::shader::ShaderRef;

#[derive(Asset, AsBindGroup, TypePath, Clone)]
pub struct PaneMaterial {
    /// (quad width m, quad height m, glass height m, corner radius m)
    #[uniform(0)]
    pub shape: Vec4,
    /// (presence 0..1, hover 0..1, frost px, seed)
    #[uniform(1)]
    pub look: Vec4,
    #[texture(2)]
    #[sampler(3)]
    pub ui: Handle<Image>,
}

impl Material for PaneMaterial {
    fn fragment_shader() -> ShaderRef {
        "atrium/pane.wgsl".into()
    }

    fn reads_view_transmission_texture(&self) -> bool {
        true
    }

    fn enable_prepass() -> bool {
        false
    }

    fn enable_shadows() -> bool {
        false
    }

    // A window seen from behind is still glass (the shader drops the UI).
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
