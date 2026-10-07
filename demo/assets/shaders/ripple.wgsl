// Custom filter `ripple` (see `examples/demos/filters.rs`): a radial wave
// emanating from the layer's center, animated by `uniforms.time` — a
// `time = true` filter, so the pass re-runs every frame without re-capturing
// the layer.
//
// Params (declaration-order packing of `Ripple`):
//   params[0].x  amplitude  peak displacement, px
//   params[0].y  frequency  wave phase across the half-diagonal, radians
//   params[0].z  speed      wave cycles per second
//
// PREMULTIPLY: a UV-distortion filter only *resamples* the source at shifted
// positions. Linear filtering of straight-alpha color would bleed the hidden
// rgb of transparent texels at coverage edges, so per the contract in
// `filter_prelude.wgsl` we sample the premultiplied capture DIRECTLY and
// output the sample as-is — no unpremultiply/premultiply round trip.

#import bevy_react::filter::{FullscreenVertexOutput, source_sampler, source_texture, uniforms}

const TAU: f32 = 6.28318530718;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let amplitude = uniforms.params[0].x;
    let frequency = uniforms.params[0].y;
    let speed = uniforms.params[0].z;

    // Work in physical px so the wave is round regardless of aspect ratio.
    let from_center = (in.uv - vec2<f32>(0.5)) * uniforms.resolution;
    let dist = length(from_center);
    // Normalize phase to the half-diagonal so `frequency` means the same thing
    // at any layer size.
    let half_diagonal = 0.5 * length(uniforms.resolution);
    let phase = dist / half_diagonal * frequency - uniforms.time * speed * TAU;

    // Displace radially by up to `amplitude` px (guard the center where the
    // radial direction is undefined), then convert px -> uv via texel_size.
    let dir = from_center / max(dist, 1e-3);
    let offset_px = dir * sin(phase) * amplitude;
    let uv = in.uv + offset_px * uniforms.texel_size;

    return textureSample(source_texture, source_sampler, uv);
}
