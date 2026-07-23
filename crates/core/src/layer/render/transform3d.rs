//! Render-world plumbing for the composite quad's per-layer uniforms: the 3D
//! model matrix and the screen-space clip rect (`transform3d` support).
//!
//! Every drawn composite quad gets one [`CompositeUniforms`] entry — identity
//! matrix + open clip for untransformed layers — so `composite.wgsl` stays
//! single-path. The lifecycle mirrors [`FilterUniforms`](super::FilterUniforms):
//! a [`DynamicUniformBuffer`] staged in `prepare_layer_composites`, the
//! per-quad offset riding [`LayerCompositeBatch`](super::LayerCompositeBatch),
//! and one whole-buffer bind group bound at a dynamic offset by
//! [`SetCompositeUniforms`].

use bevy::ecs::system::SystemParamItem;
use bevy::ecs::system::lifetimeless::SRes;
use bevy::math::{Mat4, Vec2};
use bevy::prelude::*;
use bevy::render::render_phase::{
    PhaseItem, RenderCommand, RenderCommandResult, TrackedRenderPass,
};
use bevy::render::render_resource::{BindGroup, DynamicUniformBuffer, ShaderType};

/// Per-quad composite params. Field order matches `CompositeParams` in
/// `composite.wgsl` byte for byte (80 bytes; guarded by
/// `composite_uniforms_match_the_documented_wgsl_layout`).
#[derive(Clone, Copy, ShaderType)]
pub struct CompositeUniforms {
    /// Screen-space model matrix (physical px, homogeneous — the vertex stage
    /// keeps the real `w` for perspective-correct interpolation and flattens
    /// `z` post-transform). Identity for untransformed layers.
    pub model: Mat4,
    /// Screen-space ancestor-clip rect the fragment stage tests transformed
    /// quads against ([`open_clip`] sentinel = unclipped / already CPU-clamped).
    pub clip_min: Vec2,
    pub clip_max: Vec2,
}

/// The clip sentinel: an interval no on-screen fragment escapes, making the
/// fragment test a no-op for quads clipped on the CPU (or not clipped at all).
pub fn open_clip() -> (Vec2, Vec2) {
    (Vec2::splat(-f32::MAX), Vec2::splat(f32::MAX))
}

/// Frame-staged composite uniforms + their whole-buffer bind group (rebuilt
/// every frame after `write_buffer` — the buffer may reallocate).
#[derive(Resource)]
pub struct CompositeUniformsMeta {
    pub uniforms: DynamicUniformBuffer<CompositeUniforms>,
    pub bind_group: Option<BindGroup>,
}

impl Default for CompositeUniformsMeta {
    fn default() -> Self {
        let mut uniforms = DynamicUniformBuffer::default();
        uniforms.set_label(Some("ui_layer_composite_uniforms"));
        Self {
            uniforms,
            bind_group: None,
        }
    }
}

/// Binds the composite-uniform bind group at the quad's dynamic offset
/// (staged by `prepare_layer_composites` on [`LayerCompositeBatch`]).
pub struct SetCompositeUniforms<const I: usize>;
impl<P: PhaseItem, const I: usize> RenderCommand<P> for SetCompositeUniforms<I> {
    type Param = SRes<CompositeUniformsMeta>;
    type ViewQuery = ();
    type ItemQuery = bevy::ecs::system::lifetimeless::Read<super::LayerCompositeBatch>;

    #[inline]
    fn render<'w>(
        _item: &P,
        _view: (),
        batch: Option<&'w super::LayerCompositeBatch>,
        meta: SystemParamItem<'w, '_, Self::Param>,
        pass: &mut TrackedRenderPass<'w>,
    ) -> RenderCommandResult {
        let Some(batch) = batch else {
            return RenderCommandResult::Skip;
        };
        let Some(bind_group) = &meta.into_inner().bind_group else {
            return RenderCommandResult::Failure("composite uniforms bind group missing");
        };
        pass.set_bind_group(I, bind_group, &[batch.uniform_offset]);
        RenderCommandResult::Success
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The WGSL `CompositeParams` struct in `composite.wgsl` documents an
    /// 80-byte uniform layout (mat4x4 + 2×vec2); the Rust mirror must match.
    #[test]
    fn composite_uniforms_match_the_documented_wgsl_layout() {
        assert_eq!(CompositeUniforms::min_size().get(), 80);
    }
}
