// Composite quad for a captured UI layer (see `layer/render.rs`).
//
// The capture texture holds PREMULTIPLIED color: straight-alpha blending onto
// a transparent-black target accumulates `rgb * a` in the color channels. The
// group alpha therefore multiplies rgb AND a, and the pipeline blends with
// (One, OneMinusSrcAlpha) — premultiplied "over".
//
// Group 2 carries the per-quad composite params (`transform3d` support): a
// screen-space model matrix and a screen-space clip rect. Untransformed quads
// ride the same path with an identity matrix and an open clip sentinel (their
// ancestor clip was already clamped CPU-side by `clip_quad`); transformed
// quads keep full geometry and clip here instead — an axis-aligned rect can't
// clamp a rotated quad's vertices.

#import bevy_render::view::View

@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var atlas_texture: texture_2d<f32>;
@group(1) @binding(1) var atlas_sampler: sampler;

// Mirrored byte-for-byte by `render/transform3d.rs::CompositeUniforms` (80
// bytes, guarded by `composite_uniforms_match_the_documented_wgsl_layout`).
struct CompositeParams {
    model: mat4x4<f32>,
    clip_min: vec2<f32>,
    clip_max: vec2<f32>,
}

@group(2) @binding(0) var<uniform> params: CompositeParams;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) alpha: f32,
    // Homogeneous screen-space position (pre-divide) for the fragment clip
    // test: dividing the perspective-correct-interpolated pair per fragment
    // recovers the true screen position in `clip_min/max`'s space, independent
    // of the render target (screen or a nested layer's capture texture).
    @location(2) screen_pos: vec2<f32>,
    @location(3) screen_w: f32,
}

@vertex
fn vertex(
    @location(0) position: vec3<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) alpha: f32,
) -> VertexOutput {
    var out: VertexOutput;
    // Positions are physical screen px; the model matrix is the layer's 3D
    // transform in that same space (identity when untransformed). `w` is kept
    // REAL through the projection — that is what buys perspective-correct UV
    // interpolation — but `z` is flattened post-transform: the phase's view
    // (the stock UI view, or an outer layer's capture view) projects with a
    // near plane at the UI plane, and a rotated quad's depth excursions would
    // otherwise be depth-clipped. Flattening is exactly the CSS projective
    // flatten — the homography lives entirely in xy/w.
    let world = params.model * vec4(position, 1.0);
    out.position = view.clip_from_world * vec4(world.xy, 0.0, world.w);
    out.uv = uv;
    out.alpha = alpha;
    out.screen_pos = world.xy;
    out.screen_w = world.w;
    return out;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    // Ancestor clip of a transformed quad (screen-space rect vs. the true
    // screen position). Open-sentinel bounds make this a no-op for
    // CPU-clamped/unclipped quads.
    let screen = in.screen_pos / in.screen_w;
    if any(screen < params.clip_min) || any(screen > params.clip_max) {
        discard;
    }
    return textureSample(atlas_texture, atlas_sampler, in.uv) * in.alpha;
}
