// Shared library for the layer filter passes (`#import bevy_react::filter`).
//
// A filter pass is a fullscreen pass between a layer's offscreen capture and
// its composite quad: bind the previous texture (the capture, or the prior
// pass's output) at group 0, draw 3 vertices with `vertex`, and write the
// filtered image with a `@fragment fn fragment` from one of the filter
// shaders (`color_matrix.wgsl`, `blur.wgsl`). The entry point must be named
// `fragment` — `filter` is a WGSL reserved word.
//
// Pass mechanics a custom filter can rely on:
// - The source texture and the pass target are the SAME size (same-size
//   ping-pong textures), so `uv` is a 1:1 source lookup and `resolution`/
//   `texel_size` describe both.
// - The target is a plain replace-write: no blending, previous contents
//   irrelevant — whatever the fragment returns (including partial alpha)
//   lands verbatim.
//
// PREMULTIPLIED-ALPHA CONTRACT (see `layer/composite.wgsl` + `layer/render.rs`):
// capture textures hold premultiplied color, and every pass must output
// premultiplied color again. Two rules follow:
//
// - COLOR ops (brightness, contrast, ... hue-rotate) are defined on straight
//   alpha: `unpremultiply` the sample, operate on rgb, `premultiply` the
//   result.
// - BLUR-like linear resampling (any weighted average of neighboring texels)
//   must operate on premultiplied color DIRECTLY — linearly filtering
//   straight-alpha color weighs the rgb of transparent texels as if they were
//   opaque and bleeds fringes at coverage edges. Premultiplied color is the
//   linear-interpolation-safe form; do NOT unpremultiply around a blur.

#define_import_path bevy_react::filter

// Group 0 is the whole binding surface of a filter pass. The filter-pass
// pipeline (`layer/render.rs`) binds: the source texture (layer capture or
// previous pass output), a linear clamp-to-edge sampler, one
// `FilterUniforms`, and the layer's original capture — always bound, so any
// pass (not just pass 0) can sample the unfiltered input alongside the
// running chain output (e.g. bloom's combine pass).
@group(0) @binding(0) var source_texture: texture_2d<f32>;
@group(0) @binding(1) var source_sampler: sampler;
@group(0) @binding(2) var<uniform> uniforms: FilterUniforms;
@group(0) @binding(3) var capture_texture: texture_2d<f32>;

// Per-pass uniforms. The explicit `pad` members make the uniform-address-
// space layout unambiguous; the Rust mirror (`FilterUniforms` in
// `layer/render.rs`, encase/`ShaderType`) must reproduce these byte offsets
// exactly. NAMING CONSTRAINT: identifiers in a composable module must
// survive naga's WGSL writeback unrenamed, and naga's namer appends `_` to
// any identifier ending in a digit — so no `pad0`/`_pad1`-style names
// anywhere in this file (naga_oil rejects them at pipeline build:
// "identifiers must not require substitution").
//
//   time:       offset   0, size 4   (f32)
//   pad_a:      offset   4, size 4   (f32; aligns `resolution` to 8)
//   resolution: offset   8, size 8   (vec2<f32>)
//   texel_size: offset  16, size 8   (vec2<f32>)
//   pad_b:      offset  24, size 8   (vec2<f32>; aligns `params` to 16)
//   params:     offset  32, size 128 (array<vec4<f32>, 8>, stride 16)
//   total size: 160 bytes
struct FilterUniforms {
    // Seconds since startup, for `USES_TIME` filters.
    time: f32,
    pad_a: f32,
    // The pass target's size in physical px.
    resolution: vec2<f32>,
    // 1.0 / resolution: one texel step in UV.
    texel_size: vec2<f32>,
    pad_b: vec2<f32>,
    // The packed filter params (`ReactFilter::pack` in `filters.rs`); `Length`
    // slots arrive rewritten to physical px.
    params: array<vec4<f32>, 8>,
}

struct FullscreenVertexOutput {
    @builtin(position) position: vec4<f32>,
    // 0..1 across the pass target, y down (uv (0,0) = target top-left).
    @location(0) uv: vec2<f32>,
}

// Single fullscreen triangle: draw 3 vertices, no vertex buffer. The triangle
// overshoots the target ((-1,1) (3,1) (-1,-3) in clip space) so its clipped
// interior covers it exactly, with uv mapping 0..1 across it.
@vertex
fn vertex(@builtin(vertex_index) vertex_index: u32) -> FullscreenVertexOutput {
    var out: FullscreenVertexOutput;
    out.uv = vec2<f32>(f32((vertex_index << 1u) & 2u), f32(vertex_index & 2u));
    out.position = vec4<f32>(out.uv * vec2<f32>(2.0, -2.0) + vec2<f32>(-1.0, 1.0), 0.0, 1.0);
    return out;
}

// Premultiplied -> straight alpha. A fully transparent texel has no color to
// recover: unpremultiply of a == 0 returns vec4(0.0) (guards the division).
fn unpremultiply(c: vec4<f32>) -> vec4<f32> {
    if c.a == 0.0 {
        return vec4<f32>(0.0);
    }
    return vec4<f32>(c.rgb / c.a, c.a);
}

// Straight -> premultiplied alpha.
fn premultiply(c: vec4<f32>) -> vec4<f32> {
    return vec4<f32>(c.rgb * c.a, c.a);
}
