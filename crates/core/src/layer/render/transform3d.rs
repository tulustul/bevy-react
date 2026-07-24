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
use bevy::math::{Mat4, Vec2, Vec4};
use bevy::prelude::*;
use bevy::render::render_phase::{
    PhaseItem, RenderCommand, RenderCommandResult, TrackedRenderPass,
};
use bevy::render::render_resource::{BindGroup, DynamicUniformBuffer, ShaderType};

/// Per-quad composite params. Field order matches `CompositeParams` in
/// `composite.wgsl` byte for byte (128 bytes; guarded by
/// `composite_uniforms_match_the_documented_wgsl_layout`). Pad names are
/// digit-free on purpose (the naga-namer constraint, see `FilterUniforms`).
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
    /// Edge-feather width in screen px for the analytic edge AA of transformed
    /// quads (their diagonal silhouettes rasterize without MSAA). `0.0`
    /// disables the coverage term entirely — the untransformed path, which
    /// must stay pixel-identical (its CPU-clamped UVs sit inside `[0,1]` at
    /// clipped edges, where uv-distance feathering would be wrong).
    pub edge_feather: f32,
    pub pad_a: f32,
    pub pad_b: Vec2,
    /// Rounded-corner mask radii, `[top_left, top_right, bottom_right,
    /// bottom_left]` physical px — the node's layout-resolved
    /// `ComputedNode.border_radius` (already clamped per corner to
    /// `0.5 * min(w, h)`; Bevy's rule, not the CSS proportional-shrink one —
    /// matching what bevy_ui *paints* is the point: the frost edge must
    /// coincide with the node's own rounded background). All-zero disables
    /// the mask term entirely (the `edge_feather` pattern) — today only
    /// backdrop quads set it.
    pub radius: Vec4,
    /// The UNCLIPPED border box the radii round, screen-space physical px.
    /// Carried separately because the CPU clip clamps the quad's *geometry*
    /// — the SDF must still measure against the true box.
    pub box_center: Vec2,
    pub box_size: Vec2,
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
    use bevy::render::render_resource::encase::UniformBuffer;

    fn f32_at(bytes: &[u8], offset: usize) -> f32 {
        f32::from_le_bytes(bytes[offset..offset + 4].try_into().unwrap())
    }

    /// The WGSL `CompositeParams` struct in `composite.wgsl` documents a
    /// 128-byte uniform layout (mat4x4 + clip vec2s + feather + pads +
    /// corner radii + border box); the Rust mirror must match field for
    /// field.
    #[test]
    fn composite_uniforms_match_the_documented_wgsl_layout() {
        assert_eq!(CompositeUniforms::min_size().get(), 128);

        let value = CompositeUniforms {
            model: Mat4::from_translation(bevy::math::Vec3::new(9.0, 0.0, 0.0)),
            clip_min: Vec2::new(1.0, 2.0),
            clip_max: Vec2::new(3.0, 4.0),
            edge_feather: 1.5,
            pad_a: 0.0,
            pad_b: Vec2::ZERO,
            radius: Vec4::new(5.0, 6.0, 7.0, 8.0),
            box_center: Vec2::new(10.0, 11.0),
            box_size: Vec2::new(12.0, 13.0),
        };
        let mut buffer = UniformBuffer::new(Vec::<u8>::new());
        buffer.write(&value).expect("uniform write");
        let bytes = buffer.into_inner();
        assert_eq!(bytes.len(), 128);
        // Per-field offsets, per the WGSL struct's comment block.
        assert_eq!(f32_at(&bytes, 48), 9.0); // model.w_axis.x (col 3 @ 48)
        assert_eq!(f32_at(&bytes, 64), 1.0); // clip_min.x
        assert_eq!(f32_at(&bytes, 68), 2.0); // clip_min.y
        assert_eq!(f32_at(&bytes, 72), 3.0); // clip_max.x
        assert_eq!(f32_at(&bytes, 76), 4.0); // clip_max.y
        assert_eq!(f32_at(&bytes, 80), 1.5); // edge_feather
        assert_eq!(f32_at(&bytes, 96), 5.0); // radius.x (top_left)
        assert_eq!(f32_at(&bytes, 100), 6.0); // radius.y (top_right)
        assert_eq!(f32_at(&bytes, 104), 7.0); // radius.z (bottom_right)
        assert_eq!(f32_at(&bytes, 108), 8.0); // radius.w (bottom_left)
        assert_eq!(f32_at(&bytes, 112), 10.0); // box_center.x
        assert_eq!(f32_at(&bytes, 116), 11.0); // box_center.y
        assert_eq!(f32_at(&bytes, 120), 12.0); // box_size.x
        assert_eq!(f32_at(&bytes, 124), 13.0); // box_size.y
    }
}
