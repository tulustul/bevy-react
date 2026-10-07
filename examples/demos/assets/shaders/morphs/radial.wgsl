// Morph `radial` (see `examples/demos/filters.rs`): a radial sweep wipe —
// the angle threshold sweeps a full turn around the center; the hard seam at
// the left (the atan2 ±π discontinuity) is where the sweep starts and ends,
// exactly like the upstream.
//
// Port of gl-transitions Radial.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/Radial.glsl
//   Author: Xaychru (ported by gre) — License: MIT
//
// Params (declaration-order packing of `Radial`):
//   params[0].x  smoothness  angular width of the soft edge, in RADIANS
//                            (an `Angle` param: wire degrees, packed radians)
//
// PREMULTIPLY: same-uv samples, scalar lerp — premultiplied-direct blend.
// The upstream leaks ~13% of the "to" image near the seam at progress 0; the
// endpoint guards make the freeze/settle frames exact (identity contract).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

const PI: f32 = 3.141592653589793;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to(in.uv);
    }

    // smoothstep requires low < high; 0 degrades to a hard sweep edge.
    let smoothness = max(uniforms.params[0].x, 1e-4);

    let rp = in.uv * 2.0 - 1.0;
    // Factor 1 selects the FROM image (upstream argument order).
    let keep_from = smoothstep(0.0, smoothness, atan2(rp.y, rp.x) - (progress - 0.5) * PI * 2.5);
    return mix(morph_sample_to(in.uv), morph_sample_from(in.uv), keep_from);
}
