// Pixelize morph (`builtin/pixelize.rs::PixelizeParams`): port of
// gl-transitions `pixelize.glsl` — mosaic out, mosaic in.
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/pixelize.glsl
//   Author: gre — License: MIT (forked from benraziel's gist)
//
// The cell size peaks mid-transition (`d = min(progress, 1 - progress)`),
// optionally quantized into `steps` discrete levels; both images sample the
// same snapped cell center while a plain progress crossfade blends them.
//
// Packing: params[0] = (squaresMin.x, squaresMin.y, steps, 0) — squaresMin is
// the cell count at peak mosaic, steps <= 0 disables the quantization.
//
// Premultiplied: both samples move together to one snapped uv and the blend
// is a direct lerp of premultiplied colors (the linear-interpolation-safe
// form). Endpoint guards return the exact from/to samples (the identity
// contract in `filter_prelude.wgsl`); the math also converges there (d = 0
// keeps uv unsnapped, leaving a pure mix at 0 or 1).
//
// (The entry point is `fragment`, not `filter` — `filter` is a WGSL reserved
// word.)

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to(in.uv);
    }

    let squares_min = max(uniforms.params[0].xy, vec2<f32>(1.0, 1.0));
    let steps = uniforms.params[0].z;

    let d = min(progress, 1.0 - progress);
    var dist = d;
    if steps > 0.0 {
        dist = ceil(d * steps) / steps;
    }

    // Mid-transition dist > 0 always (d > 0 and ceil rounds up), so the
    // divisions below are safe; the guard mirrors the upstream structure.
    var p = in.uv;
    if dist > 0.0 {
        let square_size = 2.0 * dist / squares_min;
        // Snapped centers on the last partial cell can land just past 1.0;
        // clamp like the upstream edge-clamped sampler (the from-helper masks
        // outside [0,1] to transparent instead).
        p = clamp((floor(in.uv / square_size) + 0.5) * square_size, vec2<f32>(0.0), vec2<f32>(1.0));
    }
    return mix(morph_sample_from(p), morph_sample_to(p), progress);
}
