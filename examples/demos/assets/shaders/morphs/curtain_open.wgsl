// Morph `curtainOpen` (see `examples/demos/filters.rs`): a soft-edged band
// opens from the centerline outward revealing the new image — or, with
// `close`, the new image closes in toward the centerline. `vertical` flips
// the split axis.
//
// Merged port of gl-transitions HorizontalOpen.glsl / HorizontalClose.glsl /
// VerticalOpen.glsl (the fourth combination, vertical close, follows the
// same algebra):
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/HorizontalOpen.glsl
//   Author: martiniti — License: MIT
//
// The three upstream shaders are one formula: with `q` the opening amount
// (`q = progress` opening, `q = 1 - progress` closing),
//   s = 2*q - |axis - 0.5| / q
// and the blend is `smoothstep(0, 0.5, s)` toward "to" when opening, mirrored
// (`1 - smoothstep`) when closing. The upstream reversed-edge
// `smoothstep(0.5, 0.0, s)` is rewritten as the mirror — WGSL requires
// low < high.
//
// Params (declaration-order packing of `CurtainOpen`):
//   params[0].x  vertical  0 = horizontal split (band grows along y), 1 = vertical
//   params[0].y  close     0 = open (reveal outward), 1 = close (cover inward)
//
// PREMULTIPLY: same-uv samples, scalar lerp — premultiplied-direct blend.
// The upstream divides by zero at its endpoint frames; the endpoint guards
// own those frames (identity contract), and the mid-flight denominator is
// clamped away from 0.

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

    let vertical = uniforms.params[0].x > 0.5;
    let close = uniforms.params[0].y > 0.5;

    let axis = select(in.uv.y, in.uv.x, vertical);
    let q = select(progress, 1.0 - progress, close);
    let s = 2.0 * q - abs(axis - 0.5) / max(q, 1e-6);
    let open_blend = smoothstep(0.0, 0.5, s);
    let to_side = select(open_blend, 1.0 - open_blend, close);

    return mix(morph_sample_from(in.uv), morph_sample_to(in.uv), to_side);
}
