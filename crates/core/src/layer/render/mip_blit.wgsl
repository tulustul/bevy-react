// Downsample blit for layer-capture mip chains (see `layer/render/mips.rs`).
//
// Each pass samples one mip level and writes the next: the target is half the
// source's size, so a single centered linear tap is a standard 2×2 box
// filter. Content is premultiplied throughout — averaging premultiplied
// texels is the correct downsample (no unpremultiply round-trip, same rule as
// blur-like resampling in the filter prelude). No uniforms: this pipeline
// deliberately does NOT reuse the filter bind-group contract (which mandates
// a 160-byte `FilterUniforms` at binding 2).

@group(0) @binding(0) var source_texture: texture_2d<f32>;
@group(0) @binding(1) var source_sampler: sampler;

struct FullscreenVertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

// Fullscreen triangle from `vertex_index` alone (the filter prelude's
// pattern): uv (0,0) at the target's top-left.
@vertex
fn vertex(@builtin(vertex_index) index: u32) -> FullscreenVertexOutput {
    var out: FullscreenVertexOutput;
    let uv = vec2<f32>(f32((index << 1u) & 2u), f32(index & 2u));
    out.position = vec4(uv * vec2(2.0, -2.0) + vec2(-1.0, 1.0), 0.0, 1.0);
    out.uv = uv;
    return out;
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    return textureSample(source_texture, source_sampler, in.uv);
}
