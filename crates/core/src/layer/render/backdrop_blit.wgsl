// Backdrop snapshot blit: crop-sample the camera's post-processed main
// texture (the 3D frame — no UI yet at this point in the schedule) into a
// layer's backdrop snapshot texture.
//
// The fragment returns alpha 1.0 EXPLICITLY: the main texture's alpha after
// tonemapping is unspecified, and the snapshot doubles as the premultiplied
// source of the backdrop filter chain — opaque color is the one value that
// is premultiplied and straight at once, which is what lets every existing
// filter shader run on a backdrop unchanged.
//
// The sampler is ClampToEdge, so an outset-inflated or partially-offscreen
// snapshot rect clamps to the frame's border pixels (same artifact browsers
// show for backdrop-filter at the viewport edge).

@group(0) @binding(0) var src_texture: texture_2d<f32>;
@group(0) @binding(1) var src_sampler: sampler;

struct BlitUniforms {
    // The snapshot rect mapped into the main texture's UV space.
    src_uv_min: vec2<f32>,
    src_uv_scale: vec2<f32>,
}
@group(0) @binding(2) var<uniform> uniforms: BlitUniforms;

struct FullscreenVertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

// Single fullscreen triangle over the snapshot target (same construction as
// the filter prelude's vertex stage).
@vertex
fn vertex(@builtin(vertex_index) vertex_index: u32) -> FullscreenVertexOutput {
    var out: FullscreenVertexOutput;
    out.uv = vec2<f32>(f32((vertex_index << 1u) & 2u), f32(vertex_index & 2u));
    out.position = vec4<f32>(out.uv * vec2<f32>(2.0, -2.0) + vec2<f32>(-1.0, 1.0), 0.0, 1.0);
    return out;
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let src = uniforms.src_uv_min + in.uv * uniforms.src_uv_scale;
    return vec4<f32>(textureSample(src_texture, src_sampler, src).rgb, 1.0);
}
