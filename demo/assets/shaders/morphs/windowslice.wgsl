// Morph `windowslice` (see `examples/demos/filters.rs`): vertical blinds —
// a soft left-to-right sweep sliced into `count` repeating blinds.
//
// Port of gl-transitions windowslice.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/windowslice.glsl
//   Author: gre — License: MIT
//
// Params (declaration-order packing of `Windowslice`):
//   params[0].x  count       number of blinds
//   params[0].y  smoothness  soft lead of the sweep, as a fraction of width
//
// PREMULTIPLY: both images sample at the plain uv and blend by a scalar
// factor — a direct lerp of premultiplied colors, per the prelude contract.
// Endpoint guards return the exact from/to samples (identity contract).

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

    let count = uniforms.params[0].x;
    // smoothstep requires low < high; 0 smoothness degrades to a hard edge.
    let smoothness = max(uniforms.params[0].y, 1e-4);

    let pr = smoothstep(-smoothness, 0.0, in.uv.x - progress * (1.0 + smoothness));
    let s = step(pr, fract(count * in.uv.x));
    return mix(morph_sample_from(in.uv), morph_sample_to(in.uv), s);
}
