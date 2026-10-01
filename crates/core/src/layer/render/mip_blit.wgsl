// Downsample blit for layer-capture mip chains (see `layer/render/mips.rs`).
//
// Each pass samples one mip level and writes the next: the target is half the
// source's size, so a single centered linear tap is a standard 2×2 box
// filter. Content is premultiplied throughout — averaging premultiplied
// texels is the correct downsample (no unpremultiply round-trip, same rule as
// blur-like resampling in the filter prelude). No uniforms: this pipeline
// deliberately does NOT reuse the filter bind-group contract (which mandates
// a 160-byte `FilterUniforms` at binding 2).

// The vertex stage is bevy's fullscreen triangle (`FullscreenShader`).
#import bevy_core_pipeline::fullscreen_vertex_shader::FullscreenVertexOutput

@group(0) @binding(0) var source_texture: texture_2d<f32>;
@group(0) @binding(1) var source_sampler: sampler;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    return textureSample(source_texture, source_sampler, in.uv);
}
