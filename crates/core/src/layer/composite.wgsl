// Composite quad for a captured UI layer (see `layer/render.rs`).
//
// The capture texture holds PREMULTIPLIED color: straight-alpha blending onto
// a transparent-black target accumulates `rgb * a` in the color channels. The
// group alpha therefore multiplies rgb AND a, and the pipeline blends with
// (One, OneMinusSrcAlpha) — premultiplied "over".

#import bevy_render::view::View

@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var atlas_texture: texture_2d<f32>;
@group(1) @binding(1) var atlas_sampler: sampler;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) alpha: f32,
}

@vertex
fn vertex(
    @location(0) position: vec3<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) alpha: f32,
) -> VertexOutput {
    var out: VertexOutput;
    // Positions are physical screen px; the phase's view (the stock UI view,
    // or an outer layer's capture view) projects them.
    out.position = view.clip_from_world * vec4(position, 1.0);
    out.uv = uv;
    out.alpha = alpha;
    return out;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    return textureSample(atlas_texture, atlas_sampler, in.uv) * in.alpha;
}
