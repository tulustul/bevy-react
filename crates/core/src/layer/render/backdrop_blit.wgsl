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

// The vertex stage is bevy's fullscreen triangle (`FullscreenShader`).
#import bevy_core_pipeline::fullscreen_vertex_shader::FullscreenVertexOutput

@group(0) @binding(0) var src_texture: texture_2d<f32>;
@group(0) @binding(1) var src_sampler: sampler;

struct BlitUniforms {
    // The snapshot rect mapped into the main texture's UV space.
    src_uv_min: vec2<f32>,
    src_uv_scale: vec2<f32>,
}
@group(0) @binding(2) var<uniform> uniforms: BlitUniforms;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let src = uniforms.src_uv_min + in.uv * uniforms.src_uv_scale;
    return vec4<f32>(textureSample(src_texture, src_sampler, src).rgb, 1.0);
}
