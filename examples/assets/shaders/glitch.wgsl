// Custom filter `glitch` (see `examples/demos/filters.rs`): broken-signal
// horizontal slice offsets + RGB channel split, re-seeded a few times per
// second from `uniforms.time`. Fully procedural (a sine-fract hash of slice
// row x time step) — no noise textures. `time = true`, so it animates with
// zero re-captures.
//
// Params (declaration-order packing of `Glitch`):
//   params[0].x  intensity  0 (clean) ..= 1 (heavily corrupted)
//
// PREMULTIPLY: like every UV-distortion filter this resamples the source at
// shifted positions, so it samples the premultiplied capture DIRECTLY (see
// `filter_prelude.wgsl` — premultiplied color is the linear-resampling-safe
// form). The channel split recombines r/g/b from three premultiplied samples;
// taking alpha as the max of the three keeps the result valid premultiplied
// color: each channel satisfies c <= its own sample's alpha <= the max.

#import bevy_react::filter::{FullscreenVertexOutput, source_sampler, source_texture, uniforms}

// Cheap stateless hash: seed -> [0, 1).
fn hash(seed: f32) -> f32 {
    return fract(sin(seed * 127.1) * 43758.5453);
}

// How often the corruption pattern re-rolls, in Hz.
const RESEED_HZ: f32 = 12.0;
// How many horizontal slices the image is cut into.
const SLICES: f32 = 24.0;
// At full intensity, at most this fraction of slices glitches at once.
const MAX_GATED: f32 = 0.4;
// A fully glitched slice shifts up to this fraction of the width.
const MAX_SHIFT: f32 = 0.08;
// RGB split in texels: a base split everywhere, widened this much on
// glitched slices.
const SPLIT_TEXELS: f32 = 2.0;
const SPLIT_GATED_BOOST: f32 = 5.0;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let intensity = uniforms.params[0].x;

    // Quantize time so each corruption pattern holds for a moment.
    let seed = floor(uniforms.time * RESEED_HZ) * 57.0;
    let slice = floor(in.uv.y * SLICES);

    // Per-slice, per-seed: does this slice glitch, and by how much? More
    // intensity gates more slices in and shifts them further.
    let gate = step(1.0 - MAX_GATED * intensity, hash(slice * 7.31 + seed));
    let shift = (hash(slice + seed) * 2.0 - 1.0) * gate * intensity * MAX_SHIFT;
    let uv = vec2<f32>(in.uv.x + shift, in.uv.y);

    let split = vec2<f32>(
        (1.0 + SPLIT_GATED_BOOST * gate) * intensity * SPLIT_TEXELS * uniforms.texel_size.x,
        0.0,
    );
    let r = textureSample(source_texture, source_sampler, uv + split);
    let g = textureSample(source_texture, source_sampler, uv);
    let b = textureSample(source_texture, source_sampler, uv - split);

    return vec4<f32>(r.r, g.g, b.b, max(r.a, max(g.a, b.a)));
}
